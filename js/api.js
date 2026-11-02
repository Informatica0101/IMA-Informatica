/**
 * [REQ-DOC-012] Helper unificado para realizar llamadas a los microservicios.
 * Utiliza la constante SERVICE_URLS definida en js/config.js.
 * Maneja correctamente los headers y la respuesta para evitar errores de CORS
 * con Google Apps Script, propagando contexto de usuario para RBAC del servidor.
 * @param {string} service - El nombre del servicio (ej. 'USER', 'TASK', 'ACADEMIC', 'EXAM').
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

    // REQ-EXP-008: Inyección automática de contexto de autorización RBAC
    var currentUser = null;
    try {
        var rawUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (rawUser) currentUser = JSON.parse(rawUser);
    } catch (_) {}

    var enrichedPayload = payload || {};
    if (currentUser && typeof enrichedPayload === 'object' && !Array.isArray(enrichedPayload)) {
        if (!enrichedPayload.requesterUserId) enrichedPayload.requesterUserId = currentUser.userId;
        if (!enrichedPayload.requesterRole) enrichedPayload.requesterRole = currentUser.rol;
    }

    var fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: JSON.stringify({ action: action, payload: enrichedPayload })
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

                    // REQ-EXP-008: Manejo explícito de rechazo por autorización RBAC
                    if (parsed && parsed.status === 'error' && parsed.code === 'AUTH_PERMISSION_DENIED') {
                        console.error('[RBAC] Acceso denegado:', parsed.message);
                        if (document.body && !options.silentAuthError) {
                            var authToast = document.createElement('div');
                            authToast.className = 'fixed top-6 left-1/2 -translate-x-1/2 bg-red-800 text-white px-6 py-3 rounded-2xl shadow-2xl z-[10000] flex items-center gap-3 border border-red-500 animate-fade-in-down';
                            authToast.innerHTML = '<i class="fas fa-shield-alt text-lg"></i><span class="text-xs font-bold uppercase tracking-wider">Acceso denegado: ' + (parsed.message || 'No autorizado') + '</span>';
                            document.body.appendChild(authToast);
                            setTimeout(function() {
                                if (authToast.parentNode) authToast.parentNode.removeChild(authToast);
                            }, 5000);
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

/**
 * REQ-EXP-017: Health Check Ping-Pong para Monitoreo de Microservicios
 * Realiza una solicitud real midiendo latencia de ida y vuelta (round-trip).
 * @param {string} service - Nombre del servicio ('USER', 'ACADEMIC', 'TASK', 'EXAM')
 * @returns {Promise<object>} Estado de salud { service, status, latencyMs, state, message }
 */
window.checkMicroserviceHealth = function(service) {
    var startTime = Date.now();
    return fetchApi(service, 'ping', {}, 0, { timeout: 6000 })
        .then(function(res) {
            var latency = Date.now() - startTime;
            var isOnline = res && res.status === 'success' && !res.isFallback;
            var state = 'Fuera de línea';
            if (isOnline) {
                state = latency < 2000 ? 'En línea' : 'Degradado';
            }
            return {
                service: service,
                status: res.status || 'error',
                latencyMs: latency,
                state: state,
                isFallback: !!res.isFallback,
                timestamp: new Date().toISOString(),
                message: res.message || (isOnline ? 'Operativo' : 'Sin respuesta válida')
            };
        })
        .catch(function(err) {
            var latency = Date.now() - startTime;
            return {
                service: service,
                status: 'error',
                latencyMs: latency,
                state: 'Fuera de línea',
                isFallback: true,
                timestamp: new Date().toISOString(),
                message: err.message || 'Error de red'
            };
        });
};

/**
 * Ejecuta health checks simultáneos en todos los microservicios configurados
 * @returns {Promise<Array<object>>}
 */
window.checkAllMicroservicesHealth = function() {
    var services = ['USER', 'ACADEMIC', 'TASK', 'EXAM'];
    var checks = services.map(function(s) {
        return window.checkMicroserviceHealth(s);
    });
    return Promise.all(checks);
};

/**
 * SISTEMA DE LOGS ESTRUCTURADOS CLIENTE (REQ-EXP-018)
 * Registra eventos técnicos estructurados con sanitización de credenciales.
 */
window.logStructuredEvent = function(service, severidad, funcion, codigoError, detalles) {
    var sService = service || 'USER';
    var sSev = severidad || 'INFO';
    var sFunc = funcion || 'client_operation';
    var sCode = codigoError || '';

    // Sanitización local preventiva
    var safeDetails = detalles;
    if (typeof safeDetails === 'object') {
        try {
            var str = JSON.stringify(safeDetails);
            safeDetails = str.replace(/"(?:password|contrasena|pin|token|secret)":\s*"[^"]*"/gi, '"$1":"[REDACTED]"');
        } catch (_) {}
    }

    var payload = {
        severidad: sSev,
        servicio: sService,
        funcion: sFunc,
        codigoError: sCode,
        detalles: safeDetails
    };

    return window.fetchApi(sService, 'recordStructuredLog', payload)
        .catch(function(err) {
            console.warn('[LogStructuredEvent] No se pudo persistir log:', err.message);
        });
};

/**
 * GESTIÓN DE COPIAS DE SEGURIDAD, RESTAURACIÓN Y MANTENIMIENTO (REQ-EXP-019)
 */
window.createBackup = function(service, tipo) {
    var targetService = (service || 'USER').toUpperCase();
    var payload = {
        servicio: targetService,
        tipo: tipo || 'MANUAL'
    };
    return window.fetchApi(targetService === 'ACADEMIC' ? 'ACADEMIC' : 'USER', 'createSpreadsheetBackup', payload);
};

window.getBackupsList = function(filters) {
    return window.fetchApi('USER', 'getBackupsList', filters || {});
};

window.restoreBackup = function(backupId, confirmationToken) {
    return window.fetchApi('USER', 'restoreSpreadsheetBackup', {
        backupId: backupId,
        confirmationToken: confirmationToken
    });
};

window.runMaintenance = function(options) {
    return window.fetchApi('USER', 'runSystemMaintenance', options || {});
};

/**
 * GESTIÓN DE GUÍAS DE ESTUDIO FORMATIVAS (REQ-DOC-001)
 */
window.saveStudyGuide = function(guideData) {
    return window.fetchApi('ACADEMIC', 'createOrUpdateStudyGuide', guideData || {});
};

window.getStudyGuides = function(filters) {
    return window.fetchApi('ACADEMIC', 'getStudyGuides', filters || {});
};

window.toggleStudyGuideStatus = function(guideId, status) {
    return window.fetchApi('ACADEMIC', 'toggleStudyGuideStatus', {
        id_guia: guideId,
        status: status
    });
};

/**
 * EXPORTACIÓN DOCUMENTAL COMPRIMIDA POR AÑO LECTIVO (REQ-DOC-010)
 */
window.exportSchoolYearArchive = function(anio, options) {
    options = options || {};
    return window.fetchApi('ACADEMIC', 'exportSchoolYearArchive', {
        anio: anio,
        parcial: options.parcial,
        tipoRecurso: options.tipoRecurso
    });
};

/**
 * ASISTENCIA ESTUDIANTIL Y RENDIMIENTO INTEGRAL (REQ-DOC-011)
 */
window.recordStudentAttendance = function(payload) {
    return window.fetchApi('ACADEMIC', 'recordStudentAttendance', payload || {});
};

window.getStudentAttendanceSummary = function(payload) {
    return window.fetchApi('ACADEMIC', 'getStudentAttendanceSummary', payload || {});
};
