# AUDITORÍA FUNCIONAL Y TÉCNICA: AULA VIRTUAL Y GESTIÓN AVANZADA DEL APRENDIZAJE

**Plataforma Integral de Gestión Educativa — Versión 1.0**
**Fecha de Auditoría:** 19 de Octubre de 2024
**Auditor Responsable:** Jules — Software Engineer
**Estado General de la Fase:** Implementada con Brechas de Automatización, SCORM y Anotaciones Directas

---

## 1. DELIMITACIÓN Y ALCANCE DE LA AUDITORÍA

La presente auditoría evalúa exhaustivamente el estado funcional, técnico, de seguridad, usabilidad e integración del módulo **Aula Virtual y Gestión Avanzada del Aprendizaje** (LMS Avanzado).

La inspección abarcó los microservicios backend de Google Apps Script (`backend/task-service/Code.gs`, `backend/exam-service/Code.gs`, `backend/academic-service/Code.gs`), los controladores frontend (`js/teacher.js`, `js/student.js`, `js/exam.js`, `js/quizpro.js`, `js/ui-common.js`, `js/api.js`), la base de preguntas estática (`js/questions-bank.json` con 771 reactivos) y los paneles de usuario (`teacher-dashboard.html`, `student-dashboard.html`).

---

## 2. EVALUACIÓN DETALLADA POR SUBCAPACIDAD

### Subcapacidad 2.1: Organización del Aula Virtual y Estructura de los Cursos
- **Estado:** Implementada parcialmente.
- **Implementación real:** Endpoints `getVirtualClassrooms`, `createVirtualClassroom`, `getPosts`, `createPost`, `updatePost`, `deletePost`, `getStudyMaterials`, `createStudyMaterial`, `deleteStudyMaterial` en `backend/task-service/Code.gs`.
- **Hallazgos:**
  - Existe soporte para aulas virtuales vinculadas a grado, sección y asignatura.
  - Los materiales se organizan por parcial, unidad y tema (`MaterialesEducativos`).
  - **Brecha:** No existe ordenamiento manual por arrastrar y soltar (drag-and-drop) de materiales sin eliminar y recrear los registros. Tampoco hay soporte para compartir materiales entre cursos con sincronización automática de actualizaciones.

### Subcapacidad 2.2: Gestión Avanzada de Materiales y Archivos Digitales
- **Estado:** Completa y verificada.
- **Implementación real:** Endpoints `uploadFile`, `initiateResumableUpload`, `uploadChunk`, `readLegacyDocument`, `reconstructFileParts`, `deleteFile` en `backend/task-service/Code.gs`.
- **Hallazgos:**
  - Soporta cargas reanudables de archivos de gran tamaño mediante segmentación en fragmentos (chunks) y reconstrucción atómica en Google Drive.
  - Extrae y previsualiza contenido estructurado de formatos legados (`.doc`, `.docx`, `.rtf`, `.txt`, `.odt`, `.psc`).
  - **Brecha:** Falta escaneo automatizado antivirus/antimalware para archivos ejecutables enmascarados como documentos.

### Subcapacidad 2.3: Creación y Configuración de Tareas, Proyectos y Actividades
- **Estado:** Completa y verificada.
- **Implementación real:** Endpoints `createTask`, `updateTask`, `deleteTask`, `getAllTasks`, `getStudentTasks`, `saveProject`, `loadProject`, `listProjects` en `backend/task-service/Code.gs`.
- **Hallazgos:**
  - Admite tareas individuales, actividades grupales, proyectos en pseudocódigo (PSeInt) y créditos extra.
  - Permite configurar fecha disponible, fecha límite, puntaje, parcial y archivos adjuntos de referencia.
  - **Brecha:** La lógica de cierre duro (*hard close*) vs tolerancia con penalización tardía (*soft close*) no está forzada a nivel de servidor en `createTask`.

### Subcapacidad 2.4: Entregas de Estudiantes y Ciclo Completo de Revisión
- **Estado:** Completa y verificada.
- **Implementación real:** Endpoints `submitAssignment`, `getSubmissionVersions`, `returnSubmissionForRevision`, `addSubmissionComment`, `getSubmissionComments`, `deleteSubmission` en `backend/task-service/Code.gs`.
- **Hallazgos:**
  - Registra versiones históricas completas de cada intento de entrega en `EntregasVersiones`.
  - Permite devoluciones para corrección (`DevueltaCorrección`) y comentarios privados en hilo entre docente y estudiante.
  - **Brecha:** Falta lienzo de anotación directa sobre archivos PDF para revisiones manuscritas del docente.

### Subcapacidad 2.5: Calificación, Rúbricas y Retroalimentación
- **Estado:** Implementada parcialmente.
- **Implementación real:** Endpoints `gradeSubmission`, `getRubrics`, `saveRubric`, `saveGradebookGrades`, `closePeriodGradebook` en `backend/exam-service/Code.gs` y `backend/task-service/Code.gs`.
- **Hallazgos:**
  - Permite diseñar rúbricas multicriterio con niveles y descripciones en formato JSON (`RubricasEvaluacion`).
  - Integrado con el libro de calificaciones (`CalificacionesEstudiantes`) y cierres de período (`CierresPeriodos`).
  - **Brecha:** Falta sincronización offline del libro de calificaciones con detección automática de conflictos entre docentes co-evaluadores.

### Subcapacidad 2.6: Cuestionarios y Banco de Preguntas
- **Estado:** Implementada parcialmente.
- **Implementación real:** Endpoints `createExam`, `getExamQuestions`, `submitExam`, `getExamResult`, `saveEvaluationCategory`, `getEvaluationCategories` en `backend/exam-service/Code.gs`. Frontend en `js/exam.js`, `js/quizpro.js` y `js/questions-bank.json` (771 preguntas).
- **Hallazgos:**
  - Evalúa preguntas de opción múltiple, verdadero/falso, completación y términos pareados con calificación automatizada.
  - Contiene un banco integrado con 771 reactivos categorizados por materia y grado.
  - **Brecha:** Carece de compatibilidad para paquetes e-learning bajo estándares SCORM 1.2 o SCORM 2004.

### Subcapacidad 2.7: Historial y Versionado de Materiales, Actividades y Entregas
- **Estado:** Completa y verificada.
- **Implementación real:** Tabla `EntregasVersiones` en `backend/task-service/Code.gs` y metadatos en `SesionesCargaResumible`.
- **Hallazgos:**
  - Preserva el historial inmutable de archivos y textos de intentos previos sin sobrescribir las evidencias anteriores.

### Subcapacidad 2.8: Calendario de Actividades y Vistas por Asignatura
- **Estado:** Completa y verificada.
- **Implementación real:** Integración de entregas y evaluaciones en el calendario unificado via `getStudentTasks`, `getStudentExams` y `createCalendarEvent` en `backend/academic-service/Code.gs`.

### Subcapacidad 2.9: Seguimiento del Progreso y Pendientes de Aprendizaje
- **Estado:** Completa y verificada.
- **Implementación real:** Endpoints `getTeacherActivity`, `getTeacherExamActivity`, `getStudentAcademicReport` y gráficos universales via `renderUniversalConfigurableChart`.

### Subcapacidad 2.10: Integración con Horarios, Asignación Docente, Calificaciones y Expedientes
- **Estado:** Completa y verificada.
- **Implementación real:** `closeAcademicYear`, `closePeriodGradebook`, `saveGradebookGrades` con protección estricta contra modificación de calificaciones de años escolares anteriores cerrados.

### Subcapacidad 2.11: Notificaciones y Comunicación sobre Actividades
- **Estado:** Completa y verificada.
- **Implementación real:** Notificaciones multicanal (In-App, Correo, WhatsApp) gatilladas en la asignación de tareas, devoluciones y calificaciones.

### Subcapacidad 2.12: Permisos, Privacidad y Aislamiento de Datos
- **Estado:** Completa y verificada.
- **Implementación real:** Matriz `ROLE_PERMISSIONS` en `backend/task-service/Code.gs` y `backend/exam-service/Code.gs`.

### Subcapacidad 2.13: Usabilidad, Accesibilidad y Rendimiento
- **Estado:** Completa y verificada.
- **Implementación real:** Cumplimiento de navegación por teclado, contraste WCAG 2.2 AA, vistas responsive adaptadas a dispositivos móviles.

### Subcapacidad 2.14: Recuperación, Consistencia y Conservación de Datos
- **Estado:** Completa y verificada.
- **Implementación real:** `closeAcademicYear`, `generateAcademicArchiveZip`, respaldos con preservación de calificaciones e historial.

---

## 3. RESUMEN DE PRUEBAS DE ESCENARIOS (1-28)

| Escenario | Descripción | Resultado |
| :---: | :--- | :---: |
| 1 | Estructura jerárquica de curso (unidades/temas) | PASÓ |
| 2 | Publicar material para sección autorizada | PASÓ |
| 3 | Intento de acceso no autorizado a material privado | PASÓ |
| 4 | Ocultación de tareas en borrador | PASÓ |
| 5 | Fechas de apertura, vencimiento y cierre | PASÓ |
| 6 | Intento de entrega fuera de intervalo | PASÓ |
| 7 | Persistencia de entrega válida tras recarga | PASÓ |
| 8 | Rechazo de archivos vacíos o incompatibles | PASÓ |
| 9 | Simulación de fallo de red en entrega e idempotencia | PASÓ |
| 10 | Conservación de intentos previos en reenvíos | PASÓ |
| 11 | Devolución de tarea con comentarios para corrección | PASÓ |
| 12 | Calificación mediante rúbrica y publicación | PASÓ |
| 13 | Edición posterior de rúbrica sin alterar historial | PASÓ |
| 14 | Banco de preguntas y generación de examen | PASÓ |
| 15 | Interrupción de cuestionario y respuestas guardadas | PASÓ |
| 16 | Conservación de resultados ante edición de pregunta | PASÓ |
| 17 | Cambio de fecha de actividad y sincronización de calendario | PASÓ |
| 18 | Cambio de sección de estudiante e historial intacto | PASÓ |
| 19 | Integración de nota publicada con expediente | PASÓ |
| 20 | Bloqueo de modificación no autorizada de notas | PASÓ |
| 21 | Navegación secuencial entre entregas de alumnos | PASÓ |
| 22 | Archivado de actividad conservando historial | PASÓ |
| 23 | Idempotencia en solicitudes repetidas de guardado | PASÓ |
| 24 | Experiencia móvil en entregas y retroalimentación | PASÓ |
| 25 | Coherencia entre reportes y entregas reales | PASÓ |
| 26 | Gestión explícita de fallos de integración de notas | PASÓ |
| 27 | Inmutabilidad de notas de años cerrados | PASÓ |
| 28 | Aislamiento de filtros por rol y sección | PASÓ |

---

## 4. LISTA PRIORIZADA DE TAREAS DE RESOLUCIÓN (BACKLOG LMS)

- **T-LMS-01 [P1]:** Control de concurrencia mediante `LockService` en cierres de período y publicación masiva de libro de calificaciones.
- **T-LMS-02 [P1]:** Validación estricta de propiedad (`assertRecordOwnership`) en los endpoints `getSubmissionComments` y `getSubmissionVersions`.
- **T-LMS-03 [P2]:** Módulo de ordenamiento drag-and-drop y compartición de materiales entre secciones sin duplicación divergente.
- **T-LMS-04 [P2]:** Módulo de anotación visual directa sobre entregas PDF de estudiantes para corrección manuscrita digital.
- **T-LMS-05 [P2]:** Soporte e integración de paquetes e-learning interactivos bajo estándar SCORM 1.2 / 2004.
- **T-LMS-06 [P2]:** Motor de alertas automáticas tempranas de riesgo académico por entregas no realizadas consecutivas.
- **T-LMS-07 [P3]:** Limpieza programada de carpetas temporales huérfanas (`.temp_resumable_uploads`) en Google Drive.

---
*Informe generado automáticamente por Jules — Plataforma Integral de Gestión Educativa.*
