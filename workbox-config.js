const loggingPlugin = {
  fetchDidSucceed: async ({ request, response }) => {
    console.log("SW: Fetch succeeded:", request.url);
    return response;
  },
  fetchDidFail: async ({ request, error }) => {
    console.error("SW: Fetch failed:", request.url, error);
  },
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
  globPatterns: ["**/*.{js,css,html}", "!manage-filament.html"],
  swDest: "public/sw.js",
  runtimeCaching: [
    {
      urlPattern: /^.*\/manage-filament(\?.*)?$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "manage-filament-cache",
        plugins: [
          new (require("workbox-expiration").ExpirationPlugin)({
            maxEntries: 50,
          }),
          loggingPlugin, // Apply the logging plugin here
        ],
      },
    },
  ],
};
