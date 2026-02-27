import { WhatsAppEngine } from '../services/whatsapp';

console.log("[Premium Scraper] WhatsApp Content script active.");

const engine = new WhatsAppEngine();

chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (request.action === 'ping') {
        sendResponse({ pong: true });
        return true;
    }
    if (request.action === 'send_wa_message') {
        engine.sendMessage(
            request.phone,
            request.text,
            request.fileData,
            request.skipExisting
        ).then(sendResponse);
        return true; // async response
    }
});
