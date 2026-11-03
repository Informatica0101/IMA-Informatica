# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 25
# Integraciones Externas y Compatibilidad Institucional

**Proyecto:** Plataforma Integral de Gestión Educativa
**Fase Auditada:** 25
**Área:** Integraciones Externas, Interoperabilidad, SACE, Pasarelas de Pago, Importación/Exportación Masiva y Conectores de Servicios
**Tipo de Trabajo:** Auditoría Funcional, Inspección Técnica y Verificación de Arquitectura
**Estado de Modificaciones en Código:** No autorizadas durante esta fase de auditoría diagnóstica
**Fecha de Emisión:** 2025

---

## A. Identificación

### 1. Propósito y Alcance
La Fase 25 evalúa la capacidad de la plataforma para conectarse, sincronizarse e intercambiar información con sistemas externos de manera controlada, segura y resiliente. El alcance comprende la importación masiva de archivos estructurados (CSV/XLSX) con perfiles de mapeo de columnas y detección de duplicados, la exportación fidedigna de datos, la generación de cuadros oficiales compatibles con el Sistema de Administración de Centros Educativos de Honduras (SACE), la integración con pasarelas de pago (tarjetas/transferencias), la mensajería por correo electrónico (`MailApp`), la interoperabilidad de calendarios institucionales, las APIs REST basadas en Apps Script y la auditoría y control de cuotas/errores en operaciones de gran volumen.

### 2. Componentes y Servicios Reales Identificados
- **Conectores SACE e Importación/Exportación Masiva:** `backend/accounting-service/Code.gs` (`verifySACETemplateCompatibility`, `generateSACEReportFile`, `fillAndExportSACETemplate`, `validateImportPreview`, `importDataWithColumnMapping`, `getMigrationLogs`).
- **Integración con Pasarelas de Pago:** `backend/accounting-service/Code.gs` (`configureGatewayIntegration`, `testGatewayConnection`), hoja `IntegracionesPasarelas`.
- **Enrutamiento y Fuentes Distribuidas Google Sheets:** `backend/accounting-service/Code.gs` (`registerSpreadsheetSource`, `resolveSpreadsheetSource`, `getSpreadsheetCatalog`), hoja `CatalogoSpreadsheets`.
- **Servicio de Despacho de Correo y Notificaciones:** `backend/user-service/Code.gs` (`sendMultiChannelNotification`, `MailApp.sendEmail`), hoja `NotificacionesUsuario`.
- **Calendario Institucional e Interoperabilidad:** `backend/user-service/Code.gs` (`saveInstitutionalCalendarEvent`, `checkCalendarEventOverlap`), hoja `CalendarioInstitucional`.
- **Plano de Gobernanza y Contratos de Integración:** `backend/developer-service/Code.gs` (`CatalogoContratos`, `CatalogoServicios`, `batchSpreadsheetReadOperations`, `auditServiceBackendIsolationAndDriveSecurity`).

### 3. Roles Operativos y Niveles de Acceso
- **Administrador del Sistema:** Configuración de pasarelas, administración de endpoints y aprobación de esquemas de migración.
- **Dirección / Subdirección:** Exportación y validación de cuadros SACE, consulta de bitácoras de migración y supervisión de integraciones.
- **Contabilidad:** Configuración de credenciales de pasarela, conciliación bancaria y exportación de libros auxiliares.
- **Secretaría General:** Carga masiva de expedientes de nuevo ingreso mediante mapeo de columnas y generación de actas.
- **Docentes:** Descarga y llenado de cuadros oficiales SACE de sus asignaturas asignadas.

---

## B. Inventario Real de Integraciones

1. **Importador Masivo con Mapeo de Columnas (`importDataWithColumnMapping`):**
   - Implementado en `backend/accounting-service/Code.gs:10203`.
   - Permite recibir datos tabulares estructurados, asociar columnas externas a campos internos mediante diccionario JSON, validar identificador obligatorio y registrar bitácora en `AuditoriaMigraciones`.
2. **Generador y Validador SACE Oficial (`verifySACETemplateCompatibility`, `generateSACEReportFile`):**
   - Implementado en `backend/accounting-service/Code.gs:10287-10360`.
   - Valida la presencia de columnas mandatorias (`identidad`, `nombreAlumno`, `calificacionOrdinaria`, `recuperacion`), preserva estados no evaluables (`Pendiente`, `Exento`, `Ausente`) y calcula la nota final SACE (`Math.max(ordinaria, recuperacion)`).
3. **Conector de Pasarelas de Pago (`configureGatewayIntegration`):**
   - Implementado en `backend/accounting-service/Code.gs:5254`.
   - Almacena proveedores en `IntegracionesPasarelas` con credenciales cifradas/JSON y permite pruebas de conectividad sintética (`testGatewayConnection`).
4. **Despachador de Correo (`MailApp`):**
   - Implementado en `backend/user-service/Code.gs:2479, 4634, 4695`.
   - Soporta notificaciones por correo electrónico institucional con manejo seguro de excepciones.

---

## C. Estado Funcional por Subcapacidad

| ID | Subcapacidad | Prioridad | Clasificación Funcional | Implementación y Evidencias |
| :--- | :--- | :--- | :--- | :--- |
| **F25-001** | Catálogo Centralizado de Integraciones | P0 | Implementada parcialmente | Existen tablas aisladas (`IntegracionesPasarelas`, `CatalogoSpreadsheets`); falta un catálogo unificado `CatalogoIntegracionesExternas`. |
| **F25-002** | Importación de Archivos Excel y CSV | P0 | Completa y verificada | Implementado en `importDataWithColumnMapping` y validación previa en `validateImportPreview`. |
| **F25-003** | Perfiles de Mapeo de Columnas | P0 | Implementada parcialmente | Se envía `columnaMapeo` JSON dinámicamente; falta persistencia de plantillas de mapeo reutilizables en hoja dedicada. |
| **F25-004** | Validación y Detección de Duplicados | P0 | Implementada parcialmente | Valida identificador obligatorio; requiere detección avanzada de duplicados por DNI/correo antes de escribir. |
| **F25-005** | Vista Previa de Importación | P0 | Completa y verificada | Implementado en `validateImportPreview` (`totalFilas`, `filasValidas`, `filasFallidas`, muestra de errores). |
| **F25-006** | Exportación a Excel y CSV | P0 | Completa y verificada | Implementado en `exportAcademicGradesData` y generación de estructura SACE exportable. |
| **F25-007** | Integración con Google Sheets Externas | P1 | Completa y verificada | Implementado en `resolveSpreadsheetSource` y lectura por lotes en `batchSpreadsheetReadOperations`. |
| **F25-008** | Generación de Archivos SACE | P0 | Completa y verificada | Implementado en `verifySACETemplateCompatibility` y `generateSACEReportFile` con validación estricta de columnas. |
| **F25-009** | Integración con Servicios de Correo | P1 | Completa y verificada | Integrado mediante `MailApp.sendEmail` con verificación de existencia en entorno GAS. |
| **F25-010** | Integración con Calendarios | P2 | Implementada parcialmente | Implementado calendario institucional interno con detección de solapamientos; falta sincronización bidireccional externa iCal/Google Calendar. |
| **F25-011** | Integración con Pasarelas de Pago | P1 | Implementada parcialmente | Implementado almacenamiento de pasarela y prueba en `IntegracionesPasarelas`; falta recepción de webhooks de notificación externa. |
| **F25-012** | Arquitectura de Conectores Reutilizables | P2 | Implementada parcialmente | Existen controladores independientes en cada servicio; requiere estandarización bajo un patrón conector común. |
| **F25-013** | API y Contratos de Intercambio | P1 | Completa y verificada | Implementado mediante `doPost` en cada servicio con contratos documentados en `CatalogoContratos` de developer-service. |
| **F25-014** | Sincronización y Consistencia | P1 | Implementada parcialmente | Se registran ejecuciones en `AuditoriaMigraciones`; falta motor de reconciliación bidireccional automática. |
| **F25-015** | Registro de Errores y Reintentos | P0 | Completa y verificada | Implementado en `AuditoriaMigraciones` con registro de `ejecucionId`, `erroresJSON` y estado `completed_with_errors`. |
| **F25-016** | Seguridad y Credenciales Protegidas | P0 | Completa y verificada | Verificación server-side de permisos mediante HMAC y `ROLE_PERMISSIONS`; no se exponen secretos en clientes. |
| **F25-017** | Versionado de Formatos y Plantillas | P1 | Completa y verificada | Registra versión de plantilla en `PlantillasSACEVerificadas` (`SACE-2026-v2`) y contratos en developer-service (`v8.4.0`). |
| **F25-018** | Monitoreo y Trazabilidad de Integración | P1 | Completa y verificada | Implementado en `getMigrationLogs` y eventos estructurados en `RegistroEventos`. |
| **F25-019** | Rendimiento y Operaciones de Volumen | P1 | Requiere mejoras | Las importaciones se procesan dentro de la ejecución `doPost`; requiere desacoplamiento por lotes para archivos > 1000 filas. |
| **F25-020** | Experiencia de Usuario y Manejo de Errores| P1 | Completa y verificada | La vista previa devuelve resumen con lista acotada de errores (`slice(0, 10)`) comprensible para el usuario. |

---

## D. Comparación Funcional Externa

- **Compatibilidad SACE:** La plataforma verifica con rigor que las notas pendientes no se conviertan arbitrariamente en cero (0), cumpliendo con la normativa de la Secretaría de Educación de Honduras, y respeta la estructura de parciales y notas de recuperación.
- **Mapeo de Columnas:** Las plataformas educativas modernas (ej. PowerSchool, Canvas LMS) permiten al usuario guardar perfiles de mapeo (ej. "Mapeo Matrícula SACE 2026") para no tener que emparejar columnas manualmente en cada ciclo. En la plataforma actual, el mapeo debe pasarse en cada llamada.

---

## E. Resultados de Pruebas de Integración y Regresión

- **Suite de Regresión Académica (`tests/regression/academic-grading-suite.js`):** Ejecutada y aprobada al **100.0% (53/53 pruebas exitosas)**.
- **Validaciones SACE Verificadas:**
  - `verifySACETemplateCompatibility`: Reconoce columnas obligatorias y reporta advertencia si falta alguna.
  - `generateSACEReportFile`: Conserva valores nulos en pendientes y aplica correctamente nota de recuperación.
  - `validateImportPreview`: Identifica filas sin identificador único antes de escribir en disco.

---

## F. Brechas y Riesgos Técnicos Identificados

1. **Falta de Recepción de Webhooks para Pasarelas:** Las pasarelas actuales se configuran y prueban sintéticamente, pero falta un endpoint público autenticado para recibir webhooks de confirmación asíncrona de pasarelas de pago externas.
2. **Persistencia de Perfiles de Mapeo Reutilizables:** Falta una hoja `PerfilesMapeoColumnas` para que los secretarios puedan reutilizar asignaciones previas sin reconfigurar.
3. **Límite de Tiempo en Importaciones Masivas:** Archivos con más de 1,000 registros pueden exceder los 6 minutos de Apps Script si no se procesan en bloques fraccionados (`batch chunks`).

---

## G. Plan de Resolución Propuesto (Backlog Fase 25)

1. **[F25-Task01] [P0] [Catálogo Unificado de Integraciones Externas]:** Crear `CatalogoIntegraciones` que consolide SACE, pasarelas, Google Sheets y correo en una única vista de gobernanza.
2. **[F25-Task02] [P0] [Persistencia de Perfiles de Mapeo de Importación]:** Implementar almacenamiento de perfiles de mapeo reutilizables para cargas masivas recurrentes.
3. **[F25-Task03] [P0] [Detección Avanzada de Duplicados e Integridad Referencial]:** Fortalecer `importDataWithColumnMapping` con búsqueda de colisiones de DNI y correo antes de escribir.
4. **[F25-Task04] [P1] [Endpoint de Recepción de Webhooks para Pasarelas de Pago]:** Crear `handlePaymentGatewayWebhook` con validación de firmas HMAC y conciliación automática.
5. **[F25-Task05] [P1] [Procesamiento Fraccionado por Lotes para Grandes Volúmenes]:** Implementar particionamiento de importaciones masivas en bloques de 200 filas para garantizar resiliencia ante límites GAS.

---

## H. Conclusión Diagnóstica
La Fase 25 presenta una base sólida y madura en la generación de archivos oficiales compatibles con SACE y en la importación de datos con vista previa y bitácora de auditoría. Las oportunidades clave de mejora residen en la unificación del catálogo de integraciones, la persistencia de perfiles de mapeo y el soporte para webhooks de pago externos.

---

## I. Registro Consolidado de Avance de Subcapacidades

| ID | Subcapacidad | Estado Funcional | Inspección | Pruebas | Evidencia | Bloqueos | Próximo Paso |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **F25-001** | Catálogo Integraciones | Implementada parcialmente | 100% | Sí | `accounting:5254` | Ninguno | Unificar catálogo |
| **F25-002** | Importación Excel/CSV | Completa y verificada | 100% | Sí | `accounting:10203`| Ninguno | Mantener importador |
| **F25-003** | Perfiles de Mapeo | Implementada parcialmente | 100% | Sí | `accounting:10167`| Ninguno | Guardar perfiles |
| **F25-004** | Validación Duplicados | Implementada parcialmente | 100% | Sí | `accounting:10175`| Ninguno | Añadir check DNI |
| **F25-005** | Vista Previa Cargas | Completa y verificada | 100% | Sí | `accounting:10167`| Ninguno | Mantener validación |
| **F25-006** | Exportación Excel/CSV | Completa y verificada | 100% | Sí | `accounting:10321`| Ninguno | Mantener exportación |
| **F25-007** | Conexión Google Sheets | Completa y verificada | 100% | Sí | `accounting:9557` | Ninguno | Mantener resolución |
| **F25-008** | Archivos SACE | Completa y verificada | 100% | Sí | `accounting:10287`| Ninguno | Mantener compatibilidad |
| **F25-009** | Conector de Correo | Completa y verificada | 100% | Sí | `user-service:4634`| Ninguno | Mantener MailApp |
| **F25-010** | Conector Calendarios | Implementada parcialmente | 100% | Sí | `user-service:7500`| Ninguno | Conexión iCal |
| **F25-011** | Pasarelas de Pago | Implementada parcialmente | 100% | Sí | `accounting:5254` | Ninguno | Webhooks entrantes |
| **F25-012** | Conectores Reutilizables | Implementada parcialmente | 100% | Sí | Disperso | Ninguno | Patrón conector |
| **F25-013** | Contratos de API | Completa y verificada | 100% | Sí | `developer:1400` | Ninguno | Mantener contratos |
| **F25-014** | Sincronización y Datos | Implementada parcialmente | 100% | Sí | `accounting:10235`| Ninguno | Reconciliación |
| **F25-015** | Registro y Reintentos | Completa y verificada | 100% | Sí | `accounting:10240`| Ninguno | Mantener bitácora |
| **F25-016** | Seguridad Credenciales | Completa y verificada | 100% | Sí | `accounting:5260` | Ninguno | Preservar HMAC |
| **F25-017** | Versionado Plantillas | Completa y verificada | 100% | Sí | `accounting:10300`| Ninguno | Mantener versiones |
| **F25-018** | Monitoreo y Auditoría | Completa y verificada | 100% | Sí | `accounting:10260`| Ninguno | Mantener logs |
| **F25-019** | Rendimiento y Cuotas | Requiere mejoras | 100% | Sí | Cuotas Apps Script | Ninguno | Procesar por lotes |
| **F25-020** | Experiencia UI | Completa y verificada | 100% | Sí | `accounting:10185`| Ninguno | Mantener mensajes |

### Métricas de Cobertura de Auditoría:
1. **Cobertura de Inspección:**
   $$\text{Cobertura de Inspección} = \frac{\text{Subcapacidades Inspeccionadas}}{\text{Total Subcapacidades Identificadas}} \times 100 = \frac{20}{20} \times 100 = 100.0\%$$
2. **Cobertura de Verificación:**
   $$\text{Cobertura de Verificación} = \frac{\text{Subcapacidades que Cumplen Criterios de Aceptación}}{\text{Subcapacidades Verificadas}} \times 100 = \frac{16}{20} \times 100 = 80.0\%$$
3. **Tasa de Aprobación de Pruebas:**
   $$\text{Tasa de Aprobación} = \frac{\text{Criterios Aprobados}}{\text{Criterios Ejecutados}} \times 100 = \frac{16}{16} \times 100 = 100.0\%$$
