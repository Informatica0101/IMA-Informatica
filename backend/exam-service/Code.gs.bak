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
      case "getAllExams": result = getAllExams(payload); break;
      case "getTeacherExamActivity": result = getTeacherExamActivity(payload); break;
      case "gradeExamSubmission": result = gradeExamSubmission(payload); break;
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
    "Inactivo",
    p.profesorId || ""
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

function getAllExams(payload) {
  const { profesorId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = getSheetOrThrow(ss, "Examenes")
    .getDataRange().getValues().slice(1);

  const filtered = data.filter(r => {
    if (profesorId && r[8] && r[8] !== profesorId) return false;
    return true;
  });

  return {
    status: "success",
    data: filtered.map(r => ({
      examenId: r[0],
      titulo: r[1],
      asignatura: r[2],
      grado: r[3],
      seccion: r[4],
      fechaLimite: r[5] ? new Date(r[5]).toISOString() : null,
      estado: r[7]
    }))
  };
}

function getExamQuestions({ examenId }) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1. Obtener los detalles del examen
  const examenesSheet = getSheetOrThrow(ss, "Examenes");
  const examenData = examenesSheet.getDataRange().getValues();
  const examenRow = examenData.find(row => row[0] === examenId);

  if (!examenRow) {
    throw new Error("Examen no encontrado.");
  }

  const examDetails = {
    titulo: examenRow[1],
    tiempoLimite: examenRow[6]
  };

  // 2. Obtener las preguntas del examen
  const preguntasSheet = getSheetOrThrow(ss, "PreguntasExamen");
  const preguntasData = preguntasSheet.getDataRange().getValues();
  const preguntas = preguntasData.slice(1)
    .filter(p => p[1] === examenId)
    .map(p => ({
      preguntaId: p[0],
      tipo: p[2],
      texto: p[3],
      opciones: JSON.parse(p[4] || "{}")
      // No se incluye la respuesta correcta para la vista del estudiante
    }));

  // 3. Combinar y devolver la estructura de datos correcta
  return {
    status: "success",
    data: {
      ...examDetails,
      preguntas: preguntas
    }
  };
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

    // Se usa r.respuestaEstudiante que es lo que envía el frontend
    const ok = q[2] === "completacion"
      ? normalizeString(r.respuestaEstudiante) === normalizeString(q[5])
      : r.respuestaEstudiante === q[5];

    if (ok) correctas++;
  });

  const nota = preguntas.length
    ? ((correctas / preguntas.length) * 100).toFixed(2)
    : "0";

  const entregaExamenId = "EEX-" + Date.now();
  getSheetOrThrow(ss, "EntregasExamen").appendRow([
    entregaExamenId,
    examenId,
    userId,
    new Date(),
    JSON.stringify(respuestas),
    nota,
    "Pendiente"
  ]);

  // Se devuelve el ID en un objeto data para que el frontend pueda redirigir
  return {
    status: "success",
    data: {
      entregaExamenId: entregaExamenId,
      calificacion: nota
    }
  };
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
        const estado = ent ? ent[6] : e[7];

        return {
          examenId: e[0],
          titulo: e[1],
          fechaLimite: e[5] ? new Date(e[5]).toISOString() : null,
          estado: estado,
          entrega: ent ? {
            estado: estado,
            calificacion: estado === 'Pendiente' ? null : ent[5],
            comentario: ent[7] || ""
          } : null
        };
      })
  };
}

function getExamResult({ entregaExamenId }) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const entregasSheet = getSheetOrThrow(ss, "EntregasExamen");
  const entregasData = entregasSheet.getDataRange().getValues();
  const entregaRow = entregasData.find(r => r[0] === entregaExamenId);

  if (!entregaRow) throw new Error("Resultado no encontrado");

  const examenId = entregaRow[1];
  const respuestasEstudiante = JSON.parse(entregaRow[4] || "[]");

  // Obtener detalles del examen
  const examenesSheet = getSheetOrThrow(ss, "Examenes");
  const examenRow = examenesSheet.getDataRange().getValues().find(r => r[0] === examenId);
  const examenTitulo = examenRow ? examenRow[1] : "Examen Desconocido";

  // Obtener preguntas para comparar
  const preguntasSheet = getSheetOrThrow(ss, "PreguntasExamen");
  const preguntasData = preguntasSheet.getDataRange().getValues().slice(1).filter(p => p[1] === examenId);

  const resultadosDetallados = preguntasData.map(p => {
    const preguntaId = p[0];
    const tipo = p[2];
    const texto = p[3];
    const respuestaCorrecta = p[5];

    const entrega = respuestasEstudiante.find(r => r.preguntaId === preguntaId);
    const respuestaEstudiante = entrega ? entrega.respuestaEstudiante : "";

    let esCorrecta = false;
    if (tipo === "completacion") {
      esCorrecta = normalizeString(respuestaEstudiante) === normalizeString(respuestaCorrecta);
    } else {
      esCorrecta = respuestaEstudiante === respuestaCorrecta;
    }

    return {
      texto,
      respuestaEstudiante,
      esCorrecta
    };
  });

  return {
    status: "success",
    data: {
      examenTitulo: examenTitulo,
      calificacionTotal: entregaRow[5],
      resultadosDetallados: resultadosDetallados
    }
  };
}

function getTeacherExamActivity(payload) {
  const { profesorId, grado, seccion } = payload || {};
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

    // Filtro por Profesor (Columna I es índice 8)
    if (profesorId && examen && examen[8] && examen[8] !== profesorId) return null;

    // Filtro por Grado y Sección del Profesor
    if (usuario) {
      if (grado && !isInTeacherList(usuario[2], grado)) return null;
      if (seccion && !isInTeacherList(usuario[3], seccion)) return null;
    }

    return {
      tipo: 'Examen',
      entregaId: entrega[0],
      examenId: entrega[1],
      titulo: examen ? examen[1] : "Examen Desconocido",
      alumnoNombre: usuario ? usuario[1] : "Usuario Desconocido",
      grado: usuario ? usuario[2] : "N/A",
      seccion: usuario ? usuario[3] : "N/A",
      asignatura: examen ? examen[2] : "N/A",
      fecha: new Date(entrega[3]),
      calificacion: entrega[5],
      estado: entrega[6],
      comentario: entrega[7] || ""
    };
  }).filter(item => item !== null);

  submissions.sort((a, b) => b.fecha - a.fecha);
  const formattedActivity = submissions.map(item => ({ ...item, fecha: item.fecha.toISOString() }));
  return { status: "success", data: formattedActivity };
}

function isInTeacherList(value, listString) {
  if (!listString) return true;
  if (!value) return false;
  const list = listString.split(',').map(s => s.trim().toLowerCase());
  return list.includes(value.toLowerCase());
}

function gradeExamSubmission(payload) {
  const { entregaId, calificacion, estado, comentario } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const entregasSheet = getSheetOrThrow(ss, "EntregasExamen");

  const data = entregasSheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === entregaId);

  if (rowIndex !== -1) {
    entregasSheet.getRange(rowIndex + 1, 6).setValue(calificacion); // Columna F: Nota
    entregasSheet.getRange(rowIndex + 1, 7).setValue(estado);       // Columna G: Estado
    if (data[0].length < 8) {
      entregasSheet.getRange(1, 8).setValue("Comentario");
    }
    entregasSheet.getRange(rowIndex + 1, 8).setValue(comentario);   // Columna H: Comentario
    return { status: "success", message: "Examen calificado." };
  }
  throw new Error("Entrega de examen no encontrada.");
}
