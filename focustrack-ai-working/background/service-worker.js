// FocusTrack AI - Background Service Worker
console.log('FocusTrack AI: Service worker starting...');

// Categories
const CATEGORIES = {
  PRODUCTIVE: 'productive',
  NEUTRAL: 'neutral',
  DISTRACTING: 'distracting',
  UNCATEGORIZED: 'uncategorized'
};

const DEFAULT_CATEGORIES = {
  'github.com': 'productive',
  'stackoverflow.com': 'productive',
  'docs.google.com': 'productive',
  'notion.so': 'productive',
  'figma.com': 'productive',
  'linkedin.com': 'productive',
  'facebook.com': 'distracting',
  'instagram.com': 'distracting',
  'twitter.com': 'distracting',
  'x.com': 'distracting',
  'reddit.com': 'distracting',
  'youtube.com': 'distracting',
  'netflix.com': 'distracting',
  'tiktok.com': 'distracting',
  'gmail.com': 'neutral',
  'google.com': 'neutral',
  'wikipedia.org': 'neutral',
  'amazon.com': 'neutral'
};

// State
let currentTab = null;
let currentSessionStart = null;
let isIdle = false;
let focusSession = null;
let db = null;

// Initialize IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FocusTrackDB', 1);

    request.onerror = () => {
      console.error('DB Error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('DB opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('timeEntries')) {
        const store = db.createObjectStore('timeEntries', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('date', 'date');
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains('blockedSites')) {
        db.createObjectStore('blockedSites', { keyPath: 'domain' });
      }
    };
  });
}

// Helper: Get domain from URL
function getDomain(url) {
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname;
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    return domain;
  } catch (e) {
    return '';
  }
}

// Helper: Get category for URL
function getCategoryForUrl(url) {
  const domain = getDomain(url);
  return DEFAULT_CATEGORIES[domain] || CATEGORIES.UNCATEGORIZED;
}

// Add time entry to DB
function addTimeEntry(entry) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('DB not initialized');
      return;
    }

    const date = new Date(entry.timestamp).toISOString().split('T')[0];
    const transaction = db.transaction(['timeEntries'], 'readwrite');
    const store = transaction.objectStore('timeEntries');
    const request = store.add({ ...entry, date });

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get today's entries
function getTodayEntries() {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('DB not initialized');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const transaction = db.transaction(['timeEntries'], 'readonly');
    const store = transaction.objectStore('timeEntries');
    const index = store.index('timestamp');
    const range = IDBKeyRange.bound(today.getTime(), tomorrow.getTime());
    const request = index.getAll(range);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Start tracking
function startTracking(tab) {
  if (isIdle) return;
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;

  const domain = getDomain(tab.url);
  currentTab = {
    url: tab.url,
    domain,
    title: tab.title || domain,
    category: getCategoryForUrl(tab.url)
  };
  currentSessionStart = Date.now();

  console.log('Tracking:', domain);
}

// Save current session
async function saveCurrentSession() {
  if (!currentTab || !currentSessionStart) return;

  const duration = Math.floor((Date.now() - currentSessionStart) / 1000);
  if (duration < 1) return;

  try {
    await addTimeEntry({
      url: currentTab.url,
      domain: currentTab.domain,
      title: currentTab.title,
      category: currentTab.category,
      duration,
      timestamp: currentSessionStart
    });

    console.log(`Saved ${duration}s for ${currentTab.domain}`);
    currentSessionStart = Date.now();
  } catch (error) {
    console.error('Save error:', error);
  }
}

// Event Listeners
chrome.idle.setDetectionInterval(300);

chrome.idle.onStateChanged.addListener((state) => {
  if (state === 'idle' || state === 'locked') {
    saveCurrentSession();
    isIdle = true;
    console.log('User idle');
  } else {
    isIdle = false;
    console.log('User active');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) startTracking(tabs[0]);
    });
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    saveCurrentSession();
    if (tab) startTracking(tab);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    saveCurrentSession();
    startTracking(tab);
  }
});

chrome.alarms.create('saveTracking', { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'saveTracking') {
    saveCurrentSession();
  } else if (alarm.name === 'focusSessionEnd') {
    endFocusSession(true);
  }
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message).then(sendResponse).catch(err => {
    console.error('Message error:', err);
    sendResponse({ success: false, error: err.message });
  });
  return true;
});

async function handleMessage(message) {
  console.log('Message received:', message.action);

  try {
    switch (message.action) {
      case 'getStatus':
        const currentDuration = currentSessionStart ? Math.floor((Date.now() - currentSessionStart) / 1000) : 0;
        return {
          success: true,
          data: {
            status: isIdle ? 'idle' : currentTab ? 'tracking' : 'not-tracking',
            currentTab,
            currentDuration
          }
        };

      case 'getTodayStats':
        const entries = await getTodayEntries();
        return { success: true, data: entries };

      case 'startFocusSession':
        const now = Date.now();
        focusSession = {
          startTime: now,
          endTime: now + message.duration * 60 * 1000,
          duration: message.duration,
          completed: false
        };
        chrome.alarms.create('focusSessionEnd', { when: focusSession.endTime });
        return { success: true, data: focusSession };

      case 'endFocusSession':
        focusSession = null;
        chrome.alarms.clear('focusSessionEnd');
        return { success: true };

      case 'getFocusSession':
        return { success: true, data: focusSession };

      default:
        return { success: false, error: 'Unknown action' };
    }
  } catch (error) {
    console.error('Handler error:', error);
    return { success: false, error: error.message };
  }
}

// Initialize
async function init() {
  try {
    await initDB();
    console.log('FocusTrack AI initialized successfully');

    // Start tracking current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) startTracking(tabs[0]);
    });
  } catch (error) {
    console.error('Init error:', error);
  }
}

// Start
init();
