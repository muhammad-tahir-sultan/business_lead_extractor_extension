export { };

chrome.runtime.onInstalled.addListener(() => {
    console.log('[Background] Extension installed.');
});

// Centralized state
let scrapingState = {
    isScraping: false,
    results: [],
    maxResults: 100,
};

let waCampaignState = {
    isRunning: false,
    shouldStop: false,
    contacts: [] as any[],
    currentIndex: 0,
    stats: { sent: 0, invalid: 0, history: 0, processed: 0 }
};

chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    switch (request.action) {
        case 'start_wa_campaign':
            runWhatsAppCampaign(request.payload);
            break;
        case 'stop_wa_campaign':
            waCampaignState.shouldStop = true;
            break;
        case 'get_wa_state':
            sendResponse(waCampaignState);
            break;
        // ... (scraper cases remain same, but I'll optimize them)
        case 'scraper_complete':
            scrapingState.isScraping = false;
            scrapingState.results = request.results;
            chrome.storage.local.set({ lastScrapeResults: request.results });
            break;
    }
    return true;
});

async function runWhatsAppCampaign(payload: any) {
    waCampaignState.isRunning = true;
    waCampaignState.shouldStop = false;
    waCampaignState.contacts = payload.contacts;
    waCampaignState.stats = { sent: 0, invalid: 0, history: 0, processed: 0 };

    for (let i = 0; i < waCampaignState.contacts.length; i++) {
        if (waCampaignState.shouldStop) break;
        waCampaignState.currentIndex = i;
        const contact = waCampaignState.contacts[i];

        // Update UI
        chrome.runtime.sendMessage({ action: 'wa_stats_update', stats: waCampaignState.stats });

        try {
            // 1. Open/Update Tab
            const [tab] = await chrome.tabs.query({ url: "https://web.whatsapp.com/*" });
            let targetTabId: number;

            const cleanPhone = contact.phone.replace(/[^0-9+]/g, '');
            const url = `https://web.whatsapp.com/send?phone=${cleanPhone}`;

            if (tab?.id) {
                targetTabId = tab.id;
                await chrome.tabs.update(targetTabId, { url, active: true });
            } else {
                const newTab = await chrome.tabs.create({ url, active: true });
                targetTabId = newTab.id!;
            }

            // 2. Intelligent Load Wait
            let isLoaded = false;
            for (let retry = 0; retry < 30; retry++) {
                if (waCampaignState.shouldStop) break;
                await new Promise(r => setTimeout(r, 1000));
                try {
                    const status = await chrome.tabs.sendMessage(targetTabId, { action: 'ping' });
                    if (status?.pong) {
                        isLoaded = true;
                        break;
                    }
                } catch (e) {
                    // Script not loaded yet
                }
            }

            if (!isLoaded && !waCampaignState.shouldStop) {
                console.error("Tab failed to load content script in time");
                waCampaignState.stats.processed++;
                continue;
            }

            // 3. Delegate to Content Script
            const response = await chrome.tabs.sendMessage(targetTabId, {
                action: 'send_wa_message',
                phone: contact.phone,
                text: payload.template.replace(/{{(\w+)}}/g, (_: any, k: string) => contact[k] || ''),
                fileData: payload.attachment,
                skipExisting: payload.settings.skipExisting
            });

            // 4. Update Stats
            waCampaignState.stats.processed++;
            if (response?.success) {
                waCampaignState.stats.sent++;
            } else {
                if (response?.error?.includes('history')) waCampaignState.stats.history++;
                else if (response?.error?.includes('Number')) waCampaignState.stats.invalid++;
            }

        } catch (err) {
            console.error("Campaign Step Error:", err);
            waCampaignState.stats.processed++;
        }

        // Batch Pause Logic
        if (payload.settings.pauseBatch && (i + 1) % payload.settings.batchSize === 0 && (i + 1) < waCampaignState.contacts.length) {
            waCampaignState.stats.processed = i + 1; // Sync for safety
            chrome.runtime.sendMessage({
                action: 'wa_stats_update',
                stats: waCampaignState.stats,
                message: `Batch ${Math.ceil((i + 1) / payload.settings.batchSize)} complete. Cooling down for 5 mins...`
            });
            await new Promise(r => setTimeout(r, 5 * 60 * 1000));
        }

        // Delay between contacts
        const delay = payload.settings.delayBase * 1000 + (payload.settings.randomizeDelay ? Math.random() * 5000 : 1000);
        await new Promise(r => setTimeout(r, delay));
    }

    waCampaignState.isRunning = false;
    chrome.runtime.sendMessage({ action: 'wa_campaign_finished', stats: waCampaignState.stats });
}
