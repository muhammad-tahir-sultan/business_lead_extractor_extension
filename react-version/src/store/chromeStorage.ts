import type { StateStorage } from 'zustand/middleware';

export const chromeStorage: StateStorage = {
    getItem: (name: string): string | Promise<string | null> | null => {
        return new Promise((resolve) => {
            chrome.storage.local.get([name], (result: { [key: string]: any }) => {
                const val = result[name];
                resolve(typeof val === 'string' ? val : null);
            });
        });
    },
    setItem: (name: string, value: string): void | Promise<void> => {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [name]: value }, () => {
                resolve();
            });
        });
    },
    removeItem: (name: string): void | Promise<void> => {
        return new Promise((resolve) => {
            chrome.storage.local.remove([name], () => {
                resolve();
            });
        });
    },
};
