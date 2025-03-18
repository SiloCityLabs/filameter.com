module.exports = {
  globDirectory: "out",
  globPatterns: ["**/*.{js,css,html}"],
  swDest: "public/sw.js",
  runtimeCaching: [
    {
      urlPattern: ({ url }) => url.pathname.startsWith("/manage-filament"),
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
