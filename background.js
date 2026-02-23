let scrapingState = {
    isScraping: false,
    status: 'Ready to extract premium leads...',
    data: [],
    keyword: '',
    minRating: 0,
    progress: 0,
    tabId: null
};

// Load state from storage on startup
chrome.storage.local.get(['savedScrapingState'], (result) => {
    if (result.savedScrapingState) {
        scrapingState = { ...scrapingState, ...result.savedScrapingState, isScraping: false }; // Never start in scraping mode
        scrapingState.status = scrapingState.data.length > 0 ? `Ready. ${scrapingState.data.length} records in memory.` : 'Ready to extract premium leads...';
    }
});

function saveState() {
    chrome.storage.local.set({ savedScrapingState: scrapingState });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrape_website') {
        fetch(request.url)
            .then(res => res.text())
            .then(html => {
                const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
                const fbRegex = /https?:\/\/(www\.)?facebook\.com\/[^"'\s]+/gi;
                const linkedinRegex = /https?:\/\/(www\.)?linkedin\.com\/(company|in)\/[^"'\s]+/gi;
                // Known placeholder/example domains to skip
                const SPAM_DOMAINS = new Set([
                    'example.com', 'example.org', 'example.net',
                    'email.com', 'mysite.com', 'yoursite.com',
                    'domain.com', 'yourdomain.com', 'mydomain.com',
                    'website.com', 'company.com', 'yourcompany.com',
                    'test.com', 'test.org', 'placeholder.com',
                    'samplesite.com', 'sample.com', 'mail.example'
                ]);
                // Generic/placeholder local parts to always skip
                const SPAM_LOCALS = new Set([
                    'email', 'user', 'name', 'username', 'yourname',
                    'youremail', 'test', 'sample', 'example',
                    'someone', 'person', 'owner'
                ]);
                // Major public providers — require longer local part (avoids abc@gmail.com)
                const PUBLIC_PROVIDERS = new Set([
                    'gmail.com', 'yahoo.com', 'yahoo.co.uk',
                    'hotmail.com', 'outlook.com', 'live.com',
                    'icloud.com', 'me.com', 'aol.com'
                ]);

                let emails = [...new Set((html.match(emailRegex) || []).map(e => e.toLowerCase()))];
                emails = emails.filter(e => {
                    // 1. Block image file extensions (including .gif for e.g. ajax-loader@2x.gif)
                    if (/\.(png|jpg|jpeg|webp|gif|svg|ico|bmp)$/.test(e)) return false;
                    // 2. Block known noise
                    if (e.includes('sentry') || e.includes('w3.org')) return false;
                    // 3. Reject version-string false positives (e.g. remixicon@3.3.0, bootstrap@5.0.2)
                    const [local, domain] = e.split('@');
                    if (!domain) return false;
                    const tld = domain.split('.').pop();
                    if (!tld || /^[\d.]+$/.test(tld)) return false;
                    // 4. Block placeholder/example domains
                    if (SPAM_DOMAINS.has(domain)) return false;
                    // 5. Block generic placeholder local parts
                    if (SPAM_LOCALS.has(local)) return false;
                    // 6. On major public providers, require local part of at least 5 chars
                    //    (blocks abc@gmail.com, aa@yahoo.com etc.)
                    if (PUBLIC_PROVIDERS.has(domain) && local.length < 5) return false;
                    return true;
                });
                const fbs = [...new Set(html.match(fbRegex) || [])];
                const linkedins = [...new Set(html.match(linkedinRegex) || [])];
                sendResponse({
                    emails: emails.join(', '),
                    facebook: fbs.join(', '),
                    linkedin: linkedins.join(', ')
                });
            })
            .catch(err => {
                sendResponse({ emails: '', facebook: '', linkedin: '' });
            });
        return true;
    }

    if (request.action === 'start_scraping') {
        scrapingState.isScraping = true;
        scrapingState.keyword = request.keyword;
        scrapingState.minRating = request.minRating;
        scrapingState.data = [];
        scrapingState.status = 'Starting extraction...';
        scrapingState.progress = 0;
        scrapingState.tabId = request.tabId;
        saveState();
    }

    if (request.action === 'status_update') {
        scrapingState.status = request.message;
        if (request.progress !== undefined) {
            scrapingState.progress = request.progress;
        }
        // Broadcast to popup if open
        chrome.runtime.sendMessage({ action: 'ui_update', state: scrapingState }).catch(() => { });
        saveState();
    }

    if (request.action === 'scraping_complete') {
        scrapingState.isScraping = false;
        scrapingState.data = request.data;
        scrapingState.status = `Done! Grabbed ${request.data.length} records.`;
        saveState();
        // Broadcast to popup if open
        chrome.runtime.sendMessage({ action: 'ui_update', state: scrapingState }).catch(() => { });
    }

    if (request.action === 'stop_scraping') {
        if (scrapingState.tabId) {
            chrome.tabs.sendMessage(scrapingState.tabId, { action: 'stop_scraping' }).catch((err) => {
                console.log("Could not send stop message to tab", err);
            });
        }
    }

    if (request.action === 'cancel_scraping') {
        scrapingState.isScraping = false;
        scrapingState.status = 'Scraping cancelled.';
        if (scrapingState.tabId) {
            chrome.tabs.sendMessage(scrapingState.tabId, { action: 'cancel_scraping' }).catch((err) => {
                console.log("Could not send cancel message to tab", err);
            });
        }
        saveState();
        chrome.runtime.sendMessage({ action: 'ui_update', state: scrapingState }).catch(() => { });
    }

    if (request.action === 'clear_data') {
        scrapingState.data = [];
        scrapingState.status = 'Ready to extract premium leads...';
        saveState();
        chrome.runtime.sendMessage({ action: 'ui_update', state: scrapingState }).catch(() => { });
    }

    if (request.action === 'get_status') {
        sendResponse(scrapingState);
    }

    if (request.action === 'update_wa_sent_status') {
        // Mark the contact as sent in the scraped data by matching phone number
        const phone = (request.phone || '').replace(/\D/g, ''); // strip non-digits for comparison
        if (scrapingState.data && scrapingState.data.length > 0) {
            scrapingState.data = scrapingState.data.map(item => {
                const itemPhone = (item.contact || item.phone || '').replace(/\D/g, '');
                if (itemPhone && itemPhone.includes(phone.slice(-9))) {
                    // Match last 9 digits to handle country code differences
                    return { ...item, sentStatus: 'Whatsapp Message Sent' };
                }
                return item;
            });
            saveState();
        }
        sendResponse({ success: true });
    }

    if (request.action === 'send_whatsapp_message') {
        handleWhatsAppMessage(request.phone, request.text, request.file, request.mime, request.filename, request.skipExisting)
            .then(result => sendResponse(result))
            .catch(err => sendResponse({ success: false, error: err.toString() }));
        return true; // Keep message channel open for async response
    }
});

// WhatsApp Blast Logic
let waTabId = null;

async function handleWhatsAppMessage(phone, text, fileBase64, mimeType, filename, skipExisting) {
    // Encode only phone in URL — we will type the text manually inside the injected script
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

    // Inject automation — pass message text so it can re-type if needed
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
                // First complete: start a timer — if no second complete in 8s, proceed anyway
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

    // Finds the clickable send button using 4 strategies
    function findSendButton() {
        const ariaLabels = ['Send', 'Enviar', '\u0625\u0631\u0633\u0627\u0644', 'Envoyer', 'Senden', 'Invia', '\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c'];
        for (const label of ariaLabels) {
            const btn = document.querySelector('button[aria-label="' + label + '"]');
            if (btn) return btn;
        }
        const footer = document.querySelector('footer');
        if (footer) {
            const icon = footer.querySelector(SEND_ICON_SEL);
            if (icon) {
                let el = icon;
                for (let i = 0; i < 6; i++) {
                    el = el.parentElement;
                    if (!el) break;
                    if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') return el;
                }
                return icon;
            }
            for (const b of footer.querySelectorAll('button')) {
                if (b.querySelector(SEND_ICON_SEL)) return b;
            }
        }
        const iconGlobal = document.querySelector(SEND_ICON_SEL);
        if (iconGlobal) {
            let el = iconGlobal;
            for (let i = 0; i < 6; i++) {
                el = el.parentElement;
                if (!el) break;
                if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') return el;
            }
            return iconGlobal;
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
            txt.includes('no está en whatsapp');
        if (!isInvalid) return null;
        return modal.querySelector('button') || modal; // return dismiss btn
    }

    try {
        // STEP 1: Wait for chat footer OR invalid number modal — whichever comes first
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

        // STEP 2: Immediately check for invalid number modal — NO sleep, skip right away
        const dismissBtn = getInvalidNumberModal();
        if (dismissBtn) {
            dismissBtn.click(); // dismiss the OK modal
            return { success: false, error: "Number isn't on WhatsApp — skipped" };
        }

        // STEP 2.5: Check for existing chat history if user opted to skip
        if (data.skipExisting) {
            // Give WhatsApp chat body a brief moment to render message history (SPA)
            await sleep(1000);

            // WA Web uses `message-in` (incoming) and `message-out` (outgoing) classes,
            // or role="row" for message containers.
            const messages = document.querySelectorAll('div.message-in, div.message-out');

            // Only count if there's actual chat text, ignoring system messages like "encryption" alerts
            if (messages.length > 0) {
                return { success: false, error: "Skipped — Chat history already exists." };
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
            // STRICT CHECK — verify chatbox has text.
            chatBox.click();
            chatBox.focus();
            await sleep(800);

            let chatText = getChatboxText(chatBox);

            if (!chatText) {
                // Chatbox is EMPTY — WA lost the pre-filled text, type it manually
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
            }
        }

        // Send text if needed (no file attached)
        if (chatBoxHasTextAndNeedToSend) {
            // Find send button — retry up to 8 times
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

            // 2. Find the hidden file inputs that appear in the menu
            const fileInputs = document.querySelectorAll('input[type="file"]');
            let targetInput = null;

            if (data.mime.startsWith('image/') || data.mime.startsWith('video/')) {
                // The Photo/Video option input Usually has accept="image/*,video/mp4,..."
                targetInput = Array.from(fileInputs).find(i => i.accept && i.accept.includes('image/'));
            } else {
                // The Document option input (for PDFs, etc.) usually has accept="*"
                targetInput = Array.from(fileInputs).find(i => i.accept === '*' || !i.accept);
            }

            // Fallback: Just grab the first file input
            if (!targetInput && fileInputs.length > 0) {
                targetInput = fileInputs[0];
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
                    'div[contenteditable="true"][title="Añade un comentario"]',
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
                mediaSendBtn = findSendButton();
                if (mediaSendBtn) break;

                // Fallback check for new WA UI changes just for media send:
                const fallbackBtn = document.querySelector('div[role="button"][aria-label="Send"], button[aria-label="Send"], span[data-icon="send-light"]');
                if (fallbackBtn) {
                    mediaSendBtn = fallbackBtn;
                    break;
                }

                await sleep(1000);
            }

            if (mediaSendBtn) {
                mediaSendBtn.click();
            } else {
                console.warn('[WA Blast] Could not find media send button, falling back to Enter...');
                document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13, which: 13 }));
            }
            await sleep(3500); // Wait for file to actually send before proceeding
        }

        await sleep(1000);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.toString() };
    }
}
