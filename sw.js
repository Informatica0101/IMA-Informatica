/**
 * Service Worker v7.5 - Offline-First Engine
 * ES5 Compliance Mandatory for maximum compatibility.
 */

var CACHE_NAME = 'informatic-app-v4.0';
var ASSETS = [
  './',
  './index.html',
  './login.html',
  './student-dashboard.html',
  './teacher-dashboard.html',
  './css/styles.css',
  './js/config.js',
  './js/api.js',
  './js/persistence.js',
  './js/ui-common.js',
  './js/index-ui.js',
  './js/student.js',
  './js/teacher.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Pre-caching critical assets');
        return cache.addAll(ASSETS);
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Ignorar peticiones de API (Google Scripts) y otras externas
  if (event.request.url.indexOf('script.google.com') !== -1 || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      var fetchPromise = fetch(event.request).then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          var responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(function() {
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
