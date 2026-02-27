import { MapsScraperEngine } from '../services/scraper';

console.log("[Premium Scraper] Content script loaded.");

let engine: MapsScraperEngine | null = null;

chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (request.action === 'start_scraping') {
        startScraping(request.maxResults);
        sendResponse({ success: true });
    } else if (request.action === 'stop_scraping') {
        engine?.cancel();
        sendResponse({ success: true });
    }
});

async function startScraping(maxResults: number) {
    engine = new MapsScraperEngine({
        onStatus: (message) => {
            chrome.runtime.sendMessage({ action: 'scraper_status', message });
        },
        onProgress: (progress) => {
            chrome.runtime.sendMessage({ action: 'scraper_progress', progress });
        },
        onLeadsFound: (count) => {
            chrome.runtime.sendMessage({ action: 'scraper_count', count });
        }
    });

    try {
        const leads = await engine.scrape(maxResults);
        chrome.runtime.sendMessage({ action: 'scraper_complete', results: leads });
    } catch (err: any) {
        chrome.runtime.sendMessage({ action: 'scraper_error', error: err.message });
    }
}
