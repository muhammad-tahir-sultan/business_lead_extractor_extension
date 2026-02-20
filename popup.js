const businessSuggestions = [
    // USA
    { text: "Dentist in New York", cat: "USA" },
    { text: "Restaurant in Los Angeles", cat: "USA" },
    { text: "Real Estate Agency in Miami", cat: "USA" },
    { text: "Software House in San Francisco", cat: "USA" },
    { text: "Gym in Chicago", cat: "USA" },
    { text: "Lawyer in Houston", cat: "USA" },
    { text: "E-commerce Store in Seattle", cat: "USA" },
    { text: "Spa in Las Vegas", cat: "USA" },
    { text: "Auto Repair in Dallas", cat: "USA" },
    { text: "Medical Clinic in Boston", cat: "USA" },
    // UK
    { text: "Dentist in London", cat: "UK" },
    { text: "Restaurant in Manchester", cat: "UK" },
    { text: "Real Estate Agency in Birmingham", cat: "UK" },
    { text: "Software House in Edinburgh", cat: "UK" },
    { text: "Gym in Glasgow", cat: "UK" },
    { text: "Lawyer in Leeds", cat: "UK" },
    { text: "E-commerce Store in Bristol", cat: "UK" },
    { text: "Spa in Liverpool", cat: "UK" },
    { text: "Auto Repair in Newcastle", cat: "UK" },
    { text: "Medical Clinic in Sheffield", cat: "UK" },
    // Germany
    { text: "Dentist in Berlin", cat: "DE" },
    { text: "Restaurant in Munich", cat: "DE" },
    { text: "Real Estate Agency in Frankfurt", cat: "DE" },
    { text: "Software House in Hamburg", cat: "DE" },
    { text: "Gym in Cologne", cat: "DE" },
    { text: "Lawyer in Stuttgart", cat: "DE" },
    { text: "E-commerce Store in Düsseldorf", cat: "DE" },
    { text: "Spa in Leipzig", cat: "DE" },
    { text: "Auto Repair in Dortmund", cat: "DE" },
    { text: "Medical Clinic in Bremen", cat: "DE" },
    // Dubai
    { text: "Dentist in Dubai", cat: "UAE" },
    { text: "Restaurant in Dubai Marina", cat: "UAE" },
    { text: "Real Estate Agency in Downtown Dubai", cat: "UAE" },
    { text: "Software House in Dubai Silicon Oasis", cat: "UAE" },
    { text: "Gym in Jumeirah", cat: "UAE" },
    { text: "Lawyer in Business Bay", cat: "UAE" },
    { text: "E-commerce Store in Dubai Internet City", cat: "UAE" },
    { text: "Spa in Palm Jumeirah", cat: "UAE" },
    { text: "Auto Repair in Al Quoz", cat: "UAE" },
    { text: "Medical Clinic in Deira", cat: "UAE" },
    // Pakistan
    { text: "Software House in Karachi", cat: "PK" },
    { text: "Software House in Lahore", cat: "PK" },
    { text: "Software House in Islamabad", cat: "PK" },
    { text: "Dentist in Karachi", cat: "PK" },
    { text: "Dentist in Lahore", cat: "PK" },
    { text: "Restaurant in Islamabad", cat: "PK" },
    { text: "Real Estate Agency in Lahore", cat: "PK" },
    { text: "Gym in Karachi", cat: "PK" },
    { text: "E-commerce Store in Islamabad", cat: "PK" },
    { text: "Spa in Lahore", cat: "PK" },
    // Additional 100+ Nichies for Web Dev/SEO
    { text: "Roofing Contractor in New Jersey", cat: "SEO" },
    { text: "HVAC Services in Florida", cat: "SEO" },
    { text: "Plumber in London", cat: "SEO" },
    { text: "Cosmetic Surgeon in Dubai", cat: "SEO" },
    { text: "Orthodontist in Berlin", cat: "SEO" },
    { text: "Solar Panel Installer in California", cat: "SEO" },
    { text: "Landscaping Company in Texas", cat: "SEO" },
    { text: "Interior Designer in Paris", cat: "SEO" },
    { text: "Wedding Photographer in Rome", cat: "SEO" },
    { text: "Pet Grooming in Sydney", cat: "SEO" },
    { text: "Veterinary Clinic in Toronto", cat: "SEO" },
    { text: "Accounting Firm in Tokyo", cat: "SEO" },
    { text: "Financial Advisor in Zurich", cat: "SEO" },
    { text: "Personal Trainer in Vancouver", cat: "SEO" },
    { text: "Pest Control in Phoenix", cat: "SEO" },
    { text: "Moving Company in Denver", cat: "SEO" },
    { text: "Locksmith in Chicago", cat: "SEO" },
    { text: "Yoga Studio in Bali", cat: "SEO" },
    { text: "Home Security in Atlanta", cat: "SEO" },
    { text: "Window Cleaning in Austin", cat: "SEO" },
    { text: "Electrician in Manchester", cat: "SEO" },
    { text: "Painter in Birmingham", cat: "SEO" },
    { text: "Pool Cleaning in Miami", cat: "SEO" },
    { text: "Tree Removal in Seattle", cat: "SEO" },
    { text: "Family Lawyer in Houston", cat: "SEO" },
    { text: "Personal Injury Lawyer in NY", cat: "SEO" },
    { text: "Chiropractor in Portland", cat: "SEO" },
    { text: "Physical Therapist in Calgary", cat: "SEO" },
    { text: "Acupuncture in San Francisco", cat: "SEO" },
    { text: "Dermatologist in Barcelona", cat: "SEO" },
    { text: "Home Health Care in Florida", cat: "SEO" },
    { text: "Storage Units in Vegas", cat: "SEO" },
    { text: "Janitorial Services in DC", cat: "SEO" },
    { text: "Car Detailing in Atlanta", cat: "SEO" },
    { text: "Auto Body Shop in Detroit", cat: "SEO" },
    { text: "Dry Cleaning in Upper East Side", cat: "SEO" },
    { text: "Flower Shop in San Jose", cat: "SEO" },
    { text: "Dog Walker in Manhattan", cat: "SEO" },
    { text: "Banquet Hall in Karachi", cat: "SEO" },
    { text: "Printing Service in London", cat: "SEO" },
    // 100+ Additional High-Intent Business Niches
    { text: "Car Rental in Dubai", cat: "UAE" },
    { text: "Luxury Watch Repair in New York", cat: "PREMIUM" },
    { text: "Yacht Charter in Miami", cat: "PREMIUM" },
    { text: "Private Jet Rental in London", cat: "PREMIUM" },
    { text: "Catering Service in Chicago", cat: "EVENTS" },
    { text: "Bakery in Paris", cat: "FOOD" },
    { text: "Coffee Shop in Seattle", cat: "FOOD" },
    { text: "Wine Shop in Napa Valley", cat: "FOOD" },
    { text: "Pet Hotel in Los Angeles", cat: "PETS" },
    { text: "Equestrian Center in Kentucky", cat: "PETS" },
    { text: "Antique Dealer in Berlin", cat: "RETAIL" },
    { text: "Art Gallery in Chelsea NY", cat: "RETAIL" },
    { text: "Boutique Hotel in Santorini", cat: "TRAVEL" },
    { text: "Surf School in Bali", cat: "TRAVEL" },
    { text: "Ski Resort in Aspen", cat: "TRAVEL" },
    { text: "Wedding Planner in Rome", cat: "EVENTS" },
    { text: "Event Decorator in Dubai", cat: "EVENTS" },
    { text: "Party Rental in Toronto", cat: "EVENTS" },
    { text: "DJ Services in Ibiza", cat: "EVENTS" },
    { text: "Limousine Service in Vegas", cat: "TRAVEL" },
    { text: "Co-working Space in Berlin", cat: "B2B" },
    { text: "Marketing Agency in London", cat: "B2B" },
    { text: "Consulting Firm in Singapore", cat: "B2B" },
    { text: "Security Guard Service in Houston", cat: "B2B" },
    { text: "Staffing Agency in NY", cat: "B2B" },
    { text: "Translation Service in Brussels", cat: "B2B" },
    { text: "Custom Tailor in Hong Kong", cat: "RETAIL" },
    { text: "Jewelry Store in Hatton Garden", cat: "RETAIL" },
    { text: "Watch Store in Geneva", cat: "RETAIL" },
    { text: "Furniture Store in Milan", cat: "RETAIL" },
    { text: "Bicycle Shop in Amsterdam", cat: "RETAIL" },
    { text: "Musical Instrument Store in Nashville", cat: "RETAIL" },
    { text: "Dance Studio in Los Angeles", cat: "ARTS" },
    { text: "Acting School in NY", cat: "ARTS" },
    { text: "Music School in Vienna", cat: "ARTS" },
    { text: "Martial Arts School in Tokyo", cat: "SPORTS" },
    { text: "Tennis Club in Wimbledon", cat: "SPORTS" },
    { text: "Golf Course in Scotland", cat: "SPORTS" },
    { text: "Personal Chef in Beverly Hills", cat: "FOOD" },
    { text: "Meal Prep Service in London", cat: "FOOD" },
    { text: "Juice Bar in Santa Monica", cat: "FOOD" },
    { text: "Organic Farm in Vermont", cat: "B2B" },
    { text: "Sustainable Clothing in Portland", cat: "RETAIL" },
    { text: "Renewable Energy in Munich", cat: "B2B" },
    { text: "App Development in Bangalore", cat: "TECH" },
    { text: "Cybersecurity Firm in Tel Aviv", cat: "TECH" },
    { text: "AI Startup in San Francisco", cat: "TECH" },
    { text: "Data Center in Northern Virginia", cat: "TECH" },
    { text: "3D Printing in Hamburg", cat: "TECH" },
    { text: "Drone Photography in Sydney", cat: "TECH" },
    { text: "Recording Studio in London", cat: "ARTS" },
    { text: "Animation Studio in Tokyo", cat: "ARTS" },
    { text: "Graphic Design in Barcelona", cat: "ARTS" },
    { text: "Video Production in NY", cat: "ARTS" },
    { text: "Architectural Firm in Chicago", cat: "B2B" },
    { text: "Construction Company in Dubai", cat: "B2B" },
    { text: "Roofing in Florida", cat: "HOME" },
    { text: "Landscaping in Arizona", cat: "HOME" },
    { text: "Interior Design in Milan", cat: "HOME" },
    { text: "Smart Home Installation in Austin", cat: "HOME" },
    { text: "Solar Energy in California", cat: "HOME" },
    { text: "Handyman in London", cat: "HOME" },
    { text: "House Cleaning in NY", cat: "HOME" },
    { text: "Carpet Cleaning in Melbourne", cat: "HOME" },
    { text: "Plumbing in Manchester", cat: "HOME" },
    { text: "HVAC in Texas", cat: "HOME" },
    { text: "Electrician in Birmingham", cat: "HOME" },
    { text: "Pest Control in Sydney", cat: "HOME" },
    { text: "Locksmith in Toronto", cat: "HOME" },
    { text: "Moving Company in Vancouver", cat: "HOME" },
    { text: "Storage Facility in Arizona", cat: "B2B" },
    { text: "Self-Storage in UK", cat: "B2B" },
    { text: "Car Wash in Miami", cat: "AUTO" },
    { text: "Auto Dealership in Detroit", cat: "AUTO" },
    { text: "Tire Shop in Berlin", cat: "AUTO" },
    { text: "Motorcycle Shop in Rome", cat: "AUTO" },
    { text: "Boat Repair in Florida", cat: "AUTO" },
    { text: "Trucking Company in Ohio", cat: "B2B" },
    { text: "Logistics Company in Dubai", cat: "B2B" },
    { text: "Warehouse in New Jersey", cat: "B2B" },
    { text: "Shipyard in Hamburg", cat: "B2B" },
    { text: "Dairy Farm in Wisconsin", cat: "B2B" },
    { text: "Vineyard in Tuscany", cat: "FOOD" },
    { text: "Bakery in Berlin", cat: "FOOD" },
    { text: "Butcher Shop in London", cat: "FOOD" },
    { text: "Seafood Market in Seattle", cat: "FOOD" },
    { text: "Flower Shop in Paris", cat: "RETAIL" },
    { text: "Gift Shop in Venice", cat: "RETAIL" },
    { text: "Bookstore in Oxford", cat: "RETAIL" },
    { text: "Toy Store in NY", cat: "RETAIL" },
    { text: "Hobby Shop in Tokyo", cat: "RETAIL" },
    { text: "Vape Shop in LA", cat: "RETAIL" },
    { text: "Dispensary in Denver", cat: "RETAIL" },
    { text: "Tattoo Parlor in Berlin", cat: "ARTS" },
    { text: "Piercing Studio in London", cat: "ARTS" },
    { text: "Hair Salon in Paris", cat: "BEAUTY" },
    { text: "Barber Shop in Brooklyn", cat: "BEAUTY" },
    { text: "Nail Salon in Tokyo", cat: "BEAUTY" },
    { text: "Spa in Bali", cat: "BEAUTY" },
    { text: "Massage Therapy in Zurich", cat: "HEALTH" }
];

let scrapedData = [];

// Initialize UI from background state
document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({ action: 'get_status' }, (state) => {
        if (state) {
            updateUI(state);
        }
    });

    const keywordInput = document.getElementById('keyword');
    const suggestionsList = document.getElementById('suggestions-list');
    const libraryBtn = document.getElementById('browse-library-btn');
    const libraryView = document.getElementById('niche-library-view');
    const closeLibraryBtn = document.getElementById('close-library-btn');
    const saveQueryBtn = document.getElementById('save-query-btn');

    libraryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isVisible = libraryView.style.display === 'block';
        libraryView.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) populateLibrary();
    });

    closeLibraryBtn.addEventListener('click', () => {
        libraryView.style.display = 'none';
    });

    saveQueryBtn.addEventListener('click', () => {
        const query = keywordInput.value.trim();
        if (!query) return;

        chrome.storage.local.get(['customQueries'], (result) => {
            const queries = result.customQueries || [];
            if (!queries.includes(query)) {
                queries.push(query);
                chrome.storage.local.set({ customQueries: queries }, () => {
                    const originalText = saveQueryBtn.innerHTML;
                    saveQueryBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                    setTimeout(() => {
                        saveQueryBtn.innerHTML = originalText;
                    }, 1500);
                    if (libraryView.style.display === 'block') populateLibrary();
                });
            }
        });
    });

    function populateLibrary() {
        const content = document.getElementById('library-content');

        chrome.storage.local.get(['customQueries'], (result) => {
            const customQueries = result.customQueries || [];
            const groups = {};

            // Add custom queries group first
            if (customQueries.length > 0) {
                groups['MY SAVED SEARCHES'] = customQueries;
            }

            businessSuggestions.forEach(s => {
                if (!groups[s.cat]) groups[s.cat] = [];
                groups[s.cat].push(s.text);
            });

            content.innerHTML = Object.entries(groups).map(([cat, items]) => `
                <div class="library-group">
                    <div class="library-group-title">${cat}</div>
                    <div class="library-items">
                        ${items.map(text => `
                            <div class="library-item" data-value="${text}">
                                ${text}
                                ${cat === 'MY SAVED SEARCHES' ? '<span class="delete-query" data-query="' + text + '">&times;</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');

            // Add click events to items
            content.querySelectorAll('.library-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (e.target.classList.contains('delete-query')) {
                        e.stopPropagation();
                        const queryToDelete = e.target.dataset.query;
                        chrome.storage.local.get(['customQueries'], (res) => {
                            const updated = (res.customQueries || []).filter(q => q !== queryToDelete);
                            chrome.storage.local.set({ customQueries: updated }, () => {
                                populateLibrary();
                            });
                        });
                        return;
                    }
                    keywordInput.value = item.dataset.value;
                    libraryView.style.display = 'none';
                });
            });
        });
    }

    keywordInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        if (!value) {
            suggestionsList.classList.remove('active');
            return;
        }

        const filtered = businessSuggestions.filter(s =>
            s.text.toLowerCase().includes(value) || s.cat.toLowerCase().includes(value)
        ).slice(0, 8);

        if (filtered.length > 0) {
            suggestionsList.innerHTML = filtered.map(s => `
                <div class="suggestion-item" data-value="${s.text}">
                    <span class="category">${s.cat}</span>
                    <span class="text">${s.text}</span>
                </div>
            `).join('');
            suggestionsList.classList.add('active');
        } else {
            suggestionsList.classList.remove('active');
        }
    });

    suggestionsList.addEventListener('click', (e) => {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            keywordInput.value = item.dataset.value;
            suggestionsList.classList.remove('active');
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!keywordInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.classList.remove('active');
        }
    });
});

function updateUI(state) {
    const statusEl = document.getElementById('status');
    const startBtn = document.getElementById('start-btn');
    const controls = document.getElementById('scraping-controls');
    const progressWrapper = document.getElementById('progress-wrapper');
    const progressBar = document.getElementById('progress-bar-fill');
    const progressStats = document.getElementById('progress-stats');

    statusEl.innerText = state.status;
    scrapedData = state.data || [];

    if (state.isScraping) {
        startBtn.style.display = 'none';
        controls.style.display = 'flex';
        progressWrapper.style.display = 'block';
        progressBar.style.width = `${state.progress || 0}%`;
        progressStats.innerText = `${state.progress || 0}% complete`;
        document.body.classList.add('scraping');
    } else {
        startBtn.style.display = 'flex';
        controls.style.display = 'none';
        progressWrapper.style.display = 'none';
        document.body.classList.remove('scraping');
    }

    if (state.keyword && !document.getElementById('keyword').value) {
        document.getElementById('keyword').value = state.keyword;
    }
    if (state.minRating) document.getElementById('min-rating').value = state.minRating;

    // Enable export buttons if data exists
    const hasData = scrapedData.length > 0;
    document.getElementById('export-csv-btn').disabled = !hasData;
    document.getElementById('export-excel-btn').disabled = !hasData;
    document.getElementById('append-sheet-btn').disabled = !hasData;
    document.getElementById('new-sheet-btn').disabled = !hasData;
}

document.getElementById('start-btn').addEventListener('click', async () => {
    const keywordInput = document.getElementById('keyword');
    const suggestionsList = document.getElementById('suggestions-list');
    const keyword = keywordInput.value;
    const minRating = parseFloat(document.getElementById('min-rating').value) || 0;

    if (!keyword) {
        alert("Please enter a keyword.");
        return;
    }

    suggestionsList.classList.remove('active');

    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes("google.com/maps") && !tab.url.includes("google.co.uk/maps")) {
        alert("Please open Google Maps in the active tab first.");
        return;
    }

    // Notify background that we're starting with the tabId
    chrome.runtime.sendMessage({
        action: 'start_scraping',
        keyword: keyword,
        minRating: minRating,
        tabId: tab.id
    });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    }, () => {
        chrome.tabs.sendMessage(tab.id, {
            action: 'start_scraping',
            keyword: keyword,
            minRating: minRating
        }).catch((err) => {
            console.log("Could not start scraping in tab", err);
        });
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ui_update') {
        updateUI(request.state);
    }
});

document.getElementById('cancel-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'cancel_scraping' });
});

document.getElementById('stop-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stop_scraping' });
});

document.getElementById('export-csv-btn').addEventListener('click', () => {
    if (scrapedData.length === 0) return;

    // CSV Headers
    const headers = [
        'name', 'rating', 'reviews', 'url', 'website', 'phone', 'email', 'text_snippet',
        'Sent Status', 'Next Follow-Up Date', 'Follow-Up Stage', 'date_scraped',
        'source', 'notes', 'Linkedin URL', 'Facebook'
    ];

    // Convert array of objects to CSV format
    const csvContent = [
        headers.join(','),
        ...scrapedData.map(item => [
            `"${(item.name || '').replace(/"/g, '""')}"`,
            `"${item.rating || ''}"`,
            `"${item.reviews || ''}"`,
            `"${(item.url || '').replace(/"/g, '""')}"`,
            `"${(item.website || '').replace(/"/g, '""')}"`,
            `"${(item.contact || '').replace(/"/g, '""')}"`,
            `"${(item.emails || '').replace(/"/g, '""')}"`,
            `""`, // text_snippet
            `""`, // Sent Status
            `""`, // Next Follow-Up Date
            `""`, // Follow-Up Stage
            `"${new Date().toISOString().split('T')[0]}"`, // date_scraped
            `"Google Maps Scraper"`, // source
            `""`, // notes
            `"${(item.linkedin || '').replace(/"/g, '""')}"`,
            `"${(item.facebook || '').replace(/"/g, '""')}"`
        ].join(','))
    ].join('\\n');

    // Create a Blob and trigger the download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
        url: url,
        filename: `maps_leads_${new Date().getTime()}.csv`
    });
});

document.getElementById('export-excel-btn').addEventListener('click', () => {
    if (scrapedData.length === 0) return;

    const data = scrapedData.map(item => ({
        'name': item.name || '',
        'rating': item.rating || '',
        'reviews': item.reviews || '',
        'url': item.url || '',
        'website': item.website || '',
        'phone': item.contact || '',
        'email': item.emails || '',
        'text_snippet': '',
        'Sent Status': '',
        'Next Follow-Up Date': '',
        'Follow-Up Stage': '',
        'date_scraped': new Date().toISOString().split('T')[0],
        'source': 'Google Maps Scraper',
        'notes': '',
        'Linkedin URL': item.linkedin || '',
        'Facebook': item.facebook || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

    // Write the workbook to a binary array
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create a Blob and trigger download
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
        url: url,
        filename: `maps_leads_${new Date().getTime()}.xlsx`
    });
});

async function sendToGoogleSheet(actionStr) {
    if (scrapedData.length === 0) return;

    chrome.storage.local.get(['webAppUrl'], async (result) => {
        let webAppUrl = result.webAppUrl;

        if (!webAppUrl) {
            webAppUrl = prompt("Please enter your deployed Google Apps Script Web App URL:", "https://script.google.com/macros/s/AKfycbw6CR94M7pfTQlEgXpYdzxOsf9xcVt0VORG7KqCCuNN-E_5x1vVoL_xC16HG4XufUGcJw/exec");
            if (webAppUrl) {
                chrome.storage.local.set({ webAppUrl: webAppUrl });
            } else {
                return; // User cancelled prompt
            }
        }

        const data = scrapedData.map(item => ({
            'name': item.name || '',
            'rating': item.rating || '',
            'reviews': item.reviews || '',
            'url': item.url || '',
            'website': item.website || '',
            'phone': item.contact || '',
            'email': item.emails || '',
            'text_snippet': '',
            'Sent Status': '',
            'Next Follow-Up Date': '',
            'Follow-Up Stage': '',
            'date_scraped': new Date().toISOString().split('T')[0],
            'source': 'Google Maps Scraper',
            'notes': '',
            'Linkedin URL': item.linkedin || '',
            'Facebook': item.facebook || ''
        }));

        document.getElementById('status').innerText = 'Sending to Sheet...';
        document.getElementById('append-sheet-btn').disabled = true;
        document.getElementById('new-sheet-btn').disabled = true;

        const payload = {
            action: actionStr,
            data: data
        };

        try {
            const response = await fetch(webAppUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
            });
            const resultData = await response.json();

            if (resultData.status === 'success') {
                document.getElementById('status').innerHTML = `Upload Complete! Added ${data.length} rows. <a href="${resultData.url}" target="_blank" style="color: #6366f1;">Open Sheet</a>`;
            } else {
                throw new Error("API returned error: " + resultData.message);
            }
        } catch (error) {
            console.error('Error posting to sheet:', error);

            // Allow them to update URL if there is an error
            if (confirm("Error sending to sheet. Would you like to update your Web App URL?")) {
                let newUrl = prompt("Please enter the new Apps Script Web App URL:", webAppUrl);
                if (newUrl) {
                    chrome.storage.local.set({ webAppUrl: newUrl });
                    document.getElementById('status').innerText = 'URL updated. Try sending again.';
                } else {
                    document.getElementById('status').innerText = 'Send Failed.';
                }
            } else {
                document.getElementById('status').innerText = 'Send Failed.';
            }
        } finally {
            document.getElementById('append-sheet-btn').disabled = false;
            document.getElementById('new-sheet-btn').disabled = false;
        }
    });
}

document.getElementById('append-sheet-btn').addEventListener('click', () => {
    sendToGoogleSheet('append');
});

document.getElementById('new-sheet-btn').addEventListener('click', () => {
    sendToGoogleSheet('new_tab');
});
