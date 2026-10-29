// [F8-Task04] [TAREA-MOD-06] Suite de Pruebas de Regresión para Modularización y Dashboards Dinámicos
// Este archivo ejecuta la suite de pruebas automatizadas en entorno Node.js/JS simulado.

const fs = require('fs');
const path = require('path');

console.log("=== EJECUTANDO SUITE DE REGRESIÓN DE MODULARIZACIÓN Y DASHBOARDS DINÁMICOS [F8-Task04] ===");

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

// 1. Verificación de archivos clave de modularización y dashboards dinámicos
assert(fs.existsSync(path.join(__dirname, '../../app/html/dashboards/dynamic-dashboard.html')), "Existe app/html/dashboards/dynamic-dashboard.html");
assert(fs.existsSync(path.join(__dirname, '../../dashboard-coordinacion.html')), "Existe dashboard-coordinacion.html");
assert(fs.existsSync(path.join(__dirname, '../../docs/architecture/repository-inventory.md')), "Existe docs/architecture/repository-inventory.md");
assert(fs.existsSync(path.join(__dirname, '../../docs/architecture/routing-and-paths.md')), "Existe docs/architecture/routing-and-paths.md");
assert(fs.existsSync(path.join(__dirname, '../../docs/architecture/staged-migration-procedure.md')), "Existe docs/architecture/staged-migration-procedure.md [F8-Task05]");
assert(fs.existsSync(path.join(__dirname, '../../docs/architecture/folder-structure.md')), "Existe docs/architecture/folder-structure.md [F8-Task13]");
assert(fs.existsSync(path.join(__dirname, '../../docs/architecture/monolith-decomposition-plan.md')), "Existe docs/architecture/monolith-decomposition-plan.md [F8-Task14]");
assert(fs.existsSync(path.join(__dirname, '../../MapaDependencias.md')), "Existe MapaDependencias.md [F8-Task15]");

// 2. Verificación de definiciones en js/config.js
const configContent = fs.readFileSync(path.join(__dirname, '../../js/config.js'), 'utf8');
assert(configContent.includes('CAPACITIES_CATALOG'), "js/config.js contiene CAPACITIES_CATALOG");
assert(configContent.includes('DYNAMIC_DASHBOARD_MODULE_CONTRACTS'), "js/config.js contiene DYNAMIC_DASHBOARD_MODULE_CONTRACTS");
assert(configContent.includes('MODULE_ROUTING_DICTIONARY'), "js/config.js contiene MODULE_ROUTING_DICTIONARY");

// 3. Verificación del backend developer-service Code.gs
const devServiceContent = fs.readFileSync(path.join(__dirname, '../../backend/developer-service/Code.gs'), 'utf8');
assert(devServiceContent.includes('runModularAndDynamicDashboardsRegressionSuite'), "backend/developer-service/Code.gs contiene suite runModularAndDynamicDashboardsRegressionSuite");
assert(devServiceContent.includes('validateStagedMigrationProgress'), "backend/developer-service/Code.gs contiene función validateStagedMigrationProgress [F8-Task05]");
assert(devServiceContent.includes('validateModularFolderStructure'), "backend/developer-service/Code.gs contiene función validateModularFolderStructure [F8-Task13]");
assert(devServiceContent.includes('validateMonolithDecompositionContracts'), "backend/developer-service/Code.gs contiene función validateMonolithDecompositionContracts [F8-Task14]");
assert(devServiceContent.includes('getArchitectureAndDependencyMapReport'), "backend/developer-service/Code.gs contiene función getArchitectureAndDependencyMapReport [F8-Task15]");
assert(devServiceContent.includes('getRoleFunctionalSpaceConfig'), "backend/developer-service/Code.gs contiene función getRoleFunctionalSpaceConfig [F8-Task16]");
assert(devServiceContent.includes('auditRoleIndependenceAndMasterDataIntegrity'), "backend/developer-service/Code.gs contiene función auditRoleIndependenceAndMasterDataIntegrity [F8-Task16]");
assert(devServiceContent.includes('validateStableIdentifiersAndControlColumns'), "backend/developer-service/Code.gs contiene función validateStableIdentifiersAndControlColumns [F8-Task17]");
assert(devServiceContent.includes('ensureStandardObservabilitySheets'), "backend/developer-service/Code.gs contiene función ensureStandardObservabilitySheets [F8-Task18]");
assert(devServiceContent.includes('validateObservabilitySheetsIntegrity'), "backend/developer-service/Code.gs contiene función validateObservabilitySheetsIntegrity [F8-Task18]");
assert(devServiceContent.includes('getCentralSpreadsheetConfigRegistry'), "backend/developer-service/Code.gs contiene función getCentralSpreadsheetConfigRegistry [F8-Task19]");
assert(devServiceContent.includes('recordProvisioningHistory'), "backend/developer-service/Code.gs contiene función recordProvisioningHistory [F8-Task19]");

console.log(`\nRESULTADOS: ${passed}/${total} pruebas pasadas (${((passed/total)*100).toFixed(1)}%).`);
if (passed === total) {
  console.log("SUITE DE REGRESIÓN SUPERADA INTEGRALMENTE.");
  process.exit(0);
} else {
  console.error("EXAMEN DE REGRESIÓN CON ERRORES.");
  process.exit(1);
}
