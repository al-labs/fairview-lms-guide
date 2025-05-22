function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function urlMatchesPattern(pattern) {
  if (!pattern) return true;
  const regex = new RegExp('^' + escapeRegex(pattern).replace(/\\\*/g, '.*') + '$');
  return regex.test(window.location.href);
}

let calloutSteps = [];
let currentCalloutIndex = 0;
let calloutsEnabled = true;

function parseSteps(data) {
  const parsed = [];
  data.forEach((page) => {
    if (page.pageUrlPattern && !urlMatchesPattern(page.pageUrlPattern)) {
      return;
    }
    const steps = Array.isArray(page.steps) ? page.steps : [];
    steps.forEach(step => {
      // Store the original step data including selector
      parsed.push({...step});
    });
  });
  return parsed;
}

function applyTooltips(data) {
  console.log('Applying tooltips for data:', data);
  
  data.forEach((page, pageIndex) => {
    if (page.pageUrlPattern && !urlMatchesPattern(page.pageUrlPattern)) {
      console.log(`Skipping page pattern: ${page.pageUrlPattern} (doesn't match current URL: ${window.location.href})`);
      return;
    }
    
    console.log(`Processing page pattern: ${page.pageUrlPattern}`);
    const steps = Array.isArray(page.steps) ? page.steps : [];
    
    steps.forEach((item, stepIndex) => {
      const stepId = `${pageIndex}-${stepIndex}`;
      const elements = document.querySelectorAll(item.selector);
      console.log(`Found ${elements.length} elements for selector: ${item.selector}`);
      
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
          icon.addEventListener('click', (e) => {
            e.stopPropagation();
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
  document.querySelectorAll('.helper-icon').forEach(icon => icon.remove());
}

function showTooltip(stepId) {
  const tip = document.querySelector(`.helper-tooltip[data-step-id="${stepId}"]`);
  if (tip) {
    tip.classList.add('visible');
    setTimeout(() => tip.classList.remove('visible'), 4000);
  }
}

function removeCallout() {
  const overlay = document.querySelector('.helper-callout-overlay');
  if (overlay) overlay.remove();
}

function highlightElement(selector) {
  // Remove any existing highlights
  document.querySelectorAll('.helper-highlight').forEach(el => {
    el.classList.remove('helper-highlight');
  });
  
  if (!selector) return null;
  
  const element = document.querySelector(selector);
  if (element) {
    element.classList.add('helper-highlight');
    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return element;
  }
  return null;
}

function getElementPosition(element) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
    bottom: rect.bottom + window.scrollY,
    right: rect.right + window.scrollX
  };
}

function showCallout(index) {
  if (!calloutsEnabled) return;
  const step = calloutSteps[index];
  if (!step) return;
  currentCalloutIndex = index;
  removeCallout();

  // Highlight the target element if it exists
  const targetElement = highlightElement(step.selector);

  const overlay = document.createElement('div');
  overlay.className = 'helper-callout-overlay';

  const callout = document.createElement('div');
  callout.className = 'helper-callout';
  
  // Add arrow
  const arrow = document.createElement('div');
  arrow.className = 'helper-callout-arrow';
  callout.appendChild(arrow);
  
  const content = document.createElement('div');
  content.className = 'helper-callout-content';
  content.innerHTML = `
    <div class="callout-step-number">Step ${index + 1} of ${calloutSteps.length}</div>
    <div class="callout-text">${step.callout || step.text || ''}</div>
    ${targetElement ? '' : '<div class="callout-no-element">Element not found on page</div>'}
  `;
  callout.appendChild(content);

  const nav = document.createElement('div');
  nav.className = 'helper-callout-nav';
  
  const navLeft = document.createElement('div');
  const prev = document.createElement('button');
  prev.className = 'helper-callout-prev';
  prev.textContent = '← Previous';
  prev.disabled = index === 0;
  prev.addEventListener('click', (e) => {
    e.stopPropagation();
    prevCallout();
  });
  navLeft.appendChild(prev);
  
  const navRight = document.createElement('div');
  const skip = document.createElement('button');
  skip.className = 'helper-callout-skip';
  skip.textContent = 'Skip Tour';
  skip.addEventListener('click', (e) => {
    e.stopPropagation();
    removeCallout();
  });
  navRight.appendChild(skip);
  
  const next = document.createElement('button');
  next.className = 'helper-callout-next';
  next.textContent = index >= calloutSteps.length - 1 ? 'Finish' : 'Next →';
  next.addEventListener('click', (e) => {
    e.stopPropagation();
    if (index >= calloutSteps.length - 1) {
      removeCallout();
    } else {
      nextCallout();
    }
  });
  navRight.appendChild(next);
  
  nav.appendChild(navLeft);
  nav.appendChild(navRight);
  callout.appendChild(nav);

  overlay.appendChild(callout);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      removeCallout();
    }
  });

  document.body.appendChild(overlay);

  // Position the callout near the target element
  if (targetElement) {
    // Force a reflow to ensure the callout dimensions are calculated
    callout.offsetHeight;
    
    const pos = getElementPosition(targetElement);
    const calloutRect = callout.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    
    // Calculate available space in each direction
    const spaceBelow = viewportHeight - (pos.bottom - scrollY);
    const spaceAbove = pos.top - scrollY;
    const spaceRight = viewportWidth - (pos.right - scrollX);
    const spaceLeft = pos.left - scrollX;
    
    let top, left;
    let arrowClass = 'arrow-top';
    const margin = 15; // Space between callout and target
    
    // Prefer positioning based on available space
    if (spaceBelow > calloutRect.height + margin && spaceBelow > 100) {
      // Position below
      top = pos.bottom + margin;
      left = pos.left + (pos.width / 2) - (calloutRect.width / 2);
      arrowClass = 'arrow-top';
    } else if (spaceAbove > calloutRect.height + margin && spaceAbove > 100) {
      // Position above
      top = pos.top - calloutRect.height - margin;
      left = pos.left + (pos.width / 2) - (calloutRect.width / 2);
      arrowClass = 'arrow-bottom';
    } else if (spaceRight > calloutRect.width + margin && spaceRight > 100) {
      // Position to the right
      top = pos.top + (pos.height / 2) - (calloutRect.height / 2);
      left = pos.right + margin;
      arrowClass = 'arrow-left';
    } else if (spaceLeft > calloutRect.width + margin && spaceLeft > 100) {
      // Position to the left
      top = pos.top + (pos.height / 2) - (calloutRect.height / 2);
      left = pos.left - calloutRect.width - margin;
      arrowClass = 'arrow-right';
    } else {
      // Default to below with adjusted positioning
      top = pos.bottom + margin;
      left = pos.left + (pos.width / 2) - (calloutRect.width / 2);
      arrowClass = 'arrow-top';
    }
    
    // Ensure callout stays within viewport
    const padding = 10;
    left = Math.max(padding, Math.min(left, viewportWidth + scrollX - calloutRect.width - padding));
    top = Math.max(scrollY + padding, Math.min(top, scrollY + viewportHeight - calloutRect.height - padding));
    
    // Apply positioning
    callout.style.position = 'absolute';
    callout.style.top = `${top}px`;
    callout.style.left = `${left}px`;
    callout.style.transform = 'none'; // Remove any transform
    arrow.className = `helper-callout-arrow ${arrowClass}`;
    
    // Adjust arrow position based on how much we had to shift the callout
    if (arrowClass === 'arrow-top' || arrowClass === 'arrow-bottom') {
      const targetCenterX = pos.left + (pos.width / 2);
      const calloutCenterX = left + (calloutRect.width / 2);
      const offset = targetCenterX - calloutCenterX;
      const maxOffset = (calloutRect.width / 2) - 20; // Keep arrow within callout bounds
      const clampedOffset = Math.max(-maxOffset, Math.min(offset, maxOffset));
      arrow.style.left = `calc(50% + ${clampedOffset}px)`;
    }
  } else {
    // No target element found - center the callout
    callout.style.position = 'fixed';
    callout.style.top = '50%';
    callout.style.left = '50%';
    callout.style.transform = 'translate(-50%, -50%)';
    arrow.style.display = 'none';
  }
}

function nextCallout() {
  if (currentCalloutIndex < calloutSteps.length - 1) {
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
  
  // Add header
  const header = document.createElement('div');
  header.className = 'sidebar-header';
  const title = document.createElement('h2');
  title.textContent = 'Help Tips';
  header.appendChild(title);
  sidebar.appendChild(header);

  // Show Callouts toggle
  const toggleContainer = document.createElement('div');
  toggleContainer.className = 'toggle-container';
  const toggleLabel = document.createElement('label');
  toggleLabel.className = 'callout-toggle';
  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.id = 'helper-callout-toggle';
  toggleLabel.appendChild(toggle);
  toggleLabel.appendChild(document.createTextNode(' Show Callouts'));
  toggleContainer.appendChild(toggleLabel);
  
  chrome.storage.local.get('calloutsEnabled', data => {
    toggle.checked = data.calloutsEnabled !== false;
  });
  
  toggle.addEventListener('change', () => {
    calloutsEnabled = toggle.checked;
    chrome.storage.local.set({ calloutsEnabled: toggle.checked });
  });

  sidebar.appendChild(toggleContainer);
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
  let idx = 0;

  data.forEach((page, pageIndex) => {
    if (page.pageUrlPattern && !urlMatchesPattern(page.pageUrlPattern)) {
      return;
    }

    const section = document.createElement('div');
    section.className = 'sidebar-section';
    
    const heading = document.createElement('h3');
    heading.textContent = 'Available Tips';
    section.appendChild(heading);
    
    const list = document.createElement('ol');
    list.className = 'steps-list';
    section.appendChild(list);

    const steps = Array.isArray(page.steps) ? page.steps : [];
    steps.forEach((item, stepIndex) => {
      const stepId = `${pageIndex}-${stepIndex}`;
      const li = document.createElement('li');
      li.className = 'step-item';
      li.textContent = item.text;
      li.dataset.stepId = stepId;
      const calloutIndex = idx++;
      li.dataset.calloutIndex = calloutIndex;
      li.addEventListener('click', () => {
        showCallout(calloutIndex);
      });
      list.appendChild(li);
    });

    sidebar.appendChild(section);

    if (page.info) {
      const info = document.createElement('div');
      info.className = 'page-info';
      info.innerHTML = page.info;
      sidebar.appendChild(info);
    }
  });
}

function updateHelpers() {
  console.log('Updating helpers...');
  chrome.storage.local.get(['helperEnabled', 'helperData', 'sidebarEnabled', 'calloutsEnabled'], result => {
    console.log('Storage data:', result);
    
    removeTooltips();
    // Remove highlight when updating
    document.querySelectorAll('.helper-highlight').forEach(el => {
      el.classList.remove('helper-highlight');
    });
    
    calloutsEnabled = result.calloutsEnabled !== false;
    
    if (!calloutsEnabled) {
      removeCallout();
    }
    
    if (result.helperEnabled && Array.isArray(result.helperData)) {
      applyTooltips(result.helperData);
    }
    
    calloutSteps = Array.isArray(result.helperData) ? parseSteps(result.helperData) : [];
    updateSidebar(result.helperData || [], result.sidebarEnabled);
  });
}

function init() {
  console.log('Cornerstone Helper initializing...');
  console.log('Current URL:', window.location.href);
  
  // Wait a bit for the extension to load data
  setTimeout(() => {
    updateHelpers();
  }, 500);
  
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.helperEnabled || changes.helperData || changes.sidebarEnabled || changes.calloutsEnabled)) {
      console.log('Storage changed:', changes);
      updateHelpers();
    }
  });
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    removeCallout();
  });
}

// Use multiple strategies to ensure initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also try when the page is fully loaded
window.addEventListener('load', () => {
  console.log('Window loaded, checking helpers...');
  setTimeout(updateHelpers, 1000);
});