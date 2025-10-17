const DEFAULT_FLAGS = {
	autoClickNext: true,
	autoClickSkip: true,
	autoClickSkipRecaps: true,
};

const buttons = {
	autoClickSkip: [
		'button.button-primary.watch-video--skip-content-button[data-uia="player-skip-intro"]',
		{ text: 'Skip Intro' },
	],
	autoClickSkipRecaps: [
		'button.button-primary.watch-video--skip-recaps-button',
		'button.button-primary.watch-video--skip-content-button[data-uia="player-skip-recap"]',
		{ text: 'Skip Recap' },
	],
	autoClickNext: [
		'button.color-primary.hasLabel.hasIcon[data-uia="next-episode-seamless-button"]',
		'button.hasLabel.hasIcon[data-uia="next-episode-seamless-button-draining"]',
		{ selector: 'button > span > span', closest: 'button, [role="button"]', text: ['Next Episode'] },
		{ text: ['Next Episode'] },
	],
};

function withDefaults(flags) {
	return { ...DEFAULT_FLAGS, ...(flags || {}) };
}

function getSiteKey(hostname) {
	const h = (hostname || '').toLowerCase();
	if (h.includes('netflix')) {
		return 'netflix';
	}
	if (h.includes('hotstar') || h.includes('disney') || h.includes('jio')) {
		return 'hotstar';
	}
	return 'netflix';
}

function readSitePreferences(cb) {
	const siteKey = getSiteKey(window.location.hostname);
	chrome.storage.local.get(['sitePreferences'], (data) => {
		if (chrome.runtime.lastError) {
			console.error('Error getting preferences:', chrome.runtime.lastError);
			cb(withDefaults());
			return;
		}
		const sitePreferences =
			data &&
			data.sitePreferences &&
			typeof data.sitePreferences === 'object' &&
			data.sitePreferences[siteKey];
		cb(withDefaults(sitePreferences));
	});
}

function findButton(match) {
	if (typeof match === 'string') {
		return document.querySelector(match);
	}

	if (match && match.selector) {
		const elements = Array.from(document.querySelectorAll(match.selector));
		for (const element of elements) {
			const candidate = match.closest ? element.closest(match.closest) : element;
			if (!candidate) {
				continue;
			}
			if (match.text) {
				const targetTexts = Array.isArray(match.text)
					? match.text.map((text) => text.toLowerCase())
					: [match.text.toLowerCase()];
				const content = candidate.textContent && candidate.textContent.toLowerCase();
				if (!content || !targetTexts.some((targetText) => content.includes(targetText))) {
					continue;
				}
			}
			return candidate;
		}
		return null;
	}

	if (match && match.text) {
		const candidates = Array.from(document.querySelectorAll('button, [role="button"]'));
		const targetTexts = Array.isArray(match.text)
			? match.text.map((text) => text.toLowerCase())
			: [match.text.toLowerCase()];
		return candidates.find((el) => {
			const content = el.textContent && el.textContent.toLowerCase();
			return content && targetTexts.some((targetText) => content.includes(targetText));
		});
	}

	return null;
}

function detectAndClick() {
	try {
		readSitePreferences((preferences) => {
			for (const [key, selectors] of Object.entries(buttons)) {
				if (!preferences[key]) {
					continue;
				}
				const button = selectors.map(findButton).find(Boolean);
				if (button && !button.clicked) {
					button.clicked = true;
					button.click();
				}
			}
		});
	}
	catch(e) {	
		console.log(e)
	}
}

const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
		if(mutation.type !== "childList" || !mutation.addedNodes.length) {
			continue
		}
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { 
                detectAndClick();
            }
        });
    }
});


observer.observe(document.body, {
    childList: true,
    subtree: true
});


detectAndClick();
