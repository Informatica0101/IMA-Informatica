// ============================================================================
// MICROSERVICIO DE USUARIOS (VERSIÓN INTEGRAL MAYO 2026)
// ============================================================================

const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const FRONTEND_URL = "https://informatica0101.github.io";
const DEBUG_MODE = true;
// SECRET_KEY se obtiene de ScriptProperties para mayor seguridad
const SECRET_KEY = PropertiesService.getScriptProperties().getProperty('SECRET_KEY') || "IMA-PORTAL-DEVELOPMENT-KEY-UNSECURE";

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
      case "createNews": result = createNews(payload); break;
      case "uploadNewsImage": result = uploadNewsImage(payload); break;
      case "saveWhatsAppLink": result = saveWhatsAppLink(payload); break;
      case "getWhatsAppLink": result = getWhatsAppLink(payload); break;
      case "getStudents": result = getStudents(payload); break;
      case "getUserInfo": result = getUserInfo(payload); break;
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
  const { userId, nombreAlumno, juego, asignatura, puntaje, nivel, grado } = payload || {};
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
    }
  } else {
    // Estructura: [Fecha, UserId, Alumno, Juego, Asignatura, Puntaje, Nivel, Grado]
    sheet.appendRow([new Date(), userId, nombreAlumno || "Anónimo", juego, asignatura || "General", score, normNivel, grado || ""]);
  }
  return { status: "success" };
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

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === "Logros") sheet.appendRow(["Fecha", "UserId", "Alumno", "Juego", "Asignatura", "Puntaje", "Nivel", "Grado"]);
    if (name === "NoticiasPortal") sheet.appendRow(["Fecha", "Hora", "Título", "Contenido", "ImagenUrl", "Categoría"]);
    if (name === "Clases") sheet.appendRow(["Grado", "Seccion", "WhatsAppLink"]);
  }
  return sheet;
}
