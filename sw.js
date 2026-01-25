const CACHE_NAME = 'informatic-app-v3';
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

// Instalar y forzar activación inmediata
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).catch(err => console.log('SW Cache error:', err))
    );
});

// Limpiar caches antiguos y tomar control
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            clients.claim(),
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

// Estrategia: Network First con fallback a Cache
// Esto asegura que si hay internet, siempre se bajen los cambios más recientes.
self.addEventListener('fetch', (event) => {
    // Solo cachear peticiones GET
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si la respuesta es válida, clonarla y guardarla en cache
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si falla la red, intentar desde cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;

                    // Si no está en cache y es una navegación, devolver index.html
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});
