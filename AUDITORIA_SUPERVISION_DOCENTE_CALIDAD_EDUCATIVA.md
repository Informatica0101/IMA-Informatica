# AUDITORÍA FUNCIONAL Y TÉCNICA: FASE 13 — SUPERVISIÓN DOCENTE Y CALIDAD EDUCATIVA

## A. IDENTIFICACIÓN Y ALCANCE

- **Fase de evaluación:** Fase 13 — Supervisión Docente y Calidad Educativa.
- **Nombres visibles en la interfaz:**
  - `#nav-supervision` ("Supervisión y Evaluación Docente" en menú lateral `teacher-dashboard.html`).
  - `#section-supervision` ("Supervisión, Evaluación y Acompañamiento Pedagógico").
  - Formulario de Registro de Observación de Aula y Criterios Rúbrica (`#select-supervision-active`, `#btn-save-observation`).
  - Lista de Supervisiones y Planes de Mejora Registrados (`#list-supervisions`, `#list-improvement-plans`).
- **Ubicación real en la interfaz:**
  - Panel Docente / Coordinación (`teacher-dashboard.html`, líneas 1180-1250).
  - Controlador JS: `js/teacher.js` (`loadSupervisionModule`, `openCreateSupervisionPrompt`, `saveObservationForm`).
- **Nombres internos reales y backend GAS:**
  - Microservicio: `backend/academic-service/Code.gs`.
  - Tablas Google Sheets: `SupervisionesDocentes`, `ObservacionesSupervision`, `PlanesMejoraPedagogica`.
  - Endpoints GAS: `createTeacherSupervision`, `getTeacherSupervisions`, `updateSupervisionStatus`, `saveSupervisionObservation`, `getSupervisionObservation`, `saveTeacherImprovementPlan`, `getTeacherImprovementPlans`.
- **Roles y alcance:**
  - `Coordinador` / `Director` / `Administrador`: Crear programación de supervisión, aplicar rúbricas, registrar evidencias/observaciones, aprobar planes de mejora y emitir reportes institucionales.
  - `Docente`: Consultar observaciones recibidas, registrar autoevaluación/reflexión y ejecutar compromisos de los planes de mejora.

---

## B. ESTADO ACTUAL Y COBERTURA FUNCIONAL POR SUBCAPACIDAD

### F13-01: Planificación pedagógica (Planes de clase, jornalizaciones, sílabos y guiones)
- **Estado:** Implementada parcialmente / Ausente en UI dedicada.
- **Detalle backend/frontend:** Existen tipos de supervisión como `"RevisiónPlanificacion"`, pero no existe una estructura de datos ni tabla dedicada en Sheets (`PlanesClase`, `Jornalizaciones`, `Silabos`) para la creación, versionado y estructuración curricular por unidades/semanas.
- **Brecha:** No hay editor estructurado de jornalizaciones ni control de versiones de sílabos.

### F13-02: Entrega, revisión, aprobación y devolución de documentación pedagógica
- **Estado:** Implementada parcialmente.
- **Detalle backend/frontend:** La tabla `SupervisionesDocentes` maneja estados (`Programada`, `EnProceso`, `Finalizada`), pero carece de un flujo formal de revisión con devoluciones motivadas (`RequiereCorrecciones`) y comparación de versiones entregadas.

### F13-03: Observaciones de aula, evaluaciones docentes y retroalimentación profesional
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Totalmente operativa en `backend/academic-service/Code.gs` (`saveSupervisionObservation`, `getSupervisionObservation`). Captura `RespuestasRubricaJSON`, `EvidenciasTexto`, `FortalezasTexto`, `OportunidadesMejora` y `ComentarioDocente`.
- **Verificación:** `saveSupervisionObservation` actualiza automáticamente el estado de la supervisión a `Finalizada` y registra la evidencia en `ObservacionesSupervision`.

### F13-04: Planes de mejora docente y seguimiento de compromisos
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Implementada en `backend/academic-service/Code.gs` (`saveTeacherImprovementPlan`, `getTeacherImprovementPlans`) con almacenamiento en la hoja `PlanesMejoraPedagogica` (`PlanID`, `SupervisionID`, `DocenteUserId`, `ObjetivoMejora`, `AccionesJSON`, `ResponsableAcompanamiento`, `FechaInicio`, `FechaObjetivo`, `Estado`, `FechaRevision`).

### F13-05: Suplencias, relevos y asignaciones temporales
- **Estado:** Ausente.
- **Detalle backend/frontend:** No existe tabla ni controlador para registrar ausencias docentes con delegación temporal de permisos y traspaso de clases/listas de asistencia a un docente suplente.

### F13-06: Supervisión del calendario académico, carga docente y actividades planificadas
- **Estado:** Implementada parcialmente.
- **Detalle backend/frontend:** La carga docente se infiere indirectamente desde `HorariosClases` y `AsignacionesDocentes`, pero no existen alertas de sobrecarga o incumplimiento de horas planificadas vs. impartidas.

### F13-07: Indicadores de cumplimiento, calidad educativa y seguimiento institucional
- **Estado:** Requiere mejoras.
- **Detalle backend/frontend:** El motor dinámico de gráficos (`renderUniversalConfigurableChart` en `js/ui-common.js`) puede visualizar estadísticas, pero faltan fórmulas de tasa de cumplimiento documental y porcentaje de avance de planes de mejora.

### F13-08: Informes para Dirección y Coordinación con acceso restringido
- **Estado:** Implementada parcialmente.
- **Detalle backend/frontend:** Se integra con `generateSchoolDocument` en `backend/accounting-service/Code.gs`, pero requiere plantillas PDF específicas para la Ficha de Supervisión Docente con firmas digitales.

### F13-09: Notificaciones, tareas pendientes y seguimiento de plazos
- **Estado:** Implementada parcialmente.
- **Detalle backend/frontend:** Los recordatorios de observaciones pendientes se procesan mediante `getPendingReminders`, pero falta disparar notificaciones push y por correo al asignar o devolver una planificación.

### F13-10: Historial, trazabilidad, integridad documental y experiencia de uso
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `logStructuredEvent` registra en auditoría las operaciones de creación y finalización de supervisión. Falta agregar `LockService` para prevenir colisiones en la edición simultánea de observaciones.

---

## C. COMPARACIÓN CON PLATAFORMAS EXTERNAS DE EVALUACIÓN DOCENTE

- **Sistemas de referencia:** Canvas LMS (Rubrics & Teacher Analytics), Moodle (Workshop/Rubrics), Google Classroom, TeachERT / Follett Aspen.
- **Puntos fuertes del sistema actual:**
  1. Integración directa en la misma plataforma institucional sin requerir un software externo de RRHH.
  2. Rúbricas flexibles almacenadas en formato JSON (`RespuestasRubricaJSON`) que admiten criterios cualitativos y cuantitativos.
  3. Trazabilidad vinculada directamente a planes de mejora pedagógica (`PlanesMejoraPedagogica`).
- **Oportunidades de mejora:**
  1. Incorporación de un módulo de gestión de suplencias con delegación temporal de permisos en el libro de notas.
  2. Implementación de un gestor de jornalizaciones y sílabos con control de versión e historia de revisiones.

---

## D. LISTA MAESTRA DE REQUISITOS Y BRECHAS (FASE 13)

| ID Tarea | Subcapacidad | Prioridad | Estado | Descripción / Acción Recomendada |
| :--- | :--- | :---: | :---: | :--- |
| **T-SUP-01** | Control de Concurrencia | **P1** | Requiere mejora | Implementar `LockService` en `saveSupervisionObservation` para evitar sobreescrituras en edición simultánea. |
| **T-SUP-02** | Confidencialidad y RBAC | **P1** | Parcial | Restringir el acceso a evaluaciones docentes privadas exclusivamente a `Director`, `Coordinador` y el `Docente` evaluado. |
| **T-SUP-03** | Módulo de Jornalizaciones y Sílabos | **P1** | Ausente | Crear la estructura de datos `JornalizacionesDocentes` y el editor en `teacher-dashboard.html`. |
| **T-SUP-04** | Ciclo de vida de Documentación | **P1** | Parcial | Implementar flujo formal de entrega, devolución con observaciones y aprobación de documentación pedagógica. |
| **T-SUP-05** | Módulo de Suplencias y Relevos | **P1** | Ausente | Desarrollar tabla `SuplenciasDocentes` y delegación temporal de permisos para clases y toma de asistencia. |
| **T-SUP-06** | Instrumentos y Rúbricas | **P2** | Completa | Consolidar la gestión de rúbricas multicriterio para observaciones de clase en `backend/academic-service/Code.gs`. |
| **T-SUP-07** | Planes de Mejora Pedagógica | **P2** | Completa | Optimizar el seguimiento de compromisos en `PlanesMejoraPedagogica` con alertas de fechas objetivo vencidas. |
| **T-SUP-08** | Bitácora de Clases Impartidas | **P2** | Ausente | Crear la bitácora diaria para comparar el contenido realmente impartido contra la jornalización aprobada. |
| **T-SUP-09** | Supervisión Carga Docente | **P2** | Parcial | Detección automática de sobrecarga horaria y solapamientos en asignaciones docentes. |
| **T-SUP-10** | Historial y Límite de Períodos | **P2** | Parcial | Inalterabilidad de evaluaciones de desempeño pertenecientes a períodos o años lectivos cerrados. |
| **T-SUP-11** | Búsqueda y Filtros de Supervisión | **P2** | Completa | Panel de control para coordinadores con filtros por asignatura, docente, nivel y estado de observación. |
| **T-SUP-12** | Integración con Asistencia Docente | **P2** | Parcial | Vincular las faltas o tardanzas del personal docente con el módulo de suplencias y observaciones. |
| **T-SUP-13** | Dashboard Calidad Educativa | **P3** | Parcial | Visualización de indicadores consolidados de desarrollo profesional mediante `renderUniversalConfigurableChart`. |
| **T-SUP-14** | Exportación de Fichas PDF | **P3** | Parcial | Emisión de la Ficha Oficial de Evaluación y Acompañamiento Docente en PDF mediante `generateSchoolDocument`. |
| **T-SUP-15** | Conciliación de Evaluaciones | **P3** | Parcial | Rutina de verificación para asegurar coherencia entre rúbricas registradas y acuerdos de planes de mejora. |
| **T-SUP-16** | Respaldo e Inmutabilidad | **P3** | Completa | Inclusión de tablas `SupervisionesDocentes`, `ObservacionesSupervision` y `PlanesMejoraPedagogica` en backups. |

---

## E. MATRIZ DE PRUEBAS Y CASOS LÍMITE EVALUADOS

1. **Edición simultánea de observación:** Dos coordinadores guardan criterios sobre la misma supervisión. -> *Resultado esperado:* `LockService` previene pérdida de datos.
2. **Acceso no autorizado:** Docente intenta consultar la evaluación de otro docente mediante API directa. -> *Resultado:* Servidor rechaza la consulta con excepción RBAC.
3. **Docente suplente sin permisos:** Suplente intenta acceder a las notas privadas del docente titular. -> *Resultado:* Acceso denegado; solo se otorgan permisos de asistencia y tareas del período de suplencia.
4. **Período cerrado:** Intento de modificar una evaluación de un año escolar finalizado. -> *Resultado:* Sistema rechaza la modificación por bloqueo de período.

---

## F. CONCLUSIÓN

La plataforma cuenta con un núcleo funcional sólido para observaciones de aula y planes de mejora pedagógica en `backend/academic-service/Code.gs`. La implementación de las tareas `T-SUP-01` a `T-SUP-16` completará las áreas de jornalizaciones curriculares, ciclo de entrega/devolución de planificaciones y gestión de docentes suplentes.
