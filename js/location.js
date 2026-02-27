// ── Location builder panel ────────────────────────────────────────────────────

const LocationBuilder = (() => {
    const PROVINCE_LABELS = {
        'United States': 'State',
        'Canada': 'Province',
        'Australia': 'State',
        'Germany': 'State',
        'United Kingdom': 'Region',
        'India': 'State',
        'United Arab Emirates': 'Emirate',
        'Saudi Arabia': 'Region',
        'Singapore': 'Region',
        'Pakistan': 'Province',
    };

    let keywordEl, panelEl, bizEl, bizSuggestionsEl, bizHighlightIdx;
    let countryEl, provinceEl, cityEl, provinceFieldEl, cityFieldEl;
    let previewEl, previewTextEl, composeBtnEl, provinceLabelEl;

    // ── Helpers ───────────────────────────────────────────────────────────────

    function addOption(selectEl, value) {
        const opt = document.createElement('option');
        opt.value = opt.textContent = value;
        selectEl.appendChild(opt);
    }

    function resetDropdowns() {
        provinceEl.innerHTML = '<option value="">Select Province / State</option>';
        cityEl.innerHTML = '<option value="">Select City</option>';
        cityFieldEl.style.display = 'none';
        previewEl.style.display = 'none';
        composeBtnEl.disabled = true;
    }

    function updatePreview() {
        const business = bizEl.value.trim();
        const city = cityEl.value;
        const ready = business && city;
        previewTextEl.textContent = ready ? `${business} in ${city}` : '';
        previewEl.style.display = ready ? 'flex' : 'none';
        composeBtnEl.disabled = !ready;
    }

    // ── Business-type autocomplete ────────────────────────────────────────────

    function renderBizSuggestions(value) {
        bizHighlightIdx = -1;
        const q = value.toLowerCase().trim();

        if (!q) { bizSuggestionsEl.classList.remove('active'); return; }

        const matched = BUSINESS_NICHES
            .filter((n) => n.label.toLowerCase().includes(q) || n.cat.toLowerCase().includes(q))
            .slice(0, 8);

        if (!matched.length) { bizSuggestionsEl.classList.remove('active'); return; }

        bizSuggestionsEl.innerHTML = matched.map((n, i) => `
            <div class="business-suggestion-item" data-value="${n.label}" data-index="${i}">
                <span class="biz-cat-tag">${n.cat}</span> ${n.label}
            </div>
        `).join('');
        bizSuggestionsEl.classList.add('active');

        bizSuggestionsEl.querySelectorAll('.business-suggestion-item').forEach((item) => {
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                bizEl.value = item.dataset.value;
                bizSuggestionsEl.classList.remove('active');
                updatePreview();
            });
        });
    }

    function highlightBizItem(items) {
        items.forEach((el) => el.classList.remove('highlighted'));
        if (bizHighlightIdx >= 0) {
            items[bizHighlightIdx].classList.add('highlighted');
            items[bizHighlightIdx].scrollIntoView({ block: 'nearest' });
        }
    }

    // ── Bind all events ───────────────────────────────────────────────────────

    function bindEvents() {
        // Toggle panel
        document.getElementById('location-builder-btn').addEventListener('click', (e) => {
            e.preventDefault();
            const open = panelEl.style.display !== 'block';
            panelEl.style.display = open ? 'block' : 'none';
            if (open) document.getElementById('niche-library-view').style.display = 'none';
        });
        document.getElementById('close-location-btn').addEventListener('click', () => {
            panelEl.style.display = 'none';
        });

        // Business type input
        bizEl.addEventListener('input', (e) => { renderBizSuggestions(e.target.value); updatePreview(); });
        bizEl.addEventListener('blur', () => setTimeout(() => bizSuggestionsEl.classList.remove('active'), 150));
        bizEl.addEventListener('keydown', (e) => {
            const items = bizSuggestionsEl.querySelectorAll('.business-suggestion-item');
            if (!items.length) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); bizHighlightIdx = Math.min(bizHighlightIdx + 1, items.length - 1); highlightBizItem(items); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); bizHighlightIdx = Math.max(bizHighlightIdx - 1, 0); highlightBizItem(items); }
            else if (e.key === 'Enter' && bizHighlightIdx >= 0) { e.preventDefault(); bizEl.value = items[bizHighlightIdx].dataset.value; bizSuggestionsEl.classList.remove('active'); updatePreview(); }
            else if (e.key === 'Escape') bizSuggestionsEl.classList.remove('active');
        });

        // Country → Province → City cascades
        countryEl.addEventListener('change', () => {
            const country = countryEl.value;
            resetDropdowns();
            if (!country) { provinceFieldEl.style.display = 'none'; return; }

            provinceLabelEl.textContent = PROVINCE_LABELS[country] || 'Province';
            const provinces = LOCATIONS_DATA[country];
            const keys = Object.keys(provinces);

            if (keys.length === 1) {
                addOption(provinceEl, keys[0]);
                provinceEl.value = keys[0];
                provinceFieldEl.style.display = 'flex';
                provinceEl.dispatchEvent(new Event('change'));
            } else {
                keys.sort().forEach((p) => addOption(provinceEl, p));
                provinceFieldEl.style.display = 'flex';
            }
        });

        provinceEl.addEventListener('change', () => {
            const cities = (LOCATIONS_DATA[countryEl.value] || {})[provinceEl.value] || [];
            cityEl.innerHTML = '<option value="">Select City</option>';
            previewEl.style.display = 'none';
            composeBtnEl.disabled = true;
            if (!provinceEl.value) { cityFieldEl.style.display = 'none'; return; }
            cities.forEach((c) => addOption(cityEl, c));
            cityFieldEl.style.display = 'flex';
            updatePreview();
        });

        cityEl.addEventListener('change', updatePreview);

        // Compose
        composeBtnEl.addEventListener('click', () => {
            const business = bizEl.value.trim();
            const city = cityEl.value;
            if (!business || !city) return;

            keywordEl.value = `${business} in ${city}`;
            panelEl.style.display = 'none';
            document.getElementById('suggestions-list').classList.remove('active');

            keywordEl.style.cssText += ';border-color:#34d399;box-shadow:0 0 0 4px rgba(52,211,153,.2)';
            setTimeout(() => { keywordEl.style.borderColor = ''; keywordEl.style.boxShadow = ''; }, 1200);
        });
    }

    // ── Public API ────────────────────────────────────────────────────────────

    return {
        init() {
            keywordEl = document.getElementById('keyword');
            panelEl = document.getElementById('location-builder-panel');
            bizEl = document.getElementById('loc-business');
            bizSuggestionsEl = document.getElementById('business-suggestions-list');
            countryEl = document.getElementById('loc-country');
            provinceEl = document.getElementById('loc-province');
            cityEl = document.getElementById('loc-city');
            provinceFieldEl = document.getElementById('province-field');
            cityFieldEl = document.getElementById('city-field');
            previewEl = document.getElementById('loc-preview');
            previewTextEl = document.getElementById('loc-preview-text');
            composeBtnEl = document.getElementById('loc-compose-btn');
            provinceLabelEl = document.getElementById('province-label');
            bizHighlightIdx = -1;

            Object.keys(LOCATIONS_DATA).sort().forEach((c) => {
                const opt = document.createElement('option');
                opt.value = opt.textContent = c;
                countryEl.appendChild(opt);
            });

            bindEvents();
        },
    };
})();
