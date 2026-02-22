chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'run_wa_automation') {
        runAutomation(request)
            .then(() => sendResponse({ success: true }))
            .catch((err) => sendResponse({ success: false, error: err.toString() }));
        return true;
    }
});

async function runAutomation(data) {
    // 1. Wait for WhatsApp to fully load the chat OR show an error popup
    try {
        await waitForElement('div[title="Type a message"], div[title="Escribe un mensaje"], footer, div[data-animate-modal-popup="true"]', 30000);
    } catch (err) {
        throw new Error("Timeout waiting for WhatsApp Chat to load.");
    }

    // Wait an extra second for React to settle
    await sleep(2000);

    // 1.5 Handle "Invalid Phone Number" modal if it appeared
    const errorModal = document.querySelector('div[data-animate-modal-popup="true"]');
    if (errorModal) {
        const text = errorModal.innerText.toLowerCase();
        if (text.includes("invalid") || text.includes("phone number shared") || text.includes("no válido")) {
            // Find and click the 'OK' button to dismiss the modal so the next number can load cleanly
            const okBtn = errorModal.querySelector('button');
            if (okBtn) okBtn.click();

            throw new Error("Contact not on WhatsApp (Invalid Number)");
        }
    }
    await sleep(2000);

    // 2. Check if a pre-filled text needs to be sent
    const sendBtnSelector = 'button[aria-label="Send"], span[data-icon="send"]';

    let sendBtn = document.querySelector(sendBtnSelector);
    if (!sendBtn) {
        // Sometimes text needs a small nudge to activate the send button
        const chatBox = document.querySelector('div[contenteditable="true"][data-tab="10"]');
        if (chatBox) {
            chatBox.focus();
            document.execCommand('insertText', false, ' ');
            await sleep(500);
            sendBtn = document.querySelector(sendBtnSelector);
        }
    }

    // 3. Handle Text Message First
    if (sendBtn) {
        const clickableSend = sendBtn.closest('button') || sendBtn;
        clickableSend.click();
        // Wait for the text message to be processed and sent before handling attachment
        await sleep(1500);
    }

    // 4. Handle File Attachment (e.g., PDF CV)
    if (data.hasFile && data.file) {
        try {
            // Convert Base64 to Blob/File
            const blob = base64ToBlob(data.file.split(',')[1], data.mime);
            const file = new File([blob], data.filename || "attachment", { type: data.mime });

            // Dispatch drop event to upload
            const dropzone = document.querySelector('#main') || document.body;

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            const eventInfo = {
                bubbles: true,
                cancelable: true,
                dataTransfer: dataTransfer
            };

            dropzone.dispatchEvent(new DragEvent('dragenter', eventInfo));
            dropzone.dispatchEvent(new DragEvent('dragover', eventInfo));
            dropzone.dispatchEvent(new DragEvent('drop', eventInfo));

            // Wait for media preview to open and show the big send button
            await sleep(2000);
            await waitForElement('span[data-icon="send"]', 10000);

            // The send button changes in the media preview
            const mediaSendBtn = document.querySelector('span[data-icon="send"]').closest('button') || document.querySelector('span[data-icon="send"]').closest('div[role="button"]');

            if (mediaSendBtn) {
                mediaSendBtn.click();
            } else {
                throw new Error("Could not find media send button");
            }

        } catch (err) {
            console.error("Failed to attach file:", err);
            throw new Error("Failed to attach file");
        }
    } else {
        // If there was no file and no text was initially sent, it might be an invalid state
        if (!sendBtn) {
            console.warn("No send button found, message might be blank or invalid number.");
            throw new Error("Contact not on WhatsApp, invalid number, or blank message.");
        }
    }

    // Wait for the message to be sent (clock icon disappears)
    await sleep(1500);

    return true;
}

function waitForElement(selector, timeoutMs) {
    return new Promise((resolve, reject) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        let observer;
        let timeout;

        observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                clearTimeout(timeout);
                resolve(el);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        timeout = setTimeout(() => {
            observer.disconnect();
            reject(new Error("Timeout waiting for WhatsApp Chat to load: " + selector));
        }, timeoutMs);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
}
