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
