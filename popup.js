const nextCheckbox = document.getElementById("toggleNext");
const skipCheckbox = document.getElementById("toggleSkip");
const recapsCheckbox = document.getElementById("toggleRecaps");

const LOGOS = {
  netflix: 'images/netflix-logo.png',
  hotstar: 'images/hotstar-logo.webp',
};

function chooseLogo(hostname) {
  const h = (hostname || '').toLowerCase();
  if (h.includes('netflix')) return LOGOS.netflix;
  if (h.includes('hotstar') || h.includes('disney') || h.includes('jio')) return LOGOS.hotstar;
  return null; // return null when unknown so we can hide the img
}

function setSiteClassAndLogo(hostname) {
  const img = document.getElementById('site-logo');
  const h = (hostname || '').toLowerCase();

  document.body.classList.remove('netflix', 'hotstar');

  if (h.includes('netflix')) {
    document.body.classList.add('netflix');
    if (img) { img.src = LOGOS.netflix; img.style.display = ''; }
    return;
  }

  if (h.includes('hotstar') || h.includes('disney') || h.includes('jio')) {
    document.body.classList.add('hotstar');
    if (img) { img.src = LOGOS.hotstar; img.style.display = ''; }
    return;
  }

  // unknown site: hide logo
  if (img) {
    img.style.display = 'none';
  }
}

if (!chrome.storage) {
    console.error("chrome.storage is undefined. Ensure 'storage' permission is in manifest.json.");
} else {
    
    chrome.storage.local.get(["autoClickNext", "autoClickSkip", "autoClickSkipRecaps"], (data) => {
        nextCheckbox.checked = !!data.autoClickNext; 
        skipCheckbox.checked = !!data.autoClickSkip;
        recapsCheckbox.checked = !!data.autoClickSkipRecaps;
    });

    
    nextCheckbox.addEventListener("change", () => {
        chrome.storage.local.set({ autoClickNext: nextCheckbox.checked });
    });

    
    skipCheckbox.addEventListener("change", () => {
        chrome.storage.local.set({ autoClickSkip: skipCheckbox.checked });
    });

    
    recapsCheckbox.addEventListener("change", () => {
        chrome.storage.local.set({ autoClickSkipRecaps: recapsCheckbox.checked });
    });
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
	if (!tabs || !tabs[0] || !tabs[0].url) {
		setSiteClassAndLogo('');
		return;
	}
	try {
		const url = new URL(tabs[0].url);
		setSiteClassAndLogo(url.hostname);
	} catch (e) {
		setSiteClassAndLogo('');
	}
});