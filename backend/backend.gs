// =================================================================
// CONFIGURACIÓN INICIAL
// =================================================================

const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DRIVE_FOLDER_ID = "1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB";

const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
// Estas variables pueden ser nulas si las hojas no existen
const sheetUsuarios = ss.getSheetByName("Usuarios");
const sheetTareas = ss.getSheetByName("Tareas");
const sheetEntregas = ss.getSheetByName("Entregas");
const sheetContenido = ss.getSheetByName("Contenido");
const sheetExamenPreguntas = ss.getSheetByName("ExamenPreguntas");

// =================================================================
// FUNCIÓN PRINCIPAL DEL ROUTER (doPost)
// =================================================================

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    let result;

    switch (action) {
      case "register": result = registerUser(body.payload); break;
      case "login": result = loginUser(body.payload); break;
      case "createTask":
        if (body.payload.tipo === 'Examen') result = createExam(body.payload);
        else result = createTask(body.payload);
        break;
      case "gradeSubmission": result = gradeSubmission(body.payload); break;
      case "getTeacherSubmissions": result = getTeacherSubmissions(body.payload); break;
      case "getStudentTasks": result = getStudentTasks(body.payload); break;
      case "getExamQuestions": result = getExamQuestions(body.payload); break;
      case "submitAssignment": result = submitAssignment(body.payload); break;
      default: throw new Error("Acción no válida solicitada.");
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: result })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Añadir logging para depuración en Google Apps Script
    console.error("Error en doPost:", error.message, error.stack);
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

// =================================================================
// FUNCIONES DE AUTENTICACIÓN
// =================================================================

function registerUser(payload) {
  if (!sheetUsuarios) throw new Error("Configuración incorrecta: La hoja 'Usuarios' no fue encontrada en el Google Sheet.");

  const { nombre, email, password, grado, seccion } = payload;
  const usersData = sheetUsuarios.getDataRange().getValues();
  if (usersData.some(row => row[2] === email)) throw new Error("El correo electrónico ya está registrado.");

  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  const storedPassword = `${passwordHash}:${salt}`;
  const userId = `USR-${new Date().getTime()}`;

  sheetUsuarios.appendRow([userId, nombre, email, storedPassword, "Estudiante", grado, seccion]);
  return { message: "Usuario registrado exitosamente." };
}

function loginUser(payload) {
  if (!sheetUsuarios) throw new Error("Configuración incorrecta: La hoja 'Usuarios' no fue encontrada.");

  const { email, password } = payload;
  const usersData = sheetUsuarios.getDataRange().getValues();
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


// =================================================================
// FUNCIONES DE GESTIÓN DE TAREAS Y EXÁMENES
// =================================================================

function createTask(payload) {
  if (!sheetTareas) throw new Error("Configuración incorrecta: La hoja 'Tareas' no fue encontrada.");
  // ... resto de la lógica ...
  const { tipo, titulo, descripcion, fechaLimite, gradoAsignado, seccionAsignada } = payload;
  const tareaId = `TSK-${new Date().getTime()}`;
  const fechaCreacion = new Date().toLocaleDateString('es-ES');
  sheetTareas.appendRow([tareaId, tipo, titulo, descripcion, fechaCreacion, fechaLimite, gradoAsignado, seccionAsignada]);
  return { message: "Tarea creada exitosamente.", tareaId: tareaId };
}

function createExam(payload) {
    if (!sheetTareas) throw new Error("Configuración incorrecta: La hoja 'Tareas' no fue encontrada.");
    if (!sheetExamenPreguntas) throw new Error("Configuración incorrecta: La hoja 'ExamenPreguntas' no fue encontrada.");
    // ... resto de la lógica ...
    const { tipo, titulo, descripcion, fechaLimite, gradoAsignado, seccionAsignada, preguntas } = payload;
    const tareaId = `TSK-${new Date().getTime()}`;
    const fechaCreacion = new Date().toLocaleDateString('es-ES');
    sheetTareas.appendRow([tareaId, tipo, titulo, descripcion, fechaCreacion, fechaLimite, gradoAsignado, seccionAsignada]);
    if (preguntas && preguntas.length > 0) {
        preguntas.forEach(p => {
            const preguntaId = `PREG-${new Date().getTime()}-${Math.random()}`;
            sheetExamenPreguntas.appendRow([preguntaId, tareaId, p.tipoPregunta, p.textoPregunta, p.enlaceImagen || ""]);
        });
    }
    return { message: "Examen creado exitosamente.", tareaId: tareaId };
}

function getTeacherSubmissions(payload) {
    if (!sheetEntregas || !sheetTareas || !sheetUsuarios) throw new Error("Faltan una o más hojas requeridas (Entregas, Tareas, Usuarios).");
    // ... resto de la lógica ...
    const entregasData = sheetEntregas.getDataRange().getValues();
    const tareasData = sheetTareas.getDataRange().getValues();
    const usuariosData = sheetUsuarios.getDataRange().getValues();
    const tareasMap = new Map(tareasData.map(row => [row[0], row[2]]));
    const usuariosMap = new Map(usuariosData.map(row => [row[0], row[1]]));
    const submissions = entregasData.slice(1).map(row => ({
        entregaId: row[0],
        tareaId: row[1],
        tituloTarea: tareasMap.get(row[1]) || "N/A",
        userId: row[2],
        nombreAlumno: usuariosMap.get(row[2]) || "N/A",
        fechaEntrega: row[3],
        enlaceArchivo: row[4],
        calificacion: row[6]
    }));
    return submissions.sort((a, b) => new Date(b.fechaEntrega) - new Date(a.fechaEntrega)).slice(0, 20);
}

// ... (y así sucesivamente para las demás funciones)

// =================================================================
// CÓDIGO RESTANTE (sin cambios en la lógica, solo añadir verificaciones)
// =================================================================
function gradeSubmission(payload) {
  if (!sheetEntregas) throw new Error("Configuración incorrecta: La hoja 'Entregas' no fue encontrada.");
  const { entregaId, calificacion } = payload;
  const rowIndex = getRowIndexById(sheetEntregas, entregaId, 0);
  if (rowIndex === -1) throw new Error("No se encontró la entrega.");
  sheetEntregas.getRange(rowIndex, 7).setValue(calificacion);
  return { message: "Calificación actualizada." };
}

function getStudentTasks(payload) {
  if (!sheetTareas || !sheetEntregas) throw new Error("Faltan las hojas 'Tareas' o 'Entregas'.");
  const { userId, grado, seccion } = payload;
  const allTasks = sheetTareas.getDataRange().getValues().slice(1);
  const studentSubmissions = sheetEntregas.getDataRange().getValues().slice(1).filter(row => row[2] === userId).map(row => row[1]);
  const pendingTasks = allTasks.filter(task => (task[6] === grado && (task[7] === seccion || !task[7])) && !studentSubmissions.includes(task[0]));
  return pendingTasks.map(task => ({ tareaId: task[0], tipo: task[1], titulo: task[2], descripcion: task[3], fechaLimite: task[5] }));
}

function getExamQuestions(payload) {
    if (!sheetExamenPreguntas) throw new Error("Configuración incorrecta: La hoja 'ExamenPreguntas' no fue encontrada.");
    const { tareaId } = payload;
    const allQuestions = sheetExamenPreguntas.getDataRange().getValues().slice(1);
    const examQuestions = allQuestions.filter(q => q[1] === tareaId);
    return examQuestions.map(q => ({ preguntaId: q[0], tareaId: q[1], tipoPregunta: q[2], textoPregunta: q[3], enlaceImagen: q[4] }));
}

function submitAssignment(payload) {
    if (!sheetEntregas || !sheetUsuarios) throw new Error("Faltan las hojas 'Entregas' o 'Usuarios'.");
    // ... lógica de subida de archivos ...
    const { userId, tareaId, fileName, fileMimeType, fileData, respuestaTexto } = payload;
    let fileUrl = "";
    if (fileName && fileData) {
        const decodedData = Utilities.base64Decode(fileData);
        const blob = Utilities.newBlob(decodedData, fileMimeType, fileName);
        const userRow = sheetUsuarios.getDataRange().getValues().find(row => row[0] === userId);
        if (!userRow) throw new Error("Usuario no encontrado.");
        const [studentName, studentGrade, studentSection] = [userRow[1], userRow[5], userRow[6]];
        const rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        const studentFolder = getOrCreateFolder(getOrCreateFolder(getOrCreateFolder(rootFolder, studentGrade), studentSection), studentName);
        const file = studentFolder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileUrl = file.getUrl();
    }
    sheetEntregas.appendRow([`ENT-${new Date().getTime()}`, tareaId, userId, new Date(), fileUrl, respuestaTexto || "", "Pendiente"]);
    return { message: "Tarea entregada exitosamente." };
}

function getOrCreateFolder(parent, name) { const f = parent.getFoldersByName(name); return f.hasNext() ? f.next() : parent.createFolder(name); }
function getRowIndexById(sheet, id, col) { const d = sheet.getRange(1, col + 1, sheet.getLastRow(), 1).getValues(); for (let i=0;i<d.length;i++){ if(d[i][0]==id) return i+1; } return -1; }
function hashPassword(p,s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,p+s).map(b=>('0'+(b&0xFF).toString(16)).slice(-2)).join('');}
function generateSalt(){return Utilities.getDigest(Utilities.DigestAlgorithm.MD5,Math.random().toString()).map(b=>('0'+(b&0xFF).toString(16)).slice(-2)).join('');}
