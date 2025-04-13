export function capitalizeFirstLetter(value: string, delimiter: string = "-") {
  if (!value) return "";
  return value
    .split(delimiter)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
