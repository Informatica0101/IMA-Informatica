const CACHE_NAME = 'informatic-app-v11';
const ASSETS = [
  './',
  './index.html',
  './index.html?v=11',
  './login.html',
  './login.html?v=11',
  './register.html',
  './register.html?v=11',
  './student-dashboard.html',
  './student-dashboard.html?v=11',
  './teacher-dashboard.html',
  './teacher-dashboard.html?v=11',
  './exam.html',
  './exam.html?v=11',
  './results.html',
  './results.html?v=11',
  './pseudocode.html',
  './pseudocode.html?v=11',
  './css/style.css',
  './css/style.css?v=11',
  './js/data.js',
  './js/data.js?v=11',
  './js/auth.js',
  './js/auth.js?v=11',
  './js/ui-common.js',
  './js/ui-common.js?v=11',
  './js/student.js',
  './js/student.js?v=11',
  './js/teacher.js',
  './js/teacher.js?v=11',
  './js/exam.js',
  './js/exam.js?v=11',
  './js/results.js',
  './js/results.js?v=11',
  './js/config.js',
  './js/config.js?v=11',
  './imagenes/logo.png',
  './imagenes/bandera-de-honduras.png',
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

// Estrategia: Network First con fallback a Cache y timeout
self.addEventListener('fetch', event => {
  // Omitir peticiones a Google Apps Script (API) para que siempre vayan a la red
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    fetchWithTimeout(event.request, 3000)
      .then(response => {
        // Opcional: Podríamos actualizar el caché aquí para recursos dinámicos,
        // pero por ahora nos mantenemos en la lista estática definida arriba.
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
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
