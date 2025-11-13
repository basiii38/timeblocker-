// Website Blocker - Block sites using declarativeNetRequest
import { getDomain } from '../utils/categories.js';

const BLOCK_PAGE_URL = chrome.runtime.getURL('blocked.html');

class Blocker {
  constructor(storageManager) {
    this.storage = storageManager;
    this.blockedSites = [];
    this.temporaryUnblocks = new Map(); // domain -> unblock expiry timestamp
    this.isNuclearMode = false;
    this.focusMode = false;
  }

  /**
   * Initialize the blocker
   */
  async init() {
    // Load blocked sites from storage
    this.blockedSites = await this.storage.getAllBlockedSites();

    // Load nuclear mode setting
    this.isNuclearMode = await this.storage.getSetting('nuclearMode', false);

    // Set up web request listener
    this.setupBlockingRules();

    // Set up alarm for checking scheduled blocks
    chrome.alarms.create('checkScheduledBlocks', { periodInMinutes: 1 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'checkScheduledBlocks') {
        this.checkScheduledBlocks();
      }
    });

    // Set up web navigation listener to redirect blocked pages
    chrome.webNavigation.onBeforeNavigate.addListener(
      (details) => this.handleNavigation(details),
      { url: [{ schemes: ['http', 'https'] }] }
    );

    console.log('Blocker initialized');
  }

  /**
   * Set up blocking rules using declarativeNetRequest
   */
  async setupBlockingRules() {
    const rules = [];
    let ruleId = 1;

    for (const site of this.blockedSites) {
      if (this.shouldBlockSite(site)) {
        const domains = this.getDomainVariations(site.domain);

        for (const domain of domains) {
          rules.push({
            id: ruleId++,
            priority: 1,
            action: {
              type: 'redirect',
              redirect: {
                url: `${BLOCK_PAGE_URL}?domain=${encodeURIComponent(site.domain)}&reason=${encodeURIComponent(site.blockType || 'blocked')}`
              }
            },
            condition: {
              urlFilter: `*://*.${domain}/*`,
              resourceTypes: ['main_frame']
            }
          });
        }
      }
    }

    // Update dynamic rules
    try {
      // Remove all existing rules
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const existingRuleIds = existingRules.map(rule => rule.id);

      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds,
        addRules: rules
      });

      console.log(`Updated blocking rules: ${rules.length} rules`);
    } catch (error) {
      console.error('Error updating blocking rules:', error);
    }
  }

  /**
   * Handle navigation attempt
   */
  handleNavigation(details) {
    if (details.frameId !== 0) {
      return; // Only handle main frame
    }

    const domain = getDomain(details.url);
    const blockedSite = this.getBlockedSite(domain);

    if (blockedSite && this.shouldBlockSite(blockedSite)) {
      // Redirect will be handled by declarativeNetRequest
      console.log(`Blocked navigation to: ${domain}`);
    }
  }

  /**
   * Check if a site should be blocked
   */
  shouldBlockSite(site) {
    const domain = site.domain;

    // Check temporary unblock
    if (this.temporaryUnblocks.has(domain)) {
      const expiryTime = this.temporaryUnblocks.get(domain);
      if (Date.now() < expiryTime) {
        return false; // Still within temporary unblock window
      } else {
        this.temporaryUnblocks.delete(domain);
      }
    }

    // Check nuclear mode (block all distracting sites)
    if (this.isNuclearMode && site.category === 'distracting') {
      return true;
    }

    // Check focus mode
    if (this.focusMode && site.category === 'distracting') {
      return true;
    }

    // Check block type
    if (site.blockType === 'always') {
      return true;
    }

    if (site.blockType === 'scheduled') {
      return this.isWithinSchedule(site.schedule);
    }

    if (site.blockType === 'timeLimit') {
      return this.hasExceededTimeLimit(site);
    }

    return false;
  }

  /**
   * Check if current time is within schedule
   */
  isWithinSchedule(schedule) {
    if (!schedule) return false;

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Check if today is in the schedule
    if (!schedule.days.includes(currentDay)) {
      return false;
    }

    // Parse start and end times (format: "HH:MM")
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    return currentTime >= startTime && currentTime < endTime;
  }

  /**
   * Check if time limit has been exceeded for today
   */
  async hasExceededTimeLimit(site) {
    if (!site.timeLimit) return false;

    // Get today's time entries for this domain
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entries = await this.storage.getTimeEntriesByDateRange(today, tomorrow);
    const domainEntries = entries.filter(e => e.domain === site.domain);

    // Calculate total time spent today
    const totalTime = domainEntries.reduce((sum, entry) => sum + entry.duration, 0);

    // Check if exceeded (timeLimit is in minutes, totalTime is in seconds)
    return totalTime >= site.timeLimit * 60;
  }

  /**
   * Get blocked site by domain
   */
  getBlockedSite(domain) {
    return this.blockedSites.find(site => site.domain === domain);
  }

  /**
   * Add a site to block list
   */
  async blockSite(domain, options = {}) {
    const blockedSite = {
      domain,
      blockType: options.blockType || 'always',
      schedule: options.schedule,
      timeLimit: options.timeLimit,
      category: options.category,
      addedAt: Date.now()
    };

    await this.storage.saveBlockedSite(blockedSite);
    this.blockedSites = await this.storage.getAllBlockedSites();

    // Update blocking rules
    await this.setupBlockingRules();

    console.log(`Blocked site: ${domain}`);
  }

  /**
   * Remove a site from block list
   */
  async unblockSite(domain) {
    await this.storage.deleteBlockedSite(domain);
    this.blockedSites = await this.storage.getAllBlockedSites();

    // Update blocking rules
    await this.setupBlockingRules();

    console.log(`Unblocked site: ${domain}`);
  }

  /**
   * Temporarily unblock a site (e.g., 5-minute break)
   */
  temporaryUnblock(domain, minutes = 5) {
    const expiryTime = Date.now() + minutes * 60 * 1000;
    this.temporaryUnblocks.set(domain, expiryTime);

    // Update blocking rules
    this.setupBlockingRules();

    console.log(`Temporarily unblocked ${domain} for ${minutes} minutes`);

    // Set alarm to re-enable block
    chrome.alarms.create(`reblock_${domain}`, { delayInMinutes: minutes });
  }

  /**
   * Enable nuclear mode (block all distracting sites)
   */
  async enableNuclearMode() {
    this.isNuclearMode = true;
    await this.storage.setSetting('nuclearMode', true);
    await this.setupBlockingRules();
    console.log('Nuclear mode enabled');
  }

  /**
   * Disable nuclear mode
   */
  async disableNuclearMode() {
    this.isNuclearMode = false;
    await this.storage.setSetting('nuclearMode', false);
    await this.setupBlockingRules();
    console.log('Nuclear mode disabled');
  }

  /**
   * Enable focus mode (for Pomodoro sessions)
   */
  async enableFocusMode() {
    this.focusMode = true;
    await this.setupBlockingRules();
    console.log('Focus mode enabled');
  }

  /**
   * Disable focus mode
   */
  async disableFocusMode() {
    this.focusMode = false;
    await this.setupBlockingRules();
    console.log('Focus mode disabled');
  }

  /**
   * Check scheduled blocks (called every minute)
   */
  async checkScheduledBlocks() {
    // Reload blocked sites to check for any changes
    this.blockedSites = await this.storage.getAllBlockedSites();

    // Update blocking rules based on current time
    await this.setupBlockingRules();
  }

  /**
   * Get domain variations (with and without www)
   */
  getDomainVariations(domain) {
    const variations = [domain];

    if (domain.startsWith('www.')) {
      variations.push(domain.substring(4));
    } else {
      variations.push(`www.${domain}`);
    }

    return variations;
  }

  /**
   * Get time saved today by blocking
   */
  async getTimeSavedToday() {
    // This is an estimate based on average time that would have been wasted
    const blockedAttempts = await this.storage.getSetting('blockedAttemptsToday', 0);

    // Assume each blocked attempt saved 5 minutes on average
    return blockedAttempts * 5;
  }

  /**
   * Increment blocked attempts counter
   */
  async incrementBlockedAttempts() {
    const count = await this.storage.getSetting('blockedAttemptsToday', 0);
    await this.storage.setSetting('blockedAttemptsToday', count + 1);
  }

  /**
   * Reset daily counters
   */
  async resetDailyCounters() {
    await this.storage.setSetting('blockedAttemptsToday', 0);
  }
}

export default Blocker;
