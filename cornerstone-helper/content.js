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

function init() {
  chrome.storage.local.get(['helperEnabled', 'helperData'], result => {
    if (!result.helperEnabled || !Array.isArray(result.helperData)) return;
    applyTooltips(result.helperData);
  });
}

document.addEventListener('DOMContentLoaded', init);
