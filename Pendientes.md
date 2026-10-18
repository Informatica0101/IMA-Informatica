## TAREAS PENDIENTES

### [REQ-EXP-001] Interfaz de Usuario e Integración del Expediente Digital Unificado del Estudiante
- **Origen del Hallazgo:** Auditoría.txt (Mon Jul 6 2026 - Fase 1: Auditoría Funcional Integral del Registro y Expediente de Estudiantes)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `teacher-dashboard.html`, `student-dashboard.html`, `js/teacher.js`, `js/student.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** `ExpedientesEstudiantes`, `SolicitudesAdmision`, `ResponsablesTutores`, `RelacionesEstudianteTutor`, `DocumentosEstudiante`, `MovimientosEstudiante`, `getStudentFile`, `updateStudentFile`, `findDuplicateStudents`, `mergeStudentFiles`, `saveStudentGuardian`, `uploadStudentDocument`
- **Descripción del Alcance:**
  1. Diseñar e implementar en `teacher-dashboard.html` y `js/teacher.js` el componente modal interactivo `#modal-student-file` (Expediente Digital Unificado) con las siguientes 5 pestañas funcionales:
     a) Ficha de Datos Personales (consulta y edición de fecha de nacimiento, nacionalidad, dirección, foto, observaciones y estado).
     b) Tutores y Responsables Legales (listado, vinculación, desvinculación y asignación de atributos como representante legal, contacto de emergencia, responsable financiero, autorización pick-up y acceso a portal).
     c) Expediente Documental (subida de archivos PDF e imágenes con almacenamiento directo en Google Drive Folder `New Generation/Documentos_Estudiantes`, generación de URLs de visualización directa y revisión de estado).
     d) Historial Académico y Movimientos (línea de tiempo unificada con fechas de creación, matrículas, cambios de sección, retiros, traslados y reingresos).
     e) Detección y Fusión de Duplicados (herramienta de búsqueda automática por ID/email/nombre e inicio del flujo de fusión auditada que re-vincula documentos y movimientos al expediente principal).
  2. Conectar el campo de búsqueda `#student-search` en `teacher-dashboard.html` para permitir abrir directamente el expediente digital completo mediante `getStudentFile` al seleccionar un estudiante de los resultados.
  3. Asegurar que las actualizaciones parciales conserven los campos no modificados y respeten la matriz RBAC del servidor.
- **Criterios de Aceptación:**
  - Modal `#modal-student-file` operativo en `teacher-dashboard.html` y manejado por `js/teacher.js`.
  - Invocación exitosa de los 23 endpoints de la Fase 4 sin duplicar funciones backend.
  - Subida de documentos adjuntos directo a Google Drive y generación de enlaces de vista previa.
  - Fusión de expediente re-vinculando documentos/movimientos y marcando expediente origen como "Fusionado".
  - Búsqueda `#student-search` integrada con apertura de expediente digital.
- **Estado:** [ ] Pendiente

### [REQ-DASH-ADAPT-001] Adaptación Integral de Dashboards, Menús por Rol, Configuración Académica y Catálogo de Herramientas
- **Origen del Hallazgo:** Auditoria.txt (Mon Jul 6 2026 - Fase Adaptación Integral de Dashboards y Menús)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `index.html`, `student-dashboard.html`, `teacher-dashboard.html`, `dashboard-contabilidad.html`, `dashboard-recursos-humanos.html`, `dashboard-tienda.html`, `dashboard-cafeteria.html`, `exam.html`, `forgot-password.html`, `reset-password.html`, `results.html`, `js/ui-common.js`, `js/teacher.js`, `js/student.js`, `js/accounting.js`, `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** `ConfiguracionSistema`, `ConfiguracionDashboard`, `ROLE_PERMISSIONS`, `history.pushState`, `popstate`, `sw.js`
- **Descripción del Alcance:**
  1. Corregir títulos visibles: «Área de Contaduría» en contabilidad, «Secretaría» como título principal, y remover «Área de informática» de la UI general.
  2. Rediseñar el botón de reporte de problemas `#btn-global-report-issue` a un icono discreto sin texto visible con tooltip accesibilidad.
  3. Condicionar la aparición del carrusel de cafetería en `index.html` a la verificación de encargado activo + productos disponibles.
  4. Configuración editable e independiente de nombres para «Tiendita Escolar» y «Cafetería» persistida en backend.
  5. Implementar sistema de menús lateral de escritorio acordeón (auto-cierre de secciones hermanas) y menú hamburguesa móvil/PWA equivalente, conservando el menú inferior PWA.
  6. Prevenir bucles infinitos en el historial del navegador (`pushState` / `popstate`) y retroceso de Android.
  7. Configuración académica global (grados/niveles adaptables) y resolución de equivalencias de secciones (1/A, 2/B, 3/C) con identificadores estables.
  8. Auditar e integrar las 18 secciones del catálogo de referencia, construyendo la matriz completa de auditoría y la lista de funciones faltantes/parciales.
- **Criterios de Aceptación:**
  - Títulos corregidos en todas las vistas.
  - Botón de reporte de problemas discreto (solo icono + tooltip).
  - Carrusel de cafetería oculto automáticamente cuando falta encargado o productos.
  - Nombres de Tiendita Escolar y Cafetería editables y persistentes.
  - Panel lateral acordeón y menú hamburguesa funcional por rol sin afectar la barra PWA inferior.
  - Botón de retroceso opera sin ciclos ni bucles.
  - Equivalencias 1/A, 2/B, 3/C operativas en matrícula y reportes.
  - Matriz de auditoría de las 18 secciones del catálogo completada en el entregable.
- **Estado:** [ ] En Ejecución

## TAREAS PENDIENTES DE REVISIÓN

### [REQ-FAM-001] Gestión Familiar Multiestudiante y Sistema de Gráficas e Indicadores Configurables
- **Origen del Hallazgo:** Auditoria.txt (Mon Jul 6 2026 - Nueva Fase de Gestión Familiar Multiestudiante y Gráficas Configurables)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `student-dashboard.html`, `teacher-dashboard.html`, `dashboard-contabilidad.html`, `js/student.js`, `js/teacher.js`, `js/accounting.js`, `js/ui-common.js`, `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** `ResponsablesTutores`, `RelacionesEstudianteTutor`, `PagosAbonos`, `TarifasPlanPago`, `CargosEstudiante`, `Chart.js`, `student-radar-chart`
- **Descripción del Alcance:**
  1. Permitir la gestión unificada de familias con múltiples estudiantes desde el Portal Familiar (`js/student.js`, `student-dashboard.html`). Selector de hijos visible con fotos, grado, sección, estado de matrícula e indicadores de pendientes.
  2. Implementar la Vista Familiar Consolidada (resumen general con recuento de tareas, saldos, notas, solicitudes y becas) manteniendo el origen individual de cada dato.
  3. Desglosar la gestión económica familiar: resumen consolidado, estados de cuenta individuales por estudiante, distribución explícita de pagos conjuntos sin duplicar saldos y consulta/solicitud de becas y descuentos familiares e individuales.
  4. Clasificar y separar las 5 categorías de gráficas (A. Minijuegos, B. Desempeño Académico, C. Participación, D. Asistencia y Comportamiento, E. Informes Administrativos).
  5. Preservar la funcionalidad del gráfico radial existente sin reemplazarlo ni duplicarlo.
  6. Crear un componente de gráficas e indicadores configurables reutilizable (`window.renderUniversalConfigurableChart`) con opciones de personalización de tipo, colores, escalas, vistas tabulares alternativas y controles responsive para móviles/escritorio.
  7. Aplicar permisos por rol (RBAC) en servidor y cliente para asegurar el aislamiento de datos.
- **Criterios de Aceptación:**
  - Selector de estudiante y resumen consolidado familiar operando sin mezclar expedientes individuales.
  - Pagos conjuntos multihijo distribuidos explícitamente sin duplicar importes en los estados de cuenta.
  - Becas y descuentos diferenciados por alcance (individual vs. familiar).
  - Componente de gráficas dinámicas con tipos múltiples (barras, líneas, áreas, sectores, radial), personalización de colores y alternativas tabulares.
  - Separación estricta entre estadísticas de minijuegos y notas oficiales.
  - Gráfico radial conservado e integrado.
  - Permisos por rol validados en backend.
- **Estado:** [/] Pendiente de Revisión

### [REQ-LEGAL-001] Términos y Condiciones de Uso v1.0 y Modal de Aceptación Obligatoria al Iniciar Sesión
- **Origen del Hallazgo:** Auditoria.txt (Mon Jul 6 2026 - Módulo de Términos y Condiciones de Uso)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `politica-de-uso.html`, `js/ui-common.js`, `js/auth.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `AceptacionesPoliticas`, `acceptLegalDocument`, `modal-first-login-terms`
- **Descripción del Alcance:**
  1. Actualizar `politica-de-uso.html` con los 17 apartados legales completos de Términos y Condiciones de Uso de la Plataforma de New Generation Bilingual School and Institute y JyP Solutions (Versión 1.0).
  2. Implementar `#modal-first-login-terms` en `js/ui-common.js` que se muestra en el primer inicio de sesión o carga de dashboard si no existe evidencia de aceptación de la Versión 1.0.
  3. Incluir el enlace interactivo hacia `politica-de-uso.html`, permitiendo regresar al modal y cerrándose **únicamente** al presionar el botón "Aceptar Términos".
  4. Registrar la aceptación con timestamp, versión e IP en la hoja `AceptacionesPoliticas` del servidor y en `localStorage`.
- **Criterios de Aceptación:**
  - `politica-de-uso.html` contiene el texto legal completo estructurado.
  - El modal de primer inicio de sesión aparece de forma preventiva y no se puede cerrar sin presionar "Aceptar Términos".
  - El enlace a los términos abre la lectura completa y permite retornar.
  - La aceptación se registra en `AceptacionesPoliticas` mediante `acceptLegalDocument`.
- **Estado:** [/] Pendiente de Revisión

### [REQ-SCHED-001] Configuración del Año Escolar, Jornadas, Horarios, Control Laboral, Horas Extras y Actividades Institucionales
- **Origen del Hallazgo:** Auditoria.txt (Mon Jul 6 2026 - Nueva Fase de Configuración del Año Escolar, Horarios, Control Laboral y Actividades)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/user-service/Code.gs`, `js/teacher.js`, `js/student.js`, `js/ui-common.js`, `teacher-dashboard.html`, `student-dashboard.html`, `dashboard-recursos-humanos.html`
- **Dependencias Expuestas:** `AnosLectivos`, `CalendarioAcademico`, `HorariosClase`, `HorariosLaborales`, `MarcacionesPersonal`, `ROLE_PERMISSIONS`
- **Descripción del Alcance:**
  1. Configuración del Año Escolar con soporte para modelos de calendario (Sistema Americano, Año Calendario, Personalizado), fechas clave y validaciones de solapamiento.
  2. Gestión de Jornadas Académicas (Matutina, Vespertina, Nocturna, A Distancia, Mixta), horas-clase, recreos, almuerzos y transiciones.
  3. Malla Curricular con distribución semanal/diaria, bloques consecutivos y generador/editor de horarios con detección de colisiones de docentes/aulas/secciones.
  4. Horarios Laborales del Personal por departamento/empleado, franjas de almuerzo escalonadas, marcaciones de entrada/salida y motor de cálculo y aprobación de Horas Extras con fechas de corte de nómina.
  5. Programación de Actividades Institucionales con estrategias de afectación de clases (Desplazar, Reducir, Reemplazar, Reprogramar) y Actividades Extracurriculares con gestión de supervisores, estados y evidencias digitales en Drive.
  6. Integración del Calendario Institucional Unificado con filtrado por rol y permisos.
- **Criterios de Aceptación:**
  - Tipos de año escolar configurables con fechas clave validadas.
  - Jornadas múltiples con tiempos de clase, recreos y almuerzos parametrizados.
  - Generador/editor de horarios funcional con validación de conflictos de docentes y aulas.
  - Horarios laborales, marcaciones y flujo de aprobación de horas extras con corte de nómina.
  - Actividades institucionales y extracurriculares con afectación explícita de clases y evidencias.
  - Calendario unificado filtrado por rol en todos los dashboards.
- **Estado:** [/] Pendiente de Revisión

### [REQ-DESIGN-001] Renovación Visual Institucional, Personalización Global, Sistema de Tickets y Control de Versiones v1.0
- **Origen del Hallazgo:** Auditoria.txt (Mon Jul 6 2026 - Nueva Fase de Diseño, Personalización, Tickets y Versionado)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `css/style.css`, `js/ui-common.js`, `js/teacher.js`, `js/student.js`, `js/api.js`, `backend/user-service/Code.gs`, `index.html`, `login.html`, `teacher-dashboard.html`, `student-dashboard.html`, `README.md`
- **Dependencias Expuestas:** `ConfiguracionSistema`, `ROLE_PERMISSIONS`, `doPost`, `modal-dashboard-settings`, `style.css`
- **Descripción del Alcance:**
  1. Renovar el estilo visual con un sistema de diseño sobrio, profesional, accesible (WCAG 2.2 AA) y libre de tonos neón/infantiles.
  2. Implementar gestión de paletas institucionales con flujo de propuesta por Administrador y aprobación por Dirección antes de publicación global.
  3. Formatear la presentación del logotipo institucional en el inicio de sesión con fondo transparente, proporciones intactas y sombra sutil.
  4. Crear el botón global de reporte de problemas, modal de envío con validación >= 20 caracteres significativos y recopilación contextual automática.
  5. Implementar el módulo de tickets (`TICK-XXXXXX`) con seguimiento de estados ("Mis Reportes" para cliente, panel de gestión exclusiva con notas internas para Administrador/Desarrollador).
  6. Fijar la versión global en 1.0 con la regla estricta de incremento únicamente por solicitud explícita.
  7. Actualizar `README.md` con las funciones verificadas y especificaciones reales.
- **Criterios de Aceptación:**
  - Paletas con previsualización y aprobación por Dirección publicadas globalmente.
  - Logotipo de inicio de sesión con estilo transparente y sutil.
  - Formulario de reporte disponible globalmente con validación de 20 caracteres mínimos.
  - Tickets únicos con respuestas, notas internas y máquina de estados funcional en servidor.
  - Versión global confirmada en 1.0.
  - Permisos RBAC validados en servidor.
- **Estado:** [/] Pendiente de Revisión

### [UNIF-001] Unificación de Configuración Académica
- **Origen del Hallazgo:** Nueva Tarea Adicional.
- **Severidad:** Crítico.
- **Archivos Involucrados:** backend/user-service/Code.gs, js/config.js
- **Descripción:** Migrar ConfiguracionAcademica a estructura granular, eliminando redundancias con AsignaturasPorParcial.
- **Estado:** [X] Completada

### [FIX-001] Corrección DataError y Persistencia profesorId
- **Estado:** [X] Completada

### [HIST-001] Reestructuración de Historial Académico
- **Estado:** [X] Completada

### [AUTH-001] Filtrado de Asignaturas por Grado
- **Estado:** [X] Completada

### [PROF-001] Personalización por Docente e Integridad
- **Estado:** [X] Completada

### [NAV-001] Flujo de Navegación Contextual Docente
- **Estado:** [X] Completada

---

## TAREAS PENDIENTES (v7.8.6 Remediation)

### [CORS-001] Estabilización de Conexión (Red/CORS)
- **Origen del Hallazgo:** Auditoria.txt (Revisión v7.8.6)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `js/api.js`
- **Descripción del Alcance:** Cambiar Content-Type a 'text/plain' para evitar Preflight requests y bloqueos de CORS.
- **Criterios de Aceptación:** Las peticiones a USER/getAcademicConfig no deben fallar con 'TypeError: Failed to fetch'.
- **Estado:** [X] Completada

### [LOOP-001] Eliminación de Bucle Infinito en Dashboard
- **Origen del Hallazgo:** Auditoria.txt (Revisión v7.8.6)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `js/student.js`
- **Descripción del Alcance:** Implementar flag `isFetchingActivities` y remover llamada recursiva a `syncAcademicScope`.
- **Criterios de Aceptación:** La página no debe recargarse infinitamente ni saturar el microservicio.
- **Estado:** [X] Completada

### [UI-001] Eliminación de Navegación Residual por Pestañas
- **Origen del Hallazgo:** Auditoria.txt (Revisión v7.8.6)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `student-dashboard.html`, `js/student.js`
- **Descripción del Alcance:** Remover `#subject-tabs-container` y lógica de tabs. Corregir filtrado por parcial activo.
- **Criterios de Aceptación:** Navegación exclusiva por tarjetas expandibles. Solo se muestran asignaturas del parcial vigente.
- **Estado:** [X] Completada

### [DB-001] Normalización Tabular 9/8 Columnas
- **Origen del Hallazgo:** Auditoria.txt (Revisión v7.8.6)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Descripción del Alcance:** Asegurar estructura de 9 columnas en `ConfiguracionAcademica` y 8 en `HistorialAcademico`. Producto cartesiano de temas.
- **Criterios de Aceptación:** Persistencia sin JSON. Columnas coinciden exactamente con el estándar definido.
- **Estado:** [X] Completada

---

## TAREAS PENDIENTES (Afinamiento Configuración v7.8.7)

### [CONF-001] Desacoplamiento Parcial/Unidad y Lógica Upsert
- **Origen del Hallazgo:** Auditoria.txt (v7.8.7)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Descripción del Alcance:**
  1. Modificar `updateAcademicConfig` para tratar Parcial y Unidad como conceptos independientes.
  2. Implementar búsqueda por contexto (Parcial, Grado, Sección, Asignatura, Tema, Profesor) antes de crear registro.
  3. Si existe, actualizar fila; si no, crear nueva.
- **Criterios de Aceptación:** No se generan registros duplicados. Las unidades corresponden a la planificación real.
- **Estado:** [X] Completada

### [DATE-001] Ciclo de Vida Dinámico de Columna Fecha
- **Origen del Hallazgo:** Auditoria.txt (v7.8.7)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Descripción del Alcance:** Implementar lógica de fecha: nuevo parcial = mes actual; al configurar siguiente parcial = actualizar anterior con rango (inicio - fin).
- **Criterios de Aceptación:** Las filas reflejan periodos de vigencia automáticos según el mes de configuración.
- **Estado:** [X] Completada

### [NAV-002] Navegación Docente Basada en Configuración Vigente
- **Origen del Hallazgo:** Auditoria.txt (v7.8.7)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/teacher.js`
- **Descripción del Alcance:** Restringir `renderGrados`, `renderSecciones` y `renderAsignaturas` para que utilicen exclusivamente `window.GLOBAL_SCOPE`.
- **Criterios de Aceptación:** Solo aparecen los grados y materias configurados por el docente para el periodo activo.
- **Estado:** [X] Completada

### [STUD-002] Actualización de Tarjeta Estudiante e Interfaz
- **Origen del Hallazgo:** Auditoria.txt (v7.8.7)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/student.js`, `student-dashboard.html`
- **Descripción del Alcance:**
  1. Agregar Email y Teléfono (con link WhatsApp) a `renderStudentHeader`.
  2. Reemplazar texto "Vista Unificada de Asignaturas" por instrucción de selección.
  3. Asegurar filtrado estricto por parcial vigente.
- **Criterios de Aceptación:** La tarjeta muestra datos de contacto funcionales. El dashboard muestra la instrucción correcta.
- **Estado:** [X] Completada

---

## TAREAS PENDIENTES DE REVISIÓN (v7.8.7 POST-AUDIT)

### [POST-001] Validación de Rango de Fecha en Historial
- **Severidad:** Observación.
- **Descripción:** Verificar tras el próximo cambio de parcial real si el 'HistorialAcademico' también debe recibir la actualización de rango de fecha o si permanece como registro de hito (instantánea). Actualmente se guarda el mes de registro.
- **Estado:** [X] Completada

### [MOD-001] Modularización de Microservicio Académico
- **Origen del Hallazgo:** Nueva Revisión Post-Commit.
- **Severidad:** Alto.
- **Descripción:** Separación de lógica académica del microservicio de usuarios.
- **Estado:** [X] Completada

### [FIX-002] Resolución de Duplicidad en Historial
- **Origen del Hallazgo:** Incidencia crítica reportada.
- **Descripción:** Normalización estricta en validación de 5 factores.
- **Estado:** [X] Completada

### [FIX-003] Reparación de Filtrado de Asignaturas (matchParcial)
- **Origen del Hallazgo:** Error de consola detectado en auditoría.
- **Descripción:** Definición de variable matchParcial en student.js.
- **Estado:** [X] Completada

---

## REQUERIMIENTOS DE EXPANSIÓN Y DESARROLLO (New Generation Christian Academy)

### [REQ-EXP-001] Adopción de Metodología de Desarrollo y Auditoría (Sección 2)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 2).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `METODOLOGIA_DESARROLLO.md`, `Auditoria.txt`, `ChangesLogs.txt`, `Pendientes.md`, `MapaDependencias.md`
- **Dependencias Expuestas:** Todas las dependencias del proyecto.
- **Descripción del Alcance:** Establecer y cumplir estrictamente el procedimiento obligatorio de 8 fases para la organización, ejecución, verificación y documentación de cambios.
- **Criterios de Aceptación:** Toda modificación cumple el flujo de auditoría previo, respaldo, registro en auditoría/changeslogs y verificación funcional.
- **Estado:** [X] Completada

### [REQ-EXP-002] Auditoría de Hoja de Cálculo de Referencia e Inspección de Datos (Sección 3)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 3).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/Spreadsheet/AREA DE INFORMATICA IMA.xlsx`, `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `ConfiguracionAcademica`, `HistorialAcademico`, `Tareas`, `Entregas`
- **Descripción del Alcance:** Auditar la estructura de tablas de referencia, normalizar entidades y establecer claves primarias e índices de relación de datos.
- **Criterios de Aceptación:** Esquema tabular de 9 columnas en `ConfiguracionAcademica` y 8 en `HistorialAcademico` operando sin redundancias JSON.
- **Estado:** [X] Completada

### [REQ-EXP-003] Estructura Académica Jerárquica y Separación Estricta (Sección 6)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 6).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `js/teacher.js`, `js/student.js`, `js/config.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** `GLOBAL_SCOPE`, `GranularConfig`, `SUBJECT_GRADE_MAP`
- **Descripción del Alcance:** Enforzar la jerarquía Nivel -> Grado -> Sección -> Asignatura -> Asignación Docente. Impedir mezclas entre secciones y asignaturas de distintos grados.
- **Criterios de Aceptación:** Navegación en cascada obligatoria, salto automático en sección única, validación de unicidad de 4 factores en backend.
- **Estado:** [X] Completada

### [REQ-EXP-004] Consolidación del Módulo Académico, Evaluaciones y Tareas (Sección 7)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 7).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/teacher.js`, `js/student.js`, `backend/task-service/Code.gs`, `backend/exam-service/Code.gs`
- **Dependencias Expuestas:** Módulo de entregas, tareas, exámenes y regla de penalización por entrega tardía (50%).
- **Criterios de Aceptación:** Expedientes, entregas, calificaciones, asistencia y evaluaciones operando bajo el alcance global sin modificar registros históricos retroactivamente.
- **Estado:** [X] Completada

### [REQ-EXP-005] Procedimiento de Cierre de Año Escolar y Purga de Drive (Sección 7 / 18)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 7 / 18 - Fase 3/9).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/task-service/Code.gs`, `teacher-dashboard.html`, `js/teacher.js`
- **Dependencias Expuestas:** Google Drive API (DriveApp), Spreadsheets `Tareas`, `Entregas`, `ConfiguracionAcademica`.
- **Descripción del Alcance:** Ejecutar borrado físico en Google Drive (setTrashed) de archivos de entregas y resetear asignaciones docentes al cerrar el ciclo.
- **Criterios de Aceptación:** Confirmación explícita, eliminación de archivos en Drive y limpieza de asignaciones para inicio de nuevo año.
- **Estado:** [X] Completada

### [REQ-EXP-006] Dashboard de Estudiante e Integración de Contacto WhatsApp (Sección 13 / 16 / 18)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 13 / 16).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/student.js`, `student-dashboard.html`, `js/index-ui.js`
- **Dependencias Expuestas:** `renderStudentHeader`, `renderSubjectNavigation`, `downloadContentData`
- **Descripción del Alcance:** Mostrar tarjetas por materia derivadas de `GranularConfig`, enlace directo WhatsApp (`wa.me/504...`), ordenamiento de tareas por fecha limite y filtrado de recursos por Unidad Activa.
- **Criterios de Aceptación:** Visualización permanente de materias autorizadas, tarjeta de contacto activa y filtrado dinámico por parcial y unidad.
- **Estado:** [X] Completada

### [REQ-EXP-007] Renombrado Institucional e Identidad Visual PWA (Sección 4)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 4).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `index.html`, `login.html`, `register.html`, `student-dashboard.html`, `teacher-dashboard.html`, `manifest.json`, `imagenes/new-generation-logo.png`
- **Dependencias Expuestas:** Encabezados HTML, pies de página, manifiesto PWA, diálogos de login/registro.
- **Descripción del Alcance:** Reemplazar todas las menciones institucionales anteriores por "New Generation Christian Academy", renombrar recurso de logotipo a `new-generation-logo.png` y actualizar PWA manifest.
- **Criterios de Aceptación:** No existen referencias institucionales obsoletas en la UI pública. El logotipo carga correctamente en todas las vistas.
- **Estado:** [X] Completada

### [REQ-EXP-008] Sistema de Roles y Permisos Granulares Servidor/RBAC (Sección 5)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 5).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `js/config.js`, `js/api.js`
- **Dependencias Expuestas:** Matriz de autorización por rol (Administrador, Director, Subdirector, Secretaría, Contador, Consejeros, Profesor, Asistente, Alumnos/Padres).
- **Descripción del Alcance:** Validar roles y permisos del lado del servidor en cada endpoint. Garantizar que ocultar botones en la interfaz no sea el único mecanismo de seguridad.
- **Criterios de Aceptación:** Rechazo explícito en backend (`AUTH_PERMISSION_DENIED`) ante peticiones no autorizadas para la responsabilidad del usuario.
- **Estado:** [X] Completada

### [REQ-EXP-009] Módulo de Matrícula y Control Financiero del Estudiante (Sección 8)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 8).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/student.js`, `student-dashboard.html`
- **Dependencias Expuestas:** Expediente del alumno, vinculación financiera-académica.
- **Descripción del Alcance:** Registrar matrículas/rematrículas por periodo, asociar cargos, becas, descuentos y exoneraciones sin duplicar cobros ni bloquear inapropiadamente la visualización académica autorizada.
- **Criterios de Aceptación:** Historial de matrícula independiente, cargos generados correctamente sin duplicaciones.
- **Estado:** [X] Completada

### [REQ-EXP-010] Módulo Contable y Financiero - Conceptos, Mensualidades y Cobros (Sección 9.1 - 9.3)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 9.1 - 9.3).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/config.js`
- **Dependencias Expuestas:** Cuentas por cobrar, importes por nivel/grado, pagos parciales.
- **Descripción del Alcance:** Configurar conceptos de cobro (mensualidades, matrícula, libros, transporte), generar estados de cuenta y registrar pagos por múltiples métodos.
- **Criterios de Aceptación:** Control de saldos pendientes, registro de abonos y trazabilidad de ajustes.
- **Estado:** [X] Completada

### [REQ-EXP-011] Portal Estudiantil de Pagos y Recibos Únicos en PDF (Sección 9.4 - 9.5)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 9.4 - 9.5).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `student-dashboard.html`, `js/student.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Comprobantes adjuntos, numeración correlativa de recibos.
- **Descripción del Alcance:** Permitir consulta de vencimientos, carga de comprobantes de transferencia y generación/descarga de recibos PDF únicos correlativos.
- **Criterios de Aceptación:** Emisión de PDF de recibo con numeración correlativa no duplicable para pagos confirmados.
- **Estado:** [X] Completada

### [REQ-EXP-012] Módulo de Facturación Fiscal Hondureña (Sección 9.6 / 10.3)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 9.6 / 10.3).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Módulo fiscal independiente separado del recibo interno.
- **Descripción del Alcance:** Incorporar gestión de documentos fiscales tributarios aplicables en Honduras, con trazabilidad hacia cargos y cobros sin confundir el recibo interno con la factura fiscal.
- **Criterios de Aceptación:** Separación arquitectónica estricta entre control financiero interno y facturación fiscal.
- **Estado:** [X] Completada

### [REQ-EXP-013] Gestión de Caja, Bancos, Ingresos y Egresos (Sección 9.7 / 10.1 - 10.2)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 9.7 / 10.1 - 10.2).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Apertura/cierre de caja, conciliaciones bancarias, cuentas por pagar/cobrar.
- **Descripción del Alcance:** Registrar movimientos de caja chica, depósitos bancarios, proveedores, egresos e informes de conciliación periódica.
- **Criterios de Aceptación:** Cierres de caja cuadrados con trazabilidad completa de ingresos y gastos.
- **Estado:** [X] Completada

### [REQ-EXP-014] Módulo de Planillas, Deducciones y Asistencia de Personal (Sección 11)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 11).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Expedientes laborales, salarios, deducciones de ley en Honduras (IHSS, RAP, ISR).
- **Descripción del Alcance:** Generar planillas periódicas, calcular horas extras, bonificaciones, deducciones, control de asistencia (entradas/salidas/tardanzas) e informes de costos laborales.
- **Criterios de Aceptación:** Comprobantes de pago de planilla generados y acceso restricted estrictamente por rol.
- **Estado:** [X] Completada

### [REQ-EXP-015] Módulo de Inventarios, Activos y Control de Proveedores (Sección 12)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 12).
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** Productos, materiales, mobiliario, existencias mínimas.
- **Descripción del Alcance:** Controlar entradas, salidas, préstamos, devoluciones, bajas y conteos físicos de consumibles y activos fijos de la institución.
- **Criterios de Aceptación:** Kardex de inventario actualizado y alertas de stock mínimo.
- **Estado:** [X] Completada

### [REQ-EXP-016] Módulo de Noticias y Comunicación Institucional por Secretaría (Sección 13)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 13).
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/index-ui.js`
- **Dependencias Expuestas:** Banners de noticias, audiencia por nivel/grado/sección.
- **Descripción del Alcance:** Permitir al rol Secretaría publicar, editar y retirar noticias institucionales con vigencia de fechas y filtros de audiencia destinataria.
- **Criterios de Aceptación:** Publicación de avisos segmentada por público objetivo.
- **Estado:** [X] Completada

### [REQ-EXP-017] Consola de Administración Técnica, Panel de Estado y Health Checks Ping-Pong (Sección 14.1 - 14.3)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 14.1 - 14.3).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Monitoreo de microservicios (USER, ACADEMIC, TASK, EXAM).
- **Descripción del Alcance:** Construir panel de estado general para el rol Administrador con solicitudes ping-pong de salud real de los endpoints, tiempos de respuesta e indicadores visuales (En línea, Degradado, Fuera de línea).
- **Criterios de Aceptación:** Verificación real de conectividad sin estados simulados.
- **Estado:** [X] Completada

### [REQ-EXP-018] Sistema de Logs Estructurados por Servicio y Función (Sección 14.4 - 14.6)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 14.4 - 14.6).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `js/api.js`
- **Dependencias Expuestas:** Visor de logs en Consola Técnica.
- **Descripción del Alcance:** Registrar eventos con fecha, hora, severidad, servicio, función y códigos de error unívocos (ej. `AUTH_INVALID_CREDENTIALS`, `SHEETS_WRITE_FAILED`), con filtros por severidad y fecha.
- **Criterios de Aceptación:** Logs detallados sin exponer información sensible ni contraseñas.
- **Estado:** [X] Completada

### [REQ-EXP-019] Módulo de Copias de Seguridad, Verificación y Mantenimiento Seguro (Sección 14.7 - 14.8)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 14.7 - 14.8).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Drive API, automatización de respaldos de datos de la institución.
- **Descripción del Alcance:** Crear respaldos manuales/programados, verificar integridad de archivos guardados, control de restauración protegida con confirmación doble y herramientas de mantenimiento seguro.
- **Criterios de Aceptación:** Generación exitosa de respaldos verificables con políticas de retención.
- **Estado:** [X] Completada

---

## REQUERIMIENTOS DE GESTIÓN DOCENTE, CONTENIDOS, GUÍAS Y TAREAS (New Generation Christian Academy)

### [REQ-DOC-001] Gestión de Guías de Estudio por Asignatura y Parcial (Sección 3)
- **Origen del Hallazgo:** Especificación de Gestión Docente y Tareas (Sección 3).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `js/student.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** `getAcademicConfig`, subida de archivos, tipos MIME documentales autorizados (PDF, DOCX, TXT, XLSX, PPTX).
- **Descripción del Alcance:** Permitir a los docentes crear, publicar, sustituir, consultar y desactivar guías de estudio por asignatura, grado, sección y parcial, con sanitización de contenido y visualización en el dashboard estudiantil.
- **Criterios de Aceptación:** Las guías creadas se vinculan correctamente a la asignatura/parcial y se despliegan para alumnos autorizados.
- **Estado:** [X] Completada

### [REQ-DOC-002] Registro de Contenido de Clases y Presentaciones por Tema (Sección 4 / 13.1 - 13.2)
- **Origen del Hallazgo:** Especificación de Gestión Docente y Tareas (Sección 4 / 13.1 - 13.2).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/teacher.js`, `js/config.js`, `teacher-dashboard.html`
- **Dependencias Expuestas:** `PRESENTATION_INDEX`, `GLOBAL_SCOPE.TemaActual`, integración con Google Drive.
- **Descripción del Alcance:** Organizar material pedagógico por tema (título, descripción, fecha de clase, contenido en editor enriquecido, presentación adjunta en Drive, documentos complementarios y tareas asociadas).
- **Criterios de Aceptación:** Asociación temas-presentaciones-recursos almacenada y persistida tras recarga de página.
- **Estado:** [X] Completada

### [REQ-DOC-003] Creación de Tareas Polimórficas y Validación de Contenido Obligatorio (Sección 5.1 - 5.3)
- **Origen del Hallazgo:** Especificación de Gestión Docente y Tareas (Sección 5.1 - 5.3).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/task-service/Code.gs`
- **Dependencias Expuestas:** Editor Quill, modal de creación de tareas, validaciones de adjuntos.
- **Descripción del Alcance:** Proveer tres modalidades de creación (A. Editor de texto enriquecido, B. Documento adjunto, C. Ejercicios a desarrollar). Validar que ninguna tarea se guarde sin contenido o sin fecha límite.
- **Criterios de Aceptación:** Bloqueo de guardado ante tareas vacías y almacenamiento de instrucciones/archivos en backend.
- **Estado:** [X] Completada

### [REQ-DOC-004] Desacoplamiento de Guías de Estudio vs Tareas Evaluables (Sección 5.4)
- **Origen del Hallazgo:** Especificación de Gestión Docente y Tareas (Sección 5.4).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/teacher.js`, `js/student.js`, `backend/task-service/Code.gs`
- **Dependencias Expuestas:** Clasificación de tipo de recurso (`tipoRecurso`).
- **Descripción del Alcance:** Permitir indicar la función del material (tarea/actividad para entregar, ejercicios, guía de estudio, material de apoyo). Garantizar que las guías de estudio no aparezcan automáticamente como tareas pendientes.
- **Criterios de Aceptación:** Distinción visual y lógica clara entre guías informativas y actividades evaluables que requieren entrega.
- **Estado:** [X] Completada

### [REQ-DOC-005] Programación de Publicación Posterior a Clase y Fecha Predeterminada (Sección 6.1 - 6.2)
- **Origen del Hallazgo:** Especificación de Gestión Docente y Tareas (Sección 6.1 - 6.2).
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/teacher.js`, `teacher-dashboard.html`
- **Dependencias Expuestas:** Cálculo de fechas en el formulario de creación de tareas.
- **Descripción del Alcance:** Sugerir por defecto como fecha de entrega el día siguiente a la fecha de la clase impartida. Permitir al docente modificar la fecha y validar que la entrega no sea anterior a la fecha de clase.
- **Criterios de Aceptación:** La fecha por defecto se calcula a partir de la fecha de la clase vinculada.
- **Estado:** [X] Completada

### [REQ-DOC-006] Hora de Disponibilidad de Tareas Independiente de Fecha Límite (Sección 6.3 - 6.5)
- **Origen del Hallazgo:** Especificación de Gestión Docente y Tareas (Sección 6.3 - 6.5).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `js/teacher.js`, `js/student.js`, `backend/task-service/Code.gs`
- **Dependencias Expuestas:** Máquina de estados de la tarea (Borrador, Programada, Publicada, Disponible, Entregada, Vencida, Cerrada).
- **Descripción del Alcance:** Manejar hora de disponibilidad configurada desde el panel administrativo de desarrollador. Ocultar el botón de entrega si la tarea aún está programada para el futuro tras la clase.
- **Criterios de Aceptación:** Control de visibilidad y bloqueo de entregas antes de la hora de disponibilidad configurada.
- **Estado:** [X] Completada

### [REQ-DOC-007] Visualización de Tareas y Recursos en Dashboard Estudiantil (Sección 7)
- **Origen del Hallazgo:** Especificación de Gestión Docente y Tareas (Sección 7).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/student.js`, `student-dashboard.html`
- **Dependencias Expuestas:** `renderSubjectNavigation`, tarjetas expandibles de asignatura.
- **Descripción del Alcance:** Mostrar tareas con título, asignatura, tema, parcial, fechas y estado (pendiente, entregada, vencida). Separar visualmente las guías de estudio de las tareas evaluables.
- **Criterios de Aceptación:** Tarjetas desplegables por materia mostrando claramente guías y tareas sin confusión de estados.
- **Estado:** [X] Completada

### [REQ-DOC-008] Estructura de Carpetas Jerárquica en Google Drive y Nomenclatura (Sección 8)
- **Origen del Hallazgo:** Especificación de Gestión Docente y Tareas (Sección 8).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/task-service/Code.gs`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Google Drive API (`DriveApp`), jerarquía de carpetas por Asignatura/Año/Parcial.
- **Descripción del Alcance:** Almacenar archivos en la estructura estandarizada `Área/New Generation/Docentes/Asignaturas/[Nombre]/[Año]/Parcial I..IV/[Tipo]`, previniendo duplicación por variaciones triviales y sanitizando nombres.
- **Criterios de Aceptación:** Los archivos subidos se depositan en las subcarpetas correctas de Google Drive según el tipo y parcial.
- **Estado:** [X] Completada

### [REQ-DOC-009] Registro de Metadatos Documentales en Spreadsheet (Sección 9)
- **Origen del Hallazgo:** Especificación de Gestión Docente y Tareas (Sección 9).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/task-service/Code.gs`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Hoja de cálculo de metadatos documentales.
- **Descripción del Alcance:** Registrar metadatos completos por archivo (ID único, Título, Nombre original, Nombre físico, Tipo recurso, Asignatura, Grado, Sección, Parcial, Año, Tema, Tarea, Profesor, Fechas, Estado, Drive ID, Ruta, MIME, Tamaño).
- **Criterios de Aceptación:** Registros tabulares completos en Spreadsheet sin guardar datos binarios en celdas.
- **Estado:** [X] Completada

### [REQ-DOC-010] Panel Administrativo del Desarrollador, Consola Técnica y Exportación RAR/ZIP (Sección 10 / 11)
- **Origen del Hallazgo:** Especificación de Gestión Docente y Tareas (Sección 10 / 11).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Consola técnica de administración, exportación documental por año lectivo.
- **Descripción del Alcance:** Configurar horas de publicación e intervalo post-clase, monitoreo de salud de microservicios, visor de logs y exportación comprimida (ZIP/RAR) de archivos del año escolar seleccionado.
- **Criterios de Aceptación:** Descarga de paquete comprimido respetando la estructura de carpetas sin bloquear la interfaz.
- **Estado:** [X] Completada

### [REQ-DOC-011] Optimización del Análisis de Desempeño Estudiantil e Índice de Asistencia (Sección 12)
- **Origen del Hallazgo:** Especificación de Gestión Docente/Tareas (Sección 12).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/student.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Algoritmos de promedios, ponderaciones y métricas psicométricas (ICR, GP, Mastery).
- **Descripción del Alcance:** Calcular rendimiento integral considerando notas por asignatura, tareas, proyectos, exámenes, entregas tardías (penalización 50%) e índice de asistencia por separado sin falsear datos ausentes como ceros.
- **Criterios de Aceptación:** Reporte analítico claro que diferencia desempeño académico de control de asistencia.
- **Estado:** [X] Completada

### [REQ-DOC-012] Seguridad en Servidor, Permisos y Trazabilidad de Contenidos (Sección 14)
- **Origen del Hallazgo:** Especificación de Gestión Docente y Tareas (Sección 14).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `backend/task-service/Code.gs`, `js/api.js`
- **Dependencias Expuestas:** Capa de autorización en microservicios backend.
- **Descripción del Alcance:** Enforzar permisos en el servidor para evitar que docentes publiquen en asignaturas/secciones no asignadas. Proteger credenciales de Drive y registrar trazabilidad de fechas de entrega.
- **Criterios de Aceptación:** Peticiones no autorizadas rechazadas en backend independientemente de la interfaz cliente.
- **Estado:** [X] Completada

---

## REQUERIMIENTO: DASHBOARDS INDEPENDIENTES Y CONTROL DE ACCESO POR ROLES (New Generation Bilingual School and Institute)

### [REQ-DASH-001] Dashboard de Administrador / Desarrollador con Supervisión Global Auditable (Sección 2)
- **Origen del Hallazgo:** Requerimiento: Dashboards Independientes y Control de Acceso por Roles (Sección 2).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `js/ui-common.js`, `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Capa de supervisión global, selector de vistas por rol, trazabilidad de logs.
- **Descripción del Alcance:** Proporcionar acceso de supervisión técnica a todos los dashboards y módulos (académico, contable, secretaría, dirección, docente, estudiante) sin permitir alteraciones accidentales. Registrar toda intervención en logs de auditoría.
- **Criterios de Aceptación:** Vista de supervisión funcional que distingue entre consulta/supervisión y modificación directa.
- **Estado:** [X] Completada

### [REQ-DASH-002] Dashboard Independiente de Dirección / Subdirección (Sección 3)
- **Origen del Hallazgo:** Requerimiento: Dashboards Independientes y Control de Acceso por Roles (Sección 3).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Gestión de periodos escolares, grados, secciones, pensum y cargas docentes.
- **Descripción del Alcance:** Crear panel exclusivo para Dirección y Subdirección para apertura/cierre de periodos, administración de pensum, asignación de docentes titulares/asistentes y supervisión de matrícula.
- **Criterios de Aceptación:** Navegación y permisos independientes para Director y Subdirector sin acceso a datos no autorizados.
- **Estado:** [X] Completada

### [REQ-DASH-003] Dashboard Independiente de Secretaría (Sección 4)
- **Origen del Hallazgo:** Requerimiento: Dashboards Independientes y Control de Acceso por Roles (Sección 4).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Gestión de personal, matrículas, asignaciones autorizadas y noticias institucionales.
- **Descripción del Alcance:** Construir interfaz independiente de Secretaría para la creación de cuentas de personal, gestión de registros estudiantiles, asignaciones docentes autorizadas y publicación de avisos/noticias.
- **Criterios de Aceptación:** Interfaz de Secretaría restringida a sus competencias sin acceso a configuraciones de Dirección o Contabilidad.
- **Estado:** [X] Completada

### [REQ-DASH-004] Dashboard Independiente de Contabilidad y Módulos Financieros (Sección 5)
- **Origen del Hallazgo:** Requerimiento: Dashboards Independientes y Control de Acceso por Roles (Sección 5).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Planillas, facturación, cuentas por cobrar/pagar, ingresos/egresos, recibos y conciliaciones.
- **Descripción del Alcance:** Desarrollar interfaz independiente de Contabilidad para gestionar salarios, facturas, cobros de colegiaturas, proveedores, reportes financieros y cierres de caja con permisos de aprobación/anulación trazables.
- **Criterios de Aceptación:** Acceso financiero totalmente restringido para roles ajenos a Contabilidad/Administración.
- **Estado:** [X] Completada

### [REQ-DASH-005] Conservación e Integración del Dashboard del Profesor (Sección 6)
- **Origen del Hallazgo:** Requerimiento: Dashboards Independientes y Control de Acceso por Roles (Sección 6).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`
- **Dependencias Expuestas:** Asignaciones docentes, contenidos de clase, tareas, exámenes, calificaciones y asistencia.
- **Descripción del Alcance:** Mantener el dashboard docente existente, asegurando que las funciones académicas (clases, guías, tareas, exámenes, calificaciones) operen estrictamente dentro de sus asignaciones asignadas por Dirección/Secretaría.
- **Criterios de Aceptación:** El profesor no tiene acceso a módulos contables, planillas ni administración general.
- **Estado:** [X] Completada

### [REQ-DASH-006] Conservación e Integración del Dashboard del Estudiante (Sección 7)
- **Origen del Hallazgo:** Requerimiento: Dashboards Independientes y Control de Acceso por Roles (Sección 7).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `student-dashboard.html`, `js/student.js`
- **Dependencias Expuestas:** Asignaturas asignadas, tareas, exámenes, notas, avisos, grupos de WhatsApp y comprobantes de pago propios.
- **Descripción del Alcance:** Garantizar que el estudiante acceda exclusivamente a su información académica y financiera propia, entregue tareas, consulte calificaciones y realice pagos autorizados.
- **Criterios de Aceptación:** Aislamiento estricto de expedientes y comprobantes entre estudiantes.
- **Estado:** [X] Completada

### [REQ-DASH-007] Enrutamiento Post-Login y Separación Estricta de Navegación por URL (Sección 8)
- **Origen del Hallazgo:** Requerimiento: Dashboards Independientes y Control de Acceso por Roles (Sección 8).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `js/auth.js`, `js/ui-common.js`, `login.html`
- **Dependencias Expuestas:** Redirección tras autenticación, validación de URLs y verificación de estado de sesión.
- **Descripción del Alcance:** Dirigir al usuario al dashboard específico de su rol activo tras iniciar sesión. Bloquear el acceso a dashboards ajenos mediante manipulación de la URL o reutilización de enlaces.
- **Criterios de Aceptación:** Redirección automática al dashboard autorizado y rechazo inmediato de navegación no autorizada.
- **Estado:** [X] Completada

### [REQ-DASH-008] Matriz Granular de Permisos Backend por Operación (Sección 9 - 10)
- **Origen del Hallazgo:** Requerimiento: Dashboards Independientes y Control de Acceso por Roles (Sección 9 - 10).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/task-service/Code.gs`, `backend/exam-service/Code.gs`
- **Dependencias Expuestas:** Matriz de permisos (Consultar, Crear, Editar, Eliminar, Aprobar, Anular, Exportar, Administrar).
- **Descripción del Alcance:** Extender el RBAC backend para verificar rol, permiso específico por operación y alcance de datos (ownership/assignment) en cada microservicio.
- **Criterios de Aceptación:** Peticiones directas no autorizadas al backend son rechazadas con error de permisos sin revelar datos sensibles.
- **Estado:** [X] Completada

### [REQ-DASH-009] Registro de Auditoría de Acciones Sensibles e Intervenciones (Sección 10 - 12)
- **Origen del Hallazgo:** Requerimiento: Dashboards Independientes y Control de Acceso por Roles (Sección 10 - 12).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Hoja de auditoría, logs de supervisión.
- **Descripción del Alcance:** Registrar automáticamente usuario, fecha, operación, módulo y resultado para todas las operaciones sensibles (aprobar, anular, modificar salario, cambiar rol, supervisión de desarrollador).
- **Criterios de Aceptación:** Hoja de auditoría con historial inmutable de acciones administrativas y financieras.
- **Estado:** [X] Completada

---

## AMPLIACIÓN DE REQUERIMIENTOS FUNCIONALES (New Generation Bilingual School and Institute)

### [REQ-AMP-001] Aislamiento Estricto de Datos entre Usuarios con el Mismo Rol (Sección 1)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 1).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/task-service/Code.gs`, `backend/exam-service/Code.gs`, `js/api.js`
- **Dependencias Expuestas:** Capa de filtrado por asignación en backend (`profesorId`, `userId`, `grado`, `seccion`).
- **Descripción del Alcance:** Garantizar que cada usuario solo acceda a sus propias asignaciones, estudiantes, registros y documentos, aplicando validación en servidor y no solo filtros visuales.
- **Criterios de Aceptación:** Bloqueo en backend de consultas y modificaciones sobre recursos pertenecientes a otros docentes, estudiantes o empleados.
- **Estado:** [X] Completada

### [REQ-AMP-002] Módulo de Detección de Duplicados, Inconsistencias y Contradicciones (Sección 2)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 2).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`, `teacher-dashboard.html`, `js/teacher.js`
- **Dependencias Expuestas:** Consola de auditoría de integridad para Dirección, Subdirección, Secretaría y Administrador/Desarrollador.
- **Descripción del Alcance:** Detectar cuentas, personas, matrículas, registros de personal, asignaciones dobles de profesores titulares, secciones o asignaturas duplicadas y generar panel de incidencias clasificadas por gravedad con corrección guiada segura.
- **Criterios de Aceptación:** Detección automática de duplicados/conflictos sin eliminación automática destructiva.
- **Estado:** [X] Completada

### [REQ-AMP-003] Gestión de Relevo Docente por Asignatura y Conservación Histórica (Sección 3)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 3).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/teacher.js`, `teacher-dashboard.html`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** `ConfiguracionAcademica`, `HistorialAcademico`, autoría de entregas y notas históricas.
- **Descripción del Alcance:** Permitir el reemplazo de un profesor titular en una asignatura/sección especificando fecha efectiva y motivo, desactivando el acceso operativo del docente saliente mientras se preserva la autoría original de tareas, exámenes y notas anteriores.
- **Criterios de Aceptación:** Transferencia de acceso operativo al nuevo profesor preservando intactos los registros históricos del profesor anterior.
- **Estado:** [X] Completada

### [REQ-AMP-004] Configuración Dinámica de Parciales según Pensum Académico (Sección 4)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 4).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `js/student.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** `getAcademicConfig`, creación de tareas, guías, examentes, boletas y reportes de rendimiento.
- **Descripción del Alcance:** Permitir cantidades y nombres de parciales configurables por asignatura según el plan de estudios, reflejando automáticamente la estructura en dashboards de profesores y alumnos.
- **Criterios de Aceptación:** Estructuras de parciales adaptables por materia sin alterar retroactivamente registros históricos.
- **Estado:** [X] Completada

### [REQ-AMP-005] Matrículas con Identificadores Únicos y Separación de Entidad Persona/Cuenta (Sección 5)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 5).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/student.js`
- **Dependencias Expuestas:** Entidades `Personas`, `CuentasUsuarios`, `Matrículas`.
- **Descripción del Alcance:** Desacoplar la identidad de la persona, su cuenta de inicio de sesión y sus matrículas anuales con ID único, preservando el historial de reinscripciones, cambios de sección y egresos.
- **Criterios de Aceptación:** Historial de matrículas múltiple por alumno sin duplicar cuentas de usuario ni perder datos académicos tras cambios de sección.
- **Estado:** [X] Completada

### [REQ-AMP-006] Gestión de Personal de Planilla con o sin Cuenta de Acceso (Sección 6)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 6).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `teacher-dashboard.html`, `js/teacher.js`
- **Dependencias Expuestas:** Entidad `Personal`, módulos de salarios, deducciones y nómina.
- **Descripción del Alcance:** Permitir el registro de empleados (mantenimiento, aseo, soporte) en el expediente laboral y sistema de planilla sin requerir una cuenta de usuario para ingresar a la plataforma.
- **Criterios de Aceptación:** Procesamiento de salarios y planillas para personal sin credenciales de inicio de sesión.
- **Estado:** [X] Completada

### [REQ-AMP-007] Envío Automático de Invitaciones Seguras para Establecer Contraseña (Sección 7)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 7).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `login.html`, `js/auth.js`
- **Dependencias Expuestas:** SMS, Email, WhatsApp Integration API, generación de tokens de un solo uso con expiración.
- **Descripción del Alcance:** Despachar enlaces temporales HTTPS de un solo uso vía Email/SMS/WhatsApp para que los nuevos usuarios definan su clave inicial de forma segura sin transmitir contraseñas en texto plano.
- **Criterios de Aceptación:** Enlaces de invitación caducables y de un solo uso con registro de estado de entrega.
- **Estado:** [X] Completada

### [REQ-AMP-008] Protección Estricta de Privacidad de Datos Telefónicos y Comunicaciones (Sección 8)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 8).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/student.js`, `js/teacher.js`
- **Dependencias Expuestas:** Respuestas JSON de la API, listados de clase, tarjetas de perfil.
- **Descripción del Alcance:** Omitir números de teléfono privados de docentes y compañeros en las respuestas backend enviadas a estudiantes, canalizando comunicaciones institucionales exclusivamente vía grupos/canales autorizados.
- **Criterios de Aceptación:** Ocultamiento total de números privados en la API y vistas del dashboard estudiantil.
- **Estado:** [X] Completada

### [REQ-AMP-009] Módulo Contable Integral: Planillas, Deducciones, Cuentas por Cobrar/Pagar (Sección 9)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 9).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `teacher-dashboard.html`, `js/teacher.js`
- **Dependencias Expuestas:** Módulo financiero, cálculo de retenciones de ley, colegiaturas, cierres y conciliación.
- **Descripción del Alcance:** Centralizar cálculo de sueldos, deducciones, facturación de mensualidades, pagos a proveedores, registros de caja e historial inmutable con reversiones o anulaciones controladas auditables.
- **Criterios de Aceptación:** Módulo contable operativo con trazabilidad completa y separación estricta de permisos.
- **Estado:** [X] Completada

### [REQ-AMP-010] Motor de Plantillas Reutilizables de Facturas, Recibos y Comprobantes Imprimibles/PDF (Sección 10 - 11)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 10 - 11).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Generador de PDF/Impresión, numeración correlativa única, datos fiscales configurables.
- **Descripción del Alcance:** Disponer de diseños estandarizados con previsualización para emitir recibos de pago, facturas, comprobantes de salario y deducciones con numeración correlativa protegida e identidad visual institucional New Generation.
- **Criterios de Aceptación:** Generación e impresión de comprobantes en PDF sin reutilización de números correlativos ni pérdida de formato.
- **Estado:** [X] Completada

---

## AMPLIACIÓN DE REQUERIMIENTOS FUNCIONALES: CALENDARIO, DOCUMENTACIÓN DOCENTE, NOTIFICACIONES, CONTROL DE PAGOS Y ARCHIVO ANUAL (New Generation Bilingual School and Institute)

### [REQ-AMP2-001] Módulo de Calendario Académico, Exámenes y Fechas Institucionales (Sección 1)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 1).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Centralización de fechas en Secretaría/Dirección, alertas por falta de configuración de parciales, exámenes y actividades.
- **Descripción del Alcance:** Proporcionar interfaz administrativa en Secretaría, Dirección y Subdirección para configurar periodos, parciales, exámenes, días festivos y actividades con alertas preventivas por incompleitud sin asignar fechas ficticias.
- **Criterios de Aceptación:** Configuración de parciales y eventos por año lectivo con alertas por falta de fechas y sin alterar asignaciones personales.
- **Estado:** [X] Completada

### [REQ-AMP2-002] Sección de Documentación Académica Docente y Estructuración en Drive (Sección 2)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 2).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Almacenamiento en Drive `New Generation/Docentes/[Docente]/[Año]/[Asignatura]/[Grado_Sección]/[Periodo]/`.
- **Descripción del Alcance:** Permitir a profesores subir sílabos, guiones, jornalizaciones y planificaciones, guardando metadatos en base de datos y organizando carpetas privadas en Google Drive sin sobreescritura accidental ni exposición pública.
- **Criterios de Aceptación:** Almacenamiento organizado en Drive con validación de tipo/tamaño y registro de metadatos en base de datos.
- **Estado:** [X] Completada

### [REQ-AMP2-003] Sistema de Notificaciones y Seguimiento de Obligaciones Docentes (Sección 3)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 3).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Recordatorios de entrega de jornalizaciones, guías, exámenes y calificaciones.
- **Descripción del Alcance:** Habilitar desde Secretaría recordatorios automáticos de fechas límite dirigidos a docentes responsables, deteniendo las notificaciones al cumplir la obligación y generando reportes de cumplimiento administrativo.
- **Criterios de Aceptación:** Notificaciones de cumplimiento docente configurables con cese de alertas ante entregas completadas.
- **Estado:** [X] Completada

### [REQ-AMP2-004] Sistema Centralizado de Notificaciones Estudiantiles con Campana e Indicadores (Sección 4)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 4).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `student-dashboard.html`, `js/student.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Campana de notificaciones, código de colores por prioridad (Amarillo, Verde, Rojo).
- **Descripción del Alcance:** Implementar un centro de notificaciones discreto con campana para estudiantes, mostrando avisos de exámenes, tareas, eventos, avisos institucionales y vencimientos de pago ordenados por prioridad y leídos/no leídos.
- **Criterios de Aceptación:** Lista de notificaciones con estados de lectura, indicadores accesibles por color/icono y sin duplicidades.
- **Estado:** [X] Completada

### [REQ-AMP2-005] Configuración Institucional de Fechas de Pago y Estado Financiero (Sección 5)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 5).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Módulo financiero, vencimiento de mensualidades/matrícula, estados de cuenta.
- **Descripción del Alcance:** Habilitar a Secretaría la configuración de fechas de vencimiento y periodos de pago, clasificando el estado del alumno (Al día, Próximo a vencer, Vencido, En revisión, Exonerado/Beca) provisto desde el módulo financiero.
- **Criterios de Aceptación:** Clasificación financiera exacta del estudiante sin duplicar cálculos arbitrarios en el dashboard académico.
- **Estado:** [X] Completada

### [REQ-AMP2-006] Restricción de Visualización de Calificaciones por Pagos Pendientes (Sección 6)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 6).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `student-dashboard.html`, `js/student.js`, `backend/academic-service/Code.gs`, `backend/task-service/Code.gs`
- **Dependencias Expuestas:** Máscara visual de notas `- -` con aviso "Pago pendiente".
- **Descripción del Alcance:** Ocultar visualmente y proteger en backend el valor numérico de calificaciones y promedios cuando existan saldos vencidos, **sin bloquear jamás** el ingreso al sistema, la asistencia a clases, la consulta de contenidos ni la entrega de tareas.
- **Criterios de Aceptación:** Calificaciones reemplazadas por `- -` en frontend y backend sin alterar las notas reales almacenadas ni impedir entregas de tareas.
- **Estado:** [X] Completada

### [REQ-AMP2-007] Separación Estricta entre Administración Personal e Institucional (Sección 7)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 7).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `teacher-dashboard.html`, `student-dashboard.html`
- **Dependencias Expuestas:** Opciones de perfil personal vs. Configuración de parámetros institucionales (Secretaría/Dirección/Desarrollador).
- **Descripción del Alcance:** Distinguir claramente en la interfaz las opciones de preferencias personales del usuario de las herramientas de administración institucional y global (desarrollador) para evitar la alteración accidental de parámetros compartidos.
- **Criterios de Aceptación:** Modificación de parámetros institucionales restringida estrictamente a los roles autorizados.
- **Estado:** [X] Completada

### [REQ-AMP2-008] Archivado Íntegro del Año Escolar en Nueva Spreadsheet Independiente (Sección 8)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 8).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `teacher-dashboard.html`, `js/teacher.js`
- **Dependencias Expuestas:** Generación de copia histórica independiente en Google Sheets `New Generation - Archivo Académico - [Año]`.
- **Descripción del Alcance:** Crear una función adicional para duplicar e integrar los registros del año escolar finalizado en una nueva Spreadsheet con hoja de índice/manifiesto, verificando integridad de filas/valores y permitiendo descarga `.xlsx` **sin modificar ni borrar la spreadsheet operativa**.
- **Criterios de Aceptación:** Spreadsheet histórica de copia estática generada y verificada sin alterar la base de datos operativa activa.
- **Estado:** [X] Completada

### [REQ-AMP2-009] Seguridad, Permisos y Trazabilidad del Archivado Anual (Sección 9)
- **Origen del Hallazgo:** Ampliación de Requerimientos Funcionales (Sección 9).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Restricción de descarga de spreadsheets archivadas por rol y logs de auditoría.
- **Descripción del Alcance:** Garantizar que la solicitud, generación y descarga de spreadsheets archivadas esté limitada a Dirección, Secretaría, Contabilidad y Desarrollador, registrando cada operación en hojas de auditoría.
- **Criterios de Aceptación:** Acceso a respaldos históricos restringido por rol con trazabilidad inmutable de descargas y solicitudes.
- **Estado:** [X] Completada

---

## REQUERIMIENTO: SUPERVISIÓN Y CONSULTA DE DOCUMENTACIÓN DOCENTE (New Generation Christian Academy)

### [REQ-SUP-001] Acceso al Perfil Docente y Consulta Documental (Sección 1)
- **Origen del Hallazgo:** Requerimiento: Supervisión y Consulta de Documentación Docente (Sección 1).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Módulo de perfil docente, consulta de sílabos, jornalizaciones, planificaciones y exámenes.
- **Descripción del Alcance:** Permitir a Dirección, Subdirección y Secretaría visualizar la documentación pedagógica entregada por el profesor, con opciones para previsualizar, imprimir y descargar.
- **Criterios de Aceptación:** Vista de perfil docente con panel de documentos filtrables e imprimibles.
- **Estado:** [X] Completada

### [REQ-SUP-002] Organización Jerárquica y Filtrado Preciso (Sección 2)
- **Origen del Hallazgo:** Requerimiento: Supervisión y Consulta de Documentación Docente (Sección 2).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Árbol de navegación `Docentes -> Profesor -> Año -> Parcial -> Grado -> Sección -> Asignatura -> TipoDoc`.
- **Descripción del Alcance:** Garantizar que los documentos estén asociados exactamente al tuple (Año, Profesor, Parcial, Grado, Sección, Asignatura) e impedir que un documento se aplique erróneamente a otras secciones del mismo grado.
- **Criterios de Aceptación:** Navegación en cascada y filtrado estricto por sección y asignatura.
- **Estado:** [X] Completada

### [REQ-SUP-003] Impresión, Previsualización y Descarga Segura sin Alteración en Drive (Sección 3)
- **Origen del Hallazgo:** Requerimiento: Supervisión y Consulta de Documentación Docente (Sección 3).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Generación de PDF/Impresión, previsualización de archivos en Drive.
- **Descripción del Alcance:** Generar vistas de impresión con membrete institucional e identificación completa sin modificar los archivos almacenados en Google Drive ni sobreescribir versiones originales.
- **Criterios de Aceptación:** Impresión y vista previa que mantienen intactos los archivos almacenados en Drive.
- **Estado:** [X] Completada

### [REQ-SUP-004] Acceso Restringido a Docentes Suplentes y Relevos Temporales (Sección 4)
- **Origen del Hallazgo:** Requerimiento: Supervisión y Consulta de Documentación Docente (Sección 4).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/teacher.js`
- **Dependencias Expuestas:** Asignaciones temporales, relevo de profesor titular, revocación automática.
- **Descripción del Alcance:** Impedir que los profesores accedan a documentos privados de otros colegas, habilitando acceso temporal únicamente ante asignaciones de suplencia con revocación automática al vencer la fecha.
- **Criterios de Aceptación:** Acceso temporal concedido exclusivamente por asignación explícita y revocado automáticamente al expirar la suplencia.
- **Estado:** [X] Completada

### [REQ-SUP-005] Seguridad Backend y Enlaces Autenticados de Drive (Sección 5)
- **Origen del Hallazgo:** Requerimiento: Supervisión y Consulta de Documentación Docente (Sección 5).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/api.js`
- **Dependencias Expuestas:** Servidor de archivos, permisos en Google Drive API.
- **Descripción del Alcance:** Enforzar permisos en el backend para evitar que usuarios abran o descarguen archivos privados mediante enlaces directos de Drive fuera de la interfaz autorizada.
- **Criterios de Aceptación:** Rechazo backend de solicitudes directas no autorizadas a recursos en Drive.
- **Estado:** [X] Completada

### [REQ-SUP-006] Resumen Administrativo de Cumplimiento Documental (Sección 6)
- **Origen del Hallazgo:** Requerimiento: Supervisión y Consulta de Documentación Docente (Sección 6).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Indicadores de cumplimiento docente, integración con notificaciones.
- **Descripción del Alcance:** Construir panel de control para Dirección y Secretaría indicando documentos solicitados, entregados, pendientes, atrasados y aprobados, deteniendo recordatorios al completar las entregas.
- **Criterios de Aceptación:** Reporte de cumplimiento en tiempo real integrado con el cese automático de avisos.
- **Estado:** [X] Completada

---

## REQUERIMIENTO TÉCNICO: ESTADOS Y TRANSICIONES DOCUMENTALES (New Generation Christian Academy)

### [REQ-FLOW-001] Definición de Estados Oficiales y Muestra Polimórfica (Sección 3)
- **Origen del Hallazgo:** Requerimiento Técnico: Estados y Transiciones Documentales (Sección 3).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `teacher-dashboard.html`, `js/teacher.js`
- **Dependencias Expuestas:** Máquina de estados (Solicitado, En preparación, Entregado, En revisión, Requiere correcciones, Reentregado, Aprobado, Rechazado, Vencido, Anulado, Archivado).
- **Descripción del Alcance:** Implementar los 11 estados documentales oficiales con diferenciación clara entre decisiones formales (Aprobado/Rechazado) y solicitudes de ajuste (Requiere correcciones).
- **Criterios de Aceptación:** Persistencia y visualización exacta de cada estado del ciclo de vida documental.
- **Estado:** [X] Completada

### [REQ-FLOW-002] Matriz de Transiciones Permitidas y Validación en Backend (Sección 4)
- **Origen del Hallazgo:** Requerimiento Técnico: Estados y Transiciones Documentales (Sección 4).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Capa de validación de transiciones por rol.
- **Descripción del Alcance:** Validar en el servidor que cada cambio de estado cumpla la matriz de transiciones permitidas (ej. impedir que un docente apruebe sus propios documentos o cambie a estados no permitidos).
- **Criterios de Aceptación:** Rechazo backend de cualquier cambio de estado fuera de la matriz autorizada.
- **Estado:** [X] Completada

### [REQ-FLOW-003] Desacoplamiento entre Estado Operativo, Cumplimiento y Vencimiento (Sección 5)
- **Origen del Hallazgo:** Requerimiento Técnico: Estados y Transiciones Documentales (Sección 5).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/teacher.js`
- **Dependencias Expuestas:** Cálculo tridimensional (Estado Operativo, Cumplimiento, Vencimiento).
- **Descripción del Alcance:** Manejar de forma independiente el estado del documento, la condición de cumplimiento (Entregado a tiempo, Entregado tarde, Incumplido) y el vencimiento por fecha límite sin sobrescribir el estado operativo.
- **Criterios de Aceptación:** Reportes y vistas que reflejan simultáneamente la fase operativa del documento y su estatus de cumplimiento en el tiempo.
- **Estado:** [X] Completada

### [REQ-FLOW-004] Control Estricto de Versiones e Inmutabilidad de Entregas (Sección 6)
- **Origen del Hallazgo:** Requerimiento Técnico: Estados y Transiciones Documentales (Sección 6).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Historial de entregas, versiones en Google Drive.
- **Descripción del Alcance:** Asignar un ID de versión único a cada entrega/reentrega, conservando las versiones anteriores, sus fechas reales y las observaciones de revisión sin sobreescritura silenciosa.
- **Criterios de Aceptación:** Trazabilidad inmutable de todas las versiones entregadas por el profesor con acceso al historial completo.
- **Estado:** [X] Completada

### [REQ-FLOW-005] Asignación Granular de Permisos por Rol en el Flujo Documental (Sección 7)
- **Origen del Hallazgo:** Requerimiento Técnico: Estados y Transiciones Documentales (Sección 7).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Restricciones de revisión por rol (Docente, Suplente, Secretaría, Dirección, Desarrollador).
- **Descripción del Alcance:** Enforzar permisos de modo que el docente prepare/entregue, la Secretaría y Dirección revisen/aprueben/rechacen y el Administrador supervise sin sustituir las decisiones pedagógicas.
- **Criterios de Aceptación:** El backend valida el rol activo para cada operación del flujo documental.
- **Estado:** [X] Completada

### [REQ-FLOW-006] Gestión de Fechas Límite, Notificaciones y Recálculo (Sección 8)
- **Origen del Hallazgo:** Requerimiento Técnico: Estados y Transiciones Documentales (Sección 8).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/teacher.js`
- **Dependencias Expuestas:** Notificaciones programadas, reprogramación de fechas límite.
- **Descripción del Alcance:** Activar recordatorios antes y después del vencimiento, deteniéndolos al cumplirse la obligación y registrando el historial de cambios de fecha sin borrar la fecha originalmente establecida.
- **Criterios de Aceptación:** Sincronización automática de alertas ante entregas o reprogramaciones autorizadas.
- **Estado:** [X] Completada

### [REQ-FLOW-007] Registro Inmutable de Auditoría por Transición Documental (Sección 10 - 11)
- **Origen del Hallazgo:** Requerimiento Técnico: Estados y Transiciones Documentales (Sección 10 - 11).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Hoja de auditoría de transiciones documentales.
- **Descripción del Alcance:** Registrar automáticamente ID de expediente, estados de origen/destino, usuario, rol, fecha, hora, observaciones y versión en un log de solo lectura inmutable.
- **Criterios de Aceptación:** Log de auditoría completo y protegido ante eliminaciones o modificaciones.
- **Estado:** [X] Completada

### [REQ-FLOW-008] Diseñador de Flujos de Aprobación Institucionales (Fase 25)
- **Origen del Hallazgo:** Especificación Fase 25: Flujos de Aprobación, Revisión y Firma Institucional.
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `teacher-dashboard.html`, `js/teacher.js`
- **Dependencias Expuestas:** Hoja `FlujosAprobacion`, `#modal-workflow-builder`.
- **Descripción del Alcance:** Constructor visual para definir secuencias de etapas de revisión, roles asignados y requisitos de conformidad por departamento.
- **Criterios de Aceptación:** Creación, edición, versionado y publicación de flujos multietapa persistidos en backend.
- **Estado:** [X] Completada

### [REQ-FLOW-009] Registro Inmutable de Decisiones de Revisión (Fase 25)
- **Origen del Hallazgo:** Especificación Fase 25: Flujos de Aprobación, Revisión y Firma Institucional.
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/teacher.js`
- **Dependencias Expuestas:** Hoja `RevisionesDecisionesTramite`, `processWorkflowDecision`.
- **Descripción del Alcance:** Registrar formalmente decisiones de revisión (Aprobar, Rechazar, Devolver, Derivar) con observaciones públicas e internas.
- **Criterios de Aceptación:** Trazabilidad completa por solicitud sin permitir sobreescritura silenciosa de historial.
- **Estado:** [X] Completada

### [REQ-FLOW-010] Conformidad Digital e Integridad de Firma Institucional (Fase 25)
- **Origen del Hallazgo:** Especificación Fase 25: Flujos de Aprobación, Revisión y Firma Institucional.
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/teacher.js`
- **Dependencias Expuestas:** Hoja `FirmasConformidades`, `registerDocumentSignature`.
- **Descripción del Alcance:** Emitir tokens únicos de verificación (`VERIF-XXXXXX`) vinculados a decisiones oficiales y documentos firmados.
- **Criterios de Aceptación:** Firma registrada con timestamp, rol e IP de auditoría sin exponer claves secretas.
- **Estado:** [X] Completada

---

## NUEVOS REQUERIMIENTOS TÉCNICOS: MODULARIZACIÓN Y MIGRACIÓN DE MICROSERVICIOS DEL BACKEND (New Generation Bilingual School and Institute)

### [REQ-MOD-001] Auditoría y Mapeo Obligatorio del Backend Existente (Sección 2)
- **Origen del Hallazgo:** Nuevos Requerimientos Técnicos: Modularización y Migración (Sección 2).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/task-service/Code.gs`, `backend/exam-service/Code.gs`, `MapaDependencias.md`
- **Dependencias Expuestas:** Inventario de funciones backend, Google Sheets, Google Drive API, contratos de comunicación.
- **Descripción del Alcance:** Auditar exhaustivamente funciones backend, integraciones con Google Sheets/Drive, llamadas desde dashboards y procesos automáticos antes de la migración masiva.
- **Criterios de Aceptación:** Inventario de funciones backend indexado y verificado sin duplicidades ni vacíos.
- **Estado:** [X] Completada

### [REQ-MOD-002] Microservicio de Contabilidad y Planillas - Contabilidad General (Sección 3.2.A)
- **Origen del Hallazgo:** Nuevos Requerimientos Técnicos: Modularización y Migración (Sección 3.2.A).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/config.js`
- **Dependencias Expuestas:** Ingresos, egresos, cuentas por cobrar/pagar, movimientos financieros, categorías contables.
- **Descripción del Alcance:** Centralizar la contabilidad general, clasificación de operaciones, reportes financieros y registros de ajustes autorizados.
- **Criterios de Aceptación:** Lógica contable operando mediante contratos de comunicación sin escrituras directas externas.
- **Estado:** [X] Completada

### [REQ-MOD-003] Microservicio de Contabilidad y Planillas - Mensualidades y Obligaciones de Pago (Sección 3.2.B)
- **Origen del Hallazgo:** Nuevos Requerimientos Técnicos: Modularización y Migración (Sección 3.2.B).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/student.js`
- **Dependencias Expuestas:** Conceptos de cobro, mensualidades, becas, descuentos, estados de cuenta.
- **Descripción del Alcance:** Administrar la creación, seguimiento, liquidación y conciliación de obligaciones financieras de estudiantes.
- **Criterios de Aceptación:** Cálculo atómico de saldos y seguimiento de mensualidades sin duplicidad de cobros.
- **Estado:** [X] Completada

### [REQ-MOD-004] Microservicio de Contabilidad y Planillas - Pagos, Pasarelas y Conciliación (Sección 3.2.C)
- **Origen del Hallazgo:** Nuevos Requerimientos Técnicos: Modularización y Migración (Sección 3.2.C).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/api.js`
- **Dependencias Expuestas:** Comprobantes, pasarelas de pago, verificación de transferencias, estado de pagos.
- **Descripción del Alcance:** Gestionar pagos reportados, en revisión, confirmados, rechazados y validados con control de idempotencia.
- **Criterios de Aceptación:** Trazabilidad completa de estados de pago e imposibilidad de confirmación duplicada.
- **Estado:** [X] Completada

### [REQ-MOD-005] Microservicio de Contabilidad y Planillas - Facturación y Documentos Financieros (Sección 3.2.D - 3.2.E)
- **Origen del Hallazgo:** Nuevos Requerimientos Técnicos: Modularización y Migración (Sección 3.2.D - 3.2.E).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Generación de facturas, recibos, plantillas contables/salariales, exportación PDF/Drive.
- **Descripción del Alcance:** Centralizar la emisión de facturas, recibos, comprobantes, plantillas configurables y almacenamiento en Drive.
- **Criterios de Aceptación:** Emisión documental unificada con control de plantillas y numeraciones correlativas.
- **Estado:** [X] Completada

### [REQ-MOD-006] Microservicio de Contabilidad y Planillas - Planillas y Gestión Laboral (Sección 3.2.F)
- **Origen del Hallazgo:** Nuevos Requerimientos Técnicos: Modularización y Migración (Sección 3.2.F).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Expedientes laborales, salarios, deducciones, nómina, boletas de pago.
- **Descripción del Alcance:** Administrar expedientes laborales, componentes salariales, cálculo de planillas de pago y boletas salariales.
- **Criterios de Aceptación:** Separación estricta entre expediente laboral y autenticación con conservación histórica.
- **Estado:** [X] Completada

### [REQ-MOD-007] Microservicio Académico - Matrículas y Reinscripciones (Sección 4.2.A)
- **Origen del Hallazgo:** Nuevos Requerimientos Técnicos: Modularización y Migración (Sección 4.2.A).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Matrículas históricas, vinculación estudiante-cuenta, ID único de matrícula.
- **Descripción del Alcance:** Administrar matrículas anuales, cambios de grado/sección y estado académico con ID único de matrícula.
- **Criterios de Aceptación:** Historial de matrículas desacoplado de la cuenta de usuario sin duplicación de cuentas.
- **Estado:** [X] Completada

### [REQ-MOD-008] Microservicio Académico - Grados, Secciones, Asignaturas y Pensum (Sección 4.2.B - 4.2.C)
- **Origen del Hallazgo:** Nuevos Requerimientos Técnicos: Modularización y Migración (Sección 4.2.B - 4.2.C).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/config.js`
- **Dependencias Expuestas:** Grados, secciones, catálogo de asignaturas, pensum, periodos evaluativos.
- **Descripción del Alcance:** Centralizar catálogo de asignaturas, asignaciones por grado/sección, pensum y periodos evaluativos.
- **Criterios de Aceptación:** Fuente de verdad académica unificada sin configuraciones redundantes en frontend.
- **Estado:** [X] Completada

### [REQ-MOD-009] Microservicio Académico - Asignaciones Docentes y Relevos (Sección 4.2.D)
- **Origen del Hallazgo:** Nuevos Requerimientos Técnicos: Modularización y Migración (Sección 4.2.D).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/teacher.js`
- **Dependencias Expuestas:** Docentes titulares, asistentes, suplencias, periodos de vigencia de asignación.
- **Descripción del Alcance:** Definir la autoridad de asignaciones docentes (titulares/suplentes), vigencias y revocación de acceso.
- **Criterios de Aceptación:** Control de asignaciones dinámicas y revocación de acceso operativo al expirar el periodo.
- **Estado:** [X] Completada

### [REQ-MOD-010] Matriz de Propiedad Funcional, Inventario y Contratos de Comunicación (Sección 5 - 7)
- **Origen del Hallazgo:** Nuevos Requerimientos Técnicos: Modularización y Migración (Sección 5 - 7).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `Pendientes.md`, `MapaDependencias.md`, `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Matriz de propiedad de datos, inventario de funciones, contratos de API versionados.
- **Descripción del Alcance:** Garantizar que cada entidad tenga una sola autoridad de escritura y contratos de comunicación documentados e idempotentes.
- **Criterios de Aceptación:** Cero escrituras cruzadas directas y contratos de interfaz explícitos para cada microservicio.
- **Estado:** [X] Completada

### [REQ-MOD-011] Prevención de Duplicidad, Adaptadores y Tratamiento de Errores (Sección 8 - 9)
- **Origen del Hallazgo:** Nuevos Requerimientos Técnicos: Modularización y Migración (Sección 8 - 9).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `js/api.js`
- **Dependencias Expuestas:** Adaptadores de retrocompatibilidad, manejo de errores, reintentos, prevención de dependencias circulares.
- **Descripción del Alcance:** Implementar adaptadores temporales, evitar la eliminación prematura de endpoints públicos y prevenir dependencias circulares o ejecuciones duplicadas.
- **Criterios de Aceptación:** Transición sin ruptura de clientes, sin llamadas a funciones deprecadas y con manejo de errores resiliente.
- **Estado:** [X] Completada

---

## REQUERIMIENTOS FASE 3: EXPERIENCIA DE USUARIO, NAVEGACIÓN UNIFICADA Y DISEÑO CENTRADO EN LAS PERSONAS (New Generation Christian Academy)

### [REQ-FASE3-001] Sistema de Diseño Institucional Unificado y Tokens de Diseño
- **Origen del Hallazgo:** Fase 3. Experiencia de usuario, navegación unificada y diseño centrado en las personas.
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `css/style.css`, `student-dashboard.html`, `teacher-dashboard.html`, `index.html`
- **Dependencias Expuestas:** Paleta institucional, botones, tarjetas, modales, badges y estados visuales.
- **Descripción del Alcance:** Unificar colores, tipografías, botones, campos de texto, modales, alertas y estados visuales en toda la plataforma mediante tokens de diseño reusables.
- **Criterios de Aceptación:** Interfaz visual coherente en todos los dashboards con componentes reusables y respuesta adaptable en escritorio, tableta y móvil.
- **Estado:** [X] Completada

### [REQ-FASE3-002] Navegación Global Unificada y Menús Personalizados por Rol
- **Origen del Hallazgo:** Fase 3. Experiencia de usuario, navegación unificada y diseño centrado en las personas.
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `js/ui-common.js`, `js/student.js`, `js/teacher.js`, `student-dashboard.html`, `teacher-dashboard.html`
- **Dependencias Expuestas:** Enrutamiento por rol (Padres, Alumnos, Docentes, Secretaría, Contabilidad, Dirección).
- **Descripción del Alcance:** Proporcionar una navegación global unificada que presente exactamente las opciones que corresponden al rol activo del usuario, preservando el contexto al navegar.
- **Criterios de Aceptación:** Menús diferenciados por rol, navegación SPA con `pushState` e imposibilidad de pérdida de contexto al retroceder.
- **Estado:** [X] Completada

### [REQ-FASE3-003] Portal Familiar Prioritario y Selección de Estudiantes Vinculados
- **Origen del Hallazgo:** Fase 3. Experiencia de usuario, navegación unificada y diseño centrado en las personas.
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `student-dashboard.html`, `js/student.js`, `js/ui-common.js`
- **Dependencias Expuestas:** Selección entre hijos vinculados, lenguaje sencillo, estados financieros y trámites.
- **Descripción del Alcance:** Permitir a padres con múltiples hijos cambiar de estudiante sin cerrar sesión, presentando sus calificaciones, tareas, asistencia, pagos y trámites en un lenguaje humano no técnico.
- **Criterios de Aceptación:** Selector de estudiante funcional en el portal familiar y estados claros orientados a la acción.
- **Estado:** [X] Completada

### [REQ-FASE3-004] Experiencia del Alumno Centrada en Asignaturas, Tareas y Entregas
- **Origen del Hallazgo:** Fase 3. Experiencia de usuario, navegación unificada y diseño centrado en las personas.
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `student-dashboard.html`, `js/student.js`
- **Dependencias Expuestas:** Tarjetas por asignatura, entregas multimodales, calendario y avisos.
- **Descripción del Alcance:** Guiar al estudiante mediante una organización clara por asignatura, proceso paso a paso para la entrega de tareas, comprobante de recepción e indicadores visuales de vencimiento.
- **Criterios de Aceptación:** Tarjetas desplegables por materia, modal de entrega paso a paso con token de confirmación y vista de progreso clara.
- **Estado:** [X] Completada

### [REQ-FASE3-005] Formularios Unificados, Confirmaciones Comprensibles y Ayudas Contextuales
- **Origen del Hallazgo:** Fase 3. Experiencia de usuario, navegación unificada y diseño centrado en las personas.
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `student-dashboard.html`, `teacher-dashboard.html`, `js/student.js`, `js/teacher.js`, `js/ui-common.js`
- **Dependencias Expuestas:** Explicaciones de campos (tooltips), confirmación en dos pasos para acciones sensibles y prevención de pérdida de datos.
- **Descripción del Alcance:** Incorporar ayudas contextuales al pasar el cursor o al tocar en móviles, mensajes de confirmación claros para operaciones sensibles y validaciones cerca del campo afectado.
- **Criterios de Aceptación:** Explicaciones comprensibles en formularios clave y diálogo de confirmación para acciones críticas.
- **Estado:** [X] Completada

### [REQ-FASE3-006] Centro Unificado de Notificaciones, Tareas Pendientes y Vistas Guardadas
- **Origen del Hallazgo:** Fase 3. Experiencia de usuario, navegación unificada y diseño centrado en las personas.
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `student-dashboard.html`, `teacher-dashboard.html`, `js/student.js`, `js/teacher.js`
- **Dependencias Expuestas:** Bandeja de notificaciones multicanal, filtros por parcial/grado y lista de tareas urgentes.
- **Descripción del Alcance:** Unificar las notificaciones de los módulos en un centro de avisos con marcas de lectura y accesos directos a los registros correspondientes.
- **Criterios de Aceptación:** Centro de notificaciones operativo con estados leídos/no leídos e indicadores de prioridad.
- **Estado:** [X] Completada

---

## REQUERIMIENTOS FASE 2: ARQUITECTURA INSTITUCIONAL, IDENTIDAD, INTEROPERABILIDAD Y COMUNICACIÓN (New Generation Christian Academy)

### [REQ-FASE2-001] Desacoplamiento de Entidad Persona y Identidad de Cuenta de Usuario
- **Origen del Hallazgo:** Fase 2. Arquitectura institucional, identidad, interoperabilidad y comunicación entre servicios.
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/api.js`, `MapaDependencias.md`
- **Dependencias Expuestas:** Tablas `Personas`, `Usuarios`, `RelacionesFamiliares`.
- **Descripción del Alcance:** Distinguir la persona humana de sus cuentas de inicio de sesión y registros operativos, permitiendo múltiples cuentas históricas o relaciones sin duplicar datos personales.
- **Criterios de Aceptación:** Funciones de búsqueda de coincidencias, creación de persona, vinculación y estados granulares de cuenta operativos en backend.
- **Estado:** [X] Completada

### [REQ-FASE2-002] Matriz de Propiedad de Datos y Regla de Escritura Única entre Microservicios
- **Origen del Hallazgo:** Fase 2. Arquitectura institucional, identidad, interoperabilidad y comunicación entre servicios.
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/*/Code.gs`, `MapaDependencias.md`
- **Dependencias Expuestas:** Los 5 microservicios (USER, ACADEMIC, ACCOUNTING, TASK, EXAM).
- **Descripción del Alcance:** Asignar una única autoridad de escritura para cada entidad y prohibir escrituras directas cruzadas entre tablas de distintos dominios.
- **Criterios de Aceptación:** Matriz de propiedad de datos mapeada y verificada en el backend.
- **Estado:** [X] Completada

### [REQ-FASE2-003] Resolutor Central de Fuentes de Datos y Definición de Identificadores Estables
- **Origen del Hallazgo:** Fase 2. Arquitectura institucional, identidad, interoperabilidad y comunicación entre servicios.
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/config.js`, `js/api.js`, `backend/*/Code.gs`
- **Dependencias Expuestas:** Mapeo de microservicios y generación de identificadores `PER-`, `USR-`, `EXP-`, `MAT-`, `CRG-`, `PAG-`, `FAC-`.
- **Descripción del Alcance:** Resolver dinámicamente endpoints y hojas de datos mediante el catálogo central, utilizando claves internas estables desacopladas de las etiquetas visibles.
- **Criterios de Aceptación:** Enrutamiento central de servicios mediante `SERVICE_URLS` e identificadores estables desacoplados de referencias estéticas.
- **Estado:** [X] Completada

### [REQ-FASE2-004] Estandarización de Contratos de API, Manejo de Errores e Idempotencia
- **Origen del Hallazgo:** Fase 2. Arquitectura institucional, identidad, interoperabilidad y comunicación entre servicios.
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `js/api.js`, `backend/*/Code.gs`
- **Dependencias Expuestas:** Transporte JSON, taxonomía de códigos de error y prevención de ejecuciones duplicadas.
- **Descripción del Alcance:** Implementar sobres de petición/respuesta uniformes, códigos de error estándar (VALIDATION_ERROR, UNAUTHORIZED, CONFLICT, etc.) e idempotencia con bloqueos para operaciones críticas.
- **Criterios de Aceptación:** Ingesta de errores estandarizada, timeout de 60s, reintentos progresivos y prevención de registros duplicados en backend.
- **Estado:** [X] Completada

### [REQ-FASE2-005] Seguridad RBAC en Servidor y Trazabilidad de Auditoría Estructurada
- **Origen del Hallazgo:** Fase 2. Arquitectura institucional, identidad, interoperabilidad y comunicación entre servicios.
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/*/Code.gs`, `js/api.js`
- **Dependencias Expuestas:** Matriz `ROLE_PERMISSIONS` y tabla `LogsSistema`.
- **Descripción del Alcance:** Validar roles y permisos del lado del servidor para cada acción recibida y registrar eventos estructurados sanitizando claves sensibles.
- **Criterios de Aceptación:** Rechazo explícito `AUTH_PERMISSION_DENIED` para acciones no autorizadas y enmascaramiento automático de secretos en `LogsSistema`.
- **Estado:** [X] Completada

---

## REQUERIMIENTOS FASE 1: AUDITORÍA Y PLANIFICACIÓN DE LA EXPANSIÓN (New Generation Christian Academy)

### [REQ-FASE1-001] Inventario Exhaustivo de Módulos, Pantallas y Servicios Backend (Fundación)
- **Origen del Hallazgo:** Fase 1. Auditoría y planificación de la expansión (Plan General de Implementación).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `Auditoria.txt`, `Pendientes.md`, `MapaDependencias.md`, `backend/*/Code.gs`
- **Dependencias Expuestas:** Todos los microservicios y vistas frontend existentes.
- **Descripción del Alcance:** Inventariar detalladamente los módulos, servicios, pantallas, hojas de cálculo, bases de datos, permisos e integraciones existentes.
- **Criterios de Aceptación:** Documentación completa en `Auditoría.txt` del inventario de funciones y estado operativo.
- **Estado:** [X] Completada

### [REQ-FASE1-002] Matriz Maestra de Cobertura Funcional y Control de Requerimientos
- **Origen del Hallazgo:** Fase 1. Auditoría y planificación de la expansión (Plan General de Implementación).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `Pendientes.md`
- **Dependencias Expuestas:** Matriz de trazabilidad de las 30 fases de la expansión.
- **Descripción del Alcance:** Crear y mantener la matriz maestra de cobertura funcional para controlar cada requerimiento de la expansión institucional.
- **Criterios de Aceptación:** Registro e indexación de requerimientos con estados actualizados e identificadores unívocos en `Pendientes.md`.
- **Estado:** [X] Completada

### [REQ-FASE1-003] Mapa de Interoperabilidad y Secuencia de Implementación por Fases
- **Origen del Hallazgo:** Fase 1. Auditoría y planificación de la expansión (Plan General de Implementación).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `MapaDependencias.md`
- **Dependencias Expuestas:** Contratos de comunicación y dependencias entre módulos.
- **Descripción del Alcance:** Definir las dependencias entre módulos y el orden de implementación por etapas de trabajo (Fundamentos, Núcleo académico, Administración/finanzas, Operaciones, Automatización, Robustez, Validación).
- **Criterios de Aceptación:** Mapeo de dependencias de entidades y servicios actualizado en `MapaDependencias.md`.
- **Estado:** [X] Completada

### [REQ-FASE1-004] Criterios de Calidad, Pruebas, Seguridad y Aceptación de la Expansión
- **Origen del Hallazgo:** Fase 1. Auditoría y planificación de la expansión (Plan General de Implementación).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `METODOLOGIA_DESARROLLO.md`, `Auditoria.txt`
- **Dependencias Expuestas:** Flujo de trabajo, pruebas de regresión, seguridad RBAC y calidad de código.
- **Descripción del Alcance:** Establecer y verificar los criterios de calidad, rendimiento, seguridad RBAC en servidor y pruebas de aceptación para evitar reconstrucciones innecesarias o cambios fuera de alcance.
- **Criterios de Aceptación:** Aprobación de criterios de prueba, verificación de seguridad y metodología de desarrollo respetada al 100%.
- **Estado:** [X] Completada

---

## REQUERIMIENTOS DE CONTABILIDAD, COBROS Y CONTROL FINANCIERO (FASE 9)
- [X] `[REQ-FIN-001]` Parametrización institucional centralizada de zona horaria, moneda y formato de fecha/hora.
- [X] `[REQ-FIN-002]` Tarifas y planes de pago fraccionados por nivel académico, grado y año lectivo.
- [X] `[REQ-FIN-003]` Generación idempotente de cargos a estudiantes con descuentos y recargos por mora.
- [X] `[REQ-FIN-004]` Transacciones de pago consolidadas y carga/revisión de comprobantes de transferencia.
- [X] `[REQ-FIN-005]` Facturación fiscal SAR (CAI, Rango Autorizado, ISV 15%, RTN) y notas de crédito.
- [X] `[REQ-FIN-006]` Integración de pasarelas de pago externas con credenciales y pruebas de conexión.
- [X] `[REQ-FIN-007]` Apertura, movimientos de caja chica, conteo físico y cierres de caja equilibrados.
- [X] `[REQ-FIN-008]` Extractos y conciliación bancaria automatizada.
- [X] `[REQ-FIN-009]` Cuentas por pagar, compras a proveedores y gastos operativos.
- [X] `[REQ-FIN-010]` Plan de cuentas jerárquico y generación de asientos contables por partida doble.

---

## REQUERIMIENTOS DE RECURSOS HUMANOS, PLANILLAS, POLÍTICAS Y CONFIGURACIÓN FISCAL (FASE 10)
- [X] `[REQ-RH-001]` Expedientes laborales y ciclo de vida de empleados con estados de vinculación.
- [X] `[REQ-RH-002]` Contratos laborales, vigencias, cargos, puestos y departamentos organizativos.
- [X] `[REQ-RH-003]` Asistencia de personal, tardanzas, ausencias y solicitudes de vacaciones/permisos.
- [X] `[REQ-RH-004]` Motor de cálculo de planillas salariales con deducciones de ley en Honduras (IHSS, RAP, ISR).
- [X] `[REQ-RH-005]` Opciones avanzadas del Contador: políticas de impuestos, retenciones, comisiones y redondeo determinista.
- [X] `[REQ-RH-006]` Páginas institucionales de Política de Privacidad, Uso/Condiciones y Política Financiera.
- [X] `[REQ-RH-007]` Registro de lectura y evidencia de aceptación de políticas institucionales por usuario.
- [X] `[REQ-RH-008]` Segregación estricta de funciones y matriz RACI entre Recursos Humanos, Planillas, Contabilidad y Tesorería.
- [X] `[REQ-RH-009]` Integración idempotente de obligaciones de nómina con cuentas por pagar de la Fase 9.
- [X] `[REQ-RH-010]` Recibos individuales de pago para consulta privada por parte de cada empleado.

---

## REQUERIMIENTOS DE ANALÍTICA AVANZADA, DASHBOARDS Y SERVICIOS COMPLEMENTARIOS (FASE 11)
- [X] `[REQ-ANL-001]` Dashboards e indicadores unificados por rol (Administrador, Dirección, Secretaría, Contador, Docente, Estudiante).
- [X] `[REQ-ANL-002]` Centro de informes y analítica institucional con filtros comparativos multivariables.
- [X] `[REQ-ANL-003]` Exportación, generación e impresión de reportes y documentos en PDF, XLSX y CSV.
- [X] `[REQ-ANL-004]` Módulo de biblioteca y recursos educativos con control de ejemplares, préstamos y reservas.
- [X] `[REQ-ANL-005]` Control de inventario institucional con trazabilidad de movimientos y alertas de existencias mínimas.
- [X] `[REQ-ANL-006]` Gestión de activos patrimoniales, asignaciones, custodios y estados de conservación.
- [X] `[REQ-ANL-007]` Módulo de transporte escolar con unidades, rutas, paradas, conductores y control de capacidad.
- [X] `[REQ-ANL-008]` Repositorio de plantillas administrativas y biblioteca documental institucional.
- [X] `[REQ-ANL-009]` Configuración de integraciones externas (Google Drive, pasarelas, SMS/WhatsApp) y opciones avanzadas.
- [X] `[REQ-ANL-010]` Informes oficiales y reportes institucionales aprobados con trazabilidad de emisión.

---

## REQUERIMIENTOS DE DOCUMENTOS ESCOLARES, MIGRACIÓN, SPREADSHEETS Y SACE (FASE 12)
- [X] `[REQ-DOC2-001]` Diseñador de plantillas documentales y gestión de constancias, excusas, justificaciones y permisos.
- [X] `[REQ-DOC2-002]` Llenado multimodal: formularios interactivos en línea y descarga de plantillas vacías o precargadas.
- [X] `[REQ-DOC2-003]` Motor de importación y migración con mapeo dinámico de columnas y vista previa sin desplazamiento de filas.
- [X] `[REQ-DOC2-004]` Validación previa estricta y prevención de colisiones por nombre mediante identificadores únicos.
- [X] `[REQ-DOC2-005]` Catálogo central de spreadsheets distribuidas por año lectivo (2026, 2027, 2028) y área funcional.
- [X] `[REQ-DOC2-006]` Desacoplamiento entre datos permanentes del estudiante y registros académicos/financieros anuales.
- [X] `[REQ-DOC2-007]` Lector y completador automático de archivos oficiales de SACE preservando fórmulas, hojas auxiliares y formato.
- [X] `[REQ-DOC2-008]` Generación y verificación de archivos SACE con notas ordinarias, recuperaciones y promedios finales.
- [X] `[REQ-DOC2-009]` Auditoría de ejecuciones de importación, logs por fila y procedimientos de reversión lógica.
- [X] `[REQ-DOC2-010]` Seguridad, permisos en servidor (RBAC) y restricciones de acceso para spreadsheets y documentos exportados.

---

## REQUERIMIENTOS DE DISEÑADOR UNIVERSAL DE DOCUMENTOS Y PLANTILLAS (FASE 22)
- [X] `[REQ-DOC3-001]` Catálogo centralizado de plantillas institucionales con metadatos completos y RBAC por departamento.
- [X] `[REQ-DOC3-002]` Gestión del ciclo de vida de plantillas (Borrador, En revisión, Publicada, Suspendida, Archivada) con versionado inmutable.
- [X] `[REQ-DOC3-003]` Editor interactivo de plantillas con formateo de página, orientación, márgenes y selector de variables dinámicas `{{...}}`.
- [X] `[REQ-DOC3-004]` Resolución de campos dinámicos en backend, previsualización con resaltado de marcas pendientes e importación de bases documentales.
- [X] `[REQ-DOC3-005]` Generación de documentos oficiales con código inmutable de verificación (`VERIF-XXXXXX`) e indexación en Google Drive.
- [X] `[REQ-DOC3-006]` Trazabilidad total de emisiones, desvinculación retroactiva y desacoplamiento de datos sensibles.

---

## REQUERIMIENTOS DE EDITOR VISUAL DE PDF Y CAMPOS SUPERPUESTOS (FASE 23)
- [X] `[REQ-PDF-001]` Importación y Carga de PDF Base para Diseñador (Selección local o Drive, preservación del original).
- [X] `[REQ-PDF-002]` Visor Multipágina e Interfaz de Capas Superpuestas con renderizado PDF interactivo y controles de zoom/ancho.
- [X] `[REQ-PDF-003]` Sistema de Coordenadas Normalizadas `(xRatio, yRatio, wRatio, hRatio)` para alineación perfecta e independiente del visor.
- [X] `[REQ-PDF-004]` Panel de Propiedades y Vinculación con Fuentes Institucionales Autorizadas (`{{estudiante.nombreCompleto}}`, etc.).
- [X] `[REQ-PDF-005]` Estampado y Generación Oficial de PDF con Datos Reales, Token `VERIF-XXXXXX` e indexación en Google Drive.
- [X] `[REQ-PDF-006]` Trazabilidad total, auditoría backend, gestión de versiones y resiliencia ante errores de almacenamiento.

---

## REQUERIMIENTOS DE CONTROL ACADÉMICO, HISTORIAL DE CALIFICACIONES, ROLES, HORARIOS, IMPORTACIÓN DE EXCEL E INTEGRACIÓN FINANCIERA (FASE 28)
- [X] `[REQ-F28-001]` Conservación y archivado anual de contenido operativo (.zip) con manifiesto de integridad sin alterar el libro de notas oficial.
- [X] `[REQ-F28-002]` Inalterabilidad absoluta de calificaciones de años escolares anteriores en backend para todos los roles de la plataforma.
- [X] `[REQ-F28-003]` Bloqueo de calificaciones al cerrar periodos de evaluación y protección de edición para cuentas con doble rol (Docente + Padre).
- [X] `[REQ-F28-004]` Protección estricta de la privacidad de la cuenta del Administrador/Desarrollador principal frente a consultas de usuarios ordinarios.
- [X] `[REQ-F28-005]` Módulo y dashboard de Coordinación Académica para asignación docente (límite 1 sección principal por profesor por año lectivo) y maestro guía.
- [X] `[REQ-F28-006]` Generador y validador de horarios de clase con distribución de unidades consecutivas, prevención de colisiones de docentes/aulas y eventos especiales.
- [X] `[REQ-F28-007]` Importador universal de archivos Excel (.xlsx) con flujo de mapeo de columnas, vista previa pre-validada y verificación en servidor.
- [X] `[REQ-F28-008]` Idempotencia en transacciones financieras para evitar cobros o abonos duplicados en reintentos o eventos repetidos.
- [X] `[REQ-F28-009]` Aplicación obligatoria de la Política de Lenguaje Comprensible (Plain Language) en todos los textos e interfaces visibles para el usuario final.

---

## REQUERIMIENTOS DE INFORMES INSTITUCIONALES, AUDITORÍA, COPIAS DE SEGURIDAD Y RECUPERACIÓN DE DATOS (FASE 29)
- [X] `[REQ-F29-001]` Centro Unificado de Informes Institucionales por departamento (Académica, Secretaría, Asistencia, Contabilidad, Tienda, Cafetería, Recursos Humanos, Plataforma).
- [X] `[REQ-F29-002]` Regla de cálculo financiero estricto: exclusión obligatoria de valores pendientes o cancelados en ingresos y totales confirmados.
- [X] `[REQ-F29-003]` Registro de auditoría estructurado (`getStructuredLogs`, `getAuditReport`) con protección backend contra alteraciones o purgas no autorizadas.
- [X] `[REQ-F29-004]` Copias de seguridad y restauración del sistema (`createSystemBackup`, `verifyBackupIntegrity`, `restoreSystemBackup`) con preservación explícita de calificaciones históricas oficiales (`CalificacionesEstudiantes`, `RecuperacionesEstudiante`).
- [X] `[REQ-F29-005]` Motor de guías interactivas y tutoriales paso a paso (`window.startInteractiveGuide`) para estudiantes (entregas) y profesores (calificación/revisión), persistiendo avance en `localStorage`.
- [X] `[REQ-F29-006]` Visor integrado de documentos (PDF, Word, Imágenes) en modal para revisión sin descargas obligatorias.
- [X] `[REQ-F29-007]` Herramienta de comparación de entregas ("Comparar con otra tarea") lado a lado o en pila con notas pedagógicas y asignación de calificaciones.
- [X] `[REQ-F29-008]` Importador universal de Excel potenciado por rol con reconocimiento de encabezados multinivel/agrupados y asistente de mapeo.
- [X] `[REQ-F29-009]` Aplicación integral de la Política de Lenguaje Comprensible en todas las guías, mensajes y centros de informes.

---

## REQUERIMIENTOS DE VISUALIZACIÓN DE DOCUMENTOS ANTIGUOS, CARGAS REANUDABLES Y RECUPERACIÓN SEGURA DE ARCHIVOS (FASE 30)
- [X] `[REQ-F30-001]` Lectura y extracción estructurada de documentos de Word y oficina antiguos (`.doc`, `.docx`, `.rtf`, `.txt`, `.odt`).
- [X] `[REQ-F30-002]` Visor unificado de documentos grandes fragmentados presentados de forma continua sin fisuras visuales.
- [X] `[REQ-F30-003]` Protocolo backend de carga reanudable (`initiateResumableUpload`, `uploadChunk`, `getUploadProgress`, `cancelUploadSession`, `reconstructFileParts`) por punto de control.
- [X] `[REQ-F30-004]` Regla de reemplazo progresivo en "Empezar de nuevo" preservando los archivos antiguos hasta confirmar la subida de los nuevos bloques.
- [X] `[REQ-F30-005]` Ordenamiento numérico natural estricto para partes fragmentadas (`Parte 1`, `Parte 2`, ..., `Parte 10`).
- [X] `[REQ-F30-006]` Cliente JS unificado (`window.uploadResumableFile`) con estimación de tiempo restante (ETA), porcentaje de avance real y diálogo de reanudación.
- [X] `[REQ-F30-007]` Prevención de pérdida de progreso ante cambios de pestaña y avisos al usuario.
- [X] `[REQ-F30-008]` Integración de la carga reanudable en entregas de tareas, materiales docentes, comprobantes financieros y formularios.
- [X] `[REQ-F30-009]` Mensajes de error en lenguaje claro sin exposición de rutas ni detalles técnicos.

---

## REQUERIMIENTOS DE INTEGRACIÓN TRANSVERSAL, EXPERIENCIA DE USUARIO, ACCESIBILIDAD Y VALIDACIÓN INTEGRAL (FASE 31)
- [X] `[REQ-F31-001]` Coherencia e integración transversal completa entre los microservicios de la plataforma (USER, ACADEMIC, ACCOUNTING, EXAM, TASK).
- [X] `[REQ-F31-002]` Validación server-side estricta de permisos RBAC mediante `getUserVerifiedRole` en backend.
- [X] `[REQ-F31-003]` Autonomía 100% nativa de la mensajería interna y notificaciones en bandeja sin dependencia obligatoria de proveedores externos.
- [X] `[REQ-F31-004]` Inalterabilidad garantizada de calificaciones históricas de estudiantes en todos los módulos y operaciones del sistema.
- [X] `[REQ-F31-005]` Accesibilidad universal con anillos de foco visibles, alto contraste, etiquetas ARIA y navegación completa por teclado (escuchador global ESC).
- [X] `[REQ-F31-006]` Diseño adaptable y responsivo para dispositivos móviles, tabletas y computadoras en todos los paneles.
- [X] `[REQ-F31-007]` Aplicación integral de la Política de Lenguaje Comprensible en todas las interfaces, guías y avisos de la plataforma.
- [X] `[REQ-F31-008]` Verificación end-to-end de recorridos completos por rol (Estudiante, Docente, Coordinación, Dirección, Contabilidad, Secretaría, Recursos Humanos).
- [X] `[REQ-F31-009]` Preservación de la privacidad de cuentas de administración/desarrollo frente a consultas de usuarios ordinarios.
- [X] `[REQ-F31-010]` Idempotencia en transacciones financieras para evitar cobros o abonos duplicados en reintentos.

---

## REQUERIMIENTOS DE CIERRE DEL PLAN MAESTRO, CONDICIONES LEGALES, PROPIEDAD INTELECTUAL Y ASISTENCIA CONTEXTUAL (FASE 32)
- [X] `[REQ-F32-001]` Acuerdo de condiciones de uso con declaración explícita de propiedad intelectual del software a favor de JyP Solutions S. de R.L. de C.V. y propiedad de datos/expedientes para el cliente.
- [X] `[REQ-F32-002]` Aviso de condiciones de uso e identificación del proveedor (Sede: San Pedro Sula, Cortés, Honduras. Tel: 33900758).
- [X] `[REQ-F32-003]` Política de privacidad y tratamiento seguro de información personal, académica y financiera.
- [X] `[REQ-F32-004]` Política de seguridad y uso responsable con inalterabilidad de registros oficiales.
- [X] `[REQ-F32-005]` Aviso de propiedad intelectual y alcance de la licencia de uso.
- [X] `[REQ-F32-006]` Apartado "Contáctanos" con datos confirmados y enlace telefónico interactivo.
- [X] `[REQ-F32-007]` Preguntas Frecuentes oficiales dirigidas a usuarios finales organizadas por categorías.
- [X] `[REQ-F32-008]` Gestión de versiones de documentos legales y registro de aceptaciones en backend (`AceptacionesPoliticas`).
- [X] `[REQ-F32-009]` Sistema de asistencia contextual interactiva (`window.openContextualHelpModal`) con guías paso a paso filtradas por rol y panel.
- [X] `[REQ-F32-010]` Garantía de inalterabilidad de archivos originales en el diseñador de plantillas y generación documental.

---

## REQUERIMIENTOS DE MODO SIN CONEXIÓN, ALMACENAMIENTO LOCAL Y SINCRONIZACIÓN (FASE ADICIONAL)
- [X] `[REQ-OFF-001]` Aplicación Web Progresiva (PWA) con Service Worker (`sw.js`) y precaché estático offline para inicio sin internet.
- [X] `[REQ-OFF-002]` Navegación y consulta de documentos guardados localmente sin solicitudes innecesarias al servidor.
- [X] `[REQ-OFF-003]` Almacén privado IndexedDB (`ngca_offline_db`) con catálogos de documentos, configuraciones, cola de acciones y preguntas frecuentes.
- [X] `[REQ-OFF-004]` Cola de sincronización de operaciones pendientes (`window.queueOfflineAction`, `window.syncOfflineQueue`) al detectar reconexión.
- [X] `[REQ-OFF-005]` Detección de conflictos de concurrencia y modal interactivo de resolución de versiones (`window.openConflictResolutionModal`).
- [X] `[REQ-OFF-006]` Distintivos visibles de estado de sincronización (`Local`, `En línea`, `Sincronizado`, `Pendiente`, `Conflicto`).
- [X] `[REQ-OFF-007]` Preservación de la copia en línea en Google Drive manteniendo el procedimiento de respaldo institucional.
- [X] `[REQ-OFF-008]` Indicador dinámico de estado de red (`#online-status-badge`).
- [X] `[REQ-OFF-009]` Módulo de Preguntas Frecuentes Institucionales (`window.renderFAQSection`) con 32 preguntas y respuestas completas.
- [X] `[REQ-OFF-010]` Sincronización automática de configuraciones globales y preferencias por rol.
