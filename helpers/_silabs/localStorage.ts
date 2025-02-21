export function setLocalStorage(key: string, value: any): void {
  if (typeof window !== "undefined") {
    // Check if running in the browser
    if (typeof value === "object") {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
  }
}

export function getLocalStorage(key: string): any {
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
