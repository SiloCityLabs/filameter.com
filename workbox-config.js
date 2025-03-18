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
      // Match /manage-filament
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
            fetchDidFail: async ({ request }) => {
              console.error("Fetch failed for:", request.url);
              const cachedResponse = await caches.match(
                "/manage-filament.html"
              );
              if (cachedResponse) {
                console.log("Serving cached response for:", request.url);
                return cachedResponse;
              }
              return caches.match("/offline.html");
            },
          },
        ],
      },
    },
  ],
};
