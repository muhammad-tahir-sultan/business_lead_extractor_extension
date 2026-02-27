import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WhatsAppCampaignState, WhatsAppContact } from '../types/whatsapp';
import { chromeStorage } from './chromeStorage';

interface WhatsAppStore extends WhatsAppCampaignState {
    setStep: (step: number) => void;
    setContacts: (contacts: WhatsAppContact[]) => void;
    setTemplate: (template: string) => void;
    setAttachment: (attachment: WhatsAppCampaignState['attachment']) => void;
    updateSettings: (settings: Partial<WhatsAppCampaignState['settings']>) => void;
    updateStats: (stats: Partial<WhatsAppCampaignState['stats']>) => void;
    setCampaignRunning: (running: boolean) => void;
    setShouldStop: (stop: boolean) => void;
    resetStats: () => void;
    reset: () => void;
}

const DEFAULT_SETTINGS: WhatsAppCampaignState['settings'] = {
    delayBase: 12,
    randomizeDelay: true,
    pauseBatch: true,
    batchSize: 50,
    skipExisting: true,
    sendCv: false,
};

const INITIAL_STATS: WhatsAppCampaignState['stats'] = {
    processed: 0,
    sent: 0,
    invalid: 0,
    history: 0,
};

export const useWhatsAppStore = create<WhatsAppStore>()(
    persist(
        (set) => ({
            currentStep: 1,
            contacts: [],
            template: '',
            attachment: null,
            settings: DEFAULT_SETTINGS,
            stats: INITIAL_STATS,
            isCampaignRunning: false,
            shouldStop: false,

            setStep: (step) => set({ currentStep: step }),
            setContacts: (contacts) => set({ contacts }),
            setTemplate: (template) => set({ template }),
            setAttachment: (attachment) => set({ attachment }),
            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),
            updateStats: (newStats) => set((state) => ({
                stats: { ...state.stats, ...newStats }
            })),
            setCampaignRunning: (running) => set({ isCampaignRunning: running }),
            setShouldStop: (stop) => set({ shouldStop: stop }),
            resetStats: () => set({ stats: INITIAL_STATS }),
            reset: () => set({
                currentStep: 1,
                contacts: [],
                template: '',
                attachment: null,
                settings: DEFAULT_SETTINGS,
                stats: INITIAL_STATS,
                isCampaignRunning: false,
                shouldStop: false,
            })
        }),
        {
            name: 'whatsapp-store',
            storage: createJSONStorage(() => chromeStorage),
        }
    )
);
