function isContextValid() {
    return !!chrome.runtime && !!chrome.runtime.id;
}

function safeSendMessage(message) {
    if (isContextValid()) {
        try {
            chrome.runtime.sendMessage(message, () => {
                if (chrome.runtime.lastError) {
                    // Ignore error, context might be invalidated
                }
            });
        } catch (e) {
            console.log("Failed to send message: context likely invalidated");
        }
    }
}

if (typeof window.isCancelled === 'undefined') {
    window.isCancelled = false;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (!isContextValid()) return;
        if (request.action === 'start_scraping') {
            window.isCancelled = false;
            window.shouldStop = false;
            performScraping(request.keyword, request.minRating, request.maxResults);
        } else if (request.action === 'cancel_scraping') {
            window.isCancelled = true;
        } else if (request.action === 'stop_scraping') {
            window.shouldStop = true;
        }
    });
}

async function performScraping(keyword, minRating, maxResults) {
    if (!isContextValid()) return;
    safeSendMessage({ action: 'status_update', message: 'Inserting keyword...' });

    const searchBox = document.querySelector('input[name="q"]');
    if (searchBox) {
        searchBox.value = keyword;

        const searchButton = document.querySelector('button#searchbox-searchbutton');
        if (searchButton) {
            searchButton.click();
        } else {
            searchBox.dispatchEvent(new Event('input', { bubbles: true }));
            searchBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        }

        safeSendMessage({ action: 'status_update', message: 'Waiting for results...' });
        for (let j = 0; j < 5; j++) {
            if (window.isCancelled || !isContextValid()) return;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    safeSendMessage({ action: 'status_update', message: 'Auto-scrolling results...' });

    let scrollContainer = document.querySelector('[role="feed"]');

    if (!scrollContainer) {
        safeSendMessage({ action: 'status_update', message: 'Error: Cannot find feed. Ensure search returned a list.' });
        return;
    }

    let lastHeight = 0;
    let attempts = 0;
    while (attempts < 5 && !window.isCancelled && isContextValid()) {
        scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
        // Fast wait for normal loading
        await new Promise(resolve => setTimeout(resolve, 3000));

        let currentCount = document.querySelectorAll('.hfpxzc').length;
        if (currentCount >= maxResults) {
            safeSendMessage({ action: 'status_update', message: `Goal reached! (${currentCount} listings found)` });
            break;
        }

        // Check if Google Maps explicitly says we've reached the end
        const feedText = scrollContainer.innerText || "";
        if (feedText.includes("You've reached the end of the list.")) {
            safeSendMessage({ action: 'status_update', message: `End of list reached. Found ${currentCount} listings.` });
            break;
        }

        if (scrollContainer.scrollHeight === lastHeight) {
            attempts++;
            safeSendMessage({ action: 'status_update', message: `Slow loading... Waiting 20s for more results (Attempt ${attempts}/5)` });
            // Long wait only when stuck
            await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
            attempts = 0;
            safeSendMessage({ action: 'status_update', message: `Scrolling... (${currentCount} listings found)` });
        }
        lastHeight = scrollContainer.scrollHeight;
    }

    safeSendMessage({ action: 'status_update', message: 'Starting extraction details...' });

    let results = [];
    const extractedNames = new Set();
    const allItems = Array.from(document.querySelectorAll('.hfpxzc'));
    const items = allItems.slice(0, maxResults);

    // ── Stats counters ──────────────────────────────────────────────────────
    let statPhone = 0, statWeb = 0, statEmail = 0;

    // ── Builds the live per-business status line ────────────────────────────
    function statusLine(idx, total, name, parts) {
        const label = name.length > 32 ? name.slice(0, 32) + '…' : name;
        return `[${idx}/${total}] ${label}` + (parts.length ? '  ' + parts.join('  ') : '');
    }

    for (let i = 0; i < items.length; i++) {
        if (window.isCancelled || !isContextValid()) return;
        if (window.shouldStop) {
            safeSendMessage({ action: 'status_update', message: 'Stopping and saving current results...', progress: 100 });
            break;
        }

        let item = items[i];
        let progress = Math.round(((i + 1) / items.length) * 100);

        // aria-label sometimes contains "· Visited link" or "· Open in Google Maps" etc.
        let name = (item.getAttribute('aria-label') || '').replace(/\s*·\s*(Visited link|Open in Google Maps|.*link)$/i, '').trim();


        // Find rating node relative to this item
        let parent = item.closest('.Nv2PK') || item.parentElement.parentElement;
        let ratingElement = parent.querySelector('.MW4etd');
        let rating = ratingElement ? parseFloat(ratingElement.innerText) : 0;

        let reviews = 0;
        if (ratingElement && ratingElement.nextElementSibling) {
            let matches = ratingElement.nextElementSibling.innerText.match(/\(([\d,]+)\)/);
            if (matches) reviews = matches[1].replace(/,/g, '');
        }

        let mapUrl = item.href || '';

        // Duplicate Check Condition
        if (extractedNames.has(name) || (mapUrl && extractedNames.has(mapUrl))) {
            continue;
        }

        if (rating < minRating) continue;

        // Mark as extracted
        extractedNames.add(name);
        if (mapUrl) extractedNames.add(mapUrl);

        safeSendMessage({
            action: 'status_update',
            message: statusLine(i + 1, items.length, name, []),
            progress
        });

        // Snapshot the current panel heading so we can detect when it changes
        const prevH1 = (document.querySelector('h1') || {}).innerText || '';

        item.click();

        // Poll until the panel h1 changes — this is our reliable "panel loaded" signal
        // (avoids name-matching which breaks when aria-label ≠ panel heading)
        let panelReady = false;
        for (let wait = 0; wait < 30; wait++) {
            if (window.isCancelled || !isContextValid()) break;
            await new Promise(resolve => setTimeout(resolve, 300));

            const curH1 = (document.querySelector('h1') || {}).innerText || '';
            if (curH1.trim() && curH1.trim() !== prevH1.trim()) {
                // Give the rest of the panel (phone row, website row) one extra tick
                await new Promise(resolve => setTimeout(resolve, 400));
                panelReady = true;
                break;
            }
        }

        // Fallback: if h1 never changed (same business, or no h1 at all), hard-wait
        if (!panelReady) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            panelReady = true;   // attempt read anyway
        }

        // Always start fresh — never carry over from the previous business
        let phone = '';
        let website = '';
        const liveParts = [];   // accumulates emoji badges shown in real-time

        if (panelReady) {
            // ── Phone ──────────────────────────────────────────────────────────
            safeSendMessage({
                action: 'status_update',
                message: statusLine(i + 1, items.length, name, ['📞 reading…']),
                progress
            });

            // Strategy A: button with copy tooltip (legacy Maps UI)
            const phoneBtn = document.querySelector(
                'button[data-tooltip^="Copy phone number"], button[data-item-id^="phone:"]'
            );
            if (phoneBtn) {
                phone = (phoneBtn.getAttribute('aria-label') || phoneBtn.innerText || '')
                    .replace('Phone: ', '').replace('Copy phone number', '').trim();
            }

            // Strategy B: div-based info rows (current Maps UI — class Io6YTe fdkmkc)
            if (!phone) {
                const PHONE_RE = /^\+?[\d\s\-\(\)\.]{7,20}$/;
                for (const div of document.querySelectorAll('div.Io6YTe.fdkmkc')) {
                    const text = div.innerText.trim();
                    if (PHONE_RE.test(text)) { phone = text; break; }
                }
            }

            liveParts.push(phone ? `📞 ${phone}` : '📞 —');
            safeSendMessage({
                action: 'status_update',
                message: statusLine(i + 1, items.length, name, liveParts),
                progress
            });

            // ── Website ────────────────────────────────────────────────────────
            liveParts.push('🌐 reading…');
            safeSendMessage({
                action: 'status_update',
                message: statusLine(i + 1, items.length, name, liveParts),
                progress
            });

            // Strategy A: anchor with authority data-item-id (legacy Maps UI)
            const webAnchor = document.querySelector('a[data-item-id="authority"]');
            if (webAnchor) website = webAnchor.href;

            // Strategy B: rogA2c ITvuef row = website row in current Maps UI
            if (!website) {
                const webDiv = document.querySelector(
                    'div.rogA2c.ITvuef div.Io6YTe.fdkmkc, div.rogA2c.ITvuef div.fontBodyMedium'
                );
                if (webDiv) {
                    const text = webDiv.innerText.trim();
                    if (/^[a-zA-Z0-9][a-zA-Z0-9\-.]*\.[a-zA-Z]{2,}/.test(text)) {
                        website = text.startsWith('http') ? text : `https://${text}`;
                    }
                }
            }

            // Strategy C: scan all info divs for a domain-pattern (last resort)
            if (!website) {
                const DOMAIN_RE = /^[a-zA-Z0-9][a-zA-Z0-9\-.]*\.[a-zA-Z]{2,}/;
                const NOT_PHONE = /^\+?[\d\s\-\(\)\.]+$/;
                for (const div of document.querySelectorAll('div.Io6YTe.fdkmkc')) {
                    const text = div.innerText.trim();
                    if (DOMAIN_RE.test(text) && !NOT_PHONE.test(text)) {
                        website = text.startsWith('http') ? text : `https://${text}`;
                        break;
                    }
                }
            }

            // Replace the placeholder with the result
            liveParts[liveParts.length - 1] = website
                ? `🌐 ${website.replace(/^https?:\/\//, '').slice(0, 20)}`
                : '🌐 —';
            safeSendMessage({
                action: 'status_update',
                message: statusLine(i + 1, items.length, name, liveParts),
                progress
            });
        }

        // Fallback card-text URL hint
        if (!website) {
            const cardText = parent.innerText || '';
            const hasUrl = ['.com', '.co.uk', '.org', '.net', '.io', '.pk'].some(ext => cardText.includes(ext));
            if (hasUrl) website = '(Contains URL in title/card)';
        }

        // ── Deep-scrape website for email / social links ───────────────────────
        let emails = '';
        let facebook = '';
        let linkedin = '';

        if (!window.isCancelled && isContextValid() && website && website.startsWith('http')) {
            liveParts.push('📧 scraping…');
            safeSendMessage({
                action: 'status_update',
                message: statusLine(i + 1, items.length, name, liveParts),
                progress
            });

            try {
                const deepData = await new Promise((resolve) => {
                    if (!isContextValid()) { resolve({ emails: '', facebook: '', linkedin: '' }); return; }
                    chrome.runtime.sendMessage({ action: 'scrape_website', url: website }, (response) => {
                        if (chrome.runtime.lastError) resolve({ emails: '', facebook: '', linkedin: '' });
                        else resolve(response || { emails: '', facebook: '', linkedin: '' });
                    });
                });
                emails = deepData.emails;
                facebook = deepData.facebook;
                linkedin = deepData.linkedin;
            } catch (e) { }

            // Replace placeholder with result
            liveParts[liveParts.length - 1] = emails
                ? `📧 ${emails.split(',')[0].trim().slice(0, 22)}`
                : '📧 —';
        }

        // ── Update stats ───────────────────────────────────────────────────────
        if (phone) statPhone++;
        if (website && !website.startsWith('(')) statWeb++;
        if (emails) statEmail++;

        // ── Final per-business confirmation ────────────────────────────────────
        safeSendMessage({
            action: 'status_update',
            message: statusLine(i + 1, items.length, name, liveParts) + '  ✓',
            progress
        });

        results.push({
            name,
            rating,
            reviews,
            url: mapUrl,
            contact: phone,
            website,
            emails,
            facebook,
            linkedin,
        });
    }

    // ── Final stats summary ────────────────────────────────────────────────────
    const n = results.length;
    safeSendMessage({
        action: 'scraping_complete',
        data: results,
        stats: { total: n, phone: statPhone, web: statWeb, email: statEmail }
    });
}
