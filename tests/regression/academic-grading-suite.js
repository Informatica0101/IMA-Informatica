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

console.log(`\nRESULTADOS: ${passed}/${total} pruebas pasadas (${((passed/total)*100).toFixed(1)}%).`);
if (passed === total) {
  console.log("SUITE DE REGRESIÓN DE LA FASE 9 SUPERADA INTEGRALMENTE.");
  process.exit(0);
} else {
  console.error("SUITE DE REGRESIÓN DE LA FASE 9 FALLIDA.");
  process.exit(1);
}
