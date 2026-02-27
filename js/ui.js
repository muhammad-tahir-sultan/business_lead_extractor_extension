// ── DOM helpers & UI state management ────────────────────────────────────────

const EXPORT_BUTTON_IDS = [
    'export-csv-btn', 'export-excel-btn',
    'append-sheet-btn', 'new-sheet-btn',
    'clear-results-btn', 'whatsapp-blast-btn',
];

const UI = {
    el: (id) => document.getElementById(id),

    setStatus(text) { this.el('status').innerText = text; },
    setStatusHTML(h) { this.el('status').innerHTML = h; },

    setExportEnabled(enabled) {
        EXPORT_BUTTON_IDS.forEach((id) => { this.el(id).disabled = !enabled; });
    },

    updateFromState(state) {
        State.data = state.data || [];

        this.setStatus(state.status);

        const scraping = Boolean(state.isScraping);
        this.el('start-btn').style.display = scraping ? 'none' : 'flex';
        this.el('scraping-controls').style.display = scraping ? 'flex' : 'none';
        this.el('progress-wrapper').style.display = scraping ? 'block' : 'none';
        document.body.classList.toggle('scraping', scraping);

        if (scraping) {
            const pct = state.progress || 0;
            this.el('progress-bar-fill').style.width = `${pct}%`;
            this.el('progress-stats').innerText = `${pct}% complete`;
        }

        if (state.keyword && !this.el('keyword').value) this.el('keyword').value = state.keyword;
        if (state.minRating) this.el('min-rating').value = state.minRating;
        if (state.maxResults) this.el('max-results').value = state.maxResults;

        this.setExportEnabled(State.hasData);
    },
};
