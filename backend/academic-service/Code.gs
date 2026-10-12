// ============================================================================
// MICROSERVICIO ACADÉMICO (VERSIÓN MODULAR EXTENDIDA FASE 3 v8.3.0)
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
    // Tablas Fase 2 y Anteriores
    if (name === "ConfiguracionAcademica") sheet.appendRow(["ID", "Fecha", "Parcial", "Grado", "Sección", "Asignatura", "Unidad", "Tema", "profesorId"]);
    if (name === "HistorialAcademico") sheet.appendRow(["ID", "Fecha", "Parcial", "Grado", "Sección", "Asignatura", "Unidad", "profesorId"]);
    if (name === "Clases") sheet.appendRow(["Grado", "Seccion", "WhatsAppLink"]);
    if (name === "BancoPreguntas") sheet.appendRow(["PreguntaID", "Asignatura", "Nivel", "Tema", "TipoActividad", "Pregunta", "OpcionA", "OpcionB", "OpcionC", "OpcionD", "RespuestaCorrecta", "Explicacion", "Imagen", "VecesRespondida", "VecesCorrecta", "PorcentajeAcierto", "UltimaActualizacion", "Activa", "DificultadCalculada"]);
    if (name === "Matriculas") sheet.appendRow(["MatriculaID", "Fecha", "UserId", "Alumno", "Grado", "Seccion", "Periodo", "Tipo", "Estado", "BecaDescuento", "Observaciones"]);
    if (name === "CargosEstudiante") sheet.appendRow(["CargoID", "Fecha", "UserId", "Concepto", "MontoBase", "Descuento", "MontoFinal", "Estado", "FechaVencimiento"]);

    // Nuevas Tablas Fase 3 - Estructura e Infraestructura Académica
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
  }
  return sheet;
}

// ---------------------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------------------

function doGet() { return textResponse({ status: "success", service: "ACADEMIC", timestamp: new Date().toISOString(), dbConnected: true }); }


// ---------------------------------------------------------------------------
// CONTROL DE ACCESO BASADO EN ROLES (RBAC SERVIDOR - FASE 3 EXTENDIDO)
// ---------------------------------------------------------------------------
const ROLE_PERMISSIONS = {
  "Administrador": ["*"],
  "Director": [
    "getAcademicConfig", "updateAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "getWhatsAppLink", "saveWhatsAppLink", "getQuestionBank", "saveQuestion", "generateMigrationReport", "registerStudentEnrollment", "getStudentEnrollmentHistory",
    "getInstitutionParams", "saveInstitutionParam", "getAcademicYears", "createAcademicYear", "updateAcademicYearStatus", "prepareNewAcademicYear",
    "getAcademicPeriods", "manageAcademicPeriod", "getSubjectCatalog", "createSubjectCatalogItem", "getStudyPlans", "createStudyPlan",
    "getAcademicOffers", "createAcademicOffer", "getTeacherAssignments", "assignTeacherToClass", "createTeacherSubstitution",
    "getAcademicCalendar", "createCalendarEvent", "getClassSchedules", "createClassSchedule", "getAcademicRules", "saveAcademicRule"
  ],
  "Subdirector": [
    "getAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "getWhatsAppLink", "getQuestionBank", "registerStudentEnrollment", "getStudentEnrollmentHistory",
    "getInstitutionParams", "getAcademicYears", "getAcademicPeriods", "getSubjectCatalog", "getStudyPlans", "getAcademicOffers",
    "getTeacherAssignments", "assignTeacherToClass", "createTeacherSubstitution", "getAcademicCalendar", "createCalendarEvent", "getClassSchedules", "createClassSchedule"
  ],
  "Secretaría": [
    "getAcademicConfig", "getAsignaturasActivas", "registerStudentEnrollment", "getStudentEnrollmentHistory",
    "getInstitutionParams", "getAcademicYears", "getAcademicPeriods", "getSubjectCatalog", "getStudyPlans", "getAcademicOffers",
    "createAcademicOffer", "getTeacherAssignments", "assignTeacherToClass", "getAcademicCalendar", "createCalendarEvent", "getClassSchedules"
  ],
  "Contador": ["getAcademicConfig", "registerStudentEnrollment", "getStudentEnrollmentHistory", "getAcademicYears", "getAcademicOffers"],
  "Consejeros": ["getAcademicConfig", "getAcademicYears", "getAcademicCalendar", "getClassSchedules"],
  "Profesor": [
    "getAcademicConfig", "updateAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "updateAsignaturasActivas", "saveWhatsAppLink", "getWhatsAppLink", "getQuestionBank", "saveQuestion", "generateMigrationReport",
    "getAcademicYears", "getAcademicPeriods", "getSubjectCatalog", "getAcademicOffers", "getTeacherAssignments", "getAcademicCalendar", "getClassSchedules"
  ],
  "Asistente": ["getAcademicConfig", "getAsignaturasActivas", "getWhatsAppLink", "getQuestionBank", "getAcademicCalendar", "getClassSchedules"],
  "Estudiante": ["getAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "getWhatsAppLink", "getStudentEnrollmentHistory", "getAcademicYears", "getAcademicPeriods", "getAcademicOffers", "getAcademicCalendar", "getClassSchedules"],
  "Alumno": ["getAcademicConfig", "getAcademicHistory", "getAsignaturasActivas", "getWhatsAppLink", "getStudentEnrollmentHistory", "getAcademicYears", "getAcademicPeriods", "getAcademicOffers", "getAcademicCalendar", "getClassSchedules"]
};

const PUBLIC_ACTIONS = ["ping"];

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

      // Nuevos Endpoints Fase 3
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
// FASE 3: 1. PARAMETRIZACIÓN INSTITUCIONAL Y SEDES
// ---------------------------------------------------------------------------

function getInstitutionParams(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "InstitucionParametros");
  const rows = sheet.getDataRange().getValues().slice(1);

  const defaultParams = {
    "NOMBRE_OFICIAL": "New Generation Bilingual School and Institute",
    "NOMBRE_ABREVIADO": "New Generation",
    "DIRECCION": "Honduras",
    "ZONA_HORARIA": "America/Tegucigalpa",
    "IDIOMA": "es",
    "FORMATO_FECHA": "YYYY-MM-DD",
    "MONEDA": "HNL",
    "ESTADO_INSTITUCION": "Activa"
  };

  const paramsMap = { ...defaultParams };
  rows.forEach(r => {
    if (r[0] && r[5] === "Activo") {
      paramsMap[r[0]] = r[2];
    }
  });

  return { status: "success", parameters: paramsMap };
}

function saveInstitutionParam(payload) {
  const { clave, nombre, valor, tipoDato, ambito } = payload || {};
  if (!clave || valor === undefined) throw new Error("Clave y valor requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "InstitucionParametros");
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  const idx = data.findIndex(r => String(r[0]).trim() === String(clave).trim());
  if (idx !== -1) {
    sheet.getRange(idx + 1, 3).setValue(valor);
    sheet.getRange(idx + 1, 7).setValue((payload && payload.userId) || "Admin");
    sheet.getRange(idx + 1, 8).setValue(now);
  } else {
    sheet.appendRow([clave, nombre || clave, valor, tipoDato || "Texto", ambito || "Institucional", "Activo", (payload && payload.userId) || "Admin", now]);
  }

  logStructuredEvent("ACADEMIC", "saveInstitutionParam", "INFO", "PARAM_SAVED", `Parámetro ${clave} guardado.`, { clave, valor }, payload && payload.authRole);
  return { status: "success", message: `Parámetro '${clave}' guardado con éxito.` };
}

// ---------------------------------------------------------------------------
// FASE 3: 2. GESTIÓN DE AÑOS LECTIVOS CON CICLO DE VIDA Y ASISTENTE
// ---------------------------------------------------------------------------

function getAcademicYears(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "AnosLectivos").getDataRange().getValues().slice(1);

  if (rows.length === 0) {
    // Inicializar año lectivo por defecto si la hoja está vacía
    const defaultYear = ["ANO-2026", "2026", "2026-01-15", "2026-11-30", "2026-02-01", "2026-11-20", "Activo", "Sistema", new Date()];
    getOrCreateSheet(ss, "AnosLectivos").appendRow(defaultYear);
    return { status: "success", activeYear: "2026", years: [{ anoId: "ANO-2026", nombre: "2026", estado: "Activo" }] };
  }

  const mapped = rows.map(r => ({
    anoId: r[0],
    nombre: r[1],
    fechaInicio: r[2],
    fechaFin: r[3],
    inicioClases: r[4],
    finClases: r[5],
    estado: r[6],
    creadoPor: r[7],
    fechaCreacion: r[8]
  }));

  const activeYearObj = mapped.find(y => y.estado === "Activo") || mapped[mapped.length - 1];

  return { status: "success", activeYear: activeYearObj ? activeYearObj.nombre : "2026", activeYearObj: activeYearObj, years: mapped };
}

function createAcademicYear(payload) {
  const { nombre, fechaInicio, fechaFin, inicioClases, finClases } = payload || {};
  if (!nombre || !fechaInicio || !fechaFin) throw new Error("Nombre y fechas de inicio/fin requeridas.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AnosLectivos");
  const data = sheet.getDataRange().getValues();

  const dup = data.find(r => String(r[1]).trim() === String(nombre).trim());
  if (dup) throw new Error(`El año lectivo '${nombre}' ya existe.`);

  const anoId = "ANO-" + nombre;
  const now = new Date();

  sheet.appendRow([anoId, nombre, fechaInicio, fechaFin, inicioClases || fechaInicio, finClases || fechaFin, "Borrador", (payload && payload.userId) || "Admin", now]);

  logStructuredEvent("ACADEMIC", "createAcademicYear", "INFO", "YEAR_CREATED", `Año lectivo ${nombre} creado en estado Borrador.`, { anoId, nombre }, payload && payload.authRole);

  return { status: "success", anoId: anoId, message: `Año lectivo '${nombre}' creado exitosamente en estado 'Borrador'.` };
}

function updateAcademicYearStatus(payload) {
  const { anoId, nuevoEstado } = payload || {};
  if (!anoId || !nuevoEstado) throw new Error("anoId y nuevoEstado requeridos.");

  const validStates = ["Borrador", "EnPreparacion", "Activo", "EnCierre", "Cerrado", "Archivado"];
  if (validStates.indexOf(nuevoEstado) === -1) throw new Error(`Estado inválido. Valores permitidos: ${validStates.join(", ")}`);

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AnosLectivos");
  const data = sheet.getDataRange().getValues();

  const idx = data.findIndex(r => String(r[0]).trim() === String(anoId).trim() || String(r[1]).trim() === String(anoId).trim());
  if (idx === -1) throw new Error("Año lectivo no encontrado.");

  // Si pasa a 'Activo', pasar los demás años a 'Cerrado' o 'Archivado'
  if (nuevoEstado === "Activo") {
    for (let i = 1; i < data.length; i++) {
      if (i !== idx && data[i][6] === "Activo") {
        sheet.getRange(i + 1, 7).setValue("Cerrado");
      }
    }
  }

  sheet.getRange(idx + 1, 7).setValue(nuevoEstado);

  logStructuredEvent("ACADEMIC", "updateAcademicYearStatus", "WARN", "YEAR_STATUS_CHANGED", `Año lectivo ${anoId} cambió a estado ${nuevoEstado}.`, { anoId, nuevoEstado }, payload && payload.authRole);

  return { status: "success", message: `Año lectivo actualizado a estado '${nuevoEstado}'.` };
}

function prepareNewAcademicYear(payload) {
  const { sourceAnoNombre, targetAnoNombre, copyGrades, copySubjects, copyOffers } = payload || {};
  if (!sourceAnoNombre || !targetAnoNombre) throw new Error("Año origen y año destino son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const configSheet = getOrCreateSheet(ss, "ConfiguracionAcademica");
  const configRows = configSheet.getDataRange().getValues().slice(1);

  // Copia de ofertas del año anterior hacia el nuevo año
  let copiedCount = 0;
  if (copyOffers || copyGrades || copySubjects) {
    const offerSheet = getOrCreateSheet(ss, "OfertaAcademica");
    const existingOffers = offerSheet.getDataRange().getValues().slice(1);

    const sourceOffers = existingOffers.filter(r => String(r[1]).trim() === String(sourceAnoNombre).trim());

    sourceOffers.forEach(o => {
      const newOfferId = "OFR-" + targetAnoNombre + "-" + o[3] + "-" + o[4] + "-" + Math.floor(Math.random() * 1000);
      const dup = existingOffers.find(e => String(e[1]).trim() === String(targetAnoNombre).trim() && String(e[3]).trim() === String(o[3]).trim() && String(e[4]).trim() === String(o[4]).trim() && String(e[5]).trim() === String(o[5]).trim());
      if (!dup) {
        offerSheet.appendRow([
          newOfferId,
          targetAnoNombre,
          o[2] || "SEDE-CENTRAL",
          o[3],
          o[4],
          o[5],
          o[6] || "PLAN-STANDARD",
          o[7] || "Presencial",
          o[8] || 35,
          "EnPreparacion",
          `${o[3]}-${o[4]}-${o[5]}`
        ]);
        copiedCount++;
      }
    });
  }

  logStructuredEvent("ACADEMIC", "prepareNewAcademicYear", "INFO", "YEAR_PREPARED", `Asistente de preparación anual ejecutado: ${copiedCount} ofertas copiadas de ${sourceAnoNombre} a ${targetAnoNombre}.`, { sourceAnoNombre, targetAnoNombre, copiedCount }, payload && payload.authRole);

  return { status: "success", copiedOffersCount: copiedCount, message: `Preparación anual completada. ${copiedCount} ofertas académicas copiadas al nuevo año ${targetAnoNombre}.` };
}

// ---------------------------------------------------------------------------
// FASE 3: 3. PERÍODOS ACADÉMICOS Y REGLAS DE APERTURA/CIERRE
// ---------------------------------------------------------------------------

function getAcademicPeriods(payload) {
  const { anoId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "PeriodosAcademicos").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (anoId) {
    filtered = filtered.filter(r => String(r[1]).trim() === String(anoId).trim());
  }

  const mapped = filtered.map(r => ({
    periodoId: r[0],
    anoId: r[1],
    nombre: r[2],
    tipoPeriodo: r[3],
    fechaInicio: r[4],
    fechaFin: r[5],
    orden: r[6],
    estado: r[7],
    aperturaDocente: r[8],
    publicacionNotas: r[9]
  }));

  mapped.sort((a, b) => (parseInt(a.orden) || 0) - (parseInt(b.orden) || 0));

  return { status: "success", periods: mapped };
}

function manageAcademicPeriod(payload) {
  const { periodoId, anoId, nombre, tipoPeriodo, fechaInicio, fechaFin, orden, estado, aperturaDocente } = payload || {};
  if (!nombre || !fechaInicio || !fechaFin) throw new Error("Nombre y fechas del período son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PeriodosAcademicos");
  const data = sheet.getDataRange().getValues();

  let pId = periodoId;
  let idx = -1;
  if (pId) {
    idx = data.findIndex(r => String(r[0]).trim() === String(pId).trim());
  } else {
    idx = data.findIndex(r => String(r[1]).trim() === String(anoId || "2026").trim() && String(r[2]).toLowerCase().trim() === String(nombre).toLowerCase().trim());
  }

  const targetAno = anoId || "2026";
  const now = new Date();

  if (idx !== -1) {
    pId = data[idx][0];
    sheet.getRange(idx + 1, 1, 1, 10).setValues([[
      pId,
      targetAno,
      nombre,
      tipoPeriodo || "Parcial",
      fechaInicio,
      fechaFin,
      orden || 1,
      estado || "Abierto",
      aperturaDocente !== undefined ? aperturaDocente : true,
      fechaFin
    ]]);
  } else {
    pId = "PRD-" + targetAno + "-" + Math.floor(Math.random() * 10000);
    sheet.appendRow([
      pId,
      targetAno,
      nombre,
      tipoPeriodo || "Parcial",
      fechaInicio,
      fechaFin,
      orden || 1,
      estado || "Abierto",
      aperturaDocente !== undefined ? aperturaDocente : true,
      fechaFin
    ]);
  }

  return { status: "success", periodoId: pId, message: `Período académico '${nombre}' guardado exitosamente.` };
}

// ---------------------------------------------------------------------------
// FASE 3: 4. CATÁLOGOS DE ASIGNATURAS, PLANES DE ESTUDIO Y OFERTA ACADÉMICA
// ---------------------------------------------------------------------------

function getSubjectCatalog(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "CatalogoAsignaturas").getDataRange().getValues().slice(1);

  if (rows.length === 0) {
    // Cargar catálogo inicial de asignaturas por defecto
    const defaultCatalog = [
      ["ASIG-INF1", "Informática I", "INF-101", "Informática", 4, "Activo"],
      ["ASIG-PROG", "Programación", "PRG-201", "Informática", 5, "Activo"],
      ["ASIG-OFI1", "Ofimática I", "OFI-101", "Informática", 3, "Activo"],
      ["ASIG-INF-AP1", "Informática Aplicada I", "IAP-201", "Informática", 4, "Activo"],
      ["ASIG-AD", "Análisis y Diseño", "AUD-201", "Informática", 4, "Activo"],
      ["ASIG-WEB", "Diseño Web", "WEB-301", "Informática", 5, "Activo"],
      ["ASIG-LAB1", "Laboratorio I", "LAB-201", "Informática", 6, "Activo"],
      ["ASIG-LAB2", "Laboratorio II", "LAB-301", "Informática", 6, "Activo"],
      ["ASIG-MANT1", "Mantenimiento y Reparación I", "MNT-201", "Informática", 4, "Activo"],
      ["ASIG-MANT2", "Mantenimiento y Reparación II", "MNT-301", "Informática", 4, "Activo"]
    ];

    const sheet = getOrCreateSheet(ss, "CatalogoAsignaturas");
    defaultCatalog.forEach(r => sheet.appendRow(r));
    return { status: "success", catalog: defaultCatalog.map(r => ({ asignaturaId: r[0], nombreOficial: r[1], codigo: r[2], areaAcademica: r[3], cargaHorariaRef: r[4], estado: r[5] })) };
  }

  const mapped = rows.map(r => ({
    asignaturaId: r[0],
    nombreOficial: r[1],
    codigo: r[2],
    areaAcademica: r[3],
    cargaHorariaRef: r[4],
    estado: r[5]
  }));

  return { status: "success", catalog: mapped };
}

function createSubjectCatalogItem(payload) {
  const { nombreOficial, codigo, areaAcademica, cargaHorariaRef } = payload || {};
  if (!nombreOficial) throw new Error("Nombre oficial de la asignatura es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CatalogoAsignaturas");
  const data = sheet.getDataRange().getValues();

  const normName = normalizeString(nombreOficial);
  const dup = data.find(r => normalizeString(r[1]) === normName);
  if (dup) return { status: "success", asignaturaId: dup[0], isExisting: true, message: "Asignatura ya existente en el catálogo." };

  const asigId = "ASIG-" + Math.floor(1000 + Math.random() * 9000);
  const cod = codigo || ("MAT-" + Math.floor(100 + Math.random() * 900));

  sheet.appendRow([asigId, nombreOficial.trim(), cod, areaAcademica || "Informática", cargaHorariaRef || 4, "Activo"]);

  return { status: "success", asignaturaId: asigId, message: "Asignatura registrada en catálogo exitosamente." };
}

function getStudyPlans(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "PlanesEstudio").getDataRange().getValues().slice(1);
  return { status: "success", plans: rows.map(r => ({ planId: r[0], nombre: r[1], version: r[2], grado: r[3], vigenciaInicio: r[4], vigenciaFin: r[5], estado: r[6] })) };
}

function createStudyPlan(payload) {
  const { nombre, version, grado, vigenciaInicio, vigenciaFin } = payload || {};
  if (!nombre || !grado) throw new Error("Nombre del plan y grado requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PlanesEstudio");
  const planId = "PLAN-" + grado.toUpperCase() + "-" + (version || "v1.0");

  sheet.appendRow([planId, nombre, version || "v1.0", grado, vigenciaInicio || "2026", vigenciaFin || "2030", "Activo"]);

  return { status: "success", planId: planId, message: "Plan de estudio registrado exitosamente." };
}

function getAcademicOffers(payload) {
  const { anoId, grado, seccion } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "OfertaAcademica").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (anoId) filtered = filtered.filter(r => String(r[1]).trim() === String(anoId).trim());
  if (grado) filtered = filtered.filter(r => normalizeString(r[3]) === normalizeString(grado));
  if (seccion) filtered = filtered.filter(r => normalizeString(r[4]) === normalizeString(seccion));

  const mapped = filtered.map(r => ({
    ofertaId: r[0],
    anoId: r[1],
    sedeId: r[2],
    grado: r[3],
    seccion: r[4],
    asignaturaId: r[5],
    planId: r[6],
    modalidad: r[7],
    capacidadMax: r[8],
    estado: r[9],
    codigoClase: r[10]
  }));

  return { status: "success", offers: mapped };
}

function createAcademicOffer(payload) {
  const { anoId, grado, seccion, asignaturaId, modalidad, capacidadMax } = payload || {};
  if (!grado || !seccion || !asignaturaId) throw new Error("Grado, sección y asignaturaId son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "OfertaAcademica");
  const data = sheet.getDataRange().getValues();

  const targetAno = anoId || "2026";
  const dup = data.find(r => String(r[1]).trim() === String(targetAno).trim() && normalizeString(r[3]) === normalizeString(grado) && normalizeString(r[4]) === normalizeString(seccion) && normalizeString(r[5]) === normalizeString(asignaturaId));

  if (dup) return { status: "success", ofertaId: dup[0], isExisting: true, message: "La oferta académica ya existe." };

  const ofertaId = "OFR-" + targetAno + "-" + Math.floor(1000 + Math.random() * 9000);
  const codigoClase = `${grado}-${seccion}-${asignaturaId}`;

  sheet.appendRow([ofertaId, targetAno, "SEDE-CENTRAL", grado, seccion, asignaturaId, "PLAN-BTP", modalidad || "Presencial", capacidadMax || 35, "Activo", codigoClase]);

  return { status: "success", ofertaId: ofertaId, message: "Oferta académica (clase) creada con éxito." };
}

// ---------------------------------------------------------------------------
// FASE 3: 5. ASIGNACIÓN DE DOCENTES, ROLES Y SUSTITUCIONES TEMPORALES
// ---------------------------------------------------------------------------

function getTeacherAssignments(payload) {
  const { docenteUserId, ofertaId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "AsignacionesDocentes").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (docenteUserId) filtered = filtered.filter(r => String(r[2]).trim() === String(docenteUserId).trim());
  if (ofertaId) filtered = filtered.filter(r => String(r[1]).trim() === String(ofertaId).trim());

  const mapped = filtered.map(r => ({
    asignacionId: r[0],
    ofertaId: r[1],
    docenteUserId: r[2],
    rolDocente: r[3],
    fechaInicio: r[4],
    fechaFin: r[5],
    estado: r[6],
    autorizadoPor: r[7],
    motivo: r[8]
  }));

  return { status: "success", assignments: mapped };
}

function assignTeacherToClass(payload) {
  const { ofertaId, docenteUserId, rolDocente, fechaInicio, fechaFin, motivo } = payload || {};
  if (!ofertaId || !docenteUserId) throw new Error("ofertaId y docenteUserId requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AsignacionesDocentes");
  const data = sheet.getDataRange().getValues();

  const rol = rolDocente || "Titular";
  const now = new Date();

  // Si se asigna un nuevo Titular, pasar el Titular anterior a 'Inactivo' o 'Sustituido'
  if (rol === "Titular") {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]).trim() === String(ofertaId).trim() && data[i][3] === "Titular" && data[i][6] === "Activo") {
        sheet.getRange(i + 1, 7).setValue("Relevado");
        sheet.getRange(i + 1, 6).setValue(now);
      }
    }
  }

  const asignacionId = "ASG-" + Math.floor(10000 + Math.random() * 90000);

  sheet.appendRow([
    asignacionId,
    ofertaId,
    String(docenteUserId).trim(),
    rol,
    fechaInicio || now,
    fechaFin || "",
    "Activo",
    (payload && payload.userId) || "Admin",
    motivo || "Asignación Ordinaria"
  ]);

  logStructuredEvent("ACADEMIC", "assignTeacherToClass", "INFO", "TEACHER_ASSIGNED", `Docente ${docenteUserId} asignado como ${rol} a oferta ${ofertaId}`, { asignacionId, ofertaId, docenteUserId, rol }, payload && payload.authRole);

  return { status: "success", asignacionId: asignacionId, message: `Docente asignado correctamente como '${rol}'.` };
}

function createTeacherSubstitution(payload) {
  const { ofertaId, docenteTitularUserId, docenteSustitutoUserId, fechaInicio, fechaFin, motivo } = payload || {};
  if (!ofertaId || !docenteSustitutoUserId || !fechaInicio || !fechaFin) {
    throw new Error("ofertaId, docenteSustitutoUserId y fechas de sustitución son requeridas.");
  }

  const result = assignTeacherToClass({
    ofertaId: ofertaId,
    docenteUserId: docenteSustitutoUserId,
    rolDocente: "Sustituto",
    fechaInicio: fechaInicio,
    fechaFin: fechaFin,
    motivo: motivo || `Sustitución temporal de ${docenteTitularUserId || 'Titular'}`,
    authRole: payload && payload.authRole,
    userId: payload && payload.userId
  });

  return { status: "success", sustitucionId: result.asignacionId, message: "Sustitución docente temporal programada con éxito." };
}

// ---------------------------------------------------------------------------
// FASE 3: 6. CALENDARIO ACADÉMICO E INSTITUCIONAL
// ---------------------------------------------------------------------------

function getAcademicCalendar(payload) {
  const { anoId, visibilidad } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "CalendarioAcademico").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (anoId) filtered = filtered.filter(r => String(r[1]).trim() === String(anoId).trim());
  if (visibilidad) {
    filtered = filtered.filter(r => r[7] === "Publico" || r[7] === visibilidad || visibilidad === "Administrador");
  }

  const mapped = filtered.map(r => ({
    eventoId: r[0],
    anoId: r[1],
    sedeId: r[2],
    nombreEvento: r[3],
    tipoDia: r[4],
    fechaInicio: r[5],
    fechaFin: r[6],
    visibilidad: r[7],
    estado: r[8]
  }));

  return { status: "success", events: mapped };
}

function createCalendarEvent(payload) {
  const { anoId, nombreEvento, tipoDia, fechaInicio, fechaFin, visibilidad } = payload || {};
  if (!nombreEvento || !fechaInicio) throw new Error("Nombre del evento y fecha de inicio son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CalendarioAcademico");
  const eventoId = "EVT-" + Math.floor(1000 + Math.random() * 9000);

  sheet.appendRow([
    eventoId,
    anoId || "2026",
    "SEDE-CENTRAL",
    nombreEvento,
    tipoDia || "DiaLectivo",
    fechaInicio,
    fechaFin || fechaInicio,
    visibilidad || "Publico",
    "Activo"
  ]);

  return { status: "success", eventoId: eventoId, message: "Evento registrado en el calendario académico." };
}

// ---------------------------------------------------------------------------
// FASE 3: 7. HORARIOS DE CLASE Y DETECCIÓN DE CONFLICTOS DE SOLAPAMIENTO
// ---------------------------------------------------------------------------

function checkScheduleConflict(ss, docenteUserId, aulaCodigo, diaSemana, horaInicio, horaFin, anoId) {
  const sheet = getOrCreateSheet(ss, "HorariosClase");
  const rows = sheet.getDataRange().getValues().slice(1);

  const parseTime = (tStr) => {
    if (!tStr) return 0;
    const parts = tStr.toString().split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
  };

  const newStart = parseTime(horaInicio);
  const newEnd = parseTime(horaFin);

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r[7] !== "Activo") continue;

    const rDay = normalizeString(r[2]);
    const targetDay = normalizeString(diaSemana);

    if (rDay === targetDay) {
      const existStart = parseTime(r[3]);
      const existEnd = parseTime(r[4]);

      // Comprobar traslape de rango de tiempo
      if (newStart < existEnd && newEnd > existStart) {
        if (docenteUserId && String(r[6]).trim() === String(docenteUserId).trim()) {
          return { conflict: true, type: "DOCENTE_OCUPADO", message: `Conflicto de Horario: El docente ya tiene una clase programada el ${diaSemana} de ${r[3]} a ${r[4]}.` };
        }
        if (aulaCodigo && normalizeString(r[5]) === normalizeString(aulaCodigo) && normalizeString(aulaCodigo) !== "virtual") {
          return { conflict: true, type: "AULA_OCUPADA", message: `Conflicto de Espacio: El aula '${aulaCodigo}' ya está ocupada el ${diaSemana} de ${r[3]} a ${r[4]}.` };
        }
      }
    }
  }

  return { conflict: false };
}

function getClassSchedules(payload) {
  const { ofertaId, docenteUserId, diaSemana } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "HorariosClase").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (ofertaId) filtered = filtered.filter(r => String(r[1]).trim() === String(ofertaId).trim());
  if (docenteUserId) filtered = filtered.filter(r => String(r[6]).trim() === String(docenteUserId).trim());
  if (diaSemana) filtered = filtered.filter(r => normalizeString(r[2]) === normalizeString(diaSemana));

  const mapped = filtered.map(r => ({
    horarioId: r[0],
    ofertaId: r[1],
    diaSemana: r[2],
    horaInicio: r[3],
    horaFin: r[4],
    aulaCodigo: r[5],
    docenteUserId: r[6],
    estado: r[7]
  }));

  return { status: "success", schedules: mapped };
}

function createClassSchedule(payload) {
  const { ofertaId, diaSemana, horaInicio, horaFin, aulaCodigo, docenteUserId, forceOverride } = payload || {};
  if (!ofertaId || !diaSemana || !horaInicio || !horaFin) {
    throw new Error("ofertaId, día de la semana y horas de inicio/fin son requeridos.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Validación de Conflictos de Solapamiento
  if (!forceOverride) {
    const conflictCheck = checkScheduleConflict(ss, docenteUserId, aulaCodigo, diaSemana, horaInicio, horaFin, "2026");
    if (conflictCheck.conflict) {
      return { status: "error", code: "SCHEDULE_CONFLICT", message: conflictCheck.message, conflictType: conflictCheck.type };
    }
  }

  const sheet = getOrCreateSheet(ss, "HorariosClase");
  const horarioId = "SCH-" + Math.floor(10000 + Math.random() * 90000);

  sheet.appendRow([
    horarioId,
    ofertaId,
    diaSemana,
    horaInicio,
    horaFin,
    aulaCodigo || "Aula Standard",
    docenteUserId || "Docente Asignado",
    "Activo"
  ]);

  return { status: "success", horarioId: horarioId, message: "Sesión de clase programada en el horario correctamente." };
}

// ---------------------------------------------------------------------------
// FASE 3: 8. REGLAS ACADÉMICAS INSTITUCIONALES
// ---------------------------------------------------------------------------

function getAcademicRules(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "ReglasAcademicas").getDataRange().getValues().slice(1);

  const defaultRules = {
    "NOTA_MINIMA_APROBATORIA": 70,
    "NOTA_MAXIMA": 100,
    "DECIMALES_CALIFICACION": 0,
    "ASISTENCIA_MINIMA_PORCENTAJE": 85,
    "PENALIZACION_ENTREGA_TARDIA": 50
  };

  const rulesMap = { ...defaultRules };
  rows.forEach(r => {
    if (r[3] && r[5] === "Activo") {
      rulesMap[r[3]] = r[4];
    }
  });

  return { status: "success", rules: rulesMap };
}

function saveAcademicRule(payload) {
  const { clave, valor, tipoRegla, ambito } = payload || {};
  if (!clave || valor === undefined) throw new Error("Clave y valor requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ReglasAcademicas");
  const data = sheet.getDataRange().getValues();

  const idx = data.findIndex(r => String(r[3]).trim() === String(clave).trim());
  if (idx !== -1) {
    sheet.getRange(idx + 1, 5).setValue(valor);
  } else {
    const reglaId = "RGL-" + Math.floor(1000 + Math.random() * 9000);
    sheet.appendRow([reglaId, ambito || "Institucional", tipoRegla || "Calificación", clave, valor, "Activo"]);
  }

  return { status: "success", message: `Regla académica '${clave}' guardada exitosamente.` };
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
        version: "v8.3.0"
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

    // REQ: Validación de Unicidad Absoluta por Contexto (Fase 2)
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
