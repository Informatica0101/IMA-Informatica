# [F8-Task05] Procedimiento de Migración Reorganizada por Etapas Verificables

Este documento detalla el procedimiento de ejecución por etapas aisladas y verificables para la reorganización del repositorio y la verificación del plan de reversión (rollback).

## Etapas del Procedimiento de Migración

1. **Etapa 1: Establecimiento de Línea Base (`STAGE-1-BASELINE`)**
   - Confirmación del estado limpio del repositorio y etiquetado de la versión base `v8.4.0-baseline`.
   - Registro de la matriz de archivos y checksums.

2. **Etapa 2: Mapa de Dependencias e Inventario (`STAGE-2-DEPENDENCY-MAP`)**
   - Generación de `docs/architecture/repository-inventory.md`.
   - Mapeo de todas las referencias de scripts, estilos, endpoints e importaciones.

3. **Etapa 3: Definición y Adaptación de Estructura (`STAGE-3-FOLDER-STRUCTURE`)**
   - Agrupación lógica de componentes dentro de `app/` y `backend/` manteniendo `index.htm` en la raíz.
   - Preservación de la compatibilidad con las herramientas de despliegue (`clasp`).

4. **Etapa 4: Actualización de Rutas y Referencias (`STAGE-4-ROUTING-UPDATES`)**
   - Definición del diccionario `MODULE_ROUTING_DICTIONARY` en `js/config.js`.
   - Verificación de ausencia de errores HTTP 404 en recursos estáticos y dinámicos.

5. **Etapa 5: Verificación de Regresión y Control de Reversión (`STAGE-5-REGRESSION-SUITE`)**
   - Ejecución de la suite `tests/regression/modular-dashboard-suite.js` y `runModularAndDynamicDashboardsRegressionSuite` en `backend/developer-service/Code.gs`.
   - Comprobación del procedimiento de rollback con token `ROLLBACK-CONFIRMED`.

## Procedimiento de Reversión (Rollback Protocol)

En caso de detectarse cualquier fallo de regresión no recuperable durante una etapa de migración:

1. Invocar el comando de reversión en `backend/developer-service/Code.gs`:
   ```json
   {
     "action": "executeServiceVersionRollback",
     "serviceId": "ALL_SERVICES",
     "targetVersion": "v8.4.0-baseline",
     "rollbackConfirmation": "ROLLBACK-CONFIRMED"
   }
   ```
2. Confirmar la restitución del código fuente y esquemas mediante `validateStagedMigrationProgress`.
3. Ejecutar la suite de diagnóstico de salud de servicios (`getServiceHealthDiagnostics`).
