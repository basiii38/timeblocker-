// Main background service worker
// Coordinates time tracking, blocking, and other background tasks

import storageManager from '../utils/storage-manager.js';
import TimeTracker from './time-tracker.js';
import Blocker from './blocker.js';
import { CATEGORIES } from '../utils/categories.js';

let timeTracker;
let blocker;
let focusSession = null;

// Initialize extension
async function init() {
  try {
    // Initialize storage
    await storageManager.init();
    console.log('Storage initialized');

    // Initialize time tracker
    timeTracker = new TimeTracker(storageManager);
    await timeTracker.init();
    console.log('Time tracker initialized');

    // Initialize blocker
    blocker = new Blocker(storageManager);
    await blocker.init();
    console.log('Blocker initialized');

    // Set up daily reset alarm (midnight)
    setupDailyReset();

    // Set up goals checking
    setupGoalsChecker();

    console.log('FocusTrack AI initialized successfully');
  } catch (error) {
    console.error('Error initializing extension:', error);
  }
}

/**
 * Set up daily reset alarm
 */
function setupDailyReset() {
  // Calculate time until midnight
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight - now;

  // Create alarm for midnight
  chrome.alarms.create('dailyReset', {
    when: Date.now() + msUntilMidnight,
    periodInMinutes: 24 * 60
  });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyReset') {
      handleDailyReset();
    }
  });
}

/**
 * Handle daily reset
 */
async function handleDailyReset() {
  console.log('Performing daily reset');

  // Reset blocked attempts counter
  await blocker.resetDailyCounters();

  // Send daily summary notification
  await sendDailySummary();

  // Check if we should send AI insights (weekly)
  const lastAIReport = await storageManager.getSetting('lastAIReport', 0);
  const daysSinceLastReport = (Date.now() - lastAIReport) / (1000 * 60 * 60 * 24);

  if (daysSinceLastReport >= 7) {
    // Trigger AI insights generation (will be implemented in AI module)
    console.log('Time for weekly AI insights');
  }
}

/**
 * Send daily summary notification
 */
async function sendDailySummary() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const entries = await storageManager.getTimeEntriesByDateRange(today, tomorrow);

  // Calculate stats
  let productiveTime = 0;
  let distractingTime = 0;

  for (const entry of entries) {
    if (entry.category === CATEGORIES.PRODUCTIVE) {
      productiveTime += entry.duration;
    } else if (entry.category === CATEGORIES.DISTRACTING) {
      distractingTime += entry.duration;
    }
  }

  const totalTime = productiveTime + distractingTime;
  const score = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;

  // Send notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Your Daily Productivity Summary',
    message: `Productivity Score: ${score}%\nProductive: ${formatTime(productiveTime)}\nDistracting: ${formatTime(distractingTime)}`,
    priority: 2
  });
}

/**
 * Set up goals checker
 */
function setupGoalsChecker() {
  // Check goals every 5 minutes
  chrome.alarms.create('checkGoals', { periodInMinutes: 5 });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkGoals') {
      checkGoals();
    }
  });
}

/**
 * Check if goals are met and send notifications
 */
async function checkGoals() {
  const goals = await storageManager.getAllGoals();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const entries = await storageManager.getTimeEntriesByDateRange(today, tomorrow);

  for (const goal of goals) {
    if (!goal.enabled) continue;

    if (goal.type === 'productiveTime') {
      await checkProductiveTimeGoal(goal, entries);
    } else if (goal.type === 'distractingTime') {
      await checkDistractingTimeGoal(goal, entries);
    } else if (goal.type === 'siteLimit') {
      await checkSiteLimitGoal(goal, entries);
    }
  }
}

/**
 * Check productive time goal
 */
async function checkProductiveTimeGoal(goal, entries) {
  const productiveTime = entries
    .filter(e => e.category === CATEGORIES.PRODUCTIVE)
    .reduce((sum, e) => sum + e.duration, 0);

  const targetSeconds = goal.targetMinutes * 60;

  // Check if halfway
  if (productiveTime >= targetSeconds * 0.5 && productiveTime < targetSeconds * 0.6) {
    const notified = await storageManager.getSetting(`goal_${goal.id}_halfway_notified`, false);
    if (!notified) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Halfway to your goal!',
        message: `You're halfway to your daily productive time goal of ${goal.targetMinutes} minutes.`,
        priority: 1
      });
      await storageManager.setSetting(`goal_${goal.id}_halfway_notified`, true);
    }
  }

  // Check if achieved
  if (productiveTime >= targetSeconds) {
    const notified = await storageManager.getSetting(`goal_${goal.id}_achieved_notified`, false);
    if (!notified) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Goal Achieved!',
        message: `Congratulations! You've reached your daily productive time goal of ${goal.targetMinutes} minutes.`,
        priority: 2
      });
      await storageManager.setSetting(`goal_${goal.id}_achieved_notified`, true);
    }
  }
}

/**
 * Check distracting time goal
 */
async function checkDistractingTimeGoal(goal, entries) {
  const distractingTime = entries
    .filter(e => e.category === CATEGORIES.DISTRACTING)
    .reduce((sum, e) => sum + e.duration, 0);

  const limitSeconds = goal.limitMinutes * 60;

  if (distractingTime >= limitSeconds) {
    const notified = await storageManager.getSetting(`goal_${goal.id}_exceeded_notified`, false);
    if (!notified) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Distraction Limit Exceeded',
        message: `You've exceeded your daily distraction limit of ${goal.limitMinutes} minutes.`,
        priority: 2
      });
      await storageManager.setSetting(`goal_${goal.id}_exceeded_notified`, true);
    }
  }
}

/**
 * Check site-specific time limit goal
 */
async function checkSiteLimitGoal(goal, entries) {
  const siteTime = entries
    .filter(e => e.domain === goal.domain)
    .reduce((sum, e) => sum + e.duration, 0);

  const limitSeconds = goal.limitMinutes * 60;

  if (siteTime >= limitSeconds * 0.8 && siteTime < limitSeconds) {
    const notified = await storageManager.getSetting(`goal_${goal.id}_warning_notified`, false);
    if (!notified) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Time Limit Warning',
        message: `You've used 80% of your daily ${goal.domain} time limit.`,
        priority: 1
      });
      await storageManager.setSetting(`goal_${goal.id}_warning_notified`, true);
    }
  }

  if (siteTime >= limitSeconds) {
    const notified = await storageManager.getSetting(`goal_${goal.id}_exceeded_notified`, false);
    if (!notified) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Time Limit Exceeded',
        message: `You've exceeded your ${goal.limitMinutes} minute limit for ${goal.domain}.`,
        priority: 2
      });
      await storageManager.setSetting(`goal_${goal.id}_exceeded_notified`, true);
    }
  }
}

/**
 * Start a focus session
 */
async function startFocusSession(duration) {
  const now = Date.now();

  focusSession = {
    startTime: now,
    endTime: now + duration * 60 * 1000,
    duration,
    completed: false
  };

  // Enable focus mode blocking
  await blocker.enableFocusMode();

  // Set alarm for end of session
  chrome.alarms.create('focusSessionEnd', {
    when: focusSession.endTime
  });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'focusSessionEnd') {
      endFocusSession(true);
    }
  });

  console.log(`Started ${duration} minute focus session`);

  return focusSession;
}

/**
 * End a focus session
 */
async function endFocusSession(completed = false) {
  if (!focusSession) return;

  focusSession.completed = completed;

  // Save session to database
  await storageManager.addFocusSession(focusSession);

  // Disable focus mode blocking
  await blocker.disableFocusMode();

  // Send notification
  if (completed) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Focus Session Complete!',
      message: `Great job! You completed a ${focusSession.duration} minute focus session.`,
      priority: 2
    });
  }

  focusSession = null;

  console.log('Focus session ended');
}

/**
 * Format time for display
 */
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Message handler for popup/dashboard communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep channel open for async response
});

/**
 * Handle messages from popup/dashboard
 */
async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.action) {
      case 'getStatus':
        const status = timeTracker.getCurrentStatus();
        sendResponse({ success: true, data: status });
        break;

      case 'getTodayStats':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const entries = await storageManager.getTimeEntriesByDateRange(today, tomorrow);
        sendResponse({ success: true, data: entries });
        break;

      case 'blockSite':
        await blocker.blockSite(message.domain, message.options);
        sendResponse({ success: true });
        break;

      case 'unblockSite':
        await blocker.unblockSite(message.domain);
        sendResponse({ success: true });
        break;

      case 'temporaryUnblock':
        blocker.temporaryUnblock(message.domain, message.minutes);
        sendResponse({ success: true });
        break;

      case 'startFocusSession':
        const session = await startFocusSession(message.duration);
        sendResponse({ success: true, data: session });
        break;

      case 'endFocusSession':
        await endFocusSession(false);
        sendResponse({ success: true });
        break;

      case 'getFocusSession':
        sendResponse({ success: true, data: focusSession });
        break;

      case 'updateCategory':
        await timeTracker.updateCustomCategories(message.categories);
        sendResponse({ success: true });
        break;

      case 'getSettings':
        const settings = await storageManager.getAllSettings();
        sendResponse({ success: true, data: settings });
        break;

      case 'saveSetting':
        await storageManager.setSetting(message.key, message.value);
        sendResponse({ success: true });
        break;

      case 'exportData':
        const data = await storageManager.exportAllData();
        sendResponse({ success: true, data });
        break;

      case 'importData':
        await storageManager.importData(message.data);
        sendResponse({ success: true });
        break;

      case 'enableNuclearMode':
        await blocker.enableNuclearMode();
        sendResponse({ success: true });
        break;

      case 'disableNuclearMode':
        await blocker.disableNuclearMode();
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('FocusTrack AI installed');
  init();
});

// Initialize on startup
init();
