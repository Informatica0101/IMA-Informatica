# REGISTRO DUAL Y PENDIENTES DE IMPLEMENTACIÓN
===============================================================================
FASE 6. EXPEDIENTE INSTITUCIONAL Y CICLO DE VIDA DEL ESTUDIANTE
===============================================================================

### [TAREA-F6-001] Restringir los controles de gestión de expedientes duplicados según los permisos efectivos del usuario
- **Origen del Hallazgo:** `Auditoria.txt` / `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 1 (P2 · Seguridad Operativa)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Seguridad operativa e interfaz)
- **Archivos Involucrados:**
  - `teacher-dashboard.html`
  - `js/teacher.js`
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `ROLE_PERMISSIONS`, `validateRolePermission`, `getStudentFile`, `findDuplicateStudents`, `mergeStudentFiles`
- **Descripción del Alcance:**
  El panel docente contiene la pestaña `#tab-stfile-duplicates` relacionada con la gestión de expedientes duplicados, aunque la resolución y fusión corresponde al personal administrativo autorizado. La mejora evita que el usuario encuentre opciones que no puede utilizar, preservando el acceso a las demás funciones autorizadas del expediente.

  Requisitos Funcionales:
  1. Identificar los permisos efectivos del usuario autenticado antes de construir o mostrar los controles de gestión de duplicados.
  2. Ocultar o deshabilitar la pestaña, los botones y las acciones de resolución o fusión para el rol `Profesor`.
  3. Mostrar dichos controles únicamente a los usuarios que dispongan de los permisos administrativos correspondientes.
  4. Reutilizar la matriz de permisos existente (`ROLE_PERMISSIONS` / `RoleCapabilities`). No crear reglas independientes que puedan divergir.
  5. Aplicar la restricción a todas las acciones relacionadas, incluidas las que se encuentren en menús contextuales, cuadros de diálogo y controles secundarios.
  6. Mantener la validación de autorización en el servidor. Ocultar elementos visuales no sustituye los controles del backend.
  7. No alterar la búsqueda general de estudiantes ni la edición de datos personales, gestión documental o consulta histórica autorizada.
  8. Actualizar correctamente la interfaz cuando cambie la sesión, el usuario autenticado o su contexto de permisos. Si el rol no puede determinarse o la sesión no es válida, no mostrar acciones administrativas.
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

### [TAREA-F6-002] Robustecer las operaciones del ciclo de vida y prevenir estados de matrícula incompatibles
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 6 (P1 · Integridad Institucional)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Integridad institucional y transiciones del ciclo de vida)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `changeStudentSection`, `recordStudentTransfer`, `recordStudentWithdrawal`, `processStudentReentry`, `renewStudentEnrollment`, `Matriculas`, `ExpedientesEstudiantes`, `LockService`
- **Descripción del Alcance:**
  Consolidar las reglas de transición de estado institucional del estudiante para evitar inconsistencias entre los registros cuando ocurren operaciones concurrentes o interrumpidas durante todo su ciclo de vida (matrícula, cambios de sección/grado, traslados, retiros, reincorporaciones, promociones y graduaciones).

  Requisitos Funcionales:
  1. Definir las transiciones permitidas entre los estados institucionales del estudiante, diferenciando su condición general de la situación de cada matrícula.
  2. Validar que un estudiante no tenga dos matrículas activas incompatibles para el mismo periodo, conforme a las reglas institucionales.
  3. Antes de procesar un movimiento, comprobar que: el expediente existe y no está fusionado, el periodo escolar de destino es válido, la matrícula de origen corresponde al estudiante, el movimiento es compatible con el estado actual y se cumplen las condiciones académicas y administrativas aplicables.
  4. En cambios de grado, sección, jornada o programa, conservar la matrícula anterior y registrar la nueva situación con su fecha efectiva y motivo.
  5. En traslados, registrar institución de destino, fecha de salida, motivo y estado del trámite (diferenciando solicitado de completado).
  6. En retiros, distinguir entre retiro temporal y definitivo sin eliminar antecedentes.
  7. En reincorporaciones, reutilizar la identidad institucional existente y crear el registro de matrícula para el nuevo periodo.
  8. En promociones y repitencias, utilizar resultados académicos del periodo cerrado y registrar la decisión administrativa cuando corresponda.
  9. En graduaciones, verificar los requisitos configurados, registrar la fecha y el programa finalizado y evitar matrículas activas incompatibles posteriores.
  10. Hacer que cada operación crítica sea idempotente y resistente a solicitudes concurrentes mediante script locks (`LockService`).
  11. Disponer de un mecanismo de recuperación o conciliación ante fallos parciales entre hojas o microservicios.
  12. Registrar las operaciones retroactivas con su fecha efectiva y la fecha real de registro, sin alterar silenciosamente el historial.
- **Criterios de Aceptación:**
  - CA-008: Una segunda solicitud idéntica de reincorporación no crea otra matrícula.
  - CA-009: Dos solicitudes concurrentes que intentan ocupar la misma plaza no exceden la capacidad configurada.
  - CA-010: Una transición no permitida es rechazada sin modificar parcialmente el expediente.
  - CA-011: Un traslado incompleto queda identificado como pendiente de resolución, sin presentar al estudiante como correctamente transferido.
  - CA-012: La promoción o repitencia no modifica las calificaciones históricas.
  - CA-013: Una graduación correctamente registrada conserva el acceso autorizado al expediente histórico.
  - CA-014: Las operaciones retroactivas pueden distinguirse de las realizadas en tiempo real.
  - CA-015: Los registros relacionados mantienen una situación coherente después de un fallo simulado y su recuperación.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-003] Establecer una batería automatizada de regresión para el ciclo de vida del estudiante
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 15 (P1 · Fiabilidad Funcional)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Fiabilidad y pruebas automatizadas)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - Suite de Pruebas / Script de verificación
- **Dependencias Expuestas:** `runConcurrencyAndConsistencySuite`, `validateApiContractsTestSuite`, `runCurricularAreaServiceTests`, `getStudentFile`, `mergeStudentFiles`
- **Descripción del Alcance:**
  Crear una suite automatizada e integral de pruebas de regresión que permita verificar periódicamente los flujos del ciclo de vida del estudiante y prevenir fallos ante futuros cambios en el código.

  Requisitos Funcionales:
  1. Crear pruebas repetibles para los flujos principales: creación de expediente, detección y fusión de duplicados, asociación/revocación de responsables, carga/sustitución/recuperación de documentos, matrícula inicial y renovación, cambios de sección y grado, traslado/retiro/reincorporación, promoción/repitencia/graduación, antecedentes históricos, integraciones, permisos y respaldos.
  2. Incluir casos positivos, entradas inválidas, operaciones concurrentes, fallos de servicios dependientes y reintentos.
  3. Verificar tanto los resultados visibles como los cambios persistidos en las hojas de cálculo y Drive.
  4. Comprobar que los roles no autorizados no puedan ejecutar acciones mediante llamadas directas al backend.
  5. Asegurar que las pruebas utilicen datos sintéticos y aislados sin afectar información de producción.
  6. Comprobar que los cambios de un año lectivo no modifiquen las calificaciones ni las matrículas de años anteriores.
  7. Generar un informe de ejecución que distinga claramente entre pruebas aprobadas, fallidas y no ejecutadas.
- **Criterios de Aceptación:**
  - CA-016: Cada flujo crítico dispone de pruebas reproducibles para su comportamiento esperado y sus casos de error.
  - CA-017: Las pruebas detectan la creación duplicada de matrículas ante reintentos concurrentes.
  - CA-018: Las pruebas detectan accesos no autorizados a expedientes y documentos.
  - CA-019: Las pruebas detectan alteraciones indebidas del historial académico.
  - CA-020: Los fallos de integración no se interpretan como operaciones exitosas.
  - CA-021: Las pruebas pueden ejecutarse sin modificar expedientes reales.
  - CA-022: Los resultados permiten identificar el caso fallido, la condición de entrada y el resultado observado.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-004] Supervisar la capacidad de almacenamiento y los fallos del repositorio documental
- **Origen del Hallazgo:** `Auditoria.txt` / `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 2 (P2 · Continuidad Operativa)
- **Prioridad:** P2
- **Severidad/Clasificación:** Bajo (Mejora operativa y mantenimiento preventivo)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - Carpeta de Google Drive `Documentos_Estudiantes`
- **Dependencias Expuestas:** `uploadStudentDocument`, `DriveApp`, `PropertiesService`, `sendMultiChannelNotification`, `getStructuredLogs`
- **Descripción del Alcance:**
  Establecer una supervisión preventiva para anticipar problemas de capacidad en Google Drive, detectar patrones de fallo en operaciones de carga/descarga y evitar interrupciones en la gestión documental de expedientes.

  Requisitos Funcionales:
  1. Supervisar los fallos de carga, lectura, actualización y recuperación de documentos, distinguiendo entre: falta de permisos, cuotas alcanzadas, errores temporales de conexión, archivos inaccesibles o inconsistencias en BD.
  2. Registrar métricas operativas (cargas exitosas/fallidas, volumen procesado, tiempo de respuesta) sin almacenar ni exponer datos personales sensibles.
  3. Incorporar alertas configurables por umbrales de capacidad: preventiva al 80%, prioridad alta al 90%, estado crítico al 95%.
  4. Diferenciar la capacidad total disponible de cuotas de solicitudes y restricciones específicas de la cuenta.
  5. Permitir a los administradores consultar el estado del servicio documental y el historial de incidentes.
  6. Aplicar reintentos controlados únicamente a errores transitorios, evitando reintentos que generen referencias duplicadas.
  7. Informar claramente el estado final del archivo y de la referencia en BD tras un fallo.
  8. Implementar un procedimiento de conciliación que detecte archivos guardados sin referencia válida en BD y referencias en BD cuyo archivo en Drive no exista.
  9. Garantizar que la supervisión no bloquee ni ralentice la carga normal de documentos.
- **Criterios de Aceptación:**
  - CA-023: El sistema obtiene y muestra las métricas de almacenamiento disponibles mediante los servicios autorizados.
  - CA-024: Cuando no se dispone de una métrica fiable, la interfaz identifica expresamente esa limitación.
  - CA-025: Los umbrales configurados generan el estado de advertencia correspondiente.
  - CA-026: Una misma condición persistente no genera notificaciones ilimitadas.
  - CA-027: Los errores de consulta quedan registrados y no se interpretan como almacenamiento disponible.
  - CA-028: Una carga documental fallida no se presenta como exitosa ni deja una referencia válida a un archivo inexistente.
  - CA-029: La conciliación identifica inconsistencias sin eliminar documentos automáticamente.
  - CA-030: La supervisión no consume innecesariamente las cuotas de ejecución de Google Apps Script.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-005] Completar el flujo de gestión de documentos pendientes, vencidos y faltantes
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 3 (P2 · Gestión Documental)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Ampliación de gestión documental)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `getStudentDocuments`, `uploadStudentDocument`, `updateDocumentStatus`, `DocumentosEstudiante`, `SolicitudesAdmision`
- **Descripción del Alcance:**
  Facilitar que los responsables administrativos identifiquen y gestionen los expedientes con documentación incompleta, autorizaciones pendientes o documentos vencidos durante toda la trayectoria educativa del estudiante.

  Requisitos Funcionales:
  1. Definir requisitos documentales por trámite o condición (admisión inicial, renovación, traslado, graduación, autorizaciones periódicas).
  2. Configurar cada requisito como obligatorio, opcional o condicional (con sus reglas activadoras).
  3. Registrar para cada documento: tipo documental, estudiante/expediente, estado, fecha recepción, fecha vencimiento, revisor, observaciones y versión vigente.
  4. Diferenciar claramente los estados: pendiente, recibido, en revisión, aprobado, rechazado, vencido y exento. Las exenciones de documentos obligatorios deben requerir autorización por rol.
  5. Detectar automáticamente documentos vencidos y próximos a vencer según la zona horaria institucional.
  6. Mostrar los faltantes en el expediente y en los trámites que dependan de ellos con las acciones requeridas para subsanar.
  7. Permitir sustituir documentos rechazados o vencidos sin borrar el archivo previo ni perder el historial de revisiones.
  8. Permitir registrar excepciones justificadas con responsable, fecha, motivo y alcance sin afectar a otros estudiantes.
  9. Evitar que un trámite u expediente aparezca como completo si falta un documento obligatorio no exento.
- **Criterios de Aceptación:**
  - CA-031: Un estudiante con todos los requisitos obligatorios aprobados aparece como documentalmente completo.
  - CA-032: La ausencia de un documento obligatorio impide completar el trámite cuando la normativa configurada así lo exija.
  - CA-033: Un documento opcional faltante no bloquea el trámite.
  - CA-034: Un documento vencido cambia de estado conforme a su fecha, sin modificar el historial de matrículas.
  - CA-035: Una exención autorizada queda registrada y no puede concederla un rol sin permiso.
  - CA-036: La sustitución de un archivo conserva la versión anterior, el autor del cambio y la fecha.
  - CA-037: La lista de pendientes se mantiene consistente tras actualizar o recargar la sesión.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-006] Completar la gestión de autorizaciones, responsables legales y contactos de emergencia
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 4 (P2 · Protección de Estudiantes)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Protección de estudiantes y permisos familiares)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `RelacionesEstudianteTutor`, `RelacionesFamiliares`, `updateFamilyLinkPermissions`, `revokeFamilyLink`, `validateContextualAccess`
- **Descripción del Alcance:**
  Reforzar la administración del ciclo de vida de las autorizaciones familiares y de tutores, haciendo explícitos sus efectos en el acceso a información académica, financiera, documental y de asistencia.

  Requisitos Funcionales:
  1. Mantener separadas las relaciones de parentesco, representación legal, responsabilidad financiera, contacto de emergencia y autorización de retiro.
  2. Permitir múltiples responsables por estudiante y múltiples estudiantes por responsable con registros independientes.
  3. Registrar vigencia, estado, fecha de autorización, fecha de revocación, usuario responsable y evidencia documental asociada.
  4. Permitir revocar una autorización específica sin eliminar otras relaciones válidas.
  5. Establecer reglas para autorizaciones vencidas, responsables sin cuenta de usuario e invitaciones pendientes.
  6. Propagar las revocaciones de inmediato a las comprobaciones de acceso del servidor (`validateContextualAccess`).
  7. Permitir registrar restricciones de custodia judicial o disputas legales para limitar la exposición de datos según permisos efectivos.
  8. Mostrar a los administradores la lista consolidada de quienes tienen acceso al expediente y sus categorías de consulta.
  9. Evitar que editar un responsable sobrescriba datos personales del estudiante o de otros vínculos.
- **Criterios de Aceptación:**
  - CA-038: Un responsable con permiso exclusivamente de emergencia no puede acceder a calificaciones ni información financiera.
  - CA-039: La revocación de un vínculo impide las consultas posteriores protegidas por ese vínculo.
  - CA-040: La revocación de una autorización no elimina otros permisos independientes válidos.
  - CA-041: Un responsable vinculado a varios estudiantes conserva únicamente los accesos autorizados para cada uno.
  - CA-042: Un vínculo vencido no otorga permisos activos.
  - CA-043: Los cambios quedan registrados con autor, fecha, valor anterior, valor nuevo y motivo.
  - CA-044: Las restricciones legales documentadas prevalecen sobre los permisos ordinarios incompatibles.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-007] Fortalecer la trazabilidad del expediente y la consulta del historial institucional
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 5 (P2 · Integridad Histórica)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Trazabilidad y auditoría administrativa)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
  - `js/teacher.js`
- **Dependencias Expuestas:** `getStudentTimeline`, `MovimientosEstudiante`, `Matriculas`, `HistorialCambiosEntidad`, `getEntityAuditHistory`
- **Descripción del Alcance:**
  Consolidar en una vista cronológica completa y auditable todos los eventos del ciclo de vida del expediente para uso administrativo y legal.

  Requisitos Funcionales:
  1. Consolidar cronológicamente: conversión desde admisión, matrículas, renovaciones, cambios de grado/sección/jornada, promociones, repitencias, retiros, traslados, reincorporaciones, graduación, revisión de documentos, cambios de tutores y correcciones administrativas.
  2. Cada evento debe mostrar: fecha/hora, tipo, autor/sistema, periodo escolar, resultado y referencia al registro original.
  3. Diferenciar claramente la situación actual de los antecedentes históricos.
  4. Registrar correcciones históricas autorizadas como nuevos eventos de auditoría conservando el valor anterior, valor nuevo, responsable y motivo.
  5. Proteger la bitácora frente a ediciones ordinarias para evitar borrado silencioso de eventos.
  6. Incorporar filtros por año lectivo, categoría, responsable y tipo de movimiento, más búsqueda textual.
  7. Permitir exportar el historial a un formato legible respetando permisos y minimizando PII.
  8. Mantener trazabilidad de fusiones de expedientes relacionando origen, destino y elementos consolidados.
- **Criterios de Aceptación:**
  - CA-045: Una trayectoria con múltiples movimientos muestra los eventos en orden cronológico exacto.
  - CA-046: Las correcciones autorizadas son visibles como cambios posteriores, sin borrar la trazabilidad previa.
  - CA-047: Un usuario sin permiso no puede consultar valores sensibles anteriores a una modificación.
  - CA-048: Los filtros por año lectivo devuelven exclusivamente los eventos del periodo seleccionado.
  - CA-049: Las fusiones de expedientes conservan una relación verificable entre origen y destino.
  - CA-050: La exportación coincide con los registros que el usuario está autorizado a consultar.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-008] Mejorar la búsqueda global y la navegación operativa del expediente
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 7 (P2 · Productividad Administrativa)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Navegación y productividad administrativa)
- **Archivos Involucrados:**
  - `js/ui-common.js`
  - `dashboard-secretaria.html`
  - `teacher-dashboard.html`
  - `js/secretary.js`
  - `js/teacher.js`
- **Dependencias Expuestas:** `searchGlobalOmnibox`, `findDuplicateStudents`, `ExpedientesEstudiantes`, `Matriculas`
- **Descripción del Alcance:**
  Optimizar la búsqueda global y la navegación del expediente para asegurar la localización rápida e inequívoca del estudiante, evitando errores de selección y clics innecesarios.

  Requisitos Funcionales:
  1. Permitir buscar por identificador de expediente, código de estudiante, DNI, nombres y apellidos.
  2. Normalizar mayúsculas, minúsculas, tildes y espacios sin alterar los datos persistidos.
  3. Distinguir coincidencias exactas de aproximadas e incluir identificadores secundarios para evitar confusión entre homónimos.
  4. Mostrar el estado institucional actual y periodo de matrícula en los resultados de búsqueda.
  5. Permitir filtrar por año lectivo, grado, sección, condición de matrícula y estado del expediente.
  6. Permitir acceso directo desde el resultado al expediente, documentos e historial.
  7. Mantener el contexto de búsqueda y filtros al navegar de ida y vuelta al expediente.
  8. Mostrar estados de carga, resultados vacíos, errores y falta de permisos de forma explícita.
  9. Enmascarar PII sensible (como DNI parcial) según los permisos del rol consultante.
  10. Ante coincidencias ambiguas, exigir selección manual en lugar de abrir automáticamente un expediente.
- **Criterios de Aceptación:**
  - CA-051: La búsqueda encuentra un estudiante por su identificador institucional o DNI.
  - CA-052: Variaciones de tildes o mayúsculas no impiden encontrar el registro.
  - CA-053: Homónimos se presentan como registros independientes claramente diferenciables.
  - CA-054: Un estudiante retirado o graduado puede localizarse indicando su estado real.
  - CA-055: Los fallos de conexión no se presentan como cero resultados.
  - CA-056: La navegación mantiene su funcionamiento en pantallas móviles y de escritorio.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-009] Implementar una matriz de integridad y conciliación entre los módulos institucionales
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 8 (P2 · Consistencia de Datos)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Integridad de datos entre microservicios)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** `auditAndReconcileIdentityInconsistencies`, `reconcileRestoredDataIntegrity`, `ExpedientesEstudiantes`, `Matriculas`, `Cobros`, `Asistencia`
- **Descripción del Alcance:**
  Establecer comprobaciones de consistencia que detecten divergencias de datos entre el expediente académico, la gestión de usuarios, el módulo financiero y el control de asistencia.

  Requisitos Funcionales:
  1. Definir la propiedad del dato por módulo (fuente de verdad).
  2. Mantener la correspondencia estricta entre `ExpedienteID`, `PersonaID`, `MatriculaID`, `UsuarioID` y referencias contables/asistencia.
  3. Verificar que los cambios de matrícula se propaguen a finanzas y asistencia según reglas de negocio.
  4. Diferenciar sincronizaciones inmediatas, diferidas y registros inmutables.
  5. Detectar matrículas huérfanas, cargos vinculados a IDs inexistentes y registros de asistencia desalineados.
  6. Registrar origen, fecha, resultado y errores de sincronización (`correlationId`).
  7. En fallos parciales, indicar qué módulo fue actualizado y cuál quedó pendiente.
  8. Permitir reintentos idempotentes.
  9. Proveer una consola administrativa de conciliación con acciones autorizadas de resolución.
  10. Prohibir modificaciones/fusiones automáticas de datos financieros o académicos sin revisión humana.
- **Criterios de Aceptación:**
  - CA-057: Una matrícula activa se vincula al expediente y periodo escolar correctos en todos los módulos.
  - CA-058: Un fallo de sincronización entre servicios queda registrado sin ocultarse.
  - CA-059: Los reintentos de sincronización no duplican cargos ni matrículas.
  - CA-060: Los registros históricos mantienen sus valores originales.
  - CA-061: La consola de conciliación identifica la entidad afectada, causa y acción recomendada.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-010] Ampliar la gestión de documentos con versiones, integridad y recuperación controlada
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 9 (P2 · Protección Documental)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Gestión documental avanzada y versiones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `DocumentosEstudiante`, `uploadStudentDocument`, `getStudentDocuments`, `DriveApp`
- **Descripción del Alcance:**
  Reforzar el control de versiones de los documentos del expediente, garantizando la conservación de antecedentes históricos y la verificación de accesibilidad real de los archivos en Google Drive.

  Requisitos Funcionales:
  1. Separar el documento lógico del expediente de cada versión física del archivo.
  2. Al sustituir un documento, conservar la referencia a la versión previa y a la versión vigente.
  3. Registrar usuario, fecha, motivo y resultado de revisión de cada versión.
  4. Verificar la accesibilidad física del archivo en Drive al consultar, detectando enlaces rotos o borrados externos.
  5. Proteger el acceso documental mediante endpoints autenticados y tokens temporales en lugar de URLs públicas.
  6. Permitir restaurar una versión anterior mediante acción autorizada, registrándola como nueva versión activa.
  7. Separar la eliminación lógica del registro de la eliminación física del archivo según políticas de retención.
  8. Mantener las validaciones de tipo (PDF, JPG, PNG, WEBP) y tamaño (10MB).
- **Criterios de Aceptación:**
  - CA-062: La sustitución de un documento conserva una referencia verificable a la versión anterior.
  - CA-063: La versión vigente se recupera correctamente tras recargar.
  - CA-064: Las referencias a archivos borrados en Drive se reportan como inconsistencias.
  - CA-065: Usuarios no autorizados no pueden descargar versiones previas mediante llamadas directas.
  - CA-066: La restauración de una versión genera un evento en el historial.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-011] Desarrollar un resumen institucional del expediente orientado a cada perfil autorizado
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 10 (P2 · Experiencia de Usuario)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (UX y visualización unificada por rol)
- **Archivos Involucrados:**
  - `dashboard-secretaria.html`
  - `teacher-dashboard.html`
  - `student-dashboard.html`
  - `js/secretary.js`
  - `js/teacher.js`
  - `js/student.js`
- **Dependencias Expuestas:** `getStudentFile`, `getStudentEnrollments`, `getStudentDocuments`, `ROLE_PERMISSIONS`
- **Descripción del Alcance:**
  Crear una vista de resumen inicial del expediente contextualizada según el rol del usuario (Secretaría, Docente, Estudiante/Padre), sin duplicar lógica de almacenamiento.

  Requisitos Funcionales:
  1. Presentar resumen con: identidad institucional, estado actual, matrícula vigente, movimientos recientes, documentos pendientes y accesos directos autorizados.
  2. Secretaría ve datos administrativos completos para matrículas y trámites.
  3. Docente ve únicamente información académica y de grupo sin controles administrativos.
  4. Estudiante/Familia ve sus propios datos y los de sus estudiantes vinculados según permisos de vínculo.
  5. Diferenciar visualmente datos no disponibles por permisos de datos no registrados.
  6. Mostrar marcas de fecha de actualización de cada sección.
  7. Permitir navegación fluida desde el resumen hacia los detalles sin duplicar formularios.
  8. Ante fallos de sub-servicios, renderizar las secciones disponibles e indicar el fallo de la sección afectada.
  9. Garantizar diseño adaptable e intuitivo en móviles.
- **Criterios de Aceptación:**
  - CA-067: Cada perfil visualiza exclusivamente las secciones autorizadas para su rol.
  - CA-068: El estado de matrícula coincide con el registro oficial.
  - CA-069: El fallo de un módulo no rompe la carga del resto del resumen.
  - CA-070: Los datos históricos se distinguen visualmente de los actuales.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-012] Incorporar notificaciones y seguimiento de trámites del expediente
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 11 (P2 · Automatización Administrativa)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Notificaciones y trámites)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `sendMultiChannelNotification`, `SolicitudesAdmision`, `DocumentosEstudiante`, `Matriculas`
- **Descripción del Alcance:**
  Implementar notificaciones automáticas e hilos de seguimiento para eventos clave del expediente (documentos vencidos, renovaciones pendientes, traslados, resoluciones).

  Requisitos Funcionales:
  1. Generar notificaciones para: documentos pendientes/vencidos, matrículas incompletas, cambios de sección/grado, reincorporaciones, revisiones documentales.
  2. Configurar destinatarios según evento, rol y autorizaciones del vínculo familiar.
  3. Registrar fecha de emisión, canal, destinatario y estado de entrega.
  4. Ofrecer panel de seguimiento de trámites pendientes con filtros por estado y fecha.
  5. Evitar PII sensible en mensajes externos (SMS/WhatsApp/Email); remitir al portal autenticado.
  6. Evitar notificaciones duplicadas en reintentos de operación.
  7. Permitir configurar recordatorios y alertas con frecuencia parametrizable.
  8. Respetar preferencias y revocaciones de contacto del tutor.
- **Criterios de Aceptación:**
  - CA-071: La proximidad de vencimiento documental dispara la notificación configurada.
  - CA-072: Reintentar un trámite no genera múltiples notificaciones idénticas.
  - CA-073: Un tutor revocado no recibe notificaciones posteriores.
  - CA-074: El estado de entrega se registra sin bloquear el trámite si el canal falla.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-013] Crear un mecanismo de revisión y recuperación de fusiones de expedientes
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 12 (P2 · Integridad de Identidad)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Auditoría y reversión de fusiones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `findDuplicateStudents`, `mergeStudentFiles`, `ExpedientesEstudiantes`, `HistorialCambiosEntidad`
- **Descripción del Alcance:**
  Desarrollar una interfaz de pre-visualización comparativa antes de fusionar expedientes y un protocolo de auditoría/desvinculación controlada en caso de fusión errónea.

  Requisitos Funcionales:
  1. Mostrar cuadro comparativo lado a lado (datos personales, matrículas, documentos, tutores, historial) antes de confirmar la fusión.
  2. Resaltar contradicciones de datos para resolución manual antes de fusionar.
  3. Exigir confirmación explícita con motivo registrado, responsable y fecha.
  4. Preservar la relación entre el expediente origen (marcado 'Fusionado') y el expediente destino.
  5. Registrar en la bitácora la lista exacta de entidades transferidas.
  6. Proporcionar un procedimiento administrativo documentado para separar o corregir fusiones erróneas.
  7. Prohibir fusiones automáticas sin intervención del personal autorizado.
- **Criterios de Aceptación:**
  - CA-075: La fusión requiere revisión previa de contradicciones y confirmación explícita.
  - CA-076: Todas las entidades transferidas son rastreables hasta su expediente original.
  - CA-077: Los identificadores históricos del expediente origen se conservan y no se eliminan.
  - CA-078: El procedimiento de corrección permite restituir asociaciones erróneas.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-014] Incorporar informes administrativos y exportación controlada del expediente
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 13 (P2 · Información Institucional)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Informes ejecutivos y exportación de datos)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `getStudentEnrollments`, `getStudentDocuments`, `ExpedientesEstudiantes`, `Matriculas`
- **Descripción del Alcance:**
  Construir un catálogo de informes administrativos sobre el estado y trayectoria de los expedientes con exportación en CSV/Excel y trazabilidad de descargas.

  Requisitos Funcionales:
  1. Generar reportes de: estado de expedientes (activos, retirados, traslados, graduados), matrículas por año/grado/sección/jornada, reincorporaciones, documentos faltantes/vencidos, inconsistencias.
  2. Incluir filtros por rango de fechas, grado, sección y estado.
  3. Exportación a CSV/Excel con minimización de datos (solo campos necesarios).
  4. Registrar en la bitácora de auditoría toda exportación masiva que contenga PII.
  5. Restringir la generación de reportes según los permisos del rol del usuario.
  6. Marcar claramente informes incompletos por fallos parciales de consulta.
- **Criterios de Aceptación:**
  - CA-079: Los reportes filtrados contienen exclusivamente registros del periodo y criterios seleccionados.
  - CA-080: La exportación CSV coincide exactamente con la grilla de datos visualizada.
  - CA-081: La descarga de información sensible queda registrada en la bitácora de trazabilidad.
  - CA-082: Usuarios sin permisos no pueden ejecutar exportaciones masivas.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-015] Fortalecer la recuperación y verificación de copias de seguridad del expediente
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 14 (P2 · Recuperación ante Incidentes)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Copias de seguridad y recuperación)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `createSystemBackup`, `verifyBackupIntegrity`, `restoreSystemBackup`, `reconcileRestoredDataIntegrity`
- **Descripción del Alcance:**
  Reforzar los procedimientos de restauración de respaldos, validando no solo la suma Checksum SHA-256 sino la integridad referencial completa de los expedientes y sus archivos en Drive.

  Requisitos Funcionales:
  1. Validar suma SHA-256 de la copia de seguridad antes de iniciar restauración.
  2. Verificar que el respaldo contenga las tablas esenciales (`ExpedientesEstudiantes`, `Matriculas`, `DocumentosEstudiante`, `MovimientosEstudiante`, `RelacionesFamiliares`).
  3. Escanear y reportar referencias a archivos de Drive inexistentes o inaccesibles.
  4. Ofrecer vista previa del impacto antes de confirmar la sobrescritura de datos.
  5. Exigir código de confirmación (`RESTORE-CONFIRMED`) y motivo documentado.
  6. Ejecutar reconciliación post-restauración y emitir informe de consistencia referencial.
- **Criterios de Aceptación:**
  - CA-083: Copias con Checksum alterado son rechazadas inmediatamente.
  - CA-084: Respaldos con referencias rotas emiten un reporte de advertencia detallado.
  - CA-085: La restauración exitosa conserva todas las relaciones históricas entre tablas.
  - CA-086: La operación queda registrada con autor, fecha, respaldo utilizado y resultado.
- **Estado:** [ ] Pendiente

---

### [TAREA-F6-016] Mejorar la accesibilidad y la eficiencia de uso del expediente en dispositivos móviles
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 16 (P3 · Experiencia de Usuario)
- **Prioridad:** P3
- **Severidad/Clasificación:** Bajo (UX, accesibilidad WCAG y rendimiento móvil)
- **Archivos Involucrados:**
  - `dashboard-secretaria.html`
  - `teacher-dashboard.html`
  - `student-dashboard.html`
  - `css/style.css`
  - `js/secretary.js`
  - `js/teacher.js`
- **Dependencias Expuestas:** `auditAndFixAccessibility`, `#modal-student-file`
- **Descripción del Alcance:**
  Optimizar la presentación del expediente digital en pantallas táctiles y dispositivos móviles, asegurando legibilidad, atajos por teclado y cumplimiento de pautas WCAG 2.2 AA.

  Requisitos Funcionales:
  1. Garantizar legibilidad de datos clave, estado y alertas en pantallas desde 320px de ancho.
  2. Evitar desbordamientos horizontales en tablas de expediente mediante tarjetas colapsables.
  3. Permitir navegación por pestañas y modales mediante teclado (`Tab`, `Esc`, `Enter`).
  4. Asegurar contraste de color suficiente y etiquetas `aria-*` en todos los controles interactivos.
  5. Preservar datos de formularios tras fallos de validación o pérdidas temporales de conexión.
  6. Proporcionar diálogos de confirmación claros para acciones críticas de expediente.
  7. Acompañar códigos de color con iconos y texto explicativo.
- **Criterios de Aceptación:**
  - CA-087: El expediente se consulta y opera completamente desde dispositivos móviles de 320px+.
  - CA-088: Los errores de formulario conservan la información previamente ingresada.
  - CA-089: Todos los controles del expediente responden a navegación por teclado con indicadores de foco visibles.
  - CA-090: Los estados visuales incluyen icono y texto descriptivo además del color.
- **Estado:** [ ] Pendiente
