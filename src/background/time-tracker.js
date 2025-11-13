// Time Tracker - Core tracking engine
import { getCategoryForUrl, getDomain } from '../utils/categories.js';

class TimeTracker {
  constructor(storageManager) {
    this.storage = storageManager;
    this.currentTab = null;
    this.currentSessionStart = null;
    this.isIdle = false;
    this.isPaused = false;
    this.customCategories = {};
    this.excludedDomains = new Set();
  }

  /**
   * Initialize the time tracker
   */
  async init() {
    // Load custom categories from storage
    this.customCategories = await this.storage.getSetting('customCategories', {});
    this.excludedDomains = new Set(
      await this.storage.getSetting('excludedDomains', [])
    );

    // Set up idle detection (5 minutes default)
    const idleTimeout = await this.storage.getSetting('idleTimeout', 300);
    chrome.idle.setDetectionInterval(idleTimeout);

    // Listen to idle state changes
    chrome.idle.onStateChanged.addListener((state) => {
      if (state === 'idle' || state === 'locked') {
        this.handleIdleStart();
      } else if (state === 'active') {
        this.handleIdleEnd();
      }
    });

    // Listen to tab activation
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.handleTabChange(activeInfo.tabId);
    });

    // Listen to tab updates (URL changes)
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.url && tab.active) {
        this.handleTabChange(tabId);
      }
    });

    // Listen to window focus changes
    chrome.windows.onFocusChanged.addListener((windowId) => {
      if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // Browser lost focus
        this.handleWindowBlur();
      } else {
        // Browser gained focus
        this.handleWindowFocus(windowId);
      }
    });

    // Set up periodic save alarm (every 30 seconds)
    chrome.alarms.create('saveTracking', { periodInMinutes: 0.5 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'saveTracking') {
        this.saveCurrentSession();
      }
    });

    // Start tracking current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      this.startTracking(tabs[0]);
    }

    console.log('TimeTracker initialized');
  }

  /**
   * Handle tab change
   */
  async handleTabChange(tabId) {
    try {
      const tab = await chrome.tabs.get(tabId);

      // Save current session before switching
      await this.saveCurrentSession();

      // Start tracking new tab
      if (tab.active) {
        this.startTracking(tab);
      }
    } catch (error) {
      console.error('Error handling tab change:', error);
    }
  }

  /**
   * Handle window blur (browser lost focus)
   */
  handleWindowBlur() {
    this.saveCurrentSession();
    this.currentTab = null;
    this.currentSessionStart = null;
  }

  /**
   * Handle window focus
   */
  async handleWindowFocus(windowId) {
    try {
      const tabs = await chrome.tabs.query({ active: true, windowId });
      if (tabs.length > 0) {
        this.startTracking(tabs[0]);
      }
    } catch (error) {
      console.error('Error handling window focus:', error);
    }
  }

  /**
   * Handle idle start
   */
  handleIdleStart() {
    console.log('User went idle');
    this.saveCurrentSession();
    this.isIdle = true;
  }

  /**
   * Handle idle end
   */
  async handleIdleEnd() {
    console.log('User became active');
    this.isIdle = false;

    // Resume tracking current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      this.startTracking(tabs[0]);
    }
  }

  /**
   * Start tracking a tab
   */
  startTracking(tab) {
    // Don't track if paused or idle
    if (this.isPaused || this.isIdle) {
      return;
    }

    // Don't track chrome:// pages or extension pages
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }

    const domain = getDomain(tab.url);

    // Don't track excluded domains
    if (this.excludedDomains.has(domain)) {
      return;
    }

    // Don't track incognito if disabled
    if (tab.incognito) {
      this.storage.getSetting('trackIncognito', false).then((trackIncognito) => {
        if (!trackIncognito) {
          return;
        }
      });
    }

    this.currentTab = {
      url: tab.url,
      domain,
      title: tab.title,
      category: getCategoryForUrl(tab.url, this.customCategories)
    };

    this.currentSessionStart = Date.now();

    console.log('Started tracking:', domain);
  }

  /**
   * Save current tracking session
   */
  async saveCurrentSession() {
    if (!this.currentTab || !this.currentSessionStart) {
      return;
    }

    const now = Date.now();
    const duration = Math.floor((now - this.currentSessionStart) / 1000); // Convert to seconds

    // Only save if duration is at least 1 second
    if (duration < 1) {
      return;
    }

    const entry = {
      url: this.currentTab.url,
      domain: this.currentTab.domain,
      title: this.currentTab.title,
      category: this.currentTab.category,
      duration,
      timestamp: this.currentSessionStart
    };

    try {
      await this.storage.addTimeEntry(entry);
      console.log(`Saved ${duration}s for ${this.currentTab.domain}`);

      // Reset session start for continuous tracking
      this.currentSessionStart = now;
    } catch (error) {
      console.error('Error saving time entry:', error);
    }
  }

  /**
   * Pause tracking
   */
  pause() {
    this.saveCurrentSession();
    this.isPaused = true;
    this.currentTab = null;
    this.currentSessionStart = null;
    console.log('Tracking paused');
  }

  /**
   * Resume tracking
   */
  async resume() {
    this.isPaused = false;
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      this.startTracking(tabs[0]);
    }
    console.log('Tracking resumed');
  }

  /**
   * Update custom categories
   */
  async updateCustomCategories(categories) {
    this.customCategories = categories;
    await this.storage.setSetting('customCategories', categories);
  }

  /**
   * Add domain to exclusion list
   */
  async excludeDomain(domain) {
    this.excludedDomains.add(domain);
    await this.storage.setSetting(
      'excludedDomains',
      Array.from(this.excludedDomains)
    );
  }

  /**
   * Remove domain from exclusion list
   */
  async includeDomain(domain) {
    this.excludedDomains.delete(domain);
    await this.storage.setSetting(
      'excludedDomains',
      Array.from(this.excludedDomains)
    );
  }

  /**
   * Get current tracking status
   */
  getCurrentStatus() {
    if (this.isPaused) {
      return { status: 'paused' };
    }

    if (this.isIdle) {
      return { status: 'idle' };
    }

    if (!this.currentTab) {
      return { status: 'not-tracking' };
    }

    const currentDuration = this.currentSessionStart
      ? Math.floor((Date.now() - this.currentSessionStart) / 1000)
      : 0;

    return {
      status: 'tracking',
      currentTab: this.currentTab,
      currentDuration
    };
  }
}

export default TimeTracker;
