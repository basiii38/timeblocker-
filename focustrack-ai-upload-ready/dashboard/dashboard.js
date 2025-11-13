// Dashboard
let pieChart, barChart, lineChart;

async function loadData() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getTodayStats' });

    if (response.success) {
      const entries = response.data;
      processData(entries);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function processData(entries) {
  let productive = 0, distracting = 0, neutral = 0, uncategorized = 0;
  const domainMap = {};
  const hourlyData = Array(24).fill(0).map(() => ({ productive: 0, distracting: 0 }));

  for (const entry of entries) {
    if (entry.category === 'productive') productive += entry.duration;
    else if (entry.category === 'distracting') distracting += entry.duration;
    else if (entry.category === 'neutral') neutral += entry.duration;
    else uncategorized += entry.duration;

    if (!domainMap[entry.domain]) {
      domainMap[entry.domain] = { domain: entry.domain, time: 0, category: entry.category };
    }
    domainMap[entry.domain].time += entry.duration;

    const hour = new Date(entry.timestamp).getHours();
    if (entry.category === 'productive') hourlyData[hour].productive += entry.duration;
    else if (entry.category === 'distracting') hourlyData[hour].distracting += entry.duration;
  }

  const total = productive + distracting;
  const score = total > 0 ? Math.round((productive / total) * 100) : 0;
  const topSites = Object.values(domainMap).sort((a, b) => b.time - a.time).slice(0, 10);

  updateStats({ score, productive, distracting, neutral, total: productive + distracting + neutral + uncategorized });
  updateCharts({ productive, distracting, neutral, uncategorized, topSites, hourlyData });
  updateTable(topSites, productive + distracting + neutral + uncategorized);
}

function updateStats(data) {
  document.getElementById('scoreValue').textContent = data.score + '%';
  document.getElementById('productiveValue').textContent = formatTime(data.productive);
  document.getElementById('distractingValue').textContent = formatTime(data.distracting);
  document.getElementById('totalValue').textContent = formatTime(data.total);
}

function updateCharts(data) {
  // Pie Chart
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById('pieChart'), {
    type: 'pie',
    data: {
      labels: ['Productive', 'Distracting', 'Neutral', 'Uncategorized'],
      datasets: [{
        data: [data.productive, data.distracting, data.neutral, data.uncategorized],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6b7280']
      }]
    }
  });

  // Bar Chart
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: data.topSites.map(s => s.domain),
      datasets: [{
        label: 'Time (minutes)',
        data: data.topSites.map(s => Math.round(s.time / 60)),
        backgroundColor: data.topSites.map(s => {
          if (s.category === 'productive') return '#10b981';
          if (s.category === 'distracting') return '#ef4444';
          if (s.category === 'neutral') return '#f59e0b';
          return '#6b7280';
        })
      }]
    },
    options: { indexAxis: 'y' }
  });

  // Line Chart
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
      labels: Array(24).fill(0).map((_, i) => i + ':00'),
      datasets: [
        {
          label: 'Productive',
          data: data.hourlyData.map(h => Math.round(h.productive / 60)),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true
        },
        {
          label: 'Distracting',
          data: data.hourlyData.map(h => Math.round(h.distracting / 60)),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true
        }
      ]
    }
  });
}

function updateTable(sites, total) {
  const tbody = document.getElementById('sitesTableBody');
  tbody.innerHTML = sites.map(site => `
    <tr>
      <td>${site.domain}</td>
      <td><span class="category-badge ${site.category}">${site.category}</span></td>
      <td>${formatTimeDetailed(site.time)}</td>
      <td>${total > 0 ? Math.round((site.time / total) * 100) : 0}%</td>
    </tr>
  `).join('');
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatTimeDetailed(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

// Load data on startup
loadData();
