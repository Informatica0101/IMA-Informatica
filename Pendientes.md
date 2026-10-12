## TAREAS PENDIENTES DE REVISIÓN

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
