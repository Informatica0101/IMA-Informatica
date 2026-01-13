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
  const output = ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Microservicio de Tareas funcionando." }))
    .setMimeType(ContentService.MimeType.TEXT);
  output.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  return output;
}

function doOptions(e) {
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

function doPost(e) {
  let response;
  try {
    const { action, payload } = JSON.parse(e.postData.contents);
    switch (action) {
      case "createTask": response = createTask(payload); break;
      case "getStudentTasks": response = getStudentTasks(payload); break;
      case "submitAssignment": response = submitAssignment(payload); break;
      case "gradeSubmission": response = gradeSubmission(payload); break;
      case "getTeacherActivity": response = getTeacherActivity(); break;
      default:
        response = { status: "error", message: `Acción no reconocida en Task-Service: ${action}` };
    }
  } catch (error) {
    logDebug("Error en doPost:", { message: error.message });
    response = { status: "error", message: "Error interno del servidor." };
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
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
  const mimeMatch = fileInfo[0].match(/:(.*?);/);
  if (!mimeMatch || !mimeMatch[1]) throw new Error("No se pudo extraer el tipo MIME del archivo.");
  const mimeType = mimeMatch[1];
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

  const data = entregasSheet.getDataRange().getValues();
  const headers = data.shift(); // Saca la fila de encabezados

  const calificacionCol = headers.indexOf("Calificación") + 1;
  const estadoCol = headers.indexOf("Estado") + 1;
  const comentarioCol = headers.indexOf("Comentario") + 1;

  if (calificacionCol === 0 || estadoCol === 0 || comentarioCol === 0) {
    throw new Error("No se encontraron las columnas necesarias en la hoja de Entregas.");
  }

  const entregaRow = data.findIndex(row => row[0] === entregaId);

  if (entregaRow !== -1) {
    const rowIndex = entregaRow + 2; // +1 porque findIndex es 0-based, +1 porque quitamos los encabezados
    entregasSheet.getRange(rowIndex, calificacionCol).setValue(calificacion);
    entregasSheet.getRange(rowIndex, estadoCol).setValue(estado);
    entregasSheet.getRange(rowIndex, comentarioCol).setValue(comentario);
    return { status: "success", message: "Calificación actualizada." };
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
      archivoUrl: entrega[4], calificacion: entrega[5], estado: entrega[6], comentario: entrega[7]
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
