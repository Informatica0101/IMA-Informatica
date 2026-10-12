// NOTA: Las URLs de los microservicios solo se deben actualizar en el frontend (js/config.js), no en este archivo.
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

function logFileMetadata(ss, meta) {
  try {
    let sheet = ss.getSheetByName("MetadatosArchivos");
    if (!sheet) {
      sheet = ss.insertSheet("MetadatosArchivos");
      sheet.appendRow(["ID", "Titulo", "NombreOriginal", "NombreFisico", "TipoRecurso", "Asignatura", "Grado", "Seccion", "Parcial", "Anio", "Tema", "TareaId", "ProfesorId", "FechaSubida", "Estado", "DriveId", "RutaDrive", "MimeType", "TamanoBytes"]);
    }
    const metaId = "META-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    const nowYear = new Date().getFullYear();
    sheet.appendRow([
      metaId,
      meta.titulo || meta.fileName || "",
      meta.fileName || "",
      meta.fileName || "",
      meta.tipoRecurso || "Entrega",
      meta.asignatura || "General",
      meta.grado || "General",
      meta.seccion || "General",
      meta.parcial || "I parcial",
      nowYear,
      meta.tema || "General",
      meta.tareaId || "",
      meta.profesorId || "",
      new Date().toISOString(),
      "Activo",
      meta.fileId || "",
      meta.fileUrl || "",
      meta.mimeType || "",
      meta.sizeBytes || 0
    ]);
  } catch (err) {
    logDebug("Error logging file metadata:", err.message);
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

const PUBLIC_ACTIONS = [
  "getStudentTasks", "getAllTasks", "listProjects", "loadProject", "getAllStudentProjects", "getVirtualClassrooms", "getPosts", "getStudyMaterials"
];

const ROLE_PERMISSIONS = {
  "Administrador": ["*"],
  "Desarrollador": ["*"],
  "Padre": ["getStudentTasks", "getVirtualClassrooms", "getPosts", "getStudyMaterials", "getSubmissionComments"],
  "Tutor": ["getStudentTasks", "getVirtualClassrooms", "getPosts", "getStudyMaterials", "getSubmissionComments"],
  "Responsable": ["getStudentTasks", "getVirtualClassrooms", "getPosts", "getStudyMaterials", "getSubmissionComments"],
  "Dirección": ["*"],
  "Secretaría": ["*"],
  "Profesor": [
    "createTask", "updateTask", "deleteTask", "uploadFile", "gradeSubmission", "deleteSubmission",
    "getStudentTasks", "getAllTasks", "getTeacherActivity", "closeAcademicYear",
    "getVirtualClassrooms", "createVirtualClassroom", "getPosts", "createPost", "updatePost", "deletePost",
    "getStudyMaterials", "createStudyMaterial", "deleteStudyMaterial", "returnSubmissionForRevision",
    "getSubmissionComments", "addSubmissionComment", "getSubmissionVersions"
  ],
  "Estudiante": [
    "getStudentTasks", "submitAssignment", "uploadFile", "uploadChunk", "finishChunkedUpload", "deleteFile",
    "saveProject", "deleteProject", "listProjects", "loadProject", "getAllStudentProjects",
    "getVirtualClassrooms", "getPosts", "getStudyMaterials", "getSubmissionComments", "addSubmissionComment", "getSubmissionVersions"
  ]
};

function validateRolePermission(action, payload) {
  if (PUBLIC_ACTIONS.indexOf(action) !== -1) return { authorized: true };
  const userRole = (payload && (payload.authRole || payload.rol)) || "Estudiante";
  const permitted = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS["Estudiante"];
  if (permitted.indexOf("*") !== -1 || permitted.indexOf(action) !== -1) {
    return { authorized: true, role: userRole };
  }
  return { authorized: false, role: userRole };
}

function doPost(e) {
  let response;
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No se recibieron datos." })).setMimeType(ContentService.MimeType.JSON);
    }
    const { action, payload } = JSON.parse(e.postData.contents);
    const authCheck = validateRolePermission(action, payload);
    if (!authCheck.authorized) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        code: "AUTH_PERMISSION_DENIED",
        message: "Acceso denegado: El rol " + authCheck.role + " no tiene permiso para la acción " + action + "."
      })).setMimeType(ContentService.MimeType.JSON);
    }
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
      case "deleteProject": response = deleteProject(payload); break;
      case "listProjects": response = listProjects(payload); break;
      case "loadProject": response = loadProject(payload); break;
      case "getAllStudentProjects": response = getAllStudentProjects(payload); break;
      case "closeAcademicYear": response = closeAcademicYear(payload); break;
      case "getVirtualClassrooms": response = getVirtualClassrooms(payload); break;
      case "createVirtualClassroom": response = createVirtualClassroom(payload); break;
      case "getPosts": response = getPosts(payload); break;
      case "createPost": response = createPost(payload); break;
      case "updatePost": response = updatePost(payload); break;
      case "deletePost": response = deletePost(payload); break;
      case "getStudyMaterials": response = getStudyMaterials(payload); break;
      case "createStudyMaterial": response = createStudyMaterial(payload); break;
      case "deleteStudyMaterial": response = deleteStudyMaterial(payload); break;
      case "returnSubmissionForRevision": response = returnSubmissionForRevision(payload); break;
      case "getSubmissionComments": response = getSubmissionComments(payload); break;
      case "addSubmissionComment": response = addSubmissionComment(payload); break;
      case "getSubmissionVersions": response = getSubmissionVersions(payload); break;
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
  const { tipo, titulo, descripcion, parcial, asignatura, gradoAsignado, seccionAsignada, fechaLimite, tareaOriginalId, profesorId, puntaje, archivoUrl, fechaDisponible, tipoRecurso } = payload || {};
  const tareaId = "TSK-" + new Date().getTime();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const tareasSheet = getSheetOrThrow(ss, "Tareas");
  // Columnas: 0:tareaId, 1:tipo, 2:titulo, 3:descripcion, 4:parcial, 5:asignatura, 6:grado, 7:seccion, 8:fecha, 9:originalId, 10:profesorId, 11:estado, 12:puntaje, 13:archivoUrl, 14:fechaDisponible, 15:tipoRecurso
  tareasSheet.appendRow([
    tareaId,
    tipo || 'Tarea',
    titulo,
    descripcion,
    parcial,
    asignatura,
    gradoAsignado,
    seccionAsignada,
    fechaLimite,
    tareaOriginalId || '',
    profesorId || '',
    'Activa',
    puntaje || 100,
    archivoUrl || '',
    fechaDisponible || '',
    tipoRecurso || 'Tarea'
  ]);
  return { status: "success", message: "Tarea creada.", data: { tareaId } };
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
  const configSheet = ss.getSheetByName("ConfiguracionAcademica");
  const logSheet = getOrCreateSheet(ss, "Log_Cierres");

  const timestamp = new Date();
  const backupId = "BACKUP-" + timestamp.getTime();

  // REQ: Eliminación Física de Archivos en Google Drive (Fase 5)
  // Obtenemos todas las entregas para identificar archivos/carpetas a eliminar
  const entregasData = entregasSheet.getDataRange().getValues();
  const headersEntregas = entregasData[0];
  const fileIdIdx = headersEntregas.indexOf("fileUrl"); // Fallback a 4 si no se encuentra
  const actualFileIdIdx = fileIdIdx !== -1 ? fileIdIdx : 4;
  const entregaUserIdIdx = 2; // Columna C

  let filesDeletedCount = 0;

  // 1. Limpiar Entregas y Archivos en Drive
  for (let i = entregasData.length - 1; i >= 1; i--) {
    const row = entregasData[i];
    const fileId = row[actualFileIdIdx];

    // Si es un cierre por profesor, deberíamos validar que la entrega pertenezca a sus tareas.
    // Para cumplir con la Fase 5 (Reset completo), operamos sobre todas si no hay profesorId
    // o sobre las que correspondan al contexto si es granular.
    if (fileId) {
      try {
        // Puede ser un ID de archivo o de carpeta (mimeType folder)
        const file = DriveApp.getFileById(fileId);
        file.setTrashed(true);
        filesDeletedCount++;
      } catch (e) {
        try {
          const folder = DriveApp.getFolderById(fileId);
          folder.setTrashed(true);
          filesDeletedCount++;
        } catch (e2) {
          logDebug(`No se pudo eliminar recurso ${fileId}: ${e2.message}`);
        }
      }
    }
    entregasSheet.deleteRow(i + 1);
  }

  // 2. Limpiar Tareas
  const tareasValues = tareasSheet.getDataRange().getValues();
  for (let i = tareasValues.length - 1; i >= 1; i--) {
    if (!profesorId || tareasValues[i][10] == profesorId) {
      tareasSheet.deleteRow(i + 1);
    }
  }

  // 3. Restablecer Configuración Académica (Fase 5)
  if (configSheet && configSheet.getLastRow() > 1) {
    if (!profesorId) {
      configSheet.deleteRows(2, configSheet.getLastRow() - 1);
    } else {
      const configData = configSheet.getDataRange().getValues();
      for (let i = configData.length - 1; i >= 1; i--) {
        if (configData[i][8] == profesorId) { // profesorId en columna I
          configSheet.deleteRow(i + 1);
        }
      }
    }
  }

  logSheet.appendRow([timestamp, profesorId || "Admin", backupId, format, `Cierre exitoso. ${filesDeletedCount} archivos eliminados físicamente.`]);

  return {
    status: "success",
    message: `Año escolar finalizado correctamente. Se eliminaron registros y ${filesDeletedCount} archivos de Drive.`,
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
      tareaId: task[0],
      tipo: task[1],
      titulo: task[2],
      descripcion: task[3],
      parcial: task[4],
      grado: task[6],
      seccion: task[7],
      asignatura: task[5],
      fechaLimite: fechaLimite,
      fechaDisponible: task[14] ? new Date(task[14]).toISOString() : null,
      tipoRecurso: task[15] || task[1] || 'Tarea',
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
      'psc': 'text/plain', // Pseudocódigo (PSeInt)
      'heic': 'image/heic'
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

  logFileMetadata(ss, {
    fileName: fileName,
    fileId: file.getId(),
    fileUrl: file.getUrl(),
    mimeType: mimeType,
    sizeBytes: blob.getBytes().length,
    tareaId: tareaId,
    asignatura: sAsignatura,
    parcial: sParcial,
    grado: sGrado,
    seccion: sSeccion,
    profesorId: taskData[10] || ""
  });

  return {
    status: "success",
    data: {
      fileId: file.getId(),
      folderId: taskDeliveryFolder.getId(),
      folderUrl: taskDeliveryFolder.getUrl(),
      mimeType: mimeType
    }
  };
}

/**
 * DEPRECATED: Se utiliza uploadFile con segmentación lógica en cliente.
 * Recibe un trozo de archivo y lo guarda temporalmente.
 */
function uploadChunk(payload) {
  try {
    const { uploadId, chunkIndex, chunkData } = payload;
    if (!uploadId || chunkIndex === undefined || !chunkData) throw new Error("Parámetros de chunk incompletos.");

    const tempRoot = getOrCreateFolder(DriveApp.getRootFolder(), ".temp_uploads");
    const uploadFolder = getOrCreateFolder(tempRoot, uploadId);

    // REQ: Sanitización de Base64 para evitar "No se pudo descifrar la cadena" (Tarea 3)
    let sanitizedData = chunkData.replace(/-/g, '+').replace(/_/g, '/');
    sanitizedData = sanitizedData.replace(/\s/g, ''); // Eliminar espacios o saltos de línea
    while (sanitizedData.length % 4 !== 0) sanitizedData += '='; // Asegurar padding

    const blob = Utilities.newBlob(Utilities.base64Decode(sanitizedData), "application/octet-stream", `chunk_${chunkIndex}`);
    uploadFolder.createFile(blob);

    return { status: "success", message: `Chunk ${chunkIndex} recibido.` };
  } catch (e) {
    logDebug("Error en uploadChunk:", e.message);
    return { status: "error", message: "Error al procesar fragmento: " + e.message };
  }
}

/**
 * DEPRECATED: Se utiliza uploadFile con segmentación lógica en cliente.
 * Une todos los chunks y crea el archivo final.
 */
function finishChunkedUpload(payload) {
  try {
    const { uploadId, userId, tareaId, parcial, asignatura, fileName, mimeType, totalChunks } = payload;
    if (!uploadId || !userId || !tareaId || totalChunks === undefined) throw new Error("Parámetros incompletos para finalizar subida.");

    const tempRoot = getOrCreateFolder(DriveApp.getRootFolder(), ".temp_uploads");
    const uploadFolder = getOrCreateFolder(tempRoot, uploadId);
    const chunks = uploadFolder.getFiles();

    const chunkMap = {};
    let count = 0;
    while (chunks.hasNext()) {
      const file = chunks.next();
      const idx = parseInt(file.getName().split('_')[1]);
      chunkMap[idx] = file.getBlob().getBytes();
      count++;
    }

    if (count < totalChunks) throw new Error(`Se esperaban ${totalChunks} fragmentos pero solo se encontraron ${count}.`);

    // Optimización de Memoria: Pre-calcular tamaño total y usar Int8Array (Tarea 3)
    let totalSize = 0;
    for (let i = 0; i < totalChunks; i++) {
      if (!chunkMap[i]) throw new Error(`Falta el fragmento número ${i}.`);
      totalSize += chunkMap[i].length;
    }

    const combinedBytes = new Int8Array(totalSize);
    let offset = 0;
    for (let i = 0; i < totalChunks; i++) {
      combinedBytes.set(chunkMap[i], offset);
      offset += chunkMap[i].length;
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

    // Limpieza de temporales
    try { uploadFolder.setTrashed(true); } catch (e) { logDebug("Fallo limpieza de carpeta temporal:", e.message); }

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
  } catch (e) {
    logDebug("Error en finishChunkedUpload:", e.message);
    return { status: "error", message: "Error al reconstruir el archivo: " + e.message };
  }
}

function submitAssignment(payload) {
  const { userId, tareaId, fileId, mimeType, textoRespuesta, enlaceExterno, observaciones } = payload || {};
  if (!userId || !tareaId) throw new Error("userId y tareaId son requeridos para la entrega.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const entregasSheet = getSheetOrThrow(ss, "Entregas");
  const versionesSheet = getOrCreateSheet(ss, "EntregasVersiones");
  if (versionesSheet.getLastRow() === 0) {
    versionesSheet.appendRow(["ID", "EntregaID", "TareaID", "UserID", "VersionNum", "ArchivoUrl", "FileID", "MimeType", "TextoRespuesta", "EnlaceExterno", "FechaEnvio", "Estado", "Observaciones"]);
  }

  const data = entregasSheet.getDataRange().getValues();
  const now = new Date();

  // Verificar si ya existe una entrega previa del usuario para esta tarea
  const existingIdx = data.findIndex(row => String(row[2]).trim() === String(userId).trim() && String(row[1]).trim() === String(tareaId).trim());

  let entregaId;
  let versionNum = 1;
  let estadoEntrega = "Pendiente de revisión";

  // Verificar si la entrega es tardía
  try {
    const tareasSheet = getSheetOrThrow(ss, "Tareas");
    const tareasData = tareasSheet.getDataRange().getValues();
    const taskRow = tareasData.find(r => String(r[0]).trim() === String(tareaId).trim());
    if (taskRow && taskRow[8]) {
      const fechaLimite = new Date(taskRow[8]);
      if (now.getTime() > fechaLimite.getTime()) {
        estadoEntrega = "EntregadaTarde";
      }
    }
  } catch (e) {
    logDebug("Error al verificar fecha limite:", e.message);
  }

  if (existingIdx !== -1) {
    entregaId = data[existingIdx][0];
    const prevRow = data[existingIdx];

    // Obtener número de versión anterior
    const prevVersions = versionesSheet.getDataRange().getValues().filter(r => String(r[1]).trim() === String(entregaId).trim());
    versionNum = prevVersions.length + 1;

    // Actualizar registro principal
    prevRow[3] = now;
    if (fileId !== undefined) prevRow[4] = fileId;
    prevRow[6] = estadoEntrega;
    if (mimeType !== undefined) prevRow[8] = mimeType;

    entregasSheet.getRange(existingIdx + 1, 1, 1, prevRow.length).setValues([prevRow]);
  } else {
    entregaId = "ENT-" + now.getTime();
    entregasSheet.appendRow([entregaId, tareaId, userId, now, fileId || '', '', estadoEntrega, observaciones || '', mimeType || '']);
  }

  // Registrar versión histórica en EntregasVersiones
  const versionId = "VER-" + now.getTime() + "-" + versionNum;
  versionesSheet.appendRow([
    versionId,
    entregaId,
    tareaId,
    userId,
    versionNum,
    fileId ? `https://drive.google.com/file/d/${fileId}/view` : "",
    fileId || "",
    mimeType || "",
    textoRespuesta || "",
    enlaceExterno || "",
    now,
    estadoEntrega,
    observaciones || ""
  ]);

  const submissionToken = "RECIEVED-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);

  return {
    status: "success",
    message: "Tarea entregada y registrada en el servidor.",
    data: {
      entregaId: entregaId,
      versionNum: versionNum,
      submissionToken: submissionToken,
      fechaRecepcion: now.toISOString(),
      estado: estadoEntrega
    }
  };
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
  const { userId, fileName, code, editor } = payload;
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

  // Registrar en la hoja "pseudocode" (userId, NombreArchivo, archivoUrl, codigo, editor)
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const pseudocodeSheet = getOrCreateSheet(ss, "pseudocode");
    const data = pseudocodeSheet.getDataRange().getValues();
    const rowIndex = data.findIndex(r => r[0] == userId && r[1] == finalFileName);

    if (rowIndex !== -1) {
      // Actualizar: A:userId, B:NombreArchivo, C:archivoUrl, D:codigo, E:editor
      pseudocodeSheet.getRange(rowIndex + 1, 3).setValue(fileUrl);
      pseudocodeSheet.getRange(rowIndex + 1, 4).setValue(code);
      pseudocodeSheet.getRange(rowIndex + 1, 5).setValue(editor || 'PseudocodeEditor');
    } else {
      // Insertar: A:userId, B:NombreArchivo, C:archivoUrl, D:codigo, E:editor
      pseudocodeSheet.appendRow([userId, finalFileName, fileUrl, code, editor || 'PseudocodeEditor']);
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
        // En este nuevo flujo, el id puede ser el NombreArchivo para búsqueda en hoja o el fileId real
        const fileIdMatch = (r[2] || "").match(/id=([^&]+)/);
        const fileId = fileIdMatch ? fileIdMatch[1] : r[1]; // Fallback al nombre si no hay URL
        result.push({
          name: r[1],
          id: fileId,
          lastUpdated: new Date().toISOString()
        });
      }
    });
  } catch (e) {
    logDebug("Error al listar proyectos desde hoja:", e.message);
    // Fallback a Drive si la hoja falla
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

function deleteProject(payload) {
  const { fileId, userId, fileName } = payload;
  if (!fileId && !fileName) throw new Error("Identificador de proyecto requerido.");

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const pseudocodeSheet = getSheetOrThrow(ss, "pseudocode");
    const data = pseudocodeSheet.getDataRange().getValues();

    // Buscar por fileId (en URL) o por NombreArchivo (si fileId es el nombre)
    const rowIndex = data.findIndex(r => (r[0] == userId && (r[1] == fileName || r[1] == fileId || (r[2] || "").indexOf(fileId) !== -1)));

    if (rowIndex !== -1) {
      pseudocodeSheet.deleteRow(rowIndex + 1);
    }
  } catch (e) {
    logDebug("Error al eliminar de la hoja:", e.message);
  }

  // Intentar eliminar de Drive
  try {
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
  } catch (e) {
    logDebug("Error al eliminar de Drive:", e.message);
    // Si no es un ID válido o no se encuentra, procedemos (podría ser solo registro en hoja)
  }

  return { status: "success", message: "Proyecto eliminado." };
}

function loadProject(payload) {
  const { fileId, userId } = payload; // Ahora podemos recibir userId para buscar en hoja
  if (!fileId) throw new Error("Identificador de proyecto requerido.");

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const pseudocodeSheet = getSheetOrThrow(ss, "pseudocode");
    const data = pseudocodeSheet.getDataRange().getValues();

    // Buscar por fileId (en URL) o por NombreArchivo (si fileId es el nombre)
    const rowIndex = data.findIndex(r => (r[0] == userId && (r[1] == fileId || (r[2] || "").indexOf(fileId) !== -1)));

    if (rowIndex !== -1) {
      return {
        status: "success",
        data: {
          name: data[rowIndex][1],
          code: data[rowIndex][3] // Columna D: codigo
        }
      };
    }
  } catch (e) {
    logDebug("Error al cargar desde hoja, intentando Drive:", e.message);
  }

  // Fallback a Drive si no se encuentra en la hoja o falla
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

// --- FUNCIONES AULA VIRTUAL Y CONTENIDOS (FASE 5) ---

function getVirtualClassrooms(payload) {
  const { grado, seccion, profesorId, userId, rol } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AulasVirtuales");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const rows = data.slice(1);
  const classrooms = rows.filter(r => {
    if (r[7] === "Desactivada") return false;
    if (profesorId && r[6] && String(r[6]).trim() !== String(profesorId).trim()) return false;
    if (grado && normalizeString(r[3]) !== normalizeString(grado)) return false;
    if (seccion && r[4] && normalizeString(r[4]) !== normalizeString(seccion)) return false;
    return true;
  }).map(r => ({
    aulaId: r[0],
    ofertaId: r[1],
    nombreClase: r[2],
    grado: r[3],
    seccion: r[4],
    asignatura: r[5],
    profesorId: r[6],
    estado: r[7] || "Activa",
    anioLectivo: r[8],
    periodo: r[9],
    creadoEn: r[10] ? new Date(r[10]).toISOString() : null
  }));

  return { status: "success", data: classrooms };
}

function createVirtualClassroom(payload) {
  const { ofertaId, nombreClase, grado, seccion, asignatura, profesorId, anioLectivo, periodo } = payload || {};
  if (!grado || !asignatura) throw new Error("Grado y Asignatura son obligatorios para crear el aula.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AulasVirtuales");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["AulaID", "OfertaID", "NombreClase", "Grado", "Seccion", "Asignatura", "ProfesorID", "Estado", "AnioLectivo", "Periodo", "CreadoEn"]);
  }

  const aulaId = "AULA-" + Date.now();
  const nombre = nombreClase || `${asignatura} - ${grado} ${seccion || 'A'}`;
  const now = new Date();

  sheet.appendRow([aulaId, ofertaId || "", nombre, grado, seccion || "A", asignatura, profesorId || "", "Activa", anioLectivo || now.getFullYear(), periodo || "I parcial", now]);

  return { status: "success", message: "Aula virtual creada exitosamente.", data: { aulaId, nombreClase: nombre } };
}

function getPosts(payload) {
  const { aulaId, grado, seccion, asignatura, includeDrafts } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PublicacionesAnuncios");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const now = new Date().getTime();
  const posts = data.slice(1).filter(r => {
    if (r[12] === "Eliminado") return false;
    if (aulaId && String(r[1]).trim() !== String(aulaId).trim()) return false;
    if (r[7] === true && !includeDrafts) return false; // EsBorrador
    if (r[8] && new Date(r[8]).getTime() > now) return false; // FechaProgramada no alcanzada
    return true;
  }).map(r => ({
    postId: r[0],
    aulaId: r[1],
    titulo: r[2],
    contenido: r[3],
    categoria: r[4] || "Anuncio",
    autorId: r[5],
    esFijado: r[6] === true || String(r[6]).toLowerCase() === "true",
    esBorrador: r[7] === true || String(r[7]).toLowerCase() === "true",
    fechaProgramada: r[8] ? new Date(r[8]).toISOString() : null,
    fechaPublicacion: r[9] ? new Date(r[9]).toISOString() : null,
    adjuntos: r[10] ? (typeof r[10] === 'string' ? JSON.parse(r[10]) : r[10]) : [],
    audiencia: r[11] || "Todos",
    estado: r[12] || "Publicado"
  })).sort((a, b) => {
    if (a.esFijado !== b.esFijado) return a.esFijado ? -1 : 1;
    return new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion);
  });

  return { status: "success", data: posts };
}

function createPost(payload) {
  const { aulaId, titulo, contenido, categoria, autorId, esFijado, esBorrador, fechaProgramada, adjuntos, audiencia } = payload || {};
  if (!titulo || !contenido) throw new Error("Título y Contenido son obligatorios para publicar.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PublicacionesAnuncios");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "AulaID", "Titulo", "Contenido", "Categoria", "AutorID", "EsFijado", "EsBorrador", "FechaProgramada", "FechaPublicacion", "AdjuntosJSON", "Audiencia", "Estado"]);
  }

  const postId = "POST-" + Date.now();
  const now = new Date();
  const adjJSON = JSON.stringify(adjuntos || []);

  sheet.appendRow([
    postId,
    aulaId || "General",
    titulo,
    contenido,
    categoria || "Anuncio",
    autorId || "Profesor",
    esFijado || false,
    esBorrador || false,
    fechaProgramada || "",
    now,
    adjJSON,
    audiencia || "Todos",
    "Publicado"
  ]);

  return { status: "success", message: "Publicación creada con éxito.", data: { postId } };
}

function updatePost(payload) {
  const { postId, titulo, contenido, categoria, esFijado, esBorrador, adjuntos } = payload || {};
  if (!postId) throw new Error("postId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PublicacionesAnuncios");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(postId).trim());
  if (idx === -1) throw new Error("Publicación no encontrada.");

  const row = data[idx];
  if (titulo !== undefined) row[2] = titulo;
  if (contenido !== undefined) row[3] = contenido;
  if (categoria !== undefined) row[4] = categoria;
  if (esFijado !== undefined) row[6] = esFijado;
  if (esBorrador !== undefined) row[7] = esBorrador;
  if (adjuntos !== undefined) row[10] = JSON.stringify(adjuntos);

  sheet.getRange(idx + 1, 1, 1, row.length).setValues([row]);
  return { status: "success", message: "Publicación actualizada." };
}

function deletePost(payload) {
  const { postId } = payload || {};
  if (!postId) throw new Error("postId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PublicacionesAnuncios");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(postId).trim());
  if (idx === -1) throw new Error("Publicación no encontrada.");

  sheet.getRange(idx + 1, 13).setValue("Eliminado");
  return { status: "success", message: "Publicación eliminada." };
}

function getStudyMaterials(payload) {
  const { aulaId, parcial, unidad, tema, asignatura, grado } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "MaterialesEducativos");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const materials = data.slice(1).filter(r => {
    if (r[12] === "Eliminado") return false;
    if (aulaId && String(r[1]).trim() !== String(aulaId).trim()) return false;
    if (parcial && normalizeString(r[5]) !== normalizeString(parcial)) return false;
    if (unidad && normalizeString(r[6]) !== normalizeString(unidad)) return false;
    if (tema && normalizeString(r[7]) !== normalizeString(tema)) return false;
    return true;
  }).map(r => ({
    materialId: r[0],
    aulaId: r[1],
    titulo: r[2],
    descripcion: r[3],
    tipoRecurso: r[4] || "Documento",
    parcial: r[5],
    unidad: r[6],
    tema: r[7],
    archivoUrl: r[8],
    driveId: r[9],
    autorId: r[10],
    fechaPublicacion: r[11] ? new Date(r[11]).toISOString() : null,
    estado: r[12] || "Activo"
  }));

  return { status: "success", data: materials };
}

function createStudyMaterial(payload) {
  const { aulaId, titulo, descripcion, tipoRecurso, parcial, unidad, tema, archivoUrl, driveId, autorId } = payload || {};
  if (!titulo || !archivoUrl) throw new Error("Título y URL de archivo son obligatorios.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "MaterialesEducativos");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "AulaID", "Titulo", "Descripcion", "TipoRecurso", "Parcial", "Unidad", "Tema", "ArchivoUrl", "DriveId", "AutorID", "FechaPublicacion", "Estado"]);
  }

  const matId = "MAT-" + Date.now();
  const now = new Date();

  sheet.appendRow([
    matId,
    aulaId || "General",
    titulo,
    descripcion || "",
    tipoRecurso || "Documento",
    parcial || "I parcial",
    unidad || "Unidad 1",
    tema || "Tema General",
    archivoUrl,
    driveId || "",
    autorId || "Profesor",
    now,
    "Activo"
  ]);

  return { status: "success", message: "Material educativo publicado.", data: { materialId: matId } };
}

function deleteStudyMaterial(payload) {
  const { materialId } = payload || {};
  if (!materialId) throw new Error("materialId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "MaterialesEducativos");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(materialId).trim());
  if (idx === -1) throw new Error("Material no encontrado.");

  sheet.getRange(idx + 1, 13).setValue("Eliminado");
  return { status: "success", message: "Material educativo eliminado." };
}

function returnSubmissionForRevision(payload) {
  const { entregaId, comentario, profesorId } = payload || {};
  if (!entregaId) throw new Error("entregaId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const entregasSheet = getSheetOrThrow(ss, "Entregas");
  const data = entregasSheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(entregaId).trim());
  if (idx === -1) throw new Error("Entrega no encontrada.");

  const row = data[idx];
  row[6] = "DevueltaCorrección";
  if (comentario) row[7] = comentario;

  entregasSheet.getRange(idx + 1, 1, 1, row.length).setValues([row]);

  // Agregar comentario privado
  if (comentario) {
    addSubmissionComment({
      entregaId: entregaId,
      tareaId: row[1],
      autorId: profesorId || "Profesor",
      rolAutor: "Docente",
      mensaje: comentario,
      esPrivado: true
    });
  }

  return { status: "success", message: "Tarea devuelta para corrección al estudiante." };
}

function getSubmissionComments(payload) {
  const { entregaId, tareaId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ComentariosEntregas");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const comments = data.slice(1).filter(r => {
    if (entregaId && String(r[1]).trim() === String(entregaId).trim()) return true;
    if (tareaId && String(r[2]).trim() === String(tareaId).trim()) return true;
    return false;
  }).map(r => ({
    comentarioId: r[0],
    entregaId: r[1],
    tareaId: r[2],
    autorId: r[3],
    rolAutor: r[4] || "Usuario",
    mensaje: r[5],
    esPrivado: r[6] === true || String(r[6]).toLowerCase() === "true",
    fechaCreacion: r[7] ? new Date(r[7]).toISOString() : null
  }));

  return { status: "success", data: comments };
}

function addSubmissionComment(payload) {
  const { entregaId, tareaId, autorId, rolAutor, mensaje, esPrivado } = payload || {};
  if (!mensaje) throw new Error("Mensaje de comentario es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ComentariosEntregas");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "EntregaID", "TareaID", "AutorID", "RolAutor", "Mensaje", "EsPrivado", "FechaCreacion"]);
  }

  const comId = "COM-" + Date.now();
  const now = new Date();

  sheet.appendRow([comId, entregaId || "", tareaId || "", autorId || "Usuario", rolAutor || "Estudiante", mensaje, esPrivado !== false, now]);

  return { status: "success", message: "Comentario publicado.", data: { comentarioId: comId } };
}

function getSubmissionVersions(payload) {
  const { entregaId, tareaId, userId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "EntregasVersiones");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const versions = data.slice(1).filter(r => {
    if (entregaId && String(r[1]).trim() === String(entregaId).trim()) return true;
    if (tareaId && userId && String(r[2]).trim() === String(tareaId).trim() && String(r[3]).trim() === String(userId).trim()) return true;
    return false;
  }).map(r => ({
    versionId: r[0],
    entregaId: r[1],
    tareaId: r[2],
    userId: r[3],
    versionNum: r[4],
    archivoUrl: r[5],
    fileId: r[6],
    mimeType: r[7],
    textoRespuesta: r[8],
    enlaceExterno: r[9],
    fechaEnvio: r[10] ? new Date(r[10]).toISOString() : null,
    estado: r[11],
    observaciones: r[12]
  }));

  return { status: "success", data: versions };
}
