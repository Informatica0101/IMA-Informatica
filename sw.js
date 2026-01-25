const CACHE_NAME = 'informatic-app-v2';
const ASSETS = [
    './',
    './index.html',
    './login.html',
    './register.html',
    './student-dashboard.html',
    './teacher-dashboard.html',
    './exam.html',
    './results.html',
    './pseudocode.html',
    './css/style.css',
    './js/ui-common.js',
    './js/data.js',
    './js/index-ui.js',
    './js/api.js',
    './js/auth.js',
    './js/config.js',
    './js/student.js',
    './js/teacher.js',
    './js/exam.js',
    './js/results.js',
    './IMA-Logo.png',
    './imagenes/logo.png',
    './imagenes/bandera-de-honduras.png',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).catch(err => console.log('SW Cache error:', err))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(() => {
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});
