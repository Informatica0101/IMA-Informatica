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
            tipo: 'Examen', entregaId: entrega[0], titulo: examen ? examen[1] : "Examen Desconocido",
            alumnoNombre: usuario ? usuario[1] : "Usuario Desconocido", fecha: new Date(entrega[3]),
            calificacion: entrega[5], estado: entrega[6]
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
            estado: entrega ? entrega[6] : "Pendiente" // Si hay entrega, usa su estado, si no, "Pendiente"
        };
    });

    return { status: "success", data: examenesConEstado };
}


// --- HELPERS ---
function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
}
