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

        get enabled() { return _pref.enabled; },
    };
})();
