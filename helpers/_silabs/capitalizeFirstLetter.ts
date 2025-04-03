export function capitalizeFirstLetter(value: string, delimiter: string) {
   return value
      .split(delimiter)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
}