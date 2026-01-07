// --- SERVICIOS DE EXÁMENES ---

/**
 * Crea un nuevo examen y sus preguntas asociadas.
 * @param {object} payload - Los detalles del examen y la lista de preguntas.
 * @returns {object} Un objeto con el estado de la operación.
 */
function createExam(payload) {
  logDebug("Iniciando creación de examen", payload);
  const { titulo, asignatura, gradoAsignado, seccionAsignada, fechaLimite, tiempoLimite, preguntas } = payload;

  const examenId = "EXM-" + new Date().getTime();
  examenesSheet.appendRow([examenId, titulo, asignatura, gradoAsignado, seccionAsignada, fechaLimite, tiempoLimite || '']);
  logDebug(`Examen "${titulo}" creado con ID: ${examenId}`);

  preguntas.forEach((p, index) => {
    const preguntaId = `PRE-${examenId}-${index}`;
    preguntasSheet.appendRow([
      preguntaId,
      examenId,
      p.preguntaTipo,
      p.textoPregunta,
      JSON.stringify(p.opciones || {}),
      p.respuestaCorrecta
    ]);
  });
  logDebug(`Se añadieron ${preguntas.length} preguntas al examen ${examenId}.`);

  return { status: "success", message: "Examen creado exitosamente." };
}

/**
 * Obtiene las preguntas de un examen específico.
 * @param {object} payload - Contiene el ID del examen.
 * @returns {object} Un objeto con el estado y los datos del examen.
 */
function getExamQuestions(payload) {
  logDebug("Obteniendo preguntas del examen", payload);
  const { examenId } = payload;

  const examenesData = examenesSheet.getDataRange().getValues().slice(1);
  const examen = examenesData.find(ex => ex[0] === examenId);
  if (!examen) throw new Error("Examen no encontrado.");

  const todasLasPreguntas = preguntasSheet.getDataRange().getValues().slice(1);
  const preguntasDelExamen = todasLasPreguntas
    .filter(p => p[1] === examenId)
    .map(p => ({
      preguntaId: p[0],
      preguntaTipo: p[2],
      textoPregunta: p[3],
      opciones: JSON.parse(p[4] || '{}')
    }));

  logDebug(`Se encontraron ${preguntasDelExamen.length} preguntas para el examen ${examenId}.`);
  return {
    status: "success",
    data: {
      titulo: examen[1],
      tiempoLimite: examen[6],
      preguntas: preguntasDelExamen
    }
  };
}

/**
 * Procesa la entrega de un examen de un estudiante.
 * @param {object} payload - Contiene las respuestas del estudiante.
 * @returns {object} Un objeto con el estado y los resultados del examen.
 */
function submitExam(payload) {
  logDebug("Iniciando entrega de examen", { userId: payload.userId, examenId: payload.examenId });
  const { examenId, userId, respuestas, estado } = payload;

  const todasLasPreguntas = preguntasSheet.getDataRange().getValues().slice(1);
  const preguntasDelExamen = todasLasPreguntas.filter(p => p[1] === examenId);

  let correctas = 0;
  const resultadosDetallados = [];

  respuestas.forEach(resp => {
    const pregunta = preguntasDelExamen.find(p => p[0] === resp.preguntaId);
    if (!pregunta) return;

    const respuestaCorrecta = pregunta[5];
    const tipo = pregunta[2];
    let esCorrecta = false;

    if (tipo === 'completacion') {
      esCorrecta = normalizeString(resp.respuestaEstudiante) === normalizeString(respuestaCorrecta);
    } else if (tipo === 'verdadero_falso' || tipo === 'opcion_multiple') {
      esCorrecta = resp.respuestaEstudiante === respuestaCorrecta;
    }

    if (esCorrecta) correctas++;
    resultadosDetallados.push({
      preguntaId: resp.preguntaId,
      respuestaEstudiante: resp.respuestaEstudiante,
      esCorrecta: esCorrecta
    });
  });

  const calificacionTotal = (preguntasDelExamen.length > 0) ? (correctas / preguntasDelExamen.length) * 100 : 0;
  const entregaExamenId = "EEX-" + new Date().getTime();

  entregasExamenSheet.appendRow([
    entregaExamenId,
    examenId,
    userId,
    new Date(),
    JSON.stringify(resultadosDetallados),
    calificacionTotal.toFixed(2),
    estado
  ]);

  logDebug(`Examen ${examenId} entregado por ${userId} con calificación ${calificacionTotal.toFixed(2)}.`);
  return {
    status: "success",
    message: "Examen entregado.",
    data: {
      calificacionTotal: calificacionTotal.toFixed(2),
      resultados: resultadosDetallados
    }
  };
}

/**
 * Reactiva un examen que fue bloqueado para un estudiante.
 * @param {object} payload - Contiene el ID de la entrega del examen.
 * @returns {object} Un objeto con el estado de la operación.
 */
function reactivateExam(payload) {
  logDebug("Reactivando examen", payload);
  const { entregaExamenId } = payload;
  const entregasExamenData = entregasExamenSheet.getDataRange().getValues();

  for (let i = 1; i < entregasExamenData.length; i++) {
    if (entregasExamenData[i][0] === entregaExamenId) {
      entregasExamenSheet.getRange(i + 1, 7).setValue('Reactivado');
      logDebug(`Examen ${entregaExamenId} reactivado.`);
      return { status: "success", message: "Examen reactivado." };
    }
  }

  throw new Error("Entrega de examen no encontrada.");
}

/**
 * Normaliza un string para comparación (minúsculas, sin acentos, sin caracteres especiales).
 * @param {string} str - El string a normalizar.
 * @returns {string} El string normalizado.
 */
function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '');
}
