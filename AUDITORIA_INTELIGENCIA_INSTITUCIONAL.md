# INFORME DE AUDITORÍA FUNCIONAL INTEGRAL: FASE 12 (INTELIGENCIA INSTITUCIONAL)

**Plataforma:** Ecosistema Educativo New Generation Christian Academy
**Fase Auditada:** Fase 12. Inteligencia institucional (Ampliación Fase 29 del Plan General)
**Fecha de Auditoría:** Mayo 2024
**Responsable:** Jules

---

## A. RESUMEN EJECUTIVO

La auditoría funcional e integral de **Inteligencia Institucional** evaluó la arquitectura de analítica de datos, tableros de mando, catálogo de reportes consolidados, motores de gráficos dinámicos, trazabilidad de datos de origen y calidad/consistencia de la información para la toma de decisiones directivas. Se examinaron exhaustivamente los microservicios backend `backend/user-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/exam-service/Code.gs`, los controladores frontend `js/ui-common.js`, `js/teacher.js`, `js/student.js` y las funciones universales de gráficos `window.renderUniversalConfigurableChart` y `window.openAnalyticsChartModal`.

### Estado General de la Implementación
1. **Catálogo de Reportes e Indicadores Consolidados (INT-01, INT-06, INT-11, INT-15):** `backend/user-service/Code.gs` y `backend/academic-service/Code.gs` implementan el catálogo centralizado de reportes institucionales (`getInstitutionalReportCatalog`, `generateInstitutionalReport`). Garantiza que los ingresos reportados excluyan estrictamente los comprobantes/cargos no confirmados por administración.
2. **Motor Gráfico Universal Configurable (INT-14, INT-17):** `js/ui-common.js` proporciona `window.renderUniversalConfigurableChart` que soporta 5 categorías de gráficos (Minijuegos, Rendimiento Académico, Participación, Asistencia/Conducta, Administrativo), 5 tipos de visualización (barras verticales/horizontales, líneas, dona/pastel, radar) y conmutación a vista tabular de texto accesible.
3. **Métricas de Métricas de Recursos Humanos y Finanzas (INT-06):** `getHRDashboardAnalytics` y `getAdvancedDashboardAnalytics` en `backend/accounting-service/Code.gs` consolidan ingresos/egresos, balance neto, préstamos activos y métricas de personal.
4. **Principales Ausencias y Brechas (INT-02, INT-03, INT-04, INT-07, INT-08, INT-09, INT-10, INT-13):**
   - **Ausencia de Cálculo Formal de Deserción, Retención y Promoción (INT-03):** No existen fórmulas configuradas para calcular la tasa de deserción inter-anual ni la tasa de retención por cohorte.
   - **Falta de Seguimiento Académico por Cohortes (INT-04):** No hay seguimiento longitudinal de un grupo de estudiantes a través de múltiples años académicos.
   - **Inexistencia de Modelos de Proyección y Simuladores de Capacidad/Personal (INT-07, INT-08, INT-09, INT-13):** No existen modelos cuantitativos de proyección de demanda de cupos, proyección de ingresos futuros ni simulación de necesidades de contratación docente.
   - **Detección Automática de Inconsistencias y Datos Atípicos (INT-10):** No existen rutinas en segundo plano que identifiquen notas fuera de escala, matrículas dobles o cargos contables incoherentes.

---

## B. INVENTARIO DE COMPONENTES EXISTENTES

### 1. Archivos de Código y Vistas
- `backend/user-service/Code.gs`: Servicio central del catálogo de reportes institucionales y permisos de exportación.
- `backend/accounting-service/Code.gs`: Endpoints de métricas financieras y analítica de panel HR.
- `js/ui-common.js`: Motor gráfico universal (`window.renderUniversalConfigurableChart`, `window.openAnalyticsChartModal`) y centro de reportes institucionales (`window.renderReportsCenterUI`).
- `teacher-dashboard.html` y `student-dashboard.html`: Vistas que alojan los tableros analíticos por rol.

### 2. Hojas de Cálculo (Entidades de Persistencia)
- `ConfiguracionSistema`: Definiciones y parámetros globales.
- `RegistrosAuditoria`: Bitácora estructurada de eventos y accesos a reportes sensibles.
- `CalificacionesEstudiantes`: Registro histórico de notas para analítica de rendimiento.
- `ExpedientesEstudiantes`: Histórico de matrícula y estado académico.
- `MovimientosCajaBancos`: Registro de ingresos y egresos contables.

---

## C. MATRIZ DE COBERTURA FUNCIONAL

| ID | Herramienta / Requisito | Estado | Evidencia Concreta | Deficiencia Encontrada | Dependencias |
|---|---|---|---|---|---|
| **INT-01** | Panel general de inteligencia | Funcional | `renderUniversalConfigurableChart` en `js/ui-common.js` | Tablero dinámico por rol con conmutación visual/tabular. | Chart.js / Canvas |
| **INT-02** | Evolución histórica de matrícula | Parcial | `getInstitutionalReportCatalog` en `user-service` | Muestra matrícula del año activo; falta serie de tiempo de los últimos 5 años. | Matriculas |
| **INT-03** | Deserción, retención y promoción | Ausente | No se encontraron fórmulas de cálculo | No calcula % de retención ni distingue retiros de traslados justificados. | Expedientes |
| **INT-04** | Rendimiento por cohortes | Ausente | No hay seguimiento longitudinal | No permite agrupar alumnos por cohorte de ingreso (ej. Generación 2020). | Calificaciones |
| **INT-05** | Comparación entre períodos | Parcial | `getStudentAcademicReport` en `exam-service` | Compara parciales del mismo año; no compara Parcial 1 Año N vs Parcial 1 Año N-1. | Calificaciones |
| **INT-06** | Indicadores financieros | Funcional | `getHRDashboardAnalytics` en `accounting-service` L3910 | Balance Neto (Ingresos - Egresos), cuentas por cobrar y caja acumulada. | MovimientosCaja |
| **INT-07** | Proyección de matrícula/cupos | Ausente | No se encontraron algoritmos predictivos | Sin estimación de cupos requeridos para el siguiente año escolar. | Oferta Académica |
| **INT-08** | Proyección de ingresos | Ausente | Sin modelo financiero predictivo | No proyecta flujo de caja futuro basado en proyección de matrícula y cobranza. | Tarjetas Cobro |
| **INT-09** | Proyección de personal | Ausente | Sin simulador de carga docente | No calcula número de profesores requeridos según incremento de secciones. | Horarios |
| **INT-10** | Detección de atípicos e inconsistencias | Ausente | Sin rutinas de auditoría de datos | No alerta sobre notas > 100, pagos negativos ni duplicidades de DNI. | Data Quality |
| **INT-11** | Trazabilidad a datos de origen | Funcional | `generateInstitutionalReport` en `user-service` | Cada cifra reportada permite navegar hasta las filas/registros de origen. | Report Catalog |
| **INT-12** | Calidad y actualización de datos | Funcional | Timestamp ISO en cada respuesta API | Informa la fecha y hora exacta del último procesamiento satisfactorio. | API Standard |
| **INT-13** | Modelos predictivos | Ausente | Sin modelos estadísticos | No hay modelos de regresión o aprendizaje para predecir riesgo de deserción. | Statistics |
| **INT-14** | Filtros y segmentación | Funcional | `window.openAnalyticsChartModal` en `ui-common.js` | Filtros por categoría, período, nivel educativo y tipo de gráfico. | Chart Modal |
| **INT-15** | Exportación de informes | Funcional | `window.exportReportToExcelCSV` en `js/ui-common.js` | Exportación limpia a CSV/Excel respetando filtros y permisos del usuario. | Export UI |
| **INT-16** | Permisos RBAC | Funcional | `checkAuthorization_` en backend | La información financiera agregada está restringida a `Administrador` y `Director`. | RBAC |
| **INT-17** | Usabilidad para toma de decisiones | Funcional | Diseño adaptable responsive y WCAG AA | Tablas de datos alternativas para usuarios de lectores de pantalla. | WCAG Tokens |
| **INT-18** | Capacidades adicionales | Funcional | `getStructuredLogs` en `user-service` | Registro auditable de qué directivo generó o exportó cada reporte. | Audit Logs |

---

## D. RESULTADOS DE LAS PRUEBAS FUNCIONALES DE AUDITORÍA

| ID Prueba | Objetivo | Precondiciones y Datos | Pasos Ejecutados | Resultado Esperado | Resultado Observado | Estado | Evidencia Concreta |
|---|---|---|---|---|---|---|---|
| **INT-AC-01** | Consistencia de cálculos financieros | Movimientos contables en Sheets | Ejecutar `getHRDashboardAnalytics` y sumar filas | Coincidencia exacta entre balance neto y suma de movimientos | Cifras conciliables al 100% | **Aprobado** | `Accounting` L3910 |
| **INT-AC-02** | Consistencia visual vs tabular | Gráfico de rendimiento cargado | Alternar botón "Vista Tabular Texto" en `openAnalyticsChartModal` | Mismos valores numéricos presentados en formato tabla | Coincidencia de valores y accesibilidad | **Aprobado** | `ui-common.js` L1450 |
| **INT-AC-03** | Tratamiento de datos faltantes | Sin registros de biblioteca | Consultar `librosBibliotecaCount` | Mostrar `0` sin arrojar error `NaN` o `null` | Muestra `0` correctamente | **Aprobado** | `Accounting` L3935 |
| **INT-AC-04** | Cambios retroactivos en reporte | Modificar pago confirmado ficticio | Generar `generateInstitutionalReport` | Cifra actualizada reflejando la modificación | Reporte actualizado con el nuevo valor | **Aprobado** | `User Code.gs` L2100 |
| **INT-AC-05** | Períodos incompatibles | Comparar parcial de 2 meses vs año | Evaluar si alerta sobre incompatibilidad de rango | Advertencia de diferente duración | Compara sin advertencia explícita | **Parcial** | Falta aviso de escala |
| **INT-AC-06** | Prueba de permisos de exportación | Usuario rol `Estudiante` | Intentar ejecutar `generateInstitutionalReport` (Reporte Financiero) | Excepción `FORBIDDEN` en backend | Bloqueado correctamente por RBAC | **Aprobado** | `User Code.gs` L680 |
| **INT-AC-07** | Proyección de cupos sin datos suficientes | Año lectivo sin histórico previo | Intentar calcular proyección de matrícula | Notificar insuficiencia de datos | No existe función de proyección | **Fallido (Ausente)** | No existe en codebase |
| **INT-AC-08** | Detección de notas atípicas | Ingresar nota `150/100` | Consultar si dispara alerta de inconsistencia | Generar alerta de dato atípico | Permite la nota sin alerta automática | **Fallido (Ausente)** | Sin Data Quality Check |

---

## E. DEFINICIONES DE FÓRMULAS E INDICADORES CLAVE

Para garantizar la rigurosidad científica de la Inteligencia Institucional, se formalizan los cálculos de las futuras tareas de implementación:

1. **Tasa de Retención Estudiantil ($TR$):**
   $$TR = \left( \frac{E_{activos\_año\_N} - E_{nuevos\_año\_N}}{E_{totales\_año\_N-1}} \right) \times 100$$
2. **Tasa de Deserción Escolar ($TD$):**
   $$TD = \left( \frac{E_{retirados\_injustificados\_año\_N}}{E_{totales\_año\_N}} \right) \times 100$$
3. **Porcentaje de Cobertura Curricular ($PCC$):**
   $$PCC = \left( \frac{\text{Temas Impartidos Confirmados}}{\text{Temas Planificados en Malla Curricular}} \right) \times 100$$

---

## F. HALLAZGOS Y RIESGOS

### 1. Riesgo Crítico
- **Inexistencia de Auditoría de Calidad y Detección de Inconsistencias (INT-10):** No existen filtros automatizados que detecten errores humanos de digitación (ej. calificaciones > 100, pagos con montos negativos o identidades duplicadas), lo que puede distorsionar las métricas directivas.

### 2. Riesgo Alto
- **Ausencia de Indicadores de Retención y Deserción Escolar (INT-03):** La Dirección no cuenta con métricas oficiales de desincorporación de alumnos para diseñar planes de retención antes del inicio del siguiente año lectivo.

### 3. Riesgo Medio
- **Falta de Simuladores de Capacidad y Proyección de Ingresos (INT-07, INT-08):** La planificación de la oferta académica se realiza de forma manual sin un simulador que proyecte escenarios de ingresos futuros e incremento de costos de personal.

---

## G. PLAN DE MEJORA Y CONCLUSIÓN DE PREPARACIÓN

### Estado de Preparación
El módulo de Inteligencia Institucional está **apto para pasar a la fase de implementación de mejoras**. Su motor gráfico universal y el catálogo de reportes consolidados ofrecen la infraestructura ideal para añadir los módulos predictivos y de calidad de datos.

### Acciones Prioritarias de Implementación
1. **Desarrollar el Motor de Cálculo de Retención, Deserción y Promoción (INT-03):** Implementación de fórmulas oficiales y tablero de continuidad académica.
2. **Crear la Rutina de Auditoría de Calidad de Datos e Inconsistencias (INT-10):** Detección automática de anomalías en notas, matrículas y registros financieros.
3. **Módulo de Proyección de Matrícula, Cupos e Ingresos Futuros (INT-07, INT-08):** Simulador de escenarios de demanda y proyección de flujo de caja para la junta directiva.
4. **Seguimiento de Rendimiento por Cohortes Generacionales (INT-04):** Tablero longitudinal para evaluar el desempeño de promociones a lo largo del tiempo.
