// Settings Page Script
console.log('Settings page loaded');

let blockedSites = [];
let goals = [];
let customCategories = {};

// Toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// Tab switching
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });
}

// Load all settings
async function loadSettings() {
  try {
    // Load general settings
    const idleTimeout = await getSetting('idleTimeout', 5);
    const darkMode = await getSetting('darkMode', false);
    const enableNotifications = await getSetting('enableNotifications', true);
    const dailySummary = await getSetting('dailySummary', false);
    const nuclearMode = await getSetting('nuclearMode', false);

    document.getElementById('idleTimeout').value = idleTimeout;
    document.getElementById('darkMode').checked = darkMode;
    document.getElementById('enableNotifications').checked = enableNotifications;
    document.getElementById('dailySummary').checked = dailySummary;
    document.getElementById('nuclearMode').checked = nuclearMode;

    // Load blocked sites
    const blockedResponse = await chrome.runtime.sendMessage({ action: 'getBlockedSites' });
    if (blockedResponse.success) {
      blockedSites = blockedResponse.data || [];
      renderBlockedSites();
    }

    // Load goals
    const goalsResponse = await chrome.runtime.sendMessage({ action: 'getGoals' });
    if (goalsResponse.success) {
      goals = goalsResponse.data || [];
      renderGoals();
    }

    // Load custom categories
    const categoriesResponse = await chrome.runtime.sendMessage({
      action: 'getSetting',
      key: 'customCategories',
      defaultValue: {}
    });
    if (categoriesResponse.success) {
      customCategories = categoriesResponse.data || {};
      renderCustomCategories();
    }

    // Load excluded domains
    const excludedDomains = await getSetting('excludedDomains', '');
    document.getElementById('excludedDomains').value = excludedDomains;

  } catch (error) {
    console.error('Load settings error:', error);
    showToast('Error loading settings', 'error');
  }
}

async function getSetting(key, defaultValue) {
  const response = await chrome.runtime.sendMessage({
    action: 'getSetting',
    key: key,
    defaultValue: defaultValue
  });
  return response.success ? response.data : defaultValue;
}

async function saveSetting(key, value) {
  await chrome.runtime.sendMessage({
    action: 'saveSetting',
    key: key,
    value: value
  });
}

// General Settings Event Listeners
function initGeneralSettings() {
  document.getElementById('idleTimeout').addEventListener('change', async (e) => {
    await saveSetting('idleTimeout', parseInt(e.target.value));
    showToast('Idle timeout updated');
  });

  document.getElementById('darkMode').addEventListener('change', async (e) => {
    await saveSetting('darkMode', e.target.checked);
    showToast('Dark mode ' + (e.target.checked ? 'enabled' : 'disabled'));
  });

  document.getElementById('enableNotifications').addEventListener('change', async (e) => {
    await saveSetting('enableNotifications', e.target.checked);
    showToast('Notifications ' + (e.target.checked ? 'enabled' : 'disabled'));
  });

  document.getElementById('dailySummary').addEventListener('change', async (e) => {
    await saveSetting('dailySummary', e.target.checked);
    showToast('Daily summary ' + (e.target.checked ? 'enabled' : 'disabled'));
  });
}

// Website Blocking
function initBlocking() {
  const blockTypeSelect = document.getElementById('blockType');
  const scheduledOptions = document.getElementById('scheduledOptions');
  const timeLimitOptions = document.getElementById('timeLimitOptions');

  blockTypeSelect.addEventListener('change', () => {
    scheduledOptions.style.display = blockTypeSelect.value === 'scheduled' ? 'block' : 'none';
    timeLimitOptions.style.display = blockTypeSelect.value === 'timeLimit' ? 'block' : 'none';
  });

  document.getElementById('nuclearMode').addEventListener('change', async (e) => {
    await saveSetting('nuclearMode', e.target.checked);
    showToast('Nuclear mode ' + (e.target.checked ? 'enabled' : 'disabled'));
  });

  document.getElementById('addBlockBtn').addEventListener('click', addBlockedSite);
}

async function addBlockedSite() {
  const domain = document.getElementById('blockDomain').value.trim().toLowerCase();
  const blockType = document.getElementById('blockType').value;

  if (!domain) {
    showToast('Please enter a domain', 'error');
    return;
  }

  const site = {
    domain: domain,
    blockType: blockType,
    enabled: true
  };

  if (blockType === 'scheduled') {
    const days = Array.from(document.querySelectorAll('.schedule-days input:checked'))
      .map(cb => parseInt(cb.value));

    if (days.length === 0) {
      showToast('Please select at least one day', 'error');
      return;
    }

    site.schedule = {
      days: days,
      startTime: document.getElementById('scheduleStart').value,
      endTime: document.getElementById('scheduleEnd').value
    };
  } else if (blockType === 'timeLimit') {
    const limitMinutes = parseInt(document.getElementById('limitMinutes').value);
    if (!limitMinutes || limitMinutes < 1) {
      showToast('Please enter a valid time limit', 'error');
      return;
    }
    site.limitMinutes = limitMinutes;
  }

  try {
    await chrome.runtime.sendMessage({
      action: 'addBlockedSite',
      site: site
    });

    blockedSites.push(site);
    renderBlockedSites();

    // Reset form
    document.getElementById('blockDomain').value = '';
    document.querySelectorAll('.schedule-days input').forEach(cb => cb.checked = false);

    showToast('Site blocked successfully');
  } catch (error) {
    console.error('Add block error:', error);
    showToast('Error adding block', 'error');
  }
}

function renderBlockedSites() {
  const list = document.getElementById('blockedSitesList');

  if (blockedSites.length === 0) {
    list.innerHTML = '<div class="empty-state">No blocked sites yet. Add one above!</div>';
    return;
  }

  list.innerHTML = blockedSites.map(site => {
    let details = `Type: ${site.blockType}`;
    if (site.blockType === 'scheduled' && site.schedule) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayNames = site.schedule.days.map(d => days[d]).join(', ');
      details += ` | ${dayNames} ${site.schedule.startTime}-${site.schedule.endTime}`;
    } else if (site.blockType === 'timeLimit') {
      details += ` | ${site.limitMinutes} minutes/day`;
    }

    return `
      <div class="list-item">
        <div class="list-item-info">
          <div class="list-item-title">${site.domain}</div>
          <div class="list-item-details">${details}</div>
        </div>
        <div class="list-item-actions">
          <button class="btn-small btn-toggle ${site.enabled ? '' : 'disabled'}"
                  onclick="toggleBlockedSite('${site.domain}')">
            ${site.enabled ? 'Enabled' : 'Disabled'}
          </button>
          <button class="btn-small btn-delete" onclick="removeBlockedSite('${site.domain}')">
            Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function toggleBlockedSite(domain) {
  const site = blockedSites.find(s => s.domain === domain);
  if (site) {
    site.enabled = !site.enabled;
    await chrome.runtime.sendMessage({
      action: 'addBlockedSite',
      site: site
    });
    renderBlockedSites();
    showToast(`${domain} ${site.enabled ? 'enabled' : 'disabled'}`);
  }
}

async function removeBlockedSite(domain) {
  if (!confirm(`Remove block for ${domain}?`)) return;

  try {
    await chrome.runtime.sendMessage({
      action: 'removeBlockedSite',
      domain: domain
    });

    blockedSites = blockedSites.filter(s => s.domain !== domain);
    renderBlockedSites();
    showToast('Block removed');
  } catch (error) {
    console.error('Remove block error:', error);
    showToast('Error removing block', 'error');
  }
}

// Goals & Alerts
function initGoals() {
  const goalTypeSelect = document.getElementById('goalType');
  const productiveOptions = document.getElementById('productiveGoalOptions');
  const distractingOptions = document.getElementById('distractingLimitOptions');
  const siteOptions = document.getElementById('siteLimitOptions');

  goalTypeSelect.addEventListener('change', () => {
    productiveOptions.style.display = goalTypeSelect.value === 'productiveTime' ? 'block' : 'none';
    distractingOptions.style.display = goalTypeSelect.value === 'distractingLimit' ? 'block' : 'none';
    siteOptions.style.display = goalTypeSelect.value === 'siteLimit' ? 'block' : 'none';
  });

  document.getElementById('addGoalBtn').addEventListener('click', addGoal);
}

async function addGoal() {
  const goalType = document.getElementById('goalType').value;

  const goal = {
    type: goalType,
    enabled: true,
    createdAt: Date.now()
  };

  if (goalType === 'productiveTime') {
    const minutes = parseInt(document.getElementById('productiveMinutes').value);
    if (!minutes || minutes < 10) {
      showToast('Please enter a valid target (min 10 minutes)', 'error');
      return;
    }
    goal.targetMinutes = minutes;
  } else if (goalType === 'distractingLimit') {
    const minutes = parseInt(document.getElementById('distractingMinutes').value);
    if (!minutes || minutes < 5) {
      showToast('Please enter a valid limit (min 5 minutes)', 'error');
      return;
    }
    goal.limitMinutes = minutes;
  } else if (goalType === 'siteLimit') {
    const domain = document.getElementById('siteLimitDomain').value.trim().toLowerCase();
    const minutes = parseInt(document.getElementById('siteLimitMinutes').value);

    if (!domain) {
      showToast('Please enter a domain', 'error');
      return;
    }
    if (!minutes || minutes < 5) {
      showToast('Please enter a valid limit (min 5 minutes)', 'error');
      return;
    }

    goal.domain = domain;
    goal.limitMinutes = minutes;
  }

  try {
    await chrome.runtime.sendMessage({
      action: 'addGoal',
      goal: goal
    });

    await loadSettings(); // Reload to get goal with ID
    showToast('Goal created successfully');
  } catch (error) {
    console.error('Add goal error:', error);
    showToast('Error creating goal', 'error');
  }
}

function renderGoals() {
  const list = document.getElementById('goalsList');

  if (goals.length === 0) {
    list.innerHTML = '<div class="empty-state">No goals yet. Create one above!</div>';
    return;
  }

  list.innerHTML = goals.map(goal => {
    let title = '';
    let details = '';

    if (goal.type === 'productiveTime') {
      title = `${goal.targetMinutes} minutes of productive time`;
      details = 'Daily target';
    } else if (goal.type === 'distractingLimit') {
      title = `${goal.limitMinutes} minutes distraction limit`;
      details = 'Daily limit';
    } else if (goal.type === 'siteLimit') {
      title = `${goal.domain} - ${goal.limitMinutes} minutes`;
      details = 'Site-specific limit';
    }

    return `
      <div class="list-item">
        <div class="list-item-info">
          <div class="list-item-title">${title}</div>
          <div class="list-item-details">${details}</div>
        </div>
        <div class="list-item-actions">
          <button class="btn-small btn-toggle ${goal.enabled ? '' : 'disabled'}"
                  onclick="toggleGoal(${goal.id})">
            ${goal.enabled ? 'Active' : 'Paused'}
          </button>
          <button class="btn-small btn-delete" onclick="deleteGoal(${goal.id})">
            Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function toggleGoal(goalId) {
  const goal = goals.find(g => g.id === goalId);
  if (goal) {
    goal.enabled = !goal.enabled;
    await chrome.runtime.sendMessage({
      action: 'updateGoal',
      goal: goal
    });
    renderGoals();
    showToast(`Goal ${goal.enabled ? 'activated' : 'paused'}`);
  }
}

async function deleteGoal(goalId) {
  if (!confirm('Delete this goal?')) return;

  try {
    await chrome.runtime.sendMessage({
      action: 'deleteGoal',
      goalId: goalId
    });

    goals = goals.filter(g => g.id !== goalId);
    renderGoals();
    showToast('Goal deleted');
  } catch (error) {
    console.error('Delete goal error:', error);
    showToast('Error deleting goal', 'error');
  }
}

// Categories
function initCategories() {
  document.getElementById('addCategoryBtn').addEventListener('click', addCategory);
}

async function addCategory() {
  const domain = document.getElementById('categoryDomain').value.trim().toLowerCase();
  const category = document.getElementById('categoryType').value;

  if (!domain) {
    showToast('Please enter a domain', 'error');
    return;
  }

  customCategories[domain] = category;

  try {
    await chrome.runtime.sendMessage({
      action: 'saveSetting',
      key: 'customCategories',
      value: customCategories
    });

    renderCustomCategories();
    document.getElementById('categoryDomain').value = '';
    showToast('Category added');
  } catch (error) {
    console.error('Add category error:', error);
    showToast('Error adding category', 'error');
  }
}

function renderCustomCategories() {
  const list = document.getElementById('customCategoriesList');
  const entries = Object.entries(customCategories);

  if (entries.length === 0) {
    list.innerHTML = '<div class="empty-state">No custom categories yet. Add one above!</div>';
    return;
  }

  list.innerHTML = entries.map(([domain, category]) => `
    <div class="list-item">
      <div class="list-item-info">
        <div class="list-item-title">${domain}</div>
        <span class="category-badge ${category}">${category}</span>
      </div>
      <div class="list-item-actions">
        <button class="btn-small btn-delete" onclick="removeCategory('${domain}')">
          Delete
        </button>
      </div>
    </div>
  `).join('');
}

async function removeCategory(domain) {
  delete customCategories[domain];

  try {
    await chrome.runtime.sendMessage({
      action: 'saveSetting',
      key: 'customCategories',
      value: customCategories
    });

    renderCustomCategories();
    showToast('Category removed');
  } catch (error) {
    console.error('Remove category error:', error);
    showToast('Error removing category', 'error');
  }
}

// Data & Privacy
function initDataPrivacy() {
  document.getElementById('exportJsonBtn').addEventListener('click', exportJSON);
  document.getElementById('exportCsvBtn').addEventListener('click', exportCSV);
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', importData);
  document.getElementById('saveExcludedBtn').addEventListener('click', saveExcludedDomains);
  document.getElementById('resetDataBtn').addEventListener('click', resetAllData);
}

async function exportJSON() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'exportData' });
    if (response.success) {
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `focustrack-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported successfully');
    }
  } catch (error) {
    console.error('Export error:', error);
    showToast('Error exporting data', 'error');
  }
}

async function exportCSV() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'exportData' });
    if (response.success) {
      const entries = response.data.timeEntries || [];

      const csv = [
        ['Date', 'Domain', 'Title', 'Category', 'Duration (seconds)', 'URL'],
        ...entries.map(e => [
          new Date(e.timestamp).toISOString(),
          e.domain,
          e.title,
          e.category,
          e.duration,
          e.url
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `focustrack-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('CSV exported successfully');
    }
  } catch (error) {
    console.error('CSV export error:', error);
    showToast('Error exporting CSV', 'error');
  }
}

async function importData() {
  const file = document.getElementById('importFile').files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);

      // Import would require more complex logic to merge with existing data
      // For now, just show a message
      showToast('Import functionality coming soon!', 'error');

    } catch (error) {
      console.error('Import error:', error);
      showToast('Error importing data. Invalid JSON file.', 'error');
    }
  };
  reader.readAsText(file);
}

async function saveExcludedDomains() {
  const excluded = document.getElementById('excludedDomains').value;
  await saveSetting('excludedDomains', excluded);
  showToast('Excluded domains saved');
}

async function resetAllData() {
  const confirmed = confirm('⚠️ WARNING: This will permanently delete ALL your tracking data, settings, blocked sites, and goals. This cannot be undone!\n\nType "DELETE" to confirm:');

  if (!confirmed) return;

  const doubleCheck = prompt('Type DELETE in capital letters to confirm:');
  if (doubleCheck !== 'DELETE') {
    showToast('Reset cancelled', 'error');
    return;
  }

  try {
    // Clear IndexedDB
    const dbRequest = indexedDB.deleteDatabase('FocusTrackDB');
    dbRequest.onsuccess = () => {
      showToast('All data reset successfully');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    };
    dbRequest.onerror = () => {
      showToast('Error resetting data', 'error');
    };
  } catch (error) {
    console.error('Reset error:', error);
    showToast('Error resetting data', 'error');
  }
}

// Back button
document.getElementById('backBtn').addEventListener('click', () => {
  window.close();
});

// Make functions global for onclick handlers
window.toggleBlockedSite = toggleBlockedSite;
window.removeBlockedSite = removeBlockedSite;
window.toggleGoal = toggleGoal;
window.deleteGoal = deleteGoal;
window.removeCategory = removeCategory;

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing settings page...');
  initTabs();
  initGeneralSettings();
  initBlocking();
  initGoals();
  initCategories();
  initDataPrivacy();
  loadSettings();
});
