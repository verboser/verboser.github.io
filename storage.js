class Storage {
  constructor() {
    this.STAMPS_KEY = 'stamps';
  }

  getCollectedStamps() {
    try {
      const stamps = localStorage.getItem(this.STAMPS_KEY);
      return new Set(JSON.parse(stamps || '[]'));
    } catch (error) {
      console.warn('Failed to load stamps from localStorage:', error);
      return new Set();
    }
  }

  saveCollectedStamps(collected) {
    try {
      localStorage.setItem(this.STAMPS_KEY, JSON.stringify([...collected]));
      return true;
    } catch (error) {
      console.warn('Failed to save stamps to localStorage:', error);
      return false;
    }
  }

  addStamp(stampId) {
    const collected = this.getCollectedStamps();
    if (collected.has(stampId)) {
      return false;
    }
    
    collected.add(stampId);
    return this.saveCollectedStamps(collected);
  }

  removeStamp(stampId) {
    const collected = this.getCollectedStamps();
    if (!collected.has(stampId)) {
      return false;
    }
    
    collected.delete(stampId);
    return this.saveCollectedStamps(collected);
  }

  clearAllStamps() {
    try {
      localStorage.removeItem(this.STAMPS_KEY);
      return true;
    } catch (error) {
      console.warn('Failed to clear stamps from localStorage:', error);
      return false;
    }
  }

  hasStamp(stampId) {
    return this.getCollectedStamps().has(stampId);
  }
}

window.Storage = Storage;