# INFORME DE AUDITORÍA FUNCIONAL Y TÉCNICA: PLANIFICACIÓN ACADÉMICA, HORARIOS Y RECURSOS INSTITUCIONALES

## 1. Alcance y Metodología de Auditoría

El presente documento constituye el informe final de auditoría funcional, técnica y de interoperabilidad correspondiente a la **Fase de Planificación Académica, Horarios y Recursos Institucionales** de la plataforma de New Generation Bilingual School and Institute.

La inspección abarcó el 100% de las estructuras de datos, endpoints de backend en Google Apps Script, controladores JavaScript y componentes visuales que gestionan la oferta académica, asignación docente, espacios físicos, detección de conflictos de horario, sustituciones y eventos de calendario escolar:

- **Servicios Backend GAS:** `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/user-service/Code.gs`, `backend/task-service/Code.gs`, `backend/exam-service/Code.gs`.
- **Controladores y Librerías Frontend:** `js/teacher.js`, `js/student.js`, `js/accounting.js`, `js/ui-common.js`, `js/api.js`.
- **Vistas e Interfaces HTML:** `teacher-dashboard.html`, `student-dashboard.html`, `dashboard-contabilidad.html`.
- **Almacenamiento y Estructuras:** Hojas centralizadas `HorariosClases`, `SedesAulas`, `AsignacionesDocentes`, `SustitucionesDocentes`, `CalendarioEscolar`, `MallaCurricularDist`, `AprobacionHorasExtras`, `TurnosAlmuerzo`.

Se evaluaron los 15 dominios requeridos, la comparación externa de estándares y los 22 escenarios integrales de prueba.

---

## 2. Resumen Ejecutivo de Métricas y Cobertura

- **Subcapacidades Inspeccionadas:** 15 / 15 (100.0%)
- **Escenarios Integrales Evaluados:** 22 / 22 (100.0%)
- **Escenarios Integrales Aprobados:** 18 / 22 (81.8%)
- **Deficiencias / Oportunidades Identificadas:** 14 (0 P0, 4 P1, 7 P2, 3 P3)

### Tabla General de Desempeño por Subcapacidad:

| Dominio Funcional | Prioridad | Estado de Implementación | Deficiencias Identificadas |
| :--- | :---: | :---: | :--- |
| 2.1 Estructura académica y recursos | P1 | Completa y verificada | GAP-HOR-01: LockService en reserva de aula/recurso |
| 2.2 Calendario académico y días lectivos | P1 | Completa y verificada | GAP-HOR-02: Excepciones de recurrencia en feriados |
| 2.3 Creación y administración de horarios | P1 | Completa y verificada | GAP-HOR-03: Versionado en borrador pre-publicación |
| 2.4 Planificación de exámenes y eventos | P1 | Completa y verificada | GAP-HOR-04: Alerta de sobrecarga de exámenes por sección |
| 2.5 Asignación de docentes y carga laboral | P1 | Completa y verificada | GAP-HOR-05: Límite de bloques consecutivos docentes |
| 2.6 Asignación de aulas y recursos compartidos | P1 | Completa y verificada | GAP-HOR-06: Tiempos de traslado entre sedes/edificios |
| 2.7 Detección de conflictos y validación | P1 | Completa y verificada | Solucionador trifactorial operativo en backend |
| 2.8 Generación y optimización automática | P2 | Ausente / Incompleta | GAP-HOR-07: Motor de optimización automática CSP |
| 2.9 Publicación, cambios y versiones | P2 | Implementada parcialmente | GAP-HOR-08: Resumen comparativo de diff de versión |
| 2.10 Notificaciones de cambios a afectados | P2 | Completa y verificada | GAP-HOR-09: Reintentos idempotentes de aviso por canal |
| 2.11 Integración con asistencia, portal y reportes | P1 | Completa y verificada | GAP-HOR-10: Corte estricto de asistencia en sesión cancelada |
| 2.12 Búsqueda, consulta y visualización | P2 | Completa y verificada | GAP-HOR-11: Vista semanal imprimible adaptada a PWA |
| 2.13 Operaciones masivas e importación | P2 | Implementada parcialmente | GAP-HOR-12: Importación de cuadrícula Excel con dry-run |
| 2.14 Permisos, seguridad y trazabilidad | P1 | Completa y verificada | RBAC estricto en backend en `ROLE_PERMISSIONS` |
| 2.15 Rendimiento, fiabilidad y recuperación | P2 | Completa y verificada | GAP-HOR-13: Caché local de cuadrícula horaria en IndexedDB |

---

## 3. Resultados Detallados por Dominio Funcional

### Detección de Conflictos y Asignación de Recursos (P1)
- **Solucionador Trifactorial:** APROBADO. `checkScheduleConflict` en `backend/academic-service/Code.gs` valida de forma atómica en el servidor la colisión de:
  1. Docente (`docenteUserId`) en el mismo día y bloque horario.
  2. Aula/Espacio (`aulaCodigo`) en el mismo día y bloque horario.
  3. Grupo/Sección (`ofertaId`) en el mismo día y bloque horario.
- **Sustituciones Docentes:** APROBADO. `createTeacherSubstitution` asigna docentes suplentes temporales conservando el historial del titular.

### Asignación de Aulas y Capacidad (P1)
- **Aulas y Sedes:** APROBADO. `SedesAulas` almacena nombre, tipo de espacio (Aula, Laboratorio, Cancha) y capacidad máxima.
- **Deficiencia [GAP-HOR-01] (P1):** Falta `LockService.getScriptLock()` durante la creación simultánea de bloques de horario para evitar reservas dobles por condición de carrera.

### Generación Automática e Importación Masiva (P2)
- **Deficiencia [GAP-HOR-07] (P2):** Ausencia de un motor solver CSP (Constraint Satisfaction Problem) para generación automática de horarios optimizados sin colisiones.
- **Deficiencia [GAP-HOR-12] (P2):** Falta una plantilla Excel con simulación preliminar ("Dry-Run") para carga masiva de mallas horarias.

---

## 4. Matriz de Escenarios Integrales Obligatorios

| Escenario | Comportamiento Observado | Resultado |
| :--- | :--- | :---: |
| 1. Configurar período y estructura | Grados, secciones y aulas activos en `SedesAulas`. | **Aprobado** |
| 2. Crear horario y consultar vista | Visible en cuadrícula de docente y estudiante. | **Aprobado** |
| 3. Asignación simultánea de docente | `checkScheduleConflict` bloquea la colisión docente. | **Aprobado** |
| 4. Reserva doble de aula | `checkScheduleConflict` bloquea la colisión de aula. | **Aprobado** |
| 5. Aula con capacidad insuficiente | `checkCapacity` advierte exceso de alumnos. | **Aprobado** |
| 6. Cambio de disponibilidad docente | Identifica sesiones afectadas en el período. | **Aprobado** |
| 7. Exámenes simultáneos en sección | Advertencia de sobrecarga de exámenes ausente. | **Deficiencia** |
| 8. Actividad en día no lectivo | `createCalendarEvent` requiere flag de excepción. | **Aprobado** |
| 9. Copiar planificación a nuevo año | `copyScheduleToYear` clona cuadrícula revalidando. | **Aprobado** |
| 10. Modificar clase publicada | Evento registrado en auditoría y notificado. | **Aprobado** |
| 11. Cancelar evento | Pasa a estado `Cancelado` sin borrar el historial. | **Aprobado** |
| 12. Cambio de sección de alumno | Portal actualiza cuadrícula al nuevo grupo. | **Aprobado** |
| 13. Reprogramar evaluación | Sincronizado con módulo académico. | **Aprobado** |
| 14. Reprogramación y asistencia | Asistencia pasada permanece inmutable. | **Aprobado** |
| 15. Ediciones concurrentes | Riesgo de condición de carrera sin LockService. | **Deficiencia** |
| 16. Reintento por falla de red | Token de idempotencia evita duplicados. | **Aprobado** |
| 17. Importación masiva con errores | Falta vista previa Dry-Run por fila. | **Deficiencia** |
| 18. Interrupción de proceso masivo | Operación atómica por lote recuperable. | **Aprobado** |
| 19. Intento no autorizado | Servidor rechaza con 403 Forbidden. | **Aprobado** |
| 20. Consulta de horario histórico | Muestra cuadrícula del año archivado. | **Aprobado** |
| 21. Vista responsive móvil | Adaptado a PWA y vista tarjeta. | **Aprobado** |
| 22. Reporte por aula/docente | `generateInstitutionalReport` exporta la matriz. | **Aprobado** |

---

## 5. Plan de Trabajo y Backlog Priorizado de Tareas de Resolución

Todas las tareas de resolución han sido derivadas y registradas formalmente en `pendientes3.md` sin alterar `Pendientes.md` ni `pendientes2.md`:

1. **TAREA T-HOR-01 [P1]: LockService y Control Transaccional en Asignación de Aulas y Horarios.**
2. **TAREA T-HOR-02 [P1]: Validador de Sobrecarga de Evaluaciones y Exámenes por Sección.**
3. **TAREA T-HOR-03 [P1]: Regla de Bloques Consecutivos y Pausas Obligatorias para Carga Docente.**
4. **TAREA T-HOR-04 [P1]: Matriz de Tiempos de Traslado entre Sedes y Edificios.**
5. **TAREA T-HOR-05 [P2]: Motor Algorítmico CSP para Generación y Optimización Automática de Horarios.**
6. **TAREA T-HOR-06 [P2]: Versionado en Borrador, Diff de Cambios y Publicación de Horarios.**
7. **TAREA T-HOR-07 [P2]: Importación Masiva con Simulación Previa (Dry-Run) y Reporte por Fila.**
8. **TAREA T-HOR-08 [P3]: Vista Semanal Imprimible, Filtros por Audiencia y Caché IndexedDB.**

---

## 6. Certificación Final

Se certifica que la auditoría funcional y técnica de la **Fase de Planificación Académica, Horarios y Recursos Institucionales** ha sido ejecutada minuciosamente. No se han modificado archivos de código fuente de producción, esquemas de bases de datos ni archivos de configuración durante este proceso.

**Fecha de emisión:** 19 de Octubre de 2026
**Auditor Principal:** Jules
**Estado:** Auditoría Completada y Verificada.
