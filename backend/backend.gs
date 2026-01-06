// --- CONFIGURACIÓN ---
const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DRIVE_FOLDER_ID = "1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB";

const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
const usuariosSheet = ss.getSheetByName("Usuarios");
const tareasSheet = ss.getSheetByName("Tareas");
const entregasSheet = ss.getSheetByName("Entregas");

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
      case "createTask":
        result = createTask(payload);
        break;
      case "getStudentTasks":
        result = getStudentTasks(payload);
        break;
      case "submitAssignment":
        result = submitAssignment(payload);
        break;
      case "getTeacherSubmissions":
        result = getTeacherSubmissions(payload);
        break;
      case "gradeSubmission":
        result = gradeSubmission(payload);
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
  const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
                                  .map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2))
                                  .join('');

  usuariosSheet.appendRow([userId, nombre, grado, seccion, email, hashedPassword, "Estudiante"]);
  return { status: "success", message: "Usuario registrado." };
}

function loginUser(payload) {
  const { email, password } = payload;
  const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
                                  .map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2))
                                  .join('');

  const data = usuariosSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === email && data[i][5] === hashedPassword) {
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

function createTask(payload) {
  const { tipo, titulo, descripcion, parcial, asignatura, gradoAsignado, seccionAsignada, fechaLimite } = payload;
  const tareaId = "TSK-" + new Date().getTime();
  tareasSheet.appendRow([tareaId, tipo, titulo, descripcion, parcial, asignatura, gradoAsignado, seccionAsignada, fechaLimite]);
  return { status: "success", message: "Tarea creada." };
}

function getStudentTasks(payload) {
  const { grado, seccion } = payload;
  const tasksData = tareasSheet.getDataRange().getValues();
  const studentTasks = [];

  // Empezar desde 1 para saltar la cabecera
  for (let i = 1; i < tasksData.length; i++) {
    const task = tasksData[i];
    // task[6] es gradoAsignado, task[7] es seccionAsignada
    if (task[6] === grado && (task[7] === seccion || task[7] === "" || !task[7])) {
      studentTasks.push({
        tareaId: task[0],
        tipo: task[1],
        titulo: task[2],
        descripcion: task[3],
        parcial: task[4],
        asignatura: task[5],
        fechaLimite: task[8]
      });
    }
  }

  return { status: "success", data: studentTasks };
}

function getOrCreateFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

function submitAssignment(payload) {
  const { userId, tareaId, parcial, asignatura, fileData, fileName } = payload;

  // 1. Obtener datos del usuario
  const userData = usuariosSheet.getDataRange().getValues().find(row => row[0] === userId);
  if (!userData) throw new Error("Usuario no encontrado.");
  const [ , nombre, grado, seccion ] = userData;

  // 2. Obtener datos de la tarea
  const taskData = tareasSheet.getDataRange().getValues().find(row => row[0] === tareaId);
  if (!taskData) throw new Error("Tarea no encontrada.");
  const [ , , tituloTarea ] = taskData;

  // 3. Crear jerarquía de carpetas
  const rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const gradoFolder = getOrCreateFolder(rootFolder, grado);
  const seccionFolder = getOrCreateFolder(gradoFolder, seccion);
  const alumnoFolder = getOrCreateFolder(seccionFolder, nombre);
  const parcialFolder = getOrCreateFolder(alumnoFolder, parcial);
  const asignaturaFolder = getOrCreateFolder(parcialFolder, asignatura);

  // 4. Decodificar y guardar el archivo
  const fileInfo = fileData.split(',');
  const mimeType = fileInfo[0].match(/:(.*?);/)[1];
  const decodedData = Utilities.base64Decode(fileInfo[1]);
  const blob = Utilities.newBlob(decodedData, mimeType, fileName).setName(tituloTarea); // Renombrar
  const file = asignaturaFolder.createFile(blob);
  const fileUrl = file.getUrl();

  // 5. Registrar entrega
  const entregaId = "ENT-" + new Date().getTime();
  const fechaEntrega = new Date();
  entregasSheet.appendRow([entregaId, tareaId, userId, fechaEntrega, fileUrl, '']); // Calificación vacía

  return { status: "success", message: "Tarea entregada." };
}

function getTeacherSubmissions(payload) {
  const entregasData = entregasSheet.getDataRange().getValues();
  const usuariosData = usuariosSheet.getDataRange().getValues();
  const tareasData = tareasSheet.getDataRange().getValues();

  const submissions = entregasData.slice(1).map(entrega => {
    const usuario = usuariosData.find(u => u[0] === entrega[2]);
    const tarea = tareasData.find(t => t[0] === entrega[1]);

    return {
      entregaId: entrega[0],
      tareaTitulo: tarea ? tarea[2] : "Tarea Desconocida",
      alumnoNombre: usuario ? usuario[1] : "Usuario Desconocido",
      fechaEntrega: new Date(entrega[3]).toLocaleString(),
      archivoUrl: entrega[4],
      calificacion: entrega[5]
    };
  });

  return { status: "success", data: submissions.reverse() }; // Mostrar las más recientes primero
}

function gradeSubmission(payload) {
  const { entregaId, calificacion } = payload;
  const entregasData = entregasSheet.getDataRange().getValues();

  for (let i = 1; i < entregasData.length; i++) {
    if (entregasData[i][0] === entregaId) {
      entregasSheet.getRange(i + 1, 6).setValue(calificacion); // La columna F es la 6
      return { status: "success", message: "Calificación actualizada." };
    }
  }

  return { status: "error", message: "Entrega no encontrada." };
}
