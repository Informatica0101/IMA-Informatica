// --- MICROSERVICIO DE USUARIOS ---

// --- SECCIÓN DE CONFIGURACIÓN Y DEPENDENCIAS COMUNES ---
const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DEBUG_MODE = true;

function logDebug(message, optionalParam) {
  if (DEBUG_MODE) {
    let logMessage = `[USER-SVC] ${new Date().toLocaleTimeString()} - ${message}`;
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

function getSheetOrThrow(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) {
    const errorMessage = `Hoja no encontrada: "${name}".`;
    logDebug(errorMessage);
    throw new Error(errorMessage);
  }
  return sheet;
}

// --- PUNTOS DE ENTRADA (doGet, doPost, doOptions) ---
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Microservicio de Usuarios funcionando." }))
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({'Access-Control-Allow-Origin': '*'});
}

function doOptions() {
  return ContentService.createTextOutput()
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

function doPost(e) {
  let result;
  try {
    logDebug("Solicitud POST recibida.");
    const requestData = JSON.parse(e.postData.contents);
    const { action, payload } = requestData;

    switch (action) {
      case "registerUser":
        result = registerUser(payload);
        break;
      case "loginUser":
        result = loginUser(payload);
        break;
      default:
        result = { status: "error", message: `Acción no reconocida en User-Service: ${action}` };
    }
  } catch (error) {
    logDebug("Error en doPost:", { message: error.message });
    result = { status: "error", message: `Error interno del servidor: ${error.message}` };
  } finally {
    // Asegurar que la cabecera CORS se aplique en todas las respuestas.
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeaders({'Access-Control-Allow-Origin': '*'});
  }
}

// --- LÓGICA DEL SERVICIO ---
function registerUser(payload) {
  logDebug("Iniciando registerUser", payload);
  const { nombre, grado, seccion, email, password } = payload;

  if (!nombre || !email || !password) throw new Error("Nombre, email y contraseña son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");

  const userId = "USR-" + new Date().getTime();
  const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
                                  .map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2))
                                  .join('');

  usuariosSheet.appendRow([userId, nombre, grado, seccion, email, hashedPassword, "Estudiante"]);
  return { status: "success", message: "Usuario registrado." };
}

function loginUser(payload) {
  logDebug("Iniciando loginUser", { email: payload.email });
  const { email, password } = payload;

  if (!email || !password) throw new Error("Email y contraseña son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");

  const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
                                  .map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2))
                                  .join('');

  const data = usuariosSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === email && data[i][5] === hashedPassword) {
      const userData = {
        userId: data[i][0],
        nombre: data[i][1],
        grado: data[i][2],
        seccion: data[i][3],
        rol: data[i][6]
      };
      return { status: "success", data: userData };
    }
  }

  return { status: "error", message: "Credenciales incorrectas." };
}
