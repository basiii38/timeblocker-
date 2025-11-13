import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import '../styles/tailwind.css';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [timeRange, setTimeRange] = useState('today'); // today, week, month
  const [stats, setStats] = useState({
    productiveTime: 0,
    distractingTime: 0,
    neutralTime: 0,
    score: 0,
    totalTime: 0
  });
  const [topSites, setTopSites] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);

    try {
      // Get date range
      const { startDate, endDate } = getDateRange();

      // Get entries
      const response = await chrome.runtime.sendMessage({ action: 'getTodayStats' });

      if (response.success) {
        const entries = response.data;

        // Calculate stats
        const calculated = calculateStats(entries);
        setStats(calculated.stats);
        setTopSites(calculated.topSites);
        setHourlyData(calculated.hourlyData);
        setTrendData(calculated.trendData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();

    if (timeRange === 'today') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }

    if (timeRange === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { startDate: start, endDate: now };
    }

    if (timeRange === 'month') {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      return { startDate: start, endDate: now };
    }

    return { startDate: now, endDate: now };
  };

  const calculateStats = (entries) => {
    let productive = 0;
    let distracting = 0;
    let neutral = 0;
    let uncategorized = 0;

    const domainMap = {};
    const hourlyMap = Array(24).fill(0).map(() => ({
      productive: 0,
      distracting: 0,
      neutral: 0
    }));

    for (const entry of entries) {
      const duration = entry.duration;

      // By category
      if (entry.category === 'productive') {
        productive += duration;
      } else if (entry.category === 'distracting') {
        distracting += duration;
      } else if (entry.category === 'neutral') {
        neutral += duration;
      } else {
        uncategorized += duration;
      }

      // By domain
      if (!domainMap[entry.domain]) {
        domainMap[entry.domain] = {
          domain: entry.domain,
          time: 0,
          category: entry.category
        };
      }
      domainMap[entry.domain].time += duration;

      // By hour
      const hour = new Date(entry.timestamp).getHours();
      if (entry.category === 'productive') {
        hourlyMap[hour].productive += duration;
      } else if (entry.category === 'distracting') {
        hourlyMap[hour].distracting += duration;
      } else {
        hourlyMap[hour].neutral += duration;
      }
    }

    // Top sites
    const topSites = Object.values(domainMap)
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);

    // Calculate score
    const totalRelevantTime = productive + distracting;
    const score = totalRelevantTime > 0 ? Math.round((productive / totalRelevantTime) * 100) : 0;

    const totalTime = productive + distracting + neutral + uncategorized;

    return {
      stats: {
        productiveTime: productive,
        distractingTime: distracting,
        neutralTime: neutral,
        uncategorizedTime: uncategorized,
        score,
        totalTime
      },
      topSites,
      hourlyData: hourlyMap,
      trendData: [] // TODO: Calculate trend
    };
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimeDetailed = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    }
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  };

  // Chart data
  const pieChartData = {
    labels: ['Productive', 'Distracting', 'Neutral', 'Uncategorized'],
    datasets: [{
      data: [
        stats.productiveTime,
        stats.distractingTime,
        stats.neutralTime,
        stats.uncategorizedTime || 0
      ],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6b7280'],
      borderColor: ['#059669', '#dc2626', '#d97706', '#4b5563'],
      borderWidth: 2
    }]
  };

  const barChartData = {
    labels: topSites.map(s => s.domain),
    datasets: [{
      label: 'Time Spent (minutes)',
      data: topSites.map(s => Math.round(s.time / 60)),
      backgroundColor: topSites.map(s => {
        if (s.category === 'productive') return '#10b981';
        if (s.category === 'distracting') return '#ef4444';
        if (s.category === 'neutral') return '#f59e0b';
        return '#6b7280';
      })
    }]
  };

  const hourlyChartData = {
    labels: Array(24).fill(0).map((_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Productive',
        data: hourlyData.map(h => Math.round(h.productive / 60)),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true
      },
      {
        label: 'Distracting',
        data: hourlyData.map(h => Math.round(h.distracting / 60)),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true
      }
    ]
  };

  const exportData = async () => {
    const response = await chrome.runtime.sendMessage({ action: 'exportData' });
    if (response.success) {
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `focustrack-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FocusTrack AI</h1>
              <p className="text-sm text-gray-600">Productivity Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTimeRange('today')}
                  className={`px-4 py-2 rounded ${timeRange === 'today' ? 'bg-white shadow-sm' : ''}`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-4 py-2 rounded ${timeRange === 'week' ? 'bg-white shadow-sm' : ''}`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-4 py-2 rounded ${timeRange === 'month' ? 'bg-white shadow-sm' : ''}`}
                >
                  Month
                </button>
              </div>
              <button onClick={exportData} className="btn-secondary">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="text-sm text-gray-600 mb-1">Productivity Score</div>
            <div className="text-4xl font-bold text-purple-600">{stats.score}%</div>
          </div>
          <div className="stat-card">
            <div className="text-sm text-gray-600 mb-1">Productive Time</div>
            <div className="text-4xl font-bold text-green-600">{formatTime(stats.productiveTime)}</div>
          </div>
          <div className="stat-card">
            <div className="text-sm text-gray-600 mb-1">Distracting Time</div>
            <div className="text-4xl font-bold text-red-600">{formatTime(stats.distractingTime)}</div>
          </div>
          <div className="stat-card">
            <div className="text-sm text-gray-600 mb-1">Total Tracked</div>
            <div className="text-4xl font-bold text-gray-800">{formatTime(stats.totalTime)}</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Time by Category</h2>
            <div className="h-64 flex items-center justify-center">
              <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Top Sites Bar Chart */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Top 10 Sites</h2>
            <div className="h-64">
              <Bar
                data={barChartData}
                options={{
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Hourly Timeline */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4">Hourly Breakdown</h2>
          <div className="h-64">
            <Line
              data={hourlyChartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Minutes'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Hour of Day'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Sites List */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Detailed Site Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Site</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-right py-3 px-4">Time Spent</th>
                  <th className="text-right py-3 px-4">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {topSites.map((site, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{site.domain}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium category-${site.category}`}>
                        {site.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{formatTimeDetailed(site.time)}</td>
                    <td className="py-3 px-4 text-right">
                      {stats.totalTime > 0 ? Math.round((site.time / stats.totalTime) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mount React app
const root = createRoot(document.getElementById('root'));
root.render(<Dashboard />);
