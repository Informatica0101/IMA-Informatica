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
