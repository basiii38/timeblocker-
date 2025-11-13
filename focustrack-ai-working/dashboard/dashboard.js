// Dashboard
console.log('Dashboard loaded');

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatTimeDetailed(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

async function loadData() {
  try {
    console.log('Loading dashboard data...');

    const response = await chrome.runtime.sendMessage({ action: 'getTodayStats' });

    if (response && response.success) {
      const entries = response.data || [];
      console.log('Processing', entries.length, 'entries');
      processData(entries);
    } else {
      showEmpty();
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    showEmpty();
  }
}

function processData(entries) {
  let productive = 0, distracting = 0, neutral = 0, uncategorized = 0;
  const domainMap = {};

  for (const entry of entries) {
    if (entry.category === 'productive') productive += entry.duration;
    else if (entry.category === 'distracting') distracting += entry.duration;
    else if (entry.category === 'neutral') neutral += entry.duration;
    else uncategorized += entry.duration;

    if (!domainMap[entry.domain]) {
      domainMap[entry.domain] = {
        domain: entry.domain,
        time: 0,
        category: entry.category
      };
    }
    domainMap[entry.domain].time += entry.duration;
  }

  const total = productive + distracting;
  const score = total > 0 ? Math.round((productive / total) * 100) : 0;
  const totalTime = productive + distracting + neutral + uncategorized;

  const topSites = Object.values(domainMap)
    .sort((a, b) => b.time - a.time)
    .slice(0, 20);

  updateStats({ score, productive, distracting, neutral, totalTime });
  updateTable(topSites, totalTime);
}

function updateStats(data) {
  document.getElementById('scoreValue').textContent = data.score + '%';
  document.getElementById('productiveValue').textContent = formatTime(data.productive);
  document.getElementById('distractingValue').textContent = formatTime(data.distracting);
  document.getElementById('totalValue').textContent = formatTime(data.totalTime);
}

function updateTable(sites, total) {
  const tbody = document.getElementById('sitesTableBody');

  if (sites.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 40px;">
          <div class="empty">
            <h3>No data yet</h3>
            <p>Start browsing to see your productivity stats!</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = sites.map(site => `
    <tr>
      <td>${site.domain}</td>
      <td><span class="category-badge ${site.category}">${site.category}</span></td>
      <td>${formatTimeDetailed(site.time)}</td>
      <td>${total > 0 ? Math.round((site.time / total) * 100) : 0}%</td>
    </tr>
  `).join('');
}

function showEmpty() {
  document.getElementById('scoreValue').textContent = '0%';
  document.getElementById('productiveValue').textContent = '0m';
  document.getElementById('distractingValue').textContent = '0m';
  document.getElementById('totalValue').textContent = '0m';

  const tbody = document.getElementById('sitesTableBody');
  tbody.innerHTML = `
    <tr>
      <td colspan="4" style="text-align: center; padding: 40px;">
        <div class="empty">
          <h3>No data yet</h3>
          <p>Start browsing to see your productivity stats!</p>
        </div>
      </td>
    </tr>
  `;
}

// Load data on startup
loadData();

// Refresh every 10 seconds
setInterval(loadData, 10000);
