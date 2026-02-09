const CACHE_NAME = 'informatic-app-v7';
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
    './index.html?v=7',
    './login.html?v=7',
    './register.html?v=7',
    './student-dashboard.html?v=7',
    './teacher-dashboard.html?v=7',
    './exam.html?v=7',
    './results.html?v=7',
    './pseudocode.html?v=7',
    './css/style.css?v=7',
    './js/ui-common.js?v=7',
    './js/data.js?v=7',
    './js/index-ui.js?v=7',
    './js/api.js?v=7',
    './js/auth.js?v=7',
    './js/config.js?v=7',
    './js/student.js?v=7',
    './js/teacher.js?v=7',
    './js/exam.js?v=7',
    './js/results.js?v=7',
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

// Estrategia: Network First con fallback a Cache y Timeout
// Esto asegura que si hay internet, siempre se bajen los cambios más recientes.
// Se añade un timeout para que si la red es muy lenta, se use el cache rápidamente.
self.addEventListener('fetch', (event) => {
    // Solo cachear peticiones GET
    if (event.request.method !== 'GET') return;

    // Omitir cache para llamadas a la API de Google Scripts (POST y GET de datos)
    if (event.request.url.includes('script.google.com')) {
        return event.respondWith(fetch(event.request));
    }

    const fetchRequest = fetch(event.request).then((response) => {
        // Si la respuesta es válida, clonarla y guardarla en cache
        if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });
        }
        return response;
    });

    const cacheFallback = caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
        }
        return null;
    });

    // Implementar un timeout de 3 segundos para la red
    const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve(null), 3000);
    });

    event.respondWith(
        Promise.race([fetchRequest, timeoutPromise]).then((winner) => {
            if (winner) return winner;
            // Si el timeout gana o la red falla, intentar cache
            return cacheFallback;
        }).catch(() => {
            // Si fetchRequest falla por red, intentar cache
            return cacheFallback;
        })
    );
});
