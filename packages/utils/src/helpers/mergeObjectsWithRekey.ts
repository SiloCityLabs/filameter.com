/**
 * Merges multiple objects into a single object, rekeying the properties with incrementing numeric keys.
 *
 * @param {...any[]} objects - The objects to merge. Each object's properties will be added to the result.
 *
 * @returns {object} - A new object containing all the properties from the input objects, rekeyed numerically.
 *
 * @example
 * const obj1 = { a: 1, b: 2 };
 * const obj2 = { c: 3, d: 4 };
 * const merged = mergeObjectsWithRekey(obj1, obj2); // Returns: { 0: 1, 1: 2, 2: 3, 3: 4 }
 */
export function mergeObjectsWithRekey(...objects: any[]) {
  const result: { [key: string]: any } = {}; // Add index signature

  let keyCounter = 0;

  // Iterate through each input object
  objects.forEach((obj) => {
    // Iterate through each key in the current object
    Object.keys(obj).forEach((key) => {
      const value = obj[key as string];

      // Assign the value to the new key (keyCounter will be coerced to a string key like "0", "1")
      result[keyCounter] = value;

      keyCounter++; // Increment the key counter
    });
  });

  return result; // Return the merged and rekeyed object
}
