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

    for (let i = 0; i < items.length; i++) {
        if (window.isCancelled || !isContextValid()) return;
        if (window.shouldStop) {
            safeSendMessage({ action: 'status_update', message: 'Stopping and saving current results...', progress: 100 });
            break;
        }

        let item = items[i];
        let progress = Math.round(((i + 1) / items.length) * 100);

        let name = item.getAttribute('aria-label') || '';

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
            message: `Extracting ${i + 1}/${items.length}: ${name}`,
            progress: progress
        });

        // Click to open side panel to get website/phone
        item.click();

        for (let j = 0; j < 3; j++) {
            if (window.isCancelled || !isContextValid()) break;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        let phone = '';
        let website = '';

        let webButton = document.querySelector('a[data-item-id="authority"]');
        if (webButton) {
            website = webButton.href;
        }

        let phoneButtons = document.querySelectorAll('button[data-tooltip^="Copy phone number"], button[data-item-id^="phone:"]');
        if (phoneButtons.length > 0) {
            phone = phoneButtons[0].getAttribute('aria-label') || phoneButtons[0].innerText || '';
            phone = phone.replace('Phone: ', '').replace('Copy phone number', '').trim();
        }

        // If no phone or website found on panel, fall back to checking if the card text has something looking like a website
        if (!website) {
            let infoText = parent.innerText || '';
            if (infoText.includes('.com') || infoText.includes('.co.uk') || infoText.includes('.org') || infoText.includes('.net')) {
                website = "(Contains URL in title/card)";
            }
        }

        // If we found a website, ask the background script to do a deep scrape
        let emails = "";
        let facebook = "";
        let linkedin = "";

        if (!window.isCancelled && isContextValid() && website && website.startsWith('http')) {
            safeSendMessage({ action: 'status_update', message: `Deep scraping website for ${name}...` });
            try {
                const deepData = await new Promise((resolve) => {
                    if (!isContextValid()) {
                        resolve({ emails: '', facebook: '', linkedin: '' });
                        return;
                    }
                    chrome.runtime.sendMessage({ action: 'scrape_website', url: website }, (response) => {
                        if (chrome.runtime.lastError) {
                            resolve({ emails: '', facebook: '', linkedin: '' });
                        } else {
                            resolve(response || { emails: '', facebook: '', linkedin: '' });
                        }
                    });
                });
                emails = deepData.emails;
                facebook = deepData.facebook;
                linkedin = deepData.linkedin;
            } catch (e) { }
        }

        results.push({
            name: name,
            rating: rating,
            reviews: reviews,
            url: mapUrl,
            contact: phone,
            website: website,
            emails: emails,
            facebook: facebook,
            linkedin: linkedin
        });
    }

    safeSendMessage({
        action: 'scraping_complete',
        data: results
    });
}
