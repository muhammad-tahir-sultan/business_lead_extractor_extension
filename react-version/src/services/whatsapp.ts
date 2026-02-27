export class WhatsAppEngine {

    constructor() { }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private base64ToBlob(base64: string, mime: string) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        return new Blob([new Uint8Array(byteNumbers)], { type: mime });
    }

    private async waitForElement(selector: string, timeout = 10000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const el = document.querySelector(selector);
            if (el) return el;
            await this.sleep(500);
        }
        return null;
    }

    public async sendMessage(
        _phone: string,
        text: string,
        fileData?: { base64: string; mime: string; filename: string },
        skipExisting = false
    ): Promise<{ success: boolean; error?: string }> {
        try {
            // 1. Open Chat

            // In a content script, we can't easily change the URL of the tab we are in
            // if we want to stay in WA Web context. We assume the background script 
            // has already navigated us or we use a different approach.
            // For now, let's port the logic that assumes we are ALREADY in the correct chat 
            // OR the background script is handling navigation.

            // Wait for chat to load
            const editor = await this.waitForElement('div[contenteditable="true"]');
            if (!editor) return { success: false, error: "Chat didn't load in time" };

            // 2. Check for "Number isn't on WhatsApp"
            const invalidPop = document.querySelector('div[role="alert"]')?.textContent?.includes("Number isn't on WhatsApp");
            if (invalidPop) return { success: false, error: "Number isn't on WhatsApp - skipped" };

            // 3. Skip existing logic if requested
            if (skipExisting) {
                const history = document.querySelectorAll('.message-in, .message-out');
                if (history.length > 0 && text.trim()) {
                    // If history exists, we might only want to send the file
                    if (!fileData) return { success: false, error: "Skipped — Chat history already exists." };
                }
            }

            // 4. Send Text (if any)
            if (text.trim()) {
                console.log("[WA Engine] Sending text...");
                const enterEv = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', keyCode: 13 });
                editor.dispatchEvent(enterEv);
                await this.sleep(2000);
            }

            // 5. Send File (if any)
            if (fileData) {
                await this.handleFileUpload(fileData);
            }

            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.toString() };
        }
    }

    private async handleFileUpload(data: { base64: string; mime: string; filename: string }) {
        console.log("[WA Engine] Starting file upload:", data.filename);
        const blob = this.base64ToBlob(data.base64.split(',')[1] || data.base64, data.mime);
        const file = new File([blob], data.filename, { type: data.mime, lastModified: Date.now() });
        const dt = new DataTransfer();
        dt.items.add(file);

        let uploadSuccess = false;

        // Strategy A: Official Attach Menu
        const plusBtn = document.querySelector('button[aria-label="Attach"], span[data-icon="plus-rounded"], span[data-icon="clip"]');
        if (plusBtn) {
            (plusBtn.closest('button') || (plusBtn as HTMLElement)).click();
            await this.sleep(2000);

            const docBtnIcon = document.querySelector('span[data-icon="attach-document"], span[data-icon="document"]');
            if (docBtnIcon) {
                (docBtnIcon.closest('button') || (docBtnIcon as HTMLElement)).click();
                await this.sleep(1500);
            }

            const fileInputs = Array.from(document.querySelectorAll('input[type="file"]')) as HTMLInputElement[];
            const docInput = fileInputs.find(i => i.accept === '*' || !i.accept || i.accept.includes('pdf'));
            if (docInput) {
                docInput.files = dt.files;
                docInput.dispatchEvent(new Event('change', { bubbles: true }));
                uploadSuccess = true;
            }
        }

        // Strategy B: Drop Fallback
        if (!uploadSuccess) {
            const editor = document.querySelector('div[contenteditable="true"]') || document.querySelector('.lexical-rich-text-input');
            if (editor) {
                const dropOpts = { bubbles: true, cancelable: true, dataTransfer: dt };
                editor.dispatchEvent(new DragEvent('dragenter', dropOpts));
                editor.dispatchEvent(new DragEvent('dragover', dropOpts));
                await this.sleep(300);
                editor.dispatchEvent(new DragEvent('drop', dropOpts));
                uploadSuccess = true;
            }
        }

        await this.sleep(8000); // Process PDF

        // Find and click Send
        const mediaSendSelectors = ['div[role="button"][aria-label="Send"]', 'button[aria-label="Send"]', 'span[data-icon="send"]'];
        let sendBtn: HTMLElement | null = null;
        for (let i = 0; i < 20; i++) {
            for (const sel of mediaSendSelectors) {
                const icons = document.querySelectorAll(sel);
                if (icons.length > 0) {
                    const icon = icons[icons.length - 1];
                    const btn = (icon.closest('div[role="button"]') || icon.closest('button')) as HTMLElement;
                    if (btn && !btn.querySelector('span[data-icon="plus-rounded"]')) {
                        sendBtn = btn;
                        break;
                    }
                }
            }
            if (sendBtn) break;
            await this.sleep(1000);
        }

        if (sendBtn) {
            sendBtn.click();
            await this.sleep(4000);
        }
    }
}
