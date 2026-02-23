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

        // STEP 2: Immediately check for invalid number modal â€” NO sleep, skip right away
        const dismissBtn = getInvalidNumberModal();
        if (dismissBtn) {
            dismissBtn.click(); // dismiss the OK modal
            return { success: false, error: "Number isn't on WhatsApp â€” skipped" };
        }

        // STEP 2.5: Check for existing chat history if user opted to skip
        if (data.skipExisting) {
            // Give WhatsApp chat body a brief moment to render message history (SPA)
            await sleep(1500);

            // WA Web uses `message-in` (incoming) and `message-out` (outgoing) classes,
            // or role="row" for message containers.
            const messages = document.querySelectorAll('div.message-in, div.message-out, div[role="row"] div[data-id]');

            // Only count if there's actual chat text, ignoring system messages like "encryption" alerts
            if (messages.length > 0) {
                return { success: false, error: "Skipped â€” Chat history already exists." };
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

        // STEP 4/5/6: Handle text message ONLY if there is no file,
        // OR if there is a file, we skip sending text first and send it as a caption instead.
        let chatBoxHasTextAndNeedToSend = false;

        if (data.messageText && !data.hasFile) {
            // STRICT CHECK â€” verify chatbox has text.
            chatBox.click();
            chatBox.focus();
            await sleep(800);

            let chatText = getChatboxText(chatBox);

            if (!chatText) {
                // Chatbox is EMPTY â€” WA lost the pre-filled text, type it manually
                await typeIntoChat(chatBox, data.messageText);
                await sleep(500);
            }

            // Give WA time to process input and enable the send button
            chatBox.dispatchEvent(new Event('focus', { bubbles: true }));
            chatBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End', keyCode: 35 }));
            chatBox.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'End', keyCode: 35 }));
            chatBox.dispatchEvent(new InputEvent('input', { bubbles: true }));
            await sleep(1000);

            chatBoxHasTextAndNeedToSend = true;
        } else if (data.messageText && data.hasFile) {
            // We have a file AND text. Clear any pre-filled URL text from the chatbox to avoid sending it twice.
            // (Because we will send it as a caption instead)
            chatBox.click();
            chatBox.focus();
            await sleep(500);

            let chatText = getChatboxText(chatBox);
            if (chatText) {
                // Select all and delete
                document.execCommand('selectAll', false, null);
                document.execCommand('delete', false, null);
                await sleep(500);

                // Fallback: If execCommand failed to clear it (sometimes React blocks it), forcefully remove
                if (getChatboxText(chatBox)) {
                    chatBox.textContent = '';
                    chatBox.dispatchEvent(new InputEvent('input', { bubbles: true }));
                    await sleep(500);
                }
            }
        }

        // Send text if needed (no file attached)
        if (chatBoxHasTextAndNeedToSend) {
            // Find send button â€” retry up to 8 times
            let sendBtn = null;
            for (let attempt = 0; attempt < 8; attempt++) {
                sendBtn = findSendButton();
                if (sendBtn) break;
                // Re-nudge chatbox to activate send button
                chatBox.dispatchEvent(new InputEvent('input', { bubbles: true }));
                chatBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ', keyCode: 32 }));
                chatBox.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: ' ', keyCode: 32 }));
                await sleep(600);
            }

            // Click send and VERIFY it was sent
            let messageSent = false;
            if (sendBtn) {
                for (let sendAttempt = 0; sendAttempt < 4; sendAttempt++) {
                    sendBtn.click();
                    await sleep(2000);
                    const textAfterSend = getChatboxText(chatBox);
                    if (!textAfterSend || textAfterSend.length === 0) {
                        messageSent = true;
                        break; // Confirmed sent!
                    }
                    await sleep(500);
                    sendBtn = findSendButton();
                    if (!sendBtn) break;
                }
            }

            if (!messageSent) {
                chatBox.focus();
                chatBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13, which: 13 }));
                chatBox.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13, which: 13 }));
                await sleep(2000);
            }
        }

        // STEP 7: Handle file attachment if provided
        if (data.hasFile && data.file) {
            const blob = base64ToBlob(data.file.split(',')[1], data.mime);
            const file = new File([blob], data.filename || 'attachment', { type: data.mime });
            const dt = new DataTransfer();
            dt.items.add(file);

            // 1. Click the "+" (plus) icon to open the attachment menu.
            // In the new WA UI, this attaches the file inputs to the DOM.
            const plusIcon = document.querySelector('span[data-icon="plus-rounded"], span[data-icon="clip"]');
            if (plusIcon) {
                const plusBtn = plusIcon.closest('button') || plusIcon.parentElement || plusIcon;
                // Wait for any previous send button overlays to clear
                await sleep(500);
                plusBtn.click();
                await sleep(1000); // Wait for menu to animate in and mount hidden inputs
            }

            // 2. Find the hidden file inputs that appear in the menu (Wait for them to mount)
            let fileInputs = null;
            let targetInput = null;

            for (let i = 0; i < 15; i++) {
                fileInputs = document.querySelectorAll('input[type="file"]');
                if (fileInputs && fileInputs.length > 0) {
                    if (data.mime.startsWith('image/') || data.mime.startsWith('video/')) {
                        // The Photo/Video option input Usually has accept="image/*,video/mp4,..."
                        targetInput = Array.from(fileInputs).find(inp => inp.accept && inp.accept.includes('image/'));
                    } else {
                        // The Document option input (for PDFs, etc.) usually has accept="*"
                        targetInput = Array.from(fileInputs).find(inp => inp.accept === '*' || !inp.accept);
                    }

                    // Fallback: Just grab the first file input if specific one not found
                    if (!targetInput) {
                        targetInput = fileInputs[0];
                    }
                    break;
                }
                await sleep(500); // Polling for the menu to render
            }

            if (targetInput) {
                // 3. Inject our file directly into the input and trigger React's change handler
                targetInput.files = dt.files;
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                // Fallback: Drag-and-Drop if no inputs could be found
                console.warn('[WA Blast] No file inputs found in menu, falling back to Drag-and-Drop.');
                const drop = document.querySelector('#main') || document.body;
                const evOpts = { bubbles: true, cancelable: true, dataTransfer: dt };
                drop.dispatchEvent(new DragEvent('dragenter', evOpts));
                drop.dispatchEvent(new DragEvent('dragover', evOpts));
                drop.dispatchEvent(new DragEvent('drop', evOpts));
            }

            await sleep(2500); // give WhatsApp time to open media preview wrapper

            // 4. Type the CAPTION if text was provided and we brought a file
            if (data.messageText) {
                // Look for caption box in the media preview overlay
                // The caption box usually has title="Add a caption" or similar contenteditable div in the overlay
                let captionBox = null;
                const captionSelectors = [
                    'div[contenteditable="true"][title="Add a caption"]',
                    'div[contenteditable="true"][data-tab="10"]',
                    'div[contenteditable="true"][title="AÃ±ade un comentario"]',
                    'div[contenteditable="true"]'
                ];

                for (let i = 0; i < 5; i++) {
                    let editables = document.querySelectorAll('div[contenteditable="true"]');
                    // We want the last editable loaded (usually the caption overlay, not the background chatbox)
                    if (editables && editables.length > 0) {
                        // The active overlay textbox
                        captionBox = editables[editables.length - 1];
                    }
                    if (captionBox) break;
                    await sleep(500);
                }

                if (captionBox) {
                    captionBox.click();
                    captionBox.focus();
                    await sleep(500);
                    await typeIntoChat(captionBox, data.messageText);
                    await sleep(500);
                    captionBox.dispatchEvent(new Event('focus', { bubbles: true }));
                    captionBox.dispatchEvent(new InputEvent('input', { bubbles: true }));
                    await sleep(1000);
                } else {
                    console.warn('[WA Blast] Could not find caption box, sending file without caption.');
                }
            }

            let mediaSendBtn = null;
            for (let i = 0; i < 15; i++) {
                // Wait for the media overlay explicitly by targeting unique icons
                const svgs = document.querySelectorAll('span[data-icon="wds-ic-send-filled"], span[data-icon="send-light"]');
                if (svgs && svgs.length > 0) {
                    let icon = svgs[svgs.length - 1]; // get the last one (overlay)
                    mediaSendBtn = icon.closest('div[role="button"]') || icon.closest('button') || icon;
                    break;
                }

                // Fallback check: look for ANY Send button that is NOT inside the background chat footer
                const allSends = document.querySelectorAll('div[role="button"][aria-label="Send"], button[aria-label="Send"]');
                let foundAlt = null;
                for (let k = allSends.length - 1; k >= 0; k--) {
                    if (!allSends[k].closest('footer')) {
                        foundAlt = allSends[k];
                        break;
                    }
                }
                if (foundAlt) {
                    mediaSendBtn = foundAlt;
                    break;
                }

                await sleep(1000); // Polling
            }

            if (mediaSendBtn) {
                // Dispatch full click sequence to trigger React synthetic events on divs
                const evOptsBtn = { bubbles: true, cancelable: true, view: window };
                mediaSendBtn.dispatchEvent(new MouseEvent('mousedown', evOptsBtn));
                mediaSendBtn.dispatchEvent(new MouseEvent('mouseup', evOptsBtn));
                mediaSendBtn.click();
            } else {
                console.warn('[WA Blast] Could not find media send button, falling back to Enter...');
                if (captionBox) {
                    // Try to hit enter inside the active caption box
                    captionBox.focus();
                    captionBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13, which: 13 }));
                    captionBox.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13, which: 13 }));
                } else {
                    document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13, which: 13 }));
                }
            }
            await sleep(3500); // Wait for file to actually send before proceeding
        }

        await sleep(1000);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.toString() };
    }
}
