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
    // Pakistan — Software Houses (Top 20 Cities)
    { text: "Software House in Karachi", cat: "PK" },
    { text: "Software House in Lahore", cat: "PK" },
    { text: "Software House in Islamabad", cat: "PK" },
    { text: "Software House in Rawalpindi", cat: "PK" },
    { text: "Software House in Faisalabad", cat: "PK" },
    { text: "Software House in Multan", cat: "PK" },
    { text: "Software House in Peshawar", cat: "PK" },
    { text: "Software House in Quetta", cat: "PK" },
    { text: "Software House in Sialkot", cat: "PK" },
    { text: "Software House in Gujranwala", cat: "PK" },
    { text: "Software House in Hyderabad", cat: "PK" },
    { text: "Software House in Sargodha", cat: "PK" },
    { text: "Software House in Bahawalpur", cat: "PK" },
    { text: "Software House in Sukkur", cat: "PK" },
    { text: "Software House in Abbottabad", cat: "PK" },
    { text: "Software House in Mardan", cat: "PK" },
    { text: "Software House in Gujrat", cat: "PK" },
    { text: "Software House in Sahiwal", cat: "PK" },
    { text: "Software House in Larkana", cat: "PK" },
    { text: "Software House in Sheikhupura", cat: "PK" },
    // Pakistan — Other niches
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

// Business type niches for Location Builder autocomplete
const BUSINESS_NICHES = [
    // Tech
    { label: "Software House", cat: "Tech" },
    { label: "Web Development Agency", cat: "Tech" },
    { label: "Mobile App Development", cat: "Tech" },
    { label: "IT Consulting Firm", cat: "Tech" },
    { label: "Cybersecurity Company", cat: "Tech" },
    { label: "Digital Marketing Agency", cat: "Tech" },
    { label: "SEO Agency", cat: "Tech" },
    { label: "AI Startup", cat: "Tech" },
    { label: "Data Analytics Firm", cat: "Tech" },
    { label: "Cloud Solutions Provider", cat: "Tech" },
    { label: "E-commerce Agency", cat: "Tech" },
    { label: "UI/UX Design Studio", cat: "Tech" },
    { label: "Game Development Studio", cat: "Tech" },
    { label: "Blockchain Company", cat: "Tech" },
    { label: "Drone Services Company", cat: "Tech" },
    // Health
    { label: "Dentist", cat: "Health" },
    { label: "Medical Clinic", cat: "Health" },
    { label: "Pharmacy", cat: "Health" },
    { label: "Physiotherapy Clinic", cat: "Health" },
    { label: "Chiropractic Clinic", cat: "Health" },
    { label: "Dermatologist", cat: "Health" },
    { label: "Eye Clinic", cat: "Health" },
    { label: "Orthodontist", cat: "Health" },
    { label: "Pediatric Clinic", cat: "Health" },
    { label: "Plastic Surgery Clinic", cat: "Health" },
    { label: "Mental Health Clinic", cat: "Health" },
    { label: "Veterinary Clinic", cat: "Health" },
    { label: "Home Health Care", cat: "Health" },
    { label: "Acupuncture Clinic", cat: "Health" },
    { label: "Nutrition Consultant", cat: "Health" },
    // Legal & Finance
    { label: "Law Firm", cat: "Legal" },
    { label: "Family Lawyer", cat: "Legal" },
    { label: "Immigration Lawyer", cat: "Legal" },
    { label: "Personal Injury Lawyer", cat: "Legal" },
    { label: "Accounting Firm", cat: "Finance" },
    { label: "Tax Consultancy", cat: "Finance" },
    { label: "Financial Advisor", cat: "Finance" },
    { label: "Insurance Agency", cat: "Finance" },
    { label: "Mortgage Broker", cat: "Finance" },
    { label: "Investment Firm", cat: "Finance" },
    // Real Estate
    { label: "Real Estate Agency", cat: "Property" },
    { label: "Property Management", cat: "Property" },
    { label: "Interior Design Studio", cat: "Property" },
    { label: "Architectural Firm", cat: "Property" },
    { label: "Construction Company", cat: "Property" },
    { label: "Home Renovation Company", cat: "Property" },
    // Education
    { label: "Tutoring Center", cat: "Education" },
    { label: "Language School", cat: "Education" },
    { label: "Driving School", cat: "Education" },
    { label: "Music School", cat: "Education" },
    { label: "Coding Bootcamp", cat: "Education" },
    { label: "Montessori School", cat: "Education" },
    { label: "Vocational Training Center", cat: "Education" },
    // Food & Beverage
    { label: "Restaurant", cat: "Food" },
    { label: "Cafe", cat: "Food" },
    { label: "Bakery", cat: "Food" },
    { label: "Catering Service", cat: "Food" },
    { label: "Food Delivery Service", cat: "Food" },
    { label: "Juice Bar", cat: "Food" },
    { label: "Ice Cream Shop", cat: "Food" },
    { label: "Cloud Kitchen", cat: "Food" },
    // Beauty & Wellness
    { label: "Hair Salon", cat: "Beauty" },
    { label: "Barber Shop", cat: "Beauty" },
    { label: "Nail Salon", cat: "Beauty" },
    { label: "Spa", cat: "Beauty" },
    { label: "Massage Therapy Center", cat: "Beauty" },
    { label: "Yoga Studio", cat: "Beauty" },
    { label: "Gym", cat: "Beauty" },
    { label: "Personal Trainer", cat: "Beauty" },
    { label: "Tattoo Parlor", cat: "Beauty" },
    // Retail & E-commerce
    { label: "Clothing Store", cat: "Retail" },
    { label: "Electronics Store", cat: "Retail" },
    { label: "Jewelry Store", cat: "Retail" },
    { label: "Furniture Store", cat: "Retail" },
    { label: "Bookstore", cat: "Retail" },
    { label: "Gift Shop", cat: "Retail" },
    { label: "Sports Equipment Store", cat: "Retail" },
    { label: "Toy Store", cat: "Retail" },
    { label: "Grocery Store", cat: "Retail" },
    { label: "Pet Shop", cat: "Retail" },
    { label: "Pharmacy Store", cat: "Retail" },
    // Auto
    { label: "Car Dealership", cat: "Auto" },
    { label: "Auto Repair Shop", cat: "Auto" },
    { label: "Car Wash", cat: "Auto" },
    { label: "Tire Shop", cat: "Auto" },
    { label: "Car Detailing", cat: "Auto" },
    { label: "Car Rental", cat: "Auto" },
    { label: "Motorcycle Shop", cat: "Auto" },
    // Home Services
    { label: "Plumber", cat: "Home" },
    { label: "Electrician", cat: "Home" },
    { label: "HVAC Services", cat: "Home" },
    { label: "Pest Control", cat: "Home" },
    { label: "Cleaning Service", cat: "Home" },
    { label: "Locksmith", cat: "Home" },
    { label: "Roofing Contractor", cat: "Home" },
    { label: "Landscaping Company", cat: "Home" },
    { label: "Moving Company", cat: "Home" },
    { label: "Solar Panel Installer", cat: "Home" },
    { label: "Smart Home Installer", cat: "Home" },
    // Travel & Events
    { label: "Travel Agency", cat: "Travel" },
    { label: "Hotel", cat: "Travel" },
    { label: "Event Management Company", cat: "Events" },
    { label: "Wedding Planner", cat: "Events" },
    { label: "Photography Studio", cat: "Events" },
    { label: "Video Production Company", cat: "Events" },
    { label: "DJ Services", cat: "Events" },
    { label: "Limousine Service", cat: "Travel" },
    // Logistics & B2B
    { label: "Logistics Company", cat: "B2B" },
    { label: "Courier Service", cat: "B2B" },
    { label: "Warehousing Company", cat: "B2B" },
    { label: "Staffing Agency", cat: "B2B" },
    { label: "Security Guard Service", cat: "B2B" },
    { label: "Co-working Space", cat: "B2B" },
    { label: "Printing Service", cat: "B2B" },
    { label: "Translation Service", cat: "B2B" },
    { label: "Advertising Agency", cat: "B2B" },
    { label: "PR Agency", cat: "B2B" },
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

    // ── Location Builder ─────────────────────────────────────────────
    const locationBuilderBtn = document.getElementById('location-builder-btn');
    const locationBuilderPanel = document.getElementById('location-builder-panel');
    const closeLocationBtn = document.getElementById('close-location-btn');
    const locCountry = document.getElementById('loc-country');
    const locProvince = document.getElementById('loc-province');
    const locCity = document.getElementById('loc-city');
    const locBusiness = document.getElementById('loc-business');
    const locPreview = document.getElementById('loc-preview');
    const locPreviewText = document.getElementById('loc-preview-text');
    const locComposeBtn = document.getElementById('loc-compose-btn');
    const provinceField = document.getElementById('province-field');
    const cityField = document.getElementById('city-field');
    const provinceLabel = document.getElementById('province-label');

    // Populate country dropdown from bundled data
    Object.keys(LOCATIONS_DATA).sort().forEach(country => {
        const opt = document.createElement('option');
        opt.value = country;
        opt.textContent = country;
        locCountry.appendChild(opt);
    });

    locationBuilderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isVisible = locationBuilderPanel.style.display === 'block';
        locationBuilderPanel.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) libraryView.style.display = 'none'; // close library if open
    });

    closeLocationBtn.addEventListener('click', () => {
        locationBuilderPanel.style.display = 'none';
    });

    function updateLocPreview() {
        const business = locBusiness.value.trim();
        const city = locCity.value;
        if (business && city) {
            locPreviewText.textContent = `${business} in ${city}`;
            locPreview.style.display = 'flex';
            locComposeBtn.disabled = false;
        } else {
            locPreview.style.display = 'none';
            locComposeBtn.disabled = true;
        }
    }

    const bizSuggestionsList = document.getElementById('business-suggestions-list');
    let bizHighlightIndex = -1;

    function renderBizSuggestions(value) {
        const query = value.toLowerCase().trim();
        bizHighlightIndex = -1;

        if (!query) {
            bizSuggestionsList.classList.remove('active');
            bizSuggestionsList.innerHTML = '';
            return;
        }

        const matched = BUSINESS_NICHES.filter(n =>
            n.label.toLowerCase().includes(query) || n.cat.toLowerCase().includes(query)
        ).slice(0, 8);

        if (matched.length === 0) {
            bizSuggestionsList.classList.remove('active');
            bizSuggestionsList.innerHTML = '';
            return;
        }

        bizSuggestionsList.innerHTML = matched.map((n, i) =>
            `<div class="business-suggestion-item" data-value="${n.label}" data-index="${i}">
                <span class="biz-cat-tag">${n.cat}</span>
                ${n.label}
            </div>`
        ).join('');
        bizSuggestionsList.classList.add('active');

        bizSuggestionsList.querySelectorAll('.business-suggestion-item').forEach(item => {
            item.addEventListener('mousedown', (e) => {
                e.preventDefault(); // prevent blur firing first
                locBusiness.value = item.dataset.value;
                bizSuggestionsList.classList.remove('active');
                updateLocPreview();
            });
        });
    }

    locBusiness.addEventListener('input', (e) => {
        renderBizSuggestions(e.target.value);
        updateLocPreview();
    });

    // Keyboard navigation: ↑ ↓ Enter Escape
    locBusiness.addEventListener('keydown', (e) => {
        const items = bizSuggestionsList.querySelectorAll('.business-suggestion-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            bizHighlightIndex = Math.min(bizHighlightIndex + 1, items.length - 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            bizHighlightIndex = Math.max(bizHighlightIndex - 1, 0);
        } else if (e.key === 'Enter' && bizHighlightIndex >= 0) {
            e.preventDefault();
            locBusiness.value = items[bizHighlightIndex].dataset.value;
            bizSuggestionsList.classList.remove('active');
            updateLocPreview();
            return;
        } else if (e.key === 'Escape') {
            bizSuggestionsList.classList.remove('active');
            return;
        } else {
            return;
        }
        items.forEach(el => el.classList.remove('highlighted'));
        if (bizHighlightIndex >= 0) {
            items[bizHighlightIndex].classList.add('highlighted');
            items[bizHighlightIndex].scrollIntoView({ block: 'nearest' });
        }
    });

    locBusiness.addEventListener('blur', () => {
        setTimeout(() => bizSuggestionsList.classList.remove('active'), 150);
    });



    locCountry.addEventListener('change', () => {
        const country = locCountry.value;
        // Reset downstream dropdowns
        locProvince.innerHTML = '<option value="">Select Province / State</option>';
        locCity.innerHTML = '<option value="">Select City</option>';
        cityField.style.display = 'none';
        locPreview.style.display = 'none';
        locComposeBtn.disabled = true;

        if (!country) {
            provinceField.style.display = 'none';
            return;
        }

        // Rename "Province" label contextually per country
        const labelMap = {
            'United States': 'State', 'Canada': 'Province',
            'Australia': 'State', 'Germany': 'State',
            'United Kingdom': 'Region', 'India': 'State',
            'United Arab Emirates': 'Emirate', 'Saudi Arabia': 'Region',
            'Singapore': 'Region', 'Pakistan': 'Province'
        };
        provinceLabel.textContent = labelMap[country] || 'Province';

        const provinces = LOCATIONS_DATA[country];
        const provinceKeys = Object.keys(provinces);

        // If only one province (e.g. Singapore), silently auto-select it
        if (provinceKeys.length === 1) {
            const onlyProvince = provinceKeys[0];
            const opt = document.createElement('option');
            opt.value = onlyProvince;
            opt.textContent = onlyProvince;
            locProvince.appendChild(opt);
            locProvince.value = onlyProvince;
            provinceField.style.display = 'flex';
            locProvince.dispatchEvent(new Event('change'));
        } else {
            provinceKeys.sort().forEach(prov => {
                const opt = document.createElement('option');
                opt.value = prov;
                opt.textContent = prov;
                locProvince.appendChild(opt);
            });
            provinceField.style.display = 'flex';
        }
    });

    locProvince.addEventListener('change', () => {
        const country = locCountry.value;
        const province = locProvince.value;
        locCity.innerHTML = '<option value="">Select City</option>';
        locPreview.style.display = 'none';
        locComposeBtn.disabled = true;

        if (!province) {
            cityField.style.display = 'none';
            return;
        }

        const cities = (LOCATIONS_DATA[country] || {})[province] || [];
        cities.forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.textContent = city;
            locCity.appendChild(opt);
        });
        cityField.style.display = 'flex';
        updateLocPreview();
    });

    locCity.addEventListener('change', updateLocPreview);

    locComposeBtn.addEventListener('click', () => {
        const business = locBusiness.value.trim();
        const city = locCity.value;
        if (!business || !city) return;
        keywordInput.value = `${business} in ${city}`;
        locationBuilderPanel.style.display = 'none';
        suggestionsList.classList.remove('active');
        // Green flash on keyword input to confirm
        keywordInput.style.borderColor = '#34d399';
        keywordInput.style.boxShadow = '0 0 0 4px rgba(52, 211, 153, 0.2)';
        setTimeout(() => {
            keywordInput.style.borderColor = '';
            keywordInput.style.boxShadow = '';
        }, 1200);
    });
    // ── End Location Builder ─────────────────────────────────────────

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
    if (state.maxResults) document.getElementById('max-results').value = state.maxResults;

    // Enable export buttons if data exists
    const hasData = scrapedData.length > 0;
    document.getElementById('export-csv-btn').disabled = !hasData;
    document.getElementById('export-excel-btn').disabled = !hasData;
    document.getElementById('append-sheet-btn').disabled = !hasData;
    document.getElementById('new-sheet-btn').disabled = !hasData;
    document.getElementById('clear-results-btn').disabled = !hasData;
    document.getElementById('whatsapp-blast-btn').disabled = !hasData;
}

document.getElementById('whatsapp-blast-btn').addEventListener('click', () => {
    // Open the full-page WhatsApp module in a new tab
    chrome.tabs.create({ url: chrome.runtime.getURL('whatsapp.html') });
});

document.getElementById('start-btn').addEventListener('click', async () => {
    const keywordInput = document.getElementById('keyword');
    const suggestionsList = document.getElementById('suggestions-list');
    const keyword = keywordInput.value;
    const minRating = parseFloat(document.getElementById('min-rating').value) || 0;
    const maxResults = parseInt(document.getElementById('max-results').value) || 100;

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
        maxResults: maxResults,
        tabId: tab.id
    });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    }, () => {
        chrome.tabs.sendMessage(tab.id, {
            action: 'start_scraping',
            keyword: keyword,
            minRating: minRating,
            maxResults: maxResults
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
            `"${(item.contact ? (item.contact.match(/^[+\-=@]/) ? "'" + item.contact : item.contact) : '').replace(/"/g, '""')}"`,
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
        'phone': item.contact ? (item.contact.match(/^[+\-=@]/) ? "'" + item.contact : item.contact) : '',
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

async function sendToGoogleSheet(actionStr, options = {}) {
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
            'phone': item.contact ? (item.contact.match(/^[+\-=@]/) ? "'" + item.contact : item.contact) : '',
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

        const query = document.getElementById('keyword').value.trim() || 'Leads';
        const payload = {
            action: actionStr,
            data: data,
            query: query,
            ...options
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

// --- New Tab Export Logic ---
document.getElementById('new-sheet-btn').addEventListener('click', () => {
    const defaultQueryName = document.getElementById('keyword').value.trim() || 'Leads';
    const suggestedTabName = defaultQueryName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' - ' + new Date().toLocaleTimeString();

    const customTabName = prompt("Enter the name for the new Google Sheets tab:", suggestedTabName);

    // If user presses Cancel, do nothing
    if (customTabName === null) return;

    // Send to Google Sheet with provided tabName (even if empty, Apps Script will fallback)
    sendToGoogleSheet('new_tab', { tabName: customTabName.trim() });
});

// --- Append to Existing Sheet Logic (Modal) ---
const sheetSelectorModal = document.getElementById('sheet-selector-modal');
const sheetSelectDropdown = document.getElementById('sheet-select-dropdown');
const closeSheetSelectorBtn = document.getElementById('close-sheet-selector-btn');
const sheetSelectorLoading = document.getElementById('sheet-selector-loading');
const sheetSelectorContent = document.getElementById('sheet-selector-content');
const confirmAppendBtn = document.getElementById('confirm-append-btn');

document.getElementById('append-sheet-btn').addEventListener('click', () => {
    if (scrapedData.length === 0) return;

    chrome.storage.local.get(['webAppUrl'], async (result) => {
        let webAppUrl = result.webAppUrl;
        if (!webAppUrl) {
            webAppUrl = prompt("Please enter your deployed Google Apps Script Web App URL:", "https://script.google.com/macros/s/AKfycbw6CR94M7pfTQlEgXpYdzxOsf9xcVt0VORG7KqCCuNN-E_5x1vVoL_xC16HG4XufUGcJw/exec");
            if (webAppUrl) {
                chrome.storage.local.set({ webAppUrl: webAppUrl });
            } else {
                return;
            }
        }

        // Show Modal in loading state
        sheetSelectorModal.style.display = 'block';
        sheetSelectorLoading.style.display = 'block';
        sheetSelectorContent.style.display = 'none';

        try {
            const response = await fetch(webAppUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'get_sheets' }),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            });
            const resultData = await response.json();

            if (resultData.status === 'success' && resultData.sheets) {
                // Populate dropdown
                sheetSelectDropdown.innerHTML = '';
                resultData.sheets.forEach(sheetName => {
                    const option = document.createElement('option');
                    option.value = sheetName;
                    option.textContent = sheetName;
                    sheetSelectDropdown.appendChild(option);
                });

                sheetSelectorLoading.style.display = 'none';
                sheetSelectorContent.style.display = 'flex';
            } else {
                alert("Failed to fetch sheets: " + (resultData.message || "Unknown error"));
                sheetSelectorModal.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching sheets:', error);
            alert("Error connecting to Google Sheets to fetch tabs.");
            sheetSelectorModal.style.display = 'none';
        }
    });
});

closeSheetSelectorBtn.addEventListener('click', () => {
    sheetSelectorModal.style.display = 'none';
});

confirmAppendBtn.addEventListener('click', () => {
    const selectedSheet = sheetSelectDropdown.value;
    if (!selectedSheet) return;

    sheetSelectorModal.style.display = 'none';
    sendToGoogleSheet('append', { sheetName: selectedSheet });
});

document.getElementById('clear-results-btn').addEventListener('click', () => {
    if (confirm("Are you sure you want to delete all extracted leads from memory?")) {
        chrome.runtime.sendMessage({ action: 'clear_data' });
    }
});
