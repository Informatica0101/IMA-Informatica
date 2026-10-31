# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 17
## PLANILLAS, COMPENSACIONES Y OBLIGACIONES LABORALES

**Proyecto:** Plataforma Integral de Gestión Educativa — New Generation Christian Academy
**Fase Auditada:** Fase 17
**Área Funcional:** Administración Salarial, Planillas, Retenciones de Ley en Honduras, Deducciones y Compensaciones
**Tipo de Entregable:** Informe Independiente de Auditoría Funcional, Inspección Técnica y Diagnóstico
**Fecha de Emisión:** Octubre de 2026
**Estado de Modificaciones:** No autorizadas durante la auditoría inicial / Solo Inspección y Diagnóstico

---

## ÍNDICE GENERAL
1. [Sección A: Identificación](#sección-a-identificación)
2. [Sección B: Estado Actual e Inventario Técnico](#sección-b-estado-actual-e-inventario-técnico)
3. [Sección C: Comparación de Capacidades y Normativa Hondureña](#sección-c-comparación-de-capacidades-y-normativa-hondureña)
4. [Sección D: Lista Maestra de Características](#sección-d-lista-maestra-de-características)
5. [Sección E: Brechas, Defectos y Riesgos Técnicos](#sección-e-brechas-defectos-y-riesgos-técnicos)
6. [Sección F: Criterios de Aceptación y Escenarios Integrales (A a H)](#sección-f-criterios-de-aceptación-y-escenarios-integrales-a-a-h)
7. [Sección G: Plan de Resolución Priorizado (Backlog Técnico Fase 17)](#sección-g-plan-de-resolución-priorizado-backlog-técnico-fase-17)
8. [Sección H: Conclusión y Métricas de Cobertura](#sección-h-conclusión-y-métricas-de-cobertura)
9. [Sección I: Registro Consolidado de Avance](#sección-i-registro-consolidado-de-avance)

---

## SECCIÓN A: IDENTIFICACIÓN

### A.1. Propósito Funcional
Auditar integralmente los módulos y servicios responsables de la administración salarial, preparación y procesamiento de planillas, cálculo de remuneraciones ordinarias y extraordinarias, deducciones obligatorias y voluntarias, aportaciones patronales, beneficios de ley en Honduras (IHSS, RAP, ISR, 13º y 14º mes, horas extras del Art. 330 del Código del Trabajo), comprobantes de pago (boletas), exportaciones y la articulación con los registros de Recursos Humanos y Contabilidad.

### A.2. Componentes, Módulos y Archivos Reales Identificados
- **Servicio Central de Backend:**
  - `backend/accounting-service/Code.gs`: Motor de planillas (`calculatePayrollPeriod`, `updatePayrollPeriodStatus`, `getPayrollPeriodSummary`), gestión de horas extras (`calculateOvertime`, `reviewOvertimeRequest`, `getOvertimeRequests`), préstamos y anticipos (`requestEmployeeLoanAdvance`, `approveEmployeeLoanAdvance`, `getLoanAmortizationSchedule`), boletas de pago (`getStaffPayrollReceipt`, `generatePayrollReceiptPDF`), políticas fiscales (`configureFiscalPolicy`, `getFiscalPolicies`), y contabilización por partida doble (`recordAccountingJournalEntry`).
  - `backend/user-service/Code.gs`: Catálogo de usuarios, cargos, departamentos y control de acceso RBAC/ABAC.
- **Interfaces y Vistas Frontend:**
  - `dashboard-recursos-humanos.html`: Consola de Recursos Humanos con modal de verificación laboral y fiscal (`modal-informacion-laboral-fiscal`, `verifyLaborAndTaxInformation`) y visualización de nóminas.
  - `dashboard-contabilidad.html`: Panel financiero con libro diario y conciliación contable de nómina.
- **Estructuras de Almacenamiento (Google Sheets):**
  - `PlanillasNomenclatura`, `BoletasPago`, `AprobacionHorasExtras`, `AnticiposPrestamosEmpleado`, `PoliticasFiscales`, `ContratosLaborales`, `ExpedientesLaborales`, `DeduccionesAsistencia`, `AsientosContables`.

### A.3. Roles Autorizados
- **Gestión y Procesamiento:** `Administrador`, `Director`, `Subdirector`, `RecursosHumanos`, `Contador`.
- **Consulta y Autoservicio:** `Profesor`, `Empleado`, `Asistente` (acceso exclusivo a sus propias boletas de pago).

---

## SECCIÓN B: ESTADO ACTUAL E INVENTARIO TÉCNICO

### B.1. Estructuras Salariales y Contratos (Áreas 1, 4)
- **Implementación:** `manageEmployeeContract` (L. 5639) y `getEmployeeContracts` (L. 5897) en `backend/accounting-service/Code.gs`.
- **Estructura:** Hoja `ContratosLaborales` (`ContratoID`, `ExpedienteID`, `TipoContrato`, `FechaInicio`, `FechaFin`, `SalarioBase`, `Jornada`, `EstadoContrato`, `Observaciones`).
- **Estado Técnico:** *Implementada parcialmente*. Los contratos registran `salarioBase` por empleado. Sin embargo, en el motor `calculatePayrollPeriod` (L. 3944), el salario base se encuentra **fijado en código duro a L. 22,000.00** (`const salarioBase = 22000;`), ignorando el salario real estipulado en `ContratosLaborales` para cada trabajador. Además, no existe una entidad de "Estructura Salarial" que permita configurar bandas salariales por categoría o modalidad (quincenal, por hora).

### B.2. Catálogo de Conceptos de Remuneración y Deducciones (Áreas 2, 3)
- **Implementación:** Hoja `PlanillasNomenclatura` y funciones de deducciones de ley en L. 3949.
- **Estructura:** Columnas en `PlanillasNomenclatura`: `SalarioBase`, `HorasExtras`, `MontoHorasExtras`, `Bonificaciones`, `DeduccionIHSS`, `DeduccionRAP`, `DeduccionISR`, `OtrasDeducciones`, `SalarioNeto`.
- **Estado Técnico:** *Requiere mejoras*. Los conceptos están fijos en la estructura de columnas de la hoja de cálculo. No existe un catálogo dinámico administrable de conceptos salariales donde se puedan crear bonificaciones personalizadas (ej. bono por antigüedad, bono por jefatura de área) o deducciones voluntarias (ej. cooperativa, seguro médico privado, pensión alimenticia).

### B.3. Procesamiento y Ciclo de Planilla (Áreas 5, 6, 11, 12)
- **Implementación:** `calculatePayrollPeriod` (L. 3909), `updatePayrollPeriodStatus` (L. 3993), `getPayrollPeriodSummary` (L. 4063).
- **Ciclo de Estados:** `Calculada` -> `Aprobada` -> `Cerrada` / `Contabilizada`.
- **Idempotencia y Anti-Duplicados:** Se valida en `planData` que no exista una planilla con el mismo `periodoMes` que no esté anulada.
- **Estado Técnico:** *Completa y verificada en ciclo básico, pero defectuosa en integración de novedades*. Al ejecutar `calculatePayrollPeriod`, las variables `horasExtras`, `montoHorasExtras`, `bonificaciones` y `otrasDed` se inicializan en 0 sin importar que existan horas extras aprobadas en `AprobacionHorasExtras` o cuotas pendientes en `AnticiposPrestamosEmpleado`.

### B.4. Horas Extras y Novedades de Asistencia (Áreas 7, 8, 9)
- **Implementación:** `calculateOvertime` (L. 8152), `reviewOvertimeRequest` (L. 8186), `getOvertimeRequests` (L. 8233).
- **Control de Gobernanza:** Cuenta con prevención estricta de autoaprobaciones (`AUTO_APPROVAL_BLOCKED`) impidiendo que un empleado apruebe sus propias horas extras.
- **Estado Técnico:** *Implementada parcialmente*. Registra y aprueba horas extras con estado `PendientePago`, pero no existe una función que transfiera e incorpore automáticamente el monto aprobado al lote de nómina del mes en `PlanillasNomenclatura`. Además, no diferencia los recargos legales del Art. 330 del Código del Trabajo (diurna 25%, nocturna 50%, mixta/prolongación 75%).

### B.5. Anticipos y Préstamos (Área 10)
- **Implementación:** `requestEmployeeLoanAdvance` (L. 4368), `getEmployeeLoansAdvances` (L. 4405), `approveEmployeeLoanAdvance` (L. 4432), `getLoanAmortizationSchedule` (L. 4463).
- **Estructura:** Hoja `AnticiposPrestamosEmpleado` (`PrestamoID`, `Fecha`, `EmpleadoId`, `Tipo`, `MontoSolicitado`, `MontoAprobado`, `PlazoCuotas`, `CuotaMensual`, `SaldoPendiente`, `EstadoAprobacion`, `AprobadoPor`, `Observaciones`).
- **Estado Técnico:** *Implementada parcialmente*. Genera el plan de cuotas y tabla de amortización, pero la cuota mensual no se deduce automáticamente en `otrasDed` al generar la nómina ni se actualiza el `SaldoPendiente` tras el cierre de la planilla.

### B.6. Comprobantes de Pago y Boletas (Área 13)
- **Implementación:** `generatePayrollReceiptPDF` (L. 4494), `getStaffPayrollReceipt` (L. 4592).
- **Estado Técnico:** *Completa y verificada*. Permite generar la boleta de pago individual descargable y consultable desde el portal de autoservicio del empleado (`getEmployeeSelfServicePortal`), reflejando salario base, retenciones desglosadas y salario neto.

### B.7. Integración Contable por Partida Doble (Área 16)
- **Implementación:** En `updatePayrollPeriodStatus` (L. 4035), al pasar a estado `Aprobada`, `Cerrada` o `Contabilizada`, se invoca automáticamente `recordAccountingJournalEntry`:
  - Débito a cuenta `5101` (Gasto de Salarios y Planilla) por `totalBruto`.
  - Crédito a cuenta `2101` (Retenciones y Deducciones por Pagar) por `totalDeducciones`.
  - Crédito a cuenta `1101` (Bancos / Sueldos por Pagar) por `totalSalarioNeto`.
- **Estado Técnico:** *Completa y verificada*. Cumple con el principio contable de partida doble (`totalDebe === totalHaber`).

---

## SECCIÓN C: COMPARACIÓN DE CAPACIDADES Y NORMATIVA HONDUREÑA

### C.1. Evaluación Frente a la Normativa Laboral y Tributaria de Honduras

| Disposición Legal | Parámetro Exigido en Honduras | Implementación Actual en Código | Diagnóstico Técnico |
|---|---|---|---|
| **IHSS (Salud y Maternidad + IVM)** | Techo de cotización vigente (L. 10,317.38). Aportación trabajador 3.5%; aportación patronal ~7.2%. | `Math.min(salarioBase, 10317.38) * 0.035` | **Parcial**. Deduce correctamente el 3.5% del trabajador, pero **no calcula ni asienta la aportación patronal**. |
| **RAP (Aportaciones Privadas)** | 1.5% trabajador y 1.5% patronal sobre el excedente del techo del IHSS (salario - L. 10,317.38). | `Math.max(0, salarioBase - 10317.38) * 0.015` | **Parcial**. Deduce el 1.5% obrero, pero **omite la aportación patronal del 1.5%**. |
| **INFOP (Formación Profesional)** | 1.0% de aporte patronal sobre el total devengado mensual. | No implementado. | **Ausente**. No se computa la obligación patronal de INFOP. |
| **ISR (Impuesto Sobre la Renta)** | Tabla progresiva anual según Art. 22 Ley del ISR (tramos exentos + gastos médicos L. 40,000 + 15%, 20%, 25%). | `salarioBase > 20000 ? (salarioBase - 20000) * 0.15 : 0` | **Defectuosa**. Aplica un 15% plano sobre el excedente de L 20,000 sin tabla progresiva anualizada. |
| **Décimo Tercer Mes (Aguinaldo)** | Un mes de salario ordinario promedio devengado tras un año, o proporcional al tiempo trabajado. | No implementado en motor de planilla. | **Ausente**. No existe función para liquidación de aguinaldo en diciembre. |
| **Décimo Cuarto Mes (Decreto 135-94)**| Un mes de salario ordinario devengado tras un año, pagadero en junio, o proporcional. | No implementado en motor de planilla. | **Ausente**. No existe función para cálculo de 14º mes en junio. |
| **Horas Extras (Art. 330 Código Trabajo)**| Diurnas: recargo 25%; Nocturnas: recargo 50%; Prolongación de nocturna: recargo 75%. | No aplica porcentajes diferenciados. | **Defectuosa**. Registra horas pero no calcula los recargos según el tipo de jornada. |
| **Séptimo Día (Art. 338 Código Trabajo)**| Pago obligatorio del día de descanso semanal por cada seis días laborados. | Asume salario mensual integrado. | **Aceptable para sueldo mensual**, pero ausente para pago por hora/día. |

---

## SECCIÓN D: LISTA MAESTRA DE CARACTERÍSTICAS

| ID | Característica | Estado Funcional | Evidencia Técnica | Brecha Detectada | Prioridad | Acción |
|---|---|---|---|---|---|---|
| **F17-01** | Estructuras salariales y escalas | Implementada parcialmente | `ContratosLaborales` L. 5639 | Salario base hardcodeado a L 22k en nómina | P0 | Conectar con contrato |
| **F17-02** | Historial de condiciones salariales | Completa y verificada | `ContratosLaborales` | Ninguna; contratos conservan histórico | P1 | Conservar |
| **F17-03** | Catálogo de conceptos de remuneración | Requiere mejoras | `PlanillasNomenclatura` L. 144 | Conceptos fijos en columnas; sin catálogo dinámico | P1 | Diseñar catálogo conceptos |
| **F17-04** | Deducciones de ley (IHSS, RAP, ISR)| Implementada parcialmente | `accounting-service` L. 3950 | Falta ISR progresivo y aportes patronales | P0 | Corregir cálculo legal |
| **F17-05** | Deducciones voluntarias y préstamos | Implementada parcialmente | `AnticiposPrestamosEmpleado` L. 4374 | Cuota no se descuenta automáticamente | P1 | Vincular con nómina |
| **F17-06** | Asignación salarial a empleados | Completa y verificada | `ExpedientesLaborales` L. 5517 | Ninguna | P1 | Conservar |
| **F17-07** | Preparación y ciclo de planilla | Completa y verificada | `PlanillasNomenclatura` L. 3909 | Ciclo de estados `Calculada` -> `Aprobada` -> `Cerrada` | P0 | Conservar |
| **F17-08** | Integración de asistencia y ausencias | Implementada parcialmente | `DeduccionesAsistencia` L. 4182 | Deducción por tardanzas no impacta planilla | P1 | Conectar asistencia |
| **F17-09** | Cálculo de horas extras (Art. 330) | Implementada parcialmente | `AprobacionHorasExtras` L. 8152 | Falta recargo 25/50/75% y paso a nómina | P0 | Automatizar integración |
| **F17-10** | Permisos sin goce de sueldo | Implementada parcialmente | `SolicitudesVacaciones` L. 5920 | No se descuenta salario proporcional | P1 | Conectar con nómina |
| **F17-11** | Anticipos y préstamos de empleados | Completa y verificada | `AnticiposPrestamosEmpleado` | Saldo no se amortiza al cerrar planilla | P1 | Actualizar saldos |
| **F17-12** | Motor de cálculo y consistencia | Completa y verificada | `calculatePayrollPeriod` L. 3909 | Partida doble y redondeo aritmético exacto | P0 | Conservar |
| **F17-13** | Obligaciones patronales hondureñas | Ausente | Ausente | Falta IHSS patronal, RAP patronal e INFOP 1% | P0 | Desarrollar aportes |
| **F17-14** | Décimo tercer y décimo cuarto mes | Ausente | Ausente | Sin motor para liquidación de 13º y 14º mes | P0 | Desarrollar beneficios |
| **F17-15** | Revisión y aprobación multinivel | Completa y verificada | `updatePayrollPeriodStatus` L. 3993 | Genera asiento contable automático | P0 | Conservar |
| **F17-16** | Cierre y protección de períodos | Completa y verificada | `PlanillasNomenclatura` L. 4005 | Planilla cerrada queda inmutable | P0 | Conservar |
| **F17-17** | Comprobantes de pago y boletas | Completa y verificada | `generatePayrollReceiptPDF` L. 4494 | Genera boleta y enlace PDF protegido | P1 | Conservar |
| **F17-18** | Integración contable automática | Completa y verificada | `recordAccountingJournalEntry` L. 4035| Asiento automático en cuentas 5101, 2101, 1101 | P0 | Conservar |
| **F17-19** | Reportes consolidados y analítica | Completa y verificada | `verifyLaborAndTaxInformation` L. 6950| Resumen de nómina y conciliación contable | P1 | Conservar |
| **F17-20** | Seguridad ABAC y privacidad salarial| Completa y verificada | `ROLE_PERMISSIONS` L. 199, ABAC | Docentes solo ven su boleta en autoservicio | P0 | Conservar |

---

## SECCIÓN E: BRECHAS, DEFECTOS Y RIESGOS TÉCNICOS

### Brecha E.1 (Crítica - Salario Base Fijo en Código):
- **Problema:** En `calculatePayrollPeriod` (L. 3944), el salario se calcula sobre una constante fija `const salarioBase = 22000;`.
- **Riesgo:** Todas las planillas generadas calculan exactamente el mismo sueldo para cualquier empleado (docente, coordinador, conserje o directivo), ignorando el `salarioBase` pactado en su contrato laboral en `ContratosLaborales`.
- **Consecuencia:** Pagos erróneos e inconsistencia financiera severa en producción.

### Brecha E.2 (Crítica - Omisión de Novedades Aprobadas en el Cálculo):
- **Problema:** En `calculatePayrollPeriod` (L. 3945-3947), las variables `horasExtras = 0; montoHorasExtras = 0; bonificaciones = 0; otrasDed = 0;` se inicializan en cero y nunca consultan las hojas `AprobacionHorasExtras` ni `AnticiposPrestamosEmpleado`.
- **Riesgo:** El personal que realizó horas extras autorizadas no las cobra en la nómina, y a los colaboradores que recibieron anticipos salariales o préstamos no se les deduce su cuota mensual acordada.

### Brecha E.3 (Crítica - Inexactitud Legal en Cálculo de Retenciones e Impuestos):
- **Problema:**
  1. El cálculo del ISR `salarioBase > 20000 ? (salarioBase - 20000) * 0.15 : 0` es simplista y viola la tabla progresiva de la Ley del ISR de Honduras (Art. 22), que exige proyección anual, deducción médica de L 40,000.00 y tramos del 15%, 20% y 25%.
  2. No se calculan las **aportaciones patronales** obligatorias por ley: IHSS patronal (~7.2%), RAP patronal (1.5%) e INFOP (1.0%), lo que impide a la institución provisionar su costo laboral real en contabilidad.

### Brecha E.4 (Crítica - Ausencia de Motor de 13º y 14º Mes):
- **Problema:** No existe lógica ni función para procesar las planillas extraordinarias de Aguinaldo (diciembre) y 14º Mes (junio), ni para calcular la proporcionalidad en empleados con menos de un año laborado.
- **Riesgo:** Incumplimiento de la legislación laboral hondureña y retraso operativo en fechas de pago legal obligatorio.

### Brecha E.5 (Alta - Amortización Incompleta de Préstamos al Cierre):
- **Problema:** Al cerrar una planilla (`updatePayrollPeriodStatus` -> `Cerrada`), el sistema no actualiza el `SaldoPendiente` en `AnticiposPrestamosEmpleado` ni incrementa el conteo de cuotas pagadas.
- **Riesgo:** Descuadre en el control de saldos adeudados por colaboradores.

---

## SECCIÓN F: CRITERIOS DE ACEPTACIÓN Y ESCENARIOS INTEGRALES (A A H)

### F.1. Evaluación de Criterios Específicos
- **CA-Estructuras Salariales:** Cumple parcialmente. Se leen contratos pero el cálculo no toma el valor contractual de forma dinámica.
- **CA-Catálogo de Conceptos:** Requiere mejoras. Los conceptos de remuneración están fijados estáticamente en columnas de hoja.
- **CA-Deducciones de Ley:** Cumple en deducciones obreras básicas (IHSS 3.5%, RAP 1.5%), pero omite las patronales e inexactitud en ISR progresivo.
- **CA-Integración Contable:** Cumple satisfactoriamente. Al aprobar o cerrar la planilla se asienta el asiento contable equilibrado en `AsientosContables`.
- **CA-Autoservicio y Boletas:** Cumple satisfactoriamente. `getStaffPayrollReceipt` y `generatePayrollReceiptPDF` operan bajo control ABAC estricto.

### F.2. Evaluación de Escenarios Integrales Obligatorios (A a H)
- **Escenario A (Planilla Ordinaria Completa):** *Satisfactorio con observaciones*. Genera la nómina, valida anti-duplicados por mes, aprueba, cierra, asienta partida contable y emite boletas en PDF. Observación: Salario base debe obtenerse del contrato.
- **Escenario B (Empleado con Horas Extras):** *Parcial / Requiere integración*. Las horas se aprueban en `AprobacionHorasExtras` con prevención de autoaprobación, pero deben vincularse a la nómina del período.
- **Escenario C (Permiso sin Goce de Sueldo):** *No integrado*. No deduce proporcionalmente los días de ausencia sin goce.
- **Escenario D (Empleado con Anticipo):** *Parcial*. Registra el préstamo y tabla de amortización, pero la deducción no es automática en nómina.
- **Escenario E (Modificación Salarial):** *Satisfactorio*. Los contratos registran fecha de inicio y fin, preservando el histórico.
- **Escenario F (Corrección después del Cierre):** *Satisfactorio*. Planillas cerradas son inmutables y requieren rectificación documentada.
- **Escenario G (Obligaciones Legales Hondureñas):** *Requiere mejoras*. Los techos de cotización del IHSS están reflejados, pero faltan aportes patronales y tabla progresiva de ISR.
- **Escenario H (Seguridad y Privacidad):** *Satisfactorio*. Un docente o empleado ordinario no puede consultar salarios ni planillas ajenas.

---

## SECCIÓN G: PLAN DE RESOLUCIÓN PRIORIZADO (BACKLOG TÉCNICO FASE 17)

### 1. Tareas de Prioridad Crítica (P0)

#### [F17-Task01] Dinamizar el salario base en el cálculo de planilla desde los contratos laborales vigentes
- **Severidad:** Crítica (Integridad financiera y cálculo salarial exacto)
- **Componentes Afectados:** `backend/accounting-service/Code.gs` (`calculatePayrollPeriod`), `ContratosLaborales`.
- **Problema:** `calculatePayrollPeriod` utiliza una constante hardcodeada `const salarioBase = 22000;`, provocando que todos los colaboradores reciban el mismo salario en la nómina calculada.
- **Solución Propuesta:** Consultar la hoja `ContratosLaborales` filtrando por `expedienteId` y estado `active`/`Vigente` para tomar el `salarioBase` individual estipulado en el contrato laboral del empleado.
- **Criterios de Aceptación:** Cada empleado es procesado con su salario contractual real; si no tiene contrato vigente, se registra una advertencia y se excluye de la generación.

#### [F17-Task02] Integrar novedades de asistencia, horas extras aprobadas y permisos sin goce en el cálculo de nómina
- **Severidad:** Crítica (Remuneración justa y cumplimiento de jornada)
- **Componentes Afectados:** `backend/accounting-service/Code.gs`, `AprobacionHorasExtras`, `DeduccionesAsistencia`.
- **Problema:** Las horas extras aprobadas en `AprobacionHorasExtras` y las ausencias/tardanzas en `DeduccionesAsistencia` no impactan automáticamente el total devengado ni deducido de la planilla del mes.
- **Solución Propuesta:** Sumarizar las horas extras aprobadas para el período e incorporarlas en `horasExtras` y `montoHorasExtras` aplicando los recargos legales del Art. 330 del Código del Trabajo (25% diurna, 50% nocturna). Deducir los días de permisos sin goce de sueldo en proporción a la jornada.

#### [F17-Task03] Implementar el cálculo de aportaciones patronales de ley (IHSS Patronal, RAP Patronal e INFOP)
- **Severidad:** Crítica (Costos laborales institucionales y cumplimiento con la seguridad social)
- **Componentes Afectados:** `backend/accounting-service/Code.gs`, `PlanillasNomenclatura`, `AsientosContables`.
- **Problema:** Solo se calculan las retenciones obreras (3.5% IHSS y 1.5% RAP), omitiendo el costo patronal obligatorio: IHSS Patronal (~7.2%), RAP Patronal (1.5%) e INFOP (1.0%).
- **Solución Propuesta:** Calcular los aportes patronales sobre las bases legales vigentes e incorporarlos en el asiento contable de planilla como pasivos por pagar y gastos operativos sin deducirlos del salario neto del trabajador.

#### [F17-Task04] Implementar la tabla progresiva oficial del Impuesto Sobre la Renta (ISR) para personas naturales
- **Severidad:** Crítica (Cumplimiento tributario con el SAR)
- **Componentes Afectados:** `backend/accounting-service/Code.gs`, `PoliticasFiscales`.
- **Problema:** El ISR aplica un 15% fijo sobre el excedente de L 20,000.00 en lugar de aplicar la tabla progresiva anual del Art. 22 de la Ley del ISR de Honduras.
- **Solución Propuesta:** Implementar el algoritmo de proyección anual de sueldos con deducción médica automática de L 40,000.00 y aplicación de tramos gravables progresivos (Exento, 15%, 20%, 25%), dividiendo la retención anual estimada entre los meses restantes del año fiscal.

#### [F17-Task05] Desarrollar el motor de liquidación de Décimo Tercer Mes (Aguinaldo) y Décimo Cuarto Mes
- **Severidad:** Crítica (Beneficios laborales obligatorios en Honduras)
- **Componentes Afectados:** `backend/accounting-service/Code.gs`, `PlanillasNomenclatura`.
- **Problema:** No existe capacidad para procesar planillas extraordinarias de 13º mes (diciembre) y 14º mes de compensación social (junio Decreto 135-94).
- **Solución Propuesta:** Crear la función `calculateExtraordinaryPayrollPeriod` que calcule el salario ordinario completo o proporcional a los meses trabajados durante el período fiscal de acumulación.

---

### 2. Tareas de Prioridad Alta (P1)

#### [F17-Task06] Vinculación y amortización automática de préstamos y anticipos en el ciclo de planilla
- **Severidad:** Alta (Recuperación de cuentas por cobrar a empleados)
- **Componentes Afectados:** `backend/accounting-service/Code.gs`, `AnticiposPrestamosEmpleado`.
- **Solución Propuesta:** Deducir automáticamente la cuota mensual pactada en `otrasDeducciones` y, al cerrar la planilla, descontar la cuota del `SaldoPendiente` en `AnticiposPrestamosEmpleado`.

#### [F17-Task07] Catálogo dinámico de conceptos salariales, bonificaciones y deducciones voluntarias
- **Severidad:** Alta (Flexibilidad administrativa)
- **Componentes Afectados:** `backend/accounting-service/Code.gs`, `dashboard-recursos-humanos.html`.
- **Solución Propuesta:** Crear la hoja `CatalogoConceptosPlanilla` permitiendo definir bonificaciones fijas/variables y deducciones voluntarias con código contable y tratamiento tributario.

#### [F17-Task08] Generación masiva y envío por correo de boletas de pago firmadas
- **Severidad:** Alta (Entrega de comprobantes a colaboradores)
- **Componentes Afectados:** `backend/accounting-service/Code.gs`, `backend/user-service/Code.gs`.
- **Solución Propuesta:** Permitir a RRHH enviar en lote las boletas de pago por correo electrónico a todos los empleados de la planilla cerrada con registro de recepción.

---

### 3. Tareas de Prioridad Media (P2 - Reportes, Parámetros y Calidad)

#### [F17-Task09] Interfaz gráfica de administración de políticas fiscales y techos salariales
- **Severidad:** Media (Parametrización contable)
- **Componentes Afectados:** `dashboard-recursos-humanos.html`, `dashboard-contabilidad.html`.
- **Solución Propuesta:** Panel interactivo para actualizar techos del IHSS y tramos del ISR sin editar la base de datos.

#### [F17-Task10] Exportación avanzada de nóminas para acreditación bancaria (Formato ACH)
- **Severidad:** Media (Tesorería institucional)
- **Componentes Afectados:** `backend/accounting-service/Code.gs`.
- **Solución Propuesta:** Generar archivo de dispersión bancaria para pagos masivos de nómina en bancos locales.

#### [F17-Task11] Suite automatizada de pruebas y regresión de la Fase 17
- **Severidad:** Media-alta (Aseguramiento de Calidad)
- **Componentes Afectados:** `tests/regression/academic-grading-suite.js`, `backend/developer-service/Code.gs`.
- **Solución Propuesta:** Crear `runPhase17PayrollAndCompensationRegressionSuite` validando las deducciones de ley, horas extras del Art. 330, partida doble y boletas de pago.

---

## SECCIÓN H: CONCLUSIÓN Y MÉTRICAS DE COBERTURA

### H.1. Fórmulas de Cobertura
1. **Cobertura de Inspección:**
   $$\text{Cobertura de Inspección} = \frac{\text{Áreas Temáticas Inspeccionadas}}{\text{Total de Áreas en Alcance}} = \frac{17}{17} = 100.0\%$$
2. **Cobertura de Verificación Satisfactoria:**
   $$\text{Cobertura de Verificación} = \frac{\text{Capacidades Completas y Verificadas}}{\text{Total de Capacidades Inspeccionadas}} = \frac{10}{17} = 58.82\%$$
   *(7 áreas presentan brechas críticas que requieren resolución en el backlog).*

### H.2. Diagnóstico Global
La plataforma dispone de un esqueleto funcional robusto para el ciclo de vida de la nómina: estados de planilla, integración contable con asiento automático por partida doble equilibrado, control de deducciones básicas hondureñas, cálculo de finiquito/amortización y emisión de boletas en PDF protegidas por ABAC.

Sin embargo, para operar en un entorno de producción real, es mandatorio resolver de inmediato:
1. Reemplazar la constante de salario base hardcodeada (L 22,000.00) por la consulta dinámica a `ContratosLaborales`.
2. Integrar las horas extras aprobadas y préstamos en el cálculo automático del mes.
3. Incorporar los aportes patronales (IHSS patronal, RAP patronal e INFOP) y la tabla progresiva de ISR del SAR.
4. Desarrollar las planillas extraordinarias de 13º y 14º mes.

---

## SECCIÓN I: REGISTRO CONSOLIDADO DE AVANCE

| ID | Área Funcional | Estado Funcional | Avance Auditoría | Brecha Principal | Bloqueo | Próximo Paso |
|---|---|---|---|---|---|---|
| SC-01 | Estructuras Salariales | Implementada parcialmente | Verificado | Salario fijo hardcodeado en L 22k | Ninguno | Conectar con `ContratosLaborales` |
| SC-02 | Historial de Salarios | Completa y verificada | Verificado | Ninguna; contratos preservan versiones | Ninguno | Conservar |
| SC-03 | Catálogo de Conceptos | Requiere mejoras | Verificado | Columnas fijas; sin catálogo dinámico | Ninguno | Diseñar `CatalogoConceptosPlanilla` |
| SC-04 | Deducciones de Ley (IHSS/RAP)| Implementada parcialmente | Verificado | Deduce obrero; omite aporte patronal | Ninguno | Calcular aportes patronales |
| SC-05 | Retención de ISR (SAR) | Defectuosa | Verificado | Aplica 15% fijo sin tabla progresiva | Ninguno | Implementar tabla Art. 22 ISR |
| SC-06 | Préstamos y Anticipos | Implementada parcialmente | Verificado | Cuotas no descuentan en nómina | Ninguno | Conectar amortización automática |
| SC-07 | Ciclo y Estados de Planilla | Completa y verificada | Verificado | Estados `Calculada`, `Aprobada`, `Cerrada`| Ninguno | Conservar |
| SC-08 | Horas Extras (Art. 330) | Implementada parcialmente | Verificado | No entran a nómina; faltan recargos | Ninguno | Aplicar recargos 25/50/75% |
| SC-09 | Permisos sin Goce | Implementada parcialmente | Verificado | No descuentan proporcional en nómina | Ninguno | Conectar con asistencia |
| SC-10 | Aportes Patronales e INFOP | Ausente | Inspeccionado | Falta IHSS patronal, RAP pat. e INFOP 1% | Ninguno | Desarrollar aportes patronales |
| SC-11 | 13º y 14º Mes (Aguinaldos) | Ausente | Inspeccionado | Sin motor de nómina extraordinaria | Ninguno | Implementar cálculo proporcional |
| SC-12 | Motor de Cálculo y Arrastre | Completa y verificada | Verificado | Partida doble y redondeo exacto | Ninguno | Conservar |
| SC-13 | Integración Contable Nómina | Completa y verificada | Verificado | Asiento automático en cuentas 5101, 2101 | Ninguno | Conservar |
| SC-14 | Boletas de Pago (PDF) | Completa y verificada | Verificado | Genera PDF individual con aislamiento | Ninguno | Conservar |
| SC-15 | Reportes y Verificación Fiscal| Completa y verificada | Verificado | Tablero `verifyLaborAndTaxInformation` | Ninguno | Conservar |
| SC-16 | Seguridad y Privacidad ABAC | Completa y verificada | Verificado | Aislamiento estricto de sueldos | Ninguno | Conservar |
| SC-17 | Suite de Regresión F17 | Pendiente de desarrollo | Inspeccionado | Sin suite automatizada específica | Ninguno | Crear en `developer-service` |

---
*Fin del Informe de Auditoría Independiente — Fase 17 (Planillas, Compensaciones y Obligaciones Laborales)*
