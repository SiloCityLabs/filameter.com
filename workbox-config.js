module.exports = {
  globDirectory: "out",
  globPatterns: [
    "**/*.{js,css,png}",
    "index.html",
    "settings.html",
    "spools.html",
    "manage-filament.html", // Pre-cached
    "offline.html",
  ],
  swDest: "public/sw.js",
  runtimeCaching: [
    {
      // Handle /manage-filament and /manage-filament?id=[uuid]
      urlPattern: ({ url }) => url.pathname.startsWith("/manage-filament"),
      handler: "NetworkFirst", // Try network first, fallback to cache
      options: {
        cacheName: "manage-filament-cache",
        plugins: [
          {
            fetchDidFail: async ({ request }) => {
              console.warn("Failed request:", request);
              console.warn("Fetch failed for:", request.url);

              // Serve the pre-cached /manage-filament.html for any /manage-filament request
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
              console.warn("Fetch failed for:", request.url);
              return caches.match("/offline.html");
            },
          },
        ],
      },
    },
  ],
};
