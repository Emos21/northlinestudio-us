/* Northline Studio service worker.
   Network first for everything, cache as the offline fallback —
   visitors always get the latest design, and the PWA still works offline. */
const CACHE = 'northline-v8';
const PRECACHE = [
  './',
  'assets/css/style.css?v=15',
  'assets/js/main.js?v=5',
  'assets/img/logo.png',
  'assets/img/logo-white.png',
  'assets/img/icon-192.png',
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(PRECACHE); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      })
      .catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || (req.mode === 'navigate' ? caches.match('./') : Response.error());
        });
      })
  );
});
