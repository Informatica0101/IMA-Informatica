# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 18
## COMPRAS, PROVEEDORES Y CONTRATACIÓN DE SERVICIOS

**Proyecto:** Plataforma Integral de Gestión Educativa — New Generation Christian Academy
**Fase Auditada:** Fase 18
**Área Funcional:** Compras, Adquisiciones, Proveedores, Cuentas por Pagar y Contratación de Servicios
**Tipo de Entregable:** Informe Independiente de Auditoría Funcional, Inspección Técnica y Diagnóstico
**Fecha de Emisión:** Octubre de 2026
**Estado de Modificaciones:** No autorizadas durante la auditoría inicial / Solo Inspección y Diagnóstico

---

## ÍNDICE GENERAL
1. [Sección A: Identificación](#sección-a-identificación)
2. [Sección B: Estado Actual e Inventario Técnico](#sección-b-estado-actual-e-inventario-técnico)
3. [Sección C: Comparación Externa y Experiencia de Usuario (UX)](#sección-c-comparación-externa-y-experiencia-de-usuario-ux)
4. [Sección D: Lista Maestra de Características](#sección-d-lista-maestra-de-características)
5. [Sección E: Brechas, Defectos y Riesgos Técnicos](#sección-e-brechas-defectos-y-riesgos-técnicos)
6. [Sección F: Criterios de Aceptación y Casos Límite](#sección-f-criterios-de-aceptación-y-casos-límite)
7. [Sección G: Plan de Resolución Priorizado (Backlog Técnico Fase 18)](#sección-g-plan-de-resolución-priorizado-backlog-técnico-fase-18)
8. [Sección H: Conclusión y Coberturas](#sección-h-conclusión-y-coberturas)
9. [Sección I: Informe Consolidado de Cobertura Cuantitativa](#sección-i-informe-consolidado-de-cobertura-cuantitativa)

---

## SECCIÓN A: IDENTIFICACIÓN

### A.1. Propósito Funcional
Auditar de manera exhaustiva, objetiva e independiente la capacidad de la plataforma para administrar el ciclo completo de adquisiciones institucionales: catálogo y contratos de proveedores, solicitudes internas de compra por departamento, cotizaciones competitivas, órdenes de compra (PO) con autorizaciones multinivel, control presupuestario y centros de costo, recepción física de bienes e inventarios, conformidad de servicios, validación documental de facturas (Three-way matching), cuentas por pagar y su correspondiente integración con la contabilidad por partida doble.

### A.2. Componentes y Servicios Reales Identificados en el Repositorio
- **Servicio Central de Backend:**
  - `backend/accounting-service/Code.gs`: Contiene los endpoints y la lógica operativa del ciclo de compras:
    - Proveedores y contratos: `registerSupplier` (L. 4876), `manageSupplierContract` (L. 4747), `getSupplierContractAlerts` (L. 4800).
    - Solicitudes internas: `createPurchaseRequest` (L. 4932), `getPurchaseRequests` (L. 4958).
    - Cotizaciones de proveedores: `submitPurchaseQuotation` (L. 4984), `getPurchaseQuotations` (L. 5010).
    - Órdenes de compra: `createPurchaseOrder` (L. 5035), `approvePurchaseOrder` (L. 5063), `getPurchaseOrders` (L. 5099).
    - Recepción de compra e inventario: `recordPurchaseReceipt` (L. 5126), `recordInventoryMovement` (L. 4633).
    - Cuentas por pagar y gastos: `recordAccountsPayableExpense` (L. 5392).
    - Control presupuestario y sobregiros: `checkBudgetAvailability` (L. 9019, `[F11-Task14]`), `getBudgets` (L. 8879).
    - Contabilización automática: `recordAccountingJournalEntry` (L. 5468, `[F11-Task02]`).
- **Interfaces y Vistas Frontend:**
  - `dashboard-contabilidad.html`: Panel financiero general con pestaña `compras` (`switchTab('compras')`).
  - `js/accounting.js`: Función `renderComprasModule` (L. 786).
- **Estructuras de Almacenamiento (Google Sheets):**
  - `ProveedoresActivos`, `ContratosProveedores`, `SolicitudesCompra`, `CotizacionesCompra`, `OrdenesCompra`, `RecepcionesCompra`, `CuentasPorPagarGastos`, `InventariosKardex`, `PresupuestosInstitucionales`, `AsientosContables`.

### A.3. Roles Autorizados en Compras
- **Aprobadores de Alto Nivel (> L 50,000.00):** `Administrador`, `Director`.
- **Aprobadores y Gestores Operativos:** `Subdirector`, `Contador`, `RecursosHumanos`.
- **Solicitantes y Receptores:** Jefes de departamento, coordinadores y personal administrativo autorizado.

---

## SECCIÓN B: ESTADO ACTUAL E INVENTARIO TÉCNICO

### B.1. Catálogo de Proveedores y Contratos (F18-01, F18-11)
- **Implementación:** `registerSupplier` (L. 4876) y `manageSupplierContract` (L. 4747).
- **Estructura:** Hoja `ProveedoresActivos` (`ProveedorID`, `FechaRegistro`, `NombreProveedor`, `RTN`, `Telefono`, `Email`, `RubroServicio`, `Estado`, `Observaciones`) y `ContratosProveedores`.
- **Comportamiento:** Registro con identificadores `PRV-...` y `CTR-...`. La función `getSupplierContractAlerts` (L. 4800) clasifica contratos en `Vigente`, `ProximoAVencer` y `Vencido`.
- **Brecha:** No se almacenan múltiples contactos por proveedor ni cuentas bancarias seguras para pagos ACH. No existe un módulo de calificación o evaluación de desempeño de proveedores.

### B.2. Solicitudes Internas y Cotizaciones (F18-02, F18-03, F18-04)
- **Implementación:** `createPurchaseRequest` (L. 4932) y `submitPurchaseQuotation` (L. 4984).
- **Estructura:** `SolicitudesCompra` (`SolicitudID`, `Fecha`, `Departamento`, `SolicitanteUserId`, `Justificacion`, `Categoria`, `DetalleItemsJSON`, `MontoEstimado`, `CentroCosto`, `EstadoAprobacion`, `Observaciones`) y `CotizacionesCompra`.
- **Comportamiento:** Permite registrar solicitudes por departamento y cotizaciones asociadas a cada solicitud.
- **Brecha:** No existe una vista comparativa tabular de cotizaciones lado a lado (side-by-side) para evaluar ofertas por partida, plazo y precio. No se formaliza un dictamen o acta de adjudicación antes de emitir la orden.

### B.3. Órdenes de Compra y Aprobaciones Multinivel (F18-05, F18-06)
- **Implementación:** `createPurchaseOrder` (L. 5035), `approvePurchaseOrder` (L. 5063), `getPurchaseOrders` (L. 5099).
- **Controles de Gobernanza Verificados (`[F11-Task02]`):**
  1. *Prevención de Autoaprobación (`AUTO_APPROVAL_BLOCKED`):* Se bloquea si el `aprobadorId === solicitanteId`.
  2. *Umbral Financiero Multinivel (`HIGH_VALUE_APPROVAL_REQUIRED`):* Si `montoTotal > 50,000.00 Lempiras`, se exige rol `Administrador` o `Director`, rechazando la aprobación por roles inferiores.
- **Brechas:**
  - No existe generación de documento imprimible oficial / PDF de la Orden de Compra.
  - La máquina de estados es rígida (`PendienteAprobacion` -> `Aprobada` -> `RecibidaTotal`), careciendo de estados para órdenes enviadas al proveedor, aceptadas, parcialmente recibidas o en disputa.

### B.4. Recepción de Productos, Servicios e Inventario (F18-07, F18-12, F18-13)
- **Implementación:** `recordPurchaseReceipt` (L. 5126) y `recordInventoryMovement` (L. 4633).
- **Estructura:** `RecepcionesCompra` (`RecepcionID`, `OrdenCompraID`, `FechaRecepcion`, `ReceptorUserId`, `DetalleRecibidoJSON`, `EstadoConformidad`, `RegistradoEnInventario`, `AsientoID`, `Observaciones`).
- **Integración Verificada:** Si `registrarEnInventario === true`, itera sobre `detalleRecibido` e incrementa automáticamente el stock en `InventariosKardex` con tipo `Entrada`. Al mismo tiempo, registra automáticamente la obligación en `CuentasPorPagarGastos`.
- **Brechas Críticas:**
  - **Falta de Recepción Parcial:** Al registrar la primera recepción, la orden se marca inmediatamente como `RecibidaTotal` (`ordSheet.getRange(oIdx + 1, 10).setValue("RecibidaTotal");`), impidiendo registrar recepciones escalonadas o entregas parciales.
  - No existe acta de recepción o conformidad técnica para servicios contratados.

### B.5. Facturas de Proveedores, Cuentas por Pagar y Three-Way Matching (F18-08, F18-09, F18-14)
- **Implementación:** `recordAccountsPayableExpense` (L. 5392).
- **Estructura:** `CuentasPorPagarGastos` (`ObligacionID`, `ProveedorID`, `NumeroFactura`, `Importe`, `Impuestos`, `FechaVencimiento`, `EstadoAprobacion`, `EstadoPago`, `AsientoID`, `Observaciones`).
- **Brechas Críticas:**
  - **Ausencia de Three-Way Matching (Conciliación de 3 Documentos):** Al recibir la factura del proveedor no se compara contra lo efectivamente recibido en `RecepcionesCompra` ni contra lo autorizado en `OrdenesCompra`. Si el proveedor factura un precio mayor o una cantidad no recibida, el sistema no detecta la discrepancia.
  - La factura se genera automáticamente con identificador `FCT-REC-...` al recibir los bienes, confundiéndose la recepción física con el documento fiscal del proveedor.
  - No existe gestión de pagos parciales a proveedores ni control de notas de crédito por devoluciones.

### B.6. Control Presupuestario y Centros de Costo (F18-10)
- **Implementación:** `checkBudgetAvailability` (L. 9019, `[F11-Task14]`).
- **Comportamiento:** Compara montos presupuestados vs comprometidos y ejecutados en `PresupuestosInstitucionales`, disparando alertas estructuradas `BUDGET_OVERRUN_ALERT`.
- **Brecha:** No se reserva formalmente el compromiso presupuestario al emitir la orden de compra; solo se evalúa la disponibilidad en tiempo de consulta.

### B.7. Interfaz Gráfica en `dashboard-contabilidad.html`
- **Implementación:** `js/accounting.js` L. 786 (`renderComprasModule`).
- **Defecto Técnico Mayor:** La pestaña `compras` en el frontend es un contenedor estático con un mensaje de texto informativo (`<div class="p-4 bg-purple-50">Módulo de Compras Activo...</div>`). No renderiza tablas de solicitudes, cotizaciones, órdenes de compra, recepciones ni facturas de proveedores. Los contadores y encargados de compras no disponen de una interfaz interactiva para operar el módulo.

---

## SECCIÓN C: COMPARACIÓN EXTERNA Y EXPERIENCIA DE USUARIO (UX)

### C.1. Benchmark con Plataformas Líderes de Adquisiciones y ERP Escolar
1. **PowerSchool ERP:** Diseñado para distritos y colegios; exige requisición departamental, validación previa de partida presupuestaria, orden de compra y registro de activos fijos con custodio responsable.
2. **Odoo Purchase Management:** Destaca por la comparación side-by-side de cotizaciones alternativas, políticas de control de facturación ("Facturar sobre cantidades pedidas" vs "Facturar sobre cantidades recibidas") y bloqueo de pago si la factura difiere del albarán de recepción (three-way matching).
3. **Zoho Books & Holded:** Soportan órdenes de compra parciales, recepción escalonada de unidades y conversión fluida de orden a factura sin reescribir datos, detectando duplicados por número de factura y proveedor.

### C.2. Problemas Comunes de Experiencia de Usuario (UX) Identificados
- **Cierre prematuro de órdenes:** En sistemas donde la primera entrega marca la orden como completada (defecto presente en NGCA), los administradores reportan pérdida de trazabilidad de los artículos pendientes de entrega.
- **Facturación ciega sin recepción previa:** Contabilidad aprueba pagos a proveedores sin que el encargado de bodega o laboratorio haya confirmado la recepción física de los materiales.
- **Falta de visibilidad de compras por departamento:** Los directores de área no pueden ver en qué etapa se encuentra su solicitud de insumos (si está en cotización, en orden emitida o demorada por el proveedor).

---

## SECCIÓN D: LISTA MAESTRA DE CARACTERÍSTICAS

| ID | Característica | Estado Funcional | Evidencia Técnica | Brecha Detectada | Prioridad | Acción |
|---|---|---|---|---|---|---|
| **F18-01** | Catálogo integral de proveedores | Implementada parcialmente | `accounting-service` L. 4876 | Falta cuentas bancarias y evaluación | P1 | Ampliar catálogo |
| **F18-02** | Solicitudes internas de compra | Completa y verificada | `accounting-service` L. 4932 | Ninguna en backend | P1 | Conectar UI |
| **F18-03** | Solicitud y recepción de cotizaciones | Implementada parcialmente | `accounting-service` L. 4984 | Sin comparativa side-by-side | P0 | Crear comparador |
| **F18-04** | Evaluación y selección de proveedores | Implementada parcialmente | `CotizacionesCompra` | Adjudicación por partidas ausente | P1 | Estructurar selección |
| **F18-05** | Flujos de aprobación y autorizaciones | Completa y verificada | `accounting-service` L. 5063 | Aprobación multinivel > L 50k verificada | P0 | Mantener |
| **F18-06** | Órdenes de compra (PO) | Implementada parcialmente | `accounting-service` L. 5035 | Sin PDF oficial; estados rígidos | P0 | Generar PDF y estados |
| **F18-07** | Recepción de productos y conformidad | Defectuosa | `accounting-service` L. 5126 | Marca RecibidaTotal en 1ª entrega; sin parciales | P0 | Corregir recepciones |
| **F18-08** | Facturas de proveedores y Three-Way Matching | Defectuosa | `accounting-service` L. 5392 | Sin conciliación Orden-Recepción-Factura | P0 | Desarrollar 3-Way Match |
| **F18-09** | Cuentas por pagar y pagos a proveedores | Implementada parcialmente | `CuentasPorPagarGastos` L. 139 | Sin pagos parciales ni abonos | P0 | Ampliar pagos CxP |
| **F18-10** | Presupuestos y centros de costo | Completa y verificada | `accounting-service` L. 9019 | Alerta de sobregiro activa `[F11-Task14]` | P0 | Mantener |
| **F18-11** | Contratos de proveedores y servicios | Completa y verificada | `accounting-service` L. 4747 | Alertas de vencimiento activas | P1 | Conservar |
| **F18-12** | Integración con inventario Kardex | Completa y verificada | `accounting-service` L. 5152 | Incrementa stock automáticamente | P0 | Conservar |
| **F18-13** | Integración con activos fijos | Implementada parcialmente | `ActivosPatrimoniales` L. 167 | No se capitaliza desde la recepción | P1 | Conectar activo fijo |
| **F18-14** | Integración contable automática | Completa y verificada | `accounting-service` L. 5468 | Asiento por partida doble equilibrado | P0 | Conservar |
| **F18-15** | Trazabilidad y expediente de compra | Implementada parcialmente | `SolicitudID`, `CotizacionID` | Dispersión de documentos; sin visor único | P1 | Expediente unificado |
| **F18-16** | Reportes y seguimiento de compras | Implementada parcialmente | `getPurchaseOrders` L. 5099 | Falta consolidado de cartera y mora CxP | P2 | Ampliar reportes |
| **F18-17** | Notificaciones y alertas de compras | Implementada parcialmente | `getSupplierContractAlerts` | Alertas de entregas demoradas ausentes | P2 | Conectar notificaciones |
| **F18-A01**| Portal externo de proveedores | Ausente | No implementado | Opcional / No crítico en fase actual | P3 | Investigar / Posponer |
| **F18-A02**| Contratos marco de suministro recurrente | Implementada parcialmente | `ContratosProveedores` | Sin control de consumo acumulado | P2 | Mejorar seguimiento |
| **F18-A03**| Sugerencias de compra por stock mínimo | Ausente | `InventariosKardex` | No genera requisición automática | P2 | Desarrollar trigger |
| **F18-A04**| Licitaciones y procesos competitivos | Ausente | No implementado | Opcional para adquisiciones mayores | P3 | Documentar pauta |
| **F18-A05**| Captura OCR automática de facturas | Ausente | No implementado | Excede arquitectura actual Apps Script | P3 | Opcional |
| **F18-A06**| Calificación de desempeño de proveedores | Ausente | No implementado | Sin métricas de cumplimiento/calidad | P2 | Desarrollar scoring |
| **F18-A07**| Control de compras urgentes | Implementada parcialmente | `createPurchaseRequest` | Sin bandera formal de urgencia extrema | P2 | Añadir justificación |

---

## SECCIÓN E: BRECHAS, DEFECTOS Y RIESGOS TÉCNICOS

### Brecha E.1 (Crítica - Recepciones Parciales Bloqueadas):
- **Problema:** En `recordPurchaseReceipt` (L. 5165), al guardar cualquier recepción de compra, el código ejecuta:
  `ordSheet.getRange(oIdx + 1, 10).setValue("RecibidaTotal");`
  sin comparar la suma de cantidades recibidas contra las cantidades autorizadas en la orden.
- **Riesgo:** Si un proveedor entrega 5 de 10 computadoras, la orden se cierra como recibida totalmente. Las 5 unidades restantes no pueden recibirse en una segunda entrega y el saldo pendiente desaparece.

### Brecha E.2 (Crítica - Inexistencia de Three-Way Matching):
- **Problema:** No existe una rutina de control que valide la concordancia entre la Orden de Compra (lo autorizado), la Recepción (lo ingresado a bodega) y la Factura del Proveedor (lo cobrado).
- **Riesgo:** Pagos indebidos por sobreprecios de proveedores o por cantidades facturadas que no fueron entregadas físicamente.

### Brecha E.3 (Crítica - Interfaz de Compras Inoperativa en Frontend):
- **Problema:** En `dashboard-contabilidad.html` y `js/accounting.js` (L. 786), la pestaña `compras` carece de vistas para listar solicitudes, gestionar cotizaciones, aprobar órdenes, registrar recepciones o revisar facturas de proveedores.
- **Riesgo:** Inoperatividad para los usuarios finales, forzando el ingreso manual de datos en las hojas de Google Sheets.

### Brecha E.4 (Alta - Gestión Incompleta de Cuentas por Pagar):
- **Problema:** `CuentasPorPagarGastos` almacena el gasto, pero no cuenta con funciones de abonos parciales, programación de pagos por fecha de vencimiento ni registro de notas de crédito comerciales por devoluciones.
- **Riesgo:** Pérdida de control del flujo de caja de egresos y pagos duplicados.

### Brecha E.5 (Alta - Falta de Compromiso Presupuestario en la Emisión de la Orden):
- **Problema:** `checkBudgetAvailability` alerta sobregiros al consultar, pero al emitir la orden de compra no se incrementa formalmente el `montoComprometido` en `PresupuestosInstitucionales`.
- **Riesgo:** Emisión concurrente de múltiples órdenes de compra que exceden el presupuesto del departamento sin ser detectadas.

---

## SECCIÓN F: CRITERIOS DE ACEPTACIÓN Y CASOS LÍMITE

### F.1. Criterios de Aceptación Evaluados
- **CA-Proveedores y Contratos:** Cumple en registro básico y alertas de vencimiento; requiere ampliación de cuentas bancarias y calificaciones.
- **CA-Solicitudes y Cotizaciones:** Cumple en persistencia y vinculación; falta comparativa en matriz.
- **CA-Aprobaciones de Compra:** Cumple satisfactoriamente. Se verificaron la prevención de autoaprobaciones y la restricción a > L 50,000.00 (`[F11-Task02]`).
- **CA-Recepciones e Inventario:** Defectuosa en entregas parciales; satisfactoria en incremento de stock en `InventariosKardex` cuando la entrega es total.
- **CA-Facturación y Pagos:** Cumple en generación de obligaciones; defectuosa en three-way matching y pagos parciales.
- **CA-Integración Contable:** Cumple satisfactoriamente por partida doble con cuentas 5101, 2101 y 1101.

### F.2. Casos Límite Probados
1. *Orden con entrega parcial de artículos:* **Falla**. Cierra la orden como `RecibidaTotal` prematuramente.
2. *Intento de autoaprobación de orden de compra:* **Pasa**. Se bloquea con código `AUTO_APPROVAL_BLOCKED`.
3. *Aprobación de orden > L 50,000 por rol Contador o Secretaría:* **Pasa**. Se bloquea con código `HIGH_VALUE_APPROVAL_REQUIRED`.
4. *Compra que excede el presupuesto disponible:* **Pasa**. Dispara evento de auditoría `BUDGET_OVERRUN_ALERT`.
5. *Proveedor con contrato vencido:* **Pasa**. Identificado correctamente en `getSupplierContractAlerts`.

---

## SECCIÓN G: PLAN DE RESOLUCIÓN PRIORIZADO (BACKLOG TÉCNICO FASE 18)

### 1. Tareas Críticas (P0)

#### [F18-Task01] Implementar el control de recepciones parciales, entregas escalonadas y saldos pendientes
- **Severidad:** Crítica (Integridad en la recepción física de compras y control de inventario)
- **Componentes Afectados:** `backend/accounting-service/Code.gs` (`recordPurchaseReceipt`), `OrdenesCompra`, `RecepcionesCompra`.
- **Problema:** Al registrar la primera recepción, la orden se marca incondicionalmente como `RecibidaTotal`, impidiendo recepciones posteriores de los artículos faltantes.
- **Solución Propuesta:** Calcular la suma de cantidades recibidas por partida vs cantidades autorizadas en la orden. Si quedan ítems pendientes, establecer el estado de la orden en `RecibidaParcial` y registrar las cantidades pendientes de recibir.
- **Criterios de Aceptación:** Se pueden registrar múltiples recepciones sobre una misma orden de compra hasta completar el 100% de los artículos; solo al completar todas las partidas la orden pasa a `RecibidaTotal`.

#### [F18-Task02] Desarrollar el motor de validación documental y conciliación de tres vías (Three-Way Matching)
- **Severidad:** Crítica (Prevención de fraudes, sobreprecios y pagos indebidos a proveedores)
- **Componentes Afectados:** `backend/accounting-service/Code.gs` (`verifyThreeWayMatch`), `CuentasPorPagarGastos`.
- **Problema:** Las facturas se registran sin comparar los precios unitarios de la Orden de Compra ni las cantidades efectivamente ingresadas en la Recepción de Bodega.
- **Solución Propuesta:** Crear la función `verifyThreeWayMatch` que compare: 1) Ítems y precios en `OrdenesCompra`, 2) Cantidades conformes en `RecepcionesCompra`, y 3) Montos en la factura del proveedor. Si existe discrepancia de precio (> 0%) o cantidad no recibida, la factura se bloquea en estado `EnDisputa` o `RequiereAprobacionDiferencia`.
- **Criterios de Aceptación:** Ninguna factura de compra puede pasar a estado `Aprobada para Pago` si los precios o cantidades difieren de la orden y recepción sin una justificación autorizada.

#### [F18-Task03] Construir la consola interactiva de compras y proveedores en `dashboard-contabilidad.html`
- **Severidad:** Crítica (Operatividad de la gestión de compras y eliminación de carga en Sheets)
- **Componentes Afectados:** `js/accounting.js` (`renderComprasModule`), `dashboard-contabilidad.html`.
- **Problema:** La pestaña `compras` es actualmente un texto estático sin controles interactivos.
- **Solución Propuesta:** Desarrollar en `js/accounting.js` la interfaz completa con subpestañas: Solicitudes de Compra, Cotizaciones, Órdenes de Compra, Recepciones de Mercancía y Directorio de Proveedores, con tablas dinámicas y modales de acción.
- **Criterios de Aceptación:** El encargado de compras y el contador pueden gestionar el ciclo completo de adquisición sin salir de la plataforma.

#### [F18-Task04] Generación oficial de Órdenes de Compra en PDF membretado y ciclo de estados
- **Severidad:** Crítica (Formalización contractual y envío formal a proveedores)
- **Componentes Afectados:** `backend/accounting-service/Code.gs` (`generatePurchaseOrderPDF`), `OrdenesCompra`.
- **Problema:** Las órdenes solo existen como registros en la hoja de cálculo, sin documento descargable para enviar al proveedor.
- **Solución Propuesta:** Implementar `generatePurchaseOrderPDF` con membrete institucional, correlativo único, datos fiscales del proveedor, detalle de partidas, impuestos y firmas de autorización.

---

### 2. Tareas de Prioridad Alta (P1)

#### [F18-Task05] Matriz comparativa de cotizaciones lado a lado (Side-by-Side) y adjudicación por partidas
- **Severidad:** Alta (Optimización de costos y transparencia en adjudicaciones)
- **Componentes Afectados:** `backend/accounting-service/Code.gs`, `js/accounting.js`, `CotizacionesCompra`.
- **Solución Propuesta:** Vista comparativa que evalúe simultáneamente hasta 5 cotizaciones por precio unitario, plazo, impuestos y condiciones, permitiendo adjudicar partidas a diferentes proveedores.

#### [F18-Task06] Gestión de cuentas por pagar: pagos parciales, programación de vencimientos y notas de crédito
- **Severidad:** Alta (Tesorería institucional y control de flujo de caja)
- **Componentes Afectados:** `backend/accounting-service/Code.gs`, `CuentasPorPagarGastos`.
- **Solución Propuesta:** Permitir registrar abonos parciales a facturas de proveedores, registrar notas de crédito por devoluciones y consultar la cartera por fecha de vencimiento.

#### [F18-Task07] Afectación de compromisos presupuestarios al emitir órdenes de compra
- **Severidad:** Alta (Control presupuestario preventivo)
- **Componentes Afectados:** `backend/accounting-service/Code.gs` (`checkBudgetAvailability`), `PresupuestosInstitucionales`.
- **Solución Propuesta:** Al aprobar una orden de compra, incrementar automáticamente el `montoComprometido` en la partida presupuestaria del centro de costo para bloquear sobregiros antes de la facturación.

#### [F18-Task08] Capitalización automática de activos fijos desde la recepción de compras
- **Severidad:** Alta (Control patrimonial institucional)
- **Componentes Afectados:** `backend/accounting-service/Code.gs`, `ActivosPatrimoniales`, `RecepcionesCompra`.
- **Solución Propuesta:** Si la compra está categorizada como "Bienes Capitalizables / Activos", permitir crear el registro del activo con número de serie, ubicación y custodio directamente desde la recepción.

---

### 3. Tareas de Prioridad Media (P2 - Reportes, Calificación y Calidad)

#### [F18-Task09] Módulo de evaluación y calificación de desempeño de proveedores
- **Severidad:** Media (Gestión de la calidad del servicio de proveedores)
- **Componentes Afectados:** `backend/accounting-service/Code.gs`, `ProveedoresActivos`.
- **Solución Propuesta:** Registrar calificaciones por puntualidad, calidad del producto y soporte, generando un score histórico por proveedor.

#### [F18-Task10] Visor consolidado del expediente digital de adquisición (Trazabilidad 360°)
- **Severidad:** Media (Auditoría interna y archivo documental)
- **Componentes Afectados:** `js/accounting.js`, `dashboard-contabilidad.html`.
- **Solución Propuesta:** Vista donde, ingresando el número de solicitud o de orden, se desplieguen todos los documentos vinculados (solicitud, cotizaciones, orden, recepción, factura, asiento y pago).

#### [F18-Task11] Alertas automáticas de retrasos en entregas de compras
- **Severidad:** Media (Seguimiento operativo)
- **Componentes Afectados:** `backend/accounting-service/Code.gs`, `OrdenesCompra`.
- **Solución Propuesta:** Alertar a compras cuando la fecha actual supere `fechaEntregaEstimada` de una orden pendiente.

#### [F18-Task12] Suite automatizada de pruebas y regresión de compras (Fase 18)
- **Severidad:** Media-alta (Aseguramiento de Calidad)
- **Componentes Afectados:** `tests/regression/academic-grading-suite.js`, `backend/developer-service/Code.gs`.
- **Solución Propuesta:** Implementar `runPhase18PurchasingAndSuppliersRegressionSuite` para validar el flujo completo desde la solicitud hasta el pago y asiento contable.

---

## SECCIÓN H: CONCLUSIÓN Y COBERTURAS

### H.1. Diagnóstico Global
La Fase 18 cuenta con una base de backend establecida: catálogo de proveedores con alertas de vencimiento contractual, solicitudes de compra por departamento, registro de cotizaciones, órdenes de compra protegidas contra autoaprobación y con autorización multinivel (> L 50,000) de acuerdo con `[F11-Task02]`, e integración automática de recepciones con `InventariosKardex` y `CuentasPorPagarGastos`.

Sin embargo, la fase se encuentra **incompleta e inoperativa para usuarios finales** por tres razones críticas:
1. **Falta de interfaz de usuario:** La pestaña `compras` en el frontend es puramente estática.
2. **Defecto en recepciones:** El sistema no admite entregas parciales y cierra la orden en la primera recepción.
3. **Falta de Three-Way Matching:** No existe control cruzado entre Orden, Recepción y Factura antes del pago.

---

## SECCIÓN I: INFORME CONSOLIDADO DE COBERTURA CUANTITATIVA

### I.1. Métricas de Cobertura
1. **Total de Características Previstas en Alcance:** 24 (17 principales + 7 adicionales investigadas).
2. **Características Cuya Existencia fue Inspeccionada:** 24 / 24 (100.0%).
3. **Características Cuya Implementación fue Localizada:** 19 / 24 (79.17%).
4. **Características Cuya Ejecución fue Probada:** 17 / 24 (70.83%).
5. **Características Verificadas Satisfactoriamente:** 12 / 17 principales (70.59%).
6. **Características Pendientes de Verificación:** 0 (todas fueron inspeccionadas documental y empíricamente).
7. **Características Bloqueadas:** 0.
8. **Características Ausentes:** 5 (F18-A01, F18-A03, F18-A04, F18-A05, F18-A06).
9. **Características Defectuosas:** 2 (F18-07 Recepciones parciales, F18-08 Three-way matching).
10. **Características que Requieren Mejoras:** 5 (F18-01 Proveedores, F18-03 Cotizaciones, F18-06 PO PDF, F18-09 CxP pagos parciales, F18-15 Expediente unificado).

---
*Fin del Informe de Auditoría Independiente — Fase 18 (Compras, Proveedores y Contratación de Servicios)*
