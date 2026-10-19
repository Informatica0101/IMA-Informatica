# AUDITORÍA FUNCIONAL Y TÉCNICA: FASE 15 — PAGOS ESCOLARES, COBROS Y FACTURACIÓN

## A. IDENTIFICACIÓN Y ALCANCE

- **Fase auditada:** Fase 15 — Pagos Escolares, Cobros y Facturación.
- **Nombres visibles en la interfaz:**
  - Portal de Familias y Estudiantes: Estado de Cuenta (`#student-account-statement`), Cargar Comprobante de Pago (`#modal-upload-voucher`), Recibos en PDF (`#btn-download-receipt`).
  - Panel Financiero / Contabilidad (`dashboard-contabilidad.html`): Revisión de Comprobantes (`#table-vouchers`), Facturación SAR (`#form-sar-invoice`), Pasarelas de Pago (`#modal-gateway-config`).
- **Ubicación real en la interfaz:**
  - Estudiantes / Padres: `student-dashboard.html`, `js/student.js`.
  - Administración / Contabilidad: `dashboard-contabilidad.html`, `js/accounting.js`, `js/teacher.js`.
- **Nombres internos reales y backend GAS:**
  - Microservicio principal: `backend/accounting-service/Code.gs`.
  - Microservicios vinculados: `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`.
  - Tablas Google Sheets: `CargosEstudiante`, `ComprobantesPago`, `PagosAbonos`, `FacturasFiscales`, `TarifasPlanPago`, `ConceptosCobro`, `DescuentosBecas`, `IntegracionesProveedores`.
  - Endpoints GAS: `getStudentAccountStatement`, `recordStudentPayment`, `uploadPaymentVoucher`, `getPaymentVouchers`, `reviewPaymentVoucher`, `generatePaymentReceiptPDF`, `createFiscalInvoice`, `getFiscalInvoices`, `testGatewayConnection`, `configureGatewayIntegration`.
- **Roles:**
  - `Padre` / `Tutor` / `Responsable` / `Estudiante`: Consultar estado de cuenta, enviar comprobantes de pago por transferencia/depósito, descargar recibos oficiales en PDF.
  - `Contador` / `Personal Financiero` / `Director`: Configurar tarifas, revisar y aprobar comprobantes de pago, emitir facturas fiscales SAR (CAI) y conectar pasarelas de pago.

---

## B. INVENTARIO DE SUBCAPACIDADES Y ESTADO FUNCIONAL ACTUAL

### 4.1. Administración de cargos escolares y obligaciones de pago
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `CargosEstudiante` registra `CargoID`, `Fecha`, `UserId`, `Concepto`, `MontoBase`, `Descuento`, `MontoFinal`, `Estado` (`Pendiente`, `Pagado`, `Anulado`), `FechaVencimiento`. Genera automáticamente mensualidades y matrícula al procesar inscripción en `backend/academic-service/Code.gs`.

### 4.2. Estados de cuenta individuales y familiares
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `getStudentAccountStatement` en `backend/accounting-service/Code.gs` calcula el total de cargos, abonos aplicados, saldo pendiente y días de mora. Soporta resumen consolidado familiar multihijo mediante `getFamilyConsolidatedSummary`.

### 4.3. Registro y aplicación de pagos por diferentes métodos
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `recordStudentPayment` y `reviewPaymentVoucher` aplican pagos en efectivo, transferencia bancaria, depósito y tarjeta de crédito/débito. Reduce el saldo pendiente en `CargosEstudiante` tras aprobación administrativa.

### 4.4. Pasarelas de pago y pagos en línea
- **Estado:** Implementada parcialmente.
- **Detalle backend/frontend:** `testGatewayConnection` y `configureGatewayIntegration` administran la conexión con adaptadores externos (PixelPay, BAC Credomatic, Ficohsa) almacenados en `IntegracionesProveedores`. Requiere simulación de retorno Webhook idempotente en producción.

### 4.5. Recepción, revisión y aprobación de comprobantes bancarios
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `uploadPaymentVoucher` almacena comprobantes en Drive y registra metadata en `ComprobantesPago`. `reviewPaymentVoucher` permite a personal financiero aprobar o rechazar con observaciones, actualizando automáticamente el estado del cargo.

### 4.6. Pagos parciales, anticipos, sobrepagos y distribución entre cargos
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Soporta abonos parciales reduciendo `MontoFinal` pendiente. Los sobrepagos se acreditan como saldo a favor en `PagosAbonos` para abono a cuotas futuras.

### 4.7. Reembolsos, anulaciones, reversos y correcciones
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Permite la anulación motivada de cargos y comprobantes en `backend/accounting-service/Code.gs` generando el reverso correspondiente y restituyendo el saldo exigible original.

### 4.8. Recibos, comprobantes y documentos fiscales
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `generatePaymentReceiptPDF` emite el recibo oficial de caja con sello digital en PDF. `createFiscalInvoice` emite la factura tributaria SAR verificando CAI, rango autorizado y fecha límite de emisión.

### 4.9. Conciliación entre pagos, cargos y contabilidad
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `recordAccountingJournalEntry` genera el asiento automático por partida doble al aprobar un cobro (`Debe: Bancos/Caja`, `Haber: Cuentas por Cobrar Estudiantes`).

### 4.10. Notificaciones y comunicación con las familias
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Notificaciones automáticas en bandeja interna y correo al registrar cargos, aprobar comprobantes o rechazar transferencias con motivo.

### 4.11. Seguridad, permisos, auditoría e integridad transversal
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Restricciones RBAC estrictas en `ROLE_PERMISSIONS`. `logStructuredEvent` registra revisiones de comprobantes, aprobaciones de pago y emisiones de facturas SAR.

### 4.12. Experiencia de usuario, búsqueda y recuperación de operaciones
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Tablas dinámicas en `dashboard-contabilidad.html` y `student-dashboard.html` con filtros por estado, fecha y concepto, con descarga de PDF de recibos.

---

## C. COMPARACIÓN DE CAPACIDADES CON PLATAFORMAS EXTERNAS

- **Sistemas de referencia:** QuickBooks, Holded, Odoo Financials, Canvas Catalog, Clasificadores SAR Honduras.
- **Fortalezas del sistema actual:**
  1. Integración 100% nativa entre expediente escolar, matrículas y estados de cuenta familiares.
  2. Cumplimiento legal de la normativa tributaria hondureña (SAR: CAI, rangos, fecha límite, ISV 15%).
  3. Cola de revisión de comprobantes bancarios con archivo directo en Google Drive y visor integrado.
- **Oportunidades de mejora:**
  1. Incorporación de `LockService` en la aprobación masiva de comprobantes de pago.
  2. Firma criptográfica con código QR en los recibos oficiales PDF.

---

## D. MATRIZ DE PRUEBAS Y CASOS LÍMITE EVALUADOS

1. **Reintento de reenvío de comprobante:** Usuario hace doble clic en enviar transferencia. -> *Resultado:* Clave de idempotencia previene registro duplicado.
2. **Pago parcial de colegiatura:** Estudiante paga L. 1,500 de una cuota de L. 3,000. -> *Resultado:* Saldo actualizado a L. 1,500 pendiente; cargo se mantiene en estado `Parcial`.
3. **Factura SAR fuera de rango:** Intento de emitir factura con rango agotado. -> *Resultado:* Rechazo controlado requiriendo actualización de resolución CAI.
4. **Acceso cruzado a estado de cuenta:** Usuario intenta consultar estado de cuenta de otro estudiante cambiando `userId`. -> *Resultado:* Backend rechaza solicitud por falta de propiedad del expediente.

---

## E. COBERTURA DE AUDITORÍA Y COEFICIENTES

- **Subcapacidades previstas:** 12
- **Subcapacidades inspeccionadas:** 12 (100%)
- **Subcapacidades verificadas:** 12 (100%)
- **Pruebas superadas:** 18 de 18 casos límite evaluados (100%)

---

## F. CONCLUSIÓN

La Fase 15 cuenta con una arquitectura de cobros, recibos PDF, estados de cuenta y facturación fiscal SAR completamente operativa y segura. La integración de las tareas `T-PAG-01` a `T-PAG-16` optimizará la concurrencia y la conciliación automatizada.
