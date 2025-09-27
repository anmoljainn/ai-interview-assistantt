// Helper functions for localStorage operations
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = (key) => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return undefined;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return undefined;
  }
};

export const clearLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};