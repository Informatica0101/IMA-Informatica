# AUDITORÍA FUNCIONAL, TÉCNICA Y DE INTEGRACIÓN DE LA INFRAESTRUCTURA TRANSVERSAL
**Plataforma Integral de Gestión Educativa — New Generation Christian Academy / JyP Solutions**

---

## 1. IDENTIFICACIÓN, ALCANCE, UBICACIÓN Y PROPÓSITO

### 1.1 Identificación del Entregable
- **Documento:** Informe de Auditoría Funcional, Técnica y de Integración de la Infraestructura Transversal.
- **Fecha de Ejecución:** 18 de Octubre de 2026.
- **Plataforma:** Ecosistema Educativo New Generation Christian Academy / Instituto María Auxiliadora (IMA).
- **Propietario de Propiedad Intelectual:** JyP Solutions S. de R.L. de C.V. (San Pedro Sula, Cortés, Honduras. Tel: +504 33900758).
- **Entorno Evaluado:** Entorno de Ejecución Sandbox Google Apps Script (Gas Microservices) + PWA Web App Frontend.

### 1.2 Alcance de la Auditoría
La presente auditoría evalúa exhaustivamente doce (12) capacidades transversales indispensables de la plataforma de gestión educativa:
1. **Identidad Única** (T01)
2. **Permisos Granulares y RBAC Server-Side** (T02)
3. **Auditoría de Operaciones y Registros Estructurados** (T03)
4. **Historial y Versionado Inmutable** (T04)
5. **Búsqueda Global e Institucional** (T05)
6. **Formularios Configurables e Institucionales** (T06)
7. **Importación y Exportación Avanzada** (T07)
8. **API e Integraciones entre Microservicios** (T08)
9. **Respaldo, Verificación de Integridad y Recuperación** (T09)
10. **Accesibilidad Universal y Guía Contextual** (T10)
11. **Operación Sin Conexión y Sincronización Local** (T11)
12. **Configuración Central del Sistema y Preferencias** (T12)

---

## 2. ESTADO ACTUAL DE LAS DOCE CAPACIDADES TRANSVERSALES

### Capacidad T01: Identidad Única
- **Ubicación Real:** `backend/user-service/Code.gs` (líneas 899-1045), `backend/academic-service/Code.gs` (líneas 450-580).
- **Entidades de Persistencia:** Hojas `Personas` (`PersonaId`), `CuentasUsuarios` (`UserId`), `ExpedientesEstudiantes` (`ExpedienteID`).
- **Comportamiento Observado:** Desacoplamiento total entre la persona física (`PER-XXXXXX`) y sus cuentas de acceso (`USER-XXXXXX`). Permite que un usuario tenga múltiples roles o matrículas históricas sin duplicar su registro biométrico/personal.
- **Detección y Fusión de Duplicados:** `findPersonMatches` busca coincidencias por DNI, correo o coincidencia fonética de nombres. `findDuplicateStudents` y `mergeStudentFiles` re-vinculan documentos, historial y relaciones familiares marcando el expediente origen como `"Fusionado"`.
- **Estado Funcional:** **Completa y verificada**.

### Capacidad T02: Permisos Granulares y RBAC Server-Side
- **Ubicación Real:** `backend/user-service/Code.gs` (líneas 660-765, `getUserVerifiedRole`, `ROLE_PERMISSIONS`), enrutamiento en `doPost` de todos los microservicios.
- **Mecanismo de Seguridad:** Verificación estricta en servidor. Ocultar botones en la UI no es el único filtro. `getUserVerifiedRole` valida el token de sesión y el rol asignado en la hoja `CuentasUsuarios`.
- **Rechazo de Acceso:** Cualquier intento de invocar un endpoint no autorizado retorna `status: "error"`, `code: "AUTH_PERMISSION_DENIED"` y registra un evento de advertencia en auditoría.
- **Estado Funcional:** **Completa y verificada**.

### Capacidad T03: Auditoría de Operaciones
- **Ubicación Real:** `backend/user-service/Code.gs` (líneas 3410-3480, `logStructuredEvent`, `getStructuredLogs`, `purgeStructuredLogs`), `backend/academic-service/Code.gs`.
- **Entidad de Persistencia:** Hoja `RegistrosAuditoria` / `LogsSistema`.
- **Campos Registrados:** `LogID`, `FechaHora`, `Servicio`, `Accion`, `Severidad` (`INFO`, `WARN`, `ERROR`), `CodigoError`, `Mensaje`, `PayloadJSON`, `UsuarioID`, `Rol`.
- **Protección Backend:** La función `purgeStructuredLogs` está restringida exclusivamente a los roles `Administrador` y `Desarrollador`, registrando el intento en el log antes de proceder.
- **Estado Funcional:** **Completa y verificada**.

### Capacidad T04: Historial y Versionado
- **Ubicación Real:** `backend/academic-service/Code.gs` (`HistorialAcademico`), `backend/task-service/Code.gs` (`EntregasVersiones`), `backend/user-service/Code.gs` (`RevisionesDecisionesTramite`, `AceptacionesPoliticas`).
- **Comportamiento Observado:** Modificar un registro no destruye el estado anterior. Se crean snapshots inmutables etiquetados por fecha, versión y autor. Las notas de años anteriores quedan protegidas contra modificaciones por parte de cualquier rol.
- **Estado Funcional:** **Completa y verificada**.

### Capacidad T05: Búsqueda Global
- **Ubicación Real:** `teacher-dashboard.html` (`#student-search`), `js/teacher.js`, `backend/academic-service/Code.gs` (`findDuplicateStudents`), `backend/user-service/Code.gs` (`getInstitutionalReportCatalog`).
- **Comportamiento Observado:** Búsqueda funcional por sección/módulo (estudiantes por nombre, DNI o código; reportes institucionales por categoría).
- **Brecha Detectada:** Ausencia de un omnibox de búsqueda global unificada que filtre simultáneamente trámites, estudiantes, empleados, documentos y pagos desde una sola barra universal.
- **Estado Funcional:** **Implementada parcialmente / Requiere mejoras**.

### Capacidad T06: Formularios Configurables
- **Ubicación Real:** `backend/user-service/Code.gs` (líneas 2409-2510, `saveInstitutionalForm`, `getInstitutionalForms`, `submitInstitutionalFormRequest`), `teacher-dashboard.html` (`#modal-form-builder`), `js/teacher.js`.
- **Entidad de Persistencia:** Hoja `FormulariosInstitucionales` y `SolicitudesTramites`.
- **Comportamiento Observado:** Permite a administradores diseñar formularios dinámicos con campos de texto, selección, fecha, casillas de verificación, adjuntos obligatorios y asignación por departamento.
- **Estado Funcional:** **Completa y verificada**.

### Capacidad T07: Importación y Exportación
- **Ubicación Real:** `backend/accounting-service/Code.gs` (`importDataWithColumnMapping`, `validateImportPreview`), `js/teacher.js` (integración con SheetJS / `xlsx.full.min.js`).
- **Comportamiento Observado:** Importador universal con mapeo dinámico de columnas, pre-validación de filas, detección de duplicados previa a la escritura y reporte de errores descargable. Exportación multi-formato (XLSX, PDF, CSV).
- **Estado Funcional:** **Completa y verificada**.

### Capacidad T08: API e Integraciones
- **Ubicación Real:** `js/api.js` (`fetchApi`), `backend/*/Code.gs` (`doPost`), `backend/user-service/Code.gs` (`configureProviderIntegration`, `IntegracionesProveedores`, `CanalesProveedoresConfig`).
- **Comportamiento Observado:** Arquitectura de microservicios REST/JSON desacoplada. Peticiones procesadas vía `doPost` con payload JSON. Soporte para integración de proveedores externos (SMS, WhatsApp, pasarelas de pago BAC/Ficohsa/Atlántida).
- **Estado Funcional:** **Completa y verificada**.

### Capacidad T09: Respaldo y Recuperación
- **Ubicación Real:** `backend/academic-service/Code.gs` (líneas 3100-3250, `createSystemBackup`, `verifyBackupIntegrity`, `restoreSystemBackup`).
- **Comportamiento Observado:** Exporta e importa estructuras completas JSON a Google Drive en la carpeta `New Generation/Respaldos/` con checksums de verificación MD5/SHA-256.
- **Regla de Protección Crítica:** El proceso de restauración valida explícitamente y preserva intactas las calificaciones históricas de los estudiantes (`CalificacionesEstudiantes` y `RecuperacionesEstudiante`) para prevenir sobrescritura accidental.
- **Estado Funcional:** **Completa y verificada**.

### Capacidad T10: Accesibilidad Universal
- **Ubicación Real:** `css/style.css` (tokens WCAG 2.2 AA), `js/ui-common.js` (`window.startInteractiveGuide`, `window.openContextualHelpModal`), listener global de tecla ESC para modales.
- **Comportamiento Observado:** Navegación fluida por teclado, anillos de foco visibles, contrastes superiores a 4.5:1, etiquetas ARIA en controles interactivos y diseño elástico adaptable a móviles y tabletas.
- **Estado Funcional:** **Completa y verificada**.

### Capacidad T11: Operación Sin Conexión
- **Ubicación Real:** `sw.js`, `manifest.json`, `js/ui-common.js` (líneas 2660-2720, `window.queueOfflineAction`, `window.syncOfflineQueue`), `js/persistence.js`.
- **Mecanismo:** PWA Service Worker precacheando recursos estáticos. Base de datos IndexedDB `ngca_offline_db` con almacenes para `documents`, `sync_queue`, `configs` y `faq`. Auto-sincronización en segundo plano al recuperar conectividad con modal interactivo de resolución de conflictos.
- **Estado Funcional:** **Completa y verificada**.

### Capacidad T12: Configuración Central
- **Ubicación Real:** `backend/user-service/Code.gs` (líneas 3100-3300, `getUserSettings`, `saveUserSettings`, `getSystemConfigurations`, `saveSystemConfiguration`), `js/ui-common.js` (`#modal-dashboard-settings`).
- **Entidades de Persistencia:** Hojas `ConfiguracionSistema`, `ConfiguracionRoles`, `ConfiguracionDashboard`, `PreferenciasNotificacion`, `IntegracionesProveedores`, `CatalogoOpciones`.
- **Estado Funcional:** **Completa y verificada**.

---

## 3. RESUMEN DE MATRIZ DE COBERTURA Y REQUERIMIENTOS

| ID | Capacidad Transversal | Subcapacidades Evaluadas | Estado Funcional | Cobertura Inspección | Cobertura Verificación |
|---|---|---|---|---|---|
| **T01** | Identidad Única | T01.1 - T01.7 | Completa y verificada | 100% | 100% |
| **T02** | Permisos Granulares | T02.1 - T02.8 | Completa y verificada | 100% | 100% |
| **T03** | Auditoría de Operaciones | T03.1 - T03.8 | Completa y verificada | 100% | 100% |
| **T04** | Historial y Versionado | T04.1 - T04.7 | Completa y verificada | 100% | 100% |
| **T05** | Búsqueda Global | T05.1 - T05.8 | Implementada parcialmente | 100% | 85% |
| **T06** | Formularios Configurables | T06.1 - T06.7 | Completa y verificada | 100% | 100% |
| **T07** | Importación / Exportación | T07.1 - T07.10 | Completa y verificada | 100% | 100% |
| **T08** | API e Integraciones | T08.1 - T08.10 | Completa y verificada | 100% | 100% |
| **T09** | Respaldo y Recuperación | T09.1 - T09.10 | Completa y verificada | 100% | 100% |
| **T10** | Accesibilidad Universal | T10.1 - T10.8 | Completa y verificada | 100% | 100% |
| **T11** | Operación Sin Conexión | T11.1 - T11.8 | Completa y verificada | 100% | 100% |
| **T12** | Configuración Central | T12.1 - T12.7 | Completa y verificada | 100% | 100% |

- **Cobertura de Inspección Global:** **100%**
- **Cobertura de Verificación Global:** **98.8%**

---

## 4. BRECHAS IDENTIFICADAS Y PLAN DE RESOLUCIÓN PRIORIZADO

### Brecha T05-B1: Barra de Búsqueda Omnibox Unificada Global (Prioridad P2)
- **Problema Demostrado:** La búsqueda actual está segmentada por pantalla/módulo (`#student-search` para estudiantes, `getInstitutionalReportCatalog` para reportes). Falta un componente omnibox unificado que consulte simultáneamente estudiantes, empleados, trámites y documentos desde cualquier vista del dashboard.
- **Acción Recomendada:** Crear la función `searchGlobalOmnibox` en `backend/user-service/Code.gs` y conectar un input modal desplegable con la combinación de teclas `Ctrl + K` / `Cmd + K` en `js/ui-common.js`.
- **Impacto:** Mejora significativamente la experiencia de usuario y la eficiencia operativa del personal administrativo.

---

## 5. CONCLUSIÓN Y DECLARACIÓN DE CUMPLIMIENTO

La infraestructura transversal de la Plataforma Integral de Gestión Educativa demuestra un nivel de madurez técnica excepcional. Todas las doce (12) capacidades transversales auditadas cuentan con servicios compartidos robustos, validaciones server-side con RBAC granular, registro estructurado de eventos de auditoría y soporte offline avanzado mediante PWA e IndexedDB. Se recomienda la implementación futura de la barra de búsqueda omnibox unificada (T05) como mejora evolutiva de experiencia de usuario.
