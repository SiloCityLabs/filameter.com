import { mergeObjectsWithRekey } from "@/helpers/_silabs/mergeObjectsWithRekey";

describe("mergeObjectsWithRekey", () => {
  it("should merge multiple objects with rekeyed properties", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { c: 3, d: 4 };
    const obj3 = { e: 5 };
    const expected = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 };
    const result = mergeObjectsWithRekey(obj1, obj2, obj3);
    expect(result).toEqual(expected);
  });

  it("should handle merging with empty objects", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = {};
    const expected = { 0: 1, 1: 2 };
    const result = mergeObjectsWithRekey(obj1, obj2);
    expect(result).toEqual(expected);
  });

  it("should handle multiple empty objects", () => {
    const obj1 = {};
    const obj2 = {};
    const expected = {};
    const result = mergeObjectsWithRekey(obj1, obj2);
    expect(result).toEqual(expected);
  });

  it("should handle merging objects with different property names and values", () => {
    const obj1 = { x: "hello", y: true };
    const obj2 = { z: 10, w: [1, 2, 3] };
    const expected = { 0: "hello", 1: true, 2: 10, 3: [1, 2, 3] };
    const result = mergeObjectsWithRekey(obj1, obj2);
    expect(result).toEqual(expected);
  });

  it("should correctly renumber keys", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { c: 3, d: 4 };
    const obj3 = { e: 5, f: 6, g: 7 };
    const result = mergeObjectsWithRekey(obj1, obj2, obj3);
    expect(Object.keys(result).map(Number)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("should handle single object", () => {
    const obj1 = { a: 1, b: 2, c: 3 };
    const expected = { 0: 1, 1: 2, 2: 3 };
    const result = mergeObjectsWithRekey(obj1);
    expect(result).toEqual(expected);
  });
});
