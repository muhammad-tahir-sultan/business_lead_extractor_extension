import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ScraperState, Lead } from '../types/scraper';
import { chromeStorage } from './chromeStorage';

interface ScraperStore extends ScraperState {
    setScraping: (isScraping: boolean) => void;
    setResults: (results: Lead[]) => void;
    addLead: (lead: Lead) => void;
    updateStatus: (message: string) => void;
    setProgress: (progress: number) => void;
    setMaxResults: (max: number) => void;
    addQuery: (query: string) => void;
    removeQuery: (query: string) => void;
    cancelScraping: () => void;
    reset: () => void;
}

export const useScraperStore = create<ScraperStore>()(
    persist(
        (set) => ({
            isScraping: false,
            totalLeads: 0,
            maxResults: 100,
            progress: 0,
            statusMessage: 'Ready to scrape',
            results: [],
            queries: [],
            isCancelled: false,

            setScraping: (isScraping) => set({ isScraping, isCancelled: false }),
            setResults: (results) => set({ results, totalLeads: results.length }),
            addLead: (lead) => set((state) => ({
                results: [...state.results, lead],
                totalLeads: state.results.length + 1
            })),
            updateStatus: (message) => set({ statusMessage: message }),
            setProgress: (progress) => set({ progress }),
            setMaxResults: (maxResults) => set({ maxResults }),
            addQuery: (query) => set((state) => ({
                queries: state.queries.includes(query) ? state.queries : [query, ...state.queries]
            })),
            removeQuery: (query) => set((state) => ({
                queries: state.queries.filter(q => q !== query)
            })),
            cancelScraping: () => set({ isCancelled: true, isScraping: false }),
            reset: () => set({
                isScraping: false,
                totalLeads: 0,
                progress: 0,
                statusMessage: 'Ready to scrape',
                results: [],
                isCancelled: false
            })
        }),
        {
            name: 'scraper-store',
            storage: createJSONStorage(() => chromeStorage),
        }
    )
);
