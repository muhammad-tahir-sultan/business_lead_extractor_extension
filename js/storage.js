// ── Chrome storage promise wrapper ────────────────────────────────────────────

const Storage = {
    get: (keys) => new Promise((res) => chrome.storage.local.get(keys, res)),
    set: (data) => new Promise((res) => chrome.storage.local.set(data, res)),

    async getWebAppUrl() {
        const { webAppUrl } = await this.get(['webAppUrl']);
        if (webAppUrl) return webAppUrl;

        const entered = prompt(
            'Enter your deployed Google Apps Script Web App URL:',
            'https://script.google.com/macros/s/.../exec'
        );
        if (!entered) return null;

        await this.set({ webAppUrl: entered });
        return entered;
    },
};
