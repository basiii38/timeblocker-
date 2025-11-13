import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/tailwind.css';

function Popup() {
  const [stats, setStats] = useState({
    productiveTime: 0,
    distractingTime: 0,
    neutralTime: 0,
    score: 0,
    topSites: []
  });
  const [currentSite, setCurrentSite] = useState(null);
  const [focusSession, setFocusSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Get today's stats
      const statsResponse = await chrome.runtime.sendMessage({ action: 'getTodayStats' });

      if (statsResponse.success) {
        const entries = statsResponse.data;

        // Calculate time by category
        let productive = 0;
        let distracting = 0;
        let neutral = 0;

        const domainMap = {};

        for (const entry of entries) {
          if (entry.category === 'productive') {
            productive += entry.duration;
          } else if (entry.category === 'distracting') {
            distracting += entry.duration;
          } else if (entry.category === 'neutral') {
            neutral += entry.duration;
          }

          // Track by domain
          if (!domainMap[entry.domain]) {
            domainMap[entry.domain] = {
              domain: entry.domain,
              time: 0,
              category: entry.category
            };
          }
          domainMap[entry.domain].time += entry.duration;
        }

        // Get top 5 sites
        const topSites = Object.values(domainMap)
          .sort((a, b) => b.time - a.time)
          .slice(0, 5);

        // Calculate score
        const totalRelevantTime = productive + distracting;
        const score = totalRelevantTime > 0 ? Math.round((productive / totalRelevantTime) * 100) : 0;

        setStats({
          productiveTime: productive,
          distractingTime: distracting,
          neutralTime: neutral,
          score,
          topSites
        });
      }

      // Get current site
      const statusResponse = await chrome.runtime.sendMessage({ action: 'getStatus' });
      if (statusResponse.success) {
        setCurrentSite(statusResponse.data);
      }

      // Get focus session
      const sessionResponse = await chrome.runtime.sendMessage({ action: 'getFocusSession' });
      if (sessionResponse.success) {
        setFocusSession(sessionResponse.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const blockCurrentSite = async () => {
    if (currentSite && currentSite.currentTab) {
      await chrome.runtime.sendMessage({
        action: 'blockSite',
        domain: currentSite.currentTab.domain,
        options: { blockType: 'always' }
      });
      loadData();
    }
  };

  const startFocusSession = async (duration) => {
    await chrome.runtime.sendMessage({
      action: 'startFocusSession',
      duration
    });
    loadData();
  };

  const endFocusSession = async () => {
    await chrome.runtime.sendMessage({ action: 'endFocusSession' });
    setFocusSession(null);
  };

  const openDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">FocusTrack AI</h1>
        <p className="text-sm text-gray-600">Your productivity companion</p>
      </div>

      {/* Productivity Score */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 mb-4 text-white">
        <div className="text-sm mb-2">Today's Productivity Score</div>
        <div className="text-5xl font-bold mb-2">{stats.score}%</div>
        <div className="flex justify-between text-sm">
          <span>Productive: {formatTime(stats.productiveTime)}</span>
          <span>Distracting: {formatTime(stats.distractingTime)}</span>
        </div>
      </div>

      {/* Current Site */}
      {currentSite && currentSite.status === 'tracking' && (
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Currently on:</div>
            <span className={`px-2 py-1 rounded text-xs font-medium category-${currentSite.currentTab.category}`}>
              {currentSite.currentTab.category}
            </span>
          </div>
          <div className="font-medium text-gray-800 mb-2">{currentSite.currentTab.domain}</div>
          <div className="text-sm text-gray-600">{formatTime(currentSite.currentDuration)}</div>
          <button
            onClick={blockCurrentSite}
            className="mt-3 w-full btn-danger text-sm"
          >
            Block This Site
          </button>
        </div>
      )}

      {/* Focus Session */}
      {focusSession ? (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-green-800">Focus Session Active</span>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-sm text-green-700 mb-3">
            {Math.floor((focusSession.endTime - Date.now()) / 60000)} minutes remaining
          </div>
          <button onClick={endFocusSession} className="w-full btn-danger text-sm">
            End Session
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-800 mb-3">Start Focus Session</div>
          <div className="flex gap-2">
            <button onClick={() => startFocusSession(25)} className="flex-1 btn-primary text-sm">
              25 min
            </button>
            <button onClick={() => startFocusSession(45)} className="flex-1 btn-primary text-sm">
              45 min
            </button>
            <button onClick={() => startFocusSession(60)} className="flex-1 btn-primary text-sm">
              60 min
            </button>
          </div>
        </div>
      )}

      {/* Top Sites */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-gray-800 mb-3">Top Sites Today</div>
        {stats.topSites.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            No activity tracked yet
          </div>
        ) : (
          <div className="space-y-2">
            {stats.topSites.map((site, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{site.domain}</div>
                  <div className="text-xs text-gray-500">{formatTime(site.time)}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium category-${site.category}`}>
                  {site.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <button onClick={openDashboard} className="w-full btn-primary">
        Open Full Dashboard
      </button>
    </div>
  );
}

// Mount React app
const root = createRoot(document.getElementById('root'));
root.render(<Popup />);
