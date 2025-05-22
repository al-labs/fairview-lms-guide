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
    const trigger = item.trigger || 'hover';
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

      if (trigger === 'click') {
        const icon = document.createElement('span');
        icon.className = 'helper-icon';
        icon.textContent = '❓';
        el.appendChild(icon);
        icon.addEventListener('click', () => {
          tip.classList.toggle('visible');
        });
      } else {
        el.addEventListener('mouseenter', () => {
          tip.classList.add('visible');
        });
        el.addEventListener('mouseleave', () => {
          tip.classList.remove('visible');
        });
      }
    });
  });
}

function removeTooltips() {
  document.querySelectorAll('.helper-tooltip').forEach(tip => tip.remove());
}

function createSidebar() {
  if (document.getElementById('helper-sidebar')) return;
  const sidebar = document.createElement('div');
  sidebar.id = 'helper-sidebar';
  document.body.appendChild(sidebar);
}

function removeSidebar() {
  const sb = document.getElementById('helper-sidebar');
  if (sb) sb.remove();
}

function updateSidebar(data, enabled) {
  removeSidebar();
  if (!enabled) return;
  createSidebar();
  const sidebar = document.getElementById('helper-sidebar');
  data.forEach(item => {
    if (item.pageUrlPattern && !urlMatchesPattern(item.pageUrlPattern)) {
      return;
    }
    const entry = document.createElement('div');
    entry.className = 'helper-sidebar-entry';
    entry.textContent = item.text;
    sidebar.appendChild(entry);
  });
}

function updateHelpers() {
  chrome.storage.local.get(['helperEnabled', 'helperData', 'sidebarEnabled', 'calloutsEnabled'], result => {
    removeTooltips();
    const showCallouts = result.calloutsEnabled !== false;
    if (result.helperEnabled && showCallouts && Array.isArray(result.helperData)) {
      applyTooltips(result.helperData);
    }
    updateSidebar(result.helperData || [], result.sidebarEnabled);
  });
}

function init() {
  updateHelpers();
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.helperEnabled || changes.helperData || changes.sidebarEnabled || changes.calloutsEnabled)) {
      updateHelpers();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
