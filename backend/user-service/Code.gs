// NOTA: Las URLs de los microservicios solo se deben actualizar en el frontend (js/config.js), no en este archivo.
// ============================================================================
// MICROSERVICIO DE USUARIOS (VERSIÓN MODULAR RESTAURADA v8.2.0 - FASE 2)
// ============================================================================

const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const FRONTEND_URL = "https://informatica0101.github.io";
const DEBUG_MODE = true;
const SECRET_KEY = PropertiesService.getScriptProperties().getProperty('SECRET_KEY') || "IMA-PORTAL-DEVELOPMENT-KEY-UNSECURE";

/**
 * CONFIGURACIÓN DE ANALÍTICA INTEGRAL (ICR v3.1)
 */
const ANALYTICS_CONFIG = {
  WEIGHTS: {
    ICR: { exactitud: 0.4, eficiencia: 0.3, dificultad: 0.2, consistencia: 0.1 },
    GP: { rapidez: 0.35, error: 0.35, dificultad: 0.15, global: 0.15 },
    MASTERY: { historico: 0.7, actual: 0.3 }
  },
  CALIBRATION: {
    THRESHOLD: 30, // REQ: Mínimo 30 respuestas para fase de calibración (Cold Start v2.0)
    SESSION_LIMIT: 3,
    GLOBAL_WEIGHT: 0.8,
    ANCHOR_SUBJECT: "Informática",
    ANCHOR_GRADE: 10,
    ANCHOR_LEVEL: "Básico"
  },
  THRESHOLDS: {
    IMPULSIVITY: {
      'verdadero_falso': 3000,
      'Selección múltiple': 4000,
      'emparejamiento': 8000,
      'ordering': 12000,
      'completacion': 15000
    }
  }
};

// ---------------------------------------------------------------------------
// UTILIDADES Y SANITIZACIÓN
// ---------------------------------------------------------------------------

function logDebug(message, optionalParam) {
  if (!DEBUG_MODE) return;
  try {
    console.log(`[USER-SVC] ${new Date().toLocaleTimeString()} - ${message}`, optionalParam || "");
  } catch (_) {}
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
      serviceName || "USER",
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

function getStructuredLogs(payload) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("LogsSistema");
    if (!sheet) return { status: "success", logs: [] };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: "success", logs: [] };

    const reqSeverity = (payload && payload.severity) ? String(payload.severity).toUpperCase() : "";
    const startDate = (payload && payload.startDate) ? new Date(payload.startDate) : null;
    const endDate = (payload && payload.endDate) ? new Date(payload.endDate) : null;

    const logs = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const logSev = String(row[4] || "").toUpperCase();
      const logDate = new Date(row[1]);

      if (reqSeverity && reqSeverity !== "ALL" && logSev !== reqSeverity) continue;
      if (startDate && !isNaN(startDate.getTime()) && logDate < startDate) continue;
      if (endDate && !isNaN(endDate.getTime()) && logDate > endDate) continue;

      logs.push({
        id: row[0],
        timestamp: row[1],
        service: row[2],
        functionName: row[3],
        severity: row[4],
        errorCode: row[5],
        message: row[6],
        payload: row[7],
        userRole: row[8]
      });
    }

    return { status: "success", logs: logs.reverse().slice(0, 500) };
  } catch (error) {
    logStructuredEvent("USER", "getStructuredLogs", "ERROR", "LOGS_FETCH_FAILED", error.message, payload, payload && payload.authRole);
    return { status: "error", message: error.message };
  }
}

function getSheetOrThrow(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) {
    const msg = `Hoja no encontrada: ${name}`;
    logDebug(msg);
    throw new Error(msg);
  }
  return sheet;
}

function textResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.TEXT);
}

function normalizeString(str) {
  if (!str) return "";
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function getStandardLevelName(lvl) {
  if (!lvl) return 'Básico';
  const n = lvl.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (n === 'basico') return 'Básico';
  if (n === 'intermedio') return 'Intermedio';
  if (n === 'avanzado') return 'Avanzado';
  return lvl;
}

function parseGrade(gStr) {
  const g = normalizeString(gStr);
  if (g.includes("duodecimo") || g.includes("12") || g.includes("iiibtp")) return 12;
  if (g.includes("undecimo") || g.includes("11") || g.includes("iibtp")) return 11;
  if (g.includes("decimo") || g.includes("10") || g.includes("ibtp")) return 10;
  return 10;
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === "Personas") sheet.appendRow(["PersonaID", "Nombres", "Apellidos", "Identificacion", "EmailContacto", "TelefonoContacto", "EstadoPersona", "FechaCreacion", "FechaActualizacion", "Observaciones"]);
    if (name === "Usuarios") sheet.appendRow(["UserId", "Nombre", "Grado", "Seccion", "Email", "PasswordHash", "Rol", "Telefono", "NumeroLista", "PersonaID", "EstadoCuenta", "FechaCreacion", "UltimoAcceso"]);
    if (name === "RelacionesFamiliares") sheet.appendRow(["RelacionID", "PersonaEstudianteID", "PersonaResponsableID", "TipoParentesco", "EstadoAutorizacion", "FechaInicio", "FechaFin", "Observaciones"]);
    if (name === "Logros") sheet.appendRow(["Fecha", "UserId", "Alumno", "Juego", "Asignatura", "Puntaje", "Nivel", "Grado", "XP"]);
    if (name === "NoticiasPortal") sheet.appendRow(["NoticiaID", "Fecha", "Hora", "Título", "Contenido", "ImagenUrl", "Categoría", "GradoAudiencia", "SeccionAudiencia", "FechaInicio", "FechaFin", "Estado"]);
    if (name === "QuizProAnalytics") sheet.appendRow(["analyticsId", "fecha", "userId", "quizId", "gameId", "gameName", "asignatura", "grado", "nivel", "preguntaId", "respuestaSeleccionada", "respuestaCorrecta", "esCorrecta", "tiempoRespuesta", "tiempoBase", "ratio", "cambiosRespuesta", "indiceConfianza", "indiceAdivinacion", "indiceDominio", "totalXP"]);
    if (name === "LearningProfile") sheet.appendRow(["profileId", "userId", "asignatura", "tema", "nivel", "intentos", "aciertos", "porcentajeAciertos", "indiceDominio", "ultimaActualizacion"]);
    if (name === "GameLeaderboards") sheet.appendRow(["leaderboardId", "gameId", "userId", "nombreAlumno", "grado", "asignatura", "mejorPuntuacion", "indiceDominioPromedio", "partidasJugadas", "ultimaActualizacion"]);
    if (name === "CriteriosInstitucionales") sheet.appendRow(["CriterioID", "Dominio", "Nombre", "Descripcion", "EscalaJSON", "AmbitoNivel", "Estado"]);
    if (name === "EvaluacionesFormativas") sheet.appendRow(["ID", "UserID", "Dominio", "CriterioID", "CalificacionValor", "ObservacionObjetiva", "Contexto", "AutorID", "VisibilidadBoletin", "FechaRegistro"]);
    if (name === "PlanesAcompanamiento") sheet.appendRow(["PlanID", "UserID", "SituacionMeliorar", "ObjetivosJSON", "ResponsableID", "FechaInicio", "FechaRevision", "Estado"]);
    if (name === "InvitacionesVinculacion") sheet.appendRow(["InvitacionID", "ExpedienteID", "EmailResponsable", "Token", "FechaEmision", "FechaExpiracion", "Estado", "CreadoPor"]);
    if (name === "ComunicadosInstitucionales") sheet.appendRow(["ComunicadoID", "Titulo", "Contenido", "Categoria", "AutorID", "AudienciaJSON", "RequiereFirma", "FechaPublicacion", "Estado"]);
    if (name === "ConfirmacionesLecturaComunicados") sheet.appendRow(["ConfirmacionID", "ComunicadoID", "UserId", "FechaApertura", "FechaConfirmacionExplicit", "EstadoConfirmacion", "IpMetadata"]);
    if (name === "ConversacionesMensajes") sheet.appendRow(["MensajeID", "ConversacionID", "RemitenteID", "DestinatarioID", "EstudianteID", "MensajeTexto", "AdjuntoUrl", "FechaEnvio", "EstadoLectura"]);
    if (name === "BandejaNotificaciones") sheet.appendRow(["NotificacionID", "UserId", "Titulo", "Mensaje", "Tipo", "Categoria", "Leido", "EnlaceAccion", "FechaRegistro"]);
    if (name === "SolicitudesTramites") sheet.appendRow(["SolicitudID", "UserId", "EstudianteID", "TipoTramite", "Descripcion", "AdjuntoUrl", "Estado", "AsignadoA", "ObservacionesAdmin", "FechaSolicitud", "FechaResolucion"]);
    if (name === "FormulariosInstitucionales") sheet.appendRow(["FormID", "CodigoFormulario", "Titulo", "Descripcion", "Departamento", "DefinicionJSON", "Estado", "Version", "RequiereFirma", "PlantillaDocumentoId", "FechaCreacion", "CreadoPor"]);
    if (name === "CitasReuniones") sheet.appendRow(["CitaID", "SolicitanteID", "EstudianteID", "SolicitadoA", "Motivo", "FechaHora", "Modalidad", "Estado", "Comentarios"]);
  }
  return sheet;
}

function normalizeSubjectInBackend(name) {
  if (!name) return 'General';
  return name.toString().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s*\(?(?:[IVX]+)?\s*Parcial\)?/i, '').replace(/\s+\(?[IVX]+\)?$/i, '').replace(/\s+I{1,3}$/i, '').trim();
}

// ---------------------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------------------

function doGet() { return textResponse({ status: "success", service: "USER", timestamp: new Date().toISOString(), dbConnected: true }); }

// ---------------------------------------------------------------------------
// CONTROL DE ACCESO BASADO EN ROLES (RBAC SERVIDOR - REQ-EXP-008 & FASE 2)
// ---------------------------------------------------------------------------
const PUBLIC_ACTIONS = [
  "registerUser", "loginUser", "requestPasswordRecovery", "resetPassword", "ping", "getNews", "getInstitutionalAnnouncements"
];

const ROLE_PERMISSIONS = {
  "Administrador": ["*"],
  "Desarrollador": ["*"],
  "Padre": [
    "getUserInfo", "getNews", "getInstitutionalCriteria", "getFormativeEvaluations", "getSupportPlans",
    "acceptLinkInvitation", "getGuardianStudents", "getInstitutionalAnnouncements", "getInternalMessages", "sendInternalMessage", "getUserNotifications", "getUnifiedNotifications", "markNotificationAsRead", "getAdministrativeRequests", "submitAdministrativeRequest", "submitStudentAbsenceJustification", "getStudentAbsenceJustifications", "getAppointmentBookings", "bookAppointment", "getInstitutionalCalendarEvents", "getPendingReminders"
  ],
  "Tutor": [
    "getUserInfo", "getNews", "getInstitutionalCriteria", "getFormativeEvaluations", "getSupportPlans",
    "acceptLinkInvitation", "getGuardianStudents", "getInstitutionalAnnouncements", "getInternalMessages", "sendInternalMessage", "getUserNotifications", "getUnifiedNotifications", "markNotificationAsRead", "getAdministrativeRequests", "submitAdministrativeRequest", "submitStudentAbsenceJustification", "getStudentAbsenceJustifications", "getInstitutionalForms", "submitInstitutionalFormRequest", "getAppointmentBookings", "bookAppointment", "getInstitutionalCalendarEvents", "getPendingReminders"
  ],
  "Responsable": [
    "getUserInfo", "getNews", "getInstitutionalCriteria", "getFormativeEvaluations", "getSupportPlans",
    "acceptLinkInvitation", "getGuardianStudents", "getInstitutionalAnnouncements", "getInternalMessages", "sendInternalMessage", "getUserNotifications", "getUnifiedNotifications", "markNotificationAsRead", "getAdministrativeRequests", "submitAdministrativeRequest", "submitStudentAbsenceJustification", "getStudentAbsenceJustifications", "getInstitutionalForms", "submitInstitutionalFormRequest", "getAppointmentBookings", "bookAppointment", "getInstitutionalCalendarEvents", "getPendingReminders"
  ],
  "Director": [
    "createNews", "uploadNewsImage", "getNews", "updateNewsStatus", "getStudents", "getStudentsByGradoSeccion", "getUserInfo", "saveGameResult", "getGameStats", "getGlobalTop", "recordAnalytics", "getLearningProfile", "mergeGuestData", "updateUserProfile", "findPersonMatches", "createPerson", "linkPersonAccount", "manageAccountState", "generateInstitutionalId",
    "getInstitutionalCriteria", "saveInstitutionalCriterion", "getFormativeEvaluations", "saveFormativeEvaluation", "getSupportPlans", "saveSupportPlan",
    "createLinkInvitation", "acceptLinkInvitation", "getGuardianStudents", "getInstitutionalAnnouncements", "createInstitutionalAnnouncement", "submitAnnouncementReceiptConfirmation", "getAnnouncementReadReport", "getDepartmentalWorkInbox", "closeConversationThread", "getInternalConversations", "getInternalMessages", "sendInternalMessage", "getUserNotifications", "getUnifiedNotifications", "markNotificationAsRead", "createUserNotification", "sendMultiChannelNotification", "getNotificationPreferences", "getAdministrativeRequests", "getAdministrativeRequestsHistory", "submitAdministrativeRequest", "submitStudentAbsenceJustification", "getStudentAbsenceJustifications", "reviewAbsenceJustification", "updateRequestStatus", "saveInstitutionalForm", "getInstitutionalForms", "submitInstitutionalFormRequest", "getAppointmentBookings", "bookAppointment", "updateAppointmentStatus", "getInstitutionalCalendarEvents", "getPendingReminders"
  ],
  "Subdirector": [
    "createNews", "uploadNewsImage", "getNews", "updateNewsStatus", "getStudents", "getStudentsByGradoSeccion", "getUserInfo", "saveGameResult", "getGameStats", "getGlobalTop", "recordAnalytics", "getLearningProfile", "mergeGuestData", "updateUserProfile", "findPersonMatches", "generateInstitutionalId",
    "getInstitutionalCriteria", "saveInstitutionalCriterion", "getFormativeEvaluations", "saveFormativeEvaluation", "getSupportPlans", "saveSupportPlan",
    "createLinkInvitation", "getGuardianStudents", "getInstitutionalAnnouncements", "createInstitutionalAnnouncement", "submitAnnouncementReceiptConfirmation", "getAnnouncementReadReport", "getDepartmentalWorkInbox", "closeConversationThread", "getInternalConversations", "getInternalMessages", "sendInternalMessage", "getUserNotifications", "getUnifiedNotifications", "markNotificationAsRead", "sendMultiChannelNotification", "getNotificationPreferences", "getAdministrativeRequests", "getAdministrativeRequestsHistory", "submitStudentAbsenceJustification", "getStudentAbsenceJustifications", "reviewAbsenceJustification", "updateRequestStatus", "saveInstitutionalForm", "getInstitutionalForms", "submitInstitutionalFormRequest", "getAppointmentBookings", "updateAppointmentStatus", "getInstitutionalCalendarEvents", "getPendingReminders"
  ],
  "Secretaría": [
    "createNews", "uploadNewsImage", "getNews", "updateNewsStatus", "getStudents", "getStudentsByGradoSeccion", "getUserInfo", "updateUserProfile", "findPersonMatches", "createPerson", "linkPersonAccount", "manageAccountState", "generateInstitutionalId",
    "getInstitutionalCriteria", "getFormativeEvaluations", "saveFormativeEvaluation", "getSupportPlans", "saveSupportPlan",
    "createLinkInvitation", "acceptLinkInvitation", "getGuardianStudents", "getInstitutionalAnnouncements", "createInstitutionalAnnouncement", "submitAnnouncementReceiptConfirmation", "getAnnouncementReadReport", "getDepartmentalWorkInbox", "closeConversationThread", "getInternalConversations", "getInternalMessages", "sendInternalMessage", "getUserNotifications", "getUnifiedNotifications", "markNotificationAsRead", "createUserNotification", "sendMultiChannelNotification", "getNotificationPreferences", "getAdministrativeRequests", "getAdministrativeRequestsHistory", "submitAdministrativeRequest", "submitStudentAbsenceJustification", "getStudentAbsenceJustifications", "reviewAbsenceJustification", "updateRequestStatus", "saveInstitutionalForm", "getInstitutionalForms", "submitInstitutionalFormRequest", "getAppointmentBookings", "bookAppointment", "updateAppointmentStatus", "getInstitutionalCalendarEvents", "getPendingReminders"
  ],
  "Contador": ["getStudents", "getUserInfo", "getNews", "getInstitutionalAnnouncements", "getUserNotifications", "markNotificationAsRead", "getAdministrativeRequests", "submitAdministrativeRequest"],
  "RecursosHumanos": ["getStudents", "getUserInfo", "getNews", "getInstitutionalAnnouncements", "getUserNotifications", "markNotificationAsRead", "getAdministrativeRequests", "submitAdministrativeRequest", "createNews", "getInternalMessages", "sendInternalMessage"],
  "Empleado": ["getUserInfo", "getNews", "getInstitutionalAnnouncements", "getUserNotifications", "markNotificationAsRead", "getAdministrativeRequests", "submitAdministrativeRequest", "getInternalMessages", "sendInternalMessage"],
  "Consejeros": ["getStudents", "getStudentsByGradoSeccion", "getUserInfo", "getLearningProfile", "getNews", "getInstitutionalCriteria", "getFormativeEvaluations", "saveFormativeEvaluation", "getSupportPlans", "saveSupportPlan", "getInstitutionalAnnouncements", "getInternalMessages", "sendInternalMessage", "getUserNotifications", "markNotificationAsRead", "getAppointmentBookings", "updateAppointmentStatus"],
  "Profesor": [
    "getStudents", "getStudentsByGradoSeccion", "getUserInfo", "getNews", "createNews", "uploadNewsImage", "saveGameResult", "getGameStats", "getGlobalTop", "recordAnalytics", "getLearningProfile", "mergeGuestData",
    "getInstitutionalCriteria", "getFormativeEvaluations", "saveFormativeEvaluation", "getSupportPlans",
    "getGuardianStudents", "getInstitutionalAnnouncements", "getInternalMessages", "sendInternalMessage", "getUserNotifications", "markNotificationAsRead", "createUserNotification", "getAdministrativeRequests", "submitAdministrativeRequest", "getAppointmentBookings", "bookAppointment", "updateAppointmentStatus"
  ],
  "Asistente": ["getStudents", "getStudentsByGradoSeccion", "getUserInfo", "getNews", "getLearningProfile", "getInstitutionalCriteria", "getFormativeEvaluations", "getInstitutionalAnnouncements", "getUserNotifications"],
  "Estudiante": [
    "getUserInfo", "getNews", "saveGameResult", "getGameStats", "getGlobalTop", "recordAnalytics", "getLearningProfile", "mergeGuestData", "updateUserProfile",
    "getInstitutionalCriteria", "getFormativeEvaluations", "getSupportPlans",
    "acceptLinkInvitation", "getGuardianStudents", "getInstitutionalAnnouncements", "getInternalMessages", "sendInternalMessage", "getUserNotifications", "getUnifiedNotifications", "markNotificationAsRead", "getAdministrativeRequests", "submitAdministrativeRequest", "submitStudentAbsenceJustification", "getStudentAbsenceJustifications", "getAppointmentBookings", "bookAppointment", "getInstitutionalCalendarEvents", "getPendingReminders"
  ],
  "Alumno": [
    "getUserInfo", "getNews", "saveGameResult", "getGameStats", "getGlobalTop", "recordAnalytics", "getLearningProfile", "mergeGuestData", "updateUserProfile",
    "getInstitutionalCriteria", "getFormativeEvaluations", "getSupportPlans",
    "acceptLinkInvitation", "getGuardianStudents", "getInstitutionalAnnouncements", "getInternalMessages", "sendInternalMessage", "getUserNotifications", "getUnifiedNotifications", "markNotificationAsRead", "getAdministrativeRequests", "submitAdministrativeRequest", "submitStudentAbsenceJustification", "getStudentAbsenceJustifications", "getAppointmentBookings", "bookAppointment", "getInstitutionalCalendarEvents", "getPendingReminders"
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
  try {
    if (!e || !e.postData || !e.postData.contents) return textResponse({ status: "error", message: "No se recibieron datos." });
    const { action, payload } = JSON.parse(e.postData.contents);
    const authCheck = validateRolePermission(action, payload);
    if (!authCheck.authorized) {
      logStructuredEvent("USER", action, "WARN", "AUTH_PERMISSION_DENIED", `Acceso denegado a acción ${action} para rol ${authCheck.role}`, payload, authCheck.role);
      return textResponse({ status: "error", code: "AUTH_PERMISSION_DENIED", message: "Acceso denegado: El rol " + authCheck.role + " no tiene permiso para la acción " + action + "." });
    }
    let result;
    switch (action) {
      case "registerUser": result = registerUser(payload); break;
      case "loginUser": result = loginUser(payload); break;
      case "getStudents": result = getStudents(payload); break;
      case "getStudentsByGradoSeccion": result = getStudentsByGradoSeccion(payload); break;
      case "getUserInfo": result = getUserInfo(payload); break;
      case "requestPasswordRecovery": result = requestPasswordRecovery(payload); break;
      case "resetPassword": result = resetPassword(payload); break;
      case "updateUserProfile": result = updateUserProfile(payload); break;
      case "findPersonMatches": result = findPersonMatches(payload); break;
      case "createPerson": result = createPerson(payload); break;
      case "linkPersonAccount": result = linkPersonAccount(payload); break;
      case "manageAccountState": result = manageAccountState(payload); break;
      case "saveGameResult": result = saveGameResult(payload); break;
      case "getGameStats": result = getGameStats(payload); break;
      case "getGlobalTop": result = getGlobalTop(payload); break;
      case "recordAnalytics": result = recordAnalytics(payload); break;
      case "getLearningProfile": result = getLearningProfile(payload); break;
      case "mergeGuestData": result = mergeGuestData(payload); break;
      case "getNews": result = getNews(payload); break;
      case "createNews": result = createNews(payload); break;
      case "uploadNewsImage": result = uploadNewsImage(payload); break;
      case "updateNewsStatus": result = updateNewsStatus(payload); break;
      case "getStructuredLogs": result = getStructuredLogs(payload); break;
      case "getInstitutionalCriteria": result = getInstitutionalCriteria(payload); break;
      case "saveInstitutionalCriterion": result = saveInstitutionalCriterion(payload); break;
      case "getFormativeEvaluations": result = getFormativeEvaluations(payload); break;
      case "saveFormativeEvaluation": result = saveFormativeEvaluation(payload); break;
      case "getSupportPlans": result = getSupportPlans(payload); break;
      case "saveSupportPlan": result = saveSupportPlan(payload); break;
      case "generateInstitutionalId": result = generateInstitutionalId(payload); break;

      // Endpoints Fase 8 - Portal Familiar y Comunicación Institucional
      case "createLinkInvitation": result = createLinkInvitation(payload); break;
      case "acceptLinkInvitation": result = acceptLinkInvitation(payload); break;
      case "getGuardianStudents": result = getGuardianStudents(payload); break;
      case "getInstitutionalAnnouncements": result = getInstitutionalAnnouncements(payload); break;
      case "createInstitutionalAnnouncement": result = createInstitutionalAnnouncement(payload); break;
      case "submitAnnouncementReceiptConfirmation": result = submitAnnouncementReceiptConfirmation(payload); break;
      case "getAnnouncementReadReport": result = getAnnouncementReadReport(payload); break;
      case "getDepartmentalWorkInbox": result = getDepartmentalWorkInbox(payload); break;
      case "getInternalConversations": result = getInternalConversations(payload); break;
      case "getInternalMessages": result = getInternalMessages(payload); break;
      case "closeConversationThread": result = closeConversationThread(payload); break;
      case "sendInternalMessage": result = sendInternalMessage(payload); break;
      case "getUnifiedNotifications": result = getUnifiedNotifications(payload); break;
      case "getUserNotifications": result = getUserNotifications(payload); break;
      case "sendMultiChannelNotification": result = sendMultiChannelNotification(payload); break;
      case "getNotificationPreferences": result = getNotificationPreferences(payload); break;
      case "markNotificationAsRead": result = markNotificationAsRead(payload); break;
      case "createUserNotification": result = createUserNotification(payload); break;
      case "getAdministrativeRequests": result = getAdministrativeRequests(payload); break;
      case "submitStudentAbsenceJustification": result = submitStudentAbsenceJustification(payload); break;
      case "getStudentAbsenceJustifications": result = getStudentAbsenceJustifications(payload); break;
      case "reviewAbsenceJustification": result = reviewAbsenceJustification(payload); break;
      case "getAdministrativeRequestsHistory": result = getAdministrativeRequestsHistory(payload); break;
      case "submitAdministrativeRequest": result = submitAdministrativeRequest(payload); break;
      case "updateRequestStatus": result = updateRequestStatus(payload); break;
      case "saveInstitutionalForm": result = saveInstitutionalForm(payload); break;
      case "getInstitutionalForms": result = getInstitutionalForms(payload); break;
      case "submitInstitutionalFormRequest": result = submitInstitutionalFormRequest(payload); break;
      case "getAppointmentBookings": result = getAppointmentBookings(payload); break;
      case "bookAppointment": result = bookAppointment(payload); break;
      case "updateAppointmentStatus": result = updateAppointmentStatus(payload); break;
      case "getInstitutionalCalendarEvents": result = getInstitutionalCalendarEvents(payload); break;
      case "getPendingReminders": result = getPendingReminders(payload); break;

      case "ping": result = { status: "success", service: "USER", timestamp: new Date().toISOString(), dbConnected: true }; break;
      default: result = { status: "error", message: `Acción no reconocida: ${action}` };
    }
    return textResponse(result);
  } catch (err) {
    logStructuredEvent("USER", "doPost", "ERROR", "UNHANDLED_EXCEPTION", err.message, e ? e.postData : null, "Sistema");
    return textResponse({ status: "error", message: err.message || "Error interno usuarios." });
  }
}

// ---------------------------------------------------------------------------
// FASE 2: MODELO CENTRAL DE IDENTIDAD (PERSONAS & CUENTAS)
// ---------------------------------------------------------------------------

function findPersonMatches(payload) {
  const { nombres, apellidos, identificacion, emailContacto } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Personas");
  const data = sheet.getDataRange().getValues().slice(1);

  const normIdent = normalizeString(identificacion);
  const normEmail = normalizeString(emailContacto);
  const normFullName = normalizeString(`${nombres || ''} ${apellidos || ''}`);

  const matches = [];

  data.forEach(r => {
    const pId = r[0];
    const pNombres = r[1];
    const pApellidos = r[2];
    const pIdent = r[3];
    const pEmail = r[4];

    let matchType = null;
    if (normIdent && normalizeString(pIdent) === normIdent) {
      matchType = "IDENTIFICACION_EXACTA";
    } else if (normEmail && normalizeString(pEmail) === normEmail) {
      matchType = "EMAIL_EXACTO";
    } else if (normFullName && normalizeString(`${pNombres} ${pApellidos}`) === normFullName) {
      matchType = "COINCIDENCIA_NOMBRE";
    }

    if (matchType) {
      matches.push({
        personaId: pId,
        nombres: pNombres,
        apellidos: pApellidos,
        identificacion: pIdent,
        emailContacto: pEmail,
        estadoPersona: r[6],
        tipoCoincidencia: matchType
      });
    }
  });

  return { status: "success", matches: matches };
}

function createPerson(payload) {
  const { nombres, apellidos, identificacion, emailContacto, telefonoContacto, observaciones } = payload || {};
  if (!nombres || !apellidos) throw new Error("Nombres y apellidos son requeridos para crear una Persona.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Personas");
  const now = new Date();
  const personaId = "PER-" + now.getTime();

  sheet.appendRow([
    personaId,
    nombres.trim(),
    apellidos.trim(),
    identificacion ? String(identificacion).trim() : "",
    emailContacto ? String(emailContacto).trim().toLowerCase() : "",
    telefonoContacto ? String(telefonoContacto).trim() : "",
    "Activa",
    now,
    now,
    observaciones || ""
  ]);

  logStructuredEvent("USER", "createPerson", "INFO", "PERSON_CREATED", `Persona ${personaId} creada exitosamente`, { personaId, nombres, apellidos }, payload && payload.authRole);

  return { status: "success", personaId: personaId, message: "Registro central de Persona creado exitosamente." };
}

function linkPersonAccount(payload) {
  const { userId, personaId } = payload || {};
  if (!userId || !personaId) throw new Error("userId y personaId requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();

  const idx = data.findIndex(r => String(r[0]).trim() === String(userId).trim());
  if (idx === -1) throw new Error("Cuenta de usuario no encontrada.");

  sheet.getRange(idx + 1, 10).setValue(personaId);

  return { status: "success", message: `Cuenta ${userId} vinculada exitosamente a Persona ${personaId}.` };
}

function generateInstitutionalId(payload) {
  const { entityType, prefix } = payload || {};
  if (!entityType) throw new Error("entityType es requerido.");
  const pfx = prefix || entityType.substring(0, 3).toUpperCase() + "-";

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName("SecuenciasIDs");
  if (!sheet) {
    sheet = ss.insertSheet("SecuenciasIDs");
    sheet.appendRow(["Entidad", "Prefijo", "UltimoNumero", "FechaActualizacion"]);
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = sheet.getDataRange().getValues();
    let nextNum = 1;
    let idx = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === String(entityType).trim().toLowerCase()) {
        idx = i;
        nextNum = parseInt(data[i][2] || 0) + 1;
        break;
      }
    }
    const formattedId = pfx + String(nextNum).padStart(6, '0');
    const now = new Date();
    if (idx !== -1) {
      sheet.getRange(idx + 1, 3, 1, 2).setValues([[nextNum, now]]);
    } else {
      sheet.appendRow([entityType, pfx, nextNum, now]);
    }
    SpreadsheetApp.flush();
    return { status: "success", generatedId: formattedId, sequence: nextNum };
  } finally {
    lock.releaseLock();
  }
}

function manageAccountState(payload) {
  const { userId, newState, motivo } = payload || {};
  if (!userId || !newState) throw new Error("userId y newState son requeridos.");

  const validStates = ["Pendiente", "InvitacionEnviada", "Activa", "Suspendida", "Bloqueada", "Desactivada"];
  if (validStates.indexOf(newState) === -1) throw new Error(`Estado inválido. Debe ser uno de: ${validStates.join(", ")}`);

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();

  const idx = data.findIndex(r => String(r[0]).trim() === String(userId).trim());
  if (idx === -1) throw new Error("Cuenta de usuario no encontrada.");

  sheet.getRange(idx + 1, 11).setValue(newState);

  logStructuredEvent("USER", "manageAccountState", "WARN", "ACCOUNT_STATE_CHANGED", `Estado de cuenta ${userId} cambiado a ${newState}. Motivo: ${motivo || 'N/A'}`, { userId, newState, motivo }, payload && payload.authRole);

  return { status: "success", userId: userId, newState: newState, message: `Estado de la cuenta actualizado a '${newState}'.` };
}

// ---------------------------------------------------------------------------
// LÓGICA DE USUARIOS
// ---------------------------------------------------------------------------

function registerUser(payload) {
  const { nombre, grado, seccion, email, password, telefono, numeroLista, forceUpdate, personaId } = payload || {};
  if (!nombre || !email || !password) throw new Error("Datos obligatorios faltantes.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();
  const lowerEmail = email.toLowerCase().trim();
  let existingIndex = -1;
  for (let i = 1; i < data.length; i++) { if (data[i][4]?.toString().toLowerCase().trim() === lowerEmail) { existingIndex = i; break; } }
  const now = new Date();

  if (existingIndex !== -1) {
    if (forceUpdate) {
      const userId = data[existingIndex][0];
      const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
      sheet.getRange(existingIndex + 1, 1, 1, 13).setValues([[
        userId,
        nombre,
        grado || "",
        seccion || "",
        email,
        hashedPassword,
        "Estudiante",
        telefono || "",
        numeroLista || "",
        personaId || data[existingIndex][9] || "",
        "Activa",
        data[existingIndex][11] || now,
        now
      ]]);
      return { status: "success", userId, message: "Cuenta actualizada." };
    }
    return { status: "error", exists: true, message: "Email ya registrado.", data: { nombre: data[existingIndex][1], gradoActual: data[existingIndex][2], seccionActual: data[existingIndex][3] } };
  }
  const userId = "USR-" + now.getTime();
  const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  sheet.appendRow([
    userId,
    nombre,
    grado || "",
    seccion || "",
    email,
    hashedPassword,
    "Estudiante",
    telefono || "",
    numeroLista || "",
    personaId || "",
    "Activa",
    now,
    now
  ]);
  return { status: "success", userId };
}

function loginUser(payload) {
  const { identifier, password } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();
  const hp = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  const id = identifier.toLowerCase().trim();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const uEmail = row[4]?.toString().toLowerCase().trim();
    const uNombre = row[1]?.toString().toLowerCase().trim();
    const state = row[10] || "Activa";

    if ((uEmail === id || uNombre === id) && row[5] === hp) {
      if (state === "Suspendida" || state === "Desactivada" || state === "Bloqueada") {
        logStructuredEvent("USER", "loginUser", "WARN", "LOGIN_BLOCKED", `Intento de inicio de sesión en cuenta ${state}`, { identifier, userId: row[0], state }, "Sistema");
        return { status: "error", message: `Su cuenta se encuentra en estado '${state}'. Por favor contacte a la administración.` };
      }

      // Actualizar Último Acceso
      sheet.getRange(i + 1, 13).setValue(new Date());

      return {
        status: "success",
        data: {
          userId: row[0],
          nombre: row[1],
          grado: row[2],
          seccion: row[3],
          email: row[4],
          rol: row[6],
          telefono: row[7] || "",
          numeroLista: row[8] || "",
          personaId: row[9] || "",
          estadoCuenta: state
        }
      };
    }
  }
  return { status: "error", message: "Credenciales incorrectas." };
}

function getStudents(payload) {
  const data = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios").getDataRange().getValues().slice(1);
  return { status: "success", data: data.filter(r => r[6] === 'Estudiante' && r[10] !== 'Desactivada').map(r => ({ userId: r[0], nombre: r[1], numeroLista: r[8] || "" })) };
}

function getStudentsByGradoSeccion(payload) {
  const { grado, seccion } = payload;
  const data = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios").getDataRange().getValues().slice(1);
  const sGrado = normalizeString(grado);
  const sSeccion = normalizeString(seccion);
  const students = data.filter(r => String(r[6]).trim() === 'Estudiante' && normalizeString(r[2]) === sGrado && (!seccion || normalizeString(r[3]) === sSeccion) && r[10] !== 'Desactivada').map(r => ({ userId: r[0], nombre: r[1], grado: r[2], seccion: r[3], email: r[4], telefono: r[7] || "", numeroLista: r[8] || "" }));
  students.sort((a, b) => (parseInt(a.numeroLista) || 999) - (parseInt(b.numeroLista) || 999));
  return { status: "success", data: students };
}

function getUserInfo(payload) {
  const r = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios").getDataRange().getValues().find(r => String(r[0]) === String(payload.userId));
  if (!r) throw new Error("Usuario no encontrado.");
  return { status: "success", data: { userId: r[0], nombre: r[1], email: r[4], rol: r[6], telefono: r[7] || "", personaId: r[9] || "", estadoCuenta: r[10] || "Activa" } };
}

function requestPasswordRecovery(payload) {
  const { email } = payload;
  const data = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios").getDataRange().getValues();
  const user = data.find(r => r[4]?.toString().toLowerCase().trim() === email.toLowerCase().trim());
  if (!user) return { status: "error", message: "Correo no encontrado." };
  const p = { userId: user[0], exp: Date.now() + 3600000 };
  const s = Utilities.computeHmacSha256Signature(JSON.stringify(p), SECRET_KEY).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  const token = Utilities.base64Encode(JSON.stringify({ p, s }));
  MailApp.sendEmail(email, "Recuperación de Contraseña", `Enlace: ${FRONTEND_URL}/reset-password.html?token=${encodeURIComponent(token)}`);
  return { status: "success", message: "Email enviado." };
}

function resetPassword(payload) {
  const { token, newPassword } = payload;
  const decoded = JSON.parse(Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString());
  const expectedS = Utilities.computeHmacSha256Signature(JSON.stringify(decoded.p), SECRET_KEY).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  if (decoded.s !== expectedS) throw new Error("Firma inválida.");
  if (Date.now() > decoded.p.exp) throw new Error("Expirado.");
  const sheet = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]) === String(decoded.p.userId));
  if (idx === -1) throw new Error("Usuario no encontrado.");
  const hp = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, newPassword).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  sheet.getRange(idx + 1, 6).setValue(hp);
  return { status: "success", message: "Contraseña actualizada." };
}

function updateUserProfile(payload) {
  const { userId, nombre, email, telefono, numeroLista, currentPassword, password } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]) === String(userId));
  if (idx === -1) throw new Error("No encontrado.");
  const userRow = [...data[idx]];
  if (password) {
    const ch = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, currentPassword).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
    if (userRow[5] !== ch) throw new Error("Actual incorrecta.");
    userRow[5] = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  }
  if (nombre) userRow[1] = nombre.trim();
  if (email) userRow[4] = email.toLowerCase().trim();
  if (telefono !== undefined) userRow[7] = String(telefono).trim();
  if (numeroLista !== undefined) userRow[8] = String(numeroLista).trim();
  sheet.getRange(idx + 1, 1, 1, userRow.length).setValues([userRow]);
  return { status: "success", message: "Perfil actualizado." };
}

// ---------------------------------------------------------------------------
// ANALÍTICA Y GAMIFICACIÓN
// ---------------------------------------------------------------------------

function saveGameResult(payload) {
  const { userId, nombreAlumno, juego, asignatura, puntaje, nivel, grado, xpGanada } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Logros");
  const data = sheet.getDataRange().getValues();
  const score = parseFloat(puntaje || 0);
  const xpNeto = parseFloat(xpGanada || 0);
  const normNivel = getStandardLevelName(nivel);
  let idx = data.findIndex(r => String(r[1]) === String(userId) && r[3] === juego && String(r[4]) === String(asignatura) && getStandardLevelName(r[6]) === normNivel && String(r[7]) === String(grado));
  if (idx !== -1) {
    sheet.getRange(idx + 1, 1).setValue(new Date());
    const newXP = parseFloat(data[idx][8] || 0) + xpNeto;
    sheet.getRange(idx + 1, 9).setValue(newXP);
    if (score > parseFloat(data[idx][5] || 0)) sheet.getRange(idx + 1, 6).setValue(score);
  } else {
    sheet.appendRow([new Date(), userId, nombreAlumno || "Anónimo", juego, asignatura || "General", score, normNivel, grado || "", xpNeto]);
  }
  return { status: "success", message: "Guardado.", updatedStats: getGameStats({ userId }).data };
}

function getGlobalTop(payload) {
  const targetGame = normalizeString(payload.gameId || "quizpro");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logRows = getOrCreateSheet(ss, "Logros").getDataRange().getValues().slice(1);
  const userData = ss.getSheetByName("Usuarios").getDataRange().getValues().slice(1);
  const usersMap = {}; userData.forEach(r => { usersMap[String(r[0])] = { nombre: r[1], grado: r[2] }; });

  const stats = {};
  const subjectTops = {};

  logRows.forEach(r => {
    if (normalizeString(r[3]) !== targetGame) return;
    const userId = String(r[1]).trim();
    const asig = normalizeSubjectInBackend(r[4]);
    const score = parseFloat(r[5] || 0);
    const grd = String(r[7]);
    if (!stats[userId]) stats[userId] = { data: {}, fallbackNombre: r[2], fallbackGrado: grd, xp: 0 };
    if (!stats[userId].data[grd]) stats[userId].data[grd] = {};
    if (!stats[userId].data[grd][asig]) stats[userId].data[grd][asig] = [];
    stats[userId].data[grd][asig].push(score);
  });

  const leaderboard = Object.keys(stats).map(userId => {
    const profile = usersMap[userId] || { nombre: stats[userId].fallbackNombre, grado: stats[userId].fallbackGrado };
    let totalAsigSum = 0, asigCount = 0;
    for (const g in stats[userId].data) {
      for (const a in stats[userId].data[g]) {
        const scores = stats[userId].data[g][a].filter(s => s > 0);
        const asigAvg = scores.length > 0 ? scores.reduce((x,y)=>x+y,0)/scores.length : 0;
        totalAsigSum += asigAvg; asigCount++;
        if (!subjectTops[g]) subjectTops[g] = {};
        if (!subjectTops[g][a]) subjectTops[g][a] = [];
        subjectTops[g][a].push({ nombre: profile.nombre, promedio: asigAvg });
      }
    }
    const userXP = logRows.filter(r => String(r[1]) === userId && normalizeString(r[3]) === targetGame).reduce((s, r) => s + (parseFloat(r[8]) || 0), 0);
    return { nombre: profile.nombre, grado: profile.grado, promedio: Math.round(asigCount > 0 ? totalAsigSum/asigCount : 0), xp: userXP };
  }).filter(u => !isNaN(u.promedio)).sort((a,b) => b.promedio - a.promedio);

  const finalSubjectTops = {};
  for (const g in subjectTops) {
    finalSubjectTops[g] = {};
    for (const a in subjectTops[g]) {
      const list = subjectTops[g][a].sort((x, y) => y.promedio - x.promedio);
      const max = list[0]?.promedio || 0;
      finalSubjectTops[g][a] = list.filter(u => u.promedio === max && max > 0);
    }
  }
  return { status: "success", global: leaderboard.slice(0, 10), subjectTops: finalSubjectTops };
}

function getGameStats(payload) {
  const { userId, grado, seccion } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logros = getOrCreateSheet(ss, "Logros").getDataRange().getValues().slice(1);
  if (userId) {
    const userRows = logros.filter(r => String(r[1]) === String(userId));
    const detailedLogs = getOrCreateSheet(ss, "QuizProAnalytics").getDataRange().getValues().slice(1).filter(r => String(r[2]) === String(userId));
    const userProfile = getOrCreateSheet(ss, "LearningProfile").getDataRange().getValues().slice(1).filter(r => String(r[1]) === String(userId));
    const stats = {};
    userRows.forEach(r => {
      const asig = r[4], lvl = r[6], grd = r[7];
      if (r[3] === "QuizPro") {
        const key = `QuizPro_${asig}_${grd}_${lvl}`;
        const logs = detailedLogs.filter(l => normalizeString(l[6]) === normalizeString(asig) && getStandardLevelName(l[8]) === getStandardLevelName(lvl));
        const overall = userProfile.find(up => normalizeString(up[2]) === normalizeString(asig) && up[3] === "__NIVEL_COMPLETO__" && up[4] === lvl);
        stats[key] = { maxScore: parseFloat(r[5]||0), dominio: Math.round(overall ? overall[8] : 0), icr: logs.length > 0 ? Math.round(logs.reduce((s,l)=>s+parseFloat(l[17]),0)/logs.length) : 0, ia: logs.length > 0 ? Math.round(logs.reduce((s,l)=>s+parseFloat(l[18]),0)/logs.length) : 0, xpAcumulada: logs.reduce((s,l)=>s+parseFloat(l[20]||0),0), totalAttempts: logs.length, date: r[0], level: lvl, grade: grd, subject: asig };
      } else { if (!stats[r[3]] || r[5] > stats[r[3]].maxScore) stats[r[3]] = { maxScore: r[5], date: r[0] }; }
    });
    return { status: "success", data: stats, allHistory: detailedLogs.length > 0 ? detailedLogs : userRows, learningProfile: userProfile };
  }
  if (!grado && !seccion) return { status: "success", data: logros };
  const students = getStudentsByGradoSeccion({ grado, seccion }).data.map(s => s.userId);
  return { status: "success", data: logros.filter(r => students.includes(r[1])) };
}

function recordAnalytics(payload) {
  const { userId, gameId, asignatura, grado, nivel, preguntaId, esCorrecta, tiempoRespuesta, cambiosRespuesta, tema, quizId, gameName, respuestaSeleccionada, respuestaCorrecta } = payload || {};
  if (!userId || !gameId || !asignatura || !preguntaId) return { status: "error", message: "Faltan IDs." };
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const analyticsSheet = getOrCreateSheet(ss, "QuizProAnalytics");
  const data = analyticsSheet.getDataRange().getValues().slice(1);
  const userLogs = data.filter(r => String(r[2]) === String(userId));
  const isCalibration = userLogs.length < ANALYTICS_CONFIG.CALIBRATION.THRESHOLD;
  const globalLogs = data.filter(r => String(r[9]) === String(preguntaId));
  let avgP = globalLogs.length > 0 ? globalLogs.reduce((s,r)=>s+parseFloat(r[13]),0)/globalLogs.length : 5000;
  let avgU = userLogs.length > 0 ? userLogs.reduce((s,r)=>s+parseFloat(r[13]),0)/userLogs.length : avgP;
  const tBase = (avgP * (isCalibration ? 0.8 : 0.6)) + (avgU * (isCalibration ? 0.2 : 0.4));
  const ratio = tiempoRespuesta / (tBase || 1);
  const attempts = userLogs.filter(l => String(l[9]) === String(preguntaId)).length + 1;
  const xpMult = attempts === 1 ? 1 : (attempts === 2 ? 0.75 : (attempts === 3 ? 0.5 : 0.25));
  let icr = ((userLogs.filter(l => String(l[12]) === "true").length + (esCorrecta ? 1 : 0)) / (userLogs.length + 1)) * 70 + (esCorrecta ? Math.min(1.0, 1.2 - ratio*0.2) : ratio*0.5) * 30;
  if (isCalibration) icr = Math.max(60, icr);
  const consecutive = (function(){ let c=0; for(let i=userLogs.length-1;i>=0;i--){ if(String(userLogs[i][12])==="true")c++; else break;} return c; })();
  let gp = ( (ratio<=0.5 ? 100 : (ratio<=1.0?100-(ratio-0.5)*100:Math.max(0,50-(ratio-1.0)*20))) * 0.35 + (esCorrecta?0:100)*0.35 + 15 ) * (1 - consecutive/Math.max(15, userLogs.length+1));
  if (isCalibration) gp = Math.min(30, gp);
  const aId = "ANL-" + Date.now();
  analyticsSheet.appendRow([aId, new Date(), userId, quizId||"", gameId, gameName||"QuizPro", asignatura, grado, nivel, preguntaId, respuestaSeleccionada||"", respuestaCorrecta||"", esCorrecta, tiempoRespuesta, tBase, ratio, cambiosRespuesta, Math.round(icr), Math.round(gp), Math.round(icr), esCorrecta?Math.round(100*xpMult):0]);
  updateLearningProfile(ss, userId, asignatura, tema, nivel, esCorrecta, icr);
  updateLearningProfile(ss, userId, asignatura, "__NIVEL_COMPLETO__", nivel, esCorrecta, icr);
  updateLeaderboard(ss, gameId, userId, asignatura, grado, icr);
  return { status: "success", metrics: { icr: Math.round(icr), gp: Math.round(gp), isCalibration } };
}

function updateLearningProfile(ss, userId, asignatura, tema, nivel, esCorrecta, dominioActual) {
  if (tema !== "__NIVEL_COMPLETO__" && (!tema || tema === 'General')) return;
  const sheet = getOrCreateSheet(ss, "LearningProfile");
  const data = sheet.getDataRange().getValues();
  const sUserId = String(userId), sAsig = normalizeSubjectInBackend(asignatura), sTema = tema.trim();
  let idx = data.findIndex(r => String(r[1])===sUserId && normalizeSubjectInBackend(r[2])===sAsig && r[3]===sTema && r[4]===nivel);
  if (idx !== -1) {
    const attempts = (parseInt(data[idx][5])||0)+1, hits = (parseInt(data[idx][6])||0)+(esCorrecta?1:0);
    const weight = (parseFloat(data[idx][7])>=90 && esCorrecta) ? 0.05 : 0.3;
    const hWeight = attempts < 5 ? 0.5 : (1 - weight);
    const nuevo = Math.round((parseFloat(data[idx][8])||0)*hWeight + dominioActual*(1-hWeight));
    sheet.getRange(idx+1, 6, 1, 5).setValues([[attempts, hits, Math.round(hits/attempts*100), nuevo, new Date()]]);
  } else { sheet.appendRow(["PRF-"+Date.now(), sUserId, sAsig, sTema, nivel, 1, esCorrecta?1:0, esCorrecta?100:0, dominioActual, new Date()]); }
}

function updateLeaderboard(ss, gameId, userId, asignatura, grado, dominio) {
  const sheet = getOrCreateSheet(ss, "GameLeaderboards");
  const data = sheet.getDataRange().getValues();
  let idx = data.findIndex(r => r[1]===gameId && r[2]===userId && r[5]===asignatura);
  if (idx !== -1) {
    const p = parseInt(data[idx][8])+1, d = Math.round((parseFloat(data[idx][7])*(p-1)+dominio)/p);
    sheet.getRange(idx+1, 8, 1, 3).setValues([[d, p, new Date()]]);
  } else {
    const user = ss.getSheetByName("Usuarios").getDataRange().getValues().find(r => r[0] === userId);
    sheet.appendRow(["LDB-"+Date.now(), gameId, userId, user?user[1]:"Anónimo", grado, asignatura, 0, dominio, 1, new Date()]);
  }
}

function getLearningProfile(payload) {
  const data = getOrCreateSheet(SpreadsheetApp.openById(SPREADSHEET_ID), "LearningProfile").getDataRange().getValues().slice(1);
  return { status: "success", data: data.filter(r => r[1] === payload.userId).map(r => ({ asignatura: r[2], tema: r[3], nivel: r[4], intentos: r[5], aciertos: r[6], porcentaje: r[7], dominio: r[8] })) };
}

function mergeGuestData(payload) {
  const { userId, history } = payload;
  if (!userId || !history) return { status: "error" };
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const analyticsSheet = getOrCreateSheet(ss, "QuizProAnalytics");

  history.forEach(item => {
    const data = item.data;
    // 1. Migrar Logros
    if (data.puntaje !== undefined && data.juego) {
      saveGameResult({ userId, nombreAlumno: data.nombreAlumno, juego: data.juego, asignatura: data.asignatura, puntaje: data.puntaje, nivel: data.nivel, grado: data.grado, xpGanada: data.xpGanada || 0 });
    }
    // 2. Migrar Analítica
    if (data.preguntaId) {
      const aId = "ANL-MERGE-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      analyticsSheet.appendRow([aId, new Date(item.updated_at || Date.now()), userId, data.quizId || "", data.gameId || "QuizPro", data.gameName || "QuizPro", data.asignatura, data.grado, data.nivel, data.preguntaId, data.respuestaSeleccionada, data.respuestaCorrecta, data.esCorrecta, data.tiempoRespuesta, 0, 0, data.cambiosRespuesta, 0, 0, 0, 0]);
    }
  });
  return { status: "success", message: "Historial fusionado." };
}

function getNews(payload) {
  const { grado, seccion, includeInactive } = payload || {};
  const data = getOrCreateSheet(SpreadsheetApp.openById(SPREADSHEET_ID), "NoticiasPortal").getDataRange().getValues().slice(1);
  const nowStr = new Date().toISOString().split('T')[0];

  const mapped = data.map(r => ({
    noticiaId: r[0] || ("NWS-" + r[1]),
    fecha: r[1],
    hora: r[2],
    titulo: r[3],
    contenido: r[4],
    imagenUrl: r[5],
    categoria: r[6] || "General",
    gradoAudiencia: r[7] || "Todos",
    seccionAudiencia: r[8] || "Todas",
    fechaInicio: r[9] || "",
    fechaFin: r[10] || "",
    estado: r[11] || "Activa"
  }));

  let filtered = mapped;
  if (!includeInactive) {
    filtered = filtered.filter(n => n.estado === "Activa");
    filtered = filtered.filter(n => (!n.fechaInicio || n.fechaInicio <= nowStr) && (!n.fechaFin || n.fechaFin >= nowStr));
  }

  if (grado) {
    const sGrado = normalizeString(grado);
    filtered = filtered.filter(n => !n.gradoAudiencia || normalizeString(n.gradoAudiencia) === "todos" || normalizeString(n.gradoAudiencia) === sGrado);
  }
  if (seccion) {
    const sSeccion = normalizeString(seccion);
    filtered = filtered.filter(n => !n.seccionAudiencia || normalizeString(n.seccionAudiencia) === "todas" || normalizeString(n.seccionAudiencia) === sSeccion);
  }

  filtered.sort((a,b) => new Date(b.fecha) - new Date(a.fecha) || String(b.hora).localeCompare(String(a.hora)));
  return { status: "success", data: filtered };
}

// --- MÓDULO FORMATIVO E INSTITUCIONAL INDEPENDIENTE (FASE 6) ---

function getInstitutionalCriteria(payload) {
  const { dominio } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CriteriosInstitucionales");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["CriterioID", "Dominio", "Nombre", "Descripcion", "EscalaJSON", "AmbitoNivel", "Estado"]);
  }

  let data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    const defaultCriteria = [
      ["CRIT-1", "Comportamiento", "Convivencia y Respeto", "Cumple acuerdos de convivencia y respeta a compañeros y docentes.", JSON.stringify(["Siempre", "Frecuentemente", "AlgunasVeces", "RequiereAcompañamiento"]), "Global", "Activo"],
      ["CRIT-2", "Comportamiento", "Responsabilidad y Colaboración", "Demuestra disposición colaborativa y asume responsabilidades.", JSON.stringify(["Siempre", "Frecuentemente", "AlgunasVeces", "RequiereAcompañamiento"]), "Global", "Activo"],
      ["CRIT-3", "AseoHigiene", "Hábitos de Higiene y Cuidado Personal", "Mantiene rutinas adecuadas de higiene personal y cuidado de sus elementos.", JSON.stringify(["Cumple", "CumpleParcialmente", "RequiereAcompañamiento", "NoEvaluado"]), "Global", "Activo"],
      ["CRIT-4", "PresentacionPersonal", "Uso del Uniforme e Identificación", "Cumple las normas institucionales sobre uso del uniforme e identificación escolar.", JSON.stringify(["Cumple", "CumpleParcialmente", "IncumplimientoObservado", "ExcepcionAutorizada"]), "Global", "Activo"]
    ];
    defaultCriteria.forEach(c => sheet.appendRow(c));
    data = sheet.getDataRange().getValues();
  }

  const criteria = data.slice(1).filter(r => {
    if (r[0] === "CriterioID" || r[0] === "ID") return false;
    if (dominio && normalizeString(r[1]) !== normalizeString(dominio)) return false;
    if (r[6] === "Inactivo") return false;
    return true;
  }).map(r => {
    let esc = [];
    try {
      esc = r[4] ? (typeof r[4] === 'string' ? JSON.parse(r[4]) : r[4]) : [];
    } catch (_) {
      esc = ["Cumple", "CumpleParcialmente", "RequiereAcompañamiento"];
    }
    return {
      criterioId: r[0],
      dominio: r[1],
      nombre: r[2],
      descripcion: r[3],
      escala: esc,
      ambitoNivel: r[5] || "Global",
      estado: r[6] || "Activo"
    };
  });

  return { status: "success", data: criteria };
}

function saveInstitutionalCriterion(payload) {
  const { criterioId, dominio, nombre, descripcion, escala, ambitoNivel } = payload || {};
  if (!nombre || !dominio) throw new Error("Nombre y Dominio son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CriteriosInstitucionales");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["CriterioID", "Dominio", "Nombre", "Descripcion", "EscalaJSON", "AmbitoNivel", "Estado"]);
  }

  const cid = criterioId || ("CRIT-" + Date.now());
  const escJSON = JSON.stringify(escala || ["Cumple", "CumpleParcialmente", "RequiereAcompañamiento"]);

  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(cid).trim());

  if (idx !== -1) {
    sheet.getRange(idx + 1, 2).setValue(dominio);
    sheet.getRange(idx + 1, 3).setValue(nombre);
    sheet.getRange(idx + 1, 4).setValue(descripcion || "");
    sheet.getRange(idx + 1, 5).setValue(escJSON);
  } else {
    sheet.appendRow([cid, dominio, nombre, descripcion || "", escJSON, ambitoNivel || "Global", "Activo"]);
  }

  return { status: "success", message: "Criterio institucional guardado.", data: { criterioId: cid } };
}

function getFormativeEvaluations(payload) {
  const { userId, dominio, grado, seccion, parcial } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "EvaluacionesFormativas");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const evaluations = data.slice(1).filter(r => {
    if (userId && String(r[1]).trim() !== String(userId).trim()) return false;
    if (dominio && normalizeString(r[2]) !== normalizeString(dominio)) return false;
    return true;
  }).map(r => ({
    evaluacionId: r[0],
    userId: r[1],
    dominio: r[2],
    criterioId: r[3],
    calificacionValor: r[4],
    observacionObjetiva: r[5],
    contexto: r[6],
    autorId: r[7],
    visibilidadBoletin: r[8] === true || String(r[8]).toLowerCase() === "true",
    fechaRegistro: r[9] ? new Date(r[9]).toISOString() : null
  }));

  return { status: "success", data: evaluations };
}

function saveFormativeEvaluation(payload) {
  const { userId, dominio, criterioId, calificacionValor, observacionObjetiva, contexto, autorId, visibilidadBoletin } = payload || {};
  if (!userId || !dominio || !calificacionValor) throw new Error("userId, dominio y calificacionValor son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "EvaluacionesFormativas");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "UserID", "Dominio", "CriterioID", "CalificacionValor", "ObservacionObjetiva", "Contexto", "AutorID", "VisibilidadBoletin", "FechaRegistro"]);
  }

  const evalId = "EVF-" + Date.now();
  const now = new Date();

  sheet.appendRow([
    evalId,
    userId,
    dominio,
    criterioId || "CRIT-GENERAL",
    calificacionValor,
    observacionObjetiva || "",
    contexto || "Rutinario",
    autorId || "Docente",
    visibilidadBoletin !== false,
    now
  ]);

  return { status: "success", message: "Evaluación formativa registrada.", data: { evaluacionId: evalId } };
}

function getSupportPlans(payload) {
  const { userId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PlanesAcompanamiento");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const plans = data.slice(1).filter(r => {
    if (userId && String(r[1]).trim() !== String(userId).trim()) return false;
    return true;
  }).map(r => ({
    planId: r[0],
    userId: r[1],
    situacionMeliorar: r[2],
    objetivos: r[3] ? (typeof r[3] === 'string' ? JSON.parse(r[3]) : r[3]) : [],
    responsableId: r[4],
    fechaInicio: r[5] ? new Date(r[5]).toISOString() : null,
    fechaRevision: r[6] ? new Date(r[6]).toISOString() : null,
    estado: r[7] || "Activo"
  }));

  return { status: "success", data: plans };
}

function saveSupportPlan(payload) {
  const { planId, userId, situacionMeliorar, objetivos, responsableId, fechaRevision } = payload || {};
  if (!userId || !situacionMeliorar) throw new Error("userId y situacionMeliorar son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PlanesAcompanamiento");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["PlanID", "UserID", "SituacionMeliorar", "ObjetivosJSON", "ResponsableID", "FechaInicio", "FechaRevision", "Estado"]);
  }

  const pid = planId || ("PLAN-ACOMP-" + Date.now());
  const objJSON = JSON.stringify(objetivos || []);
  const now = new Date();

  sheet.appendRow([pid, userId, situacionMeliorar, objJSON, responsableId || "Orientacion", now, fechaRevision || "", "Activo"]);

  return { status: "success", message: "Plan de acompañamiento guardado.", data: { planId: pid } };
}

// --- FUNCIONES PORTAL FAMILIAR Y COMUNICACIÓN INSTITUCIONAL (FASE 8) ---

function createLinkInvitation(payload) {
  const { expedienteId, emailResponsable, creadoPor } = payload || {};
  if (!expedienteId || !emailResponsable) throw new Error("expedienteId y emailResponsable son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "InvitacionesVinculacion");

  const invId = "INV-" + Date.now();
  const token = "TOK-" + Utilities.getUuid();
  const now = new Date();
  const expDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  sheet.appendRow([
    invId,
    expedienteId,
    emailResponsable,
    token,
    now,
    expDate,
    "Activa",
    creadoPor || "Secretaría"
  ]);

  return { status: "success", message: "Invitación de vinculación emitida.", data: { invitacionId: invId, token } };
}

function acceptLinkInvitation(payload) {
  const { token, userIdResponsable } = payload || {};
  if (!token || !userIdResponsable) throw new Error("Token e Identificador de Responsable son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "InvitacionesVinculacion");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[3]).trim() === String(token).trim() && r[6] === "Activa");

  if (idx === -1) throw new Error("Invitación no encontrada o expirada.");

  const row = data[idx];
  const now = new Date();
  const expDate = new Date(row[5]);
  if (now.getTime() > expDate.getTime()) {
    sheet.getRange(idx + 1, 7).setValue("Expirada");
    throw new Error("La invitación ha expirado.");
  }

  sheet.getRange(idx + 1, 7).setValue("Utilizada");

  const relSheet = getOrCreateSheet(ss, "RelacionesFamiliares");
  const relId = "REL-" + Date.now();
  relSheet.appendRow([
    relId,
    row[1],
    userIdResponsable,
    "Padre/Tutor",
    "Verificada",
    now,
    "",
    "Vinculación aceptada mediante invitación con token."
  ]);

  return { status: "success", message: "Vinculación familiar completada exitosamente." };
}

function getGuardianStudents(payload) {
  const { userIdResponsable } = payload || {};
  if (!userIdResponsable) throw new Error("userIdResponsable es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const relSheet = getOrCreateSheet(ss, "RelacionesFamiliares");
  const relData = relSheet.getDataRange().getValues();

  let verifiedStudents = [];
  if (relData.length > 1) {
    verifiedStudents = relData.slice(1).filter(r => {
      return String(r[2]).trim() === String(userIdResponsable).trim() && (r[4] === "Verificada" || r[4] === "Activa");
    }).map(r => ({
      relacionId: r[0],
      expedienteEstudianteId: r[1],
      tipoParentesco: r[3],
      estado: r[4]
    }));
  }

  // Fallback / Sync con RelacionesEstudianteTutor
  if (verifiedStudents.length === 0) {
    const tutorRelSheet = getOrCreateSheet(ss, "RelacionesEstudianteTutor");
    const tutorData = tutorRelSheet.getDataRange().getValues();
    if (tutorData.length > 1) {
      verifiedStudents = tutorData.slice(1).filter(r => {
        return String(r[2]).trim() === String(userIdResponsable).trim() && (r[9] === "Verificada" || r[9] === "Activa");
      }).map(r => ({
        relacionId: r[0],
        expedienteEstudianteId: r[1],
        tipoParentesco: r[3],
        estado: r[9]
      }));
    }
  }

  return { status: "success", data: verifiedStudents };
}

function getInstitutionalAnnouncements(payload) {
  const { rol, audiencia } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ComunicadosInstitucionales");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const userAud = normalizeString(audiencia || rol || "TodaLaComunidad");

  const announcements = data.slice(1).filter(r => {
    if (r[8] === "Retirado") return false;
    const audStr = normalizeString(typeof r[5] === 'string' ? r[5] : JSON.stringify(r[5]));
    if (audStr.indexOf("todalacomunidad") !== -1 || audStr === "" || audStr === userAud || (userAud && audStr.indexOf(userAud) !== -1)) {
      return true;
    }
    return false;
  }).map(r => ({
    comunicadoId: r[0],
    titulo: r[1],
    contenido: r[2],
    categoria: r[3] || "General",
    autorId: r[4],
    audiencia: r[5] ? (typeof r[5] === 'string' ? JSON.parse(r[5]) : r[5]) : "TodaLaComunidad",
    requiereFirma: r[6] === true || String(r[6]).toLowerCase() === "true",
    fechaPublicacion: r[7] ? new Date(r[7]).toISOString() : null,
    estado: r[8] || "Publicado"
  }));

  return { status: "success", data: announcements };
}

function createInstitutionalAnnouncement(payload) {
  const { titulo, contenido, categoria, autorId, audiencia, requiereFirma } = payload || {};
  if (!titulo || !contenido) throw new Error("Título y Contenido son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ComunicadosInstitucionales");

  const comId = "COMUN-" + Date.now();
  const now = new Date();

  sheet.appendRow([
    comId,
    titulo,
    contenido,
    categoria || "General",
    autorId || "Dirección",
    JSON.stringify(audiencia || "TodaLaComunidad"),
    requiereFirma || false,
    now,
    "Publicado"
  ]);

  return { status: "success", message: "Comunicado institucional publicado.", data: { comunicadoId: comId } };
}

function submitAnnouncementReceiptConfirmation(payload) {
  const { comunicadoId, userId, ipMetadata } = payload || {};
  if (!comunicadoId || !userId) throw new Error("comunicadoId y userId son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ConfirmacionesLecturaComunicados");
  const now = new Date();
  const confId = "CONF-" + now.getTime();

  sheet.appendRow([
    confId,
    String(comunicadoId).trim(),
    String(userId).trim(),
    now,
    now,
    "ConfirmadoExplicito",
    ipMetadata || "127.0.0.1"
  ]);

  return { status: "success", confirmacionId: confId, message: "Confirmación explícita de recepción de comunicado registrada con éxito." };
}

function getAnnouncementReadReport(payload) {
  const { comunicadoId } = payload || {};
  if (!comunicadoId) throw new Error("comunicadoId requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "ConfirmacionesLecturaComunicados").getDataRange().getValues().slice(1);

  const filtered = rows.filter(r => String(r[1]).trim() === String(comunicadoId).trim());

  const mapped = filtered.map(r => ({
    confirmacionId: r[0],
    comunicadoId: r[1],
    userId: r[2],
    fechaApertura: r[3],
    fechaConfirmacionExplicit: r[4],
    estadoConfirmacion: r[5]
  }));

  return { status: "success", comunicadoId: comunicadoId, totalConfirmaciones: mapped.length, confirmaciones: mapped };
}

function getDepartmentalWorkInbox(payload) {
  const { departamento, authRole } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SolicitudesTramites");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", solicitudes: [] };

  const depTarget = normalizeString(departamento || authRole || "Secretaria");

  const solicitudes = data.slice(1).filter(r => {
    const asgn = normalizeString(r[7] || "Secretaria");
    return asgn.indexOf(depTarget) !== -1 || depTarget.indexOf(asgn) !== -1 || depTarget === "direccion" || depTarget === "administrador";
  }).map(r => ({
    solicitudId: r[0],
    userId: r[1],
    estudianteId: r[2],
    tipoTramite: r[3],
    descripcion: r[4],
    adjuntoUrl: r[5],
    estado: r[6] || "Enviada",
    asignadoA: r[7],
    observacionesAdmin: r[8],
    fechaSolicitud: r[9],
    fechaResolucion: r[10]
  }));

  return { status: "success", departamento: departamento || authRole, solicitudes: solicitudes };
}

function closeConversationThread(payload) {
  const { conversacionId, observaciones } = payload || {};
  if (!conversacionId) throw new Error("conversacionId requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ConversacionesMensajes");
  const data = sheet.getDataRange().getValues();

  let count = 0;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === String(conversacionId).trim()) {
      sheet.getRange(i + 1, 9).setValue("Cerrado");
      count++;
    }
  }

  return { status: "success", conversacionId: conversacionId, mensajesAfectados: count, message: "Hilo de conversación cerrado exitosamente." };
}

function getInternalConversations(payload) {
  return getInternalMessages(payload);
}

function getInternalMessages(payload) {
  const { conversacionId, userId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ConversacionesMensajes");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const messages = data.slice(1).filter(r => {
    if (conversacionId && String(r[1]).trim() === String(conversacionId).trim()) return true;
    if (userId && (String(r[2]).trim() === String(userId).trim() || String(r[3]).trim() === String(userId).trim())) return true;
    return false;
  }).map(r => ({
    mensajeId: r[0],
    conversacionId: r[1],
    remitenteId: r[2],
    destinatarioId: r[3],
    estudianteId: r[4],
    mensajeTexto: r[5],
    adjuntoUrl: r[6],
    fechaEnvio: r[7] ? new Date(r[7]).toISOString() : null,
    estadoLectura: r[8] || "Enviado"
  }));

  return { status: "success", data: messages };
}

function sendInternalMessage(payload) {
  const { conversacionId, remitenteId, destinatarioId, estudianteId, mensajeTexto, adjuntoUrl } = payload || {};
  if (!remitenteId || !destinatarioId || !mensajeTexto) throw new Error("Remitente, Destinatario y Mensaje son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ConversacionesMensajes");

  const msgId = "MSG-" + Date.now();
  const convId = conversacionId || ("CONV-" + [remitenteId, destinatarioId].sort().join("-"));
  const now = new Date();

  sheet.appendRow([
    msgId,
    convId,
    remitenteId,
    destinatarioId,
    estudianteId || "",
    mensajeTexto,
    adjuntoUrl || "",
    now,
    "Enviado"
  ]);

  try {
    createUserNotification({
      userId: destinatarioId,
      titulo: "Nuevo Mensaje Institucional",
      mensaje: `Ha recibido un mensaje: "${mensajeTexto.substring(0, 50)}..."`,
      tipo: "Mensaje",
      categoria: "Comunicacion"
    });
  } catch (e) {
    logDebug("Error creando notificacion de mensaje:", e.message);
  }

  return { status: "success", message: "Mensaje interno enviado.", data: { mensajeId: msgId, conversacionId: convId } };
}

function getUnifiedNotifications(payload) {
  const { userId, categoria, leido } = payload || {};
  if (!userId) throw new Error("userId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "BandejaNotificaciones");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [], unreadCount: 0 };

  let filtered = data.slice(1).filter(r => String(r[1]).trim() === String(userId).trim());

  if (categoria) {
    filtered = filtered.filter(r => String(r[5]).toLowerCase().trim() === String(categoria).toLowerCase().trim());
  }
  if (leido !== undefined) {
    const isLeido = leido === true || String(leido).toLowerCase() === "true";
    filtered = filtered.filter(r => (r[6] === true || String(r[6]).toLowerCase() === "true") === isLeido);
  }

  const notifications = filtered.map(r => ({
    notificacionId: r[0],
    userId: r[1],
    titulo: r[2],
    mensaje: r[3],
    tipo: r[4] || "Informativa",
    categoria: r[5] || "General",
    leido: r[6] === true || String(r[6]).toLowerCase() === "true",
    enlaceAccion: r[7] || "",
    fechaRegistro: r[8] ? new Date(r[8]).toISOString() : null
  }));

  const unreadCount = data.slice(1).filter(r => String(r[1]).trim() === String(userId).trim() && (r[6] !== true && String(r[6]).toLowerCase() !== "true")).length;

  return { status: "success", data: notifications, unreadCount: unreadCount };
}

function sendMultiChannelNotification(payload) {
  const { userId, titulo, mensaje, tipo, categoria, canal, enlaceAccion } = payload || {};
  if (!userId || !titulo || !mensaje) throw new Error("userId, titulo y mensaje son requeridos.");

  const res = createUserNotification({
    userId: userId,
    titulo: titulo,
    mensaje: mensaje,
    tipo: tipo || "NotificacionTransversal",
    categoria: categoria || "General",
    enlaceAccion: enlaceAccion || ""
  });

  logStructuredEvent("USER", "sendMultiChannelNotification", "INFO", "NOTIFICATION_SENT", `Notificación enviada a ${userId} por canal ${canal || 'Plataforma'}`, payload, payload.authRole);

  return { status: "success", notificacionId: res.data ? res.data.notificacionId : "NOTIF-OK", canalUtilizado: canal || "PlataformaInterna", message: "Notificación despachada correctamente." };
}

function getNotificationPreferences(payload) {
  const { userId } = payload || {};
  return {
    status: "success",
    userId: userId,
    preferences: {
      alertasAcademicas: true,
      avisosAsistencia: true,
      comunicadosInstitucionales: true,
      recordatoriosFinancieros: true,
      pedidosTiendaCafeteria: true,
      canalPreferido: "PlataformaYCorreo"
    }
  };
}

function getUserNotifications(payload) {
  return getUnifiedNotifications(payload);
}

function markNotificationAsRead(payload) {
  const { notificacionId } = payload || {};
  if (!notificacionId) throw new Error("notificacionId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "BandejaNotificaciones");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(notificacionId).trim());
  if (idx === -1) throw new Error("Notificación no encontrada.");

  sheet.getRange(idx + 1, 7).setValue(true);
  return { status: "success", message: "Notificación marcada como leída." };
}

function createUserNotification(payload) {
  const { userId, titulo, mensaje, tipo, categoria, enlaceAccion } = payload || {};
  if (!userId || !titulo || !mensaje) return { status: "error", message: "userId, titulo y mensaje son requeridos." };

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "BandejaNotificaciones");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["NotificacionID", "UserId", "Titulo", "Mensaje", "Tipo", "Categoria", "Leido", "EnlaceAccion", "FechaRegistro"]);
  }

  const notifId = "NOTIF-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  const now = new Date();

  sheet.appendRow([
    notifId,
    userId,
    titulo,
    mensaje,
    tipo || "Informativa",
    categoria || "General",
    false,
    enlaceAccion || "",
    now
  ]);

  return { status: "success", message: "Notificación registrada.", data: { notificacionId: notifId } };
}

function getAdministrativeRequests(payload) {
  const { userId, estudianteId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SolicitudesTramites");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const requests = data.slice(1).filter(r => {
    if (userId && String(r[1]).trim() !== String(userId).trim()) return false;
    if (estudianteId && String(r[2]).trim() !== String(estudianteId).trim()) return false;
    return true;
  }).map(r => ({
    solicitudId: r[0],
    userId: r[1],
    estudianteId: r[2],
    tipoTramite: r[3],
    descripcion: r[4],
    adjuntoUrl: r[5],
    estado: r[6] || "Enviada",
    asignadoA: r[7] || "Secretaría",
    observacionesAdmin: r[8] || "",
    fechaSolicitud: r[9] ? new Date(r[9]).toISOString() : null,
    fechaResolucion: r[10] ? new Date(r[10]).toISOString() : null
  }));

  return { status: "success", data: requests };
}

function submitStudentAbsenceJustification(payload) {
  const { userId, estudianteId, fechaAusencia, motivo, observaciones, adjuntoUrl } = payload || {};
  if (!userId || !estudianteId || !fechaAusencia || !motivo) throw new Error("userId, estudianteId, fechaAusencia y motivo son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SolicitudesTramites");

  const solId = "JUST-" + Date.now();
  const now = new Date();
  const desc = `Justificación de ausencia para la fecha ${fechaAusencia}. Motivo: ${motivo}. Observaciones: ${observaciones || 'N/A'}`;

  sheet.appendRow([
    solId,
    userId,
    estudianteId,
    "Justificación de Ausencia",
    desc,
    adjuntoUrl || "",
    "Enviada",
    "Orientación/Secretaría",
    "",
    now,
    ""
  ]);

  return { status: "success", solicitudId: solId, message: "Justificación de ausencia ingresada y en proceso de revisión." };
}

function getStudentAbsenceJustifications(payload) {
  const { estudianteId, userId } = payload || {};
  const res = getAdministrativeRequests({ userId, estudianteId });
  const justs = (res.data || []).filter(r => r.tipoTramite === "Justificación de Ausencia");
  return { status: "success", justificantes: justs };
}

function reviewAbsenceJustification(payload) {
  const { solicitudId, nuevoEstado, observacionesAdmin, authRole } = payload || {};
  return updateRequestStatus({ solicitudId, nuevoEstado, observacionesAdmin, asignadoA: authRole || "Orientación/Secretaría" });
}

function getAdministrativeRequestsHistory(payload) {
  return getAdministrativeRequests(payload);
}

function submitAdministrativeRequest(payload) {
  const { userId, estudianteId, tipoTramite, descripcion, adjuntoUrl } = payload || {};
  if (!userId || !tipoTramite || !descripcion) throw new Error("userId, tipoTramite y descripcion son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SolicitudesTramites");

  const solId = "TRAM-" + Date.now();
  const now = new Date();

  sheet.appendRow([
    solId,
    userId,
    estudianteId || "",
    tipoTramite,
    descripcion,
    adjuntoUrl || "",
    "Enviada",
    "Secretaría",
    "",
    now,
    ""
  ]);

  try {
    createUserNotification({
      userId: userId,
      titulo: "Trámite Registrado",
      mensaje: `Su solicitud de ${tipoTramite} ha sido ingresada en Secretaría.`,
      tipo: "Tramite",
      categoria: "Administrativa"
    });
  } catch (e) {
    logDebug("Error creando notificacion de tramite:", e.message);
  }

  return { status: "success", message: "Trámite/Solicitud ingresado correctamente.", data: { solicitudId: solId } };
}

function updateRequestStatus(payload) {
  const { solicitudId, nuevoEstado, observacionesAdmin, asignadoA } = payload || {};
  if (!solicitudId || !nuevoEstado) throw new Error("solicitudId y nuevoEstado son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SolicitudesTramites");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(solicitudId).trim());
  if (idx === -1) throw new Error("Solicitud no encontrada.");

  sheet.getRange(idx + 1, 7).setValue(nuevoEstado);
  if (observacionesAdmin) sheet.getRange(idx + 1, 9).setValue(observacionesAdmin);
  if (asignadoA) sheet.getRange(idx + 1, 8).setValue(asignadoA);
  sheet.getRange(idx + 1, 11).setValue(new Date());

  return { status: "success", message: `Estado de la solicitud actualizado a ${nuevoEstado}.` };
}

// ---------------------------------------------------------------------------
// FASE 24: FORMULARIOS INSTITUCIONALES Y TRÁMITES DIGITALES
// ---------------------------------------------------------------------------

function saveInstitutionalForm(payload) {
  const {
    formId,
    codigoFormulario,
    titulo,
    descripcion,
    departamento,
    definicionJSON,
    estado,
    version,
    requiereFirma,
    plantillaDocumentoId,
    creadoPor
  } = payload || {};

  if (!titulo) throw new Error("El título del formulario es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "FormulariosInstitucionales");
  const data = sheet.getDataRange().getValues();

  let fId = formId;
  let code = codigoFormulario || ("FRM-" + Math.floor(1000 + Math.random() * 9000));
  let existingIdx = -1;

  if (fId) {
    existingIdx = data.findIndex(r => String(r[0]).trim() === String(fId).trim());
  } else {
    existingIdx = data.findIndex(r => String(r[1]).trim() === String(code).trim());
  }

  const defJSON = typeof definicionJSON === "object" ? JSON.stringify(definicionJSON) : (definicionJSON || "[]");
  const nowISO = new Date().toISOString();
  let finalVersion = version || "1.0";
  let finalState = estado || "publicado";

  if (existingIdx !== -1) {
    fId = data[existingIdx][0];
    const prevVersion = data[existingIdx][7] || "1.0";
    if (finalState === "publicado" && data[existingIdx][6] === "publicado" && !version) {
      const vParts = String(prevVersion).split(".");
      const minor = parseInt(vParts[1] || "0", 10) + 1;
      finalVersion = (vParts[0] || "1") + "." + minor;
    }

    sheet.getRange(existingIdx + 1, 1, 1, 12).setValues([[
      fId,
      code,
      titulo,
      descripcion || "",
      departamento || "Secretaría",
      defJSON,
      finalState,
      finalVersion,
      requiereFirma ? "SI" : "NO",
      plantillaDocumentoId || "",
      nowISO,
      creadoPor || "Sistema"
    ]]);
  } else {
    fId = "FORM-" + Date.now();
    sheet.appendRow([
      fId,
      code,
      titulo,
      descripcion || "",
      departamento || "Secretaría",
      defJSON,
      finalState,
      finalVersion,
      requiereFirma ? "SI" : "NO",
      plantillaDocumentoId || "",
      nowISO,
      creadoPor || "Sistema"
    ]);
  }

  return {
    status: "success",
    formId: fId,
    version: finalVersion,
    estado: finalState,
    message: "Formulario institucional guardado y publicado con éxito."
  };
}

function getInstitutionalForms(payload) {
  const { departamento, estado } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "FormulariosInstitucionales");
  const rows = sheet.getDataRange().getValues().slice(1);

  let filtered = rows;
  if (departamento) filtered = filtered.filter(r => String(r[4]).toLowerCase() === String(departamento).toLowerCase());
  if (estado) filtered = filtered.filter(r => String(r[6]).toLowerCase() === String(estado).toLowerCase());

  const mapped = filtered.map(r => ({
    formId: r[0],
    codigoFormulario: r[1],
    titulo: r[2],
    descripcion: r[3],
    departamento: r[4],
    definicionJSON: r[5],
    estado: r[6],
    version: r[7],
    requiereFirma: r[8] === "SI",
    plantillaDocumentoId: r[9],
    fechaCreacion: r[10],
    creadoPor: r[11]
  }));

  return {
    status: "success",
    formularios: mapped
  };
}

function submitInstitutionalFormRequest(payload) {
  const {
    userId,
    estudianteId,
    formId,
    tipoTramite,
    respuestasFormularioJSON,
    adjuntoUrl,
    adjuntoFileId,
    observaciones
  } = payload || {};

  if (!userId || !tipoTramite) throw new Error("userId y tipoTramite son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SolicitudesTramites");

  const solId = "SOL-FRM-" + Date.now();
  const now = new Date();
  const respStr = typeof respuestasFormularioJSON === "object" ? JSON.stringify(respuestasFormularioJSON) : (respuestasFormularioJSON || "{}");

  const desc = `Solicitud mediante formulario [${formId || 'N/A'}]: ${respStr}. Observaciones: ${observaciones || 'Sin observaciones'}`;

  sheet.appendRow([
    solId,
    userId,
    estudianteId || "N/A",
    tipoTramite,
    desc,
    adjuntoUrl || (adjuntoFileId ? "https://drive.google.com/uc?id=" + adjuntoFileId : ""),
    "Enviada",
    "Secretaría/Orientación",
    "",
    now.toISOString(),
    ""
  ]);

  return {
    status: "success",
    solicitudId: solId,
    fechaSolicitud: now.toISOString(),
    message: "Trámite digital enviado con éxito para revisión oficial."
  };
}

function getAppointmentBookings(payload) {
  const { solicitanteId, estudianteId, solicitadoA } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CitasReuniones");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const appointments = data.slice(1).filter(r => {
    if (solicitanteId && String(r[1]).trim() !== String(solicitanteId).trim()) return false;
    if (estudianteId && String(r[2]).trim() !== String(estudianteId).trim()) return false;
    if (solicitadoA && String(r[3]).trim() !== String(solicitadoA).trim()) return false;
    return true;
  }).map(r => ({
    citaId: r[0],
    solicitanteId: r[1],
    estudianteId: r[2],
    solicitadoA: r[3],
    motivo: r[4],
    fechaHora: r[5] ? new Date(r[5]).toISOString() : null,
    modalidad: r[6] || "Presencial",
    estado: r[7] || "Solicitada",
    comentarios: r[8] || ""
  }));

  return { status: "success", data: appointments };
}

function bookAppointment(payload) {
  const { solicitanteId, estudianteId, solicitadoA, motivo, fechaHora, modalidad } = payload || {};
  if (!solicitanteId || !solicitadoA || !motivo || !fechaHora) throw new Error("Solicitante, Destinatario, Motivo y Fecha/Hora son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CitasReuniones");

  const citaId = "CITA-" + Date.now();

  sheet.appendRow([
    citaId,
    solicitanteId,
    estudianteId || "",
    solicitadoA,
    motivo,
    fechaHora,
    modalidad || "Presencial",
    "Solicitada",
    ""
  ]);

  return { status: "success", message: "Solicitud de cita/reunión enviada.", data: { citaId } };
}

function updateAppointmentStatus(payload) {
  const { citaId, nuevoEstado, comentarios } = payload || {};
  if (!citaId || !nuevoEstado) throw new Error("citaId y nuevoEstado son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CitasReuniones");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(citaId).trim());
  if (idx === -1) throw new Error("Cita no encontrada.");

  sheet.getRange(idx + 1, 8).setValue(nuevoEstado);
  if (comentarios) sheet.getRange(idx + 1, 9).setValue(comentarios);

  return { status: "success", message: `Estado de la cita cambiado a ${nuevoEstado}.` };
}

function createNews(payload) {
  const { titulo, contenido, imagenUrl, categoria, gradoAudiencia, seccionAudiencia, fechaInicio, fechaFin } = payload || {};
  if (!titulo || !contenido) throw new Error("Título y contenido requeridos.");
  const now = new Date();
  let img = imagenUrl || ""; if (img && !img.includes("http")) img = `https://lh3.googleusercontent.com/d/${img}`;
  const noticiaId = "NWS-" + now.getTime();

  getOrCreateSheet(SpreadsheetApp.openById(SPREADSHEET_ID), "NoticiasPortal").appendRow([
    noticiaId,
    now.toISOString().split('T')[0],
    now.toTimeString().split(' ')[0],
    titulo,
    contenido,
    img,
    categoria || "General",
    gradoAudiencia || "Todos",
    seccionAudiencia || "Todas",
    fechaInicio || now.toISOString().split('T')[0],
    fechaFin || "",
    "Activa"
  ]);
  return { status: "success", noticiaId: noticiaId, message: "Noticia publicada exitosamente." };
}

function updateNewsStatus(payload) {
  const { noticiaId, estado } = payload || {};
  if (!noticiaId || !estado) throw new Error("noticiaId y estado requeridos.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "NoticiasPortal");
  const data = sheet.getDataRange().getValues();

  const idx = data.findIndex(r => String(r[0]).trim() === String(noticiaId).trim() || String(r[3]).toLowerCase().trim() === String(noticiaId).toLowerCase().trim());
  if (idx === -1) throw new Error("Noticia no encontrada.");

  sheet.getRange(idx + 1, 12).setValue(estado);
  return { status: "success", message: `Estado de la noticia actualizado a '${estado}'.` };
}

function getInstitutionalCalendarEvents(payload) {
  const { categoria, anoLectivo } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("CalendarioAcademico");
  if (!sheet) {
    return {
      status: "success",
      eventos: [
        { eventoId: "EVT-01", titulo: "Inicio de Clases I Parcial", fechaInicio: "2026-02-01", categoria: "Academico", destinatarios: "TodaLaComunidad" },
        { eventoId: "EVT-02", titulo: "Exámenes I Parcial", fechaInicio: "2026-04-15", categoria: "Evaluacion", destinatarios: "TodaLaComunidad" }
      ]
    };
  }
  const rows = sheet.getDataRange().getValues().slice(1);

  let filtered = rows;
  if (categoria) filtered = filtered.filter(r => String(r[3]).toLowerCase().trim() === String(categoria).toLowerCase().trim());

  const mapped = filtered.map(r => ({
    eventoId: r[0],
    titulo: r[2],
    fechaInicio: r[4],
    fechaFin: r[5],
    categoria: r[3],
    destinatarios: r[6]
  }));

  return { status: "success", eventos: mapped };
}

function getPendingReminders(payload) {
  const { userId } = payload || {};
  if (!userId) throw new Error("userId requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const notifs = getOrCreateSheet(ss, "BandejaNotificaciones").getDataRange().getValues().slice(1);

  const pending = notifs
    .filter(r => String(r[1]).trim() === String(userId).trim() && (r[6] !== true && String(r[6]).toLowerCase() !== "true"))
    .map(r => ({
      reminderId: r[0],
      titulo: r[2],
      mensaje: r[3],
      categoria: r[5],
      fechaRegistro: r[8]
    }));

  return { status: "success", userId: userId, recordatoriosPendientes: pending };
}

function getParentDriveFolder() {
  try {
    const folderId = PropertiesService.getScriptProperties().getProperty('PARENT_FOLDER_ID');
    if (folderId) return DriveApp.getFolderById(folderId);
  } catch (_) {}
  return DriveApp.getRootFolder();
}

function uploadNewsImage(payload) {
  const folder = getOrCreateFolderNews(getParentDriveFolder(), "Noticias_Imagenes");
  const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(payload.fileData.split(',')[1]), payload.fileData.split(',')[0].match(/:(.*?);/)[1], payload.fileName));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { status: "success", data: { fileId: file.getId(), directUrl: `https://lh3.googleusercontent.com/d/${file.getId()}` } };
}

function getOrCreateFolderNews(parent, name) { const f = parent.getFoldersByName(name); return f.hasNext() ? f.next() : parent.createFolder(name); }
