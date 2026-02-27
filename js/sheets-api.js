// ── Google Apps Script API layer ──────────────────────────────────────────────

const SheetsAPI = {
    async _post(url, payload) {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        });
        return res.json();
    },

    getSheets: (url) => SheetsAPI._post(url, { action: 'get_sheets' }),
    getSheetData: (url, sheetName) => SheetsAPI._post(url, { action: 'get_sheet_data', sheetName }),
    sendData: (url, action, data, opts) => SheetsAPI._post(url, { action, data, ...opts }),
};
