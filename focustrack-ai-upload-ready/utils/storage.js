// IndexedDB Storage Manager
const DB_NAME = 'FocusTrackDB';
const DB_VERSION = 1;

class StorageManager {
  constructor() {
    this.db = null;
  }

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

        if (!db.objectStoreNames.contains('timeEntries')) {
          const store = db.createObjectStore('timeEntries', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('domain', 'domain', { unique: false });
          store.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('blockedSites')) {
          db.createObjectStore('blockedSites', { keyPath: 'domain' });
        }

        if (!db.objectStoreNames.contains('focusSessions')) {
          const store = db.createObjectStore('focusSessions', { keyPath: 'id', autoIncrement: true });
          store.createIndex('date', 'date', { unique: false });
        }
      };
    });
  }

  async addTimeEntry(entry) {
    const date = new Date(entry.timestamp).toISOString().split('T')[0];
    return this._add('timeEntries', { ...entry, date });
  }

  async getTimeEntriesByDateRange(startDate, endDate) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('timeEntries', 'readonly');
      const store = transaction.objectStore('timeEntries');
      const index = store.index('timestamp');
      const range = IDBKeyRange.bound(startDate.getTime(), endDate.getTime());
      const request = index.getAll(range);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async setSetting(key, value) {
    return this._put('settings', { key, value });
  }

  async getSetting(key, defaultValue = null) {
    const setting = await this._get('settings', key);
    return setting ? setting.value : defaultValue;
  }

  async getAllBlockedSites() {
    return this._getAll('blockedSites');
  }

  async saveBlockedSite(site) {
    return this._put('blockedSites', site);
  }

  async deleteBlockedSite(domain) {
    return this._delete('blockedSites', domain);
  }

  async addFocusSession(session) {
    const date = new Date(session.startTime).toISOString().split('T')[0];
    return this._add('focusSessions', { ...session, date });
  }

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

const storageManager = new StorageManager();
export default storageManager;
