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

        const textResponse = await response.text();
        const jsonResponse = JSON.parse(textResponse);
        return jsonResponse;

    } catch (error) {
        console.error(`Error al llamar al servicio ${service} con acción ${action}:`, error);
        throw error;
    }
}
