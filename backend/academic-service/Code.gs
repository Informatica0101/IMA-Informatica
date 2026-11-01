// ============================================================================
// MICROSERVICIO ACADÉMICO (VERSIÓN MODULAR RESTAURADA v7.9.6)
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

function normalizeString(str) {
  if (!str) return "";
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === "ConfiguracionAcademica") sheet.appendRow(["ID", "Fecha", "Parcial", "Grado", "Sección", "Asignatura", "Unidad", "Tema", "profesorId"]);
    if (name === "HistorialAcademico") sheet.appendRow(["ID", "Fecha", "Parcial", "Grado", "Sección", "Asignatura", "Unidad", "profesorId"]);
    if (name === "Clases") sheet.appendRow(["Grado", "Seccion", "WhatsAppLink"]);
    if (name === "BancoPreguntas") sheet.appendRow(["PreguntaID", "Asignatura", "Nivel", "Tema", "TipoActividad", "Pregunta", "OpcionA", "OpcionB", "OpcionC", "OpcionD", "RespuestaCorrecta", "Explicacion", "Imagen", "VecesRespondida", "VecesCorrecta", "PorcentajeAcierto", "UltimaActualizacion", "Activa", "DificultadCalculada"]);
  }
  return sheet;
}

// ---------------------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------------------

function doGet() {
  return textResponse(pingHealthCheck("ACADEMIC"));
}

function pingHealthCheck(serviceName) {
  const now = new Date();
  return {
    status: "success",
    service: serviceName || "ACADEMIC",
    timestamp: now.toISOString(),
    epoch: now.getTime(),
    message: `Microservicio ${serviceName || "ACADEMIC"} en línea y respondiendo ping.`
  };
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return textResponse({ status: "error", message: "No se recibieron datos." });
    const { action, payload } = JSON.parse(e.postData.contents);
    let result;
    switch (action) {
      case "ping": result = pingHealthCheck("ACADEMIC"); break;
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
      case "recordStructuredLog": result = recordAcademicStructuredLog(payload); break;
      case "createSpreadsheetBackup": result = createAcademicBackup(payload); break;
      case "createOrUpdateStudyGuide": result = createOrUpdateStudyGuide(payload); break;
      case "getStudyGuides": result = getStudyGuides(payload); break;
      case "toggleStudyGuideStatus": result = toggleStudyGuideStatus(payload); break;
      default: result = { status: "error", message: `Acción no reconocida: ${action}` };
    }
    return textResponse(result);
  } catch (err) { return textResponse({ status: "error", message: err.message || "Error interno académico." }); }
}

// ---------------------------------------------------------------------------
// LÓGICA ACADÉMICA
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
    // Impide que dos profesores tengan la misma combinación de parcial, grado, sección y asignatura.
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
      // Fallback para estructura plana (Retrocompatibilidad)
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

    // REQ: Soporte para Asignación Jerárquica (v7.9.7)
    // Prioriza la estructura enviada por el frontend para evitar contaminación entre grados.
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
      // Fallback: Producto Cartesiano (Retrocompatibilidad)
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
    // Persistencia Segura: No limpiar antes de escribir para evitar pérdida por timeout
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
  // REQ: Normalización de llaves existentes para evitar duplicados por inconsistencia de formato (v7.9.6)
  const existingKeys = new Set(data.map(r => {
    const match = String(r[0]).match(/hist-(\d+)/); if (match) { const num = parseInt(match[1]); if (num > lastIdNum) lastIdNum = num; }
    return `${normalizeString(r[2])}|${normalizeString(r[3])}|${normalizeString(r[4])}|${normalizeString(r[5])}|${normalizeString(r[7])}`;
  }));

  const newEntries = [];

  if (scope.hierarchicalAssignments && Array.isArray(scope.hierarchicalAssignments)) {
    // REQ: Historial basado en jerarquía real (v7.9.7)
    // Evita registros redundantes de contaminación cruzada.
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
    // Fallback: Producto Cartesiano
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

// ---------------------------------------------------------------------------
// LOGS ESTRUCTURADOS EN SERVICIO ACADÉMICO (REQ-EXP-018)
// ---------------------------------------------------------------------------

function recordAcademicStructuredLog(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
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

  const logId = "LOG-ACAD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  const severidad = (payload.severidad || "INFO").toString().toUpperCase();
  const funcion = (payload.funcion || "general").toString();
  const codigoError = (payload.codigoError || "").toString();
  const usuarioId = (payload.usuarioId || payload.requesterUserId || "ANON").toString();
  let detalles = payload.detalles || payload.message || "";
  if (typeof detalles === "object") detalles = JSON.stringify(detalles);

  sheet.appendRow([
    logId,
    new Date().toISOString(),
    severidad,
    "ACADEMIC",
    funcion,
    codigoError,
    usuarioId,
    String(detalles)
  ]);

  return { status: "success", logId: logId };
}

function createAcademicBackup(payload) {
  const requesterUserId = (payload && payload.requesterUserId) ? String(payload.requesterUserId) : "SYSTEM";
  const tipo = (payload && payload.tipo) ? String(payload.tipo).toUpperCase() : "MANUAL";
  const timestamp = new Date();
  const dateFormatted = Utilities.formatDate(timestamp, "America/Tegucigalpa", "yyyy-MM-dd_HH-mm-ss");
  const backupFileName = "Backup_ACADEMIC_" + dateFormatted;

  try {
    const file = DriveApp.getFileById(SPREADSHEET_ID);
    const folders = DriveApp.getFoldersByName("New Generation - Respaldos del Sistema");
    let targetFolder;
    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = DriveApp.createFolder("New Generation - Respaldos del Sistema");
    }

    const backupFile = file.makeCopy(backupFileName, targetFolder);
    const backupId = "BKP-ACAD-" + timestamp.getTime();
    const fileSize = backupFile.getSize();
    const fileUrl = backupFile.getUrl();
    const checksum = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, backupFile.getId() + "_" + fileSize)
      .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, "0"))
      .join("");

    recordAcademicStructuredLog({
      severidad: "INFO",
      funcion: "createAcademicBackup",
      codigoError: "BACKUP_SUCCESS",
      requesterUserId: requesterUserId,
      detalles: JSON.stringify({ backupId: backupId, fileId: backupFile.getId(), checksum: checksum })
    });

    return {
      status: "success",
      message: "Respaldo del servicio académico generado exitosamente.",
      backup: {
        backupId: backupId,
        fechaHora: timestamp.toISOString(),
        servicio: "ACADEMIC",
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
    recordAcademicStructuredLog({
      severidad: "ERROR",
      funcion: "createAcademicBackup",
      codigoError: "BACKUP_FAILED",
      requesterUserId: requesterUserId,
      detalles: err.message
    });
    return { status: "error", message: "Error al generar respaldo académico: " + err.message };
  }
}

// ---------------------------------------------------------------------------
// GESTIÓN DE GUÍAS DE ESTUDIO POR ASIGNATURA Y PARCIAL (REQ-DOC-001)
// ---------------------------------------------------------------------------

function getOrCreateGuiasEstudioSheet(ss) {
  let sheet = ss.getSheetByName("GuiasEstudio");
  if (!sheet) {
    sheet = ss.insertSheet("GuiasEstudio");
    sheet.appendRow([
      "id_guia",
      "asignatura",
      "grado",
      "seccion",
      "parcial",
      "titulo",
      "descripcion",
      "archivo_url",
      "archivo_nombre",
      "tipo_mime",
      "docente_id",
      "docente_nombre",
      "fecha_creacion",
      "estado"
    ]);
  }
  return sheet;
}

/**
 * Crea o actualiza una guía de estudio formativa.
 * Valida campos obligatorios y extensiones/MIME documentales permitidas.
 */
function createOrUpdateStudyGuide(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateGuiasEstudioSheet(ss);

    const {
      id_guia,
      asignatura,
      grado,
      seccion,
      parcial,
      titulo,
      descripcion,
      archivo_url,
      archivo_nombre,
      tipo_mime,
      docente_id,
      docente_nombre,
      requesterUserId
    } = payload || {};

    if (!asignatura || !grado || !parcial || !titulo) {
      return { status: "error", message: "Campos obligatorios incompletos: asignatura, grado, parcial y título son requeridos." };
    }

    const ALLOWED_MIMES = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-powerpoint"
    ];

    if (tipo_mime && !ALLOWED_MIMES.includes(tipo_mime) && !tipo_mime.startsWith("image/")) {
      return { status: "error", message: "Tipo de archivo no autorizado. Formatos permitidos: PDF, DOCX, TXT, XLSX, PPTX." };
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIdx = headers.indexOf("id_guia");
    const now = new Date();

    if (id_guia) {
      // Modo Actualización
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][idIdx]) === String(id_guia)) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex !== -1) {
        sheet.getRange(rowIndex, 2).setValue(asignatura);
        sheet.getRange(rowIndex, 3).setValue(grado);
        sheet.getRange(rowIndex, 4).setValue(seccion || "Todas");
        sheet.getRange(rowIndex, 5).setValue(parcial);
        sheet.getRange(rowIndex, 6).setValue(titulo);
        sheet.getRange(rowIndex, 7).setValue(descripcion || "");
        if (archivo_url) sheet.getRange(rowIndex, 8).setValue(archivo_url);
        if (archivo_nombre) sheet.getRange(rowIndex, 9).setValue(archivo_nombre);
        if (tipo_mime) sheet.getRange(rowIndex, 10).setValue(tipo_mime);
        if (docente_nombre) sheet.getRange(rowIndex, 12).setValue(docente_nombre);

        recordAcademicStructuredLog({
          severidad: "INFO",
          funcion: "createOrUpdateStudyGuide",
          codigoError: "GUIDE_UPDATED",
          requesterUserId: requesterUserId || docente_id,
          detalles: `Guía de estudio actualizada: ${id_guia} - ${titulo}`
        });

        return { status: "success", message: "Guía de estudio actualizada exitosamente.", id_guia: id_guia };
      }
    }

    // Modo Creación Nueva Guía
    const newId = "GUIA-" + now.getFullYear() + "-" + ("0000" + Math.floor(Math.random() * 90000 + 10000)).slice(-5);
    const row = [
      newId,
      asignatura,
      grado,
      seccion || "Todas",
      parcial,
      titulo,
      descripcion || "",
      archivo_url || "",
      archivo_nombre || "",
      tipo_mime || "application/pdf",
      docente_id || requesterUserId || "DOCENTE",
      docente_nombre || "Docente Asignado",
      now.toISOString(),
      "activo"
    ];

    sheet.appendRow(row);

    recordAcademicStructuredLog({
      severidad: "INFO",
      funcion: "createOrUpdateStudyGuide",
      codigoError: "GUIDE_CREATED",
      requesterUserId: requesterUserId || docente_id,
      detalles: `Nueva guía creada: ${newId} - ${titulo} (${asignatura})`
    });

    return {
      status: "success",
      message: "Guía de estudio publicada exitosamente.",
      id_guia: newId,
      guia: {
        id_guia: newId,
        asignatura: asignatura,
        grado: grado,
        seccion: seccion || "Todas",
        parcial: parcial,
        titulo: titulo,
        descripcion: descripcion || "",
        archivo_url: archivo_url || "",
        archivo_nombre: archivo_nombre || "",
        tipo_mime: tipo_mime || "application/pdf",
        docente_id: docente_id || requesterUserId,
        docente_nombre: docente_nombre || "Docente Asignado",
        fecha_creacion: now.toISOString(),
        estado: "activo"
      }
    };
  } catch (err) {
    return { status: "error", message: "Error al gestionar guía de estudio: " + err.message };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Consulta el listado de guías de estudio filtrando por grado, sección, materia, parcial y estado.
 */
function getStudyGuides(payload) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateGuiasEstudioSheet(ss);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return { status: "success", guias: [] };
    }

    const headers = data[0];
    const { grado, seccion, asignatura, parcial, estado, docente_id, rol } = payload || {};

    const guias = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const item = {};
      headers.forEach((h, idx) => {
        item[h] = row[idx];
      });

      // Filtro por estado: si no se especifica y es alumno, solo activas
      if (rol === "Estudiante" || !estado) {
        if (item.estado && String(item.estado).toLowerCase() !== "activo") continue;
      } else if (estado && String(item.estado).toLowerCase() !== String(estado).toLowerCase()) {
        continue;
      }

      // Filtro por grado
      if (grado && item.grado && String(item.grado).toLowerCase() !== String(grado).toLowerCase() && item.grado !== "Todos") {
        continue;
      }

      // Filtro por sección
      if (seccion && item.seccion && item.seccion !== "Todas" && String(item.seccion).toLowerCase() !== String(seccion).toLowerCase()) {
        continue;
      }

      // Filtro por asignatura
      if (asignatura && item.asignatura && String(item.asignatura).toLowerCase() !== String(asignatura).toLowerCase()) {
        continue;
      }

      // Filtro por parcial
      if (parcial && item.parcial && String(item.parcial).toLowerCase() !== String(parcial).toLowerCase()) {
        continue;
      }

      // Filtro por docente si aplica
      if (docente_id && rol === "Docente" && item.docente_id && String(item.docente_id) !== String(docente_id)) {
        continue;
      }

      guias.push(item);
    }

    return { status: "success", guias: guias };
  } catch (err) {
    return { status: "error", message: "Error al consultar guías de estudio: " + err.message };
  }
}

/**
 * Activa o desactiva una guía de estudio formativa.
 */
function toggleStudyGuideStatus(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateGuiasEstudioSheet(ss);

    const { id_guia, status, requesterUserId } = payload || {};
    if (!id_guia) {
      return { status: "error", message: "ID de guía no especificado." };
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIdx = headers.indexOf("id_guia");
    const estadoIdx = headers.indexOf("estado");

    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idIdx]) === String(id_guia)) {
        const nuevoEstado = status || (String(data[i][estadoIdx]).toLowerCase() === "activo" ? "inactivo" : "activo");
        sheet.getRange(i + 1, estadoIdx + 1).setValue(nuevoEstado);
        found = true;

        recordAcademicStructuredLog({
          severidad: "INFO",
          funcion: "toggleStudyGuideStatus",
          codigoError: "GUIDE_STATUS_CHANGED",
          requesterUserId: requesterUserId,
          detalles: `Guía ${id_guia} cambió estado a ${nuevoEstado}`
        });

        return { status: "success", message: `Guía ${id_guia} marcada como ${nuevoEstado}.`, id_guia: id_guia, estado: nuevoEstado };
      }
    }

    return { status: "error", message: "Guía de estudio no encontrada." };
  } catch (err) {
    return { status: "error", message: "Error al cambiar estado de la guía: " + err.message };
  } finally {
    lock.releaseLock();
  }
}
