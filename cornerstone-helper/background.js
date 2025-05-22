const DATA_URL = 'https://sharepoint.example.com/helper-data.json';

async function loadHelperData() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    await chrome.storage.local.set({ helperData: data });
  } catch (err) {
    console.error('Failed to load helper data', err);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ helperEnabled: true }, loadHelperData);
});

chrome.runtime.onStartup.addListener(loadHelperData);
