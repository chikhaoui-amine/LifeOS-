
export const storage = {
  /**
   * Save data to localStorage
   */
  save: async (key: string, value: any): Promise<boolean> => {
    try {
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(key, jsonValue);
      return true;
    } catch (e) {
      console.error(`Error saving data [${key}]:`, e);
      return false;
    }
  },

  /**
   * Load data from localStorage
   */
  load: async <T>(key: string): Promise<T | null> => {
    try {
      const jsonValue = localStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error(`Error loading data [${key}]:`, e);
      return null;
    }
  },

  /**
   * Remove data from localStorage
   */
  remove: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing data [${key}]:`, e);
    }
  },

  /**
   * Clear all data
   */
  clearAll: async (): Promise<void> => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  },

  /**
   * Helper to identify mobile environment
   */
  isCapacitor: (): boolean => {
    return (window as any).Capacitor !== undefined;
  }
};
