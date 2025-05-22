const toggle = document.getElementById('toggle');

chrome.storage.local.get('helperEnabled', data => {
  toggle.checked = Boolean(data.helperEnabled);
});

toggle.addEventListener('change', () => {
  chrome.storage.local.set({ helperEnabled: toggle.checked });
});
