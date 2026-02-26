document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let currentStep = 1;
    let leadsData = [];
    let validContacts = [];
    let isCampaignRunning = false;
    let shouldStopCampaign = false;
    let campaignStartIndex = 0;   // tracks where to resume from
    let attachmentBase64 = null;
    let attachmentMimeType = null;
    let attachmentName = null;
    let cvBase64 = null;
    let isCvLoaded = false;
    let campaignStats = { sent: 0, invalid: 0, history: 0, processed: 0 };

    // --- Navigation Elements ---
    const steps = [
        document.getElementById('step-1-content'),
        document.getElementById('step-2-content'),
        document.getElementById('step-3-content'),
        document.getElementById('step-4-content')
    ];
    const navItems = [
        document.getElementById('nav-step-1'),
        document.getElementById('nav-step-2'),
        document.getElementById('nav-step-3'),
        document.getElementById('nav-step-4')
    ];

    document.getElementById('back-to-extension-btn').addEventListener('click', () => {
        window.close();
    });

    // Navigation functions
    function goToStep(stepNum) {
        // Hide all
        steps.forEach(el => el.classList.remove('active'));
        navItems.forEach(el => el.classList.remove('active'));

        // Show current
        steps[stepNum - 1].classList.add('active');
        navItems[stepNum - 1].classList.add('active');

        // Mark previous as completed (green check could be added here)
        for (let i = 0; i < stepNum; i++) {
            navItems[i].classList.add('active');
            navItems[i].style.opacity = '1';
        }
        for (let i = stepNum; i < navItems.length; i++) {
            navItems[i].classList.remove('active');
            navItems[i].style.opacity = '0.5';
        }

        currentStep = stepNum;

        // Step specific logic
        if (stepNum === 2) {
            updateVariablesPanel();
        } else if (stepNum === 4) {
            prepareDashboard();
        }
    }

    // Step buttons
    document.getElementById('btn-next-1').addEventListener('click', processDataAndGoNext);
    document.getElementById('btn-prev-2').addEventListener('click', () => goToStep(1));
    document.getElementById('btn-next-2').addEventListener('click', () => goToStep(3));
    document.getElementById('btn-prev-3').addEventListener('click', () => goToStep(2));
    document.getElementById('btn-next-3').addEventListener('click', () => goToStep(4));
    document.getElementById('go-back-from-4').addEventListener('click', () => goToStep(3));

    // Allow clicking the sidebar steps directly to navigate backwards or forwards
    navItems.forEach((item, index) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            // Optional: Only allow clicking steps they've technically unlocked
            // But since this is a local tool, free navigation is fine. 
            // We just shouldn't let them launch if validContacts is empty.
            if (index === 3 && validContacts.length === 0 && leadsData.length > 0) {
                // If they try to skip straight to step 4 without processing step 1, force process
                processDataAndGoNext();
                setTimeout(() => goToStep(4), 100);
            } else if (index === 1 && validContacts.length === 0 && leadsData.length > 0) {
                processDataAndGoNext();
            } else {
                goToStep(index + 1);
            }
        });
    });

    // --- STEP 1: Data Source Logic ---
    const sourceCards = document.querySelectorAll('.source-card');
    const uploadZone = document.getElementById('upload-zone');
    const leadsBadge = document.getElementById('leads-count-badge');

    sourceCards.forEach(card => {
        card.addEventListener('click', () => {
            sourceCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            card.querySelector('input').checked = true;

            if (card.id === 'source-upload') {
                uploadZone.style.display = 'block';
                leadsBadge.innerText = '0 Leads Ready';
                leadsData = []; // Clear current data
            } else {
                uploadZone.style.display = 'none';
                loadScrapedData();
            }
        });
    });

    // Auto-load scraped data on startup
    function loadScrapedData() {
        chrome.runtime.sendMessage({ action: 'get_status' }, (state) => {
            if (state && state.data && state.data.length > 0) {
                leadsData = state.data;
                leadsBadge.innerText = `${leadsData.length} Leads Ready`;
                leadsBadge.style.color = '#34d399'; // green
                leadsBadge.style.backgroundColor = 'rgba(52, 211, 153, 0.15)';
            } else {
                leadsBadge.innerText = 'No scraped leads found';
                leadsBadge.style.color = '#f87171'; // red
            }
        });
    }
    loadScrapedData(); // Init

    // Handle CSV/JSON upload
    document.getElementById('file-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            const content = event.target.result;
            if (file.name.endsWith('.json')) {
                try {
                    leadsData = JSON.parse(content);
                    leadsBadge.innerText = `${leadsData.length} Leads Ready (JSON)`;
                } catch (err) {
                    alert("Invalid JSON file.");
                }
            } else if (file.name.endsWith('.csv')) {
                leadsData = parseCSV(content);
                leadsBadge.innerText = `${leadsData.length} Leads Ready (CSV)`;
            }
        };
        reader.readAsText(file);
    });

    // --- Google Sheets Logic ---
    const sheetUrlInput = document.getElementById('sheet-url-input');
    const sheetSelectionContainer = document.getElementById('sheet-selection-container');
    const sheetSelect = document.getElementById('sheet-select');
    let currentSpreadsheetId = null;

    sheetUrlInput.addEventListener('input', async (e) => {
        const url = e.target.value.trim();
        if (!url) {
            sheetSelectionContainer.style.display = 'none';
            leadsData = [];
            leadsBadge.innerText = '0 Leads Ready';
            return;
        }

        const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
            const spreadsheetId = match[1];
            // Extract gid from URL if present (e.g., ...edit?gid=12345 or ...#gid=12345)
            const gidMatch = url.match(/[?#&]gid=(\d+)/);
            const initialGid = gidMatch ? gidMatch[1] : null;

            // Always fetch list to ensure all sheets are loaded if URL changes
            currentSpreadsheetId = spreadsheetId;
            fetchSheetList(spreadsheetId, initialGid);
        }
    });

    async function fetchSheetList(id, preferredGid = null) {
        sheetSelectionContainer.style.display = 'block';
        sheetSelect.innerHTML = '<option value="">-- Loading Sheets... --</option>';

        // Attempt 1: Use Apps Script Web App URL (most reliable — works for private sheets)
        try {
            const storage = await new Promise(r => chrome.storage.local.get(['webAppUrl'], r));
            if (storage.webAppUrl) {
                const response = await fetch(storage.webAppUrl, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'get_sheets' }),
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                });
                const result = await response.json();
                if (result.status === 'success' && result.sheets && result.sheets.length > 0) {
                    sheetSelect.innerHTML = '<option value="">-- Select a Sheet --</option>' +
                        result.sheets.map(name => `<option value="${name}">${name}</option>`).join('');

                    // Auto-select the first sheet and load its data
                    const firstSheet = result.sheets[0];
                    sheetSelect.value = firstSheet;
                    loadSheetDataByName(id, firstSheet);
                    return; // Success — no need for fallback
                }
            }
        } catch (e) {
            console.warn("Web App fetch failed, falling back to public CSV approach.", e);
        }

        // Attempt 2: Fallback — try loading the default sheet directly via public CSV export
        try {
            const fallbackGid = preferredGid || "0";
            sheetSelect.innerHTML = `<option value="${fallbackGid}">Default Sheet (gid: ${fallbackGid})</option>`;
            loadSheetData(id, fallbackGid);
        } catch (err) {
            console.error("Error fetching sheets:", err);
            sheetSelect.innerHTML = '<option value="">Error loading sheets. Check sharing settings or set Web App URL.</option>';
        }
    }


    sheetSelect.addEventListener('change', () => {
        const selectedValue = sheetSelect.value;
        if (!selectedValue || !currentSpreadsheetId) return;

        // If the value looks like a pure number, it's a gid (fallback mode)
        // If it contains non-numeric chars, it's a sheet name (Web App mode)
        if (/^\d+$/.test(selectedValue)) {
            loadSheetData(currentSpreadsheetId, selectedValue);
        } else {
            loadSheetDataByName(currentSpreadsheetId, selectedValue);
        }
    });

    // Load sheet data by NAME via Apps Script Web App
    async function loadSheetDataByName(spreadsheetId, sheetName) {
        leadsBadge.innerText = 'Loading Data...';
        try {
            const storage = await new Promise(r => chrome.storage.local.get(['webAppUrl'], r));
            if (!storage.webAppUrl) {
                leadsBadge.innerText = 'Web App URL not set';
                leadsBadge.style.color = '#f87171';
                alert("Please set your Google Apps Script Web App URL first (via the main extension popup).");
                return;
            }

            const response = await fetch(storage.webAppUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'get_sheet_data', sheetName: sheetName }),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            });
            const result = await response.json();

            if (result.status === 'success' && result.data) {
                leadsData = result.data;
                leadsBadge.innerText = `${leadsData.length} Leads Ready (${sheetName})`;
                leadsBadge.style.color = '#34d399';
                leadsBadge.style.backgroundColor = 'rgba(52, 211, 153, 0.15)';
            } else {
                // Fallback: try public CSV export with gid=0
                console.warn("Web App data fetch failed, trying public CSV export...");
                loadSheetData(spreadsheetId, "0");
            }
        } catch (err) {
            console.error("Error loading sheet data by name:", err);
            // Fallback: try public CSV export
            loadSheetData(spreadsheetId, "0");
        }
    }

    async function loadSheetData(spreadsheetId, gid) {
        leadsBadge.innerText = 'Loading Data...';
        try {
            const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
            const response = await fetch(url);
            const csvText = await response.text();

            // Safety Check: If we got HTML back, it means the sheet is private/protected
            if (csvText.includes('<html') || csvText.includes('<!DOCTYPE') || csvText.includes('widget-bootstrap')) {
                leadsBadge.innerText = 'Private Sheet (Error)';
                alert("This Google Sheet appears to be PRIVATE. \n\nPlease click 'Share' in Google Sheets and set access to 'Anyone with the link can view'.");
                return;
            }

            leadsData = parseCSV(csvText);
            leadsBadge.innerText = `${leadsData.length} Leads Ready (Google Sheets)`;
            leadsBadge.style.color = '#34d399';
            leadsBadge.style.backgroundColor = 'rgba(52, 211, 153, 0.15)';
        } catch (err) {
            console.error("Error loading sheet data:", err);
            leadsBadge.innerText = 'Error loading data';
            leadsBadge.style.color = '#f87171';
            alert("Could not load data. Ensure sheet is 'Anyone with the link can view'.");
        }
    }

    function parseCSV(str) {
        const rows = str.split(/\r?\n/);
        if (rows.length < 2) return [];

        const parseRow = (row) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < row.length; i++) {
                const char = row[i];
                if (char === '"') {
                    if (inQuotes && row[i + 1] === '"') { // Handle escaped quotes
                        current += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result.map(v => v.replace(/^"|"$/g, '').trim());
        };

        const headers = parseRow(rows[0]);
        const data = [];
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue;
            const values = parseRow(rows[i]);
            if (values.length < headers.length) continue;
            const obj = {};
            headers.forEach((h, index) => {
                // Normalize key: lowercase, trim, and remove internal spaces for easier matching
                const key = h.toLowerCase().trim();
                obj[key] = values[index] || '';
            });
            data.push(obj);
        }
        return data;
    }

    function processDataAndGoNext() {
        if (leadsData.length === 0) {
            const sheetUrl = document.getElementById('sheet-url-input').value;
            const gid = document.getElementById('sheet-select').value;
            if (sheetUrl && !gid) {
                alert("Please select a worksheet from the dropdown first.");
            } else {
                alert("Please load some data first (upload a file or paste a Google Sheet link).");
            }
            return;
        }

        // Clean and validate phone numbers
        const phoneMap = new Map();
        leadsData.forEach(item => {
            // Fuzzy match phone field: find any key that contains 'phone', 'mobile', or 'contact'
            const keys = Object.keys(item);
            const phoneKey = keys.find(k => k.includes('phone') || k.includes('contact') || k.includes('mobile'));

            let phoneStr = phoneKey ? item[phoneKey] : '';
            // Clean phone string (keep only digits and +)
            let cleanPhone = phoneStr ? phoneStr.toString().replace(/[^\d+]/g, '') : '';

            if (cleanPhone.length > 5) {
                // Deduplicate: if same phone number appears again, ignore or merge 
                // We keep the first occurrence
                if (!phoneMap.has(cleanPhone)) {
                    phoneMap.set(cleanPhone, {
                        ...item,
                        _processedPhone: cleanPhone
                    });
                }
            }
        });

        validContacts = Array.from(phoneMap.values());

        if (validContacts.length === 0) {
            const sampleHeaders = leadsData.length > 0 ? Object.keys(leadsData[0]).join(', ') : 'None';
            alert(`No valid phone numbers found!\n\nDetected columns: ${sampleHeaders}\n\nPlease make sure one of your columns is named 'phone', 'mobile', or 'contact' and contains digits.`);
            return;
        }

        goToStep(2);
    }

    // --- STEP 2: Composer Logic ---
    const msgBox = document.getElementById('message-body');
    const variablesContainer = document.getElementById('variable-chips-container');
    const attachMenu = document.getElementById('attachment-input');
    const dropzone = document.getElementById('attachment-dropzone');
    const preview = document.getElementById('attachment-preview');
    const fname = document.getElementById('attached-filename');

    function updateVariablesPanel() {
        if (validContacts.length === 0) return;
        const sampleItem = validContacts[0];

        // Remove internal fields
        const keys = Object.keys(sampleItem).filter(k => k !== '_processedPhone' && sampleItem[k] != null);

        variablesContainer.innerHTML = keys.map(k => `<div class="chip" data-var="{{${k}}}">{{${k}}}</div>`).join('');

        variablesContainer.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const varText = chip.dataset.var;
                insertAtCursor(msgBox, varText);
            });
        });
    }

    function insertAtCursor(myField, myValue) {
        if (myField.selectionStart || myField.selectionStart == '0') {
            var startPos = myField.selectionStart;
            var endPos = myField.selectionEnd;
            myField.value = myField.value.substring(0, startPos)
                + myValue
                + myField.value.substring(endPos, myField.value.length);
            myField.focus();
            myField.selectionStart = startPos + myValue.length;
            myField.selectionEnd = startPos + myValue.length;
        } else {
            myField.value += myValue;
            myField.focus();
        }
    }

    dropzone.addEventListener('click', () => attachMenu.click());
    attachMenu.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 15 * 1024 * 1024) { // 15MB limit
            alert("Attachment size limit is 15MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            attachmentBase64 = event.target.result;
            attachmentMimeType = file.type;
            attachmentName = file.name;

            fname.innerText = file.name;
            dropzone.style.display = 'none';
            preview.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    });

    // --- CV Loading Utility ---
    async function preloadCV() {
        if (isCvLoaded) return cvBase64;
        try {
            const url = chrome.runtime.getURL('Muhammad_Tahir_CV.pdf');
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    cvBase64 = reader.result;
                    isCvLoaded = true;
                    resolve(cvBase64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (err) {
            console.error("Failed to preload CV:", err);
            return null;
        }
    }

    document.getElementById('remove-attachment-btn').addEventListener('click', () => {
        attachmentBase64 = null;
        attachmentMimeType = null;
        attachmentName = null;
        attachMenu.value = '';
        dropzone.style.display = 'block';
        preview.style.display = 'none';
    });


    // --- STEP 3: Settings Logic ---
    const delaySlider = document.getElementById('delay-slider');
    const delayVal = document.getElementById('delay-value');
    delaySlider.addEventListener('input', (e) => {
        delayVal.innerText = e.target.value;
    });


    // --- STEP 4: Launch Logic ---
    function prepareDashboard() {
        document.getElementById('final-contact-count').innerText = leadsData.length;
        document.getElementById('final-valid-count').innerText = validContacts.length;

        // Est time = contacts * (delay + 5 sec load time)
        const delay = parseInt(delaySlider.value);
        const rand = document.getElementById('randomize-delay').checked ? 2 : 0;
        const avgTotalSecs = (delay + rand + 5) * validContacts.length;

        document.getElementById('final-est-time').innerText = Math.round(avgTotalSecs / 60) + ' min';
    }

    // Helper: manage button visibility based on campaign state
    function showCampaignState(state) {
        const launchBtn = document.getElementById('launch-campaign-btn');
        const stopBtn = document.getElementById('stop-campaign-btn');
        const resumeBtn = document.getElementById('resume-campaign-btn');
        const restartBtn = document.getElementById('restart-campaign-btn');
        const progressArea = document.getElementById('live-progress-area');
        const excelBtn = document.getElementById('download-excel-btn');

        if (state === 'idle') {
            launchBtn.style.display = 'block';
            progressArea.style.display = 'none';
            stopBtn.style.display = 'none';
            resumeBtn.style.display = 'none';
            restartBtn.style.display = 'none';
            excelBtn.style.display = 'none';
        } else if (state === 'running') {
            launchBtn.style.display = 'none';
            progressArea.style.display = 'block';
            stopBtn.style.display = 'flex';
            resumeBtn.style.display = 'none';
            restartBtn.style.display = 'none';
            excelBtn.style.display = 'flex';
        } else if (state === 'stopped') {
            launchBtn.style.display = 'none';
            progressArea.style.display = 'block';
            stopBtn.style.display = 'none';
            resumeBtn.style.display = 'flex';
            restartBtn.style.display = 'flex';
            excelBtn.style.display = 'flex';
        } else if (state === 'complete') {
            launchBtn.style.display = 'none';
            progressArea.style.display = 'block';
            stopBtn.style.display = 'none';
            resumeBtn.style.display = 'none';
            restartBtn.style.display = 'flex';
            excelBtn.style.display = 'flex';
        }
    }

    document.getElementById('launch-campaign-btn').addEventListener('click', async () => {
        const sendCv = document.getElementById('send-cv-toggle').checked;
        if (!msgBox.value.trim() && !attachmentBase64 && !sendCv) {
            alert("Please provide a message, an attachment, or enable 'Send My CV'.");
            goToStep(2);
            return;
        }

        if (sendCv && !isCvLoaded) {
            const statusBadge = document.getElementById('leads-count-badge');
            const originalText = statusBadge.innerText;
            statusBadge.innerText = 'Loading CV...';
            await preloadCV();
            statusBadge.innerText = originalText;

            if (!cvBase64) {
                alert("Could not load 'Muhammad_Tahir_CV.pdf' from extension directory. Please ensure the file exists.");
                return;
            }
        }

        campaignStartIndex = 0;
        campaignStats = { sent: 0, invalid: 0, history: 0, processed: 0 };
        updateStatsUI();
        startCampaign(0);
    });

    document.getElementById('stop-campaign-btn').addEventListener('click', () => {
        shouldStopCampaign = true;
        logMsg("⏹ Stop requested — finishing current message then halting...", "error");
    });

    document.getElementById('resume-campaign-btn').addEventListener('click', async () => {
        logMsg(`▶ Resuming from contact ${campaignStartIndex + 1} of ${validContacts.length}...`, "sys");
        const sendCv = document.getElementById('send-cv-toggle').checked;
        if (sendCv && !isCvLoaded) {
            await preloadCV();
        }
        updateStatsUI();
        startCampaign(campaignStartIndex);
    });

    document.getElementById('restart-campaign-btn').addEventListener('click', async () => {
        // Clear logs and progress bar
        document.getElementById('campaign-logs').innerHTML = '<div class="log-entry sys">Restarting campaign from the beginning...</div>';
        document.getElementById('campaign-progress-fill').style.width = '0%';
        document.getElementById('progress-percent').innerText = '0%';

        const sendCv = document.getElementById('send-cv-toggle').checked;
        if (sendCv && !isCvLoaded) {
            await preloadCV();
        }
        startCampaign(0);
    });

    async function startCampaign(fromIndex) {
        showCampaignState('running');
        isCampaignRunning = true;
        shouldStopCampaign = false;
        updateStatsUI();

        const template = msgBox.value;
        const delayBase = parseInt(delaySlider.value);
        const randDelay = document.getElementById('randomize-delay').checked;
        const pauseBatch = document.getElementById('pause-batch').checked;
        const batchSize = parseInt(document.getElementById('batch-size').value);
        const skipExisting = document.getElementById('skip-existing').checked;
        const sendCv = document.getElementById('send-cv-toggle').checked;

        if (sendCv && !isCvLoaded) {
            await preloadCV();
        }

        if (fromIndex === 0) {
            logMsg(`🚀 Starting campaign to ${validContacts.length} contacts...`, "sys");
        }

        for (let i = fromIndex; i < validContacts.length; i++) {
            // Save index so Resume knows where to pick up
            campaignStartIndex = i;

            if (shouldStopCampaign) {
                logMsg(`⏹ Campaign stopped at contact ${i + 1} of ${validContacts.length}.`, "error");
                break;
            }

            const item = validContacts[i];
            const phone = item._processedPhone;

            // Determine what to send
            const sendCv = document.getElementById('send-cv-toggle').checked;
            let currentPayload = {
                phone: phone,
                text: '',
                file: null,
                mime: null,
                filename: null
            };

            // 1. Handle Text
            let msg = template;
            if (msg.trim()) {
                Object.keys(item).forEach(k => {
                    if (k !== '_processedPhone') {
                        const regex = new RegExp(`{{${k}}}`, 'gi');
                        msg = msg.replace(regex, item[k] || '');
                    }
                });
                currentPayload.text = msg;
            }

            // 2. Handle Attachment (Priority: Custom Upload > CV Toggle)
            if (attachmentBase64) {
                currentPayload.file = attachmentBase64;
                currentPayload.mime = attachmentMimeType;
                currentPayload.filename = attachmentName;
            } else if (sendCv && cvBase64) {
                currentPayload.file = cvBase64;
                currentPayload.mime = 'application/pdf';
                currentPayload.filename = 'Muhammad_Tahir_CV.pdf';
            }

            logMsg(`[${i + 1}/${validContacts.length}] Preparing for ${phone}...`, "info");
            if (currentPayload.file) {
                logMsg(`📎 Attaching: ${currentPayload.filename}...`, "sys");
            }

            try {
                const response = await sendWhatsAppMessage(
                    currentPayload.phone,
                    currentPayload.text,
                    currentPayload.file,
                    currentPayload.mime,
                    currentPayload.filename,
                    skipExisting
                );
                if (response.success) {
                    let successTxt = `✅ Sent to ${phone}`;
                    if (currentPayload.file) {
                        successTxt += ` (including ${currentPayload.filename})`;
                    }
                    logMsg(successTxt, "success");
                    campaignStats.sent++;
                    // Mark contact as sent in the scraped data
                    chrome.runtime.sendMessage({
                        action: 'update_wa_sent_status',
                        phone: phone
                    });
                } else {
                    const error = response.error || '';
                    if (error.includes("isn't on WhatsApp")) {
                        campaignStats.invalid++;
                    } else if (error.includes("already exists")) {
                        campaignStats.history++;
                    }
                    logMsg(`❌ Failed for ${phone}: ${response.error}`, "error");
                }
                campaignStats.processed++;
                updateStatsUI();
            } catch (err) {
                logMsg(`⚠️ Error for ${phone}: ${err}`, "error");
            }

            // Update progress bar
            const perc = Math.round(((i + 1) / validContacts.length) * 100);
            document.getElementById('progress-percent').innerText = `${perc}%`;
            document.getElementById('campaign-progress-fill').style.width = `${perc}%`;

            if (i < validContacts.length - 1 && !shouldStopCampaign) {
                let waitSecs = delayBase;
                if (randDelay) {
                    waitSecs += Math.floor(Math.random() * 7) - 3;
                    if (waitSecs < 1) waitSecs = 1;
                }
                if (pauseBatch && (i + 1) % batchSize === 0) {
                    logMsg(`⏳ Batch pause — waiting 2 minutes to prevent ban...`, "sys");
                    waitSecs += 120;
                }
                logMsg(`💤 Waiting ${waitSecs}s before next contact...`, "info");
                await sleep(waitSecs * 1000);
            }
        }

        isCampaignRunning = false;

        if (shouldStopCampaign) {
            // Show Resume + Restart after stop
            showCampaignState('stopped');
        } else {
            // All done
            logMsg("🎉 Campaign Complete! All contacts processed.", "success");
            campaignStartIndex = 0;
            showCampaignState('complete');
        }
    }

    function logMsg(text, type) {
        const consoleEl = document.getElementById('campaign-logs');
        const div = document.createElement('div');
        div.className = `log-entry ${type}`;
        div.innerText = `[${new Date().toLocaleTimeString()}] ${text}`;
        consoleEl.appendChild(div);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function updateStatsUI() {
        document.getElementById('stat-total-processed').innerText = `${campaignStats.processed}/${validContacts.length}`;
        document.getElementById('stat-sent-count').innerText = campaignStats.sent;
        document.getElementById('stat-invalid-count').innerText = campaignStats.invalid;
        document.getElementById('stat-history-count').innerText = campaignStats.history;
    }

    // Connects to background script which will manage the WA Web tab
    function sendWhatsAppMessage(phone, text, fileBase64, mimeType, fileName, skipExisting) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({
                action: 'send_whatsapp_message',
                phone: phone,
                text: text,
                file: fileBase64,
                mime: mimeType,
                filename: fileName,
                skipExisting: skipExisting
            }, (response) => {
                if (chrome.runtime.lastError) {
                    resolve({ success: false, error: chrome.runtime.lastError.message });
                } else if (response) {
                    resolve(response);
                } else {
                    resolve({ success: false, error: "No response from extension background." });
                }
            });
        });
    }

    // Download Updated Excel — includes Sent Status column updated live
    document.getElementById('download-excel-btn').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'get_status' }, (state) => {
            const data = (state && state.data) || [];
            if (data.length === 0) {
                logMsg('⚠️ No scraped data found to export.', 'error');
                return;
            }

            const rows = data.map(item => ({
                'Name': item.name || '',
                'Rating': item.rating || '',
                'Reviews': item.reviews || '',
                'Google Maps URL': item.url || '',
                'Website': item.website || '',
                'Phone': item.contact || item.phone || '',
                'Email': item.emails || '',
                'Sent Status': item.sentStatus || '',
                'Next Follow-Up Date': '',
                'Follow-Up Stage': '',
                'Date Scraped': new Date().toISOString().split('T')[0],
                'Source': 'Google Maps Scraper',
                'Notes': '',
                'LinkedIn URL': item.linkedin || '',
                'Facebook': item.facebook || ''
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `wa_campaign_${new Date().getTime()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            logMsg('📥 Excel downloaded with updated Sent Status!', 'success');
        });
    });

});
