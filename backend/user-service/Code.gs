// ============================================================================
// MICROSERVICIO DE USUARIOS (VERSIÓN GAS CORRECTA)
// ============================================================================

const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DEBUG_MODE = true;

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

// ---------------------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------------------

function doGet() {
  return textResponse({
    status: "success",
    message: "Microservicio de Usuarios operativo"
  });
}

function doOptions() {
  return textResponse({ status: "ok" });
}

function doPost(e) {
  try {
    logDebug("Solicitud POST recibida");

    const { action, payload } = JSON.parse(e.postData.contents);
    let result;

    switch (action) {
      case "registerUser":
        result = registerUser(payload);
        break;

      case "loginUser":
        result = loginUser(payload);
        break;

      case "getStudentsByGradoSeccion":
        result = getStudentsByGradoSeccion(payload);
        break;

      case "updateProfile":
        result = updateProfile(payload);
        break;

      case "changePassword":
        result = changePassword(payload);
        break;

      case "requestPasswordRecovery":
        result = requestPasswordRecovery(payload);
        break;

      case "resetPassword":
        result = resetPassword(payload);
        break;

      default:
        result = {
          status: "error",
          message: `Acción no reconocida: ${action}`
        };
    }

    return textResponse(result);

  } catch (err) {
    logDebug("Error en doPost", err.message);
    return textResponse({
      status: "error",
      message: err.message || "Error interno del servidor."
    });
  }
}

// ---------------------------------------------------------------------------
// LÓGICA DEL SERVICIO
// ---------------------------------------------------------------------------

function registerUser(payload) {
  logDebug("Iniciando registerUser", payload);

  const { nombre, grado, seccion, email, password, telefono, numeroLista } = payload || {};

  if (!nombre || !email || !password) {
    throw new Error("Nombre, email y contraseña son requeridos.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");
  const data = usuariosSheet.getDataRange().getValues();

  const lowerEmail = email.toString().toLowerCase().trim();
  const lowerNombre = nombre.toString().toLowerCase().trim();

  for (let i = 1; i < data.length; i++) {
    const existingNombre = data[i][1]?.toString().toLowerCase().trim();
    const existingEmail = data[i][4]?.toString().toLowerCase().trim();

    if (existingEmail === lowerEmail) {
      return { status: "error", message: "El correo electrónico ya está registrado." };
    }
    if (existingNombre === lowerNombre) {
      return { status: "error", message: "El nombre de usuario ya está registrado." };
    }
  }

  const userId = "USR-" + new Date().getTime();
  const hashedPassword = Utilities
    .computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2))
    .join('');

  usuariosSheet.appendRow([
    userId,
    nombre,
    grado || "",
    seccion || "",
    email,
    hashedPassword,
    "Estudiante",
    telefono || "",
    numeroLista || ""
  ]);

  return {
    status: "success",
    message: "Usuario registrado correctamente",
    userId
  };
}

function updateProfile(payload) {
  const { userId, nombre, email, telefono } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(r => r[0] === userId);

  if (rowIndex === -1) throw new Error("Usuario no encontrado.");

  const row = rowIndex + 1;
  if (nombre) sheet.getRange(row, 2).setValue(nombre);
  if (email) {
    const lowerEmail = email.toString().toLowerCase().trim();
    for (let i = 1; i < data.length; i++) {
      if (i === rowIndex) continue;
      if (data[i][4]?.toString().toLowerCase().trim() === lowerEmail) {
        throw new Error("El correo electrónico ya está en uso.");
      }
    }
    sheet.getRange(row, 5).setValue(email);
  }

  if (sheet.getLastColumn() < 8) {
    sheet.getRange(1, 8).setValue("Teléfono");
  }
  if (telefono !== undefined) sheet.getRange(row, 8).setValue(telefono);

  return { status: "success", message: "Perfil actualizado correctamente." };
}

function changePassword(payload) {
  const { userId, currentPassword, newPassword } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(r => r[0] === userId);

  if (rowIndex === -1) throw new Error("Usuario no encontrado.");

  const hashedPassword = Utilities
    .computeDigest(Utilities.DigestAlgorithm.SHA_256, currentPassword)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2))
    .join('');

  if (data[rowIndex][5] !== hashedPassword) {
    throw new Error("La contraseña actual es incorrecta.");
  }

  const newHashedPassword = Utilities
    .computeDigest(Utilities.DigestAlgorithm.SHA_256, newPassword)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2))
    .join('');

  sheet.getRange(rowIndex + 1, 6).setValue(newHashedPassword);

  return { status: "success", message: "Contraseña actualizada correctamente." };
}

const SECRET_KEY = "IMA_SECRET_PORTAL_2026";

function requestPasswordRecovery(payload) {
  const { email } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetOrThrow(ss, "Usuarios");
  const data = sheet.getDataRange().getValues();

  const lowerEmail = email.toString().toLowerCase().trim();
  const user = data.find(r => r[4]?.toString().toLowerCase().trim() === lowerEmail);

  if (!user) {
    return { status: "success", message: "Si el correo está registrado, recibirás un enlace de recuperación." };
  }

  const userId = user[0];
  const expiration = Date.now() + (3600 * 1000); // 1 hora
  const tokenPayload = `${userId}:${expiration}`;
  const signature = Utilities.computeHmacSha256Signature(tokenPayload, SECRET_KEY)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2))
    .join('');

  const token = Utilities.base64EncodeWebSafe(`${tokenPayload}:${signature}`);

  const recoveryUrl = `https://informatica0101.github.io/forgot-password.html?token=${token}`;

  try {
    MailApp.sendEmail({
      to: email,
      subject: "Recuperación de Contraseña - Portal Informatica IMA",
      htmlBody: `<p>Hola ${user[1]},</p><p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace (válido por 1 hora):</p><p><a href="${recoveryUrl}">${recoveryUrl}</a></p>`
    });
  } catch (e) {
    logDebug("Error enviando email", e.message);
    return { status: "success", message: "Enlace generado (ver logs)", debugLink: recoveryUrl };
  }

  return { status: "success", message: "Correo de recuperación enviado." };
}

function resetPassword(payload) {
  const { token, newPassword } = payload;

  try {
    const decoded = Utilities.newBlob(Utilities.base64DecodeWebSafe(token)).getDataAsString();
    const [userId, expiration, signature] = decoded.split(':');

    if (Date.now() > parseInt(expiration)) {
      throw new Error("El token ha expirado.");
    }

    const tokenPayload = `${userId}:${expiration}`;
    const expectedSignature = Utilities.computeHmacSha256Signature(tokenPayload, SECRET_KEY)
      .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2))
      .join('');

    if (signature !== expectedSignature) {
      throw new Error("Token inválido.");
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getSheetOrThrow(ss, "Usuarios");
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(r => r[0] === userId);

    if (rowIndex === -1) throw new Error("Usuario no encontrado.");

    const newHashedPassword = Utilities
      .computeDigest(Utilities.DigestAlgorithm.SHA_256, newPassword)
      .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2))
      .join('');

    sheet.getRange(rowIndex + 1, 6).setValue(newHashedPassword);

    return { status: "success", message: "Contraseña restablecida correctamente." };

  } catch (e) {
    return { status: "error", message: e.message };
  }
}

function loginUser(payload) {
  logDebug("Iniciando loginUser", { identifier: payload?.identifier });

  const { identifier, password } = payload || {};

  if (!identifier || !password) {
    throw new Error("Email/Usuario y contraseña son requeridos.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");
  const data = usuariosSheet.getDataRange().getValues();

  const hashedPassword = Utilities
    .computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2))
    .join('');

  const lowerIdentifier = identifier.toString().toLowerCase().trim();

  for (let i = 1; i < data.length; i++) {
    const existingNombre = data[i][1]?.toString().toLowerCase().trim();
    const existingEmail = data[i][4]?.toString().toLowerCase().trim();

    if ((existingEmail === lowerIdentifier || existingNombre === lowerIdentifier) && data[i][5] === hashedPassword) {
      return {
        status: "success",
        data: {
          userId: data[i][0],
          nombre: data[i][1],
          grado: data[i][2],
          seccion: data[i][3],
          rol: data[i][6],
          telefono: data[i][7] || "",
          numeroLista: data[i][8] || ""
        }
      };
    }
  }

  return {
    status: "error",
    message: "Credenciales incorrectas"
  };
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

function getStudentsByGradoSeccion(payload) {
  const { grado, seccion } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usuariosSheet = getSheetOrThrow(ss, "Usuarios");
  const data = usuariosSheet.getDataRange().getValues().slice(1);

  const sGrado = normalizeString(grado);
  const sSeccion = normalizeString(seccion);

  const students = data.filter(r => {
    const isStudent = String(r[6] || "").trim() === 'Estudiante';
    const rowGrado = normalizeString(r[2]);
    const rowSeccion = normalizeString(r[3]);

    const matchGrado = rowGrado === sGrado;
    const matchSeccion = !seccion || rowSeccion === sSeccion;
    return isStudent && matchGrado && matchSeccion;
  }).map(r => ({
    userId: r[0],
    nombre: r[1],
    grado: r[2],
    seccion: r[3],
    telefono: r[7] || "",
    numeroLista: r[8] || ""
  }));

  return { status: "success", data: students };
}
