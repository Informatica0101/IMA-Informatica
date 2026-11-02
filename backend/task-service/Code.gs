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

function getSheetOrThrow(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) {
    const errorMessage = `Hoja no encontrada: "${name}".`;
    logDebug(errorMessage);
    throw new Error(errorMessage);
  }
  return sheet;
}

// ---------------------------------------------------------------------------
// SEGURIDAD RBAC EN TAREAS Y ASIGNACIÓN DOCENTE (REQ-EXP-008 & REQ-DOC-012)
// ---------------------------------------------------------------------------

const TASK_RBAC_PERMISSIONS = {
  "ping": ["*"],
  "getStudentTasks": ["*"],
  "uploadFile": ["*"],
  "uploadChunk": ["*"],
  "finishChunkedUpload": ["*"],
  "deleteFile": ["*"],
  "submitAssignment": ["*"],
  "saveProject": ["*"],
  "deleteProject": ["*"],
  "listProjects": ["*"],
  "loadProject": ["*"],
  "getAllStudentProjects": ["Administrador", "Director", "Profesor", "Docente", "Desarrollador"],
  "createTask": ["Administrador", "Director", "Subdirector", "Profesor", "Docente", "Desarrollador"],
  "updateTask": ["Administrador", "Director", "Subdirector", "Profesor", "Docente", "Desarrollador"],
  "deleteTask": ["Administrador", "Director", "Subdirector", "Profesor", "Docente", "Desarrollador"],
  "gradeSubmission": ["Administrador", "Director", "Subdirector", "Profesor", "Docente", "Desarrollador"],
  "getTeacherActivity": ["Administrador", "Director", "Subdirector", "Profesor", "Docente", "Desarrollador"],
  "getAllTasks": ["Administrador", "Director", "Subdirector", "Profesor", "Docente", "Desarrollador"],
  "deleteSubmission": ["Administrador", "Director", "Subdirector", "Profesor", "Docente", "Desarrollador"],
  "closeAcademicYear": ["Administrador", "Director", "Desarrollador"]
};

function getAuthenticatedUserFromDatabase(requesterUserId) {
  if (!requesterUserId) return null;
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
    const userSheet = ss.getSheetByName("Usuarios");
    if (!userSheet) return null;
    const users = userSheet.getDataRange().getValues();
    const userRow = users.find(r => String(r[0]).trim() === String(requesterUserId).trim());
    if (userRow) {
      return {
        userId: String(userRow[0]).trim(),
        nombre: String(userRow[1] || "").trim(),
        grado: String(userRow[2] || "").trim(),
        seccion: String(userRow[3] || "").trim(),
        email: String(userRow[4] || "").trim(),
        rol: String(userRow[6] || "").trim()
      };
    }
  } catch (err) {
    logDebug("Error al consultar usuario para RBAC en tareas: " + err.message);
  }
  return null;
}

function validateTaskPermission(action, payload) {
  const allowedRoles = TASK_RBAC_PERMISSIONS[action];
  if (allowedRoles && allowedRoles.includes("*")) {
    return { authorized: true };
  }

  const requesterUserId = (payload && (payload.requesterUserId || payload.profesorId || payload.userId)) ? String(payload.requesterUserId || payload.profesorId || payload.userId).trim() : "";
  if (!requesterUserId) {
    return { authorized: false, message: "Petición no autenticada en el microservicio de tareas." };
  }

  const authenticatedUser = getAuthenticatedUserFromDatabase(requesterUserId);
  if (!authenticatedUser || !authenticatedUser.rol) {
    return { authorized: false, message: "Usuario no registrado o sin credenciales válidas en la base de datos institucional." };
  }

  const validatedRole = authenticatedUser.rol;
  if (validatedRole.toLowerCase() === "administrador" || validatedRole.toLowerCase() === "admin" || validatedRole.toLowerCase() === "desarrollador") {
    return { authorized: true, user: authenticatedUser };
  }

  if (!allowedRoles) {
    return { authorized: false, message: `Acción de tareas no autorizada para el rol '${validatedRole}'.` };
  }

  const isAllowed = allowedRoles.some(r => r.toLowerCase() === validatedRole.toLowerCase());
  if (!isAllowed) {
    return { authorized: false, message: `El rol '${validatedRole}' no cuenta con permisos para '${action}'.` };
  }

  return { authorized: true, user: authenticatedUser };
}

/**
 * REQ-DOC-012: Valida en servidor que un docente tenga asignada la asignatura, grado y sección.
 * Los administradores y directores poseen permiso irrestricto.
 */
function validateTeacherTaskAssignment(userId, grado, seccion, asignatura) {
  try {
    const user = getAuthenticatedUserFromDatabase(userId);
    if (!user) return false;
    const role = (user.rol || "").toLowerCase();
    if (role === "administrador" || role === "admin" || role === "director" || role === "subdirector" || role === "desarrollador") {
      return true;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
    const configSheet = ss.getSheetByName("ConfiguracionAcademica");
    if (!configSheet) return true;

    const data = configSheet.getDataRange().getValues();
    if (data.length < 2) return true;

    const normTargetGrado = normalizeString(grado);
    const normTargetSeccion = normalizeString(seccion);
    const normTargetAsignatura = normalizeString(asignatura);

    const rows = data.slice(1);
    const hasAssignment = rows.some(r => {
      const rowProfId = String(r[8] || "").trim();
      if (rowProfId !== String(userId).trim()) return false;
      const rGrado = normalizeString(r[3]);
      const rSeccion = normalizeString(r[4]);
      const rAsig = normalizeString(r[5]);

      const matchGrado = !normTargetGrado || rGrado === normTargetGrado || rGrado === "todos";
      const matchSeccion = !normTargetSeccion || rSeccion === normTargetSeccion || rSeccion === "todas";
      const matchAsig = !normTargetAsignatura || rAsig === normTargetAsignatura || rAsig === "todas";
      return matchGrado && matchSeccion && matchAsig;
    });

    return hasAssignment;
  } catch (err) {
    logDebug("Error verificando asignación docente de tareas: " + err.message);
    return false;
  }
}

/**
 * REQ-DOC-012: Hoja y función de trazabilidad inmutable de entregas estudiantiles
 */
function getOrCreateTrazabilidadEntregasSheet(ss) {
  let sheet = ss.getSheetByName("TrazabilidadEntregas");
  if (!sheet) {
    sheet = ss.insertSheet("TrazabilidadEntregas");
    sheet.appendRow([
      "id_traza",
      "entregaId",
      "tareaId",
      "estudianteId",
      "fechaHoraEntrega",
      "fechaLimite",
      "esTardia",
      "minutosDiferencia",
      "fileId",
      "mimeType",
      "estado",
      "hashAuditoria"
    ]);
  }
  return sheet;
}

function recordSubmissionDeliveryTrace(params) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateTrazabilidadEntregasSheet(ss);
    const now = new Date();
    const trazaId = "TRZ-" + now.getTime() + "-" + Math.floor(Math.random() * 1000);

    const fechaHoraEntrega = now.toISOString();
    let esTardia = false;
    let minutosDiferencia = 0;

    if (params.fechaLimite) {
      const limitTime = new Date(params.fechaLimite).getTime();
      const diffMs = now.getTime() - limitTime;
      minutosDiferencia = Math.round(diffMs / 60000);
      if (diffMs > 0) {
        esTardia = true;
      }
    }

    const hashRaw = `${trazaId}|${params.entregaId}|${params.tareaId}|${params.estudianteId}|${fechaHoraEntrega}|${params.fileId}`;
    let hashAuditoria = "";
    try {
      const signatureBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, hashRaw);
      hashAuditoria = signatureBytes.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
    } catch (_) {
      hashAuditoria = "HASH-" + now.getTime();
    }

    sheet.appendRow([
      trazaId,
      params.entregaId || "",
      params.tareaId || "",
      params.estudianteId || "",
      fechaHoraEntrega,
      params.fechaLimite ? new Date(params.fechaLimite).toISOString() : "",
      esTardia ? "SI" : "NO",
      minutosDiferencia,
      params.fileId || "",
      params.mimeType || "",
      params.estado || "Entregada",
      hashAuditoria
    ]);

    return { trazaId, esTardia, minutosDiferencia, hashAuditoria };
  } catch (err) {
    logDebug("Error registrando trazabilidad de entrega: " + err.message);
    return null;
  }
}

// --- PUNTOS DE ENTRADA ---
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify(pingHealthCheck("TASK")))
    .setMimeType(ContentService.MimeType.JSON);
}

function pingHealthCheck(serviceName) {
  const now = new Date();
  return {
    status: "success",
    service: serviceName || "TASK",
    timestamp: now.toISOString(),
    epoch: now.getTime(),
    message: `Microservicio ${serviceName || "TASK"} en línea y respondiendo ping.`
  };
}

function doOptions(e) {
  return ContentService.createTextOutput("");
}

function doPost(e) {
  let response;
  try {
    const { action, payload } = JSON.parse(e.postData.contents);

    // REQ-EXP-008 & REQ-DOC-012: Enforzar validación RBAC del lado del servidor
    const authCheck = validateTaskPermission(action, payload);
    if (!authCheck.authorized) {
      response = {
        status: "error",
        code: "AUTH_PERMISSION_DENIED",
        message: authCheck.message
      };
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    }

    switch (action) {
      case "ping": response = pingHealthCheck("TASK"); break;
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
  const { tipo, titulo, descripcion, parcial, asignatura, gradoAsignado, seccionAsignada, fechaLimite, fechaClase, horaDisponible, tareaOriginalId, profesorId, puntaje, archivoUrl, requesterUserId } = payload;
  const activeUserId = requesterUserId || profesorId;

  // REQ-DOC-012: Enforzar que docentes solo puedan crear tareas en sus asignaturas y secciones asignadas
  if (activeUserId && !validateTeacherTaskAssignment(activeUserId, gradoAsignado, seccionAsignada, asignatura)) {
    throw new Error(`Publicación no autorizada: El docente no tiene asignada la asignatura '${asignatura}' en ${gradoAsignado} ${seccionAsignada || ''}.`);
  }

  const tareaId = "TSK-" + new Date().getTime();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const tareasSheet = getSheetOrThrow(ss, "Tareas");

  // Validación REQ-DOC-005: Fecha límite no puede ser anterior a la clase
  if (fechaClase && fechaLimite && String(fechaLimite) < String(fechaClase)) {
    throw new Error("La fecha límite de entrega no puede ser anterior a la fecha de la clase impartida.");
  }

  // Columnas: 0:tareaId, 1:tipo, 2:titulo, 3:descripcion, 4:parcial, 5:asignatura, 6:grado, 7:seccion, 8:fecha, 9:originalId, 10:profesorId, 11:estado, 12:puntaje, 13:archivoUrl, 14:fechaClase, 15:horaDisponible
  tareasSheet.appendRow([
    tareaId,
    tipo,
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
    fechaClase || '',
    horaDisponible || ''
  ]);
  return { status: "success", message: "Tarea creada." };
}

function updateTask(payload) {
  const { tareaId, titulo, descripcion, fechaLimite, fechaClase, horaDisponible, parcial, asignatura, gradoAsignado, seccionAsignada, puntaje, archivoUrl, requesterUserId, profesorId } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Tareas");
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(r => r[0] === tareaId);

  if (rowIndex === -1) throw new Error("Tarea no encontrada.");

  const activeUserId = requesterUserId || profesorId;
  const targetGrado = gradoAsignado !== undefined ? gradoAsignado : data[rowIndex][6];
  const targetSeccion = seccionAsignada !== undefined ? seccionAsignada : data[rowIndex][7];
  const targetAsignatura = asignatura !== undefined ? asignatura : data[rowIndex][5];

  // REQ-DOC-012: Enforzar que docentes solo puedan actualizar tareas en sus asignaturas asignadas
  if (activeUserId && !validateTeacherTaskAssignment(activeUserId, targetGrado, targetSeccion, targetAsignatura)) {
    throw new Error(`Modificación no autorizada: El docente no tiene asignada la asignatura '${targetAsignatura}' en ${targetGrado} ${targetSeccion || ''}.`);
  }

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
  if (fechaClase !== undefined) taskRow[14] = fechaClase;
  if (horaDisponible !== undefined) taskRow[15] = horaDisponible;

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

    const fechaClase = task[14] ? new Date(task[14]).toISOString() : null;
    const horaDisponible = task[15] || '';

    // REQ-DOC-006: Cálculo de disponibilidad temporal de la tarea
    let disponibleDesde = null;
    let esDisponible = true;
    if (fechaClase) {
      const parts = fechaClase.split('T')[0].split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      let hours = 0;
      let minutes = 0;
      if (horaDisponible && horaDisponible.includes(':')) {
        const hParts = horaDisponible.split(':');
        hours = parseInt(hParts[0], 10) || 0;
        minutes = parseInt(hParts[1], 10) || 0;
      }
      disponibleDesde = new Date(year, month, day, hours, minutes, 0).toISOString();
      if (new Date().getTime() < new Date(disponibleDesde).getTime()) {
        esDisponible = false;
      }
    }

    return {
      tareaId: task[0], tipo: task[1], titulo: task[2], descripcion: task[3], parcial: task[4], grado: task[6], seccion: task[7],
      asignatura: task[5], fechaLimite: fechaLimite,
      fechaClase: fechaClase,
      horaDisponible: horaDisponible,
      disponibleDesde: disponibleDesde,
      esDisponible: esDisponible,
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

  // [REQ-DOC-008]: Almacenamiento jerárquico estandarizado en Drive
  const taskDeliveryFolder = resolveStudentTaskDeliveryFolder(rootFolder, {
    grado: sGrado,
    seccion: sSeccion,
    nombre: sNombre,
    parcial: sParcial,
    asignatura: sAsignatura,
    tituloTarea: tituloTarea,
    userId: userId
  });

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

  // REQ-DOC-012: Protección de accesos en Google Drive sin compartir indiscriminadamente con ANYONE_WITH_LINK
  try {
    // Mantener la carpeta accesible sólo para el propietario y miembros autorizados
    taskDeliveryFolder.setShareableByEditors(false);
  } catch (e) {
    logDebug("Ajuste de visibilidad institucional de carpeta:", e.message);
  }

  // [REQ-DOC-009]: Registrar metadatos documentales de la entrega
  const docId = recordDocumentMetadata({
    titulo: `${tituloTarea} - ${sNombre}`,
    fileName: fileName,
    tipo_recurso: "Entrega de Tarea",
    asignatura: sAsignatura,
    grado: sGrado,
    seccion: sSeccion,
    parcial: sParcial,
    tareaId: tareaId,
    userId: userId,
    nombre: sNombre,
    fileId: file.getId(),
    folderId: taskDeliveryFolder.getId(),
    folderUrl: taskDeliveryFolder.getUrl(),
    mimeType: mimeType,
    tamanio_bytes: blob.getBytes() ? blob.getBytes().length : 0
  });

  return {
    status: "success",
    data: {
      fileId: file.getId(),
      folderId: taskDeliveryFolder.getId(),
      folderUrl: taskDeliveryFolder.getUrl(),
      mimeType: mimeType,
      docId: docId
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

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usuariosSheet = getSheetOrThrow(ss, "Usuarios");
    const tareasSheet = getSheetOrThrow(ss, "Tareas");

    const userData = usuariosSheet.getDataRange().getValues().find(row => row[0] === userId);
    const [, nombre, grado, seccion] = userData || [];
    const taskData = tareasSheet.getDataRange().getValues().find(row => row[0] === tareaId);
    const tituloTarea = taskData ? taskData[2] : "Tarea Sin Titulo";

    const rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const taskDeliveryFolder = resolveStudentTaskDeliveryFolder(rootFolder, {
      grado: grado,
      seccion: seccion,
      nombre: nombre,
      parcial: parcial,
      asignatura: asignatura,
      tituloTarea: tituloTarea,
      userId: userId
    });

    const file = taskDeliveryFolder.createFile(finalBlob);

    // Limpieza de temporales
    try { uploadFolder.setTrashed(true); } catch (e) { logDebug("Fallo limpieza de carpeta temporal:", e.message); }

    // REQ-DOC-012: Protección de accesos en Google Drive sin compartir indiscriminadamente con ANYONE_WITH_LINK
    try {
      taskDeliveryFolder.setShareableByEditors(false);
    } catch (e) {}

    // [REQ-DOC-009]: Registrar metadatos
    const docId = recordDocumentMetadata({
      titulo: `${tituloTarea} - ${nombre}`,
      fileName: fileName,
      tipo_recurso: "Entrega de Tarea",
      asignatura: asignatura,
      grado: grado,
      seccion: seccion,
      parcial: parcial,
      tareaId: tareaId,
      userId: userId,
      nombre: nombre,
      fileId: file.getId(),
      folderId: taskDeliveryFolder.getId(),
      folderUrl: taskDeliveryFolder.getUrl(),
      mimeType: mimeType,
      tamanio_bytes: totalSize
    });

    return {
      status: "success",
      data: {
        fileId: file.getId(),
        folderId: taskDeliveryFolder.getId(),
        mimeType: mimeType,
        docId: docId
      }
    };
  } catch (e) {
    logDebug("Error en finishChunkedUpload:", e.message);
    return { status: "error", message: "Error al reconstruir el archivo: " + e.message };
  }
}

function submitAssignment(payload) {
  const { userId, tareaId, fileId, mimeType } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const tareasSheet = getSheetOrThrow(ss, "Tareas");
  const entregasSheet = getSheetOrThrow(ss, "Entregas");

  // REQ-DOC-006: Validar si la tarea ya está disponible para entregas
  const tareasData = tareasSheet.getDataRange().getValues();
  const taskRow = tareasData.find(r => r[0] === tareaId);
  if (taskRow) {
    const rawFechaClase = taskRow[14];
    const horaDisponible = taskRow[15] || '';
    if (rawFechaClase) {
      const fechaClaseIso = new Date(rawFechaClase).toISOString();
      const parts = fechaClaseIso.split('T')[0].split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      let h = 0, min = 0;
      if (horaDisponible && horaDisponible.includes(':')) {
        const hp = horaDisponible.split(':');
        h = parseInt(hp[0], 10) || 0;
        min = parseInt(hp[1], 10) || 0;
      }
      const dispTime = new Date(y, m, d, h, min, 0).getTime();
      if (new Date().getTime() < dispTime) {
        throw new Error("Esta tarea se encuentra programada y aún no está disponible para entregas.");
      }
    }
  }

  // Validación de duplicados (Req 3)
  const data = entregasSheet.getDataRange().getValues();
  // Verificar si ya existe una entrega para este usuario, tarea y archivo en los últimos 5 minutos
  const now = new Date().getTime();
  const duplicate = data.some(row => {
    const rowUserId = row[2];
    const rowTareaId = row[1];
    const rowFileId = row[4];
    const rowDate = new Date(row[3]).getTime();
    return String(rowUserId) === String(userId) && String(rowTareaId) === String(tareaId) && String(rowFileId) === String(fileId) && (now - rowDate < 300000);
  });

  if (duplicate) {
    return { status: "success", message: "La tarea ya fue entregada previamente." };
  }

  const entregaId = "ENT-" + new Date().getTime();
  const fechaEntrega = new Date();
  // Estado inicial: Pendiente de revisión
  entregasSheet.appendRow([entregaId, tareaId, userId, fechaEntrega, fileId, '', 'Pendiente de revisión', '', mimeType]);

  // REQ-DOC-012: Registro de trazabilidad inmutable y auditoría de tiempos de entrega
  const fechaLimiteTarea = taskRow ? taskRow[8] : null;
  const traza = recordSubmissionDeliveryTrace({
    entregaId: entregaId,
    tareaId: tareaId,
    estudianteId: userId,
    fechaLimite: fechaLimiteTarea,
    fileId: fileId,
    mimeType: mimeType,
    estado: 'Pendiente de revisión'
  });

  return {
    status: "success",
    message: "Tarea entregada.",
    data: {
      entregaId: entregaId,
      trazaId: traza ? traza.trazaId : null,
      esTardia: traza ? traza.esTardia : false,
      hashAuditoria: traza ? traza.hashAuditoria : null
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

// --- HELPERS DE DRIVE Y GESTIÓN JERÁRQUICA DOCUMENTAL ([REQ-DOC-008] y [REQ-DOC-009]) ---

/**
 * Sanitiza nombres de carpetas y archivos para prevenir duplicados por diferencias tipográficas,
 * tildes o caracteres inválidos en Google Drive y sistemas operativos.
 */
function sanitizePathSegment(segment) {
  if (!segment) return "General";
  let s = String(segment).trim();
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remover acentos/diacríticos
  s = s.replace(/[/\\?%*:|"<>]/g, "-"); // Caracteres no permitidos
  s = s.replace(/\s+/g, " "); // Colapsar múltiples espacios
  return s.trim() || "General";
}

function getOrCreateFolder(parentFolder, folderName) {
  const name = sanitizePathSegment(folderName);
  try {
    const folders = parentFolder.getFoldersByName(name);
    return folders.hasNext() ? folders.next() : parentFolder.createFolder(name);
  } catch (e) {
    const errorMsg = `Error de DriveApp en carpeta "${name}": ${e.message}`;
    logDebug(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * [REQ-DOC-008]: Resuelve la estructura jerárquica estandarizada en Drive:
 * Para estudiantes: Área / New Generation / Estudiantes / [Grado] / [Seccion] / [Nombre] / [Parcial] / [Asignatura] / [Tarea]
 */
function resolveStudentTaskDeliveryFolder(rootFolder, params) {
  const { grado, seccion, nombre, parcial, asignatura, tituloTarea, userId } = params;
  const areaFolder = getOrCreateFolder(rootFolder, "Area");
  const ngFolder = getOrCreateFolder(areaFolder, "New Generation");
  const estRoot = getOrCreateFolder(ngFolder, "Estudiantes");
  const gradoFolder = getOrCreateFolder(estRoot, grado || "General");
  const seccionFolder = getOrCreateFolder(gradoFolder, seccion || "General");
  const alumnoFolder = getOrCreateFolder(seccionFolder, nombre || `Estudiante_${userId}`);
  const parcialFolder = getOrCreateFolder(alumnoFolder, parcial || "General");
  const asigFolder = getOrCreateFolder(parcialFolder, asignatura || "General");
  const taskFolder = getOrCreateFolder(asigFolder, `${sanitizePathSegment(tituloTarea)}_${userId}`);
  return taskFolder;
}

/**
 * [REQ-DOC-009]: Hoja y gestión centralizada de Metadatos Documentales
 */
function getOrCreateMetadatosDocumentalesSheet(ss) {
  let sheet = ss.getSheetByName("MetadatosDocumentales");
  if (!sheet) {
    sheet = ss.insertSheet("MetadatosDocumentales");
    sheet.appendRow([
      "id_documento",
      "titulo",
      "nombre_original",
      "nombre_fisico",
      "tipo_recurso",
      "asignatura",
      "grado",
      "seccion",
      "parcial",
      "anio",
      "tema",
      "id_referencia",
      "usuario_id",
      "usuario_nombre",
      "fecha_registro",
      "estado",
      "drive_file_id",
      "drive_folder_id",
      "drive_url",
      "tipo_mime",
      "tamanio_bytes"
    ]);
  }
  return sheet;
}

function recordDocumentMetadata(params) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateMetadatosDocumentalesSheet(ss);
    const now = new Date();
    const docId = params.id_documento || ("DOC-" + now.getFullYear() + "-" + Utilities.getUuid().substring(0, 8).toUpperCase());

    sheet.appendRow([
      docId,
      params.titulo || "Sin título",
      params.nombre_original || params.fileName || "archivo",
      params.nombre_fisico || params.fileName || "archivo",
      params.tipo_recurso || "Entrega de Tarea",
      params.asignatura || "General",
      params.grado || "General",
      params.seccion || "General",
      params.parcial || "General",
      params.anio || now.getFullYear(),
      params.tema || "",
      params.id_referencia || params.tareaId || "",
      params.usuario_id || params.userId || "",
      params.usuario_nombre || params.nombre || "",
      now.toISOString(),
      params.estado || "Activo",
      params.drive_file_id || params.fileId || "",
      params.drive_folder_id || params.folderId || "",
      params.drive_url || params.folderUrl || "",
      params.tipo_mime || params.mimeType || "application/octet-stream",
      params.tamanio_bytes || 0
    ]);
    return docId;
  } catch (err) {
    logDebug("Error registrando metadatos documentales: " + err.message);
    return null;
  }
}
