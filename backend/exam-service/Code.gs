// NOTA: Las URLs de los microservicios solo se deben actualizar en el frontend (js/config.js), no en este archivo.
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
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
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

const PUBLIC_ACTIONS = [
  "getStudentExams", "getAllExams", "getEvaluationCategories", "getRubrics"
];

const ROLE_PERMISSIONS = {
  "Administrador": ["*"],
  "Desarrollador": ["*"],
  "Padre": ["getStudentExams", "getExamQuestions", "getExamResult", "getEvaluationCategories", "getRubrics", "getStudentRecoveries", "getStudentAcademicReport"],
  "Tutor": ["getStudentExams", "getExamQuestions", "getExamResult", "getEvaluationCategories", "getRubrics", "getStudentRecoveries", "getStudentAcademicReport"],
  "Responsable": ["getStudentExams", "getExamQuestions", "getExamResult", "getEvaluationCategories", "getRubrics", "getStudentRecoveries", "getStudentAcademicReport"],
  "Dirección": ["*"],
  "Secretaría": ["*"],
  "Profesor": [
    "createExam", "updateExam", "updateExamStatus", "deleteExam", "gradeExamSubmission", "deleteExamSubmission",
    "getAllExams", "getTeacherExamActivity", "getExamQuestions", "getStudentExams", "getExamResult",
    "getGradebookData", "saveGradebookGrades", "getEvaluationCategories", "saveEvaluationCategory",
    "getRubrics", "saveRubric", "saveStudentRecovery", "getStudentRecoveries", "closePeriodGradebook", "reopenPeriodGradebook", "getStudentAcademicReport"
  ],
  "Estudiante": [
    "getStudentExams", "getExamQuestions", "submitExam", "getExamResult", "getEvaluationCategories", "getRubrics", "getStudentRecoveries", "getStudentAcademicReport"
  ],
  "Alumno": [
    "getStudentExams", "getExamQuestions", "submitExam", "getExamResult", "getEvaluationCategories", "getRubrics", "getStudentRecoveries", "getStudentAcademicReport"
  ]
};

// [TAREA-01] [Fase 1 - Seguridad RBAC] - Validar y reforzar la seguridad de los servicios y la separación de permisos en el servidor.
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
      return textResponse({
        status: "error",
        code: "AUTH_PERMISSION_DENIED",
        message: "Acceso denegado: El rol " + authCheck.role + " no tiene permiso para la acción " + action + "."
      });
    }
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
      case "updateExam": result = updateExam(payload); break;
      case "deleteExam": result = deleteExam(payload); break;
      case "deleteExamSubmission": result = deleteExamSubmission(payload); break;
      case "getGradebookData": result = getGradebookData(payload); break;
      case "saveGradebookGrades": result = saveGradebookGrades(payload); break;
      case "getEvaluationCategories": result = getEvaluationCategories(payload); break;
      case "saveEvaluationCategory": result = saveEvaluationCategory(payload); break;
      case "getRubrics": result = getRubrics(payload); break;
      case "saveRubric": result = saveRubric(payload); break;
      case "saveStudentRecovery": result = saveStudentRecovery(payload); break;
      case "getStudentRecoveries": result = getStudentRecoveries(payload); break;
      case "closePeriodGradebook": result = closePeriodGradebook(payload); break;
      case "reopenPeriodGradebook": result = reopenPeriodGradebook(payload); break;
      case "getStudentAcademicReport": result = getStudentAcademicReport(payload); break;
      default:
        result = { status: "error", message: `Acción no válida: ${action}` };
    }

    return textResponse(result);

  } catch (err) {
    logDebug("ERROR", err.message);
    return textResponse({ status: "error", message: err.message || "Error interno del servidor." });
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
    p.profesorId || "",
    p.parcial || "Primer Parcial"
  ]);

  const preguntasData = (p.preguntas || []).map((q, i) => [
    `PRE-${examenId}-${i}`,
    examenId,
    q.preguntaTipo,
    q.textoPregunta,
    JSON.stringify(q.opciones || {}),
    q.respuestaCorrecta
  ]);

  if (preguntasData.length > 0) {
    preguntas.getRange(preguntas.getLastRow() + 1, 1, preguntasData.length, 6).setValues(preguntasData);
  }

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

function updateExam(payload) {
  const { examenId, titulo, asignatura, gradoAsignado, seccionAsignada, fechaLimite, tiempoLimite, parcial } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Examenes");
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(r => r[0] === examenId);

  if (rowIndex === -1) throw new Error("Examen no encontrado.");

  const examRow = data[rowIndex];
  if (titulo !== undefined) examRow[1] = titulo;
  if (asignatura !== undefined) examRow[2] = asignatura;
  if (gradoAsignado !== undefined) examRow[3] = gradoAsignado;
  if (seccionAsignada !== undefined) examRow[4] = seccionAsignada;
  if (fechaLimite !== undefined) examRow[5] = fechaLimite;
  if (tiempoLimite !== undefined) examRow[6] = tiempoLimite;
  if (parcial !== undefined) examRow[9] = parcial;

  sheet.getRange(rowIndex + 1, 1, 1, examRow.length).setValues([examRow]);

  return { status: "success", message: "Examen actualizado." };
}

function deleteExam(payload) {
  const { examenId } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const examenesSheet = getSheetOrThrow(ss, "Examenes");
  const entregasSheet = getSheetOrThrow(ss, "EntregasExamen");
  const preguntasSheet = getSheetOrThrow(ss, "PreguntasExamen");

  const examenesData = examenesSheet.getDataRange().getValues();
  const rowIndex = examenesData.findIndex(r => r[0] === examenId);
  if (rowIndex === -1) throw new Error("Examen no encontrado.");

  const entregasData = entregasSheet.getDataRange().getValues();
  const hasSubmissions = entregasData.some(r => r[1] === examenId);

  if (hasSubmissions) {
    examenesSheet.getRange(rowIndex + 1, 8).setValue("Inactivo");
    return { status: "success", message: "Examen desactivado (existen entregas)." };
  } else {
    // Eliminar preguntas
    const preguntasData = preguntasSheet.getDataRange().getValues();
    for (let i = preguntasData.length - 1; i >= 1; i--) {
      if (preguntasData[i][1] === examenId) {
        preguntasSheet.deleteRow(i + 1);
      }
    }
    // Eliminar examen
    examenesSheet.deleteRow(rowIndex + 1);
    return { status: "success", message: "Examen eliminado." };
  }
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
      estado: r[7],
      parcial: r[9] || "Primer Parcial"
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

    let points = 0;
    if (q[2] === "termino_pareado") {
      try {
        const studentMapping = JSON.parse(r.respuestaEstudiante || "{}");
        const correctMapping = JSON.parse(q[5] || "{}");
        let totalPairs = Object.keys(correctMapping).length;
        let correctPairs = 0;
        for (let key in correctMapping) {
          if (studentMapping[key] === correctMapping[key]) {
            correctPairs++;
          }
        }
        points = totalPairs > 0 ? (correctPairs / totalPairs) : 0;
      } catch (e) { points = 0; }
    } else {
      // Tarea 1: Normalizar comparación para Verdadero/Falso y Completación
      const ok = (q[2] === "completacion" || q[2] === "verdadero_falso")
        ? normalizeString(r.respuestaEstudiante) === normalizeString(q[5])
        : r.respuestaEstudiante === q[5];
      points = ok ? 1 : 0;
    }
    correctas += points;
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
      .filter(e => {
        const examGrado = (e[3] || "").toString().trim().toLowerCase();
        const studentGrado = (grado || "").toString().trim().toLowerCase();
        const matchGrado = examGrado === studentGrado;

        const matchSeccion = !e[4] || e[4].trim() === "" || e[4].trim().toLowerCase() === "todas" || isInTeacherList(seccion, e[4]);
        const ent = entregas.find(x => x[1] === e[0] && x[2] === userId);
        return matchGrado && matchSeccion && (e[7] === 'Activo' || ent);
      })
      .map(e => {
        const ent = entregas.find(x => x[1] === e[0] && x[2] === userId);
        const estado = ent ? ent[6] : e[7];

        return {
          examenId: e[0],
          titulo: e[1],
          asignatura: e[2],
          parcial: e[9] || "Primer Parcial", grado: e[3], seccion: e[4],
          fechaLimite: e[5] ? new Date(e[5]).toISOString() : null,
          estado: estado,
          profesorId: e[8],
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
    let score = 0;
    if (tipo === "termino_pareado") {
      try {
        const sMap = JSON.parse(respuestaEstudiante || "{}");
        const cMap = JSON.parse(respuestaCorrecta || "{}");
        let total = Object.keys(cMap).length;
        let hits = 0;
        for (let k in cMap) { if (sMap[k] === cMap[k]) hits++; }
        esCorrecta = hits === total;
        score = total > 0 ? (hits / total) : 0;
      } catch (e) {}
    } else if (tipo === "completacion" || tipo === "verdadero_falso") {
      // Tarea 1: Normalizar comparación para Verdadero/Falso y Completación en resultados
      esCorrecta = normalizeString(respuestaEstudiante) === normalizeString(respuestaCorrecta);
      score = esCorrecta ? 1 : 0;
    } else {
      esCorrecta = respuestaEstudiante === respuestaCorrecta;
      score = esCorrecta ? 1 : 0;
    }

    return {
      texto,
      tipo,
      respuestaEstudiante,
      respuestaCorrecta,
      esCorrecta,
      score: (score * 100).toFixed(0) + "%"
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
    // Uso de == para ser resiliente a tipos (string vs number)
    const examen = examenesData.find(t => t[0] == entrega[1]);

    // SI EL EXAMEN NO EXISTE O NO PERTENECE AL PROFESOR -> DESCARTAR
    if (!examen) return null;
    if (profesorId && examen[8] && examen[8] != profesorId) return null;

    const usuario = usuariosData.find(u => u[0] == entrega[2]);

    // Filtro por Grado y Sección del Profesor
    if (usuario) {
      if (grado && !isInTeacherList(usuario[2], grado)) return null;
      if (seccion && !isInTeacherList(usuario[3], seccion)) return null;
    }

    return {
      tipo: 'Examen',
      entregaId: entrega[0],
      examenId: entrega[1],
      titulo: examen[1], // Examen ya verificado arriba
      alumnoId: entrega[2], // Columna C: userId
      alumnoNombre: usuario ? usuario[1] : "Usuario Desconocido",
      email: usuario ? usuario[4] : "N/A",
      grado: usuario ? usuario[2] : "N/A",
      seccion: usuario ? usuario[3] : "N/A",
      asignatura: examen[2] || "N/A",
      parcial: examen[9] || "Primer Parcial",
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
  if (!listString || String(listString).trim() === "") return true;
  if (!value) return false;
  const sValue = normalizeString(value);
  const sList = normalizeString(listString);
  const list = sList.split(',').map(s => s.trim());
  return list.includes(sValue);
}

function gradeExamSubmission(payload) {
  const { entregaId, calificacion, estado, comentario, temaAsociado, asignaturaAsociada } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const entregasSheet = getSheetOrThrow(ss, "EntregasExamen");

  const data = entregasSheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === entregaId);

  if (rowIndex !== -1) {
    const rowData = data[rowIndex];

    // Asegurar que la fila tenga al menos 10 columnas para soportar metadatos (v7.7.5)
    // 0:entregaId, 1:examenId, 2:userId, 3:fecha, 4:respuestas, 5:nota, 6:estado, 7:comentario, 8:tema, 9:asignatura
    while(rowData.length < 10) { rowData.push(""); }

    rowData[5] = calificacion; // Columna F: Nota
    rowData[6] = estado;       // Columna G: Estado
    rowData[7] = comentario;   // Columna H: Comentario
    rowData[8] = temaAsociado || "";
    rowData[9] = asignaturaAsociada || "";

    entregasSheet.getRange(rowIndex + 1, 1, 1, rowData.length).setValues([rowData]);
    return { status: "success", message: "Examen calificado." };
  }
  throw new Error("Entrega de examen no encontrada.");
}

function deleteExamSubmission(payload) {
  const { entregaId } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const entregasSheet = getSheetOrThrow(ss, "EntregasExamen");
  const data = entregasSheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === entregaId);

  if (rowIndex === -1) throw new Error("Entrega no encontrada.");

  entregasSheet.deleteRow(rowIndex + 1);
  return { status: "success", message: "Entrega de examen eliminada correctamente." };
}

// --- FUNCIONES EVALUACIÓN ACADÉMICA Y LIBRO DE CALIFICACIONES (FASE 6) ---

function getEvaluationCategories(payload) {
  const { ambito } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CategoriasEvaluacion");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    const defaultCats = [
      ["CAT-1", "Tareas y Trabajos", "Global", 35, "100", "Activo"],
      ["CAT-2", "Exámenes y Pruebas", "Global", 40, "100", "Activo"],
      ["CAT-3", "Proyectos e Investigaciones", "Global", 15, "100", "Activo"],
      ["CAT-4", "Practicas y Participacion", "Global", 10, "100", "Activo"]
    ];
    sheet.appendRow(["ID", "Nombre", "Ambito", "PorcentajePonderacion", "EscalaID", "Estado"]);
    defaultCats.forEach(c => sheet.appendRow(c));
    return {
      status: "success",
      data: defaultCats.map(c => ({
        categoriaId: c[0], nombre: c[1], ambito: c[2], porcentajePonderacion: c[3], escalaId: c[4], estado: c[5]
      }))
    };
  }

  const categories = data.slice(1).map(r => ({
    categoriaId: r[0],
    nombre: r[1],
    ambito: r[2] || "Global",
    porcentajePonderacion: parseFloat(r[3]) || 0,
    escalaId: r[4] || "100",
    estado: r[5] || "Activo"
  }));

  return { status: "success", data: categories };
}

function saveEvaluationCategory(payload) {
  const { categoriaId, nombre, porcentajePonderacion, ambito, escalaId } = payload || {};
  if (!nombre) throw new Error("Nombre de la categoría es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CategoriasEvaluacion");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "Nombre", "Ambito", "PorcentajePonderacion", "EscalaID", "Estado"]);
  }

  const data = sheet.getDataRange().getValues();
  let cid = categoriaId;

  if (cid) {
    const idx = data.findIndex(r => String(r[0]).trim() === String(cid).trim());
    if (idx !== -1) {
      sheet.getRange(idx + 1, 2).setValue(nombre);
      sheet.getRange(idx + 1, 4).setValue(porcentajePonderacion || 0);
      return { status: "success", message: "Categoría de evaluación actualizada." };
    }
  }

  cid = "CAT-" + Date.now();
  sheet.appendRow([cid, nombre, ambito || "Global", porcentajePonderacion || 0, escalaId || "100", "Activo"]);
  return { status: "success", message: "Categoría de evaluación registrada.", data: { categoriaId: cid } };
}

function getRubrics(payload) {
  const { asignatura } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "RubricasEvaluacion");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const rubrics = data.slice(1).filter(r => {
    if (r[3] === "Eliminada") return false;
    if (asignatura && normalizeString(r[2]) !== normalizeString(asignatura)) return false;
    return true;
  }).map(r => ({
    rubricaId: r[0],
    titulo: r[1],
    asignatura: r[2],
    estado: r[3] || "Activa",
    criterios: r[4] ? (typeof r[4] === 'string' ? JSON.parse(r[4]) : r[4]) : []
  }));

  return { status: "success", data: rubrics };
}

function saveRubric(payload) {
  const { rubricaId, titulo, asignatura, criterios } = payload || {};
  if (!titulo) throw new Error("Título de la rúbrica es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "RubricasEvaluacion");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "Titulo", "Asignatura", "Estado", "CriteriosJSON"]);
  }

  const rid = rubricaId || ("RUB-" + Date.now());
  const critJSON = JSON.stringify(criterios || []);

  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(rid).trim());

  if (idx !== -1) {
    sheet.getRange(idx + 1, 2).setValue(titulo);
    sheet.getRange(idx + 1, 3).setValue(asignatura || "General");
    sheet.getRange(idx + 1, 5).setValue(critJSON);
  } else {
    sheet.appendRow([rid, titulo, asignatura || "General", "Activa", critJSON]);
  }

  return { status: "success", message: "Rúbrica guardada correctamente.", data: { rubricaId: rid } };
}

function getGradebookData(payload) {
  const { grado, seccion, asignatura, parcial, profesorId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");
  const usuariosData = usuariosSheet.getDataRange().getValues().slice(1);
  const alumnos = usuariosData.filter(u => {
    const rol = normalizeString(u[6] || u[5]);
    if (rol !== "estudiante" && rol !== "alumno") return false;
    if (grado && normalizeString(u[2]) !== normalizeString(grado)) return false;
    if (seccion && u[3] && normalizeString(u[3]) !== normalizeString(seccion)) return false;
    return true;
  }).map(u => ({
    userId: u[0],
    nombreCompleto: u[1],
    grado: u[2],
    seccion: u[3],
    email: u[4]
  }));

  const califSheet = getOrCreateSheet(ss, "CalificacionesEstudiantes");
  const califData = califSheet.getDataRange().getValues();
  const studentIds = new Set(alumnos.map(a => String(a.userId).trim()));
  const calificaciones = califData.length > 1 ? califData.slice(1).filter(r => studentIds.has(String(r[2]).trim())).map(r => ({
    calificacionId: r[0],
    evaluacionId: r[1],
    userId: r[2],
    notaObtenida: parseFloat(r[3]) || 0,
    puntajePonderado: parseFloat(r[4]) || 0,
    esBorrador: r[5] === true || String(r[5]).toLowerCase() === "true",
    esPublicada: r[6] === true || String(r[6]).toLowerCase() === "true",
    observaciones: r[7] || "",
    fechaRegistro: r[8] ? new Date(r[8]).toISOString() : null
  })) : [];

  const recSheet = getOrCreateSheet(ss, "RecuperacionesEstudiante");
  const recData = recSheet.getDataRange().getValues();
  const recuperaciones = recData.length > 1 ? recData.slice(1).filter(r => studentIds.has(String(r[2]).trim())).map(r => ({
    recuperacionId: r[0],
    evaluacionId: r[1],
    userId: r[2],
    notaOriginal: parseFloat(r[3]) || 0,
    notaRecuperada: parseFloat(r[4]) || 0,
    notaFinalCalculada: parseFloat(r[5]) || 0,
    metodoAplicado: r[6],
    autorizadoPor: r[7],
    fecha: r[8] ? new Date(r[8]).toISOString() : null
  })) : [];

  const catRes = getEvaluationCategories({});
  const categories = catRes && catRes.data ? catRes.data : [];

  const cierresSheet = getOrCreateSheet(ss, "CierresPeriodos");
  const cierresData = cierresSheet.getDataRange().getValues();
  const cierreRow = cierresData.slice(1).find(r =>
    normalizeString(r[3]) === normalizeString(grado) &&
    normalizeString(r[4]) === normalizeString(seccion) &&
    normalizeString(r[5]) === normalizeString(asignatura) &&
    normalizeString(r[2]) === normalizeString(parcial)
  );

  const estadoPeriodo = cierreRow ? cierreRow[7] : "Abierto";

  return {
    status: "success",
    data: {
      alumnos,
      calificaciones,
      recuperaciones,
      categories,
      estadoPeriodo
    }
  };
}

function saveGradebookGrades(payload) {
  const { calificaciones, esBorrador, esPublicada, profesorId, anoLectivo, esAnoHistoricoAnterior, esPadreDeEstudiante, authRole, periodoId, asignatura, grado, seccion } = payload || {};

  if (esAnoHistoricoAnterior === true) {
    throw new Error("Las calificaciones de años escolares anteriores son inalterables y no pueden modificarse por ningún rol dentro de la plataforma.");
  }

  if (esPadreDeEstudiante === true) {
    throw new Error("Un docente no puede modificar las calificaciones de su propio hijo fuera de las reglas ordinarias de cierre de periodo.");
  }

  if (periodoId) {
    const ssCheck = SpreadsheetApp.openById(SPREADSHEET_ID);
    const cierresSheet = getOrCreateSheet(ssCheck, "CierresPeriodos");
    const cierresData = cierresSheet.getDataRange().getValues();
    const isClosed = cierresData.slice(1).some(r =>
      String(r[2]).trim() === String(periodoId).trim() &&
      String(r[7]).trim() === "Cerrado" &&
      (!asignatura || String(r[5]).trim() === String(asignatura).trim())
    );
    if (isClosed && authRole !== "Secretaría" && authRole !== "Administrador" && authRole !== "Director") {
      throw new Error("El periodo de evaluación se encuentra cerrado. Para modificar notas registradas se requiere autorización explícita de Secretaría.");
    }
  }

  if (!Array.isArray(calificaciones) || calificaciones.length === 0) {
    throw new Error("Se requiere una lista de calificaciones para guardar.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CalificacionesEstudiantes");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "EvaluacionID", "UserID", "NotaObtenida", "PuntajePonderado", "EsBorrador", "EsPublicada", "Observaciones", "FechaRegistro"]);
  }

  const now = new Date();
  const data = sheet.getDataRange().getValues();

  const indexMap = {};
  for (let i = 1; i < data.length; i++) {
    const key = `${String(data[i][1]).trim()}_${String(data[i][2]).trim()}`;
    indexMap[key] = i;
  }

  let savedCount = 0;
  calificaciones.forEach(c => {
    const { evaluacionId, userId, notaObtenida, puntajePonderado, observaciones } = c;
    if (!evaluacionId || !userId) return;

    const key = `${String(evaluacionId).trim()}_${String(userId).trim()}`;
    if (key in indexMap) {
      const idx = indexMap[key];
      data[idx][3] = notaObtenida || 0;
      data[idx][4] = puntajePonderado || 0;
      data[idx][5] = esBorrador !== false;
      data[idx][6] = esPublicada === true;
      data[idx][7] = observaciones || "";
      data[idx][8] = now;
    } else {
      const cid = "CALIF-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      const newRow = [cid, evaluacionId, userId, notaObtenida || 0, puntajePonderado || 0, esBorrador !== false, esPublicada === true, observaciones || "", now];
      data.push(newRow);
      indexMap[key] = data.length - 1;
    }
    savedCount++;
  });

  if (data.length > 1) {
    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  }

  return { status: "success", message: `Se guardaron ${savedCount} calificaciones exitosamente.` };
}

function saveStudentRecovery(payload) {
  const { evaluacionId, userId, notaOriginal, notaRecuperada, metodoAplicado, autorizadoPor } = payload || {};
  if (!evaluacionId || !userId) throw new Error("evaluacionId y userId son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "RecuperacionesEstudiante");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "EvaluacionID", "UserID", "NotaOriginal", "NotaRecuperada", "NotaFinalCalculada", "MetodoAplicado", "AutorizadoPor", "Fecha"]);
  }

  const orig = parseFloat(notaOriginal) || 0;
  const rec = parseFloat(notaRecuperada) || 0;
  let finalCalc = rec;

  const metodo = metodoAplicado || "Sustitucion";
  if (metodo === "Promedio") finalCalc = (orig + rec) / 2;
  else if (metodo === "Mayor") finalCalc = Math.max(orig, rec);

  const recId = "REC-" + Date.now();
  const now = new Date();

  sheet.appendRow([recId, evaluacionId, userId, orig, rec, finalCalc, metodo, autorizadoPor || "Docente", now]);

  return { status: "success", message: "Recuperación de nota registrada exitosamente.", data: { recuperacionId: recId, notaFinalCalculada: finalCalc } };
}

function getStudentRecoveries(payload) {
  const { userId, evaluacionId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "RecuperacionesEstudiante");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };

  const recoveries = data.slice(1).filter(r => {
    if (userId && String(r[2]).trim() !== String(userId).trim()) return false;
    if (evaluacionId && String(r[1]).trim() !== String(evaluacionId).trim()) return false;
    return true;
  }).map(r => ({
    recuperacionId: r[0],
    evaluacionId: r[1],
    userId: r[2],
    notaOriginal: parseFloat(r[3]),
    notaRecuperada: parseFloat(r[4]),
    notaFinalCalculada: parseFloat(r[5]),
    metodoAplicado: r[6],
    autorizadoPor: r[7],
    fecha: r[8] ? new Date(r[8]).toISOString() : null
  }));

  return { status: "success", data: recoveries };
}

function closePeriodGradebook(payload) {
  const { anoId, periodoId, grado, seccion, asignatura, profesorId } = payload || {};
  if (!grado || !asignatura || !periodoId) throw new Error("Grado, Asignatura y Período son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CierresPeriodos");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["CierreID", "AnoID", "PeriodoID", "Grado", "Seccion", "Asignatura", "ProfesorID", "Estado", "FechaCierre"]);
  }

  const cierreId = "CIERRE-" + Date.now();
  const now = new Date();

  sheet.appendRow([cierreId, anoId || "ANO-CURRENT", periodoId, grado, seccion || "A", asignatura, profesorId || "Docente", "Cerrado", now]);

  try {
    const califSheet = getOrCreateSheet(ss, "CalificacionesEstudiantes");
    const califData = califSheet.getDataRange().getValues();
    if (califData.length > 1) {
      for (let i = 1; i < califData.length; i++) {
        califData[i][5] = false; // esBorrador = false
        califData[i][6] = true;  // esPublicada = true
      }
      califSheet.getRange(1, 1, califData.length, califData[0].length).setValues(califData);
    }
  } catch (err) {
    logDebug("Error actualizando estados de publicación al cerrar período", err.message);
  }

  return { status: "success", message: `Período ${periodoId} cerrado oficialmente para ${asignatura} (${grado} ${seccion || 'A'}).` };
}

function reopenPeriodGradebook(payload) {
  const { cierreId, motivo, autorizadoPor } = payload || {};
  if (!cierreId) throw new Error("cierreId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "CierresPeriodos");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]).trim() === String(cierreId).trim());
  if (idx === -1) throw new Error("Registro de cierre no encontrado.");

  sheet.getRange(idx + 1, 8).setValue("Reabierto");
  return { status: "success", message: "Período reabierto para rectificaciones autorizadas." };
}

function getStudentAcademicReport(payload) {
  const { userId, anoId } = payload || {};
  if (!userId) throw new Error("userId es requerido.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const matSheet = getOrCreateSheet(ss, "Matriculas");
  const matData = matSheet.getDataRange().getValues();
  const userMatriculas = matData.length > 1 ? matData.slice(1).filter(r => String(r[2]).trim() === String(userId).trim()) : [];

  const califSheet = getOrCreateSheet(ss, "CalificacionesEstudiantes");
  const califData = califSheet.getDataRange().getValues();
  const userCalificaciones = califData.length > 1 ? califData.slice(1).filter(r => {
    if (String(r[2]).trim() !== String(userId).trim()) return false;
    const esBorrador = r[5] === true || String(r[5]).toLowerCase() === "true";
    const esPublicada = r[6] === true || String(r[6]).toLowerCase() === "true";
    return esPublicada || !esBorrador;
  }).map(r => ({
    calificacionId: r[0],
    evaluacionId: r[1],
    notaObtenida: parseFloat(r[3]) || 0,
    puntajePonderado: parseFloat(r[4]) || 0,
    esPublicada: r[6] === true || String(r[6]).toLowerCase() === "true",
    observaciones: r[7] || "",
    fechaRegistro: r[8] ? new Date(r[8]).toISOString() : null
  })) : [];

  const recSheet = getOrCreateSheet(ss, "RecuperacionesEstudiante");
  const recData = recSheet.getDataRange().getValues();
  const userRecuperaciones = recData.length > 1 ? recData.slice(1).filter(r => String(r[2]).trim() === String(userId).trim()).map(r => ({
    recuperacionId: r[0],
    evaluacionId: r[1],
    notaOriginal: parseFloat(r[3]) || 0,
    notaRecuperada: parseFloat(r[4]) || 0,
    notaFinalCalculada: parseFloat(r[5]) || 0,
    metodoAplicado: r[6],
    autorizadoPor: r[7],
    fecha: r[8] ? new Date(r[8]).toISOString() : null
  })) : [];

  const catRes = getEvaluationCategories({});
  const categories = catRes && catRes.data ? catRes.data : [];

  return {
    status: "success",
    data: {
      userId: userId,
      matriculas: userMatriculas.map(r => ({ matriculaId: r[0], fecha: r[1], grado: r[4], seccion: r[5], periodo: r[6], estado: r[8] })),
      calificaciones: userCalificaciones,
      recuperaciones: userRecuperaciones,
      categories: categories
    }
  };
}
