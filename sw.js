// CHANGE THIS VERSION NUMBER EVERY TIME YOU PUSH AN UPDATE
const CACHE_NAME = 'gate-tracker-cache-v4'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
  // Add any local icons or assets here if you host them
];

// Install Event - Caches the files
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forces the waiting service worker to become the active service worker
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event - Cleans up old caches when the version number changes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all pages immediately
  );
});

// Fetch Event - Network First, falling back to Cache strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If network request succeeds, clone it and put it in the cache
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // If network fails (offline), return the cached version
        return caches.match(event.request);
      })
  );
});
