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
    if (name === "PagosAbonos") sheet.appendRow(["PagoID", "Fecha", "UserId", "CargoID", "Concepto", "MontoAbono", "MetodoPago", "Referencia", "Estado", "ReciboID", "Observaciones"]);
    if (name === "ComprobantesPago") sheet.appendRow(["ComprobanteID", "Fecha", "UserId", "Alumno", "CargoID", "MontoReportado", "MetodoPago", "Referencia", "ComprobanteUrl", "Estado", "Observaciones"]);
    if (name === "FacturasFiscales") sheet.appendRow(["FacturaID", "FechaEmision", "CAI", "RangoInicial", "RangoFinal", "NumeroFactura", "UserId", "ClienteNombre", "ClienteRTN", "Concepto", "Subtotal", "ISV15", "Total", "Estado", "FechaLimiteEmision", "Observaciones"]);
    if (name === "MovimientosCajaBancos") sheet.appendRow(["MovimientoID", "Fecha", "Tipo", "Categoria", "Monto", "MetodoPago", "ReferenciaBancaria", "ProveedorTercero", "ResponsableUserId", "Estado", "Observaciones"]);
    if (name === "CierresCaja") sheet.appendRow(["CierreID", "FechaCierre", "ResponsableUserId", "MontoInicial", "TotalIngresos", "TotalEgresos", "SaldoTeorico", "SaldoRealEfectivo", "Diferencia", "Estado", "Observaciones"]);
    if (name === "PlanillasNomenclatura") sheet.appendRow(["PlanillaID", "FechaGeneracion", "PeriodoMes", "EmpleadoId", "EmpleadoNombre", "CargoPuesto", "SalarioBase", "HorasExtras", "MontoHorasExtras", "Bonificaciones", "DeduccionIHSS", "DeduccionRAP", "DeduccionISR", "OtrasDeducciones", "SalarioNeto", "Estado"]);
    if (name === "DeduccionesAsistencia") sheet.appendRow(["AsistenciaID", "Fecha", "EmpleadoId", "EmpleadoNombre", "HoraEntrada", "HoraSalida", "MinutosTardanza", "EstadoAsistencia", "Observaciones"]);
    if (name === "BoletasPago") sheet.appendRow(["BoletaID", "PlanillaID", "FechaEmision", "EmpleadoId", "EmpleadoNombre", "PeriodoMes", "TotalDevengado", "TotalDeducciones", "NetoAPagar", "EstadoBoleta"]);
    if (name === "InventariosKardex") sheet.appendRow(["KardexID", "Fecha", "ItemCodigo", "ItemNombre", "CategoriaTipo", "TipoMovimiento", "Cantidad", "StockAnterior", "StockNuevo", "StockMinimo", "UbicacionResponsable", "Observaciones"]);
    if (name === "ProveedoresActivos") sheet.appendRow(["ProveedorID", "FechaRegistro", "NombreProveedor", "RTN", "Telefono", "Email", "RubroServicio", "Estado", "Observaciones"]);
  }
  return sheet;
}

// ---------------------------------------------------------------------------
// ENDPOINTS & RBAC PERMISSIONS
// ---------------------------------------------------------------------------

function doGet() { return textResponse({ status: "success", message: "Microservicio Contabilidad y Planillas operativo" }); }

const ROLE_PERMISSIONS = {
  "Administrador": ["*"],
  "Director": ["configurePaymentConcept", "getStudentAccountStatement", "recordStudentPayment", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "createFiscalInvoice", "getFiscalInvoices", "recordCashBankMovement", "closeCashSession", "getCashBankSummary", "generatePayrollPeriod", "recordStaffAttendance", "getStaffPayrollReceipt", "recordInventoryMovement", "getInventoryKardex", "registerSupplier"],
  "Subdirector": ["configurePaymentConcept", "getStudentAccountStatement", "recordStudentPayment", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "createFiscalInvoice", "getFiscalInvoices", "recordCashBankMovement", "closeCashSession", "getCashBankSummary", "generatePayrollPeriod", "recordStaffAttendance", "getStaffPayrollReceipt", "recordInventoryMovement", "getInventoryKardex", "registerSupplier"],
  "Secretaría": ["configurePaymentConcept", "getStudentAccountStatement", "recordStudentPayment", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "createFiscalInvoice", "getFiscalInvoices", "recordCashBankMovement", "getCashBankSummary", "recordStaffAttendance", "recordInventoryMovement", "getInventoryKardex", "registerSupplier"],
  "Contador": ["configurePaymentConcept", "getStudentAccountStatement", "recordStudentPayment", "uploadPaymentVoucher", "generatePaymentReceiptPDF", "createFiscalInvoice", "getFiscalInvoices", "recordCashBankMovement", "closeCashSession", "getCashBankSummary", "generatePayrollPeriod", "recordStaffAttendance", "getStaffPayrollReceipt", "recordInventoryMovement", "getInventoryKardex", "registerSupplier"],
  "Consejeros": [],
  "Profesor": [],
  "Asistente": [],
  "Estudiante": ["getStudentAccountStatement", "uploadPaymentVoucher", "generatePaymentReceiptPDF"],
  "Alumno": ["getStudentAccountStatement", "uploadPaymentVoucher", "generatePaymentReceiptPDF"]
};

function validateRolePermission(action, payload) {
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
      case "getStudentAccountStatement": result = getStudentAccountStatement(payload); break;
      case "recordStudentPayment": result = recordStudentPayment(payload); break;
      case "uploadPaymentVoucher": result = uploadPaymentVoucher(payload); break;
      case "generatePaymentReceiptPDF": result = generatePaymentReceiptPDF(payload); break;
      case "createFiscalInvoice": result = createFiscalInvoice(payload); break;
      case "getFiscalInvoices": result = getFiscalInvoices(payload); break;
      case "recordCashBankMovement": result = recordCashBankMovement(payload); break;
      case "closeCashSession": result = closeCashSession(payload); break;
      case "getCashBankSummary": result = getCashBankSummary(payload); break;
      case "generatePayrollPeriod": result = generatePayrollPeriod(payload); break;
      case "recordStaffAttendance": result = recordStaffAttendance(payload); break;
      case "getStaffPayrollReceipt": result = getStaffPayrollReceipt(payload); break;
      case "recordInventoryMovement": result = recordInventoryMovement(payload); break;
      case "getInventoryKardex": result = getInventoryKardex(payload); break;
      case "registerSupplier": result = registerSupplier(payload); break;
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
