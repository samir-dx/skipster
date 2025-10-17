const buttons = {
	autoClickSkip: ['button.button-primary.watch-video--skip-content-button[data-uia="player-skip-intro"]'],
	autoClickSkipRecaps: ['button.button-primary.watch-video--skip-recaps-button', 'button.button-primary.watch-video--skip-content-button[data-uia="player-skip-recap"]'],
    autoClickNext: ['button.color-primary.hasLabel.hasIcon[data-uia="next-episode-seamless-button"]', 'button.hasLabel.hasIcon[data-uia="next-episode-seamless-button-draining"]'],
};

function detectAndClick() {
	try {
		chrome.storage.local.get(["autoClickNext", "autoClickSkip", "autoClickSkipRecaps"], (data) => {
			for (const [key, selectors] of Object.entries(buttons)) {
				if (!data[key]) {
					continue
				}; 
				const button = selectors.map(selector => document.querySelector(selector)).find(Boolean);
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