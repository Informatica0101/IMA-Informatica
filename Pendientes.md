# PENDIENTES - FASE 8: AULA VIRTUAL Y GESTIÓN AVANZADA DEL APRENDIZAJE

## PRIORIDAD P1 - CRÍTICA Y MANTENIMIENTO OPERATIVO

---

### [ ] [TAREA-F8-MANT-01] Implementar el seguimiento preventivo de las cuotas y la disponibilidad de almacenamiento en Google Drive
- **Origen del Hallazgo:** `AUDITORIA_FASE_8_AULA_VIRTUAL_APRENDIZAJE.md` / Tarea F8-MANT-01 (P1 · Supervisión de Almacenamiento Drive)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Mantenimiento preventivo y observabilidad)
- **Archivos Involucrados:**
  - `backend/task-service/Code.gs`
  - Componentes de administración, configuración y supervisión
- **Dependencias Expuestas:** Carga de archivos, almacenamiento de materiales, entregas estudiantiles y servicios de supervisión
- **Descripción del Alcance:**
  Verificar periódicamente las cuotas de almacenamiento de Google Drive utilizadas por el aula virtual para materiales, entregas y versiones, detectando riesgos de capacidad antes de que impidan la entrega de trabajos o publicación de contenidos.

  Requisitos Funcionales:
  1. Identificar las ubicaciones y carpetas de Google Drive utilizadas por el servicio para materiales, tareas, entregas y versiones.
  2. Implementar un mecanismo de supervisión periódica que consulte capacidad total, espacio utilizado, espacio disponible y tendencia.
  3. Establecer umbrales configurables de advertencia (e.g. 80%, 90%, 95%) y generar alertas administrativas.
  4. En cargas fragmentadas o fallos por cuota, no confirmar entregas cuyos archivos no se hayan almacenado correctamente.
  5. Evitar archivos huérganos y mostrar mensajes explicativos sin eliminar archivos académicos válidos automáticamente.
  6. Registrar eventos de supervisión distinguiendo entre estado normal, advertencia, riesgo elevado y error confirmado.
- **Criterios de Aceptación:**
  - CA-F8-010: Se identifican y monitorean las ubicaciones de almacenamiento utilizadas por el aula virtual.
  - CA-F8-011: La simulación de cuota cercana al límite genera alertas preventivas para administradores.
  - CA-F8-012: Las cargas fallidas por espacio no se confirman como entregas registradas exitosamente.
- **Estado:** [ ] Pendiente

---

## PRIORIDAD P2 - MEJORAS DE PRODUCTIVIDAD Y ANALÍTICA DE APRENDIZAJE

---

### [ ] [TAREA-F8-OPT-01] Implementar la previsualización integrada de documentos PDF en la revisión de entregas
- **Origen del Hallazgo:** `AUDITORIA_FASE_8_AULA_VIRTUAL_APRENDIZAJE.md` / Tarea F8-OPT-01 (P2 · Previsualización PDF)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Mejora de usabilidad y eficiencia docente)
- **Archivos Involucrados:**
  - `backend/task-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** Sistema existente de entregas, almacenamiento en Google Drive, controles de acceso RBAC
- **Descripción del Alcance:**
  Incorporar un visor integrado de documentos PDF dentro del modal de revisión de entregas para permitir al docente examinar los trabajos adjuntos directamente sin necesidad de descargarlos previamente.

  Requisitos Funcionales:
  1. Abrir la previsualización de archivos PDF adjuntos desde el modal de revisión conservando el contexto del estudiante y la actividad.
  2. Ofrecer controles del visor: navegación entre páginas, indicador de página, zoom, ajuste a ancho y página completa.
  3. Detectar el tipo real del archivo PDF mediante metadatos validados.
  4. Mantener disponibles las opciones de descarga, rúbricas, comentarios cualitativos y asignación de notas.
  5. Reutilizar la autorización RBAC sin convertir recursos privados en enlaces públicos.
  6. Liberar recursos de memoria al cerrar el visor o cambiar de estudiante/archivo.
- **Criterios de Aceptación:**
  - CA-F8-013: Al abrir una entrega con un PDF válido, se muestra el visor directamente dentro del modal.
  - CA-F8-014: Un PDF dañado o no compatible produce un mensaje claro y mantiene la opción de descarga.
  - CA-F8-015: La previsualización no altera la evaluación, rúbrica ni el historial de entregas.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F8-OPT-02] Incorporar estadísticas descriptivas y una visualización de la distribución de calificaciones de exámenes
- **Origen del Hallazgo:** `AUDITORIA_FASE_8_AULA_VIRTUAL_APRENDIZAJE.md` / Tarea F8-OPT-02 (P2 · Analítica de Exámenes)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Ampliación analítica)
- **Archivos Involucrados:**
  - `backend/exam-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** Cuestionarios, resultados de exámenes, libro de calificaciones y permisos docentes
- **Descripción del Alcance:**
  Proporcionar un resumen estadístico descriptivo y un gráfico de distribución de calificaciones por intervalos para cada examen, permitiendo al docente analizar el desempeño del grupo e incluir opcionalmente una curva normal de referencia.

  Requisitos Funcionales:
  1. Filtrar resultados por curso, asignatura, examen, grupo y período académico respetando permisos docentes.
  2. Calcular métricas descriptivas: total de evaluados, pendientes, nota promedio, mediana, mínimo, máximo, desviación estándar y % de aprobación.
  3. Renderizar gráfico de frecuencia por intervalos de puntuación identificando concentración y dispersión.
  4. Incluir curva de distribución normal de referencia únicamente cuando sea estadísticamente pertinente.
  5. Distinguir claramente los datos reales observados de las curvas de referencia.
  6. Garantizar que la generación de estadísticas sea de solo lectura y no altere las calificaciones del libro oficial.
- **Criterios de Aceptación:**
  - CA-F8-016: El informe estadístico y gráfico corresponde exactamente al examen y grupo seleccionado.
  - CA-F8-017: La generación del gráfico de distribución no modifica ni recalcula las notas oficiales.
  - CA-F8-018: Un grupo sin calificaciones muestra un estado vacío comprensible en lugar de un gráfico erróneo.
- **Estado:** [ ] Pendiente
