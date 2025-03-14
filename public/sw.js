const CACHE_VERSION = "v1";
const PAGES_CACHE = `pages-${CACHE_VERSION}`;
const STATIC_ASSETS_CACHE = `static-assets-${CACHE_VERSION}`;
const GOOGLE_FONTS_STYLESHEETS_CACHE = `google-fonts-stylesheets-${CACHE_VERSION}`;
const GOOGLE_FONTS_WEBFONTS_CACHE = `google-fonts-webfonts-${CACHE_VERSION}`;

define(["./workbox-e43f5367"], function (workbox) {
  "use strict";

  importScripts();
  self.skipWaiting();
  workbox.clientsClaim();

  // Cache HTML pages
  workbox.registerRoute(
    ({ request }) => request.destination === "document",
    new workbox.CacheFirst({
      cacheName: PAGES_CACHE,
      plugins: [
        new workbox.ExpirationPlugin({
          maxEntries: 10,
        }),
      ],
    })
  );

  // Cache static assets (JS, CSS, images, fonts)
  workbox.registerRoute(
    /\.(?:js|css|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/, // Match common static file extensions
    new workbox.CacheFirst({
      cacheName: STATIC_ASSETS_CACHE,
      plugins: [
        new workbox.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // Cache any external fonts from google fonts.
  workbox.registerRoute(
    /^https:\/\/fonts\.googleapis\.com/,
    new workbox.StaleWhileRevalidate({
      cacheName: GOOGLE_FONTS_STYLESHEETS_CACHE,
    })
  );

  workbox.registerRoute(
    /^https:\/\/fonts\.gstatic\.com/,
    new workbox.CacheFirst({
      cacheName: GOOGLE_FONTS_WEBFONTS_CACHE,
      plugins: [
        new workbox.CacheableResponsePlugin({
          statuses: ["0", 200],
        }),
        new workbox.ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365,
          maxEntries: 30,
        }),
      ],
    })
  );
});
