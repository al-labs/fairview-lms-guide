function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function urlMatchesPattern(pattern) {
  if (!pattern) return true;
  const regex = new RegExp('^' + escapeRegex(pattern).replace(/\\\*/g, '.*') + '$');
  return regex.test(window.location.href);
}

function applyTooltips(data) {
  data.forEach((page, pageIndex) => {
    if (page.pageUrlPattern && !urlMatchesPattern(page.pageUrlPattern)) {
      return;
    }
    const steps = Array.isArray(page.steps) ? page.steps : [];
    steps.forEach((item, stepIndex) => {
      const stepId = `${pageIndex}-${stepIndex}`;
      const elements = document.querySelectorAll(item.selector);
      const trigger = item.trigger || 'hover';
      elements.forEach(el => {
        const tip = document.createElement('span');
        tip.className = 'helper-tooltip';
        tip.textContent = item.text;
        tip.dataset.stepId = stepId;

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
  });
}

function removeTooltips() {
  document.querySelectorAll('.helper-tooltip').forEach(tip => tip.remove());
}

function showTooltip(stepId) {
  const tip = document.querySelector(`.helper-tooltip[data-step-id="${stepId}"]`);
  if (tip) {
    tip.classList.add('visible');
    setTimeout(() => tip.classList.remove('visible'), 4000);
  }
}

function createSidebar() {
  if (document.getElementById('helper-sidebar')) return;
  const sidebar = document.createElement('div');
  sidebar.id = 'helper-sidebar';

  // Show Callouts toggle
  const toggleLabel = document.createElement('label');
  toggleLabel.className = 'callout-toggle';
  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.id = 'helper-callout-toggle';
  toggleLabel.appendChild(toggle);
  toggleLabel.appendChild(document.createTextNode(' Show Callouts'));
  chrome.storage.local.get('calloutsEnabled', data => {
    toggle.checked = data.calloutsEnabled !== false;
  });
  toggle.addEventListener('change', () => {
    chrome.storage.local.set({ calloutsEnabled: toggle.checked });
  });

  sidebar.appendChild(toggleLabel);
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

  data.forEach((page, pageIndex) => {
    if (page.pageUrlPattern && !urlMatchesPattern(page.pageUrlPattern)) {
      return;
    }

    const heading = document.createElement('h3');
    heading.textContent = 'Steps';
    sidebar.appendChild(heading);
    const list = document.createElement('ol');
    list.className = 'steps-list';
    sidebar.appendChild(list);

    const steps = Array.isArray(page.steps) ? page.steps : [];
    steps.forEach((item, stepIndex) => {
      const stepId = `${pageIndex}-${stepIndex}`;
      const li = document.createElement('li');
      li.textContent = item.text;
      li.dataset.stepId = stepId;
      li.addEventListener('click', () => {
        showTooltip(stepId);
      });
      list.appendChild(li);
    });

    if (page.info) {
      const info = document.createElement('div');
      info.className = 'page-info';
      info.innerHTML = page.info;
      sidebar.appendChild(info);
    }
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
