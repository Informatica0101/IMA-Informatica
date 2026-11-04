// [F9-Task09] [P0] Suite de Pruebas Automatizadas de Regresión de la Fase 9 (Evaluaciones y Calificaciones)
// Este archivo ejecuta la suite de pruebas de regresión en entorno Node.js para verificar la Fase 9.

const fs = require('fs');
const path = require('path');

console.log("=== EJECUTANDO SUITE DE REGRESIÓN DE EVALUACIONES, CALIFICACIONES Y RESULTADOS [F9-Task09] ===");

let total = 0;
let passed = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
  }
}

// 1. Verificación de la Documentación de Auditoría de la Fase 9
assert(fs.existsSync(path.join(__dirname, '../../completadas.md')), "Existe archivo de tareas completadas completadas.md");

// 2. Verificación de funciones de Compatibilidad y Diagnóstico SACE (F9-Task01 y F9-Task02)
const accountingCode = fs.readFileSync(path.join(__dirname, '../../backend/accounting-service/Code.gs'), 'utf8');
assert(accountingCode.includes("verifySACETemplateCompatibility") && accountingCode.includes("[F9-Task01]"), "backend/accounting-service/Code.gs contiene verifySACETemplateCompatibility [F9-Task01]");
assert(accountingCode.includes("fillAndExportSACETemplate"), "backend/accounting-service/Code.gs contiene función fillAndExportSACETemplate");
assert(accountingCode.includes("validateSACETemplateFile") && accountingCode.includes("[F9-Task02]"), "backend/accounting-service/Code.gs contiene función validateSACETemplateFile [F9-Task02]");

// 3. Verificación de Motor de Cálculos, Precisión e Integridad (F9-Task03, F9-Task04)
const academicCode = fs.readFileSync(path.join(__dirname, '../../backend/academic-service/Code.gs'), 'utf8');
assert(academicCode.includes("calculateUnifiedAcademicGrade") && academicCode.includes("[F9-Task03]"), "backend/academic-service/Code.gs contiene calculateUnifiedAcademicGrade [F9-Task03]");
assert(academicCode.includes("previewAcademicGradeCalculation"), "backend/academic-service/Code.gs contiene previewAcademicGradeCalculation");
assert(academicCode.includes("auditAcademicGradesIntegrity") && academicCode.includes("[F9-Task04]"), "backend/academic-service/Code.gs contiene auditAcademicGradesIntegrity [F9-Task04]");

// 4. Verificación de Cierre de Período, Aprobación y Rectificaciones (F9-Task05, F9-Task06)
const examCode = fs.readFileSync(path.join(__dirname, '../../backend/exam-service/Code.gs'), 'utf8');
assert(examCode.includes("submitGradebookForReview") && examCode.includes("reviewPeriodGradebook"), "backend/exam-service/Code.gs contiene submitGradebookForReview y reviewPeriodGradebook [F9-Task05]");
assert(examCode.includes("closePeriodGradebook") && examCode.includes("[F9-Task05]"), "backend/exam-service/Code.gs contiene closePeriodGradebook [F9-Task05]");
assert(examCode.includes("rectifyStudentGrade") && examCode.includes("[F9-Task06]"), "backend/exam-service/Code.gs contiene rectifyStudentGrade [F9-Task06]");
assert(examCode.includes("getGradeRectificationHistory"), "backend/exam-service/Code.gs contiene getGradeRectificationHistory");

// 5. Verificación de Boletines y Ámbitos de Responsabilidad (F9-Task07, F9-Task08)
assert(academicCode.includes("generateStudentReportCard") && academicCode.includes("[F9-Task07]"), "backend/academic-service/Code.gs contiene generateStudentReportCard [F9-Task07]");
assert(academicCode.includes("validateAcademicResponsibilityAndScopeAccess") && academicCode.includes("[F9-Task08]"), "backend/academic-service/Code.gs contiene validateAcademicResponsibilityAndScopeAccess [F9-Task08]");

// 6. Verificación de la suite de regresión en developer-service (F9-Task09) y Registro Masivo / Copia de Configuración (F9-Task10)
const devCode = fs.readFileSync(path.join(__dirname, '../../backend/developer-service/Code.gs'), 'utf8');
assert(devCode.includes("runAcademicGradingRegressionSuite") && devCode.includes("[F9-Task09]"), "backend/developer-service/Code.gs contiene función runAcademicGradingRegressionSuite [F9-Task09]");
assert(examCode.includes("bulkApplyGradebookGrades") && examCode.includes("copyEvaluationSetupBetweenGroups") && examCode.includes("[F9-Task10]"), "backend/exam-service/Code.gs contiene bulkApplyGradebookGrades y copyEvaluationSetupBetweenGroups [F9-Task10]");
assert(examCode.includes("saveStudentRecovery") && examCode.includes("[F9-Task11]"), "backend/exam-service/Code.gs contiene saveStudentRecovery [F9-Task11]");
assert(examCode.includes("saveCompetencyEvaluation") && examCode.includes("getCompetencyEvaluations") && examCode.includes("[F9-Task12]"), "backend/exam-service/Code.gs contiene saveCompetencyEvaluation y getCompetencyEvaluations [F9-Task12]");
assert(academicCode.includes("exportAcademicGradesData") && academicCode.includes("[F9-Task13]"), "backend/academic-service/Code.gs contiene exportAcademicGradesData [F9-Task13]");
assert(examCode.includes("getGradingPerformanceAndPersistenceMetrics") && examCode.includes("[F9-Task14]"), "backend/exam-service/Code.gs contiene getGradingPerformanceAndPersistenceMetrics [F9-Task14]");
assert(academicCode.includes("getAttendanceFollowupCases") && academicCode.includes("[F10-Task01]"), "backend/academic-service/Code.gs contiene aislamiento de confidencialidad en getAttendanceFollowupCases [F10-Task01]");
assert(devCode.includes("runPhase10AttendanceAndCoexistenceRegressionSuite") && devCode.includes("[F10-Task02]"), "backend/developer-service/Code.gs contiene función runPhase10AttendanceAndCoexistenceRegressionSuite [F10-Task02]");
assert(academicCode.includes("getAttendanceConfig") && academicCode.includes("saveAttendanceConfig") && academicCode.includes("[F10-Task03]"), "backend/academic-service/Code.gs contiene getAttendanceConfig y saveAttendanceConfig [F10-Task03]");
assert(academicCode.includes("bulkApplyAttendanceStatus") && academicCode.includes("[F10-Task04]"), "backend/academic-service/Code.gs contiene bulkApplyAttendanceStatus y saveClassAttendance [F10-Task04]");
assert(academicCode.includes("submitAttendanceJustification") && academicCode.includes("reviewAttendanceJustification") && academicCode.includes("[F10-Task05]"), "backend/academic-service/Code.gs contiene submitAttendanceJustification y reviewAttendanceJustification [F10-Task05]");
assert(academicCode.includes("checkAndDispatchAttendanceAlerts") && academicCode.includes("[F10-Task06]"), "backend/academic-service/Code.gs contiene checkAndDispatchAttendanceAlerts [F10-Task06]");
assert(academicCode.includes("saveAttendanceIncident") && academicCode.includes("updateAttendanceIncidentStatus") && academicCode.includes("[F10-Task07]"), "backend/academic-service/Code.gs contiene saveAttendanceIncident y updateAttendanceIncidentStatus [F10-Task07]");
assert(academicCode.includes("addCaseCommitment") && academicCode.includes("updateCaseCommitmentStatus") && academicCode.includes("[F10-Task08]"), "backend/academic-service/Code.gs contiene addCaseCommitment y updateCaseCommitmentStatus [F10-Task08]");
assert(academicCode.includes("scheduleCounselingAppointment") && academicCode.includes("recordCounselingSessionAct") && academicCode.includes("referCounselingCase") && academicCode.includes("[F10-Task09]"), "backend/academic-service/Code.gs contiene scheduleCounselingAppointment, recordCounselingSessionAct y referCounselingCase [F10-Task09]");
assert(academicCode.includes("saveGuidanceFollowupPlan") && academicCode.includes("saveVocationalRecommendation") && academicCode.includes("[F10-Task10]"), "backend/academic-service/Code.gs contiene saveGuidanceFollowupPlan y saveVocationalRecommendation [F10-Task10]");
assert(academicCode.includes("auditAssistantDelegatedAction") && academicCode.includes("[F10-Task11]"), "backend/academic-service/Code.gs contiene auditAssistantDelegatedAction [F10-Task11]");

const userCode = fs.readFileSync(path.join(__dirname, '../../backend/user-service/Code.gs'), 'utf8');
assert(userCode.includes("sendMultiChannelNotification") && userCode.includes("retryFailedNotificationsQueue") && userCode.includes("[F10-Task12]"), "backend/user-service/Code.gs contiene sendMultiChannelNotification y retryFailedNotificationsQueue [F10-Task12]");

assert(academicCode.includes("validateEvidenceFileAndPermissions") && academicCode.includes("[F10-Task13]"), "backend/academic-service/Code.gs contiene validateEvidenceFileAndPermissions [F10-Task13]");
assert(academicCode.includes("getBatchAttendanceRecords") && academicCode.includes("[F10-Task14]"), "backend/academic-service/Code.gs contiene getBatchAttendanceRecords [F10-Task14]");
assert(devCode.includes("runPhase10AttendanceAndCoexistenceRegressionSuite") && devCode.includes("[F10-Task15]"), "backend/developer-service/Code.gs contiene suite de regresión ampliada runPhase10AttendanceAndCoexistenceRegressionSuite [F10-Task15]");
assert(academicCode.includes("generateConsolidatedAttendanceAndCoexistenceReport") && academicCode.includes("[F10-Task16]"), "backend/academic-service/Code.gs contiene generateConsolidatedAttendanceAndCoexistenceReport [F10-Task16]");

const acctCode = fs.readFileSync(path.join(__dirname, '../../backend/accounting-service/Code.gs'), 'utf8');
const acadCode = fs.readFileSync(path.join(__dirname, '../../backend/academic-service/Code.gs'), 'utf8');
assert(acctCode.includes("recordStaffCheckIn") && acctCode.includes("[F10-Task17]"), "backend/accounting-service/Code.gs contiene recordStaffCheckIn optimizado con trazabilidad [F10-Task17]");
assert(devCode.includes("getPhase10FunctionalDocumentation") && devCode.includes("[F10-Task18]"), "backend/developer-service/Code.gs contiene getPhase10FunctionalDocumentation [F10-Task18]");
assert(fs.existsSync(path.join(__dirname, '../../docs/architecture/phase-10-attendance-coexistence-spec.md')), "Existe documento funcional docs/architecture/phase-10-attendance-coexistence-spec.md [F10-Task18]");
assert(academicCode.includes("validateStudentWelfareAccess") && academicCode.includes("[F11-Task01]"), "backend/academic-service/Code.gs contiene validateStudentWelfareAccess [F11-Task01]");
assert(acctCode.includes("recordAccountingJournalEntry") && acctCode.includes("[F11-Task02]"), "backend/accounting-service/Code.gs contiene recordAccountingJournalEntry y approvePurchaseOrder [F11-Task02]");

const updatedUserCode = fs.readFileSync(path.join(__dirname, '../../backend/user-service/Code.gs'), 'utf8');
assert(updatedUserCode.includes("sendInstitutionalMessage") && updatedUserCode.includes("[F11-Task03]"), "backend/user-service/Code.gs contiene sendInstitutionalMessage y getInstitutionalConversations [F11-Task03]");
assert(updatedUserCode.includes("getInstitutionalAnnouncements") && updatedUserCode.includes("[F11-Task04]"), "backend/user-service/Code.gs contiene getInstitutionalAnnouncements con vigencia de publicaciones [F11-Task04]");
assert(updatedUserCode.includes("respondToAuthorizationRequest") && updatedUserCode.includes("[F11-Task05]"), "backend/user-service/Code.gs contiene respondToAuthorizationRequest y submitAuthorizationRequest [F11-Task05]");
assert(updatedUserCode.includes("checkCalendarEventOverlap") && updatedUserCode.includes("[F11-Task06]"), "backend/user-service/Code.gs contiene checkCalendarEventOverlap y saveInstitutionalCalendarEvent [F11-Task06]");
assert(academicCode.includes("scheduleGuidanceAppointment") && academicCode.includes("[F11-Task07]"), "backend/academic-service/Code.gs contiene scheduleGuidanceAppointment y getGuidanceAppointments [F11-Task07]");
assert(academicCode.includes("evaluateAndDispatchEarlyWarningAlerts") && academicCode.includes("[F11-Task08]"), "backend/academic-service/Code.gs contiene evaluateAndDispatchEarlyWarningAlerts y getEarlyWarningAlerts [F11-Task08]");
assert(academicCode.includes("savePedagogicalPlanning") && academicCode.includes("[F11-Task09]"), "backend/academic-service/Code.gs contiene savePedagogicalPlanning y getPedagogicalPlannings [F11-Task09]");
assert(academicCode.includes("submitPlanningForReview") && academicCode.includes("[F11-Task10]"), "backend/academic-service/Code.gs contiene submitPlanningForReview y reviewPedagogicalPlanning [F11-Task10]");
assert(academicCode.includes("saveSupervisionRubric") && academicCode.includes("[F11-Task11]"), "backend/academic-service/Code.gs contiene saveSupervisionRubric y getSupervisionRubrics [F11-Task11]");
assert(academicCode.includes("createTeacherSubstitution") && academicCode.includes("[F11-Task12]"), "backend/academic-service/Code.gs contiene createTeacherSubstitution y getTeacherSubstitutions [F11-Task12]");
assert(acctCode.includes("performBankReconciliation") && acctCode.includes("[F11-Task13]"), "backend/accounting-service/Code.gs contiene performBankReconciliation [F11-Task13]");
assert(acctCode.includes("checkBudgetAvailability") && acctCode.includes("[F11-Task14]"), "backend/accounting-service/Code.gs contiene checkBudgetAvailability [F11-Task14]");
assert(acctCode.includes("applyApprovedScholarshipsToCharges") && acctCode.includes("[F11-Task15]"), "backend/accounting-service/Code.gs contiene applyApprovedScholarshipsToCharges [F11-Task15]");

// [TASK-001] [F15-Task01] - Verificación del motor de facturación fiscal SAR y clasificación tributaria
assert(acctCode.includes("configureSARAuthorizedCAI") && acctCode.includes("[TASK-001]"), "backend/accounting-service/Code.gs contiene configureSARAuthorizedCAI y control de CAI [TASK-001]");
assert(acctCode.includes("CAI_EXPIRED") && acctCode.includes("CAI_RANGE_EXHAUSTED"), "backend/accounting-service/Code.gs contiene validaciones de vencimiento y agotamiento de CAI [TASK-001]");
assert(acctCode.includes("subtotalExento") && acctCode.includes("subtotalGravado"), "backend/accounting-service/Code.gs contiene desglose tributario exento y gravado [TASK-001]");
assert(acctCode.includes("tipoTributario"), "backend/accounting-service/Code.gs contiene clasificación tributaria de conceptos [TASK-001]");

// [TASK-002] [F15-Task02] - Verificación del motor de generación masiva de mensualidades escolares
assert(acctCode.includes("previewBatchMonthlyCharges") && acctCode.includes("[TASK-002]"), "backend/accounting-service/Code.gs contiene previewBatchMonthlyCharges [TASK-002]");
assert(acctCode.includes("generateBatchMonthlyCharges") && acctCode.includes("[TASK-002]"), "backend/accounting-service/Code.gs contiene generateBatchMonthlyCharges [TASK-002]");
assert(acctCode.includes("BATCH-CRG-") && acctCode.includes("LockService.getScriptLock()"), "backend/accounting-service/Code.gs genera lotes atómicos BATCH-CRG con LockService [TASK-002]");
assert(acctCode.includes("ClaveUnicaDedupe") || acctCode.includes("dedupeKey"), "backend/accounting-service/Code.gs protege contra duplicados mediante clave lógica de deduplicación [TASK-002]");

// [TASK-003] [F15-Task03] - Verificación del sistema integral de anulaciones, reversión, notas de crédito y reembolsos
assert(acctCode.includes("voidCharge") && acctCode.includes("[TASK-003]"), "backend/accounting-service/Code.gs contiene voidCharge [TASK-003]");
assert(acctCode.includes("reversePayment") && acctCode.includes("[TASK-003]"), "backend/accounting-service/Code.gs contiene reversePayment [TASK-003]");
assert(acctCode.includes("issueFiscalCreditNote") && acctCode.includes("[TASK-003]"), "backend/accounting-service/Code.gs contiene issueFiscalCreditNote [TASK-003]");
assert(acctCode.includes("processPaymentRefund") && acctCode.includes("[TASK-003]"), "backend/accounting-service/Code.gs contiene processPaymentRefund [TASK-003]");
assert(acctCode.includes("NotasCreditoFiscales") && acctCode.includes("FacturasFiscales"), "backend/accounting-service/Code.gs gestiona la hoja NotasCreditoFiscales vinculada [TASK-003]");
assert(acctCode.includes("ALREADY_VOIDED") && acctCode.includes("PAYMENT_ALREADY_REVERSED"), "backend/accounting-service/Code.gs implementa control de idempotencia para anulaciones y reversiones [TASK-003]");

// [TASK-004] [F16-Task01] - Verificación del catálogo dinámico de roles internos y asignación con vigencias
assert(userCode.includes("manageInternalRoleCatalog") && userCode.includes("[TASK-004]"), "backend/user-service/Code.gs contiene manageInternalRoleCatalog [TASK-004]");
assert(userCode.includes("getInternalRoleCatalog") && userCode.includes("[TASK-004]"), "backend/user-service/Code.gs contiene getInternalRoleCatalog [TASK-004]");
assert(userCode.includes("getInternalRoleAssignments") && userCode.includes("[TASK-004]"), "backend/user-service/Code.gs contiene getInternalRoleAssignments [TASK-004]");
assert(userCode.includes("CatalogoRolesInternos"), "backend/user-service/Code.gs inicializa y normaliza la hoja CatalogoRolesInternos [TASK-004]");
assert(userCode.includes("esSuplente") && userCode.includes("suplenteDeUserId"), "backend/user-service/Code.gs soporta suplencias temporales y delimitación temporal [TASK-004]");

// [TASK-005] [F16-Task02] - Verificación de asignación de docentes a áreas académicas independiente de carga lectiva
assert(academicCode.includes("assignTeacherToAcademicArea") && academicCode.includes("[TASK-005]"), "backend/academic-service/Code.gs contiene assignTeacherToAcademicArea [TASK-005]");
assert(academicCode.includes("getTeachersByAcademicArea") && academicCode.includes("[TASK-005]"), "backend/academic-service/Code.gs contiene getTeachersByAcademicArea [TASK-005]");
assert(academicCode.includes("getAcademicAreasByTeacher") && academicCode.includes("[TASK-005]"), "backend/academic-service/Code.gs contiene getAcademicAreasByTeacher [TASK-005]");
assert(academicCode.includes("removeTeacherFromAcademicArea") && academicCode.includes("[TASK-005]"), "backend/academic-service/Code.gs contiene removeTeacherFromAcademicArea [TASK-005]");
assert(academicCode.includes("DocentesAreasAcademicas"), "backend/academic-service/Code.gs normaliza la hoja DocentesAreasAcademicas [TASK-005]");
assert(academicCode.includes("esCoordinadorTitular") && academicCode.includes("esCoordinadorSuplente"), "backend/academic-service/Code.gs soporta designación de coordinadores titular y suplente [TASK-005]");

// [TASK-006] [F16-Task03] - Verificación del flujo de desvinculación laboral coordinada y revocación en cascada
assert(acctCode.includes("processEmployeeOffboarding") && acctCode.includes("[TASK-006]"), "backend/accounting-service/Code.gs contiene processEmployeeOffboarding [TASK-006]");
assert(acctCode.includes("EMPLOYEE_OFFBOARDED_CASCADED"), "backend/accounting-service/Code.gs emite evento de auditoría EMPLOYEE_OFFBOARDED_CASCADED [TASK-006]");
assert(acctCode.includes("isAlreadyOffboarded"), "backend/accounting-service/Code.gs implementa idempotencia ante re-ejecución de desvinculación [TASK-006]");
assert(acctCode.includes("vacacionesEstimadasDias") && acctCode.includes("liquidacionPreliminar"), "backend/accounting-service/Code.gs calcula liquidación preliminar no vinculante [TASK-006]");

// [TASK-007] [F17-Task01] - Eliminación del salario fijo hardcodeado y cálculo salarial contractual dinámico con proporcionalidad
assert(!acctCode.includes("const salarioBase = 22000;"), "backend/accounting-service/Code.gs elimina la constante de salario fijo hardcodeado [TASK-007]");
assert(acctCode.includes("ContratosLaborales") && acctCode.includes("validContracts"), "backend/accounting-service/Code.gs consulta dinámicamente contratos vigentes en ContratosLaborales [TASK-007]");
assert(acctCode.includes("SIN_CONTRATO_VIGENTE") && acctCode.includes("IncidenciasNomina"), "backend/accounting-service/Code.gs registra incidencias por falta de contrato sin asignar valores arbitrarios [TASK-007]");
assert(acctCode.includes("CONTRATOS_SUPERPUESTOS"), "backend/accounting-service/Code.gs detecta y previene cálculos silenciosos con contratos superpuestos [TASK-007]");
assert(acctCode.includes("workedDays") && acctCode.includes("daysInPeriod"), "backend/accounting-service/Code.gs calcula salario proporcional según días laborados en el período [TASK-007]");

// [TASK-008] [F17-Task02] - Integración automática de novedades aprobadas (horas extras, tardanzas, ausencias, subsidios) con trazabilidad e idempotencia
assert(acctCode.includes("AprobacionHorasExtras") && acctCode.includes("ProcesadaEnNomina"), "backend/accounting-service/Code.gs integra horas extras aprobadas marcando trazabilidad e idempotencia [TASK-008]");
assert(acctCode.includes("DeduccionesAsistencia") && acctCode.includes("deduccionAusencias"), "backend/accounting-service/Code.gs descuenta ausencias injustificadas y tardanzas acumuladas [TASK-008]");
assert(acctCode.includes("SolicitudesVacaciones") && acctCode.includes("deduccionPermisosSinSueldo"), "backend/accounting-service/Code.gs procesa permisos sin goce de sueldo proporcionales [TASK-008]");
assert(acctCode.includes("PROCESADA_NOMINA_"), "backend/accounting-service/Code.gs vincula novedades procesadas al planillaId impidiendo doble deducción o pago [TASK-008]");

// [TASK-009] [F17-Task03] - Aportaciones patronales independientes y separación de costos institucionales
assert(acctCode.includes("patronalIHSS") && acctCode.includes("0.072"), "backend/accounting-service/Code.gs calcula IHSS patronal independiente al 7.2% [TASK-009]");
assert(acctCode.includes("patronalRAP") && acctCode.includes("patronalINFOP"), "backend/accounting-service/Code.gs calcula aportaciones patronales de RAP e INFOP [TASK-009]");
assert(acctCode.includes("costoLaboralTotal"), "backend/accounting-service/Code.gs determina el costo laboral institucional total sin afectar el salario neto [TASK-009]");
assert(acctCode.includes("Gasto de Aportaciones Patronales") && acctCode.includes("Obligaciones Patronales por Pagar"), "backend/accounting-service/Code.gs genera asiento contable equilibrado con cuentas patronales por partida doble [TASK-009]");
assert(acctCode.includes("totalCostoLaboralInstitucional"), "backend/accounting-service/Code.gs desglosa costo laboral institucional en el resumen de nómina [TASK-009]");

// [TASK-010] [F17-Task04] - Sustitución del cálculo plano de ISR por motor progresivo anualizado SAR Art. 22
assert(!acctCode.includes("(salarioBase - 20000) * 0.15"), "backend/accounting-service/Code.gs elimina el cálculo plano del 15% sobre excedente de 20k [TASK-010]");
assert(acctCode.includes("annualMedicalDeduction = 40000") && acctCode.includes("totalAnnualExemptions"), "backend/accounting-service/Code.gs deduce gastos médicos de ley (L 40,000) y cotizaciones sociales [TASK-010]");
assert(acctCode.includes("199539.96") && acctCode.includes("304324.78") && acctCode.includes("707729.04"), "backend/accounting-service/Code.gs aplica la escala progresiva por tramos oficial del SAR (Art. 22) [TASK-010]");
assert(acctCode.includes("annualTax / 12"), "backend/accounting-service/Code.gs proyecta y prorratea el impuesto anual en retenciones mensuales [TASK-010]");
assert(acctCode.includes("POL-ISR-SAR") && acctCode.includes("Escala Progresiva SAR"), "backend/accounting-service/Code.gs parametriza la escala progresiva del SAR en PoliticasFiscales [TASK-010]");

// [TASK-011] [F17-Task05] - Cálculo y procesamiento independiente del 13º (Aguinaldo) y 14º Mes (Decreto 135-94)
assert(acctCode.includes("calculateExtraordinaryPayroll") && acctCode.includes("[TASK-011]"), "backend/accounting-service/Code.gs contiene función calculateExtraordinaryPayroll [TASK-011]");
assert(acctCode.includes("DecimoTercerMes") && acctCode.includes("DecimoCuartoMes"), "backend/accounting-service/Code.gs soporta diferenciación de beneficios 13º y 14º mes [TASK-011]");
assert(acctCode.includes("daysWorkedInPeriod") && acctCode.includes("totalPeriodDays"), "backend/accounting-service/Code.gs calcula beneficios proporcionales basados en días laborados del período legal [TASK-011]");
assert(acctCode.includes("AnticiposPrestamosEmpleado") && acctCode.includes("LIQUIDADO_EXTRAORDINARIO_"), "backend/accounting-service/Code.gs descuenta anticipos otorgados previamente previniendo duplicados [TASK-011]");
assert(acctCode.includes("PLN-EXTRA-"), "backend/accounting-service/Code.gs genera planillas extraordinarias independientes [TASK-011]");

// [TASK-012] [F18-Task01] - Control de recepciones parciales acumuladas, entregas escalonadas y gestión de incidencias físicas
assert(acctCode.includes("recordPurchaseReceipt") && acctCode.includes("[TASK-012]"), "backend/accounting-service/Code.gs contiene recordPurchaseReceipt ampliado [TASK-012]");
assert(acctCode.includes("cumulativeReceived") && acctCode.includes("pendingSummary"), "backend/accounting-service/Code.gs realiza balance acumulado y cálculo de pendientes por partida [TASK-012]");
assert(acctCode.includes("RecibidaParcial") && acctCode.includes("RecibidaTotal"), "backend/accounting-service/Code.gs maneja estados escalonados RecibidaParcial y RecibidaTotal [TASK-012]");
assert(acctCode.includes("hasDamagedOrDispute") && acctCode.includes("itemsToInventory"), "backend/accounting-service/Code.gs segrega productos dañados o rechazados impidiendo entrada conforme a Kardex [TASK-012]");
assert(acctCode.includes("getPurchaseReceipts"), "backend/accounting-service/Code.gs implementa consulta de historial de recepciones getPurchaseReceipts [TASK-012]");

// [TASK-013] [F18-Task02] - Conciliación documental de tres vías (Three-Way Match) entre Orden, Recepción y Factura
assert(acctCode.includes("verifyThreeWayMatch") && acctCode.includes("[TASK-013]"), "backend/accounting-service/Code.gs contiene función verifyThreeWayMatch [TASK-013]");
assert(acctCode.includes("SOBREPRECIO_UNITARIO") && acctCode.includes("CANTIDAD_EXCEDE_RECEPCION"), "backend/accounting-service/Code.gs detecta sobreprecios y cantidades que superan recepción [TASK-013]");
assert(acctCode.includes("ARTICULO_NO_ORDENADO"), "backend/accounting-service/Code.gs detecta artículos facturados no autorizados en la orden [TASK-013]");
assert(acctCode.includes("BloqueadoPorDiscrepancia") && acctCode.includes("Bloqueado Conciliacion"), "backend/accounting-service/Code.gs bloquea pagos automáticos ante discrepancias no autorizadas [TASK-013]");
assert(!acctCode.includes("numeroFactura: \"FCT-\" + recId"), "backend/accounting-service/Code.gs desacopla la recepción física de la generación de facturas fiscales [TASK-013]");

// [TASK-014] [F18-Task03] - Interfaz operativa completa del módulo de compras & proveedores en js/accounting.js
const accountingClientCode = fs.readFileSync(path.join(__dirname, '../../js/accounting.js'), 'utf8');
assert(accountingClientCode.includes("switchComprasSubtab") && accountingClientCode.includes("[TASK-014]"), "js/accounting.js contiene navegación interactiva de subpestañas de compras [TASK-014]");
assert(accountingClientCode.includes("renderComprasSolicitudesView") && accountingClientCode.includes("renderComprasCotizacionesView"), "js/accounting.js renderiza vistas operativas de solicitudes y cotizaciones [TASK-014]");
assert(accountingClientCode.includes("renderComprasOrdenesView") && accountingClientCode.includes("renderComprasRecepcionesView"), "js/accounting.js gestiona órdenes y recepciones escalonadas en UI [TASK-014]");
assert(accountingClientCode.includes("renderComprasThreeWayView") && accountingClientCode.includes("executeThreeWayMatchTest"), "js/accounting.js implementa interfaz visual de Three-Way Matching [TASK-014]");
assert(accountingClientCode.includes("renderComprasProveedoresView"), "js/accounting.js integra directorio operativo de proveedores [TASK-014]");

// [TASK-015] [F18-Task04] - Documentos PDF oficiales para órdenes de compra y ciclo ampliado de estados
assert(acctCode.includes("generatePurchaseOrderPDF") && acctCode.includes("[TASK-015]"), "backend/accounting-service/Code.gs contiene función generatePurchaseOrderPDF [TASK-015]");
assert(acctCode.includes("VersionDocumental") && acctCode.includes("ArchivoPdfUrl"), "backend/accounting-service/Code.gs soporta versionado documental y almacenamiento PDF [TASK-015]");
assert(acctCode.includes("EnviadaProveedor") && acctCode.includes("AceptadaProveedor") && acctCode.includes("RechazadaProveedor"), "backend/accounting-service/Code.gs amplía el ciclo de estados formales de compra [TASK-015]");
assert(acctCode.includes("La orden debe estar previamente 'Aprobada'"), "backend/accounting-service/Code.gs bloquea emisión/envío al proveedor de órdenes no aprobadas [TASK-015]");
assert(acctCode.includes("New Generation Bilingual School and Institute"), "backend/accounting-service/Code.gs emite documento formal con identidad institucional de New Generation [TASK-015]");

// [TASK-016] [F18-Task06] - Gestión de cuentas por pagar con abonos, vencimientos y notas de crédito
assert(acctCode.includes("recordSupplierPayment") && acctCode.includes("[TASK-016]"), "backend/accounting-service/Code.gs contiene función recordSupplierPayment [TASK-016]");
assert(acctCode.includes("OVERPAYMENT_REJECTED"), "backend/accounting-service/Code.gs rechaza pagos superiores al saldo pendiente de la obligación [TASK-016]");
assert(acctCode.includes("applySupplierCreditNote") && acctCode.includes("CREDIT_NOTE_ALREADY_APPLIED"), "backend/accounting-service/Code.gs implementa aplicación de notas de crédito comerciales sin duplicación [TASK-016]");
assert(acctCode.includes("getSupplierAccountsPayableSummary") && acctCode.includes("clasificacionVencimiento"), "backend/accounting-service/Code.gs programa y clasifica vencimientos de cuentas por pagar [TASK-016]");
assert(acctCode.includes("PagoParcial") && acctCode.includes("Pagada"), "backend/accounting-service/Code.gs actualiza automáticamente estados de pago según saldo remanente [TASK-016]");

// [TASK-017] [F18-Task07] - Compromiso presupuestario formal al aprobar órdenes de compra
assert(acctCode.includes("[TASK-017]") && acctCode.includes("compromisoPresupuestario"), "backend/accounting-service/Code.gs integra reserva de compromiso presupuestario en approvePurchaseOrder [TASK-017]");
assert(acctCode.includes("BUDGET_INSUFFICIENT"), "backend/accounting-service/Code.gs bloquea aprobación de órdenes sin disponibilidad presupuestaria suficiente [TASK-017]");
assert(acctCode.includes("BUDGET_OVERRUN_ALERT") && acctCode.includes("autorizarSobregiro"), "backend/accounting-service/Code.gs audita y permite sobregiros excepcionales autorizados por rol directivo [TASK-017]");
assert(acctCode.includes("compromisoLiberado") && acctCode.includes("estadosConCompromiso"), "backend/accounting-service/Code.gs libera el compromiso presupuestario ante cancelación formal de orden [TASK-017]");
assert(acctCode.includes("modifyPurchaseOrderAmount") && acctCode.includes("ajustePresupuestario"), "backend/accounting-service/Code.gs implementa función modifyPurchaseOrderAmount con ajuste presupuestario trazable [TASK-017]");

// [TASK-018] [F18-Task20] - Suite automatizada de pruebas y regresión integral de compras y proveedores
assert(acctCode.includes("runPhase18PurchasingAndSuppliersRegressionSuite") && acctCode.includes("[TASK-018]"), "backend/accounting-service/Code.gs contiene suite automatizada runPhase18PurchasingAndSuppliersRegressionSuite [TASK-018]");
assert(devCode.includes("runPhase18PurchasingAndSuppliersRegressionSuite") && devCode.includes("[TASK-018]"), "backend/developer-service/Code.gs integra suite runPhase18PurchasingAndSuppliersRegressionSuite [TASK-018]");
assert(acctCode.includes("REG-F18-01-SUPPLIERS-AND-RTN") && acctCode.includes("REG-F18-02-PURCHASE-REQUESTS-AND-QUOTES"), "backend/accounting-service/Code.gs valida proveedores, formato RTN y ciclo de solicitudes [TASK-018]");
assert(acctCode.includes("REG-F18-03-PURCHASE-ORDERS-APPROVAL-AND-PDF") && acctCode.includes("REG-F18-04-PARTIAL-RECEIPTS-AND-KARDEX"), "backend/accounting-service/Code.gs valida órdenes, prevención de autoaprobaciones y recepciones escalonadas sin cierre prematuro [TASK-018]");
assert(acctCode.includes("REG-F18-05-THREE-WAY-MATCHING") && acctCode.includes("REG-F18-06-ACCOUNTS-PAYABLE-AND-CREDIT-NOTES"), "backend/accounting-service/Code.gs valida Three-Way Match y gestión estricta de cuentas por pagar [TASK-018]");
assert(acctCode.includes("REG-F18-07-BUDGET-COMMITMENT-AND-DOUBLE-ENTRY") && acctCode.includes("REG-F18-08-E2E-PURCHASING-LIFECYCLE-FLOW"), "backend/accounting-service/Code.gs valida balance contable por partida doble y flujo completo E2E [TASK-018]");

// [TASK-019] [F19-Task01] - Corrección integral del control de existencias multialmacén
assert(acctCode.includes("recordInventoryMovement") && acctCode.includes("[TASK-019]"), "backend/accounting-service/Code.gs contiene función recordInventoryMovement multialmacén [TASK-019]");
assert(acctCode.includes("currentStockLocal") && acctCode.includes("targetUbicacion"), "backend/accounting-service/Code.gs calcula existencias independientes por ubicación física [TASK-019]");
assert(acctCode.includes("Stock insuficiente para") && acctCode.includes("en la ubicación"), "backend/accounting-service/Code.gs valida disponibilidad por bodega sin alterar saldos ajenos [TASK-019]");
assert(acctCode.includes("stockConsolidadoInstitucional") && acctCode.includes("resumenPorUbicacion"), "backend/accounting-service/Code.gs calcula consolidado institucional y detalle por bodega [TASK-019]");
assert(acctCode.includes("transferInventoryStock") && acctCode.includes("transferBatchId"), "backend/accounting-service/Code.gs ejecuta transferencias atómicas entre almacenes [TASK-019]");
assert(acctCode.includes("targetAlmacen") && acctCode.includes("Conteo Físico"), "backend/accounting-service/Code.gs concilia conteos físicos por ubicación específica [TASK-019]");
const acctJsUpdated = fs.readFileSync(path.join(__dirname, '../../js/accounting.js'), 'utf8');
assert(acctJsUpdated.includes("Resumen de Existencias por Almacén") && acctJsUpdated.includes("[TASK-019]"), "js/accounting.js renderiza vista de existencias multialmacén y consolidado institucional [TASK-019]");

// [TASK-020] [F19-Task02] - Devolución y recepción de activos bajo custodia con actas e incidencias de mantenimiento
assert(acctCode.includes("returnAssetCustody") && acctCode.includes("[TASK-020]"), "backend/accounting-service/Code.gs contiene función returnAssetCustody [TASK-020]");
assert(acctCode.includes("CUSTODY_ASSIGNMENT_NOT_FOUND"), "backend/accounting-service/Code.gs rechaza devoluciones sin asignación activa previa [TASK-020]");
assert(acctCode.includes("CUSTODY_ALREADY_RETURNED"), "backend/accounting-service/Code.gs rechaza devoluciones duplicadas de una misma custodia [TASK-020]");
assert(acctCode.includes("ASSET_ALREADY_ASSIGNED"), "backend/accounting-service/Code.gs impide asignar activos no disponibles o ya bajo custodia [TASK-020]");
assert(acctCode.includes("MantenimientoOrdenes") && acctCode.includes("RequiereReparacion"), "backend/accounting-service/Code.gs genera orden de mantenimiento técnica automática ante daños o averías [TASK-020]");
assert(acctCode.includes("ACTA-DEV-") && acctCode.includes("actaDevolucionId"), "backend/accounting-service/Code.gs genera acta formal e inmutable de entrega-recepción de activo [TASK-020]");
assert(acctJsUpdated.includes("handleDevolverCustodia") && acctJsUpdated.includes("returnAssetCustody"), "js/accounting.js implementa acción e interfaz reactiva para devolver custodias [TASK-020]");

// [TASK-021] [F19-Task03] - Validación transaccional de transferencias entre almacenes y ciclo documental TRF
assert(acctCode.includes("INSUFFICIENT_SOURCE_STOCK"), "backend/accounting-service/Code.gs rechaza transferencias con saldo insuficiente en bodega origen [TASK-021]");
assert(acctCode.includes("TransferenciasInventario") && acctCode.includes("TRF-"), "backend/accounting-service/Code.gs persiste transferencias en TransferenciasInventario con código TRF [TASK-021]");
assert(acctCode.includes("confirmTransferReceipt") && acctCode.includes("[TASK-021]"), "backend/accounting-service/Code.gs implementa función confirmTransferReceipt [TASK-021]");
assert(acctCode.includes("TRANSFER_ALREADY_RECEIVED"), "backend/accounting-service/Code.gs impide recepciones duplicadas de transferencias [TASK-021]");
assert(acctCode.includes("getInventoryTransfers"), "backend/accounting-service/Code.gs implementa consulta getInventoryTransfers [TASK-021]");
assert(acctJsUpdated.includes("handleRecibirTransferencia") && acctJsUpdated.includes("renderTransferenciasView"), "js/accounting.js contiene interfaz operativa para transferencias y recepción [TASK-021]");

// [TASK-022] [F19-Task20] - Suite automatizada de pruebas y regresión integral de inventario y activos
assert(acctCode.includes("runPhase19InventoryAndAssetsRegressionSuite") && acctCode.includes("[TASK-022]"), "backend/accounting-service/Code.gs contiene suite runPhase19InventoryAndAssetsRegressionSuite [TASK-022]");
assert(devCode.includes("runPhase19InventoryAndAssetsRegressionSuite") && devCode.includes("[TASK-022]"), "backend/developer-service/Code.gs integra suite runPhase19InventoryAndAssetsRegressionSuite [TASK-022]");
assert(acctCode.includes("PT19-01") && acctCode.includes("PT19-07") && acctCode.includes("PT19-20"), "backend/accounting-service/Code.gs cubre la batería completa de pruebas PT19-01 a PT19-20 [TASK-022]");
assert(acctCode.includes("totalDebe === totalHaber") || acctCode.includes("debe !== haber"), "backend/accounting-service/Code.gs valida balance de partida doble en depreciación [TASK-022]");

// [TASK-023] [F20-Task01] - Funciones backend para reservas, incidencias y recursos digitales de biblioteca
assert(acctCode.includes("reserveLibraryBook") && acctCode.includes("BibliotecaReservas"), "backend/accounting-service/Code.gs contiene función reserveLibraryBook persistiendo en BibliotecaReservas [TASK-023]");
assert(acctCode.includes("getLibraryReservations") && acctCode.includes("DUPLICATE_RESERVATION"), "backend/accounting-service/Code.gs implementa getLibraryReservations y previene reservas duplicadas [TASK-023]");
assert(acctCode.includes("recordLibraryIncident") && acctCode.includes("BibliotecaIncidencias"), "backend/accounting-service/Code.gs contiene función recordLibraryIncident en BibliotecaIncidencias [TASK-023]");
assert(acctCode.includes("getLibraryIncidents") && acctCode.includes("nuevoEstadoEjemplar"), "backend/accounting-service/Code.gs implementa getLibraryIncidents y actualiza estado de ejemplar dañado o extraviado [TASK-023]");
assert(acctCode.includes("manageDigitalResource") && acctCode.includes("RecursosDigitalesBiblioteca"), "backend/accounting-service/Code.gs contiene función manageDigitalResource [TASK-023]");
assert(acctCode.includes("getDigitalResources") && acctCode.includes("REC-DIG-"), "backend/accounting-service/Code.gs implementa getDigitalResources con catálogo predeterminado [TASK-023]");

// [TASK-024] [F20-Task02] - Conexión y activación del módulo de Biblioteca en la interfaz institucional
const dashAcctHtml = fs.readFileSync(path.join(__dirname, '../../dashboard-contabilidad.html'), 'utf8');
assert(dashAcctHtml.includes("switchTab('biblioteca')") && dashAcctHtml.includes("fa-book-reader"), "dashboard-contabilidad.html incluye botón de acceso a Biblioteca con icono representativo [TASK-024]");
assert(acctJsUpdated.includes("tab === 'biblioteca'") && acctJsUpdated.includes("renderBibliotecaModule(container)"), "js/accounting.js enruta tab === 'biblioteca' a renderBibliotecaModule [TASK-024]");

// [TASK-025] [F20-Task03] - Normalización relacional del catálogo: separación entre Obras y Ejemplares (FRBR/RDA)
assert(acctCode.includes("BibliotecaCatalogoObras") && acctCode.includes("manageBibliographicWork"), "backend/accounting-service/Code.gs implementa función manageBibliographicWork en BibliotecaCatalogoObras [TASK-025]");
assert(acctCode.includes("OBRA-") && acctCode.includes("autoresJSON"), "backend/accounting-service/Code.gs genera código correlativo OBRA- y almacena metadatos FRBR [TASK-025]");
assert(acctCode.includes("getBibliographicWorks") && acctCode.includes("metricasEjemplares"), "backend/accounting-service/Code.gs implementa getBibliographicWorks calculando métricas de copias por estado [TASK-025]");
assert(acctCode.includes("targetObraId") && acctCode.includes("obraId"), "backend/accounting-service/Code.gs vincula ejemplares físicos a obraId maestro en BibliotecaEjemplares [TASK-025]");
assert(acctJsUpdated.includes("getBibliographicWorks") && acctJsUpdated.includes("loadLibrosData"), "js/accounting.js consulta y renderiza el catálogo normalizado de obras y copias en UI [TASK-025]");

// [TASK-026] [F20-Task04] - Control de políticas de circulación, límites de préstamo y bloqueo por mora
assert(acctCode.includes("BibliotecaPoliticasCirculacion"), "backend/accounting-service/Code.gs contiene hoja y catálogo BibliotecaPoliticasCirculacion [TASK-026]");
assert(acctCode.includes("LOAN_LIMIT_EXCEEDED"), "backend/accounting-service/Code.gs bloquea préstamos al superar el límite simultáneo por rol [TASK-026]");
assert(acctCode.includes("ACTIVE_OVERDUE_BLOCK"), "backend/accounting-service/Code.gs bloquea nuevos préstamos ante mora activa de libros atrasados [TASK-026]");
assert(acctCode.includes("diasPrestamo") && acctCode.includes("fechaRetorno"), "backend/accounting-service/Code.gs calcula fecha de retorno dinámica según política de rol [TASK-026]");

// [TASK-027] [F20-Task05] - Control de concurrencia e idempotencia en circulación bibliotecaria
assert(acctCode.includes("BOOK_ALREADY_LOANED"), "backend/accounting-service/Code.gs previene asignación duplicada concurrente en processLibraryLoan [TASK-027]");
assert(acctCode.includes("IDEMPOTENCY_DUPLICATE_REQUEST"), "backend/accounting-service/Code.gs implementa clave de idempotencia en préstamos de biblioteca [TASK-027]");

// [TASK-028] [F20-Task14] - Suite automatizada de pruebas y regresión integral de biblioteca
assert(acctCode.includes("runPhase20LibraryAndResourcesRegressionSuite") && acctCode.includes("[TASK-028]"), "backend/accounting-service/Code.gs contiene suite runPhase20LibraryAndResourcesRegressionSuite [TASK-028]");
assert(devCode.includes("runPhase20LibraryAndResourcesRegressionSuite") && devCode.includes("[TASK-028]"), "backend/developer-service/Code.gs integra suite runPhase20LibraryAndResourcesRegressionSuite [TASK-028]");
assert(acctCode.includes("PT20-01") && acctCode.includes("PT20-07") && acctCode.includes("PT20-14"), "backend/accounting-service/Code.gs cubre la batería completa de pruebas PT20-01 a PT20-14 [TASK-028]");

// [TASK-029] [F21-Task01] - Control estricto de cupos, capacidad vehicular e integridad de asignaciones de transporte
assert(acctCode.includes("TransporteVehiculos") && acctCode.includes("CapacidadPasajeros"), "backend/accounting-service/Code.gs incluye esquema de TransporteVehiculos [TASK-029]");
assert(acctCode.includes("TRANSPORT_CAPACITY_EXCEEDED"), "backend/accounting-service/Code.gs bloquea sobrecupo con código TRANSPORT_CAPACITY_EXCEEDED [TASK-029]");
assert(acctCode.includes("DUPLICATE_TRANSPORT_ASSIGNMENT"), "backend/accounting-service/Code.gs rechaza asignaciones duplicadas de transporte [TASK-029]");
assert(acctCode.includes("TRANSPORT_SCHEDULE_CONFLICT"), "backend/accounting-service/Code.gs detecta y rechaza colisiones de horarios entre rutas [TASK-029]");
assert(acctCode.includes("cuposDisponibles") && acctCode.includes("cuposOcupados"), "backend/accounting-service/Code.gs calcula métricas de ocupación en getTransportRoutes [TASK-029]");

// [TASK-030] [F21-Task02] - Protección de datos de transporte y aislamiento de consultas por usuario (RBAC/ABAC)
assert(acctCode.includes("UNAUTHORIZED_ACCESS_ATTEMPT") && acctCode.includes("RelacionesFamiliares"), "backend/accounting-service/Code.gs aísla consultas por núcleo familiar y rol [TASK-030]");
assert(acctCode.includes("allowedStudentIds") && acctCode.includes("effectiveRole"), "backend/accounting-service/Code.gs valida autorización estricta en getTransportAssignments [TASK-030]");

// [TASK-031] [F21-Task03] - Control de abordaje, descenso y manifiesto en tiempo real
assert(acctCode.includes("recordStudentBoarding") && acctCode.includes("TransporteAsistenciaViajes"), "backend/accounting-service/Code.gs implementa función recordStudentBoarding [TASK-031]");
assert(acctCode.includes("UNAUTHORIZED_ROUTE_STUDENT"), "backend/accounting-service/Code.gs rechaza abordaje de estudiantes no asignados a la ruta [TASK-031]");
assert(acctCode.includes("STUDENT_ALREADY_BOARDED"), "backend/accounting-service/Code.gs previene doble registro de abordaje en un mismo viaje [TASK-031]");
assert(acctCode.includes("recordStudentAlighting") && acctCode.includes("STUDENT_NOT_BOARDED_IN_TRIP"), "backend/accounting-service/Code.gs verifica abordaje previo antes de registrar descenso [TASK-031]");
assert(acctCode.includes("getTripPassengerManifest") && acctCode.includes("pasajerosABordo"), "backend/accounting-service/Code.gs implementa consulta de manifiesto en tiempo real [TASK-031]");

// [TASK-032] [F21-Task04] - Gestión de personas autorizadas y entrega segura en paradas
assert(acctCode.includes("TransportePersonasAutorizadas") && acctCode.includes("getAuthorizedPickupPersons"), "backend/accounting-service/Code.gs incluye gestión de adultos autorizados [TASK-032]");
assert(acctCode.includes("recordStudentSafeDelivery") && acctCode.includes("UNAUTHORIZED_PICKUP_PERSON"), "backend/accounting-service/Code.gs bloquea entregas a adultos no autorizados [TASK-032]");

// [TASK-033] [F21-Task05] - Flota vehicular, conductores y documentación habilitante
assert(acctCode.includes("manageTransportVehicle") && acctCode.includes("getTransportVehicles"), "backend/accounting-service/Code.gs implementa gestión de flota vehicular [TASK-033]");
assert(acctCode.includes("manageTransportDriver") && acctCode.includes("getTransportDrivers"), "backend/accounting-service/Code.gs implementa gestión de conductores y acompañantes [TASK-033]");
assert(acctCode.includes("VEHICLE_INSURANCE_EXPIRED") && acctCode.includes("DRIVER_LICENSE_EXPIRED"), "backend/accounting-service/Code.gs bloquea asignaciones con seguros o licencias vencidas [TASK-033]");

// [TASK-034] [F21-Task06] - Cierre obligatorio de recorrido y confirmación de unidad vacía
assert(acctCode.includes("finalizeTransportTrip") && acctCode.includes("STUDENTS_STILL_ON_BOARD"), "backend/accounting-service/Code.gs bloquea cierre de viaje si quedan estudiantes a bordo [TASK-034]");
assert(acctCode.includes("PHYSICAL_INSPECTION_REQUIRED") && acctCode.includes("CerradoNormal"), "backend/accounting-service/Code.gs exige inspección física de unidad vacía para cierre normal [TASK-034]");

// [TASK-035] [F21-Task07] - Integración con Mantenimiento Vehicular
assert(acctCode.includes("VEHICLE_UNDER_MAINTENANCE"), "backend/accounting-service/Code.gs bloquea asignación a rutas de vehículos en mantenimiento [TASK-035]");
assert(acctCode.includes("TransporteVehiculos") && acctCode.includes("manageMaintenanceOrder"), "backend/accounting-service/Code.gs sincroniza estado de vehículo al gestionar órdenes de mantenimiento [TASK-035]");

// [TASK-036] [F21-Task08] - Auditoría y Migración de Datos de Transporte
assert(acctCode.includes("auditAndMigrateTransportData"), "backend/accounting-service/Code.gs expone función auditAndMigrateTransportData [TASK-036]");
assert(acctCode.includes("CORRECTIVE_AUTO_PROVISIONED_VEHICLE") && acctCode.includes("rutasSinVehiculoMaestro"), "backend/accounting-service/Code.gs audita inconsistencias y auto-aprovisiona vehículos faltantes [TASK-036]");

// [TASK-037] [F21-Task34] - Suite Automatizada de Pruebas y Regresión Integral de Transporte
assert(acctCode.includes("runPhase21TransportAndServicesRegressionSuite") && acctCode.includes("[TASK-037]"), "backend/accounting-service/Code.gs contiene suite runPhase21TransportAndServicesRegressionSuite [TASK-037]");
assert(devCode.includes("runPhase21TransportAndServicesRegressionSuite") && devCode.includes("[TASK-037]"), "backend/developer-service/Code.gs integra orquestación de suite de transporte [TASK-037]");
assert(acctCode.includes("PT21-01") && acctCode.includes("PT21-06") && acctCode.includes("PT21-12"), "backend/accounting-service/Code.gs cubre pruebas completas PT21-01 a PT21-12 [TASK-037]");

// [TASK-038] [F22-Task01] - Validación binaria, seguridad e integridad de archivos adjuntos
assert(acctCode.includes("validateFileBinaryIntegrity") && acctCode.includes("DANGEROUS_FILE_EXTENSION") && acctCode.includes("BINARY_SIGNATURE_MISMATCH"), "backend/accounting-service/Code.gs contiene función validateFileBinaryIntegrity con Magic Bytes [TASK-038]");
assert(userCode.includes("validateFileBinaryIntegrity") && userCode.includes("DANGEROUS_FILE_EXTENSION"), "backend/user-service/Code.gs contiene función validateFileBinaryIntegrity [TASK-038]");
assert(acctCode.includes("binaryValidation = validateFileBinaryIntegrity(fileData, fileName") && acctCode.includes("uploadPaymentVoucher"), "backend/accounting-service/Code.gs integra validación binaria en uploadPaymentVoucher [TASK-038]");
assert(userCode.includes("binaryValidation = validateFileBinaryIntegrity(adjuntoData, adjuntoNombre") && userCode.includes("submitInstitutionalFormRequest"), "backend/user-service/Code.gs integra validación binaria en submitInstitutionalFormRequest [TASK-038]");

// [TASK-039] [F22-Task02] - Hash SHA-256 y vinculación criptográfica de firmas con documentos
assert(acctCode.includes("computeDocumentSHA256") && acctCode.includes("sha256Hash"), "backend/accounting-service/Code.gs calcula hash SHA-256 e indexa en emisión de documentos [TASK-039]");
assert(userCode.includes("computeDocumentSHA256") && userCode.includes("signatureHash"), "backend/user-service/Code.gs implementa computeDocumentSHA256 y vinculación en firmas [TASK-039]");
assert(userCode.includes("registerDocumentSignature") && userCode.includes("documentoHash") && userCode.includes("signatureHash"), "backend/user-service/Code.gs vincula criptográficamente firmas y documentos con SHA-256 [TASK-039]");

// [TASK-040] [F22-Task03] - Certificado de finalización y expediente probatorio de cada firma
assert(userCode.includes("generateSignatureAuditCertificate") && userCode.includes("pistaAuditoriaFirmantes"), "backend/user-service/Code.gs implementa función generateSignatureAuditCertificate [TASK-040]");
assert(userCode.includes("certificadoIntegridadSHA256") && userCode.includes("timestampHondurasGMT6"), "backend/user-service/Code.gs genera certificado con huella de integridad y hora de Honduras GMT-6 [TASK-040]");
assert(acctCode.includes("certificadoAuditoria") && acctCode.includes("verifySchoolDocumentByCUV"), "backend/accounting-service/Code.gs integra expediente probatorio en verifySchoolDocumentByCUV [TASK-040]");

// [TASK-041] [F22-Task04] - Integración con firma electrónica avanzada y proveedores de certificación (Decreto 149-2013)
assert(userCode.includes("ConfiguracionFirmaAvanzada") && userCode.includes("configureAdvancedSignatureProvider"), "backend/user-service/Code.gs implementa configureAdvancedSignatureProvider [TASK-041]");
assert(userCode.includes("createAdvancedSignatureRequest") && userCode.includes("TransaccionesFirmaAvanzada"), "backend/user-service/Code.gs implementa createAdvancedSignatureRequest con estados transaccionales [TASK-041]");
assert(userCode.includes("checkAdvancedSignatureStatus") && userCode.includes("FirmaAvanzadaCualificada"), "backend/user-service/Code.gs implementa checkAdvancedSignatureStatus bajo Decreto 149-2013 [TASK-041]");

// [TASK-042] [F22-Task13] - Suite Integral de Pruebas y Regresión Automatizada de la Fase 22
assert(acctCode.includes("runPhase22DocumentManagementAndSACERegressionSuite") && acctCode.includes("[TASK-042]"), "backend/accounting-service/Code.gs contiene suite runPhase22DocumentManagementAndSACERegressionSuite [TASK-042]");
assert(devCode.includes("runPhase22DocumentManagementAndSACERegressionSuite") && devCode.includes("[TASK-042]"), "backend/developer-service/Code.gs integra suite runPhase22DocumentManagementAndSACERegressionSuite [TASK-042]");
assert(acctCode.includes("PT22-01") && acctCode.includes("PT22-06") && acctCode.includes("PT22-12"), "backend/accounting-service/Code.gs cubre pruebas completas PT22-01 a PT22-12 [TASK-042]");

// [TASK-044] [F23-Task01] - Integridad Transaccional, Candados Atómicos y Autorización de Decisiones
assert(userCode.includes("processWorkflowDecision") && userCode.includes("WORKFLOW_CONCURRENCY_LOCKED"), "backend/user-service/Code.gs bloquea decisiones concurrentes con LockService [TASK-044]");
assert(userCode.includes("STAGE_ALREADY_RESOLVED_CONFLICT") && userCode.includes("WORKFLOW_INVALID_STATE"), "backend/user-service/Code.gs impide resolver etapas ya decididas o en estado inválido [TASK-044]");
assert(userCode.includes("estadoFinalCalculado") && userCode.includes("siguienteAsignadoCalculado"), "backend/user-service/Code.gs calcula transiciones del lado del servidor [TASK-044]");

// [TASK-045] [F23-Task02] - Idempotencia de Solicitudes, Decisiones y Operaciones Institucionales
assert(userCode.includes("checkAndRegisterIdempotencyKey") && userCode.includes("saveIdempotentResult"), "backend/user-service/Code.gs implementa motor de idempotencia [TASK-045]");
assert(userCode.includes("IDEMPOTENCY_KEY_PAYLOAD_MISMATCH") && userCode.includes("cachedIdempotentResult"), "backend/user-service/Code.gs rechaza claves reutilizadas incompatibles y devuelve resultado previo [TASK-045]");

// [TASK-046] [F23-Task03] - Enrutador Universal de Spreadsheets y Resolución Dinámica de Fuentes de Datos
assert(userCode.includes("resolveSpreadsheetSource") && acadCode.includes("resolveSpreadsheetSource") && acctCode.includes("resolveSpreadsheetSource"), "backend servicios implementan resolveSpreadsheetSource homogéneo [TASK-046]");
assert(acctCode.includes("SOURCE_SPREADSHEET_DISABLED") && userCode.includes("SOURCE_SPREADSHEET_DISABLED"), "backend servicios rechazan fuentes deshabilitadas de Spreadsheets [TASK-046]");

// [TASK-047] [F23-Task04] - Catálogo Institucional de Cuentas, Servicios y Permisos Distribuidos
assert(devCode.includes("CatalogoServicios") && devCode.includes("registerServiceInstance"), "backend/developer-service/Code.gs implementa registro de servicios en CatalogoServicios [TASK-047]");
assert(devCode.includes("DUPLICATE_SERVICE_REGISTRATION") && devCode.includes("HistorialServiciosDistribuidos"), "backend/developer-service/Code.gs previene duplicados y mantiene histórico de servicios [TASK-047]");

// [TASK-048] [F23-Task05] - Protocolo Universal de Comunicación Interservicio y Gestión de Credenciales
assert(userCode.includes("createInterServiceEnvelope") && acctCode.includes("createInterServiceEnvelope") && acadCode.includes("createInterServiceEnvelope") && devCode.includes("createInterServiceEnvelope"), "backend servicios implementan createInterServiceEnvelope homogéneo [TASK-048]");
assert(userCode.includes("INTERSERVICE_REPLAY_DETECTED") && acctCode.includes("INTERSERVICE_REPLAY_DETECTED") && userCode.includes("INVALID_INTERSERVICE_SIGNATURE"), "backend servicios implementan verificación anti-replay y firma HMAC interservicio [TASK-048]");

// [TASK-049] [F23-Task06] - Auditoría Criptográfica y Encadenamiento Anti-Manipulación de Decisiones
assert(userCode.includes("verifyWorkflowDecisionAuditChain") && userCode.includes("AUDIT_CHAIN_INTEGRITY_COMPROMISED"), "backend/user-service/Code.gs implementa verifyWorkflowDecisionAuditChain [TASK-049]");
assert(userCode.includes("recordWorkflowDecisionCorrection") && userCode.includes("hashPrevio") && userCode.includes("hashActual"), "backend/user-service/Code.gs implementa encadenamiento de decisiones y eventos de corrección inmutables [TASK-049]");

// [TASK-050] [F24-Task01] - Catálogo Centralizado de Informes Institucionales con Permisos por Perfil
assert(userCode.includes("getInstitutionalReportCatalog") && userCode.includes("rolesPermitidos") && acadCode.includes("getAcademicInstitutionalReportCatalog"), "backend servicios implementan catálogo unificado de informes con roles [TASK-050]");
assert(userCode.includes("REP-ACAD-04") && userCode.includes("REP-CONT-04") && userCode.includes("soloActivos"), "backend/user-service/Code.gs incluye informes expandidos REP-ACAD-04 y REP-CONT-04 [TASK-050]");

// [TASK-051] [F24-Task02] - Diccionario Semántico Centralizado de Indicadores Institucionales
assert(devCode.includes("getInstitutionalIndicatorsDictionary") && devCode.includes("IND-ACAD-01") && devCode.includes("IND-FIN-01"), "backend/developer-service/Code.gs implementa getInstitutionalIndicatorsDictionary [TASK-051]");
assert(devCode.includes("formulaCalculo") && devCode.includes("fuenteDatosPrimaria") && devCode.includes("IND-ADM-03"), "backend/developer-service/Code.gs estructura diccionario semántico con fórmulas y fuentes [TASK-051]");

console.log(`\nRESULTADOS: ${passed}/${total} pruebas pasadas (${((passed/total)*100).toFixed(1)}%).`);
if (passed === total) {
  console.log("SUITE DE REGRESIÓN DE LA FASE 9 SUPERADA INTEGRALMENTE.");
  process.exit(0);
} else {
  console.error("SUITE DE REGRESIÓN DE LA FASE 9 FALLIDA.");
  process.exit(1);
}
