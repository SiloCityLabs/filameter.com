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
      urlPattern: /^.*\/manage-filament(\?.*)?$/, // Improved regex
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
  ],
};
