/* KKA Teacher Schedule service worker — static/PWA only. */
const CACHE_PREFIX = 'kka-teacher-schedule-';
const CACHE_VERSION = 'v1.1.0';
const APP_CACHE = CACHE_PREFIX + CACHE_VERSION;
const CORE_ASSETS = [
  './', './index.html', './offline.html', './manifest.webmanifest',
  './css/reset.css', './css/variables.css', './css/typography.css', './css/layout.css',
  './css/components.css', './css/dashboard.css', './css/calendar.css', './css/schedule.css', './css/responsive.css', './css/print.css',
  './js/app.js', './js/core/i18n.js', './js/modules/daily-verification.js', './js/core/config.js', './js/core/state.js', './js/core/event-bus.js', './js/core/router.js',
  './js/components/views.js', './js/components/event-form.js',
  './js/modules/dashboard.js', './js/modules/schedule.js', './js/modules/weekly.js', './js/modules/calendar.js',
  './js/modules/reminders.js', './js/modules/excel-import.js', './js/modules/excel-parser.js', './js/modules/history.js', './js/modules/settings.js',
  './js/modules/schedule-manager.js', './js/modules/calendar-export.js', './js/modules/notification-manager.js', './js/modules/reminder-manager.js', './js/modules/backup-manager.js',
  './js/database/indexed-db.js', './js/database/storage.js', './js/database/migrations.js',
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
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== APP_CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    // Allow the SheetJS CDN script to be reused offline after a successful online load.
    if (request.destination === 'script' && /cdn\.sheetjs\.com/.test(url.hostname)) {
      event.respondWith((async () => {
        const cache = await caches.open(APP_CACHE);
        try { const response = await fetch(request); if (response && (response.ok || response.type === 'opaque')) await cache.put(request, response.clone()); return response; }
        catch { const cached = await cache.match(request); if (cached) return cached; throw new Error('CDN resource unavailable offline'); }
      })());
    }
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(APP_CACHE);
    if (request.mode === 'navigate') {
      try { const response = await fetch(request); cache.put(request, response.clone()); return response; }
      catch { return (await cache.match(request)) || (await cache.match('./index.html')) || (await cache.match('./offline.html')); }
    }
    const cached = await cache.match(request);
    if (cached) { event.waitUntil(fetch(request).then(response => { if (response.ok) cache.put(request, response.clone()); }).catch(() => {})); return cached; }
    try { const response = await fetch(request); if (response.ok) cache.put(request, response.clone()); return response; }
    catch { return new Response('Offline: resource belum tersedia di cache.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
  })());
});
