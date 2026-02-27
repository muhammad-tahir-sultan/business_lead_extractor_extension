// ── Export: CSV, Excel, Google Sheets ────────────────────────────────────────

const EXPORT_HEADERS = [
    'name', 'rating', 'reviews', 'url', 'website', 'phone', 'email', 'text_snippet',
    'Sent Status', 'Next Follow-Up Date', 'Follow-Up Stage', 'date_scraped',
    'source', 'notes', 'Linkedin URL', 'Facebook',
];

const Export = {
    // ── Formatting ────────────────────────────────────────────────────────────

    _safePhone: (v) => (v && /^[+\-=@]/.test(v) ? `'${v}` : v || ''),

    _formatRow(item) {
        return {
            name: item.name || '',
            rating: item.rating || '',
            reviews: item.reviews || '',
            url: item.url || '',
            website: item.website || '',
            phone: Export._safePhone(item.contact),
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
        };
    },

    _download(blob, filename) {
        chrome.downloads.download({ url: URL.createObjectURL(blob), filename });
    },

    // ── CSV ───────────────────────────────────────────────────────────────────

    toCSV() {
        if (!State.hasData) return;

        const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
        const rows = State.data.map((item) => [
            esc(item.name || ''),
            esc(item.rating || ''),
            esc(item.reviews || ''),
            esc(item.url || ''),
            esc(item.website || ''),
            esc(Export._safePhone(item.contact)),
            esc(item.emails || ''),
            '""', '""', '""', '""',
            esc(new Date().toISOString().split('T')[0]),
            '"Google Maps Scraper"',
            '""',
            esc(item.linkedin || ''),
            esc(item.facebook || ''),
        ].join(','));

        const csv = [EXPORT_HEADERS.join(','), ...rows].join('\n');
        this._download(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `maps_leads_${Date.now()}.csv`);
    },

    // ── Excel ─────────────────────────────────────────────────────────────────

    toExcel() {
        if (!State.hasData) return;

        const ws = XLSX.utils.json_to_sheet(State.data.map(this._formatRow));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Leads');
        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        this._download(
            new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
            `maps_leads_${Date.now()}.xlsx`
        );
    },

    // ── Google Sheets ─────────────────────────────────────────────────────────

    async _sendToSheet(action, options = {}) {
        if (!State.hasData) return;

        const url = await Storage.getWebAppUrl();
        if (!url) return;

        const data = State.data.map(this._formatRow);
        const query = UI.el('keyword').value.trim() || 'Leads';

        UI.setStatus('Sending to Sheet...');
        UI.el('append-sheet-btn').disabled = true;
        UI.el('new-sheet-btn').disabled = true;

        try {
            const result = await SheetsAPI.sendData(url, action, data, { query, ...options });
            if (result.status !== 'success') throw new Error(result.message);
            UI.setStatusHTML(`Upload Complete! Added ${data.length} rows. <a href="${result.url}" target="_blank" style="color:#6366f1;">Open Sheet ↗</a>`);
        } catch (err) {
            console.error(err);
            const update = confirm('Error sending to sheet. Update the Web App URL?');
            if (update) {
                const newUrl = prompt('New Apps Script URL:', url);
                if (newUrl) { await Storage.set({ webAppUrl: newUrl }); UI.setStatus('URL updated. Try again.'); }
                else UI.setStatus('Send Failed.');
            } else {
                UI.setStatus('Send Failed.');
            }
        } finally {
            UI.el('append-sheet-btn').disabled = false;
            UI.el('new-sheet-btn').disabled = false;
        }
    },

    toNewSheet() {
        const query = UI.el('keyword').value.trim() || 'Leads';
        const suggested = query.split(' ').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
            + ' - ' + new Date().toLocaleTimeString();
        const tabName = prompt('Name for the new Google Sheets tab:', suggested);
        if (tabName === null) return;
        Export._sendToSheet('new_tab', { tabName: tabName.trim() });
    },
};
