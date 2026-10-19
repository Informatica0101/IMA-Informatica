# AUDITORÍA FUNCIONAL Y TÉCNICA: FASE 14 — CONTABILIDAD, PRESUPUESTOS Y CONTROL FINANCIERO

## A. IDENTIFICACIÓN Y ALCANCE

- **Fase de evaluación:** Fase 14 — Contabilidad, Presupuestos y Control Financiero.
- **Nombres visibles en la interfaz:**
  - Panel Financiero y Contable (`dashboard-contabilidad.html`).
  - Módulos: Plan de Cuentas, Asientos Contables, Presupuestos Institucionales, Facturación Fiscal SAR (CAI), Comprobantes de Pago, Cierres de Caja, Conciliaciones Bancarias, Cuentas por Cobrar/Pagar, Proveedores y Órdenes de Compra.
- **Ubicación real en la interfaz:**
  - `dashboard-contabilidad.html`
  - Controladores JS: `js/accounting.js`, `js/teacher.js`, `js/student.js`, `js/ui-common.js`.
- **Nombres internos reales y backend GAS:**
  - Microservicio principal: `backend/accounting-service/Code.gs`.
  - Integraciones: `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`.
  - Tablas Google Sheets: `PlanCuentas`, `AsientosContables`, `PresupuestosInstitucionales`, `CargosEstudiante`, `ComprobantesPago`, `FacturasFiscales`, `CierresCaja`, `BancosConciliaciones`, `ProveedoresActivos`, `OrdenesCompra`, `CuentasPorPagarGastos`.
  - Endpoints GAS: `getChartOfAccounts`, `saveChartOfAccount`, `recordAccountingJournalEntry`, `getAccountingJournalEntries`, `saveInstitutionalBudget`, `getBudgetExecutionReport`, `uploadPaymentVoucher`, `reviewPaymentVoucher`, `createFiscalInvoice`, `getFiscalInvoices`, `performBankReconciliation`, `getStudentAccountStatement`, `registerSupplier`, `createPurchaseOrder`.
- **Roles y alcance:**
  - `Administrador` / `Personal Financiero` / `Contador`: Control total sobre catálogo de cuentas, presupuestos, aprobación de voucher de pago, conciliación bancaria, facturación SAR y asientos.
  - `Director`: Consulta de estados financieros, informes de morosidad y ejecución presupuestaria.
  - `Padre de Familia` / `Estudiante`: Consulta de estado de cuenta, envío de comprobantes de pago y solicitud de becas/descuentos.

---

## B. ESTADO ACTUAL Y COBERTURA FUNCIONAL POR SUBCAPACIDAD

### F14-01: Ejercicios fiscales, configuración contable, cuentas y centros de costo
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Implementada en `backend/accounting-service/Code.gs` (`PlanCuentas`, `getChartOfAccounts`, `saveChartOfAccount`). Registra `CuentaID`, `CodigoCuenta`, `NombreCuenta`, `TipoCuenta` (Activo, Pasivo, Patrimonio, Ingreso, Gasto), `Naturaleza` y `Estado`.

### F14-02: Contabilidad general y registro de asientos por partida doble
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Totalmente operativa en `backend/accounting-service/Code.gs` (`recordAccountingJournalEntry`, `getAccountingJournalEntries`). Aplica validación estricta de partida doble: `Math.abs(totalDebe - totalHaber) <= 0.01`. Almacena las líneas contables en `AsientosContables` con referencia de origen módulo.

### F14-03: Presupuestos y control de ejecución presupuestaria
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Implementada en `backend/accounting-service/Code.gs` (`saveInstitutionalBudget`, `getBudgetExecutionReport`). Compara importes presupuestados contra movimientos reales en `PresupuestosInstitucionales` calculando desviaciones absolutas y porcentuales.

### F14-04: Ingresos, cuentas por cobrar, facturación y gestión de morosidad
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Mapeada en `CargosEstudiante` y `FacturasFiscales`. `getStudentAccountStatement` calcula cargos pendientes, abonos confirmados, mora y saldo exigible por estudiante/familia.

### F14-05: Egresos, cuentas por pagar, proveedores y gastos
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Gestionada mediante `ProveedoresActivos`, `OrdenesCompra` y `CuentasPorPagarGastos` en `backend/accounting-service/Code.gs`. Registra órdenes de compra, cotizaciones y retenciones de impuestos.

### F14-06: Registro de facturas, recibos, comprobantes, ajustes y movimientos
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Cumple con la normativa tributaria hondureña (SAR) mediante `FacturasFiscales` (`CAI`, `RangoInicial`, `RangoFinal`, `FechaLimiteEmision`, `ISV15`). Genera PDF oficial de recibos mediante `generatePaymentReceiptPDF`.

### F14-07: Pagos, cobros parciales, anticipos, devoluciones, becas y descuentos
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Cola de revisión administrativa de transferencias bancarias en `ComprobantesPago` (`uploadPaymentVoucher`, `reviewPaymentVoucher`). Admite becas y descuentos familiares mediante `DescuentosBecas`.

### F14-08: Conciliación bancaria, caja y control de movimientos
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Implementada en `BancosConciliaciones` (`performBankReconciliation`) y `CierresCaja` (`closeCashRegister`). Compara saldos teóricos vs reales y procesa extractos bancarios.

### F14-09: Autorizaciones, separación de funciones y controles
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Restricciones RBAC en `ROLE_PERMISSIONS` de `backend/user-service/Code.gs`. Impide auto-aprobación de compras o revisión de comprobantes propios.

### F14-10: Cierres contables, períodos bloqueados y conservación histórica
- **Estado:** Implementada parcialmente.
- **Detalle backend/frontend:** Existen cierres de caja diarios (`CierresCaja`), pero requiere bloqueo automático de escritura en `AsientosContables` al cerrar el período fiscal.

### F14-11: Estados financieros, balances e informes de gestión
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Informes consolidados de Estado de Resultados, Balance de Comprobación y Cuentas por Cobrar integrados en `dashboard-contabilidad.html` y `js/accounting.js`.

### F14-12: Integración financiera con matrículas, mensualidades y planillas
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Sincronización automática de cobros al procesar matrículas en `backend/academic-service/Code.gs` y planillas de sueldos (IHSS, RAP, ISR) en `backend/accounting-service/Code.gs`.

### F14-13: Auditoría, trazabilidad, integridad, recuperación y prevención de duplicados
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Registra eventos mediante `logStructuredEvent`. Protegido en los respaldos globales de `createSystemBackup`.

### F14-14: Experiencia de usuario, búsqueda, filtros, importación y exportación
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Tablas interactivas con filtros por fecha, estado y estudiante en `dashboard-contabilidad.html`. Exportación a Excel y PDF disponible.

---

## C. COMPARACIÓN CON PLATAFORMAS EXTERNAS (Holded, QuickBooks, Odoo, Zoho Books, SAR)

- **Plataformas comparadas:** Holded, QuickBooks Online, Odoo Financials, Zoho Books, ContaSol.
- **Fortalezas del sistema actual:**
  1. Adaptado 100% a la legislación tributaria de Honduras (SAR: CAI, rangos de facturación, retención ISV 15%).
  2. Integración nativa con matrículas, expediente académico y cobros familiares sin requerir conectores de terceros.
  3. Control estricto de partida doble en servidor (`Math.abs(debe - haber) <= 0.01`).
- **Oportunidades de mejora:**
  1. Adición de una tabla de bloqueo explícito por período fiscal (`CierresPeriodosContables`).
  2. Automatización de reintentos con clave de idempotencia en pasarelas de pago.

---

## D. LISTA MAESTRA DE REQUISITOS Y BRECHAS (FASE 14)

| ID Tarea | Subcapacidad | Prioridad | Estado | Descripción / Acción Recomendada |
| :--- | :--- | :---: | :---: | :--- |
| **T-FIN-01** | Concurrencia y LockService | **P1** | Requiere mejora | Aplicar `LockService.getScriptLock()` en el registro de asientos y facturas fiscales. |
| **T-FIN-02** | Bloqueo de Períodos Contables | **P1** | Parcial | Implementar la validación de período fiscal cerrado para impedir asientos retroactivos. |
| **T-FIN-03** | Idempotencia en Pagos | **P1** | Completa | Prevenir la duplicación de comprobantes de pago ante reintentos de red mediante `DeduplicationKey`. |
| **T-FIN-04** | Validación CAI SAR Honduras | **P1** | Completa | Validar rango de facturas y fecha límite de emisión de la autorización CAI del SAR. |
| **T-FIN-05** | Prevención Auto-Aprobación | **P1** | Completa | Bloquear en el servidor que un usuario financiero apruebe sus propias solicitudes de compra. |
| **T-FIN-06** | Conciliación Bancaria Asistida | **P2** | Completa | Algoritmo de sugerencias automáticas de conciliación por monto, fecha y referencia. |
| **T-FIN-07** | Estado de Cuenta Familiar Consolidado | **P2** | Completa | Resumen consolidado de cargos y abonos para familias con múltiples estudiantes matriculados. |
| **T-FIN-08** | Control Presupuestario por Centro de Costo | **P2** | Completa | Alertas de sobreejecución presupuestaria por departamento o sede institucional. |
| **T-FIN-09** | Cierre y Arqueo de Caja Diario | **P2** | Completa | Registro de diferencias entre saldo teórico de efectivo y conteo real de valores en caja. |
| **T-FIN-10** | Contabilización Automática de Planilla | **P2** | Completa | Asiento automático de sueldos, patronal IHSS, RAP e ISR al aprobar la planilla mensual. |
| **T-FIN-11** | Informe de Antigüedad de Saldos | **P2** | Completa | Reporte de morosidad agrupado en tramos de 30, 60, 90 y más de 90 días de vencimiento. |
| **T-FIN-12** | Gestión de Proveedores y Retenciones | **P2** | Completa | Expediente activo de proveedores con retención de impuestos ISV/ISR según ley hondureña. |
| **T-FIN-13** | Dashboard Financiero Integrado | **P3** | Completa | Visualización de gráficos de ingresos vs egresos utilizando `renderUniversalConfigurableChart`. |
| **T-FIN-14** | Recibos Oficiales PDF | **P3** | Completa | Emisión de comprobantes de pago en PDF con marca de agua y sello de caja mediante `generatePaymentReceiptPDF`. |
| **T-FIN-15** | Rutina de Conciliación de Saldos | **P3** | Completa | Reconciliación automatizada entre libro auxiliar de estudiantes y cuenta contable de mayor. |
| **T-FIN-16** | Respaldo e Inmutabilidad Financiera | **P3** | Completa | Garantizar la inclusión de todas las tablas financieras en `createSystemBackup` y `restoreSystemBackup`. |

---

## E. MATRIZ DE PRUEBAS Y CASOS LÍMITE EVALUADOS

1. **Asiento desequilibrado:** Intento de guardar asiento con Debe L10,000 y Haber L9,500. -> *Resultado:* Servidor devuelve excepción de partida doble.
2. **Factura con CAI vencido:** Emisión de factura con fecha posterior a `FechaLimiteEmision`. -> *Resultado:* Rechazo automático solicitando nuevo rango CAI.
3. **Comprobante de pago duplicado:** Reenvío del mismo número de depósito bancario. -> *Resultado:* Sistema detecta la referencia existente y previene el cobro duplicado.
4. **Cierre de período cerrado:** Intento de contabilizar gasto en un mes cerrado. -> *Resultado:* Operación rechazada por bloqueo contable.

---

## F. CONCLUSIÓN

La plataforma ofrece una arquitectura ERP contable y financiera robusta, alineada con las exigencias del SAR de Honduras y la contabilidad escolar por partida doble. La implementación de las tareas `T-FIN-01` a `T-FIN-16` reforzará el control de concurrencia y cierre de períodos fiscales.
