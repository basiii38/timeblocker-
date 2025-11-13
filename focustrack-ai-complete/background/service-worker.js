// FocusTrack AI - Complete Service Worker with ALL features
console.log('FocusTrack AI Complete: Starting...');

const CATEGORIES = {
  PRODUCTIVE: 'productive',
  NEUTRAL: 'neutral',
  DISTRACTING: 'distracting',
  UNCATEGORIZED: 'uncategorized'
};

const DEFAULT_CATEGORIES = {
  'github.com': 'productive', 'stackoverflow.com': 'productive', 'docs.google.com': 'productive',
  'notion.so': 'productive', 'figma.com': 'productive', 'linkedin.com': 'productive',
  'developer.mozilla.org': 'productive', 'codepen.io': 'productive',
  'facebook.com': 'distracting', 'instagram.com': 'distracting', 'twitter.com': 'distracting',
  'x.com': 'distracting', 'reddit.com': 'distracting', 'youtube.com': 'distracting',
  'netflix.com': 'distracting', 'tiktok.com': 'distracting', 'snapchat.com': 'distracting',
  'gmail.com': 'neutral', 'google.com': 'neutral', 'wikipedia.org': 'neutral', 'amazon.com': 'neutral'
};

let currentTab = null, currentSessionStart = null, isIdle = false;
let focusSession = null, breakTimer = null, db = null;
let blockedSites = [], goals = [], customCategories = {};

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FocusTrackDB', 2);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => { db = request.result; resolve(db); };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('timeEntries')) {
        const store = db.createObjectStore('timeEntries', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp'); store.createIndex('date', 'date'); store.createIndex('domain', 'domain');
      }
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
      if (!db.objectStoreNames.contains('blockedSites')) db.createObjectStore('blockedSites', { keyPath: 'domain' });
      if (!db.objectStoreNames.contains('goals')) db.createObjectStore('goals', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('focusSessions')) {
        const store = db.createObjectStore('focusSessions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date');
      }
    };
  });
}

function getDomain(url) {
  try { const urlObj = new URL(url); let domain = urlObj.hostname; if (domain.startsWith('www.')) domain = domain.substring(4); return domain; } catch (e) { return ''; }
}

function getCategoryForUrl(url) {
  const domain = getDomain(url);
  return customCategories[domain] || DEFAULT_CATEGORIES[domain] || CATEGORIES.UNCATEGORIZED;
}

function dbOp(storeName, mode, operation) {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized');
    const transaction = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addTimeEntry(entry) {
  const date = new Date(entry.timestamp).toISOString().split('T')[0];
  return dbOp('timeEntries', 'readwrite', store => store.add({ ...entry, date }));
}

async function getTodayEntries() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  return dbOp('timeEntries', 'readonly', store => {
    const index = store.index('timestamp');
    return index.getAll(IDBKeyRange.bound(today.getTime(), tomorrow.getTime()));
  });
}

async function getDateRangeEntries(startDate, endDate) {
  return dbOp('timeEntries', 'readonly', store => {
    const index = store.index('timestamp');
    return index.getAll(IDBKeyRange.bound(startDate.getTime(), endDate.getTime()));
  });
}

async function saveSetting(key, value) {
  return dbOp('settings', 'readwrite', store => store.put({ key, value }));
}

async function getSetting(key, defaultValue = null) {
  const result = await dbOp('settings', 'readonly', store => store.get(key));
  return result ? result.value : defaultValue;
}

async function loadBlockedSites() {
  blockedSites = await dbOp('blockedSites', 'readonly', store => store.getAll());
}

async function loadGoals() {
  const all = await dbOp('goals', 'readonly', store => store.getAll());
  goals = all.filter(g => g.enabled);
}

function shouldBlockSite(domain) {
  // If in focus session with whitelist, block everything not in whitelist
  if (focusSession && focusSession.allowedSites && focusSession.allowedSites.length > 0) {
    const isAllowed = focusSession.allowedSites.some(allowed => domain.includes(allowed) || allowed.includes(domain));
    if (!isAllowed) return true; // Block if not in whitelist
  }

  // Regular blocking logic
  const site = blockedSites.find(s => s.domain === domain);
  if (!site || !site.enabled) {
    // If in focus session without whitelist, block distracting sites
    if (focusSession) {
      const category = getCategoryForUrl('https://' + domain);
      if (category === 'distracting') return true;
    }
    return false;
  }

  if (focusSession && site.category === 'distracting') return true;
  if (site.blockType === 'always') return true;
  if (site.blockType === 'scheduled') return isWithinSchedule(site.schedule);
  if (site.blockType === 'timeLimit') return checkTimeLimitSync(domain, site.limitMinutes);
  return false;
}

function isWithinSchedule(schedule) {
  if (!schedule) return false;
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  if (!schedule.days || !schedule.days.includes(currentDay)) return false;
  const [startHour, startMin] = schedule.startTime.split(':').map(Number);
  const [endHour, endMin] = schedule.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

function checkTimeLimitSync(domain, limitMinutes) {
  return false; // Simplified for now
}

async function checkGoals() {
  const entries = await getTodayEntries();
  for (const goal of goals) {
    if (goal.type === 'productiveTime') await checkProductiveGoal(goal, entries);
    else if (goal.type === 'distractingLimit') await checkDistractingLimit(goal, entries);
    else if (goal.type === 'siteLimit') await checkSiteLimit(goal, entries);
  }
}

async function checkProductiveGoal(goal, entries) {
  const productiveTime = entries.filter(e => e.category === 'productive').reduce((sum, e) => sum + e.duration, 0);
  const targetSeconds = goal.targetMinutes * 60;
  const progress = Math.round((productiveTime / targetSeconds) * 100);
  const notifiedHalfway = await getSetting(`goal_${goal.id}_halfway`, false);
  const notifiedAchieved = await getSetting(`goal_${goal.id}_achieved`, false);
  if (progress >= 50 && progress < 60 && !notifiedHalfway) {
    chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: 'Halfway There!', message: `You're halfway to your daily ${goal.targetMinutes} minute productive time goal!` });
    await saveSetting(`goal_${goal.id}_halfway`, true);
  }
  if (progress >= 100 && !notifiedAchieved) {
    chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: '🎉 Goal Achieved!', message: `Congratulations! You've reached your daily productive time goal!` });
    await saveSetting(`goal_${goal.id}_achieved`, true);
  }
}

async function checkDistractingLimit(goal, entries) {
  const distractingTime = entries.filter(e => e.category === 'distracting').reduce((sum, e) => sum + e.duration, 0);
  const limitSeconds = goal.limitMinutes * 60;
  if (distractingTime >= limitSeconds) {
    const notified = await getSetting(`goal_${goal.id}_exceeded`, false);
    if (!notified) {
      chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: '⚠️ Distraction Limit Exceeded', message: `You've exceeded your ${goal.limitMinutes} minute distraction limit today.` });
      await saveSetting(`goal_${goal.id}_exceeded`, true);
    }
  }
}

async function checkSiteLimit(goal, entries) {
  const siteTime = entries.filter(e => e.domain === goal.domain).reduce((sum, e) => sum + e.duration, 0);
  const limitSeconds = goal.limitMinutes * 60;
  if (siteTime >= limitSeconds * 0.8 && siteTime < limitSeconds) {
    const notified = await getSetting(`goal_${goal.id}_warning`, false);
    if (!notified) {
      chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: '⚠️ Approaching Limit', message: `You've used 80% of your ${goal.limitMinutes} minute limit for ${goal.domain}.` });
      await saveSetting(`goal_${goal.id}_warning`, true);
    }
  }
  if (siteTime >= limitSeconds) {
    const notified = await getSetting(`goal_${goal.id}_exceeded`, false);
    if (!notified) {
      chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: '🚫 Time Limit Reached', message: `You've reached your ${goal.limitMinutes} minute limit for ${goal.domain}.` });
      await saveSetting(`goal_${goal.id}_exceeded`, true);
    }
  }
}

function startTracking(tab) {
  if (isIdle || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;
  const domain = getDomain(tab.url);
  currentTab = { url: tab.url, domain, title: tab.title || domain, category: getCategoryForUrl(tab.url) };
  currentSessionStart = Date.now();
}

async function saveCurrentSession() {
  if (!currentTab || !currentSessionStart) return;
  const duration = Math.floor((Date.now() - currentSessionStart) / 1000);
  if (duration < 1) return;
  try {
    await addTimeEntry({ url: currentTab.url, domain: currentTab.domain, title: currentTab.title, category: currentTab.category, duration, timestamp: currentSessionStart });
    currentSessionStart = Date.now();
  } catch (error) { console.error('Save error:', error); }
}

chrome.idle.setDetectionInterval(300);
chrome.idle.onStateChanged.addListener((state) => {
  if (state === 'idle' || state === 'locked') { saveCurrentSession(); isIdle = true; }
  else { isIdle = false; chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { if (tabs.length > 0) startTracking(tabs[0]); }); }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => { saveCurrentSession(); if (tab) startTracking(tab); });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) { saveCurrentSession(); startTracking(tab); }
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) {
    const domain = getDomain(details.url);
    if (shouldBlockSite(domain)) {
      chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL('blocked.html') + '?domain=' + encodeURIComponent(domain) });
    }
  }
});

chrome.alarms.create('saveTracking', { periodInMinutes: 0.5 });
chrome.alarms.create('checkGoals', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'saveTracking') saveCurrentSession();
  else if (alarm.name === 'checkGoals') checkGoals();
  else if (alarm.name === 'focusSessionEnd') endFocusSession(true);
  else if (alarm.name === 'breakTimerEnd') endBreakTimer();
});

async function startFocusSession(duration, allowedSites = []) {
  const now = Date.now();
  focusSession = {
    startTime: now,
    endTime: now + duration * 60 * 1000,
    duration,
    completed: false,
    allowedSites: allowedSites
  };
  chrome.alarms.create('focusSessionEnd', { when: focusSession.endTime });
  return focusSession;
}

async function endFocusSession(completed = false) {
  if (!focusSession) return;
  focusSession.completed = completed;
  if (db) {
    const date = new Date(focusSession.startTime).toISOString().split('T')[0];
    await dbOp('focusSessions', 'readwrite', store => store.add({ ...focusSession, date }));
  }
  if (completed) chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: '🎯 Focus Session Complete!', message: `Great job! You completed a ${focusSession.duration} minute focus session.` });
  focusSession = null;
}

function startBreakTimer(minutes) {
  const now = Date.now();
  breakTimer = { startTime: now, endTime: now + minutes * 60 * 1000, duration: minutes };
  chrome.alarms.create('breakTimerEnd', { when: breakTimer.endTime });
  return breakTimer;
}

function endBreakTimer() {
  if (!breakTimer) return;
  chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: '☕ Break Time Over', message: 'Time to get back to work!' });
  breakTimer = null;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message).then(sendResponse).catch(err => sendResponse({ success: false, error: err.message }));
  return true;
});

async function handleMessage(message) {
  const currentDuration = currentSessionStart ? Math.floor((Date.now() - currentSessionStart) / 1000) : 0;
  switch (message.action) {
    case 'getStatus': return { success: true, data: { status: isIdle ? 'idle' : currentTab ? 'tracking' : 'not-tracking', currentTab, currentDuration } };
    case 'getTodayStats': return { success: true, data: await getTodayEntries() };
    case 'getDateRangeStats': return { success: true, data: await getDateRangeEntries(new Date(message.startDate), new Date(message.endDate)) };
    case 'startFocusSession': return { success: true, data: await startFocusSession(message.duration, message.allowedSites || []) };
    case 'endFocusSession': await endFocusSession(false); return { success: true };
    case 'getFocusSession': return { success: true, data: focusSession };
    case 'startBreakTimer': return { success: true, data: startBreakTimer(message.minutes) };
    case 'getBreakTimer': return { success: true, data: breakTimer };
    case 'addBlockedSite': await dbOp('blockedSites', 'readwrite', store => store.put(message.site)); await loadBlockedSites(); return { success: true };
    case 'removeBlockedSite': await dbOp('blockedSites', 'readwrite', store => store.delete(message.domain)); await loadBlockedSites(); return { success: true };
    case 'getBlockedSites': return { success: true, data: blockedSites };
    case 'addGoal': await dbOp('goals', 'readwrite', store => store.add(message.goal)); await loadGoals(); return { success: true };
    case 'updateGoal': await dbOp('goals', 'readwrite', store => store.put(message.goal)); await loadGoals(); return { success: true };
    case 'deleteGoal': await dbOp('goals', 'readwrite', store => store.delete(message.goalId)); await loadGoals(); return { success: true };
    case 'getGoals': return { success: true, data: goals };
    case 'saveSetting': await saveSetting(message.key, message.value); if (message.key === 'customCategories') customCategories = message.value; return { success: true };
    case 'getSetting': return { success: true, data: await getSetting(message.key, message.defaultValue) };
    case 'exportData': return { success: true, data: await exportAllData() };
    case 'getFocusSessions': return { success: true, data: await dbOp('focusSessions', 'readonly', store => store.getAll()) };
    default: return { success: false, error: 'Unknown action' };
  }
}

async function exportAllData() {
  const timeEntries = await dbOp('timeEntries', 'readonly', store => store.getAll());
  const settings = await dbOp('settings', 'readonly', store => store.getAll());
  return { timeEntries, blockedSites, goals, settings, customCategories, exportDate: new Date().toISOString() };
}

async function init() {
  try {
    await initDB();
    customCategories = await getSetting('customCategories', {});
    await loadBlockedSites();
    await loadGoals();
    console.log('FocusTrack AI Complete initialized successfully');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { if (tabs.length > 0) startTracking(tabs[0]); });
  } catch (error) { console.error('Init error:', error); }
}

init();
