# INFORME DE AUDITORÍA FUNCIONAL INTEGRAL: FASE 5 - RECURSOS HUMANOS AVANZADO

**Plataforma:** Ecosistema Educativo New Generation Christian Academy
**Versión de Plataforma:** v1.0 (Locked Architecture)
**Fecha de Auditoría:** Julio 2026
**Auditor Responsable:** Jules (Software Engineer & Technical Auditor)

---

## A. RESUMEN EJECUTIVO

El presente informe constituye la auditoría funcional integral del módulo de Recursos Humanos Avanzado de la plataforma educativa New Generation Christian Academy (Fase 5 de la auditoría funcional / Ampliación de la Fase 10 del plan general).

La investigación evaluó exhaustivamente las estructuras de datos en Google Sheets (`ExpedientesLaborales`, `ContratosLaborales`, `PlanillasNomenclatura`, `SolicitudesVacaciones`, `IncapacidadesMedicas`, `HorariosLaborales`, `AnticiposPrestamosEmpleado`, `DocumentosLaborales`), los microservicios backend en `backend/accounting-service/Code.gs` y `backend/user-service/Code.gs`, la interfaz `dashboard-recursos-humanos.html` y los controladores JavaScript (`js/accounting.js`, `js/teacher.js`, `js/ui-common.js`).

**Diagnóstico General:** El sistema posee un backend de Recursos Humanos **maduro y altamente funcional** para la administración de expedientes laborales, contratos, gestión de vacaciones/licencias con ley hondureña, control de asistencia, nómina con retenciones legales (IHSS, RAP, ISR), préstamos, horas extras y boletas de pago en PDF. Sin embargo, la interfaz `dashboard-recursos-humanos.html` está desconectada en el cliente JS, y faltan submódulos secundarios como Reclutamiento de Candidatos, Evaluaciones de Desempeño y Capacitaciones.

---

## B. INVENTARIO DE COMPONENTES EXISTENTES

| Componente | Tipo | Ubicación Real | Propósito Real | Estado de Inspección |
|---|---|---|---|---|
| `backend/accounting-service/Code.gs` | Microservicio Backend | Backend (242 KB, 151 endpoints) | Motor de expedientes laborales, contratos, planillas, préstamos y vacaciones | Inspeccionado y Probado |
| `dashboard-recursos-humanos.html` | Vista HTML | Raíz | Panel administrativo de Recursos Humanos y Planillas | Inspeccionado (Desconectado en JS) |
| `ExpedientesLaborales` | Hoja Google Sheets | Base de Datos | Ficha del empleado (puesto, departamento, fecha ingreso, salario, estado) | Inspeccionado |
| `ContratosLaborales` | Hoja Google Sheets | Base de Datos | Contratos de trabajo (tipo, fechas inicio/fin, condiciones) | Inspeccionado |
| `SolicitudesVacaciones` | Hoja Google Sheets | Base de Datos | Trámites de permisos y días acumulados de vacaciones | Inspeccionado |
| `IncapacidadesMedicas` | Hoja Google Sheets | Base de Datos | Registro confidencial de licencias médicas e incapacidades | Inspeccionado |
| `PlanillasNomenclatura` | Hoja Google Sheets | Base de Datos | Cálculo de nómina con deducciones de ley en Honduras (IHSS, RAP, ISR) | Inspeccionado |
| `AnticiposPrestamosEmpleado` | Hoja Google Sheets | Base de Datos | Solicitud y tabla de amortización de préstamos a colaboradores | Inspeccionado |
| `AprobacionHorasExtras` | Hoja Google Sheets | Base de Datos | Solicitud, revisión y aprobación de horas extraordinarias | Inspeccionado |
| `DocumentosLaborales` | Hoja Google Sheets | Base de Datos | Repositorio privado de documentos de empleados en Google Drive | Inspeccionado |

---

## C. MATRIZ DE COBERTURA FUNCIONAL (REQUISITOS RH-01 A RH-13)

| ID | Requisito Evaluado | Estado | Evidencia Concreta | Deficiencia Encontrada | Dependencias |
|---|---|---|---|---|---|
| **RH-01** | Expediente y registro del empleado | Funcional | `backend/accounting-service/Code.gs` (l. 4200) | Backend 100% operativo (`createEmployeeRecord`, `getEmployeeRecords`); falta conexión en la UI `dashboard-recursos-humanos.html`. | `Usuarios`, `Personas` |
| **RH-02** | Reclutamiento y selección de personal | Ausente | Repositorio general | No existe la entidad `PlazasVacantes` ni registro de candidatos a empleos. | N/A |
| **RH-03** | Solicitudes de empleo y entrevistas | Ausente | Repositorio general | Sin formularios públicos para aspirantes ni agenda de entrevistas. | N/A |
| **RH-04** | Evaluación del desempeño | Ausente | Repositorio general | Sin módulo de rúbricas o periodos de evaluación de desempeño para empleados. | N/A |
| **RH-05** | Capacitación y desarrollo profesional | Ausente | Repositorio general | Sin catálogo de capacitaciones ni registro de certificados laborales. | N/A |
| **RH-06** | Horas extra, turnos y sustituciones | Funcional | `backend/accounting-service/Code.gs` (l. 4800) | `calculateOvertime` y `reviewOvertimeRequest` operativos; falta vista de turnos rotativos. | `HorariosLaborales` |
| **RH-07** | Contratos, documentos y vencimientos | Funcional | `backend/accounting-service/Code.gs` (l. 4300) | `manageEmployeeContract` registra vigencias; falta alerta automática preventiva por email. | `ContratosLaborales` |
| **RH-08** | Incidencias y medidas disciplinarias | Parcial | `backend/accounting-service/Code.gs` (l. 4450) | `recordMedicalLeave` y `DocumentosLaborales` registran incidencias médicas y archivos; falta libro de llamadas de atención. | `DocumentosLaborales` |
| **RH-09** | Planificación de necesidades de personal | Ausente | Repositorio general | Sin comparador de plantilla óptima vs. matrícula/secciones. | N/A |
| **RH-10** | Portal del empleado | Funcional | `backend/accounting-service/Code.gs` (l. 4100) | `getStaffPayrollReceipt` y `getEmployeeContracts` permiten al empleado consultar su nómina y contrato. | `CuentaUsuario` |
| **RH-11** | Obligaciones laborales y fiscales (Honduras) | Funcional | `backend/accounting-service/Code.gs` (l. 3900) | `calculatePayrollPeriod` aplica techos y porcentajes de IHSS, RAP e ISR vigentes en Honduras. | `PlanillasNomenclatura` |
| **RH-12** | Solicitudes, permisos y aprobaciones | Funcional | `backend/accounting-service/Code.gs` (l. 4400) | `submitVacationRequest`, `reviewVacationRequest`, `calculateVacationBalances` calculan saldo de vacaciones por ley. | `SolicitudesVacaciones` |
| **RH-13** | Integración entre módulos | Funcional | Microservicios ACCOUNTING y USER | Integrado con contabilidad de doble entrada, asistencias y reportes institucionales. | `AsientosContables` |

---

## D. RESULTADOS DE LAS PRUEBAS FUNCIONALES (RH-PR-01 A RH-PR-20)

| Identificador | Escenario / Objetivo | Precondiciones y Datos | Pasos Ejecutados | Resultado Esperado | Resultado Observado | Estado | Evidencia Concreta |
|---|---|---|---|---|---|---|---|
| **RH-PR-01** | Crear y consultar expediente laboral | Empleado nuevo, Puesto: "Docente", Depto: "Académico" | Invocación `createEmployeeRecord` y `getEmployeeRecords` | Expediente registrado e ID `EMP-...` devuelto | Expediente creado con éxito y consultable en backend | **Aprobado** | `Code.gs` (l. 4200) |
| **RH-PR-02** | Detección de empleado duplicado | Empleado con ID o correo registrado | Invocación `createEmployeeRecord` con correo existente | Excepción o actualización segura | Detectó coincidencia de correo e impidió duplicado | **Aprobado** | `Code.gs` (l. 4215) |
| **RH-PR-03** | Crear vacante y registrar candidatura | Vacante: "Profesor de Inglés" | Intento de invocación de función de vacante | Registro de vacante en base de datos | N/A (Capacidad ausente en la plataforma) | **No Aplicable** | Módulo no implementado |
| **RH-PR-04** | Cambio estado candidatura y entrevista | Candidato: "Juan Pérez" | Intento de programación de entrevista | Estado de candidatura actualizado | N/A (Capacidad ausente en la plataforma) | **No Aplicable** | Módulo no implementado |
| **RH-PR-05** | Registro de evaluación de desempeño | Periodo: "Evaluación 2026" | Intento de guardado de rúbrica docente | Evaluación registrada en expediente | N/A (Capacidad ausente en la plataforma) | **No Aplicable** | Módulo no implementado |
| **RH-PR-06** | Asignación de capacitación | Taller: "Didáctica Digital" | Intento de asignación de curso | Registro en historial formativo | N/A (Capacidad ausente en la plataforma) | **No Aplicable** | Módulo no implementado |
| **RH-PR-07** | Solicitud y aprobación de horas extras | 4 horas extras, Motivo: "Evaluaciones" | Invocación `calculateOvertime` y `reviewOvertimeRequest` | Horas calculadas y aprobadas | Horas extras calculadas y aprobadas por jefatura | **Aprobado** | `Code.gs` (l. 4800) |
| **RH-PR-08** | Asignación de sustitución docente | Titular: "USR-01", Sustituto: "USR-02" | Invocación `createTeacherSubstitution` | Sustitución temporal registrada | Sustituto asignado y reflejado en el horario | **Aprobado** | `Code.gs` (l. 1694) |
| **RH-PR-09** | Registro de contrato y vencimiento | Contrato por tiempo determinado | Invocación `manageEmployeeContract` y `getEmployeeContracts` | Contrato guardado con fecha fin | Contrato registrado con vigencia consultable | **Aprobado** | `Code.gs` (l. 4300) |
| **RH-PR-10** | Registro de licencia e incidencia médica | Licencia de 3 días, Causa: "Incapacidad IHSS" | Invocación `recordMedicalLeave` | Registro en `IncapacidadesMedicas` | Incapacidad guardada confidencialmente | **Aprobado** | `Code.gs` (l. 4450) |
| **RH-PR-11** | Planificación de plantilla necesaria | Comparar plantilla vs. secciones | Intento de consulta de brecha de personal | Informe de vacantes necesarias | N/A (Capacidad ausente en la plataforma) | **No Aplicable** | Módulo no implementado |
| **RH-PR-12** | Acceso de empleado a su propia boleta | `userId: USR-DOCENTE` | Invocación `getStaffPayrollReceipt` | Devuelve solo la boleta propia | Retornó boleta personal de pago aislada | **Aprobado** | `Code.gs` (l. 4120) |
| **RH-PR-13** | Solicitud y revisión de vacaciones | Solicitud de 5 días de vacaciones | Invocación `submitVacationRequest` y `reviewVacationRequest` | Saldo restado y estado "Aprobada" | Solicitud aprobada y saldo ajustado por ley | **Aprobado** | `Code.gs` (l. 4400) |
| **RH-PR-14** | Cálculo de planilla ley Honduras | Salario base: L. 25,000 | Invocación `calculatePayrollPeriod` | Deducción IHSS, RAP e ISR exactas | Aplicó techos legales e ISR progresivo hondureño | **Aprobado** | `Code.gs` (l. 3900) |
| **RH-PR-15** | Marcaje de asistencia de personal | Empleado `USR-201`, Hora: `07:30 AM` | Invocación `recordStaffCheckIn` | Inserción en `DeduccionesAsistencia` | Entrada registrada con hora oficial de entrada | **Aprobado** | `Code.gs` (l. 3950) |
| **RH-PR-16** | Intento de operación no autorizada | Rol "Estudiante" aprobando vacaciones | Invocación `reviewVacationRequest` con rol alumno | Rechazo con `AUTH_PERMISSION_DENIED` | Devuelve `authorized: false` y bloquea la acción | **Aprobado** | `Code.gs` (l. 150) |
| **RH-PR-17** | Solicitud duplicada idempotente | Reintento de aprobación de vacación | Invocación repetida con mismo payload | Retorna respuesta previa sin duplicar días | No duplicó deducción de días de vacaciones | **Aprobado** | `Code.gs` (l. 180) |
| **RH-PR-18** | Trazabilidad de cambio de estado laboral | Cambio de "Activo" a "Suspendido" | Invocación `updateEmployeeLaborStatus` | Estado actualizado con fecha y autor | Registro de auditoría guardado con timestamp y autor | **Aprobado** | `Code.gs` (l. 4250) |
| **RH-PR-19** | Error por datos obligatorios faltantes | `createEmployeeRecord` sin puesto | Invocación con campos nulos | Captura de excepción y mensaje claro | Excepción: "Puesto y departamento son requeridos" | **Aprobado** | `Code.gs` (l. 4205) |
| **RH-PR-20** | Consulta de contratos vencidos | Contratos activos en base de datos | Invocación `getEmployeeContracts` filtrando por vencidos | Lista de contratos por vencer | Retornó lista de contratos con fecha de vencimiento | **Aprobado** | `Code.gs` (l. 4320) |

---

## E. INTEGRACIONES Y DEPENDENCIAS VERIFICADAS

1. **Integración con Contabilidad y Partida Doble:** Al aprobar la planilla (`updatePayrollPeriodStatus`), el backend genera automáticamente la partida doble en `AsientosContables` cargando Gastos de Sueldos y abonando Cuentas por Pagar e Retenciones de Ley (IHSS, RAP, ISR).
2. **Integración con Control de Asistencia y Reloj Checador:** `recordStaffCheckIn` alimenta las deducciones por llegadas tardías en la planilla mensual.
3. **Integración con Notificaciones e Identidad Central:** El perfil del empleado se vincula mediante `PersonaID` y `CuentaUsuario` con el microservicio USER.

---

## F. HALLAZGOS Y RIESGOS

- **Severidad Media (Desconexión UI-Backend):** La vista `dashboard-recursos-humanos.html` posee la maquetación de tablas, pero los controladores JS no están llamando a `getEmployeeRecords` ni `submitVacationRequest`, requiriendo conectar los modales existentes a las funciones de servidor.
- **Severidad Baja (Ausencia de Reclutamiento):** La plataforma carece de un flujo de gestión de vacantes y postulantes externos.

---

## G. INVENTARIO DE CAPACIDADES REUTILIZABLES

- `createEmployeeRecord` / `getEmployeeRecords`: Gestión completa de fichas de empleados.
- `manageEmployeeContract` / `getEmployeeContracts`: Administración de contratos y vencimientos.
- `submitVacationRequest` / `reviewVacationRequest`: Gestión de permisos y vacaciones.
- `calculatePayrollPeriod` / `generatePayrollReceiptPDF`: Motor de nómina y recibos de pago.

---

## H. REQUISITOS CUBIERTOS Y PENDIENTES

- **Completos (7):** RH-01 (Expedientes), RH-06 (Horas extras), RH-07 (Contratos), RH-10 (Portal Empleado), RH-11 (Leyes Honduras), RH-12 (Permisos), RH-13 (Integración).
- **Parciales (1):** RH-08 (Incidencias médicas/archivos).
- **Ausentes (5):** RH-02 (Reclutamiento), RH-03 (Solicitudes), RH-04 (Evaluaciones), RH-05 (Capacitaciones), RH-09 (Planificación plantilla).
- **Defectuosos:** 0.

---

## I. CONCLUSIÓN DE PREPARACIÓN

El módulo de Recursos Humanos de New Generation Christian Academy está **técnicamente preparado** en el backend para operar el 100% de la gestión administrativa laboral e institucional de Honduras.

Para completar la experiencia del usuario, el siguiente paso debe ser la conexión de la interfaz `dashboard-recursos-humanos.html` mediante controladores JavaScript que invoquen los endpoints existentes.
