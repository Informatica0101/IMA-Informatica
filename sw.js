var CACHE_NAME = 'informatic-app-v7.5';
var ASSETS = [
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
  './js/config.js?v=22',
  './js/persistence.js',
  './js/persistence.js?v=22',
  './js/api.js',
  './js/api.js?v=22',
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
  './III_BTP_A/fuentes_color_fondo.html',
  './js/Banco_Preguntas/Decimo/Informatica/basico.json',
  './js/Banco_Preguntas/Decimo/Informatica/intermedio.json',
  './js/Banco_Preguntas/Decimo/Informatica/avanzado.json',
  './js/Banco_Preguntas/Undecimo/Informatica_Aplicada/basico.json',
  './js/Banco_Preguntas/Undecimo/Informatica_Aplicada/intermedio.json',
  './js/Banco_Preguntas/Undecimo/Informatica_Aplicada/avanzado.json',
  './js/Banco_Preguntas/Undecimo/Ofimatica/basico.json',
  './js/Banco_Preguntas/Undecimo/Ofimatica/intermedio.json',
  './js/Banco_Preguntas/Undecimo/Ofimatica/avanzado.json',
  './js/Banco_Preguntas/Undecimo/Analisis_Diseno/basico.json',
  './js/Banco_Preguntas/Undecimo/Analisis_Diseno/intermedio.json',
  './js/Banco_Preguntas/Undecimo/Analisis_Diseno/avanzado.json',
  './js/Banco_Preguntas/Undecimo/Programacion/basico.json',
  './js/Banco_Preguntas/Undecimo/Programacion/intermedio.json',
  './js/Banco_Preguntas/Undecimo/Programacion/avanzado.json',
  './js/Banco_Preguntas/Duodecimo/Programacion_2/basico.json',
  './js/Banco_Preguntas/Duodecimo/Programacion_2/intermedio.json',
  './js/Banco_Preguntas/Duodecimo/Programacion_2/avanzado.json',
  './js/Banco_Preguntas/Duodecimo/Programacion_Orientada_a_Objetos/basico.json',
  './js/Banco_Preguntas/Duodecimo/Programacion_Orientada_a_Objetos/intermedio.json',
  './js/Banco_Preguntas/Duodecimo/Programacion_Orientada_a_Objetos/avanzado.json',
  './js/Banco_Preguntas/Duodecimo/Diseno_Web/basico.json',
  './js/Banco_Preguntas/Duodecimo/Diseno_Web/intermedio.json',
  './js/Banco_Preguntas/Duodecimo/Diseno_Web/avanzado.json'
];

// Instalar el Service Worker y cachear los recursos
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache abierto');
        return cache.addAll(ASSETS);
      })
  );
});

// Activar el Service Worker y eliminar cachés antiguos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia: Stale-While-Revalidate optimizada (v7.5 ES5)
self.addEventListener('fetch', function(event) {
  // 1. Filtros de exclusión (siempre red)
  var url = event.request.url;
  if (url.indexOf('script.google.com') !== -1 || url.indexOf('analytics') !== -1) {
    return;
  }

  // 2. Manejo de peticiones GET (Caché compatible)
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      // Definimos la promesa de red para revalidación
      var networkFetch = fetch(event.request).then(function(networkResponse) {
        // Validar respuesta antes de cachear
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          var responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })["catch"](function(err) {
        console.log("[SW] Network revalidation failed:", url);
        // Si no hay caché y la red falla, devolvemos un estado seguro
        if (!cachedResponse) {
          return new Response('Contenido no disponible sin conexión.', {
            status: 404,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        }
      });

      // Retorno inmediato: Caché si existe, si no, Red.
      return cachedResponse || networkFetch;
    })["catch"](function() {
      // Fallback crítico
      return new Response('Error de persistencia en el Service Worker.', { status: 500 });
    })
  );
});
