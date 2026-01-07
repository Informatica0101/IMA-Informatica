// --- CONFIGURACIÓN GLOBAL ---

// ID de la Hoja de Cálculo de Google donde se almacenan los datos.
const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";

// ID de la carpeta raíz en Google Drive donde se guardarán los archivos.
const DRIVE_FOLDER_ID = "1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB";

// --- BLOQUEO DE DEPURACIÓN ---

// Cambia a 'false' en producción. Si es 'true', se mostrarán registros detallados.
const DEBUG_MODE = true;

/**
 * Registra un mensaje en la consola solo si DEBUG_MODE es true.
 * @param {string} message - El mensaje a registrar.
 * @param {*} [optionalParam] - Un parámetro opcional para mostrarlo como string JSON.
 */
function logDebug(message, optionalParam) {
  if (DEBUG_MODE) {
    let logMessage = `[DEBUG] ${new Date().toLocaleTimeString()} - ${message}`;
    if (optionalParam !== undefined) {
      try {
        logMessage += ` | ${JSON.stringify(optionalParam, null, 2)}`;
      } catch (e) {
        logMessage += ` | [Parámetro no serializable]`;
      }
    }
    console.log(logMessage);
  }
}
