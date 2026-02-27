let scrapingState = {
    isScraping: false,
    status: 'Ready to extract premium leads...',
    data: [],
    keyword: '',
    minRating: 0,
    maxResults: 100,
    progress: 0,
    tabId: null,
    startTime: null,   // epoch ms when scraping began
    itemsTotal: 0,      // total items in this run (set from progress msgs)
    elapsed: 0,      // seconds elapsed
    eta: null,   // seconds remaining (null = unknown)
};


// Load state from storage on startup
chrome.storage.local.get(['savedScrapingState'], (result) => {
    if (result.savedScrapingState) {
        scrapingState = { ...scrapingState, ...result.savedScrapingState };
        if (!scrapingState.isScraping && scrapingState.data.length > 0) {
            scrapingState.status = `Ready. ${scrapingState.data.length} records in memory.`;
        }
    }
});

function saveState() {
    chrome.storage.local.set({ savedScrapingState: scrapingState });
}

// ── Background Auto-Save helper ────────────────────────────────────────────────
async function executeAutoSaveInBackground(data, keyword) {
    if (!data || !data.length) return false;

    const storage = await chrome.storage.local.get(['autoSavePref', 'webAppUrl']);
    const pref = storage.autoSavePref;
    const webAppUrl = storage.webAppUrl;

    if (!pref || !pref.enabled) return false;

    if (!webAppUrl) {
        scrapingState.status = 'Auto-save failed: No Web App URL set in Export settings.';
        saveState();
        chrome.runtime.sendMessage({ action: 'ui_update', state: scrapingState }).catch(() => { });
        return true;
    }

    scrapingState.status = `⏳ Auto-saving ${data.length} records to Google Sheets...`;
    saveState();
    chrome.runtime.sendMessage({ action: 'ui_update', state: scrapingState }).catch(() => { });

    const rows = data.map(item => ({
        name: item.name || '',
        rating: item.rating || '',
        reviews: item.reviews || '',
        url: item.url || '',
        website: item.website || '',
        phone: item.contact || '',
        email: item.emails || '',
        text_snippet: '',
        'Sent Status': '',
        'Next Follow-Up Date': '',
        'Follow-Up Stage': '',
        date_scraped: new Date().toISOString().split('T')[0],
        source: 'Google Maps Scraper',
        notes: '',
        'Linkedin URL': item.linkedin || '',
        Facebook: item.facebook || '',
    }));

    try {
        let payload;
        if (pref.mode === 'append') {
            const sheetName = pref.sheet || 'Sheet1';
            payload = { action: 'append', data: rows, sheetName };
        } else {
            const tabName = (keyword || 'Leads').slice(0, 28) + ' – ' + new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            payload = { action: 'new_tab', data: rows, tabName };
        }

        const res = await fetch(webAppUrl, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        });
        const result = await res.json();

        if (result.status !== 'success') throw new Error(result.message);

        scrapingState.status = `✅ Auto-saved! ${rows.length} rows → ${result.url || 'Sheet'}`;
    } catch (err) {
        console.error('Background Auto-save failed:', err);
        scrapingState.status = `❌ Auto-save failed: ${err.message}`;
    }

    saveState();
    chrome.runtime.sendMessage({ action: 'ui_update', state: scrapingState }).catch(() => { });

    // Also broadcast a small event so the popup toggle UI indicator can show ✅ or ❌ if open
    chrome.runtime.sendMessage({ action: 'auto_save_done', status: scrapingState.status }).catch(() => { });
    return true;
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
        scrapingState.maxResults = request.maxResults || 100;
        scrapingState.data = [];
        scrapingState.status = 'Starting extraction...';
        scrapingState.progress = 0;
        scrapingState.tabId = request.tabId;
        scrapingState.startTime = Date.now();
        scrapingState.itemsTotal = 0;
        scrapingState.elapsed = 0;
        scrapingState.eta = null;
        saveState();
    }


    if (request.action === 'status_update') {
        scrapingState.isScraping = true;
        scrapingState.status = request.message;

        if (request.progress !== undefined) {
            scrapingState.progress = request.progress;
        }

        // Compute elapsed and ETA
        if (scrapingState.startTime) {
            const elapsedMs = Date.now() - scrapingState.startTime;
            scrapingState.elapsed = Math.floor(elapsedMs / 1000);

            const pct = scrapingState.progress;
            scrapingState.eta = (pct > 2)
                ? Math.round((elapsedMs / pct) * (100 - pct) / 1000)
                : null;
        }

        // Broadcast to popup if open
        chrome.runtime.sendMessage({ action: 'ui_update', state: scrapingState }).catch(() => { });
        saveState();
    }


    if (request.action === 'scraping_complete') {
        scrapingState.isScraping = false;
        scrapingState.data = request.data;
        const kw = scrapingState.keyword;

        const s = request.stats || {};
        const n = s.total ?? request.data.length;
        const baseStatus = n === 0
            ? 'Done! No records found.'
            : `✅ Done! ${n} scraped`
            + `  ·  📞 ${s.phone ?? '?'}/${n}`
            + `  ·  🌐 ${s.web ?? '?'}/${n}`
            + `  ·  📧 ${s.email ?? '?'}/${n}`;

        scrapingState.status = baseStatus;
        saveState();
        chrome.runtime.sendMessage({ action: 'ui_update', state: scrapingState }).catch(() => { });

        // Trigger AutoSave in background (does nothing if toggle is off)
        executeAutoSaveInBackground(request.data, kw);
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
try { importScripts("wa_background.js"); } catch (e) { console.error(e); }
