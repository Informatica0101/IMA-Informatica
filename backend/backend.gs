// =================================================================
// CONFIGURACIÓN GLOBAL - ¡ACCIÓN REQUERIDA!
// =================================================================
// REEMPLAZA ESTOS VALORES con los IDs de tu Google Sheet y tu carpeta de Google Drive.
// Encontrarás instrucciones detalladas en el archivo README.md.
const SPREADSHEET_ID = "TU_SPREADSHEET_ID_AQUI";
const DRIVE_FOLDER_ID = "TU_DRIVE_FOLDER_ID_AQUI";

// =================================================================
// FUNCIÓN PRINCIPAL (ROUTER) - CON DEPURACIÓN AVANZADA
// =================================================================
function doPost(e) {
  try {
    if (SPREADSHEET_ID === "TU_SPREADSHEET_ID_AQUI" || DRIVE_FOLDER_ID === "TU_DRIVE_FOLDER_ID_AQUI") {
      throw new Error("Configuración Incompleta: Por favor, introduce tu SPREADSHEET_ID y DRIVE_FOLDER_ID en las primeras líneas del script de backend.");
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!ss) {
      throw new Error(`No se pudo abrir el Google Sheet. Verifica que el SPREADSHEET_ID ('${SPREADSHEET_ID}') sea correcto y que tengas permisos de acceso.`);
    }

    const sheets = {
      usuarios: ss.getSheetByName("Usuarios"),
      tareas: ss.getSheetByName("Tareas"),
      entregas: ss.getSheetByName("Entregas"),
      examenPreguntas: ss.getSheetByName("ExamenPreguntas")
    };

    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    let result;

    switch (action) {
      case "register": result = registerUser(body.payload, sheets); break;
      // ... (resto del router sin cambios)
      case "login": result = loginUser(body.payload, sheets); break;
      case "createTask":
        if (body.payload.tipo === 'Examen') result = createExam(body.payload, sheets);
        else result = createTask(body.payload, sheets);
        break;
      case "gradeSubmission": result = gradeSubmission(body.payload, sheets); break;
      case "getTeacherSubmissions": result = getTeacherSubmissions(body.payload, sheets); break;
      case "getStudentTasks": result = getStudentTasks(body.payload, sheets); break;
      case "getExamQuestions": result = getExamQuestions(body.payload, sheets); break;
      case "submitAssignment": result = submitAssignment(body.payload, sheets); break;
      default: throw new Error("Acción no válida solicitada.");
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: result })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error("Error en doPost:", error.message, error.stack);
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: `Error del Servidor: ${error.message}` })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ... (El resto de las funciones permanecen igual, ya que reciben el objeto 'sheets')
function registerUser(payload, sheets) {
  if (!sheets.usuarios) throw new Error("Configuración incorrecta: La hoja 'Usuarios' no fue encontrada.");

  const { nombre, email, password, grado, seccion } = payload;
  const usersData = sheets.usuarios.getDataRange().getValues();
  if (usersData.some(row => row[2] === email)) throw new Error("El correo electrónico ya está registrado.");

  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  const storedPassword = `${passwordHash}:${salt}`;
  const userId = `USR-${new Date().getTime()}`;

  sheets.usuarios.appendRow([userId, nombre, email, storedPassword, "Estudiante", grado, seccion]);
  return { message: "Usuario registrado exitosamente." };
}

function loginUser(payload, sheets) {
  if (!sheets.usuarios) throw new Error("Configuración incorrecta: La hoja 'Usuarios' no fue encontrada.");
  const { email, password } = payload;
  const usersData = sheets.usuarios.getDataRange().getValues();
  for (let i = 1; i < usersData.length; i++) {
    const row = usersData[i];
    if (row[2] === email) {
      const [storedHash, salt] = row[3].split(':');
      if (hashPassword(password, salt) === storedHash) {
        return { userId: row[0], nombre: row[1], email: row[2], rol: row[4], grado: row[5], seccion: row[6] };
      }
    }
  }
  throw new Error("Correo electrónico o contraseña incorrectos.");
}

function createTask(payload, sheets) {
  if (!sheets.tareas) throw new Error("Configuración incorrecta: La hoja 'Tareas' no fue encontrada.");
  const { tipo, titulo, descripcion, fechaLimite, gradoAsignado, seccionAsignada } = payload;
  const tareaId = `TSK-${new Date().getTime()}`;
  sheets.tareas.appendRow([tareaId, tipo, titulo, descripcion, new Date().toLocaleDateString('es-ES'), fechaLimite, gradoAsignado, seccionAsignada]);
  return { message: "Tarea creada exitosamente." };
}

function createExam(payload, sheets) {
    if (!sheets.tareas) throw new Error("Configuración incorrecta: La hoja 'Tareas' no fue encontrada.");
    if (!sheets.examenPreguntas) throw new Error("Configuración incorrecta: La hoja 'ExamenPreguntas' no fue encontrada.");
    const { tipo, titulo, descripcion, fechaLimite, gradoAsignado, seccionAsignada, preguntas } = payload;
    const tareaId = `TSK-${new Date().getTime()}`;
    sheets.tareas.appendRow([tareaId, tipo, titulo, descripcion, new Date().toLocaleDateString('es-ES'), fechaLimite, gradoAsignado, seccionAsignada]);
    if (preguntas && preguntas.length > 0) {
        preguntas.forEach(p => {
            sheets.examenPreguntas.appendRow([`PREG-${new Date().getTime()}-${Math.random()}`, tareaId, p.tipoPregunta, p.textoPregunta, p.enlaceImagen || ""]);
        });
    }
    return { message: "Examen creado exitosamente." };
}

function getTeacherSubmissions(payload, sheets) {
    if (!sheets.entregas || !sheets.tareas || !sheets.usuarios) throw new Error("Faltan hojas (Entregas, Tareas, Usuarios).");
    const entregasData = sheets.entregas.getDataRange().getValues();
    const tareasData = sheets.tareas.getDataRange().getValues();
    const usuariosData = sheets.usuarios.getDataRange().getValues();
    const tareasMap = new Map(tareasData.map(row => [row[0], row[2]]));
    const usuariosMap = new Map(usuariosData.map(row => [row[0], row[1]]));
    return entregasData.slice(1).map(row => ({
        entregaId: row[0], tareaId: row[1], tituloTarea: tareasMap.get(row[1])||"N/A", userId: row[2],
        nombreAlumno: usuariosMap.get(row[2])||"N/A", fechaEntrega: row[3], enlaceArchivo: row[4], calificacion: row[6]
    })).sort((a,b) => new Date(b.fechaEntrega) - new Date(a.fechaEntrega)).slice(0,20);
}

function gradeSubmission(payload, sheets) {
  if (!sheets.entregas) throw new Error("La hoja 'Entregas' no fue encontrada.");
  const rowIndex = getRowIndexById(sheets.entregas, payload.entregaId, 0);
  if (rowIndex === -1) throw new Error("No se encontró la entrega.");
  sheets.entregas.getRange(rowIndex, 7).setValue(payload.calificacion);
  return { message: "Calificación actualizada." };
}

function getStudentTasks(payload, sheets) {
  if (!sheets.tareas || !sheets.entregas) throw new Error("Faltan las hojas 'Tareas' o 'Entregas'.");
  const { userId, grado, seccion } = payload;
  const allTasks = sheets.tareas.getDataRange().getValues().slice(1);
  const studentSubmissions = sheets.entregas.getDataRange().getValues().slice(1).filter(r => r[2] === userId).map(r => r[1]);
  return allTasks.filter(t => (t[6]===grado && (t[7]===seccion || !t[7])) && !studentSubmissions.includes(t[0]))
                 .map(t => ({ tareaId:t[0], tipo:t[1], titulo:t[2], descripcion:t[3], fechaLimite:t[5] }));
}

function getExamQuestions(payload, sheets) {
    if (!sheets.examenPreguntas) throw new Error("La hoja 'ExamenPreguntas' no fue encontrada.");
    const allQuestions = sheets.examenPreguntas.getDataRange().getValues().slice(1);
    return allQuestions.filter(q => q[1] === payload.tareaId)
                       .map(q => ({ preguntaId:q[0], tareaId:q[1], tipoPregunta:q[2], textoPregunta:q[3], enlaceImagen:q[4] }));
}

function submitAssignment(payload, sheets) {
    if (!sheets.entregas || !sheets.usuarios) throw new Error("Faltan las hojas 'Entregas' o 'Usuarios'.");
    const { userId, tareaId, fileName, fileMimeType, fileData, respuestaTexto } = payload;
    let fileUrl = "";
    if (fileName && fileData) {
        const userRow = sheets.usuarios.getDataRange().getValues().find(row => row[0] === userId);
        if (!userRow) throw new Error("Usuario no encontrado.");
        const studentFolder = getOrCreateFolder(getOrCreateFolder(getOrCreateFolder(DriveApp.getFolderById(DRIVE_FOLDER_ID), userRow[5]), userRow[6]), userRow[1]);
        const file = studentFolder.createFile(Utilities.newBlob(Utilities.base64Decode(fileData), fileMimeType, fileName));
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileUrl = file.getUrl();
    }
    sheets.entregas.appendRow([`ENT-${new Date().getTime()}`, tareaId, userId, new Date(), fileUrl, respuestaTexto || "", "Pendiente"]);
    return { message: "Tarea entregada." };
}

function getOrCreateFolder(p, n){const f=p.getFoldersByName(n);return f.hasNext()?f.next():p.createFolder(n);}
function getRowIndexById(s,id,c){const d=s.getRange(1,c+1,s.getLastRow(),1).getValues();for(let i=0;i<d.length;i++){if(d[i][0]==id)return i+1;}return -1;}
function hashPassword(p,s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,p+s).map(b=>('0'+(b&0xFF).toString(16)).slice(-2)).join('');}
function generateSalt(){return Utilities.getDigest(Utilities.DigestAlgorithm.MD5,Math.random().toString()).map(b=>('0'+(b&0xFF).toString(16)).slice(-2)).join('');}
