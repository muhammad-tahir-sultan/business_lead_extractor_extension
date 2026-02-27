export const fileToBase64 = async (fileUrl: string): Promise<{ base64: string; mime: string; filename: string }> => {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve({
                base64: reader.result as string,
                mime: blob.type,
                filename: fileUrl.split('/').pop() || 'file.pdf'
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const personalize = (template: string, data: Record<string, any>) => {
    return template.replace(/{{(\w+)}}/g, (_, key) => data[key] || '');
};
