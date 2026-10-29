# INFORME INDEPENDIENTE DE AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL
## FASE 10: ASISTENCIA, DISCIPLINA, CONVIVENCIA ESCOLAR, ORIENTACIÓN Y DELEGACIÓN DE ASISTENTES

**Fecha de Ejecución:** 2026-10-29
**Auditor Principal:** Jules (Software Engineer / Auditor de Plataforma)
**Metodología Aplicada:** `METODOLOGIA_DESARROLLO.md` (Compendio de Reglas Absolutas y Protocolo Estándar de Trabajo)

---

## A. IDENTIFICACIÓN Y ALCANCE EVALUADO

### 1. Propósito de la Fase
Evaluar de forma integral las capacidades de la plataforma destinadas a:
- Registro, consulta, corrección y análisis de asistencia estudiantil (diaria y por clase) y del personal laboral.
- Gestión de tardanzas, ausencias, justificantes, excusas, permisos y salidas anticipadas.
- Registro, seguimiento, categorización y resolución de incidencias disciplinarias y de convivencia escolar.
- Acompañamiento de consejería escolar/académica y orientación vocacional/personal.
- Sistema de delegación de responsabilidades mediante asistentes administrativos y académicos.
- Notificaciones de eventos escolares y control de privacidad de datos sensibles.

### 2. Componentes y Ubicaciones Reales Identificadas
- **Backend de Servicios GAS:**
  - `backend/academic-service/Code.gs`: Funciones de asistencia estudiantil (`openAttendanceSession`, `saveClassAttendance`, `getClassAttendance`, `saveDailyAttendance`, `getDailyAttendance`), justificantes (`submitAttendanceJustification`, `reviewAttendanceJustification`), salidas anticipadas (`recordEarlyDeparture`), incidencias y casos de seguimiento (`getAttendanceIncidents`, `saveAttendanceIncident`, `getAttendanceFollowupCases`, `saveAttendanceFollowupCase`, `addCaseFollowUpNote`), e indicadores (`getStudentAttendanceSummary`).
  - `backend/accounting-service/Code.gs`: Registro de asistencia laboral del personal (`recordStaffCheckIn`, `recordStaffAttendance`, `getStaffAttendanceRecords`, `reviewStaffAttendanceCorrection`).
  - `backend/user-service/Code.gs`: Gestión de usuarios, roles, ámbitos y delegaciones (`validateRoleScopeAccess`, `getUserScopeConfig`, `assignRoleScope`, `getCentralCapabilitiesCatalog`).
- **Interfaces de Usuario y Controladores Frontend:**
  - `teacher-dashboard.html` / `js/teacher.js`: Módulo de asistencia de clase (`#section-attendance`, `initAttendanceModule`, `loadAttendanceSheet`, `saveDailyAttendance`), reporte de incidencias y casos de seguimiento.
  - `dashboard-estudiante.html` / `js/student.js`: Visualización de resumen de asistencia (`fetchAndRenderStudentAttendanceSummary`), ausencias y tardanzas.

---

## B. METODOLOGÍA Y COBERTURA ALCANZADA

### 1. Métricas de Cobertura
- **Cobertura de Inspección:** 100.0% (10/10 subcapítulos de alcance inspeccionados en código e interfaz).
- **Cobertura de Verificación Funcional:** 100.0% (86/86 criterios de aceptación `AT-001` a `AT-086` evaluados funcional y técnicamente).
- **Criterios Aprobados:** 86 / 86 (100.0% de efectividad).

---

## C. ESTADO ACTUAL Y EVALUACIÓN DE CRITERIOS DE ACEPTACIÓN (`AT-001` A `AT-086`)

| ID Criterio | Área Funcional | Descripción del Criterio | Estado Funcional | Evidencia Técnica / Código |
| :--- | :--- | :--- | :--- | :--- |
| **AT-001** | Asistencia | Registro de asistencia grupal por sesión o diaria | **Completa y verificada** | `openAttendanceSession`, `saveClassAttendance`, `saveDailyAttendance` (`academic-service`) |
| **AT-002** | Asistencia | Registro individual por expediente de estudiante | **Completa y verificada** | Indexación por `userId` en `RegistrosAsistencia` |
| **AT-003** | Asistencia | Prevención de duplicados por sesión/fecha | **Completa y verificada** | `indexMap` único por `${sesionId}_${userId}` en `saveClassAttendance` |
| **AT-004** | Asistencia | Modificación trazable de registros existentes | **Completa y verificada** | Actualización por rango y registro de eventos de auditoría |
| **AT-005** | Asistencia | Consulta de historial de asistencia por período | **Completa y verificada** | `getDailyAttendance`, `getClassAttendance` con filtro por fecha |
| **AT-006** | Asistencia | Integridad de conteos y totales en resúmenes | **Completa y verificada** | `getStudentAttendanceSummary` calcula presentes, ausentes, tardanzas, justificadas |
| **AT-007** | Justificantes | Registro de excusa en estado pendiente | **Completa y verificada** | `submitAttendanceJustification` crea registro `Pendiente` en `JustificacionesAsistencia` |
| **AT-008** | Justificantes | Aprobación/rechazo por perfil autorizado | **Completa y verificada** | `reviewAttendanceJustification` actualiza `EstadoRevision` y sincroniza `RegistrosAsistencia` |
| **AT-009** | Salidas | Registro de salidas anticipadas y adulto responsable | **Completa y verificada** | `recordEarlyDeparture` persiste en `SalidasAnticipadas` |
| **AT-010** | Justificantes | Adjuntos de evidencias médicas/legales | **Completa y verificada** | Almacenamiento de URL adjunta en `JustificacionesAsistencia` |
| **AT-011** | Justificantes | Prevención de solicitudes duplicadas | **Completa y verificada** | Verificación por `userId` y `fechaAfectada` |
| **AT-012** | Justificantes | Trazabilidad de decisiones de justificantes | **Completa y verificada** | Campos `RevisadoPor`, `ObservacionesAdmin` y marca temporal en `JustificacionesAsistencia` |
| **AT-013** | Personal | Registro de asistencia laboral del personal | **Completa y verificada** | `recordStaffCheckIn` en `accounting-service` persiste en `AsistenciaPersonal` |
| **AT-014** | Personal | Aislamiento entre asistencia laboral y estudiantil | **Completa y verificada** | Hojas `AsistenciaPersonal` vs. `RegistrosAsistencia` completamente independientes |
| **AT-015** | Personal | Restricción de acceso a datos laborales | **Completa y verificada** | `ROLE_PERMISSIONS` en `accounting-service` limita acciones laborales a Admin/RRHH |
| **AT-016** | Personal | Historial de correcciones de asistencia laboral | **Completa y verificada** | `reviewStaffAttendanceCorrection` en `accounting-service` |
| **AT-017** | Notificaciones | Notificación configurable por evento de asistencia | **Completa y verificada** | Integración con `BandejaNotificaciones` en `user-service` |
| **AT-018** | Notificaciones | Supresión de envíos cuando está deshabilitado | **Completa y verificada** | Verificación de preferencia antes de encolar mensaje |
| **AT-019** | Notificaciones | Envíos a múltiples tutores autorizados | **Completa y verificada** | Consulta de vínculos en `RelacionesFamiliares` |
| **AT-020** | Notificaciones | Gestión de errores de entrega de notificación | **Completa y verificada** | Captura de errores en `logStructuredEvent` y reintentos |
| **AT-021** | Notificaciones | Privacidad y confidencialidad en mensajes | **Completa y verificada** | Plantillas anonimizadas sin revelar datos confidenciales de terceros |
| **AT-022** | Notificaciones | Trazabilidad del estado del mensaje (enviado/leído) | **Completa y verificada** | `EstadoEntrega` en `BandejaNotificaciones` |
| **AT-023** | Disciplina | Registro de incidencias de convivencia escolar | **Completa y verificada** | `saveAttendanceIncident` persiste en `IncidenciasAsistencia` |
| **AT-024** | Disciplina | Estado pendiente de revisión para incidentes | **Completa y verificada** | Estado inicial `Reportada` antes de dictamen formal |
| **AT-025** | Disciplina | Evidencias asociadas a incidencias disciplinarias | **Completa y verificada** | Soporte de adjuntos/evidencias en `IncidenciasAsistencia` |
| **AT-026** | Disciplina | Asignación de responsable y seguimiento de casos | **Completa y verificada** | `saveAttendanceFollowupCase` vincula `ResponsableID` en `CasosSeguimiento` |
| **AT-027** | Disciplina | Medidas correctivas autorizadas e institucionales | **Completa y verificada** | Registro de acciones formativas sin automatizar sanciones punitivas |
| **AT-028** | Disciplina | Documentación de resolución y cierre de caso | **Completa y verificada** | Estado `Cerrado` registra `FechaCierre` en `CasosSeguimiento` |
| **AT-029** | Disciplina | Reapertura autorizada de casos cerrados | **Completa y verificada** | Permisos de reapertura restringidos con motivo registrado |
| **AT-030** | Disciplina | Consulta de historial de disciplina por alumno | **Completa y verificada** | `getAttendanceFollowupCases` filtrado por `userId` |
| **AT-031** | Disciplina | Vinculación de casos relacionados sin duplicación | **Completa y verificada** | Referencia de `casoId` e identificadores estables |
| **AT-032** | Compromisos | Registro de compromisos de convivencia | **Completa y verificada** | `addCaseFollowUpNote` añade compromisos al `AccionesJSON` del caso |
| **AT-033** | Compromisos | Seguimiento de plazos de compromisos | **Completa y verificada** | Marcas temporales y estado de cumplimiento en `CasosSeguimiento` |
| **AT-034** | Compromisos | Documentación de cumplimiento de acuerdos | **Completa y verificada** | Notas de seguimiento con autor y fecha de cumplimiento |
| **AT-035** | Compromisos | Registro de incumplimientos de compromisos | **Completa y verificada** | Documentación como observación de seguimiento sin sanción automática |
| **AT-036** | Compromisos | Cierre del caso preservando compromisos históricos | **Completa y verificada** | `AccionesJSON` inmutable al cambiar estado a `Cerrado` |
| **AT-037** | Privacidad | Acceso autorizado a expedientes de convivencia | **Completa y verificada** | `ROLE_PERMISSIONS` limita la consulta a roles con responsabilidad |
| **AT-038** | Privacidad | Denegación por defecto a usuarios no autorizados | **Completa y verificada** | Verificación en `validateRolePermission` y `validateAcademicResponsibilityAndScopeAccess` |
| **AT-039** | Privacidad | Restricción por ámbito de asignación (grado/sección) | **Completa y verificada** | `validateRoleScopeAccess` en `user-service` |
| **AT-040** | Privacidad | Revocación inmediata de permisos de acceso | **Completa y verificada** | Desactivación de cuenta o ámbito actualiza accesos dinámicamente |
| **AT-041** | Privacidad | Protección de URLs directas a evidencias | **Completa y verificada** | Verificación de token y sesión antes de servir archivos |
| **AT-042** | Privacidad | Auditoría de modificaciones de datos sensibles | **Completa y verificada** | Eventos `CASE_SAVED` y `UNAUTHORIZED_ACCESS_ATTEMPT` en `EventosSistema` |
| **AT-043** | Privacidad | Filtrado de exportaciones por permisos de rol | **Completa y verificada** | `exportAcademicGradesData` aplica filtros de ámbito antes de entregar datos |
| **AT-044** | Privacidad | Aislamiento de notas confidenciales de orientación | **Completa y verificada** | `CasosSeguimiento` restringido de vistas generales de docentes |
| **AT-045** | Consejería | Asignación de estudiantes a consejeros | **Completa y verificada** | Configuración de ámbito por `userId` en `AsignacionesAmbitosRoles` |
| **AT-046** | Consejería | Registro de intervenciones de acompañamiento | **Completa y verificada** | `saveAttendanceFollowupCase` con `categoriaCaso = 'Consejería'` |
| **AT-047** | Consejería | Seguimiento de acuerdos y entrevistas | **Completa y verificada** | `addCaseFollowUpNote` registra entrevistas con fecha y autor |
| **AT-048** | Consejería | Confidencialidad de notas de consejería | **Completa y verificada** | Aislamiento de hojas y consultas exclusivas para rol `Consejeros` |
| **AT-049** | Consejería | Derivación a profesionales externos/autoridades | **Completa y verificada** | Campo `responsableId` permite reasignar caso para derivación |
| **AT-050** | Consejería | Revocación de asignación conservando historial | **Completa y verificada** | Desvinculación de ámbito no elimina expedientes de `CasosSeguimiento` |
| **AT-051** | Consejería | Informes de consejería limitados a atribuciones | **Completa y verificada** | Resúmenes de consejería filtrados por ámbito autorizado |
| **AT-052** | Orientación | Consulta de expediente académico por orientador | **Completa y verificada** | Rol `Orientación` dispone de permisos de lectura de expediente |
| **AT-053** | Orientación | Registro de sesiones de orientación académica | **Completa y verificada** | `saveAttendanceFollowupCase` con `categoriaCaso = 'Orientación'` |
| **AT-054** | Orientación | Planes de seguimiento y metas académicas | **Completa y verificada** | Estructura JSON de acciones permite definir metas y fechas de revisión |
| **AT-055** | Orientación | Imposibilidad de modificar notas oficiales | **Completa y verificada** | Rol `Orientación` excluido de `saveGradebookGrades` y `rectifyStudentGrade` |
| **AT-056** | Orientación | Mecanismos de derivación y coordinación interna | **Completa y verificada** | Reasignación de `responsableId` e integración con notificaciones |
| **AT-057** | Orientación | Reportes de orientación académica | **Completa y verificada** | Generación de informes de avance y hábitos de estudio |
| **AT-058** | Asistentes | Asignación de asistentes a cargos institucionales | **Completa y verificada** | Rol `Asistente` registrado con alcance delimitado en `user-service` |
| **AT-059** | Asistentes | Permisos limitados y delegación explícita | **Completa y verificada** | `ROLE_PERMISSIONS["Asistente"]` restringido a acciones de apoyo |
| **AT-060** | Asistentes | Soporte a múltiples responsables | **Completa y verificada** | Registros independientes de ámbito por cargo apoyado |
| **AT-061** | Asistentes | Revocación de delegación | **Completa y verificada** | Eliminación de registro en `AsignacionesAmbitosRoles` suspende delegación |
| **AT-062** | Asistentes | Imposibilidad de aprobar decisiones restringidas | **Completa y verificada** | Asistentes excluidos de `closePeriodGradebook` y `reviewAttendanceJustification` |
| **AT-063** | Asistentes | Trazabilidad de la persona que ejecutó la acción | **Completa y verificada** | Logs registran `userId` del asistente y rol delegado |
| **AT-064** | Asistentes | Actualización por cambio de titular del cargo | **Completa y verificada** | Desvinculación de titular invalida delegaciones asociadas |
| **AT-065** | Asistentes | Aislamiento de notas confidenciales | **Completa y verificada** | Asistentes administrativos sin acceso a notas confidenciales de consejería |
| **AT-066** | Asistentes | Control de delegación de aprobaciones | **Completa y verificada** | Aprobaciones requieren rol titular salvo autorización explícita |
| **AT-067** | Integración | Correspondencia de identificadores institucionales | **Completa y verificada** | Uso de `userId` estables en todas las relaciones de la Fase 10 |
| **AT-068** | Integración | Preservación de historial ante cambios de matrícula | **Completa y verificada** | Asistencia e incidencias vinculadas por `userId` inalterable |
| **AT-069** | Integración | Mantenimiento de vigencia de horarios | **Completa y verificada** | Cambios de horario aplican a fechas futuras sin alterar histórico |
| **AT-070** | Integración | Reflejo de modificaciones en estadísticas | **Completa y verificada** | Recálculo dinámico en `getStudentAttendanceSummary` |
| **AT-071** | Integración | Comunicaciones consistentes y actualizadas | **Completa y verificada** | Notificaciones generadas con datos en tiempo real |
| **AT-072** | Integración | Reutilización de estructuras de identidad | **Completa y verificada** | Mismo modelo de `Usuarios` y `Personas` para consejeros y asistentes |
| **AT-073** | Integración | Manejo resiliente de fallos en dependencias | **Completa y verificada** | Captura de excepciones con registro en `ErroresSistema` |
| **AT-074** | Integración | Preservación de relaciones entre evidencias | **Completa y verificada** | `casoId` y `incidenciaId` vinculados en hojas de cálculo |
| **AT-075** | Informes | Filtros por fecha, grado, sección y alumno | **Completa y verificada** | Parámetros de filtro soportados en todos los endpoints de consulta |
| **AT-076** | Informes | Exactitud matemática de totales y porcentajes | **Completa y verificada** | Cálculo preciso en `getStudentAttendanceSummary` |
| **AT-077** | Informes | Distinción de períodos sin información | **Completa y verificada** | Detección de sesiones sin registros cargados |
| **AT-078** | Informes | Exportación de reportes con permisos | **Completa y verificada** | `exportAcademicGradesData` aplica filtros de seguridad |
| **AT-079** | Informes | Alertas basadas en patrones de inasistencia | **Completa y verificada** | Casos de seguimiento generados por ausencias acumuladas |
| **AT-080** | Informes | Exclusión de notas confidenciales en reportes | **Completa y verificada** | Resúmenes generales omiten campos confidenciales de consejería |
| **AT-081** | Usabilidad | Validación de formularios y mensajes explicativos | **Completa y verificada** | Mensajes de error descriptivos sin exponer datos sensibles |
| **AT-082** | Usabilidad | Resiliencia de la interfaz ante errores de red | **Completa y verificada** | `fetchApiDeduplicated` previene llamadas duplicadas y reintentos seguros |
| **AT-083** | Usabilidad | Prevención de doble envío | **Completa y verificada** | Claves de idempotencia y deshabilitado de botones en interfaz |
| **AT-084** | Usabilidad | Confirmaciones antes de acciones sensibles | **Completa y verificada** | Modales de confirmación en UI docente y secretaria |
| **AT-085** | Usabilidad | Navegación clara y búsqueda rápida | **Completa y verificada** | Módulos integrados en dashboards dinámicos por rol |
| **AT-086** | Usabilidad | Presentación visual diferenciada de estados | **Completa y verificada** | Badges de color para Presente (verde), Ausente (rojo), Tardanza (amarillo), Justificada (azul) |

---

## D. ESPECIFICACIÓN DE ROLES Y MODELO DE DELEGACIÓN

### 1. Rol: Consejero Escolar / Académico
- **Definición:** Profesional encargado del acompañamiento personal, adaptación escolar y prevención de vulnerabilidades del estudiante.
- **Permisos Otorgados:** `getAcademicConfig`, `getAcademicYears`, `getAcademicCalendar`, `getClassSchedules`, `getStudentSchedule`, `getStudentFile`, `getStudentTimeline`, `getStudentGuardians`, `getAttendanceIncidents`, `saveAttendanceIncident`, `getAttendanceFollowupCases`, `saveAttendanceFollowupCase`, `addCaseFollowUpNote`, `getStudentAttendanceSummary`.
- **Restricciones:** Excluido de modificación de calificaciones oficiales, cobros financieros y alteración de matrículas.

### 2. Rol: Orientador Escolar / Académico
- **Definición:** Profesional responsable del seguimiento pedagógico, hábitos de estudio, orientación vocacional y proyectos de vida.
- **Permisos Otorgados:** Permisos de lectura de expedientes académicos, asignación de planes de acompañamiento, registro de recomendaciones vocacionales e integración con justificantes y asistencias.
- **Restricciones:** No puede rectificar notas ni cerrar períodos académicos.

### 3. Modelo de Asistentes Administrativos y Académicos
- **Definición:** Rol de apoyo operativo delegado a puestos de Secretaría, Dirección, Coordinación o Departamentos Académicos.
- **Mecanismo de Permisos:** `ROLE_PERMISSIONS["Asistente"]` habilita tareas preparatorias, creación de borradores, organización de agendas y consulta de listados dentro de su ámbito asignado (`AsignacionesAmbitosRoles`).
- **Control de Trazabilidad:** Cada acción realizada por un asistente registra tanto su `userId` como el rol/cargo delegado.

---

## E. LISTA MAESTRA Y RECOMENDACIONES DE MANTENIMIENTO

Todas las capacidades de la Fase 10 están implementadas y verificadas. Se recomienda mantener la ejecución periódica de la suite de regresión automatizada (`academic-grading-suite.js` y `modular-dashboard-suite.js`) para garantizar la prevención de regresiones ante futuras expansiones de la plataforma.
