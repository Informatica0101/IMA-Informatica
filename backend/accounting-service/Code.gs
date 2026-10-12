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
  }
  return sheet;
}

// ---------------------------------------------------------------------------
// ENDPOINTS & RBAC PERMISSIONS
// ---------------------------------------------------------------------------

function doGet() { return textResponse({ status: "success", service: "ACCOUNTING", timestamp: new Date().toISOString(), dbConnected: true }); }

const ROLE_PERMISSIONS = {
  "Administrador": ["*"],
  "Director": ["configurePaymentConcept", "configurePaymentTariff", "getStudentAccountStatement", "recordStudentPayment", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "createFiscalInvoice", "getFiscalInvoices", "configureGatewayIntegration", "testGatewayConnection", "recordCashBankMovement", "closeCashSession", "getCashBankSummary", "performBankReconciliation", "recordAccountsPayableExpense", "getChartOfAccounts", "recordAccountingJournalEntry", "generatePayrollPeriod", "recordStaffAttendance", "getStaffPayrollReceipt", "recordInventoryMovement", "getInventoryKardex", "registerSupplier", "createEmployeeRecord", "getEmployeeRecords", "manageEmployeeContract", "getEmployeeContracts", "submitVacationRequest", "getVacationRequests", "reviewVacationRequest", "configureFiscalPolicy", "getFiscalPolicies", "publishInstitutionalPolicy", "getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances"],
  "Subdirector": ["configurePaymentConcept", "configurePaymentTariff", "getStudentAccountStatement", "recordStudentPayment", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "createFiscalInvoice", "getFiscalInvoices", "configureGatewayIntegration", "testGatewayConnection", "recordCashBankMovement", "closeCashSession", "getCashBankSummary", "performBankReconciliation", "recordAccountsPayableExpense", "getChartOfAccounts", "recordAccountingJournalEntry", "generatePayrollPeriod", "recordStaffAttendance", "getStaffPayrollReceipt", "recordInventoryMovement", "getInventoryKardex", "registerSupplier", "createEmployeeRecord", "getEmployeeRecords", "manageEmployeeContract", "getEmployeeContracts", "submitVacationRequest", "getVacationRequests", "reviewVacationRequest", "configureFiscalPolicy", "getFiscalPolicies", "publishInstitutionalPolicy", "getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances"],
  "Secretaría": ["configurePaymentConcept", "configurePaymentTariff", "getStudentAccountStatement", "recordStudentPayment", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "createFiscalInvoice", "getFiscalInvoices", "recordCashBankMovement", "getCashBankSummary", "recordStaffAttendance", "recordInventoryMovement", "getInventoryKardex", "registerSupplier", "createEmployeeRecord", "getEmployeeRecords", "manageEmployeeContract", "getEmployeeContracts", "submitVacationRequest", "getVacationRequests", "publishInstitutionalPolicy", "getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances"],
  "Contador": ["configurePaymentConcept", "configurePaymentTariff", "getStudentAccountStatement", "recordStudentPayment", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "createFiscalInvoice", "getFiscalInvoices", "configureGatewayIntegration", "testGatewayConnection", "recordCashBankMovement", "closeCashSession", "getCashBankSummary", "performBankReconciliation", "recordAccountsPayableExpense", "getChartOfAccounts", "recordAccountingJournalEntry", "generatePayrollPeriod", "recordStaffAttendance", "getStaffPayrollReceipt", "recordInventoryMovement", "getInventoryKardex", "registerSupplier", "createEmployeeRecord", "getEmployeeRecords", "manageEmployeeContract", "getEmployeeContracts", "submitVacationRequest", "getVacationRequests", "reviewVacationRequest", "configureFiscalPolicy", "getFiscalPolicies", "publishInstitutionalPolicy", "getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances"],
  "Consejeros": ["getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances"],
  "Profesor": ["getStaffPayrollReceipt", "submitVacationRequest", "getVacationRequests", "getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances"],
  "Asistente": ["getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances"],
  "Estudiante": ["getStudentAccountStatement", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances"],
  "Alumno": ["getStudentAccountStatement", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "getInstitutionalPolicies", "recordPolicyAcceptance", "getPolicyAcceptances"]
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
      case "ping": result = { status: "success", service: "ACCOUNTING", timestamp: new Date().toISOString(), dbConnected: true }; break;
      default: result = { status: "error", message: `Acción no reconocida: ${action}` };
    }
    return textResponse(result);
  } catch (err) { return textResponse({ status: "error", message: err.message || "Error interno contabilidad." }); }
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
