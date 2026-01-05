// =================================================================
// CONFIGURACIÓN INICIAL
// =================================================================

const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DRIVE_FOLDER_ID = "1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB";

const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
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
      // Autenticación
      case "register":
        result = registerUser(body.payload);
        break;
      case "login":
        result = loginUser(body.payload);
        break;

      // Acciones de Profesor
      case "createTask": // Ahora también maneja la creación de exámenes
        if (body.payload.tipo === 'Examen') {
            result = createExam(body.payload);
        } else {
            result = createTask(body.payload);
        }
        break;
      case "gradeSubmission":
        result = gradeSubmission(body.payload);
        break;
      case "getTeacherSubmissions":
        result = getTeacherSubmissions(body.payload);
        break;

      // Acciones de Estudiante
      case "getStudentTasks":
        result = getStudentTasks(body.payload);
        break;
      case "getExamQuestions":
        result = getExamQuestions(body.payload);
        break;
      case "submitAssignment":
        result = submitAssignment(body.payload);
        break;

      default:
        throw new Error("Acción no válida solicitada.");
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: result })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ... (funciones de utilidad y autorización sin cambios)

// =================================================================
// FUNCIONES DE GESTIÓN DE TAREAS Y EXÁMENES (PROFESOR)
// =================================================================

function createTask(payload) {
  const { tipo, titulo, descripcion, fechaLimite, gradoAsignado, seccionAsignada } = payload;
  const tareaId = `TSK-${new Date().getTime()}`;
  const fechaCreacion = new Date().toLocaleDateString('es-ES');

  sheetTareas.appendRow([tareaId, tipo, titulo, descripcion, fechaCreacion, fechaLimite, gradoAsignado, seccionAsignada]);
  return { message: "Tarea creada exitosamente.", tareaId: tareaId };
}

function createExam(payload) {
    // 1. Crear la tarea principal del examen
    const { tipo, titulo, descripcion, fechaLimite, gradoAsignado, seccionAsignada, preguntas } = payload;
    const tareaId = `TSK-${new Date().getTime()}`;
    const fechaCreacion = new Date().toLocaleDateString('es-ES');
    sheetTareas.appendRow([tareaId, tipo, titulo, descripcion, fechaCreacion, fechaLimite, gradoAsignado, seccionAsignada]);

    // 2. Guardar las preguntas del examen
    if (preguntas && preguntas.length > 0) {
        preguntas.forEach(p => {
            const preguntaId = `PREG-${new Date().getTime()}-${Math.random()}`;
            sheetExamenPreguntas.appendRow([
                preguntaId,
                tareaId,
                p.tipoPregunta,
                p.textoPregunta,
                p.enlaceImagen || ""
            ]);
        });
    }

    return { message: "Examen creado exitosamente.", tareaId: tareaId };
}


// ... (getTeacherSubmissions y gradeSubmission sin cambios)


// =================================================================
// FUNCIONES DE GESTIÓN DE TAREAS Y EXÁMENES (ESTUDIANTE)
// =================================================================

function getExamQuestions(payload) {
    const { tareaId } = payload;
    const allQuestions = sheetExamenPreguntas.getDataRange().getValues().slice(1);

    const examQuestions = allQuestions.filter(q => q[1] === tareaId);

    return examQuestions.map(q => ({
        preguntaId: q[0],
        tareaId: q[1],
        tipoPregunta: q[2],
        textoPregunta: q[3],
        enlaceImagen: q[4]
    }));
}

// ... (getStudentTasks y submitAssignment sin cambios)


// =================================================================
// SECCIÓN DE CÓDIGO RESTANTE (SIN CAMBIOS)
// ... (isTeacher, getRowIndexById, getTeacherSubmissions, gradeSubmission, getStudentTasks, submitAssignment, getOrCreateFolder)
// ... (funciones de autenticación: hashPassword, generateSalt, registerUser, loginUser)
// =================================================================
function isTeacher(userId) {
  const users = sheetUsuarios.getDataRange().getValues();
  const user = users.find(u => u[0] === userId);
  if (!user || user[4] !== "Profesor") {
    throw new Error("Acceso denegado. Se requiere rol de profesor.");
  }
  return true;
}

function getRowIndexById(sheet, id, idColumn = 0) {
    const data = sheet.getRange(1, idColumn + 1, sheet.getLastRow(), 1).getValues();
    for (let i = 0; i < data.length; i++) {
        if (data[i][0] == id) {
            return i + 1;
        }
    }
    return -1;
}

function getTeacherSubmissions(payload) {
    const entregasData = sheetEntregas.getDataRange().getValues();
    const tareasData = sheetTareas.getDataRange().getValues();
    const usuariosData = sheetUsuarios.getDataRange().getValues();
    const tareasMap = new Map(tareasData.map(row => [row[0], row[2]]));
    const usuariosMap = new Map(usuariosData.map(row => [row[0], row[1]]));
    const submissions = entregasData.slice(1).map(row => ({
        entregaId: row[0],
        tareaId: row[1],
        tituloTarea: tareasMap.get(row[1]) || "Tarea no encontrada",
        userId: row[2],
        nombreAlumno: usuariosMap.get(row[2]) || "Usuario desconocido",
        fechaEntrega: row[3],
        enlaceArchivo: row[4],
        calificacion: row[6]
    }));
    return submissions.sort((a, b) => new Date(b.fechaEntrega) - new Date(a.fechaEntrega)).slice(0, 20);
}

function gradeSubmission(payload) {
  const { entregaId, calificacion } = payload;
  const rowIndex = getRowIndexById(sheetEntregas, entregaId, 0);
  if (rowIndex === -1) throw new Error("No se encontró la entrega especificada.");
  sheetEntregas.getRange(rowIndex, 7).setValue(calificacion);
  return { message: "Calificación actualizada correctamente." };
}

function getStudentTasks(payload) {
  const { userId, grado, seccion } = payload;
  const allTasks = sheetTareas.getDataRange().getValues().slice(1);
  const studentSubmissions = sheetEntregas.getDataRange().getValues().slice(1).filter(row => row[2] === userId).map(row => row[1]);
  const pendingTasks = allTasks.filter(task => (task[6] === grado && (task[7] === seccion || !task[7])) && !studentSubmissions.includes(task[0]));
  return pendingTasks.map(task => ({ tareaId: task[0], tipo: task[1], titulo: task[2], descripcion: task[3], fechaLimite: task[5] }));
}

function submitAssignment(payload) {
    const { userId, tareaId, fileName, fileMimeType, fileData, respuestaTexto } = payload;
    let fileUrl = "";
    if (fileName && fileData) {
        const decodedData = Utilities.base64Decode(fileData);
        const blob = Utilities.newBlob(decodedData, fileMimeType, fileName);
        const usersData = sheetUsuarios.getDataRange().getValues();
        const userRow = usersData.find(row => row[0] === userId);
        if (!userRow) throw new Error("Usuario no encontrado.");
        const [studentName, studentGrade, studentSection] = [userRow[1], userRow[5], userRow[6]];
        const rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        const gradeFolder = getOrCreateFolder(rootFolder, studentGrade);
        const sectionFolder = getOrCreateFolder(gradeFolder, studentSection);
        const studentFolder = getOrCreateFolder(sectionFolder, studentName);
        const file = studentFolder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileUrl = file.getUrl();
    }
    const entregaId = `ENT-${new Date().getTime()}`;
    const fechaEntrega = new Date();
    sheetEntregas.appendRow([entregaId, tareaId, userId, fechaEntrega, fileUrl, respuestaTexto || "", "Pendiente"]);
    return { message: "Tarea entregada exitosamente." };
}

function getOrCreateFolder(parentFolder, folderName) {
    const folders = parentFolder.getFoldersByName(folderName);
    return folders.hasNext() ? folders.next() : parentFolder.createFolder(folderName);
}

function hashPassword(password, salt) {
  const saltedPassword = password + salt;
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, saltedPassword);
  return hash.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

function generateSalt() {
  const saltBytes = Utilities.getDigest(Utilities.DigestAlgorithm.MD5, Math.random().toString());
  return saltBytes.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

function registerUser(payload) {
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
