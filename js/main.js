// ── Bootstrap: wire all modules and runtime events ────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Initialise all modules
    Library.init();
    LocationBuilder.init();
    SheetAppend.init();
    SheetViewer.init();
    AutoSave.init();

    // Restore UI from background worker state
    chrome.runtime.sendMessage({ action: 'get_status' }, (state) => {
        if (state) UI.updateFromState(state);
    });

    // Live updates from background while popup is open
    let _wasScraping = false;
    chrome.runtime.onMessage.addListener((req) => {
        if (req.action !== 'ui_update') return;
        const state = req.state;

        // Detect transition: scraping → done  → trigger auto-save
        if (_wasScraping && !state.isScraping && state.data && state.data.length) {
            AutoSave.execute(state.data);
        }
        _wasScraping = Boolean(state.isScraping);

        UI.updateFromState(state);
    });

    // ── Button wiring ─────────────────────────────────────────────────────────
    const on = (id, fn) => document.getElementById(id).addEventListener('click', fn);

    on('start-btn', () => Scraper.start());
    on('stop-btn', () => Scraper.stop());
    on('cancel-btn', () => Scraper.cancel());
    on('clear-results-btn', () => Scraper.clearResults());

    on('export-csv-btn', () => Export.toCSV());
    on('export-excel-btn', () => Export.toExcel());
    on('new-sheet-btn', () => Export.toNewSheet());

    on('whatsapp-blast-btn', () => chrome.tabs.create({ url: chrome.runtime.getURL('whatsapp.html') }));
});
