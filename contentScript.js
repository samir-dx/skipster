const BUTTONS = {
  autoClickSkip: [
    {
      selectors: [
        'button.button-primary.watch-video--skip-content-button[data-uia="player-skip-intro"]',
        { text: "Skip Intro" },
      ],
    },
  ],
  autoClickSkipRecaps: [
    {
      selectors: [
        "button.button-primary.watch-video--skip-recaps-button",
        'button.button-primary.watch-video--skip-content-button[data-uia="player-skip-recap"]',
        { text: "Skip Recap" },
      ],
    },
  ],
  autoClickNext: [
    {
      selectors: [
        'button.color-primary.hasLabel.hasIcon[data-uia="next-episode-seamless-button"]',
        'button.hasLabel.hasIcon[data-uia="next-episode-seamless-button-draining"]',
        {
          selector: "button > span > span",
          closest: 'button, [role="button"]',
          text: ["Next Episode"],
        },
        { text: ["Next Episode"] },
      ],
      platform: ['netflix', 'hotstar']
    },
    {
      selectors: [
        '.atv-web-player-next-episode-button-wrapper.button',
		'.atvwebpplayersdk-nextupcard-button',
		'.atvwebplayersdk-nextupcard-button'
      ],
      platform: ['primevideo']
    }
  ],
};

function findButton(match) {
  if (typeof match === "string") {
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
        const content =
          candidate.textContent && candidate.textContent.toLowerCase();
        if (
          !content ||
          !targetTexts.some((targetText) => content.includes(targetText))
        ) {
          continue;
        }
      }
      return candidate;
    }
    return null;
  }

  if (match && match.text) {
    const candidates = Array.from(
      document.querySelectorAll('button, [role="button"]')
    );
    const targetTexts = Array.isArray(match.text)
      ? match.text.map((text) => text.toLowerCase())
      : [match.text.toLowerCase()];
    return candidates.find((el) => {
      const content = el.textContent && el.textContent.toLowerCase();
      return (
        content &&
        targetTexts.some((targetText) => content.includes(targetText))
      );
    });
  }

  return null;
}

/**
 * Safely call chrome.storage.local.get.
 * - If storage API isn't available, calls cb with an empty object.
 * - Catches runtime.lastError and exceptions inside the callback.
 * - Silently ignores "Extension context invalidated" errors.
 */
function safeStorageGet(keys, cb) {
  try {
    const hasStorage =
      typeof chrome !== "undefined" &&
      chrome &&
      chrome.storage &&
      chrome.storage.local &&
      typeof chrome.storage.local.get === "function";

    if (!hasStorage) {
      cb({});
      return;
    }

    chrome.storage.local.get(keys, (data) => {
      try {
        if (chrome.runtime && chrome.runtime.lastError) {
          const msg = chrome.runtime.lastError.message || "";
          if (msg.includes("Extension context invalidated")) {
            // Extension unloaded/reloaded — ignore silently.
            return;
          }
          console.error("SkipSter storage error:", chrome.runtime.lastError);
          // continue with whatever data we got (or empty)
        }
        cb(data || {});
      } catch (innerErr) {
        if (
          innerErr &&
          innerErr.message &&
          innerErr.message.includes("Extension context invalidated")
        ) {
          return;
        }
        console.error("SkipSter storage callback threw:", innerErr);
        cb({});
      }
    });
  } catch (err) {
    if (err && err.message && err.message.includes("Extension context invalidated")) {
      return;
    }
    console.error("SkipSter safeStorageGet failed:", err);
    cb({});
  }
}

function detectAndClick() {
  try {
    const hostname = window.location.hostname.toLowerCase();
    safeStorageGet(
      ["autoClickNext", "autoClickSkip", "autoClickSkipRecaps"],
      (data) => {
        try {
          for (const [key, selectorArr] of Object.entries(BUTTONS)) {
            if (!data[key]) {
              continue;
            }

            if (!Array.isArray(selectorArr)) {
              continue;
            }

            const cusSelector =
              selectorArr.find(
                (item) =>
                  Array.isArray(item.platform) &&
                  item.platform.some((p) => hostname.includes(p))
              ) || selectorArr.find((item) => !item.platform);

            if (!cusSelector) continue;

            const selectors = Array.isArray(cusSelector.selectors)
              ? cusSelector.selectors
              : [];

            const button = selectors.map(findButton).find(Boolean);
            if (button && button instanceof Element) {
              if (!button.dataset.skipsterClicked) {
                button.dataset.skipsterClicked = "1";
                button.click();
              }
            }
          }
        } catch (cbErr) {
          console.error("SkipSter content script error (callback):", cbErr);
        }
      }
    );
  } catch (e) {
    console.error("SkipSter content script error:", e);
  }
}

const observer = new MutationObserver((mutations) => {
  for (let mutation of mutations) {
    if (mutation.type !== "childList" || !mutation.addedNodes.length) {
      continue;
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
  subtree: true,
});

detectAndClick();