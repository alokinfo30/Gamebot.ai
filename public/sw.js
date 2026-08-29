const CACHE_NAME = 'gamebot-v1-static';
const DYNAMIC_CACHE = 'gamebot-v1-dynamic';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// 1. Service Worker Install Phase - Precache Static Core Assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[GAMEBOT SW] Precaching core static assets for offline play...');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[GAMEBOT SW] Precache partial error (non-fatal):', err);
      });
    })
  );
});

// 2. Service Worker Activate Phase - Clean Stale Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE) {
            console.log('[GAMEBOT SW] Purging outdated cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Service Worker Fetch Strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests or WebSocket connections
  if (req.method !== 'GET' || url.protocol.startsWith('ws')) {
    return;
  }

  // A. Network First strategy for API Endpoints (/api/*)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(req, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(req).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline JSON fallback
            return new Response(
              JSON.stringify({
                offline: true,
                message: 'Operating in Offline Mode. Local AI Bots and offline engine active!',
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  // B. Cache First strategy for Static Assets (JS, CSS, HTML, Images, Fonts)
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Asynchronously update cache in background (Stale-While-Revalidate)
        fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(DYNAMIC_CACHE).then((cache) => cache.put(req, networkResponse));
            }
          })
          .catch(() => {/* Silent catch offline */});
        return cachedResponse;
      }

      // Fetch from network if not in cache
      return fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(req, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // If navigation request fails, return cached index.html SPA entry point
          if (req.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
          return new Response('Offline Content Unavailable', { status: 503, statusText: 'Offline' });
        });
    })
  );
});
