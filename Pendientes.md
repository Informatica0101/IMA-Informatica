# REGISTRO OFICIAL DE TAREAS PENDIENTES — FASE 4
**Plataforma Integral de Gestión Educativa — New Generation Christian Academy**

---

## GRUPO PRIORIDAD P0 (CRÍTICO)

### [X] [TAREA-F4-P0-01] Unificar la autenticación y autorización de los cinco microservicios
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md - HALLAZGO-F4-P0-01)
- **Severidad/Clasificación:** Crítico · Seguridad · Backend · Arquitectura
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/exam-service/Code.gs`, `backend/task-service/Code.gs`, `js/auth.js`, `js/api.js`
- **Dependencias Expuestas:** Puntos de entrada `doPost`, `validateRolePermission`, `loginUser`, almacenamiento de sesiones, generación y validación de tokens.
- **Descripción del Alcance:**
  1. Implementar un mecanismo uniforme de autenticación que permita a los cinco microservicios identificar al usuario real que realiza cada solicitud.
  2. Centralizar la emisión y validación de credenciales de sesión utilizando firmas criptográficas HMAC-SHA256 compatibles con Google Apps Script.
  3. Los tokens firmados deben incluir: userId inmutable, sessionId único, fecha de emisión, fecha de expiración y versión/estado de la cuenta.
  4. La firma debe calcularse y verificarse exclusivamente en el servidor. El secreto debe almacenarse en propiedades protegidas (`PropertiesService.getScriptProperties()`).
  5. Los tokens deben validarse íntegramente antes de autorizar cualquier operación (firma, tiempos de vigencia y revocación).
  6. El servidor debe obtener la identidad y los privilegios de la fuente confiable en la base de datos `Usuarios`. No aceptar `authRole` ni `userId` como autoridad del cliente.
  7. Los cinco microservicios deben aplicar el mismo contrato de autenticación y autorización.
  8. Las operaciones deben fallar de forma segura si el token es inválido o expiró.
  9. Adaptar `js/auth.js` y `js/api.js` para enviar el token de forma consistente.
- **Criterios de Aceptación:**
  - [X] Los cinco microservicios rechazan solicitudes protegidas sin una credencial válida.
  - [X] Modificar authRole o rol en el cuerpo de una petición no modifica los privilegios efectivos.
  - [X] Alterar el identificador del usuario dentro de una credencial firmada invalida la firma o provoca el rechazo.
  - [X] Las credenciales expiradas, revocadas o pertenecientes a cuentas no habilitadas son rechazadas.
  - [X] Los errores de autenticación y autorización no revelan secretos, firmas, claves ni detalles internos.
  - [X] Todas las acciones protegidas de los cinco servicios pasan por el mismo control de autenticación.
- **Estado:** [X] Completada

### [X] [TAREA-F4-P0-02] Corregir las vulnerabilidades IDOR y garantizar el aislamiento de datos personales
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md - HALLAZGO-F4-P0-02)
- **Severidad/Clasificación:** Crítico · Seguridad · Protección de datos · Backend
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/exam-service/Code.gs`, `backend/task-service/Code.gs`
- **Dependencias:** TAREA-F4-P0-01.
- **Descripción del Alcance:**
  1. Revisar todos los endpoints que reciben `userId`, `studentId`, `guardianUserId`, `personaId` o IDs de recursos privados.
  2. Obtener la identidad del solicitante exclusivamente del contexto autenticado del token.
  3. Implementar autorización a nivel de objeto (ABAC).
  4. Para estudiantes, limitar el acceso exclusivamente a su propio expediente, calificaciones y notificaciones.
  5. Para padres/tutores, comprobar el vínculo institucional verificado entre el tutor autenticado y los estudiantes representados.
  6. Para docentes, limitar las operaciones a las asignaturas, secciones y estudiantes asignados en `AsignacionesDocentes`.
  7. Forzar la sobreescritura o verificación estricta de `userId` / `studentId` en el backend.
- **Criterios de Aceptación:**
  - [X] Un estudiante no puede consultar ni modificar el expediente de otro estudiante alterando un identificador.
  - [X] Un tutor no puede acceder a estudiantes con los que no mantiene una relación autorizada.
  - [X] Un docente no puede acceder a estudiantes, grupos o asignaturas ajenos a su ámbito de asignación.
  - [X] Un usuario sin privilegios financieros no puede acceder a documentos contables modificando identificadores.
  - [X] Se conserva la integridad de los historiales académicos, administrativos y contables.
- **Estado:** [X] Completada

### [X] [TAREA-F4-P0-03] Garantizar la revocación efectiva de sesiones y la actualización inmediata de privilegios
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md - HALLAZGO-F4-P0-03)
- **Severidad/Clasificación:** Crítico · Seguridad · Gestión de sesiones · Backend
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/exam-service/Code.gs`, `backend/task-service/Code.gs`, `js/auth.js`, `js/api.js`, `js/ui-common.js`
- **Dependencias:** TAREA-F4-P0-01, TAREA-F4-P0-02.
- **Descripción del Alcance:**
  1. Invalidar sesiones cuando una cuenta pase a estado Suspendida, Bloqueada o Desactivada.
  2. Aplicar los cambios de rol de inmediato purgando cachés obsoletas (`invalidateUserRoleCache`).
  3. Vincular tokens a identificadores de sesión verificables (`sessionId`).
  4. Impedir la reutilización de credenciales revocadas o expiradas en los 5 microservicios.
  5. Manejar respuestas del cliente ante revocación redirigiendo a login de forma limpia.
- **Criterios de Aceptación:**
  - [X] Una cuenta desactivada no puede ejecutar operaciones protegidas en ninguno de los cinco servicios.
  - [X] Una sesión revocada no vuelve a ser válida por reutilizar su token.
  - [X] Una reducción de privilegios impide seguir utilizando los permisos retirados.
  - [X] La expiración de sesión se gestiona correctamente tanto en el cliente como en el backend.
- **Estado:** [X] Completada

### [X] [TAREA-F4-P0-04] Registrar los intentos fallidos de autenticación y reforzar la protección contra ataques
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md - HALLAZGO-F4-P0-04)
- **Severidad/Clasificación:** Crítico · Seguridad · Auditoría · Autenticación
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `BitacoraEventos`, `BitacoraTraceability`
- **Dependencias:** TAREA-F4-P0-01.
- **Descripción del Alcance:**
  1. Registrar en `BitacoraEventos` el evento `LOGIN_FAILED` para intentos fallidos con contraseña incorrecta, cuenta inactiva o inexistente.
  2. Incluir fecha, hora, correlationId, motivo categorizado e identidad solicitada (sin contraseñas ni tokens).
  3. Registrar accesos exitosos (`LOGIN_SUCCESS`) y cierres de sesión.
  4. Aplicar límites de intentos fallidos antes de bloquear temporalmente la IP/cuenta.
  5. Asegurar respuestas genéricas que no revelen innecesariamente si el correo existe.
- **Criterios de Aceptación:**
  - [X] Las contraseñas incorrectas generan eventos LOGIN_FAILED.
  - [X] Las cuentas bloqueadas, suspendidas y desactivadas generan registros categorizados.
  - [X] Ninguna bitácora contiene contraseñas ni tokens reutilizables.
  - [X] Las respuestas de autenticación no revelan innecesariamente si una cuenta existe.
- **Estado:** [X] Completada

---

## GRUPO PRIORIDAD P1 (ALTO)

### [X] [TAREA-F4-P1-01] Implementar el motor transversal de delegaciones de seguridad y permisos temporales
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md - HALLAZGO-F4-P1-01)
- **Severidad/Clasificación:** Alto · Seguridad · Gobierno Institucional
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `js/ui-common.js`
- **Dependencias:** TAREA-F4-P0-01, TAREA-F4-P0-02, TAREA-F4-P0-03.
- **Descripción del Alcance:**
  1. Crear la estructura `DelegacionesSeguridad` en base de datos.
  2. Permitir delegar capacidades específicas entre usuarios con fecha/hora de inicio y finalización.
  3. Validar caducidad en el motor de permisos y permitir revocación anticipada.
  4. Registrar actor ejecutor real y delegante titular en las bitácoras.
- **Criterios de Aceptación:**
  - [X] Se pueden crear delegaciones con permisos y ámbitos delimitados.
  - [X] Las delegaciones expiran automáticamente en la fecha/hora programada.
  - [X] Una delegación revocada deja de autorizar operaciones posteriores.
  - [X] Las bitácoras identifican al ejecutor real, al delegante y la delegación usada.
- **Estado:** [X] Completada

### [X] [TAREA-F4-P1-02] Implementar el motor automático de retención, archivo y anonimización de datos
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md - HALLAZGO-F4-P1-02)
- **Severidad/Clasificación:** Alto · Privacidad · Protección de datos
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`
- **Dependencias:** TAREA-F4-P0-01, TAREA-F4-P0-02, TAREA-F4-P0-04.
- **Descripción del Alcance:**
  1. Crear catálogo de políticas de retención de datos por categoría.
  2. Implementar `executeDataRetentionPolicyCheck` ejecutable de forma programada para evaluar plazos vencidos.
  3. Permitir acciones de archivo, restricción de acceso, anonimización o purga autorizada.
  4. Preservar registros académicos y contables con conservación legal obligatoria.
- **Criterios de Aceptación:**
  - [X] Cada categoría de información tiene una política de retención identificable.
  - [X] Los registros sujetos a conservación obligatoria no se eliminan.
  - [X] Las operaciones de archivo, anonimización y purga quedan auditadas.
- **Estado:** [X] Completada

### [X] [TAREA-F4-P1-03] Implementar una matriz dinámica de permisos por rol, acción, módulo y ámbito
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Alto · Autorización · Administración
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/ui-common.js`, Dashboards
- **Dependencias:** TAREA-F4-P0-01, TAREA-F4-P0-02, TAREA-F4-P0-03.
- **Descripción del Alcance:**
  1. Crear un catálogo persistente de permisos por rol y módulo.
  2. Proporcionar un editor visual en la interfaz administrativa para gestionar permisos sin editar código.
  3. Guardar versiones de la matriz con auditoría de cambios.
- **Criterios de Aceptación:**
  - [X] La matriz muestra permisos efectivos por rol y módulo.
  - [X] Permite modificar reglas y propagar la actualización a los microservicios.
  - [X] Los cambios quedan auditados.
- **Estado:** [X] Completada

### [X] [TAREA-F4-P1-04] Implementar una política unificada de autorización contextual RBAC/ABAC
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Alto · Seguridad · Backend
- **Archivos Involucrados:** `backend/*/Code.gs`
- **Dependencias:** TAREA-F4-P0-01, TAREA-F4-P0-02, TAREA-F1-P1-03.
- **Descripción del Alcance:**
  1. Integrar reglas ABAC (atributos de contexto, asignaciones docentes, vínculos familiares) en `validateRolePermission`.
  2. Aplicar validaciones a consultas, creaciones, modificaciones, eliminaciones y exportaciones.
- **Criterios de Aceptación:**
  - [X] Un permiso general no concede acceso a registros ajenos al ámbito del usuario.
  - [X] Las exportaciones respetan las mismas reglas contextuales que las consultas.
- **Estado:** [X] Completada

### [ ] [TAREA-F4-P1-05] Incorporar un panel de gobierno de privacidad y gestión de derechos sobre datos
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Alto · Privacidad · Administración
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `politica-de-privacidad.html`, `js/ui-common.js`
- **Dependencias:** TAREA-F4-P0-02, TAREA-F4-P1-02, TAREA-F4-P0-04.
- **Descripción del Alcance:**
  1. Crear el módulo de solicitudes de derechos de privacidad (acceso, rectificación, exportación, eliminación).
  2. Proveer flujo de revisión para administradores y respuesta al usuario.
- **Criterios de Aceptación:**
  - [ ] Permite registrar, tramitar y responder solicitudes de derechos sobre datos personales.
  - [ ] Las solicitudes quedan auditadas con su estado.
- **Estado:** [ ] Pendiente

### [ ] [TAREA-F4-P1-06] Fortalecer la trazabilidad mediante historial de cambios y auditoría de versiones
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Alto · Auditoría · Integridad
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `BitacoraEventos`, `BitacoraTraceability`
- **Dependencias:** TAREA-F4-P0-01, TAREA-F4-P0-04.
- **Descripción del Alcance:**
  1. Registrar en las bitácoras las diferencias sanitizadas de valores anteriores y posteriores en operaciones administrativas sensibles.
  2. Permitir la reconstrucción de la línea de tiempo de cambios sobre un usuario o recurso.
- **Criterios de Aceptación:**
  - [ ] Los cambios sensibles registran valores anteriores y nuevos sanitizados.
  - [ ] Permite reconstruir la secuencia de eventos de una entidad.
- **Estado:** [ ] Pendiente

### [ ] [TAREA-F4-P1-07] Implementar gestión institucional de roles, cargos, departamentos y asignaciones
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Alto · Identidad · Backend
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`
- **Dependencias:** TAREA-F4-P0-01, TAREA-F4-P1-03, TAREA-F4-P1-04.
- **Descripción del Alcance:**
  1. Administrar de forma centralizada departamentos, cargos, jefaturas e historiales laborales/académicos.
  2. Validar integridad referencial al cambiar un usuario de departamento o cargo.
- **Criterios de Aceptación:**
  - [ ] Los cambios de cargo o departamento actualizan los permisos contextuales de inmediato.
  - [ ] Mantiene el historial de adscripciones pasadas del colaborador.
- **Estado:** [ ] Pendiente

### [ ] [TAREA-F4-P1-08] Implementar un mecanismo central de propagación y recuperación de cambios de seguridad
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Alto · Arquitectura · Consistencia
- **Archivos Involucrados:** `backend/*/Code.gs`
- **Dependencias:** TAREA-F4-P0-01, TAREA-F4-P0-03, TAREA-F4-P1-03.
- **Descripción del Alcance:**
  1. Despachar eventos de seguridad (`ACCOUNT_STATE_CHANGED`, `PERMISSIONS_CHANGED`, `SESSION_REVOKED`) a todos los microservicios.
  2. Invalidar automáticamente la caché de permisos en los 5 microservicios.
- **Criterios de Aceptación:**
  - [ ] Los eventos de cambio de seguridad purgan las cachés locales e inter-servicio.
  - [ ] Permite recuperar sincronizaciones fallidas mediante cola de reintentos.
- **Estado:** [ ] Pendiente

### [ ] [TAREA-F4-P1-09] Crear un panel de seguridad, auditoría y cumplimiento institucional
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Alto · Observabilidad · Seguridad
- **Archivos Involucrados:** `js/ui-common.js`, `dashboard-direccion.html`, `backend/user-service/Code.gs`
- **Dependencias:** TAREA-F4-P1-06, TAREA-F4-P1-08.
- **Descripción del Alcance:**
  1. Construir un tablero administrativo de seguridad para monitorear intentos fallidos, accesos revocados, delegaciones activas e indicadores de salud.
- **Criterios de Aceptación:**
  - [ ] Muestra el estado consolidado de seguridad de los 5 microservicios.
  - [ ] Permite filtrar la bitácora por fecha, usuario y tipo de evento.
- **Estado:** [ ] Pendiente

---

## GRUPO PRIORIDAD P2 (MEDIO)

### [ ] [TAREA-F4-P2-01] Eliminar la generación de identificadores de usuario basada en marcas de tiempo
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Medio · Identidad
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Dependencias:** TAREA-F4-P0-01.
- **Descripción del Alcance:**
  1. Forzar que `registerUser` obtenga su ID únicamente desde `generateInstitutionalId('Usuario', 'USR-')` con secuencias atómicas, removiendo `now.getTime()`.
- **Criterios de Aceptación:**
  - [ ] Todas las cuentas usan secuencias atómicas institucionales sin marcas de tiempo.
- **Estado:** [ ] Pendiente

### [ ] [TAREA-F4-P2-02] Implementar una gestión completa del ciclo de vida de cuentas y sesiones
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Medio · Identidad · Administración
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/auth.js`, `js/ui-common.js`
- **Dependencias:** TAREA-F4-P0-01, TAREA-F4-P0-03, TAREA-F4-P2-01.
- **Descripción del Alcance:**
  1. Definir máquina de estados para transiciones permitidas entre `Pendiente`, `InvitacionEnviada`, `Activa`, `Suspendida`, `Bloqueada`, `Desactivada`.
- **Criterios de Aceptación:**
  - [ ] Transiciones de estado validadas y auditadas.
- **Estado:** [ ] Pendiente

### [ ] [TAREA-F4-P2-03] Mejorar la experiencia administrativa de gestión de usuarios, permisos y delegaciones
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Medio · Interfaz · Usabilidad
- **Archivos Involucrados:** `js/ui-common.js`, Dashboards HTML
- **Dependencias:** TAREA-F4-P1-01, TAREA-F4-P1-03, TAREA-F4-P1-07.
- **Descripción del Alcance:**
  1. Vistas mejoradas de gestión de usuarios con filtros, visualización de permisos efectivos y delegaciones.
- **Criterios de Aceptación:**
  - [ ] Interfaz administrativa fluida con confirmaciones para acciones sensibles.
- **Estado:** [ ] Pendiente

### [ ] [TAREA-F4-P2-04] Optimizar la concurrencia y la consistencia de las operaciones de identidad
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Medio · Backend · Rendimiento
- **Archivos Involucrados:** `backend/*/Code.gs`
- **Dependencias:** TAREA-F4-P0-01, TAREA-F4-P0-03, TAREA-F4-P1-03, TAREA-F4-P1-08.
- **Descripción del Alcance:**
  1. Coordinar cierres de candados atómicos (`LockService`) en escrituras concurrentes de cuentas y delegaciones.
- **Criterios de Aceptación:**
  - [ ] Operaciones simultáneas producen resultados consistentes sin sobreescrituras accidentales.
- **Estado:** [ ] Pendiente

### [ ] [TAREA-F4-P2-05] Consolidar la documentación institucional de privacidad y tratamiento de datos
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Medio · Privacidad · Documentación
- **Archivos Involucrados:** `politica-de-privacidad.html`, `politica-de-uso.html`, `politica-financiera.html`
- **Dependencias:** TAREA-F4-P1-02, TAREA-F4-P1-05.
- **Descripción del Alcance:**
  1. Actualizar páginas HTML de políticas para reflejar con precisión los plazos de retención y derechos de datos.
- **Criterios de Aceptación:**
  - [ ] Las páginas de políticas están sincronizadas con la arquitectura del sistema.
- **Estado:** [ ] Pendiente

---

## GRUPO PRIORIDAD P3 (BAJO)

### [ ] [TAREA-F4-P3-01] Implementar informes periódicos de revisión de privilegios y cuentas
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Bajo · Seguridad · Gobierno
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Dependencias:** TAREA-F4-P1-03, TAREA-F4-P1-07, TAREA-F4-P1-09.
- **Descripción del Alcance:**
  1. Generar reportes automáticos de cuentas inactivas y privilegios administrativos para auditoría periódica.
- **Criterios de Aceptación:**
  - [ ] Reporte de revisión de privilegios disponible para administradores.
- **Estado:** [ ] Pendiente

### [ ] [TAREA-F4-P3-02] Optimizar los informes de auditoría y el diagnóstico de incidencias
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Bajo · Observabilidad · Rendimiento
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Dependencias:** TAREA-F4-P1-06, TAREA-F4-P1-09.
- **Descripción del Alcance:**
  1. Paginación en servidor para consultas masivas sobre `BitacoraEventos` y `BitacoraTraceability`.
- **Criterios de Aceptación:**
  - [ ] Consultas de auditoría optimizadas con paginación.
- **Estado:** [ ] Pendiente

### [ ] [TAREA-F4-P3-03] Establecer un sistema de detección y reconciliación de inconsistencias de identidad
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Bajo · Integridad · Identidad
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Dependencias:** TAREA-F4-P2-01, TAREA-F4-P1-01, TAREA-F4-P1-07.
- **Descripción del Alcance:**
  1. Ampliar el escáner de coherencia para detectar asignaciones de rol o delegaciones huérfanas.
- **Criterios de Aceptación:**
  - [ ] Escáner reporta y permite corregir inconsistencias referenciales.
- **Estado:** [ ] Pendiente
