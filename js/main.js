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
        if (req.action === 'ui_update') {
            const state = req.state;
            _wasScraping = Boolean(state.isScraping);
            UI.updateFromState(state);
        }
        if (req.action === 'auto_save_done') {
            const ind = document.getElementById('auto-save-indicator');
            if (ind) {
                if (req.status.includes('✅')) { ind.textContent = '✅ Saved'; ind.style.color = '#34d399'; }
                else if (req.status.includes('❌')) { ind.textContent = '❌ Failed'; ind.style.color = '#f87171'; }
            }
        }
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
