self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('bible-app').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js',
        '/manifest.json',
        '/data/kjv.json',
        'https://fonts.googleapis.com/css2?family=PT+Sans+Narrow&display=swap'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
