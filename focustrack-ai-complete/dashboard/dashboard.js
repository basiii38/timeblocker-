// Dashboard with Chart.js
console.log('Dashboard loaded');

let categoryChart = null;
let topSitesChart = null;
let hourlyChart = null;
let currentDateRange = 'today';

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
    console.log('Loading dashboard data for:', currentDateRange);

    let response;
    if (currentDateRange === 'today') {
      response = await chrome.runtime.sendMessage({ action: 'getTodayStats' });
    } else {
      const endDate = new Date();
      const startDate = new Date();
      if (currentDateRange === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (currentDateRange === 'month') {
        startDate.setDate(startDate.getDate() - 30);
      }
      response = await chrome.runtime.sendMessage({
        action: 'getDateRangeStats',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    }

    if (response && response.success) {
      const entries = response.data || [];
      console.log('Processing', entries.length, 'entries');
      processData(entries);

      // Load additional stats
      loadAdditionalStats();
    } else {
      showEmpty();
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    showEmpty();
  }
}

async function loadAdditionalStats() {
  try {
    // Get focus sessions
    const sessionsResponse = await chrome.runtime.sendMessage({ action: 'getFocusSessions' });
    const sessions = sessionsResponse.success ? sessionsResponse.data || [] : [];

    // Get goals
    const goalsResponse = await chrome.runtime.sendMessage({ action: 'getGoals' });
    const goals = goalsResponse.success ? goalsResponse.data || [] : [];

    // Filter by date range
    const now = Date.now();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (currentDateRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (currentDateRange === 'month') {
      startDate.setDate(startDate.getDate() - 30);
    }

    const filteredSessions = sessions.filter(s => s.startTime >= startDate.getTime());
    const completedSessions = filteredSessions.filter(s => s.completed);

    // Update focus sessions stats
    document.getElementById('focusSessionsCount').textContent = filteredSessions.length;
    if (filteredSessions.length > 0) {
      const completionRate = Math.round((completedSessions.length / filteredSessions.length) * 100);
      document.getElementById('focusSessionsRate').textContent = `${completionRate}% completion rate`;
    } else {
      document.getElementById('focusSessionsRate').textContent = 'No sessions yet';
    }

    // Update goals stats
    const activeGoals = goals.filter(g => g.enabled);
    document.getElementById('goalsAchieved').textContent = '0'; // Placeholder - would need goal tracking logic
    document.getElementById('goalsTotal').textContent = `of ${activeGoals.length} active goals`;

    // Update avg session time
    if (completedSessions.length > 0) {
      const avgDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length;
      document.getElementById('avgSessionTime').textContent = `${Math.round(avgDuration)} min`;
    } else {
      document.getElementById('avgSessionTime').textContent = '--';
    }

  } catch (error) {
    console.error('Error loading additional stats:', error);
  }
}

function processData(entries) {
  let productive = 0, distracting = 0, neutral = 0, uncategorized = 0;
  const domainMap = {};
  const hourlyMap = {};

  // Initialize hourly map (0-23 hours)
  for (let i = 0; i < 24; i++) {
    hourlyMap[i] = { productive: 0, distracting: 0, neutral: 0 };
  }

  for (const entry of entries) {
    // Category totals
    if (entry.category === 'productive') productive += entry.duration;
    else if (entry.category === 'distracting') distracting += entry.duration;
    else if (entry.category === 'neutral') neutral += entry.duration;
    else uncategorized += entry.duration;

    // Domain map
    if (!domainMap[entry.domain]) {
      domainMap[entry.domain] = {
        domain: entry.domain,
        time: 0,
        category: entry.category
      };
    }
    domainMap[entry.domain].time += entry.duration;

    // Hourly breakdown
    const hour = new Date(entry.timestamp).getHours();
    if (hourlyMap[hour]) {
      if (entry.category === 'productive') hourlyMap[hour].productive += entry.duration;
      else if (entry.category === 'distracting') hourlyMap[hour].distracting += entry.duration;
      else if (entry.category === 'neutral') hourlyMap[hour].neutral += entry.duration;
    }
  }

  const total = productive + distracting;
  const score = total > 0 ? Math.round((productive / total) * 100) : 0;
  const totalTime = productive + distracting + neutral + uncategorized;

  const topSites = Object.values(domainMap)
    .sort((a, b) => b.time - a.time)
    .slice(0, 20);

  updateStats({ score, productive, distracting, neutral, totalTime });
  updateCategoryChart({ productive, distracting, neutral, uncategorized });
  updateTopSitesChart(topSites);
  updateHourlyChart(hourlyMap);
  updateTable(topSites, totalTime);
}

function updateStats(data) {
  document.getElementById('scoreValue').textContent = data.score + '%';
  document.getElementById('productiveValue').textContent = formatTime(data.productive);
  document.getElementById('distractingValue').textContent = formatTime(data.distracting);
  document.getElementById('totalValue').textContent = formatTime(data.totalTime);
}

function updateCategoryChart(data) {
  const ctx = document.getElementById('categoryChart').getContext('2d');

  if (categoryChart) {
    categoryChart.destroy();
  }

  const hasData = data.productive > 0 || data.distracting > 0 || data.neutral > 0 || data.uncategorized > 0;

  if (!hasData) {
    return;
  }

  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Productive', 'Distracting', 'Neutral', 'Uncategorized'],
      datasets: [{
        data: [
          Math.round(data.productive / 60), // Convert to minutes
          Math.round(data.distracting / 60),
          Math.round(data.neutral / 60),
          Math.round(data.uncategorized / 60)
        ],
        backgroundColor: [
          '#10b981',  // Green for productive
          '#ef4444',  // Red for distracting
          '#f59e0b',  // Yellow for neutral
          '#94a3b8'   // Gray for uncategorized
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 13,
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${value} min`;
            }
          }
        }
      }
    }
  });
}

function updateTopSitesChart(sites) {
  const ctx = document.getElementById('topSitesChart').getContext('2d');

  if (topSitesChart) {
    topSitesChart.destroy();
  }

  if (sites.length === 0) {
    return;
  }

  const top10 = sites.slice(0, 10);

  topSitesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top10.map(s => s.domain.length > 20 ? s.domain.substring(0, 20) + '...' : s.domain),
      datasets: [{
        label: 'Minutes',
        data: top10.map(s => Math.round(s.time / 60)),
        backgroundColor: top10.map(s => {
          if (s.category === 'productive') return '#10b981';
          if (s.category === 'distracting') return '#ef4444';
          if (s.category === 'neutral') return '#f59e0b';
          return '#94a3b8';
        }),
        borderWidth: 0,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.parsed.x} minutes`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            font: {
              size: 12
            }
          },
          grid: {
            display: true,
            color: '#f3f4f6'
          }
        },
        y: {
          ticks: {
            font: {
              size: 12
            }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function updateHourlyChart(hourlyMap) {
  const ctx = document.getElementById('hourlyChart').getContext('2d');

  if (hourlyChart) {
    hourlyChart.destroy();
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const productiveData = hours.map(h => Math.round((hourlyMap[h]?.productive || 0) / 60));
  const distractingData = hours.map(h => Math.round((hourlyMap[h]?.distracting || 0) / 60));
  const neutralData = hours.map(h => Math.round((hourlyMap[h]?.neutral || 0) / 60));

  const hasData = productiveData.some(v => v > 0) || distractingData.some(v => v > 0) || neutralData.some(v => v > 0);

  if (!hasData) {
    return;
  }

  hourlyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours.map(h => {
        const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const ampm = h < 12 ? 'AM' : 'PM';
        return `${hour12}${ampm}`;
      }),
      datasets: [
        {
          label: 'Productive',
          data: productiveData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Distracting',
          data: distractingData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Neutral',
          data: neutralData,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            padding: 15,
            font: {
              size: 13
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y} min`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              size: 11
            }
          },
          grid: {
            color: '#f3f4f6'
          }
        },
        x: {
          ticks: {
            font: {
              size: 10
            },
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
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

// Date range selector
document.getElementById('dateRange').addEventListener('change', (e) => {
  currentDateRange = e.target.value;
  loadData();
});

// Settings button (with smart tab reuse)
document.getElementById('openSettingsBtn').addEventListener('click', async () => {
  const url = chrome.runtime.getURL('settings/settings.html') + '?from=dashboard';
  const tabs = await chrome.tabs.query({});
  const settingsUrl = chrome.runtime.getURL('settings/settings.html');
  const existingTab = tabs.find(tab => tab.url.startsWith(settingsUrl));

  if (existingTab) {
    // Focus existing tab and update URL with query param
    await chrome.tabs.update(existingTab.id, { active: true, url: url });
    await chrome.windows.update(existingTab.windowId, { focused: true });
  } else {
    // Open new tab
    chrome.tabs.create({ url: url });
  }
});

// Load data on startup
loadData();

// Refresh every 10 seconds
setInterval(loadData, 10000);
