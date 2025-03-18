importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"
);

// Precache all assets listed in the manifest
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// Cache dynamic routes for manage-filament?id=[uuid]
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith("/manage-filament"),
  new workbox.strategies.NetworkFirst({
    cacheName: "dynamic-pages",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50, // Limit the number of cached entries
      }),
    ],
  })
);

// Fallback to a default offline page for unmatched routes
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.mode === "navigate") {
    return caches.match("/offline.html"); // Ensure offline.html is precached
  }
  return Response.error();
});

// Ensure manage-filament.html is precached
workbox.precaching.precacheAndRoute([
  { url: "/manage-filament.html", revision: null },
  { url: "/offline.html", revision: null },
]);
