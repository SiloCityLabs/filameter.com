/**
 * Given an object, returns a random value from the object.
 *
 * @param {object} item The object to get a random value from.
 *
 * @returns {any} A random value from the object.
 */
export function randomListItem(item: object): any {
  // Get all the values of the object
  const values = Object.values(item);

  // Get a random index
  const randomIndex = Math.floor(Math.random() * values.length);

  // Get the value at the random index
  const randomValue = values[randomIndex];

  return randomValue;
}
