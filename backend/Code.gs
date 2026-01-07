// --- PUNTO DE ENTRADA PRINCIPAL: doGet ---
/**
 * Maneja las solicitudes GET. Útil para verificar que la API está en funcionamiento.
 */
function doGet() {
  logDebug("Solicitud GET recibida. Devolviendo estado de la API.");
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "API funcionando correctamente.",
    timestamp: new Date().toISOString(),
    endpoints: ["doPost", "doOptions"],
    note: "Usa el método POST para todas las solicitudes de datos."
  }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "https://informatica0101.github.io");
}

// --- PUNTO DE ENTRADA PRINCIPAL: doOptions ---
/**
 * Maneja las solicitudes OPTIONS (pre-flight) para CORS.
 */
function doOptions() {
  logDebug("Solicitud OPTIONS (pre-flight) recibida para CORS.");
  const output = ContentService.createTextOutput();
  output.setHeaders({
    'Access-Control-Allow-Origin': 'https://informatica0101.github.io',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  });
  return output;
}

// --- PUNTO DE ENTRADA PRINCIPAL: doPost ---
/**
 * Maneja las solicitudes POST y actúa como un enrutador para los diferentes servicios.
 */
function doPost(e) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://informatica0101.github.io',
    'Content-Type': 'application/json'
  };

  try {
    logDebug("Solicitud POST recibida.");
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No se recibieron datos en la solicitud POST.');
    }

    const requestData = JSON.parse(e.postData.contents);
    logDebug("Payload recibido:", requestData);

    const { action, payload } = requestData;
    let result;

    switch (action) {
      // UserServices
      case "registerUser": result = registerUser(payload); break;
      case "loginUser": result = loginUser(payload); break;

      // TaskServices
      case "createTask": result = createTask(payload); break;
      case "getStudentTasks": result = getStudentTasks(payload); break;
      case "submitAssignment": result = submitAssignment(payload); break;
      case "gradeSubmission": result = gradeSubmission(payload); break;
      case "getTeacherActivity": result = getTeacherActivity(); break;

      // ExamServices
      case "createExam": result = createExam(payload); break;
      case "getExamQuestions": result = getExamQuestions(payload); break;
      case "submitExam": result = submitExam(payload); break;
      case "reactivateExam": result = reactivateExam(payload); break;

      default:
        logDebug("Acción no reconocida:", action);
        result = { status: "error", message: `Acción no reconocida: ${action}` };
    }

    logDebug(`Acción "${action}" completada exitosamente.`);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(corsHeaders);

  } catch (error) {
    logDebug("Error capturado en doPost:", { message: error.message, stack: error.stack });
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.message,
      stack: DEBUG_MODE ? error.stack : undefined
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(corsHeaders);
  }
}
