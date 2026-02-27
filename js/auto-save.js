// ── Auto-Save to Sheet module ─────────────────────────────────────────────────
// Persists user preference and auto-saves data when scraping completes.

const AutoSave = (() => {
    const PREF_KEY = 'autoSavePref';

    // ── State ─────────────────────────────────────────────────────────────────
    let _pref = { enabled: false, mode: 'append', sheet: '' };

    const el = (id) => document.getElementById(id);

    // ── Persistence ───────────────────────────────────────────────────────────

    async function load() {
        const result = await Storage.get([PREF_KEY]);
        if (result[PREF_KEY]) _pref = { ..._pref, ...result[PREF_KEY] };
        _apply();
    }

    function save() {
        Storage.set({ [PREF_KEY]: _pref });
    }

    // ── UI sync ───────────────────────────────────────────────────────────────

    function _apply() {
        el('auto-save-toggle').checked = _pref.enabled;
        el('auto-save-options').style.display = _pref.enabled ? 'flex' : 'none';

        const radios = document.querySelectorAll('input[name="auto-save-mode"]');
        radios.forEach(r => { r.checked = r.value === _pref.mode; });

        el('auto-save-sheet-row').style.display = _pref.mode === 'append' ? 'flex' : 'none';

        if (_pref.sheet) el('auto-save-sheet-select').value = _pref.sheet;
    }

    // ── Sheet list loader ─────────────────────────────────────────────────────

    async function _loadSheets() {
        const { webAppUrl } = await Storage.get(['webAppUrl']);
        if (!webAppUrl) return;

        const sel = el('auto-save-sheet-select');
        sel.innerHTML = '<option value="">Loading sheets…</option>';

        try {
            const json = await SheetsAPI.getSheets(webAppUrl);
            if (json.status !== 'success' || !json.sheets) throw new Error();
            sel.innerHTML = json.sheets
                .map(n => `<option value="${n}"${_pref.sheet === n ? ' selected' : ''}>${n}</option>`)
                .join('');
            if (!_pref.sheet && json.sheets[0]) {
                _pref.sheet = json.sheets[0];
                save();
            }
        } catch {
            sel.innerHTML = '<option value="">— failed to load —</option>';
        }
    }

    // ── Auto-save executor (called from ui_update when scraping finishes) ─────

    async function execute(data) {
        if (!_pref.enabled || !data || !data.length) return;

        const { webAppUrl } = await Storage.get(['webAppUrl']);
        if (!webAppUrl) { UI.setStatus('Auto-save: no Web App URL set.'); return; }

        // Format rows the same way as Export
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

        const indicator = el('auto-save-indicator');
        if (indicator) { indicator.textContent = '⏳ Auto-saving…'; indicator.style.color = '#f59e0b'; }

        try {
            let result;
            if (_pref.mode === 'append') {
                const sheetName = _pref.sheet || el('auto-save-sheet-select').value;
                result = await SheetsAPI.sendData(webAppUrl, 'append', rows, { sheetName });
            } else {
                const keyword = el('keyword') ? el('keyword').value.trim() : 'Leads';
                const tabName = keyword.slice(0, 28) + ' – ' + new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                result = await SheetsAPI.sendData(webAppUrl, 'new_tab', rows, { tabName });
            }

            if (result.status !== 'success') throw new Error(result.message);

            if (indicator) { indicator.textContent = `✅ Auto-saved ${rows.length} rows`; indicator.style.color = '#34d399'; }
            UI.setStatusHTML(
                `✅ Auto-saved! ${rows.length} rows → <a href="${result.url}" target="_blank" style="color:#6366f1;">Open Sheet ↗</a>`
            );
        } catch (err) {
            if (indicator) { indicator.textContent = '❌ Auto-save failed'; indicator.style.color = '#f87171'; }
            console.error('Auto-save failed:', err);
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────

    return {
        init() {
            load();

            // Toggle on/off
            el('auto-save-toggle').addEventListener('change', (e) => {
                _pref.enabled = e.target.checked;
                el('auto-save-options').style.display = _pref.enabled ? 'flex' : 'none';
                if (_pref.enabled && _pref.mode === 'append') _loadSheets();
                save();
            });

            // Mode radio buttons
            document.querySelectorAll('input[name="auto-save-mode"]').forEach(r => {
                r.addEventListener('change', (e) => {
                    _pref.mode = e.target.value;
                    el('auto-save-sheet-row').style.display = _pref.mode === 'append' ? 'flex' : 'none';
                    if (_pref.mode === 'append') _loadSheets();
                    save();
                });
            });

            // Sheet dropdown change
            el('auto-save-sheet-select').addEventListener('change', (e) => {
                _pref.sheet = e.target.value;
                save();
            });
        },

        execute,
        get enabled() { return _pref.enabled; },
    };
})();
