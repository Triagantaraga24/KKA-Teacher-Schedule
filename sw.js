/* KKA Teacher Schedule — performance-first static PWA cache. */
const CACHE_PREFIX = 'kka-teacher-schedule-';
const CACHE_VERSION = 'v1.8.0';
const APP_CACHE = CACHE_PREFIX + CACHE_VERSION;

// Small critical shell. Feature modules are cached only when requested.
const CORE_ASSETS = [
  './', './index.html', './offline.html', './manifest.webmanifest',
  './css/app.css', './js/app.js',
  './js/core/config.js', './js/core/state.js', './js/core/router.js', './js/core/i18n.js',
  './js/database/indexed-db.js', './js/database/storage.js', './js/database/migrations.js',
  './js/modules/schedule-manager.js',
  './js/modules/dashboard.js', './js/modules/daily-verification.js', './js/components/views.js',
  './js/utils/helpers.js', './js/utils/date-utils.js', './js/utils/validators.js',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    await cache.addAll(CORE_ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith(CACHE_PREFIX) && key !== APP_CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    // SheetJS is still lazy-loaded, but once imported it can be reused offline.
    if (request.destination === 'script' && /cdn\.sheetjs\.com$/.test(url.hostname)) {
      event.respondWith((async () => {
        const cache = await caches.open(APP_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok || response.type === 'opaque') await cache.put(request, response.clone());
          return response;
        } catch {
          return cached || new Response('SheetJS belum tersedia offline. Buka Import Excel sekali saat online.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        }
      })());
    }
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(APP_CACHE);
    const cached = await cache.match(request);

    if (request.mode === 'navigate') {
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        return cached || await cache.match('./index.html') || await cache.match('./offline.html');
      }
    }

    if (cached) return cached;

    try {
      const response = await fetch(request);
      // Await the initial write so a route opened once is available offline.
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      return new Response('Offline: resource belum tersedia di cache.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});
