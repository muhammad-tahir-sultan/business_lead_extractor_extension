// ── Sheet Data Viewer modal ───────────────────────────────────────────────────

const SheetViewer = (() => {
    // Only these columns are shown in the viewer table
    const VISIBLE_COLUMNS = ['name', 'phone', 'email', 'sent status', 'website', 'rating'];

    let _rows = [];
    let _headers = [];

    const el = (id) => document.getElementById(id);

    // ── State management ──────────────────────────────────────────────────────

    function setState(state) {
        el('view-sheet-loading').style.display = state === 'loading' ? 'flex' : 'none';
        el('view-sheet-error').style.display = state === 'error' ? 'flex' : 'none';
        el('view-sheet-empty').style.display = state === 'empty' ? 'flex' : 'none';
        el('view-sheet-table-wrap').style.display = state === 'table' ? 'block' : 'none';
    }

    // ── Rendering ─────────────────────────────────────────────────────────────

    function cellContent(val) {
        if (!val) return `<span style="color:rgba(255,255,255,0.3);">—</span>`;
        if (val.startsWith('http')) {
            const label = val.length > 28 ? val.slice(0, 28) + '…' : val;
            return `<a href="${val}" target="_blank" style="color:#818cf8;text-decoration:none;" title="${val}">${label}</a>`;
        }
        const label = val.length > 36 ? val.slice(0, 36) + '…' : val;
        return `<span style="color:rgba(255,255,255,0.82);" title="${val}">${label}</span>`;
    }

    function renderRows(rows) {
        const badge = el('view-sheet-row-badge');
        badge.textContent = `${rows.length} rows`;
        badge.style.display = 'inline-block';

        if (!rows.length) {
            el('view-sheet-tbody').innerHTML = `
                <tr><td colspan="${_headers.length}"
                    style="padding:40px;text-align:center;color:rgba(255,255,255,0.3);font-size:13px;">
                    No rows match your search.
                </td></tr>`;
            return;
        }

        el('view-sheet-tbody').innerHTML = rows.map((row, i) => {
            const bg = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent';
            const cells = _headers.map((h) =>
                `<td style="padding:9px 16px;border-bottom:1px solid rgba(255,255,255,0.04);white-space:nowrap;max-width:220px;overflow:hidden;text-overflow:ellipsis;">
                    ${cellContent(row[h] || '')}
                </td>`
            ).join('');
            return `<tr style="background:${bg};transition:background .15s;"
                        onmouseover="this.style.background='rgba(99,102,241,0.08)'"
                        onmouseout="this.style.background='${bg}'">${cells}</tr>`;
        }).join('');
    }

    function renderTable(rows) {
        // Filter to only columns present in the data AND in VISIBLE_COLUMNS
        const allKeys = rows.length ? Object.keys(rows[0]) : [];
        _headers = allKeys.filter((k) => VISIBLE_COLUMNS.includes(k.toLowerCase()));
        _rows = rows;

        el('view-sheet-thead').innerHTML = `<tr>${_headers.map((h) => `
            <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;
                        color:rgba(165,180,252,.9);white-space:nowrap;border-bottom:1px solid
                        rgba(255,255,255,.08);background:#0f1120;text-transform:uppercase;
                        letter-spacing:.05em;">${h}</th>`
        ).join('')}</tr>`;

        el('view-sheet-search').value = '';
        renderRows(rows);
    }

    // ── Data fetching ─────────────────────────────────────────────────────────

    async function loadTab(url, sheetName) {
        setState('loading');
        el('view-sheet-row-badge').style.display = 'none';
        el('view-sheet-subtitle').textContent = sheetName || 'Active Sheet';

        try {
            const json = await SheetsAPI.getSheetData(url, sheetName);
            if (json.status !== 'success') throw new Error(json.message);
            if (!json.data?.length) { setState('empty'); return; }
            renderTable(json.data);
            setState('table');
        } catch (err) {
            el('view-sheet-error-msg').textContent = err.message || 'Failed to connect.';
            setState('error');
        }
    }

    async function open() {
        const url = await Storage.getWebAppUrl();
        if (!url) return;

        el('view-sheet-modal').style.display = 'flex';
        el('view-sheet-select').innerHTML = '';
        el('view-sheet-search').value = '';
        el('view-sheet-row-badge').style.display = 'none';
        el('view-sheet-subtitle').textContent = 'Connecting...';
        setState('loading');

        try {
            const json = await SheetsAPI.getSheets(url);
            if (json.status !== 'success' || !json.sheets) throw new Error(json.message);

            el('view-sheet-select').innerHTML = json.sheets
                .map((n) => `<option value="${n}">${n}</option>`)
                .join('');

            await loadTab(url, json.sheets[0]);
        } catch (err) {
            el('view-sheet-error-msg').textContent = err.message || 'Failed to load sheet tabs.';
            setState('error');
        }
    }

    // ── Keyboard search filter ────────────────────────────────────────────────

    function applySearch(query) {
        const q = query.toLowerCase().trim();
        renderRows(q
            ? _rows.filter((row) => Object.values(row).some((v) => v.toString().toLowerCase().includes(q)))
            : _rows
        );
    }

    // ── Public API ────────────────────────────────────────────────────────────

    return {
        init() {
            el('view-sheet-btn').addEventListener('click', open);

            el('close-view-sheet-btn').addEventListener('click', () => {
                el('view-sheet-modal').style.display = 'none';
            });

            el('view-sheet-retry-btn').addEventListener('click', async () => {
                const { webAppUrl } = await Storage.get(['webAppUrl']);
                if (webAppUrl) loadTab(webAppUrl, el('view-sheet-select').value || null);
            });

            el('view-sheet-select').addEventListener('change', async () => {
                const { webAppUrl } = await Storage.get(['webAppUrl']);
                if (webAppUrl) loadTab(webAppUrl, el('view-sheet-select').value);
            });

            el('view-sheet-search').addEventListener('input', (e) => applySearch(e.target.value));
        },
    };
})();
