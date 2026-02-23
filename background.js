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

    if (request.action === 'send_whatsapp_message') {
        handleWhatsAppMessage(request.phone, request.text, request.file, request.mime, request.filename)
            .then(result => sendResponse(result))
            .catch(err => sendResponse({ success: false, error: err.toString() }));
        return true; // Keep message channel open for async response
    }
});

// WhatsApp Blast Logic
let waTabId = null;

async function handleWhatsAppMessage(phone, text, fileBase64, mimeType, filename) {
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

    // Wait for the tab to finish loading
    await waitForTabLoad(waTabId, 40000);

    // Extra buffer for WhatsApp React to hydrate
    await new Promise(r => setTimeout(r, 4000));

    // Inject and run the automation function directly (avoids the sendMessage port-closed bug)
    let results;
    try {
        results = await chrome.scripting.executeScript({
            target: { tabId: waTabId },
            func: waAutomationRunner,
            args: [{ hasFile: !!fileBase64, file: fileBase64, mime: mimeType, filename: filename }]
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

function waitForTabLoad(tabId, timeoutMs) {
    return new Promise((resolve, reject) => {
        chrome.tabs.get(tabId, (tab) => {
            if (tab && tab.status === 'complete') return resolve();
        });

        let timeout = setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(listener);
            reject(new Error("Tab load timeout"));
        }, timeoutMs);

        let listener = (id, changeInfo) => {
            if (id === tabId && changeInfo.status === 'complete') {
                clearTimeout(timeout);
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
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

    // Correct WA icon names (WhatsApp updated from 'send' to 'wds-ic-send-filled')
    const SEND_ICON_SEL = 'span[data-icon="wds-ic-send-filled"], span[data-icon="send"]';

    // Robust send button finder — 4 strategies to find the green send button
    function findSendButton() {
        // Strategy 1: By aria-label in multiple languages
        const ariaLabels = ['Send', 'Enviar', '\u0625\u0631\u0633\u0627\u0644', 'Envoyer', 'Senden', 'Invia', '\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c'];
        for (const label of ariaLabels) {
            const btn = document.querySelector('button[aria-label="' + label + '"]');
            if (btn) return btn;
        }

        // Strategy 2: Find the send icon inside footer, walk up DOM to the button
        const footer = document.querySelector('footer');
        if (footer) {
            const sendIcon = footer.querySelector(SEND_ICON_SEL);
            if (sendIcon) {
                let el = sendIcon;
                for (let i = 0; i < 6; i++) {
                    el = el.parentElement;
                    if (!el) break;
                    if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') return el;
                }
                return sendIcon;
            }
            // Any button in footer containing a send icon
            const footerBtns = footer.querySelectorAll('button');
            for (const b of footerBtns) {
                if (b.querySelector(SEND_ICON_SEL)) return b;
            }
        }

        // Strategy 3: Global send icon fallback — walk up DOM
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

    try {
        // Step 1: Wait for chat box OR invalid number modal
        await waitForEl(
            'footer, div[data-animate-modal-popup="true"], div[title="Type a message"]',
            30000
        );
        await sleep(2000);

        // Step 1.5: Check for invalid number modal
        const modal = document.querySelector('div[data-animate-modal-popup="true"]');
        if (modal) {
            const txt = modal.innerText.toLowerCase();
            if (txt.includes('invalid') || txt.includes('phone number shared') || txt.includes('no v\u00e1lido')) {
                const btn = modal.querySelector('button');
                if (btn) btn.click();
                return { success: false, error: 'Contact not on WhatsApp (Invalid Number)' };
            }
        }

        // Step 2: Focus and nudge the chatbox so WhatsApp activates the send button
        // (When text is pre-filled via URL params, WA needs a focus event to enable send)
        const chatBoxSelectors = [
            'div[contenteditable="true"][data-tab="10"]',
            'div[contenteditable="true"][title="Type a message"]',
            'div[contenteditable="true"][title="Escribe un mensaje"]',
            'div[contenteditable="true"]'
        ];
        let chatBox = null;
        for (const sel of chatBoxSelectors) {
            chatBox = document.querySelector(sel);
            if (chatBox) break;
        }

        if (chatBox) {
            chatBox.click();
            chatBox.focus();
            chatBox.dispatchEvent(new Event('focus', { bubbles: true }));
            chatBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End', keyCode: 35 }));
            chatBox.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'End', keyCode: 35 }));
            chatBox.dispatchEvent(new InputEvent('input', { bubbles: true }));
            await sleep(1000);
        }

        // Step 3: Find and click the send button with up to 6 retries
        let sendBtn = null;
        for (let attempt = 0; attempt < 6; attempt++) {
            sendBtn = findSendButton();
            if (sendBtn) break;
            if (chatBox) {
                chatBox.dispatchEvent(new InputEvent('input', { bubbles: true }));
                chatBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ', keyCode: 32 }));
                chatBox.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: ' ', keyCode: 32 }));
            }
            await sleep(700);
        }

        if (sendBtn) {
            sendBtn.click();
            await sleep(2000);
        } else if (chatBox) {
            // Last resort: simulate pressing Enter to send the message
            chatBox.focus();
            chatBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13, which: 13 }));
            chatBox.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13, which: 13 }));
            await sleep(2000);
        } else {
            return { success: false, error: 'Could not find send button or chat box' };
        }

        // Step 4: Attach file if provided
        if (data.hasFile && data.file) {
            const blob = base64ToBlob(data.file.split(',')[1], data.mime);
            const file = new File([blob], data.filename || 'attachment', { type: data.mime });

            const drop = document.querySelector('#main') || document.body;
            const dt = new DataTransfer();
            dt.items.add(file);
            const evOpts = { bubbles: true, cancelable: true, dataTransfer: dt };
            drop.dispatchEvent(new DragEvent('dragenter', evOpts));
            drop.dispatchEvent(new DragEvent('dragover', evOpts));
            drop.dispatchEvent(new DragEvent('drop', evOpts));

            await sleep(2000);
            await waitForEl(SEND_ICON_SEL, 10000);
            await sleep(500);
            const mediaSend = findSendButton();
            if (mediaSend) mediaSend.click();
        }

        await sleep(1500);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.toString() };
    }
}


