const CACHE_NAME = 'informatic-app-v4.0';
const ASSETS = [
  './',
  './index.html',
  './index.html?v=22',
  './login.html',
  './login.html?v=21',
  './register.html',
  './register.html?v=21',
  './forgot-password.html',
  './forgot-password.html?v=21',
  './reset-password.html',
  './reset-password.html?v=21',
  './student-dashboard.html',
  './student-dashboard.html?v=21',
  './teacher-dashboard.html',
  './teacher-dashboard.html?v=21',
  './exam.html',
  './exam.html?v=21',
  './results.html',
  './results.html?v=21',
  './pseudocode.html',
  './pseudocode.html?v=21',
  './css/style.css',
  './css/style.css?v=21',
  './js/data.js',
  './js/data.js?v=21',
  './js/auth.js',
  './js/auth.js?v=21',
  './js/ui-common.js',
  './js/ui-common.js?v=21',
  './js/student.js',
  './js/student.js?v=21',
  './js/teacher.js',
  './js/teacher.js?v=21',
  './js/exam.js',
  './js/exam.js?v=21',
  './js/results.js',
  './js/results.js?v=21',
  './js/config.js',
  './js/config.js?v=21',
  './js/api.js',
  './js/api.js?v=21',
  './js/games-adapter.js',
  './js/games-adapter.js?v=21',
  './js/perifericos_juego.js',
  './js/perifericos_juego.js?v=21',
  './js/webmaster_quiz_juego.js',
  './js/webmaster_quiz_juego.js?v=21',
  './imagenes/logo.png',
  './imagenes/bandera-de-honduras.png',
  './juegos/destreza_teclado.html',
  './juegos/perifericos.html',
  './juegos/webmaster_quiz.html',
  './II_BTP_A/Programacion/introduccion_programacion.html',
  './II_BTP_A/Programacion/clasificacion_etapas_algoritmos.html',
  './II_BTP_A/Programacion/estrategias_solucion_problemas.html',
  './II_BTP_A/Programacion/analisis_diseno_algoritmos.html',
  './II_BTP_A/Programacion/programacion_representacion.html',
  './III_BTP_A/introduccion_diseno_web.html',
  './III_BTP_A/terminologia_basica_html_css.html',
  './III_BTP_A/hipervinculos_imagenes.html',
  './III_BTP_A/listas_comentarios_html.html',
  './III_BTP_A/fuentes_color_fondo.html'
];

// Instalar el Service Worker y cachear los recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(ASSETS);
      })
  );
});

// Activar el Service Worker y eliminar cachés antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia: Stale-While-Revalidate para mayor velocidad y resiliencia offline (v4.0)
self.addEventListener('fetch', event => {
  // Omitir peticiones a APIs dinámicas de Google Apps Script (siempre red)
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  // Ignorar peticiones de Analytics/Tracking si las hubiera
  if (event.request.url.includes('analytics')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Si la respuesta es válida, actualizamos el caché en segundo plano
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
           // Si falla la red y no hay caché, podemos retornar un fallback opcional
           console.log("[SW] Fallo de red y sin caché para:", event.request.url);
        });

        // Retornamos el caché inmediatamente si existe, si no, esperamos a la red
        return cachedResponse || fetchPromise;
      });
    })
  );
});

async function fetchWithTimeout(request, timeout = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}
