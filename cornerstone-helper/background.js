const DATA_URL = 'https://mnfhs.sharepoint.com/sites/LMSTeam/LMS%20Public/CornerstoneTraining/helper-data.json';

async function loadHelperData() {
  try {
    console.log('Attempting to fetch helper data from:', DATA_URL);
    const response = await fetch(DATA_URL);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Successfully loaded helper data:', data);
    await chrome.storage.local.set({ helperData: data, helperDataError: false });
    
  } catch (err) {
    console.error('Failed to load helper data from SharePoint:', err);
    
    // Try to load the local fallback
    try {
      const localResponse = await fetch(chrome.runtime.getURL('help-data.json'));
      if (localResponse.ok) {
        const localData = await localResponse.json();
        console.log('Loaded local fallback data:', localData);
        await chrome.storage.local.set({ helperData: localData, helperDataError: true });
      } else {
        throw new Error('Local fallback also failed');
      }
    } catch (localErr) {
      console.error('Failed to load local fallback:', localErr);
      await chrome.storage.local.set({ helperDataError: true });
    }
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed, initializing...');
  try {
    await chrome.storage.local.set({
      helperEnabled: true,
      sidebarEnabled: false,
      calloutsEnabled: true,
    });
    console.log('Initial settings saved');
    await loadHelperData();
  } catch (error) {
    console.error('Error during installation:', error);
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension starting up...');
  loadHelperData();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === 'reloadHelperData') {
    loadHelperData()
      .then(() => sendResponse({ success: true }))
      .catch(() => sendResponse({ success: false }));
    return true; // keep the message channel open for async response
  }
});