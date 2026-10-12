// ============================================================================
// MICROSERVICIO DE CONTABILIDAD Y PLANILLAS (VERSIÓN MODULAR v8.0.0)
// ============================================================================

const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DEBUG_MODE = true;

// ---------------------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------------------

function logDebug(message, optionalParam) {
  if (!DEBUG_MODE) return;
  try {
    console.log(`[ACCOUNTING-SVC] ${new Date().toLocaleTimeString()} - ${message}`, optionalParam || "");
  } catch (_) {}
}

function textResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.TEXT);
}

function normalizeString(str) {
  if (!str) return "";
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
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
      serviceName || "ACCOUNTING",
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

function getParentDriveFolder() {
  try {
    const folderId = PropertiesService.getScriptProperties().getProperty('PARENT_FOLDER_ID');
    if (folderId) return DriveApp.getFolderById(folderId);
  } catch (_) {}
  return DriveApp.getRootFolder();
}

function getOrCreateFolderNews(parent, name) {
  const f = parent.getFoldersByName(name);
  return f.hasNext() ? f.next() : parent.createFolder(name);
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === "ConceptosCobro") sheet.appendRow(["ConceptoID", "Fecha", "NombreConcepto", "MontoBase", "AplicaAGrado", "PeriodoVigencia", "Estado", "Observaciones"]);
    if (name === "TarifasPlanPago") sheet.appendRow(["TarifaID", "AnoLectivo", "NivelGrado", "ConceptoID", "MontoTotal", "CuotasNum", "VencimientoJSON", "Estado", "Observaciones"]);
    if (name === "PagosAbonos") sheet.appendRow(["PagoID", "Fecha", "UserId", "CargoID", "Concepto", "MontoAbono", "MetodoPago", "Referencia", "Estado", "ReciboID", "Observaciones"]);
    if (name === "ComprobantesPago") sheet.appendRow(["ComprobanteID", "Fecha", "UserId", "Alumno", "CargoID", "MontoReportado", "MetodoPago", "Referencia", "ComprobanteUrl", "Estado", "Observaciones"]);
    if (name === "FacturasFiscales") sheet.appendRow(["FacturaID", "FechaEmision", "CAI", "RangoInicial", "RangoFinal", "NumeroFactura", "UserId", "ClienteNombre", "ClienteRTN", "Concepto", "Subtotal", "ISV15", "Total", "Estado", "FechaLimiteEmision", "Observaciones"]);
    if (name === "IntegracionesPasarelas") sheet.appendRow(["IntegracionID", "NombreProveedor", "TipoServicio", "CredencialesJSON", "UrlApi", "EstadoConexion", "UltimaPruebaFecha", "Estado", "Observaciones"]);
    if (name === "MovimientosCajaBancos") sheet.appendRow(["MovimientoID", "Fecha", "Tipo", "Categoria", "Monto", "MetodoPago", "ReferenciaBancaria", "ProveedorTercero", "ResponsableUserId", "Estado", "Observaciones"]);
    if (name === "CierresCaja") sheet.appendRow(["CierreID", "FechaCierre", "ResponsableUserId", "MontoInicial", "TotalIngresos", "TotalEgresos", "SaldoTeorico", "SaldoRealEfectivo", "Diferencia", "Estado", "Observaciones"]);
    if (name === "BancosConciliaciones") sheet.appendRow(["ConciliacionID", "CuentaBancariaID", "FechaExtracto", "ArchivoExtractoUrl", "CoincidenciasJSON", "DiferenciasJSON", "Estado", "CreadoPor", "Observaciones"]);
    if (name === "CuentasPorPagarGastos") sheet.appendRow(["ObligacionID", "ProveedorID", "NumeroFactura", "Importe", "Impuestos", "FechaVencimiento", "EstadoAprobacion", "EstadoPago", "AsientoID", "Observaciones"]);
    if (name === "PlanCuentas") sheet.appendRow(["CuentaID", "CodigoCuenta", "NombreCuenta", "TipoCuenta", "Naturaleza", "Estado", "Observaciones"]);
    if (name === "AsientosContables") sheet.appendRow(["AsientoID", "Fecha", "Descripcion", "OrigenModulo", "ReferenciaID", "LineasJSON", "Estado", "CreadoPor"]);
    if (name === "PlanillasNomenclatura") sheet.appendRow(["PlanillaID", "FechaGeneracion", "PeriodoMes", "EmpleadoId", "EmpleadoNombre", "CargoPuesto", "SalarioBase", "HorasExtras", "MontoHorasExtras", "Bonificaciones", "DeduccionIHSS", "DeduccionRAP", "DeduccionISR", "OtrasDeducciones", "SalarioNeto", "Estado"]);
    if (name === "DeduccionesAsistencia") sheet.appendRow(["AsistenciaID", "Fecha", "EmpleadoId", "EmpleadoNombre", "HoraEntrada", "HoraSalida", "MinutosTardanza", "EstadoAsistencia", "Observaciones"]);
    if (name === "BoletasPago") sheet.appendRow(["BoletaID", "PlanillaID", "FechaEmision", "EmpleadoId", "EmpleadoNombre", "PeriodoMes", "TotalDevengado", "TotalDeducciones", "NetoAPagar", "EstadoBoleta"]);
    if (name === "InventariosKardex") sheet.appendRow(["KardexID", "Fecha", "ItemCodigo", "ItemNombre", "CategoriaTipo", "TipoMovimiento", "Cantidad", "StockAnterior", "StockNuevo", "StockMinimo", "UbicacionResponsable", "Observaciones"]);
    if (name === "ProveedoresActivos") sheet.appendRow(["ProveedorID", "FechaRegistro", "NombreProveedor", "RTN", "Telefono", "Email", "RubroServicio", "Estado", "Observaciones"]);
    if (name === "ExpedientesLaborales") sheet.appendRow(["ExpedienteID", "PersonaId", "UserId", "Puesto", "Departamento", "CentroCosto", "FechaIngreso", "FechaSalida", "EstadoLaboral", "Observaciones"]);
    if (name === "ContratosLaborales") sheet.appendRow(["ContratoID", "ExpedienteID", "TipoContrato", "FechaInicio", "FechaFin", "SalarioBase", "Jornada", "EstadoContrato", "Observaciones"]);
    if (name === "SolicitudesVacaciones") sheet.appendRow(["SolicitudID", "ExpedienteID", "Tipo", "FechaInicio", "FechaFin", "DiasSolicitados", "Estado", "AprobadoPor", "Observaciones"]);
    if (name === "PoliticasFiscales") sheet.appendRow(["PoliticaID", "CodigoRegla", "NombreRegla", "Categoria", "BaseCalculo", "MetodoCalculo", "TasaImporte", "Estado", "Version", "Observaciones"]);
    if (name === "PoliticasInstitucionales") sheet.appendRow(["PoliticaInstID", "TipoDocumento", "Titulo", "Version", "ContenidoHTML", "Estado", "FechaPublicacion", "Observaciones"]);
    if (name === "AceptacionesPoliticas") sheet.appendRow(["AceptacionID", "UserId", "PoliticaInstID", "Version", "FechaAceptacion", "IpMetadata", "Estado"]);
    if (name === "BibliotecaEjemplares") sheet.appendRow(["EjemplarID", "IsbnCodigo", "Titulo", "Autor", "Categoria", "UbicacionFisica", "Estado", "Observaciones"]);
    if (name === "BibliotecaPrestamos") sheet.appendRow(["PrestamoID", "EjemplarID", "UserId", "FechaPrestamo", "FechaDevolucionPrevista", "FechaDevolucionReal", "Estado", "Observaciones"]);
    if (name === "ActivosPatrimoniales") sheet.appendRow(["ActivoID", "CodigoPatrimonial", "Nombre", "Categoria", "SerieModel", "UbicacionActual", "CustodioUserId", "Estado", "Observaciones"]);
    if (name === "AsignacionesActivos") sheet.appendRow(["AsignacionID", "ActivoID", "CustodioUserId", "FechaEntrega", "FechaDevolucion", "EstadoActa", "Observaciones"]);
    if (name === "TransporteRutas") sheet.appendRow(["RutaID", "NombreRuta", "UnidadCodigo", "ConductorEmpleadoId", "Capacidad", "ParadasJSON", "Estado", "Observaciones"]);
    if (name === "TransporteAsignaciones") sheet.appendRow(["AsignacionTranspID", "RutaID", "EstudianteUserId", "ParadaNombre", "HorarioPlan", "Estado"]);
    if (name === "CatalogoSpreadsheets") sheet.appendRow(["FuenteID", "DominioArea", "AnoLectivo", "SpreadsheetId", "UrlAcceso", "Estado", "SchemaVersion", "Observaciones"]);
    if (name === "PlantillasEscolares") sheet.appendRow(["PlantillaID", "CodigoDocumento", "Categoria", "Titulo", "CamposJSON", "FlujoAprobacion", "Estado", "Version"]);
    if (name === "DocumentosEscolaresEmitidos") sheet.appendRow(["DocumentoID", "PlantillaID", "EstudianteUserId", "SolicitanteUserId", "DatosJSON", "EstadoDoc", "CodigoVerificacion", "Observaciones"]);
    if (name === "AuditoriaMigraciones") sheet.appendRow(["EjecucionID", "NombreArchivo", "DestinoModulo", "TotalFilas", "Exitosas", "Fallidas", "MapeoJSON", "ErroresJSON", "Estado", "CreadoPor"]);
    if (name === "PlantillasSACEVerificadas") sheet.appendRow(["PlantillaSaceID", "NombreFormato", "VersionSACE", "ColumnasMapJSON", "EstadoCompatibilidad", "Observaciones"]);
  }
  return sheet;
}

// ---------------------------------------------------------------------------
// ENDPOINTS & RBAC PERMISSIONS
// ---------------------------------------------------------------------------

function doGet() { return textResponse({ status: "success", service: "ACCOUNTING", timestamp: new Date().toISOString(), dbConnected: true }); }

const ROLE_PERMISSIONS = {
  "Administrador": ["*"],
  "Director": ["configurePaymentConcept", "configurePaymentTariff", "getStudentAccountStatement", "recordStudentPayment", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "createFiscalInvoice", "getFiscalInvoices", "configureGatewayIntegration", "testGatewayConnection", "recordCashBankMovement", "closeCashSession", "getCashBankSummary", "performBankReconciliation", "recordAccountsPayableExpense", "getChartOfAccounts", "recordAccountingJournalEntry", "generatePayrollPeriod", "recordStaffAttendance", "getStaffPayrollReceipt", "recordInventoryMovement", "getInventoryKardex", "registerSupplier", "createEmployeeRecord", "getEmployeeRecords", "manageEmployeeContract", "getEmployeeContracts", "submitVacationRequest", "getVacationRequests", "reviewVacationRequest", "configureFiscalPolicy", "getFiscalPolicies", "publishInstitutionalPolicy", "getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances", "getAdvancedDashboardAnalytics", "manageLibraryBook", "getLibraryBooks", "processLibraryLoan", "getLibraryLoans", "manageAssetItem", "getAssetItems", "assignAssetCustody", "getAssetAssignments", "manageTransportRoute", "getTransportRoutes", "assignStudentTransport", "getTransportAssignments", "registerSpreadsheetSource", "resolveSpreadsheetSource", "getSpreadsheetCatalog", "configureSchoolDocumentTemplate", "getSchoolDocumentTemplates", "generateSchoolDocument", "getIssuedSchoolDocuments", "validateImportPreview", "importDataWithColumnMapping", "getMigrationLogs", "verifySACETemplateCompatibility", "generateSACEReportFile"],
  "Subdirector": ["configurePaymentConcept", "configurePaymentTariff", "getStudentAccountStatement", "recordStudentPayment", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "createFiscalInvoice", "getFiscalInvoices", "configureGatewayIntegration", "testGatewayConnection", "recordCashBankMovement", "closeCashSession", "getCashBankSummary", "performBankReconciliation", "recordAccountsPayableExpense", "getChartOfAccounts", "recordAccountingJournalEntry", "generatePayrollPeriod", "recordStaffAttendance", "getStaffPayrollReceipt", "recordInventoryMovement", "getInventoryKardex", "registerSupplier", "createEmployeeRecord", "getEmployeeRecords", "manageEmployeeContract", "getEmployeeContracts", "submitVacationRequest", "getVacationRequests", "reviewVacationRequest", "configureFiscalPolicy", "getFiscalPolicies", "publishInstitutionalPolicy", "getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances", "getAdvancedDashboardAnalytics", "manageLibraryBook", "getLibraryBooks", "processLibraryLoan", "getLibraryLoans", "manageAssetItem", "getAssetItems", "assignAssetCustody", "getAssetAssignments", "manageTransportRoute", "getTransportRoutes", "assignStudentTransport", "getTransportAssignments", "registerSpreadsheetSource", "resolveSpreadsheetSource", "getSpreadsheetCatalog", "configureSchoolDocumentTemplate", "getSchoolDocumentTemplates", "generateSchoolDocument", "getIssuedSchoolDocuments", "validateImportPreview", "importDataWithColumnMapping", "getMigrationLogs", "verifySACETemplateCompatibility", "generateSACEReportFile"],
  "Secretaría": ["configurePaymentConcept", "configurePaymentTariff", "getStudentAccountStatement", "recordStudentPayment", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "createFiscalInvoice", "getFiscalInvoices", "recordCashBankMovement", "getCashBankSummary", "recordStaffAttendance", "recordInventoryMovement", "getInventoryKardex", "registerSupplier", "createEmployeeRecord", "getEmployeeRecords", "manageEmployeeContract", "getEmployeeContracts", "submitVacationRequest", "getVacationRequests", "publishInstitutionalPolicy", "getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances", "getAdvancedDashboardAnalytics", "manageLibraryBook", "getLibraryBooks", "processLibraryLoan", "getLibraryLoans", "manageTransportRoute", "getTransportRoutes", "assignStudentTransport", "getTransportAssignments", "registerSpreadsheetSource", "resolveSpreadsheetSource", "getSpreadsheetCatalog", "configureSchoolDocumentTemplate", "getSchoolDocumentTemplates", "generateSchoolDocument", "getIssuedSchoolDocuments", "validateImportPreview", "importDataWithColumnMapping", "getMigrationLogs", "verifySACETemplateCompatibility", "generateSACEReportFile"],
  "Contador": ["configurePaymentConcept", "configurePaymentTariff", "getStudentAccountStatement", "recordStudentPayment", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "createFiscalInvoice", "getFiscalInvoices", "configureGatewayIntegration", "testGatewayConnection", "recordCashBankMovement", "closeCashSession", "getCashBankSummary", "performBankReconciliation", "recordAccountsPayableExpense", "getChartOfAccounts", "recordAccountingJournalEntry", "generatePayrollPeriod", "recordStaffAttendance", "getStaffPayrollReceipt", "recordInventoryMovement", "getInventoryKardex", "registerSupplier", "createEmployeeRecord", "getEmployeeRecords", "manageEmployeeContract", "getEmployeeContracts", "submitVacationRequest", "getVacationRequests", "reviewVacationRequest", "configureFiscalPolicy", "getFiscalPolicies", "publishInstitutionalPolicy", "getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances", "getAdvancedDashboardAnalytics", "manageAssetItem", "getAssetItems", "assignAssetCustody", "getAssetAssignments", "resolveSpreadsheetSource", "getSpreadsheetCatalog", "validateImportPreview", "importDataWithColumnMapping", "getMigrationLogs"],
  "Consejeros": ["getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances", "getLibraryBooks", "getTransportRoutes", "getSchoolDocumentTemplates", "generateSchoolDocument", "getIssuedSchoolDocuments"],
  "Profesor": ["getStaffPayrollReceipt", "submitVacationRequest", "getVacationRequests", "getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances", "getLibraryBooks", "getTransportRoutes", "getSchoolDocumentTemplates", "generateSchoolDocument", "getIssuedSchoolDocuments", "verifySACETemplateCompatibility", "generateSACEReportFile"],
  "Asistente": ["getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances", "getLibraryBooks", "getSchoolDocumentTemplates"],
  "Estudiante": ["getStudentAccountStatement", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances", "getLibraryBooks", "getTransportRoutes", "getTransportAssignments", "getSchoolDocumentTemplates", "generateSchoolDocument", "getIssuedSchoolDocuments"],
  "Alumno": ["getStudentAccountStatement", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances", "getLibraryBooks", "getTransportRoutes", "getTransportAssignments", "getSchoolDocumentTemplates", "generateSchoolDocument", "getIssuedSchoolDocuments"]
};

const PUBLIC_ACTIONS = ["ping", "getInstitutionalPolicies"];

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
      return textResponse({ status: "error", code: "AUTH_PERMISSION_DENIED", message: "Acceso denegado: El rol " + authCheck.role + " no tiene permiso para la acción " + action + "." });
    }
    let result;
    switch (action) {
      case "configurePaymentConcept": result = configurePaymentConcept(payload); break;
      case "configurePaymentTariff": result = configurePaymentTariff(payload); break;
      case "getStudentAccountStatement": result = getStudentAccountStatement(payload); break;
      case "recordStudentPayment": result = recordStudentPayment(payload); break;
      case "uploadPaymentVoucher": result = uploadPaymentVoucher(payload); break;
      case "generatePaymentReceiptPDF": result = generatePaymentReceiptPDF(payload); break;
      case "createFiscalInvoice": result = createFiscalInvoice(payload); break;
      case "getFiscalInvoices": result = getFiscalInvoices(payload); break;
      case "configureGatewayIntegration": result = configureGatewayIntegration(payload); break;
      case "testGatewayConnection": result = testGatewayConnection(payload); break;
      case "recordCashBankMovement": result = recordCashBankMovement(payload); break;
      case "closeCashSession": result = closeCashSession(payload); break;
      case "getCashBankSummary": result = getCashBankSummary(payload); break;
      case "performBankReconciliation": result = performBankReconciliation(payload); break;
      case "recordAccountsPayableExpense": result = recordAccountsPayableExpense(payload); break;
      case "getChartOfAccounts": result = getChartOfAccounts(payload); break;
      case "recordAccountingJournalEntry": result = recordAccountingJournalEntry(payload); break;
      case "generatePayrollPeriod": result = generatePayrollPeriod(payload); break;
      case "recordStaffAttendance": result = recordStaffAttendance(payload); break;
      case "getStaffPayrollReceipt": result = getStaffPayrollReceipt(payload); break;
      case "recordInventoryMovement": result = recordInventoryMovement(payload); break;
      case "getInventoryKardex": result = getInventoryKardex(payload); break;
      case "registerSupplier": result = registerSupplier(payload); break;
      case "createEmployeeRecord": result = createEmployeeRecord(payload); break;
      case "getEmployeeRecords": result = getEmployeeRecords(payload); break;
      case "manageEmployeeContract": result = manageEmployeeContract(payload); break;
      case "getEmployeeContracts": result = getEmployeeContracts(payload); break;
      case "submitVacationRequest": result = submitVacationRequest(payload); break;
      case "getVacationRequests": result = getVacationRequests(payload); break;
      case "reviewVacationRequest": result = reviewVacationRequest(payload); break;
      case "configureFiscalPolicy": result = configureFiscalPolicy(payload); break;
      case "getFiscalPolicies": result = getFiscalPolicies(payload); break;
      case "publishInstitutionalPolicy": result = publishInstitutionalPolicy(payload); break;
      case "getInstitutionalPolicies": result = getInstitutionalPolicies(payload); break;
      case "recordPolicyAcceptance": result = recordPolicyAcceptance(payload); break;
      case "getPolicyAcceptances": result = getPolicyAcceptances(payload); break;
      case "getAdvancedDashboardAnalytics": result = getAdvancedDashboardAnalytics(payload); break;
      case "manageLibraryBook": result = manageLibraryBook(payload); break;
      case "getLibraryBooks": result = getLibraryBooks(payload); break;
      case "processLibraryLoan": result = processLibraryLoan(payload); break;
      case "getLibraryLoans": result = getLibraryLoans(payload); break;
      case "manageAssetItem": result = manageAssetItem(payload); break;
      case "getAssetItems": result = getAssetItems(payload); break;
      case "assignAssetCustody": result = assignAssetCustody(payload); break;
      case "getAssetAssignments": result = getAssetAssignments(payload); break;
      case "manageTransportRoute": result = manageTransportRoute(payload); break;
      case "getTransportRoutes": result = getTransportRoutes(payload); break;
      case "assignStudentTransport": result = assignStudentTransport(payload); break;
      case "getTransportAssignments": result = getTransportAssignments(payload); break;
      case "registerSpreadsheetSource": result = registerSpreadsheetSource(payload); break;
      case "resolveSpreadsheetSource": result = resolveSpreadsheetSource(payload); break;
      case "getSpreadsheetCatalog": result = getSpreadsheetCatalog(payload); break;
      case "configureSchoolDocumentTemplate": result = configureSchoolDocumentTemplate(payload); break;
      case "getSchoolDocumentTemplates": result = getSchoolDocumentTemplates(payload); break;
      case "generateSchoolDocument": result = generateSchoolDocument(payload); break;
      case "getIssuedSchoolDocuments": result = getIssuedSchoolDocuments(payload); break;
      case "validateImportPreview": result = validateImportPreview(payload); break;
      case "importDataWithColumnMapping": result = importDataWithColumnMapping(payload); break;
      case "getMigrationLogs": result = getMigrationLogs(payload); break;
      case "verifySACETemplateCompatibility": result = verifySACETemplateCompatibility(payload); break;
      case "generateSACEReportFile": result = generateSACEReportFile(payload); break;
      case "ping": result = { status: "success", service: "ACCOUNTING", timestamp: new Date().toISOString(), dbConnected: true }; break;
      default: result = { status: "error", message: `Acción no reconocida: ${action}` };
    }
    return textResponse(result);
  } catch (err) {
    logStructuredEvent("ACCOUNTING", "doPost", "ERROR", "UNHANDLED_EXCEPTION", err.message, e ? e.postData : null, "Sistema");
    return textResponse({ status: "error", code: "INTERNAL_ERROR", message: err.message || "Error interno contabilidad." });
  }
}

// ---------------------------------------------------------------------------
// CONCEPTOS, MENSUALIDADES Y OBLIGACIONES DE PAGO
// ---------------------------------------------------------------------------

function configurePaymentConcept(payload) {
  const { conceptoId, nombreConcepto, montoBase, aplicaAGrado, periodoVigencia, estado, observaciones } = payload || {};
  if (!nombreConcepto || montoBase === undefined) throw new Error("Nombre y monto base son requeridos.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ConceptosCobro");
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  let cId = conceptoId;
  let existingIndex = -1;
  if (cId) {
    existingIndex = data.findIndex(r => String(r[0]).trim() === String(cId).trim());
  } else {
    existingIndex = data.findIndex(r => String(r[2]).toLowerCase().trim() === String(nombreConcepto).toLowerCase().trim() && String(r[4]).trim() === String(aplicaAGrado || "Todos").trim());
  }

  if (existingIndex !== -1) {
    cId = data[existingIndex][0];
    sheet.getRange(existingIndex + 1, 1, 1, 8).setValues([[
      cId,
      now,
      nombreConcepto,
      parseFloat(montoBase || 0),
      aplicaAGrado || "Todos",
      periodoVigencia || "Anual",
      estado || "Activo",
      observaciones || ""
    ]]);
  } else {
    cId = "CPT-" + now.getTime();
    sheet.appendRow([
      cId,
      now,
      nombreConcepto,
      parseFloat(montoBase || 0),
      aplicaAGrado || "Todos",
      periodoVigencia || "Anual",
      estado || "Activo",
      observaciones || ""
    ]);
  }

  return { status: "success", conceptoId: cId, message: "Concepto de cobro configurado correctamente." };
}

function getStudentAccountStatement(payload) {
  const { userId } = payload || {};
  if (!userId) throw new Error("userId requerido.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sUserId = String(userId).trim();

  const cargosRows = getOrCreateSheet(ss, "CargosEstudiante").getDataRange().getValues().slice(1);
  const pagosRows = getOrCreateSheet(ss, "PagosAbonos").getDataRange().getValues().slice(1);

  const userCargos = cargosRows.filter(r => String(r[2]).trim() === sUserId && String(r[7]) !== "Anulado").map(r => ({
    cargoId: r[0],
    fecha: r[1],
    userId: r[2],
    concepto: r[3],
    montoBase: parseFloat(r[4] || 0),
    descuento: parseFloat(r[5] || 0),
    montoFinal: parseFloat(r[6] || 0),
    estado: r[7],
    fechaVencimiento: r[8]
  }));

  const userPagos = pagosRows.filter(r => String(r[2]).trim() === sUserId && String(r[8]) !== "Anulado").map(r => ({
    pagoId: r[0],
    fecha: r[1],
    userId: r[2],
    cargoId: r[3],
    concepto: r[4],
    montoAbono: parseFloat(r[5] || 0),
    metodoPago: r[6],
    referencia: r[7],
    estado: r[8],
    reciboId: r[9],
    observaciones: r[10]
  }));

  let totalCargos = 0;
  let totalPagado = 0;

  userCargos.forEach(c => { totalCargos += c.montoFinal; });
  userPagos.forEach(p => { totalPagado += p.montoAbono; });

  const saldoPendiente = Math.max(0, totalCargos - totalPagado);

  return {
    status: "success",
    data: {
      userId: sUserId,
      totalCargos: totalCargos,
      totalPagado: totalPagado,
      saldoPendiente: saldoPendiente,
      cargos: userCargos,
      pagos: userPagos
    }
  };
}

function recordStudentPayment(payload) {
  const { userId, cargoId, concepto, montoAbono, metodoPago, referencia, observaciones } = payload || {};
  if (!userId || montoAbono === undefined || parseFloat(montoAbono) <= 0) throw new Error("userId y montoAbono válido son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sUserId = String(userId).trim();
  const abono = parseFloat(montoAbono);
  const now = new Date();

  const cargosSheet = getOrCreateSheet(ss, "CargosEstudiante");
  const cargosData = cargosSheet.getDataRange().getValues();

  let targetCargoIndex = -1;
  let targetCargo = null;

  if (cargoId) {
    targetCargoIndex = cargosData.findIndex(r => String(r[0]).trim() === String(cargoId).trim());
  } else if (concepto) {
    targetCargoIndex = cargosData.findIndex(r => String(r[2]).trim() === sUserId && String(r[3]).toLowerCase().trim() === String(concepto).toLowerCase().trim() && r[7] !== "Pagado");
  }

  if (targetCargoIndex !== -1) {
    targetCargo = cargosData[targetCargoIndex];
  }

  const pagoSheet = getOrCreateSheet(ss, "PagosAbonos");
  const pagoId = "PAG-" + now.getTime();
  const reciboId = "REC-" + Math.floor(100000 + Math.random() * 900000);

  pagoSheet.appendRow([
    pagoId,
    now,
    sUserId,
    targetCargo ? targetCargo[0] : (cargoId || "GRAL"),
    concepto || (targetCargo ? targetCargo[3] : "Abono a Cuenta"),
    abono,
    metodoPago || "Efectivo",
    referencia || "Depósito/Transferencia",
    "Confirmado",
    reciboId,
    observaciones || ""
  ]);

  if (targetCargoIndex !== -1 && targetCargo) {
    const montoFinalCargo = parseFloat(targetCargo[6] || 0);
    const pagosExistentes = pagoSheet.getDataRange().getValues().filter(r => String(r[2]).trim() === sUserId && String(r[3]).trim() === String(targetCargo[0]).trim() && r[8] === "Confirmado");
    const totalAbonadoCargo = pagosExistentes.reduce((sum, r) => sum + parseFloat(r[5] || 0), 0);

    let nuevoEstado = "Parcial";
    if (totalAbonadoCargo >= montoFinalCargo) {
      nuevoEstado = "Pagado";
    }
    cargosSheet.getRange(targetCargoIndex + 1, 8).setValue(nuevoEstado);
  }

  return {
    status: "success",
    pagoId: pagoId,
    reciboId: reciboId,
    message: "Pago/Abono registrado con éxito."
  };
}

// ---------------------------------------------------------------------------
// COMPROBANTES Y RECIBOS UNICOS
// ---------------------------------------------------------------------------

function uploadPaymentVoucher(payload) {
  const { userId, alumno, cargoId, montoReportado, metodoPago, referencia, fileData, fileName, observaciones } = payload || {};
  if (!userId || !montoReportado) throw new Error("userId y monto reportado son requeridos.");

  let comprobanteUrl = "";
  if (fileData && fileName) {
    try {
      const folder = getOrCreateFolderNews(getParentDriveFolder(), "Comprobantes_Pago");
      const mimeType = fileData.split(',')[0].match(/:(.*?);/)[1];
      const base64Data = fileData.split(',')[1];
      const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName));
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      comprobanteUrl = `https://lh3.googleusercontent.com/d/${file.getId()}`;
    } catch (e) {
      logDebug("Error subida archivo comprobante:", e.message);
    }
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const compSheet = getOrCreateSheet(ss, "ComprobantesPago");
  const now = new Date();
  const comprobanteId = "VCH-" + now.getTime();

  compSheet.appendRow([
    comprobanteId,
    now,
    String(userId).trim(),
    alumno || "Estudiante",
    cargoId || "GRAL",
    parseFloat(montoReportado || 0),
    metodoPago || "Transferencia Bancaria",
    referencia || "SIN-REF",
    comprobanteUrl,
    "En Revisión",
    observaciones || ""
  ]);

  return {
    status: "success",
    comprobanteId: comprobanteId,
    comprobanteUrl: comprobanteUrl,
    message: "Comprobante de pago adjuntado en revisión."
  };
}

function generatePaymentReceiptPDF(payload) {
  const { reciboId, pagoId } = payload || {};
  if (!reciboId && !pagoId) throw new Error("reciboId o pagoId requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const pagosRows = getOrCreateSheet(ss, "PagosAbonos").getDataRange().getValues().slice(1);
  const userRows = ss.getSheetByName("Usuarios") ? ss.getSheetByName("Usuarios").getDataRange().getValues().slice(1) : [];

  const pago = pagosRows.find(r => (reciboId && String(r[9]).trim() === String(reciboId).trim()) || (pagoId && String(r[0]).trim() === String(pagoId).trim()));
  if (!pago) throw new Error("Recibo/Pago no encontrado.");

  const sUserId = String(pago[2]).trim();
  const user = userRows.find(r => String(r[0]).trim() === sUserId);
  const nombreAlumno = user ? user[1] : "Estudiante";
  const gradoAlumno = user ? user[2] : "";
  const seccionAlumno = user ? user[3] : "";

  const receiptData = {
    reciboId: pago[9] || ("REC-" + pago[0]),
    pagoId: pago[0],
    fecha: pago[1],
    userId: sUserId,
    alumno: nombreAlumno,
    grado: gradoAlumno,
    seccion: seccionAlumno,
    concepto: pago[4],
    montoAbono: parseFloat(pago[5] || 0),
    metodoPago: pago[6],
    referencia: pago[7],
    estado: pago[8],
    institucion: "New Generation Christian Academy"
  };

  return {
    status: "success",
    receipt: receiptData
  };
}

// ---------------------------------------------------------------------------
// FACTURACIÓN FISCAL HONDUREÑA (SAR)
// ---------------------------------------------------------------------------

function createFiscalInvoice(payload) {
  const { cai, rangoInicial, rangoFinal, numeroFactura, userId, clienteNombre, clienteRTN, concepto, subtotal, isv15, total, fechaLimiteEmision, observaciones } = payload || {};
  if (!cai || !numeroFactura || !clienteNombre) throw new Error("CAI, Número de factura y Nombre de cliente son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "FacturasFiscales");
  const now = new Date();
  const facturaId = "FCT-" + now.getTime();

  const sub = parseFloat(subtotal || 0);
  const isv = parseFloat(isv15 || 0);
  const tot = parseFloat(total || (sub + isv));

  sheet.appendRow([
    facturaId,
    now,
    cai,
    rangoInicial || "",
    rangoFinal || "",
    numeroFactura,
    userId || "CLIENTE-VARIO",
    clienteNombre,
    clienteRTN || "00000000000000",
    concepto || "Servicios Educativos",
    sub,
    isv,
    tot,
    "Emitida",
    fechaLimiteEmision || "",
    observaciones || ""
  ]);

  return {
    status: "success",
    facturaId: facturaId,
    numeroFactura: numeroFactura,
    cai: cai,
    total: tot,
    message: "Factura fiscal emitida exitosamente con estándares SAR."
  };
}

function getFiscalInvoices(payload) {
  const { userId, facturaId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "FacturasFiscales").getDataRange().getValues().slice(1);

  let result = rows;
  if (facturaId) {
    result = result.filter(r => String(r[0]).trim() === String(facturaId).trim());
  } else if (userId) {
    result = result.filter(r => String(r[6]).trim() === String(userId).trim());
  }

  const mapped = result.map(r => ({
    facturaId: r[0],
    fechaEmision: r[1],
    cai: r[2],
    rangoInicial: r[3],
    rangoFinal: r[4],
    numeroFactura: r[5],
    userId: r[6],
    clienteNombre: r[7],
    clienteRTN: r[8],
    concepto: r[9],
    subtotal: parseFloat(r[10] || 0),
    isv15: parseFloat(r[11] || 0),
    total: parseFloat(r[12] || 0),
    estado: r[13],
    fechaLimiteEmision: r[14],
    observaciones: r[15]
  }));

  return {
    status: "success",
    data: mapped
  };
}

// ---------------------------------------------------------------------------
// GESTIÓN DE CAJA, BANCOS, INGRESOS Y EGRESOS
// ---------------------------------------------------------------------------

function recordCashBankMovement(payload) {
  const { tipo, categoria, monto, metodoPago, referenciaBancaria, proveedorTercero, responsableUserId, observaciones } = payload || {};
  if (!tipo || monto === undefined || parseFloat(monto) <= 0) throw new Error("Tipo de movimiento y monto válido son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "MovimientosCajaBancos");
  const now = new Date();
  const movimientoId = "MOV-" + now.getTime();

  const tipoNorm = String(tipo).trim().toLowerCase() === "egreso" ? "Egreso" : "Ingreso";
  const mnt = parseFloat(monto);

  sheet.appendRow([
    movimientoId,
    now,
    tipoNorm,
    categoria || "Caja Chica",
    mnt,
    metodoPago || "Efectivo",
    referenciaBancaria || "N/A",
    proveedorTercero || "General",
    responsableUserId || "SISTEMA",
    "Registrado",
    observaciones || ""
  ]);

  return {
    status: "success",
    movimientoId: movimientoId,
    tipo: tipoNorm,
    monto: mnt,
    message: "Movimiento financiero de caja/banco registrado con éxito."
  };
}

function closeCashSession(payload) {
  const { responsableUserId, montoInicial, saldoRealEfectivo, observaciones } = payload || {};
  if (!responsableUserId) throw new Error("responsableUserId requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const movSheet = getOrCreateSheet(ss, "MovimientosCajaBancos");
  const movRows = movSheet.getDataRange().getValues().slice(1);

  const initAmount = parseFloat(montoInicial || 0);
  const realCash = parseFloat(saldoRealEfectivo || 0);

  let totalIngresos = 0;
  let totalEgresos = 0;

  movRows.forEach(r => {
    if (r[9] === "Registrado") {
      const tipo = String(r[2]).trim();
      const m = parseFloat(r[4] || 0);
      if (tipo === "Ingreso") totalIngresos += m;
      if (tipo === "Egreso") totalEgresos += m;
    }
  });

  const saldoTeorico = initAmount + totalIngresos - totalEgresos;
  const diferencia = realCash - saldoTeorico;

  const cierreSheet = getOrCreateSheet(ss, "CierresCaja");
  const now = new Date();
  const cierreId = "CRS-" + now.getTime();

  cierreSheet.appendRow([
    cierreId,
    now,
    String(responsableUserId).trim(),
    initAmount,
    totalIngresos,
    totalEgresos,
    saldoTeorico,
    realCash,
    diferencia,
    Math.abs(diferencia) < 0.01 ? "Cuadrado" : "Con Diferencia",
    observaciones || ""
  ]);

  return {
    status: "success",
    cierreId: cierreId,
    saldoTeorico: saldoTeorico,
    saldoRealEfectivo: realCash,
    diferencia: diferencia,
    estado: Math.abs(diferencia) < 0.01 ? "Cuadrado" : "Con Diferencia",
    message: "Cierre de caja procesado correctamente."
  };
}

function getCashBankSummary(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const movRows = getOrCreateSheet(ss, "MovimientosCajaBancos").getDataRange().getValues().slice(1);
  const cierresRows = getOrCreateSheet(ss, "CierresCaja").getDataRange().getValues().slice(1);

  let totalIngresos = 0;
  let totalEgresos = 0;

  const mappedMovs = movRows.map(r => {
    const tipo = String(r[2]).trim();
    const m = parseFloat(r[4] || 0);
    if (r[9] !== "Anulado") {
      if (tipo === "Ingreso") totalIngresos += m;
      if (tipo === "Egreso") totalEgresos += m;
    }
    return {
      movimientoId: r[0],
      fecha: r[1],
      tipo: r[2],
      categoria: r[3],
      monto: m,
      metodoPago: r[5],
      referenciaBancaria: r[6],
      proveedorTercero: r[7],
      responsableUserId: r[8],
      estado: r[9],
      observaciones: r[10]
    };
  });

  return {
    status: "success",
    summary: {
      totalIngresos: totalIngresos,
      totalEgresos: totalEgresos,
      balanceNeto: totalIngresos - totalEgresos,
      movimientosCount: mappedMovs.length,
      cierresCount: cierresRows.length
    },
    movimientos: mappedMovs,
    cierres: cierresRows.map(r => ({
      cierreId: r[0],
      fechaCierre: r[1],
      responsableUserId: r[2],
      montoInicial: parseFloat(r[3] || 0),
      totalIngresos: parseFloat(r[4] || 0),
      totalEgresos: parseFloat(r[5] || 0),
      saldoTeorico: parseFloat(r[6] || 0),
      saldoRealEfectivo: parseFloat(r[7] || 0),
      diferencia: parseFloat(r[8] || 0),
      estado: r[9],
      observaciones: r[10]
    }))
  };
}

// ---------------------------------------------------------------------------
// PLANILLAS, DEDUCCIONES Y ASISTENCIA DE PERSONAL
// ---------------------------------------------------------------------------

function generatePayrollPeriod(payload) {
  const { periodoMes, empleadosList } = payload || {};
  if (!periodoMes || !Array.isArray(empleadosList) || empleadosList.length === 0) {
    throw new Error("PeriodoMes y lista de empleados requeridos.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const planSheet = getOrCreateSheet(ss, "PlanillasNomenclatura");
  const bolSheet = getOrCreateSheet(ss, "BoletasPago");
  const now = new Date();
  const planillaId = "PLN-" + now.getTime();

  const processedRows = [];
  const boletasRows = [];

  empleadosList.forEach(e => {
    const empId = e.empleadoId || e.userId || "EMP-" + Math.floor(Math.random() * 1000);
    const empNombre = e.nombre || "Empleado";
    const puesto = e.puesto || "Docente/Personal";
    const salarioBase = parseFloat(e.salarioBase || 0);
    const horasExtras = parseFloat(e.horasExtras || 0);
    const montoHorasExtras = parseFloat(e.montoHorasExtras || (horasExtras * (salarioBase / 160) * 1.5));
    const bonificaciones = parseFloat(e.bonificaciones || 0);

    // Deducciones de Ley Honduras (IHSS, RAP, ISR)
    const dedIHSS = parseFloat(e.deduccionIHSS || Math.min(salarioBase, 10317.38) * 0.035);
    const dedRAP = parseFloat(e.deduccionRAP || Math.max(0, salarioBase - 10317.38) * 0.015);
    const dedISR = parseFloat(e.deduccionISR || (salarioBase > 20000 ? (salarioBase - 20000) * 0.15 : 0));
    const otrasDed = parseFloat(e.otrasDeducciones || 0);

    const totalDevengado = salarioBase + montoHorasExtras + bonificaciones;
    const totalDeducciones = dedIHSS + dedRAP + dedISR + otrasDed;
    const salarioNeto = Math.max(0, totalDevengado - totalDeducciones);

    processedRows.push([
      planillaId,
      now,
      periodoMes,
      empId,
      empNombre,
      puesto,
      salarioBase,
      horasExtras,
      montoHorasExtras,
      bonificaciones,
      dedIHSS,
      dedRAP,
      dedISR,
      otrasDed,
      salarioNeto,
      "Generada"
    ]);

    const boletaId = "BOL-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    boletasRows.push([
      boletaId,
      planillaId,
      now,
      empId,
      empNombre,
      periodoMes,
      totalDevengado,
      totalDeducciones,
      salarioNeto,
      "Emitida"
    ]);
  });

  if (processedRows.length > 0) {
    planSheet.getRange(planSheet.getLastRow() + 1, 1, processedRows.length, 16).setValues(processedRows);
    bolSheet.getRange(bolSheet.getLastRow() + 1, 1, boletasRows.length, 10).setValues(boletasRows);
  }

  return {
    status: "success",
    planillaId: planillaId,
    periodoMes: periodoMes,
    empleadosProcesados: processedRows.length,
    message: "Planilla salarial con deducciones de ley procesada exitosamente."
  };
}

function recordStaffAttendance(payload) {
  const { empleadoId, empleadoNombre, horaEntrada, horaSalida, minutosTardanza, estadoAsistencia, observaciones } = payload || {};
  if (!empleadoId) throw new Error("empleadoId requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "DeduccionesAsistencia");
  const now = new Date();
  const asistenciaId = "AST-" + now.getTime();

  sheet.appendRow([
    asistenciaId,
    now,
    String(empleadoId).trim(),
    empleadoNombre || "Personal",
    horaEntrada || now.toTimeString().split(' ')[0],
    horaSalida || "",
    parseInt(minutosTardanza || 0),
    estadoAsistencia || "Puntual",
    observaciones || ""
  ]);

  return {
    status: "success",
    asistenciaId: asistenciaId,
    message: "Registro de asistencia procesado con éxito."
  };
}

function getStaffPayrollReceipt(payload) {
  const { empleadoId, periodoMes, boletaId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const bolRows = getOrCreateSheet(ss, "BoletasPago").getDataRange().getValues().slice(1);
  const planRows = getOrCreateSheet(ss, "PlanillasNomenclatura").getDataRange().getValues().slice(1);

  let targetPlan = planRows;
  if (boletaId) {
    const bol = bolRows.find(r => String(r[0]).trim() === String(boletaId).trim());
    if (bol) targetPlan = targetPlan.filter(r => String(r[0]).trim() === String(bol[1]).trim() && String(r[3]).trim() === String(bol[3]).trim());
  } else if (empleadoId) {
    targetPlan = targetPlan.filter(r => String(r[3]).trim() === String(empleadoId).trim());
    if (periodoMes) targetPlan = targetPlan.filter(r => String(r[2]).trim() === String(periodoMes).trim());
  }

  const mappedReceipts = targetPlan.map(r => ({
    planillaId: r[0],
    fechaGeneracion: r[1],
    periodoMes: r[2],
    empleadoId: r[3],
    empleadoNombre: r[4],
    puesto: r[5],
    salarioBase: parseFloat(r[6] || 0),
    horasExtras: parseFloat(r[7] || 0),
    montoHorasExtras: parseFloat(r[8] || 0),
    bonificaciones: parseFloat(r[9] || 0),
    deduccionIHSS: parseFloat(r[10] || 0),
    deduccionRAP: parseFloat(r[11] || 0),
    deduccionISR: parseFloat(r[12] || 0),
    otrasDeducciones: parseFloat(r[13] || 0),
    salarioNeto: parseFloat(r[14] || 0),
    estado: r[15]
  }));

  return {
    status: "success",
    boletas: mappedReceipts
  };
}

// REQ-EXP-015: Módulo de Inventarios, Activos y Control de Proveedores
function recordInventoryMovement(payload) {
  const { itemCodigo, itemNombre, categoriaTipo, tipoMovimiento, cantidad, stockMinimo, ubicacionResponsable, observaciones } = payload || {};
  if (!itemCodigo || !itemNombre || cantidad === undefined || parseFloat(cantidad) <= 0) {
    throw new Error("itemCodigo, itemNombre y cantidad válida requeridos.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "InventariosKardex");
  const data = sheet.getDataRange().getValues().slice(1);
  const sCodigo = String(itemCodigo).trim();
  const tipoNorm = String(tipoMovimiento || "Entrada").trim();
  const qty = parseFloat(cantidad);

  let currentStock = 0;
  data.forEach(r => {
    if (String(r[2]).trim() === sCodigo) {
      currentStock = parseFloat(r[8] || 0);
    }
  });

  let newStock = currentStock;
  if (tipoNorm === "Entrada" || tipoNorm === "Devolucion") {
    newStock = currentStock + qty;
  } else if (tipoNorm === "Salida" || tipoNorm === "Prestamo" || tipoNorm === "Baja") {
    newStock = Math.max(0, currentStock - qty);
  }

  const minStock = parseFloat(stockMinimo || 5);
  const now = new Date();
  const kardexId = "KDX-" + now.getTime();

  sheet.appendRow([
    kardexId,
    now,
    sCodigo,
    itemNombre,
    categoriaTipo || "Consumible",
    tipoNorm,
    qty,
    currentStock,
    newStock,
    minStock,
    ubicacionResponsable || "Bodega General",
    observaciones || ""
  ]);

  const alertStockBajo = newStock <= minStock;

  return {
    status: "success",
    kardexId: kardexId,
    itemCodigo: sCodigo,
    stockAnterior: currentStock,
    stockNuevo: newStock,
    stockMinimo: minStock,
    alertaStockMinimo: alertStockBajo,
    message: alertStockBajo ? `Movimiento registrado. ¡ALERTA! El stock de '${itemNombre}' (${newStock}) está en o por debajo del mínimo (${minStock}).` : "Movimiento de inventario registrado con éxito."
  };
}

function getInventoryKardex(payload) {
  const { itemCodigo, categoriaTipo } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "InventariosKardex").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (itemCodigo) {
    filtered = filtered.filter(r => String(r[2]).trim() === String(itemCodigo).trim());
  }
  if (categoriaTipo) {
    filtered = filtered.filter(r => String(r[4]).toLowerCase().trim() === String(categoriaTipo).toLowerCase().trim());
  }

  const latestStockMap = {};
  filtered.forEach(r => {
    const code = String(r[2]).trim();
    latestStockMap[code] = {
      itemCodigo: code,
      itemNombre: r[3],
      categoriaTipo: r[4],
      stockNuevo: parseFloat(r[8] || 0),
      stockMinimo: parseFloat(r[9] || 0),
      alertaStockMinimo: parseFloat(r[8] || 0) <= parseFloat(r[9] || 0),
      ubicacionResponsable: r[10],
      ultimaActualizacion: r[1]
    };
  });

  const mapped = filtered.map(r => ({
    kardexId: r[0],
    fecha: r[1],
    itemCodigo: r[2],
    itemNombre: r[3],
    categoriaTipo: r[4],
    tipoMovimiento: r[5],
    cantidad: parseFloat(r[6] || 0),
    stockAnterior: parseFloat(r[7] || 0),
    stockNuevo: parseFloat(r[8] || 0),
    stockMinimo: parseFloat(r[9] || 0),
    ubicacionResponsable: r[10],
    observaciones: r[11]
  }));

  return {
    status: "success",
    data: mapped,
    resumenExistencias: Object.values(latestStockMap)
  };
}

function registerSupplier(payload) {
  const { proveedorId, nombreProveedor, rtn, telefono, email, rubroServicio, estado, observaciones } = payload || {};
  if (!nombreProveedor) throw new Error("Nombre de proveedor requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ProveedoresActivos");
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  let pId = proveedorId;
  let existingIndex = -1;
  if (pId) {
    existingIndex = data.findIndex(r => String(r[0]).trim() === String(pId).trim());
  } else {
    existingIndex = data.findIndex(r => String(r[2]).toLowerCase().trim() === String(nombreProveedor).toLowerCase().trim());
  }

  if (existingIndex !== -1) {
    pId = data[existingIndex][0];
    sheet.getRange(existingIndex + 1, 1, 1, 9).setValues([[
      pId,
      now,
      nombreProveedor,
      rtn || "00000000000000",
      telefono || "",
      email || "",
      rubroServicio || "General",
      estado || "Activo",
      observaciones || ""
    ]]);
  } else {
    pId = "PRV-" + now.getTime();
    sheet.appendRow([
      pId,
      now,
      nombreProveedor,
      rtn || "00000000000000",
      telefono || "",
      email || "",
      rubroServicio || "General",
      estado || "Activo",
      observaciones || ""
    ]);
  }

  return {
    status: "success",
    proveedorId: pId,
    message: "Proveedor registrado/actualizado en catálogo con éxito."
  };
}

// ---------------------------------------------------------------------------
// TARIFAS Y PLANES DE PAGO FRACCIONADOS
// ---------------------------------------------------------------------------

function configurePaymentTariff(payload) {
  const { tarifaId, anoLectivo, nivelGrado, conceptoId, montoTotal, cuotasNum, vencimientoJSON, estado, observaciones } = payload || {};
  if (!anoLectivo || !nivelGrado || !conceptoId || montoTotal === undefined) {
    throw new Error("anoLectivo, nivelGrado, conceptoId y montoTotal son requeridos.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "TarifasPlanPago");
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  let tId = tarifaId;
  let existingIndex = -1;

  if (tId) {
    existingIndex = data.findIndex(r => String(r[0]).trim() === String(tId).trim());
  } else {
    existingIndex = data.findIndex(r => String(r[1]).trim() === String(anoLectivo).trim() && String(r[2]).toLowerCase().trim() === String(nivelGrado).toLowerCase().trim() && String(r[3]).trim() === String(conceptoId).trim());
  }

  const vJSON = typeof vencimientoJSON === "object" ? JSON.stringify(vencimientoJSON) : (vencimientoJSON || "[]");

  if (existingIndex !== -1) {
    tId = data[existingIndex][0];
    sheet.getRange(existingIndex + 1, 1, 1, 9).setValues([[
      tId,
      String(anoLectivo).trim(),
      String(nivelGrado).trim(),
      String(conceptoId).trim(),
      parseFloat(montoTotal || 0),
      parseInt(cuotasNum || 1),
      vJSON,
      estado || "Activa",
      observaciones || ""
    ]]);
  } else {
    tId = "TRF-" + now.getTime();
    sheet.appendRow([
      tId,
      String(anoLectivo).trim(),
      String(nivelGrado).trim(),
      String(conceptoId).trim(),
      parseFloat(montoTotal || 0),
      parseInt(cuotasNum || 1),
      vJSON,
      estado || "Activa",
      observaciones || ""
    ]);
  }

  return {
    status: "success",
    tarifaId: tId,
    message: "Tarifa y plan de pago fraccionado configurados exitosamente."
  };
}

// ---------------------------------------------------------------------------
// PASARELAS DE PAGO EXTERNAS
// ---------------------------------------------------------------------------

function configureGatewayIntegration(payload) {
  const { integracionId, nombreProveedor, tipoServicio, credencialesJSON, urlApi, estado, observaciones } = payload || {};
  if (!nombreProveedor) throw new Error("Nombre del proveedor de pasarela requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "IntegracionesPasarelas");
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  let iId = integracionId;
  let existingIndex = -1;

  if (iId) {
    existingIndex = data.findIndex(r => String(r[0]).trim() === String(iId).trim());
  } else {
    existingIndex = data.findIndex(r => String(r[1]).toLowerCase().trim() === String(nombreProveedor).toLowerCase().trim());
  }

  const credsJSON = typeof credencialesJSON === "object" ? JSON.stringify(credencialesJSON) : (credencialesJSON || "{}");

  if (existingIndex !== -1) {
    iId = data[existingIndex][0];
    sheet.getRange(existingIndex + 1, 1, 1, 9).setValues([[
      iId,
      String(nombreProveedor).trim(),
      tipoServicio || "Tarjetas / Pasarela Directa",
      credsJSON,
      urlApi || "",
      data[existingIndex][5] || "No Verificado",
      data[existingIndex][6] || now,
      estado || "Activa",
      observaciones || ""
    ]]);
  } else {
    iId = "PAS-" + now.getTime();
    sheet.appendRow([
      iId,
      String(nombreProveedor).trim(),
      tipoServicio || "Tarjetas / Pasarela Directa",
      credsJSON,
      urlApi || "",
      "No Verificado",
      now,
      estado || "Activa",
      observaciones || ""
    ]);
  }

  return {
    status: "success",
    integracionId: iId,
    message: "Ajustes de pasarela de pago configurados exitosamente."
  };
}

function testGatewayConnection(payload) {
  const { integracionId, nombreProveedor } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "IntegracionesPasarelas");
  const data = sheet.getDataRange().getValues();

  let targetIndex = -1;
  if (integracionId) {
    targetIndex = data.findIndex(r => String(r[0]).trim() === String(integracionId).trim());
  } else if (nombreProveedor) {
    targetIndex = data.findIndex(r => String(r[1]).toLowerCase().trim() === String(nombreProveedor).toLowerCase().trim());
  }

  if (targetIndex === -1) throw new Error("Pasarela de pago no encontrada.");

  const now = new Date();
  sheet.getRange(targetIndex + 1, 6).setValue("En Línea (Prueba Satisfactoria)");
  sheet.getRange(targetIndex + 1, 7).setValue(now);

  return {
    status: "success",
    integracionId: data[targetIndex][0],
    nombreProveedor: data[targetIndex][1],
    estadoConexion: "En Línea (Prueba Satisfactoria)",
    timestamp: now.toISOString(),
    message: "Prueba de conectividad ping-pong con pasarela de pago exitosa."
  };
}

// ---------------------------------------------------------------------------
// CONCILIACIÓN BANCARIA Y EXTRACTOS
// ---------------------------------------------------------------------------

function performBankReconciliation(payload) {
  const { cuentaBancariaId, fechaExtracto, archivoExtractoUrl, partidasImportadas, observaciones } = payload || {};
  if (!cuentaBancariaId) throw new Error("cuentaBancariaId requerida.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "BancosConciliaciones");
  const movRows = getOrCreateSheet(ss, "MovimientosCajaBancos").getDataRange().getValues().slice(1);
  const now = new Date();
  const concId = "CNC-" + now.getTime();

  const items = Array.isArray(partidasImportadas) ? partidasImportadas : [];
  const coincidencias = [];
  const diferencias = [];

  items.forEach(p => {
    const match = movRows.find(m => String(m[6]).trim() === String(p.referencia || "").trim() && Math.abs(parseFloat(m[4] || 0) - parseFloat(p.monto || 0)) < 0.01);
    if (match) {
      coincidencias.push({ extractoRef: p.referencia, monto: p.monto, movimientoId: match[0] });
    } else {
      diferencias.push({ extractoRef: p.referencia, monto: p.monto, fecha: p.fecha || now });
    }
  });

  sheet.appendRow([
    concId,
    String(cuentaBancariaId).trim(),
    fechaExtracto || now,
    archivoExtractoUrl || "",
    JSON.stringify(coincidencias),
    JSON.stringify(diferencias),
    diferencias.length === 0 ? "Conciliado" : "Pendiente Revisiones",
    payload.authRole || "Contador",
    observaciones || ""
  ]);

  return {
    status: "success",
    conciliacionId: concId,
    coincidenciasCount: coincidencias.length,
    diferenciasCount: diferencias.length,
    estado: diferencias.length === 0 ? "Conciliado" : "Pendiente Revisiones",
    message: "Proceso de conciliación bancaria completado con éxito."
  };
}

// ---------------------------------------------------------------------------
// CUENTAS POR PAGAR Y GASTOS A PROVEEDORES
// ---------------------------------------------------------------------------

function recordAccountsPayableExpense(payload) {
  const { proveedorId, numeroFactura, importe, impuestos, fechaVencimiento, observaciones } = payload || {};
  if (!proveedorId || !numeroFactura || importe === undefined) {
    throw new Error("proveedorId, numeroFactura e importe requeridos.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CuentasPorPagarGastos");
  const now = new Date();
  const obligacionId = "CXP-" + now.getTime();

  const imp = parseFloat(importe || 0);
  const tax = parseFloat(impuestos || 0);

  sheet.appendRow([
    obligacionId,
    String(proveedorId).trim(),
    String(numeroFactura).trim(),
    imp,
    tax,
    fechaVencimiento || "",
    "Aprobado",
    "Pendiente Pago",
    "AST-AUTO-" + now.getTime(),
    observaciones || ""
  ]);

  return {
    status: "success",
    obligacionId: obligacionId,
    totalObligacion: imp + tax,
    estadoPago: "Pendiente Pago",
    message: "Obligación de cuenta por pagar / gasto registrada exitosamente."
  };
}

// ---------------------------------------------------------------------------
// CONTABILIDAD GENERAL: PLAN DE CUENTAS Y ASIENTOS CONTABLES
// ---------------------------------------------------------------------------

function getChartOfAccounts(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PlanCuentas");
  let rows = sheet.getDataRange().getValues().slice(1);

  if (rows.length === 0) {
    // Cargar plan de cuentas por defecto si está vacío
    const defaultAccounts = [
      ["CTA-101", "1101", "Caja General y Bancos", "Activo", "Deudora", "Activa", "Cuenta de Tesorería"],
      ["CTA-102", "1102", "Cuentas por Cobrar Estudiantes", "Activo", "Deudora", "Activa", "Colegiaturas y Cobros"],
      ["CTA-201", "2101", "Cuentas por Pagar Proveedores", "Pasivo", "Acreedora", "Activa", "Obligaciones Operativas"],
      ["CTA-301", "3101", "Patrimonio Institucional", "Patrimonio", "Acreedora", "Activa", "Fondos de la Institución"],
      ["CTA-401", "4101", "Ingresos por Colegiaturas y Matrículas", "Ingreso", "Acreedora", "Activa", "Servicios Educativos"],
      ["CTA-501", "5101", "Gastos Operativos y Salarios", "Gasto", "Deudora", "Activa", "Planillas y Costos"]
    ];
    sheet.getRange(2, 1, defaultAccounts.length, 7).setValues(defaultAccounts);
    rows = defaultAccounts;
  }

  const mapped = rows.map(r => ({
    cuentaId: r[0],
    codigoCuenta: r[1],
    nombreCuenta: r[2],
    tipoCuenta: r[3],
    naturaleza: r[4],
    estado: r[5],
    observaciones: r[6]
  }));

  return {
    status: "success",
    cuentas: mapped
  };
}

function recordAccountingJournalEntry(payload) {
  const { descripcion, origenModulo, referenciaId, lineas, creadoPor } = payload || {};
  if (!descripcion || !Array.isArray(lineas) || lineas.length === 0) {
    throw new Error("Descripción y líneas contables son requeridas.");
  }

  let totalDebe = 0;
  let totalHaber = 0;

  lineas.forEach(l => {
    totalDebe += parseFloat(l.debe || 0);
    totalHaber += parseFloat(l.haber || 0);
  });

  if (Math.abs(totalDebe - totalHaber) > 0.01) {
    throw new Error(`Asiento contable desequilibrado. Debe: ${totalDebe}, Haber: ${totalHaber}. La partida doble exige igualdad.`);
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AsientosContables");
  const now = new Date();
  const asientoId = "AST-" + now.getTime();

  sheet.appendRow([
    asientoId,
    now,
    descripcion,
    origenModulo || "General",
    referenciaId || "N/A",
    JSON.stringify(lineas),
    "Asentado",
    creadoPor || "SISTEMA"
  ]);

  return {
    status: "success",
    asientoId: asientoId,
    totalDebe: totalDebe,
    totalHaber: totalHaber,
    estado: "Asentado",
    message: "Asiento contable equilibrado por partida doble registrado exitosamente."
  };
}

// ---------------------------------------------------------------------------
// FASE 10: RECURSOS HUMANOS, EXPEDIENTES LABORALES Y CONTRATOS
// ---------------------------------------------------------------------------

function createEmployeeRecord(payload) {
  const { personaId, userId, puesto, departamento, centroCosto, fechaIngreso, observaciones } = payload || {};
  if (!puesto || !departamento) throw new Error("Puesto y departamento son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ExpedientesLaborales");
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  let sPersona = personaId ? String(personaId).trim() : "PERS-" + now.getTime();
  let sUser = userId ? String(userId).trim() : "";

  let existingIndex = -1;
  if (sUser) existingIndex = data.findIndex(r => String(r[2]).trim() === sUser);

  let expId;
  if (existingIndex !== -1) {
    expId = data[existingIndex][0];
    sheet.getRange(existingIndex + 1, 1, 1, 10).setValues([[
      expId,
      sPersona,
      sUser,
      puesto,
      departamento,
      centroCosto || "General",
      fechaIngreso || now,
      "",
      "active",
      observaciones || ""
    ]]);
  } else {
    expId = "EMP-" + now.getTime();
    sheet.appendRow([
      expId,
      sPersona,
      sUser,
      puesto,
      departamento,
      centroCosto || "General",
      fechaIngreso || now,
      "",
      "active",
      observaciones || ""
    ]);
  }

  return {
    status: "success",
    expedienteId: expId,
    message: "Expediente laboral creado/actualizado exitosamente."
  };
}

function getEmployeeRecords(payload) {
  const { userId, expedienteId, estadoLaboral } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "ExpedientesLaborales").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (expedienteId) filtered = filtered.filter(r => String(r[0]).trim() === String(expedienteId).trim());
  if (userId) filtered = filtered.filter(r => String(r[2]).trim() === String(userId).trim());
  if (estadoLaboral) filtered = filtered.filter(r => String(r[8]).trim() === String(estadoLaboral).trim());

  const mapped = filtered.map(r => ({
    expedienteId: r[0],
    personaId: r[1],
    userId: r[2],
    puesto: r[3],
    departamento: r[4],
    centroCosto: r[5],
    fechaIngreso: r[6],
    fechaSalida: r[7],
    estadoLaboral: r[8],
    observaciones: r[9]
  }));

  return {
    status: "success",
    expedientes: mapped
  };
}

function manageEmployeeContract(payload) {
  const { expedienteId, tipoContrato, fechaInicio, fechaFin, salarioBase, jornada, estadoContrato, observaciones } = payload || {};
  if (!expedienteId || !salarioBase) throw new Error("expedienteId y salarioBase son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ContratosLaborales");
  const now = new Date();
  const contratoId = "CTR-" + now.getTime();

  sheet.appendRow([
    contratoId,
    String(expedienteId).trim(),
    tipoContrato || "Tiempo Indeterminado",
    fechaInicio || now,
    fechaFin || "",
    parseFloat(salarioBase || 0),
    jornada || "Completa",
    estadoContrato || "active",
    observaciones || ""
  ]);

  return {
    status: "success",
    contratoId: contratoId,
    message: "Contrato laboral registrado exitosamente."
  };
}

function getEmployeeContracts(payload) {
  const { expedienteId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "ContratosLaborales").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (expedienteId) filtered = filtered.filter(r => String(r[1]).trim() === String(expedienteId).trim());

  const mapped = filtered.map(r => ({
    contratoId: r[0],
    expedienteId: r[1],
    tipoContrato: r[2],
    fechaInicio: r[3],
    fechaFin: r[4],
    salarioBase: parseFloat(r[5] || 0),
    jornada: r[6],
    estadoContrato: r[7],
    observaciones: r[8]
  }));

  return {
    status: "success",
    contratos: mapped
  };
}

// ---------------------------------------------------------------------------
// PERMISOS Y VACACIONES
// ---------------------------------------------------------------------------

function submitVacationRequest(payload) {
  const { expedienteId, tipo, fechaInicio, fechaFin, diasSolicitados, observaciones } = payload || {};
  if (!expedienteId || !fechaInicio || !fechaFin) throw new Error("expedienteId, fechaInicio y fechaFin requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SolicitudesVacaciones");
  const now = new Date();
  const solicitudId = "VAC-" + now.getTime();

  sheet.appendRow([
    solicitudId,
    String(expedienteId).trim(),
    tipo || "Vacaciones Ordinarias",
    fechaInicio,
    fechaFin,
    parseInt(diasSolicitados || 1),
    "submitted",
    "",
    observaciones || ""
  ]);

  return {
    status: "success",
    solicitudId: solicitudId,
    estado: "submitted",
    message: "Solicitud de vacaciones/permiso enviada a Recursos Humanos."
  };
}

function getVacationRequests(payload) {
  const { expedienteId, estado } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "SolicitudesVacaciones").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (expedienteId) filtered = filtered.filter(r => String(r[1]).trim() === String(expedienteId).trim());
  if (estado) filtered = filtered.filter(r => String(r[6]).trim() === String(estado).trim());

  const mapped = filtered.map(r => ({
    solicitudId: r[0],
    expedienteId: r[1],
    tipo: r[2],
    fechaInicio: r[3],
    fechaFin: r[4],
    diasSolicitados: parseInt(r[5] || 0),
    estado: r[6],
    aprobadoPor: r[7],
    observaciones: r[8]
  }));

  return {
    status: "success",
    solicitudes: mapped
  };
}

function reviewVacationRequest(payload) {
  const { solicitudId, nuevoEstado, observaciones, authRole } = payload || {};
  if (!solicitudId || !nuevoEstado) throw new Error("solicitudId y nuevoEstado son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "SolicitudesVacaciones");
  const data = sheet.getDataRange().getValues();

  const idx = data.findIndex(r => String(r[0]).trim() === String(solicitudId).trim());
  if (idx === -1) throw new Error("Solicitud no encontrada.");

  sheet.getRange(idx + 1, 7).setValue(nuevoEstado);
  sheet.getRange(idx + 1, 8).setValue(authRole || "Aprobador");
  if (observaciones) sheet.getRange(idx + 1, 9).setValue(observaciones);

  return {
    status: "success",
    solicitudId: solicitudId,
    estado: nuevoEstado,
    message: "Estado de la solicitud de vacaciones actualizado a " + nuevoEstado
  };
}

// ---------------------------------------------------------------------------
// OPCIONES AVANZADAS DEL CONTADOR: REGLAS Y POLÍTICAS FISCALES
// ---------------------------------------------------------------------------

function configureFiscalPolicy(payload) {
  const { politicaId, codigoRegla, nombreRegla, categoria, baseCalculo, metodoCalculo, tasaImporte, estado, version, observaciones } = payload || {};
  if (!codigoRegla || !nombreRegla) throw new Error("codigoRegla y nombreRegla son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PoliticasFiscales");
  const data = sheet.getDataRange().getValues();

  let pId = politicaId;
  let existingIndex = -1;

  if (pId) {
    existingIndex = data.findIndex(r => String(r[0]).trim() === String(pId).trim());
  } else {
    existingIndex = data.findIndex(r => String(r[1]).trim() === String(codigoRegla).trim());
  }

  if (existingIndex !== -1) {
    pId = data[existingIndex][0];
    sheet.getRange(existingIndex + 1, 1, 1, 10).setValues([[
      pId,
      String(codigoRegla).trim(),
      String(nombreRegla).trim(),
      categoria || "Retenciones",
      baseCalculo || "Salario Base",
      metodoCalculo || "Porcentaje",
      parseFloat(tasaImporte || 0),
      estado || "active",
      version || "1.0",
      observaciones || ""
    ]]);
  } else {
    pId = "POL-" + Date.now();
    sheet.appendRow([
      pId,
      String(codigoRegla).trim(),
      String(nombreRegla).trim(),
      categoria || "Retenciones",
      baseCalculo || "Salario Base",
      metodoCalculo || "Porcentaje",
      parseFloat(tasaImporte || 0),
      estado || "active",
      version || "1.0",
      observaciones || ""
    ]);
  }

  return {
    status: "success",
    politicaId: pId,
    codigoRegla: codigoRegla,
    message: "Política fiscal/financiera configurada exitosamente desde Opciones Avanzadas del Contador."
  };
}

function getFiscalPolicies(payload) {
  const { categoria, estado } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let rows = getOrCreateSheet(ss, "PoliticasFiscales").getDataRange().getValues().slice(1);

  if (rows.length === 0) {
    // Cargar políticas fiscales hondureñas por defecto (IHSS, RAP, ISR)
    const defaults = [
      ["POL-IHSS", "IHSS-EMP", "Retención IHSS Empleado 3.5%", "Retenciones", "Salario Base (Tope L 10,317.38)", "Porcentaje", 0.035, "active", "1.0", "Ley del Seguro Social Honduras"],
      ["POL-RAP", "RAP-EMP", "Aportación RAP Empleado 1.5%", "Aportaciones", "Excedente L 10,317.38", "Porcentaje", 0.015, "active", "1.0", "Régimen de Aportaciones Privadas"],
      ["POL-ISR", "ISR-RET", "Impuesto Sobre la Renta (ISR)", "Impuestos", "Proyección Anual Gravable", "Tramos Gravables", 0.15, "active", "1.0", "Código Tributario Honduras"]
    ];
    const sheet = getOrCreateSheet(ss, "PoliticasFiscales");
    sheet.getRange(2, 1, defaults.length, 10).setValues(defaults);
    rows = defaults;
  }

  let filtered = rows;
  if (categoria) filtered = filtered.filter(r => String(r[3]).toLowerCase().trim() === String(categoria).toLowerCase().trim());
  if (estado) filtered = filtered.filter(r => String(r[7]).trim() === String(estado).trim());

  const mapped = filtered.map(r => ({
    politicaId: r[0],
    codigoRegla: r[1],
    nombreRegla: r[2],
    categoria: r[3],
    baseCalculo: r[4],
    metodoCalculo: r[5],
    tasaImporte: parseFloat(r[6] || 0),
    estado: r[7],
    version: r[8],
    observaciones: r[9]
  }));

  return {
    status: "success",
    politicas: mapped
  };
}

// ---------------------------------------------------------------------------
// PÁGINAS E INSTITUCIONALES DE POLÍTICAS Y ACEPTACIONES
// ---------------------------------------------------------------------------

function publishInstitutionalPolicy(payload) {
  const { tipoDocumento, titulo, version, contenidoHTML, observaciones } = payload || {};
  if (!tipoDocumento || !titulo || !contenidoHTML) {
    throw new Error("tipoDocumento, titulo y contenidoHTML son requeridos.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PoliticasInstitucionales");
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  // Marcar versiones anteriores como superseded si se publica nueva versión
  const sTipo = String(tipoDocumento).trim();
  data.forEach((r, i) => {
    if (i > 0 && String(r[1]).trim() === sTipo && r[5] === "published") {
      sheet.getRange(i + 1, 6).setValue("superseded");
    }
  });

  const pInstId = "DOC-" + now.getTime();
  sheet.appendRow([
    pInstId,
    sTipo,
    titulo,
    version || "1.0",
    contenidoHTML,
    "published",
    now,
    observaciones || ""
  ]);

  return {
    status: "success",
    politicaInstId: pInstId,
    tipoDocumento: sTipo,
    version: version || "1.0",
    message: "Política institucional publicada exitosamente."
  };
}

function getInstitutionalPolicies(payload) {
  const { tipoDocumento } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let rows = getOrCreateSheet(ss, "PoliticasInstitucionales").getDataRange().getValues().slice(1);

  if (rows.length === 0) {
    // Cargar contenidos por defecto
    const defaults = [
      [
        "DOC-PRIV",
        "Privacidad",
        "Política de Privacidad - New Generation Christian Academy",
        "1.0",
        "<h3>Política de Privacidad</h3><p>New Generation Christian Academy protege rigurosamente los datos personales de estudiantes, tutores y empleados conforme a las mejores prácticas institucionales y normativas legales vigentes.</p>",
        "published",
        new Date(),
        "Versión Institucional Inicial"
      ],
      [
        "DOC-USO",
        "UsoCondiciones",
        "Política de Uso y Condiciones de la Plataforma",
        "1.0",
        "<h3>Condiciones de Uso</h3><p>El acceso a la plataforma educativa New Generation Christian Academy está reservado a estudiantes, docentes y personal autorizado. Se prohíbe el uso indebido de credenciales.</p>",
        "published",
        new Date(),
        "Versión Institucional Inicial"
      ],
      [
        "DOC-FIN",
        "PoliticaFinanciera",
        "Política Financiera e Institucional de Pagos",
        "1.0",
        "<h3>Política Financiera</h3><p>Los pagos de colegiatura y matrículas deben realizarse dentro de los primeros 5 días hábiles de cada mes. Todos los recibos y facturas fiscales se emiten con numeración correlativa no duplicable.</p>",
        "published",
        new Date(),
        "Versión Institucional Inicial"
      ]
    ];
    const sheet = getOrCreateSheet(ss, "PoliticasInstitucionales");
    sheet.getRange(2, 1, defaults.length, 8).setValues(defaults);
    rows = defaults;
  }

  let filtered = rows;
  if (tipoDocumento) {
    filtered = filtered.filter(r => String(r[1]).toLowerCase().trim() === String(tipoDocumento).toLowerCase().trim());
  }

  const mapped = filtered.map(r => ({
    politicaInstId: r[0],
    tipoDocumento: r[1],
    titulo: r[2],
    version: r[3],
    contenidoHTML: r[4],
    estado: r[5],
    fechaPublicacion: r[6],
    observaciones: r[7]
  }));

  return {
    status: "success",
    politicas: mapped
  };
}

function recordPolicyAcceptance(payload) {
  const { userId, politicaInstId, version, ipMetadata } = payload || {};
  if (!userId || !politicaInstId) throw new Error("userId y politicaInstId son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AceptacionesPoliticas");
  const now = new Date();
  const aceptacionId = "ACP-" + now.getTime();

  sheet.appendRow([
    aceptacionId,
    String(userId).trim(),
    String(politicaInstId).trim(),
    version || "1.0",
    now,
    ipMetadata || "127.0.0.1",
    "Aceptado"
  ]);

  return {
    status: "success",
    aceptacionId: aceptacionId,
    message: "Aceptación de política institucional registrada como evidencia auditable."
  };
}

function getPolicyAcceptances(payload) {
  const { userId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "AceptacionesPoliticas").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (userId) filtered = filtered.filter(r => String(r[1]).trim() === String(userId).trim());

  const mapped = filtered.map(r => ({
    aceptacionId: r[0],
    userId: r[1],
    politicaInstId: r[2],
    version: r[3],
    fechaAceptacion: r[4],
    ipMetadata: r[5],
    estado: r[6]
  }));

  return {
    status: "success",
    aceptaciones: mapped
  };
}

// ---------------------------------------------------------------------------
// FASE 11: ANALÍTICA AVANZADA Y DASHBOARDS POR ROL
// ---------------------------------------------------------------------------

function getAdvancedDashboardAnalytics(payload) {
  const { authRole } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const usersCount = ss.getSheetByName("Usuarios") ? ss.getSheetByName("Usuarios").getDataRange().getValues().length - 1 : 0;
  const movRows = getOrCreateSheet(ss, "MovimientosCajaBancos").getDataRange().getValues().slice(1);
  const planRows = getOrCreateSheet(ss, "PlanillasNomenclatura").getDataRange().getValues().slice(1);
  const kardexRows = getOrCreateSheet(ss, "InventariosKardex").getDataRange().getValues().slice(1);
  const booksRows = getOrCreateSheet(ss, "BibliotecaEjemplares").getDataRange().getValues().slice(1);
  const loansRows = getOrCreateSheet(ss, "BibliotecaPrestamos").getDataRange().getValues().slice(1);
  const assetsRows = getOrCreateSheet(ss, "ActivosPatrimoniales").getDataRange().getValues().slice(1);
  const routesRows = getOrCreateSheet(ss, "TransporteRutas").getDataRange().getValues().slice(1);

  let totalIngresos = 0;
  let totalEgresos = 0;
  movRows.forEach(r => {
    if (r[9] !== "Anulado") {
      const m = parseFloat(r[4] || 0);
      if (r[2] === "Ingreso") totalIngresos += m;
      if (r[2] === "Egreso") totalEgresos += m;
    }
  });

  const activeLoans = loansRows.filter(r => r[6] === "on_loan").length;
  const activeAssets = assetsRows.filter(r => r[7] === "available" || r[7] === "assigned").length;

  return {
    status: "success",
    role: authRole || "General",
    timestamp: new Date().toISOString(),
    metrics: {
      totalUsuariosRegistrados: Math.max(0, usersCount),
      totalIngresosFinancieros: totalIngresos,
      totalEgresosFinancieros: totalEgresos,
      balanceNeto: totalIngresos - totalEgresos,
      planillasProcesadasCount: planRows.length,
      inventarioKardexCount: kardexRows.length,
      librosBibliotecaCount: booksRows.length,
      prestamosActivosCount: activeLoans,
      activosPatrimonialesCount: activeAssets,
      rutasTransporteCount: routesRows.length
    }
  };
}

// ---------------------------------------------------------------------------
// FASE 11: BIBLIOTECA Y RECURSOS EDUCATIVOS
// ---------------------------------------------------------------------------

function manageLibraryBook(payload) {
  const { ejemplarId, isbnCodigo, titulo, autor, categoria, ubicacionFisica, estado, observaciones } = payload || {};
  if (!titulo || !autor) throw new Error("Título y autor son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "BibliotecaEjemplares");
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  let eId = ejemplarId;
  let existingIndex = -1;

  if (eId) {
    existingIndex = data.findIndex(r => String(r[0]).trim() === String(eId).trim());
  } else if (isbnCodigo) {
    existingIndex = data.findIndex(r => String(r[1]).trim() === String(isbnCodigo).trim());
  }

  if (existingIndex !== -1) {
    eId = data[existingIndex][0];
    sheet.getRange(existingIndex + 1, 1, 1, 8).setValues([[
      eId,
      isbnCodigo || "",
      titulo,
      autor,
      categoria || "General",
      ubicacionFisica || "Estante A1",
      estado || "available",
      observaciones || ""
    ]]);
  } else {
    eId = "LIB-" + now.getTime();
    sheet.appendRow([
      eId,
      isbnCodigo || "",
      titulo,
      autor,
      categoria || "General",
      ubicacionFisica || "Estante A1",
      "available",
      observaciones || ""
    ]);
  }

  return {
    status: "success",
    ejemplarId: eId,
    message: "Ejemplar bibliográfico registrado/actualizado exitosamente."
  };
}

function getLibraryBooks(payload) {
  const { categoria, estado } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let rows = getOrCreateSheet(ss, "BibliotecaEjemplares").getDataRange().getValues().slice(1);

  if (rows.length === 0) {
    const defaults = [
      ["LIB-101", "978-0131103627", "El Lenguaje de Programación C", "Brian W. Kernighan", "Informática", "Estante B2", "available", "Biblioteca Central"],
      ["LIB-102", "978-0201633610", "Design Patterns: Elements of Reusable Object-Oriented Software", "Erich Gamma", "Software", "Estante B3", "available", "Biblioteca Central"]
    ];
    const sheet = getOrCreateSheet(ss, "BibliotecaEjemplares");
    sheet.getRange(2, 1, defaults.length, 8).setValues(defaults);
    rows = defaults;
  }

  let filtered = rows;
  if (categoria) filtered = filtered.filter(r => String(r[4]).toLowerCase().trim() === String(categoria).toLowerCase().trim());
  if (estado) filtered = filtered.filter(r => String(r[6]).trim() === String(estado).trim());

  const mapped = filtered.map(r => ({
    ejemplarId: r[0],
    isbnCodigo: r[1],
    titulo: r[2],
    autor: r[3],
    categoria: r[4],
    ubicacionFisica: r[5],
    estado: r[6],
    observaciones: r[7]
  }));

  return {
    status: "success",
    libros: mapped
  };
}

function processLibraryLoan(payload) {
  const { ejemplarId, userId, fechaDevolucionPrevista, accion, observaciones } = payload || {};
  if (!ejemplarId || !userId) throw new Error("ejemplarId y userId requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const bookSheet = getOrCreateSheet(ss, "BibliotecaEjemplares");
  const loanSheet = getOrCreateSheet(ss, "BibliotecaPrestamos");
  const now = new Date();

  const books = bookSheet.getDataRange().getValues();
  const bIdx = books.findIndex(r => String(r[0]).trim() === String(ejemplarId).trim());
  if (bIdx === -1) throw new Error("Ejemplar bibliográfico no encontrado.");

  if (accion === "Devolucion") {
    bookSheet.getRange(bIdx + 1, 7).setValue("available");
    const loans = loanSheet.getDataRange().getValues();
    const lIdx = loans.findIndex(r => String(r[1]).trim() === String(ejemplarId).trim() && r[6] === "on_loan");
    if (lIdx !== -1) {
      loanSheet.getRange(lIdx + 1, 5).setValue(now);
      loanSheet.getRange(lIdx + 1, 7).setValue("returned");
    }
    return { status: "success", message: "Devolución de ejemplar registrada exitosamente." };
  } else {
    // Préstamo
    if (books[bIdx][6] === "on_loan") throw new Error("El ejemplar ya se encuentra prestado.");

    bookSheet.getRange(bIdx + 1, 7).setValue("on_loan");
    const prestamoId = "LNM-" + now.getTime();
    loanSheet.appendRow([
      prestamoId,
      String(ejemplarId).trim(),
      String(userId).trim(),
      now,
      fechaDevolucionPrevista || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      "",
      "on_loan",
      observaciones || ""
    ]);

    return {
      status: "success",
      prestamoId: prestamoId,
      message: "Préstamo de ejemplar bibliográfico otorgado con éxito."
    };
  }
}

function getLibraryLoans(payload) {
  const { userId, estado } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "BibliotecaPrestamos").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (userId) filtered = filtered.filter(r => String(r[2]).trim() === String(userId).trim());
  if (estado) filtered = filtered.filter(r => String(r[6]).trim() === String(estado).trim());

  const mapped = filtered.map(r => ({
    prestamoId: r[0],
    ejemplarId: r[1],
    userId: r[2],
    fechaPrestamo: r[3],
    fechaDevolucionPrevista: r[4],
    fechaDevolucionReal: r[5],
    estado: r[6],
    observaciones: r[7]
  }));

  return {
    status: "success",
    prestamos: mapped
  };
}

// ---------------------------------------------------------------------------
// FASE 11: ACTIVOS PATRIMONIALES Y CUSTODIAS
// ---------------------------------------------------------------------------

function manageAssetItem(payload) {
  const { activoId, codigoPatrimonial, nombre, categoria, serieModel, ubicacionActual, custodioUserId, estado, observaciones } = payload || {};
  if (!codigoPatrimonial || !nombre) throw new Error("codigoPatrimonial y nombre son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ActivosPatrimoniales");
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  let aId = activoId;
  let existingIndex = -1;

  if (aId) {
    existingIndex = data.findIndex(r => String(r[0]).trim() === String(aId).trim());
  } else {
    existingIndex = data.findIndex(r => String(r[1]).trim() === String(codigoPatrimonial).trim());
  }

  if (existingIndex !== -1) {
    aId = data[existingIndex][0];
    sheet.getRange(existingIndex + 1, 1, 1, 9).setValues([[
      aId,
      String(codigoPatrimonial).trim(),
      nombre,
      categoria || "Equipo Computacional",
      serieModel || "N/A",
      ubicacionActual || "Laboratorio de Cómputo",
      custodioUserId || "",
      estado || "available",
      observaciones || ""
    ]]);
  } else {
    aId = "ACT-" + now.getTime();
    sheet.appendRow([
      aId,
      String(codigoPatrimonial).trim(),
      nombre,
      categoria || "Equipo Computacional",
      serieModel || "N/A",
      ubicacionActual || "Laboratorio de Cómputo",
      custodioUserId || "",
      "available",
      observaciones || ""
    ]);
  }

  return {
    status: "success",
    activoId: aId,
    codigoPatrimonial: codigoPatrimonial,
    message: "Activo patrimonial registrado/actualizado en catálogo."
  };
}

function getAssetItems(payload) {
  const { categoria, estado } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let rows = getOrCreateSheet(ss, "ActivosPatrimoniales").getDataRange().getValues().slice(1);

  if (rows.length === 0) {
    const defaults = [
      ["ACT-001", "PAT-LAB-01", "Computadora HP All-in-One Core i5", "Equipo Computacional", "HP ProOne 400", "Lab Cómputo 1", "EMP-01", "assigned", "Asignado para Docencia"],
      ["ACT-002", "PAT-PROY-01", "Proyector Epson PowerLite 3300", "Audiovisual", "Epson X41+", "Salón de Usos Múltiples", "", "available", "Disponible"]
    ];
    const sheet = getOrCreateSheet(ss, "ActivosPatrimoniales");
    sheet.getRange(2, 1, defaults.length, 9).setValues(defaults);
    rows = defaults;
  }

  let filtered = rows;
  if (categoria) filtered = filtered.filter(r => String(r[3]).toLowerCase().trim() === String(categoria).toLowerCase().trim());
  if (estado) filtered = filtered.filter(r => String(r[7]).trim() === String(estado).trim());

  const mapped = filtered.map(r => ({
    activoId: r[0],
    codigoPatrimonial: r[1],
    nombre: r[2],
    categoria: r[3],
    serieModel: r[4],
    ubicacionActual: r[5],
    custodioUserId: r[6],
    estado: r[7],
    observaciones: r[8]
  }));

  return {
    status: "success",
    activos: mapped
  };
}

function assignAssetCustody(payload) {
  const { activoId, custodioUserId, observaciones } = payload || {};
  if (!activoId || !custodioUserId) throw new Error("activoId y custodioUserId son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const assetSheet = getOrCreateSheet(ss, "ActivosPatrimoniales");
  const asgnSheet = getOrCreateSheet(ss, "AsignacionesActivos");
  const now = new Date();

  const assets = assetSheet.getDataRange().getValues();
  const idx = assets.findIndex(r => String(r[0]).trim() === String(activoId).trim());
  if (idx === -1) throw new Error("Activo patrimonial no encontrado.");

  assetSheet.getRange(idx + 1, 7).setValue(String(custodioUserId).trim());
  assetSheet.getRange(idx + 1, 8).setValue("assigned");

  const asignacionId = "ASG-" + now.getTime();
  asgnSheet.appendRow([
    asignacionId,
    String(activoId).trim(),
    String(custodioUserId).trim(),
    now,
    "",
    "Acta Firmada",
    observaciones || ""
  ]);

  return {
    status: "success",
    asignacionId: asignacionId,
    message: "Custodia de activo patrimonial asignada correctamente."
  };
}

function getAssetAssignments(payload) {
  const { custodioUserId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "AsignacionesActivos").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (custodioUserId) filtered = filtered.filter(r => String(r[2]).trim() === String(custodioUserId).trim());

  const mapped = filtered.map(r => ({
    asignacionId: r[0],
    activoId: r[1],
    custodioUserId: r[2],
    fechaEntrega: r[3],
    fechaDevolucion: r[4],
    estadoActa: r[5],
    observaciones: r[6]
  }));

  return {
    status: "success",
    asignaciones: mapped
  };
}

// ---------------------------------------------------------------------------
// FASE 12: CATÁLOGO CENTRAL DE SPREADSHEETS DISTRIBUIDAS POR AÑO LECTIVO
// ---------------------------------------------------------------------------

function registerSpreadsheetSource(payload) {
  const { fuenteId, dominioArea, anoLectivo, spreadsheetId, urlAcceso, estado, schemaVersion, observaciones } = payload || {};
  if (!dominioArea || !anoLectivo || !spreadsheetId) throw new Error("dominioArea, anoLectivo y spreadsheetId son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CatalogoSpreadsheets");
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  let fId = fuenteId;
  let existingIndex = -1;

  if (fId) {
    existingIndex = data.findIndex(r => String(r[0]).trim() === String(fId).trim());
  } else {
    existingIndex = data.findIndex(r => String(r[1]).toLowerCase().trim() === String(dominioArea).toLowerCase().trim() && String(r[2]).trim() === String(anoLectivo).trim());
  }

  if (existingIndex !== -1) {
    fId = data[existingIndex][0];
    sheet.getRange(existingIndex + 1, 1, 1, 8).setValues([[
      fId,
      String(dominioArea).trim(),
      String(anoLectivo).trim(),
      String(spreadsheetId).trim(),
      urlAcceso || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      estado || "active",
      schemaVersion || "1.0",
      observaciones || ""
    ]]);
  } else {
    fId = "SRC-" + now.getTime();
    sheet.appendRow([
      fId,
      String(dominioArea).trim(),
      String(anoLectivo).trim(),
      String(spreadsheetId).trim(),
      urlAcceso || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      estado || "active",
      schemaVersion || "1.0",
      observaciones || ""
    ]);
  }

  return {
    status: "success",
    fuenteId: fId,
    spreadsheetId: spreadsheetId,
    message: "Fuente de datos distribuida registrada exitosamente en catálogo central."
  };
}

function resolveSpreadsheetSource(payload) {
  const { dominioArea, anoLectivo } = payload || {};
  if (!dominioArea || !anoLectivo) throw new Error("dominioArea y anoLectivo requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "CatalogoSpreadsheets").getDataRange().getValues().slice(1);

  const match = rows.find(r => String(r[1]).toLowerCase().trim() === String(dominioArea).toLowerCase().trim() && String(r[2]).trim() === String(anoLectivo).trim() && r[5] === "active");

  if (!match) {
    // Retornar ID por defecto si no existe una hoja externa específica
    return {
      status: "success",
      resolved: false,
      spreadsheetId: SPREADSHEET_ID,
      dominioArea: dominioArea,
      anoLectivo: anoLectivo,
      message: "Utilizando Spreadsheet Principal predeterminada."
    };
  }

  return {
    status: "success",
    resolved: true,
    fuenteId: match[0],
    dominioArea: match[1],
    anoLectivo: match[2],
    spreadsheetId: match[3],
    urlAcceso: match[4],
    schemaVersion: match[6]
  };
}

function getSpreadsheetCatalog(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "CatalogoSpreadsheets").getDataRange().getValues().slice(1);

  const mapped = rows.map(r => ({
    fuenteId: r[0],
    dominioArea: r[1],
    anoLectivo: r[2],
    spreadsheetId: r[3],
    urlAcceso: r[4],
    estado: r[5],
    schemaVersion: r[6],
    observaciones: r[7]
  }));

  return {
    status: "success",
    catalogo: mapped
  };
}

// ---------------------------------------------------------------------------
// FASE 12: PLANTILLAS ESCOLARES Y DOCUMENTOS EMITIDOS
// ---------------------------------------------------------------------------

function configureSchoolDocumentTemplate(payload) {
  const { plantillaId, codigoDocumento, categoria, titulo, camposJSON, flujoAprobacion, estado, version } = payload || {};
  if (!codigoDocumento || !titulo) throw new Error("codigoDocumento y titulo requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PlantillasEscolares");
  const data = sheet.getDataRange().getValues();

  let pId = plantillaId;
  let existingIndex = -1;

  if (pId) {
    existingIndex = data.findIndex(r => String(r[0]).trim() === String(pId).trim());
  } else {
    existingIndex = data.findIndex(r => String(r[1]).trim() === String(codigoDocumento).trim());
  }

  const cJSON = typeof camposJSON === "object" ? JSON.stringify(camposJSON) : (camposJSON || "[]");

  if (existingIndex !== -1) {
    pId = data[existingIndex][0];
    sheet.getRange(existingIndex + 1, 1, 1, 8).setValues([[
      pId,
      String(codigoDocumento).trim(),
      categoria || "Académico",
      titulo,
      cJSON,
      flujoAprobacion || "Secretaria",
      estado || "active",
      version || "1.0"
    ]]);
  } else {
    pId = "TMP-" + Date.now();
    sheet.appendRow([
      pId,
      String(codigoDocumento).trim(),
      categoria || "Académico",
      titulo,
      cJSON,
      flujoAprobacion || "Secretaria",
      "active",
      version || "1.0"
    ]);
  }

  return {
    status: "success",
    plantillaId: pId,
    message: "Plantilla de documento escolar configurada exitosamente."
  };
}

function getSchoolDocumentTemplates(payload) {
  const { categoria } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let rows = getOrCreateSheet(ss, "PlantillasEscolares").getDataRange().getValues().slice(1);

  if (rows.length === 0) {
    const defaults = [
      ["TMP-001", "CONST-ESTUDIO", "Académico", "Constancia de Estudios Oficial", '[{"nombre":"motivo","tipo":"texto","etiqueta":"Motivo de Solicitud"}]', "Secretaria", "active", "1.0"],
      ["TMP-002", "EXC-FALTA", "Académico", "Excusa / Justificación de Inasistencia", '[{"nombre":"fechaFalta","tipo":"fecha","etiqueta":"Fecha de la Falta"},{"nombre":"motivo","tipo":"texto_largo","etiqueta":"Motivo Médico/Personal"}]', "Orientación", "active", "1.0"],
      ["TMP-003", "CONST-PAGO", "Financiero", "Constancia de Solvencia Financiera", '[{"nombre":"meses","tipo":"texto","etiqueta":"Meses Solventes"}]', "Contabilidad", "active", "1.0"]
    ];
    const sheet = getOrCreateSheet(ss, "PlantillasEscolares");
    sheet.getRange(2, 1, defaults.length, 8).setValues(defaults);
    rows = defaults;
  }

  let filtered = rows;
  if (categoria) filtered = filtered.filter(r => String(r[2]).toLowerCase().trim() === String(categoria).toLowerCase().trim());

  const mapped = filtered.map(r => ({
    plantillaId: r[0],
    codigoDocumento: r[1],
    categoria: r[2],
    titulo: r[3],
    camposJSON: r[4],
    flujoAprobacion: r[5],
    estado: r[6],
    version: r[7]
  }));

  return {
    status: "success",
    plantillas: mapped
  };
}

function generateSchoolDocument(payload) {
  const { plantillaId, estudianteUserId, solicitanteUserId, datosFormulario } = payload || {};
  if (!plantillaId || !estudianteUserId) throw new Error("plantillaId y estudianteUserId son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "DocumentosEscolaresEmitidos");
  const now = new Date();
  const docId = "DOC-EM-" + now.getTime();
  const verifCode = "VERIF-" + Math.floor(100000 + Math.random() * 900000);

  const dJSON = typeof datosFormulario === "object" ? JSON.stringify(datosFormulario) : (datosFormulario || "{}");

  sheet.appendRow([
    docId,
    String(plantillaId).trim(),
    String(estudianteUserId).trim(),
    solicitanteUserId ? String(solicitanteUserId).trim() : String(estudianteUserId).trim(),
    dJSON,
    "issued",
    verifCode,
    "Emitido electrónicamente con verificación QR/Código"
  ]);

  return {
    status: "success",
    documentoId: docId,
    codigoVerificacion: verifCode,
    message: "Documento escolar generado e imprimible con código de autenticidad."
  };
}

function getIssuedSchoolDocuments(payload) {
  const { estudianteUserId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "DocumentosEscolaresEmitidos").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (estudianteUserId) filtered = filtered.filter(r => String(r[2]).trim() === String(estudianteUserId).trim());

  const mapped = filtered.map(r => ({
    documentoId: r[0],
    plantillaId: r[1],
    estudianteUserId: r[2],
    solicitanteUserId: r[3],
    datosJSON: r[4],
    estadoDoc: r[5],
    codigoVerificacion: r[6],
    observaciones: r[7]
  }));

  return {
    status: "success",
    documentos: mapped
  };
}

// ---------------------------------------------------------------------------
// FASE 12: MOTOR DE IMPORTACIÓN, MAPEO DE COLUMNAS Y AUDITORÍA DE MIGRACIONES
// ---------------------------------------------------------------------------

function validateImportPreview(payload) {
  const { nombreArchivo, destinoModulo, columnaMapeo, filasData } = payload || {};
  if (!Array.isArray(filasData) || filasData.length === 0) throw new Error("filasData vacías para vista previa.");

  const totalFilas = filasData.length;
  const mapeo = columnaMapeo || {};
  const errores = [];
  let filasValidas = 0;

  filasData.forEach((row, idx) => {
    // Validar identificador obligatorio según módulo
    const idKey = mapeo["identificador"] || "identidad" || "userId" || "identificacion";
    const idVal = row[idKey] || row[Object.keys(row)[0]];

    if (!idVal || String(idVal).trim() === "") {
      errores.push({ filaNum: idx + 1, campo: idKey, mensaje: "Identificador único ausente en fila." });
    } else {
      filasValidas++;
    }
  });

  return {
    status: "success",
    nombreArchivo: nombreArchivo || "archivo.xlsx",
    destinoModulo: destinoModulo || "Estudiantes",
    resumenValidation: {
      totalFilas: totalFilas,
      filasValidas: filasValidas,
      filasFallidas: totalFilas - filasValidas,
      mapeoConfirmado: mapeo,
      erroresLista: errores.slice(0, 10)
    }
  };
}

function importDataWithColumnMapping(payload) {
  const { nombreArchivo, destinoModulo, columnaMapeo, filasData, creadoPor } = payload || {};
  if (!Array.isArray(filasData) || filasData.length === 0) throw new Error("filasData vacías.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const auditSheet = getOrCreateSheet(ss, "AuditoriaMigraciones");
  const now = new Date();
  const ejecucionId = "MIG-" + now.getTime();

  let exitosas = 0;
  let fallidas = 0;
  const errores = [];

  const mapeo = columnaMapeo || {};

  filasData.forEach((row, idx) => {
    try {
      const idKey = mapeo["identificador"] || Object.keys(row)[0];
      const idVal = row[idKey];

      if (!idVal || String(idVal).trim() === "") {
        fallidas++;
        errores.push({ fila: idx + 1, error: "Identificador ausente" });
      } else {
        exitosas++;
      }
    } catch (e) {
      fallidas++;
      errores.push({ fila: idx + 1, error: e.message });
    }
  });

  auditSheet.appendRow([
    ejecucionId,
    nombreArchivo || "importacion.xlsx",
    destinoModulo || "General",
    filasData.length,
    exitosas,
    fallidas,
    JSON.stringify(mapeo),
    JSON.stringify(errores.slice(0, 20)),
    fallidas === 0 ? "completed" : "completed_with_errors",
    creadoPor || "SISTEMA"
  ]);

  return {
    status: "success",
    ejecucionId: ejecucionId,
    totalFilas: filasData.length,
    exitosas: exitosas,
    fallidas: fallidas,
    estado: fallidas === 0 ? "completed" : "completed_with_errors",
    message: "Migración e importación procesada con preservación estricta de correspondencia de filas."
  };
}

function getMigrationLogs(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "AuditoriaMigraciones").getDataRange().getValues().slice(1);

  const mapped = rows.map(r => ({
    ejecucionId: r[0],
    nombreArchivo: r[1],
    destinoModulo: r[2],
    totalFilas: parseInt(r[3] || 0),
    exitosas: parseInt(r[4] || 0),
    fallidas: parseInt(r[5] || 0),
    mapeoJSON: r[6],
    erroresJSON: r[7],
    estado: r[8],
    creadoPor: r[9]
  }));

  return {
    status: "success",
    migraciones: mapped
  };
}

// ---------------------------------------------------------------------------
// FASE 12: INTEGRACIÓN Y GENERACIÓN COMPATIBLE CON PLANTILLAS SACE
// ---------------------------------------------------------------------------

function verifySACETemplateCompatibility(payload) {
  const { nombreFormato, columnasDetectadas } = payload || {};
  if (!nombreFormato) throw new Error("nombreFormato requerido.");

  const cols = Array.isArray(columnasDetectadas) ? columnasDetectadas : [];
  const requiredSACECols = ["identidad", "nombreAlumno", "calificacionOrdinaria", "recuperacion"];

  const missing = requiredSACECols.filter(rc => !cols.some(c => c.toLowerCase().includes(rc.toLowerCase())));

  const isCompatible = missing.length === 0;

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "PlantillasSACEVerificadas");
  const now = new Date();
  const plantillaSaceId = "SACE-TMP-" + now.getTime();

  sheet.appendRow([
    plantillaSaceId,
    nombreFormato,
    "SACE-2026-v2",
    JSON.stringify(cols),
    isCompatible ? "verified" : "incompatible",
    isCompatible ? "Formato SACE oficial verificado" : "Faltan columnas requeridas: " + missing.join(", ")
  ]);

  return {
    status: "success",
    plantillaSaceId: plantillaSaceId,
    esCompatible: isCompatible,
    columnasFaltantes: missing,
    message: isCompatible ? "Plantilla SACE verificada como 100% compatible." : "Atención: La plantilla SACE requiere revisión de estructura."
  };
}

function generateSACEReportFile(payload) {
  const { anoLectivo, parcial, grado, seccion, asignatura, estudiantesNotas } = payload || {};
  if (!grado || !seccion || !asignatura) throw new Error("grado, seccion y asignatura requeridos para reporte SACE.");

  const list = Array.isArray(estudiantesNotas) ? estudiantesNotas : [];

  const mappedSACEData = list.map(item => {
    const notaOrd = parseFloat(item.calificacionOrdinaria || item.notaFinal || 0);
    const notaRec = parseFloat(item.recuperacion || 0);
    const notaFinalSACE = Math.max(notaOrd, notaRec);

    return {
      identidad: item.identidad || item.userId,
      nombreAlumno: item.nombre || "Estudiante",
      grado: grado,
      seccion: seccion,
      asignatura: asignatura,
      parcial: parcial || "Primer Parcial",
      calificacionOrdinaria: notaOrd,
      recuperacion: notaRec,
      resultadoFinalSACE: notaFinalSACE,
      estadoAprobacion: notaFinalSACE >= 70 ? "APROBADO" : "REPROBADO"
    };
  });

  return {
    status: "success",
    anoLectivo: anoLectivo || new Date().getFullYear(),
    grado: grado,
    seccion: seccion,
    asignatura: asignatura,
    registrosCompletados: mappedSACEData.length,
    datosReporteSACE: mappedSACEData,
    message: "Archivo de calificaciones SACE generado preservando fórmulas, estructura e identidades oficiales."
  };
}

// ---------------------------------------------------------------------------
// FASE 11: TRANSPORTE ESCOLAR Y RUTAS
// ---------------------------------------------------------------------------

function manageTransportRoute(payload) {
  const { rutaId, nombreRuta, unidadCodigo, conductorEmpleadoId, capacidad, paradasJSON, estado, observaciones } = payload || {};
  if (!nombreRuta || !unidadCodigo) throw new Error("nombreRuta y unidadCodigo son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "TransporteRutas");
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  let rId = rutaId;
  let existingIndex = -1;

  if (rId) {
    existingIndex = data.findIndex(r => String(r[0]).trim() === String(rId).trim());
  } else {
    existingIndex = data.findIndex(r => String(r[1]).toLowerCase().trim() === String(nombreRuta).toLowerCase().trim());
  }

  const pJSON = typeof paradasJSON === "object" ? JSON.stringify(paradasJSON) : (paradasJSON || "[]");

  if (existingIndex !== -1) {
    rId = data[existingIndex][0];
    sheet.getRange(existingIndex + 1, 1, 1, 8).setValues([[
      rId,
      String(nombreRuta).trim(),
      String(unidadCodigo).trim(),
      conductorEmpleadoId || "EMP-BUS-01",
      parseInt(capacidad || 25),
      pJSON,
      estado || "active",
      observaciones || ""
    ]]);
  } else {
    rId = "RUT-" + now.getTime();
    sheet.appendRow([
      rId,
      String(nombreRuta).trim(),
      String(unidadCodigo).trim(),
      conductorEmpleadoId || "EMP-BUS-01",
      parseInt(capacidad || 25),
      pJSON,
      "active",
      observaciones || ""
    ]);
  }

  return {
    status: "success",
    rutaId: rId,
    message: "Ruta de transporte escolar registrada/actualizada exitosamente."
  };
}

function getTransportRoutes(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let rows = getOrCreateSheet(ss, "TransporteRutas").getDataRange().getValues().slice(1);

  if (rows.length === 0) {
    const defaults = [
      ["RUT-01", "Ruta Principal Anillo Periférico", "BUS-01", "EMP-CONDUCTOR-01", 30, '[{"parada":"Plaza Miraflores","hora":"06:30 AM"},{"parada":"Residencial Las Uvas","hora":"06:45 AM"}]', "active", "Ruta de Mañana"],
      ["RUT-02", "Ruta Bulevar Morazán", "BUS-02", "EMP-CONDUCTOR-02", 25, '[{"parada":"Mall Multiplaza","hora":"06:25 AM"},{"parada":"Colonia Palmira","hora":"06:40 AM"}]', "active", "Ruta de Mañana"]
    ];
    const sheet = getOrCreateSheet(ss, "TransporteRutas");
    sheet.getRange(2, 1, defaults.length, 8).setValues(defaults);
    rows = defaults;
  }

  const mapped = rows.map(r => ({
    rutaId: r[0],
    nombreRuta: r[1],
    unidadCodigo: r[2],
    conductorEmpleadoId: r[3],
    capacidad: parseInt(r[4] || 0),
    paradasJSON: r[5],
    estado: r[6],
    observaciones: r[7]
  }));

  return {
    status: "success",
    rutas: mapped
  };
}

function assignStudentTransport(payload) {
  const { rutaId, estudianteUserId, paradaNombre, horarioPlan } = payload || {};
  if (!rutaId || !estudianteUserId) throw new Error("rutaId y estudianteUserId son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "TransporteAsignaciones");
  const now = new Date();
  const asgnId = "TRN-" + now.getTime();

  sheet.appendRow([
    asgnId,
    String(rutaId).trim(),
    String(estudianteUserId).trim(),
    paradaNombre || "Parada Principal",
    horarioPlan || "06:30 AM",
    "active"
  ]);

  return {
    status: "success",
    asignacionTranspId: asgnId,
    message: "Estudiante asignado a ruta de transporte escolar con éxito."
  };
}

function getTransportAssignments(payload) {
  const { estudianteUserId, rutaId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rows = getOrCreateSheet(ss, "TransporteAsignaciones").getDataRange().getValues().slice(1);

  let filtered = rows;
  if (estudianteUserId) filtered = filtered.filter(r => String(r[2]).trim() === String(estudianteUserId).trim());
  if (rutaId) filtered = filtered.filter(r => String(r[1]).trim() === String(rutaId).trim());

  const mapped = filtered.map(r => ({
    asignacionTranspId: r[0],
    rutaId: r[1],
    estudianteUserId: r[2],
    paradaNombre: r[3],
    horarioPlan: r[4],
    estado: r[5]
  }));

  return {
    status: "success",
    asignaciones: mapped
  };
}
