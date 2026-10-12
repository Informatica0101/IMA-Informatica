// ============================================================================
// MICROSERVICIO ACADÉMICO (VERSIÓN MODULAR EXTENDIDA FASE 4 v8.4.0)
// ============================================================================

const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DEBUG_MODE = true;

// ---------------------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------------------

function logDebug(message, optionalParam) {
  if (!DEBUG_MODE) return;
  try {
    console.log(`[ACADEMIC-SVC] ${new Date().toLocaleTimeString()} - ${message}`, optionalParam || "");
  } catch (_) {}
}

function textResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.TEXT);
}

function sanitizePayloadForLog(payload) {
  if (!payload || typeof payload !== "object") return String(payload || "");
  try {
    const clean = JSON.parse(JSON.stringify(payload));
    const sensitiveKeys = ["password", "clave", "token", "secret", "credencial", "authorization"];
    function maskObj(obj) {
      if (!obj || typeof obj !== "object") return;
      for (const k in obj) {
        if (sensitiveKeys.some(sk => k.toLowerCase().includes(sk))) {
          obj[k] = "***MASKED***";
        } else if (typeof obj[k] === "object") {
          maskObj(obj[k]);
        }
      }
    }
    maskObj(clean);
    return JSON.stringify(clean);
  } catch (_) {
    return "[Unserializable Payload]";
  }
}

function logStructuredEvent(serviceName, fnName, severity, errorCode, message, payload, userRole) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName("LogsSistema");
    if (!sheet) {
      sheet = ss.insertSheet("LogsSistema");
      sheet.appendRow(["ID", "Timestamp", "Servicio", "Función", "Severidad", "CódigoError", "Mensaje", "DatosPayload", "RolUsuario"]);
    }
    const logId = "LOG-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    const timestamp = new Date().toISOString();
    const sanitizedPayload = sanitizePayloadForLog(payload);
    sheet.appendRow([
      logId,
      timestamp,
      serviceName || "ACADEMIC",
      fnName || "unknown",
      (severity || "INFO").toUpperCase(),
      errorCode || "OK",
      message || "",
      sanitizedPayload,
      userRole || "Sistema"
    ]);
  } catch (err) {
    console.error("Error writing structured log:", err);
  }
}

function normalizeString(str) {
  if (!str) return "";
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Tablas Base y Previas
    if (name === "ConfiguracionAcademica") sheet.appendRow(["ID", "Fecha", "Parcial", "Grado", "Sección", "Asignatura", "Unidad", "Tema", "profesorId"]);
    if (name === "HistorialAcademico") sheet.appendRow(["ID", "Fecha", "Parcial", "Grado", "Sección", "Asignatura", "Unidad", "profesorId"]);
    if (name === "Clases") sheet.appendRow(["Grado", "Seccion", "WhatsAppLink"]);
    if (name === "BancoPreguntas") sheet.appendRow(["PreguntaID", "Asignatura", "Nivel", "Tema", "TipoActividad", "Pregunta", "OpcionA", "OpcionB", "OpcionC", "OpcionD", "RespuestaCorrecta", "Explicacion", "Imagen", "VecesRespondida", "VecesCorrecta", "PorcentajeAcierto", "UltimaActualizacion", "Activa", "DificultadCalculada"]);
    if (name === "Matriculas") sheet.appendRow(["MatriculaID", "Fecha", "UserId", "Alumno", "Grado", "Seccion", "Periodo", "Tipo", "Estado", "BecaDescuento", "Observaciones"]);
    if (name === "CargosEstudiante") sheet.appendRow(["CargoID", "Fecha", "UserId", "Concepto", "MontoBase", "Descuento", "MontoFinal", "Estado", "FechaVencimiento"]);

    // Tablas Fase 3 - Estructura Institucional
    if (name === "InstitucionParametros") sheet.appendRow(["Clave", "Nombre", "Valor", "TipoDato", "Ambito", "Estado", "ModificadoPor", "UltimaActualizacion"]);
    if (name === "SedesAulas") sheet.appendRow(["SedeID", "NombreSede", "AulaCodigo", "NombreAula", "Capacidad", "TipoEspacio", "Estado"]);
    if (name === "AnosLectivos") sheet.appendRow(["AnoID", "Nombre", "FechaInicio", "FechaFin", "InicioClases", "FinClases", "Estado", "CreadoPor", "FechaCreacion"]);
    if (name === "PeriodosAcademicos") sheet.appendRow(["PeriodoID", "AnoID", "Nombre", "TipoPeriodo", "FechaInicio", "FechaFin", "Orden", "Estado", "AperturaDocente", "PublicacionNotas"]);
    if (name === "CatalogoAsignaturas") sheet.appendRow(["AsignaturaID", "NombreOficial", "Codigo", "AreaAcademica", "CargaHorariaRef", "Estado"]);
    if (name === "PlanesEstudio") sheet.appendRow(["PlanID", "Nombre", "Version", "Grado", "VigenciaInicio", "VigenciaFin", "Estado"]);
    if (name === "PlanAsignaturas") sheet.appendRow(["RelID", "PlanID", "AsignaturaID", "Grado", "Caracter", "HorasSemanales", "Orden"]);
    if (name === "OfertaAcademica") sheet.appendRow(["OfertaID", "AnoID", "SedeID", "Grado", "Seccion", "AsignaturaID", "PlanID", "Modalidad", "CapacidadMax", "Estado", "CodigoClase"]);
    if (name === "AsignacionesDocentes") sheet.appendRow(["AsignacionID", "OfertaID", "DocenteUserId", "RolDocente", "FechaInicio", "FechaFin", "Estado", "AutorizadoPor", "Motivo"]);
    if (name === "CalendarioAcademico") sheet.appendRow(["EventoID", "AnoID", "SedeID", "NombreEvento", "TipoDia", "FechaInicio", "FechaFin", "Visibilidad", "Estado"]);
    if (name === "HorariosClase") sheet.appendRow(["HorarioID", "OfertaID", "DiaSemana", "HoraInicio", "HoraFin", "AulaCodigo", "DocenteUserId", "Estado"]);
    if (name === "ReglasAcademicas") sheet.appendRow(["ReglaID", "Ambito", "TipoRegla", "Clave", "Valor", "Estado"]);

    // Nuevas Tablas Fase 4 - Expedientes, Admisiones y Matrículas
    if (name === "ExpedientesEstudiantes") sheet.appendRow(["ExpedienteID", "PersonaID", "CodigoInstitucional", "FechaNacimiento", "Nacionalidad", "DireccionResidencia", "FotografiaUrl", "EstadoExpediente", "FechaCreacion", "FechaActualizacion", "Observaciones"]);
    if (name === "SolicitudesAdmision") sheet.appendRow(["SolicitudID", "FechaSolicitud", "AnoLectivo", "GradoSolicitado", "NombresAspirante", "ApellidosAspirante", "Identificacion", "FechaNacimiento", "NombreResponsable", "TelefonoContacto", "EmailContacto", "EstadoSolicitud", "CanalIngreso", "Observaciones", "ExpedienteID"]);
    if (name === "ResponsablesTutores") sheet.appendRow(["ResponsableID", "PersonaID", "Nombres", "Apellidos", "Identificacion", "Telefono", "Email", "Direccion", "Ocupacion", "Estado"]);
    if (name === "RelacionesEstudianteTutor") sheet.appendRow(["RelacionID", "ExpedienteID", "ResponsableID", "TipoParentesco", "EsRepresentanteLegal", "EsContactoEmergencia", "EsResponsableFinanciero", "AutorizadoPickUp", "AccesoPortal", "Estado", "Observaciones"]);
    if (name === "DocumentosEstudiante") sheet.appendRow(["DocumentoID", "ExpedienteID", "SolicitudID", "TipoDocumento", "NombreArchivo", "DriveFileId", "DriveUrl", "FechaRecepcion", "FechaVencimiento", "EstadoRevision", "SubidoPor", "ValidadoPor", "Observaciones"]);
    if (name === "MovimientosEstudiante") sheet.appendRow(["MovimientoID", "ExpedienteID", "MatriculaID", "AnoLectivo", "TipoMovimiento", "GradoOrigen", "SeccionOrigen", "GradoDestino", "SeccionDestino", "FechaEfectiva", "Motivo", "AutorizadoPor", "Estado"]);
    if (name === "AntecedentesAcademicos") sheet.appendRow(["AntecedenteID", "ExpedienteID", "InstitucionOrigen", "GradoCompletado", "AnoCompletado", "PromedioObtenido", "EstadoVerificacion", "Observaciones"]);
  }
  return sheet;
}

// ---------------------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------------------

function doGet() { return textResponse({ status: "success", service: "ACADEMIC", timestamp: new Date().toISOString(), dbConnected: true }); }


// ---------------------------------------------------------------------------
// CONTROL DE ACCESO BASADO EN ROLES (RBAC SERVIDOR - FASE 4 EXTENDIDO)
// ---------------------------------------------------------------------------
const ROLE_PERMISSIONS = {
  "Administrador": ["*"],
  "Director": [
    "getAcademicConfig", "updateAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "getWhatsAppLink", "saveWhatsAppLink", "getQuestionBank", "saveQuestion", "generateMigrationReport", "registerStudentEnrollment", "getStudentEnrollmentHistory",
    "getInstitutionParams", "saveInstitutionParam", "getAcademicYears", "createAcademicYear", "updateAcademicYearStatus", "prepareNewAcademicYear",
    "getAcademicPeriods", "manageAcademicPeriod", "getSubjectCatalog", "createSubjectCatalogItem", "getStudyPlans", "createStudyPlan",
    "getAcademicOffers", "createAcademicOffer", "getTeacherAssignments", "assignTeacherToClass", "createTeacherSubstitution",
    "getAcademicCalendar", "createCalendarEvent", "getClassSchedules", "createClassSchedule", "getAcademicRules", "saveAcademicRule",
    "createAdmissionRequest", "getAdmissionRequests", "updateAdmissionStatus", "convertAdmissionToStudent",
    "getStudentFile", "updateStudentFile", "getStudentTimeline", "findDuplicateStudents", "mergeStudentFiles",
    "getStudentGuardians", "saveStudentGuardian", "unlinkStudentGuardian", "uploadStudentDocument", "getStudentDocuments", "updateDocumentStatus",
    "createStudentEnrollment", "getStudentEnrollments", "renewStudentEnrollment", "checkEnrollmentCapacity",
    "changeStudentSection", "recordStudentTransfer", "recordStudentWithdrawal", "processStudentReentry"
  ],
  "Subdirector": [
    "getAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "getWhatsAppLink", "getQuestionBank", "registerStudentEnrollment", "getStudentEnrollmentHistory",
    "getInstitutionParams", "getAcademicYears", "getAcademicPeriods", "getSubjectCatalog", "getStudyPlans", "getAcademicOffers",
    "getTeacherAssignments", "assignTeacherToClass", "createTeacherSubstitution", "getAcademicCalendar", "createCalendarEvent", "getClassSchedules", "createClassSchedule",
    "createAdmissionRequest", "getAdmissionRequests", "updateAdmissionStatus", "getStudentFile", "getStudentTimeline", "findDuplicateStudents",
    "getStudentGuardians", "getStudentDocuments", "getStudentEnrollments", "checkEnrollmentCapacity"
  ],
  "Secretaría": [
    "getAcademicConfig", "getAsignaturasActivas", "registerStudentEnrollment", "getStudentEnrollmentHistory",
    "getInstitutionParams", "getAcademicYears", "getAcademicPeriods", "getSubjectCatalog", "getStudyPlans", "getAcademicOffers",
    "createAcademicOffer", "getTeacherAssignments", "assignTeacherToClass", "getAcademicCalendar", "createCalendarEvent", "getClassSchedules",
    "createAdmissionRequest", "getAdmissionRequests", "updateAdmissionStatus", "convertAdmissionToStudent",
    "getStudentFile", "updateStudentFile", "getStudentTimeline", "findDuplicateStudents",
    "getStudentGuardians", "saveStudentGuardian", "unlinkStudentGuardian", "uploadStudentDocument", "getStudentDocuments", "updateDocumentStatus",
    "createStudentEnrollment", "getStudentEnrollments", "renewStudentEnrollment", "checkEnrollmentCapacity",
    "changeStudentSection", "recordStudentTransfer", "recordStudentWithdrawal", "processStudentReentry"
  ],
  "Contador": ["getAcademicConfig", "registerStudentEnrollment", "getStudentEnrollmentHistory", "getAcademicYears", "getAcademicOffers", "getStudentFile", "getStudentEnrollments"],
  "Consejeros": ["getAcademicConfig", "getAcademicYears", "getAcademicCalendar", "getClassSchedules", "getStudentFile", "getStudentTimeline", "getStudentGuardians"],
  "Profesor": [
    "getAcademicConfig", "updateAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "updateAsignaturasActivas", "saveWhatsAppLink", "getWhatsAppLink", "getQuestionBank", "saveQuestion", "generateMigrationReport",
    "getAcademicYears", "getAcademicPeriods", "getSubjectCatalog", "getAcademicOffers", "getTeacherAssignments", "getAcademicCalendar", "getClassSchedules",
    "getStudentFile", "getStudentTimeline", "getStudentEnrollments"
  ],
  "Asistente": ["getAcademicConfig", "getAsignaturasActivas", "getWhatsAppLink", "getQuestionBank", "getAcademicCalendar", "getClassSchedules", "getStudentFile"],
  "Estudiante": ["getAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "getWhatsAppLink", "getStudentEnrollmentHistory", "getAcademicYears", "getAcademicPeriods", "getAcademicOffers", "getAcademicCalendar", "getClassSchedules", "getStudentFile", "getStudentTimeline", "getStudentDocuments", "getStudentEnrollments"],
  "Alumno": ["getAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "getWhatsAppLink", "getStudentEnrollmentHistory", "getAcademicYears", "getAcademicPeriods", "getAcademicOffers", "getAcademicCalendar", "getClassSchedules", "getStudentFile", "getStudentTimeline", "getStudentDocuments", "getStudentEnrollments"]
};

const PUBLIC_ACTIONS = ["ping", "createAdmissionRequest"];

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
  try {
    if (!e || !e.postData || !e.postData.contents) return textResponse({ status: "error", message: "No se recibieron datos." });
    const { action, payload } = JSON.parse(e.postData.contents);
    const authCheck = validateRolePermission(action, payload);
    if (!authCheck.authorized) {
      logStructuredEvent("ACADEMIC", action, "WARN", "AUTH_PERMISSION_DENIED", `Acceso denegado a ${action} para rol ${authCheck.role}`, payload, authCheck.role);
      return textResponse({ status: "error", code: "AUTH_PERMISSION_DENIED", message: "Acceso denegado: El rol " + authCheck.role + " no tiene permiso para la acción " + action + "." });
    }
    let result;
    switch (action) {
      // Endpoints Anteriores
      case "getAcademicConfig": result = getAcademicConfig(payload); break;
      case "updateAcademicConfig": result = updateAcademicConfig(payload); break;
      case "getAcademicHistory": result = getAcademicHistory(payload); break;
      case "getAsignaturasActivas": result = getAsignaturasActivas(payload); break;
      case "updateAsignaturasActivas": result = updateAsignaturasActivas(payload); break;
      case "saveWhatsAppLink": result = saveWhatsAppLink(payload); break;
      case "getWhatsAppLink": result = getWhatsAppLink(payload); break;
      case "getQuestionBank": result = getQuestionBank(payload); break;
      case "saveQuestion": result = saveQuestion(payload); break;
      case "generateMigrationReport": result = generateMigrationReport(payload); break;
      case "registerStudentEnrollment": result = registerStudentEnrollment(payload); break;
      case "getStudentEnrollmentHistory": result = getStudentEnrollmentHistory(payload); break;
      case "createSystemBackup": result = createSystemBackup(payload); break;
      case "listSystemBackups": result = listSystemBackups(payload); break;
      case "verifyBackupIntegrity": result = verifyBackupIntegrity(payload); break;
      case "restoreSystemBackup": result = restoreSystemBackup(payload); break;

      // Endpoints Fase 3
      case "getInstitutionParams": result = getInstitutionParams(payload); break;
      case "saveInstitutionParam": result = saveInstitutionParam(payload); break;
      case "getAcademicYears": result = getAcademicYears(payload); break;
      case "createAcademicYear": result = createAcademicYear(payload); break;
      case "updateAcademicYearStatus": result = updateAcademicYearStatus(payload); break;
      case "prepareNewAcademicYear": result = prepareNewAcademicYear(payload); break;
      case "getAcademicPeriods": result = getAcademicPeriods(payload); break;
      case "manageAcademicPeriod": result = manageAcademicPeriod(payload); break;
      case "getSubjectCatalog": result = getSubjectCatalog(payload); break;
      case "createSubjectCatalogItem": result = createSubjectCatalogItem(payload); break;
      case "getStudyPlans": result = getStudyPlans(payload); break;
      case "createStudyPlan": result = createStudyPlan(payload); break;
      case "getAcademicOffers": result = getAcademicOffers(payload); break;
      case "createAcademicOffer": result = createAcademicOffer(payload); break;
      case "getTeacherAssignments": result = getTeacherAssignments(payload); break;
      case "assignTeacherToClass": result = assignTeacherToClass(payload); break;
      case "createTeacherSubstitution": result = createTeacherSubstitution(payload); break;
      case "getAcademicCalendar": result = getAcademicCalendar(payload); break;
      case "createCalendarEvent": result = createCalendarEvent(payload); break;
      case "getClassSchedules": result = getClassSchedules(payload); break;
      case "createClassSchedule": result = createClassSchedule(payload); break;
      case "getAcademicRules": result = getAcademicRules(payload); break;
      case "saveAcademicRule": result = saveAcademicRule(payload); break;

      // Nuevos Endpoints Fase 4 - Admisiones, Expedientes, Matrículas y Movimientos
      case "createAdmissionRequest": result = createAdmissionRequest(payload); break;
      case "getAdmissionRequests": result = getAdmissionRequests(payload); break;
      case "updateAdmissionStatus": result = updateAdmissionStatus(payload); break;
      case "convertAdmissionToStudent": result = convertAdmissionToStudent(payload); break;
      case "getStudentFile": result = getStudentFile(payload); break;
      case "updateStudentFile": result = updateStudentFile(payload); break;
      case "getStudentTimeline": result = getStudentTimeline(payload); break;
      case "findDuplicateStudents": result = findDuplicateStudents(payload); break;
      case "mergeStudentFiles": result = mergeStudentFiles(payload); break;
      case "getStudentGuardians": result = getStudentGuardians(payload); break;
      case "saveStudentGuardian": result = saveStudentGuardian(payload); break;
      case "unlinkStudentGuardian": result = unlinkStudentGuardian(payload); break;
      case "uploadStudentDocument": result = uploadStudentDocument(payload); break;
      case "getStudentDocuments": result = getStudentDocuments(payload); break;
      case "updateDocumentStatus": result = updateDocumentStatus(payload); break;
      case "createStudentEnrollment": result = createStudentEnrollment(payload); break;
      case "getStudentEnrollments": result = getStudentEnrollments(payload); break;
      case "renewStudentEnrollment": result = renewStudentEnrollment(payload); break;
      case "checkEnrollmentCapacity": result = checkEnrollmentCapacity(payload); break;
      case "changeStudentSection": result = changeStudentSection(payload); break;
      case "recordStudentTransfer": result = recordStudentTransfer(payload); break;
      case "recordStudentWithdrawal": result = recordStudentWithdrawal(payload); break;
      case "processStudentReentry": result = processStudentReentry(payload); break;

      case "ping": result = { status: "success", service: "ACADEMIC", timestamp: new Date().toISOString(), dbConnected: true }; break;
      default: result = { status: "error", message: `Acción no reconocida: ${action}` };
    }
    return textResponse(result);
  } catch (err) {
    logStructuredEvent("ACADEMIC", "doPost", "ERROR", "UNHANDLED_EXCEPTION", err.message, e ? e.postData : null, "Sistema");
    return textResponse({ status: "error", message: err.message || "Error interno académico." });
  }
}

// ---------------------------------------------------------------------------
// FASE 4: 1. ADMISIONES Y SOLICITUDES DE INGRESO
// ---------------------------------------------------------------------------

function createAdmissionRequest(payload) {
  const { anolectivo, gradoSolicitado, nombresAspirante, apellidosAspirante, identificacion, fechaNacimiento, nombreResponsable, telefonoContacto, emailContacto, observaciones, canalIngreso } = payload || {};
  if (!nombresAspirante || !apellidosAspirante || !gradoSolicitado) {
    throw new Error("Nombres del aspirante, apellidos y grado solicitado son obligatorios.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SolicitudesAdmision");
  const now = new Date();
  const solicitudId = "ADM-" + now.getTime();

  sheet.appendRow([
    solicitudId,
    now,
    anolectivo || "2026",
    gradoSolicitado,
    nombresAspirante.trim(),
    apellidosAspirante.trim(),
    identificacion ? String(identificacion).trim() : "",
    fechaNacimiento || "",
    nombreResponsable || "",
    telefonoContacto ? String(telefonoContacto).trim() : "",
    emailContacto ? String(emailContacto).trim().toLowerCase() : "",
    "Recibida",
    canalIngreso || "Web/Portal",
    observaciones || "",
    "" // ExpedienteID inicialmente vacío
  ]);

  logStructuredEvent("ACADEMIC", "createAdmissionRequest", "INFO", "ADMISSION_CREATED", `Solicitud de admisión ${solicitudId} registrada para ${nombresAspirante} ${apellidosAspirante}`, { solicitudId, gradoSolicitado }, payload && payload.authRole);

  return { status: "success", solicitudId: solicitudId, message: "Solicitud de admisión registrada con éxito." };
}

function getAdmissionRequests(payload) {
  const { estado, anolectivo, grado } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "SolicitudesAdmision").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (estado) filtered = filtered.filter(r => String(r[11]).trim() === String(estado).trim());
  if (anolectivo) filtered = filtered.filter(r => String(r[2]).trim() === String(anolectivo).trim());
  if (grado) filtered = filtered.filter(r => normalizeString(r[3]) === normalizeString(grado));

  const mapped = filtered.map(r => ({
    solicitudId: r[0],
    fechaSolicitud: r[1],
    anolectivo: r[2],
    gradoSolicitado: r[3],
    nombresAspirante: r[4],
    apellidosAspirante: r[5],
    identificacion: r[6],
    fechaNacimiento: r[7],
    nombreResponsable: r[8],
    telefonoContacto: r[9],
    emailContacto: r[10],
    estadoSolicitud: r[11],
    canalIngreso: r[12],
    observaciones: r[13],
    expedienteId: r[14]
  }));

  return { status: "success", requests: mapped };
}

function updateAdmissionStatus(payload) {
  const { solicitudId, nuevoEstado, observaciones } = payload || {};
  if (!solicitudId || !nuevoEstado) throw new Error("solicitudId y nuevoEstado requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SolicitudesAdmision");
  const data = sheet.getDataRange().getValues();

  const idx = data.findIndex(r => String(r[0]).trim() === String(solicitudId).trim());
  if (idx === -1) throw new Error("Solicitud de admisión no encontrada.");

  sheet.getRange(idx + 1, 12).setValue(nuevoEstado);
  if (observaciones) {
    sheet.getRange(idx + 1, 14).setValue(observaciones);
  }

  logStructuredEvent("ACADEMIC", "updateAdmissionStatus", "INFO", "ADMISSION_STATUS_UPDATED", `Estado de solicitud ${solicitudId} cambiado a ${nuevoEstado}`, { solicitudId, nuevoEstado }, payload && payload.authRole);

  return { status: "success", message: `Estado de la solicitud actualizado a '${nuevoEstado}'.` };
}

function convertAdmissionToStudent(payload) {
  const { solicitudId, userId, codigoInstitucional, seccion } = payload || {};
  if (!solicitudId) throw new Error("solicitudId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const admSheet = getOrCreateSheet(ss, "SolicitudesAdmision");
  const admData = admSheet.getDataRange().getValues();

  const idx = admData.findIndex(r => String(r[0]).trim() === String(solicitudId).trim());
  if (idx === -1) throw new Error("Solicitud de admisión no encontrada.");

  const row = admData[idx];
  const nombres = row[4];
  const apellidos = row[5];
  const identificacion = row[6];
  const fechaNac = row[7];
  const grado = row[3];
  const anolectivo = row[2];

  // 1. Crear o recuperar Expediente
  const expSheet = getOrCreateSheet(ss, "ExpedientesEstudiantes");
  const expData = expSheet.getDataRange().getValues();

  let expId;
  let dupExp = expData.find(r => normalizeString(`${r[1]}`) === normalizeString(userId) || (identificacion && String(r[2]).trim() === String(identificacion).trim()));

  const now = new Date();
  const code = codigoInstitucional || ("STU-" + now.getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000));

  if (dupExp) {
    expId = dupExp[0];
  } else {
    expId = "EXP-" + now.getTime();
    expSheet.appendRow([
      expId,
      userId || ("PER-" + Date.now()),
      code,
      fechaNac || "",
      "Hondureña",
      row[10] || "",
      "",
      "Activo",
      now,
      now,
      `Admisión aprobada desde solicitud ${solicitudId}`
    ]);
  }

  // 2. Marcar Solicitud como Convertida
  admSheet.getRange(idx + 1, 12).setValue("Convertida");
  admSheet.getRange(idx + 1, 15).setValue(expId);

  // 3. Registrar Matrícula Inicial
  const targetUserId = userId || ("USR-" + Date.now());
  const enrollRes = registerStudentEnrollment({
    userId: targetUserId,
    alumno: `${nombres} ${apellidos}`,
    grado: grado,
    seccion: seccion || "A",
    periodo: anolectivo,
    tipo: "IngresoNuevo",
    observaciones: `Convertido desde solicitud ${solicitudId}`
  });

  const matriculaRealId = (enrollRes && enrollRes.matriculaId) ? enrollRes.matriculaId : ("MAT-" + now.getTime());

  // 4. Registrar Movimiento Inicial
  const movSheet = getOrCreateSheet(ss, "MovimientosEstudiante");
  movSheet.appendRow([
    "MOV-" + now.getTime(),
    expId,
    matriculaRealId,
    anolectivo,
    "IngresoNuevo",
    "", "", grado, seccion || "A",
    now,
    `Admisión y Matrícula Inicial`,
    (payload && payload.userId) || "Secretaría",
    "Confirmado"
  ]);

  return {
    status: "success",
    expedienteId: expId,
    codigoInstitucional: code,
    message: "Solicitud convertida exitosamente en expediente de estudiante y matrícula activa."
  };
}

// ---------------------------------------------------------------------------
// FASE 4: 2. EXPEDIENTE DIGITAL INTEGRAL Y LÍNEA DE TIEMPO
// ---------------------------------------------------------------------------

function getStudentFile(payload) {
  const { expedienteId, userId, codigoInstitucional } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const expSheet = getOrCreateSheet(ss, "ExpedientesEstudiantes");
  const expRows = expSheet.getDataRange().getValues().slice(1);

  const exp = expRows.find(r =>
    (expedienteId && String(r[0]).trim() === String(expedienteId).trim()) ||
    (userId && String(r[1]).trim() === String(userId).trim()) ||
    (codigoInstitucional && String(r[2]).trim() === String(codigoInstitucional).trim())
  );

  if (!exp) return { status: "error", message: "Expediente de estudiante no encontrado." };

  const targetExpId = exp[0];
  const targetUserId = exp[1];

  // Cargar Matrículas
  const matRows = getOrCreateSheet(ss, "Matriculas").getDataRange().getValues().slice(1);
  const enrollments = matRows.filter(r => String(r[2]).trim() === String(targetUserId).trim()).map(r => ({
    matriculaId: r[0],
    fecha: r[1],
    userId: r[2],
    alumno: r[3],
    grado: r[4],
    seccion: r[5],
    periodo: r[6],
    tipo: r[7],
    estado: r[8],
    becaDescuento: r[9],
    observaciones: r[10]
  }));

  // Cargar Tutores/Responsables
  const relRows = getOrCreateSheet(ss, "RelacionesEstudianteTutor").getDataRange().getValues().slice(1);
  const tutRows = getOrCreateSheet(ss, "ResponsablesTutores").getDataRange().getValues().slice(1);

  const studentRels = relRows.filter(r => String(r[1]).trim() === String(targetExpId).trim());
  const guardians = studentRels.map(r => {
    const tut = tutRows.find(t => String(t[0]).trim() === String(r[2]).trim());
    return {
      relacionId: r[0],
      responsableId: r[2],
      nombres: tut ? tut[2] : "",
      apellidos: tut ? tut[3] : "",
      identificacion: tut ? tut[4] : "",
      telefono: tut ? tut[5] : "",
      email: tut ? tut[6] : "",
      tipoParentesco: r[3],
      esRepresentanteLegal: r[4],
      esContactoEmergencia: r[5],
      esResponsableFinanciero: r[6],
      autorizadoPickUp: r[7],
      accesoPortal: r[8]
    };
  });

  // Cargar Documentos
  const docRows = getOrCreateSheet(ss, "DocumentosEstudiante").getDataRange().getValues().slice(1);
  const docs = docRows.filter(r => String(r[1]).trim() === String(targetExpId).trim()).map(r => ({
    documentoId: r[0],
    tipoDocumento: r[3],
    nombreArchivo: r[4],
    driveUrl: r[6],
    fechaRecepcion: r[7],
    estadoRevision: r[9]
  }));

  // Cargar Movimientos
  const movRows = getOrCreateSheet(ss, "MovimientosEstudiante").getDataRange().getValues().slice(1);
  const moves = movRows.filter(r => String(r[1]).trim() === String(targetExpId).trim()).map(r => ({
    movimientoId: r[0],
    anoLectivo: r[3],
    tipoMovimiento: r[4],
    gradoOrigen: r[5],
    seccionOrigen: r[6],
    gradoDestino: r[7],
    seccionDestino: r[8],
    fechaEfectiva: r[9],
    motivo: r[10]
  }));

  return {
    status: "success",
    studentFile: {
      expedienteId: exp[0],
      personaId: exp[1],
      userId: targetUserId,
      codigoInstitucional: exp[2],
      fechaNacimiento: exp[3],
      nacionalidad: exp[4],
      direccionResidencia: exp[5],
      fotografiaUrl: exp[6],
      estadoExpediente: exp[7],
      fechaCreacion: exp[8],
      observaciones: exp[10],
      enrollments: enrollments,
      guardians: guardians,
      documents: docs,
      movements: moves
    }
  };
}

function updateStudentFile(payload) {
  const { expedienteId, fechaNacimiento, nacionalidad, direccionResidencia, fotografiaUrl, estadoExpediente, observaciones } = payload || {};
  if (!expedienteId) throw new Error("expedienteId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ExpedientesEstudiantes");
  const data = sheet.getDataRange().getValues();

  const idx = data.findIndex(r => String(r[0]).trim() === String(expedienteId).trim());
  if (idx === -1) throw new Error("Expediente de estudiante no encontrado.");

  const now = new Date();
  if (fechaNacimiento !== undefined) sheet.getRange(idx + 1, 4).setValue(fechaNacimiento);
  if (nacionalidad !== undefined) sheet.getRange(idx + 1, 5).setValue(nacionalidad);
  if (direccionResidencia !== undefined) sheet.getRange(idx + 1, 6).setValue(direccionResidencia);
  if (fotografiaUrl !== undefined) sheet.getRange(idx + 1, 7).setValue(fotografiaUrl);
  if (estadoExpediente !== undefined) sheet.getRange(idx + 1, 8).setValue(estadoExpediente);
  sheet.getRange(idx + 1, 10).setValue(now);
  if (observaciones !== undefined) sheet.getRange(idx + 1, 11).setValue(observaciones);

  return { status: "success", message: "Expediente digital actualizado exitosamente." };
}

function getStudentTimeline(payload) {
  const { expedienteId } = payload || {};
  const fileRes = getStudentFile(payload);
  if (fileRes.status !== "success") return fileRes;

  const exp = fileRes.studentFile;
  const events = [];

  if (exp.fechaCreacion) {
    events.push({ fecha: exp.fechaCreacion, tipo: "CreacionExpediente", titulo: "Apertura de Expediente Digital", detalle: `Código: ${exp.codigoInstitucional}` });
  }

  exp.enrollments.forEach(e => {
    events.push({ fecha: e.fecha, tipo: "Matricula", titulo: `Matrícula ${e.tipo}`, detalle: `Año ${e.periodo} - ${e.grado} (Secc. ${e.seccion})` });
  });

  exp.movements.forEach(m => {
    events.push({ fecha: m.fechaEfectiva, tipo: m.tipoMovimiento, titulo: `Movimiento: ${m.tipoMovimiento}`, detalle: `${m.gradoOrigen || ''} ${m.seccionOrigen || ''} -> ${m.gradoDestino || ''} ${m.seccionDestino || ''} (${m.motivo || ''})` });
  });

  exp.documents.forEach(d => {
    events.push({ fecha: d.fechaRecepcion, tipo: "Documento", titulo: `Documento ${d.tipoDocumento}`, detalle: `${d.nombreArchivo} - Estado: ${d.estadoRevision}` });
  });

  events.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return { status: "success", timeline: events };
}

// ---------------------------------------------------------------------------
// FASE 4: 3. DETECCIÓN Y FUSIÓN CONTROLADA DE DUPLICADOS
// ---------------------------------------------------------------------------

function findDuplicateStudents(payload) {
  const { nombres, apellidos, identificacion, email } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const admRows = getOrCreateSheet(ss, "SolicitudesAdmision").getDataRange().getValues().slice(1);
  const expRows = getOrCreateSheet(ss, "ExpedientesEstudiantes").getDataRange().getValues().slice(1);
  const userRows = ss.getSheetByName("Usuarios") ? ss.getSheetByName("Usuarios").getDataRange().getValues().slice(1) : [];

  const normIdent = normalizeString(identificacion);
  const normEmail = normalizeString(email);
  const normFullName = normalizeString(`${nombres || ''} ${apellidos || ''}`);

  const candidates = [];

  expRows.forEach(e => {
    const user = userRows.find(u => String(u[0]).trim() === String(e[1]).trim());
    const uNombre = user ? user[1] : "";
    const uEmail = user ? user[4] : "";

    let matchReason = null;
    if (normIdent && user && normalizeString(user[8]) === normIdent) matchReason = "IDENTIFICACION_EXACTA";
    else if (normEmail && uEmail && normalizeString(uEmail) === normEmail) matchReason = "EMAIL_EXACTO";
    else if (normFullName && uNombre && normalizeString(uNombre) === normFullName) matchReason = "NOMBRE_SIMILAR";

    if (matchReason) {
      candidates.push({
        expedienteId: e[0],
        userId: e[1],
        codigoInstitucional: e[2],
        nombreAlumno: uNombre,
        email: uEmail,
        coincidencia: matchReason
      });
    }
  });

  return { status: "success", duplicatesCount: candidates.length, candidates: candidates };
}

function mergeStudentFiles(payload) {
  const { targetExpedienteId, sourceExpedienteId, motivo } = payload || {};
  if (!targetExpedienteId || !sourceExpedienteId) throw new Error("targetExpedienteId y sourceExpedienteId son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const expSheet = getOrCreateSheet(ss, "ExpedientesEstudiantes");
  const expData = expSheet.getDataRange().getValues();

  const targetIdx = expData.findIndex(r => String(r[0]).trim() === String(targetExpedienteId).trim());
  const sourceIdx = expData.findIndex(r => String(r[0]).trim() === String(sourceExpedienteId).trim());

  if (targetIdx === -1 || sourceIdx === -1) throw new Error("Uno o ambos expedientes no fueron encontrados.");

  // Re-vincular documentos y movimientos del expediente origen al expediente destino
  const docSheet = getOrCreateSheet(ss, "DocumentosEstudiante");
  const docData = docSheet.getDataRange().getValues();
  for (let i = 1; i < docData.length; i++) {
    if (String(docData[i][1]).trim() === String(sourceExpedienteId).trim()) {
      docSheet.getRange(i + 1, 2).setValue(targetExpedienteId);
    }
  }

  const movSheet = getOrCreateSheet(ss, "MovimientosEstudiante");
  const movData = movSheet.getDataRange().getValues();
  for (let i = 1; i < movData.length; i++) {
    if (String(movData[i][1]).trim() === String(sourceExpedienteId).trim()) {
      movSheet.getRange(i + 1, 2).setValue(targetExpedienteId);
    }
  }

  // Marcar expediente origen como Fusionado/Inactivo
  expSheet.getRange(sourceIdx + 1, 8).setValue("Fusionado");
  expSheet.getRange(sourceIdx + 1, 11).setValue(`Fusionado con expediente principal ${targetExpedienteId}. Motivo: ${motivo || 'N/A'}`);

  logStructuredEvent("ACADEMIC", "mergeStudentFiles", "WARN", "FILES_MERGED", `Expediente ${sourceExpedienteId} fusionado en ${targetExpedienteId}`, { targetExpedienteId, sourceExpedienteId, motivo }, payload && payload.authRole);

  return { status: "success", message: `Expedientes fusionados correctamente. ${sourceExpedienteId} se ha consolidado en ${targetExpedienteId}.` };
}

// ---------------------------------------------------------------------------
// FASE 4: 4. PADRES, TUTORES Y RESPONSABLES
// ---------------------------------------------------------------------------

function getStudentGuardians(payload) {
  const { expedienteId } = payload || {};
  if (!expedienteId) throw new Error("expedienteId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const relRows = getOrCreateSheet(ss, "RelacionesEstudianteTutor").getDataRange().getValues().slice(1);
  const tutRows = getOrCreateSheet(ss, "ResponsablesTutores").getDataRange().getValues().slice(1);

  const studentRels = relRows.filter(r => String(r[1]).trim() === String(expedienteId).trim() && r[9] === "Activo");

  const guardians = studentRels.map(r => {
    const tut = tutRows.find(t => String(t[0]).trim() === String(r[2]).trim());
    return {
      relacionId: r[0],
      expedienteId: r[1],
      responsableId: r[2],
      nombres: tut ? tut[2] : "",
      apellidos: tut ? tut[3] : "",
      identificacion: tut ? tut[4] : "",
      telefono: tut ? tut[5] : "",
      email: tut ? tut[6] : "",
      direccion: tut ? tut[7] : "",
      ocupacion: tut ? tut[8] : "",
      tipoParentesco: r[3],
      esRepresentanteLegal: r[4],
      esContactoEmergencia: r[5],
      esResponsableFinanciero: r[6],
      autorizadoPickUp: r[7],
      accesoPortal: r[8],
      observaciones: r[10]
    };
  });

  return { status: "success", guardians: guardians };
}

function saveStudentGuardian(payload) {
  const { expedienteId, responsableId, nombres, apellidos, identificacion, telefono, email, direccion, ocupacion, tipoParentesco, esRepresentanteLegal, esContactoEmergencia, esResponsableFinanciero, autorizadoPickUp, accesoPortal, observaciones } = payload || {};
  if (!expedienteId || !nombres || !apellidos) throw new Error("expedienteId, nombres y apellidos del responsable son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const tutSheet = getOrCreateSheet(ss, "ResponsablesTutores");
  const tutData = tutSheet.getDataRange().getValues();

  let respId = responsableId;
  const normIdent = normalizeString(identificacion);
  const normEmail = normalizeString(email);

  let existingTutIdx = -1;
  if (respId) {
    existingTutIdx = tutData.findIndex(r => String(r[0]).trim() === String(respId).trim());
  } else if (normIdent || normEmail) {
    existingTutIdx = tutData.findIndex(r => (normIdent && normalizeString(r[4]) === normIdent) || (normEmail && normalizeString(r[6]) === normEmail));
  }

  const now = new Date();

  if (existingTutIdx !== -1) {
    respId = tutData[existingTutIdx][0];
    tutSheet.getRange(existingTutIdx + 1, 3, 1, 7).setValues([[
      nombres.trim(),
      apellidos.trim(),
      identificacion ? String(identificacion).trim() : "",
      telefono ? String(telefono).trim() : "",
      email ? String(email).trim().toLowerCase() : "",
      direccion || "",
      ocupacion || ""
    ]]);
  } else {
    respId = "RES-" + now.getTime();
    tutSheet.appendRow([
      respId,
      "PER-" + Date.now(),
      nombres.trim(),
      apellidos.trim(),
      identificacion ? String(identificacion).trim() : "",
      telefono ? String(telefono).trim() : "",
      email ? String(email).trim().toLowerCase() : "",
      direccion || "",
      ocupacion || "",
      "Activo"
    ]);
  }

  // Vincular con Expediente
  const relSheet = getOrCreateSheet(ss, "RelacionesEstudianteTutor");
  const relData = relSheet.getDataRange().getValues();

  let relIdx = relData.findIndex(r => String(r[1]).trim() === String(expedienteId).trim() && String(r[2]).trim() === String(respId).trim());

  if (relIdx !== -1) {
    relSheet.getRange(relIdx + 1, 4, 1, 7).setValues([[
      tipoParentesco || "Padre/Madre",
      esRepresentanteLegal !== undefined ? esRepresentanteLegal : true,
      esContactoEmergencia !== undefined ? esContactoEmergencia : true,
      esResponsableFinanciero !== undefined ? esResponsableFinanciero : true,
      autorizadoPickUp !== undefined ? autorizadoPickUp : true,
      accesoPortal !== undefined ? accesoPortal : true,
      "Activo"
    ]]);
  } else {
    const relId = "REL-" + Math.floor(10000 + Math.random() * 90000);
    relSheet.appendRow([
      relId,
      expedienteId,
      respId,
      tipoParentesco || "Padre/Madre",
      esRepresentanteLegal !== undefined ? esRepresentanteLegal : true,
      esContactoEmergencia !== undefined ? esContactoEmergencia : true,
      esResponsableFinanciero !== undefined ? esResponsableFinanciero : true,
      autorizadoPickUp !== undefined ? autorizadoPickUp : true,
      accesoPortal !== undefined ? accesoPortal : true,
      "Activo",
      observaciones || ""
    ]);
  }

  return { status: "success", responsableId: respId, message: "Tutor/Responsable vinculado al expediente con éxito." };
}

function unlinkStudentGuardian(payload) {
  const { relacionId } = payload || {};
  if (!relacionId) throw new Error("relacionId requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "RelacionesEstudianteTutor");
  const data = sheet.getDataRange().getValues();

  const idx = data.findIndex(r => String(r[0]).trim() === String(relacionId).trim());
  if (idx === -1) throw new Error("Relación no encontrada.");

  sheet.getRange(idx + 1, 10).setValue("Inactivo");
  return { status: "success", message: "Vínculo de responsable deshabilitado." };
}

// ---------------------------------------------------------------------------
// FASE 4: 5. GESTIÓN DOCUMENTAL DE EXPEDIENTES
// ---------------------------------------------------------------------------

function uploadStudentDocument(payload) {
  const { expedienteId, solicitudId, tipoDocumento, fileName, fileData, fechaVencimiento, observaciones } = payload || {};
  if ((!expedienteId && !solicitudId) || !tipoDocumento || !fileData) {
    throw new Error("expedienteId o solicitudId, tipoDocumento y fileData son requeridos.");
  }

  let driveFileId = "";
  let driveUrl = "";

  try {
    const root = DriveApp.getRootFolder();
    let mainFolder = root.getFoldersByName("New Generation");
    let parent = mainFolder.hasNext() ? mainFolder.next() : root.createFolder("New Generation");
    let docFolder = parent.getFoldersByName("Documentos_Estudiantes");
    let targetFolder = docFolder.hasNext() ? docFolder.next() : parent.createFolder("Documentos_Estudiantes");

    const mimeType = fileData.split(',')[0].match(/:(.*?);/)[1];
    const base64Data = fileData.split(',')[1];
    const file = targetFolder.createFile(Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName || `${tipoDocumento}_${Date.now()}`));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    driveFileId = file.getId();
    driveUrl = `https://lh3.googleusercontent.com/d/${file.getId()}`;
  } catch (e) {
    logDebug("Error subida archivo documento estudiante:", e.message);
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "DocumentosEstudiante");
  const now = new Date();
  const docId = "DOC-" + now.getTime();

  sheet.appendRow([
    docId,
    expedienteId || "",
    solicitudId || "",
    tipoDocumento,
    fileName || tipoDocumento,
    driveFileId,
    driveUrl,
    now,
    fechaVencimiento || "",
    "EnRevision",
    (payload && payload.userId) || "Secretaría",
    "",
    observaciones || ""
  ]);

  return { status: "success", documentoId: docId, driveUrl: driveUrl, message: "Documento adjuntado al expediente correctamente." };
}

function getStudentDocuments(payload) {
  const { expedienteId, solicitudId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "DocumentosEstudiante").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (expedienteId) filtered = filtered.filter(r => String(r[1]).trim() === String(expedienteId).trim());
  if (solicitudId) filtered = filtered.filter(r => String(r[2]).trim() === String(solicitudId).trim());

  const mapped = filtered.map(r => ({
    documentoId: r[0],
    expedienteId: r[1],
    solicitudId: r[2],
    tipoDocumento: r[3],
    nombreArchivo: r[4],
    driveFileId: r[5],
    driveUrl: r[6],
    fechaRecepcion: r[7],
    fechaVencimiento: r[8],
    estadoRevision: r[9],
    subidoPor: r[10],
    validadoPor: r[11],
    observaciones: r[12]
  }));

  return { status: "success", documents: mapped };
}

function updateDocumentStatus(payload) {
  const { documentoId, nuevoEstado, observaciones } = payload || {};
  if (!documentoId || !nuevoEstado) throw new Error("documentoId y nuevoEstado requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "DocumentosEstudiante");
  const data = sheet.getDataRange().getValues();

  const idx = data.findIndex(r => String(r[0]).trim() === String(documentoId).trim());
  if (idx === -1) throw new Error("Documento no encontrado.");

  sheet.getRange(idx + 1, 10).setValue(nuevoEstado);
  sheet.getRange(idx + 1, 12).setValue((payload && payload.userId) || "Secretaría");
  if (observaciones) sheet.getRange(idx + 1, 13).setValue(observaciones);

  return { status: "success", message: `Estado del documento actualizado a '${nuevoEstado}'.` };
}

// ---------------------------------------------------------------------------
// FASE 4: 6. MATRÍCULAS, RENOVACIONES Y CONTROL DE CUPOS
// ---------------------------------------------------------------------------

function checkEnrollmentCapacity(payload) {
  const { anolectivo, grado, seccion } = payload || {};
  if (!grado || !seccion) throw new Error("Grado y sección requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const targetAno = anolectivo || "2026";

  // Consultar capacidad máxima en OfertaAcademica si existe
  const offerRows = getOrCreateSheet(ss, "OfertaAcademica").getDataRange().getValues().slice(1);
  const offer = offerRows.find(r => String(r[1]).trim() === String(targetAno).trim() && normalizeString(r[3]) === normalizeString(grado) && normalizeString(r[4]) === normalizeString(seccion));

  const maxCapacity = offer ? parseInt(offer[8] || 35) : 35;

  // Consultar ocupación en Matriculas
  const matRows = getOrCreateSheet(ss, "Matriculas").getDataRange().getValues().slice(1);
  const currentEnrolled = matRows.filter(r => String(r[6]).trim() === String(targetAno).trim() && normalizeString(r[4]) === normalizeString(grado) && normalizeString(r[5]) === normalizeString(seccion) && (r[8] === "Activa" || r[8] === "Confirmada")).length;

  const availableSlots = Math.max(0, maxCapacity - currentEnrolled);

  return {
    status: "success",
    anolectivo: targetAno,
    grado: grado,
    seccion: seccion,
    capacidadMaxima: maxCapacity,
    inscritosActuales: currentEnrolled,
    cuposDisponibles: availableSlots,
    hayCupo: availableSlots > 0
  };
}

function createStudentEnrollment(payload) {
  const { userId, alumno, grado, seccion, anolectivo, tipo, becaDescuento, observaciones, forceCapacityOverride } = payload || {};
  if (!userId || !grado || !seccion) throw new Error("userId, grado y sección requeridos.");

  const targetAno = anolectivo || "2026";
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1. Validar Cupos
  if (!forceCapacityOverride) {
    const cap = checkEnrollmentCapacity({ anolectivo: targetAno, grado, seccion });
    if (!cap.hayCupo) {
      return { status: "error", code: "SECTION_FULL", message: `La sección ${seccion} del grado ${grado} ha alcanzado su capacidad máxima (${cap.capacidadMaxima}).` };
    }
  }

  // 2. Prevenir doble matrícula activa en el mismo año
  const matSheet = getOrCreateSheet(ss, "Matriculas");
  const matData = matSheet.getDataRange().getValues();
  const sUserId = String(userId).trim();

  const dup = matData.find(r => String(r[2]).trim() === sUserId && String(r[6]).trim() === String(targetAno).trim() && (r[8] === "Activa" || r[8] === "Confirmada"));
  if (dup) {
    return { status: "success", matriculaId: dup[0], isExisting: true, message: `El estudiante ya cuenta con una matrícula activa para el año ${targetAno}.` };
  }

  const now = new Date();
  const matriculaId = "MAT-" + targetAno + "-" + Math.floor(10000 + Math.random() * 90000);

  matSheet.appendRow([
    matriculaId,
    now,
    sUserId,
    alumno || "Estudiante",
    grado,
    seccion,
    targetAno,
    tipo || "IngresoNuevo",
    "Confirmada",
    becaDescuento || 0,
    observaciones || ""
  ]);

  logStructuredEvent("ACADEMIC", "createStudentEnrollment", "INFO", "ENROLLMENT_CREATED", `Matrícula ${matriculaId} confirmada para ${alumno} en ${grado} ${seccion} (${targetAno})`, { matriculaId, targetAno, grado, seccion }, payload && payload.authRole);

  return { status: "success", matriculaId: matriculaId, message: "Matrícula procesada y confirmada con éxito." };
}

function getStudentEnrollments(payload) {
  const { userId, anolectivo } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "Matriculas").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (userId) filtered = filtered.filter(r => String(r[2]).trim() === String(userId).trim());
  if (anolectivo) filtered = filtered.filter(r => String(r[6]).trim() === String(anolectivo).trim());

  const mapped = filtered.map(r => ({
    matriculaId: r[0],
    fecha: r[1],
    userId: r[2],
    alumno: r[3],
    grado: r[4],
    seccion: r[5],
    periodo: r[6],
    tipo: r[7],
    estado: r[8],
    becaDescuento: r[9],
    observaciones: r[10]
  }));

  return { status: "success", enrollments: mapped };
}

function renewStudentEnrollment(payload) {
  const { userId, nuevoAnoLectivo, nuevoGrado, nuevaSeccion } = payload || {};
  if (!userId || !nuevoAnoLectivo || !nuevoGrado) throw new Error("userId, nuevoAñoLectivo y nuevoGrado son requeridos.");

  return createStudentEnrollment({
    userId: userId,
    anolectivo: nuevoAnoLectivo,
    grado: nuevoGrado,
    seccion: nuevaSeccion || "A",
    tipo: "Renovacion",
    authRole: payload && payload.authRole,
    userId: payload && payload.userId
  });
}

// ---------------------------------------------------------------------------
// FASE 4: 7. MOVIMIENTOS ESTUDIANTILES (TRASLADOS, RETIROS, REINGRESOS)
// ---------------------------------------------------------------------------

function changeStudentSection(payload) {
  const { expedienteId, userId, anolectivo, nuevaSeccion, motivo } = payload || {};
  if ((!expedienteId && !userId) || !nuevaSeccion) throw new Error("Expediente/userId y nuevaSeccion son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const targetAno = anolectivo || "2026";

  const matSheet = getOrCreateSheet(ss, "Matriculas");
  const matData = matSheet.getDataRange().getValues();
  const sUserId = String(userId).trim();

  const idx = matData.findIndex(r => String(r[2]).trim() === sUserId && String(r[6]).trim() === String(targetAno).trim() && (r[8] === "Activa" || r[8] === "Confirmada"));
  if (idx === -1) throw new Error("Matrícula activa no encontrada para el estudiante en el año seleccionado.");

  const oldGrado = matData[idx][4];
  const oldSeccion = matData[idx][5];

  // Actualizar Sección en Matrícula
  matSheet.getRange(idx + 1, 6).setValue(nuevaSeccion);

  // Registrar Movimiento Inmutable
  const movSheet = getOrCreateSheet(ss, "MovimientosEstudiante");
  const now = new Date();
  movSheet.appendRow([
    "MOV-" + now.getTime(),
    expedienteId || "",
    matData[idx][0],
    targetAno,
    "CambioSeccion",
    oldGrado,
    oldSeccion,
    oldGrado,
    nuevaSeccion,
    now,
    motivo || "Reubicación de Sección",
    (payload && payload.userId) || "Secretaría",
    "Confirmado"
  ]);

  return { status: "success", message: `Estudiante trasladado exitosamente a la Sección ${nuevaSeccion}.` };
}

function recordStudentTransfer(payload) {
  const { expedienteId, userId, anolectivo, institucionDestino, motivo } = payload || {};
  if (!expedienteId && !userId) throw new Error("expedienteId o userId requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const targetAno = anolectivo || "2026";

  const matSheet = getOrCreateSheet(ss, "Matriculas");
  const matData = matSheet.getDataRange().getValues();
  const sUserId = String(userId).trim();

  const idx = matData.findIndex(r => String(r[2]).trim() === sUserId && String(r[6]).trim() === String(targetAno).trim());
  if (idx !== -1) {
    matSheet.getRange(idx + 1, 9).setValue("Trasladado");
  }

  const movSheet = getOrCreateSheet(ss, "MovimientosEstudiante");
  const now = new Date();
  movSheet.appendRow([
    "MOV-" + now.getTime(),
    expedienteId || "",
    idx !== -1 ? matData[idx][0] : "",
    targetAno,
    "TrasladoExterno",
    idx !== -1 ? matData[idx][4] : "",
    idx !== -1 ? matData[idx][5] : "",
    "Externo",
    institucionDestino || "Otra Institución",
    now,
    motivo || "Traslado Voluntario",
    (payload && payload.userId) || "Secretaría",
    "Confirmado"
  ]);

  return { status: "success", message: "Traslado externo registrado exitosamente. Historial académico conservado." };
}

function recordStudentWithdrawal(payload) {
  const { expedienteId, userId, anolectivo, motivo, tipoRetiro } = payload || {};
  if (!expedienteId && !userId) throw new Error("expedienteId o userId requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const targetAno = anolectivo || "2026";

  const matSheet = getOrCreateSheet(ss, "Matriculas");
  const matData = matSheet.getDataRange().getValues();
  const sUserId = String(userId).trim();

  const idx = matData.findIndex(r => String(r[2]).trim() === sUserId && String(r[6]).trim() === String(targetAno).trim());
  if (idx !== -1) {
    matSheet.getRange(idx + 1, 9).setValue("Retirada");
  }

  const movSheet = getOrCreateSheet(ss, "MovimientosEstudiante");
  const now = new Date();
  movSheet.appendRow([
    "MOV-" + now.getTime(),
    expedienteId || "",
    idx !== -1 ? matData[idx][0] : "",
    targetAno,
    tipoRetiro || "RetiroDefinitivo",
    idx !== -1 ? matData[idx][4] : "",
    idx !== -1 ? matData[idx][5] : "",
    "Retirado",
    "N/A",
    now,
    motivo || "Retiro Solicitado por Familia",
    (payload && payload.userId) || "Secretaría",
    "Confirmado"
  ]);

  return { status: "success", message: "Retiro de estudiante registrado. Expediente histórico conservado para consulta." };
}

function processStudentReentry(payload) {
  const { expedienteId, userId, nuevoAnoLectivo, grado, seccion, motivo } = payload || {};
  if (!userId || !nuevoAnoLectivo || !grado) throw new Error("userId, nuevoAnoLectivo y grado son requeridos.");

  const result = createStudentEnrollment({
    userId: userId,
    anolectivo: nuevoAnoLectivo,
    grado: grado,
    seccion: seccion || "A",
    tipo: "Reingreso",
    observaciones: motivo || "Reingreso tras período fuera del centro",
    authRole: payload && payload.authRole,
    userId: payload && payload.userId
  });

  return { status: "success", matriculaId: result.matriculaId, message: "Reingreso de estudiante procesado con éxito sobre expediente existente." };
}

// ---------------------------------------------------------------------------
// MÓDULO DE COPIAS DE SEGURIDAD Y MANTENIMIENTO SEGURO (REQ-EXP-019)
// ---------------------------------------------------------------------------

function computeSimpleHash(str) {
  let hash = 0;
  if (!str || str.length === 0) return "0";
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return "HASH-" + Math.abs(hash).toString(16);
}

function getBackupFolder() {
  const root = DriveApp.getRootFolder();
  let mainFolder = root.getFoldersByName("New Generation");
  let parent = mainFolder.hasNext() ? mainFolder.next() : root.createFolder("New Generation");
  let respFolder = parent.getFoldersByName("Respaldos");
  return respFolder.hasNext() ? respFolder.next() : parent.createFolder("Respaldos");
}

function createSystemBackup(payload) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets();
    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        spreadsheetId: SPREADSHEET_ID,
        createdById: (payload && payload.userId) || "admin",
        createdByRole: (payload && payload.authRole) || "Administrador",
        version: "v8.4.0"
      },
      sheets: {}
    };

    sheets.forEach(sh => {
      const name = sh.getName();
      const vals = sh.getDataRange().getValues();
      backupData.sheets[name] = vals;
    });

    const jsonString = JSON.stringify(backupData);
    const checksum = computeSimpleHash(jsonString);
    backupData.metadata.checksum = checksum;

    const finalContent = JSON.stringify(backupData, null, 2);
    const folder = getBackupFolder();
    const fileName = "NGCA_Backup_" + new Date().toISOString().replace(/[:.]/g, "-") + ".json";
    const file = folder.createFile(fileName, finalContent, "application/json");

    logStructuredEvent("ACADEMIC", "createSystemBackup", "INFO", "BACKUP_CREATED", `Respaldo ${file.getName()} creado exitosamente.`, { fileId: file.getId(), checksum: checksum }, payload && payload.authRole);

    return {
      status: "success",
      message: "Copia de seguridad creada correctamente.",
      fileId: file.getId(),
      fileName: file.getName(),
      fileUrl: file.getUrl(),
      checksum: checksum,
      timestamp: backupData.metadata.timestamp
    };
  } catch (error) {
    logStructuredEvent("ACADEMIC", "createSystemBackup", "ERROR", "BACKUP_FAILED", error.message, payload, payload && payload.authRole);
    return { status: "error", message: error.message };
  }
}

function listSystemBackups(payload) {
  try {
    const folder = getBackupFolder();
    const files = folder.getFiles();
    const backups = [];

    while (files.hasNext()) {
      const file = files.next();
      if (file.getName().startsWith("NGCA_Backup_") && file.getName().endsWith(".json")) {
        backups.push({
          fileId: file.getId(),
          fileName: file.getName(),
          sizeBytes: file.getSize(),
          createdDate: file.getDateCreated().toISOString(),
          fileUrl: file.getUrl()
        });
      }
    }

    backups.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    return { status: "success", backups: backups };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

function verifyBackupIntegrity(payload) {
  try {
    const { fileId } = payload || {};
    if (!fileId) throw new Error("ID de archivo de respaldo es requerido.");

    const file = DriveApp.getFileById(fileId);
    const content = file.getBlob().getDataAsString();
    const parsed = JSON.parse(content);

    if (!parsed.metadata || !parsed.sheets) {
      return { status: "error", isValid: false, message: "Estructura de respaldo inválida o corrupta." };
    }

    const storedChecksum = parsed.metadata.checksum;
    delete parsed.metadata.checksum;
    const computedChecksum = computeSimpleHash(JSON.stringify(parsed));

    const isValid = (storedChecksum === computedChecksum || Boolean(storedChecksum));

    logStructuredEvent("ACADEMIC", "verifyBackupIntegrity", "INFO", "BACKUP_VERIFIED", `Integridad de respaldo ${file.getName()}: ${isValid ? 'VÁLIDO' : 'CORRUPTO'}`, { fileId: fileId, isValid: isValid }, payload && payload.authRole);

    return {
      status: "success",
      isValid: isValid,
      fileName: file.getName(),
      sheetCount: Object.keys(parsed.sheets).length,
      timestamp: parsed.metadata.timestamp,
      storedChecksum: storedChecksum,
      computedChecksum: computedChecksum
    };
  } catch (error) {
    return { status: "error", isValid: false, message: error.message };
  }
}

function restoreSystemBackup(payload) {
  try {
    const { fileId, confirmed, confirmCode } = payload || {};
    if (!confirmed || confirmCode !== "RESTORE-CONFIRMED") {
      throw new Error("Confirmación obligatoria no recibida. Especifique confirmCode: 'RESTORE-CONFIRMED'.");
    }
    if (!fileId) throw new Error("ID de archivo de respaldo es requerido.");

    const file = DriveApp.getFileById(fileId);
    const content = file.getBlob().getDataAsString();
    const parsed = JSON.parse(content);

    if (!parsed.sheets) throw new Error("Archivo de respaldo inválido.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    for (const sheetName in parsed.sheets) {
      const rows = parsed.sheets[sheetName];
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
      } else {
        sheet.clear();
      }
      if (rows && rows.length > 0) {
        sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
      }
    }

    logStructuredEvent("ACADEMIC", "restoreSystemBackup", "WARN", "BACKUP_RESTORED", `Restauración realizada desde ${file.getName()}`, { fileId: fileId }, payload && payload.authRole);

    return { status: "success", message: `Sistema restaurado con éxito desde el respaldo ${file.getName()}.` };
  } catch (error) {
    logStructuredEvent("ACADEMIC", "restoreSystemBackup", "ERROR", "RESTORE_FAILED", error.message, payload, payload && payload.authRole);
    return { status: "error", message: error.message };
  }
}

// ---------------------------------------------------------------------------
// LÓGICA ACADÉMICA EXISTENTE
// ---------------------------------------------------------------------------

function getAcademicConfig(payload) {
  const { profesorId, grado, seccion } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ConfiguracionAcademica");
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { status: "success", data: { ParcialActual: "I parcial", GradoActual: [], SeccionActual: [], AsignaturaActual: [], TemaActual: ["General"], GranularConfig: [] } };
  const rows = data.slice(1);
  let relevantRows = rows.filter(r => {
    if (profesorId) return String(r[8]).trim() === String(profesorId).trim();
    return (!grado || normalizeString(r[3]) === normalizeString(grado)) && (!seccion || normalizeString(r[4]) === normalizeString(seccion));
  });
  if (relevantRows.length === 0) return { status: "success", data: { ParcialActual: "I parcial", GradoActual: [], SeccionActual: [], AsignaturaActual: [], TemaActual: ["General"], GranularConfig: [] } };
  const lastRow = relevantRows[relevantRows.length - 1];
  return { status: "success", data: { ParcialActual: lastRow[2], UnidadActual: lastRow[6] || lastRow[2].replace("parcial", "unidad"), GradoActual: [...new Set(relevantRows.map(r => r[3]))].filter(Boolean), SeccionActual: [...new Set(relevantRows.map(r => r[4]))].filter(Boolean), AsignaturaActual: [...new Set(relevantRows.map(r => r[5]))].filter(Boolean), TemaActual: [...new Set(relevantRows.map(r => r[7]))].filter(Boolean), GranularConfig: relevantRows.map(r => ({ parcial: r[2], grado: r[3], seccion: r[4], asignatura: r[5], unidad: r[6], tema: r[7] })) } };
}

function updateAcademicConfig(payload) {
  const { fullScope } = payload || {};
  const profesorId = fullScope?.profesorId ? String(fullScope.profesorId).trim() : null;
  if (!fullScope || !profesorId) throw new Error("Payload incompleto.");
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "ConfiguracionAcademica");
    const fullData = sheet.getDataRange().getValues();
    const headers = fullData[0];
    const rows = fullData.slice(1);

    const getRomanStandard = (str, type) => {
      const s = String(str || "").toLowerCase();
      if (s.indexOf("iv") !== -1 || s.indexOf("cuart") !== -1) return "IV " + type;
      if (s.indexOf("iii") !== -1 || s.indexOf("tercer") !== -1) return "III " + type;
      if (s.indexOf("ii") !== -1 || s.indexOf("segund") !== -1) return "II " + type;
      return "I " + type;
    };
    const parcialNorm = getRomanStandard(fullScope.ParcialActual, "parcial");
    const unidadNorm = getRomanStandard(fullScope.UnidadActual || fullScope.ParcialActual, "unidad");
    const currentMonth = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][new Date().getMonth()];
    const parseList = (val) => Array.isArray(val) ? val : [val].filter(Boolean);
    const grades = parseList(fullScope.GradoActual);
    const sections = parseList(fullScope.SeccionActual);
    const subjects = parseList(fullScope.AsignaturaActual);
    const themes = parseList(fullScope.TemaActual);

    // REQ: Validación de Unicidad Absoluta por Contexto
    if (fullScope.hierarchicalAssignments && Array.isArray(fullScope.hierarchicalAssignments)) {
      fullScope.hierarchicalAssignments.forEach(entry => {
        const { grado: g, seccion: s, asignatura: asig } = entry;
        const conflict = rows.find(r =>
          String(r[8]).trim() !== profesorId &&
          r[2] === parcialNorm &&
          normalizeString(r[3]) === normalizeString(g) &&
          normalizeString(r[4]) === normalizeString(s) &&
          normalizeString(r[5]) === normalizeString(asig)
        );
        if (conflict) {
          throw new Error(`Conflicto: La asignatura '${asig}' para ${g} (Secc. ${s}) ya está asignada a otro profesor en el ${parcialNorm}.`);
        }
      });
    } else {
      rows.forEach(r => {
        if (String(r[8]).trim() !== profesorId && r[2] === parcialNorm &&
            grades.indexOf(r[3]) !== -1 && sections.indexOf(r[4]) !== -1 && subjects.indexOf(r[5]) !== -1) {
          throw new Error(`Conflicto: La asignatura '${r[5]}' ya está asignada a otro docente en este parcial/grado.`);
        }
      });
    }

    const finalConfigMap = {};
    rows.forEach(r => { if (String(r[8]).trim() !== profesorId) finalConfigMap[`${normalizeString(r[3])}|${normalizeString(r[4])}|${normalizeString(r[5])}|${normalizeString(r[7])}|${normalizeString(r[8])}`] = r; });
    let maxId = 0; rows.forEach(r => { const num = parseInt(String(r[0]).replace("conf-", "")); if (!isNaN(num) && num > maxId) maxId = num; });

    if (fullScope.hierarchicalAssignments && Array.isArray(fullScope.hierarchicalAssignments)) {
      fullScope.hierarchicalAssignments.forEach(entry => {
        const { grado: g, seccion: s, asignatura: asig, temas } = entry;
        temas.forEach(t => {
          const key = `${normalizeString(g)}|${normalizeString(s)}|${normalizeString(asig)}|${normalizeString(t)}|${normalizeString(profesorId)}`;
          const oldRow = rows.find(r =>
            normalizeString(r[8]) === normalizeString(profesorId) && normalizeString(r[3]) === normalizeString(g) &&
            normalizeString(r[4]) === normalizeString(s) && normalizeString(r[5]) === normalizeString(asig) &&
            normalizeString(r[7]) === normalizeString(t)
          );
          if (oldRow) {
            const updated = [...oldRow]; updated[1] = currentMonth; updated[2] = parcialNorm; updated[6] = unidadNorm;
            finalConfigMap[key] = updated;
          } else {
            maxId++; finalConfigMap[key] = ["conf-" + maxId.toString().padStart(4, '0'), currentMonth, parcialNorm, g, s, asig, unidadNorm, t, profesorId];
          }
        });
      });
    } else {
      grades.forEach(g => {
        sections.forEach(s => {
          subjects.forEach(asig => {
            themes.forEach(t => {
              const key = `${normalizeString(g)}|${normalizeString(s)}|${normalizeString(asig)}|${normalizeString(t)}|${normalizeString(profesorId)}`;
              const oldRow = rows.find(r =>
                normalizeString(r[8]) === normalizeString(profesorId) && normalizeString(r[3]) === normalizeString(g) &&
                normalizeString(r[4]) === normalizeString(s) && normalizeString(r[5]) === normalizeString(asig) &&
                normalizeString(r[7]) === normalizeString(t)
              );
              if (oldRow) {
                const updated = [...oldRow]; updated[1] = currentMonth; updated[2] = parcialNorm; updated[6] = unidadNorm;
                finalConfigMap[key] = updated;
              } else {
                maxId++; finalConfigMap[key] = ["conf-" + maxId.toString().padStart(4, '0'), currentMonth, parcialNorm, g, s, asig, unidadNorm, t, profesorId];
              }
            });
          });
        });
      });
    }

    const finalRows = Object.values(finalConfigMap);
    if (finalRows.length > 0) {
      sheet.getRange(2, 1, finalRows.length, headers.length).setValues(finalRows);
    }
    if (sheet.getLastRow() > finalRows.length + 1) {
      sheet.deleteRows(finalRows.length + 2, sheet.getLastRow() - (finalRows.length + 1));
    }
    SpreadsheetApp.flush();
    try { saveToAcademicHistory(fullScope); } catch (e) { logDebug("Error Historial:", e.message); }
    return { status: "success", message: "Configuración actualizada.", data: fullScope };
  } finally { lock.releaseLock(); }
}

function saveToAcademicHistory(scope) {
  const profesorId = scope.profesorId ? String(scope.profesorId).trim() : "SISTEMA";
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "HistorialAcademico");
  const data = sheet.getDataRange().getValues().slice(1);

  const getRomanStandard = (str, type) => {
    const s = String(str || "").toLowerCase();
    if (s.indexOf("iv") !== -1 || s.indexOf("cuart") !== -1) return "IV " + type;
    if (s.indexOf("iii") !== -1 || s.indexOf("tercer") !== -1) return "III " + type;
    if (s.indexOf("ii") !== -1 || s.indexOf("segund") !== -1) return "II " + type;
    return "I " + type;
  };
  const parcialNorm = getRomanStandard(scope.ParcialActual, "parcial");
  const unidadNorm = getRomanStandard(scope.UnidadActual || scope.ParcialActual, "unidad");
  const currentMonth = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][new Date().getMonth()];
  const normalizeGrade = (g) => {
    const gn = normalizeString(g);
    if (gn.includes("duodecimo") || gn.includes("12") || gn.includes("iiibtp")) return "duodécimo";
    if (gn.includes("undecimo") || gn.includes("11") || gn.includes("iibtp")) return "undécimo";
    if (gn.includes("decimo") || gn.includes("10") || gn.includes("ibtp")) return "décimo";
    return String(g).toLowerCase();
  };

  const grades = (Array.isArray(scope.GradoActual) ? scope.GradoActual : [scope.GradoActual]).filter(Boolean);
  const sections = (Array.isArray(scope.SeccionActual) ? scope.SeccionActual : [scope.SeccionActual]).filter(Boolean);
  const subjects = (Array.isArray(scope.AsignaturaActual) ? scope.AsignaturaActual : [scope.AsignaturaActual]).filter(Boolean);

  let lastIdNum = 0;
  const existingKeys = new Set(data.map(r => {
    const match = String(r[0]).match(/hist-(\d+)/); if (match) { const num = parseInt(match[1]); if (num > lastIdNum) lastIdNum = num; }
    return `${normalizeString(r[2])}|${normalizeString(r[3])}|${normalizeString(r[4])}|${normalizeString(r[5])}|${normalizeString(r[7])}`;
  }));

  const newEntries = [];

  if (scope.hierarchicalAssignments && Array.isArray(scope.hierarchicalAssignments)) {
    const seenAssignments = new Set();
    scope.hierarchicalAssignments.forEach(entry => {
      const g = normalizeGrade(entry.grado);
      const s = entry.seccion;
      const a = String(entry.asignatura).toLowerCase();
      const contextKey = `${g}|${s}|${a}`;

      if (seenAssignments.has(contextKey)) return;
      seenAssignments.add(contextKey);

      const key = `${normalizeString(parcialNorm)}|${normalizeString(g)}|${normalizeString(s)}|${normalizeString(a)}|${normalizeString(profesorId)}`;
      if (!existingKeys.has(key)) {
        lastIdNum++;
        newEntries.push(["hist-" + lastIdNum.toString().padStart(4, '0'), currentMonth, parcialNorm, g, s, a, unidadNorm, profesorId]);
        existingKeys.add(key);
      }
    });
  } else {
    grades.forEach(rg => {
      const g = normalizeGrade(rg);
      sections.forEach(s => {
        subjects.forEach(ra => {
          const a = String(ra).toLowerCase();
          const key = `${normalizeString(parcialNorm)}|${normalizeString(g)}|${normalizeString(s)}|${normalizeString(a)}|${normalizeString(profesorId)}`;
          if (!existingKeys.has(key)) {
            lastIdNum++; newEntries.push(["hist-" + lastIdNum.toString().padStart(4, '0'), currentMonth, parcialNorm, g, s, a, unidadNorm, profesorId]);
            existingKeys.add(key);
          }
        });
      });
    });
  }
  if (newEntries.length > 0) sheet.getRange(sheet.getLastRow() + 1, 1, newEntries.length, 8).setValues(newEntries);
}

function getAcademicHistory(payload) {
  const { grado, seccion } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("HistorialAcademico");
  if (!sheet) return { status: "success", data: [] };
  const data = sheet.getDataRange().getValues().slice(1);
  const filtered = data.filter(r => {
    const norm = (g) => {
      const gn = normalizeString(g);
      if (gn.includes("duodecimo") || gn.includes("12") || gn.includes("iiibtp")) return "duodécimo";
      if (gn.includes("undecimo") || gn.includes("11") || gn.includes("iibtp")) return "undécimo";
      if (gn.includes("decimo") || gn.includes("10") || gn.includes("ibtp")) return "décimo";
      return gn;
    };
    return (!grado || norm(r[3]) === norm(grado)) && (!seccion || normalizeString(r[4]) === normalizeString(seccion));
  });
  const map = {};
  filtered.forEach(r => { if (!map[r[2]]) map[r[2]] = { fecha: r[1], parcial: r[2], unidad: r[6], asignaturas: [] }; if (map[r[2]].asignaturas.indexOf(r[5]) === -1) map[r[2]].asignaturas.push(r[5]); });
  return { status: "success", data: Object.values(map) };
}

function getAsignaturasActivas(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("ConfiguracionAcademica");
  if (!sheet) return { status: "success", data: [] };
  const data = sheet.getDataRange().getValues().slice(1);
  const target = normalizeString(payload.parcial);
  return { status: "success", data: [...new Set(data.filter(r => normalizeString(r[2]) === target).map(r => r[5]))] };
}

function updateAsignaturasActivas(payload) { return { status: "success", message: "Depreciado." }; }
function saveWhatsAppLink(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Clases");
  const data = sheet.getDataRange().getValues();
  const sGrado = normalizeString(payload.grado);
  const idx = data.findIndex(r => normalizeString(r[0]) === sGrado);
  if (idx !== -1) sheet.getRange(idx + 1, 3).setValue(payload.link);
  else sheet.appendRow([payload.grado, "Todas", payload.link]);
  return { status: "success", message: "Enlace guardado." };
}
function getWhatsAppLink(payload) {
  const data = getOrCreateSheet(SpreadsheetApp.openById(SPREADSHEET_ID), "Clases").getDataRange().getValues();
  const row = data.find(r => normalizeString(r[0]) === normalizeString(payload.grado));
  return { status: "success", link: row ? row[2] : "" };
}
function getQuestionBank(payload) {
  const data = getOrCreateSheet(SpreadsheetApp.openById(SPREADSHEET_ID), "BancoPreguntas").getDataRange().getValues();
  const h = data.shift(); let q = data.map(r => { let o = {}; h.forEach((k, i) => o[k] = r[i]); return o; });
  if (payload.asignatura) q = q.filter(x => normalizeString(x.Asignatura) === normalizeString(payload.asignatura));
  if (payload.nivel) q = q.filter(x => normalizeString(x.Nivel) === normalizeString(payload.nivel));
  if (payload.activaOnly) q = q.filter(x => x.Activa === true || x.Activa === "TRUE");
  return { status: "success", data: q };
}
function saveQuestion(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "BancoPreguntas");
  const data = sheet.getDataRange().getValues();
  const h = data[0]; if (!payload.PreguntaID) payload.PreguntaID = "Q-" + Date.now();
  payload.UltimaActualizacion = new Date();
  const row = h.map(k => payload[k] !== undefined ? payload[k] : "");
  const idx = data.findIndex(r => r[0] === payload.PreguntaID);
  if (idx !== -1) sheet.getRange(idx + 1, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
  return { status: "success", preguntaId: payload.PreguntaID };
}
function generateMigrationReport(payload) {
  getOrCreateSheet(SpreadsheetApp.openById(SPREADSHEET_ID), "MigrationLogs").appendRow([new Date(), payload.stats.totalDetectadas, payload.stats.totalMigradas, JSON.stringify(payload.stats.asignaturas), payload.stats.detalle]);
  return { status: "success" };
}

// Módulo de Matrícula
function registerStudentEnrollment(payload) {
  const { userId, alumno, grado, seccion, periodo, tipo, becaDescuento, observaciones, cargos } = payload || {};
  if (!userId || !grado || !periodo) throw new Error("Datos de matrícula incompletos.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const matSheet = getOrCreateSheet(ss, "Matriculas");
  const cargosSheet = getOrCreateSheet(ss, "CargosEstudiante");

  const matData = matSheet.getDataRange().getValues();
  const sUserId = String(userId).trim();
  const sPeriodo = String(periodo).trim();
  const sGrado = String(grado).trim();

  let existingIndex = matData.findIndex(r => String(r[2]).trim() === sUserId && String(r[6]).trim() === sPeriodo);
  let matriculaId;
  const now = new Date();

  if (existingIndex !== -1) {
    matriculaId = matData[existingIndex][0];
    matSheet.getRange(existingIndex + 1, 1, 1, 11).setValues([[
      matriculaId,
      now,
      sUserId,
      alumno || matData[existingIndex][3],
      sGrado,
      seccion || matData[existingIndex][5],
      sPeriodo,
      tipo || matData[existingIndex][7] || "Ordinaria",
      "Activa",
      becaDescuento || 0,
      observaciones || ""
    ]]);
  } else {
    matriculaId = "MAT-" + now.getTime();
    matSheet.appendRow([
      matriculaId,
      now,
      sUserId,
      alumno || "Estudiante",
      sGrado,
      seccion || "",
      sPeriodo,
      tipo || "Ordinaria",
      "Activa",
      becaDescuento || 0,
      observaciones || ""
    ]);
  }

  if (Array.isArray(cargos) && cargos.length > 0) {
    const existingCargos = cargosSheet.getDataRange().getValues();
    cargos.forEach(c => {
      const concepto = c.concepto || "Matrícula/Colegiatura";
      const dup = existingCargos.find(r => String(r[2]).trim() === sUserId && String(r[3]).trim() === concepto && String(r[7]) !== "Anulado");
      if (!dup) {
        const cargoId = "CRG-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        const montoBase = parseFloat(c.montoBase || 0);
        const descuento = parseFloat(c.descuento || becaDescuento || 0);
        const montoFinal = Math.max(0, montoBase - descuento);
        cargosSheet.appendRow([
          cargoId,
          now,
          sUserId,
          concepto,
          montoBase,
          descuento,
          montoFinal,
          c.estado || "Pendiente",
          c.fechaVencimiento || ""
        ]);
      }
    });
  }

  return { status: "success", matriculaId: matriculaId, message: "Matrícula registrada exitosamente." };
}

function getStudentEnrollmentHistory(payload) {
  const { userId } = payload || {};
  if (!userId) throw new Error("userId requerido.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sUserId = String(userId).trim();

  const matRows = getOrCreateSheet(ss, "Matriculas").getDataRange().getValues().slice(1);
  const userMatriculas = matRows.filter(r => String(r[2]).trim() === sUserId).map(r => ({
    matriculaId: r[0],
    fecha: r[1],
    userId: r[2],
    alumno: r[3],
    grado: r[4],
    seccion: r[5],
    periodo: r[6],
    tipo: r[7],
    estado: r[8],
    becaDescuento: r[9],
    observaciones: r[10]
  }));

  const cargosRows = getOrCreateSheet(ss, "CargosEstudiante").getDataRange().getValues().slice(1);
  const userCargos = cargosRows.filter(r => String(r[2]).trim() === sUserId).map(r => ({
    cargoId: r[0],
    fecha: r[1],
    userId: r[2],
    concepto: r[3],
    montoBase: r[4],
    descuento: r[5],
    montoFinal: r[6],
    estado: r[7],
    fechaVencimiento: r[8]
  }));

  return {
    status: "success",
    data: {
      matriculas: userMatriculas,
      cargos: userCargos
    }
  };
}
