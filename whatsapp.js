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

    function parseCSV(str) {
        const rows = str.split('\n');
        if (rows.length < 2) return [];
        const headers = rows[0].split(',').map(h => h.replace(/"/g, '').trim());
        const data = [];
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue;
            // Basic CSV parse (does not handle commas inside quotes perfectly, using simple split for demo)
            // A realistic implementation would use regex or a library.
            const values = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const obj = {};
            headers.forEach((h, index) => {
                obj[h] = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
            });
            data.push(obj);
        }
        return data;
    }

    function processDataAndGoNext() {
        if (leadsData.length === 0) {
            alert("Please load some data first.");
            return;
        }

        // Clean and validate phone numbers
        const phoneMap = new Map();
        leadsData.forEach(item => {
            // Find phone field (could be 'phone', 'contact', 'Phone Number', etc)
            let phoneStr = item.phone || item.contact || item['Phone Number'] || '';
            // Clean phone string (keep only digits and +)
            let cleanPhone = phoneStr.replace(/[^\d+]/g, '');

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
            alert("No valid phone numbers found in the dataset. Please ensure there is a 'phone' or 'contact' column.");
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

    document.getElementById('launch-campaign-btn').addEventListener('click', () => {
        if (!msgBox.value.trim() && !attachmentBase64) {
            alert("Please provide a message or an attachment to send.");
            goToStep(2);
            return;
        }
        campaignStartIndex = 0;
        startCampaign(0);
    });

    document.getElementById('stop-campaign-btn').addEventListener('click', () => {
        shouldStopCampaign = true;
        logMsg("⏹ Stop requested — finishing current message then halting...", "error");
    });

    document.getElementById('resume-campaign-btn').addEventListener('click', () => {
        if (!msgBox.value.trim() && !attachmentBase64) {
            alert("Please provide a message or an attachment to send.");
            return;
        }
        logMsg(`▶ Resuming from contact ${campaignStartIndex + 1} of ${validContacts.length}...`, "sys");
        startCampaign(campaignStartIndex);
    });

    document.getElementById('restart-campaign-btn').addEventListener('click', () => {
        if (!msgBox.value.trim() && !attachmentBase64) {
            alert("Please provide a message or an attachment to send.");
            return;
        }
        // Clear logs and progress bar
        document.getElementById('campaign-logs').innerHTML = '<div class="log-entry sys">Restarting campaign from the beginning...</div>';
        document.getElementById('campaign-progress-fill').style.width = '0%';
        document.getElementById('progress-percent').innerText = '0%';
        startCampaign(0);
    });

    async function startCampaign(fromIndex) {
        showCampaignState('running');
        isCampaignRunning = true;
        shouldStopCampaign = false;

        const template = msgBox.value;
        const delayBase = parseInt(delaySlider.value);
        const randDelay = document.getElementById('randomize-delay').checked;
        const pauseBatch = document.getElementById('pause-batch').checked;
        const batchSize = parseInt(document.getElementById('batch-size').value);

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

            // Build personalized message
            let msg = template;
            Object.keys(item).forEach(k => {
                if (k !== '_processedPhone') {
                    const regex = new RegExp(`{{${k}}}`, 'gi');
                    msg = msg.replace(regex, item[k] || '');
                }
            });

            logMsg(`[${i + 1}/${validContacts.length}] Preparing for ${phone}...`, "info");

            try {
                const response = await sendWhatsAppMessage(phone, msg, attachmentBase64, attachmentMimeType, attachmentName);
                if (response.success) {
                    logMsg(`✅ Sent to ${phone}`, "success");
                    // Mark contact as sent in the scraped data
                    chrome.runtime.sendMessage({
                        action: 'update_wa_sent_status',
                        phone: phone
                    });
                } else {
                    logMsg(`❌ Failed for ${phone}: ${response.error}`, "error");
                }
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

    // Connects to background script which will manage the WA Web tab
    function sendWhatsAppMessage(phone, text, fileBase64, mimeType, fileName) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({
                action: 'send_whatsapp_message',
                phone: phone,
                text: text,
                file: fileBase64,
                mime: mimeType,
                filename: fileName
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
