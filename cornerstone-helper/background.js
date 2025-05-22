const DATA_URL = 'https://sharepoint.example.com/helper-data.json';

async function loadHelperData() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    await chrome.storage.local.set({ helperData: data, helperDataError: false });
  } catch (err) {
    console.error('Failed to load helper data', err);
    await chrome.storage.local.set({ helperDataError: true });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    helperEnabled: true,
    sidebarEnabled: false,
    calloutsEnabled: true,
  }, loadHelperData);
});

chrome.runtime.onStartup.addListener(loadHelperData);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === 'reloadHelperData') {
    loadHelperData().then(() => sendResponse({ success: true })).catch(() => sendResponse({ success: false }));
    return true; // keep the message channel open for async response
  }
});
