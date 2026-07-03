// NOTA: Las URLs de los microservicios solo se deben actualizar en el frontend (js/config.js), no en este archivo.
// ============================================================================
// MICROSERVICIO DE USUARIOS (VERSIÓN MODULAR JULIO 2026)
// ============================================================================

const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const FRONTEND_URL = "https://informatica0101.github.io";
const DEBUG_MODE = true;
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
    THRESHOLD: 30,
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
      case "generateMigrationReport": result = generateMigrationReport(payload); break;
      case "mergeGuestData": result = mergeGuestData(payload); break;
      default:
        result = { status: "error", message: `Acción no reconocida en User-Service: ${action}` };
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
      return { status: "success", userId, message: "Cuenta actualizada correctamente." };
    }
    return {
      status: "error",
      exists: true,
      message: "Este correo electrónico ya está registrado.",
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

  const expectedSig = Utilities.computeHmacSha256Signature(JSON.stringify(payloadData), SECRET_KEY)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');

  if (signature !== expectedSig) throw new Error("Firma del token no válida.");
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

  const rowIndex = data.findIndex(r => String(r[0]) === String(userId));
  if (rowIndex === -1) throw new Error("Usuario no encontrado.");

  const userRow = [...data[rowIndex]];

  if (password) {
    if (!currentPassword) throw new Error("Contraseña actual requerida.");
    const currentHashed = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, currentPassword)
      .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
    if (String(userRow[5]) !== currentHashed) throw new Error("Contraseña actual incorrecta.");
    userRow[5] = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
      .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  }

  if (nombre) userRow[1] = nombre.trim();
  if (email) {
    const lowerEmail = email.toLowerCase().trim();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) !== String(userId) && String(data[i][4]).toLowerCase().trim() === lowerEmail) {
        throw new Error("El correo ya está registrado.");
      }
    }
    userRow[4] = lowerEmail;
  }
  if (telefono !== undefined) userRow[7] = String(telefono).trim();
  if (numeroLista !== undefined) userRow[8] = String(numeroLista).trim();

  sheet.getRange(rowIndex + 1, 1, 1, 9).setValues([[
    String(userRow[0]), String(userRow[1]), String(userRow[2]), String(userRow[3]),
    String(userRow[4]), String(userRow[5]), String(userRow[6]), String(userRow[7]), String(userRow[8])
  ]]);

  return { status: "success", message: "Perfil actualizado correctamente.", data: { userId: userRow[0], nombre: userRow[1], email: userRow[4], telefono: userRow[7], numeroLista: userRow[8] } };
}

function saveGameResult(payload) {
  const { userId, nombreAlumno, juego, asignatura, puntaje, nivel, grado, xpGanada } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Logros");
  const data = sheet.getDataRange().getValues();
  const score = parseFloat(puntaje || 0);
  const xpNeto = parseFloat(xpGanada || 0);

  const normNivel = getStandardLevelName(nivel);

  let existingIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(userId) && data[i][3] === juego && String(data[i][4]) === String(asignatura) && getStandardLevelName(data[i][6]) === normNivel && String(data[i][7]) === String(grado)) {
      existingIndex = i;
      break;
    }
  }

  if (existingIndex !== -1) {
    const oldScore = parseFloat(data[existingIndex][5] || 0);
    const oldXP = parseFloat(data[existingIndex][8] || 0);
    const newXP = oldXP + xpNeto;
    sheet.getRange(existingIndex + 1, 1).setValue(new Date());
    sheet.getRange(existingIndex + 1, 9).setValue(newXP);
    if (score > oldScore) sheet.getRange(existingIndex + 1, 6).setValue(score);
  } else {
    sheet.appendRow([new Date(), userId, nombreAlumno || "Anónimo", juego, asignatura || "General", score, normNivel, grado || "", xpNeto]);
  }

  return { status: "success", message: "Resultado guardado." };
}

function getGlobalTop(payload) {
  const { gameId } = payload || {};
  const targetGame = gameId ? normalizeString(gameId) : "quizpro";
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logSheet = getOrCreateSheet(ss, "Logros");
  const logData = logSheet.getDataRange().getValues();
  if (logData.length <= 1) return { status: "success", global: [] };

  const logRows = logData.slice(1);
  const stats = {};
  logRows.forEach(r => {
    if (normalizeString(r[3]) !== targetGame) return;
    const userId = String(r[1]).trim();
    if (!userId) return;
    const score = parseFloat(r[5] || 0);
    if (!stats[userId] || score > stats[userId].maxScore) {
      stats[userId] = { nombre: r[2], maxScore: score, xp: (stats[userId]?.xp || 0) + (parseFloat(r[8]) || 0) };
    } else {
      stats[userId].xp += (parseFloat(r[8]) || 0);
    }
  });

  const globalLeaderboard = Object.keys(stats).map(id => ({
    nombre: stats[id].nombre,
    promedio: stats[id].maxScore,
    xp: stats[id].xp
  })).sort((a, b) => b.promedio - a.promedio).slice(0, 10);

  return { status: "success", global: globalLeaderboard };
}

function getGameStats(payload) {
  const { userId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Logros");
  const data = sheet.getDataRange().getValues().slice(1);

  if (userId) {
    const userRows = data.filter(r => String(r[1]) === String(userId));
    return { status: "success", data: userRows };
  }
  return { status: "success", data: data };
}

function getNews(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "NoticiasPortal");
  const data = sheet.getDataRange().getValues();
  data.shift();
  return { status: "success", data: data.map(r => ({ fecha: r[0], hora: r[1], titulo: r[2], contenido: r[3], imagenUrl: r[4], categoria: r[5] || "General" })) };
}

function createNews(payload) {
  const { titulo, contenido, imagenUrl, categoria } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "NoticiasPortal");
  const now = new Date();
  sheet.appendRow([now.toISOString().split('T')[0], now.toTimeString().split(' ')[0], titulo, contenido, imagenUrl || "", categoria || "General"]);
  return { status: "success", message: "Noticia publicada." };
}

function uploadNewsImage(payload) {
  const { fileName, fileData } = payload;
  const folder = DriveApp.getFolderById("1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB");
  const blob = Utilities.newBlob(Utilities.base64Decode(fileData.split(',')[1]), "image/jpeg", fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { status: "success", data: { fileId: file.getId(), directUrl: `https://lh3.googleusercontent.com/d/${file.getId()}` } };
}

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

function recordAnalytics(payload) {
  const { userId, gameId, asignatura, grado, nivel, preguntaId, esCorrecta, tiempoRespuesta, tema } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "QuizProAnalytics");
  sheet.appendRow([Date.now(), new Date(), userId, "", gameId, "", asignatura, grado, nivel, preguntaId, "", "", esCorrecta, tiempoRespuesta, 0, 0, 0, 0, 0, 0, esCorrecta ? 100 : 0]);
  return { status: "success" };
}

function getLearningProfile(payload) {
  const { userId } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "LearningProfile");
  const data = sheet.getDataRange().getValues().slice(1);
  return { status: "success", data: data.filter(r => r[1] === userId).map(r => ({ asignatura: r[2], tema: r[3], nivel: r[4], intentos: r[5], aciertos: r[6], porcentaje: r[7], dominio: r[8] })) };
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
  const row = headers.map(h => payload[h] || "");
  const idx = data.findIndex(r => r[0] === payload.PreguntaID);
  if (idx !== -1) sheet.getRange(idx + 1, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
  return { status: "success", preguntaId: payload.PreguntaID };
}

function mergeGuestData(payload) {
  return { status: "success", message: "Fusión completada." };
}

function generateMigrationReport(payload) {
  return { status: "success" };
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}
