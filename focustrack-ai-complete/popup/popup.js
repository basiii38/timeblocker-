// Popup script
console.log('Popup loaded');

let focusSession = null;
let breakTimer = null;
let allowedSites = [];
let currentDomain = null;

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

async function loadData() {
  try {
    console.log('Loading data...');

    // Get today's stats
    const statsResponse = await chrome.runtime.sendMessage({ action: 'getTodayStats' });
    console.log('Stats response:', statsResponse);

    if (statsResponse && statsResponse.success) {
      const entries = statsResponse.data || [];
      calculateStats(entries);
    } else {
      console.error('Stats failed:', statsResponse);
      showError();
    }

    // Get current site status
    const statusResponse = await chrome.runtime.sendMessage({ action: 'getStatus' });
    if (statusResponse && statusResponse.success) {
      updateCurrentSite(statusResponse.data);
    }

    // Get focus session
    const sessionResponse = await chrome.runtime.sendMessage({ action: 'getFocusSession' });
    if (sessionResponse && sessionResponse.success) {
      focusSession = sessionResponse.data;
      updateFocusUI();
    }

    // Get break timer
    const breakResponse = await chrome.runtime.sendMessage({ action: 'getBreakTimer' });
    if (breakResponse && breakResponse.success) {
      breakTimer = breakResponse.data;
      updateBreakUI();
    }
  } catch (error) {
    console.error('Load error:', error);
    showError();
  }
}

function calculateStats(entries) {
  console.log('Calculating stats for', entries.length, 'entries');

  let productive = 0;
  let distracting = 0;
  let neutral = 0;
  const domainMap = {};

  for (const entry of entries) {
    if (entry.category === 'productive') productive += entry.duration;
    else if (entry.category === 'distracting') distracting += entry.duration;
    else if (entry.category === 'neutral') neutral += entry.duration;

    if (!domainMap[entry.domain]) {
      domainMap[entry.domain] = {
        domain: entry.domain,
        time: 0,
        category: entry.category
      };
    }
    domainMap[entry.domain].time += entry.duration;
  }

  const totalRelevant = productive + distracting;
  const score = totalRelevant > 0 ? Math.round((productive / totalRelevant) * 100) : 0;

  const topSites = Object.values(domainMap)
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  updateUI({ score, productive, distracting, neutral, topSites });
}

function updateUI(data) {
  console.log('Updating UI:', data);

  document.getElementById('score').textContent = data.score + '%';
  document.getElementById('productiveTime').textContent = formatTime(data.productive);
  document.getElementById('distractingTime').textContent = formatTime(data.distracting);

  const list = document.getElementById('topSitesList');
  if (data.topSites.length === 0) {
    list.innerHTML = '<div class="empty">No activity tracked yet<br>Start browsing to see stats!</div>';
  } else {
    list.innerHTML = data.topSites.map(site => `
      <div class="site-item">
        <div class="site-info">
          <div class="site-domain">${site.domain}</div>
          <div class="site-time">${formatTime(site.time)}</div>
        </div>
        <span class="category-badge ${site.category}">${site.category}</span>
      </div>
    `).join('');
  }
}

function updateCurrentSite(data) {
  const section = document.getElementById('currentSection');

  if (data.status === 'tracking' && data.currentTab) {
    section.style.display = 'block';
    currentDomain = data.currentTab.domain;
    document.getElementById('currentDomain').textContent = data.currentTab.domain;
    document.getElementById('currentTime').textContent = formatTime(data.currentDuration);
    const badge = document.getElementById('currentCategory');
    badge.textContent = data.currentTab.category;
    badge.className = 'category-badge ' + data.currentTab.category;
  } else {
    section.style.display = 'none';
    currentDomain = null;
  }
}

function formatCountdown(milliseconds) {
  if (milliseconds <= 0) return '0:00';
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateFocusUI() {
  if (focusSession) {
    document.getElementById('focusStart').style.display = 'none';
    document.getElementById('focusActive').style.display = 'block';

    const remaining = focusSession.endTime - Date.now();
    document.getElementById('focusTime').textContent = formatCountdown(remaining);
  } else {
    document.getElementById('focusStart').style.display = 'block';
    document.getElementById('focusActive').style.display = 'none';
  }
}

function updateBreakUI() {
  if (breakTimer) {
    document.getElementById('breakStart').style.display = 'none';
    document.getElementById('breakActive').style.display = 'block';

    const remaining = breakTimer.endTime - Date.now();
    document.getElementById('breakTime').textContent = formatCountdown(remaining);
  } else {
    document.getElementById('breakStart').style.display = 'block';
    document.getElementById('breakActive').style.display = 'none';
  }
}

function showError() {
  document.getElementById('score').textContent = 'Error';
  document.getElementById('productiveTime').textContent = '--';
  document.getElementById('distractingTime').textContent = '--';
  document.getElementById('topSitesList').innerHTML =
    '<div class="empty">Error loading data<br>Check console for details</div>';
}

// Whitelist management
function loadWhitelist() {
  const stored = localStorage.getItem('focusWhitelist');
  allowedSites = stored ? JSON.parse(stored) : [];
  renderWhitelist();
}

function saveWhitelist() {
  localStorage.setItem('focusWhitelist', JSON.stringify(allowedSites));
  renderWhitelist();
}

function renderWhitelist() {
  const container = document.getElementById('whitelistSites');
  if (allowedSites.length === 0) {
    container.innerHTML = '<div style="color: #adb5bd; font-size: 12px; padding: 10px; text-align: center;">No sites added. All distracting sites will be blocked.</div>';
  } else {
    container.innerHTML = allowedSites.map(site => `
      <div class="site-chip">
        <span>${site}</span>
        <button class="remove-whitelist-btn" data-site="${site}">×</button>
      </div>
    `).join('');
  }
}

function addToWhitelist() {
  const input = document.getElementById('whitelistInput');
  const site = input.value.trim().toLowerCase();

  if (!site) return;

  if (!allowedSites.includes(site)) {
    allowedSites.push(site);
    saveWhitelist();
  }

  input.value = '';
}

function removeFromWhitelist(site) {
  allowedSites = allowedSites.filter(s => s !== site);
  saveWhitelist();
}

// Start focus session function
async function startFocusSession(duration) {
  console.log('Starting focus session:', duration, 'with whitelist:', allowedSites);

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'startFocusSession',
      duration: duration,
      allowedSites: allowedSites
    });
    if (response.success) {
      focusSession = response.data;
      updateFocusUI();
    }
  } catch (error) {
    console.error('Focus start error:', error);
  }
}

// Category change
async function changeCategory(newCategory) {
  if (!currentDomain) return;

  console.log('Changing category for', currentDomain, 'to', newCategory);
  try {
    // Get current custom categories
    const response = await chrome.runtime.sendMessage({
      action: 'getSetting',
      key: 'customCategories',
      defaultValue: {}
    });

    let customCategories = response.success ? response.data : {};
    customCategories[currentDomain] = newCategory;

    // Save updated categories
    await chrome.runtime.sendMessage({
      action: 'saveSetting',
      key: 'customCategories',
      value: customCategories
    });

    // Refresh the current tracking session to update category
    await chrome.runtime.sendMessage({
      action: 'refreshCurrentTab'
    });

    // Update UI
    const badge = document.getElementById('currentCategory');
    badge.textContent = newCategory;
    badge.className = 'category-badge ' + newCategory;

    // Close modal
    document.getElementById('categoryModal').classList.remove('show');

    // Reload data
    setTimeout(loadData, 500);
  } catch (error) {
    console.error('Category change error:', error);
  }
}

// Smart tab management
async function openInTab(url) {
  const tabs = await chrome.tabs.query({});
  const existingTab = tabs.find(tab => tab.url === url);

  if (existingTab) {
    // Focus existing tab
    await chrome.tabs.update(existingTab.id, { active: true });
    await chrome.windows.update(existingTab.windowId, { focused: true });
  } else {
    // Open new tab
    chrome.tabs.create({ url: url });
  }
}

// Event listeners - NO INLINE HANDLERS!
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, attaching event listeners...');

  // Load whitelist
  loadWhitelist();

  // Focus session buttons
  const focusButtons = document.querySelectorAll('[data-duration]');
  focusButtons.forEach(button => {
    button.addEventListener('click', () => {
      const duration = parseInt(button.getAttribute('data-duration'));
      startFocusSession(duration);
    });
  });

  // End focus button
  document.getElementById('endFocusBtn').addEventListener('click', async () => {
    console.log('Ending focus session');
    try {
      await chrome.runtime.sendMessage({ action: 'endFocusSession' });
      focusSession = null;
      updateFocusUI();
    } catch (error) {
      console.error('Focus end error:', error);
    }
  });

  // Open dashboard button (with smart tab reuse)
  document.getElementById('openDashboardBtn').addEventListener('click', async () => {
    const url = chrome.runtime.getURL('dashboard/dashboard.html');
    const tabs = await chrome.tabs.query({});
    const existingTab = tabs.find(tab => tab.url && tab.url.startsWith(url));

    if (existingTab) {
      // Focus existing tab
      await chrome.tabs.update(existingTab.id, { active: true });
      await chrome.windows.update(existingTab.windowId, { focused: true });
    } else {
      // Open new tab
      chrome.tabs.create({ url: url });
    }
  });

  // Open settings button (with smart tab reuse)
  document.getElementById('openSettingsBtn').addEventListener('click', async () => {
    const url = chrome.runtime.getURL('settings/settings.html') + '?from=popup';
    const tabs = await chrome.tabs.query({});
    const settingsUrl = chrome.runtime.getURL('settings/settings.html');
    const existingTab = tabs.find(tab => tab.url && tab.url.startsWith(settingsUrl));

    if (existingTab) {
      // Focus existing tab and update URL with query param
      await chrome.tabs.update(existingTab.id, { active: true, url: url });
      await chrome.windows.update(existingTab.windowId, { focused: true });
    } else {
      // Open new tab
      chrome.tabs.create({ url: url });
    }
  });

  // Break timer buttons
  const breakButtons = document.querySelectorAll('[data-break]');
  breakButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const minutes = parseInt(button.getAttribute('data-break'));
      console.log('Starting break timer:', minutes);
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'startBreakTimer',
          minutes: minutes
        });
        if (response.success) {
          breakTimer = response.data;
          updateBreakUI();
        }
      } catch (error) {
        console.error('Break start error:', error);
      }
    });
  });

  // End break button
  document.getElementById('endBreakBtn').addEventListener('click', async () => {
    console.log('Ending break timer');
    breakTimer = null;
    updateBreakUI();
  });

  // Whitelist modal
  document.getElementById('manageWhitelistBtn').addEventListener('click', () => {
    document.getElementById('whitelistModal').classList.add('show');
  });

  document.getElementById('closeWhitelistModal').addEventListener('click', () => {
    document.getElementById('whitelistModal').classList.remove('show');
  });

  document.getElementById('addWhitelistSite').addEventListener('click', addToWhitelist);

  document.getElementById('whitelistInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addToWhitelist();
  });

  // Event delegation for removing whitelist sites
  document.getElementById('whitelistSites').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-whitelist-btn')) {
      const site = e.target.getAttribute('data-site');
      removeFromWhitelist(site);
    }
  });

  // Category modal
  document.getElementById('changeCategoryBtn').addEventListener('click', () => {
    if (!currentDomain) return;
    document.getElementById('categoryDomainName').textContent = currentDomain;
    document.getElementById('categoryModal').classList.add('show');
  });

  document.getElementById('closeCategoryModal').addEventListener('click', () => {
    document.getElementById('categoryModal').classList.remove('show');
  });

  // Category options
  document.querySelectorAll('.category-option').forEach(option => {
    option.addEventListener('click', () => {
      const category = option.getAttribute('data-category');
      changeCategory(category);
    });
  });

  // Close modals on background click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  });

  // Load initial data
  console.log('Initializing popup...');
  loadData();

  // Refresh data every 5 seconds
  setInterval(loadData, 5000);

  // Update countdown timers every second for smooth display
  setInterval(() => {
    if (focusSession) updateFocusUI();
    if (breakTimer) updateBreakUI();
  }, 1000);
});
