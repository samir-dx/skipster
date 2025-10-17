# SkipSter — Skip intros & credits on Netflix & Hotstar

Browser extension that auto-detects and skips intros, recaps and end credits on Netflix and Hotstar. The extension adapts to each site's UI, so the in-extension controls follow the site's visual theme.

Hotstar theme (example):
![Hotstar View](https://raw.githubusercontent.com/samir-cogoport/store/refs/heads/main/images/hotstar-view.png)

Netflix theme (example):
![Netflix View](https://raw.githubusercontent.com/samir-cogoport/store/refs/heads/main/images/netflix-view.png)

Features
- Auto-skip intros, recaps and end credits where supported.
- Manual skip and next-episode controls in the extension popup.
- Minimal permissions — runs only on netflix.com and hotstar.com.

Supported sites
- netflix.com
- hotstar.com

Installation (developer / local)
1. Clone the repo: git clone https://github.com/samir-dx/skipster
2. Load the extension in your browser:
   - Chrome/Edge: go to chrome://extensions, enable "Developer mode", click "Load unpacked" and select the project folder.
   - Firefox: go to about:debugging, click "This Firefox" → "Load Temporary Add-on…" and pick the manifest file.

Privacy & permissions
- Does not collect, transmit, or store personal user data externally. Preferences are stored locally in localStorage.
- Requests only the minimal permissions needed to interact with the playback UI on supported sites.
See privacy.md for full details.

Contributing
- Bug reports and feature requests: open an issue on the GitHub repository: https://github.com/samir-dx/skipster
- Pull requests welcome.

License
- MIT — see LICENSE file.