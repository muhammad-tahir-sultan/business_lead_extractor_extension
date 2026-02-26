// WhatsApp Blast Logic
let waTabId = null;

async function handleWhatsAppMessage(phone, text, fileBase64, mimeType, filename, skipExisting) {
    // Encode only phone in URL â€” we will type the text manually inside the injected script
    // (encoding text in URL is unreliable: WA sometimes loses it on internal re-navigation)
    const waUrl = `https://web.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}`;

    // Reuse or create the WhatsApp Web tab
    if (waTabId) {
        try {
            await chrome.tabs.update(waTabId, { url: waUrl, active: true });
        } catch (e) {
            const newTab = await chrome.tabs.create({ url: waUrl, active: true });
            waTabId = newTab.id;
        }
    } else {
        const newTab = await chrome.tabs.create({ url: waUrl, active: true });
        waTabId = newTab.id;
    }

    // Wait for BOTH navigation phases:
    // Phase 1: Initial shell load (status=complete)
    // Phase 2: WA internal SPA navigation to the chat (another complete)
    await waitForTabLoadTwice(waTabId, 45000);

    // Extra buffer for React hydration & chat box to fully initialize
    await new Promise(r => setTimeout(r, 5000));

    // Inject automation â€” pass message text so it can re-type if needed
    let results;
    try {
        results = await chrome.scripting.executeScript({
            target: { tabId: waTabId },
            func: waAutomationRunner,
            args: [{
                hasFile: !!fileBase64,
                file: fileBase64,
                mime: mimeType,
                filename: filename,
                messageText: text,         // <-- pass text for fallback typing
                skipExisting: skipExisting // <-- pass flag to skip if chat history exists
            }]
        });
    } catch (err) {
        return { success: false, error: err.toString() };
    }

    const result = results && results[0] && results[0].result;
    if (result && result.success === false) {
        return { success: false, error: result.error };
    }
    return { success: true };
}

// Waits for tab to fire TWO 'complete' events, or one if no second comes within 8s
// This handles WhatsApp Web's two-phase SPA navigation
function waitForTabLoadTwice(tabId, timeoutMs) {
    return new Promise((resolve, reject) => {
        let completedCount = 0;
        let resolved = false;
        let secondPhaseTimer = null;

        const overallTimeout = setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(listener);
            if (!resolved) { resolved = true; resolve(); } // resolve anyway after timeout
        }, timeoutMs);

        const listener = (id, changeInfo) => {
            if (id !== tabId || changeInfo.status !== 'complete') return;
            completedCount++;

            if (completedCount === 1) {
                // First complete: start a timer â€” if no second complete in 8s, proceed anyway
                secondPhaseTimer = setTimeout(() => {
                    chrome.tabs.onUpdated.removeListener(listener);
                    clearTimeout(overallTimeout);
                    if (!resolved) { resolved = true; resolve(); }
                }, 8000);
            } else if (completedCount >= 2) {
                // Second complete: WA has finished its internal navigation
                clearTimeout(secondPhaseTimer);
                clearTimeout(overallTimeout);
                chrome.tabs.onUpdated.removeListener(listener);
                if (!resolved) { resolved = true; resolve(); }
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    });
}


// This function is serialized and injected into the WA Web tab directly
// It MUST be a standalone function (no closures over external variables)
async function waAutomationRunner(data) {
    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    function waitForEl(sel, ms) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(sel);
            if (el) return resolve(el);
            const obs = new MutationObserver(() => {
                const el = document.querySelector(sel);
                if (el) { obs.disconnect(); clearTimeout(t); resolve(el); }
            });
            obs.observe(document.body, { childList: true, subtree: true });
            const t = setTimeout(() => { obs.disconnect(); reject(new Error('Timeout: ' + sel)); }, ms);
        });
    }

    function base64ToBlob(b64, mime) {
        const chars = atob(b64);
        const arr = [];
        for (let i = 0; i < chars.length; i += 512) {
            const slice = chars.slice(i, i + 512);
            const nums = new Array(slice.length);
            for (let j = 0; j < slice.length; j++) nums[j] = slice.charCodeAt(j);
            arr.push(new Uint8Array(nums));
        }
        return new Blob(arr, { type: mime });
    }

    // Both old and new WA send icon names
    const SEND_ICON_SEL = 'span[data-icon="wds-ic-send-filled"], span[data-icon="send"]';

    // Finds the clickable send button using multiple strategies, prioritizing the overlay (last in DOM)
    function findSendButton() {
        const ariaLabels = ['Send', 'Enviar', '\u0625\u0631\u0633\u0627\u0644', 'Envoyer', 'Senden', 'Invia', '\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c'];

        // Check aria-labels first
        for (const label of ariaLabels) {
            const btns = document.querySelectorAll(`button[aria-label="${label}"], div[aria-label="${label}"][role="button"]`);
            if (btns && btns.length > 0) return btns[btns.length - 1]; // Return the last one (overlay)
        }

        // Then check data-icons
        const icons = document.querySelectorAll(SEND_ICON_SEL);
        if (icons && icons.length > 0) {
            let icon = icons[icons.length - 1]; // Use last one in DOM
            let el = icon;
            for (let i = 0; i < 6; i++) {
                el = el.parentElement;
                if (!el) break;
                if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') return el;
            }
            return icon;
        }

        return null;
    }

    // Gets the current text content of the chatbox
    function getChatboxText(chatBox) {
        // WA stores text in child spans, not innerText directly sometimes
        return (chatBox.innerText || chatBox.textContent || '').trim();
    }

    // Types text into chatbox character by character using execCommand
    // This triggers WA's React input handlers properly
    async function typeIntoChat(chatBox, text) {
        chatBox.focus();
        // Clear first
        chatBox.dispatchEvent(new Event('focus', { bubbles: true }));
        await sleep(300);
        // Select all and replace
        document.execCommand('selectAll', false);
        await sleep(100);
        document.execCommand('insertText', false, text);
        await sleep(500);
        chatBox.dispatchEvent(new InputEvent('input', { bubbles: true }));
        await sleep(300);
    }

    // Checks if the current visible modal is a "not on WhatsApp" error modal.
    // Returns the dismiss button if found, null otherwise.
    function getInvalidNumberModal() {
        const modal = document.querySelector('div[data-animate-modal-popup="true"]');
        if (!modal) return null;
        const txt = modal.innerText.toLowerCase();
        const isInvalid =
            txt.includes("isn't on whatsapp") ||
            txt.includes("is not on whatsapp") ||
            txt.includes('not on whatsapp') ||
            txt.includes('invalid') ||
            txt.includes('phone number shared') ||
            txt.includes('no v\u00e1lido') ||
            txt.includes('no estÃ¡ en whatsapp');
        if (!isInvalid) return null;
        return modal.querySelector('button') || modal; // return dismiss btn
    }

    try {
        // STEP 1: Wait for chat footer OR invalid number modal â€” whichever comes first
        // We poll every 500ms so we can skip invalid numbers instantly instead of waiting
        await (function waitForChatOrModal(ms) {
            return new Promise((resolve, reject) => {
                const check = () => {
                    if (document.querySelector('footer')) return resolve();
                    if (getInvalidNumberModal()) return resolve();
                };
                check(); // immediate check first
                const obs = new MutationObserver(check);
                obs.observe(document.body, { childList: true, subtree: true });
                setTimeout(() => { obs.disconnect(); resolve(); }, ms); // resolve after timeout anyway
            });
        })(35000);

        // STEP 2: Immediately check for invalid number modal
        const dismissBtn = getInvalidNumberModal();
        if (dismissBtn) {
            dismissBtn.click(); // dismiss the OK modal
            return { success: false, error: "Number isn't on WhatsApp - skipped" };
        }

        // STEP 2.5: Check for existing chat history if user opted to skip
        let historyExists = false;
        if (data.skipExisting) {
            // Give WhatsApp chat body a brief moment to render message history (SPA)
            await sleep(2000);

            // Refine selector to look for real message bubbles and filter out system banners
            const messages = Array.from(document.querySelectorAll('div.message-in, div.message-out, div[data-id]')).filter(el => {
                const text = (el.innerText || "").toLowerCase();
                const id = el.getAttribute('data-id') || "";

                if (text.includes("end-to-end encrypted") ||
                    text.includes("messages and calls are end-to-end") ||
                    text.includes("business account") ||
                    text.includes("tap for more info") ||
                    text.includes("no v\u00e1lido")) return false;

                if (id.includes('@c.us') || id.includes('@g.us')) return true;
                if (el.classList.contains('message-in') || el.classList.contains('message-out')) return true;
                return false;
            });

            if (messages.length > 0) {
                historyExists = true;
                // If there's no file to send, we can skip the contact entirely right now
                if (!data.hasFile) {
                    return { success: false, error: "Skipped - Chat history already exists." };
                }
                console.log("[WA Blast] History exists, but file is present. Skipping text, sending file only.");
            }
        }

        // STEP 3: Find the chatbox using multiple selectors
        const chatBoxSelectors = [
            'div[contenteditable="true"][data-tab="10"]',
            'div[contenteditable="true"][title="Type a message"]',
            'div[contenteditable="true"][title="Escribe un mensaje"]',
            'footer div[contenteditable="true"]',
            'div[contenteditable="true"]'
        ];
        let chatBox = null;
        for (const sel of chatBoxSelectors) {
            chatBox = document.querySelector(sel);
            if (chatBox) break;
        }

        if (!chatBox) {
            return { success: false, error: 'Chat box not found - WhatsApp may not have loaded the chat.' };
        }

        // STEP 4: Send Text Template FIRST (if provided and NO check history skip)
        if (data.messageText && !historyExists) {
            chatBox.click();
            chatBox.focus();
            await sleep(800);

            let chatText = getChatboxText(chatBox);
            if (!chatText) {
                // Type it manually if WA didn't pre-fill it correctly
                await typeIntoChat(chatBox, data.messageText);
                await sleep(500);
            }

            // Find and click the Send button
            let sendBtn = null;
            for (let attempt = 0; attempt < 8; attempt++) {
                sendBtn = findSendButton();
                if (sendBtn) break;
                chatBox.dispatchEvent(new InputEvent('input', { bubbles: true }));
                await sleep(600);
            }

            if (sendBtn) {
                sendBtn.click();
                // Wait for chatbox to clear (confirmation of send)
                for (let i = 0; i < 10; i++) {
                    if (!getChatboxText(chatBox)) break;
                    await sleep(500);
                }
            } else {
                // Fallback to Enter key
                chatBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13, which: 13 }));
                chatBox.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13, which: 13 }));
            }

            // Critical pause between text and file to avoid race condition
            await sleep(2500);
        }

        // STEP 5: Handle file attachment as a SECOND separate message
        if (data.hasFile && data.file) {
            console.log("[WA Blast] Starting file upload process for:", data.filename);
            const blob = base64ToBlob(data.file.split(',')[1], data.mime);
            const file = new File([blob], data.filename || 'attachment', {
                type: data.mime,
                lastModified: new Date().getTime()
            });
            const dt = new DataTransfer();
            dt.items.add(file);

            let uploadSuccess = false;

            // STRATEGY A: Use the Official "Attach" menu (Targeting Document)
            const plusBtn = document.querySelector('button[aria-label="Attach"], span[data-icon="plus-rounded"], span[data-icon="clip"]');
            if (plusBtn) {
                const actualBtn = plusBtn.tagName === 'BUTTON' ? plusBtn : plusBtn.closest('button');
                if (actualBtn) {
                    actualBtn.click();
                    await sleep(2000); // Wait for menu to fully render

                    // Try to click the "Document" icon specifically
                    const docBtnIcon = document.querySelector('span[data-icon="attach-document"], span[data-icon="document"]');
                    if (docBtnIcon) {
                        const docBtn = docBtnIcon.closest('button') || docBtnIcon.closest('li') || docBtnIcon;
                        docBtn.click();
                        await sleep(1500);
                    }

                    // Find the file input (Document path usually creates an input with accept="*" or no accept)
                    const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
                    let docInput = fileInputs.find(i => i.accept === '*' || !i.accept || i.accept.includes('pdf'));

                    if (docInput) {
                        console.log("[WA Blast] Setting file to Document input...");
                        docInput.files = dt.files;
                        docInput.dispatchEvent(new Event('change', { bubbles: true }));
                        uploadSuccess = true;
                    }
                }
            }

            // STRATEGY B: Drag & Drop Fallback (Targeting the Lexical Editor)
            if (!uploadSuccess) {
                console.log("[WA Blast] Attempting Strategy B: Editor Drop...");
                const editor = document.querySelector('div[contenteditable="true"]') || document.querySelector('.lexical-rich-text-input');
                if (editor) {
                    const dropOptions = { bubbles: true, cancelable: true, dataTransfer: dt };
                    editor.dispatchEvent(new DragEvent('dragenter', dropOptions));
                    editor.dispatchEvent(new DragEvent('dragover', dropOptions));
                    await sleep(300);
                    editor.dispatchEvent(new DragEvent('drop', dropOptions));
                    uploadSuccess = true;
                }
            }

            console.log("[WA Blast] Waiting for PDF processing and preview...");
            await sleep(8000); // 8 seconds for PDF processing (crucial)

            // 3. Find Media Send Button (Specific to the preview overlay)
            let mediaSendBtn = null;
            const mediaSendSelectors = [
                'div[role="button"][aria-label="Send"]',
                'button[aria-label="Send"]',
                'span[data-icon="send"]',
                'span[data-icon="wds-ic-send-filled"]'
            ];

            for (let i = 0; i < 20; i++) { // Wait up to 20s for processing
                for (const sel of mediaSendSelectors) {
                    const icons = document.querySelectorAll(sel);
                    if (icons.length > 0) {
                        // The media overlay send button is always the last one in the DOM
                        const icon = icons[icons.length - 1];
                        const btn = icon.closest('div[role="button"]') || icon.closest('button');

                        // Valid check: it should NOT have the plus icon inside it (that's the attach btn)
                        if (btn && !btn.querySelector('span[data-icon="plus-rounded"]')) {
                            mediaSendBtn = btn;
                            break;
                        }
                    }
                }
                if (mediaSendBtn) break;
                await sleep(1000);
            }

            if (mediaSendBtn) {
                console.log("[WA Blast] Dispatching click to media send button...");
                const evOpts = { bubbles: true, cancelable: true, view: window };
                mediaSendBtn.dispatchEvent(new MouseEvent('mousedown', evOpts));
                mediaSendBtn.dispatchEvent(new MouseEvent('mouseup', evOpts));
                mediaSendBtn.click();
            } else {
                console.warn('[WA Blast] Media send button not found. Sending Enter as last resort.');
                const enterEv = { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13, which: 13 };
                document.body.dispatchEvent(new KeyboardEvent('keydown', enterEv));
            }

            await sleep(5000); // Allow time for actual delivery
        }

        await sleep(1000);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.toString() };
    }
}
