// ============================================================================
// MICROSERVICIO DE USUARIOS (VERSIÓN INTEGRAL MAYO 2026)
// ============================================================================

const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const FRONTEND_URL = "https://informatica0101.github.io";
// URL: https://script.google.com/macros/s/AKfycbzChAgiijmvKABxJuNSi5M8nKUdoB_UJni5bbBQsAJiQygZPrqPWaR2KIo89UjyoBTn/exec
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
    THRESHOLD: 15,
    GLOBAL_WEIGHT: 0.8,
    ANCHOR_SUBJECT: "Informática",
    ANCHOR_GRADE: 10,
    ANCHOR_LEVEL: "Básico"
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
      case "getAsignaturasActivas": result = getAsignaturasActivas(payload); break;
      case "updateAsignaturasActivas": result = updateAsignaturasActivas(payload); break;
      case "generateMigrationReport": result = generateMigrationReport(payload); break;
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
 */
function saveGameResult(payload) {
  const { userId, nombreAlumno, juego, asignatura, puntaje, nivel, grado, totalTime } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Logros");
  const data = sheet.getDataRange().getValues();
  const score = parseFloat(puntaje || 0);

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
    if (score > oldScore) {
      sheet.getRange(existingIndex + 1, 1).setValue(new Date()); // fecha_logro
      sheet.getRange(existingIndex + 1, 6).setValue(score);    // porcentaje_obtenido
      if (totalTime) sheet.getRange(existingIndex + 1, 9).setValue(totalTime);
    }
  } else {
    // Estructura: [Fecha, UserId, Alumno, Juego, Asignatura, Puntaje, Nivel, Grado, TiempoTotal]
    sheet.appendRow([new Date(), userId, nombreAlumno || "Anónimo", juego, asignatura || "General", score, normNivel, grado || "", totalTime || 0]);
  }
  return { status: "success" };
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
        // Promedio de la asignatura: suma de niveles / 3 (Divisor fijo por Req)
        const asigAvg = scores.reduce((a, b) => a + b, 0) / 3;
        totalSubjectSum += asigAvg;

        // Registrar para top por asignatura
        if (!subjectTops[grd]) subjectTops[grd] = {};
        if (!subjectTops[grd][asig]) subjectTops[grd][asig] = [];
        subjectTops[grd][asig].push({ nombre: profile.nombre, promedio: asigAvg });
      }
    }

    const userGradeNum = parseGradeNum(profile.grado);
    let globalDivisor = 1;
    if (userGradeNum === 11) globalDivisor = 5; // 1 (10th) + 4 (11th)
    if (userGradeNum === 12) globalDivisor = 6; // 1 (10th) + 4 (11th) + 1 (12th)

    const globalAvg = totalSubjectSum / globalDivisor;

    globalLeaderboard.push({
      nombre: profile.nombre,
      promedio: Math.round(globalAvg),
      grado: profile.grado
    });
  }

  // Ordenar Global
  globalLeaderboard.sort((a, b) => b.promedio - a.promedio);

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
    global: globalLeaderboard.slice(0, 10), // Top 10 Global
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

    userRows.forEach(r => {
      const j = r[3];
      const p = parseFloat(r[5] || 0);
      const asig = r[4];
      const lvl = r[6];
      const grd = r[7];

      if (j === "QuizPro") {
        // Generar llaves únicas por materia, grado y nivel para el frontend
        const key = `QuizPro_${asig}_${grd}_${lvl}`;
        if (!stats[key] || p > stats[key].maxScore) {
          stats[key] = { maxScore: p, date: r[0], level: lvl, grade: grd, subject: asig };
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
      allHistory: userRows
    };
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
      sheet.appendRow(["ParcialActual", "Primer Parcial"]);
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

  // 3. Cálculo de Eficiencia y Puntaje_Rapidez
  let puntajeRapidez = 0;
  if (ratio <= 0.5) puntajeRapidez = 100;
  else if (ratio <= 1.0) puntajeRapidez = 100 - ((ratio - 0.5) * 100);
  else puntajeRapidez = Math.max(0, 50 - ((ratio - 1.0) * 20));

  const eficiencia = esCorrecta ? puntajeRapidez : (100 - puntajeRapidez);

  // 4. Consistencia (Basado en Cambios)
  let consistencia = 0;
  if (cambiosRespuesta === 0) consistencia = 100;
  else if (cambiosRespuesta === 1) consistencia = 60;
  else if (cambiosRespuesta === 2) consistencia = 30;
  else consistencia = 0;

  // 5. Índice de Confianza (ICR)
  const W_ICR = ANALYTICS_CONFIG.WEIGHTS.ICR;
  const exactitud = esCorrecta ? 100 : 0;
  const dificultad = parseFloat(dificultadPregunta || 50);

  const ICR = (exactitud * W_ICR.exactitud) +
              (eficiencia * W_ICR.eficiencia) +
              (dificultad * W_ICR.dificultad) +
              (consistencia * W_ICR.consistencia);

  // 6. Probabilidad de Adivinación (GP)
  const W_GP = ANALYTICS_CONFIG.WEIGHTS.GP;
  const aciertosGlobales = globalAnalytics.length > 0
    ? (globalAnalytics.filter(r => r[12] === true || r[12] === "true").length / globalAnalytics.length) * 100
    : 50;

  const GP = (puntajeRapidez * W_GP.rapidez) +
             ((100 - exactitud) * W_GP.error) +
             (dificultad * W_GP.dificultad) +
             ((100 - aciertosGlobales) * W_GP.global);

  // 7. Persistencia de Registro Individual
  const analyticsId = "ANL-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  analyticsSheet.appendRow([
    analyticsId, new Date(), userId, quizId || "", gameId, gameName, asignatura, grado, nivel, preguntaId,
    respuestaSeleccionada, respuestaCorrecta, esCorrecta, tiempoRespuesta, tiempoBase, ratio,
    cambiosRespuesta, Math.round(ICR), Math.round(GP), Math.round(ICR) // Usamos ICR como dominio inicial del registro
  ]);

  // 8. Actualizar Perfil de Aprendizaje (70/30 Rule)
  updateLearningProfile(ss, userId, asignatura, tema, nivel, esCorrecta, ICR);

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
 * Actualiza el Perfil de Dominio por Concepto (Fase 2)
 * Implementa un promedio ponderado (70% histórico / 30% actual) para reflejar progreso real.
 */
function updateLearningProfile(ss, userId, asignatura, tema, nivel, esCorrecta, dominioActual) {
  if (!tema || tema === 'General') return; // Evitar dilución de analítica con temas genéricos

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

    // Promedio Ponderado: El desempeño actual pesa un 30% sobre el acumulado (Fase 8 - Rule 70/30)
    const W_MASTERY = ANALYTICS_CONFIG.WEIGHTS.MASTERY;
    const dominioHistorico = parseFloat(data[rowIndex][8]) || 0;
    const nuevoDominio = Math.max(0, Math.min(100, Math.round((dominioHistorico * W_MASTERY.historico) + (dominioActual * W_MASTERY.actual))));

    // Columnas: attempts(F), hits(G), percent(H), masteryIndex(I), lastUpdate(J)
    sheet.getRange(rowIndex + 1, 6, 1, 5).setValues([[intentos, aciertos, porcentaje, nuevoDominio, new Date()]]);
    logDebug(`Dominio actualizado para ${sTema}: ${nuevoDominio}%`);
  } else {
    const profileId = "PRF-" + Date.now() + "-" + Math.floor(Math.random() * 100);
    // [profileId, userId, asignatura, tema, nivel, intentos, aciertos, porcentaje, indiceDominio, ultimaActualizacion]
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

function getAcademicConfig() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ConfiguracionAcademica");
  const data = sheet.getDataRange().getValues().slice(1);
  const config = {};
  data.forEach(r => config[r[0]] = r[1]);
  return { status: "success", data: config };
}

function updateAcademicConfig(payload) {
  const { key, value } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ConfiguracionAcademica");
  const data = sheet.getDataRange().getValues();

  const rowIndex = data.findIndex(r => r[0] === key);
  if (rowIndex !== -1) {
    sheet.getRange(rowIndex + 1, 2).setValue(value);
  } else {
    sheet.appendRow([key, value]);
  }
  return { status: "success" };
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
