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
async function fetchApi(service, action, payload) {
    if (!SERVICE_URLS[service]) {
        throw new Error(`URL para el servicio "${service}" no encontrada.`);
    }

    const url = SERVICE_URLS[service];

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({ action, payload }),
        });

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
            return JSON.parse(textResponse);
        } catch (e) {
            console.error("Respuesta no es JSON válido:", textResponse);
            throw new Error(`El servidor devolvió una respuesta inválida (no-JSON). URL: ${url}`);
        }

    } catch (error) {
        console.error(`Error al llamar al servicio ${service} con acción ${action}:`, error);
        throw error;
    }
}
