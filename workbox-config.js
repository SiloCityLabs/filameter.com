module.exports = {
  globDirectory: "out",
  globPatterns: [
    "**/*.{js,css,png}",
    "index.html",
    "settings.html",
    "spools.html",
    "manage-filament.html", // Ensure this is included
    "offline.html", // Ensure this is included
  ],
  swSrc: "public/sw-template.js",
  swDest: "public/sw.js",
};
