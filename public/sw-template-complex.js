importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"
);

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// Cache HTML pages
workbox.routing.registerRoute(
  ({ request }) => request.destination === "document",
  new workbox.strategies.CacheFirst({
    cacheName: "pages-cache",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10,
      }),
    ],
  })
);

// Cache static assets (JS, CSS, images, fonts)
workbox.routing.registerRoute(
  /\.(?:js|css|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/,
  new workbox.strategies.CacheFirst({
    cacheName: "static-assets-cache",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache Google Fonts stylesheets
workbox.routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "google-fonts-stylesheets-cache",
  })
);

// Cache Google Fonts webfonts
workbox.routing.registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new workbox.strategies.CacheFirst({
    cacheName: "google-fonts-webfonts-cache",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: ["0", 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);
