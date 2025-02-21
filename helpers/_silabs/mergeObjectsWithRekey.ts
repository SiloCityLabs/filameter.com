export function mergeObjectsWithRekey(...objects) {
  const result = {};
  let keyCounter = 0;

  objects.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      result[keyCounter] = obj[key];
      keyCounter++;
    });
  });

  return result;
}
