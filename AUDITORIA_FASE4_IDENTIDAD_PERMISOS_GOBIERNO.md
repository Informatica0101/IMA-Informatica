# INFORME OFICIAL DE AUDITORÍA FUNCIONAL, TÉCNICA Y DE SEGURIDAD
## Fase 4: Identidad, Permisos y Gobierno de la Información
**Plataforma Integral de Gestión Educativa — New Generation Christian Academy**
**Fecha de Auditoría:** Octubre de 2026
**Versión Evaluada:** 1.0 Final (Post-Fase 3 Integrada)
**Estado General de la Fase:** Implementada Parcialmente / Requiere Mejoras

---

## A. IDENTIFICACIÓN DE LA AUDITORÍA

- **Nombre de la Fase:** Fase 4: Identidad, Permisos y Gobierno de la Información.
- **Alcance Previsto:** Auditoría integral de los mecanismos de identificación de usuarios, administración de relaciones institucionales, control de acceso granular (RBAC/ABAC), aislamiento de datos privados entre usuarios del mismo rol, delegaciones y suplencias temporales, trazabilidad e historial de auditoría, políticas de privacidad, retención y eliminación de información, unificación de autenticación y autorización entre microservicios, y revocación efectiva de sesiones.
- **Alcance Efectivamente Evaluado:** Se auditaron visual, manual y técnicamente los 5 microservicios backend de Google Apps Script (`user-service`, `academic-service`, `accounting-service`, `exam-service`, `task-service`), los módulos JavaScript del cliente (`js/auth.js`, `js/api.js`, `js/config.js`, `js/data.js`, `js/ui-common.js`, `js/student.js`, `js/teacher.js`, `js/accounting.js`), así como las vistas y páginas de políticas (`login.html`, `register.html`, `politica-de-privacidad.html`, `politica-de-uso.html`, `politica-financiera.html`).
- **Metodología Aplicada:** Cumplimiento estricto de `METODOLOGIA_DESARROLLO.md`. Inspección estática línea por línea, análisis de flujo de ejecución, matrices de pruebas estáticas/funcionales, sin realizar modificaciones de código ni alteraciones en datos de producción.
- **Documentación Consultada:**
  - `METODOLOGIA_DESARROLLO.md`: Proceso obligatorio de auditoría y control de calidad.
  - `README.md`: Descripción funcional de los módulos del ecosistema.
  - `MapaDependencias.md`: Mapa de servicios, componentes y autoridad de datos.
  - `tareas_completadas.md`: Histórico de desarrollo de Fases 1, 2 y 3.
  - Hojas de cálculo de backend (`Usuarios`, `Personas`, `SecuenciasIDs`, `BitacoraEventos`, `BitacoraTraceability`, `SustitucionesPersonal`).
- **Servicios e Integraciones Examinados:**
  - Google Apps Script Microservices: `user-service` (Code.gs: 4,730 líneas), `academic-service` (Code.gs: 5,698 líneas), `accounting-service` (Code.gs: 9,767 líneas), `exam-service` (Code.gs: 1,111 líneas), `task-service` (Code.gs: 1,975 líneas).
  - Integración Google Drive & Spreadsheet API.

---

## B. RESUMEN EJECUTIVO

La auditoría de la Fase 4 de la Plataforma Integral de Gestión Educativa ha verificado que la aplicación cuenta con un núcleo de identidad robusto en `user-service`, separación de personas y cuentas, generación de identificadores únicos (`generateInstitutionalId`), estados de cuenta (`Activa`, `Desactivada`, `Suspendida`, `Bloqueada`), registro de eventos en bitácoras sanitizadas (`sanitizePayloadForLog`) y enmascaramiento de secretos.

Sin embargo, se ha detectado **una brecha de seguridad crítica de prioridad P0 en la arquitectura de autorización distribuida**:
1. **Desalineación de Verificación de Rol entre Microservicios (UNI-02, UNI-04, AUT-15, AUT-16):** Mientras que `user-service` implementa `getUserVerifiedRole` para consultar el estado y rol real en la hoja `Usuarios` de la base de datos (rechazando cuentas inactivas o modificadas), los otros 4 microservicios (`academic-service`, `accounting-service`, `exam-service` y `task-service`) evalúan `validateRolePermission` utilizando directamente `(payload.authRole || payload.rol)` extraído del cuerpo JSON de la solicitud enviada por el cliente. Un usuario malicioso o una cuenta desactivada puede enviar una llamada HTTP directa a cualquiera de estos 4 servicios adjuntando `"authRole": "Administrador"` o `"authRole": "Docente"` y ejecutar operaciones protegidas sin que el backend verifique su identidad en la tabla de usuarios.
2. **Manipulación de Identificadores / IDOR (AUT-07, AUT-08, AUT-03):** Varios endpoints en `user-service` y `academic-service` aceptan parámetros como `userId`, `studentId` o `guardianUserId` en el payload y devuelven registros privados sin certificar que el `authUserId` de la sesión coincida con la entidad solicitada o mantenga una relación autorizada explícita.
3. **Ausencia de Módulo General de Delegación y Permisos Temporales (DEL-01 a DEL-08):** Aunque existen mecanismos del dominio para sustituciones docentes en horarios y reemplazos de personal en Recursos Humanos, no existe un motor transversal de delegación de roles de seguridad con expiración automática, límites de alcance y trazabilidad de ejecutor/delegante.
4. **Ausencia de Motor de Expiración de Retención de Datos (PRI-05):** No existe un proceso programado que audite y ejecute automáticamente el archivo o purga segura de registros personales cuyo período de conservación institucional haya vencido.

**Conclusión General:** La plataforma satisface el **71.0% de los criterios de aceptación aplicables (44/62 aprobados)**. La Fase 4 se clasifica como **Implementada Parcialmente / Requiere Mejoras**. No se debe declarar la fase como segura o completa hasta que se resuelva la unificación del control de autorización entre microservicios (P0) y el aislamiento de datos por usuario (P0).

---

## C. INVENTARIO FUNCIONAL DE LA FASE 4

| ID Capacidad | Capacidad / Módulo | Ubicación Real | Componentes Relacionados | Roles Afectados | Estado Funcional | Avance de Auditoría |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CAP-F4-01** | Identidad de usuarios y ciclo de vida | `backend/user-service/Code.gs` | `registerUser`, `manageAccountState`, `generateInstitutionalId` | Todos | Completa y verificada | Verificada |
| **CAP-F4-02** | Roles, cargos y departamentos | `backend/user-service/Code.gs`, `backend/academic-service/Code.gs` | `createPerson`, `linkPersonAccount`, `assignDepartmentHead` | Dirección, RRHH, Todos | Implementada parcialmente | Verificada |
| **CAP-F4-03** | Permisos granulares (RBAC) | `backend/*/Code.gs` (5 servicios) | `ROLE_PERMISSIONS`, `validateRolePermission` | Todos | Defectuosa | Verificada |
| **CAP-F4-04** | Aislamiento de datos privados entre usuarios | `backend/user-service/Code.gs`, `backend/academic-service/Code.gs` | `getGuardianStudents`, `getStudentAbsenceJustifications` | Estudiante, Padre, Docente | Defectuosa | Verificada |
| **CAP-F4-05** | Delegaciones y suplencias temporales | `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs` | `registerDocenteSustitucion`, `SustitucionesPersonal` | Docente, Personal RRHH | Requiere mejoras | Verificada |
| **CAP-F4-06** | Historial de cambios y auditoría de accesos | `backend/user-service/Code.gs` | `logStructuredEvent`, `recordTraceabilityLog`, `sanitizePayloadForLog` | Administrador, Sistema | Completa y verificada | Verificada |
| **CAP-F4-07** | Políticas de privacidad, retención y eliminación | `politica-de-privacidad.html`, `backend/user-service/Code.gs` | `purgeStructuredLogs`, `deleteOrArchiveSchoolDocumentTemplate` | Todos | Requiere mejoras | Verificada |
| **CAP-F4-08** | Unificación de autenticación y autorización | `backend/*/Code.gs`, `js/api.js` | `getUserVerifiedRole`, `fetchApi`, `doPost` | Todos | Defectuosa | Verificada |
| **CAP-F4-09** | Revocación de permisos y sesiones | `backend/user-service/Code.gs`, `js/ui-common.js` | `invalidateUserRoleCache`, `handleSessionExpired` | Todos | Defectuosa | Verificada |
| **CAP-F4-10** | Calidad, experiencia administrativa y concurrencia | `backend/*/Code.gs` | `LockService`, `getAuditReport`, `sanitizePayloadForLog` | Administrador | Completa y verificada | Verificada |

---

## D. ANÁLISIS DETALLADO POR SUBCAPACIDAD

### 1. Identidad de usuarios y relaciones institucionales

#### Subcapacidad 4.1: Identidad única y ciclo de vida de los usuarios
- **Identificador:** SUB-F4-01
- **Propósito:** Garantizar una identidad única, coherente e inalterable para cada usuario, distinguiendo autenticación de datos personales y gestionando los estados de cuenta.
- **Comportamiento Esperado:** Rechazar duplicados por correo o identificador, permitir la desactivación de cuentas bloqueando el acceso posterior sin destruir registros históricos académicos/contables.
- **Implementación Encontrada:** `registerUser` detecta correos existentes en la hoja `Usuarios`. `generateInstitutionalId` genera secuenciales atómicos con `LockService`. `manageAccountState` cambia estados a `["Pendiente", "InvitacionEnviada", "Activa", "Suspendida", "Bloqueada", "Desactivada"]`.
- **Ubicación Exacta:** `backend/user-service/Code.gs` (Líneas 1283-1346, 1347-1401).
- **Dependencias:** Hoja `Usuarios`, Hoja `SecuenciasIDs`.
- **Estado Funcional:** Completa y verificada.
- **Pruebas Realizadas:** Verificación estática y simulación de registro duplicado y desactivación de cuenta.
- **Resultados:** ID-01, ID-02, ID-03, ID-04 y ID-05 aprobados.
- **Evidencias:** `getUserVerifiedRole` retorna `"NO_ACCESS"` cuando `accountState` es `Desactivada`, `Bloqueada` o `Suspendida`.
- **Limitaciones:** `registerUser` utiliza `now.getTime()` para el `userId` asignado como fallback si no se invoca `generateInstitutionalId`.
- **Mejoras Propuestas:** Forzar la generación de `userId` mediante `generateInstitutionalId('Usuario', 'USR-')`.

#### Subcapacidad 4.2: Roles, cargos, departamentos y grupos
- **Identificador:** SUB-F4-02
- **Propósito:** Representar la estructura institucional (identidad, rol, cargo, departamento, adscripción académica, grupo) sin otorgar privilegios globales indeseados.
- **Comportamiento Esperado:** Distinguir entre persona física (`PER-xxx`) y cuenta de usuario (`USR-xxx`), permitiendo asignaciones de departamento y cargos con actualización de accesos.
- **Implementación Encontrada:** `createPerson` y `linkPersonAccount` separan la entidad Persona del Usuario. `assignDepartmentHead` asigna jefes de departamento. `AsignacionesDocentes` vincula docentes a asignaturas y secciones.
- **Ubicación Exacta:** `backend/user-service/Code.gs` (Líneas 1196-1282), `backend/academic-service/Code.gs` (Líneas 3300-3320).
- **Dependencias:** Hojas `Personas`, `Usuarios`, `Departamentos`, `AsignacionesDocentes`.
- **Estado Funcional:** Implementada parcialmente.
- **Pruebas Realizadas:** Criterios ID-06, ID-07, ID-08, ID-09, ID-10 evaluados.
- **Resultados:** Aprobados ID-06 a ID-10. ID-11 fallido por falta de verificación de rol en servicios secundarios.
- **Evidencias:** `auditInstitutionalIdentifierCollisions` detecta colisiones e identificadores huérfanos.
- **Limitaciones:** Falta una interfaz dinámica para la edición visual de la matriz de roles por departamento.
- **Mejoras Propuestas:** Implementar un editor de catálogo de roles institucionales dinámico en el panel de administración.

#### Subcapacidad 4.3: Reutilización de identidad entre servicios
- **Identificador:** SUB-F4-03
- **Propósito:** Garantizar que el identificador y rol del usuario sean interpretados de forma uniforme en todos los microservicios sin suplantación.
- **Comportamiento Esperado:** La misma identidad autenticada debe gobernar los accesos en todos los servicios.
- **Implementación Encontrada:** Inconsistencia detectada. `user-service` valida el rol en la hoja `Usuarios`, mientras que los demás servicios leen directamente `payload.authRole`.
- **Ubicación Exacta:** `backend/academic-service/Code.gs` (Línea 286), `backend/accounting-service/Code.gs` (Línea 268), `backend/exam-service/Code.gs` (Línea 105), `backend/task-service/Code.gs` (Línea 119).
- **Dependencias:** `validateRolePermission` en los 5 servicios.
- **Estado Funcional:** Defectuosa.
- **Pruebas Realizadas:** Criterio ID-11.
- **Resultados:** Fallido.
- **Evidencias:** `const userRole = (payload && (payload.authRole || payload.rol)) || "Estudiante";` confía ciegamente en el cliente.
- **Limitaciones:** Permite escalada de privilegios en peticiones HTTP directas a los microservicios secundarios.
- **Mejoras Propuestas:** Centralizar `getUserVerifiedRole` mediante una llamada inter-servicio o biblioteca compartida de autenticación.

---

### 2. Autorización granular y protección de datos

#### Subcapacidad 5.1: Granularidad de los permisos (RBAC / ABAC)
- **Identificador:** SUB-F4-04
- **Propósito:** Evaluar permisos según acción, módulo, rol y recursos.
- **Comportamiento Esperado:** Reglas explícitas de permisos por rol, denegación predeterminada si no existe permiso explícito.
- **Implementación Encontrada:** Mapa `ROLE_PERMISSIONS` definido en los 5 servicios con roles `Administrador`, `Director`, `Secretaría`, `Recursos Humanos`, `Contabilidad`, `Docente`, `Estudiante`/`Alumno`, `Padre`/`Tutor`.
- **Ubicación Exacta:** `backend/user-service/Code.gs` (Líneas 920-975, 1025-1039).
- **Dependencias:** `validateRolePermission`.
- **Estado Funcional:** Implementada parcialmente.
- **Pruebas Realizadas:** AUT-01, AUT-04, AUT-05, AUT-06, AUT-14, AUT-17, AUT-18, AUT-19.
- **Resultados:** Aprobados AUT-01, AUT-04 a AUT-06, AUT-14, AUT-17 a AUT-19.
- **Evidencias:** Acciones no contempladas retornan `code: "AUTH_PERMISSION_DENIED"`.
- **Limitaciones:** Los permisos por registro específico (ABAC) son escasos.
- **Mejoras Propuestas:** Incorporar validación de propiedad de registro en la función `validateRolePermission`.

#### Subcapacidad 5.2: Aislamiento de datos privados entre usuarios con el mismo rol
- **Identificador:** SUB-F4-05
- **Propósito:** Impedir que dos usuarios con el mismo rol (ej. dos estudiantes) accedan a los datos privados del otro.
- **Comportamiento Esperado:** Un estudiante solo debe consultar su propio expediente, notas, tareas y notificaciones.
- **Implementación Encontrada:** Varios endpoints aceptan `userId` o `studentId` del payload sin validar que corresponda al `authUserId` del llamante cuando el rol no es administrativo.
- **Ubicación Exacta:** `backend/user-service/Code.gs` (`getUserInfo`, `getStudentAbsenceJustifications`), `backend/academic-service/Code.gs` (`getStudentAcademicReport`).
- **Dependencias:** `validateRolePermission`, validación de coincidencia de identidad.
- **Estado Funcional:** Defectuosa.
- **Pruebas Realizadas:** AUT-02, AUT-03, AUT-07, AUT-08, AUT-09, AUT-10, AUT-11, AUT-12, AUT-13.
- **Resultados:** Fallidos AUT-02, AUT-03, AUT-07, AUT-08. Aprobados AUT-09 a AUT-13.
- **Evidencias:** Al modificar `userId` en la solicitud de `getUserInfo` o `getStudentAbsenceJustifications`, el servidor retorna el registro ajeno si el rol enviado es `Estudiante`.
- **Limitaciones:** Vulnerabilidad IDOR (Insecure Direct Object Reference) latente en endpoints de consulta individual.
- **Mejoras Propuestas:** Forzar la sobreescritura de `payload.userId = authUserId` en el backend para roles de Estudiante y Padre.

#### Subcapacidad 5.3: Validación en el servidor
- **Identificador:** SUB-F4-06
- **Propósito:** Garantizar que los controles de autorización se apliquen en el backend independientemente de la interfaz.
- **Comportamiento Esperado:** Invocaciones directas a las URLs de los microservicios deben aplicar las mismas restricciones.
- **Implementación Encontrada:** `user-service` valida en el servidor con la base de datos, pero los otros 4 servicios aceptan `authRole` arbitrario del cliente.
- **Ubicación Exacta:** `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/exam-service/Code.gs`, `backend/task-service/Code.gs` (`doPost`).
- **Dependencias:** `validateRolePermission`.
- **Estado Funcional:** Defectuosa.
- **Pruebas Realizadas:** AUT-15, AUT-16.
- **Resultados:** Fallidos AUT-15 y AUT-16.
- **Evidencias:** Invocación HTTP POST directa a `academic-service` con `{ "action": "createAdmissionRequest", "payload": { "authRole": "Administrador" } }` se autoriza sin verificar el rol real en `Usuarios`.
- **Limitaciones:** Omitir el cliente web permite eludir las restricciones RBAC en los servicios secundarios.
- **Mejoras Propuestas:** Implementar firma de token de sesión verificado por clave secreta o consulta remota a `user-service`.

---

### 3. Delegaciones, suplencias y permisos temporales

#### Subcapacidad 6.1 y 6.2: Gestión de delegaciones, suplencias y reemplazos
- **Identificador:** SUB-F4-07
- **Propósito:** Permitir la delegación temporal de funciones entre usuarios y la sustitución de personal manteniendo la trazabilidad del actor real y del titular.
- **Comportamiento Esperado:** Módulo general de delegaciones con vigencia, revocación anticipada y auditoría cruzada ejecutor/delegante.
- **Implementación Encontrada:**
  - *Académico:* `registerDocenteSustitucion` registra sustituciones temporales de docentes en la oferta académica (`AsignacionesDocentes`). `syncAcademicScheduleIntegrity` y `getUnifiedInstitutionalCalendar` contemplan docentes sustitutos.
  - *Recursos Humanos:* `SustitucionesPersonal` en `accounting-service` registra sustituciones laborales con `EmpleadoSustitutoID`, `EmpleadoSustituidoID` y `MotivoSustitucion`.
  - *Seguridad de Roles:* No existe un motor general para delegar permisos de rol de usuario (ej. un Director que delega aprobación a un Coordinador por 5 días) (DEL-01 a DEL-08).
- **Ubicación Exacta:** `backend/academic-service/Code.gs` (Líneas 2900-2920), `backend/accounting-service/Code.gs` (Líneas 6940-7040).
- **Dependencias:** Hojas `AsignacionesDocentes`, `SustitucionesPersonal`.
- **Estado Funcional:** Implementada parcialmente / Requiere mejoras.
- **Pruebas Realizadas:** DEL-01 a DEL-08.
- **Resultados:** Aprobados DEL-04, DEL-07. Fallidos DEL-01, DEL-02, DEL-03, DEL-05, DEL-06, DEL-08.
- **Evidencias:** Existen funciones del dominio académico y de RRHH, pero carecen de la capacidad de otorgar permisos de seguridad de forma temporal a nivel de RBAC.
- **Limitaciones:** No se pueden delegar permisos del sistema entre cuentas de usuario para operaciones administrativas o contables.
- **Mejoras Propuestas:** Crear la tabla `DelegacionesSeguridad` en `user-service` con motor de vigencia de permisos temporales.

---

### 4. Historial de cambios, auditoría de accesos y trazabilidad

#### Subcapacidad 7.1, 7.2 y 7.3: Eventos auditales, contenido del registro e integridad
- **Identificador:** SUB-F4-08
- **Propósito:** Registrar eventos sensibles de seguridad, cambios de permisos, accesos y operaciones críticas con metadatos completos y protección contra borrados no autorizados.
- **Comportamiento Esperado:** Bitácoras estructuradas (`BitacoraEventos`, `BitacoraTraceability`) que registren actor, acción, recurso, resultado, fecha y contexto, sanitizando credenciales y tokens.
- **Implementación Encontrada:**
  - `logStructuredEvent` escribe eventos en `BitacoraEventos`.
  - `recordTraceabilityLog` guarda correlación en `BitacoraTraceability`.
  - `sanitizePayloadForLog` enmascara contraseñas, tokens, datos financieros y credenciales (AUD-07).
  - `purgeStructuredLogs` restringe el borrado de bitácoras exclusivamente al rol `Administrador`, registrando `UNAUTHORIZED_PURGE_ATTEMPT` ante intentos no autorizados (AUD-05).
- **Ubicación Exacta:** `backend/user-service/Code.gs` (Líneas 43-65, 325-395, 2583-2650, 4124-4148).
- **Dependencias:** Hojas `BitacoraEventos`, `BitacoraTraceability`.
- **Estado Funcional:** Completa y verificada.
- **Pruebas Realizadas:** AUD-01 a AUD-09.
- **Resultados:** Aprobados los 9 criterios (AUD-01 a AUD-09).
- **Evidencias:** Intentos de purga sin rol Administrador generan eventos de advertencia y se rechazan. Los datos sensibles se reemplazan por `***MASKED***`.
- **Limitaciones:** Los inicios de sesión fallidos con contraseña incorrecta en `loginUser` no registran de forma explícita un evento `LOGIN_FAILED` en la bitácora.
- **Mejoras Propuestas:** Inyectar `logStructuredEvent` en las ramas de contraseña incorrecta de `loginUser`.

---

### 5. Políticas de privacidad, retención, archivo y eliminación

#### Subcapacidad 8.1, 8.2 y 8.3: Retención, archivo, eliminación autorizada y protección de datos
- **Identificador:** SUB-F4-09
- **Propósito:** Aplicar políticas de retención según la naturaleza de la información, permitir el archivado seguro y la eliminación autorizada sin destruir historiales obligatorios.
- **Comportamiento Esperado:** Documentos legales de políticas de privacidad, posibilidad de archivar plantillas/documentos, control de respaldos y restauración segura.
- **Implementación Encontrada:**
  - Páginas de políticas: `politica-de-privacidad.html`, `politica-de-uso.html`, `politica-financiera.html`.
  - Archivo de documentos: `deleteOrArchiveSchoolDocumentTemplate` en `accounting-service` permite marcar elementos como `"archivada"`.
  - Respaldos e Integridad: `verifyBackupIntegrity` (SHA-256) y `restoreSystemBackup` en `academic-service` preservan calificaciones e historiales durante la restauración (PRI-06, PRI-08).
- **Ubicación Exacta:** `politica-de-privacidad.html`, `backend/accounting-service/Code.gs` (Líneas 9388-9410), `backend/academic-service/Code.gs` (Líneas 4980-5120).
- **Dependencias:** Backup Service, Google Drive API.
- **Estado Funcional:** Implementada parcialmente / Requiere mejoras.
- **Pruebas Realizadas:** PRI-01 a PRI-08.
- **Resultados:** Aprobados PRI-01 a PRI-04, PRI-06 a PRI-08. Fallido PRI-05.
- **Evidencias:** Existen mecanismos de archivo y políticas visibles, pero no hay un ejecutor automático de vencimiento de plazos de retención (PRI-05).
- **Limitaciones:** La expiración por retención legal/institucional debe ejecutarse manualmente por el administrador.
- **Mejoras Propuestas:** Desarrollar una tarea programada (`executeDataRetentionPolicy`) para archivar o anonimizar expedientes inactivos por más de X años.

---

### 6. Autenticación y autorización unificadas

#### Subcapacidad 9.1, 9.2 y 9.3: Autenticación, autorización compartida y revocación inmediata
- **Identificador:** SUB-F4-10
- **Propósito:** Disponer de un mecanismo unificado de autenticación y autorización entre todos los microservicios con revocación inmediata de accesos.
- **Comportamiento Esperado:** Que la desactivación de una cuenta o la revocación de un rol invalide el acceso en todos los microservicios de forma inmediata.
- **Implementación Encontrada:**
  - `user-service` verifica la vigencia en la base de datos y cachea el rol por 6 horas (`cache.put(cacheKey, trueRole, 21600)`).
  - Los microservicios de académicos, contabilidad, exámenes y tareas no consultan la tabla `Usuarios`, por lo que aceptan cualquier `authRole` enviado en el cuerpo de la petición HTTP POST.
- **Ubicación Exacta:** `backend/*/Code.gs` (Módulos de validación de rol).
- **Dependencias:** `CacheService`, `Usuarios`.
- **Estado Funcional:** Defectuosa.
- **Pruebas Realizadas:** UNI-01 a UNI-07.
- **Resultados:** Aprobados UNI-01, UNI-06, UNI-07. Fallidos UNI-02, UNI-03, UNI-04, UNI-05.
- **Evidencias:** Al cambiar el estado de un usuario a `"Desactivada"` en la hoja `Usuarios`:
  - Invocación a `user-service`: Retorna `NO_ACCESS` (Éxito).
  - Invocación a `accounting-service` o `academic-service` adjuntando `"authRole": "Administrador"`: La solicitud se procesa exitosamente (Fallo Crítico).
- **Limitaciones:** Ausencia de una biblioteca o servicio común de validación de tokens/sesión inter-servicio.
- **Mejoras Propuestas:** Implementar firmado de tokens de sesión con HMAC-SHA256 en `auth.js` / `user-service` y verificar la firma en `validateRolePermission` en todos los microservicios.

---

### 7. Requisitos transversales de calidad y seguridad

#### Subcapacidad 10.1 - 10.4: Concurrencia, experiencia administrativa y rendimiento
- **Identificador:** SUB-F4-11
- **Propósito:** Garantizar operaciones atómicas en asignaciones de identidad, experiencia clara de administración y rendimiento optimizado.
- **Comportamiento Esperado:** Uso de bloqueos en escrituras concurrentes, sanitización de datos y rendimiento fluido sin exponer información interna.
- **Implementación Encontrada:**
  - `LockService.getScriptLock()` previene duplicados en secuenciales de ID (`generateInstitutionalId`) y numeración CUV.
  - `getAuditReport` y `getServiceHealthReport` proveen información administrativa de salud y seguridad.
- **Ubicación Exacta:** `backend/user-service/Code.gs` (Líneas 73-142, 1295-1320, 4426-4480).
- **Dependencias:** `LockService`, `CacheService`.
- **Estado Funcional:** Completa y verificada.
- **Pruebas Realizadas:** Verificación estática de concurrencia y reportes.
- **Resultados:** Aprobados.
- **Evidencias:** Operaciones de numeración usan `lock.waitLock(10000)` para evitar carreras de datos.

---

## E. COMPARACIÓN CON LOS REQUISITOS

| ID | Requisito / Área Evaluada | Prioridad | Estado Actual | Evidencia Técnica | Brecha Identificada | Acción Recomendada |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-F4-01** | Identidad Única y Ciclo de Vida | P0 Crítico | Completo y verificado | `generateInstitutionalId` y `manageAccountState` | Ninguna en la asignación de IDs. | Mantener modelo de secuencias. |
| **REQ-F4-02** | Verificación Unificada de Rol entre Servicios | P0 Crítico | Defectuoso | `validateRolePermission` en servicios no-USER confía en `payload.authRole` | Invocación directa a microservicios elude control de cuenta inactiva. | Unificar verificación de rol mediante HMAC token o llamada a `user-service`. |
| **REQ-F4-03** | Aislamiento de Datos por Usuario (IDOR) | P0 Crítico | Defectuoso | Endpoints como `getUserInfo` leen `userId` del payload | Estudiantes/Padres pueden consultar datos ajenos alterando IDs en la petición. | Forzar `payload.userId = authUserId` en el servidor para roles no administrativos. |
| **REQ-F4-04** | Delegaciones y Permisos Temporales | P1 Alto | Implementado parcialmente | Existen sustituciones docentes pero no delegación general de roles | Sin motor de expiración ni delegación temporal de roles de seguridad. | Crear módulo de `DelegacionesSeguridad` con timestamps de inicio/fin. |
| **REQ-F4-05** | Trazabilidad y Auditoría Sanitizada | P0 Crítico | Completo y verificado | `logStructuredEvent` y `sanitizePayloadForLog` | Intentos fallidos de login no se registran en la bitácora estructurada. | Agregar registro de auditoría en fallos de autenticación. |
| **REQ-F4-06** | Políticas de Retención y Expiración | P1 Alto | Implementado parcialmente | Páginas de privacidad y archivado de documentos | No hay ejecutor automático de borrado/anonimización por retención vencida. | Crear tarea programada para la purga/anonimización de expedientes vencidos. |
| **REQ-F4-07** | Revocación Inmediata de Sesiones | P0 Crítico | Defectuoso | Caché de rol dura 6h y servicios secundarios no verifican `Usuarios` | Cuentas desactivadas mantienen acceso en 4 de los 5 microservicios. | Implementar invalidación global de caché y validación de token activo. |

---

## F. MATRIZ DE PRUEBAS Y CRITERIOS DE ACEPTACIÓN

| ID Criterio | Acción Evaluada | Resultado Esperado | Resultado Observado | Evidencia Técnica | Estado de Verificación |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ID-01** | Registrar usuario duplicado con el mismo email | Rechazar duplicado sin crear registros | Correo existente rechazado con mensaje `"Email ya registrado."` | `registerUser` en `user-service/Code.gs` | **Aprobado** |
| **ID-02** | Modificar atributo de identidad (perfil) | Conservar integridad de registros | `updateUserProfile` y `linkPersonAccount` mantienen la clave `personaId` | `linkPersonAccount` en `user-service/Code.gs` | **Aprobado** |
| **ID-03** | Intentar acceso con cuenta desactivada | Operaciones protegidas rechazadas | `manageAccountState` a `Desactivada` hace que `user-service` retorne `NO_ACCESS` | `getUserVerifiedRole` en `user-service/Code.gs` | **Aprobado** |
| **ID-04** | Conservación histórica tras desactivación | Conservar notas y expedientes íntegros | Desactivación no elimina filas de calificaciones ni expedientes | `manageAccountState` solo cambia columna estado | **Aprobado** |
| **ID-05** | Fallo durante alta de usuario con LockService | Sin registros parciales ni duplicados | `LockService.getScriptLock()` asegura atomicidad en secuenciales | `generateInstitutionalId` en `user-service/Code.gs` | **Aprobado** |
| **ID-06** | Asignar múltiples relaciones a un usuario | Otorgar únicamente accesos autorizados | `getGuardianStudents` permite tutores con múltiples representados | `getGuardianStudents` en `user-service/Code.gs` | **Aprobado** |
| **ID-07** | Traslado de departamento | Actualizar accesos del departamento | `assignDepartmentHead` asigna rol departamental | `assignDepartmentHead` en `academic-service/Code.gs` | **Aprobado** |
| **ID-08** | Cambio de cargo institucional | Privilegios ajustados al nuevo cargo | Estado y rol actualizados sin alterar `personaId` | `manageAccountState` en `user-service/Code.gs` | **Aprobado** |
| **ID-09** | Asignación a grupo/departamento inválido | Rechazar operación con error | Valida existencia y lanza `Error` si no existe | `assignDepartmentHead` en `academic-service/Code.gs` | **Aprobado** |
| **ID-10** | Búsqueda de inconsistencias e identidades | Detectar colisiones e identificadores | `auditInstitutionalIdentifierCollisions` escanea y reporta huérfanos | `auditInstitutionalIdentifierCollisions` | **Aprobado** |
| **ID-11** | Misma identidad en todos los servicios | Misma interpretación de rol en todo el backend | Services fuera de USER confían en `payload.authRole` sin validar tabla | `validateRolePermission` en `academic-service` | **Fallido** |
| **AUT-01** | Invocación con permiso de consulta sobre edición | Permitir consulta, denegar edición | Acción no incluida en `ROLE_PERMISSIONS` retorna denegación | `validateRolePermission` | **Aprobado** |
| **AUT-02** | Modificar registro específico ajeno | Rechazar modificación de registro no propio | Falta filtro por propiedad en endpoints de actualización | Endpoints de tareas y calificaciones | **Fallido** |
| **AUT-03** | Acceder a registro de otro ámbito alterando ID | Rechazar acceso por ámbito | Invocación con `studentId` ajeno retorna datos si rol es Estudiante | `getUserInfo` / `getStudentAbsenceJustifications` | **Fallido** |
| **AUT-04** | Permisos para acciones sensibles | Denegar acciones administrativas a roles bajos | `purgeStructuredLogs` restringe a `Administrador` | `purgeStructuredLogs` en `user-service/Code.gs` | **Aprobado** |
| **AUT-05** | Denegación predeterminada | Denegar acciones sin regla explícita | Retorna `AUTH_PERMISSION_DENIED` si acción no está en lista | `validateRolePermission` | **Aprobado** |
| **AUT-06** | Coincidencia de múltiples permisos | Ajustarse a reglas de precedencia RBAC | Matriz `ROLE_PERMISSIONS` evalúa arreglos por rol | `ROLE_PERMISSIONS` | **Aprobado** |
| **AUT-07** | Aislamiento entre usuarios del mismo rol | Cada usuario accede solo a sus datos | Usuario A puede consultar datos de Usuario B cambiando `userId` | `getUserInfo` | **Fallido** |
| **AUT-08** | Manipulación de identificadores (IDOR) | Servidor rechaza accesos ajenos | Peticiones HTTP aceptan `userId` sin validar contra `authUserId` | `getStudentAbsenceJustifications` | **Fallido** |
| **AUT-09** | Acceso docente a sus grupos asignados | Docente accede solo a cursos asignados | `AsignacionesDocentes` filtra asignaturas del docente | `teacher.js` y `academic-service` | **Aprobado** |
| **AUT-10** | Acceso de tutores a representados | Tutor accede únicamente a sus hijos | `getGuardianStudents` valida vínculo tutor-estudiante | `getGuardianStudents` en `user-service/Code.gs` | **Aprobado** |
| **AUT-11** | Restricciones aplicadas a búsquedas | Omnibox filtra por rol verificado | `searchGlobalOmnibox` verifica rol antes de consultar entidades | `searchGlobalOmnibox` en `user-service/Code.gs` | **Aprobado** |
| **AUT-12** | Acceso indirecto a archivos en Drive | Archivos protegidos requieren permiso | URLs de documentos usan controladores o PDFs protegidos | `accounting-service/Code.gs` | **Aprobado** |
| **AUT-13** | Campos sensibles en respuestas API | Sanitizar secretos y contraseñas | `sanitizePayloadForLog` enmascara tokens y contraseñas | `sanitizePayloadForLog` en `user-service/Code.gs` | **Aprobado** |
| **AUT-14** | Acceso administrativo restringido | Definir explícitamente privilegios globales | Matriz de permisos asigna `*` únicamente a `Administrador` | `ROLE_PERMISSIONS` | **Aprobado** |
| **AUT-15** | Acceso directo a endpoint sin interfaz | Aplicar las mismas restricciones RBAC | Petición directa a `academic-service` con `authRole` falso es aceptada | `doPost` en `academic-service/Code.gs` | **Fallido** |
| **AUT-16** | Modificar `authRole` en la solicitud | Ignorar `authRole` falsificado | Servicios secundarios aceptan `authRole` enviado en JSON | `validateRolePermission` en `accounting-service` | **Fallido** |
| **AUT-17** | Comprobación por tipo de operación CRUD | Validar según acción solicitada | Puntos de entrada distinguen acciones `get`, `create`, `save` | `doPost` en todos los servicios | **Aprobado** |
| **AUT-18** | Respuesta controlada ante denegación | Responder con JSON estandarizado de error | Retorna `{ status: "error", code: "AUTH_PERMISSION_DENIED" }` | `validateRolePermission` | **Aprobado** |
| **AUT-19** | Imposibilidad de obtener permisos | Denegar acceso ante falla de config | Si falla la lectura, el rol asignado por defecto es `"Estudiante"` | `getUserVerifiedRole` | **Aprobado** |
| **DEL-01** | Delegación de función concreta | Delegar sin otorgar otros privilegios | Sin módulo general de delegación de roles de seguridad | N/A | **Fallido** |
| **DEL-02** | Expiración de delegación por fecha | Denegar operaciones tras vencimiento | Sin motor de vencimiento de delegaciones de seguridad | N/A | **Fallido** |
| **DEL-03** | Revocación anticipada de delegación | Denegar inmediatamente tras revocar | Sin API de revocación anticipada de delegación de rol | N/A | **Fallido** |
| **DEL-04** | Registro del actor real y delegante | Identificar ejecutor y titular | Sustituciones docentes registran sustituto y titular en bitácora | `syncAcademicScheduleIntegrity` | **Aprobado** |
| **DEL-05** | Revocación de permisos del delegante | Invalidad delegación si delegante pierde rol | Sin vinculación de cascada entre delegante y delegado | N/A | **Fallido** |
| **DEL-06** | Delegaciones solapadas | Resolver precedencia sin privilegios extra | Sin gestión de múltiples delegaciones concurrentes | N/A | **Fallido** |
| **DEL-07** | Fechas límite y zonas horarias | Respetar inicio y fin configurados | Sustituciones docentes respetan `fechaInicio` y `fechaFin` | `AsignacionesDocentes` | **Aprobado** |
| **DEL-08** | Delegación con usuario inactivo | Rechazar uso si usuario es inactivo | Sin validación de estado de cuenta en delegación | N/A | **Fallido** |
| **AUD-01** | Evento tras cambio de permisos | Registrar actor, acción y resultado | `ACCOUNT_STATE_CHANGED` registrado en `BitacoraEventos` | `manageAccountState` | **Aprobado** |
| **AUD-02** | Evento tras operación denegada | Registrar intento no autorizado | `AUTH_PERMISSION_DENIED` registrado con detalle | `validateRolePermission` | **Aprobado** |
| **AUD-03** | Reconstrucción de secuencia histórica | Permitir orden cronológico de eventos | `BitacoraEventos` incluye timestamps e IDs de correlación | `BitacoraEventos` | **Aprobado** |
| **AUD-04** | Registro de delegación / sustitución | Identificar ejecutor y contexto | `SCHEDULE_INTEGRITY_CHECKED` registra sustituciones activas | `syncAcademicScheduleIntegrity` | **Aprobado** |
| **AUD-05** | Intentar modificar/purgar bitácora | Rechazar purga si no es Administrador | `UNAUTHORIZED_PURGE_ATTEMPT` registrado y acción rechazada | `purgeStructuredLogs` | **Aprobado** |
| **AUD-06** | Filtrar eventos de auditoría | Filtrar por usuario, fecha y tipo | `getStructuredLogs` y `getAuditReport` soportan filtros | `getStructuredLogs` | **Aprobado** |
| **AUD-07** | Sanitización de datos sensibles | No registrar contraseñas ni tokens | `sanitizePayloadForLog` enmascara claves con `***MASKED***` | `sanitizePayloadForLog` | **Aprobado** |
| **AUD-08** | Manejo de fallos en auditoría | Captura controlada de excepciones | Bloque `try-catch` captura error y loguea en fallback | `doPost` en microservicios | **Aprobado** |
| **AUD-09** | Marcas temporales entre servicios | Secuencia coherente con ISOString | Timestamps usan `new Date().toISOString()` | Todos los microservicios | **Aprobado** |
| **PRI-01** | Acceso a información personal | Rechazar si usuario no está autorizado | `ROLE_PERMISSIONS` restringe acceso a expedientes | `validateRolePermission` | **Aprobado** |
| **PRI-02** | Archivado de registros | Conservar datos en estado archivado | `deleteOrArchiveSchoolDocumentTemplate` marca `"archivada"` | `accounting-service/Code.gs` | **Aprobado** |
| **PRI-03** | Eliminación autorizada de datos | Registrar ejecución y resultado | `purgeStructuredLogs` elimina registros autorizados | `purgeStructuredLogs` | **Aprobado** |
| **PRI-04** | Eliminación no autorizada de datos | Rechazar intento sin privilegios | Retorna error y registra advertencia de purga | `purgeStructuredLogs` | **Aprobado** |
| **PRI-05** | Expiración de plazo de retención | Identificar y procesar vencidos | Sin motor automático de expiración de retención | N/A | **Fallido** |
| **PRI-06** | Verificación de archivos en Drive | Validar sumas e integridad | `verifyBackupIntegrity` confirma sumas SHA-256 | `verifyBackupIntegrity` | **Aprobado** |
| **PRI-07** | Exportaciones con permisos limitados | No incluir datos no autorizados | `generateInstitutionalReport` aplica filtro RBAC | `generateInstitutionalReport` | **Aprobado** |
| **PRI-08** | Restauración de copias de seguridad | No reintroducir borrados confirmados | `restoreSystemBackup` preserva notas históricas | `restoreSystemBackup` | **Aprobado** |
| **UNI-01** | Acceso con identidad inválida | Rechazar solicitudes sin identidad | `getUserVerifiedRole` retorna `Estudiante` / `NO_ACCESS` | `getUserVerifiedRole` | **Aprobado** |
| **UNI-02** | Credencial de cuenta desactivada | Revocar permisos en todos los servicios | `user-service` rechaza, pero los otros 4 servicios la aceptan | `doPost` en servicios secundarios | **Fallido** |
| **UNI-03** | Decisiones equivalentes entre servicios | Mismas reglas en todo el backend | `user-service` valida en DB; los demás confían en el payload | `validateRolePermission` | **Fallido** |
| **UNI-04** | Invocación directa a servicio alternativo | Aplicar la misma autorización | Petición directa a `academic-service` omite verificación de DB | `validateRolePermission` | **Fallido** |
| **UNI-05** | Cambio de privilegios o desactivación | Aplicación inmediata en la plataforma | Caché de 6 horas en `user-service` y sin validación en otros | `getUserVerifiedRole` | **Fallido** |
| **UNI-06** | Error al consultar configuración | Denegar acceso por defecto | Falla de lectura de rol otorga rol por defecto restrictivo | `validateRolePermission` | **Aprobado** |
| **UNI-07** | Respuestas de error sin secretos | No revelar credenciales ni código interno | Errores retornan mensajes genéricos y sanitizados | `sanitizePayloadForLog` | **Aprobado** |

---

## G. HALLAZGOS Y BRECHAS IDENTIFICADAS

### [HALLAZGO-F4-P0-01] Desalineación de Verificación de Rol entre Microservicios (Escalada de Privilegios)
- **Prioridad:** P0 - Crítica.
- **Descripción:** En los microservicios `academic-service`, `accounting-service`, `exam-service` y `task-service`, la función `validateRolePermission` obtiene el rol del usuario ejecutando:
  `const userRole = (payload && (payload.authRole || payload.rol)) || "Estudiante";`
  A diferencia de `user-service` (que consulta la hoja de cálculo `Usuarios` y verifica si la cuenta está desactivada o suspendida), los otros 4 microservicios confían ciegamente en el valor de `authRole` enviado dentro del JSON de la petición HTTP POST.
- **Evidencias:** `backend/academic-service/Code.gs` (Línea 286), `backend/accounting-service/Code.gs` (Línea 268), `backend/exam-service/Code.gs` (Línea 105), `backend/task-service/Code.gs` (Línea 119).
- **Impacto Potencial:** Un atacante o usuario desactivado puede enviar una solicitud HTTP directa a las URLs de los microservicios académicos o contables con `"authRole": "Administrador"` y ejecutar funciones protegidas (ej. modificar calificaciones, emitir facturas, alterar matrículas).
- **Componentes Afectados:** `academic-service`, `accounting-service`, `exam-service`, `task-service`.
- **Causa Raíz:** Falta de una función compartida de verificación de sesión/rol que consulte la base de datos o valide un token criptográfico firmado por `user-service`.
- **Recomendación de Resolución:** Implementar firma de tokens de sesión con HMAC-SHA256 en `user-service` / `auth.js` que codifique el `userId`, `role` y `expiresAt`. Todos los microservicios deben verificar la firma del token antes de autorizar cualquier operación.

### [HALLAZGO-F4-P0-02] Vulnerabilidad IDOR / Manipulación de Identificadores en Solicitudes
- **Prioridad:** P0 - Crítica.
- **Descripción:** Múltiples funciones de consulta de datos privados (ej. `getUserInfo`, `getStudentAbsenceJustifications`, `getGuardianStudents`) aceptan parámetros como `userId` o `studentId` en el payload. El backend no valida que el `userId` solicitado coincida con el `authUserId` del usuario autenticado cuando el rol es `Estudiante` o `Padre`.
- **Evidencias:** `backend/user-service/Code.gs` (`getUserInfo` en línea 1477).
- **Impacto Potencial:** Un estudiante o padre puede visualizar información confidencial, notas o justificaciones de cualquier otro usuario de la institución simplemente cambiando el ID del parámetro en la petición.
- **Componentes Afectados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`.
- **Causa Raíz:** Falta de sanitización y sobreescritura de `payload.userId` con el identificador verificado del llamante en solicitudes no administrativas.
- **Recomendación de Resolución:** En la función `validateRolePermission` o al inicio de cada handler de consulta, forzar `if (userRole === "Estudiante" || userRole === "Alumno") payload.userId = verifiedUserId;`.

### [HALLAZGO-F4-P1-01] Ausencia de Motor General de Delegaciones de Seguridad y Permisos Temporales
- **Prioridad:** P1 - Alta.
- **Descripción:** No existe un módulo transversal que gestione la delegación temporal de roles de seguridad entre usuarios con vigencia (fecha/hora inicio y fin), justificación, aprobación y revocación anticipada.
- **Evidencias:** Inexistencia de endpoints de delegación general en `user-service/Code.gs`.
- **Impacto Potencial:** Imposibilidad de otorgar accesos temporales autorizados durante ausencias administrativas o licencias sin transferir credenciales de usuario o cambiar el rol de forma permanente.
- **Componentes Afectados:** `backend/user-service/Code.gs`, `js/ui-common.js`.
- **Causa Raíz:** Capacidad no desarrollada en fases anteriores.
- **Recomendación de Resolución:** Implementar el módulo `DelegacionesSeguridad` en `user-service` con validación de expiración en `validateRolePermission`.

### [HALLAZGO-F4-P1-02] Inexistencia de Tarea Programada para Expiración por Retención de Datos
- **Prioridad:** P1 - Alta.
- **Descripción:** La plataforma no cuenta con un motor automático que evalúe periódicamente la fecha de conservación de datos personales de usuarios egresados o inactivosa fin de proceder a su archivado o anonimización conforme a políticas de privacidad.
- **Evidencias:** Inexistencia de función de limpieza por retención en `user-service`.
- **Impacto Potencial:** Acumulación indefinida de datos personales y posible incumplimiento de normativas de protección de datos.
- **Componentes Afectados:** `backend/user-service/Code.gs`.
- **Causa Raíz:** Inexistencia de temporizador (Triggers) de Apps Script vinculado a políticas de retención.
- **Recomendación de Resolución:** Crear la función `executeDataRetentionPolicyCheck` en `user-service` ejecutable mensualmente.

---

## H. PLAN DE RESOLUCIÓN PRIORIZADO

### Tareas Prioridad P0 (Crítica)

#### [TAREA-F4-P0-01] Unificación de Validación de Rol y Tokens HMAC entre Microservicios
- **Hallazgo Relacionado:** `HALLAZGO-F4-P0-01`
- **Problema que Resuelve:** Impide la suplantación de roles y la omisión de controles mediante peticiones HTTP directas a los microservicios secundarios.
- **Resultado Esperado:** Todos los microservicios verifican la firma criptográfica del token de sesión o consultan el rol verificado antes de procesar solicitudes.
- **Componentes Afectados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/exam-service/Code.gs`, `backend/task-service/Code.gs`, `js/auth.js`, `js/api.js`.
- **Cambios Necesarios:** Implementar generación de token firmado en `loginUser` y verificación de token HMAC en `validateRolePermission` de cada microservicio.
- **Pruebas de Regresión:** Enviar peticiones con `authRole` alterado a los 5 microservicios y confirmar que son rechazadas con `code: "AUTH_PERMISSION_DENIED"`.

#### [TAREA-F4-P0-02] Corrección de IDOR y Aislamiento de Datos de Usuario por Rol
- **Hallazgo Relacionado:** `HALLAZGO-F4-P0-02`
- **Problema que Resuelve:** Evita que usuarios con rol `Estudiante` o `Padre` accedan a datos privados de otros usuarios mediante la modificación de identificadores.
- **Resultado Esperado:** El backend impone que los usuarios no administrativos solo puedan consultar registros donde el identificador coincida exactamente con su propia identidad autenticada.
- **Componentes Afectados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`.
- **Cambios Necesarios:** Sobreescribir los parámetros `userId` / `studentId` del payload con la identidad del token cuando el rol no sea `Administrador` o `Director`.
- **Pruebas de Regresión:** Intentar consultar el expediente o justificaciones de otro usuario desde una cuenta de estudiante y verificar el rechazo o filtrado automático.

---

### Tareas Prioridad P1 (Alta)

#### [TAREA-F4-P1-01] Implementación del Módulo Transversal de Delegaciones y Permisos Temporales
- **Hallazgo Relacionado:** `HALLAZGO-F4-P1-01`
- **Problema que Resuelve:** Permite delegar funciones administrativas o académicas de forma temporal con trazabilidad del delegante y del ejecutor real.
- **Resultado Esperado:** Módulo de delegaciones plenamente operativo con fechas de inicio, expiración y auditoría.
- **Componentes Afectados:** `backend/user-service/Code.gs`, `js/ui-common.js`.
- **Cambios Necesarios:** Crear tabla `DelegacionesSeguridad`, endpoints `createDelegation`, `revokeDelegation`, e integrar validación en `validateRolePermission`.
- **Pruebas de Regresión:** Crear una delegación temporal, verificar que vence a la fecha especificada y rechaza operaciones posteriores.

#### [TAREA-F4-P1-02] Motor de Expiración y Cumplimiento de Políticas de Retención de Datos
- **Hallazgo Relacionado:** `HALLAZGO-F4-P1-02`
- **Problema que Resuelve:** Automatiza el cumplimiento de plazos de conservación de datos institucionales.
- **Resultado Esperado:** Proceso que identifique expedientes vencidos y los traslade a estado archivado o anonimizado.
- **Componentes Afectados:** `backend/user-service/Code.gs`.
- **Cambios Necesarios:** Crear la función `executeDataRetentionPolicyCheck` y registrar auditoría de elementos procesados.
- **Pruebas de Regresión:** Simular expedientes con fecha de conservación vencida y verificar que el proceso los identifique y archive correctamente.

---

## I. CAPACIDADES ADICIONALES RECOMENDADAS

1. **Matriz Dinámica Visual de Permisos por Rol (RBAC Policy Editor):** Panel interactivo en el dashboard de Dirección para activar o desactivar permisos por módulo sin necesidad de editar las constantes en el código fuente (`ROLE_PERMISSIONS`).
2. **Bus de Notificación e Invalidación Inmediata de Sesiones (Real-Time Revocation Bus):** Mecanismo de eventos que notifique inmediatamente a todos los microservicios cuando una cuenta sea desactivada o bloqueada, purgando la caché de roles de forma instantánea.
3. **Panel de Gobierno y Cumplimiento de Privacidad (Privacy & GDPR Dashboard):** Herramienta para gestionar solicitudes de exportación de datos personales, rectificación y derecho al olvido para miembros de la comunidad educativa.

---

## J. BLOQUEOS Y LIMITACIONES DE LA AUDITORÍA

1. **Entorno de Pruebas y Producción:** La auditoría se ejecutó en un entorno controlado mediante análisis estático y simulación en sandbox. No se realizaron pruebas destructivas ni alteraciones en cuentas reales de producción para garantizar la integridad de los datos institucionales.
2. **Cuotas de Google Workspace:** No se forzó el agotamiento extremo de cuotas de correo de Google Apps Script para evitar bloqueos temporales en los servicios del dominio.

---

## K. CONCLUSIÓN GENERAL

La **Fase 4: Identidad, permisos y gobierno de la información** de la Plataforma Integral de Gestión Educativa - New Generation Christian Academy presenta una arquitectura sólida en el servicio central de usuarios (`user-service`), contando con separaciones de entidad, secuencias atómicas de ID, sanitización de datos en bitácoras y registros de trazabilidad.

No obstante, **la plataforma no debe ser declarada lista para producción en su estado actual** debido a los dos hallazgos críticos P0 detectados:
1. La falta de validación del rol en la base de datos por parte de los microservicios secundarios (`academic-service`, `accounting-service`, `exam-service` y `task-service`), que confían en el valor `authRole` enviado por el cliente.
2. La presencia de vulnerabilidades IDOR por falta de forzado de identidad del llamante en consultas de estudiantes y tutores.

Una vez ejecutadas las tareas `TAREA-F4-P0-01` y `TAREA-F4-P0-02` descritas en el Plan de Resolución, la Fase 4 alcanzará un estado de cumplimiento y seguridad pleno.

---

## REGISTRO CONSOLIDADO DE AVANCE (FASE 4)

| ID Subcapacidad | Capacidad / Subcapacidad | Estado Funcional | Avance Auditoría | Evidencias | Brechas Detectadas | Bloqueos | Acción Pendiente | Próximo Paso |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SUB-F4-01** | Identidad única y ciclo de vida | Completa y verificada | Verificada | `registerUser`, `manageAccountState` | Ninguna | Ninguno | Ninguna | Mantener secuencias |
| **SUB-F4-02** | Roles, cargos y departamentos | Implementada parcialmente | Verificada | `createPerson`, `assignDepartmentHead` | Editor dinámico ausente | Ninguno | Editor dinámico | Crear UI de roles |
| **SUB-F4-03** | Reutilización de identidad entre servicios | Defectuosa | Verificada | `validateRolePermission` | Services confían en `authRole` de payload | Ninguno | TAREA-F4-P0-01 | Implementar HMAC Token |
| **SUB-F4-04** | Permisos granulares (RBAC) | Implementada parcialmente | Verificada | `ROLE_PERMISSIONS` | Sin permisos por registro específicos | Ninguno | Reforzar ABAC | Agregar reglas por recurso |
| **SUB-F4-05** | Aislamiento de datos privados (IDOR) | Defectuosa | Verificada | `getUserInfo`, `getStudentAbsenceJustifications` | `userId` no se fuerza a `authUserId` | Ninguno | TAREA-F4-P0-02 | Forzar ID en backend |
| **SUB-F4-06** | Validación en el servidor | Defectuosa | Verificada | `doPost` en microservicios | Acceso directo elude validación DB | Ninguno | TAREA-F4-P0-01 | Firma de token HMAC |
| **SUB-F4-07** | Delegaciones y suplencias | Requiere mejoras | Verificada | `registerDocenteSustitucion`, `SustitucionesPersonal` | Sin delegación general de roles | Ninguno | TAREA-F4-P1-01 | Crear `DelegacionesSeguridad` |
| **SUB-F4-08** | Auditoría y trazabilidad | Completa y verificada | Verificada | `logStructuredEvent`, `sanitizePayloadForLog` | Login fallido no logueado | Ninguno | Registro en login | Loguear password errónea |
| **SUB-F4-09** | Privacidad, retención y eliminación | Requiere mejoras | Verificada | `politica-de-privacidad.html`, `purgeStructuredLogs` | Sin ejecutor de retención vencida | Ninguno | TAREA-F4-P1-02 | Tarea de expiración |
| **SUB-F4-10** | Unificación de auth/authz y revocación | Defectuosa | Verificada | `getUserVerifiedRole`, `CacheService` | Caché de 6h y falta de sync inter-servicio | Ninguno | TAREA-F4-P0-01 | Invalidación global bus |

### Fórmulas Oficiales de Cobertura de la Auditoría:
- **Cobertura de Inspección (%)** = (10 subcapacidades inspeccionadas / 10 subcapacidades inventariadas) × 100 = **100.0%**
- **Cobertura de Verificación (%)** = (44 criterios de aceptación aprobados / 62 criterios aplicables) × 100 = **71.0%**

---

## FUENTES EXTERNAS Y FUNDAMENTO TÉCNICO

1. **OWASP API Security Top 10 (2023) - API1: Broken Object Level Authorization (BOLA / IDOR):**
   - *Entidad:* OWASP Foundation.
   - *Dirección Electrónica:* `https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/`
   - *Fecha de Consulta:* Octubre de 2026.
   - *Requisito Fundamentado:* Fundamenta los hallazgos y pruebas de las subcapacidades 5.2 y 5.3 (Criterios AUT-02, AUT-03, AUT-07, AUT-08), exigiendo que las validaciones de acceso al objeto comprueben siempre la propiedad del recurso en el servidor.

2. **OWASP API Security Top 10 (2023) - API5: Broken Function Level Authorization (BFLA):**
   - *Entidad:* OWASP Foundation.
   - *Dirección Electrónica:* `https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/`
   - *Fecha de Consulta:* Octubre de 2026.
   - *Requisito Fundamentado:* Fundamenta la necesidad de unificar la verificación de rol en el servidor en todos los microservicios (Criterios AUT-15, AUT-16, UNI-02, UNI-04), evitando confiar en parámetros del cliente.

3. **Moodle Official Documentation - Roles and Permissions Architecture:**
   - *Entidad:* Moodle HQ / Moodle Docs.
   - *Dirección Electrónica:* `https://docs.moodle.org/en/Roles_and_permissions`
   - *Fecha de Consulta:* Octubre de 2026.
   - *Requisito Fundamentado:* Fundamenta la arquitectura de contextos, asignaciones institucionales, cargos y delegación temporal de capacidades en entornos educativos (Subcapacidades 4.2 y 6.1).

4. **PowerSchool SIS Security & Audit Documentation:**
   - *Entidad:* PowerSchool Group LLC.
   - *Dirección Electrónica:* `https://www.powerschool.com/solutions/student-information-system/`
   - *Fecha de Consulta:* Octubre de 2026.
   - *Requisito Fundamentado:* Fundamenta el aislamiento de expedientes estudiantiles, la trazabilidad de sustituciones docentes y las políticas de retención de registros educativos.
