// ============================================================================
// MICROSERVICIO DE EXÁMENES (VERSIÓN GAS CORRECTA)
// ============================================================================

const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DEBUG_MODE = true;

// ---------------------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------------------

function logDebug(msg, data) {
  if (!DEBUG_MODE) return;
  try {
    console.log(`[EXAM-SVC] ${msg}`, data || "");
  } catch (_) {}
}

function getSheetOrThrow(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error(`Hoja no encontrada: ${name}`);
  return sheet;
}

function textResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.TEXT);
}

function normalizeString(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// ---------------------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------------------

function doGet() {
  return textResponse({
    status: "success",
    message: "Microservicio de Exámenes operativo"
  });
}

function doOptions() {
  return textResponse({ status: "ok" });
}

function doPost(e) {
  try {
    const { action, payload } = JSON.parse(e.postData.contents);
    let result;

    switch (action) {
      case "createExam": result = createExam(payload); break;
      case "getExamQuestions": result = getExamQuestions(payload); break;
      case "submitExam": result = submitExam(payload); break;
      case "updateExamStatus": result = updateExamStatus(payload); break;
      case "getAllExams": result = getAllExams(); break;
      case "getTeacherExamActivity": result = getTeacherExamActivity(); break;
      case "getStudentExams": result = getStudentExams(payload); break;
      case "getExamResult": result = getExamResult(payload); break;
      default:
        result = { status: "error", message: `Acción no válida: ${action}` };
    }

    return textResponse(result);

  } catch (err) {
    logDebug("ERROR", err.message);
    return textResponse({ status: "error", message: err.message });
  }
}

// ---------------------------------------------------------------------------
// LÓGICA DE NEGOCIO
// ---------------------------------------------------------------------------

function createExam(p) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const examenes = getSheetOrThrow(ss, "Examenes");
  const preguntas = getSheetOrThrow(ss, "PreguntasExamen");

  const examenId = "EXM-" + Date.now();
  examenes.appendRow([
    examenId,
    p.titulo,
    p.asignatura,
    p.gradoAsignado,
    p.seccionAsignada,
    p.fechaLimite,
    p.tiempoLimite || "",
    "Inactivo"
  ]);

  (p.preguntas || []).forEach((q, i) => {
    preguntas.appendRow([
      `PRE-${examenId}-${i}`,
      examenId,
      q.preguntaTipo,
      q.textoPregunta,
      JSON.stringify(q.opciones || {}),
      q.respuestaCorrecta
    ]);
  });

  return { status: "success", examenId };
}

function updateExamStatus({ examenId, estado }) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Examenes");
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === examenId) {
      sheet.getRange(i + 1, 8).setValue(estado);
      return { status: "success" };
    }
  }
  throw new Error("Examen no encontrado");
}

function getAllExams() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = getSheetOrThrow(ss, "Examenes")
    .getDataRange().getValues().slice(1);

  return {
    status: "success",
    data: data.map(r => ({
      examenId: r[0],
      titulo: r[1],
      asignatura: r[2],
      grado: r[3],
      seccion: r[4],
      fechaLimite: r[5],
      estado: r[7]
    }))
  };
}

function getExamQuestions({ examenId }) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const preguntas = getSheetOrThrow(ss, "PreguntasExamen")
    .getDataRange().getValues().slice(1)
    .filter(p => p[1] === examenId)
    .map(p => ({
      preguntaId: p[0],
      tipo: p[2],
      texto: p[3],
      opciones: JSON.parse(p[4] || "{}")
    }));

  return { status: "success", data: preguntas };
}

function submitExam({ examenId, userId, respuestas }) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const preguntas = getSheetOrThrow(ss, "PreguntasExamen")
    .getDataRange().getValues().slice(1)
    .filter(p => p[1] === examenId);

  let correctas = 0;
  respuestas.forEach(r => {
    const q = preguntas.find(p => p[0] === r.preguntaId);
    if (!q) return;

    const ok = q[2] === "completacion"
      ? normalizeString(r.respuesta) === normalizeString(q[5])
      : r.respuesta === q[5];

    if (ok) correctas++;
  });

  const nota = preguntas.length
    ? ((correctas / preguntas.length) * 100).toFixed(2)
    : "0";

  getSheetOrThrow(ss, "EntregasExamen").appendRow([
    "EEX-" + Date.now(),
    examenId,
    userId,
    new Date(),
    JSON.stringify(respuestas),
    nota,
    "Finalizado"
  ]);

  return { status: "success", calificacion: nota };
}

function getStudentExams({ userId, grado, seccion }) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const examenes = getSheetOrThrow(ss, "Examenes").getDataRange().getValues().slice(1);
  const entregas = getSheetOrThrow(ss, "EntregasExamen").getDataRange().getValues().slice(1);

  return {
    status: "success",
    data: examenes
      .filter(e => e[3] === grado && (!e[4] || e[4] === seccion))
      .map(e => {
        const ent = entregas.find(x => x[1] === e[0] && x[2] === userId);
        return {
          examenId: e[0],
          titulo: e[1],
          fechaLimite: e[5],
          estado: ent ? ent[6] : e[7]
        };
      })
  };
}

function getExamResult({ entregaExamenId }) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const row = getSheetOrThrow(ss, "EntregasExamen")
    .getDataRange().getValues()
    .find(r => r[0] === entregaExamenId);

  if (!row) throw new Error("Resultado no encontrado");

  return {
    status: "success",
    data: {
      examenId: row[1],
      userId: row[2],
      fecha: row[3],
      respuestas: JSON.parse(row[4]),
      calificacion: row[5]
    }
  };
}

function getTeacherExamActivity() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");
  const examenesSheet = getSheetOrThrow(ss, "Examenes");
  const entregasSheet = getSheetOrThrow(ss, "EntregasExamen");

  const usuariosData = usuariosSheet.getDataRange().getValues();
  const examenesData = examenesSheet.getDataRange().getValues();
  const entregasValues = entregasSheet.getDataRange().getValues();

  const submissions = entregasValues.slice(1).map(entrega => {
    const usuario = usuariosData.find(u => u[0] === entrega[2]);
    const examen = examenesData.find(t => t[0] === entrega[1]);
    return {
      tipo: 'Examen',
      entregaId: entrega[0],
      examenId: entrega[1],
      titulo: examen ? examen[1] : "Examen Desconocido",
      alumnoNombre: usuario ? usuario[1] : "Usuario Desconocido",
      fecha: new Date(entrega[3]),
      calificacion: entrega[5],
      estado: entrega[6],
    };
  });

  submissions.sort((a, b) => b.fecha - a.fecha);
  const formattedActivity = submissions.map(item => ({ ...item, fecha: item.fecha.toLocaleString() }));
  return { status: "success", data: formattedActivity };
}
