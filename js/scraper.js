// ── Scraping controls ─────────────────────────────────────────────────────────

const Scraper = {
    async start() {
        const keyword = UI.el('keyword').value.trim();
        const minRating = parseFloat(UI.el('min-rating').value) || 0;
        const maxResults = parseInt(UI.el('max-results').value) || 100;

        if (!keyword) { alert('Please enter a keyword.'); return; }

        UI.el('suggestions-list').classList.remove('active');

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const onMaps = tab.url.includes('google.com/maps') || tab.url.includes('google.co.uk/maps');
        if (!onMaps) { alert('Please open Google Maps in the active tab first.'); return; }

        chrome.runtime.sendMessage({ action: 'start_scraping', keyword, minRating, maxResults, tabId: tab.id });

        chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }, () => {
            chrome.tabs.sendMessage(tab.id, { action: 'start_scraping', keyword, minRating, maxResults })
                .catch((err) => console.warn('Could not start scraping:', err));
        });
    },

    stop() { chrome.runtime.sendMessage({ action: 'stop_scraping' }); },
    cancel() { chrome.runtime.sendMessage({ action: 'cancel_scraping' }); },

    clearResults() {
        if (confirm('Are you sure you want to delete all extracted leads?')) {
            chrome.runtime.sendMessage({ action: 'clear_data' });
        }
    },
};
