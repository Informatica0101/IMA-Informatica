<!-- Regla del Backlog: Las tareas deben estar ordenadas strictly por su nivel de importancia y severidad en orden descendente, asignando identificadores consecutivos en formato F10-TaskXX. -->
# PENDIENTES - FASE 10: ASISTENCIA, DISCIPLINA, CONVIVENCIA ESCOLAR, ORIENTACIÓN Y DELEGACIÓN DE ASISTENTES

## TAREAS CRÍTICAS (P0 - SEVERIDAD MÁXIMA, SEGURIDAD, PRIVACIDAD Y PRIVILEGIOS DE ASISTENCIA Y DISCIPLINA)

---

### [ ] [F10-Task01] Fortalecer el control de acceso y aislamiento de notas confidenciales de consejería y orientación
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea F10-Task01 (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Privacidad, confidencialidad y protección de datos sensibles)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Expediente del estudiante, casos de seguimiento y permisos por rol
- **Descripción del Alcance:**
  Garantizar el aislamiento estricto de las notas confidenciales y expedientes de consejería/orientación respecto a docentes generales y personal no autorizado.

  Requisitos Funcionales:
  1. Verificar que las notas de seguimiento de consejería sólo sean accesibles para los roles autorizados (`Consejeros`, `Orientación`, `Dirección`).
  2. Bloquear consultas directas a la hoja `CasosSeguimiento` por identificadores manipulados.
  3. Anonimizar o filtrar observaciones confidenciales en reportes generales de asistencia o expediente.
- **Criterios de Aceptación:**
  - Un docente no puede consultar notas confidenciales de consejería de un alumno.
  - Las consultas no autorizadas registran eventos `UNAUTHORIZED_ACCESS_ATTEMPT`.
- **Estado:** [ ] Pendiente

---

## TAREAS DE ALTA PRIORIDAD (P1 - MEJORAS OPERATIVAS Y SEGUIMIENTO INSTITUCIONAL)

---

### [ ] [F10-Task02] Optimizar las notificaciones automáticas de ausencias e incidencias de convivencia a tutores
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea F10-Task02 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Comunicaciones, notificaciones y tutores)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** BandejaNotificaciones, vínculos de RelacionesFamiliares y preferencias de notificación
- **Descripción del Alcance:**
  Asegurar el envío oportuno de notificaciones sobre ausencias no justificadas e incidencias disciplinarias a todos los responsables legales vinculados al alumno.

  Requisitos Funcionales:
  1. Notificar automáticamente a los tutores legales registrados ante ausencias imprevistas.
  2. Garantizar reintentos seguros en caso de fallos del servicio de mensajería sin duplicar mensajes.
- **Criterios de Aceptación:**
  - Las notificaciones llegan únicamente a los tutores legales autorizados.
  - Se registra el estado de entrega en `BandejaNotificaciones`.
- **Estado:** [ ] Pendiente

---

### [ ] [F10-Task03] Ampliar la gestión de delegaciones y trazabilidad de acciones de asistentes administrativos
- **Origen del Hallazgo:** `AUDITORIA_FASE_10_ASISTENCIA_DISCIPLINA_CONVIVENCIA.md` / Tarea F10-Task03 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Delegación de funciones, roles y auditoría de asistentes)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** AsignacionesAmbitosRoles, log de eventos de auditoría
- **Descripción del Alcance:**
  Consolidar el modelo de delegación para asistentes administrativos y académicos, garantizando que cada acción registre la identidad del usuario ejecutor y el cargo delegado.

  Requisitos Funcionales:
  1. Permitir revocar delegaciones de asistentes al cambiar los titulares de cargos.
  2. Bloquear intentos de aprobación de cierres de período o justificantes por parte de asistentes no autorizados.
- **Criterios de Aceptación:**
  - Las operaciones de los asistentes identifican al autor real y al titular delegado.
  - Las funciones restringidas son bloqueadas para el rol Asistente.
- **Estado:** [ ] Pendiente

---
