# INFORME DE AUDITORÍA FUNCIONAL INTEGRAL: FASE 8 (CALIDAD EDUCATIVA Y SUPERVISIÓN DOCENTE)

**Plataforma:** Ecosistema Educativo New Generation Christian Academy
**Fase Auditada:** Fase 8. Calidad educativa y supervisión docente (Ampliación Fase 13 del Plan General)
**Fecha de Auditoría:** Mayo 2024
**Responsable:** Jules

---

## A. RESUMEN EJECUTIVO

La auditoría funcional e integral de **Calidad Educativa y Supervisión Docente** evaluó de punta a punta las capacidades existentes en el repositorio para la evaluación de la práctica pedagógica, la planificación curricular, el seguimiento de contenidos impartidos, la supervisión de entregas académicas y la medición del avance curricular. Se examinaron minuciosamente los archivos de microservicios backend `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`, `backend/exam-service/Code.gs`, `backend/task-service/Code.gs`, así como los controladores frontend `js/teacher.js`, `js/student.js`, `js/ui-common.js` y las vistas `teacher-dashboard.html` y `student-dashboard.html`.

### Estado General de la Implementación
1. **Backend y Persistencia de Supervisión Docente (CE-01, CE-07):** El microservicio `backend/academic-service/Code.gs` cuenta con 7 endpoints operativos (`createTeacherSupervision`, `getTeacherSupervisions`, `updateSupervisionStatus`, `saveSupervisionObservation`, `getSupervisionObservation`, `saveTeacherImprovementPlan`, `getTeacherImprovementPlans`) respaldados por 3 hojas de cálculo en Google Sheets (`SupervisionesDocentes`, `ObservacionesSupervision`, `PlanesMejoraPedagogica`).
2. **Supervisión de Calificaciones y Tareas (CE-08, CE-10):** Existen servicios en `backend/exam-service/Code.gs` (`getGradebookData`, `getStudentAcademicReport`) y en `backend/task-service/Code.gs` para consultar entregas y publicar tareas.
3. **Brechas Principales (CE-03, CE-04, CE-05, CE-06, CE-09, CE-11):**
   - **Falta de Separación Rígida entre Planificado e Impartido (CE-04 / CE-05):** No existe una tabla o bitácora de clase donde el docente marque qué contenidos fueron impartidos realmente vs. los previstos en su planificación, por lo que no se pueden calcular métricas de desviación.
   - **Ausencia de Jornalización y Guías Didácticas (CE-03 / CE-09):** No hay módulos para la distribución temporal de contenidos por semana ni para la revisión/aprobación de guías de estudio.
   - **Inexistencia de Indicadores de Avance Curricular por Asignatura (CE-11):** Falta la fórmula y el dashboard consolidado de porcentaje de cobertura curricular.

---

## B. INVENTARIO DE COMPONENTES EXISTENTES

### 1. Archivos de Código y Vistas
- `backend/academic-service/Code.gs`: Microservicio con las funciones de supervisión de clase, observaciones con rúbricas y planes de mejora pedagógica.
- `backend/exam-service/Code.gs`: Microservicio de evaluaciones, notas oficiales y boletines.
- `backend/task-service/Code.gs`: Microservicio de tareas, guías y aulas virtuales.
- `js/teacher.js`: Controlador frontend que maneja las llamadas a la API de supervisión pedagógica.
- `teacher-dashboard.html`: Aloja los modales de supervisión de clases y calidad docente.

### 2. Hojas de Cálculo (Entidades de Persistencia)
- `SupervisionesDocentes`: `[SupervisionID, DocenteUserId, SupervisorUserId, FechaProgramada, Grado, Seccion, Asignatura, TipoSupervision, RubricaID, Estado, ObservacionesAdmin, FechaCreacion]`
- `ObservacionesSupervision`: `[ObservacionID, SupervisionID, RespuestasRubricaJSON, EvidenciasTexto, FortalezasTexto, OportunidadesMejora, ComentarioDocente, FechaRegistro]`
- `PlanesMejoraPedagogica`: `[PlanID, SupervisionID, DocenteUserId, ObjetivoMejora, AccionesJSON, ResponsableAcompanamiento, FechaInicio, FechaObjetivo, Estado, FechaRevision]`

---

## C. MATRIZ DE COBERTURA FUNCIONAL

| ID | Herramienta / Requisito | Estado | Evidencia Concreta | Deficiencia Encontrada | Dependencias |
|---|---|---|---|---|---|
| **CE-01** | Observaciones de clases | Funcional | `createTeacherSupervision`, `saveSupervisionObservation` en `Code.gs` L1117, L1193 | Falta firma digital de conformidad del docente observado. | Rúbricas, Usuarios |
| **CE-02** | Planificaciones docentes | Parcial | MallaCurricularDist / MaterialesEducativos en `task-service` | Estructurada como carga de archivos de planificaciones sin revisión modular por unidad. | Aulas Virtuales |
| **CE-03** | Jornalizaciones académicas | Ausente | No se encontraron funciones específicas | No hay herramienta para distribuir semanas/sesiones del calendario académico. | Calendario |
| **CE-04** | Registro de contenido impartido | Ausente | Se asume implícito en la clase impartida | No existe bitácora diaria de contenidos desarrollados vs. no impartidos. | Asistencia |
| **CE-05** | Comparación planificación vs impartido | Ausente | Sin motor de comparación | No se pueden calcular desviaciones entre la fecha prevista y la fecha real. | Planificación |
| **CE-06** | Evaluación del desempeño docente | Parcial | Rúbricas en `ObservacionesSupervision` | Solo cubre la observación puntual de clase, sin evaluación integral de 360 grados. | RRHH, Supervisión |
| **CE-07** | Planes de mejora docente | Funcional | `saveTeacherImprovementPlan`, `getTeacherImprovementPlans` en `Code.gs` L1260 | Sin barra de progreso porcentual ni seguimiento de evidencias por objetivo. | Supervisión |
| **CE-08** | Supervisión de entrega de notas | Parcial | `closePeriodGradebook` en `backend/exam-service/Code.gs` | Falta matriz de cumplimiento con semáforo por docente/asignatura para Dirección. | Cuadro de Calificaciones |
| **CE-09** | Supervisión de entrega de guías | Ausente | No se encontraron funciones de revisión | No hay flujo para que Coordinación apruebe las guías académicas antes de publicarlas. | Materiales |
| **CE-10** | Supervisión de tareas | Parcial | `AulasVirtuales` y `EntregasVersiones` en `task-service` | Supervisa las entregas de los alumnos, pero no valida el volumen ni frecuencia de tareas por docente. | Tareas |
| **CE-11** | Indicadores de avance curricular | Ausente | Sin fórmulas ni tableros | Sin porcentaje de cobertura curricular por materia y grado. | Calificaciones |

---

## D. RESULTADOS DE LAS PRUEBAS FUNCIONALES DE AUDITORÍA

| ID Prueba | Objetivo | Precondiciones y Datos | Pasos Ejecutados | Resultado Esperado | Resultado Observado | Estado | Evidencia Concreta |
|---|---|---|---|---|---|---|---|
| **CE-PR-01** | Programar supervisión docente | Docente y supervisor válidos | Ejecutar `createTeacherSupervision` | Supervisión guardada con ID `SUP-xxx` en `SupervisionesDocentes` | Registro exitoso con estado `Planificada` | **Aprobado** | `Code.gs` L1117 |
| **CE-PR-02** | Registrar observación con rúbrica | Supervisión `SUP-01` en estado `Planificada` | Llamar `saveSupervisionObservation` con JSON de rúbrica | Guarda observación y cambia estado de supervisión a `Finalizada` | Actualización de estado y fila agregada en `ObservacionesSupervision` | **Aprobado** | `Code.gs` L1193 |
| **CE-PR-03** | Crear plan de mejora pedagógica | Docente en supervisión `SUP-01` | Llamar `saveTeacherImprovementPlan` | Plan guardado con ID `PLAN-MEJORA-xxx` | Registro exitoso en `PlanesMejoraPedagogica` | **Aprobado** | `Code.gs` L1260 |
| **CE-PR-04** | Consultar observaciones por docente | Observaciones registradas | Ejecutar `getTeacherImprovementPlans` con `docenteUserId: "EMP-101"` | Devuelve arreglo de planes de mejora del docente | Retorna planes filtrados | **Aprobado** | `Code.gs` L1298 |
| **CE-PR-05** | Probar registro de contenido impartido | Fila de clase dada | Buscar endpoint de bitácora de contenido impartido | Retornar estado de cumplimiento del tema | Función inexistente | **Fallido (Ausente)** | No existe en codebase |
| **CE-PR-06** | Comparar planificación vs impartido | Planificación guardada | Probar motor de cálculo de desviación | Desviación en % de temas impartidos | Sin motor de comparación | **Fallido (Ausente)** | No existe en codebase |
| **CE-PR-07** | Probar semáforo de entrega de notas | Período académico cerrado | Consultar entregas pendientes por docente | Mostrar matriz de docentes al día vs morosos | Muestra datos globales sin semáforo | **Parcial** | `exam-service` L200 |
| **CE-PR-08** | Probar supervisión de guías didácticas | Guía subida por docente | Aprobar/Rechazar guía por Coordinación | Estado de guía actualizado a `Aprobada` | Sin flujo de aprobación previa | **Fallido (Ausente)** | `task-service` L150 |
| **CE-PR-09** | Probar cálculo de avance curricular | Asignatura con 10 temas | Ejecutar cálculo de avance curricular | Avance del 80% si 8 temas están impartidos | Sin cálculo ni indicador | **Fallido (Ausente)** | No existe en codebase |
| **CE-PR-10** | Probar actualización de estado de supervisión | Supervisión existente | Llamar `updateSupervisionStatus` con `nuevoEstado: "EnRevision"` | Estado modificado en la hoja | Estado actualizado correctamente | **Aprobado** | `Code.gs` L1175 |

---

## E. SEPARACIÓN RIGUROSA: PLANIFICADO VS. IMPARTIDO

Para garantizar una supervisión docente precisa y sin sesgos, el sistema debe diferenciar formalmente:
1. **Planificado:** Los contenidos, competencias y fechas estimadas registradas en la planificación didáctica aprobada.
2. **Impartido Real:** La bitácora diaria donde el docente confirma qué temas abordó en cada clase presencial o virtual.
3. **Desviación / Brecha Curricular:** La diferencia porcentual entre lo previsto y lo impartido que alimenta los indicadores de avance por asignatura.

Actualmente el repositorio **carece del registro de lo Impartido Real**, imposibilitando el cálculo objetivo del Avance Curricular.

---

## F. HALLAZGOS Y RIESGOS

### 1. Riesgo Crítico
- **Falta de Trazabilidad en el Cumplimiento del Plan de Estudio (CE-04 / CE-11):** Al no existir una bitácora de contenido realmente impartido, la institución no puede certificar ante el Ministerio de Educación / SACE si los programas de estudio se cumplieron al 100%.

### 2. Riesgo Alto
- **Falta de Aprobación Previa de Guías y Materiales (CE-09):** Los docentes pueden publicar materiales directamente a los alumnos sin la validación pedagógica previa de la Coordinación Académica.

### 3. Riesgo Medio
- **Inexistencia de Firma de Conformidad en Observaciones (CE-01):** La observación de clase finaliza sin que el docente firme digitalmente de enterado o ingrese su derecho de réplica.

---

## G. PLAN DE MEJORA Y CONCLUSIÓN DE PREPARACIÓN

### Estado de Preparación
El módulo de Calidad Educativa y Supervisión Docente se encuentra **apto para pasar a la fase de implementación de mejoras**. Su backend de observaciones y planes de mejora es robusto, pero requiere la adición de la bitácora de clase (contenido impartido) y el semáforo de entregas.

### Acciones Prioritarias de Implementation
1. **Crear el Módulo de Bitácora de Clases e Impartición Real (CE-04, CE-05):** Permitir al docente marcar temas completados en cada sesión.
2. **Desarrollar el Semáforo de Supervisión de Entregas (CE-08, CE-10):** Matriz para Dirección/Coordinación para auditar la entrega puntual de notas y tareas por docente.
3. **Implementar el Flujo de Revisión y Aprobación de Guías (CE-09):** Bandeja de aprobación pedagógica de materiales antes de su publicación.
4. **Construir el Tablero de Indicadores de Avance Curricular (CE-11):** Visualización de cobertura curricular porcentual por materia, grado y sección.
