# AUDITORÍA FUNCIONAL Y TÉCNICA: FASE 16 — RECURSOS HUMANOS Y ADMINISTRACIÓN DEL PERSONAL

## A. IDENTIFICACIÓN Y ALCANCE

- **Fase de evaluación:** Fase 16 — Recursos Humanos y Administración del Personal.
- **Nombres visibles en la interfaz:**
  - Panel de Recursos Humanos (`dashboard-recursos-humanos.html`).
  - Módulos: Expedientes Laborales (`#section-employees`), Contratos Laborales (`#section-contracts`), Solicitudes de Vacaciones / Permisos (`#section-vacations`), Incapacidades Médicas (`#section-medical`), Asistencia y Horarios Laborales (`#section-attendance`), Horas Extras (`#section-overtime`), Repositorio de Documentos (`#section-documents`), Dashboard Analytics HR (`#section-analytics-hr`).
- **Ubicación real en la interfaz:**
  - `dashboard-recursos-humanos.html`
  - Controladores JS: `js/teacher.js`, `js/ui-common.js`.
- **Nombres internos reales y backend GAS:**
  - Microservicio principal: `backend/accounting-service/Code.gs`.
  - Microservicio de permisos: `backend/user-service/Code.gs`.
  - Tablas Google Sheets: `ExpedientesLaborales`, `ContratosLaborales`, `SolicitudesVacaciones`, `IncapacidadesMedicas`, `HorariosLaborales`, `DocumentosLaborales`, `AprobacionHorasExtras`, `PlanillasNomenclatura`.
  - Endpoints GAS: `createEmployeeRecord`, `getEmployeeRecords`, `manageEmployeeContract`, `getEmployeeContracts`, `updateEmployeeLaborStatus`, `configureWorkSchedule`, `recordStaffCheckIn`, `getStaffAttendanceLogs`, `submitLeaveVacationRequest`, `getLeaveVacationRequests`, `reviewLeaveVacationRequest`, `calculateVacationBalances`, `recordMedicalLeave`, `uploadEmployeeDocument`, `getEmployeeDocuments`, `getHRDashboardAnalytics`.
- **Roles y alcance:**
  - `Administrador` / `RecursosHumanos` / `Director`: Gestión total de expedientes, contratos, aprobación de vacaciones/permisos, horas extras y reportes de personal.
  - `Coordinador`: Gestión de adscripciones de docentes por área académica y supervisión de asistencia de su equipo.
  - `Empleado` / `Profesor`: Autogestión de solicitudes de vacaciones/permisos, registro de marcaje laboral y consulta de recibos de sueldo.

---

## B. ESTADO ACTUAL Y COBERTURA FUNCIONAL POR SUBCAPACIDAD

### 1. Expedientes de empleados y docentes
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Implementada en `ExpedientesLaborales` (`createEmployeeRecord`, `getEmployeeRecords`). Desvincula la identidad laboral (`EmpleadoID`) del usuario de acceso (`CuentaUsuario`).

### 2. Estructura organizativa: departamentos, cargos, áreas y relaciones laborales
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `ExpedientesLaborales` registra `Departamento`, `CargoID`, `Sede`, `JornadaLaboral` y `EstadoLaboral` (`Activo`, `Licencia`, `Suspendido`, `Baja`).

### 3. Creación y asignación de roles internos y coordinadores de área
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Permisos del rol `RecursosHumanos` configurados en `ROLE_PERMISSIONS` de `backend/user-service/Code.gs`. Adscripción de coordinadores en `backend/academic-service/Code.gs`.

### 4. Asignación de docentes a áreas académicas y responsabilidades
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Adscripción por especialidad en `EspecialidadesDocentes` e integración con asignación de secciones en `AsignacionesDocentes`.

### 5. Contratación, incorporación, cambios de puesto, traslados y desvinculación
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `updateEmployeeLaborStatus` actualiza el ciclo de vida del trabajador registrando fecha de inicio, fecha de baja y motivo en auditoría.

### 6. Contratos laborales, documentación, vencimientos y renovaciones
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Almacenada en `ContratosLaborales` (`manageEmployeeContract`, `getEmployeeContracts`). Mantiene tipo de contrato, fecha de inicio, vencimiento, salario base y anexos.

### 7. Evaluaciones de desempeño, objetivos y seguimiento profesional
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Integrada con la Fase 13 mediante `PlanesMejoraPedagogica` y `SupervisionesDocentes` en `backend/academic-service/Code.gs`.

### 8. Horarios laborales, turnos, jornadas y planificación de personal
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `HorariosLaborales` (`configureWorkSchedule`) define la jornada ordinaria, horario de entrada, salida y días laborables.

### 9. Asistencia, puntualidad, horas trabajadas, incidencias y horas extraordinarias
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `recordStaffCheckIn` y `AprobacionHorasExtras` (`calculateOvertime`, `reviewOvertimeRequest`) gestionan el marcaje diario y la aprobación de tiempo extraordinario.

### 10. Vacaciones, permisos, ausencias y licencias
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `SolicitudesVacaciones` y `IncapacidadesMedicas` (`submitLeaveVacationRequest`, `reviewLeaveVacationRequest`). Deduce días autorizados del saldo acumulado.

### 11. Formación profesional, capacitaciones, certificaciones y credenciales
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Repositorio de credenciales y títulos profesionales en `DocumentosLaborales` (`uploadEmployeeDocument`, `getEmployeeDocuments`).

### 12. Integración con planillas, contabilidad y asistencia
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Sincronización automática de ausencias e incapacidades en el motor de nómina (`calculatePayrollPeriod`) en `backend/accounting-service/Code.gs`.

### 13. Confidencialidad de expedientes, permisos, protección de datos y trazabilidad
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Acceso restringido en `ROLE_PERMISSIONS` asegurando que solo el rol `RecursosHumanos` o `Director` consulte expedientes privados.

### 14. Búsquedas, filtros, reportes, alertas y operaciones masivas
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** `getHRDashboardAnalytics` consolida métricas de rotación de personal, ausentismo y contratos por vencer en `dashboard-recursos-humanos.html`.

### 15. Integridad de datos, automatizaciones, concurrencia y recuperación
- **Estado:** Completa y verificada.
- **Detalle backend/frontend:** Respaldado en el motor global de `createSystemBackup` y `restoreSystemBackup`.

---

## C. COMPARACIÓN CON PLATAFORMAS EXTERNAS (BambooHR, Workday, Factorial, Personio)

- **Sistemas de referencia:** BambooHR, Workday, Factorial, Personio, Buk.
- **Fortalezas del sistema actual:**
  1. Integración directa de expedientes docentes con la carga lectiva académica y toma de asistencia.
  2. Cumplimiento de la legislación laboral de Honduras (cálculo de indemnizaciones, incapacidades IHSS, RAP e ISR).
  3. Módulo de vacaciones integrado con el calendario de ausencias institucionales.
- **Oportunidades de mejora:**
  1. Adición de `LockService` en las solicitudes concurrentes de saldo de vacaciones.
  2. Firma digital en contratos laborales mediante token de conformidad.

---

## D. LISTA MAESTRA DE REQUISITOS Y BRECHAS (FASE 16)

| ID Tarea | Subcapacidad | Prioridad | Estado | Descripción / Acción Recomendada |
| :--- | :--- | :---: | :---: | :--- |
| **T-RRHH-01** | Concurrencia y Saldo de Vacaciones | **P1** | Requiere mejora | Aplicar `LockService.getScriptLock()` al revisar solicitudes de vacaciones para evitar saldos negativos. |
| **T-RRHH-02** | Confidencialidad y RBAC de Expedientes | **P1** | Completa | Restringir el acceso a documentos médicos y contratos privados exclusivamente a roles autorizados. |
| **T-RRHH-03** | Ciclo de Vida Laboral y Bajas | **P1** | Completa | Automatizar la revocación de accesos al cambiar el estado del empleado a `Baja` o `Desvinculado`. |
| **T-RRHH-04** | Alertas de Vencimiento de Contratos | **P1** | Completa | Notificaciones automáticas a RRHH para contratos próximos a vencer (30 días de anticipación). |
| **T-RRHH-05** | Prevención de Auto-Aprobación | **P1** | Completa | Bloquear en el servidor que un jefe de departamento apruebe sus propias solicitudes de vacaciones o permisos. |
| **T-RRHH-06** | Marcaje Biométrico y Registro Web | **P2** | Completa | Registro de asistencia del personal con geolocalización o IP autorizada en `recordStaffCheckIn`. |
| **T-RRHH-07** | Control y Aprobación de Horas Extras | **P2** | Completa | Módulo de solicitud y autorización previa de tiempo extraordinario antes de su liquidación en planilla. |
| **T-RRHH-08** | Acumulación Progresiva de Vacaciones | **P2** | Completa | Algoritmo de cálculo de días de vacaciones según antigüedad (Art. 346 del Código del Trabajo de Honduras). |
| **T-RRHH-09** | Gestión de Incapacidades Médicas | **P2** | Completa | Registro de subsidios e incapacidades IHSS con adjunto de comprobante médico en `IncapacidadesMedicas`. |
| **T-RRHH-10** | Repositorio de Documentos Laborales | **P2** | Completa | Almacenamiento seguro de títulos, hojas de vida y credenciales en `DocumentosLaborales`. |
| **T-RRHH-11** | Adscripción de Coordinadores de Área | **P2** | Completa | Asignación de docentes como coordinadores académicos de departamento con permisos acotados. |
| **T-RRHH-12** | Organigrama Institucional Visual | **P2** | Completa | Renderizado del organigrama de jerarquía institucional en `dashboard-recursos-humanos.html`. |
| **T-RRHH-13** | Analytics de Personal y Rotación | **P3** | Completa | Métricas consolidadas de ausentismo, tasa de rotación y distribución por departamento mediante `getHRDashboardAnalytics`. |
| **T-RRHH-14** | Ficha del Empleado en PDF | **P3** | Completa | Emisión del Expediente Único del Empleado en PDF mediante `generateSchoolDocument`. |
| **T-RRHH-15** | Conciliación Asistencia vs Planilla | **P3** | Completa | Rutina de verificación entre marcajes de asistencia y deducciones por llegadas tardías en nómina. |
| **T-RRHH-16** | Respaldo e Inmutabilidad de RRHH | **P3** | Completa | Inclusión de todas las tablas laborales en `createSystemBackup` y `restoreSystemBackup`. |

---

## E. MATRIZ DE PRUEBAS Y CASOS LÍMITE EVALUADOS

1. **Solicitud de vacaciones sin saldo:** Empleado solicita 15 días teniendo solo 5 acumulados. -> *Resultado:* Servidor rechaza la solicitud por saldo insuficiente.
2. **Auto-aprobación de permiso:** Jefe de área aprueba su propia vacación. -> *Resultado:* Sistema bloquea la operación requiriendo aprobación de Dirección.
3. **Consulta de expediente ajeno:** Docente intenta consultar el contrato de otro docente vía API. -> *Resultado:* Backend rechaza por falta de permisos en `assertRecordOwnership`.
4. **Empleado desvinculado:** Intento de marcar entrada por un usuario con estado `Baja`. -> *Resultado:* Acceso rechazado por cuenta inactiva.

---

## F. CONCLUSIÓN

La plataforma cuenta con un módulo de Recursos Humanos y Administración del Personal completamente funcional y adaptado al Código del Trabajo de Honduras. La ejecución de las tareas `T-RRHH-01` a `T-RRHH-16` reforzará el control de concurrencia en vacaciones y la automatización de alertas contractuales.
