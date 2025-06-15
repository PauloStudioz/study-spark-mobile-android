
self.addEventListener('install', (event) => {
  // Precache root and manifest
  event.waitUntil(
    caches.open('studymate-static-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.webmanifest'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.filter((c) => c !== 'studymate-static-v1').map((c) => caches.delete(c))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((response) =>
      response ||
      fetch(event.request).then((resp) => {
        return resp;
      }).catch(() => {
        return caches.match('/');
      })
    )
  );
});
