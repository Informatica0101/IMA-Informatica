// =================================================================
// CONFIGURACIÓN GLOBAL
// =================================================================
const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DRIVE_FOLDER_ID = "1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB";

// =================================================================
// MANEJADORES DE PETICIONES HTTP (ESTRUCTURA SIMPLIFICADA)
// =================================================================

function doGet(e) {
  const response = { status: "success", message: "Backend operativo." };
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!ss) throw new Error(`No se pudo abrir el Google Sheet.`);

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
      case "createTask":
        if (body.payload.tipo === 'Examen') result = createExam(body.payload, sheets);
        else result = createTask(body.payload, sheets);
        break;
      // ... (Resto de las acciones que implementaremos después)
      default: throw new Error("Acción no válida.");
    }

    const successResponse = { status: "success", data: result };
    return ContentService.createTextOutput(JSON.stringify(successResponse)).setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    const errorResponse = { status: "error", message: `Error del Servidor: ${error.message}` };
    return ContentService.createTextOutput(JSON.stringify(errorResponse)).setMimeType(ContentService.MimeType.TEXT);
  }
}

// =================================================================
// FUNCIONES DE LÓGICA
// =================================================================
function registerUser(payload, sheets) {
  if (!sheets.usuarios) throw new Error("La hoja 'Usuarios' no fue encontrada.");
  const { nombre, email, password, grado, seccion } = payload;
  if (sheets.usuarios.getDataRange().getValues().some(r => r[2] === email)) throw new Error("El correo ya está registrado.");
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  sheets.usuarios.appendRow([`USR-${new Date().getTime()}`, nombre, email, `${passwordHash}:${salt}`, "Estudiante", grado, seccion]);
  return { message: "Usuario registrado." };
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

function createTask(payload, sheets) {
  if (!sheets.tareas) throw new Error("La hoja 'Tareas' no fue encontrada.");
  // *** ACTUALIZACIÓN: Incluir parcial y asignatura ***
  const { tipo, titulo, descripcion, parcial, asignatura, fechaLimite, gradoAsignado, seccionAsignada } = payload;
  const tareaId = `TSK-${new Date().getTime()}`;
  const fechaCreacion = new Date().toLocaleDateString('es-ES');

  sheets.tareas.appendRow([
    tareaId, tipo, titulo, descripcion,
    parcial, asignatura, // Nuevos campos
    fechaCreacion, fechaLimite, gradoAsignado, seccionAsignada
  ]);
  return { message: "Tarea creada." };
}

function createExam(payload, sheets) {
    if (!sheets.tareas || !sheets.examenPreguntas) throw new Error("Faltan las hojas 'Tareas' o 'ExamenPreguntas'.");
    // *** ACTUALIZACIÓN: Incluir parcial y asignatura ***
    const { tipo, titulo, descripcion, parcial, asignatura, fechaLimite, gradoAsignado, seccionAsignada, preguntas } = payload;
    const tareaId = `TSK-${new Date().getTime()}`;
    const fechaCreacion = new Date().toLocaleDateString('es-ES');

    sheets.tareas.appendRow([
      tareaId, tipo, titulo, descripcion,
      parcial, asignatura, // Nuevos campos
      fechaCreacion, fechaLimite, gradoAsignado, seccionAsignada
    ]);

    if (preguntas && preguntas.length > 0) {
        preguntas.forEach(p => {
            sheets.examenPreguntas.appendRow([`PREG-${new Date().getTime()}-${Math.random()}`, tareaId, p.tipoPregunta, p.textoPregunta, p.enlaceImagen || ""]);
        });
    }
    return { message: "Examen creado." };
}

// ... (Aquí irían las demás funciones como submitAssignment, etc.)

// =================================================================
// FUNCIONES DE UTILIDAD
// =================================================================
function hashPassword(p,s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,p+s).map(b=>('0'+(b&0xFF).toString(16)).slice(-2)).join('');}
function generateSalt(){return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5,Math.random().toString()).map(b=>('0'+(b&0xFF).toString(16)).slice(-2)).join('');}
