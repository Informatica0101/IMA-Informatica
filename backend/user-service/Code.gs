// NOTA: Las URLs de los microservicios solo se deben actualizar en el frontend (js/config.js), no en este archivo.
// ============================================================================
// MICROSERVICIO DE USUARIOS (VERSIÓN INTEGRAL MAYO 2026)
// ============================================================================

const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const FRONTEND_URL = "https://informatica0101.github.io";
// URL: https://script.google.com/macros/s/AKfycbyJ8avsUWB6l11G1WCHpSJUOgRoeuB45Ys0fm6O6pWRAnAJuO7DGSU9LKuht_wZVeLh/exec
const DEBUG_MODE = true;
// SECRET_KEY se obtiene de ScriptProperties para mayor seguridad
const SECRET_KEY = PropertiesService.getScriptProperties().getProperty('SECRET_KEY') || "IMA-PORTAL-DEVELOPMENT-KEY-UNSECURE";

/**
 * CONFIGURACIÓN DE ANALÍTICA INTEGRAL (ICR v3.1)
 */
const ANALYTICS_CONFIG = {
  WEIGHTS: {
    ICR: { exactitud: 0.4, eficiencia: 0.3, dificultad: 0.2, consistencia: 0.1 },
    GP: { rapidez: 0.35, error: 0.35, dificultad: 0.15, global: 0.15 },
    MASTERY: { historico: 0.7, actual: 0.3 }
  },
  CALIBRATION: {
    THRESHOLD: 30, // REQ: Mínimo 30 respuestas para fase de calibración (Cold Start v2.0)
    SESSION_LIMIT: 3,
    GLOBAL_WEIGHT: 0.8,
    ANCHOR_SUBJECT: "Informática",
    ANCHOR_GRADE: 10,
    ANCHOR_LEVEL: "Básico"
  },
  THRESHOLDS: {
    IMPULSIVITY: {
      'verdadero_falso': 3000,
      'Selección múltiple': 4000,
      'emparejamiento': 8000,
      'ordering': 12000,
      'completacion': 15000
    }
  }
};

// ---------------------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------------------

function logDebug(message, optionalParam) {
  if (!DEBUG_MODE) return;
  try {
    console.log(
      `[USER-SVC] ${new Date().toLocaleTimeString()} - ${message}`,
      optionalParam || ""
    );
  } catch (_) {}
}

function getSheetOrThrow(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) {
    const msg = `Hoja no encontrada: ${name}`;
    logDebug(msg);
    throw new Error(msg);
  }
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

function getStandardLevelName(lvl) {
  if (!lvl) return 'Básico';
  const n = lvl.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (n === 'basico') return 'Básico';
  if (n === 'intermedio') return 'Intermedio';
  if (n === 'avanzado') return 'Avanzado';
  return lvl;
}

function parseGrade(gStr) {
  const g = normalizeString(gStr);
  if (g.includes("duodecimo") || g.includes("12") || g.includes("iiibtp")) return 12;
  if (g.includes("undecimo") || g.includes("11") || g.includes("iibtp")) return 11;
  if (g.includes("decimo") || g.includes("10") || g.includes("ibtp")) return 10;
  return 10;
}

// ---------------------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------------------

function doGet() {
  return textResponse({
    status: "success",
    message: "Microservicio de Usuarios operativo"
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return textResponse({ status: "error", message: "No se recibieron datos en la petición." });
    }

    const { action, payload } = JSON.parse(e.postData.contents);
    let result;

    switch (action) {
      case "registerUser": result = registerUser(payload); break;
      case "loginUser": result = loginUser(payload); break;
      case "getStudentsByGradoSeccion": result = getStudentsByGradoSeccion(payload); break;
      case "requestPasswordRecovery": result = requestPasswordRecovery(payload); break;
      case "resetPassword": result = resetPassword(payload); break;
      case "updateUserProfile": result = updateUserProfile(payload); break;
      case "saveGameResult": result = saveGameResult(payload); break;
      case "getGameStats": result = getGameStats(payload); break;
      case "getNews": result = getNews(payload); break;
      case "createNews": result = createNews(payload); break;
      case "uploadNewsImage": result = uploadNewsImage(payload); break;
      case "saveWhatsAppLink": result = saveWhatsAppLink(payload); break;
      case "getWhatsAppLink": result = getWhatsAppLink(payload); break;
      case "getStudents": result = getStudents(payload); break;
      case "getUserInfo": result = getUserInfo(payload); break;
      case "getGlobalTop": result = getGlobalTop(payload); break;
      case "recordAnalytics": result = recordAnalytics(payload); break;
      case "getLearningProfile": result = getLearningProfile(payload); break;
      case "getQuestionBank": result = getQuestionBank(payload); break;
      case "saveQuestion": result = saveQuestion(payload); break;
      case "getAcademicConfig": result = getAcademicConfig(payload); break;
      case "updateAcademicConfig": result = updateAcademicConfig(payload); break;
      case "getAcademicHistory": result = getAcademicHistory(payload); break;
      case "getAsignaturasActivas": result = getAsignaturasActivas(payload); break;
      case "updateAsignaturasActivas": result = updateAsignaturasActivas(payload); break;
      case "generateMigrationReport": result = generateMigrationReport(payload); break;
      case "mergeGuestData": result = mergeGuestData(payload); break;
      default:
        result = { status: "error", message: `Acción no reconocida: ${action}` };
    }
    return textResponse(result);
  } catch (err) {
    return textResponse({ status: "error", message: err.message || "Error interno." });
  }
}

// ---------------------------------------------------------------------------
// LÓGICA DEL SERVICIO
// ---------------------------------------------------------------------------

function registerUser(payload) {
  const { nombre, grado, seccion, email, password, telefono, numeroLista, forceUpdate } = payload || {};
  if (!nombre || !email || !password) throw new Error("Datos obligatorios faltantes.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();

  const lowerEmail = email.toLowerCase().trim();
  let existingIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][4]?.toString().toLowerCase().trim() === lowerEmail) {
      existingIndex = i;
      break;
    }
  }

  if (existingIndex !== -1) {
    if (forceUpdate) {
      const userId = data[existingIndex][0];
      const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
        .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');

      const newRow = [userId, nombre, grado || "", seccion || "", email, hashedPassword, "Estudiante", telefono || "", numeroLista || ""];
      sheet.getRange(existingIndex + 1, 1, 1, newRow.length).setValues([newRow]);
      return { status: "success", userId, message: "Cuenta actualizada correctamente (Promoción/Actualización)." };
    }
    return {
      status: "error",
      exists: true,
      message: "Este correo electrónico ya está registrado. ¿Deseas actualizar tus datos para el nuevo año escolar?",
      data: {
        nombre: data[existingIndex][1],
        gradoActual: data[existingIndex][2],
        seccionActual: data[existingIndex][3]
      }
    };
  }

  const userId = "USR-" + new Date().getTime();
  const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');

  sheet.appendRow([userId, nombre, grado || "", seccion || "", email, hashedPassword, "Estudiante", telefono || "", numeroLista || ""]);
  return { status: "success", userId };
}

function loginUser(payload) {
  const { identifier, password } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();

  const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  const lowerId = identifier.toLowerCase().trim();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if ((row[4]?.toString().toLowerCase().trim() === lowerId || row[1]?.toString().toLowerCase().trim() === lowerId) && row[5] === hashedPassword) {
      return {
        status: "success",
        data: { userId: row[0], nombre: row[1], grado: row[2], seccion: row[3], email: row[4], rol: row[6], telefono: row[7] || "", numeroLista: row[8] || "" }
      };
    }
  }
  return { status: "error", message: "Credenciales incorrectas." };
}

function getStudents(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues().slice(1);
  const students = data.filter(r => r[6] === 'Estudiante').map(r => ({
    userId: r[0],
    nombre: r[1],
    numeroLista: r[8] || ""
  }));
  return { status: "success", data: students };
}

function getUserInfo(payload) {
  const { userId } = payload;
  if (!userId) throw new Error("ID de usuario no proporcionado.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();

  const userRow = data.find(r => String(r[0]) === String(userId));
  if (!userRow) throw new Error("Usuario no encontrado.");

  return {
    status: "success",
    data: {
      userId: userRow[0],
      nombre: userRow[1],
      email: userRow[4],
      rol: userRow[6],
      telefono: userRow[7] || ""
    }
  };
}

function getStudentsByGradoSeccion(payload) {
  const { grado, seccion } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues().slice(1);

  const sGrado = normalizeString(grado);
  const sSeccion = normalizeString(seccion);

  const students = data.filter(r => {
    return String(r[6]).trim() === 'Estudiante' && normalizeString(r[2]) === sGrado && (!seccion || normalizeString(r[3]) === sSeccion);
  }).map(r => ({ userId: r[0], nombre: r[1], grado: r[2], seccion: r[3], email: r[4], telefono: r[7] || "", numeroLista: r[8] || "" }));

  students.sort((a, b) => (parseInt(a.numeroLista) || 999) - (parseInt(b.numeroLista) || 999));
  return { status: "success", data: students };
}

function requestPasswordRecovery(payload) {
  const { email } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();
  const lowerEmail = email.toLowerCase().trim();

  let user = null;
  for (let i = 1; i < data.length; i++) {
    if (data[i][4]?.toString().toLowerCase().trim() === lowerEmail) {
      user = { userId: data[i][0], nombre: data[i][1] };
      break;
    }
  }
  if (!user) return { status: "error", message: "Correo no encontrado." };

  const payloadData = { userId: user.userId, exp: new Date().getTime() + 3600000 };
  const payloadStr = JSON.stringify(payloadData);
  const signature = Utilities.computeHmacSha256Signature(payloadStr, SECRET_KEY)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');

  const token = Utilities.base64Encode(JSON.stringify({ p: payloadData, s: signature }));
  const url = `${FRONTEND_URL}/reset-password.html?token=${encodeURIComponent(token)}`;
  const body = `Hola ${user.nombre},\n\nRestablece tu contraseña aquí: ${url}\n\nExpira en 1 hora.`;

  try {
    MailApp.sendEmail(email, "Recuperación de Contraseña", body);
    return { status: "success", message: "Email enviado." };
  } catch (e) {
    return { status: "error", message: "Error al enviar email." };
  }
}

function resetPassword(payload) {
  const { token, newPassword } = payload || {};
  let decoded;
  try {
    decoded = JSON.parse(Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString());
  } catch (e) { throw new Error("Token inválido."); }

  const { p: payloadData, s: signature } = decoded;

  // Verificar firma
  const expectedSig = Utilities.computeHmacSha256Signature(JSON.stringify(payloadData), SECRET_KEY)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');

  if (signature !== expectedSig) throw new Error("Firma del token no válida. Acceso denegado.");
  if (new Date().getTime() > payloadData.exp) throw new Error("Token expirado.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(r => r[0] === payloadData.userId);
  if (rowIndex === -1) throw new Error("Usuario no encontrado.");

  const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, newPassword)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  sheet.getRange(rowIndex + 1, 6).setValue(hashedPassword);
  return { status: "success", message: "Contraseña actualizada." };
}

function updateUserProfile(payload) {
  const { userId, nombre, email, telefono, numeroLista, currentPassword, password } = payload || {};
  logDebug("Iniciando actualización de perfil", { userId, email });

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();

  // Búsqueda robusta por ID (convertir ambos a string)
  const rowIndex = data.findIndex(r => String(r[0]) === String(userId));
  if (rowIndex === -1) {
    logDebug("Error: Usuario no encontrado en la base de datos", { userId });
    throw new Error("Usuario no encontrado en la base de datos.");
  }

  // Clonar la fila para evitar mutaciones directas sobre el array original antes de validaciones
  const userRow = [...data[rowIndex]];

  // Gestión de Seguridad (Contraseña)
  if (password) {
    if (!currentPassword) throw new Error("Debe proporcionar la contraseña actual para establecer una nueva.");

    const currentHashed = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, currentPassword)
      .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');

    if (String(userRow[5]) !== currentHashed) {
      logDebug("Error: Contraseña actual incorrecta");
      throw new Error("La contraseña actual proporcionada es incorrecta.");
    }

    const newHashed = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
      .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
    userRow[5] = newHashed;
    logDebug("Contraseña actualizada y hasheada");
  }

  // Mapeo Estricto de Columnas A-I
  // 0:userId, 1:nombre, 2:grado, 3:seccion, 4:email, 5:password, 6:rol, 7:telefono, 8:numeroLista

  if (nombre && nombre.trim() !== "") {
    userRow[1] = nombre.trim();
  }

  if (email && email.trim() !== "") {
    const lowerEmail = email.toLowerCase().trim();
    // Validar duplicidad de correo (excluyendo al usuario actual)
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) !== String(userId) && String(data[i][4]).toLowerCase().trim() === lowerEmail) {
        throw new Error("El nuevo correo electrónico ya está registrado por otro usuario.");
      }
    }
    userRow[4] = lowerEmail;
  }

  if (telefono !== undefined) {
    userRow[7] = String(telefono).trim();
  }

  if (numeroLista !== undefined) {
    userRow[8] = String(numeroLista).trim();
  }

  // Persistencia Atómica garantizando el mapeo A-I
  try {
    // Forzar que el array tenga exactamente 9 elementos
    const rowToSave = [
      String(userRow[0]), // A: userId
      String(userRow[1]), // B: nombre
      String(userRow[2]), // C: grado
      String(userRow[3]), // D: seccion
      String(userRow[4]), // E: email
      String(userRow[5]), // F: password
      String(userRow[6]), // G: rol
      String(userRow[7]), // H: telefono
      String(userRow[8])  // I: numeroLista
    ];

    sheet.getRange(rowIndex + 1, 1, 1, 9).setValues([rowToSave]);
    logDebug("Perfil guardado exitosamente en hoja Usuarios mediante setValues atómico");
  } catch (e) {
    logDebug("Error al escribir en la hoja", e.message);
    throw new Error("Fallo al persistir los datos en el servidor: " + e.message);
  }

  return {
    status: "success",
    message: "Perfil actualizado correctamente.",
    data: {
      userId: userRow[0],
      nombre: userRow[1],
      email: userRow[4],
      telefono: userRow[7],
      numeroLista: userRow[8]
    }
  };
}

/**
 * Req 4: Persistencia Extendida de Progresión (Logs de Logros)
 * Mapeo de Columnas en 'Logros':
 * A: Fecha (fecha_logro)
 * B: usuario_id
 * C: Alumno
 * D: Juego (Fijo "QuizPro" o similar)
 * E: Asignatura (Ej: "Programación")
 * F: porcentaje_obtenido
 * G: nivel_alcanzado
 * H: grado
 * I: XP (Puntaje Ganado o XP acumulada incremental)
 */
function saveGameResult(payload) {
  const { userId, nombreAlumno, juego, asignatura, puntaje, nivel, grado, xpGanada } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Logros");
  const data = sheet.getDataRange().getValues();
  const score = parseFloat(puntaje || 0);
  const xpNeto = parseFloat(xpGanada || 0);

  const standardLevel = (lvl) => {
    if (!lvl) return 'Básico';
    const n = lvl.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (n === 'basico') return 'Básico';
    if (n === 'intermedio') return 'Intermedio';
    if (n === 'avanzado') return 'Avanzado';
    return lvl;
  };
  const normNivel = standardLevel(nivel);

  let existingIndex = -1;
  // Búsqueda para actualización de High Score independiente por Materia + Grado + Nivel
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(userId) &&
        data[i][3] === juego &&
        String(data[i][4]) === String(asignatura) &&
        standardLevel(data[i][6]) === normNivel &&
        String(data[i][7]) === String(grado)) {
      existingIndex = i;
      break;
    }
  }

  if (existingIndex !== -1) {
    const oldScore = parseFloat(data[existingIndex][5] || 0);
    const oldXP = parseFloat(data[existingIndex][8] || 0);

    // Regla de Monotonicidad Estricta: XP_Histórica + XP_Ganada
    const newXP = oldXP + xpNeto;

    // Actualizar fecha y XP siempre (siempre incremental)
    sheet.getRange(existingIndex + 1, 1).setValue(new Date()); // fecha_logro
    sheet.getRange(existingIndex + 1, 9).setValue(newXP);      // Columna I: XP Incremental

    // REQ: Unlock Score (maxScore) - Nunca disminuir, reemplazar si el nuevo es superior
    if (score > oldScore) {
      sheet.getRange(existingIndex + 1, 6).setValue(score);    // porcentaje_obtenido
      logDebug(`Unlock Score actualizado para ${userId}: ${oldScore} -> ${score}`);
    }
    logDebug(`XP actualizada para ${userId}: ${oldXP} -> ${newXP}`);
  } else {
    // Estructura: [Fecha, UserId, Alumno, Juego, Asignatura, Puntaje, Nivel, Grado, XP]
    sheet.appendRow([new Date(), userId, nombreAlumno || "Anónimo", juego, asignatura || "General", score, normNivel, grado || "", xpNeto]);
    logDebug(`Nuevo registro de logros para ${userId}: Score=${score}, XP=${xpNeto}`);
  }

  // REQ: Retornar estadísticas actualizadas para sincronización inmediata (Tarea 2)
  const updatedStats = getGameStats({ userId });

  return {
    status: "success",
    message: "Resultado guardado y sincronizado.",
    updatedStats: updatedStats.data || {}
  };
}

/**
 * Req: Top Global y Menciones por Asignatura
 * Calcula el promedio global y por asignatura para el leaderboard.
 */
function getGlobalTop(payload) {
  const { gameId } = payload || {};
  const targetGame = gameId ? normalizeString(gameId) : "quizpro";

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logSheet = getOrCreateSheet(ss, "Logros");
  const logData = logSheet.getDataRange().getValues();
  if (logData.length <= 1) return { status: "success", global: [], subjectTops: {}, message: "No hay datos en Logros" };

  const logRows = logData.slice(1);
  const userSheet = getSheetOrThrow(ss, "Usuarios");
  const userData = userSheet.getDataRange().getValues().slice(1);

  // 1. Mapa de Usuarios por ID
  const usersMap = {};
  userData.forEach(r => {
    usersMap[String(r[0])] = { nombre: r[1], grado: r[2], userId: r[0] };
  });

  // 2. Procesar Logros
  const stats = {};
  logRows.forEach(r => {
    // Normalizar juego para comparación robusta
    const game = normalizeString(r[3]);
    if (game !== targetGame) return;

    const userId = String(r[1]).trim();
    if (!userId) return;

    const alumnoNombre = String(r[2]).trim();

    // Normalizar asignatura para agrupar récords correctamente
    const rawSubj = String(r[4]);
    const asignatura = normalizeSubjectInBackend(rawSubj);

    const score = parseFloat(r[5] || 0);
    const nivel = String(r[6]).trim();
    const grado = String(r[7]).trim();

    if (!stats[userId]) {
      stats[userId] = {
        data: {},
        fallbackNombre: alumnoNombre,
        fallbackGrado: grado
      };
    }
    if (!stats[userId].data[grado]) stats[userId].data[grado] = {};
    if (!stats[userId].data[grado][asignatura]) stats[userId].data[grado][asignatura] = {};

    const currentMax = stats[userId].data[grado][asignatura][nivel] || 0;
    if (score > currentMax) stats[userId].data[grado][asignatura][nivel] = score;
  });

  // 3. Calcular Promedios Globales por Usuario
  const globalLeaderboard = [];
  const subjectTops = {}; // subjectTops[grado][asignatura] = [{nombre, promedio}]

  const parseGradeNum = (gStr) => {
    const g = normalizeString(gStr);
    if (g.includes("decimo") || g.includes("10") || g.includes("ibtp")) return 10;
    if (g.includes("undecimo") || g.includes("11") || g.includes("iibtp")) return 11;
    if (g.includes("duodecimo") || g.includes("12") || g.includes("iiibtp")) return 12;
    return 10;
  };

  for (const userId in stats) {
    const profile = usersMap[userId] || {
      nombre: stats[userId].fallbackNombre,
      grado: stats[userId].fallbackGrado
    };

    const userGrades = stats[userId].data;
    let totalSubjectSum = 0;

    for (const grd in userGrades) {
      const subjects = userGrades[grd];
      for (const asig in subjects) {
        const levels = subjects[asig];
        const scores = Object.values(levels);

        // REQ 5: Recalculación del Ranking Global (Alineación del Analytic)
        // Promedia únicamente los niveles cursados y superados (puntaje > 0)
        // Evita penalizar por niveles bloqueados. Divisor dinámico.
        const activeScores = scores.filter(s => s > 0);
        const asigAvg = activeScores.length > 0 ? (activeScores.reduce((a, b) => a + b, 0) / activeScores.length) : 0;

        totalSubjectSum += asigAvg;

        // Registrar para top por asignatura
        if (!subjectTops[grd]) subjectTops[grd] = {};
        if (!subjectTops[grd][asig]) subjectTops[grd][asig] = [];
        subjectTops[grd][asig].push({ nombre: profile.nombre, promedio: asigAvg });
      }
    }

    const userGradeNum = parseGradeNum(profile.grado);

    // REQ 5: Divisor Dinámico basado en asignaturas efectivamente cursadas
    // Evita la degradación del promedio por la malla curricular no alcanzada.
    const cursadasCount = Object.keys(userGrades).reduce((sum, grd) => sum + Object.keys(userGrades[grd]).length, 0);
    const globalAvg = cursadasCount > 0 ? (totalSubjectSum / cursadasCount) : 0;

    // REQ: Enviar XP para cálculo de rangos en el frontend (Modulo 5)
    const userXP = logRows.filter(r => String(r[1]) === userId && normalizeString(r[3]) === targetGame)
                          .reduce((s, r) => s + (parseFloat(r[8]) || 0), 0);

    globalLeaderboard.push({
      nombre: profile.nombre,
      promedio: Math.round(globalAvg),
      grado: profile.grado,
      xp: userXP
    });
  }

  // Ordenar Global y Limpiar nulos/inválidos (Tarea 3)
  const cleanLeaderboard = globalLeaderboard
    .filter(u => u && u.nombre && !isNaN(u.promedio))
    .sort((a, b) => b.promedio - a.promedio);

  // Procesar Top por Asignatura (Empates incluidos)
  const finalSubjectTops = {};
  for (const grd in subjectTops) {
    finalSubjectTops[grd] = {};
    for (const asig in subjectTops[grd]) {
      const list = subjectTops[grd][asig];
      list.sort((a, b) => b.promedio - a.promedio);
      const maxScore = list[0].promedio;
      finalSubjectTops[grd][asig] = list.filter(u => u.promedio === maxScore && maxScore > 0);
    }
  }

  return {
    status: "success",
    global: cleanLeaderboard.slice(0, 10), // Limitar a Top 10 para evitar regresión de rendimiento
    subjectTops: finalSubjectTops
  };
}

function getGameStats(payload) {
  const { grado, seccion, userId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Logros");
  const data = sheet.getDataRange().getValues().slice(1);

  if (userId) {
    const stats = {};
    const userRows = data.filter(r => String(r[1]) === String(userId));

    // Obtener Perfil de Dominio para enriquecer los stats (Tarea 2)
    const profileSheet = getOrCreateSheet(ss, "LearningProfile");
    const profileData = profileSheet.getDataRange().getValues().slice(1);
    const userProfile = profileData.filter(p => String(p[1]) === String(userId));

    // Obtener analítica detallada (v3.0)
    const analyticsSheet = getOrCreateSheet(ss, "QuizProAnalytics");
    const analyticsData = analyticsSheet.getDataRange().getValues().slice(1);
    const detailedLogs = analyticsData.filter(r => String(r[2]) === String(userId));

    userRows.forEach(r => {
      const j = r[3];
      const p = parseFloat(r[5] || 0);
      const asig = r[4];
      const lvl = r[6];
      const grd = r[7];

      if (j === "QuizPro") {
        const key = `QuizPro_${asig}_${grd}_${lvl}`;
        const relevantProfile = userProfile.filter(up =>
          normalizeString(up[2]) === normalizeString(asig) &&
          getStandardLevelName(up[4]) === getStandardLevelName(lvl)
        );

        const relevantLogs = detailedLogs.filter(l =>
          normalizeString(l[6]) === normalizeString(asig) &&
          getStandardLevelName(l[8]) === getStandardLevelName(lvl)
        );

        let dominioAcumulado = 0;
        const overallEntry = relevantProfile.find(up => up[3] === "__NIVEL_COMPLETO__");
        if (overallEntry) dominioAcumulado = Math.round(parseFloat(overallEntry[8]) || 0);

        // Promedios ponderados v3.0
        const avgICR = relevantLogs.length > 0 ? relevantLogs.reduce((s, l) => s + (parseFloat(l[17]) || 0), 0) / relevantLogs.length : 0;
        const avgIA = relevantLogs.length > 0 ? relevantLogs.reduce((s, l) => s + (parseFloat(l[18]) || 0), 0) / relevantLogs.length : 0;
        const totalXP = relevantLogs.reduce((s, l) => s + (parseFloat(l[20] || 0)), 0); // Asumimos columna 21 para XP

        if (!stats[key]) {
          stats[key] = {
            maxScore: p,
            dominio: dominioAcumulado,
            icr: Math.round(avgICR),
            ia: Math.round(avgIA),
            xpAcumulada: totalXP,
            totalAttempts: relevantLogs.length,
            date: r[0], level: lvl, grade: grd, subject: asig
          };
        } else {
          if (p > stats[key].maxScore) stats[key].maxScore = p;
          stats[key].dominio = dominioAcumulado;
          stats[key].icr = Math.round(avgICR);
          stats[key].ia = Math.round(avgIA);
          stats[key].xpAcumulada = totalXP;
          stats[key].totalAttempts = relevantLogs.length;
        }
      } else {
        if (!stats[j] || p > stats[j].maxScore) {
          stats[j] = { maxScore: p, date: r[0] };
        }
      }
    });

    return {
      status: "success",
      data: stats,
      allHistory: detailedLogs.length > 0 ? detailedLogs : userRows,
      learningProfile: userProfile
    };
  }

  // REQ 4: Inicialización sin filtros (Modulo 4)
  if (!grado && !seccion) {
      return { status: "success", data: data };
  }

  const students = getStudentsByGradoSeccion({ grado, seccion }).data.map(s => s.userId);
  return { status: "success", data: data.filter(r => students.includes(r[1])) };
}

function getNews(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "NoticiasPortal");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  const news = data.map(r => ({
    fecha: r[0],
    hora: r[1],
    titulo: r[2],
    contenido: r[3],
    imagenUrl: r[4],
    categoria: r[5] || "General"
  })).filter(n => n.titulo && n.contenido);

  // Ordenar por fecha y hora descendente
  news.sort((a, b) => {
    const dateA = new Date(a.fecha);
    const dateB = new Date(b.fecha);
    if (dateA - dateB !== 0) return dateB - dateA;
    // Si la fecha es igual, comparar hora
    return (b.hora || "").localeCompare(a.hora || "");
  });

  return { status: "success", data: news };
}

function createNews(payload) {
  const { titulo, contenido, imagenUrl, categoria } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "NoticiasPortal");

  const now = new Date();
  const fecha = now.toISOString().split('T')[0];
  const hora = now.toTimeString().split(' ')[0];

  // Si imagenUrl no es una URL completa sino solo un ID, convertirlo a URL directa
  let finalImageUrl = imagenUrl || "";
  if (finalImageUrl && !finalImageUrl.includes("http")) {
    finalImageUrl = `https://lh3.googleusercontent.com/d/${finalImageUrl}`;
  }

  sheet.appendRow([fecha, hora, titulo, contenido, finalImageUrl, categoria || "General"]);
  return { status: "success", message: "Noticia publicada." };
}

function uploadNewsImage(payload) {
  const { fileName, fileData } = payload;
  // Usar carpeta raíz o una específica para noticias
  const rootFolderId = "1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB"; // Tomado de Task-Service
  const rootFolder = DriveApp.getFolderById(rootFolderId);
  const newsFolder = getOrCreateFolderNews(rootFolder, "Noticias_Imagenes");

  const fileInfo = fileData.split(',');
  const mimeType = fileInfo[0].match(/:(.*?);/)[1];
  const base64Content = fileInfo[1];
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Content), mimeType, fileName);

  const file = newsFolder.createFile(blob);
  const fileId = file.getId();

  // Asegurar que el archivo sea público para su visualización
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    logDebug("Error al establecer permisos en imagen de noticia", e.message);
  }

  // Generar URL directa compatible con <img> (Req 2)
  const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

  return { status: "success", data: { fileId: fileId, directUrl: directUrl } };
}

function saveWhatsAppLink(payload) {
  const { grado, link } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Clases");
  const data = sheet.getDataRange().getValues();

  const sGrado = normalizeString(grado);

  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (normalizeString(data[i][0]) === sGrado) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex !== -1) {
    sheet.getRange(rowIndex + 1, 3).setValue(link);
  } else {
    sheet.appendRow([grado, "Todas", link]);
  }

  return { status: "success", message: "Enlace de WhatsApp guardado." };
}

function getWhatsAppLink(payload) {
  const { grado } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Clases");
  const data = sheet.getDataRange().getValues();

  const sGrado = normalizeString(grado);

  for (let i = 1; i < data.length; i++) {
    if (normalizeString(data[i][0]) === sGrado) {
      return { status: "success", link: data[i][2] };
    }
  }

  return { status: "success", link: "" };
}

function getOrCreateFolderNews(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(folderName);
}

function normalizeSubjectInBackend(name) {
  if (!name) return 'General';
  return name.toString().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s*\(?(?:[IVX]+)?\s*Parcial\)?/i, '')
      .replace(/\s+\(?[IVX]+\)?$/i, '')
      .replace(/\s+I{1,3}$/i, '')
      .trim();
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === "Logros") sheet.appendRow(["Fecha", "UserId", "Alumno", "Juego", "Asignatura", "Puntaje", "Nivel", "Grado", "TiempoTotal"]);
    if (name === "NoticiasPortal") sheet.appendRow(["Fecha", "Hora", "Título", "Contenido", "ImagenUrl", "Categoría"]);
    if (name === "Clases") sheet.appendRow(["Grado", "Seccion", "WhatsAppLink"]);
    if (name === "BancoPreguntas") {
      sheet.appendRow(["PreguntaID", "Asignatura", "Nivel", "Tema", "TipoActividad", "Pregunta", "OpcionA", "OpcionB", "OpcionC", "OpcionD", "RespuestaCorrecta", "Explicacion", "Imagen", "VecesRespondida", "VecesCorrecta", "PorcentajeAcierto", "UltimaActualizacion", "Activa", "DificultadCalculada"]);
    }
    if (name === "ConfiguracionAcademica") {
      sheet.appendRow(["Clave", "Valor"]);
      sheet.appendRow(["ParcialActual", "I parcial"]);
    }
    if (name === "AsignaturasPorParcial") {
      sheet.appendRow(["Parcial", "Asignatura"]);
    }
    if (name === "QuizProAnalytics") {
      sheet.appendRow(["analyticsId", "fecha", "userId", "quizId", "gameId", "gameName", "asignatura", "grado", "nivel", "preguntaId", "respuestaSeleccionada", "respuestaCorrecta", "esCorrecta", "tiempoRespuesta", "tiempoPromedioHistorico", "tiempoRelativo", "cambiosRespuesta", "indiceConfianza", "indiceAdivinacion", "indiceDominio"]);
    }
    if (name === "GameLeaderboards") {
      sheet.appendRow(["leaderboardId", "gameId", "userId", "nombreAlumno", "grado", "asignatura", "mejorPuntuacion", "indiceDominioPromedio", "partidasJugadas", "ultimaActualizacion"]);
    }
    if (name === "GameStatistics") {
      sheet.appendRow(["gameId", "partidasTotales", "usuariosActivos", "promedioPuntuacion", "promedioDominio", "promedioTiempo", "ultimaActualizacion"]);
    }
    if (name === "LearningProfile") {
      sheet.appendRow(["profileId", "userId", "asignatura", "tema", "nivel", "intentos", "aciertos", "porcentajeAciertos", "indiceDominio", "ultimaActualizacion"]);
    }
  }
  return sheet;
}

/**
 * SISTEMA UNIFICADO DE ANALÍTICA EDUCATIVA (FASE 2)
 */

function recordAnalytics(payload) {
  const {
    userId, gameId, asignatura, grado, nivel, preguntaId, 
    esCorrecta, tiempoRespuesta, cambiosRespuesta, tema
  } = payload || {};

  // Validación de integridad de datos (Requerimiento 4)
  if (!userId || !gameId || !asignatura || !preguntaId) {
    logDebug("Error: Faltan IDs obligatorios en recordAnalytics", payload);
    return { status: "error", message: "Faltan IDs obligatorios para analítica." };
  }

  const {
    quizId, gameName, respuestaSeleccionada, respuestaCorrecta, dificultadPregunta
  } = payload;

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1. Fase de Calibración y Recuperación de Historial
  const analyticsSheet = getOrCreateSheet(ss, "QuizProAnalytics");
  const analyticsData = analyticsSheet.getDataRange().getValues().slice(1);
  const userLogs = analyticsData.filter(r => String(r[2]) === String(userId));
  
  const isCalibrationMode = userLogs.length < ANALYTICS_CONFIG.CALIBRATION.THRESHOLD;
  const globalAnalytics = analyticsData.filter(r => String(r[9]) === String(preguntaId));
  
  // 2. Cálculo de Tiempo Base (TRc)
  let avgPregunta = globalAnalytics.length > 0 
    ? globalAnalytics.reduce((s, r) => s + (parseFloat(r[13]) || 0), 0) / globalAnalytics.length 
    : 5000; // Fallback 5s

  // Ancla Obligatoria para Cold Start
  let avgEstudiante_Historico = 0;
  if (userLogs.length > 0) {
    avgEstudiante_Historico = userLogs.reduce((s, r) => s + (parseFloat(r[13]) || 0), 0) / userLogs.length;
  } else if (isCalibrationMode) {
    // Buscar ancla: Informática - Décimo - Básico
    const anchorLogs = analyticsData.filter(r => 
      normalizeString(r[6]) === normalizeString(ANALYTICS_CONFIG.CALIBRATION.ANCHOR_SUBJECT) &&
      parseGrade(r[7]) === ANALYTICS_CONFIG.CALIBRATION.ANCHOR_GRADE &&
      getStandardLevelName(r[8]) === ANALYTICS_CONFIG.CALIBRATION.ANCHOR_LEVEL
    );
    if (anchorLogs.length > 0) {
      avgEstudiante_Historico = anchorLogs.reduce((s, r) => s + (parseFloat(r[13]) || 0), 0) / anchorLogs.length;
    } else {
      avgEstudiante_Historico = avgPregunta;
    }
  } else {
    avgEstudiante_Historico = avgPregunta;
  }

  // En Modo Calibración se apoya 80% en el promedio global
  const calibrationWeight = isCalibrationMode ? ANALYTICS_CONFIG.CALIBRATION.GLOBAL_WEIGHT : 0.6;
  const tiempoBase = (avgPregunta * calibrationWeight) + (avgEstudiante_Historico * (1 - calibrationWeight));
  const ratio = tiempoRespuesta / (tiempoBase || 1);

  // REQ 3.0: Intent-based XP Degradation
  const sessionCount = [...new Set(userLogs.map(l => l[3]))].length; // Usar quizId para contar sesiones
  const attemptsOnThisQuestion = userLogs.filter(l => String(l[9]) === String(preguntaId)).length + 1;
  let xpMultiplier = 1.0;
  if (attemptsOnThisQuestion === 2) xpMultiplier = 0.75;
  else if (attemptsOnThisQuestion === 3) xpMultiplier = 0.5;
  else if (attemptsOnThisQuestion >= 4) xpMultiplier = 0.25;

  // 3. Cálculo de Eficiencia e Impulsividad (v3.0)
  let puntajeRapidez = 0;
  if (ratio <= 0.5) puntajeRapidez = 100;
  else if (ratio <= 1.0) puntajeRapidez = 100 - ((ratio - 0.5) * 100);
  else puntajeRapidez = Math.max(0, 50 - ((ratio - 1.0) * 20));

  // Mitigación de Impulsividad por Tipo (v3.0)
  const minExpectedTime = ANALYTICS_CONFIG.THRESHOLDS.IMPULSIVITY[payload.tipoActividad] || 4000;
  const isImpulsive = tiempoRespuesta < minExpectedTime;

  const eficiencia = esCorrecta ? puntajeRapidez : (100 - puntajeRapidez);

  // 4. Consistencia (Basado en Cambios)
  let consistencia = 0;
  if (cambiosRespuesta === 0) consistencia = 100;
  else if (cambiosRespuesta === 1) consistencia = 60;
  else if (cambiosRespuesta === 2) consistencia = 30;
  else consistencia = 0;

  // 5. Índice de Confianza (ICR) v2.1 (RECALIBRADO PARA EXPERTOS)
  // Peso: 70% Precisión/Repetibilidad, 30% Estabilidad Tiempo
  const userAccLog = userLogs.slice(-15); // Últimas 15 para racha
  const correctCount = userLogs.filter(l => String(l[12]) === "true").length + (esCorrecta ? 1 : 0);
  const totalEvaluated = userLogs.length + 1;
  const precisionRatio = correctCount / totalEvaluated;

  // Factor de Estabilidad Tiempo (30%): Se basa en el ratio TRc pero suavizado
  const factorEstabilidadTiempo = esCorrecta ? Math.min(1.0, 1.2 - (ratio * 0.2)) : (ratio * 0.5);
  
  let ICR = (precisionRatio * 100 * 0.7) + (factorEstabilidadTiempo * 30);

  // Garantía de Rango Superior para Certeza Absoluta (100% aciertos)
  if (precisionRatio === 1.0 && esCorrecta) {
      ICR = Math.max(92, ICR);
  }

  // 6. Índice de Adivinación (IA) v2.1 (COLAPSO POR MAESTRÍA)
  // IA colapsa a 0% si hay racha perfecta independiente de la velocidad.
  const consecutiveHits = (function() {
      let count = esCorrecta ? 1 : 0;
      if (!esCorrecta) return 0;
      for (let i = userLogs.length - 1; i >= 0; i--) {
          if (String(userLogs[i][12]) === "true") count++;
          else break;
      }
      return count;
  })();

  const W_GP = ANALYTICS_CONFIG.WEIGHTS.GP;
  const aciertosGlobales = globalAnalytics.length > 0
    ? (globalAnalytics.filter(r => r[12] === true || r[12] === "true").length / globalAnalytics.length) * 100
    : 50;

  const exactitud = esCorrecta ? 100 : 0;
  const dificultad = parseFloat(dificultadPregunta || 50);

  // IA Base basada en velocidad e incertidumbre global
  let IA_Base = (puntajeRapidez * W_GP.rapidez) +
                  ((100 - exactitud) * W_GP.error) +
                  (dificultad * W_GP.dificultad) +
                  ((100 - aciertosGlobales) * W_GP.global);

  // Factor Mitigator Exponencial (v2.1)
  const muestraRacha = Math.max(15, userLogs.length + 1);
  const factorMitigator = 1.0 - (consecutiveHits / muestraRacha);

  let GP = IA_Base * factorMitigator;

  // REQ: Cold Start Calibration Phase (Modulo 7.7)
  if (isCalibrationMode) {
      logDebug(`[CALIBRATION] Usuario ${userId} en fase inicial. Métricas psicométricas suavizadas.`);
      GP = Math.min(GP, 30); // No bloquear por IA
      ICR = Math.max(ICR, 60); // No penalizar ICR
  } else if (isImpulsive && !esCorrecta) {
      GP += 20; // Penalizar adivinación fallida e impulsiva
      ICR -= 10;
  }

  // 7. Persistencia de Registro Individual v3.0
  const totalXP = esCorrecta ? Math.round(100 * xpMultiplier) : 0; // Simplificado para Code.gs, real se calcula en JS

  const analyticsId = "ANL-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  analyticsSheet.appendRow([
    analyticsId, new Date(), userId, quizId || "", gameId, gameName, asignatura, grado, nivel, preguntaId,
    respuestaSeleccionada, respuestaCorrecta, esCorrecta, tiempoRespuesta, tiempoBase, ratio,
    cambiosRespuesta, Math.round(ICR), Math.round(GP), Math.round(ICR), totalXP
  ]);

  // 8. Actualizar Perfil de Aprendizaje (70/30 Rule)
  updateLearningProfile(ss, userId, asignatura, tema, nivel, esCorrecta, ICR);

  // REQ: Actualizar Dominio Agregado del Nivel (para Desbloqueo Robusto)
  updateLearningProfile(ss, userId, asignatura, "__NIVEL_COMPLETO__", nivel, esCorrecta, ICR);

  // 9. Actualizar Leaderboard
  updateLeaderboard(ss, gameId, userId, asignatura, grado, ICR);

  return { 
    status: "success", 
    metrics: { 
      icr: Math.round(ICR), 
      gp: Math.round(GP), 
      mastery: Math.round(ICR),
      isCalibration: isCalibrationMode
    } 
  };
}

/**
 * Actualiza el Perfil de Dominio por Concepto (v3.0)
 * Implementa un promedio ponderado (70% histórico / 30% actual) para reflejar progreso real.
 * Mastery aumenta principalmente con preguntas nuevas y correcciones.
 */
function updateLearningProfile(ss, userId, asignatura, tema, nivel, esCorrecta, dominioActual) {
  // REQ: Permitir temas específicos y el agregador de nivel
  if (tema !== "__NIVEL_COMPLETO__" && (!tema || tema === 'General')) return;

  const sheet = getOrCreateSheet(ss, "LearningProfile");
  const data = sheet.getDataRange().getValues();

  // Normalización para búsqueda robusta
  const sUserId = String(userId);
  const sAsig = normalizeSubjectInBackend(asignatura);
  const sTema = tema.trim();
  const sNivel = nivel;

  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]) === sUserId &&
        normalizeSubjectInBackend(data[i][2]) === sAsig &&
        data[i][3] === sTema &&
        data[i][4] === sNivel) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex !== -1) {
    const intentos = (parseInt(data[rowIndex][5]) || 0) + 1;
    const aciertos = (parseInt(data[rowIndex][6]) || 0) + (esCorrecta ? 1 : 0);
    const porcentaje = Math.round((aciertos / intentos) * 100);

    // REQ 3.0: Mastery Evidence-Based
    // Si ya tiene 100% de aciertos en este tema, la repetición no suma dominio significativamente
    const prevPercent = parseFloat(data[rowIndex][7]) || 0;
    let actualWeight = 0.3;
    if (prevPercent >= 90 && esCorrecta) actualWeight = 0.05; // Frenar Mastery repetitivo (Modulo 4)

    const historicalWeight = intentos < 5 ? 0.5 : (1 - actualWeight);
    const effectiveActualWeight = 1 - historicalWeight;

    const dominioHistorico = parseFloat(data[rowIndex][8]) || 0;
    const nuevoDominio = Math.max(0, Math.min(100, Math.round((dominioHistorico * historicalWeight) + (dominioActual * effectiveActualWeight))));

    // Columnas: attempts(F), hits(G), percent(H), masteryIndex(I), lastUpdate(J)
    sheet.getRange(rowIndex + 1, 6, 1, 5).setValues([[intentos, aciertos, porcentaje, nuevoDominio, new Date()]]);
    logDebug(`Dominio actualizado (v3.0) para ${sTema}: ${nuevoDominio}%`);
  } else {
    const profileId = "PRF-" + Date.now() + "-" + Math.floor(Math.random() * 100);
    // REQ: Cold Start - El primer intento define el 100% del dominio inicial (Tarea 2)
    sheet.appendRow([profileId, sUserId, sAsig, sTema, sNivel, 1, esCorrecta ? 1 : 0, esCorrecta ? 100 : 0, dominioActual, new Date()]);
  }
}

function updateLeaderboard(ss, gameId, userId, asignatura, grado, dominio) {
  const sheet = getOrCreateSheet(ss, "GameLeaderboards");
  const data = sheet.getDataRange().getValues();
  const userSheet = ss.getSheetByName("Usuarios");
  const userData = userSheet.getDataRange().getValues();
  const userRow = userData.find(r => r[0] === userId);
  const nombreAlumno = userRow ? userRow[1] : "Anónimo";

  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === gameId && data[i][2] === userId && data[i][5] === asignatura) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex !== -1) {
    const partidas = parseInt(data[rowIndex][8]) + 1;
    const dominioPromedio = Math.round((parseFloat(data[rowIndex][7]) * (partidas-1) + dominio) / partidas);
    sheet.getRange(rowIndex + 1, 8, 1, 3).setValues([[dominioPromedio, partidas, new Date()]]);
  } else {
    const lbId = "LDB-" + Date.now();
    sheet.appendRow([lbId, gameId, userId, nombreAlumno, grado, asignatura, 0, dominio, 1, new Date()]);
  }
}

function getLearningProfile(payload) {
  const { userId } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "LearningProfile");
  const data = sheet.getDataRange().getValues().slice(1);

  const profile = data.filter(r => r[1] === userId).map(r => ({
    asignatura: r[2],
    tema: r[3],
    nivel: r[4],
    intentos: r[5],
    aciertos: r[6],
    porcentaje: r[7],
    dominio: r[8],
    ultimaActualizacion: r[9]
  }));

  return { status: "success", data: profile };
}

/**
 * ADMINISTRACIÓN ACADÉMICA Y BANCO DE PREGUNTAS (EVOLUCIÓN)
 */

function getQuestionBank(payload) {
  const { asignatura, nivel, activaOnly } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "BancoPreguntas");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  let questions = data.map(r => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    return obj;
  });

  if (asignatura) {
    const sAsig = normalizeString(asignatura);
    questions = questions.filter(q => normalizeString(q.Asignatura) === sAsig);
  }
  if (nivel) {
    const sNivel = normalizeString(nivel);
    questions = questions.filter(q => normalizeString(q.Nivel) === sNivel);
  }
  if (activaOnly) questions = questions.filter(q => q.Activa === true || q.Activa === "TRUE");

  return { status: "success", data: questions };
}

function saveQuestion(payload) {
  const questionObj = payload;

  // Guardián de Integridad en Backend (Fase 4)
  const required = ['Asignatura', 'Nivel', 'Pregunta', 'RespuestaCorrecta'];
  for (const field of required) {
    if (!questionObj[field] || questionObj[field].toString().trim() === "") {
       throw new Error(`Campo requerido faltante en Backend: ${field}`);
    }
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "BancoPreguntas");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  if (!questionObj.PreguntaID) questionObj.PreguntaID = "Q-" + Date.now() + "-" + Math.floor(Math.random()*1000);
  questionObj.UltimaActualizacion = new Date();

  const rowIndex = data.findIndex(r => r[0] === questionObj.PreguntaID);
  const row = headers.map(h => questionObj[h] !== undefined ? questionObj[h] : "");

  if (rowIndex !== -1) {
    sheet.getRange(rowIndex + 1, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return { status: "success", preguntaId: questionObj.PreguntaID };
}

/**
 * Recupera la configuración académica global (v7.7.5)
 * Soporta el formato Atómico de Filas (Fila 1: Cabeceras, Fila 2: Valores)
 */
function getAcademicConfig() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ConfiguracionAcademica");
  const data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    // Si la hoja está vacía, retornar valores por defecto
    return {
      status: "success",
      data: {
        ParcialActual: "I parcial",
        GradoActual: ["Décimo"],
        SeccionActual: ["A"],
        AsignaturaActual: ["Informática I"],
        TemaActual: ["General"]
      }
    };
  }

  const headers = data[0];
  const values = data[1];
  const config = {};

  headers.forEach((h, i) => {
    let val = values[i];
    if (val === "" || val === undefined) {
      config[h] = [];
      return;
    }

    // Intentar parsear como JSON si parece un array/objeto stringificado
    if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
      try {
        config[h] = JSON.parse(val);
      } catch (e) {
        config[h] = val;
      }
    } else {
      config[h] = val;
    }
  });

  return { status: "success", data: config };
}

/**
 * Actualiza la configuración académica global de forma atómica (v7.7.5)
 * Implementa el formato de almacenamiento escalable en Spreadsheet.
 */
function updateAcademicConfig(payload) {
  const { fullScope } = payload || {};
  if (!fullScope) {
    throw new Error("Payload 'fullScope' no proporcionado para la actualización académica.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ConfiguracionAcademica");

  // Limpieza y Re-escritura atómica para garantizar integridad
  sheet.clear();

  const headers = Object.keys(fullScope);
  const values = headers.map(h => {
    const val = fullScope[h];
    // Persistir arrays como strings JSON para preservar multi-selección
    return Array.isArray(val) ? JSON.stringify(val) : val;
  });

  sheet.appendRow(headers);
  sheet.appendRow(values);

  SpreadsheetApp.flush();

  logDebug("Configuración académica actualizada atómicamente", fullScope);

  // Recuperar los datos guardados para confirmar consistencia
  const confirmedData = getAcademicConfig();

  // Tarea 4: Guardar Historial Académico para persistencia de asignaturas por parcial
  try {
    saveToAcademicHistory(fullScope);
  } catch (e) {
    logDebug("Error al guardar historial académico", e);
  }

  return {
    status: "success",
    message: "Configuración global guardada en Spreadsheet.",
    data: confirmedData.data,
    updated_at: new Date().getTime()
  };
}

/**
 * Registra el estado actual de la configuración en un historial (Reorganizado v7.8.3)
 * Estructura: id | fecha | parcial | grado | seccion | asignatura | unidad
 */
function saveToAcademicHistory(scope) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "HistorialAcademico");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["id", "fecha", "parcial", "grado", "seccion", "asignatura", "unidad", "timestamp"]);
  }

  const rawParcial = scope.ParcialActual || "I parcial";

  // Normalización a Romano + minúscula (Tarea Estructural)
  const getRomanStandard = (str, type) => {
    const s = str.toLowerCase();
    let prefix = "I";
    if (s.indexOf("segundo") !== -1 || s.indexOf("ii") !== -1) prefix = "II";
    else if (s.indexOf("tercer") !== -1 || s.indexOf("iii") !== -1) prefix = "III";
    else if (s.indexOf("cuarto") !== -1 || s.indexOf("iv") !== -1) prefix = "IV";
    return prefix + " " + type;
  };

  const parcialNorm = getRomanStandard(rawParcial, "parcial");
  const unidadNorm = getRomanStandard(rawParcial, "unidad"); // Por defecto se asocia al parcial

  // Calcular rango de fecha (ej: febrero - marzo)
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const now = new Date();
  const currentMonth = now.getMonth();
  const dateRange = months[Math.max(0, currentMonth - 1)] + " - " + months[currentMonth];

  const grades = Array.isArray(scope.GradoActual) ? scope.GradoActual : [scope.GradoActual];
  const sections = Array.isArray(scope.SeccionActual) ? scope.SeccionActual : [scope.SeccionActual];
  const subjects = Array.isArray(scope.AsignaturaActual) ? scope.AsignaturaActual : [scope.AsignaturaActual];

  const timestamp = now.getTime();
  let lastIdNum = 0;

  if (sheet.getLastRow() > 1) {
    const lastId = sheet.getRange(sheet.getLastRow(), 1).getValue();
    if (typeof lastId === 'string' && lastId.startsWith("hist-")) {
      lastIdNum = parseInt(lastId.replace("hist-", ""));
    }
  }

  // Iterar y crear registros individuales para aislamiento total
  grades.forEach(grado => {
    sections.forEach(seccion => {
      subjects.forEach(asig => {
        // Verificar si ya existe este registro exacto para el parcial actual
        const existingData = sheet.getDataRange().getValues();
        const isDuplicate = existingData.some(r =>
          r[2] === parcialNorm &&
          r[3] === grado &&
          r[4] === seccion &&
          r[5] === asig
        );

        if (!isDuplicate) {
          lastIdNum++;
          const newId = "hist-" + lastIdNum.toString().padStart(4, '0');
          sheet.appendRow([newId, dateRange, parcialNorm, grado, seccion, asig, unidadNorm, timestamp]);
        }
      });
    });
  });
}

/**
 * Recupera el historial académico filtrado por grado y sección (Normalizado v7.8.3)
 */
function getAcademicHistory(payload) {
  const { grado, seccion } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("HistorialAcademico");
  if (!sheet) return { status: "success", data: [] };

  const data = sheet.getDataRange().getValues().slice(1);
  const filtered = data.filter(r => {
    const gradeMatch = !grado || normalizeString(r[3]) === normalizeString(grado);
    const sectionMatch = !seccion || normalizeString(r[4]) === normalizeString(seccion);
    return gradeMatch && sectionMatch;
  });

  // Agrupar por parcial para que el frontend reciba una lista de asignaturas coherente
  const historyMap = {};
  filtered.forEach(r => {
    const parcial = r[2];
    if (!historyMap[parcial]) {
      historyMap[parcial] = {
        fecha: r[1],
        parcial: parcial,
        asignaturas: [],
        timestamp: r[7]
      };
    }
    if (historyMap[parcial].asignaturas.indexOf(r[5]) === -1) {
      historyMap[parcial].asignaturas.push(r[5]);
    }
  });

  return { status: "success", data: Object.values(historyMap) };
}

function getAsignaturasActivas(payload) {
  const { parcial } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AsignaturasPorParcial");
  const data = sheet.getDataRange().getValues().slice(1);

  const asignaturas = data.filter(r => r[0] === parcial).map(r => r[1]);
  return { status: "success", data: asignaturas };
}

function updateAsignaturasActivas(payload) {
  const { parcial, asignaturas } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "AsignaturasPorParcial");

  // Limpiar actuales para el parcial
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === parcial) {
      sheet.deleteRow(i + 1);
    }
  }

  // Insertar nuevas
  asignaturas.forEach(asig => {
    sheet.appendRow([parcial, asig]);
  });

  return { status: "success" };
}

/**
 * REQ: Guest Data Migration & Anti-Rollback (Modulo 2)
 * Persiste el historial de invitado en la cuenta oficial del alumno.
 */
function mergeGuestData(payload) {
  const { userId, guestId, history, overwrite } = payload;
  if (!userId || !history) throw new Error("Faltan parámetros de fusión.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logSheet = getOrCreateSheet(ss, "Logros");
  const analyticsSheet = getOrCreateSheet(ss, "QuizProAnalytics");

  logDebug(`[MERGE] Iniciando transferencia para ${userId}. Sobrescribir: ${overwrite}`);

  history.forEach(item => {
    const data = item.data;

    // 1. Migrar Logros (saveGameResult logic)
    if (data.puntaje !== undefined && data.juego) {
      saveGameResult({
        userId,
        nombreAlumno: data.nombreAlumno,
        juego: data.juego,
        asignatura: data.asignatura,
        puntaje: data.puntaje,
        nivel: data.nivel,
        grado: data.grado,
        totalTime: data.totalTime
      });
    }

    // 2. Migrar Analítica (recordAnalytics logic)
    // Para simplificar, si el item tiene estructura de analítica, se guarda
    if (data.preguntaId) {
      const analyticsId = "ANL-MERGE-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      analyticsSheet.appendRow([
        analyticsId, new Date(item.updated_at || Date.now()), userId, data.quizId || "",
        data.gameId || "QuizPro", data.gameName || "QuizPro", data.asignatura,
        data.grado, data.nivel, data.preguntaId, data.respuestaSeleccionada,
        data.respuestaCorrecta, data.esCorrecta, data.tiempoRespuesta,
        0, 0, data.cambiosRespuesta, 0, 0, 0
      ]);
    }
  });

  return { status: "success", message: "Historial de invitado fusionado correctamente." };
}

function generateMigrationReport(payload) {
  const { stats } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "MigrationLogs");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Fecha", "TotalDetectadas", "TotalMigradas", "Asignaturas", "Detalle"]);
  }

  sheet.appendRow([
    new Date(),
    stats.totalDetectadas,
    stats.totalMigradas,
    JSON.stringify(stats.asignaturas),
    stats.detalle
  ]);

  return { status: "success" };
}
