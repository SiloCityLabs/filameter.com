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
  runtimeCaching: [
    {
      // Match /manage-filament and /manage-filament?id=[uuid]
      urlPattern: /^\/manage-filament(\?.*)?$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "manage-filament-cache",
        plugins: [
          {
            fetchDidFail: async ({ request }) => {
              console.error("Fetch failed for:", request.url);

              // Serve the cached /manage-filament.html for any /manage-filament request
              const cachedResponse = await caches.match(
                "/manage-filament.html"
              );
              if (cachedResponse) {
                console.log("Serving cached response for:", request.url);
                return cachedResponse;
              }

              // Serve the offline fallback page for all other requests
              return caches.match("/offline.html");
            },
          },
        ],
      },
    },
    {
      // Fallback for all other requests
      urlPattern: /.*/, // Match all other requests
      handler: "NetworkOnly",
      options: {
        plugins: [
          {
            fetchDidFail: async ({ request }) => {
              console.error("Fetch failed for:", request.url);
              return caches.match("/offline.html");
            },
          },
        ],
      },
    },
  ],
};
