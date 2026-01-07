// --- SERVICIOS DE HOJAS DE CÁLCULO ---

/**
 * Obtiene una hoja de cálculo por su nombre o lanza un error si no se encuentra.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - La hoja de cálculo activa.
 * @param {string} name - El nombre de la hoja a obtener.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} La hoja de cálculo encontrada.
 * @throws {Error} Si la hoja de cálculo no se encuentra.
 */
function getSheetOrThrow(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) {
    const errorMessage = `La hoja de cálculo con el nombre "${name}" no fue encontrada. Verifica que exista y que el nombre sea correcto.`;
    logDebug(errorMessage);
    throw new Error(errorMessage);
  }
  logDebug(`Hoja "${name}" cargada correctamente.`);
  return sheet;
}

// --- INICIALIZACIÓN DE HOJAS ---

// Se inicializan como variables globales para ser accesibles en todo el proyecto de Apps Script.
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

const usuariosSheet = getSheetOrThrow(ss, "Usuarios");
const tareasSheet = getSheetOrThrow(ss, "Tareas");
const entregasSheet = getSheetOrThrow(ss, "Entregas");
const examenesSheet = getSheetOrThrow(ss, "Examenes");
const preguntasSheet = getSheetOrThrow(ss, "PreguntasExamen");
const entregasExamenSheet = getSheetOrThrow(ss, "EntregasExamen");
