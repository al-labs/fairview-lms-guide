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

let callouts = [];
let stepData = [];
let currentCalloutIndex = 0;

function removeCallouts() {
  callouts.forEach(c => c.remove());
  callouts = [];
  stepData = [];
  currentCalloutIndex = 0;
}

function applyCallouts(steps) {
  removeCallouts();
  steps.forEach(step => {
    if (step.pageUrlPattern && !urlMatchesPattern(step.pageUrlPattern)) return;
    const el = document.querySelector(step.selector);
    if (!el) return;
    const callout = document.createElement('div');
    callout.className = 'helper-callout';
    callout.textContent = step.text;
    el.style.position = 'relative';
    el.appendChild(callout);
    callouts.push(callout);
    stepData.push(step);
  });
  if (callouts.length) {
    showCallout(0);
  }
}

function showCallout(index) {
  if (index < 0 || index >= callouts.length) return;
  callouts.forEach(c => c.classList.remove('visible'));
  callouts[index].classList.add('visible');
  currentCalloutIndex = index;
}

function nextCallout() {
  if (currentCalloutIndex < callouts.length - 1) {
    showCallout(currentCalloutIndex + 1);
  }
}

function prevCallout() {
  if (currentCalloutIndex > 0) {
    showCallout(currentCalloutIndex - 1);
  }
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

function updateSidebar(enabled) {
  removeSidebar();
  if (!enabled) return;
  createSidebar();
  const sidebar = document.getElementById('helper-sidebar');
  stepData.forEach((step, idx) => {
    const entry = document.createElement('div');
    entry.className = 'helper-sidebar-entry';
    entry.textContent = step.text;
    entry.addEventListener('click', () => showCallout(idx));
    sidebar.appendChild(entry);
  });
}

function updateHelpers() {
  chrome.storage.local.get(['helperEnabled', 'helperData', 'sidebarEnabled', 'calloutsEnabled'], result => {
    removeTooltips();
    removeCallouts();

    const data = result.helperData || {};
    const tips = Array.isArray(data.tips) ? data.tips : (Array.isArray(data) ? data : []);
    const steps = Array.isArray(data.steps) ? data.steps : [];

    if (result.helperEnabled) {
      if (tips.length) {
        applyTooltips(tips);
      }
      if (result.calloutsEnabled && steps.length) {
        applyCallouts(steps);
      }
    }

    updateSidebar(result.sidebarEnabled);
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
