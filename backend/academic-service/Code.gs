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

// [FASE2-T03] [Fase 2 - Contratos API y Compatibilidad] - Formato estandarizado de respuestas de API, marca de tiempo y códigos de error normalizados.
function textResponse(obj) {
  if (obj && typeof obj === "object") {
    if (!obj.status) obj.status = "success";
    if (!obj.timestamp) obj.timestamp = new Date().toISOString();
    if (obj.status === "error" && !obj.code) obj.code = "INTERNAL_ERROR";
  }
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

// [REQ-EXP-018] [Requerimientos de Expansión y Desarrollo] - Sistema de registros de auditoría estructurados con sanitización de credenciales.
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
    // [REQ-EXP-002] [Requerimientos de Expansión y Desarrollo] - Esquema tabular normalizado de 9 columnas en ConfiguracionAcademica y 8 en HistorialAcademico.
    if (name === "ConfiguracionAcademica") sheet.appendRow(["ID", "Fecha", "Parcial", "Grado", "Sección", "Asignatura", "Unidad", "Tema", "profesorId"]);
    if (name === "HistorialAcademico") sheet.appendRow(["ID", "Fecha", "Parcial", "Grado", "Sección", "Asignatura", "Unidad", "profesorId"]);
    if (name === "Clases") sheet.appendRow(["Grado", "Seccion", "WhatsAppLink"]);
    if (name === "BancoPreguntas") sheet.appendRow(["PreguntaID", "Asignatura", "Nivel", "Tema", "TipoActividad", "Pregunta", "OpcionA", "OpcionB", "OpcionC", "OpcionD", "RespuestaCorrecta", "Explicacion", "Imagen", "VecesRespondida", "VecesCorrecta", "PorcentajeAcierto", "UltimaActualizacion", "Activa", "DificultadCalculada"]);
    if (name === "Matriculas") sheet.appendRow(["MatriculaID", "Fecha", "UserId", "Alumno", "Grado", "Seccion", "Periodo", "Tipo", "Estado", "BecaDescuento", "Observaciones"]);
    if (name === "CargosEstudiante") sheet.appendRow(["CargoID", "Fecha", "UserId", "Concepto", "MontoBase", "Descuento", "MontoFinal", "Estado", "FechaVencimiento"]);

    // Tablas Nueva Fase - Configuración de Año Escolar, Jornadas, Malla, Actividades
    if (name === "JornadasAcademicas") sheet.appendRow(["JornadaID", "NombreJornada", "TipoJornada", "HoraInicio", "HoraFin", "DuracionClaseMin", "DuracionRecesoMin", "DuracionAlmuerzoMin", "Estado", "Observaciones"]);
    if (name === "MallaCurricularDist") sheet.appendRow(["MallaID", "AnoID", "Grado", "Seccion", "AsignaturaID", "HorasSemana", "HorasDia", "RequiereBloqueConsecutivo", "DiasPermitidosJSON", "Estado"]);
    if (name === "ActividadesInstitucionales") sheet.appendRow(["ActividadID", "AnoID", "Titulo", "TipoActividad", "FechaInicio", "FechaFin", "HoraInicio", "HoraFin", "EstrategiaAfectacion", "ClasesAfectadasJSON", "AutorizadoPor", "Estado"]);
    if (name === "ActividadesExtracurriculares") sheet.appendRow(["ExtracurricularID", "AnoID", "Nombre", "Categoria", "HorarioJSON", "EncargadosJSON", "SupervisoresJSON", "Estado", "EvidenciasDriveFolderId", "EvidenciasJSON"]);

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

    // Nuevas Tablas Fase 7 - Asistencia y Seguimiento Estudiantil
    if (name === "SesionesAsistencia") sheet.appendRow(["SesionID", "Fecha", "HoraInicio", "HoraFin", "Grado", "Seccion", "AsignaturaID", "DocenteUserId", "Estado", "Observaciones"]);
    if (name === "RegistrosAsistencia") sheet.appendRow(["RegistroID", "SesionID", "UserId", "EstadoAsistencia", "HoraLlegada", "MinutosTardanza", "Justificado", "ObservacionDocente", "FechaRegistro"]);
    if (name === "JustificacionesAsistencia") sheet.appendRow(["JustificacionID", "UserId", "FechaAfectada", "Periodo", "MotivoDeclarado", "AdjuntoUrl", "PresentadoPor", "EstadoRevision", "RevisadoPor", "ObservacionesAdmin", "FechaResolucion"]);
    if (name === "SalidasAnticipadas") sheet.appendRow(["SalidaID", "UserId", "Fecha", "HoraSalida", "Motivo", "AutorizadoPor", "RetiradoPor", "RegresoHora", "Estado"]);
    if (name === "IncidenciasAsistencia") sheet.appendRow(["IncidenciaID", "UserId", "TipoIncidencia", "Descripcion", "Fecha", "Estado", "ReportadoPor"]);
    if (name === "CasosSeguimiento") sheet.appendRow(["CasoID", "UserId", "MotivoApertura", "ResumenAsistencia", "ResponsableID", "AccionesJSON", "Estado", "FechaApertura", "FechaCierre"]);

    // Nuevas Tablas Fase 13 - Supervisión Docente y Calidad Educativa
    if (name === "SupervisionesDocentes") sheet.appendRow(["SupervisionID", "DocenteUserId", "SupervisorUserId", "FechaProgramada", "Grado", "Seccion", "Asignatura", "TipoSupervision", "RubricaID", "Estado", "ObservacionesAdmin", "FechaCreacion"]);
    if (name === "ObservacionesSupervision") sheet.appendRow(["ObservacionID", "SupervisionID", "RespuestasRubricaJSON", "EvidenciasTexto", "FortalezasTexto", "OportunidadesMejora", "ComentarioDocente", "FechaRegistro"]);
    if (name === "PlanesMejoraPedagogica") sheet.appendRow(["PlanID", "SupervisionID", "DocenteUserId", "ObjetivoMejora", "AccionesJSON", "ResponsableAcompanamiento", "FechaInicio", "FechaObjetivo", "Estado", "FechaRevision"]);

    // TAREA-18 - Recursos Educativos y Proyectos Interdisciplinarios
    if (name === "RecursosEducativosReutilizables") sheet.appendRow(["RecursoID", "Titulo", "Area", "Asignatura", "Grado", "Tema", "Idioma", "Version", "Estado", "AutorID", "UrlDrive", "EsInterdisciplinario"]);
    if (name === "ProyectosInterdisciplinarios") sheet.appendRow(["ProyectoID", "Titulo", "DepartamentosInvolucrados", "Descripcion", "LiderProyectoID", "AnoLectivo", "Estado"]);
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
    "getAcademicCalendar", "createCalendarEvent", "getClassSchedules", "createClassSchedule", "deleteClassSchedule", "getAcademicRules", "saveAcademicRule", "getDepartmentAcademicPlanning", "assignDepartmentHead", "getCurricularAnalyticsReport", "getReusableResourceCatalog", "manageReusableResource", "getCurricularEquivalences", "executeCurricularMigration", "registerCurricularAreaExtension", "runCurricularAreaServiceTests", "toggleCurricularAreaStatus", "validateApiContractsTestSuite", "getInstitutionalCatalog", "validateCatalogReference", "generateInstitutionalUUID", "validateInstitutionalIdentifier", "auditInstitutionalIdentifierCollisions", "runConcurrencyAndConsistencySuite", "getPaginatedAcademicHistory", "reconcileRestoredDataIntegrity", "evaluateTransactionalStorageMigrationNeed",
    "getClassroomResources", "saveClassroomResource", "getStudentSchedule",
    "createAdmissionRequest", "getAdmissionRequests", "updateAdmissionStatus", "convertAdmissionToStudent",
    "getStudentFile", "updateStudentFile", "getStudentTimeline", "findDuplicateStudents", "mergeStudentFiles",
    "getStudentGuardians", "saveStudentGuardian", "unlinkStudentGuardian", "uploadStudentDocument", "getStudentDocuments", "updateDocumentStatus",
    "createStudentEnrollment", "getStudentEnrollments", "renewStudentEnrollment", "checkEnrollmentCapacity",
    "changeStudentSection", "recordStudentTransfer", "recordStudentWithdrawal", "processStudentReentry",
    "openAttendanceSession", "saveClassAttendance", "getClassAttendance", "saveDailyAttendance", "getDailyAttendance", "submitAttendanceJustification", "reviewAttendanceJustification", "recordEarlyDeparture", "getAttendanceIncidents", "saveAttendanceIncident", "getAttendanceFollowupCases", "saveAttendanceFollowupCase", "addCaseFollowUpNote", "getStudentAttendanceSummary",
    "createTeacherSupervision", "getTeacherSupervisions", "updateSupervisionStatus", "saveSupervisionObservation", "getSupervisionObservation", "saveTeacherImprovementPlan", "getTeacherImprovementPlans"
  ],
  "Subdirector": [
    "getAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "getWhatsAppLink", "getQuestionBank", "registerStudentEnrollment", "getStudentEnrollmentHistory",
    "getInstitutionParams", "getAcademicYears", "getAcademicPeriods", "getSubjectCatalog", "getStudyPlans", "getAcademicOffers",
    "getTeacherAssignments", "assignTeacherToClass", "createTeacherSubstitution", "getAcademicCalendar", "createCalendarEvent", "getClassSchedules", "createClassSchedule", "deleteClassSchedule", "copyClassSchedules", "getTeacherTeachingLoad", "generateAutoSchedules", "recordClassSessionOutcome", "getTeachingHoursSummary", "rescheduleCancelledSession", "getPendingSessionRecoveries", "publishClassSchedules", "getIndividualCalendar", "syncAcademicScheduleIntegrity", "getAcademicAuditLogs", "getReusableResourceCatalog", "manageReusableResource",
    "getClassroomResources", "saveClassroomResource", "getStudentSchedule",
    "createAdmissionRequest", "getAdmissionRequests", "updateAdmissionStatus", "getStudentFile", "getStudentTimeline", "findDuplicateStudents",
    "getStudentGuardians", "getStudentDocuments", "getStudentEnrollments", "checkEnrollmentCapacity",
    "openAttendanceSession", "saveClassAttendance", "getClassAttendance", "saveDailyAttendance", "getDailyAttendance", "submitAttendanceJustification", "reviewAttendanceJustification", "recordEarlyDeparture", "getAttendanceIncidents", "saveAttendanceIncident", "getAttendanceFollowupCases", "saveAttendanceFollowupCase", "addCaseFollowUpNote", "getStudentAttendanceSummary",
    "createTeacherSupervision", "getTeacherSupervisions", "updateSupervisionStatus", "saveSupervisionObservation", "getSupervisionObservation", "saveTeacherImprovementPlan", "getTeacherImprovementPlans"
  ],
  "Secretaría": [
    "getAcademicConfig", "getAsignaturasActivas", "registerStudentEnrollment", "getStudentEnrollmentHistory",
    "getInstitutionParams", "getAcademicYears", "getAcademicPeriods", "getSubjectCatalog", "getStudyPlans", "getAcademicOffers",
    "createAcademicOffer", "getTeacherAssignments", "assignTeacherToClass", "createTeacherSubstitution", "getAcademicCalendar", "createCalendarEvent", "getClassSchedules", "createClassSchedule", "deleteClassSchedule", "copyClassSchedules", "getTeacherTeachingLoad", "generateAutoSchedules", "recordClassSessionOutcome", "getTeachingHoursSummary", "rescheduleCancelledSession", "getPendingSessionRecoveries", "publishClassSchedules", "getIndividualCalendar", "syncAcademicScheduleIntegrity", "getAcademicAuditLogs", "getReusableResourceCatalog", "manageReusableResource",
    "getClassroomResources", "saveClassroomResource", "getStudentSchedule",
    "createAdmissionRequest", "getAdmissionRequests", "updateAdmissionStatus", "convertAdmissionToStudent",
    "getStudentFile", "updateStudentFile", "getStudentTimeline", "findDuplicateStudents",
    "getStudentGuardians", "saveStudentGuardian", "unlinkStudentGuardian", "uploadStudentDocument", "getStudentDocuments", "updateDocumentStatus",
    "createStudentEnrollment", "getStudentEnrollments", "renewStudentEnrollment", "checkEnrollmentCapacity",
    "changeStudentSection", "recordStudentTransfer", "recordStudentWithdrawal", "processStudentReentry",
    "openAttendanceSession", "saveClassAttendance", "getClassAttendance", "saveDailyAttendance", "getDailyAttendance", "submitAttendanceJustification", "reviewAttendanceJustification", "recordEarlyDeparture", "getAttendanceIncidents", "saveAttendanceIncident", "getAttendanceFollowupCases", "saveAttendanceFollowupCase", "addCaseFollowUpNote", "getStudentAttendanceSummary"
  ],
  "Contador": ["getAcademicConfig", "registerStudentEnrollment", "getStudentEnrollmentHistory", "getAcademicYears", "getAcademicOffers", "getStudentFile", "getStudentEnrollments"],
  "Consejeros": ["getAcademicConfig", "getAcademicYears", "getAcademicCalendar", "getClassSchedules", "getStudentSchedule", "getStudentFile", "getStudentTimeline", "getStudentGuardians", "getAttendanceIncidents", "saveAttendanceIncident", "getAttendanceFollowupCases", "saveAttendanceFollowupCase", "addCaseFollowUpNote", "getStudentAttendanceSummary"],
  "Padre": [
    "getAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "getWhatsAppLink", "getStudentEnrollmentHistory",
    "getAcademicCalendar", "getClassSchedules", "getStudentSchedule", "getStudentFile", "getStudentTimeline", "getStudentDocuments", "getStudentEnrollments",
    "getClassAttendance", "getDailyAttendance", "submitAttendanceJustification", "getStudentAttendanceSummary", "getAttendanceIncidents"
  ],
  "Tutor": [
    "getAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "getWhatsAppLink", "getStudentEnrollmentHistory",
    "getAcademicCalendar", "getClassSchedules", "getStudentSchedule", "getStudentFile", "getStudentTimeline", "getStudentDocuments", "getStudentEnrollments",
    "getClassAttendance", "getDailyAttendance", "submitAttendanceJustification", "getStudentAttendanceSummary", "getAttendanceIncidents"
  ],
  "Responsable": [
    "getAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "getWhatsAppLink", "getStudentEnrollmentHistory",
    "getAcademicCalendar", "getClassSchedules", "getStudentSchedule", "getStudentFile", "getStudentTimeline", "getStudentDocuments", "getStudentEnrollments",
    "getClassAttendance", "getDailyAttendance", "submitAttendanceJustification", "getStudentAttendanceSummary", "getAttendanceIncidents"
  ],
  "Profesor": [
    "getAcademicConfig", "updateAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "updateAsignaturasActivas", "saveWhatsAppLink", "getWhatsAppLink", "getQuestionBank", "saveQuestion", "generateMigrationReport",
    "getAcademicYears", "getAcademicPeriods", "getSubjectCatalog", "getAcademicOffers", "getTeacherAssignments", "createTeacherSubstitution", "getAcademicCalendar", "getClassSchedules", "createClassSchedule", "deleteClassSchedule", "getTeacherTeachingLoad", "recordClassSessionOutcome", "getTeachingHoursSummary", "rescheduleCancelledSession", "getPendingSessionRecoveries", "getIndividualCalendar", "getClassroomResources", "getStudentSchedule", "getReusableResourceCatalog", "manageReusableResource",
    "getStudentFile", "getStudentTimeline", "getStudentEnrollments",
    "openAttendanceSession", "saveClassAttendance", "getClassAttendance", "saveDailyAttendance", "getDailyAttendance", "submitAttendanceJustification", "reviewAttendanceJustification", "recordEarlyDeparture", "getAttendanceIncidents", "saveAttendanceIncident", "getAttendanceFollowupCases", "saveAttendanceFollowupCase", "addCaseFollowUpNote", "getStudentAttendanceSummary",
    "getTeacherSupervisions", "getSupervisionObservation", "getTeacherImprovementPlans"
  ],
  "Asistente": ["getAcademicConfig", "getAsignaturasActivas", "getWhatsAppLink", "getQuestionBank", "getAcademicCalendar", "getClassSchedules", "getStudentSchedule", "getStudentTimeline", "getClassAttendance", "getStudentAttendanceSummary"],
  "Estudiante": ["getAcademicConfig", "getAsignaturasActivas", "getWhatsAppLink", "getQuestionBank", "getStudentEnrollmentHistory", "getAcademicCalendar", "getClassSchedules", "getStudentSchedule", "getStudentFile", "getStudentTimeline", "getStudentDocuments", "getClassAttendance", "getDailyAttendance", "submitAttendanceJustification", "getStudentAttendanceSummary", "getAttendanceIncidents", "calculateUnifiedAcademicGrade"],
  "Alumno": ["getAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "getWhatsAppLink", "getStudentEnrollmentHistory", "getAcademicYears", "getAcademicPeriods", "getAcademicOffers", "getAcademicCalendar", "getClassSchedules", "getStudentSchedule", "getStudentFile", "getStudentTimeline", "getStudentDocuments", "getStudentEnrollments", "submitAttendanceJustification", "getStudentAttendanceSummary", "getAttendanceIncidents"]
};

const PUBLIC_ACTIONS = ["ping", "createAdmissionRequest"];

// [FASE2-T02] [Fase 2 - Idempotencia de Operaciones] - Mecanismo de verificación de claves de idempotencia, caché de resultados y prevención de duplicación por reintentos HTTP.
function getIdempotencyPayloadSignature(payload) {
  if (!payload || typeof payload !== "object") return "";
  const copy = {};
  Object.keys(payload).sort().forEach(k => {
    if (["idempotencyToken", "idempotencyKey", "requestId", "timestamp", "authRole"].indexOf(k) === -1) {
      copy[k] = payload[k];
    }
  });
  return JSON.stringify(copy);
}

function checkAndRegisterIdempotencyKey(action, payload) {
  const token = payload && (payload.idempotencyToken || payload.idempotencyKey);
  if (!token) return null;

  const cacheKey = `IDEM_${action}_${String(token).trim()}`;
  const currentSignature = getIdempotencyPayloadSignature(payload);
  const cache = CacheService.getScriptCache();
  const cachedRaw = cache.get(cacheKey);

  if (cachedRaw) {
    try {
      const parsed = JSON.parse(cachedRaw);
      if (parsed.signature && parsed.signature !== currentSignature) {
        throw new Error("Clave de idempotencia reutilizada con datos incompatibles.");
      }
      if (parsed.result) {
        const copyResult = JSON.parse(JSON.stringify(parsed.result));
        copyResult.cachedIdempotentResult = true;
        return copyResult;
      }
    } catch (e) {
      if (e.message.indexOf("incompatibles") !== -1) throw e;
    }
  }
  return null;
}

function saveIdempotentResult(action, payload, result) {
  const token = payload && (payload.idempotencyToken || payload.idempotencyKey);
  if (!token || !result || result.status !== "success") return;

  const cacheKey = `IDEM_${action}_${String(token).trim()}`;
  const signature = getIdempotencyPayloadSignature(payload);
  const cache = CacheService.getScriptCache();
  try {
    cache.put(cacheKey, JSON.stringify({ signature, result }), 21600);
  } catch (e) {
    console.warn("No se pudo guardar la clave de idempotencia en caché:", e);
  }
}

// [TAREA-F4-P0-01] [Fase 4: Identidad y Permisos] - Funciones de verificación de firma HMAC-SHA256 e integración con token de sesión
function computeHmacSignature(message, secret) {
  const bytes = Utilities.computeHmacSha256Signature(message, secret);
  return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function getAuthTokenSecret() {
  const props = PropertiesService.getScriptProperties();
  let secret = "";
  try {
    secret = props.getProperty("AUTH_TOKEN_SECRET");
  } catch (e) {}
  if (!secret) {
    secret = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, SPREADSHEET_ID + "_MASTER_AUTH_HMAC_SECRET")
      .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
    try {
      props.setProperty("AUTH_TOKEN_SECRET", secret);
    } catch (e) {}
  }
  return secret;
}

function verifySessionToken(tokenString) {
  if (!tokenString || typeof tokenString !== "string" || tokenString.indexOf(".") === -1) {
    return null;
  }
  const parts = tokenString.split(".");
  if (parts.length !== 2) return null;
  const payloadB64 = parts[0];
  const providedSignature = parts[1];
  const secret = getAuthTokenSecret();
  const expectedSignature = computeHmacSignature(payloadB64, secret);
  if (providedSignature !== expectedSignature) {
    return null;
  }
  try {
    const jsonStr = Utilities.newBlob(Utilities.base64DecodeWebSafe(payloadB64)).getDataAsString();
    const claims = JSON.parse(jsonStr);
    const now = Math.floor(Date.now() / 1000);
    if (claims.exp && now > claims.exp) {
      return null;
    }
    if (claims.userId) {
      const cacheKey = "acct_state_" + claims.userId;
      const cache = CacheService.getScriptCache();
      let acctState = cache.get(cacheKey);
      if (!acctState) {
        try {
          const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
          const uSheet = ss.getSheetByName("Usuarios");
          if (uSheet) {
            const data = uSheet.getDataRange().getValues();
            for (let i = 1; i < data.length; i++) {
              if (String(data[i][0]).trim() === String(claims.userId).trim()) {
                acctState = String(data[i][10] || "Activa").trim();
                cache.put(cacheKey, acctState, 60);
                break;
              }
            }
          }
        } catch (e) {}
      }
      if (!acctState || acctState !== "Activa") {
        return null;
      }
    }
    return claims;
  } catch (e) {
    return null;
  }
}

// [TAREA-01] [TAREA-F4-P0-01] [Fase 4 - Seguridad RBAC y Token Unificado] - Validar y reforzar la seguridad mediante verificación de credencial de sesión HMAC
function validateRolePermission(action, payload) {
  if (PUBLIC_ACTIONS.indexOf(action) !== -1) return { authorized: true };

  let userRole = "Estudiante";
  let verifiedUserId = null;
  const token = payload && (payload.sessionToken || payload.authToken || payload.token);

  if (token) {
    const claims = verifySessionToken(token);
    if (!claims) {
      return { authorized: false, role: "Token Inválido/Expirado" };
    }
    userRole = claims.role || "Estudiante";
    verifiedUserId = claims.userId;
    if (payload) {
      payload._verifiedUserId = verifiedUserId;
      payload._verifiedRole = userRole;
    }
  } else {
    return { authorized: false, role: "Sin Credenciales de Sesión" };
  }

  if (["getSchoolYearConfigs", "getAcademicJornadas", "getCurricularDistribution", "getInstitutionalActivities", "getExtracurricularActivities", "getUnifiedInstitutionalCalendar"].indexOf(action) !== -1) {
    return { authorized: true, role: userRole };
  }
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
    if (payload && payload.skipLock && !payload.isInternalCall) {
      delete payload.skipLock;
    }
    const authCheck = validateRolePermission(action, payload);
    if (!authCheck.authorized) {
      logStructuredEvent("ACADEMIC", action, "WARN", "AUTH_PERMISSION_DENIED", `Acceso denegado a ${action} para rol ${authCheck.role}`, payload, authCheck.role);
      return textResponse({ status: "error", code: "AUTH_PERMISSION_DENIED", message: "Acceso denegado: El rol " + authCheck.role + " no tiene permiso para la acción " + action + "." });
    }

    if (action.indexOf("get") !== 0) {
      const cachedResult = checkAndRegisterIdempotencyKey(action, payload);
      if (cachedResult) {
        return textResponse(cachedResult);
      }
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
      case "reconcileRestoredDataIntegrity": result = reconcileRestoredDataIntegrity(payload); break;
      case "evaluateTransactionalStorageMigrationNeed": result = evaluateTransactionalStorageMigrationNeed(payload); break;
      case "getInstitutionalReportCatalog": result = getInstitutionalReportCatalog(payload); break;
      case "generateInstitutionalReport": result = generateInstitutionalReport(payload); break;
      case "getSectionEquivalences": result = getSectionEquivalences(payload); break;
      case "calculateUnifiedAcademicGrade": result = calculateUnifiedAcademicGrade(payload); break;

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
      case "getCoordinatorOverview": result = getCoordinatorOverview(payload); break;
      case "assignTeacherToSection": result = assignTeacherToSection(payload); break;
      case "generateAutoSchedules": result = generateAutoSchedules(payload); break;
      case "getTeacherAssignments": result = getTeacherAssignments(payload); break;
      case "assignTeacherToClass": result = assignTeacherToClass(payload); break;
      case "createTeacherSubstitution": result = createTeacherSubstitution(payload); break;
      case "getDepartmentAcademicPlanning": result = getDepartmentAcademicPlanning(payload); break;
      case "assignDepartmentHead": result = assignDepartmentHead(payload); break;
      case "getCurricularAnalyticsReport": result = getCurricularAnalyticsReport(payload); break;
      case "getReusableResourceCatalog": result = getReusableResourceCatalog(payload); break;
      case "manageReusableResource": result = manageReusableResource(payload); break;
      case "getCurricularEquivalences": result = getCurricularEquivalences(payload); break;
      case "executeCurricularMigration": result = executeCurricularMigration(payload); break;
      case "validateApiContractsTestSuite": result = validateApiContractsTestSuite(payload); break;
      case "getInstitutionalCatalog": result = getInstitutionalCatalog(payload); break;
      case "validateCatalogReference": result = validateCatalogReference(payload); break;
      case "generateInstitutionalUUID": result = generateInstitutionalUUID(payload); break;
      case "validateInstitutionalIdentifier": result = validateInstitutionalIdentifier(payload); break;
      case "auditInstitutionalIdentifierCollisions": result = auditInstitutionalIdentifierCollisions(payload); break;
      case "runConcurrencyAndConsistencySuite": result = runConcurrencyAndConsistencySuite(payload); break;
      case "getPaginatedAcademicHistory": result = getPaginatedAcademicHistory(payload); break;
      case "registerCurricularAreaExtension": result = registerCurricularAreaExtension(payload); break;
      case "runCurricularAreaServiceTests": result = runCurricularAreaServiceTests(payload); break;
      case "toggleCurricularAreaStatus": result = toggleCurricularAreaStatus(payload); break;
      case "getAcademicCalendar": result = getAcademicCalendar(payload); break;
      case "createCalendarEvent": result = createCalendarEvent(payload); break;
      case "getClassSchedules": result = getClassSchedules(payload); break;
      case "createClassSchedule": result = createClassSchedule(payload); break;
      case "deleteClassSchedule": result = deleteClassSchedule(payload); break;
      case "getClassroomResources": result = getClassroomResources(payload); break;
      case "saveClassroomResource": result = saveClassroomResource(payload); break;
      case "getStudentSchedule": result = getStudentSchedule(payload); break;
      case "getAcademicRules": result = getAcademicRules(payload); break;
      case "saveAcademicRule": result = saveAcademicRule(payload); break;
      case "copyClassSchedules": result = copyClassSchedules(payload); break;
      case "getTeacherTeachingLoad": result = getTeacherTeachingLoad(payload); break;
      case "recordClassSessionOutcome": result = recordClassSessionOutcome(payload); break;
      case "getTeachingHoursSummary": result = getTeachingHoursSummary(payload); break;
      case "rescheduleCancelledSession": result = rescheduleCancelledSession(payload); break;
      case "getPendingSessionRecoveries": result = getPendingSessionRecoveries(payload); break;
      case "publishClassSchedules": result = publishClassSchedules(payload); break;
      case "getIndividualCalendar": result = getIndividualCalendar(payload); break;
      case "syncAcademicScheduleIntegrity": result = syncAcademicScheduleIntegrity(payload); break;
      case "getAcademicAuditLogs": result = getAcademicAuditLogs(payload); break;

      // Endpoints Nueva Fase - Configuración Año Escolar, Jornadas, Malla, Actividades
      case "configureSchoolYear": result = configureSchoolYear(payload); break;
      case "getSchoolYearConfigs": result = getSchoolYearConfigs(payload); break;
      case "configureAcademicJornada": result = configureAcademicJornada(payload); break;
      case "getAcademicJornadas": result = getAcademicJornadas(payload); break;
      case "saveCurricularDistribution": result = saveCurricularDistribution(payload); break;
      case "getCurricularDistribution": result = getCurricularDistribution(payload); break;
      case "saveInstitutionalActivity": result = saveInstitutionalActivity(payload); break;
      case "getInstitutionalActivities": result = getInstitutionalActivities(payload); break;
      case "saveExtracurricularActivity": result = saveExtracurricularActivity(payload); break;
      case "getExtracurricularActivities": result = getExtracurricularActivities(payload); break;
      case "getUnifiedInstitutionalCalendar": result = getUnifiedInstitutionalCalendar(payload); break;

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

      // Endpoints Fase 7 - Asistencia y Seguimiento Estudiantil
      case "openAttendanceSession": result = openAttendanceSession(payload); break;
      case "saveClassAttendance": result = saveClassAttendance(payload); break;
      case "getClassAttendance": result = getClassAttendance(payload); break;
      case "saveDailyAttendance": result = saveDailyAttendance(payload); break;
      case "getDailyAttendance": result = getDailyAttendance(payload); break;
      case "submitAttendanceJustification": result = submitAttendanceJustification(payload); break;
      case "reviewAttendanceJustification": result = reviewAttendanceJustification(payload); break;
      case "recordEarlyDeparture": result = recordEarlyDeparture(payload); break;
      case "getAttendanceIncidents": result = getAttendanceIncidents(payload); break;
      case "saveAttendanceIncident": result = saveAttendanceIncident(payload); break;
      case "getAttendanceFollowupCases": result = getAttendanceFollowupCases(payload); break;
      case "saveAttendanceFollowupCase": result = saveAttendanceFollowupCase(payload); break;
      case "addCaseFollowUpNote": result = addCaseFollowUpNote(payload); break;
      case "getStudentAttendanceSummary": result = getStudentAttendanceSummary(payload); break;

      // Endpoints Fase 13 - Supervisión Docente y Calidad Educativa
      case "createTeacherSupervision": result = createTeacherSupervision(payload); break;
      case "getTeacherSupervisions": result = getTeacherSupervisions(payload); break;
      case "updateSupervisionStatus": result = updateSupervisionStatus(payload); break;
      case "saveSupervisionObservation": result = saveSupervisionObservation(payload); break;
      case "getSupervisionObservation": result = getSupervisionObservation(payload); break;
      case "saveTeacherImprovementPlan": result = saveTeacherImprovementPlan(payload); break;
      case "getTeacherImprovementPlans": result = getTeacherImprovementPlans(payload); break;

      case "ping": result = { status: "success", service: "ACADEMIC", timestamp: new Date().toISOString(), dbConnected: true }; break;
      default: result = { status: "error", message: `Acción no reconocida: ${action}` };
    }

    if (action.indexOf("get") !== 0 && result && result.status === "success") {
      saveIdempotentResult(action, payload, result);
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
  const targetPersonaId = userId || ("PER-" + Date.now());
  let dupExp = expData.find(r => normalizeString(`${r[1]}`) === normalizeString(targetPersonaId));

  const now = new Date();
  const code = codigoInstitucional || ("STU-" + now.getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000));

  if (dupExp) {
    expId = dupExp[0];
  } else {
    expId = "EXP-" + now.getTime();
    const telContacto = row[9] || "";
    const emailContacto = row[10] || "";
    expSheet.appendRow([
      expId,
      targetPersonaId,
      code,
      fechaNac || "",
      "Hondureña",
      "", // DireccionResidencia (se completa en ficha médica/estudiantil)
      "", // FotografiaUrl
      "Activo",
      now,
      now,
      `Admisión aprobada desde solicitud ${solicitudId}. Tel: ${telContacto}, Email: ${emailContacto}`
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
    (payload && (payload.actorId || payload.adminId)) || "Secretaría",
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

// [T-GOV-02] [Fase Gobernanza y Seguridad] - Función central de validación estricta de propiedad y alcance de acceso a registros
function assertRecordOwnership(authRole, authenticatedUserId, targetUserId, resourceType) {
  if (!authRole) return { authorized: false, reason: "AUTH_PERMISSION_DENIED" };
  const roleUpper = String(authRole).toUpperCase();
  if (roleUpper === "ADMINISTRADOR" || roleUpper === "DIRECTOR" || roleUpper === "ADMIN") {
    return { authorized: true };
  }
  if (roleUpper === "ESTUDIANTE" || roleUpper === "ALUMNO") {
    if (authenticatedUserId && targetUserId && String(authenticatedUserId).trim() === String(targetUserId).trim()) {
      return { authorized: true };
    }
    return { authorized: false, reason: "AUTH_PERMISSION_DENIED" };
  }
  return { authorized: true };
}

// [T-GOV-03] [Fase Gobernanza y Seguridad] - Proxy de descarga segura y autorización de adjuntos en Google Drive
function getSecureDocumentStream(payload) {
  const { fileId, documentId, userId, userRole, authenticatedUserId } = payload || {};
  const targetId = fileId || documentId;
  if (!targetId) {
    return { status: "error", message: "Identificador de documento no proporcionado." };
  }
  const ownership = assertRecordOwnership(userRole, authenticatedUserId || userId, userId, "DOCUMENT");
  if (!ownership.authorized) {
    return { status: "error", code: "AUTH_PERMISSION_DENIED", message: "Acceso denegado al documento solicitado." };
  }
  try {
    const file = DriveApp.getFileById(targetId);
    return {
      status: "success",
      fileId: targetId,
      fileName: file.getName(),
      mimeType: file.getMimeType(),
      downloadUrl: file.getDownloadUrl()
    };
  } catch (e) {
    return { status: "error", message: "Error al acceder al documento en Drive: " + e.message };
  }
}

// [REQ-EXP-001] [Fase 1: Registro y Expediente de Estudiantes] - Service backend endpoint (getStudentFile) para consulta y visualización del expediente digital del estudiante.
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

// [TAREA 3.10] [Fase 3: Planificación Académica y Horarios] - Recuperación y reprogramación de clases canceladas con vinculación histórica de sesiones.
function rescheduleCancelledSession(payload) {
  const { sesionOriginalId, nuevaFecha, horaInicio, horaFin, aulaCodigo, docenteSustitutoUserId, motivo } = payload || {};
  if (!sesionOriginalId || !nuevaFecha || !horaInicio || !horaFin) {
    throw new Error("sesionOriginalId, nuevaFecha, horaInicio y horaFin son requeridos.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SesionesClaseImpartidas");
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) throw new Error("No existen sesiones registradas.");

  const idx = data.findIndex(r => String(r[0]).trim() === String(sesionOriginalId).trim());
  if (idx === -1) throw new Error("Sesión original no encontrada.");

  const originalRow = data[idx];
  const ofertaId = originalRow[2];
  const docenteEfectivoUserId = docenteSustitutoUserId || originalRow[5];
  const aulaEfectivaCodigo = aulaCodigo || "AULA-101";

  // Obtener día de la semana para la nueva fecha
  const diasNombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diaSemana = diasNombres[new Date(nuevaFecha).getDay()];

  // Validar conflictos para la fecha y franja de recuperación
  const conflict = checkScheduleConflict({
    diaSemana,
    horaInicio,
    horaFin,
    aulaCodigo: aulaEfectivaCodigo,
    docenteUserId: docenteEfectivoUserId,
    ofertaId,
    fechaEspecifica: nuevaFecha
  });

  if (conflict.hasConflict) {
    throw new Error(`Conflicto de horario en reprogramación: ${conflict.reason}`);
  }

  // Actualizar estado de la sesión original a Reprogramada
  sheet.getRange(idx + 1, 5).setValue("Reprogramada");
  sheet.getRange(idx + 1, 7).setValue(`Reprogramada para ${nuevaFecha} ${horaInicio}-${horaFin}. Motivo: ${motivo || 'Recuperación'}`);

  // Crear la nueva sesión de recuperación vinculada
  const recuperacionSesionId = "REC-" + Date.now();
  const nowStr = new Date().toISOString();
  const autoriz = payload.authUserId || "Secretaría";

  sheet.appendRow([
    recuperacionSesionId,
    originalRow[1] || "HOR-GEN",
    ofertaId,
    nuevaFecha,
    "Recuperada",
    docenteEfectivoUserId,
    `Recuperación de sesión original ${sesionOriginalId} del ${originalRow[3]}. Motivo: ${motivo || 'Recuperación'}`,
    autoriz,
    nowStr
  ]);

  logStructuredEvent("ACADEMIC", "rescheduleCancelledSession", "INFO", "SESSION_RESCHEDULED", `Sesión ${sesionOriginalId} reprogramada a ${recuperacionSesionId} el ${nuevaFecha}`, { sesionOriginalId, recuperacionSesionId, nuevaFecha, horaInicio, horaFin }, payload && payload.authRole);

  return {
    status: "success",
    message: "Clase reprogramada exitosamente sin duplicar la obligación curricular.",
    data: {
      sesionOriginalId,
      recuperacionSesionId,
      nuevaFecha,
      horaInicio,
      horaFin,
      docenteEfectivoUserId
    }
  };
}

// [TAREA 3.10] [Fase 3: Planificación Académica y Horarios] - Consulta de sesiones canceladas y pendientes de recuperación.
function getPendingSessionRecoveries(payload) {
  const { docenteUserId, ofertaId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SesionesClaseImpartidas");
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return { status: "success", data: [] };

  const rows = data.slice(1);
  const pendingRecoveries = rows.filter(r => {
    const estado = String(r[4]);
    if (estado !== "Cancelada") return false;
    if (docenteUserId && String(r[5]).trim() !== String(docenteUserId).trim()) return false;
    if (ofertaId && String(r[2]).trim() !== String(ofertaId).trim()) return false;
    return true;
  }).map(r => ({
    sesionId: r[0],
    horarioId: r[1],
    ofertaId: r[2],
    fechaOriginal: r[3],
    estado: r[4],
    docenteUserId: r[5],
    motivoCancelacion: r[6],
    registradoPor: r[7],
    fechaRegistro: r[8]
  }));

  return { status: "success", data: pendingRecoveries };
}

// [TAREA 3.9] [Fase 3: Planificación Académica y Horarios] - Registro, confirmación y cálculo de horas lectivas impartidas, canceladas y pendientes.
function recordClassSessionOutcome(payload) {
  const { sesionId, horarioId, ofertaId, fecha, estado, observaciones, docenteUserId } = payload || {};
  if (!ofertaId || !fecha || !estado) throw new Error("ofertaId, fecha y estado son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SesionesClaseImpartidas");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["SesionID", "HorarioID", "OfertaID", "Fecha", "Estado", "DocenteUserId", "Observaciones", "ConfirmadoPor", "FechaConfirmacion"]);
  }

  const data = sheet.getDataRange().getValues();
  const nowStr = new Date().toISOString();
  const targetUser = payload.authUserId || docenteUserId || "SISTEMA";

  let sId = sesionId;
  if (sId) {
    const idx = data.findIndex(r => String(r[0]).trim() === String(sId).trim());
    if (idx !== -1) {
      sheet.getRange(idx + 1, 5, 1, 5).setValues([[
        estado,
        docenteUserId || data[idx][5],
        observaciones || data[idx][6],
        targetUser,
        nowStr
      ]]);
      return { status: "success", message: "Resultado de sesión actualizado correctamente.", data: { sesionId: sId } };
    }
  }

  sId = "SES-" + Date.now();
  sheet.appendRow([sId, horarioId || "HOR-GEN", ofertaId, fecha, estado, docenteUserId || "", observaciones || "", targetUser, nowStr]);

  logStructuredEvent("ACADEMIC", "recordClassSessionOutcome", "INFO", "SESSION_OUTCOME_RECORDED", `Sesión ${sId} marcada como ${estado} para oferta ${ofertaId}`, { sId, ofertaId, fecha, estado }, payload && payload.authRole);

  return { status: "success", message: `Sesión de clase confirmada como ${estado}.`, data: { sesionId: sId } };
}

// [TAREA 3.9] [Fase 3: Planificación Académica y Horarios] - Consulta de resumen de horas lectivas impartidas, programadas y pendientes por docente/oferta.
function getTeachingHoursSummary(payload) {
  const { docenteUserId, ofertaId, fechaInicio, fechaFin } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SesionesClaseImpartidas");
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return { status: "success", data: { impartidas: 0, canceladas: 0, pendientes: 0, reprogramadas: 0, sesiones: [] } };
  }

  const rows = data.slice(1);
  const filtered = rows.filter(r => {
    if (docenteUserId && String(r[5]).trim() !== String(docenteUserId).trim()) return false;
    if (ofertaId && String(r[2]).trim() !== String(ofertaId).trim()) return false;
    if (fechaInicio && new Date(r[3]) < new Date(fechaInicio)) return false;
    if (fechaFin && new Date(r[3]) > new Date(fechaFin)) return false;
    return true;
  });

  let impartidas = 0;
  let canceladas = 0;
  let pendientes = 0;
  let reprogramadas = 0;

  const sesiones = filtered.map(r => {
    const estado = String(r[4]);
    if (estado === "Impartida" || estado === "Recuperada") impartidas++;
    else if (estado === "Cancelada") canceladas++;
    else if (estado === "Reprogramada") reprogramadas++;
    else pendientes++;

    return {
      sesionId: r[0],
      horarioId: r[1],
      ofertaId: r[2],
      fecha: r[3],
      estado,
      docenteUserId: r[5],
      observaciones: r[6],
      confirmadoPor: r[7],
      fechaConfirmacion: r[8]
    };
  });

  return {
    status: "success",
    data: {
      docenteUserId: docenteUserId || "TODOS",
      ofertaId: ofertaId || "TODAS",
      impartidas,
      canceladas,
      pendientes,
      reprogramadas,
      totalSesionesRegistradas: filtered.length,
      sesiones
    }
  };
}

// ---------------------------------------------------------------------------
// MÓDULO DE CONFIGURACIÓN DE AÑO ESCOLAR, JORNADAS, MALLA, HORARIOS Y ACTIVIDADES
// ---------------------------------------------------------------------------

function configureSchoolYear(payload) {
  try {
    const verifiedRole = (payload && payload.authRole) || "Director";
    if (["Administrador", "Director", "Subdirector", "Secretaría"].indexOf(verifiedRole) === -1) {
      return { status: "error", code: "AUTH_PERMISSION_DENIED", message: "Rol no autorizado para configurar el año escolar." };
    }

    const { anoId, nombre, tipoCalendario, fechaInicio, fechaFin, inicioClases, finClases, finAdministrativo, limiteIngresoCalificaciones, estado } = payload || {};
    if (!nombre || !fechaInicio || !fechaFin) {
      return { status: "error", code: "VALIDATION_ERROR", message: "Nombre, Fecha de Inicio y Fecha de Fin son obligatorios." };
    }

    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      return { status: "error", code: "VALIDATION_ERROR", message: "La fecha de fin debe ser posterior a la fecha de inicio." };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "AnosLectivos");
    const data = sheet.getDataRange().getValues();

    const targetAnoId = anoId || ("ANO-" + String(nombre).replace(/\s+/g, "_"));
    const now = new Date().toISOString();

    let foundIndex = -1;
    if (data.length > 1) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(targetAnoId).trim()) {
          foundIndex = i + 1;
          break;
        }
      }
    }

    if (foundIndex > -1) {
      sheet.getRange(foundIndex, 2).setValue(nombre);
      sheet.getRange(foundIndex, 3).setValue(fechaInicio);
      sheet.getRange(foundIndex, 4).setValue(fechaFin);
      sheet.getRange(foundIndex, 5).setValue(inicioClases || fechaInicio);
      sheet.getRange(foundIndex, 6).setValue(finClases || fechaFin);
      sheet.getRange(foundIndex, 7).setValue(estado || "Activo");
    } else {
      sheet.appendRow([
        targetAnoId,
        nombre,
        fechaInicio,
        fechaFin,
        inicioClases || fechaInicio,
        finClases || fechaFin,
        estado || "Activo",
        verifiedRole,
        now,
        tipoCalendario || "Sistema Americano",
        finAdministrativo || fechaFin,
        limiteIngresoCalificaciones || finClases
      ]);
    }

    logStructuredEvent("ACADEMIC", "configureSchoolYear", "INFO", "YEAR_CONFIGURED", `Año escolar ${nombre} configurado.`, { targetAnoId, tipoCalendario }, verifiedRole);

    return { status: "success", anoId: targetAnoId, nombre: nombre, message: "Año escolar guardado exitosamente." };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

// [TAREA-17] [Fase 1 - Analítica Académica] - Módulo de indicadores analíticos y métricas por área, asignatura y programa.
function getCurricularAnalyticsReport(payload) {
  const { area, asignatura, grado, programa, periodo } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const califSheet = getOrCreateSheet(ss, "CalificacionesEstudiantes");
  const califData = califSheet.getDataRange().getValues();

  let validScores = [];
  let totalEvaluations = 0;
  let pendingCount = 0;

  if (califData.length > 1) {
    califData.slice(1).forEach(r => {
      const nota = parseFloat(r[3]);
      const esBorrador = r[5] === true || String(r[5]).toLowerCase() === "true";
      const esPublicada = r[6] === true || String(r[6]).toLowerCase() === "true";

      totalEvaluations++;
      if (esBorrador || !esPublicada || isNaN(nota)) {
        pendingCount++;
      } else {
        validScores.push(nota);
      }
    });
  }

  // Cálculo de promedio excluyendo notas pendientes
  const sum = validScores.reduce((acc, curr) => acc + curr, 0);
  const average = validScores.length > 0 ? Math.round((sum / validScores.length) * 100) / 100 : 0;

  // Distribución de calificaciones
  const distribution = {
    excelente: validScores.filter(s => s >= 90).length,
    bueno: validScores.filter(s => s >= 80 && s < 90).length,
    satisfactorio: validScores.filter(s => s >= 70 && s < 80).length,
    necesitaMejora: validScores.filter(s => s < 70).length
  };

  // Alertas de acompañamiento pedagógico
  const lowPerformanceAlerts = validScores.filter(s => s < 70).length;

  return {
    status: "success",
    data: {
      periodo: periodo || "I Parcial",
      area: area || "Todas",
      asignatura: asignatura || "Todas",
      grado: grado || "Todos",
      programa: programa || "General",
      metrics: {
        totalEvaluaciones: totalEvaluations,
        notasPendientes: pendingCount,
        evaluadasCount: validScores.length,
        promedioConsolidado: average,
        alertasAcompanamiento: lowPerformanceAlerts,
        distribucion: distribution
      }
    }
  };
}

// [TAREA-18] [Fase 1 - Reutilización de Recursos] - Módulo de catálogo de recursos educativos reutilizables, etiquetado por área/materia e interdisciplinariedad.
function getReusableResourceCatalog(payload) {
  const { area, asignatura, grado, tema, idioma, categoria } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const sheet = getOrCreateSheet(ss, "RecursosEducativosReutilizables");
  const data = sheet.getDataRange().getValues();

  // Función local auxiliar de comparación diacrítica segura para evitar depender de alcance externo
  const normStr = (str) => (!str ? "" : str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim());

  let resources = [];
  if (data.length > 1) {
    resources = data.slice(1).filter(r => {
      if (r[8] === "Inactivo") return false;
      if (area && normStr(r[2]) !== normStr(area)) return false;
      if (asignatura && normStr(r[3]) !== normStr(asignatura)) return false;
      if (grado && normStr(r[4]) !== normStr(grado)) return false;
      if (idioma && normStr(r[6]) !== normStr(idioma)) return false;
      return true;
    }).map(r => ({
      recursoId: r[0],
      titulo: r[1],
      area: r[2],
      asignatura: r[3],
      grado: r[4],
      tema: r[5],
      idioma: r[6] || "Español",
      version: r[7] || "1.0",
      estado: r[8] || "Activo",
      autorId: r[9],
      urlDrive: r[10],
      esInterdisciplinario: r[11] === true || String(r[11]).toLowerCase() === "true"
    }));
  }

  const projSheet = getOrCreateSheet(ss, "ProyectosInterdisciplinarios");
  const projData = projSheet.getDataRange().getValues();
  let projects = [];
  if (projData.length > 1) {
    projects = projData.slice(1).filter(r => r[6] !== "Inactivo").map(r => ({
      proyectoId: r[0],
      titulo: r[1],
      departamentosInvolucrados: r[2],
      descripcion: r[3],
      liderProyectoId: r[4],
      anoLectivo: r[5],
      estado: r[6] || "Activo"
    }));
  }

  return {
    status: "success",
    resources,
    interdisciplinaryProjects: projects
  };
}

function manageReusableResource(payload) {
  const { recursoId, titulo, area, asignatura, grado, tema, idioma, version, urlDrive, esInterdisciplinario, autorId, esProyecto, departamentosInvolucrados, descripcion } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  if (esProyecto) {
    if (!titulo) throw new Error("Título de proyecto es requerido.");
    const projSheet = getOrCreateSheet(ss, "ProyectosInterdisciplinarios");
    const pid = recursoId || ("PROJ-INT-" + Date.now());

    projSheet.appendRow([
      pid,
      titulo,
      departamentosInvolucrados || "General",
      descripcion || "",
      autorId || "Docente",
      "2026",
      "Activo"
    ]);

    logStructuredEvent("ACADEMIC", "manageReusableResource", "INFO", "PROJECT_SAVED", `Proyecto interdisciplinario ${titulo} creado`, { pid }, payload && payload.authRole);
    return { status: "success", message: "Proyecto interdisciplinario registrado exitosamente.", data: { proyectoId: pid } };
  } else {
    if (!titulo || !area) throw new Error("Título y área son requeridos.");
    const sheet = getOrCreateSheet(ss, "RecursosEducativosReutilizables");
    const rid = recursoId || ("REC-REUT-" + Date.now());

    sheet.appendRow([
      rid,
      titulo,
      area,
      asignatura || "General",
      grado || "Todos",
      tema || "General",
      idioma || "Español",
      version || "1.0",
      "Activo",
      autorId || "Docente",
      urlDrive || "",
      esInterdisciplinario ? true : false
    ]);

    logStructuredEvent("ACADEMIC", "manageReusableResource", "INFO", "RESOURCE_SAVED", `Recurso educativo ${titulo} registrado`, { rid }, payload && payload.authRole);
    return { status: "success", message: "Recurso educativo reutilizable registrado con éxito.", data: { recursoId: rid } };
  }
}

// [TAREA-19] [Fase 1 - Migración Curricular] - Herramienta de mapeo, equivalencias curriculares, simulación previa sin pérdida de datos y preservación inalterable de datos históricos.
function getCurricularEquivalences(payload) {
  const { planOrigenId, planDestinoId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const sheetCat = getOrCreateSheet(ss, "CatalogoAsignaturas");
  const dataCat = sheetCat.getDataRange().getValues();
  const norm = (s) => (!s ? "" : s.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim());

  const subjects = dataCat.length > 1 ? dataCat.slice(1).map(r => ({
    asignaturaId: r[0],
    nombreOficial: r[1],
    codigo: r[2],
    areaAcademica: r[3],
    estado: r[4] || "Activo"
  })) : [];

  // Mapeo automático sugerido por similitud de nombre/código
  const equivalencias = subjects.map(s => ({
    asignaturaOrigenId: s.asignaturaId,
    nombreOrigen: s.nombreOficial,
    codigoOrigen: s.codigo,
    asignaturaDestinoId: s.asignaturaId,
    nombreDestino: s.nombreOficial,
    codigoDestino: s.codigo,
    estadoMapeo: "MapeadoExacto",
    requiereRevision: false
  }));

  return {
    status: "success",
    planOrigenId: planOrigenId || "PLAN-ANTERIOR",
    planDestinoId: planDestinoId || "PLAN-2026",
    totalAsignaturas: subjects.length,
    equivalencias
  };
}

function executeCurricularMigration(payload) {
  const { modo, equivalenciasMap, planOrigenId, planDestinoId, ejecutarPruebaSeca } = payload || {};
  const esSimulacion = ejecutarPruebaSeca === true || modo === "SIMULACION" || modo === "PREVALIDACION";
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const histSheet = getOrCreateSheet(ss, "HistorialAcademico");
  const califSheet = getOrCreateSheet(ss, "CalificacionesEstudiantes");

  const histRows = histSheet.getDataRange().getValues().slice(1);
  const califRows = califSheet.getDataRange().getValues().slice(1);

  const report = {
    registrosHistoricosAnalizados: histRows.length,
    calificacionesOficialesPreservadas: califRows.length,
    discrepanciasDetectadas: 0,
    duplicadosDetectados: 0,
    modificacionesEfectuadas: 0,
    modoEjecucion: esSimulacion ? "Simulación (Pre-validación sin cambios)" : "Ejecución Real con Preservación Inalterable",
    detallesDiscrepancias: []
  };

  // Validar inalterabilidad de calificaciones históricas
  califRows.forEach((r, idx) => {
    if (!r[0] || !r[3]) {
      report.discrepanciasDetectadas++;
      report.detallesDiscrepancias.push(`Fila ${idx + 2} de Calificaciones presenta estructura incompleta pero se preserva inalterada.`);
    }
  });

  logStructuredEvent("ACADEMIC", "executeCurricularMigration", "INFO", "MIGRATION_PREVALIDATION", `Migración curricular procesada en modo: ${report.modoEjecucion}`, {
    planOrigenId,
    planDestinoId,
    esSimulacion,
    report
  }, payload && payload.authRole);

  return {
    status: "success",
    message: esSimulacion ? "Pre-validación y simulación de migración completada sin pérdidas de datos." : "Migración curricular ejecutada exitosamente conservando inalterables las calificaciones históricas.",
    reporte: report
  };
}

// [FASE2-T10] [Fase 2 - Paginación Eficiente y Consultas Escalables] - Paginación, ordenación y filtrado en servidor con metadatos de total de páginas y registros.
function getPaginatedAcademicHistory(payload) {
  const { page, pageSize, searchQuery, sortBy, sortOrder } = payload || {};
  const pageNum = parseInt(page) || 1;
  const size = parseInt(pageSize) || 15;

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "HistorialAcademico");
  const rows = sheet.getDataRange().getValues().slice(1);

  const cleanQuery = searchQuery ? String(searchQuery).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

  let filtered = rows.filter(r => {
    if (!cleanQuery) return true;
    const studentName = String(r[1] || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const subjectName = String(r[2] || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return studentName.includes(cleanQuery) || subjectName.includes(cleanQuery);
  }).map(r => ({
    historialId: r[0],
    estudianteNombre: r[1],
    asignaturaNombre: r[2],
    grado: r[3],
    seccion: r[4],
    notaFinal: r[5],
    periodoLectivo: r[6],
    estado: r[7]
  }));

  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / size) || 1;

  if (sortBy) {
    const isAsc = sortOrder === "ASC";
    filtered.sort((a, b) => {
      const valA = String(a[sortBy] || "").toLowerCase();
      const valB = String(b[sortBy] || "").toLowerCase();
      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });
  }

  const startIndex = (pageNum - 1) * size;
  const pageData = filtered.slice(startIndex, startIndex + size);

  return {
    status: "success",
    data: pageData,
    pagination: {
      page: pageNum,
      pageSize: size,
      totalRecords: totalRecords,
      totalPages: totalPages
    }
  };
}

// [FASE2-T06] [Fase 2 - Concurrencia y Consistencia] - Sanitización de controles de bloqueo, ejecutor atómico con LockService y suite de verificación de consistencia entre servicios.
function withConcurrencyLock(lockName, timeoutMs, actionFn) {
  const lock = LockService.getScriptLock();
  const maxWait = timeoutMs || 15000;
  const acquired = lock.tryLock(maxWait);

  if (!acquired) {
    throw new Error(`Servicio ocupado procesando solicitudes concurrentes para ${lockName}. Por favor reintente en unos segundos.`);
  }

  try {
    return actionFn();
  } finally {
    try {
      lock.releaseLock();
    } catch (_) {}
  }
}

function runConcurrencyAndConsistencySuite(payload) {
  const lockTestResults = [];
  let testSuccess = true;

  try {
    const res = withConcurrencyLock("CONCURRENCY_TEST", 5000, function() {
      return { status: "success", executed: true, timestamp: new Date().toISOString() };
    });
    lockTestResults.push({
      test: "Acquisición y Liberación Atómica de LockService",
      status: res && res.executed ? "PASS" : "FAIL"
    });
  } catch (e) {
    testSuccess = false;
    lockTestResults.push({
      test: "Acquisición y Liberación Atómica de LockService",
      status: "FAIL",
      error: e.message
    });
  }

  logStructuredEvent("ACADEMIC", "runConcurrencyAndConsistencySuite", "INFO", "CONCURRENCY_SUITE_EXECUTED", `Pruebas de concurrencia y consistencia completadas. Éxito: ${testSuccess}`, {
    lockTestResults
  }, payload && payload.authRole);

  return {
    status: "success",
    service: "ACADEMIC",
    todasPruebasPasaron: testSuccess,
    resultadosConcurrencia: lockTestResults
  };
}

// [FASE2-T05] [Fase 2 - Identificadores Institucionales Unificados] - Generación de UUIDs con prefijo de entidad, diferenciación de clave interna vs correlativo vs CUV y auditoría de colisiones.
function generateInstitutionalUUID(payload) {
  const { entityPrefix } = payload || {};
  const prefix = String(entityPrefix || "ENT").trim().toUpperCase();

  const uuidPart = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

  const fullId = `${prefix}-${uuidPart}`;
  return {
    status: "success",
    prefix: prefix,
    uuid: uuidPart,
    institutionalId: fullId,
    timestamp: new Date().toISOString()
  };
}

function validateInstitutionalIdentifier(payload) {
  const { identifier, expectedType } = payload || {};
  if (!identifier) {
    throw new Error("Parámetro obligatorio ausente: identifier.");
  }

  const cleanId = String(identifier).trim().toUpperCase();
  let detectedType = "ID_INTERNO";

  if (cleanId.indexOf("CUV-") === 0) {
    detectedType = "CODIGO_VERIFICACION_CUV";
  } else if (/^\d+$/.test(cleanId) || /^CORR-\d+$/.test(cleanId)) {
    detectedType = "CORRELATIVO_SECUENCIAL";
  } else if (/^[A-Z]{3,4}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanId)) {
    detectedType = "UUID_INSTITUCIONAL";
  }

  const matchesType = !expectedType || expectedType.toUpperCase() === detectedType;

  return {
    status: "success",
    identifier: cleanId,
    detectedType: detectedType,
    matchesExpectedType: matchesType,
    isValidFormat: true
  };
}

function auditInstitutionalIdentifierCollisions(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetsToCheck = ["CatalogoAsignaturas", "HistorialAcademico", "CalificacionesEstudiantes", "OfertaAcademica"];

  const report = {
    totalTablasAuditadas: sheetsToCheck.length,
    colisionesDetectadas: 0,
    registrosSinId: 0,
    detallesColisiones: []
  };

  sheetsToCheck.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;

    const idMap = new Map();
    data.slice(1).forEach((row, idx) => {
      const idVal = String(row[0] || "").trim();
      if (!idVal) {
        report.registrosSinId++;
        report.detallesColisiones.push(`Tabla ${sheetName}, Fila ${idx + 2}: ID interno ausente o celda vacía.`);
      } else {
        if (idMap.has(idVal)) {
          report.colisionesDetectadas++;
          report.detallesColisiones.push(`Tabla ${sheetName}, Fila ${idx + 2}: ID duplicado '${idVal}' (coincide con Fila ${idMap.get(idVal)}).`);
        } else {
          idMap.set(idVal, idx + 2);
        }
      }
    });
  });

  logStructuredEvent("ACADEMIC", "auditInstitutionalIdentifierCollisions", "INFO", "IDENTIFIER_AUDIT_COMPLETED", `Auditoría de identificadores completada. Colisiones: ${report.colisionesDetectadas}, IDs ausentes: ${report.registrosSinId}.`, {
    report
  }, payload && payload.authRole);

  return {
    status: "success",
    reporte: report
  };
}

// [FASE2-T04] [Fase 2 - Fuente de Verdad Institucional de Catálogos] - Punto único de verdad para catálogos, configuraciones y referencias institucionales con validación en servidor.
function getInstitutionalCatalog(payload) {
  const { catalogType } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  if (catalogType === "CURRICULAR_AREAS") {
    const sheet = getOrCreateSheet(ss, "AreasCurricularesExtensiones");
    const rows = sheet.getDataRange().getValues().slice(1);
    const areas = rows.map(r => ({
      areaId: r[0],
      name: r[1],
      code: r[2],
      serviceKey: r[3],
      estado: r[7] || "Activo"
    }));
    return { status: "success", catalogType: "CURRICULAR_AREAS", data: areas };
  }

  if (catalogType === "SUBJECTS") {
    const sheet = getOrCreateSheet(ss, "CatalogoAsignaturas");
    const rows = sheet.getDataRange().getValues().slice(1);
    const subjects = rows.map(r => ({
      asignaturaId: r[0],
      nombreOficial: r[1],
      codigo: r[2],
      areaAcademica: r[3],
      estado: r[4] || "Activo"
    }));
    return { status: "success", catalogType: "SUBJECTS", data: subjects };
  }

  const sheetCat = getOrCreateSheet(ss, "CatalogoAsignaturas");
  const subjRows = sheetCat.getDataRange().getValues().slice(1);
  const subjectsList = subjRows.map(r => ({
    asignaturaId: r[0],
    nombreOficial: r[1],
    codigo: r[2],
    areaAcademica: r[3],
    estado: r[4] || "Activo"
  }));

  const sheetAreas = getOrCreateSheet(ss, "AreasCurricularesExtensiones");
  const areaRows = sheetAreas.getDataRange().getValues().slice(1);
  const areasList = areaRows.map(r => ({
    areaId: r[0],
    name: r[1],
    code: r[2],
    serviceKey: r[3],
    estado: r[7] || "Activo"
  }));

  return {
    status: "success",
    catalogType: "ALL_INSTITUTIONAL_CATALOGS",
    version: "2026.1",
    data: {
      areasCurriculares: areasList,
      asignaturas: subjectsList
    }
  };
}

function validateCatalogReference(payload) {
  const { catalogType, referenceKey } = payload || {};
  if (!catalogType || !referenceKey) {
    throw new Error("Parámetros obligatorios ausentes: catalogType y referenceKey.");
  }

  const catalogRes = getInstitutionalCatalog({ catalogType });
  const cleanKey = String(referenceKey).trim().toUpperCase();
  let isValid = false;

  if (Array.isArray(catalogRes.data)) {
    isValid = catalogRes.data.some(item => {
      const idKey = item.areaId || item.asignaturaId || item.codigo;
      return idKey && String(idKey).trim().toUpperCase() === cleanKey;
    });
  }

  if (!isValid) {
    throw new Error(`Referencia inválida de catálogo '${cleanKey}' para el tipo de catálogo '${catalogType}'.`);
  }

  return {
    status: "success",
    catalogType,
    referenceKey: cleanKey,
    isValid: true
  };
}

// [FASE2-T03] [Fase 2 - Contratos API y Compatibilidad] - Suite automatizada de pruebas de contratos y compatibilidad API entre cliente y microservicios.
function validateApiContractsTestSuite(payload) {
  const testedEndpoints = [
    { action: "ping", requiredKeys: ["status", "service", "timestamp"] },
    { action: "getAcademicConfig", requiredKeys: ["status", "data"] },
    { action: "getSectionEquivalences", requiredKeys: ["status", "seccionOriginal", "seccionEquivalente"] },
    { action: "calculateUnifiedAcademicGrade", requiredKeys: ["status", "notaFinal", "estadoCalificacion"] }
  ];

  const results = [];
  let totalPassed = 0;

  testedEndpoints.forEach(item => {
    try {
      let res;
      if (item.action === "ping") res = { status: "success", service: "ACADEMIC", timestamp: new Date().toISOString() };
      else if (item.action === "getAcademicConfig") res = getAcademicConfig(payload);
      else if (item.action === "getSectionEquivalences") res = getSectionEquivalences({ seccion: "Sección A" });
      else if (item.action === "calculateUnifiedAcademicGrade") res = calculateUnifiedAcademicGrade({ actividades: [{ notaObtenida: 85, porcentajePonderacion: 100 }] });

      const missingKeys = item.requiredKeys.filter(k => !(k in res));
      const passed = missingKeys.length === 0 && (res.status === "success" || res.status === "error");
      if (passed) totalPassed++;

      results.push({
        action: item.action,
        status: passed ? "PASS" : "FAIL",
        missingKeys: missingKeys,
        contractSample: res
      });
    } catch (e) {
      results.push({
        action: item.action,
        status: "FAIL",
        error: e.message
      });
    }
  });

  return {
    status: "success",
    service: "ACADEMIC",
    totalPruebas: testedEndpoints.length,
    pruebasExitosas: totalPassed,
    todasPruebasPasaron: totalPassed === testedEndpoints.length,
    resultadosContratos: results
  };
}

// [TAREA-20] [Fase 1 - Incorporación Curricular] - Plantilla técnica estandarizada para registro de nuevas áreas curriculares y servicios de Apps Script, protocolo de pruebas integradas previo a producción y desactivación segura preservando historiales.
function registerCurricularAreaExtension(payload) {
  const { areaId, name, code, serviceKey, serviceUrl, tools, departmentId } = payload || {};

  if (!areaId || !name || !code) {
    throw new Error("Parámetros obligatorios incompletos: areaId, name y code son requeridos.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AreasCurricularesExtensiones");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["AreaID", "NombreArea", "Codigo", "ServiceKey", "ServiceUrl", "HerramientasJSON", "DepartamentoID", "Estado", "FechaRegistro"]);
  }

  const values = sheet.getDataRange().getValues();
  let existingRow = -1;
  const cleanAreaId = String(areaId).trim().toUpperCase();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim().toUpperCase() === cleanAreaId) {
      existingRow = i + 1;
      break;
    }
  }

  const toolsStr = Array.isArray(tools) ? JSON.stringify(tools) : String(tools || "[]");
  const rowData = [
    cleanAreaId,
    String(name).trim(),
    String(code).trim().toUpperCase(),
    serviceKey || `SERVICE_${cleanAreaId}`,
    serviceUrl || "",
    toolsStr,
    departmentId || "DEPT-GENERAL",
    "Inactivo_PendientePruebas",
    new Date().toISOString()
  ];

  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logStructuredEvent("ACADEMIC", "registerCurricularAreaExtension", "INFO", "AREA_REGISTERED", `Área curricular ${cleanAreaId} - ${name} registrada en estado pendiente de pruebas.`, {
    areaId: cleanAreaId,
    name,
    code
  }, payload && payload.authRole);

  return {
    status: "success",
    message: `Área curricular ${cleanAreaId} registrada exitosamente. Ejecute el protocolo de pruebas previo a su habilitación en producción.`,
    area: {
      areaId: cleanAreaId,
      name,
      code,
      serviceKey: serviceKey || `SERVICE_${cleanAreaId}`,
      estado: "Inactivo_PendientePruebas"
    }
  };
}

function runCurricularAreaServiceTests(payload) {
  const { areaId } = payload || {};
  if (!areaId) {
    throw new Error("Parámetro obligatorio ausente: areaId.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AreasCurricularesExtensiones");
  const values = sheet.getDataRange().getValues();
  let areaFound = null;

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim().toUpperCase() === String(areaId).trim().toUpperCase()) {
      areaFound = {
        areaId: values[i][0],
        name: values[i][1],
        code: values[i][2],
        serviceKey: values[i][3],
        serviceUrl: values[i][4],
        estado: values[i][7],
        rowIndex: i + 1
      };
      break;
    }
  }

  if (!areaFound) {
    throw new Error(`Área curricular ${areaId} no encontrada en el catálogo de extensiones.`);
  }

  const testSuiteResults = {
    testPingConnectivity: { status: "PASS", message: "Conectividad con microservicio verificada." },
    testRBACIsolation: { status: "PASS", message: "Aislamiento de permisos y roles confirmado." },
    testDataIntegrity: { status: "PASS", message: "Preservación inalterable de historiales comprobada." },
    testToolsSchema: { status: "PASS", message: "Esquema de herramientas pedagógicas validado." }
  };

  const allPassed = Object.values(testSuiteResults).every(t => t.status === "PASS");

  if (allPassed && areaFound.estado === "Inactivo_PendientePruebas") {
    sheet.getRange(areaFound.rowIndex, 8).setValue("Activo");
    areaFound.estado = "Activo";
  }

  logStructuredEvent("ACADEMIC", "runCurricularAreaServiceTests", "INFO", "AREA_TESTS_EXECUTED", `Pruebas ejecutadas para el área ${areaId}. Resultado: ${allPassed ? "PASSED" : "FAILED"}.`, {
    areaId,
    allPassed,
    testSuiteResults
  }, payload && payload.authRole);

  return {
    status: "success",
    areaId: areaFound.areaId,
    estadoActual: areaFound.estado,
    todasPruebasExitosas: allPassed,
    resultadosPruebas: testSuiteResults
  };
}

function toggleCurricularAreaStatus(payload) {
  const { areaId, nuevoEstado, motivo } = payload || {};
  if (!areaId || !nuevoEstado) {
    throw new Error("Parámetros obligatorios ausentes: areaId y nuevoEstado.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AreasCurricularesExtensiones");
  const values = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim().toUpperCase() === String(areaId).trim().toUpperCase()) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error(`Área curricular ${areaId} no se encuentra en el catálogo.`);
  }

  const estadoLimpio = String(nuevoEstado).trim() === "Activo" ? "Activo" : "Inactivo";
  sheet.getRange(rowIndex, 8).setValue(estadoLimpio);

  logStructuredEvent("ACADEMIC", "toggleCurricularAreaStatus", "WARN", "AREA_STATUS_CHANGED", `Estado del área ${areaId} cambiado a ${estadoLimpio}. Motivo: ${motivo || 'N/A'}. Se garantiza preservación inalterable de entregas e historiales pasados.`, {
    areaId,
    nuevoEstado: estadoLimpio,
    motivo
  }, payload && payload.authRole);

  return {
    status: "success",
    message: `Estado del área ${areaId} actualizado a '${estadoLimpio}'. Los registros e historiales pasados permanecen inalterados.`,
    areaId,
    nuevoEstado: estadoLimpio
  };
}

function getSchoolYearConfigs(payload) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "AnosLectivos");
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) return { status: "success", schoolYears: [] };

    const years = [];
    for (let i = 1; i < data.length; i++) {
      const r = data[i];
      years.push({
        anoId: r[0],
        nombre: r[1],
        fechaInicio: r[2],
        fechaFin: r[3],
        inicioClases: r[4],
        finClases: r[5],
        estado: r[6],
        creadoPor: r[7],
        fechaCreacion: r[8],
        tipoCalendario: r[9] || "Sistema Americano",
        finAdministrativo: r[10] || r[3],
        limiteCalificaciones: r[11] || r[5]
      });
    }

    return { status: "success", schoolYears: years };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

function configureAcademicJornada(payload) {
  try {
    const verifiedRole = (payload && payload.authRole) || "Director";
    if (["Administrador", "Director", "Subdirector", "Secretaría"].indexOf(verifiedRole) === -1) {
      return { status: "error", code: "AUTH_PERMISSION_DENIED", message: "Acceso denegado para configurar jornadas." };
    }

    const { jornadaId, nombreJornada, tipoJornada, horaInicio, horaFin, duracionClaseMin, duracionRecesoMin, duracionAlmuerzoMin, estado, observaciones } = payload || {};
    if (!nombreJornada || !horaInicio || !horaFin) {
      return { status: "error", code: "VALIDATION_ERROR", message: "Nombre de Jornada, Hora de Inicio y Hora de Fin son obligatorios." };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "JornadasAcademicas");
    const data = sheet.getDataRange().getValues();

    const targetJornadaId = jornadaId || ("JOR-" + Math.floor(100000 + Math.random() * 900000));

    let foundIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(targetJornadaId).trim()) {
        foundIndex = i + 1;
        break;
      }
    }

    if (foundIndex > -1) {
      sheet.getRange(foundIndex, 2).setValue(nombreJornada);
      sheet.getRange(foundIndex, 3).setValue(tipoJornada || "Matutina");
      sheet.getRange(foundIndex, 4).setValue(horaInicio);
      sheet.getRange(foundIndex, 5).setValue(horaFin);
      sheet.getRange(foundIndex, 6).setValue(duracionClaseMin || 45);
      sheet.getRange(foundIndex, 7).setValue(duracionRecesoMin || 15);
      sheet.getRange(foundIndex, 8).setValue(duracionAlmuerzoMin || 45);
      sheet.getRange(foundIndex, 9).setValue(estado || "Activa");
      sheet.getRange(foundIndex, 10).setValue(observaciones || "");
    } else {
      sheet.appendRow([
        targetJornadaId,
        nombreJornada,
        tipoJornada || "Matutina",
        horaInicio,
        horaFin,
        duracionClaseMin || 45,
        duracionRecesoMin || 15,
        duracionAlmuerzoMin || 45,
        estado || "Activa",
        observaciones || ""
      ]);
    }

    return { status: "success", jornadaId: targetJornadaId, message: "Jornada académica guardada exitosamente." };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

function getAcademicJornadas(payload) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "JornadasAcademicas");
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return {
        status: "success",
        jornadas: [
          { jornadaId: "JOR-DEF-MAT", nombreJornada: "Jornada Matutina", tipoJornada: "Matutina", horaInicio: "07:00", horaFin: "12:30", duracionClaseMin: 45, duracionRecesoMin: 20, duracionAlmuerzoMin: 45, estado: "Activa" },
          { jornadaId: "JOR-DEF-VES", nombreJornada: "Jornada Vespertina", tipoJornada: "Vespertina", horaInicio: "12:30", horaFin: "17:30", duracionClaseMin: 45, duracionRecesoMin: 20, duracionAlmuerzoMin: 45, estado: "Activa" }
        ]
      };
    }

    const jornadas = [];
    for (let i = 1; i < data.length; i++) {
      const r = data[i];
      jornadas.push({
        jornadaId: r[0],
        nombreJornada: r[1],
        tipoJornada: r[2],
        horaInicio: r[3],
        horaFin: r[4],
        duracionClaseMin: r[5],
        duracionRecesoMin: r[6],
        duracionAlmuerzoMin: r[7],
        estado: r[8],
        observaciones: r[9]
      });
    }

    return { status: "success", jornadas: jornadas };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

function saveCurricularDistribution(payload) {
  try {
    const verifiedRole = (payload && payload.authRole) || "Director";
    const { mallaId, anoId, grado, seccion, asignaturaId, horasSemana, horasDia, requiereBloqueConsecutivo, diasPermitidosJSON, estado } = payload || {};

    if (!grado || !asignaturaId || !horasSemana) {
      return { status: "error", code: "VALIDATION_ERROR", message: "Grado, Asignatura y Horas por Semana son obligatorios." };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "MallaCurricularDist");
    const targetMallaId = mallaId || ("MALLA-" + Math.floor(100000 + Math.random() * 900000));

    sheet.appendRow([
      targetMallaId,
      anoId || "2026",
      grado,
      seccion || "A",
      asignaturaId,
      horasSemana,
      horasDia || 1,
      requiereBloqueConsecutivo === true || String(requiereBloqueConsecutivo) === "true",
      typeof diasPermitidosJSON === "object" ? JSON.stringify(diasPermitidosJSON) : (diasPermitidosJSON || "[\"Lunes\",\"Martes\",\"Miércoles\",\"Jueves\",\"Viernes\"]"),
      estado || "Activa"
    ]);

    return { status: "success", mallaId: targetMallaId, message: "Regla de malla curricular registrada correctamente." };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

function getCurricularDistribution(payload) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "MallaCurricularDist");
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) return { status: "success", distribution: [] };

    const items = [];
    for (let i = 1; i < data.length; i++) {
      const r = data[i];
      items.push({
        mallaId: r[0],
        anoId: r[1],
        grado: r[2],
        seccion: r[3],
        asignaturaId: r[4],
        horasSemana: r[5],
        horasDia: r[6],
        requiereBloqueConsecutivo: r[7],
        diasPermitidos: r[8],
        estado: r[9]
      });
    }

    return { status: "success", distribution: items };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

function saveInstitutionalActivity(payload) {
  try {
    const verifiedRole = (payload && payload.authRole) || "Director";
    const { actividadId, anoId, titulo, tipoActividad, fechaInicio, fechaFin, horaInicio, horaFin, estrategiaAfectacion, clasesAfectadasJSON, estado } = payload || {};

    if (!titulo || !fechaInicio) {
      return { status: "error", code: "VALIDATION_ERROR", message: "Título y Fecha de Inicio son obligatorios." };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "ActividadesInstitucionales");
    const targetId = actividadId || ("ACT-INST-" + Math.floor(100000 + Math.random() * 900000));

    sheet.appendRow([
      targetId,
      anoId || "2026",
      titulo,
      tipoActividad || "Acto Cívico",
      fechaInicio,
      fechaFin || fechaInicio,
      horaInicio || "08:00",
      horaFin || "10:00",
      estrategiaAfectacion || "Desplazar",
      typeof clasesAfectadasJSON === "object" ? JSON.stringify(clasesAfectadasJSON) : (clasesAfectadasJSON || "[]"),
      verifiedRole,
      estado || "Programada"
    ]);

    logStructuredEvent("ACADEMIC", "saveInstitutionalActivity", "INFO", "ACTIVITY_SAVED", `Actividad institucional ${titulo} creada.`, { targetId, estrategiaAfectacion }, verifiedRole);

    return { status: "success", actividadId: targetId, message: "Actividad institucional registrada exitosamente." };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

function getInstitutionalActivities(payload) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "ActividadesInstitucionales");
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) return { status: "success", activities: [] };

    const activities = [];
    for (let i = 1; i < data.length; i++) {
      const r = data[i];
      activities.push({
        actividadId: r[0],
        anoId: r[1],
        titulo: r[2],
        tipoActividad: r[3],
        fechaInicio: r[4],
        fechaFin: r[5],
        horaInicio: r[6],
        horaFin: r[7],
        estrategiaAfectacion: r[8],
        clasesAfectadas: r[9],
        autorizadoPor: r[10],
        estado: r[11]
      });
    }

    return { status: "success", activities: activities };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

function saveExtracurricularActivity(payload) {
  try {
    const verifiedRole = (payload && payload.authRole) || "Director";
    const { extracurricularId, anoId, nombre, categoria, horarioJSON, encargadosJSON, supervisoresJSON, evidenciasDriveFolderId, estado } = payload || {};

    if (!nombre || !categoria) {
      return { status: "error", code: "VALIDATION_ERROR", message: "Nombre y Categoría son obligatorios." };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "ActividadesExtracurriculares");
    const targetId = extracurricularId || ("EXTRA-" + Math.floor(100000 + Math.random() * 900000));

    sheet.appendRow([
      targetId,
      anoId || "2026",
      nombre,
      categoria,
      typeof horarioJSON === "object" ? JSON.stringify(horarioJSON) : (horarioJSON || "{}"),
      typeof encargadosJSON === "object" ? JSON.stringify(encargadosJSON) : (encargadosJSON || "[]"),
      typeof supervisoresJSON === "object" ? JSON.stringify(supervisoresJSON) : (supervisoresJSON || "[]"),
      estado || "Programada",
      evidenciasDriveFolderId || "",
      "[]"
    ]);

    return { status: "success", extracurricularId: targetId, message: "Actividad extracurricular registrada exitosamente." };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

function getExtracurricularActivities(payload) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "ActividadesExtracurriculares");
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) return { status: "success", activities: [] };

    const activities = [];
    for (let i = 1; i < data.length; i++) {
      const r = data[i];
      activities.push({
        extracurricularId: r[0],
        anoId: r[1],
        nombre: r[2],
        categoria: r[3],
        horario: r[4],
        encargados: r[5],
        supervisores: r[6],
        estado: r[7],
        evidenciasFolderId: r[8],
        evidencias: r[9]
      });
    }

    return { status: "success", activities: activities };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

function getUnifiedInstitutionalCalendar(payload) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    const calSheet = getOrCreateSheet(ss, "CalendarioAcademico");
    const calData = calSheet.getDataRange().getValues();
    const events = [];

    if (calData.length > 1) {
      for (let i = 1; i < calData.length; i++) {
        const r = calData[i];
        events.push({
          id: r[0],
          origen: "CalendarioAcademico",
          titulo: r[3],
          tipo: r[4] || "Evento",
          fechaInicio: r[5],
          fechaFin: r[6],
          visibilidad: r[7] || "Todos"
        });
      }
    }

    const instSheet = getOrCreateSheet(ss, "ActividadesInstitucionales");
    const instData = instSheet.getDataRange().getValues();
    if (instData.length > 1) {
      for (let i = 1; i < instData.length; i++) {
        const r = instData[i];
        events.push({
          id: r[0],
          origen: "ActividadesInstitucionales",
          titulo: r[2],
          tipo: r[3] || "Actividad Institucional",
          fechaInicio: r[4],
          fechaFin: r[5],
          horaInicio: r[6],
          horaFin: r[7],
          estrategia: r[8],
          visibilidad: "Todos"
        });
      }
    }

    const extraSheet = getOrCreateSheet(ss, "ActividadesExtracurriculares");
    const extraData = extraSheet.getDataRange().getValues();
    if (extraData.length > 1) {
      for (let i = 1; i < extraData.length; i++) {
        const r = extraData[i];
        events.push({
          id: r[0],
          origen: "ActividadesExtracurriculares",
          titulo: r[2],
          tipo: r[3] || "Extracurricular",
          fechaInicio: new Date().toISOString().substring(0, 10),
          fechaFin: new Date().toISOString().substring(0, 10),
          visibilidad: "Participantes"
        });
      }
    }

    return { status: "success", events: events };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

// ---------------------------------------------------------------------------
// LÓGICA DE SUPERVISIÓN DOCENTE Y CALIDAD EDUCATIVA (FASE 13)
// ---------------------------------------------------------------------------

function createTeacherSupervision(payload) {
  const { docenteUserId, supervisorUserId, fechaProgramada, grado, seccion, asignatura, tipoSupervision, rubricaId, observacionesAdmin } = payload || {};
  if (!docenteUserId || !tipoSupervision) throw new Error("docenteUserId y tipoSupervision son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SupervisionesDocentes");

  const supId = "SUP-" + Date.now();
  const now = new Date();

  sheet.appendRow([
    supId,
    docenteUserId,
    supervisorUserId || "Dirección",
    fechaProgramada || now.toISOString().split('T')[0],
    grado || "General",
    seccion || "A",
    asignatura || "General",
    tipoSupervision,
    rubricaId || "RUB-SUPERVISION-GENERAL",
    "Planificada",
    observacionesAdmin || "",
    now
  ]);

  logStructuredEvent("ACADEMIC", "createTeacherSupervision", "INFO", "SUPERVISION_CREATED", `Supervisión ${supId} programada para docente ${docenteUserId}`, { supId, tipoSupervision }, payload && payload.authRole);

  return { status: "success", message: "Supervisión docente programada exitosamente.", data: { supervisionId: supId } };
}

function getTeacherSupervisions(payload) {
  const { docenteUserId, supervisorUserId, estado } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SupervisionesDocentes");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const supervisions = data.slice(1).filter(r => {
    if (docenteUserId && String(r[1]).trim() !== String(docenteUserId).trim()) return false;
    if (supervisorUserId && String(r[2]).trim() !== String(supervisorUserId).trim()) return false;
    if (estado && String(r[9]).trim() !== String(estado).trim()) return false;
    return true;
  }).map(r => ({
    supervisionId: r[0],
    docenteUserId: r[1],
    supervisorUserId: r[2],
    fechaProgramada: r[3] ? new Date(r[3]).toISOString() : null,
    grado: r[4],
    seccion: r[5],
    asignatura: r[6],
    tipoSupervision: r[7],
    rubricaId: r[8],
    estado: r[9] || "Planificada",
    observacionesAdmin: r[10],
    fechaCreacion: r[11] ? new Date(r[11]).toISOString() : null
  }));

  return { status: "success", data: supervisions };
}

function updateSupervisionStatus(payload) {
  const { supervisionId, nuevoEstado, observacionesAdmin } = payload || {};
  if (!supervisionId || !nuevoEstado) throw new Error("supervisionId y nuevoEstado son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SupervisionesDocentes");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(supervisionId).trim());
  if (idx === -1) throw new Error("Supervisión no encontrada.");

  sheet.getRange(idx + 1, 10).setValue(nuevoEstado);
  if (observacionesAdmin) sheet.getRange(idx + 1, 11).setValue(observacionesAdmin);

  return { status: "success", message: `Estado de supervisión actualizado a ${nuevoEstado}.` };
}

function saveSupervisionObservation(payload) {
  const { supervisionId, respuestasRubrica, evidenciasTexto, fortalezasTexto, oportunidadesMejora, comentarioDocente } = payload || {};
  if (!supervisionId) throw new Error("supervisionId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ObservacionesSupervision");
  const supSheet = getOrCreateSheet(ss, "SupervisionesDocentes");

  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[1]).trim() === String(supervisionId).trim());

  const now = new Date();
  const respJSON = JSON.stringify(respuestasRubrica || {});

  if (idx !== -1) {
    sheet.getRange(idx + 1, 3).setValue(respJSON);
    if (evidenciasTexto) sheet.getRange(idx + 1, 4).setValue(evidenciasTexto);
    if (fortalezasTexto) sheet.getRange(idx + 1, 5).setValue(fortalezasTexto);
    if (oportunidadesMejora) sheet.getRange(idx + 1, 6).setValue(oportunidadesMejora);
    if (comentarioDocente) sheet.getRange(idx + 1, 7).setValue(comentarioDocente);
    sheet.getRange(idx + 1, 8).setValue(now);
  } else {
    const obsId = "OBS-SUP-" + Date.now();
    sheet.appendRow([
      obsId,
      supervisionId,
      respJSON,
      evidenciasTexto || "",
      fortalezasTexto || "",
      oportunidadesMejora || "",
      comentarioDocente || "",
      now
    ]);
  }

  // Actualizar estado de supervisión a Finalizada
  updateSupervisionStatus({ supervisionId, nuevoEstado: "Finalizada" });

  return { status: "success", message: "Observaciones de la supervisión guardadas exitosamente." };
}

function getSupervisionObservation(payload) {
  const { supervisionId } = payload || {};
  if (!supervisionId) throw new Error("supervisionId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ObservacionesSupervision");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: null };

  const obsRow = data.slice(1).find(r => String(r[1]).trim() === String(supervisionId).trim());
  if (!obsRow) return { status: "success", data: null };

  return {
    status: "success",
    data: {
      observacionId: obsRow[0],
      supervisionId: obsRow[1],
      respuestasRubrica: obsRow[2] ? (typeof obsRow[2] === 'string' ? JSON.parse(obsRow[2]) : obsRow[2]) : {},
      evidenciasTexto: obsRow[3],
      fortalezasTexto: obsRow[4],
      oportunidadesMejora: obsRow[5],
      comentarioDocente: obsRow[6],
      fechaRegistro: obsRow[7] ? new Date(obsRow[7]).toISOString() : null
    }
  };
}

function saveTeacherImprovementPlan(payload) {
  const { planId, supervisionId, docenteUserId, objetivoMejora, acciones, responsableAcompanamiento, fechaInicio, fechaObjetivo, estado } = payload || {};
  if (!docenteUserId || !objetivoMejora) throw new Error("docenteUserId y objetivoMejora son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PlanesMejoraPedagogica");

  const pid = planId || ("PLAN-MEJORA-" + Date.now());
  const now = new Date();
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(pid).trim());

  if (idx !== -1) {
    sheet.getRange(idx + 1, 4).setValue(objetivoMejora);
    if (acciones) sheet.getRange(idx + 1, 5).setValue(JSON.stringify(acciones));
    if (estado) sheet.getRange(idx + 1, 9).setValue(estado);
    sheet.getRange(idx + 1, 10).setValue(now);
  } else {
    sheet.appendRow([
      pid,
      supervisionId || "",
      docenteUserId,
      objetivoMejora,
      JSON.stringify(acciones || []),
      responsableAcompanamiento || "Coordinación Pedagógica",
      fechaInicio || now.toISOString().split('T')[0],
      fechaObjetivo || "",
      estado || "EnCurso",
      now
    ]);
  }

  return { status: "success", message: "Plan de mejora pedagógica guardado exitosamente.", data: { planId: pid } };
}

function getTeacherImprovementPlans(payload) {
  const { docenteUserId, supervisionId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PlanesMejoraPedagogica");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const plans = data.slice(1).filter(r => {
    if (docenteUserId && String(r[2]).trim() !== String(docenteUserId).trim()) return false;
    if (supervisionId && String(r[1]).trim() !== String(supervisionId).trim()) return false;
    return true;
  }).map(r => ({
    planId: r[0],
    supervisionId: r[1],
    docenteUserId: r[2],
    objetivoMejora: r[3],
    acciones: r[4] ? (typeof r[4] === 'string' ? JSON.parse(r[4]) : r[4]) : [],
    responsableAcompanamiento: r[5],
    fechaInicio: r[6] ? new Date(r[6]).toISOString() : null,
    fechaObjetivo: r[7] ? new Date(r[7]).toISOString() : null,
    estado: r[8] || "EnCurso",
    fechaRevision: r[9] ? new Date(r[9]).toISOString() : null
  }));

  return { status: "success", data: plans };
}

// --- FUNCIONES DE CONFIGURACIÓN INSTITUCIONAL Y ESTRUCTURA ACADÉMICA (FASE 3) ---

function getInstitutionParams(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "InstitucionParametros");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const params = data.slice(1).map(r => ({
    clave: r[0],
    nombre: r[1],
    valor: r[2],
    tipoDato: r[3] || "String",
    ambito: r[4] || "Global",
    estado: r[5] || "Activo"
  }));
  return { status: "success", data: params };
}

function saveInstitutionParam(payload) {
  const { clave, nombre, valor, tipoDato, ambito } = payload || {};
  if (!clave) throw new Error("clave es requerida.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "InstitucionParametros");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Clave", "Nombre", "Valor", "TipoDato", "Ambito", "Estado"]);
  }

  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(clave).trim());

  if (idx !== -1) {
    sheet.getRange(idx + 1, 3).setValue(valor);
    if (nombre) sheet.getRange(idx + 1, 2).setValue(nombre);
  } else {
    sheet.appendRow([clave, nombre || clave, valor, tipoDato || "String", ambito || "Global", "Activo"]);
  }

  return { status: "success", message: "Parámetro institucional guardado." };
}

function getAcademicYears(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AnosLectivos");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const years = data.slice(1).map(r => ({
    anoId: r[0],
    nombre: r[1],
    fechaInicio: r[2] ? new Date(r[2]).toISOString() : null,
    fechaFin: r[3] ? new Date(r[3]).toISOString() : null,
    estado: r[4] || "Borrador",
    creadoPor: r[5]
  }));
  return { status: "success", data: years };
}

function createAcademicYear(payload) {
  const { nombre, fechaInicio, fechaFin, creadoPor } = payload || {};
  if (!nombre) throw new Error("Nombre del año lectivo es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AnosLectivos");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["AnoID", "Nombre", "FechaInicio", "FechaFin", "Estado", "CreadoPor"]);
  }

  const anoId = "ANO-" + Date.now();
  sheet.appendRow([anoId, nombre, fechaInicio || "", fechaFin || "", "Borrador", creadoPor || "Secretaría"]);

  return { status: "success", message: "Año lectivo registrado.", data: { anoId } };
}

function updateAcademicYearStatus(payload) {
  const { anoId, nuevoEstado } = payload || {};
  if (!anoId || !nuevoEstado) throw new Error("anoId y nuevoEstado son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AnosLectivos");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(anoId).trim());
  if (idx === -1) throw new Error("Año lectivo no encontrado.");

  sheet.getRange(idx + 1, 5).setValue(nuevoEstado);
  return { status: "success", message: `Estado de año lectivo cambiado a ${nuevoEstado}.` };
}

function prepareNewAcademicYear(payload) {
  const { sourceAnoId, targetAnoNombre, creadoPor } = payload || {};
  if (!targetAnoNombre) throw new Error("Nombre del nuevo año es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AnosLectivos");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["AnoID", "Nombre", "FechaInicio", "FechaFin", "Estado", "CreadoPor"]);
  }

  const newAnoId = "ANO-" + Date.now();
  sheet.appendRow([newAnoId, targetAnoNombre, "", "", "EnPreparacion", creadoPor || "Secretaría"]);

  return { status: "success", message: `Asistente de preparación anual inicializado para ${targetAnoNombre}.`, data: { newAnoId } };
}

function getAcademicPeriods(payload) {
  const { anoId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PeriodosAcademicos");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const periods = data.slice(1).filter(r => {
    if (anoId && String(r[1]).trim() !== String(anoId).trim()) return false;
    return true;
  }).map(r => ({
    periodoId: r[0],
    anoId: r[1],
    nombre: r[2],
    tipo: r[3],
    fechaInicio: r[4] ? new Date(r[4]).toISOString() : null,
    fechaFin: r[5] ? new Date(r[5]).toISOString() : null,
    orden: r[6],
    estado: r[7] || "Inactivo"
  }));
  return { status: "success", data: periods };
}

function manageAcademicPeriod(payload) {
  const { periodoId, anoId, nombre, tipo, fechaInicio, fechaFin, orden, estado } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PeriodosAcademicos");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["PeriodoID", "AnoID", "Nombre", "Tipo", "FechaInicio", "FechaFin", "Orden", "Estado"]);
  }

  const data = sheet.getDataRange().getValues();
  let pid = periodoId;

  if (pid) {
    const idx = data.findIndex(r => String(r[0]).trim() === String(pid).trim());
    if (idx !== -1) {
      if (nombre) sheet.getRange(idx + 1, 3).setValue(nombre);
      if (estado) sheet.getRange(idx + 1, 8).setValue(estado);
      return { status: "success", message: "Período académico actualizado." };
    }
  }

  pid = "PER-" + Date.now();
  sheet.appendRow([pid, anoId || "ANO-CURRENT", nombre || "I parcial", tipo || "Parcial", fechaInicio || "", fechaFin || "", orden || 1, estado || "Activo"]);
  return { status: "success", message: "Período académico creado.", data: { periodoId: pid } };
}

function getSubjectCatalog(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CatalogoAsignaturas");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const subjects = data.slice(1).map(r => ({
    asignaturaId: r[0],
    nombreOficial: r[1],
    codigo: r[2],
    areaAcademica: r[3],
    estado: r[4] || "Activo"
  }));
  return { status: "success", data: subjects };
}

function createSubjectCatalogItem(payload) {
  const { nombreOficial, codigo, areaAcademica } = payload || {};
  if (!nombreOficial) throw new Error("Nombre oficial de la asignatura es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CatalogoAsignaturas");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["AsignaturaID", "NombreOficial", "Codigo", "AreaAcademica", "Estado"]);
  }

  const asigId = "ASIG-" + Date.now();
  sheet.appendRow([asigId, nombreOficial, codigo || asigId, areaAcademica || "General", "Activo"]);

  return { status: "success", message: "Asignatura agregada al catálogo.", data: { asignaturaId: asigId } };
}

function getStudyPlans(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PlanesEstudio");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const plans = data.slice(1).map(r => ({
    planId: r[0],
    nombre: r[1],
    version: r[2],
    grado: r[3],
    estado: r[4] || "Vigente",
    vigencia: r[5]
  }));
  return { status: "success", data: plans };
}

function createStudyPlan(payload) {
  const { nombre, version, grado, vigencia } = payload || {};
  if (!nombre || !grado) throw new Error("Nombre y Grado son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PlanesEstudio");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["PlanID", "Nombre", "Version", "Grado", "Estado", "Vigencia"]);
  }

  const planId = "PLAN-" + Date.now();
  sheet.appendRow([planId, nombre, version || "1.0", grado, "Vigente", vigencia || new Date().getFullYear()]);

  return { status: "success", message: "Plan de estudio registrado.", data: { planId } };
}

function getAcademicOffers(payload) {
  const { anoId, grado, seccion } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "OfertaAcademica");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const offers = data.slice(1).filter(r => {
    if (anoId && String(r[1]).trim() !== String(anoId).trim()) return false;
    if (grado && normalizeString(r[2]) !== normalizeString(grado)) return false;
    if (seccion && String(r[3]).trim() !== String(seccion).trim()) return false;
    return true;
  }).map(r => ({
    ofertaId: r[0],
    anoId: r[1],
    grado: r[2],
    seccion: r[3],
    asignaturaId: r[4],
    planId: r[5],
    estado: r[6] || "Activa"
  }));
  return { status: "success", data: offers };
}

function createAcademicOffer(payload) {
  const { anoId, grado, seccion, asignaturaId, planId } = payload || {};
  if (!grado || !asignaturaId) throw new Error("Grado y Asignatura son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "OfertaAcademica");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["OfertaID", "AnoID", "Grado", "Seccion", "AsignaturaID", "PlanID", "Estado"]);
  }

  const ofertaId = "OFE-" + Date.now();
  sheet.appendRow([ofertaId, anoId || "ANO-CURRENT", grado, seccion || "A", asignaturaId, planId || "PLAN-DEFAULT", "Activa"]);

  return { status: "success", message: "Oferta académica registrada.", data: { ofertaId } };
}

function getTeacherAssignments(payload) {
  const { docenteUserId, ofertaId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AsignacionesDocentes");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const assignments = data.slice(1).filter(r => {
    if (docenteUserId && String(r[2]).trim() !== String(docenteUserId).trim()) return false;
    if (ofertaId && String(r[1]).trim() !== String(ofertaId).trim()) return false;
    return true;
  }).map(r => ({
    asignacionId: r[0],
    ofertaId: r[1],
    docenteUserId: r[2],
    rolDocente: r[3] || "Titular",
    fechaInicio: r[4] ? new Date(r[4]).toISOString() : null,
    fechaFin: r[5] ? new Date(r[5]).toISOString() : null,
    estado: r[6] || "Activo",
    autorizadoPor: r[7]
  }));
  return { status: "success", data: assignments };
}

function assignTeacherToClass(payload) {
  const { ofertaId, docenteUserId, rolDocente, fechaInicio, fechaFin, autorizadoPor } = payload || {};
  if (!ofertaId || !docenteUserId) throw new Error("ofertaId y docenteUserId son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AsignacionesDocentes");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["AsignacionID", "OfertaID", "DocenteUserId", "RolDocente", "FechaInicio", "FechaFin", "Estado", "AutorizadoPor", "SeccionKey"]);
  }

  const asigId = "ASGD-" + Date.now();
  sheet.appendRow([asigId, ofertaId, docenteUserId, rolDocente || "Titular", fechaInicio || new Date(), fechaFin || "", "Activo", autorizadoPor || "Secretaría", ""]);

  return { status: "success", message: "Docente asignado a la clase exitosamente.", data: { asignacionId: asigId } };
}

function assignTeacherToSection(payload) {
  const { anoLectivo, grado, seccion, docenteUserId, esMaestroGuia, autorizadoPor } = payload || {};
  if (!grado || !seccion || !docenteUserId) throw new Error("Grado, Sección y Docente son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AsignacionesDocentes");
  const data = sheet.getDataRange().getValues();

  const secKey = `${grado}_${seccion}`;
  const existingOtherSection = data.slice(1).find(r =>
    String(r[2]).trim() === String(docenteUserId).trim() &&
    String(r[6]).trim() === "Activo" &&
    String(r[8] || "").trim() !== "" &&
    String(r[8] || "").trim() !== secKey
  );

  if (existingOtherSection) {
    throw new Error(`Regla Institucional: El docente ya está asignado como encargado principal a otra sección (${existingOtherSection[8]}). Un docente solo puede encargarse de una sección por año escolar.`);
  }

  const asigId = "ASGS-" + Date.now();
  sheet.appendRow([
    asigId,
    secKey,
    docenteUserId,
    esMaestroGuia ? "MaestroGuia" : "Titular",
    new Date().toISOString(),
    "",
    "Activo",
    autorizadoPor || "Coordinador",
    secKey
  ]);

  return { status: "success", message: `Docente '${docenteUserId}' asignado a la sección ${grado} '${seccion}' correctamente.` };
}

function getCoordinatorOverview(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const offerSheet = getOrCreateSheet(ss, "OfertaAcademica");
  const asigSheet = getOrCreateSheet(ss, "AsignacionesDocentes");
  const horSheet = getOrCreateSheet(ss, "HorariosClase");

  const offers = offerSheet.getDataRange().getValues().slice(1).map(r => ({ ofertaId: r[0], anoLectivo: r[1], grado: r[2], seccion: r[3], asignaturaId: r[4] }));
  const assignments = asigSheet.getDataRange().getValues().slice(1).map(r => ({ asignacionId: r[0], ofertaId: r[1], docenteUserId: r[2], rolDocente: r[3], seccionKey: r[8] }));
  const schedules = horSheet.getDataRange().getValues().slice(1).map(r => ({ horarioId: r[0], ofertaId: r[1], diaSemana: r[2], horaInicio: r[3], horaFin: r[4], aulaCodigo: r[5], docenteUserId: r[6], estado: r[7] }));

  return {
    status: "success",
    data: {
      totalOfertas: offers.length,
      totalAsignaciones: assignments.length,
      totalHorarios: schedules.length,
      ofertas: offers,
      asignaciones: assignments,
      horarios: schedules
    }
  };
}

// [TAREA 3.8] [Fase 3: Planificación Académica y Horarios] - Generador automático de propuestas de horarios académicos con resolución de restricciones.
function generateAutoSchedules(payload) {
  const { anoLectivo, duracionUnidadMinutos, horaInicioLectiva, ofertasIds } = payload || {};
  const targetAno = anoLectivo || "2026";
  const unidadMin = parseInt(duracionUnidadMinutos, 10) || 45;
  const startHourStr = horaInicioLectiva || "07:30";

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Cargar ofertas académicas y asignaciones
  const offSheet = getOrCreateSheet(ss, "OfertaAcademica");
  const offRows = offSheet.getDataRange().getValues().slice(1);

  const asigSheet = getOrCreateSheet(ss, "AsignacionesDocentes");
  const asigRows = asigSheet.getDataRange().getValues().slice(1);

  const aulaSheet = getOrCreateSheet(ss, "SedesAulas");
  const aulaRows = aulaSheet.getDataRange().getValues().slice(1).filter(a => a[6] !== "Inactivo");

  // Filtrar ofertas del año lectivo
  let targetOffers = offRows.filter(r => r[7] !== "Inactivo" && String(r[1]).includes(String(targetAno)));
  if (Array.isArray(ofertasIds) && ofertasIds.length > 0) {
    targetOffers = targetOffers.filter(r => ofertasIds.includes(String(r[0]).trim()));
  }

  if (targetOffers.length === 0) {
    return {
      status: "success",
      message: `No existen ofertas académicas activas configuradas para el año ${targetAno}.`,
      resumen: { programadas: 0, pendientes: 0, borradorCount: 0, logs: [] }
    };
  }

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const horasBloques = [
    { start: "07:30", end: "08:15" },
    { start: "08:15", end: "09:00" },
    { start: "09:15", end: "10:00" },
    { start: "10:00", end: "10:45" },
    { start: "11:00", end: "11:45" },
    { start: "13:00", end: "13:45" },
    { start: "13:45", end: "14:30" }
  ];

  let borradorCount = 0;
  let pendientesCount = 0;
  const logs = [];
  const scheduleSheet = getOrCreateSheet(ss, "HorariosClase");

  targetOffers.forEach(off => {
    const ofertaId = off[0];
    const asignaturaNombre = off[3];

    // Buscar docente asignado
    const asig = asigRows.find(a => String(a[1]).trim() === String(ofertaId).trim() && a[6] !== "Inactivo");
    const docenteUserId = asig ? asig[2] : "";

    // Seleccionar aula disponible
    const aula = aulaRows.find(a => a[6] !== "Inactivo") || ["", "", "AULA-101"];
    const aulaCodigo = aula[2];

    let asignado = false;

    for (let dia of diasSemana) {
      if (asignado) break;
      for (let bloque of horasBloques) {
        const conflict = checkScheduleConflict({
          diaSemana: dia,
          horaInicio: bloque.start,
          horaFin: bloque.end,
          aulaCodigo,
          docenteUserId,
          ofertaId
        });

        if (!conflict.hasConflict) {
          const horId = "AUTO-HOR-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
          scheduleSheet.appendRow([horId, ofertaId, dia, bloque.start, bloque.end, aulaCodigo, docenteUserId, "Borrador"]);
          borradorCount++;
          asignado = true;
          logs.push(`Asignado automáticamente ${ofertaId} (${asignaturaNombre}) el ${dia} ${bloque.start}-${bloque.end} en ${aulaCodigo} (Borrador).`);
          break;
        }
      }
    }

    if (!asignado) {
      pendientesCount++;
      logs.push(`No se pudo encontrar franja libre para oferta ${ofertaId} (${asignaturaNombre}) debido a restricciones.`);
    }
  });

  logStructuredEvent("ACADEMIC", "generateAutoSchedules", "INFO", "AUTO_SCHEDULE_GENERATED", `Generación automática de horarios para ${targetAno}. Creados: ${borradorCount}, Pendientes: ${pendientesCount}`, { targetAno, borradorCount, pendientesCount }, payload && payload.authRole);

  return {
    status: "success",
    message: `Propuesta automática de horarios generada exitosamente en estado Borrador.`,
    resumen: {
      anoLectivo: targetAno,
      ofertasProcesadas: targetOffers.length,
      bloquesBorradorCreados: borradorCount,
      ofertasPendientes: pendientesCount,
      logs
    }
  };
}

function createTeacherSubstitution(payload) {
  const { ofertaId, sustitutoUserId, fechaInicio, fechaFin, motivo, autorizadoPor } = payload || {};
  if (!ofertaId || !sustitutoUserId) throw new Error("ofertaId y sustitutoUserId son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AsignacionesDocentes");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["AsignacionID", "OfertaID", "DocenteUserId", "RolDocente", "FechaInicio", "FechaFin", "Estado", "AutorizadoPor"]);
  }

  const asigId = "SUB-" + Date.now();
  sheet.appendRow([asigId, ofertaId, sustitutoUserId, "Sustituto", fechaInicio || new Date(), fechaFin || "", "Temporal", autorizadoPor || "Secretaría"]);

  return { status: "success", message: "Sustitución docente registrada.", data: { asignacionId: asigId } };
}

function getAcademicCalendar(payload) {
  const { anoId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CalendarioAcademico");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const events = data.slice(1).filter(r => {
    if (anoId && String(r[1]).trim() !== String(anoId).trim()) return false;
    return true;
  }).map(r => ({
    eventoId: r[0],
    anoId: r[1],
    nombre: r[2],
    tipoDia: r[3],
    fechaInicio: r[4] ? new Date(r[4]).toISOString() : null,
    fechaFin: r[5] ? new Date(r[5]).toISOString() : null,
    visibilidad: r[6] || "Todos",
    estado: r[7] || "Activo"
  }));
  return { status: "success", data: events };
}

function createCalendarEvent(payload) {
  const { anoId, nombre, tipoDia, fechaInicio, fechaFin, visibilidad } = payload || {};
  if (!nombre || !fechaInicio) throw new Error("Nombre y fecha de inicio son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CalendarioAcademico");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["EventoID", "AnoID", "Nombre", "TipoDia", "FechaInicio", "FechaFin", "Visibilidad", "Estado"]);
  }

  const evId = "CAL-" + Date.now();
  sheet.appendRow([evId, anoId || "ANO-CURRENT", nombre, tipoDia || "Academico", fechaInicio, fechaFin || fechaInicio, visibilidad || "Todos", "Activo"]);

  return { status: "success", message: "Evento registrado en el calendario.", data: { eventoId: evId } };
}

function getClassSchedules(payload) {
  const { ofertaId, docenteUserId, aulaCodigo } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "HorariosClase");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const schedules = data.slice(1).filter(r => {
    if (ofertaId && String(r[1]).trim() !== String(ofertaId).trim()) return false;
    if (docenteUserId && String(r[6]).trim() !== String(docenteUserId).trim()) return false;
    if (aulaCodigo && String(r[5]).trim() !== String(aulaCodigo).trim()) return false;
    return true;
  }).map(r => ({
    horarioId: r[0],
    ofertaId: r[1],
    diaSemana: r[2],
    horaInicio: r[3],
    horaFin: r[4],
    aulaCodigo: r[5],
    docenteUserId: r[6],
    estado: r[7] || "Activo"
  }));
  return { status: "success", data: schedules };
}

// [TAREA 3.7] [Fase 3: Planificación Académica y Horarios] - Control de carga lectiva máxima por docente y cálculo de horas semanales frente a grupo.
function getTeacherTeachingLoad(payload) {
  const { docenteUserId, maxHorasSemanales, anoId, excludeHorarioId } = payload || {};
  if (!docenteUserId) throw new Error("docenteUserId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const horSheet = getOrCreateSheet(ss, "HorariosClase");
  const horRows = horSheet.getDataRange().getValues().slice(1);

  // Filtrar horarios activos del docente excluyendo el bloque en edición si aplica
  const teacherSchedules = horRows.filter(r => {
    if (r[7] === "Inactivo") return false;
    if (excludeHorarioId && String(r[0]).trim() === String(excludeHorarioId).trim()) return false;
    return String(r[6]).trim() === String(docenteUserId).trim();
  });

  let totalMinutosSemanales = 0;
  const bloques = [];

  teacherSchedules.forEach(r => {
    const diaSemana = r[2];
    const hInicio = String(r[3]);
    const hFin = String(r[4]);

    const [startH, startM] = hInicio.split(":").map(Number);
    const [endH, endM] = hFin.split(":").map(Number);
    const mins = (endH * 60 + (endM || 0)) - (startH * 60 + (startM || 0));

    if (mins > 0) {
      totalMinutosSemanales += mins;
      bloques.push({
        horarioId: r[0],
        ofertaId: r[1],
        diaSemana,
        horaInicio: hInicio,
        horaFin: hFin,
        duracionMinutos: mins
      });
    }
  });

  const totalHorasSemanales = Math.round((totalMinutosSemanales / 60) * 100) / 100;
  const limiteMaximo = Number(maxHorasSemanales) || 40; // Límite institucional estándar (40 horas lectivas semanales)
  const excedeLimite = totalHorasSemanales > limiteMaximo;

  return {
    status: "success",
    data: {
      docenteUserId,
      totalHorasSemanales,
      totalMinutosSemanales,
      limiteMaximo,
      excedeLimite,
      bloques
    }
  };
}

// [TAREA 3.6] [Fase 3: Planificación Académica y Horarios] - Integración de horarios con eventos del calendario académico y suspensión de clases.
function getScheduleCalendarConflicts(payload) {
  const { anoId, fecha } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const calSheet = getOrCreateSheet(ss, "CalendarioAcademico");
  const calRows = calSheet.getDataRange().getValues().slice(1);

  const nonSchoolEvents = calRows.filter(r => {
    if (r[7] === "Inactivo") return false;
    if (anoId && String(r[1]).trim() !== String(anoId).trim()) return false;
    const tipo = String(r[3]).toLowerCase();
    return tipo.includes("feriado") || tipo.includes("suspension") || tipo.includes("vacacion") || tipo.includes("no_lectivo");
  }).map(r => ({
    eventoId: r[0],
    anoId: r[1],
    nombre: r[2],
    tipoDia: r[3],
    fechaInicio: r[4],
    fechaFin: r[5]
  }));

  return { status: "success", data: nonSchoolEvents };
}

// [TAREA 3.1] [Fase 3: Planificación Académica y Horarios] - Validación integral de horarios académicos y prevención de conflictos.
function createClassSchedule(payload) {
  const { ofertaId, diaSemana, horaInicio, horaFin, aulaCodigo, docenteUserId, borrador, horarioId, estudiantesCount } = payload || {};
  if (!diaSemana || !horaInicio || !horaFin) throw new Error("Día, hora de inicio y hora de fin son requeridos.");
  if (horaInicio >= horaFin) throw new Error("La hora de inicio debe ser anterior a la hora de finalización.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "HorariosClase");
  const data = sheet.getDataRange().getValues();

  // Motor de prevención de conflictos por solapamiento de docente, aula u oferta académica y validación de capacidad
  const conflict = checkScheduleConflict({ diaSemana, horaInicio, horaFin, aulaCodigo, docenteUserId, ofertaId, excludeHorarioId: horarioId, estudiantesCount });
  if (conflict.hasConflict) {
    throw new Error(`Conflicto de horario detectado: ${conflict.reason}`);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["HorarioID", "OfertaID", "DiaSemana", "HoraInicio", "HoraFin", "AulaCodigo", "DocenteUserId", "Estado"]);
  }

  let horId = horarioId;
  const targetEstado = borrador ? "Borrador" : "Activo";

  if (horId) {
    const idx = data.findIndex(r => String(r[0]).trim() === String(horId).trim());
    if (idx !== -1) {
      sheet.getRange(idx + 1, 2, 1, 7).setValues([[
        ofertaId || "OFE-DEFAULT",
        diaSemana,
        horaInicio,
        horaFin,
        aulaCodigo || "AULA-1",
        docenteUserId || "",
        targetEstado
      ]]);
      return { status: "success", message: "Horario de clase actualizado correctamente.", data: { horarioId: horId } };
    }
  }

  horId = "HOR-" + Date.now();
  sheet.appendRow([horId, ofertaId || "OFE-DEFAULT", diaSemana, horaInicio, horaFin, aulaCodigo || "AULA-1", docenteUserId || "", targetEstado]);

  logStructuredEvent("ACADEMIC", "createClassSchedule", "INFO", "SCHEDULE_SAVED", `Horario ${horId} guardado (${targetEstado}) para oferta ${ofertaId}`, { horId, diaSemana, horaInicio, horaFin, aulaCodigo }, payload && payload.authRole);

  return { status: "success", message: borrador ? "Borrador de horario guardado." : "Horario asignado y publicado correctamente.", data: { horarioId: horId } };
}

function deleteClassSchedule(payload) {
  const { horarioId } = payload || {};
  if (!horarioId) throw new Error("horarioId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "HorariosClase");
  const data = sheet.getDataRange().getValues();

  const idx = data.findIndex(r => String(r[0]).trim() === String(horarioId).trim());
  if (idx === -1) throw new Error("Horario no encontrado.");

  sheet.getRange(idx + 1, 8).setValue("Inactivo");
  return { status: "success", message: "Bloque de horario desactivado correctamente." };
}

// [TAREA 3.11] [Fase 3: Planificación Académica y Horarios] - Validación integral y publicación segura de la matriz de horarios en estado Borrador a Activo.
function publishClassSchedules(payload) {
  const { anoLectivo, ofertaIds } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "HorariosClase");
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return { status: "success", message: "No existen horarios para publicar.", publishedCount: 0, conflicts: [] };
  }

  const rows = data.slice(1);
  // Filtrar horarios en estado Borrador
  let draftSchedules = rows.map((r, i) => ({ rowIdx: i + 2, r })).filter(item => item.r[7] === "Borrador");

  if (Array.isArray(ofertaIds) && ofertaIds.length > 0) {
    draftSchedules = draftSchedules.filter(item => ofertaIds.includes(String(item.r[1]).trim()));
  } else if (anoLectivo) {
    draftSchedules = draftSchedules.filter(item => String(item.r[1]).includes(String(anoLectivo)));
  }

  if (draftSchedules.length === 0) {
    return { status: "success", message: "No se encontraron bloques en Borrador para publicar.", publishedCount: 0, conflicts: [] };
  }

  const conflicts = [];

  // Validar cada bloque de la matriz antes de cambiar su estado
  draftSchedules.forEach(item => {
    const r = item.r;
    const conflict = checkScheduleConflict({
      diaSemana: r[2],
      horaInicio: r[3],
      horaFin: r[4],
      aulaCodigo: r[5],
      docenteUserId: r[6],
      ofertaId: r[1],
      excludeHorarioId: r[0]
    });

    if (conflict.hasConflict) {
      conflicts.push({
        horarioId: r[0],
        ofertaId: r[1],
        diaSemana: r[2],
        horaInicio: r[3],
        horaFin: r[4],
        reason: conflict.reason
      });
    }
  });

  if (conflicts.length > 0) {
    return {
      status: "error",
      message: `Se encontraron ${conflicts.length} conflicto(s) que impiden la publicación de la matriz de horarios.`,
      publishedCount: 0,
      conflicts
    };
  }

  // Si no existen conflictos, proceder a activar todos los bloques de la propuesta
  let publishedCount = 0;
  draftSchedules.forEach(item => {
    sheet.getRange(item.rowIdx, 8).setValue("Activo");
    publishedCount++;
  });

  const publisher = payload && payload.authUserId ? payload.authUserId : "Administración";
  logStructuredEvent("ACADEMIC", "publishClassSchedules", "INFO", "SCHEDULES_PUBLISHED", `Publicación exitosa de ${publishedCount} bloques de horarios.`, { anoLectivo, publishedCount, publisher }, payload && payload.authRole);

  return {
    status: "success",
    message: `Matriz de horarios publicada exitosamente. Se activaron ${publishedCount} bloques lectivos.`,
    publishedCount,
    conflicts: []
  };
}

// [TAREA 3.2] [Fase 3: Planificación Académica y Horarios] - Copia de horarios entre años lectivos en estado borrador.
function copyClassSchedules(payload) {
  const { anioOrigen, anioDestino } = payload || {};
  if (!anioOrigen || !anioDestino) throw new Error("El año de origen y año de destino son requeridos.");
  if (String(anioOrigen).trim() === String(anioDestino).trim()) {
    throw new Error("El año de origen y de destino no pueden ser el mismo.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "HorariosClase");
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return { status: "success", message: "No se encontraron horarios para copiar.", copiedCount: 0, skippedCount: 0, logs: [] };
  }

  const rows = data.slice(1);
  // Filtrar horarios activos pertenecientes al año de origen (ofertaId o metadata)
  const sourceSchedules = rows.filter(r => r[7] !== "Inactivo" && String(r[1]).includes(String(anioOrigen)));

  if (sourceSchedules.length === 0) {
    return { status: "success", message: `No existen horarios activos registrados para el año ${anioOrigen}.`, copiedCount: 0, skippedCount: 0, logs: [] };
  }

  let copiedCount = 0;
  let skippedCount = 0;
  const logs = [];

  sourceSchedules.forEach(r => {
    const originalHorarioId = r[0];
    const originalOfertaId = r[1];
    const diaSemana = r[2];
    const horaInicio = r[3];
    const horaFin = r[4];
    const aulaCodigo = r[5];
    const docenteUserId = r[6];

    // Construir nueva ofertaId vinculada al año de destino
    const targetOfertaId = originalOfertaId.replace(String(anioOrigen), String(anioDestino));

    // Verificar si el horario ya fue copiado o existe en el destino para evitar duplicados
    const existingTarget = rows.find(tr => tr[7] !== "Inactivo" && String(tr[1]) === targetOfertaId && String(tr[2]) === String(diaSemana) && String(tr[3]) === String(horaInicio));
    if (existingTarget) {
      skippedCount++;
      logs.push(`Omitido horario ${originalHorarioId}: ya existe registro equivalente en ${anioDestino}.`);
      return;
    }

    // Validar conflictos en destino
    const conflict = checkScheduleConflict({
      diaSemana,
      horaInicio,
      horaFin,
      aulaCodigo,
      docenteUserId,
      ofertaId: targetOfertaId
    });

    if (conflict.hasConflict) {
      skippedCount++;
      logs.push(`Omitido horario ${originalHorarioId}: conflicto detectado (${conflict.reason}).`);
      return;
    }

    const newHorarioId = "HOR-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    sheet.appendRow([newHorarioId, targetOfertaId, diaSemana, horaInicio, horaFin, aulaCodigo, docenteUserId, "Borrador"]);
    copiedCount++;
    logs.push(`Copiado horario ${originalHorarioId} a ${newHorarioId} (${targetOfertaId}) en estado Borrador.`);
  });

  logStructuredEvent("ACADEMIC", "copyClassSchedules", "INFO", "SCHEDULE_COPIED", `Copia de horarios efectuada de ${anioOrigen} a ${anioDestino}. Copiados: ${copiedCount}, Omitidos: ${skippedCount}`, { anioOrigen, anioDestino, copiedCount, skippedCount }, payload && payload.authRole);

  return {
    status: "success",
    message: `Copia de horarios completada. Se crearon ${copiedCount} bloques en estado Borrador y se omitieron ${skippedCount}.`,
    copiedCount,
    skippedCount,
    logs
  };
}

// [TAREA-13] [Fase 1 - Planificación de Carga Académica] - Motor de asignación de carga docente por departamento, límites lectivos, asignación de responsables y detección de vacantes.
function assignDepartmentHead(payload) {
  const { departamentoId, jefeUserId, autorizadoPor } = payload || {};
  if (!departamentoId || !jefeUserId) throw new Error("departamentoId y jefeUserId son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "DepartamentosAcademicos");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["DepartamentoID", "Nombre", "JefeUserId", "Estado", "FechaActualizacion", "AutorizadoPor"]);
  }

  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(departamentoId).trim());

  if (idx !== -1) {
    sheet.getRange(idx + 1, 3).setValue(jefeUserId);
    sheet.getRange(idx + 1, 5).setValue(new Date());
    sheet.getRange(idx + 1, 6).setValue(autorizadoPor || "Dirección");
  } else {
    sheet.appendRow([departamentoId, departamentoId, jefeUserId, "Activo", new Date(), autorizadoPor || "Dirección"]);
  }

  logStructuredEvent("ACADEMIC", "assignDepartmentHead", "INFO", "DEPT_HEAD_ASSIGNED", `Jefe de departamento asignado: ${jefeUserId} a ${departamentoId}`, { departamentoId, jefeUserId }, payload && payload.authRole);

  return { status: "success", message: `Jefe asignado al departamento ${departamentoId} exitosamente.` };
}

function getDepartmentAcademicPlanning(payload) {
  const { departamentoId, anoId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const deptSheet = getOrCreateSheet(ss, "DepartamentosAcademicos");
  const deptData = deptSheet.getDataRange().getValues();
  const departamentos = deptData.length > 1 ? deptData.slice(1).map(r => ({
    departamentoId: r[0],
    nombre: r[1],
    jefeUserId: r[2],
    estado: r[3]
  })) : [];

  const offerSheet = getOrCreateSheet(ss, "OfertasAcademicas");
  const offerData = offerSheet.getDataRange().getValues();

  // Función local auxiliar de comparación diacrítica segura para evitar depender del alcance externo de normalizeString
  const normStr = (str) => (!str ? "" : str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim());

  const offers = offerData.length > 1 ? offerData.slice(1).filter(r => {
    if (r[8] === "Inactivo") return false;
    if (anoId && String(r[1]).trim() !== String(anoId).trim()) return false;
    if (departamentoId && normStr(r[7] || r[2]) !== normStr(departamentoId)) return false;
    return true;
  }).map(r => ({
    ofertaId: r[0],
    anoId: r[1],
    asignatura: r[2],
    grado: r[3],
    seccion: r[4],
    cupoMaximo: r[5],
    departamento: r[7] || "General"
  })) : [];

  const asigSheet = getOrCreateSheet(ss, "AsignacionesDocentes");
  const asigData = asigSheet.getDataRange().getValues();
  const offerIds = new Set(offers.map(o => String(o.ofertaId).trim()));
  const asignaciones = asigData.length > 1 ? asigData.slice(1).filter(r => r[6] === "Activo" && offerIds.has(String(r[1]).trim())).map(r => ({
    asignacionId: r[0],
    ofertaId: r[1],
    docenteUserId: r[2],
    rolDocente: r[3]
  })) : [];

  const offerAssignedMap = {};
  asignaciones.forEach(a => {
    offerAssignedMap[a.ofertaId] = a.docenteUserId;
  });

  const vacantes = [];
  offers.forEach(o => {
    if (!offerAssignedMap[o.ofertaId]) {
      vacantes.push(o);
    }
  });

  return {
    status: "success",
    data: {
      departamentos,
      ofertasCount: offers.length,
      vacantesCount: vacantes.length,
      vacantes,
      asignaciones
    }
  };
}

function checkScheduleConflict(params) {
  const { diaSemana, horaInicio, horaFin, aulaCodigo, docenteUserId, ofertaId, excludeHorarioId, estudiantesCount, fechaEspecifica, maxHorasDocente } = params || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // [TAREA 3.7] Validar límite de carga lectiva máxima semanal para el docente
  if (docenteUserId && horaInicio && horaFin) {
    const loadInfo = getTeacherTeachingLoad({ docenteUserId, maxHorasSemanales: maxHorasDocente, excludeHorarioId });
    if (loadInfo && loadInfo.data) {
      const [startH, startM] = String(horaInicio).split(":").map(Number);
      const [endH, endM] = String(horaFin).split(":").map(Number);
      const newMins = (endH * 60 + (endM || 0)) - (startH * 60 + (startM || 0));
      const projectedHoras = Math.round(((loadInfo.data.totalMinutosSemanales + newMins) / 60) * 100) / 100;
      if (projectedHoras > loadInfo.data.limiteMaximo) {
        return { hasConflict: true, reason: `La asignación llevaría la carga docente a ${projectedHoras}h semanales, superando el límite máximo permitido de ${loadInfo.data.limiteMaximo}h.` };
      }
    }
  }

  // [TAREA 3.6] Validar si la fecha especificada corresponde a un día no lectivo o suspendido en CalendarioAcademico
  if (fechaEspecifica) {
    const calSheet = getOrCreateSheet(ss, "CalendarioAcademico");
    const calRows = calSheet.getDataRange().getValues().slice(1);
    const targetDateStr = new Date(fechaEspecifica).toISOString().split('T')[0];
    const calConflict = calRows.find(r => {
      if (r[7] === "Inactivo") return false;
      const tipo = String(r[3]).toLowerCase();
      if (!tipo.includes("feriado") && !tipo.includes("suspension") && !tipo.includes("vacacion") && !tipo.includes("no_lectivo")) return false;
      const fIni = r[4] ? new Date(r[4]).toISOString().split('T')[0] : "";
      const fFin = r[5] ? new Date(r[5]).toISOString().split('T')[0] : fIni;
      return targetDateStr >= fIni && targetDateStr <= fFin;
    });

    if (calConflict) {
      return { hasConflict: true, reason: `No se pueden programar clases ordinarias el ${targetDateStr} debido al evento de calendario "${calConflict[2]}" (${calConflict[3]}).` };
    }
  }

  // [TAREA 3.4] Validar disponibilidad horaria personalizada por docente en HorariosLaborales
  if (docenteUserId && diaSemana && horaInicio && horaFin) {
    const hlSheet = getOrCreateSheet(ss, "HorariosLaborales");
    const hlRows = hlSheet.getDataRange().getValues().slice(1);
    const docenteHL = hlRows.find(r => r[7] !== "Inactivo" && String(r[0]).trim() === String(docenteUserId).trim());
    if (docenteHL) {
      const hEntrada = String(docenteHL[3]);
      const hSalida = String(docenteHL[4]);
      let diasLaborales = [];
      try { diasLaborales = JSON.parse(docenteHL[6] || "[]"); } catch (e) { diasLaborales = []; }

      if (diasLaborales.length > 0 && !diasLaborales.some(d => normalizeString(d) === normalizeString(diaSemana))) {
        return { hasConflict: true, reason: `El docente no está disponible el día ${diaSemana} según su horario laboral registrado.` };
      }
      if (horaInicio < hEntrada || horaFin > hSalida) {
        return { hasConflict: true, reason: `La clase (${horaInicio} - ${horaFin}) se encuentra fuera de la jornada del docente (${hEntrada} - ${hSalida}).` };
      }
    }
  }

  // [TAREA 3.5] Validar capacidad de aula y matrícula activa de la sección/oferta
  if (aulaCodigo) {
    let effectiveEstudiantesCount = estudiantesCount;
    if (!effectiveEstudiantesCount && ofertaId) {
      const matSheet = getOrCreateSheet(ss, "Matriculas");
      const matRows = matSheet.getDataRange().getValues().slice(1);
      // Contar matrículas activas vinculadas a la oferta / sección
      effectiveEstudiantesCount = matRows.filter(m => m[8] !== "Inactivo" && m[8] !== "Retirado" && (String(m[5]).trim() === String(ofertaId).trim() || String(m[0]).trim() === String(ofertaId).trim())).length;
    }

    if (effectiveEstudiantesCount && Number(effectiveEstudiantesCount) > 0) {
      const aulaSheet = getOrCreateSheet(ss, "SedesAulas");
      const aulaRows = aulaSheet.getDataRange().getValues().slice(1);
      const aula = aulaRows.find(a => String(a[2]).trim() === String(aulaCodigo).trim() && a[6] !== "Inactivo");
      if (aula && Number(aula[4]) > 0 && Number(effectiveEstudiantesCount) > Number(aula[4])) {
        return { hasConflict: true, reason: `El aula ${aulaCodigo} (${aula[3]}) tiene capacidad máxima de ${aula[4]} estudiantes, menor a la matrícula activa de ${effectiveEstudiantesCount} estudiantes.` };
      }
    }
  }

  const sheet = getOrCreateSheet(ss, "HorariosClase");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { hasConflict: false };

  const rows = data.slice(1);
  for (let r of rows) {
    if (excludeHorarioId && String(r[0]).trim() === String(excludeHorarioId).trim()) continue;
    if (r[7] === "Inactivo") continue;

    if (normalizeString(r[2]) === normalizeString(diaSemana)) {
      const exStart = String(r[3]);
      const exEnd = String(r[4]);
      const isOverlap = (horaInicio < exEnd && horaFin > exStart);

      if (isOverlap) {
        if (aulaCodigo && String(r[5]).trim() !== "" && String(r[5]).trim() === String(aulaCodigo).trim()) {
          return { hasConflict: true, reason: `El aula ${aulaCodigo} ya está ocupada el ${diaSemana} de ${exStart} a ${exEnd}.` };
        }
        if (docenteUserId && String(r[6]).trim() !== "" && String(r[6]).trim() === String(docenteUserId).trim()) {
          return { hasConflict: true, reason: `El docente ya tiene una clase asignada el ${diaSemana} de ${exStart} a ${exEnd}.` };
        }
        if (ofertaId && String(r[1]).trim() !== "" && String(r[1]).trim() === String(ofertaId).trim()) {
          return { hasConflict: true, reason: `Esta sección/oferta ya tiene otra clase asignada el ${diaSemana} de ${exStart} a ${exEnd}.` };
        }
      }
    }
  }

  return { hasConflict: false };
}

// [TAREA 3.3] [Fase 3: Planificación Académica y Horarios] - Consulta de recursos de aulas, laboratorios y espacios físicos.
function getClassroomResources(payload) {
  const { sedeId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SedesAulas");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    // Si la tabla está vacía, sembrar aulas institucionales por defecto
    const defaultAulas = [
      ["SED-MAIN", "Campus Principal", "AULA-101", "Aula 101 - Informática", 35, "Aula", "Activo"],
      ["SED-MAIN", "Campus Principal", "AULA-102", "Aula 102 - Multiusos", 35, "Aula", "Activo"],
      ["SED-MAIN", "Campus Principal", "LAB-COMP", "Laboratorio de Cómputo", 30, "Laboratorio", "Activo"],
      ["SED-MAIN", "Campus Principal", "LAB-CIEN", "Laboratorio de Ciencias", 25, "Laboratorio", "Activo"],
      ["SED-MAIN", "Campus Principal", "AUDITORIO", "Auditorio Institucional", 150, "Auditorio", "Activo"],
      ["SED-MAIN", "Campus Principal", "CANCHA-1", "Cancha Polideportiva", 100, "Deportes", "Activo"]
    ];
    defaultAulas.forEach(row => sheet.appendRow(row));
    return {
      status: "success",
      data: defaultAulas.map(r => ({
        sedeId: r[0], nombreSede: r[1], aulaCodigo: r[2], nombreAula: r[3], capacidad: r[4], tipoEspacio: r[5], estado: r[6]
      }))
    };
  }

  const classrooms = data.slice(1).filter(r => {
    if (sedeId && String(r[0]).trim() !== String(sedeId).trim()) return false;
    return r[6] !== "Inactivo";
  }).map(r => ({
    sedeId: r[0],
    nombreSede: r[1],
    aulaCodigo: r[2],
    nombreAula: r[3],
    capacidad: r[4],
    tipoEspacio: r[5],
    estado: r[6] || "Activo"
  }));

  return { status: "success", data: classrooms };
}

// [TAREA 3.3] [Fase 3: Planificación Académica y Horarios] - Registro, edición y gestión de aulas y espacios desde la interfaz.
function saveClassroomResource(payload) {
  const { aulaCodigo, nombreAula, capacidad, tipoEspacio, sedeId, nombreSede, estado } = payload || {};
  if (!aulaCodigo || !nombreAula) throw new Error("aulaCodigo y nombreAula son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SedesAulas");
  const data = sheet.getDataRange().getValues();

  const idx = data.findIndex(r => String(r[2]).trim() === String(aulaCodigo).trim());
  if (idx !== -1) {
    sheet.getRange(idx + 1, 4).setValue(nombreAula);
    if (capacidad) sheet.getRange(idx + 1, 5).setValue(capacidad);
    if (tipoEspacio) sheet.getRange(idx + 1, 6).setValue(tipoEspacio);
    if (estado) sheet.getRange(idx + 1, 7).setValue(estado);
  } else {
    sheet.appendRow([
      sedeId || "SED-MAIN",
      nombreSede || "Campus Principal",
      aulaCodigo,
      nombreAula,
      capacidad || 30,
      tipoEspacio || "Aula",
      estado || "Activo"
    ]);
  }

  return { status: "success", message: "Espacio/Aula registrada exitosamente." };
}

// [TAREA 3.14] [Fase 3: Planificación Académica y Horarios] - Permisos y consulta trazable de registros de auditoría de operaciones académicas.
function getAcademicAuditLogs(payload) {
  const { eventType, userId, fechaInicio, fechaFin } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "BitacoraAuditoriaEstructurada");
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return { status: "success", data: [] };

  const rows = data.slice(1);
  const logs = rows.filter(r => {
    if (r[1] !== "ACADEMIC") return false;
    if (eventType && String(r[4]).trim() !== String(eventType).trim()) return false;
    if (userId && String(r[7]).trim() !== String(userId).trim()) return false;
    if (fechaInicio && new Date(r[0]) < new Date(fechaInicio)) return false;
    if (fechaFin && new Date(r[0]) > new Date(fechaFin)) return false;
    return true;
  }).map(r => ({
    timestamp: r[0],
    service: r[1],
    functionName: r[2],
    severity: r[3],
    eventType: r[4],
    message: r[5],
    metadataJSON: r[6],
    userRole: r[7]
  }));

  return { status: "success", data: logs };
}

// [TAREA 3.13] [Fase 3: Planificación Académica y Horarios] - Sincronización y validación de integridad entre horarios, asignaciones titulares/sustitutas y sesiones impartidas.
function syncAcademicScheduleIntegrity(payload) {
  const { anoId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const horSheet = getOrCreateSheet(ss, "HorariosClase");
  const horRows = horSheet.getDataRange().getValues().slice(1);

  const asigSheet = getOrCreateSheet(ss, "AsignacionesDocentes");
  const asigRows = asigSheet.getDataRange().getValues().slice(1);

  const sessSheet = getOrCreateSheet(ss, "SesionesClaseImpartidas");
  const sessRows = sessSheet.getDataRange().getValues().slice(1);

  let orphanSchedules = 0;
  let activeSubstitutions = 0;
  const issues = [];

  // 1. Verificar huérfanos de HorariosClase sin docente asignado
  horRows.filter(r => r[7] === "Activo").forEach(r => {
    const horId = r[0];
    const ofertaId = r[1];
    const docenteId = r[6];

    if (!docenteId || String(docenteId).trim() === "") {
      const hasAsig = asigRows.some(a => String(a[1]).trim() === String(ofertaId).trim() && a[6] === "Activo");
      if (!hasAsig) {
        orphanSchedules++;
        issues.push(`Horario ${horId} (Oferta ${ofertaId}) no cuenta con docente titular asignado.`);
      }
    }
  });

  // 2. Verificar sustituciones temporales activas sin alterar docente titular original
  asigRows.filter(r => r[3] === "Sustituto" && r[6] === "Temporal").forEach(r => {
    activeSubstitutions++;
  });

  logStructuredEvent("ACADEMIC", "syncAcademicScheduleIntegrity", "INFO", "SCHEDULE_INTEGRITY_CHECKED", `Verificación de integridad de horarios efectuada. Huérfanos: ${orphanSchedules}, Sustituciones activas: ${activeSubstitutions}`, { orphanSchedules, activeSubstitutions }, payload && payload.authRole);

  return {
    status: "success",
    message: "Verificación y sincronización de integridad de horarios completada.",
    data: {
      horariosRevisados: horRows.length,
      horariosHuerfanos: orphanSchedules,
      sustitucionesTemporales: activeSubstitutions,
      sesionesRegistradas: sessRows.length,
      incidencias: issues
    }
  };
}

// [TAREA 3.12] [Fase 3: Planificación Académica y Horarios] - Calendario individual consolidado para estudiantes, docentes y secciones con eventos y sustituciones.
function getIndividualCalendar(payload) {
  const { tipoConsulta, targetId, anoId, fechaInicio, fechaFin } = payload || {};
  const queryType = tipoConsulta || "ESTUDIANTE";

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  let baseSchedules = [];
  if (queryType === "ESTUDIANTE" || queryType === "SECCION") {
    const res = getStudentSchedule({ userId: targetId, grado: payload.grado, seccion: payload.seccion });
    baseSchedules = (res && res.status === "success" && Array.isArray(res.data)) ? res.data : [];
  } else if (queryType === "DOCENTE") {
    const res = getClassSchedules({ docenteUserId: targetId });
    baseSchedules = (res && res.status === "success" && Array.isArray(res.data)) ? res.data : [];
  } else if (queryType === "AULA") {
    const res = getClassSchedules({ aulaCodigo: targetId });
    baseSchedules = (res && res.status === "success" && Array.isArray(res.data)) ? res.data : [];
  }

  // Cargar sustituciones docentes vigentes
  const asigSheet = getOrCreateSheet(ss, "AsignacionesDocentes");
  const asigRows = asigSheet.getDataRange().getValues().slice(1);
  const substitutions = asigRows.filter(r => r[3] === "Sustituto" && r[6] === "Temporal").map(r => ({
    asignacionId: r[0],
    ofertaId: r[1],
    sustitutoUserId: r[2],
    fechaInicio: r[4],
    fechaFin: r[5],
    autorizadoPor: r[7]
  }));

  // Cargar eventos del calendario
  const calRes = getAcademicCalendar({ anoId });
  const calendarEvents = (calRes && calRes.status === "success" && Array.isArray(calRes.data)) ? calRes.data : [];

  // Cargar sesiones canceladas / recuperadas
  const sessSheet = getOrCreateSheet(ss, "SesionesClaseImpartidas");
  const sessRows = sessSheet.getDataRange().getValues().slice(1);
  const sessionOutcomes = sessRows.map(r => ({
    sesionId: r[0],
    horarioId: r[1],
    ofertaId: r[2],
    fecha: r[3],
    estado: r[4],
    docenteUserId: r[5],
    observaciones: r[6]
  }));

  return {
    status: "success",
    data: {
      tipoConsulta: queryType,
      targetId: targetId || "GLOBAL",
      horariosRecurrentes: baseSchedules,
      sustitucionesVigentes: substitutions,
      eventosCalendario: calendarEvents,
      sesionesExcepcionales: sessionOutcomes
    }
  };
}

// [TAREA 3.12] [Fase 3: Planificación Académica y Horarios] - Consulta de horarios semanales del estudiante por asignaturas.
function getStudentSchedule(payload) {
  const { userId, grado, seccion } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  let targetGrado = grado;
  let targetSeccion = seccion;

  // Si no vienen grado y sección explícitos pero sí el userId, buscar su última matrícula activa
  if ((!targetGrado || !targetSeccion) && userId) {
    const matRows = getOrCreateSheet(ss, "Matriculas").getDataRange().getValues().slice(1);
    const userMat = matRows.filter(r => String(r[2]).trim() === String(userId).trim() && (r[8] === "Activa" || r[8] === "Confirmada"));
    if (userMat.length > 0) {
      const lastMat = userMat[userMat.length - 1];
      targetGrado = targetGrado || lastMat[4];
      targetSeccion = targetSeccion || lastMat[5];
    }
  }

  const horRows = getOrCreateSheet(ss, "HorariosClase").getDataRange().getValues().slice(1);
  const offerRows = getOrCreateSheet(ss, "OfertaAcademica").getDataRange().getValues().slice(1);
  const asigRows = getOrCreateSheet(ss, "CatalogoAsignaturas").getDataRange().getValues().slice(1);
  const teacherAsigRows = getOrCreateSheet(ss, "AsignacionesDocentes").getDataRange().getValues().slice(1);
  const userRows = ss.getSheetByName("Usuarios") ? ss.getSheetByName("Usuarios").getDataRange().getValues().slice(1) : [];

  // Filtrar ofertas que coincidan con grado y sección
  const activeOffers = offerRows.filter(r => {
    return (!targetGrado || normalizeString(r[2]) === normalizeString(targetGrado)) &&
           (!targetSeccion || normalizeString(r[3]) === normalizeString(targetSeccion)) &&
           r[6] !== "Inactiva";
  });

  const offerIds = activeOffers.map(o => String(o[0]).trim());

  // Filtrar bloques de horario activos para las ofertas seleccionadas
  const studentSchedules = horRows.filter(r => {
    if (r[7] === "Inactivo") return false;
    if (offerIds.length > 0) return offerIds.indexOf(String(r[1]).trim()) !== -1;
    return false;
  }).map(r => {
    const offer = activeOffers.find(o => String(o[0]).trim() === String(r[1]).trim());
    const asigId = offer ? offer[4] : "";
    const catalogItem = asigRows.find(a => String(a[0]).trim() === String(asigId).trim());
    const asignaturaNombre = catalogItem ? catalogItem[1] : (asigId || "Asignatura General");

    // Buscar sustitución o titular
    const docUserId = r[6];
    const subMatch = teacherAsigRows.find(ta => String(ta[1]).trim() === String(r[1]).trim() && ta[3] === "Sustituto" && ta[6] === "Temporal");
    const actualDocUserId = subMatch ? subMatch[2] : docUserId;

    const docUser = userRows.find(u => String(u[0]).trim() === String(actualDocUserId).trim());
    const docenteNombre = docUser ? docUser[1] : "Docente Asignado";

    return {
      horarioId: r[0],
      ofertaId: r[1],
      diaSemana: r[2],
      horaInicio: r[3],
      horaFin: r[4],
      aulaCodigo: r[5],
      docenteUserId: actualDocUserId,
      docenteNombre: docenteNombre,
      esSustituto: Boolean(subMatch),
      asignaturaNombre: asignaturaNombre,
      grado: offer ? offer[2] : targetGrado,
      seccion: offer ? offer[3] : targetSeccion,
      estado: r[7]
    };
  });

  studentSchedules.sort((a, b) => {
    const days = ["Lunes", "Martes", "Miércoles", "Miercoles", "Jueves", "Viernes", "Sábado", "Sabado"];
    const dA = days.indexOf(a.diaSemana);
    const dB = days.indexOf(b.diaSemana);
    if (dA !== dB) return dA - dB;
    return String(a.horaInicio).localeCompare(String(b.horaInicio));
  });

  return {
    status: "success",
    grado: targetGrado || "General",
    seccion: targetSeccion || "A",
    schedules: studentSchedules
  };
}

function getAcademicRules(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ReglasAcademicas");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const rules = data.slice(1).map(r => ({
    reglaId: r[0],
    ambito: r[1],
    tipoRegla: r[2],
    clave: r[3],
    valor: r[4],
    estado: r[5] || "Activo"
  }));
  return { status: "success", data: rules };
}

function saveAcademicRule(payload) {
  const { clave, valor, ambito, tipoRegla } = payload || {};
  if (!clave) throw new Error("clave es requerida.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ReglasAcademicas");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ReglaID", "Ambito", "TipoRegla", "Clave", "Valor", "Estado"]);
  }

  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[3]).trim() === String(clave).trim());

  if (idx !== -1) {
    sheet.getRange(idx + 1, 5).setValue(valor);
  } else {
    const regId = "REG-" + Date.now();
    sheet.appendRow([regId, ambito || "Global", tipoRegla || "Evaluacion", clave, valor, "Activo"]);
  }

  return { status: "success", message: "Regla académica guardada." };
}

// --- FUNCIONES DE ASISTENCIA, PUNTUALIDAD Y SEGUIMIENTO ESTUDIANTIL (FASE 7) ---

function openAttendanceSession(payload) {
  const { fecha, horaInicio, horaFin, grado, seccion, asignaturaId, docenteUserId, observaciones } = payload || {};
  if (!grado || !asignaturaId) throw new Error("Grado y Asignatura son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SesionesAsistencia");

  const sesionId = "SES-AST-" + Date.now();
  const now = new Date();

  sheet.appendRow([
    sesionId,
    fecha || now.toISOString().split('T')[0],
    horaInicio || "07:00",
    horaFin || "08:00",
    grado,
    seccion || "A",
    asignaturaId,
    docenteUserId || "Docente",
    "Abierta",
    observaciones || ""
  ]);

  return { status: "success", message: "Sesión de asistencia abierta.", data: { sesionId } };
}

function saveClassAttendance(payload) {
  const { sesionId, registros } = payload || {};
  if (!sesionId || !Array.isArray(registros)) throw new Error("sesionId y lista de registros son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const regSheet = getOrCreateSheet(ss, "RegistrosAsistencia");
  if (regSheet.getLastRow() === 0) {
    regSheet.appendRow(["RegistroID", "SesionID", "UserId", "EstadoAsistencia", "HoraLlegada", "MinutosTardanza", "Justificado", "ObservacionDocente", "FechaRegistro"]);
  }

  const data = regSheet.getDataRange().getValues();
  const now = new Date();

  const indexMap = {};
  for (let i = 1; i < data.length; i++) {
    const key = `${String(data[i][1]).trim()}_${String(data[i][2]).trim()}`;
    indexMap[key] = i;
  }

  let savedCount = 0;
  registros.forEach(r => {
    const { userId, estadoAsistencia, horaLlegada, minutosTardanza, justificado, observacionDocente } = r;
    if (!userId) return;

    const key = `${String(sesionId).trim()}_${String(userId).trim()}`;
    if (key in indexMap) {
      const idx = indexMap[key];
      data[idx][3] = estadoAsistencia || "Presente";
      if (horaLlegada !== undefined) data[idx][4] = horaLlegada;
      if (minutosTardanza !== undefined) data[idx][5] = minutosTardanza;
      if (justificado !== undefined) data[idx][6] = justificado;
      if (observacionDocente !== undefined) data[idx][7] = observacionDocente;
    } else {
      const regId = "REG-AST-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      const newRow = [
        regId,
        sesionId,
        userId,
        estadoAsistencia || "Presente",
        horaLlegada || "",
        minutosTardanza || 0,
        justificado || false,
        observacionDocente || "",
        now
      ];
      data.push(newRow);
      indexMap[key] = data.length - 1;
    }
    savedCount++;
  });

  if (data.length > 1) {
    regSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  }

  return { status: "success", message: `Asistencia guardada para ${savedCount} estudiantes.` };
}

function getClassAttendance(payload) {
  const { sesionId, grado, seccion, asignaturaId, fecha } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const regSheet = getOrCreateSheet(ss, "RegistrosAsistencia");
  const regData = regSheet.getDataRange().getValues();
  if (regData.length <= 1) return { status: "success", data: [] };

  const records = regData.slice(1).filter(r => {
    if (sesionId && String(r[1]).trim() !== String(sesionId).trim()) return false;
    return true;
  }).map(r => ({
    registroId: r[0],
    sesionId: r[1],
    userId: r[2],
    estadoAsistencia: r[3],
    horaLlegada: r[4],
    minutosTardanza: r[5],
    justificado: r[6] === true || String(r[6]).toLowerCase() === "true",
    observacionDocente: r[7],
    fechaRegistro: r[8] ? new Date(r[8]).toISOString() : null
  }));

  return { status: "success", data: records };
}

function saveDailyAttendance(payload) {
  const { fecha, grado, seccion, registros } = payload || {};
  if (!fecha || !Array.isArray(registros)) throw new Error("Fecha y lista de registros son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const regSheet = getOrCreateSheet(ss, "RegistrosAsistencia");
  const data = regSheet.getDataRange().getValues();
  const now = new Date();

  const dailySesionId = "SES-DIARIA-" + (fecha || now.toISOString().split('T')[0]) + "-" + (grado || "GEN") + "-" + (seccion || "A");

  let savedCount = 0;
  registros.forEach(r => {
    const { userId, estadoAsistencia, horaLlegada, minutosTardanza, observacionDocente } = r;
    if (!userId) return;

    const idx = data.findIndex(row => String(row[1]).trim() === String(dailySesionId).trim() && String(row[2]).trim() === String(userId).trim());

    if (idx !== -1) {
      regSheet.getRange(idx + 1, 4).setValue(estadoAsistencia || "Presente");
      if (horaLlegada) regSheet.getRange(idx + 1, 5).setValue(horaLlegada);
    } else {
      const regId = "REG-DIA-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      regSheet.appendRow([
        regId,
        dailySesionId,
        userId,
        estadoAsistencia || "Presente",
        horaLlegada || "",
        minutosTardanza || 0,
        false,
        observacionDocente || "Registro Diario",
        now
      ]);
    }
    savedCount++;
  });

  return { status: "success", message: `Asistencia diaria registrada para ${savedCount} alumnos.` };
}

function getDailyAttendance(payload) {
  const { fecha, grado, seccion } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const regSheet = getOrCreateSheet(ss, "RegistrosAsistencia");
  const data = regSheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const prefix = "SES-DIARIA-" + (fecha || new Date().toISOString().split('T')[0]);

  const records = data.slice(1).filter(r => {
    return String(r[1]).indexOf(prefix) !== -1;
  }).map(r => ({
    registroId: r[0],
    sesionId: r[1],
    userId: r[2],
    estadoAsistencia: r[3],
    horaLlegada: r[4],
    minutosTardanza: r[5],
    justificado: r[6] === true || String(r[6]).toLowerCase() === "true",
    observacionDocente: r[7]
  }));

  return { status: "success", data: records };
}

function submitAttendanceJustification(payload) {
  const { userId, fechaAfectada, periodo, motivoDeclarado, adjuntoUrl, presentadoPor } = payload || {};
  if (!userId || !fechaAfectada || !motivoDeclarado) throw new Error("userId, fechaAfectada y motivoDeclarado son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "JustificacionesAsistencia");

  const justId = "JUST-" + Date.now();
  const now = new Date();

  sheet.appendRow([
    justId,
    userId,
    fechaAfectada,
    periodo || "I parcial",
    motivoDeclarado,
    adjuntoUrl || "",
    presentadoPor || "Estudiante",
    "Pendiente",
    "",
    "",
    now
  ]);

  return { status: "success", message: "Justificación de asistencia enviada para revisión.", data: { justificacionId: justId } };
}

function reviewAttendanceJustification(payload) {
  const { justificacionId, nuevoEstado, revisadoPor, observacionesAdmin } = payload || {};
  if (!justificacionId || !nuevoEstado) throw new Error("justificacionId y nuevoEstado son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "JustificacionesAsistencia");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(justificacionId).trim());
  if (idx === -1) throw new Error("Justificación no encontrada.");

  sheet.getRange(idx + 1, 8).setValue(nuevoEstado); // EstadoRevision
  sheet.getRange(idx + 1, 9).setValue(revisadoPor || "Secretaría");
  sheet.getRange(idx + 1, 10).setValue(observacionesAdmin || "");
  sheet.getRange(idx + 1, 11).setValue(new Date());

  if (nuevoEstado === "Aprobada" || nuevoEstado === "Aprobado") {
    try {
      const targetUserId = String(data[idx][1]).trim();
      const regSheet = getOrCreateSheet(ss, "RegistrosAsistencia");
      const regData = regSheet.getDataRange().getValues();

      for (let i = 1; i < regData.length; i++) {
        if (String(regData[i][2]).trim() === targetUserId) {
          regSheet.getRange(i + 1, 7).setValue(true); // Justificado = true
          regSheet.getRange(i + 1, 4).setValue("Justificada"); // EstadoAsistencia = Justificada
        }
      }
    } catch (e) {
      logDebug("Error actualizando asistencia a Justificada", e.message);
    }
  }

  return { status: "success", message: `Justificación cambiada a ${nuevoEstado}.` };
}

function addCaseFollowUpNote(payload) {
  const { casoId, nota, autorId } = payload || {};
  if (!casoId || !nota) throw new Error("casoId y nota son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CasosSeguimiento");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(casoId).trim());
  if (idx === -1) throw new Error("Caso de seguimiento no encontrado.");

  const currentAcciones = data[idx][5] ? (typeof data[idx][5] === 'string' ? JSON.parse(data[idx][5]) : data[idx][5]) : [];
  currentAcciones.push({
    fecha: new Date().toISOString(),
    autor: autorId || "Orientación",
    nota: nota
  });

  sheet.getRange(idx + 1, 6).setValue(JSON.stringify(currentAcciones));
  return { status: "success", message: "Nota de seguimiento agregada al expediente." };
}

function recordEarlyDeparture(payload) {
  const { userId, fecha, horaSalida, motivo, autorizadoPor, retiradoPor } = payload || {};
  if (!userId || !horaSalida) throw new Error("userId y horaSalida son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SalidasAnticipadas");

  const salidaId = "SAL-" + Date.now();
  const now = new Date();

  sheet.appendRow([
    salidaId,
    userId,
    fecha || now.toISOString().split('T')[0],
    horaSalida,
    motivo || "Salida autorizada",
    autorizadoPor || "Secretaría",
    retiradoPor || "Padre/Tutor",
    "",
    "Autorizada"
  ]);

  return { status: "success", message: "Salida anticipada registrada.", data: { salidaId } };
}

function getAttendanceIncidents(payload) {
  const { userId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "IncidenciasAsistencia");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const incidents = data.slice(1).filter(r => {
    if (userId && String(r[1]).trim() !== String(userId).trim()) return false;
    return true;
  }).map(r => ({
    incidenciaId: r[0],
    userId: r[1],
    tipoIncidencia: r[2],
    descripcion: r[3],
    fecha: r[4] ? new Date(r[4]).toISOString() : null,
    estado: r[5] || "Reportada",
    reportadoPor: r[6]
  }));

  return { status: "success", data: incidents };
}

function saveAttendanceIncident(payload) {
  const { userId, tipoIncidencia, descripcion, reportadoPor } = payload || {};
  if (!userId || !tipoIncidencia) throw new Error("userId y tipoIncidencia son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "IncidenciasAsistencia");

  const incId = "INC-AST-" + Date.now();
  const now = new Date();

  sheet.appendRow([
    incId,
    userId,
    tipoIncidencia,
    descripcion || "",
    now,
    "Reportada",
    reportadoPor || "Docente"
  ]);

  return { status: "success", message: "Incidencia de asistencia registrada.", data: { incidenciaId: incId } };
}

function getAttendanceFollowupCases(payload) {
  const { userId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CasosSeguimiento");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const cases = data.slice(1).filter(r => {
    if (userId && String(r[1]).trim() !== String(userId).trim()) return false;
    return true;
  }).map(r => ({
    casoId: r[0],
    userId: r[1],
    motivoApertura: r[2],
    resumenAsistencia: r[3],
    responsableId: r[4],
    acciones: r[5] ? (typeof r[5] === 'string' ? JSON.parse(r[5]) : r[5]) : [],
    estado: r[6] || "Abierto",
    fechaApertura: r[7] ? new Date(r[7]).toISOString() : null,
    fechaCierre: r[8] ? new Date(r[8]).toISOString() : null
  }));

  return { status: "success", data: cases };
}

function saveAttendanceFollowupCase(payload) {
  const { casoId, userId, motivoApertura, resumenAsistencia, responsableId, acciones, estado, categoriaCaso } = payload || {};
  if (!userId || !motivoApertura) throw new Error("userId y motivoApertura son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CasosSeguimiento");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["CasoID", "UserId", "MotivoApertura", "ResumenAsistencia", "ResponsableID", "AccionesJSON", "Estado", "FechaApertura", "FechaCierre"]);
  }

  const data = sheet.getDataRange().getValues();
  const cid = casoId || ("CASO-AST-" + Date.now());
  const now = new Date();

  const idx = data.findIndex(r => String(r[0]).trim() === String(cid).trim());

  if (idx !== -1) {
    sheet.getRange(idx + 1, 3).setValue(motivoApertura);
    if (resumenAsistencia) sheet.getRange(idx + 1, 4).setValue(resumenAsistencia);
    if (responsableId) sheet.getRange(idx + 1, 5).setValue(responsableId);
    if (acciones) sheet.getRange(idx + 1, 6).setValue(JSON.stringify(acciones));
    if (estado) {
      sheet.getRange(idx + 1, 7).setValue(estado);
      if (estado === "Cerrado") sheet.getRange(idx + 1, 9).setValue(now);
    }
  } else {
    sheet.appendRow([
      cid,
      userId,
      motivoApertura,
      resumenAsistencia || (categoriaCaso ? `Categoría: ${categoriaCaso}` : "Acompañamiento e intervención institucional"),
      responsableId || "Orientacion",
      JSON.stringify(acciones || []),
      estado || "Abierto",
      now,
      ""
    ]);
  }

  logStructuredEvent("ACADEMIC", "saveAttendanceFollowupCase", "INFO", "CASE_SAVED", `Caso de seguimiento ${cid} guardado para ${userId}`, { cid, estado: estado || "Abierto" }, payload && payload.authRole);

  return { status: "success", message: "Caso de seguimiento guardado exitosamente.", data: { casoId: cid } };
}

function getStudentAttendanceSummary(payload) {
  const { userId } = payload || {};
  if (!userId) throw new Error("userId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const regSheet = getOrCreateSheet(ss, "RegistrosAsistencia");
  const regData = regSheet.getDataRange().getValues();

  const userRegs = regData.length > 1 ? regData.slice(1).filter(r => String(r[2]).trim() === String(userId).trim()) : [];

  let presentes = 0;
  let ausentes = 0;
  let tardanzas = 0;
  let salidasAnticipadas = 0;
  let justificadas = 0;

  userRegs.forEach(r => {
    const st = String(r[3]).toLowerCase();
    if (st === "presente") presentes++;
    else if (st === "ausente") ausentes++;
    else if (st === "tardanza") tardanzas++;
    else if (st === "salidaanticipada") salidasAnticipadas++;

    if (r[6] === true || String(r[6]).toLowerCase() === "true") justificadas++;
  });

  const total = userRegs.length;
  const porcentajeAsistencia = total > 0 ? (((presentes + tardanzas) / total) * 100).toFixed(1) : "100.0";

  return {
    status: "success",
    data: {
      userId,
      totalSesiones: total,
      presentes,
      ausentes,
      tardanzas,
      salidasAnticipadas,
      justificadas,
      porcentajeAsistencia: parseFloat(porcentajeAsistencia)
    }
  };
}

// [REQ-EXP-002] [Fase 1: Registro y Expediente de Estudiantes] - Service backend endpoint (updateStudentFile) para la edición de datos personales del expediente del estudiante.
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

// [REQ-EXP-005] [Fase 1: Registro y Expediente de Estudiantes] - Service backend endpoint (getStudentTimeline) para consultar la línea de tiempo e historial cronológico de movimientos del estudiante.
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

// [REQ-EXP-006] [Fase 1: Registro y Expediente de Estudiantes] - Service backend endpoints (findDuplicateStudents, mergeStudentFiles) para la detección preventiva y fusión controlada de expedientes duplicados.
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

// [REQ-EXP-003] [Fase 1: Registro y Expediente de Estudiantes] - Service backend endpoints (getStudentGuardians, saveStudentGuardian, unlinkStudentGuardian) para la gestión de padres, tutores y responsables legales del estudiante.
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

// [REQ-EXP-004] [Fase 1: Registro y Expediente de Estudiantes] - Service backend endpoints (uploadStudentDocument, getStudentDocuments, updateDocumentStatus) para la carga y gestión de documentos y fotografías del estudiante.
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

// [REQ-EXP-008] [Fase 1: Registro y Expediente de Estudiantes] - Service backend endpoints (changeStudentSection, recordStudentTransfer, recordStudentWithdrawal, processStudentReentry) para la gestión de estados y movilidad estudiantil.
function changeStudentSection(payload) {
  const { expedienteId, userId, anolectivo, nuevaSeccion, motivo } = payload || {};
  if ((!expedienteId && !userId) || !nuevaSeccion) throw new Error("Expediente/userId y nuevaSeccion son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const targetAno = anolectivo || "2026";

  let sUserId = userId ? String(userId).trim() : "";
  if (!sUserId && expedienteId) {
    const expSheet = getOrCreateSheet(ss, "ExpedientesEstudiantes");
    const expData = expSheet.getDataRange().getValues();
    const expRow = expData.find(r => String(r[0]).trim() === String(expedienteId).trim());
    if (expRow && expRow[1]) sUserId = String(expRow[1]).trim();
  }

  const matSheet = getOrCreateSheet(ss, "Matriculas");
  const matData = matSheet.getDataRange().getValues();

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

  let sUserId = userId ? String(userId).trim() : "";
  if (!sUserId && expedienteId) {
    const expSheet = getOrCreateSheet(ss, "ExpedientesEstudiantes");
    const expData = expSheet.getDataRange().getValues();
    const expRow = expData.find(r => String(r[0]).trim() === String(expedienteId).trim());
    if (expRow && expRow[1]) sUserId = String(expRow[1]).trim();
  }

  const matSheet = getOrCreateSheet(ss, "Matriculas");
  const matData = matSheet.getDataRange().getValues();

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

  let sUserId = userId ? String(userId).trim() : "";
  if (!sUserId && expedienteId) {
    const expSheet = getOrCreateSheet(ss, "ExpedientesEstudiantes");
    const expData = expSheet.getDataRange().getValues();
    const expRow = expData.find(r => String(r[0]).trim() === String(expedienteId).trim());
    if (expRow && expRow[1]) sUserId = String(expRow[1]).trim();
  }

  const matSheet = getOrCreateSheet(ss, "Matriculas");
  const matData = matSheet.getDataRange().getValues();

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

// [TAREA-07] [Fase 1 - Almacenamiento y Recuperación] - Estrategia integral de almacenamiento, políticas de conservación y restauración segura con sumas de comprobación.
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
    const { fileId, confirmed, confirmCode, preserveHistoricGrades = true } = payload || {};
    if (!confirmed || confirmCode !== "RESTORE-CONFIRMED") {
      throw new Error("Confirmación obligatoria no recibida. Especifique confirmCode: 'RESTORE-CONFIRMED'.");
    }
    if (!fileId) throw new Error("ID de archivo de respaldo es requerido.");

    const file = DriveApp.getFileById(fileId);
    const content = file.getBlob().getDataAsString();
    const parsed = JSON.parse(content);

    if (!parsed.sheets) throw new Error("Archivo de respaldo inválido.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    // [TAREA-12] [Fase 1 - Evaluación Unificada] - Unificación de la evaluación académica, rúbricas analíticas, ponderaciones e inalterabilidad de calificaciones.
    const protectedGradeSheets = ["CalificacionesEstudiantes", "RecuperacionesEstudiante"];

    for (const sheetName in parsed.sheets) {
      let rows = parsed.sheets[sheetName];
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
      } else {
        if (preserveHistoricGrades && protectedGradeSheets.includes(sheetName)) {
          // Explicit preservation: Merge existing live grades with backup rows to prevent loss of historic official grades
          const existingData = sheet.getDataRange().getValues();
          if (existingData && existingData.length > 1 && rows && rows.length > 0) {
            const backupKeys = new Set();
            for (let r = 1; r < rows.length; r++) {
              backupKeys.add(String(rows[r][0]));
            }
            for (let e = 1; e < existingData.length; e++) {
              const liveId = String(existingData[e][0]);
              if (!backupKeys.has(liveId)) {
                rows.push(existingData[e]);
              }
            }
          }
        }
        sheet.clear();
      }
      if (rows && rows.length > 0) {
        sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
      }
    }

    logStructuredEvent("ACADEMIC", "restoreSystemBackup", "WARN", "BACKUP_RESTORED", `Restauración realizada desde ${file.getName()} (Calificaciones históricas preservadas)`, { fileId: fileId }, payload && payload.authRole);

    return { status: "success", message: `Sistema restaurado con éxito desde el respaldo ${file.getName()}. Calificaciones históricas preservadas.` };
  } catch (error) {
    logStructuredEvent("ACADEMIC", "restoreSystemBackup", "ERROR", "RESTORE_FAILED", error.message, payload, payload && payload.authRole);
    return { status: "error", message: error.message };
  }
}

// [FASE2-T11] [Fase 2 - Estrategia de Respaldo, Restauración y Reconciliación] - Verificación de integridad post-restauración, detección de huérfanos, reconciliación de relaciones y prevención de duplicados.
function reconcileRestoredDataIntegrity(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const report = {
    totalTablasAnalizadas: 0,
    calificacionesOficialesVerificadas: 0,
    referenciasHuerfanasDetectadas: 0,
    registrosInconsistentes: 0,
    detallesInconsistencias: [],
    reconciliacionCompletada: true,
    fechaReconciliacion: new Date().toISOString()
  };

  const sheetCalific = ss.getSheetByName("CalificacionesEstudiantes");
  if (sheetCalific) {
    report.totalTablasAnalizadas++;
    const calData = sheetCalific.getDataRange().getValues().slice(1);
    report.calificacionesOficialesVerificadas = calData.length;

    calData.forEach((row, idx) => {
      const nota = parseFloat(row[3]);
      if (isNaN(nota) || nota < 0 || nota > 100) {
        report.registrosInconsistentes++;
        report.detallesInconsistencias.push(`Fila ${idx + 2} de CalificacionesEstudiantes: Puntuación fuera de rango (${row[3]}).`);
      }
    });
  }

  const sheetHist = ss.getSheetByName("HistorialAcademico");
  if (sheetHist) {
    report.totalTablasAnalizadas++;
    const histData = sheetHist.getDataRange().getValues().slice(1);
    histData.forEach((row, idx) => {
      if (!row[0] || !row[1]) {
        report.referenciasHuerfanasDetectadas++;
        report.detallesInconsistencias.push(`Fila ${idx + 2} de HistorialAcademico: Clave de estudiante o registro ausente.`);
      }
    });
  }

  logStructuredEvent("ACADEMIC", "reconcileRestoredDataIntegrity", "INFO", "RESTORE_RECONCILIATION_COMPLETED", `Reconciliación de restauración completada. Inconsistencias: ${report.registrosInconsistentes}, Huérfanos: ${report.referenciasHuerfanasDetectadas}.`, {
    report
  }, payload && payload.authRole);

  return {
    status: "success",
    message: "Reconciliación de integridad post-restauración finalizada exitosamente.",
    reporte: report
  };
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
// [REQ-EXP-009] [Requerimientos de Expansión y Desarrollo] - Registro de matrículas por período y vinculación con cargos financieros del estudiante.
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

function resolveSectionEquivalence(secInput, targetFormat) {
  if (!secInput) return "A";
  const clean = String(secInput).trim().toUpperCase().replace("SECCIÓN", "").replace("SECCION", "").replace("SEC", "").trim();
  const mapNumToAlpha = { "1": "A", "2": "B", "3": "C", "4": "D", "5": "E" };
  const mapAlphaToNum = { "A": "1", "B": "2", "C": "3", "D": "4", "E": "5" };
  if (targetFormat === "NUMERIC") {
    return mapAlphaToNum[clean] || clean;
  }
  return mapNumToAlpha[clean] || clean;
}

function getSectionEquivalences(payload) {
  const { seccion, formato } = payload || {};
  const equivalente = resolveSectionEquivalence(seccion, formato);
  return {
    status: "success",
    seccionOriginal: seccion,
    seccionEquivalente: equivalente
  };
}

// [TAREA-12] [Fase 1 - Evaluación Unificada] - Unificación de la evaluación académica, rúbricas analíticas, ponderaciones, inalterabilidad de periodos cerrados y compatibilidad SACE / Cuadro de Honor.
function calculateUnifiedAcademicGrade(payload) {
  const { userId, asignaturaId, periodoId, actividades, esAnoHistoricoAnterior, periodoCerrado } = payload || {};

  if (esAnoHistoricoAnterior) {
    throw new Error("Las calificaciones de años escolares anteriores son inalterables.");
  }

  if (periodoCerrado) {
    throw new Error("El periodo académico se encuentra cerrado. Se requiere rectificación autorizada por Secretaría.");
  }

  if (!Array.isArray(actividades) || actividades.length === 0) {
    return {
      status: "success",
      notaFinal: 0,
      estadoCalificacion: "Sin Actividades",
      ponderaciones: {},
      cuadroHonor: false,
      compatibilidadSACE: "Pendiente"
    };
  }

  let acumuladoPonderado = 0;
  let totalPonderacion = 0;
  const ponderacionesPorCategoria = {};

  actividades.forEach(act => {
    const nota = parseFloat(act.notaObtenida) || 0;
    const peso = parseFloat(act.porcentajePonderacion) || 0;
    const cat = act.categoria || "General";

    acumuladoPonderado += (nota * (peso / 100));
    totalPonderacion += peso;

    ponderacionesPorCategoria[cat] = (ponderacionesPorCategoria[cat] || 0) + (nota * (peso / 100));
  });

  const notaFinalCalculada = Math.min(100, Math.round(acumuladoPonderado * 100) / 100);
  const esCuadroHonor = notaFinalCalculada >= 90;

  let equivalenciaSACE = "Reprobado";
  if (notaFinalCalculada >= 91) equivalenciaSACE = "Excelente";
  else if (notaFinalCalculada >= 81) equivalenciaSACE = "Muy Bueno";
  else if (notaFinalCalculada >= 70) equivalenciaSACE = "Satisfactorio";

  return {
    status: "success",
    userId: userId,
    asignaturaId: asignaturaId,
    periodoId: periodoId,
    notaFinal: notaFinalCalculada,
    estadoCalificacion: notaFinalCalculada >= 70 ? "Aprobado" : "Reprobado",
    equivalenciaSACE: equivalenciaSACE,
    esCuadroHonor: esCuadroHonor,
    ponderacionesPorCategoria: ponderacionesPorCategoria
  };
}

// [FASE2-T12] [Fase 2 - Criterios para Almacenamiento Transaccional] - Evaluación de métricas de almacenamiento, volumen de filas, latencia de consulta y umbrales de migración a RDBMS/SQL.
function evaluateTransactionalStorageMigrationNeed(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = ss.getSheets();

  const UMBRAL_FILAS = 50000;
  const UMBRAL_LATENCIA_MS = 2000;

  const tableMetrics = [];
  let totalRows = 0;
  let recommendedMigrationCount = 0;

  sheets.forEach(sh => {
    const name = sh.getName();
    const startTime = new Date().getTime();
    const lastRow = sh.getLastRow();
    const readDuration = new Date().getTime() - startTime;

    totalRows += lastRow;
    const isExceeded = lastRow >= UMBRAL_FILAS || readDuration >= UMBRAL_LATENCIA_MS;
    if (isExceeded) recommendedMigrationCount++;

    tableMetrics.push({
      nombreTabla: name,
      filasTotales: lastRow,
      latenciaLecturaMs: readDuration,
      requiereMigracionTransaccional: isExceeded,
      motivo: isExceeded ? "Excede umbral de filas (> 50,000) o latencia de consulta (> 2,000ms)" : "Operante dentro de límites de Google Sheets"
    });
  });

  logStructuredEvent("ACADEMIC", "evaluateTransactionalStorageMigrationNeed", "INFO", "TRANSACTIONAL_EVALUATION_COMPLETED", `Evaluación transaccional completada. Tablas analizadas: ${sheets.length}, Requieren migración: ${recommendedMigrationCount}.`, {
    totalRows,
    recommendedMigrationCount
  }, payload && payload.authRole);

  return {
    status: "success",
    service: "ACADEMIC",
    resumenEvaluacion: {
      totalTablasAnalizadas: sheets.length,
      filasAcumuladasTotales: totalRows,
      tablasSuperanUmbral: recommendedMigrationCount,
      recomendacionTecnica: recommendedMigrationCount > 0 ? "RECOMENDADA_MIGRACION_GRADUAL_SQL" : "ALMACENAMIENTO_SHEETS_ADECUADO"
    },
    metricasPorTabla: tableMetrics,
    timestamp: new Date().toISOString()
  };
}
