# REGISTRO DUAL Y PENDIENTES DE IMPLEMENTACIÓN
===============================================================================
FASE 6. EXPEDIENTE INSTITUCIONAL Y CICLO DE VIDA DEL ESTUDIANTE
===============================================================================

### [X] [TAREA-F6-001] Restringir los controles de gestión de expedientes duplicados según los permisos efectivos del usuario
- **Origen del Hallazgo:** `Auditoria.txt` / `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 1 (P2 · Seguridad Operativa)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Seguridad operativa e interfaz)
- **Archivos Involucrados:**
  - `teacher-dashboard.html`
  - `js/teacher.js`
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `ROLE_PERMISSIONS`, `validateRolePermission`, `getStudentFile`, `findDuplicateStudents`, `mergeStudentFiles`
- **Descripción del Alcance:**
  El panel docente contiene la pestaña `#tab-stfile-duplicates` relacionada con la gestión de expedientes duplicados, aunque la resolución y fusión corresponde al personal administrativo autorizado. La mejora evita que el usuario encuentre opciones que no puede utilizar, preservando el acceso a las demás funciones autorizadas del expediente.

  Requisitos Funcionales:
  1. Identificar los permisos efectivos del usuario autenticado antes de construir o mostrar los controles de gestión de duplicados.
  2. Ocultar o deshabilitar la pestaña, los botones y las acciones de resolución o fusión para el rol `Profesor`.
  3. Mostrar dichos controles únicamente a los usuarios que dispongan de los permisos administrativos correspondientes.
  4. Reutilizar la matriz de permisos existente (`ROLE_PERMISSIONS` / `RoleCapabilities`). No crear reglas independientes que puedan divergir.
  5. Aplicar la restricción a todas las acciones relacionadas, incluidas las que se encuentren en menús contextuales, cuadros de diálogo y controles secundarios.
  6. Mantener la validación de autorización en el servidor. Ocultar elementos visuales no sustituye los controles del backend.
  7. No alterar la búsqueda general de estudiantes ni la edición de datos personales, gestión documental o consulta histórica autorizada.
  8. Actualizar correctamente la interfaz cuando cambie la sesión, el usuario autenticado o su contexto de permisos. Si el rol no puede determinarse o la sesión no es válida, no mostrar acciones administrativas.
- **Criterios de Aceptación:**
  - CA-001: Un usuario exclusivamente docente no visualiza la pestaña de duplicados ni sus acciones administrativas.
  - CA-002: Un usuario autorizado visualiza los controles correspondientes y puede utilizarlos según sus permisos.
  - CA-003: Una llamada directa al servicio por parte de un usuario no autorizado continúa siendo rechazada por el backend.
  - CA-004: Al cerrar sesión o cambiar de usuario, la interfaz no conserva controles correspondientes a la sesión anterior.
  - CA-005: La ocultación de los controles no afecta las demás pestañas ni las operaciones autorizadas del expediente.
  - CA-006: La interfaz mantiene su funcionamiento en dispositivos móviles y de escritorio.
  - CA-007: Las pruebas de regresión confirman que la gestión de duplicados continúa funcionando para los usuarios autorizados.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-002] Robustecer las operaciones del ciclo de vida y prevenir estados de matrícula incompatibles
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 6 (P1 · Integridad Institucional)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Integridad institucional y transiciones del ciclo de vida)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `changeStudentSection`, `recordStudentTransfer`, `recordStudentWithdrawal`, `processStudentReentry`, `renewStudentEnrollment`, `Matriculas`, `ExpedientesEstudiantes`, `LockService`
- **Descripción del Alcance:**
  Consolidar las reglas de transición de estado institucional del estudiante para evitar inconsistencias entre los registros cuando ocurren operaciones concurrentes o interrumpidas durante todo su ciclo de vida (matrícula, cambios de sección/grado, traslados, retiros, reincorporaciones, promociones y graduaciones).

  Requisitos Funcionales:
  1. Definir las transiciones permitidas entre los estados institucionales del estudiante, diferenciando su condición general de la situación de cada matrícula.
  2. Validar que un estudiante no tenga dos matrículas activas incompatibles para el mismo periodo, conforme a las reglas institucionales.
  3. Antes de procesar un movimiento, comprobar que: el expediente existe y no está fusionado, el periodo escolar de destino es válido, la matrícula de origen corresponde al estudiante, el movimiento es compatible con el estado actual y se cumplen las condiciones académicas y administrativas aplicables.
  4. En cambios de grado, sección, jornada o programa, conservar la matrícula anterior y registrar la nueva situación con su fecha efectiva y motivo.
  5. En traslados, registrar institución de destino, fecha de salida, motivo y estado del trámite (diferenciando solicitado de completado).
  6. En retiros, distinguir entre retiro temporal y definitivo sin eliminar antecedentes.
  7. En reincorporaciones, reutilizar la identidad institucional existente y crear el registro de matrícula para el nuevo periodo.
  8. En promociones y repitencias, utilizar resultados académicos del periodo cerrado y registrar la decisión administrativa cuando corresponda.
  9. En graduaciones, verificar los requisitos configurados, registrar la fecha y el programa finalizado y evitar matrículas activas incompatibles posteriores.
  10. Hacer que cada operación crítica sea idempotente y resistente a solicitudes concurrentes mediante script locks (`LockService`).
  11. Disponer de un mecanismo de recuperación o conciliación ante fallos parciales entre hojas o microservicios.
  12. Registrar las operaciones retroactivas con su fecha efectiva y la fecha real de registro, sin alterar silenciosamente el historial.
- **Criterios de Aceptación:**
  - CA-008: Una segunda solicitud idéntica de reincorporación no crea otra matrícula.
  - CA-009: Dos solicitudes concurrentes que intentan ocupar la misma plaza no exceden la capacidad configurada.
  - CA-010: Una transición no permitida es rechazada sin modificar parcialmente el expediente.
  - CA-011: Un traslado incompleto queda identificado como pendiente de resolución, sin presentar al estudiante como correctamente transferido.
  - CA-012: La promoción o repitencia no modifica las calificaciones históricas.
  - CA-013: Una graduación correctamente registrada conserva el acceso autorizado al expediente histórico.
  - CA-014: Las operaciones retroactivas pueden distinguirse de las realizadas en tiempo real.
  - CA-015: Los registros relacionados mantienen una situación coherente después de un fallo simulado y su recuperación.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-003] Establecer una batería automatizada de regresión para el ciclo de vida del estudiante
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 15 (P1 · Fiabilidad Funcional)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Fiabilidad y pruebas automatizadas)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - Suite de Pruebas / Script de verificación
- **Dependencias Expuestas:** `runConcurrencyAndConsistencySuite`, `validateApiContractsTestSuite`, `runCurricularAreaServiceTests`, `getStudentFile`, `mergeStudentFiles`
- **Descripción del Alcance:**
  Crear una suite automatizada e integral de pruebas de regresión que permita verificar periódicamente los flujos del ciclo de vida del estudiante y prevenir fallos ante futuros cambios en el código.

  Requisitos Funcionales:
  1. Crear pruebas repetibles para los flujos principales: creación de expediente, detección y fusión de duplicados, asociación/revocación de responsables, carga/sustitución/recuperación de documentos, matrícula inicial y renovación, cambios de sección y grado, traslado/retiro/reincorporación, promoción/repitencia/graduación, antecedentes históricos, integraciones, permisos y respaldos.
  2. Incluir casos positivos, entradas inválidas, operaciones concurrentes, fallos de servicios dependientes y reintentos.
  3. Verificar tanto los resultados visibles como los cambios persistidos en las hojas de cálculo y Drive.
  4. Comprobar que los roles no autorizados no puedan ejecutar acciones mediante llamadas directas al backend.
  5. Asegurar que las pruebas utilicen datos sintéticos y aislados sin afectar información de producción.
  6. Comprobar que los cambios de un año lectivo no modifiquen las calificaciones ni las matrículas de años anteriores.
  7. Generar un informe de ejecución que distinga claramente entre pruebas aprobadas, fallidas y no ejecutadas.
- **Criterios de Aceptación:**
  - CA-016: Cada flujo crítico dispone de pruebas reproducibles para su comportamiento esperado y sus casos de error.
  - CA-017: Las pruebas detectan la creación duplicada de matrículas ante reintentos concurrentes.
  - CA-018: Las pruebas detectan accesos no autorizados a expedientes y documentos.
  - CA-019: Las pruebas detectan alteraciones indebidas del historial académico.
  - CA-020: Los fallos de integración no se interpretan como operaciones exitosas.
  - CA-021: Las pruebas pueden ejecutarse sin modificar expedientes reales.
  - CA-022: Los resultados permiten identificar el caso fallido, la condición de entrada y el resultado observado.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-004] Reestructurar la arquitectura en microservicios independientes
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-007 (P1 · Reestructuración Arquitectónica)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Arquitectura y escalabilidad de microservicios)
- **Archivos Involucrados:**
  - Todos los microservicios (`backend/*`)
  - `js/api.js`
  - `js/auth.js`
  - Dashboards y registros centrales
- **Dependencias Expuestas:** Registro central de servicios, capas de comunicación `fetchApi`, autenticación y configuración
- **Descripción del Alcance:**
  Distribuir las responsabilidades del sistema entre microservicios independientes, reduciendo el acoplamiento entre áreas y permitiendo mantener, desplegar, supervisar y ampliar cada servicio sin reconstruir innecesariamente los demás.

  Requisitos Funcionales:
  1. Establecer arquitectura en la que cada microservicio disponga de proyecto Apps Script propio, ID inmutable, endpoint registrado, Spreadsheet/Drive organizados, diagnóstico y versión identificable.
  2. Separar funciones por responsabilidades funcionales conservando todas las relaciones institucionales.
  3. Centralizar el consumo de APIs desde dashboards mediante `js/api.js`.
  4. Centralizar el descubrimiento de servicios en un registro de configuración con endpoints, versiones, recursos y permisos.
  5. Separar código fuente de configuraciones (URLs, IDs de Spreadsheet/Drive configurables sin cambiar código).
  6. Definir contratos de entrada/salida para cada operación con parámetros, respuestas, errores y permisos.
  7. Mantener compatibilidad absoluta con funciones existentes sin desconectar llamadas ni endpoints.
  8. El microservicio del desarrollador administra el registro y plano de control sin actuar como intermediario obligatorio de todas las llamadas.
  9. Garantizar tolerancia a fallos: operaciones independientes deben seguir funcionando ante indisponibilidad temporal de otros servicios.
  10. Definir una única fuente de verdad por entidad compartida para evitar duplicidades.
  11. Auditar funciones, variables, llamadas y contratos antes y después de cada migración.
- **Criterios de Aceptación:**
  - CA-023: Cada microservicio tiene un identificador único, configuración independiente y despliegue identificable.
  - CA-024: Cada servicio dispone del almacenamiento correspondiente, respetando las excepciones autorizadas.
  - CA-025: Los dashboards consumen las funciones mediante una capa de comunicación común (`js/api.js`).
  - CA-026: Un servicio puede actualizarse sin modificar los demás cuando sus contratos de comunicación no cambian.
  - CA-027: La caída de un servicio no bloquea automáticamente las funciones independientes.
  - CA-028: Las funciones migradas producen resultados equivalentes y conservan sus controles de acceso.
  - CA-029: El registro central identifica qué servicio atiende cada función y dónde está desplegado.
  - CA-030: No quedan funciones existentes desconectadas, referencias obsoletas ni llamadas a endpoints inexistentes.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-005] Crear los microservicios administrativos y financieros con separación por responsabilidades
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-008 (P1 · Reestructuración de Servicios)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Microservicios administrativos y financieros)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - Estructura de carpetas en Google Drive (`Administracion_Financiera/`)
- **Dependencias Expuestas:** `getStudentFile`, `registerStudentEnrollment`, `createAdmissionCharge`, `processPaymentReceipt`, `ROLE_PERMISSIONS`
- **Descripción del Alcance:**
  Dividir y estructurar formalmente las responsabilidades entre el microservicio compartido de Dirección y Secretaría y el microservicio financiero-administrativo (Contabilidad, Cobros, Facturación, Recibos, Inventarios, Recursos Humanos, Planillas).

  Requisitos Funcionales:
  1. Dirección y Secretaría comparten microservicio y Spreadsheet cuando corresponda, pero con carpetas de Drive separadas y permisos estrictos por rol.
  2. Crear el microservicio financiero-administrativo con módulos internos independientes (Contabilidad, Cobros, Facturación, Recibos, Cuentas por Pagar, Inventarios, Bancos, RRHH, Planillas, Contratos, Evaluaciones).
  3. Permitir vinculación legítima entre transacciones (cobro -> factura -> recibo) sin duplicar datos de forma inconsistente.
  4. Mantener la estructura jerárquica de Drive (`Administracion_Financiera/Contabilidad/...` y `Administracion_Financiera/Recursos_Humanos/...`) generada de forma automática.
  5. Permitir que un usuario con múltiples roles (ej. Docente + Contador + Encargado Cafetería) ejecute operaciones autorizadas desde una sola cuenta de usuario.
  6. Permitir que personal de Secretaría realice cobros autorizados y emita facturas en ventanilla sin crear segundas cuentas.
  7. Auditar el contexto de autorización de cada transacción.
  8. Permitir incorporar nuevas subáreas mediante configuración sin reconstruir el microservicio.
- **Criterios de Aceptación:**
  - CA-031: Dirección y Secretaría operan mediante microservicio compartido con permisos y carpetas diferenciados.
  - CA-032: Los módulos financieros y de RRHH funcionan con separación interna de responsabilidades y carpetas aisladas.
  - CA-033: La estructura de carpetas en Drive se inicializa automáticamente sin duplicar carpetas existentes.
  - CA-034: Facturas, cobros y recibos mantienen referencias consistentes en todo momento.
  - CA-035: Un usuario con múltiples roles ejecuta operaciones en distintas áreas sin ampliar permisos indebidamente en otras.
  - CA-036: La indisponibilidad de un módulo no bloquea las operaciones independientes de los demás.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-006] Crear una plantilla de microservicio académico reutilizable para múltiples áreas
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-009 (P1 · Modularización y Reutilización)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Plantilla genérica de servicio académico y coordinaciones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/task-service/Code.gs`
  - `backend/exam-service/Code.gs`
  - Dashboards y configuraciones académicas
- **Dependencias Expuestas:** `getAcademicOffers`, `getTeacherAssignments`, `getAllTasks`, `getAllExams`, `saveQuestion`
- **Descripción del Alcance:**
  Implementar una plantilla genérica y reutilizable para microservicios académicos que permita desplegar áreas independientes (Comunicaciones, Inglés, Ciencias Sociales, Ciencias, Matemáticas, Informática, Contaduría y Finanzas) utilizando configuración parametrizada sin harcodeos en el código.

  Requisitos Funcionales:
  1. Desarrollar plantilla académica desacoplada que gestione: grados, secciones, asignaturas, asignaciones docentes, tareas, exámenes, entregas, calificaciones y retroalimentación.
  2. Configurar las 7 áreas académicas iniciales mediante registros de base de datos / parámetros JSON sin condicionales de nombres fijos (`if`/`switch`) en la lógica.
  3. Implementar modelo de relaciones por IDs inmutables (Grado -> Sección -> Asignatura -> Docente/Periodo -> Tarea/Examen -> Entrega).
  4. Garantizar que los cambios de docente, sección o año no alteren retroactivamente las calificaciones históricas.
  5. Soporte para coordinaciones académicas configurables (ámbito de supervisión por área, asignatura, grado o sección sin otorgar permisos administrativos generales).
  6. Permitir que cada instancia tenga su propio proyecto Apps Script, Spreadsheet, almacenamiento Drive y configuración aislada.
- **Criterios de Aceptación:**
  - CA-037: La plantilla no contiene nombres fijos de áreas, asignaturas, docentes o secciones en la lógica de negocio.
  - CA-038: Se pueden crear áreas, asignaturas, grados, secciones y coordinaciones desde configuración sin editar código.
  - CA-039: Cada instancia gestiona sus tareas, exámenes y entregas con aislamiento total de datos.
  - CA-040: Los estudiantes solo consultan sus asignaturas matriculadas y los docentes solo sus grupos autorizados.
  - CA-041: Un coordinador supervisa sus asignaturas asignadas sin obtener privilegios en áreas ajenas ni duplicar cuenta.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-007] Implementar el despliegue configurable de nuevos microservicios académicos
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-010 (P1 · Automatización de Despliegues)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Despliegue e inicialización de instancias académicas)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - Dashboard del Desarrollador
  - Registro de Servicios Central
- **Dependencias Expuestas:** `prepareNewAcademicYear`, `getAcademicOffers`, `createAcademicOffer`, Registro de Servicios
- **Descripción del Alcance:**
  Crear la interfaz y automatización en el dashboard del desarrollador para registrar, inicializar, validar y desplegar nuevas instancias de microservicios académicos de forma idempotente.

  Requisitos Funcionales:
  1. Formulario de registro de instancia en dashboard del desarrollador (ID, área, plantilla, Apps Script ID, Spreadsheet ID, Drive folder IDs, asignaturas/coordinaciones iniciales).
  2. Permitir agregar o modificar asignaturas, secciones y docentes mediante cambios de configuración sin requerir redespliegue de código.
  3. Flujo de inicialización idempotente: valida configuración, crea hojas/carpetas que falten sin duplicar, prueba conectividad/permisos y registra estado.
  4. Control de estados explícitos: `Borrador`, `Pendiente`, `Preparando`, `Desplegando`, `Validando`, `Activo`, `ConErrores`, `Suspendido`, `Retirado`.
  5. Ante fallos, permite reanudar sin duplicar estructuras ni perder datos.
  6. Si requiere autorización manual de Google OAuth, indica el paso pendiente sin marcar erróneamente como exitoso.
  7. Mantener historial de versiones de plantilla asociadas a cada instancia.
  8. Auditar solicitante, fecha y resultado de cada despliegue o cambio de estado.
- **Criterios de Aceptación:**
  - CA-042: Se puede registrar e inicializar una nueva área académica desde la plataforma sin modificar código fuente.
  - CA-043: La inicialización de la instancia es completamente idempotente.
  - CA-044: Los fallos de despliegue emiten un diagnóstico verificable y no marcan la instancia como activa.
  - CA-045: La actualización de la plantilla base es optativa y no modifica automáticamente todas las instancias activas.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-008] Crear el microservicio central del desarrollador y el registro de servicios
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-011 (P1 · Administración Centralizada)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Plano de control y registro de microservicios)
- **Archivos Involucrados:**
  - Microservicio Central del Desarrollador (`backend/developer-service/` / registro central)
  - Dashboard del Desarrollador
  - `js/api.js`
- **Dependencias Expuestas:** `getInstitutionalCatalog`, `validateApiContractsTestSuite`, `recordTraceabilityLog`
- **Descripción del Alcance:**
  Implementar el plano de control central y el registro de servicios para supervisar despliegues, catalogar endpoints, administrar roles/responsabilidades y mantener la interoperabilidad de la plataforma.

  Requisitos Funcionales:
  1. Registro central de servicios con: ID único, nombre, tipo, estado administrativo/operativo, versión, URLs, Spreadsheets/Drive, permisos, dependencias y último contacto.
  2. Contrato común de comunicación entre servicios con `correlationId`, timeouts, manejo de retries e idempotencia.
  3. Separar operaciones administrativas de las operacionales (el plano de control no es intermediario obligatorio de llamadas de negocio).
  4. Administrador de roles y responsabilidades que soporte múltiples roles por usuario, asignaciones por área/subárea y vigencia de permisos.
  5. Tolerancia a fallos: si el servicio central está fuera de línea, los servicios operativos independientes siguen funcionando.
  6. Prohibir ejecución de código arbitrario no catalogado desde comandos administrativos.
- **Criterios de Aceptación:**
  - CA-046: El registro central cataloga todos los microservicios, endpoints y recursos asociados.
  - CA-047: Las solicitudes entre servicios utilizan el contrato común con `correlationId`.
  - CA-048: La indisponibilidad del microservicio central no detiene la operación de los servicios académicos, administrativos ni financieros.
  - CA-049: Un usuario ejerce múltiples roles en distintas áreas sin duplicidad de cuentas ni elevación no autorizada de privilegios.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-009] Implementar módulos de salud, diagnóstico, tráfico y errores en cada microservicio
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-012 (P1 · Observabilidad y Diagnóstico)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Salud, métricas y registro de errores de microservicios)
- **Archivos Involucrados:**
  - Todos los microservicios (`backend/*`)
  - Dashboard del Desarrollador
  - `js/teacher.js` (Consola técnica)
- **Dependencias Expuestas:** `runTechnicalHealthChecks`, `getStructuredLogs`, `recordTraceabilityLog`
- **Descripción del Alcance:**
  Dotar a cada microservicio de endpoints estandarizados de salud (`ping`/diagnóstico), métricas de rendimiento/tráfico y sanitización de registros de errores para el dashboard de supervisión.

  Requisitos Funcionales:
  1. Endpoints de salud en cada microservicio que verifiquen: conectividad, acceso a Sheets, acceso a Drive, permisos y versión.
  2. Diferenciar respuesta básica de conectividad de una verificación completa de dependencias de lectura/escritura.
  3. Pruebas de diagnóstico funcional controladas que verifiquen contratos de API sin alterar datos de producción.
  4. Métricas de tráfico y rendimiento reales (solicitudes, errores por categoría, latencia ms, consumo de ejecuciones GAS).
  5. Registro de errores enriquecido (`eventId`, servicio, módulo, operación, timestamp, severidad, `correlationId`, versión, estado de resolución).
  6. Sanitización obligatoria en logs: prohibido guardar contraseñas, tokens, datos bancarios o PII sensible completa.
  7. Dashboard de supervisión con filtros por área, versión, severidad e historial de disponibilidad.
- **Criterios de Aceptación:**
  - CA-050: Todos los microservicios responden al contrato común de diagnóstico y salud.
  - CA-051: El diagnóstico distingue fallos de red, permisos de Sheets, falta de espacio en Drive y errores de lógica.
  - CA-052: Los logs de errores pueden filtrarse por severidad, fecha y servicio sin exponer datos personales ni credenciales.
  - CA-053: La consola de supervisión identifica la causa de degradación y las dependencias afectadas.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-010] Incorporar administración segura de logs y comandos operativos
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-013 (P1 · Mantenimiento Seguro)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Administración de logs y cola de comandos)
- **Archivos Involucrados:**
  - Microservicio Central del Desarrollador
  - Dashboard del Desarrollador
  - Módulos de logs en microservicios
- **Dependencias Expuestas:** `getStructuredLogs`, `recordTraceabilityLog`, `BitacoraTraceability`
- **Descripción del Alcance:**
  Implementar la gestión centralizada de logs (consulta, rotación, archivo y purga segura) junto con una cola de comandos administrativos de mantenimiento basados en un catálogo estrictamente permitido.

  Requisitos Funcionales:
  1. Consulta y filtrado de logs multi-servicio desde el dashboard central.
  2. Permitir marcar errores como revisados/resueltos sin borrar su registro de auditoría.
  3. Purga y archivo seguro de logs que distinga registros temporales de auditorías protegidas inmutables.
  4. Catálogo cerrado de comandos permitidos (diagnóstico, comprobación de almacenamiento, respaldos, purga de temporales). Prohibida la ejecución libre de cadenas o funciones de Apps Script.
  5. Cola de tareas administrativas asíncronas para operaciones de mantenimiento prolongadas con soporte para cancelación segura e idempotencia.
  6. Permisos específicos por comando administrativo basados en rol autenticado.
- **Criterios de Aceptación:**
  - CA-054: Los logs pueden ser filtrados, archivados y marcados como resueltos desde el dashboard.
  - CA-055: Las purgas de registros temporales conservan intactos los logs de auditoría obligatorios.
  - CA-056: La ejecución de comandos se limita estrictamente al catálogo cerrado autorizado.
  - CA-057: Cada comando ejecutado registra solicitante, fecha, parámetros, resultado y `correlationId`.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-011] Implementar respaldos independientes y recuperación por área
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-014 (P1 · Continuidad Operativa)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Respaldos aislados y restauración por microservicio)
- **Archivos Involucrados:**
  - Todos los microservicios (`backend/*`)
  - Dashboard del Desarrollador
  - Google Drive / Google Sheets
- **Dependencias Expuestas:** `createSystemBackup`, `restoreSystemBackup`, `verifyBackupIntegrity`, `reconcileRestoredDataIntegrity`
- **Descripción del Alcance:**
  Establecer la estrategia de respaldos automáticos e independientes por microservicio con verificación de sumas SHA-256, políticas de retención y restauración aislada sin afectar a otras áreas.

  Requisitos Funcionales:
  1. Generar y programar respaldos independientes por microservicio (Spreadsheets, configuraciones y metadatos de Drive).
  2. Catálogo central de respaldos con checksum SHA-256, timestamp, versión y estado de verificación de integridad.
  3. Estrategia de rotación, retención y almacenamiento aislado de respaldos.
  4. Proceso de restauración por área: exige confirmación explicita (`RESTORE-CONFIRMED`), valida checksum/compatibilidad y evita sobrescribir datos de otros microservicios.
  5. Vista previa del impacto de restauración y soporte para simulación/prueba en entorno aislado.
  6. Reconciliación de integridad referencial post-restauración para verificar vínculos entre estudiantes, tutores, documentos y matrículas.
- **Criterios de Aceptación:**
  - CA-058: Se pueden generar y catalogar respaldos aislados por microservicio con verificación SHA-256.
  - CA-059: La restauración de un microservicio no altera ni sobrescribe datos de otros servicios.
  - CA-060: Copias de seguridad corruptas o con suma de verificación alterada son rechazadas antes de aplicar cambios.
  - CA-061: La restauración verifica y conserva las relaciones referenciales entre entidades del servicio.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-012] Establecer seguridad, aislamiento y gestión centralizada de permisos
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-015 (P1 · Seguridad y Control de Acceso)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Seguridad, identidad única, RBAC y aislamiento)
- **Archivos Involucrados:**
  - Todos los microservicios (`backend/*`)
  - `js/auth.js`
  - `js/api.js`
  - Dashboards
- **Dependencias Expuestas:** `ROLE_PERMISSIONS`, `validateRolePermission`, `validateContextualAccess`, `checkAndRegisterIdempotencyKey`
- **Descripción del Alcance:**
  Implementar la arquitectura de seguridad multi-servicio que combine una identidad única por persona, asignación flexible de roles múltiples por área/subárea, validación de permisos en el servidor y protección contra IDOR y elevación de privilegios.

  Requisitos Funcionales:
  1. Identidad institucional única por persona independiente del número de roles asignados.
  2. Soporte para múltiples roles simultáneos con permisos por servicio, módulo, operación y ámbito de datos.
  3. Matriz de permisos RBAC para todas las áreas (Dirección, Secretaría, Contabilidad, Cobros, Facturación, RRHH, Docentes, Estudiantes, Coordinadores, Cafetería, Desarrolladores).
  4. Coordinaciones académicas con permisos de supervisión acotados por área, asignatura, grado o sección.
  5. Validación obligatoria de autenticación y autorización en el backend de cada microservicio para todas las llamadas (no confiar en la interfaz).
  6. Prohibido almacenar claves privadas o tokens en el código frontend.
  7. Protección contra IDOR (acceso directo a objetos ajenos) mediante `validateContextualAccess`.
  8. Auditoría completa de cambios de permisos, revocaciones y comandos sensibles.
- **Criterios de Aceptación:**
  - CA-062: Cada microservicio valida independientemente la autorización del usuario en el servidor.
  - CA-063: Un usuario ejerce múltiples roles en distintas áreas desde una sola cuenta sin duplicación de identidad.
  - CA-064: La manipulación de IDs en parámetros de llamada no permite acceder a expedientes ni documentos ajenos.
  - CA-065: Las revocaciones de permisos se aplican de inmediato en todas las llamadas protegidas del backend.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-013] Implementar despliegues versionados, migraciones y reversión controlada
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-016 (P1 · Mantenimiento y Evolución)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Versionado de servicios, migraciones de esquema y rollback)
- **Archivos Involucrados:**
  - Todos los microservicios (`backend/*`)
  - Dashboard del Desarrollador
  - Registro de Servicios Central
- **Dependencias Expuestas:** `validateApiContractsTestSuite`, `evaluateTransactionalStorageMigrationNeed`, `reconcileRestoredDataIntegrity`
- **Descripción del Alcance:**
  Establecer el protocolo de versionado de código/esquemas, contratos de compatibilidad de API entre versiones, migraciones de datos no destructivas y procedimientos de reversión (rollback) controlados.

  Requisitos Funcionales:
  1. Control de versión explícito por microservicio (versión de código, versión de esquema BD y versión de configuración).
  2. Registro de cambios (changelog) y contratos de API compatibles por versión.
  3. Verificación de dependencias y pruebas automáticas post-despliegue (conectividad, Sheets, Drive, RBAC, endpoints).
  4. Migraciones de datos idempotentes con validación previa y registro de resultados sin duplicar filas ni romper relaciones.
  5. Estrategia de reversión (rollback) que contemple código, esquemas y datos.
  6. Permitir actualizar la versión de un microservicio de forma aislada sin forzar la actualización de los demás.
  7. Auditoría de impacto previa a cada despliegue para garantizar que no se desconecten funciones existentes.
- **Criterios de Aceptación:**
  - CA-066: Cada microservicio declara y expone su versión de código y esquema.
  - CA-067: Las migraciones de datos son idempotentes y no duplican estructuras ni registros al reejecutarse.
  - CA-068: La actualización de una instancia no altera las demás ni desconecta consumidores del dashboard.
  - CA-069: Existe un procedimiento probado de rollback que permite restituir el servicio ante despliegues fallidos.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-014] Centralizar la configuración y las dependencias sin centralizar todos los datos
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-017 (P1 · Configuración e Interoperabilidad)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Registro central de configuración y catálogo de contratos)
- **Archivos Involucrados:**
  - Microservicio Central del Desarrollador
  - `js/api.js`
  - All microservices (`backend/*`)
- **Dependencias Expuestas:** Registro de Servicios Central, `getInstitutionalCatalog`, `validateApiContractsTestSuite`
- **Descripción del Alcance:**
  Centralizar el registro de configuraciones, endpoints y dependencias de la plataforma en el servicio del desarrollador, manteniendo la descentralización de los datos operativos en sus respectivos microservicios.

  Requisitos Funcionales:
  1. Registro de configuración por microservicio con referencias a Spreadsheets, carpetas Drive y dependencias declaradas.
  2. Validación de configuración previa a la activación del servicio (detecta IDs inexistentes o permisos faltantes).
  3. Modificación de URLs, parámetros y referencias de almacenamiento mediante configuración sin editar código fuente.
  4. Versionado e historial de cambios de configuración.
  5. Desactivación o retiro controlado de servicios sin dejar enlaces ni referencias huérfanas en los dashboards.
  6. Catálogo central de endpoints, operaciones, parámetros, tipos de respuesta y permisos requeridos.
  7. Detección automática de llamadas obsoletas entre `js/api.js` y los microservicios desplegados.
- **Criterios de Aceptación:**
  - CA-070: Todos los servicios y sus dependencias están catalogados en el registro central de configuración.
  - CA-071: Los cambios de URLs o referencias de almacenamiento se aplican mediante configuración sin recompilar ni editar código.
  - CA-072: La retirada de un microservicio elimina o deshabilita sus endpoints en el catálogo central sin romper los dashboards.
  - CA-073: El catálogo de contratos valida la compatibilidad de llamadas de `js/api.js`.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-015] Validar el rendimiento, la capacidad y la recuperación de la arquitectura completa
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-018 (P1 · Pruebas de Integración)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Pruebas de carga, escalabilidad e integración total)
- **Archivos Involucrados:**
  - Todos los microservicios (`backend/*`)
  - Dashboards y clientes frontend (`js/*`)
  - Suite de integración y rendimiento
- **Dependencias Expuestas:** `runConcurrencyAndConsistencySuite`, `validateApiContractsTestSuite`, `getOperationalCapacityMetrics`
- **Descripción del Alcance:**
  Ejecutar la validación integral de rendimiento, resiliencia, tolerancia a fallos, concurrencia y recuperación de desastres sobre toda la arquitectura de microservicios.

  Requisitos Funcionales:
  1. Pruebas de integración multi-servicio que simulen operaciones simultáneas de admisión, matrícula, pagos, asistencias y tareas.
  2. Pruebas de tolerancia a fallos: simular caída de un servicio o de Drive/Sheets y verificar resiliencia de módulos independientes.
  3. Verificación de idempotencia ante reintentos de red o fallos de comunicación.
  4. Medición de tiempos de respuesta, latencia ms, límites de ejecución GAS y cuotas de API.
  5. Incorporar paginación y procesamiento por lotes para evitar lecturas masivas no acotadas.
  6. Probar usuarios con combinaciones de múltiples roles en todas las interfaces.
  7. Auditar flujos end-to-end garantizando que no haya pérdida de datos ni regresiones funcionales.
- **Criterios de Aceptación:**
  - CA-074: Se verifica que incorporar una nueva instancia académica no afecta el rendimiento de las existentes.
  - CA-075: La indisponibilidad simulada de un microservicio no bloquea las funciones de otros servicios independientes.
  - CA-076: Las operaciones críticas procesadas con reintentos no generan duplicados de datos ni inconsistencias contables/académicas.
  - CA-077: Los flujos end-to-end funcionan correctamente verificando integridad de datos, permisos y observabilidad.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-016] Supervisar la capacidad de almacenamiento y los fallos del repositorio documental
- **Origen del Hallazgo:** `Auditoria.txt` / `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 2 (P2 · Continuidad Operativa)
- **Prioridad:** P2
- **Severidad/Clasificación:** Bajo (Mejora operativa y mantenimiento preventivo)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - Carpeta de Google Drive `Documentos_Estudiantes`
- **Dependencias Expuestas:** `uploadStudentDocument`, `DriveApp`, `PropertiesService`, `sendMultiChannelNotification`, `getStructuredLogs`
- **Descripción del Alcance:**
  Establecer una supervisión preventiva para anticipar problemas de capacidad en Google Drive, detectar patrones de fallo en operaciones de carga/descarga y evitar interrupciones en la gestión documental de expedientes.

  Requisitos Funcionales:
  1. Supervisar los fallos de carga, lectura, actualización y recuperación de documentos, distinguiendo entre: falta de permisos, cuotas alcanzadas, errores temporales de conexión, archivos inaccesibles o inconsistencias en BD.
  2. Registrar métricas operativas (cargas exitosas/fallidas, volumen procesado, tiempo de respuesta) sin almacenar ni exponer datos personales sensibles.
  3. Incorporar alertas configurables por umbrales de capacidad: preventiva al 80%, prioridad alta al 90%, estado crítico al 95%.
  4. Diferenciar la capacidad total disponible de cuotas de solicitudes y restricciones específicas de la cuenta.
  5. Permitir a los administradores consultar el estado del servicio documental y el historial de incidentes.
  6. Aplicar reintentos controlados únicamente a errores transitorios, evitando reintentos que generen referencias duplicadas.
  7. Informar claramente el estado final del archivo y de la referencia en BD tras un fallo.
  8. Implementar un procedimiento de conciliación que detecte archivos guardados sin referencia válida en BD y referencias en BD cuyo archivo en Drive no exista.
  9. Garantizar que la supervisión no bloquee ni ralentice la carga normal de documentos.
- **Criterios de Aceptación:**
  - CA-078: El sistema obtiene y muestra las métricas de almacenamiento disponibles mediante los servicios autorizados.
  - CA-079: Cuando no se dispone de una métrica fiable, la interfaz identifica expresamente esa limitación.
  - CA-080: Los umbrales configurados generan el estado de advertencia correspondiente.
  - CA-081: Una misma condición persistente no genera notificaciones ilimitadas.
  - CA-082: Los errores de consulta quedan registrados y no se interpretan como almacenamiento disponible.
  - CA-083: Una carga documental fallida no se presenta como exitosa ni deja una referencia válida a un archivo inexistente.
  - CA-084: La conciliación identifica inconsistencias sin eliminar documentos automáticamente.
  - CA-085: La supervisión no consume innecesariamente las cuotas de ejecución de Google Apps Script.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-017] Completar el flujo de gestión de documentos pendientes, vencidos y faltantes
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 3 (P2 · Gestión Documental)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Ampliación de gestión documental)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `getStudentDocuments`, `uploadStudentDocument`, `updateDocumentStatus`, `DocumentosEstudiante`, `SolicitudesAdmision`
- **Descripción del Alcance:**
  Facilitar que los responsables administrativos identifiquen y gestionen los expedientes con documentación incompleta, autorizaciones pendientes o documentos vencidos durante toda la trayectoria educativa del estudiante.

  Requisitos Funcionales:
  1. Definir requisitos documentales por trámite o condición (admisión inicial, renovación, traslado, graduación, autorizaciones periódicas).
  2. Configurar cada requisito como obligatorio, opcional o condicional (con sus reglas activadoras).
  3. Registrar para cada documento: tipo documental, estudiante/expediente, estado, fecha recepción, fecha vencimiento, revisor, observaciones y versión vigente.
  4. Diferenciar claramente los estados: pendiente, recibido, en revisión, aprobado, rechazado, vencido y exento. Las exenciones de documentos obligatorios deben requerir autorización por rol.
  5. Detectar automáticamente documentos vencidos y próximos a vencer según la zona horaria institucional.
  6. Mostrar los faltantes en el expediente y en los trámites que dependan de ellos con las acciones requeridas para subsanar.
  7. Permitir sustituir documentos rechazados o vencidos sin borrar el archivo previo ni perder el historial de revisiones.
  8. Permitir registrar excepciones justificadas con responsable, fecha, motivo y alcance sin afectar a otros estudiantes.
  9. Evitar que un trámite u expediente aparezca como completo si falta un documento obligatorio no exento.
- **Criterios de Aceptación:**
  - CA-086: Un estudiante con todos los requisitos obligatorios aprobados aparece como documentalmente completo.
  - CA-087: La ausencia de un documento obligatorio impide completar el trámite cuando la normativa configurada así lo exija.
  - CA-088: Un documento opcional faltante no bloquea el trámite.
  - CA-089: Un documento vencido cambia de estado conforme a su fecha, sin modificar el historial de matrículas.
  - CA-090: Una exención autorizada queda registrada y no puede concederla un rol sin permiso.
  - CA-091: La sustitución de un archivo conserva la versión anterior, el autor del cambio y la fecha.
  - CA-092: La lista de pendientes se mantiene consistente tras actualizar o recargar la sesión.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-018] Completar la gestión de autorizaciones, responsables legales y contactos de emergencia
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 4 (P2 · Protección de Estudiantes)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Protección de estudiantes y permisos familiares)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `RelacionesEstudianteTutor`, `RelacionesFamiliares`, `updateFamilyLinkPermissions`, `revokeFamilyLink`, `validateContextualAccess`
- **Descripción del Alcance:**
  Reforzar la administración del ciclo de vida de las autorizaciones familiares y de tutores, haciendo explícitos sus efectos en el acceso a información académica, financiera, documental y de asistencia.

  Requisitos Funcionales:
  1. Mantener separadas las relaciones de parentesco, representación legal, responsabilidad financiera, contacto de emergencia y autorización de retiro.
  2. Permitir múltiples responsables por estudiante y múltiples estudiantes por responsable con registros independientes.
  3. Registrar vigencia, estado, fecha de autorización, fecha de revocación, usuario responsable y evidencia documental asociada.
  4. Permitir revocar una autorización específica sin eliminar otras relaciones válidas.
  5. Establecer reglas para autorizaciones vencidas, responsables sin cuenta de usuario e invitaciones pendientes.
  6. Propagar las revocaciones de inmediato a las comprobaciones de acceso del servidor (`validateContextualAccess`).
  7. Permitir registrar restricciones de custodia judicial o disputas legales para limitar la exposición de datos según permisos efectivos.
  8. Mostrar a los administradores la lista consolidada de quienes tienen acceso al expediente y sus categorías de consulta.
  9. Evitar que editar un responsable sobrescriba datos personales del estudiante o de otros vínculos.
- **Criterios de Aceptación:**
  - CA-093: Un responsable con permiso exclusivamente de emergencia no puede acceder a calificaciones ni información financiera.
  - CA-094: La revocación de un vínculo impide las consultas posteriores protegidas por ese vínculo.
  - CA-095: La revocación de una autorización no elimina otros permisos independientes válidos.
  - CA-096: Un responsable vinculado a varios estudiantes conserva únicamente los accesos autorizados para cada uno.
  - CA-097: Un vínculo vencido no otorga permisos activos.
  - CA-098: Los cambios quedan registrados con autor, fecha, valor anterior, valor nuevo y motivo.
  - CA-099: Las restricciones legales documentadas prevalecen sobre los permisos ordinarios incompatibles.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-019] Fortalecer la trazabilidad del expediente y la consulta del historial institucional
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 5 (P2 · Integridad Histórica)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Trazabilidad y auditoría administrativa)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
  - `js/teacher.js`
- **Dependencias Expuestas:** `getStudentTimeline`, `MovimientosEstudiante`, `Matriculas`, `HistorialCambiosEntidad`, `getEntityAuditHistory`
- **Descripción del Alcance:**
  Consolidar en una vista cronológica completa y auditable todos los eventos del ciclo de vida del expediente para uso administrativo y legal.

  Requisitos Funcionales:
  1. Consolidar cronológicamente: conversión desde admisión, matrículas, renovaciones, cambios de grado/sección/jornada, promociones, repitencias, retiros, traslados, reincorporaciones, graduación, revisión de documentos, cambios de tutores y correcciones administrativas.
  2. Cada evento debe mostrar: fecha/hora, tipo, autor/sistema, periodo escolar, resultado y referencia al registro original.
  3. Diferenciar claramente la situación actual de los antecedentes históricos.
  4. Registrar correcciones históricas autorizadas como nuevos eventos de auditoría conservando el valor anterior, valor nuevo, responsable y motivo.
  5. Proteger la bitácora frente a ediciones ordinarias para evitar borrado silencioso de eventos.
  6. Incorporar filtros por año lectivo, categoría, responsable y tipo de movimiento, más búsqueda textual.
  7. Permitir exportar el historial a un formato legible respetando permisos y minimizando PII.
  8. Mantener trazabilidad de fusiones de expedientes relacionando origen, destino y elementos consolidados.
- **Criterios de Aceptación:**
  - CA-100: Una trayectoria con múltiples movimientos muestra los eventos en orden cronológico exacto.
  - CA-101: Las correcciones autorizadas son visibles como cambios posteriores, sin borrar la trazabilidad previa.
  - CA-102: Un usuario sin permiso no puede consultar valores sensibles anteriores a una modificación.
  - CA-103: Los filtros por año lectivo devuelven exclusivamente los eventos del periodo seleccionado.
  - CA-104: Las fusiones de expedientes conservan una relación verificable entre origen y destino.
  - CA-105: La exportación coincide con los registros que el usuario está autorizado a consultar.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-020] Mejorar la búsqueda global y la navegación operativa del expediente
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 7 (P2 · Productividad Administrativa)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Navegación y productividad administrativa)
- **Archivos Involucrados:**
  - `js/ui-common.js`
  - `dashboard-secretaria.html`
  - `teacher-dashboard.html`
  - `js/secretary.js`
  - `js/teacher.js`
- **Dependencias Expuestas:** `searchGlobalOmnibox`, `findDuplicateStudents`, `ExpedientesEstudiantes`, `Matriculas`
- **Descripción del Alcance:**
  Optimizar la búsqueda global y la navegación del expediente para asegurar la localización rápida e inequívoca del estudiante, evitando errores de selección y clics innecesarios.

  Requisitos Funcionales:
  1. Permitir buscar por identificador de expediente, código de estudiante, DNI, nombres y apellidos.
  2. Normalizar mayúsculas, minúsculas, tildes y espacios sin alterar los datos persistidos.
  3. Distinguir coincidencias exactas de aproximadas e incluir identificadores secundarios para evitar confusión entre homónimos.
  4. Mostrar el estado institucional actual y periodo de matrícula en los resultados de búsqueda.
  5. Permitir filtrar por año lectivo, grado, sección, condición de matrícula y estado del expediente.
  6. Permitir acceso directo desde el resultado al expediente, documentos e historial.
  7. Mantener el contexto de búsqueda y filtros al navegar de ida y vuelta al expediente.
  8. Mostrar estados de carga, resultados vacíos, errores y falta de permisos de forma explícita.
  9. Enmascarar PII sensible (como DNI parcial) según los permisos del rol consultante.
  10. Ante coincidencias ambiguas, exigir selección manual en lugar de abrir automáticamente un expediente.
- **Criterios de Aceptación:**
  - CA-106: La búsqueda encuentra un estudiante por su identificador institucional o DNI.
  - CA-107: Variaciones de tildes o mayúsculas no impiden encontrar el registro.
  - CA-108: Homónimos se presentan como registros independientes claramente diferenciables.
  - CA-109: Un estudiante retirado o graduado puede localizarse indicando su estado real.
  - CA-110: Los fallos de conexión no se presentan como cero resultados.
  - CA-111: La navegación mantiene su funcionamiento en pantallas móviles y de escritorio.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-021] Implementar una matriz de integridad y conciliación entre los módulos institucionales
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 8 (P2 · Consistencia de Datos)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Integridad de datos entre microservicios)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** `auditAndReconcileIdentityInconsistencies`, `reconcileRestoredDataIntegrity`, `ExpedientesEstudiantes`, `Matriculas`, `Cobros`, `Asistencia`
- **Descripción del Alcance:**
  Establecer comprobaciones de consistencia que detecten divergencias de datos entre el expediente académico, la gestión de usuarios, el módulo financiero y el control de asistencia.

  Requisitos Funcionales:
  1. Definir la propiedad del dato por módulo (fuente de verdad).
  2. Mantener la correspondencia estricta entre `ExpedienteID`, `PersonaID`, `MatriculaID`, `UsuarioID` y referencias contables/asistencia.
  3. Verificar que los cambios de matrícula se propaguen a finanzas y asistencia según reglas de negocio.
  4. Diferenciar sincronizaciones inmediatas, diferidas y registros inmutables.
  5. Detectar matrículas huérfanas, cargos vinculados a IDs inexistentes y registros de asistencia desalineados.
  6. Registrar origen, fecha, resultado y errores de sincronización (`correlationId`).
  7. En fallos parciales, indicar qué módulo fue actualizado y cuál quedó pendiente.
  8. Permitir reintentos idempotentes.
  9. Proveer una consola administrativa de conciliación con acciones autorizadas de resolución.
  10. Prohibir modificaciones/fusiones automáticas de datos financieros o académicos sin revisión humana.
- **Criterios de Aceptación:**
  - CA-112: Una matrícula activa se vincula al expediente y periodo escolar correctos en todos los módulos.
  - CA-113: Un fallo de sincronización entre servicios queda registrado sin ocultarse.
  - CA-114: Los reintentos de sincronización no duplican cargos ni matrículas.
  - CA-115: Los registros históricos mantienen sus valores originales.
  - CA-116: La consola de conciliación identifica la entidad afectada, causa y acción recomendada.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-022] Ampliar la gestión de documentos con versiones, integridad y recuperación controlada
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 9 (P2 · Protección Documental)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Gestión documental avanzada y versiones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `DocumentosEstudiante`, `uploadStudentDocument`, `getStudentDocuments`, `DriveApp`
- **Descripción del Alcance:**
  Reforzar el control de versiones de los documentos del expediente, garantizando la conservación de antecedentes históricos y la verificación de accesibilidad real de los archivos en Google Drive.

  Requisitos Funcionales:
  1. Separar el documento lógico del expediente de cada versión física del archivo.
  2. Al sustituir un documento, conservar la referencia a la versión previa y a la versión vigente.
  3. Registrar usuario, fecha, motivo y resultado de revisión de cada versión.
  4. Verificar la accesibilidad física del archivo en Drive al consultar, detectando enlaces rotos o borrados externos.
  5. Proteger el acceso documental mediante endpoints autenticados y tokens temporales en lugar de URLs públicas.
  6. Permitir restaurar una versión anterior mediante acción autorizada, registrándola como nueva versión activa.
  7. Separar la eliminación lógica del registro de la eliminación física del archivo según políticas de retención.
  8. Mantener las validaciones de tipo (PDF, JPG, PNG, WEBP) y tamaño (10MB).
- **Criterios de Aceptación:**
  - CA-117: La sustitución de un documento conserva una referencia verificable a la versión anterior.
  - CA-118: La versión vigente se recupera correctamente tras recargar.
  - CA-119: Las referencias a archivos borrados en Drive se reportan como inconsistencias.
  - CA-120: Usuarios no autorizados no pueden descargar versiones previas mediante llamadas directas.
  - CA-121: La restauración de una versión genera un evento en el historial.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-023] Desarrollar un resumen institucional del expediente orientado a cada perfil autorizado
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 10 (P2 · Experiencia de Usuario)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (UX y visualización unificada por rol)
- **Archivos Involucrados:**
  - `dashboard-secretaria.html`
  - `teacher-dashboard.html`
  - `student-dashboard.html`
  - `js/secretary.js`
  - `js/teacher.js`
  - `js/student.js`
- **Dependencias Expuestas:** `getStudentFile`, `getStudentEnrollments`, `getStudentDocuments`, `ROLE_PERMISSIONS`
- **Descripción del Alcance:**
  Crear una vista de resumen inicial del expediente contextualizada según el rol del usuario (Secretaría, Docente, Estudiante/Padre), sin duplicar lógica de almacenamiento.

  Requisitos Funcionales:
  1. Presentar resumen con: identidad institucional, estado actual, matrícula vigente, movimientos recientes, documentos pendientes y accesos directos autorizados.
  2. Secretaría ve datos administrativos completos para matrículas y trámites.
  3. Docente ve únicamente información académica y de grupo sin controles administrativos.
  4. Estudiante/Familia ve sus propios datos y los de sus estudiantes vinculados según permisos de vínculo.
  5. Diferenciar visualmente datos no disponibles por permisos de datos no registrados.
  6. Mostrar marcas de fecha de actualización de cada sección.
  7. Permitir navegación fluida desde el resumen hacia los detalles sin duplicar formularios.
  8. Ante fallos de sub-servicios, renderizar las secciones disponibles e indicar el fallo de la sección afectada.
  9. Garantizar diseño adaptable e intuitivo en móviles.
- **Criterios de Aceptación:**
  - CA-122: Cada perfil visualiza exclusivamente las secciones autorizadas para su rol.
  - CA-123: El estado de matrícula coincide con el registro oficial.
  - CA-124: El fallo de un módulo no rompe la carga del resto del resumen.
  - CA-125: Los datos históricos se distinguen visualmente de los actuales.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-024] Incorporar notificaciones y seguimiento de trámites del expediente
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 11 (P2 · Automatización Administrativa)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Notificaciones y trámites)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `sendMultiChannelNotification`, `SolicitudesAdmision`, `DocumentosEstudiante`, `Matriculas`
- **Descripción del Alcance:**
  Implementar notificaciones automáticas e hilos de seguimiento para eventos clave del expediente (documentos vencidos, renovaciones pendientes, traslados, resoluciones).

  Requisitos Funcionales:
  1. Generar notificaciones para: documentos pendientes/vencidos, matrículas incompletas, cambios de sección/grado, reincorporaciones, revisiones documentales.
  2. Configurar destinatarios según evento, rol y autorizaciones del vínculo familiar.
  3. Registrar fecha de emisión, canal, destinatario y estado de entrega.
  4. Ofrecer panel de seguimiento de trámites pendientes con filtros por estado y fecha.
  5. Evitar PII sensible en mensajes externos (SMS/WhatsApp/Email); remitir al portal autenticado.
  6. Evitar notificaciones duplicadas en reintentos de operación.
  7. Permitir configurar recordatorios y alertas con frecuencia parametrizable.
  8. Respetar preferencias y revocaciones de contacto del tutor.
- **Criterios de Aceptación:**
  - CA-126: La proximidad de vencimiento documental dispara la notificación configurada.
  - CA-127: Reintentar un trámite no genera múltiples notificaciones idénticas.
  - CA-128: Un tutor revocado no recibe notificaciones posteriores.
  - CA-129: El estado de entrega se registra sin bloquear el trámite si el canal falla.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-025] Crear un mecanismo de revisión y recuperación de fusiones de expedientes
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 12 (P2 · Integridad de Identidad)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Auditoría y reversión de fusiones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `findDuplicateStudents`, `mergeStudentFiles`, `ExpedientesEstudiantes`, `HistorialCambiosEntidad`
- **Descripción del Alcance:**
  Desarrollar una interfaz de pre-visualización comparativa antes de fusionar expedientes y un protocolo de auditoría/desvinculación controlada en caso de fusión errónea.

  Requisitos Funcionales:
  1. Mostrar cuadro comparativo lado a lado (datos personales, matrículas, documentos, tutores, historial) antes de confirmar la fusión.
  2. Resaltar contradicciones de datos para resolución manual antes de fusionar.
  3. Exigir confirmación explícita con motivo registrado, responsable y fecha.
  4. Preservar la relación entre el expediente origen (marcado 'Fusionado') y el expediente destino.
  5. Registrar en la bitácora la lista exacta de entidades transferidas.
  6. Proporcionar un procedimiento administrativo documentado para separar o corregir fusiones erróneas.
  7. Prohibir fusiones automáticas sin intervención del personal autorizado.
- **Criterios de Aceptación:**
  - CA-130: La fusión requiere revisión previa de contradicciones y confirmación explícita.
  - CA-131: Todas las entidades transferidas son rastreables hasta su expediente original.
  - CA-132: Los identificadores históricos del expediente origen se conservan y no se eliminan.
  - CA-133: El procedimiento de corrección permite restituir asociaciones erróneas.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-026] Incorporar informes administrativos y exportación controlada del expediente
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 13 (P2 · Información Institucional)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Informes ejecutivos y exportación de datos)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `getStudentEnrollments`, `getStudentDocuments`, `ExpedientesEstudiantes`, `Matriculas`
- **Descripción del Alcance:**
  Construir un catálogo de informes administrativos sobre el estado y trayectoria de los expedientes con exportación en CSV/Excel y trazabilidad de descargas.

  Requisitos Funcionales:
  1. Generar reportes de: estado de expedientes (activos, retirados, traslados, graduados), matrículas por año/grado/sección/jornada, reincorporaciones, documentos faltantes/vencidos, inconsistencias.
  2. Incluir filtros por rango de fechas, grado, sección y estado.
  3. Exportación a CSV/Excel con minimización de datos (solo campos necesarios).
  4. Registrar en la bitácora de auditoría toda exportación masiva que contenga PII.
  5. Restringir la generación de reportes según los permisos del rol del usuario.
  6. Marcar claramente informes incompletos por fallos parciales de consulta.
- **Criterios de Aceptación:**
  - CA-134: Los reportes filtrados contienen exclusivamente registros del periodo y criterios seleccionados.
  - CA-135: La exportación CSV coincide exactamente con la grilla de datos visualizada.
  - CA-136: La descarga de información sensible queda registrada en la bitácora de trazabilidad.
  - CA-137: Usuarios sin permisos no pueden ejecutar exportaciones masivas.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-027] Fortalecer la recuperación y verificación de copias de seguridad del expediente
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 14 (P2 · Recuperación ante Incidentes)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Copias de seguridad y recuperación)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `createSystemBackup`, `verifyBackupIntegrity`, `restoreSystemBackup`, `reconcileRestoredDataIntegrity`
- **Descripción del Alcance:**
  Reforzar los procedimientos de restauración de respaldos, validando no solo la suma Checksum SHA-256 sino la integridad referencial completa de los expedientes y sus archivos en Drive.

  Requisitos Funcionales:
  1. Validar suma SHA-256 de la copia de seguridad antes de iniciar restauración.
  2. Verificar que el respaldo contenga las tablas esenciales (`ExpedientesEstudiantes`, `Matriculas`, `DocumentosEstudiante`, `MovimientosEstudiante`, `RelacionesFamiliares`).
  3. Escanear y reportar referencias a archivos de Drive inexistentes o inaccesibles.
  4. Ofrecer vista previa del impacto antes de confirmar la sobrescritura de datos.
  5. Exigir código de confirmación (`RESTORE-CONFIRMED`) y motivo documentado.
  6. Ejecutar reconciliación post-restauración y emitir informe de consistencia referencial.
- **Criterios de Aceptación:**
  - CA-138: Copias con Checksum alterado son rechazadas inmediatamente.
  - CA-139: Respaldos con referencias rotas emiten un reporte de advertencia detallado.
  - CA-140: La restauración exitosa conserva todas las relaciones históricas entre tablas.
  - CA-141: La operación queda registrada con autor, fecha, respaldo utilizado y resultado.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-028] Mejorar la accesibilidad y la eficiencia de uso del expediente en dispositivos móviles
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 16 (P3 · Experiencia de Usuario)
- **Prioridad:** P3
- **Severidad/Clasificación:** Bajo (UX, accesibilidad WCAG y rendimiento móvil)
- **Archivos Involucrados:**
  - `dashboard-secretaria.html`
  - `teacher-dashboard.html`
  - `student-dashboard.html`
  - `css/style.css`
  - `js/secretary.js`
  - `js/teacher.js`
- **Dependencias Expuestas:** `auditAndFixAccessibility`, `#modal-student-file`
- **Descripción del Alcance:**
  Optimizar la presentación del expediente digital en pantallas táctiles y dispositivos móviles, asegurando legibilidad, atajos por teclado y cumplimiento de pautas WCAG 2.2 AA.

  Requisitos Funcionales:
  1. Garantizar legibilidad de datos clave, estado y alertas en pantallas desde 320px de ancho.
  2. Evitar desbordamientos horizontales en tablas de expediente mediante tarjetas colapsables.
  3. Permitir navegación por pestañas y modales mediante teclado (`Tab`, `Esc`, `Enter`).
  4. Asegurar contraste de color suficiente y etiquetas `aria-*` en todos los controles interactivos.
  5. Preservar datos de formularios tras fallos de validación o pérdidas temporales de conexión.
  6. Proporcionar diálogos de confirmación claros para acciones críticas de expediente.
  7. Acompañar códigos de color con iconos y texto explicativo.
- **Criterios de Aceptación:**
  - CA-142: El expediente se consulta y opera completamente desde dispositivos móviles de 320px+.
  - CA-143: Los errores de formulario conservan la información previamente ingresada.
  - CA-144: Todos los controles del expediente responden a navegación por teclado con indicadores de foco visibles.
  - CA-145: Los estados visuales incluyen icono y texto descriptivo además del color.
- **Estado:** [X] Completado

---

===============================================================================
FASE 6. EXPEDIENTE INSTITUCIONAL Y CICLO DE VIDA DEL ESTUDIANTE
SEGUNDA PARTE: REESTRUCTURACIÓN ARQUITECTÓNICA, ESCALABILIDAD Y ADMINISTRACIÓN INTEGRAL DE MICROSERVICIOS
===============================================================================

### [X] [TAREA-F6-029] Reestructurar la arquitectura en microservicios independientes
- **Origen del Hallazgo:** F6-007 / Reestructuración arquitectónica
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Reestructuración arquitectónica)
- **Archivos Involucrados:** Todos los microservicios, `js/api.js`, `js/auth.js`, dashboards, registro central de servicios, autenticación, configuración y comunicaciones internas.
- **Descripción del Alcance:**
  Distribuir las responsabilidades del sistema entre microservicios independientes, reduciendo el acoplamiento entre áreas y permitiendo mantener, desplegar, supervisar y ampliar cada servicio sin reconstruir innecesariamente los demás.

  La reestructuración debe conservar todas las funcionalidades, variables, contratos, permisos, relaciones y flujos de trabajo existentes. No se debe considerar una migración válida si el código se ha separado, pero alguna función ha quedado desconectada, inaccesible o incompatible con los dashboards y servicios que la utilizan.

  Requisitos de implementación:
  1. Establecer una arquitectura en la que cada microservicio disponga de:
     - Proyecto y despliegue de Google Apps Script propios.
     - Configuración de ejecución independiente.
     - Identificador único e inmutable del servicio.
     - URL o punto de acceso registrado.
     - Spreadsheet propio, salvo las excepciones autorizadas para servicios agrupados.
     - Carpetas de Google Drive organizadas según sus responsabilidades.
     - Módulos de validación, autorización, diagnóstico y registro de errores.
     - Estrategia de respaldo y recuperación.
     - Versión identificable del código y del esquema de datos.
     - Contratos de comunicación autenticados con los demás componentes.

  2. Separar las funciones por responsabilidades funcionales, manteniendo las relaciones entre expedientes, usuarios, matrículas, documentos, asignaturas, evaluaciones, contabilidad, cobros y demás módulos existentes.

  3. Implementar una capa común de comunicación en `js/api.js` para que los dashboards consuman las operaciones de los servicios sin dispersar sus URLs por archivos, funciones y componentes.

  4. Centralizar el descubrimiento de servicios mediante un registro de configuración que identifique:
     - Servicio y área responsable.
     - Funciones y operaciones disponibles.
     - Endpoint de cada servicio.
     - Versión desplegada y contratos compatibles.
     - Recursos de almacenamiento asociados.
     - Permisos y roles autorizados.
     - Dependencias funcionales.
     - Estado administrativo y operativo.
     - Responsable de configuración y mantenimiento.

  5. Separar el código fuente de las configuraciones de cada despliegue. Las URLs, identificadores de hojas de cálculo, carpetas, permisos, parámetros y demás variables de entorno deben poder modificarse mediante configuración cuando corresponda, sin alterar la lógica funcional.

  6. Definir contratos de entrada y salida para las operaciones expuestas por cada servicio, incluyendo parámetros obligatorios, formatos de respuesta, errores, permisos requeridos y condiciones de ejecución.

  7. Mantener compatibilidad con las funciones existentes de expedientes, usuarios, documentos, movimientos académicos, contabilidad, autenticación, tareas, exámenes y demás módulos implementados.

  8. Evitar que el microservicio del desarrollador deba ejecutar directamente todas las operaciones institucionales. Su responsabilidad principal será administrar el registro, coordinar tareas autorizadas y supervisar los despliegues y servicios.

  9. Permitir que las operaciones independientes de cada servicio continúen funcionando cuando otro servicio o el plano de control esté temporalmente indisponible, siempre que la operación no requiera una dependencia esencial.

  10. Evitar duplicar datos institucionales compartidos por el simple hecho de que dos servicios o roles necesiten consultarlos. Cuando varias áreas requieran la misma entidad, debe definirse qué servicio es responsable de su creación y actualización y cómo los demás la consultan.

  Auditoría obligatoria durante la reestructuración:
  - Identificar las funciones públicas, privadas y compartidas de cada servicio antes de migrarlas.
  - Inventariar las variables globales, constantes, identificadores de hojas, nombres de columnas, estructuras de respuesta y dependencias utilizadas por cada función.
  - Identificar las llamadas entre funciones, los puntos de entrada de Apps Script y las operaciones invocadas por los dashboards.
  - Documentar los endpoints actuales y los nuevos, incluyendo sus parámetros, respuestas, permisos, errores y consumidores.
  - Verificar que cada función trasladada tenga un destino operativo y que no queden llamadas apuntando a implementaciones eliminadas o desactualizadas.
  - Comprobar que los nombres de funciones, acciones, parámetros y campos de respuesta continúen siendo compatibles o cuenten con adaptadores de compatibilidad explícitos.
  - Verificar cada etapa antes de continuar con la siguiente migración.
  - Comparar los resultados de las funciones antes y después del cambio utilizando los mismos casos de prueba y datos controlados.
- **Criterios de Aceptación:**
  - CA-046: Cada microservicio tiene un identificador único, configuración independiente y despliegue identificable.
  - CA-047: Cada servicio dispone del almacenamiento correspondiente, respetando las excepciones autorizadas.
  - CA-048: Los dashboards consumen las funciones mediante una capa de comunicación común.
  - CA-049: Un servicio puede actualizarse sin modificar los demás cuando sus contratos de comunicación no cambian.
  - CA-050: La caída de un servicio no bloquea automáticamente las funciones independientes.
  - CA-051: Las funciones migradas producen resultados equivalentes y conservan sus controles de acceso.
  - CA-052: El registro central identifica qué servicio atiende cada función y dónde está desplegado.
  - CA-145: La auditoría identifica las funciones, variables, bloques de código, endpoints y dependencias que deben conservarse durante cada migración.
  - CA-146: No quedan funciones existentes desconectadas, referencias obsoletas ni llamadas a endpoints inexistentes después de una etapa de migración.
  - CA-147: Los dashboards conservan la comunicación con los servicios que necesitan, sin depender de implementaciones internas que hayan sido trasladadas.
- **Estado:** [ ] Pendiente

---

### [X] [TAREA-F6-030] Crear los microservicios administrativos y financieros con separación por responsabilidades
- **Origen del Hallazgo:** F6-008 / Reestructuración de servicios
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Reestructuración de servicios)
- **Archivos Involucrados:** Dirección, Secretaría, Contabilidad, Cobros, Facturación, Recibos, Inventarios, Recursos Humanos, Planillas y módulos administrativos relacionados.
- **Descripción del Alcance:**
  A. Microservicio compartido de Dirección y Secretaría:
  Dirección y Secretaría podrán compartir un mismo microservicio y spreadsheet cuando las operaciones y los datos institucionales sean comunes, sin que esto implique conceder a ambos roles los mismos permisos.

  Requisitos funcionales:
  - Mantener un microservicio compartido para las funciones de Dirección y Secretaría.
  - Permitir que ambos roles utilicen el mismo spreadsheet cuando corresponda.
  - Crear carpetas de Drive separadas para Dirección y Secretaría.
  - Crear carpetas compartidas únicamente para documentos que deban ser accesibles a ambos roles.
  - Aplicar permisos por usuario, rol, área, módulo y operación.
  - Mantener las funciones institucionales de gestión de estudiantes, expedientes, matrículas, traslados, retiros, reingresos, graduaciones y demás procesos administrativos.
  - Evitar duplicar estudiantes, expedientes o matrículas por el hecho de que diferentes usuarios consulten o actualicen los mismos datos.
  - Permitir que una persona autorizada desempeñe simultáneamente funciones de Secretaría, Dirección u otras áreas, sin duplicar su identidad institucional.
  - Permitir que las operaciones autorizadas de Secretaría se extiendan a otras áreas, como Cobros o Facturación, cuando el usuario tenga asignadas las responsabilidades correspondientes.
  - Mantener registros de auditoría que permitan identificar al usuario, el rol o contexto operativo utilizado y la operación ejecutada.

  B. Microservicio financiero-administrativo:
  Contabilidad, Cobros, Facturación, Recibos, Inventarios, Recursos Humanos y Planillas podrán compartir un mismo microservicio, con módulos internos independientes y permisos específicos.

  Requisitos funcionales:
  1. Crear un microservicio financiero-administrativo que pueda gestionar: Contabilidad, Cobros y cuentas por cobrar, Facturación, Recibos, Cuentas por pagar, Inventarios, Bancos y conciliaciones, Recursos Humanos, Planillas y nómina, Acciones de personal, Contratos, permisos, ausencias y evaluaciones laborales, y Nuevas subáreas que se incorporen posteriormente.
  2. Organizar los módulos mediante componentes independientes, cada uno con sus operaciones, validaciones, permisos y registros.
  3. Permitir el intercambio de información cuando exista una relación funcional legítima. Por ejemplo, un cobro debe poder asociarse con su factura y recibo sin generar copias independientes e inconsistentes de la misma transacción.
  4. Mantener controles de acceso específicos por rol, área, módulo y operación. Tener acceso al microservicio no debe conceder automáticamente acceso a toda la información financiera o laboral.
  5. Separar los documentos de Recursos Humanos de los documentos contables y financieros.
  6. Evitar que los documentos laborales, las planillas y los datos financieros queden expuestos mediante carpetas raíz o permisos excesivamente amplios.
  7. Permitir que un usuario tenga responsabilidades en varias subáreas. Por ejemplo, una persona puede ser docente, contador y encargado de cafetería, con permisos diferenciados para cada función.
  8. Permitir que una secretaria autorizada realice cobros en efectivo y emita facturas sin tener que crear una segunda cuenta de usuario.
  9. Registrar cada operación con el usuario y el contexto de autorización correspondiente, sin asumir que todas las operaciones realizadas por una misma persona pertenecen a su rol principal.
  10. Permitir incorporar nuevas subáreas mediante configuración, sin reconstruir el microservicio.

  Estructura inicial de Google Drive:
  - `Administracion_Financiera/`
    - `Contabilidad/`
      - `Facturacion/`
      - `Cuentas_por_Cobrar/`
      - `Cuentas_por_Pagar/`
      - `Recibos/`
      - `Inventarios/`
      - `Bancos_y_Conciliaciones/`
      - `Reportes/`
      - `Otros_Modulos/`
    - `Recursos_Humanos/`
      - `Expedientes_Laborales/`
      - `Planillas/`
      - `Acciones_de_Personal/`
      - `Contratos/`
      - `Permisos_y_Ausencias/`
      - `Evaluaciones/`
      - `Otros_Modulos/`

  La estructura deberá generarse automáticamente al inicializar el servicio. Las nuevas subáreas se incorporarán mediante configuración, sin duplicar carpetas existentes ni reconstruir las que ya contienen documentos.
- **Criterios de Aceptación:**
  - CA-053: Dirección y Secretaría operan mediante el microservicio compartido, con permisos diferenciados y sin duplicación de entidades.
  - CA-054: Los módulos financieros y administrativos funcionan dentro del microservicio compartido con separación interna de responsabilidades.
  - CA-055: La estructura de carpetas se crea sin duplicar carpetas existentes.
  - CA-056: Cada documento queda asociado con su área y subárea.
  - CA-057: Un usuario sin autorización no puede consultar ni modificar información restringida.
  - CA-058: Facturas, cobros y recibos mantienen referencias consistentes.
  - CA-059: Las nuevas subáreas pueden incorporarse mediante configuración.
  - CA-060: La indisponibilidad de un módulo no bloquea las operaciones independientes de los demás.
  - CA-148: Un usuario con varios roles puede ejecutar operaciones autorizadas en distintas áreas desde una sola identidad institucional.
  - CA-149: Los permisos de una subárea no se extienden automáticamente a las demás.
  - CA-150: Los documentos y las transacciones conservan su trazabilidad al ser utilizados por usuarios con distintas responsabilidades.
- **Estado:** [ ] Pendiente

---

### [X] [TAREA-F6-031] Crear una plantilla de microservicio académico reutilizable para múltiples áreas
- **Origen del Hallazgo:** F6-009 / Modularización y reutilización de código
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Modularización y reutilización)
- **Archivos Involucrados:** Servicio de tareas y exámenes, dashboards de docentes y estudiantes, configuración académica, asignación de asignaturas, gestión de usuarios y despliegues académicos.
- **Descripción del Alcance:**
  Permitir que cada área académica disponga de un microservicio independiente utilizando una misma plantilla de código, sin mantener copias adaptadas manualmente para cada área. Los nombres de las áreas, asignaturas, grados, secciones, períodos y docentes deben ser configurables.

  A. Plantilla académica genérica:
  La plantilla debe contemplar las funciones existentes y previstas de: gestión de grados y secciones, gestión de asignaturas, asignación de asignaturas a grados y secciones, matrículas y relaciones académicas de estudiantes, asignación de docentes a asignaturas, grados, secciones y períodos, gestión de tareas, exámenes y evaluaciones, publicación, edición y consulta de actividades, fechas de apertura y cierre, estados de publicación, entrega y calificación, entregas de estudiantes y archivos adjuntos cuando corresponda, calificaciones, observaciones y retroalimentación, consultas de docentes sobre sus asignaciones autorizadas, consultas de estudiantes sobre las asignaturas en las que están matriculados, validaciones de integridad y relaciones entre entidades, registros de operaciones y diagnóstico, comunicación con los servicios de usuarios, matrículas, expedientes y demás dependencias institucionales necesarias.

  B. Áreas académicas iniciales:
  Configurar, como mínimo, estas 7 áreas y asignaturas iniciales:
  - Área 1. Comunicaciones: Español, Ortografía, Caligrafía, Literatura.
  - Área 2. Inglés: Spelling, Writing, Literature, Grammar, Otras asignaturas de inglés.
  - Área 3. Ciencias Sociales: Historia de Honduras, Estudios Sociales, Sociología, Educación Cívica, Otras asignaturas relacionadas.
  - Área 4. Ciencias: Química, Biología, Ciencias Naturales, Otras asignaturas científicas.
  - Área 5. Matemáticas: Matemáticas, Geometría, Física, Otras asignaturas relacionadas.
  - Área 6. Informática: Computación, Informática I, Informática Aplicada, Análisis y Diseño, Otras asignaturas de informática.
  - Área 7. Contaduría y Finanzas: Economía, Contabilidad, Otras asignaturas relacionadas.
  No incorporar mediante condiciones `if`, `switch` ni nombres fijos dentro de la lógica de negocio.

  C. Modelo de relaciones académicas:
  - Una institución puede tener varios grados.
  - Un grado puede tener varias secciones.
  - Un grado o sección puede tener varias asignaturas.
  - Una asignatura puede impartirse en distintos grados o secciones.
  - Una asignatura puede tener docentes diferentes según el grado, sección o período.
  - Un estudiante puede estar inscrito en varias asignaturas mediante sus relaciones de matrícula.
  - Un docente puede impartir varias asignaturas y atender diferentes secciones.
  - Cada tarea o examen pertenece a una asignatura y a una asignación académica específica.
  - Cada entrega, calificación y retroalimentación queda vinculada al estudiante y actividad correctos.
  - Los cambios de grado, sección, docente o período no alteran retroactivamente las calificaciones históricas ni reasignan actividades antiguas a personas incorrectas.
  Las relaciones deben utilizar identificadores únicos e inmutables.

  D. Coordinación académica configurable:
  Permitir crear y administrar áreas de coordinación que agrupen asignaturas, docentes y responsabilidades de supervisión (ID único, nombre, descripción, estado activo/inactivo, grados/secciones/períodos aplicables, asignaturas asociadas, coordinadores, docentes supervisados, alcance de supervisión, permisos de consulta/supervisión, reportes, historial de asignaciones).

  E. Independencia de cada instancia:
  Cada instancia dispone de proyecto y despliegue de Apps Script, Spreadsheet y datos propios, configuración independiente, registros propios, permisos y límites específicos, versión identificable y carpetas de Drive propias.
- **Criterios de Aceptación:**
  - CA-061: La plantilla no contiene nombres fijos de áreas, grados, asignaturas, docentes o secciones en la lógica funcional.
  - CA-062: Se puede crear una asignatura sin modificar el código.
  - CA-063: Se pueden crear grados, secciones y asignaciones docentes sin modificar el código.
  - CA-064: Cada instancia gestiona tareas y exámenes mediante su configuración y sus propios datos.
  - CA-065: Los estudiantes solo consultan sus asignaturas, actividades, entregas y calificaciones autorizadas.
  - CA-066: Los docentes solo administran las asignaciones y grupos autorizados.
  - CA-067: Los datos de una instancia no se mezclan con los de otra.
  - CA-068: Se conservan las relaciones entre tareas, exámenes, entregas, estudiantes, docentes y asignaturas.
  - CA-069: Los cambios de configuración no modifican automáticamente los registros históricos.
  - CA-070: Las funciones existentes de tareas y exámenes continúan operativas.
  - CA-151: Las coordinaciones se pueden configurar sin modificar el código.
  - CA-152: Una coordinación puede relacionar asignaturas, docentes, grados, secciones y períodos según su alcance autorizado.
  - CA-153: Un coordinador puede tener otros roles institucionales sin duplicar su cuenta ni ampliar automáticamente sus permisos.
- **Estado:** [ ] Pendiente

---

### [X] [TAREA-F6-032] Implementar el despliegue configurable de nuevos microservicios académicos
- **Origen del Hallazgo:** F6-010 / Automatización de despliegues
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Automatización de despliegues)
- **Archivos Involucrados:** Dashboard del desarrollador, plantilla académica, registro de servicios, configuración de Apps Script, almacenamiento y sistema de permisos.
- **Descripción del Alcance:**
  1. Incorporar en el dashboard del desarrollador una sección para administrar instancias académicas.
  2. Permitir registrar una instancia mediante un formulario (ID interno, nombre del área, descripción, plantilla y versión de código, proyecto/cuenta Apps Script destino, Spreadsheet asignado, carpetas Drive, permisos, asignaturas/grados/secciones iniciales, coordinaciones iniciales, estado de despliegue, responsable).
  3. Permitir agregar o modificar asignaturas, grados, secciones, docentes y coordinaciones desde la plataforma sin desplegar nueva versión cuando los cambios sean puramente configurativos.
  4. Flujo de inicialización idempotente: valida configuración, comprueba inexistencia previa, prepara recursos, crea estructuras/carpetas que falten, registra IDs, despliega/registra versión, ejecuta pruebas de conectividad y registra resultado.
  5. Control de estados explícitos: `Borrador`, `Pendiente de configuración`, `Preparando recursos`, `Desplegando`, `Validando`, `Activo`, `Con errores`, `Suspendido`, `Retirado`.
  6. Si un paso falla, registra el error y permite reanudar el proceso sin duplicar estructuras.
  7. Si requiere autorización Google OAuth manual, indica el paso pendiente sin marcar erróneamente como exitoso.
  8. Permitir actualizar una instancia sin modificar otras.
  9. Historial de versiones de plantilla asociadas a cada instancia.
  10. Permitir intervenciones del propietario de la cuenta cuando Google requiera autorización sin guardar credenciales en el código.
  11. Auditar creación, actualización, suspensión y retirada de instancias (solicitante, fecha, resultado).
- **Criterios de Aceptación:**
  - CA-071: Se puede registrar una nueva área académica desde el dashboard.
  - CA-072: La creación no requiere editar nombres de áreas o asignaturas en el código.
  - CA-073: Cada instancia recibe y registra sus propios recursos.
  - CA-074: La inicialización es idempotente.
  - CA-075: Los fallos dejan un estado y diagnóstico verificables.
  - CA-076: Una instancia incompleta no aparece como activa.
  - CA-077: Los cambios exclusivamente configurativos no requieren un nuevo despliegue.
  - CA-078: Las actualizaciones de plantilla no modifican automáticamente todas las instancias.
  - CA-079: Se registra quién solicitó una operación, cuándo se ejecutó y cuál fue el resultado.
  - CA-154: La creación de una instancia permite definir sus coordinaciones y asignaciones iniciales sin modificar la plantilla.
- **Estado:** [ ] Pendiente

---

### [X] [TAREA-F6-033] Crear el microservicio central del desarrollador y el registro de servicios
- **Origen del Hallazgo:** F6-011 / Administración y supervisión centralizada
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Plano de control central)
- **Archivos Involucrados:** Microservicio del desarrollador, dashboard del desarrollador, registro central y todos los servicios registrados.
- **Descripción del Alcance:**
  A. Registro central de servicios:
  Mantener un registro con ID único, nombre, tipo, área, estado administrativo, último estado operativo, proyecto y despliegue asociado, versión de código y esquema, fecha de creación/actualización, último contacto, URL/referencia de conexión, recursos asociados, operaciones, roles/permisos, dependencias, responsable, configuración, último diagnóstico y último error.

  B. Contrato común de comunicación:
  Contrato común con `correlationId`, registro de origen/destino/operación/hora/resultado, diferenciación de errores, timeouts, prevención de reintentos ilimitados, separación de operaciones administrativas e imposición de catálogo de comandos autorizados.

  C. Administración de roles y responsabilidades:
  Administrar usuarios con múltiples roles simultáneos, asignaciones por área/subárea, permisos por servicio/módulo/operación, coordinadores vinculados, vigencia, activación/suspensión/revocación e historial de cambios. Validado en backend por cada servicio.

  D. Independencia del plano de control:
  El microservicio del desarrollador administra el registro y supervisa despliegues. Si queda fuera de línea, los servicios operativos independientes continúan operando.
- **Criterios de Aceptación:**
  - CA-080: El dashboard presenta los servicios registrados y sus configuraciones.
  - CA-081: Cada servicio se identifica mediante un identificador estable.
  - CA-082: Se diferencia el estado administrativo del último estado operativo.
  - CA-083: Se identifica cuándo un estado está desactualizado.
  - CA-084: Las solicitudes de diagnóstico incluyen identificador de correlación y resultado.
  - CA-085: Se diferencian los errores de ejecución de los errores de comunicación.
  - CA-086: La indisponibilidad del servicio central no detiene automáticamente las operaciones independientes.
  - CA-087: No se permite ejecutar código arbitrario mediante comandos administrativos.
  - CA-155: El registro permite administrar usuarios con múltiples roles y responsabilidades sin duplicar sus identidades.
  - CA-156: Los roles pueden relacionarse con áreas, subáreas, coordinaciones y servicios.
  - CA-157: Los cambios de asignaciones y permisos quedan auditados y se aplican mediante validaciones del servidor.
- **Estado:** [ ] Pendiente

---

### [X] [TAREA-F6-034] Implementar módulos de salud, diagnóstico, tráfico y errores en cada microservicio
- **Origen del Hallazgo:** F6-012 / Observabilidad y mantenimiento preventivo
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Observabilidad y diagnóstico)
- **Archivos Involucrados:** Todos los microservicios y dashboard del desarrollador.
- **Descripción del Alcance:**
  A. Estado del servicio:
  Operaciones de diagnóstico en cada servicio que comprueben disponibilidad del endpoint, integridad de configuración, acceso a Sheets y Drive, dependencias, correspondencia de versión, errores recientes, última comprobación y operaciones pendientes.

  B. Diagnóstico funcional:
  Pruebas de lectura y pruebas controladas de escritura sin alterar datos reales, comprobación de integridad y contratos API sin revelar PII o credenciales.

  C. Métricas de tráfico y rendimiento:
  Registro de solicitudes totales, éxitos/fallos, latencia ms, errores por categoría, reintentos y consumo de ejecuciones GAS con fecha de actualización.

  D. Registro de errores:
  Enriquecimiento de errores con `eventId`, servicio, módulo, operación, timestamp, severidad, `correlationId`, versión, resultado y estado de resolución. Sanitización obligatoria.

  E. Dashboard de supervisión:
  Consulta general, filtros multi-servicio, historial de disponibilidad, diagnóstico en vivo y mapa de dependencias afectadas.
- **Criterios de Aceptación:**
  - CA-088: Todos los microservicios implementan el contrato común de diagnóstico.
  - CA-089: El desarrollador consulta el estado desde el dashboard.
  - CA-090: El diagnóstico diferencia conectividad, acceso a datos, acceso a documentos y fallos funcionales.
  - CA-091: Los errores pueden filtrarse por servicio, módulo, fecha, severidad y categoría.
  - CA-092: Cada error relevante se relaciona con su operación y versión cuando esa información esté disponible.
  - CA-093: Las métricas incluyen fecha de actualización y no inventan valores.
  - CA-094: Los registros no exponen credenciales ni documentos completos.
  - CA-095: Un error de supervisión no altera los datos operativos ni bloquea las funciones principales.
  - CA-158: El diagnóstico identifica endpoints faltantes, contratos incompatibles y dependencias que impiden completar operaciones.
- **Estado:** [ ] Pendiente

---

### [X] [TAREA-F6-035] Incorporar administración segura de logs y comandos operativos
- **Origen del Hallazgo:** F6-013 / Herramientas de mantenimiento
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Herramientas de mantenimiento)
- **Archivos Involucrados:** Dashboard del desarrollador y módulos de supervisión.
- **Descripción del Alcance:**
  - Consulta y filtrado de logs multi-servicio desde el dashboard central.
  - Marcado de errores como revisados/resueltos conservando historial de auditoría.
  - Purgas y archivos seguros de registros temporales conservando logs protegidos inmutables.
  - Catálogo cerrado de comandos permitidos (diagnóstico, almacenamiento, respaldos, purga de temporales). Prohibida ejecución de cadenas o código libre.
  - Cola de operaciones administrativas asíncronas con cancelación e idempotencia.
  - Permisos específicos por comando.
- **Criterios de Aceptación:**
  - CA-096: El desarrollador consulta y filtra logs desde el dashboard.
  - CA-097: Las acciones de limpieza requieren autorización y confirmación.
  - CA-098: La limpieza no elimina registros de auditoría protegidos.
  - CA-099: Los comandos pertenecen a un catálogo permitido.
  - CA-100: Cada operación registra solicitante, servicio, fecha, resultado y error cuando corresponda.
  - CA-101: Las operaciones pendientes, fallidas y completadas se distinguen.
  - CA-102: Repetir una solicitud no duplica efectos cuando se requiere idempotencia.
  - CA-159: Los comandos administrativos aplican permisos específicos por operación y no se autorizan únicamente por el rol general del usuario.
- **Estado:** [ ] Pendiente

---

### [X] [TAREA-F6-036] Implementar respaldos independientes y recuperación por área
- **Origen del Hallazgo:** F6-014 / Continuidad operativa y recuperación de datos
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Respaldos aislados y restauración)
- **Archivos Involucrados:** Todos los microservicios, Google Sheets, Google Drive y dashboard del desarrollador.
- **Descripción del Alcance:**
  A. Respaldos por servicio:
  Generar y programar respaldos aislados por microservicio (Sheets, Drive, configuraciones y metadatos) con checksum de verificación y registro en catálogo central.

  B. Estrategia de almacenamiento:
  Almacenamiento aislado de respaldos, políticas de retención y rotación, detección de copias corruptas o alteradas.

  C. Recuperación:
  Proceso de restauración por área con vista previa de impacto, verificación de integridad referencial, confirmación explícita y simulación en entorno aislado sin afectar otros servicios.

  D. Control de capacidad:
  Supervisión preventiva del volumen de respaldos y políticas de depuración de copias obsoletas.
- **Criterios de Aceptación:**
  - CA-103: Se puede solicitar un respaldo individual por microservicio.
  - CA-104: Los respaldos quedan registrados con identificador, fecha, alcance y resultado.
  - CA-105: Se detectan respaldos incompletos o cuya integridad no puede verificarse.
  - CA-106: Restaurar un servicio no sobrescribe datos de otro.
  - CA-107: Las restauraciones destructivas muestran su alcance y solicitan confirmación.
  - CA-108: Se pueden probar restauraciones sin modificar producción.
  - CA-109: Las restauraciones registran sus resultados y verificaciones.
  - CA-110: Existe una política configurable de retención y rotación.
  - CA-111: Se identifican problemas de capacidad y acumulación cuando existan mediciones fiables.
  - CA-112: El procedimiento de recuperación está documentado y no depende de instrucciones manuales conocidas por una sola persona.
  - CA-160: La restauración conserva las relaciones necesarias entre usuarios, roles, áreas, documentos y datos operativos del servicio recuperado.
- **Estado:** [ ] Pendiente

---

### [X] [TAREA-F6-037] Establecer seguridad, aislamiento y gestión centralizada de permisos
- **Origen del Hallazgo:** F6-015 / Seguridad y control de acceso
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Seguridad, identidad única y RBAC/ABAC)
- **Archivos Involucrados:** Todos los microservicios, dashboards, autenticación, registro de servicios y comunicaciones internas.
- **Descripción del Alcance:**
  A. Identidad y roles múltiples:
  Identidad institucional única por persona con asignaciones flexibles de múltiples roles simultáneos por servicio, área, subárea o módulo.

  B. Modelo de autorización:
  Matriz de permisos para todos los perfiles institucionales (Dirección, Secretaría, Contabilidad, Cobros, Facturación, RRHH, Docentes, Estudiantes, Coordinadores, Desarrolladores).

  C. Coordinaciones y áreas personalizables:
  Creación y edición de coordinaciones con alcance acotado de supervisión por área, asignatura, grado o sección.

  D. Seguridad de los servicios:
  Validación obligatoria de autenticación y autorización en el servidor de cada microservicio. Protección contra IDOR, elevación de privilegios y almacenamiento de secretos en el frontend.
- **Criterios de Aceptación:**
  - CA-113: Cada microservicio valida autorizaciones del lado del servidor.
  - CA-114: La autorización en un servicio no se hereda automáticamente por los demás.
  - CA-115: No se puede acceder a documentos o registros ajenos manipulando identificadores.
  - CA-116: Los secretos no se exponen en el frontend ni en logs.
  - CA-117: Los comandos administrativos requieren permisos específicos.
  - CA-118: Los cambios de acceso y las operaciones sensibles quedan auditados.
  - CA-119: Se puede revocar el acceso a un servicio sin invalidar innecesariamente accesos independientes.
  - CA-120: Las pruebas de seguridad incluyen intentos de acceso no autorizado desde el navegador y mediante solicitudes directas al backend.
  - CA-161: Un usuario puede tener varios roles sin duplicar su identidad institucional.
  - CA-162: Los permisos se pueden asignar y revocar por área, subárea, servicio, módulo y operación.
  - CA-163: Las coordinaciones pueden relacionarse con asignaturas, docentes supervisados y responsables autorizados.
  - CA-164: Los cambios de roles y responsabilidades no conceden privilegios implícitos en áreas ajenas.
  - CA-165: La autorización se comprueba en cada operación protegida y no depende únicamente del rol seleccionado visualmente en el dashboard.
- **Estado:** [ ] Pendiente

---

### [X] [TAREA-F6-038] Implementar despliegues versionados, migraciones y reversión controlada
- **Origen del Hallazgo:** F6-016 / Mantenimiento y evolución del sistema
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Versionado y reversión)
- **Archivos Involucrados:** Todos los microservicios, plantillas de código y dashboard del desarrollador.
- **Descripción del Alcance:**
  - Versionado explícito de código, esquemas y configuraciones por microservicio.
  - Registro de cambios (changelog) y contratos de compatibilidad.
  - Verificación de dependencias y pruebas automáticas post-despliegue.
  - Migraciones de datos idempotentes y no destructivas.
  - Procedimiento de reversión (rollback) probado para código, esquemas y datos.
  - Auditoría de impacto previa a cada despliegue.
- **Criterios de Aceptación:**
  - CA-121: Cada servicio identifica su versión de código y esquema.
  - CA-122: Un despliegue fallido no se registra como satisfactorio.
  - CA-123: Las migraciones validan su alcance antes de modificar datos.
  - CA-124: Repetir una migración no duplica registros ni estructuras.
  - CA-125: Las actualizaciones de una instancia no alteran otras.
  - CA-126: Se identifica la versión activa cuando ocurre un error.
  - CA-127: Existe un procedimiento probado para recuperar el servicio después de una actualización fallida.
  - CA-128: Las actualizaciones conservan permisos y relaciones existentes.
  - CA-166: Cada actualización incluye una auditoría de impacto sobre funciones, variables, endpoints, dashboards y dependencias.
  - CA-167: Las migraciones preservan las asignaciones de roles, las relaciones académicas y las referencias entre servicios.
- **Estado:** [ ] Pendiente

---

### [X] [TAREA-F6-039] Centralizar la configuración y las dependencias sin centralizar todos los datos
- **Origen del Hallazgo:** F6-017 / Configuración e interoperabilidad
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Configuración e interoperabilidad)
- **Archivos Involucrados:** Registro de servicios, microservicio del desarrollador, autenticación, dashboards y servicios operativos.
- **Descripción del Alcance:**
  - Registro centralizado de configuraciones, endpoints y referencias de almacenamiento.
  - Descentralización de los datos operativos en sus respectivos microservicios.
  - Modificación de URLs y parámetros mediante configuración sin editar código.
  - Versionado de cambios de configuración y retiro controlado de servicios descontinuados.
  - Catálogo central de contratos API y detección de llamadas obsoletas.
- **Criterios de Aceptación:**
  - CA-129: Cada servicio tiene configuración registrada y verificable.
  - CA-130: Las dependencias se consultan desde el dashboard.
  - CA-131: Las configuraciones incompletas se detectan antes de activar una instancia.
  - CA-132: Los cambios de configuración quedan registrados y auditables.
  - CA-133: La retirada de un servicio no deja referencias activas sin identificar.
  - CA-134: Los dashboards distinguen entre indisponibilidad y ausencia de datos.
  - CA-135: Se identifican las funciones disponibles cuando falla una dependencia.
  - CA-168: Los endpoints y sus contratos pueden consultarse en un registro central actualizado.
  - CA-169: Los cambios de roles, áreas y coordinaciones se reflejan en los servicios autorizados sin exigir modificaciones manuales dispersas en los dashboards.
- **Estado:** [ ] Pendiente

---

### [X] [TAREA-F6-040] Validar el rendimiento, la capacidad y la recuperación de la arquitectura completa
- **Origen del Hallazgo:** F6-018 / Pruebas de integración y escalabilidad
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Pruebas de carga e integración)
- **Archivos Involucrados:** Todos los microservicios, dashboards, Google Apps Script, Google Sheets y Google Drive.
- **Descripción del Alcance:**
  - Pruebas integrales multi-servicio que evalúen carga, concurrencia, resiliencia y tolerancia a fallos.
  - Verificación de idempotencia ante reintentos de red.
  - Medición de latencia, tiempos de ejecución y cuotas GAS.
  - Verificación end-to-end de usuarios con múltiples roles y permisos contextuales.
  - Confirmación de que las funciones de los dashboards continúan operando correctamente tras las migraciones.
- **Criterios de Aceptación:**
  - CA-136: Se incorpora una nueva instancia académica sin modificar las existentes.
  - CA-137: La interrupción de un servicio no bloquea automáticamente operaciones independientes.
  - CA-138: Los fallos de comunicación y almacenamiento quedan registrados y pueden diagnosticarse.
  - CA-139: Los reintentos no generan duplicados en las operaciones que requieren idempotencia.
  - CA-140: Se verifica la integridad de datos y documentos antes y después de una recuperación.
  - CA-141: Las métricas de rendimiento provienen de pruebas reproducibles.
  - CA-142: Se identifican los límites operativos conocidos antes de que provoquen fallos recurrentes, cuando existen datos suficientes.
  - CA-143: Las funciones existentes se verifican después de la migración.
  - CA-144: No se considera completada la fase mientras existan errores críticos de integridad, seguridad o recuperación sin resolver.
  - CA-170: Las pruebas verifican que un usuario puede ejercer varios roles autorizados desde una identidad institucional única.
  - CA-171: Las pruebas verifican que cada rol conserva sus permisos específicos y no hereda privilegios indebidos.
  - CA-172: Los flujos que involucran varios servicios y dashboards mantienen la comunicación, las relaciones de datos y los permisos.
  - CA-173: Los cambios de configuración, despliegue o asignación de responsabilidades no dejan funciones existentes inaccesibles.
- **Estado:** [X] Completado


===============================================================================
FASE 7. PLANIFICACIÓN ACADÉMICA, HORARIOS Y RECURSOS
===============================================================================

### [X] [TAREA-F7-IMP-01] Ampliar la validación integral de horarios y asignaciones
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-01 (P1 · Fortalecimiento de Validaciones)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación funcional y fortalecimiento de validaciones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `checkScheduleConflict`, `createClassSchedule`, `getTeacherTeachingLoad`, `HorariosClase`, `CalendarioAcademico`, `HorariosLaborales`, `SedesAulas`
- **Descripción del Alcance:**
  Consolidar las reglas de validación aplicables a las asignaciones académicas, considerando las relaciones entre horarios, disponibilidad, períodos académicos, evaluaciones, recursos y reglas institucionales antes de crear, modificar, importar o publicar una asignación.

  Requisitos Funcionales:
  1. Consolidar las reglas de validación aplicables a las asignaciones académicas, sin duplicar innecesariamente las comprobaciones existentes.
  2. Evaluar las restricciones pertinentes antes de crear, modificar, importar o publicar una asignación.
  3. Distinguir entre:
     - Conflictos que impiden guardar o publicar.
     - Advertencias que permiten continuar con autorización.
     - Preferencias de planificación que pueden incumplirse sin invalidar la operación.
     - Errores de configuración que impiden evaluar correctamente una asignación.
  4. Detectar superposiciones horarias exactas y parciales.
  5. Considerar las fechas efectivas de las actividades, las excepciones del calendario y los períodos académicos aplicables.
  6. Validar la disponibilidad del docente, el aula y los recursos requeridos.
  7. Comprobar las restricciones de las secciones y los grupos involucrados.
  8. Identificar incompatibilidades entre clases, evaluaciones y otras actividades cuando compartan participantes o recursos exclusivos.
  9. Ejecutar las validaciones sobre el estado actualizado de los datos, no exclusivamente sobre información previamente cargada en la interfaz.
  10. Devolver resultados estructurados que permitan identificar las asignaciones afectadas y la regla incumplida.
  11. Evitar que la creación o modificación de un horario deje el sistema en un estado inconsistente si una validación o escritura falla.
  12. Conservar las excepciones legítimas que estén expresamente configuradas, sin convertir todas las coincidencias horarias en errores.
- **Criterios de Aceptación:**
  - CA-F7-01: Una asignación incompatible con una restricción obligatoria no puede confirmarse.
  - CA-F7-02: Una coincidencia permitida por una excepción explícita se acepta y conserva la justificación correspondiente.
  - CA-F7-03: Los intervalos parcialmente superpuestos se detectan correctamente.
  - CA-F7-04: Los intervalos consecutivos que no se superponen se aceptan, salvo que exista otra restricción aplicable.
  - CA-F7-05: Las modificaciones se validan considerando tanto el horario anterior como el nuevo, sin generar conflictos artificiales con el registro que se está actualizando.
  - CA-F7-06: Los errores identifican el recurso, docente, grupo o actividad implicados.
  - CA-F7-07: Una operación fallida no deja asignaciones parcialmente actualizadas.
  - CA-F7-08: Las reglas existentes que funcionan correctamente siguen superando sus pruebas.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-02] Implementar una matriz visual de planificación y disponibilidad
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-02 (P1 · Interfaz de Planificación)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación de interfaz y herramientas de planificación)
- **Archivos Involucrados:**
  - `teacher-dashboard.html`
  - `js/teacher.js`
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** `getClassSchedules`, `getClassroomResources`, `getTeacherAssignments`, `HorariosClase`, `SedesAulas`
- **Descripción del Alcance:**
  Incorporar una herramienta integral de visualización que permita comparar la disponibilidad de docentes, secciones, asignaturas, aulas y recursos para tomar decisiones de planificación desde una misma matriz unificada.

  Requisitos Funcionales:
  1. Incorporar una vista de planificación que permita alternar entre:
     - Horario institucional.
     - Horario por docente.
     - Horario por sección.
     - Horario por asignatura.
     - Ocupación por aula.
     - Disponibilidad por recurso.
  2. Permitir filtrar por año lectivo, período académico, jornada, sede, grado, sección y estado de publicación.
  3. Mostrar, para cada asignación, la información pertinente: asignatura, sección/grupo, docente, aula, día y horario, período académico y estado de la asignación.
  4. Diferenciar visualmente las clases confirmadas, los borradores, las actividades canceladas y los conflictos pendientes.
  5. Mostrar los intervalos disponibles y ocupados.
  6. Permitir seleccionar un bloque para consultar sus detalles y ejecutar las acciones autorizadas.
  7. Permitir identificar la disponibilidad simultánea de los recursos necesarios para una nueva clase.
  8. Actualizar los resultados después de guardar, modificar o cancelar una asignación.
  9. Proporcionar estados vacíos y mensajes claros cuando no existan resultados para los filtros seleccionados.
  10. Mantener la interfaz utilizable en pantallas de escritorio, tabletas y dispositivos móviles.
  11. Facilitar la impresión o exportación de las vistas cuando corresponda.
  12. Respetar los permisos de consulta y modificación del usuario.
- **Criterios de Aceptación:**
  - CA-F7-09: Un coordinador puede consultar la ocupación de un aula para un intervalo determinado.
  - CA-F7-10: Puede identificar los horarios de un docente y de una sección sin consultar manualmente cada registro.
  - CA-F7-11: Los filtros combinados devuelven únicamente los registros que cumplen las condiciones seleccionadas.
  - CA-F7-12: Una asignación cancelada deja de mostrarse como vigente, aunque pueda seguir disponible en el historial.
  - CA-F7-13: Una modificación confirmada se refleja en todas las vistas pertinentes.
  - CA-F7-14: Los usuarios sin permiso de modificación no pueden alterar los horarios desde esta interfaz.
  - CA-F7-15: Las consultas no muestran información de períodos o grupos ajenos al ámbito autorizado.
  - CA-F7-16: La vista funciona con horarios extensos sin bloquear la interacción ni ocultar información esencial.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-03] Desarrollar una herramienta de resolución asistida de conflictos
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-03 (P1 · Optimización de Horarios)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Nueva capacidad de planificación y optimización)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `checkScheduleConflict`, `getClassSchedules`, `getTeacherTeachingLoad`, `getClassroomResources`, `F7-IMP-01`, `F7-IMP-02`
- **Descripción del Alcance:**
  Implementar un mecanismo integral de resolución asistida que agrupe conflictos, proporcione explicaciones claras y evalúe alternativas válidas (cambio de horario, sustituto disponible, aula alternativa, reprogramación) permitiendo comparar sus consecuencias antes de aplicar cambios oficiales.

  Requisitos Funcionales:
  1. Mostrar los conflictos agrupados por docente, aula, sección, recurso y actividad.
  2. Identificar todas las asignaciones que participan en un mismo conflicto.
  3. Explicar qué regla se incumple y qué intervalo produce la incompatibilidad.
  4. Proponer alternativas válidas, cuando existan: cambiar el horario, utilizar otro docente disponible, seleccionar otra aula compatible, reasignar el recurso, reprogramar la actividad.
  5. Comprobar que cada alternativa propuesta satisface las restricciones obligatorias.
  6. Mostrar las consecuencias de cada alternativa sobre las asignaciones relacionadas.
  7. Permitir comparar alternativas sin modificar todavía los datos oficiales.
  8. Exigir confirmación antes de aplicar cambios que afecten a otras asignaciones o usuarios.
  9. Volver a validar la alternativa seleccionada inmediatamente antes de guardarla.
  10. Identificar los casos en que no exista una solución válida y explicar las restricciones que lo impiden.
  11. Registrar la resolución seleccionada y los cambios efectivamente aplicados.
  12. Permitir que el usuario descarte una propuesta sin alterar la planificación existente.
- **Criterios de Aceptación:**
  - CA-F7-17: Ante un conflicto docente, el sistema puede mostrar intervalos alternativos que respeten su disponibilidad.
  - CA-F7-18: Las alternativas que producen otros conflictos obligatorios se descartan o se identifican explícitamente como inválidas.
  - CA-F7-19: Una propuesta no modifica los datos oficiales antes de su confirmación.
  - CA-F7-20: Si los datos cambian mientras se evalúa una alternativa, el sistema vuelve a validarla.
  - CA-F7-21: La confirmación aplica únicamente los cambios seleccionados.
  - CA-F7-22: Si la operación falla, no quedan modificaciones parciales.
  - CA-F7-23: Si no existe una alternativa válida, el sistema lo comunica sin presentar una solución incorrecta como aceptable.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-04] Incorporar planificación masiva y optimización de horarios
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-04 (P2 · Planificación Masiva)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Nueva herramienta de planificación avanzada)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `publishClassSchedules`, `checkScheduleConflict`, `F7-IMP-01`, `F7-IMP-02`, `F7-IMP-03`
- **Descripción del Alcance:**
  Desarrollar un entorno de escenarios de planificación masiva en borrador que permita generar, reorganizar y optimizar conjuntos completos de horarios respetando restricciones obligatorias (disponibilidad docente, exclusividad de aula, jornadas) y evaluando preferencias configurables sin alterar el horario oficial hasta su publicación explícita.

  Requisitos Funcionales:
  1. Permitir preparar un escenario de planificación sin modificar el horario oficial.
  2. Incorporar las clases, asignaturas, secciones, docentes, aulas y períodos que participarán en el escenario.
  3. Utilizar como restricciones obligatorias: disponibilidad docente, exclusividad de aulas y recursos, compatibilidad de jornadas, disponibilidad de las secciones, duración de las clases, restricciones académicas configuradas.
  4. Permitir establecer preferencias, cuando sean pertinentes: reducir períodos libres innecesarios, distribuir la carga docente, evitar concentraciones de clases o evaluaciones, favorecer uso eficiente de aulas, respetar preferencias docentes autorizadas.
  5. Diferenciar las restricciones obligatorias de las preferencias optimizables.
  6. Permitir comparar el escenario propuesto con el horario actual.
  7. Mostrar las asignaciones que no pudieron ubicarse y las razones identificadas.
  8. Permitir bloquear asignaciones que no deban cambiar durante una reorganización.
  9. Recalcular las asignaciones afectadas cuando cambie una restricción.
  10. Permitir guardar un escenario como borrador y retomarlo posteriormente.
  11. Exigir validación y confirmación antes de publicar el resultado.
  12. Registrar los cambios introducidos al aplicar un escenario.
- **Criterios de Aceptación:**
  - CA-F7-24: La generación de un escenario no modifica el horario oficial.
  - CA-F7-25: Ningún escenario puede publicarse si contiene conflictos obligatorios no resueltos.
  - CA-F7-26: Las asignaciones bloqueadas se conservan durante la reorganización.
  - CA-F7-27: Las restricciones imposibles de satisfacer se identifican de forma explícita.
  - CA-F7-28: Las preferencias no sustituyen a las restricciones obligatorias.
  - CA-F7-29: El sistema permite comparar la carga docente y la utilización de recursos antes y después.
  - CA-F7-30: Una ejecución fallida no destruye el escenario anterior ni el horario oficial.
  - CA-F7-31: La publicación requiere una confirmación explícita y una validación final.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-05] Ampliar el control de carga laboral y las preferencias docentes
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-05 (P1 · Carga Docente)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación de reglas académicas y laborales)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `getTeacherTeachingLoad`, `HorariosLaborales`, `HorariosClase`, `checkScheduleConflict`
- **Descripción del Alcance:**
  Parametrizar de forma configurable los límites de carga laboral docente por contrato, jornada o política institucional (separando horas lectivas de actividades adicionales), e integrar el cálculo dinámico y el registro de preferencias autorizadas en la matriz de planificación.

  Requisitos Funcionales:
  1. Identificar y separar las reglas de carga obligatoria de las preferencias de distribución.
  2. Permitir configurar límites aplicables a cada docente según las políticas institucionales.
  3. Considerar: horas lectivas semanales, cantidad de sesiones, duración de las clases, límites diarios, períodos consecutivos, descansos mínimos, jornadas autorizadas, disponibilidad parcial, responsabilidades adicionales.
  4. Evitar que las clases recurrentes se contabilicen varias veces en el cálculo semanal.
  5. Diferenciar las horas lectivas de las actividades adicionales cuando la institución las contabilice por separado.
  6. Mostrar la carga total, el límite aplicable y la distribución por día.
  7. Identificar las asignaciones que provocan un exceso de carga.
  8. Permitir registrar preferencias de horario cuando estén autorizadas y sean compatibles con las reglas obligatorias.
  9. Actualizar los cálculos después de modificar una asignación.
  10. Conservar el historial de las reglas aplicadas cuando sea necesario explicar una planificación anterior.
- **Criterios de Aceptación:**
  - CA-F7-32: Los límites se aplican según la configuración efectiva y no mediante un valor global arbitrario.
  - CA-F7-33: Una modificación de horario actualiza la carga del docente afectado.
  - CA-F7-34: Las clases recurrentes se contabilizan de acuerdo con su frecuencia real.
  - CA-F7-35: Los períodos libres no se contabilizan como horas lectivas.
  - CA-F7-36: El sistema identifica excesos de carga y explica qué asignaciones los producen.
  - CA-F7-37: Las preferencias docentes no permiten incumplir restricciones obligatorias.
  - CA-F7-38: Si no existe una política definida para una regla, el sistema no inventa un límite institucional.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-06] Ampliar la gestión de disponibilidad, equipamiento y capacidad de espacios
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-06 (P1 · Gestión de Espacios)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación de recursos compartidos)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `SedesAulas`, `getClassroomResources`, `saveClassroomResource`, `RecursosReutilizables`, `checkScheduleConflict`
- **Descripción del Alcance:**
  Ampliación de la gestión de aulas y espacios físicos para incluir requerimientos de equipamiento específico, períodos temporales de mantenimiento e indisponibilidad, y comparación entre la capacidad real del espacio y la matrícula efectiva de la sección.

  Requisitos Funcionales:
  1. Permitir registrar las características de cada espacio relevantes para la planificación.
  2. Representar la capacidad máxima y los requisitos de equipamiento cuando sean aplicables.
  3. Identificar los recursos compartidos que pueden utilizarse simultáneamente y aquellos que requieren exclusividad.
  4. Registrar intervalos de indisponibilidad por mantenimiento, reparación u otras causas.
  5. Evitar nuevas asignaciones dentro de intervalos de indisponibilidad.
  6. Detectar las clases futuras afectadas cuando un aula o recurso deje de estar disponible.
  7. Permitir consultar la ocupación por día, semana, período académico y recurso.
  8. Permitir identificar espacios alternativos que satisfagan las restricciones de una actividad.
  9. Distinguir entre espacios activos, temporalmente indisponibles e inactivos.
  10. Evitar que la desactivación de un recurso elimine su historial de utilización.
  11. Integrar la disponibilidad de los recursos con la validación de horarios.
  12. Evitar que la capacidad de un aula se confunda con la matrícula efectiva de una sección.
- **Criterios de Aceptación:**
  - CA-F7-39: Un aula indisponible no puede asignarse a una nueva actividad dentro del intervalo restringido.
  - CA-F7-40: Una actividad que requiere equipamiento específico no se asigna a un espacio incompatible.
  - CA-F7-41: Una restricción nueva identifica las asignaciones futuras afectadas.
  - CA-F7-42: El sistema permite consultar las reservas existentes y sus intervalos.
  - CA-F7-43: La desactivación de un aula no elimina las referencias históricas.
  - CA-F7-44: Las reglas de capacidad solo se aplican cuando existe información suficiente y una política definida.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-07] Fortalecer la programación de evaluaciones y la prevención de sobrecargas
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-07 (P1 · Programación de Evaluaciones)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación de planificación evaluativa)
- **Archivos Involucrados:**
  - `backend/exam-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `CalendarioAcademico`, `checkScheduleConflict`, `createCalendarEvent`, `Examenes`
- **Descripción del Alcance:**
  Establecer reglas configurables para la programación de evaluaciones (exámenes parciales, recuperaciones) que controlen la sobrecarga diaria de exámenes por sección, días no lectivos, disponibilidad de aulas y la simulación pre-confirmación de reprogramaciones.

  Requisitos Funcionales:
  1. Permitir configurar las restricciones institucionales aplicables a las evaluaciones.
  2. Comprobar las coincidencias de evaluaciones para una misma sección o grupo.
  3. Detectar conflictos de docentes, aulas y recursos.
  4. Permitir definir límites de evaluaciones por día o intervalo, si la institución los establece.
  5. Permitir definir períodos de separación entre evaluaciones cuando corresponda.
  6. Considerar las fechas de vacaciones, suspensiones y días no lectivos.
  7. Diferenciar exámenes ordinarios, recuperaciones y otras actividades evaluativas.
  8. Permitir simular cambios de fecha antes de confirmarlos.
  9. Identificar a los estudiantes o grupos afectados cuando exista información suficiente.
  10. Conservar los resultados y calificaciones históricos al modificar la programación.
  11. Propagar los cambios a los calendarios y vistas pertinentes.
  12. Evitar que las reglas nuevas contradigan las configuraciones académicas existentes.
- **Criterios de Aceptación:**
  - CA-F7-45: Las evaluaciones incompatibles se identifican antes de su confirmación.
  - CA-F7-46: Los límites diarios se aplican únicamente cuando están configurados.
  - CA-F7-47: Una reprogramación actualiza la fecha efectiva sin duplicar la evaluación.
  - CA-F7-48: Las calificaciones y los registros históricos permanecen vinculados a la evaluación correcta.
  - CA-F7-49: Los días no lectivos se respetan conforme a las reglas institucionales.
  - CA-F7-50: Los conflictos resultantes de una reprogramación se muestran antes de confirmar los cambios.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-08] Ampliar las excepciones del calendario y la gestión de sesiones
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-08 (P1 · Excepciones del Calendario)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación funcional del calendario académico)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `CalendarioAcademico`, `getAcademicCalendar`, `createCalendarEvent`, `HorariosClase`
- **Descripción del Alcance:**
  Implementar el control de excepciones para sesiones individuales dentro de series de horarios recurrentes, permitiendo cancelaciones o reprogramaciones puntuales sin alterar la serie completa ni duplicar eventos en el calendario.

  Requisitos Funcionales:
  1. Diferenciar eventos institucionales, eventos académicos, sesiones de clase y excepciones de una sesión.
  2. Permitir cancelar o reprogramar una sesión sin alterar las demás sesiones recurrentes.
  3. Permitir modificar una serie completa cuando el usuario lo seleccione expresamente.
  4. Identificar las sesiones afectadas por vacaciones, suspensiones y cambios del calendario.
  5. Diferenciar un día no lectivo de un día en el que una actividad concreta ha sido cancelada.
  6. Registrar las reprogramaciones y mantener la referencia a la sesión original.
  7. Evitar duplicaciones al recalcular las sesiones recurrentes.
  8. Permitir consultar las sesiones originales y sus excepciones.
  9. Actualizar la disponibilidad de aulas y docentes cuando se cancele o reprograma una sesión.
  10. Conservar los registros de asistencia y evaluación asociados a sesiones pasadas.
- **Criterios de Aceptación:**
  - CA-F7-51: Cambiar una sesión individual no altera las demás sesiones recurrentes.
  - CA-F7-52: Cambiar una serie afecta únicamente las sesiones incluidas en la operación confirmada.
  - CA-F7-53: Cancelar una sesión libera los recursos correspondientes.
  - CA-F7-54: Las sesiones pasadas conservan sus registros históricos.
  - CA-F7-55: Una excepción no produce dos sesiones activas para el mismo evento.
  - CA-F7-56: Los calendarios muestran la fecha efectiva y permiten identificar una reprogramación.
- **Estado:** [X] Completado

---

### [ ] [TAREA-F7-IMP-09] Desarrollar versiones de horarios, comparación y restauración controlada
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-09 (P2 · Control de Versiones de Horario)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Nueva capacidad de control de cambios)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `HorariosClase`, `publishClassSchedules`, `HistorialCambiosEntidad`, `F7-IMP-01`, `F7-IMP-08`
- **Descripción del Alcance:**
  Implementar el control de versiones de la matriz de horarios publicados con herramientas de comparación visual (diff), guardado de borradores no publicados y restauración controlada con re-validación de conflictos.

  Requisitos Funcionales:
  1. Registrar las versiones relevantes de un horario publicado.
  2. Identificar quién realizó cada cambio y cuándo.
  3. Mostrar las diferencias entre dos versiones.
  4. Identificar asignaciones nuevas, modificadas, canceladas y restauradas.
  5. Conservar el motivo del cambio cuando sea requerido por el flujo.
  6. Permitir guardar borradores sin alterar la versión publicada.
  7. Permitir comparar el borrador con el horario vigente.
  8. Permitir restaurar una versión anterior mediante una nueva operación controlada.
  9. Volver a validar los conflictos antes de restaurar o publicar.
  10. Conservar las versiones anteriores como historial.
  11. Registrar qué cambios se aplicaron al restaurar una versión.
  12. Evitar que la restauración elimine información posterior que no forme parte de la operación.
- **Criterios de Aceptación:**
  - CA-F7-57: Es posible comparar dos versiones e identificar las diferencias relevantes.
  - CA-F7-58: Un borrador no modifica el horario publicado.
  - CA-F7-59: Una restauración requiere autorización y validación.
  - CA-F7-60: Las versiones históricas permanecen consultables.
  - CA-F7-61: Una restauración no elimina silenciosamente cambios posteriores ajenos a ella.
  - CA-F7-62: Las diferencias y los resultados de la operación quedan registrados.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-10] Fortalecer las notificaciones y la trazabilidad de cambios académicos
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-10 (P1 · Notificaciones de Horarios)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación de notificaciones e integración)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `js/teacher.js`
  - `js/secretary.js`
- **Dependencias Expuestas:** `sendMultiChannelNotification`, `HistorialCambiosEntidad`, `BitacoraNotificaciones`
- **Descripción del Alcance:**
  Estandarizar las notificaciones automáticas por cambios de horario, docente o aula con claves de deduplicación, registro de estado de entrega (preparado, enviado, entregado, fallido) y aislamiento frente a fallos de comunicación.

  Requisitos Funcionales:
  1. Identificar los destinatarios afectados por cada cambio.
  2. Diferenciar las notificaciones dirigidas a docentes, estudiantes, familias y responsables institucionales.
  3. Incorporar los cambios de fecha, hora, aula, docente, cancelación y reprogramación.
  4. Incluir la información anterior y la nueva cuando corresponda.
  5. Permitir consultar el historial de notificaciones asociadas a una actividad.
  6. Diferenciar los estados de preparado, enviado, entregado, fallido y leído, únicamente cuando el canal permita comprobarlos.
  7. Aplicar claves de deduplicación coherentes con el evento y el destinatario.
  8. Permitir reintentar notificaciones fallidas sin repetir innecesariamente las que ya se entregaron.
  9. Aislar los errores de comunicación del resultado de la operación académica.
  10. Evitar que las notificaciones revelen datos que el destinatario no está autorizado a consultar.
  11. Registrar los errores que requieran intervención.
  12. Permitir configurar los canales disponibles y las preferencias compatibles con las políticas institucionales.
- **Criterios de Aceptación:**
  - CA-F7-63: Cada cambio confirmado genera las notificaciones que correspondan según los destinatarios y las reglas configuradas.
  - CA-F7-64: Un fallo de comunicación no revierte una modificación académica confirmada.
  - CA-F7-65: Los reintentos no duplican injustificadamente los avisos.
  - CA-F7-66: El historial permite identificar el evento, los destinatarios y el resultado del envío.
  - CA-F7-67: Los estados de entrega no se marcan como confirmados sin evidencia del canal.
  - CA-F7-68: Los destinatarios no reciben información ajena a sus permisos.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-11] Fortalecer la coherencia y actualización de los portales relacionados
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-11 (P1 · Integración Multi-Portal)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación de integración multi-módulo)
- **Archivos Involucrados:**
  - `js/teacher.js`
  - `js/student.js`
  - `js/secretary.js`
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** `getClassSchedules`, `getStudentSchedule`, `fetchAndRenderStudentSchedule`
- **Descripción del Alcance:**
  Garantizar la sincronización coherente y en tiempo real de los horarios entre el backend y los portales de Docentes, Estudiantes y Familias, previniendo visualización de datos en caché obsoletos o desalineados tras una modificación o cancelación.

  Requisitos Funcionales:
  1. Identificar la fuente de verdad de las asignaciones y las reglas de actualización de cada portal.
  2. Definir qué operaciones requieren volver a consultar los datos y cuáles pueden actualizar una vista de manera incremental.
  3. Evitar que los horarios cancelados o modificados permanezcan visibles como si siguieran vigentes.
  4. Diferenciar los datos confirmados de la información temporal o pendiente de sincronización.
  5. Mostrar mensajes claros cuando no sea posible recuperar el horario actualizado.
  6. Evitar que una respuesta tardía sobrescriba datos más recientes.
  7. Garantizar que los filtros por usuario, matrícula, sección y período se apliquen correctamente.
  8. Verificar que los cambios de docente o aula se reflejen en todas las vistas pertinentes.
  9. Mantener los registros históricos de asistencia y evaluación asociados a sus sesiones originales.
  10. Evitar consultas duplicadas que degraden el rendimiento sin aportar información adicional.
  11. Aplicar las restricciones de acceso en las consultas y servicios correspondientes.
  12. Proporcionar una forma de actualizar los datos cuando una vista detecte que su información está desactualizada.
- **Criterios de Aceptación:**
  - CA-F7-69: Un cambio confirmado se refleja en las vistas pertinentes después de la actualización prevista.
  - CA-F7-70: Los errores de comunicación no se presentan como una actualización exitosa.
  - CA-F7-71: Los datos obsoletos no sobrescriben silenciosamente información más reciente.
  - CA-F7-72: Cada usuario consulta únicamente los horarios correspondientes a sus permisos y relaciones académicas.
  - CA-F7-73: Las cancelaciones no aparecen como asignaciones vigentes.
  - CA-F7-74: Las modificaciones de horario no trasladan ni eliminan registros históricos de asistencia o evaluación.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-12] Ampliar los reportes de carga docente, ocupación y calidad de planificación
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-12 (P2 · Analítica de Horarios)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Ampliación de análisis y reportes)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `getTeachingHoursSummary`, `getCurricularAnalyticsReport`, `getTeacherTeachingLoad`
- **Descripción del Alcance:**
  Crear indicadores analíticos y reportes ejecutivos sobre la ocupación porcentual de aulas/laboratorios, distribución de carga laboral docente por período y detección de horas huecas o conflictos de calidad de planificación.

  Requisitos Funcionales:
  1. Incorporar reportes de carga docente por día, semana, período y año lectivo.
  2. Permitir comparar la carga con los límites aplicables a cada docente.
  3. Mostrar la ocupación de aulas y recursos por intervalo.
  4. Identificar los períodos de alta y baja utilización.
  5. Mostrar los conflictos pendientes y las asignaciones que requieren revisión.
  6. Resumir las evaluaciones y actividades programadas por sección y período.
  7. Permitir filtrar por sede, jornada, grado, sección, docente, aula y período, según corresponda.
  8. Diferenciar las asignaciones activas, canceladas y pendientes de publicación.
  9. Mostrar la fecha de actualización de los datos cuando sea relevante.
  10. Permitir exportar los reportes en los formatos admitidos por la plataforma.
  11. Restringir los datos sensibles según el rol.
  12. Evitar que los registros históricos se mezclen con la planificación vigente.
- **Criterios de Aceptación:**
  - CA-F7-75: Los totales de carga coinciden con las asignaciones incluidas en el período consultado.
  - CA-F7-76: Las actividades canceladas se contabilizan conforme a la definición de cada indicador.
  - CA-F7-77: La ocupación de recursos se calcula a partir de intervalos efectivos.
  - CA-F7-78: Los filtros combinados producen resultados coherentes.
  - CA-F7-79: Los reportes no incluyen datos fuera del ámbito autorizado.
  - CA-F7-80: Las exportaciones coinciden con los resultados presentados en pantalla.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-13] Incorporar importación, exportación y validación masiva de horarios
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-13 (P2 · Intercambio Masivo de Horarios)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Nueva herramienta de administración académica)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `createClassSchedule`, `checkScheduleConflict`, `F7-IMP-01`, `F7-IMP-02`
- **Descripción del Alcance:**
  Desarrollar la herramienta de importación/exportación masiva de horarios en formato estructurado (CSV/JSON), con fase previa de previsualización, validación atómica de conflictos y reporte de filas con error.

  Requisitos Funcionales:
  1. Permitir exportar horarios con sus relaciones académicas y estados pertinentes.
  2. Permitir importar datos desde un formato estructurado admitido por la plataforma.
  3. Validar la estructura y los campos obligatorios antes de procesar el archivo.
  4. Comprobar la existencia de los grados, secciones, asignaturas, docentes, aulas y períodos referenciados.
  5. Identificar duplicados y asignaciones que ya existan.
  6. Detectar conflictos antes de aplicar los registros importados.
  7. Presentar un resumen de registros válidos, advertencias, errores y duplicados.
  8. Permitir revisar el resultado antes de confirmar la importación.
  9. Diferenciar las operaciones de creación, actualización y omisión.
  10. Evitar que una importación parcial deje registros relacionados en un estado inconsistente.
  11. Registrar el resultado de la operación.
  12. Aplicar los permisos correspondientes a la importación y exportación.
- **Criterios de Aceptación:**
  - CA-F7-81: Un archivo inválido se rechaza con errores identificables.
  - CA-F7-82: Los registros conflictivos se identifican antes de confirmar la importación.
  - CA-F7-83: La previsualización no modifica los horarios oficiales.
  - CA-F7-84: Los duplicados se gestionan según la operación seleccionada.
  - CA-F7-85: Una importación fallida no deja datos parcialmente aplicados sin control.
  - CA-F7-86: La exportación puede volver a importarse sin perder los datos esenciales, dentro del alcance del formato definido.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-14] Fortalecer la publicación y el control de cambios masivos
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-14 (P1 · Flujo de Publicación)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación del flujo de publicación)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `publishClassSchedules`, `checkScheduleConflict`, `HistorialCambiosEntidad`
- **Descripción del Alcance:**
  Enriquecer la función `publishClassSchedules` para incluir una etapa de revisión de impacto masivo, re-validación de conflictos en el conjunto completo de borradores y generación ordenada de notificaciones post-publicación.

  Requisitos Funcionales:
  1. Diferenciar claramente los borradores de los horarios publicados.
  2. Permitir revisar todas las modificaciones antes de publicar.
  3. Mostrar las asignaciones nuevas, modificadas y canceladas.
  4. Detectar conflictos y restricciones incumplidas en el conjunto que se pretende publicar.
  5. Identificar las clases, docentes, grupos y recursos afectados.
  6. Solicitar confirmación cuando la publicación altere horarios vigentes.
  7. Volver a validar los datos antes de confirmar la publicación.
  8. Evitar que una publicación parcial se presente como completada.
  9. Registrar quién publicó los cambios y cuándo.
  10. Generar las notificaciones pertinentes después de confirmar la publicación.
  11. Permitir consultar la versión publicada y su historial.
  12. Evitar que los borradores de otros usuarios se publiquen accidentalmente.
- **Criterios de Aceptación:**
  - CA-F7-87: Un borrador no altera el horario visible como vigente.
  - CA-F7-88: La publicación identifica los cambios y sus consecuencias.
  - CA-F7-89: Los conflictos obligatorios impiden publicar.
  - CA-F7-90: La confirmación publica únicamente los cambios incluidos en la operación.
  - CA-F7-91: Si la publicación falla, el sistema identifica el estado efectivo y permite completar o resolver la operación sin duplicaciones.
  - CA-F7-92: Las notificaciones se generan a partir de los cambios realmente publicados.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-15] Incorporar control de concurrencia y protección de operaciones críticas
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-15 (P1 · Concurrencia en Horarios)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Fortalecimiento de integridad y consistencia)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** `LockService`, `createClassSchedule`, `publishClassSchedules`, `saveClassroomResource`
- **Descripción del Alcance:**
  Proteger las operaciones de creación, edición y publicación de horarios mediante cerrojos de concurrencia de Apps Script (`LockService`) y timestamps de versionado para evitar carreras entre escrituras simultáneas sobre el mismo espacio o docente.

  Requisitos Funcionales:
  1. Identificar las operaciones críticas que deben protegerse frente a cambios concurrentes.
  2. Detectar cuando una asignación haya cambiado desde que un usuario la consultó o comenzó a editarla.
  3. Evitar que una modificación basada en datos obsoletos sobrescriba silenciosamente cambios recientes.
  4. Volver a comprobar la disponibilidad de docentes, aulas y recursos antes de confirmar una asignación.
  5. Aplicar los mecanismos de exclusión o control de versiones adecuados al almacenamiento existente.
  6. Evitar bloqueos prolongados que impidan operar a otros usuarios.
  7. Gestionar los errores de concurrencia con mensajes que permitan recargar y reintentar.
  8. Mantener la integridad de las operaciones que afecten a varios registros relacionados.
  9. Diferenciar un conflicto de planificación de un conflicto técnico de actualización.
  10. Registrar los fallos que requieran investigación.
- **Criterios de Aceptación:**
  - CA-F7-93: Dos usuarios no pueden confirmar asignaciones incompatibles por una carrera entre validación y escritura.
  - CA-F7-94: Una edición basada en datos obsoletos se rechaza o requiere reconciliación explícita.
  - CA-F7-95: Los cambios concurrentes no sobrescriben silenciosamente información confirmada por otro usuario.
  - CA-F7-96: Los errores permiten identificar el registro afectado.
  - CA-F7-97: Las operaciones fallidas no dejan reservas o asignaciones parciales.
  - CA-F7-98: Las pruebas de concurrencia demuestran que se mantienen las restricciones obligatorias.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-16] Ampliar la gestión de sustituciones y la reasignación de clases afectadas
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-16 (P1 · Sustituciones Complejas)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación de gestión docente)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `createTeacherSubstitution`, `AsignacionesDocentes`, `checkScheduleConflict`
- **Descripción del Alcance:**
  Ampliación del módulo de sustituciones docentes para gestionar licencias prolongadas con reasignación de múltiples bloques horarios, verificación automática de carga del sustituto y caducidad automática de la sustitución al vencer su período.

  Requisitos Funcionales:
  1. Permitir identificar el intervalo exacto de la sustitución.
  2. Localizar las clases y actividades afectadas por la ausencia.
  3. Comprobar la disponibilidad del sustituto en cada intervalo.
  4. Validar su compatibilidad con las asignaturas, grupos y requisitos correspondientes.
  5. Detectar conflictos de carga laboral, horario y aula.
  6. Permitir gestionar varias sustituciones relacionadas.
  7. Conservar la asignación del docente titular.
  8. Distinguir entre sustituciones temporales y cambios permanentes.
  9. Registrar quién autorizó la sustitución y su período de vigencia.
  10. Propagar los cambios a las vistas y notificaciones pertinentes.
  11. Evitar que una sustitución temporal modifique las clases posteriores al período autorizado.
  12. Permitir consultar el historial de sustituciones.
- **Criterios de Aceptación:**
  - CA-F7-99: Una sustitución se aplica únicamente durante el intervalo autorizado.
  - CA-F7-100: El docente titular conserva su asignación histórica.
  - CA-F7-101: El sustituto no recibe clases incompatibles.
  - CA-F7-102: Los conflictos pendientes se identifican antes de confirmar.
  - CA-F7-103: Las vistas de los usuarios reflejan el responsable efectivo.
  - CA-F7-104: Las notificaciones se envían a los destinatarios correspondientes.
  - CA-F7-105: La finalización de la sustitución no altera indebidamente las asignaciones futuras.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-17] Ampliar la gestión de eventos y actividades con participantes y recursos
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-17 (P2 · Eventos e Infraestructura)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Ampliación del calendario institucional)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `CalendarioAcademico`, `getAcademicCalendar`, `createCalendarEvent`, `SedesAulas`
- **Descripción del Alcance:**
  Desarrollar un modelo unificado para la reserva de espacios y recursos asignados a eventos institucionales o extracurriculares (reuniones docentes, actos, deportes) con validación de reservas y control de visibilidad por rol.

  Requisitos Funcionales:
  1. Permitir asociar una actividad con su responsable y ámbito académico.
  2. Identificar a los participantes o grupos afectados cuando corresponda.
  3. Asociar aulas, equipos y recursos compartidos.
  4. Validar las reservas y disponibilidades.
  5. Permitir registrar actividades recurrentes cuando sea necesario.
  6. Gestionar cancelaciones y cambios de fecha.
  7. Diferenciar los eventos informativos de las actividades que reservan recursos.
  8. Permitir definir la visibilidad del evento según los permisos y destinatarios.
  9. Propagar los cambios al calendario correspondiente.
  10. Evitar que una actividad sin requisitos de aula o docente quede blocked por campos no aplicables.
  11. Conservar el historial de modificaciones.
  12. Integrar las notificaciones con el alcance real de la actividad.
- **Criterios de Aceptación:**
  - CA-F7-106: Una actividad con recursos reservados respeta las restricciones de disponibilidad.
  - CA-F7-107: Una actividad informativa puede crearse sin asignar recursos que no necesita.
  - CA-F7-108: Los cambios se reflejan en los calendarios pertinentes.
  - CA-F7-109: La cancelación libera las reservas correspondientes.
  - CA-F7-110: Los participantes solo consultan la información que les corresponde.
  - CA-F7-111: El historial permite identificar las modificaciones realizadas.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-18] Ampliar la gestión de restricciones académicas y dependencias entre asignaturas
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-18 (P2 · Dependencias Curriculares)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Nueva capacidad de planificación académica avanzada)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `CatalogoAsignaturas`, `MallaCurricular`, `F7-IMP-01`, `F7-IMP-04`
- **Descripción del Alcance:**
  Implementar la configuración de restricciones de co-requisito horario entre asignaturas (clases simultáneas requeridas, bloques estrictamente consecutivos o dictados secuenciales obligatorios) e integrarlas en el motor de validación.

  Requisitos Funcionales:
  1. Permitir representar las relaciones académicas que afecten a la planificación.
  2. Distinguir entre:
     - Actividades que deben coincidir en horario.
     - Actividades que no pueden coincidir.
     - Actividades que requieren una secuencia temporal.
     - Actividades que necesitan compartir recursos.
     - Actividades que deben permanecer separadas.
  3. Permitir asociar las restricciones con asignaturas, secciones o tipos de actividad, según corresponda.
  4. Validar que las relaciones no sean contradictorias.
  5. Considerar las dependencias al generar o reorganizar horarios.
  6. Explicar qué restricción impide una asignación.
  7. Permitir desactivar o modificar una relación con los permisos adecuados.
  8. Conservar el historial de cambios en las reglas.
  9. Evitar que las dependencias se apliquen a períodos o secciones ajenos a su ámbito.
  10. Permitir comprobar las consecuencias de una modificación antes de aplicarla.
- **Criterios de Aceptación:**
  - CA-F7-112: Una relación configurada se aplica únicamente a las asignaciones comprendidas en su ámbito.
  - CA-F7-113: Las relaciones obligatorias se respetan al validar y publicar horarios.
  - CA-F7-114: Las reglas contradictorias se identifican antes de generar un escenario.
  - CA-F7-115: El sistema explica las dependencias que impiden una asignación.
  - CA-F7-116: Los cambios en las reglas no alteran silenciosamente los registros históricos.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-19] Ampliar el control de capacidad y distribución de estudiantes por sección
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-19 (P2 · Capacidad de Sección)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Ampliación de planificación y administración de secciones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `Matriculas`, `OfertaAcademica`, `SedesAulas`, `checkScheduleConflict`
- **Descripción del Alcance:**
  Integrar las validaciones de capacidad de aula con el conteo dinámico de matrícula activa por sección, generando alertas preventivas cuando la inscripción supere el cupo físico del espacio asignado.

  Requisitos Funcionales:
  1. Identificar la matrícula efectiva de cada sección para el período correspondiente.
  2. Permitir configurar la capacidad máxima de una sección cuando sea aplicable.
  3. Comparar la matrícula con la capacidad del aula asignada.
  4. Diferenciar la capacidad física del espacio del límite administrativo de la sección.
  5. Identificar secciones que excedan alguno de los límites aplicables.
  6. Detectar cuándo una modificación de matrícula afecta a una asignación existente.
  7. Permitir consultar alternativas de aula compatibles.
  8. Conservar la relación entre estudiantes, sección y período académico.
  9. Evitar que una sección inactiva o de otro período se utilice en una nueva planificación.
  10. Mostrar advertencias cuando falten datos necesarios para validar la capacidad.
- **Criterios de Aceptación:**
  - CA-F7-117: Una sección no supera silenciosamente un límite obligatorio configurado.
  - CA-F7-118: Un aula con capacidad insuficiente se identifica antes de publicar el horario.
  - CA-F7-119: Los cambios de matrícula permiten detectar asignaciones que ya no cumplen las restricciones.
  - CA-F7-120: Los límites se aplican según las reglas institucionales efectivas.
  - CA-F7-121: La falta de datos se comunica sin presentar una validación incompleta como satisfactoria.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-20] Optimizar el rendimiento y la escalabilidad de las consultas de planificación
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-20 (P2 · Rendimiento)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Optimización técnica y funcional)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `js/teacher.js`
  - `js/student.js`
- **Dependencias Expuestas:** `getClassSchedules`, `getStudentSchedule`, `getClassroomResources`
- **Descripción del Alcance:**
  Optimizar los algoritmos de lectura de horarios, agregando filtrado en el origen por año lectivo y docente, e implementando estrategias de almacenamiento en caché invalidables ante escrituras para reducir latencias en Google Apps Script.

  Requisitos Funcionales:
  1. Identificar las consultas más frecuentes y costosas de la planificación.
  2. Evitar lecturas repetitivas de los mismos conjuntos de datos cuando no sean necesarias.
  3. Aplicar filtros en el origen de los datos siempre que resulte viable.
  4. Limitar los resultados de consultas extensas mediante paginación o mecanismos equivalentes cuando corresponda.
  5. Evitar cargar todos los períodos académicos y todos los horarios si el usuario solo necesita un intervalo reducido.
  6. Mantener la coherencia entre la caché y los datos confirmados.
  7. Invalidar o actualizar la información almacenada cuando se produzcan cambios relevantes.
  8. Evitar que las consultas analíticas bloqueen operaciones críticas de escritura.
  9. Proporcionar indicadores de carga y mensajes adecuados cuando una consulta tarde más de lo esperado.
  10. Identificar errores de tiempo de ejecución, límites del servicio y operaciones que excedan los recursos disponibles.
- **Criterios de Aceptación:**
  - CA-F7-122: Las consultas de una semana no necesitan cargar innecesariamente todo el historial académico.
  - CA-F7-123: Los filtros reducen el conjunto de datos procesados cuando corresponda.
  - CA-F7-124: Una modificación confirmada no deja la caché mostrando indefinidamente datos obsoletos.
  - CA-F7-125: La optimización no cambia el significado de los resultados.
  - CA-F7-126: Los informes y las vistas conservan la coherencia con los datos de origen.
  - CA-F7-127: Las pruebas con volúmenes representativos permiten medir el rendimiento antes y después.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-21] Ampliar la auditoría operativa y la trazabilidad de la planificación
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-21 (P2 · Trazabilidad de Planificación)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Ampliación de observabilidad y control administrativo)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `HistorialCambiosEntidad`, `BitacoraTraceability`, `getAcademicAuditLogs`
- **Descripción del Alcance:**
  Crear una vista de auditoría consolidada de planificación que permita filtrar y revisar todas las operaciones de creación, edición, borrador, publicación y eliminación de horarios con detalles de usuario actor, timestamp y payload de cambios.

  Requisitos Funcionales:
  1. Registrar las operaciones relevantes de creación, modificación, cancelación, publicación y restauración.
  2. Identificar el usuario responsable, la fecha, la operación y los registros afectados.
  3. Diferenciar las operaciones exitosas de las rechazadas o fallidas.
  4. Registrar los conflictos detectados y su resolución.
  5. Identificar las notificaciones fallidas que requieran atención.
  6. Permitir filtrar por usuario, período, recurso, tipo de operación y estado.
  7. Restringir la consulta de la bitácora a los roles autorizados.
  8. Evitar que los usuarios sin permiso puedan alterar o borrar los registros.
  9. Permitir correlacionar una operación con los errores o notificaciones relacionados.
  10. Facilitar la identificación de problemas repetidos sin registrar información sensible innecesaria.
- **Criterios de Aceptación:**
  - CA-F7-128: Una operación relevante puede rastrearse desde su solicitud hasta su resultado.
  - CA-F7-129: Los errores permiten identificar el componente y el registro afectados.
  - CA-F7-130: Los usuarios no autorizados no pueden consultar ni alterar la bitácora.
  - CA-F7-131: Los registros permiten diferenciar un conflicto de planificación de un fallo técnico.
  - CA-F7-132: Las consultas de seguimiento no modifican los datos auditados.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-22] Ampliar la planificación mediante plantillas y reutilización controlada de horarios
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-22 (P2 · Plantillas de Horario)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Nueva herramienta de productividad)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `copyClassSchedules`, `HorariosClase`, `F7-IMP-01`, `F7-IMP-02`, `F7-IMP-09`
- **Descripción del Alcance:**
  Desarrollar la capacidad de guardar la estructura de distribución horaria semanal de un período o sección como plantilla reutilizable, permitiendo clonarla hacia otro período con previsualización y re-validación de aulas y docentes.

  Requisitos Funcionales:
  1. Permitir guardar una estructura de horario como plantilla cuando corresponda.
  2. Permitir seleccionar qué elementos se reutilizarán: distribución semanal, períodos horarios, asignaturas, estructura de secciones, preferencias de planificación.
  3. Evitar copiar automáticamente docentes, aulas o asignaciones que deban volver a validarse para el nuevo período.
  4. Identificar las referencias que no existan en el período de destino.
  5. Validar la plantilla antes de aplicarla.
  6. Permitir previsualizar las asignaciones resultantes.
  7. Detectar conflictos con los recursos y docentes del período de destino.
  8. Permitir ajustar la plantilla antes de confirmar.
  9. Registrar el origen de la plantilla y la operación realizada.
  10. Evitar modificar la plantilla original cuando se aplica a otro período.
- **Criterios de Aceptación:**
  - CA-F7-133: Aplicar una plantilla no modifica su versión original.
  - CA-F7-134: Las referencias inexistentes se identifican antes de confirmar.
  - CA-F7-135: Las asignaciones resultantes se validan contra la disponibilidad del período de destino.
  - CA-F7-136: El sistema no publica automáticamente un horario generado sin revisión.
  - CA-F7-137: Los cambios aplicados quedan registrados y pueden identificarse posteriormente.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-23] Ampliar las herramientas de impresión y distribución de horarios
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-23 (P3 · Exportación e Impresión)
- **Prioridad:** P3
- **Severidad/Clasificación:** Bajo (Mejora de accesibilidad y distribución de información)
- **Archivos Involucrados:**
  - `teacher-dashboard.html`
  - `student-dashboard.html`
  - `js/teacher.js`
  - `js/student.js`
- **Dependencias Expuestas:** `getClassSchedules`, `getStudentSchedule`, `F7-IMP-02`, `F7-IMP-12`
- **Descripción del Alcance:**
  Incorporar vistas de impresión formateadas CSS `@media print` y exportación limpia para horarios de docentes, secciones y aulas con membrete institucional e identificación explícita de versión publicada o borrador.

  Requisitos Funcionales:
  1. Permitir preparar horarios imprimibles por docente, sección, aula y período.
  2. Permitir seleccionar el intervalo de fechas y los filtros pertinentes.
  3. Mostrar la información necesaria para identificar cada clase.
  4. Diferenciar los horarios vigentes de los borradores.
  5. Evitar incluir información que el usuario no esté autorizado a consultar.
  6. Mantener una distribución legible en páginas impresas.
  7. Permitir exportar los datos en los formatos admitidos.
  8. Mostrar la fecha de generación y el período al que corresponde el documento.
  9. Identificar si el horario exportado corresponde a una versión publicada.
  10. Evitar que los documentos distribuidos presenten cambios pendientes como si fueran oficiales.
- **Criterios de Aceptación:**
  - CA-F7-138: El documento exportado coincide con los filtros y el horario seleccionado.
  - CA-F7-139: La información se presenta de manera legible.
  - CA-F7-140: Los datos restringidos no se incluyen en la exportación.
  - CA-F7-141: El documento permite identificar su período y estado.
  - CA-F7-142: Las modificaciones posteriores no alteran retroactivamente un documento ya generado.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-24] Ampliar las preferencias de calendario y la personalización de vistas
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-24 (P3 · Personalización de Calendarios)
- **Prioridad:** P3
- **Severidad/Clasificación:** Bajo (Mejora de experiencia de usuario)
- **Archivos Involucrados:**
  - `teacher-dashboard.html`
  - `student-dashboard.html`
  - `js/teacher.js`
  - `js/student.js`
- **Dependencias Expuestas:** `getAcademicCalendar`, `F7-IMP-02`, `F7-IMP-10`
- **Descripción del Alcance:**
  Incorporar controles de personalización de vista en el calendario académico unificado (alternancia de filtros por categoría de evento, leyenda explicativa por colores y adaptabilidad en pantallas móviles).

  Requisitos Funcionales:
  1. Permitir filtrar las actividades por tipo, período, asignatura, sección y estado.
  2. Permitir mostrar u ocultar categorías de eventos cuando el usuario esté autorizado.
  3. Diferenciar clases, evaluaciones, actividades institucionales y cancelaciones.
  4. Permitir consultar los detalles de cada evento desde el calendario.
  5. Facilitar la navegación entre días, semanas y períodos.
  6. Mantener filtros compatibles con el rol y el ámbito de acceso.
  7. Proporcionar una vista adecuada para dispositivos móviles.
  8. Evitar que las preferencias visuales oculten permanentemente información crítica, como cancelaciones o cambios importantes.
  9. Permitir restablecer la configuración de visualización.
  10. Actualizar la vista cuando cambien los datos de origen.
- **Criterios de Aceptación:**
  - CA-F7-143: Los filtros modifican la visualización sin alterar los datos académicos.
  - CA-F7-144: Los eventos mostrados corresponden al ámbito autorizado.
  - CA-F7-145: Las cancelaciones y cambios importantes pueden identificarse.
  - CA-F7-146: Las preferencias personales no afectan a otros usuarios.
  - CA-F7-147: La vista continúa mostrando los datos actualizados después de modificaciones confirmadas.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-F7-IMP-25] Ampliar la verificación de calidad mediante pruebas automatizadas de planificación
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-25 (P1 · Pruebas de Regresión)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Fortalecimiento de calidad y prevención de regresiones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** `runConcurrencyAndConsistencySuite`, `checkScheduleConflict`, `getTeacherTeachingLoad`
- **Descripción del Alcance:**
  Construir una batería automatizada de pruebas de regresión e integración para el módulo de planificación académica que evalúe sintéticamente la prevención de conflictos, cargas docentes, sustituciones y la concurrencia en la publicación de horarios.

  Requisitos Funcionales:
  1. Identificar las pruebas automatizadas existentes relacionadas con la Fase 7.
  2. Incorporar pruebas para: creación y actualización de horarios, conflictos docentes, conflictos de aulas, conflictos de secciones, disponibilidad laboral, carga docente, excepciones del calendario, programación de evaluaciones, sustituciones, publicación y cancelación, notificaciones y deduplicación, permisos, integración con asistencia y portales.
  3. Incluir casos límite, datos inválidos y errores de persistencia.
  4. Verificar que las operaciones fallidas no generen cambios parciales.
  5. Incorporar pruebas de concurrencia para las operaciones críticas.
  6. Comprobar las relaciones entre los datos persistidos y las vistas.
  7. Separar las pruebas unitarias, de integración y de extremo a extremo.
  8. Utilizar datos de prueba controlados y evitar modificar información real.
  9. Registrar los resultados de las ejecuciones.
  10. Permitir repetir las pruebas después de una corrección o ampliación.
- **Criterios de Aceptación:**
  - CA-F7-148: Cada requisito crítico cuenta con pruebas reproducibles.
  - CA-F7-149: Los conflictos obligatorios se detectan en los escenarios previstos.
  - CA-F7-150: Las asignaciones válidas siguen funcionando.
  - CA-F7-151: Las pruebas de permisos demuestran que las operaciones restringidas son rechazadas.
  - CA-F7-152: Los fallos no dejan datos inconsistentes.
  - CA-F7-153: Las pruebas de integración comprueban las relaciones entre los módulos implicados.
  - CA-F7-154: Los resultados permiten identificar qué pruebas se ejecutaron, cuáles fallaron y cuáles no pudieron completarse.
- **Estado:** [ ] Pendiente
