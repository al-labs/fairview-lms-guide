# Fairview LMS Guide

This repository contains a Chrome extension that provides contextual guidance while navigating the Fairview Learning Management System (Cornerstone). The extension injects help tips into the LMS based on rules defined in `help-data.json`.

## Directory structure

```
/extension
├── manifest.json      # Chrome extension manifest
├── help-data.json     # Mapping of LMS pages to help text
├── icons/             # Extension icons
└── scripts/           # Content and background scripts
```

The `extension` folder is what you load as an unpacked extension during development.

## Editing `help-data.json` on SharePoint

1. Sign in to the Fairview SharePoint site.
2. Browse to **Shared Documents** and locate `help-data.json` under the extension folder.
3. Choose **Edit** to modify the file in the browser or download it and edit locally.
4. Save your changes on SharePoint so the latest help content is available to everyone.
5. Copy the updated file into the `extension` directory before building or deploying the extension.

## Building/packing the extension

After updating the files, pack the extension into a CRX package using Chrome:

```bash
chrome.exe --pack-extension=extension --pack-extension-key=extension.pem
```

This command creates `extension.crx` and updates `extension.pem` with the private key.

## Computing the CRX hash

Some deployment methods require the SHA‑256 hash of the CRX. Calculate it with `openssl`:

```bash
openssl dgst -sha256 -binary extension.crx | openssl base64 -A
```

Record the resulting value for use in policies or update manifests.

## Prerequisites and permissions

- Chrome or another Chromium-based browser installed.
- Developer Mode enabled to load the unpacked extension during development.
- The manifest must request permissions for the Cornerstone domain (e.g., `https://*.csod.com/*`) and any other browser APIs the scripts use.
- You may need administrator rights if the extension is deployed via group policy.
