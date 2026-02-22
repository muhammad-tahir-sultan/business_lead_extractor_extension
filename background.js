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

    // Check if we already have a WA tab open
    if (waTabId) {
        try {
            await chrome.tabs.update(waTabId, { url: waUrl, active: true });
        } catch (e) {
            // Tab was closed, create new
            const newTab = await chrome.tabs.create({ url: waUrl, active: true });
            waTabId = newTab.id;
        }
    } else {
        const newTab = await chrome.tabs.create({ url: waUrl, active: true });
        waTabId = newTab.id;
    }

    // Wait for WA to load and execute the automation script
    return new Promise((resolve, reject) => {
        let isResolved = false;

        // Fallback timeout in case the event listener misses the payload
        let timeoutId = setTimeout(() => {
            if (!isResolved) {
                isResolved = true;
                chrome.tabs.onUpdated.removeListener(listener);
                reject("Timeout waiting for WhatsApp tab to load.");
            }
        }, 45000);

        let listener = function (tabId, changeInfo, tab) {
            if (tabId === waTabId && changeInfo.status === 'complete') {
                if (isResolved) return;
                isResolved = true;
                clearTimeout(timeoutId);
                chrome.tabs.onUpdated.removeListener(listener);

                // Inject the content script to perform the click
                chrome.scripting.executeScript({
                    target: { tabId: waTabId },
                    files: ['whatsapp_content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        return reject(chrome.runtime.lastError.message);
                    }

                    // Wait a moment for the script to initialize its listener
                    setTimeout(() => {
                        // Send the data block to the content script
                        chrome.tabs.sendMessage(waTabId, {
                            action: 'run_wa_automation',
                            hasFile: !!fileBase64,
                            file: fileBase64,
                            mime: mimeType,
                            filename: filename
                        }, (response) => {
                            if (chrome.runtime.lastError || !response) {
                                // Can fail if script wasn't ready
                                setTimeout(() => {
                                    chrome.tabs.sendMessage(waTabId, {
                                        action: 'run_wa_automation',
                                        hasFile: !!fileBase64,
                                        file: fileBase64,
                                        mime: mimeType,
                                        filename: filename
                                    }, (retryResp) => {
                                        resolve(retryResp || { success: false, error: "No response from tab." });
                                    });
                                }, 5000);
                            } else {
                                resolve(response);
                            }
                        });
                    }, 3000); // 3 seconds delay
                });
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    });
}
