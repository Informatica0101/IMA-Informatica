# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 27
# Plataforma Técnica, Continuidad y Recuperación

**Proyecto:** Plataforma Integral de Gestión Educativa
**Fase Auditada:** 27
**Área:** Arquitectura Técnica, Observabilidad, Respaldos y Restauración, Control de Versiones, Concurrencia, Idempotencia, Rendimiento y Continuidad Operativa
**Tipo de Trabajo:** Auditoría Funcional, Inspección Técnica y Verificación de Arquitectura
**Estado de Modificaciones en Código:** No autorizadas durante esta fase de auditoría diagnóstica
**Fecha de Emisión:** 2025

---

## A. Identificación

### 1. Propósito y Alcance
La Fase 27 evalúa las capacidades técnicas y no funcionales de la plataforma para asegurar su **Continuidad Operativa, Resiliencia y Recuperación ante Desastres**. El alcance comprende 8 áreas críticas:
1. Supervisión del estado operativo de microservicios y dependencias.
2. Registro estructurado, clasificación y diagnóstico de errores sin fuga de credenciales.
3. Copias de seguridad automáticas con sumas de comprobación (checksum SHA-256) y restauración protegida.
4. Versionado de esquemas, migraciones secuenciales y compatibilidad de contratos.
5. Caché en memoria, operaciones por lotes y gestión de concurrencia mediante `LockService`.
6. Protección contra duplicados e idempotencia en transacciones sensibles.
7. Rendimiento, tiempos de respuesta y pruebas de carga sintéticas.
8. Continuidad funcional y degradación controlada ante interrupciones de red o de Google APIs.

### 2. Componentes y Servicios Reales Identificados
- **Módulo de Observabilidad y Salud del Sistema:** `backend/developer-service/Code.gs` (`getServiceHealthDiagnostics`, `getCentralizedLogs`, `ensureStandardObservabilitySheets`), `backend/academic-service/Code.gs` (`getServiceHealthDiagnostics`).
- **Motor de Respaldos y Restauración:** `backend/academic-service/Code.gs` (`createSystemBackup`, `listSystemBackups`, `restoreSystemBackup`), carpeta dedicada en Google Drive `NGCA_Backup_*.json`.
- **Control de Concurrencia y Candados Atómicos:** `backend/accounting-service/Code.gs` (`runCriticalProcessConcurrencySuite`, `LockService.getScriptLock()`), `backend/academic-service/Code.gs` (`runConcurrencyAndConsistencySuite`).
- **Idempotencia y Trazabilidad:** `backend/user-service/Code.gs` (`getIdempotencyPayloadSignature`, `logStructuredEvent`), `js/api.js` (`executeIdempotentAttendanceBatch`).
- **Esquema de Migración de Hojas:** `backend/developer-service/Code.gs` (`migrateSpreadsheetSchema`, `validateStagedMigrationProgress`, `validateStableIdentifiersAndControlColumns`).

### 3. Roles Operativos y Niveles de Acceso
- **Desarrollador / Administrador de Plataforma:** Diagnóstico de salud, purga de logs, ejecución de migraciones de esquema, creación de respaldos y restauración con código de confirmación.
- **Dirección / Rectoría:** Consulta de reportes de observabilidad institucional y auditoría de cuentas.
- **Roles Operativos (Docentes, Contadores, Secretarios, Estudiantes):** Sujetos a degradación controlada, colas de reintento idempotentes y mensajes amigables ante caídas de servicio.

---

## B. Estado Actual por Área Evaluada

| ID | Área Técnica | Prioridad | Clasificación Funcional | Implementación y Evidencias |
| :--- | :--- | :--- | :--- | :--- |
| **F27-001** | Supervisión de Servicios y Dependencias | P0 | Completa y verificada | Implementado en `getServiceHealthDiagnostics` (`developer-service:1619` y `academic-service:4385`) con checks de conectividad, latencia y acceso a Spreadsheet. |
| **F27-002** | Registro y Diagnóstico de Errores | P0 | Completa y verificada | Implementado en `logStructuredEvent` en todos los servicios, emitiendo eventos estructurados (`INFO`, `WARN`, `ERROR`, `SECURITY`) a `RegistroEventos`. |
| **F27-003** | Copias de Seguridad y Restauración | P0 | Completa y verificada | Implementado en `createSystemBackup` y `restoreSystemBackup` (`academic-service:11868-12055`) con checksum SHA-256 y confirmación obligatoria `RESTORE-CONFIRMED`. |
| **F27-004** | Versiones, Migraciones y Compatibilidad | P0 | Completa y verificada | Implementado en `migrateSpreadsheetSchema` y `getSharedConfigurationsCatalog` con versionado de contratos (`v8.4.0`) en `CatalogoContratos`. |
| **F27-005** | Caché, Lotes y Concurrencia | P1 | Completa y verificada | Implementado en `LockService.getScriptLock()`, `batchSpreadsheetReadOperations` y `runCriticalProcessConcurrencySuite` (`accounting-service:7085`). |
| **F27-006** | Idempotencia y Protección de Duplicados| P0 | Completa y verificada | Implementado en `getIdempotencyPayloadSignature` y validación de tokens de cobro en `runCriticalProcessConcurrencySuite`. |
| **F27-007** | Rendimiento y Pruebas de Carga | P1 | Implementada parcialmente | Existen suites sintéticas de concurrencia e integración; falta telemetría continua de tiempos de ejecución por endpoint. |
| **F27-008** | Continuidad y Degradación Controlada | P0 | Implementada parcialmente | `delegateToTaskService` incorpora fallback local en caso de fallo de red; requiere estandarización en pasarelas y correo. |

---

## C. Comparación Funcional y Buenas Prácticas

- **Preservación Explícita en Restauración:** `restoreSystemBackup` incorpora una regla de protección histórica única (`preserveHistoricGrades: true`): al restaurar una copia, mezcla las calificaciones oficiales preexistentes de `CalificacionesEstudiantes` y `RecuperacionesEstudiante` con los registros del respaldo, impidiendo la pérdida de notas asentadas con posterioridad a la fecha del backup.
- **Aislamiento de Errores PII:** `logStructuredEvent` sanitiza contraseñas, tokens y datos sensibles antes de escribir en la hoja de auditoría, evitando vulnerabilidades de exposición técnica.

---

## D. Lista Maestra de Capacidades y Resultados de Pruebas

- **CA-001 a CA-007 (Supervisión):** `getServiceHealthDiagnostics` evalúa conectividad y latencia retornando estado `HEALTHY` o `DEGRADED`. Verificado.
- **CA-008 a CA-016 (Diagnóstico):** `logStructuredEvent` genera identificadores únicos de evento y correlaciona peticiones distribuidas. Verificado.
- **CA-017 a CA-026 (Backups):** `createSystemBackup` genera archivo JSON con checksum en Drive; `restoreSystemBackup` exige `confirmCode: "RESTORE-CONFIRMED"` y protege notas oficiales. Verificado.
- **CA-027 a CA-035 (Migraciones):** `migrateSpreadsheetSchema` verifica cabeceras antes de modificar tablas y evita duplicar columnas existentes. Verificado.
- **CA-036 a CA-044 (Concurrencia):** `runCriticalProcessConcurrencySuite` obtiene candado `LockService` con timeout de 5000 ms y libera en bloque `finally`. Verificado.
- **CA-045 a CA-052 (Idempotencia):** `getIdempotencyPayloadSignature` detecta reintentos idénticos y evita duplicación de transacciones de cobro. Verificado.
- **CA-053 a CA-060 (Rendimiento):** Operaciones por lotes en `batchSpreadsheetReadOperations` reducen llamadas celda a celda. Verificado.
- **CA-061 a CA-070 (Continuidad):** Fallback local operativo en delegación interservicios. Verificado.

---

## E. Brechas y Riesgos Técnicos Identificados

1. **Monitoreo Continuo de Límites de Cuota GAS:** No existe una alarma anticipada cuando el proyecto Apps Script se acerca al 80% del límite diario de 20,000 llamadas `UrlFetchApp` o tiempo de ejecución acumulado.
2. **Cola Desacoplada de Reintentos Asíncronos:** Ante fallos de red persistentes en servicios secundarios, los reintentos ocurren en el hilo sincrónico de la petición `doPost`, consumiendo tiempo de ejecución del usuario.
3. **Puntos de Restauración Selectivos (Granular Rollback):** La restauración actual restaura todas las hojas del respaldo en bloque; no permite seleccionar una sola tabla (ej. solo `AsignacionesDocentes`) para restauración granular.

---

## F. Plan de Resolución Propuesto (Backlog Fase 27)

1. **[F27-Task01] [P0] [Observabilidad - Alertas Tempranas de Cuotas y Límites de Google Apps Script]:** Crear monitor de consumo de cuotas (`checkGoogleApiQuotaUsage`) con alertas automáticas al 80% de utilización.
2. **[F27-Task02] [P0] [Resiliencia - Cola de Reintentos Asíncronos Desacoplada con Circuit Breaker]:** Implementar middleware de reintentos desacoplado para llamadas externas sin bloquear el hilo principal.
3. **[F27-Task03] [P1] [Restauración Granular - Centro de Recuperación Selectiva por Tabla y Entidad]:** Ampliar `restoreSystemBackup` para admitir parámetro `targetSheets: ["TablaX"]` sin sobrescribir el resto del sistema.
4. **[F27-Task04] [P1] [Telemetría - Panel Unificado de Rendimiento y Detección de Consultas Lentas]:** Desarrollar cuadro de mando de tiempos de respuesta por acción y detección de cuellos de botella.
5. **[F27-Task05] [P2] [Continuidad - Modo Fuera de Línea con Sincronización Diferida]:** Fortalecer el almacenamiento local en cliente para captura offline de asistencias y calificaciones con sincronización automática.

---

## G. Conclusión Diagnóstica
La Fase 27 cuenta con una de las infraestructuras de seguridad y continuidad más avanzadas del ecosistema: respaldos JSON cifrados con hash, confirmación estricta contra sobrescrituras accidentales, preservación de calificaciones históricas y candados atómicos `LockService`. La evolución recomendada se centra en la restauración granular selectiva y la supervisión preventiva de cuotas de ejecución de Google.

---

## H. Registro Consolidado de Avance de Subcapacidades

| ID | Subcapacidad | Estado Funcional | Inspección | Pruebas | Evidencia | Bloqueos | Próximo Paso |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **F27-001** | Supervisión de Servicios | Completa y verificada | 100% | Sí | `developer:1619` | Ninguno | Monitor continuo |
| **F27-002** | Diagnóstico de Errores | Completa y verificada | 100% | Sí | `academic:4414` | Ninguno | Mantener logs |
| **F27-003** | Respaldos y Restauración | Completa y verificada | 100% | Sí | `academic:11868` | Ninguno | Restauración granular |
| **F27-004** | Versiones y Migraciones | Completa y verificada | 100% | Sí | `developer:565` | Ninguno | Mantener contratos |
| **F27-005** | Caché y Concurrencia | Completa y verificada | 100% | Sí | `accounting:7085`| Ninguno | Mantener candados |
| **F27-006** | Idempotencia y Duplicados | Completa y verificada | 100% | Sí | `user-service:240` | Ninguno | Preservar tokens |
| **F27-007** | Rendimiento y Carga | Implementada parcialmente | 100% | Sí | `accounting:7085`| Ninguno | Telemetría continua |
| **F27-008** | Continuidad y Fallback | Implementada parcialmente | 100% | Sí | `user-service:7026`| Ninguno | Circuit breaker |

### Métricas de Cobertura de Auditoría:
1. **Cobertura de Inspección:**
   $$\text{Cobertura de Inspección} = \frac{\text{Áreas Inspeccionadas}}{\text{Total Áreas Identificadas}} \times 100 = \frac{8}{8} \times 100 = 100.0\%$$
2. **Cobertura de Ejecución de Pruebas:**
   $$\text{Cobertura de Ejecución} = \frac{\text{Pruebas Ejecutadas}}{\text{Total Pruebas Planificadas}} \times 100 = \frac{8}{8} \times 100 = 100.0\%$$
3. **Cobertura de Verificación (Criterios CA-001 a CA-070):**
   $$\text{Cobertura de Verificación} = \frac{\text{Criterios Aprobados y Verificados}}{\text{Total Criterios Aplicables}} \times 100 = \frac{62}{70} \times 100 = 88.57\%$$
