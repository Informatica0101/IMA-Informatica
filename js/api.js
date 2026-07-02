/**
 * Helper unificado para realizar llamadas a los microservicios.
 * Utiliza la constante SERVICE_URLS definida en js/config.js.
 * Maneja correctamente los headers y la respuesta para evitar errores de CORS
 * con Google Apps Script.
 * @param {string} service - El nombre del servicio (ej. 'USER', 'TASK', 'EXAM').
 * @param {string} action - La acción a ejecutar en el servicio.
 * @param {object} payload - Los datos para la acción.
 * @returns {Promise<object>} La respuesta del servicio parseada como JSON.
 */
function fetchApi(service, action, payload, retryCount, options) {
    var MAX_RETRIES = 2;
    retryCount = retryCount || 0;
    options = options || {};

    // REQ: Uso de constante global v3.3
    var urls = window.SERVICE_URLS || (typeof SERVICE_URLS !== 'undefined' ? SERVICE_URLS : {});

    if (!urls[service]) {
        console.error('URL para el servicio "' + service + '" no encontrada.');
        return Promise.resolve({ status: 'error', message: 'Configuración de servicio no encontrada.', isFallback: true, data: [] });
    }

    var url = urls[service];

    // REQ: Implementación de Timeout para evitar bloqueos por Gateway Timeout (Tarea 1)
    var controller = null;
    var signal = null;
    if (typeof AbortController !== 'undefined') {
        controller = new AbortController();
        signal = controller.signal;
    }

    var timeoutId = null;
    if (controller) {
        timeoutId = setTimeout(function() { controller.abort(); }, 60000); // 60 segundos de límite
    }

    var fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: JSON.stringify({ action: action, payload: payload })
    };
    if (signal) fetchOptions.signal = signal;
    if (options.priority) fetchOptions.priority = options.priority;

    // REQ: Eager Caching & 0ms Initial Render (Modulo 1.1)
    // Disparar lectura de caché inmediatamente sin bloquear el fetch remoto
    if (options.store && options.onUpdate && window.PersistenceManager) {
        window.PersistenceManager.get(options.store, options.key).then(function(cached) {
            if (cached && (cached.data || cached.allHistory || Array.isArray(cached))) {
                console.log('[API-CACHE] Renderizado inmediato desde:', options.store);
                // REQ: Preservar sobres si contienen historial detallado (v7.7)
                var cleanCached = cached;
                if (cached.data !== undefined && !cached.allHistory) {
                    cleanCached = cached.data;
                }

                // REQ: Defensive array check for cache (v7.7.1)
                if (action.indexOf('get') === 0 && cleanCached === undefined) {
                    cleanCached = [];
                }

                options.onUpdate(cleanCached);
            }
        }).catch(function(e) {
            console.warn('[API-CACHE] Error en lectura previa:', e);
        });
    }

    return fetch(url, fetchOptions)
        .then(function(response) {
            if (timeoutId) clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('Error HTTP: ' + response.status + ' ' + response.statusText);
            }

            var contentType = response.headers.get('content-type');

            return response.text().then(function(textResponse) {
                // REQ: Validación de content-type antes de parsear (Fase 8)
                if (contentType && contentType.indexOf('text/html') !== -1) {
                    console.error("RECIBIDO HTML EN LUGAR DE JSON:", {
                        url: url,
                        action: action,
                        snippet: textResponse.substring(0, 200)
                    });
                    throw new Error('Error: El servidor respondió con HTML (posible 404 o error de script). Acción: ' + action);
                }

                try {
                    var parsed = JSON.parse(textResponse);

                    // REQ: Defensive Data Validation (v7.7.1)
                    // If the action is a "get" action, ensure we return an array if data is missing
                    if (action.indexOf('get') === 0 && parsed.status === 'success' && parsed.data === undefined) {
                        parsed.data = [];
                    }

                    // REQ: Silent Reconciliation (Modulo 1.1)
                    if (options.store && window.PersistenceManager) {
                        window.PersistenceManager.reconcile(options.store, parsed, options.onUpdate, options.key);
                    }

                    return parsed;
                } catch (e) {
                    console.error("Respuesta no es JSON válido:", textResponse);
                    throw new Error('El servidor devolvió una respuesta inválida (no-JSON). URL: ' + url);
                }
            });
        })
        .catch(function(error) {
            console.error('Intento ' + (retryCount + 1) + ' fallido para ' + service + '/' + action + ':', error);

            if (retryCount < MAX_RETRIES && (error.message.indexOf('fetch') !== -1 || error.message.indexOf('Network') !== -1 || error.message.indexOf('Failed') !== -1)) {
                var delay = 1000 * (retryCount + 1);
                console.log('Reintentando en ' + delay + 'ms...');
                return new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve(fetchApi(service, action, payload, retryCount + 1, options));
                    }, delay);
                });
            }

            // REQ: Fallback amigable y notificación de error (v4.0)
            console.warn('[API-FALLBACK] Retornando estado seguro para ' + service + '/' + action + ' tras error crítico.');

            // Notificación visual no bloqueante (Toast)
            if (document.body) {
                var errorToast = document.createElement('div');
                errorToast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[9999] flex items-center gap-4 animate-fade-in-up border border-red-400/30 backdrop-blur-md';
                errorToast.innerHTML =
                    '<div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">' +
                        '<i class="fas fa-wifi-slash"></i>' +
                    '</div>' +
                    '<div class="flex-grow">' +
                        '<p class="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Error de Conexión</p>' +
                        '<p class="text-xs font-medium opacity-90">El servicio ' + service + ' no responde. Los datos pueden estar desactualizados.</p>' +
                    '</div>' +
                    '<button onclick="location.reload()" class="bg-white text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-gray-100 transition-colors">Reintentar</button>';

                document.body.appendChild(errorToast);
                setTimeout(function() {
                    if (errorToast.parentNode) {
                        errorToast.style.opacity = '0';
                        errorToast.style.pointerEvents = 'none';
                        errorToast.style.transition = 'opacity 0.5s';
                        setTimeout(function() {
                            if (errorToast.parentNode) errorToast.parentNode.removeChild(errorToast);
                        }, 500);
                    }
                }, 8000);
            }

            // Estructuras de fallback según la acción solicitada (v7.7.5)
            if (action === 'getNews') return { status: 'success', data: [], isFallback: true };
            if (action === 'getGlobalTop') return { status: 'success', global: [], subjectTops: {}, isFallback: true };
            if (action === 'getAcademicConfig') return { status: 'success', data: { ParcialActual: "I parcial", GradoActual: [], SeccionActual: [], AsignaturaActual: [], TemaActual: ["General"] }, isFallback: true };
            if (action.indexOf('get') === 0) return { status: 'success', data: [], isFallback: true };
            if (action === 'loginUser') return { status: 'error', message: 'Servicio de autenticación no disponible.', isFallback: true };

            return {
                status: 'error',
                message: 'Error de conexión persistente. Trabajando en modo offline limitado.',
                isFallback: true,
                data: []
            };
        });
}
