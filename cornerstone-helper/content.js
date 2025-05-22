function applyTooltips(data) {
  data.forEach(item => {
    const elements = document.querySelectorAll(item.selector);
    elements.forEach(el => {
      const tip = document.createElement('span');
      tip.className = 'helper-tooltip';
      tip.textContent = item.text;
      el.style.position = 'relative';
      el.appendChild(tip);
    });
  });
}

function removeTooltips() {
  document.querySelectorAll('.helper-tooltip').forEach(tip => tip.remove());
}

function updateTooltips() {
  chrome.storage.local.get(['helperEnabled', 'helperData'], result => {
    removeTooltips();
    if (result.helperEnabled && Array.isArray(result.helperData)) {
      applyTooltips(result.helperData);
    }
  });
}

function init() {
  updateTooltips();
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.helperEnabled || changes.helperData)) {
      updateTooltips();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
