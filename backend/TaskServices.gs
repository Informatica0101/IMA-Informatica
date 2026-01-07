// --- SERVICIOS DE TAREAS Y ENTREGAS ---

/**
 * Crea una nueva tarea en la hoja de cálculo 'Tareas'.
 * @param {object} payload - Los detalles de la tarea a crear.
 * @returns {object} Un objeto con el estado de la operación.
 */
function createTask(payload) {
  logDebug("Iniciando creación de tarea", payload);
  const { tipo, titulo, descripcion, parcial, asignatura, gradoAsignado, seccionAsignada, fechaLimite, tareaOriginalId } = payload;
  const tareaId = "TSK-" + new Date().getTime();

  tareasSheet.appendRow([tareaId, tipo, titulo, descripcion, parcial, asignatura, gradoAsignado, seccionAsignada, fechaLimite, tareaOriginalId || '']);
  logDebug(`Tarea "${titulo}" creada con ID: ${tareaId}`);

  return { status: "success", message: "Tarea creada." };
}

/**
 * Obtiene las tareas asignadas a un estudiante específico.
 * @param {object} payload - Contiene userId, grado y sección del estudiante.
 * @returns {object} Un objeto con el estado y la lista de tareas.
 */
function getStudentTasks(payload) {
  logDebug("Obteniendo tareas para estudiante", payload);
  const { userId, grado, seccion } = payload;

  const tasksData = tareasSheet.getDataRange().getValues().slice(1);
  const entregasData = entregasSheet.getDataRange().getValues().slice(1);

  const studentTasks = tasksData
    .filter(task => {
        const isForStudent = task[6] === grado && (task[7] === seccion || task[7] === "" || !task[7]);
        if (!isForStudent) return false;

        if (task[1] === 'Credito Extra') {
            const tareaOriginalId = task[9];
            if (!tareaOriginalId) return false;
            const entregaOriginal = entregasData.find(e => e[1] === tareaOriginalId && e[2] === userId);
            return entregaOriginal && entregaOriginal[6] === 'Rechazada';
        }
        return true;
    })
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

  logDebug(`Se encontraron ${studentTasks.length} tareas para el usuario ${userId}.`);
  return { status: "success", data: studentTasks.reverse() };
}

/**
 * Procesa la entrega de una tarea de un estudiante.
 * @param {object} payload - Contiene los detalles de la entrega.
 * @returns {object} Un objeto con el estado de la operación.
 */
function submitAssignment(payload) {
  logDebug("Iniciando entrega de tarea", { userId: payload.userId, tareaId: payload.tareaId });
  const { userId, tareaId, parcial, asignatura, fileData, fileName } = payload;

  const userData = usuariosSheet.getDataRange().getValues().find(row => row[0] === userId);
  if (!userData) throw new Error("Usuario no encontrado.");
  const [ , nombre, grado, seccion ] = userData;

  const taskData = tareasSheet.getDataRange().getValues().find(row => row[0] === tareaId);
  if (!taskData) throw new Error("Tarea no encontrada.");
  const [ , , tituloTarea ] = taskData;

  const rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const gradoFolder = getOrCreateFolder(rootFolder, grado);
  const seccionFolder = getOrCreateFolder(gradoFolder, seccion || 'General'); // Fallback para sección
  const alumnoFolder = getOrCreateFolder(seccionFolder, nombre);
  const parcialFolder = getOrCreateFolder(alumnoFolder, parcial);
  const asignaturaFolder = getOrCreateFolder(parcialFolder, asignatura);

  const fileInfo = fileData.split(',');
  const mimeType = fileInfo[0].match(/:(.*?);/)[1];
  const decodedData = Utilities.base64Decode(fileInfo[1]);
  const blob = Utilities.newBlob(decodedData, mimeType, fileName).setName(tituloTarea);
  const file = asignaturaFolder.createFile(blob);
  const fileUrl = file.getUrl();
  logDebug(`Archivo "${fileName}" subido a Drive para el usuario ${userId}. URL: ${fileUrl}`);

  const entregaId = "ENT-" + new Date().getTime();
  entregasSheet.appendRow([entregaId, tareaId, userId, new Date(), fileUrl, '', 'Pendiente', '']);

  return { status: "success", message: "Tarea entregada." };
}

/**
 * Califica una entrega de tarea.
 * @param {object} payload - Contiene el ID de la entrega y la calificación.
 * @returns {object} Un objeto con el estado de la operación.
 */
function gradeSubmission(payload) {
  logDebug("Calificando entrega", payload);
  const { entregaId, calificacion, estado, comentario } = payload;
  const entregasData = entregasSheet.getDataRange().getValues();

  for (let i = 1; i < entregasData.length; i++) {
    if (entregasData[i][0] === entregaId) {
      entregasSheet.getRange(i + 1, 6).setValue(calificacion);
      entregasSheet.getRange(i + 1, 7).setValue(estado);
      entregasSheet.getRange(i + 1, 8).setValue(comentario);
      logDebug(`Entrega ${entregaId} calificada.`);
      return { status: "success", message: "Calificación actualizada." };
    }
  }

  throw new Error("Entrega no encontrada.");
}

/**
 * Obtiene toda la actividad (entregas de tareas y exámenes) para el dashboard del profesor.
 * @returns {object} Un objeto con el estado y la lista de toda la actividad.
 */
function getTeacherActivity() {
  logDebug("Obteniendo actividad para el profesor.");
  const usuariosData = usuariosSheet.getDataRange().getValues();
  const tareasData = tareasSheet.getDataRange().getValues();
  const examenesData = examenesSheet.getDataRange().getValues();

  // Entregas de tareas
  const entregasData = entregasSheet.getDataRange().getValues().slice(1);
  const submissions = entregasData.map(entrega => {
    const usuario = usuariosData.find(u => u[0] === entrega[2]);
    const tarea = tareasData.find(t => t[0] === entrega[1]);
    return {
      tipo: 'Tarea',
      entregaId: entrega[0],
      titulo: tarea ? tarea[2] : "Tarea Desconocida",
      alumnoNombre: usuario ? usuario[1] : "Usuario Desconocido",
      fecha: new Date(entrega[3]),
      archivoUrl: entrega[4],
      calificacion: entrega[5],
      estado: entrega[6],
      comentario: entrega[7]
    };
  });

  // Entregas de exámenes
  const entregasExamenData = entregasExamenSheet.getDataRange().getValues().slice(1);
  const examSubmissions = entregasExamenData.map(entrega => {
      const usuario = usuariosData.find(u => u[0] === entrega[2]);
      const examen = examenesData.find(ex => ex[0] === entrega[1]);
      return {
          tipo: 'Examen',
          entregaId: entrega[0],
          titulo: examen ? examen[1] : "Examen Desconocido",
          alumnoNombre: usuario ? usuario[1] : "Usuario Desconocido",
          fecha: new Date(entrega[3]),
          calificacion: entrega[5],
          estado: entrega[6]
      };
  });

  const allActivity = submissions.concat(examSubmissions);
  allActivity.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const formattedActivity = allActivity.map(item => ({...item, fecha: item.fecha.toLocaleString()}));

  logDebug(`Se encontraron ${formattedActivity.length} actividades en total.`);
  return { status: "success", data: formattedActivity };
}
