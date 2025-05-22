const toggle = document.getElementById('toggle');
const sidebarToggle = document.getElementById('sidebarToggle');
const errorMsg = document.getElementById('error');
const retryBtn = document.getElementById('retry');

chrome.storage.local.get(['helperEnabled', 'helperDataError', 'sidebarEnabled'], data => {
  toggle.checked = Boolean(data.helperEnabled);
  sidebarToggle.checked = Boolean(data.sidebarEnabled);
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
