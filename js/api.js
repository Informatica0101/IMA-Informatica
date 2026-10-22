// [TAREA-03] [Fase 1 - Cuotas y Salud Operativa] - Implementar supervisión operativa, prevención de agotamiento de cuotas y reintentos exponenciales.
window.OPERATIONAL_HEALTH_METRICS = window.OPERATIONAL_HEALTH_METRICS || {
    totalCalls: 0,
    successCalls: 0,
    failedCalls: 0,
    quotaErrors: 0,
    serviceMetrics: {}
};

// [FASE2-T03] [Fase 2 - Contratos API y Compatibilidad] - Validador de esquemas de contrato de respuestas API y diferenciación estricta de éxito vs error/fallback.
window.validateApiResponseContract = function(res, service, action) {
    if (!res || typeof res !== 'object') {
        throw new Error('Respuesta inválida del servicio ' + service + '/' + action + ': no es un objeto JSON válido.');
    }
    if (!res.status || (res.status !== 'success' && res.status !== 'error')) {
        throw new Error('Contrato de respuesta violado en ' + service + '/' + action + ': la propiedad status debe ser "success" o "error".');
    }
    return true;
};

window.getServiceHealthMetrics = function() {
    return window.OPERATIONAL_HEALTH_METRICS;
};

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
    if (window.OPERATIONAL_HEALTH_METRICS) {
        window.OPERATIONAL_HEALTH_METRICS.totalCalls++;
        var svcKey = service || 'UNKNOWN';
        window.OPERATIONAL_HEALTH_METRICS.serviceMetrics[svcKey] = window.OPERATIONAL_HEALTH_METRICS.serviceMetrics[svcKey] || { total: 0, success: 0, failed: 0, quotaExceeded: 0 };
        window.OPERATIONAL_HEALTH_METRICS.serviceMetrics[svcKey].total++;
    }
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


    // REQ-EXP-008 & FASE 2: Inyectar authRole e idempotencyToken para acciones de escritura
    if (payload && typeof payload === "object") {
        if (!payload.authRole) {
            try {
                var sessionUser = JSON.parse(localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser") || localStorage.getItem("usuario_actual") || "{}");
                if (sessionUser && sessionUser.rol) {
                    payload.authRole = sessionUser.rol;
                }
            } catch (_) {}
        }
        // [FASE2-T02] [Fase 2 - Idempotencia de Operaciones] - Inyección automática de token de idempotencia para escrituras con efectos secundarios y prevención de duplicación por reintentos HTTP.
        if (action.indexOf('get') !== 0 && !payload.idempotencyToken && !payload.idempotencyKey) {
            payload.idempotencyToken = 'IDEM-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
        }
        // [FASE2-T08] [Fase 2 - Trazabilidad y Correlación] - Inyección automática de identificador de correlación para reconstrucción de operaciones inter-servicio.
        if (!payload.correlationId && !payload.requestId) {
            payload.correlationId = 'CORR-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
        }
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
                    if (typeof window.validateApiResponseContract === 'function') {
                        window.validateApiResponseContract(parsed, service, action);
                    }

                    // [T-UX-01] [Fase 3: Experiencia de Usuario y Navegación Unificada] - Detección centralizada de errores de permisos y expiración de sesión.
                    if (parsed && (parsed.code === 'AUTH_PERMISSION_DENIED' || (parsed.message && parsed.message.indexOf('Acceso denegado') !== -1))) {
                        console.warn('[API-AUTH] Error de autorización o sesión expirada:', parsed.message);
                        if (typeof window.handleSessionExpired === 'function') {
                            window.handleSessionExpired(parsed.message);
                        }
                    }

                    // REQ: Defensive Data Validation (v7.7.1)
                    // If the action is a "get" action, ensure we return an array if data is missing
                    if (action.indexOf('get') === 0 && parsed.status === 'success' && parsed.data === undefined) {
                        parsed.data = [];
                    }

                    // REQ: Silent Reconciliation (Modulo 1.1)
                    if (options.store && window.PersistenceManager) {
                        window.PersistenceManager.reconcile(options.store, parsed, options.onUpdate, options.key);
                    }

                    if (window.OPERATIONAL_HEALTH_METRICS) {
                        window.OPERATIONAL_HEALTH_METRICS.successCalls++;
                        if (window.OPERATIONAL_HEALTH_METRICS.serviceMetrics[service]) {
                            window.OPERATIONAL_HEALTH_METRICS.serviceMetrics[service].success++;
                        }
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

            if (window.OPERATIONAL_HEALTH_METRICS) {
                window.OPERATIONAL_HEALTH_METRICS.failedCalls++;
                if (window.OPERATIONAL_HEALTH_METRICS.serviceMetrics[service]) {
                    window.OPERATIONAL_HEALTH_METRICS.serviceMetrics[service].failed++;
                    if (error.message && (error.message.indexOf('quota') !== -1 || error.message.indexOf('Quota') !== -1 || error.message.indexOf('LIMIT') !== -1)) {
                        window.OPERATIONAL_HEALTH_METRICS.quotaErrors++;
                        window.OPERATIONAL_HEALTH_METRICS.serviceMetrics[service].quotaExceeded++;
                    }
                }
            }

            var isReadOnlyAction = action.indexOf('get') === 0;
            var hasIdempotencyToken = payload && (payload.idempotencyToken || payload.idempotencyKey);
            if (retryCount < MAX_RETRIES && (isReadOnlyAction || hasIdempotencyToken) && (error.message.indexOf('fetch') !== -1 || error.message.indexOf('Network') !== -1 || error.message.indexOf('Failed') !== -1)) {
                var delay = 1000 * Math.pow(2, retryCount);
                console.log('Reintentando en ' + delay + 'ms para ' + action + ' (Intento ' + (retryCount + 1) + ')...');
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
            if (action === 'getUserSettings') return { status: 'success', data: { userId: 'USER-001', categories: { academico: true, administrativo: true, mensajes: true, asistencia: true, comercial: false }, inAppEnabled: true, externalChannelPreference: 'NINGUNO', frequency: 'INMEDIATA' }, isFallback: true };
            if (action === 'getProviderIntegrations') return { status: 'success', data: [
                { integrationId: "INT-SMS", providerType: "SMS", providerName: "Twilio / SMS Gateway", serviceCategory: "Mensajería", enabled: false, environment: "Sandbox", secretRef: "***PROTECTED***", status: "DESACTIVADO" },
                { integrationId: "INT-WA", providerType: "WHATSAPP", providerName: "Meta Cloud API", serviceCategory: "Mensajería", enabled: false, environment: "Production", secretRef: "***PROTECTED***", status: "DESACTIVADO" },
                { integrationId: "INT-MSG", providerType: "MESSENGER", providerName: "Facebook Messenger API", serviceCategory: "Mensajería", enabled: false, environment: "Production", secretRef: "***PROTECTED***", status: "DESACTIVADO" },
                { integrationId: "INT-EMAIL", providerType: "EMAIL", providerName: "Gmail / SMTP", serviceCategory: "Correo Institucional", enabled: true, environment: "Production", secretRef: "***PROTECTED***", status: "ACTIVO" },
                { integrationId: "INT-PAY-BAC", providerType: "PASARELA_PAGO", providerName: "BAC Credomatic Pasarela", serviceCategory: "Cobros Financieros", enabled: false, environment: "Test", secretRef: "***PROTECTED***", status: "CONFIGURADO" }
            ], isFallback: true };
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
