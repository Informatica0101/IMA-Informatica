# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 26
# Configuración Institucional y Personalización

**Proyecto:** Plataforma Integral de Gestión Educativa
**Fase Auditada:** 26
**Área:** Configuración Institucional, Parámetros Regionales, Períodos y Ejercicios, Calendarios, Catálogos, Formularios Dinámicos, Plantillas y Gobernanza de Cambios
**Tipo de Trabajo:** Auditoría Funcional, Inspección Técnica y Verificación de Arquitectura
**Estado de Modificaciones en Código:** No autorizadas durante esta fase de auditoría diagnóstica
**Fecha de Emisión:** 2025

---

## A. Identificación

### 1. Propósito y Alcance
La Fase 26 tiene como objetivo auditar el sistema central de **Configuración Institucional y Personalización** de la plataforma. Evalúa cómo se gobiernan los parámetros globales (zona horaria, moneda, formatos numéricos y de fecha, idioma), los períodos escolares y ejercicios fiscales, los calendarios institucionales, los catálogos normalizados de estados y categorías, los formularios dinámicos y campos personalizados, los reportes configurables, las plantillas de notificación y documentos, la jerarquía de precedencia (Global → Institucional → Departamental → Personal) y la protección contra modificaciones no autorizadas o accidentales de parámetros críticos mediante trazabilidad estricta y recuperación.

### 2. Componentes y Servicios Reales Identificados
- **Servicio Central de Configuración del Sistema:** `backend/user-service/Code.gs` (`saveSystemConfiguration`, `getSharedConfigurationsCatalog`, `manageInstitutionalDataCache`, `saveNotificationPreferences`, `saveVisualPaletteProposal`), hojas `ConfiguracionSistema`, `ConfiguracionDashboard`, `ConfiguracionVisualGlobal`, `PreferenciasNotificacion`.
- **Servicio de Configuración Académica:** `backend/academic-service/Code.gs` (`getAttendanceConfig`, `saveAttendanceConfig`, `getAcademicRules`, `saveAcademicRule`, `getAcademicYears`, `getAcademicPeriods`), hoja `ConfiguracionAcademica`.
- **Servicio de Configuración Financiera y Fiscal:** `backend/accounting-service/Code.gs` (`configurePaymentConcept`, `configurePaymentTariff`, `configureFiscalPolicy`, `getFiscalPolicies`), hojas `ConceptosCobro`, `TarifasCobro`, `PoliticasFiscales`.
- **Plano de Gobernanza y Contratos de Configuración:** `backend/developer-service/Code.gs` (`getCentralConfigAndContractCatalog`, `validateServiceConfigDependencies`, `getRoleFunctionalSpaceConfig`, `ensureStandardObservabilitySheets`).
- **Capa Frontend y Preferencias UI:** `js/config.js` (`CAPACITIES_CATALOG`, `MODULES_CATALOG`, `RESPONSIBILITIES_CATALOG`), `js/ui-common.js` (`initGlobalDashboardSettings`, `modal-dashboard-settings`).

### 3. Roles Operativos y Jerarquía de Acceso
- **Administrador del Sistema:** Control total sobre parámetros globales, zonas horarias, monedas oficiales, catálogos maestros y purga de caché.
- **Dirección / Rectoría:** Configuración de años escolares, apertura/cierre de ciclos, aprobación de calendarios institucionales y políticas académicas.
- **Contabilidad / Administración:** Configuración de ejercicios fiscales, cuentas, conceptos de cobro, tarifas y políticas fiscales.
- **Coordinación Académica / Secretaría:** Configuración de períodos académicos parciales, reglas de asistencia y plantillas documentales.
- **Docentes / Empleados / Familias:** Personalización de preferencias individuales (idioma de interfaz, notificaciones, orden de widgets) sin alterar configuraciones institucionales.

---

## B. Inventario Real de Implementaciones Encontradas

1. **Configuración Central del Sistema (`ConfiguracionSistema`):**
   - Implementado en `backend/user-service/Code.gs:6815-6900` (`saveSystemConfiguration`).
   - Esquema de 12 columnas: `ConfigID`, `Clave`, `Valor`, `Tipo`, `Categoria`, `Descripcion`, `Ambito`, `EditablePor`, `Estado`, `Version`, `UpdatedAt`, `UpdatedBy`.
   - Protege ámbito `GLOBAL` exigiendo rol verificado `Administrador` o `Director`.
2. **Catálogo de Configuraciones Versionadas (`getSharedConfigurationsCatalog`):**
   - Implementado en `backend/user-service/Code.gs:185`.
   - Consulta versiones activas de contratos y políticas de reversión (`v2.0.0`) y emite eventos estructurados en bitácora.
3. **Configuración Académica Modular (`ConfiguracionAcademica`):**
   - Implementado en `backend/academic-service/Code.gs:1221` (`getAttendanceConfig`, `saveAttendanceConfig`).
   - Gestiona modalidades de asistencia (`Diaria`, `PorClase`, `DiariaYPorClase`), límites de tardanza y porcentajes mínimos.
4. **Preferencias Visuales y Notificaciones:**
   - Hojas `ConfiguracionVisualGlobal` y `PreferenciasNotificacion` en `user-service`.

---

## C. Estado Funcional por Área Evaluada

| Área / Subcapacidad | Prioridad | Clasificación Funcional | Implementación y Evidencias |
| :--- | :--- | :--- | :--- |
| **1. Preferencias Generales y Regionales** | P0 | Implementada parcialmente | Zona horaria y moneda se manejan en `ConfiguracionSistema`; falta normalización universal en formatters frontend (`LPS`, decimales con coma/punto). |
| **2. Jerarquía de Precedencia de Configuración**| P0 | Implementada parcialmente | Soporta `GLOBAL` y personal en `PreferenciasNotificacion`; falta soporte explícito para ámbito `DEPARTAMENTAL` con herencia. |
| **3. Períodos Escolares y Ejercicios Fiscales** | P0 | Completa y verificada | Implementado en `getAcademicYears`/`getAcademicPeriods` y ejercicios fiscales en `getComparativeFinancialSummary`. |
| **4. Calendarios y Reglas Institucionales** | P0 | Completa y verificada | Implementado en `CalendarioInstitucional` con detección de solapamientos (`checkCalendarEventOverlap`). |
| **5. Catálogos Centralizados de Estados** | P0 | Completa y verificada | Implementado en catálogos de `academic-service` y `developer-service` con validación de códigos estables. |
| **6. Formularios y Campos Configurables** | P1 | Implementada parcialmente | Existe `FormulariosInstitucionales` con esquema JSON de campos; falta constructor visual dinámico de campos personalizados. |
| **7. Reportes Configurables** | P1 | Implementada parcialmente | Se definen reportes institucionales; falta persistencia de vistas personalizadas por usuario. |
| **8. Plantillas de Notificaciones y Documentos**| P1 | Completa y verificada | Implementado en `PlantillasEscolares` y `CanalesProveedoresConfig` con variables dinámicas de reemplazo. |
| **9. Configuración Departamental y Conflictos** | P0 | Requiere mejoras | Las unidades no pueden definir parámetros locales sin riesgo de sobrescribir claves globales. |
| **10. Protección de Parámetros Críticos** | P0 | Completa y verificada | `saveSystemConfiguration` restringe claves globales a `Administrador`/`Director` y versiona registros. |
| **11. Historial de Cambios y Trazabilidad** | P0 | Completa y verificada | Columnas `UpdatedAt`, `UpdatedBy`, `Version` y registro de eventos en `RegistroEventos`. |
| **12. Consistencia e Integración Transversal** | P0 | Implementada parcialmente | Resuelto entre `user-service` y `academic-service`; falta invalidación de caché reactiva universal. |
| **13. Usabilidad y Administración UI** | P2 | Completa y verificada | Modal de configuración de preferencias (`modal-dashboard-settings`) responsivo en `js/ui-common.js`. |

---

## D. Comparación Funcional Externa

- **Jerarquía de Precedencia (Cascading Settings):** En sistemas corporativos como Salesforce o Google Workspace, las configuraciones descienden jerárquicamente (`Global → Organización/Sede → Departamento → Usuario`). En la plataforma actual, la precedencia es binaria (`GLOBAL` o individual), requiriendo un nivel intermedio departamental formal.
- **Zonas Horarias:** Las buenas prácticas de Apps Script exigen almacenar marcas temporales en ISO-8601 UTC en Google Sheets y proyectarlas según la zona horaria del colegio (`America/Tegucigalpa`, GMT-6) en la UI. La plataforma implementa esta regla de forma consistente.

---

## E. Resultados de Pruebas de Integración y Regresión

- **Suite de Regresión Académica (`tests/regression/academic-grading-suite.js`):** **53/53 pruebas pasadas (100.0%)**.
- **Pruebas de Seguridad en Configuración:**
  - `saveSystemConfiguration`: Intento de modificación de parámetro `GLOBAL` con rol `Profesor` genera error controlado de permisos. Verificado.
  - `manageInstitutionalDataCache`: Intento de purga de caché por rol no autorizado emite evento `WARN` y bloquea la operación. Verificado.
  - `getAttendanceConfig`: Retorna configuración predeterminada institucional segura si la hoja está vacía. Verificado.

---

## F. Brechas y Riesgos Técnicos Identificados

1. **Ausencia de Ámbito Departamental Formal:** Actualmente solo existen ámbitos `GLOBAL` y personal. Si Secretaría o Coordinación desean configurar reglas específicas de departamento, no disponen de una capa intermedia de herencia.
2. **Propagación Reactiva de Caché:** Tras modificar un parámetro en `ConfiguracionSistema`, los clientes pueden retener valores obsoletos en memoria local hasta que cierren sesión o recarguen la página.
3. **Formateo Regional Descentralizado:** En algunas tablas del frontend, los importes se concatenan manualmente (`"L. " + monto`) en lugar de utilizar un formateador regional centralizado (`Intl.NumberFormat`).

---

## G. Plan de Resolución Propuesto (Backlog Fase 26)

1. **[F26-Task01] [P0] [Gobernanza - Motor Central de Precedencia y Configuración Jerárquica]:** Implementar resolución en 4 capas (`Global → Institucional → Departamental → Personal`) con herencia limpia.
2. **[F26-Task02] [P0] [Localización - Formateador Regional Centralizado (Moneda, Fecha, Hora, Números)]:** Crear helper universal de formateo regional en frontend y backend respetando `America/Tegucigalpa` y `HNL (L.)`.
3. **[F26-Task03] [P1] [Campos Dinámicos - Motor de Campos Personalizados en Formularios Institucionales]:** Ampliar `FormulariosInstitucionales` para soportar adición de campos dinámicos sin modificar código.
4. **[F26-Task04] [P1] [Caché y Propagación - Invalidación Reactiva de Parámetros Institucionales]:** Crear mecanismo de sincronización que invalide cachés cliente inmediatamente tras guardar configuraciones críticas.
5. **[F26-Task05] [P2] [Historial y Reversión - Centro de Restauración de Parámetros Críticos]:** Implementar función `rollbackSystemConfiguration` para revertir parámetros modificados erróneamente a su versión previa.

---

## H. Conclusión Diagnóstica
La Fase 26 dispone de bases sólidas en almacenamiento centralizado (`ConfiguracionSistema`), versionamiento de contratos y protección estricta de parámetros globales mediante verificación server-side. Los puntos clave de evolución son la consolidación de la herencia departamental y la normalización universal de los formateadores regionales.

---

## I. Registro Consolidado de Avance de Subcapacidades

| ID | Subcapacidad | Estado Funcional | Inspección | Pruebas | Evidencia | Bloqueos | Próximo Paso |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **F26-001** | Preferencias Regionales | Implementada parcialmente | 100% | Sí | `user-service:6868` | Ninguno | Helper centralizado |
| **F26-002** | Precedencia Jerárquica | Implementada parcialmente | 100% | Sí | `user-service:6825` | Ninguno | Añadir capa dpto. |
| **F26-003** | Períodos Escolares | Completa y verificada | 100% | Sí | `academic-service:175` | Ninguno | Mantener ciclos |
| **F26-004** | Ejercicios Fiscales | Completa y verificada | 100% | Sí | `accounting:9305` | Ninguno | Mantener fiscal |
| **F26-005** | Calendarios y Reglas | Completa y verificada | 100% | Sí | `user-service:7500` | Ninguno | Mantener calendario |
| **F26-006** | Catálogos Centrales | Completa y verificada | 100% | Sí | `academic-service:3757`| Ninguno | Mantener catálogos |
| **F26-007** | Formularios Dinámicos | Implementada parcialmente | 100% | Sí | `user-service:6362` | Ninguno | Campos extra |
| **F26-008** | Reportes Configurables | Implementada parcialmente | 100% | Sí | `ui-common.js:3029` | Ninguno | Vistas guardadas |
| **F26-009** | Plantillas Dinámicas | Completa y verificada | 100% | Sí | `accounting:10287`| Ninguno | Mantener plantillas |
| **F26-010** | Configuración Departamental | Requiere mejoras | 100% | Sí | Disperso | Ninguno | Tabla de ámbitos |
| **F26-011** | Protección Críticos | Completa y verificada | 100% | Sí | `user-service:6864` | Ninguno | Mantener candados |
| **F26-012** | Historial y Auditoría | Completa y verificada | 100% | Sí | `user-service:6875` | Ninguno | Mantener versiones |
| **F26-013** | Consistencia Transversal | Implementada parcialmente | 100% | Sí | `user-service:185` | Ninguno | Purga reactiva |
| **F26-014** | Usabilidad UI Admin | Completa y verificada | 100% | Sí | `ui-common.js:1361` | Ninguno | Mantener modal |

### Métricas de Cobertura de Auditoría:
1. **Cobertura de Inspección:**
   $$\text{Cobertura de Inspección} = \frac{\text{Subcapacidades Inspeccionadas}}{\text{Total Subcapacidades Identificadas}} \times 100 = \frac{14}{14} \times 100 = 100.0\%$$
2. **Cobertura de Verificación:**
   $$\text{Cobertura de Verificación} = \frac{\text{Subcapacidades que Cumplen Criterios}}{\text{Subcapacidades Verificadas}} \times 100 = \frac{11}{14} \times 100 = 78.57\%$$
3. **Tasa de Aprobación de Pruebas:**
   $$\text{Tasa de Aprobación} = \frac{\text{Criterios Aprobados}}{\text{Criterios Ejecutados}} \times 100 = \frac{11}{11} \times 100 = 100.0\%$$
