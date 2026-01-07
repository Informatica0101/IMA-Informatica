// --- SERVICIOS DE USUARIO ---

/**
 * Registra un nuevo usuario en la hoja de cálculo 'Usuarios'.
 * @param {object} payload - Los datos del usuario a registrar.
 * @returns {object} Un objeto con el estado de la operación.
 */
function registerUser(payload) {
  logDebug("Iniciando registro de usuario", payload);
  const { nombre, grado, seccion, email, password } = payload;

  if (!nombre || !email || !password) {
    throw new Error("Nombre, email y contraseña son requeridos.");
  }

  const userId = "USR-" + new Date().getTime();
  const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
                                  .map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2))
                                  .join('');

  usuariosSheet.appendRow([userId, nombre, grado, seccion, email, hashedPassword, "Estudiante"]);
  logDebug(`Usuario "${nombre}" (${email}) registrado con ID: ${userId}`);

  return { status: "success", message: "Usuario registrado." };
}

/**
 * Autentica a un usuario comparando sus credenciales con las almacenadas.
 * @param {object} payload - Las credenciales del usuario (email, password).
 * @returns {object} Un objeto con el estado y los datos del usuario si es exitoso.
 */
function loginUser(payload) {
  logDebug("Iniciando login de usuario", { email: payload.email });
  const { email, password } = payload;

  if (!email || !password) {
    throw new Error("Email y contraseña son requeridos.");
  }

  const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
                                  .map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2))
                                  .join('');

  const data = usuariosSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    // Compara email (columna 5) y contraseña hasheada (columna 6)
    if (data[i][4] === email && data[i][5] === hashedPassword) {
      const userData = {
        userId: data[i][0],
        nombre: data[i][1],
        grado: data[i][2],
        seccion: data[i][3],
        rol: data[i][6]
      };
      logDebug("Login exitoso para el usuario", userData);
      return { status: "success", data: userData };
    }
  }

  logDebug("Credenciales incorrectas para el email:", email);
  return { status: "error", message: "Credenciales incorrectas." };
}
