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
        expiration: {
          maxEntries: 50,
        },
      },
    },
  ],
};
