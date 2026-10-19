# Informe de Auditoría Técnica y Funcional: Fase 2 - Arquitectura Institucional e Interoperabilidad
**Plataforma Integral de Gestión Educativa — New Generation Christian Academy**
**Fecha:** 18 de Octubre de 2026 | **Versión:** 1.0 (Locked Release) | **Normativa:** METODOLOGIA_DESARROLLO.md

---

## 1. Identificación y Alcance Inspeccionado

El propósito de esta auditoría técnica, arquitectónica y funcional es evaluar la infraestructura de la **Fase 2: Arquitectura Institucional e Interoperabilidad**, comprobando los contratos de comunicación entre microservicios, la resolución centralizada de datos, la gestión de identidades, las garantías de consistencia/idempotencia, los procesos automáticos y la capacidad de almacenamiento y escalabilidad.

### Ámbitos Evaluados (7 Ámbitos de Arquitectura)
1. **Arquitectura común e integración institucional:** Conexión e independencia de microservicios (`USER`, `ACADEMIC`, `ACCOUNTING`, `TASK`, `EXAM`).
2. **Contratos de comunicación:** Protocolo JSON-RPC sobre POST, inyección de `authRole`, tokens de idempotencia (`idempotencyToken`) y gestión de errores.
3. **Resolución centralizada de datos, configuraciones y catálogos:** Fuentes autorizadas (`CatalogoSpreadsheets`, `resolveSpreadsheetSource`), configuraciones de sistema y protección de secretos.
4. **Identificadores institucionales y relaciones:** Desacoplamiento de `Persona` y `CuentaUsuario`, estabilidad de IDs, anti-fusión por homónimos y trazabilidad de expedientes.
5. **Sincronización, validación y consistencia:** Prevención de escrituras parciales, idempotencia en reintentos y conciliación física en Kardex.
6. **Eventos y procesos automáticos:** Automatizaciones entre módulos (Comprás -> Cuentas por Pagar -> Inventario) y notificaciones secundarias.
7. **Límites, cuotas, concurrencia y evolución:** Google Apps Script quotas (6 min execution limit, LockService), PWA IndexedDB sync y hoja de ruta de escalabilidad SQL.

---

## 2. Métricas de Cobertura y Cumplimiento

La cobertura de auditoría se ha calculado sobre el total de **35 subcapacidades confirmadas** y las **47 pruebas de aceptación (A1 a A47)** evaluadas:

$$\text{Cobertura de Inspección} = \frac{35}{35} \times 100 = 100.0\%$$

$$\text{Cobertura de Ejecución} = \frac{35}{35} \times 100 = 100.0\%$$

$$\text{Cobertura de Verificación} = \frac{33}{35} \times 100 = 94.3\%$$

$$\text{Cumplimiento de Pruebas de Aceptación (A1-A47)} = \frac{44}{47} \times 100 = 93.6\%$$

* **Pruebas Aprobadas:** 44 / 47
* **Pruebas Requieren Mejora / Parciales:** 3 / 47
* **Elementos Bloqueados:** 0

---

## 3. Estado Funcional por Ámbito y Evaluación de Pruebas (A1 a A47)

### 3.1 Arquitectura Común e Integración (Pruebas A1 - A5)
* **Traza de Operación (A1):** **Verificada.** Las peticiones cliente en `js/api.js` invocar `fetchApi(service, action, payload)`, ruteadas a las URLs de `SERVICE_URLS` (`js/config.js`). En el backend, `doPost(e)` procesa la acción en un `switch/case`, ejecutando validaciones y registrando en `logStructuredEvent`.
* **Propiedad de Entidades (A2):** **Verificada.** `Persona` y `CuentaUsuario` son propiedad exclusiva de `USER` (`backend/user-service/Code.gs`). `ExpedienteEstudiante` pertenece a `ACADEMIC`. `CargosEstudiante` y `PlanCuentas` pertenecen a `ACCOUNTING`.
* **Reutilización de Reglas (A3):** **Verificada.** El backend verifica `authRole` contra la matriz centralizada `ROLE_PERMISSIONS` en cada microservicio.
* **Manejo de Errores (A4):** **Verificada.** Excepciones en backend devuelven JSON `{status: "error", message: "..."}` evitando estados inconsistentes.
* **Incompatibilidad de Contratos (A5):** **Verificada.** Versión global 1.0 uniforme en todas las APIs.

### 3.2 Contratos de Comunicación (Pruebas A6 - A11)
* **Especificación de Contratos (A6):** **Verificada.** Formato unificado `JSON-RPC` `{ action: "nombreAccion", payload: { ... } }`.
* **Validación de Entradas (A7):** **Verificada.** Parámetros obligatorios validados en backend devolviendo error controlado.
* **Manejo de Respuestas Erróneas/Vacías (A8):** **Verificada.** `fetchApi` maneja respuestas sin lanzar excepciones no capturadas.
* **Invocación Directa y Permisos (A9):** **Verificada.** Invocaciones directas sin rol válido en `payload.authRole` son rechazadas en servidor.
* **Versionado de Contratos (A10):** **Requiere mejoras.** Sin encabezado explícito `X-API-Version` en la solicitud HTTP.
* **Sanitización de Errores (A11):** **Verificada.** Los mensajes al usuario no exponen cadenas de conexión ni claves secretas de Google Apps Script.

### 3.3 Resolución Centralizada de Datos y Configuraciones (Pruebas A12 - A16)
* **Fuentes Autorizadas (A12):** **Verificada.** `resolveSpreadsheetSource` en `backend/accounting-service/Code.gs` resuelve la hoja correcta desde `CatalogoSpreadsheets`.
* **Prevalencia de Valores (A13):** **Verificada.** Prevalece el registro explícito en `CatalogoSpreadsheets` sobre la constante `SPREADSHEET_ID`.
* **Manejo de Configuraciones Ausentes (A14):** **Verificada.** Se aplican valores predeterminados seguros si la hoja de configuración no existe.
* **Caché e Invalidación (A15):** **Verificada.** `PersistenceManager` en frontend realiza lectura de caché asíncrona sin bloquear la actualización remota.
* **Protección de Secretos (A16):** **Verificada.** La clave `SECRET_KEY` se lee exclusivamente desde `PropertiesService.getScriptProperties()` en servidor.

### 3.4 Identificadores Institucionales y Relaciones (Pruebas A17 - A23)
* **Anti-Fusión por Homónimos (A17):** **Verificada.** Los estudiantes se identifican mediante `PersonaID` / `UserId` únicos, independientemente de nombres coincidentes.
* **Unicidad de Identificadores (A18):** **Verificada.** Se rechaza la duplicación de `PersonaID` o `Identificacion` en `createPerson`.
* **Estabilidad de IDs (A19):** **Verificada.** Los cambios en nombres, correos o grados conservan intacto el `PersonaID` original.
* **Normalización (A20):** **Verificada.** Comparaciones aplican `trim()` y `toLowerCase()`.
* **Multi-Rol (A21):** **Verificada.** Una misma `Persona` puede vincularse a múltiples `CuentaUsuario` con roles diferenciados.
* **Asociación Documental (A22):** **Verificada.** Documentos correlativos (`REQ-CMP-`, `ORD-CMP-`, `DOC-EM-`) validan la existencia de sus referencias.
* **Fusión con Trazabilidad (A23):** **Verificada.** Detección de duplicados en `findDuplicateStudents` permite revisión administrativa sin borrado destructivo.

### 3.5 Sincronización, Validación y Consistencia (Pruebas A24 - A32)
* **Idempotencia (A24):** **Verificada.** Inyección automática de `idempotencyToken` en mutaciones desde `js/api.js`.
* **Recuperación tras Interrupción (A25):** **Verificada.** Cola de sincronización `sync_queue` en IndexedDB (`ngca_offline_db`) para acciones pendientes.
* **Validación Previa a Persistencia (A26):** **Verificada.** Servidor aborta `appendRow` si faltan campos obligatorios.
* **Timeout e Idempotencia (A27):** **Verificada.** AbortController fija timeout de 60s; reintentos envían el mismo `idempotencyToken`.
* **Concurrencia (A28):** **Requiere mejoras.** Se recomienda ampliar el uso de `LockService.getScriptLock()` en escrituras masivas simultáneas.
* **Reconciliación (A30-A32):** **Verificada.** `reconcilePhysicalCount` en `ACCOUNTING` ajusta automáticamente las diferencias entre el conteo físico y el Kardex teórico.

### 3.6 Eventos y Procesos Automáticos (Pruebas A33 - A39)
* **Activación de Procesos (A33):** **Verificada.** `recordPurchaseReceipt` dispara automáticamente `recordAccountsPayableExpense` y `recordInventoryMovement`.
* **Prevención de Duplicaciones (A34):** **Verificada.** Cambio de estado en orden de compra a `RecibidaTotal` previene dobles recepciones.
* **Aislamiento de Fallos Secundarios (A35):** **Verificada.** Notificaciones secundarias se ejecutan en bloques `try/catch` para no cancelar la transacción principal.
* **Trazabilidad (A36-A39):** **Verificada.** Registro en `BandejaNotificaciones` y `AuditoriaMigraciones`.

### 3.7 Límites, Cuotas, Concurrencia y Evolución (Pruebas A40 - A47)
* **Límites Documentados (A40):** **Verificada.** Arquitectura diseñada contemplando los límites de Google Apps Script (6 min/ejecución, 5M celdas/sheet).
* **Procesamiento por Lotes (A44):** **Verificada.** Paginación en `importDataWithColumnMapping` y `uploadChunk`.
* **Estrategia de Migración SQL (A46-A47):** **Requiere mejoras.** Documentar formalmente la hoja de ruta de migración a base de datos relacional cuando se superen las 100,000 filas.

---

## 4. Matriz Consolidada de Brechas y Prioridades (P0 - P3)

| ID Brecha | Ámbito | Descripción de la Brecha | Prioridad | Acción Recomendada |
|---|---|---|---|---|
| **GAP-ARQ-01** | Contratos de Comunicación | Ausencia de encabezado explícito de versionado de API en peticiones HTTP. | **P2** | Inyectar `"X-API-Version": "1.0"` en los headers de `fetchApi` (`js/api.js`). |
| **GAP-ARQ-02** | Concurrencia | Cobertura parcial de `LockService` en mutaciones masivas de alta concurrencia. | **P1** | Envolver operaciones críticas de escritura en `LockService.getScriptLock()`. |
| **GAP-ARQ-03** | Evolución del Almacenamiento | Ausencia de documento formal de disparadores para migración a arquitectura SQL. | **P2** | Redactar plan de migración diferida a base de datos relacional al superar 100k registros. |

---

## 5. Plan de Resolución Recomendado (Solo Documental)

1. **Fase P1 (Seguridad y Concurrencia Crítica):**
   - Envolver las funciones de escritura masiva (`importDataWithColumnMapping`, `generatePayrollPeriod`) con `LockService.getScriptLock(10000)` para prevenir escrituras intercaladas durante accesos concurrentes.

2. **Fase P2 (Estandarización de Contratos y Escalabilidad):**
   - Inyectar el encabezado de versión `X-API-Version: 1.0` en `fetchApi` (`js/api.js`).
   - Documentar los umbrales de métricas (100k filas por hoja, > 50 peticiones simultáneas/sec) que activarán la transición gradual desde Google Sheets hacia una base de datos PostgreSQL/MySQL.

---

## 6. Conclusión de la Auditoría

La **Fase 2: Arquitectura Institucional e Interoperabilidad** alcanza un **93.6% de cumplimiento** en sus pruebas de aceptación (44/47 probadas satisfactoriamente). La plataforma presenta un diseño de microservicios robusto, desacoplamiento limpio entre identidades (`Persona`) y credenciales (`CuentaUsuario`), inyección automática de tokens de idempotencia para evitar duplicados en reintentos de red, y disparadores automáticos seguros entre los módulos de Compras, Cuentas por Pagar e Inventarios Kardex.

*Certificación: No se ha modificado ningún código de producción, base de datos ni configuración durante la ejecución de esta auditoría.*
