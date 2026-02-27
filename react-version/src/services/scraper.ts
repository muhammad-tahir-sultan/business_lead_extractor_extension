import type { Lead } from '../types/scraper';

export class MapsScraperEngine {
    private isCancelled: boolean = false;
    private callbacks: {
        onStatus: (msg: string) => void;
        onProgress: (perc: number) => void;
        onLeadsFound: (count: number) => void;
    };

    constructor(callbacks: {
        onStatus: (msg: string) => void;
        onProgress: (perc: number) => void;
        onLeadsFound: (count: number) => void;
    }) {
        this.callbacks = callbacks;
    }

    public cancel() {
        this.isCancelled = true;
    }

    private async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private isContextValid() {
        return !!chrome.runtime?.id;
    }

    public async scrape(maxResults: number): Promise<Lead[]> {
        this.isCancelled = false;
        this.callbacks.onStatus('Searching for scrollable feed...');

        const scrollContainer = document.querySelector('[role="feed"]');
        if (!scrollContainer) {
            throw new Error('Could not find scrollable feed. Make sure you are on a Google Maps search results page.');
        }

        let lastHeight = 0;
        let attempts = 0;

        // Phase 1: Scrolling to load all leads
        while (attempts < 5 && !this.isCancelled && this.isContextValid()) {
            scrollContainer.scrollTo(0, scrollContainer.scrollHeight);

            // Fast wait normally
            await this.sleep(3000);

            const currentCount = document.querySelectorAll('.hfpxzc').length;
            this.callbacks.onLeadsFound(currentCount);

            if (currentCount >= maxResults) {
                this.callbacks.onStatus(`Found ${currentCount} listings. Reach target.`);
                break;
            }

            const feedText = (scrollContainer as HTMLElement).innerText || "";
            if (feedText.includes("You've reached the end of the list.")) {
                this.callbacks.onStatus(`End of list reached. Total listings: ${currentCount}`);
                break;
            }

            if (scrollContainer.scrollHeight === lastHeight) {
                attempts++;
                this.callbacks.onStatus(`Slow loading... Retry ${attempts}/5 (Waiting 20s)`);
                await this.sleep(20000);
            } else {
                attempts = 0;
                this.callbacks.onStatus(`Scrolling... (${currentCount} found)`);
            }
            lastHeight = scrollContainer.scrollHeight;
        }

        // Phase 2: Extraction
        this.callbacks.onStatus('Beginning extraction detail...');
        const results: Lead[] = [];
        const allItems = Array.from(document.querySelectorAll('.hfpxzc')) as HTMLElement[];
        const items = allItems.slice(0, maxResults);

        for (let i = 0; i < items.length; i++) {
            if (this.isCancelled || !this.isContextValid()) break;

            const item = items[i];
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            item.click();

            await this.sleep(1500);

            const lead = this.extractCurrentDetails();
            if (lead) {
                results.push(lead);
                this.callbacks.onProgress(Math.round(((i + 1) / items.length) * 100));
            }
        }

        return results;
    }

    private extractCurrentDetails(): Lead | null {
        try {
            const name = document.querySelector('.DUwDvf')?.textContent || 'N/A';
            const ratingStr = document.querySelector('span.ceNzR .TT9eCd')?.textContent || '0';
            const reviewsStr = document.querySelector('span.ceNzR .zS799c')?.textContent || '0';

            const category = document.querySelector('button[jsaction="pane.rating.category"]')?.textContent || 'N/A';
            const address = document.querySelector('button[data-item-id="address"]')?.textContent || 'N/A';
            const phone = document.querySelector('button[data-tooltip="Copy phone number"]')?.textContent || 'N/A';
            const website = document.querySelector('a[data-item-id="authority"]')?.getAttribute('href') || 'N/A';

            return {
                name,
                rating: parseFloat(ratingStr) || 0,
                reviewsCount: parseInt(reviewsStr.replace(/[^0-9]/g, '')) || 0,
                category,
                address,
                phone,
                website,
                mapsUrl: window.location.href
            };
        } catch (e) {
            console.error("Extraction error:", e);
            return null;
        }
    }
}
