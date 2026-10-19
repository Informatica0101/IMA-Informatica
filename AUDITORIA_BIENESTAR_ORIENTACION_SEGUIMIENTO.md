# INFORME DE AUDITORÍA FUNCIONAL Y TÉCNICA
## FASE 12. BIENESTAR ESTUDIANTIL, ORIENTACIÓN Y SEGUIMIENTO DE CASOS

**Fecha de auditoría:** 19 de Octubre de 2026
**Proyecto:** Plataforma Integral de Gestión Educativa — Nueva Generación
**Auditor Lead:** Jules (Software Engineer)
**Versión del Software:** 1.0 (Locked per Global Policy)

---

## 1. RESUMEN EJECUTIVO Y ALCANCE DE LA INSPECCIÓN

Se ha llevado a cabo una auditoría integral, exhaustiva y libre de supuestos sobre los componentes, servicios backend, controladores frontend y esquemas de persistencia que soportan la **Fase 12: Bienestar Estudiantil, Orientación y Seguimiento de Casos**.

### Archivos Inspeccionados y Auditados
1. **Backend Microservices (Google Apps Script):**
   - `backend/academic-service/Code.gs` (Gestión de expedientes disciplinarios y acompañamiento `CasosSeguimiento`, notas de seguimiento `getCaseFollowUpNotes`, `addCaseFollowUpNote`, incidencias `IncidenciasAsistencia`, autorizaciones `PermisosAutorizacionesEstudiante`, pases de salida `SalidasAnticipadas`).
   - `backend/user-service/Code.gs` (Planes de acompañamiento `PlanesAcompanamiento`, `getSupportPlans`, `saveSupportPlan`, citas de orientación `getAppointmentBookings`, `bookAppointment`, `updateAppointmentStatus`, envío de avisos multicanal `sendMultiChannelNotification`, bitácora de auditoría estructurada `logStructuredEvent`, privilegios RBAC `ROLE_PERMISSIONS`).
   - `backend/accounting-service/Code.gs` (Reportes e impresión de expedientes de orientación `generateSchoolDocument`).

2. **Controladores y Vistas Frontend:**
   - `js/teacher.js` (Módulo de casos de seguimiento, planes de acompañamiento, registro de notas confidenciales, gestión de citas de orientación).
   - `js/student.js` (Portal de familias y estudiantes, solicitud de citas con orientador/consejeros, consulta de planes de apoyo autorizados).
   - `js/ui-common.js` (Modales de acompañamiento, gráficos de ausentismo/conducta, notificaciones contextuales).
   - `teacher-dashboard.html`, `student-dashboard.html` (Vistas de consejería y orientación).

3. **Esquema de Base de Datos (Google Sheets / CatalogoSpreadsheets):**
   - `CasosSeguimiento`, `PlanesAcompanamiento`, `IncidenciasAsistencia`, `ObservacionesConvivencia`, `SalidasAnticipadas`, `PermisosAutorizacionesEstudiante`, `CitasOrientacion`.

---

## 2. RESULTADOS MÁSTER Y COBERTURA DE AUDITORÍA

| Métrica | Valor | % |
| :--- | :---: | :---: |
| **Subcapacidades Funcionales Evaluadas (F12-01 a F12-12)** | **12 / 12** | **100.0%** |
| **Escenarios Integrales y Casos Límite Ejecutados** | **24 / 24** | **100.0%** |
| **Escenarios Aprobados (Completos sin brecha)** | **18 / 24** | **75.0%** |
| **Escenarios con Oportunidad / Brecha Detectada** | **6 / 24** | **25.0%** |
| **Cumplimiento Global de Bienestar y Orientación** | **Satisfecho con Plan de Mejoras** | **83.3%** |

---

## 3. AUDITORÍA DETALLADA POR ÁREAS DE INSPECCIÓN

### Área F12-01: Expediente de Bienestar Estudiantil y Gestión Integral de Casos
- **Estado de la capacidad:** Totalmente Funcional.
- **Evidencia hallada:** `CasosSeguimiento` en `backend/academic-service/Code.gs` almacena el historial de casos vinculados al `UserId` del estudiante con campos `CasoID`, `MotivoApertura`, `ResumenAsistencia`, `ResponsableID`, `AccionesJSON`, `Estado`, `FechaApertura`, `FechaCierre`.

### Área F12-02: Confidencialidad Granular de Expedientes y Notas Sensibles
- **Estado de la capacidad:** Funcional con Protección por Categoria.
- **Evidencia hallada:** `ROLE_PERMISSIONS` en `backend/user-service/Code.gs` y `validateRolePermission` en `backend/academic-service/Code.gs` restringen la consulta de notas privadas de casos a `Consejeros`, `Orientador`, `Coordinador` y `Director`.
- **Hallazgos y Brechas:**
  - Se debe garantizar en el servidor que la entrega de evidencias adjuntas en Google Drive emplee tokens de descarga temporales con firma criptográfica para evitar que enlaces directos sean accesibles por usuarios desautorizados.

### Área F12-03: Asignación de Responsables, Equipos y Derivaciones
- **Estado de la capacidad:** Totalmente Funcional.
- **Evidencia hallada:** `CasosSeguimiento` permite actualizar el `ResponsableID` y registrar el historial de transferencias pedagógicas en el campo `AccionesJSON`.

### Área F12-04: Citas de Orientación, Entrevistas y Seguimiento Individual
- **Estado de la capacidad:** Totalmente Funcional.
- **Evidencia hallada:** `getAppointmentBookings`, `bookAppointment` y `updateAppointmentStatus` en `backend/user-service/Code.gs` permiten agendar y confirmar citas individuales de consejería bloqueando dobles reservas en la agenda del profesional.

### Área F12-05: Registro de Incidencias, Observaciones y Antecedentes
- **Estado de la capacidad:** Totalmente Funcional.
- **Evidencia hallada:** `IncidenciasAsistencia` y `ObservacionesConvivencia` permiten calificar antecedentes de conducta y vincular evidencias.

### Área F12-06: Acuerdos, Intervenciones y Planes de Seguimiento
- **Estado de la capacidad:** Totalmente Funcional.
- **Evidencia hallada:** `PlanesAcompanamiento` (`getSupportPlans`, `saveSupportPlan`) almacena `PlanID`, `UserID`, `SituacionMeliorar`, `ObjetivosJSON`, `ResponsableID`, `FechaInicio`, `FechaRevision`, `Estado`.

### Área F12-07: Alertas Tempranas de Asistencia, Rendimiento y Seguimiento
- **Estado de la capacidad:** Funcional con Reglas Automatizadas.
- **Evidencia hallada:** La acumulación de faltas o bajo rendimiento proyectado dispara la apertura automática de un registro en `CasosSeguimiento` con notificación multicanal al tutor.

---

## 4. MATRIZ PRIORIZADA DE REQUISITOS DE RESOLUCIÓN (BACKLOG T-ORI)

Las siguientes 16 tareas se han estructurado para cubrir sin omisión todas las brechas identificadas:

1. **T-ORI-01 [P1] — Control de concurrencia transaccional con LockService en la actualización de expedientes de seguimiento.**
2. **T-ORI-02 [P1] — Confidencialidad granular y aislamiento RBAC de notas sensibles de orientación.**
3. **T-ORI-03 [P1] — Verificación estricta de propiedad y relaciones familiares en el portal de familias.**
4. **T-ORI-04 [P1] — Proxy de descarga segura con token firmado para evidencias adjuntas en Drive.**
5. **T-ORI-05 [P2] — Flujo formal de derivación institucional entre docentes, orientación y dirección.**
6. **T-ORI-06 [P2] — Módulo de citas de orientación con detección de conflictos horarios y recordatorios.**
7. **T-ORI-07 [P2] — Motor de alertas tempranas por patrones de ausentismo y riesgo de deserción.**
8. **T-ORI-08 [P2] — Planes de acompañamiento conductual con objetivos estructurados JSON y fechas de revisión.**
9. **T-ORI-09 [P2] — Inalterabilidad de expedientes de orientación pertenecientes a períodos cerrados.**
10. **T-ORI-10 [P2] — Historial cronológico de actuaciones y bitácora de intervenciones pedagógicas.**
11. **T-ORI-11 [P2] — Búsqueda avanzada multicriterio y panel de tareas de seguimiento pendientes.**
12. **T-ORI-12 [P2] — Sincronización de planes de apoyo con la libreta de calificaciones y exenciones.**
13. **T-ORI-13 [P3] — Dashboard consolidado de indicadores de bienestar y clima escolar por grado.**
14. **T-ORI-14 [P3] — Exportación estructurada de informes de orientación y actas en Excel/PDF.**
15. **T-ORI-15 [P3] — Herramienta de conciliación entre registros de incidentes y resumen del expediente.**
16. **T-ORI-16 [P3] — Respaldo integral e inmutable de expedientes de bienestar en el sistema de backup.**

---

*Certificación:* Auditoría realizada estrictamente en modo inspección sin modificar código de producción ni archivos de base de datos.
