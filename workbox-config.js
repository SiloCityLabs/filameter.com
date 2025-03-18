const loggingPlugin = {
  cacheDidUpdate: async ({ cacheName, request, response }) => {
    if (cacheName === "manage-filament-cache") {
      caches.open(cacheName).then((cache) => {
        cache.keys().then((keys) => {
          console.log("SW: Cache Keys:", keys);
        });
      });
    }
    return response;
  },
};

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
        plugins: [
          loggingPlugin, // Apply the logging plugin here (ExpirationPlugin removed)
        ],
      },
    },
  ],
};
