// --- CONFIGURACIÓN ---
const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const usuariosSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Usuarios");

// --- PUNTO DE ENTRADA PRINCIPAL ---
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const payload = requestData.payload;

    let result;
    switch (action) {
      case "registerUser":
        result = registerUser(payload);
        break;
      case "loginUser":
        result = loginUser(payload);
        break;
      default:
        result = { status: "error", message: "Acción no reconocida." };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// --- FUNCIONES DE LÓGICA ---

function registerUser(payload) {
  const { nombre, grado, seccion, email, password } = payload;
  const userId = "USR-" + new Date().getTime();

  // Guardar la contraseña en texto plano
  usuariosSheet.appendRow([userId, nombre, grado, seccion, email, password, "Estudiante"]);
  return { status: "success", message: "Usuario registrado." };
}

function loginUser(payload) {
  const { email, password } = payload;

  const data = usuariosSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    // Comparar la contraseña en texto plano
    if (data[i][4] === email && data[i][5] === password) {
      return {
        status: "success",
        data: {
          userId: data[i][0],
          nombre: data[i][1],
          grado: data[i][2],
          seccion: data[i][3],
          rol: data[i][6]
        }
      };
    }
  }
  return { status: "error", message: "Credenciales incorrectas." };
}
