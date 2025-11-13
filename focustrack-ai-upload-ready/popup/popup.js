// Popup UI
let stats = null;
let focusSession = null;

async function loadData() {
  try {
    // Get today's stats
    const statsResponse = await chrome.runtime.sendMessage({ action: 'getTodayStats' });

    if (statsResponse.success) {
      const entries = statsResponse.data;
      calculateStats(entries);
    }

    // Get current site status
    const statusResponse = await chrome.runtime.sendMessage({ action: 'getStatus' });
    if (statusResponse.success) {
      updateCurrentSite(statusResponse.data);
    }

    // Get focus session
    const sessionResponse = await chrome.runtime.sendMessage({ action: 'getFocusSession' });
    if (sessionResponse.success) {
      focusSession = sessionResponse.data;
      updateFocusUI();
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function calculateStats(entries) {
  let productive = 0;
  let distracting = 0;
  let neutral = 0;
  const domainMap = {};

  for (const entry of entries) {
    if (entry.category === 'productive') productive += entry.duration;
    else if (entry.category === 'distracting') distracting += entry.duration;
    else if (entry.category === 'neutral') neutral += entry.duration;

    if (!domainMap[entry.domain]) {
      domainMap[entry.domain] = { domain: entry.domain, time: 0, category: entry.category };
    }
    domainMap[entry.domain].time += entry.duration;
  }

  const totalRelevant = productive + distracting;
  const score = totalRelevant > 0 ? Math.round((productive / totalRelevant) * 100) : 0;

  const topSites = Object.values(domainMap).sort((a, b) => b.time - a.time).slice(0, 5);

  updateUI({ score, productive, distracting, neutral, topSites });
}

function updateUI(data) {
  document.getElementById('score').textContent = data.score + '%';
  document.getElementById('productiveTime').textContent = formatTime(data.productive);
  document.getElementById('distractingTime').textContent = formatTime(data.distracting);

  const list = document.getElementById('topSitesList');
  if (data.topSites.length === 0) {
    list.innerHTML = '<div class="empty-state">No activity tracked yet</div>';
  } else {
    list.innerHTML = data.topSites.map(site => `
      <div class="top-site-item">
        <div class="top-site-info">
          <div class="top-site-domain">${site.domain}</div>
          <div class="top-site-time">${formatTime(site.time)}</div>
        </div>
        <span class="top-site-badge category-badge ${site.category}">${site.category}</span>
      </div>
    `).join('');
  }
}

function updateCurrentSite(data) {
  const currentSiteEl = document.getElementById('currentSite');

  if (data.status === 'tracking' && data.currentTab) {
    currentSiteEl.style.display = 'block';
    document.getElementById('currentDomain').textContent = data.currentTab.domain;
    document.getElementById('currentTime').textContent = formatTime(data.currentDuration);
    const badge = document.getElementById('currentCategory');
    badge.textContent = data.currentTab.category;
    badge.className = 'category-badge ' + data.currentTab.category;
  } else {
    currentSiteEl.style.display = 'none';
  }
}

function updateFocusUI() {
  if (focusSession) {
    document.getElementById('focusStart').style.display = 'none';
    document.getElementById('focusActive').style.display = 'block';

    const remaining = Math.floor((focusSession.endTime - Date.now()) / 60000);
    document.getElementById('focusTimeRemaining').textContent = remaining + ' minutes remaining';
  } else {
    document.getElementById('focusStart').style.display = 'block';
    document.getElementById('focusActive').style.display = 'none';
  }
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Event listeners
document.getElementById('openDashboardBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
});

document.getElementById('blockCurrentBtn').addEventListener('click', async () => {
  const statusResponse = await chrome.runtime.sendMessage({ action: 'getStatus' });
  if (statusResponse.success && statusResponse.data.currentTab) {
    await chrome.runtime.sendMessage({
      action: 'blockSite',
      domain: statusResponse.data.currentTab.domain,
      options: { blockType: 'always' }
    });
    alert('Site blocked!');
    loadData();
  }
});

document.querySelectorAll('[data-duration]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const duration = parseInt(btn.dataset.duration);
    await chrome.runtime.sendMessage({ action: 'startFocusSession', duration });
    loadData();
  });
});

document.getElementById('endFocusBtn').addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ action: 'endFocusSession' });
  focusSession = null;
  loadData();
});

// Load data on startup
loadData();

// Refresh every 5 seconds
setInterval(loadData, 5000);
