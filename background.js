const DEFAULT_FLAGS = {
	autoClickNext: true,
	autoClickSkip: true,
	autoClickSkipRecaps: true,
};

const SUPPORTED_SITES = ["netflix", "hotstar"];

function withDefaults(flags) {
	return { ...DEFAULT_FLAGS, ...(flags || {}) };
}

function deriveSitePreferences(existingSitePrefs, legacyFlags) {
	const sitePreferences = {};
	SUPPORTED_SITES.forEach((site) => {
		const current = existingSitePrefs && typeof existingSitePrefs === "object" ? existingSitePrefs[site] : undefined;
		sitePreferences[site] = withDefaults(current || legacyFlags);
	});
	return sitePreferences;
}

chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.get(["sitePreferences", "autoClickNext", "autoClickSkip", "autoClickSkipRecaps"], (data) => {
		if (chrome.runtime.lastError) {
			console.error("Error reading storage:", chrome.runtime.lastError);
			return;
		}

		const legacyFlags = {
			autoClickNext: typeof data.autoClickNext === "boolean" ? data.autoClickNext : DEFAULT_FLAGS.autoClickNext,
			autoClickSkip: typeof data.autoClickSkip === "boolean" ? data.autoClickSkip : DEFAULT_FLAGS.autoClickSkip,
			autoClickSkipRecaps:
				typeof data.autoClickSkipRecaps === "boolean"
					? data.autoClickSkipRecaps
					: DEFAULT_FLAGS.autoClickSkipRecaps,
		};

		const mergedSitePreferences = deriveSitePreferences(data.sitePreferences, legacyFlags);

		chrome.storage.local.set({ sitePreferences: mergedSitePreferences }, () => {
			if (chrome.runtime.lastError) {
				console.error("Error setting storage:", chrome.runtime.lastError);
			}
		});
	});
});
