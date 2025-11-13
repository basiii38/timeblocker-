// Popup script
console.log('Popup loaded');

let focusSession = null;

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
    document.getElementById('currentDomain').textContent = data.currentTab.domain;
    document.getElementById('currentTime').textContent = formatTime(data.currentDuration);
    const badge = document.getElementById('currentCategory');
    badge.textContent = data.currentTab.category;
    badge.className = 'category-badge ' + data.currentTab.category;
  } else {
    section.style.display = 'none';
  }
}

function updateFocusUI() {
  if (focusSession) {
    document.getElementById('focusStart').style.display = 'none';
    document.getElementById('focusActive').style.display = 'block';

    const remaining = Math.floor((focusSession.endTime - Date.now()) / 60000);
    document.getElementById('focusTime').textContent = remaining + ' min left';
  } else {
    document.getElementById('focusStart').style.display = 'block';
    document.getElementById('focusActive').style.display = 'none';
  }
}

function showError() {
  document.getElementById('score').textContent = 'Error';
  document.getElementById('productiveTime').textContent = '--';
  document.getElementById('distractingTime').textContent = '--';
  document.getElementById('topSitesList').innerHTML =
    '<div class="empty">Error loading data<br>Check console for details</div>';
}

// Global function for buttons
window.startFocus = async function(duration) {
  console.log('Starting focus session:', duration);
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'startFocusSession',
      duration
    });
    if (response.success) {
      focusSession = response.data;
      updateFocusUI();
    }
  } catch (error) {
    console.error('Focus start error:', error);
  }
};

// Event listeners
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

document.getElementById('openDashboardBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
});

// Load data on startup
console.log('Initializing popup...');
loadData();

// Refresh every 5 seconds
setInterval(loadData, 5000);
