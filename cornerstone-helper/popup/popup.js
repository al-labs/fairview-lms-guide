const toggle = document.getElementById('toggle');
const sidebarToggle = document.getElementById('sidebarToggle');
const calloutToggle = document.getElementById('calloutToggle');
const errorMsg = document.getElementById('error');
const retryBtn = document.getElementById('retry');

chrome.storage.local.get(['helperEnabled', 'helperDataError', 'sidebarEnabled', 'calloutsEnabled'], data => {
  toggle.checked = Boolean(data.helperEnabled);
  sidebarToggle.checked = Boolean(data.sidebarEnabled);
  calloutToggle.checked = data.calloutsEnabled !== false; // default true
  if (data.helperDataError) {
    errorMsg.style.display = 'block';
    retryBtn.style.display = 'inline-block';
  }
});

toggle.addEventListener('change', () => {
  chrome.storage.local.set({ helperEnabled: toggle.checked });
});

sidebarToggle.addEventListener('change', () => {
  chrome.storage.local.set({ sidebarEnabled: sidebarToggle.checked });
});

calloutToggle.addEventListener('change', () => {
  chrome.storage.local.set({ calloutsEnabled: calloutToggle.checked });
});

retryBtn.addEventListener('click', () => {
  errorMsg.style.display = 'none';
  retryBtn.disabled = true;
  chrome.runtime.sendMessage('reloadHelperData', response => {
    retryBtn.disabled = false;
    if (response && response.success) {
      errorMsg.style.display = 'none';
      retryBtn.style.display = 'none';
    } else {
      errorMsg.style.display = 'block';
    }
  });
});
