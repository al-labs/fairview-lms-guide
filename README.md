# Fairview LMS Guide

This repository contains a Chrome extension that provides contextual guidance while navigating the Fairview Learning Management System (Cornerstone). The extension injects help tips into the LMS based on rules defined in `help-data.json`.

At runtime `cornerstone-helper/background.js` fetches `helper-data.json` from the Fairview SharePoint site and stores the result in `chrome.storage.local`. The content script then reads this stored data to display tooltips. If the network request fails (for example when offline), the extension falls back to any `help-data.json` bundled with the extension.

## Directory structure

```
cornerstone-helper/
├── manifest.json  # Chrome extension manifest
├── background.js  # Service worker script
├── content.js     # Injected page script
├── style.css      # Styles for inserted helpers
├── popup/         # Browser action popup
│   ├── popup.html
│   └── popup.js
└── help-data.json # Local fallback copy of the help mappings
```

The `cornerstone-helper` folder is what you load as an unpacked extension during development.
Optionally include a `help-data.json` file here so the extension has a fallback when SharePoint isn't reachable.
Each entry in the file describes a page and its associated tooltips:

```
{
  "pageUrlPattern": "/learning/course/*",             # URL pattern for the page
  "info": "Optional notes or links",                  # optional
  "steps": [
    {
      "selector": "CSS selector for the element",
      "text": "Tooltip text",
      "bgColor": "#0055ff",                 # optional background color
      "textColor": "#ffffff"                # optional text color
    },
    {
      "selector": "#startButton",
      "text": "Click here to start the course.",
      "trigger": "click"                      # optional trigger type
    }
  ]
}
```

`bgColor` and `textColor` are optional on each step. They control the tooltip's
background and text colors and can be overridden using CSS variables or data
attributes on the generated `.helper-tooltip` element.


## Editing `help-data.json` on SharePoint

1. Sign in to the Fairview SharePoint site.
2. Browse to **Shared Documents** and locate `help-data.json` under the `cornerstone-helper` folder.
3. Choose **Edit** to modify the file in the browser or download it and edit locally.
4. Save your changes on SharePoint so the latest help content is available to everyone.
5. Copy the updated file into the `cornerstone-helper` directory before building or deploying the extension.

## Building/packing the extension

After updating the files, pack the extension into a CRX package using Chrome. If you want offline operation, place a `help-data.json` file in the `cornerstone-helper` folder so it gets included:

```bash
chrome.exe --pack-extension=cornerstone-helper --pack-extension-key=extension.pem
```

This command creates `cornerstone-helper.crx` and updates `extension.pem` with the private key.

## Computing the CRX hash

Some deployment methods require the SHA‑256 hash of the CRX. Calculate it with `openssl`:

```bash
openssl dgst -sha256 -binary cornerstone-helper.crx | openssl base64 -A
```

Record the resulting value for use in policies or update manifests.

## Prerequisites and permissions

- Chrome or another Chromium-based browser installed.
- Developer Mode enabled to load the unpacked extension during development.
- The manifest must request permissions for the Cornerstone domain (e.g., `https://*.csod.com/*`) and any other browser APIs the scripts use.
- You may need administrator rights if the extension is deployed via group policy.

## Tooltip sidebar

The extension can display a sidebar listing all tooltip texts available for the
current page. Use the popup menu to toggle this sidebar on or off.

1. Click the extension icon in the browser toolbar.
2. Enable **Show Tips Sidebar**.
3. Reload the Cornerstone page if necessary.

When enabled, a panel appears on the right side of the page containing each tip
that matches the current URL pattern from `help-data.json`.
