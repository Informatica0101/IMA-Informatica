function getTeacherActivity(payload) {
  const usuariosData = usuariosSheet.getDataRange().getValues();
  const tareasData = tareasSheet.getDataRange().getValues();
  const examenesData = examenesSheet.getDataRange().getValues();

  // Obtener entregas de tareas
  const entregasData = entregasSheet.getDataRange().getValues().slice(1);
  const submissions = entregasData.map(entrega => {
    const usuario = usuariosData.find(u => u[0] === entrega[2]);
    const tarea = tareasData.find(t => t[0] === entrega[1]);
    return {
      tipo: 'Tarea',
      entregaId: entrega[0],
      titulo: tarea ? tarea[2] : "Tarea Desconocida",
      alumnoNombre: usuario ? usuario[1] : "Usuario Desconocido",
      fecha: new Date(entrega[3]).toLocaleString(),
      archivoUrl: entrega[4],
      calificacion: entrega[5],
      estado: entrega[6],
      comentario: entrega[7]
    };
  });

  // Obtener entregas de exámenes
  const entregasExamenData = entregasExamenSheet.getDataRange().getValues().slice(1);
  const examSubmissions = entregasExamenData.map(entrega => {
      const usuario = usuariosData.find(u => u[0] === entrega[2]);
      const examen = examenesData.find(ex => ex[0] === entrega[1]);
      return {
          tipo: 'Examen',
          entregaId: entrega[0], // ID de la entrega del examen
          titulo: examen ? examen[1] : "Examen Desconocido",
          alumnoNombre: usuario ? usuario[1] : "Usuario Desconocido",
          fecha: new Date(entrega[3]).toLocaleString(),
          calificacion: entrega[5],
          estado: entrega[6] // Ej: 'Entregado', 'Bloqueado'
      };
  });

  // Combinar y ordenar
  const allActivity = submissions.concat(examSubmissions);
  allActivity.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return { status: "success", data: allActivity };
}
