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
async function fetchApi(service, action, payload, retryCount = 0, options = {}) {
    const MAX_RETRIES = 2;
    // REQ: Uso de constante global v3.3
    const urls = window.SERVICE_URLS || (typeof SERVICE_URLS !== 'undefined' ? SERVICE_URLS : {});

    if (!urls[service]) {
        console.error(`URL para el servicio "${service}" no encontrada.`);
        return { status: 'error', message: 'Configuración de servicio no encontrada.', isFallback: true, data: [] };
    }

    const url = urls[service];

    // REQ: Implementación de Timeout para evitar bloqueos por Gateway Timeout (Tarea 1)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos de límite

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({ action, payload }),
            signal: controller.signal,
            priority: options.priority || 'auto'
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }

        const textResponse = await response.text();
        const contentType = response.headers.get('content-type');

        // REQ: Validación de content-type antes de parsear (Fase 8)
        if (contentType && contentType.includes('text/html')) {
            console.error("RECIBIDO HTML EN LUGAR DE JSON:", {
                url: url,
                action: action,
                snippet: textResponse.substring(0, 200)
            });
            throw new Error(`Error: El servidor respondió con HTML (posible 404 o error de script). Acción: ${action}`);
        }

        try {
            const parsed = JSON.parse(textResponse);

            // REQ: Silent Reconciliation (Modulo 1.1)
            if (options.store && window.PersistenceManager) {
                // No esperamos la reconciliación para no bloquear el retorno del JSON parseado
                window.PersistenceManager.reconcile(options.store, parsed, options.onUpdate);
            }

            return parsed;
        } catch (e) {
            console.error("Respuesta no es JSON válido:", textResponse);
            throw new Error(`El servidor devolvió una respuesta inválida (no-JSON). URL: ${url}`);
        }

    } catch (error) {
        console.error(`Intento ${retryCount + 1} fallido para ${service}/${action}:`, error);

        if (retryCount < MAX_RETRIES && (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('Failed'))) {
            const delay = 1000 * (retryCount + 1);
            console.log(`Reintentando en ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
            return fetchApi(service, action, payload, retryCount + 1);
        }

        // REQ: Fallback amigable y notificación de error (v4.0)
        console.warn(`[API-FALLBACK] Retornando estado seguro para ${service}/${action} tras error crítico.`);

        // Notificación visual no bloqueante (Toast) - Solo si el DOM está listo
        if (document.body) {
            const errorToast = document.createElement('div');
            errorToast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[9999] flex items-center gap-4 animate-fade-in-up border border-red-400/30 backdrop-blur-md';
            errorToast.innerHTML = `
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-wifi-slash"></i>
                </div>
                <div class="flex-grow">
                    <p class="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Error de Conexión</p>
                    <p class="text-xs font-medium opacity-90">El servicio ${service} no responde. Los datos pueden estar desactualizados.</p>
                </div>
                <button onclick="location.reload()" class="bg-white text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-gray-100 transition-colors">Reintentar</button>
            `;
            document.body.appendChild(errorToast);
            setTimeout(() => {
                if (errorToast.parentNode) errorToast.classList.add('opacity-0', 'pointer-events-none', 'transition-opacity', 'duration-500');
            }, 8000);
        }

        // Estructuras de fallback según la acción solicitada (v3.3)
        if (action === 'getNews') return { status: 'success', data: [], isFallback: true };
        if (action === 'getGlobalTop') return { status: 'success', global: [], subjectTops: {}, isFallback: true };
        if (action.startsWith('get')) return { status: 'success', data: [], isFallback: true };
        if (action === 'loginUser') return { status: 'error', message: 'Servicio de autenticación no disponible.', isFallback: true };

        return {
            status: 'error',
            message: 'Error de conexión persistente. Trabajando en modo offline limitado.',
            isFallback: true,
            data: []
        };
    }
}
