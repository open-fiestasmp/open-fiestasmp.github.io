// FiestaSMP Service Worker - Ultra-lightweight Offline & Low-Bandwidth Acceleration
const CACHE_NAME = 'fiestasmp-v20261109';
const CORE_PRECACHE = [
  '/',
  '/index.html',
  '/server-icon.webp',
  '/assets/css/fiesta.min.css?v=20261109',
  '/assets/js/mobile-nav.min.js?v=20261109',
  '/assets/img/server_image_540.webp'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_PRECACHE).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests and external APIs (MC status, Google Calendar, Discord)
  if (req.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // HTML Navigation: Network-First with Cache fallback
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return res;
      }).catch(() => {
        return caches.match(req).then((cached) => cached || caches.match('/index.html'));
      })
    );
    return;
  }

  // Static Assets (CSS, JS, WebP, JPG, PNG, SVG): Cache-First
  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.webp') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        });
      })
    );
  }
});
