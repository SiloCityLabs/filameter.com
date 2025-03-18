importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"
);

console.log("Service Worker: Workbox loaded");

// Precache all assets listed in the manifest
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

console.log("Service Worker: Assets precached");

// Cache dynamic routes for manage-filament?id=[uuid]
workbox.routing.registerRoute(
  ({ url }) => {
    console.log("Service Worker: Checking route", url.pathname);
    return url.pathname.startsWith("/manage-filament");
  },
  new workbox.strategies.NetworkFirst({
    cacheName: "dynamic-pages",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50, // Limit the number of cached entries
      }),
    ],
  })
);

console.log("Service Worker: Route registered for manage-filament");

// Fallback to a default offline page for unmatched routes
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.mode === "navigate") {
    console.log("Service Worker: Fallback to offline.html");
    return caches.match("/offline.html"); // Ensure offline.html is precached
  }
  return Response.error();
});

console.log("Service Worker: Catch handler set");

// Ensure manage-filament.html is precached
workbox.precaching.precacheAndRoute([
  { url: "/manage-filament.html", revision: null },
  { url: "/offline.html", revision: null },
]);

console.log("Service Worker: manage-filament.html and offline.html precached");
