// ── Niche library panel + keyword autocomplete ────────────────────────────────

const Library = (() => {
    const SAVE_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    let keywordEl, suggestionsEl, libraryViewEl, saveQueryBtnEl;

    // ── Library panel ─────────────────────────────────────────────────────────

    async function populate() {
        const content = document.getElementById('library-content');
        const { customQueries = [] } = await Storage.get(['customQueries']);
        const groups = {};

        if (customQueries.length) groups['MY SAVED SEARCHES'] = customQueries;
        businessSuggestions.forEach((s) => {
            groups[s.cat] = groups[s.cat] || [];
            groups[s.cat].push(s.text);
        });

        content.innerHTML = Object.entries(groups).map(([cat, items]) => `
            <div class="library-group">
                <div class="library-group-title">${cat}</div>
                <div class="library-items">
                    ${items.map((text) => `
                        <div class="library-item" data-value="${text}">
                            ${text}
                            ${cat === 'MY SAVED SEARCHES'
                ? `<span class="delete-query" data-query="${text}">&times;</span>`
                : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        content.querySelectorAll('.library-item').forEach((item) => {
            item.addEventListener('click', async (e) => {
                if (e.target.classList.contains('delete-query')) {
                    e.stopPropagation();
                    const { customQueries: saved = [] } = await Storage.get(['customQueries']);
                    await Storage.set({ customQueries: saved.filter((q) => q !== e.target.dataset.query) });
                    populate();
                    return;
                }
                keywordEl.value = item.dataset.value;
                libraryViewEl.style.display = 'none';
            });
        });
    }

    function bindLibraryPanel() {
        document.getElementById('browse-library-btn').addEventListener('click', (e) => {
            e.preventDefault();
            const open = libraryViewEl.style.display !== 'block';
            libraryViewEl.style.display = open ? 'block' : 'none';
            if (open) populate();
        });
        document.getElementById('close-library-btn').addEventListener('click', () => {
            libraryViewEl.style.display = 'none';
        });
    }

    function bindSaveQuery() {
        saveQueryBtnEl.addEventListener('click', async () => {
            const query = keywordEl.value.trim();
            if (!query) return;

            const { customQueries = [] } = await Storage.get(['customQueries']);
            if (customQueries.includes(query)) return;

            await Storage.set({ customQueries: [...customQueries, query] });

            const orig = saveQueryBtnEl.innerHTML;
            saveQueryBtnEl.innerHTML = SAVE_ICON;
            setTimeout(() => { saveQueryBtnEl.innerHTML = orig; }, 1500);

            if (libraryViewEl.style.display === 'block') populate();
        });
    }

    // ── Keyword suggestions dropdown ──────────────────────────────────────────

    function bindKeywordSuggestions() {
        keywordEl.addEventListener('input', () => {
            const val = keywordEl.value.toLowerCase();
            if (!val) { suggestionsEl.classList.remove('active'); return; }

            const matches = businessSuggestions
                .filter((s) => s.text.toLowerCase().includes(val) || s.cat.toLowerCase().includes(val))
                .slice(0, 8);

            if (!matches.length) { suggestionsEl.classList.remove('active'); return; }

            suggestionsEl.innerHTML = matches.map((s) => `
                <div class="suggestion-item" data-value="${s.text}">
                    <span class="category">${s.cat}</span>
                    <span class="text">${s.text}</span>
                </div>
            `).join('');
            suggestionsEl.classList.add('active');
        });

        suggestionsEl.addEventListener('click', (e) => {
            const item = e.target.closest('.suggestion-item');
            if (item) { keywordEl.value = item.dataset.value; suggestionsEl.classList.remove('active'); }
        });

        document.addEventListener('click', (e) => {
            if (!keywordEl.contains(e.target) && !suggestionsEl.contains(e.target)) {
                suggestionsEl.classList.remove('active');
            }
        });
    }

    // ── Public API ────────────────────────────────────────────────────────────

    return {
        init() {
            keywordEl = document.getElementById('keyword');
            suggestionsEl = document.getElementById('suggestions-list');
            libraryViewEl = document.getElementById('niche-library-view');
            saveQueryBtnEl = document.getElementById('save-query-btn');

            bindLibraryPanel();
            bindSaveQuery();
            bindKeywordSuggestions();
        },
    };
})();
