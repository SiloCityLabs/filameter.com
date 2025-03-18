module.exports = {
  globDirectory: "out",
  globPatterns: [
    "**/*.{js,css,png}",
    "index.html",
    "settings.html",
    "spools.html",
    "manage-filament.html",
    "offline.html",
  ],
  swDest: "public/sw.js",
  runtimeCaching: [
    {
      // Match /manage-filament and /manage-filament?id=[uuid]
      urlPattern: ({ url }) => url.pathname.startsWith("/manage-filament"),
      handler: "NetworkFirst",
      options: {
        cacheName: "manage-filament-cache",
        plugins: [
          {
            requestWillFetch: async ({ request }) => {
              console.log("Fetching:", request.url);
              return request;
            },
          },
        ],
      },
    },
    {
      urlPattern: /.*/, // Match all other requests
      handler: "NetworkOnly",
      options: {
        plugins: [
          {
            fetchDidFail: async () => {
              return caches.match("/offline.html"); // Serve the fallback page
            },
          },
        ],
      },
    },
  ],
};
