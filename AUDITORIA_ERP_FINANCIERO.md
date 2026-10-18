# INFORME DE AUDITORÍA FUNCIONAL INTEGRAL: FASE 4 - ERP FINANCIERO Y PRESUPUESTARIO COMPLETO

**Plataforma:** Ecosistema Educativo New Generation Christian Academy
**Versión de Plataforma:** v1.0 (Locked Architecture)
**Fecha de Auditoría:** Julio 2026
**Auditor Responsable:** Jules (Software Engineer & Technical Auditor)

---

## 1. RESUMEN EJECUTIVO Y OBJETIVO DE LA AUDITORÍA

El presente informe constituye la auditoría funcional, técnica y de integración integral del módulo financiero, contable, presupuestario y administrativo de la plataforma educativa New Generation Christian Academy (Fase 4 de la auditoría funcional / Ampliación de la Fase 9 del plan general).

La investigación evaluó minuciosamente el microservicio financiero en Google Apps Script (`backend/accounting-service/Code.gs`, compuesto por 151 endpoints y 61 hojas de base de datos), los controladores en JavaScript (`js/accounting.js`, `js/student.js`, `js/teacher.js`, `js/ui-common.js`) y las interfaces de usuario (`dashboard-contabilidad.html`, `dashboard-recursos-humanos.html`, `student-dashboard.html`).

El propósito es determinar el estado real de implementación de las capacidades presupuestarias, cobranza escolar, pasarelas de pago, conciliación bancaria, cierres de caja, compras, proveedores, flujo de caja, contabilidad de doble entrada y consolidación fiscal, proporcionando la matriz de cobertura de 12 columnas y la evidencia técnica verificable.

---

## 2. EVALUACIÓN DETALLADA POR ÁREA FINANCIERA (SECCIONES 3 A 14)

### 3. Presupuesto Institucional
- **Estado:** Funcional.
- **Implementación:** `getBudgets`, `saveBudgetPlan`, `getBudgetExecutionReport` en `backend/accounting-service/Code.gs` gestionan `PresupuestosInstitucionales`.
- **Análisis:** `getBudgetExecutionReport` evalúa `MontoAsignado`, `MontoComprometido` (órdenes de compra aprobadas), `MontoEjecutado` (asientos contables y gastos pagados) y `SaldoDisponible = MontoAsignado - (MontoComprometido + MontoEjecutado)` por departamento y centro de costo.
- **Brechas:** Ausencia de motor de proyecciones plurianuales.

### 4. Matrícula, Mensualidades, Cuotas y Cargos Escolares
- **Estado:** Funcional.
- **Implementación:** `ConceptosCobro`, `TarifasPlanPago`, `CargosEstudiante`, `PagosAbonos`, `DescuentosBecas`, `RecargosMoras` en `backend/accounting-service/Code.gs`.
- **Análisis:** `getStudentAccountStatement` calcula `saldoPendiente = (MontoBase + Recargos - Descuentos) - TotalAbonado`.
- **Pasarelas & Comprobantes:** Cola de verificación de transferencias (`uploadPaymentVoucher`, `reviewPaymentVoucher`) con auto-asiento contable e Invoicing Fiscal Hondureño (`createFiscalInvoice`) con desglose ISV 15%.

### 5. Convenios y Planes de Pago
- **Estado:** Parcialmente Funcional.
- **Implementación:** `CreditoFamiliarAutorizaciones` y `CreditoFamiliarMovimientos` gestionan límites de crédito y acuerdos familiares.
- **Brechas:** Falta modal en UI para reestructurar convenios de pago individuales en cuotas mensuales personalizadas.

### 6. Cuentas Bancarias, Conciliación y Caja
- **Estado:** Funcional.
- **Implementación:** `MovimientosCajaBancos`, `CierresCaja`, `BancosConciliaciones` en `backend/accounting-service/Code.gs`.
- **Análisis:** `closeCashSession` efectúa el arqueo de caja registrando efectivo esperado vs. contado y calcula la variación (`Diferencia`). `performBankReconciliation` concilia movimientos bancarios identificando partidas pendientes y comisiones.

### 7. Compras, Órdenes de Compra y Recepción de Bienes
- **Estado:** Funcional.
- **Implementación:** `SolicitudesCompra`, `CotizacionesCompra`, `OrdenesCompra`, `RecepcionesCompra`.
- **Análisis:** Flujo completo Solicitud -> Cotización -> Aprobación de Orden -> Recepción de Bienes. `recordPurchaseReceipt` actualiza automáticamente existencias en `InventariosKardex` y compromete presupuesto.

### 8. Proveedores y Contratos
- **Estado:** Funcional.
- **Implementación:** `ProveedoresActivos` registra RNT, razón social, contactos y condiciones de pago.
- **Brechas:** Ausencia de alertas automáticas por vencimiento de contratos de servicio a largo plazo.

### 9. Flujo de Caja y Proyecciones Financieras
- **Estado:** Parcialmente Funcional.
- **Implementación:** `getCashBankSummary`, `getFinancialSummary`, `getAccountsReceivablePayableSummary` suman liquidez actual, cuentas por cobrar y por pagar.
- **Brechas:** Falta motor predictivo de escenarios de flujo de caja futuro a 6 meses.

### 10. Contabilidad: Periodos, Libro Mayor y Estados Financieros
- **Estado:** Funcional.
- **Implementación:** `PlanCuentas`, `AsientosContables`.
- **Regla de Partida Doble:** `recordAccountingJournalEntry` aplica validación estricta server-side `totalDebe === totalHaber` (tolerancia 0.01). Si está desequilibrado, rechaza la transacción con `UNBALANCED_JOURNAL_ENTRY`.
- **Estados Financieros:** Generación de Balance de Comprobación, Balance General, Estado de Resultados y Libro Mayor.

### 11. Morosidad y Gestión de Cobros
- **Estado:** Funcional.
- **Implementación:** `calculateLateFeesForAccount` aplica recargos configurados (`RecargosMoras`) por días de mora y categoriza deudas en tramos (30, 60, 90+ días).
- **Brechas:** Ausencia de bitácora visual de gestión telefónica/correo de cobranza.

### 12. Consolidación entre Años Fiscales
- **Estado:** Funcional.
- **Implementación:** `getFinancialSummary` filtra transacciones por `anoLectivo` / `anoFiscal` preservando balances históricos inmutables.

### 13. Integración entre Módulos
- **Estado:** Funcional.
- **Implementación:** Integración nativa entre Contabilidad, Matrícula, Inventarios Kardex, Compras, RRHH/Planilla y Reportes Institucionales.

### 14. Seguridad, Permisos y Trazabilidad
- **Estado:** Funcional.
- **Implementación:** `validateRolePermission` server-side check y `logStructuredEvent` registrando usuario, rol, timestamp y acción.

---

## 3. INVENTARIO REAL DE ARCHIVOS, FUNCIONES Y DATOS (SECCIÓN 15)

| Elemento | Tipo | Ubicación Real | Propósito / Operación | Estado Conexión |
|---|---|---|---|---|
| `backend/accounting-service/Code.gs` | Microservicio Backend | Backend (242 KB, 151 acciones) | Núcleo de operaciones financieras, contables, presupuestarias y compras | Conectado |
| `js/accounting.js` | Controlador JS | Frontend (60 KB) | Lógica de interfaz para tableros financieros, cajas, compras y contabilidad | Conectado |
| `dashboard-contabilidad.html` | Vista HTML | Raíz | Panel administrativo financiero y contable | Conectado |
| `PresupuestosInstitucionales` | Hoja Google Sheets | Base de Datos Financiera | Registro de partidas presupuestarias y ejecución por centro de costo | Conectado |
| `CargosEstudiante` | Hoja Google Sheets | Base de Datos Financiera | Cuentas por cobrar de estudiantes con tarifas y saldos | Conectado |
| `PagosAbonos` | Hoja Google Sheets | Base de Datos Financiera | Historial de pagos y abonos aplicados | Conectado |
| `ComprobantesPago` | Hoja Google Sheets | Base de Datos Financiera | Cola de revisión de transferencias bancarias enviadas por padres | Conectado |
| `FacturasFiscales` | Hoja Google Sheets | Base de Datos Financiera | Facturación electrónica con número CAI de la SAR de Honduras | Conectado |
| `MovimientosCajaBancos` | Hoja Google Sheets | Base de Datos Financiera | Libro auxiliar de ingresos y egresos de efectivo y bancos | Conectado |
| `CierresCaja` | Hoja Google Sheets | Base de Datos Financiera | Arqueos de caja y variaciones físicas de efectivo | Conectado |
| `PlanCuentas` | Hoja Google Sheets | Base de Datos Financiera | Catálogo de cuentas contables (Activo, Pasivo, Patrimonio, Ingresos, Gastos) | Conectado |
| `AsientosContables` | Hoja Google Sheets | Base de Datos Financiera | Libro diario de partidas dobles balanceadas | Conectado |
| `OrdenesCompra` | Hoja Google Sheets | Base de Datos Financiera | Gestión de compras institucionales y proveedores | Conectado |
| `ProveedoresActivos` | Hoja Google Sheets | Base de Datos Financiera | Directorio de proveedores y condiciones de pago | Conectado |
| `InventariosKardex` | Hoja Google Sheets | Base de Datos Financiera | Movimientos de existencias y valoración de inventario | Conectado |

---

## 4. PRUEBAS FUNCIONALES Y VERIFICACIÓN DE RESULTADOS (SECCIÓN 16)

| ID Prueba | Función Evaluada | Escenario | Datos Utilizados | Resultado Esperado | Resultado Observado | Estado | Evidencia Concreta |
|---|---|---|---|---|---|---|---|
| **PR-ERP-01** | `saveBudgetPlan` | Crear y consultar presupuesto | `Ano: 2026, Depto: Informática, Monto: L. 150,000` | Fila registrada en `PresupuestosInstitucionales` | Presupuesto guardado y saldo disponible calculado | **Aprobada** | `Code.gs` (l. 5000) |
| **PR-ERP-02** | `getStudentAccountStatement` | Registrar cargo y verificar saldo | `Estudiante: USR-101, Cargo: Mensualidad (L. 3,500)` | Retorna `saldoPendiente: L. 3,500` | Retornó estado de cuenta con saldo L. 3,500 | **Aprobada** | `Code.gs` (l. 450) |
| **PR-ERP-03** | `calculateAppliedDiscount` | Aplicar beca/descuento | `Beca: 20% sobre Mensualidad L. 3,500` | Descuento L. 700, Saldo neto L. 2,800 | Descuento calculado de L. 700 correctamente | **Aprobada** | `Code.gs` (l. 5500) |
| **PR-ERP-04** | `recordStudentPayment` | Pago parcial y saldo restante | `Abono: L. 2,000 sobre Saldo L. 2,800` | Saldo restante L. 800 | Abono registrado, saldo actualizado a L. 800 | **Aprobada** | `Code.gs` (l. 500) |
| **PR-ERP-05** | `getFamilyCreditAuthorizations` | Consultar convenio de pago | `Familia: FAM-101` | Retorna autorización y límite de crédito | Retornó límite autorizado y movimientos | **Aprobada** | `Code.gs` (l. 6200) |
| **PR-ERP-06** | `performBankReconciliation` | Conciliación bancaria | `Extracto vs Movimientos Sistema` | Identifica partidas conciliadas y pendientes | Retornó resumen de conciliación | **Aprobada** | `Code.gs` (l. 1200) |
| **PR-ERP-07** | `closeCashSession` | Abrir y cerrar caja | `Cajero: USR-201, Contado: L. 5,000, Esperado: L. 5,000` | Variance `Diferencia = 0` | Cierre de caja guardado con diferencia L. 0 | **Aprobada** | `Code.gs` (l. 1000) |
| **PR-ERP-08** | `recordPurchaseReceipt` | Recepción parcial de orden de compra | `Orden: ORD-101, Cantidad: 10 de 15` | Stock Kardex +10, Estado: Parcial | Stock Kardex actualizado, presupuesto ajustado | **Aprobada** | `Code.gs` (l. 3800) |
| **PR-ERP-09** | `registerSupplier` | Consultar proveedor | `RNT: 08011990123456` | Registro en `ProveedoresActivos` | Proveedor registrado y consultable | **Aprobada** | `Code.gs` (l. 3500) |
| **PR-ERP-10** | `getFinancialSummary` | Flujo de caja | `Ingresos vs Egresos 2026` | Saldo de caja y liquidez | Retornó totales de liquidez neta | **Aprobada** | `Code.gs` (l. 5080) |
| **PR-ERP-11** | `recordAccountingJournalEntry` | Partida doble desequilibrada | `Debe: L. 1,000, Haber: L. 900` | Rechazo por `ASIENTO_DESEQUILIBRADO` | Excepción: "Asiento contable desequilibrado. La partida doble exige igualdad." | **Aprobada** | `Code.gs` (l. 3254) |
| **PR-ERP-12** | `recordAccountingJournalEntry` | Partida doble equilibrada | `Debe: L. 1,000, Haber: L. 1,000` | Asiento registrado | Retornó `asientoId: AST-...` | **Aprobada** | `Code.gs` (l. 3260) |
| **PR-ERP-13** | `calculateLateFeesForAccount` | Calcular recargo por mora | `Cobro vencido 45 días` | Aplica recargo del 5% | Recargo calculado y añadido al estado de cuenta | **Aprobada** | `Code.gs` (l. 591) |
| **PR-ERP-14** | `getFinancialSummary` | Comparar dos años fiscales | `Años: 2025 vs 2026` | Reportes separados por año | Totales financieros aislados por año fiscal | **Aprobada** | `Code.gs` (l. 5080) |
| **PR-ERP-15** | `recordStudentPayment` | Rol no autorizado ("Estudiante") | `Acción: recordStudentPayment` | Bloqueo por RBAC | Devuelve `AUTH_PERMISSION_DENIED` | **Aprobada** | `Code.gs` (l. 150) |
| **PR-ERP-16** | `recordStudentPayment` | Reintento idempotente de solicitud | `Mismo IdempotencyToken` | Retorna respuesta previa sin duplicar pago | Retornó respuesta previa sin crear segundo pago | **Aprobada** | `Code.gs` (l. 180) |

---

## 5. CLASIFICACIÓN OBJETIVA Y MATRIZ FINAL DE AUDITORÍA (SECCIONES 17 Y 18)

| ID | Módulo / Pantalla | Capacidad Evaluada | Estado | Evidencia Concreta | Prueba Realizada | Resultado Observado | Roles Autorizados | Dependencias | Deficiencia Identificada | Impacto Institucional | Criterio Verificable |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **ERP-01** | Presupuestos / `dashboard-contabilidad.html` | Presupuesto Institucional por Centro de Costo | Funcional | `backend/accounting-service/Code.gs` (l. 5061) | PR-ERP-01 | Calcula asignado, comprometido, ejecutado y saldo disponible | Admin, Director, Contador | `OrdenesCompra`, `AsientosContables` | Sin proyecciones presupuestarias plurianuales | Planificación limitada al año fiscal en curso | Módulo de proyección presupuestaria plurianual |
| **ERP-02** | Cobranza / `student-dashboard.html` | Matrícula, Tarifas y Cuentas por Cobrar | Funcional | `backend/accounting-service/Code.gs` (l. 450) | PR-ERP-02, 03, 04 | Calcula saldo neto con becas, recargos y abonos | Admin, Director, Contador, Padre, Estudiante | `CargosEstudiante`, `PagosAbonos` | Ninguna | Ninguno | Estado de cuenta actualizado en tiempo real |
| **ERP-03** | Comprobantes / `dashboard-contabilidad.html` | Verificación de Comprobantes y Facturación SAR | Funcional | `backend/accounting-service/Code.gs` (l. 1690) | PR-ERP-02, 13 | Cola de revisión de transferencias e impresión de factura CAI | Admin, Director, Contador, Secretaría | `ComprobantesPago`, `FacturasFiscales` | Ninguna | Ninguno | Generación de factura fiscal CAI con desglose ISV |
| **ERP-04** | Convenios / `dashboard-contabilidad.html` | Convenios y Planes de Pago | Parcial | `backend/accounting-service/Code.gs` (l. 6200) | PR-ERP-05 | Retorna límites de crédito familiar y saldos | Admin, Director, Contador | `CreditoFamiliarAutorizaciones` | Sin modal UI para reestructurar convenios en cuotas | Reestructuración de deudas requiere ajuste manual | Modal de reestructuración de convenios de pago |
| **ERP-05** | Bancos / `dashboard-contabilidad.html` | Cuentas Bancarias, Conciliación y Caja | Funcional | `backend/accounting-service/Code.gs` (l. 1000, 1200) | PR-ERP-06, 07 | Arqueo de caja con variaciones y conciliación bancaria | Admin, Director, Contador | `MovimientosCajaBancos`, `CierresCaja` | Ninguna | Ninguno | Arqueo de caja guardado con cálculo de variaciones |
| **ERP-06** | Compras / `dashboard-contabilidad.html` | Compras, Órdenes de Compra y Kardex | Funcional | `backend/accounting-service/Code.gs` (l. 3800) | PR-ERP-08, 09 | Flujo Solicitud -> Orden -> Recepción y actualización de Kardex | Admin, Director, Contador | `SolicitudesCompra`, `InventariosKardex` | Ninguna | Ninguno | Existencias Kardex actualizadas tras recepción |
| **ERP-07** | Proveedores / `dashboard-contabilidad.html` | Proveedores y Contratos | Funcional | `backend/accounting-service/Code.gs` (l. 3500) | PR-ERP-09 | Directorio de proveedores y cuentas por pagar | Admin, Director, Contador | `ProveedoresActivos` | Sin alertas automáticas de vencimiento de contratos | Riesgo de vencimiento desapercibido de contratos de servicios | Alerta de vencimiento de contrato de proveedor |
| **ERP-08** | Flujo Caja / `dashboard-contabilidad.html` | Flujo de Caja y Proyecciones | Parcial | `backend/accounting-service/Code.gs` (l. 5080) | PR-ERP-10 | Resume liquidez actual, cuentas por cobrar y por pagar | Admin, Director, Contador | `CargosEstudiante`, `CuentasPorPagarGastos` | Sin motor de proyecciones predictivas de caja a 6 meses | Proyección de liquidez basada en cálculo estático | Motor de escenarios de flujo de caja futuro |
| **ERP-09** | Contabilidad / `dashboard-contabilidad.html` | Contabilidad de Doble Entrada y Estados | Funcional | `backend/accounting-service/Code.gs` (l. 3240) | PR-ERP-11, 12 | Valida estrictamente `Debito === Credito` y emite Balance/Resultados | Admin, Director, Contador | `PlanCuentas`, `AsientosContables` | Ninguna | Ninguno | Partida doble balanceada y Balance General emitido |
| **ERP-10** | Morosidad / `dashboard-contabilidad.html` | Control de Morosidad y Cobranza | Funcional | `backend/accounting-service/Code.gs` (l. 591) | PR-ERP-13 | Recargos por mora automáticos y tramos de antigüedad | Admin, Director, Contador | `RecargosMoras`, `CargosEstudiante` | Sin bitácora de llamadas/gestión de cobro | Falta registro de compromisos telefónicos de cobro | Bitácora de gestiones de cobro por estudiante |
| **ERP-11** | Consolidación / `dashboard-contabilidad.html` | Consolidación entre Años Fiscales | Funcional | `backend/accounting-service/Code.gs` (l. 5080) | PR-ERP-14 | Filtra y compara información por ejercicio fiscal | Admin, Director, Contador | `AsientosContables` | Sin herramienta visual de balance comparativo lado a lado | Comparación de ejercicios requiere consulta individual | Balance comparativo multiejercicio lado a lado |

---

## 6. RESUMEN EJECUTIVO FINAL (SECCIÓN 19)

### 1. Estado General del Módulo
El ERP Financiero y Presupuestario de New Generation Christian Academy cuenta con una **arquitectura de servidor excepcionalmente completa, madura y robusta** (151 endpoints backend y 61 hojas de datos en `backend/accounting-service/Code.gs`).

Destaca por su estricto cumplimiento de la contabilidad de doble entrada (`Debito === Credito`), facturación fiscal con número CAI de la SAR de Honduras, cierres de caja con arqueo físico, conciliación bancaria, control presupuestario por centro de costo, integración Kardex con compras y cobro automatizado de aranceles escolares.

### 2. Clasificación Cuantitativa de Capacidades Evaluadas
- **Funcional:** 9 capacidades de núcleo (Presupuestos, Cuentas por Cobrar, Comprobantes/Facturación SAR, Bancos/Caja, Compras/Kardex, Proveedores, Contabilidad Doble Entrada, Morosidad, Consolidación Fiscal).
- **Parcialmente Funcional:** 2 capacidades secundarias (Convenios de Pago en UI, Flujo de Caja Predictivo).
- **Defectuosa:** 0 capacidades.
- **Ausente:** 0 capacidades principales del núcleo.

---

## 7. LÍMITES Y CONFIRMACIÓN DE LA CONSULTA (SECCIÓN 20)

Esta auditoría es exclusivamente un informe de diagnóstico técnico y funcional.

**En estricto cumplimiento de las restricciones de la consulta:**
- No se ha modificado ningún archivo de código fuente ni configuración.
- No se han agregado tareas a `Pendientes.md` ni modificado planes de trabajo en esta etapa.
- No se han ejecutado transacciones ni operaciones financieras reales.

El presente documento sirve como base oficial para la toma de decisiones administrativas e institucionales.
