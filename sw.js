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

// Estrategia: Stale-While-Revalidate para mayor velocidad y resiliencia offline (v7.5 ES5)
self.addEventListener('fetch', function(event) {
  // Omitir peticiones a APIs dinámicas de Google Apps Script (siempre red)
  if (event.request.url.indexOf('script.google.com') !== -1) {
    return;
  }

  // Ignorar peticiones de Analytics/Tracking si las hubiera
  if (event.request.url.indexOf('analytics') !== -1) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function(cachedResponse) {
        var fetchPromise = fetch(event.request).then(function(networkResponse) {
          // Si la respuesta es válida, actualizamos el caché en segundo plano
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })["catch"](function() {
           // Si falla la red y no hay caché, podemos retornar un fallback opcional
           console.log("[SW] Fallo de red y sin caché para:", event.request.url);
        });

        // Retornamos el caché inmediatamente si existe, si no, esperamos a la red
        return cachedResponse || fetchPromise;
      });
    })
  );
});
