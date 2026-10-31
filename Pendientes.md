<!-- Regla del Backlog: Las tareas deben estar ordenadas estrictamente por su nivel de importancia y severidad en orden descendente, asignando identificadores consecutivos en formato F10-TaskXX. -->
# PENDIENTES - FASE 10: ASISTENCIA, DISCIPLINA, CONVIVENCIA ESCOLAR, ORIENTACIÓN Y DELEGACIÓN DE ASISTENTES

## TAREAS CRÍTICAS (P0 - SEVERIDAD MÁXIMA, SEGURIDAD, PRIVACIDAD Y CONFIDENCIALIDAD DE EXPEDIENTES SENSIBLES)

---

### [X] [F10-Task01] Fortalecer la confidencialidad y el control de acceso a expedientes sensibles
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea F10-Task01 (P0) y Tarea 10.7
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Privacidad, confidencialidad y protección de datos sensibles)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/exam-service/Code.gs`
- **Dependencias Expuestas:** Expediente del estudiante, casos de seguimiento y permisos por rol
- **Descripción del Alcance:**
  Garantizar el aislamiento estricto de las notas confidenciales y expedientes de consejería/orientación respecto a docentes generales y personal no autorizado.
  Requisitos Funcionales:
  1. Establecer permisos diferenciados para consultar, crear, modificar, revisar, aprobar, cerrar, reabrir, exportar, eliminar y consultar evidencias.
  2. Verificar que las notas de seguimiento de consejería sólo sean accesibles para los roles autorizados (`Consejeros`, `Orientación`, `Dirección`).
  3. Bloquear consultas directas a la hoja `CasosSeguimiento` por identificadores manipulados.
  4. Anonimizar o filtrar observaciones confidenciales en reportes generales de asistencia o expediente.
  5. Si existen disputas o requerimientos contradictorios entre el nivel de visibilidad institucional y la confidencialidad del profesional, implementar parámetros de visibilidad configurables en la plataforma (`ConfiguracionAcademica`) para definir el nivel de restricción por departamento.
- **Criterios de Aceptación:**
  - Un docente no puede consultar notas confidenciales de consejería de un alumno.
  - Las consultas no autorizadas registran eventos `UNAUTHORIZED_ACCESS_ATTEMPT`.
  - Las configuraciones de visibilidad disputadas son parametrizables desde la plataforma.
- **Estado:** [X] Completado

---

# PENDIENTES - FASE 11: COMUNICACIÓN, BIENESTAR ESTUDIANTIL, SUPERVISIÓN DOCENTE Y GESTIÓN FINANCIERA

## TAREAS CRÍTICAS (P0 - SEVERIDAD MÁXIMA, SEGURIDAD, CONFIDENCIALIDAD E INTEGRIDAD FINANCIERA)

---

### [X] [F11-Task01] Fortalecer la seguridad, privacidad y aislamiento de expedientes de bienestar estudiantil
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área II (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Privacidad y protección de datos sensibles de menores)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** CasosSeguimiento, RegistrosOrientacion, AsignacionesAmbitosRoles
- **Descripción del Alcance:**
  Garantizar el aislamiento estricto de notas confidenciales de orientación y casos de bienestar respecto a docentes generales, bloqueando accesos por identificador manipulado y registrando auditoría `UNAUTHORIZED_ACCESS_ATTEMPT`.
- **Criterios de Aceptación:**
  - Un docente sin rol autorizado no puede consultar notas privadas de orientación de un estudiante.
- **Estado:** [X] Completado

---

### [X] [F11-Task02] Garantizar la integridad de los registros contables y el flujo de autorizaciones financieras
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área IV (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Integridad contable, prevención de fraude)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** AsientosContables, OrdenesCompra, ComprobantesEgresos
- **Descripción del Alcance:**
  Asegurar el principio de partida doble, validar el equilibrio entre débitos y créditos en cada asiento contable e implementar autorizaciones financieras multinivel según límites de monto antes de la afectación presupuestaria.
- **Criterios de Aceptación:**
  - Todo asiento desequilibrado es rechazado y las compras mayores al umbral requieren aprobación formal de Dirección.
- **Estado:** [X] Completado

---

## TAREAS DE ALTA PRIORIDAD (P1 - COMUNICACIÓN, CALENDARIOS, ALERTAS, SUPERVISIÓN Y CONTROL FINANCIERO)

---

### [X] [F11-Task03] Implementar el centro unificado de comunicaciones, mensajes institucionales y avisos
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área I (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Comunicación institucional)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `js/secretary.js` / `js/principal.js`
- **Dependencias Expuestas:** MensajeriaInstitucional, BandejaNotificaciones
- **Descripción del Alcance:**
  Desarrollar la mensajería institucional contextual organizada por estudiante, grupo o trámite, permitiendo conversaciones bidireccionales con trazabilidad y adjuntos seguros.
- **Criterios de Aceptación:**
  - Los mensajes quedan vinculados al contexto original (expediente/trámite) y solo son consultables por participantes autorizados.
- **Estado:** [X] Completado

---

### [X] [F11-Task04] Implementar el gestor de noticias, anuncios, circulares y comunicados con vigencia
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área I (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Difusión e información escolar)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** ComunicadosInstitucionales
- **Descripción del Alcance:**
  Permitir publicar avisos, circulares y convocatorias con segmentación por destinatarios, estado de borrador/programado, fechas de vigencia e indicadores visuales de urgencia.
- **Criterios de Aceptación:**
  - Los comunicados programados o vencidos no se presentan a usuarios fuera de su rango de vigencia.
- **Estado:** [X] Completado

---

### [X] [F11-Task05] Desarrollar el motor de confirmaciones de lectura, respuestas y solicitudes de autorización
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área I (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Autorizaciones familiares)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** ConfirmacionesLectura, SolicitudesAutorizacion
- **Descripción del Alcance:**
  Gestionar el ciclo de vida de solicitudes de autorización para permisos/actividades (Pendiente, Leído, Aceptado, Rechazado, Vencido), vinculando las respuestas con el apoderado o tutor legal responsable.
- **Criterios de Aceptación:**
  - La autorización registra timestamp y usuario responsable, impidiendo modificaciones extemporáneas.
- **Estado:** [X] Completado

---

### [X] [F11-Task06] Desarrollar la gestión de calendarios institucionales, convocatorias y prevención de traslapes
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área I (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Planificación y eventos)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** EventosCalendario
- **Descripción del Alcance:**
  Permitir la creación y consulta de eventos institucionales y académicos, previniendo choques de horario para los mismos espacios o participantes.
- **Criterios de Aceptación:**
  - El sistema detecta e informa incompatibilidades de horario al agendar reuniones.
- **Estado:** [X] Completado

---

### [X] [F11-Task07] Fortalecer la gestión de citas de orientación y acompañamiento estudiantil
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área II (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Acompañamiento y bienestar)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** CitasOrientacion, CasosSeguimiento
- **Descripción del Alcance:**
  Gestionar la programación de citas de orientación estudiantil y entrevistas familiares con estados (Programada, Realizada, Reincidencia, Cancelada) y derivación inmutable.
- **Criterios de Aceptación:**
  - Las citas quedan ligadas al caso de seguimiento sin exponer motivos confidenciales en notificaciones públicas.
- **Estado:** [X] Completado

---

### [X] [F11-Task08] Desarrollar el sistema de alertas tempranas de rendimiento académico y deserción escolar
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área II (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Prevención de reprobación y deserción)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** AlertasTempranas
- **Descripción del Alcance:**
  Evaluar métricas combinadas de ausentismo, reprobación parcial e incumplimiento de tareas para disparar alertas preventivas a coordinadores y orientadores.
- **Criterios de Aceptación:**
  - Las alertas de riesgo se generan según umbrales institucionales sin duplicar notificaciones activas.
- **Estado:** [X] Completado

---

### [X] [F11-Task09] Completar la gestión de planificación pedagógica, jornalizaciones y guiones docentes
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área III (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Gestión pedagógica)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** PlanificacionesPedagogicas
- **Descripción del Alcance:**
  Permitir el registro y estructuración de planes de clase, jornalizaciones y sílabos vinculados con grado, seccion, asignatura y período académico.
- **Criterios de Aceptación:**
  - Las planificaciones conservan versión, docente titular y competencias asociadas.
- **Estado:** [X] Completado

---

### [X] [F11-Task10] Implementar el flujo de entrega, observaciones y aprobación de documentación docente
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área III (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Supervisión académica)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** RevisionesPlanificacion
- **Descripción del Alcance:**
  Gestionar el ciclo de revisión de documentos docentes (Pendiente, EnRevision, RequiereCorrecciones, Aprobado) permitiendo a coordinadores registrar observaciones y evaluar reenvíos.
- **Criterios de Aceptación:**
  - Las aprobaciones quedan ligadas a la versión exacta del documento y al coordinador aprobador.
- **Estado:** [X] Completado

---

### [X] [F11-Task11] Desarrollar el sistema de observaciones, rúbricas de supervisión y evaluaciones pedagógicas
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área III (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Calidad docente)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** SupervisiónPedagógica
- **Descripción del Alcance:**
  Configurar rúbricas y pautas de observación en aula, registrar evaluaciones pedagógicas a docentes y definir compromisos de desarrollo profesional.
- **Criterios de Aceptación:**
  - El docente puede consultar la retroalimentación sin alterar la pauta de evaluación registrada por la dirección.
- **Estado:** [X] Completado

---

### [X] [F11-Task12] Implementar el sistema de suplencias temporales y relevos docentes con alcance acotado
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área III (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Continuidad académica)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** SustitucionesDocentes
- **Descripción del Alcance:**
  Asignar suplentes temporales ante ausencias docentes, otorgando acceso acotado a las secciones del titular sin alterar el nombramiento original ni conceder acceso a otros grupos.
- **Criterios de Aceptación:**
  - Al concluir el período de suplencia, los accesos temporales son revocados automáticamente.
- **Estado:** [X] Completado

---

### [X] [F11-Task13] Desarrollar la conciliación bancaria asistida y pareo automático de extractos
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área IV (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Control de tesorería)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** ConciliacionBancaria
- **Descripción del Alcance:**
  Permitir importar movimientos bancarios y compararlos contra ingresos/egresos internos, identificando partidas concilidadas y diferencias pendientes.
- **Criterios de Aceptación:**
  - El sistema marca los movimientos pareados y genera la hoja de trabajo de conciliación del mes.
- **Estado:** [X] Completado

---

### [X] [F11-Task14] Desarrollar el control presupuestario y alertas de sobregiro por centro de costo
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área IV (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Gestión presupuestaria)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** PresupuestosInstitucionales
- **Descripción del Alcance:**
  Comparar montos presupuestados vs ejecutados por departamento/centro de costo, emitiendo alertas cuando un gasto comprometa la partida asignada.
- **Criterios de Aceptación:**
  - Se genera una advertencia o bloqueo presupuestario cuando una solicitud excede el presupuesto disponible.
- **Estado:** [X] Completado

---

### [X] [F11-Task15] Integrar la gestión de becas y exoneraciones con los estados de cuenta estudiantiles
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área IV (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Finanzas estudiantiles)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** BecasDescuentos, CuentasPorCobrar
- **Descripción del Alcance:**
  Aplicar reglas automáticas de becas y descuentos aprobados sobre los cobros periódicos de colegiatura en los estados de cuenta de los estudiantes.
- **Criterios de Aceptación:**
  - La mensualidad refleja de forma transparente el arancel base, el descuento/beca aplicado y el saldo neto a pagar.
- **Estado:** [X] Completado

---

## TAREAS DE PRIORIDAD MEDIA Y COBERTURA (P2 - REPORTES, INDICADORES Y SUITE DE REGRESIÓN)

---

### [ ] [F11-Task16] Ampliar los reportes contables, balance de comprobación y estado de resultados
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área IV (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Informes financieros)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** LibroMayor, ReportesFinancieros
- **Descripción del Alcance:**
  Generar estados financieros consolidados (Balance General, Estado de Resultados, Libro Diario, Libro Mayor) filtrados por período y ejercicio fiscal.
- **Criterios de Aceptación:**
  - Los reportes financieros concuerdan exactamente con las sumas de los asientos contables registrados.
- **Estado:** [ ] Pendiente

---

### [ ] [F11-Task17] Ampliar los indicadores de calidad educativa y cumplimiento pedagógico
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Área III (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Métricas institucionales)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** IndicadoresCalidad
- **Descripción del Alcance:**
  Consolidar métricas agregadas de cumplimiento de planificaciones, cobertura de contenidos por asignatura y avance del calendario académico.
- **Criterios de Aceptación:**
  - Los indicadores muestran estadísticas globales por nivel/departamento sin exponer datos confidenciales individuales.
- **Estado:** [ ] Pendiente

---

### [ ] [F11-Task18] Desarrollar la suite de pruebas de regresión e integración de la Fase 11
- **Origen del Hallazgo:** `AUDITORIA-FASE-11-COMUNICACION-BIENESTAR-SUPERVISION-FINANZAS.md` / Fase 11 (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Aseguramiento de calidad)
- **Archivos Involucrados:**
  - `backend/developer-service/Code.gs`
  - `tests/regression/academic-grading-suite.js`
- **Dependencias Expuestas:** Suites de pruebas del desarrollador
- **Descripción del Alcance:**
  Incorporar `runPhase11CommunicationWelfareSupervisionAndFinanceRegressionSuite` para verificar automáticamente los contratos y reglas de las 4 áreas de la Fase 11.
- **Criterios de Aceptación:**
  - La suite valida los 18 componentes funcionales de la Fase 11 con 100% de éxito.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ALTA PRIORIDAD (P1 - MEJORAS OPERATIVAS, ASISTENCIA, DISCIPLINA, ROLES ESPECIALIZADOS Y REGRESION)

---

### [X] [F10-Task02] Completar la verificación integral de los 86 criterios de aceptación de la Fase 10
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.18 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Calidad funcional, verificación y evidencias)
- **Archivos Involucrados:**
  - `tests/regression/academic-grading-suite.js`
  - `tests/regression/modular-dashboard-suite.js`
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Criterios AT-001 a AT-086 de la Fase 10
- **Descripción del Alcance:**
  Verificar que cada criterio declarado en la Fase 10 disponga de evidencia reproducible, diferenciando la existencia de código de la ejecución efectiva de pruebas.
- **Criterios de Aceptación:**
  - Los 86 criterios de la Fase 10 disponen de trazabilidad y evidencias reproducibles.
- **Estado:** [X] Completado

---

### [X] [F10-Task03] Fortalecer el modelo de asistencia y su configuración institucional
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.1 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Configuración institucional de asistencia)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `js/config.js`
- **Dependencias Expuestas:** RegistrosAsistencia, SesionesAsistencia y reglas de cómputo
- **Descripción del Alcance:**
  Incorporar o completar una configuración institucional de asistencia que permita definir modalidades de registro (diaria, por clase, por período), estados, códigos, categorías y reglas de cómputo de minutos/horas sin modificar el código fuente.
- **Criterios de Aceptación:**
  - La institución puede configurar códigos y reglas de cómputo de asistencia dinámicamente.
- **Estado:** [X] Completado

---

### [X] [F10-Task04] Optimizar el registro masivo de asistencia y la gestión de sesiones
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.2 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Optimización y registro masivo)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `js/teacher.js`
- **Dependencias Expuestas:** SesionesAsistencia, RegistrosAsistencia
- **Descripción del Alcance:**
  Permitir registrar la asistencia de un grupo completo en una sola vista, aplicar estados masivos, manejar guardado parcial, control de concurrencia y recuperación de sesiones interrumpidas.
- **Criterios de Aceptación:**
  - El registro de grupos numerosos es eficiente, no produce duplicados y permite reintentos seguros.
- **Estado:** [X] Completado

---

### [X] [F10-Task05] Ampliar la gestión de justificaciones, permisos y salidas anticipadas
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.3 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Justificaciones y salidas)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `js/secretary.js` / `js/teacher.js`
- **Dependencias Expuestas:** JustificacionesAsistencia, SalidasAnticipadas
- **Descripción del Alcance:**
  Establecer el ciclo de vida completo de solicitudes (Borrador, Presentada, Pendiente, Requiere información, Aprobada, Rechazada, Cancelada), vincular solicitudes con sesiones afectadas y registrar retiradas de alumnos por adultos autorizados.
- **Criterios de Aceptación:**
  - Las justificaciones y salidas aplican transiciones de estado estrictas y actualizan dinámicamente la asistencia.
- **Estado:** [X] Completado

---

### [X] [F10-Task06] Desarrollar un sistema avanzado de alertas de asistencia y seguimiento preventivo
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea F10-Task02 (P1) y Tarea 10.4
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Comunicaciones, alertas y prevención de deserción)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** BandejaNotificaciones, CasosSeguimiento, RelacionesFamiliares
- **Descripción del Alcance:**
  Permitir configurar reglas de alerta por ausencias acumuladas, tardanzas repetidas y porcentajes de asistencia, notificar a tutores autorizados de forma configurable y evitar notificaciones duplicadas por reintentos.
- **Criterios de Aceptación:**
  - Las alertas de inasistencia se generan según umbrales configurados y se notifican a los tutores legales registrados.
- **Estado:** [X] Completado

---

### [X] [F10-Task07] Completar el ciclo de vida de las incidencias de convivencia escolar
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.5 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Convivencia y disciplina)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** IncidenciasAsistencia, CasosSeguimiento
- **Descripción del Alcance:**
  Establecer un ciclo de vida transparente para incidencias disciplinarias (Reportada, Pendiente revisión, En investigación, Confirmada, Cerrada, Reabierta) diferenciando reportes iniciales de decisiones institucionales y medidas correctivas.
- **Criterios de Aceptación:**
  - Las incidencias cumplen el ciclo de vida completo sin aplicar sanciones automáticas prematuras.
- **Estado:** [X] Completado

---

### [X] [F10-Task08] Estructurar el seguimiento de compromisos, intervenciones y evidencias
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.6 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Seguimiento de acuerdos y evidencias)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** CasosSeguimiento
- **Descripción del Alcance:**
  Normalizar los compromisos y seguimientos dentro de estructuras estables e independientes, permitiendo evaluar plazos, estados de cumplimiento y evidencias adjuntas sin perder historial.
- **Criterios de Aceptación:**
  - Cada compromiso posee identificador inmutable y permite seguimiento individual.
- **Estado:** [X] Completado

---

### [X] [F10-Task09] Completar el modelo funcional de consejería escolar
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.8 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Acompañamiento escolar y consejería)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** CasosSeguimiento, AsignacionesAmbitosRoles
- **Descripción del Alcance:**
  Desarrollar el flujo completo para consejeros escolares: asignación de alumnos, programación de citas, actas de seguimiento, notas de confidencialidad y derivaciones a otros profesionales.
- **Criterios de Aceptación:**
  - Los consejeros gestionan acompañamientos con privacidad y derivación inmutable.
- **Estado:** [X] Completado

---

### [X] [F10-Task10] Completar el modelo funcional de orientación académica y vocacional
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.9 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Orientación vocacional y proyectos de aprendizaje)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** ExpedientesEstudiantes, CasosSeguimiento
- **Descripción del Alcance:**
  Permitir a los orientadores diseñar planes de seguimiento académico, fijar metas de aprendizaje y registrar recomendaciones vocacionales sin alterar las notas oficiales ni matrículas.
- **Criterios de Aceptación:**
  - Los orientadores registran metas académicas e informes sin permisos de alteración de calificaciones oficiales.
- **Estado:** [X] Completado

---

### [X] [F10-Task11] Completar la delegación de responsabilidades para asistentes administrativos y académicos
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea F10-Task03 (P1) y Tarea 10.10
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Delegación de funciones, roles y auditoría de asistentes)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** AsignacionesAmbitosRoles, log de eventos de auditoría
- **Descripción del Alcance:**
  Consolidar el modelo de delegación para asistentes administrativos y académicos, definiendo responsabilidades granulares por cargo (Dirección, Secretaría, Coordinación) con registro de doble identidad (ejecutor y titular delegado) y posibilidad de revocar delegaciones sin alterar historial.
- **Criterios de Aceptación:**
  - Las operaciones de los asistentes identifican al autor real y al titular delegado, bloqueando autorizaciones restringidas.
- **Estado:** [X] Completado

---

### [X] [F10-Task12] Optimizar las notificaciones y las comunicaciones escolares
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.11 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Comunicaciones y deduplicación)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** BandejaNotificaciones
- **Descripción del Alcance:**
  Implementar claves de deduplicación por evento/destinatario, plantillas anonimizadas y reintentos seguros para la mensajería de asistencia y convivencia.
- **Criterios de Aceptación:**
  - Las notificaciones escolares aplican deduplicación estricta y protección de privacidad.
- **Estado:** [X] Completado

---

### [X] [F10-Task13] Mejorar la gestión de evidencias y documentos sensibles
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.14 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Almacenamiento de archivos y seguridad)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/task-service/Code.gs`
- **Dependencias Expuestas:** Google Drive API, justificaciones y casos de seguimiento
- **Descripción del Alcance:**
  Validar formatos/tamaños de archivos adjuntos en justificantes e incidencias, verificar permisos antes de servir archivos y controlar sustituciones o borrados lógicos.
- **Criterios de Aceptación:**
  - Los archivos de evidencia están protegidos contra descargas por URL directas sin autenticación.
- **Estado:** [X] Completado

---

### [X] [F10-Task14] Optimizar el rendimiento, la recuperación y la consistencia de los servicios
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.15 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Rendimiento, latencia y resiliencia)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `js/api.js`
- **Dependencias Expuestas:** Lotes de datos e idempotencia
- **Descripción del Alcance:**
  Optimizar consultas batch de asistencia, reducir operaciones repetitivas en Google Sheets y controlar la concurrencia en modificaciones simultáneas.
- **Criterios de Aceptación:**
  - Las operaciones masivas operan dentro de los umbrales de latencia establecidos.
- **Estado:** [X] Completado

---

### [X] [F10-Task15] Ampliar las pruebas automatizadas y la cobertura de regresión de la Fase 10
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.16 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Calidad de código y suites de regresión)
- **Archivos Involucrados:**
  - `tests/regression/academic-grading-suite.js`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** Suites de pruebas de la plataforma
- **Descripción del Alcance:**
  Incorporar pruebas automatizadas de integración y unitarias para los flujos de asistencia, justificantes, salidas anticipadas, incidencias, consejería, orientación y delegaciones.
- **Criterios de Aceptación:**
  - La suite de regresión valida automáticamente las reglas y contratos de la Fase 10.
- **Estado:** [X] Completado

---

## TAREAS DE PRIORIDAD MEDIA (P2 - INFORMES Y ASISTENCIA LABORAL DEL PERSONAL)

---

### [X] [F10-Task16] Ampliar los informes de asistencia, convivencia y seguimiento
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.12 (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Informes, reportes y estadísticas)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** RegistrosAsistencia, CasosSeguimiento
- **Descripción del Alcance:**
  Incorporar informes consolidados de asistencia por clase/día, tardanzas acumuladas, incidencias por estado y resumen de compromisos respetando los permisos de rol.
- **Criterios de Aceptación:**
  - Los reportes aplican los filtros seleccionados y excluyen información confidencial de consejería.
- **Estado:** [X] Completado

---

### [X] [F10-Task17] Optimizar el registro de asistencia laboral del personal
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.13 (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Asistencia de personal laboral)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** AsistenciaPersonal
- **Descripción del Alcance:**
  Optimizar el registro de entrada/salida laboral de empleados, gestión de marcas incompletas y correcciones con trazabilidad sin mezclar datos con la asistencia estudiantil.
- **Criterios de Aceptación:**
  - El registro de asistencia laboral se mantiene aislado e íntegro respecto a los registros académicos.
- **Estado:** [X] Completado

---

### [X] [F10-Task18] Completar la documentación funcional y operativa de la Fase 10
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea 10.17 (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Documentación funcional)
- **Archivos Involucrados:**
  - `docs/architecture/`
- **Dependencias Expuestas:** Especificaciones operativas
- **Descripción del Alcance:**
  Documentar las modalidades de asistencia, tablas de transiciones de incidencias y modelos de delegación para la consulta institucional.
- **Criterios de Aceptación:**
  - La documentación funcional refleja con exactitud las capacidades operativas de la Fase 10.
- **Estado:** [X] Completado

---

# PENDIENTES - FASE 15: PAGOS ESCOLARES, COBROS, RECAUDACIÓN Y FACTURACIÓN FISCAL

## TAREAS CRÍTICAS (P0 - SEVERIDAD MÁXIMA, CUMPLIMIENTO TRIBUTARIO SAR, INTEGRIDAD Y GENERACIÓN MASIVA)

---

### [ ] [F15-Task01] Corrección del motor de facturación fiscal SAR, clasificación tributaria y control de CAI
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección E (Brecha E.2) y Sección J (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Cumplimiento fiscal tributario SAR, prevención de sanciones legales e integridad documental)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `FacturasFiscales`
  - `ConceptosCobro`
  - `dashboard-contabilidad.html`
  - `js/accounting.js`
- **Dependencias Expuestas:** `ConceptosCobro`, `FacturasFiscales`, `ROLE_PERMISSIONS`, motor de emisión documental CUV
- **Descripción del Alcance:**
  El motor `createFiscalInvoice` aplica actualmente un cálculo genérico del 15% de ISV sin diferenciar adecuadamente la naturaleza tributaria de cada concepto. Además, no dispone de controles suficientes para impedir la emisión de documentos con un CAI vencido, agotado o fuera de su rango autorizado.
  Requerimientos Funcionales Detallados:
  1. Clasificación tributaria de conceptos:
     - Incorporar a `ConceptosCobro` los siguientes atributos obligatorios: `TipoTributario` (Exento, Gravado, No Sujeto), `TasaISV` (porcentaje aplicable), `CodigoTributario` (clasificación interna), `FechaVigenciaTributaria`, y `RequiereValidacionFiscal`.
     - Permitir configurar el tratamiento tributario individualmente para cada concepto desde la plataforma. Si existen disputas o cambios en la normativa tributaria sobre el tratamiento de un concepto, este debe ser 100% configurable sin alterar código duro.
     - Clasificar matrícula y colegiaturas conforme al tratamiento fiscal aplicable a los servicios educativos (Artículo 15 de la Ley del ISV de Honduras).
     - Permitir clasificar uniformes, materiales, transporte y servicios extracurriculares según su tratamiento tributario correspondiente.
     - No asumir que todos los conceptos educativos o relacionados con el colegio comparten automáticamente la misma condición fiscal.
  2. Cálculo tributario desglosado:
     - Calcular separadamente subtotal exento, subtotal gravado, ISV y total general.
     - Aplicar la tasa correspondiente a cada concepto de forma atómica.
     - Evitar que un concepto exento genere impuestos por defecto.
     - Permitir facturas mixtas que contengan simultáneamente conceptos exentos y gravados.
     - Conservar el desglose tributario original inmutable en la factura emitida.
  3. Administración de autorizaciones CAI:
     - Registrar CAI, rango inicial, rango final, fecha de autorización y fecha límite de emisión.
     - Controlar el número correlativo siguiente protegiéndolo con candados atómicos `LockService`.
     - Impedir emisiones cuando el CAI esté vencido o el rango autorizado esté agotado.
     - Alertar visual y programáticamente cuando el rango disponible esté próximo a agotarse (umbral configurable, ej. últimos 50 números).
     - Permitir administrar diferentes rangos autorizados y sus respectivos estados (`Activo`, `Agotado`, `Vencido`, `Inactivo`).
     - Mantener el historial de autorizaciones anteriores sin sobrescribirlas.
  4. Separación de documentos:
     - Diferenciar recibos internos de caja y facturas fiscales; no considerarlos equivalentes.
     - Mantener correlativos independientes para recibos y facturas fiscales.
     - Evitar que la generación de un recibo interno consuma un número del rango fiscal del SAR.
     - Vincular ambos documentos al mismo pago cuando corresponda.
  5. Validaciones fiscales:
     - No permitir modificar retrospectivamente la clasificación tributaria de una factura emitida.
     - Exigir un proceso de corrección fiscal documentado.
     - Validar RTN (14 dígitos en Honduras), datos del receptor y campos fiscales obligatorios.
     - Mantener la información histórica de las tasas y reglas aplicadas al momento exacto de la emisión.
- **Criterios de Aceptación:**
  - Una colegiatura clasificada como exenta no genera ISV bajo ninguna circunstancia.
  - Un concepto gravado aplica la tasa configurada exactamente.
  - Una factura mixta presenta correctamente los importes exentos y gravados desglosados.
  - Una factura no puede emitirse con CAI vencido (lanza error `CAI_EXPIRED`).
  - Una factura no puede superar el rango autorizado (lanza error `CAI_RANGE_EXHAUSTED`).
  - Dos usuarios que intenten emitir simultáneamente no pueden recibir el mismo correlativo.
  - Los recibos internos y las facturas fiscales mantienen numeraciones independientes garantizadas.
  - Una factura emitida conserva su desglose tributario original aunque posteriormente cambie la configuración del concepto en la base de datos.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task02] Motor de generación masiva, programada y recurrente de mensualidades escolares
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección E (Brecha E.1) y Sección J (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Ciclo de cobranza institucional, prevención de omisiones e integridad financiera)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `CargosEstudiante`
  - `TarifasPlanPago`
  - `DescuentosBecas`
  - `dashboard-contabilidad.html`
  - `js/accounting.js`
- **Dependencias Expuestas:** `TarifasPlanPago`, `CargosEstudiante`, `Matriculas`, `Usuarios`, `DescuentosBecas`, `LockService`
- **Descripción del Alcance:**
  Actualmente los cargos se generan principalmente durante la admisión o matrícula individual. No existe un proceso integral para generar las mensualidades de todos los estudiantes activos de un período académico de forma recurrente y masiva.
  Requerimientos Funcionales Detallados:
  1. Configuración del ciclo de cobros:
     - Permitir configurar un calendario de cobros por año lectivo (cantidades de cuotas, fechas de generación, fechas de vencimiento y períodos de gracia).
     - Permitir diferentes calendarios por nivel, grado, sección o modalidad educativa parametrizables desde la plataforma.
     - Admitir mensualidades con importes diferentes según el período (ej. meses con arancel diferenciado o cuotas extraordinarias).
     - Permitir suspender o modificar futuras generaciones sin alterar cargos históricos ya asentados.
  2. Generación masiva:
     - Crear la función `generateBatchMonthlyCharges` en `backend/accounting-service/Code.gs`.
     - Permitir seleccionar: Año lectivo, mes o período de cobro, nivel educativo, grado, sección, estudiantes individuales o grupos completos, y fecha de vencimiento.
     - Obtener las tarifas correspondientes desde `TarifasPlanPago`.
     - Identificar automáticamente los estudiantes matriculados y activos en el período.
     - Excluir estudiantes retirados, trasladados o con matrícula cancelada a la fecha efectiva.
     - Aplicar becas y descuentos aprobados (`applyApprovedScholarshipsToCharges`).
     - Crear los cargos con identificadores individuales únicos (`CRG-...`).
     - Vincular cada cargo al estudiante, año lectivo, tarifa y período correspondiente.
  3. Simulación previa:
     - Antes de generar cargos, presentar una vista previa interactiva que muestre cantidad de estudiantes afectados, desglose por concepto, descuentos aplicables, estudiantes sin tarifa configurada, estudiantes con cargos ya generados, importe total a cargar y posibilidad de excluir estudiantes antes de confirmar.
  4. Protección contra duplicados y consistencia:
     - Crear una clave única lógica basada en estudiante, concepto, período y año lectivo (`studentId_concepto_periodo_anoLectivo`).
     - No depender exclusivamente del nombre del concepto para identificar duplicados.
     - Impedir que dos ejecuciones simultáneas creen el mismo cargo mediante candado de script.
     - Registrar el identificador de la ejecución masiva (`BATCH-CRG-...`).
     - Permitir reanudar procesos interrumpidos sin repetir cargos previamente creados.
     - Generar un informe de registros creados, omitidos y fallidos.
  5. Automatización periódica:
     - Permitir programar generaciones mediante activadores basados en tiempo de Apps Script (cron mensual).
     - Modo dual: generación manual asistida y modo desatendido programado.
     - Permitir desactivar temporalmente la automatización desde la plataforma.
     - Evitar que una ejecución automática genere cargos fuera del calendario configurado.
  6. Control administrativo:
     - Registrar quién autorizó la generación, fecha, hora, período y parámetros utilizados, guardando el historial de ejecuciones.
- **Criterios de Aceptación:**
  - Se pueden generar mensualidades para toda una cohorte con una sola operación atómica.
  - Se pueden generar cargos segmentados por grado, sección o estudiante.
  - Se aplican correctamente las tarifas y beneficios vigentes de cada alumno.
  - No se generan cargos duplicados al reintentar la operación.
  - Una interrupción de red o de cuota no obliga a repetir el proceso completo ni duplica los cargos creados.
  - Se puede consultar el resultado y métricas de cada lote de ejecución masiva.
  - Un estudiante retirado no recibe mensualidades posteriores a la fecha efectiva de retiro.
  - Los cargos históricos permanecen intactos cuando se modifica una tarifa futura.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task03] Sistema integral de anulaciones, reversión de pagos, notas de crédito y reembolsos
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección E (Brecha E.3) y Sección J (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Integridad contable, reversión de pagos, control tributario SAR y prevención de fraude)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `FacturasFiscales`
  - `PagosAbonos`
  - `CargosEstudiante`
  - `MovimientosCajaBancos`
  - `AsientosContables`
  - `NotasCreditoFiscales`
- **Dependencias Expuestas:** `FacturasFiscales`, `PagosAbonos`, `CargosEstudiante`, `MovimientosCajaBancos`, `AsientosContables`, `NotasCreditoFiscales`
- **Descripción del Alcance:**
  No existe un flujo completo para revertir operaciones financieras, devolver dinero, corregir documentos fiscales o anular cargos con trazabilidad inmutable.
  Requerimientos Funcionales Detallados:
  1. Anulación de cargos:
     - Implementar `voidCharge` en `backend/accounting-service/Code.gs`.
     - Permitir anular cargos pendientes exigiendo motivo obligatorio (mínimo 10 caracteres) y observaciones.
     - Registrar usuario, fecha, hora y autorización inmutable.
     - Impedir la eliminación física de la fila (borrado lógico: `estado = 'Anulado'`).
     - Bloquear la anulación directa de cargos con pagos asociados en `PagosAbonos`.
     - Exigir un procedimiento de reversión o regularización previa cuando existan abonos.
  2. Reversión de pagos:
     - Implementar `reversePayment`.
     - Identificar el pago original y todos los cargos afectados.
     - Revertir sus aplicaciones sin eliminar el movimiento histórico.
     - Restituir los saldos pendientes correspondientes en `CargosEstudiante`.
     - Registrar la operación inversa en caja y contabilidad.
     - Evitar que una reversión se ejecute más de una vez mediante control de estado.
     - Permitir reversión total y reversión parcial documentada.
  3. Notas de crédito fiscales SAR:
     - Crear la estructura y hoja `NotasCreditoFiscales` en `getOrCreateSheet`.
     - Implementar `issueFiscalCreditNote`.
     - Vincular cada nota de crédito obligatoriamente con la factura original autorizada.
     - Registrar motivo, importe, fecha, receptor y referencia fiscal SAR.
     - Incorporar los datos de autorización fiscal exigidos: CAI propio de notas de crédito, rango autorizado y fecha límite.
     - Permitir notas de crédito totales y parciales.
     - Conservar el documento original y el documento correctivo intactos.
     - Impedir emitir notas que excedan el saldo fiscal susceptible de acreditación.
  4. Devoluciones monetarias y reembolsos:
     - Implementar `processPaymentRefund`.
     - Permitir devoluciones totales y parciales registrando método de devolución, cuenta bancaria o caja de egreso y responsable autorizador.
     - Generar un documento interno de egreso en `MovimientosCajaBancos`.
     - Vincular el reembolso al pago y, cuando corresponda, a la nota de crédito emitida.
     - Diferenciar con total claridad una devolución real de dinero de una simple acreditación de saldo a favor.
  5. Tratamiento de casos especiales:
     - Pago recibido y devuelto; pago aplicado a estudiante equivocado; cargo generado por error; matrícula cancelada pos-pago; pago duplicado; pago parcial que requiere devolución; factura emitida con importe incorrecto; pago que debe reasignarse a otra obligación.
  6. Control contable:
     - Generar asientos inversos en `AsientosContables` respetando el principio de partida doble.
     - Actualizar saldos afectados sin sobrescribir los asientos originales.
     - Registrar los egresos en `MovimientosCajaBancos`.
     - Evitar que una nota de crédito genere automáticamente una salida de efectivo cuando no existe devolución monetaria física.
- **Criterios de Aceptación:**
  - No se puede anular físicamente un pago o cargo (trazabilidad permanente).
  - Una reversión restituye exactamente los importes pendientes de los cargos afectados.
  - Una reversión duplicada es rechazada con código de error.
  - Un reembolso parcial no puede superar el importe efectivamente pagado no reembolsado.
  - Toda nota de crédito queda unívocamente vinculada a su factura fiscal original.
  - La nota de crédito no se confunde con un egreso de caja si no hubo salida monetaria.
  - Los movimientos inversos se reflejan en los reportes contables y en el libro diario.
  - Todas las operaciones requieren justificación y rol administrativo autorizado (`Contador`, `Director`, `Administrador`).
  - Los saldos individuales y familiares coinciden matemáticamente después de cada operación.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ALTA PRIORIDAD (P1 - BILLETERA FAMILIAR, CONSOLA ADMINISTRATIVA, LIQUIDACIÓN MULTIHIJO Y RECARGOS)

---

### [ ] [F15-Task04] Sistema de billetera familiar, anticipos y créditos a favor
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección E (Brecha E.4) y Sección J (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Experiencia de usuario, gestión de anticipos y trazabilidad familiar)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `BilleteraSaldoFavor`
  - `CreditoFamiliarMovimientos`
  - `CargosEstudiante`
  - `PagosAbonos`
  - `js/student.js`
- **Dependencias Expuestas:** `BilleteraSaldoFavor`, `CreditoFamiliarMovimientos`, `CargosEstudiante`, `PagosAbonos`, Portal Familiar
- **Descripción del Alcance:**
  Los excedentes de pagos, anticipos y créditos derivados de devoluciones no cuentan con un sistema de almacenamiento y aplicación estructurado.
  Requerimientos Funcionales Detallados:
  1. Crear la entidad y hoja `BilleteraSaldoFavor` con: `WalletID`, `FamilyID`, `UserIdResponsable`, `SaldoDisponible`, `SaldoReservado`, `Moneda`, `Estado`, `FechaCreacion`, `UltimaActualizacion`.
  2. Crear el libro de movimientos independiente `BilleteraMovimientos` con: `MovimientoID`, `WalletID`, `TipoMovimiento` (`Credito`, `Debito`, `Reserva`, `Reverso`), `Monto`, `SaldoAnterior`, `SaldoNuevo`, `PagoOrigenID`, `CargoDestinoID`, `ReembolsoID`, `Fecha`, `UsuarioResponsable`, `Observaciones`.
  3. Implementar las funciones: `creditFamilyWallet`, `getFamilyWalletBalance`, `getFamilyWalletStatement`, `applyWalletBalanceToCharges`, y `reverseWalletMovement`.
  4. Permitir generar saldo a favor mediante: Sobrepagos, pagos anticipados, devoluciones convertidas en crédito, reasignaciones autorizadas y ajustes administrativos justificados.
  5. Permitir aplicar el crédito: A un hijo específico, a varios hijos de la misma familia, a mensualidades futuras, a cargos extraordinarios o a obligaciones seleccionadas manualmente.
  6. Incorporar preferencias parametrizables para aplicación automática: Aplicar primero a cargos vencidos; aplicar primero a la mensualidad más antigua; aplicar a todos los hijos o al beneficiario seleccionado; exigir autorización antes de utilizar créditos en determinados conceptos.
  7. Mantener un historial completo de aplicaciones y reversos inmutable.
  8. Mostrar el saldo disponible en el portal familiar (`student.js`), diferenciándolo visualmente de los saldos pendientes.
- **Criterios de Aceptación:**
  - Un sobrepago genera crédito en la billetera por el excedente exacto.
  - El saldo disponible de la billetera nunca puede ser negativo.
  - Una aplicación reduce simultáneamente el crédito disponible y la deuda del cargo correspondiente.
  - No se puede consumir dos veces el mismo crédito (protección de concurrencia).
  - Se pueden aplicar fondos a diferentes hijos de la misma familia con autorización válida.
  - Una reversión restituye el saldo original de la billetera.
  - El estado de cuenta familiar refleja con transparencia los movimientos y saldo actual de la billetera.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task05] Liquidación atómica y distribución inteligente de pagos conjuntos multihijo
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección E (Brecha E.5) y Sección J (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Integridad de saldos entre hermanos y recaudación unificada)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `DistribucionPagosConjuntos`
  - `PagosAbonos`
  - `CargosEstudiante`
  - `MovimientosCajaBancos`
  - `js/student.js`
  - `js/accounting.js`
- **Dependencias Expuestas:** `DistribucionPagosConjuntos`, `PagosAbonos`, `CargosEstudiante`, `ComprobantesPago`, `MovimientosCajaBancos`
- **Descripción del Alcance:**
  El backend permite registrar distribuciones familiares mediante `submitJointFamilyPayment`, pero falta completar el proceso de aprobación y liquidación de todas las obligaciones involucradas como una operación financiera atómica y consistente.
  Requerimientos Funcionales Detallados:
  1. Completar la integración bidireccional entre `submitJointFamilyPayment` y `reviewPaymentVoucher`.
  2. Permitir registrar un único pago familiar que cubra: varios hijos, varios cargos de un mismo hijo, mensualidades de diferentes períodos, cargos extraordinarios y diferentes conceptos de cobro.
  3. Crear una vista de distribución que muestre importe total recibido, asignación por hijo, cargos seleccionados, saldos anteriores, importe aplicado, saldos restantes y excedentes.
  4. Incorporar distribución automática con criterios configurables: primero obligaciones vencidas, cargos más antiguos, prioridad por estudiante o distribución proporcional.
  5. Permitir distribución manual y modificación por el contador previa a la aprobación.
  6. Ejecutar la aprobación de manera atómica: validar distribuciones, verificar estado pendiente de cargos, confirmar coincidencia de importes (+/- 0.01), registrar abonos individuales en `PagosAbonos`, actualizar estado de cargos en `CargosEstudiante`, asentar el movimiento único en `MovimientosCajaBancos` y marcar comprobante como `Aprobado`.
  7. Resiliencia y compensación: si falla alguna operación en una hoja, aplicar compensación idempotente para no dejar pagos a medias.
  8. Permitir transferir excedentes no asignados a la billetera familiar (`BilleteraSaldoFavor`).
  9. Asignar identificador único global de la operación familiar (`PAGO-FAM-...`).
- **Criterios de Aceptación:**
  - Un comprobante familiar puede liquidar cargos de tres o más hijos en una sola acción.
  - Cada abono generado queda vinculado al estudiante y cargo correspondiente en `PagosAbonos`.
  - La suma de los abonos coincide exactamente con el importe distribuido.
  - No se puede aprobar dos veces el mismo comprobante conjunto.
  - Un fallo durante el proceso no deja pagos contabilizados parcialmente.
  - El libro de caja registra una única recepción de dinero por el importe total.
  - La distribución puede consultarse y auditarse en el portal familiar y en el panel contable.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task06] Materialización automática de recargos por mora y administración de morosidad
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección B (B.3) y Sección J (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Recaudación, incentivo de pronto pago y gestión de morosidad)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `RecargosMoras`
  - `CargosEstudiante`
  - `TarifasPlanPago`
  - `js/accounting.js`
- **Dependencias Expuestas:** `RecargosMoras`, `CargosEstudiante`, `getStudentAccountStatement`
- **Descripción del Alcance:**
  `calculateLateFeesForAccount` calcula recargos proyectados en memoria, pero no los materializa automáticamente como cargos exigibles en `CargosEstudiante`.
  Requerimientos Funcionales Detallados:
  1. Implementar `applyLateFeesBatch` en `backend/accounting-service/Code.gs`.
  2. Permitir configurar reglas por concepto, nivel educativo, grado, año lectivo, días de gracia, porcentaje o cantidad fija, límite máximo y frecuencia de aplicación.
  3. Admitir modalidades parametrizables: recargo único tras vencimiento, porcentual, fijo, periódico o escalonado por antigüedad de deuda.
  4. Crear cargos individuales de mora (`CRG-MORA-...`) vinculados al cargo original.
  5. Registrar fecha de vencimiento original, días de atraso, regla aplicada, base de cálculo, porcentaje e importe generado.
  6. Impedir la duplicación de recargos para un mismo período o mes de cálculo.
  7. Permitir suspender, exonerar o revertir recargos mediante autorización documentada de Dirección.
  8. Incorporar una vista de simulación previa antes de materializar recargos masivos.
  9. Mostrar por separado capital original, recargos acumulados y total adeudado.
  10. Integrar los recargos con los estados de cuenta, reportes de morosidad y distribución de pagos.
- **Criterios de Aceptación:**
  - Un cargo vencido genera el recargo correspondiente una vez agotados los días de gracia.
  - Un cargo pagado dentro del período de gracia no genera recargo por mora.
  - La ejecución repetida no duplica recargos sobre el mismo cargo y período.
  - Los recargos quedan asentados permanentemente en `CargosEstudiante`.
  - Los pagos pueden aplicarse a capital y mora según la política de amortización configurada.
  - Las exoneraciones de mora conservan el historial del importe original y el usuario autorizador.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task07] Desarrollo de la consola administrativa de cobranza, caja y revisión de comprobantes
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección E (Brecha E.5) y Sección J (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Operatividad de la tesorería escolar y productividad contable)
- **Archivos Involucrados:**
  - `dashboard-contabilidad.html`
  - `js/accounting.js`
  - `backend/accounting-service/Code.gs`
  - `ComprobantesPago`
  - `CargosEstudiante`
  - `PagosAbonos`
- **Dependencias Expuestas:** `dashboard-contabilidad.html`, `js/accounting.js`, `ComprobantesPago`, `reviewPaymentVoucher`
- **Descripción del Alcance:**
  Las secciones `cobrar` y `comprobantes` carecen de una interfaz administrativa completa en `dashboard-contabilidad.html`. La funcionalidad de backend no está aprovechada mediante una consola interactiva.
  Requerimientos Funcionales Detallados:
  1. Panel principal de cobranza con indicadores actualizados: total facturado, total recaudado, total pendiente, total vencido, total en revisión, total de pagos parciales, saldos a favor y cantidad de estudiantes morosos.
  2. Bandeja de comprobantes: listar comprobantes pendientes mostrando estudiante, tutor, fecha, importe, método, banco, referencia, desglose multihijo y estados `Pendiente`, `Aprobado`, `Rechazado`.
  3. Filtros avanzados: por estudiante, tutor, grado, sección, fecha, importe, banco, referencia, estado y año lectivo.
  4. Revisión documental: visor integrado con ampliación y rotación, datos del pago junto al documento, controles de aprobación/rechazo, motivo obligatorio de rechazo y detección de referencias repetidas.
  5. Flujo de aprobación: ejecutar `reviewPaymentVoucher`, mostrar liquidación, generar recibo oficial, actualizar estado de cuenta, notificar al tutor y bloquear doble aprobación.
  6. Gestión de cobranza directa: búsqueda de cuentas, registro de pagos en ventanilla, aplicación de abonos parciales, distribución entre cargos y aplicación de créditos de billetera.
  7. Historial y auditoría: registro de usuario revisor, fecha, motivo y trazabilidad de operaciones.
  8. Usabilidad: interfaz moderna con tablas responsivas, paginación, filtros dinámicos y carga sin refrescar toda la pantalla.
- **Criterios de Aceptación:**
  - El contador puede revisar todos los comprobantes pendientes desde una sola consola sin acceder a Google Sheets.
  - Puede previsualizar la foto o PDF del voucher directamente en la vista.
  - La acción de rechazo exige obligatoriamente un motivo de al menos 10 caracteres.
  - Los pagos conjuntos reflejan a todos los hijos y cargos destinatarios.
  - Los indicadores numéricos del panel coinciden exactamente con los registros del backend.
  - Los usuarios sin rol financiero autorizado no pueden acceder a los controles de aprobación.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task08] Interfaz de configuración de conceptos, tarifas, aranceles y planes de pago
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección B (B.1) y Sección J (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Parametrización administrativa y consistencia de tarifas)
- **Archivos Involucrados:**
  - `dashboard-contabilidad.html`
  - `js/accounting.js`
  - `backend/accounting-service/Code.gs`
  - `ConceptosCobro`
  - `TarifasPlanPago`
- **Dependencias Expuestas:** `ConceptosCobro`, `TarifasPlanPago`, `configurePaymentConcept`, `configurePaymentTariff`
- **Descripción del Alcance:**
  Las funciones `configurePaymentConcept` y `configurePaymentTariff` existen en el backend pero carecen de una interfaz gráfica administrativa para gestionar conceptos, tarifas y cuotas.
  Requerimientos Funcionales Detallados:
  1. Administración de conceptos: crear, consultar, modificar y desactivar conceptos definiendo nombre, categoría, tipo de obligación, tratamiento tributario SAR, admisión de becas, pagos parciales, recargos por mora y vigencia.
  2. Administración de tarifas: configurar aranceles por año lectivo, nivel, grado y modalidad; definir importe total, cantidad de cuotas, montos individuales, calendarios de vencimiento y clonación entre años lectivos.
  3. Planes alternativos y convenios: permitir planes de contado vs fraccionados, planes especiales por estudiante o familia y convenios de pago autorizados vinculados a su expediente.
  4. Validaciones de integridad: bloquear montos negativos, cuotas inválidas, tarifas incompletas y vigencias superpuestas contradictorias; impedir modificaciones que alteren cargos históricos ya generados.
  5. Versionado y auditoría: conservar historial de tarifas anteriores, usuario modificador, fecha y justificación.
  6. Interfaz: tablas interactivas, modales de edición, filtros por nivel y vista previa del plan de pago antes de confirmar.
- **Criterios de Aceptación:**
  - Se pueden crear y editar conceptos y tarifas desde el dashboard sin tocar Sheets.
  - Se pueden definir calendarios masivos de cuotas diferenciadas por grado.
  - Se rechazan importes negativos o parámetros inconsistentes.
  - Las modificaciones de tarifas futuras no alteran las obligaciones anteriores ya asentadas.
  - Un plan de pago puede duplicarse hacia un nuevo año lectivo conservando consistencia de IDs.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task09] Integración real de pasarelas de pago y procesamiento de notificaciones externas
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección B (B.8) y Sección J (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Automatización de recaudación, pasarelas digitales y seguridad criptográfica)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `IntegracionesPasarelas`
  - `PagosAbonos`
  - `MovimientosCajaBancos`
  - `FacturasFiscales`
  - `dashboard-contabilidad.html`
- **Dependencias Expuestas:** `IntegracionesPasarelas`, `handlePaymentGatewayWebhook`, `recordStudentPayment`, HMAC-SHA256
- **Descripción del Alcance:**
  La integración actual dispone de configuraciones y pruebas simuladas de ping, pero no procesa transacciones reales mediante notificaciones asíncronas de pasarelas de pago.
  Requerimientos Funcionales Detallados:
  1. Crear la función `handlePaymentGatewayWebhook` en `backend/accounting-service/Code.gs`.
  2. Arquitectura modular de adaptadores para proveedores bancarios y de pago: BAC Credomatic, Banco Ficohsa (cuando esté disponible), Stripe, PayPal y pasarelas locales compatibles.
  3. Validación de notificaciones externas: identificar proveedor, ID de transacción, autenticidad, importe, moneda, referencia y estado de la operación.
  4. Verificación criptográfica: validar firmas HMAC-SHA256 o tokens del proveedor, timestamps y protección contra repetición de webhooks.
  5. Máquina de estados de transacción: `Iniciada`, `Pendiente`, `Autorizada`, `Aprobada`, `Rechazada`, `Cancelada`, `Reembolsada`, `EnDisputa`.
  6. Procesamiento idempotente: registro de webhook por identificador de evento único para garantizar que una transacción nunca se liquide dos veces y eventos desordenados no corrompan estados definitivos.
  7. Conciliación de comisiones: desglose entre importe bruto pagado por la familia, comisión deducida por la pasarela e importe neto liquidado en banco.
  8. Almacenamiento seguro: credenciales API exclusivamente en variables de script / backend, nunca en el cliente.
  9. Consola administrativa de pasarelas: activación/desactivación, prueba de conexión, log de eventos recibidos y reprocesamiento seguro de fallos.
- **Criterios de Aceptación:**
  - Una transacción aprobada por la pasarela genera automáticamente el pago en `PagosAbonos` y actualiza el saldo.
  - Una transacción rechazada no liquida ninguna obligación.
  - Una notificación sin firma criptográfica válida es rechazada con código de seguridad.
  - Los webhooks repetidos por el proveedor no generan pagos duplicados.
  - Las comisiones se registran por separado del importe bruto pagado.
  - Las credenciales y claves secretas permanecen invisibles en el código del navegador.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task10] Automatización de notificaciones de cargos, vencimientos, pagos y obligaciones familiares
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección B (B.9) y Sección J (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Comunicación institucional familiar y reducción de morosidad)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `BandejaNotificaciones`
  - `js/student.js`
  - `dashboard-contabilidad.html`
- **Dependencias Expuestas:** `sendMultiChannelNotification`, `BandejaNotificaciones`, `RelacionesFamiliares`, `permisoFinanciero`
- **Descripción del Alcance:**
  No todos los eventos financieros generan comunicaciones automáticas. En particular, la creación de nuevos cargos y vencimientos próximos no están conectados completamente con avisos multicanal a las familias.
  Requerimientos Funcionales Detallados:
  1. Notificaciones automáticas para eventos financieros clave: generación de mensualidad, cargo extraordinario, aviso preventivo de vencimiento, vencimiento acaecido, inicio de mora, recargo aplicado, recepción de comprobante, aprobación de pago, rechazo con motivo, recibo CUV disponible, factura fiscal emitida, acreditación a billetera y reembolsos.
  2. Recordatorios preventivos configurables: disparar avisos automáticos a los 5, 3 y 1 día antes de la fecha límite de pago.
  3. Enrutamiento por permisos: validar `permisoFinanciero` en `RelacionesFamiliares` para que solo los responsables autorizados reciban información financiera de sus hijos.
  4. Canales de comunicación: bandeja interna, correo electrónico y notificaciones push/PWA.
  5. Plantillas y contenido: nombre del estudiante, concepto, período, importe, fecha de vencimiento, saldo pendiente, enlace autenticado y pasos para reportar pago.
  6. Deduplicación y resiliencia: registrar clave de deduplicación (`deduplicationKey`), reintentos seguros y garantía de que una falla en el servidor de correo nunca revierta la transacción financiera.
  7. Preferencias familiares: permitir al tutor definir canales preferidos y consultar el buzón histórico.
- **Criterios de Aceptación:**
  - La generación de una mensualidad genera la notificación al tutor legal con permiso financiero.
  - Los recordatorios preventivos se despachan conforme al cronograma configurado.
  - Un apoderado sin permiso financiero no recibe alertas con montos de saldos.
  - La aprobación o rechazo de un comprobante notifica de inmediato al tutor.
  - Un error temporal de correo no afecta la persistencia del pago registrado en el backend.
  - Los reintentos de notificación no producen mensajes duplicados a la familia.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task11] Sistema analítico de morosidad, antigüedad de saldos y proyección de recaudación
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección B (B.7) y Sección J (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Inteligencia financiera, gestión de tesorería y toma de decisiones)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `js/accounting.js`
  - `dashboard-contabilidad.html`
  - `CargosEstudiante`
  - `PagosAbonos`
  - `RecargosMoras`
- **Dependencias Expuestas:** `getAgingAccountsReceivableReport`, `CargosEstudiante`, `PagosAbonos`
- **Descripción del Alcance:**
  No existe un módulo analítico especializado que clasifique la antigüedad de las cuentas por cobrar, compare la morosidad y proyecte el flujo de caja escolar.
  Requerimientos Funcionales Detallados:
  1. Implementar la función `getAgingAccountsReceivableReport` en `backend/accounting-service/Code.gs`.
  2. Clasificación de deuda por antigüedad: No vencida (corriente), 1 a 30 días, 31 a 60 días, 61 a 90 días, y más de 90 días de mora.
  3. Filtros multidimensionales: por año lectivo, nivel educativo, grado, sección, estudiante, responsable, concepto y estado.
  4. Indicadores clave: cartera total por cobrar, monto vencido, no vencido, recargos devengados, porcentaje de morosidad, promedio de días de mora y tasa de recuperación de cartera.
  5. Análisis temporal comparativo: recaudación mensual real vs esperada, evolución intermensual de la morosidad y estacionalidad de cobros.
  6. Proyecciones financieras: flujo de ingresos futuros según calendario de cuotas y modelos de cobranza.
  7. Identificación de riesgos: top de familias con mayor morosidad acumulada, grados con menor tasa de pago y conceptos con mayor rezago.
  8. Exportación estructurada de métricas en pantalla a formatos de reporte gerencial.
- **Criterios de Aceptación:**
  - Los totales de la cartera coinciden con la suma de los estados de cuenta individuales y familiares.
  - La clasificación de antigüedad se calcula exactamente según las fechas de vencimiento de cada cargo.
  - Los pagos parciales reducen de forma transparente los saldos en sus respectivas franjas de antigüedad.
  - Los recargos se desglosan por separado del capital original.
  - La aplicación de filtros no altera los cálculos matemáticos de origen.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task12] Visor avanzado de comprobantes y documentos financieros
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección J (P2)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Comodidad operativa, usabilidad y validación de transferencias)
- **Archivos Involucrados:**
  - `dashboard-contabilidad.html`
  - `js/accounting.js`
  - Google Drive
  - `ComprobantesPago`
  - `FacturasFiscales`
- **Dependencias Expuestas:** `ComprobantesPago`, `dashboard-contabilidad.html`, Google Drive API
- **Descripción del Alcance:**
  El sistema almacena los comprobantes en Drive, pero la experiencia de revisión en interfaz carece de herramientas para inspeccionar vouchers con claridad (fotos tomadas con móvil en ángulos difíciles o de baja luz).
  Requerimientos Funcionales Detallados:
  1. Crear un visor modal interactivo integrado en `dashboard-contabilidad.html`.
  2. Soporte nativo para formatos de imagen (PNG, JPG, WEBP) y archivos PDF.
  3. Controles interactivos: zoom in/out, rotación horaria y antihoraria de 90°, ajuste al ancho de pantalla, arrastre/panning, navegación multipágina en PDFs y modo pantalla completa.
  4. Panel lateral contextual: visualizar simultáneamente la imagen del voucher y los metadatos declarados por el apoderado (monto, banco, referencia, fecha, cargos e hijos asociados).
  5. Navegación fluida entre comprobantes pendientes sin cerrar el visor modal.
  6. Preservar intacto el archivo original en Drive (las transformaciones visuales son en el canvas cliente).
  7. Control de permisos y manejo elegante de archivos no disponibles o enlaces rotos.
- **Criterios de Aceptación:**
  - El usuario puede rotar y ampliar imágenes de depósitos bancarios dentro de la misma pantalla.
  - Los comprobantes en formato PDF se visualizan sin necesidad de descargarlos al equipo local.
  - La rotación y ampliación en pantalla no altera el archivo binario almacenado en Drive.
  - El visor opera de manera responsiva en escritorios, tabletas y teléfonos móviles.
  - Un archivo no disponible muestra un mensaje de aviso claro en lugar de una pantalla en blanco.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task13] Ajustes administrativos de cargos, modificaciones de obligaciones y control de retiros
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección B (B.2) y Sección J (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Integridad de cargos, sincronización académica y gestión de bajas)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `CargosEstudiante`
  - `Matriculas`
  - `DescuentosBecas`
- **Dependencias Expuestas:** `CargosEstudiante`, `Matriculas`, `adjustPendingCharge`
- **Descripción del Alcance:**
  El sistema crea cargos de matrícula pero necesita completar los procedimientos administrativos para ajustar obligaciones pendientes y sincronizar bajas o traslados académicos con las finanzas.
  Requerimientos Funcionales Detallados:
  1. Implementar la función `adjustPendingCharge` en `backend/accounting-service/Code.gs`.
  2. Permitir modificar cargos pendientes: monto base, fecha de vencimiento, concepto y observaciones, conservando su identidad histórica.
  3. Registrar valor anterior, nuevo valor, usuario responsable, fecha y justificación obligatoria.
  4. Bloquear la modificación directa de cargos que ya tengan pagos asociados en `PagosAbonos`.
  5. Sincronización académica ante eventos del alumno: retiro definitivo, traslado, cancelación de matrícula, suspensión y reingreso.
  6. Gestión de retiro: identificar mensualidades futuras no devengadas, bloquear la generación de cargos posteriores a la fecha efectiva de baja y someter a revisión cargos ya emitidos no pagados.
  7. Políticas de liquidación configurables: definir si la mensualidad del mes en curso se cobra completa, proporcional o se exime según la fecha de retiro.
  8. Preservar las obligaciones históricas de períodos anteriores cursados.
- **Criterios de Aceptación:**
  - Un cargo pendiente puede ajustarse registrando el historial completo del cambio.
  - Un cargo pagado o con abonos no puede ser modificado de forma destructiva.
  - El retiro de un estudiante impide la generación de mensualidades posteriores a su fecha efectiva de retiro.
  - Las obligaciones devengadas antes del retiro permanecen registradas en el estado de cuenta.
  - El reingreso del estudiante no duplica las obligaciones previas ni corrompe su saldo histórico.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task14] Administración de becas, descuentos temporales y vencimiento automático de beneficios
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección B (B.3) y Sección J (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Control de beneficios económicos y vigencia de becas)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `DescuentosBecas`
  - `SolicitudesDescuentoBeca`
  - `CargosEstudiante`
  - `js/accounting.js`
- **Dependencias Expuestas:** `DescuentosBecas`, `SolicitudesDescuentoBeca`, `applyApprovedScholarshipsToCharges`
- **Descripción del Alcance:**
  El motor de becas está implementado en sus funciones principales, pero los beneficios temporales no disponen de un ciclo completo de expiración, renovación y regularización automática de cobros.
  Requerimientos Funcionales Detallados:
  1. Catálogo completo de beneficios: becas completas (100%), parciales, porcentuales, de monto fijo, por mérito, condición socioeconómica, convenio institucional y descuento por hermanos.
  2. Gestión de vigencia: definir fecha de inicio, fecha de expiración y año lectivo de aplicación.
  3. Vencimiento automático: al expirar la vigencia de una beca, suspender su aplicación a nuevos cargos generados sin alterar cargos históricos ni pagos contabilizados.
  4. Renovaciones autorizadas: permitir prorrogar o renovar becas evaluando cumplimiento de condiciones (promedio académico, conducta).
  5. Incompatibilidad de beneficios: validar reglas de no acumulación de descuentos no autorizados.
  6. Reportes institucionales de becas: consolidar total de beneficiarios, monto subsidiado, distribución por grado e impacto en el presupuesto escolar.
- **Criterios de Aceptación:**
  - Las becas vencidas dejan de aplicarse automáticamente a los nuevos cargos generados.
  - Las renovaciones conservan el histórico del beneficio original.
  - Se bloquea la asignación simultánea de becas incompatibles sobre un mismo estudiante.
  - Los importes subsidiados coinciden exactamente con los descuentos aplicados en los cargos.
  - Una beca del 100% deja el arancel neto en 0.00 Lempiras sin generar saldos deudores artificiales.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task15] Reasignación administrativa de pagos y corrección de distribuciones
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección B (B.5) y Sección J (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Flexibilidad operativa y resolución de pagos mal aplicados)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `PagosAbonos`
  - `CargosEstudiante`
  - `DistribucionPagosConjuntos`
  - `BilleteraSaldoFavor`
- **Dependencias Expuestas:** `reassignPaymentAllocation`, `PagosAbonos`, `CargosEstudiante`
- **Descripción del Alcance:**
  El sistema permite registrar pagos, pero no dispone de un procedimiento administrativo controlado para reasignar abonos aplicados al cargo o al estudiante equivocado.
  Requerimientos Funcionales Detallados:
  1. Implementar la función `reassignPaymentAllocation` en `backend/accounting-service/Code.gs`.
  2. Permitir seleccionar: pago original, cargo de origen, cargo de destino, monto a reasignar, justificación obligatoria y usuario autorizador.
  3. Validaciones de seguridad: verificar que el abono exista y esté aplicado; comprobar que el monto no exceda el disponible; validar que el cargo destino exista y pertenezca al mismo estudiante o a un hermano con relación familiar autorizada.
  4. Reversión y reasignación limpia: actualizar el cargo de origen (restituyendo el saldo pendiente) y aplicar al cargo destino sin duplicar el movimiento de ingreso de efectivo en el libro de caja ni alterar el recibo global.
  5. Posibilidad de transferir saldos no reasignados directamente a la billetera familiar.
  6. Auditoría inmutable de la reasignación con registro de diffs contables.
- **Criterios de Aceptación:**
  - Una reasignación de pago no duplica los ingresos en caja ni en reportes contables.
  - El cargo de origen recupera exactamente su saldo pendiente no cubierto.
  - El cargo de destino recibe el abono correspondiente actualizando su estado a `Parcial` o `Pagado`.
  - Se rechaza cualquier intento de reasignar más dinero del efectivamente liquidado en el pago.
  - La operación queda registrada con trazabilidad completa de origen y destino.
- **Estado:** [ ] Pendiente

---

## TAREAS DE PRIORIDAD MEDIA (P2 - AUDITORÍA DE IDEMPOTENCIA, REPORTES, WEBHOOKS, CONCILIACIÓN Y EXPORTACIÓN)

---

### [ ] [F15-Task16] Fortalecimiento de idempotencia, concurrencia y consistencia de operaciones financieras
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección H (H.2, H.3) y Sección J (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media-alta (Integridad financiera, prevención de condiciones de carrera y persistencia de idempotencia)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `PagosAbonos`
  - `ComprobantesPago`
  - `FacturasFiscales`
  - `MovimientosCajaBancos`
  - `BancosConciliaciones`
- **Dependencias Expuestas:** `CacheService`, `LockService`, `checkAndRegisterIdempotencyKey`
- **Descripción del Alcance:**
  La plataforma cuenta con mecanismos de idempotencia en memoria de 300 segundos (`CacheService`) y candados de script, pero requiere controles persistentes adicionales para evitar aprobaciones duplicadas ante concurrencia extrema o inconsistencias entre hojas relacionadas.
  Requerimientos Funcionales Detallados:
  1. Aprobación única en `reviewPaymentVoucher`: si el comprobante ya está `Aprobado`, rechazar explícitamente con mensaje amigable; si está `Rechazado`, exigir reapertura formal; si está siendo procesado por otro usuario, bloquear la concurrencia.
  2. Idempotencia persistente: complementar el caché de 300s registrando las claves de idempotencia financieras en una estructura persistente para operaciones críticas.
  3. Protección atómica integral: proteger con candado la asignación de números de recibo CUV, correlativos de facturación SAR, saldos de billetera y liquidación de cargos multihijo.
  4. Verificador de consistencia referencial: escáner para detectar pagos sin cargo asociado, cargos pagados con saldo pendiente o movimientos de caja desalineados.
  5. Registro estructurado de intentos duplicados y conflictos de concurrencia en `EventosSistema`.
- **Criterios de Aceptación:**
  - Una solicitud de aprobación enviada simultáneamente por dos contadores se procesa exactamente una sola vez.
  - La reutilización de una clave de idempotencia con parámetros distintos es rechazada inmediatamente.
  - Una caída de conexión durante una liquidación compuesta recupera el estado consistente sin duplicar abonos.
  - Las consultas administrativas permiten detectar cualquier inconsistencia en la correspondencia de saldos.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task17] Correcciones fiscales, notas de corrección y trazabilidad documental
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección B (B.6) y Sección J (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Trazabilidad fiscal, cumplimiento SAR y corrección de documentos)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `FacturasFiscales`
  - `NotasCreditoFiscales`
  - `ComprobantesPago`
  - `dashboard-contabilidad.html`
- **Dependencias Expuestas:** `FacturasFiscales`, `NotasCreditoFiscales`, `createFiscalInvoice`
- **Descripción del Alcance:**
  La plataforma genera facturas y recibos, pero no dispone de un flujo completo de corrección documental que permita enmendar errores sin alterar los documentos fiscales originales.
  Requerimientos Funcionales Detallados:
  1. Flujo de corrección documental: diferenciar correcciones administrativas (dirección, teléfono, nombre comercial) de correcciones fiscales (RTN, montos, conceptos exentos/gravados).
  2. Impedir modificaciones directas o silenciosas sobre facturas ya emitidas en `FacturasFiscales`.
  3. Solicitudes de corrección: registrar documento original, motivo, descripción del error, datos enmendados, solicitante y autorizador.
  4. Generación de documentos vinculados: emitir la correspondiente Nota de Crédito o documento de sustitución fiscal de acuerdo con las normativas del SAR.
  5. Historial documental y auditoría accesible desde el dashboard de contabilidad.
- **Criterios de Aceptación:**
  - Ninguna factura emitida puede editarse directamente en la base de datos sin un expediente de corrección.
  - Todo cambio documental conserva la versión original del comprobante.
  - Se vincula formalmente el documento rectificativo con la factura original.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task18] Exportación avanzada de estados de cuenta, recibos y reportes financieros
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección B (B.4) y Sección J (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Presentación institucional, descarga documental y reportería)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `js/accounting.js`
  - `js/student.js`
  - `js/ui-common.js`
  - Google Drive
- **Dependencias Expuestas:** Generadores de PDF/Excel, Google Drive, `getStudentAccountStatement`
- **Descripción del Alcance:**
  La plataforma cuenta con información financiera consultable en pantalla, pero necesita ampliar las opciones de descarga oficial en PDF y Excel estructurado con membrete del colegio.
  Requerimientos Funcionales Detallados:
  1. Generación de estados de cuenta individuales y familiares en formato PDF con membrete institucional, logotipo, fecha, desglose de cargos, pagos, descuentos, recargos y saldo neto.
  2. Emisión de constancias de solvencia económica estudiantil con código CUV descargables para trámites externos.
  3. Exportación a Excel de reportes de cartera vencida, recaudación por período y desglose por grado con sumatorias matemáticas exactas.
  4. Generación de paquetes documentales en lote por grado y sección para tesorería.
  5. Almacenamiento organizado de copias oficiales en Google Drive organizadas por año lectivo y expediente estudiantil.
- **Criterios de Aceptación:**
  - El archivo PDF descargado coincide exactamente con las cifras visibles en la plataforma.
  - Las constancias de solvencia incorporan su código CUV para verificación pública.
  - Los archivos de Excel generados mantienen los tipos de datos numéricos y de fecha correctos.
  - Las descargas masivas respetan los filtros de ámbito y permisos de usuario.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task19] Incorporación de comisiones bancarias y liquidación neta de pasarelas en contabilidad
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección B (B.8) y Sección J (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Exactitud contable y conciliación de pasarelas digitales)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `MovimientosCajaBancos`
  - `AsientosContables`
  - `IntegracionesPasarelas`
  - `BancosConciliaciones`
- **Dependencias Expuestas:** `MovimientosCajaBancos`, `AsientosContables`, `IntegracionesPasarelas`
- **Descripción del Alcance:**
  Los pagos recibidos a través de pasarelas de pago o tarjetas de crédito generan comisiones y retenciones bancarias que causan discrepancias entre el ingreso bruto pagado por los padres y el depósito neto recibido en la cuenta bancaria del colegio.
  Requerimientos Funcionales Detallados:
  1. Incorporar campos para importe bruto, comisión porcentual, comisión fija, ISV sobre comisión e importe neto depositado.
  2. Configurar tablas de tarifas de comisión por proveedor de pasarela.
  3. Contabilización automática separada: registrar el ingreso bruto en la cuenta del estudiante y asentar la comisión bancaria como gasto financiero deducible en `AsientosContables`.
  4. Registro en el libro de bancos del importe neto liquidado.
  5. Reportes analíticos de costos por intermediación financiera y comisiones bancarias por período.
- **Criterios de Aceptación:**
  - El arancel del alumno se acredita por el 100% de lo pagado sin transferirle la comisión bancaria a menos que esté parametrizado.
  - La comisión deducida por la pasarela se asienta como gasto financiero en la contabilidad.
  - El monto conciliado en la cuenta de banco coincide con el depósito neto del procesador.
- **Estado:** [ ] Pendiente

---

### [ ] [F15-Task20] Ampliación de la conciliación bancaria asistida y gestión de excepciones
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección B (B.9) y Sección J (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Control de tesorería, conciliación bancaria y automatización de extractos)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `BancosConciliaciones`
  - `MovimientosCajaBancos`
  - `dashboard-contabilidad.html`
  - `js/accounting.js`
- **Dependencias Expuestas:** `performBankReconciliation`, `BancosConciliaciones`, `MovimientosCajaBancos`
- **Descripción del Alcance:**
  La conciliación actual (`performBankReconciliation`) compara partidas por referencia y monto (+/- 0.01), pero puede ampliarse para procesar extractos en formatos estructurados y gestionar excepciones complejas.
  Requerimientos Funcionales Detallados:
  1. Módulo de importación de extractos bancarios en formatos CSV y Excel con mapeo dinámico de columnas (fecha, referencia, concepto, débito, crédito).
  2. Algoritmo de coincidencia asistida por niveles de confianza: coincidencia exacta (referencia y monto idénticos), coincidencia probable (mismo monto y fecha cercana con referencia parcial) y discrepancias.
  3. Gestión de partidas agrupadas: conciliar un único depósito bancario que agrupa múltiples pagos de caja del día.
  4. Reglas automáticas reutilizables para transacciones bancarias recurrentes (intereses ganados, comisiones de mantenimiento, débitos automáticos).
  5. Generación de la hoja de trabajo mensual de conciliación con saldos de libros vs extractos y partidas pendientes.
- **Criterios de Aceptación:**
  - Se pueden importar extractos bancarios estructurados sin formateos manuales previos.
  - El sistema clasifica las partidas con sugerencias automáticas de coincidencia por nivel de confianza.
  - Permite agrupar varios pagos de caja contra un depósito bancario único sin descuadres.
  - Las partidas ya conciliadas no pueden re-utilizarse en conciliaciones posteriores.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ASEGURAMIENTO Y CALIDAD (P2 - SUITE DE REGRESIÓN DE LA FASE 15)

---

### [ ] [F15-Task21] Suite integral de pruebas financieras, fiscales y de regresión de la Fase 15
- **Origen del Hallazgo:** `AUDITORIA_FASE_15_PAGOS_COBROS_FACTURACION.md` / Sección J (P2) y Sección F (CA-01 a CA-95)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media-alta (Aseguramiento de calidad, prevención de regresiones e integridad tributaria)
- **Archivos Involucrados:**
  - `tests/regression/academic-grading-suite.js`
  - `backend/developer-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Suites de pruebas del ecosistema, contratos de API de todos los servicios
- **Descripción del Alcance:**
  Implementar la suite integral automatizada `runPhase15FinancialAndBillingRegressionSuite` que valide exhaustivamente los 95 criterios de aceptación (CA-01 a CA-95) y los 10 escenarios integrales (A a J).
  Requerimientos Funcionales Detallados:
  1. Batería de pruebas automatizadas organizadas por áreas:
     - Configuración financiera (conceptos, tarifas, cuotas y validaciones).
     - Generación de cargos (matrículas, mensualidades masivas, duplicados y retiros).
     - Descuentos, becas y recargos por mora.
     - Estados de cuenta individuales y consolidados familiares.
     - Registro de pagos, pagos parciales y liquidación en cascada.
     - Comprobantes bancarios, almacenamiento en Drive y aprobación.
     - Pasarelas de pago y webhooks con idempotencia.
     - Facturación fiscal SAR, exención del 15% de ISV en colegiaturas, CAI y rangos.
     - Notas de crédito, reversión de pagos y reembolsos.
     - Billetera y saldos a favor familiares.
     - Conciliación bancaria, cierres de caja y asientos contables.
     - Notificaciones multicanal y seguridad RBAC/ABAC.
  2. Cobertura de escenarios complejos: simulación de concurrencia de pagos, doble click, cortes de conexión, pagos conjuntos familiares de tres o más estudiantes y retiros a mitad de año lectivo.
  3. Reporte estructurado con porcentaje de éxito, evidencias y detección de regresiones en las fases anteriores (F9, F10, F11).
- **Criterios de Aceptación:**
  - La suite de regresión valida los 95 criterios de aceptación y los contratos de la Fase 15 con el 100% de pruebas satisfactorias.
  - No introduce ninguna regresión en las pruebas de las Fases 9, 10 y 11 (53/53 pruebas actuales permanecen intactas).
- **Estado:** [ ] Pendiente

---

# PENDIENTES - FASE 16: RECURSOS HUMANOS Y ADMINISTRACIÓN DEL PERSONAL

## TAREAS CRÍTICAS (P0 - SEVERIDAD MÁXIMA, ESTRUCTURA ORGANIZATIVA, ROLES INTERNOS Y DESVINCULACIÓN COORDINADA)

---

### [ ] [F16-Task01] Crear un catálogo dinámico de roles internos organizativos y administrar sus asignaciones
- **Origen del Hallazgo:** `AUDITORIA_FASE_16_RECURSOS_HUMANOS.md` / Sección F (Brecha F.1) y Sección H (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Gobernanza institucional, responsabilidades organizativas y separación estricta de permisos vs funciones)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `dashboard-recursos-humanos.html`
  - `AsignacionesAmbitosRoles`
  - Nuevo catálogo lógico `CatalogoRolesInternos`
- **Dependencias Expuestas:** `AsignacionesAmbitosRoles`, `CatalogoDepartamentos`, `AreasCurricularesExtensiones`, `ROLE_PERMISSIONS`
- **Descripción del Alcance:**
  La plataforma permite asignar ámbitos y responsabilidades mediante `assignRoleScope`, pero utiliza valores de `ScopeType` sin un catálogo formal que normalice las responsabilidades organizativas. No existe una interfaz completa para administrar estos roles internos, sus características, departamentos relacionados y vigencias. Esto puede provocar nombres duplicados, responsabilidades inconsistentes y dificultad para conocer qué personas ocupan cada función institucional.
  Requerimientos Funcionales Detallados:
  1. Catálogo administrable de responsabilidades internas:
     - Crear un catálogo formal para registrar: nombre de la responsabilidad, código interno único, descripción, departamento asociado (si aplica), área académica asociada (si aplica), tipo de responsabilidad (administrativa, académica, operativa o de supervisión), vigencia predeterminada, estado (activo o inactivo), responsable principal y posibilidad de suplencia.
     - Permitir crear responsabilidades personalizadas (ej. «Coordinador del Área de Informática», «Encargado de Laboratorio de Ciencias», «Responsable de Pastoral») sin modificar código duro.
     - Permitir editar la descripción y configuración de una responsabilidad sin alterar las asignaciones históricas.
  2. Asignación y ciclo de vida de responsabilidades:
     - Permitir asignar una responsabilidad a uno o varios empleados simultáneamente.
     - Permitir que un empleado ejerza varias responsabilidades institucionales a la vez sin duplicar su expediente laboral.
     - Establecer fechas de inicio y finalización para cada asignación con validación estricta de vigencia.
     - Registrar quién creó, autorizó, modificó o revocó cada asignación inmutablemente.
     - Permitir consultar las responsabilidades vigentes e históricas por empleado, departamento o área académica.
     - Detectar asignaciones incompatibles o duplicadas por errores tipográficos.
     - Permitir designar un suplente temporal con fechas de vigencia acotadas.
     - Permitir desactivar una responsabilidad sin borrar las asignaciones históricas.
  3. Separación obligatoria entre responsabilidad organizativa y permisos de acceso:
     - El catálogo no debe modificar ni sustituir `ROLE_PERMISSIONS`. Una responsabilidad como «Coordinador de Matemáticas» identifica una función institucional; no debe conceder automáticamente acceso administrativo global en la plataforma.
     - Si una responsabilidad necesita permisos específicos, la relación debe configurarse mediante una asociación explícita y verificable con los permisos existentes, limitada exclusivamente al ámbito asignado.
     - La plataforma debe distinguir nítidamente entre: persona con una responsabilidad, persona con autorización para realizar una operación, persona que supervisa una unidad, y persona que sustituye temporalmente a otra.
  4. Interfaz y adaptaciones técnicas:
     - Adaptar `assignRoleScope` para referenciar responsabilidades del catálogo formal en lugar de cadenas libres, conservando compatibilidad con las asignaciones previas.
     - Incorporar consola administrativa en `dashboard-recursos-humanos.html` con filtros por departamento, área, empleado, responsabilidad y vigencia.
- **Criterios de Aceptación:**
  - Se puede crear una responsabilidad nueva desde la interfaz sin alterar el código fuente.
  - El sistema genera o valida un identificador único persistente para cada responsabilidad.
  - No se permiten responsabilidades duplicadas por diferencias de mayúsculas, espacios o acentos normalizados.
  - Se puede asignar la misma responsabilidad a distintas personas cuando la configuración lo permita.
  - Se puede asignar más de una responsabilidad al mismo empleado conservando su expediente único.
  - Las fechas de vigencia se aplican correctamente y una asignación vencida deja de mostrarse como activa.
  - Un suplente temporal solo ejerce facultades durante el período expresamente autorizado.
  - Revocar una responsabilidad no elimina su historial ni destruye evidencias previas.
  - Crear o asignar una responsabilidad no concede permisos administrativos automáticamente en `ROLE_PERMISSIONS`.
  - Todas las operaciones quedan registradas con autor, fecha y justificación.
  - Las asignaciones existentes continúan funcionando tras la incorporación del catálogo.
- **Estado:** [ ] Pendiente

---

### [ ] [F16-Task02] Implementar la asignación institucional de docentes a áreas académicas, independiente de la carga lectiva
- **Origen del Hallazgo:** `AUDITORIA_FASE_16_RECURSOS_HUMANOS.md` / Sección F (Brecha F.2) y Sección H (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Estructura académica institucional, comités pedagógicos y desacoplamiento de asignaturas)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `AreasCurricularesExtensiones`
  - `CoordinacionesArea`
  - `AsignacionesDocentes`
  - Nueva entidad lógica `DocentesAreasAcademicas`
  - `dashboard-recursos-humanos.html`
- **Dependencias Expuestas:** `AreasCurricularesExtensiones`, `CoordinacionesArea`, `AsignacionesDocentes`, `ExpedientesLaborales`, `F16-Task01`
- **Descripción del Alcance:**
  Las áreas curriculares existen en `AreasCurricularesExtensiones`, y las coordinaciones se administran mediante `CoordinacionesArea`. Sin embargo, no existe una relación institucional independiente que permita registrar que un docente pertenece formalmente a una o varias áreas académicas sin requerir una asignación de asignaturas en el período lectivo vigente. Actualmente, una asignación vinculada a cursos o materias no sustituye la pertenencia a una academia docente o área de conocimiento.
  Requerimientos Funcionales Detallados:
  1. Relación independiente docente - área académica:
     - Crear la entidad y hoja `DocentesAreasAcademicas` vinculando docentes y áreas de forma independiente de la carga horaria.
     - Permitir asignar un docente a una o varias áreas académicas (ej. pertenecer simultáneamente a Matemáticas y a Informática).
     - Permitir que un área tenga múltiples docentes adscritos.
     - Permitir que un docente pertenezca a un área aunque no tenga clases o secciones asignadas en el período activo (ej. docentes en investigación, en suplencia o con carga de coordinación pura).
     - Definir el tipo de vinculación: Docente integrante, Docente titular o especialista, Coordinador de área, Responsable auxiliar o Colaborador temporal.
     - Establecer fechas de inicio y finalización de la pertenencia al área con motivo de la asignación.
  2. Consultas y articulación curricular:
     - Consultar integrantes por área académica e historial de pertenencia.
     - Consultar todas las áreas asignadas a un docente.
     - Relacionar las áreas con las asignaturas correspondientes sin duplicar la definición en el catálogo de asignaturas.
     - Permitir emitir convocatorias y circulares dirigidas exclusivamente a los integrantes de un área.
     - Permitir conformar comités pedagógicos por área y nivel educativo.
  3. Gestión unificada de coordinadores de área:
     - Aprovechar `CoordinacionesArea` sin crear estructuras paralelas duplicadas, manteniendo coherencia con el catálogo de roles internos (`F16-Task01`).
     - Distinguir nítidamente entre: docentes integrantes, coordinador titular, coordinador suplente, coordinador anterior y responsable temporal.
     - Garantizar que los coordinadores solo puedan consultar y supervisar datos dentro del ámbito exacto de su área autorizada.
- **Criterios de Aceptación:**
  - Se puede asignar un docente a varias áreas académicas desde la interfaz.
  - Se pueden asignar varios docentes a una misma área sin crear expedientes laborales duplicados.
  - La pertenencia formal a un área no exige una asignación lectiva de clases activa en el período.
  - Se pueden listar todos los docentes adscritos a un área académica en tiempo real.
  - Se pueden listar todas las áreas a las que pertenece un docente.
  - Se puede designar un coordinador titular y suplente por área.
  - Las asignaciones históricas permanecen inmutables al rotar de área o coordinador.
  - Un docente desvinculado no puede figurar como asignado activo en ningún área.
  - La desactivación de un área no elimina el historial académico ni las asignaciones anteriores.
  - Las asignaciones de clases en `AsignacionesDocentes` no se alteran ni duplican.
  - Los permisos de supervisión del coordinador se mantienen limitados a las asignaturas y docentes de su área.
- **Estado:** [ ] Pendiente

---

### [ ] [F16-Task03] Implementar el flujo de desvinculación laboral con revocación coordinada de accesos y asignaciones
- **Origen del Hallazgo:** `AUDITORIA_FASE_16_RECURSOS_HUMANOS.md` / Sección F (Brecha F.3) y Sección H (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Seguridad de la información, prevención de accesos residuales e integridad en el cese laboral)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `ExpedientesLaborales`
  - `HistorialAdscripciones`
  - `Usuarios`
  - `AsignacionesDocentes`
  - `CoordinacionesArea`
  - `AsignacionesAmbitosRoles`
  - Registros de turnos y sustituciones
- **Dependencias Expuestas:** `ExpedientesLaborales`, `HistorialAdscripciones`, `Usuarios`, `AsignacionesDocentes`, `CoordinacionesArea`, `AsignacionesAmbitosRoles`, `F16-Task01`, `F16-Task02`
- **Descripción del Alcance:**
  `updateEmployeeLaborStatus` cambia el estado laboral y registra la fecha de salida, pero no ejecuta de forma coordinada todas las operaciones necesarias para cerrar la relación laboral. La auditoría identificó que pueden quedar adscripciones activas en `HistorialAdscripciones`, cuentas de usuario activas en `Usuarios`, sesiones/tokens vigentes, asignaciones docentes activas o responsabilidades institucionales abiertas, permitiendo que una persona desvinculada conserve accesos.
  Requerimientos Funcionales Detallados:
  1. Flujo integral de desvinculación (Offboarding):
     - Registrar la solicitud de desvinculación validando que el empleado exista y su estado permita la operación.
     - Registrar fecha efectiva de salida, motivo estructurado, usuario autorizador y documentación de respaldo adjunta.
     - Actualizar el estado laboral en `ExpedientesLaborales` a `Retirado` o `Desvinculado`.
     - Cerrar todas las adscripciones vigentes en `HistorialAdscripciones` marcándolas como `Inactiva` con timestamp de salida.
     - Finalizar las responsabilidades y ámbitos institucionales en `AsignacionesAmbitosRoles`.
     - Finalizar o reasignar coordinaciones en `CoordinacionesArea` y suplencias activas.
     - Cerrar las asignaciones docentes en `AsignacionesDocentes` a partir de la fecha efectiva para evitar clases huérfanas.
     - Desactivar la cuenta en `Usuarios` e invalidar tokens, credenciales y sesiones en tiempo real.
     - Impedir nuevas operaciones del empleado a partir de la fecha efectiva de salida.
     - Conservar permanentemente el expediente laboral, contratos, asistencias y calificaciones históricas (prohibición de borrado físico).
     - Identificar y listar tareas pendientes (ej. entrega de equipos, traspaso de expedientes, reasignación de cursos).
  2. Coordinación y resiliencia entre microservicios:
     - No asumir transacciones atómicas distribuidas en Google Sheets. Implementar una operación coordinada, registrada paso a paso de forma idempotente con registro de estados de ejecución.
     - Si alguna etapa secundaria falla (ej. cierre de sustitución), el proceso debe quedar identificado como incompleto y permitir reanudación sin duplicar operaciones.
     - La revocación de accesos en `Usuarios` debe ejecutarse con prioridad inmediata; un fallo posterior en el cierre académico no debe reactivar el acceso del usuario desvinculado.
  3. Cierre documental y liquidación:
     - Registrar período trabajado, salarios pendientes, vacaciones acumuladas no gozadas (conforme al Art. 348 del Código de Trabajo), deducciones, indemnizaciones y prestaciones que correspondan.
     - No emitir cálculos definitivos sin validación previa y autorización de Dirección/Contabilidad.
     - Emitir registro de auditoría `EMPLOYEE_OFFBOARDED_CASCADED` conservando el autor real y, si intervino un asistente delegado, también el titular delegante.
- **Criterios de Aceptación:**
  - Una desvinculación confirmada bloquea de inmediato el inicio de sesión y las llamadas a la API desde la fecha efectiva.
  - Se invalidan tokens de sesión activos del empleado desvinculado.
  - No se eliminan físicamente expedientes, contratos, registros de asistencia ni evaluaciones de notas históricas.
  - Las adscripciones en `HistorialAdscripciones` pasan a estado inactivo.
  - Las asignaciones de clases posteriores a la fecha efectiva se cierran o marcan para reasignación.
  - Las responsabilidades organizativas y coordinaciones quedan finalizadas.
  - Una re-ejecución del proceso no duplica registros ni corrompe el historial.
  - Si una etapa falla, el sistema identifica las tareas pendientes sin reactivar las cuentas.
  - Se emite el log estructurado `EMPLOYEE_OFFBOARDED_CASCADED` con trazabilidad completa.
  - La liquidación laboral permanece en estado preliminar hasta su aprobación formal.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ALTA PRIORIDAD (P1 - INCORPORACIÓN, PROYECCIÓN DE VACACIONES, JERARQUÍAS Y COLISIONES DE HORARIO)

---

### [ ] [F16-Task04] Implementar el checklist configurable de incorporación de empleados (Onboarding)
- **Origen del Hallazgo:** `AUDITORIA_FASE_16_RECURSOS_HUMANOS.md` / Sección F (Brecha F.4) y Sección H (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Calidad en la contratación, control de requisitos legales y onboarding estructurado)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `dashboard-recursos-humanos.html`
  - `ExpedientesLaborales`
  - `ContratosLaborales`
  - `uploadEmployeeDocument`
  - Nueva entidad lógica `ChecklistIncorporacion`
- **Dependencias Expuestas:** `ExpedientesLaborales`, `ContratosLaborales`, `CandidatosVacantes`, Google Drive
- **Descripción del Alcance:**
  La creación de un expediente permite registrar a un empleado, pero no existe un proceso estructurado que controle las tareas y requisitos necesarios para completar su incorporación (onboarding). Actualmente no hay una lista formal que permita verificar si se firmó el contrato, se cotejaron títulos, se entregaron antecedentes, se realizó la inducción y se completaron las asignaciones de herramientas y cuentas.
  Requerimientos Funcionales Detallados:
  1. Plantillas de incorporación configurables:
     - Diseñar plantillas diferenciadas según el cargo, departamento, tipo de contrato (docente vs administrativo) y políticas institucionales.
     - Tareas parametrizables: firma de contrato laboral, recepción y validación de DNI/RTN, cotejo presencial de títulos académicos, antecedentes penales/policiales, carnet IHSS, examen médico de ingreso, asignación de cargo y departamento, asignación de área académica, horario laboral asignado, creación de correo institucional, entrega de equipo de cómputo, inducción institucional y aceptación firmada de políticas de privacidad y financieras.
     - Clasificar cada tarea como obligatoria u opcional, estableciendo responsables y fechas límite de cumplimiento.
  2. Seguimiento y ejecución del proceso:
     - Generar automáticamente el checklist individual al crear un empleado o formalizar una contratación.
     - Permitir registrar fecha de finalización, responsable que validó la tarea y adjuntar documentos probatorios a Google Drive.
     - Estados de tarea: `Pendiente`, `EnRevision`, `Completada`, `Rechazada`, `Exenta` (exigiendo motivo obligatorio de al menos 10 caracteres si es exenta o rechazada).
     - Mostrar porcentaje de avance del proceso en el dashboard de Recursos Humanos.
     - Permitir que el empleado consulte y cargue documentos desde su portal de autoservicio (`getEmployeeSelfServicePortal`), mientras que RRHH valida y aprueba.
  3. Estados del ciclo de incorporación:
     - Transiciones: `ExpedienteCreado` -> `IncorporacionPendiente` -> `IncorporacionEnRevision` -> `IncorporacionCompletada` -> `Activo`.
     - La activación plena del empleado debe depender del cumplimiento estricto de las tareas obligatorias configuradas.
     - Reutilizar la información existente si el empleado proviene de la selección en `CandidatosVacantes` sin duplicar registros.
- **Criterios de Aceptación:**
  - Se pueden crear y editar plantillas de onboarding desde el dashboard de Recursos Humanos.
  - El sistema crea la lista de tareas individualizada al iniciar la incorporación de un empleado.
  - Cada tarea registra estado, responsable, fecha de validación y archivo adjunto en Drive.
  - La falta de cumplimiento de tareas obligatorias impide el cambio a estado laboral `Activo`.
  - Las tareas opcionales no bloquean la activación del empleado.
  - Una tarea rechazada permite al colaborador corregir y volver a cargar la evidencia.
  - La formalización de un candidato seleccionado reutiliza sus datos sin crear expedientes duplicados.
- **Estado:** [ ] Pendiente

---

### [ ] [F16-Task05] Incorporar proyección de vacaciones futuras y mejorar la gestión de permisos por horas y fracciones de jornada
- **Origen del Hallazgo:** `AUDITORIA_FASE_16_RECURSOS_HUMANOS.md` / Sección C (C.3), Sección F y Sección H (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Experiencia de usuario, planificación del descanso y cumplimiento del Código del Trabajo)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `calculateVacationBalances`
  - `submitLeaveVacationRequest`
  - `reviewVacationRequest`
  - `SolicitudesVacaciones`
  - `IncapacidadesMedicas`
  - `HorariosLaborales`
  - `dashboard-recursos-humanos.html`
- **Dependencias Expuestas:** `SolicitudesVacaciones`, `calculateVacationBalances`, `HorariosLaborales`, Portal de Autoservicio
- **Descripción del Alcance:**
  El cálculo actual de vacaciones en `calculateVacationBalances` aplica la escala legal hondureña del Artículo 348 (10, 12, 15 y 20 días según antigüedad). Sin embargo, la auditoría identificó que no se proyecta adecuadamente el saldo disponible a una fecha futura, lo que dificulta solicitar vacaciones que se disfrutarán cuando el empleado ya haya alcanzado la antigüedad necesaria. Además, se requiere ampliar la gestión de permisos por fracciones de jornada y evitar solapamientos.
  Requerimientos Funcionales Detallados:
  1. Proyección de saldos futuros de vacaciones:
     - Diferenciar con total claridad: días ya devengados y disponibles actualmente, días gozados, días en solicitudes aprobadas pendientes de disfrute, días que se proyecta generar hasta la fecha solicitada y saldo neto proyectado a la fecha de disfrute.
     - Calcular la proyección según la fecha de aniversario laboral y antigüedad legal conforme al Artículo 348.
     - Permitir seleccionar fechas futuras comprobando si el empleado tendrá saldo suficiente al momento del goce.
     - Mostrar advertencias claras cuando la solicitud dependa de días aún no devengados.
     - Parametrizar en la plataforma si la institución autoriza o no solicitudes basadas en saldo proyectado.
     - La proyección es un cálculo estimativo y no debe acreditar anticipadamente días en el saldo devengado actual.
  2. Gestión de permisos por horas y fracciones de jornada:
     - Permitir solicitudes por jornada completa, media jornada o por cantidad de horas específicas.
     - Calcular la equivalencia en días o deducir horas según el horario asignado al empleado en `HorariosLaborales`.
     - Excluir días feriados, descansos semanales y días no laborables institucionales del cómputo.
  3. Control de solapamientos y concurrencia:
     - Detectar solapamientos entre solicitudes de vacaciones, permisos personales e incapacidades médicas en `IncapacidadesMedicas`.
     - Evitar que dos solicitudes simultáneas consuman el mismo saldo disponible mediante candados de script.
     - Reflejar inmediatamente las vacaciones y permisos aprobados en los reportes de asistencia laboral (`DeduccionesAsistencia`).
- **Criterios de Aceptación:**
  - El saldo actual coincide exactamente con la escala del Art. 348 del Código del Trabajo.
  - La proyección a fechas futuras calcula los días que se devengarán sin inflar el saldo legal actual.
  - Los días aprobados se descuentan una sola vez; las solicitudes rechazadas o canceladas no descuentan saldo.
  - Se pueden gestionar permisos por fracciones de jornada calculando la duración según el horario asignado.
  - Se detectan y bloquean solicitudes con fechas solapadas para el mismo empleado.
  - Los resultados se presentan con idéntica consistencia matemática en RRHH y en el autoservicio del empleado.
- **Estado:** [ ] Pendiente

---

### [ ] [F16-Task06] Implementar validación de jerarquías organizativas y prevención de ciclos
- **Origen del Hallazgo:** `AUDITORIA_FASE_16_RECURSOS_HUMANOS.md` / Sección F (Brecha en F16-02) y Sección H (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Integridad de la estructura organizativa y prevención de recurrencia infinita)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `manageDepartmentPositions`
  - `CatalogoDepartamentos`
  - `CatalogoCargos`
  - `HistorialAdscripciones`
  - `dashboard-recursos-humanos.html`
- **Dependencias Expuestas:** `manageDepartmentPositions`, `CatalogoDepartamentos`, `CatalogoCargos`
- **Descripción del Alcance:**
  La plataforma permite administrar departamentos y cargos, pero la auditoría identificó que no existe una validación algorítmica para impedir dependencias jerárquicas circulares (ej. Departamento A depende de B y B depende de A). Esto puede provocar bucles infinitos y errores al consultar organigramas, líneas de mando y aprobaciones.
  Requerimientos Funcionales Detallados:
  1. Algoritmo de detección de ciclos en grafos jerárquicos:
     - Validar la jerarquía en backend antes de persistir cualquier creación o modificación de departamento o cargo.
     - Impedir que una unidad dependa de sí misma (ciclo directo).
     - Impedir que una unidad dependa de cualquiera de sus unidades subordinadas o descendientes (ciclos indirectos de N niveles).
     - Permitir múltiples departamentos raíz de nivel superior (sin padre).
     - Diferenciar claramente las jerarquías administrativas de las líneas de coordinación académica.
  2. Integridad referencial y mensajes de error:
     - Rechazar asignaciones de superiores que apunten a departamentos inexistentes o inactivos.
     - Proporcionar mensajes explicativos claros identificando la cadena de dependencias conflictiva en caso de rechazo.
     - Incorporar pruebas unitarias para grafos de árbol válidos y grafos con ciclos simulados.
- **Criterios de Aceptación:**
  - Se rechaza inmediatamente cualquier intento de asignar una unidad como dependiente de sí misma.
  - Se detectan y rechazan ciclos indirectos de dos o más niveles de profundidad.
  - Se permiten estructuras jerárquicas válidas de múltiples niveles sin restricciones indebidas.
  - Las operaciones rechazadas no alteran los registros de departamentos ni causan estados huérfanos.
  - La consulta de líneas de mando maneja estructuras extensas sin generar desbordamiento de pila o bucles infinitos.
- **Estado:** [ ] Pendiente

---

### [ ] [F16-Task07] Integrar alertas de vencimiento documental y contractual en el panel de Recursos Humanos
- **Origen del Hallazgo:** `AUDITORIA_FASE_16_RECURSOS_HUMANOS.md` / Sección B (F16-08, F16-18) y Sección H (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Continuidad contractual, cumplimiento legal y experiencia del administrador)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `getEmployeeContractAlerts`
  - `uploadEmployeeDocument`
  - `getEmployeeDocuments`
  - `ContratosLaborales`
  - `ExpedientesLaborales`
  - `dashboard-recursos-humanos.html`
- **Dependencias Expuestas:** `getEmployeeContractAlerts`, `ContratosLaborales`, `DocumentosLaborales`, Notificaciones
- **Descripción del Alcance:**
  La plataforma dispone de endpoints backend para consultar alertas de contratos (`getEmployeeContractAlerts`), pero parte de esta información no está integrada en una vista de semáforo centralizada en la consola de Recursos Humanos, obligando a revisiones manuales aisladas.
  Requerimientos Funcionales Detallados:
  1. Vista centralizada de alertas laborales y documentales:
     - Visualizar en `dashboard-recursos-humanos.html` un panel consolidado de vencimientos: contratos por vencer, contratos vencidos, documentos laborales expirados (certificaciones, constancias de antecedentes), credenciales por renovar y requisitos obligatorios faltantes.
     - Filtros interactivos por departamento, cargo, empleado, tipo de documento y nivel de urgencia.
     - Configuración de anticipación de alertas (30, 60, 90 días) configurable desde la plataforma.
  2. Gestión de renovaciones y trazabilidad:
     - Permitir registrar la renovación contractual o actualización de documentos directamente desde el panel de alerta.
     - Conservar las versiones documentales anteriores asociadas al historial del empleado sin destruirlas.
     - Despachar notificaciones automáticas preventivas al responsable de RRHH y al colaborador involucrado.
- **Criterios de Aceptación:**
  - El panel de RRHH muestra los contratos próximos a vencer con alertas diferenciadas por color según su urgencia.
  - Los documentos laborales vencidos se identifican y listan automáticamente.
  - La renovación de un contrato archiva la versión anterior y actualiza la vigencia activa.
  - Las alertas resueltas se retiran de la bandeja de pendientes conservando su registro histórico.
  - El módulo de alertas respeta los permisos RBAC impidiendo el acceso a personal no autorizado.
- **Estado:** [ ] Pendiente

---

### [ ] [F16-Task08] Validar colisiones entre horarios laborales, asignaciones docentes y sustituciones
- **Origen del Hallazgo:** `AUDITORIA_FASE_16_RECURSOS_HUMANOS.md` / Sección F (Brecha en F16-09) y Sección H (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Coherencia en la planificación, disponibilidad docente y prevención de solapamientos)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `HorariosLaborales`
  - `AsignacionesTurnosLaborales`
  - `AsignacionesDocentes`
  - `createTeacherSubstitution`
  - `manageWorkShiftAndSubstitution`
- **Dependencias Expuestas:** `HorariosLaborales`, `AsignacionesDocentes`, `createTeacherSubstitution`, `HorariosClase`
- **Descripción del Alcance:**
  La planificación laboral y académica está implementada, pero algunas validaciones de horarios docentes se realizan en memoria. Se requiere garantizar la detección rigurosa de incompatibilidades en backend entre la jornada laboral del contrato, los turnos asignados, las clases impartidas y las sustituciones temporales.
  Requerimientos Funcionales Detallados:
  1. Motor de validación de disponibilidad y solapamiento:
     - Contrastar asignaciones laborales y académicas activas al programar o modificar turnos, clases o sustituciones.
     - Validar que un docente no reciba una clase o sustitución fuera de su jornada laboral contratada, ni durante turnos de almuerzo o descansos asignados.
     - Detectar colisiones entre: jornada laboral, horario de clases en aula, turnos de apoyo, sustituciones activas y permisos/vacaciones aprobados en `SolicitudesVacaciones`.
  2. Manejo de excepciones autorizadas:
     - Permitir registrar excepciones justificadas (ej. horas extras autorizadas, eventos institucionales de fin de semana) exigiendo usuario autorizador y motivo formal.
     - Mostrar advertencias visuales descriptivas antes de confirmar cualquier asignación con conflicto de horario.
- **Criterios de Aceptación:**
  - El sistema detecta y bloquea solapamientos entre clases y turnos laborales en backend.
  - No se pueden asignar sustituciones docentes en fechas u horas con permisos de ausencia o vacaciones aprobadas.
  - Se consideran estrictamente las fechas de inicio y fin de vigencia de cada compromiso.
  - Las asignaciones históricas ya vencidas no generan falsos positivos de colisión.
  - Las excepciones autorizadas quedan registradas con trazabilidad del responsable directivo.
- **Estado:** [ ] Pendiente

---

## TAREAS DE PRIORIDAD MEDIA (P2 - VISUALIZACIÓN, EXPORTACIÓN, RECLUTAMIENTO Y SUITE DE REGRESIÓN)

---

### [ ] [F16-Task09] Desarrollar un organigrama institucional interactivo y directorio de personal
- **Origen del Hallazgo:** `AUDITORIA_FASE_16_RECURSOS_HUMANOS.md` / Sección F (Brecha F.5) y Sección H (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Supervisión directiva, claridad organizativa y experiencia de usuario)
- **Archivos Involucrados:**
  - `dashboard-recursos-humanos.html`
  - `js/ui-common.js`
  - `js/accounting.js`
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `CatalogoDepartamentos`
  - `CatalogoCargos`
  - `HistorialAdscripciones`
  - `AsignacionesAmbitosRoles`
  - `CoordinacionesArea`
  - `AreasCurricularesExtensiones`
- **Dependencias Expuestas:** `CatalogoDepartamentos`, `CatalogoCargos`, `HistorialAdscripciones`, `CoordinacionesArea`, `F16-Task01`, `F16-Task06`
- **Descripción del Alcance:**
  El panel de Recursos Humanos presenta información organizativa mediante tablas, pero carece de una representación gráfica dinámica de la estructura institucional que permita a la Dirección y Coordinación visualizar la cadena de mando y las academias docentes.
  Requerimientos Funcionales Detallados:
  1. Componente visual interactivo:
     - Renderizar un organigrama basado en nodos DOM / SVG que muestre departamentos, subdepartamentos, jefaturas, coordinaciones de área y colaboradores adscritos.
     - Controles interactivos: expandir/contraer ramas, zoom, paneo, búsqueda rápida de empleados por nombre/cargo y filtros por departamento y área académica.
     - Diferenciación visual clara entre líneas jerárquicas administrativas y coordinaciones académicas funcionales.
  2. Directorio institucional y privacidad:
     - Permitir alternar entre vista de organigrama jerárquico y vista de directorio telefónico/correo institucional.
     - Si un empleado tiene múltiples responsabilidades (ej. docente y coordinador), mostrarlo como un único colaborador con sus diferentes atribuciones vinculadas.
     - Carga progresiva y optimizada para no saturar memoria ni transferir datos confidenciales de nómina o expedientes médicos.
- **Criterios de Aceptación:**
  - El organigrama se genera dinámicamente desde los datos reales de departamentos y adscripciones.
  - Los cambios en jefaturas o adscripciones se reflejan de inmediato en la visualización.
  - No se producen bucles visuales en la representación de la estructura.
  - Un colaborador con múltiples asignaciones mantiene su identidad única sin duplicar fichas.
  - El visor opera de manera fluida y responsiva en dispositivos de escritorio y móviles.
- **Estado:** [ ] Pendiente

---

### [ ] [F16-Task10] Implementar exportación avanzada de expedientes laborales, reportes y documentos de liquidación
- **Origen del Hallazgo:** `AUDITORIA_FASE_16_RECURSOS_HUMANOS.md` / Sección B (F16-19) y Sección H (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Gestión documental, archivo institucional y exportación para auditorías)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `dashboard-recursos-humanos.html`
  - `js/accounting.js`
  - `ExpedientesLaborales`
  - `ContratosLaborales`
  - `SolicitudesVacaciones`
  - `EvaluacionesDesempenoRegistros`
  - `CapacitacionesCursos`
- **Dependencias Expuestas:** Generadores de documentos, Google Drive, `ExpedientesLaborales`, `ContratosLaborales`
- **Descripción del Alcance:**
  La plataforma cuenta con reportes en pantalla, pero necesita ampliar las opciones de exportación estructurada en PDF y Excel para trámites oficiales, auditorías laborales y archivo físico institucional.
  Requerimientos Funcionales Detallados:
  1. Expediente individual en PDF con membrete institucional:
     - Generar PDF completo o modular permitiendo seleccionar secciones: datos personales, historial de puestos y departamentos, contratos y renovaciones, asistencias consolidadas, vacaciones, capacitaciones, evaluaciones de desempeño y medidas disciplinarias (solo para roles autorizados).
  2. Reportes de personal en Excel:
     - Exportaciones tabulares de personal activo/inactivo, docentes por área académica, contratos por vencer, ausencias e incapacidades con filtros aplicados.
  3. Cierre y liquidación laboral:
     - Generar hojas de cálculo y reportes de finiquito laboral desglosando bases de cálculo, deducciones de ley (IHSS, RAP, ISR) y saldos de vacaciones pendientes con campos para firmas de conformidad.
  4. Seguridad y protección documental:
     - Excluir diagnósticos médicos confidenciales de reportes generales; registrar en auditoría qué usuario generó y descargó cada expediente sensible.
- **Criterios de Aceptación:**
  - El PDF descargado refleja fielmente el historial del expediente seleccionado con formato formal institucional.
  - Los archivos de Excel generados mantienen los formatos de fecha, números y fórmulas consistentes.
  - Los datos médicos confidenciales y salariales están estrictamente aislados según el rol del solicitante.
  - Se registra la bitácora de descarga de expedientes con usuario, fecha y motivo.
- **Estado:** [ ] Pendiente

---

### [ ] [F16-Task11] Automatizar la conversión de candidatos seleccionados en expedientes de empleados
- **Origen del Hallazgo:** `AUDITORIA_FASE_16_RECURSOS_HUMANOS.md` / Sección B (F16-05) y Sección H (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Eficiencia administrativa en reclutamiento y continuidad del ciclo laboral)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `manageJobVacancy`
  - `submitJobCandidate`
  - `createEmployeeRecord`
  - `VacantesLaborales`
  - `CandidatosVacantes`
  - `ExpedientesLaborales`
  - `ContratosLaborales`
  - `F16-Task04`
- **Dependencias Expuestas:** `CandidatosVacantes`, `ExpedientesLaborales`, `ContratosLaborales`, `ChecklistIncorporacion`
- **Descripción del Alcance:**
  El sistema cuenta con gestión de vacantes y postulantes mediante `manageJobVacancy` y `submitJobCandidate`, pero la formalización de un candidato contratado requiere capturar nuevamente sus datos de forma manual, propiciando errores tipográficos o duplicidades.
  Requerimientos Funcionales Detallados:
  1. Conversión fluida de postulante a colaborador:
     - Acción en interfaz para formalizar la contratación de un candidato con estado `Seleccionado`.
     - Precargar automáticamente los datos personales, teléfono, correo electrónico y CV previamente registrados en `CandidatosVacantes`.
     - Validar que la persona no tenga ya un expediente laboral activo previo (detección por DNI/identificación).
     - Crear o vincular el expediente laboral en `ExpedientesLaborales` y registrar el primer contrato en `ContratosLaborales`.
     - Disparar automáticamente la plantilla de checklist de incorporación (`F16-Task04`).
     - Actualizar el estado de la vacante restando las plazas disponibles y marcando la candidatura como `Contratado`.
- **Criterios de Aceptación:**
  - Un candidato seleccionado se convierte en empleado con un solo flujo guiado reutilizando sus datos.
  - Se detectan y alertan posibles expedientes duplicados antes de formalizar la contratación.
  - Se crea el expediente y el contrato inicial quedando enlazados a la lista de onboarding correspondiente.
  - El historial del proceso de selección y entrevistas permanece archivado y consultable.
- **Estado:** [ ] Pendiente

---

### [ ] [F16-Task12] Desarrollar una suite automatizada de pruebas funcionales, integridad, seguridad y concurrencia de la Fase 16
- **Origen del Hallazgo:** `AUDITORIA_FASE_16_RECURSOS_HUMANOS.md` / Sección H (P2) y Sección G
- **Prioridad:** P2
- **Severidad/Clasificación:** Media-alta (Aseguramiento de calidad, prevención de regresiones e integridad laboral)
- **Archivos Involucrados:**
  - `backend/developer-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `tests/regression/academic-grading-suite.js`
- **Dependencias Expuestas:** Suites de pruebas del sistema, endpoints de personal, contratos y permisos
- **Descripción del Alcance:**
  Incorporar una suite integral automatizada `runPhase16HumanResourcesRegressionSuite` que valide de manera continua los contratos, vacaciones del Art. 348, desvinculación en cascada, prevención de jerarquías circulares y seguridad ABAC de la Fase 16.
  Requerimientos Funcionales Detallados:
  1. Batería de pruebas por componentes:
     - Expedientes y contratos: creación, deduplicación, renovaciones y cálculo de días para vencer.
     - Estructura organizativa: departamentos, cargos y detección de grafos circulares en dependencias.
     - Roles internos y áreas académicas: asignación múltiple de áreas sin oferta lectiva y delimitación de coordinadores.
     - Onboarding y offboarding: checklist obligatorio y revocación en cascada de accesos/sesiones al desvincular.
     - Vacaciones y asistencia: cálculo de antigüedad por escala legal hondureña, proyección futura y deducción exacta.
     - Seguridad y ABAC: verificación de que roles no autorizados no puedan acceder a expedientes ajenos ni a diagnósticos médicos.
     - Concurrencia e integridad: pruebas de aprobación simultánea de permisos y llamadas repetidas con idempotencia.
  2. Reporte de resultados con desglose de pruebas ejecutadas, casos superados, fallos y tiempo de ejecución.
- **Criterios de Aceptación:**
  - La suite de regresión valida los contratos y reglas de la Fase 16 con el 100% de éxito en entorno controlado.
  - Las pruebas operan sobre datos aislados sin alterar los registros reales de empleados.
  - No se introduce ninguna regresión sobre las suites de pruebas de fases anteriores (Fases 9, 10, 11 y 15).
- **Estado:** [ ] Pendiente

---

# PENDIENTES - FASE 17: PLANILLAS, COMPENSACIONES Y OBLIGACIONES LABORALES

## TAREAS CRÍTICAS (P0 - SEVERIDAD MÁXIMA, CONDICIONES CONTRACTUALES, NOVEDADES Y RETENCIONES DE LEY)

---

### [ ] [F17-Task01] Eliminar el salario fijo y calcular la remuneración según el contrato vigente de cada empleado
- **Origen del Hallazgo:** `AUDITORIA_FASE_17_PLANILLAS_COMPENSACIONES.md` / Sección E (Brecha E.1) y Sección G (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Integridad financiera, legalidad de pagos y cálculo salarial contractual exacto)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`calculatePayrollPeriod`)
  - Hoja `ContratosLaborales`
  - Hoja `ExpedientesLaborales`
  - Estructuras de planilla y comprobantes de pago
- **Dependencias Expuestas:** `ContratosLaborales`, `ExpedientesLaborales`, `PlanillasNomenclatura`, `BoletasPago`
- **Descripción del Alcance:**
  `calculatePayrollPeriod` utiliza actualmente un salario fijo hardcodeado de L 22,000.00 (`const salarioBase = 22000;`) en lugar de consultar el salario contractual de cada empleado. Esto provoca que trabajadores con condiciones salariales diferentes (docentes, directivos, personal administrativo o de servicio) reciban cálculos idénticos en la nómina.
  Requerimientos Funcionales Detallados:
  1. Consulta dinámica y vinculación de contratos laborales:
     - Obtener el contrato correspondiente a cada empleado mediante su identificador de expediente (`expedienteId`).
     - Seleccionar el contrato cuya vigencia incluya el período de planilla procesado (`fechaInicio` <= fin de período y (`fechaFin` >= inicio de período o vacía/indefinida)).
     - Obtener el salario base, jornada laboral, modalidad de pago y demás condiciones económicas aplicables directamente desde el registro contractual.
     - Admitir empleados con salarios diferentes sin depender de valores predeterminados o constantes fijas en el código.
  2. Proporcionalidad y modificaciones en el período:
     - Determinar el salario proporcional exacto cuando el empleado ingresa, finaliza su relación laboral o cambia de condiciones salariales durante el transcurso del período.
     - Si existen varios contratos o modificaciones salariales dentro de un mismo período, aplicar las condiciones correspondientes a cada intervalo de vigencia de forma ponderada.
     - Mantener separados los valores contractuales históricos de los valores vigentes.
  3. Detección y gestión de incidencias contractuales:
     - Identificar contratos vencidos, futuros, suspendidos, incompletos o superpuestos.
     - Prohibir taxativamente sustituir silenciosamente un salario contractual inexistente por un valor predeterminado (ej. L 22,000.00).
     - Si un empleado no tiene contrato vigente válido, debe identificarse como una incidencia que requiere resolución previa antes de incorporarse a la nómina calculada.
     - Conservar el salario y las condiciones efectivamente utilizadas en el cálculo histórico, de manera que una modificación posterior del contrato no altere retroactivamente una planilla ya calculada o cerrada.
- **Criterios de Aceptación:**
  - Al procesar tres empleados con salarios contractuales diferentes, cada uno recibe su cálculo correspondiente de forma individualizada.
  - Al procesar un empleado que ingresa a mitad del período se calcula el salario proporcional a los días laborados.
  - Al procesar un empleado cuya fecha de salida ocurre dentro del período se liquida únicamente el tiempo devengado.
  - Un cambio salarial con vigencia intermedia en el mes aplica ambas condiciones salariales en sus respectivos intervalos.
  - Intentar procesar un empleado sin contrato vigente genera una incidencia clara y bloquea su inclusión sin asignar salarios arbitrarios.
  - Los contratos superpuestos o ambiguos impiden un cálculo silenciosamente incorrecto.
  - Modificar un contrato no altera los resultados de planillas históricas previamente calculadas o cerradas.
- **Estado:** [ ] Pendiente

---

### [ ] [F17-Task02] Integrar automáticamente las novedades aprobadas en el cálculo de planilla
- **Origen del Hallazgo:** `AUDITORIA_FASE_17_PLANILLAS_COMPENSACIONES.md` / Sección E (Brecha E.2) y Sección G (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Remuneración integral, compensación de horas extras y deducción de ausencias)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`calculatePayrollPeriod`)
  - `AprobacionHorasExtras`
  - `DeduccionesAsistencia`
  - `SolicitudesVacaciones`
  - `IncapacidadesMedicas`
  - `ContratosLaborales`
  - `PlanillasNomenclatura`
- **Dependencias Expuestas:** `AprobacionHorasExtras`, `DeduccionesAsistencia`, `SolicitudesVacaciones`, `IncapacidadesMedicas`, `F17-Task01`
- **Descripción del Alcance:**
  El motor `calculatePayrollPeriod` inicializa en cero las horas extras, sus importes, las bonificaciones y otras deducciones (`horasExtras = 0; montoHorasExtras = 0; bonificaciones = 0; otrasDed = 0;`), sin incorporar los registros aprobados existentes. Asimismo, las tardanzas y ausencias registradas en `DeduccionesAsistencia` no se trasladan a la planilla.
  Requerimientos Funcionales Detallados:
  1. Recopilación e integración de novedades del período:
     - Consultar las novedades correspondientes a cada empleado y al rango de fechas del período de planilla procesado.
     - Incorporar únicamente novedades que cuenten con estado formal de aprobación y que no hayan sido procesadas previamente en otra nómina.
     - Diferenciar nítidamente los tipos de novedad: horas extras aprobadas, tardanzas acumuladas, ausencias injustificadas, permisos remunerados, permisos sin goce de sueldo, incapacidades médicas y bonificaciones autorizadas.
  2. Trazabilidad e idempotencia de novedades:
     - Conservar la referencia del registro de origen (`origenRefId`) para cada valor monetario incorporado.
     - Evitar que una misma novedad se procese más de una vez mediante el marcado de estado a `ProcesadaEnNomina` vinculado al `planillaId`.
     - Diferenciar novedades pendientes, aprobadas, rechazadas, anuladas y ya incorporadas.
     - Identificar novedades registradas con posterioridad al cálculo de una planilla pero que corresponden a dicho período.
     - Evitar que la modificación de una novedad ya incorporada altere silenciosamente una planilla aprobada o cerrada; en su defecto, exigir un ajuste de período o recálculo controlado.
     - Presentar incidencias cuando existan registros incompletos, duplicados, contradictorios o pendientes de autorización.
     - Diferenciar ingresos adicionales y deducciones sin agruparlos indiscriminadamente en campos genéricos.
- **Criterios de Aceptación:**
  - Las horas extras aprobadas se incorporan exactamente una sola vez en el período correspondiente.
  - Las tardanzas y ausencias injustificadas se descuentan conforme a las horas/días reales según la política institucional configurada.
  - Un permiso sin goce de sueldo aprobado se descuenta proporcionalmente al salario diario del trabajador.
  - Un permiso remunerado o vacación aprobada no genera descuentos indebidos en el salario base.
  - Una incapacidad médica aceptada por el IHSS se procesa con su subsidio legal y no se califica como ausencia injustificada.
  - Ejecutar dos veces el cálculo no duplica novedades ni importes devengados o deducidos.
  - Una novedad rechazada o pendiente no afecta el resultado económico de la planilla.
  - El detalle de cada concepto permite rastrear el identificador del registro de asistencia u horas extras de origen.
- **Estado:** [ ] Pendiente

---

### [ ] [F17-Task03] Implementar las aportaciones patronales y separar los costos institucionales de las deducciones del empleado
- **Origen del Hallazgo:** `AUDITORIA_FASE_17_PLANILLAS_COMPENSACIONES.md` / Sección C (C.1), Sección E (Brecha E.3) y Sección G (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Costos laborales institucionales, cumplimiento de seguridad social y exactitud contable)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `PlanillasNomenclatura`
  - `PoliticasFiscales`
  - `AsientosContables`
  - `recordAccountingJournalEntry`
- **Dependencias Expuestas:** `PoliticasFiscales`, `PlanillasNomenclatura`, `AsientosContables`, `F17-Task07`, `F17-Task08`
- **Descripción del Alcance:**
  El cálculo contempla actualmente determinadas retenciones del trabajador (IHSS 3.5% y RAP 1.5%), pero omite por completo las aportaciones patronales obligatorias en Honduras: IHSS patronal (~7.2%), RAP patronal (1.5%) e INFOP (1.0%). Esto impide determinar el costo laboral institucional real y registrar todas las obligaciones patronales por pagar en la contabilidad.
  Requerimientos Funcionales Detallados:
  1. Separación de conceptos obrero vs patronal:
     - Incorporar conceptos independientes para las aportaciones del empleado y las aportaciones a cargo del empleador.
     - Configurar bases de cálculo, porcentajes, techos, exclusiones, condiciones y vigencias para cada aportación.
     - Implementar los cálculos patronales del IHSS (Régimen de Salud y Maternidad + IVM), RAP e INFOP conforme a las disposiciones legales aplicables al período.
     - Mantener estrictamente separados: Salario bruto devengado, Deducciones del empleado, Salario neto a pagar, Aportaciones patronales, Costo laboral institucional total y Obligaciones pendientes de pago.
  2. Protección del salario del trabajador:
     - Prohibir taxativamente que las aportaciones patronales reduzcan el salario neto del trabajador.
     - Identificar los conceptos que integran la base de cada aportación patronal, sin asumir que todas utilizan la misma base imponible.
     - Permitir actualizar porcentajes, techos y reglas mediante parámetros con fecha de vigencia documentada en `PoliticasFiscales`.
     - Conservar los parámetros aplicados en cada planilla histórica.
  3. Integración en reportes y contabilidad:
     - Incorporar los importes patronales en los reportes de costo laboral institucional y en el asiento contable automático.
     - Desglosar las obligaciones patronales por empleado, departamento y período.
- **Criterios de Aceptación:**
  - La aportación patronal se calcula de forma independiente y separada de la deducción obrera.
  - El salario neto del empleado no disminuye por la incorporación de aportaciones patronales.
  - Los techos y porcentajes utilizados corresponden a la configuración vigente del período procesado.
  - Los reportes institucionales muestran por separado el costo salarial, las aportaciones patronales y las deducciones obreras.
  - Los asientos contables automáticos por partida doble incorporan el gasto patronal (Debe) y las cuentas de pasivo por pagar (Haber) manteniendo equilibrio exacto (`Math.abs(totalDebe - totalHaber) <= 0.01`).
  - Las aportaciones patronales no se duplican al recalcular o reintentar el procesamiento de la nómina.
  - Las modificaciones de parámetros normativos no alteran planillas de períodos cerrados.
- **Estado:** [ ] Pendiente

---

### [ ] [F17-Task04] Sustituir el cálculo simplificado del ISR por un motor de retención progresiva y anualizada
- **Origen del Hallazgo:** `AUDITORIA_FASE_17_PLANILLAS_COMPENSACIONES.md` / Sección C (C.1), Sección E (Brecha E.3) y Sección G (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Cumplimiento tributario con el SAR, retención progresiva y prevención de multas)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`calculatePayrollPeriod`)
  - `PoliticasFiscales`
  - `configureFiscalPolicy`
  - `getFiscalPolicies`
- **Dependencias Expuestas:** `PoliticasFiscales`, `PlanillasNomenclatura`, `F17-Task07`, `F17-Task08`
- **Descripción del Alcance:**
  El cálculo actual aplica un 15% fijo sobre el excedente de L 20,000.00 (`salarioBase > 20000 ? (salarioBase - 20000) * 0.15 : 0`), lo cual viola la legislación del Impuesto Sobre la Renta de Honduras (Art. 22). No reproduce el cálculo progresivo anualizado ni contempla deducciones médicas de ley, tramos gravables progresivos, exenciones ni ajustes fiscales.
  Requerimientos Funcionales Detallados:
  1. Motor de retención progresiva anualizada:
     - Implementar el cálculo de retención en la fuente del ISR basado en los tramos oficiales y parámetros fiscales vigentes para cada ejercicio fiscal (ej. escala progresiva del SAR: tramo exento, 15%, 20%, 25%).
     - Proyectar los ingresos gravables anuales del empleado considerando los meses restantes del año fiscal.
     - Deducir los gastos médicos de ley que correspondan (deducción automática legalmente autorizada) y aportaciones a la seguridad social deducibles.
     - Determinar el impuesto anual proyectado aplicando las alícuotas correspondientes a cada tramo gravable progresivo.
     - Deducir las retenciones ya efectuadas en meses anteriores del ejercicio y dividir el saldo entre los meses restantes del año.
  2. Tratamiento de incidencias y cambios salariales:
     - Diferenciar conceptos gravables (sueldos, horas extras, comisiones) de no gravables (13º y 14º mes hasta los topes legales de exención).
     - Recalcular la proyección ante aumentos salariales, bonificaciones extraordinarias o ingresos a mitad de año fiscal.
     - Conservar el detalle de la base gravable proyectada, tramo aplicado, impuesto anual estimado y retención mensual del período.
     - Mantener las tablas fiscales parametrizadas por ejercicio fiscal y fecha de vigencia en `PoliticasFiscales` sin modificar código duro.
- **Criterios de Aceptación:**
  - Se valida el cálculo exacto de ingresos anuales ubicados en cada uno de los tramos de la tabla progresiva vigente del SAR.
  - No se aplica un porcentaje único plano sobre toda la base imponible cuando corresponda tarifa progresiva.
  - Se aplica correctamente el tratamiento de deducciones personales acreditables conforme a ley.
  - Al registrar un aumento salarial a mitad del ejercicio, el sistema recalcula la proyección y ajusta la retención mensual proporcionalmente.
  - Un empleado que ingresa a mitad del año fiscal recibe una proyección basada en los meses efectivos a laborar.
  - Los resultados se contrastan y coinciden con cálculos independientes basados en los parámetros oficiales del ejercicio del SAR.
  - La retención de un período no sobrescribe las retenciones históricas de meses anteriores.
  - La actualización de la tabla tributaria para un nuevo año fiscal no altera los cálculos de planillas cerradas.
- **Estado:** [ ] Pendiente

---

### [ ] [F17-Task05] Crear el cálculo y procesamiento independiente del décimo tercer y décimo cuarto mes
- **Origen del Hallazgo:** `AUDITORIA_FASE_17_PLANILLAS_COMPENSACIONES.md` / Sección C (C.1), Sección E (Brecha E.4) y Sección G (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Beneficios sociales obligatorios en Honduras: Aguinaldo y Décimo Cuarto Mes Decreto 135-94)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `PlanillasNomenclatura`
  - `ContratosLaborales`
  - `ExpedientesLaborales`
  - `BoletasPago`
  - `AsientosContables`
- **Dependencias Expuestas:** `ContratosLaborales`, `PlanillasNomenclatura`, `BoletasPago`, `AsientosContables`, `F17-Task01`, `F17-Task03`
- **Descripción del Alcance:**
  No existe un motor para calcular y procesar las remuneraciones extraordinarias del Décimo Tercer Mes (Aguinaldo, pagadero en diciembre) y Décimo Cuarto Mes de Compensación Social (pagadero en junio conforme al Decreto 135-94). La plataforma no permite gestionar sus períodos de acumulación, proporcionalidad por tiempo laborado, anticipos ni su liquidación al cese laboral.
  Requerimientos Funcionales Detallados:
  1. Motor de remuneraciones extraordinarias independientes:
     - Incorporar el Décimo Tercer y Décimo Cuarto Mes como procesos de planilla extraordinaria diferenciados de la nómina ordinaria mensual.
     - Administrar por separado los períodos legales de acumulación: 13º mes (1 de diciembre al 30 de noviembre) y 14º mes (1 de julio al 30 de junio).
     - Calcular el valor completo (un mes de salario ordinario devengado) cuando se cumpla el período de 12 meses completos.
     - Calcular el valor proporcional matemático en días/meses cuando el empleado tenga menor tiempo de servicio en el período de cómputo.
  2. Salarios base, anticipos y retenciones:
     - Utilizar el promedio de salarios ordinarios devengados o el salario vigente conforme a la normativa y jurisprudencia aplicable.
     - Registrar anticipos previamente otorgados sobre estos beneficios y deducirlos del saldo neto a pagar para evitar duplicaciones.
     - Aplicar la exención tributaria y de seguridad social correspondiente a estos beneficios conforme a las leyes de Honduras.
     - Calcular el beneficio proporcional correspondiente en caso de terminación laboral (finiquito).
  3. Cierre, boletas y contabilidad:
     - Generar planillas extraordinarias independientes con su propio ciclo de aprobación, cierre y boleta de pago en PDF.
     - Registrar los asientos contables automáticos en cuentas diferenciadas de pasivo y gasto.
     - Conservar el historial inmutable de cada beneficio para impedir pagos duplicados.
- **Criterios de Aceptación:**
  - Se calcula el beneficio completo para empleados con el período de acumulación completo.
  - Se calcula el beneficio proporcional exacto para colaboradores con ingresos recientes o períodos fraccionados.
  - Los anticipos otorgados previamente se descuentan del total del beneficio sin errores de saldo.
  - Al procesar una desvinculación laboral se liquida el proporcional de 13º y 14º mes devengado a la fecha de salida.
  - Un beneficio extraordinario ya pagado y cerrado no puede volver a incluirse en otra planilla.
  - Cada beneficio genera su boleta de pago individual y su asiento contable específico.
  - Las reglas y períodos históricos se conservan sin alteración tras actualizar parámetros legales futuros.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ALTA PRIORIDAD (P1 - AMORTIZACIÓN DE PRÉSTAMOS, CATÁLOGO DE CONCEPTOS, DISPERSIÓN ACH Y LOTES)

---

### [ ] [F17-Task06] Automatizar la deducción de anticipos y préstamos y actualizar su amortización al cerrar la planilla
- **Origen del Hallazgo:** `AUDITORIA_FASE_17_PLANILLAS_COMPENSACIONES.md` / Sección B (B.5), Sección E (Brecha E.5) y Sección G (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Recuperación de cuentas por cobrar a empleados y consistencia de amortizaciones)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `requestEmployeeLoanAdvance`
  - `approveEmployeeLoanAdvance`
  - `getLoanAmortizationSchedule`
  - `AnticiposPrestamosEmpleado`
  - `calculatePayrollPeriod`
  - `updatePayrollPeriodStatus`
- **Dependencias Expuestas:** `AnticiposPrestamosEmpleado`, `PlanillasNomenclatura`, `F17-Task02`, `F17-Task07`
- **Descripción del Alcance:**
  La plataforma registra anticipos y préstamos, genera tablas de amortización y calcula cuotas, pero no integra automáticamente esas cuotas en la planilla ni actualiza el saldo pendiente en `AnticiposPrestamosEmpleado` después del cierre formal.
  Requerimientos Funcionales Detallados:
  1. Integración automática de cuotas en nómina:
     - Recuperar las obligaciones aprobadas y vigentes de cada empleado en `AnticiposPrestamosEmpleado`.
     - Identificar la cuota correspondiente al período de la planilla e incorporarla automáticamente en `otrasDeducciones` sin captura manual.
     - Distinguir entre anticipos de salario (recuperables en 1 cuota) y préstamos institucionales (amortizables en N cuotas).
     - Validar que el descuento de la cuota nunca exceda el `SaldoPendiente` de la obligación ni deje un salario neto negativo.
  2. Actualización de saldos al cierre:
     - Actualizar la amortización (reducir `SaldoPendiente` e incrementar cuotas pagadas) única y exclusivamente cuando la planilla alcance el estado `Cerrada` o `Aprobada`.
     - Un cálculo preliminar (`Calculada`) no debe reducir el saldo de la obligación.
     - Si una planilla se anula o revierte, restituir automáticamente el saldo pendiente o registrar el reverso compensatorio.
     - Evitar que un mismo préstamo genere dos descuentos dentro del mismo período de pago.
     - Permitir suspender, renegociar o liquidar anticipadamente una obligación mediante autorización documentada.
- **Criterios de Aceptación:**
  - La cuota aprobada de un préstamo se incorpora automáticamente en la nómina del empleado.
  - El saldo del préstamo en `AnticiposPrestamosEmpleado` permanece intacto mientras la planilla esté en estado preliminar `Calculada`.
  - Al cerrar la planilla, el saldo pendiente disminuye exactamente por el valor de la cuota y se actualiza el número de cuotas restantes.
  - La última cuota de amortización ajusta el saldo restante a exactamente 0.00 marcando el préstamo como `Liquidado`.
  - Reintentar o recalcular la planilla no genera deducciones dobles del mismo préstamo.
  - La anulación de una planilla restituye el saldo del préstamo con auditoría inmutable.
- **Estado:** [ ] Pendiente

---

### [ ] [F17-Task07] Implementar un catálogo dinámico de conceptos salariales, reglas de cálculo y ajustes
- **Origen del Hallazgo:** `AUDITORIA_FASE_17_PLANILLAS_COMPENSACIONES.md` / Sección B (B.2) y Sección G (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Flexibilidad salarial, parametrización de ingresos/deducciones y reglas de negocio)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `PlanillasNomenclatura`
  - `PoliticasFiscales`
  - `dashboard-recursos-humanos.html`
  - `dashboard-contabilidad.html`
  - Nueva hoja `CatalogoConceptosPlanilla`
- **Dependencias Expuestas:** `PlanillasNomenclatura`, `PoliticasFiscales`, `AsientosContables`, `F17-Task01`, `F17-Task03`, `F17-Task04`
- **Descripción del Alcance:**
  `PlanillasNomenclatura` contiene conceptos salariales definidos mediante columnas fijas rígidas. No permite administrar adecuadamente conceptos nuevos, bonificaciones personalizadas, comisiones, deducciones voluntarias ni reglas de cálculo dinámicas.
  Requerimientos Funcionales Detallados:
  1. Catálogo administrable de conceptos de nómina:
     - Crear la entidad y hoja `CatalogoConceptosPlanilla` para crear, editar, activar y desactivar conceptos salariales.
     - Clasificación por categorías: Ingresos ordinarios, Horas extras, Bonificaciones fijas/variables, Comisiones, Incentivos, Deducciones legales, Deducciones voluntarias, Aportaciones patronales, Beneficios y Ajustes extraordinarios.
     - Atributos por concepto: código único, nombre, descripción, naturaleza contable (Debe/Haber), tipo de cálculo (Fijo, Porcentaje, Proporcional, Fórmula), base de cálculo, frecuencia, vigencia, tratamiento tributario ISR (gravado/exento), tratamiento seguridad social IHSS/RAP (cotizable/no cotizable), cuenta contable asociada y visibilidad en boleta de pago.
  2. Secuenciación y reglas de cálculo:
     - Permitir conceptos recurrentes y conceptos de aplicación única.
     - Asignación por empleado individual, por departamento, por cargo o por estructura salarial.
     - Establecer orden o prioridad de cálculo cuando un concepto dependa del resultado de otro.
     - Validar que no existan fórmulas circulares ni referencias a conceptos inexistentes.
     - Conservar el histórico de reglas y evitar que una modificación futura altere planillas históricas cerradas.
- **Criterios de Aceptación:**
  - Se pueden crear y administrar conceptos salariales dinámicos desde la interfaz sin alterar la estructura fija de Sheets.
  - Una bonificación configurada se aplica únicamente a los colaboradores que cumplan las condiciones de elegibilidad.
  - Un concepto configurado como costo patronal se incorpora al asiento contable sin reducir el salario neto del empleado.
  - Los conceptos marcados como no visibles en boleta se procesan para contabilidad sin exponerse al trabajador.
  - Se vincula cada concepto con su respectiva cuenta contable para el asiento automático.
  - Se bloquean fórmulas con dependencias circulares o parámetros incompletos.
  - Desactivar un concepto no altera los registros de planillas cerradas.
- **Estado:** [ ] Pendiente

---

### [ ] [F17-Task08] Incorporar una interfaz completa de administración de políticas fiscales, laborales y parámetros de cálculo
- **Origen del Hallazgo:** `AUDITORIA_FASE_17_PLANILLAS_COMPENSACIONES.md` / Sección B (B.7), Sección G y Sección H (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Parametrización contable, gobernanza tributaria y actualización normativa)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`configureFiscalPolicy`, `getFiscalPolicies`)
  - `PoliticasFiscales`
  - `dashboard-recursos-humanos.html`
  - `dashboard-contabilidad.html`
- **Dependencias Expuestas:** `PoliticasFiscales`, `configureFiscalPolicy`, `F17-Task03`, `F17-Task04`, `F17-Task07`
- **Descripción del Alcance:**
  Existen funciones básicas en backend (`configureFiscalPolicy` y `getFiscalPolicies`), pero carecen de una interfaz gráfica completa y amigable para gestionar, auditar y actualizar los parámetros laborales y tributarios de Honduras utilizados en los cálculos.
  Requerimientos Funcionales Detallados:
  1. Consola administrativa de políticas y techos:
     - Visualizar y administrar parámetros por tipo de obligación: ISR (tabla progresiva anual del SAR), IHSS (techos de Salud y Maternidad / IVM y tasas obrero-patronales), RAP (techo y porcentajes), INFOP (1.0% patronal), salario mínimo por actividad económica y recargos de horas extras del Art. 330.
     - Consultar valores activos, versiones y fechas de vigencia.
     - Crear y modificar parámetros sin tocar directamente Google Sheets, exigiendo fuente normativa oficial (acuerdo ejecutivo, ley o decreto) y justificación.
  2. Trazabilidad y control de vigencias:
     - Almacenar historial de versiones de cada parámetro con usuario que autorizó el cambio y timestamp.
     - Identificar parámetros próximos a vencer o sin vigencia definida.
     - Modo borrador/revisión: permitir preparar actualizaciones normativas (ej. cambio anual de techos del IHSS o tramos del ISR) y someterlas a validación antes de su activación.
     - Advertir visualmente si una planilla se va a procesar con parámetros legales vencidos o desactualizados.
     - Evitar que una actualización se aplique retroactivamente sobre planillas de períodos cerrados.
- **Criterios de Aceptación:**
  - El contador o administrador puede actualizar los techos del IHSS y tramos del ISR desde la interfaz.
  - Toda modificación de un parámetro exige registrar la fuente normativa de respaldo.
  - Un usuario sin permisos de rol financiero no puede modificar los parámetros legales.
  - Los parámetros con vigencia futura no afectan los cálculos de nóminas del período corriente.
  - Al consultar una planilla histórica se visualizan con exactitud los parámetros legales vigentes al momento de su cierre.
- **Estado:** [ ] Pendiente

---

### [ ] [F17-Task09] Implementar la generación masiva y distribución segura de comprobantes de pago
- **Origen del Hallazgo:** `AUDITORIA_FASE_17_PLANILLAS_COMPENSACIONES.md` / Sección B (B.6) y Sección G (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Entrega de comprobantes de pago, privacidad salarial y comunicación al personal)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`generatePayrollReceiptPDF`, `getStaffPayrollReceipt`)
  - `BoletasPago`
  - `PlanillasNomenclatura`
  - `backend/user-service/Code.gs`
  - Portal de autoservicio del empleado
- **Dependencias Expuestas:** `generatePayrollReceiptPDF`, `BoletasPago`, `sendMultiChannelNotification`, Google Drive
- **Descripción del Alcance:**
  La generación individual de boletas PDF está implementada y verificada, pero no existe un flujo de distribución masiva que permita generar y enviar las boletas de pago a toda la planilla de colaboradores de forma controlada y segura.
  Requerimientos Funcionales Detallados:
  1. Generación y distribución en lote:
     - Seleccionar una planilla en estado `Cerrada` y generar en lote todas las boletas de pago en PDF membretado.
     - Enviar los comprobantes por correo electrónico a la dirección institucional de cada empleado registrado en `Usuarios`.
     - Mostrar vista previa de cantidad de boletas, empleados con correo válido e incidencias por correos faltantes antes del envío masivo.
     - Envío individualizado estricto: garantizar que ningún colaborador reciba la boleta de otro empleado.
  2. Seguridad y privacidad del contenido:
     - Prohibir incluir salarios o datos financieros sensibles en el asunto o cuerpo abierto del correo electrónico.
     - Enlace seguro protegido por token de sesión o archivo PDF adjunto con clave.
     - Registrar estado de distribución de cada comprobante: `Pendiente`, `Enviado`, `Fallido`, `Reintentable`.
     - Permitir reintentar únicamente los envíos que hayan fallado sin duplicar los correos ya entregados exitosamente.
     - Mantener la disponibilidad permanente de descarga histórica de la boleta desde el portal de autoservicio (`getEmployeeSelfServicePortal`).
     - Bloquear la distribución masiva si la planilla no ha sido aprobada y cerrada formalmente.
- **Criterios de Aceptación:**
  - Se pueden generar y despachar todas las boletas de una planilla cerrada con una sola acción administrativa.
  - Cada colaborador recibe exclusivamente su propia boleta de pago.
  - Los empleados sin correo institucional válido quedan listados como incidencias a resolver.
  - Un fallo de conexión en el servidor de correo permite reintentar solo los envíos pendientes sin duplicados.
  - El sistema impide despachar boletas de planillas que permanezcan en estado preliminar `Calculada`.
  - La boleta continúa accesible y descargable desde el portal de autoservicio del empleado.
- **Estado:** [ ] Pendiente

---

### [ ] [F17-Task10] Incorporar exportación bancaria para dispersión masiva de salarios
- **Origen del Hallazgo:** `AUDITORIA_FASE_17_PLANILLAS_COMPENSACIONES.md` / Sección G y Sección H (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Eficiencia en tesorería escolar, pagos ACH y automatización bancaria)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `PlanillasNomenclatura`
  - `ContratosLaborales`
  - `ExpedientesLaborales`
  - `AsientosContables`
  - `dashboard-contabilidad.html`
- **Dependencias Expuestas:** `PlanillasNomenclatura`, `ExpedientesLaborales`, Datos bancarios de empleados
- **Descripción del Alcance:**
  No existe una función de exportación bancaria que permita preparar y generar archivos estructurados de pago masivo (formato ACH o transferencias interbancarias de Honduras) a partir de una planilla aprobada y cerrada.
  Requerimientos Funcionales Detallados:
  1. Generador de archivos de dispersión de fondos:
     - Seleccionar una planilla en estado `Cerrada` y preparar el archivo de dispersión bancaria para su carga en banca corporativa.
     - Recuperar los salarios netos aprobados y los datos bancarios validados del empleado (banco destino, número de cuenta, tipo de cuenta, DNI/RTN).
     - Formatos estructurados configurables según el banco receptor (ej. BAC Credomatic, Banco Ficohsa, Banco Atlántida o formato estándar ACH).
     - Validación previa: identificar y separar empleados con cuentas bancarias incompletas o inválidas antes de generar el archivo.
  2. Control de tesorería y seguridad:
     - Resumen previo: cantidad de transferencias, importe total a dispersar y empleados excluidos.
     - Evitar que una misma planilla genere archivos de pago duplicados sin una advertencia explícita al operador.
     - Auditoría estricta: registrar quién generó el archivo, timestamp y hash del contenido para conciliar con el extracto bancario.
     - Protección de datos bancarios: limitar la exportación y visualización a roles autorizados (`Contador`, `Director`, `Administrador`).
     - Diferenciar claramente la generación del archivo plano de la confirmación efectiva de las transferencias.
- **Criterios de Aceptación:**
  - La sumatoria de las transferencias del archivo bancario generado coincide exactamente con el total neto de la planilla cerrada.
  - Los colaboradores con datos de cuenta bancaria incompletos se excluyen y se presentan en un reporte de incidencias.
  - El archivo generado respeta las especificaciones técnicas del formato bancario seleccionado.
  - Se bloquea la generación duplicada accidental del mismo lote de pago bancario.
  - Los datos bancarios y salarios netos permanecen estrictamente protegidos bajo permisos RBAC.
- **Estado:** [ ] Pendiente

---

### [ ] [F17-Task11] Integrar correctamente las obligaciones patronales con la contabilidad por partida doble
- **Origen del Hallazgo:** `AUDITORIA_FASE_17_PLANILLAS_COMPENSACIONES.md` / Sección B (B.7), Sección E y Sección G (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Consistencia contable, balance por partida doble y provisiones laborales)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`updatePayrollPeriodStatus`, `recordAccountingJournalEntry`)
  - `AsientosContables`
  - `PlanillasNomenclatura`
  - `dashboard-contabilidad.html`
- **Dependencias Expuestas:** `recordAccountingJournalEntry`, `AsientosContables`, `PlanillasNomenclatura`, `F17-Task03`, `F17-Task07`
- **Descripción del Alcance:**
  La integración contable actual asienta únicamente salarios brutos (5101), deducciones obreras (2101) y neto por pagar (1101). Al incorporar aportaciones patronales de ley (IHSS, RAP, INFOP) y nuevos conceptos salariales, la integración debe ampliarse para contabilizar el costo patronal institucional completo sin desbalancear la partida doble.
  Requerimientos Funcionales Detallados:
  1. Asiento contable integral de nómina:
     - Conservar el asiento equilibrado existente ampliándolo con líneas contables para aportaciones patronales.
     - Cuentas de Gasto (Debe): Salarios ordinarios (5101), Horas extras y recargos (5102), Aportaciones patronales IHSS (5103), Aportaciones patronales RAP (5104), Aporte patronal INFOP (5105).
     - Cuentas de Pasivo por Pagar (Haber): Retenciones obreras IHSS por pagar (2101), Retenciones obreras RAP por pagar (2102), Retenciones ISR por pagar (2103), Obligaciones patronales IHSS por pagar (2104), Obligaciones patronales RAP por pagar (2105), INFOP por pagar (2106), Préstamos y anticipos por cobrar (1105 - acreditación de saldo), y Sueldos netos por pagar / Bancos (1101).
  2. Verificación de balance y trazabilidad:
     - Validar que la sumatoria total del Debe sea idéntica a la sumatoria del Haber (`Math.abs(totalDebe - totalHaber) <= 0.01`).
     - Vincular el identificador del asiento contable generado (`AST-...`) con el `planillaId` en `PlanillasNomenclatura`.
     - Evitar generar asientos contables duplicados ante reintentos o consultas de estado de la planilla.
     - Manejo de correcciones: si una planilla cerrada se rectifica, generar un asiento de ajuste contable compensatorio documentado sin alterar el asiento original.
- **Criterios de Aceptación:**
  - El asiento contable generado refleja el gasto laboral completo (salarios brutos + aportes patronales) equilibrado contra pasivos y bancos.
  - La sumatoria de débitos y créditos coincide con una tolerancia máxima de 0.01 Lempiras.
  - Las obligaciones patronales incrementan el gasto institucional y no reducen el salario neto de los colaboradores.
  - Reintentar la operación de cierre de planilla no genera un asiento contable duplicado.
  - Los totales contables coinciden exactamente con el resumen de nómina presentado a Recursos Humanos.
- **Estado:** [ ] Pendiente

---

### [ ] [F17-Task12] Mejorar el procesamiento de planillas por lotes y la revisión comparativa de resultados
- **Origen del Hallazgo:** `AUDITORIA_FASE_17_PLANILLAS_COMPENSACIONES.md` / Sección B (B.3) y Sección G (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Productividad en Recursos Humanos, detección de variaciones y auditoría previa al cierre)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`calculatePayrollPeriod`, `getPayrollPeriodSummary`)
  - `PlanillasNomenclatura`
  - `dashboard-recursos-humanos.html`
  - `dashboard-contabilidad.html`
- **Dependencias Expuestas:** `calculatePayrollPeriod`, `getPayrollPeriodSummary`, `F17-Task01`, `F17-Task02`, `F17-Task07`
- **Descripción del Alcance:**
  El ciclo de planilla existe y funciona en su flujo básico, pero carece de capacidades para procesar por lotes segmentados (departamentos, tipos de contrato, frecuencias de pago) y para comparar variaciones atípicas de nómina respecto a meses anteriores antes de la aprobación definitiva.
  Requerimientos Funcionales Detallados:
  1. Procesamiento y segmentación por lotes:
     - Permitir preparar y calcular la planilla filtrando por departamento, cargo, tipo de contrato o modalidad de pago.
     - Visualizar el resumen consolidado de nómina con navegación inmediata hacia el detalle individual de cada colaborador.
     - Contadores de estado: cantidad de empleados incluidos, procesados satisfactoriamente, excluidos por incidencias y pendientes de validación.
  2. Análisis comparativo intermensual de variaciones:
     - Identificar colaboradores con variaciones salariales significativas respecto al mes anterior (ej. variación > 10% en ingresos o deducciones).
     - Mostrar las causas de las variaciones: nuevas horas extras, inicio de amortización de préstamos, cambio salarial de contrato o ausencias.
     - Permitir recalcular únicamente los colaboradores corregidos sin necesidad de procesar nuevamente a toda la plantilla.
     - Comparar dos períodos fiscales cualesquiera mostrando diferencias absolutas y porcentuales por rubro.
- **Criterios de Aceptación:**
  - Se puede calcular y consultar la nómina segmentando por departamentos o categorías de empleados.
  - El sistema detecta y resalta visualmente variaciones atípicas de sueldo neto respecto al mes previo.
  - Se puede consultar el desglose de causas que originaron la diferencia salarial de un colaborador.
  - Los totales individuales suman con exactitud milimétrica el consolidado general de la planilla.
  - La interfaz permite buscar y filtrar colaboradores por nombre, puesto o estado de cálculo sin recargar la pantalla.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ASEGURAMIENTO Y CALIDAD (P2 - SUITE DE REGRESIÓN DE LA FASE 17)

---

### [ ] [F17-Task13] Implementar una suite automatizada de pruebas de cálculo, integración y regresión de planillas
- **Origen del Hallazgo:** `AUDITORIA_FASE_17_PLANILLAS_COMPENSACIONES.md` / Sección G y Sección H (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media-alta (Aseguramiento de calidad, prevención de regresiones y precisión matemática salarial)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/developer-service/Code.gs`
  - `tests/regression/academic-grading-suite.js`
- **Dependencias Expuestas:** Suites de pruebas del sistema, endpoints de nómina, horas extras y contabilidad
- **Descripción del Alcance:**
  Incorporar una suite integral automatizada `runPhase17PayrollAndCompensationRegressionSuite` que valide de manera continua la exactitud matemática de las planillas, retenciones hondureñas, horas extras, amortización de préstamos y la integración contable.
  Requerimientos Funcionales Detallados:
  1. Batería de pruebas por áreas temáticas:
     - Salarios contractuales: salarios diferenciados por empleado, vigencias contractuales y proporcionalidad en ingresos/salidas intermedias.
     - Horas extras y novedades: recargos del Art. 330 (25% diurna, 50% nocturna), deducciones de tardanzas y permisos sin goce.
     - Deducciones de ley y aportes patronales: techos y alícuotas del IHSS (3.5% obrero / ~7.2% patronal), RAP (1.5% obrero / 1.5% patronal) e INFOP (1.0% patronal).
     - ISR progresivo: proyección anual, deducción médica de L 40,000.00 y aplicación de tramos del Art. 22 de la Ley del ISR.
     - Amortización de préstamos: deducción de cuota y actualización de saldo al cierre sin duplicaciones.
     - Décimo tercer y décimo cuarto mes: cálculo completo y proporcional con anticipos deducidos.
     - Integración contable: verificación de balance por partida doble en el asiento generado (`totalDebe === totalHaber`).
     - Boletas y autoservicio: generación de PDF y aislamiento estricto ABAC frente a accesos ajenos.
  2. Reporte de resultados con desglose de pruebas ejecutadas, métricas de cobertura y prevención de regresiones en las Fases 9, 10, 11, 15 y 16.
- **Criterios de Aceptación:**
  - La suite de regresión valida los cálculos de planilla con 100% de éxito en entorno controlado.
  - Se ejecutan pruebas de estrés con salarios extremos y empleados con múltiples novedades sin desbordamientos aritméticos.
  - Las pruebas operan sobre datos aislados sin alterar las planillas reales de producción.
  - La suite no produce regresiones en las 53 pruebas previas verificadas del sistema.
- **Estado:** [ ] Pendiente

---

# PENDIENTES - FASE 18: COMPRAS, PROVEEDORES Y CONTRATACIÓN DE SERVICIOS

## TAREAS CRÍTICAS (P0 - SEVERIDAD MÁXIMA, RECEPCIONES PARCIALES, THREE-WAY MATCHING, INTERFAZ Y COMPROMISOS)

---

### [ ] [F18-Task01] Corregir el control de recepciones parciales y entregas escalonadas
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección E (Brecha E.1) y Sección G (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Integridad en recepción física de compras, control de inventario y prevención de pérdidas)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`recordPurchaseReceipt`)
  - `OrdenesCompra`
  - `RecepcionesCompra`
  - `InventariosKardex`
- **Dependencias Expuestas:** `OrdenesCompra`, `RecepcionesCompra`, `InventariosKardex`, `recordInventoryMovement`
- **Descripción del Alcance:**
  Actualmente, `recordPurchaseReceipt` cambia incondicionalmente el estado de la orden a `RecibidaTotal` después de registrar la primera recepción, sin comprobar si se recibió la totalidad de las cantidades autorizadas (`ordSheet.getRange(oIdx + 1, 10).setValue("RecibidaTotal");`). Esto impide registrar entregas posteriores y provoca que desaparezcan del seguimiento las cantidades pendientes de recibir.
  Requerimientos Funcionales Detallados:
  1. Recepciones múltiples y cálculo acumulado:
     - Permitir registrar varias recepciones asociadas a una misma orden de compra.
     - Mantener el detalle de las cantidades solicitadas, recibidas, rechazadas, devueltas y pendientes por cada partida.
     - Calcular las cantidades acumuladas recibidas considerando todas las recepciones válidas registradas para la orden.
     - Determinar el estado de recepción de cada partida individual y de la orden completa.
     - Admitir entregas parciales de diferentes artículos en fechas distintas.
     - Registrar cada recepción como un documento independiente en `RecepcionesCompra`, con identificador único (`REC-CMP-...`), fecha, responsable, observaciones y documentos adjuntos.
  2. Gestión de incidencias físicas y devoluciones:
     - Permitir registrar productos faltantes, sobrantes, dañados, incorrectos o rechazados sin contabilizarlos como unidades conformes.
     - Permitir registrar devoluciones posteriores a una recepción, conservando el historial y ajustando las existencias disponibles en `InventariosKardex`.
     - Mantener las cantidades pendientes abiertas aunque la orden tenga varias recepciones previas.
     - Evitar que una recepción repetida por doble clic, reintento o interrupción de conexión incremente dos veces las existencias físicas.
     - Conservar la relación entre cada recepción, la orden de compra original y sus movimientos de inventario en Kardex.
     - Permitir consultar todas las recepciones asociadas a una orden y el detalle de cada una.
  3. Estados del ciclo de recepción de órdenes:
     - `PendienteRecepcion`, `RecibidaParcial`, `RecibidaTotal`, `EnDisputa`, `Cancelada`.
     - La orden solo debe pasar a `RecibidaTotal` cuando todas sus partidas estén completamente recibidas y conformes, o cuando las cantidades restantes hayan sido formalmente canceladas o resueltas mediante una operación autorizada.
- **Criterios de Aceptación:**
  - Registrar una recepción de 5 unidades para una orden de 10 y comprobar que la orden pasa a `RecibidaParcial` manteniendo 5 pendientes.
  - Registrar una segunda recepción de 3 unidades y comprobar que quedan 2 pendientes.
  - Registrar las 2 unidades restantes y comprobar que la orden pasa a `RecibidaTotal`.
  - Recibir diferentes partidas en fechas distintas sin cerrar prematuramente la orden de compra.
  - Registrar unidades dañadas y verificar que no se contabilizan como recepción conforme.
  - Registrar una devolución y comprobar que se conserva el historial y se ajustan las cantidades en Kardex.
  - Intentar recibir cantidades superiores a las autorizadas genera una restricción o exige una autorización excepcional documentada.
  - Repetir una operación de recepción no duplica los movimientos de inventario.
  - Cada recepción conserva su identificador único y su vínculo persistente con la orden original.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task02] Implementar conciliación documental de tres vías entre orden, recepción y factura
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección E (Brecha E.2) y Sección G (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Prevención de fraudes, sobreprecios, control de egresos y conciliación de tres documentos)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`recordAccountsPayableExpense`, nueva función `verifyThreeWayMatch`)
  - `OrdenesCompra`
  - `RecepcionesCompra`
  - `CuentasPorPagarGastos`
- **Dependencias Expuestas:** `OrdenesCompra`, `RecepcionesCompra`, `CuentasPorPagarGastos`, `F18-Task01`
- **Descripción del Alcance:**
  Actualmente, las facturas pueden registrarse sin comparar los importes autorizados en la orden de compra con las cantidades realmente recibidas. Esto permite que se tramiten obligaciones por productos no entregados o por precios diferentes a los aprobados. También se genera una obligación identificada como `FCT-REC-...` al registrar la recepción física, confundiendo el albarán de entrega con la factura fiscal del proveedor.
  Requerimientos Funcionales Detallados:
  1. Motor de conciliación de tres vías (Three-Way Matching):
     - Implementar la función `verifyThreeWayMatch` que compare:
       * Orden de compra: cantidades, precios unitarios y condiciones autorizadas.
       * Recepción: cantidades efectivamente recibidas y aceptadas en bodega.
       * Factura del proveedor: cantidades, precios, impuestos y cargos facturados.
     - Comparar cada partida mediante identificador de producto/servicio, descripción, unidad de medida y relación con la orden.
     - Comparar cantidades pedidas, recibidas, aceptadas y facturadas.
     - Comparar precios unitarios, descuentos, impuestos, transporte y otros cargos, calculando diferencias monetarias y porcentuales.
     - Configurar tolerancias autorizadas parametrizables por concepto (ej. +/- 0.05 Lempiras por redondeo), sin permitir que una tolerancia oculte cantidades no recibidas.
  2. Detección de discrepancias y bloqueos:
     - Detectar facturación de artículos que no aparecen en la orden de compra.
     - Detectar cantidades facturadas superiores a las recibidas y aceptadas en `RecepcionesCompra`.
     - Detectar precios unitarios superiores a los formalmente aprobados en la orden.
     - Detectar diferencias en impuestos, descuentos y cargos adicionales.
     - Permitir facturación parcial cuando corresponda a cantidades realmente recibidas y conformes.
     - Permitir facturas relacionadas con varias recepciones de una misma orden.
     - Bloquear el avance automático al pago cuando existan diferencias no justificadas.
     - Permitir que un responsable autorizado (Director / Administrador) revise y resuelva diferencias mediante aprobación documentada (`DiferenciaAutorizada`).
  3. Desacoplamiento de recepción y factura fiscal:
     - Separar completamente el registro de recepción física del registro de factura fiscal del proveedor.
     - Eliminar la generación automática de facturas ficticias (`FCT-REC-...`) al registrar recepciones; la recepción debe producir su propio documento y movimiento de inventario, sin simular una factura fiscal.
  4. Estados de conciliación:
     - `PendienteConciliacion`, `Conciliada`, `ConDiferencias`, `EnDisputa`, `DiferenciaAutorizada`, `Rechazada`.
- **Criterios de Aceptación:**
  - Registrar una orden de 10 unidades, una recepción de 8 y una factura de 10; el sistema detecta la discrepancia de 2 unidades no recibidas.
  - Registrar una factura por una cantidad superior a la recibida y comprobar que se bloquea su aprobación automática para pago.
  - Registrar un precio unitario superior al autorizado y comprobar que se identifica la diferencia porcentual y absoluta.
  - Registrar una factura parcial que coincide con las cantidades recibidas y verificar que se concilia satisfactoriamente.
  - Registrar una factura con impuestos o cargos diferentes y comprobar que se presenta el desglose detallado de diferencias.
  - La autorización de una discrepancia exige rol directivo autorizado registrando usuario, fecha y justificación.
  - Una recepción de bodega física no crea automáticamente facturas fiscales en `CuentasPorPagarGastos`.
  - Reprocesar la conciliación no duplica obligaciones contables ni asientos en el libro diario.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task03] Desarrollar la interfaz operativa completa del módulo de compras
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección E (Brecha E.3) y Sección G (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Operatividad del usuario, eliminación de dependencia de Sheets y productividad administrativa)
- **Archivos Involucrados:**
  - `dashboard-contabilidad.html`
  - `js/accounting.js` (`renderComprasModule`)
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** `dashboard-contabilidad.html`, `js/accounting.js`, Servicios de compras del backend, `F18-Task01`, `F18-Task02`
- **Descripción del Alcance:**
  La pestaña `compras` en `dashboard-contabilidad.html` presenta únicamente un mensaje de texto estático y no permite operar las funciones de compras desde la plataforma. Las capacidades existentes en el backend no están disponibles mediante una interfaz funcional para los usuarios finales.
  Requerimientos Funcionales Detallados:
  1. Panel principal con indicadores en tiempo real:
     - Solicitudes pendientes y en revisión, cotizaciones en espera, órdenes pendientes de aprobación, órdenes pendientes de entrega, recepciones parciales, facturas pendientes de conciliación, facturas pendientes de pago, cuentas por pagar por vencer, facturas vencidas y contratos por expirar.
  2. Secciones operativas interactivas:
     - Solicitudes de compra (creación, detalle, aprobaciones).
     - Cotizaciones (carga de ofertas, visualización de adjuntos).
     - Comparación y adjudicación de ofertas.
     - Órdenes de compra (emisión, seguimiento de estados, descarga PDF).
     - Recepciones de mercancía (registro de entregas totales y parciales).
     - Directorio de proveedores y contratos.
     - Facturas de proveedores y cuentas por pagar.
     - Seguimiento presupuestario por centro de costo.
  3. Búsqueda, filtros y usabilidad:
     - Búsqueda por identificador, descripción, proveedor, departamento y período.
     - Ordenamiento por fecha, monto y estado.
     - Modales de formulario interactivos con validación de campos obligatorios, mensajes descriptivos de error y confirmación de acciones irreversibles.
     - Deshabilitado preventivo de botones durante llamadas asíncronas para evitar dobles envíos.
     - Adaptación responsiva para pantallas de escritorio, tabletas y móviles.
- **Criterios de Aceptación:**
  - La pestaña `compras` deja de ser estática y renderiza las secciones operativas completas con datos del backend.
  - Un usuario autorizado puede crear, consultar y aprobar solicitudes de compra desde la interfaz.
  - Se pueden registrar cotizaciones, comparar ofertas y adjudicar proveedores visualmente.
  - El responsable de almacén o compras puede registrar recepciones totales y parciales desde la pantalla.
  - Contabilidad puede revisar facturas de proveedores y el resultado de la conciliación de tres vías.
  - Los usuarios sin permisos no pueden ejecutar operaciones mediante llamadas directas.
  - Las operaciones repetidas no generan registros duplicados en el backend.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task04] Implementar documentos PDF oficiales para órdenes de compra y ampliar su ciclo de estados
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (B.3), Sección E y Sección G (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Formalización contractual de adquisiciones y emisión documental oficial)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`createPurchaseOrder`, `approvePurchaseOrder`, nueva función `generatePurchaseOrderPDF`)
  - `OrdenesCompra`
  - Almacenamiento documental en Google Drive
- **Dependencias Expuestas:** `OrdenesCompra`, Google Drive API, `createPurchaseOrder`, `approvePurchaseOrder`
- **Descripción del Alcance:**
  Las órdenes de compra se almacenan como registros planos en la hoja `OrdenesCompra`, pero no cuentan con un documento oficial descargable en PDF para formalizar y comunicar la adquisición al proveedor. Además, su ciclo de estados es rígido y no representa adecuadamente el envío, aceptación y recepción parcial.
  Requerimientos Funcionales Detallados:
  1. Generación de PDF oficial de Orden de Compra:
     - Implementar la función `generatePurchaseOrderPDF` en `backend/accounting-service/Code.gs`.
     - Estructura formal del documento: membrete y logotipo institucional de New Generation Christian Academy, número correlativo único (`ORD-CMP-...`), fecha de emisión, datos del proveedor (razón social, RTN, dirección, contacto), departamento y solicitante de origen, referencia a la solicitud y cotización aprobadas, tabla detallada de partidas (código, descripción, cantidad, unidad, precio unitario, subtotal), descuentos, desglose de impuestos (ISV 15% cuando aplique / exento), transporte, total general en Lempiras y letras, moneda, condiciones comerciales de pago, dirección y fecha estimada de entrega, y firmas de aprobación de Dirección/Contabilidad.
     - Versionado documental: si se modifica una orden emitida, generar una nueva versión identificable sin sobrescribir el archivo histórico anterior.
  2. Ampliación del ciclo de vida de estados de la orden:
     - Transiciones permitidas: `Borrador` -> `PendienteAprobacion` -> `Aprobada` -> `Emitida` -> `EnviadaProveedor` -> `AceptadaProveedor` / `RechazadaProveedor` -> `PendienteRecepcion` -> `RecibidaParcial` -> `RecibidaTotal` -> `EnDisputa` -> `Cerrada` -> `Cancelada`.
     - Validar que una orden no pueda enviarse al proveedor antes de contar con aprobación formal.
     - Registrar fecha y responsable de cada transición de estado en la bitácora de la orden.
- **Criterios de Aceptación:**
  - Se genera un documento PDF oficial con diseño profesional para toda orden de compra aprobada.
  - Los importes, impuestos y subtotales del PDF coinciden exactamente con los registros de la base de datos.
  - Una modificación de una orden aprobada genera una nueva versión conservando el archivo previo.
  - Se impide enviar al proveedor o emitir una orden que no haya sido formalmente aprobada.
  - Se pueden registrar la aceptación o rechazo formal del proveedor con fecha y motivo.
  - Una orden parcialmente recibida refleja con exactitud el estado `RecibidaParcial`.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task05] Crear una matriz comparativa de cotizaciones y adjudicación por partidas
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (B.2) y Sección G (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Optimización de costos, transparencia en compras y adjudicaciones divididas)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`submitPurchaseQuotation`, `getPurchaseQuotations`, nueva función `adjudicatePurchaseQuotations`)
  - `CotizacionesCompra`
  - `SolicitudesCompra`
  - `js/accounting.js`
- **Dependencias Expuestas:** `CotizacionesCompra`, `SolicitudesCompra`, `OrdenesCompra`, `F18-Task03`
- **Descripción del Alcance:**
  El sistema permite registrar cotizaciones aisladas, pero no ofrece una comparación estructurada que facilite evaluar simultáneamente las ofertas de varios proveedores. Tampoco existe un mecanismo formal para adjudicar partidas a diferentes proveedores dentro de una misma solicitud.
  Requerimientos Funcionales Detallados:
  1. Matriz comparativa de cotizaciones:
     - Crear una vista comparativa tabular que agrupe todas las cotizaciones vinculadas a una misma solicitud de compra.
     - Comparar simultáneamente hasta 5 proveedores lado a lado (columnas: proveedores; filas: partidas solicitadas).
     - Parámetros comparables: precio unitario, cantidad cotizada, subtotal, descuentos, impuestos, fletes/transporte, total general, tiempo de entrega, condiciones de pago, garantías y cumplimiento de especificaciones técnicas.
     - Identificar visualmente partidas no cotizadas o cotizadas parcialmente por un proveedor.
  2. Adjudicación por partidas y dictamen:
     - Permitir adjudicar toda la compra a un solo proveedor o distribuir partidas entre diferentes proveedores según las mejores condiciones de precio, calidad o disponibilidad.
     - Registrar la justificación de la decisión cuando no se seleccione la oferta de menor precio (criterios técnicos, plazos de entrega urgentes, garantías superiores).
     - Registrar ofertas descartadas y motivos de rechazo.
     - Generar el acta de adjudicación formal con responsables de la evaluación y montos adjudicados.
     - Generar automáticamente las órdenes de compra individuales resultantes para cada proveedor seleccionado sin duplicar solicitudes.
- **Criterios de Aceptación:**
  - Se pueden comparar tres o más cotizaciones de una misma solicitud en una vista consolidada.
  - El sistema detecta y resalta partidas cotizadas parcialmente o no ofertadas por un proveedor.
  - Se pueden adjudicar diferentes partidas de una misma solicitud a proveedores distintos.
  - Las órdenes de compra resultantes conservan los importes, partidas y condiciones adjudicadas.
  - La decisión de adjudicación registra el responsable, fecha y justificación técnica.
  - Una cotización modificada con posterioridad no altera silenciosamente una adjudicación ya aprobada.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task06] Ampliar la gestión de cuentas por pagar con abonos, vencimientos y notas de crédito
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (B.5), Sección E y Sección G (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Control de tesorería, prevención de pagos duplicados y gestión de notas de crédito)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`recordAccountsPayableExpense`, nuevas funciones `recordSupplierPayment`, `applySupplierCreditNote`)
  - `CuentasPorPagarGastos`
  - `AsientosContables`
  - `dashboard-contabilidad.html`
- **Dependencias Expuestas:** `CuentasPorPagarGastos`, `AsientosContables`, `F18-Task02`, `recordAccountingJournalEntry`
- **Descripción del Alcance:**
  El sistema registra obligaciones en `CuentasPorPagarGastos`, pero no dispone de un control suficiente para administrar pagos parciales, saldos pendientes, notas de crédito comerciales de proveedores y programación de vencimientos. Esto dificulta el control de tesorería y aumenta el riesgo de sobrepagos o pagos duplicados.
  Requerimientos Funcionales Detallados:
  1. Registro estructurado de facturas y obligaciones:
     - Almacenar proveedor, número de factura oficial, fecha de emisión, fecha de recepción, fecha de vencimiento, importe original, impuestos, descuentos, total, moneda, saldo pendiente, estado de aprobación, estado de pago, relación con orden y recepción, y documento PDF adjunto.
  2. Pagos parciales y abonos a proveedores:
     - Permitir múltiples pagos asociados a una misma factura en diferentes fechas.
     - Registrar importe, fecha, medio de pago, cuenta bancaria de egreso, número de referencia bancaria y comprobante adjunto.
     - Calcular automáticamente el total pagado y el saldo pendiente de la obligación.
     - Bloquear cualquier intento de registrar un pago superior al saldo pendiente no liquidado.
     - Evitar pagos duplicados por reintentos o referencias bancarias ya utilizadas.
  3. Gestión de notas de crédito comerciales:
     - Registrar notas de crédito emitidas por proveedores por devoluciones de productos, descuentos por pronto pago o correcciones.
     - Asociar la nota de crédito a la factura correspondiente, reduciendo el saldo pendiente de pago.
     - Generar el asiento contable inverso correspondiente por partida doble en `AsientosContables`.
     - Impedir aplicar dos veces la misma nota de crédito.
  4. Programación de vencimientos y estados:
     - Consultar obligaciones por fecha de vencimiento, identificando facturas vencidas, próximas a vencer (7, 15, 30 días) y corrientes.
     - Estados de la obligación: `PendienteRevision`, `PendienteAprobacion`, `AprobadaParaPago`, `PagoParcial`, `Pagada`, `Vencida`, `EnDisputa`, `Anulada`.
     - Bloquear la emisión de pagos para facturas que no hayan superado la conciliación de tres vías (`F18-Task02`).
- **Criterios de Aceptación:**
  - Registrar una factura de proveedor y comprobar que su saldo inicial coincide con el monto total.
  - Aplicar dos pagos parciales consecutivos y verificar que el saldo pendiente disminuye exactamente por los montos pagados.
  - Al completar el 100% del saldo, la factura pasa automáticamente a estado `Pagada`.
  - Aplicar una nota de crédito comercial reduce el saldo pendiente y asienta el ajuste contable.
  - Se bloquea cualquier intento de pagar un monto superior al saldo pendiente de la factura.
  - Las facturas con discrepancias o en disputa quedan bloqueadas para pagos automáticos.
  - Anular un pago revierte el saldo pendiente y el asiento contable sin eliminar el historial.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task07] Implementar el compromiso presupuestario formal al aprobar órdenes de compra
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (B.6), Sección E y Sección G (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Control preventivo del gasto, protección presupuestaria y concurrencia)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`approvePurchaseOrder`, `checkBudgetAvailability`)
  - `PresupuestosInstitucionales`
  - `OrdenesCompra`
- **Dependencias Expuestas:** `PresupuestosInstitucionales`, `OrdenesCompra`, `checkBudgetAvailability`, `LockService`
- **Descripción del Alcance:**
  La disponibilidad presupuestaria se consulta mediante `checkBudgetAvailability`, pero la aprobación de una orden de compra no reserva formalmente el importe correspondiente en el presupuesto. Esto permite que múltiples órdenes concurrentes consuman la misma disponibilidad sin que el sistema detecte el sobregiro en tiempo real.
  Requerimientos Funcionales Detallados:
  1. Reserva atómica del compromiso presupuestario:
     - Al formalizar la aprobación de una orden de compra en `approvePurchaseOrder`, adquirir un candado de script (`LockService.getScriptLock()`) y verificar la disponibilidad presupuestaria real.
     - Si hay disponibilidad, incrementar automáticamente el campo `montoComprometido` en `PresupuestosInstitucionales` para la partida y centro de costo correspondientes.
     - Saldo disponible recalculado: `saldoDisponible = montoAprobado - montoComprometido - montoEjecutado`.
     - Impedir que dos órdenes concurrentes reserven fondos sobre el mismo saldo disponible simultáneamente.
  2. Ciclo de vida y liberación de compromisos:
     - Distinguir claramente: Presupuesto asignado, Importe comprometido (por órdenes aprobadas), Importe ejecutado (por facturas recibidas) e Importe disponible.
     - Al facturar o liquidar la orden, transferir el monto desde `montoComprometido` hacia `montoEjecutado`.
     - Si una orden de compra se cancela o reduce su importe mediante modificación autorizada, liberar inmediatamente el compromiso presupuestario no ejecutado.
     - Permitir autorizaciones extraordinarias de sobregiro presupuestario exclusivamente al rol `Director` o `Administrador`, emitiendo el log estructurado `BUDGET_OVERRUN_ALERT` con justificación obligatoria.
- **Criterios de Aceptación:**
  - Aprobar una orden de compra incrementa de inmediato el `montoComprometido` de la partida presupuestaria.
  - Una segunda orden procesada inmediatamente después consulta el saldo disponible ya descontado.
  - Se bloquea la aprobación de órdenes concurrentes que conjuntamente superen el presupuesto disponible.
  - La cancelación formal de una orden de compra libera el compromiso devolviendo los fondos a disponibilidad.
  - Reducir el importe de una orden ajusta la diferencia en el compromiso de forma trazable.
  - Las autorizaciones de sobregiro quedan auditadas con usuario directivo responsable y motivo.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ALTA PRIORIDAD (P1 - ACTIVOS FIJOS, CATÁLOGO DE PROVEEDORES Y EXPEDIENTE DIGITAL)

---

### [ ] [F18-Task08] Integrar la recepción de compras con el registro de activos fijos
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (B.4), Sección D y Sección G (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Control patrimonial institucional, capitalización de bienes y prevención de extravíos)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`recordPurchaseReceipt`, `manageAssetItem`, `assignAssetCustody`)
  - `ActivosPatrimoniales`
  - `RecepcionesCompra`
  - `OrdenesCompra`
- **Dependencias Expuestas:** `ActivosPatrimoniales`, `RecepcionesCompra`, `OrdenesCompra`, `F18-Task01`
- **Descripción del Alcance:**
  Existe un registro de activos patrimoniales (`ActivosPatrimoniales`), pero la recepción de una compra de bienes duraderos (computadoras, proyectores, mobiliario, vehículos) no permite completar directamente el registro patrimonial del bien adquirido. Esto obliga a recapturar información manualmente y rompe la trazabilidad entre el activo y su factura/orden de origen.
  Requerimientos Funcionales Detallados:
  1. Identificación y capitalización desde la recepción:
     - Identificar partidas clasificadas como "Bienes Capitalizables / Activos Fijos" en la orden de compra.
     - Permitir iniciar el registro del activo directamente desde la recepción conforme en `RecepcionesCompra`.
     - Precargar automáticamente los datos de la compra: descripción del bien, proveedor, fecha de recepción, costo de adquisición, número de factura y orden de compra.
  2. Registro individualizado de bienes patrimoniales:
     - Registrar categoría patrimonial, marca, modelo, número de serie, ubicación física inicial y custodio asignado (`CustodioUserId`).
     - Si la partida comprende múltiples unidades (ej. 10 computadoras), permitir generar los 10 registros patrimoniales individuales con números de serie independientes.
     - Validar que no existan números de serie duplicados en `ActivosPatrimoniales`.
     - Diferenciar claramente entre bienes capitalizables (activos), consumibles de oficina y materiales inventariables.
     - Prohibir la capitalización de bienes que hayan sido rechazados o devueltos en la recepción.
- **Criterios de Aceptación:**
  - Recibir una compra de bienes capitalizables permite crear los registros en `ActivosPatrimoniales` con un flujo guiado.
  - Cada activo generado conserva su vínculo con la orden de compra, proveedor, recepción y factura.
  - Se pueden ingresar números de serie individuales para compras de múltiples unidades.
  - Se detecta y rechaza el registro de activos con números de serie previamente existentes.
  - Las compras de materiales consumibles no generan activos patrimoniales automáticamente.
  - La consulta del activo permite navegar directamente hacia su expediente de adquisición original.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task09] Ampliar el catálogo de proveedores con contactos múltiples y datos comerciales protegidos
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (B.1) y Sección G (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Gestión de proveedores, seguridad de información bancaria y control de pagos ACH)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`registerSupplier`, `manageSupplierContract`)
  - `ProveedoresActivos`
  - `ContratosProveedores`
  - `dashboard-contabilidad.html`
- **Dependencias Expuestas:** `ProveedoresActivos`, `ContratosProveedores`, `ROLE_PERMISSIONS`
- **Descripción del Alcance:**
  El catálogo actual almacena únicamente información básica del proveedor (nombre, RTN, teléfono, email, rubro). No contempla múltiples contactos, direcciones diferenciadas ni información bancaria protegida requerida para la dispersión segura de pagos.
  Requerimientos Funcionales Detallados:
  1. Contactos múltiples y direcciones:
     - Permitir registrar varios contactos por proveedor con nombre, cargo, teléfono, correo y área (ventas, cobranzas, soporte, entregas).
     - Identificar un contacto principal y mantener el histórico de contactos reemplazados.
     - Registrar direcciones diferenciadas para facturación fiscal, entrega de mercancía y correspondencia.
  2. Condiciones comerciales:
     - Registrar plazos de crédito (contado, 15, 30, 60 días), moneda comercial, descuentos por pronto pago y tiempos habituales de entrega.
  3. Datos bancarios protegidos (Seguridad financiera):
     - Permitir registrar banco receptor, tipo de cuenta, número de cuenta y beneficiario para pagos por transferencia/ACH.
     - Enmascarar números de cuenta bancaria en listados generales (ej. `****-****-1234`).
     - Restringir la consulta de cuentas completas y su modificación exclusivamente a roles autorizados (`Contador`, `Director`, `Administrador`).
     - Todo cambio en las cuentas bancarias de un proveedor exige autorización documentada y emite un log de auditoría `SUPPLIER_BANK_ACCOUNT_MODIFIED`.
  4. Estados de proveedor y documentos:
     - Estados: `Activo`, `Inactivo`, `Suspendido`, `EnEvaluacion`.
     - Impedir emitir órdenes de compra a proveedores en estado `Suspendido` o `Inactivo`.
- **Criterios de Aceptación:**
  - Se pueden registrar y editar múltiples contactos para un mismo proveedor.
  - Se almacenan direcciones separadas de facturación y entrega física.
  - Los datos bancarios del proveedor están enmascarados y restringidos bajo permisos RBAC estrictos.
  - Modificar una cuenta bancaria genera una entrada de auditoría con usuario, fecha y valor anterior.
  - Se detectan posibles proveedores duplicados al validar el número de RTN (14 dígitos).
  - Un proveedor suspendido queda bloqueado para la emisión de nuevas órdenes de compra.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task10] Implementar el expediente digital unificado de adquisiciones
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (B.5), Sección D y Sección G (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Trazabilidad 360°, auditoría interna y archivo documental de compras)
- **Archivos Involucrados:**
  - `js/accounting.js`
  - `dashboard-contabilidad.html`
  - `SolicitudesCompra`
  - `CotizacionesCompra`
  - `OrdenesCompra`
  - `RecepcionesCompra`
  - `CuentasPorPagarGastos`
  - `AsientosContables`
- **Dependencias Expuestas:** Vistas de compras, Google Drive, AsientosContables, `F18-Task01`, `F18-Task02`, `F18-Task04`
- **Descripción del Alcance:**
  Los documentos de cada compra se encuentran dispersos en hojas independientes (`SolicitudesCompra`, `CotizacionesCompra`, `OrdenesCompra`, `RecepcionesCompra`, `CuentasPorPagarGastos`). No existe una vista centralizada que permita a los auditores y directores reconstruir la secuencia completa de una adquisición.
  Requerimientos Funcionales Detallados:
  1. Vista centralizada del expediente digital (Trazabilidad 360°):
     - Visualizar en una sola pantalla interactiva la cadena documental completa: Solicitud de compra -> Cotizaciones recibidas -> Matriz comparativa y adjudicación -> Aprobaciones directivas -> Orden de compra PDF -> Confirmación del proveedor -> Recepciones de bodega -> Facturas fiscales -> Conciliación Three-Way -> Pagos aplicados -> Asientos contables automáticos.
  2. Métricas y accesos directos del expediente:
     - Mostrar línea de tiempo con fechas, usuarios responsables y estados de cada etapa.
     - Contadores de control: cantidades pedidas, recibidas, facturadas y pendientes; importes autorizados, facturados y pagados.
     - Enlaces directos para abrir o descargar cada documento probatorio adjunto en Drive.
     - Búsqueda ágil de expedientes por número de solicitud, orden, número de factura o nombre del proveedor.
     - Preservar permanentemente el expediente documental aun cuando la orden haya sido cerrada o cancelada.
- **Criterios de Aceptación:**
  - Al ingresar el número de orden o solicitud se despliega la secuencia completa de documentos relacionados.
  - Se puede navegar fluidamente entre la factura, su recepción de bodega y la orden de compra original.
  - Los totales de cantidades e importes del expediente coinciden exactamente con los documentos individuales.
  - Las órdenes con entregas o facturaciones parciales reflejan con claridad los saldos pendientes.
  - El expediente mantiene protegidos los documentos confidenciales conforme al rol del usuario que consulta.
- **Estado:** [ ] Pendiente

---

## TAREAS DE PRIORIDAD MEDIA (P2 - ALERTAS DE ENTREGA, CONTRATOS MARCO, REPOSICIÓN Y REPORTES)

---

### [ ] [F18-Task11] Implementar seguimiento de entregas y alertas de retrasos
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (B.3) y Sección G (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Seguimiento operativo, cumplimiento de proveedores y gestión de alertas)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `OrdenesCompra`
  - `RecepcionesCompra`
  - `backend/user-service/Code.gs` (servicio de notificaciones)
- **Dependencias Expuestas:** `OrdenesCompra`, `RecepcionesCompra`, `sendMultiChannelNotification`, `F18-Task01`
- **Descripción del Alcance:**
  El sistema no alerta automáticamente cuando la fecha estimada de entrega de una orden de compra ha vencido y todavía existen cantidades pendientes de recibir en bodega.
  Requerimientos Funcionales Detallados:
  1. Monitoreo de plazos y detección de demoras:
     - Comparar diariamente `fechaEntregaEstimada` de las órdenes en estado `Emitida`, `EnviadaProveedor` o `RecibidaParcial` contra la fecha actual.
     - Identificar órdenes con entrega vencida que mantengan cantidades pendientes de recibir.
     - Calcular los días de retraso acumulados por orden y por partida.
  2. Alertas y gestión de incidencias:
     - Disparar alertas automáticas al encargado de compras y al solicitante departamental.
     - Permitir registrar observaciones o compromisos de entrega reprogramados informados por el proveedor, conservando el historial de fechas anteriores.
     - Evitar notificaciones duplicadas por la misma incidencia de retraso mediante clave de deduplicación.
- **Criterios de Aceptación:**
  - Una orden con fecha de entrega superada y saldo pendiente genera una alerta visible en el panel de compras.
  - Las órdenes parcialmente recibidas mantienen la alerta de entrega demorada sobre los artículos faltantes.
  - Al completarse la recepción total, la alerta se desactiva automáticamente.
  - Las reprogramaciones de fecha de entrega conservan la fecha original para medir el índice de puntualidad.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task12] Implementar control de consumo y disponibilidad de contratos marco
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (B.1) y Sección G (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Gestión de suministros recurrentes y control de topes contractuales)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`manageSupplierContract`, `getSupplierContractAlerts`)
  - `ContratosProveedores`
  - `OrdenesCompra`
- **Dependencias Expuestas:** `ContratosProveedores`, `OrdenesCompra`, `F18-Task07`
- **Descripción del Alcance:**
  Existe gestión básica de contratos de proveedores y alertas de vencimiento, pero no se controla cuánto se ha consumido de un contrato marco de suministro recurrente (ej. papelería, internet, mantenimiento de fotocopiadoras, combustible) ni cuánto saldo disponible permanece.
  Requerimientos Funcionales Detallados:
  1. Contratos marco con límite económico y cantidades:
     - Permitir registrar contratos marco con proveedor, vigencia, importe máximo autorizado y condiciones comerciales pactadas.
     - Vincular las órdenes de compra emitidas con el contrato marco correspondiente.
     - Calcular en tiempo real: monto total contratado, monto consumido acumulado por órdenes emitidas y saldo disponible restante del contrato.
  2. Control de topes y alertas:
     - Bloquear o advertir la emisión de órdenes de compra que excedan el límite económico disponible del contrato.
     - Alertas preventivas al alcanzar el 80% y 95% del consumo del contrato marco.
     - La cancelación de órdenes de compra restituye el saldo disponible del contrato de forma automática.
- **Criterios de Aceptación:**
  - Asociar múltiples órdenes de compra a un contrato marco acumula correctamente el consumo económico.
  - Se genera una advertencia o restricción si una orden supera el saldo disponible del contrato marco.
  - Cancelar una orden de compra libera el monto comprometido en el contrato marco.
  - El panel de contratos permite consultar el saldo disponible y el historial de compras de cada acuerdo.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task13] Implementar sugerencias de compra basadas en existencias y niveles mínimos
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (B.4) y Sección G (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Continuidad operativa, abastecimiento oportuno y prevención de quiebres de stock)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`createPurchaseRequest`)
  - `InventariosKardex`
  - `SolicitudesCompra`
- **Dependencias Expuestas:** `InventariosKardex`, `SolicitudesCompra`, Módulo de Inventario
- **Descripción del Alcance:**
  El inventario registra movimientos en `InventariosKardex`, pero no genera sugerencias de compra automáticas cuando las existencias de materiales caen por debajo del stock mínimo institucional.
  Requerimientos Funcionales Detallados:
  1. Motor de sugerencias de reposición de inventario:
     - Monitorear las existencias disponibles por artículo y almacén contrastándolas con el `stockMinimo` configurado.
     - Considerar cantidades en tránsito (órdenes de compra emitidas pendientes de recibir) para no sobrecomprar.
     - Calcular la cantidad sugerida de compra: `cantidadSugerida = stockMaximo - stockDisponible - stockEnTransito`.
  2. Generación asistida de solicitudes:
     - Presentar bandeja de sugerencias de reposición agrupadas por categoría o proveedor habitual.
     - Permitir convertir una sugerencia en solicitud de compra interna (`createPurchaseRequest`) con un solo clic, sin generar órdenes de compra directas sin previa aprobación.
     - Evitar generar sugerencias duplicadas para artículos que ya cuenten con una solicitud de compra en trámite.
- **Criterios de Aceptación:**
  - Una salida de inventario que reduzca el stock por debajo del mínimo genera la sugerencia de reposición.
  - El cálculo considera los pedidos en tránsito pendientes de entrega evitando compras redundantes.
  - La sugerencia puede convertirse en solicitud de compra interna conservando la justificación de stock crítico.
  - El proceso respeta la aprobación de compras y no genera órdenes emitidas automáticamente.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task14] Implementar evaluación histórica del desempeño de proveedores
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (B.1) y Sección G (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Calidad en las adquisiciones, scoring de proveedores y evaluación de servicio)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `ProveedoresActivos`
  - `RecepcionesCompra`
  - `dashboard-contabilidad.html`
- **Dependencias Expuestas:** `ProveedoresActivos`, `RecepcionesCompra`, `F18-Task09`
- **Descripción del Alcance:**
  El catálogo de proveedores no cuenta con un historial estructurado de calidad, puntualidad y cumplimiento. La selección de ofertas se realiza sin métricas históricas de desempeño del proveedor.
  Requerimientos Funcionales Detallados:
  1. Registro de evaluaciones de servicio y producto:
     - Registrar evaluaciones vinculadas a compras y recepciones reales en una escala de 1 a 5 estrellas.
     - Criterios evaluables: puntualidad en la entrega, calidad del producto entregado, cumplimiento de especificaciones técnicas, atención a reclamaciones y cumplimiento de condiciones comerciales.
     - Registrar observaciones, incidencias, devoluciones y usuario evaluador.
  2. Scoring e integración con cotizaciones:
     - Calcular el índice promedio de desempeño del proveedor (Score de Proveedor).
     - Mostrar el score histórico del proveedor en la matriz comparativa de cotizaciones (`F18-Task05`) como criterio de apoyo en la adjudicación.
     - Identificar proveedores con calificaciones deficientes recurrentes para someterlos a revisión o suspensión.
- **Criterios de Aceptación:**
  - Se puede registrar la evaluación de desempeño al confirmar una recepción de compras.
  - El perfil del proveedor muestra su calificación promedio histórica y el total de evaluaciones recibidas.
  - El score del proveedor es visible al comparar cotizaciones para respaldar la decisión de adjudicación.
  - Solo los roles autorizados de compras y almacén pueden registrar evaluaciones de proveedores.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task15] Incorporar un procedimiento formal para compras urgentes y excepcionales
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección G y Sección H (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Gestión de emergencias institucionales, trazabilidad de excepciones y control financiero)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`createPurchaseRequest`, `createPurchaseOrder`)
  - `SolicitudesCompra`
  - `OrdenesCompra`
- **Dependencias Expuestas:** `SolicitudesCompra`, `OrdenesCompra`, Flujos de aprobación directiva
- **Descripción del Alcance:**
  Las solicitudes actuales no contemplan una clasificación para compras de emergencia o imprevistos graves (ej. reparación urgente de bomba de agua, falla de servidores centrales), obligando a eludir los controles del sistema o a realizar compras no documentadas.
  Requerimientos Funcionales Detallados:
  1. Clasificación formal de compra urgente:
     - Incorporar bandera de tipo de compra: `Ordinaria` o `Urgente / Emergencia`.
     - Exigir justificación detallada de la urgencia y el impacto institucional de no ejecutar la compra de inmediato.
     - Flujo de aprobación expedito: enrutar directamente a la Dirección General para autorización de vía rápida.
  2. Regularización y control:
     - Permitir emitir la orden de compra con una sola cotización justificada cuando la urgencia lo amerite.
     - Exigir regularización documental posterior (carga de facturas, actas y fotos) sin eludir la verificación Three-Way Matching ni los controles presupuestarios.
     - Emitir registro de auditoría `EMERGENCY_PURCHASE_AUTHORIZED`.
- **Criterios de Aceptación:**
  - Una solicitud marcada como urgente exige obligatoriamente justificación y descripción de impacto.
  - Se enruta de inmediato a aprobación directiva con notificación prioritaria.
  - La excepción de cotización múltiple queda asentada formalmente con la firma del autorizador.
  - La compra urgente mantiene intactos los controles de recepción física y conciliación contable.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task16] Desarrollar reportes consolidados de compras, compromisos y cuentas por pagar
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (B.5), Sección D y Sección G (P2)
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Reportería gerencial, control de compromisos y auditoría contable)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`getAccountsReceivablePayableSummary`, `getPurchaseOrders`)
  - `CuentasPorPagarGastos`
  - `OrdenesCompra`
  - `PresupuestosInstitucionales`
  - `dashboard-contabilidad.html`
  - `js/accounting.js`
- **Dependencias Expuestas:** `CuentasPorPagarGastos`, `OrdenesCompra`, `PresupuestosInstitucionales`
- **Descripción del Alcance:**
  Las consultas actuales no proporcionan una visión consolidada suficiente de la cartera de compras, compromisos presupuestarios abiertos, entregas demoradas y saldos vencidos de cuentas por pagar a proveedores.
  Requerimientos Funcionales Detallados:
  1. Reportes consolidados de adquisiciones:
     - Compras por departamento, por centro de costo, por categoría de insumos y por proveedor.
     - Reporte de compromisos presupuestarios abiertos vs facturas ejecutadas.
     - Reporte de órdenes de compra con entregas parciales y saldos pendientes de recibir.
  2. Reporte de antigüedad de cuentas por pagar a proveedores:
     - Cartera vencida y corriente clasificada en franjas: Corriente (no vencida), 1-30 días, 31-60 días, 61-90 días y más de 90 días de mora con proveedores.
     - Desglose de notas de crédito aplicadas y facturas en disputa o bloqueadas.
     - Exportación de reportes a formatos Excel y PDF membretado con sumatorias matemáticas coincidentes.
- **Criterios de Aceptación:**
  - Los reportes de compras totalizan exactamente las sumas de las órdenes de compra emitidas.
  - El reporte de cuentas por pagar coincide con el balance de pasivos registrado en la contabilidad.
  - La clasificación de antigüedad de facturas se calcula exactamente según sus fechas de vencimiento.
  - Las exportaciones a Excel conservan el formateo numérico y los filtros aplicados en pantalla.
- **Estado:** [ ] Pendiente

---

## TAREAS COMPLEMENTARIAS (P3 - PORTAL DE PROVEEDORES, LICITACIONES Y OCR)

---

### [ ] [F18-Task17] Implementar portal de proveedores para operaciones externas
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (F18-A01) y Sección G (P3)
- **Prioridad:** P3
- **Severidad/Clasificación:** Baja (Capacidad complementaria de autoservicio para proveedores externos)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `ProveedoresActivos`
  - `OrdenesCompra`
  - `CuentasPorPagarGastos`
- **Dependencias Expuestas:** `ProveedoresActivos`, `OrdenesCompra`, Control de acceso externo
- **Descripción del Alcance:**
  Habilitar un espacio web restringido para proveedores formalmente registrados donde puedan consultar las órdenes de compra emitidas a su nombre, confirmar o rechazar pedidos, adjuntar facturas digitales y verificar el estado de sus pagos.
  Requerimientos Funcionales Detallados:
  1. Acceso seguro y aislamiento de datos:
     - Crear credenciales de acceso restringido para proveedores validados.
     - Garantizar aislamiento estricto ABAC: un proveedor solo puede ver sus propias órdenes y facturas.
     - Permitir al proveedor cargar sus facturas en PDF y comprobantes de entrega, las cuales ingresan a la bandeja de revisión institucional sin contabilizarse automáticamente.
     - Permitir revocar el acceso externo en cualquier momento sin alterar el historial comercial.
- **Criterios de Aceptación:**
  - Un proveedor autenticado solo visualiza las órdenes de compra emitidas a su empresa.
  - Se bloquea cualquier intento de acceder a información de otros proveedores.
  - Las facturas cargadas por el proveedor quedan en estado `PendienteRevision` para validación interna.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task18] Incorporar procesos competitivos y licitaciones para adquisiciones de mayor cuantía
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (F18-A04) y Sección G (P3)
- **Prioridad:** P3
- **Severidad/Clasificación:** Baja (Capacidad complementaria para proyectos mayores de infraestructura o equipamiento)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `SolicitudesCompra`
  - `CotizacionesCompra`
  - Hoja `ProcesosLicitacion`
- **Dependencias Expuestas:** `SolicitudesCompra`, `CotizacionesCompra`, `F18-Task05`
- **Descripción del Alcance:**
  Para proyectos de alta cuantía (ej. construcción de pabellón, renovación completa de laboratorios), implementar un módulo de licitaciones públicas o privadas con bases técnicas, cronograma de apertura de pliegos y evaluación formal por comité evaluador.
  Requerimientos Funcionales Detallados:
  1. Convocatoria y evaluación por comités:
     - Publicar pliego de condiciones, requisitos técnicos y fechas límite de postulación.
     - Registrar apertura de pliegos de ofertas con separación de evaluación técnica y económica.
     - Emitir acta formal de adjudicación con ponderaciones y firmas del comité directivo.
- **Criterios de Aceptación:**
  - Se puede estructurar un proceso de licitación con fechas y requisitos obligatorios.
  - Se ponderan ofertas técnicas y económicas de acuerdo con las bases registradas.
  - La adjudicación genera automáticamente la orden de compra y el contrato correspondiente.
- **Estado:** [ ] Pendiente

---

### [ ] [F18-Task19] Incorporar captura asistida de datos de facturas mediante OCR
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección B (F18-A05) y Sección G (P3)
- **Prioridad:** P3
- **Severidad/Clasificación:** Baja (Capacidad complementaria de productividad en digitalización)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `CuentasPorPagarGastos`
  - Servicios de procesamiento de imágenes / Drive
- **Dependencias Expuestas:** `CuentasPorPagarGastos`, `F18-Task02`
- **Descripción del Alcance:**
  Evaluar la incorporación de un motor de reconocimiento óptico de caracteres (OCR) para precargar automáticamente datos de facturas físicas escaneadas o PDFs de proveedores (número de factura, RTN, subtotal, ISV, total), facilitando la captura manual y reduciendo errores tipográficos antes del Three-Way Matching.
  Requerimientos Funcionales Detallados:
  1. Extracción y revisión supervisada:
     - Cargar PDF o foto de la factura y extraer datos fiscales clave.
     - Presentar los datos extraídos en un formulario de revisión humana para su validación previa.
     - Prohibir taxativamente que un documento procesado por OCR se apruebe o contabilice automáticamente sin la confirmación de un operador contable autorizado.
- **Criterios de Aceptación:**
  - Se extraen de forma asistida los datos de facturas nítidas en PDF.
  - Los campos dudosos se resaltan para verificación manual obligatoria.
  - Ninguna factura se asienta en contabilidad sin la aprobación explícita del usuario.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ASEGURAMIENTO Y CALIDAD (P0 - SUITE INTEGRAL DE REGRESIÓN DE COMPRAS)

---

### [ ] [F18-Task20] Implementar suite automatizada de pruebas y regresión integral de compras
- **Origen del Hallazgo:** `AUDITORIA-FASE-18-COMPRAS-PROVEEDORES-CONTRATACION.md` / Sección G (P0) y Sección F
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Aseguramiento de calidad, prevención de regresiones e integridad en adquisiciones)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/developer-service/Code.gs`
  - `tests/regression/academic-grading-suite.js`
- **Dependencias Expuestas:** Suites de pruebas del ecosistema, contratos de API de compras, inventario y cuentas por pagar
- **Descripción del Alcance:**
  Implementar la suite integral automatizada `runPhase18PurchasingAndSuppliersRegressionSuite` que valide de manera continua el ciclo de compras completo, recepciones parciales, Three-Way Matching, compromisos presupuestarios y asientos contables por partida doble.
  Requerimientos Funcionales Detallados:
  1. Batería de pruebas automatizadas:
     - Proveedores: registro, validación de RTN, contactos y bloqueo de inactivos.
     - Solicitudes y cotizaciones: creación, aprobación multinivel y comparativa de ofertas.
     - Órdenes de compra: prevención de autoaprobaciones (`AUTO_APPROVAL_BLOCKED`), umbral de L 50,000 (`HIGH_VALUE_APPROVAL_REQUIRED`) y generación de PDF.
     - Recepciones e inventario: recepciones parciales escalonadas sin cierre prematuro de orden e incremento exacto en `InventariosKardex`.
     - Facturas y Three-Way Matching: detección de diferencias de precio, bloqueo por cantidades no recibidas y conciliación exitosa de partidas conformes.
     - Cuentas por pagar: pagos parciales, saldo pendiente exacto y aplicación de notas de crédito comerciales.
     - Presupuesto y contabilidad: reserva y liberación de compromisos presupuestarios y verificación de balance por partida doble en `AsientosContables` (`totalDebe === totalHaber`).
  2. Prueba de flujo integral E2E (End-to-End):
     - Ejecutar en una sola prueba el ciclo: Solicitud -> Cotización -> Orden -> Recepción parcial 1 -> Recepción parcial 2 -> Inventario -> Factura con Three-Way Matching -> Aprobación -> Pago parcial -> Pago final -> Asiento contable.
  3. Aislamiento y reporte de resultados:
     - Operar sobre datos de prueba aislados sin alterar registros de producción ni las 53 pruebas de regresión previas.
- **Criterios de Aceptación:**
  - La suite de regresión valida el ciclo de adquisiciones con el 100% de éxito en entorno controlado.
  - Se detecta y alerta automáticamente el cierre prematuro de órdenes de compra.
  - Se bloquean facturas que intenten cobrar cantidades no recibidas físicamente.
  - Los asientos contables generados se validan como perfectamente equilibrados.
  - No se produce ninguna regresión en las pruebas de las fases anteriores (Fases 9, 10, 11, 15, 16 y 17).
- **Estado:** [ ] Pendiente

---

# PENDIENTES - FASE 19: INVENTARIO, ACTIVOS FIJOS Y MANTENIMIENTO INSTITUCIONAL

## TAREAS CRÍTICAS (P0 - INTEGRIDAD FÍSICA, CONTROL PATRIMONIAL Y TRANSFERENCIAS TRANSACCIONALES)

---

### [ ] [F19-Task01] Corrección integral del control de existencias multialmacén
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E (F19-02), Sección G (Defecto 1) y Plan de Trabajo F19-01
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Integridad física de inventarios, auditoría por bodega, prevención de saldos inconsistentes y desabastecimiento)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`recordInventoryMovement`, `getInventoryKardex`, `transferInventoryStock`)
  - `InventariosKardex`
  - `AlmacenesUbicaciones`
  - `js/accounting.js`
- **Dependencias Expuestas:** `InventariosKardex`, `AlmacenesUbicaciones`, `recordPurchaseReceipt`. Es la base para las tareas posteriores de transferencias, lotes, valorización y consumo de materiales.
- **Descripción del Alcance:**
  El Kardex calcula el saldo de un artículo considerando los movimientos de todas las ubicaciones indistintamente, sin separar las existencias correspondientes a cada almacén. Esto ocasiona que el saldo de una bodega se mezcle con el de otras, generando información incorrecta sobre las existencias reales en cada instalación.
  Requerimientos Funcionales Detallados:
  1. Cálculo de existencias independiente y multidimensional:
     - Implementar un mecanismo de cálculo de existencias independiente por combinación estricta de:
       * Código del artículo (`itemCodigo`).
       * Almacén (`almacenId` / `sedeCod`).
       * Ubicación física (`ubicacionResponsable` / `ubicacionId`).
       * Lote, cuando corresponda.
       * Número de serie, cuando corresponda.
     - Cada movimiento debe actualizar exclusivamente el saldo de la ubicación física afectada.
  2. Saldos y estados simultáneos de inventario:
     - El sistema debe calcular y mantener simultáneamente en tiempo real:
       * Existencia por ubicación física.
       * Existencia consolidada por almacén.
       * Existencia total institucional.
       * Cantidad reservada (por solicitudes aprobadas no entregadas).
       * Cantidad disponible para consumo (`disponible = existenciaFisica - reservada`).
       * Cantidad en tránsito entre almacenes.
  3. Consultas y filtrado en Kardex:
     - Permitir filtrar por almacén, ubicación, artículo, categoría y período de fechas.
     - Cada fila de movimiento debe conservar: saldo anterior de la ubicación, cantidad del movimiento, saldo posterior de la ubicación, usuario responsable, fecha y hora exacta, documento de origen y referencia del movimiento relacionado (cuando exista).
     - Las ubicaciones deben funcionar como entidades independientes; queda terminantemente prohibido utilizar el último saldo global del artículo como saldo de referencia local.
  4. Bloqueo transaccional y prevención de concurrencia:
     - Incorporar un mecanismo de bloqueo transaccional (`LockService.getScriptLock()`) para evitar que dos operaciones simultáneas consuman las mismas existencias o generen saldos negativos.
  5. Migración y compatibilidad de registros históricos:
     - Los movimientos históricos sin ubicación explícita deben conservarse y asignarse mediante una migración controlada a `Bodega General`, sin duplicar cantidades ni alterar los totales históricos.
  6. Detección automática de inconsistencias:
     - Detectar discrepancias entre el saldo calculado a partir de la suma acumulada de movimientos y el saldo registrado en la última fila del Kardex, permitiendo identificar y auditar los artículos y ubicaciones afectados.
- **Comportamiento Esperado:**
  Si existen 10 unidades de un artículo en Bodega A y 5 en Bodega B, el sistema debe mostrar:
  * Bodega A: 10
  * Bodega B: 5
  * Total institucional: 15
  Si se consumen 3 unidades de Bodega A, el resultado debe ser:
  * Bodega A: 7
  * Bodega B: 5
  * Total institucional: 12 (el movimiento no altera el saldo de Bodega B).
- **Criterios de Aceptación:**
  - Las existencias se calculan independientemente por ubicación física.
  - El consolidado institucional coincide exactamente con la suma matemática de sus ubicaciones.
  - Los consumos en una bodega no afectan los saldos de otras bodegas.
  - Los movimientos simultáneos bajo concurrencia no producen saldos negativos ni duplicaciones.
  - Las transferencias conservan la integridad estricta de las existencias.
  - Los registros históricos mantienen su trazabilidad y cantidades intactas.
  - Los conteos físicos y conciliaciones operan bajo el nuevo modelo por almacén.
  - Los reportes muestran correctamente los saldos individuales por ubicación y el consolidado institucional.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task02] Implementación del flujo completo de devolución y recepción de activos bajo custodia
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E (F19-06), Sección G (Defecto 2) y Plan de Trabajo F19-02
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Control patrimonial, cierre formal de responsabilidades de custodios, actas de devolución y reasignación de bienes)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`assignAssetCustody`, nueva función `returnAssetCustody`, `getAssetAssignments`)
  - `ActivosPatrimoniales`
  - `AsignacionesActivos`
  - `MantenimientoOrdenes`
  - `js/accounting.js`
- **Dependencias Expuestas:** `ActivosPatrimoniales`, `AsignacionesActivos`, `ROLE_PERMISSIONS`. Requiere el registro de activos y asignaciones de custodia existentes.
- **Descripción del Alcance:**
  La plataforma permite asignar activos a custodios, pero no dispone de un procedimiento formal para registrar su devolución. No existe un historial completo de entrega, recepción, evaluación física, generación de actas de finiquito y liberación del activo para una nueva asignación.
  Requerimientos Funcionales Detallados:
  1. Devolución formal e independiente:
     - Implementar la función `returnAssetCustody` vinculada obligatoriamente a una asignación de custodia activa (`AsignacionesActivos`).
     - Registrar obligatoriamente: activo devuelto, custodio que realiza la entrega, responsable que recibe el activo, fecha y hora de entrega/recepción, ubicación de recepción, estado físico al momento de la devolución, accesorios y componentes entregados, observaciones y evidencias fotográficas o actas adjuntas.
  2. Estados de condición física al reingreso:
     - Registrar estados normalizados: `Nuevo`, `Bueno`, `Regular`, `Dañado`, `Incompleto`, `RequiereReparacion`.
     - Permitir comparar el estado físico registrado durante la asignación inicial con el estado observado durante la devolución.
  3. Gestión de incidencias y mantenimiento automático:
     - Si el activo presenta daños, faltantes o requiere reparación, registrar la incidencia y generar automáticamente la orden de mantenimiento en `MantenimientoOrdenes`.
     - El activo no debe quedar disponible para reasignación mientras se encuentre pendiente de inspección o en mantenimiento.
  4. Preservación histórica y generación de actas:
     - Mantener el historial inmutable de todas las custodias anteriores sin sobrescribir los registros de asignación previos.
     - Generar el acta formal de entrega-recepción que pueda consultarse, imprimirse y exportarse a PDF con identificadores únicos y firmas.
     - Permitir que un activo sea reasignado únicamente cuando su devolución haya sido aceptada formalmente y su estado operativo sea `available`.
- **Comportamiento Esperado:**
  Al seleccionar un activo asignado, el administrador inicia su devolución, inspecciona sus condiciones y registra observaciones. Si el activo está en buen estado, cambia a `available` y queda libre de custodio; si está dañado, cambia a `maintenance` y queda relacionado con su orden de trabajo técnica.
- **Criterios de Aceptación:**
  - Es imposible devolver un activo que no posea una asignación activa previa.
  - Cada devolución queda vinculada persistentemente a su asignación original.
  - Se conserva el historial completo e inalterado de custodios anteriores.
  - Se registra el estado físico de recepción y se documentan faltantes o averías.
  - Los activos dañados no pueden reasignarse como disponibles.
  - Se genera un acta verificable de entrega-recepción descargable en PDF.
  - Se rechazan devoluciones duplicadas de una misma asignación.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task03] Validación transaccional de transferencias entre almacenes
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E (F19-05), Sección F (PT-04) y Plan de Trabajo F19-03
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Consistencia de traslados físicos, prevención de existencias negativas, atocimidad y control de tránsito)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`transferInventoryStock`, `recordInventoryMovement`)
  - `InventariosKardex`
  - `AlmacenesUbicaciones`
  - Hoja `TransferenciasInventario`
  - `js/accounting.js`
- **Dependencias Expuestas:** `InventariosKardex`, `AlmacenesUbicaciones`, `F19-Task01`
- **Descripción del Alcance:**
  `transferInventoryStock` genera los movimientos de salida y entrada, pero no verifica previamente de forma atómica que el almacén de origen tenga suficientes unidades del artículo solicitado en su ubicación específica.
  Requerimientos Funcionales Detallados:
  1. Validaciones previas indispensables:
     - Validar la existencia disponible en el almacén y ubicación de origen antes de autorizar cualquier movimiento.
     - Comprobar que: el artículo exista en el catálogo, el almacén de origen esté activo, el almacén de destino esté activo, la ubicación de origen corresponda al almacén indicado, la cantidad solicitada sea estrictamente mayor a cero, exista suficiente stock disponible no reservado, el artículo y su unidad de medida sean compatibles con la operación, y que origen y destino no sean idénticos.
  2. Identificador único y correlación documental:
     - Generar un identificador único de transferencia (`TRF-...`) que relacione los movimientos de salida del origen y entrada al destino.
  3. Ciclo de vida y estados de transferencia:
     - `Borrador`, `PendienteAprobacion`, `EnTransito`, `RecibidaTotal`, `RecibidaParcial`, `Rechazada`, `Cancelada`.
     - Para transferencias que requieran confirmación de recepción física, las existencias deben colocarse en estado `EnTransito` y no figurar como disponibles en el destino hasta la confirmación de recepción por el custodio receptor.
  4. Discrepancias en recepción y atomicidad:
     - Permitir registrar diferencias justificadas entre la cantidad despachada y la cantidad efectivamente recibida.
     - Control transaccional y reversión lógica de operaciones fallidas para impedir movimientos huérfanos.
     - Control de concurrencia para evitar transferencias simultáneas que superen las existencias locales disponibles.
- **Comportamiento Esperado:**
  Una transferencia de 10 unidades desde una bodega con 8 unidades disponibles debe ser rechazada inmediatamente antes de registrar cualquier movimiento. Una transferencia válida conserva la trazabilidad desde el despacho en origen hasta la recepción conforme en destino.
- **Criterios de Aceptación:**
  - Se valida el saldo específico de la ubicación de origen antes de operar.
  - No se producen salidas parciales ni saldos negativos por errores de validación.
  - Se registran correctamente las existencias en tránsito entre dependencias.
  - Se confirma la recepción física y se documentan discrepancias.
  - Salida y entrada comparten identificador de transferencia y trazabilidad.
  - No existen movimientos huérfanos bajo fallos o interrupciones de red.
  - Se garantiza integridad y bloqueo transaccional bajo solicitudes concurrentes.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ALTA PRIORIDAD (P1 - CAPACIDADES CONTABLES, DEPRECIACIÓN, CATÁLOGO MAESTRO, MANTENIMIENTO PREVENTIVO Y VALORACIÓN)

---

### [ ] [F19-Task04] Motor integral de depreciación y gestión contable de activos fijos
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E (F19-12), Sección G (Defecto 3) y Plan de Trabajo F19-04
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Cumplimiento contable institucional, cálculo de vida útil, amortización acumulada y balance patrimonial)
- **Archivos Involucrados:**
  - `ActivosPatrimoniales`
  - `AsientosContables`
  - `backend/accounting-service/Code.gs` (`manageAssetItem`, `getAssetItems`, `registerAssetDisposal`, nuevas funciones `calculateAssetDepreciation`, `getAssetDepreciationSchedule`)
  - Hoja `DepreciacionesActivos`
  - `js/accounting.js`
- **Dependencias Expuestas:** `ActivosPatrimoniales`, `AsientosContables`, `recordAccountingJournalEntry`, Plan de cuentas institucional
- **Descripción del Alcance:**
  Los activos patrimoniales están registrados, pero la plataforma no calcula su depreciación, vida útil restante, depreciación acumulada ni valor neto en libros, ni genera los asientos contables correspondientes en el libro diario.
  Requerimientos Funcionales Detallados:
  1. Ficha financiera completa de activos:
     - Código patrimonial, descripción, categoría contable, fecha de adquisición, fecha de puesta en funcionamiento, costo de adquisición, costos adicionales capitalizables, valor de adquisición total, valor residual estimado, vida útil en años/meses, método de depreciación, fecha de inicio, cuenta contable de activo, cuenta de depreciación acumulada, cuenta de gasto por depreciación, centro de costo o departamento responsable y moneda de registro.
  2. Métodos de depreciación configurables por categoría:
     - Línea Recta: distribución uniforme del importe depreciable durante la vida útil:
       `Importe Depreciable = Costo Capitalizado - Valor Residual`
       `Depreciación Mensual = Importe Depreciable / Vida Útil en Meses`
     - Saldo Decreciente: depreciación calculada sobre el valor en libros pendiente.
     - Unidades de Producción o Utilización: en función del desgaste o uso medible.
     - Políticas configurables por categoría de activo sin forzar un método universal.
  3. Calendario automático de depreciación:
     - Consultar depreciación mensual, anual, acumulada, valor neto en libros, vida útil transcurrida/restante y fecha estimada de finalización.
     - Registro de activos históricos de apertura con depreciación acumulada inicial y valor neto de apertura.
     - Evitar que un activo se deprecie por debajo de su valor residual configurado.
     - Suspender la depreciación en activos retirados, dados de baja o totalmente depreciados.
  4. Generación de asientos contables automáticos por partida doble:
     - Generar el asiento periódico:
       * Débito: Gasto por Depreciación (Centro de costo correspondiente).
       * Crédito: Depreciación Acumulada de Activo Fijo.
     - Validar estrictamente la partida doble (`Math.abs(totalDebe - totalHaber) <= 0.01`).
     - Protección contra contabilización duplicada del mismo período para el mismo activo.
     - Procedimiento de ajuste/reversión que preserve el asiento original en la auditoría.
     - Integración con bajas patrimoniales: al disponer de un activo, calcular su valor neto en libros a la fecha efectiva de baja y reconocer la ganancia o pérdida contable correspondiente.
  5. Reportes patrimoniales y conciliación:
     - Cuadro de depreciación por activo, acumulada por categoría, valor neto patrimonial, activos totalmente depreciados y conciliación entre el inventario patrimonial y el libro mayor.
- **Criterios de Aceptación:**
  - Se calculan correctamente los métodos configurados (línea recta, saldo decreciente, unidades).
  - Las políticas de depreciación son configurables por categoría de activo.
  - Se respeta estrictamente el valor residual como tope mínimo de valor en libros.
  - Se generan calendarios individuales y consolidados en pantalla.
  - Todos los asientos contables generados cumplen estricta partida doble.
  - Se bloquea la contabilización duplicada de un período ya procesado.
  - Se admiten activos adquiridos con anterioridad con saldo inicial de depreciación.
  - Las mejoras capitalizables actualizan la base de cálculo de forma trazable.
  - Las bajas reconocen el valor neto en libros a la fecha de disposición.
  - Los reportes patrimoniales coinciden exactamente con las cuentas contables de balance.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task05] Creación de un catálogo maestro institucional de artículos, materiales y suministros
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E (F19-01), Sección G y Plan de Trabajo F19-05
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Estandarización de materiales, prevención de duplicados tipográficos, normalización de unidades de medida y control de adquisiciones)
- **Archivos Involucrados:**
  - Hoja `CatalogoArticulos`
  - `InventariosKardex`
  - `AlmacenesUbicaciones`
  - `MaterialesSolicitudes`
  - `backend/accounting-service/Code.gs` (nuevas funciones `manageCatalogItem`, `getCatalogItems`)
  - `js/accounting.js`
- **Dependencias Expuestas:** `InventariosKardex`, `MaterialesSolicitudes`, `OrdenesCompra`, `F19-Task01`
- **Descripción del Alcance:**
  Los artículos se crean actualmente al vuelo en `InventariosKardex`. Esto provoca que si se ingresa un nombre con pequeñas variaciones tipográficas bajo el mismo código (o códigos distintos para el mismo producto), se originen discrepancias en los reportes de inventario y compras.
  Requerimientos Funcionales Detallados:
  1. Catálogo maestro independiente:
     - Ficha individual de artículo con: `ItemCodigo` (único institucional), `ItemNombre` (normalizado), `Descripcion`, `Categoria`, `Subcategoria`, `UnidadMedida`, `Marca`, `Modelo/Referencia`, `ImagenUrl`, `CodigoBarras`, `CodigoQR`, `EspecificacionesTecnicas`, `ProveedorHabitualId`, `CostoReferencial`, `CostoUltimaAdquisicion`, `CostoPromedio`, `StockMinimo`, `StockMaximo`, `PuntoReposicion`, `Estado` (`Activo`, `Inactivo`), `Observaciones`.
  2. Categorización dinámica y unidades de medida:
     - Categorías configurables sin alterar código: Material didáctico, Útiles escolares, Papelería y oficina, Equipos tecnológicos, Mobiliario, Material de laboratorio, Insumos de enfermería, Productos de limpieza, Cafetería y tienda, Herramientas, Repuestos, entre otros.
     - Unidades de medida configurables (unidad, paquete, caja, litro, galón, kilogramo, gramo, metro, rollo, resma).
     - Conversiones entre unidades compatibles (ej. una caja de 12 unidades se recibe como caja y se distribuye como 12 unidades individuales).
  3. Normalización y prevención de duplicados:
     - Normalización de nombres y códigos, evitando duplicados por diferencias de mayúsculas, tildes o espacios.
     - Búsqueda y sugerencias de artículos similares antes de registrar uno nuevo.
     - Importación y exportación a Excel con validación previa de códigos y unidades.
     - Desactivación lógica de artículos sin eliminar su historial de movimientos.
     - Relación clara con activos fijos cuando proceda, sin confundir consumibles con bienes patrimoniales.
- **Criterios de Aceptación:**
  - Existe el catálogo maestro `CatalogoArticulos` independiente del Kardex.
  - Cada artículo posee un código institucional único no repetible.
  - Las unidades de medida y factores de conversión son configurables.
  - Se detectan y alertan posibles duplicados antes de guardar.
  - Todas las operaciones de Kardex y solicitudes exigen la selección de artículos del catálogo.
  - Los artículos desactivados conservan su historial pero quedan bloqueados para nuevas operaciones.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task06] Programación automática y administración del mantenimiento preventivo recurrente
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E (F19-15), Sección C (2.15) y Plan de Trabajo F19-06
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Preservación de infraestructura, continuidad operativa, planificación de intervenciones y prevención de fallas mayores)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`manageMaintenanceOrder`, `getMaintenanceOrders`, nuevas funciones `schedulePreventiveMaintenancePlan`, `getPreventiveMaintenanceAlerts`)
  - Hoja `MantenimientoPlanes`
  - `MantenimientoOrdenes`
  - `ActivosPatrimoniales`
  - `InventariosKardex`
  - `js/accounting.js`
- **Dependencias Expuestas:** `MantenimientoOrdenes`, `ActivosPatrimoniales`, `InventariosKardex`, `F19-Task01`, `F19-Task05`
- **Descripción del Alcance:**
  La plataforma permite crear órdenes preventivas aisladas, pero no administra automáticamente los calendarios de mantenimiento ni calcula cuándo debe ejecutarse la siguiente intervención periódica en base a frecuencias preestablecidas.
  Requerimientos Funcionales Detallados:
  1. Planes de mantenimiento preventivo:
     - Asociar planes a: un activo específico, categoría de activos, instalación, ubicación física o conjunto de equipos.
     - Frecuencias configurables: diaria, semanal, quincenal, mensual, trimestral, semestral, anual, intervalo en días o unidades de uso/horas.
     - Registrar: fecha del último mantenimiento, fecha del próximo mantenimiento, frecuencia, responsable técnico, procedimiento, lista de actividades/checklist, repuestos necesarios, duración estimada, costo presupuestado y tiempo de inactividad previsto.
  2. Generación automática y alertas de vencimiento:
     - Generar automáticamente órdenes de trabajo en `MantenimientoOrdenes` al aproximarse la fecha programada.
     - Alertas preventivas escalonadas (30, 15, 7 y 1 día antes).
     - Al completar la intervención, actualizar la fecha del último mantenimiento y proyectar la nueva fecha según la frecuencia configurada.
     - Posponer intervenciones con justificación obligatoria conservando el historial.
     - Impedir órdenes duplicadas para un mismo ciclo de mantenimiento.
  3. Plantillas de mantenimiento e indicadores:
     - Plantillas estándar por tipo de activo (computadoras, aires acondicionados, vehículos, instalaciones eléctricas, laboratorios).
     - Descuento de repuestos consumidos en Kardex al resolver la orden.
     - Indicadores de cumplimiento: mantenimientos programados vs ejecutados, porcentaje de cumplimiento, costos acumulados y tiempo promedio de resolución.
- **Criterios de Aceptación:**
  - Se pueden configurar planes de mantenimiento con diferentes periodicidades.
  - Las órdenes se generan automáticamente según el cronograma.
  - No se duplican órdenes para un mismo ciclo preventivo.
  - Las fechas se recalculan automáticamente al completar la intervención.
  - Se identifican mantenimientos atrasados con alertas destacadas.
  - Los repuestos utilizados se descuentan de forma exacta en Kardex.
  - Se consultan indicadores de cumplimiento y costos acumulados por activo.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task07] Integración contable de consumos, entregas y movimientos de inventario
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E (F19-17), Sección C (2.17) y Plan de Trabajo F19-07
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Control de costos departamentales, exactitud contable en consumo de suministros y seguimiento presupuestario)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`recordInventoryMovement`, `deliverMaterialRequisition`, `createMaterialRequisition`)
  - `AsientosContables`
  - `MaterialesSolicitudes`
  - `InventariosKardex`
  - `js/accounting.js`
- **Dependencias Expuestas:** `MaterialesSolicitudes`, `AsientosContables`, `recordAccountingJournalEntry`, `F19-Task01`, `F19-Task05`
- **Descripción del Alcance:**
  Las entradas de compras están integradas con el inventario, pero los consumos de materiales y las entregas por departamento no generan automáticamente el reconocimiento contable correspondiente en el libro diario.
  Requerimientos Funcionales Detallados:
  1. Centros de costo y destino de consumo:
     - Incorporar departamento responsable y centro de costo en las requisiciones: Dirección, Secretaría, Administración, Docencia, Laboratorio, Biblioteca, Enfermería, Cafetería, Mantenimiento, Deportes, entre otros.
  2. Reglas de contabilización de consumo:
     - Al entregar materiales de bodega mediante `deliverMaterialRequisition`, generar el asiento contable:
       * Débito: Gasto Operativo / Materiales y Suministros (Centro de costo del departamento).
       * Crédito: Inventario de Suministros (Activo Circulante).
     - Diferenciar consumos reales de transferencias internas entre almacenes (las transferencias entre bodegas no generan gastos institucionales).
     - Opción configurable: reconocimiento inmediato como gasto al entregar vs material en tránsito/asignado hasta su consumo efectivo.
  3. Devoluciones, repuestos y prevención de duplicados:
     - Contemplar devoluciones de materiales al almacén con reversión contable por partida doble.
     - Imputar los repuestos de órdenes de mantenimiento al departamento solicitante.
     - Evitar asientos duplicados bajo reintentos o reprocesos de solicitudes.
- **Criterios de Aceptación:**
  - Toda entrega de materiales cuenta con departamento y centro de costo asignado.
  - Se genera el asiento contable balanceado en `AsientosContables` al confirmar la entrega.
  - Las transferencias entre almacenes no originan asientos de gasto.
  - Las devoluciones de insumos revierten el gasto e incrementan el inventario contable.
  - Los asientos cumplen estricta partida doble (`totalDebe === totalHaber`).
  - No se generan contabilizaciones duplicadas por reintentos.
  - Se concilia el consumo físico en Kardex con el saldo de las cuentas de mayor contable.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task08] Implementación de un sistema integral de valoración económica del inventario
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E (F19-19) y Plan de Trabajo F19-08
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Valuación de existencias, estados financieros precisos, métodos PEPS/Promedio y auditoría contable)
- **Archivos Involucrados:**
  - `InventariosKardex`
  - `CatalogoArticulos`
  - `AsientosContables`
  - `backend/accounting-service/Code.gs` (`getInventoryKardex`, `recordInventoryMovement`, nueva función `getValuatedInventoryReport`)
  - `js/accounting.js`
- **Dependencias Expuestas:** `InventariosKardex`, `CatalogoArticulos`, `AsientosContables`, `F19-Task01`, `F19-Task05`
- **Descripción del Alcance:**
  La plataforma permite consultar existencias físicas en unidades, pero no dispone de un sistema completo para determinar el valor monetario del inventario ni generar informes de valoración financiera por almacén, artículo y categoría contable.
  Requerimientos Funcionales Detallados:
  1. Métodos de valoración configurables:
     - PEPS (FIFO): identificar capas de adquisición y consumir primero las existencias de mayor antigüedad.
     - Costo Promedio Ponderado: recalcular el costo medio unitario tras cada entrada de compra valorizada.
     - Permitir asignar el método de valoración por categoría de artículo según las políticas institucionales.
  2. Trazabilidad de costos y transferencias:
     - Registrar el costo unitario de cada entrada vinculado a su orden de compra o factura.
     - Los traslados entre bodegas deben conservar el costo contable del inventario transferido.
     - Los ajustes por conteo físico deben reconocer el efecto económico monetario de sobrantes o faltantes.
  3. Informes y conciliación económica:
     - Consultar a cualquier fecha de corte: cantidad disponible, costo unitario, valor total por artículo, por almacén, por categoría y total institucional.
     - Conciliación entre el auxiliar valorizado de inventario y las cuentas de activo realizable del libro mayor.
     - Exportación a Excel y PDF con sumatorias matemáticas verificadas.
     - Prohibir alteraciones retroactivas de costos históricos sin procedimiento de ajuste trazable.
- **Criterios de Aceptación:**
  - Se encuentran operativos los métodos PEPS y costo promedio ponderado.
  - Las salidas de almacén reconocen el costo exacto según el método asignado.
  - Las transferencias entre almacenes conservan el valor contable de los bienes.
  - Los ajustes por conteo físico reflejan con precisión su impacto económico.
  - Se generan reportes de inventario valorizado a fechas históricas de corte.
  - Los totales valorizados coinciden con los balances contables de inventario.
  - Se exportan informes estructurados a Excel y PDF sin discrepancias.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task09] Implementación de reservas, disponibilidad y reposición inteligente de materiales
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E (F19-04, F19-10) y Plan de Trabajo F19-09
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Continuidad operativa, abastecimiento oportuno, prevención de sobrecompras y gestión de compromisos)
- **Archivos Involucrados:**
  - `CatalogoArticulos`
  - `MaterialesSolicitudes`
  - `InventariosKardex`
  - `backend/accounting-service/Code.gs` (`createMaterialRequisition`, `deliverMaterialRequisition`, `createPurchaseRequest`, nueva función `getInventoryReplenishmentSuggestions`)
  - `js/accounting.js`
- **Dependencias Expuestas:** `CatalogoArticulos`, `MaterialesSolicitudes`, `InventariosKardex`, `F19-Task01`, `F19-Task05`
- **Descripción del Alcance:**
  Aunque existen existencias mínimas y alertas de stock bajo, el sistema no diferencia las cantidades físicas de las comprometidas mediante solicitudes pendientes, ni dispone de un motor de planificación y reposición de compras.
  Requerimientos Funcionales Detallados:
  1. Segregación de estados de existencias:
     - Mantener en tiempo real: Existencia física, Existencia reservada, Existencia disponible, Existencia pendiente de recepción (órdenes de compra emitidas) y Existencia en tránsito.
     - Al aprobar una solicitud de material, reservar las unidades sin descontarlas físicamente del Kardex hasta su entrega real.
     - Liberar automáticamente las reservas al cancelar, rechazar o modificar la requisición.
     - Bloquear solicitudes que pretendan comprometer más unidades de las disponibles.
  2. Motor inteligente de reposición:
     - Puntos de reposición configurables por artículo y almacén (`StockMinimo`, `StockMaximo`, `StockObjetivo`).
     - Cálculo de la cantidad sugerida considerando: disponible, reservada, consumo promedio histórico, tiempo de entrega de proveedores y pedidos en tránsito.
     - Convertir sugerencias de reposición en solicitudes internas de compra (`createPurchaseRequest`) con un solo clic.
     - Indicadores de rotación de existencias, consumo promedio y días de cobertura estimados.
     - Evitar generar sugerencias duplicadas si ya existe una orden de compra en trámite que cubra la necesidad.
- **Criterios de Aceptación:**
  - Las reservas de material no alteran las existencias físicas hasta la entrega en almacén.
  - El sistema impide comprometer más unidades de las existencias disponibles reales.
  - La cancelación de solicitudes aprobadas restituye inmediatamente las existencias a disponibilidad.
  - Las sugerencias de reposición descuentan las compras en tránsito evitando sobrecompras.
  - Las sugerencias pueden convertirse en solicitudes de compra internas sin alterar órdenes aprobadas.
  - Se identifican oportunamente artículos con exceso de existencias y artículos con riesgo de quiebre.
- **Estado:** [ ] Pendiente

---

## TAREAS DE PRIORIDAD MEDIA (P2 - TRAZABILIDAD, CÓDIGOS QR, LOTES, GARANTÍAS, NOTIFICACIONES Y EXPEDIENTES)

---

### [ ] [F19-Task10] Identificación institucional de activos y materiales mediante códigos QR y códigos de barras
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E (F19-07), Sección C (2.7) y Plan de Trabajo F19-10
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Productividad en campo, toma ágil de inventarios, reducción de errores de digitación y escaneo móvil)
- **Archivos Involucrados:**
  - `CatalogoArticulos`
  - `ActivosPatrimoniales`
  - `AsignacionesActivos`
  - `InventariosKardex`
  - `backend/accounting-service/Code.gs` (nuevas funciones `generateItemQRCode`, `resolveItemByBarcode`)
  - `dashboard-contabilidad.html`
  - `js/accounting.js`
- **Dependencias Expuestas:** `CatalogoArticulos`, `ActivosPatrimoniales`, `F19-Task05`
- **Descripción del Alcance:**
  Los activos y materiales no disponen de mecanismos ópticos de identificación rápida. Las auditorías e inspecciones en bodegas o aulas dependen de búsquedas manuales o digitación propensa a errores.
  Requerimientos Funcionales Detallados:
  1. Generación de códigos QR y de barras:
     - Generar automáticamente identificadores QR para activos patrimoniales, insumos de catálogo, lotes y equipos bajo custodia.
     - Generar códigos de barras para artículos con identificación logística.
     - El código debe contener un identificador institucional seguro sin exponer datos confidenciales ni credenciales.
  2. Escaneo móvil y consulta rápida:
     - Herramienta de escaneo con cámara móvil o lectores ópticos externos.
     - Al escanear un activo, mostrar de inmediato: código patrimonial, descripción, categoría, marca, serie, estado operativo, ubicación, custodio actual, historial, garantías y mantenimientos.
     - Al escanear un material, mostrar: código, nombre, categoría, unidad, existencias por almacén, lotes y vencimientos.
     - Habilitar acciones según rol: consultar, registrar entrada/salida, transferir, inventario físico, asignar custodia, reportar daños.
  3. Impresión y reposición de etiquetas:
     - Generación de etiquetas imprimibles individuales o en lote con membrete institucional.
     - Configuración de formato y tamaños de etiquetas.
     - Reposición de etiquetas dañadas conservando el código original sin alterar identificadores.
- **Criterios de Aceptación:**
  - Cada activo y material puede disponer de su código QR institucional único.
  - El escaneo desde dispositivos móviles o lectores ópticos abre directamente la ficha del bien.
  - La consulta respeta estrictamente los permisos RBAC del usuario autenticado.
  - Se generan plantillas de impresión de etiquetas individuales y masivas.
  - Los códigos QR no exponen información privada ni datos sensibles en texto plano.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task11] Control de lotes, números de serie y fechas de vencimiento
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E (F19-08, F19-10) y Plan de Trabajo F19-11
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Control sanitario, trazabilidad de insumos perecederos de cafetería, reactivos de ciencias y medicamentos de enfermería)
- **Archivos Involucrados:**
  - `CatalogoArticulos`
  - `InventariosKardex`
  - Hoja `InventariosLotes`
  - Hoja `InventariosSeries`
  - `backend/accounting-service/Code.gs` (`recordInventoryMovement`, `getInventoryKardex`, nueva función `getExpiringInventoryAlerts`)
  - `js/accounting.js`
- **Dependencias Expuestas:** `CatalogoArticulos`, `InventariosKardex`, `F19-Task01`, `F19-Task05`, `F19-Task10`
- **Descripción del Alcance:**
  El inventario no discrimina lotes de adquisición, números de serie individuales ni fechas de vencimiento. Esto limita la trazabilidad y el control de calidad de insumos perecederos o reactivos de laboratorio.
  Requerimientos Funcionales Detallados:
  1. Modalidades de seguimiento por artículo:
     - Sin seguimiento individual, Seguimiento por lote o Seguimiento por número de serie.
     - Lotes: número de lote, proveedor, fecha de recepción, fabricación, vencimiento, cantidad recibida/disponible, ubicación y costo.
     - Números de serie: identidad individual única por unidad, impidiendo que el mismo número de serie exista simultáneamente en dos ubicaciones o custodias distintas.
  2. Estrategias de rotación y consumo:
     - Selección automática según PVPS/FEFO (First Expired, First Out) para insumos con caducidad.
     - Sugerir prioritariamente el lote con fecha de expiración más próxima utilizable.
     - Excepciones justificadas con autorización documentada para despachar lotes distintos.
  3. Alertas de caducidad y bloqueo de lotes:
     - Alertas preventivas configurables (30, 60 días antes del vencimiento).
     - Bloqueo automático para consumo de lotes vencidos o retirados por el proveedor.
     - Registro documentado de bajas por vencimiento o deterioro.
- **Criterios de Aceptación:**
  - Los artículos pueden configurarse con control por lote, serie o estándar.
  - Los números de serie son estrictamente únicos en la base de datos.
  - El motor de entrega selecciona automáticamente el lote más próximo a vencer (FEFO).
  - Se bloquea la entrega o consumo de lotes cuya fecha de vencimiento haya expirado.
  - Se reportan oportunamente los lotes en riesgo de caducidad.
  - Se mantiene la trazabilidad del destino de cada lote consumido o transferido.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task12] Gestión de garantías, pólizas y cobertura de activos patrimoniales
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E (F19-13), Sección C (2.13) y Plan de Trabajo F19-12
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Ahorro en reparaciones, soporte de proveedores, trazabilidad de siniestros y reclamos comerciales)
- **Archivos Involucrados:**
  - `ActivosPatrimoniales`
  - Hoja `ActivosGarantias`
  - `MantenimientoOrdenes`
  - `backend/accounting-service/Code.gs` (`manageAssetItem`, `getAssetItems`, nueva función `getAssetWarrantyAlerts`)
  - `js/accounting.js`
- **Dependencias Expuestas:** `ActivosPatrimoniales`, `MantenimientoOrdenes`, `ProveedoresActivos`, `F19-Task06`
- **Descripción del Alcance:**
  La ficha de activos no almacena información de pólizas ni fechas de cobertura de garantías de proveedores. Cuando un equipo falla, se corre el riesgo de incurrir en gastos de reparación que podrían tramitarse sin costo ante el fabricante o aseguradora.
  Requerimientos Funcionales Detallados:
  1. Ficha de garantías y pólizas de activos:
     - Proveedor o fabricante, número de garantía, póliza, fecha de adquisición, fecha de inicio y vencimiento de cobertura, tipo de cobertura, condiciones, exclusiones, costo de póliza, contacto de soporte y documentos adjuntos.
     - Múltiples coberturas simultáneas por bien (ej. garantía de fábrica y seguro contra robo o accidentes).
  2. Alertas e integración con órdenes de mantenimiento:
     - Alertas de garantías próximas a vencer en los siguientes 30 y 60 días.
     - Al reportar una falla en `MantenimientoOrdenes`, informar inmediatamente si el equipo cuenta con cobertura vigente y mostrar los contactos para tramitar el reclamo.
     - Registro de reclamos: fecha, falla, número de caso, respuesta del proveedor, resultado y costos cubiertos vs no cubiertos.
     - Evitar contabilizar como gasto de la institución los costos asumidos íntegramente por la garantía.
- **Criterios de Aceptación:**
  - Cada activo puede registrar múltiples pólizas o garantías con fechas y condiciones.
  - Se generan alertas destacadas ante garantías próximas a expirar.
  - Al abrir una orden de reparación se despliega la vigencia de garantía del equipo.
  - Las reparaciones cubiertas por garantía diferencian el importe cubierto del costo asumido institucionalmente.
  - Se conserva el expediente de reclamos de garantía y resultados obtenidos.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task13] Sistema centralizado de alertas y notificaciones multicanal
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E (F19-18), Sección C (2.18) y Plan de Trabajo F19-13
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Comunicación oportuna, abastecimiento ágil, atención prioritaria de fallas y alertas preventivas)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs` (`sendMultiChannelNotification`, `retryFailedNotificationsQueue`)
  - `InventariosKardex`
  - `MaterialesSolicitudes`
  - `MantenimientoOrdenes`
  - `ActivosPatrimoniales`
  - `js/accounting.js`
- **Dependencias Expuestas:** `sendMultiChannelNotification`, `InventariosKardex`, `MantenimientoOrdenes`, `F19-Task06`, `F19-Task11`
- **Descripción del Alcance:**
  Las alertas de inventario bajo mínimos y asignación de órdenes de mantenimiento solo son visibles al ingresar a la pantalla contable. No existe una comunicación automatizada multicanal hacia los responsables operativos.
  Requerimientos Funcionales Detallados:
  1. Catálogo de eventos de notificación:
     - Inventario: stock mínimo alcanzado, stock agotado, existencias negativas detectadas, solicitud pendiente de aprobación, solicitud aprobada, material listo para entrega, transferencias pendientes de recibir, discrepancias en conteos físicos.
     - Activos: nueva asignación de custodia, devolución vencida o pendiente, activo reportado dañado, garantía próxima a vencer.
     - Mantenimiento: mantenimiento preventivo próximo o atrasado, orden urgente asignada a técnico, repuestos insuficientes, orden completada.
  2. Despacho multicanal y preferencias:
     - Canales: notificaciones internas de plataforma, correo electrónico institucional y WhatsApp (cuando esté habilitado).
     - Configuración de destinatarios por rol, usuario, departamento y tipo de evento.
     - Niveles de prioridad (informativo, advertencia, crítico) y prevención de notificaciones repetitivas mediante claves de deduplicación.
     - Centro de notificaciones interno con estados de leído/pendiente y registro de reintentos fallidos.
- **Criterios de Aceptación:**
  - Un quiebre de stock mínimo dispara automáticamente el aviso a los encargados configurados.
  - La asignación de órdenes de trabajo urgentes notifica de inmediato al personal técnico.
  - Se controlan duplicados mediante deduplicación diaria.
  - Los errores en el servicio de notificación no bloquean las transacciones contables o de inventario.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task14] Gestión documental, expedientes y actas de inventario y patrimonio
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E (F19-14), Sección C y Plan de Trabajo F19-14
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Respaldo probatorio, expedientes patrimoniales 360°, actas digitales y archivo seguro en Drive)
- **Archivos Involucrados:**
  - `InventariosKardex`
  - `ActivosPatrimoniales`
  - `AsignacionesActivos`
  - `BajasBienes`
  - `MantenimientoOrdenes`
  - Google Drive API
  - `js/accounting.js`
- **Dependencias Expuestas:** Google Drive API, `F19-Task02`, `F19-Task04`, `F19-Task06`, `F19-Task12`
- **Descripción del Alcance:**
  La plataforma registra movimientos y custodias, pero carece de un repositorio documental estructurado para archivar y vincular comprobantes de compra, pólizas, actas de custodia firmadas, fotografías de daños y actas de disposición patrimonial.
  Requerimientos Funcionales Detallados:
  1. Tipología documental y expedientes unificados:
     - Facturas de compra, comprobantes, garantías, manuales, fotografías de estado físico, actas de asignación, actas de devolución, actas de baja, reportes de mantenimiento y certificados de calibración.
     - Expediente patrimonial 360° por cada activo consultable desde su ficha técnica.
  2. Generación automática de actas PDF institucionales:
     - Acta de entrega de activos bajo custodia, acta de devolución y finiquito, acta de transferencia entre almacenes, acta de baja patrimonial y órdenes de mantenimiento.
     - Incluir identificador único, fecha, datos del responsable, firmas institucionales y evidencias fotográficas de antes/después.
     - Almacenamiento organizado en Google Drive bajo carpetas institucionales con referencias persistentes.
     - Preservar permanentemente los expedientes documentales de bienes dados de baja.
- **Criterios de Aceptación:**
  - Cada activo e insumo cuenta con acceso directo a su expediente documental.
  - Las asignaciones, devoluciones y bajas generan sus actas en PDF descargables.
  - Los archivos adjuntos se organizan automáticamente en carpetas estructuradas de Drive.
  - Los activos dados de baja conservan intacto su expediente probatorio histórico.
  - Se controlan los permisos de visualización documental de acuerdo con el rol del usuario.
- **Estado:** [ ] Pendiente

---

## TAREAS COMPLEMENTARIAS Y DE OPTIMIZACIÓN (P3 - DASHBOARDS GERENCIALES, PRESUPUESTOS, REQUISICIONES, CONTEOS Y DISPOSICIÓN)

---

### [ ] [F19-Task15] Panel de control gerencial de inventarios, activos y mantenimiento
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E y Plan de Trabajo F19-15
- **Prioridad:** P3
- **Severidad/Clasificación:** Baja (Analítica gerencial, toma de decisiones estratégicas, indicadores en tiempo real y reportería ejecutiva)
- **Archivos Involucrados:**
  - `js/accounting.js`
  - `dashboard-contabilidad.html`
  - `backend/accounting-service/Code.gs` (nueva función `getInventoryAssetsExecutiveDashboard`)
  - `InventariosKardex`
  - `ActivosPatrimoniales`
  - `MantenimientoOrdenes`
- **Dependencias Expuestas:** `F19-Task04`, `F19-Task07`, `F19-Task08`, `F19-Task13`
- **Descripción del Alcance:**
  La interfaz ofrece listados tabulares operativos pero carece de un panel consolidado de control directivo con métricas gráficas e indicadores financieros del patrimonio y suministros institucionales.
  Requerimientos Funcionales Detallados:
  1. Indicadores ejecutivos consolidados:
     - Inventario: valor total del inventario, artículos activos, existencias por almacén, artículos bajo mínimo, agotados, sin rotación, con sobrestock, próximos a vencer, consumo mensual y rotación.
     - Activos: total de activos registrados, valor de adquisición, valor neto en libros, depreciación acumulada, asignados, disponibles, en mantenimiento, dados de baja y garantías por expirar.
     - Mantenimiento: órdenes abiertas, pendientes, vencidas, completadas, ratio preventivo vs correctivo, costos reales vs estimados, gastos por departamento y equipos con mayor tasa de falla.
  2. Filtros interactivos y exportación:
     - Filtros cruzados por período, almacén, departamento, categoría, tipo de activo y custodio.
     - Gráficos de evolución mensual y exportación a Excel y PDF con fecha de corte y actualización de datos visible.
- **Criterios de Aceptación:**
  - Los indicadores concuerdan exactamente con las cifras del Kardex y del registro de activos.
  - Los filtros interactivos actualizan las tarjetas y gráficos simultáneamente.
  - Se permite navegar desde cualquier indicador hasta los registros detallados de origen.
  - Se exportan reportes ejecutivos en formatos PDF y Excel.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task16] Gestión presupuestaria y análisis de costos de suministros y mantenimiento por departamento
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E y Plan de Trabajo F19-16
- **Prioridad:** P3
- **Severidad/Clasificación:** Baja (Control del gasto departamental, comparativa planificado vs real y límites de consumo)
- **Archivos Involucrados:**
  - `MaterialesSolicitudes`
  - `MantenimientoOrdenes`
  - `AsientosContables`
  - `PresupuestosInstitucionales`
  - `backend/accounting-service/Code.gs` (`checkBudgetAvailability`, nueva función `getDepartmentalMaterialCostAnalysis`)
  - `js/accounting.js`
- **Dependencias Expuestas:** `PresupuestosInstitucionales`, `MaterialesSolicitudes`, `F19-Task07`, `F19-Task15`
- **Descripción del Alcance:**
  Los consumos y reparaciones se registran operativamente pero no se contrastan contra los techos presupuestarios aprobados para cada área departamental de la academia.
  Requerimientos Funcionales Detallados:
  1. Techos presupuestarios por departamento:
     - Asignar presupuestos de suministros y mantenimiento por departamento y período (mensual, trimestral, anual).
     - Calcular automáticamente: Presupuesto aprobado, Gasto comprometido, Gasto ejecutado, Saldo disponible y Porcentaje de ejecución.
  2. Control previo y alertas de sobrecosto:
     - Al aprobar requisiciones de materiales u órdenes de reparación, contrastar contra el presupuesto disponible del centro de costo.
     - Alertas al alcanzar el 80% y 95% del presupuesto asignado.
     - Exigir autorización especial de Dirección/Administración cuando una solicitud supere el saldo presupuestario disponible.
     - Comparativas de variación presupuestaria y departamentos con sobrecostos recurrentes.
- **Criterios de Aceptación:**
  - Los gastos de materiales y reparaciones se imputan al presupuesto del departamento solicitante.
  - Se calculan los montos comprometidos y ejecutados en tiempo real.
  - Se alerta y exige autorización directiva ante solicitudes que excedan el presupuesto disponible.
  - Los reportes presupuestarios concuerdan con los asientos del libro diario contable.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task17] Optimización del ciclo de requisiciones internas y distribución de materiales
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E y Plan de Trabajo F19-17
- **Prioridad:** P3
- **Severidad/Clasificación:** Baja (Productividad operativa, solicitudes multirrenglón, entregas parciales y confirmación de recepción)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`createMaterialRequisition`, `getMaterialRequisitions`, `deliverMaterialRequisition`)
  - `MaterialesSolicitudes`
  - `CatalogoArticulos`
  - `InventariosKardex`
  - `js/accounting.js`
- **Dependencias Expuestas:** `MaterialesSolicitudes`, `CatalogoArticulos`, `F19-Task05`, `F19-Task09`
- **Descripción del Alcance:**
  La entrega de materiales actual es un proceso directo de un solo paso que no contempla aprobaciones parciales, entregas diferidas por renglón ni confirmación formal de recepción por parte del docente solicitante.
  Requerimientos Funcionales Detallados:
  1. Ciclo de estados ampliado de solicitudes:
     - `Borrador`, `Enviada`, `PendienteAprobacion`, `AprobadaTotal`, `AprobadaParcial`, `EnPreparacion`, `EntregadaParcial`, `EntregadaTotal`, `Rechazada`, `Cancelada`.
     - Solicitudes multirrenglón con cantidades solicitadas, aprobadas y entregadas por cada artículo.
  2. Aprobaciones y entregas parciales:
     - Justificación de cantidades reducidas o partidas rechazadas.
     - Entregas escalonadas registrando entregas parciales y saldo pendiente de despacho.
     - Comprobante de entrega con firma o confirmación digital del solicitante.
     - Interfaz simplificada y amigable para docentes y personal escolar con historial de pedidos.
- **Criterios de Aceptación:**
  - Se admiten solicitudes con múltiples artículos en un solo envío.
  - Se pueden aprobar o entregar cantidades parciales conservando el remanente en seguimiento.
  - El solicitante puede confirmar la recepción física de sus materiales.
  - Las reservas de inventario se ajustan exactamente a las cantidades pendientes de entrega.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task18] Optimización del inventario físico y conciliaciones periódicas por ubicación
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E, Sección F y Plan de Trabajo F19-18
- **Prioridad:** P3
- **Severidad/Clasificación:** Baja (Auditoría continua, conteos cíclicos sin detener operaciones, conteos ciegos y precisión de inventario)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`createPhysicalInventoryCount`, `getPhysicalInventoryCounts`, `reconcilePhysicalCount`)
  - `InventariosConteosFisicos`
  - `InventariosKardex`
  - `js/accounting.js`
- **Dependencias Expuestas:** `InventariosConteosFisicos`, `InventariosKardex`, `F19-Task01`, `F19-Task05`, `F19-Task08`, `F19-Task11`
- **Descripción del Alcance:**
  La conciliación de conteo físico está implementada pero opera de forma general, sin soportar conteos cíclicos por estantería/bodega, hojas de conteo ciego ni doble verificación en discrepancias significativas.
  Requerimientos Funcionales Detallados:
  1. Conteos cíclicos y programados:
     - Programar conteos por almacén, ubicación física, categoría o muestra rotativa sin paralizar la operación institucional.
     - Modalidad de "Conteo Ciego" (la hoja de captura no revela las cantidades teóricas al operador para evitar sesgos).
     - Registro de doble conteo independiente ante discrepancias mayores al 5%.
  2. Flujo de aprobación y registro de diferencias:
     - Desglose de faltantes, sobrantes, artículos desubicados y lotes vencidos.
     - Justificación obligatoria para la aplicación de ajustes y autorización según permisos RBAC.
     - Generación automática de ajustes en Kardex y contabilidad valorizada únicamente tras la aprobación formal.
     - Indicadores de precisión de inventario (Exactitud de Registro de Inventario - ERI) por almacén.
- **Criterios de Aceptación:**
  - Se pueden programar conteos cíclicos aislados por almacén o categoría.
  - Las hojas de conteo ciego ocultan el saldo teórico al capturista.
  - Las discrepancias requieren justificación y aprobación directiva antes de ajustar existencias.
  - Se impide conciliar dos veces el mismo proceso de conteo físico.
  - Se generan indicadores de exactitud de inventario en reportes periódicos.
- **Estado:** [ ] Pendiente

---

### [ ] [F19-Task19] Gestión integral de bajas patrimoniales, disposición y recuperación de valor
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección E, Sección G y Plan de Trabajo F19-19
- **Prioridad:** P3
- **Severidad/Clasificación:** Baja (Disposición final de bienes, cálculo de ganancia/pérdida contable, venta, donación o chatarrización)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`registerAssetDisposal`, `getAssetDisposals`)
  - `ActivosPatrimoniales`
  - `BajasBienes`
  - `AsientosContables`
  - `js/accounting.js`
- **Dependencias Expuestas:** `ActivosPatrimoniales`, `BajasBienes`, `AsientosContables`, `F19-Task04`, `F19-Task14`
- **Descripción del Alcance:**
  El registro actual de bajas asienta el acta en `BajasBienes` y marca `Disposed`, pero carece de un flujo estructurado de dictamen técnico previo, cálculo automático del valor en libros a la fecha de baja y reconocimiento contable de la ganancia o pérdida patrimonial resultante.
  Requerimientos Funcionales Detallados:
  1. Causas de baja y dictamen técnico:
     - Causas estructuradas: Obsolescencia, Daño irreparable, Pérdida/Extravío, Robo/Siniestro, Donación institucional, Venta de desecho, Destrucción autorizada.
     - Dictamen técnico previo con firmas de evaluación y reporte fotográfico obligatorio.
  2. Modalidad de disposición y efecto económico:
     - Registrar destino: donación, venta, reciclaje, destrucción o compensación de aseguradora.
     - En venta: registrar comprador, valor de rescate/venta, factura y medio de pago.
     - Integración con depreciación acumulada para determinar el valor neto en libros a la fecha efectiva de disposición.
     - Generar el asiento contable de baja por partida doble eliminando el costo de adquisición, cancelando la depreciación acumulada y reconociendo el ingreso por venta o la pérdida extraordinaria.
     - Bloquear definitivamente el activo dispuesto para impedir que vuelva a asignarse o a depreciarse.
- **Criterios de Aceptación:**
  - Toda baja patrimonial exige dictamen técnico y aprobación de Dirección.
  - Se calcula automáticamente el valor neto contable a la fecha exacta de disposición.
  - Se generan asientos contables por partida doble reconociendo pérdidas o recuperaciones.
  - Los bienes dados de baja quedan blindados contra reasignaciones o depreciaciones futuras.
  - El expediente histórico del bien permanece permanentemente accesible en los archivos de auditoría.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ASEGURAMIENTO Y CALIDAD (P0 - SUITE INTEGRAL DE REGRESIÓN DE INVENTARIO Y PATRIMONIO)

---

### [ ] [F19-Task20] Implementar suite automatizada de pruebas y regresión integral de inventario y activos
- **Origen del Hallazgo:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md` / Sección G (P0), Sección F y Plan de Trabajo F19-20
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Aseguramiento continuo de integridad en recursos físicos, bodegas multialmacén y balances contables)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/developer-service/Code.gs`
  - `tests/regression/academic-grading-suite.js`
- **Dependencias Expuestas:** Todas las tareas de la Fase 19 (`F19-Task01` a `F19-Task19`), suites de pruebas del ecosistema institucional
- **Descripción del Alcance:**
  Implementar la suite integral automatizada `runPhase19InventoryAndAssetsRegressionSuite` que valide de manera continua el ciclo completo de inventarios multialmacén, transferencias, catálogo maestro, asignaciones y devoluciones de activos, planes preventivos, repuestos de mantenimiento, cálculo de depreciaciones, valoración económica y asientos contables por partida doble.
  Requerimientos Funcionales Detallados:
  1. Batería obligatoria de pruebas de aceptación (PT19-01 a PT19-20):
     * PT19-01: Entrada en dos almacenes -> Existencias calculadas independientemente sin mezclar saldos.
     * PT19-02: Salida superior al disponible en la bodega -> Operación bloqueada con excepción descriptiva.
     * PT19-03: Transferencia sin stock suficiente en origen -> Rechazo inmediato sin movimientos huérfanos.
     * PT19-04: Transferencia válida -> Salida en origen, entrada en destino y correlación documental idéntica.
     * PT19-05: Devolución de activo en buen estado -> Custodia cerrada y activo en estado `available`.
     * PT19-06: Devolución con daño físico -> Activo en estado `maintenance` y generación de orden técnica.
     * PT19-07: Depreciación mensual lineal -> Cálculo exacto y asiento contable balanceado por partida doble.
     * PT19-08: Intento de depreciación duplicada para el mismo período -> Bloqueo automático.
     * PT19-09: Consumo departamental de materiales -> Gasto imputado al centro de costo correspondiente.
     * PT19-10: Transferencia interna entre bodegas -> Movimiento de stock sin reconocimiento erróneo de gasto.
     * PT19-11: Despacho de lote vencido -> Bloqueo automático del consumo.
     * PT19-12: Despacho automático FEFO -> Selección prioritaria del lote con caducidad más cercana.
     * PT19-13: Consulta por código QR de activo -> Retorno exacto del expediente patrimonial y custodio.
     * PT19-14: Mantenimiento preventivo completado -> Proyección automática de la siguiente fecha del ciclo.
     * PT19-15: Repuestos utilizados en mantenimiento -> Descuento atómico y exacto en el Kardex.
     * PT19-16: Baja patrimonial de activo -> Expediente histórico preservado y asiento contable de baja asentado.
     * PT19-17: Conteo físico con discrepancia -> Conciliación y generación de ajuste trazable.
     * PT19-18: Solicitudes simultáneas concurrentes -> Control mediante `LockService` sin sobreasignación ni saldos negativos.
     * PT19-19: Matriz de permisos RBAC -> Operaciones administrativas bloqueadas para roles sin privilegios.
     * PT19-20: Reporte de inventario valorizado -> Conciliación monetaria matemática con el libro mayor.
  2. No regresión del ecosistema:
     - Garantizar que la ejecución de la suite no altere registros de producción ni las 53 pruebas de regresión previas de las Fases 9, 10, 11, 15, 16, 17 y 18.
- **Criterios de Aceptación:**
  - El 100% de las 20 pruebas transversales (PT19-01 a PT19-20) se ejecutan con resultado satisfactorio (`PASS`).
  - No existen desbalances contables (`totalDebe === totalHaber` en todos los asientos generados).
  - No se generan saldos negativos de inventario bajo ninguna circunstancia.
  - La suite de regresión previa (53/53 pruebas) se mantiene aprobada al 100%.
- **Estado:** [ ] Pendiente

---

# PENDIENTES - FASE 20: BIBLIOTECA INSTITUCIONAL Y RECURSOS EDUCATIVOS

## TAREAS CRÍTICAS (P0 - INTEGRIDAD DEL CATÁLOGO, CIRCULACIÓN, PREVENCIÓN DE ERRORES 500 Y CONCURRENCIA)

---

### [ ] [F20-Task01] Implementación de funciones backend faltantes para biblioteca
- **Origen del Hallazgo:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md` / Sección E (Defecto 1), Sección G y Plan de Trabajo P0
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Funciones cableadas en enrutador doPost y ROLE_PERMISSIONS pero no declaradas, originando errores fatales de ejecución ReferenceError)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nuevas funciones `reserveLibraryBook`, `getLibraryReservations`, `recordLibraryIncident`, `getLibraryIncidents`, `manageDigitalResource`, `getDigitalResources`)
  - `BibliotecaReservas`
  - `BibliotecaIncidencias`
  - `RecursosDigitalesBiblioteca`
- **Dependencias Expuestas:** `BibliotecaReservas`, `BibliotecaIncidencias`, `RecursosDigitalesBiblioteca`, `ROLE_PERMISSIONS`
- **Descripción del Alcance:**
  Los endpoints `reserveLibraryBook`, `getLibraryReservations`, `recordLibraryIncident`, `getLibraryIncidents`, `manageDigitalResource` y `getDigitalResources` están registrados en `ROLE_PERMISSIONS` y en el despachador `doPost` de `Code.gs`, pero no tienen ninguna implementación JavaScript en el backend. Cuando el frontend invoca cualquiera de estas acciones, el servidor arroja un error crítico de función no declarada.
  Requerimientos Funcionales Detallados:
  1. Implementación de Reservas y Listas de Espera:
     - `reserveLibraryBook`: registrar solicitudes de reserva en `BibliotecaReservas` (`ReservaID`, `EjemplarID`, `UserId`, `FechaSolicitud`, `FechaExpiracion`, `EstadoReserva`, `Observaciones`). Validar que el ejemplar se encuentre actualmente en préstamo y que el usuario no tenga ya una reserva activa para la misma obra.
     - `getLibraryReservations`: consultar y filtrar reservas por `userId`, `ejemplarId` o `estadoReserva` (`Pendiente`, `Asignada`, `Completada`, `Cancelada`, `Expirada`).
  2. Implementación de Incidencias y Daños Bibliotecarios:
     - `recordLibraryIncident`: registrar reportes de deterioro, pérdida o páginas rotas en `BibliotecaIncidencias` (`IncidenciaID`, `PrestamoID`, `EjemplarID`, `UserId`, `TipoIncidencia`, `Descripcion`, `Estado`, `Resolucion`, `Observaciones`). Si la incidencia es grave o pérdida, actualizar el estado del ejemplar a `damaged` o `lost` en `BibliotecaEjemplares`.
     - `getLibraryIncidents`: consultar y filtrar incidencias por ejemplar, usuario o estado.
  3. Implementación de Recursos Educativos Digitales:
     - `manageDigitalResource`: registrar o actualizar materiales en `RecursosDigitalesBiblioteca` (`RecursoID`, `Titulo`, `AutorColaboradores`, `Categoria`, `FormatoUrl`, `NivelPermisosJSON`, `Estado`, `Observaciones`). Validar formato y URL autorizada.
     - `getDigitalResources`: consultar recursos filtrando por categoría y nivel de permisos del usuario.
- **Criterios de Aceptación:**
  - Invocar desde el frontend o mediante API cualquiera de las 6 funciones y recibir una respuesta exitosa (`status: "success"`) con persistencia en su respectiva hoja.
  - Al reservar un libro prestado, se genera la reserva con fecha de expiración y orden de lista de espera.
  - Al reportar una incidencia de extravío, el libro deja de figurar como disponible en el catálogo.
  - La consulta de recursos digitales devuelve los materiales activos respetando los permisos del rol.
- **Estado:** [ ] Pendiente

---

### [ ] [F20-Task02] Conexión y activación del módulo de Biblioteca en la interfaz institucional
- **Origen del Hallazgo:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md` / Sección E (Defecto 2), Sección G y Plan de Trabajo P0
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Código de frontend huérfano, falta de navegación en dashboards y operatividad de la interfaz)
- **Archivos Involucrados:**
  - `dashboard-contabilidad.html`
  - `dashboard-director.html`
  - `js/accounting.js` (`switchTab`, `renderBibliotecaModule`)
- **Dependencias Expuestas:** `js/accounting.js`, `dashboard-contabilidad.html`, `F20-Task01`
- **Descripción del Alcance:**
  La función `renderBibliotecaModule` está completamente codificada en `js/accounting.js` (con 5 subpestañas: Catálogo & Ejemplares, Préstamos, Reservas, Incidencias, Recursos Digitales), pero no existe el caso `else if (tab === 'biblioteca')` en la función `switchTab` de navegación ni existe un botón en `dashboard-contabilidad.html` para acceder a ella, dejando el módulo inaccesible para los operadores escolares.
  Requerimientos Funcionales Detallados:
  1. Habilitación de la pestaña en `dashboard-contabilidad.html`:
     - Agregar el botón de acceso visual "Biblioteca" con icono representativo (`fas fa-book-reader`) en la barra de navegación de módulos de contabilidad/administración.
  2. Enrutamiento en `switchTab`:
     - Incorporar en `window.switchTab` el bloque para ejecutar `renderBibliotecaModule(container)` cuando `tab === 'biblioteca'`.
  3. Conexión de subpestañas operativas:
     - Asegurar la interacción fluida entre las subpestañas (`libros`, `prestamos`, `reservas`, `incidencias`, `digitales`) con carga reactiva de datos del backend.
- **Criterios de Aceptación:**
  - Al hacer clic en el botón "Biblioteca" del dashboard, se despliega la interfaz del módulo sin errores de consola.
  - Se puede navegar entre las 5 subpestañas y cada una carga sus datos correspondientes desde Google Sheets.
  - Los formularios de registro y modales de préstamo operan de forma interactiva y notifican al usuario.
- **Estado:** [ ] Pendiente

---

### [ ] [F20-Task03] Normalización relacional del catálogo: separación entre Obras y Ejemplares
- **Origen del Hallazgo:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md` / Sección E (Defecto 3), Sección C y Plan de Trabajo P0
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Normalización de datos bibliográficos, modelo FRBR/RDA y prevención de duplicidad de obras)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`manageLibraryBook`, `getLibraryBooks`, nuevas funciones `manageBibliographicWork`, `getBibliographicWorks`)
  - Hoja `BibliotecaCatalogoObras`
  - `BibliotecaEjemplares`
  - `js/accounting.js`
- **Dependencias Expuestas:** `BibliotecaEjemplares`, `BibliotecaPrestamos`, `F20-Task01`
- **Descripción del Alcance:**
  La hoja `BibliotecaEjemplares` almacena en una sola fila el título, autor, ISBN y categoría junto con el identificador del ejemplar físico (`EjemplarID`). Si la biblioteca adquiere 10 copias de un mismo libro, se deben duplicar 10 veces todos los metadatos bibliográficos, provocando inconsistencias ante correcciones editoriales.
  Requerimientos Funcionales Detallados:
  1. Hoja maestra `BibliotecaCatalogoObras`:
     - Almacenar los metadatos bibliográficos de la obra: `ObraID`, `IsbnCodigo`, `Titulo`, `Subtitulo`, `AutoresJSON`, `Editorial`, `EdicionAno`, `Idioma`, `Categoria`, `MateriaAcademica`, `NivelEducativo`, `PortadaUrl`, `Descripcion`, `PalabrasClave`, `EstadoObra`.
  2. Reestructuración de `BibliotecaEjemplares`:
     - Almacenar las copias físicas individuales vinculadas a la obra: `EjemplarID`, `ObraID`, `CodigoBarrasQR`, `UbicacionFisica` (Edificio/Estante/Nivel), `CondicionFisica` (`Nuevo`, `Bueno`, `Deteriorado`), `EstadoDisponibilidad` (`available`, `on_loan`, `reserved`, `maintenance`, `lost`, `disposed`), `Observaciones`.
  3. Consultas consolidadas:
     - Al consultar una obra, mostrar la ficha bibliográfica única con el desglose de cuántos ejemplares existen en total, cuántos están disponibles en estantería y cuántos están prestados o en mantenimiento.
- **Criterios de Aceptación:**
  - Se puede registrar una obra bibliográfica una sola vez y asociarle múltiples ejemplares físicos independientes.
  - Modificar los datos de la obra (ej. corregir nombre de la editorial) actualiza la ficha global sin tocar los registros de préstamos de sus ejemplares.
  - Cada ejemplar físico mantiene su propio estado de disponibilidad y ubicación física aislada.
- **Estado:** [ ] Pendiente

---

### [ ] [F20-Task04] Control de políticas de circulación, límites de préstamo y bloqueo por mora
- **Origen del Hallazgo:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md` / Sección E (Defecto 4), Sección C y Plan de Trabajo P0
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Políticas institucionales de circulación, límites por rol escolar y prevención de retención indebida de libros)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`processLibraryLoan`, `getLibraryLoans`)
  - `BibliotecaPrestamos`
  - Hoja `BibliotecaPoliticasCirculacion`
- **Dependencias Expuestas:** `BibliotecaPrestamos`, `BibliotecaEjemplares`, `ROLE_PERMISSIONS`
- **Descripción del Alcance:**
  `processLibraryLoan` aplica una fecha fija de devolución a 7 días sin importar el perfil del usuario, y no valida cuántos libros tiene prestados actualmente, permitiendo que un alumno retire cantidades excesivas de material sin devolver los anteriores.
  Requerimientos Funcionales Detallados:
  1. Políticas de circulación configurables por rol:
     - Estudiante: máximo 2 libros simultáneos, período de préstamo de 7 días calendario.
     - Docente / Profesor: máximo 5 libros simultáneos, período de préstamo de 15 días calendario.
     - Personal Administrativo / Dirección: máximo 3 libros simultáneos, período de 15 días.
     - Obras de Referencia / Consulta en Sala (Diccionarios, enciclopedias): no prestables a domicilio (préstamo interno de 1 día).
  2. Validación y bloqueo preventivo:
     - Antes de conceder un nuevo préstamo, verificar cuántos préstamos activos (`on_loan`) mantiene el `userId`.
     - Si ha alcanzado el límite configurado para su rol, rechazar el préstamo informando el tope máximo permitido.
     - Si el usuario mantiene algún préstamo con fecha de devolución vencida no devuelto (`mora activa`), bloquear la emisión de nuevos préstamos hasta que regularice su situación.
- **Criterios de Aceptación:**
  - Un estudiante con 2 libros en préstamo intenta solicitar un 3º y el sistema rechaza la operación por límite de cupo alcanzado.
  - Un usuario con un libro vencido no puede recibir nuevos préstamos hasta devolver el material atrasado.
  - Un docente puede recibir hasta 5 libros con fecha de retorno configurada a 15 días.
- **Estado:** [ ] Pendiente

---

### [ ] [F20-Task05] Control de concurrencia e idempotencia en circulación bibliotecaria
- **Origen del Hallazgo:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md` / Sección E, Sección F (PT-20-24, PT-20-25) y Plan de Trabajo P0
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Integridad transaccional, prevención de doble asignación de ejemplares y protección de reintentos)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`processLibraryLoan`, `reserveLibraryBook`)
  - `BibliotecaPrestamos`
  - `BibliotecaEjemplares`
- **Dependencias Expuestas:** `LockService`, `BibliotecaPrestamos`, `BibliotecaEjemplares`
- **Descripción del Alcance:**
  Las operaciones de préstamo y reserva no utilizan candados de concurrencia. Si dos bibliotecarios intentan prestar el mismo ejemplar simultáneamente, o si un usuario reintenta la solicitud por lentitud de red, se pueden generar préstamos dobles sobre el mismo libro físico.
  Requerimientos Funcionales Detallados:
  1. Bloqueo transaccional atómico:
     - Adquirir candado de script (`LockService.getScriptLock()`) al inicio de `processLibraryLoan` y `reserveLibraryBook`.
     - Re-leer el estado más reciente del ejemplar en `BibliotecaEjemplares` para asegurar que continúa en estado `available`.
     - Si ya fue prestado por otra transacción milisegundos antes, liberar el candado y responder con error controlado.
  2. Claves de idempotencia:
     - Evitar que una doble pulsación de botón registre dos préstamos idénticos mediante clave única de operación (`ejemplarId + userId + fechaActual`).
- **Criterios de Aceptación:**
  - Dos solicitudes simultáneas sobre el mismo ejemplar resultan en un préstamo exitoso y un rechazo controlado.
  - Los reintentos de red no duplican las filas de préstamo en `BibliotecaPrestamos`.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ALTA PRIORIDAD (P1 - EVALUACIÓN EN DEVOLUCIÓN, RENOVACIONES, OPAC ESCOLAR, ALERTAS Y VÍNCULO CURRICULAR)

---

### [ ] [F20-Task06] Flujo de devolución con inspección física y derivación a incidencias
- **Origen del Hallazgo:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md` / Sección E, Sección F (PT-20-21) y Plan de Trabajo P1
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Preservación del fondo bibliográfico, control de deterioro y reporte inmediato de averías)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`processLibraryLoan`, `recordLibraryIncident`)
  - `BibliotecaPrestamos`
  - `BibliotecaEjemplares`
  - `BibliotecaIncidencias`
  - `js/accounting.js`
- **Dependencias Expuestas:** `BibliotecaPrestamos`, `BibliotecaEjemplares`, `F20-Task01`
- **Descripción del Alcance:**
  Al procesar una devolución con `accion: "Devolucion"`, el sistema cambia incondicionalmente el libro a `available` sin permitir evaluar el estado físico en que se entrega. Si el libro fue devuelto roto, rayado o sin páginas, vuelve a estar disponible para préstamo erróneamente.
  Requerimientos Funcionales Detallados:
  1. Inspección física obligatoria al devolver:
     - Permitir registrar en la devolución la condición física del material: `Excelente`, `Bueno`, `DeterioradoNormal`, `DañadoGrave`, `Incompleto/FaltanPaginas`.
     - Si la condición es `Excelente` o `Bueno`, cerrar el préstamo y marcar el ejemplar como `available`.
     - Si la condición es `DañadoGrave` o `Incompleto`, cambiar el estado del ejemplar a `maintenance` (en reparación) o `damaged` (dañado fuera de servicio).
     - Generar automáticamente la incidencia en `BibliotecaIncidencias` vinculada al préstamo y al usuario que entregó el material dañado.
  2. Cálculo de días de mora:
     - Calcular automáticamente si hubo retraso respecto a la `FechaDevolucionPrevista` y registrar los días de mora acumulados.
- **Criterios de Aceptación:**
  - Devolver un libro en buen estado lo restituye a disponibilidad para préstamo.
  - Devolver un libro dañado lo coloca en estado de reparación y registra la incidencia asociada al estudiante responsable.
  - Se calculan de forma exacta los días de retraso si el libro fue entregado después de la fecha límite.
- **Estado:** [ ] Pendiente

---

### [ ] [F20-Task07] Renovaciones de préstamo con bloqueo automático por reservas en lista de espera
- **Origen del Hallazgo:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md` / Sección E, Sección C y Plan de Trabajo P1
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Equidad en el acceso a recursos bibliográficos, control de lista de espera y límites de renovación)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nueva función `renewLibraryLoan`, `processLibraryLoan`)
  - `BibliotecaPrestamos`
  - `BibliotecaReservas`
- **Dependencias Expuestas:** `BibliotecaPrestamos`, `BibliotecaReservas`, `F20-Task01`
- **Descripción del Alcance:**
  No existe la capacidad de renovar préstamos. Los usuarios deben devolver el libro físicamente y solicitarlo de nuevo, y no se comprueba si otros estudiantes están esperando la obra mediante una reserva activa.
  Requerimientos Funcionales Detallados:
  1. Función `renewLibraryLoan`:
     - Permitir solicitar la renovación de un préstamo activo antes de su vencimiento.
     - Validar que el usuario no haya excedido el número máximo de renovaciones permitidas por obra (predeterminado: máximo 1 renovación).
  2. Bloqueo por reservas pendientes:
     - Antes de conceder la renovación, verificar si existen solicitudes activas en `BibliotecaReservas` para la misma obra.
     - Si existen reservas en lista de espera de otros usuarios, bloquear la renovación obligando a entregar el libro en su fecha para atender a los estudiantes en espera.
- **Criterios de Aceptación:**
  - Un usuario puede renovar su préstamo extendiendo la fecha de vencimiento según las reglas de su rol.
  - Si la obra cuenta con una reserva pendiente de otro estudiante, el sistema rechaza la renovación informando de la lista de espera.
  - Se impide renovar un préstamo más de las veces autorizadas por la política de circulación.
- **Estado:** [ ] Pendiente

---

### [ ] [F20-Task08] Portal OPAC de consulta y autoservicio para estudiantes y docentes
- **Origen del Hallazgo:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md` / Sección E, Sección C (2.10) y Plan de Trabajo P1
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Experiencia de usuario estudiantil, fomento de la lectura escolar y autoservicio digital)
- **Archivos Involucrados:**
  - `dashboard-estudiante.html`
  - `dashboard-profesor.html`
  - `js/student.js`
  - `js/teacher.js`
  - `backend/accounting-service/Code.gs` (`getLibraryBooks`, `getLibraryLoans`, `reserveLibraryBook`)
- **Dependencias Expuestas:** `getLibraryBooks`, `getLibraryLoans`, `reserveLibraryBook`, `F20-Task01`
- **Descripción del Alcance:**
  Los estudiantes y profesores no disponen de una vista amigable donde buscar libros en el catálogo escolar, verificar en qué estantería se encuentran físicamente, consultar la fecha límite de sus préstamos activos o solicitar la reserva de un libro prestado.
  Requerimientos Funcionales Detallados:
  1. Buscador bibliográfico escolar (OPAC):
     - Buscador intuitivo con filtros por título, autor, materia y disponibilidad.
     - Tarjetas de libros con portada, descripción, número de ejemplares disponibles y ubicación en la biblioteca.
  2. Panel personal de préstamos del usuario:
     - Listado de libros que el estudiante tiene actualmente en su poder con la fecha de devolución prevista y semáforo de vencimiento (verde: a tiempo, amarillo: vence hoy, rojo: atrasado).
     - Botón de solicitar renovación si las reglas lo permiten.
     - Botón de reservar si el libro no tiene ejemplares disponibles en estantería.
- **Criterios de Aceptación:**
  - Los alumnos y docentes pueden buscar y localizar obras en el catálogo desde su portal personal.
  - Cada usuario visualiza únicamente sus propios préstamos y fechas de entrega.
  - La interfaz se adapta limpiamente a dispositivos móviles y computadoras.
- **Estado:** [ ] Pendiente

---

### [ ] [F20-Task09] Notificaciones multicanal de vencimientos y disponibilidad de reservas
- **Origen del Hallazgo:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md` / Sección E, Sección C (2.6, 2.10) y Plan de Trabajo P1
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Reducción de morosidad en biblioteca, aviso oportuno de reservas disponibles y comunicación familiar)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nueva función `checkAndDispatchLibraryAlerts`)
  - `backend/user-service/Code.gs` (`sendMultiChannelNotification`)
  - `BibliotecaPrestamos`
  - `BibliotecaReservas`
- **Dependencias Expuestas:** `sendMultiChannelNotification`, `BibliotecaPrestamos`, `BibliotecaReservas`
- **Descripción del Alcance:**
  No se emiten recordatorios previos al vencimiento de un préstamo bibliotecario ni se notifica automáticamente a un estudiante cuando el libro que reservó ha sido devuelto y está listo para ser retirado en el mostrador.
  Requerimientos Funcionales Detallados:
  1. Recordatorios preventivos de devolución:
     - Evaluación diaria de préstamos próximos a vencer: despachar aviso institucional 24 horas antes de la fecha límite de entrega.
     - Aviso de mora al día siguiente del vencimiento con instrucciones para la devolución inmediata.
  2. Notificación de reserva disponible:
     - Al procesar la devolución de un ejemplar que posee reservas pendientes en `BibliotecaReservas`, asignar el ejemplar a la primera reserva en cola y enviar notificación inmediata al estudiante beneficiario indicando el plazo límite para retirarlo (ej. 48 horas).
     - Si expira el plazo sin que el alumno retire el libro, liberar la reserva y notificar al siguiente en la lista de espera.
- **Criterios de Aceptación:**
  - El sistema envía notificación previa antes de que venza el plazo de entrega del libro.
  - Al devolver un libro reservado, el solicitante en lista de espera recibe el aviso de disponibilidad.
  - Las alertas utilizan claves de deduplicación diaria para evitar mensajes repetitivos.
- **Estado:** [ ] Pendiente

---

### [ ] [F20-Task10] Asociación curricular de obras bibliográficas con asignaturas y niveles
- **Origen del Hallazgo:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md` / Sección E, Sección C (2.8) y Plan de Trabajo P1
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Apoyo pedagógico, bibliografía recomendada por materia y pertinencia académica)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nuevas funciones `linkBookToSubject`, `getBooksBySubject`)
  - Hoja `BibliotecaAsociacionesCurriculares`
  - `BibliotecaCatalogoObras`
  - `js/teacher.js`
- **Dependencias Expuestas:** `BibliotecaCatalogoObras`, Malla curricular académica
- **Descripción del Alcance:**
  Los libros del catálogo no están asociados con las asignaturas ni con los planes de estudio de la institución. Los docentes no pueden publicar listas de lecturas obligatorias o sugeridas para su clase directamente desde la biblioteca.
  Requerimientos Funcionales Detallados:
  1. Vínculo curricular de obras:
     - Asociar obras del catálogo a combinaciones de: Grado/Nivel educativo, Asignatura y Parcial/Período.
     - Clasificación pedagógica: `LecturaObligatoria`, `LecturaSugerida`, `MaterialConsultaTecnica`.
  2. Consulta de bibliografía de curso:
     - Permitir a los estudiantes de una clase consultar en un solo clic la bibliografía recomendada para sus materias activas y verificar en tiempo real si hay copias disponibles en la biblioteca física o enlaces en la biblioteca digital.
- **Criterios de Aceptación:**
  - Un docente puede vincular títulos del catálogo como lecturas recomendadas para su clase.
  - Los alumnos inscritos en la materia visualizan la lista bibliográfica con la disponibilidad de ejemplares.
- **Estado:** [ ] Pendiente

---

## TAREAS DE PRIORIDAD MEDIA (P2 - INTEGRACIÓN PATRIMONIAL, CÓDIGOS QR Y ADQUISICIONES)

---

### [ ] [F20-Task11] Integración de colecciones bibliográficas con el inventario patrimonial
- **Origen del Hallazgo:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md` / Sección E, Sección C (2.13) y Plan de Trabajo P2
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Control de activos institucionales, capitalización de colecciones valiosas y trazabilidad de bajas)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `BibliotecaEjemplares`
  - `ActivosPatrimoniales`
  - `BajasBienes`
- **Dependencias Expuestas:** `ActivosPatrimoniales`, `BibliotecaEjemplares`, `F19-Task08`
- **Descripción del Alcance:**
  Existe duplicidad conceptual entre los bienes de biblioteca y el inventario general. Las enciclopedias costosas, colecciones históricas o dispositivos de lectura digital (kindles/tablets) deben integrarse con el inventario patrimonial sin crear dos sistemas independientes de control.
  Requerimientos Funcionales Detallados:
  1. Vinculación opcional con código patrimonial:
     - Permitir que un ejemplar de biblioteca almacene un campo `ActivoPatrimonialID` cuando corresponda a un bien capitalizable institucional.
     - Las bajas por pérdida o daño irreparable en biblioteca deben actualizar de forma coordinada el estado en `ActivosPatrimoniales` y registrar el acta en `BajasBienes`.
- **Criterios de Aceptación:**
  - Un ejemplar marcado como activo patrimonial conserva su vínculo con la ficha de activos.
  - La baja formal en biblioteca actualiza el registro patrimonial sin generar inconsistencias contables.
- **Estado:** [ ] Pendiente

---

### [ ] [F20-Task12] Identificación y escaneo de ejemplares mediante códigos QR y códigos de barras
- **Origen del Hallazgo:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md` / Sección E, Sección C (2.2) y Plan de Trabajo P2
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Agilidad en mostrador de préstamo, reducción de errores de digitación y etiquetado físico)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `BibliotecaEjemplares`
  - `dashboard-contabilidad.html`
  - `js/accounting.js`
- **Dependencias Expuestas:** `BibliotecaEjemplares`, `F20-Task01`
- **Descripción del Alcance:**
  Los préstamos y devoluciones requieren teclear manualmente los identificadores de los libros (`LIB-...`), lo que retrasa la atención en horas punta de recreo y propicia errores de captura.
  Requerimientos Funcionales Detallados:
  1. Generación e impresión de etiquetas con código de barras/QR:
     - Generar dinámicamente etiquetas para lomo o portada con el código del ejemplar, título resumido, signatura de estantería y código QR/barra legible.
     - Permitir utilizar lectores ópticos USB o cámaras móviles en el mostrador para escanear el libro y el carné del estudiante, completando el préstamo en menos de 5 segundos.
- **Criterios de Aceptación:**
  - Se pueden imprimir etiquetas adhesivas individuales o por pliego para los ejemplares físicos.
  - El escaneo del código QR en el formulario de préstamo rellena automáticamente el ejemplar y abre la ficha del libro.
- **Estado:** [ ] Pendiente

---

### [ ] [F20-Task13] Solicitudes de adquisición bibliográfica y sugerencias de compra escolar
- **Origen del Hallazgo:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md` / Sección E, Sección C (2.12) y Plan de Trabajo P2
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Desarrollo de colecciones, detección de necesidades pedagógicas e integración con compras)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nuevas funciones `submitBookPurchaseSuggestion`, `getPurchaseSuggestions`)
  - Hoja `BibliotecaSugerenciasCompra`
  - `SolicitudesCompra`
- **Dependencias Expuestas:** `SolicitudesCompra`, `F18-Task03`
- **Descripción del Alcance:**
  No existe un canal para que docentes o bibliotecarios registren sugerencias formales de adquisición de libros agotados o títulos necesarios para nuevos cursos, ni su integración con las solicitudes de compra institucionales.
  Requerimientos Funcionales Detallados:
  1. Buzón digital de sugerencias bibliográficas:
     - Formulario para registrar: título, autor, editorial, ISBN referencial, cantidad solicitada, justificación pedagógica y docente solicitante.
     - Verificar si el libro ya existe en el catálogo y su demanda histórica antes de autorizar.
     - Al ser aprobada por Dirección, permitir convertir la sugerencia en una solicitud interna de compra (`createPurchaseRequest`) de la Fase 18.
- **Criterios de Aceptación:**
  - Los profesores pueden enviar sugerencias de libros justificando la necesidad para su clase.
  - Dirección puede aprobar o rechazar la solicitud, y las aprobadas se enlazan con el módulo de compras.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ASEGURAMIENTO Y CALIDAD (P0 - SUITE INTEGRAL DE REGRESIÓN DE BIBLIOTECA)

---

### [ ] [F20-Task14] Implementar suite automatizada de pruebas y regresión integral de biblioteca
- **Origen del Hallazgo:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md` / Sección G (P0), Sección F y Plan de Trabajo F20-14
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Aseguramiento continuo de integridad en catálogo bibliográfico, préstamos, reservas y no regresión)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/developer-service/Code.gs`
  - `tests/regression/academic-grading-suite.js`
- **Dependencias Expuestas:** Todas las tareas de la Fase 20 (`F20-Task01` a `F20-Task13`), suites de pruebas del ecosistema institucional
- **Descripción del Alcance:**
  Implementar la suite integral automatizada `runPhase20LibraryAndResourcesRegressionSuite` que valide de manera continua el catálogo de obras y ejemplares, circulación de préstamos, devoluciones con inspección física, reservas con lista de espera, control de morosidad, recursos digitales y no regresión de las fases previas.
  Requerimientos Funcionales Detallados:
  1. Batería obligatoria de pruebas de aceptación:
     - Catálogo: registro de obras, gestión de ejemplares individuales con IDs únicos, búsqueda y filtrado.
     - Circulación: emisión de préstamo, rechazo de préstamo sobre libro ya prestado, validación de límite máximo de libros por rol de usuario.
     - Devoluciones: cierre de préstamo, restitución a disponible en buen estado, derivación a mantenimiento ante daño físico.
     - Reservas: creación de reserva sobre libro prestado, bloqueo de renovación ante reserva activa en lista de espera.
     - Incidencias y digitales: registro de pérdida de ejemplar, consulta de recursos digitales con control de permisos RBAC.
     - Concurrencia: verificación de bloqueo mediante `LockService` ante solicitudes simultáneas de préstamo.
  2. No regresión del ecosistema:
     - Garantizar que la suite opere en entorno controlado sin alterar registros de producción ni las 53 pruebas de regresión previas de las Fases 9, 10, 11, 15, 16, 17, 18, 19 y 21.
- **Criterios de Aceptación:**
  - La suite de regresión ejecuta todas las pruebas de biblioteca y recursos educativos con el 100% de éxito (`PASS`).
  - Se valida el correcto funcionamiento de las 6 funciones previamente ausentes en backend.
  - Las suites de regresión previas (53/53 pruebas) se mantienen aprobadas al 100%.
- **Estado:** [ ] Pendiente

---

# PENDIENTES - FASE 21: TRANSPORTE ESCOLAR, MOVILIDAD ESTUDIANTIL Y SERVICIOS COMPLEMENTARIOS

## BLOQUE 1: SEGURIDAD INFANTIL, INTEGRIDAD INMEDIATA, CONTROL DE CUPOS Y AISLAMIENTO RBAC (P0)

---

### [ ] [F21-Task01] Control estricto de cupos, capacidad vehicular y asignaciones de transporte
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-02), Sección G (Defecto 1) y Plan de Implementación TAREA 01
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Seguridad física de estudiantes, cumplimiento de límites legales de capacidad vehicular y prevención de sobrecupos)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`assignStudentTransport`, `getTransportRoutes`, `getTransportAssignments`)
  - `TransporteRutas`
  - `TransporteAsignaciones`
  - `TransporteVehiculos`
  - `js/accounting.js`
- **Dependencias Expuestas:** `TransporteRutas`, `TransporteAsignaciones`, `TransporteVehiculos`, `LockService`
- **Descripción del Alcance:**
  La función actual `assignStudentTransport` inserta registros mediante `appendRow` sin comprobar la cantidad de estudiantes que ya ocupan una ruta, permitiendo superar la capacidad configurada. Tampoco comprueba si un estudiante ya tiene otra asignación incompatible en el mismo horario.
  Requerimientos Funcionales Detallados:
  1. Capacidad vehicular independiente y tope de ruta:
     - Establecer la capacidad máxima autorizada de cada vehículo (`capacidadPasajeros` en `TransporteVehiculos`) como dato maestro independiente de la ruta.
     - La capacidad operativa de una ruta nunca podrá superar la capacidad autorizada del vehículo asignado a ella.
     - Si se cambia el vehículo asignado a una ruta, actualizar de inmediato la capacidad efectiva disponible.
  2. Cálculo estricto de ocupación y estados de cupo:
     - Contabilizar únicamente las asignaciones activas y vigentes para determinar la ocupación.
     - Mantener y diferenciar en tiempo real: Cupos totales autorizados, Cupos ocupados, Cupos disponibles, Cupos reservados y Estudiantes en lista de espera.
     - Adquirir candado de script (`LockService.getScriptLock()`) para evitar que dos solicitudes simultáneas consuman el último cupo disponible.
  3. Validaciones de asignación y prevención de colisiones:
     - Impedir de forma terminante que se asignen estudiantes por encima de la capacidad disponible.
     - Detectar asignaciones duplicadas para el mismo estudiante, ruta, jornada y período.
     - Detectar conflictos cuando un estudiante tenga dos rutas asignadas que coincidan en horario.
     - Permitir que un estudiante tenga rutas diferentes para ida y regreso, y asignaciones para días específicos de la semana.
     - Liberar el cupo automáticamente cuando una asignación se cancela, vence o queda inactiva.
     - Mantener el historial inalterable de asignaciones y cancelaciones.
- **Criterios de Aceptación:**
  - Una ruta con capacidad para 2 estudiantes acepta 2 asignaciones activas y rechaza la tercera por cupo agotado.
  - La capacidad se calcula considerando el vehículo realmente asignado a la ruta.
  - Una asignación cancelada o vencida libera el cupo inmediatamente.
  - Se detectan y bloquean asignaciones duplicadas o colisiones de horario en el mismo estudiante.
  - Las solicitudes simultáneas concurrentes no producen sobrecupos.
  - Los reportes de ocupación coinciden con las asignaciones reales.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task02] Protección de datos de transporte y aislamiento de consultas por usuario (RBAC/ABAC)
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-49), Sección G (Defecto 2) y Plan de Implementación TAREA 02
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Privacidad y protección de datos de menores, FERPA y prevención de fuga de geolocalización y paradas a terceros)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`getTransportAssignments`, `getTransportRoutes`, `getTransportTripLiveLocation`)
  - `TransporteAsignaciones`
  - `ExpedientesFamiliares`
  - `ROLE_PERMISSIONS`
- **Dependencias Expuestas:** `ROLE_PERMISSIONS`, `validateRolePermission`, `ExpedientesFamiliares`
- **Descripción del Alcance:**
  `getTransportAssignments` devuelve todas las asignaciones institucionales cuando se invoca sin el parámetro `estudianteUserId`, permitiendo a usuarios con rol `Padre` o `Estudiante` consultar rutas, horarios y paradas de otros menores ajenos a su núcleo familiar.
  Requerimientos Funcionales Detallados:
  1. Aislamiento estricto por rol e identidad verificada:
     - Los padres y tutores únicamente podrán consultar estudiantes vinculados a sus relaciones familiares autorizadas en `ExpedientesFamiliares`.
     - Los estudiantes únicamente podrán consultar su propia información personal de transporte.
     - Los conductores y acompañantes únicamente podrán consultar las rutas, paradas y pasajeros que tengan asignados para sus recorridos vigentes.
     - Los administradores y directores podrán consultar información global según sus privilegios.
  2. Blindaje de consultas sin parámetros:
     - La ausencia de filtros o parámetros no debe provocar una consulta general; debe devolver exclusivamente el ámbito autorizado del usuario autenticado.
     - Las solicitudes que intenten consultar estudiantes ajenos deben rechazarse con registro de auditoría (`UNAUTHORIZED_ACCESS_ATTEMPT`).
     - Las coordenadas GPS, direcciones residenciales y horarios de menores deben tratarse como información restringida; los enlaces de seguimiento no deben permitir acceso público a la ubicación de vehículos sin token de sesión válido.
     - Revocar los accesos de forma inmediata cuando cambie la relación familiar, el rol o la asignación del personal.
- **Criterios de Aceptación:**
  - Un padre no puede consultar estudiantes de otra familia, incluso manipulando el ID en la solicitud.
  - Un estudiante no puede consultar las asignaciones de otro estudiante.
  - Un conductor no puede consultar rutas ajenas a su asignación activa.
  - Una consulta sin filtros nunca devuelve todos los estudiantes de la institución a un rol no directivo.
  - Las coordenadas GPS no son accesibles mediante enlaces públicos sin autenticación.
  - Se auditan los intentos de acceso no autorizado.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task03] Control de abordaje, descenso y asistencia de pasajeros mediante QR y registro asistido
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-20), Sección G (Defecto 3) y Plan de Implementación TAREA 03
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Seguridad de menores a bordo, prevención de extravíos y trazabilidad de viaje)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nuevas funciones `recordStudentBoarding`, `recordStudentAlighting`, `getTripPassengerManifest`)
  - Hoja `TransporteAsistenciaViajes`
  - Hoja `TransporteViajes`
- **Dependencias Expuestas:** `TransporteAsignaciones`, `TransporteRutas`, `sendMultiChannelNotification`
- **Descripción del Alcance:**
  No existe un mecanismo para registrar cuándo un estudiante sube o baja del vehículo escolar, ni se conoce quién permanece a bordo durante el trayecto.
  Requerimientos Funcionales Detallados:
  1. Registro individual de eventos de abordaje y descenso:
     - Vincular cada evento con: Estudiante, Recorrido (`viajeId`), Ruta, Vehículo, Parada, Fecha/Hora, Usuario registrador y Conductor/Acompañante responsable.
     - Identificar al estudiante mediante credencial QR individual institucional.
     - Permitir registro manual asistido en pantalla táctil cuando el escaneo óptico no esté disponible, registrando quién ejecutó la acción.
  2. Validaciones operativas y prevención de duplicados:
     - Validar que el estudiante pertenezca al recorrido y jornada correspondientes; si un alumno intenta abordar una ruta incorrecta, alertar de inmediato.
     - Evitar registros duplicados de abordaje o descenso (descartar doble escaneo accidental).
     - Identificar estudiantes asignados que debían abordar en la parada y no lo hicieron (ausencias en parada).
     - Identificar en tiempo real qué estudiantes fueron registrados como abordados pero aún no registran descenso.
     - Mantener el historial inmutable de eventos con soporte para almacenamiento local offline y sincronización posterior.
- **Criterios de Aceptación:**
  - Un estudiante asignado registra su abordaje mediante QR o marcado manual con hora exacta.
  - Un estudiante ajeno a la ruta es advertido y rechazado salvo autorización excepcional registrada.
  - Un escaneo repetido no duplica el evento ni altera las métricas de pasajeros a bordo.
  - El descenso queda vinculado exactamente al mismo viaje de abordaje.
  - El personal de ruta puede consultar en todo momento la lista de pasajeros esperados y el estado individual de cada uno.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task04] Gestión de personas autorizadas para recoger y recibir estudiantes en paradas
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-15, PT-21-16), Sección C (1.8) y Plan de Implementación TAREA 04
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Custodia legal, seguridad en entrega de infantes y prevención de entregas a personas no autorizadas)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nuevas funciones `getAuthorizedPickupPersons`, `recordStudentSafeDelivery`)
  - Hoja `TransportePersonasAutorizadas`
  - `ExpedientesFamiliares`
- **Dependencias Expuestas:** `ExpedientesFamiliares`, `TransporteAsignaciones`, `F21-Task03`
- **Descripción del Alcance:**
  No existe una relación funcional entre las asignaciones de transporte y las personas autorizadas en los expedientes familiares para recibir a los menores en las paradas residenciales.
  Requerimientos Funcionales Detallados:
  1. Catálogo de personas autorizadas por estudiante:
     - Consultar personas autorizadas registradas en el expediente familiar con nombre completo, documento de identidad (DPI/DNI), parentesco, teléfono y fotografía.
     - Permitir autorizaciones permanentes y temporales con fechas de inicio y finalización.
     - Permitir revocación inmediata de autorizaciones y registrar restricciones especiales de entrega (ej. medidas de protección legal).
  2. Protocolo de entrega y validación en parada:
     - Al registrar el descenso de un menor que requiere entrega a un adulto, la app del acompañante debe mostrar exclusivamente los adultos autorizados vigentes.
     - Registrar obligatoriamente el responsable que realiza la entrega, el adulto que recibe, fecha, hora y ubicación física.
     - Impedir la entrega ordinaria a personas que no figuren como autorizadas; ante emergencias familiares, exigir autorización formal de Dirección con registro documentado.
- **Criterios de Aceptación:**
  - Solo se muestran los adultos autorizados vigentes para el estudiante en su parada de destino.
  - Una autorización vencida o revocada bloquea la entrega ordinaria.
  - Se registra con precisión quién entregó y quién recibió al menor.
  - Las excepciones requieren autorización documentada de un perfil facultado.
  - Los documentos de identidad no son visibles para usuarios sin privilegios.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task05] Administración de flota vehicular, conductores, acompañantes y documentación habilitante
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-01, PT-21-03, PT-21-04), Sección C (1.1, 1.2) y Plan de Implementación TAREA 05
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Habilitación legal de transporte escolar, pólizas de seguros vigentes y licencias de conducir pesada)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nuevas funciones `manageTransportVehicle`, `getTransportVehicles`, `manageTransportDriver`, `getTransportDrivers`)
  - Hoja `TransporteVehiculos`
  - Hoja `TransporteConductores`
  - `TransporteRutas`
- **Dependencias Expuestas:** `TransporteRutas`, `MantenimientoOrdenes`, `ROLE_PERMISSIONS`
- **Descripción del Alcance:**
  Las rutas utilizan campos de texto libre para `UnidadCodigo` y `ConductorEmpleadoId` sin una entidad independiente que administre placas, capacidad oficial de asientos, vigencia de seguros de accidentes, revisión mecánico-técnica ni licencias de conducir.
  Requerimientos Funcionales Detallados:
  1. Gestión de vehículos:
     - Registrar: código interno único, placa/matrícula, marca, modelo, año, capacidad oficial autorizada, tipo de vehículo (autobús, microbús, camioneta), características de accesibilidad, propietario/proveedor, estado operativo (`Disponible`, `Asignado`, `EnMantenimiento`, `FueraServicio`, `Retirado`), pólizas de seguro, revisión mecánica, fechas de vencimiento y kilometraje.
     - Impedir la asignación operativa de vehículos con seguro o revisión vencida.
  2. Gestión de conductores y acompañantes:
     - Conductores: vincular con expediente de personal, registrar licencia, categoría (pesada/comercial), vigencia, capacitaciones, estado de habilitación, y clasificar conductores titulares y sustitutos. Impedir asignaciones con licencia vencida.
     - Acompañantes (monitoras): registrar personal acompañante, capacitaciones y permitir asignar uno o varios acompañantes por ruta con trazabilidad de sustituciones.
- **Criterios de Aceptación:**
  - Se puede crear, editar y consultar vehículos y personal en maestros independientes.
  - La placa y el código interno no generan duplicados indebidos.
  - La capacidad se obtiene directamente del registro vehicular autorizado.
  - Un vehículo fuera de servicio o con póliza vencida no puede asignarse a una ruta activa.
  - Un conductor con licencia vencida queda bloqueado para operar recorridos.
  - Las sustituciones quedan registradas sin borrar la asignación titular histórica.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task06] Cierre obligatorio de recorrido, control de pasajeros y confirmación de unidad vacía
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-24), Sección C (1.9) y Plan de Implementación TAREA 06
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Seguridad infantil absoluta, prevención de niños olvidados a bordo y protocolo de fin de viaje)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nueva función `finalizeTransportTrip`)
  - Hoja `TransporteViajes`
  - Hoja `TransporteAsistenciaViajes`
- **Dependencias Expuestas:** `F21-Task03`, `TransporteRutas`, `sendMultiChannelNotification`
- **Descripción del Alcance:**
  No existe un procedimiento de cierre que compruebe que todos los estudiantes han descendido del vehículo escolar, dejando desprotegida una situación de alto riesgo infantil.
  Requerimientos Funcionales Detallados:
  1. Protocolo de fin de recorrido:
     - Incorporar estados de recorrido: `Programado`, `Iniciado`, `EnCurso`, `PendienteDeCierre`, `CerradoNormal`, `CerradoConIncidencia`.
     - Comparar la lista de pasajeros abordados contra los eventos de descenso registrados.
     - Si existen estudiantes que continúan registrados a bordo sin descenso, bloquear el cierre ordinario del viaje y disparar una alarma prioritaria en pantalla.
  2. Confirmación de inspección física (Barrido de asientos):
     - Exigir una inspección física del interior de la unidad al conductor y acompañante.
     - Registrar la confirmación explícita y obligatoria: "Inspección física realizada: 0 estudiantes a bordo".
     - Permitir cierre excepcional únicamente mediante justificación documentada con autorización directiva.
     - Registrar hora exacta, usuarios responsables y resultado de la inspección.
- **Criterios de Aceptación:**
  - El sistema detecta automáticamente pasajeros sin descenso registrado.
  - El cierre normal se bloquea taxativamente si quedan pasajeros pendientes a bordo.
  - La inspección física final queda registrada con responsable y fecha.
  - Se generan alertas inmediatas cuando se detecta un pasajero sin descenso confirmado.
  - El historial permite reconstruir con exactitud el cierre de cada recorrido escolar.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task07] Integración con mantenimiento y bloqueo de vehículos no disponibles
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-36), Sección C (1.13) y Plan de Implementación TAREA 07
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Seguridad vial, prevención de fallas mecánicas en ruta y coherencia con activos fijos)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `TransporteVehiculos`
  - `ActivosPatrimoniales`
  - `MantenimientoOrdenes`
- **Dependencias Expuestas:** `TransporteVehiculos`, `ActivosPatrimoniales`, `MantenimientoOrdenes`, `F19-Task06`
- **Descripción del Alcance:**
  Las órdenes de mantenimiento de la Fase 19 no están relacionadas funcionalmente con los vehículos de transporte. Una unidad en taller mecánico podría continuar asignada a una ruta escolar activa.
  Requerimientos Funcionales Detallados:
  1. Vinculación con activos patrimoniales y órdenes de trabajo:
     - Relacionar cada vehículo con su registro de activo institucional en `ActivosPatrimoniales`.
     - Vincular las órdenes de mantenimiento en `MantenimientoOrdenes` con el vehículo correspondiente (`VehiculoID`).
  2. Bloqueo operativo automático:
     - Consultar el estado de mantenimiento antes de asignar o iniciar una ruta.
     - Si el vehículo tiene una orden que implique inmovilización, bloquear su asignación y marcarlo como `FueraServicio / EnMantenimiento`.
     - Si ya tiene recorridos programados, advertir el conflicto y facilitar la asignación de un vehículo sustituto.
     - La reincorporación al servicio activo exige que la orden de mantenimiento haya sido formalmente cerrada y verificada.
- **Criterios de Aceptación:**
  - Un vehículo con orden de mantenimiento abierta no puede asignarse a rutas activas.
  - La disponibilidad cambia automáticamente al abrir y cerrar órdenes de trabajo.
  - Se conserva el historial de reparaciones y costos por unidad vehicular.
  - La sustitución vehicular queda asociada al recorrido afectado sin duplicar activos patrimoniales.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task08] Auditoría de integridad de datos y transición de las estructuras actuales de transporte
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E, Sección G y Plan de Implementación TAREA 34
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Migración segura de datos, preservación de rutas existentes y prevención de relaciones huérfanas)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `TransporteRutas`
  - `TransporteAsignaciones`
  - `TransporteVehiculos`
  - `TransporteConductores`
- **Dependencias Expuestas:** `TransporteRutas`, `TransporteAsignaciones`, `F21-Task01`, `F21-Task05`
- **Descripción del Alcance:**
  Las estructuras existentes almacenan rutas y asignaciones con información limitada (paradas en JSON, choferes como texto libre). La ampliación del sistema requiere migrar esos datos sin perder registros ni producir relaciones ficticias.
  Requerimientos Funcionales Detallados:
  1. Diagnóstico y migración controlada:
     - Identificar todos los registros existentes en `TransporteRutas` y `TransporteAsignaciones`.
     - Identificar rutas que utilizan códigos de unidad sin vehículo asociado y choferes almacenados como texto.
     - Extraer las paradas embebidas en JSON y migrarlas a la nueva estructura relacional de paradas.
     - Conservar identificadores existentes (`RutaID`, `AsignacionTranspID`) garantizando compatibilidad retrospectiva.
     - Los registros ambiguos deben quedar identificados en un reporte de inconsistencias para revisión manual, sin inventar entidades ficticias.
     - Validar que no se pierda ninguna asignación activa de estudiantes tras la migración.
- **Criterios de Aceptación:**
  - Se identifican y migran todos los registros existentes sin pérdida de información.
  - Las consultas antiguas continúan funcionando mientras se activa la nueva estructura.
  - No se generan duplicados de rutas ni asignaciones huérfanas.
  - Se genera un reporte claro de registros que requieran conciliación manual.
- **Estado:** [ ] Pendiente

---

## BLOQUE 2: OPERACIÓN DIARIA, PORTALES, SEGUIMIENTO GPS Y GESTIÓN DE INCIDENCIAS (P1)

---

### [ ] [F21-Task09] Reestructuración de rutas, paradas, horarios y asignaciones asimétricas
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-07, PT-21-08) y Plan de Implementación TAREA 08
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Rutas independientes de ida/regreso, días lectivos específicos y gestión de paradas)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`manageTransportRoute`, `getTransportRoutes`, `assignStudentTransport`)
  - `TransporteRutas`
  - Hoja `TransporteParadas`
  - `TransporteAsignaciones`
- **Dependencias Expuestas:** `TransporteRutas`, `F21-Task01`, `F21-Task05`
- **Descripción del Alcance:**
  Las paradas están embebidas en cadenas JSON dentro de `TransporteRutas` y no se diferencian las rutas de mañana (ida) de las de tarde (retorno), ni se contemplan días específicos de servicio.
  Requerimientos Funcionales Detallados:
  1. Desacoplamiento de paradas:
     - Crear la hoja `TransporteParadas`: `ParadaID`, `RutaID`, `NombreParada`, `DireccionReferencia`, `Latitud`, `Longitud`, `OrdenSecuencia`, `HorarioPlanificado`, `EstadoParada`.
  2. Rutas asimétricas y días lectivos:
     - Configurar tipo de recorrido: `IdaManana`, `RetornoTarde`, `Completa`.
     - Permitir que un estudiante tenga una ruta de ida y otra distinta de regreso, o paradas diferentes según el sentido.
     - Configurar días de operación de la asignación: `["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]`.
     - Permitir cambios temporales de parada sin modificar la asignación permanente del alumno.
- **Criterios de Aceptación:**
  - Las paradas se administran individualmente sin manipular JSON plano.
  - Un estudiante puede tener asignaciones independientes de ida y regreso.
  - Los estudiantes que viajan solo ciertos días no figuran en las listas de pasajeros de los días excluidos.
  - Las asignaciones respetan vigencias y horarios sin colisiones.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task10] Portal administrativo, operativo y familiar de transporte escolar
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-28), Sección C (1.18) y Plan de Implementación TAREA 09
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Interfaces adaptadas por perfil, usabilidad móvil para choferes y experiencia familiar)
- **Archivos Involucrados:**
  - `dashboard-contabilidad.html`
  - `dashboard-director.html`
  - `dashboard-padres.html`
  - `js/accounting.js`
  - `js/portal-padres.js`
- **Dependencias Expuestas:** `getTransportRoutes`, `getTransportAssignments`, `F21-Task01`, `F21-Task02`, `F21-Task05`
- **Descripción del Alcance:**
  El transporte escolar carece de interfaces visuales dedicadas en los dashboards escolares.
  Requerimientos Funcionales Detallados:
  1. Panel administrativo: gestión de flota, personal, rutas, paradas, cupos, incidencias y reportes.
  2. Vista móvil para conductor y acompañante: diseño táctil ligero con lista de paradas del viaje, estudiantes a recoger/entregar, botones rápidos de abordaje/descenso y botón de reporte de incidencias.
  3. Portal familiar: consulta para cada hijo de su ruta, parada, horario previsto, chofer/unidad asignada, estado del viaje y notificaciones.
- **Criterios de Aceptación:**
  - Cada rol accede únicamente a las pantallas y controles autorizados.
  - La interfaz móvil de conductores es ágil y utilizable en campo.
  - Las familias consultan exclusivamente la información de sus propios hijos sin fugas de datos.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task11] Seguimiento GPS, visualización de vehículos y estimación de llegada (ETA)
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-26), Sección C (1.10) y Plan de Implementación TAREA 10
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Certidumbre familiar en paradas, telemetría y mapa en tiempo real protegido)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nuevas funciones `updateTripLocation`, `getTripLiveLocation`, `reportTripDelay`)
  - Hoja `TransporteTelemetria`
  - `TransporteViajes`
- **Dependencias Expuestas:** `TransporteViajes`, Leaflet / Maps API, `F21-Task02`
- **Descripción del Alcance:**
  No existe captura de coordenadas GPS ni visualización de recorridos activos para las familias.
  Requerimientos Funcionales Detallados:
  1. Telemetría y posición del vehículo:
     - Transmisión periódica de coordenadas desde el dispositivo autorizado del conductor/unidad.
     - Mostrar la hora de la última actualización, diferenciando posiciones recientes, desactualizadas y sin conexión.
     - Visualización del vehículo y secuencia de paradas en un mapa interactivo para tutores autorizados.
  2. Estimación de llegada y retrasos:
     - Calcular tiempo estimado de llegada (ETA) a las paradas pendientes.
     - Botón para que el chofer reporte retrasos imprevistos (tráfico, desvío) con minutos estimados.
     - Finalizar el seguimiento inmediatamente al cerrar el recorrido protegiendo la privacidad vehicular.
- **Criterios de Aceptación:**
  - Se reciben y actualizan coordenadas GPS vinculadas al recorrido activo.
  - Una posición antigua se identifica claramente como desactualizada.
  - El acceso al mapa está estrictamente restringido a los tutores de los alumnos a bordo.
  - El seguimiento se desactiva al completarse el viaje.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task12] Sistema de notificaciones y comunicación de eventos de transporte
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-30), Sección C (1.11) y Plan de Implementación TAREA 11
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Avisos oportunos de abordaje/descenso, demoras y cambios operativos)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs` (`sendMultiChannelNotification`, `retryFailedNotificationsQueue`)
  - `TransporteViajes`
  - `TransporteAsistenciaViajes`
- **Dependencias Expuestas:** `sendMultiChannelNotification`, `F21-Task03`, `F21-Task11`
- **Descripción del Alcance:**
  El servicio de notificaciones no está integrado con los eventos operativos del transporte escolar.
  Requerimientos Funcionales Detallados:
  1. Catálogo de alertas de transporte:
     - Notificar abordaje confirmado y descenso confirmado del menor a sus tutores autorizados.
     - Notificar proximidad del vehículo (ej. a 5 minutos de la parada).
     - Notificar retrasos viales, cambios de ruta o sustituciones de autobús/conductor.
  2. Canales y prevención de duplicados:
     - Envío por notificación interna, correo electrónico o WhatsApp institucional.
     - Prevención de duplicados mediante claves idempotentes y gestión de reintentos controlados.
     - Los fallos en el canal de comunicación no deben alterar el estado operativo del viaje.
- **Criterios de Aceptación:**
  - Cada evento operativo dispara las notificaciones configuradas a los tutores correspondientes.
  - No se envían avisos a destinatarios ajenos a la familia del menor.
  - Se registran fallos y reintentos sin generar mensajes duplicados.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task13] Facturación automática de servicios y cargos recurrentes en estados de cuenta
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-44), Sección C (1.16) y Plan de Implementación TAREA 12
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Automatización de cobros mensuales, integridad financiera y conciliación de servicios)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`assignStudentTransport`, nueva función `generateTransportMonthlyCharges`)
  - `TransporteAsignaciones`
  - `CargosEstudiante`
  - `ConceptosCobro`
- **Dependencias Expuestas:** `TransporteAsignaciones`, `CargosEstudiante`, `ConceptosCobro`, `F21-Task01`
- **Descripción del Alcance:**
  La contratación de transporte no está vinculada con la generación automática de cargos en los estados de cuenta estudiantiles.
  Requerimientos Funcionales Detallados:
  1. Tarifas y cargos recurrentes:
     - Asociar a cada ruta su tarifa mensual según modalidad (completa ida/vuelta vs media tarifa).
     - Generar automáticamente los cargos mensuales en `CargosEstudiante` para las asignaciones activas.
     - Prorrateo automático en altas o cancelaciones a mitad de mes.
     - Prevención estricta de cargos duplicados mediante clave idempotente (`TRN-MES-AÑO-ESTUDIANTE`).
     - Al cancelar el servicio, detener la facturación de los períodos posteriores.
- **Criterios de Aceptación:**
  - Asignar transporte genera el cargo correspondiente en el estado de cuenta mensual.
  - Reprocesar la facturación no duplica cargos del mismo mes.
  - Cancelar el servicio detiene los cobros futuros de manera transparente.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task14] Gestión integral de incidencias, averías y emergencias durante recorridos
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-33), Sección C (1.12) y Plan de Implementación TAREA 13
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Seguridad escolar, respuesta ante emergencias, averías mecánicas y escalamiento directivo)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nuevas funciones `reportTransportIncident`, `getTransportIncidents`, `resolveTransportIncident`)
  - Hoja `TransporteIncidencias`
  - `MantenimientoOrdenes`
- **Dependencias Expuestas:** `TransporteRutas`, `TransporteVehiculos`, `sendMultiChannelNotification`, `F21-Task07`
- **Descripción del Alcance:**
  No existe un sistema específico para registrar y atender incidencias viales, averías mecánicas o emergencias médicas durante el transporte.
  Requerimientos Funcionales Detallados:
  1. Expediente de incidencias de transporte:
     - Registrar: averías mecánicas, accidentes, retrasos graves, ausencias no notificadas, emergencias médicas y problemas de conducta.
     - Identificar: recorrido, vehículo, conductor, estudiantes afectados, nivel de gravedad (`Baja`, `Media`, `Alta`, `Critica`) y evidencias.
  2. Escalamiento y resolución:
     - Incidencias críticas alertan de inmediato a Dirección y tutores de los alumnos a bordo.
     - Las fallas mecánicas generan automáticamente órdenes de trabajo en `MantenimientoOrdenes` y marcan la unidad fuera de servicio.
     - Prohibido cerrar incidencias graves sin documentar las medidas adoptadas y el resultado.
- **Criterios de Aceptación:**
  - Los conductores pueden reportar averías o accidentes desde su móvil durante el viaje.
  - Las averías inmovilizantes bloquean el autobús y generan la orden de taller.
  - Dirección y familias reciben avisos inmediatos ante emergencias.
  - Se preserva el historial de resolución de todas las incidencias.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task15] Inscripción, contratación, cancelación y lista de espera de servicios complementarios
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E, Sección C (1.15) y Plan de Implementación TAREA 14
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ciclo formal de contratación de servicios extracurriculares, cupos y listas de espera)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nuevas funciones `enrollComplementaryService`, `cancelComplementaryService`)
  - Hoja `ServiciosInscripciones`
  - `ActividadesExtracurriculares`
- **Dependencias Expuestas:** `ActividadesExtracurriculares`, `CargosEstudiante`, `F21-Task13`
- **Descripción del Alcance:**
  Falta un flujo integrado para formalizar inscripciones, controlar cupos máximos, gestionar listas de espera y procesar cancelaciones de servicios complementarios.
  Requerimientos Funcionales Detallados:
  1. Inscripción y cupos de servicios:
     - Registrar estudiante, servicio, fecha de inicio, condiciones y vigencia.
     - Control de cupo máximo; si se llena, enrutar automáticamente a lista de espera.
     - Gestión de cancelaciones con fecha efectiva y detención de cobros futuros.
     - Consultar solicitudes e inscripciones desde el portal familiar.
- **Criterios de Aceptación:**
  - Se puede inscribir y cancelar un servicio complementario de forma trazable.
  - Se respetan los cupos máximos sin sobrecupos.
  - Las cancelaciones conservan el historial y ajustan la facturación.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task16] Control de asistencia y participación en servicios complementarios
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-42), Sección C (1.17) y Plan de Implementación TAREA 15
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Asistencia a actividades extracurriculares, talleres, clubes y raciones de cafetería)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs` (nueva función `recordActivityAttendance`)
  - Hoja `ServiciosAsistencia`
  - `ActividadesExtracurriculares`
- **Dependencias Expuestas:** `ActividadesExtracurriculares`, `F21-Task15`
- **Descripción del Alcance:**
  Las actividades extracurriculares carecen de un mecanismo interactivo para que los monitores o docentes pasen lista por sesión y los padres consulten la asistencia.
  Requerimientos Funcionales Detallados:
  1. Registro de asistencia por sesión:
     - Identificar alumnos inscritos en la actividad.
     - Registrar: presente, ausente, tardanza, ausencia justificada y retiro anticipado con fecha, hora y responsable.
     - Evitar asistencias duplicadas y permitir consulta de historial individual desde el portal de padres.
- **Criterios de Aceptación:**
  - Los encargados de club o taller registran asistencia por sesión.
  - Solo se pueden registrar estudiantes formalmente inscritos.
  - Los padres pueden consultar el récord de asistencia de sus hijos.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task17] Solicitudes familiares de cambios temporales o permanentes de transporte
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-13), Sección C (1.10) y Plan de Implementación TAREA 16
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Canal digital formal de solicitudes, eliminación de mensajes informales y control de paradas alternas)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nuevas funciones `requestTransportChange`, `reviewTransportChange`)
  - Hoja `TransporteSolicitudesCambio`
  - `TransporteAsignaciones`
- **Dependencias Expuestas:** `TransporteAsignaciones`, `F21-Task10`, `sendMultiChannelNotification`
- **Descripción del Alcance:**
  Las familias no tienen un medio formal para avisar ausencias de un día o solicitar bajada en una parada alterna, dependiendo de llamadas o mensajes informales al chofer.
  Requerimientos Funcionales Detallados:
  1. Flujo de solicitudes familiares:
     - Solicitar: "No viajará hoy" (evita detenciones innecesarias) o "Bajará en parada alterna autorizada".
     - Establecer vigencia y horario límite de envío matutino y vespertino.
     - Al ser aprobada, actualizar la hoja de ruta del chofer para ese día sin alterar la asignación permanente del alumno.
- **Criterios de Aceptación:**
  - Los padres envían solicitudes de cambio desde su portal web.
  - La hoja de ruta del conductor refleja el cambio temporal automáticamente.
  - La asignación permanente se restituye al expirar la vigencia temporal.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task18] Administración centralizada de tarifas, contratos y condiciones de servicios
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección C (1.16) y Plan de Implementación TAREA 17
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Políticas tarifarias configurables, vigencias contractuales y descuentos institucionales)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - Hoja `ServiciosTarifas`
  - `CargosEstudiante`
- **Dependencias Expuestas:** `ConceptosCobro`, `CargosEstudiante`, `F21-Task13`
- **Descripción del Alcance:**
  Las tarifas de transporte y servicios están dispersas en código sin un catálogo maestro configurable con fechas de vigencia y condiciones comerciales.
  Requerimientos Funcionales Detallados:
  1. Catálogo maestro de tarifas:
     - Definir tarifas por servicio, modalidad, ruta, período y vigencias de fecha.
     - Configurar descuentos por hermanos, becas y reglas de cobro por alta o baja a mitad de período.
     - Un cambio de tarifa para un ciclo futuro nunca debe modificar cargos de períodos ya cerrados.
- **Criterios de Aceptación:**
  - Se administran tarifas con vigencia desde el panel contable.
  - Los cargos históricos permanecen inalterables ante cambios de tarifas.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task19] Gestión de necesidades especiales de movilidad y accesibilidad en transporte
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección C (1.4, 1.20) y Plan de Implementación TAREA 18
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Inclusión escolar, adaptabilidad vehicular y confidencialidad de datos médicos)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `TransporteAsignaciones`
  - `TransporteVehiculos`
  - `ExpedientesMedicos`
- **Dependencias Expuestas:** `TransporteVehiculos`, `TransporteAsignaciones`, `F21-Task02`
- **Descripción del Alcance:**
  No se contemplan requerimientos operativos de movilidad o accesibilidad física para estudiantes que requieren rampa, asistencia en abordaje o asientos especiales.
  Requerimientos Funcionales Detallados:
  1. Requerimientos de accesibilidad operativa:
     - Registrar requerimientos de movilidad física autorizados en el expediente del alumno.
     - Validar que la unidad asignada a la ruta cuente con las características de accesibilidad requeridas (ej. rampa hidráulica, espacio para silla de ruedas).
     - Mostrar instrucciones operativas estrictamente al conductor y acompañante de la ruta, manteniendo absoluta confidencialidad frente a otros usuarios.
- **Criterios de Aceptación:**
  - Se pueden registrar requerimientos de accesibilidad física autorizados.
  - La asignación valida la compatibilidad del vehículo.
  - La información operativa es confidencial y solo accesible al personal de ruta.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task20] Funcionamiento con conectividad intermitente y sincronización de operaciones móviles
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-25), Sección C (1.9) y Plan de Implementación TAREA 19
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Continuidad operativa en ruta sin internet, caché local y sincronización idempotente)
- **Archivos Involucrados:**
  - `js/portal-padres.js` / Interfaz de Conductor
  - `backend/accounting-service/Code.gs` (`recordStudentBoarding`, `recordStudentAlighting`)
- **Dependencias Expuestas:** `F21-Task03`, IndexedDB / LocalStorage
- **Descripción del Alcance:**
  Si el dispositivo del chofer o acompañante pierde señal celular durante el recorrido, no se pueden registrar abordajes ni consultar pasajeros en parada.
  Requerimientos Funcionales Detallados:
  1. Operación offline y sincronización:
     - Descarga previa de la lista de pasajeros y paradas del viaje al iniciar la jornada.
     - Permitir registrar abordajes, descensos e incidencias sin conexión a internet guardándolos en almacenamiento local seguro (`IndexedDB`).
     - Al recuperar conectividad, sincronizar automáticamente los eventos pendientes enviando identificadores únicos idempotentes para evitar duplicaciones.
     - Mostrar en pantalla el indicador de eventos pendientes de sincronizar.
- **Criterios de Aceptación:**
  - Los abordajes y descensos se pueden registrar sin señal celular.
  - Al volver la conexión, los eventos se sincronizan sin duplicados en el servidor.
  - Se distingue visualmente entre eventos locales y confirmados en servidor.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task21] Checklist preoperacional y control de seguridad vehicular diaria
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-39), Sección C (3.4) y Plan de Implementación TAREA 20
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Prevención de accidentes, inspección preoperacional diaria y responsabilidad de choferes)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nuevas funciones `recordPreTripInspection`, `getPreTripInspections`)
  - Hoja `TransporteInspecciones`
  - `TransporteVehiculos`
- **Dependencias Expuestas:** `TransporteVehiculos`, `F21-Task05`, `F21-Task07`
- **Descripción del Alcance:**
  No existe una inspección digital diaria obligatoria del estado del vehículo antes de salir a transportar estudiantes.
  Requerimientos Funcionales Detallados:
  1. Inspección preoperacional móvil:
     - El conductor completa una lista de comprobación antes de arrancar la unidad: frenos, neumáticos, luces, cinturones, extintor y botiquín.
     - Registro de kilometraje matutino inicial.
     - Si se reporta un defecto crítico de seguridad, el sistema bloquea el inicio ordinario de la ruta y genera una orden de mantenimiento correctivo inmediata.
- **Criterios de Aceptación:**
  - El conductor registra el checklist desde su teléfono antes del primer viaje.
  - Los defectos críticos impiden el inicio del recorrido hasta su resolución.
  - Se conserva el historial de inspecciones por unidad vehicular.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task22] Optimización de rutas, orden de paradas y planificación de recorridos
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección C (1.4) y Plan de Implementación TAREA 21
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Reducción de tiempos de viaje, ahorro de combustible y ordenamiento lógico de paradas)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nueva función `optimizeRouteStopsSequence`)
  - `TransporteParadas`
  - `TransporteRutas`
- **Dependencias Expuestas:** `TransporteParadas`, Geocodificación / Maps API, `F21-Task09`
- **Descripción del Alcance:**
  Las paradas se ingresan en orden manual sin herramientas de optimización ni cálculo de distancias reales entre puntos.
  Requerimientos Funcionales Detallados:
  1. Optimización y ordenamiento de paradas:
     - Con las coordenadas geográficas de las paradas, calcular distancias y tiempos aproximados de recorrido.
     - Ofrecer sugerencias de ordenamiento de paradas para minimizar tiempo y trayecto total, respetando ventanas de horario escolar.
     - Permitir a la administración comparar la ruta actual con la propuesta optimizada y aprobar o rechazar los cambios.
     - Prohibido modificar automáticamente rutas activas sin la confirmación de un operador facultado.
- **Criterios de Aceptación:**
  - Las paradas poseen coordenadas geográficas válidas.
  - Se generan propuestas de ordenamiento lógico de paradas.
  - La propuesta requiere aprobación directiva antes de aplicarse oficialmente.
- **Estado:** [ ] Pendiente

---

## BLOQUE 3: ADMINISTRACIÓN AVANZADA, EXCURSIONES, PLANIFICACIÓN, PROVEEDORES Y ANALÍTICA (P2)

---

### [ ] [F21-Task23] Gestión de transporte extraordinario, excursiones y eventos deportivos
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E (PT-21-38), Sección C (3.8) y Plan de Implementación TAREA 22
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Movilidad fuera de sede, visitas pedagógicas, torneos y autorizaciones firmadas)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nuevas funciones `createExtraordinaryTrip`, `getExtraordinaryTrips`)
  - Hoja `TransporteViajesEspeciales`
  - `ActividadesExtracurriculares`
  - `SolicitudesAutorizacion`
- **Dependencias Expuestas:** `TransporteVehiculos`, `TransporteConductores`, `ActividadesExtracurriculares`
- **Descripción del Alcance:**
  No existe un módulo para organizar viajes fuera de las rutas regulares (visitas culturales, torneos intercolegiales).
  Requerimientos Funcionales Detallados:
  1. Viajes extraordinarios y autorizaciones:
     - Registrar destino, fecha/hora de ida y vuelta, docente responsable, vehículo y chofer habilitados.
     - Padrón de estudiantes participantes con verificación obligatoria de autorización firmada por los padres en el portal familiar (`SolicitudesAutorizacion`) antes de permitir el abordaje.
     - Lista de abordaje y regreso exclusiva con confirmación de cierre seguro de viaje.
- **Criterios de Aceptación:**
  - Se pueden crear viajes especiales sin desconfigurar las rutas regulares.
  - Se bloquea el abordaje de alumnos que no tengan autorización firmada de sus tutores.
  - Se genera el listado oficial de pasajeros para fines de seguro y logística.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task24] Planificación anual de transporte y renovación de asignaciones
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección C (3.7) y Plan de Implementación TAREA 23
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Planificación del ciclo lectivo siguiente, renovación masiva y transición académica)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nueva función `cloneTransportSetupForNextYear`)
  - `TransporteRutas`
  - `TransporteAsignaciones`
- **Dependencias Expuestas:** `TransporteRutas`, `TransporteAsignaciones`, Matrícula escolar
- **Descripción del Alcance:**
  No se pueden preparar las rutas y asignaciones del siguiente año escolar sin alterar la operación activa del ciclo en curso.
  Requerimientos Funcionales Detallados:
  1. Entorno de planificación anual:
     - Crear un borrador de rutas y asignaciones para el próximo año lectivo basado en el ciclo anterior.
     - Excluir automáticamente a los estudiantes graduados o retirados.
     - Permitir ajustar paradas y unidades antes de publicarlas de forma definitiva en la fecha de inicio del nuevo ciclo escolar.
- **Criterios de Aceptación:**
  - Se prepara la planificación futura sin alterar la operación vigente.
  - Los alumnos retirados se excluyen de la renovación automática.
  - Los ciclos lectivos conservan historiales de asignación independientes.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task25] Gestión de proveedores externos y servicios de transporte contratados
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección C (3.11) y Plan de Implementación TAREA 24
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Microbuses subcontratados, control de proveedores y homologación de requisitos)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `ProveedoresActivos`
  - `TransporteVehiculos`
  - `TransporteConductores`
- **Dependencias Expuestas:** `ProveedoresActivos`, `TransporteVehiculos`, `F18-Task09`
- **Descripción del Alcance:**
  Cuando la institución subcontrata microbuses o camionetas externas, no se controlan bajo los mismos estándares de seguridad que las unidades propias.
  Requerimientos Funcionales Detallados:
  1. Proveedores y unidades externas:
     - Vincular vehículos y conductores externos con su respectivo proveedor en `ProveedoresActivos`.
     - Exigir los mismos controles de seguro obligatorio, revisión mecánica y licencias de chofer antes de habilitarlos para transportar alumnos.
- **Criterios de Aceptación:**
  - Las unidades externas se sujetan a las mismas validaciones de seguridad que las propias.
  - Se auditan pólizas y contratos de proveedores de transporte.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task26] Control de combustible, kilometraje y costos operativos de la flota
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección C (1.1, 1.21) y Plan de Implementación TAREA 25
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Eficiencia energética, bitácora de consumo de combustible y costos por kilómetro)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nuevas funciones `recordFuelLog`, `getFleetOperatingCosts`)
  - Hoja `TransporteCombustible`
  - `TransporteVehiculos`
- **Dependencias Expuestas:** `TransporteVehiculos`, `MantenimientoOrdenes`, `CuentasPorPagarGastos`
- **Descripción del Alcance:**
  No existe una bitácora para registrar kilometrajes y compras de combustible por unidad escolar para medir el rendimiento de la flota.
  Requerimientos Funcionales Detallados:
  1. Bitácora de combustible y kilometraje:
     - Registrar cargas de combustible (galones, costo total, fecha, kilometraje actual del odómetro, factura y vehículo).
     - Calcular rendimiento promedio (km por galón) y alertar ante consumos anómalos o lecturas de odómetro inconsistentes.
     - Reportar costos operativos de combustible y mantenimiento por unidad vehicular.
- **Criterios de Aceptación:**
  - Se registran cargas de combustible vinculadas al vehículo y factura.
  - Se detectan inconsistencias en lecturas de kilometraje.
  - Se generan reportes de costo operativo por unidad y por ruta.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task27] Reportes operativos, administrativos y financieros de transporte
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección C (1.19) y Plan de Implementación TAREA 26
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Reportería consolidada, auditoría de puntualidad, ocupación de flota y cobranza)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nueva función `getTransportOperationalReports`)
  - `TransporteRutas`
  - `TransporteAsignaciones`
  - `TransporteViajes`
  - `js/accounting.js`
- **Dependencias Expuestas:** `TransporteRutas`, `TransporteAsignaciones`, `F21-Task01`, `F21-Task13`
- **Descripción del Alcance:**
  Existen contadores aislados pero no una suite de reportes consolidados para evaluar la operación de transporte.
  Requerimientos Funcionales Detallados:
  1. Suite de reportes de movilidad escolar:
     - Reporte de ocupación y cupos por ruta y unidad vehicular.
     - Reporte de puntualidad y retrasos comparando horario planificado vs horario real de viaje.
     - Reporte de asistencia y estudiantes que no abordaron.
     - Reporte de recaudación y saldos pendientes por concepto de transporte.
     - Exportación estructurada a formatos Excel y PDF.
- **Criterios de Aceptación:**
  - Los reportes totalizan con exactitud los datos del padrón y de los viajes.
  - Se exportan archivos con formateo legible y filtros por período y ruta.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task28] Importación y exportación de datos de rutas, paradas y padrón de transporte
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección C (1.21) y Plan de Implementación TAREA 27
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Productividad administrativa, carga masiva de inicio de ciclo y migración segura)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nuevas funciones `importTransportAssignmentsCSV`, `exportTransportRoster`)
  - `TransporteAsignaciones`
  - `TransporteParadas`
- **Dependencias Expuestas:** `TransporteAsignaciones`, `F21-Task01`
- **Descripción del Alcance:**
  No se pueden cargar ni descargar masivamente las asignaciones de transporte al inicio de ciclo, obligando a digitación manual individual.
  Requerimientos Funcionales Detallados:
  1. Importación estructurada por CSV/Excel:
     - Validar previamente identificadores de alumnos, rutas y cupos disponibles antes de procesar el archivo.
     - Mostrar vista previa con resumen de filas válidas y reporte de errores por fila.
     - Exportar el padrón oficial de pasajeros con datos de contacto y paradas.
- **Criterios de Aceptación:**
  - Se importan asignaciones masivas con validación previa de cupos.
  - Se reportan y bloquean filas con identificadores erróneos o rutas inexistentes.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task29] Integración con calendario académico y suspensión en días no lectivos
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección C (1.21) y Plan de Implementación TAREA 28
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Coherencia operativa, suspensión automática en feriados y avisos familiares)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `CalendarioInstitucional`
  - `TransporteRutas`
- **Dependencias Expuestas:** `CalendarioInstitucional`, `F11-Task06`, `sendMultiChannelNotification`
- **Descripción del Alcance:**
  Las rutas no están vinculadas con los días no lectivos del calendario escolar, generando avisos innecesarios en feriados o vacaciones.
  Requerimientos Funcionales Detallados:
  1. Sincronización con calendario escolar:
     - Consultar días lectivos y feriados en `CalendarioInstitucional`.
     - Suspender automáticamente la programación de rutas ordinarias en días no lectivos.
     - Notificar con anticipación a las familias ante suspensiones de servicio por asuetos o jornadas pedagógicas.
- **Criterios de Aceptación:**
  - No se programan recorridos ordinarios en días marcados como feriado o no lectivo.
  - Se despachan avisos oportunos a las familias sobre la suspensión del servicio.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task30] Indicadores de eficiencia operativa y análisis de demanda de transporte
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección C (3.12) y Plan de Implementación TAREA 29
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Analítica gerencial, toma de decisiones de rutas y costos por alumno)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nueva función `getTransportEfficiencyMetrics`)
  - `TransporteRutas`
  - `TransporteAsignaciones`
  - `TransporteViajes`
- **Dependencias Expuestas:** `TransporteRutas`, `TransporteViajes`, `F21-Task27`
- **Descripción del Alcance:**
  Dirección no cuenta con indicadores para evaluar si una ruta es rentable, si está sobreocupada o si existen zonas residenciales con demanda insatisfecha.
  Requerimientos Funcionales Detallados:
  1. Indicadores de eficiencia:
     - Tasa de ocupación promedio de la flota por ruta y jornada.
     - Índice de puntualidad y duración promedio de recorridos.
     - Costo operativo promedio por estudiante transportado.
     - Identificación de zonas geográficas con alta demanda de transporte sin cobertura.
- **Criterios de Aceptación:**
  - Se calculan métricas fundamentadas en datos reales de viajes y asignaciones.
  - Dirección visualiza gráficos de rendimiento de la flota vehicular.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task31] Consolidación de cafetería y tienda con estados de cuenta familiares
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E, Sección C (1.14) y Plan de Implementación TAREA 30
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Consolidación financiera, prevención de doble cobro y conciliación de consumos)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`processFamilyCreditPurchase`, `createCafeteriaOrder`, `createStoreOrder`)
  - `CafeteriaPedidos`
  - `TiendaOrdenes`
  - `CargosEstudiante`
- **Dependencias Expuestas:** `CafeteriaPedidos`, `TiendaOrdenes`, `CargosEstudiante`, `F15-Task01`
- **Descripción del Alcance:**
  La cafetería, tienda y crédito familiar operan correctamente pero falta consolidar sus consumos con la facturación institucional para evitar discrepancias o dobles cobros.
  Requerimientos Funcionales Detallados:
  1. Consolidación financiera de consumos:
     - Conservar las reglas de crédito familiar autorizadas por PIN de tutores.
     - Vincular cada consumo con el estudiante y responsable financiero.
     - Consolidar los cargos en el estado de cuenta escolar impidiendo que una compra ya deducida del crédito familiar vuelva a generar un cargo manual en colegiatura.
     - Gestionar anulaciones y devoluciones con reversión del saldo de crédito familiar.
- **Criterios de Aceptación:**
  - Toda compra autorizada se asienta una sola vez en el estado de cuenta o crédito familiar.
  - Se impiden cobros duplicados por el mismo consumo.
  - Los reportes de ventas coinciden exactamente con los movimientos registrados.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task32] Ampliación del sistema de actividades extracurriculares y sus servicios asociados
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E, Sección C (1.14) y Plan de Implementación TAREA 31
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Gestión integral de clubes, deportes, tutorías, cupos y cobros asociados)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs` (`saveExtracurricularActivity`, `getExtracurricularActivities`)
  - `backend/accounting-service/Code.gs`
  - `ActividadesExtracurriculares`
  - `ServiciosInscripciones`
- **Dependencias Expuestas:** `ActividadesExtracurriculares`, `ServiciosInscripciones`, `CargosEstudiante`
- **Descripción del Alcance:**
  Las actividades extracurriculares registran metadatos pero carecen de gestión de inscripciones formales, cupos, listas de espera y vinculación con cobros de mensualidad.
  Requerimientos Funcionales Detallados:
  1. Ciclo completo de actividades extracurriculares:
     - Configurar sesiones, horarios, docentes responsables, cupos máximos y tarifas de inscripción.
     - Gestionar inscripciones desde el portal familiar con autorización de los padres.
     - Vincular con `CargosEstudiante` para generar el cargo por membresía de taller o club deportivo.
     - Permitir asociar actividades con transporte extraordinario para partidos o presentaciones fuera de sede.
- **Criterios de Aceptación:**
  - Las actividades controlan cupos máximos de inscripción.
  - Las inscripciones pagadas generan el cargo en el estado de cuenta del estudiante.
  - Los padres pueden consultar y gestionar las actividades de sus hijos.
- **Estado:** [ ] Pendiente

---

### [ ] [F21-Task33] Configuración centralizada de servicios complementarios institucionales
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección C (1.14) y Plan de Implementación TAREA 32
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Arquitectura reutilizable de servicios escolares, parametrización y escalabilidad)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - Hoja `ServiciosCatalogoInstitucional`
- **Dependencias Expuestas:** `CafeteriaMenu`, `TiendaProductos`, `ActividadesExtracurriculares`
- **Descripción del Alcance:**
  Los servicios escolares se crearon como funciones aisladas, dificultando la incorporación de nuevas ofertas (tutorías, club de robótica, seguro médico opcional) sin reescribir código.
  Requerimientos Funcionales Detallados:
  1. Catálogo maestro de servicios complementarios:
     - Configurar servicios con categoría, modalidad (recurrente, por consumo, por evento), cupos, responsables, tarifas y reglas de autorización familiar.
     - Permitir habilitar o pausar servicios por período lectivo conservando la información histórica.
- **Criterios de Aceptación:**
  - Se pueden parametrizar nuevos servicios complementarios desde la plataforma.
  - Los servicios existentes continúan funcionando con plena compatibilidad.
- **Estado:** [ ] Pendiente

---

## BLOQUE 4: ASEGURAMIENTO Y CALIDAD (P0)

---

### [ ] [F21-Task34] Suite automatizada de pruebas y regresión integral de transporte y servicios complementarios
- **Origen del Hallazgo:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md` / Sección E, Sección G (P0) y Plan de Implementación TAREA 33
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Aseguramiento continuo de integridad en movilidad escolar, cupos, seguridad infantil y cobros)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/developer-service/Code.gs`
  - `tests/regression/academic-grading-suite.js`
- **Dependencias Expuestas:** Todas las tareas de la Fase 21 (`F21-Task01` a `F21-Task33`), suites de pruebas del ecosistema institucional
- **Descripción del Alcance:**
  Implementar la suite integral automatizada `runPhase21TransportAndServicesRegressionSuite` que valide de manera continua el ciclo de transporte y servicios complementarios, certificando todas las operaciones críticas y la no regresión del sistema.
  Requerimientos Funcionales Detallados:
  1. Batería obligatoria de pruebas automatizadas:
     - Capacidad y cupos: rechazo estricto de asignación al superar el límite de asientos de la unidad.
     - Privacidad RBAC: verificación de que un rol Padre solo recibe datos de sus hijos y se bloquean accesos cruzados.
     - Abordaje y descenso: registro de eventos QR, prevención de abordajes duplicados y bloqueo de cierre de viaje con alumnos a bordo.
     - Entregas autorizadas: verificación de que solo adultos vigentes en expediente familiar son aceptados al entregar menores.
     - Habilitación de flota: bloqueo de autobuses con revisión mecánica o seguro caducado y choferes con licencia vencida.
     - Rutas asimétricas: asignación independiente mañana/tarde y control por días lectivos.
     - Facturación de transporte: generación del cargo en `CargosEstudiante` con tarifa adecuada y prevención de duplicados.
     - Cafetería, tienda y extracurriculares: cobros con crédito familiar, consolidación de consumos y asistencia a clubes.
  2. No regresión del ecosistema:
     - Garantizar que la suite opere en entorno controlado sin alterar registros de producción ni las 53 pruebas de regresión previas de las Fases 9, 10, 11, 15, 16, 17, 18, 19 y 20.
- **Criterios de Aceptación:**
  - La suite de regresión ejecuta todas las pruebas de transporte y servicios complementarios con el 100% de éxito (`PASS`).
  - Se valida el bloqueo efectivo de sobrecupos y la protección de datos de menores.
  - Las suites de regresión previas (53/53 pruebas) se mantienen aprobadas al 100%.
- **Estado:** [ ] Pendiente

---

# PENDIENTES - FASE 22: GESTIÓN DOCUMENTAL, FORMULARIOS, FIRMA ELECTRÓNICA E INTEGRACIÓN CON CUADROS DE SACE

## TAREAS CRÍTICAS (P0 - SEGURIDAD BINARIA, HASH CRIPTOGRÁFICO, EXPEDIENTE PROBATORIO Y FIRMA AVANZADA)

---

### [ ] [F22-Task01] Validación binaria, seguridad e integridad de archivos adjuntos
- **Origen del Hallazgo:** `AUDITORIA_FASE_22_GESTION_DOCUMENTAL_FORMULARIOS_FIRMA_ELECTRONICA.md` / Sección E (F22-11), Sección G (Defecto 1) y Plan de Trabajo TAREA 22-01
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Seguridad perimetral, prevención de inyección de código malicioso y validación de tipos binarios reales)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs` (`submitInstitutionalFormRequest`)
  - Google Drive API
- **Dependencias Expuestas:** Google Drive, servicios de recepción de archivos, formularios institucionales, solicitudes y trámites, expedientes estudiantiles y laborales.
- **Descripción del Alcance:**
  La plataforma valida principalmente la extensión declarada en el nombre del archivo. Esto permite que un archivo ejecutable, corrupto o con contenido distinto al formato anunciado pueda presentarse como PDF o imagen y llegar al almacenamiento institucional en Google Drive.
  Requerimientos Funcionales Detallados:
  1. Validación del contenido binario real:
     - Centralizar la validación de archivos para que todos los módulos que reciben adjuntos utilicen los mismos controles de seguridad.
     - Implementar validación del contenido binario real del archivo, sin confiar exclusivamente en el nombre, la extensión, el MIME declarado por el navegador ni el tipo de archivo seleccionado en el formulario.
     - Reconocer y validar las firmas binarias (Magic Bytes) de los formatos permitidos, como mínimo:
       * PDF: debe comenzar obligatoriamente con `%PDF-` (`0x25, 0x50, 0x44, 0x46, 0x2D`).
       * JPEG/JPG: debe comenzar con `0xFF, 0xD8, 0xFF`.
       * PNG: debe comenzar con `0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A`.
       * WEBP: contenedor RIFF con firma `WEBP`.
       * DOCX / XLSX: contenedores PKZip (`0x50, 0x4B, 0x03, 0x04`) con validación de estructura de paquete OpenXML interna.
  2. Comprobación estructural y rechazos preventivos:
     - Comprobar que la estructura interna del archivo sea coherente con el formato detectado.
     - Rechazar: ejecutables renombrados como documentos (`.exe`, `.sh`, `.bat`), archivos con extensión y contenido incompatibles, archivos corruptos o incompletos, archivos vacíos (0 bytes), formatos no autorizados y archivos que excedan los límites establecidos configurables (ej. 10 MB).
     - Evitar que se acepten archivos con contenido activo o potencialmente peligroso cuando el formato o el contexto no lo requieran.
     - Incorporar análisis antimalware mediante un mecanismo o servicio compatible cuando esté disponible.
     - Registrar el resultado de la validación y el motivo específico de rechazo para orientar al usuario.
     - Ejecutar la validación en el servidor antes de guardar definitivamente el archivo en Google Drive; un archivo rechazado no debe generar registros documentales incompletos ni asociarse a expedientes.
     - Mantener el nombre original como metadato, sin utilizarlo como prueba del formato real.
- **Criterios de Aceptación:**
  - [ ] Un ejecutable renombrado como PDF es rechazado inmediatamente por discrepancia binaria.
  - [ ] Un archivo con MIME falso es identificado y catalogado por su contenido real.
  - [ ] Un PDF válido puede cargarse y abrirse correctamente en el visor.
  - [ ] Un PDF corrupto o truncado es rechazado con mensaje descriptivo.
  - [ ] Una imagen válida es aceptada únicamente si corresponde a un formato permitido.
  - [ ] Los archivos demasiado grandes son rechazados antes de su almacenamiento definitivo en Drive.
  - [ ] Los errores de validación no generan registros documentales incompletos en las hojas.
  - [ ] La validación se aplica a todos los módulos que permiten adjuntar documentos.
  - [ ] Se conserva la trazabilidad del archivo y del resultado de su validación.
- **Estado:** [ ] Pendiente

---

### [ ] [F22-Task02] Hash SHA-256 y vinculación criptográfica de las firmas con los documentos
- **Origen del Hallazgo:** `AUDITORIA_FASE_22_GESTION_DOCUMENTAL_FORMULARIOS_FIRMA_ELECTRONICA.md` / Sección E (F22-15), Sección G (Defecto 2) y Plan de Trabajo TAREA 22-02
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Integridad documental matemática, valor probatorio inalterable y no repudio)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`generateSchoolDocument`, `verifySchoolDocumentByCUV`)
  - `backend/user-service/Code.gs` (`registerDocumentSignature`)
  - `DocumentosEscolaresEmitidos`
  - `FirmasConformidades`
- **Dependencias Expuestas:** Generación documental, almacenamiento de Drive, registros de firmas, control de versiones y certificados de finalización.
- **Descripción del Alcance:**
  El sistema registra una conformidad digital mediante un token, una fecha y una dirección IP, pero no demuestra criptográficamente que el archivo firmado sea exactamente el mismo que existía al momento de la aceptación.
  Requerimientos Funcionales Detallados:
  1. Huella criptográfica SHA-256 sobre bytes definitivos:
     - Calcular una huella criptográfica SHA-256 del documento definitivo que será aceptado o firmado:
       `hashSHA256 = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, documentBytes)`
       `hashHex = bytesToHex(hashSHA256)`
     - Calcular el hash sobre los bytes del archivo PDF definitivo, no únicamente sobre el HTML de la plantilla o los datos JSON utilizados para generarlo.
     - Asociar la huella al registro de firma y al documento correspondiente en `FirmasConformidades` y `DocumentosEscolaresEmitidos`.
  2. Metadatos de la vinculación criptográfica:
     - Registrar: identificador del documento, identificador de la solicitud de firma, hash SHA-256, versión del documento, identidad del firmante, rol del firmante, fecha y hora de aceptación, método de autenticación utilizado e identificador de la transacción.
     - Diferenciar entre: Hash del documento antes de la firma, Hash del documento final firmado y Hash de los anexos o evidencias (cuando corresponda).
  3. Verificación de inmutabilidad:
     - Impedir que una modificación posterior del documento se presente como parte de la misma firma.
     - Permitir verificar la integridad de un documento comparando su hash actual con el hash registrado al momento de la firma.
     - Si el documento cambia, generar una nueva versión y solicitar nuevamente las firmas que correspondan; una nueva versión nunca hereda las firmas anteriores.
     - Vincular cada firma con una versión concreta e inmutable del documento.
- **Criterios de Aceptación:**
  - [ ] Cada documento firmado tiene un hash SHA-256 asociado y persistido en la base de datos.
  - [ ] El hash corresponde al archivo PDF definitivo generado en Drive.
  - [ ] La verificación de un archivo sin modificaciones devuelve un resultado válido.
  - [ ] La modificación de un solo byte provoca que la verificación de integridad falle inmediatamente.
  - [ ] Una nueva versión del documento no hereda las firmas de una versión anterior.
  - [ ] Las firmas conservan su vínculo con el documento y versión originales.
  - [ ] El historial permite identificar cuándo se generó cada huella y a qué archivo corresponde.
- **Estado:** [ ] Pendiente

---

### [ ] [F22-Task03] Certificado de finalización y expediente probatorio de cada firma
- **Origen del Hallazgo:** `AUDITORIA_FASE_22_GESTION_DOCUMENTAL_FORMULARIOS_FIRMA_ELECTRONICA.md` / Sección E (F22-19), Sección D y Plan de Trabajo TAREA 22-03
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Pista de auditoría probatoria, evidencia legal de consentimiento y estándar Certificate of Completion)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs` (`registerDocumentSignature`, nueva función `generateSignatureAuditCertificate`)
  - `backend/accounting-service/Code.gs`
  - `FirmasConformidades`
  - `DocumentosEscolaresEmitidos`
- **Dependencias Expuestas:** `F22-Task02`, gestión de firmas, almacenamiento documental y trazabilidad.
- **Descripción del Alcance:**
  La plataforma conserva información básica de las conformidades, pero no genera un documento consolidado que permita revisar y verificar las evidencias de una transacción de firma para su validez legal ante terceros.
  Requerimientos Funcionales Detallados:
  1. Generador de Certificado de Finalización (Audit Trail):
     - Generar automáticamente un certificado de finalización asociado a cada proceso de firma completado, conteniendo:
       * Identificador único de la transacción.
       * Identificador y tipo de documento.
       * Nombre o descripción del documento.
       * Versión firmada.
       * Hash SHA-256 del archivo.
       * Relación completa de firmantes.
       * Nombre e identidad de cada firmante (según los datos verificados disponibles).
       * Rol con el que participó cada firmante.
       * Método de autenticación utilizado.
       * Fecha y hora exacta de cada aceptación (en formato UTC y Hora Oficial de Honduras GMT-6).
       * Orden en el que se realizaron las firmas.
       * Dirección IP y demás evidencias técnicas proporcionadas.
       * Resultado final del proceso.
       * Token o código de verificación (CUV).
       * Identificador del proveedor de firma (cuando se utilice uno externo).
  2. Preservación del expediente probatorio:
     - El certificado debe permitir distinguir claramente entre una conformidad electrónica simple y una firma avanzada respaldada por un proveedor acreditado.
     - Vincular el certificado al documento y al expediente correspondiente.
     - Conservar el certificado como archivo independiente y relacionarlo con el PDF firmado (o como hoja anexa final del PDF).
     - Evitar que el certificado pueda editarse o regenerarse con datos diferentes a los registrados originalmente.
     - Incorporar verificación de integridad del certificado y del documento al que hace referencia.
- **Criterios de Aceptación:**
  - [ ] Una transacción completada genera su certificado automáticamente.
  - [ ] El certificado identifica a todos los firmantes y sus respectivas actuaciones.
  - [ ] Los datos coinciden con el historial real de la transacción.
  - [ ] El certificado identifica el hash del documento firmado.
  - [ ] El certificado puede descargarse y consultarse desde el expediente escolar.
  - [ ] Una modificación del documento no altera retroactivamente el certificado.
  - [ ] Las transacciones canceladas, rechazadas o vencidas no se presentan como firmas completadas.
- **Estado:** [ ] Pendiente

---

### [ ] [F22-Task04] Integración con firma electrónica avanzada y proveedores de certificación (Decreto 149-2013)
- **Origen del Hallazgo:** `AUDITORIA_FASE_22_GESTION_DOCUMENTAL_FORMULARIOS_FIRMA_ELECTRONICA.md` / Sección C (7), Sección E (F22-16) y Plan de Trabajo TAREA 22-04
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Cumplimiento normativo hondureño, contratos de matrícula vinculantes y convenios laborales docentes)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
  - Hoja `ConfiguracionFirmaAvanzada`
- **Dependencias Expuestas:** `F22-Task02`, `F22-Task03`, gestión documental, control de versiones, proveedores de certificación y revisión jurídica.
- **Descripción del Alcance:**
  La plataforma dispone de mecanismos de aceptación electrónica simple, pero no de una integración con un Prestador de Servicios de Certificación (PSC) que permita gestionar los casos que requieran firma electrónica avanzada bajo el marco legal de Honduras.
  Requerimientos Funcionales Detallados:
  1. Arquitectura de integración con proveedores de certificación:
     - Diseñar una arquitectura de integración con proveedores de firma electrónica y certificación compatibles con el marco normativo hondureño (Decreto Legislativo No. 149-2013 y Acuerdo Ejecutivo No. 41-2014).
     - Incorporar una capa de integración desacoplada del proveedor específico que permita configurar credenciales, endpoints, certificados y parámetros de cada proveedor de forma segura.
     - Permitir seleccionar el mecanismo de firma según la naturaleza del documento:
       * Aceptación electrónica simple.
       * Firma electrónica mediante proveedor externo.
       * Firma electrónica avanzada (con certificado X.509 v3 y sellado de tiempo cualificado), cuando corresponda.
  2. Gestión transaccional y validación:
     - Soportar: creación de solicitudes de firma, identificación y autenticación de firmantes, entrega del documento, recepción del resultado, recuperación del documento firmado, recepción y validación de certificados y consulta del estado de la transacción.
     - Verificar la autenticidad del resultado recibido y la integridad del documento.
     - Registrar el identificador de transacción proporcionado por el proveedor.
     - Gestionar fallos de comunicación, solicitudes pendientes, vencimientos, cancelaciones y reintentos sin generar firmas duplicadas.
     - No considerar una firma completada hasta recibir y verificar la confirmación correspondiente del proveedor.
  3. Consideraciones normativas hondureñas:
     - La plataforma no debe afirmar que una firma dibujada, un nombre escrito, un token o una casilla constituyen automáticamente una firma electrónica avanzada.
     - Los contratos de matrícula y laborales deben someterse a revisión jurídica para definir el mecanismo obligatorio.
- **Criterios de Aceptación:**
  - [ ] Los tipos de documentos pueden configurarse según el mecanismo de firma requerido.
  - [ ] Una solicitud externa puede crearse y consultarse.
  - [ ] La plataforma identifica correctamente los estados pendientes, completados, rechazados, cancelados y vencidos.
  - [ ] Un documento no se marca como firmado si el proveedor no confirma el resultado.
  - [ ] Se verifica la integridad del documento recibido.
  - [ ] Se conserva la evidencia de la transacción.
  - [ ] Los fallos de conexión no generan firmas duplicadas ni documentos inconsistentes.
  - [ ] La solución permite sustituir o incorporar otro proveedor sin reconstruir todo el módulo.
  - [ ] No se presentan como avanzadas las firmas que no cumplen los requisitos correspondientes.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ALTA PRIORIDAD (P1 - EXPLORADOR DOCUMENTAL, MÚLTIPLES FIRMANTES, IMPRIMIBLES, LOTES Y COMPATIBILIDAD SACE)

---

### [ ] [F22-Task05] Explorador documental institucional unificado
- **Origen del Hallazgo:** `AUDITORIA_FASE_22_GESTION_DOCUMENTAL_FORMULARIOS_FIRMA_ELECTRONICA.md` / Sección E (F22-01), Sección G (Defecto 4) y Plan de Trabajo TAREA 22-05
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Visibilidad institucional, búsqueda 360° de expedientes y eliminación de dispersión documental)
- **Archivos Involucrados:**
  - `dashboard-director.html`
  - `dashboard-secretaria.html`
  - `js/secretaria.js`
  - `backend/accounting-service/Code.gs` (nueva función `searchUnifiedDocumentRepository`)
- **Dependencias Expuestas:** Persistencia documental existente, Google Drive, expedientes estudiantiles y laborales, permisos RBAC/ABAC y registros de trámites.
- **Descripción del Alcance:**
  Los documentos se encuentran distribuidos entre diferentes hojas, carpetas y módulos sin una interfaz centralizada que permita consultar y administrar el archivo documental institucional de forma integral.
  Requerimientos Funcionales Detallados:
  1. Organización y clasificación multidimensional:
     - Desarrollar un explorador centralizado para navegar por: Expedientes de estudiantes, Expedientes familiares, Expedientes de empleados, Departamentos institucionales, Tipos de documentos, Solicitudes y trámites, Documentos emitidos, Documentos pendientes de aprobación, Documentos firmados, Documentos vencidos, Documentos archivados, y Documentos financieros/administrativos.
     - La clasificación debe utilizar metadatos y relaciones documentales, no depender exclusivamente de la ubicación física del archivo en Drive.
  2. Búsqueda y filtros combinables:
     - Filtros por: Nombre del estudiante o empleado, Identificador institucional, Grado y sección, Departamento, Categoría documental, Tipo de trámite, Fechas (creación, emisión, vencimiento), Estado, Responsable, Firmante, Código CUV y Número correlativo.
     - Ordenamiento por fecha, nombre, categoría y estado.
  3. Visualización y acciones autorizadas:
     - Previsualizar el documento (PDF e imágenes), descargarlo, consultar metadatos, ver historial, consultar firmas y evidencias, ver expediente al que pertenece, acceder a versiones anteriores y archivar.
     - Reunir información de registros existentes sin crear copias innecesarias de archivos en Drive.
     - Paginación o carga progresiva, filtros persistentes durante navegación y diseño adaptable a móvil, tablet y escritorio.
- **Criterios de Aceptación:**
  - [ ] Un documento escolar emitido aparece en el explorador.
  - [ ] Un documento laboral aparece en el explorador.
  - [ ] Un archivo adjunto a una solicitud aparece relacionado con ella.
  - [ ] Un mismo documento puede localizarse desde su expediente y desde su categoría sin duplicarse.
  - [ ] Los filtros pueden combinarse.
  - [ ] La búsqueda por CUV y número correlativo funciona.
  - [ ] La previsualización y descarga respetan los permisos.
  - [ ] Un usuario no puede consultar documentos de expedientes ajenos a su ámbito de autorización.
  - [ ] El explorador identifica correctamente documentos pendientes, firmados, vencidos y archivados.
  - [ ] La consulta no depende de que los archivos permanezcan en una carpeta física con un nombre determinado.
- **Estado:** [ ] Pendiente

---

### [ ] [F22-Task06] Gestión de múltiples firmantes y enrutamiento secuencial o paralelo
- **Origen del Hallazgo:** `AUDITORIA_FASE_22_GESTION_DOCUMENTAL_FORMULARIOS_FIRMA_ELECTRONICA.md` / Sección E (F22-17), Sección D y Plan de Trabajo TAREA 22-06
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Contratos con firma de ambos padres, convenios laborales firmados por director y docente, y aprobaciones encadenadas)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs` (`submitAuthorizationRequest`, `respondToAuthorizationRequest`, `registerDocumentSignature`)
  - `SolicitudesAutorizacion`
  - `FirmasConformidades`
- **Dependencias Expuestas:** `F22-Task02`, `F22-Task03`, `F22-Task04`, solicitudes de autorización, notificaciones y expedientes familiares.
- **Descripción del Alcance:**
  El sistema permite registrar conformidades y gestionar autorizaciones de tutores, pero no dispone de un flujo general para que varios participantes firmen el mismo documento siguiendo un orden o participando simultáneamente.
  Requerimientos Funcionales Detallados:
  1. Configuración de múltiples firmantes por documento:
     - Definir para cada firmante: identidad, rol, relación con el estudiante o proceso, tipo de participación, orden de firma, mecanismo de autenticación y fecha límite.
  2. Modalidades secuencial y paralela:
     - Secuencial: el siguiente firmante recibe la solicitud cuando el anterior completa su firma.
     - Paralela: todos los firmantes autorizados pueden firmar sin esperar a los demás.
     - Permitir combinar ambas modalidades mediante etapas.
     - Soportar procesos como: firma de ambos padres o tutores, firma de tutor y dirección, firma de docente y coordinador, firma de empleado y representante institucional.
  3. Reglas de completitud y enrutamiento:
     - Diferenciar entre: todos los firmantes obligatorios, cualquiera de los firmantes autorizados, o firmantes opcionales.
     - Impedir que un participante firme en nombre de otro sin una autorización válida.
     - Registrar cada actuación individualmente.
     - Permitir rechazar, declinar o cancelar una solicitud.
     - Generar el documento final y certificado de finalización cuando se cumplan las condiciones configuradas.
- **Criterios de Aceptación:**
  - [ ] Se puede configurar un proceso con dos o más firmantes.
  - [ ] El flujo secuencial respeta el orden establecido.
  - [ ] El flujo paralelo permite firmar independientemente.
  - [ ] El sistema identifica qué participantes han firmado y cuáles están pendientes.
  - [ ] Una firma no autorizada es rechazada.
  - [ ] Una firma duplicada no altera el estado del proceso.
  - [ ] La negativa de un firmante produce el resultado configurado.
  - [ ] El documento final contiene todas las firmas requeridas.
  - [ ] El certificado identifica el orden y la fecha de cada firma.
  - [ ] Una transacción incompleta no se presenta como finalizada.
- **Estado:** [ ] Pendiente

---

### [ ] [F22-Task07] Formularios descargables, imprimibles y recepción posterior de documentos escaneados
- **Origen del Hallazgo:** `AUDITORIA_FASE_22_GESTION_DOCUMENTAL_FORMULARIOS_FIRMA_ELECTRONICA.md` / Sección E (F22-07), Sección C (2.6) y Plan de Trabajo TAREA 22-07
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Inclusión digital, atención a familias sin acceso continuo a internet y digitalización física en ventanilla)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `FormulariosInstitucionales`
  - `SolicitudesTramites`
- **Dependencias Expuestas:** Diseñador de formularios, generación PDF, repositorio documental, solicitudes y validación de archivos (`F22-Task01`).
- **Descripción del Alcance:**
  El diseñador de formularios digitales está implementado, pero no se dispone de un flujo completo para descargar formularios en blanco, completarlos manualmente y reincorporarlos al expediente institucional.
  Requerimientos Funcionales Detallados:
  1. Versiones imprimibles de formularios:
     - Permitir generar una versión imprimible de cada formulario institucional.
     - Descargar el formulario en PDF sin respuestas ni datos personales cuando se solicite en blanco.
     - Permitir generar versión personalizada con datos institucionales o del estudiante cuando corresponda.
     - Incorporar identificador único de formulario o trámite, instrucciones de llenado y espacios adecuados para datos, fechas, firmas manuscritas y sellos.
  2. Recepción y carga de documentos completados manualmente:
     - Permitir cargar posteriormente el formulario escaneado o fotografiado desde el portal de secretaría o familiar.
     - Relacionar el archivo recibido con el formulario original, la solicitud, el estudiante y el responsable de recepción.
     - Permitir revisar la legibilidad antes de aceptarlo y mantener el archivo original escaneado.
     - Diferenciar documentos completados manualmente de los completados digitalmente.
     - Permitir que secretaría solicite una corrección o nueva carga cuando el escaneo sea ilegible o incompleto.
- **Criterios de Aceptación:**
  - [ ] Un formulario puede descargarse en blanco en formato PDF limpio y legible.
  - [ ] El PDF conserva su estructura y campos legibles al imprimirse.
  - [ ] Cada descarga puede identificarse mediante un código único.
  - [ ] El formulario escaneado puede cargarse posteriormente.
  - [ ] El archivo queda relacionado con la solicitud original.
  - [ ] Un escaneo ilegible puede devolverse para corrección.
  - [ ] El sistema conserva el archivo original recibido.
  - [ ] Se registra quién lo recibió, cuándo y cuál fue el resultado de la revisión.
  - [ ] El proceso funciona desde dispositivos móviles y computadoras.
- **Estado:** [ ] Pendiente

---

### [ ] [F22-Task08] Generación masiva de documentos oficiales por grado, sección o grupo
- **Origen del Hallazgo:** `AUDITORIA_FASE_22_GESTION_DOCUMENTAL_FORMULARIOS_FIRMA_ELECTRONICA.md` / Sección E (F22-37), Sección C (2.4) y Plan de Trabajo TAREA 22-08
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Productividad en secretaría de fin de año, emisión masiva de diplomas y constancias escolares)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (nueva función `batchGenerateSchoolDocuments`)
  - `PlantillasEscolares`
  - `DocumentosEscolaresEmitidos`
  - `js/teacher.js`
- **Dependencias Expuestas:** Motor de plantillas, CUV, correlativos, expedientes estudiantiles y almacenamiento documental (`F22-Task02`, `LockService`).
- **Descripción del Alcance:**
  La generación documental funciona individualmente, pero no permite emitir eficientemente documentos oficiales para grupos completos de estudiantes en secretaría de fin de ciclo.
  Requerimientos Funcionales Detallados:
  1. Emisión por lotes (Batch Processing):
     - Permitir seleccionar un conjunto de estudiantes mediante criterios: Año lectivo, Nivel educativo, Grado, Sección, Jornada, Grupo, o Estado de matrícula.
     - Seleccionar el tipo de documento y la plantilla que se utilizará.
     - Generar un documento independiente para cada estudiante completando las variables con sus datos particulares.
     - Asignar un correlativo independiente y un CUV único a cada documento del lote.
     - Evitar duplicados cuando se repita una operación por error mediante claves de idempotencia.
     - Permitir excluir estudiantes que no cumplan los requisitos de emisión (ej. retención de notas por morosidad o expediente incompleto).
  2. Experiencia de procesamiento y descarga:
     - Mostrar vista previa y resumen antes de confirmar la operación.
     - Procesar lotes grandes sin bloquear la interfaz mostrando progreso individual y general.
     - Permitir descargar los documentos individualmente o agrupados en un archivo comprimido ZIP.
     - Registrar el resultado de cada documento, separando documentos exitosos de los que presenten errores.
     - Permitir reanudar una operación interrumpida sin duplicar documentos ya emitidos.
- **Criterios de Aceptación:**
  - [ ] Se puede seleccionar un grado y sección completos.
  - [ ] Se genera un documento por cada estudiante elegible.
  - [ ] Cada documento contiene los datos del alumno correspondiente.
  - [ ] No se repiten CUV ni números correlativos.
  - [ ] Un error individual no invalida los documentos correctamente generados del lote.
  - [ ] Se puede consultar el resultado de cada elemento del lote.
  - [ ] Una operación interrumpida puede reanudarse sin duplicaciones.
  - [ ] Los documentos pueden descargarse individualmente y en conjunto (ZIP).
  - [ ] El historial identifica quién ejecutó la emisión y cuándo.
- **Estado:** [ ] Pendiente

---

### [ ] [F22-Task09] Compatibilidad con las plantillas oficiales de cuadros de calificaciones de SACE
- **Origen del Hallazgo:** `AUDITORIA_FASE_22_GESTION_DOCUMENTAL_FORMULARIOS_FIRMA_ELECTRONICA.md` / Sección E, Sección G y Plan de Trabajo TAREA 22-09
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Compatibilidad con el sistema educativo oficial SACE de Honduras, llenado exacto de calificaciones y preservación de formato)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs` (`fillAndExportSACETemplate`, `validateSACETemplateFile`, `verifySACETemplateCompatibility`)
  - `js/teacher.js` (Cuadro de Calificaciones)
  - Archivos Excel oficiales SACE en repositorio
- **Dependencias Expuestas:** Cuadro de calificaciones docente, registros académicos, matrícula, asignaturas, grados y secciones, repositorio de plantillas SACE y mecanismo de procesamiento de archivos Excel.
- **Descripción del Alcance:**
  La plataforma administra calificaciones académicas, pero necesita exportar los resultados al formato oficial de cuadros de calificaciones de SACE completando correctamente el archivo oficial que el docente utiliza y entrega, sin reconstruirlo desde cero ni alterar su estructura original.
  Requerimientos Funcionales Detallados:
  1. Análisis y mapeo de las plantillas oficiales de SACE:
     - Localizar y examinar los archivos de cuadros de SACE disponibles en el repositorio.
     - Analizar cada archivo para determinar: hojas de cálculo incluidas, nombres y distribución, filas y columnas utilizadas, celdas combinadas, encabezados institucionales, centro educativo, año lectivo, grado, sección, jornada, asignatura, identificación del docente, lista de alumnos, columnas de calificaciones por parcial, totales/promedios, fórmulas preexistentes, validaciones de datos, formatos numéricos y áreas protegidas.
     - Determinar exactamente qué dato de la plataforma corresponde a cada celda del archivo oficial.
     - Reconocer las fórmulas que ya incorpora SACE y conservarlas intactas sin sustituirlas por valores estáticos calculados, salvo exigencia expresa de la plantilla.
  2. Reconocimiento y validación del archivo seleccionado:
     - Al seleccionar «Llenar cuadro de SACE» en el menú del cuadro de notas del docente, abrir el selector para elegir el archivo Excel oficial.
     - Analizar el archivo y comprobar: que corresponde a una plantilla SACE reconocida, que el grado coincide con el que califica el docente, que la sección coincide, que la asignatura corresponde, que el año lectivo es correcto y que la lista de alumnos coincide.
     - Si existe incompatibilidad, detener el proceso y explicar exactamente qué dato no coincide.
  3. Correspondencia estricta de alumnos y calificaciones:
     - Leer la lista de alumnos incluida en el archivo oficial y establecer correspondencia con la plataforma mediante identidad oficial (DNI) o comparación robusta de nombres (manejando mayúsculas, acentos, espacios y orden de apellidos).
     - Nunca asignar una calificación basándose en una coincidencia dudosa de nombres; si no es confiable, solicitar revisión.
     - Detectar alumnos ausentes en SACE o en la plataforma e informar discrepancias.
     - Colocar cada calificación en la celda correspondiente al alumno y parcial.
     - Respetar la escala de calificación; no convertir calificaciones vacías en ceros ni sustituir valores sin advertirlo.
  4. Conservación absoluta del formato del archivo oficial:
     - Modificar exclusivamente las celdas de calificaciones y datos autorizados del mapeo.
     - Conservar: nombre original del archivo, estructura y orden de hojas, celdas combinadas, fuentes, tamaños, bordes, colores, anchos de columna, fórmulas, configuración de impresión y áreas de impresión.
     - Prohibido convertir a CSV/PDF para reconstruir como Excel ni generar archivos nuevos con apariencia aproximada.
  5. Descarga automática del archivo completado:
     - Al terminar, iniciar automáticamente la descarga del archivo completado conservando el nombre original exacto, formato y extensión.
     - Mostrar confirmación con resumen de alumnos identificados y notas colocadas, advirtiendo si quedaron elementos sin correspondencia.
- **Criterios de Aceptación:**
  - [ ] Se identifican y analizan las plantillas SACE existentes en el repositorio documentando el mapeo.
  - [ ] La opción «Llenar cuadro de SACE» aparece en el menú de acciones del cuadro de calificaciones.
  - [ ] El sistema identifica asignatura, grado, sección y año lectivo del archivo seleccionado.
  - [ ] Se rechaza un archivo correspondiente a otra asignatura, grado o sección.
  - [ ] Se reconoce correctamente la lista de alumnos que ya contiene el archivo SACE.
  - [ ] Las calificaciones se asignan a los alumnos correctos sin que las vacías se conviertan en cero.
  - [ ] Las fórmulas originales y celdas ajenas al mapeo permanecen intactas.
  - [ ] El archivo conserva su nombre original, formato Excel, hojas, estilos y configuración de impresión.
  - [ ] La descarga comienza automáticamente y el archivo abre en Excel sin advertencias de reparación.
  - [ ] El sistema informa cualquier alumno o calificación que no haya podido procesarse.
- **Estado:** [ ] Pendiente

---

### [ ] [F22-Task10] Administración de versiones y compatibilidad de plantillas SACE
- **Origen del Hallazgo:** `AUDITORIA_FASE_22_GESTION_DOCUMENTAL_FORMULARIOS_FIRMA_ELECTRONICA.md` / Sección E, Sección G y Plan de Trabajo TAREA 22-10
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Gestión de cambios de formato oficial SACE, retrocompatibilidad y mapeo versionado)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - Hoja `PlantillasSACEVerificadas`
- **Dependencias Expuestas:** `F22-Task09`, repositorio de archivos SACE y mecanismo de procesamiento Excel.
- **Descripción del Alcance:**
  Las plantillas oficiales de SACE pueden cambiar entre períodos o años lectivos. Si el sistema utiliza posiciones fijas, una actualización del formato ministerial podría provocar que las notas se escriban en columnas erróneas.
  Requerimientos Funcionales Detallados:
  1. Catálogo versionado de plantillas SACE:
     - Separar el reconocimiento de plantillas de la escritura de calificaciones.
     - Registrar en `PlantillasSACEVerificadas`: Identificador, Versión, Año lectivo/vigencia, Tipo de cuadro, Grado o nivel aplicable, Asignatura aplicable, Estructura de hojas, Mapeo de celdas (`ColumnasMapJSON`), Reglas de identificación de alumnos y Reglas de conservación.
  2. Validación estructural previa:
     - Detectar cambios en encabezados, posiciones, nombres de hojas y celdas combinadas.
     - Identificar plantillas desconocidas o modificadas; evitar utilizar un mapeo antiguo cuando la estructura no coincida.
     - Permitir probar una plantilla nueva con archivos de ejemplo antes de habilitarla.
     - Mantener disponibles las versiones anteriores para procesar cuadros históricos.
- **Criterios de Aceptación:**
  - [ ] Se pueden registrar y administrar distintas versiones de plantillas SACE.
  - [ ] El sistema identifica la versión de la plantilla del archivo seleccionado.
  - [ ] Un archivo modificado de forma incompatible es rechazado con explicación clara.
  - [ ] Una nueva plantilla puede configurarse y probarse sin alterar las existentes.
  - [ ] Cada procesamiento registra la versión del mapeo utilizado.
- **Estado:** [ ] Pendiente

---

## TAREAS DE PRIORIDAD MEDIA (P2 - RECONOCIMIENTO OCR Y EXTRACCIÓN ASISTIDA)

---

### [ ] [F22-Task11] OCR y extracción asistida de información documental
- **Origen del Hallazgo:** `AUDITORIA_FASE_22_GESTION_DOCUMENTAL_FORMULARIOS_FIRMA_ELECTRONICA.md` / Sección E (F22-30), Sección C (2.22) y Plan de Trabajo TAREA 22-11
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Productividad en secretaría, digitalización ágil y extracción de datos en partidas de nacimiento)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs` (nueva función `extractDocumentDataOCR`)
  - Google Drive OCR API
- **Dependencias Expuestas:** Repositorio documental, validación de archivos, expedientes y servicio OCR.
- **Descripción del Alcance:**
  La plataforma no dispone de reconocimiento óptico de caracteres para extraer información de documentos escaneados, obligando a transcribir manualmente datos de certificados y partidas de nacimiento.
  Requerimientos Funcionales Detallados:
  1. Extracción óptica asistida (OCR):
     - Incorporar OCR para documentos PDF escaneados e imágenes de uso frecuente: Partidas de nacimiento, Certificados de estudio, Identificaciones (DNI), Constancias y Documentos de admisión.
     - Extraer campos configurables: Nombre, Apellidos, Fecha de nacimiento, Número de identidad, Lugar de nacimiento, Nombres de tutores, Fechas de emisión e Institución emisora.
  2. Revisión humana obligatoria:
     - Mostrar los datos extraídos en una interfaz de revisión indicando nivel de confianza o campos dudosos.
     - Permitir corregir manualmente la información.
     - Conservar el documento original y registrar quién confirmó los datos.
     - Prohibir taxativamente sobrescribir información institucional existente sin autorización y confirmación humana.
- **Criterios de Aceptación:**
  - [ ] Se puede procesar un PDF escaneado o imagen de documento oficial.
  - [ ] Los datos extraídos se presentan en pantalla para revisión previa.
  - [ ] Los campos dudosos se identifican visualmente.
  - [ ] La persona autorizada puede corregir los resultados antes de guardar.
  - [ ] No se modifican registros institucionales sin confirmación humana explícita.
  - [ ] El documento original permanece íntegro y disponible.
- **Estado:** [ ] Pendiente

---

### [ ] [F22-Task12] Importación y exportación masiva de documentos y metadatos
- **Origen del Hallazgo:** `AUDITORIA_FASE_22_GESTION_DOCUMENTAL_FORMULARIOS_FIRMA_ELECTRONICA.md` / Sección E (F22-32), Sección C (2.24) y Plan de Trabajo TAREA 22-12
- **Prioridad:** P2
- **Severidad/Clasificación:** Media (Migración de archivos históricos, respaldo masivo y exportación estructurada)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
  - Google Drive API
- **Dependencias Expuestas:** Repositorio documental, expedientes, permisos y almacenamiento de Drive.
- **Descripción del Alcance:**
  La importación y exportación documental está parcialmente implementada y no proporciona un mecanismo completo para migrar, consultar o administrar grandes volúmenes de documentos institucionales.
  Requerimientos Funcionales Detallados:
  1. Importación masiva con metadatos:
     - Permitir importar documentos acompañados de sus metadatos desde archivos estructurados (CSV y XLSX): Identificador del estudiante/empleado, Tipo documental, Categoría, Fecha, Descripción, Estado y Relación con expediente.
     - Asociar los archivos físicos con los registros importados validando relaciones e identificadores.
     - Detectar duplicados por hash SHA-256 e identificadores.
     - Mostrar vista previa de los registros antes de confirmar.
  2. Exportación masiva y respaldos:
     - Permitir exportar listados de metadatos según filtros y permisos RBAC.
     - Descargar documentos seleccionados individualmente o en archivo comprimido ZIP.
     - Registrar el resultado de cada importación y permitir reanudar procesos interrumpidos sin duplicar registros.
- **Criterios de Aceptación:**
  - [ ] Se pueden importar metadatos desde archivos CSV o XLSX.
  - [ ] Los archivos físicos se asocian con los registros correspondientes.
  - [ ] Se detectan y alertan registros duplicados por hash.
  - [ ] Los errores se muestran claramente antes de confirmar la importación.
  - [ ] Se exporta información filtrada respetando estrictamente los permisos.
  - [ ] Las operaciones interrumpidas pueden recuperarse sin duplicar información.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ASEGURAMIENTO Y CALIDAD (P0 - SUITE INTEGRAL DE REGRESIÓN DE GESTIÓN DOCUMENTAL Y SACE)

---

### [ ] [F22-Task13] Suite de pruebas automatizadas y regresión integral de la Fase 22
- **Origen del Hallazgo:** `AUDITORIA_FASE_22_GESTION_DOCUMENTAL_FORMULARIOS_FIRMA_ELECTRONICA.md` / Sección G (P0), Sección F y Plan de Trabajo TAREA 22-13
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Aseguramiento continuo de emisión CUV, correlativos seguros, firmas, compatibilidad SACE y no regresión)
- **Archivos Involucrados:**
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/developer-service/Code.gs`
  - `tests/regression/academic-grading-suite.js`
- **Dependencias Expuestas:** Todas las tareas de la Fase 22 (`F22-Task01` a `F22-Task12`), suites de pruebas del ecosistema institucional.
- **Descripción del Alcance:**
  Implementar la suite integral automatizada `runPhase22DocumentManagementAndSACERegressionSuite` que valide de manera continua la generación documental con CUV, concurrencia, validación binaria, hash criptográfico de firmas, explorador documental, flujos de aprobación y procesamiento exacto de cuadros oficiales SACE sin regresión de las fases anteriores.
  Requerimientos Funcionales Detallados:
  1. Batería de pruebas automatizadas:
     - Documentos y almacenamiento: generación de documentos, correlativos anuales, CUV único, concurrencia con `LockService`, versionado de plantillas v1.0/v1.1, validación binaria de archivos (Magic Bytes) y recuperación documental.
     - Formularios y trámites: creación de formularios con definición JSON, envío de solicitudes, adjuntos en Drive, revisión y aprobación de trámites, rechazo justificado, vencimientos y trazabilidad.
     - Firmas: aceptación simple, cálculo de hash SHA-256, verificación de integridad, certificado de finalización de firma, múltiples firmantes secuenciales/paralelos y detección de documentos modificados.
     - Explorador documental: búsqueda por CUV/correlativo, filtros combinados, previsualización y aislamiento RBAC/ABAC entre expedientes.
     - Cuadros SACE: reconocimiento de plantillas oficiales en repositorio, validación de asignatura/grado/sección, correspondencia estricta de alumnos sin ceros automáticos, conservación absoluta de fórmulas, estilos y áreas de impresión, y descarga automática.
  2. No regresión del ecosistema:
     - Verificar que las nuevas implementaciones no alteren registros de producción ni deterioren las 53 pruebas de regresión previas de las Fases 9, 10, 11, 15, 16, 17, 18, 19, 20 y 21.
- **Criterios de Aceptación:**
  - [ ] Las pruebas de generación CUV y correlativos se ejecutan correctamente garantizando unicidad.
  - [ ] Las pruebas de integridad criptográfica detectan documentos alterados.
  - [ ] Las pruebas de permisos detectan y bloquean accesos no autorizados a expedientes.
  - [ ] Las pruebas de flujos verifican todos los estados y transiciones válidas.
  - [ ] Las pruebas SACE verifican las celdas y notas de cada alumno preservando el formato original del libro Excel.
  - [ ] Las funcionalidades previamente verificadas mantienen su comportamiento y las 53 pruebas previas se mantienen aprobadas al 100%.
- **Estado:** [ ] Pendiente

---

## FASE 23 — MOTOR INSTITUCIONAL DE FLUJOS DE TRABAJO Y ARQUITECTURA DISTRIBUIDA MULTICUENTA

### P0 — PRIORIDAD CRÍTICA

### [F23-Task01] [P0] [Motor de Workflows - Integridad Transaccional, Candados Atómicos y Autorización de Decisiones]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `js/api.js`
- **Dependencias Expuestas:** `SolicitudesTramites`, `RevisionesDecisionesTramite`, `FlujosAprobacion`, `LockService`.
- **Capacidades Relacionadas:** F23-002, F23-013, F23-014.
- **Problema Detectado:**
  El procesamiento de decisiones de aprobación presenta riesgos de concurrencia y validación insuficiente de las transiciones. Dos revisores podrían intentar resolver simultáneamente una misma etapa. Además, la secuencia de aprobación no debe depender de información proporcionada por el cliente, como `siguienteAsignadoA` o `nuevoEstadoSolicitud`.
- **Requisitos Funcionales:**
  1. Proteger las decisiones mediante mecanismos de exclusión mutua adecuados (`LockService.getScriptLock()`) para evitar que dos operaciones modifiquen simultáneamente el mismo trámite.
  2. Antes de aceptar una decisión, recuperar el estado actual de la solicitud y comprobar que coincide con el estado esperado.
  3. Identificar la etapa activa a partir de la definición y el estado persistido del workflow.
  4. Validar que el usuario autenticado sea el responsable autorizado de esa etapa o pertenezca al grupo de aprobadores habilitados.
  5. Comprobar que la operación solicitada esté permitida para el estado actual.
  6. Impedir que el cliente determine libremente el siguiente responsable, la siguiente etapa o el estado final.
  7. Calcular las transiciones en el servidor utilizando la definición vigente del flujo.
  8. Impedir que una decisión se aplique dos veces.
  9. Registrar la decisión y actualizar el estado de la solicitud de manera consistente.
  10. Registrar quién realizó la operación, cuándo, sobre qué etapa y cuál fue su resultado.
  11. Diferenciar los errores de autorización, conflicto de estado, duplicación y fallo de almacenamiento.
- **Comportamiento Esperado:**
  Cuando dos revisores intenten resolver la misma solicitud simultáneamente, solamente una operación válida podrá completar la transición. La segunda deberá recibir un resultado de conflicto o de etapa ya resuelta, sin sobrescribir la decisión anterior.
  Una solicitud no podrá avanzar si el usuario no tiene autorización, si la etapa no está activa o si no se cumplen sus precondiciones.
- **Criterios de Aceptación:**
  - [ ] Ejecutar dos decisiones simultáneas sobre una misma etapa y comprobar que solamente una se registra como decisión efectiva.
  - [ ] Intentar aprobar una etapa desde una cuenta sin autorización y verificar su rechazo.
  - [ ] Manipular los parámetros de siguiente responsable y siguiente estado desde el cliente y comprobar que son ignorados o rechazados en favor de la definición del servidor.
  - [ ] Intentar aprobar una etapa que ya fue resuelta y comprobar detección de conflicto.
  - [ ] Intentar avanzar una solicitud desde un estado anterior inválido.
  - [ ] Simular un error durante el almacenamiento y comprobar que no se produce una transición inconsistente.
  - [ ] Verificar que las decisiones válidas conservan su historial inalterado.
- **Estado:** [ ] Pendiente

---

### [F23-Task02] [P0] [Motor de Workflows - Idempotencia de Solicitudes, Decisiones y Operaciones Institucionales]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `js/api.js`
- **Dependencias Expuestas:** `SolicitudesTramites`, `RevisionesDecisionesTramite`, `F23-Task01`.
- **Capacidades Relacionadas:** F23-002, F23-015, F23-025, F23-026.
- **Problema Detectado:**
  El envío repetido de formularios y las llamadas interservicio pueden generar registros, tareas, decisiones o acciones duplicadas cuando el usuario vuelve a pulsar un botón, pierde la conexión o el servicio no responde a tiempo.
- **Requisitos Funcionales:**
  1. Incorporar identificadores únicos de operación para las solicitudes que puedan repetirse.
  2. Admitir una clave de idempotencia (`Idempotency-Key`) en los envíos de trámites y operaciones sensibles.
  3. Asociar cada clave con el usuario, tipo de operación y resultado correspondiente.
  4. Guardar la relación entre la clave y el registro generado.
  5. Si se recibe nuevamente la misma operación, devolver el resultado previamente registrado cuando corresponda.
  6. Rechazar la reutilización de una misma clave con un contenido diferente.
  7. Controlar la duplicación en las decisiones de aprobación.
  8. Extender la protección a las acciones interservicio y a las tareas generadas por eventos.
  9. Evitar que un reintento genere varias notificaciones o ejecute dos veces una operación externa.
  10. Definir una política de conservación de las claves procesadas.
- **Comportamiento Esperado:**
  Una operación debe poder repetirse técnicamente sin que sus efectos se dupliquen.
  Si una solicitud se registra correctamente, pero la respuesta no llega al navegador, el siguiente intento debe recuperar el resultado original y no crear otro trámite.
- **Criterios de Aceptación:**
  - [ ] Enviar dos veces el mismo formulario con idéntica clave y verificar que se devuelve el mismo resultado sin duplicar registros.
  - [ ] Repetir una solicitud después de una interrupción de conexión y recuperar el trámite original.
  - [ ] Reutilizar una clave con contenido diferente y verificar el rechazo de la solicitud.
  - [ ] Repetir una decisión de aprobación y comprobar que no se duplica la transición.
  - [ ] Repetir una solicitud interservicio y verificar la idempotencia.
  - [ ] Comprobar que no se generan registros ni acciones duplicadas.
  - [ ] Verificar que dos solicitudes legítimas diferentes puedan procesarse independientemente.
- **Estado:** [ ] Pendiente

---

### [F23-Task03] [P0] [Arquitectura Distribuida - Enrutador Universal de Spreadsheets y Resolución Dinámica de Fuentes de Datos]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** `CatalogoSpreadsheets`, `F23-Task04`.
- **Capacidades Relacionadas:** F23-008, F23-009.
- **Problema Detectado:**
  Existe un catálogo de fuentes distribuidas en el servicio contable, pero la resolución de datos no está estandarizada en todos los servicios. Persisten referencias rígidas a `SPREADSHEET_ID`, especialmente en servicios académicos y de usuarios. Esto limita la distribución de información por cuentas, departamentos, dominios y ciclos lectivos.
- **Requisitos Funcionales:**
  1. Establecer un mecanismo común (`resolveSpreadsheetSource`) para resolver la fuente de datos que corresponde a cada operación.
  2. Utilizar el catálogo de fuentes existente como referencia arquitectónica, conservando su funcionalidad y ampliándolo cuando sea necesario.
  3. Permitir registrar múltiples Spreadsheets por:
     - Dominio institucional.
     - Departamento.
     - Área de responsabilidad.
     - Ciclo lectivo.
     - Tipo de información.
     - Cuenta propietaria.
     - Servicio responsable.
  4. Permitir definir una fuente predeterminada cuando no exista una partición específica.
  5. Resolver automáticamente la fuente adecuada según el contexto de la consulta.
  6. Evitar que cada servicio tenga que mantener una tabla independiente de identificadores de Spreadsheets.
  7. Incorporar validaciones de existencia, disponibilidad, autorización y compatibilidad de esquema.
  8. Permitir registrar versiones de esquema.
  9. Detectar fuentes inexistentes, deshabilitadas, duplicadas o incompatibles.
  10. Mantener referencias históricas a las fuentes utilizadas por registros y operaciones anteriores.
  11. Permitir agregar nuevas fuentes sin modificar manualmente todas las funciones que consultan información.
- **Comportamiento Esperado:**
  Cuando un módulo solicite información de un dominio y ciclo lectivo determinados, el enrutador deberá identificar la fuente correspondiente y proporcionar acceso únicamente si el servicio tiene autorización.
  La ausencia de una fuente no debe provocar una lectura silenciosa desde un Spreadsheet incorrecto.
- **Criterios de Aceptación:**
  - [ ] Registrar fuentes de diferentes dominios y ciclos lectivos.
  - [ ] Resolver fuentes desde los servicios académico, usuario y contable de manera transparente.
  - [ ] Comprobar que un ciclo lectivo no consulte datos de otro ciclo sin autorización explícita.
  - [ ] Intentar consultar una fuente inexistente y verificar el manejo seguro del error.
  - [ ] Deshabilitar una fuente y comprobar que se rechaza su utilización.
  - [ ] Registrar una nueva partición sin tener que modificar cada consumidor.
  - [ ] Comprobar la compatibilidad de esquemas entre particiones.
  - [ ] Verificar que las referencias históricas no cambian al registrar nuevas fuentes.
- **Estado:** [ ] Pendiente

---

### [F23-Task04] [P0] [Arquitectura Distribuida - Catálogo Institucional de Cuentas, Servicios y Permisos Distribuidos]
- **Componentes Afectados:**
  - `backend/developer-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `CatalogoServicios`, `CatalogoSpreadsheets`, `F23-Task03`.
- **Capacidades Relacionadas:** F23-023, F23-024, F23-008, F23-009.
- **Problema Detectado:**
  El catálogo actual de Spreadsheets y el registro de microservicios no proporcionan todavía una administración suficientemente completa de los servicios distribuidos y sus cuentas propietarias. La plataforma debe admitir que diferentes roles o departamentos administren sus propios proyectos Apps Script y sus propios archivos de almacenamiento, sin que la división de cuentas impida la comunicación institucional.
- **Requisitos Funcionales:**
  1. Ampliar el catálogo central para registrar cada servicio distribuido.
  2. Asociar cada servicio con:
     - Identificador único.
     - Departamento o rol responsable.
     - Cuenta propietaria.
     - Proyecto Apps Script.
     - Endpoint desplegado.
     - Spreadsheet asociado.
     - Dominio de datos.
     - Estado de disponibilidad.
     - Versión del contrato de comunicación.
     - Permisos concedidos.
  3. Permitir que un responsable registre un servicio bajo su cuenta de Google.
  4. Permitir que un responsable registre o asocie su Spreadsheet.
  5. Establecer relaciones entre los servicios y los recursos que administran.
  6. Permitir registrar varios servicios para un mismo departamento cuando sea necesario.
  7. Permitir que un servicio atienda más de un dominio de información si sus permisos lo autorizan.
  8. Incorporar estados de servicio: registrado, activo, degradado, desconectado, suspendido y retirado.
  9. Permitir habilitar y revocar relaciones de comunicación.
  10. Conservar el historial de cambios de propietario, responsables, endpoints y recursos.
  11. Detectar servicios duplicados y registros huérfanos.
- **Comportamiento Esperado:**
  El servicio central debe conocer qué servicios existen, quién los administra, qué datos gestionan y qué operaciones están autorizados a realizar.
  La incorporación de un nuevo departamento no debe requerir reconstruir manualmente la arquitectura de comunicación.
- **Criterios de Aceptación:**
  - [ ] Registrar servicios de al menos dos cuentas de Google diferentes.
  - [ ] Asociar a cada servicio su propio Spreadsheet.
  - [ ] Consultar los servicios registrados desde el servicio central.
  - [ ] Revocar un servicio sin eliminar su historial ni romper auditorías.
  - [ ] Cambiar el responsable y verificar las autorizaciones actualizadas.
  - [ ] Intentar registrar un servicio duplicado y verificar su rechazo.
  - [ ] Consultar un servicio suspendido y comprobar que se bloquean peticiones.
  - [ ] Comprobar que los permisos de almacenamiento y los privilegios institucionales se administran por separado.
- **Estado:** [ ] Pendiente

---

### [F23-Task05] [P0] [Seguridad y Red - Protocolo Universal de Comunicación Interservicio y Gestión de Credenciales]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** `F23-Task04`.
- **Capacidades Relacionadas:** F23-010, F23-023, F23-025, F23-029.
- **Problema Detectado:**
  Existe comunicación mediante HMAC-SHA256, pero la autenticación y autorización no están estandarizadas para todos los servicios. La utilización de claves estáticas compartidas aumenta el riesgo de exposición y dificulta la revocación selectiva.
- **Requisitos Funcionales:**
  1. Establecer un protocolo común de comunicación entre los servicios.
  2. Identificar de manera inequívoca al servicio emisor y receptor.
  3. Firmar las solicitudes utilizando HMAC-SHA256 cuando corresponda al mecanismo de autenticación adoptado.
  4. Incluir identificador de solicitud, fecha de emisión, identificador de correlación y protección contra repetición.
  5. Validar la firma antes de ejecutar operaciones.
  6. Implementar control de vigencia de solicitudes.
  7. Gestionar secretos fuera del código fuente y del navegador (`PropertiesService`).
  8. Incorporar rotación de claves sin interrumpir innecesariamente la comunicación.
  9. Permitir revocar credenciales de un servicio sin afectar a los demás.
  10. Establecer permisos por operación, no solamente por servicio.
  11. Separar consultas, modificaciones, operaciones administrativas y acciones sensibles.
  12. Mantener compatibilidad de versiones del protocolo.
  13. Evitar que una respuesta autenticada se interprete automáticamente como una autorización para modificar cualquier recurso.
  14. Validar el contenido y la estructura de cada solicitud y respuesta.
- **Comportamiento Esperado:**
  Un servicio debe poder comunicarse con otro servicio perteneciente a una cuenta diferente, siempre que exista una autorización explícita.
  Un servicio no debe poder suplantar a otro ni utilizar sus credenciales para acceder a operaciones ajenas.
- **Criterios de Aceptación:**
  - [ ] Comunicación autenticada entre dos cuentas diferentes con verificación de firma HMAC.
  - [ ] Rechazar solicitudes sin firma o con firma incorrecta.
  - [ ] Rechazar solicitudes expiradas por tiempo de vigencia.
  - [ ] Rechazar repetición de solicitudes (protección anti-replay).
  - [ ] Ejecutar rotación de credenciales sin interrupción de servicio.
  - [ ] Revocación individual de un servicio específico.
  - [ ] Rechazar intento de ejecutar una operación no autorizada.
  - [ ] Inspeccionar el frontend para comprobar que no contiene secretos ni claves de servicio.
  - [ ] Verificar que los errores no exponen claves ni tokens en texto plano.
- **Estado:** [ ] Pendiente

---

### [F23-Task06] [P0] [Auditoría Criptográfica - Protección de Decisiones Históricas y Auditoría Anti-Manipulación]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `RevisionesDecisionesTramite`, `F23-Task01`, `F23-Task13`.
- **Capacidades Relacionadas:** F23-003, F23-012, F23-028.
- **Problema Detectado:**
  El historial de decisiones está implementado y verificado funcionalmente, pero los registros no disponen de garantías suficientes frente a modificaciones posteriores no autorizadas.
- **Requisitos Funcionales:**
  1. Conservar los registros históricos de decisiones.
  2. Evitar modificaciones y eliminaciones silenciosas de eventos anteriores.
  3. Incorporar un mecanismo de integridad criptográfica.
  4. Evaluar el encadenamiento de hashes entre eventos consecutivos (`hashPrevio`, `hashActual`).
  5. Registrar identificador del evento, proceso, actor, operación, fecha y datos relevantes.
  6. Permitir verificar la integridad de una secuencia histórica mediante una función de auditoría.
  7. Registrar intentos de modificación o eliminación no autorizada.
  8. Mantener separados los registros de auditoría y los datos operativos modificables.
  9. Permitir registrar correcciones mediante nuevos eventos vinculados, sin reescribir silenciosamente el historial.
  10. Restringir las operaciones administrativas sobre los registros históricos.
- **Comportamiento Esperado:**
  Si una decisión histórica cambia de manera no autorizada, la verificación de integridad debe detectar la alteración.
  Las correcciones legítimas deben quedar documentadas como nuevos eventos vinculados al registro original.
- **Criterios de Aceptación:**
  - [ ] Crear una secuencia de decisiones encadenadas por hash.
  - [ ] Verificar la integridad matemática de la secuencia histórica.
  - [ ] Modificar un registro histórico de prueba y comprobar que la auditoría detecta la alteración.
  - [ ] Registrar una corrección autorizada como nuevo evento vinculado.
  - [ ] Comprobar que la secuencia histórica conserva todos los eventos originales.
  - [ ] Intentar eliminar registros mediante una cuenta sin privilegios y verificar su bloqueo.
- **Estado:** [ ] Pendiente

---

### P1 — PRIORIDAD ALTA

### [F23-Task07] [P1] [Motor de Workflows - Reglas Configurables, Condiciones y Enrutamiento de Procesos]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `FlujosAprobacion`, `F23-Task01`, `F23-Task10`.
- **Capacidades Relacionadas:** F23-001, F23-005, F23-014.
- **Problema Detectado:**
  Los flujos utilizan estructuras JSON y transiciones predominantemente lineales. La selección de responsables y etapas depende parcialmente de parámetros enviados por el frontend y de lógica de negocio dispersa.
- **Requisitos Funcionales:**
  1. Ampliar la definición de flujos para admitir condiciones evaluables.
  2. Definir reglas mediante operadores controlados:
     - Igualdad y desigualdad.
     - Comparaciones numéricas (mayor, menor, rangos).
     - Comparaciones de fechas.
     - Existencia o ausencia de valores.
     - Condiciones AND y OR compuestas.
     - Combinaciones de condiciones y pertenencia a categorías.
  3. Permitir reglas basadas en datos del trámite, departamento, tipo de operación, monto, ciclo lectivo y rol.
  4. Definir destinos de transición según el resultado de las condiciones.
  5. Permitir establecer aprobadores adicionales según umbrales económicos o de riesgo.
  6. Permitir rutas alternativas por departamento o categoría.
  7. Validar las expresiones antes de guardar el flujo.
  8. Impedir la ejecución de código arbitrario introducido en las condiciones.
  9. Ejecutar la evaluación estrictamente en el servidor.
  10. Registrar qué regla se evaluó y qué resultado produjo en la bitácora.
  11. Definir un comportamiento explícito cuando ninguna condición coincide.
  12. Permitir establecer rutas predeterminadas (fallback routes).
  13. Versionar las reglas junto con la definición del flujo.
- **Comportamiento Esperado:**
  Una operación debe avanzar por la ruta correspondiente a sus datos reales, sin depender de instrucciones manipulables desde el cliente.
  Ejemplo: una requisición que supere un umbral económico deberá incorporar el nivel de aprobación adicional establecido en su configuración.
- **Criterios de Aceptación:**
  - [ ] Crear una regla basada en un monto numérico.
  - [ ] Probar valores inferiores, iguales y superiores al umbral verificando las ramas resultantes.
  - [ ] Crear una regla con compuertas AND y otra con OR.
  - [ ] Comprobar rutas alternativas válidas.
  - [ ] Introducir una condición sintácticamente inválida y verificar su rechazo.
  - [ ] Intentar introducir una expresión ejecutable arbitraria y verificar que es sanitizada.
  - [ ] Modificar los parámetros enviados por el frontend y comprobar que la decisión final depende de las reglas del servidor.
- **Estado:** [ ] Pendiente

---

### [F23-Task08] [P1] [Motor de Workflows - Diseñador Configurable de Flujos y Validación de Estructuras]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `js/api.js`
- **Dependencias Expuestas:** `FlujosAprobacion`, `F23-Task07`, `F23-Task10`.
- **Capacidades Relacionadas:** F23-001, F23-005, F23-021, F23-031.
- **Problema Detectado:**
  Las definiciones de workflow se almacenan como JSON plano en `PasosEtapasJSON`, sin una herramienta visual suficientemente completa para construir y validar procesos complejos.
- **Requisitos Funcionales:**
  1. Proporcionar una interfaz administrativa para configurar procesos sin editar directamente JSON.
  2. Permitir agregar, modificar, eliminar y ordenar etapas.
  3. Definir responsables individuales, roles y departamentos.
  4. Definir estados iniciales, intermedios y terminales.
  5. Configurar transiciones permitidas.
  6. Configurar condiciones y rutas alternativas.
  7. Configurar pasos paralelos.
  8. Configurar tiempos límite y reglas de escalamiento.
  9. Mostrar visualmente el recorrido del proceso.
  10. Validar que todas las rutas tengan un destino válido.
  11. Detectar etapas sin responsables asignados.
  12. Detectar rutas sin salida y ciclos involuntarios.
  13. Detectar estados terminales inaccesibles.
  14. Permitir guardar borradores sin activar inmediatamente el flujo.
  15. Proporcionar una vista previa de ejecución con datos de prueba.
  16. Generar una definición estructurada compatible con el motor de ejecución.
  17. Mantener compatibilidad con los workflows existentes.
  18. Permitir consultar y comparar versiones anteriores.
- **Comportamiento Esperado:**
  El administrador podrá configurar un proceso desde una interfaz visual, validarlo y publicarlo sin tener que modificar código fuente.
  La definición resultante deberá ser interpretada por el mismo motor común, no por un ejecutor independiente.
- **Criterios de Aceptación:**
  - [ ] Crear un flujo completo desde la interfaz.
  - [ ] Agregar y reorganizar etapas secuenciales y condicionales.
  - [ ] Configurar responsables y condiciones evaluables.
  - [ ] Intentar publicar una ruta incompleta y verificar advertencias de validación.
  - [ ] Visualizar el recorrido del diagrama de flujo.
  - [ ] Ejecutar una prueba de simulación con datos de prueba.
  - [ ] Publicar una nueva versión y comprobar que las instancias anteriores conservan su definición original.
- **Estado:** [ ] Pendiente

---

### [F23-Task09] [P1] [Bandeja de Entrada - Bandeja Unificada de Trabajo Institucional]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `js/api.js`
- **Dependencias Expuestas:** `F23-Task02`, `F23-Task07`, `F23-Task15`.
- **Capacidades Relacionadas:** F23-004, F23-016, F23-022, F23-030.
- **Problema Detectado:**
  Las tareas, aprobaciones y solicitudes se encuentran distribuidas entre diferentes registros y módulos. No existe una bandeja consolidada que permita conocer las responsabilidades pendientes de cada usuario.
- **Requisitos Funcionales:**
  1. Consolidar las tareas provenientes de los diferentes módulos.
  2. Incorporar aprobaciones pendientes, trámites, revisiones, solicitudes administrativas y otras actividades que utilicen el motor común.
  3. Crear una vista personal según el usuario autenticado.
  4. Crear una vista departamental según sus permisos.
  5. Diferenciar las tareas asignadas directamente de las tareas disponibles para un grupo o rol.
  6. Mostrar:
     - Tipo de actividad.
     - Descripción.
     - Proceso relacionado.
     - Solicitante.
     - Responsable.
     - Departamento.
     - Prioridad.
     - Estado.
     - Fecha de creación.
     - Fecha límite.
     - Tiempo restante o retraso.
     - Acción disponible.
  7. Incorporar filtros y búsqueda.
  8. Permitir ordenar por prioridad, vencimiento y fecha.
  9. Permitir abrir directamente el trámite original.
  10. Actualizar el estado de las tareas después de cada decisión.
  11. Evitar duplicados al consolidar registros.
  12. Mostrar indicadores de carga por responsable.
  13. Permitir identificar tareas sin asignar y tareas bloqueadas.
- **Mejoras de Experiencia Esperadas:**
  - Indicadores visuales de vencimiento (semáforo de criticidad).
  - Filtros persistentes por estado y departamento.
  - Búsqueda por identificador y solicitante.
  - Acceso rápido a las tareas urgentes.
  - Separación entre pendientes personales y departamentales.
  - Identificación clara de tareas que requieren acción y tareas informativas.
- **Criterios de Aceptación:**
  - [ ] Crear tareas desde dos módulos diferentes (ej. compras y trámites escolares).
  - [ ] Comprobar que ambas aparecen en la bandeja correspondiente del revisor.
  - [ ] Verificar que cada usuario visualiza únicamente las actividades autorizadas.
  - [ ] Reasignar una tarea y comprobar la actualización inmediata de la bandeja.
  - [ ] Completar una tarea y verificar su retiro de la bandeja de pendientes.
  - [ ] Aplicar filtros simultáneos y verificar ordenamiento.
  - [ ] Verificar que una misma actividad no aparece duplicada.
- **Estado:** [ ] Pendiente

---

### [F23-Task10] [P1] [Motor de Workflows - Procesos Paralelos y Compuertas de Convergencia (Fork / Join)]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `FlujosAprobacion`, `F23-Task07`, `F23-Task08`.
- **Capacidades Relacionadas:** F23-021, F23-001, F23-005.
- **Problema Detectado:**
  El motor actual utiliza secuencias lineales. No puede representar adecuadamente operaciones que necesitan revisiones simultáneas de varios departamentos.
- **Requisitos Funcionales:**
  1. Permitir dividir un proceso en varias ramas independientes (Fork).
  2. Crear pasos paralelos que puedan ejecutarse simultáneamente por diferentes revisores.
  3. Establecer si se requiere la finalización de todas las ramas o de una cantidad determinada (Join).
  4. Permitir definir reglas AND (todas las ramas aprobadas) y OR (primera rama aprobada).
  5. Registrar el estado individual de cada rama independiente.
  6. Impedir que el proceso principal avance antes de cumplir las condiciones de convergencia.
  7. Permitir que una rama sea rechazada sin perder el historial de las demás.
  8. Definir qué ocurre cuando una rama queda bloqueada o vence.
  9. Permitir que las ramas tengan responsables y departamentos diferentes.
  10. Conservar la relación entre las tareas paralelas y el proceso principal.
- **Comportamiento Esperado:**
  Una solicitud puede enviarse simultáneamente a dos departamentos (ej. Dirección y Administración). El proceso continuará cuando se cumpla la condición configurada.
- **Criterios de Aceptación:**
  - [ ] Crear dos ramas paralelas sobre un mismo trámite.
  - [ ] Completar solamente una rama y comprobar que el proceso no avanza cuando se requiere compuerta AND.
  - [ ] Completar ambas ramas y comprobar la convergencia y avance al siguiente estado.
  - [ ] Probar una condición de convergencia OR.
  - [ ] Rechazar una rama y comprobar la propagación del rechazo según las reglas del flujo.
  - [ ] Simular una rama bloqueada y verificar aislamiento.
  - [ ] Comprobar que no se dupliquen las etapas posteriores a la convergencia.
- **Estado:** [ ] Pendiente

---

### [F23-Task11] [P1] [Operaciones y SLA - Gestión de SLA, Vencimientos y Escalamiento Automático]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `SolicitudesTramites`, `F23-Task09`, `F23-Task15`.
- **Capacidades Relacionadas:** F23-006, F23-012, F23-027, F23-030.
- **Problema Detectado:**
  No existe un mecanismo completo para controlar los tiempos de respuesta de las etapas ni para escalar automáticamente los trámites estancados.
- **Requisitos Funcionales:**
  1. Configurar tiempos máximos por tipo de trámite y etapa (SLA en horas o días hábiles).
  2. Permitir establecer plazos por departamento y nivel de prioridad.
  3. Definir calendarios y horarios laborales cuando sean necesarios.
  4. Establecer anticipación de recordatorios antes del vencimiento.
  5. Configurar escalamiento por incumplimiento hacia el supervisor jerárquico.
  6. Notificar al responsable antes del vencimiento.
  7. Notificar al supervisor cuando se incumpla el SLA.
  8. Permitir reasignación automática cuando exista una regla autorizada.
  9. Registrar el momento en que comienza y termina cada etapa.
  10. Calcular tiempos de espera y tiempos efectivos de atención.
  11. Excluir periodos suspendidos cuando la política lo permita.
  12. Evitar que tareas finalizadas continúen generando alertas.
  13. Controlar la ejecución repetida de los procesos de revisión de vencimientos mediante temporizadores GAS.
- **Comportamiento Esperado:**
  Los procesos deben poder supervisarse mediante plazos configurables. Una tarea vencida debe identificarse y generar las acciones de escalamiento establecidas.
  Los temporizadores deben tolerar retrasos de ejecución propios de los activadores y no asumir que una tarea programada se ejecuta exactamente en el segundo previsto.
- **Criterios de Aceptación:**
  - [ ] Configurar un SLA para una etapa de trámite.
  - [ ] Crear una tarea con vencimiento asignado.
  - [ ] Comprobar emisión de recordatorios preventivos.
  - [ ] Simular vencimiento de plazo y verificar escalamiento automático.
  - [ ] Completar la tarea antes del vencimiento y verificar que no se generen alertas posteriores.
  - [ ] Ejecutar dos veces el proceso de revisión periódica y comprobar que no se duplican los escalamientos.
- **Estado:** [ ] Pendiente

---

### [F23-Task12] [P1] [Resiliencia - Sistema de Reintentos, Colas y Recuperación de Operaciones Interservicio]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** `F23-Task02`, `F23-Task05`, `F23-Task14`.
- **Capacidades Relacionadas:** F23-011, F23-025, F23-026.
- **Problema Detectado:**
  La comunicación actual dispone de un fallback local limitado, pero no existe una política general de reintentos y recuperación para todos los servicios distribuidos.
- **Requisitos Funcionales:**
  1. Incorporar una cola persistente de operaciones pendientes en Google Sheets.
  2. Registrar cada operación con identificador único y estado (`Pendiente`, `EnProceso`, `Fallido`, `Completado`).
  3. Diferenciar errores temporales (red, timeouts) de errores permanentes (403 Forbidden, 400 Bad Request).
  4. Implementar retroceso exponencial (`exponential backoff`) con variación aleatoria (`jitter`).
  5. Establecer un máximo de intentos configurables.
  6. Respetar los tiempos de espera de cada servicio.
  7. Evitar reintentos simultáneos excesivos que saturen las cuotas.
  8. Permitir reanudar operaciones después de una interrupción de ejecución.
  9. Identificar operaciones que requieren intervención administrativa (Dead Letter Queue).
  10. Permitir reintentos manuales autorizados desde panel administrativo.
  11. Evitar que una respuesta tardía genere duplicaciones de datos.
  12. Incorporar una bandeja de operaciones fallidas o pendientes de recuperación.
  13. Registrar el resultado de cada intento en la bitácora.
  14. Incorporar mecanismos de aislamiento temporal (Circuit Breaker) para servicios que presentan fallos repetidos.
  15. Permitir restablecer la comunicación cuando el servicio vuelva a estar disponible.
- **Comportamiento Esperado:**
  Cuando un servicio no responda, la operación deberá permanecer registrada como pendiente o fallida, según corresponda. El sistema podrá recuperarla sin volver a ejecutar acciones ya completadas.
- **Criterios de Aceptación:**
  - [ ] Simular timeout de red y verificar encolamiento en reintentos.
  - [ ] Simular error temporal y comprobar retroceso exponencial.
  - [ ] Simular error permanente y comprobar que no se reintenta indefinidamente.
  - [ ] Comprobar el número máximo de intentos configurados.
  - [ ] Restablecer el servicio caído y reprocesar la operación con éxito.
  - [ ] Comprobar que no se duplican los efectos de una operación completada.
  - [ ] Verificar que una operación irrecuperable queda marcada para intervención manual.
- **Estado:** [ ] Pendiente

---

### [F23-Task13] [P1] [Observabilidad - Registro Estructurado y Trazabilidad Universal de Eventos con Correlation ID]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** `F23-Task05`.
- **Capacidades Relacionadas:** F23-003, F23-012, F23-025, F23-028.
- **Problema Detectado:**
  Existe registro de eventos y correlation ID, pero no se ha estandarizado su propagación ni su relación con todas las operaciones del motor.
- **Requisitos Funcionales:**
  1. Estandarizar la estructura de eventos de auditoría institucional.
  2. Incluir identificador de evento único.
  3. Incluir identificador de proceso o trámite.
  4. Incluir `correlationId` propagado universalmente en el payload.
  5. Identificar el servicio emisor y el servicio receptor.
  6. Identificar al usuario o proceso automatizado que originó el evento.
  7. Registrar fecha y hora precisa en formato ISO 8601.
  8. Registrar operación, resultado y severidad (`INFO`, `WARN`, `ERROR`, `SECURITY`).
  9. Registrar errores y trazas de excepción sanitizadas.
  10. Propagar el `correlationId` a todos los servicios involucrados en una transacción.
  11. Permitir consultar el recorrido completo de una operación distribuida a través de su identificador de correlación.
  12. Separar los eventos operativos de los datos de negocio sensibles.
  13. Evitar almacenar credenciales, contraseñas, secretos o información confidencial en los logs.
  14. Permitir filtrar eventos por proceso, servicio, usuario, severidad y rango de fechas.
- **Comportamiento Esperado:**
  Una operación que atraviese varios servicios debe poder reconstruirse íntegramente utilizando su identificador de correlación.
- **Criterios de Aceptación:**
  - [ ] Ejecutar una operación entre varios microservicios.
  - [ ] Consultar todos sus eventos y verificar que comparten el mismo `correlationId`.
  - [ ] Simular un error en un servicio secundario y verificar su registro correlacionado.
  - [ ] Comprobar que los logs no exponen credenciales ni secretos.
  - [ ] Consultar eventos filtrados por servicio, severidad y periodo.
- **Estado:** [ ] Pendiente

---

### [F23-Task14] [P1] [Rendimiento - Procesamiento Asíncrono y Ejecución por Lotes de Operaciones Pesadas]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** `F23-Task12`, `F23-Task13`.
- **Capacidades Relacionadas:** F23-011, F23-025, F23-026.
- **Problema Detectado:**
  Las transiciones pueden ejecutar acciones pesadas dentro de la misma llamada `doPost`, aumentando el riesgo de superar los límites de ejecución de Apps Script (6 minutos).
- **Requisitos Funcionales:**
  1. Separar la confirmación de una transición de las acciones secundarias que pueden diferirse (notificaciones por correo, generación de reportes, emisión de asientos).
  2. Permitir registrar trabajos asíncronos en una cola de despacho.
  3. Dividir operaciones extensas en unidades pequeñas y recuperables.
  4. Incorporar procesamiento por lotes (`batch processing`).
  5. Guardar el avance y puntero de cada trabajo diferido.
  6. Permitir reanudar trabajos interrumpidos por límites de cuota de tiempo.
  7. Establecer límites de procesamiento por ejecución para mantenerse bajo los 6 minutos.
  8. Priorizar operaciones institucionales críticas sobre tareas accesorias.
  9. Evitar que tareas de larga duración bloqueen la respuesta al usuario en el navegador.
  10. Permitir consultar el estado de ejecución de los trabajos asíncronos.
  11. Gestionar errores y reintentos para tareas secundarias fallidas.
  12. Utilizar procesamiento síncrono solamente cuando sea indispensable para garantizar la consistencia inmediata de la operación.
- **Comportamiento Esperado:**
  La aprobación de un trámite debe poder confirmarse sin esperar a que terminen todas las operaciones secundarias, siempre que el contrato del proceso permita ese desacoplamiento.
  Las acciones posteriores deberán quedar registradas y ejecutarse de manera controlada.
- **Criterios de Aceptación:**
  - [ ] Aprobar una operación que genere varias acciones secundarias y comprobar que la respuesta HTTP es inmediata.
  - [ ] Interrumpir deliberadamente un trabajo en ejecución y verificar su reanudación correcta.
  - [ ] Verificar que no se repitan acciones secundarias ya completadas.
  - [ ] Simular una operación que exceda el tiempo de ejecución y comprobar que el estado general refleja el avance pendiente.
- **Estado:** [ ] Pendiente

---

### [F23-Task15] [P1] [Notificaciones - Sistema Centralizado de Notificaciones por Eventos del Workflow]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `F23-Task09`, `F23-Task12`, `F23-Task13`.
- **Capacidades Relacionadas:** F23-016, F23-006, F23-004.
- **Problema Detectado:**
  Las notificaciones están distribuidas en diferentes funciones y no todas las transiciones generan avisos automáticos consistentes.
- **Requisitos Funcionales:**
  1. Centralizar la generación de notificaciones vinculadas a eventos del motor de flujos.
  2. Admitir notificaciones por:
     - Creación de solicitudes.
     - Asignación de tareas.
     - Cambio de responsable o derivación.
     - Aprobación de etapa.
     - Rechazo definitivo.
     - Devolución para correcciones.
     - Vencimiento próximo de SLA.
     - Escalamiento jerárquico.
     - Finalización y resolución del trámite.
     - Error crítico de procesamiento.
  3. Permitir configurar destinatarios por rol, departamento o usuario individual.
  4. Permitir definir plantillas dinámicas con variables de contexto.
  5. Incluir datos contextuales y enlaces directos a la operación.
  6. Diferenciar notificaciones informativas de tareas que requieren acción.
  7. Registrar el estado del envío en la bitácora.
  8. Evitar envíos duplicados de notificaciones.
  9. Permitir configuración de preferencias de notificación para avisos opcionales.
  10. Mantener los avisos obligatorios de seguridad y responsabilidad institucional.
  11. Permitir reintentar entregas fallidas.
  12. Evitar que una notificación enviada se interprete erróneamente como una aprobación de facto.
- **Comportamiento Esperado:**
  Los cambios del proceso generarán notificaciones mediante un mecanismo común, sin que cada módulo implemente su propio sistema aislado.
- **Criterios de Aceptación:**
  - [ ] Crear una solicitud y verificar que se despachan los avisos al asignado.
  - [ ] Aprobar y rechazar una etapa y verificar las notificaciones resultantes.
  - [ ] Simular un error de envío y comprobar que se encola para reintento.
  - [ ] Comprobar que no se envían notificaciones duplicadas ante reintentos.
  - [ ] Verificar que los destinatarios no reciben información ajena a sus permisos de acceso.
- **Estado:** [ ] Pendiente

---

### [F23-Task16] [P1] [Seguridad y Roles - Delegación Temporal de Aprobaciones Integrada con los Workflows]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `F23-Task01`, `F23-Task09`.
- **Capacidades Relacionadas:** F23-007.
- **Problema Detectado:**
  Existe una implementación parcial de delegación, pero no se ha integrado de manera completa con las asignaciones y etapas activas de los procesos.
- **Requisitos Funcionales:**
  1. Permitir delegar temporalmente responsabilidades de aprobación por ausencia o vacaciones.
  2. Definir fecha y hora de inicio y finalización de la delegación.
  3. Permitir establecer el alcance por tipo de operación, monto o departamento.
  4. Identificar al responsable titular original y al usuario delegado.
  5. Validar que el delegado tenga los permisos institucionales necesarios para asumir la responsabilidad.
  6. Aplicar la delegación a las etapas pendientes correspondientes en la bandeja unificada.
  7. Registrar las decisiones tomadas por el delegado diferenciando claramente su identidad de la responsabilidad titular.
  8. Permitir revocar anticipadamente una delegación activa.
  9. Impedir que una delegación vencida continúe autorizando decisiones.
  10. Evitar delegaciones circulares o en cascada no autorizadas.
  11. Permitir configurar si la delegación incluye tareas ya asignadas o solamente tareas nuevas.
- **Comportamiento Esperado:**
  Durante una ausencia autorizada, las aprobaciones podrán continuar sin necesidad de modificar manualmente cada proceso configurado.
- **Criterios de Aceptación:**
  - [ ] Crear una delegación temporal con rango de fechas.
  - [ ] Comprobar la transferencia de autorizaciones a la bandeja del delegado.
  - [ ] Intentar delegar a un usuario sin privilegios suficientes y verificar el rechazo.
  - [ ] Revocar anticipadamente la delegación y comprobar el cese inmediato de privilegios.
  - [ ] Verificar que tras expirar la fecha fin, el delegado ya no puede autorizar trámites.
  - [ ] Consultar el historial de decisiones y comprobar que se identifican tanto el titular como el delegado.
- **Estado:** [ ] Pendiente

---

### [F23-Task17] [P1] [Ciclo de Vida de Trámites - Devolución, Rechazo y Corrección Controlada de Trámites]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `SolicitudesTramites`, `RevisionesDecisionesTramite`, `F23-Task01`, `F23-Task07`.
- **Capacidades Relacionadas:** F23-018, F23-014.
- **Problema Detectado:**
  Las devoluciones están implementadas parcialmente y las observaciones no siempre son obligatorias.
- **Requisitos Funcionales:**
  1. Exigir una justificación obligatoria en devoluciones para corrección y rechazos definitivos.
  2. Diferenciar formalmente devolución para corrección (`DEVUELTO_CORRECCION`) de rechazo definitivo (`RECHAZADO`).
  3. Identificar los campos, anexos o documentos que deben corregirse cuando corresponda.
  4. Permitir que el solicitante corrija exclusivamente la información autorizada.
  5. Conservar la versión anterior de la solicitud antes de las correcciones.
  6. Registrar las modificaciones posteriores con trazabilidad de cambios.
  7. Permitir reenviar el trámite a revisión una vez completadas las correcciones.
  8. Determinar qué etapas deben repetirse después de una corrección según las reglas del flujo.
  9. Impedir modificaciones de campos reservados que no corresponden al solicitante.
  10. Notificar al solicitante las observaciones y acciones necesarias de corrección.
- **Comportamiento Esperado:**
  Una solicitud devuelta debe regresar al responsable correspondiente para su corrección, conservando las decisiones y observaciones anteriores.
- **Criterios de Aceptación:**
  - [ ] Intentar devolver una solicitud sin observaciones y comprobar que la operación es rechazada.
  - [ ] Devolver la solicitud con observaciones válidas y verificar el cambio de estado a `Requiere Corrección`.
  - [ ] Corregir la información requerida como solicitante y reenviar a revisión.
  - [ ] Verificar el historial de versiones y decisiones preservando los eventos previos.
  - [ ] Comprobar que las etapas se repiten o reanudan según las reglas configuradas.
- **Estado:** [ ] Pendiente

---

### [F23-Task18] [P1] [Ciclo de Vida de Trámites - Cancelación y Desistimiento de Solicitudes por el Solicitante]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `SolicitudesTramites`, `F23-Task01`, `F23-Task12`.
- **Capacidades Relacionadas:** F23-019.
- **Problema Detectado:**
  No existe una capacidad formal para que el solicitante retire un trámite cuando todavía es posible cancelarlo.
- **Requisitos Funcionales:**
  1. Permitir al solicitante gestionar el desistimiento o cancelación de un trámite propio.
  2. Definir en qué estados iniciales o intermedios se permite el desistimiento voluntario.
  3. Impedir la cancelación cuando la operación ya haya producido efectos irreversibles (ej. pagos aplicados, actas emitidas), salvo procedimiento de reversión formal.
  4. Registrar el motivo detallado del desistimiento.
  5. Notificar a los revisores y responsables involucrados en la etapa activa.
  6. Cancelar automáticamente las tareas pendientes asociadas en la bandeja unificada.
  7. Detener recordatorios, alertas y temporizadores de escalamiento de SLA.
  8. Registrar en auditoría las acciones que ya se habían ejecutado previo a la cancelación.
  9. Permitir que un administrador gestione excepciones justificadas de cancelación.
  10. Mantener el expediente histórico del proceso cancelado con estado `Desistida_Por_Usuario`.
- **Comportamiento Esperado:**
  El solicitante podrá desistir de operaciones pendientes dentro de las condiciones permitidas, sin eliminar los registros ni alterar el historial de auditoría.
- **Criterios de Aceptación:**
  - [ ] Cancelar un trámite recién presentado y comprobar su paso a estado `Desistida_Por_Usuario`.
  - [ ] Intentar cancelar un trámite ya resuelto o aprobado definitivamente y comprobar su bloqueo.
  - [ ] Cancelar un trámite con aprobaciones parciales y verificar la detención de etapas subsiguientes.
  - [ ] Verificar la cancelación y retiro de tareas dependientes en la bandeja unificada.
  - [ ] Comprobar que se detienen los temporizadores y recordatorios de SLA.
  - [ ] Consultar el historial y verificar el registro del motivo de desistimiento.
- **Estado:** [ ] Pendiente

---

### P2 — PRIORIDAD MEDIA

### [F23-Task19] [P2] [Distribución de Carga - Asignación Automática y Reparto Equilibrado de Trabajo]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `F23-Task09`, `F23-Task11`.
- **Capacidades Relacionadas:** F23-022, F23-030, F23-004.
- **Problema Detectado:**
  La asignación de responsables depende de mecanismos manuales y no existe un sistema de distribución equilibrada de tareas.
- **Requisitos Funcionales:**
  1. Permitir definir grupos de responsables elegibles por departamento o rol.
  2. Distribuir tareas automáticamente mediante algoritmo Round-Robin.
  3. Incorporar criterios de carga de trabajo basados en tareas activas por usuario.
  4. Considerar tareas pendientes, vencidas y niveles de prioridad al balancear.
  5. Permitir establecer límites de tareas activas concurrentes por responsable.
  6. Excluir automáticamente a usuarios ausentes, con licencias, inactivos o sin permisos vigentes.
  7. Permitir establecer especialidades o áreas de competencia dentro del grupo.
  8. Permitir ponderar la carga según la complejidad del tipo de trámite.
  9. Registrar el criterio y algoritmo que determinó cada asignación en la bitácora.
  10. Permitir reasignaciones autorizadas por supervisores.
  11. Evitar que dos asignaciones simultáneas excedan los límites máximos de carga.
  12. Permitir que un supervisor modifique la asignación cuando exista una causa justificada.
- **Comportamiento Esperado:**
  Las tareas podrán asignarse automáticamente al responsable elegible con menor carga o siguiendo el criterio de distribución configurado.
- **Criterios de Aceptación:**
  - [ ] Distribuir varias tareas consecutivas mediante Round-Robin y verificar rotación equitativa.
  - [ ] Distribuir tareas considerando la carga actual de trabajo de los revisores.
  - [ ] Excluir de la asignación a un usuario marcado con licencia o inactivo.
  - [ ] Comprobar que se respetan los límites máximos de asignación concurrente.
  - [ ] Ejecutar asignaciones concurrentes y verificar que no se produzcan sobrecargas.
  - [ ] Consultar el registro de auditoría de asignación automática.
- **Estado:** [ ] Pendiente

---

### [F23-Task20] [P2] [Analítica - Métricas, Analítica y Supervisión del Rendimiento de Procesos]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `F23-Task11`, `F23-Task13`.
- **Capacidades Relacionadas:** F23-027, F23-030, F23-012.
- **Problema Detectado:**
  No existe una herramienta suficientemente desarrollada para identificar cuellos de botella, medir tiempos de resolución y supervisar el rendimiento de los departamentos.
- **Requisitos Funcionales:**
  1. Calcular tiempo total de resolución de inicio a fin del trámite.
  2. Calcular tiempo promedio de atención por etapa.
  3. Calcular tiempos de espera en cola antes de ser tomado por el revisor.
  4. Calcular tiempos efectivos de atención activa.
  5. Medir porcentajes de cumplimiento de SLA por departamento y trámite.
  6. Identificar etapas y transiciones que concentran los mayores retrasos (cuellos de botella).
  7. Identificar responsables o departamentos con cargas excesivas o demoras recurrentes.
  8. Medir volúmenes de solicitudes recibidas, aprobadas, rechazadas, devueltas y pendientes.
  9. Permitir filtrar métricas por departamento, ciclo lectivo, tipo de operación y revisor.
  10. Mostrar tendencias históricas y evolución de tiempos de respuesta.
  11. Permitir comparar periodos académicos o meses de gestión.
  12. Identificar procesos que permanecen estancados o bloqueados por dependencias externas.
  13. Exportar resultados en formatos estructurados (CSV/JSON/PDF).
  14. Separar las métricas operativas de datos personales innecesarios para privacidad.
  15. Permitir configurar umbrales de alerta temprana por acumulación de trabajo.
- **Comportamiento Esperado:**
  La dirección y los responsables departamentales podrán identificar qué procesos tardan más, dónde se acumulan las tareas y qué áreas necesitan redistribución de responsabilidades.
- **Criterios de Aceptación:**
  - [ ] Generar procesos de prueba con diferentes tiempos de resolución.
  - [ ] Consultar el cuadro de mando de analítica de procesos y verificar la exactitud de los tiempos calculados.
  - [ ] Comparar rendimiento entre departamentos o etapas.
  - [ ] Filtrar indicadores por ciclo lectivo y tipo de trámite.
  - [ ] Identificar correctamente una etapa con cuello de botella simulado.
  - [ ] Exportar las métricas y comprobar su consistencia con los datos reales.
  - [ ] Verificar los controles RBAC sobre la visualización de analíticas departamentales.
- **Estado:** [ ] Pendiente

---

### [F23-Task21] [P2] [Gestión Documental - Administración Avanzada del Archivo y Conservación de Trámites]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `F23-Task06`, `F23-Task13`.
- **Capacidades Relacionadas:** F23-020.
- **Problema Detectado:**
  El archivo de trámites está implementado parcialmente y su depuración es principalmente manual.
- **Requisitos Funcionales:**
  1. Establecer políticas de conservación y retención por tipo de trámite según directrices institucionales.
  2. Archivar automáticamente los procesos finalizados cuando expire su periodo activo.
  3. Diferenciar formalmente el estado de archivo histórico de la eliminación física de registros.
  4. Mantener acceso de sólo lectura autorizado a los expedientes archivados.
  5. Conservar documentos, firmas digitales y referencias asociadas en almacenamiento seguro.
  6. Permitir búsquedas históricas sobre el archivo pasivo por CUV, fecha o solicitante.
  7. Establecer restricciones estrictas de eliminación física según las leyes de retención aplicables.
  8. Permitir la exportación íntegra de expedientes archivados en paquetes estructurados.
  9. Registrar todas las operaciones de archivo, desarchivo y consulta en la bitácora de seguridad.
  10. Evitar que las tareas de depuración eliminen registros requeridos por otros módulos contables o académicos.
- **Comportamiento Esperado:**
  Los procesos resueltos podrán pasar a un almacenamiento histórico organizado, sin perder su trazabilidad ni sus relaciones institucionales.
- **Criterios de Aceptación:**
  - [ ] Archivar un trámite finalizado y verificar su traslado a la partición o estado de archivo.
  - [ ] Consultar el trámite archivado mediante búsqueda por identificador y verificar lectura correcta.
  - [ ] Comprobar que conserva intactos los documentos adjuntos y las firmas registradas.
  - [ ] Intentar archivar un proceso activo y comprobar que la operación es rechazada.
  - [ ] Ejecutar una política de retención automática y verificar la integridad de las referencias vinculadas.
- **Estado:** [ ] Pendiente

---

### [F23-Task22] [P2] [Monitoreo y Salud - Supervisión de Disponibilidad y Salud de Servicios Distribuidos]
- **Componentes Afectados:**
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** `CatalogoServicios`, `F23-Task04`, `F23-Task05`.
- **Capacidades Relacionadas:** F23-024, F23-026.
- **Problema Detectado:**
  Existe una herramienta de supervisión parcial, pero no ofrece una visión completa de la disponibilidad de todas las cuentas y servicios registrados.
- **Requisitos Funcionales:**
  1. Consultar periódicamente la disponibilidad y latencia de cada microservicio registrado (Health Check).
  2. Verificar la comunicación bidireccional con cada endpoint Apps Script.
  3. Comprobar la validez de la autenticación HMAC y autorizaciones de acceso.
  4. Identificar fallos de acceso o errores de permisos hacia los Spreadsheets subyacentes.
  5. Registrar tiempos de respuesta y latencia de red.
  6. Clasificar el estado del servicio en: `Disponible`, `Degradado`, `Desconectado`, `ErrorAutenticacion`.
  7. Registrar fecha y hora de la última comunicación exitosa con cada nodo.
  8. Identificar patrones de fallos continuos o intermitentes.
  9. Notificar inmediatamente a los administradores ante caídas de servicios críticos.
  10. Mostrar un panel centralizado de salud de infraestructura distribuida en tiempo real.
  11. Permitir consultar el historial cronológico de incidentes por servicio.
  12. Detectar servicios que dejaron de responder tras un nuevo despliegue o rotación de credenciales.
- **Comportamiento Esperado:**
  El administrador podrá identificar qué servicios funcionan, cuáles tienen problemas de autorización y cuáles están completamente desconectados.
- **Criterios de Aceptación:**
  - [ ] Supervisar dos servicios pertenecientes a cuentas de Google diferentes.
  - [ ] Simular la desconexión de uno de ellos y verificar su detección y marcación como `Desconectado`.
  - [ ] Restablecer el servicio y verificar la actualización automática a `Disponible`.
  - [ ] Simular un error de clave HMAC y verificar que se distingue de una caída física de red.
  - [ ] Consultar el panel central de salud y el historial de eventos de disponibilidad.
- **Estado:** [ ] Pendiente

---

### [F23-Task23] [P2] [Rendimiento y Cuotas - Optimización del Motor de Flujos y Consumo de Cuotas de Google Apps Script]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** `F23-Task03`, `F23-Task12`, `F23-Task14`.
- **Capacidades Relacionadas:** F23-011, F23-009, F23-014.
- **Problema Detectado:**
  Las operaciones sincrónicas, las consultas repetidas y el almacenamiento centralizado pueden generar contención, consumo elevado de cuotas y fallos por límites de ejecución.
- **Requisitos Funcionales:**
  1. Medir y supervisar el consumo de recursos por servicio y cuenta propietaria (llamadas `UrlFetchApp`, operaciones `SpreadsheetApp`, triggers).
  2. Registrar tiempos de ejecución de cada endpoint Apps Script.
  3. Reducir lecturas y escrituras redundantes utilizando arreglos en memoria y operaciones por lotes.
  4. Agrupar operaciones compatibles en una única llamada de almacenamiento.
  5. Utilizar caché en memoria (`CacheService`) exclusivamente para datos cuya consistencia eventual sea admisible.
  6. Implementar paginación obligatoria en consultas extensas de trámites y bandejas de trabajo.
  7. Evitar recuperar todas las filas de la hoja para renderizar vistas de pendientes.
  8. Procesar lotes con límites de tamaño adaptativos.
  9. Supervisar bloqueos de concurrencia y tiempos de espera en `LockService`.
  10. Distribuir la carga de I/O entre múltiples particiones de Spreadsheets según el catálogo institucional.
  11. Incorporar indicadores de consumo y alertas tempranas por proximidad al 80% de las cuotas diarias de Google.
  12. Permitir configurar umbrales de advertencia personalizados por servicio.
  13. Diferenciar límites por usuario, por proyecto Apps Script y por cuenta de Google Workspace.
  14. Evitar que la distribución de cuentas se utilice indebidamente para evadir políticas o restricciones de Google.
- **Comportamiento Esperado:**
  El sistema deberá mantener un rendimiento estable, identificar los servicios sobrecargados y distribuir operaciones cuando la arquitectura y las autorizaciones lo permitan.
- **Criterios de Aceptación:**
  - [ ] Ejecutar pruebas de carga sintéticas y medir tiempos de respuesta y llamadas a Google APIs.
  - [ ] Comprobar que las consultas paginadas reducen drásticamente la transferencia de datos innecesarios.
  - [ ] Simular límites de ejecución de 6 minutos y comprobar que los trabajos extensos se fraccionan de forma reanudable.
  - [ ] Comparar métricas de consumo de celdas y tiempo de ejecución antes y después de la optimización.
  - [ ] Verificar que el uso de caché no genera inconsistencias en estados de decisiones críticas.
- **Estado:** [ ] Pendiente

---

### [F23-Task24] [P2] [Gobernanza - Mejora del Versionamiento y Compatibilidad de Definiciones de Workflow]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `FlujosAprobacion`, `F23-Task08`.
- **Capacidades Relacionadas:** F23-001, F23-031.
- **Problema Detectado:**
  El versionamiento secuencial de definiciones ya está implementado y verificado, pero necesita una administración más completa para soportar modificaciones estructurales y procesos en ejecución.
- **Requisitos Funcionales:**
  1. Conservar todas las versiones históricas publicadas de las definiciones de flujo.
  2. Permitir la comparación visual y estructural entre dos versiones de un mismo flujo (Diff de etapas y reglas).
  3. Identificar claramente adiciones, modificaciones y eliminaciones de etapas, responsables y compuertas.
  4. Permitir crear borradores de trabajo (`Borrador`) sin alterar el flujo activo en producción (`Publicado`).
  5. Ejecutar validaciones estructurales completas antes de autorizar la publicación de una nueva versión.
  6. Definir qué versión rige para las nuevas solicitudes iniciadas.
  7. Mantener vinculadas las instancias de trámites en curso a la versión exacta con la que fueron creadas.
  8. Permitir migraciones controladas de instancias activas hacia la nueva versión mediante procedimiento administrativo explícito.
  9. Registrar autor, fecha, hora y justificación de cada cambio de versión.
  10. Impedir que una actualización de configuración altere silenciosamente las reglas de trámites activos.
- **Comportamiento Esperado:**
  Las definiciones podrán evolucionar sin alterar las reglas que gobiernan las instancias que ya están en ejecución.
- **Criterios de Aceptación:**
  - [ ] Publicar una versión 1.0 de un flujo institucional.
  - [ ] Crear un borrador, modificar etapas y publicar la versión 2.0.
  - [ ] Comparar estructuralmente la versión 1.0 con la 2.0 e identificar diferencias.
  - [ ] Iniciar un trámite en v1.0 y otro en v2.0 y verificar que cada uno sigue su propia definición.
  - [ ] Comprobar que los trámites en curso en v1.0 no se ven afectados por la publicación de v2.0.
  - [ ] Ejecutar una migración controlada de prueba con autorización y verificar la actualización del puntero de versión.
- **Estado:** [ ] Pendiente

---

### P3 — PRIORIDAD BAJA

### [F23-Task25] [P3] [Consultas y Trazabilidad - Optimización de Consultas y Visualización del Historial de Procesos]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `RevisionesDecisionesTramite`, `F23-Task13`.
- **Capacidades Relacionadas:** F23-003, F23-020.
- **Problema Detectado:**
  El historial está completo y verificado, pero necesita optimización para consultas extensas y expedientes con numerosos eventos.
- **Requisitos Funcionales:**
  1. Implementar paginación en la consulta de historial de trámites (`getWorkflowHistory`).
  2. Permitir filtrar el historial por etapa, revisor, rango de fechas y tipo de decisión.
  3. Consultar y reconstruir el historial completo de un trámite distribuido entre múltiples particiones.
  4. Presentar con claridad decisiones, fechas, firmas y observaciones registradas.
  5. Separar observaciones públicas (visibles al solicitante) de observaciones internas reservadas.
  6. Permitir localizar el evento de auditoría original a partir de una tarea en la bandeja unificada.
  7. Mantener estricto orden cronológico en la línea de tiempo.
  8. Evitar consultas innecesarias a hojas de cálculo secundarias si no hay eventos registrados.
- **Criterios de Aceptación:**
  - [ ] Consultar expedientes con historiales extensos (> 50 eventos) y verificar paginación fluida.
  - [ ] Aplicar filtros combinados y verificar exactitud de los eventos devueltos.
  - [ ] Comprobar el orden cronológico estricto de las transiciones.
  - [ ] Verificar que los solicitantes no pueden visualizar observaciones internas marcadas como confidenciales.
  - [ ] Comprobar que la paginación no omite ni duplica eventos históricos.
- **Estado:** [ ] Pendiente

---

### [F23-Task26] [P3] [Firmas Institucionales - Optimización de Firmas y Conformidades dentro de los Procesos]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `FirmasConformidades`, `F23-Task06`, `F23-Task24`.
- **Capacidades Relacionadas:** F23-017.
- **Estado de Partida:** Completa y verificada. No requiere reconstrucción.
- **Requisitos Funcionales:**
  1. Conservar el mecanismo existente de registro de firmas y conformidades en `FirmasConformidades`.
  2. Mantener la vinculación estrecha entre firma, documento emitido, usuario firmante, proceso y etapa del workflow.
  3. Preservar los mecanismos de integridad criptográfica existentes (cálculo y validación de hash SHA-256).
  4. Permitir consultar y previsualizar las conformidades firmadas directamente desde el historial del proceso.
  5. Mejorar la presentación visual del estado de firma en la interfaz institucional.
  6. Diferenciar claramente los estados: `Pendiente de Firma`, `Firmado`, `Rechazado`, `Firma Inválida / Revocada`.
  7. Evitar registrar dos veces la misma conformidad sobre una etapa resuelta.
  8. Mantener inalterables las firmas históricas aunque el flujo cambie de versión o estructura.
- **Criterios de Aceptación:**
  - [ ] Firmar digitalmente una etapa de workflow de prueba.
  - [ ] Consultar la conformidad y verificar su vinculación con el documento y la decisión.
  - [ ] Intentar firmar dos veces la misma etapa y comprobar que se bloquea la duplicación.
  - [ ] Publicar una nueva versión del flujo y comprobar que las firmas de instancias previas permanecen válidas.
  - [ ] Verificar que la verificación criptográfica confirma la autenticidad de la firma registrada.
- **Estado:** [ ] Pendiente

---

### [F23-Task27] [P3] [Calidad y Testing - Ampliación de Pruebas Automatizadas de Integración y Regresión]
- **Componentes Afectados:**
  - `backend/developer-service/Code.gs`
  - `tests/regression/academic-grading-suite.js`
- **Dependencias Expuestas:** Todas las tareas implementadas de la Fase 23 (`F23-Task01` a `F23-Task26`).
- **Capacidades Relacionadas:** F23-032 y todas las subcapacidades de la Fase 23.
- **Problema Detectado:**
  La suite de pruebas existente está implementada parcialmente y no cubre suficientemente los escenarios de concurrencia, multicuenta, recuperación y ejecución distribuida.
- **Requisitos Funcionales:**
  1. Ampliar las pruebas automatizadas de definiciones, validación estructural y transiciones de flujos.
  2. Validar exhaustivamente permisos y roles RBAC/ABAC sobre cada etapa.
  3. Ejecutar pruebas de estrés con decisiones simultáneas concurrentes para validar `LockService`.
  4. Probar escenarios de solicitudes duplicadas para verificar el motor de idempotencia.
  5. Probar procesos paralelos con compuertas de bifurcación y convergencia AND/OR.
  6. Validar condiciones de enrutamiento basadas en reglas de negocio y montos.
  7. Probar temporizadores, vencimientos de SLA y escalamiento jerárquico automático.
  8. Probar delegaciones temporales de aprobación por ausencia.
  9. Probar comunicación autenticada entre microservicios de diferentes cuentas mediante HMAC.
  10. Probar revocación de credenciales y aislamiento de servicios no autorizados.
  11. Probar simulación de servicios caídos o desconectados.
  12. Validar colas de reintentos con retroceso exponencial.
  13. Probar recuperación y reanudación de trabajos extensos interrumpidos.
  14. Verificar la integridad de la cadena criptográfica de hash en el historial de auditoría.
  15. Probar compatibilidad hacia atrás entre diferentes versiones publicadas de un mismo workflow.
  16. Probar resolución dinámica de fuentes de datos mediante `resolveSpreadsheetSource`.
  17. Asegurar no regresión de todas las funcionalidades y suites previas (Fases 9, 10, 11, 15, 16, 17, 18, 19, 20, 21, 22).
- **Comportamiento Esperado:**
  Las nuevas implementaciones deberán contar con pruebas reproducibles que permitan comprobar que las capacidades existentes continúan funcionando y que las nuevas no introducen regresiones en el ecosistema.
- **Criterios de Aceptación:**
  - [ ] Ejecutar la suite completa y verificar resultados 100% reproducibles y exitosos.
  - [ ] Comprobar que los casos multicuenta se ejecutan en cuentas y servicios de prueba independientes.
  - [ ] Verificar que los escenarios de concurrencia e idempotencia se cubren y pasan satisfactoriamente.
  - [ ] Comprobar que cualquier regresión en funcionalidades previas bloquea la aprobación de la entrega.
  - [ ] Generar un reporte estructurado de resultados por subcapacidad y cobertura de pruebas.
  - [ ] Todas las pruebas de regresión previas (53/53) se mantienen aprobadas al 100%.
- **Estado:** [ ] Pendiente

---
## FASE 24 — INFORMES, INDICADORES Y ANÁLISIS INSTITUCIONAL

### BLOQUE 1. Integridad, normalización y acceso a la información

### [F24-Task01] [P0] [Catálogo de Informes - Catálogo Centralizado de Informes Institucionales con Permisos por Perfil]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `js/ui-common.js`
- **Dependencias Expuestas:** Diccionario de indicadores (`F24-Task02`), control de permisos existente y servicios de generación actuales.
- **Capacidades Relacionadas:** F24-001, F24-002, F24-010.
- **Problema Detectado:**
  Los informes institucionales están implementados mediante funciones independientes. No existe un catálogo centralizado que permita conocer qué informes están disponibles, qué información contienen, qué parámetros aceptan y qué perfiles pueden consultarlos.
- **Requisitos Funcionales:**
  1. Crear un catálogo institucional único que consolide los informes existentes de las áreas académica, financiera, administrativa y operativa.
  2. Registrar para cada informe:
     - Identificador único.
     - Nombre visible.
     - Descripción funcional.
     - Categoría y área responsable.
     - Fuente o servicio de datos.
     - Parámetros y filtros disponibles.
     - Indicadores incluidos.
     - Formatos de exportación admitidos.
     - Perfiles y permisos requeridos.
     - Estado de disponibilidad.
  3. Incorporar los informes existentes, incluidos:
     - Informe financiero y cobranza (`REP-CONT-01`).
     - Rendimiento académico por grado y sección (`REP-ACAD-01`).
     - Informes administrativos de expedientes y movimientos (`getStudentFileAdministrativeReports`).
     - Informe consolidado de asistencia y convivencia (`generateConsolidatedAttendanceAndCoexistenceReport`).
     - Informe de capacidad y ocupación de secciones (`getSectionCapacityAnalyticsReport`).
     - Comparativo financiero multianual (`getComparativeFinancialSummary`).
  4. Permitir que el catálogo se amplíe cuando se incorporen nuevos informes, sin tener que reconstruir la interfaz global.
  5. Diferenciar informes institucionales predeterminados, informes personalizados y aquellos disponibles únicamente para determinados departamentos.
  6. Incorporar búsqueda por nombre, categoría, descripción y área.
  7. Evitar registros duplicados y permitir desactivar informes obsoletos sin eliminar su historial de utilización.
  8. Proporcionar a la interfaz únicamente los informes que el usuario tenga autorización para consultar.
- **Cambios Necesarios:**
  - Incorporar un servicio centralizado de consulta del catálogo (`getInstitutionalReportsCatalog`).
  - Integrar las definiciones de los informes actualmente dispersos.
  - Incorporar metadatos y permisos por informe en matriz central.
  - Adaptar el acceso desde la interfaz global para que utilice el catálogo en lugar de mantener listas independientes.
  - Conservar los servicios de generación existentes y conectarlos mediante sus identificadores y parámetros correspondientes.
- **Comportamiento Esperado:**
  Al ingresar al apartado de informes, cada usuario encontrará un catálogo organizado según sus permisos y responsabilidades. Al seleccionar un informe, la interfaz conocerá qué filtros debe presentar, qué servicio debe consultar y qué formatos están disponibles.
  La incorporación de un nuevo informe no deberá requerir duplicar la lógica de navegación, autorización y presentación.
- **Criterios de Aceptación:**
  - [ ] El catálogo incluye todos los informes existentes identificados en la auditoría.
  - [ ] Los informes aparecen clasificados en las categorías correspondientes.
  - [ ] Cada informe devuelve sus metadatos completos y permisos requeridos.
  - [ ] Los usuarios sin autorización no reciben ni visualizan informes restringidos.
  - [ ] Un acceso directo a un informe no autorizado es rechazado también en el servidor (403 Forbidden).
  - [ ] Desactivar un informe impide nuevas consultas, pero conserva sus registros históricos de utilización.
  - [ ] Agregar un informe nuevo al catálogo permite visualizarlo sin modificar manualmente cada panel.
  - [ ] Los informes existentes siguen generando exactamente los mismos resultados después de integrarse al catálogo.
- **Estado:** [ ] Pendiente

---

### [F24-Task02] [P0] [Indicadores Centrales - Diccionario Semántico Centralizado de Indicadores Institucionales]
- **Componentes Afectados:**
  - `backend/developer-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Catálogo de informes (`F24-Task01`), servicios académicos, financieros y administrativos existentes.
- **Capacidades Relacionadas:** F24-005, F24-006, F24-007, F24-008.
- **Problema Detectado:**
  Las fórmulas de los indicadores están distribuidas entre distintos servicios. Esto permite que un mismo concepto pueda calcularse de forma diferente en un panel, un informe o una consulta de otro módulo. La plataforma necesita una definición institucional única para cada indicador.
- **Requisitos Funcionales:**
  1. Crear un registro centralizado de indicadores (`DiccionarioIndicadoresInstitucionales`) que permita definir:
     - Identificador único.
     - Nombre y descripción.
     - Área: académica, financiera, administrativa u operativa.
     - Finalidad.
     - Fórmula o regla de cálculo.
     - Unidad de medida.
     - Fuente de datos.
     - Campos requeridos.
     - Estados incluidos y excluidos.
     - Filtros compatibles.
     - Dimensiones de agrupación.
     - Frecuencia de actualización.
     - Responsable funcional.
     - Versión de la definición.
     - Fecha de vigencia.
  2. Incorporar las definiciones de los indicadores existentes, sin alterar sus fórmulas verificadas.
  3. Normalizar los indicadores académicos:
     - Matrícula activa y retirada.
     - Promedios.
     - Aprobación y reprobación.
     - Distribución de calificaciones.
     - Ausentismo.
     - Ocupación de secciones.
     - Riesgo académico.
  4. Normalizar los indicadores financieros:
     - Ingresos confirmados.
     - Egresos devengados.
     - Balance neto.
     - Cartera recuperada.
     - Morosidad.
     - Flujo de caja.
     - Ejecución presupuestaria.
  5. Incorporar los indicadores administrativos y operativos:
     - Personal activo.
     - Asistencia del personal.
     - Solicitudes pendientes.
     - Trámites resueltos.
     - Tiempo de resolución.
  6. Permitir que los indicadores se consulten desde diferentes informes y paneles sin volver a implementar sus fórmulas.
  7. Permitir nuevas versiones de una definición cuando cambien las reglas institucionales.
  8. Conservar la definición histórica aplicada a períodos anteriores.
  9. Distinguir entre indicadores que admiten cálculo en tiempo real y aquellos que utilizan información agregada.
  10. Incorporar descripciones comprensibles para que los usuarios conozcan qué representa cada indicador y cómo se interpreta.
- **Cambios Necesarios:**
  - Crear el registro centralizado de definiciones en tabla o esquema persistente.
  - Identificar y vincular las fórmulas actuales con sus indicadores correspondientes.
  - Sustituir gradualmente los cálculos duplicados por consultas a las definiciones normalizadas.
  - Mantener adaptadores para los servicios que ya generan resultados válidos.
  - Incorporar control de versiones y vigencia de las definiciones.
- **Comportamiento Esperado:**
  Un indicador debe tener una sola definición institucional. Los diferentes módulos podrán consumirlo, pero no deberán implementar versiones independientes de su fórmula.
  Por ejemplo, el porcentaje de aprobación mostrado en el panel de dirección deberá coincidir con el del informe académico cuando ambos utilicen el mismo período, universo de estudiantes y filtros.
- **Criterios de Aceptación:**
  - [ ] Cada indicador tiene un identificador y una definición verificable.
  - [ ] Las fórmulas existentes se documentan y se comparan con sus resultados actuales antes de migrarlas.
  - [ ] Los paneles y los informes que utilizan el mismo indicador producen resultados matemáticamente equivalentes.
  - [ ] Los cambios de fórmula generan una nueva versión secuencial.
  - [ ] Los informes históricos conservan la versión utilizada originalmente.
  - [ ] Las definiciones identifican las exclusiones y reglas de cálculo.
  - [ ] Un indicador no puede publicarse si carece de fuente, fórmula o unidad cuando estas sean necesarias.
  - [ ] Las fórmulas financieras mantienen la exclusión estricta de operaciones pendientes, canceladas o rechazadas.
  - [ ] Los indicadores académicos mantienen las reglas de publicación y evaluación existentes (excluyendo borradores).
- **Estado:** [ ] Pendiente

---

### [F24-Task03] [P0] [Filtros y Dimensiones - Normalización de Filtros Temporales y Estructura Institucional]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `js/ui-common.js`
- **Dependencias Expuestas:** Catálogo de informes (`F24-Task01`), diccionario de indicadores (`F24-Task02`), configuración académica e institucional existente.
- **Capacidades Relacionadas:** F24-003, F24-004.
- **Problema Detectado:**
  Los filtros actuales admiten fechas y años lectivos, pero necesitan validaciones más estrictas. Los filtros estructurales tampoco cuentan con una relación dependiente suficientemente completa entre grados y secciones.
- **Requisitos Funcionales:**
  1. Normalizar los parámetros temporales de los informes:
     - Fecha inicial (`fechaInicio`).
     - Fecha final (`fechaFin`).
     - Año lectivo (`anoLectivo`).
     - Período académico (`periodo`).
     - Período fiscal (`ejercicioFiscal`).
     - Intervalo personalizado.
  2. Validar rangos invertidos (`fechaInicio > fechaFin`), fechas inválidas y períodos incompatibles.
  3. Diferenciar períodos académicos, calendarios y fiscales sin solapamientos indebidos.
  4. Permitir filtros por:
     - Departamento.
     - Nivel educativo.
     - Grado.
     - Sección.
     - Asignatura.
     - Docente.
     - Estudiante.
     - Estado del registro.
     - Categorías financieras.
     - Otros criterios compatibles con cada informe.
  5. Implementar filtros dependientes en cascada:
     - Al seleccionar un nivel educativo, mostrar los grados correspondientes.
     - Al seleccionar un grado, mostrar únicamente sus secciones válidas.
     - Al seleccionar una sección, limitar los docentes y asignaturas a las relaciones correspondientes, cuando aplique.
  6. Permitir seleccionar varios valores (multiselect) cuando el informe lo admita.
  7. Incorporar una opción para limpiar filtros individuales y restablecer todos los filtros predeterminados.
  8. Conservar los filtros al navegar desde un panel hacia un informe detallado.
  9. Impedir que los filtros permitan consultar información fuera del ámbito autorizado del usuario.
- **Cambios Necesarios:**
  - Normalizar la validación de fechas y períodos en los servicios que reciben parámetros de consulta.
  - Incorporar las relaciones dependientes en los controles de selección de la interfaz gráfica.
  - Adaptar las consultas para utilizar los identificadores institucionales y no depender únicamente de nombres visibles.
  - Unificar el tratamiento de filtros entre los informes académicos, financieros y administrativos.
- **Comportamiento Esperado:**
  Los filtros deben funcionar como un conjunto coherente. Seleccionar un grado limitará las secciones disponibles y la consulta resultante. Cambiar el período actualizará todos los valores dependientes del informe.
  Los filtros no deben modificar ni ampliar los permisos del usuario.
- **Criterios de Aceptación:**
  - [ ] Un rango de fechas invertido se rechaza con un mensaje de validación claro.
  - [ ] Los períodos fiscales cruzados se procesan correctamente según las reglas del informe.
  - [ ] Al cambiar el grado, las secciones disponibles en la interfaz se actualizan automáticamente.
  - [ ] Una sección no perteneciente al grado seleccionado no puede enviarse como filtro válido.
  - [ ] Los filtros combinados devuelven únicamente los registros que cumplen todas las condiciones.
  - [ ] Los filtros no aplicables a un informe no se muestran en pantalla.
  - [ ] Los cambios de filtros actualizan los resultados y no conservan cifras de consultas anteriores.
  - [ ] Los usuarios no pueden ampliar su ámbito de consulta modificando los identificadores enviados al servidor.
- **Estado:** [ ] Pendiente

---

### [F24-Task04] [P0] [Arquitectura Distribuida - Estandarización de Consultas entre Servicios y Fuentes Distribuidas]
- **Componentes Afectados:**
  - `backend/developer-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Diccionario semántico (`F24-Task02`), filtros normalizados (`F24-Task03`), catálogo de fuentes existente y servicios de los diferentes módulos.
- **Capacidades Relacionadas:** F24-024, F24-025, F24-008.
- **Problema Detectado:**
  La resolución de fuentes de datos está parcialmente normalizada en el servicio financiero, pero no existe una estrategia universal para los informes que consultan datos distribuidos entre diferentes servicios y hojas de cálculo. Esto puede provocar diferencias, duplicaciones, resultados incompletos o dificultades para identificar el origen de la información.
- **Requisitos Funcionales:**
  1. Estandarizar la identificación de fuentes de datos de los informes institucionales.
  2. Permitir identificar para cada fuente:
     - Servicio responsable.
     - Identificador de origen (`fuenteId`).
     - Institución o ámbito al que pertenece.
     - Período o partición anual.
     - Versión del esquema.
     - Fecha de actualización.
     - Estado de disponibilidad (`active`, `degraded`, `disabled`).
  3. Normalizar las relaciones entre:
     - Estudiantes.
     - Usuarios.
     - Matrículas.
     - Grados y secciones.
     - Períodos académicos.
     - Operaciones financieras.
     - Departamentos.
     - Responsables.
  4. Evitar contabilizar dos veces una misma operación por encontrarse en fuentes diferentes.
  5. Identificar registros incompletos, duplicados o incompatibles.
  6. Permitir combinar fuentes cuando exista una relación válida entre ellas.
  7. Diferenciar los resultados completos de los parciales cuando una partición no esté disponible.
  8. Identificar qué fuentes participaron en la generación de cada informe.
  9. Mantener el aislamiento de permisos en las consultas distribuidas.
  10. Incorporar mecanismos de control cuando una fuente no responda o devuelva información desactualizada.
- **Cambios Necesarios:**
  - Extender la resolución de fuentes existente (`resolveSpreadsheetSource`) hacia los servicios que participan en informes institucionales.
  - Normalizar los identificadores y metadatos de las fuentes en catálogo central.
  - Incorporar validaciones de integridad referencial entre registros vinculados.
  - Adaptar las consultas consolidadas para que registren el origen de cada conjunto de datos.
  - Incorporar estados de disponibilidad y actualización en el informe resultante.
- **Comportamiento Esperado:**
  Un informe consolidado debe conocer qué fuentes utilizó y si todas respondieron correctamente.
  Si una fuente no está disponible, el sistema no debe presentar un resultado parcial como si fuera completo. Debe identificar la limitación y permitir distinguir los datos disponibles de los pendientes.
- **Criterios de Aceptación:**
  - [ ] Los informes identifican explícitamente sus fuentes de datos en la respuesta.
  - [ ] Los registros relacionados se vinculan mediante identificadores válidos sin pérdida de referencias.
  - [ ] Una misma operación no se contabiliza dos veces al consultar múltiples particiones.
  - [ ] Las fuentes no disponibles generan un estado identificable de advertencia.
  - [ ] Los informes parciales no se presentan como completos sin indicar fuentes faltantes.
  - [ ] Los datos históricos utilizan la partición correspondiente al ciclo analizado.
  - [ ] Los permisos se verifican también en las consultas distribuidas a través de HMAC.
  - [ ] Los resultados consolidados coinciden con los resultados de referencia calculados sobre los registros fuente.
- **Estado:** [ ] Pendiente

---

### BLOQUE 2. Rendimiento, agregación y explotación histórica

### [F24-Task05] [P1] [Rendimiento y Almacenamiento - DataMart Institucional y Motor de Agregaciones Históricas]
- **Componentes Afectados:**
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** Diccionario semántico (`F24-Task02`), estandarización de fuentes (`F24-Task04`), límites y rendimiento (`F24-Task06`).
- **Capacidades Relacionadas:** F24-016, F24-017, F24-024.
- **Problema Detectado:**
  Los cálculos actuales recorren hojas transaccionales completas en tiempo real. Esto aumenta los tiempos de consulta y el consumo de cuotas de Google Apps Script. La auditoría identifica la necesidad de incorporar estructuras de agregación que permitan consultar indicadores históricos sin recalcular todos los registros en cada solicitud.
- **Requisitos Funcionales:**
  1. Crear una estructura de almacenamiento de agregados institucionales (`ResumenesIndicadoresHistoricos`).
  2. Incorporar agregaciones para:
     - Matrícula por día, período, grado y sección.
     - Rendimiento por período, asignatura, grado y sección.
     - Aprobación y reprobación.
     - Asistencia y ausentismo.
     - Ocupación de secciones.
     - Ingresos y egresos por período y categoría.
     - Cartera pendiente y recuperada.
     - Ejecución presupuestaria.
     - Indicadores administrativos y operativos.
  3. Incorporar agregaciones diarias y periódicas según la naturaleza del indicador.
  4. Permitir consultar acumulados mensuales, trimestrales, semestrales y anuales utilizando los datos agregados.
  5. Mantener relación entre cada agregado y:
     - Indicador.
     - Período.
     - Fuente.
     - Dimensiones.
     - Versión de fórmula.
     - Fecha de cálculo.
  6. Implementar actualización incremental cuando cambien los registros fuente.
  7. Permitir reconstruir los agregados de un período cuando se detecten inconsistencias (`rebuildAggregatedPeriodData`).
  8. Evitar duplicaciones al ejecutar varias veces un mismo proceso de agregación.
  9. Separar los agregados actuales de los históricos cerrados.
  10. Permitir consultar la fecha y el estado de actualización de cada agregado.
  11. Mantener la posibilidad de contrastar los resultados agregados con los registros originales para auditoría.
- **Cambios Necesarios:**
  - Incorporar las estructuras de almacenamiento para los indicadores agregados en hojas dedicadas.
  - Implementar procesos de consolidación programados mediante activadores Apps Script.
  - Integrar el diccionario de indicadores con el motor de agregación.
  - Incorporar mecanismos de actualización incremental ante eventos transaccionales.
  - Implementar controles de integridad y reconstrucción masiva.
  - Adaptar los informes para consultar agregados cuando sean adecuados y recurrir a datos transaccionales cuando necesiten detalle.
- **Comportamiento Esperado:**
  Los paneles y los informes históricos deben consultar preferentemente los datos agregados disponibles, evitando recorrer repetidamente todas las hojas transaccionales.
  Los informes detallados deben seguir permitiendo acceder a los registros originales cuando el usuario tenga autorización.
- **Criterios de Aceptación:**
  - [ ] Los agregados coinciden exactamente con los cálculos de referencia realizados sobre los registros fuente.
  - [ ] Ejecutar dos veces el mismo proceso de agregación no duplica valores.
  - [ ] Modificar un registro transaccional actualiza los agregados afectados según la estrategia definida.
  - [ ] Los períodos cerrados conservan inalterados sus resultados históricos agregados.
  - [ ] La reconstrucción de un período produce los mismos resultados que el cálculo original.
  - [ ] Cada agregado identifica su fecha de actualización y versión de fórmula.
  - [ ] Un agregado desactualizado no se presenta como vigente ante el usuario.
  - [ ] Los informes detallados siguen recuperando los registros individuales originales.
  - [ ] Las consultas habituales utilizan agregados cuando estos están disponibles y son compatibles con los filtros solicitados.
- **Estado:** [ ] Pendiente

---

### [F24-Task06] [P1] [Rendimiento y Cuotas - Optimización de Consultas, Paginación y Control de Cuotas GAS]
- **Componentes Afectados:**
  - `backend/academic-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** DataMart (`F24-Task05`), catálogo de indicadores (`F24-Task02`), consultas de fuentes normalizadas (`F24-Task04`).
- **Capacidades Relacionadas:** F24-017, F24-002.
- **Problema Detectado:**
  Las consultas que recorren hojas con miles de filas pueden acercarse al límite de ejecución de Google Apps Script (6 minutos). La arquitectura necesita optimizar las operaciones y evitar que informes extensos bloqueen la generación de resultados.
- **Requisitos Funcionales:**
  1. Implementar paginación obligatoria para informes detallados extensos (`page`, `pageSize`, `totalPages`, `totalRecords`).
  2. Evitar recuperar columnas o registros que no sean necesarios para la consulta en memoria.
  3. Utilizar operaciones por lotes en lugar de lecturas celda por celda.
  4. Aprovechar los agregados precalculados del DataMart.
  5. Incorporar caché en memoria (`CacheService`) para consultas repetidas con parámetros equivalentes.
  6. Definir reglas estrictas de invalidación de caché cuando cambien los datos fuente subyacentes.
  7. Incorporar límites configurables para:
     - Registros por página.
     - Volumen máximo de exportación directa.
     - Duración de consultas en tiempo real.
     - Número de operaciones concurrentes con `LockService`.
  8. Identificar consultas pesadas que requieren procesamiento diferido o asíncrono.
  9. Registrar tiempos de respuesta y volumen de datos procesado en cada informe.
  10. Manejar fallos por cuotas o límites de ejecución sin entregar resultados incompletos como definitivos.
  11. Permitir que una consulta extensa pueda continuar mediante procesamiento por lotes cuando sea necesario.
- **Cambios Necesarios:**
  - Optimizar las consultas existentes de informes evitando llamadas redundantes a `getDataRange()`.
  - Incorporar paginación consistente en backend y controles de avance en la interfaz.
  - Integrar caché con el mecanismo de actualización de datos.
  - Utilizar procesamiento por lotes para grandes volúmenes.
  - Incorporar métricas de rendimiento por informe en bitácoras de auditoría.
  - Implementar control de errores y recuperación de consultas interrumpidas.
- **Comportamiento Esperado:**
  Los informes pequeños deben responder directamente. Los informes extensos deben utilizar paginación, agregación o procesamiento por lotes según su volumen.
  La interfaz debe mostrar claramente cuándo una consulta continúa procesándose y cuándo ha terminado.
- **Criterios de Aceptación:**
  - [ ] Recorrer todas las páginas devuelve todos los registros sin omisiones ni duplicaciones.
  - [ ] Los filtros aplicados se mantienen idénticos entre páginas consecutivas.
  - [ ] Las consultas repetidas con mismos parámetros reutilizan resultados válidos en caché.
  - [ ] Una modificación de los datos fuente invalida inmediatamente los resultados en caché.
  - [ ] Los informes extensos no dependen de una única ejecución que exceda los límites del servicio.
  - [ ] Los errores por cuotas se registran y presentan de manera controlada al usuario.
  - [ ] Se registran tiempos de respuesta y cantidades procesadas en los eventos de auditoría.
  - [ ] Las pruebas comparativas demuestran una mejora medible en tiempos de respuesta frente a las consultas originales.
- **Estado:** [ ] Pendiente

---

### [F24-Task07] [P1] [Analítica Histórica - Motor de Tendencias y Series Históricas Académicas y Administrativas]
- **Componentes Afectados:**
  - `backend/academic-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `js/ui-common.js`
- **Dependencias Expuestas:** Diccionario de indicadores (`F24-Task02`), DataMart (`F24-Task05`), comparación financiera existente.
- **Capacidades Relacionadas:** F24-011, F24-012.
- **Problema Detectado:**
  Existe una proyección financiera semestral, pero faltan mecanismos equivalentes para analizar la evolución histórica de matrícula, calificaciones y otros indicadores institucionales.
- **Requisitos Funcionales:**
  1. Incorporar series temporales para indicadores académicos, financieros, administrativos y operativos.
  2. Permitir consultar:
     - Evolución de matrícula por ciclo lectivo y mes.
     - Evolución de tasas de aprobación y reprobación.
     - Evolución de promedios académicos generales y por área.
     - Evolución de asistencia y ausentismo.
     - Evolución de ingresos y egresos comparativos.
     - Evolución de morosidad institucional.
     - Evolución de volumen de trámites y tiempos promedio de resolución.
  3. Permitir comparar períodos equivalentes (ej. primer trimestre 2024 vs primer trimestre 2025).
  4. Mostrar variaciones absolutas y porcentuales relativas.
  5. Identificar máximos, mínimos y promedios en la serie.
  6. Permitir agrupar por mes, trimestre, semestre y año, cuando corresponda.
  7. Diferenciar períodos completos e incompletos con marcas visibles.
  8. Permitir visualizar valores en gráficos interactivos y tablas numéricas estructuradas.
  9. Mantener la definición histórica del indicador según su versión en la fecha evaluada.
  10. Incorporar acceso al detalle de los datos que componen un punto de la serie cuando los permisos lo permitan.
- **Cambios Necesarios:**
  - Integrar los indicadores analíticos con las estructuras del DataMart.
  - Incorporar endpoints de consulta de series temporales (`getTimeSeriesAnalytics`).
  - Extender la comparación existente para que pueda utilizarse también en indicadores académicos y administrativos.
  - Incorporar visualizaciones gráficas y selectores de período en los paneles de control.
- **Comportamiento Esperado:**
  El usuario podrá seleccionar un indicador y consultar cómo ha evolucionado a través de distintos períodos. Podrá identificar cambios, comparar años lectivos y examinar los valores que componen cada resultado.
- **Criterios de Aceptación:**
  - [ ] Los valores de la serie temporal coinciden con los informes individuales de cada período.
  - [ ] Los períodos aparecen presentados en estricto orden cronológico.
  - [ ] Los períodos sin datos se identifican claramente y no se convierten arbitrariamente en ceros.
  - [ ] Los cambios de fórmula se identifican en la serie histórica.
  - [ ] Los porcentajes de variación utilizan una base matemática válida sin errores por división por cero.
  - [ ] Los valores representados en gráficos coinciden exactamente con los datos tabulares.
  - [ ] La comparación de períodos incompletos presenta una advertencia clara al usuario.
- **Estado:** [ ] Pendiente

---

### BLOQUE 3. Informes exportables, personalizados y programados

### [F24-Task08] [P1] [Exportación Universal - Exportador Universal de Informes CSV y XLSX con Seguridad Anti-Inyección]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `js/ui-common.js`
- **Dependencias Expuestas:** Catálogo de informes (`F24-Task01`), permisos existentes, consultas optimizadas (`F24-Task06`).
- **Capacidades Relacionadas:** F24-013, F24-010.
- **Problema Detectado:**
  La exportación actual depende principalmente de la impresión del navegador mediante `window.print()`. Esto no proporciona archivos estructurados adecuados para análisis, procesamiento y reutilización de datos.
- **Requisitos Funcionales:**
  1. Incorporar exportación directa desde el servicio de informes en backend.
  2. Implementar como mínimo:
     - CSV estructurado con codificación UTF-8 y BOM para compatibilidad con Excel.
     - XLSX nativo generado en servidor o binario compatible.
  3. Mantener la impresión o generación PDF existente como opción complementaria.
  4. Exportar los datos resultantes de la consulta autorizada, conservando:
     - Filtros aplicados.
     - Período de referencia.
     - Encabezados descriptivos.
     - Ordenamiento vigente en pantalla.
     - Agrupaciones y jerarquías.
     - Totales y subtotales calculados.
     - Unidades de medida asociadas.
  5. Incorporar nombres de archivo estandarizados y descriptivos (ej. `Informe_Rendimiento_7mo_2026_2026-05-10.csv`).
  6. Permitir exportar informes completos o filtrados según selección del usuario.
  7. Gestionar grandes volúmenes mediante generación por lotes para evitar timeouts.
  8. Incorporar metadatos de generación:
     - Nombre del informe.
     - Fecha y hora de generación ISO.
     - Período consultado.
     - Filtros aplicados.
     - Usuario generador y rol operativo.
  9. Mantener los formatos numéricos y las fechas en estándares internacionales.
  10. Proteger la exportación contra fórmulas maliciosas en archivos CSV y XLSX (sanitización de prefijos `=`, `+`, `-`, `@` para prevenir CSV Injection).
  11. Evitar que se incluyan campos restringidos o confidenciales no autorizados.
  12. Registrar las exportaciones relevantes en la bitácora de auditoría institucional.
- **Cambios Necesarios:**
  - Incorporar un servicio de exportación reutilizable (`exportInstitutionalReportToFile`).
  - Adaptar los informes existentes para producir una estructura de datos exportable normalizada.
  - Implementar generación CSV con escapado seguro y XLSX.
  - Integrar botones de descarga directa en el visor modal actual (`modal-report-viewer`).
  - Incorporar controles de autorización estrictos en el servidor antes de generar archivos.
  - Implementar manejo de archivos temporales y limpieza periódica en Google Drive cuando corresponda.
- **Comportamiento Esperado:**
  El usuario podrá consultar un informe y descargar sus resultados en un formato adecuado para su uso posterior, sin depender de copiar tablas desde el navegador.
  Los archivos deben representar exactamente los datos que el usuario está autorizado a consultar.
- **Criterios de Aceptación:**
  - [ ] Los archivos CSV y XLSX contienen exactamente los mismos registros que la consulta original en pantalla.
  - [ ] Los filtros aplicados en pantalla se conservan reflejados en el archivo exportado.
  - [ ] Los encabezados, totales y subtotales se exportan correctamente.
  - [ ] Los caracteres especiales (tildes, eñes) se conservan intactos en UTF-8.
  - [ ] Los valores numéricos no se convierten incorrectamente en fechas o cadenas corruptas.
  - [ ] Las fórmulas potencialmente peligrosas en campos de texto se neutralizan ante inyección CSV.
  - [ ] Un usuario sin permiso de exportación no puede generar el archivo mediante una petición directa al backend.
  - [ ] La exportación no incluye información fuera del ámbito autorizado del usuario.
  - [ ] Los archivos grandes se generan mediante procesamiento controlado sin timeouts.
  - [ ] Los archivos generados pueden abrirse correctamente con Excel, LibreOffice y herramientas compatibles.
- **Estado:** [ ] Pendiente

---

### [F24-Task09] [P2] [Informes Personalizados - Constructor de Informes Personalizados y Plantillas Reutilizables]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `js/ui-common.js`
- **Dependencias Expuestas:** Catálogo de informes (`F24-Task01`), diccionario semántico (`F24-Task02`), filtros normalizados (`F24-Task03`), exportador (`F24-Task08`).
- **Capacidades Relacionadas:** F24-020, F24-001.
- **Problema Detectado:**
  No existe una interfaz que permita a los usuarios autorizados adaptar informes seleccionando columnas, agrupaciones y criterios de consulta.
- **Requisitos Funcionales:**
  1. Incorporar un constructor visual de informes para usuarios con privilegios analíticos.
  2. Permitir seleccionar:
     - Informe o fuente de datos de origen.
     - Columnas visibles disponibles.
     - Orden de las columnas en la tabla.
     - Filtros aplicables por defecto.
     - Criterios de agrupación (por grado, por departamento, por cuenta).
     - Criterios de ordenamiento ascendente o descendente.
     - Cálculo de totales y subtotales.
     - Campos de resumen e indicadores clave.
     - Formato de visualización tabular o gráfica.
  3. Permitir guardar configuraciones como informes personalizados persistentes.
  4. Permitir duplicar una configuración existente como punto de partida.
  5. Permitir editar, renombrar y eliminar configuraciones propias.
  6. Permitir compartir informes configurados con otros usuarios o roles autorizados.
  7. Diferenciar:
     - Informes personales (visibles solo al creador).
     - Informes compartidos departamentales.
     - Plantillas institucionales oficiales.
  8. Permitir configurar permisos específicos de consulta, edición, exportación y programación.
  9. Restringir los campos disponibles en el constructor según el perfil del usuario autenticado.
  10. Utilizar el diccionario semántico para seleccionar indicadores existentes, evitando duplicar fórmulas.
  11. Incorporar vista previa interactiva antes de guardar la plantilla.
  12. Permitir que una plantilla guardada vuelva a ejecutarse en cualquier momento con datos actualizados.
- **Cambios Necesarios:**
  - Incorporar una estructura persistente para guardar configuraciones de informes en hoja `InformesPersonalizadosConfig`.
  - Crear la interfaz de construcción y edición de informes en el frontend.
  - Implementar validación de campos y combinaciones permitidas en el servidor.
  - Integrar el constructor con el catálogo general y las definiciones de indicadores.
  - Incorporar permisos específicos para administración de informes personalizados.
- **Comportamiento Esperado:**
  Un usuario autorizado podrá adaptar un informe a sus necesidades sin solicitar una modificación del código. Podrá guardar su configuración y volver a utilizarla con nuevos períodos o filtros.
  El constructor no deberá permitir ejecutar consultas arbitrarias ni acceder a campos restringidos.
- **Criterios de Aceptación:**
  - [ ] Un usuario autorizado puede crear y guardar una configuración personalizada de informe.
  - [ ] La configuración se conserva íntegra al cerrar sesión y volver a abrir el informe.
  - [ ] Los filtros y columnas guardados se aplican correctamente en la consulta.
  - [ ] Los usuarios sin permisos de edición no pueden modificar plantillas institucionales oficiales.
  - [ ] Los campos restringidos o confidenciales no aparecen disponibles en el constructor.
  - [ ] Una configuración personalizada utiliza estrictamente las fórmulas centrales de los indicadores.
  - [ ] Duplicar un informe crea una copia independiente sin alterar el original.
  - [ ] Eliminar una configuración personal no afecta los datos fuente ni otros informes institucionales.
  - [ ] Los informes compartidos respetan los permisos de acceso asignados.
- **Estado:** [ ] Pendiente

---

### [F24-Task10] [P1] [Automatización - Programador Automático de Generación de Informes Calendarizados]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** Catálogo (`F24-Task01`), permisos, exportador (`F24-Task08`), distribución (`F24-Task11`).
- **Capacidades Relacionadas:** F24-014, F24-018.
- **Problema Detectado:**
  No existe un mecanismo para calendarizar la generación automática de informes mediante procesos programados.
- **Requisitos Funcionales:**
  1. Permitir programar informes periódicos:
     - Diarios.
     - Semanales (día específico de la semana).
     - Mensuales (día del mes o primer/último día).
     - Trimestrales.
     - Semestrales.
     - Anuales (cierre de ciclo lectivo o fiscal).
  2. Configurar en cada programación:
     - Informe seleccionado.
     - Filtros aplicables.
     - Período dinámico de datos (ej. "mes anterior", "ciclo actual").
     - Frecuencia de ejecución.
     - Hora planificada.
     - Zona horaria de la institución.
     - Fecha de inicio de vigencia.
     - Fecha de finalización.
     - Formato de salida (PDF, CSV, XLSX).
     - Destinatarios autorizados.
  3. Permitir pausar, reanudar, modificar y cancelar programaciones activas.
  4. Mantener un historial completo de ejecuciones programadas en hoja `HistorialInformesProgramados`.
  5. Registrar resultados satisfactorios, tiempos y volumen generado.
  6. Incorporar reintentos controlados con retroceso exponencial ante fallos temporales.
  7. Evitar ejecuciones duplicadas mediante marcas de exclusión mutua.
  8. Permitir programaciones institucionales y personales según los permisos asignados.
  9. Revalidar los permisos del destinatario y del creador antes de generar cada informe.
  10. Gestionar cambios en los permisos del creador o de los destinatarios (desactivar si el creador pierde privilegios).
  11. Permitir programaciones de informes personalizados cuando estén formalmente autorizadas.
- **Cambios Necesarios:**
  - Incorporar almacenamiento de programaciones en hoja `ProgramacionInformes`.
  - Implementar un mecanismo de ejecución mediante activadores temporales Apps Script (`Time-driven triggers`).
  - Integrar el programador con los servicios de generación y exportación de informes.
  - Incorporar control de estados de ejecución y política de reintentos.
  - Registrar cada ejecución en las bitácoras de auditoría institucional.
  - Evitar depender de una única ejecución prolongada fraccionando envíos en colas asíncronas.
- **Comportamiento Esperado:**
  Una programación activa generará el informe en la fecha y frecuencia configuradas. Si falla, quedará registrada y podrá reintentarse sin producir duplicaciones.
  Las programaciones deben continuar funcionando de manera controlada aunque el usuario creador deje de tener acceso.
- **Criterios de Aceptación:**
  - [ ] Una programación válida ejecuta y genera el informe en la frecuencia configurada.
  - [ ] La zona horaria institucional se respeta estrictamente en los disparos.
  - [ ] Pausar o cancelar una programación impide inmediatamente nuevas ejecuciones.
  - [ ] Las ejecuciones fallidas quedan registradas con causa detallada y alerta.
  - [ ] Los reintentos automáticos no duplican informes ni envían correos repetidos.
  - [ ] Los permisos de acceso a los datos se comprueban nuevamente en cada ejecución calendarizada.
  - [ ] Una programación no distribuye datos a destinatarios que hayan perdido autorización.
  - [ ] El historial permite identificar cada ejecución histórica, fecha y estado final.
- **Estado:** [ ] Pendiente

---

### [F24-Task11] [P1] [Distribución y Seguridad - Distribución Segura y Compartición de Informes Institucionales]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Programador (`F24-Task10`), exportador (`F24-Task08`), catálogo y permisos (`F24-Task01`).
- **Capacidades Relacionadas:** F24-015, F24-010.
- **Problema Detectado:**
  No existe un mecanismo institucional para enviar informes automáticamente por correo electrónico ni para compartirlos mediante enlaces temporales protegidos.
- **Requisitos Funcionales:**
  1. Permitir distribuir informes generados a destinatarios autorizados de forma segura.
  2. Incorporar despacho por correo electrónico institucional (`MailApp` / notificaciones multicanal).
  3. Permitir seleccionar destinatarios individuales y grupos o departamentos institucionales.
  4. Permitir adjuntar archivos estructurados o enviar enlaces temporales protegidos.
  5. Incorporar enlaces de acceso seguro con:
     - Identificador criptográfico único.
     - Fecha y hora de vencimiento.
     - Estado activo o revocado.
     - Lista de destinatarios autorizados por email/userId.
     - Permisos de solo consulta sin reenvío no autorizado.
  6. Evitar enlaces públicos o URLs abiertas que permitan acceder a información institucional restringida sin autenticación.
  7. Revalidar los permisos institucionales al momento en que el usuario abre un enlace compartido.
  8. Permitir revocar anticipadamente el acceso a un enlace distribuido.
  9. Registrar fecha, usuario emisor, informe, destinatarios y aperturas en bitácora de distribución.
  10. Integrar la distribución con las programaciones automáticas de informes.
  11. Permitir notificar inmediatamente a los administradores ante fallos de entrega.
  12. Evitar envíos duplicados mediante claves de idempotencia en la distribución.
- **Cambios Necesarios:**
  - Incorporar un servicio de distribución institucional (`distributeInstitutionalReport`).
  - Integrar el envío con el programador de tareas y el exportador de archivos.
  - Implementar control de acceso y verificación de identidad en enlaces temporales.
  - Incorporar registro de entregas en hoja `DistribucionInformesLogs`.
  - Implementar plantillas de correo institucionales formales con advertencias de confidencialidad.
  - Añadir controles de validación de destinatarios y permisos antes del despacho.
- **Comportamiento Esperado:**
  Un informe podrá enviarse automáticamente a los responsables autorizados. Si se utiliza un enlace, el acceso estará sujeto a identidad, permisos y vigencia.
  El archivo enviado no debe contener información que el destinatario no tenga derecho a consultar.
- **Criterios de Aceptación:**
  - [ ] Un informe puede enviarse exitosamente a un destinatario institucional autorizado.
  - [ ] Un intento de envío a un destinatario no autorizado es bloqueado por el servidor.
  - [ ] Un enlace temporal vencido o revocado impide el acceso al informe.
  - [ ] La modificación o revocación de permisos se refleja inmediatamente en el siguiente intento de acceso.
  - [ ] Todos los envíos de informes quedan debidamente registrados en la bitácora de auditoría.
  - [ ] Un fallo de entrega de correo no se registra falsamente como envío satisfactorio.
  - [ ] Los reintentos controlados no generan envíos duplicados hacia los destinatarios.
  - [ ] La distribución automática conserva fielmente los filtros y el período de datos configurados.
- **Estado:** [ ] Pendiente

---

### BLOQUE 4. Gestión institucional, objetivos y alertas

### [F24-Task12] [P2] [Gobierno Institucional - Sistema Institucional de Metas, Objetivos y Cumplimiento de Indicadores]
- **Componentes Afectados:**
  - `backend/developer-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `js/ui-common.js`
- **Dependencias Expuestas:** Diccionario semántico (`F24-Task02`), series históricas (`F24-Task07`), paneles por rol (`F24-Task13`).
- **Capacidades Relacionadas:** F24-021, F24-008.
- **Problema Detectado:**
  No existe una estructura para registrar metas institucionales y comparar los resultados reales con los objetivos establecidos.
- **Requisitos Funcionales:**
  1. Incorporar un registro central de metas institucionales en hoja `MetasIndicadoresInstitucionales`.
  2. Permitir asociar cada meta con un indicador del diccionario semántico centralizado.
  3. Configurar en cada meta:
     - Nombre de la meta.
     - Descripción y justificación estratégica.
     - Indicador asociado (`indicadorId`).
     - Valor objetivo cuantitativo.
     - Unidad de medida correspondiente.
     - Período de evaluación (año lectivo, semestre, mes).
     - Área responsable (Académica, Financiera, Administrativa).
     - Departamento específico.
     - Usuario responsable asignado.
     - Fecha de inicio.
     - Fecha de finalización.
     - Estado (`Planificada`, `EnSeguimiento`, `Cumplida`, `NoCumplida`, `Cancelada`).
  4. Permitir definir metas institucionales globales, departamentales y académicas por grado/sección.
  5. Incorporar metas financieras cuando existan datos presupuestarios compatibles.
  6. Permitir consultar en tiempo real:
     - Valor objetivo planeado.
     - Valor actual alcanzado.
     - Diferencia absoluta y desvío.
     - Porcentaje de cumplimiento alcanzado.
     - Evolución del cumplimiento a lo largo del período.
  7. Mantener historial de modificaciones de metas y reajustes aprobados.
  8. Permitir establecer metas sucesivas por períodos continuos.
  9. Diferenciar formalmente metas alcanzadas, en curso, vencidas y aquellas sin datos suficientes.
  10. Restringir la creación, reajuste y eliminación de metas exclusivamente a perfiles autorizados (Dirección y Administrador).
- **Cambios Necesarios:**
  - Incorporar almacenamiento de metas en base de datos persistente.
  - Integrar las metas con las fórmulas del diccionario de indicadores.
  - Crear interfaz de configuración y seguimiento visual de metas (barras de avance y porcentajes).
  - Integrar resultados de cumplimiento en los paneles de control por rol.
  - Incorporar historial de auditoría para modificaciones de objetivos.
- **Comportamiento Esperado:**
  Dirección podrá definir objetivos institucionales y consultar su cumplimiento. Los responsables de cada área podrán consultar las metas correspondientes a sus departamentos.
  Los resultados se calcularán utilizando el indicador asociado, sin crear fórmulas paralelas.
- **Criterios de Aceptación:**
  - [ ] Una meta tiene un indicador, período y responsable claramente identificables.
  - [ ] El valor actual alcanzado coincide exactamente con el cálculo del indicador correspondiente.
  - [ ] El porcentaje de cumplimiento se calcula correctamente en base al objetivo.
  - [ ] Las metas vencidas se identifican y clasifican automáticamente.
  - [ ] Los cambios en los objetivos de una meta conservan su trazabilidad histórica de modificaciones.
  - [ ] Los usuarios sin permisos no pueden crear, alterar ni eliminar metas institucionales.
  - [ ] Los períodos sin datos operativos no generan porcentajes de cumplimiento ficticios.
  - [ ] Los cuadros de mando muestran de forma clara y fidedigna el progreso de las metas.
- **Estado:** [ ] Pendiente

---

### [F24-Task13] [P1] [Cuadros de Mando - Integración y Ampliación de Paneles Institucionales por Rol]
- **Componentes Afectados:**
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `js/ui-common.js`
  - `app/html/dashboards/dynamic-dashboard.html`
- **Dependencias Expuestas:** Catálogo (`F24-Task01`), diccionario (`F24-Task02`), filtros (`F24-Task03`), series históricas (`F24-Task07`), metas (`F24-Task12`).
- **Capacidades Relacionadas:** F24-009, F24-010, F24-023.
- **Problema Detectado:**
  Existen paneles y servicios analíticos por área, pero falta una integración gráfica global que permita consultar los indicadores de manera coherente desde un espacio institucional unificado.
- **Requisitos Funcionales:**
  1. Integrar los paneles existentes en una experiencia de usuario institucional unificada.
  2. Mantener vistas diferenciadas según el perfil operativo:
     - Dirección y Rectoría.
     - Coordinación Académica.
     - Administración y Contabilidad.
     - Secretaría General.
     - Docentes.
  3. Permitir que cada panel departamental presente:
     - Indicadores principales en tarjetas de resumen (KPI cards).
     - Comparaciones temporales y variaciones.
     - Gráficos de tendencias históricas.
     - Seguimiento de metas institucionales.
     - Alertas tempranas activas.
     - Enlaces directos hacia los informes detallados correspondientes.
  4. Permitir configurar los widgets visibles cuando el usuario tenga autorización administrativa.
  5. Permitir organizar y ordenar los widgets sin alterar las definiciones semánticas de los indicadores.
  6. Conservar las preferencias individuales de visualización por usuario en almacenamiento local.
  7. Permitir filtros globales en el panel (por período, grado, sección) que se apliquen simultáneamente a los widgets compatibles.
  8. Permitir abrir el detalle de cualquier indicador haciendo clic sobre su tarjeta o gráfico.
  9. Mantener los filtros activos al navegar desde un widget hacia su informe detallado correspondiente.
  10. Mostrar visiblemente la fecha y hora de la última actualización de datos en cada indicador.
  11. Gestionar estados de carga, ausencia de datos y errores por widget de forma aislada e independiente.
  12. Mantener un diseño totalmente adaptable a dispositivos móviles y pantallas táctiles (Tailwind CSS responsivo).
- **Requisitos Específicos por Perfil:**
  - **Dirección / Rectoría:** Matrícula total y evolución, retención y permanencia, rendimiento académico general, tasa de asistencia institucional, ingresos y egresos consolidados, ejecución presupuestaria global, cumplimiento de metas institucionales y alertas críticas.
  - **Coordinación Académica:** Tasas de aprobación y reprobación, promedios por grado y sección, ausentismo recurrente, asignaturas con bajo rendimiento relativo, alertas tempranas pedagógicas y avance de planificaciones docentes.
  - **Contabilidad / Administración:** Ingresos confirmados por caja y bancos, egresos devengados, cuentas por cobrar y por pagar, índice de morosidad, antigüedad de saldos, flujo de caja proyectado y ejecución presupuestaria por categoría.
  - **Secretaría:** Matrícula por ciclo lectivo, estado de expedientes de estudiantes, trámites y solicitudes pendientes, trámites resueltos, tiempos promedio de atención y movimientos de matrícula (traslados y reincorporaciones).
  - **Docentes:** Promedios de sus asignaturas asignadas, distribución de calificaciones en sus secciones, asistencia de sus alumnos, estudiantes en riesgo pedagógico y evaluaciones pendientes de calificación.
- **Cambios Necesarios:**
  - Integrar los servicios analíticos existentes en endpoints de dashboards consolidados.
  - Adaptar el motor de dashboard dinámico (`dynamic-dashboard.html`) para consumir el catálogo de indicadores.
  - Incorporar configuración de widgets por perfil en metadatos del sistema.
  - Integrar barra de filtros globales de panel.
  - Implementar navegación contextual desde widgets hacia el visor modal de informes (`displayReportModal`).
  - Conservar y reforzar los controles de ámbito y permisos RBAC/ABAC existentes en el backend.
- **Comportamiento Esperado:**
  Cada usuario accederá a un panel adaptado a sus responsabilidades. Los indicadores serán coherentes con los informes y permitirán profundizar en los resultados sin perder el contexto.
- **Criterios de Aceptación:**
  - [ ] Cada perfil institucional visualiza únicamente los widgets e indicadores correspondientes a sus permisos.
  - [ ] Los valores numéricos de los indicadores en el panel coinciden exactamente con sus informes correspondientes.
  - [ ] Los filtros globales del panel actualizan simultáneamente todos los widgets compatibles.
  - [ ] Los enlaces hacia detalles de indicadores conservan íntegros los filtros aplicados en el panel.
  - [ ] Los widgets que experimenten un error de datos no bloquean ni afectan a los demás widgets independientes.
  - [ ] La fecha y hora de actualización es claramente visible para el usuario en cada tarjeta.
  - [ ] Las preferencias individuales de ordenamiento no modifican las vistas de otros usuarios.
  - [ ] Los usuarios no pueden agregar ni visualizar widgets que expongan información fuera de su ámbito autorizado.
- **Estado:** [ ] Pendiente

---

### [F24-Task14] [P2] [Alertas y Monitoreo - Ampliación de Alertas Tempranas a Indicadores Financieros y Operativos]
- **Componentes Afectados:**
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Diccionario de indicadores (`F24-Task02`), metas (`F24-Task12`), paneles (`F24-Task13`).
- **Capacidades Relacionadas:** F24-022, F24-006, F24-007.
- **Problema Detectado:**
  Existe un mecanismo de alertas tempranas para riesgo académico, pero no se dispone de una cobertura equivalente para detectar situaciones relevantes en morosidad, gastos y otros indicadores financieros u operativos.
- **Requisitos Funcionales:**
  1. Ampliar el evaluador de alertas tempranas para procesar condiciones sobre indicadores institucionales financieros y operativos.
  2. Incorporar reglas configurables para:
     - Incremento anormal de la morosidad institucional (ej. mora > 15% de cartera activa).
     - Disminución crítica en la recuperación de cobros mensuales.
     - Sobrecostos en órdenes de compra y requisiciones de almacén.
     - Desviaciones presupuestarias superiores a umbrales configurados por partida.
     - Incrementos inusuales de gastos imprevistos en caja chica o cuentas por pagar.
     - Caídas abruptas en la proyección de ingresos por mensualidades.
     - Acumulación excesiva de trámites administrativos pendientes en secretaría u orientación.
     - Aumento injustificado en los tiempos promedio de resolución de trámites.
  3. Permitir configurar umbrales de activación por período y área responsable.
  4. Definir usuarios y roles destinatarios de las alertas según el departamento afectado.
  5. Incorporar niveles de severidad (`Baja`, `Media`, `Alta`, `Crítica`).
  6. Evitar el despacho repetitivo de alertas ante una misma condición persistente.
  7. Mantener un historial completo de alertas emitidas en hoja `AlertasInstitucionalesLogs`.
  8. Permitir reconocer, documentar revisión y cerrar formalmente una alerta activa.
  9. Identificar con precisión el indicador, período y condición cuantitativa que originaron la alerta.
  10. Mantener estricta separación de acceso entre alertas académicas, financieras y operativas.
  11. Restringir la visualización y gestión de alertas según el perfil y permisos del usuario.
- **Cambios Necesarios:**
  - Extender el evaluador de alertas existente en el backend (`evaluateAndDispatchInstitutionalAlerts`).
  - Integrar las reglas de evaluación con el diccionario centralizado de indicadores.
  - Incorporar interfaz de configuración de umbrales para administradores.
  - Integrar las alertas en los paneles de control y en el centro de notificaciones multicanal.
  - Incorporar máquina de estados para el seguimiento de alertas (`Activa`, `EnRevision`, `Mitigada`, `Cerrada`).
- **Comportamiento Esperado:**
  Cuando un indicador alcance una condición configurada, el sistema generará una alerta para los responsables correspondientes.
  Las alertas deben ser señales de revisión, no conclusiones automáticas de fraude, negligencia o incumplimiento.
- **Criterios de Aceptación:**
  - [ ] Una condición que supera el umbral configurado genera una alerta institucional estructurada.
  - [ ] Una condición que permanece dentro de los rangos normales no genera alertas espurias.
  - [ ] La alerta identifica claramente el indicador, período, valor observado y umbral límite.
  - [ ] Los destinatarios de la notificación corresponden exclusivamente a los roles autorizados para el área.
  - [ ] Una misma condición no resuelta no produce notificaciones duplicadas ilimitadas.
  - [ ] Los responsables autorizados pueden reconocer y cerrar formalmente la alerta.
  - [ ] El historial de alertas conserva todos los cambios de estado y notas de revisión.
  - [ ] Las alertas académicas preexistentes siguen funcionando correctamente sin regresiones.
- **Estado:** [ ] Pendiente

---

### [F24-Task15] [P2] [Eficiencia Operativa - Indicadores de Tiempos de Resolución y Eficiencia Administrativa]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Diccionario de indicadores (`F24-Task02`), filtros (`F24-Task03`), fuentes administrativas normalizadas (`F24-Task04`).
- **Capacidades Relacionadas:** F24-007, F24-008.
- **Problema Detectado:**
  Los informes administrativos permiten consultar trámites y movimientos, pero faltan métricas de tiempos de resolución y seguimiento de eficiencia operativa.
- **Requisitos Funcionales:**
  1. Incorporar indicadores cuantitativos para trámites y solicitudes institucionales:
     - Cantidad total de solicitudes recibidas en el período.
     - Cantidad de solicitudes actualmente pendientes de resolución.
     - Cantidad de solicitudes resueltas satisfactoriamente.
     - Cantidad de solicitudes que superaron el tiempo límite estipulado (vencidas).
     - Tiempo promedio de resolución (en horas y días hábiles).
     - Tiempo mediano de resolución para eliminar sesgos por valores atípicos.
     - Tiempo máximo registrado en un trámite resuelto.
     - Volumen de solicitudes atendidas por cada responsable individual.
     - Volumen de solicitudes procesadas por departamento institucional.
     - Porcentaje global de cumplimiento de plazos establecidos (SLA operativo).
  2. Diferenciar formalmente en el cálculo las fechas de creación, asignación, inicio de atención, resolución y cierre definitivo.
  3. Permitir filtrar las métricas por tipo de trámite, departamento, responsable y período de tiempo.
  4. Diferenciar solicitudes canceladas voluntariamente, rechazadas con justificación, reabiertas y completadas.
  5. Identificar solicitudes que han sufrido múltiples derivaciones o cambios de responsable.
  6. Permitir comparar tiempos de resolución entre períodos consecutivos.
  7. Integrar los resultados analíticos en los paneles de control de administración y dirección.
- **Cambios Necesarios:**
  - Identificar los registros que almacenan el ciclo de vida de los trámites (`SolicitudesTramites`, `RevisionesDecisionesTramite`).
  - Incorporar funciones de cálculo de duración y métricas de rendimiento en el backend.
  - Normalizar los estados incluidos y excluidos según las reglas semánticas.
  - Integrar los nuevos indicadores con el diccionario semántico centralizado.
  - Adaptar los informes administrativos existentes para presentar métricas de eficiencia.
- **Comportamiento Esperado:**
  La institución podrá conocer cuántos trámites se reciben, cuánto tardan en resolverse y qué departamentos acumulan solicitudes pendientes.
  Los tiempos deben calcularse a partir de eventos reales y no de fechas estimadas.
- **Criterios de Aceptación:**
  - [ ] El tiempo de resolución calculado coincide exactamente con la diferencia entre las fechas de inicio y finalización del trámite.
  - [ ] Los trámites aún no resueltos no se contabilizan erróneamente como resueltos o completados.
  - [ ] Las solicitudes canceladas y rechazadas se clasifican y contabilizan según las reglas documentadas.
  - [ ] Los trámites reabiertos conservan su trazabilidad e historial de tiempos acumulados.
  - [ ] Los promedios y medianas calculados corresponden estrictamente a los registros fuente analizados.
  - [ ] Los filtros por departamento y responsable aplican de forma fidedigna sobre los indicadores.
  - [ ] Los indicadores de eficiencia se presentan de manera coherente en informes y cuadros de mando.
- **Estado:** [ ] Pendiente

---

### BLOQUE 5. Analítica institucional avanzada

### [F24-Task16] [P2] [Analítica Académica Avanzada - Análisis de Cohortes y Seguimiento Longitudinal de Estudiantes]
- **Componentes Afectados:**
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Protección histórica existente, DataMart (`F24-Task05`), series históricas (`F24-Task07`), filtros (`F24-Task03`).
- **Capacidades Relacionadas:** F24-A03, F24-005.
- **Problema Detectado:**
  No existe un mecanismo para analizar grupos de estudiantes a lo largo de varios ciclos académicos, lo que limita el estudio de permanencia, rendimiento y evolución institucional.
- **Requisitos Funcionales:**
  1. Incorporar capacidades de agrupación de estudiantes por cohortes históricas.
  2. Permitir definir cohortes según:
     - Año de ingreso a la institución.
     - Ciclo académico de inicio.
     - Nivel educativo de matrícula inicial.
     - Grado inicial.
     - Programa o modalidad académica, cuando corresponda.
  3. Seguir longitudinalmente la evolución de cada cohorte a través de los sucesivos años lectivos.
  4. Consultar y graficar para cada cohorte:
     - Matrícula inicial de la cohorte.
     - Estudiantes que permanecen activos ciclo a ciclo.
     - Traslados de grado o sección.
     - Retiros definitivos registrados.
     - Estudiantes egresados o graduados.
     - Tasa de permanencia porcentual.
     - Evolución del rendimiento académico promedio de la cohorte.
     - Tasa de reprobación acumulada.
  5. Permitir comparar visual y numéricamente dos o más cohortes diferentes.
  6. Diferenciar con precisión estudiantes que se trasladan internamente de aquellos que desertan o abandonan la institución.
  7. Mantener identificadores históricos estables que vinculen al alumno a través de los ciclos.
  8. Respetar estrictamente los permisos RBAC/ABAC sobre la consulta de información individual y anonimizar datos cuando se presenten métricas agregadas.
- **Cambios Necesarios:**
  - Incorporar mecanismos de identificación y etiquetado de cohortes en el modelo de datos.
  - Integrar los registros históricos de matrículas y movimientos de expedientes estudiantiles.
  - Incorporar endpoints de consulta longitudinal (`getStudentCohortLongitudinalAnalytics`).
  - Integrar los resultados analíticos con el DataMart y las vistas de series históricas.
  - Crear componentes visuales de seguimiento matricial de cohortes en la interfaz.
- **Comportamiento Esperado:**
  La institución podrá seleccionar una cohorte de ingreso y seguir su evolución durante diferentes años lectivos, identificando permanencia, rendimiento y movimientos.
- **Criterios de Aceptación:**
  - [ ] Cada estudiante se vincula de manera unívoca con la cohorte correspondiente a su ingreso.
  - [ ] Las promociones o cambios de grado ordinarios no alteran la pertenencia a la cohorte original.
  - [ ] Los traslados internos de sección no se contabilizan erróneamente como deserción.
  - [ ] Los retiros definitivos se contabilizan fidedignamente según su estado y fecha efectiva.
  - [ ] Las cifras agregadas de la cohorte coinciden con los registros históricos individuales de matrícula.
  - [ ] La comparación entre diferentes cohortes utiliza períodos y métricas equivalentes.
  - [ ] Los resultados analíticos históricos permanecen estables ante cambios en la configuración académica actual.
- **Estado:** [ ] Pendiente

---

### [F24-Task17] [P2] [Analítica de Riesgos - Detección de Anomalías en Indicadores Financieros y Operativos]
- **Componentes Afectados:**
  - `backend/accounting-service/Code.gs`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** Indicadores centralizados (`F24-Task02`), DataMart (`F24-Task05`), tendencias (`F24-Task07`), alertas (`F24-Task14`).
- **Capacidades Relacionadas:** F24-A02, F24-022.
- **Problema Detectado:**
  La detección de riesgo está presente en el área académica, pero no existe una capacidad equivalente para identificar patrones inusuales en operaciones financieras y administrativas.
- **Requisitos Funcionales:**
  1. Incorporar motor de análisis de anomalías sobre indicadores y transacciones financieras y operativas.
  2. Evaluar y detectar automáticamente:
     - Gastos inusuales que superen en más de 2 desviaciones estándar el promedio histórico de la partida.
     - Variaciones abruptas o caídas imprevistas en los flujos diarios de ingresos.
     - Cambios atípicos en las tasas de morosidad por nivel o grado.
     - Desviaciones presupuestarias no justificadas en centros de costo.
     - Potenciales duplicaciones de pagos o movimientos con referencias o montos idénticos.
     - Incrementos inesperados en el volumen de requisiciones de materiales.
     - Acumulación anormal de solicitudes no atendidas en un área específica.
  3. Permitir configurar umbrales cuantitativos y reglas estadísticas de detección.
  4. Identificar con claridad el período, la partida y los valores de referencia que originaron la anomalía.
  5. Diferenciar formalmente anomalías detectadas por reglas fijas de aquellas basadas en análisis estadístico descriptivo.
  6. Permitir a los responsables revisar, justificar o descartar falsos positivos documentando la razón.
  7. Registrar en bitácora todas las revisiones y acciones correctivas tomadas.
  8. Evitar categorizar automáticamente una anomalía como fraude o irregularidad penal; debe tratarse estrictamente como una señal para revisión humana.
- **Cambios Necesarios:**
  - Extender los mecanismos analíticos del backend con algoritmos de detección de valores atípicos (outliers).
  - Integrar datos históricos del DataMart para calcular medias y varianzas de referencia.
  - Incorporar reglas estadísticas configurables en metadatos del servicio contable.
  - Crear una vista de auditoría y revisión de anomalías operativas en el panel de control.
  - Registrar los estados y dictámenes de revisión de anomalías en hoja de bitácora.
- **Comportamiento Esperado:**
  El sistema identificará variaciones que merecen revisión y ofrecerá información suficiente para que el responsable investigue su origen.
- **Criterios de Aceptación:**
  - [ ] Una variación que cumple con la regla de anomalía genera una bandera de advertencia en el sistema.
  - [ ] La ficha de anomalía presenta con transparencia el valor observado y los valores históricos de referencia.
  - [ ] Los falsos positivos pueden ser marcados como revisados y justificados por los auditores autorizados.
  - [ ] Las anomalías no disparan automáticamente bloqueos o sanciones irreversibles sin intervención humana.
  - [ ] Únicamente los usuarios con roles de supervisión o auditoría pueden consultar las banderas de anomalía.
  - [ ] El historial conserva íntegramente las revisiones, comentarios y resoluciones registradas.
  - [ ] Las reglas y umbrales de detección pueden ajustarse sin modificar el código fuente de los informes.
- **Estado:** [ ] Pendiente

---

### [F24-Task18] [P2] [Informes Consolidados - Informes Institucionales Consolidados y Análisis Multidimensional]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `js/ui-common.js`
- **Dependencias Expuestas:** Catálogo (`F24-Task01`), diccionario (`F24-Task02`), fuentes normalizadas (`F24-Task04`), DataMart (`F24-Task05`), exportador (`F24-Task08`).
- **Capacidades Relacionadas:** F24-A06, F24-A07, F24-001.
- **Problema Detectado:**
  Existen informes consolidados parciales, pero la integración entre áreas no está suficientemente extendida. La institución necesita informes ejecutivos que reúnan indicadores relacionados sin duplicar cálculos ni perder el origen de los datos.
- **Requisitos Funcionales:**
  1. Ampliar y formalizar los informes ejecutivos consolidados:
     - Resumen Ejecutivo Institucional (Rectoría).
     - Informe Consolidado de Matrícula y Retención.
     - Informe Integrado de Rendimiento Académico y Asistencia.
     - Informe Consolidado de Situación Financiera y Flujo de Fondos.
     - Informe de Ejecución Presupuestaria y Costos Operativos.
     - Informe Consolidado de Gestión de Expedientes y Movimientos.
     - Informe Integrado de Productividad y Trámites Administrativos.
  2. Permitir agrupar y desagregar los resultados consolidados por:
     - Período o ciclo lectivo.
     - Departamento institucional.
     - Nivel educativo.
     - Grado y sección.
     - Categoría financiera.
     - Usuario responsable.
  3. Permitir la comparación analítica entre unidades institucionales utilizando indicadores normalizados.
  4. Permitir visualizar indicadores de distintas áreas en una misma vista correlacionada (ej. asistencia vs rendimiento).
  5. Mantener claramente identificable la fuente de datos que respalda cada sección del informe.
  6. Evitar duplicar registros u operaciones al cruzar información de diferentes microservicios.
  7. Incorporar navegación interactiva hacia el detalle transaccional de cada sección del informe.
  8. Respetar estrictamente las barreras de permisos RBAC de cada área en los bloques consolidados.
  9. Permitir la exportación íntegra del informe consolidado en formatos estructurados y PDF formal.
- **Cambios Necesarios:**
  - Ampliar los servicios de generación de informes para orquestar consultas a múltiples dominios.
  - Integrar las llamadas con el diccionario semántico centralizado.
  - Utilizar las fuentes normalizadas y agregados del DataMart para minimizar el tiempo de respuesta.
  - Incorporar componentes de visualización multidimensional en la interfaz gráfica.
  - Integrar la navegación contextual hacia los informes específicos de cada área.
  - Adaptar el exportador universal para generar documentos consolidados con tablas múltiples.
- **Comportamiento Esperado:**
  Dirección podrá consultar un informe institucional que reúna los indicadores principales de diferentes áreas y profundizar en cada uno sin perder los filtros ni la trazabilidad.
- **Criterios de Aceptación:**
  - [ ] Cada indicador incluido en el informe consolidado conserva su definición institucional original.
  - [ ] Los datos consolidados coinciden exactamente con los informes individuales correspondientes de cada módulo.
  - [ ] No existen duplicaciones de registros ni conteos dobles derivados de la combinación de fuentes.
  - [ ] Las unidades comparadas utilizan criterios y períodos homogéneos.
  - [ ] Las vistas de detalle muestran únicamente la información que el usuario está autorizado a consultar.
  - [ ] Los fallos o retrasos en una fuente secundaria se identifican explícitamente sin enmascarar datos.
  - [ ] La exportación estructurada conserva fielmente la estructura matricial y los valores numéricos del informe.
- **Estado:** [ ] Pendiente

---

### [F24-Task19] [P2] [Control Presupuestario - Seguimiento de Objetivos Presupuestarios y Desviaciones Financieras]
- **Componentes Afectados:**
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** Diccionario (`F24-Task02`), metas (`F24-Task12`), alertas (`F24-Task14`), fuentes normalizadas (`F24-Task04`).
- **Capacidades Relacionadas:** F24-A05, F24-006.
- **Problema Detectado:**
  La auditoría confirma que ya existen mecanismos de disponibilidad presupuestaria y ejecución presupuestaria. Sin embargo, estas capacidades deben integrarse con el sistema general de indicadores, metas y paneles para facilitar el seguimiento de desviaciones.
- **Requisitos Funcionales:**
  1. Reutilizar e integrar los mecanismos presupuestarios existentes en el marco analítico institucional.
  2. Integrar en un cuadro comparativo unificado:
     - Presupuesto institucional aprobado por partida y centro de costo.
     - Presupuesto comprometido en órdenes de compra y contratos vigentes.
     - Presupuesto ejecutado y devengado en asientos contables.
     - Saldo disponible real en tiempo real.
     - Ingresos proyectados según tarifas de cobro y matrícula.
     - Ingresos efectivamente confirmados en caja y bancos.
     - Gastos proyectados versus gastos reales devengados.
  3. Permitir analizar las desviaciones financieras por:
     - Período o ejercicio fiscal.
     - Código de cuenta contable.
     - Categoría de gasto o ingreso.
     - Departamento institucional.
     - Proyecto o unidad operativa, cuando exista.
  4. Calcular automáticamente variaciones absolutas y porcentuales entre lo presupuestado y lo ejecutado.
  5. Identificar y clasificar situaciones de sobreejecución y subejecución presupuestaria.
  6. Incorporar alertas configurables ante desviaciones que superen los márgenes de tolerancia institucionales.
  7. Permitir la consulta interactiva de los movimientos contables individuales que originaron una desviación.
  8. Conservar de forma histórica e inalterable los períodos fiscales anteriores cerrados.
- **Cambios Necesarios:**
  - Integrar los informes presupuestarios existentes (`getBudgetExecutionReport`, `checkBudgetAvailability`) con el diccionario de indicadores.
  - Incorporar componentes visuales de seguimiento presupuestario (gráficos de ejecución vs presupuesto).
  - Integrar las metas financieras en los paneles de administración y contabilidad.
  - Extender el sistema de alertas tempranas hacia las desviaciones presupuestarias no justificadas.
  - Reutilizar las reglas contables existentes de doble partida sin duplicar cálculos de saldos.
- **Comportamiento Esperado:**
  Contabilidad y dirección podrán conocer cuánto se ha presupuestado, comprometido y ejecutado, así como identificar diferencias y consultar sus movimientos de origen.
- **Criterios de Aceptación:**
  - [ ] Los valores consolidados coinciden exactamente con los informes presupuestarios y contables existentes.
  - [ ] Los montos comprometidos no se confunden ni se suman erróneamente a los gastos efectivamente ejecutados.
  - [ ] Los saldos disponibles se calculan con exactitud (`Aprobado - Comprometido - Ejecutado`).
  - [ ] Las desviaciones reflejan fidedignamente sus valores absolutos y porcentuales.
  - [ ] La suma de los movimientos de detalle coincide al 100% con el total de la partida presupuestaria.
  - [ ] Los ejercicios fiscales anteriores conservan sus resultados históricos inalterables.
  - [ ] Los usuarios sin permisos contables no pueden consultar información presupuestaria restringida.
- **Estado:** [ ] Pendiente

---

### [F24-Task20] [P2] [Interoperabilidad - API de Consulta y Exportación Estructurada de Indicadores Institucionales]
- **Componentes Afectados:**
  - `backend/developer-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Diccionario (`F24-Task02`), catálogo (`F24-Task01`), filtros (`F24-Task03`), fuentes normalizadas (`F24-Task04`), paginación y rendimiento (`F24-Task06`).
- **Capacidades Relacionadas:** F24-A08, F24-008.
- **Problema Detectado:**
  Los servicios existentes devuelven estructuras JSON, pero no se ha identificado una capa institucional estandarizada para consumir indicadores e informes desde otras herramientas autorizadas.
- **Requisitos Funcionales:**
  1. Estandarizar la interfaz de programación y formato de respuestas JSON para consulta de indicadores analíticos.
  2. Permitir la consulta de métricas utilizando los identificadores semánticos definidos en el diccionario institucional.
  3. Incorporar parámetros de consulta universales y normalizados:
     - `periodo` / `anoLectivo`.
     - `filtros` (grado, seccion, departamento, cuenta).
     - `agrupacion` (porGrado, porMes, porDepartamento).
     - `paginacion` (`page`, `limit`).
     - `ordenamiento` (`campo`, `direccion`).
  4. Devolver en cada respuesta estructurada:
     - Identificador del indicador.
     - Valor cuantitativo o serie de datos.
     - Unidad de medida oficial.
     - Período evaluado.
     - Marca temporal de última actualización.
     - Fuente o servicio de datos participante.
     - Versión semántica de la definición aplicada.
  5. Incorporar validación estricta de permisos de acceso en base a tokens HMAC y roles RBAC autorizados.
  6. Registrar en bitácora de seguridad todas las consultas de la API analítica.
  7. Incorporar límites adaptativos de volumen y frecuencia de consulta (rate limiting) para proteger las cuotas de Google Apps Script.
  8. Permitir exportación estructurada en JSON schema estandarizado para sistemas externos autorizados.
  9. Versionar explícitamente los contratos de respuesta de la API para garantizar compatibilidad hacia atrás.
  10. Evitar estrictamente la exposición de identificadores internos sensibles, contraseñas o datos personales en las respuestas analíticas.
- **Cambios Necesarios:**
  - Crear una capa de despacho estructurada en el backend (`getInstitutionalIndicatorApi`).
  - Integrar el diccionario semántico con los contratos de la API.
  - Estandarizar las respuestas de error y códigos de estado (400, 401, 403, 404, 429, 500).
  - Incorporar middleware de validación de cuotas y permisos.
  - Documentar formalmente los endpoints analíticos en las especificaciones del sistema.
- **Comportamiento Esperado:**
  Los componentes autorizados podrán consultar indicadores institucionales mediante una estructura común, sin tener que conocer la implementación interna de cada servicio.
- **Criterios de Aceptación:**
  - [ ] Las respuestas de la API cumplen estrictamente con la especificación JSON documentada.
  - [ ] Los indicadores se consultan de forma fidedigna mediante sus identificadores institucionales oficiales.
  - [ ] Los parámetros de filtro y períodos se aplican correctamente sobre las consultas.
  - [ ] Los permisos institucionales se validan en el servidor antes de despachar información.
  - [ ] Las consultas de gran volumen respetan los límites de paginación y cuotas establecidos.
  - [ ] Los contratos de respuesta están debidamente versionados.
  - [ ] Las respuestas analíticas no exponen datos sensibles o no autorizados.
  - [ ] Los valores devueltos por la API coinciden exactamente con los informes que utilizan los mismos parámetros.
- **Estado:** [ ] Pendiente

---

### BLOQUE 6. Validación, regresión y conservación de capacidades existentes

### [F24-Task21] [P0] [Validación y Regresión - Validación Integral y Pruebas de Regresión de Informes e Indicadores]
- **Componentes Afectados:**
  - `backend/developer-service/Code.gs`
  - `tests/regression/academic-grading-suite.js`
- **Dependencias Expuestas:** Todas las tareas anteriores de la Fase 24 (`F24-Task01` a `F24-Task20`).
- **Capacidades Relacionadas:** F24-001 a F24-025 y F24-A01 a F24-A08.
- **Problema Detectado:**
  La auditoría declara completas y verificadas varias capacidades fundamentales. Las nuevas implementaciones deben conservar sus resultados y evitar que la centralización, las agregaciones o las exportaciones alteren las reglas ya comprobadas.
- **Requisitos Funcionales:**
  1. Mantener inalterables los resultados de los informes y servicios analíticos existentes:
     - Informe financiero y cobranza confirmada (`REP-CONT-01`).
     - Rendimiento académico por grado y sección (`REP-ACAD-01`).
     - Indicadores curriculares de notas publicadas (`getCurricularAnalyticsReport`).
     - Resumen financiero de caja y bancos (`getFinancialSummary`).
     - Comparativo financiero multianual por cuentas (`getComparativeFinancialSummary`).
     - Proyección de flujo de caja semestral (`getCashFlowSixMonthProjection`).
     - Indicadores de ejecución y disponibilidad presupuestaria (`checkBudgetAvailability`, `getBudgetExecutionReport`).
  2. Conservar las exclusiones financieras estrictas: no contabilizar jamás operaciones pendientes, canceladas o rechazadas como ingresos efectivos.
  3. Conservar las reglas académicas estrictas: no contabilizar jamás borradores o notas no publicadas en promedios y reportes oficiales.
  4. Mantener los controles de permisos y aislamiento de ámbito por rol (RBAC/ABAC) existentes.
  5. Mantener la marca temporal ISO de generación en todos los reportes generados.
  6. Mantener los eventos de trazabilidad y auditoría estructurada (`REPORT_GENERATED`, `REPORT_FAILED`).
  7. Conservar el esquema de particiones históricas mediante `CatalogoSpreadsheets`.
  8. Comprobar la equivalencia matemática absoluta entre los cálculos originales y los centralizados en el diccionario semántico.
  9. Comprobar la equivalencia de resultados entre las consultas directas en tiempo real y las consultas sobre el DataMart de agregaciones.
  10. Verificar que los cuadros de mando, informes tabulares y exportaciones descargables produzcan resultados completamente consistentes entre sí.
- **Cambios Necesarios:**
  - Ampliar la suite de regresión del sistema (`runPhase24ReportsAndAnalyticsRegressionSuite`).
  - Incorporar conjuntos de datos de prueba de referencia con resultados matemáticos precalculados.
  - Añadir pruebas automatizadas para el catálogo central y el diccionario semántico.
  - Añadir pruebas de estrés y reconstrucción histórica en el DataMart.
  - Incorporar pruebas de integridad y neutralización de fórmulas en exportadores CSV/XLSX.
  - Incorporar pruebas de rechazo de accesos no autorizados en informes y paneles.
  - Verificar continuamente que los cambios no introduzcan regresiones sobre las 53 pruebas de regresión preexistentes.
- **Comportamiento Esperado:**
  Las nuevas implementaciones deberán contar con pruebas reproducibles que permitan comprobar que las capacidades existentes continúan funcionando y que las nuevas no introducen regresiones en el ecosistema analítico.
- **Criterios de Aceptación:**
  - [ ] La suite de regresión existente mantiene el 100% de sus 53 pruebas aprobadas.
  - [ ] Los informes financieros conservan sus exclusiones estrictas de transacciones no confirmadas.
  - [ ] Los informes académicos conservan sus reglas de exclusión de calificaciones en borrador.
  - [ ] Los indicadores del diccionario semántico centralizado producen resultados idénticos a los cálculos originales.
  - [ ] Los datos agregados del DataMart coinciden exactamente con los cálculos sobre registros transaccionales fuente.
  - [ ] Los archivos exportados coinciden en un 100% con los datos consultados en pantalla.
  - [ ] Los accesos directos o no autorizados continúan siendo rechazados con código de seguridad.
  - [ ] Las particiones históricas conservan íntegros sus resultados ante cambios en ciclos actuales.
  - [ ] Todos los eventos de generación y fallos continúan registrándose en la bitácora de auditoría.
  - [ ] Cualquier inconsistencia o regresión detectada bloquea la entrega hasta su resolución.
- **Estado:** [ ] Pendiente

---
## FASE 25 — INTEGRACIONES EXTERNAS Y COMPATIBILIDAD INSTITUCIONAL

### P0 — PRIORIDAD CRÍTICA

### [F25-Task01] [P0] [Catálogo de Integraciones - Catálogo Unificado de Integraciones Externas]
- **Componentes Afectados:**
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/developer-service/Code.gs`
  - Hojas `IntegracionesPasarelas`, `CatalogoSpreadsheets`, `CatalogoIntegracionesExternas`
- **Estado de Partida:** Implementación parcial.
- **Dependencias Expuestas:** Ninguna obligatoria para crear el catálogo. La incorporación de cada conector depende de su registro y configuración existentes.
- **Capacidades Relacionadas:** F25-001, F25-016, F25-018.
- **Problema que Resuelve:**
  La configuración de integraciones se encuentra distribuida en diferentes registros y servicios. No existe una vista centralizada que permita conocer todas las conexiones externas, sus responsables, permisos, dependencias, estado operativo y últimas ejecuciones.
- **Requisitos Funcionales:**
  1. Crear un catálogo unificado denominado `CatalogoIntegracionesExternas` que consolide las integraciones existentes sin duplicar sus configuraciones ni trasladar innecesariamente sus responsabilidades funcionales.
  2. Registrar para cada integración, como mínimo:
     - Identificador único de integración (`integracionId`).
     - Nombre visible y descripción funcional.
     - Categoría: archivos, hojas de cálculo, SACE, correo, calendario, pasarela de pago, API u otros conectores.
     - Proveedor o sistema externo.
     - Servicio interno que utiliza la integración.
     - Responsable funcional y responsable técnico.
     - Dirección del intercambio: entrada, salida o bidireccional.
     - Operaciones admitidas: consultar, importar, exportar, actualizar, sincronizar o recibir notificaciones.
     - Permisos requeridos (RBAC).
     - Dependencias internas y externas.
     - Referencia a la configuración específica del conector.
     - Versión del conector y del contrato aplicable.
     - Fecha de registro y última modificación.
     - Última conexión y última operación satisfactoria.
     - Estado de configuración y estado operativo.
     - Resultado de la última ejecución.
     - Indicador de disponibilidad de credenciales.
     - Documentación o instrucciones de configuración.
  3. Distinguir claramente estos estados de integración:
     - `No configurada`
     - `Pendiente de autorización`
     - `Configurada`
     - `Conectada`
     - `Activa`
     - `Suspendida`
     - `Desconectada`
     - `Con errores`
     - `Deshabilitada`
  4. No considerar una integración operativa únicamente porque exista un registro de configuración.
- **Administración y Permisos:**
  - Administrador del Sistema: administrar todas las integraciones.
  - Contabilidad: gestionar las conexiones financieras que tenga autorizadas.
  - Dirección: consultar el estado general y las operaciones institucionales.
  - Responsables técnicos: administrar las conexiones que tengan asignadas.
  - Otros perfiles: utilizar únicamente las operaciones habilitadas para su rol.
  - La autorización debe comprobarse en el servidor, no únicamente ocultando opciones en la interfaz.
- **Cambios Necesarios:**
  1. Crear el registro centralizado de integraciones en hoja `CatalogoIntegracionesExternas`.
  2. Incorporar las integraciones existentes de pasarelas, Google Sheets, correo y SACE mediante referencias a sus configuraciones actuales.
  3. Relacionar los registros del catálogo con los conectores y contratos correspondientes.
  4. Implementar consultas centralizadas del estado (`getIntegrationsCatalog`).
  5. Incorporar una interfaz administrativa para consultar, filtrar y administrar integraciones.
  6. Permitir activar, suspender o deshabilitar una integración sin eliminar su historial.
  7. Registrar cambios de responsables, permisos y configuración.
  8. Evitar que el catálogo mantenga copias independientes de credenciales o configuraciones que ya tienen un almacenamiento propio.
- **Comportamiento Esperado:**
  Al ingresar al área de integraciones, los usuarios autorizados deben poder consultar todas las conexiones disponibles y conocer cuáles funcionan, cuáles requieren autorización y cuáles presentan errores.
  Al seleccionar una integración, deben poder consultar sus operaciones, dependencias, responsables, historial y estado de conexión.
- **Criterios de Aceptación:**
  - [ ] Todas las integraciones identificadas en la auditoría aparecen en el catálogo.
  - [ ] Cada integración tiene un identificador único e inequívoco.
  - [ ] Las configuraciones existentes siguen funcionando después de incorporarse al catálogo.
  - [ ] El catálogo permite diferenciar configuración, autorización, conexión y operación satisfactoria.
  - [ ] Una integración deshabilitada no puede ejecutar operaciones ni peticiones.
  - [ ] Los cambios administrativos quedan registrados en auditoría.
  - [ ] Un usuario sin privilegios no puede modificar integraciones (rechazo 403 Forbidden).
  - [ ] La suspensión de una integración no elimina su configuración ni su historial.
  - [ ] Los errores de conexión se reflejan en el estado operativo sin exponer secretos.
  - [ ] No existen registros duplicados que representen la misma integración.
- **Estado:** [ ] Pendiente

---

### [F25-Task02] [P0] [Mapeo de Columnas - Persistencia y Administración de Perfiles de Mapeo de Importación]
- **Componentes Afectados:**
  - `backend/accounting-service/Code.gs`
  - Hojas `AuditoriaMigraciones`, `PerfilesMapeoColumnas`
  - `js/ui-common.js`
- **Estado de Partida:** Implementación parcial.
- **Dependencias Expuestas:** F25-002 y F25-005. Reutiliza el importador (`importDataWithColumnMapping`) y la vista previa (`validateImportPreview`).
- **Capacidades Relacionadas:** F25-003, F25-002, F25-005.
- **Problema que Resuelve:**
  Actualmente, el mapeo de columnas se proporciona mediante un objeto JSON en cada operación. Aunque permite importar información con diferentes estructuras, obliga a configurar nuevamente las correspondencias para las importaciones recurrentes. Esto dificulta reutilizar configuraciones entre ciclos académicos, procesos de matrícula, migraciones y actualizaciones de expedientes.
- **Requisitos Funcionales:**
  1. Crear una estructura persistente denominada `PerfilesMapeoColumnas`.
  2. Registrar en cada perfil:
     - Identificador único (`perfilMapeoId`).
     - Nombre descriptivo.
     - Descripción funcional.
     - Tipo de importación (Matrícula, Calificaciones, Expedientes, Pagos).
     - Entidad interna de destino.
     - Formato de archivo compatible (CSV, XLSX).
     - Fuente de datos, cuando corresponda.
     - Configuración de columnas (JSON estructurado).
     - Campo interno asociado a cada columna externa.
     - Reglas de transformación aplicables.
     - Formatos de fecha y números esperados.
     - Campos obligatorios.
     - Valores predeterminados permitidos.
     - Reglas de normalización.
     - Identificador primario utilizado para reconocer registros.
     - Política de actualización de registros existentes.
     - Versión del perfil.
     - Responsable y permisos de utilización.
     - Fecha de creación y modificación.
     - Estado: activo, inactivo u obsoleto.
  3. Configuración individual de correspondencias:
     - Identidad → Identificador del estudiante (Normalización de espacios y separadores).
     - Nombres → Nombres (Texto).
     - Apellidos → Apellidos (Texto).
     - Fecha Nacimiento → Fecha de nacimiento (Conversión de formato).
     - Grado → Grado académico (Resolución contra catálogo institucional).
     - Sección → Sección académica (Resolución según grado).
     - Correo → Correo electrónico (Validación de formato).
  4. Transformaciones controladas admitidas:
     - Eliminar espacios innecesarios (trim).
     - Normalizar mayúsculas y minúsculas.
     - Convertir fechas a formato ISO.
     - Normalizar identificadores oficiales.
     - Convertir valores equivalentes.
     - Resolver valores externos contra catálogos internos.
     - Aplicar valores predeterminados cuando la regla lo permita.
     - No permitir transformaciones que alteren silenciosamente identificadores o información sensible.
  5. Reutilización y administración:
     - Permitir guardar un perfil desde el proceso de importación.
     - Permitir seleccionar un perfil guardado antes de cargar un archivo.
     - Permitir modificar correspondencias antes de confirmar.
     - Permitir duplicar un perfil para crear variantes.
     - Permitir desactivar perfiles obsoletos sin borrar historiales.
     - Permitir perfiles privados y compartidos por rol.
     - Detectar diferencias en encabezados y solicitar ajustes cuando no sea seguro aplicarlo.
  6. Compatibilidad de versiones:
     - El perfil debe conservar su versión y las estructuras internas para las que fue diseñado.
     - Si cambian los campos internos, marcar perfiles incompatibles y solicitar migración sin aplicarlos automáticamente.
- **Cambios Necesarios:**
  1. Crear hoja `PerfilesMapeoColumnas`.
  2. Implementar funciones en backend (`saveMappingProfile`, `getMappingProfiles`, `deleteMappingProfile`).
  3. Integrar la selección de perfiles en el flujo existente de importación en frontend.
  4. Incorporar detección automática de encabezados y sugerencias de correspondencia.
  5. Integrar las reglas de transformación con `validateImportPreview`.
  6. Registrar el perfil y su versión en `AuditoriaMigraciones`.
  7. Incorporar controles de permisos y propiedad sobre los perfiles.
- **Comportamiento Esperado:**
  Un usuario autorizado debe poder configurar una importación una sola vez, guardar el mapeo y reutilizarlo posteriormente.
  Cuando se cargue un archivo compatible, el sistema debe recuperar las correspondencias y mostrar una vista previa. Si detecta columnas nuevas, ausentes o incompatibles, debe advertirlo antes de permitir la confirmación.
- **Criterios de Aceptación:**
  - [ ] Crear y guardar un perfil de mapeo con todas sus reglas.
  - [ ] Cerrar el proceso y recuperar el perfil posteriormente desde el catálogo.
  - [ ] Aplicar el perfil a un archivo con la misma estructura y verificar carga exitosa.
  - [ ] Comprobar que las correspondencias se recuperan correctamente.
  - [ ] Probar un archivo con columnas en distinto orden y verificar mapeo exacto por nombre.
  - [ ] Probar un archivo con encabezados modificados y verificar advertencias.
  - [ ] Comprobar que las columnas obligatorias sin correspondencia bloquean la importación.
  - [ ] Verificar que las transformaciones se aplican antes de la validación definitiva.
  - [ ] Comprobar que un perfil incompatible no se utiliza silenciosamente.
  - [ ] Verificar que los cambios estructurales generan una nueva versión secuencial del perfil.
  - [ ] Comprobar que las importaciones anteriores conservan la versión de perfil utilizada.
  - [ ] Verificar que los usuarios no pueden modificar perfiles fuera de sus permisos autorizados.
- **Estado:** [ ] Pendiente

---

### [F25-Task03] [P0] [Validación de Datos - Detección Avanzada de Duplicados e Integridad Referencial]
- **Componentes Afectados:**
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - Hojas `AuditoriaMigraciones`, `Matriculas`, `ExpedientesEstudiantes`, `Usuarios`
- **Estado de Partida:** Implementación parcial.
- **Dependencias Expuestas:** F25-002, F25-003 y F25-005. Reutiliza el importador y la vista previa.
- **Capacidades Relacionadas:** F25-004, F25-002, F25-005.
- **Problema que Resuelve:**
  La validación actual comprueba la presencia de un identificador obligatorio, pero no ofrece una detección suficientemente completa de colisiones por identidad, correo y otras referencias. Una importación puede contener estudiantes ya registrados, registros repetidos dentro del propio archivo o referencias a entidades académicas inexistentes.
- **Requisitos Funcionales:**
  1. Ampliar el proceso de validación previa para identificar coincidencias y conflictos antes de escribir información.
  2. Criterios de identificación según entidad:
     - Para estudiantes: identificador institucional, número de identidad (DNI), identificador externo, correo electrónico y combinaciones de campos.
     - Para docentes y usuarios: identificador institucional/laboral, correo electrónico, identificador externo y claves únicas.
     - No utilizar únicamente nombres y apellidos para fusionar registros.
  3. Clasificación estricta de coincidencias:
     - `Nuevo`
     - `Coincidencia exacta con un registro existente`
     - `Posible duplicado`
     - `Duplicado dentro del archivo`
     - `Conflicto entre identificadores`
     - `Registro incompleto`
     - `Registro con referencias inválidas`
     - `Registro apto para actualización`
  4. Mostrar qué campos produjeron la coincidencia en la vista previa.
  5. Políticas de tratamiento configurables por tipo de importación:
     - Crear únicamente registros nuevos.
     - Omitir registros existentes.
     - Actualizar campos autorizados.
     - Reemplazar campos seleccionados.
     - Enviar coincidencias ambiguas a revisión manual.
     - Rechazar registros que presenten conflictos.
     - No sobrescribir datos existentes por campos vacíos en el archivo importado.
  6. Validación de integridad referencial:
     - Grado académico existente y activo.
     - Sección perteneciente al grado indicado.
     - Período lectivo válido.
     - Asignatura perteneciente a la estructura curricular correspondiente.
     - Docente registrado y habilitado.
     - Responsable vinculado al expediente correcto.
     - Identificar referencias no resueltas antes de confirmar la importación.
- **Cambios Necesarios:**
  1. Ampliar la validación previa (`validateImportPreview`) para detectar colisiones en registros internos.
  2. Incorporar búsqueda de colisiones por identificadores, DNI y correo electrónico.
  3. Normalizar valores antes de compararlos (eliminación de guiones, espacios, mayúsculas).
  4. Implementar reglas de coincidencia por entidad.
  5. Incorporar políticas de creación, omisión y actualización.
  6. Incorporar validaciones de referencias académicas y administrativas.
  7. Integrar los resultados con la vista previa tabular.
  8. Registrar las coincidencias y decisiones en `AuditoriaMigraciones`.
- **Comportamiento Esperado:**
  La vista previa debe informar cuántos registros son nuevos, cuántos coinciden con registros existentes, cuántos presentan posibles duplicados y cuántos contienen referencias inválidas.
  Los casos ambiguos deben requerir una decisión explícita. El sistema no debe fusionar automáticamente expedientes cuando no exista certeza suficiente.
- **Criterios de Aceptación:**
  - [ ] Importar un registro nuevo y comprobar que se clasifica correctamente como nuevo.
  - [ ] Importar nuevamente el mismo registro y comprobar que no se duplica en el sistema.
  - [ ] Probar dos registros con el mismo nombre y diferentes identificadores sin fusionarlos.
  - [ ] Probar dos registros con el mismo identificador y nombres diferentes detectando conflicto.
  - [ ] Probar coincidencias por correo electrónico.
  - [ ] Probar identificadores con espacios, guiones y diferencias de formato verificando normalización.
  - [ ] Detectar duplicados que ocurran dentro del mismo archivo cargado.
  - [ ] Probar referencias a grados, secciones y asignaturas inexistentes y comprobar bloqueo.
  - [ ] Comprobar que las coincidencias ambiguas requieren revisión manual obligatoria.
  - [ ] Verificar que los campos vacíos no eliminan información existente sin una regla expresa.
  - [ ] Comprobar que un registro rechazado no modifica el expediente original.
  - [ ] Verificar que todas las decisiones quedan registradas en `AuditoriaMigraciones`.
- **Estado:** [ ] Pendiente

---

### P1 — PRIORIDAD ALTA

### [F25-Task04] [P1] [Pasarelas de Pago - Recepción Autenticada de Webhooks de Pasarelas de Pago]
- **Componentes Afectados:**
  - `backend/accounting-service/Code.gs`
  - Hojas `IntegracionesPasarelas`, `EventosWebhooksPasarelas`, `MovimientosCajaBancos`, `CargosEstudiante`
- **Estado de Partida:** Implementación parcial.
- **Dependencias Expuestas:** Configuración de pasarelas existente (`configureGatewayIntegration`), seguridad HMAC, contratos API y modelo de cuentas por cobrar.
- **Capacidades Relacionadas:** F25-011, F25-015, F25-016.
- **Problema que Resuelve:**
  La plataforma permite configurar pasarelas y realizar pruebas sintéticas de conexión, pero no dispone de un mecanismo completo para recibir y procesar notificaciones asíncronas de los proveedores. Sin esta capacidad, una transacción puede completarse en el proveedor externo sin que la plataforma reciba y procese automáticamente su resultado.
- **Requisitos Funcionales:**
  1. Implementar un receptor de eventos externos (`handlePaymentGatewayWebhook`) para procesar notificaciones de las pasarelas configuradas.
  2. Adaptador específico por proveedor (tarjetas, transferencias bancarias, pasarelas locales e internacionales).
  3. Recepción de eventos:
     - Recibir solicitudes HTTP POST del proveedor externo.
     - Identificar la pasarela de origen mediante endpoint o payload.
     - Identificar el tipo de evento (`payment.succeeded`, `payment.failed`, `charge.refunded`).
     - Identificar la transacción externa única.
     - Validar la autenticidad del mensaje.
     - Interpretar su contenido y registrar la recepción.
     - Determinar si el evento ya fue procesado previamente.
     - Enviar el evento a procesamiento financiero seguro.
  4. Validación de autenticidad:
     - Verificar firmas criptográficas (HMAC-SHA256 / RSA) según especificación del proveedor.
     - Validar secretos o tokens de autenticación compartidos.
     - Comprobar los encabezados requeridos (Timestamp, Signature).
     - Validar la integridad del contenido recibido.
     - Verificar correspondencia con la integración registrada en `IntegracionesPasarelas`.
     - No utilizar una simple comparación de parámetros del cliente como confirmación de pago.
  5. Idempotencia obligatoria:
     - Cada evento debe tener una referencia externa única o clave de idempotencia.
     - Evitar doble registro de pago, doble aplicación a cuentas por cobrar, doble actualización de saldo, doble notificación o doble asiento contable.
  6. Procesamiento financiero:
     - Relacionar transacción externa con referencia de pago interna y estudiante/responsable.
     - Validar importe, moneda y fecha efectiva.
     - Distinguir estados: `Pendiente`, `Confirmado`, `Rechazado`, `Cancelado`, `Reembolsado`, `En disputa`, `Pendiente de conciliación`.
     - No considerar pago confirmado hasta superar validaciones de autenticidad, importe y estado.
  7. Reintentos y eventos fuera de orden:
     - Manejar reenvíos del proveedor sin duplicar operaciones.
     - Manejar eventos recibidos fuera de orden o incompletos.
     - Conservar todos los eventos recibidos en `EventosWebhooksPasarelas` para auditoría y recuperación.
- **Cambios Necesarios:**
  1. Incorporar la recepción de webhooks en `doPost` de `accounting-service`.
  2. Implementar un adaptador para cada proveedor soportado.
  3. Incorporar verificación de firmas criptográficas.
  4. Crear hoja `EventosWebhooksPasarelas` para persistir eventos crudos.
  5. Implementar control de idempotencia estricto por `transaccionExternaId`.
  6. Relacionar eventos con cargos en `CargosEstudiante`.
  7. Incorporar validación de importe, moneda y referencia antes de liquidar.
  8. Registrar movimientos financieros confirmados en `MovimientosCajaBancos`.
  9. Incorporar estados de procesamiento y cola de recuperación.
  10. Integrar el resultado con las herramientas de conciliación bancaria existentes.
- **Comportamiento Esperado:**
  Cuando una pasarela confirme una transacción, la plataforma debe recibir el evento, verificarlo, identificar la operación interna y actualizar su estado de manera controlada.
  Si la notificación no puede verificarse o no coincide con la transacción esperada, debe quedar pendiente de revisión y no modificar los saldos financieros.
- **Criterios de Aceptación:**
  - [ ] Recibir un evento válido desde un entorno de pruebas de pasarela y procesarlo exitosamente.
  - [ ] Rechazar inmediatamente peticiones con firma inválida o adulterada (401/403).
  - [ ] Rechazar eventos correspondientes a una integración desconocida o deshabilitada.
  - [ ] Repetir el mismo evento y comprobar que no se duplica el pago ni la liquidación de saldos.
  - [ ] Probar importes y monedas diferentes a los registrados y verificar marcación como conflicto.
  - [ ] Probar referencias inexistentes y comprobar encolamiento para revisión manual.
  - [ ] Probar eventos de pago rechazado, cancelado y reembolsado actualizando el estado correspondiente.
  - [ ] Probar eventos recibidos fuera de orden sin corromper la máquina de estados financiera.
  - [ ] Interrumpir el procesamiento y verificar que el evento puede recuperarse desde la bitácora.
  - [ ] Comprobar que la recepción no modifica saldos antes de validar íntegramente la transacción.
  - [ ] Verificar que cada evento queda asociado a su transacción interna y comprobante.
  - [ ] Comprobar que las operaciones financieras resultantes mantienen su trazabilidad contable.
- **Estado:** [ ] Pendiente

---

### [F25-Task05] [P1] [Rendimiento y Volumen - Procesamiento Fraccionado de Importaciones Masivas]
- **Componentes Afectados:**
  - `backend/accounting-service/Code.gs`
  - Hojas `AuditoriaMigraciones`, `BloquesImportacionLotes`
  - Servicios de Google Apps Script
- **Estado de Partida:** Requiere mejoras.
- **Dependencias Expuestas:** F25-002, F25-003, F25-004, F25-005 y F25-015.
- **Capacidades Relacionadas:** F25-019, F25-002, F25-005.
- **Problema que Resuelve:**
  Las importaciones se ejecutan dentro de una solicitud `doPost`. Los archivos con más de 1,000 registros pueden acercarse al límite de tiempo de ejecución de Apps Script (6 minutos), provocar interrupciones y dejar operaciones incompletas. La solución no debe limitarse a reducir la cantidad de filas admitidas, sino permitir procesar grandes importaciones mediante bloques controlados, con persistencia del avance y recuperación.
- **Requisitos Funcionales:**
  1. Implementar un mecanismo de procesamiento por lotes (`batch processing`).
  2. Creación de la importación:
     - Generar un identificador único de importación (`importacionId`).
     - Registrar el archivo y su origen.
     - Guardar el perfil de mapeo utilizado.
     - Registrar la cantidad de registros detectados.
     - Ejecutar la validación previa.
     - Crear un resumen de registros válidos, inválidos y duplicados.
     - Preparar los bloques de procesamiento.
     - Conservar una referencia al archivo original o representación persistente para reanudar.
  3. Procesamiento por bloques:
     - Utilizar bloques configurables, con un tamaño inicial de referencia de 200 registros.
     - El tamaño debe poder ajustarse según el tiempo real de procesamiento y límites de cuota.
     - Cada bloque debe registrar: `importacionId`, número de bloque, rango de registros, cantidad procesada, cantidad correcta, cantidad fallida, fecha de inicio/fin, estado y último registro confirmado.
  4. Continuación y recuperación:
     - Si la ejecución termina por tiempo, cuota o fallo temporal, conservar el avance confirmado.
     - Identificar los bloques pendientes.
     - Reanudar desde el último punto seguro sin duplicar registros ya aplicados.
     - Registrar el motivo de la interrupción.
     - Permitir consultar el estado y avance de la importación.
     - Evitar que dos ejecuciones procesen simultáneamente el mismo bloque con `LockService`.
  5. Estados de importación:
     - `Preparada`
     - `Validando`
     - `Pendiente de procesamiento`
     - `En ejecución`
     - `Completada`
     - `Completada con errores`
     - `Interrumpida`
     - `Fallida`
     - `Cancelada`
- **Cambios Necesarios:**
  1. Separar la preparación de una importación de su procesamiento definitivo en el backend.
  2. Implementar almacenamiento persistente del estado de cada importación en `BloquesImportacionLotes`.
  3. Dividir los registros en bloques de tamaño configurable.
  4. Incorporar procesamiento reanudable mediante llamadas secuenciales o triggers.
  5. Implementar protección frente a ejecuciones simultáneas con candados atómicos.
  6. Incorporar control de idempotencia por registro individual.
  7. Integrar el avance con `AuditoriaMigraciones`.
  8. Incorporar endpoint de consulta de progreso (`getImportProgress`).
  9. Permitir identificar y recuperar bloques fallidos.
  10. Optimizar las operaciones de lectura y escritura para utilizar procesamiento por lotes.
- **Comportamiento Esperado:**
  Una importación grande debe poder continuar a través de varias ejecuciones sin exigir que todo el procesamiento termine dentro de una sola solicitud.
  El usuario debe poder consultar el progreso y conocer cuántos registros se han procesado, cuántos faltan y cuántos presentan errores.
  Una interrupción no debe provocar duplicación de registros ni pérdida del avance confirmado.
- **Criterios de Aceptación:**
  - [ ] Procesar exitosamente un archivo de 100 registros en un solo bloque.
  - [ ] Procesar exitosamente un archivo de 1,000 registros fraccionado en bloques de 200.
  - [ ] Procesar archivos de mayor volumen en un entorno controlado verificando estabilidad.
  - [ ] Comprobar que los bloques se ejecutan en el orden secuencial esperado.
  - [ ] Interrumpir deliberadamente una importación y verificar que puede reanudarse desde el último bloque completado.
  - [ ] Repetir una solicitud de continuación y comprobar que no duplica registros ya importados.
  - [ ] Intentar ejecutar dos procesos concurrentes sobre el mismo bloque y verificar la protección de exclusión mutua.
  - [ ] Comprobar que los bloques completados conservan su estado inalterado.
  - [ ] Verificar que los errores de un bloque no ocultan ni invalidan los resultados de los bloques exitosos.
  - [ ] Comprobar que la importación termina con un resumen coherente de totales.
  - [ ] Medir tiempos de ejecución y uso de cuotas confirmando márgenes de seguridad.
  - [ ] Verificar que las operaciones no exceden los límites de ejecución sin una estrategia de continuación.
  - [ ] Comprobar que una importación cancelada no continúa ejecutándose automáticamente.
- **Estado:** [ ] Pendiente

---

### [F25-Task06] [P1] [Sincronización - Sincronización y Reconciliación de Información entre Sistemas]
- **Componentes Afectados:**
  - `backend/accounting-service/Code.gs`
  - `backend/developer-service/Code.gs`
  - Hojas `AuditoriaMigraciones`, `CatalogoSpreadsheets`, `SincronizacionFuentesLogs`
- **Estado de Partida:** Implementación parcial.
- **Dependencias Expuestas:** F25-001, F25-004, F25-007 y F25-015.
- **Capacidades Relacionadas:** F25-014, F25-007, F25-015.
- **Problema que Resuelve:**
  La plataforma registra importaciones y operaciones, pero no dispone de un mecanismo completo de reconciliación bidireccional automática. La existencia de conexiones con fuentes externas no garantiza que los cambios realizados en ambos sistemas se mantengan consistentes.
- **Requisitos Funcionales:**
  1. Implementar un mecanismo de reconciliación que permita comparar los registros internos con los de una fuente externa autorizada.
  2. Identificación persistente de registros:
     - Identificador interno.
     - Identificador externo.
     - Fuente de origen.
     - Fecha de última sincronización.
     - Fecha de última modificación conocida.
     - Estado de sincronización.
     - Versión o referencia de la última operación.
     - No utilizar el nombre del estudiante o de otra entidad como única referencia.
  3. Comparación de datos:
     - Identificar registros nuevos en el origen.
     - Identificar registros nuevos en la plataforma.
     - Identificar registros modificados.
     - Identificar registros sin cambios.
     - Identificar registros eliminados externamente.
     - Identificar registros con conflictos.
     - Identificar registros que no pueden asociarse.
  4. Autoridad de los datos:
     - Definir qué sistema tiene autoridad sobre cada campo configurable por entidad y campo.
     - Ejemplo: la plataforma es fuente principal de expedientes; fuente externa es principal de cobros de banco; ciertos campos requieren actualización manual.
  5. Resolución de conflictos:
     - Detectar discrepancias e identificar el valor de cada fuente.
     - Aplicar la regla de autoridad definida.
     - Solicitar revisión manual cuando no exista una regla segura.
     - Registrar la decisión en bitácora.
     - La eliminación externa no debe borrar automáticamente un expediente interno; aplicar políticas de baja histórica y conservación.
  6. Ejecución y recuperación:
     - Permitir sincronización manual y programada autorizada.
     - Registrar el último punto sincronizado (timestamp/token).
     - Detectar cambios incrementales desde la última ejecución sin reprocesar registros sin cambios.
     - Permitir reanudar operaciones interrumpidas.
- **Cambios Necesarios:**
  1. Definir identificadores externos persistentes en los esquemas de datos.
  2. Incorporar hoja `SincronizacionFuentesLogs` para seguimiento de sincronizaciones.
  3. Implementar función de comparación y detección de diferencias (`reconcileExternalSourceData`).
  4. Incorporar reglas de autoridad por fuente y campo.
  5. Implementar resolución de conflictos con cola de revisión manual.
  6. Integrar los resultados con `AuditoriaMigraciones`.
  7. Incorporar consultas de diferencias pendientes en la interfaz administrativa.
  8. Incorporar mecanismos de sincronización incremental cuando el servicio externo los soporte.
- **Comportamiento Esperado:**
  La plataforma debe poder determinar qué información cambió, dónde cambió y qué acción corresponde ejecutar.
  No debe sobrescribir datos internos de manera indiscriminada ni asumir que la información externa siempre es más reciente o más confiable.
- **Criterios de Aceptación:**
  - [ ] Sincronizar registros nuevos desde una fuente externa de forma fluida.
  - [ ] Detectar modificaciones externas e incorporarlas según reglas de autoridad.
  - [ ] Detectar modificaciones internas y no sobrescribirlas por error.
  - [ ] Probar cambios simultáneos en ambos sistemas y verificar detección de conflicto.
  - [ ] Verificar que los conflictos se resuelven según las reglas de autoridad configuradas.
  - [ ] Probar registros eliminados externamente y verificar que se marcan para baja sin borrado físico.
  - [ ] Comprobar que una sincronización repetida no genera registros duplicados.
  - [ ] Interrumpir una sincronización y comprobar que puede reanudarse desde el último punto.
  - [ ] Verificar que cada cambio conserva su fuente, fecha y usuario en auditoría.
  - [ ] Comprobar que los registros pendientes de revisión se identifican y presentan en panel.
  - [ ] Verificar que todas las operaciones quedan registradas en la bitácora.
  - [ ] Comprobar que las fuentes sin permisos de escritura no reciben actualizaciones indebidas.
- **Estado:** [ ] Pendiente

---

### P2 — PRIORIDAD MEDIA

### [F25-Task07] [P2] [Calendarios - Integración Externa con Calendarios Institucionales (Google Calendar / iCal)]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - Hoja `CalendarioInstitucional`
- **Estado de Partida:** Implementación parcial.
- **Dependencias Expuestas:** F25-001, F25-012, F25-014 y F25-015.
- **Capacidades Relacionadas:** F25-010, F25-014.
- **Problema que Resuelve:**
  La plataforma dispone de un calendario institucional interno y detección de solapamientos, pero no ofrece sincronización bidireccional con calendarios externos.
- **Requisitos Funcionales:**
  1. Ampliar el calendario para permitir conexiones externas autorizadas (Google Calendar e intercambio iCalendar `.ics`).
  2. Distinguir entre exportar un archivo `.ics`, importar eventos y mantener sincronización permanente.
  3. Operaciones esperadas:
     - Exportar eventos institucionales a formato estándar iCalendar (`.ics`).
     - Importar eventos externos desde archivos `.ics`.
     - Crear, actualizar y cancelar eventos en Google Calendar mediante APIs autorizadas.
     - Consultar cambios y disponibilidad horaria.
     - Identificar eventos duplicados mediante correlación de identificadores.
     - Gestionar calendarios y permisos diferenciados.
  4. Identificación y sincronización de eventos:
     - Cada evento sincronizado debe conservar `eventoIdInterno`, `eventoIdExterno`, servicio de origen, calendario asociado, fecha de última sincronización y estado.
     - Utilizar sincronización incremental mediante tokens cuando el servicio externo lo soporte.
     - Si un token de sincronización se invalida, realizar una sincronización completa controlada.
  5. Resolución de conflictos:
     - Manejar eventos modificados internamente o externamente.
     - Manejar cancelaciones y eliminaciones.
     - Gestionar diferencias de zona horaria y eventos recurrentes.
     - Conservar y aplicar la detección de solapamientos preexistente (`checkCalendarEventOverlap`) al importar eventos externos.
  6. Seguridad: conexión con permisos específicos y revocables sin exponer calendarios ajenos.
- **Cambios Necesarios:**
  1. Incorporar conectores de calendario externos en `user-service`.
  2. Implementar generador y parseador de archivos iCalendar (`.ics`).
  3. Implementar integración con Google Calendar API cuando existan credenciales y autorización.
  4. Relacionar eventos internos y externos en `CalendarioInstitucional`.
  5. Incorporar sincronización incremental con tokens.
  6. Integrar la detección de solapamientos existente.
  7. Implementar resolución de conflictos horológicos.
  8. Registrar sincronizaciones y errores en bitácora.
- **Comportamiento Esperado:**
  Los eventos institucionales autorizados deben poder intercambiarse con calendarios externos sin generar duplicados ni perder información.
  Los cambios deben identificarse y procesarse conforme a la política de autoridad definida para cada calendario.
- **Criterios de Aceptación:**
  - [ ] Exportar eventos institucionales a un archivo `.ics` válido y compatible con clientes de correo.
  - [ ] Importar un archivo `.ics` válido e incorporar los eventos al calendario interno.
  - [ ] Probar eventos con diferentes zonas horarias verificando conversión correcta.
  - [ ] Comprobar soporte para eventos recurrentes sin desfasajes de fecha.
  - [ ] Conectar un calendario externo de pruebas y crear/actualizar eventos autorizados.
  - [ ] Comprobar que los cambios externos se identifican y sincronizan en la plataforma.
  - [ ] Verificar que los eventos no se duplican al repetir la sincronización.
  - [ ] Probar conflictos entre cambios internos y externos aplicando la política de autoridad.
  - [ ] Comprobar que se conservan intactas las reglas de detección de solapamientos.
  - [ ] Revocar una conexión y verificar que las operaciones posteriores quedan bloqueadas.
  - [ ] Comprobar la recuperación automática ante tokens de sincronización inválidos.
- **Estado:** [ ] Pendiente

---

### [F25-Task08] [P2] [Arquitectura de Conectores - Arquitectura Común de Conectores Externos]
- **Componentes Afectados:**
  - `backend/developer-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
  - Hojas `CatalogoContratos`, `CatalogoServicios`, `CatalogoIntegracionesExternas`
- **Estado de Partida:** Implementación parcial.
- **Dependencias Expuestas:** F25-001, F25-015 y F25-016.
- **Capacidades Relacionadas:** F25-012, F25-013, F25-016.
- **Problema que Resuelve:**
  Las integraciones están implementadas mediante controladores independientes en diferentes servicios. Aunque esto permite que funcionen por separado, puede producir diferencias en la gestión de credenciales, estados, errores, registros, versiones y operaciones comunes.
- **Requisitos Funcionales:**
  1. Establecer una estructura común de conectores que permita incorporar servicios externos sin repetir la lógica transversal.
  2. Definir en cada conector:
     - Identificador del conector.
     - Proveedor y tipo de servicio.
     - Versión del conector.
     - Operaciones admitidas.
     - Métodos de autenticación y autorización.
     - Configuración necesaria y dependencias.
     - Estados posibles.
     - Formato de solicitudes y respuestas.
     - Tratamiento de errores y estrategia de reintentos.
     - Registro y trazabilidad de operaciones.
  3. Operaciones comunes estandarizadas:
     - Validar configuración.
     - Probar conexión (`testConnection`).
     - Consultar estado (`getStatus`).
     - Ejecutar operación (`executeOperation`).
     - Procesar respuesta y registrar resultado.
     - Deshabilitar conexión y revocar autorización.
  4. Separación de responsabilidades:
     - Separar configuración, autenticación, transporte de red, transformación de datos, validación y trazabilidad.
     - Los servicios funcionales deben seguir siendo responsables de sus reglas de negocio (ej. un conector de pago entrega una transacción validada, pero el servicio financiero aplica los asientos y saldos).
- **Cambios Necesarios:**
  1. Definir un contrato común para conectores en `developer-service`.
  2. Identificar y modularizar la lógica repetida en los servicios existentes.
  3. Separar la lógica transversal de la lógica específica de cada proveedor.
  4. Adaptar progresivamente las integraciones existentes hacia el contrato común.
  5. Relacionar conectores con `CatalogoIntegracionesExternas`.
  6. Relacionar versiones con `CatalogoContratos`.
  7. Centralizar el registro de operaciones y errores.
- **Comportamiento Esperado:**
  Los conectores deben operar con una estructura predecible y compartir los mecanismos comunes de configuración, seguridad, monitoreo y recuperación.
  La incorporación de un nuevo proveedor no debe exigir duplicar los mecanismos de autenticación, registro o administración que ya existen.
- **Criterios de Aceptación:**
  - [ ] Identificar y abstraer las operaciones comunes entre los conectores existentes.
  - [ ] Definir el contrato común de conectores en `CatalogoContratos`.
  - [ ] Adaptar al menos un conector existente (ej. pasarela de pago o SACE) como implementación de referencia.
  - [ ] Verificar que el conector adaptado conserva su comportamiento anterior sin regresiones.
  - [ ] Comprobar que el catálogo puede identificar dinámicamente las capacidades del conector.
  - [ ] Verificar que los errores se registran de manera uniforme en la bitácora central.
  - [ ] Comprobar que las credenciales permanecen protegidas y aisladas.
  - [ ] Verificar que un conector puede deshabilitarse sin afectar el funcionamiento de otros.
  - [ ] Comprobar que los servicios funcionales conservan la totalidad de sus reglas de negocio.
  - [ ] Verificar que agregar un nuevo conector no requiere duplicar la infraestructura transversal.
- **Estado:** [ ] Pendiente

---

### [F25-Task09] [P2] [Optimización de E/S - Optimización de Lectura y Escritura por Lotes en Integraciones]
- **Componentes Afectados:**
  - `backend/accounting-service/Code.gs`
  - `backend/developer-service/Code.gs`
  - Funciones `batchSpreadsheetReadOperations`, `importDataWithColumnMapping`
- **Estado de Partida:** Mejora complementaria sobre capacidades existentes.
- **Dependencias Expuestas:** F25-005, F25-007 y F25-019.
- **Capacidades Relacionadas:** F25-019, F25-007.
- **Problema que Resuelve:**
  Las operaciones de intercambio pueden generar múltiples lecturas y escrituras individuales. Esto incrementa el tiempo de ejecución, el consumo de cuotas y la probabilidad de fallos cuando se procesan grandes volúmenes.
- **Requisitos Funcionales:**
  1. Optimizar las operaciones de intercambio mediante:
     - Lectura de rangos estrictamente necesarios.
     - Escritura por bloques en memoria antes de persistir (`setValues` por lotes).
     - Agrupación de solicitudes compatibles.
     - Reducción de llamadas repetitivas a `SpreadsheetApp`.
     - Control estricto de concurrencia mediante `LockService`.
     - Control de tamaño de solicitudes y payloads.
     - Reintentos ante errores temporales con retroceso exponencial (`exponential backoff` con `jitter`).
     - Registro de operaciones fallidas con causa técnica.
     - Validación de resultados después de escribir en disco.
  2. Control de cuotas:
     - Reconocer errores temporales y límites de consumo de servicios externos y Google APIs.
     - Diferenciar límites de solicitudes, timeouts, servicio no disponible, errores de autorización y conflictos.
     - Reintentar errores temporales con límites definidos y detener reintentos ante errores permanentes.
- **Cambios Necesarios:**
  1. Identificar operaciones individuales repetitivas en importaciones y exportaciones.
  2. Agrupar lecturas y escrituras compatibles en matrices en memoria.
  3. Reducir el volumen de información recuperada en consultas.
  4. Implementar middleware de reintentos controlados con backoff.
  5. Incorporar límites de concurrencia y tiempos máximos de espera.
  6. Medir tiempos y cuotas antes y después de la optimización.
  7. Registrar métricas de rendimiento en bitácora de auditoría.
  8. Integrar las optimizaciones con el procesamiento fraccionado de importaciones.
- **Comportamiento Esperado:**
  Las operaciones deben procesar los mismos datos con menos llamadas innecesarias y con una recuperación más controlada ante límites o fallos temporales.
- **Criterios de Aceptación:**
  - [ ] Medir el rendimiento de una operación antes de optimizarla en tiempo y llamadas API.
  - [ ] Ejecutar la misma operación mediante procesamiento agrupado y comparar resultados.
  - [ ] Demostrar reducción en tiempos de ejecución y cantidad de llamadas `SpreadsheetApp`.
  - [ ] Comprobar que los datos obtenidos y persistidos son 100% equivalentes a la operación original.
  - [ ] Provocar un error temporal de cuota simulado y verificar el reintento exitoso con backoff.
  - [ ] Comprobar que los errores permanentes no generan ciclos infinitos de reintento.
  - [ ] Verificar que las operaciones agrupadas conservan la integridad absoluta de los datos.
  - [ ] Comprobar que la concurrencia no produce escrituras conflictivas ni pérdida de filas.
  - [ ] Registrar los resultados comparativos en las bitácoras de rendimiento.
  - [ ] Verificar que las mejoras no introducen efectos secundarios ni regresiones en servicios existentes.
- **Estado:** [ ] Pendiente

---

### [F25-Task10] [P2] [Trazabilidad - Ampliación de la Trazabilidad y Consulta del Historial de Operaciones]
- **Componentes Afectados:**
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
  - Hojas `AuditoriaMigraciones`, `RegistroEventos`, `HistorialOperacionesIntegracion`
- **Estado de Partida:** Capacidad existente; ampliación y optimización.
- **Dependencias Expuestas:** F25-001, F25-004, F25-005, F25-006, F25-011 y F25-014.
- **Capacidades Relacionadas:** F25-018, F25-015, F25-001.
- **Problema que Resuelve:**
  La plataforma ya registra ejecuciones, errores y estados de importación. La mejora consiste en ofrecer trazabilidad más detallada y unificada de todas las operaciones externas, incluidas sincronizaciones, webhooks, exportaciones y conectores.
- **Requisitos Funcionales:**
  1. Registrar cada operación externa en hoja `HistorialOperacionesIntegracion` con:
     - Identificador de ejecución (`ejecucionId`).
     - Integración asociada (`integracionId`).
     - Tipo de operación (Importación, Exportación, Webhook, Sincronización).
     - Usuario o proceso automatizado responsable.
     - Fecha y hora exacta ISO.
     - Fuente de origen y destino.
     - Perfil y versión de mapeo utilizado.
     - Versión de plantilla o contrato aplicable.
     - Cantidad total de registros.
     - Cantidad de registros procesados con éxito.
     - Cantidad de registros fallidos.
     - Estado final de la operación.
     - Duración en milisegundos.
     - Errores y excepciones sanitizadas.
     - Número de reintentos realizados.
     - Referencia a operaciones relacionadas (`correlationId`).
  2. Filtros de consulta en historial:
     - Por integración.
     - Por usuario responsable.
     - Por rango de fechas.
     - Por tipo de operación.
     - Por estado final.
     - Por identificador de ejecución.
     - Por proveedor externo.
     - Por tipo de error.
  3. Detalle de ejecución: qué se intentó ejecutar, qué datos fueron procesados, qué registros fallaron y qué reintentos se realizaron.
  4. Seguridad: no almacenar contraseñas, tokens, números de tarjetas ni información personal sensible innecesaria en los registros de auditoría.
- **Cambios Necesarios:**
  1. Extender el esquema de registro para operaciones externas no cubiertas previamente.
  2. Relacionar todas las operaciones con `CatalogoIntegracionesExternas`.
  3. Incorporar referencias a perfiles de mapeo, plantillas y versiones de contrato.
  4. Unificar la consulta de historial (`getIntegrationOperationLogs`) sin eliminar los registros de `AuditoriaMigraciones`.
  5. Incorporar filtros de búsqueda y vista de detalle en la interfaz gráfica.
  6. Incorporar métricas de duración y tasas de éxito.
  7. Mantener el acceso restringido según rol operativo (RBAC).
- **Comportamiento Esperado:**
  Los administradores y auditores podrán consultar el historial unificado de intercambios de datos, identificar qué operaciones fallaron, por qué fallaron y qué reintentos se ejecutaron.
- **Criterios de Aceptación:**
  - [ ] Consultar una importación anterior y visualizar su detalle de filas y errores.
  - [ ] Consultar una exportación de datos y verificar metadatos registrados.
  - [ ] Consultar un webhook recibido verificando la transacción externa asociada.
  - [ ] Consultar una sincronización de datos con sus diferencias detectadas.
  - [ ] Filtrar operaciones por integración, estado y rango de fechas de forma fluida.
  - [ ] Identificar con precisión el usuario o proceso que inició cada operación.
  - [ ] Consultar los errores específicos de una ejecución sin ambigüedades.
  - [ ] Comprobar que los reintentos quedan debidamente vinculados a la operación original.
  - [ ] Verificar que los registros no exponen credenciales, tokens ni datos personales sensibles.
  - [ ] Comprobar que los registros históricos preexistentes siguen estando disponibles.
  - [ ] Verificar que los permisos RBAC limitan la consulta del historial exclusivamente a usuarios autorizados.
  - [ ] Comprobar que los resultados mostrados en el historial coinciden con las operaciones reales ejecutadas.
- **Estado:** [ ] Pendiente

---

### [F25-Task11] [P2] [Versionado - Administración de Versiones y Compatibilidad de Perfiles, Plantillas y Contratos]
- **Componentes Afectados:**
  - `backend/developer-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - Hojas `PlantillasSACEVerificadas`, `CatalogoContratos`, `PerfilesMapeoColumnas`
- **Estado de Partida:** Implementación existente; ampliación de compatibilidad.
- **Dependencias Expuestas:** F25-001, F25-002 y F25-003.
- **Capacidades Relacionadas:** F25-017, F25-008, F25-013.
- **Problema que Resuelve:**
  La plataforma ya registra versiones de plantillas SACE y contratos API. Al incorporar perfiles reutilizables y nuevos conectores, debe garantizarse que los cambios de estructura no invaliden silenciosamente configuraciones anteriores.
- **Requisitos Funcionales:**
  1. Identificar en cada elemento versionado:
     - Tipo de recurso (Plantilla SACE, Perfil de Mapeo, Contrato API, Esquema de Intercambio).
     - Identificador del recurso.
     - Número o etiqueta semántica de versión (ej. `v1.0.0`, `SACE-2026-v2`).
     - Fecha de creación y fecha de vigencia.
     - Estado (`Borrador`, `Vigente`, `Obsoleto`, `Deprecado`).
     - Estructura de datos y campos obligatorios.
     - Compatibilidad con versiones de esquemas internos.
     - Registro de cambios (Changelog) respecto a la versión anterior.
     - Responsable de la versión.
     - Documentación técnica o normativa relacionada.
  2. Compatibilidad ante actualizaciones de formatos:
     - Identificar perfiles y conectores afectados ante cambios en estructuras externas.
     - Determinar qué campos cambiaron (agregados, eliminados, modificados).
     - Detectar incompatibilidades antes de la ejecución.
     - Evitar ejecutar operaciones con formatos obsoletos cuando exista riesgo de corrupción.
     - Conservar versiones anteriores para permitir consultas y reproducciones históricas.
     - Permitir migraciones controladas de perfiles de mapeo hacia nuevas versiones.
- **Cambios Necesarios:**
  1. Extender el registro de versiones en `CatalogoContratos` y tablas asociadas.
  2. Incorporar validador de compatibilidad de esquemas entre perfiles y entidades.
  3. Crear interfaz de visualización de versiones y changelogs.
  4. Incorporar marcas de advertencia cuando un perfil utilice una versión deprecada.
  5. Permitir la coexistencia de múltiples versiones de plantillas SACE según el año lectivo evaluado.
- **Comportamiento Esperado:**
  Los cambios en formatos externos o contratos no romperán silenciosamente las importaciones en curso. El sistema identificará qué componentes requieren actualización y preservará las versiones históricas.
- **Criterios de Aceptación:**
  - [ ] Consultar versiones de plantillas SACE y contratos API existentes en el sistema.
  - [ ] Crear una nueva versión de prueba de una plantilla y verificar su registro en el catálogo.
  - [ ] Comprobar que la versión anterior de la plantilla se conserva inalterada.
  - [ ] Identificar automáticamente los perfiles de mapeo afectados ante cambios de campos en una entidad.
  - [ ] Verificar que los perfiles incompatibles son marcados y no se ejecutan silenciosamente.
  - [ ] Comprobar que una operación histórica conserva la versión original del contrato utilizado.
  - [ ] Verificar que la actualización de una plantilla no altera registros ya procesados en el pasado.
  - [ ] Comprobar que la versión vigente y activa puede identificarse de manera unívoca.
- **Estado:** [ ] Pendiente

---

### [F25-Task12] [P2] [SACE - Fortalecimiento de la Generación y Validación de Archivos SACE Oficiales]
- **Componentes Afectados:**
  - `backend/accounting-service/Code.gs`
  - Hojas `PlantillasSACEVerificadas`, `CalificacionesEstudiantes`
- **Estado de Partida:** Completa y verificada; optimización y ampliación controlada.
- **Dependencias Expuestas:** F25-003, F25-004 y F25-017.
- **Capacidades Relacionadas:** F25-008, F25-017.
- **Problema que Resuelve:**
  La generación de archivos SACE ya valida columnas obligatorias, conserva estados no evaluables y aplica la regla de recuperación identificada en la auditoría. No corresponde reconstruir estas capacidades. La mejora consiste en ampliar la administración de plantillas, la validación de datos y la trazabilidad de los archivos generados, evitando que la compatibilidad dependa de una única estructura fija.
- **Requisitos Funcionales:**
  1. Administración ampliada de plantillas SACE:
     - Mantener plantillas independientes por procedimiento oficial (Matrícula inicial, Calificaciones parciales, Cuadro final de rendimiento).
     - Identificar la versión oficial de cada plantilla.
     - Registrar procedencia institucional y fecha de verificación.
     - Identificar campos obligatorios y opcionales.
     - Identificar tipos de datos y valores admitidos por la Secretaría de Educación de Honduras.
     - Detectar cambios de estructura oficial.
     - Permitir desactivar plantillas obsoletas conservando versiones históricas.
  2. Validación académica estricta:
     - Conservar las reglas existentes verificadas: identificación del estudiante (DNI/código SACE), nombre del alumno, calificación ordinaria, calificación de recuperación, estados no evaluables (`Pendiente`, `Exento`, `Ausente`) y cálculo de nota final (`Math.max(ordinaria, recuperacion)`).
     - No convertir automáticamente valores como `Pendiente`, `Exento` o `Ausente` en cero (0).
     - La regla de cálculo de recuperación no debe modificarse sin verificar que corresponde al procedimiento oficial y a la plantilla vigente.
  3. Validaciones adicionales previas a la generación:
     - Identificar estudiantes matriculados sin correspondencia en el cuadro SACE.
     - Detectar identificadores repetidos en el grupo evaluado.
     - Detectar calificaciones fuera de rango (menores a 0 o mayores a 100).
     - Comprobar campos obligatorios completos.
     - Validar que el período académico coincida con el ciclo evaluado.
     - Identificar asignaturas o secciones incompatibles.
     - Advertir sobre registros incompletos mostrando lista de errores antes de generar el archivo final.
  4. Evidencia y trazabilidad de generación:
     - Relacionar cada archivo con plantilla y versión, período académico, asignatura, sección, docente responsable, fecha y hora de generación, datos incluidos y resultado de validación.
- **Cambios Necesarios:**
  1. Ampliar la administración de plantillas verificadas en `PlantillasSACEVerificadas`.
  2. Relacionar plantillas con procedimientos específicos de Secretaría de Educación.
  3. Integrar validaciones de integridad académica en `fillAndExportSACETemplate`.
  4. Incorporar control de estudiantes duplicados y notas fuera de rango.
  5. Incorporar información de procedencia y versión al historial de descargas.
  6. Mantener el formato de salida requerido por cada plantilla oficial.
  7. Evitar modificar las reglas académicas ya verificadas sin necesidad demostrada.
- **Comportamiento Esperado:**
  El personal docente y de secretaría podrá generar cuadros SACE oficiales con validación previa exhaustiva, garantizando que el archivo cumpla las normativas de la Secretaría de Educación sin alterar calificaciones de los estudiantes.
- **Criterios de Aceptación:**
  - [ ] Generar un archivo utilizando la plantilla actualmente verificada y comprobar que se conserva su estructura oficial.
  - [ ] Verificar que los estados no evaluables (`Pendiente`, `Exento`, `Ausente`) permanecen intactos sin transformarse en cero.
  - [ ] Probar calificaciones ordinarias y de recuperación verificando el cálculo de nota final SACE.
  - [ ] Probar valores fuera de rango (< 0 o > 100) y comprobar que son bloqueados con advertencia clara.
  - [ ] Probar estudiantes duplicados en la lista y verificar detección.
  - [ ] Probar estudiantes sin identificación válida y comprobar reporte de inconsistencia.
  - [ ] Comprobar que una plantilla obsoleta genera una advertencia o bloqueo según su nivel de incompatibilidad.
  - [ ] Verificar que el archivo generado queda vinculado a su plantilla, versión y responsable en auditoría.
  - [ ] Comprobar que las 53 pruebas de la suite académica existente continúan aprobadas al 100%.
  - [ ] Verificar que no se presenta el archivo como aceptado por SACE si no se ha realizado una validación oficial de carga.
- **Estado:** [ ] Pendiente

---

### [F25-Task13] [P2] [Contratos API - Ampliación del Intercambio Estructurado mediante API Institucional]
- **Componentes Afectados:**
  - `backend/developer-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/user-service/Code.gs`
  - Hojas `CatalogoContratos`, `CatalogoServicios`
- **Estado de Partida:** Completa y verificada; ampliación de capacidades.
- **Dependencias Expuestas:** F25-001, F25-008 y F25-012.
- **Capacidades Relacionadas:** F25-013, F25-012, F25-016.
- **Problema que Resuelve:**
  La plataforma ya cuenta con endpoints y contratos documentados. La mejora consiste en asegurar que las operaciones de intercambio relacionadas con las nuevas integraciones mantengan contratos coherentes, versionados y reutilizables.
- **Requisitos Funcionales:**
  1. Definir formalmente en cada contrato API:
     - Identificador de operación.
     - Versión semántica del contrato.
     - Método de transporte (POST).
     - Estructura de solicitud (JSON Schema).
     - Estructura de respuesta exitosa.
     - Campos obligatorios y opcionales.
     - Tipos de datos e identificadores.
     - Reglas de validación de negocio.
     - Permisos requeridos (RBAC/HMAC).
     - Códigos de resultado y formato estándar de errores.
     - Límites de consulta y paginación.
  2. Operaciones relacionadas con integraciones externas:
     - Consultar integraciones disponibles (`getIntegrationsCatalog`).
     - Consultar estado de una conexión (`getIntegrationStatus`).
     - Iniciar una importación masiva (`startBulkImport`).
     - Consultar el progreso de una importación (`getImportProgress`).
     - Consultar resultados y errores de una ejecución.
     - Solicitar una exportación estructurada (`requestDataExport`).
     - Consultar el resultado de una exportación.
     - Consultar el estado de sincronización entre fuentes.
  3. Seguridad: las operaciones que modifican datos deben exigir autorización específica y controles de idempotencia cuando puedan repetirse.
- **Cambios Necesarios:**
  1. Incorporar los contratos necesarios para las nuevas operaciones de integración en `CatalogoContratos`.
  2. Mantener la estructura de los contratos existentes de los microservicios.
  3. Incorporar control de versiones ante modificaciones estructurales.
  4. Definir respuestas consistentes con metadatos de ejecución.
  5. Incorporar paginación universal para resultados extensos.
  6. Incorporar límites adaptativos de consulta (rate limits).
  7. Relacionar cada contrato con su conector en el catálogo.
  8. Documentar ejemplos de solicitudes y respuestas para desarrolladores autorizados.
- **Comportamiento Esperado:**
  Los sistemas externos autorizados podrán interoperar con la plataforma mediante contratos claros y predecibles, garantizando seguridad, consistencia de datos y compatibilidad entre versiones.
- **Criterios de Aceptación:**
  - [ ] Consultar los contratos existentes en `CatalogoContratos` y verificar su integridad.
  - [ ] Verificar que los nuevos contratos de integración están debidamente registrados.
  - [ ] Probar solicitudes válidas e inválidas comprobando validación de esquemas.
  - [ ] Verificar que las respuestas siguen estrictamente la estructura JSON documentada.
  - [ ] Comprobar que los permisos institucionales se validan en el servidor antes de responder.
  - [ ] Probar solicitudes repetidas de operaciones de escritura y comprobar la idempotencia.
  - [ ] Verificar que los cambios de versión no rompen contratos anteriores sin un procedimiento de deprecación.
  - [ ] Comprobar que los mensajes de error no revelan información interna de infraestructura.
  - [ ] Verificar que la documentación de contratos corresponde fielmente a la implementación real.
- **Estado:** [ ] Pendiente

---

### [F25-Task14] [P2] [Supervisión - Mejoras de Administración y Supervisión Centralizada de Integraciones]
- **Componentes Afectados:**
  - `backend/developer-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `js/ui-common.js`
- **Estado de Partida:** Mejora sobre catálogo y trazabilidad existentes.
- **Dependencias Expuestas:** F25-001, F25-015 y F25-018.
- **Capacidades Relacionadas:** F25-018, F25-001, F25-015.
- **Problema que Resuelve:**
  La plataforma cuenta con registros de migración y eventos, pero necesita una experiencia unificada para supervisar la salud de las conexiones y detectar operaciones que requieren intervención.
- **Requisitos Funcionales:**
  1. Incorporar un panel de control y supervisión de integraciones externas con indicadores clave:
     - Total de integraciones registradas en el catálogo.
     - Cantidad de integraciones activas y en línea.
     - Cantidad de integraciones desconectadas o suspendidas.
     - Cantidad de integraciones con errores recurrentes.
     - Operaciones pendientes de procesamiento en colas.
     - Operaciones completadas satisfactoriamente en el día.
     - Operaciones fallidas que requieren atención.
     - Fecha y hora de la última ejecución global.
     - Fecha y hora de la última ejecución satisfactoria.
     - Errores más frecuentes categorizados.
     - Tiempo promedio de ejecución por conector.
     - Volumen total de registros procesados en el período.
  2. Acceso directo al detalle de cada integración y a sus bitácoras de auditoría.
  3. Alertas operativas estructuradas ante:
     - Credenciales de pasarelas o servicios a punto de vencer.
     - Autorización o token revocado por servicio externo.
     - Fallos repetidos de conexión o timeouts de red.
     - Importaciones masivas interrumpidas sin reanudar.
     - Webhooks de pago recibidos y no procesados.
     - Sincronizaciones con desfase superior al umbral configurado.
     - Plantillas o esquemas detectados como incompatibles.
     - Consumo cercano a límites de cuotas de Apps Script / Google APIs.
     - Operaciones marcadas para revisión manual obligatoria.
  4. Diferenciar alertas críticas de advertencias meramente informativas.
- **Cambios Necesarios:**
  1. Implementar servicio de métricas de integraciones en `developer-service` (`getIntegrationsHealthMetrics`).
  2. Integrar datos de `CatalogoIntegracionesExternas`, `AuditoriaMigraciones` y `RegistroEventos`.
  3. Crear vista de supervisión en el panel de administración institucional.
  4. Incorporar evaluador de alertas de salud de integraciones.
  5. Implementar filtros por conector, severidad y estado operativo.
- **Comportamiento Esperado:**
  Los administradores podrán conocer de un vistazo el estado de salud de todas las conexiones institucionales, anticiparse a caídas de servicio y atender operaciones con fallos sin demoras.
- **Criterios de Aceptación:**
  - [ ] Consultar el estado general de las integraciones en el panel de supervisión.
  - [ ] Verificar que los indicadores de salud proceden de operaciones reales registradas.
  - [ ] Identificar de forma inmediata integraciones con errores o desconectadas mediante alertas visuales.
  - [ ] Consultar el detalle de errores específicos de una conexión con un solo clic.
  - [ ] Verificar que las alertas operativas corresponden a condiciones reales y no espurias.
  - [ ] Comprobar que una integración inactiva no se presenta falsamente como operativa.
  - [ ] Verificar que los usuarios solo consultan información y métricas acordes a su perfil RBAC.
  - [ ] Comprobar que los indicadores de salud se actualizan inmediatamente después de cada ejecución.
- **Estado:** [ ] Pendiente

---
## FASE 26 — CONFIGURACIÓN INSTITUCIONAL Y PERSONALIZACIÓN

### P0 — PRIORIDAD CRÍTICA

### [F26-Task01] [P0] [Gobernanza Jerárquica - Motor Central de Configuración Jerárquica y Herencia Departamental]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - Hojas `ConfiguracionSistema`, `ConfiguracionDepartamental`, `ConfiguracionRoles`
  - `js/ui-common.js`
- **Subcapacidades Relacionadas:** F26-002, F26-010.
- **Estado de Partida:** Implementada parcialmente / Requiere mejoras.
- **Dependencias Expuestas:** Estructuras de usuarios, roles, departamentos, `ConfiguracionSistema`, permisos server-side y servicios consumidores de configuración.
- **Problema Detectado:**
  La plataforma permite administrar configuraciones globales y preferencias individuales, pero no dispone de un nivel departamental formal. Las unidades administrativas no pueden establecer parámetros propios de manera segura y existe riesgo de sobrescribir configuraciones globales. La solución actual necesita evolucionar de una estructura binaria a un sistema de configuración jerárquica que permita administrar valores institucionales, excepciones departamentales y preferencias personales sin generar contradicciones.
- **Requisitos Funcionales:**
  1. Jerarquía de resolución de configuración en 4 niveles:
     - Nivel 1. Global: valores predeterminados del sistema.
     - Nivel 2. Institucional: valores definidos para la institución.
     - Nivel 3. Departamental: excepciones o parámetros propios de una unidad/departamento.
     - Nivel 4. Personal: preferencias individuales permitidas.
     - La precedencia debe resolverse según el tipo de parámetro. No todos los valores deben admitir sobrescritura en todos los niveles.
  2. Políticas de alcance declarativas por parámetro:
     - `Global obligatorio`: no admite sobrescritura en ningún nivel inferior.
     - `Institucional`: se establece para toda la institución.
     - `Heredable`: permite excepciones departamentales controladas.
     - `Personalizable`: admite preferencias individuales de usuario.
     - `Restringido`: requiere autorización especial para cualquier modificación.
  3. Herencia y sobrescritura:
     - Si no existe un valor departamental, utilizar el valor institucional.
     - Si existe una excepción departamental autorizada, utilizarla dentro de su ámbito.
     - Si se elimina la excepción, recuperar automáticamente el valor heredado.
     - Si cambia el valor institucional, actualizar los departamentos que lo heredan.
     - Conservar las excepciones explícitas que deban mantenerse.
     - Identificar visualmente si un valor es heredado, sobrescrito o definido localmente.
     - Permitir restablecer un valor heredado sin tener que copiar manualmente el valor institucional.
  4. Catálogo de parámetros y metadatos:
     - Identificador estable (`configId`), clave, tipo de dato, valor predeterminado, ámbitos permitidos, bandera de herencia, bandera de sobrescritura, roles autorizados, restricciones de modificación, dependencias, versión, estado, fecha y responsable de actualización.
     - No crear una segunda fuente de verdad para parámetros que ya estén almacenados en `ConfiguracionSistema`, `ConfiguracionAcademica` u otras estructuras especializadas.
  5. Administración departamental:
     - Permitir que los responsables autorizados consulten y administren las configuraciones de su unidad.
     - Mostrar valor efectivo, valor institucional de origen, estado de herencia, excepciones existentes, responsable y fecha de actualización.
     - Una unidad no debe poder modificar configuraciones de otra unidad ni cambiar parámetros institucionales no habilitados para su ámbito.
  6. Resolución de conflictos:
     - Aplicar la política de precedencia definida para el parámetro.
     - Rechazar sobrescrituras prohibidas.
     - Informar qué valor prevalece y por qué.
     - Evitar que una excepción departamental modifique configuraciones globales.
     - Registrar las modificaciones y los conflictos relevantes en bitácora de auditoría.
- **Cambios Necesarios:**
  - Ampliar el modelo de configuración existente para representar los cuatro ámbitos (`GLOBAL`, `INSTITUCIONAL`, `DEPARTAMENTAL`, `PERSONAL`).
  - Incorporar relaciones entre institución, departamentos y usuarios en hoja `ConfiguracionDepartamental`.
  - Implementar un mecanismo central de lectura y resolución jerárquica de configuraciones (`resolveHierarchicalConfiguration`).
  - Integrar las operaciones de lectura y escritura de `saveSystemConfiguration` con el nuevo mecanismo.
  - Adaptar las configuraciones especializadas que deban admitir herencia.
  - Incorporar controles server-side para verificar ámbito, rol y permisos.
  - Ampliar la interfaz administrativa para visualizar valores heredados y excepciones.
  - Mantener compatibilidad con las configuraciones actuales durante la transición.
- **Comportamiento Esperado:**
  Una configuración institucional se establece una vez y se aplica a todas las unidades que la heredan. Un departamento puede establecer una excepción cuando el parámetro lo permita. Los usuarios pueden personalizar sus preferencias individuales sin alterar la configuración de su departamento ni de la institución.
- **Criterios de Aceptación:**
  - [ ] Crear una configuración institucional y comprobar que se aplica a los departamentos sin excepciones.
  - [ ] Crear una excepción departamental y comprobar que solo afecta a esa unidad específica.
  - [ ] Restablecer la herencia y comprobar que se recupera automáticamente el valor institucional.
  - [ ] Cambiar el valor institucional y comprobar que se actualizan las unidades que heredan.
  - [ ] Comprobar que las excepciones explícitas se conservan cuando corresponda.
  - [ ] Intentar modificar una configuración global con un usuario sin permisos y comprobar que el servidor rechaza la operación (403).
  - [ ] Intentar modificar una unidad ajena y comprobar que la operación se bloquea.
  - [ ] Intentar sobrescribir un parámetro global obligatorio desde un departamento y comprobar que se rechaza.
  - [ ] Comprobar que las preferencias personales no alteran configuraciones compartidas.
  - [ ] Verificar que las configuraciones antiguas siguen resolviéndose correctamente después de la transición.
  - [ ] Comprobar que no existen dos valores efectivos contradictorios para un mismo parámetro y ámbito.
- **Estado:** [ ] Pendiente

---

### [F26-Task02] [P0] [Localización Regional - Centralizar el Formateo Regional de Moneda, Fechas, Horas y Números]
- **Componentes Afectados:**
  - `js/config.js`
  - `js/ui-common.js`
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Subcapacidad Relacionada:** F26-001.
- **Estado de Partida:** Implementada parcialmente.
- **Dependencias Expuestas:** `ConfiguracionSistema`, motor de precedencia de `F26-Task01`, frontend común, servicios académicos y financieros, exportaciones y calendarios.
- **Problema Detectado:**
  La plataforma almacena parámetros regionales, incluyendo zona horaria y moneda, pero algunos componentes del frontend siguen construyendo formatos manualmente. Se identificó el uso de concatenaciones como `"L. " + monto`. Esto produce diferencias de presentación, errores de interpretación numérica y posibles inconsistencias entre tablas, formularios, documentos, reportes y operaciones financieras.
- **Requisitos Funcionales:**
  1. Formateador regional único y universal:
     - Implementar una capa común de formato en frontend (`RegionalFormatter`) que consulte la configuración institucional efectiva y permita formatear: moneda, números enteros, decimales, porcentajes, fechas, horas, instantes combinados y duraciones.
     - Configurar: código de moneda (HNL), símbolo monetario (`L.`), separador decimal (punto o coma según configuración), separador de miles, cantidad de decimales (2 por defecto en finanzas), formato de fecha (`DD/MM/YYYY`), formato de hora (12h/24h), idioma regional (`es-HN`) y zona horaria (`America/Tegucigalpa`, GMT-6).
     - Utilizar mecanismos regionales estándar (`Intl.NumberFormat`, `Intl.DateTimeFormat`) evitando concatenaciones manuales ad-hoc.
  2. Moneda institucional estandarizada:
     - Distinguir entre código ISO (`HNL`), símbolo de presentación (`L.`), precisión decimal y formato visual.
     - El símbolo no debe sustituir al código de moneda en los datos internos; los cálculos deben operar sobre valores numéricos (`float`) puros.
  3. Interpretación controlada de números (parsing seguro):
     - Interpretar entradas ambiguas de usuarios (`1,250.50` vs `1.250,50`) según la configuración regional activa.
     - Solicitar corrección explícita ante entradas numéricas que no puedan resolverse de forma segura.
  4. Fechas y horas:
     - Utilizar la zona horaria institucional como referencia común.
     - Distinguir fechas sin hora (fechas de nacimiento, fechas de matrícula) de marcas temporales con instante (timestamps de auditoría en UTC).
     - Evitar conversiones que desplacen un día por diferencias de huso horario en fechas sin hora.
  5. Integración con hojas de cálculo y exportaciones:
     - No confundir valores numéricos con cadenas formateadas en Google Sheets; persistir tipos nativos y asignar formatos de celda.
     - Evitar que una exportación a CSV/XLSX convierta importes en texto por añadir símbolos monetarios manualmente.
- **Cambios Necesarios:**
  - Crear el módulo `RegionalFormatter` en `js/ui-common.js` o `js/config.js`.
  - Eliminar progresivamente las concatenaciones manuales de símbolos monetarios (`"L. " + monto`) en `accounting.js`, `reports.js`, `teacher.js` y `student.js`.
  - Sustituir formateadores locales incompatibles.
  - Conectar la capa de formato con la configuración institucional y su resolución jerárquica.
  - Adaptar tablas, tarjetas, formularios, documentos, reportes y componentes financieros.
  - Incorporar funciones de interpretación y validación de entradas numéricas en formularios.
  - Revisar las conversiones de fechas entre frontend, backend y hojas de cálculo.
- **Comportamiento Esperado:**
  Los mismos valores deben mostrarse de forma coherente en toda la plataforma. Cambiar el formato regional debe modificar la presentación, sin alterar cantidades, fechas ni datos históricos.
- **Criterios de Aceptación:**
  - [ ] Mostrar un mismo importe en diferentes módulos y comprobar que utiliza exactamente el mismo formato.
  - [ ] Cambiar la moneda institucional y comprobar la actualización coherente de los componentes correspondientes.
  - [ ] Comprobar que el valor numérico original en base de datos no cambia al modificar el formato visual.
  - [ ] Introducir números con coma y punto y verificar su interpretación correcta según la configuración regional.
  - [ ] Rechazar entradas ambiguas cuando no exista una interpretación segura.
  - [ ] Comprobar importes positivos, negativos, cero y valores con más decimales de los permitidos.
  - [ ] Comprobar fechas en formatos diferentes sin alterar su valor real almacenado.
  - [ ] Verificar fechas cercanas a medianoche en la zona horaria institucional sin desfasaje de días.
  - [ ] Comprobar que las fechas de eventos se muestran correctamente tras consultar los registros.
  - [ ] Exportar importes y fechas a hojas de cálculo y verificar que se conservan como datos tipados y no como cadenas de texto.
  - [ ] Confirmar que no quedan componentes relevantes utilizando formatos manuales incompatibles.
- **Estado:** [ ] Pendiente

---

### [F26-Task03] [P1] [Formularios Dinámicos - Ampliar los Formularios Institucionales con un Constructor Visual de Campos Dinámicos]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - Hojas `FormulariosInstitucionales`, `RespuestasFormularios`
  - `js/ui-common.js`
- **Subcapacidad Relacionada:** F26-007.
- **Estado de Partida:** Implementada parcialmente.
- **Dependencias Expuestas:** `FormulariosInstitucionales`, almacenamiento de registros, roles y permisos, catálogos existentes y motor de precedencia.
- **Problema Detectado:**
  Existe una estructura `FormulariosInstitucionales` con esquemas JSON de campos, pero falta una herramienta visual para crear y administrar campos personalizados sin modificar directamente el código. La plataforma necesita convertir la definición de formularios en una capacidad administrable, con validaciones, reglas condicionales, reutilización y control de permisos.
- **Requisitos Funcionales:**
  1. Constructor visual de campos:
     - Interfaz para crear, editar, ordenar y configurar campos personalizados.
     - Agregar campos, editar etiquetas y descripciones, seleccionar tipos de datos, definir obligatoriedad, establecer valores predeterminados y límites.
     - Ordenar campos mediante controles visuales y agrupar por secciones temáticas.
     - Previsualizar el formulario interactivo en tiempo real.
     - Guardar borradores y publicar versiones oficiales.
     - Desactivar campos sin destruir información histórica previamente capturada.
     - Trabajar sobre el esquema JSON existente sin crear un motor paralelo.
  2. Tipos de campos soportados:
     - Texto corto, texto extenso, número entero, número decimal, fecha, fecha y hora, casilla de selección (checkbox), lista desplegable (select), selección múltiple, referencia a catálogo institucional, referencia a entidad interna y archivo adjunto.
     - Controles específicos por tipo: longitud mín/máx en texto, límites numéricos y precisión, rangos de fecha, formatos de archivo y tamaño máximo en megabytes.
  3. Campos condicionales declarativos:
     - Reglas de visibilidad y obligatoriedad dependientes del valor de otros campos (ej. mostrar campo adicional según categoría seleccionada).
     - Almacenar condiciones como reglas declarativas controladas (JSON), no como JavaScript ejecutable arbitrario.
  4. Validación estricta en frontend y backend:
     - Toda validación relevante debe ejecutarse también en el servidor (`doPost`).
     - Verificar pertenencia del campo al formulario, tipo de dato, permisos de usuario, opciones autorizadas del catálogo, límites y cumplimiento de condiciones de obligatoriedad.
  5. Versionado y compatibilidad histórica:
     - Generar versiones controladas (`v1.0`, `v1.1`, `v2.0`).
     - Los registros históricos conservan la versión exacta con la que fueron llenados.
     - Desactivar un campo no borra las respuestas históricas asociadas.
  6. Ámbitos y permisos:
     - Formularios institucionales y formularios específicos por departamento respetando la jerarquía de `F26-Task01`.
     - Control de acceso RBAC sobre campos con información confidencial o restringida.
- **Cambios Necesarios:**
  - Ampliar la administración de `FormulariosInstitucionales` en backend (`saveFormDefinition`, `getFormDefinitions`).
  - Implementar el constructor visual en la interfaz administrativa.
  - Incorporar validaciones declarativas server-side en el envío de respuestas (`submitInstitutionalFormRequest`).
  - Adaptar el renderizador de formularios para generar controles según el esquema dinámico.
  - Añadir versionado de esquemas y relacionar respuestas con la versión del formulario.
  - Integrar permisos por rol y ámbito en el catálogo de formularios.
- **Comportamiento Esperado:**
  Un administrador o responsable autorizado puede agregar un campo desde la interfaz, publicarlo y utilizarlo en el formulario correspondiente. Los datos se guardan, consultan y validan sin necesidad de modificar código para cada nuevo campo.
- **Criterios de Aceptación:**
  - [ ] Crear un formulario y agregar campos de diferentes tipos de datos desde la interfaz.
  - [ ] Modificar etiquetas, descripciones y obligatoriedad con vista previa en tiempo real.
  - [ ] Previsualizar el formulario antes de publicarlo.
  - [ ] Guardar un registro utilizando campos personalizados y verificar persistencia íntegra.
  - [ ] Consultar posteriormente los valores guardados comprobando fidelidad de datos.
  - [ ] Enviar datos inválidos directamente al backend y comprobar que se rechazan con mensaje de error específico.
  - [ ] Comprobar que las reglas condicionales se aplican tanto en cliente como en servidor.
  - [ ] Cambiar una versión del formulario y verificar que los registros históricos conservan su estructura.
  - [ ] Desactivar un campo y comprobar que no se pierden los datos históricos existentes.
  - [ ] Intentar utilizar un campo desde otro formulario y comprobar que el servidor valida su pertenencia.
  - [ ] Intentar modificar un formulario sin permisos y comprobar que la operación se bloquea.
  - [ ] Comprobar que los campos personalizados no alteran formularios institucionales ajenos.
- **Estado:** [ ] Pendiente

---

### [F26-Task04] [P1] [Reportes Personalizados - Implementar Persistencia de Vistas y Configuraciones Personalizadas de Reportes]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - Hoja `VistasPersonalizadasReportes`
  - `js/ui-common.js`
- **Subcapacidad Relacionada:** F26-008.
- **Estado de Partida:** Implementada parcialmente.
- **Dependencias Expuestas:** Reportes institucionales existentes, permisos, catálogos de campos y almacenamiento de preferencias.
- **Problema Detectado:**
  Existen definiciones de reportes institucionales, pero falta persistencia de vistas personalizadas por usuario. Los usuarios necesitan conservar sus configuraciones de consulta sin tener que reconstruir filtros, columnas, ordenamientos y agrupaciones cada vez que acceden a un reporte.
- **Requisitos Funcionales:**
  1. Configuración de vistas analíticas:
     - Permitir personalizar reportes mediante: selección de columnas visibles, orden de columnas, filtros aplicados, ordenamiento ascendente/descendente, agrupaciones por categorías, totales y subtotales, períodos de consulta, criterios de búsqueda y opciones de exportación.
  2. Guardado y reutilización:
     - Guardar vistas personalizadas con nombre descriptivo y notas.
     - Modificar, duplicar, establecer como predeterminada (`defaultView`) o eliminar vistas propias.
     - Recuperar la configuración predeterminada institucional con un clic.
     - Compartir vistas con usuarios o roles autorizados.
     - Diferenciar formalmente: vistas personales, vistas compartidas departamentales y plantillas institucionales oficiales.
  3. Permisos y seguridad estricta:
     - Una vista guardada no debe ampliar jamás los permisos del usuario.
     - El servidor debe validar en cada ejecución: acceso al reporte, acceso a cada campo incluido, ámbito del usuario (grado/sección/departamento) y permisos de exportación.
     - Si un usuario pierde acceso a un campo utilizado en una vista guardada, advertir y omitir el campo sin exponer datos restringidos.
  4. Compatibilidad ante modificaciones de esquema:
     - Si un campo del reporte original cambia o se elimina, no ejecutar consultas fallidas silenciosas; advertir al usuario y permitir adaptar la vista guardada.
  5. Rendimiento y presentación:
     - Aplicar filtros y ordenamientos en servidor; mantener paginación y mostrar estados de carga sin bloquear la interfaz.
- **Cambios Necesarios:**
  - Crear hoja `VistasPersonalizadasReportes` en backend.
  - Implementar endpoints en backend (`saveReportView`, `getReportViews`, `deleteReportView`).
  - Asociar vistas con `userId`, `rol` y ámbito departamental.
  - Integrar validaciones de permisos sobre campos guardados en las consultas de reportes.
  - Adaptar el visor modal de reportes (`modal-report-viewer`) para permitir seleccionar y guardar vistas.
- **Comportamiento Esperado:**
  Un usuario autorizado puede personalizar un reporte, guardar la vista y volver a ejecutarla posteriormente. La configuración permanece disponible sin modificar el reporte institucional original ni ampliar los permisos del usuario.
- **Criterios de Aceptación:**
  - [ ] Crear una vista con columnas, filtros y ordenamientos personalizados.
  - [ ] Guardarla y volver a cargarla posteriormente desde la lista de vistas guardadas.
  - [ ] Ejecutar nuevamente el reporte y comprobar que conserva todos los criterios configurados.
  - [ ] Modificar una vista sin afectar otras vistas guardadas ni el reporte institucional original.
  - [ ] Duplicar y eliminar una vista verificando la correcta actualización del catálogo.
  - [ ] Comprobar que las vistas personales no son visibles para usuarios no autorizados.
  - [ ] Compartir una vista y comprobar que los destinatarios conservan sus propias restricciones de datos (RBAC).
  - [ ] Retirar el permiso de un campo y verificar que una vista que lo utiliza no expone información confidencial.
  - [ ] Modificar el esquema de un reporte y comprobar que las vistas incompatibles muestran una advertencia amigable.
  - [ ] Ejecutar reportes con muchos registros y comprobar que se aplican filtros y paginación correctamente.
  - [ ] Exportar una vista personalizada y comprobar que el resultado coincide exactamente con los filtros y columnas seleccionados.
- **Estado:** [ ] Pendiente

---

### [F26-Task05] [P0] [Caché y Sincronización - Implementar Invalidación Reactiva y Sincronización de Caché de Configuraciones]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - `backend/developer-service/Code.gs`
  - `js/ui-common.js`
  - `js/config.js`
  - `js/api.js`
  - Hojas `ConfiguracionSistema`, `RegistroEventos`
- **Subcapacidad Relacionada:** F26-013.
- **Estado de Partida:** Implementada parcialmente.
- **Dependencias Expuestas:** `ConfiguracionSistema`, `manageInstitutionalDataCache`, motor de precedencia (`F26-Task01`), sesiones de usuario y componentes frontend consumidores de configuración.
- **Problema Detectado:**
  Después de modificar parámetros en `ConfiguracionSistema`, los clientes pueden conservar valores antiguos en memoria local hasta que se cierre la sesión o se recargue la página. Esto puede ocasionar comportamientos contradictorios entre módulos y usuarios que utilizan configuraciones diferentes durante un mismo período de operación.
- **Requisitos Funcionales:**
  1. Identificación y señalización de cambios:
     - Toda modificación de configuración debe generar una señal verificable de actualización con marca de versión incremental y timestamp ISO.
     - Registrar parámetro modificado, ámbito afectado, versión nueva, fecha, usuario responsable y módulos dependientes.
  2. Versionado y detección de obsolescencia:
     - Mecanismo para comprobar si la configuración local del cliente sigue vigente comparando su versión con la versión central (`configVersion`).
     - Determinar si el cambio requiere una recarga completa de sesión o solo actualizar el componente local.
  3. Invalidación reactiva:
     - Al guardar en backend (`saveSystemConfiguration`), purgar inmediatamente la caché en servidor (`CacheService`).
     - Emitir respuesta con la nueva versión para que el cliente invalide su caché local (`localStorage` / memoria).
     - Evitar que una configuración antigua sobrescriba una versión más reciente.
  4. Caché diferenciada por ámbito:
     - Respetar la jerarquía de precedencia: un cambio global invalida a todos los ámbitos que lo heredan; un cambio departamental solo invalida las sesiones de esa unidad; una preferencia personal solo afecta al usuario emisor.
  5. Resiliencia y fallos de sincronización:
     - Si el cliente pierde conexión, no declarar sincronización exitosa; registrar error y reintentar al reconectar.
     - Para operaciones críticas, el servidor debe validar la versión vigente de la configuración antes de autorizar la acción.
  6. Gestión de concurrencia:
     - Detectar colisiones si dos administradores modifican configuraciones simultáneamente e informar del conflicto sin sobrescrituras ciegas.
- **Cambios Necesarios:**
  - Incorporar versionado de configuraciones y marcas de tiempo en `ConfiguracionSistema`.
  - Adaptar `manageInstitutionalDataCache` para soportar purga selectiva por clave y ámbito.
  - Integrar la invalidación automática en `saveSystemConfiguration`.
  - Incorporar verificación de versión de configuración en las llamadas periódicas de `api.js` / `ui-common.js`.
  - Implementar validación de versión en operaciones críticas de backend.
- **Comportamiento Esperado:**
  Cuando un administrador modifica un parámetro, los usuarios afectados reciben la configuración vigente sin depender de cerrar sesión o recargar manualmente la aplicación. Los cambios se propagan únicamente a los ámbitos correspondientes.
- **Criterios de Aceptación:**
  - [ ] Abrir dos sesiones concurrentes con usuarios diferentes.
  - [ ] Modificar una configuración institucional desde una sesión y comprobar que la otra sesión detecta el cambio y actualiza el valor.
  - [ ] Modificar una configuración departamental y comprobar que solo afecta al ámbito correspondiente sin alterar otros departamentos.
  - [ ] Modificar una preferencia personal y comprobar que no invalida configuraciones ajenas.
  - [ ] Simular un fallo de red durante la actualización y comprobar que el cliente no declara una sincronización exitosa.
  - [ ] Recuperar la conexión y comprobar que se obtiene la versión vigente del servidor.
  - [ ] Modificar simultáneamente un parámetro desde dos sesiones y comprobar que se detecta el conflicto de concurrencia.
  - [ ] Comprobar que un cliente con una versión antigua no puede sobrescribir silenciosamente una configuración nueva.
  - [ ] Verificar que la invalidación de caché no elimina datos de negocio ajenos a la configuración.
  - [ ] Comprobar que las cachés de los servicios dependientes se actualizan correctamente.
- **Estado:** [ ] Pendiente

---

### P2 — PRIORIDAD MEDIA

### [F26-Task06] [P2] [Historial y Recuperación - Centro de Historial, Comparación y Restauración de Configuraciones Críticas]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - Hojas `ConfiguracionSistema`, `RegistroEventos`, `HistorialVersionesConfiguracion`
  - `js/ui-common.js`
- **Subcapacidades Relacionadas:** F26-011, F26-012.
- **Estado de Partida:** Protección e historial completos y verificados; falta la herramienta de restauración identificada en el backlog.
- **Dependencias Expuestas:** Versionado actual de `ConfiguracionSistema`, `RegistroEventos`, roles y permisos, motor de precedencia (`F26-Task01`) e invalidación reactiva (`F26-Task05`).
- **Problema que Resuelve:**
  La plataforma ya restringe la modificación de configuraciones globales, mantiene versiones y registra eventos. Sin embargo, no dispone de un procedimiento funcional completo para restaurar una versión anterior de un parámetro modificado erróneamente. Se requiere ampliar la trazabilidad existente para ofrecer recuperación controlada, sin sustituir el sistema de auditoría ni eliminar su historial.
- **Requisitos Funcionales:**
  1. Consulta del historial de configuraciones:
     - Vista administrativa filtrable por parámetro, categoría, ámbito, departamento, usuario, fecha y versión.
     - Mostrar valor anterior, valor nuevo, usuario responsable, fecha/hora, motivo de cambio y versión resultante.
  2. Comparación visual y estructural de versiones (Diff):
     - Seleccionar dos versiones históricas y visualizar diferencias: valores anteriores vs nuevos, cambios de tipo, cambios de ámbito, parámetros agregados o desactivados y dependencias afectadas.
     - Proteger y enmascarar valores sensibles (claves API, credenciales).
  3. Restauración controlada de versiones (`rollbackSystemConfiguration`):
     - Restaurar una versión anterior creando una nueva versión secuencial basada en el valor histórico seleccionado.
     - Conservar la versión actual en el historial sin eliminar versiones intermedias ni reescribir la auditoría.
     - Registrar quién solicitó y ejecutó la restauración, valor anterior y restaurado, fecha y justificación.
     - Validar permisos elevados (`Administrador`/`Director`) y dependencias antes de confirmar.
     - Mostrar advertencia de impacto y solicitar confirmación explícita.
  4. Restauración selectiva:
     - Permitir restaurar parámetros individuales o conjuntos relacionados validando compatibilidad entre valores.
  5. Protección de información histórica:
     - La restauración de una configuración no debe modificar retroactivamente registros académicos, financieros o administrativos creados bajo la configuración previa.
  6. Integración con permisos y caché:
     - Invalidar reactivamente cachés tras la restauración (`F26-Task05`) y registrar eventos estructurados en `RegistroEventos`.
- **Cambios Necesarios:**
  - Incorporar almacenamiento de historial detallado en `HistorialVersionesConfiguracion`.
  - Implementar endpoint en backend `rollbackSystemConfiguration`.
  - Crear interfaz de usuario para consulta, comparación visual y botón de restauración con modal de confirmación.
  - Integrar la restauración con el motor de precedencia e invalidación de caché.
- **Comportamiento Esperado:**
  Un administrador autorizado puede consultar versiones anteriores, comparar sus diferencias y restaurar una configuración seleccionada. La restauración genera una nueva versión y deja evidencia completa, sin borrar el historial ni alterar registros académicos o financieros existentes.
- **Criterios de Aceptación:**
  - [ ] Modificar un parámetro y comprobar que se registra la versión anterior y la nueva en el historial.
  - [ ] Consultar el historial y localizar la modificación con sus metadatos completos.
  - [ ] Comparar dos versiones y verificar que se muestran sus diferencias con claridad.
  - [ ] Restaurar una versión anterior y comprobar que el valor efectivo cambia de inmediato.
  - [ ] Verificar que la restauración crea una nueva versión secuencial y no elimina las posteriores.
  - [ ] Intentar restaurar con un usuario sin permisos y comprobar que la operación se rechaza.
  - [ ] Restaurar un parámetro departamental y comprobar que no afecta a otros departamentos.
  - [ ] Restaurar varios parámetros relacionados y comprobar que se validan sus dependencias antes de aplicar.
  - [ ] Simular una restauración incompatible y comprobar que se bloquea sin dejar cambios parciales.
  - [ ] Comprobar que los registros históricos académicos y financieros no se modifican retroactivamente.
  - [ ] Verificar que la restauración invalida las cachés afectadas de forma reactiva.
  - [ ] Comprobar que el historial identifica tanto la versión de origen como la nueva versión restaurada.
- **Estado:** [ ] Pendiente

---

### [F26-Task07] [P2] [Preferencias de Usuario - Ampliar la Administración de Preferencias Personales sin Permitir Conflictos Institucionales]
- **Componentes Afectados:**
  - `backend/user-service/Code.gs`
  - Hojas `PreferenciasNotificacion`, `ConfiguracionVisualGlobal`, `PreferenciasUsuario`
  - `js/ui-common.js`
- **Subcapacidades Relacionadas:** F26-001, F26-002, F26-014.
- **Estado de Partida:** Preferencias visuales y de notificaciones implementadas; ampliar únicamente las preferencias que estén ausentes y sean compatibles con el modelo jerárquico.
- **Dependencias Expuestas:** `PreferenciasNotificacion`, `ConfiguracionVisualGlobal`, motor de precedencia (`F26-Task01`) y formateador regional (`F26-Task02`).
- **Problema Detectado:**
  La plataforma dispone de preferencias individuales de notificaciones y visualización, pero estas deben integrarse de manera coherente con la configuración institucional y departamental. Se necesita distinguir claramente qué puede personalizar cada usuario y qué parámetros deben permanecer bajo control institucional.
- **Requisitos Funcionales:**
  1. Preferencias individuales personalizables autorizadas:
     - Idioma de la interfaz de usuario (español, inglés).
     - Formato personal de presentación de fechas (sin alterar valores en base de datos).
     - Preferencias visuales de paleta de colores y temas contrastados.
     - Disposición y orden de los widgets en el dashboard dinámico.
     - Categorías y canales de notificación activos (in-app, correo).
     - Frecuencia y agrupación de avisos opcionales.
     - No permitir personalización individual de parámetros institucionales obligatorios (moneda oficial, reglas fiscales, años lectivos).
  2. Herencia de valores predeterminados:
     - Si el usuario no tiene una preferencia explícita configurada, heredar el valor del departamento o de la institución.
     - Opción en la interfaz para restablecer preferencias individuales y recuperar valores heredados.
  3. Administración y persistencia segura:
     - Guardar preferencias en hoja `PreferenciasUsuario` vinculadas a `userId`.
     - Recuperar preferencias al iniciar sesión y aplicarlas sin afectar a otros usuarios.
     - Conservar preferencias entre sesiones y en almacenamiento local de navegador.
  4. Separación estricta de presentación y operación:
     - Una preferencia de presentación no debe modificar cálculos financieros, nombres de registros ni reglas de negocio.
- **Cambios Necesarios:**
  - Integrar `PreferenciasNotificacion` y configuraciones visuales bajo la entidad común de preferencias.
  - Crear interfaz modal amigable para personalización individual en `modal-dashboard-settings`.
  - Incorporar botón de "Restablecer a valores institucionales".
  - Implementar validación en servidor para rechazar intentos de personalizar parámetros reservados.
- **Comportamiento Esperado:**
  Cada usuario puede personalizar las opciones permitidas y conservarlas entre sesiones. Cuando no establece una preferencia, recibe el valor heredado correspondiente. Ninguna personalización individual modifica la configuración institucional.
- **Criterios de Aceptación:**
  - [ ] Cambiar una preferencia personal y comprobar que persiste al iniciar una nueva sesión.
  - [ ] Comprobar que la preferencia individual no modifica la configuración de otros usuarios concurrentes.
  - [ ] Restablecer la preferencia y comprobar que recupera automáticamente el valor institucional heredado.
  - [ ] Cambiar el valor institucional y verificar que los usuarios sin excepciones personales reciben el nuevo valor.
  - [ ] Comprobar que las preferencias personales no alteran cálculos financieros, fechas almacenadas ni permisos de acceso.
  - [ ] Intentar modificar una preferencia no permitida mediante petición directa y comprobar que el servidor la rechaza.
  - [ ] Verificar que las preferencias visuales y de notificación existentes continúan funcionando sin regresiones.
- **Estado:** [ ] Pendiente

---
