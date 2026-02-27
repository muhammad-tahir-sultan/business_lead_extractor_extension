// ── Append-to-existing-sheet modal ────────────────────────────────────────────

const SheetAppend = (() => {
    const el = (id) => document.getElementById(id);

    async function open() {
        if (!State.hasData) return;

        const url = await Storage.getWebAppUrl();
        if (!url) return;

        el('sheet-selector-modal').style.display = 'block';
        el('sheet-selector-loading').style.display = 'block';
        el('sheet-selector-content').style.display = 'none';

        try {
            const json = await SheetsAPI.getSheets(url);
            if (json.status !== 'success' || !json.sheets) throw new Error(json.message || 'Failed');

            el('sheet-select-dropdown').innerHTML = json.sheets
                .map((n) => `<option value="${n}">${n}</option>`)
                .join('');

            el('sheet-selector-loading').style.display = 'none';
            el('sheet-selector-content').style.display = 'flex';
        } catch (err) {
            alert('Error fetching sheets: ' + err.message);
            el('sheet-selector-modal').style.display = 'none';
        }
    }

    return {
        init() {
            el('append-sheet-btn').addEventListener('click', open);
            el('close-sheet-selector-btn').addEventListener('click', () => { el('sheet-selector-modal').style.display = 'none'; });
            el('confirm-append-btn').addEventListener('click', () => {
                const sheet = el('sheet-select-dropdown').value;
                if (!sheet) return;
                el('sheet-selector-modal').style.display = 'none';
                Export._sendToSheet('append', { sheetName: sheet });
            });
        },
    };
})();
