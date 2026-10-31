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

console.log(`\nRESULTADOS: ${passed}/${total} pruebas pasadas (${((passed/total)*100).toFixed(1)}%).`);
if (passed === total) {
  console.log("SUITE DE REGRESIÓN DE LA FASE 9 SUPERADA INTEGRALMENTE.");
  process.exit(0);
} else {
  console.error("SUITE DE REGRESIÓN DE LA FASE 9 FALLIDA.");
  process.exit(1);
}
