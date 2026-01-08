/**
 * URLs de los microservicios de Google Apps Script.
 * Estas son las URLs de despliegue reales obtenidas de js/config.js.
 */
const SERVICE_URLS = {
  USER: 'https://script.google.com/macros/s/AKfycbxm6hfPpWNDCzVgfl-rk4VUl1wsNJ6lTtEPFAGGZMquFv9I9buV60mH8OgPyb0eTR1U/exec',
  TASK: 'https://script.google.com/macros/s/AKfycbzqQDzogIwMMZxMSRGd-OKTUG16Um6xlFNz5S4yA2yrHitdra708Op5-_SyGs33TgmO/exec',
  EXAM: 'https://script.google.com/macros/s/AKfycbzz04XLSkhzhUboxpHYjaSP8B8jevpePbkW7UD7PUjWsRlOmKaQK0xEekVaBGNSW0m5/exec'
};

/**
 * Helper unificado para realizar llamadas a los microservicios.
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
