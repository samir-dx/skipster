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
		{ text: 'Next Episode' },
	],
};

function findButton(match) {
	if (typeof match === 'string') {
		return document.querySelector(match);
	}

	if (match && match.selector) {
		return document.querySelector(match.selector);
	}

	if (match && match.text) {
		const candidates = Array.from(document.querySelectorAll('button, [role="button"]'));
		const targetText = match.text.toLowerCase();
		return candidates.find((el) => {
			const content = el.textContent && el.textContent.toLowerCase();
			return content && content.includes(targetText);
		});
	}

	return null;
}

function detectAndClick() {
	try {
		chrome.storage.local.get(["autoClickNext", "autoClickSkip", "autoClickSkipRecaps"], (data) => {
			for (const [key, selectors] of Object.entries(buttons)) {
				if (!data[key]) {
					continue
				}; 
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
