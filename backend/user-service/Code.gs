// NOTA: Las URLs de los microservicios solo se deben actualizar en el frontend (js/config.js), no en este archivo.
// ============================================================================
// MICROSERVICIO DE USUARIOS (VERSIÓN MODULAR RESTAURADA v7.9.6)
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
    console.log(`[USER-SVC] ${new Date().toLocaleTimeString()} - ${message}`, optionalParam || "");
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
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.TEXT);
}

function normalizeString(str) {
  if (!str) return "";
  return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
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

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === "Logros") sheet.appendRow(["Fecha", "UserId", "Alumno", "Juego", "Asignatura", "Puntaje", "Nivel", "Grado", "XP"]);
    if (name === "NoticiasPortal") sheet.appendRow(["Fecha", "Hora", "Título", "Contenido", "ImagenUrl", "Categoría"]);
    if (name === "QuizProAnalytics") sheet.appendRow(["analyticsId", "fecha", "userId", "quizId", "gameId", "gameName", "asignatura", "grado", "nivel", "preguntaId", "respuestaSeleccionada", "respuestaCorrecta", "esCorrecta", "tiempoRespuesta", "tiempoBase", "ratio", "cambiosRespuesta", "indiceConfianza", "indiceAdivinacion", "indiceDominio", "totalXP"]);
    if (name === "LearningProfile") sheet.appendRow(["profileId", "userId", "asignatura", "tema", "nivel", "intentos", "aciertos", "porcentajeAciertos", "indiceDominio", "ultimaActualizacion"]);
    if (name === "GameLeaderboards") sheet.appendRow(["leaderboardId", "gameId", "userId", "nombreAlumno", "grado", "asignatura", "mejorPuntuacion", "indiceDominioPromedio", "partidasJugadas", "ultimaActualizacion"]);
    if (name === "Matriculas") sheet.appendRow(["MatriculaID", "Fecha", "UserId", "Alumno", "Grado", "Seccion", "Periodo", "Tipo", "Estado", "BecaDescuento", "Observaciones"]);
    if (name === "CargosEstudiante") sheet.appendRow(["CargoID", "Fecha", "UserId", "Concepto", "MontoBase", "Descuento", "MontoFinal", "Estado", "FechaVencimiento"]);
    if (name === "ConceptosCobro") sheet.appendRow(["ConceptoID", "Fecha", "NombreConcepto", "MontoBase", "AplicaAGrado", "PeriodoVigencia", "Estado", "Observaciones"]);
    if (name === "PagosAbonos") sheet.appendRow(["PagoID", "Fecha", "UserId", "CargoID", "Concepto", "MontoAbono", "MetodoPago", "Referencia", "Estado", "ReciboID", "Observaciones"]);
  }
  return sheet;
}

function normalizeSubjectInBackend(name) {
  if (!name) return 'General';
  return name.toString().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s*\(?(?:[IVX]+)?\s*Parcial\)?/i, '').replace(/\s+\(?[IVX]+\)?$/i, '').replace(/\s+I{1,3}$/i, '').trim();
}

// ---------------------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------------------

function doGet() { return textResponse({ status: "success", message: "Microservicio Usuarios operativo" }); }


// ---------------------------------------------------------------------------
// CONTROL DE ACCESO BASADO EN ROLES (RBAC SERVIDOR - REQ-EXP-008)
// ---------------------------------------------------------------------------
const ROLE_PERMISSIONS = {
  "Administrador": ["*"],
  "Director": ["createNews", "uploadNewsImage", "getNews", "getStudents", "getStudentsByGradoSeccion", "getUserInfo", "saveGameResult", "getGameStats", "getGlobalTop", "recordAnalytics", "getLearningProfile", "mergeGuestData", "updateUserProfile", "registerStudentEnrollment", "getStudentEnrollmentHistory", "configurePaymentConcept", "getStudentAccountStatement", "recordStudentPayment"],
  "Subdirector": ["createNews", "uploadNewsImage", "getNews", "getStudents", "getStudentsByGradoSeccion", "getUserInfo", "saveGameResult", "getGameStats", "getGlobalTop", "recordAnalytics", "getLearningProfile", "mergeGuestData", "updateUserProfile", "registerStudentEnrollment", "getStudentEnrollmentHistory", "configurePaymentConcept", "getStudentAccountStatement", "recordStudentPayment"],
  "Secretaría": ["getStudents", "getStudentsByGradoSeccion", "getUserInfo", "updateUserProfile", "getNews", "registerStudentEnrollment", "getStudentEnrollmentHistory", "configurePaymentConcept", "getStudentAccountStatement", "recordStudentPayment"],
  "Contador": ["getStudents", "getUserInfo", "getNews", "registerStudentEnrollment", "getStudentEnrollmentHistory", "configurePaymentConcept", "getStudentAccountStatement", "recordStudentPayment"],
  "Consejeros": ["getStudents", "getStudentsByGradoSeccion", "getUserInfo", "getLearningProfile", "getNews"],
  "Profesor": ["getStudents", "getStudentsByGradoSeccion", "getUserInfo", "getNews", "createNews", "uploadNewsImage", "saveGameResult", "getGameStats", "getGlobalTop", "recordAnalytics", "getLearningProfile", "mergeGuestData"],
  "Asistente": ["getStudents", "getStudentsByGradoSeccion", "getUserInfo", "getNews", "getLearningProfile"],
  "Estudiante": ["getUserInfo", "getNews", "saveGameResult", "getGameStats", "getGlobalTop", "recordAnalytics", "getLearningProfile", "mergeGuestData", "updateUserProfile", "getStudentEnrollmentHistory", "getStudentAccountStatement"],
  "Alumno": ["getUserInfo", "getNews", "saveGameResult", "getGameStats", "getGlobalTop", "recordAnalytics", "getLearningProfile", "mergeGuestData", "updateUserProfile", "getStudentEnrollmentHistory", "getStudentAccountStatement"]
};

const PUBLIC_ACTIONS = ["registerUser", "loginUser", "requestPasswordRecovery", "resetPassword"];

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
      return textResponse({ status: "error", code: "AUTH_PERMISSION_DENIED", message: "Acceso denegado: El rol " + authCheck.role + " no tiene permiso para la acción " + action + "." });
    }
    let result;
    switch (action) {
      case "registerUser": result = registerUser(payload); break;
      case "loginUser": result = loginUser(payload); break;
      case "getStudents": result = getStudents(payload); break;
      case "getStudentsByGradoSeccion": result = getStudentsByGradoSeccion(payload); break;
      case "getUserInfo": result = getUserInfo(payload); break;
      case "requestPasswordRecovery": result = requestPasswordRecovery(payload); break;
      case "resetPassword": result = resetPassword(payload); break;
      case "updateUserProfile": result = updateUserProfile(payload); break;
      case "saveGameResult": result = saveGameResult(payload); break;
      case "getGameStats": result = getGameStats(payload); break;
      case "getGlobalTop": result = getGlobalTop(payload); break;
      case "recordAnalytics": result = recordAnalytics(payload); break;
      case "getLearningProfile": result = getLearningProfile(payload); break;
      case "mergeGuestData": result = mergeGuestData(payload); break;
      case "getNews": result = getNews(payload); break;
      case "createNews": result = createNews(payload); break;
      case "uploadNewsImage": result = uploadNewsImage(payload); break;
      case "registerStudentEnrollment": result = registerStudentEnrollment(payload); break;
      case "getStudentEnrollmentHistory": result = getStudentEnrollmentHistory(payload); break;
      case "configurePaymentConcept": result = configurePaymentConcept(payload); break;
      case "getStudentAccountStatement": result = getStudentAccountStatement(payload); break;
      case "recordStudentPayment": result = recordStudentPayment(payload); break;
      default: result = { status: "error", message: `Acción no reconocida: ${action}` };
    }
    return textResponse(result);
  } catch (err) { return textResponse({ status: "error", message: err.message || "Error interno usuarios." }); }
}

// ---------------------------------------------------------------------------
// LÓGICA DE USUARIOS
// ---------------------------------------------------------------------------

function registerUser(payload) {
  const { nombre, grado, seccion, email, password, telefono, numeroLista, forceUpdate } = payload || {};
  if (!nombre || !email || !password) throw new Error("Datos obligatorios faltantes.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();
  const lowerEmail = email.toLowerCase().trim();
  let existingIndex = -1;
  for (let i = 1; i < data.length; i++) { if (data[i][4]?.toString().toLowerCase().trim() === lowerEmail) { existingIndex = i; break; } }
  if (existingIndex !== -1) {
    if (forceUpdate) {
      const userId = data[existingIndex][0];
      const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
      sheet.getRange(existingIndex + 1, 1, 1, 9).setValues([[userId, nombre, grado || "", seccion || "", email, hashedPassword, "Estudiante", telefono || "", numeroLista || ""]]);
      return { status: "success", userId, message: "Cuenta actualizada." };
    }
    return { status: "error", exists: true, message: "Email ya registrado.", data: { nombre: data[existingIndex][1], gradoActual: data[existingIndex][2], seccionActual: data[existingIndex][3] } };
  }
  const userId = "USR-" + new Date().getTime();
  const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  sheet.appendRow([userId, nombre, grado || "", seccion || "", email, hashedPassword, "Estudiante", telefono || "", numeroLista || ""]);
  return { status: "success", userId };
}

function loginUser(payload) {
  const { identifier, password } = payload || {};
  const data = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios").getDataRange().getValues();
  const hp = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  const id = identifier.toLowerCase().trim();
  for (let i = 1; i < data.length; i++) { if ((data[i][4]?.toString().toLowerCase().trim() === id || data[i][1]?.toString().toLowerCase().trim() === id) && data[i][5] === hp) { return { status: "success", data: { userId: data[i][0], nombre: data[i][1], grado: data[i][2], seccion: data[i][3], email: data[i][4], rol: data[i][6], telefono: data[i][7] || "", numeroLista: data[i][8] || "" } }; } }
  return { status: "error", message: "Credenciales incorrectas." };
}

function getStudents(payload) {
  const data = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios").getDataRange().getValues().slice(1);
  return { status: "success", data: data.filter(r => r[6] === 'Estudiante').map(r => ({ userId: r[0], nombre: r[1], numeroLista: r[8] || "" })) };
}

function getStudentsByGradoSeccion(payload) {
  const { grado, seccion } = payload;
  const data = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios").getDataRange().getValues().slice(1);
  const sGrado = normalizeString(grado);
  const sSeccion = normalizeString(seccion);
  const students = data.filter(r => String(r[6]).trim() === 'Estudiante' && normalizeString(r[2]) === sGrado && (!seccion || normalizeString(r[3]) === sSeccion)).map(r => ({ userId: r[0], nombre: r[1], grado: r[2], seccion: r[3], email: r[4], telefono: r[7] || "", numeroLista: r[8] || "" }));
  students.sort((a, b) => (parseInt(a.numeroLista) || 999) - (parseInt(b.numeroLista) || 999));
  return { status: "success", data: students };
}

function getUserInfo(payload) {
  const r = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios").getDataRange().getValues().find(r => String(r[0]) === String(payload.userId));
  if (!r) throw new Error("Usuario no encontrado.");
  return { status: "success", data: { userId: r[0], nombre: r[1], email: r[4], rol: r[6], telefono: r[7] || "" } };
}

function requestPasswordRecovery(payload) {
  const { email } = payload;
  const data = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios").getDataRange().getValues();
  const user = data.find(r => r[4]?.toString().toLowerCase().trim() === email.toLowerCase().trim());
  if (!user) return { status: "error", message: "Correo no encontrado." };
  const p = { userId: user[0], exp: Date.now() + 3600000 };
  const s = Utilities.computeHmacSha256Signature(JSON.stringify(p), SECRET_KEY).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  const token = Utilities.base64Encode(JSON.stringify({ p, s }));
  MailApp.sendEmail(email, "Recuperación de Contraseña", `Enlace: ${FRONTEND_URL}/reset-password.html?token=${encodeURIComponent(token)}`);
  return { status: "success", message: "Email enviado." };
}

function resetPassword(payload) {
  const { token, newPassword } = payload;
  const decoded = JSON.parse(Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString());
  const expectedS = Utilities.computeHmacSha256Signature(JSON.stringify(decoded.p), SECRET_KEY).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  if (decoded.s !== expectedS) throw new Error("Firma inválida.");
  if (Date.now() > decoded.p.exp) throw new Error("Expirado.");
  const sheet = getSheetOrThrow(SpreadsheetApp.openById(SPREADSHEET_ID), "Usuarios");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]) === String(decoded.p.userId));
  if (idx === -1) throw new Error("Usuario no encontrado.");
  const hp = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, newPassword).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  sheet.getRange(idx + 1, 6).setValue(hp);
  return { status: "success", message: "Contraseña actualizada." };
}

function updateUserProfile(payload) {
  const { userId, nombre, email, telefono, numeroLista, currentPassword, password } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();
  const idx = data.findIndex(r => String(r[0]) === String(userId));
  if (idx === -1) throw new Error("No encontrado.");
  const userRow = [...data[idx]];
  if (password) {
    const ch = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, currentPassword).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
    if (userRow[5] !== ch) throw new Error("Actual incorrecta.");
    userRow[5] = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  }
  if (nombre) userRow[1] = nombre.trim();
  if (email) userRow[4] = email.toLowerCase().trim();
  if (telefono !== undefined) userRow[7] = String(telefono).trim();
  if (numeroLista !== undefined) userRow[8] = String(numeroLista).trim();
  sheet.getRange(idx + 1, 1, 1, 9).setValues([userRow]);
  return { status: "success", message: "Perfil actualizado." };
}

// ---------------------------------------------------------------------------
// ANALÍTICA Y GAMIFICACIÓN
// ---------------------------------------------------------------------------

function saveGameResult(payload) {
  const { userId, nombreAlumno, juego, asignatura, puntaje, nivel, grado, xpGanada } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Logros");
  const data = sheet.getDataRange().getValues();
  const score = parseFloat(puntaje || 0);
  const xpNeto = parseFloat(xpGanada || 0);
  const normNivel = getStandardLevelName(nivel);
  let idx = data.findIndex(r => String(r[1]) === String(userId) && r[3] === juego && String(r[4]) === String(asignatura) && getStandardLevelName(r[6]) === normNivel && String(r[7]) === String(grado));
  if (idx !== -1) {
    sheet.getRange(idx + 1, 1).setValue(new Date());
    const newXP = parseFloat(data[idx][8] || 0) + xpNeto;
    sheet.getRange(idx + 1, 9).setValue(newXP);
    if (score > parseFloat(data[idx][5] || 0)) sheet.getRange(idx + 1, 6).setValue(score);
  } else {
    sheet.appendRow([new Date(), userId, nombreAlumno || "Anónimo", juego, asignatura || "General", score, normNivel, grado || "", xpNeto]);
  }
  return { status: "success", message: "Guardado.", updatedStats: getGameStats({ userId }).data };
}

function getGlobalTop(payload) {
  const targetGame = normalizeString(payload.gameId || "quizpro");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logRows = getOrCreateSheet(ss, "Logros").getDataRange().getValues().slice(1);
  const userData = ss.getSheetByName("Usuarios").getDataRange().getValues().slice(1);
  const usersMap = {}; userData.forEach(r => { usersMap[String(r[0])] = { nombre: r[1], grado: r[2] }; });

  const stats = {};
  const subjectTops = {};

  logRows.forEach(r => {
    if (normalizeString(r[3]) !== targetGame) return;
    const userId = String(r[1]).trim();
    const asig = normalizeSubjectInBackend(r[4]);
    const score = parseFloat(r[5] || 0);
    const grd = String(r[7]);
    if (!stats[userId]) stats[userId] = { data: {}, fallbackNombre: r[2], fallbackGrado: grd, xp: 0 };
    if (!stats[userId].data[grd]) stats[userId].data[grd] = {};
    if (!stats[userId].data[grd][asig]) stats[userId].data[grd][asig] = [];
    stats[userId].data[grd][asig].push(score);
  });

  const leaderboard = Object.keys(stats).map(userId => {
    const profile = usersMap[userId] || { nombre: stats[userId].fallbackNombre, grado: stats[userId].fallbackGrado };
    let totalAsigSum = 0, asigCount = 0;
    for (const g in stats[userId].data) {
      for (const a in stats[userId].data[g]) {
        const scores = stats[userId].data[g][a].filter(s => s > 0);
        const asigAvg = scores.length > 0 ? scores.reduce((x,y)=>x+y,0)/scores.length : 0;
        totalAsigSum += asigAvg; asigCount++;
        if (!subjectTops[g]) subjectTops[g] = {};
        if (!subjectTops[g][a]) subjectTops[g][a] = [];
        subjectTops[g][a].push({ nombre: profile.nombre, promedio: asigAvg });
      }
    }
    const userXP = logRows.filter(r => String(r[1]) === userId && normalizeString(r[3]) === targetGame).reduce((s, r) => s + (parseFloat(r[8]) || 0), 0);
    return { nombre: profile.nombre, grado: profile.grado, promedio: Math.round(asigCount > 0 ? totalAsigSum/asigCount : 0), xp: userXP };
  }).filter(u => !isNaN(u.promedio)).sort((a,b) => b.promedio - a.promedio);

  const finalSubjectTops = {};
  for (const g in subjectTops) {
    finalSubjectTops[g] = {};
    for (const a in subjectTops[g]) {
      const list = subjectTops[g][a].sort((x, y) => y.promedio - x.promedio);
      const max = list[0]?.promedio || 0;
      finalSubjectTops[g][a] = list.filter(u => u.promedio === max && max > 0);
    }
  }
  return { status: "success", global: leaderboard.slice(0, 10), subjectTops: finalSubjectTops };
}

function getGameStats(payload) {
  const { userId, grado, seccion } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logros = getOrCreateSheet(ss, "Logros").getDataRange().getValues().slice(1);
  if (userId) {
    const userRows = logros.filter(r => String(r[1]) === String(userId));
    const detailedLogs = getOrCreateSheet(ss, "QuizProAnalytics").getDataRange().getValues().slice(1).filter(r => String(r[2]) === String(userId));
    const userProfile = getOrCreateSheet(ss, "LearningProfile").getDataRange().getValues().slice(1).filter(r => String(r[1]) === String(userId));
    const stats = {};
    userRows.forEach(r => {
      const asig = r[4], lvl = r[6], grd = r[7];
      if (r[3] === "QuizPro") {
        const key = `QuizPro_${asig}_${grd}_${lvl}`;
        const logs = detailedLogs.filter(l => normalizeString(l[6]) === normalizeString(asig) && getStandardLevelName(l[8]) === getStandardLevelName(lvl));
        const overall = userProfile.find(up => normalizeString(up[2]) === normalizeString(asig) && up[3] === "__NIVEL_COMPLETO__" && up[4] === lvl);
        stats[key] = { maxScore: parseFloat(r[5]||0), dominio: Math.round(overall ? overall[8] : 0), icr: logs.length > 0 ? Math.round(logs.reduce((s,l)=>s+parseFloat(l[17]),0)/logs.length) : 0, ia: logs.length > 0 ? Math.round(logs.reduce((s,l)=>s+parseFloat(l[18]),0)/logs.length) : 0, xpAcumulada: logs.reduce((s,l)=>s+parseFloat(l[20]||0),0), totalAttempts: logs.length, date: r[0], level: lvl, grade: grd, subject: asig };
      } else { if (!stats[r[3]] || r[5] > stats[r[3]].maxScore) stats[r[3]] = { maxScore: r[5], date: r[0] }; }
    });
    return { status: "success", data: stats, allHistory: detailedLogs.length > 0 ? detailedLogs : userRows, learningProfile: userProfile };
  }
  if (!grado && !seccion) return { status: "success", data: logros };
  const students = getStudentsByGradoSeccion({ grado, seccion }).data.map(s => s.userId);
  return { status: "success", data: logros.filter(r => students.includes(r[1])) };
}

function recordAnalytics(payload) {
  const { userId, gameId, asignatura, grado, nivel, preguntaId, esCorrecta, tiempoRespuesta, cambiosRespuesta, tema, quizId, gameName, respuestaSeleccionada, respuestaCorrecta } = payload || {};
  if (!userId || !gameId || !asignatura || !preguntaId) return { status: "error", message: "Faltan IDs." };
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const analyticsSheet = getOrCreateSheet(ss, "QuizProAnalytics");
  const data = analyticsSheet.getDataRange().getValues().slice(1);
  const userLogs = data.filter(r => String(r[2]) === String(userId));
  const isCalibration = userLogs.length < ANALYTICS_CONFIG.CALIBRATION.THRESHOLD;
  const globalLogs = data.filter(r => String(r[9]) === String(preguntaId));
  let avgP = globalLogs.length > 0 ? globalLogs.reduce((s,r)=>s+parseFloat(r[13]),0)/globalLogs.length : 5000;
  let avgU = userLogs.length > 0 ? userLogs.reduce((s,r)=>s+parseFloat(r[13]),0)/userLogs.length : avgP;
  const tBase = (avgP * (isCalibration ? 0.8 : 0.6)) + (avgU * (isCalibration ? 0.2 : 0.4));
  const ratio = tiempoRespuesta / (tBase || 1);
  const attempts = userLogs.filter(l => String(l[9]) === String(preguntaId)).length + 1;
  const xpMult = attempts === 1 ? 1 : (attempts === 2 ? 0.75 : (attempts === 3 ? 0.5 : 0.25));
  let icr = ((userLogs.filter(l => String(l[12]) === "true").length + (esCorrecta ? 1 : 0)) / (userLogs.length + 1)) * 70 + (esCorrecta ? Math.min(1.0, 1.2 - ratio*0.2) : ratio*0.5) * 30;
  if (isCalibration) icr = Math.max(60, icr);
  const consecutive = (function(){ let c=0; for(let i=userLogs.length-1;i>=0;i--){ if(String(userLogs[i][12])==="true")c++; else break;} return c; })();
  let gp = ( (ratio<=0.5 ? 100 : (ratio<=1.0?100-(ratio-0.5)*100:Math.max(0,50-(ratio-1.0)*20))) * 0.35 + (esCorrecta?0:100)*0.35 + 15 ) * (1 - consecutive/Math.max(15, userLogs.length+1));
  if (isCalibration) gp = Math.min(30, gp);
  const aId = "ANL-" + Date.now();
  analyticsSheet.appendRow([aId, new Date(), userId, quizId||"", gameId, gameName||"QuizPro", asignatura, grado, nivel, preguntaId, respuestaSeleccionada||"", respuestaCorrecta||"", esCorrecta, tiempoRespuesta, tBase, ratio, cambiosRespuesta, Math.round(icr), Math.round(gp), Math.round(icr), esCorrecta?Math.round(100*xpMult):0]);
  updateLearningProfile(ss, userId, asignatura, tema, nivel, esCorrecta, icr);
  updateLearningProfile(ss, userId, asignatura, "__NIVEL_COMPLETO__", nivel, esCorrecta, icr);
  updateLeaderboard(ss, gameId, userId, asignatura, grado, icr);
  return { status: "success", metrics: { icr: Math.round(icr), gp: Math.round(gp), isCalibration } };
}

function updateLearningProfile(ss, userId, asignatura, tema, nivel, esCorrecta, dominioActual) {
  if (tema !== "__NIVEL_COMPLETO__" && (!tema || tema === 'General')) return;
  const sheet = getOrCreateSheet(ss, "LearningProfile");
  const data = sheet.getDataRange().getValues();
  const sUserId = String(userId), sAsig = normalizeSubjectInBackend(asignatura), sTema = tema.trim();
  let idx = data.findIndex(r => String(r[1])===sUserId && normalizeSubjectInBackend(r[2])===sAsig && r[3]===sTema && r[4]===nivel);
  if (idx !== -1) {
    const attempts = (parseInt(data[idx][5])||0)+1, hits = (parseInt(data[idx][6])||0)+(esCorrecta?1:0);
    const weight = (parseFloat(data[idx][7])>=90 && esCorrecta) ? 0.05 : 0.3;
    const hWeight = attempts < 5 ? 0.5 : (1 - weight);
    const nuevo = Math.round((parseFloat(data[idx][8])||0)*hWeight + dominioActual*(1-hWeight));
    sheet.getRange(idx+1, 6, 1, 5).setValues([[attempts, hits, Math.round(hits/attempts*100), nuevo, new Date()]]);
  } else { sheet.appendRow(["PRF-"+Date.now(), sUserId, sAsig, sTema, nivel, 1, esCorrecta?1:0, esCorrecta?100:0, dominioActual, new Date()]); }
}

function updateLeaderboard(ss, gameId, userId, asignatura, grado, dominio) {
  const sheet = getOrCreateSheet(ss, "GameLeaderboards");
  const data = sheet.getDataRange().getValues();
  let idx = data.findIndex(r => r[1]===gameId && r[2]===userId && r[5]===asignatura);
  if (idx !== -1) {
    const p = parseInt(data[idx][8])+1, d = Math.round((parseFloat(data[idx][7])*(p-1)+dominio)/p);
    sheet.getRange(idx+1, 8, 1, 3).setValues([[d, p, new Date()]]);
  } else {
    const user = ss.getSheetByName("Usuarios").getDataRange().getValues().find(r => r[0] === userId);
    sheet.appendRow(["LDB-"+Date.now(), gameId, userId, user?user[1]:"Anónimo", grado, asignatura, 0, dominio, 1, new Date()]);
  }
}

function getLearningProfile(payload) {
  const data = getOrCreateSheet(SpreadsheetApp.openById(SPREADSHEET_ID), "LearningProfile").getDataRange().getValues().slice(1);
  return { status: "success", data: data.filter(r => r[1] === payload.userId).map(r => ({ asignatura: r[2], tema: r[3], nivel: r[4], intentos: r[5], aciertos: r[6], porcentaje: r[7], dominio: r[8] })) };
}

function mergeGuestData(payload) {
  const { userId, history } = payload;
  if (!userId || !history) return { status: "error" };
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const analyticsSheet = getOrCreateSheet(ss, "QuizProAnalytics");

  history.forEach(item => {
    const data = item.data;
    // 1. Migrar Logros
    if (data.puntaje !== undefined && data.juego) {
      saveGameResult({ userId, nombreAlumno: data.nombreAlumno, juego: data.juego, asignatura: data.asignatura, puntaje: data.puntaje, nivel: data.nivel, grado: data.grado, xpGanada: data.xpGanada || 0 });
    }
    // 2. Migrar Analítica (RESTAURADO)
    if (data.preguntaId) {
      const aId = "ANL-MERGE-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      analyticsSheet.appendRow([aId, new Date(item.updated_at || Date.now()), userId, data.quizId || "", data.gameId || "QuizPro", data.gameName || "QuizPro", data.asignatura, data.grado, data.nivel, data.preguntaId, data.respuestaSeleccionada, data.respuestaCorrecta, data.esCorrecta, data.tiempoRespuesta, 0, 0, data.cambiosRespuesta, 0, 0, 0, 0]);
    }
  });
  return { status: "success", message: "Historial fusionado." };
}

function getNews(payload) {
  const data = getOrCreateSheet(SpreadsheetApp.openById(SPREADSHEET_ID), "NoticiasPortal").getDataRange().getValues().slice(1);
  return { status: "success", data: data.filter(r => r[2] && r[3]).map(r => ({ fecha: r[0], hora: r[1], titulo: r[2], contenido: r[3], imagenUrl: r[4], categoria: r[5] || "General" })).sort((a,b) => new Date(b.fecha) - new Date(a.fecha) || b.hora.localeCompare(a.hora)) };
}

function createNews(payload) {
  const now = new Date();
  let img = payload.imagenUrl || ""; if (img && !img.includes("http")) img = `https://lh3.googleusercontent.com/d/${img}`;
  getOrCreateSheet(SpreadsheetApp.openById(SPREADSHEET_ID), "NoticiasPortal").appendRow([now.toISOString().split('T')[0], now.toTimeString().split(' ')[0], payload.titulo, payload.contenido, img, payload.categoria || "General"]);
  return { status: "success" };
}

function uploadNewsImage(payload) {
  const folder = getOrCreateFolderNews(DriveApp.getFolderById("1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB"), "Noticias_Imagenes");
  const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(payload.fileData.split(',')[1]), payload.fileData.split(',')[0].match(/:(.*?);/)[1], payload.fileName));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { status: "success", data: { fileId: file.getId(), directUrl: `https://lh3.googleusercontent.com/d/${file.getId()}` } };
}

function getOrCreateFolderNews(parent, name) { const f = parent.getFoldersByName(name); return f.hasNext() ? f.next() : parent.createFolder(name); }

// REQ-EXP-009: Módulo de Matrícula y Control Financiero del Estudiante
function registerStudentEnrollment(payload) {
  const { userId, alumno, grado, seccion, periodo, tipo, becaDescuento, observaciones, cargos } = payload || {};
  if (!userId || !grado || !periodo) throw new Error("Datos de matrícula incompletos.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const matSheet = getOrCreateSheet(ss, "Matriculas");
  const cargosSheet = getOrCreateSheet(ss, "CargosEstudiante");

  const matData = matSheet.getDataRange().getValues();
  const sUserId = String(userId).trim();
  const sPeriodo = String(periodo).trim();
  const sGrado = String(grado).trim();

  let existingIndex = matData.findIndex(r => String(r[2]).trim() === sUserId && String(r[6]).trim() === sPeriodo);
  let matriculaId;
  const now = new Date();

  if (existingIndex !== -1) {
    matriculaId = matData[existingIndex][0];
    matSheet.getRange(existingIndex + 1, 1, 1, 11).setValues([[
      matriculaId,
      now,
      sUserId,
      alumno || matData[existingIndex][3],
      sGrado,
      seccion || matData[existingIndex][5],
      sPeriodo,
      tipo || matData[existingIndex][7] || "Ordinaria",
      "Activa",
      becaDescuento || 0,
      observaciones || ""
    ]]);
  } else {
    matriculaId = "MAT-" + now.getTime();
    matSheet.appendRow([
      matriculaId,
      now,
      sUserId,
      alumno || "Estudiante",
      sGrado,
      seccion || "",
      sPeriodo,
      tipo || "Ordinaria",
      "Activa",
      becaDescuento || 0,
      observaciones || ""
    ]);
  }

  if (Array.isArray(cargos) && cargos.length > 0) {
    const existingCargos = cargosSheet.getDataRange().getValues();
    cargos.forEach(c => {
      const concepto = c.concepto || "Matrícula/Colegiatura";
      const dup = existingCargos.find(r => String(r[2]).trim() === sUserId && String(r[3]).trim() === concepto && String(r[7]) !== "Anulado");
      if (!dup) {
        const cargoId = "CRG-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        const montoBase = parseFloat(c.montoBase || 0);
        const descuento = parseFloat(c.descuento || becaDescuento || 0);
        const montoFinal = Math.max(0, montoBase - descuento);
        cargosSheet.appendRow([
          cargoId,
          now,
          sUserId,
          concepto,
          montoBase,
          descuento,
          montoFinal,
          c.estado || "Pendiente",
          c.fechaVencimiento || ""
        ]);
      }
    });
  }

  return { status: "success", matriculaId: matriculaId, message: "Matrícula registrada exitosamente." };
}

function getStudentEnrollmentHistory(payload) {
  const { userId } = payload || {};
  if (!userId) throw new Error("userId requerido.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sUserId = String(userId).trim();

  const matRows = getOrCreateSheet(ss, "Matriculas").getDataRange().getValues().slice(1);
  const userMatriculas = matRows.filter(r => String(r[2]).trim() === sUserId).map(r => ({
    matriculaId: r[0],
    fecha: r[1],
    userId: r[2],
    alumno: r[3],
    grado: r[4],
    seccion: r[5],
    periodo: r[6],
    tipo: r[7],
    estado: r[8],
    becaDescuento: r[9],
    observaciones: r[10]
  }));

  const cargosRows = getOrCreateSheet(ss, "CargosEstudiante").getDataRange().getValues().slice(1);
  const userCargos = cargosRows.filter(r => String(r[2]).trim() === sUserId).map(r => ({
    cargoId: r[0],
    fecha: r[1],
    userId: r[2],
    concepto: r[3],
    montoBase: r[4],
    descuento: r[5],
    montoFinal: r[6],
    estado: r[7],
    fechaVencimiento: r[8]
  }));

  return {
    status: "success",
    data: {
      matriculas: userMatriculas,
      cargos: userCargos
    }
  };
}

// REQ-EXP-010: Módulo Contable y Financiero - Conceptos, Mensualidades y Cobros
function configurePaymentConcept(payload) {
  const { conceptoId, nombreConcepto, montoBase, aplicaAGrado, periodoVigencia, estado, observaciones } = payload || {};
  if (!nombreConcepto || montoBase === undefined) throw new Error("Nombre y monto base son requeridos.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "ConceptosCobro");
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  let cId = conceptoId;
  let existingIndex = -1;
  if (cId) {
    existingIndex = data.findIndex(r => String(r[0]).trim() === String(cId).trim());
  } else {
    existingIndex = data.findIndex(r => String(r[2]).toLowerCase().trim() === String(nombreConcepto).toLowerCase().trim() && String(r[4]).trim() === String(aplicaAGrado || "Todos").trim());
  }

  if (existingIndex !== -1) {
    cId = data[existingIndex][0];
    sheet.getRange(existingIndex + 1, 1, 1, 8).setValues([[
      cId,
      now,
      nombreConcepto,
      parseFloat(montoBase || 0),
      aplicaAGrado || "Todos",
      periodoVigencia || "Anual",
      estado || "Activo",
      observaciones || ""
    ]]);
  } else {
    cId = "CPT-" + now.getTime();
    sheet.appendRow([
      cId,
      now,
      nombreConcepto,
      parseFloat(montoBase || 0),
      aplicaAGrado || "Todos",
      periodoVigencia || "Anual",
      estado || "Activo",
      observaciones || ""
    ]);
  }

  return { status: "success", conceptoId: cId, message: "Concepto de cobro configurado correctamente." };
}

function getStudentAccountStatement(payload) {
  const { userId } = payload || {};
  if (!userId) throw new Error("userId requerido.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sUserId = String(userId).trim();

  const cargosRows = getOrCreateSheet(ss, "CargosEstudiante").getDataRange().getValues().slice(1);
  const pagosRows = getOrCreateSheet(ss, "PagosAbonos").getDataRange().getValues().slice(1);

  const userCargos = cargosRows.filter(r => String(r[2]).trim() === sUserId && String(r[7]) !== "Anulado").map(r => ({
    cargoId: r[0],
    fecha: r[1],
    userId: r[2],
    concepto: r[3],
    montoBase: parseFloat(r[4] || 0),
    descuento: parseFloat(r[5] || 0),
    montoFinal: parseFloat(r[6] || 0),
    estado: r[7],
    fechaVencimiento: r[8]
  }));

  const userPagos = pagosRows.filter(r => String(r[2]).trim() === sUserId && String(r[8]) !== "Anulado").map(r => ({
    pagoId: r[0],
    fecha: r[1],
    userId: r[2],
    cargoId: r[3],
    concepto: r[4],
    montoAbono: parseFloat(r[5] || 0),
    metodoPago: r[6],
    referencia: r[7],
    estado: r[8],
    reciboId: r[9],
    observaciones: r[10]
  }));

  let totalCargos = 0;
  let totalPagado = 0;

  userCargos.forEach(c => { totalCargos += c.montoFinal; });
  userPagos.forEach(p => { totalPagado += p.montoAbono; });

  const saldoPendiente = Math.max(0, totalCargos - totalPagado);

  return {
    status: "success",
    data: {
      userId: sUserId,
      totalCargos: totalCargos,
      totalPagado: totalPagado,
      saldoPendiente: saldoPendiente,
      cargos: userCargos,
      pagos: userPagos
    }
  };
}

function recordStudentPayment(payload) {
  const { userId, cargoId, concepto, montoAbono, metodoPago, referencia, observaciones } = payload || {};
  if (!userId || montoAbono === undefined || parseFloat(montoAbono) <= 0) throw new Error("userId y montoAbono válido son requeridos.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sUserId = String(userId).trim();
  const abono = parseFloat(montoAbono);
  const now = new Date();

  const cargosSheet = getOrCreateSheet(ss, "CargosEstudiante");
  const cargosData = cargosSheet.getDataRange().getValues();

  let targetCargoIndex = -1;
  let targetCargo = null;

  if (cargoId) {
    targetCargoIndex = cargosData.findIndex(r => String(r[0]).trim() === String(cargoId).trim());
  } else if (concepto) {
    targetCargoIndex = cargosData.findIndex(r => String(r[2]).trim() === sUserId && String(r[3]).toLowerCase().trim() === String(concepto).toLowerCase().trim() && r[7] !== "Pagado");
  }

  if (targetCargoIndex !== -1) {
    targetCargo = cargosData[targetCargoIndex];
  }

  const pagoSheet = getOrCreateSheet(ss, "PagosAbonos");
  const pagoId = "PAG-" + now.getTime();
  const reciboId = "REC-" + Math.floor(100000 + Math.random() * 900000);

  pagoSheet.appendRow([
    pagoId,
    now,
    sUserId,
    targetCargo ? targetCargo[0] : (cargoId || "GRAL"),
    concepto || (targetCargo ? targetCargo[3] : "Abono a Cuenta"),
    abono,
    metodoPago || "Efectivo",
    referencia || "Depósito/Transferencia",
    "Confirmado",
    reciboId,
    observaciones || ""
  ]);

  if (targetCargoIndex !== -1 && targetCargo) {
    const montoFinalCargo = parseFloat(targetCargo[6] || 0);
    const pagosExistentes = pagoSheet.getDataRange().getValues().filter(r => String(r[2]).trim() === sUserId && String(r[3]).trim() === String(targetCargo[0]).trim() && r[8] === "Confirmado");
    const totalAbonadoCargo = pagosExistentes.reduce((sum, r) => sum + parseFloat(r[5] || 0), 0);

    let nuevoEstado = "Parcial";
    if (totalAbonadoCargo >= montoFinalCargo) {
      nuevoEstado = "Pagado";
    }
    cargosSheet.getRange(targetCargoIndex + 1, 8).setValue(nuevoEstado);
  }

  return {
    status: "success",
    pagoId: pagoId,
    reciboId: reciboId,
    message: "Pago/Abono registrado con éxito."
  };
}
