// Main background service worker
import storageManager from '../utils/storage.js';
import { getCategoryForUrl, getDomain, CATEGORIES } from '../utils/categories.js';

let currentTab = null;
let currentSessionStart = null;
let isIdle = false;
let isPaused = false;
let customCategories = {};
let focusSession = null;
let blockedSites = [];

// Initialize
async function init() {
  try {
    await storageManager.init();
    customCategories = await storageManager.getSetting('customCategories', {});
    blockedSites = await storageManager.getAllBlockedSites();

    // Set up idle detection
    chrome.idle.setDetectionInterval(300); // 5 minutes

    // Set up periodic save
    chrome.alarms.create('saveTracking', { periodInMinutes: 0.5 });

    // Start tracking current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      startTracking(tabs[0]);
    }

    console.log('FocusTrack AI initialized');
  } catch (error) {
    console.error('Init error:', error);
  }
}

// Event listeners
chrome.idle.onStateChanged.addListener((state) => {
  if (state === 'idle' || state === 'locked') {
    saveCurrentSession();
    isIdle = true;
  } else {
    isIdle = false;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) startTracking(tabs[0]);
    });
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab) handleTabChange(tab);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    handleTabChange(tab);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'saveTracking') {
    saveCurrentSession();
  } else if (alarm.name === 'focusSessionEnd') {
    endFocusSession(true);
  }
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) {
    const domain = getDomain(details.url);
    const blocked = blockedSites.find(s => s.domain === domain);
    if (blocked && shouldBlock(blocked)) {
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL('blocked.html') + '?domain=' + encodeURIComponent(domain)
      });
    }
  }
});

function handleTabChange(tab) {
  saveCurrentSession();
  if (tab.active) startTracking(tab);
}

function startTracking(tab) {
  if (isPaused || isIdle) return;
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;

  const domain = getDomain(tab.url);
  currentTab = {
    url: tab.url,
    domain,
    title: tab.title,
    category: getCategoryForUrl(tab.url, customCategories)
  };
  currentSessionStart = Date.now();
}

async function saveCurrentSession() {
  if (!currentTab || !currentSessionStart) return;

  const duration = Math.floor((Date.now() - currentSessionStart) / 1000);
  if (duration < 1) return;

  await storageManager.addTimeEntry({
    url: currentTab.url,
    domain: currentTab.domain,
    title: currentTab.title,
    category: currentTab.category,
    duration,
    timestamp: currentSessionStart
  });

  currentSessionStart = Date.now();
}

function shouldBlock(site) {
  if (focusSession && site.category === 'distracting') return true;
  if (site.blockType === 'always') return true;
  return false;
}

async function startFocusSession(duration) {
  const now = Date.now();
  focusSession = {
    startTime: now,
    endTime: now + duration * 60 * 1000,
    duration,
    completed: false
  };

  chrome.alarms.create('focusSessionEnd', { when: focusSession.endTime });
  return focusSession;
}

async function endFocusSession(completed = false) {
  if (!focusSession) return;

  focusSession.completed = completed;
  await storageManager.addFocusSession(focusSession);

  if (completed) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Focus Session Complete!',
      message: `Great job! You completed a ${focusSession.duration} minute focus session.`
    });
  }

  focusSession = null;
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message).then(sendResponse);
  return true;
});

async function handleMessage(message) {
  try {
    switch (message.action) {
      case 'getStatus':
        const currentDuration = currentSessionStart ? Math.floor((Date.now() - currentSessionStart) / 1000) : 0;
        return {
          success: true,
          data: {
            status: isPaused ? 'paused' : isIdle ? 'idle' : currentTab ? 'tracking' : 'not-tracking',
            currentTab,
            currentDuration
          }
        };

      case 'getTodayStats':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const entries = await storageManager.getTimeEntriesByDateRange(today, tomorrow);
        return { success: true, data: entries };

      case 'blockSite':
        await storageManager.saveBlockedSite({
          domain: message.domain,
          blockType: message.options?.blockType || 'always',
          category: message.options?.category,
          addedAt: Date.now()
        });
        blockedSites = await storageManager.getAllBlockedSites();
        return { success: true };

      case 'startFocusSession':
        const session = await startFocusSession(message.duration);
        return { success: true, data: session };

      case 'endFocusSession':
        await endFocusSession(false);
        return { success: true };

      case 'getFocusSession':
        return { success: true, data: focusSession };

      default:
        return { success: false, error: 'Unknown action' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Initialize on startup
init();
