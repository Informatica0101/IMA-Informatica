/**
 * Service Worker v8.0 - Offline-First Engine
 * ES5 Compliance Mandatory for maximum compatibility.
 */

var CACHE_NAME = 'ngca-app-v8.0';
var ASSETS = [
  './',
  './index.html',
  './student-dashboard.html',
  './teacher-dashboard.html',
  './dashboard-direccion.html',
  './dashboard-contabilidad.html',
  './dashboard-recursos-humanos.html',
  './dashboard-tienda.html',
  './dashboard-cafeteria.html',
  './politica-de-privacidad.html',
  './politica-de-uso.html',
  './politica-financiera.html',
  './css/style.css',
  './js/config.js',
  './js/api.js',
  './js/persistence.js',
  './js/ui-common.js',
  './js/index-ui.js',
  './js/student.js',
  './js/teacher.js',
  './js/accounting.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Pre-caching critical assets');
        return cache.addAll(ASSETS);
      })
      .then(function() {
        return self.skipWaiting();
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
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
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
