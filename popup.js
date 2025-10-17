const nextCheckbox = document.getElementById("toggleNext");
const skipCheckbox = document.getElementById("toggleSkip");
const recapsCheckbox = document.getElementById("toggleRecaps");

const DEFAULT_FLAGS = {
  autoClickNext: true,
  autoClickSkip: true,
  autoClickSkipRecaps: true,
};

const LOGOS = {
  netflix: 'images/netflix-logo.png',
  hotstar: 'images/hotstar-logo.webp',
};

let activeSiteKey = null;

function withDefaults(flags) {
  return { ...DEFAULT_FLAGS, ...(flags || {}) };
}

function chooseLogo(hostname) {
  const h = (hostname || '').toLowerCase();
  if (h.includes('netflix')) return LOGOS.netflix;
  if (h.includes('hotstar') || h.includes('disney') || h.includes('jio')) return LOGOS.hotstar;
  return null; // return null when unknown so we can hide the img
}

function getSiteKey(hostname) {
  const h = (hostname || '').toLowerCase();
  if (h.includes('netflix')) return 'netflix';
  if (h.includes('hotstar') || h.includes('disney') || h.includes('jio')) return 'hotstar';
  return null;
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

function setCheckboxDisabled(disabled) {
  [nextCheckbox, skipCheckbox, recapsCheckbox].forEach((checkbox) => {
    checkbox.disabled = !!disabled;
  });
}

function applyPreferences(flags) {
  const preferences = withDefaults(flags);
  nextCheckbox.checked = !!preferences.autoClickNext;
  skipCheckbox.checked = !!preferences.autoClickSkip;
  recapsCheckbox.checked = !!preferences.autoClickSkipRecaps;
}

function loadPreferencesForActiveSite() {
  if (!activeSiteKey) {
    applyPreferences(DEFAULT_FLAGS);
    return;
  }

  chrome.storage.local.get(['sitePreferences'], (data) => {
    if (chrome.runtime.lastError) {
      console.error('Error loading preferences:', chrome.runtime.lastError);
      applyPreferences(DEFAULT_FLAGS);
      return;
    }
    const sitePreferences =
      data &&
      data.sitePreferences &&
      typeof data.sitePreferences === 'object' &&
      data.sitePreferences[activeSiteKey];
    applyPreferences(sitePreferences);
  });
}

function persistPreference(flag, value) {
  if (!activeSiteKey) {
    return;
  }

  chrome.storage.local.get(['sitePreferences'], (data) => {
    if (chrome.runtime.lastError) {
      console.error('Error reading preferences before save:', chrome.runtime.lastError);
      return;
    }

    const existing =
      data && data.sitePreferences && typeof data.sitePreferences === 'object'
        ? data.sitePreferences
        : {};

    const updatedForSite = { ...withDefaults(existing[activeSiteKey]), [flag]: value };
    const nextPreferences = { ...existing, [activeSiteKey]: updatedForSite };

    chrome.storage.local.set({ sitePreferences: nextPreferences }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving preference:', chrome.runtime.lastError);
      }
    });
  });
}

if (!chrome.storage) {
    console.error("chrome.storage is undefined. Ensure 'storage' permission is in manifest.json.");
} else {

    nextCheckbox.addEventListener("change", () => {
        persistPreference('autoClickNext', nextCheckbox.checked);
    });

    skipCheckbox.addEventListener("change", () => {
        persistPreference('autoClickSkip', skipCheckbox.checked);
    });

    recapsCheckbox.addEventListener("change", () => {
        persistPreference('autoClickSkipRecaps', recapsCheckbox.checked);
    });
}

setCheckboxDisabled(true);
applyPreferences(DEFAULT_FLAGS);

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
	if (!tabs || !tabs[0] || !tabs[0].url) {
		activeSiteKey = null;
		setSiteClassAndLogo('');
		setCheckboxDisabled(true);
		return;
	}
	try {
		const url = new URL(tabs[0].url);
		activeSiteKey = getSiteKey(url.hostname);
		setSiteClassAndLogo(url.hostname);
		if (!activeSiteKey) {
			setCheckboxDisabled(true);
			applyPreferences(DEFAULT_FLAGS);
			return;
		}
		setCheckboxDisabled(false);
		loadPreferencesForActiveSite();
	} catch (e) {
		activeSiteKey = null;
		setSiteClassAndLogo('');
		setCheckboxDisabled(true);
	}
});
