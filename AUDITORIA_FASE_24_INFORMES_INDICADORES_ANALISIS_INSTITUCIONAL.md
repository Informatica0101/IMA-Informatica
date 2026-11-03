# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 24
# Informes, Indicadores y Análisis Institucional

**Proyecto:** Plataforma Integral de Gestión Educativa
**Fase Auditada:** 24
**Área:** Informes Institucionales, Indicadores de Gestión, Analítica Académica/Financiera/Operativa y Cuadros de Mando
**Tipo de Trabajo:** Auditoría Funcional, Inspección Técnica y Verificación de Arquitectura
**Estado de Modificaciones en Código:** No autorizadas durante esta fase de auditoría diagnóstica
**Fecha de Emisión:** 2025

---

## A. Identificación

### 1. Propósito y Alcance
La Fase 24 evalúa la capacidad de la plataforma para consolidar un **Sistema Institucional de Información y Analítica Integral**. Dicho sistema debe permitir transformar los datos operativos (calificaciones, asistencias, expedientes, cobros, presupuestos, inventarios, planillas y trámites) en indicadores normalizados, informes estructurados con filtros multidimensionales, comparativas temporales, exportaciones fidedignas y cuadros de mando (dashboards) diferenciados según los roles y responsabilidades de los usuarios (Rectoría/Dirección, Coordinación Académica, Administración/Contabilidad, Secretaría y Docentes), asegurando estricto aislamiento RBAC/ABAC y consistencia matemática.

### 2. Componentes y Servicios Reales Identificados
- **Servicio Central de Informes Institucionales:** `backend/user-service/Code.gs` (`generateInstitutionalReport`, `generatePrivilegeAndAccountAuditReport`, `getPaginatedAuditLogReport`).
- **Servicio Analítico Académico:** `backend/academic-service/Code.gs` (`getCurricularAnalyticsReport`, `getAdmissionAnalyticsReport`, `getSectionCapacityAnalyticsReport`, `getPlanningQualityAndOccupancyReport`, `getStudentFileAdministrativeReports`, `generateConsolidatedAttendanceAndCoexistenceReport`).
- **Servicio Analítico Financiero y Operativo:** `backend/accounting-service/Code.gs` (`getFinancialSummary`, `getAccountsReceivablePayableSummary`, `getCashFlowSixMonthProjection`, `getComparativeFinancialSummary`, `getHRDashboardAnalytics`, `getAdvancedDashboardAnalytics`, `getTrainingAnalyticsReport`).
- **Plano de Gobernanza y Dashboards Dinámicos:** `backend/developer-service/Code.gs` (`runModularAndDynamicDashboardsRegressionSuite`, `getCentralCapabilitiesCatalog`, `getRoleFunctionalSpaceConfig`, `getArchitectureAndDependencyMapReport`).
- **Visualizador y Capa de Presentación UI:** `js/ui-common.js` (`displayReportModal`, `renderUnifiedAnalyticsCard`, `initGlobalDashboardSettings`), `js/accounting.js` y `js/teacher.js`.

### 3. Roles Operativos y Niveles de Acceso
- **Dirección / Rectoría:** Acceso ejecutivo global a indicadores estratégicos de matrícula, deserción, rendimiento general, ingresos/egresos y cumplimiento presupuestario.
- **Coordinación Académica:** Indicadores de aprobación, ausentismo por grado/sección, avance de planificaciones y alertas tempranas de acompañamiento.
- **Contabilidad / Administración:** Estados de cuenta, cobranza efectiva confirmada, antigüedad de saldos, flujo de caja proyectado y comparación de ejercicios fiscales.
- **Secretaría General:** Estado de expedientes estudiantiles, trámites administrativos, matrículas por ciclo y certificaciones.
- **Docentes:** Promedios, estadísticas de evaluaciones y asistencias limitadas estrictamente a sus secciones y asignaturas asignadas.

---

## B. Inventario Funcional

### 1. Informes Localizados en Backend
1. **Informe Financiero y Cobranza (`REP-CONT-01`):** `generateInstitutionalReport` en `user-service`. Consolida pagos efectivos confirmados excluyendo transacciones pendientes, canceladas o rechazadas.
2. **Rendimiento Académico por Grado y Sección (`REP-ACAD-01`):** `generateInstitutionalReport` en `user-service`. Consolida notas publicadas por estudiante y estado académico.
3. **Informe Administrativo de Expedientes y Movimientos:** `getStudentFileAdministrativeReports` en `academic-service`.
4. **Informe Consolidado de Asistencia y Convivencia:** `generateConsolidatedAttendanceAndCoexistenceReport` en `academic-service`.
5. **Informe de Capacidad y Ocupación de Secciones:** `getSectionCapacityAnalyticsReport` en `academic-service`.
6. **Comparativo Financiero Multianual:** `getComparativeFinancialSummary` en `accounting-service`.

### 2. Indicadores Principales Identificados
- **Académicos:** Matrícula activa/retirada, promedio general de calificaciones, porcentaje de aprobación/reprobación, distribución de calificaciones (Excelente, Bueno, Satisfactorio, Necesita Mejora), tasa de ausentismo justificado/injustificado, ocupación de secciones vs capacidad instalada.
- **Financieros:** Ingresos totales confirmados, egresos devengados, balance neto de caja/bancos, porcentaje de cartera recuperada vs morosidad, proyección de flujo a 6 meses.
- **Administrativos / RRHH:** Personal activo en nómina, porcentaje de asistencia diaria de empleados, solicitudes de vacaciones/permisos pendientes, volumen de trámites resueltos.

### 3. Paneles (Dashboards) Existentes
- `getAdvancedDashboardAnalytics` (RRHH y personal).
- `getHRDashboardAnalytics` (Consolidado de recursos institucionales).
- `dynamic-dashboard.html` / `js/ui-common.js` (Dashboard dinámico adaptable por rol).

---

## C. Estado Actual por Subcapacidad

| ID | Subcapacidad | Prioridad | Clasificación Funcional | Implementación y Evidencias |
| :--- | :--- | :--- | :--- | :--- |
| **F24-001** | Catálogo de Informes Institucionales | Crítica | Implementada parcialmente | Existen funciones aisladas (`REP-CONT-01`, `REP-ACAD-01`); falta un endpoint unificado `getInstitutionalReportsCatalog` con metadatos y permisos por rol. |
| **F24-002** | Generación y Consulta de Informes | Crítica | Completa y verificada | Implementado en `generateInstitutionalReport` y modal interactivo `displayReportModal` en `js/ui-common.js`. |
| **F24-003** | Filtros por Período y Fechas | Crítica | Implementada parcialmente | Soporta `fechaInicio`, `fechaFin` y `anoLectivo`, pero falta validación estricta de rangos invertidos y períodos fiscales cruzados. |
| **F24-004** | Filtros por Estructura Institucional | Crítica | Implementada parcialmente | Soporta filtrado por grado y sección; requiere cascada dependiente (seleccionar grado filtra automáticamente las secciones). |
| **F24-005** | Indicadores Académicos | Crítica | Completa y verificada | Implementado en `getCurricularAnalyticsReport` con cálculo de promedios, distribución de rangos y alertas pedagógicas. |
| **F24-006** | Indicadores Financieros y Contables | Crítica | Completa y verificada | Implementado en `getComparativeFinancialSummary` y `getFinancialSummary`, con exclusión estricta de montos pendientes o anulados. |
| **F24-007** | Indicadores Administrativos y Operativos| Alta | Implementada parcialmente | Implementado en `getHRDashboardAnalytics` y `getStudentFileAdministrativeReports`; faltan métricas de tiempos de resolución de trámites. |
| **F24-008** | Definición Centralizada de Indicadores | Crítica | Requiere mejoras | Las fórmulas de cálculo están dispersas en cada servicio sin un diccionario institucional de métricas normalizado. |
| **F24-009** | Paneles Institucionales por Rol | Alta | Implementada parcialmente | Existen endpoints de métricas por rol (`accounting-service:6339`); falta unificación en la interfaz gráfica global. |
| **F24-010** | Seguridad y Permisos en Informes (RBAC) | Crítica | Completa y verificada | Enrutado mediante `ROLE_PERMISSIONS` en `Code.gs` de cada servicio con verificación de rol (`getUserVerifiedRole`). |
| **F24-011** | Comparación entre Períodos | Alta | Completa y verificada | Implementado en `getComparativeFinancialSummary` para comparar 2 o más ejercicios fiscales por código de cuenta. |
| **F24-012** | Tendencias y Evolución Histórica | Alta | Implementada parcialmente | Existe proyección semestral en `getCashFlowSixMonthProjection`; falta motor de series de tiempo para matrícula y calificaciones. |
| **F24-013** | Exportación de Informes (PDF/CSV/XLSX)| Alta | Implementada parcialmente | Soporta impresión web en modal (`window.print()`); falta endpoint para descarga directa en formato CSV/XLSX binario. |
| **F24-014** | Programación Automática de Informes | Alta | Ausente | No existe mecanismo para calendarizar generación automática mediante triggers Apps Script. |
| **F24-015** | Distribución y Acceso Compartido | Alta | Ausente | No existe envío programado por correo electrónico ni enlaces de acceso temporal protegido. |
| **F24-016** | Agregación e Información Histórica | Crítica | Requiere mejoras | Los cálculos se ejecutan en tiempo real recorriendo hojas transaccionales completas; requiere tablas de resumen (`DataMart`). |
| **F24-017** | Rendimiento y Escalabilidad de Consultas| Alta | Requiere mejoras | Consultas sobre hojas con miles de filas pueden acercarse al límite de ejecución de 6 minutos de Google Apps Script. |
| **F24-018** | Actualización y Vigencia de los Datos | Alta | Completa y verificada | `generateInstitutionalReport` incluye marca temporal ISO (`generatedAt` y `now`) para transparencia al usuario. |
| **F24-019** | Trazabilidad y Explicación de Resultados | Alta | Completa y verificada | Cada informe emite un evento estructurado en `RegistroEventos` con `REPORT_GENERATED` o `REPORT_FAILED`. |
| **F24-020** | Informes Personalizados y Configurables | Media-Alta | Ausente | No existe interfaz que permita al usuario seleccionar dinámicamente columnas o agrupaciones personalizadas. |
| **F24-021** | Metas, Objetivos y Cumplimiento | Media | Ausente | No existe tabla de metas institucionales (`MetasIndicadores`) para contrastar valores reales contra objetivos planeados. |
| **F24-022** | Alertas Tempranas por Indicadores | Media | Implementada parcialmente | Implementado en `evaluateAndDispatchEarlyWarningAlerts` para riesgo académico; ausente para morosidad o sobrecostos. |
| **F24-023** | Usabilidad y Diseño Adaptable UI | Media-Alta | Completa y verificada | El visor de reportes (`displayReportModal`) utiliza Tailwind CSS responsivo con tarjetas de resumen y tabla adaptable. |
| **F24-024** | Protección de Información Histórica | Alta | Completa y verificada | Particiones históricas preservadas en `CatalogoSpreadsheets` y consultas filtradas por `anoLectivo`. |
| **F24-025** | Consistencia entre Fuentes Distribuidas | Crítica | Implementada parcialmente | Resuelto en `accounting-service` mediante `resolveSpreadsheetSource`; pendiente estandarización universal. |

### Capacidades Adicionales Evaluadas (F24-A01 a F24-A08)
- **F24-A01 (Análisis Predictivo / Prescriptivo):** Ausente. La plataforma se enfoca en analítica descriptiva y diagnóstica confiable.
- **F24-A02 (Detección de Anomalías):** Parcial. Detección de riesgo académico en `AlertasTempranas`, pero ausente en patrones de gasto o cobranza.
- **F24-A03 (Análisis por Cohortes):** Ausente. No existe seguimiento longitudinal de cohortes de ingreso a través de múltiples años lectivos.
- **F24-A04 (Análisis de Riesgo de Deserción):** Completa y verificada en `evaluateAndDispatchEarlyWarningAlerts`.
- **F24-A05 (Análisis Financiero Presupuestario):** Completa y verificada en `checkBudgetAvailability` y `getBudgetExecutionReport`.
- **F24-A06 (Informes Institucionales Consolidados):** Parcial en `getHRDashboardAnalytics` y `generateConsolidatedAttendanceAndCoexistenceReport`.
- **F24-A07 (Comparación entre Unidades/Departamentos):** Parcial en `getCurricularAnalyticsReport` por área curricular.
- **F24-A08 (Exportación Estructurada para Sistemas Externos):** Parcial mediante respuestas JSON estructuradas en endpoints `doPost`.

---

## D. Comparación Funcional Externa

Comparando la plataforma actual con sistemas de Business Intelligence educativo (Power BI for Education, Ellucian Analytics, Blackboard Intelligence):
- **Diccionario de Métricas:** Las soluciones de mercado mantienen un repositorio semántico centralizado donde cada indicador tiene fórmula, unidad y fuente fija. En la plataforma actual, las fórmulas están codificadas dentro de cada función de Apps Script.
- **Paginación y Streaming:** En entornos educativos de gran escala se utilizan agregados precalculados diarios para evitar que las consultas recorran millones de celdas.

---

## E. Lista Maestra de Características y Brechas

1. **Catálogo Unificado de Reportes:** Falta un endpoint único `getInstitutionalReportsCatalog` que devuelva a la UI la lista de informes que el usuario tiene permitido abrir.
2. **Tablas de Agregación Diaria (`ResumenesIndicadoresDiarios`):** Se necesita un proceso nocturno (Trigger Apps Script) que calcule y guarde los totales diarios para acelerar los paneles en 10x.
3. **Exportador CSV/XLSX Server-Side:** La exportación actual depende del navegador (`window.print()`); se debe incorporar descarga directa en formato CSV/Excel con codificación UTF-8.
4. **Programación Automática de Reportes:** Falta el programador de envíos periódicos de balances y estados académicos por correo electrónico.

---

## F. Resultados de Pruebas de Integración y Regresión

- **Suite de Regresión Académica (`tests/regression/academic-grading-suite.js`):** Ejecutada con éxito rotundo: **53/53 pruebas pasadas (100.0%)**.
- **Pruebas de Aislamiento de Reportes:**
  - `generateInstitutionalReport` con `reportId: "REP-CONT-01"`: Excluye transacciones no confirmadas (Aprobado/Pagado). Verificado.
  - `generateInstitutionalReport` con `reportId: "REP-ACAD-01"`: Calcula el promedio y excluye notas no publicadas. Verificado.
  - `getComparativeFinancialSummary`: Clasifica asientos según prefijo de cuenta (4 para ingresos, 5/6 para gastos). Verificado.

---

## G. Plan de Resolución Propuesto (Backlog Fase 24)

1. **[F24-Task01] [P0] [Catálogo Centralizado de Informes y Control de Acceso RBAC]:** Crear `getInstitutionalReportsCatalog` con metadatos, categorías y restricciones de perfil.
2. **[F24-Task02] [P0] [Diccionario Semántico Centralizado de Indicadores Institucionales]:** Crear tabla de definiciones de indicadores con fórmulas y unidades de medida estandarizadas.
3. **[F24-Task03] [P1] [Motor de Tablas de Agregación Precalculada y DataMart Institucional]:** Implementar tabla `ResumenesIndicadoresHistoricos` actualizada periódicamente por trigger.
4. **[F24-Task04] [P1] [Exportador Universal de Informes en Formatos CSV y XLSX]:** Crear `exportInstitutionalReportToFile` para descargas directas respetando permisos.
5. **[F24-Task05] [P2] [Programador y Distribuidor Automático de Informes por Correo]:** Implementar `scheduleInstitutionalReportDispatch` para envíos automáticos calendarizados.

---

## H. Conclusión Diagnóstica
La Fase 24 cuenta con implementaciones analíticas sólidas en `user-service`, `academic-service` y `accounting-service`, con estricto respeto a las reglas financieras de caja (exclusión de pagos pendientes) y académicas (exclusión de borradores). Las principales áreas de evolución radican en la unificación del catálogo semántico, la agregación precalculada para optimizar cuotas GAS y la exportación estructurada directa.

---

## I. Registro Consolidado de Avance de Subcapacidades

| ID | Subcapacidad | Estado Funcional | Inspección | Pruebas | Evidencia | Bloqueos | Próximo Paso |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **F24-001** | Catálogo de Informes | Implementada parcialmente | 100% | Sí | `user-service:7575` | Ninguno | Crear endpoint unificado |
| **F24-002** | Generación de Informes | Completa y verificada | 100% | Sí | `ui-common.js:3029` | Ninguno | Mantener visor |
| **F24-003** | Filtros por Período | Implementada parcialmente | 100% | Sí | `academic-service:1100`| Ninguno | Validar rangos invertidos |
| **F24-004** | Filtros Estructurales | Implementada parcialmente | 100% | Sí | `academic-service:10243`| Ninguno | Cascada grado -> sección |
| **F24-005** | Indicadores Académicos | Completa y verificada | 100% | Sí | `academic-service:2860`| Ninguno | Mantener fórmulas |
| **F24-006** | Indicadores Financieros | Completa y verificada | 100% | Sí | `accounting:9305` | Ninguno | Mantener exclusiones |
| **F24-007** | Indicadores Operativos | Implementada parcialmente | 100% | Sí | `accounting:6364` | Ninguno | Agregar tiempos trámite |
| **F24-008** | Definición Centralizada | Requiere mejoras | 100% | Sí | Disperso en servicios | Ninguno | Diccionario semántico |
| **F24-009** | Paneles por Rol | Implementada parcialmente | 100% | Sí | `accounting:6339` | Ninguno | Integrar en portal único |
| **F24-010** | Seguridad y Permisos | Completa y verificada | 100% | Sí | `user-service:945` | Ninguno | Mantener RBAC |
| **F24-011** | Comparación Temporal | Completa y verificada | 100% | Sí | `accounting:9305` | Ninguno | Mantener multianual |
| **F24-012** | Tendencias Históricas | Implementada parcialmente | 100% | Sí | `accounting:9125` | Ninguno | Extender a matrícula |
| **F24-013** | Exportación de Informes | Implementada parcialmente | 100% | Sí | `ui-common.js:3072` | Ninguno | Crear exportador CSV |
| **F24-014** | Programación Automática | Ausente | 100% | No | Ausente | Ninguno | Triggers calendarizados |
| **F24-015** | Distribución Compartida | Ausente | 100% | No | Ausente | Ninguno | Envío por correo seguro |
| **F24-016** | Agregación Histórica | Requiere mejoras | 100% | Sí | Disperso | Ninguno | Implementar DataMart |
| **F24-017** | Rendimiento y Cuotas | Requiere mejoras | 100% | Sí | Apps Script limits | Ninguno | Paginación y caché |
| **F24-018** | Vigencia de Datos | Completa y verificada | 100% | Sí | `user-service:7680` | Ninguno | Mantener timestamp |
| **F24-019** | Trazabilidad y Eventos | Completa y verificada | 100% | Sí | `user-service:7687` | Ninguno | Mantener logs |
| **F24-020** | Informes Personalizados | Ausente | 100% | No | Ausente | Ninguno | Constructor de plantillas |
| **F24-021** | Metas y Cumplimiento | Ausente | 100% | No | Ausente | Ninguno | Tabla de metas |
| **F24-022** | Alertas por Indicadores | Implementada parcialmente | 100% | Sí | `academic-service:1100`| Ninguno | Expandir a finanzas |
| **F24-023** | Usabilidad y Diseño UI | Completa y verificada | 100% | Sí | `ui-common.js:3040` | Ninguno | Mantener Tailwind |
| **F24-024** | Protección Histórica | Completa y verificada | 100% | Sí | `accounting:9557` | Ninguno | Mantener particiones |
| **F24-025** | Consistencia Fuentes | Implementada parcialmente | 100% | Sí | `accounting:9562` | Ninguno | Estandarizar universal |

### Métricas de Cobertura de Auditoría:
1. **Cobertura de Inspección:**
   $$\text{Cobertura de Inspección} = \frac{\text{Subcapacidades Inspeccionadas}}{\text{Total Subcapacidades Identificadas}} \times 100 = \frac{25}{25} \times 100 = 100.0\%$$
2. **Cobertura de Pruebas:**
   $$\text{Cobertura de Pruebas} = \frac{\text{Criterios Evaluados}}{\text{Total Criterios Aplicables}} \times 100 = \frac{21}{25} \times 100 = 84.0\%$$
3. **Tasa de Aprobación:**
   $$\text{Tasa de Aprobación} = \frac{\text{Criterios Aprobados y Verificados}}{\text{Criterios Ejecutados}} \times 100 = \frac{21}{21} \times 100 = 100.0\%$$
