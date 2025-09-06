import browser from "webextension-polyfill";

// Simple function to get base URL: check browser storage, else fallback to Vite env
export async function getBaseUrl(): Promise<string> {
    try {
        const result = await browser.storage.local.get(["customApiUrl"]);
        const customUrl = result.customApiUrl;

        if (customUrl && typeof customUrl === 'string' && customUrl.trim()) {
            return customUrl.replace(/\/$/, ''); // Remove trailing slash
        }
    } catch (error) {
        console.error("Failed to get custom API URL:", error);
    }

    // Fallback to Vite environment variable
    return (import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/, '');
}

// Save custom API URL to browser storage
export async function saveCustomApiUrl(url: string): Promise<void> {
    const cleanUrl = url.trim().replace(/\/$/, '');
    if (cleanUrl) {
        await browser.storage.local.set({ customApiUrl: cleanUrl });
    } else {
        await browser.storage.local.remove(["customApiUrl"]);
    }
}

// Get current custom API URL for UI
export async function getCustomApiUrl(): Promise<string> {
    try {
        const result = await browser.storage.local.get(["customApiUrl"]);
        const customUrl = result.customApiUrl;
        return (typeof customUrl === 'string' ? customUrl : "");
    } catch (error) {
        return "";
    }
}
