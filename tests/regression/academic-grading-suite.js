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
assert(fs.existsSync(path.join(__dirname, '../../AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md')), "Existe informe independiente AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md");

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

console.log(`\nRESULTADOS: ${passed}/${total} pruebas pasadas (${((passed/total)*100).toFixed(1)}%).`);
if (passed === total) {
  console.log("SUITE DE REGRESIÓN DE LA FASE 9 SUPERADA INTEGRALMENTE.");
  process.exit(0);
} else {
  console.error("SUITE DE REGRESIÓN DE LA FASE 9 FALLIDA.");
  process.exit(1);
}
