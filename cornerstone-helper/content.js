function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function urlMatchesPattern(pattern) {
  if (!pattern) return true;
  const regex = new RegExp('^' + escapeRegex(pattern).replace(/\\\*/g, '.*') + '$');
  return regex.test(window.location.href);
}

function applyTooltips(data) {
  data.forEach(item => {
    if (item.pageUrlPattern && !urlMatchesPattern(item.pageUrlPattern)) {
      return;
    }
    const elements = document.querySelectorAll(item.selector);
    elements.forEach(el => {
      const tip = document.createElement('span');
      tip.className = 'helper-tooltip';
      tip.textContent = item.text;

      if (item.bgColor) {
        tip.style.setProperty('--helper-bg-color', item.bgColor);
        tip.dataset.bgColor = item.bgColor;
      }
      if (item.textColor) {
        tip.style.setProperty('--helper-text-color', item.textColor);
        tip.dataset.textColor = item.textColor;
      }

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
