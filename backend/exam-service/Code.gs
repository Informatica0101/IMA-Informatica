// --- MICROSERVICIO DE EXÁMENES ---

// --- SECCIÓN DE CONFIGURACIÓN Y DEPENDENCIAS COMUNES ---
const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DEBUG_MODE = true;

function logDebug(message, optionalParam) {
  if (DEBUG_MODE) {
    let logMessage = `[EXAM-SVC] ${new Date().toLocaleTimeString()} - ${message}`;
    if (optionalParam !== undefined) {
      try { logMessage += ` | ${JSON.stringify(optionalParam, null, 2)}`; } catch (e) { logMessage += ` | [Parámetro no serializable]`; }
    }
    console.log(logMessage);
  }
}

function getSheetOrThrow(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) {
    const errorMessage = `Hoja no encontrada: "${name}".`;
    logDebug(errorMessage);
    throw new Error(errorMessage);
  }
  return sheet;
}

// --- PUNTOS DE ENTRADA (doGet, doPost, doOptions) ---
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Microservicio de Exámenes funcionando." }))
    .setMimeType(ContentService.MimeType.TEXT);
}

function doOptions() {
  return ContentService.createTextOutput().setHeaders({
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json'
  });
}

function doPost(e) {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  try {
    const { action, payload } = JSON.parse(e.postData.contents);
    let result;
    switch (action) {
      case "createExam": result = createExam(payload); break;
      case "getExamQuestions": result = getExamQuestions(payload); break;
      case "submitExam": result = submitExam(payload); break;
      case "reactivateExam": result = reactivateExam(payload); break;
      case "getTeacherExamActivity": result = getTeacherExamActivity(); break;
      case "updateExamStatus": result = updateExamStatus(payload); break;
      case "getAllExams": result = getAllExams(); break;
      case "getStudentExams": result = getStudentExams(payload); break;
      case "getExamResult": result = getExamResult(payload); break;
      // --- Acciones para Calificación del Profesor ---
      case "getExamSubmissions": result = getExamSubmissions(payload); break;
      case "getSubmissionDetails": result = getSubmissionDetails(payload); break;
      case "gradeSubmission": result = gradeSubmission(payload); break;
      default:
        result = { status: "error", message: `Acción no reconocida en Exam-Service: ${action}` };
    }
    // Para evitar errores de CORS con Google Apps Script, la respuesta debe ser texto plano.
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    logDebug("Error en doPost:", { message: error.message });
    // También en caso de error, devolver texto plano.
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.message })).setMimeType(ContentService.MimeType.TEXT);
  }
}

// --- LÓGICA DEL SERVICIO ---
function createExam(payload) {
  const { titulo, asignatura, gradoAsignado, seccionAsignada, fechaLimite, tiempoLimite, preguntas = [] } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const examenesSheet = getSheetOrThrow(ss, "Examenes");
  const preguntasSheet = getSheetOrThrow(ss, "PreguntasExamen");
  const examenId = "EXM-" + new Date().getTime();
  // Añadir una fila inicial en Examenes con estado "Inactivo"
  examenesSheet.appendRow([examenId, titulo, asignatura, gradoAsignado, seccionAsignada, fechaLimite, tiempoLimite || '', 'Inactivo']);

  preguntas.forEach((p, index) => {
    const preguntaId = `PRE-${examenId}-${index}`;
    preguntasSheet.appendRow([preguntaId, examenId, p.preguntaTipo, p.textoPregunta, JSON.stringify(p.opciones || {}), p.respuestaCorrecta]);
  });
  return { status: "success", message: "Examen creado." };
}

function updateExamStatus(payload) {
    const { examenId, estado } = payload;
    if (!examenId || !estado) {
        throw new Error("Faltan parámetros requeridos (examenId, estado).");
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const examenesSheet = getSheetOrThrow(ss, "Examenes");
    const data = examenesSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === examenId) {
            examenesSheet.getRange(i + 1, 8).setValue(estado); // Columna H (estado)
            return { status: "success", message: `Examen ${examenId} actualizado a ${estado}.` };
        }
    }
    throw new Error(`Examen con ID ${examenId} no encontrado.`);
}

function getAllExams() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const examenesSheet = getSheetOrThrow(ss, "Examenes");
    const data = examenesSheet.getDataRange().getValues().slice(1);

    const exams = data.map(row => ({
        tipo: 'Examen',
        examenId: row[0],
        titulo: row[1],
        asignatura: row[2],
        gradoAsignado: row[3],
        seccionAsignada: row[4],
        fechaLimite: new Date(row[5]),
        estado: row[7] || 'Inactivo' // Columna H es el estado
    }));

    return { status: "success", data: exams };
}

function getExamQuestions(payload) {
  const { examenId } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const examenesSheet = getSheetOrThrow(ss, "Examenes");
  const preguntasSheet = getSheetOrThrow(ss, "PreguntasExamen");
  const examen = examenesSheet.getDataRange().getValues().slice(1).find(ex => ex[0] === examenId);
  if (!examen) throw new Error("Examen no encontrado.");
  const preguntasDelExamen = preguntasSheet.getDataRange().getValues().slice(1)
    .filter(p => p[1] === examenId)
    .map(p => ({ preguntaId: p[0], preguntaTipo: p[2], textoPregunta: p[3], opciones: JSON.parse(p[4] || '{}') }));
  return { status: "success", data: { titulo: examen[1], tiempoLimite: examen[6], preguntas: preguntasDelExamen } };
}

function submitExam(payload) {
  const { examenId, userId, respuestas, estado } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const preguntasSheet = getSheetOrThrow(ss, "PreguntasExamen");
  const entregasExamenSheet = getSheetOrThrow(ss, "EntregasExamen");
  const preguntasDelExamen = preguntasSheet.getDataRange().getValues().slice(1).filter(p => p[1] === examenId);

  let correctas = 0;
  const resultadosDetallados = respuestas.map(resp => {
    const pregunta = preguntasDelExamen.find(p => p[0] === resp.preguntaId);
    if (!pregunta) return null;
    let esCorrecta = false;
    if (pregunta[2] === 'completacion') {
      esCorrecta = normalizeString(resp.respuestaEstudiante) === normalizeString(pregunta[5]);
    } else {
      esCorrecta = resp.respuestaEstudiante === pregunta[5];
    }
    if (esCorrecta) correctas++;
    return { preguntaId: resp.preguntaId, respuestaEstudiante: resp.respuestaEstudiante, esCorrecta };
  }).filter(r => r);

  const calificacionTotal = (preguntasDelExamen.length > 0) ? (correctas / preguntasDelExamen.length) * 100 : 0;
  const entregaExamenId = "EEX-" + new Date().getTime();
  entregasExamenSheet.appendRow([entregaExamenId, examenId, userId, new Date(), JSON.stringify(resultadosDetallados), calificacionTotal.toFixed(2), estado]);
  return { status: "success", data: { calificacionTotal: calificacionTotal.toFixed(2), resultados: resultadosDetallados } };
}

function reactivateExam(payload) {
    const { entregaExamenId } = payload;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const entregasExamenSheet = getSheetOrThrow(ss, "EntregasExamen");
    const data = entregasExamenSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === entregaExamenId) {
            entregasExamenSheet.getRange(i + 1, 7).setValue('Reactivado');
            return { status: "success", message: "Examen reactivado." };
        }
    }
    throw new Error("Entrega de examen no encontrada.");
}

function getTeacherExamActivity() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usuariosSheet = getSheetOrThrow(ss, "Usuarios");
    const examenesSheet = getSheetOrThrow(ss, "Examenes");
    const entregasExamenSheet = getSheetOrThrow(ss, "EntregasExamen");

    const usuariosData = usuariosSheet.getDataRange().getValues();
    const examenesData = examenesSheet.getDataRange().getValues();
    const entregasExamenData = entregasExamenSheet.getDataRange().getValues().slice(1);

    const examSubmissions = entregasExamenData.map(entrega => {
        const usuario = usuariosData.find(u => u[0] === entrega[2]);
        const examen = examenesData.find(ex => ex[0] === entrega[1]);
        return {
            tipo: 'Examen',
            entregaId: entrega[0],
            examenId: entrega[1], // Añadir examenId para el frontend
            titulo: examen ? examen[1] : "Examen Desconocido",
            alumnoNombre: usuario ? usuario[1] : "Usuario Desconocido",
            fecha: new Date(entrega[3]),
            calificacion: entrega[5],
            estado: entrega[6]
        };
    });
    return { status: "success", data: examSubmissions };
}

function getStudentExams(payload) {
    const { userId, grado, seccion } = payload;
    if (!userId || !grado || !seccion) {
        throw new Error("Faltan parámetros requeridos (userId, grado, seccion).");
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const examenesSheet = getSheetOrThrow(ss, "Examenes");
    const entregasSheet = getSheetOrThrow(ss, "EntregasExamen");

    const todosLosExamenes = examenesSheet.getDataRange().getValues().slice(1);
    const todasLasEntregas = entregasSheet.getDataRange().getValues().slice(1);

    const examenesAsignados = todosLosExamenes.filter(examen => {
        const gradoAsignado = examen[3];
        const seccionAsignada = examen[4];
        return gradoAsignado === grado && (seccionAsignada === seccion || seccionAsignada === '');
    });

    const examenesConEstado = examenesAsignados.map(examen => {
        const examenId = examen[0];
        const entrega = todasLasEntregas.find(e => e[1] === examenId && e[2] === userId);

        return {
            examenId: examenId,
            titulo: examen[1],
            asignatura: examen[2],
            fechaLimite: examen[5],
            // Si hay una entrega, se usa su estado. Si no, se usa el estado del examen base (columna H).
            estado: entrega ? entrega[6] : (examen[7] || 'Inactivo')
        };
    });

    return { status: "success", data: examenesConEstado };
}


function getExamResult(payload) {
    const { entregaExamenId } = payload;
    if (!entregaExamenId) {
        throw new Error("Falta el ID de la entrega del examen.");
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const entregasSheet = getSheetOrThrow(ss, "EntregasExamen");
    const examenesSheet = getSheetOrThrow(ss, "Examenes");

    const entregasData = entregasSheet.getDataRange().getValues();
    const examenesData = examenesSheet.getDataRange().getValues();

    const entrega = entregasData.find(row => row[0] === entregaExamenId);

    if (!entrega) {
        throw new Error("No se encontraron los resultados para la entrega especificada.");
    }

    const examenId = entrega[1];
    const examen = examenesData.find(row => row[0] === examenId);
    const examenTitulo = examen ? examen[1] : "Título no encontrado";

    const resultadosDetallados = JSON.parse(entrega[4] || '[]');

    return {
        status: "success",
        data: {
            entregaExamenId: entrega[0],
            examenId: examenId,
            examenTitulo: examenTitulo,
            userId: entrega[2],
            fecha: entrega[3],
            resultadosDetallados: resultadosDetallados,
            calificacionTotal: entrega[5]
        }
    };
}

// --- NUEVAS FUNCIONES PARA CALIFICACIÓN ---

function getExamSubmissions(payload) {
  const { examenId } = payload;
  if (!examenId) throw new Error("Falta el ID del examen.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const entregasSheet = getSheetOrThrow(ss, "EntregasExamen");
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");

  const entregasData = entregasSheet.getDataRange().getValues().slice(1);
  const usuariosData = usuariosSheet.getDataRange().getValues().slice(1);
  const usuariosMap = new Map(usuariosData.map(u => [u[0], u[1]])); // Map de email a nombre

  const submissions = entregasData
    .filter(row => row[1] === examenId)
    .map(row => ({
      entregaExamenId: row[0],
      userId: row[2],
      studentName: usuariosMap.get(row[2]) || 'Nombre no encontrado',
      submissionDate: new Date(row[3]).toLocaleString(),
      grade: row[5],
      status: row[6]
    }));

  return { status: 'success', data: submissions };
}

function getSubmissionDetails(payload) {
  const { entregaExamenId } = payload;
  if (!entregaExamenId) throw new Error("Falta el ID de la entrega.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const entregasSheet = getSheetOrThrow(ss, "EntregasExamen");
  const preguntasSheet = getSheetOrThrow(ss, "PreguntasExamen");
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");

  const entregaRow = entregasSheet.getDataRange().getValues().find(r => r[0] === entregaExamenId);
  if (!entregaRow) throw new Error("Entrega no encontrada.");

  const examenId = entregaRow[1];
  const userId = entregaRow[2];
  const studentAnswers = JSON.parse(entregaRow[4] || '[]');

  const allQuestions = preguntasSheet.getDataRange().getValues().slice(1);
  const examQuestions = allQuestions.filter(q => q[1] === examenId);

  const studentData = usuariosSheet.getDataRange().getValues().find(u => u[0] === userId);
  const studentName = studentData ? studentData[1] : "Desconocido";

  const details = examQuestions.map(q => {
    const preguntaId = q[0];
    const studentAns = studentAnswers.find(a => a.preguntaId === preguntaId);
    return {
      preguntaId: preguntaId,
      textoPregunta: q[3],
      preguntaTipo: q[2],
      respuestaCorrecta: q[5],
      respuestaEstudiante: studentAns ? studentAns.respuestaEstudiante : 'No respondida',
      esCorrecta: studentAns ? studentAns.esCorrecta : false
    };
  });

  return {
    status: 'success',
    data: {
      details,
      studentName,
      currentGrade: entregaRow[5],
      currentStatus: entregaRow[6],
      currentComment: entregaRow[7] || '' // Suponiendo que la columna H es para comentarios
    }
  };
}

function gradeSubmission(payload) {
  const { entregaExamenId, calificacion, estado, comentario } = payload;
  if (!entregaExamenId) throw new Error("Falta el ID de la entrega.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "EntregasExamen");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // Evitar "números mágicos" buscando el índice de cada columna
  const idColIdx = headers.indexOf('entregaExamenId');
  const gradeColIdx = headers.indexOf('calificacion');
  const statusColIdx = headers.indexOf('estado');
  const commentColIdx = headers.indexOf('comentario');

  if ([idColIdx, gradeColIdx, statusColIdx].some(idx => idx === -1)) {
    throw new Error("Una o más columnas requeridas no se encontraron en la hoja 'EntregasExamen'.");
  }

  const rowIndex = data.findIndex(row => row[idColIdx] === entregaExamenId);

  if (rowIndex === -1) {
    throw new Error("No se encontró la fila de la entrega.");
  }

  // Actualizar las celdas correspondientes. Se suma 1 porque los índices de rango son base 1.
  sheet.getRange(rowIndex + 1, gradeColIdx + 1).setValue(calificacion);
  sheet.getRange(rowIndex + 1, statusColIdx + 1).setValue(estado);
  if (commentColIdx !== -1) { // La columna de comentario es opcional
    sheet.getRange(rowIndex + 1, commentColIdx + 1).setValue(comentario);
  }

  return { status: 'success', message: 'Calificación guardada exitosamente.' };
}


// --- HELPERS ---
function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
}
