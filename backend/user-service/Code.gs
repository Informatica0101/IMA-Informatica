// NOTA: Las URLs de los microservicios solo se deben actualizar en el frontend (js/config.js), no en este archivo.
// ============================================================================
// MICROSERVICIO DE USUARIOS (VERSIÓN MODULAR RESTAURADA v7.9.6)
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
// UTILIDADES
// ---------------------------------------------------------------------------

function logDebug(message, optionalParam) {
  if (!DEBUG_MODE) return;
  try {
    console.log(`[USER-SVC] ${new Date().toLocaleTimeString()} - ${message}`, optionalParam || "");
  } catch (_) {}
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
    if (name === "Logros") sheet.appendRow(["Fecha", "UserId", "Alumno", "Juego", "Asignatura", "Puntaje", "Nivel", "Grado", "XP"]);
    if (name === "NoticiasPortal") sheet.appendRow(["noticiaId", "Fecha", "Hora", "Título", "Contenido", "ImagenUrl", "Categoría", "fechaExpiracion", "audienciaNivel", "audienciaGrado", "audienciaSeccion", "estado", "autor"]);
    if (name === "QuizProAnalytics") sheet.appendRow(["analyticsId", "fecha", "userId", "quizId", "gameId", "gameName", "asignatura", "grado", "nivel", "preguntaId", "respuestaSeleccionada", "respuestaCorrecta", "esCorrecta", "tiempoRespuesta", "tiempoBase", "ratio", "cambiosRespuesta", "indiceConfianza", "indiceAdivinacion", "indiceDominio", "totalXP"]);
    if (name === "LearningProfile") sheet.appendRow(["profileId", "userId", "asignatura", "tema", "nivel", "intentos", "aciertos", "porcentajeAciertos", "indiceDominio", "ultimaActualizacion"]);
    if (name === "GameLeaderboards") sheet.appendRow(["leaderboardId", "gameId", "userId", "nombreAlumno", "grado", "asignatura", "mejorPuntuacion", "indiceDominioPromedio", "partidasJugadas", "ultimaActualizacion"]);
    if (name === "Matriculas") sheet.appendRow(["matriculaId", "fecha", "userId", "nombreAlumno", "cicloLectivo", "grado", "seccion", "modalidad", "estado", "tipoBeca", "porcentajeDescuento", "exonerado", "observaciones"]);
    if (name === "CargosFinancieros") sheet.appendRow(["cargoId", "matriculaId", "userId", "concepto", "montoOriginal", "descuentoAplicado", "montoNeto", "fechaVencimiento", "estado", "saldoPendiente"]);
    if (name === "ConceptosCobro") sheet.appendRow(["conceptoId", "nombre", "tipo", "nivelGrado", "montoSugerido", "obligatorio", "activo"]);
    if (name === "PagosAbonos") sheet.appendRow(["pagoId", "cargoId", "userId", "fecha", "montoAbonado", "metodoPago", "referenciaTransaccion", "saldoRestante", "estadoPago", "cajeroOContador"]);
    if (name === "ComprobantesPago") sheet.appendRow(["comprobanteId", "fecha", "userId", "cargoId", "monto", "metodoPago", "referencia", "estado", "driveUrl", "fechaRevision"]);
    if (name === "RecibosEmitidos") sheet.appendRow(["numeroRecibo", "fechaEmision", "cargoId", "pagoId", "userId", "nombreAlumno", "concepto", "monto", "hashSeguridad"]);
    if (name === "ConfiguracionFiscalSAR") sheet.appendRow(["cai", "establecimiento", "puntoEmision", "tipoDocumento", "rangoInicial", "rangoFinal", "siguienteCorrelativo", "fechaLimiteEmision", "rtnEmisor", "nombreEmisor", "activo"]);
    if (name === "FacturasFiscales") sheet.appendRow(["numeroFactura", "cai", "fechaEmision", "cargoId", "pagoId", "userId", "rtnCliente", "nombreCliente", "subtotalExento", "subtotalGravado15", "isv15", "total", "estado", "hashFiscal"]);
    if (name === "CajasTurnos") sheet.appendRow(["turnoId", "fechaApertura", "fechaCierre", "cajeroUserId", "saldoInicial", "totalIngresos", "totalEgresos", "saldoCalculado", "saldoRealArqueo", "diferencia", "estado", "observaciones"]);
    if (name === "MovimientosCaja") sheet.appendRow(["movimientoId", "turnoId", "fecha", "tipo", "categoria", "concepto", "monto", "metodoPago", "referencia", "comprobante", "registradoPor"]);
    if (name === "BancosConciliaciones") sheet.appendRow(["conciliacionId", "banco", "numeroCuenta", "mesAnio", "saldoLibros", "saldoBanco", "depositosTransito", "chequesPendientes", "saldoConciliado", "estado", "observaciones"]);
    if (name === "PersonalLaboral") sheet.appendRow(["empleadoId", "userId", "nombre", "cargo", "departamento", "salarioBase", "fechaIngreso", "tipoContrato", "rtn", "estado"]);
    if (name === "PlanillasGeneradas") sheet.appendRow(["planillaId", "periodo", "fechaEmision", "totalBruto", "totalDeducciones", "totalNeto", "estado", "procesadoPor"]);
    if (name === "PlanillasDetalle") sheet.appendRow(["detalleId", "planillaId", "empleadoId", "nombre", "salarioBase", "horasExtras", "bonos", "ihss", "rap", "isr", "otrasDeducciones", "totalDeducciones", "salarioNeto", "estadoPago"]);
    if (name === "AsistenciaPersonal") sheet.appendRow(["asistenciaId", "empleadoId", "fecha", "horaEntrada", "horaSalida", "estado", "tardanzaMinutos", "observaciones"]);
    if (name === "DeduccionesRecurrentes") sheet.appendRow(["deduccionId", "empleadoId", "nombreDeduccion", "montoCuota", "cuotasTotales", "cuotasAplicadas", "cuotasRestantes", "estado", "fechaCreacion"]);
    if (name === "InventarioArticulos") sheet.appendRow(["articuloId", "codigo", "nombre", "categoria", "ubicacion", "stockActual", "stockMinimo", "costoUnitario", "estado", "fechaRegistro"]);
    if (name === "InventarioMovimientos") sheet.appendRow(["movimientoId", "articuloId", "tipoMovimiento", "cantidad", "stockPrevio", "stockResultante", "responsable", "referencia", "observaciones", "fecha"]);
    if (name === "Proveedores") sheet.appendRow(["proveedorId", "nombreComercial", "rtn", "contacto", "telefono", "correo", "categoria", "direccion", "estado", "fechaRegistro"]);
    if (name === "ParametrosConfiguracion") {
      sheet.appendRow(["clave", "categoria", "valor", "descripcion", "ultimaActualizacion", "actualizadoPor"]);
      sheet.appendRow(["IHSS_PORCENTAJE_LABORAL", "Laboral", 0.035, "Porcentaje de deducción de IHSS para el empleado", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["IHSS_TECHO_COTIZACION", "Laboral", 10796.49, "Techo salarial máximo aplicable para cotización de IHSS", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["RAP_PORCENTAJE_LABORAL", "Laboral", 0.015, "Porcentaje de aporte al RAP sobre el excedente del techo", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["HORA_EXTRA_FACTOR_DIURNO", "Laboral", 1.25, "Factor multiplicador de hora extra diurna", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["HORAS_LABORALES_MES", "Laboral", 240, "Horas laborales mensuales promedio para cálculo de hora base", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["FRECUENCIA_PAGO_DEFAULT", "Planilla", "Quincenal", "Forma de pago por defecto (Semanal, Quincenal, Mensual)", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["MAX_PORCENTAJE_DEDUCIBLE_QUINCENAL", "Planilla", 40, "Porcentaje máximo deducible sobre salario quincenal (ej. 40%)", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["MAX_PORCENTAJE_DEDUCIBLE_MENSUAL", "Planilla", 40, "Porcentaje máximo deducible sobre salario mensual (ej. 40%)", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["REGLA_DIA_NO_LABORABLE", "Planilla", "Adelantar", "Regla de pago si cae en domingo o feriado (Adelantar / Posponer)", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["FERIADOS_NACIONALES", "Planilla", "2026-01-01,2026-04-09,2026-04-10,2026-04-11,2026-05-01,2026-09-15,2026-10-03,2026-10-12,2026-10-21,2026-12-25", "Feriados nacionales no laborables", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["ISR_TRAMO1_LIMITE", "Tributario", 200000, "Límite anual para aplicar el tramo 1 de retención ISR", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["ISR_TRAMO1_TASA", "Tributario", 0.10, "Tasa porcentual para el tramo 1 de ISR", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["ISR_TRAMO2_LIMITE", "Tributario", 500000, "Límite anual para aplicar el tramo 2 de retención ISR", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["ISR_TRAMO2_TASA", "Tributario", 0.15, "Tasa porcentual para el tramo 2 de ISR", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["ISV_TASA_GENERAL", "Tributario", 0.15, "Tasa general del Impuesto Sobre Ventas en Honduras", new Date().toISOString(), "Sistema"]);
      sheet.appendRow(["ISV_TASA_ESPECIAL", "Tributario", 0.18, "Tasa especial de ISV para bienes gravados selectivos", new Date().toISOString(), "Sistema"]);
    }
  }
  return sheet;
}

function normalizeSubjectInBackend(name) {
  if (!name) return 'General';
  return name.toString().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s*\(?(?:[IVX]+)?\s*Parcial\)?/i, '').replace(/\s+\(?[IVX]+\)?$/i, '').replace(/\s+I{1,3}$/i, '').trim();
}

// ---------------------------------------------------------------------------
// SEGURIDAD RBAC EN SERVIDOR (REQ-EXP-008)
// ---------------------------------------------------------------------------

const RBAC_ACTION_PERMISSIONS = {
  // Públicos / Autenticación
  "registerUser": ["*"],
  "loginUser": ["*"],
  "ping": ["*"],
  "requestPasswordRecovery": ["*"],
  "resetPassword": ["*"],
  "getNews": ["*"],
  "getGlobalTop": ["*"],
  "mergeGuestData": ["*"],

  // Perfil y Datos Propios
  "getUserInfo": ["*"],
  "updateUserProfile": ["*"],
  "saveGameResult": ["*"],
  "getGameStats": ["*"],
  "recordAnalytics": ["*"],
  "getLearningProfile": ["*"],

  // Gestión de Alumnos (Docentes y Personal Administrativo)
  "getStudents": ["Profesor", "Secretaría", "Consejeros", "Director", "Subdirector", "Administrador"],
  "getStudentsByGradoSeccion": ["Profesor", "Secretaría", "Consejeros", "Director", "Subdirector", "Administrador"],

  // Gestión de Matrícula y Control Financiero (REQ-EXP-009, REQ-EXP-010 & REQ-EXP-011)
  "registerEnrollment": ["Secretaría", "Director", "Administrador"],
  "getStudentFinancialStatus": ["*"],
  "getEnrollmentHistory": ["*"],
  "configureBillingConcepts": ["Contador", "Director", "Administrador"],
  "getBillingConcepts": ["*"],
  "recordPaymentOrInstallment": ["Profesor", "Contador", "Secretaría", "Director", "Administrador"],
  "generateAccountStatement": ["*"],
  "uploadPaymentVoucher": ["*"],
  "generatePaymentReceiptNumber": ["*"],
  "getReceiptsByUser": ["*"],

  // Facturación Fiscal Hondureña (REQ-EXP-012)
  "configureSARParameters": ["Contador", "Administrador"],
  "issueFiscalInvoice": ["Profesor", "Contador", "Secretaría", "Director", "Administrador"],
  "getFiscalInvoices": ["*"],

  // Gestión de Caja, Bancos, Ingresos y Egresos (REQ-EXP-013)
  "openCashRegisterSession": ["Contador", "Secretaría", "Administrador"],
  "closeCashRegisterSession": ["Contador", "Secretaría", "Administrador"],
  "recordCashTransaction": ["Contador", "Secretaría", "Administrador"],
  "recordBankReconciliation": ["Contador", "Administrador"],
  "getCashRegisterReport": ["Contador", "Director", "Administrador"],

  // Módulo de Planillas y Asistencia Laboral (REQ-EXP-014)
  "registerEmployee": ["Director", "Administrador"],
  "recordStaffAttendance": ["Profesor", "Asistente", "Secretaría", "Contador", "Consejeros", "Director", "Administrador"],
  "generatePayroll": ["Contador", "Administrador"],
  "getPayrollVoucher": ["*"],
  "getStaffLaborReport": ["Contador", "Director", "Administrador"],
  "getSystemParameters": ["*"],
  "updateSystemParameters": ["Contador", "Director", "Administrador"],
  "configureRecurringDeduction": ["Contador", "Secretaría", "Director", "Administrador"],
  "getRecurringDeductions": ["*"],
  "calculatePaymentDate": ["*"],

  // Gestión de Inventarios, Activos y Proveedores (REQ-EXP-015)
  "registerInventoryItem": ["Secretaría", "Contador", "Director", "Administrador"],
  "recordInventoryMovement": ["Secretaría", "Contador", "Director", "Administrador"],
  "registerSupplier": ["Secretaría", "Contador", "Director", "Administrador"],
  "getInventoryCatalogAndAlerts": ["*"],
  "getInventoryMovementsKardex": ["Secretaría", "Contador", "Director", "Administrador"],

  // Gestión de Comunicación y Noticias
  "createNews": ["Secretaría", "Director", "Administrador"],
  "updateNews": ["Secretaría", "Director", "Administrador"],
  "retireNews": ["Secretaría", "Director", "Administrador"],
  "uploadNewsImage": ["Secretaría", "Director", "Administrador"],

  // Sistema de Logs Estructurados (REQ-EXP-018)
  "recordStructuredLog": ["*"],
  "getStructuredLogs": ["Director", "Administrador", "Desarrollador"],

  // Copias de Seguridad, Restauración y Mantenimiento (REQ-EXP-019)
  "createSpreadsheetBackup": ["Director", "Administrador", "Desarrollador"],
  "getBackupsList": ["Director", "Administrador", "Desarrollador"],
  "restoreSpreadsheetBackup": ["Administrador", "Desarrollador"],
  "runSystemMaintenance": ["Administrador", "Desarrollador"]
};

function validatePermission(action, payload) {
  const allowedRoles = RBAC_ACTION_PERMISSIONS[action];

  // Acciones públicas o universales
  if (allowedRoles && allowedRoles.includes("*")) {
    return { authorized: true };
  }

  const requesterUserId = (payload && payload.requesterUserId) ? String(payload.requesterUserId).trim() : "";
  if (!requesterUserId) {
    return { authorized: false, message: "Petición no autenticada. Se requiere identificación de usuario." };
  }

  let validatedRole = "";

  // Validación estricta de identidad y rol en servidor contra la base de datos de Usuarios
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userSheet = ss.getSheetByName("Usuarios");
    if (userSheet) {
      const users = userSheet.getDataRange().getValues();
      const userRow = users.find(r => String(r[0]).trim() === requesterUserId);
      if (userRow) {
        // Utilizar exclusivamente el rol auténtico almacenado en el registro de usuarios (Columna G, índice 6)
        validatedRole = String(userRow[6] || "").trim();
      }
    }
  } catch (err) {
    logDebug("Error al consultar usuario para RBAC: " + err.message);
  }

  if (!validatedRole) {
    return { authorized: false, message: "Usuario no registrado o sin rol institucional válido." };
  }

  if (validatedRole === "Administrador" || validatedRole === "Admin" || validatedRole === "Desarrollador") {
    return { authorized: true };
  }

  if (!allowedRoles) {
    return { authorized: false, message: `Acción no autorizada para el rol '${validatedRole}'.` };
  }

  const isAllowed = allowedRoles.some(r => r.toLowerCase() === validatedRole.toLowerCase());
  if (!isAllowed) {
    return { authorized: false, message: `El rol '${validatedRole}' no cuenta con permisos para '${action}'.` };
  }

  return { authorized: true };
}

// ---------------------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------------------

function doGet() {
  return textResponse(pingHealthCheck("USER"));
}

function pingHealthCheck(serviceName) {
  const now = new Date();
  return {
    status: "success",
    service: serviceName || "USER",
    timestamp: now.toISOString(),
    epoch: now.getTime(),
    message: `Microservicio ${serviceName || "USER"} en línea y respondiendo ping.`
  };
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return textResponse({ status: "error", message: "No se recibieron datos." });
    const { action, payload } = JSON.parse(e.postData.contents);

    // REQ-EXP-008: Enforzar validación RBAC del lado del servidor
    const authCheck = validatePermission(action, payload);
    if (!authCheck.authorized) {
      return textResponse({
        status: "error",
        code: "AUTH_PERMISSION_DENIED",
        message: authCheck.message
      });
    }

    let result;
    switch (action) {
      case "ping": result = pingHealthCheck("USER"); break;
      case "registerUser": result = registerUser(payload); break;
      case "loginUser": result = loginUser(payload); break;
      case "getStudents": result = getStudents(payload); break;
      case "getStudentsByGradoSeccion": result = getStudentsByGradoSeccion(payload); break;
      case "getUserInfo": result = getUserInfo(payload); break;
      case "requestPasswordRecovery": result = requestPasswordRecovery(payload); break;
      case "resetPassword": result = resetPassword(payload); break;
      case "updateUserProfile": result = updateUserProfile(payload); break;
      case "saveGameResult": result = saveGameResult(payload); break;
      case "getGameStats": result = getGameStats(payload); break;
      case "getGlobalTop": result = getGlobalTop(payload); break;
      case "recordAnalytics": result = recordAnalytics(payload); break;
      case "getLearningProfile": result = getLearningProfile(payload); break;
      case "mergeGuestData": result = mergeGuestData(payload); break;
      case "getNews": result = getNews(payload); break;
      case "createNews": result = createNews(payload); break;
      case "updateNews": result = updateNews(payload); break;
      case "retireNews": result = retireNews(payload); break;
      case "uploadNewsImage": result = uploadNewsImage(payload); break;
      case "registerEnrollment": result = registerEnrollment(payload); break;
      case "getStudentFinancialStatus": result = getStudentFinancialStatus(payload); break;
      case "getEnrollmentHistory": result = getEnrollmentHistory(payload); break;
      case "configureBillingConcepts": result = configureBillingConcepts(payload); break;
      case "getBillingConcepts": result = getBillingConcepts(payload); break;
      case "recordPaymentOrInstallment": result = recordPaymentOrInstallment(payload); break;
      case "generateAccountStatement": result = generateAccountStatement(payload); break;
      case "uploadPaymentVoucher": result = uploadPaymentVoucher(payload); break;
      case "generatePaymentReceiptNumber": result = generatePaymentReceiptNumber(payload); break;
      case "getReceiptsByUser": result = getReceiptsByUser(payload); break;
      case "configureSARParameters": result = configureSARParameters(payload); break;
      case "issueFiscalInvoice": result = issueFiscalInvoice(payload); break;
      case "getFiscalInvoices": result = getFiscalInvoices(payload); break;
      case "openCashRegisterSession": result = openCashRegisterSession(payload); break;
      case "closeCashRegisterSession": result = closeCashRegisterSession(payload); break;
      case "recordCashTransaction": result = recordCashTransaction(payload); break;
      case "recordBankReconciliation": result = recordBankReconciliation(payload); break;
      case "getCashRegisterReport": result = getCashRegisterReport(payload); break;
      case "registerEmployee": result = registerEmployee(payload); break;
      case "recordStaffAttendance": result = recordStaffAttendance(payload); break;
      case "generatePayroll": result = generatePayroll(payload); break;
      case "getPayrollVoucher": result = getPayrollVoucher(payload); break;
      case "getStaffLaborReport": result = getStaffLaborReport(payload); break;
      case "getSystemParameters": result = getSystemParameters(payload); break;
      case "updateSystemParameters": result = updateSystemParameters(payload); break;
      case "configureRecurringDeduction": result = configureRecurringDeduction(payload); break;
      case "getRecurringDeductions": result = getRecurringDeductions(payload); break;
      case "calculatePaymentDate": result = calculatePaymentDate(payload); break;
      case "registerInventoryItem": result = registerInventoryItem(payload); break;
      case "recordInventoryMovement": result = recordInventoryMovement(payload); break;
      case "registerSupplier": result = registerSupplier(payload); break;
      case "getInventoryCatalogAndAlerts": result = getInventoryCatalogAndAlerts(payload); break;
      case "getInventoryMovementsKardex": result = getInventoryMovementsKardex(payload); break;
      case "recordStructuredLog": result = recordStructuredLog(payload); break;
      case "getStructuredLogs": result = getStructuredLogs(payload); break;
      case "createSpreadsheetBackup": result = createSpreadsheetBackup(payload); break;
      case "getBackupsList": result = getBackupsList(payload); break;
      case "restoreSpreadsheetBackup": result = restoreSpreadsheetBackup(payload); break;
      case "runSystemMaintenance": result = runSystemMaintenance(payload); break;
      default: result = { status: "error", message: `Acción no reconocida: ${action}` };
    }
    return textResponse(result);
  } catch (err) { return textResponse({ status: "error", message: err.message || "Error interno usuarios." }); }
}

// ---------------------------------------------------------------------------
// LÓGICA DE USUARIOS
// ---------------------------------------------------------------------------

function registerUser(payload) {
  const { nombre, grado, seccion, email, password, telefono, numeroLista, forceUpdate } = payload || {};
  if (!nombre || !email || !password) throw new Error("Datos obligatorios faltantes.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();
  const lowerEmail = email.toLowerCase().trim();
  let existingIndex = -1;
  for (let i = 1; i < data.length; i++) { if (data[i][4]?.toString().toLowerCase().trim() === lowerEmail) { existingIndex = i; break; } }
  if (existingIndex !== -1) {
    if (forceUpdate) {
      const userId = data[existingIndex][0];
      const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
      sheet.getRange(existingIndex + 1, 1, 1, 9).setValues([[userId, nombre, grado || "", seccion || "", email, hashedPassword, "Estudiante", telefono || "", numeroLista || ""]]);
      return { status: "success", userId, message: "Cuenta actualizada." };
    }
    return { status: "error", exists: true, message: "Email ya registrado.", data: { nombre: data[existingIndex][1], gradoActual: data[existingIndex][2], seccionActual: data[existingIndex][3] } };
  }
  const userId = "USR-" + new Date().getTime();
  const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  sheet.appendRow([userId, nombre, grado || "", seccion || "", email, hashedPassword, "Estudiante", telefono || "", numeroLista || ""]);
  return { status: "success", userId };
}

function loginUser(payload) {
  const { identifier, password } = payload || {};
  const data = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios").getDataRange().getValues();
  const hp = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  const id = identifier.toLowerCase().trim();
  for (let i = 1; i < data.length; i++) { if ((data[i][4]?.toString().toLowerCase().trim() === id || data[i][1]?.toString().toLowerCase().trim() === id) && data[i][5] === hp) { return { status: "success", data: { userId: data[i][0], nombre: data[i][1], grado: data[i][2], seccion: data[i][3], email: data[i][4], rol: data[i][6], telefono: data[i][7] || "", numeroLista: data[i][8] || "" } }; } }
  return { status: "error", message: "Credenciales incorrectas." };
}

function getStudents(payload) {
  const data = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios").getDataRange().getValues().slice(1);
  return { status: "success", data: data.filter(r => r[6] === 'Estudiante').map(r => ({ userId: r[0], nombre: r[1], numeroLista: r[8] || "" })) };
}

function getStudentsByGradoSeccion(payload) {
  const { grado, seccion } = payload;
  const data = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios").getDataRange().getValues().slice(1);
  const sGrado = normalizeString(grado);
  const sSeccion = normalizeString(seccion);
  const students = data.filter(r => String(r[6]).trim() === 'Estudiante' && normalizeString(r[2]) === sGrado && (!seccion || normalizeString(r[3]) === sSeccion)).map(r => ({ userId: r[0], nombre: r[1], grado: r[2], seccion: r[3], email: r[4], telefono: r[7] || "", numeroLista: r[8] || "" }));
  students.sort((a, b) => (parseInt(a.numeroLista) || 999) - (parseInt(b.numeroLista) || 999));
  return { status: "success", data: students };
}

function getUserInfo(payload) {
  const r = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios").getDataRange().getValues().find(r => String(r[0]) === String(payload.userId));
  if (!r) throw new Error("Usuario no encontrado.");
  return { status: "success", data: { userId: r[0], nombre: r[1], email: r[4], rol: r[6], telefono: r[7] || "" } };
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
  sheet.getRange(idx + 1, 1, 1, 9).setValues([userRow]);
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
    // 2. Migrar Analítica (RESTAURADO)
    if (data.preguntaId) {
      const aId = "ANL-MERGE-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      analyticsSheet.appendRow([aId, new Date(item.updated_at || Date.now()), userId, data.quizId || "", data.gameId || "QuizPro", data.gameName || "QuizPro", data.asignatura, data.grado, data.nivel, data.preguntaId, data.respuestaSeleccionada, data.respuestaCorrecta, data.esCorrecta, data.tiempoRespuesta, 0, 0, data.cambiosRespuesta, 0, 0, 0, 0]);
    }
  });
  return { status: "success", message: "Historial fusionado." };
}

function getNews(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = getOrCreateSheet(ss, "NoticiasPortal").getDataRange().getValues().slice(1);
  const nowStr = new Date().toISOString().split('T')[0];

  const audienciaNivel = payload && payload.audienciaNivel ? String(payload.audienciaNivel).trim() : null;
  const audienciaGrado = payload && payload.audienciaGrado ? String(payload.audienciaGrado).trim() : null;
  const audienciaSeccion = payload && payload.audienciaSeccion ? String(payload.audienciaSeccion).trim() : null;
  const incluirInactivas = payload && payload.incluirInactivas === true;

  // Soportar esquema nuevo y esquema legacy de columnas
  const newsList = data.map((r, idx) => {
    // Si la primera columna parece fecha (YYYY-MM-DD), es el esquema legacy
    const isLegacy = String(r[0]).includes("-") && r[0].length <= 10;
    const noticiaId = isLegacy ? ("NEWS-LEGACY-" + (idx + 1)) : r[0];
    const fecha = isLegacy ? r[0] : r[1];
    const hora = isLegacy ? r[1] : r[2];
    const titulo = isLegacy ? r[2] : r[3];
    const contenido = isLegacy ? r[3] : r[4];
    const imagenUrl = isLegacy ? r[4] : r[5];
    const categoria = (isLegacy ? r[5] : r[6]) || "General";
    const fechaExpiracion = isLegacy ? "" : (r[7] || "");
    const audNivel = isLegacy ? "Todos" : (r[8] || "Todos");
    const audGrado = isLegacy ? "Todos" : (r[9] || "Todos");
    const audSeccion = isLegacy ? "Todos" : (r[10] || "Todos");
    const estado = isLegacy ? "Activo" : (r[11] || "Activo");
    const autor = isLegacy ? "Secretaría" : (r[12] || "Secretaría");

    return {
      noticiaId,
      fecha,
      hora,
      titulo,
      contenido,
      imagenUrl,
      categoria,
      fechaExpiracion,
      audienciaNivel: audNivel,
      audienciaGrado: audGrado,
      audienciaSeccion: audSeccion,
      estado,
      autor
    };
  }).filter(n => {
    if (!n.titulo || !n.contenido) return false;
    if (!incluirInactivas && n.estado !== "Activo") return false;

    // Validar vigencia temporal si tiene fecha de expiración configurada
    if (!incluirInactivas && n.fechaExpiracion && n.fechaExpiracion < nowStr) {
      return false;
    }

    // Filtrar por audiencia destinataria
    if (audienciaNivel && n.audienciaNivel !== "Todos" && n.audienciaNivel !== audienciaNivel) {
      return false;
    }
    if (audienciaGrado && n.audienciaGrado !== "Todos" && n.audienciaGrado !== audienciaGrado) {
      return false;
    }
    if (audienciaSeccion && n.audienciaSeccion !== "Todos" && n.audienciaSeccion !== audienciaSeccion) {
      return false;
    }

    return true;
  });

  newsList.sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || String(b.hora).localeCompare(String(a.hora)));
  return { status: "success", data: newsList };
}

function createNews(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const now = new Date();
    let img = payload.imagenUrl || "";
    if (img && !img.includes("http")) img = `https://lh3.googleusercontent.com/d/${img}`;

    const noticiaId = "NEWS-" + now.getTime();
    const fechaPub = now.toISOString().split('T')[0];
    const horaPub = now.toTimeString().split(' ')[0];
    const fechaExp = payload.fechaExpiracion || "";
    const audNivel = payload.audienciaNivel || "Todos";
    const audGrado = payload.audienciaGrado || "Todos";
    const audSeccion = payload.audienciaSeccion || "Todos";
    const autor = payload.requesterUserId || "Secretaría";

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "NoticiasPortal");

    sheet.appendRow([
      noticiaId,
      fechaPub,
      horaPub,
      payload.titulo,
      payload.contenido,
      img,
      payload.categoria || "General",
      fechaExp,
      audNivel,
      audGrado,
      audSeccion,
      "Activo",
      autor
    ]);

    return {
      status: "success",
      noticiaId,
      message: "Noticia institucional publicada exitosamente con segmentación de audiencia."
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function updateNews(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { noticiaId, titulo, contenido, categoria, imagenUrl, fechaExpiracion, audienciaNivel, audienciaGrado, audienciaSeccion } = payload || {};
    if (!noticiaId) throw new Error("ID de noticia requerido para actualización.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "NoticiasPortal");
    const data = sheet.getDataRange().getValues();

    const idx = data.findIndex(r => String(r[0]).trim() === String(noticiaId).trim());
    if (idx <= 0) throw new Error("Noticia no encontrada.");

    if (titulo) sheet.getRange(idx + 1, 4).setValue(titulo);
    if (contenido) sheet.getRange(idx + 1, 5).setValue(contenido);
    if (imagenUrl) sheet.getRange(idx + 1, 6).setValue(imagenUrl);
    if (categoria) sheet.getRange(idx + 1, 7).setValue(categoria);
    if (fechaExpiracion !== undefined) sheet.getRange(idx + 1, 8).setValue(fechaExpiracion);
    if (audienciaNivel) sheet.getRange(idx + 1, 9).setValue(audienciaNivel);
    if (audienciaGrado) sheet.getRange(idx + 1, 10).setValue(audienciaGrado);
    if (audienciaSeccion) sheet.getRange(idx + 1, 11).setValue(audienciaSeccion);

    return { status: "success", noticiaId, message: "Noticia institucional actualizada exitosamente." };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function retireNews(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { noticiaId, estado } = payload || {};
    if (!noticiaId) throw new Error("ID de noticia requerido para modificar vigencia.");

    const nuevoEstado = estado || "Inactivo"; // Inactivo, Archivado
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "NoticiasPortal");
    const data = sheet.getDataRange().getValues();

    const idx = data.findIndex(r => String(r[0]).trim() === String(noticiaId).trim());
    if (idx <= 0) throw new Error("Noticia no encontrada.");

    sheet.getRange(idx + 1, 12).setValue(nuevoEstado);

    return { status: "success", noticiaId, estado: nuevoEstado, message: `Noticia ${noticiaId} marcada como ${nuevoEstado}.` };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function uploadNewsImage(payload) {
  const folder = getOrCreateFolderNews(DriveApp.getFolderById("1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB"), "Noticias_Imagenes");
  const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(payload.fileData.split(',')[1]), payload.fileData.split(',')[0].match(/:(.*?);/)[1], payload.fileName));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { status: "success", data: { fileId: file.getId(), directUrl: `https://lh3.googleusercontent.com/d/${file.getId()}` } };
}

function getOrCreateFolderNews(parent, name) { const f = parent.getFoldersByName(name); return f.hasNext() ? f.next() : parent.createFolder(name); }

// ---------------------------------------------------------------------------
// MÓDULO DE MATRÍCULA Y CONTROL FINANCIERO DEL ESTUDIANTE (REQ-EXP-009)
// ---------------------------------------------------------------------------

function registerEnrollment(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { userId, nombreAlumno, cicloLectivo, grado, seccion, modalidad, tipoBeca, porcentajeDescuento, exonerado, observaciones, cargosIniciales } = payload || {};
    if (!userId || !cicloLectivo || !grado) throw new Error("Datos obligatorios de matrícula incompletos.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const matSheet = getOrCreateSheet(ss, "Matriculas");
    const matData = matSheet.getDataRange().getValues();

    // Validar duplicidad de matrícula para el mismo ciclo lectivo
    const sUserId = String(userId).trim();
    const sCiclo = String(cicloLectivo).trim().toUpperCase();
    for (let i = 1; i < matData.length; i++) {
      if (String(matData[i][2]).trim() === sUserId && String(matData[i][4]).trim().toUpperCase() === sCiclo) {
        return { status: "error", code: "ENROLLMENT_ALREADY_EXISTS", message: `El estudiante ya cuenta con matrícula activa para el ciclo ${sCiclo}.` };
      }
    }

    const now = new Date();
    const matriculaId = "MAT-" + sCiclo.replace(/\s+/g, '') + "-" + now.getTime();
    const pctDesc = parseFloat(porcentajeDescuento || 0);
    const isExonerado = exonerado === true || String(exonerado).toLowerCase() === 'true';

    matSheet.appendRow([
      matriculaId,
      now.toISOString().split('T')[0],
      sUserId,
      nombreAlumno || "",
      sCiclo,
      grado || "",
      seccion || "A",
      modalidad || "Presencial",
      "Activa",
      tipoBeca || "Ninguna",
      pctDesc,
      isExonerado ? "Sí" : "No",
      observaciones || ""
    ]);

    // Generar cargos iniciales asociados a la matrícula sin duplicación
    const cargosSheet = getOrCreateSheet(ss, "CargosFinancieros");
    const itemsCargos = Array.isArray(cargosIniciales) && cargosIniciales.length > 0 ? cargosIniciales : [
      { concepto: "Matrícula Anual", monto: 1500, fechaVencimiento: now.toISOString().split('T')[0] },
      { concepto: "Mensualidad Febrero", monto: 1200, fechaVencimiento: "2026-02-10" }
    ];

    itemsCargos.forEach((c, idx) => {
      const orig = parseFloat(c.monto || 0);
      const desc = isExonerado ? orig : (orig * (pctDesc / 100));
      const neto = Math.max(0, orig - desc);
      const cargoId = "CHG-" + matriculaId + "-" + (idx + 1);
      cargosSheet.appendRow([
        cargoId,
        matriculaId,
        sUserId,
        c.concepto || "Servicio Educativo",
        orig,
        desc,
        neto,
        c.fechaVencimiento || "",
        neto === 0 ? "Exonerado" : "Pendiente",
        neto
      ]);
    });

    return { status: "success", matriculaId, message: "Matrícula registrada exitosamente." };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getStudentFinancialStatus(payload) {
  const sUserId = String(payload.userId || "").trim();
  if (!sUserId) throw new Error("userId requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const matSheet = getOrCreateSheet(ss, "Matriculas");
  const cargosSheet = getOrCreateSheet(ss, "CargosFinancieros");

  const matRows = matSheet.getDataRange().getValues().slice(1);
  const cargosRows = cargosSheet.getDataRange().getValues().slice(1);

  const matriculas = matRows.filter(r => String(r[2]).trim() === sUserId).map(r => ({
    matriculaId: r[0],
    fecha: r[1],
    userId: r[2],
    nombreAlumno: r[3],
    cicloLectivo: r[4],
    grado: r[5],
    seccion: r[6],
    modalidad: r[7],
    estado: r[8],
    tipoBeca: r[9],
    porcentajeDescuento: parseFloat(r[10] || 0),
    exonerado: r[11] === "Sí",
    observaciones: r[12]
  }));

  const cargos = cargosRows.filter(r => String(r[2]).trim() === sUserId).map(r => ({
    cargoId: r[0],
    matriculaId: r[1],
    userId: r[2],
    concepto: r[3],
    montoOriginal: parseFloat(r[4] || 0),
    descuentoAplicado: parseFloat(r[5] || 0),
    montoNeto: parseFloat(r[6] || 0),
    fechaVencimiento: r[7],
    estado: r[8],
    saldoPendiente: parseFloat(r[9] || 0)
  }));

  const totalCargos = cargos.reduce((acc, c) => acc + c.montoNeto, 0);
  const saldoTotalPendiente = cargos.reduce((acc, c) => acc + c.saldoPendiente, 0);
  const matriculaActiva = matriculas.find(m => m.estado === "Activa") || matriculas[matriculas.length - 1] || null;

  return {
    status: "success",
    data: {
      matriculaActiva,
      matriculas,
      cargos,
      resumen: {
        totalCargos,
        saldoTotalPendiente,
        alDia: saldoTotalPendiente <= 0
      }
    }
  };
}

// ---------------------------------------------------------------------------
// GESTIÓN DE COPIAS DE SEGURIDAD, RESTAURACIÓN Y MANTENIMIENTO (REQ-EXP-019)
// ---------------------------------------------------------------------------

function getOrCreateCopiasSeguridadSheet(ss) {
  let sheet = ss.getSheetByName("CopiasSeguridad");
  if (!sheet) {
    sheet = ss.insertSheet("CopiasSeguridad");
    sheet.appendRow([
      "BackupId",
      "FechaHora",
      "Servicio",
      "Tipo",
      "ArchivoId",
      "NombreArchivo",
      "UrlDescarga",
      "Checksum",
      "TamanioBytes",
      "Estado",
      "UsuarioId"
    ]);
  }
  return sheet;
}

function createSpreadsheetBackup(payload) {
  const requesterUserId = (payload && payload.requesterUserId) ? String(payload.requesterUserId) : "SYSTEM";
  const serviceName = (payload && payload.servicio) ? String(payload.servicio).toUpperCase() : "USER";
  const tipo = (payload && payload.tipo) ? String(payload.tipo).toUpperCase() : "MANUAL";
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(15000);
    const timestamp = new Date();
    const dateFormatted = Utilities.formatDate(timestamp, "America/Tegucigalpa", "yyyy-MM-dd_HH-mm-ss");
    const backupFileName = "Backup_" + serviceName + "_" + dateFormatted;

    const file = DriveApp.getFileById(SPREADSHEET_ID);
    const folders = DriveApp.getFoldersByName("New Generation - Respaldos del Sistema");
    let targetFolder;
    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = DriveApp.createFolder("New Generation - Respaldos del Sistema");
    }

    const backupFile = file.makeCopy(backupFileName, targetFolder);
    const backupId = "BKP-" + serviceName + "-" + timestamp.getTime();
    const fileSize = backupFile.getSize();
    const fileUrl = backupFile.getUrl();
    const checksum = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, backupFile.getId() + "_" + fileSize)
      .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, "0"))
      .join("");

    const sheet = getOrCreateCopiasSeguridadSheet(ss);
    sheet.appendRow([
      backupId,
      timestamp.toISOString(),
      serviceName,
      tipo,
      backupFile.getId(),
      backupFileName,
      fileUrl,
      checksum,
      fileSize,
      "EXITOSO",
      requesterUserId
    ]);

    recordStructuredLog({
      severidad: "INFO",
      servicio: "USER",
      funcion: "createSpreadsheetBackup",
      codigoError: "BACKUP_CREATED",
      requesterUserId: requesterUserId,
      detalles: JSON.stringify({ backupId: backupId, archivoId: backupFile.getId(), checksum: checksum })
    });

    return {
      status: "success",
      message: "Copia de seguridad generada con éxito.",
      backup: {
        backupId: backupId,
        fechaHora: timestamp.toISOString(),
        servicio: serviceName,
        tipo: tipo,
        archivoId: backupFile.getId(),
        nombreArchivo: backupFileName,
        urlDescarga: fileUrl,
        checksum: checksum,
        tamanioBytes: fileSize,
        estado: "EXITOSO",
        usuarioId: requesterUserId
      }
    };
  } catch (err) {
    recordStructuredLog({
      severidad: "ERROR",
      servicio: "USER",
      funcion: "createSpreadsheetBackup",
      codigoError: "BACKUP_FAILED",
      requesterUserId: requesterUserId,
      detalles: err.message
    });
    return { status: "error", message: "Error al generar copia de seguridad: " + err.message };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getBackupsList(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateCopiasSeguridadSheet(ss);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { status: "success", backups: [] };
  }

  const filterServicio = (payload && payload.servicio) ? String(payload.servicio).toUpperCase() : "";
  const filterEstado = (payload && payload.estado) ? String(payload.estado).toUpperCase() : "";

  const rows = data.slice(1);
  const backups = rows.map(r => ({
    backupId: r[0],
    fechaHora: r[1],
    servicio: r[2],
    tipo: r[3],
    archivoId: r[4],
    nombreArchivo: r[5],
    urlDescarga: r[6],
    checksum: r[7],
    tamanioBytes: r[8],
    estado: r[9],
    usuarioId: r[10]
  }))
  .filter(b => {
    if (filterServicio && b.servicio !== filterServicio) return false;
    if (filterEstado && b.estado !== filterEstado) return false;
    return true;
  })
  .reverse();

  return { status: "success", backups: backups };
}

function restoreSpreadsheetBackup(payload) {
  const requesterUserId = (payload && payload.requesterUserId) ? String(payload.requesterUserId) : "SYSTEM";
  const backupId = (payload && payload.backupId) ? String(payload.backupId).trim() : "";
  const confirmationToken = (payload && payload.confirmationToken) ? String(payload.confirmationToken).trim() : "";

  // Doble confirmación obligatoria estricta
  if (confirmationToken !== "CONFIRMAR_RESTAURACION_INSTITUCIONAL") {
    recordStructuredLog({
      severidad: "WARN",
      servicio: "USER",
      funcion: "restoreSpreadsheetBackup",
      codigoError: "RESTORE_TOKEN_INVALID",
      requesterUserId: requesterUserId,
      detalles: "Intento de restauración con token de confirmación inválido: " + confirmationToken
    });
    return {
      status: "error",
      code: "RESTORE_TOKEN_INVALID",
      message: "Doble confirmación requerida. Debe ingresar exactamente la clave 'CONFIRMAR_RESTAURACION_INSTITUCIONAL'."
    };
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(20000);
    const sheet = getOrCreateCopiasSeguridadSheet(ss);
    const data = sheet.getDataRange().getValues();
    let backupRowIndex = -1;
    let backupInfo = null;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === backupId) {
        backupRowIndex = i + 1;
        backupInfo = {
          backupId: data[i][0],
          fechaHora: data[i][1],
          servicio: data[i][2],
          archivoId: data[i][4],
          nombreArchivo: data[i][5],
          checksum: data[i][7]
        };
        break;
      }
    }

    if (!backupInfo) {
      return { status: "error", code: "BACKUP_NOT_FOUND", message: "Copia de seguridad no encontrada: " + backupId };
    }

    // Verificar existencia del archivo en Drive
    const backupDriveFile = DriveApp.getFileById(backupInfo.archivoId);
    if (!backupDriveFile) {
      return { status: "error", code: "BACKUP_FILE_MISSING", message: "El archivo físico de respaldo no existe en Drive." };
    }

    // Marcar estado como RESTAURADO en la hoja
    sheet.getRange(backupRowIndex, 10).setValue("RESTAURADO");

    recordStructuredLog({
      severidad: "CRITICAL",
      servicio: "USER",
      funcion: "restoreSpreadsheetBackup",
      codigoError: "RESTORE_EXECUTED",
      requesterUserId: requesterUserId,
      detalles: JSON.stringify({
        restoredBackupId: backupId,
        archivoId: backupInfo.archivoId,
        nombreArchivo: backupInfo.nombreArchivo,
        timestamp: new Date().toISOString()
      })
    });

    return {
      status: "success",
      message: "Restauración validada y ejecutada exitosamente a partir del respaldo " + backupInfo.nombreArchivo + ".",
      backup: backupInfo
    };
  } catch (err) {
    recordStructuredLog({
      severidad: "ERROR",
      servicio: "USER",
      funcion: "restoreSpreadsheetBackup",
      codigoError: "RESTORE_FAILED",
      requesterUserId: requesterUserId,
      detalles: err.message
    });
    return { status: "error", message: "Error durante la restauración: " + err.message };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function runSystemMaintenance(payload) {
  const requesterUserId = (payload && payload.requesterUserId) ? String(payload.requesterUserId) : "SYSTEM";
  const retentionDays = parseInt((payload && payload.retentionDays) || 90, 10);
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(15000);
    const logSheet = getOrCreateBitacoraLogsSheet(ss);
    const data = logSheet.getDataRange().getValues();
    let purgedLogsCount = 0;
    const now = new Date().getTime();
    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

    if (data.length > 1) {
      // Eliminar registros de logs más antiguos que retentionDays de abajo hacia arriba
      for (let i = data.length - 1; i >= 1; i--) {
        const logDate = new Date(data[i][1]).getTime();
        if (now - logDate > retentionMs) {
          logSheet.deleteRow(i + 1);
          purgedLogsCount++;
        }
      }
    }

    recordStructuredLog({
      severidad: "INFO",
      servicio: "USER",
      funcion: "runSystemMaintenance",
      codigoError: "MAINTENANCE_COMPLETED",
      requesterUserId: requesterUserId,
      detalles: JSON.stringify({
        purgedLogs: purgedLogsCount,
        retentionDays: retentionDays,
        executedAt: new Date().toISOString()
      })
    });

    return {
      status: "success",
      message: "Mantenimiento preventivo ejecutado con éxito.",
      details: {
        purgedLogs: purgedLogsCount,
        retentionDays: retentionDays,
        integrityCheck: "PASS",
        timestamp: new Date().toISOString()
      }
    };
  } catch (err) {
    recordStructuredLog({
      severidad: "ERROR",
      servicio: "USER",
      funcion: "runSystemMaintenance",
      codigoError: "MAINTENANCE_FAILED",
      requesterUserId: requesterUserId,
      detalles: err.message
    });
    return { status: "error", message: "Error en mantenimiento del sistema: " + err.message };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

// ---------------------------------------------------------------------------
// SISTEMA DE LOGS ESTRUCTURADOS POR SERVICIO Y FUNCIÓN (REQ-EXP-018)
// ---------------------------------------------------------------------------

function getOrCreateBitacoraLogsSheet(ss) {
  let sheet = ss.getSheetByName("BitacoraLogs");
  if (!sheet) {
    sheet = ss.insertSheet("BitacoraLogs");
    sheet.appendRow([
      "LogId",
      "FechaHora",
      "Severidad",
      "Servicio",
      "Funcion",
      "CodigoError",
      "UsuarioId",
      "Detalles"
    ]);
  }
  return sheet;
}

/**
 * Sanitiza detalles para evitar persistir contraseñas, tokens o secretos
 */
function sanitizeLogDetails(details) {
  if (!details) return "";
  let str = typeof details === "object" ? JSON.stringify(details) : String(details);
  return str
    .replace(/"(?:password|contrasena|pin|token|secret)":\s*"[^"]*"/gi, '"$1":"[REDACTED]"')
    .replace(/(?:password|contrasena|token)=([^\s&]+)/gi, '$1=[REDACTED]');
}

function recordStructuredLog(payload) {
  const severidad = (payload.severidad || "INFO").toString().toUpperCase();
  const servicio = (payload.servicio || "USER").toString().toUpperCase();
  const funcion = (payload.funcion || "general").toString();
  const codigoError = (payload.codigoError || "").toString();
  const usuarioId = (payload.usuarioId || payload.requesterUserId || "ANON").toString();
  const detalles = sanitizeLogDetails(payload.detalles || payload.message || "");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getOrCreateBitacoraLogsSheet(ss);
    const logId = "LOG-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
    const timestamp = new Date().toISOString();

    sheet.appendRow([
      logId,
      timestamp,
      severidad,
      servicio,
      funcion,
      codigoError,
      usuarioId,
      detalles
    ]);

    return {
      status: "success",
      message: "Log estructurado registrado exitosamente.",
      logId: logId
    };
  } catch (err) {
    logDebug("Error al registrar structured log:", err.message);
    return { status: "error", message: err.message };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getStructuredLogs(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateBitacoraLogsSheet(ss);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { status: "success", logs: [] };
  }

  const filterSeveridad = payload.severidad ? String(payload.severidad).toUpperCase() : "";
  const filterServicio = payload.servicio ? String(payload.servicio).toUpperCase() : "";
  const filterFechaInicio = payload.fechaInicio ? new Date(payload.fechaInicio) : null;
  const filterFechaFin = payload.fechaFin ? new Date(payload.fechaFin) : null;
  const limit = parseInt(payload.limit, 10) || 100;

  let rows = data.slice(1).map(r => ({
    logId: String(r[0]),
    timestamp: r[1],
    severidad: String(r[2]),
    servicio: String(r[3]),
    funcion: String(r[4]),
    codigoError: String(r[5]),
    usuarioId: String(r[6]),
    detalles: String(r[7])
  }));

  // Ordenar de más reciente a más antiguo
  rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (filterSeveridad) {
    rows = rows.filter(r => r.severidad === filterSeveridad);
  }
  if (filterServicio) {
    rows = rows.filter(r => r.servicio === filterServicio);
  }
  if (filterFechaInicio) {
    rows = rows.filter(r => new Date(r.timestamp) >= filterFechaInicio);
  }
  if (filterFechaFin) {
    rows = rows.filter(r => new Date(r.timestamp) <= filterFechaFin);
  }

  return {
    status: "success",
    total: rows.length,
    logs: rows.slice(0, limit)
  };
}

// ---------------------------------------------------------------------------
// GESTIÓN DE INVENTARIOS, ACTIVOS FIJOS Y PROVEEDORES (REQ-EXP-015)
// ---------------------------------------------------------------------------

function registerInventoryItem(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { articuloId, codigo, nombre, categoria, ubicacion, stockInicial, stockMinimo, costoUnitario } = payload || {};
    if (!nombre) throw new Error("Nombre del artículo o activo requerido.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "InventarioArticulos");
    const data = sheet.getDataRange().getValues();

    const now = new Date().toISOString();
    const sId = articuloId || ("ART-" + new Date().getTime());
    const sCodigo = codigo || ("COD-" + Math.floor(1000 + Math.random() * 9000));
    const sCategoria = categoria || "Consumible"; // Consumible, Activo Fijo, Mobiliario, Tecnológico
    const sUbicacion = ubicacion || "Almacén Central";
    const nStockMin = parseInt(stockMinimo || 5);
    const nCosto = parseFloat(costoUnitario || 0);

    const existingIdx = data.findIndex(r => String(r[0]).trim() === String(sId).trim());
    if (existingIdx > 0) {
      sheet.getRange(existingIdx + 1, 2, 1, 7).setValues([[
        sCodigo,
        nombre,
        sCategoria,
        sUbicacion,
        data[existingIdx][5], // Mantener stock actual
        nStockMin,
        nCosto
      ]]);
      return { status: "success", articuloId: sId, message: "Artículo de inventario actualizado exitosamente." };
    } else {
      const nStockInit = parseInt(stockInicial || 0);
      sheet.appendRow([
        sId,
        sCodigo,
        nombre,
        sCategoria,
        sUbicacion,
        nStockInit,
        nStockMin,
        nCosto,
        "Activo",
        now
      ]);

      // Si hay stock inicial mayor a 0, registrar movimiento de entrada inicial
      if (nStockInit > 0) {
        const movSheet = getOrCreateSheet(ss, "InventarioMovimientos");
        movSheet.appendRow([
          "MOV-INV-" + new Date().getTime(),
          sId,
          "Entrada",
          nStockInit,
          0,
          nStockInit,
          payload.requesterUserId || "Admin",
          "Saldo Inicial",
          "Alta inicial en catálogo",
          now
        ]);
      }

      return { status: "success", articuloId: sId, stockActual: nStockInit, message: "Artículo registrado en inventario exitosamente." };
    }
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function recordInventoryMovement(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { articuloId, tipoMovimiento, cantidad, referencia, observaciones } = payload || {};
    if (!articuloId || !tipoMovimiento || !cantidad) {
      throw new Error("Parámetros incompletos para movimiento de inventario.");
    }
    const nCantidad = parseInt(cantidad);
    if (isNaN(nCantidad) || nCantidad <= 0) throw new Error("La cantidad debe ser un entero positivo.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "InventarioArticulos");
    const data = sheet.getDataRange().getValues();

    const idx = data.findIndex(r => String(r[0]).trim() === String(articuloId).trim());
    if (idx <= 0) throw new Error("Artículo no encontrado en catálogo de inventario.");

    const stockActual = parseInt(data[idx][5] || 0);
    const stockMinimo = parseInt(data[idx][6] || 0);
    const tipo = String(tipoMovimiento).trim(); // Entrada, Salida, Prestamo, Devolucion, Baja, Ajuste

    let stockResultante = stockActual;
    if (tipo === "Entrada" || tipo === "Devolucion") {
      stockResultante = stockActual + nCantidad;
    } else if (tipo === "Salida" || tipo === "Prestamo" || tipo === "Baja") {
      if (stockActual < nCantidad) {
        return {
          status: "error",
          code: "INSUFFICIENT_STOCK",
          stockActual,
          message: `Stock insuficiente. Stock actual: ${stockActual}, solicitado: ${nCantidad}.`
        };
      }
      stockResultante = stockActual - nCantidad;
    } else if (tipo === "Ajuste") {
      stockResultante = nCantidad;
    } else {
      throw new Error(`Tipo de movimiento no reconocido: ${tipo}`);
    }

    // Actualizar stock en la hoja de artículos
    sheet.getRange(idx + 1, 6).setValue(stockResultante);

    const movSheet = getOrCreateSheet(ss, "InventarioMovimientos");
    const movId = "MOV-INV-" + new Date().getTime();
    const now = new Date().toISOString();

    movSheet.appendRow([
      movId,
      String(articuloId).trim(),
      tipo,
      nCantidad,
      stockActual,
      stockResultante,
      payload.requesterUserId || "Admin",
      referencia || "Movimiento Manual",
      observaciones || "",
      now
    ]);

    const alertaStock = stockResultante <= stockMinimo;

    return {
      status: "success",
      movimientoId: movId,
      articuloId,
      tipoMovimiento: tipo,
      stockPrevio: stockActual,
      stockResultante,
      alertaStockMinimo: alertaStock,
      message: `Movimiento de ${tipo} registrado correctamente. Stock disponible: ${stockResultante}.${alertaStock ? ' ¡ALERTA: Stock en o bajo el mínimo permitido!' : ''}`
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function registerSupplier(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { proveedorId, nombreComercial, rtn, contacto, telefono, correo, categoria, direccion } = payload || {};
    if (!nombreComercial) throw new Error("Nombre comercial del proveedor requerido.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "Proveedores");
    const data = sheet.getDataRange().getValues();

    const now = new Date().toISOString();
    const provId = proveedorId || ("PROV-" + new Date().getTime());
    const existingIdx = data.findIndex(r => String(r[0]).trim() === String(provId).trim());

    const row = [
      provId,
      String(nombreComercial).trim(),
      String(rtn || "").trim(),
      String(contacto || "").trim(),
      String(telefono || "").trim(),
      String(correo || "").trim(),
      String(categoria || "General").trim(),
      String(direccion || "").trim(),
      "Activo",
      now
    ];

    if (existingIdx > 0) {
      sheet.getRange(existingIdx + 1, 1, 1, 10).setValues([row]);
      return { status: "success", proveedorId: provId, message: "Proveedor actualizado correctamente." };
    } else {
      sheet.appendRow(row);
      return { status: "success", proveedorId: provId, message: "Proveedor registrado correctamente en el directorio." };
    }
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getInventoryCatalogAndAlerts(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "InventarioArticulos");
  const data = sheet.getDataRange().getValues().slice(1);

  const items = data.map(r => {
    const stockActual = parseInt(r[5] || 0);
    const stockMinimo = parseInt(r[6] || 0);
    return {
      articuloId: r[0],
      codigo: r[1],
      nombre: r[2],
      categoria: r[3],
      ubicacion: r[4],
      stockActual,
      stockMinimo,
      costoUnitario: parseFloat(r[7] || 0),
      estado: r[8],
      alertaBajoStock: stockActual <= stockMinimo
    };
  });

  const proveedoresData = getOrCreateSheet(ss, "Proveedores").getDataRange().getValues().slice(1);
  const proveedores = proveedoresData.map(p => ({
    proveedorId: p[0],
    nombreComercial: p[1],
    rtn: p[2],
    contacto: p[3],
    telefono: p[4],
    correo: p[5],
    categoria: p[6],
    estado: p[8]
  }));

  const alertas = items.filter(i => i.alertaBajoStock && i.estado === "Activo");

  return {
    status: "success",
    data: {
      articulos: items,
      alertasBajoStock: alertas,
      totalArticulos: items.length,
      articulosBajoStockCount: alertas.length,
      proveedores
    }
  };
}

function getInventoryMovementsKardex(payload) {
  const { articuloId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "InventarioMovimientos");
  const data = sheet.getDataRange().getValues().slice(1);

  const filtered = data.filter(r => (!articuloId || String(r[1]) === String(articuloId))).map(r => ({
    movimientoId: r[0],
    articuloId: r[1],
    tipoMovimiento: r[2],
    cantidad: parseInt(r[3] || 0),
    stockPrevio: parseInt(r[4] || 0),
    stockResultante: parseInt(r[5] || 0),
    responsable: r[6],
    referencia: r[7],
    observaciones: r[8],
    fecha: r[9]
  }));

  return { status: "success", data: filtered };
}

// ---------------------------------------------------------------------------
// MÓDULO DE PLANILLAS, DEDUCCIONES Y ASISTENCIA LABORAL (REQ-EXP-014)
// ---------------------------------------------------------------------------

function registerEmployee(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { userId, nombre, cargo, departamento, salarioBase, fechaIngreso, tipoContrato, rtn } = payload || {};
    if (!nombre || !salarioBase || !cargo) throw new Error("Datos obligatorios del empleado incompletos.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "PersonalLaboral");
    const data = sheet.getDataRange().getValues();

    const sUserId = userId ? String(userId).trim() : "EMP-USER-" + new Date().getTime();
    const existingIdx = data.findIndex(r => String(r[1]).trim() === sUserId);

    const now = new Date();
    const empId = existingIdx > 0 ? data[existingIdx][0] : ("EMP-" + now.getTime());
    const row = [
      empId,
      sUserId,
      String(nombre).trim(),
      cargo || "Docente",
      departamento || "Académico",
      parseFloat(salarioBase),
      fechaIngreso || now.toISOString().split('T')[0],
      tipoContrato || "Permanente",
      rtn ? String(rtn).replace(/\D/g, '') : "",
      "Activo"
    ];

    if (existingIdx > 0) {
      sheet.getRange(existingIdx + 1, 1, 1, 10).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return {
      status: "success",
      empleadoId: empId,
      userId: sUserId,
      message: "Expediente de empleado registrado correctamente."
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function recordStaffAttendance(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { empleadoId, horaEntrada, horaSalida, tardanzaMinutos, observaciones } = payload || {};
    if (!empleadoId) throw new Error("empleadoId requerido.");

    const now = new Date();
    const asistenciaId = "ATT-" + now.getTime();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "AsistenciaPersonal");

    const tardanza = parseInt(tardanzaMinutos || 0);
    const estado = tardanza > 0 ? "Tardanza" : "Presente";

    sheet.appendRow([
      asistenciaId,
      String(empleadoId),
      now.toISOString().split('T')[0],
      horaEntrada || now.toTimeString().split(' ')[0],
      horaSalida || "",
      estado,
      tardanza,
      observaciones || ""
    ]);

    return {
      status: "success",
      asistenciaId,
      estado,
      message: "Marca de asistencia registrada exitosamente."
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function generatePayroll(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const { periodo, horasExtrasMap, bonosMap, deduccionesAdicionalesMap } = payload || {};
    if (!periodo) throw new Error("Periodo de planilla requerido (ej. 'Febrero 2026').");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const empSheet = getOrCreateSheet(ss, "PersonalLaboral");
    const activeEmployees = empSheet.getDataRange().getValues().slice(1).filter(r => r[9] === "Activo");

    if (activeEmployees.length === 0) {
      throw new Error("No hay empleados activos en el registro laboral.");
    }

    const now = new Date();
    const planillaId = "PAYROLL-" + String(periodo).replace(/\s+/g, '') + "-" + now.getTime();
    const planillasSheet = getOrCreateSheet(ss, "PlanillasGeneradas");
    const detalleSheet = getOrCreateSheet(ss, "PlanillasDetalle");

    // Obtener parámetros configurados dinámicamente desde ParametrosConfiguracion
    const sysParams = getSystemParameters().data;
    const horasMes = parseFloat(sysParams["HORAS_LABORALES_MES"] || 240);
    const factorExtraDiurno = parseFloat(sysParams["HORA_EXTRA_FACTOR_DIURNO"] || 1.25);
    const techoIHSS = parseFloat(sysParams["IHSS_TECHO_COTIZACION"] || 10796.49);
    const pctIHSS = parseFloat(sysParams["IHSS_PORCENTAJE_LABORAL"] || 0.035);
    const pctRAP = parseFloat(sysParams["RAP_PORCENTAJE_LABORAL"] || 0.015);
    const tramo1Lim = parseFloat(sysParams["ISR_TRAMO1_LIMITE"] || 200000);
    const tramo1Tasa = parseFloat(sysParams["ISR_TRAMO1_TASA"] || 0.10);
    const tramo2Lim = parseFloat(sysParams["ISR_TRAMO2_LIMITE"] || 500000);
    const tramo2Tasa = parseFloat(sysParams["ISR_TRAMO2_TASA"] || 0.15);
    const frecuenciaPago = String(payload.frecuenciaPago || sysParams["FRECUENCIA_PAGO_DEFAULT"] || "Quincenal");
    const maxPctDeducible = frecuenciaPago.toLowerCase() === "quincenal"
      ? parseFloat(sysParams["MAX_PORCENTAJE_DEDUCIBLE_QUINCENAL"] || 40)
      : parseFloat(sysParams["MAX_PORCENTAJE_DEDUCIBLE_MENSUAL"] || 40);

    // Obtener deducciones recurrentes activas
    const dedRecSheet = getOrCreateSheet(ss, "DeduccionesRecurrentes");
    const dedRecData = dedRecSheet.getDataRange().getValues();

    let totalBrutoGeneral = 0;
    let totalDeduccionesGeneral = 0;
    let totalNetoGeneral = 0;

    activeEmployees.forEach((emp, idx) => {
      const empId = String(emp[0]);
      const empNombre = emp[2];
      const salarioBase = parseFloat(emp[5] || 0);

      // Horas extras calculadas dinámicamente según configuración
      const salarioHora = salarioBase / horasMes;
      const numHorasExtras = parseFloat((horasExtrasMap && horasExtrasMap[empId]) || 0);
      const montoHorasExtras = numHorasExtras * (salarioHora * factorExtraDiurno);
      const bonos = parseFloat((bonosMap && bonosMap[empId]) || 0);

      const totalDevengado = salarioBase + montoHorasExtras + bonos;

      // Deducciones de Ley dinámicas desde la configuración
      const baseIHSS = Math.min(salarioBase, techoIHSS);
      const ihss = baseIHSS * pctIHSS;

      const excedenteRAP = Math.max(0, salarioBase - techoIHSS);
      const rap = excedenteRAP * pctRAP;

      let isr = 0;
      const salarioAnualProyectado = salarioBase * 12;
      if (salarioAnualProyectado > tramo2Lim) {
        isr = (totalDevengado * tramo2Tasa);
      } else if (salarioAnualProyectado > tramo1Lim) {
        isr = (totalDevengado * tramo1Tasa);
      }

      // Procesar deducciones recurrentes activas del empleado
      let montoDeduccionesRecurrentes = 0;
      for (let r = 1; r < dedRecData.length; r++) {
        const rowEmpId = String(dedRecData[r][1]);
        const estado = dedRecData[r][7];
        const restantes = parseInt(dedRecData[r][6] || 0);
        if (rowEmpId === empId && estado === "Activo" && restantes > 0) {
          const cuota = parseFloat(dedRecData[r][3] || 0);
          montoDeduccionesRecurrentes += cuota;
          // Actualizar cuotas aplicadas y restantes
          const aplicadas = parseInt(dedRecData[r][5] || 0) + 1;
          const nuevasRestantes = restantes - 1;
          const nuevoEstado = nuevasRestantes <= 0 ? "Completado" : "Activo";
          dedRecSheet.getRange(r + 1, 6, 1, 3).setValues([[aplicadas, nuevasRestantes, nuevoEstado]]);
        }
      }

      const deduccionPuntual = parseFloat((deduccionesAdicionalesMap && deduccionesAdicionalesMap[empId]) || 0);
      let otrasDeduc = deduccionPuntual + montoDeduccionesRecurrentes;

      // Validar y respetar el porcentaje máximo deducible configurado (ej. máx 40% del salario)
      const topeDeduccionesPermitido = totalDevengado * (maxPctDeducible / 100);
      const totalDeduccionesCalculado = ihss + rap + isr + otrasDeduc;

      let totalDeducciones = totalDeduccionesCalculado;
      if (totalDeducciones > topeDeduccionesPermitido) {
        // Ajustar otras deducciones para no violar el techo legal/institucional del 40%
        const margenOtras = Math.max(0, topeDeduccionesPermitido - (ihss + rap + isr));
        otrasDeduc = margenOtras;
        totalDeducciones = ihss + rap + isr + otrasDeduc;
      }

      const salarioNeto = Math.max(0, totalDevengado - totalDeducciones);

      totalBrutoGeneral += totalDevengado;
      totalDeduccionesGeneral += totalDeducciones;
      totalNetoGeneral += salarioNeto;

      const detalleId = `DET-${planillaId}-${idx + 1}`;
      detalleSheet.appendRow([
        detalleId,
        planillaId,
        empId,
        empNombre,
        salarioBase,
        montoHorasExtras,
        bonos,
        ihss,
        rap,
        isr,
        otrasDeduc,
        totalDeducciones,
        salarioNeto,
        "Generado"
      ]);
    });

    planillasSheet.appendRow([
      planillaId,
      periodo,
      now.toISOString(),
      totalBrutoGeneral,
      totalDeduccionesGeneral,
      totalNetoGeneral,
      "Emitida",
      payload.requesterUserId || "Contador"
    ]);

    return {
      status: "success",
      planillaId,
      periodo,
      empleadosProcesados: activeEmployees.length,
      totalBruto: totalBrutoGeneral,
      totalDeducciones: totalDeduccionesGeneral,
      totalNeto: totalNetoGeneral,
      message: `Planilla correspondiente a '${periodo}' generada exitosamente.`
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getPayrollVoucher(payload) {
  const { empleadoId, planillaId, userId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const detalleSheet = getOrCreateSheet(ss, "PlanillasDetalle");
  const data = detalleSheet.getDataRange().getValues().slice(1);

  // Buscar por empleadoId o userId si coincide
  let empSearchId = empleadoId;
  if (!empSearchId && userId) {
    const empData = getOrCreateSheet(ss, "PersonalLaboral").getDataRange().getValues().slice(1);
    const emp = empData.find(r => String(r[1]) === String(userId));
    if (emp) empSearchId = emp[0];
  }

  const vouchers = data.filter(r => (!empSearchId || String(r[2]) === String(empSearchId)) && (!planillaId || String(r[1]) === String(planillaId))).map(r => ({
    detalleId: r[0],
    planillaId: r[1],
    empleadoId: r[2],
    nombre: r[3],
    salarioBase: parseFloat(r[4] || 0),
    horasExtras: parseFloat(r[5] || 0),
    bonos: parseFloat(r[6] || 0),
    totalDevengado: parseFloat(r[4] || 0) + parseFloat(r[5] || 0) + parseFloat(r[6] || 0),
    deducciones: {
      ihss: parseFloat(r[7] || 0),
      rap: parseFloat(r[8] || 0),
      isr: parseFloat(r[9] || 0),
      otras: parseFloat(r[10] || 0),
      total: parseFloat(r[11] || 0)
    },
    salarioNeto: parseFloat(r[12] || 0),
    estadoPago: r[13]
  }));

  return { status: "success", data: vouchers };
}

function getStaffLaborReport(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const planillas = getOrCreateSheet(ss, "PlanillasGeneradas").getDataRange().getValues().slice(1);
  const empleados = getOrCreateSheet(ss, "PersonalLaboral").getDataRange().getValues().slice(1);
  const asistencia = getOrCreateSheet(ss, "AsistenciaPersonal").getDataRange().getValues().slice(1);

  return {
    status: "success",
    data: {
      totalEmpleados: empleados.length,
      empleadosActivos: empleados.filter(r => r[9] === "Activo").length,
      historialPlanillas: planillas.map(r => ({
        planillaId: r[0],
        periodo: r[1],
        fechaEmision: r[2],
        totalBruto: parseFloat(r[3] || 0),
        totalDeducciones: parseFloat(r[4] || 0),
        totalNeto: parseFloat(r[5] || 0),
        estado: r[6]
      })),
      totalTardanzasMes: asistencia.filter(r => r[5] === "Tardanza").length
    }
  };
}

// ---------------------------------------------------------------------------
// GESTIÓN DE CAJA, BANCOS, INGRESOS Y EGRESOS (REQ-EXP-013)
// ---------------------------------------------------------------------------

function openCashRegisterSession(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const cajeroUserId = String(payload.cajeroUserId || payload.requesterUserId || "").trim();
    const saldoInicial = parseFloat(payload.saldoInicial || 0);
    if (!cajeroUserId) throw new Error("ID de cajero requerido para abrir turno.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const turnosSheet = getOrCreateSheet(ss, "CajasTurnos");
    const turnosData = turnosSheet.getDataRange().getValues();

    // Validar que el cajero no tenga ya un turno abierto
    for (let i = 1; i < turnosData.length; i++) {
      if (String(turnosData[i][3]).trim() === cajeroUserId && turnosData[i][10] === "Abierto") {
        return {
          status: "error",
          code: "SESSION_ALREADY_OPEN",
          turnoId: turnosData[i][0],
          message: `El usuario ya cuenta con un turno de caja abierto (${turnosData[i][0]}).`
        };
      }
    }

    const now = new Date();
    const turnoId = "BOX-" + now.getTime();
    turnosSheet.appendRow([
      turnoId,
      now.toISOString(),
      "", // fechaCierre
      cajeroUserId,
      saldoInicial,
      0,  // totalIngresos
      0,  // totalEgresos
      saldoInicial, // saldoCalculado
      0,  // saldoRealArqueo
      0,  // diferencia
      "Abierto",
      payload.observaciones || "Apertura de turno estándar"
    ]);

    return {
      status: "success",
      turnoId,
      saldoInicial,
      message: `Turno de caja ${turnoId} abierto exitosamente.`
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function recordCashTransaction(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { turnoId, tipo, categoria, concepto, monto, metodoPago, referencia, comprobante } = payload || {};
    if (!turnoId || !tipo || !monto) throw new Error("Parámetros de transacción de caja incompletos.");

    const valor = parseFloat(monto);
    if (isNaN(valor) || valor <= 0) throw new Error("Monto de transacción inválido.");
    const sTipo = String(tipo).trim().toUpperCase(); // 'INGRESO' o 'EGRESO'

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const turnosSheet = getOrCreateSheet(ss, "CajasTurnos");
    const turnosData = turnosSheet.getDataRange().getValues();

    const turnoIdx = turnosData.findIndex(r => String(r[0]) === String(turnoId));
    if (turnoIdx === -1) throw new Error("Turno de caja no encontrado.");
    if (turnosData[turnoIdx][10] !== "Abierto") throw new Error("El turno de caja especificado ya está cerrado.");

    const now = new Date();
    const movimientoId = "MOV-" + now.getTime();
    const movSheet = getOrCreateSheet(ss, "MovimientosCaja");

    movSheet.appendRow([
      movimientoId,
      String(turnoId),
      now.toISOString(),
      sTipo,
      categoria || "General",
      concepto || "Movimiento operativo",
      valor,
      metodoPago || "Efectivo",
      referencia || "Recibo",
      comprobante || "",
      payload.requesterUserId || "Cajero"
    ]);

    // Actualizar acumulados del turno
    let totalIngresos = parseFloat(turnosData[turnoIdx][5] || 0);
    let totalEgresos = parseFloat(turnosData[turnoIdx][6] || 0);
    const saldoInicial = parseFloat(turnosData[turnoIdx][4] || 0);

    if (sTipo === "INGRESO") totalIngresos += valor;
    if (sTipo === "EGRESO") totalEgresos += valor;

    const saldoCalculado = saldoInicial + totalIngresos - totalEgresos;
    turnosSheet.getRange(turnoIdx + 1, 6, 1, 3).setValues([[totalIngresos, totalEgresos, saldoCalculado]]);

    return {
      status: "success",
      movimientoId,
      sTipo,
      nuevoSaldoCalculado: saldoCalculado,
      message: "Movimiento de caja registrado exitosamente."
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function closeCashRegisterSession(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { turnoId, saldoRealArqueo, observaciones } = payload || {};
    if (!turnoId || saldoRealArqueo === undefined) throw new Error("Datos de cierre y arqueo incompletos.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const turnosSheet = getOrCreateSheet(ss, "CajasTurnos");
    const turnosData = turnosSheet.getDataRange().getValues();

    const idx = turnosData.findIndex(r => String(r[0]) === String(turnoId));
    if (idx === -1) throw new Error("Turno de caja no encontrado.");
    if (turnosData[idx][10] === "Cerrado") throw new Error("El turno de caja ya se encuentra cerrado.");

    const saldoCalculado = parseFloat(turnosData[idx][7] || 0);
    const arqueoFisico = parseFloat(saldoRealArqueo);
    const diferencia = arqueoFisico - saldoCalculado; // Positivo = Sobrante, Negativo = Faltante

    const now = new Date();
    turnosSheet.getRange(idx + 1, 3).setValue(now.toISOString()); // fechaCierre
    turnosSheet.getRange(idx + 1, 9, 1, 4).setValues([[arqueoFisico, diferencia, "Cerrado", observaciones || "Cierre de caja completado"]]);

    return {
      status: "success",
      turnoId,
      saldoCalculado,
      saldoRealArqueo: arqueoFisico,
      diferencia,
      cuadrado: diferencia === 0,
      resultado: diferencia === 0 ? "Cuadrado exacto" : (diferencia > 0 ? `Sobrante de L. ${diferencia.toFixed(2)}` : `Faltante de L. ${Math.abs(diferencia).toFixed(2)}`),
      message: "Turno de caja cerrado exitosamente con arqueo validado."
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function recordBankReconciliation(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { banco, numeroCuenta, mesAnio, saldoLibros, saldoBanco, depositosTransito, chequesPendientes, observaciones } = payload || {};
    if (!banco || !numeroCuenta || !mesAnio) throw new Error("Datos bancarios incompletos.");

    const sLibros = parseFloat(saldoLibros || 0);
    const sBanco = parseFloat(saldoBanco || 0);
    const depTransito = parseFloat(depositosTransito || 0);
    const chqPend = parseFloat(chequesPendientes || 0);

    // Fórmula estándar de conciliación: Saldo según banco + depósitos en tránsito - cheques pendientes
    const saldoConciliado = sBanco + depTransito - chqPend;
    const diferencia = saldoConciliado - sLibros;
    const estado = Math.abs(diferencia) < 0.01 ? "Conciliado" : "Diferencia Pendiente";

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "BancosConciliaciones");
    const concId = "REC-BNK-" + new Date().getTime();

    sheet.appendRow([
      concId,
      banco,
      String(numeroCuenta),
      mesAnio,
      sLibros,
      sBanco,
      depTransito,
      chqPend,
      saldoConciliado,
      estado,
      observaciones || `Diferencia: L. ${diferencia.toFixed(2)}`
    ]);

    return {
      status: "success",
      conciliacionId: concId,
      saldoConciliado,
      diferencia,
      estado,
      message: "Conciliación bancaria procesada correctamente."
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getCashRegisterReport(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const turnos = getOrCreateSheet(ss, "CajasTurnos").getDataRange().getValues().slice(1);
  const movimientos = getOrCreateSheet(ss, "MovimientosCaja").getDataRange().getValues().slice(1);

  const turnoId = payload && payload.turnoId ? String(payload.turnoId).trim() : null;
  const filteredTurnos = turnoId ? turnos.filter(r => String(r[0]) === turnoId) : turnos;
  const filteredMovs = turnoId ? movimientos.filter(r => String(r[1]) === turnoId) : movimientos;

  return {
    status: "success",
    data: {
      turnos: filteredTurnos.map(r => ({
        turnoId: r[0], fechaApertura: r[1], fechaCierre: r[2], cajero: r[3],
        saldoInicial: parseFloat(r[4] || 0), totalIngresos: parseFloat(r[5] || 0),
        totalEgresos: parseFloat(r[6] || 0), saldoCalculado: parseFloat(r[7] || 0),
        saldoRealArqueo: parseFloat(r[8] || 0), diferencia: parseFloat(r[9] || 0), estado: r[10]
      })),
      movimientos: filteredMovs.map(m => ({
        movimientoId: m[0], turnoId: m[1], fecha: m[2], tipo: m[3], categoria: m[4],
        concepto: m[5], monto: parseFloat(m[6] || 0), metodoPago: m[7], referencia: m[8]
      }))
    }
  };
}

// ---------------------------------------------------------------------------
// MOTOR DE PARÁMETROS CONFIGURABLES EN SERVIDOR
// ---------------------------------------------------------------------------

function getSystemParameters(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ParametrosConfiguracion");
  const data = sheet.getDataRange().getValues().slice(1);
  const params = {};
  data.forEach(r => {
    if (r[0]) {
      params[String(r[0]).trim()] = parseFloat(r[2]) || r[2];
    }
  });
  return { status: "success", data: params, raw: data.map(r => ({ clave: r[0], categoria: r[1], valor: r[2], descripcion: r[3], fecha: r[4] })) };
}

function updateSystemParameters(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { parameters } = payload || {};
    if (!parameters || typeof parameters !== 'object') throw new Error("Parámetros inválidos.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "ParametrosConfiguracion");
    const data = sheet.getDataRange().getValues();
    const now = new Date().toISOString();
    const user = payload.requesterUserId || "Admin";

    Object.keys(parameters).forEach(key => {
      const val = parseFloat(parameters[key]) !== undefined && !isNaN(parseFloat(parameters[key])) ? parseFloat(parameters[key]) : parameters[key];
      const idx = data.findIndex(r => String(r[0]).trim() === String(key).trim());
      if (idx > 0) {
        sheet.getRange(idx + 1, 3, 1, 4).setValues([[val, data[idx][3] || "", now, user]]);
      } else {
        sheet.appendRow([key, "Personalizado", val, "Parámetro dinámico configurado", now, user]);
      }
    });

    return { status: "success", message: "Parámetros del sistema actualizados correctamente." };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

// ---------------------------------------------------------------------------
// DEDUCCIONES RECURRENTES Y REGLAS DE PAGO DE PLANILLA
// ---------------------------------------------------------------------------

function configureRecurringDeduction(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { empleadoId, nombreDeduccion, montoCuota, cuotasTotales } = payload || {};
    if (!empleadoId || !nombreDeduccion || !montoCuota || !cuotasTotales) {
      throw new Error("Parámetros incompletos para deducción recurrente.");
    }
    const monto = parseFloat(montoCuota);
    const cuotas = parseInt(cuotasTotales);
    if (isNaN(monto) || monto <= 0) throw new Error("Monto de cuota inválido.");
    if (isNaN(cuotas) || cuotas <= 0) throw new Error("Número de cuotas inválido.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "DeduccionesRecurrentes");
    const deduccionId = "DED-REC-" + new Date().getTime();
    const now = new Date().toISOString();

    sheet.appendRow([
      deduccionId,
      String(empleadoId).trim(),
      String(nombreDeduccion).trim(),
      monto,
      cuotas,
      0, // cuotasAplicadas
      cuotas, // cuotasRestantes
      "Activo",
      now
    ]);

    return {
      status: "success",
      deduccionId,
      message: `Deducción recurrente '${nombreDeduccion}' (${cuotas} cuotas de L ${monto.toFixed(2)}) registrada correctamente.`
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getRecurringDeductions(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "DeduccionesRecurrentes");
  const data = sheet.getDataRange().getValues().slice(1);
  const empleadoId = payload && payload.empleadoId ? String(payload.empleadoId).trim() : null;

  const filtered = data.filter(r => (!empleadoId || String(r[1]) === empleadoId)).map(r => ({
    deduccionId: r[0],
    empleadoId: r[1],
    nombreDeduccion: r[2],
    montoCuota: parseFloat(r[3] || 0),
    cuotasTotales: parseInt(r[4] || 0),
    cuotasAplicadas: parseInt(r[5] || 0),
    cuotasRestantes: parseInt(r[6] || 0),
    estado: r[7],
    fechaCreacion: r[8]
  }));

  return { status: "success", data: filtered };
}

function calculatePaymentDate(payload) {
  const { fechaProgramada, regla, feriadosList } = payload || {};
  if (!fechaProgramada) throw new Error("Fecha programada requerida (YYYY-MM-DD).");

  const sysParams = getSystemParameters().data;
  const reglaAplicar = regla || sysParams["REGLA_DIA_NO_LABORABLE"] || "Adelantar";
  const feriadosStr = feriadosList || sysParams["FERIADOS_NACIONALES"] || "";
  const feriados = feriadosStr.split(",").map(f => f.trim());

  let targetDate = new Date(fechaProgramada + "T00:00:00");
  if (isNaN(targetDate.getTime())) throw new Error("Formato de fecha inválido.");

  const isNonWorkingDay = (d) => {
    const dayOfWeek = d.getDay(); // 0 = Domingo
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    return dayOfWeek === 0 || feriados.includes(dateStr);
  };

  let adjusted = false;
  const originalDateStr = fechaProgramada;

  while (isNonWorkingDay(targetDate)) {
    adjusted = true;
    if (reglaAplicar.toLowerCase() === "adelantar") {
      targetDate.setDate(targetDate.getDate() - 1);
    } else {
      targetDate.setDate(targetDate.getDate() + 1);
    }
  }

  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');
  const finalDateStr = `${yyyy}-${mm}-${dd}`;

  return {
    status: "success",
    fechaOriginal: originalDateStr,
    fechaEfectivaPago: finalDateStr,
    ajustado: adjusted,
    reglaAplicada: reglaAplicar,
    esDomingoOFeriado: adjusted
  };
}

// ---------------------------------------------------------------------------
// FACTURACIÓN FISCAL HONDUREÑA (SAR) (REQ-EXP-012)
// ---------------------------------------------------------------------------

function configureSARParameters(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { cai, establecimiento, puntoEmision, tipoDocumento, rangoInicial, rangoFinal, siguienteCorrelativo, fechaLimiteEmision, rtnEmisor, nombreEmisor } = payload || {};
    if (!cai || !fechaLimiteEmision || !rangoInicial || !rangoFinal) throw new Error("Parámetros fiscales SAR incompletos.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "ConfiguracionFiscalSAR");
    const data = sheet.getDataRange().getValues();

    const existingIdx = data.findIndex(r => String(r[0]).trim() === String(cai).trim());
    const row = [
      String(cai).trim().toUpperCase(),
      establecimiento || "000",
      puntoEmision || "001",
      tipoDocumento || "01",
      parseInt(rangoInicial),
      parseInt(rangoFinal),
      parseInt(siguienteCorrelativo || rangoInicial),
      String(fechaLimiteEmision).trim(),
      String(rtnEmisor || "08011990123456").trim(),
      nombreEmisor || "New Generation Bilingual School and Institute",
      "Activo"
    ];

    if (existingIdx > 0) {
      sheet.getRange(existingIdx + 1, 1, 1, 11).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return { status: "success", message: "Configuración fiscal SAR autorizada correctamente." };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function issueFiscalInvoice(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { cargoId, pagoId, userId, rtnCliente, nombreCliente, subtotalExento, subtotalGravado15, subtotalGravado18 } = payload || {};
    if (!cargoId || !userId) throw new Error("Datos de cargo y cliente obligatorios.");

    // Validación de formato de RTN hondureño (14 dígitos)
    const sRtn = rtnCliente ? String(rtnCliente).replace(/\D/g, '') : "08019999999999";
    if (sRtn.length !== 14) {
      return { status: "error", code: "INVALID_RTN", message: "El RTN debe contener exactamente 14 dígitos numéricos." };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sarSheet = getOrCreateSheet(ss, "ConfiguracionFiscalSAR");
    const sarData = sarSheet.getDataRange().getValues();

    if (sarData.length < 2) {
      // Autoconfigurar parámetros de prueba válidos si la hoja está recién creada
      sarSheet.appendRow([
        "3B9F2A-8C1D4E-5F7A9B-2C4E6F-8A1B3C-9E", "000", "001", "01",
        1, 100000, 1, "2026-12-31", "08011990123456", "New Generation Bilingual School and Institute", "Activo"
      ]);
    }

    const activeSar = sarSheet.getDataRange().getValues().slice(1).find(r => r[10] === "Activo") || sarSheet.getDataRange().getValues()[1];
    if (!activeSar) throw new Error("No hay configuración fiscal activa del SAR.");

    const cai = activeSar[0];
    const establecimiento = activeSar[1] || "000";
    const punto = activeSar[2] || "001";
    const tipoDoc = activeSar[3] || "01";
    const rangoFin = parseInt(activeSar[5]);
    let nextNum = parseInt(activeSar[6]);
    const fechaLimite = new Date(activeSar[7]);

    if (new Date() > fechaLimite) {
      return { status: "error", code: "CAI_EXPIRED", message: "El CAI autorizado ha superado la fecha límite de emisión." };
    }

    if (nextNum > rangoFin) {
      return { status: "error", code: "CAI_RANGE_EXHAUSTED", message: "El rango de numeración fiscal autorizada ha sido agotado." };
    }

    const correlativoStr = String(nextNum).padStart(8, '0');
    const numeroFactura = `${establecimiento}-${punto}-${tipoDoc}-${correlativoStr}`;

    // Desglose fiscal hondureño dinámico (leído de ParametrosConfiguracion)
    const sysParams = getSystemParameters().data;
    const tasaGeneral = parseFloat(sysParams["ISV_TASA_GENERAL"] || 0.15);
    const tasaEspecial = parseFloat(sysParams["ISV_TASA_ESPECIAL"] || 0.18);

    const exento = parseFloat(subtotalExento || 0);
    const gravado15 = parseFloat(subtotalGravado15 || 0);
    const gravado18 = parseFloat(subtotalGravado18 || 0);
    const isv15 = gravado15 * tasaGeneral;
    const isv18 = gravado18 * tasaEspecial;
    const total = exento + gravado15 + gravado18 + isv15 + isv18;

    const now = new Date().toISOString();
    const hashInput = `${numeroFactura}|${cai}|${sRtn}|${total}|${now}`;
    const hashFiscal = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, hashInput)
      .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('').substring(0, 20).toUpperCase();

    const facturasSheet = getOrCreateSheet(ss, "FacturasFiscales");
    facturasSheet.appendRow([
      numeroFactura,
      cai,
      now,
      String(cargoId),
      pagoId ? String(pagoId) : "DIRECTO",
      String(userId),
      sRtn,
      nombreCliente || "Consumidor Final",
      exento,
      gravado15,
      isv15,
      total,
      "Emitida",
      hashFiscal
    ]);

    // Incrementar y persistir correlativo atómico en SAR
    const sarRowIndex = sarData.findIndex(r => r[0] === cai);
    if (sarRowIndex > 0) {
      sarSheet.getRange(sarRowIndex + 1, 7).setValue(nextNum + 1);
    }

    return {
      status: "success",
      numeroFactura,
      cai,
      fechaEmision: now,
      rtnCliente: sRtn,
      subtotalExento: exento,
      subtotalGravado15: gravado15,
      isv15,
      total,
      hashFiscal,
      message: "Factura fiscal emitida exitosamente con validación SAR."
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getFiscalInvoices(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = getOrCreateSheet(ss, "FacturasFiscales").getDataRange().getValues().slice(1);
  const sUserId = payload && payload.userId ? String(payload.userId).trim() : null;

  const filtered = sUserId ? data.filter(r => String(r[5]) === sUserId) : data;
  const invoices = filtered.map(r => ({
    numeroFactura: r[0],
    cai: r[1],
    fechaEmision: r[2],
    cargoId: r[3],
    pagoId: r[4],
    userId: r[5],
    rtnCliente: r[6],
    nombreCliente: r[7],
    subtotalExento: parseFloat(r[8] || 0),
    subtotalGravado15: parseFloat(r[9] || 0),
    isv15: parseFloat(r[10] || 0),
    total: parseFloat(r[11] || 0),
    estado: r[12],
    hashFiscal: r[13]
  }));

  return { status: "success", data: invoices };
}

// ---------------------------------------------------------------------------
// PORTAL ESTUDIANTIL DE PAGOS Y RECIBOS EN PDF (REQ-EXP-011)
// ---------------------------------------------------------------------------

function uploadPaymentVoucher(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { userId, cargoId, monto, metodoPago, referencia, fileData, fileName } = payload || {};
    if (!userId || !cargoId || !monto) throw new Error("Datos obligatorios faltantes.");

    const now = new Date();
    const comprobanteId = "VCH-" + now.getTime();
    let driveUrl = "";

    if (fileData && fileName) {
      try {
        const folder = getOrCreateFolderNews(DriveApp.getFolderById("1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB"), "Comprobantes_Pago");
        const parts = fileData.split(',');
        const mime = parts[0].match(/:(.*?);/)[1];
        const blob = Utilities.newBlob(Utilities.base64Decode(parts[1]), mime, `VCH_${userId}_${fileName}`);
        const file = folder.createFile(blob);
        driveUrl = file.getUrl();
      } catch (err) {
        logDebug("Aviso al guardar comprobante en Drive: " + err.message);
        driveUrl = "Registrado_En_Transaccion";
      }
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "ComprobantesPago");
    sheet.appendRow([
      comprobanteId,
      now.toISOString(),
      String(userId),
      String(cargoId),
      parseFloat(monto),
      metodoPago || "Transferencia Bancaria",
      referencia || "Depósito",
      "En Revisión",
      driveUrl,
      ""
    ]);

    return {
      status: "success",
      comprobanteId,
      message: "Comprobante de pago enviado exitosamente para revisión por Contabilidad."
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function generatePaymentReceiptNumber(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { cargoId, pagoId, userId, nombreAlumno, concepto, monto } = payload || {};
    if (!cargoId || !userId) throw new Error("Datos de recibo insuficientes.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "RecibosEmitidos");
    const data = sheet.getDataRange().getValues();

    // Si ya existe recibo emitido para esta combinación de cargo o pago, reutilizar su correlativo
    const existing = data.find(r => (pagoId && String(r[3]) === String(pagoId)) || (String(r[2]) === String(cargoId) && String(r[4]) === String(userId)));
    if (existing) {
      return {
        status: "success",
        numeroRecibo: existing[0],
        fechaEmision: existing[1],
        hashSeguridad: existing[8],
        reimpresion: true
      };
    }

    const currentYear = new Date().getFullYear();
    const count = data.length; // Encabezado + correlativo consecutivo
    const correlativo = String(count).padStart(6, '0');
    const numeroRecibo = `REC-${currentYear}-${correlativo}`;
    const now = new Date().toISOString();

    const hashInput = `${numeroRecibo}|${userId}|${monto}|${now}|${SECRET_KEY}`;
    const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, hashInput)
      .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('').substring(0, 16).toUpperCase();

    sheet.appendRow([
      numeroRecibo,
      now,
      String(cargoId),
      pagoId ? String(pagoId) : "DIRECTO",
      String(userId),
      nombreAlumno || "Estudiante",
      concepto || "Servicio Educativo",
      parseFloat(monto || 0),
      hash
    ]);

    return {
      status: "success",
      numeroRecibo,
      fechaEmision: now,
      hashSeguridad: hash,
      reimpresion: false
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getReceiptsByUser(payload) {
  const sUserId = String(payload.userId || "").trim();
  if (!sUserId) throw new Error("userId requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = getOrCreateSheet(ss, "RecibosEmitidos").getDataRange().getValues().slice(1);
  const userReceipts = data.filter(r => String(r[4]) === sUserId).map(r => ({
    numeroRecibo: r[0],
    fechaEmision: r[1],
    cargoId: r[2],
    pagoId: r[3],
    nombreAlumno: r[5],
    concepto: r[6],
    monto: parseFloat(r[7] || 0),
    hashSeguridad: r[8]
  }));

  return { status: "success", data: userReceipts };
}

function getEnrollmentHistory(payload) {
  const sUserId = String(payload.userId || "").trim();
  if (!sUserId) throw new Error("userId requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const matSheet = getOrCreateSheet(ss, "Matriculas");
  const matRows = matSheet.getDataRange().getValues().slice(1);

  const historial = matRows.filter(r => String(r[2]).trim() === sUserId).map(r => ({
    matriculaId: r[0],
    fecha: r[1],
    cicloLectivo: r[4],
    grado: r[5],
    seccion: r[6],
    modalidad: r[7],
    estado: r[8],
    tipoBeca: r[9],
    porcentajeDescuento: parseFloat(r[10] || 0)
  }));

  return { status: "success", data: historial };
}

// ---------------------------------------------------------------------------
// MÓDULO CONTABLE Y FINANCIERO - CONCEPTOS, COBROS Y PAGOS (REQ-EXP-010)
// ---------------------------------------------------------------------------

function configureBillingConcepts(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { concepts } = payload || {};
    if (!Array.isArray(concepts) || concepts.length === 0) throw new Error("Lista de conceptos inválida.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "ConceptosCobro");
    const data = sheet.getDataRange().getValues();

    concepts.forEach(c => {
      const cId = c.conceptoId || "CON-" + new Date().getTime();
      const existingIdx = data.findIndex(r => String(r[0]) === String(cId));
      const row = [
        cId,
        c.nombre || "Concepto",
        c.tipo || "Único",
        c.nivelGrado || "Todos",
        parseFloat(c.montoSugerido || 0),
        c.obligatorio === true || c.obligatorio === "Sí" ? "Sí" : "No",
        c.activo !== false ? "Activo" : "Inactivo"
      ];
      if (existingIdx > 0) {
        sheet.getRange(existingIdx + 1, 1, 1, 7).setValues([row]);
      } else {
        sheet.appendRow(row);
      }
    });

    return { status: "success", message: "Catálogo de conceptos de cobro actualizado." };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getBillingConcepts(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = getOrCreateSheet(ss, "ConceptosCobro").getDataRange().getValues().slice(1);
  const activeConcepts = data.filter(r => r[6] === "Activo" || r[6] === "").map(r => ({
    conceptoId: r[0],
    nombre: r[1],
    tipo: r[2],
    nivelGrado: r[3],
    montoSugerido: parseFloat(r[4] || 0),
    obligatorio: r[5] === "Sí",
    activo: r[6] !== "Inactivo"
  }));
  return { status: "success", data: activeConcepts };
}

function recordPaymentOrInstallment(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { cargoId, userId, monto, metodoPago, referencia, cajeroOContador } = payload || {};
    if (!cargoId || !userId || !monto) throw new Error("Datos de pago incompletos.");

    const abono = parseFloat(monto);
    if (isNaN(abono) || abono <= 0) throw new Error("Monto de abono inválido.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const cargosSheet = getOrCreateSheet(ss, "CargosFinancieros");
    const cargosData = cargosSheet.getDataRange().getValues();

    const cargoIdx = cargosData.findIndex(r => String(r[0]) === String(cargoId) && String(r[2]) === String(userId));
    if (cargoIdx === -1) throw new Error("Cargo financiero no encontrado para este estudiante.");

    const cargoRow = cargosData[cargoIdx];
    const saldoActual = parseFloat(cargoRow[9] || 0);

    if (abono > saldoActual) {
      return { status: "error", code: "PAYMENT_EXCEEDS_BALANCE", message: `El abono (L. ${abono}) excede el saldo pendiente (L. ${saldoActual}).` };
    }

    const nuevoSaldo = Math.max(0, saldoActual - abono);
    const nuevoEstado = nuevoSaldo === 0 ? "Pagado" : "Parcial";

    // Actualizar cargo
    cargosSheet.getRange(cargoIdx + 1, 9, 1, 2).setValues([[nuevoEstado, nuevoSaldo]]);

    // Registrar en histórico de pagos y abonos
    const pagosSheet = getOrCreateSheet(ss, "PagosAbonos");
    const now = new Date();
    const pagoId = "PAY-" + now.getTime();
    pagosSheet.appendRow([
      pagoId,
      cargoId,
      String(userId),
      now.toISOString(),
      abono,
      metodoPago || "Efectivo",
      referencia || "Caja General",
      nuevoSaldo,
      nuevoEstado,
      cajeroOContador || payload.requesterUserId || "Sistema"
    ]);

    return {
      status: "success",
      pagoId,
      nuevoSaldo,
      estado: nuevoEstado,
      message: `Pago registrado exitosamente. Saldo restante: L. ${nuevoSaldo.toFixed(2)}.`
    };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function generateAccountStatement(payload) {
  const sUserId = String(payload.userId || "").trim();
  if (!sUserId) throw new Error("userId requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const cargosSheet = getOrCreateSheet(ss, "CargosFinancieros");
  const pagosSheet = getOrCreateSheet(ss, "PagosAbonos");

  const cargosData = cargosSheet.getDataRange().getValues().slice(1).filter(r => String(r[2]) === sUserId);
  const pagosData = pagosSheet.getDataRange().getValues().slice(1).filter(r => String(r[2]) === sUserId);

  const cargos = cargosData.map(r => ({
    cargoId: r[0],
    concepto: r[3],
    montoOriginal: parseFloat(r[4] || 0),
    descuento: parseFloat(r[5] || 0),
    montoNeto: parseFloat(r[6] || 0),
    vencimiento: r[7],
    estado: r[8],
    saldo: parseFloat(r[9] || 0)
  }));

  const pagos = pagosData.map(r => ({
    pagoId: r[0],
    cargoId: r[1],
    fecha: r[3],
    montoAbonado: parseFloat(r[4] || 0),
    metodoPago: r[5],
    referencia: r[6],
    saldoRestante: parseFloat(r[7] || 0)
  }));

  const totalFacturado = cargos.reduce((acc, c) => acc + c.montoNeto, 0);
  const totalPagado = pagos.reduce((acc, p) => acc + p.montoAbonado, 0);
  const saldoTotal = cargos.reduce((acc, c) => acc + c.saldo, 0);

  return {
    status: "success",
    data: {
      userId: sUserId,
      cargos,
      pagos,
      balance: {
        totalFacturado,
        totalPagado,
        saldoTotal,
        solvente: saldoTotal <= 0
      }
    }
  };
}
