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
                // Este header es crucial para que Google Apps Script procese la solicitud correctamente.
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({ action, payload }),
            // No es necesario 'mode: "cors"' ya que es el valor por defecto.
        });

        // Google Apps Script, para evitar CORS, devuelve el JSON como una cadena de texto.
        // Primero obtenemos el texto plano de la respuesta.
        const textResponse = await response.text();

        // Luego, parseamos el texto a JSON.
        const jsonResponse = JSON.parse(textResponse);

        return jsonResponse;

    } catch (error) {
        console.error(`Error al llamar al servicio ${service} con acción ${action}:`, error);
        // Re-lanzamos el error para que el código que llama a fetchApi pueda manejarlo.
        throw error;
    }
}
