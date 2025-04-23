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
  const result = {};
  let keyCounter = 0;

  // Iterate through each input object
  objects.forEach((obj) => {
    // Iterate through each key in the current object
    Object.keys(obj).forEach((key) => {
      result[keyCounter] = obj[key]; // Assign the value to the new key
      keyCounter++; // Increment the key counter
    });
  });
  return result; // Return the merged and rekeyed object
}
