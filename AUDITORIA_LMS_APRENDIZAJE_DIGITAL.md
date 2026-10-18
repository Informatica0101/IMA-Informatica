# INFORME DE AUDITORÍA FUNCIONAL INTEGRAL: FASE 2 - LMS AVANZADO Y APRENDIZAJE DIGITAL

**Plataforma:** Ecosistema Educativo New Generation Christian Academy
**Versión de Plataforma:** v1.0 (Locked Architecture)
**Fecha de Auditoría:** Julio 2026
**Auditor Responsable:** Jules (Software Engineer & Technical Auditor)

---

## 1. RESUMEN EJECUTIVO Y OBJETIVO DE LA AUDITORÍA

El presente informe constituye la auditoría funcional exhaustiva del módulo de aprendizaje digital (LMS Avanzado) de la plataforma educativa New Generation Christian Academy. La investigación inspeccionó exhaustivamente las interfaces visibles (`teacher-dashboard.html`, `student-dashboard.html`, `exam.html`, `interactivo.html`, `pseudocode.html`), los controladores en JavaScript (`js/teacher.js`, `js/student.js`, `js/exam.js`, `js/quizpro.js`, `js/presentation-engine.js`, `js/ui-common.js`), los bancos de datos (`js/questions-bank.json`) y los microservicios backend en Google Apps Script (`backend/task-service/Code.gs`, `backend/exam-service/Code.gs`, `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`).

El objetivo es dictaminar objetivamente qué capacidades están **funcionales**, cuáles están **parcialmente funcionales**, cuáles son **defectuosas**, cuáles están **ausentes** y cuáles son **no verificables**, estableciendo un mapa riguroso de arquitectura para la toma de decisiones en la ampliación de la Fase 5 del proyecto.

---

## 2. EVALUACIÓN DETALLADA POR SECCIÓN TEMÁTICA (SECCIONES 3 A 23)

### 3. Creación y Organización de Cursos
- **Estado:** Parcialmente Funcional.
- **Implementación:** El backend en `backend/task-service/Code.gs` gestiona `AulasVirtuales` (`createVirtualClassroom`, `getVirtualClassrooms`). En el frontend, la navegación jerárquica en `js/teacher.js` (`pushNav`) organiza el acceso mediante Grados -> Secciones -> Asignaturas -> Aula Virtual.
- **Brechas:** Ausencia de flujo para duplicar o clonar cursos de años anteriores; ausencia de asignación de profesores colaboradores/sustitutos dentro del aula virtual; falta de ciclo de vida de archivado formal de cursos al concluir el periodo lectivo.

### 4. Unidades, Temas, Lecciones y Estructura del Contenido
- **Estado:** Parcialmente Funcional.
- **Implementación:** `MaterialesEducativos` (`getStudyMaterials`, `createStudyMaterial`, `deleteStudyMaterial`) permite adjuntar enlaces, documentos y archivos de Drive categorizados por Unidad y Tema.
- **Brechas:** La estructura actual se organiza por etiquetas de texto plano, careciendo de un editor visual en árbol jerárquico (Unidad -> Tema -> Lección); falta control de prerrequisitos entre lecciones (desbloqueo secuencial).

### 5. Banco de Preguntas
- **Estado:** Parcialmente Funcional.
- **Implementación:** El repositorio cuenta con un catálogo de 771 preguntas en `js/questions-bank.json` estructuradas con `Pregunta`, `OpcionA`, `OpcionB`, `OpcionC`, `OpcionD`, `RespuestaCorrecta`, `Asignatura`, `Tema` y `Nivel`. Backend soporta `getQuestionBank` y `saveQuestion`.
- **Brechas:** El banco soporta exclusivamente el tipo "Opción Múltiple" de 4 alternativas. Tipos como Verdadero/Falso, Respuesta Corta, Ensayo, Emparejamiento y Ordenamiento no están implementados en el esquema de datos ni en la UI.

### 6. Exámenes y Cuestionarios Aleatorios
- **Estado:** Funcional.
- **Implementación:** `createExam`, `getExamQuestions`, `submitExam` y `getAllExams` en `backend/exam-service/Code.gs` e integración en `js/exam.js` y `js/quizpro.js`. Permite selección aleatoria de preguntas por tema, límite de tiempo, intento único y calificación automática.
- **Brechas:** Falta soporte para múltiples intentos con políticas de nota más alta o promedio; falta guardado automático de borradores intermedios durante la prueba para recuperación ante desconexión.

### 7. Evaluaciones y Corrección Automática o Manual
- **Estado:** Funcional.
- **Implementación:** Auto-corrección inmediata para exámenes de opción múltiple; calificación manual para entregas de tareas (`gradeSubmission`) con comentarios individuales (`addSubmissionComment`, `getSubmissionComments`) y devoluciones para revisión (`returnSubmissionForRevision`).
- **Brechas:** No existe distinción explícita en la UI entre Nota Cero (0), Pendiente, Ausente y Exento/No Aplicable; falta registro auditable de recalificaciones cuando un docente altera una nota previamente publicada.

### 8. Rúbricas de Evaluación
- **Estado:** Funcional.
- **Implementación:** `RubricasEvaluacion` (`getRubrics`, `saveRubric`) en `backend/exam-service/Code.gs` y diseñador interactivo `#modal-rubric-builder` en `teacher-dashboard.html` / `js/teacher.js` con criterios y niveles de desempeño.
- **Brechas:** Falta visor interactivo previo de la rúbrica en la vista del estudiante (`student-dashboard.html`) antes de realizar la entrega; falta congelamiento de versiones de rúbricas aplicadas a entregas históricas.

### 9. Tareas, Proyectos y Entregas Digitales
- **Estado:** Funcional.
- **Implementación:** `createTask`, `submitAssignment`, `getSubmissionVersions`, `uploadResumableFile` en `backend/task-service/Code.gs` soportan entregas multimodales (texto, enlaces, archivos reanudables hasta 10MB subidos a Google Drive) e historial de versiones.
- **Brechas:** Falta regla configurable de deducción por entregas tardías (% por día de retraso); falta guardado de borrador de entrega.

### 10. Proyectos Grupales y Colaboración
- **Estado:** Ausente.
- **Evidencia:** Las entregas en `backend/task-service/Code.gs` se registran únicamente vinculadas a un `userId` individual. No existe entidad `GruposTrabajo` ni flujo de entrega grupal ni co-evaluación entre pares.

### 11. Portafolios Estudiantiles
- **Estado:** Ausente.
- **Evidencia:** No existe la entidad `PortafoliosEstudiantiles` ni una vista curada de evidencias de aprendizaje en `student-dashboard.html`.

### 12. Compatibilidad con SCORM y Otros Estándares
- **Estado:** Ausente.
- **Evidencia:** No existe procesador de paquetes ZIP SCORM, lector de manifest `imsmanifest.xml` ni modelo CMI en ningún servicio de la plataforma.

### 13. Clases Virtuales y Videoconferencias
- **Estado:** Parcialmente Funcional.
- **Implementación:** Generación y almacenamiento de enlaces de WhatsApp por grado (`getWhatsAppLink`, `saveWhatsAppLink`) e inserción de URLs de videoconferencias en `MaterialesEducativos`.
- **Brechas:** Ausencia de integración automática con Google Meet o Zoom API para creación de salas y registro automatizado de asistencia.

### 14. Seguimiento por Competencias y Objetivos de Aprendizaje
- **Estado:** Parcialmente Funcional.
- **Implementación:** Módulo formativo independiente (`CriteriosInstitucionales`, `EvaluacionesFormativas`) en `backend/user-service/Code.gs` para Conducta, Higiene y Uniforme.
- **Brechas:** Falta mapeo de competencias académicas (Taxonomía de Bloom) sobre asignaturas, tareas y exámenes.

### 15. Detección de Estudiantes que Necesitan Refuerzo
- **Estado:** Parcialmente Funcional.
- **Implementación:** Casos de seguimiento (`getAttendanceFollowupCases`, `saveAttendanceFollowupCase`) y planes de acompañamiento (`saveSupportPlan`, `getSupportPlans`) en `backend/academic-service/Code.gs`.
- **Brechas:** Ausencia de motor de alertas automáticas basado en umbrales académicos (ej. alerta si el promedio cae < 70% o acumula 3 tareas omitidas).

### 16. Recursos con Disponibilidad y Seguimiento de Finalización
- **Estado:** Parcialmente Funcional.
- **Implementación:** Campo `ProgramadoPara` y filtrado por fecha en `backend/task-service/Code.gs`.
- **Brechas:** Falta casilla interactiva "Marcar como completado" para el estudiante y reporte de progreso de lectura.

### 17. Paneles y Experiencia por Rol
- **Estado:** Funcional.
- **Implementación:** Vistas adaptadas para Docente, Estudiante, Tutor y Administrador con control de acceso en servidor (`validateRolePermission`).

### 18. Notificaciones y Avisos de Aprendizaje
- **Estado:** Funcional.
- **Implementación:** Despachador de notificaciones unificadas (`getUnifiedNotifications`, `createUserNotification`) en `backend/user-service/Code.gs` para avisos de tareas publicadas y notas de exámenes.

### 19. Informes y Analítica del Aprendizaje
- **Estado:** Funcional.
- **Implementación:** Generador de reportes institucionales (`generateInstitutionalReport`) y componente de gráficas universales configurables (`window.renderUniversalConfigurableChart` en `js/ui-common.js`).

### 20. Integridad de Datos e Integración Académica
- **Estado:** Funcional.
- **Implementación:** Claves compartidas (`UserId`, `Grado`, `Seccion`, `Asignatura`, `Periodo`) vinculan el LMS con el libro de calificaciones oficial (`CalificacionesEstudiantes`) y el expediente del estudiante.

### 21. Seguridad, Permisos y Protección de Información
- **Estado:** Funcional.
- **Implementación:** `validateRolePermission` en los 5 microservices backend; filtrado server-side de borradores y publicaciones programadas para roles de estudiantes/alumnos.

### 22. Accesibilidad, Uso Móvil y Mensajes al Usuario
- **Estado:** Funcional.
- **Implementación:** PWA precaching (`sw.js`), diseño responsivo Tailwind CSS, etiquetas ARIA, atajos de teclado (tecla ESC) y textos redactados en lenguaje claro sin jerga técnica.

### 23. Herramientas Adicionales Identificadas
- **Implementación:** Subida reanudable por bloques (`uploadResumableFile`), extractor de texto de documentos legados (`readLegacyDocument` para `.doc`, `.docx`, `.rtf`, `.odt`), comparador de entregas (`window.openSubmissionComparer`) y motor de guías interactivas paso a paso (`window.startInteractiveGuide`).

---

## 3. TABLA MATRIZ DE RESULTADOS DE AUDITORÍA (SECCIÓN 24)

| ID | Módulo / Pantalla | Función Evaluada | Estado | Evidencia Concreta | Prueba Realizada y Resultado | Roles Autorizados | Dependencias | Deficiencia Detectada | Acción Recomendada | Prioridad | Criterio Verificable de Resolución |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **LMS-01** | Aulas Virtuales / `teacher-dashboard.html` | Creación de Cursos y Aulas Virtuales | Funcional | `backend/task-service/Code.gs` (l. 1500) | Invocación `createVirtualClassroom` -> Crea fila en `AulasVirtuales` | Admin, Director, Profesor | `Usuarios`, `OfertaAcademica` | Sin duplicación de cursos de años anteriores | Crear asistente de duplicado de curso | Media | Endpoint retorna copia de aula y materiales asociados |
| **LMS-02** | Materiales / `student-dashboard.html` | Organización de Contenidos por Unidad/Tema | Parcial | `backend/task-service/Code.gs` (l. 1600) | Invocación `getStudyMaterials` -> Retorna lista filtrada por aula | Admin, Profesor, Estudiante | `AulasVirtuales` | Filtro por texto plano sin árbol jerárquico visual | Diseñar editor jerárquico Unidad -> Tema -> Lección | Alta | Visualización en árbol desplegable en la UI |
| **LMS-03** | Banco de Preguntas / `exam.html` | Catálogo de Preguntas Reutilizables | Parcial | `js/questions-bank.json` (771 preguntas) | Lectura de catálogo -> Contiene 771 preguntas opción múltiple | Admin, Profesor | `CatalogoAsignaturas` | Soporta únicamente Opción Múltiple (4 opciones) | Ampliar esquema para Verdadero/Falso, Respuesta Corta y Ensayos | Alta | Preguntas de respuesta corta y V/F operativas en exam.js |
| **LMS-04** | Exámenes / `quizpro.js` | Generación y Evaluación Aleatoria de Exámenes | Funcional | `backend/exam-service/Code.gs` (l. 300) | Invocación `getExamQuestions` -> Selecciona preguntas por tema | Admin, Profesor, Estudiante | `Examenes`, `Preguntas` | Un solo intento sin guardado de borrador intermedio | Implementar múltiples intentos y auto-guardado | Alta | Reanudación de intento interrumpido sin pérdida de respuestas |
| **LMS-05** | Tareas / `teacher-dashboard.html` | Entregas Multimodales y Versiones | Funcional | `backend/task-service/Code.gs` (l. 1200) | Invocación `submitAssignment` -> Registra versión en `EntregasVersiones` | Admin, Profesor, Estudiante | `AulasVirtuales`, Drive API | Sin política de deducción porcentual por entrega tardía | Agregar regla de penalización por tardanza | Media | Cálculo automático de descuento en nota por días de retraso |
| **LMS-06** | Rúbricas / `teacher-dashboard.html` | Diseñador de Rúbricas de Evaluación | Funcional | `backend/exam-service/Code.gs` (l. 800) | Invocación `saveRubric` -> Guarda matriz JSON en `RubricasEvaluacion` | Admin, Profesor | `Examenes` | Estudiante no visualiza la rúbrica antes de entregar | Mostrar pestaña "Ver Rúbrica" en entregas del estudiante | Media | Renderizado de la matriz de rúbrica en `student-dashboard.html` |
| **LMS-07** | Proyectos / `student-dashboard.html` | Proyectos Grupales y Colaboración | Ausente | `backend/task-service/Code.gs` | Búsqueda `GruposTrabajo` -> No existen referencias en código | N/A | `Usuarios` | Imposibilidad de realizar entregas grupales o co-evaluación | Crear módulo de Grupos de Trabajo y Entregas Grupales | Baja | Creación de grupo, entrega unificada y notas individuales |
| **LMS-08** | Portafolio / `student-dashboard.html` | Portafolios Estudiantiles Curados | Ausente | `student-dashboard.html` | Búsqueda `Portafolios` -> No existe sección en interfaz | N/A | `EntregasVersiones` | Ausencia de vitrina de evidencias destacadas del alumno | Crear sección Portafolio en Portal del Estudiante | Baja | Selección de evidencias destacadas visible para tutores |
| **LMS-09** | Estándares / `teacher-dashboard.html` | Compatibilidad con Paquetes SCORM | Ausente | Repositorio completo | Búsqueda `SCORM` / `imsmanifest` -> Sin resultados | N/A | Zip Reader API | Incompatibilidad con paquetes educativos interactivos SCORM | Declarar como dependencia externa no requerida actualmente | Baja | Evaluación previa de infraestructura antes de desarrollo |
| **LMS-10** | Videoconferencias / `js/teacher.js` | Integración de Clases Virtuales | Parcial | `js/teacher.js` (l. 1846) | Invocación `getWhatsAppLink` -> Retorna enlace de grupo | Admin, Profesor, Estudiante | `AulasVirtuales` | Enlaces manuales sin integración Google Meet/Zoom | Incorporar creador de enlaces de reunión programada | Media | Enlace de reunión generado con fecha y hora oficial |
| **LMS-11** | Seguimiento / `js/teacher.js` | Detección Automática de Refuerzo | Parcial | `backend/academic-service/Code.gs` (l. 3500) | Invocación `getAttendanceFollowupCases` -> Retorna casos | Admin, Profesor, Orientación | `CalificacionesEstudiantes` | Alertas de casos manuales sin disparadores automáticos | Crear motor de alertas por umbral de notas o tareas | Alta | Alerta visual en dashboard cuando nota < 70% o faltas > 3 |
| **LMS-12** | Recursos / `student-dashboard.html` | Seguimiento de Finalización de Lecciones | Parcial | `backend/task-service/Code.gs` (l. 1700) | Invocación `getStudyMaterials` -> Muestra recursos | Admin, Profesor, Estudiante | `MaterialesEducativos` | No registra si el alumno leyó o completó el material | Añadir botón "Marcar como completado" y barra de avance | Media | Barra de progreso del curso actualizada al 100% |

---

## 4. MAPA DE NAVEGACIÓN Y FLUJOS POR ROL

```
[DOCENTE / PROFESOR]
 ├── Inicio / Dashboard
 ├── Mis Asignaturas & Aulas Virtuales (`pushNav`)
 │    ├── Publicaciones & Anuncios (Crear, Editar, Eliminar, Programar)
 │    ├── Materiales de Estudio (Subir archivos, Drive links, YouTube)
 │    ├── Tareas & Asignaciones (Crear, Calificar, Devolver para corrección)
 │    └── Exámenes & Quizzes (Banco de Preguntas, QuizPro, Rúbricas)
 └── Libro de Calificaciones & Reportes Institucionales

[ESTUDIANTE / ALUMNO]
 ├── Inicio / Mi Panel
 ├── Mis Cursos & Aulas Virtuales
 │    ├── Muro de Anuncios y Comentarios
 │    ├── Materiales de Clase (Descarga y visualización)
 │    ├── Mis Tareas (Entregas multimodales, subir archivos reanudables)
 │    └── Mis Exámenes (Ejecución con tiempo límite, QuizPro)
 └── Mis Calificaciones, Asistencia & Observaciones Formativas

[PADRE / TUTOR / RESPONSABLE]
 ├── Selector de Hijos Vinculados
 ├── Resumen Consolidado Familiar (Tareas pendientes, notas, saldos)
 └── Vista Detallada por Estudiante (Calificaciones, Asistencia, Avisos)
```

---

## 5. INVENTARIO DE INTEGRACIONES, DEPENDENCIAS Y DECISIONES PENDIENTES

1. **Google Drive API (`Documentos_Estudiantes` & `Materiales_Educativos`):**
   - Dependencia: Manejo de blobs y permisos institucionales.
   - Estado: Totalmente integrada en backend mediante cuentas de servicio/Google Apps Script.
2. **Motor de Quizzes & Banco de Preguntas (771 preguntas):**
   - Dependencia: `js/questions-bank.json` y `quizpro.js`.
   - Decisión Pendiente: Definir si se requiere ampliar el esquema de datos de la base para soportar preguntas abiertas/ensayo con corrección docente manual.
3. **Integración con Videoconferencias (Google Meet / Zoom):**
   - Decisión Pendiente: Determinar si la institución utilizará enlaces estáticos/grupos de WhatsApp o si se requiere conectar OAuth2 con Google Workspace para autoreuniones de Google Meet.

---

## 6. PLAN DE TAREAS PROPUESTAS PARA `PENDIENTES.MD`

Se han identificado y estructurado las siguientes tareas de desarrollo independientes para la ampliación de la Fase 5:

1. **`[REQ-LMS-001]` Editor Jerárquico de Unidades, Temas y Lecciones con Seguimiento de Finalización:** Implementación de estructura visual en árbol y casilla "Marcar como completado".
2. **`[REQ-LMS-002]` Ampliación del Banco de Preguntas y Evaluaciones Complejas:** Soporte para preguntas de Respuesta Corta, Ensayo, Verdadero/Falso y guardado automático de borradores durante exámenes.
3. **`[REQ-LMS-003]` Motor de Alertas Automáticas de Refuerzo Académico:** Generación de alertas por umbrales de calificaciones (<70%) o tareas omitidas.
4. **`[REQ-LMS-004]` Programador Integrado de Clases Virtuales:** Gestión de sesiones síncronas con fecha, hora y enlace oficial de videoconferencia.

---

## 7. CONCLUSIÓN Y RECOMENDACIÓN DE ORDEN DE IMPLEMENTACIÓN

El módulo LMS de la plataforma posee una **base técnica de alta calidad, segura y responsiva**, con soporte para aulas virtuales, publicaciones, materiales, tareas con entregas reanudables, exámenes aleatorios y rúbricas.

Se recomienda abordar el desarrollo futuro en el siguiente orden prioritario:
1. `REQ-LMS-001` (Estructura de Unidades y Seguimiento de Finalización).
2. `REQ-LMS-002` (Ampliación de Tipos de Pregunta en Cuestionarios).
3. `REQ-LMS-003` (Motor de Alertas de Refuerzo Académico).
4. `REQ-LMS-004` (Programador de Clases Virtuales).

---
*Esta auditoría se limita exclusivamente al módulo LMS Avanzado y Aprendizaje Digital (Fase 2 de la auditoría). Módulos independientes deben evaluarse en sus respectivas fases.*
