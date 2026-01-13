// ============================================================================
// MICROSERVICIO DE USUARIOS (VERSIÓN GAS CORRECTA)
// ============================================================================

const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DEBUG_MODE = true;

// ---------------------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------------------

function logDebug(message, optionalParam) {
  if (!DEBUG_MODE) return;
  try {
    console.log(
      `[USER-SVC] ${new Date().toLocaleTimeString()} - ${message}`,
      optionalParam || ""
    );
  } catch (_) {}
}

function getSheetOrThrow(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) {
    const msg = `Hoja no encontrada: ${name}`;
    logDebug(msg);
    throw new Error(msg);
  }
  return sheet;
}

function textResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.TEXT);
}

// ---------------------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------------------

function doGet() {
  return textResponse({
    status: "success",
    message: "Microservicio de Usuarios operativo"
  });
}

function doOptions() {
  // GAS no soporta headers CORS → respuesta mínima
  return textResponse({ status: "ok" });
}

function doPost(e) {
  try {
    logDebug("Solicitud POST recibida");

    const { action, payload } = JSON.parse(e.postData.contents);
    let result;

    switch (action) {
      case "registerUser":
        result = registerUser(payload);
        break;

      case "loginUser":
        result = loginUser(payload);
        break;

      default:
        result = {
          status: "error",
          message: `Acción no reconocida: ${action}`
        };
    }

    return textResponse(result);

  } catch (err) {
    logDebug("Error en doPost", err.message);
    return textResponse({
      status: "error",
      message: err.message
    });
  }
}

// ---------------------------------------------------------------------------
// LÓGICA DEL SERVICIO
// ---------------------------------------------------------------------------

function registerUser(payload) {
  logDebug("Iniciando registerUser", payload);

  const { nombre, grado, seccion, email, password } = payload || {};

  if (!nombre || !email || !password) {
    throw new Error("Nombre, email y contraseña son requeridos.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");

  const userId = Utilities.getUuid();
  const hashedPassword = Utilities
    .computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2))
    .join('');

  usuariosSheet.appendRow([
    userId,
    nombre,
    grado || "",
    seccion || "",
    email,
    hashedPassword,
    "Estudiante"
  ]);

  return {
    status: "success",
    message: "Usuario registrado correctamente",
    userId
  };
}

function loginUser(payload) {
  logDebug("Iniciando loginUser", { email: payload?.email });

  const { email, password } = payload || {};

  if (!email || !password) {
    throw new Error("Email y contraseña son requeridos.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");
  const data = usuariosSheet.getDataRange().getValues();

  const hashedPassword = Utilities
    .computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2))
    .join('');

  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === email && data[i][5] === hashedPassword) {
      return {
        status: "success",
        data: {
          userId: data[i][0],
          nombre: data[i][1],
          grado: data[i][2],
          seccion: data[i][3],
          rol: data[i][6]
        }
      };
    }
  }

  return {
    status: "error",
    message: "Credenciales incorrectas"
  };
}
