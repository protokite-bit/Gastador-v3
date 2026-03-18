// ================================
// Gastador Offline Service Worker
// Cache-first strategy for GitHub Pages + APK
// ================================

const CACHE_NAME = 'gastador-offline-v1';

// IMPORTANT:
// Use RELATIVE paths so this works on GitHub Pages subpaths
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',

  // App icons
  './icons/icon-48.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ----------------
// Install event
// ----------------
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ----------------
// Activate event
// ----------------
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ----------------
// Fetch event (offline-first)
// ----------------
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Serve from cache if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise try network
      return fetch(event.request).catch(() => {
        // If offline and request fails, load app shell
        return caches.match('./index.html');
      });
    })
  );
});
