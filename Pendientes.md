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
