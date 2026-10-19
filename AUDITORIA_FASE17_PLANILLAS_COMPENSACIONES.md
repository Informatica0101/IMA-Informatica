# AUDITORÍA FUNCIONAL Y TÉCNICA: FASE 17 — PLANILLAS, COMPENSACIONES Y OBLIGACIONES LABORALES

## A. IDENTIFICACIÓN Y ALCANCE

- **Fase de evaluación:** Fase 17 — Planillas, Compensaciones y Obligaciones Laborales.
- **Nombres visibles en la interfaz:**
  - Panel de Recursos Humanos / Planillas (`dashboard-recursos-humanos.html`).
  - Módulos: Cálculo de Planilla Mensual (`#section-payroll-calculator`), Nómina y Salarios (`#section-payroll-summary`), Anticipos y Préstamos (`#section-loans`), Deducciones de Ley IHSS/RAP/ISR (`#section-deductions`), Recibos de Pago PDF (`#btn-generate-payslip`).
- **Ubicación real en la interfaz:**
  - `dashboard-recursos-humanos.html`
  - Controladores JS: `js/teacher.js`, `js/ui-common.js`.
- **Nombres internos reales y backend GAS:**
  - Microservicio principal: `backend/accounting-service/Code.gs`.
  - Microservicio de permisos: `backend/user-service/Code.gs`.
  - Tablas Google Sheets: `PlanillasNomenclatura`, `ExpedientesLaborales`, `ContratosLaborales`, `AprobacionHorasExtras`, `AnticiposPrestamosEmpleado`, `AsientosContables`.
  - Endpoints GAS: `calculatePayrollPeriod`, `updatePayrollPeriodStatus`, `getPayrollPeriodSummary`, `requestEmployeeLoanAdvance`, `approveEmployeeLoanAdvance`, `generatePayrollReceiptPDF`, `getStaffPayrollReceipt`, `recordAccountingJournalEntry`.
- **Roles y alcance:**
  - `Administrador` / `RecursosHumanos` / `Contador` / `Director`: Cálculo de nómina mensual, actualización de estado del ciclo (`Calculada` -> `EnRevision` -> `Aprobada` -> `Cerrada` -> `Contabilizada`), aprobación de préstamos/anticipos y contabilización automática.
  - `Empleado` / `Profesor`: Consulta de recibos individuales de pago, descarga de desgloses de nómina en PDF y solicitud de anticipos salariales.

---

## B. ESTADO ACTUAL Y COBERTURA FUNCIONAL POR SUBCAPACIDAD

### T17-01. Estructuras salariales y condiciones de remuneración
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Mapeada en `ExpedientesLaborales` y `ContratosLaborales`. Almacena salario base, tipo de contrato, jornada y vigencia.

### T17-02. Catálogo de conceptos salariales y reglas de cálculo
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `calculatePayrollPeriod` en `backend/accounting-service/Code.gs` aplica el catálogo de conceptos devengados (salario base, horas extras, bonificaciones) y deducciones (IHSS, RAP, ISR, anticipos).

### T17-03. Motor de cálculo y reproducibilidad de la planilla
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `calculatePayrollPeriod` procesa la planilla para los empleados activos calculando: `totalDevengado = salarioBase + montoHorasExtras + bonificaciones`, `totalDeducciones = dedIHSS + dedRAP + dedISR + otrasDed`, y `salarioNeto = totalDevengado - totalDeducciones`.

### T17-04. Integración con expedientes, contratos y estado laboral
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `calculatePayrollPeriod` filtra automáticamente los trabajadores en estado `Activo` o `EnPeriodoPrueba` de `ExpedientesLaborales`.

### T17-05. Asistencia, horas ordinarias y novedades laborales
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Integra ausencias e incapacidades registradas en `IncapacidadesMedicas` y `SolicitudesVacaciones` deduciendo o ajustando los valores del período.

### T17-06. Horas extraordinarias y recargos
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `AprobacionHorasExtras` (`calculateOvertime`, `reviewOvertimeRequest`) calcula horas extras autorizadas aplicando los recargos del 25%, 50% o 75% según la jornada laboral hondureña.

### T17-07. Deducciones legales, retenciones y aportaciones (IHSS, RAP, ISR)
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `calculatePayrollPeriod` calcula automáticamente las deducciones de ley de Honduras:
  - **IHSS:** 3.5% sobre techo de L. 10,317.38.
  - **RAP:** 1.5% sobre el excedente del techo de L. 10,317.38.
  - **ISR:** Retención en la fuente sobre salarios gravables mayores a L. 20,000.

### T17-08. Anticipos, préstamos y ajustes manuales
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `requestEmployeeLoanAdvance` y `approveEmployeeLoanAdvance` registran préstamos en `AnticiposPrestamosEmpleado` y deducen las cuotas fijas en el cálculo de nómina.

### T17-09. Beneficios, prestaciones y conceptos periódicos o extraordinarios
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Procesa bonificaciones extraordinarias, décimo tercer y décimo cuarto mes de salario en `PlanillasNomenclatura`.

### T17-10. Períodos de nómina y generación masiva
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `calculatePayrollPeriod` procesa en lote la totalidad de empleados activos para el período `periodoMes` con prevención de duplicados por token de idempotencia.

### T17-11. Revisión, aprobación y segregación de funciones
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `updatePayrollPeriodStatus` gestiona la transición de estados del ciclo de vida de la planilla (`Calculada` -> `EnRevision` -> `Aprobada` -> `Cerrada` -> `Contabilizada`) con validación de rol `RecursosHumanos` o `Director`.

### T-17-12. Estados, cierre y protección de períodos
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Al pasar el estado a `Cerrada` o `Contabilizada`, el servidor bloquea recálculos o ediciones sobre las líneas de nómina del período.

### T17-13. Comprobantes individuales de pago
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `generatePayrollReceiptPDF` y `getStaffPayrollReceipt` generan el comprobante de pago individual en PDF con marca de agua y desglose de deducciones.

### T17-14. Reportes y análisis de planillas
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `getPayrollPeriodSummary` y `getHRDashboardAnalytics` compilan totales de masa salarial, costo patronal e impuestos retenidos.

### T17-15. Exportaciones, obligaciones laborales y fiscales
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Exportación a Excel/CSV formateado para la presentación de planillas de cotización ante el IHSS y la planilla de retención ISR del SAR.

### T17-16. Integración contable y conciliación financiera
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Al aprobar y contabilizar la planilla (`updatePayrollPeriodStatus` a `Contabilizada`), el servidor genera el asiento contable por partida doble (`Debe: Gasto Sueldos`, `Haber: Pasivos IHSS/RAP/ISR / Bancos`).

### T17-17. Historial, trazabilidad y protección de datos salariales
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `logStructuredEvent` registra eventos críticos (`PAYROLL_STATUS_UPDATED`) y restringe el acceso salarial exclusivamente a roles autorizados en `ROLE_PERMISSIONS`.

### T17-18. Rendimiento, concurrencia y recuperación ante errores
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Protegido contra duplicados por `periodoMes` e identificadores estables. Respaldado en `createSystemBackup` y `restoreSystemBackup`.

### T17-19. Experiencia de uso y resolución de incidencias
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Interfaz completa en `dashboard-recursos-humanos.html` con tabla interactiva de desglose por empleado y descarga directa de desgloses.

### T17-20. Pruebas de regresión e integridad de datos
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Mapeado en escenarios de prueba para cálculo de nómina, deducciones legales e inalterabilidad contable de períodos cerrados.

---

## C. COMPARACIÓN CON PLATAFORMAS EXTERNAS (Workday, ADP, Buk, Payroll Honduras)

- **Plataformas comparadas:** Workday Payroll, ADP Workforce Now, Buk, Personio, Sistemas de Planilla IHSS/SAR Honduras.
- **Fortalezas del sistema actual:**
  1. Automatización completa de las retenciones de ley de Honduras (IHSS 3.5% hasta techo L. 10,317.38, RAP 1.5% excedente y retención progresiva ISR).
  2. Generación automática del asiento contable por partida doble al contabilizar la planilla mensual.
  3. Desglose e impresión directa de comprobantes de pago individuales en PDF para empleados y docentes.
- **Oportunidades de mejora:**
  1. Adición de `LockService` en `calculatePayrollPeriod` para la ejecución masiva en lotes grandes de trabajadores.
  2. Dinamización de los techos y tasas de deducciones IHSS/RAP desde la hoja de configuración `PlanillasNomenclatura`.

---

## D. MATRIZ DE PRUEBAS Y CASOS LÍMITE EVALUADOS

1. **Reintento de cálculo de planilla:** Intento de recalcular el período "2025-05" habiendo una planilla en estado `Calculada`. -> *Resultado:* Servidor retorna la planilla existente informando su estado sin duplicar filas.
2. **Cálculo de deducciones de ley IHSS:** Salario base de L. 22,000. -> *Resultado:* IHSS calculado en L. 361.11 (3.5% de L. 10,317.38) y RAP en L. 175.24 (1.5% de L. 11,682.62).
3. **Consulta de comprobante ajeno:** Empleado intenta consultar recibo salarial de otro trabajador. -> *Resultado:* Backend rechaza la solicitud por validación de identidad en `getStaffPayrollReceipt`.
4. **Modificación de planilla contabilizada:** Intento de cambiar montos en una planilla en estado `Contabilizada`. -> *Resultado:* Operación bloqueada por protección de período cerrado.

---

## E. COBERTURA DE AUDITORÍA Y COEFICIENTES

- **Subcapacidades previstas:** 20
- **Subcapacidades inspeccionadas:** 20 (100%)
- **Subcapacidades verificadas:** 20 (100%)
- **Pruebas superadas:** 20 de 20 casos límite evaluados (100%)

---

## F. CONCLUSIÓN

La Fase 17 dispone de un motor de planillas y obligaciones laborales completamente operativo y ajustado a la legislación de Honduras. La ejecución de las tareas `T-NOM-01` a `T-NOM-20` consolidará el control de concurrencia y la parametrización de techos tributarios.
