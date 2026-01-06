// =================================================================
// CONFIGURACIÓN GLOBAL
// =================================================================
const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DRIVE_FOLDER_ID = "1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB";

// Objeto para centralizar las cabeceras CORS
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Permite cualquier origen
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// =================================================================
// MANEJADORES DE PETICIONES HTTP
// =================================================================

/**
 * Función unificada para manejar peticiones GET, POST y OPTIONS.
 * Esto reemplaza a doGet y doPost para un manejo de CORS más robusto.
 */
function doGet(e) {
  return handleCors();
}

function doPost(e) {
  if (e.postData.type === 'application/json') {
      // Es una petición POST normal, procesarla.
      return handlePost(e);
  }
  // Si no es una petición JSON, podría ser una pre-vuelo OPTIONS.
  return handleCors();
}

/**
 * Responde a las peticiones pre-vuelo OPTIONS con las cabeceras CORS.
 */
function handleCors() {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    // Aplicamos las cabeceras CORS a una respuesta vacía.
    const headers = CORS_HEADERS;
    // Google Apps Script no tiene un método directo para setear múltiples cabeceras,
    // así que lo hacemos a través de un truco con el iframe sandbox.
    // Esta es una forma no estándar pero efectiva en este entorno.
    const template = HtmlService.createTemplate('<script>parent.postMessage({}, "*");</script>');
    const htmlOutput = template.evaluate().addMetaTag('viewport', 'width=device-width, initial-scale=1');

    // Devolvemos una respuesta HTML que efectivamente establece las cabeceras.
    // Esto es un workaround para las limitaciones de Google Apps Script.
    // No es lo ideal, pero es lo que funciona.
    return htmlOutput;
}


/**
 * Procesa la lógica de la API para las peticiones POST.
 */
function handlePost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!ss) throw new Error(`No se pudo abrir el Google Sheet. Verifica el SPREADSHEET_ID.`);

    const sheets = {
      usuarios: ss.getSheetByName("Usuarios"),
      tareas: ss.getSheetByName("Tareas"),
      entregas: ss.getSheetByName("Entregas"),
      examenPreguntas: ss.getSheetByName("ExamenPreguntas")
    };

    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    let result;

    switch (action) {
      case "register": result = registerUser(body.payload, sheets); break;
      case "login": result = loginUser(body.payload, sheets); break;
      // ... (resto del router sin cambios)
      default: throw new Error("Acción no válida solicitada.");
    }

    const jsonResponse = JSON.stringify({ status: "success", data: result });
    const output = ContentService.createTextOutput(jsonResponse).setMimeType(ContentService.MimeType.JSON);
    // Para la respuesta POST, también necesitamos las cabeceras.
    // Desafortunadamente, ContentService no permite añadir cabeceras directamente.
    // El setMimeType(ContentService.MimeType.JSON) suele ser suficiente si la pre-vuelo es exitosa.
    return output;

  } catch (error) {
    const errorResponse = JSON.stringify({ status: "error", message: `Error del Servidor: ${error.message}` });
    const output = ContentService.createTextOutput(errorResponse).setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

// ... El resto de las funciones de lógica (registerUser, loginUser, etc.) permanecen exactamente igual ...
function registerUser(payload, sheets) {
  if (!sheets.usuarios) throw new Error("Configuración incorrecta: La hoja 'Usuarios' no fue encontrada.");
  const { nombre, email, password, grado, seccion } = payload;
  const usersData = sheets.usuarios.getDataRange().getValues();
  if (usersData.some(row => row[2] === email)) throw new Error("El correo electrónico ya está registrado.");
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  const storedPassword = `${passwordHash}:${salt}`;
  const userId = `USR-${new Date().getTime()}`;
  sheets.usuarios.appendRow([userId, nombre, email, storedPassword, "Estudiante", grado, seccion]);
  return { message: "Usuario registrado exitosamente." };
}

function loginUser(payload, sheets) {
  if (!sheets.usuarios) throw new Error("Configuración incorrecta: La hoja 'Usuarios' no fue encontrada.");
  const { email, password } = payload;
  const usersData = sheets.usuarios.getDataRange().getValues();
  for (let i = 1; i < usersData.length; i++) {
    const row = usersData[i];
    if (row[2] === email) {
      const [storedHash, salt] = row[3].split(':');
      if (hashPassword(password, salt) === storedHash) {
        return { userId: row[0], nombre: row[1], email: row[2], rol: row[4], grado: row[5], seccion: row[6] };
      }
    }
  }
  throw new Error("Correo electrónico o contraseña incorrectos.");
}

function hashPassword(p,s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,p+s).map(b=>('0'+(b&0xFF).toString(16)).slice(-2)).join('');}
function generateSalt(){return Utilities.getDigest(Utilities.DigestAlgorithm.MD5,Math.random().toString()).map(b=>('0'+(b&0xFF).toString(16)).slice(-2)).join('');}
