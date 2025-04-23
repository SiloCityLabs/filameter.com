/**
 * Capitalizes the first letter of each word in a string.
 *
 * @param {string} value The input string.
 * @param {string}  delimiter The delimiter used to split the string into words (default: "-").
 *
 * @returns {string}  The string with the first letter of each word capitalized.
 */
export function capitalizeFirstLetter(
  value: string,
  delimiter: string = "-"
): string {
  if (!value) return ""; // If the input is empty, return an empty string.
  return value
    .split(delimiter) // Split the string into an array of words using the delimiter.
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word.
    .join(" "); // Join the words back into a string, separated by spaces.
}
