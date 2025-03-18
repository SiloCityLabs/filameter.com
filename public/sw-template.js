importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"
);

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
