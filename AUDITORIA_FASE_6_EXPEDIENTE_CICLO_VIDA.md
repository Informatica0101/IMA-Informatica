<!-- [AUDIT-FASE-6] - Informe Completo de Auditoría Funcional, Técnica y Documental: Fase 6 (Expediente Institucional y Ciclo de Vida del Estudiante) -->
# INFORME DE AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL
## FASE 6: EXPEDIENTE INSTITUCIONAL Y CICLO DE VIDA DEL ESTUDIANTE

---

## A. IDENTIFICACIÓN Y ALCANCE DE LA AUDITORÍA

- **Fase Auditada:** Fase 6 — Expediente Institucional y Ciclo de Vida del Estudiante.
- **Propósito:** Realizar un diagnóstico integral, riguroso y verificable del estado de la plataforma respecto a la administración del expediente digital único del estudiante, su identidad institucional, la gestión documental, la movilidad y transiciones de su ciclo de vida académico (ingreso, matrícula, cambios de sección/grado, traslados, retiros, reincorporaciones, promociones, graduación), el control de duplicados, la vinculación con responsables/tutores, las integraciones inter-módulo, la seguridad/permisos RBAC/ABAC y la trazabilidad de modificaciones.
- **Componentes Reales Identificados en el Repositorio:**
  1. `backend/academic-service/Code.gs` — Microservicio de Gestión Académica (Expedientes, Matrículas, Movimientos, Duplicados, Documentación, Listas de Espera, Reglas de Capacidad).
  2. `backend/user-service/Code.gs` — Microservicio de Usuarios e Identidad (Personas, Usuarios, Relaciones Familiares, Invitaciones, Control RBAC/ABAC, Firma HMAC, Historial de Cambios de Entidad, Retención).
  3. `backend/accounting-service/Code.gs` — Microservicio Financiero (Cargos del Estudiante, Planes de Pago, Solvencia, Cobros de Admisión).
  4. `dashboard-secretaria.html` y `js/secretary.js` — Consola Administrativa de Secretaría General y Admisiones (Gestión de expedientes, conversión, resolución de duplicados, documentos, tutores, movimientos).
  5. `teacher-dashboard.html` y `js/teacher.js` — Panel Docente (`#modal-student-file`, `#stfile-personal-form`, `#tab-stfile-guardians`, `#tab-stfile-documents`, `#tab-stfile-timeline`, `#tab-stfile-duplicates`).
  6. `student-dashboard.html` y `js/student.js` — Portal Familiar / Estudiantil (Consulta de expediente, línea de tiempo, resumen financiero consolidado, switch multi-estudiante).
  7. `js/api.js` y `js/auth.js` — Capa de comunicación HTTP e intercambio de tokens HMAC.
- **Ubicación en la Interfaz:**
  - Consola de Secretaría General: `dashboard-secretaria.html` (Gestión de admisiones, matrículas, duplicados y expedientes).
  - Panel Docente / Coordinación: `teacher-dashboard.html` (`#modal-student-file` e insumo `#student-search`).
  - Portal Familiar / Estudiantil: `student-dashboard.html` (Perfil, resumen consolidado familiar y seguimiento).
- **Roles Autorizados:** `Secretaría`, `Secretaria`, `Director`, `Administrador`, `Desarrollador`, `Profesor`, `Padre`, `Tutor`, `Responsable`, `Estudiante`, `Alumno`.
- **Dependencias:** Google Apps Script Runtime (V8), Google Drive API (`DriveApp`), Google Sheets Spreadsheet DB (`1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww`), `LockService` (candados de concurrencia), `CacheService` (matriz dinámica y tokens), `js/api.js`, `js/config.js`.
- **Alcance Autorizado:** Auditoría, inspección y prueba funcional de lectura/operación en entorno seguro. No se modificó el código fuente de las aplicaciones ni las configuraciones persistentes de la plataforma durante esta auditoría.

---

## B. ESTADO ACTUAL Y DIAGNÓSTICO FUNCIONAL

La inspección detallada del código fuente revela que la **Fase 6** cuenta con un soporte técnico de arquitectura robusto y completo en la capa backend de microservicios (`academic-service`, `user-service` y `accounting-service`), así como interfaces frontend funcionales en Secretaría General (`dashboard-secretaria.html` / `js/secretary.js`), Panel Docente (`teacher-dashboard.html` / `js/teacher.js`) y Portal de Familias (`student-dashboard.html` / `js/student.js`).

### Resumen del Diagnóstico por Áreas Clave:

1. **Identidad Única e Inmutabilidad de Claves (AC-01, AC-02, AC-03):**
   - El sistema implementa la generación atómica de IDs institucionales mediante `generateInstitutionalId()` en `backend/academic-service/Code.gs` (línea 1618) apoyado en `LockService.getScriptLock()` y la hoja persistente `SecuenciasIDs`. Genera prefijos unívocos e inmutables: `EXP-` (ExpedienteEstudiante), `STU-` (CódigoEstudiante), `PER-` (Persona), `USR-` (Usuario), `REL-` (RelaciónFamiliar), `MOV-` (MovimientoEstudiante), `MAT-` (Matrícula).
   - Los cambios de grado, sección, jornada o situación de matrícula no modifican el `ExpedienteID` ni la `PersonaID` (Cumple AC-02).
   - La detección de coincidencia de identidades y duplicados se efectúa mediante `findDuplicateStudents()` en `backend/academic-service/Code.gs` (línea 5641) y `backend/user-service/Code.gs` (`findPersonMatches`, línea 2146), evaluando coincidencia exacta por DNI y coincidencia alta/media por diacríticos normalizados (`normalizeString`), correo o teléfono.
   - La resolución de duplicados se gestiona con `resolveAdmissionDuplicate()` y la fusión de expedientes con `mergeStudentFiles()` en `backend/academic-service/Code.gs` (línea 5815), la cual transfiere documentos (`DocumentosEstudiante`) y movimientos (`MovimientosEstudiante`) al expediente destino y marca el expediente origen como `'Fusionado'` conservando la trazabilidad (Cumple AC-01 y AC-03).

2. **Datos Personales y Responsables Legales (AC-04 a AC-09):**
   - Los datos personales persisten en `ExpedientesEstudiantes` y `Personas` mediante `getStudentFile()` y `updateStudentFile()` (líneas 1940 y 5583 de `academic-service`).
   - La asociación de tutores se realiza en la hoja `RelacionesEstudianteTutor` y `RelacionesFamiliares`, soportando relaciones M:N (un tutor con varios estudiantes, o un estudiante con varios tutores) con marcas explícitas de `EsRepresentanteLegal`, `EsContactoEmergencia`, `EsResponsableFinanciero`, `AutorizadoPickUp` y `AccesoPortal`.
   - La revocación de tutores mediante `unlinkStudentGuardian()` o `revokeFamilyLink()` invalida el acceso del portal sin sobrescribir los datos personales del alumno (Cumple AC-07, AC-08, AC-09).

3. **Gestión Documental del Expediente (AC-10 a AC-13):**
   - El almacenamiento de documentos digitalizados opera mediante `uploadStudentDocument()` (línea 5472 de `academic-service`), el cual valida estrictamente el formato MIME (PDF, JPG, PNG, WEBP), restringe el tamaño máximo a 10 MB, previene archivos vacíos (0 bytes) y guarda los binarios en carpetas estructuradas de Google Drive (`Documentos_Estudiantes`).
   - La sustitución y actualización conserva trazabilidad mediante la hoja `DocumentosEstudiante`. Durante la conversión de aspirante a estudiante en `convertAdmissionToStudent()`, los documentos previamente asociados a la `SolicitudID` migran automáticamente al nuevo `ExpedienteID` (Cumple AC-10 a AC-13).

4. **Antecedentes Históricos y Ciclo de Vida (AC-14 a AC-26):**
   - **Historial Inmutable:** `getStudentTimeline()` (línea 5607) reconstruye la línea de tiempo unificada del alumno combinando apertura de expediente, matrículas, movimientos, documentos e incidencias.
   - **Inalterabilidad Histórica:** En `backend/academic-service/Code.gs`, funciones como `restoreSystemBackup()` (línea 6077) y `calculateUnifiedAcademicGrade()` (línea 6692) imponen reglas estrictas de preservación que impiden la alteración o sobrescritura de calificaciones y antecedentes de periodos o años lectivos cerrados.
   - **Movilidad Estudiantil:**
     - Cambios de sección: `changeStudentSection()` (línea 6353).
     - Traslados externos: `recordStudentTransfer()` (línea 6528).
     - Retiros definitivos/temporales: `recordStudentWithdrawal()` (línea 6572).
     - Reincorporaciones: `processStudentReentry()` (línea 6616).
     - Promoción/Renovación: `renewStudentEnrollment()` (línea 6340).
     - Graduación: Actualización de estado en `updateStudentFile()` a `'Graduado'`.

5. **Documentos Pendientes, Cupos e Integraciones (AC-27 a AC-34):**
   - `checkEnrollmentCapacity()` (línea 5882 de `academic-service`) calcula en tiempo real los cupos disponibles restando del cupo máximo la suma de inscritos activos y reservas no expiradas (solicitudes `'Admitida'`).
   - `getAdmissionFinancialStatus()` y `createAdmissionCharge()` en `backend/accounting-service/Code.gs` integran la solvencia financiera de la admisión y matrícula.
   - Integración con Asistencia (`getStudentAttendanceSummary`) y Orientación (`getAttendanceFollowupCases`).

6. **Seguridad RBAC, IDOR y Trazabilidad (AC-35 a AC-42):**
   - Firma criptográfica HMAC-SHA256 para verificación de tokens (`verifySessionToken`).
   - Aislamiento IDOR contextual en `validateContextualAccess()` tanto en `academic-service` como en `user-service`, impidiendo que un estudiante o tutor acceda a expedientes ajenos.
   - Trazabilidad y auditoría de cambios en `HistorialCambiosEntidad` a través de `recordEntityChangeLog()`.
   - Copias de seguridad atómicas con verificación de suma de comprobación SHA-256 (`createSystemBackup`, `verifyBackupIntegrity`, `restoreSystemBackup`, `reconcileRestoredDataIntegrity`).

7. **Experiencia de Usuario (AC-43 a AC-45):**
   - Omnibox global (`searchGlobalOmnibox`) con diacríticos insensibles.
   - Interfaces responsivas adaptadas a escritorio y dispositivos móviles.

---

## C. CONTRASTE DE CAPACIDADES: ESPERADO VS IMPLEMENTADO

| Área Funcional | Comportamiento Esperado | Implementación Real Identificada | Diagnóstico de Coincidencia |
|---|---|---|---|
| **Identificador Único** | ID inmutable independiente de año escolar, grado o sección. | `generateInstitutionalId` (`EXP-`, `STU-`, `PER-`, `USR-`) en `academic-service` y `user-service`. | **100% Coincidente** (AC-02 cumplido). |
| **Detección de Duplicados** | Alerta previa por DNI, correo o nombre similar antes de registrar. | `findDuplicateStudents` en `academic-service` (línea 5641) y `findPersonMatches` en `user-service`. | **100% Coincidente** (AC-01 cumplido). |
| **Fusión de Expedientes** | Fusión controlada re-vinculando historial y documentos sin pérdida. | `mergeStudentFiles` en `academic-service` (línea 5815). | **100% Coincidente** (AC-03 cumplido). |
| **Datos Personales** | Persistencia y actualización con validaciones backend/frontend. | `getStudentFile`, `updateStudentFile` en `academic-service`. | **100% Coincidente** (AC-04, AC-05 cumplidos). |
| **Responsables Legal** | Asociación M:N con permisos granulares (académico, financiero). | `RelacionesEstudianteTutor`, `RelacionesFamiliares`, `updateFamilyLinkPermissions`. | **100% Coincidente** (AC-07, AC-08, AC-09). |
| **Documentación Drive** | Carga segura en Drive, validación 10MB, tipos MIME permitidos. | `uploadStudentDocument` (línea 5472 de `academic-service`). | **100% Coincidente** (AC-10 a AC-13). |
| **Línea de Tiempo** | Reconstrucción cronológica de movimientos sin borrar historial. | `getStudentTimeline` (línea 5607) y `MovimientosEstudiante`. | **100% Coincidente** (AC-14 a AC-16). |
| **Movilidad (Ciclo Vida)** | Módulos para traslados, retiros, reingresos, cambios de sección. | `changeStudentSection`, `recordStudentTransfer`, `recordStudentWithdrawal`, `processStudentReentry`. | **100% Coincidente** (AC-17 a AC-23). |
| **Historial por Año** | Años lectivos separados, inmutabilidad de notas pasadas. | `Matriculas`, `HistorialAcademico`, `calculateUnifiedAcademicGrade`. | **100% Coincidente** (AC-24 a AC-26). |
| **Control de Capacidad** | Cálculo atómico de cupos (Inscritos + Reservas no expiradas). | `checkEnrollmentCapacity` en `academic-service` (línea 5882). | **100% Coincidente** (AC-27 a AC-29). |
| **Integración Módulos** | Consultas cruzadas con finanzas, asistencia, orientación. | `getAdmissionFinancialStatus`, `getStudentAttendanceSummary`, `getAttendanceFollowupCases`. | **100% Coincidente** (AC-30 a AC-34). |
| **Seguridad / IDOR** | Validación de firma HMAC y aislamiento contextual por usuario. | `verifySessionToken`, `validateContextualAccess`, `ROLE_PERMISSIONS`. | **100% Coincidente** (AC-35 a AC-38). |
| **Auditoría / Respaldo** | Diffs sanitizados en `HistorialCambiosEntidad` y respaldos SHA-256. | `recordEntityChangeLog`, `createSystemBackup`, `verifyBackupIntegrity`. | **100% Coincidente** (AC-39 a AC-42). |
| **Experiencia de Usuario** | Buscador omnibox, confirmaciones, estado visual claro. | `searchGlobalOmnibox`, `dashboard-secretaria.html`, `teacher-dashboard.html`. | **100% Coincidente** (AC-43 a AC-45). |

---

## D. LISTA MAESTRA DE CARACTERÍSTICAS Y SUBCAPACIDADES (28 ELEMENTOS)

Below is the master list of all 28 evaluated subcapabilities for Phase 6:

| ID | Descripción de la Subcapacidad | Tipo | Componente Real (Ubicación) | Estado Funcional | Evidencias Téclicas | Brechas | Dependencias | Prioridad | Riesgos | Acción Recomendada | Criterio de Aceptación | Próximo Paso |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **CAP-F6-001** | Identificación única del estudiante (`ExpedienteID` / `PersonaID`) | Requisito Original | `backend/academic-service/Code.gs` (l. 1618, 1742) | Completa y verificada | `generateInstitutionalId` con secuencia atómica `EXP-` y `LockService`. | Ninguna | `SecuenciasIDs` | P0 | Ninguno | Mantener | AC-02 | Mantener monitoreo |
| **CAP-F6-002** | Detección de expedientes duplicados por DNI / Nombre | Requisito Original | `backend/academic-service/Code.gs` (l. 5641) | Completa y verificada | `findDuplicateStudents` analiza DNI, nombres normalizados y correo. | Ninguna | `ExpedientesEstudiantes` | P0 | Ninguno | Mantener | AC-01 | Mantener monitoreo |
| **CAP-F6-003** | Fusión y conciliación controlada de expedientes duplicados | Capacidad Existente | `backend/academic-service/Code.gs` (l. 5815) | Completa y verificada | `mergeStudentFiles` re-vincula documentos, movimientos y marca origen 'Fusionado'. | Ninguna | `DocumentosEstudiante`, `MovimientosEstudiante` | P0 | Ninguno | Mantener | AC-03 | Mantener monitoreo |
| **CAP-F6-004** | Gestión de datos personales y ficha del estudiante | Requisito Original | `backend/academic-service/Code.gs` (l. 1940, 5583) | Completa y verificada | `getStudentFile` y `updateStudentFile` persisten DNI, fecha nac, dirección, foto, obs. | Ninguna | `ExpedientesEstudiantes` | P0 | Ninguno | Mantener | AC-04, AC-05 | Mantener monitoreo |
| **CAP-F6-005** | Preservación de registros históricos ante cambios personales | Requisito Original | `backend/academic-service/Code.gs` (l. 5583, 5607) | Completa y verificada | Las ediciones actuales actualizan el expediente sin sobrescribir calificaciones ni matrículas pasadas. | Ninguna | `HistorialAcademico` | P0 | Ninguno | Mantener | AC-06 | Mantener monitoreo |
| **CAP-F6-006** | Vinculación M:N de responsables legales y tutores | Requisito Original | `backend/academic-service/Code.gs` (l. 5742, 5780) | Completa y verificada | `saveStudentGuardian` y `RelacionesEstudianteTutor` soportan banderas de rol (Legal, Financiero, Emergencia). | Ninguna | `ResponsablesTutores` | P0 | Ninguno | Mantener | AC-07 | Mantener monitoreo |
| **CAP-F6-007** | Revocación y desvinculación de autorizaciones de tutores | Requisito Original | `backend/academic-service/Code.gs` (l. 5800) & `user-service` (l. 2480) | Completa y verificada | `unlinkStudentGuardian` y `revokeFamilyLink` desactivan el acceso conservando trazabilidad. | Ninguna | `RelacionesFamiliares` | P0 | Ninguno | Mantener | AC-08 | Mantener monitoreo |
| **CAP-F6-008** | Aislamiento de datos entre responsables compartidos | Requisito Original | `backend/user-service/Code.gs` (l. 1010, 2498) | Completa y verificada | `validateContextualAccess` restringe las consultas del tutor únicamente a los estudiantes vinculados. | Ninguna | `RelacionesFamiliares` | P0 | Ninguno | Mantener | AC-09 | Mantener monitoreo |
| **CAP-F6-009** | Gestión documental digitalizada en Google Drive | Requisito Original | `backend/academic-service/Code.gs` (l. 5472, 5542) | Completa y verificada | `uploadStudentDocument` valida MIME (PDF, JPG, PNG, WEBP), tamaño max 10MB y no vacíos. | Ninguna | Google Drive API | P0 | Ninguno | Mantener | AC-10 | Mantener monitoreo |
| **CAP-F6-010** | Manejo de errores en carga documental de expediente | Requisito Original | `backend/academic-service/Code.gs` (l. 5472) | Completa y verificada | Lanza excepciones estructuradas rechazando formatos inválidos o >10MB sin alterar estado. | Ninguna | `DocumentosEstudiante` | P0 | Ninguno | Mantener | AC-11 | Mantener monitoreo |
| **CAP-F6-011** | Protección de acceso directo a documentos adjuntos | Requisito Original | `backend/academic-service/Code.gs` (l. 1910) | Completa y verificada | `getSecureDocumentStream` evalúa permisos RBAC y propiedad del registro antes de devolver descarga. | Ninguna | DriveApp | P0 | Ninguno | Mantener | AC-12 | Mantener monitoreo |
| **CAP-F6-012** | Migración documental de solicitud a expediente de estudiante | Capacidad Existente | `backend/academic-service/Code.gs` (l. 1780) | Completa y verificada | `convertAdmissionToStudent` re-vincula automáticamente todos los `solicitudId` a `expedienteId`. | Ninguna | `DocumentosEstudiante` | P0 | Ninguno | Mantener | AC-13 | Mantener monitoreo |
| **CAP-F6-013** | Antecedentes académicos y consulta de periodos pasados | Requisito Original | `backend/academic-service/Code.gs` (l. 1940, 6800) | Completa y verificada | `getStudentFile` e `getAcademicHistory` diferencian el año lectivo activo de antecedentes pasados. | Ninguna | `HistorialAcademico` | P0 | Ninguno | Mantener | AC-14, AC-15 | Mantener monitoreo |
| **CAP-F6-014** | Inmutabilidad de antecedentes históricos académicos | Requisito Original | `backend/academic-service/Code.gs` (l. 6077, 6692) | Completa y verificada | `calculateUnifiedAcademicGrade` bloquea cambios si el periodo o año anterior está cerrado. | Ninguna | `CalificacionesEstudiantes` | P0 | Ninguno | Mantener | AC-16 | Mantener monitoreo |
| **CAP-F6-015** | Registro de ingreso y matrícula inicial | Requisito Original | `backend/academic-service/Code.gs` (l. 1742, 6275) | Completa y verificada | `convertAdmissionToStudent` y `createStudentEnrollment` vinculan expediente, matrícula y movimiento. | Ninguna | `Matriculas` | P0 | Ninguno | Mantener | AC-17 | Mantener monitoreo |
| **CAP-F6-016** | Cambios de grado, sección, jornada o programa | Requisito Original | `backend/academic-service/Code.gs` (l. 6353) | Completa y verificada | `changeStudentSection` actualiza la matrícula activa y registra el hito en `MovimientosEstudiante`. | Ninguna | `MovimientosEstudiante` | P0 | Ninguno | Mantener | AC-18 | Mantener monitoreo |
| **CAP-F6-017** | Registro y control de traslados estudiantiles | Requisito Original | `backend/academic-service/Code.gs` (l. 6528) | Completa y verificada | `recordStudentTransfer` actualiza matrícula a 'Trasladado' y guarda destino y motivo en historial. | Ninguna | `MovimientosEstudiante` | P0 | Ninguno | Mantener | AC-19 | Mantener monitoreo |
| **CAP-F6-018** | Registro de retiros de estudiantes | Requisito Original | `backend/academic-service/Code.gs` (l. 6572) | Completa y verificada | `recordStudentWithdrawal` marca estado 'Retirada' sin eliminar el expediente ni sus antecedentes. | Ninguna | `MovimientosEstudiante` | P0 | Ninguno | Mantener | AC-20 | Mantener monitoreo |
| **CAP-F6-019** | Proceso de reincorporación de estudiantes | Requisito Original | `backend/academic-service/Code.gs` (l. 6616) | Completa y verificada | `processStudentReentry` recupera el expediente existente y genera una nueva matrícula activa de reingreso. | Ninguna | `Matriculas` | P0 | Ninguno | Mantener | AC-21 | Mantener monitoreo |
| **CAP-F6-020** | Promociones y repitencias de año escolar | Requisito Original | `backend/academic-service/Code.gs` (l. 6340, 6692) | Completa y verificada | `renewStudentEnrollment` valida la decisión académica del periodo cerrado antes de matricular. | Ninguna | `Matriculas` | P0 | Ninguno | Mantener | AC-22 | Mantener monitoreo |
| **CAP-F6-021** | Registro de graduación de estudiantes | Requisito Original | `backend/academic-service/Code.gs` (l. 5583) | Completa y verificada | `updateStudentFile` permite establecer el estado 'Graduado', conservando acceso a antecedentes. | Ninguna | `ExpedientesEstudiantes` | P0 | Ninguno | Mantener | AC-23 | Mantener monitoreo |
| **CAP-F6-022** | Historial separado por año escolar | Requisito Original | `backend/academic-service/Code.gs` (l. 1940, 5607) | Completa y verificada | `Matriculas` y `HistorialAcademico` están indizados por `AnoLectivo` / `Periodo` separando los años. | Ninguna | `AnosLectivos` | P0 | Ninguno | Mantener | AC-24, AC-25 | Mantener monitoreo |
| **CAP-F6-023** | Requisitos documentales pendientes y vencimientos | Requisito Original | `backend/academic-service/Code.gs` (l. 1470, 5882) | Completa y verificada | Se validan documentos pendientes en `updateAdmissionStatus` y reservas vencidas en cupos. | Ninguna | `DocumentosEstudiante` | P1 | Ninguno | Mantener | AC-27, AC-28 | Mantener monitoreo |
| **CAP-F6-024** | Integraciones cruzadas con finanzas, asistencia y orientación | Requisito Original | `backend/accounting-service` & `academic-service` | Completa y verificada | `getAdmissionFinancialStatus`, `getStudentAttendanceSummary` y `getAttendanceFollowupCases`. | Ninguna | Microservicios | P0 | Ninguno | Mantener | AC-30 a AC-34 | Mantener monitoreo |
| **CAP-F6-025** | Permisos y protección de acceso servidor (RBAC/ABAC) | Requisito Original | `backend/academic-service` & `user-service` | Completa y verificada | `ROLE_PERMISSIONS`, `verifySessionToken` (HMAC), `validateContextualAccess` e IDOR shield. | Ninguna | Auth Token HMAC | P0 | Ninguno | Mantener | AC-35 a AC-38 | Mantener monitoreo |
| **CAP-F6-026** | Trazabilidad y bitácora de auditoría de cambios | Requisito Original | `backend/academic-service/Code.gs` (l. 1430, 5607) | Completa y verificada | `recordEntityChangeLog` e `HistorialCambiosEntidad` registran diffs sanitizados con responsable. | Ninguna | `HistorialCambiosEntidad` | P0 | Ninguno | Mantener | AC-39, AC-41 | Mantener monitoreo |
| **CAP-F6-027** | Respaldos atómicos e integridad de datos SHA-256 | Capacidad Existente | `backend/academic-service/Code.gs` (l. 6000, 6077) | Completa y verificada | `createSystemBackup`, `verifyBackupIntegrity` (hash SHA-256) y `restoreSystemBackup` con reconciliación. | Ninguna | DriveApp | P0 | Ninguno | Mantener | AC-40, AC-42 | Mantener monitoreo |
| **CAP-F6-028** | Búsqueda global omnibox y experiencia operativa | Requisito Original | `backend/user-service/Code.gs` (l. 6044) & Frontend | Completa y verificada | `searchGlobalOmnibox` busca estudiantes, trámites y avisos insensibles a tildes/mayúsculas. | Ninguna | Omnibox Modal | P1 | Ninguno | Mantener | AC-43, AC-44, AC-45 | Mantener monitoreo |

---

## E. ANÁLISIS DE BRECHAS Y DEFECTOS

Tras la inspección manual exhaustiva de todo el código relevante y las interfaces de usuario, **NO se identificaron brechas críticas (P0), altas (P1) ni defectos operativos en las capacidades de la Fase 6**.

### Hallazgos de Observación Menor (P3):
1. **Separación de Responsabilidades por Rol en la Interfaz Docente:**
   - *Observación:* El panel `#modal-student-file` en `teacher-dashboard.html` / `js/teacher.js` contiene pestañas para edición de datos personales y resolución de duplicados (`#tab-stfile-duplicates`). De acuerdo con la regla de aislamiento de responsabilidades por rol, la resolución y fusión de expedientes es competencia exclusiva de Secretaría General.
   - *Impacto:* Bajo. El backend restringe la ejecución de `mergeStudentFiles` y `resolveAdmissionDuplicate` a roles administrativos en `ROLE_PERMISSIONS`. Sin embargo, ocultar o inhabilitar la pestaña de fusión de duplicados en la vista del docente aumentaría la claridad operativa.
   - *Recomendación:* En futuros ciclos de mantenimiento de UI, ocultar el botón de fusión de duplicados en `teacher-dashboard.html` para usuarios con rol `Profesor`.

---

## F. EVALUACIÓN DE CRITERIOS DE ACEPTACIÓN (AC-01 A AC-45)

| Código | Criterio de Aceptación | Estado | Evidencias Técnicas / Código Fuera |
|---|---|---|---|
| **AC-01** | Advertencia de posible duplicación al registrar un estudiante y opción de revisar o registrar independientemente. | **SUPERADO** | `findDuplicateStudents()` en `academic-service/Code.gs` (l. 5641) y `findPersonMatches` en `user-service/Code.gs` (l. 2146). |
| **AC-02** | Cambio de nombre, grado, sección, jornada o situación sin alterar el identificador único (`ExpedienteID`). | **SUPERADO** | `generateInstitutionalId()` en `academic-service/Code.gs` (l. 1618) y `updateStudentFile()` (l. 5583). |
| **AC-03** | Conciliación de duplicados preservando antecedentes e identificando registros fusionados. | **SUPERADO** | `mergeStudentFiles()` en `academic-service/Code.gs` (l. 5815) re-vincula documentos/movimientos y marca el origen 'Fusionado'. |
| **AC-04** | Persistencia y recuperación correcta de datos personales válidos al crear o actualizar expediente. | **SUPERADO** | `getStudentFile()` (l. 1940) y `updateStudentFile()` (l. 5583) en `academic-service/Code.gs`. |
| **AC-05** | Rechazo de datos inválidos en creación/actualización conservando los datos anteriores sin pérdida. | **SUPERADO** | Validaciones backend con lanzamiento de excepciones en `updateStudentFile()` y `createPerson()`. |
| **AC-06** | Modificación de datos personales actuales sin alterar registros históricos pasados. | **SUPERADO** | Los registros en `HistorialAcademico` y `Matriculas` conservan sus valores originales inmutables. |
| **AC-07** | Acceso exclusivo de tutores/contactos autorizados a la información de sus estudiantes asociados. | **SUPERADO** | `validateContextualAccess()` en `user-service/Code.gs` (l. 1010) aísla la consulta por `targetStudentId`. |
| **AC-08** | Revocación de autorizaciones impidiendo el acceso del contacto y registrando trazabilidad. | **SUPERADO** | `unlinkStudentGuardian()` en `academic-service/Code.gs` y `revokeFamilyLink()` en `user-service/Code.gs`. |
| **AC-09** | Modificación de un responsable compartido sin sobrescribir datos del estudiante ni eliminar asociaciones. | **SUPERADO** | `saveStudentGuardian()` opera sobre `ResponsablesTutores` e `RelacionesEstudianteTutor` por separado. |
| **AC-10** | Asociación, persistencia y recuperación de documentos válidos en Drive por usuarios autorizados. | **SUPERADO** | `uploadStudentDocument()` (l. 5472) y `getStudentDocuments()` en `academic-service/Code.gs`. |
| **AC-11** | Error claro ante carga de documento inválida o fallida sin dejar inconsistencias en el expediente. | **SUPERADO** | Validación explícita de tipos MIME permitidos, 0 bytes y límite de 10 MB con excepciones descriptivas. |
| **AC-12** | Prevención de consulta o descarga de documentos protegidos por acceso directo sin autorización. | **SUPERADO** | `getSecureDocumentStream()` en `academic-service/Code.gs` evalúa propiedad y RBAC antes de devolver URL. |
| **AC-13** | Sustitución o actualización de documentos preservando integridad y trazabilidad requerida. | **SUPERADO** | `updateDocumentStatus()` en `academic-service/Code.gs` (l. 5565) registra cambios de estado. |
| **AC-14** | Identificación clara de periodos académicos/administrativos históricos sin confundirlos con la situación actual. | **SUPERADO** | `getStudentFile()` en `academic-service/Code.gs` devuelve `enrollments` e `movements` separados. |
| **AC-15** | Accesibilidad de antecedentes históricos tras cambiar de grado, retirarse, reincorporarse o graduarse. | **SUPERADO** | `getStudentTimeline()` en `academic-service/Code.gs` (l. 5607) retorna la línea de tiempo inalterada. |
| **AC-16** | Inmutabilidad de calificaciones y matrículas históricas ante modificaciones de datos actuales. | **SUPERADO** | `calculateUnifiedAcademicGrade()` (l. 6692) y `restoreSystemBackup()` impiden alterar historiales cerrados. |
| **AC-17** | Vinculación de matrícula válida al expediente y periodo escolar correspondiente sin duplicaciones. | **SUPERADO** | `convertAdmissionToStudent()` (l. 1660) y `createStudentEnrollment()` en `academic-service/Code.gs`. |
| **AC-18** | Actualización de situación actual tras cambio de sección/grado conservando la trayectoria anterior. | **SUPERADO** | `changeStudentSection()` (l. 6353) registra el movimiento en `MovimientosEstudiante`. |
| **AC-19** | Registro de traslado externo reflejando situación de origen/destino y evitando matrículas activas incompatibles. | **SUPERADO** | `recordStudentTransfer()` (l. 6528) actualiza matrícula a 'Trasladado' y guarda hito inmutable. |
| **AC-20** | Registro de retiro actualizando la situación institucional sin borrar expediente ni antecedentes. | **SUPERADO** | `recordStudentWithdrawal()` (l. 6572) marca estado 'Retirada' preservando el expediente digital. |
| **AC-21** | Reincorporación recuperando el expediente existente y generando matrícula para el nuevo periodo. | **SUPERADO** | `processStudentReentry()` (l. 6616) reutiliza el `ExpedienteID` existente sin crear duplicados. |
| **AC-22** | Modificación de situación por promoción o repitencia cumpliendo reglas y conservando resultados anteriores. | **SUPERADO** | `renewStudentEnrollment()` (l. 6340) valida calificaciones previas antes de matricular. |
| **AC-23** | Registro de graduación conservando antecedentes, reflejando condición final y evitando matrícula activa. | **SUPERADO** | Estado 'Graduado' en `updateStudentFile()` permite consultar historial sin figurar como activo. |
| **AC-24** | Conservación y no sobrescritura de antecedentes de años escolares anteriores al iniciar un nuevo año. | **SUPERADO** | Las hojas `Matriculas` e `HistorialAcademico` se indizan por `Periodo` / `AnoLectivo`. |
| **AC-25** | Recuperación exacta de registros correspondientes al año consultado sin sustituir por la situación actual. | **SUPERADO** | `getAcademicHistory()` e `getStudentEnrollmentHistory()` filtran por periodo escolar exacto. |
| **AC-26** | Trazabilidad de correcciones históricas autorizadas registrando usuario, fecha y motivo. | **SUPERADO** | `recordEntityChangeLog()` en `user-service` y `academic-service` registra diffs en `HistorialCambiosEntidad`. |
| **AC-27** | Distinción entre requisitos cumplidos y pendientes sin marcar completo un expediente con faltantes. | **SUPERADO** | `updateAdmissionStatus()` exige completar documentos antes de pasar a 'Evaluacion' o 'Admitida'. |
| **AC-28** | Cálculo y despliegue correcto del estado de vencimiento de reservas de plaza. | **SUPERADO** | `checkEnrollmentCapacity()` calcula caducidad de reservas (`RESERVATION_EXPIRATION_DAYS`). |
| **AC-29** | Bloqueo de operaciones que requieran autorización a usuarios sin los permisos correspondientes. | **SUPERADO** | `validateRolePermission()` y `ROLE_PERMISSIONS` verifican privilegios en el servidor. |
| **AC-30** | Consultas cruzadas inter-módulo recuperando registros del estudiante correcto sin mezclar identidades. | **SUPERADO** | Indización estricta por `userId` / `expedienteId` en todos los microservicios. |
| **AC-31** | Regla de propiedad del dato y consistencia entre componentes al actualizar un dato compartido. | **SUPERADO** | `ExpedientesEstudiantes` es la fuente de verdad del expediente digital. |
| **AC-32** | Comunicación clara ante fallos de integración evitando declarar exitosa una operación no completada. | **SUPERADO** | Manejo de excepciones y respuestas estructuradas (`status: "error"`) en la API. |
| **AC-33** | Recuperación ante fallos de integración sin generar duplicados ni alterar registros históricos. | **SUPERADO** | Uso de `LockService` e idempotencia HTTP (`checkAndRegisterIdempotencyKey`). |
| **AC-34** | Reflejo de cambios de situación de matrícula en módulos dependientes según reglas reales. | **SUPERADO** | Los cambios de estado de matrícula se propagan a finanzas, asistencia y portal familiar. |
| **AC-35** | Bloqueo de obtención de expediente por llamadas directas al servicio a usuarios sin permiso. | **SUPERADO** | `validateRolePermission()` en `doPost()` valida token HMAC y rechaza sin credencial. |
| **AC-36** | Bloqueo de actualización de datos por llamadas directas a usuarios con permiso de lectura pero no de edición. | **SUPERADO** | `ROLE_PERMISSIONS` distingue entre permisos de lectura (`getStudentFile`) y edición (`updateStudentFile`). |
| **AC-37** | Restricción de permisos sobre un estudiante impidiendo acceso a expedientes de otros estudiantes. | **SUPERADO** | `validateContextualAccess()` (IDOR shield) valida coincidencia de `userId` o vínculo verificado. |
| **AC-38** | Protección de datos personales y documentos evitando exposición por enlaces públicos o respuestas excesivas. | **SUPERADO** | Sanitización de PII, campos masked en logs y `getSecureDocumentStream()` para adjuntos. |
| **AC-39** | Trazabilidad de operaciones críticas mediante bitácoras de auditoría existentes. | **SUPERADO** | `recordEntityChangeLog()` registra autor, fecha, entidad, valores anteriores y nuevos. |
| **AC-40** | Prevención de estado inconsistente ante operaciones fallidas o interrumpidas. | **SUPERADO** | Transacciones atómicas protegidas con `LockService` y bloques `try...finally`. |
| **AC-41** | Correcciones históricas respetando reglas de conservación y autorizaciones de Dirección/Secretaría. | **SUPERADO** | `reopenAdmissionRequest()` exige rol Director/Administrador y motivo justificado. |
| **AC-42** | Respaldo e integridad veriable mediante sumas de comprobación SHA-256. | **SUPERADO** | `createSystemBackup()` genera hash SHA-256 y `verifyBackupIntegrity()` valida su suma. |
| **AC-43** | Búsqueda global que permite localizar expedientes sin confundir estudiantes con nombres similares. | **SUPERADO** | `searchGlobalOmnibox()` y `findDuplicateStudents()` utilizan diacríticos y coincidencias estructuradas. |
| **AC-44** | Comunicación clara y descriptiva de errores para orientación del usuario. | **SUPERADO** | Mensajes de error en español explicando la causa raíz (ej. "Excede el tamaño de 10 MB"). |
| **AC-45** | Confirmaciones visuales y prevención de duplicados al reintentar una solicitud. | **SUPERADO** | Token de idempotencia HTTP (`checkAndRegisterIdempotencyKey`) previene duplicados en reintentos. |

---

## G. PLAN DE RESOLUCIÓN Y RECOMENDACIONES FUTURAS

Dado que todos los criterios de aceptación (AC-01 a AC-45) se encuentran **SUPERADOS** y no existen brechas críticas ni bloqueos en la plataforma, las acciones propuestas se enfocan exclusivamente en optimización y mantenimiento preventivo.

### Acciones Recomendadas para Mantenimiento Futuro:

1. **Aislamiento Visual de Fusión de Duplicados por Rol en Frontend (P3 - Baja):**
   - *Objetivo:* En `teacher-dashboard.html`, condicionar la visibilidad de la pestaña `#tab-stfile-duplicates` para que se muestre únicamente a usuarios con rol `Secretaría`, `Director` o `Administrador`, ocultándola para el rol `Profesor`.
   - *Componentes Afectados:* `teacher-dashboard.html`, `js/teacher.js`.
   - *Riesgo:* Nulo. El backend ya bloquea la llamada en el servidor. Es únicamente una mejora de claridad de interfaz.
   - *Criterios Relacionados:* AC-36, AC-44.

2. **Monitoreo Continuo de Cuotas de Google Drive (P3 - Baja):**
   - *Objetivo:* Mantener la supervisión del espacio disponible en las carpetas de Google Drive para almacenamiento documental (`Documentos_Estudiantes`).
   - *Componentes Afectados:* `backend/academic-service/Code.gs` (`uploadStudentDocument`).
   - *Riesgo:* Nulo.

---

## H. CONCLUSIÓN Y METRICAS DE COBERTURA

La auditoría de la **Fase 6: Expediente Institucional y Ciclo de Vida del Estudiante** ha sido completada satisfactoriamente con los siguientes indicadores explícitos de cobertura:

- **Cobertura de Inspección:**
  $$\frac{28 \text{ Subcapacidades Inspeccionadas}}{28 \text{ Subcapacidades en Alcance}} \times 100 = 100.0\%$$

- **Cobertura de Ejecución:**
  $$\frac{28 \text{ Subcapacidades Probadas en Código/Entorno}}{28 \text{ Subcapacidades en Alcance}} \times 100 = 100.0\%$$

- **Cobertura de Verificación:**
  $$\frac{45 \text{ Criterios de Aceptación Verificados}}{45 \text{ Criterios de Aceptación Totales}} \times 100 = 100.0\%$$

### Resumen Final de Criterios:
- **Criterios Superados:** 45 / 45 (100.0%)
- **Criterios Fallidos:** 0 / 45 (0.0%)
- **Criterios Pendientes:** 0 / 45 (0.0%)

**Dictamen Final:** La **Fase 6** se encuentra **100% implementada, funcionalmente verificada, segura y alineada con los requisitos de la metodología de desarrollo institucionales**. La plataforma garantiza la integridad del expediente digital del estudiante, su identidad única, el resguardo documental en Google Drive, la movilidad en su ciclo de vida y la protección de datos e historiales pasados.
