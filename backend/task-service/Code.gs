// --- MICROSERVICIO DE TAREAS ---

// --- SECCIÓN DE CONFIGURACIÓN Y DEPENDENCIAS COMUNES ---
const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DRIVE_FOLDER_ID = "1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB";
const DEBUG_MODE = true;

function logDebug(message, optionalParam) {
  if (DEBUG_MODE) {
    let logMessage = `[TASK-SVC] ${new Date().toLocaleTimeString()} - ${message}`;
    if (optionalParam !== undefined) {
      try { logMessage += ` | ${JSON.stringify(optionalParam, null, 2)}`; } catch (e) { logMessage += ` | [Parámetro no serializable]`; }
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
  return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Microservicio de Tareas funcionando." }))
    .setMimeType(ContentService.MimeType.TEXT);
}

function doOptions() {
  return ContentService.createTextOutput().setHeaders({
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json'
  });
}

function doPost(e) {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  try {
    const { action, payload } = JSON.parse(e.postData.contents);
    let result;
    switch (action) {
      case "createTask": result = createTask(payload); break;
      case "getStudentTasks": result = getStudentTasks(payload); break;
      case "submitAssignment": result = submitAssignment(payload); break;
      case "gradeSubmission": result = gradeSubmission(payload); break;
      case "getTeacherActivity": result = getTeacherActivity(); break;
      default:
        result = { status: "error", message: `Acción no reconocida en Task-Service: ${action}` };
    }
    // Para evitar errores de CORS con Google Apps Script, la respuesta debe ser texto plano.
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    logDebug("Error en doPost:", { message: error.message });
    // También en caso de error, devolver texto plano.
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.message })).setMimeType(ContentService.MimeType.TEXT);
  }
}

// --- LÓGICA DEL SERVICIO ---
function createTask(payload) {
  const { tipo, titulo, descripcion, parcial, asignatura, gradoAsignado, seccionAsignada, fechaLimite, tareaOriginalId } = payload;
  const tareaId = "TSK-" + new Date().getTime();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const tareasSheet = getSheetOrThrow(ss, "Tareas");
  tareasSheet.appendRow([tareaId, tipo, titulo, descripcion, parcial, asignatura, gradoAsignado, seccionAsignada, fechaLimite, tareaOriginalId || '']);
  return { status: "success", message: "Tarea creada." };
}

function getStudentTasks(payload) {
  const { userId, grado, seccion } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const tareasSheet = getSheetOrThrow(ss, "Tareas");
  const entregasSheet = getSheetOrThrow(ss, "Entregas");
  const tasksData = tareasSheet.getDataRange().getValues().slice(1);
  const entregasData = entregasSheet.getDataRange().getValues().slice(1);

  const studentTasks = tasksData.filter(task => {
    const isForStudent = task[6] === grado && (task[7] === seccion || task[7] === "" || !task[7]);
    if (!isForStudent) return false;
    if (task[1] === 'Credito Extra') {
      const tareaOriginalId = task[9];
      if (!tareaOriginalId) return false;
      const entregaOriginal = entregasData.find(e => e[1] === tareaOriginalId && e[2] === userId);
      return entregaOriginal && entregaOriginal[6] === 'Rechazada';
    }
    return true;
  }).map(task => {
    const entrega = entregasData.find(e => e[1] === task[0] && e[2] === userId);
    return {
      tareaId: task[0], tipo: task[1], titulo: task[2], descripcion: task[3], parcial: task[4],
      asignatura: task[5], fechaLimite: task[8],
      entrega: entrega ? { calificacion: entrega[5], estado: entrega[6], comentario: entrega[7] } : null
    };
  });
  return { status: "success", data: studentTasks.reverse() };
}

function submitAssignment(payload) {
  const { userId, tareaId, parcial, asignatura, fileData, fileName } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");
  const tareasSheet = getSheetOrThrow(ss, "Tareas");
  const entregasSheet = getSheetOrThrow(ss, "Entregas");

  const userData = usuariosSheet.getDataRange().getValues().find(row => row[0] === userId);
  if (!userData) throw new Error("Usuario no encontrado.");
  const [, nombre, grado, seccion] = userData;

  const taskData = tareasSheet.getDataRange().getValues().find(row => row[0] === tareaId);
  if (!taskData) throw new Error("Tarea no encontrada.");
  const [, , tituloTarea] = taskData;

  const rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const gradoFolder = getOrCreateFolder(rootFolder, grado);
  const seccionFolder = getOrCreateFolder(gradoFolder, seccion || 'General');
  const alumnoFolder = getOrCreateFolder(seccionFolder, nombre);
  const parcialFolder = getOrCreateFolder(alumnoFolder, parcial);
  const asignaturaFolder = getOrCreateFolder(parcialFolder, asignatura);

  const fileInfo = fileData.split(',');
  const mimeType = fileInfo[0].match(/:(.*?);/)[1];
  const blob = Utilities.newBlob(Utilities.base64Decode(fileInfo[1]), mimeType, fileName).setName(tituloTarea);
  const fileUrl = asignaturaFolder.createFile(blob).getUrl();

  const entregaId = "ENT-" + new Date().getTime();
  entregasSheet.appendRow([entregaId, tareaId, userId, new Date(), fileUrl, '', 'Pendiente', '']);
  return { status: "success", message: "Tarea entregada." };
}

function gradeSubmission(payload) {
  const { entregaId, calificacion, estado, comentario } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const entregasSheet = getSheetOrThrow(ss, "Entregas");
  const entregasData = entregasSheet.getDataRange().getValues();
  for (let i = 1; i < entregasData.length; i++) {
    if (entregasData[i][0] === entregaId) {
      entregasSheet.getRange(i + 1, 6, 1, 3).setValues([[calificacion, estado, comentario]]);
      return { status: "success", message: "Calificación actualizada." };
    }
  }
  throw new Error("Entrega no encontrada.");
}

function getTeacherActivity() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");
  const tareasSheet = getSheetOrThrow(ss, "Tareas");
  const entregasSheet = getSheetOrThrow(ss, "Entregas");

  const usuariosData = usuariosSheet.getDataRange().getValues();
  const tareasData = tareasSheet.getDataRange().getValues();
  const entregasData = entregasSheet.getDataRange().getValues().slice(1);

  const submissions = entregasData.map(entrega => {
    const usuario = usuariosData.find(u => u[0] === entrega[2]);
    const tarea = tareasData.find(t => t[0] === entrega[1]);
    return {
      tipo: 'Tarea', entregaId: entrega[0], titulo: tarea ? tarea[2] : "Tarea Desconocida",
      alumnoNombre: usuario ? usuario[1] : "Usuario Desconocido", fecha: new Date(entrega[3]),
      archivoUrl: entrega[4], calificacion: entrega[5], estado: entrega[6], comentario: entrega[7],
      grado: usuario ? usuario[2] : "N/A",
      seccion: usuario ? usuario[3] : "N/A",
      asignatura: tarea ? tarea[5] : "N/A"
    };
  });

  // En un futuro, este servicio podría llamar al Exam-Service para obtener las entregas de exámenes.
  // Por ahora, solo devuelve las de tareas.
  submissions.sort((a, b) => b.fecha - a.fecha);
  const formattedActivity = submissions.map(item => ({ ...item, fecha: item.fecha.toLocaleString() }));
  return { status: "success", data: formattedActivity };
}

// --- HELPERS DE DRIVE ---
function getOrCreateFolder(parentFolder, folderName) {
  if (!folderName || typeof folderName !== 'string' || folderName.trim() === '') throw new Error("El nombre de la carpeta no puede estar vacío.");
  const folders = parentFolder.getFoldersByName(folderName.trim());
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(folderName.trim());
}
