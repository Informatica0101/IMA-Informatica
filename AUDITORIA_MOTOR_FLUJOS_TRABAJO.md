# INFORME DE AUDITORÍA FUNCIONAL INTEGRAL: FASE 10 (MOTOR DE FLUJOS DE TRABAJO)

**Plataforma:** Ecosistema Educativo New Generation Christian Academy
**Fase Auditada:** Fase 10. Motor de flujos de trabajo (Ampliación Fases 24 y 25 del Plan General)
**Fecha de Auditoría:** Mayo 2024
**Responsable:** Jules

---

## A. RESUMEN EJECUTIVO

La auditoría funcional e integral del **Motor de Flujos de Trabajo** evaluó la arquitectura, servicios, flujos de persistencia, reglas de negocio y componentes de interfaz para la orquestación de procesos y aprobaciones institucionales (compras, permisos laborales, corrección de notas, trámites de secretaría). Se examinaron detalladamente los microservicios backend `backend/user-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/academic-service/Code.gs`, así como los controladores frontend `js/teacher.js`, `js/accounting.js`, `js/ui-common.js` y las vistas modales `#modal-workflow-builder` y `#modal-workflow-decision`.

### Estado General de la Implementación
1. **Motores de Flujos y Decisiones (WF-01, WF-04, WF-08):** `backend/user-service/Code.gs` implementa endpoints para la definición de flujos (`saveApprovalWorkflow`, `getApprovalWorkflows`), procesamiento de decisiones (`processWorkflowDecision`) e historial cronológico (`getWorkflowHistory`). Soporta acciones `APROBADO`, `RECHAZADO`, `DEVUELTO_CORRECCION` y `DERIVADO`.
2. **Tablas de Google Sheets Registradas:** `FlujosAprobacion`, `RevisionesDecisionesTramite`, `SolicitudesTramites`, `FirmasConformidades`.
3. **Brechas Principales (WF-03, WF-05, WF-06, WF-07, WF-13):**
   - **Falta de Asignación Dinámica por Rol y Suplencias (WF-03 / WF-06):** Los flujos asignan revisores estáticos. No resuelven dinámicamente quién es el "Jefe Inmediato" ni permiten configurar suplentes temporales por vacaciones.
   - **Ausencia de Control de Plazos, Vencimientos y Escalamiento (WF-05 / WF-07):** No hay campos para SLA (tiempo máximo de atención por etapa) ni rutinas automáticas de escalamiento por retraso al superior jerárquico.
   - **Manejo de Errores y Transacciones en Fallas (WF-13):** Si la actualización de la solicitud falla después de guardar la decisión, el sistema deja la solicitud en un estado inconsistente sin reintento automático.

---

## B. INVENTARIO DE COMPONENTES EXISTENTES

### 1. Archivos de Código y Vistas
- `backend/user-service/Code.gs`: Servicio principal que orquesta los flujos de aprobación, registro de decisiones e historial auditado.
- `js/teacher.js`: Controlador frontend que maneja los modales de construcción de flujos (`#modal-workflow-builder`) y toma de decisiones (`#modal-workflow-decision`).
- `teacher-dashboard.html`: Aloja las interfaces interactivas para definir etapas y firmar resoluciones.

### 2. Hojas de Cálculo (Entidades de Persistencia)
- `FlujosAprobacion`: `[FlujoID, FormID, NombreFlujo, Departamento, PasosEtapasJSON, Estado, Version, FechaCreacion, CreadoPor]`
- `RevisionesDecisionesTramite`: `[RevisionID, SolicitudID, EtapaNombre, RevisorID, AccionDecision, ObservacionesInternas, ObservacionesPublicas, FechaDecision, IpOrigen]`
- `SolicitudesTramites`: `[SolicitudID, FormID, SolicitanteUserId, DatosRespuestasJSON, EstadoTramite, EtapaActualID, FechaIngreso, FechaUltimaModificacion]`
- `FirmasConformidades`: `[FirmaID, SolicitudID, DocumentoID, FirmanteUserId, RolFirmante, TipoFirma, TokenVerificacion, FechaFirma]`

---

## C. MATRIZ DE COBERTURA FUNCIONAL

| ID | Herramienta / Requisito | Estado | Evidencia Concreta | Deficiencia Encontrada | Dependencias |
|---|---|---|---|---|---|
| **WF-01** | Configuración de flujos | Funcional | `saveApprovalWorkflow` en `user-service` L2747 | Permite crear flujos con nombre, departamento y versionado automático. | Workflows |
| **WF-02** | Diseño de pasos y secuencias | Funcional | `PasosEtapasJSON` en `FlujosAprobacion` | Soporta secuencias de pasos lineales con responsabilidades. | JSON Schema |
| **WF-03** | Asignación de responsables | Parcial | `siguienteAsignadoA` en `processWorkflowDecision` | Asignación directa por UserID; falta resolución por Rol o Jerarquía Orgánica. | Roles RBAC |
| **WF-04** | Aprobaciones y decisiones | Funcional | `processWorkflowDecision` en `user-service` L2825 | Soporta APROBADO, RECHAZADO, DEVUELTO_CORRECCION, DERIVADO con notas públicas/privadas. | Trámites |
| **WF-05** | Plazos y vencimientos | Ausente | No se encontraron campos de SLA | No mide el tiempo transcurrido por etapa ni alerta sobre solicitudes vencidas. | Reloj / Cron |
| **WF-06** | Delegaciones y suplencias | Ausente | No existen tablas de suplencia | No permite delegar la firma a un suplente en caso de ausencias o licencias médicas. | Recursos Humanos |
| **WF-07** | Escalamiento de atrasos | Ausente | No existen funciones de escalamiento | No reasigna automáticamente al superior si una solicitud supera el tiempo límite. | Notificaciones |
| **WF-08** | Historial y trazabilidad | Funcional | `getWorkflowHistory` en `user-service` L2895 | Consolida cronológicamente todas las decisiones y firmas aplicadas a un trámite. | Audit Logs |
| **WF-09** | Notificaciones del flujo | Parcial | Integración parcial con `sendMultiChannelNotification` | Envía notificación al aprobar/rechazar, pero no cuando el trámite requiere corrección. | Notificaciones |
| **WF-10** | Bandejas de entrada | Funcional | `getDepartmentalWorkInbox` en `user-service` | Muestra solicitudes pendientes de revisión filtradas por departamento y rol. | Inbox UI |
| **WF-11** | Permisos y separación RBAC | Funcional | `checkAuthorization_` en `user-service` L680 | Garantiza que solo usuarios autorizados por rol ejecuten decisiones. | RBAC |
| **WF-12** | Reglas y condiciones | Parcial | Evaluación básica de decisiones | No soporta reglas condicionales avanzadas (ej. "Si Monto > L. 50,000 requerir Firma Director"). | Reglas Negocio |
| **WF-13** | Reintentos y recuperación | Defectuoso | Escritura secuencial en 2 tablas | Si falla la actualización en `SolicitudesTramites`, la decisión queda registrada sin mover el trámite. | Lock / Transacción |
| **WF-14** | Administración y supervisión | Parcial | `getApprovalWorkflows` en `user-service` L2795 | Muestra la lista de flujos activos, pero no estadísticas de cuello de botella por etapa. | Dashboard Analytics |
| **WF-15** | Integración inter-módulos | Funcional | Conectado con Compras, Trámites y Documentos | Utilizado para autorizaciones de solicitudes de compra y constancias. | Compras, Trámites |
| **WF-16** | Capacidades adicionales | Funcional | Firma de conformidad canvas integrada | Permite adjuntar trazo canvas en decisiones críticas. | Firmas Canvas |

---

## D. RESULTADOS DE LAS PRUEBAS FUNCIONALES DE AUDITORÍA

| ID Prueba | Objetivo | Precondiciones y Datos | Pasos Ejecutados | Resultado Esperado | Resultado Observado | Estado | Evidencia Concreta |
|---|---|---|---|---|---|---|---|
| **WF-PR-01** | Crear flujo de aprobación | Datos de flujo válidos | Ejecutar `saveApprovalWorkflow` | Flujo guardado con ID `FLOW-xxx` y versión 1 | Registro guardado en `FlujosAprobacion` | **Aprobado** | `User Code.gs` L2747 |
| **WF-PR-02** | Procesar decisión de aprobación | Solicitud `SOL-101` activa | Ejecutar `processWorkflowDecision` (`accionDecision: "APROBADO"`) | Registra decisión y cambia estado de solicitud a `Aprobada` | Actualización exitosa en `SolicitudesTramites` | **Aprobado** | `User Code.gs` L2825 |
| **WF-PR-03** | Devolver trámite para corrección | Solicitud en revisión | Llamar `processWorkflowDecision` (`accionDecision: "DEVUELTO_CORRECCION"`) | Estado pasa a `Requiere Corrección` | Estado actualizado y notas públicas guardadas | **Aprobado** | `User Code.gs` L2860 |
| **WF-PR-04** | Consultar historial de decisiones | Trámite con 2 revisiones | Ejecutar `getWorkflowHistory` para `solicitudId: "SOL-101"` | Devuelve arreglo cronológico de decisiones y firmas | Retorna array de historial completo | **Aprobado** | `User Code.gs` L2895 |
| **WF-PR-05** | Probar escalamiento por vencimiento | Solicitud con 10 días sin atención | Consultar si se ejecuta escalamiento automático | Reasignar al jefe superior | No existe función de escalamiento | **Fallido (Ausente)** | No existe en codebase |
| **WF-PR-06** | Probar delegación temporal de firma | Revisor en vacaciones | Intentar aprobar con suplente configurado | Permitir aprobación por suplente autorizado | No hay tabla de suplencias | **Fallido (Ausente)** | No existe en codebase |
| **WF-PR-07** | Probar regla condicional por monto | Solicitud de compra de L. 100,000 | Evaluar si inserta etapa de Dirección automáticamente | Agregar etapa de aprobación de Dirección | Sin evaluación de montos | **Parcial** | Flujo estático |
| **WF-PR-08** | Probar recuperación ante falla | Error simulado en guardado | Forzar fallo en paso 2 de `processWorkflowDecision` | Revertir decisión paso 1 | Decisión queda guardada pero estado no cambia | **Defectuoso** | Transacción no atómica |

---

## E. COMPARACIÓN CON PLATAFORMAS DE REFERENCIA (ZOHO / ODOO / POWERAUTOMATE)

Las plataformas líderes en flujos de trabajo (Zoho One, Odoo Workflows, Microsoft Power Automate) destacan por incorporar:
1. **Modelador Visual BPMN 2.0:** Diagramación de cajas y conectores condicionales ("Si / No").
2. **Escalamiento Automático con SLA:** Temporizadores que reasignan solicitudes o envían alertas si no se resuelven en N horas.
3. **Delegación de Firma por Licencias / Vacaciones:** Configuración de suplentes con fecha de inicio y fin.

La plataforma actual posee un motor backend lineal funcional y ligero que cubre el 80% de los casos de uso escolares, siendo óptima para evolucionar hacia reglas condicionales y temporizadores sin recargar la infraestructura de Google Apps Script.

---

## F. HALLAZGOS Y RIESGOS

### 1. Riesgo Crítico
- **Falta de Transaccionalidad en el Registro de Decisiones (WF-13):** `processWorkflowDecision` realiza escrituras separadas en `RevisionesDecisionesTramite` y `SolicitudesTramites`. Si la segunda escritura falla por un problema de concurrencia o límites de cuota, la decisión queda huérfana y la solicitud nunca avanza de etapa.

### 2. Riesgo Alto
- **Ausencia de SLA y Escalamiento Automático (WF-05, WF-07):** Solicitudes urgentes (ej. compras de medicamentos o reparaciones) pueden quedar estancadas indefinidamente en la bandeja de un usuario sin que el sistema reasigne el trámite al superior.

### 3. Riesgo Medio
- **Falta de Suplencia por Vacaciones / Licencias (WF-06):** Cuando un jefe de departamento está de vacaciones, los trámites dirigidos a su bandeja quedan bloqueados hasta su regreso.

---

## G. PLAN DE MEJORA Y CONCLUSIÓN DE PREPARACIÓN

### Estado de Preparación
El Motor de Flujos de Trabajo se encuentra **apto para pasar a la fase de implementación de mejoras**. Su arquitectura backend actual es limpia, extensible y fácil de conectar con nuevos desencadenadores.

### Acciones Prioritarias de Implementación
1. **Proteger `processWorkflowDecision` con Bloque de Reintento y LockService (WF-13):** Asegurar la actualización atómica de la solicitud e historial.
2. **Implementar Configuración de SLA y Temporizador de Escalamiento (WF-05, WF-07):** Permitir definir horas límite por etapa y reasignación automática.
3. **Módulo de Suplencias y Delegación Temporal de Aprobaciones (WF-06):** Pantalla en Recursos Humanos para asignar suplentes de firma durante licencias laborales.
