// ============================================================================
// MICROSERVICIO ACADÉMICO (VERSIÓN MODULAR JULIO 2026)
// ============================================================================

const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DEBUG_MODE = true;

// ---------------------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------------------

function logDebug(message, optionalParam) {
  if (!DEBUG_MODE) return;
  try {
    console.log(
      `[ACADEMIC-SVC] ${new Date().toLocaleTimeString()} - ${message}`,
      optionalParam || ""
    );
  } catch (_) {}
}

function textResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.TEXT);
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

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === "ConfiguracionAcademica") {
      sheet.appendRow(["ID", "Fecha", "Parcial", "Grado", "Sección", "Asignatura", "Unidad", "Tema", "profesorId"]);
    }
    if (name === "HistorialAcademico") {
      sheet.appendRow(["ID", "Fecha", "Parcial", "Grado", "Sección", "Asignatura", "Unidad", "profesorId"]);
    }
    if (name === "Clases") {
      sheet.appendRow(["Grado", "Seccion", "WhatsAppLink"]);
    }
    if (name === "BancoPreguntas") {
      sheet.appendRow(["PreguntaID", "Asignatura", "Nivel", "Tema", "TipoActividad", "Pregunta", "OpcionA", "OpcionB", "OpcionC", "OpcionD", "RespuestaCorrecta", "Explicacion", "Imagen", "VecesRespondida", "VecesCorrecta", "PorcentajeAcierto", "UltimaActualizacion", "Activa", "DificultadCalculada"]);
    }
  }
  return sheet;
}

// ---------------------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------------------

function doGet() {
  return textResponse({
    status: "success",
    message: "Microservicio Académico operativo"
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return textResponse({ status: "error", message: "No se recibieron datos." });
    }

    const { action, payload } = JSON.parse(e.postData.contents);
    let result;

    switch (action) {
      // Configuración y Alcance
      case "getAcademicConfig": result = getAcademicConfig(payload); break;
      case "updateAcademicConfig": result = updateAcademicConfig(payload); break;
      case "getAcademicHistory": result = getAcademicHistory(payload); break;
      case "getAsignaturasActivas": result = getAsignaturasActivas(payload); break;
      case "updateAsignaturasActivas": result = updateAsignaturasActivas(payload); break;

      // Enlaces de Comunicación (Clases)
      case "saveWhatsAppLink": result = saveWhatsAppLink(payload); break;
      case "getWhatsAppLink": result = getWhatsAppLink(payload); break;

      // Banco de Preguntas y Contenido
      case "getQuestionBank": result = getQuestionBank(payload); break;
      case "saveQuestion": result = saveQuestion(payload); break;
      case "generateMigrationReport": result = generateMigrationReport(payload); break;

      default:
        result = { status: "error", message: `Acción no reconocida en Academic-Service: ${action}` };
    }
    return textResponse(result);
  } catch (err) {
    return textResponse({ status: "error", message: err.message || "Error interno académico." });
  }
}

// ---------------------------------------------------------------------------
// LÓGICA DE CONFIGURACIÓN ACADÉMICA
// ---------------------------------------------------------------------------

function getAcademicConfig(payload) {
  const { profesorId, grado, seccion } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ConfiguracionAcademica");
  const data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    return {
      status: "success",
      data: { ParcialActual: "I parcial", GradoActual: [], SeccionActual: [], AsignaturaActual: [], TemaActual: ["General"], GranularConfig: [] }
    };
  }

  const rows = data.slice(1);
  let relevantRows = [];

  if (profesorId) {
    relevantRows = rows.filter(r => String(r[8]).trim() === String(profesorId).trim());
  } else {
    relevantRows = rows.filter(r => {
      const matchGrado = !grado || normalizeString(r[3]) === normalizeString(grado);
      const matchSeccion = !seccion || normalizeString(r[4]) === normalizeString(seccion);
      return matchGrado && matchSeccion;
    });
  }

  if (relevantRows.length === 0) {
    return {
      status: "success",
      data: { ParcialActual: "I parcial", GradoActual: [], SeccionActual: [], AsignaturaActual: [], TemaActual: ["General"], GranularConfig: [] }
    };
  }

  const lastRow = relevantRows[relevantRows.length - 1];

  const config = {
    ParcialActual: lastRow[2],
    UnidadActual: lastRow[6] || lastRow[2].replace("parcial", "unidad"),
    GradoActual: [...new Set(relevantRows.map(r => r[3]))].filter(Boolean),
    SeccionActual: [...new Set(relevantRows.map(r => r[4]))].filter(Boolean),
    AsignaturaActual: [...new Set(relevantRows.map(r => r[5]))].filter(Boolean),
    TemaActual: [...new Set(relevantRows.map(r => r[7]))].filter(Boolean),
    GranularConfig: relevantRows.map(r => ({
      parcial: r[2],
      grado: r[3],
      seccion: r[4],
      asignatura: r[5],
      unidad: r[6],
      tema: r[7]
    }))
  };

  if (config.TemaActual.length === 0) config.TemaActual = ["General"];

  return { status: "success", data: config };
}

function updateAcademicConfig(payload) {
  const { fullScope } = payload || {};
  const profesorId = fullScope?.profesorId ? String(fullScope.profesorId).trim() : null;

  if (!fullScope || !profesorId) throw new Error("Datos de configuración incompletos.");

  logDebug(`Invocado updateAcademicConfig por ${profesorId}`);

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "ConfiguracionAcademica");

    const fullData = sheet.getDataRange().getValues();
    const headers = fullData[0];
    const rows = fullData.slice(1);

    const getRomanStandard = (str, type) => {
      if (!str) return "I " + type;
      const s = String(str).toLowerCase();
      if (s.indexOf("iv") !== -1 || s.indexOf("cuart") !== -1) return "IV " + type;
      if (s.indexOf("iii") !== -1 || s.indexOf("tercer") !== -1) return "III " + type;
      if (s.indexOf("ii") !== -1 || s.indexOf("segund") !== -1) return "II " + type;
      return "I " + type;
    };

    const parcialNorm = getRomanStandard(fullScope.ParcialActual, "parcial");
    const unidadNorm = getRomanStandard(fullScope.UnidadActual || fullScope.ParcialActual, "unidad");
    const currentMonth = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][new Date().getMonth()];

    const parseList = (val) => {
      const arr = Array.isArray(val) ? val : [val];
      return [...new Set(arr.map(s => String(s).trim()).filter(Boolean))];
    };
    const grades = parseList(fullScope.GradoActual);
    const sections = parseList(fullScope.SeccionActual);
    const subjects = parseList(fullScope.AsignaturaActual);
    const themes = parseList(fullScope.TemaActual);

    // Validación de Integridad Cruzada
    rows.forEach(r => {
      if (String(r[8]).trim() !== profesorId &&
          normalizeString(r[2]) === normalizeString(parcialNorm) &&
          grades.some(g => normalizeString(g) === normalizeString(r[3])) &&
          sections.some(s => normalizeString(s) === normalizeString(r[4])) &&
          subjects.some(asig => normalizeString(asig) === normalizeString(r[5]))) {
        throw new Error(`Conflicto: La asignatura '${r[5]}' ya está asignada a otro docente.`);
      }
    });

    const finalConfigMap = {};
    rows.forEach(r => {
      if (String(r[8]).trim() !== profesorId) {
        const key = `${normalizeString(r[3])}|${normalizeString(r[4])}|${normalizeString(r[5])}|${normalizeString(r[7])}|${normalizeString(r[8])}`;
        finalConfigMap[key] = r;
      }
    });

    let maxId = 0;
    rows.forEach(r => {
       const num = parseInt(String(r[0]).replace("conf-", ""));
       if (!isNaN(num) && num > maxId) maxId = num;
    });

    grades.forEach(g => {
      sections.forEach(s => {
        subjects.forEach(asig => {
          themes.forEach(t => {
            const key = `${normalizeString(g)}|${normalizeString(s)}|${normalizeString(asig)}|${normalizeString(t)}|${normalizeString(profesorId)}`;
            const oldRow = rows.find(r =>
              normalizeString(r[8]) === normalizeString(profesorId) &&
              normalizeString(r[3]) === normalizeString(g) &&
              normalizeString(r[4]) === normalizeString(s) &&
              normalizeString(r[5]) === normalizeString(asig) &&
              normalizeString(r[7]) === normalizeString(t)
            );

            if (oldRow) {
              const updated = [...oldRow];
              updated[1] = currentMonth; updated[2] = parcialNorm; updated[6] = unidadNorm;
              finalConfigMap[key] = updated;
            } else {
              maxId++;
              const newId = "conf-" + maxId.toString().padStart(4, '0');
              finalConfigMap[key] = [newId, currentMonth, parcialNorm, g, s, asig, unidadNorm, t, profesorId];
            }
          });
        });
      });
    });

    const finalRows = Object.values(finalConfigMap);
    if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).clearContent();
    if (finalRows.length > 0) sheet.getRange(2, 1, finalRows.length, headers.length).setValues(finalRows);
    SpreadsheetApp.flush();

    try { saveToAcademicHistory(fullScope); } catch (e) { logDebug("Error Historial:", e.message); }

    return { status: "success", message: "Configuración académica actualizada.", data: fullScope };
  } finally {
    lock.releaseLock();
  }
}

function saveToAcademicHistory(scope) {
  const profesorId = scope.profesorId ? String(scope.profesorId).trim() : "SISTEMA";
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "HistorialAcademico");
  const fullData = sheet.getDataRange().getValues();
  const existingRows = fullData.slice(1);

  const getRomanStandard = (str, type) => {
    if (!str) return "I " + type;
    const s = String(str).toLowerCase();
    if (s.indexOf("iv") !== -1 || s.indexOf("cuart") !== -1) return "IV " + type;
    if (s.indexOf("iii") !== -1 || s.indexOf("tercer") !== -1) return "III " + type;
    if (s.indexOf("ii") !== -1 || s.indexOf("segund") !== -1) return "II " + type;
    return "I " + type;
  };

  const parcialNorm = getRomanStandard(scope.ParcialActual || "I parcial", "parcial");
  const unidadNorm = getRomanStandard(scope.UnidadActual || scope.ParcialActual || "I parcial", "unidad");
  const currentMonth = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][new Date().getMonth()];

  const normalizeGradeLabel = (g) => {
    const gn = normalizeString(g);
    if (gn.includes("duodecimo") || gn.includes("12")) return "duodécimo";
    if (gn.includes("undecimo") || gn.includes("11")) return "undécimo";
    if (gn.includes("decimo") || gn.includes("10")) return "décimo";
    return String(g).toLowerCase();
  };

  const parseInput = (val) => {
    const arr = Array.isArray(val) ? val : [val];
    return [...new Set(arr.map(s => String(s).trim()).filter(Boolean))];
  };
  const grades = parseInput(scope.GradoActual);
  const sections = parseInput(scope.SeccionActual);
  const subjects = parseInput(scope.AsignaturaActual);

  let lastIdNum = 0;
  existingRows.forEach(r => {
    const match = String(r[0]).match(/hist-(\d+)/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > lastIdNum) lastIdNum = num;
    }
  });

  const newEntries = [];
  const existingKeys = new Set(existingRows.map(r =>
    `${normalizeString(r[2])}|${normalizeString(r[3])}|${normalizeString(r[4])}|${normalizeString(r[5])}|${normalizeString(r[7])}`
  ));

  grades.forEach(rawGrado => {
    const grado = normalizeGradeLabel(rawGrado);
    sections.forEach(rawSeccion => {
      const seccion = String(rawSeccion).trim();
      subjects.forEach(rawAsig => {
        const asig = String(rawAsig).trim();
        const key = `${normalizeString(parcialNorm)}|${normalizeString(grado)}|${normalizeString(seccion)}|${normalizeString(asig)}|${normalizeString(profesorId)}`;

        if (!existingKeys.has(key)) {
          lastIdNum++;
          const newId = "hist-" + lastIdNum.toString().padStart(4, '0');
          newEntries.push([newId, currentMonth, parcialNorm, grado, seccion, asig, unidadNorm, profesorId]);
          existingKeys.add(key);
        }
      });
    });
  });

  if (newEntries.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newEntries.length, 8).setValues(newEntries);
  }
}

function getAcademicHistory(payload) {
  const { grado, seccion } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("HistorialAcademico");
  if (!sheet) return { status: "success", data: [] };

  const data = sheet.getDataRange().getValues().slice(1);
  const filtered = data.filter(r => {
    const targetGrado = normalizeString(grado);
    const rowGrado = normalizeString(r[3]);
    const gradeMatch = !grado || rowGrado.includes(targetGrado);
    const sectionMatch = !seccion || normalizeString(r[4]) === normalizeString(seccion);
    return gradeMatch && sectionMatch;
  });

  const historyMap = {};
  filtered.forEach(r => {
    const parcial = r[2];
    if (!historyMap[parcial]) {
      historyMap[parcial] = { fecha: r[1], parcial: parcial, unidad: r[6], asignaturas: [] };
    }
    if (historyMap[parcial].asignaturas.indexOf(r[5]) === -1) historyMap[parcial].asignaturas.push(r[5]);
  });
  return { status: "success", data: Object.values(historyMap) };
}

// ---------------------------------------------------------------------------
// LÓGICA DE CLASES Y BANCO DE PREGUNTAS
// ---------------------------------------------------------------------------

function saveWhatsAppLink(payload) {
  const { grado, link } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Clases");
  const data = sheet.getDataRange().getValues();
  const sGrado = normalizeString(grado);
  let rowIndex = data.findIndex(r => normalizeString(r[0]) === sGrado);
  if (rowIndex !== -1) sheet.getRange(rowIndex + 1, 3).setValue(link);
  else sheet.appendRow([grado, "Todas", link]);
  return { status: "success", message: "Enlace guardado." };
}

function getWhatsAppLink(payload) {
  const { grado } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Clases");
  const data = sheet.getDataRange().getValues();
  const sGrado = normalizeString(grado);
  const row = data.find(r => normalizeString(r[0]) === sGrado);
  return { status: "success", link: row ? row[2] : "" };
}

function getQuestionBank(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "BancoPreguntas");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return { status: "success", data: data.map(r => { let o = {}; headers.forEach((h, i) => o[h] = r[i]); return o; }) };
}

function saveQuestion(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "BancoPreguntas");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  if (!payload.PreguntaID) payload.PreguntaID = "Q-" + Date.now();
  const row = headers.map(h => payload[h] !== undefined ? payload[h] : "");
  const idx = data.findIndex(r => r[0] === payload.PreguntaID);
  if (idx !== -1) sheet.getRange(idx + 1, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
  return { status: "success", preguntaId: payload.PreguntaID };
}

function generateMigrationReport(payload) {
  return { status: "success", message: "Reporte académico generado." };
}

function getAsignaturasActivas(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("ConfiguracionAcademica");
  if (!sheet) return { status: "success", data: [] };
  const data = sheet.getDataRange().getValues().slice(1);
  const asignaturas = [...new Set(data.filter(r => r[2] === payload.parcial).map(r => r[5]))];
  return { status: "success", data: asignaturas };
}

function updateAsignaturasActivas(payload) {
  return { status: "success" };
}
