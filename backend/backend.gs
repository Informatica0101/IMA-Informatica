// =================================================================
// CONFIGURACIÓN GLOBAL
// =================================================================
const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DRIVE_FOLDER_ID = "1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB";

// =================================================================
// MANEJADORES DE PETICIONES HTTP (ESTRUCTURA SIMPLIFICADA)
// =================================================================

/**
 * Maneja las peticiones GET. Necesario para que la Web App sea válida.
 */
function doGet(e) {
  const response = { status: "success", message: "Backend operativo." };
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Maneja las peticiones POST. Este es el router principal de la API.
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!ss) {
      throw new Error(`No se pudo abrir el Google Sheet. Verifica que el SPREADSHEET_ID sea correcto.`);
    }

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
      // ... (resto de casos)
      default: throw new Error("Acción no válida.");
    }

    // Ruta de éxito
    const successResponse = { status: "success", data: result };
    return ContentService.createTextOutput(JSON.stringify(successResponse))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Ruta de error
    console.error("Error capturado en doPost:", error.message, error.stack);
    const errorResponse = { status: "error", message: `Error del Servidor: ${error.message}` };
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =================================================================
// FUNCIONES DE LÓGICA (sin cambios)
// =================================================================
function registerUser(payload, sheets) {
  if (!sheets.usuarios) throw new Error("La hoja 'Usuarios' no fue encontrada.");
  const { nombre, email, password, grado, seccion } = payload;
  if (sheets.usuarios.getDataRange().getValues().some(r => r[2] === email)) throw new Error("El correo ya está registrado.");
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  sheets.usuarios.appendRow([`USR-${new Date().getTime()}`, nombre, email, `${passwordHash}:${salt}`, "Estudiante", grado, seccion]);
  return { message: "Usuario registrado exitosamente." };
}

function loginUser(payload, sheets) {
  if (!sheets.usuarios) throw new Error("La hoja 'Usuarios' no fue encontrada.");
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
  throw new Error("Credenciales incorrectas.");
}

function hashPassword(p,s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,p+s).map(b=>('0'+(b&0xFF).toString(16)).slice(-2)).join('');}
function generateSalt(){return Utilities.getDigest(Utilities.DigestAlgorithm.MD5,Math.random().toString()).map(b=>('0'+(b&0xFF).toString(16)).slice(-2)).join('');}
