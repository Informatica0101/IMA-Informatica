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

### [TAREA-F6-011] Implementar respaldos independientes y recuperación por área
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

### [TAREA-F6-012] Establecer seguridad, aislamiento y gestión centralizada de permisos
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

### [TAREA-F6-013] Implementar despliegues versionados, migraciones y reversión controlada
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

### [TAREA-F6-014] Centralizar la configuración y las dependencias sin centralizar todos los datos
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

### [TAREA-F6-015] Validar el rendimiento, la capacidad y la recuperación de la arquitectura completa
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

### [TAREA-F6-016] Supervisar la capacidad de almacenamiento y los fallos del repositorio documental
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

### [TAREA-F6-017] Completar el flujo de gestión de documentos pendientes, vencidos y faltantes
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
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-019] Fortalecer la trazabilidad del expediente y la consulta del historial institucional
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
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-020] Mejorar la búsqueda global y la navegación operativa del expediente
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
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-021] Implementar una matriz de integridad y conciliación entre los módulos institucionales
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
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-022] Ampliar la gestión de documentos con versiones, integridad y recuperación controlada
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
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-023] Desarrollar un resumen institucional del expediente orientado a cada perfil autorizado
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
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-024] Incorporar notificaciones y seguimiento de trámites del expediente
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
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-025] Crear un mecanismo de revisión y recuperación de fusiones de expedientes
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
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-026] Incorporar informes administrativos y exportación controlada del expediente
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
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-027] Fortalecer la recuperación y verificación de copias de seguridad del expediente
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
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-028] Mejorar la accesibilidad y la eficiencia de uso del expediente en dispositivos móviles
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
- **Estado:** [ ] Pendiente
