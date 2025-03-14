module.exports = {
  globDirectory: "out",
  globPatterns: [
    "**/*.{js,css,png,jpg,jpeg,svg,woff,woff2,html,ico,json,xml,txt}",
  ],
  swDest: "public/sw.js",
  globIgnores: [
    "../workbox-config.js",
    "_next/dynamic-css-manifest.json", // Exclude this file
  ],
};
