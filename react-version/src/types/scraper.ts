export interface Lead {
    name: string;
    rating?: number;
    reviewsCount?: number;
    category?: string;
    address?: string;
    phone?: string;
    website?: string;
    mapsUrl?: string;
    waSent?: boolean;
}

export interface ScraperState {
    isScraping: boolean;
    totalLeads: number;
    maxResults: number;
    progress: number;
    statusMessage: string;
    results: Lead[];
    queries: string[];
    isCancelled: boolean;
}

export interface ScrapingConfig {
    query: string;
    maxResults: number;
    minRating: number;
}
