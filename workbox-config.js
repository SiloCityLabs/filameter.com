module.exports = {
  globDirectory: "out",
  globPatterns: [
    "**/*.{js,css,png}",
    "index.html",
    "settings.html",
    "spools.html",
    "manage-filament.html", // Ensure this is included
    "offline.html",
  ],
  swDest: "public/sw.js",
};
