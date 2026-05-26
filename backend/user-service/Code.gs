// ============================================================================
// MICROSERVICIO DE USUARIOS (VERSIÓN INTEGRAL MAYO 2026)
// ============================================================================

const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const FRONTEND_URL = "https://informatica0101.github.io";
const DEBUG_MODE = true;
const SECRET_KEY = "IMA-PORTAL-SECURE-KEY-2026"; // Clave para firmar tokens

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
  const { nombre, grado, seccion, email, password, telefono, numeroLista } = payload || {};
  if (!nombre || !email || !password) throw new Error("Datos obligatorios faltantes.");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();

  const lowerEmail = email.toLowerCase().trim();
  for (let i = 1; i < data.length; i++) {
    if (data[i][4]?.toString().toLowerCase().trim() === lowerEmail) {
      return { status: "error", message: "Email ya registrado." };
    }
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
        data: { userId: row[0], nombre: row[1], grado: row[2], seccion: row[3], rol: row[6], telefono: row[7] || "", numeroLista: row[8] || "" }
      };
    }
  }
  return { status: "error", message: "Credenciales incorrectas." };
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
  }).map(r => ({ userId: r[0], nombre: r[1], grado: r[2], seccion: r[3], telefono: r[7] || "", numeroLista: r[8] || "" }));

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
  const { userId, nombre, telefono, numeroLista, password } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(r => r[0] === userId);
  if (rowIndex === -1) throw new Error("Usuario no encontrado.");

  const userRow = data[rowIndex];
  if (nombre) userRow[1] = nombre;
  if (telefono !== undefined) userRow[7] = telefono;
  if (numeroLista !== undefined) userRow[8] = numeroLista;
  if (password) {
    const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
      .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
    userRow[5] = hashedPassword;
  }

  // Optimización: Una sola llamada de escritura para toda la fila
  sheet.getRange(rowIndex + 1, 1, 1, userRow.length).setValues([userRow]);

  return { status: "success", message: "Perfil actualizado." };
}

function saveGameResult(payload) {
  const { userId, nombreAlumno, juego, logro, puntaje } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Logros");
  sheet.appendRow([new Date(), userId, nombreAlumno || "Anónimo", juego, logro || "N/A", puntaje || 0]);
  return { status: "success" };
}

function getGameStats(payload) {
  const { grado, seccion, userId } = payload || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(ss, "Logros");
  const data = sheet.getDataRange().getValues().slice(1);

  if (userId) {
    const stats = {};
    data.filter(r => r[1] === userId).forEach(r => {
      const j = r[3]; const p = parseFloat(r[5] || 0);
      if (!stats[j] || p > stats[j].maxScore) stats[j] = { maxScore: p, lastLogro: r[4], date: r[0] };
    });
    return { status: "success", data: stats };
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
    titulo: r[1],
    contenido: r[2],
    imagenUrl: r[3],
    categoria: r[4] || "General"
  })).filter(n => n.titulo && n.contenido);

  news.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  return { status: "success", data: news };
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === "Logros") sheet.appendRow(["Fecha", "UserId", "Alumno", "Juego", "Logro", "Puntaje"]);
    if (name === "NoticiasPortal") sheet.appendRow(["Fecha", "Título", "Contenido", "ImagenUrl", "Categoría"]);
  }
  return sheet;
}
