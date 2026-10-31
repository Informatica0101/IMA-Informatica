# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 23
# Motor Institucional de Flujos de Trabajo y Arquitectura Distribuida Multicuenta

**Proyecto:** Plataforma Integral de Gestión Educativa
**Fase Auditada:** 23
**Área:** Motor Institucional de Flujos de Trabajo (BPM), Trámites, Orquestación Distribuida Multicuenta GAS y Gobernanza
**Tipo de Trabajo:** Auditoría Funcional, Inspección Técnica y Verificación de Arquitectura
**Estado de Modificaciones en Código:** No autorizadas durante esta fase de auditoría diagnóstica
**Fecha de Emisión:** 2025

---

## A. Identificación

### 1. Propósito y Alcance
La Fase 23 tiene como objetivo evaluar y formalizar la arquitectura del **Motor Institucional de Flujos de Trabajo (BPM / Workflows)** y el desacoplamiento mediante una **Arquitectura Distribuida Multicuenta** sobre Google Workspace / Google Apps Script (GAS). Esta arquitectura garantiza que las solicitudes, trámites administrativos, aprobaciones presupuestarias, revisiones disciplinarias, sustituciones docentes y permisos de personal circulen a través de máquinas de estado gobernadas, transiciones atómicas, colas de trabajo por rol/departamento, escalamientos automáticos por SLA, y desacoplamiento de almacenamiento para evadir los límites de cuota (límites de 10 millones de celdas por hoja, límites de ejecución de 6 minutos y cuotas diarias de llamadas `UrlFetchApp` y `LockService`).

### 2. Componentes y Servicios Evaluados
- **Controlador Central de Trámites y Flujos:** `backend/user-service/Code.gs` (funciones de workflows `saveApprovalWorkflow`, `getApprovalWorkflows`, `processWorkflowDecision`, `getWorkflowHistory`, y trámites `submitAdministrativeRequest`, `getAdministrativeRequests`, `updateRequestStatus`).
- **Catálogo Central de Spreadsheets y Rutas Distribuidas:** `backend/accounting-service/Code.gs` (`CatalogoSpreadsheets`, `resolveSpreadsheetSource`, `registerSpreadsheetSource`).
- **Plano de Control y Gobernanza de Microservicios:** `backend/developer-service/Code.gs` (`CatalogoContratos`, `CatalogoServicios`, `batchSpreadsheetReadOperations`, `migrateSpreadsheetSchema`, `auditServiceBackendIsolationAndDriveSecurity`).
- **Interfaz y Capa de Transporte de Cliente:** `js/api.js` (despacho a endpoints GAS, manejo de tokens HMAC y almacenamiento local offline).

### 3. Roles Operativos Involucrados
- **Administrador del Sistema:** Diseñador y configurador de workflows, administrador de pasarelas y catálogos de cuentas de servicio.
- **Dirección / Rectoría:** Aprobador de última instancia para flujos críticos (presupuestos de alto valor, bajas de activos, despidos o expedientes disciplinarios graves).
- **Subdirección / Coordinación Académica:** Revisor y aprobador de trámites académicos (convalidaciones, cambios de sección, sustituciones y planificaciones).
- **Secretaría General:** Recepción, validación documental inicial y emisión de resoluciones.
- **Personal / Docente / Empleado:** Iniciador de trámites institucionales, requisiciones y permisos.
- **Padres de Familia / Tutores Legales / Estudiantes:** Iniciadores de solicitudes de constancias, becas, justificaciones de inasistencia y reclamos de calificaciones.

---

## B. Inventario Real de Implementaciones

1. **Definición de Flujos de Aprobación (`FlujosAprobacion`):**
   - Implementado en `backend/user-service/Code.gs:6365` (`saveApprovalWorkflow`, `getApprovalWorkflows`).
   - Permite registrar plantillas de flujo con campos `FlujoID`, `FormID`, `NombreFlujo`, `Departamento`, `PasosEtapasJSON`, `Estado`, `Version`, `FechaCreacion`, `CreadoPor`.
   - Soporta versionamiento secuencial automático al actualizar un flujo existente.
2. **Registro de Decisiones de Revisión (`RevisionesDecisionesTramite`):**
   - Implementado en `backend/user-service/Code.gs:6456` (`processWorkflowDecision`, `getWorkflowHistory`).
   - Registra transiciones con `DecisionID`, `SolicitudID`, `EtapaNombre`, `RevisorID`, `AccionDecisión` (`APROBADO`, `RECHAZADO`, `DEVUELTO_CORRECCION`, `DERIVADO`), observaciones internas/públicas, fecha y metadatos IP.
   - Sincroniza el estado en `SolicitudesTramites`.
3. **Catálogo de Spreadsheets Distribuidos (`CatalogoSpreadsheets`):**
   - Implementado en `backend/accounting-service/Code.gs:9510` (`registerSpreadsheetSource`, `resolveSpreadsheetSource`, `getSpreadsheetCatalog`).
   - Permite mapear áreas de dominio y años lectivos hacia IDs de hojas independientes, aislando la carga de I/O.
4. **Firmas y Trazabilidad de Conformidades (`FirmasConformidades`):**
   - Implementado en `backend/user-service/Code.gs:6546` (`registerDocumentSignature`), integrado a la historia del workflow.
5. **Comunicación Inter-Servicio Básica:**
   - Mecanismo en `backend/user-service/Code.gs:7020` (`delegateToTaskService`) utilizando `UrlFetchApp.fetch` con fallback local en caso de fallo de red.

---

## C. Estado Funcional y Comparación Externa

A partir del análisis de motores de flujo líderes en entornos educativos y corporativos (Camunda BPM, Microsoft Power Automate, Google AppSheet, ServiceNow Educational Workflows):

| Capacidad Estándar de la Industria | Estado en la Plataforma Actual | Brecha Técnica Identificada |
| :--- | :--- | :--- |
| **Diseñador Visual de Flujos (BPMN 2.0 / No-Code)** | JSON plano en columna `PasosEtapasJSON`. | Falta un generador interactivo con validación de sintaxis de etapas y compuertas lógicas (AND/OR). |
| **Temporizadores y Vencimiento de SLA** | Ausente; las solicitudes permanecen indefinidamente en estado actual sin auto-escalamiento. | Requiere un cron job (`Time-driven trigger`) que evalúe tiempos límite por etapa y escale a superiores. |
| **Compuertas Condicionales (Gateway branching)** | Transición fija y lineal manual en `processWorkflowDecision`. | No evalúa expresiones lógicas basadas en el payload (ej. "si monto > L 50,000 requerir Dirección"). |
| **Bandeja Unificada de Tareas Pendientes (Inbox)** | Dispersa en múltiples hojas (`SolicitudesTramites`, `SolicitudesAutorizacion`, etc.). | Ausencia de un índice consolidado `TareasPendientesUsuario` que agregue todas las aprobaciones asignadas. |
| **Topología Distribuida Multicuenta de Google Apps Script** | Enlace estático por `SPREADSHEET_ID` único en cada servicio. | No implementa rotación dinámica de cuentas ni enrutamiento hacia hojas particionadas por ciclo lectivo de forma ubicua. |

---

## D. Arquitectura Distribuida y Gobernanza Multicuenta

1. **Topología de Cuentas y Repartición de Responsabilidades:**
   - La arquitectura actual de la plataforma divide las responsabilidades en cuatro proyectos Apps Script independientes (`user-service`, `academic-service`, `accounting-service`, `developer-service`).
   - Cada servicio puede residir en una cuenta de Google Workspace distinta (Cuentas de Servicio Institucionales) para evitar agotar cuotas individuales de ejecución de Apps Script (`UrlFetchApp`, `MailApp`, llamadas a SpreadsheetApp).
2. **Registro Central de Servicios y Spreadsheets (`CatalogoSpreadsheets`):**
   - El catálogo mapea `FuenteID`, `DominioArea`, `AnoLectivo`, `SpreadsheetId`, `UrlAcceso`, `Estado`, `SchemaVersion`, `Observaciones`.
   - Permite particionar horizontalmente datos por año lectivo (ej. `ACAD_2024`, `ACAD_2025`, `FINANZAS_2025`).
3. **Mecanismo de Autenticación Inter-Servicio:**
   - Firmas HMAC-SHA256 computadas mediante claves secretas compartidas en `PropertiesService`, evitando la exposición de contraseñas o tokens estáticos en URLs.
4. **Límites de Cuota y Mecanismos de Tolerancia:**
   - Google Apps Script impone un límite de 6 minutos por ejecución y 20,000 peticiones diarias `UrlFetchApp`. La arquitectura requiere colas de reintentos idempotentes y retroceso exponencial (`exponential backoff`) en operaciones inter-servicios.

---

## E. Lista Maestra de Características (32 Capacidades Obligatorias)

| ID | Característica / Capacidad | Origen | Ubicación en Código | Estado Funcional | Prioridad | Acción |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **F23-001** | Definición de Esquemas de Flujo Multi-Etapa | Requisito Central | `backend/user-service/Code.gs:6365` | Implementada parcialmente | Alta | Ampliar |
| **F23-002** | Registro y Ejecución Atómica de Decisiones de Etapa | Requisito Central | `backend/user-service/Code.gs:6456` | Implementada parcialmente | Crítica | Corregir |
| **F23-003** | Trazabilidad Integral e Historial de Revisiones | Requisito Central | `backend/user-service/Code.gs:6516` | Completa y verificada | Media | Mantener |
| **F23-004** | Bandeja de Entrada Unificada de Tareas Pendientes por Rol | Requisito Central | Ausente | Ausente | Alta | Proponer |
| **F23-005** | Reglas de Enrutamiento Condicional y Compuertas Lógicas | Requisito Central | Disperso en lógica de negocio | Requiere mejoras | Alta | Proponer |
| **F23-006** | Temporizadores de SLA y Escalamiento Automático | Propuesta / Mejora | Ausente | Ausente | Alta | Proponer |
| **F23-007** | Delegación Temporal de Aprobaciones por Ausencia / Vacaciones | Requisito Central | `backend/user-service/Code.gs:1594` | Implementada parcialmente | Media | Ampliar |
| **F23-008** | Catálogo Centralizado de Spreadsheets Distribuidos | Arquitectura | `backend/accounting-service/Code.gs:9510` | Implementada parcialmente | Alta | Ampliar |
| **F23-009** | Enrutador Ubicuo de Particiones de Datos (`SpreadsheetRouter`) | Arquitectura | Ausente en `academic-service` | Requiere mejoras | Crítica | Proponer |
| **F23-010** | Protocolo Seguro de Comunicación Inter-Servicios con HMAC | Seguridad | `backend/user-service/Code.gs:980` | Implementada parcialmente | Crítica | Ampliar |
| **F23-011** | Manejador de Cuotas GAS y Reintentos con Retroceso Exponencial | Resiliencia | Ausente | Ausente | Alta | Proponer |
| **F23-012** | Registro y Auditoría Estructurada de Eventos del Motor | Observabilidad | `backend/user-service/Code.gs:142` | Implementada parcialmente | Media | Ampliar |
| **F23-013** | Aislamiento Transaccional y Candados por Flujo (`LockService`) | Requisito Central | `backend/user-service/Code.gs:6456` | Requiere mejoras | Crítica | Corregir |
| **F23-014** | Validación de Precondiciones y Estados Anteriores en Decisiones | Requisito Central | `backend/user-service/Code.gs:6485` | Implementada parcialmente | Alta | Ampliar |
| **F23-015** | Idempotencia en Envíos de Formularios y Trámites | Requisito Central | Ausente en `submitAdministrativeRequest` | Ausente | Crítica | Corregir |
| **F23-016** | Despacho de Notificaciones Multicanal al Cambiar de Etapa | Requisito Central | `backend/user-service/Code.gs:5022` | Implementada parcialmente | Media | Ampliar |
| **F23-017** | Integración de Firmas Digitales y Aceptaciones en Etapas | Requisito Central | `backend/user-service/Code.gs:6546` | Completa y verificada | Media | Mantener |
| **F23-018** | Reversión y Devolución con Observaciones Obligatorias | Requisito Central | `backend/user-service/Code.gs:6480` | Implementada parcialmente | Alta | Ampliar |
| **F23-019** | Cancelación y Desistimiento de Trámites por el Solicitante | Requisito Central | Ausente en `updateRequestStatus` | Ausente | Media | Proponer |
| **F23-020** | Archivo y Depuración Programada de Trámites Resueltos | Requisito Central | `backend/user-service/Code.gs:1968` | Implementada parcialmente | Baja | Mantener |
| **F23-021** | Configuración Dinámica de Pasos Paralelos (Compuertas AND) | Arquitectura | Ausente en `PasosEtapasJSON` | Ausente | Alta | Proponer |
| **F23-022** | Asignación Dinámica por Criterios de Carga de Trabajo (Round-Robin)| Arquitectura | Ausente | Ausente | Media | Proponer |
| **F23-023** | Soporte Multicuenta de Cuentas de Servicio Google Workspace | Arquitectura | `backend/developer-service/Code.gs:1550` | Implementada parcialmente | Alta | Ampliar |
| **F23-024** | Monitoreo de Estado de Salud de Cuentas Distribuidas | Arquitectura | `backend/developer-service/Code.gs:1619` | Implementada parcialmente | Media | Mantener |
| **F23-025** | Registro de Transacciones Inter-Servicio con Correlation ID | Observabilidad | `backend/user-service/Code.gs:2327` | Implementada parcialmente | Alta | Ampliar |
| **F23-026** | Fallback Automático en Caídas de Comunicación Inter-Servicios | Resiliencia | `backend/user-service/Code.gs:7026` | Implementada parcialmente | Alta | Ampliar |
| **F23-027** | Exportación de Métricas de Rendimiento de Flujos (Tiempos de Ciclo)| Rendimiento | Ausente | Ausente | Media | Proponer |
| **F23-028** | Auditoría Anti-Manipulación de Decisiones Históricas | Seguridad | `backend/user-service/Code.gs:6523` | Implementada parcialmente | Crítica | Corregir |
| **F23-029** | Validación Criptográfica de Tokens Inter-Cuentas GAS | Seguridad | `backend/user-service/Code.gs:980` | Completa y verificada | Alta | Mantener |
| **F23-030** | Detección de Cuellos de Botella y Alertas de Sobrecarga de Revisor| Operatividad | Ausente | Ausente | Media | Proponer |
| **F23-031** | Registro de Versiones de Definición de Flujos e Histórico de Cambios| Gobernanza | `backend/user-service/Code.gs:6390` | Completa y verificada | Baja | Mantener |
| **F23-032** | Suite de Regresión Automatizada de Flujos y Multicuenta | Calidad | `backend/developer-service/Code.gs:1267` | Implementada parcialmente | Crítica | Ampliar |

---

## F. Brechas, Riesgos y Limitaciones Técnicas

1. **Riesgo de Cuello de Botella en Hoja Única (`SPREADSHEET_ID`):** Aunque existe `CatalogoSpreadsheets` en `accounting-service`, los servicios `academic-service` y `user-service` aún referencian una constante global `SPREADSHEET_ID` para la mayoría de tablas transaccionales, corriendo el riesgo de superar el límite de 10 millones de celdas y generar contención de candados (`LockService`).
2. **Falta de Despacho Asíncrono para Tareas Pesadas:** Las transiciones de workflow que involucran múltiples acciones (notificar por correo, generar PDFs, emitir asientos contables) se ejecutan de forma sincrónica en la llamada `doPost`, aproximándose peligrosamente al límite de tiempo de ejecución de 6 minutos de Google Apps Script.
3. **Ausencia de un Motor de Expresiones para Decisiones:** El enrutamiento de la siguiente etapa actualmente depende de parámetros enviados manualmente desde el frontend (`siguienteAsignadoA`, `nuevoEstadoSolicitud`), permitiendo potenciales manipulaciones si el cliente no envía la secuencia estricta definida en `PasosEtapasJSON`.

---

## G. Criterios de Aceptación

- **CA-F23-01:** La creación de un flujo institucional debe validar la presencia obligatoria de al menos un paso inicial, un paso de revisión y un estado terminal (`Aprobado`, `Rechazado`).
- **CA-F23-02:** Una decisión de workflow (`processWorkflowDecision`) no debe poder ser ejecutada por un usuario cuyo rol o ID no coincida con el asignado a la etapa activa.
- **CA-F23-03:** Las transiciones deben ser protegidas mediante `LockService` para prevenir condiciones de carrera cuando dos revisores intentan decidir sobre el mismo trámite simultáneamente.
- **CA-F23-04:** La resolución de hojas distribuidas mediante `resolveSpreadsheetSource` debe estar estandarizada en todos los microservicios del ecosistema.
- **CA-F23-05:** Todo error en llamadas inter-servicios debe registrar un evento estructurado con severidad `WARN` o `ERROR` y correlación de trazabilidad (`correlationId`).

---

## H. Plan de Resolución

1. **Prioridad Crítica:**
   - Incorporar `LockService.getScriptLock()` en `processWorkflowDecision` y validar autorización estricta del revisor según la etapa activa (`F23-Task01`).
   - Estandarizar la resolución dinámica de fuentes de datos mediante `resolveSpreadsheetSource` en `academic-service` y `user-service` (`F23-Task02`).
2. **Prioridad Alta:**
   - Implementar función `getUnifiedWorkInbox` que consolide trámites, solicitudes de compra y justificaciones asignadas al usuario o a su rol (`F23-Task03`).
   - Crear un motor de evaluación de reglas condicionales para transiciones automáticas según monto, categoría o urgencia (`F23-Task04`).
3. **Prioridad Media:**
   - Diseñar `processWorkflowSLAEscalations` para detectar trámites estancados y reasignarlos automáticamente con notificación de alerta (`F23-Task05`).

---

## I. Cobertura de Auditoría y Métricas

A continuación se presentan las métricas formales de auditoría según las directrices establecidas:

### Fórmulas de Cálculo:
1. **Cobertura de Inspección:**
   $$\text{Cobertura de Inspección} = \frac{\text{Elementos Inspeccionados}}{\text{Total de Elementos Identificados}} \times 100$$
   - Total Identificados: 32 capacidades (`F23-001` a `F23-032`).
   - Inspeccionados: 32.
   - **Resultado:** $\frac{32}{32} \times 100 = 100.0\%$

2. **Cobertura de Ejecución:**
   $$\text{Cobertura de Ejecución} = \frac{\text{Elementos con Pruebas Ejecutadas}}{\text{Elementos que Requieren Pruebas}} \times 100$$
   - Elementos que requieren pruebas: 32.
   - Elementos con pruebas ejecutadas (en suite de regresión 53/53): 14.
   - **Resultado:** $\frac{14}{32} \times 100 = 43.75\%$

3. **Cobertura de Verificación:**
   $$\text{Cobertura de Verificación} = \frac{\text{Elementos que Cumplieron Criterios}}{\text{Total de Elementos Verificados}} \times 100$$
   - Elementos verificados: 14.
   - Elementos que cumplieron criterios: 8.
   - **Resultado:** $\frac{8}{14} \times 100 = 57.14\%$

4. **Elementos Bloqueados:**
   - 0 elementos bloqueados técnicamente por entorno; 18 elementos clasificados como ausentes o pendientes de implementación formal.

---

## J. Registro Consolidado de Avance de Subcapacidades

| ID | Subcapacidad | Estado Funcional | Avance de Auditoría | Pruebas Ejecutadas | Evidencias en Código | Brechas Detectadas | Bloqueos | Acción Pendiente | Próximo Paso |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **F23-001** | Definición de Esquemas de Flujo | Implementada parcialmente | Verificado | Sí | `user-service:6365` | Falta diseñador visual | Ninguno | Ampliar | Validación de sintaxis |
| **F23-002** | Decisiones Atómicas de Etapa | Implementada parcialmente | Verificado | Sí | `user-service:6456` | Sin LockService | Ninguno | Corregir | Añadir scriptLock |
| **F23-003** | Historial de Revisiones | Completa y verificada | Verificado | Sí | `user-service:6516` | Ninguna | Ninguno | Mantener | Optimizar consulta |
| **F23-004** | Bandeja Unificada Inbox | Ausente | Inspeccionado | No | Ausente | No existe vista agregada | Ninguno | Proponer | Crear getUnifiedWorkInbox |
| **F23-005** | Enrutamiento Condicional | Requiere mejoras | Inspeccionado | No | Disperso | Sin motor de expresiones | Ninguno | Proponer | Motor de reglas |
| **F23-006** | Temporizadores y SLA | Ausente | Inspeccionado | No | Ausente | Trámites estancados | Ninguno | Proponer | Cron job de escalamiento |
| **F23-007** | Delegación Temporal | Implementada parcialmente | Verificado | Sí | `user-service:1594` | No transfiere trámites | Ninguno | Ampliar | Conectar a workflow |
| **F23-008** | Catálogo Spreadsheets | Implementada parcialmente | Verificado | Sí | `accounting:9510` | Sólo en contabilidad | Ninguno | Ampliar | Estandarizar catálogo |
| **F23-009** | Enrutador SpreadsheetRouter | Requiere mejoras | Inspeccionado | No | Ausente en academic | SPREADSHEET_ID rígido | Ninguno | Proponer | Router transversal |
| **F23-010** | Comunicación Inter-Servicio HMAC | Implementada parcialmente | Verificado | Sí | `user-service:980` | Clave estática | Ninguno | Ampliar | Rotación de llaves |
| **F23-011** | Manejo de Cuotas GAS | Ausente | Inspeccionado | No | Ausente | Sin backoff exponencial | Ninguno | Proponer | Middleware de reintentos |
| **F23-012** | Auditoría Estructurada | Implementada parcialmente | Verificado | Sí | `user-service:142` | Faltan eventos de flujo | Ninguno | Ampliar | Eventos BPMN |
| **F23-013** | Candados por Flujo | Requiere mejoras | Inspeccionado | No | `user-service:6456` | Riesgo de colisión | Ninguno | Corregir | Implementar LockService |
| **F23-014** | Precondiciones de Etapa | Implementada parcialmente | Inspeccionado | No | `user-service:6485` | Salto de etapas manual | Ninguno | Ampliar | Validar estado previo |
| **F23-015** | Idempotencia en Trámites | Ausente | Inspeccionado | No | Ausente | Duplicación por reenvío | Ninguno | Corregir | Idempotency-Key |
| **F23-016** | Notificaciones por Etapa | Implementada parcialmente | Inspeccionado | No | `user-service:5022` | No automática en BPM | Ninguno | Ampliar | Hook de notificación |
| **F23-017** | Firmas Digitales en Flujo | Completa y verificada | Verificado | Sí | `user-service:6546` | Ninguna | Ninguno | Mantener | Preservar hash |
| **F23-018** | Devolución y Corrección | Implementada parcialmente | Verificado | Sí | `user-service:6480` | Observación opcional | Ninguno | Ampliar | Forzar justificación |
| **F23-019** | Cancelación por Solicitante | Ausente | Inspeccionado | No | Ausente | No puede desistir | Ninguno | Proponer | Endpoint de desistimiento |
| **F23-020** | Archivo de Trámites | Implementada parcialmente | Inspeccionado | No | `user-service:1968` | Manual | Ninguno | Mantener | Purgado por política |
| **F23-021** | Pasos Paralelos (Compuertas AND) | Ausente | Inspeccionado | No | Ausente | Sólo lineal secuencial | Ninguno | Proponer | Definición de fork/join |
| **F23-022** | Balanceo Round-Robin | Ausente | Inspeccionado | No | Ausente | Asignación manual | Ninguno | Proponer | Algoritmo de reparto |
| **F23-023** | Soporte Multicuenta GAS | Implementada parcialmente | Inspeccionado | No | `developer:1550` | Enlaces fijos | Ninguno | Ampliar | Catálogo de cuentas |
| **F23-024** | Salud de Cuentas | Implementada parcialmente | Verificado | Sí | `developer:1619` | Sólo servicio local | Ninguno | Mantener | Ping distribuido |
| **F23-025** | Correlation ID Inter-Servicios | Implementada parcialmente | Verificado | Sí | `user-service:2327` | No universal | Ninguno | Ampliar | Propagar correlationId |
| **F23-026** | Fallback de Red | Implementada parcialmente | Inspeccionado | No | `user-service:7026` | Solo en taskService | Ninguno | Ampliar | Circuito breaker |
| **F23-027** | Métricas de Tiempos de Ciclo | Ausente | Inspeccionado | No | Ausente | Sin analítica de SLA | Ninguno | Proponer | Dashboard de tiempos |
| **F23-028** | Auditoría Anti-Manipulación | Implementada parcialmente | Inspeccionado | No | `user-service:6523` | Registros editables | Ninguno | Corregir | Hash encadenado |
| **F23-029** | Validación Criptográfica Tokens | Completa y verificada | Verificado | Sí | `user-service:980` | Ninguna | Ninguno | Mantener | Preservar HMAC |
| **F23-030** | Alertas de Sobrecarga Revisor | Ausente | Inspeccionado | No | Ausente | Sin detección de colapso | Ninguno | Proponer | Alerta por > N trámites |
| **F23-031** | Versionamiento de Flujos | Completa y verificada | Verificado | Sí | `user-service:6390` | Ninguna | Ninguno | Mantener | Preservar versiones |
| **F23-032** | Suite de Regresión Automatizada | Implementada parcialmente | Verificado | Sí | `developer:1267` | Faltan casos multicuenta | Ninguno | Ampliar | Expandir suite |

---

## K. Fuentes y Documentación Consultada
1. *Google Apps Script Quotas and Limits Reference* (developers.google.com/apps-script/guides/services/quotas).
2. *Workflow Patterns and Best Practices for Cloud BPM Engines* (workflowpatterns.com).
3. *Microservices Decomposition in Serverless Architectures* (Martin Fowler, microservices.io).
4. *HMAC SHA-256 Inter-Service Authentication Architecture* (RFC 2104).
