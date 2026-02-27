export interface WhatsAppContact {
    phone: string;
    name: string;
    [key: string]: string | number | boolean | undefined;
}

export interface WhatsAppCampaignState {
    currentStep: number;
    contacts: WhatsAppContact[];
    template: string;
    attachment: {
        file: string | null; // Base64
        name: string | null;
        mime: string | null;
    } | null;
    settings: {
        delayBase: number;
        randomizeDelay: boolean;
        pauseBatch: boolean;
        batchSize: number;
        skipExisting: boolean;
        sendCv: boolean;
    };
    stats: {
        processed: number;
        sent: number;
        invalid: number;
        history: number;
    };
    isCampaignRunning: boolean;
    shouldStop: boolean;
}
