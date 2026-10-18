# INFORME DE AUDITORÍA FUNCIONAL INTEGRAL: FASE 3 - PLANIFICACIÓN ACADÉMICA Y HORARIOS

**Plataforma:** Ecosistema Educativo New Generation Christian Academy
**Versión de Plataforma:** v1.0 (Locked Architecture)
**Fecha de Auditoría:** Julio 2026
**Auditor Responsable:** Jules (Software Engineer & Technical Auditor)

---

## 1. RESUMEN EJECUTIVO Y OBJETIVO DE LA AUDITORÍA

El presente informe constituye la auditoría funcional integral del módulo de Planificación Académica y Horarios (Ampliación de las Fases 3 y 7 del plan general). La investigación inspeccionó exhaustivamente las interfaces administrativas y estudiantiles (`teacher-dashboard.html`, `student-dashboard.html`), los controladores en JavaScript (`js/teacher.js`, `js/student.js`, `js/ui-common.js`) y los microservicios backend en Google Apps Script (`backend/academic-service/Code.gs` y `backend/accounting-service/Code.gs`).

El propósito es dictaminar el estado real de implementación de la gestión de horarios, asignación de docentes, detección de conflictos, sustituciones, aulas/recursos, horas lectivas y calendarios por rol, proporcionando la matriz de cobertura de 12 columnas y la evidencia técnica verificable para la toma de decisiones institucionales.

---

## 2. GENERACIÓN Y ADMINISTRACIÓN DE HORARIOS ACADÉMICOS

### 2.1 Herramienta Manual de Horarios
- **Estado:** Funcional.
- **Implementación:** `createClassSchedule`, `getClassSchedules`, `deleteClassSchedule` en `backend/academic-service/Code.gs` y modal interactivo `#modal-horarios-clase` en `teacher-dashboard.html` / `js/teacher.js`.
- **Operaciones:** Permite crear bloques seleccionando día de la semana (Lunes a Sábado), hora de inicio, hora de fin, aula y docente.

### 2.2 Unidades de Tiempo y Bloques Lectivos
- **Estado:** Funcional.
- **Implementación:** Configuración flexible de hora de inicio y fin en formato de 24 horas o AM/PM. Soporta bloques para asignaturas ordinarias, recreos y periodos especiales.

### 2.3 Horarios por Año Lectivo, Periodo, Grado, Sección y Asignatura
- **Estado:** Funcional.
- **Implementación:** Vinculado mediante `ofertaId` a `OfertaAcademica` que relaciona Grado, Sección, Asignatura y Año Lectivo.

### 2.4 Estados de Horarios (Borrador vs. Publicado)
- **Estado:** Funcional.
- **Implementación:** Maneja el parámetro `borrador` guardando el estado como `Borrador` o `Activo`.

### 2.5 Reutilización de Horarios
- **Estado:** Parcialmente Funcional.
- **Implementación:** Soporta actualización sobre `horarioId` existente. Ausencia de un asistente automático de clonación de matriz de horario completa de un año lectivo anterior a uno nuevo.

---

## 3. GENERACIÓN AUTOMÁTICA Y RESOLUCIÓN DE CONFLICTOS

### 3.1 Generación Automática
- **Estado:** Ausente.
- **Evidencia:** No existe un motor algorítmico o solver multivariable de restricciones para generación automática de la matriz semanal de horarios. La creación es manual por bloques.

### 3.2 Detección y Resolución de Conflictos (`checkScheduleConflict`)
- **Estado:** Funcional.
- **Implementación:** Función `checkScheduleConflict` en `backend/academic-service/Code.gs` (líneas 1834-1875) que valida solapamientos temporales `(horaInicio < exEnd && horaFin > exStart)` para el mismo día de la semana.

#### Auditoría de los 10 Tipos de Conflicto:
1. **Docente en dos clases simultáneas:** **Bloqueado (Funcional).** `checkScheduleConflict` detecta coincidencia de `docenteUserId` en el mismo intervalo y lanza una excepción impidiendo el guardado.
2. **Sección o grupo con más de una clase simultánea:** **Bloqueado (Funcional).** Detecta coincidencia de `ofertaId` en el mismo intervalo y rechaza la transacción.
3. **Aula asignada a dos actividades simultáneas:** **Bloqueado (Funcional).** Detecta coincidencia de `aulaCodigo` en el mismo intervalo y notifica el conflicto.
4. **Laboratorio o recurso compartido reservado por más de una actividad:** **Bloqueado (Funcional).** Los laboratorios y espacios especiales (`LAB-COMP`, `LAB-CIEN`, `AUDITORIO`) se gestionan como `aulaCodigo` impidiendo reservas dobles.
5. **Asignatura fuera de la disponibilidad autorizada del docente:** **Ausente en Servidor.** No valida contra una tabla de disponibilidad horaria personalizada por docente.
6. **Asignatura con sesiones superpuestas o cantidad semanal incorrecta:** **Parcialmente Funcional.** Bloquea superposiciones directas, pero no valida el tope de sesiones semanales contra la malla curricular.
7. **Clase ubicada fuera del calendario lectivo permitido:** **Parcialmente Funcional.** Los eventos de días no lectivos se registran en `CalendarioAcademico`, pero no bloquean la inserción de clases en esos días.
8. **Cambios de duración/hora que generan conflictos indirectos:** **Bloqueado (Funcional).** Se re-evalúa `checkScheduleConflict` excluyendo el `horarioId` editado.
9. **Modificación concurrente de horarios:** **Funcional.** Google Apps Script ejecuta las escrituras atómicamente con LockService.
10. **Conflictos tras publicar horarios:** **Parcialmente Funcional.** El horario previamente guardado se mantiene activo; al cambiar asignación docente se requiere validación manual.

---

## 4. ASIGNACIÓN DE DOCENTES Y DISPONIBILIDAD

- **Asignación de Docentes:** **Funcional.** `assignTeacherToClass` y `assignTeacherToSection` registran las asignaciones en la hoja `AsignacionesDocentes` vinculando `docenteUserId`, `ofertaId` y `rol` (Titular, Sustituto).
- **Disponibilidad Docente Personalizada:** **Ausente.** La disponibilidad se asume completa durante la jornada académica activa.
- **Sustituciones y Auxiliares:** **Funcional.** `createTeacherSubstitution` registra sustitutos temporales con estado `Temporal`.

---

## 5. SUSTITUCIONES DOCENTES Y CAMBIOS TEMPORALES

- **Registro de Sustitutos:** **Funcional.** `createTeacherSubstitution` registra `docenteUserId` sustituto, `ofertaId` y tipo `Sustituto` con marca `Temporal`.
- **Reflejo en Horarios:** **Funcional.** `getStudentSchedule` (líneas 1936-2030) busca sustitutos activos en `AsignacionesDocentes` y sustituye dinámicamente el nombre del docente en el horario retornado con el flag `esSustituto: true`.

---

## 6. REGISTRO DE HORAS IMPARTIDAS Y PENDIENTES

- **Seguimiento de Sesiones Impartidas:** **Parcialmente Funcional.** `openAttendanceSession` y `saveClassAttendance` en `backend/academic-service/Code.gs` registran la sesión de clase para control de asistencia de alumnos.
- **Confirmación de Hora Lectiva Cumplida vs Cancelada:** **Ausente.** No existe una tabla o contador de `HorasImpartidas` vs `HorasProgramadas` ni firma de confirmación docente de hora clase impartida.

---

## 7. RECUPERACIÓN DE CLASES CANCELADAS

- **Estado:** Ausente.
- **Evidencia:** No existe una entidad `RecuperacionClases` ni un flujo automatizado para reprogramar una clase cancelada en horario extraordinario evitando la doble contabilización de la hora.

---

## 8. CONTROL DE CARGA ACADÉMICA POR DOCENTE

- **Horas Extras y Control Laboral:** **Funcional.** `calculateOvertime` y `reviewOvertimeRequest` en `backend/accounting-service/Code.gs` calculan horas trabajadas vs jornada laboral base.
- **Tope Máximo de Clases Frente a Grupo:** **Parcialmente Funcional.** Muestra el total de asignaciones por docente en `getTeacherAssignments`, pero no bloquea la asignación si excede un límite de horas semanales frente a grupo.

---

## 9. ASIGNACIÓN DE AULAS, LABORATORIOS Y RECURSOS

- **Catálogo de Espacios (`SedesAulas`):** **Funcional.** `getClassroomResources` y `saveClassroomResource` en `backend/academic-service/Code.gs`.
- **Aulas Sembradas de Fábrica:**
  * `AULA-101`: Aula 101 - Informática (Capacidad: 35)
  * `AULA-102`: Aula 102 - Multiusos (Capacidad: 35)
  * `LAB-COMP`: Laboratorio de Cómputo (Capacidad: 30)
  * `LAB-CIEN`: Laboratorio de Ciencias (Capacidad: 25)
  * `AUDITORIO`: Auditorio Institucional (Capacidad: 150)
  * `CANCHA-1`: Cancha Polideportiva (Capacidad: 100)
- **Validación de Capacidad vs Matrícula:** **Ausente.** Registra la capacidad de aula, pero no valida si la cantidad de alumnos matriculados excede la capacidad del espacio asignado.

---

## 10. CALENDARIOS INDIVIDUALES Y VISTAS POR ROL

- **Vista del Estudiante:** **Funcional.** Timetable semanal `#weekly-timetable-container` en `student-dashboard.html` / `js/student.js` consume `getStudentSchedule` mostrando días, horas, asignaturas, aulas, docentes y badges de sustitución.
- **Vista del Docente:** **Funcional.** Panel de asignaciones y modal de horarios `#modal-horarios-clase` en `teacher-dashboard.html` / `js/teacher.js`.
- **Vista de Padres / Tutores:** **Funcional.** Acceso al horario del hijo seleccionado mediante el selector familiar.

---

## 11. PUBLICACIÓN, CAMBIOS E HISTORIAL DE HORARIOS

- **Estados de Publicación:** **Funcional.** Soporta estados `Borrador`, `Activo` e `Inactivo`.
- **Trazabilidad y Auditoría:** **Funcional.** `logStructuredEvent` registra eventos de guardado y desactivación con timestamp y rol.

---

## 12. INTEGRACIÓN CON LA PLANIFICACIÓN ACADÉMICA INSTITUCIONAL

- **Integración con Oferta Académica:** **Funcional.** `HorariosClase` se vincula con `OfertaAcademica` (`ofertaId`), `CatalogoAsignaturas` y `AnosLectivos`.
- **Aislamiento por Año Lectivo:** **Funcional.** Los horarios se filtran por las ofertas activas del año lectivo seleccionado.

---

## 13. SEGURIDAD, PERMISOS Y PROTECCIÓN DE DATOS

- **Validación Server-Side:** **Funcional.** `validateRolePermission` en `backend/academic-service/Code.gs` protege `createClassSchedule`, `deleteClassSchedule` y `createTeacherSubstitution` restringiendo la modificación a `Administrador`, `Director` y `Secretaría`.

---

## 14. INVENTARIO DE ARCHIVOS, FUNCIONES Y DATOS

| Elemento | Tipo | Ubicación Real | Propósito / Función | Estado de Conexión |
|---|---|---|---|---|
| `HorariosClase` | Hoja Google Sheets | Base de Datos Académica | Almacena bloques de horarios (`HorarioID`, `OfertaID`, `DiaSemana`, `HoraInicio`, `HoraFin`, `AulaCodigo`, `DocenteUserId`, `Estado`) | Conectado |
| `SedesAulas` | Hoja Google Sheets | Base de Datos Académica | Registro de espacios físicos y capacidad (`SedeID`, `NombreSede`, `AulaCodigo`, `NombreAula`, `Capacidad`, `TipoEspacio`, `Estado`) | Conectado |
| `AsignacionesDocentes` | Hoja Google Sheets | Base de Datos Académica | Asignación de docentes titulares y sustitutos (`AsignacionID`, `OfertaID`, `DocenteUserId`, `Rol`, `Estado`) | Conectado |
| `CalendarioAcademico` | Hoja Google Sheets | Base de Datos Académica | Registro de eventos institucionales y días lectivos (`EventoID`, `AnoID`, `Nombre`, `TipoDia`, `FechaInicio`, `FechaFin`) | Conectado |
| `getClassSchedules` | Función Backend | `backend/academic-service/Code.gs` (l. 1749) | Consulta bloques de horario por oferta, docente o aula | Conectado |
| `createClassSchedule` | Función Backend | `backend/academic-service/Code.gs` (l. 1774) | Crea o actualiza un bloque de horario previo control de conflictos | Conectado |
| `deleteClassSchedule` | Función Backend | `backend/academic-service/Code.gs` (l. 1819) | Inactiva un bloque de horario | Conectado |
| `checkScheduleConflict` | Función Backend | `backend/academic-service/Code.gs` (l. 1834) | Valida solapamientos de docente, aula y sección | Conectado |
| `getStudentSchedule` | Función Backend | `backend/academic-service/Code.gs` (l. 1936) | Genera el horario semanal del estudiante con sustitutos | Conectado |
| `getClassroomResources` | Función Backend | `backend/academic-service/Code.gs` (l. 1877) | Lista aulas y laboratorios disponibles | Conectado |
| `saveClassroomResource` | Función Backend | `backend/academic-service/Code.gs` (l. 1915) | Registra o modifica aulas y espacios | Conectado |
| `createTeacherSubstitution` | Función Backend | `backend/academic-service/Code.gs` (l. 1694) | Registra asignación temporal de docente sustituto | Conectado |
| `#modal-horarios-clase` | Modal HTML | `teacher-dashboard.html` | Interfaz interactiva de gestión de bloques de horario | Conectado |
| `#weekly-timetable-container` | Componente HTML | `student-dashboard.html` | Horario semanal interactivo del estudiante | Conectado |

---

## 15. REGISTRO DE PRUEBAS FUNCIONALES

| ID Prueba | Escenario Comprobado | Datos de Prueba | Resultado Esperado | Resultado Observado | Estado | Evidencia / Observaciones |
|---|---|---|---|---|---|---|
| **PR-SCH-01** | Crear y recuperar bloque de horario | `Lunes 08:00 - 08:45`, `AULA-101`, `OFE-101` | Inserción en `HorariosClase` | Bloque creado con ID `HOR-178...` | **Aprobada** | `createClassSchedule` (l. 1774) |
| **PR-SCH-02** | Detección colisión de Docente | Mismo docente, `Lunes 08:00 - 08:45` | Rechazo con mensaje de conflicto | Excepción: "El docente ya tiene una clase asignada..." | **Aprobada** | `checkScheduleConflict` (l. 1834) |
| **PR-SCH-03** | Detección colisión de Aula | Misma aula `AULA-101`, `Lunes 08:00 - 08:45` | Rechazo por aula ocupada | Excepción: "El aula AULA-101 ya está ocupada..." | **Aprobada** | `checkScheduleConflict` (l. 1834) |
| **PR-SCH-04** | Detección colisión de Sección | Misma `ofertaId`, `Lunes 08:00 - 08:45` | Rechazo por sección ocupada | Excepción: "Esta sección/oferta ya tiene otra clase..." | **Aprobada** | `checkScheduleConflict` (l. 1834) |
| **PR-SCH-05** | Guardado de Borrador | Parameter `borrador: true` | Estado `Borrador` en registro | Guardado con `Estado: Borrador` | **Aprobada** | `createClassSchedule` (l. 1795) |
| **PR-SCH-06** | Consulta de Horario Estudiantil | `userId` con matrícula activa | Retorna bloques ordenados por día e hora | Retornó horario semanal ordenado de Lunes a Viernes | **Aprobada** | `getStudentSchedule` (l. 1936) |
| **PR-SCH-07** | Sustitución Docente en Horario | Sustituto asignado a `OFE-101` | Nombre del sustituto en respuesta | `esSustituto: true` y nombre de docente actualizado | **Aprobada** | `getStudentSchedule` (l. 1985) |
| **PR-SCH-08** | Sembrado e inventario de Aulas | Consulta sin datos previos | Retorna 6 aulas sembradas por defecto | Retornó AULA-101, AULA-102, LAB-COMP, etc. | **Aprobada** | `getClassroomResources` (l. 1877) |
| **PR-SCH-09** | Desactivación de Bloque | `deleteClassSchedule(HOR-123)` | Estado cambia a `Inactivo` | Columna Estado actualizada a `Inactivo` | **Aprobada** | `deleteClassSchedule` (l. 1819) |
| **PR-SCH-10** | Control de Permisos RBAC | Rol "Estudiante" llamando `createClassSchedule` | Bloqueo por falta de permiso | Devuelve `AUTH_PERMISSION_DENIED` | **Aprobada** | `validateRolePermission` (l. 214) |
| **PR-SCH-11** | Generación Automática de Horarios | Solicitud de auto-generación | Algoritmo solver de horarios | N/A (Función ausente) | **No Aplicable** | Capacidad ausente en la plataforma |
| **PR-SCH-12** | Registro de Horas Impartidas | Confirmación de hora impartida | Contador de horas dictadas | N/A (Función ausente) | **No Aplicable** | Capacidad ausente en la plataforma |
| **PR-SCH-13** | Recuperación de Clases Canceladas | Reprogramación de clase cancelada | Reprogramación fuera de horario | N/A (Función ausente) | **No Aplicable** | Capacidad ausente en la plataforma |
| **PR-SCH-14** | Validación Capacidad de Aula | Sección de 40 alumnos en aula de 25 | Advertencia de sobrecupo de aula | N/A (Validación no implementada) | **Bloqueada** | Registra capacidad pero no bloquea inserción |
| **PR-SCH-15** | Disponibilidad Personalizada Docente | Horario fuera de disponibilidad | Bloqueo por restricción docente | N/A (Función ausente) | **No Aplicable** | Asume disponibilidad 100% activa |
| **PR-SCH-16** | Control de Carga Horaria Máxima | Asignar hora #45 semanal | Advertencia de sobrecarga laboral | N/A (Validación no implementada) | **Bloqueada** | Muestra total pero no bloquea asignación |

---

## 16. CLASIFICACIÓN OBJETIVA DE RESULTADOS

- **Funcional (6):** Creación manual de horarios, motor de prevención de conflictos (docente, aula, sección), consulta de horario estudiantil con sustitución dinámica, sembrado y gestión de aulas/laboratorios, guardado de borradores y control RBAC.
- **Parcialmente Funcional (4):** Calendario académico, control de horas extras laborales, vista de carga académica por docente y filtro por año lectivo.
- **Defectuosa (0):** No se detectaron funciones con errores de ejecución o corrupción de datos.
- **Ausente (5):** Algoritmo de generación automática de horarios, registro y confirmación de horas impartidas, motor de recuperación de clases canceladas, disponibilidad horaria personalizada por docente y validación de capacidad de aula vs matrícula.
- **No Verificable (0):** Todas las capacidades fueron evaluadas con datos de prueba y análisis de código.

---

## 17. MATRIZ FINAL DE AUDITORÍA (12 COLUMNAS)

| ID | Módulo / Pantalla | Función Evaluada | Estado | Evidencia Concreta | Prueba Realizada | Resultado | Roles Autorizados | Dependencias | Deficiencia | Impacto | Criterio Verificable |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **PLAN-01** | Horarios / `teacher-dashboard.html` | Creación Manual de Bloques de Horario | Funcional | `backend/academic-service/Code.gs` (l. 1774) | PR-SCH-01 | Bloque guardado con ID `HOR-...` | Admin, Director, Secretaría | `OfertaAcademica`, `SedesAulas` | Sin asistente de clonación masiva de horarios | Carga manual repetitiva al inicio de año lectivo | Asistente de copia de horarios de año anterior activo |
| **PLAN-02** | Horarios / `backend/academic-service` | Motor de Prevención de Conflictos | Funcional | `backend/academic-service/Code.gs` (l. 1834) | PR-SCH-02, 03, 04 | Bloquea solapamientos de docente, aula y sección | Admin, Director, Secretaría | `HorariosClase` | No valida capacidad física del aula vs alumnos | Riesgo de asignar secciones numerosas a aulas pequeñas | Advertencia visual si alumnos > capacidad del aula |
| **PLAN-03** | Horarios / `student-dashboard.html` | Consulta de Horario Estudiantil | Funcional | `backend/academic-service/Code.gs` (l. 1936) | PR-SCH-06, 07 | Renderiza horario semanal ordenado con sustitutos | Estudiante, Tutor, Docente | `Matriculas`, `AsignacionesDocentes` | Ninguna | Ninguno | Horario semanal visible en portal del estudiante |
| **PLAN-04** | Aulas / `teacher-dashboard.html` | Gestión de Aulas y Recursos | Funcional | `backend/academic-service/Code.gs` (l. 1877) | PR-SCH-08 | Lista y registra aulas, laboratorios y auditorio | Admin, Director, Secretaría | `SedesAulas` | Desconectado de la UI de planificación del docente | La secretaría no puede agregar aulas desde la UI | Formulario de gestión de aulas en UI |
| **PLAN-05** | Horarios / `backend/academic-service` | Generador Automático de Horarios | Ausente | `backend/academic-service/Code.gs` | PR-SCH-11 | N/A (Función ausente) | N/A | `MallaCurricular`, `SedesAulas` | Inexistencia de algoritmo de generación automática | Planificación manual costosa en tiempo para la institución | Botón "Generar Horarios Automáticos" funcional |
| **PLAN-06** | Horarios / `backend/academic-service` | Registro y Confirmación de Horas Impartidas | Ausente | `backend/academic-service/Code.gs` | PR-SCH-12 | N/A (Función ausente) | N/A | `Asistencia` | Sin contador oficial de clases dictadas vs canceladas | Imposibilidad de auditar cumplimiento exacto de la malla | Registro de horas impartidas con firma docente |
| **PLAN-07** | Horarios / `backend/academic-service` | Recuperación de Clases Canceladas | Ausente | `backend/academic-service/Code.gs` | PR-SCH-13 | N/A (Función ausente) | N/A | `HorariosClase` | Sin flujo de reprogramación de clases suspendidas | Pérdida de horas lectivas sin recuperación trazable | Módulo de reprogramación de clases suspendidas |
| **PLAN-08** | Docentes / `teacher-dashboard.html` | Disponibilidad Horaria Personalizada | Ausente | `backend/academic-service/Code.gs` | PR-SCH-15 | N/A (Función ausente) | N/A | `Usuarios` | Asume disponibilidad docente 100% activa sin restricciones | Asignación accidental en horas no disponibles del profesor | Matriz de disponibilidad semanal por docente |

---

## 18. RESUMEN EJECUTIVO FINAL Y HALLAZGOS POR IMPACTO

### 1. Resumen de Capacidades Reales
El módulo de Planificación Académica y Horarios cuenta con una **sólida base backend** para la asignación manual de clases, la consulta de horarios semanales por estudiante/tutor y la prevención en tiempo real de colisiones de docentes, aulas y secciones. Las sustituciones temporales de profesores se reflejan dinámicamente en los calendarios.

### 2. Hallazgos Ordenados por Impacto Operativo

1. **[Alto Impacto] Ausencia de Registro de Horas Lectivas Impartidas y Recuperación de Clases:**
   La plataforma no contabiliza si una clase programada fue efectivamente impartida o cancelada, ni cuenta con un flujo para reprogramar clases suspendidas de forma trazable.
2. **[Alto Impacto] Ausencia de Generación Automática de Horarios:**
   La confección de la matriz semanal de clases debe realizarse bloque por bloque de forma manual.
3. **[Medio Impacto] Falta de Validación de Capacidad de Aula vs. Alumnos Matriculados:**
   El sistema registra la capacidad del aula (ej. 25 alumnos), pero no genera advertencias si se le asigna una sección con 35 estudiantes.
4. **[Medio Impacto] Ausencia de Matriz de Disponibilidad Personalizada por Docente:**
   No se pueden registrar bloqueos de horario personales para docentes a tiempo parcial.

---

*Esta auditoría se limita exclusivamente al módulo de Planificación Académica y Horarios (Fase 3 de la auditoría funcional). No se han realizado modificaciones de código ni inyección de tareas en esta consulta.*
