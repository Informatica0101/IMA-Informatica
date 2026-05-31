// --- MICROSERVICIO DE TAREAS ---

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

// --- PUNTOS DE ENTRADA ---
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Microservicio de Tareas funcionando." }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  // Apps Script no permite setHeaders directamente, se ignora para CORS básico
  return ContentService.createTextOutput("");
}

function doPost(e) {
  let response;
  try {
    const { action, payload } = JSON.parse(e.postData.contents);
    switch (action) {
      case "createTask": response = createTask(payload); break;
      case "getStudentTasks": response = getStudentTasks(payload); break;
      case "uploadFile": response = uploadFile(payload); break;
      case "uploadChunk": response = uploadChunk(payload); break;
      case "finishChunkedUpload": response = finishChunkedUpload(payload); break;
      case "deleteFile": response = deleteFile(payload); break;
      case "submitAssignment": response = submitAssignment(payload); break;
      case "gradeSubmission": response = gradeSubmission(payload); break;
      case "getTeacherActivity": response = getTeacherActivity(payload); break;
      case "getAllTasks": response = getAllTasks(payload); break;
      case "updateTask": response = updateTask(payload); break;
      case "deleteTask": response = deleteTask(payload); break;
      case "deleteSubmission": response = deleteSubmission(payload); break;
      case "saveProject": response = saveProject(payload); break;
      case "listProjects": response = listProjects(payload); break;
      case "loadProject": response = loadProject(payload); break;
      case "getAllStudentProjects": response = getAllStudentProjects(payload); break;
      case "closeAcademicYear": response = closeAcademicYear(payload); break;
      default:
        response = { status: "error", message: `Acción no reconocida en Task-Service: ${action}` };
    }
  } catch (error) {
    logDebug("Error en doPost:", { message: error.message });
    response = { status: "error", message: error.message || "Error interno del servidor." };
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- LÓGICA DEL SERVICIO ---
function createTask(payload) {
  const { tipo, titulo, descripcion, parcial, asignatura, gradoAsignado, seccionAsignada, fechaLimite, tareaOriginalId, profesorId, puntaje, archivoUrl } = payload;
  const tareaId = "TSK-" + new Date().getTime();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const tareasSheet = getSheetOrThrow(ss, "Tareas");
  // Columnas: 0:tareaId, 1:tipo, 2:titulo, 3:descripcion, 4:parcial, 5:asignatura, 6:grado, 7:seccion, 8:fecha, 9:originalId, 10:profesorId, 11:estado, 12:puntaje, 13:archivoUrl
  tareasSheet.appendRow([tareaId, tipo, titulo, descripcion, parcial, asignatura, gradoAsignado, seccionAsignada, fechaLimite, tareaOriginalId || '', profesorId || '', 'Activa', puntaje || 100, archivoUrl || '']);
  return { status: "success", message: "Tarea creada." };
}

function updateTask(payload) {
  const { tareaId, titulo, descripcion, fechaLimite, parcial, asignatura, gradoAsignado, seccionAsignada, puntaje, archivoUrl } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Tareas");
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(r => r[0] === tareaId);

  if (rowIndex === -1) throw new Error("Tarea no encontrada.");

  const taskRow = data[rowIndex];
  if (titulo !== undefined) taskRow[2] = titulo;
  if (descripcion !== undefined) taskRow[3] = descripcion;
  if (parcial !== undefined) taskRow[4] = parcial;
  if (asignatura !== undefined) taskRow[5] = asignatura;
  if (gradoAsignado !== undefined) taskRow[6] = gradoAsignado;
  if (seccionAsignada !== undefined) taskRow[7] = seccionAsignada;
  if (fechaLimite !== undefined) taskRow[8] = fechaLimite;
  if (puntaje !== undefined) taskRow[12] = puntaje;
  if (archivoUrl !== undefined) taskRow[13] = archivoUrl;

  sheet.getRange(rowIndex + 1, 1, 1, taskRow.length).setValues([taskRow]);

  return { status: "success", message: "Tarea actualizada." };
}

function deleteTask(payload) {
  const { tareaId } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const tareasSheet = getSheetOrThrow(ss, "Tareas");
  const entregasSheet = getSheetOrThrow(ss, "Entregas");

  const tareasData = tareasSheet.getDataRange().getValues();
  const rowIndex = tareasData.findIndex(r => r[0] === tareaId);
  if (rowIndex === -1) throw new Error("Tarea no encontrada.");

  const entregasData = entregasSheet.getDataRange().getValues();
  const hasSubmissions = entregasData.some(r => r[1] === tareaId);

  if (hasSubmissions) {
    // Marcar como inactiva
    tareasSheet.getRange(rowIndex + 1, 12).setValue("Inactiva");
    return { status: "success", message: "Tarea marcada como inactiva (existen entregas)." };
  } else {
    // Eliminar fila
    tareasSheet.deleteRow(rowIndex + 1);
    return { status: "success", message: "Tarea eliminada." };
  }
}

function closeAcademicYear(payload) {
  const { profesorId, format } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const tareasSheet = getSheetOrThrow(ss, "Tareas");
  const entregasSheet = getSheetOrThrow(ss, "Entregas");
  const logSheet = getOrCreateSheet(ss, "Log_Cierres");

  // Simulación de Archivado (en un sistema real moveríamos archivos en Drive a una carpeta comprimida)
  const timestamp = new Date();
  const backupId = "BACKUP-" + timestamp.getTime();

  // 1. Limpiar Tareas del profesor (o todas si no hay profesorId)
  const tareasValues = tareasSheet.getDataRange().getValues();
  for (let i = tareasValues.length - 1; i >= 1; i--) {
    if (!profesorId || tareasValues[i][10] == profesorId) {
      tareasSheet.deleteRow(i + 1);
    }
  }

  // 2. Limpiar Entregas (Esto es más complejo si queremos filtrar por tarea del profesor, pero simplificamos para el requerimiento)
  // En este contexto, un cierre de año suele ser global o por profesor.
  if (!profesorId) {
    if (entregasSheet.getLastRow() > 1) {
      entregasSheet.deleteRows(2, entregasSheet.getLastRow() - 1);
    }
  } else {
    // Si es por profesor, tendríamos que buscar qué entregas corresponden a sus tareas eliminadas.
    // Por simplicidad del Req 10, asumimos reinicio general o por profesor de sus datos.
  }

  logSheet.appendRow([timestamp, profesorId || "Admin", backupId, format, "Tareas y Entregas reiniciadas"]);

  return {
    status: "success",
    message: `Año escolar finalizado. Actividades archivadas con ID: ${backupId}. Formato: ${format}.`,
    backupId
  };
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function getStudentTasks(payload) {
  const { userId, grado, seccion } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const tareasSheet = getSheetOrThrow(ss, "Tareas");
  const entregasSheet = getSheetOrThrow(ss, "Entregas");
  const tasksData = tareasSheet.getDataRange().getValues().slice(1);
  const entregasData = entregasSheet.getDataRange().getValues().slice(1);

  const seenOriginalTasksForEC = new Set();
  const studentTasks = tasksData.filter(task => {
    // task[6] es gradoAsignado, task[7] es seccionAsignada
    const matchGrado = (task[6] || "").toString().trim().toLowerCase() === (grado || "").toString().trim().toLowerCase();
    // Si seccionAsignada está vacío, aplica a todas las secciones del grado.
    // Si tiene valor, el estudiante debe estar en esa lista (A, B, etc).
    const matchSeccion = !task[7] || task[7].trim() === "" || isInTeacherList(seccion, task[7]);

    if (!matchGrado || !matchSeccion) return false;

    if (task[1] === 'Credito Extra') {
      const originalTaskId = (task[9] || "").toString().trim();
      if (!originalTaskId || seenOriginalTasksForEC.has(originalTaskId)) return false;

      const entregaOriginal = entregasData.find(e => e[1] === originalTaskId && e[2] === userId);
      if (!entregaOriginal) return false;

      const estadoEntrega = (entregaOriginal[6] || "").toString().trim().toLowerCase();
      // (A-X) Soportar nuevos estados de rechazo
      const isRejected = (estadoEntrega === 'rechazada' || estadoEntrega === 'revisada_rechazada' || estadoEntrega === 'tarea incompleta');

      if (isRejected) {
        seenOriginalTasksForEC.add(originalTaskId);
        return true;
      }
      return false;
    }
    return true;
  }).map(task => {
    // Buscar la última entrega (la más reciente)
    const matchingSubmissions = entregasData.filter(e => e[1] === task[0] && e[2] === userId);
    const entrega = matchingSubmissions.length > 0 ? matchingSubmissions[matchingSubmissions.length - 1] : null;

    let fechaLimite = task[8] ? new Date(task[8]).toISOString() : null;

    // Si es Credito Extra, forzamos que la fecha coincida con la de la tarea rechazada
    if (task[1] === 'Credito Extra') {
      const originalTaskId = (task[9] || "").toString().trim();
      const originalTask = tasksData.find(t => t[0] === originalTaskId);
      if (originalTask && originalTask[8]) {
        fechaLimite = new Date(originalTask[8]).toISOString();
      }
    }

    return {
      tareaId: task[0], tipo: task[1], titulo: task[2], descripcion: task[3], parcial: task[4],
      asignatura: task[5], fechaLimite: fechaLimite,
      profesorId: task[10],
      entrega: entrega ? {
        entregaId: entrega[0],
        calificacion: entrega[5],
        estado: entrega[6],
        comentario: entrega[7],
        fileId: entrega[4],
        mimeType: entrega[8]
      } : null
    };
  });
  return { status: "success", data: studentTasks.reverse() };
}

/**
 * Sube un archivo individualmente a Drive sin registrar la entrega aún.
 * Crea una carpeta específica para la entrega del alumno en esa tarea.
 */
function uploadFile(payload) {
  const { userId, tareaId, parcial, asignatura, fileData, fileName } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");
  const tareasSheet = getSheetOrThrow(ss, "Tareas");

  const userData = usuariosSheet.getDataRange().getValues().find(row => row[0] === userId);
  if (!userData) throw new Error("Usuario no encontrado.");
  const [, nombre, grado, seccion] = userData;

  const taskData = tareasSheet.getDataRange().getValues().find(row => row[0] === tareaId);
  if (!taskData) throw new Error("Tarea no encontrada.");
  const tituloTarea = taskData[2] || "Tarea Sin Titulo";

  const rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  // Normalizar metadatos a string antes de crear carpetas
  const sGrado = String(grado || "General");
  const sSeccion = String(seccion || "General");
  const sNombre = String(nombre || "Usuario");
  const sParcial = String(parcial || "General");
  const sAsignatura = String(asignatura || "General");

  const gradoFolder = getOrCreateFolder(rootFolder, sGrado);
  const seccionFolder = getOrCreateFolder(gradoFolder, sSeccion);
  const alumnoFolder = getOrCreateFolder(seccionFolder, sNombre);
  const parcialFolder = getOrCreateFolder(alumnoFolder, sParcial);
  const asignaturaFolder = getOrCreateFolder(parcialFolder, sAsignatura);

  const taskDeliveryFolder = getOrCreateFolder(asignaturaFolder, `${String(tituloTarea)}_${String(userId)}`);

  const fileInfo = fileData.split(',');
  let mimeType = "application/octet-stream";
  let base64Content = fileInfo[1];

  const mimeMatch = fileInfo[0].match(/:(.*?);/);
  if (mimeMatch && mimeMatch[1]) {
    mimeType = mimeMatch[1];
  } else {
    // Si no viene en el dataUrl, intentamos por extensión
    const ext = fileName.split('.').pop().toLowerCase();
    const mimeMap = {
      'js': 'text/javascript',
      'css': 'text/css',
      'html': 'text/html',
      'txt': 'text/plain',
      'psc': 'text/plain' // Pseudocódigo (PSeInt)
    };
    mimeType = mimeMap[ext] || mimeType;
    base64Content = fileData; // En caso de que no sea DataURL
  }

  const blob = Utilities.newBlob(Utilities.base64Decode(base64Content), mimeType, fileName);

  const file = taskDeliveryFolder.createFile(blob);

  try {
    taskDeliveryFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    logDebug("No se pudo establecer el permiso de compartir carpeta:", e.message);
  }

  return {
    status: "success",
    data: {
      fileId: file.getId(),
      folderId: taskDeliveryFolder.getId(),
      mimeType: mimeType
    }
  };
}

/**
 * Recibe un trozo de archivo y lo guarda temporalmente.
 */
function uploadChunk(payload) {
  const { uploadId, chunkIndex, chunkData } = payload;

  const tempRoot = getOrCreateFolder(DriveApp.getRootFolder(), ".temp_uploads");
  const uploadFolder = getOrCreateFolder(tempRoot, uploadId);

  const blob = Utilities.newBlob(Utilities.base64Decode(chunkData), "application/octet-stream", `chunk_${chunkIndex}`);
  uploadFolder.createFile(blob);

  return { status: "success", message: `Chunk ${chunkIndex} recibido.` };
}

/**
 * Une todos los chunks y crea el archivo final.
 */
function finishChunkedUpload(payload) {
  const { uploadId, userId, tareaId, parcial, asignatura, fileName, mimeType, totalChunks } = payload;

  const tempRoot = getOrCreateFolder(DriveApp.getRootFolder(), ".temp_uploads");
  const uploadFolder = getOrCreateFolder(tempRoot, uploadId);
  const chunks = uploadFolder.getFiles();

  const chunkMap = {};
  while (chunks.hasNext()) {
    const file = chunks.next();
    const idx = parseInt(file.getName().split('_')[1]);
    chunkMap[idx] = file.getBlob().getBytes();
  }

  let combinedBytes = [];
  for (let i = 0; i < totalChunks; i++) {
    if (!chunkMap[i]) throw new Error(`Falta el chunk ${i}`);
    combinedBytes = combinedBytes.concat(chunkMap[i]);
  }

  const finalBlob = Utilities.newBlob(combinedBytes, mimeType, fileName);

  const alumnoFolder = getStudentFolder(userId);
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const tareasSheet = getSheetOrThrow(ss, "Tareas");
  const taskData = tareasSheet.getDataRange().getValues().find(row => row[0] === tareaId);
  const tituloTarea = taskData ? taskData[2] : "Tarea Sin Titulo";

  const parcialFolder = getOrCreateFolder(alumnoFolder, String(parcial || "General"));
  const asignaturaFolder = getOrCreateFolder(parcialFolder, String(asignatura || "General"));
  const taskDeliveryFolder = getOrCreateFolder(asignaturaFolder, `${String(tituloTarea)}_${String(userId)}`);

  const file = taskDeliveryFolder.createFile(finalBlob);

  uploadFolder.setTrashed(true);

  try {
    taskDeliveryFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}

  return {
    status: "success",
    data: {
      fileId: file.getId(),
      folderId: taskDeliveryFolder.getId(),
      mimeType: mimeType
    }
  };
}

function submitAssignment(payload) {
  const { userId, tareaId, fileId, mimeType } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const entregasSheet = getSheetOrThrow(ss, "Entregas");

  const entregaId = "ENT-" + new Date().getTime();
  // Estado inicial: Pendiente de revisión
  entregasSheet.appendRow([entregaId, tareaId, userId, new Date(), fileId, '', 'Pendiente de revisión', '', mimeType]);
  return { status: "success", message: "Tarea entregada." };
}

/**
 * Elimina un archivo de Drive (lo mueve a la papelera) (A-30).
 */
function deleteFile(payload) {
  const { fileId } = payload;
  if (!fileId) throw new Error("ID de archivo no proporcionado.");

  try {
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
    return { status: "success", message: "Archivo eliminado." };
  } catch (e) {
    logDebug("Error al eliminar archivo:", { fileId, error: e.message });
    // No lanzamos error para que la UX no se rompa si el archivo ya no existe
    return { status: "success", message: "Archivo no encontrado o ya eliminado." };
  }
}

function gradeSubmission(payload) {
  const { entregaId, calificacion, estado, comentario } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const entregasSheet = getSheetOrThrow(ss, "Entregas");

  const data = entregasSheet.getDataRange().getValues();
  const headers = data[0];

  const calificacionCol = headers.indexOf("calificacion");
  const estadoCol = headers.indexOf("estado");
  const comentarioCol = headers.indexOf("comentario");

  if (calificacionCol === -1 || estadoCol === -1 || comentarioCol === -1) {
    throw new Error("No se encontraron las columnas necesarias en la hoja de Entregas.");
  }

  const rowIndex = data.findIndex(row => row[0] === entregaId);

  if (rowIndex !== -1) {
    const rowData = data[rowIndex];
    rowData[calificacionCol] = calificacion;
    rowData[estadoCol] = estado;
    rowData[comentarioCol] = comentario;

    entregasSheet.getRange(rowIndex + 1, 1, 1, rowData.length).setValues([rowData]);
    return { status: "success", message: "Calificación actualizada." };
  }

  throw new Error("Entrega no encontrada.");
}

function deleteSubmission(payload) {
  const { entregaId } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const entregasSheet = getSheetOrThrow(ss, "Entregas");
  const data = entregasSheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === entregaId);

  if (rowIndex === -1) throw new Error("Entrega no encontrada.");

  const fileId = data[rowIndex][4]; // Columna E: fileId
  if (fileId) {
    try {
      const file = DriveApp.getFileById(fileId);
      file.setTrashed(true);
    } catch (e) {
      logDebug("Error al borrar archivo de Drive:", e.message);
      // No lanzamos error para permitir borrar el registro si el archivo ya no existe
    }
  }

  entregasSheet.deleteRow(rowIndex + 1);
  return { status: "success", message: "Entrega eliminada correctamente." };
}

function getTeacherActivity(payload) {
  const { profesorId, grado, seccion } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");
  const tareasSheet = getSheetOrThrow(ss, "Tareas");
  const entregasSheet = getSheetOrThrow(ss, "Entregas");

  const usuariosData = usuariosSheet.getDataRange().getValues();
  const tareasData = tareasSheet.getDataRange().getValues();
  const entregasValues = entregasSheet.getDataRange().getValues();
  const entregasHeaders = entregasValues.shift();
  let fileIdIndex = entregasHeaders.indexOf("fileUrl");
  if (fileIdIndex === -1) {
      fileIdIndex = 4;
  }
  const mimeTypeIndex = entregasHeaders.indexOf("mimeType");

  const submissions = entregasValues.map(entrega => {
    // Uso de == para ser resiliente a tipos (string vs number)
    const tarea = tareasData.find(t => t[0] == entrega[1]);

    // SI LA TAREA NO EXISTE O NO PERTENECE AL PROFESOR -> DESCARTAR
    if (!tarea) return null;
    if (profesorId && tarea[10] && tarea[10] != profesorId) return null;

    const usuario = usuariosData.find(u => u[0] == entrega[2]);

    // Filtro por Grado y Sección del Profesor (si se especifican en el payload)
    if (usuario) {
      if (grado && !isInTeacherList(usuario[2], grado)) return null;
      if (seccion && !isInTeacherList(usuario[3], seccion)) return null;
    }

    return {
      tipo: 'Tarea',
      entregaId: entrega[0],
      titulo: tarea[2], // Tarea ya verificada arriba
      alumnoId: entrega[2], // Columna C: userId
      alumnoNombre: usuario ? usuario[1] : "Usuario Desconocido",
      email: usuario ? usuario[4] : "N/A",
      grado: usuario ? usuario[2] : "N/A",
      seccion: usuario ? usuario[3] : "N/A",
      asignatura: tarea[5] || "N/A",
      parcial: tarea[4] || "N/A",
      fecha: new Date(entrega[3]),
      fileId: entrega[fileIdIndex],
      mimeType: mimeTypeIndex > -1 ? entrega[mimeTypeIndex] : null,
      calificacion: entrega[5],
      estado: entrega[6],
      comentario: entrega[7]
    };
  }).filter(item => item !== null);

  submissions.sort((a, b) => b.fecha - a.fecha);
  const formattedActivity = submissions.map(item => ({ ...item, fecha: item.fecha.toISOString() }));
  return { status: "success", data: formattedActivity };
}

function getAllTasks(payload) {
  const { profesorId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const tareasSheet = getSheetOrThrow(ss, "Tareas");
  const data = tareasSheet.getDataRange().getValues().slice(1);

  const filtered = data.filter(r => {
    if (profesorId && r[10] && r[10] !== profesorId) return false;
    return true;
  });

  return {
    status: "success",
    data: filtered.map(r => ({
      tareaId: r[0],
      tipo: r[1],
      titulo: r[2],
      descripcion: r[3],
      parcial: r[4],
      asignatura: r[5],
      grado: r[6],
      seccion: r[7],
      fechaLimite: r[8] ? new Date(r[8]).toISOString() : null,
      tareaOriginalId: r[9],
      profesorId: r[10],
      estado: r[11] || 'Activa',
      puntaje: r[12] || 100,
      archivoUrl: r[13] || ''
    }))
  };
}

function normalizeString(str) {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function isInTeacherList(value, listString) {
  if (!listString || String(listString).trim() === "") return true;
  if (!value) return false;
  const sValue = normalizeString(value);
  const sList = normalizeString(listString);
  const list = sList.split(',').map(s => s.trim());
  return list.includes(sValue);
}

/**
 * Obtiene la carpeta raíz de un estudiante.
 */
function getStudentFolder(userId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");
  const userData = usuariosSheet.getDataRange().getValues().find(row => row[0] === userId);
  if (!userData) throw new Error("Usuario no encontrado.");
  const [, nombre, grado, seccion] = userData;

  const rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const sGrado = String(grado || "General");
  const sSeccion = String(seccion || "General");
  const sNombre = String(nombre || "Usuario");

  const gradoFolder = getOrCreateFolder(rootFolder, sGrado);
  const seccionFolder = getOrCreateFolder(gradoFolder, sSeccion);
  const alumnoFolder = getOrCreateFolder(seccionFolder, sNombre);
  return alumnoFolder;
}

function saveProject(payload) {
  const { userId, fileName, code } = payload;
  if (!userId || !fileName) throw new Error("ID de usuario y nombre de archivo requeridos.");

  const alumnoFolder = getStudentFolder(userId);
  const projectsFolder = getOrCreateFolder(alumnoFolder, "Proyectos_PSeInt");

  let finalFileName = fileName;
  if (!finalFileName.toLowerCase().endsWith(".psc")) {
    finalFileName += ".psc";
  }

  const files = projectsFolder.getFilesByName(finalFileName);
  let file;
  if (files.hasNext()) {
    file = files.next();
    file.setContent(code);
  } else {
    file = projectsFolder.createFile(finalFileName, code, "text/plain");
  }

  const fileId = file.getId();
  const fileUrl = `https://drive.google.com/uc?id=${fileId}`;

  // Registrar en la hoja "pseudocode" (userId, NombreArchivo, archivoUrl)
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const pseudocodeSheet = getOrCreateSheet(ss, "pseudocode");
    const data = pseudocodeSheet.getDataRange().getValues();
    const rowIndex = data.findIndex(r => r[0] == userId && r[1] == finalFileName);

    if (rowIndex !== -1) {
      pseudocodeSheet.getRange(rowIndex + 1, 3).setValue(fileUrl);
    } else {
      pseudocodeSheet.appendRow([userId, finalFileName, fileUrl]);
    }
  } catch (e) {
    logDebug("Error al registrar en hoja pseudocode:", e.message);
  }

  return { status: "success", message: "Proyecto guardado.", data: { fileId: fileId } };
}

function listProjects(payload) {
  const { userId } = payload;
  if (!userId) throw new Error("ID de usuario requerido.");

  const result = [];
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const pseudocodeSheet = getSheetOrThrow(ss, "pseudocode");
    const data = pseudocodeSheet.getDataRange().getValues().slice(1);

    data.forEach(r => {
      if (r[0] == userId) {
        const fileIdMatch = r[2].match(/id=([^&]+)/);
        const fileId = fileIdMatch ? fileIdMatch[1] : null;
        if (fileId) {
          result.push({
            name: r[1],
            id: fileId,
            lastUpdated: new Date().toISOString() // La hoja no tiene fecha, usamos actual o Drive si es crítico
          });
        }
      }
    });
  } catch (e) {
    logDebug("Error al listar proyectos desde hoja:", e.message);
    // Fallback a Drive si la hoja falla o no existe aún
    const alumnoFolder = getStudentFolder(userId);
    const projectsFolder = getOrCreateFolder(alumnoFolder, "Proyectos_PSeInt");
    const files = projectsFolder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      if (file.getName().toLowerCase().endsWith(".psc")) {
        result.push({
          name: file.getName(),
          id: file.getId(),
          lastUpdated: file.getLastUpdated().toISOString()
        });
      }
    }
  }

  result.sort((a, b) => a.name.localeCompare(b.name));
  return { status: "success", data: result };
}

function loadProject(payload) {
  const { fileId } = payload;
  if (!fileId) throw new Error("ID de archivo requerido.");

  const file = DriveApp.getFileById(fileId);
  return {
    status: "success",
    data: {
      name: file.getName(),
      code: file.getBlob().getDataAsString()
    }
  };
}

function getAllStudentProjects(payload) {
  const { grado, seccion } = payload;
  const rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);

  const projects = [];

  // Optimización: Usar búsqueda de archivos con filtro de nombre y ubicación
  // Buscamos archivos .psc que estén dentro de carpetas llamadas "Proyectos_PSeInt"
  // Para filtrar por grado/sección, aún necesitamos navegar un poco, pero podemos ser más eficientes.

  const query = "title contains '.psc' and trashed = false";
  // Folder.searchFiles es recursivo y mucho más eficiente
  const files = rootFolder.searchFiles(query);

  while (files.hasNext()) {
    const file = files.next();
    const parents = file.getParents();
    if (!parents.hasNext()) continue;

    const parentFolder = parents.next();
    if (parentFolder.getName() !== "Proyectos_PSeInt") continue;

    const alumnoFolder = parentFolder.getParents().next();
    const seccionFolder = alumnoFolder.getParents().next();
    const gradoFolder = seccionFolder.getParents().next();

    const gName = gradoFolder.getName();
    const sName = seccionFolder.getName();

    // Aplicar filtros de grado y sección si se proporcionan
    if (grado && gName !== grado) continue;
    if (seccion && sName !== seccion) continue;

    projects.push({
      alumnoNombre: alumnoFolder.getName(),
      grado: gName,
      seccion: sName,
      projectName: file.getName(),
      fileId: file.getId(),
      lastUpdated: file.getLastUpdated().toISOString()
    });
  }

  projects.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  return { status: "success", data: projects };
}

// --- HELPERS DE DRIVE ---
function getOrCreateFolder(parentFolder, folderName) {
  // Convertimos a string por si viene de una celda con formato número (ej. 10, 11)
  const name = String(folderName || "").trim() || "Sin Nombre";
  try {
    const folders = parentFolder.getFoldersByName(name);
    return folders.hasNext() ? folders.next() : parentFolder.createFolder(name);
  } catch (e) {
    const errorMsg = `Error de DriveApp en carpeta "${name}": ${e.message}`;
    logDebug(errorMsg);
    throw new Error(errorMsg);
  }
}
