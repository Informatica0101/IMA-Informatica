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

## REQUERIMIENTOS DE EXPANSIÓN Y DESARROLLO (New Generation Bilingual School and Institute)

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
- **Descripción del Alcance:** Reemplazar todas las menciones institucionales anteriores por "New Generation Bilingual School and Institute", renombrar recurso de logotipo a `new-generation-logo.png` y actualizar PWA manifest.
- **Criterios de Aceptación:** No existen referencias institucionales obsoletas en la UI pública. El logotipo carga correctamente en todas las vistas.
- **Estado:** [ ] Pendiente

### [REQ-EXP-008] Sistema de Roles y Permisos Granulares Servidor/RBAC (Sección 5)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 5).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/config.js`, `js/api.js`
- **Dependencias Expuestas:** Matriz de autorización por rol (Administrador, Director, Subdirector, Secretaría, Contador, Consejeros, Profesor, Asistente, Alumnos/Padres).
- **Descripción del Alcance:** Validar roles y permisos del lado del servidor en cada endpoint. Garantizar que ocultar botones en la interfaz no sea el único mecanismo de seguridad.
- **Criterios de Aceptación:** Rechazo explícito en backend (`AUTH_PERMISSION_DENIED`) ante peticiones no autorizadas para la responsabilidad del usuario.
- **Estado:** [ ] Pendiente

### [REQ-EXP-009] Módulo de Matrícula y Control Financiero del Estudiante (Sección 8)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 8).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/student.js`, `student-dashboard.html`
- **Dependencias Expuestas:** Expediente del alumno, vinculación financiera-académica.
- **Descripción del Alcance:** Registrar matrículas/rematrículas por periodo, asociar cargos, becas, descuentos y exoneraciones sin duplicar cobros ni bloquear inapropiadamente la visualización académica autorizada.
- **Criterios de Aceptación:** Historial de matrícula independiente, cargos generados correctamente sin duplicaciones.
- **Estado:** [ ] Pendiente

### [REQ-EXP-010] Módulo Contable y Financiero - Conceptos, Mensualidades y Cobros (Sección 9.1 - 9.3)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 9.1 - 9.3).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/config.js`
- **Dependencias Expuestas:** Cuentas por cobrar, importes por nivel/grado, pagos parciales.
- **Descripción del Alcance:** Configurar conceptos de cobro (mensualidades, matrícula, libros, transporte), generar estados de cuenta y registrar pagos por múltiples métodos.
- **Criterios de Aceptación:** Control de saldos pendientes, registro de abonos y trazabilidad de ajustes.
- **Estado:** [ ] Pendiente

### [REQ-EXP-011] Portal Estudiantil de Pagos y Recibos Únicos en PDF (Sección 9.4 - 9.5)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 9.4 - 9.5).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `student-dashboard.html`, `js/student.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Comprobantes adjuntos, numeración correlativa de recibos.
- **Descripción del Alcance:** Permitir consulta de vencimientos, carga de comprobantes de transferencia y generación/descarga de recibos PDF únicos correlativos.
- **Criterios de Aceptación:** Emisión de PDF de recibo con numeración correlativa no duplicable para pagos confirmados.
- **Estado:** [ ] Pendiente

### [REQ-EXP-012] Módulo de Facturación Fiscal Hondureña (Sección 9.6 / 10.3)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 9.6 / 10.3).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Módulo fiscal independiente separado del recibo interno.
- **Descripción del Alcance:** Incorporar gestión de documentos fiscales tributarios aplicables en Honduras, con trazabilidad hacia cargos y cobros sin confundir el recibo interno con la factura fiscal.
- **Criterios de Aceptación:** Separación arquitectónica estricta entre control financiero interno y facturación fiscal.
- **Estado:** [ ] Pendiente

### [REQ-EXP-013] Gestión de Caja, Bancos, Ingresos y Egresos (Sección 9.7 / 10.1 - 10.2)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 9.7 / 10.1 - 10.2).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Apertura/cierre de caja, conciliaciones bancarias, cuentas por pagar/cobrar.
- **Descripción del Alcance:** Registrar movimientos de caja chica, depósitos bancarios, proveedores, egresos e informes de conciliación periódica.
- **Criterios de Aceptación:** Cierres de caja cuadrados con trazabilidad completa de ingresos y gastos.
- **Estado:** [ ] Pendiente

### [REQ-EXP-014] Módulo de Planillas, Deducciones y Asistencia de Personal (Sección 11)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 11).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Expedientes laborales, salarios, deducciones de ley en Honduras (IHSS, RAP, ISR).
- **Descripción del Alcance:** Generar planillas periódicas, calcular horas extras, bonificaciones, deducciones, control de asistencia (entradas/salidas/tardanzas) e informes de costos laborales.
- **Criterios de Aceptación:** Comprobantes de pago de planilla generados y acceso restringido estrictamente por rol.
- **Estado:** [ ] Pendiente

### [REQ-EXP-015] Módulo de Inventarios, Activos y Control de Proveedores (Sección 12)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 12).
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Productos, materiales, mobiliario, existencias mínimas.
- **Descripción del Alcance:** Controlar entradas, salidas, préstamos, devoluciones, bajas y conteos físicos de consumibles y activos fijos de la institución.
- **Criterios de Aceptación:** Kardex de inventario actualizado y alertas de stock mínimo.
- **Estado:** [ ] Pendiente

### [REQ-EXP-016] Módulo de Noticias y Comunicación Institucional por Secretaría (Sección 13)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 13).
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/index-ui.js`
- **Dependencias Expuestas:** Banners de noticias, audiencia por nivel/grado/sección.
- **Descripción del Alcance:** Permitir al rol Secretaría publicar, editar y retirar noticias institucionales con vigencia de fechas y filtros de audiencia destinataria.
- **Criterios de Aceptación:** Publicación de avisos segmentada por público objetivo.
- **Estado:** [ ] Pendiente

### [REQ-EXP-017] Consola de Administración Técnica, Panel de Estado y Health Checks Ping-Pong (Sección 14.1 - 14.3)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 14.1 - 14.3).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Monitoreo de microservicios (USER, ACADEMIC, TASK, EXAM).
- **Descripción del Alcance:** Construir panel de estado general para el rol Administrador con solicitudes ping-pong de salud real de los endpoints, tiempos de respuesta e indicadores visuales (En línea, Degradado, Fuera de línea).
- **Criterios de Aceptación:** Verificación real de conectividad sin estados simulados.
- **Estado:** [ ] Pendiente

### [REQ-EXP-018] Sistema de Logs Estructurados por Servicio y Función (Sección 14.4 - 14.6)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 14.4 - 14.6).
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `js/api.js`
- **Dependencias Expuestas:** Visor de logs en Consola Técnica.
- **Descripción del Alcance:** Registrar eventos con fecha, hora, severidad, servicio, función y códigos de error unívocos (ej. `AUTH_INVALID_CREDENTIALS`, `SHEETS_WRITE_FAILED`), con filtros por severidad y fecha.
- **Criterios de Aceptación:** Logs detallados sin exponer información sensible ni contraseñas.
- **Estado:** [ ] Pendiente

### [REQ-EXP-019] Módulo de Copias de Seguridad, Verificación y Mantenimiento Seguro (Sección 14.7 - 14.8)
- **Origen del Hallazgo:** Requerimientos de Desarrollo y Expansión (Sección 14.7 - 14.8).
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Drive API, automatización de respaldos de datos de la institución.
- **Descripción del Alcance:** Crear respaldos manuales/programados, verificar integridad de archivos guardados, control de restauración protegida con confirmación doble y herramientas de mantenimiento seguro.
- **Criterios de Aceptación:** Generación exitosa de respaldos verificables con políticas de retención.
- **Estado:** [ ] Pendiente
