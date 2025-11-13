// IndexedDB Storage Manager for unlimited data storage
// Stores time tracking data, settings, and user preferences

const DB_NAME = 'FocusTrackDB';
const DB_VERSION = 1;

// Object stores
const STORES = {
  TIME_ENTRIES: 'timeEntries',
  SETTINGS: 'settings',
  GOALS: 'goals',
  FOCUS_SESSIONS: 'focusSessions',
  BLOCKED_SITES: 'blockedSites'
};

class StorageManager {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize the database
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create time entries store
        if (!db.objectStoreNames.contains(STORES.TIME_ENTRIES)) {
          const timeStore = db.createObjectStore(STORES.TIME_ENTRIES, {
            keyPath: 'id',
            autoIncrement: true
          });
          timeStore.createIndex('timestamp', 'timestamp', { unique: false });
          timeStore.createIndex('domain', 'domain', { unique: false });
          timeStore.createIndex('category', 'category', { unique: false });
          timeStore.createIndex('date', 'date', { unique: false });
        }

        // Create settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        // Create goals store
        if (!db.objectStoreNames.contains(STORES.GOALS)) {
          db.createObjectStore(STORES.GOALS, { keyPath: 'id', autoIncrement: true });
        }

        // Create focus sessions store
        if (!db.objectStoreNames.contains(STORES.FOCUS_SESSIONS)) {
          const sessionStore = db.createObjectStore(STORES.FOCUS_SESSIONS, {
            keyPath: 'id',
            autoIncrement: true
          });
          sessionStore.createIndex('startTime', 'startTime', { unique: false });
          sessionStore.createIndex('date', 'date', { unique: false });
        }

        // Create blocked sites store
        if (!db.objectStoreNames.contains(STORES.BLOCKED_SITES)) {
          db.createObjectStore(STORES.BLOCKED_SITES, { keyPath: 'domain' });
        }
      };
    });
  }

  /**
   * Add a time entry
   * @param {Object} entry - Time tracking entry
   * @returns {Promise<number>} Entry ID
   */
  async addTimeEntry(entry) {
    const date = new Date(entry.timestamp);
    const dateString = date.toISOString().split('T')[0];

    const entryWithDate = {
      ...entry,
      date: dateString
    };

    return this._add(STORES.TIME_ENTRIES, entryWithDate);
  }

  /**
   * Get time entries by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Time entries
   */
  async getTimeEntriesByDateRange(startDate, endDate) {
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORES.TIME_ENTRIES, 'readonly');
      const store = transaction.objectStore(STORES.TIME_ENTRIES);
      const index = store.index('timestamp');
      const range = IDBKeyRange.bound(startTimestamp, endTimestamp);

      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all time entries for a specific date
   * @param {Date} date - Date
   * @returns {Promise<Array>} Time entries
   */
  async getTimeEntriesByDate(date) {
    const dateString = date.toISOString().split('T')[0];

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORES.TIME_ENTRIES, 'readonly');
      const store = transaction.objectStore(STORES.TIME_ENTRIES);
      const index = store.index('date');
      const request = index.getAll(dateString);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all time entries (WARNING: Can be large!)
   * @param {number} limit - Optional limit
   * @returns {Promise<Array>} Time entries
   */
  async getAllTimeEntries(limit = null) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORES.TIME_ENTRIES, 'readonly');
      const store = transaction.objectStore(STORES.TIME_ENTRIES);
      const request = limit ? store.getAll(null, limit) : store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete old entries (for data cleanup)
   * @param {Date} beforeDate - Delete entries before this date
   * @returns {Promise<number>} Number of deleted entries
   */
  async deleteEntriesBeforeDate(beforeDate) {
    const timestamp = beforeDate.getTime();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORES.TIME_ENTRIES, 'readwrite');
      const store = transaction.objectStore(STORES.TIME_ENTRIES);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(timestamp);

      const request = index.openCursor(range);
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          count++;
          cursor.continue();
        } else {
          resolve(count);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Set a setting value
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   * @returns {Promise<void>}
   */
  async setSetting(key, value) {
    return this._put(STORES.SETTINGS, { key, value });
  }

  /**
   * Get a setting value
   * @param {string} key - Setting key
   * @param {*} defaultValue - Default value if not found
   * @returns {Promise<*>} Setting value
   */
  async getSetting(key, defaultValue = null) {
    const setting = await this._get(STORES.SETTINGS, key);
    return setting ? setting.value : defaultValue;
  }

  /**
   * Get all settings
   * @returns {Promise<Object>} All settings as key-value pairs
   */
  async getAllSettings() {
    const settings = await this._getAll(STORES.SETTINGS);
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    return settingsObj;
  }

  /**
   * Add or update a goal
   * @param {Object} goal - Goal object
   * @returns {Promise<number>} Goal ID
   */
  async saveGoal(goal) {
    if (goal.id) {
      return this._put(STORES.GOALS, goal);
    } else {
      return this._add(STORES.GOALS, goal);
    }
  }

  /**
   * Get all goals
   * @returns {Promise<Array>} All goals
   */
  async getAllGoals() {
    return this._getAll(STORES.GOALS);
  }

  /**
   * Delete a goal
   * @param {number} id - Goal ID
   * @returns {Promise<void>}
   */
  async deleteGoal(id) {
    return this._delete(STORES.GOALS, id);
  }

  /**
   * Add a focus session
   * @param {Object} session - Focus session object
   * @returns {Promise<number>} Session ID
   */
  async addFocusSession(session) {
    const date = new Date(session.startTime);
    const dateString = date.toISOString().split('T')[0];

    const sessionWithDate = {
      ...session,
      date: dateString
    };

    return this._add(STORES.FOCUS_SESSIONS, sessionWithDate);
  }

  /**
   * Get focus sessions by date
   * @param {Date} date - Date
   * @returns {Promise<Array>} Focus sessions
   */
  async getFocusSessionsByDate(date) {
    const dateString = date.toISOString().split('T')[0];

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORES.FOCUS_SESSIONS, 'readonly');
      const store = transaction.objectStore(STORES.FOCUS_SESSIONS);
      const index = store.index('date');
      const request = index.getAll(dateString);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add or update a blocked site
   * @param {Object} blockedSite - Blocked site object
   * @returns {Promise<string>} Domain
   */
  async saveBlockedSite(blockedSite) {
    return this._put(STORES.BLOCKED_SITES, blockedSite);
  }

  /**
   * Get all blocked sites
   * @returns {Promise<Array>} All blocked sites
   */
  async getAllBlockedSites() {
    return this._getAll(STORES.BLOCKED_SITES);
  }

  /**
   * Get a blocked site
   * @param {string} domain - Domain
   * @returns {Promise<Object>} Blocked site object
   */
  async getBlockedSite(domain) {
    return this._get(STORES.BLOCKED_SITES, domain);
  }

  /**
   * Delete a blocked site
   * @param {string} domain - Domain
   * @returns {Promise<void>}
   */
  async deleteBlockedSite(domain) {
    return this._delete(STORES.BLOCKED_SITES, domain);
  }

  /**
   * Clear all data from a store
   * @param {string} storeName - Store name
   * @returns {Promise<void>}
   */
  async clearStore(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Export all data
   * @returns {Promise<Object>} All data
   */
  async exportAllData() {
    const data = {};

    for (const storeName of Object.values(STORES)) {
      data[storeName] = await this._getAll(storeName);
    }

    return data;
  }

  /**
   * Import data
   * @param {Object} data - Data to import
   * @returns {Promise<void>}
   */
  async importData(data) {
    for (const [storeName, items] of Object.entries(data)) {
      if (Object.values(STORES).includes(storeName)) {
        await this.clearStore(storeName);

        for (const item of items) {
          await this._add(storeName, item);
        }
      }
    }
  }

  // Private helper methods

  async _add(storeName, item) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async _put(storeName, item) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async _get(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async _getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async _delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Create singleton instance
const storageManager = new StorageManager();

export default storageManager;
export { STORES, StorageManager };
