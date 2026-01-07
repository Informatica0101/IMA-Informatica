// --- CONFIGURACIÓN ---
const SPREADSHEET_ID = "1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww";
const DRIVE_FOLDER_ID = "1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB";

const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
const usuariosSheet = ss.getSheetByName("Usuarios");
const tareasSheet = ss.getSheetByName("Tareas");
const entregasSheet = ss.getSheetByName("Entregas");
const examenesSheet = ss.getSheetByName("Examenes");
const preguntasSheet = ss.getSheetByName("PreguntasExamen");
const entregasExamenSheet = ss.getSheetByName("EntregasExamen");

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
      case "createExam":
        result = createExam(payload);
        break;
      case "getExamQuestions":
        result = getExamQuestions(payload);
        break;
      case "submitExam":
        result = submitExam(payload);
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
  const { userId, grado, seccion } = payload;
  const tasksData = tareasSheet.getDataRange().getValues().slice(1);
  const entregasData = entregasSheet.getDataRange().getValues().slice(1);

  const studentTasks = tasksData
    .filter(task => task[6] === grado && (task[7] === seccion || task[7] === "" || !task[7]))
    .map(task => {
      const entrega = entregasData.find(e => e[1] === task[0] && e[2] === userId);
      return {
        tareaId: task[0],
        tipo: task[1],
        titulo: task[2],
        descripcion: task[3],
        parcial: task[4],
        asignatura: task[5],
        fechaLimite: task[8],
        entrega: entrega ? {
            calificacion: entrega[5],
            estado: entrega[6],
            comentario: entrega[7]
        } : null
      };
    });

  return { status: "success", data: studentTasks.reverse() };
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
  // Se añade "Pendiente" como estado inicial en la columna G
  entregasSheet.appendRow([entregaId, tareaId, userId, fechaEntrega, fileUrl, '', 'Pendiente', '']);

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
      calificacion: entrega[5],
      estado: entrega[6],
      comentario: entrega[7]
    };
  });

  return { status: "success", data: submissions.reverse() }; // Mostrar las más recientes primero
}

function gradeSubmission(payload) {
  const { entregaId, calificacion, estado, comentario } = payload;
  const entregasData = entregasSheet.getDataRange().getValues();

  for (let i = 1; i < entregasData.length; i++) {
    if (entregasData[i][0] === entregaId) {
      // Columna F (6) es Calificación, G (7) es Estado, H (8) es Comentario
      entregasSheet.getRange(i + 1, 6).setValue(calificacion);
      entregasSheet.getRange(i + 1, 7).setValue(estado);
      entregasSheet.getRange(i + 1, 8).setValue(comentario);
      return { status: "success", message: "Calificación actualizada." };
    }
  }

  return { status: "error", message: "Entrega no encontrada." };
}

function createExam(payload) {
  const { titulo, asignatura, gradoAsignado, seccionAsignada, fechaLimite, preguntas } = payload;

  // 1. Crear el examen principal
  const examenId = "EXM-" + new Date().getTime();
  examenesSheet.appendRow([examenId, titulo, asignatura, gradoAsignado, seccionAsignada, fechaLimite]);

  // 2. Añadir las preguntas
  preguntas.forEach(p => {
    const preguntaId = "PRE-" + new Date().getTime() + Math.random();
    // La estructura de la fila ahora es flexible
    preguntasSheet.appendRow([
      preguntaId,
      examenId,
      p.preguntaTipo,
      p.textoPregunta,
      JSON.stringify(p.opciones || {}), // Guardar opciones como JSON
      p.respuestaCorrecta
    ]);
  });

  return { status: "success", message: "Examen creado exitosamente." };
}

// --- FUNCIONES AUXILIARES ---

function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD") // Descomponer acentos
    .replace(/[\u0300-\u036f]/g, "") // Eliminar diacríticos
    .replace(/[^a-z0-9]/g, ''); // Eliminar caracteres no alfanuméricos
}

function getExamQuestions(payload) {
  const { examenId } = payload;
  const todasLasPreguntas = preguntasSheet.getDataRange().getValues().slice(1);
  const preguntasDelExamen = todasLasPreguntas
    .filter(p => p[1] === examenId)
    .map(p => ({
      preguntaId: p[0],
      preguntaTipo: p[2],
      textoPregunta: p[3],
      opciones: JSON.parse(p[4] || '{}')
    }));
  return { status: "success", data: preguntasDelExamen };
}

function submitExam(payload) {
  const { examenId, userId, respuestas } = payload;
  const todasLasPreguntas = preguntasSheet.getDataRange().getValues().slice(1);
  const preguntasDelExamen = todasLasPreguntas.filter(p => p[1] === examenId);

  let correctas = 0;
  const resultadosDetallados = [];

  respuestas.forEach(resp => {
    const pregunta = preguntasDelExamen.find(p => p[0] === resp.preguntaId);
    if (!pregunta) return;

    const respuestaCorrecta = pregunta[5];
    const tipo = pregunta[2];
    let esCorrecta = false;

    if (tipo === 'completacion') {
      esCorrecta = normalizeString(resp.respuestaEstudiante) === normalizeString(respuestaCorrecta);
    } else if (tipo === 'verdadero_falso' || tipo === 'opcion_multiple') {
      esCorrecta = resp.respuestaEstudiante === respuestaCorrecta;
    }
    // Tipos 'termino_pareado' y 'respuesta_breve' se omiten de la calificación automática por simplicidad.

    if (esCorrecta) correctas++;
    resultadosDetallados.push({
      preguntaId: resp.preguntaId,
      respuestaEstudiante: resp.respuestaEstudiante,
      esCorrecta: esCorrecta
    });
  });

  const calificacionTotal = (correctas / preguntasDelExamen.length) * 100;
  const entregaExamenId = "EEX-" + new Date().getTime();

  entregasExamenSheet.appendRow([
    entregaExamenId,
    examenId,
    userId,
    new Date(),
    JSON.stringify(resultadosDetallados),
    calificacionTotal.toFixed(2)
  ]);

  return { status: "success", message: `Examen entregado. Calificación: ${calificacionTotal.toFixed(2)}%` };
}
