/**
 * Stores a value in the browser's local storage.
 *
 * @param {string} key - The key under which the value will be stored.
 * @param {object | string} value - The value to be stored. It can be any type, but objects will be JSON stringified.
 */
export function setLocalStorage(key: string, value: object | string): void {
  if (typeof window !== "undefined") {
    // Check if running in the browser
    if (typeof value === "object") {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
  }
}

/**
 * Retrieves a value from the browser's local storage.
 *
 * @param {string} key - The key of the value to retrieve.
 *
 * @returns {string | object | null} The stored value, either as a parsed object (if it was stored as JSON),
 *          a string (if stored as a string), or null if the key does not exist.
 *          Returns null if not running in a browser environment.
 */
export function getLocalStorage(key: string): string | object | null {
  if (typeof window !== "undefined") {
    // Check if running in the browser
    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item);
      } catch (e) {
        return item;
      }
    }
  }
  return null;
}
