# REGISTRO DUAL Y PENDIENTES DE IMPLEMENTACIÓN
===============================================================================
FASE 6. EXPEDIENTE INSTITUCIONAL Y CICLO DE VIDA DEL ESTUDIANTE
===============================================================================

### [TAREA-F6-001] Restringir los controles de gestión de expedientes duplicados según los permisos efectivos del usuario
- **Origen del Hallazgo:** `Auditoria.txt` / `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` (P3 / Hallazgo Menor)
- **Severidad/Clasificación:** Bajo (Mejora de interfaz y adecuación a permisos)
- **Archivos Involucrados:**
  - `teacher-dashboard.html`
  - `js/teacher.js`
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `ROLE_PERMISSIONS`, `validateRolePermission`, `getStudentFile`, `findDuplicateStudents`, `mergeStudentFiles`
- **Descripción del Alcance:**
  El panel docente contiene la pestaña `#tab-stfile-duplicates` relacionada con la gestión de expedientes duplicados. La interfaz puede mostrar opciones administrativas que no corresponden a las responsabilidades de un profesor. La mejora debe evitar que el usuario encuentre controles que no puede utilizar y preservar el acceso a las demás funciones autorizadas del expediente.

  Requisitos Funcionales:
  1. Identificar los permisos efectivos del usuario autenticado antes de construir o mostrar los controles de gestión de duplicados.
  2. Ocultar la pestaña, los botones y las acciones de resolución o fusión para los usuarios que carezcan de autorización.
  3. Mostrar dichos controles únicamente a los usuarios que dispongan de los permisos administrativos correspondientes.
  4. Reutilizar las reglas de autorización existentes. No crear una segunda matriz de permisos independiente en la interfaz.
  5. Aplicar la restricción a todas las acciones relacionadas, incluidas las que se encuentren en menús contextuales, cuadros de diálogo y controles secundarios.
  6. Mantener la validación de permisos en el backend. La restricción visual no debe convertirse en el único mecanismo de seguridad.
  7. No modificar las capacidades de búsqueda, consulta, edición de datos personales, gestión documental o consulta histórica que correspondan al usuario.
  8. Actualizar correctamente la interfaz cuando cambie la sesión, el usuario autenticado o su contexto de permisos.
- **Criterios de Aceptación:**
  - CA-001: Un usuario exclusivamente docente no visualiza la pestaña de duplicados ni sus acciones administrativas.
  - CA-002: Un usuario autorizado visualiza los controles correspondientes y puede utilizarlos según sus permisos.
  - CA-003: Una llamada directa al servicio por parte de un usuario no autorizado continúa siendo rechazada por el backend.
  - CA-004: Al cerrar sesión o cambiar de usuario, la interfaz no conserva controles correspondientes a la sesión anterior.
  - CA-005: La ocultación de los controles no afecta las demás pestañas ni las operaciones autorizadas del expediente.
  - CA-006: La interfaz mantiene su funcionamiento en dispositivos móviles y de escritorio.
  - CA-007: Las pruebas de regresión confirman que la gestión de duplicados continúa funcionando para los usuarios autorizados.
- **Estado:** [X] Completado

---

### [TAREA-F6-002] Implementar supervisión del almacenamiento documental y alertas preventivas de capacidad
- **Origen del Hallazgo:** `Auditoria.txt` / `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` (P3 / Mantenimiento Preventivo)
- **Severidad/Clasificación:** Bajo (Mejora operativa y mantenimiento preventivo)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - Carpeta de Google Drive `Documentos_Estudiantes`
- **Dependencias Expuestas:** `uploadStudentDocument`, `DriveApp`, `PropertiesService`, `sendMultiChannelNotification`, `getStructuredLogs`
- **Descripción del Alcance:**
  Establecer una supervisión preventiva para anticipar problemas de capacidad en Google Drive y evitar interrupciones inesperadas en la carga documental de expedientes.

  Requisitos Funcionales:
  2.1. Supervisión del almacenamiento:
  1. Identificar el almacenamiento real utilizado por los documentos del expediente.
  2. Determinar qué información de capacidad está disponible mediante las APIs y permisos actuales.
  3. Consultar el espacio utilizado, la capacidad disponible y los límites aplicables cuando el proveedor exponga esos datos.
  4. Diferenciar entre el almacenamiento general de la cuenta, el almacenamiento compartido y las limitaciones específicas de las operaciones, cuando corresponda.
  5. Evitar presentar como capacidad disponible una cifra que no pueda obtenerse de forma fiable.
  6. Registrar los errores que impidan consultar las métricas.

  2.2. Umbrales preventivos:
  Permitir configurar umbrales de advertencia para anticipar problemas de capacidad:
  - Advertencia preventiva al alcanzar el 80% de la capacidad monitorizada.
  - Advertencia de prioridad alta al alcanzar el 90%.
  - Estado crítico al alcanzar el 95%.
  Los porcentajes deben calcularse únicamente cuando exista una capacidad total conocida y una métrica de uso compatible. Si el proveedor no expone una capacidad total fiable, utilizar las métricas disponibles y comunicar la limitación en lugar de producir porcentajes ficticios.

  2.3. Panel de supervisión:
  Cuando exista una interfaz administrativa adecuada, mostrar: Estado del almacenamiento, última actualización de métricas, capacidad utilizada/disponible, umbral alcanzado, errores de consulta, estado de alertas y acciones recomendadas.

  2.4. Alertas:
  1. Evitar generar alertas repetitivas en cada consulta mientras persista la misma condición.
  2. Registrar cuándo se detectó el problema.
  3. Permitir reconocer una alerta sin borrar su historial.
  4. Generar una nueva alerta si el estado empeora o si hay recuperación seguida de nueva incidencia.
  5. Informar a los responsables administrativos autorizados sin enviar notificaciones repetitivas sin control de frecuencia.

  2.5. Integración con la carga documental:
  La supervisión no reemplaza las validaciones actuales de formato (PDF, JPG, PNG, WEBP), tamaño (10MB) ni integridad (0 bytes). Si se detecta un problema real de almacenamiento, comunicar el error de carga de forma comprensible sin dejar referencias documentales incompletas.
- **Criterios de Aceptación:**
  - CA-008: El sistema obtiene y muestra las métricas de almacenamiento disponibles mediante los servicios autorizados.
  - CA-009: Cuando no se dispone de una métrica fiable, la interfaz identifica expresamente esa limitación.
  - CA-010: Los umbrales configurados generan el estado de advertencia correspondiente.
  - CA-011: Una misma condición persistente no genera notificaciones ilimitadas.
  - CA-012: Los errores de consulta quedan registrados y no se interpretan como almacenamiento disponible.
  - CA-013: Una carga documental fallida no se presenta como exitosa ni deja una referencia válida a un archivo inexistente.
  - CA-014: Las validaciones documentales actuales continúan funcionando.
  - CA-015: La supervisión no consume innecesariamente las cuotas de ejecución ni provoca un deterioro apreciable de las operaciones habituales.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-003] Ampliar la consulta del historial de matrícula con filtros, cronología detallada y exportación
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` (P2 / Oportunidad de Ampliación)
- **Severidad/Clasificación:** Medio (Ampliación funcional propuesta)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `js/secretary.js`
  - `dashboard-secretaria.html`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `getStudentFile`, `getStudentTimeline`, `getStudentEnrollmentHistory`, `Matriculas`, `MovimientosEstudiante`, `HistorialAcademico`
- **Descripción del Alcance:**
  Ampliar la consulta histórica para facilitar la reconstrucción de la trayectoria institucional del estudiante sin alterar el mecanismo de conservación histórica existente.

  Requisitos Funcionales:
  1. Permitir consultar el historial completo del estudiante en orden cronológico.
  2. Distinguir claramente el periodo actual de los periodos anteriores.
  3. Mostrar cuando exista la información: Año escolar, fecha de ingreso y salida, grado y sección, jornada y programa, tipo de movimiento, estado de la matrícula, motivo del movimiento, usuario responsable del registro y fecha de registro de la operación.
  4. Diferenciar la fecha efectiva del movimiento de la fecha en que se registró en el sistema.
  5. Permitir filtrar por año escolar, tipo de movimiento y estado.
  6. Permitir acceder al detalle de un movimiento sin perder el contexto del expediente.
  7. Diferenciar las correcciones administrativas de los movimientos originales.
  8. Incorporar paginación cuando el volumen de registros lo requiera.
  9. Evitar consultas repetitivas innecesarias y mantener tiempos de respuesta adecuados.
  10. Incorporar exportación a CSV o PDF únicamente si aporta utilidad operativa y puede implementarse respetando los permisos y la protección de datos.
- **Criterios de Aceptación:**
  - CA-016: La cronología muestra todos los movimientos autorizados registrados para el estudiante.
  - CA-017: Los filtros devuelven únicamente los registros correspondientes a los criterios seleccionados.
  - CA-018: Las fechas efectivas y las fechas de registro se muestran diferenciadas cuando ambas existen.
  - CA-019: Consultar un periodo anterior no modifica el expediente ni sus registros.
  - CA-020: La exportación, si se implementa, respeta los permisos y contiene únicamente los registros correspondientes a la consulta.
  - CA-021: El historial sigue siendo legible en dispositivos móviles.
  - CA-022: La ampliación no duplica la lógica de matrícula ni crea una fuente alternativa de información histórica.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-004] Incorporar un panel consolidado de requisitos documentales pendientes del expediente
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` (P2 / Oportunidad de Ampliación)
- **Severidad/Clasificación:** Medio (Ampliación de gestión documental)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `getStudentDocuments`, `uploadStudentDocument`, `updateDocumentStatus`, `DocumentosEstudiante`, `SolicitudesAdmision`
- **Descripción del Alcance:**
  Facilitar que los responsables administrativos identifiquen los expedientes con documentación incompleta, autorizaciones pendientes o documentos sujetos a vencimiento en una vista operativa consolidada.

  Requisitos Funcionales:
  1. Identificar los requisitos documentales aplicables a cada tipo de expediente o proceso.
  2. Distinguir entre: Documento no presentado, recibido y pendiente de revisión, aprobado, rechazado, vencido, próximo a vencer y requisito no aplicable.
  3. Mostrar el nombre del estudiante, su identificador institucional, el requisito pendiente y el estado actual.
  4. Permitir filtrar por año escolar, tipo de documento, estado y responsable de revisión.
  5. Permitir acceder directamente al expediente y al documento relacionado, respetando los permisos.
  6. Mostrar el motivo del rechazo y las instrucciones para subsanar la incidencia cuando exista esa información.
  7. Permitir registrar la resolución de un pendiente y conservar su trazabilidad.
  8. Evitar que un documento opcional se convierta en requisito obligatorio por una configuración incorrecta.
  9. Diferenciar la falta de un documento de un error técnico al consultar o recuperar su archivo.
  10. No bloquear matrículas o movimientos por requisitos que no sean obligatorios según las reglas institucionales.
  11. Si existen notificaciones, permitir informar al responsable administrativo sobre los pendientes que requieren atención.
- **Criterios de Aceptación:**
  - CA-023: Cada requisito aparece con su estado correcto.
  - CA-024: Los documentos aprobados no figuran como pendientes, salvo que exista otra condición pendiente aplicable.
  - CA-025: Un documento rechazado muestra el motivo registrado cuando este existe.
  - CA-026: Los filtros permiten localizar los expedientes que requieren una acción concreta.
  - CA-027: Resolver un pendiente actualiza la vista después de guardar correctamente el cambio.
  - CA-028: Una falla de conexión no cambia artificialmente el estado de un documento.
  - CA-029: El panel no permite consultar expedientes o documentos sin autorización.
  - CA-030: Las reglas de requisitos documentales se aplican de forma coherente con las existentes en el proceso de admisión y matrícula.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-005] Ampliar la supervisión de integridad y consistencia de los expedientes
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` (P2 / Oportunidad de Ampliación)
- **Severidad/Clasificación:** Medio (Mejora preventiva de calidad de datos)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** `auditAndReconcileIdentityInconsistencies`, `reconcileRestoredDataIntegrity`, `verifyBackupIntegrity`, `ExpedientesEstudiantes`, `Matriculas`, `DocumentosEstudiante`, `MovimientosEstudiante`, `RelacionesFamiliares`
- **Descripción del Alcance:**
  Incorporar comprobaciones periódicas que permitan detectar inconsistencias entre el expediente, las matrículas, los documentos y los módulos relacionados, complementando los mecanismos existentes de control de duplicados, trazabilidad y recuperación sin sustituirlos.

  Requisitos Funcionales:
  Implementar un mecanismo de diagnóstico que permita detectar:
  1. Matrículas que referencian expedientes inexistentes.
  2. Documentos cuyo expediente asociado no existe.
  3. Referencias a documentos que no pueden recuperarse.
  4. Matrículas incompatibles para un mismo estudiante y periodo.
  5. Relaciones con responsables que apuntan a registros inexistentes.
  6. Movimientos sin una referencia válida al estudiante.
  7. Diferencias entre la situación actual del expediente y el estado de la matrícula.
  8. Registros duplicados en entidades donde deba existir unicidad.
  9. Referencias inconsistentes entre el expediente y los módulos relacionados.
  10. Errores en la integridad de los datos después de una restauración de respaldo.

  Para cada inconsistencia registrar: Tipo de incidencia, ID del expediente afectado, entidad y referencia involucradas, fecha de detección, nivel de gravedad, estado de resolución y resultado de verificaciones.
  Diferenciar los errores confirmados de las advertencias que requieren revisión humana. No modificar automáticamente registros históricos ni fusionar expedientes basándose únicamente en coincidencias.
- **Criterios de Aceptación:**
  - CA-031: Una referencia inválida introducida en un entorno de prueba es detectada por la comprobación correspondiente.
  - CA-032: Un registro válido no se marca como inconsistente por una condición que no corresponda a las reglas institucionales.
  - CA-033: Cada incidencia incluye información suficiente para localizar el problema.
  - CA-034: La ejecución de las comprobaciones no modifica datos ni registros históricos.
  - CA-035: Repetir una comprobación no genera duplicados innecesarios de la misma incidencia.
  - CA-036: Las incidencias resueltas pueden distinguirse de las pendientes.
  - CA-037: La herramienta respeta los permisos de acceso a los datos personales.
  - CA-038: El proceso puede ejecutarse sin bloquear las operaciones ordinarias del expediente.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-006] Incorporar indicadores de operación y diagnóstico para las integraciones del expediente
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` (P2 / Oportunidad de Ampliación)
- **Severidad/Clasificación:** Medio (Mejora de observabilidad y recuperación)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** `recordTraceabilityLog`, `getTraceabilityCorrelationLogs`, `getOperationalCapacityMetrics`, `BitacoraTraceability`, `LogsSistema`
- **Descripción del Alcance:**
  Facilitar la identificación de errores de sincronización y operaciones incompletas que afecten al expediente, reutilizando los registros y mecanismos de idempotencia que ya funcionan.

  Requisitos Funcionales:
  1. Identificar las operaciones entre servicios que sean críticas para la integridad del expediente.
  2. Registrar el resultado de cada operación relevante.
  3. Distinguir entre operaciones completadas, fallidas, pendientes de recuperación y parcialmente ejecutadas.
  4. Registrar una referencia que permita relacionar el error con la operación original (`correlationId`).
  5. Evitar almacenar datos personales innecesarios en los registros técnicos.
  6. Detectar reintentos repetidos de una misma operación.
  7. Evitar duplicaciones cuando un reintento sea seguro y la operación admita idempotencia.
  8. Permitir consultar los errores recientes por tipo de operación, fecha y estado.
  9. Identificar las dependencias externas que impiden completar una operación.
  10. No presentar una operación como exitosa cuando una etapa obligatoria haya fallado.
  11. Facilitar la conciliación manual o automatizada de las operaciones incompletas.
  12. Mantener los registros de diagnóstico separados de los antecedentes académicos oficiales.
- **Criterios de Aceptación:**
  - CA-039: Una operación fallida deja una evidencia técnica que permite identificar el tipo de error.
  - CA-040: El sistema diferencia una operación fallida de una completada.
  - CA-041: Un reintento no duplica registros cuando la operación está diseñada para ser idempotente.
  - CA-042: Los datos de diagnóstico no exponen información personal innecesaria.
  - CA-043: Una dependencia no disponible produce un estado explícito y no una confirmación falsa de éxito.
  - CA-044: Las herramientas de diagnóstico no permiten modificar datos académicos sin autorización.
  - CA-045: La instrumentación adicional no degrada de forma significativa el rendimiento ni excede innecesariamente las cuotas del entorno.
- **Estado:** [ ] Pendiente
