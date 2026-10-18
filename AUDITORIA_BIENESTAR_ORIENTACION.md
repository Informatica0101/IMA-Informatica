# INFORME DE AUDITORÍA FUNCIONAL INTEGRAL: FASE 7 (BIENESTAR ESTUDIANTIL Y ORIENTACIÓN)

**Plataforma:** Ecosistema Educativo New Generation Christian Academy
**Fase Auditada:** Fase 7. Bienestar estudiantil y orientación (Ampliación Fase 12 del Plan General)
**Fecha de Auditoría:** Mayo 2024
**Responsable:** Jules

---

## A. RESUMEN EJECUTIVO

La auditoría funcional e integral de **Bienestar Estudiantil y Orientación** evaluó minuciosamente el estado técnico, funcional, de persistencia, de privacidad y de interfaz de usuario de las 12 herramientas/áreas normativas definidas (BS-01 a BS-12). Se inspeccionaron en profundidad los microservicios backend `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`, `backend/exam-service/Code.gs`, `backend/task-service/Code.gs`, así como los controladores frontend `js/teacher.js`, `js/student.js`, `js/ui-common.js` y las vistas `teacher-dashboard.html` y `student-dashboard.html`.

### Estado General de la Implementación
1. **Servicios Backend y Persistencia GAS:** Existen 8 funciones clave en los servicios académicos y de usuario para gestionar casos de seguimiento (`saveAttendanceFollowupCase`, `getAttendanceFollowupCases`, `addCaseFollowUpNote`), planes de acompañamiento (`saveSupportPlan`, `getSupportPlans`), incidencias de asistencia (`saveAttendanceIncident`, `getAttendanceIncidents`) y salidas anticipadas (`recordEarlyDeparture`).
2. **Tablas de Google Sheets Registradas:** Se identificaron 4 tablas principales en la base de datos: `CasosSeguimiento`, `PlanesAcompanamiento`, `IncidenciasAsistencia` y `SalidasAnticipadas`.
3. **Brecha de Integración en el Frontend (UI):** Solamente se encontró una integración parcial en `js/teacher.js` para abrir un modal básico de historial de expediente. **Las 12 herramientas carecen de paneles de interfaz dedicados, interactivos y confidenciales en el frontend.**
4. **Principales Ausencias y Riesgos:**
   - **Falta de Portal Confidencial de Orientación (BS-10 / BS-11):** Las notas confidenciales de orientación no cuentan con un canal privado desacoplado del expediente académico general.
   - **Inexistencia de Motor de Alertas Automáticas (BS-06, BS-07, BS-08):** No existen funciones de fondo ni detonadores que analicen patrones de ausentismo, bajo rendimiento recurrente o riesgo de deserción/abandono escolar.
   - **Ausencia de Flujo de Derivaciones y Citas (BS-03, BS-05, BS-12):** No hay flujos para remisión de casos entre docentes y orientadores, ni programación/actas de reuniones con padres de familia.

---

## B. INVENTARIO DE COMPONENTES EXISTENTES

### 1. Archivos de Código y Vistas
- `backend/academic-service/Code.gs`: Contiene la lógica de backend para casos de seguimiento de asistencia, incidencias y notas cronológicas.
- `backend/user-service/Code.gs`: Contiene la lógica de backend para planes de acompañamiento u orientación.
- `js/teacher.js`: Controlador donde se realiza la llamada API a `getAttendanceFollowupCases` y `getSupportPlans`.
- `teacher-dashboard.html`: Aloja modales genéricos de expediente del estudiante.

### 2. Hojas de Cálculo (Entidades de Persistencia)
- `CasosSeguimiento`: `[CasoID, UserId, MotivoApertura, ResumenAsistencia, ResponsableID, AccionesJSON, Estado, FechaApertura, FechaCierre]`
- `PlanesAcompanamiento`: `[PlanID, UserID, SituacionMeliorar, ObjetivosJSON, ResponsableID, FechaInicio, FechaRevision, Estado]`
- `IncidenciasAsistencia`: `[IncidenciaID, UserId, TipoIncidencia, Descripcion, Fecha, Estado, ReportadoPor]`
- `SalidasAnticipadas`: `[SalidaID, UserId, Fecha, HoraSalida, Motivo, AutorizadoPor, RetiradoPor, FirmaJSON, Estado]`

---

## C. MATRIZ DE COBERTURA FUNCIONAL

| ID | Herramienta / Requisito | Estado | Evidencia Concreta | Deficiencia Encontrada | Dependencias |
|---|---|---|---|---|---|
| **BS-01** | Incidencias de conducta | Parcial | `saveAttendanceIncident`, `IncidenciasAsistencia` en `backend/academic-service/Code.gs` L2346 | Orientado a asistencia; carece de clasificación de gravedad de conducta (leve, grave, muy grave) y testigos. | Expedientes |
| **BS-02** | Seguimiento de casos | Parcial | `saveAttendanceFollowupCase`, `addCaseFollowUpNote` en `Code.gs` L2300, L2417 | Sin interfaz UI para reasignación de orientador, cambio de estados ni filtros por nivel de prioridad. | Usuarios, Roles |
| **BS-03** | Reuniones con responsables | Ausente | Se reutilizan eventos de calendario genéricos | No existe formulario ni acta de reunión de bienestar con firma/conformidad de padres de familia. | Portal Familiar |
| **BS-04** | Planes de apoyo y compromisos | Parcial | `saveSupportPlan`, `getSupportPlans` en `backend/user-service/Code.gs` L1589 | Falta interfaz gráfica para evaluar el porcentaje de avance de los objetivos y firmas de compromiso. | Expedientes |
| **BS-05** | Derivaciones a orientación | Ausente | No se encontraron funciones de derivación | No hay flujo para que un docente remita a un estudiante a Orientación Escolar con acuse de recibo. | Roles RBAC |
| **BS-06** | Alertas de riesgo de abandono | Ausente | No se encontraron funciones de cálculo | Sin motor de detección preventiva de riesgo de deserción escolar por factores combinados. | Asistencia, Notas |
| **BS-07** | Alertas de ausentismo | Defectuoso | `resumenAsistencia` en `CasosSeguimiento` | No analiza patrones ni genera alertas automáticas por N inasistencias injustificadas consecutivas. | Asistencia |
| **BS-08** | Alertas de bajo rendimiento | Ausente | No hay detonadores de bajo rendimiento | No detecta estudiantes con 2 o más asignaturas reprobadas para intervención psicopedagógica. | Calificaciones |
| **BS-09** | Medidas de seguimiento y resultados | Parcial | `AccionesJSON` en `CasosSeguimiento` | Solo permite agregar texto plano; no maneja fechas de revisión futura, indicadores ni responsables. | Orientación |
| **BS-10** | Expediente confidencial de bienestar | Defectuoso | Mezclado en `CasosSeguimiento` | Las notas confidenciales de orientación se almacenan junto con expedientes académicos sin cifrado ni nivel especial. | RBAC, Cifrado |
| **BS-11** | Permisos, privacidad y trazabilidad | Parcial | `checkAuthorization_` en backend | No hay bitácora de auditoría especial para accesos a registros psicopedagógicos sensibles. | Audit Logs |
| **BS-12** | Citas y agenda de orientación | Ausente | No existe registro de citas de orientación | Falta gestor de citas, disponibilidad de orientadores y confirmación con estudiantes/padres. | Calendario |

---

## D. RESULTADOS DE LAS PRUEBAS FUNCIONALES DE AUDITORÍA

| ID Prueba | Objetivo | Precondiciones y Datos | Pasos Ejecutados | Resultado Esperado | Resultado Observado | Estado | Evidencia Concreta |
|---|---|---|---|---|---|---|---|
| **BS-PR-01** | Registrar incidencia de conducta/asistencia | Estudiante existente | Ejecutar `saveAttendanceIncident` con `tipoIncidencia: "Conducta"` | Incidencia guardada en `IncidenciasAsistencia` | Fila registrada con ID `INC-AST-xxx` | **Aprobado** | `Code.gs` L2369 |
| **BS-PR-02** | Crear caso de seguimiento | Datos de caso válidos | Ejecutar `saveAttendanceFollowupCase` | Caso creado en `CasosSeguimiento` con estado `Abierto` | Fila agregada exitosamente | **Aprobado** | `Code.gs` L2417 |
| **BS-PR-03** | Agregar nota cronológica a caso | Caso `CASO-AST-01` abierto | Llamar `addCaseFollowUpNote` con `nota: "Entrevista con estudiante"` | Nota añadida al arreglo `AccionesJSON` | Estructura JSON actualizada correctamente | **Aprobado** | `Code.gs` L2300 |
| **BS-PR-04** | Crear plan de acompañamiento | Estudiante existente | Ejecutar `saveSupportPlan` en `user-service` | Plan guardado en `PlanesAcompanamiento` | Registro guardado con estado `Activo` | **Aprobado** | `User Code.gs` L1613 |
| **BS-PR-05** | Consultar casos por estudiante | Casos registrados | Ejecutar `getAttendanceFollowupCases` para `userId: "EST-101"` | Devuelve únicamente casos del estudiante indicado | Retorna array filtrado correctamente | **Aprobado** | `Code.gs` L2392 |
| **BS-PR-06** | Intentar derivación a orientación | Usuario docente | Buscar función de derivación en backend | Retornar estado o acuse de derivación | Función inexistente | **Fallido (Ausente)** | No existe en codebase |
| **BS-PR-07** | Probar alerta de ausentismo | Estudiante con 5 faltas | Consultar si se genera alerta automática en `CasosSeguimiento` | Generar alerta preventiva automática | No se genera alerta automática | **Fallido (Ausente)** | Sin cron o trigger |
| **BS-PR-08** | Probar privacidad de expediente psicopedagógico | Usuario docente ordinario | Intentar leer expediente confidencial vía `getAttendanceFollowupCases` | Denegar acceso a notas confidenciales privadas | Retorna notas sin filtro especial de confidencialidad | **Defectuoso** | `Code.gs` L2395 |
| **BS-PR-09** | Registrar salida anticipada | Estudiante y tutor válidos | Ejecutar `recordEarlyDeparture` | Fila en `SalidasAnticipadas` | Registro exitoso con ID `SAL-xxx` | **Aprobado** | `Code.gs` L2321 |
| **BS-PR-10** | Probar actualización de plan de apoyo | Plan activo | Guardar plan con nuevo arreglo de `objetivos` | Plan actualizado | Fila insertada nueva (no actualiza por ID) | **Defectuoso** | `User Code.gs` L1627 |

---

## E. INTEGRACIONES VERIFICADAS

1. **Asistencia -> Casos de Seguimiento:** `saveAttendanceFollowupCase` recibe resumen de asistencia y lo vincula al caso.
2. **Evaluación Formativa -> Planes de Acompañamiento:** `saveSupportPlan` en `backend/user-service/Code.gs` comparte la hoja de cálculo con criterios de desarrollo personal y hábitos.
3. **Expediente Único -> Bienestar:** `getAttendanceFollowupCases` se consulta mediante `userId` / `expedienteId` del estudiante.

---

## F. HALLAZGOS Y RIESGOS

### 1. Riesgo Crítico
- **Falta de Aislamiento de Privacidad en Registros Psicopedagógicos (BS-10 / BS-11):** Las notas de seguimiento escritas por Orientación están expuestas a través de consultas generales de casos sin un rol explícito `Orientador` o `Psicólogo`, violando la confidencialidad de datos sensibles de menores.

### 2. Riesgo Alto
- **Sin Motor de Alertas Preventivas (BS-06, BS-07, BS-08):** La plataforma no advierte activamente sobre estudiantes en riesgo de deserción, patrones de ausentismo o reprobación múltiple, dejando la detección 100% dependiente de la memoria del docente.

### 3. Riesgo Medio
- **Planes de Acompañamiento sin Edición de Progreso (BS-04):** `saveSupportPlan` siempre inserta una nueva fila en lugar de actualizar el plan existente, lo que duplica registros y pierde el historial de revisiones.

---

## G. CAPACIDADES REUTILIZABLES

1. **Estructuras de Datos GAS:** Las hojas `CasosSeguimiento`, `PlanesAcompanamiento`, `IncidenciasAsistencia` y `SalidasAnticipadas` otorgan la base de almacenamiento para la expansión de la Fase 7.
2. **Servicios de Backend:** Las funciones `saveAttendanceFollowupCase`, `addCaseFollowUpNote` y `saveSupportPlan` se pueden adaptar para soportar el flujo completo de la interfaz de orientación.

---

## H. PLAN DE MEJORA Y CONCLUSIÓN DE PREPARACIÓN

### Estado de Preparación
El módulo de Bienestar Estudiantil y Orientación requiere la **implementación de la capa de interfaz de usuario (Frontend UI) y el reforzamiento de la privacidad en el Backend**.

### Acciones Prioritarias de Implementación
1. **Crear el Panel de Orientación y Bienestar Estudiantil en `teacher-dashboard.html` (BS-01 a BS-05):** Interfaz para gestión de casos, incidencias de conducta, planes de apoyo y derivaciones.
2. **Desarrollar el Motor de Alertas Preventivas (BS-06 a BS-08):** Algoritmos de detección de ausentismo, bajo rendimiento y riesgo de deserción escolar.
3. **Reforzar la Privacidad y Cifrado de Expedientes Psicopedagógicos (BS-10, BS-11):** Aplicar validación estricta de rol `Orientador`/`Psicólogo` en el backend para la lectura de notas confidenciales.
4. **Construir el Portal de Citas y Compromisos Familiares (BS-03, BS-12):** Gestión de agendamiento de citas de orientación y actas de compromisos con firmas de padres.
