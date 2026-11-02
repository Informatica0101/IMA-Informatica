# [F8-Task14] Plan de Descomposición de Archivos Monolíticos y Mantenimiento de Contratos

## Alcance y Objetivos de Modularización

El objetivo de la tarea `[F8-Task14]` (`TAREA-MOD-03`) es dividir archivos monolíticos extensos por responsabilidad funcional sin eliminar, alterar o duplicar funciones, garantizando contratos públicos 100% compatibles.

## Matriz de Módulos Monolíticos y Contratos Públicos

| Archivo Origen | Responsabilidad Funcional | Contratos Públicos Clave Conservados |
| :--- | :--- | :--- |
| `js/ui-common.js` | UI Compartida, Modales, Búsquedas y Dashboards Dinámicos | `loadDynamicDashboard`, `filterDataByScope`, `validateUserScopeContext` |
| `js/secretary.js` | Gestión Administrativa, Roles y Coordinación Académica | `initCoordinatorDashboard`, `openRoleResponsibilityConfigModal`, `loadRoleConfigAdminData` |
| `js/teacher.js` | Gestión Docente, Tareas y Evaluaciones Analíticas | `previewSubmissionPDFDocument`, `openExamGradeDistributionModal` |
| `js/student.js` | Portal Estudiantil y Seguimiento Familiar | `initFamilyStudentSwitcher`, `renderApplicantTrackingPanel` |
| `backend/academic-service/Code.gs` | Lógica Académica, Horarios y Ámbitos | `getCoordinatorOverview`, `validateRoleScopeAccess`, `checkScheduleConflict` |

## Reglas de Compatibilidad y Prevención de Colisiones

1. **Inalterabilidad de Firmas:** Nombres de funciones expuestas en `window` conservan el mismo identificador y tipo de argumentos.
2. **Eliminación de Implementaciones Antiguas:** Únicamente tras confirmar en la suite de regresión la ausencia de consumidores activos.
3. **Validación de Duplicados:** La suite automatizada `validateMonolithDecompositionContracts` verifica la ausencia de colisiones globales en la ejecución.
