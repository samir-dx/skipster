chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ autoClickNext: true,autoClickSkipRecaps: true, autoClickSkip: true }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error setting storage:", chrome.runtime.lastError);
        } else {
            console.log("Default settings saved.");
        }
    });
});
