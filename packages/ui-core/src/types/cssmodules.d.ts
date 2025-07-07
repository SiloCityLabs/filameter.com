// This declaration tells TypeScript that any import ending in .module.css
// should be treated as a module that defaults exports an object where keys are strings
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Add similar declarations for other asset types if needed (e.g., images, fonts)
// declare module '*.svg' {
//   const content: any; // Or string if it's a data URL
//   export default content;
// }
