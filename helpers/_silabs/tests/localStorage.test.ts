import {
  setLocalStorage,
  getLocalStorage,
} from "@/helpers/_silabs/localStorage";

describe("localStorage", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("should set a string value in localStorage", () => {
    setLocalStorage("stringKey", "stringValue");
    if (typeof window !== "undefined") {
      expect(localStorage.getItem("stringKey")).toBe("stringValue");
    }
  });

  it("should set an object value in localStorage", () => {
    const obj = { a: 1, b: "two" };
    setLocalStorage("objectKey", obj);
    if (typeof window !== "undefined") {
      expect(localStorage.getItem("objectKey")).toBe(JSON.stringify(obj));
    }
  });

  it("should get a string value from localStorage", () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("stringKey", "stringValue");
    }
    const value = getLocalStorage("stringKey");
    expect(value).toBe("stringValue");
  });

  it("should get an object value from localStorage", () => {
    const obj = { a: 1, b: "two" };
    if (typeof window !== "undefined") {
      localStorage.setItem("objectKey", JSON.stringify(obj));
    }
    const value = getLocalStorage("objectKey");
    expect(value).toEqual(obj);
  });

  it("should return null for a non-existent key", () => {
    const value = getLocalStorage("nonExistentKey");
    expect(value).toBeNull();
  });

  it("should handle setLocalStorage in a non-browser environment", () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    expect(() => setLocalStorage("stringKey", "stringValue")).not.toThrow();
    expect(() => setLocalStorage("objectKey", { a: 1 })).not.toThrow();

    global.window = originalWindow;
  });

  it("should handle getLocalStorage in a non-browser environment", () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    const stringValue = getLocalStorage("stringKey");
    const objectValue = getLocalStorage("objectKey");
    expect(stringValue).toBeNull();
    expect(objectValue).toBeNull();

    global.window = originalWindow;
  });
});
