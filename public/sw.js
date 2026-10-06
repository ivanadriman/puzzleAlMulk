const CACHE_NAME = 'puzzle-al-mulk-v2';
const AUDIO_CACHE = 'puzzle-al-mulk-audio-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './data/surahs.json',
  './data/surah-067.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== AUDIO_CACHE) {
            console.log('[SW] Deleting stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Audio files: Cache First with network fallback & auto-caching
  if (url.pathname.endsWith('.mp3') || url.hostname.includes('everyayah.com') || url.hostname.includes('qurancdn.com')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          throw err;
        }
      })
    );
    return;
  }

  // 2. Navigation / HTML Document: Network First with Cache Fallback
  // NEVER serve stale index.html when online, which causes 404s on hashed chunks!
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const respClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request).then((cached) => cached || caches.match('./index.html'));
        })
    );
    return;
  }

  // 3. Static App Assets (JS, CSS, JSON, Fonts, Images): Cache First, fallback to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (event.request.method === 'GET' && response.status === 200) {
            const respClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
