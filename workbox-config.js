module.exports = {
  globDirectory: "out",
  globPatterns: [
    "**/*.{js,css,png}",
    "index.html",
    "settings.html",
    "spools.html",
  ],
  swDest: "public/sw.js",
  runtimeCaching: [
    {
      urlPattern: /^.*\/manage-filament(\?.*)?$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "manage-filament-cache",
        expiration: {
          maxEntries: 50,
        },
      },
    },
  ],
};
