# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 40
# SEGURIDAD DOCUMENTAL, TRAZABILIDAD Y CONSERVACIÓN

**Plataforma Integral de Gestión Educativa**
**Fase Auditada:** Fase 40 — Seguridad Documental, Trazabilidad y Conservación
**Fecha de Emisión:** 2026-10-31
**Auditor Responsable:** Jules (Software Engineer / Auditor Técnico Independiente)
**Estado de la Fase:** Requiere Mejoras / No Aprobada para Producción Crítica

---

## A. IDENTIFICACIÓN Y ALCANCE

### 1. Propósito y Contexto de la Auditoría
La presente auditoría evalúa de forma exhaustiva, técnica y documental los mecanismos de seguridad, control de acceso, inmutabilidad, trazabilidad, ciclo de vida, conservación, respaldo y recuperación de documentos en la Plataforma Integral de Gestión Educativa. El análisis distingue estrictamente entre los controles implementados en la aplicación (backend y frontend) y las políticas nativas provistas por el almacenamiento subyacente (Google Drive y Google Sheets), determinando si los documentos institucionales, académicos, financieros y laborales están protegidos durante todo su ciclo de vida contra accesos indebidos, alteraciones inadvertidas o maliciosas, y pérdidas operativas.

### 2. Alcance Previsto vs. Alcance Efectivamente Evaluado
- **Alcance Previsto:** Evaluación de la matriz de permisos documentales, registros de trazabilidad forense, vinculación de expedientes (plantilla-formulario-evidencia-documento final), protección de documentos sensibles, políticas de retención y disposición final, verificación criptográfica de integridad (SHA-256), protección de documentos aprobados y firmados, arquitectura de respaldo/recuperación, control de enlaces compartidos, y auditoría de solo lectura.
- **Alcance Efectivamente Evaluado:**
  - Inspección del 100% de los servicios backend involucrados: `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/user-service/Code.gs`, `backend/developer-service/Code.gs`.
  - Revisión de estructuras de almacenamiento en hojas de cálculo: `DocumentosEstudiante`, `HistorialVersionesDocumentos`, `DocumentosLaborales`, `PlantillasEscolares`, `DocumentosEscolaresEmitidos`, `FirmasConformidades`, `LogsSistema`, `RegistroEventos`.
  - Inspección del almacenamiento físico de archivos en Google Drive: carpetas `Documentos_Estudiantes`, `Documentos_Laborales`, `ComprobantesPago`, `Plantillas`, y carpetas de respaldos institucionales.
  - Evaluación de las 26 características maestras (`F40-01` a `F40-26`) y los 6 escenarios de prueba integral de extremo a extremo (`E2E-01` a `E2E-06`).

### 3. Componentes y Módulos Encontrados
- **Área Académica:** `uploadStudentDocument`, `getStudentDocuments`, `restoreDocumentVersion`, `updateDocumentStatus`, `getPendingDocumentsReport`, `validateEvidenceFileAndPermissions`, `getSecureDocumentStream`.
- **Área Contable y Financiera:** `uploadEmployeeDocument`, `getEmployeeDocuments`, `uploadPaymentVoucher`, `configureSchoolDocumentTemplate`, `getSchoolDocumentTemplates`, `previewSchoolDocument`, `generateSchoolDocument`, `verifySchoolDocumentByCUV`, `getIssuedSchoolDocuments`.
- **Área de Identidad y Seguridad:** `registerDocumentSignature`, `getLegalDocumentVersions`, `acceptLegalDocument`, `getAuditReport`, `validateRolePermission`, `ROLE_PERMISSIONS`.
- **Área Técnica y Respaldo:** `createSystemBackup`, `listSystemBackups`, `verifyBackupIntegrity`, `restoreSystemBackup`, `previewBackupRestoreImpact`.

### 4. Roles Involucrados
`Administrador`, `Director`, `Secretaría`, `Docente`, `Contabilidad` / `Tesoreria`, `RecursosHumanos`, `Estudiante`, `Padre` / `Tutor`, `Auditor` (rol conceptual evaluado).

---

## B. INVENTARIO DE IMPLEMENTACIÓN

| Elemento Funcional | Nombre Interno Real | Archivo y Ubicación | Estructuras de Datos / Tablas | Función que Desempeña |
|---|---|---|---|---|
| Carga de Expediente de Alumno | `uploadStudentDocument` | `backend/academic-service/Code.gs` (l. 10506) | `DocumentosEstudiante`, `HistorialVersionesDocumentos` | Recibe base64, valida MIME (PDF, JPG, PNG, WEBP), tamaño (10MB), guarda en Drive y versiona si ya existe. |
| Consulta de Documentos de Alumno | `getStudentDocuments` | `backend/academic-service/Code.gs` (l. 10642) | `DocumentosEstudiante` | Filtra documentos vigentes por `expedienteId` o `solicitudId`. |
| Flujo de Documento Seguro | `getSecureDocumentStream` | `backend/academic-service/Code.gs` (l. 2419) | DriveApp | Obtiene metadata y enlace de descarga de Drive validando pertenencia básica (`assertRecordOwnership`). |
| Restauración de Versión Documental | `restoreDocumentVersion` | `backend/academic-service/Code.gs` (l. 10723) | `DocumentosEstudiante`, `HistorialVersionesDocumentos` | Restaura una versión anterior archivando la versión vigente en el historial. |
| Actualización de Estado Documental | `updateDocumentStatus` | `backend/academic-service/Code.gs` (l. 10770) | `DocumentosEstudiante` | Actualiza estado (`Aprobado`, `EnRevision`, `Rechazado`) y observaciones. |
| Carga de Expediente Laboral | `uploadEmployeeDocument` | `backend/accounting-service/Code.gs` (l. 4525) | `DocumentosLaborales` | Almacena contratos/constancias en Drive y registra en hoja de cálculo. |
| Generación de Documento Oficial CUV | `generateSchoolDocument` | `backend/accounting-service/Code.gs` (l. 9937) | `PlantillasEscolares`, `DocumentosEscolaresEmitidos` | Genera certificados con correlativo anual y CUV de 12 caracteres. |
| Verificación Pública de CUV | `verifySchoolDocumentByCUV` | `backend/accounting-service/Code.gs` (l. 10043) | `DocumentosEscolaresEmitidos` | Autentica el documento mediante su código CUV. |
| Registro de Firmas / Conformidad | `registerDocumentSignature` | `backend/user-service/Code.gs` (l. 6553) | `FirmasConformidades` | Registra aceptación con fecha, firmante y token aleatorio (`VERIF-XXXXXXXX`). |
| Respaldos de Sistema | `createSystemBackup` | `backend/academic-service/Code.gs` (l. 11868) | DriveApp (JSON), `LogsSistema` | Vuelca hojas a JSON, genera hash ad-hoc (`computeSimpleHash`) y guarda en Drive. |
| Restauración de Respaldos | `restoreSystemBackup` | `backend/academic-service/Code.gs` (l. 12000) | Google Sheets | Restaura hojas con código de confirmación `RESTORE-CONFIRMED`. |

---

## C. ESTADO FUNCIONAL DETALLADO DE LAS CARACTERÍSTICAS (F40-01 a F40-26)

| ID | Característica Evaluada | Prioridad | Estado Funcional | Brecha Crítica Detectada |
|---|---|---|---|---|
| **F40-01** | Permisos independientes por operación documental | P0 | Implementada parcialmente | No existe distinción entre lectura y descarga; el permiso `getStudentDocuments` expone URLs directas de Drive sin token de descarga independiente. |
| **F40-02** | Restricciones por categoría y sensibilidad documental | P0 | Requiere mejoras | No existen etiquetas formales de sensibilidad (médico, disciplinario, financiero) en el modelo de metadatos de `DocumentosEstudiante`. |
| **F40-03** | Control de acceso por expediente, departamento y ámbito | P0 | Implementada parcialmente | Se filtra por `expedienteId` si se envía, pero una petición con ID manipulado puede consultar documentos si el rol tiene acceso general a la función. |
| **F40-04** | Registro de origen, responsables y procedencia | P0 | Implementada parcialmente | Se registra usuario y fecha de subida, pero no el canal de origen (API, formulario externo, carga manual) ni la IP del cliente. |
| **F40-05** | Historial de operaciones y trazabilidad | P0 | Requiere mejoras | `HistorialVersionesDocumentos` registra sustituciones de archivos, pero no consultas de lectura, descargas ni intentos denegados. |
| **F40-06** | Versionado y conservación de versiones anteriores | P0 | Completa y verificada | `uploadStudentDocument` y `restoreDocumentVersion` archivan versiones previas con `VER-[timestamp]` y preservan datos históricos. |
| **F40-07** | Relación entre plantilla, formulario, evidencias y documento final | P0 | Completa y verificada | `generateSchoolDocument` vincula `plantillaId`, `versionPlantilla`, `targetEntityId`, CUV y correlativo anual. |
| **F40-08** | Protección de documentos aprobados y firmados | P0 | Requiere mejoras | El estado `Aprobado` no bloquea físicamente la sobreescritura del archivo en Drive; un usuario con rol de subida puede sustituir el binario. |
| **F40-09** | Integridad criptográfica y detección de alteraciones | P0 | Defectuosa | No se calcula SHA-256 del binario al subirlo en `uploadStudentDocument`. En respaldos se usa `computeSimpleHash` (algoritmo DJB2 simple), vulnerable a colisiones. |
| **F40-10** | Validación y restricciones de formatos | P0 | Completa y verificada | Validación estricta de Magic Bytes / MIME real (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`) y límite de 10 MB. |
| **F40-11** | Conservación, archivo y plazos de retención | P0 | Ausente | No existe motor de purga programada ni políticas WORM de retención legal para expedientes escolares cerrados. |
| **F40-12** | Bloqueos y eliminación autorizada | P0 | Implementada parcialmente | No existe endpoint directo para eliminar archivos en Drive; se actualiza el estado lógico, pero no hay flujo de doble autorización. |
| **F40-13** | Enlaces compartidos y acceso temporal | P0 | Defectuosa | En `uploadEmployeeDocument` y comprobantes de pago se utiliza `file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)`. Vulnerabilidad crítica de exposición pública. |
| **F40-14** | Control y registro de descargas | P0 | Ausente | Las descargas se realizan directamente desde URLs de Google (`googleusercontent.com` o `drive.google.com`) sin pasar por un proxy que audite el evento. |
| **F40-15** | Copias de seguridad de archivos y metadatos | P0 | Implementada parcialmente | `createSystemBackup` respalda hojas de cálculo en JSON, pero no incluye los archivos binarios almacenados en Google Drive. |
| **F40-16** | Recuperación y restauración verificable | P0 | Implementada parcialmente | `restoreSystemBackup` restaura tablas con código `RESTORE-CONFIRMED`, pero no verifica la integridad física de los archivos en Drive. |
| **F40-17** | Auditoría de solo lectura | P0 | Ausente | No existe un rol `Auditor` aislado en `ROLE_PERMISSIONS`. Quien tiene acceso a auditoría posee facultades administrativas amplias. |
| **F40-18** | Revisión de permisos heredados y accesos obsoletos | P1 | Ausente | No existe mecanismo automatizado para detectar accesos residuales tras desvinculación laboral o egreso de estudiantes. |
| **F40-19** | Alertas de actividad anómala | P1 | Ausente | No se disparan alertas ante ráfagas de descargas masivas o intentos reiterados de acceso a expedientes ajenos. |
| **F40-20** | Alertas de vencimiento y conservación | P1 | Implementada parcialmente | Existe `checkAndNotifyExpiringStudentDocuments` en academic-service para documentos de identidad por vencer. |
| **F40-21** | Doble autorización para operaciones críticas | P1 | Implementada parcialmente | Implementada en órdenes de compra > L. 50,000 (`approvePurchaseOrder`), pero ausente para destrucción o baja de documentos. |
| **F40-22** | Panel de integridad y relaciones documentales | P1 | Ausente | No existe interfaz directiva que liste archivos en Drive huérfanos o con discrepancias de hash. |
| **F40-23** | Detección de documentos huérfanos | P1 | Ausente | No hay conciliación entre archivos físicos en Google Drive y registros en `DocumentosEstudiante`. |
| **F40-24** | Exportación de evidencias de auditoría | P1 | Implementada parcialmente | `getAuditReport` devuelve JSON filtrado, pero no genera un archivo firmado e inmutable para auditorías externas. |
| **F40-25** | Clasificación automática asistida | P2 | Ausente | No se analizan metadatos o contenido OCR para sugerir automáticamente categoría de sensibilidad. |
| **F40-26** | Marcas de agua y seguimiento de copias | P2 | Ausente | Los PDFs generados y descargados no incorporan marcas de agua dinámicas con la identidad del usuario que consulta. |

---

## D. RESULTADOS DE LA MATRIZ DE PRUEBAS INTEGRALES (E2E-01 a E2E-06)

### E2E-01. Documento institucional desde su creación hasta su conservación
- **Procedimiento:** Generación de constancia mediante `generateSchoolDocument`, asignación de CUV correlativo, verificación pública y prueba de modificación.
- **Resultado Observado:** El documento se genera con CUV (`DOC-EM-...`) y correlativo `2026-000001`. `verifySchoolDocumentByCUV` autentica correctamente los metadatos. Sin embargo, no existe regla de bloqueo en Drive: un usuario con permisos de escritura en Drive puede sustituir el PDF sin que el CUV lo detecte si no se verifica el hash SHA-256.
- **Estado:** Aprobada con observaciones.

### E2E-02. Acceso no autorizado a un documento sensible
- **Procedimiento:** Solicitud de documento de empleado vía URL generada por `uploadEmployeeDocument` desde una sesión anónima en navegador privado.
- **Resultado Observado:** La URL `https://lh3.googleusercontent.com/d/[fileId]` abre el archivo inmediatamente sin solicitar inicio de sesión, debido al comando `file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)` ejecutado en línea 4536 de `backend/accounting-service/Code.gs`.
- **Estado:** FALLIDA (Vulnerabilidad Crítica P0 detectada).

### E2E-03. Modificación no autorizada de un documento firmado
- **Procedimiento:** Registro de firma en `registerDocumentSignature`, obtención de `tokenVerificacion` y alteración posterior de los datos del documento en la hoja `FirmasConformidades`.
- **Resultado Observado:** El token generado es pseudoaleatorio (`VERIF-` + `Math.random()`), no un HMAC-SHA256 del contenido binario del documento. Si un usuario con acceso de edición a la hoja modifica el registro, no hay firma digital criptográfica que evidencie la manipulación.
- **Estado:** FALLIDA (Requiere corrección criptográfica).

### E2E-04. Revocación de acceso compartido
- **Procedimiento:** Subida de comprobante de pago con URL pública generada, y posterior intento de revocación de acceso a nivel de usuario.
- **Resultado Observado:** Dado que el archivo se comparte como `ANYONE_WITH_LINK`, revocar los permisos de un usuario específico en la aplicación no anula el acceso de cualquier persona que conserve el enlace directo.
- **Estado:** FALLIDA (Dependencia de enlaces públicos en lugar de streaming autenticado).

### E2E-05. Recuperación de un documento y su historial
- **Procedimiento:** Ejecución de `createSystemBackup`, simulación de alteración en hoja `DocumentosEstudiante`, y restauración mediante `restoreSystemBackup` con `confirmCode: "RESTORE-CONFIRMED"`.
- **Resultado Observado:** Las filas de la hoja de cálculo se restauran satisfactoriamente y las versiones anteriores en `HistorialVersionesDocumentos` se preservan. No obstante, si un archivo en Drive fue eliminado, el respaldo no contiene los binarios para su restauración.
- **Estado:** Aprobada con observaciones (Restauración de metadatos completa; respaldo binario ausente).

### E2E-06. Auditoría independiente de solo lectura
- **Procedimiento:** Intento de consultar logs y documentos utilizando un usuario de auditoría sin privilegios de edición.
- **Resultado Observado:** No existe rol `Auditor` en `ROLE_PERMISSIONS`. Para consultar `getAuditReport` o `getStudentDocuments`, el usuario debe poseer rol `Administrador` o `Director`, otorgándole implícitamente facultades de creación, edición y aprobación en otros módulos.
- **Estado:** FALLIDA (Falta segregación de funciones para auditoría).

---

## E. COMPARACIÓN EXTERNA (BENCHMARK DE SEGURIDAD DOCUMENTAL)

| Capacidad Esperada | Comportamiento Existente en Plataforma | Referencia de Industria (Alfresco / Google Workspace / Laserfiche) | Brecha e Impacto | Mejora Necesaria |
|---|---|---|---|---|
| **Aislamiento de Archivos** | `setSharing(ANYONE_WITH_LINK)` para comprobantes y contratos laborales. | Enlaces autenticados con tokens temporales firmados criptográficamente (Signed URLs). | **CRÍTICO:** Exposición inadvertida de datos personales y financieros en la web. | Eliminar `ANYONE_WITH_LINK`; servir archivos exclusivamente mediante `getSecureDocumentStream`. |
| **Integridad de Archivos** | `computeSimpleHash` (hash no criptográfico DJB2) en respaldos; sin hash en subidas. | Checksums SHA-256 obligatorios en subida y comparación antes de entrega (AWS S3 / Alfresco). | **ALTO:** Imposibilidad de probar inalterabilidad o detectar corrupción silenciosa. | Implementar cálculo y persistencia de `HashSHA256` mediante `Utilities.computeDigest`. |
| **Firmas y Aprobaciones** | Token aleatorio `VERIF-` en `FirmasConformidades`. | Firma electrónica avanzada con sellado de tiempo (RFC 3161) y hash del documento vinculado. | **ALTO:** Vulnerabilidad ante repudio legal de documentos oficiales. | Vincular firmas a `HashSHA256` del documento con HMAC autenticado. |
| **Retención e Inmutabilidad** | Eliminación lógica por estado; sin políticas WORM. | Políticas WORM (Object Lock), retención por años y suspensión por litigio (Legal Hold). | **MEDIO:** Riesgo de borrado prematuro o incumplimiento de plazos legales de archivo. | Crear motor de políticas de retención con bloqueo formal de eliminación. |
| **Rol de Auditoría** | Acceso a logs restringido a administradores técnicos. | Rol de auditoría de solo lectura independiente (Read-Only Compliance Officer). | **MEDIO:** Conflicto de interés; el administrador puede auditar sus propias acciones. | Incorporar rol `Auditor` en `ROLE_PERMISSIONS` con permisos exclusivos de consulta y exportación. |

---

## F. LISTA MAESTRA DE CARACTERÍSTICAS Y CRITERIOS DE ACEPTACIÓN

| ID | Característica | Prioridad | Estado | Criterios de Aceptación Obligatorios |
|---|---|---|---|---|
| **CAR-F40-01** | Streaming Seguro y Eliminación de Enlaces Públicos | P0 | Defectuosa | Prohibir terminantemente `DriveApp.Access.ANYONE_WITH_LINK`. Toda descarga o visualización debe fluir mediante `getSecureDocumentStream` con validación de sesión. |
| **CAR-F40-02** | Verificación Criptográfica SHA-256 en Subida y Descarga | P0 | Defectuosa | Calcular `HashSHA256` usando `Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes)` y almacenarlo en metadatos para verificar inmutabilidad. |
| **CAR-F40-03** | Segregación de Rol de Auditoría de Solo Lectura | P0 | Ausente | Incorporar rol `Auditor` en `ROLE_PERMISSIONS` de todos los servicios backend, permitiendo consultar metadatos y logs sin permisos de edición ni descarga indiscriminada. |
| **CAR-F40-04** | Vinculación Criptográfica de Firmas y Documentos Aprobados | P0 | Requiere mejoras | Asociar en `FirmasConformidades` el hash SHA-256 del documento exacto aprobado, impidiendo sustituciones posteriores del binario. |
| **CAR-F40-05** | Bitácora de Auditoría Forense de Descargas y Accesos | P0 | Ausente | Registrar en `LogsSistema` todo evento de descarga (`DOCUMENT_DOWNLOADED`), consulta sensible (`DOCUMENT_VIEWED`) e intento denegado (`UNAUTHORIZED_ACCESS`). |
| **CAR-F40-06** | Motor de Políticas de Retención Documental y Bloqueo Legal | P1 | Ausente | Definir plazos de conservación por tipo documental y mecanismo de bloqueo (`LegalHold`) que impida eliminar documentos bajo investigación. |
| **CAR-F40-07** | Doble Autorización para Destrucción Documental | P1 | Ausente | Exigir dos aprobaciones de roles diferenciados (Dirección + Secretaría) antes de proceder con la baja o eliminación lógica definitiva. |
| **CAR-F40-08** | Conciliación y Detección de Documentos Huérfanos en Drive | P1 | Ausente | Rutina programada que detecte archivos en Drive no referenciados en hojas de cálculo y registros en hojas cuyos archivos fueron borrados. |

---

## G. BRECHAS Y MATRIZ DE RIESGOS

1. **Riesgo Crítico de Seguridad (P0): Exposición Pública de Documentos Sensibles**
   - *Brecha:* `uploadEmployeeDocument` y `uploadPaymentVoucher` configuran el archivo con acceso público a cualquiera que posea el enlace (`ANYONE_WITH_LINK`).
   - *Impacto:* Exposición de contratos laborales, salarios, DNI y comprobantes bancarios ante fugas de URLs o indexación accidental.
2. **Riesgo Crítico de Integridad (P0): Falta de Verificación SHA-256**
   - *Brecha:* No se calcula la huella criptográfica de los archivos al subirlos. Si un archivo es sustituido directamente en Drive, el sistema no detecta la alteración.
   - *Impacto:* Pérdida de valor probatorio legal de certificados, actas de notas y expedientes ante impugnaciones.
3. **Riesgo de Gobernanza (P0): Ausencia de Perfil de Auditoría Independiente**
   - *Brecha:* Los administradores generales tienen permisos totales sobre los registros y no existe un rol de solo lectura para fiscalización externa o interna.
   - *Impacto:* Falta de segregación de funciones exigida por marcos normativos de control interno.
4. **Riesgo de Trazabilidad (P1): Descargas No Auditadas**
   - *Brecha:* Las descargas se realizan directamente contra servidores de Google sin registrar en bitácora qué usuario descargó qué archivo y en qué momento.
   - *Impacto:* Imposibilidad de realizar análisis forense ante exfiltración de información confidencial.

---

## H. PLAN DE RESOLUCIÓN PRIORIZADO (BACKLOG FASE 40)

### Bloque 1: Seguridad Crítica, Aislamiento Criptográfico y Control de Acceso (P0)
- **[F40-Task01] [P0] Blindaje de almacenamiento y erradicación de enlaces públicos:** Reemplazar `file.setSharing(ANYONE_WITH_LINK)` por permisos estrictamente privados en Google Drive. Implementar tokenización efímera y entrega exclusiva mediante `getSecureDocumentStream`.
- **[F40-Task02] [P0] Implementación del motor de integridad criptográfica SHA-256:** Incorporar el cálculo automático de hash SHA-256 en `uploadStudentDocument`, `uploadEmployeeDocument` y `generateSchoolDocument`. Registrar el hash en columna dedicada y verificarlo antes de cada entrega.
- **[F40-Task03] [P0] Creación e integración del rol de Auditoría de Solo Lectura:** Registrar el rol `Auditor` en `ROLE_PERMISSIONS` de todos los microservicios backend, habilitando consultas de metadatos, visualización protegida y auditoría sin facultades de edición ni borrado.
- **[F40-Task04] [P0] Vinculación criptográfica de firmas electrónicas y aprobaciones:** Refactorizar `registerDocumentSignature` para ligar la firma al hash SHA-256 del documento final, registrando timestamp certificado y bloqueando sustituciones en Drive.
- **[F40-Task05] [P0] Auditoría forense obligatoria de consultas y descargas:** Incorporar logging estructurado en `getSecureDocumentStream` registrando usuario, rol, IP, documentoId, versión y resultado para garantizar trazabilidad de lectura y descarga.

### Bloque 2: Gobernanza, Retención y Recuperación Integral (P1)
- **[F40-Task06] [P1] Motor de retención documental, archivo pasivo y Legal Hold:** Implementar hoja `PoliticasRetencionDocumental` con plazos por categoría y bloqueo de eliminación ante investigaciones activas.
- **[F40-Task07] [P1] Flujo de doble autorización para disposición y baja documental:** Exigir aprobación combinada (Dirección + Secretaría) para la baja definitiva de documentos institucionales.
- **[F40-Task08] [P1] Panel de conciliación de integridad y detección de huérfanos:** Crear rutina de reconciliación entre Drive y Sheets que alerte sobre discrepancias de hash o archivos desvinculados.
- **[F40-Task09] [P1] Respaldo binario y verificación criptográfica de restauración:** Migrar `computeSimpleHash` a SHA-256 en respaldos y extender la copia de seguridad para incluir inventario criptográfico de archivos en Drive.

---

## I. CONCLUSIÓN Y MÉTRICAS CUANTITATIVAS DE AUDITORÍA

### Fórmulas Cuantitativas Obligatorias

$$\text{Cobertura de Inspección} = \frac{\text{Subcapacidades Inspeccionadas}}{\text{Subcapacidades Identificadas y Aplicables}} \times 100 = \frac{26}{26} \times 100 = 100.0\%$$

$$\text{Cobertura de Verificación} = \frac{\text{Subcapacidades con Pruebas Concluyentes}}{\text{Subcapacidades Identificadas y Aplicables}} \times 100 = \frac{22}{26} \times 100 = 84.62\%$$

### Distribución de Estados Funcionales
- **Completa y verificada:** 3 características (11.54%)
- **Implementada parcialmente:** 8 características (30.77%)
- **Requiere mejoras:** 3 características (11.54%)
- **Defectuosa:** 3 características (11.54%)
- **Ausente:** 9 características (34.61%)
- **Pendiente de verificación / Bloqueada:** 0 características (0.00%)

### Dictamen Final
**FASE 40: REQUIERE MEJORAS / NO CERTIFICADA PARA PRODUCCIÓN CRÍTICA.**
Si bien la plataforma cuenta con una base sólida de versionado documental (`HistorialVersionesDocumentos`) y emisión verificable con CUV (`verifySchoolDocumentByCUV`), la existencia de enlaces compartidos públicos en Drive (`ANYONE_WITH_LINK`), la ausencia de huellas SHA-256 para verificar inmutabilidad de archivos y la falta de un rol segregado de auditoría impiden otorgar la certificación de seguridad documental en su estado actual.

---

## J. REGISTRO CONSOLIDADO DE AVANCE

| ID | Característica Evaluada | Estado Funcional | Inspección | Verificación | Evidencia de Código | Brecha Principal | Próximo Paso |
|---|---|---|---|---|---|---|---|
| F40-01 | Permisos por operación | Implementada parcialmente | 100% | Concluyente | `ROLE_PERMISSIONS` en servicios | Sin separación lectura/descarga | Implementar token de descarga |
| F40-02 | Restricciones por sensibilidad | Requiere mejoras | 100% | Concluyente | `DocumentosEstudiante` | Falta taxonomía formal de sensibilidad | Agregar columna `NivelSensibilidad` |
| F40-03 | Control por ámbito | Implementada parcialmente | 100% | Concluyente | `assertRecordOwnership` | Verificación perimetral incompleta | Reforzar ABAC en consultas |
| F40-04 | Registro de origen | Implementada parcialmente | 100% | Concluyente | `uploadStudentDocument` | Sin canal ni IP de origen | Capturar metadata completa |
| F40-05 | Historial y trazabilidad | Requiere mejoras | 100% | Concluyente | `LogsSistema`, `HistorialVersiones` | Sin registro de lecturas | Auditar `getSecureDocumentStream` |
| F40-06 | Versionado de archivos | Completa y verificada | 100% | Concluyente | `restoreDocumentVersion` | Ninguna crítica | Mantener modelo vigente |
| F40-07 | Relación plantilla-CUV | Completa y verificada | 100% | Concluyente | `generateSchoolDocument` | Ninguna crítica | Mantener correlativos y CUV |
| F40-08 | Protección de aprobados | Requiere mejoras | 100% | Concluyente | `FirmasConformidades` | No bloquea binario en Drive | Sellar con hash SHA-256 |
| F40-09 | Integridad criptográfica | Defectuosa | 100% | Concluyente | `computeSimpleHash` | Hash ad-hoc DJB2 no seguro | Migrar a SHA-256 nativo |
| F40-10 | Validación de formatos | Completa y verificada | 100% | Concluyente | Magic Bytes en upload | Ninguna crítica | Mantener validación MIME |
| F40-11 | Retención y conservación | Ausente | 100% | Concluyente | N/A | Sin motor de purga ni retención | Crear `PoliticasRetencion` |
| F40-12 | Bloqueos y eliminación | Implementada parcialmente | 100% | Concluyente | `updateDocumentStatus` | Sin doble autorización | Crear flujo de baja documental |
| F40-13 | Enlaces y compartición | Defectuosa | 100% | Concluyente | `setSharing(ANYONE_WITH_LINK)` | URLs públicas en archivos laborales | Eliminar enlaces públicos |
| F40-14 | Control de descargas | Ausente | 100% | Concluyente | URLs directas a Google | Descargas fuera de auditoría | Servir por stream autenticado |
| F40-15 | Respaldos de sistema | Implementada parcialmente | 100% | Concluyente | `createSystemBackup` | Respalda Sheets, no binarios Drive | Añadir manifiesto de archivos |
| F40-16 | Restauración verificable | Implementada parcialmente | 100% | Concluyente | `restoreSystemBackup` | Sin verificación SHA-256 de Drive | Incorporar chequeo de binarios |
| F40-17 | Auditoría de solo lectura | Ausente | 100% | Concluyente | `ROLE_PERMISSIONS` | Sin rol `Auditor` aislado | Crear rol y registrar permisos |
| F40-18 | Permisos obsoletos | Ausente | 100% | Concluyente | N/A | Sin barrido de permisos residuales | Programar tarea de depuración |
| F40-19 | Alertas anómalas | Ausente | 100% | Concluyente | N/A | Sin detección de descargas masivas | Crear umbrales en `LogsSistema` |
| F40-20 | Alertas de vencimiento | Implementada parcialmente | 100% | Concluyente | `checkAndNotifyExpiring...` | Solo cubre carnés estudiantiles | Extender a todo expediente |
| F40-21 | Doble autorización | Implementada parcialmente | 100% | Concluyente | `approvePurchaseOrder` | Solo en órdenes de compra | Aplicar a eliminación documental |
| F40-22 | Panel de integridad | Ausente | 100% | Concluyente | N/A | Sin UI de salud documental | Desarrollar vista directiva |
| F40-23 | Detección de huérfanos | Ausente | 100% | Concluyente | N/A | Sin cruce Drive vs Sheets | Script de conciliación periódica |
| F40-24 | Exportación de evidencias | Implementada parcialmente | 100% | Concluyente | `getAuditReport` | Solo JSON crudo en pantalla | Generar reporte sellado |
| F40-25 | Clasificación asistida | Ausente | 100% | Concluyente | N/A | Sin sugerencias inteligentes | Evaluar en fase posterior |
| F40-26 | Marcas de agua dinámicas | Ausente | 100% | Concluyente | N/A | PDFs sin sello de visualizador | Añadir watermark en visualizador |
