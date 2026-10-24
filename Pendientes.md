# PLAN MAESTRO DE TAREAS PENDIENTES — FASE 5: ADMISIONES, ASPIRANTES Y PORTAL DE FAMILIAS

---

## PRIORIDAD P0: INTEGRIDAD DE DATOS, SEGURIDAD Y FLUJO PRINCIPAL DE ADMISIÓN

### [X] [TAREA-F5-001] Corregir la conversión de aspirantes y garantizar la integridad del expediente
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-02, HALLAZGOS-F5-P0-03, HALLAZGOS-F5-P0-04) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Sección H - Brechas P0-02, P0-03, P0-04)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs` (l. 800-880), `backend/user-service/Code.gs` (l. 3110-3200), `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** Hojas `SolicitudesAdmision`, `ExpedientesEstudiantes`, `Matriculas`, `RelacionesFamiliares`, `InvitacionesVinculacion`, `CargosEstudiante`, `MovimientosEstudiante`, `SecuenciasIDs`
- **Descripción del Alcance:**
  1. Consultar la solicitud original y verificar su existencia antes de iniciar la conversión.
  2. Permitir la conversión únicamente cuando la solicitud esté en estado `Admitida`, cumpla los requisitos obligatorios y no haya sido convertida previamente.
  3. Rechazar solicitudes recibidas, en revisión, rechazadas, incompletas o ya convertidas. Una solicitud admitida con documentos o condiciones obligatorias pendientes tampoco podrá convertirse, salvo que exista una excepción institucional explícita y autorizada configurada dinámicamente (`ALLOW_INCOMPLETE_ADMISSION_CONVERSION`).
  4. Generar identificadores únicos atómicos mediante `generateInstitutionalId` y `LockService.getScriptLock(10000)` para el expediente (`EXP-`), la matrícula (`MAT-`) y los registros relacionados. Se prohíbe el uso exclusivo de marcas de tiempo (`now.getTime()`).
  5. Aplicar control de concurrencia a la operación completa, incluida la comprobación del estado de la solicitud y de la disponibilidad de plazas.
  6. Vincular el nuevo expediente con la solicitud de origen mediante el identificador persistente `solicitudId`.
  7. Transferir los datos personales y de contacto del aspirante sin alterations injustificadas.
  8. Crear o actualizar la relación con el responsable utilizando el mecanismo institucional de identidad y vinculación. Crear el usuario del tutor y generar la fila en `RelacionesFamiliares`. Si el responsable no posee cuenta, iniciar el procedimiento de invitación por token (`createLinkInvitation`) y verificación, sin conceder accesos automáticos no verificados. Si se requiere flexibilidad institucional, el comportamiento de invitación directa vs token de verificación será configurable en la plataforma mediante la directiva `MANDATORY_TUTOR_TOKEN_VERIFICATION`.
  9. Evitar duplicar personas, usuarios, relaciones familiares, expedientes, matrículas y cargos cuando se reintente una operación.
  10. Crear los cargos de matrícula y otros conceptos obligatorios únicamente conforme a la configuración institucional vigente en `OfertaAcademica` / `ConfiguracionFinanciera`, evitando importes predeterminados arbitrarios.
  11. Registrar el estado de la conversión y sus resultados para distinguir una operación completada de otra pendiente o fallida.
  12. Implementar un mecanismo de recuperación y compensación que permita reanudar o compensar los pasos fallidos en transacciones distribuídas entre microservicios sin duplicar registros.
- **Criterios de Aceptación:**
  - [x] Una solicitud en estado `Recibida` no puede convertirse.
  - [x] Una solicitud en estado `En_Revision` no puede convertirse.
  - [x] Una solicitud en estado `Rechazada` no puede convertirse.
  - [x] Una solicitud `Admitida` con requisitos obligatorios pendientes no puede convertirse (salvo excepción autorizada configurada).
  - [x] Una solicitud `Admitida` que cumple todos los requisitos puede convertirse correctamente.
  - [x] La conversión conserva el identificador de la solicitud original (`solicitudId`).
  - [x] El expediente y la matrícula contienen los datos académicos correctos.
  - [x] Los datos del responsable quedan asociados al proceso de vinculación familiar en `RelacionesFamiliares`.
  - [x] La creación de una relación familiar no concede acceso al portal antes de completar la verificación exigida.
  - [x] Dos peticiones simultáneas de conversión no producen dos expedientes ni dos matrículas para la misma solicitud (bloqueo por `LockService`).
  - [x] Repetir una petición completada devuelve el resultado existente o informa que la solicitud ya fue convertida, sin duplicar efectos.
  - [x] Si falla la creación de un cargo, la operación queda en un estado recuperable y no se presenta como completamente finalizada.
  - [x] Si no hay plazas disponibles, la conversión se bloquea sin crear una matrícula activa.
  - [x] Los errores no dejan relaciones familiares, cargos o matrículas huérfanos sin posibilidad de reconciliación.
  - [x] Los eventos y cambios quedan registrados en `BitacoraTraceability` y `HistorialCambiosEntidad` para reconstruir la secuencia de la operación.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-002] Implementar una máquina de estados y reglas de transición para las solicitudes
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-03) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.4, Brecha P0-03)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs` (l. 779-799), `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Hoja `SolicitudesAdmision`, `HistorialCambiosEntidad`, `ALLOWED_ADMISSION_STATE_TRANSITIONS`
- **Descripción del Alcance:**
  1. Definir formalmente los estados de una solicitud y las transiciones autorizadas mediante la constante `ALLOWED_ADMISSION_STATE_TRANSITIONS`.
  2. Implementar, como mínimo, el siguiente flujo obligatorio: `Recibida` → `En_Revision` → `Evaluacion` → `Admitida` / `Rechazada`. Añadir el estado `En_Espera` para las solicitudes incorporadas a una lista de espera y `Convertida` para las solicitudes cuyo proceso de matrícula haya finalizado.
  3. Permitir que la solicitud avance a `Evaluacion` únicamente cuando se hayan cumplido los requisitos previos configurados para esa etapa.
  4. Exigir una justificación obligatoria (mínimo 10 caracteres) para rechazos y decisiones que requieran motivación institucional.
  5. Validar los requisitos documentales, las evaluaciones y las condiciones administrativas antes de permitir una decisión definitiva.
  6. Evitar que una solicitud rechazada o convertida vuelva a un estado anterior mediante una actualización ordinaria.
  7. Si se necesita reabrir un expediente, permitirlo únicamente a usuarios con rol `Director` / `Administrador`, mediante una operación explícita (`reopenAdmissionRequest`) que conserve la decisión original y su historial.
  8. Registrar el estado anterior, el nuevo estado, el responsable del cambio, la fecha, la justificación y el identificador de la operación en `HistorialCambiosEntidad` y `logStructuredEvent`.
  9. Proteger las transiciones frente a solicitudes concurrentes con `LockService` y frente a reintentos con claves de idempotencia.
  10. Separar explícitamente el estado de admisión del estado de matrícula para que una solicitud admitida no se considere automáticamente matriculada.
- **Criterios de Aceptación:**
  - [x] Un estado desconocido es rechazado por el servidor con error `INVALID_ADMISSION_STATE`.
  - [x] No se permite pasar directamente de `Recibida` a `Convertida`.
  - [x] No se permite convertir una solicitud sin aprobación previa en estado `Admitida`.
  - [x] Un rechazo sin justificación obligatoria se rechaza sin modificar el estado.
  - [x] Una solicitud con requisitos obligatorios pendientes no puede avanzar a una etapa que los requiera.
  - [x] Un usuario sin autorización no puede modificar estados aunque invoque directamente el endpoint backend.
  - [x] Dos cambios simultáneos no sobrescriben silenciosamente una decisión más reciente.
  - [x] Un reintento no genera decisiones, notificaciones ni registros duplicados.
  - [x] El historial en `HistorialCambiosEntidad` permite reconstruir cada transición y su autor.
  - [x] Reabrir una solicitud no elimina ni altera el registro de su decisión anterior.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-003] Implementar identificadores únicos, control de concurrencia e idempotencia en admisiones
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-04) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.1 y 5.11, Brecha P0-04)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs` (l. 714-740, 800-860)
- **Dependencias Expuestas:** Hoja `SecuenciasIDs`, `TablaIdempotencia`, `LockService`
- **Descripción del Alcance:**
  1. Implementar el mecanismo atómico `generateInstitutionalId` para solicitudes (`ADM-2026-XXXXX`), expedientes (`EXP-2026-XXXXX`) y matrículas (`MAT-2026-XXXXX`). Se prohíbe el uso de `Date.now()` o `now.getTime()` como mecanismo único.
  2. Proteger las operaciones críticas de creación, cambio de estado y conversión mediante `LockService.getScriptLock(10000)`.
  3. Aplicar validaciones de unicidad de aspirante dentro de la sección protegida por el candado atómico.
  4. Incorporar `checkAndRegisterIdempotencyKey` y `saveIdempotentResult` en `createAdmissionRequest`, `updateAdmissionStatus` y `convertAdmissionToStudent` para evitar duplicaciones por reintentos de red.
  5. Definir el comportamiento ante claves de idempotencia repetidas: si los datos coinciden, retornar el resultado previo almacenado; si los datos difieren, rechazar con error `IDEMPOTENCY_CONFLICT`.
  6. Validar duplicados potenciales de aspirantes mediante DNI/Identificación, fecha de nacimiento y correo del responsable. No fusionar automáticamente personas basándose únicamente en nombres coincidentes.
  7. Implementar rollback/reversión si la persistencia falla a mitad de la operación para evitar registros incompletos.
  8. Registrar conflictos de concurrencia y reintentos en `logStructuredEvent` sin exponer datos personales sensibles.
- **Criterios de Aceptación:**
  - [x] Las solicitudes simultáneas reciben identificadores atómicos distintos y secuenciales.
  - [x] La repetición de una operación con la misma clave de idempotencia no crea registros adicionales.
  - [x] La reutilización de una clave de idempotencia con datos incompatibles se rechaza.
  - [x] Los duplicados potenciales por DNI o Email se identifican antes de crear una nueva solicitud.
  - [x] Los errores de persistencia no dejan solicitudes que aparenten estar completas.
  - [x] Las pruebas concurrentes no producen identificadores repetidos ni matrículas duplicadas.
  - [x] El mecanismo no depende exclusivamente de la precisión temporal del reloj del servidor.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-004] Construir el formulario público de admisión y conectarlo con el backend
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.1, Brecha P0-01)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `admision.html` (Nuevo), `js/student.js`, `js/auth.js`, `backend/academic-service/Code.gs` (l. 714)
- **Dependencias Expuestas:** Endpoint `createAdmissionRequest`, `PUBLIC_ACTIONS`, `js/ui-common.js`
- **Descripción del Alcance:**
  1. Diseñar e implementar la interfaz pública `admision.html` accesible desde dispositivos móviles y computadoras.
  2. Permitir seleccionar el año lectivo, grado solicitado y la oferta académica disponible consultada dinámicamente desde `getAcademicOffers`.
  3. Recopilar datos personales del aspirante (nombres, apellidos, DNI/Identificación, fecha de nacimiento), datos de contacto y datos completos del responsable (nombre, teléfono, email, parentesco).
  4. Mostrar dinámicamente los requisitos documentales correspondientes al grado o programa seleccionado.
  5. Validar campos obligatorios, formatos de teléfono (Honduras `+504`), email válido, DNI (13 dígitos) y consistencia tanto en el cliente como en el servidor.
  6. Mostrar errores junto a los campos afectados y conservar los datos válidos tras un fallo.
  7. Informar si existe una solicitud potencialmente duplicada sin revelar datos personales de terceros.
  8. Invocación limpia de `createAdmissionRequest` en `ACADEMIC` y presentación del modal de confirmación con el código de seguimiento `solicitudId`.
  9. Mostrar un panel de consulta de estado por número de seguimiento e identificación para aspirantes sin cuenta de usuario.
  10. Incluir aviso de privacidad ARCO y consentimiento informado antes de recopilar datos de menores.
  11. Diferenciar explícitamente el envío de la solicitud de su aprobación institucional.
  12. Soportar reintentos limpios ante fallos de red sin duplicar solicitudes.
- **Criterios de Aceptación:**
  - [x] Una familia puede completar y enviar una solicitud válida desde un dispositivo móvil o de escritorio.
  - [x] Los datos ingresados llegan al backend y se conservan correctamente en `SolicitudesAdmision`.
  - [x] Una solicitud inválida no se registra como completa.
  - [x] Un error del servidor no produce un mensaje falso de éxito en la pantalla.
  - [x] Una solicitud enviada devuelve e informa un identificador de seguimiento único (`solicitudId`).
  - [x] El usuario puede corregir errores de validación sin volver a introducir todos los datos.
  - [x] Los intentos duplicados se detectan y notifican adecuadamente.
  - [x] La interfaz impide seleccionar grados u ofertas no disponibles en la institución.
  - [x] La pantalla funciona mediante teclado y cumple WCAG 2.2 AA.
  - [x] No se exponen datos de otros aspirantes en mensajes de error o validación.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-005] Crear la consola administrativa de revisión y decisión de admisiones
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.6, Brecha P0-01)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `dashboard-direccion.html`, `teacher-dashboard.html`, `js/teacher.js`, `backend/academic-service/Code.gs` (l. 748, 779, 800)
- **Dependencias Expuestas:** Endpoints `getAdmissionRequests`, `updateAdmissionStatus`, `convertAdmissionToStudent`, `setupAdvancedTableFilters`
- **Descripción del Alcance:**
  1. Crear la vista administrativa e interfaz de tabla para consultar, filtrar y administrar solicitudes de admisión.
  2. Implementar filtros avanzados por año lectivo, grado solicitado, estado, fecha de recepción y presencia de requisitos pendientes (`setupAdvancedTableFilters`).
  3. Mostrar modal de detalle integral con datos del aspirante, responsable declarado, documentos adjuntos, entrevistas, evaluaciones y timeline de estados.
  4. Distinguir visualmente solicitudes incompletas, en revisión, evaluadas y listas para decisión final.
  5. Permitir asignar responsables de revisión e ingresar observaciones internas confidenciales.
  6. Renderizar únicamente los botones de transición de estado autorizados según el estado actual de la solicitud y el rol del usuario.
  7. Exigir justificación obligatoria en campo de texto antes de confirmar rechazos o cambios de estado críticos.
  8. Mostrar advertencias si faltan documentos obligatorios, evaluaciones o si la capacidad de la sección está agotada.
  9. Sincronizar el estado visual con la respuesta real del backend (impedir marcas de éxito si el backend falla).
  10. Permitir ejecutar la conversión a matrícula con un solo clic desde solicitudes en estado `Admitida`, navegando directamente al expediente resultante.
  11. Implementar paginación en servidor e indicadores de carga (`renderUIProgressSkeleton`).
  12. Aplicar restricciones ABAC/RBAC para que el personal de nivel sólo acceda a las solicitudes de su departamento asignado.
- **Criterios de Aceptación:**
  - [x] El personal autorizado de Secretaría y Dirección puede consultar y filtrar solicitudes en tiempo real.
  - [x] Los filtros producen resultados coherentes con los registros persistidos en la hoja.
  - [x] El modal de detalle permite revisar todos los componentes del expediente sin cambiar de pantalla.
  - [x] Los botones de acción muestran únicamente transiciones válidas para el estado activo.
  - [x] Una respuesta de error mantiene visible el estado real persistido en el servidor.
  - [x] El rechazo sin justificación obligatoria no se puede confirmar.
  - [x] Un usuario no autorizado no puede consultar ni decidir solicitudes invocando directamente el endpoint.
  - [x] La paginación navega limpiamente sin omitir ni duplicar filas.
  - [x] Se detectan cambios concurrentes realizados por otro usuario antes de sobrescribir una decisión.
- **Estado:** [X] Completada

---

## PRIORIDAD P1: EXPEDIENTES, DOCUMENTOS, EVALUACIÓN Y VINCULACIÓN FAMILIAR

### [X] [TAREA-F5-006] Implementar la gestión documental de aspirantes antes de la matrícula
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P1-02) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.3, Brecha P1-02)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs` (l. 4838-4930), `js/student.js`, `js/secretary.js`
- **Dependencias Expuestas:** Hoja `DocumentosEstudiante`, `DriveApp`, `getSecureDocumentStream`
- **Descripción del Alcance:**
  1. Modificar `uploadStudentDocument` y `getStudentDocuments` para aceptar tanto `expedienteId` de estudiante activo como `solicitudId` de aspirante pre-matriculado.
  2. Mantener la asociación del documento con la `solicitudId` durante todo el ciclo de admisión y migrarla al `expedienteId` durante la conversión.
  3. Administrar catálogo de requisitos documentales por año lectivo y grado (Partida de nacimiento, certificados anteriores, fotos, ficha médica, solvencia).
  4. Definir obligatoriedad, fecha límite, formatos permitidos (PDF, JPG, PNG) y límite de tamaño por archivo (máximo 10 MB).
  5. Controlar estados del documento: `Pendiente`, `Recibido`, `En_Revision`, `Aceptado`, `Rechazado`, `Requiere_Sustitucion`.
  6. Permitir a Secretaría revisar archivos, calificar estado e ingresar observaciones públicas para la familia.
  7. Permitir sustituir documentos rechazados conservando el historial de versiones anteriores en Drive.
  8. Validar en el servidor los bytes del archivo y la extensión real del tipo MIME (no confiar en la cabecera del cliente).
  9. Impedir la aceptación de archivos corruptos o de tamaño 0 bytes.
  10. Garantizar que las interrupciones durante la carga no dejen registros huérfanos o inválidos en la base de datos.
  11. Proteger el acceso a los archivos mediante `getSecureDocumentStream` verificando pertenencia o rol administrativo.
  12. Transferir automáticamente los documentos aprobados al expediente final del estudiante cuando se complete la conversión a matrícula.
  13. Impedir descargas no autorizadas bloqueando URLs públicas de Drive sin proxy autenticado.
  14. Mostrar alertas visuales de documentos vencidos o rechazados en los paneles de la familia y de dirección.
- **Criterios de Aceptación:**
  - [x] Un aspirante puede cargar un documento asociado a su `solicitudId` antes de estar matriculado.
  - [x] El documento queda correctamente vinculado a la solicitud de origen.
  - [x] Archivos con formatos no permitidos (.exe, .bat, etc.) o superiores a 10 MB son rechazados en el servidor.
  - [x] Cargas interrumpidas o con error no aparecen como documentos válidos.
  - [x] Un documento rechazado muestra el motivo e instruye la sustitución.
  - [x] La sustitución de un archivo conserva la versión anterior en el historial de Drive.
  - [x] Peticiones no autorizadas con IDs de archivo ajenos son denegadas con error 403.
  - [x] Los requisitos pendientes se despliegan en el portal familiar y en la consola de admisiones.
  - [x] La conversión a matrícula migra los documentos de la solicitud al nuevo expediente sin duplicar archivos en Drive.
  - [x] La presencia de documentos obligatorios pendientes o rechazados bloquea la conversión ordinaria.
  - [x] Las operaciones documentales quedan registradas en la bitácora de auditoría.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-007] Implementar el módulo de entrevistas y evaluaciones de admisión
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P1-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.5, Brecha P1-01)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/secretary.js`, `dashboard-secretaria.html`
- **Dependencias Expuestas:** Hojas `EntrevistasAdmision`, `EvaluacionesAdmision`, `SolicitudesAdmision`
- **Descripción del Alcance:**
  1. Crear el esquema de base de datos e implementar las hojas `EntrevistasAdmision` y `EvaluacionesAdmision`.
  2. Implementar funciones backend `scheduleAdmissionInterview`, `getAdmissionInterviews`, `recordInterviewOutcome`, `saveAdmissionEvaluation` y `getAdmissionEvaluations`.
  3. Permitir agendar entrevistas individuales o grupales, asignando fecha, hora, evaluador, lugar/enlace de reunión y modalidad (Presencial/Virtual).
  4. Gestionar estados de las citas: `Programada`, `Confirmada`, `Reprogramada`, `Completada`, `Cancelada`, `No_Asistio`.
  5. Detectar solapamientos y conflictos de agenda del evaluador impidiendo citas simultáneas.
  6. Permitir reprogramar o cancelar citas registrando el motivo y notificando a los participantes.
  7. Permitir calificar evaluaciones de ingreso con escala numérica o cualitativa, adjuntando rúbricas de evaluación y dictamen pedagógico.
  8. Diferenciar explícitamente entre cita programada, entrevista realizada y evaluación evaluada con notas.
  9. Restringir el acceso a los evaluadores asignados para que consulten únicamente sus expedientes autorizados.
  10. Consolidar el resumen de notas de examen y observaciones de entrevistas dentro del modal del expediente de admisión.
  11. Definir qué evaluaciones son obligatorias según el grado o nivel académico.
  12. Impedir que una solicitud avance al estado `Admitida` si tiene evaluaciones obligatorias pendientes o reprobadas.
  13. Soporte para registrar excepciones autorizadas de evaluación con firma digital y justificación de Dirección.
  14. Permitir registrar múltiples entrevistas o evaluaciones para un aspirante sin sobrescribir registros anteriores.
- **Criterios de Aceptación:**
  - [x] Se puede agendar una entrevista vinculada a una solicitud existente.
  - [x] Se puede reprogramar una cita conservando la fecha original en la bitácora.
  - [x] El sistema detecta y rechaza solapamientos de horario en la agenda del docente evaluador.
  - [x] Una evaluación programada no aparece como completada hasta registrar la nota.
  - [x] Las notas y observaciones se conservan e integran al expediente de admisión.
  - [x] Evaluadores no autorizados no pueden calificar ni modificar entrevistas ajenas.
  - [x] Múltiples evaluaciones se acumulan cronológicamente sin sobrescribirse.
  - [x] Solicitudes con evaluaciones obligatorias pendientes no pueden cambiar a `Admitida`.
  - [x] Excepciones de evaluación quedan documentadas con el usuario autor y motivo.
  - [x] El historial de auditoría registra quién programó, realizó, evaluó o modificó cada cita.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-008] Implementar listas de espera con orden de prelación y asignación controlada de plazas
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P1-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.5 y 5.12, Brecha P1-01)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/secretary.js`, `dashboard-secretaria.html`
- **Dependencias Expuestas:** Hoja `ListaEsperaAdmision`, `OfertaAcademica`, `SolicitudesAdmision`
- **Descripción del Alcance:**
  1. Crear la hoja `ListaEsperaAdmision` e implementar endpoints `addToWaitlist`, `getWaitlist`, `reorderWaitlist` y `offerWaitlistSlot`.
  2. Incorporar solicitudes con estado `En_Espera` a la lista de espera asociando grado, año lectivo, fecha de ingreso, posición y criterios de prelación (ej. hermanos matriculados, hijos de exalumnos, fecha de postulación).
  3. Permitir configurar y calcular el orden de prioridad automáticamente según las reglas de la institución.
  4. Exigir autorización y registro de trazabilidad si Secretaría o Dirección modifica manualmente la posición de un aspirante.
  5. Desplegar la lista de espera con filtros por año lectivo, grado y disponibilidad de plazas vacantes.
  6. Administrar estados de la oferta: `En_Espera`, `Plaza_Ofrecida`, `Oferta_Aceptada`, `Oferta_Rechazada`, `Oferta_Expirada`, `Retirada`.
  7. Permitir fijar un plazo de caducidad (ej. 48 o 72 horas) para responder a una oferta de plaza y automatizar la expiración.
  8. Enviar avisos y notificaciones automáticas al ofrecer una vacante a la familia en el tope de la lista.
  9. Liberar la plaza reservada y ofrecerla al siguiente en la lista si la familia rechaza o la oferta expira.
  10. Bloquear la reserva simultánea de una misma plaza vacante para múltiples postulantes.
  11. Garantizar que la aceptación de la oferta cambie la solicitud a `Admitida` requiriendo formalizar la matrícula.
  12. Mantener la trazabilidad de todos los movimientos de la lista de espera.
- **Criterios de Aceptación:**
  - [x] Una solicitud sólo puede entrar a la lista de espera si está en estado elegible.
  - [x] La posición en la lista se calcula transparentemente según los criterios de prelación definidos.
  - [x] Reordenamientos manuales exigen justificación y quedan registrados en la bitácora.
  - [x] Una plaza liberada se asigna únicamente a un aspirante a la vez.
  - [x] Al rechazar o expirar una oferta, el cupo se libera automáticamente para el siguiente aspirante en la lista.
  - [x] La aceptación de la oferta actualiza el estado de la solicitud a `Admitida`.
  - [x] Solicitudes concurrentes no pueden reservar la misma plaza en la lista de espera.
  - [x] Solicitudes retiradas salen de la lista y no reciben nuevas ofertas de cupo.
  - [x] La familia sólo consulta la posición relativa de su propia solicitud de admisión.
  - [x] Se conserva el historial completo de ofertas, vencimientos y aceptaciones.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-009] Corregir la vinculación familiar y establecer permisos individuales por relación
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-02) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.7, Brecha P0-02)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs` (l. 3113-3250), `backend/academic-service/Code.gs` (l. 4698-4820), `js/secretary.js`
- **Dependencias Expuestas:** Hojas `RelacionesFamiliares`, `InvitacionesVinculacion`, `Usuarios`, `validateContextualAccess`
- **Descripción del Alcance:**
  1. Unificar los flujos de vinculación para que toda relación familiar requiera una invitación con token o autorización explícita verificada.
  2. Diferenciar en la base de datos entre responsable declarado (texto de solicitud), relación verificada y cuenta con acceso activo al portal.
  3. Implementar tokens de invitación seguros de un solo uso (`TOK-UUID`) con 7 días de vigencia y revocación remota.
  4. Amarrar la invitación a la `solicitudId` / `expedienteId` y correo específico del tutor, impidiendo reutilización en otros alumnos.
  5. Verificar que el usuario que acepta el token coincida con el email invitado o cuente con autorización.
  6. Detectar vínculos duplicados en `RelacionesFamiliares` previniendo registros redundantes.
  7. Permitir múltiples tutores por estudiante y múltiples estudiantes por tutor en una estructura N:M limpia.
  8. Configurar permisos individuales por tutor (`PermisoAcademico`, `PermisoFinanciero`, `PermisoDocumental`, `PermisoAsistencia`), en lugar de otorgar un rol `Padre` plano y uniforme. Si la institución requiere un modelo simplificado o granular, el modo de permisos familiares se configurará mediante la directiva `GRANULAR_FAMILY_PERMISSIONS_ENABLED`.
  9. Permitir personalizar si un tutor puede ver notas, realizar pagos, solicitar excusas o autorizar salidas.
  10. Diferenciar permisos de lectura de permisos de escritura o transaccionales.
  11. Validar las restricciones de parentesco en el servidor dentro de `validateContextualAccess`.
  12. Soportar revocación inmediata de un vínculo impidiendo el acceso en las subsiguientes peticiones.
  13. Registrar en la bitácora quién creó, verificó, aceptó, modificó o revocó cada vínculo familiar.
  14. Prohibir la creación automática de cuentas de usuario basándose únicamente en cadenas de texto de un formulario.
  15. Integrar el proceso en la conversión a matrícula transfiriendo al tutor declarado a la cola de invitaciones de vinculación.
- **Criterios de Aceptación:**
  - [x] El personal administrativo no puede otorgar acceso al portal sin completar el flujo de verificación.
  - [x] Tokens expirados, revocados o usados previamente son rechazados.
  - [x] Un token no se puede usar para vincular a un estudiante diferente del autorizado en la invitación.
  - [x] Intentos de vinculación duplicados son neutralizados sin crear filas redundantes.
  - [x] Dos tutores del mismo estudiante pueden tener conjuntos de permisos diferenciados (ej. Tutor 1 Financiero, Tutor 2 Académico).
  - [x] La revocación de un vínculo bloquea inmediatamente el acceso del tutor a la información del alumno.
  - [x] Alterar el ID de estudiante en peticiones API es rechazado por el aislamiento de `validateContextualAccess`.
  - [x] La conversión de admisión a matrícula transfiere correctamente al tutor declarado al flujo de invitaciones sin perder sus datos.
  - [x] Registro completo de auditoría para cada cambio de estado en la relación familiar.
  - [x] La autorización efectiva se verifica en el servidor en cada endpoint del portal de familias.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-010] Integrar las plazas, reservas y matrículas en un control de capacidad consistente
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P2-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.12, Brecha P2-01)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs` (l. 4938-5015), `js/secretary.js`, `dashboard-secretaria.html`
- **Dependencias Expuestas:** Hojas `OfertaAcademica`, `Matriculas`, `SolicitudesAdmision`, `ListaEsperaAdmision`
- **Descripción del Alcance:**
  1. Definir la capacidad máxima por año lectivo, grado y sección en `OfertaAcademica`.
  2. Actualizar `checkEnrollmentCapacity` para calcular la disponibilidad real restando de la capacidad máxima tanto las `Matriculas` activas como los aspirantes con solicitud `Admitida` (plazas reservadas no vencidas).
  3. Distinguir explícitamente entre solicitud admitida, plaza reservada, oferta aceptada y matrícula confirmada.
  4. Definir reglas y tiempos de caducidad para las reservas de cupo de aspirantes admitidos (ej. 5 días hábiles para pagar la matrícula).
  5. Evitar la doble contabilización cuando una plaza reservada se convierte en matrícula confirmada.
  6. Forzar la verificación de capacidad antes de marcar una solicitud como `Admitida` y antes de ejecutar `convertAdmissionToStudent`.
  7. Proteger el cálculo de capacidad con `LockService` para prevenir condiciones de carrera en matriculaciones simultáneas.
  8. Endpoint de consulta de cupos que desglose: Capacidad Total, Inscritos Confirmados, Plazas Reservadas y Cupos Libres.
  9. Liberar la reserva de cupo cuando una solicitud admitida sea cancelada, rechazada o expire su plazo de pago.
  10. Bloquear reservas de cupo para secciones no abiertas o cerradas en la oferta académica.
  11. Mantener el historial de reservas y liberaciones de cupo en la bitácora de auditoría.
  12. Establecer una política explícita y configurable (`OVERBOOKING_ALLOWED`) para autorizar o prohibir sobrecupos con firma de Dirección.
- **Criterios de Aceptación:**
  - [x] Secciones sin cupos disponibles bloquean el cambio de estado a `Admitida` y la conversión a matrícula.
  - [x] Aspirantes admitidos reducen inmediatamente el número de cupos disponibles.
  - [x] Al convertirse en estudiante matriculado, la plaza reservada se transforma en matrícula activa sin duplicar el descuento de cupo.
  - [x] La cancelación de una matrícula o expiración de una admisión libera el cupo en tiempo real.
  - [x] Peticiones simultáneas sobre el último cupo disponible son procesadas de forma atómica (un solo ganador, el otro a lista de espera).
  - [x] La conversión a matrícula recalcula y valida la disponibilidad real antes de confirmar el registro.
  - [x] Los reportes de capacidad coinciden con la suma de matrículas activas y reservas no vencidas.
  - [x] Cambios de capacidad no modifican decisiones de admisión previamente aprobadas.
  - [x] Excepciones de sobrecupo requieren el parámetro `forceCapacityOverride` con autorización auditada de Dirección.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-011] Implementar notificaciones automáticas y seguimiento del proceso de admisión
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P1-03) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.10, Brecha P1-03)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs` (l. 948, 1298)
- **Dependencias Expuestas:** Endpoint `sendMultiChannelNotification`, Hoja `Notificaciones`, `ColaEventosSeguridad`
- **Descripción del Alcance:**
  1. Conectar las funciones del ciclo de vida de admisión (`createAdmissionRequest`, `updateAdmissionStatus`, `convertAdmissionToStudent`) con el motor `sendMultiChannelNotification`.
  2. Disparar notificaciones automáticas ante los siguientes eventos:
     - Recepción formal de solicitud (incluyendo `solicitudId` de seguimiento).
     - Solicitud de documentos pendientes o sustitución por rechazo.
     - Citación, reprogramación o cancelación de entrevistas/evaluaciones.
     - Cambio de estado en el trámite de admisión.
     - Resolución final (`Admitida` con instrucciones de pago / `Rechazada` / `En_Espera`).
     - Oferta o liberación de plaza en lista de espera.
     - Emisión de invitación de vinculación para el tutor.
     - Confirmación de conversión a matrícula estudiantil.
  3. Crear plantillas HTML y de texto plano personalizables para cada tipo de notificación.
  4. Incluir enlaces directos al portal, números de seguimiento e instrucciones claras sin exponer datos privados de menores.
  5. Enviar las notificaciones a los canales autorizados (Correo electrónico `MailApp`, avisos internos del portal).
  6. Desacoplar la notificación de la transacción principal para que un fallo en el envío de correo no revierta la aprobación de una admisión.
  7. Guardar el estado de cada notificación: `Pendiente`, `Enviado`, `Entregado`, `Fallido`, `Reintentado`.
  8. Integrar con la cola de reintentos asíncronos para reenviar notificaciones fallidas por problemas de red.
  9. Aplicar deduplicación para evitar el envío repetido de correos ante reintentos de peticiones.
  10. Respetar las preferencias de notificación de la familia salvo para avisos institucionales obligatorios.
  11. Garantizar la privacidad enviando correos individuales o ocultando destinatarios en avisos masivos.
  12. Consola de monitoreo para que Secretaría verifique el historial de avisos enviados y reenviar manualmente si es necesario.
- **Criterios de Aceptación:**
  - [x] El registro de una solicitud envía un correo de confirmación con su código de seguimiento.
  - [x] Cambios de estado en la admisión disparan el correo automático correspondiente a la familia.
  - [x] Solicitudes rechazadas no envían por error plantillas de aceptación.
  - [x] Fallos en el servidor de correo activan el reintento en la cola asíncrona sin cancelar la transacción de base de datos.
  - [x] Reintentos de peticiones no duplican los correos enviados a la familia.
  - [x] Se registra el estado de entrega de cada mensaje en `BitacoraTraceability`.
  - [x] Los mensajes son individuales y no revelan direcciones de correo de otros postulantes.
  - [x] Secretaría puede revisar el log de notificaciones enviadas a cada aspirante.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-012] Incorporar seguimiento de aspirantes en el portal familiar
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.9 y 5.14, Brecha P0-01)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `student-dashboard.html`, `js/student.js` (l. 180-260), `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Endpoints `getGuardianStudents`, `getAdmissionRequests`, `initFamilyStudentSwitcher`
- **Descripción del Alcance:**
  1. Habilitar en el Portal Familiar la consulta de solicitudes de admisión de aspirantes vinculados junto a los estudiantes matriculados.
  2. Extender el selector multiestudiante (`initFamilyStudentSwitcher`) para categorizar entre "🎓 Estudiantes Matriculados" y "📝 Aspirantes en Admisión".
  3. Desplegar panel de seguimiento de admisión con el estado actual del trámite, fecha de recepción y código de seguimiento.
  4. Renderizar línea de tiempo visual con las etapas completadas y pendientes (Solicitud -> Documentos -> Entrevista -> Decisión -> Matrícula).
  5. Mostrar lista de documentos requeridos, resaltando archivos aprobados, pendientes y rechazados con botón para subir la sustitución.
  6. Desplegar citas de entrevistas y pruebas de ingreso agendadas, con fecha, hora, ubicación/enlace e instrucciones.
  7. Mostrar observaciones públicas del equipo de admisiones y solicitudes de información adicional.
  8. Permitir retomar el llenado de solicitudes incompletas o borradores guardados.
  9. Notificar ofertas de plazas vacantes y proporcionar botón para aceptar o rechazar la vacante desde el portal.
  10. Mantener una separación clara entre los expedientes de aspirantes y los expedientes académicos/financieros de alumnos activos.
  11. Aplicar aislamiento IDOR para que los tutores consulten únicamente las solicitudes de sus aspirantes autorizados.
  12. Diferenciar claramente entre "Sin información registrada", "Falta de permisos" y "Error de carga del servidor".
  13. Evitar atribuir cobros de admisión como deudas de matrícula de estudiantes activos.
- **Criterios de Aceptación:**
  - [x] Un tutor autenticado puede conmutar entre sus hijos matriculados y sus hijos postulantes desde el portal.
  - [x] Intento de consultar solicitudes de aspirantes ajenos modificando IDs es bloqueado en el backend.
  - [x] Las solicitudes de admisión se distinguen visualmente con etiquetas y colores de las matrículas activas.
  - [x] El panel muestra el estado real de los documentos, citas y decisiones de admisión.
  - [x] Cambios realizados por admisiones se reflejan inmediatamente al actualizar el portal familiar.
  - [x] Los errores de servidor muestran alertas descriptivas sin presentar datos vacíos como inexistentes.
  - [x] La interfaz guía a la familia sobre los pasos exactos para completar la admisión.
  - [x] Al convertirse en estudiante, el aspirante pasa automáticamente a la sección de estudiantes matriculados.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-013] Integrar los cobros de admisión, los pagos y las becas con el expediente del aspirante
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P1-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.13, Brecha P1-01)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/accounting-service/Code.gs`, `backend/user-service/Code.gs` (l. 3330-3420), `js/student.js`
- **Dependencias Expuestas:** Hojas `CargosEstudiante`, `ComprobantesPago`, `SolicitudesDescuentoBeca`
- **Descripción del Alcance:**
  1. Configurar conceptos financieros específicos para admisiones en `ConfiguracionFinanciera`: "Derecho de Admisión", "Examen de Ingreso", "Reserva de Plaza".
  2. Permitir definir montos, fechas de vencimiento, exenciones y reglas de cobro por nivel académico.
  3. Vincular los cargos de admisión a la `solicitudId` del aspirante antes de la asignación de un `userId` de estudiante.
  4. Diferenciar en la contabilidad los ingresos por trámites de admisión de las colegiaturas y matrículas ordinarias.
  5. Permitir consultar el estado financiero de la admisión: `Pendiente`, `Pagado`, `En_Revision`, `Exento`, `Anulado`.
  6. Reutilizar el módulo de carga de comprobantes de pago (`submitJointFamilyPayment`) permitiendo adjuntar transferencias para cobros de admisión.
  7. Permitir la revisión y validación de comprobantes por el departamento de Contabilidad. La carga del recibo no constituye confirmación de pago automática.
  8. Prevenir cargos duplicados mediante claves de idempotencia en la generación de cobros.
  9. Registro contable auditado de todas las transacciones financieras de admisión.
  10. Permitir otorgar becas de admisión o exenciones de pago con aprobación registrada de Dirección.
  11. Habilitar la postulación a becas familiares (`submitFamilyScholarshipApplication`) durante el proceso de admisión.
  12. Transferir el historial de pagos de admisión al expediente contable definitivo del estudiante tras la conversión a matrícula.
  13. Desglosar claramente los cobros por aspirante en el resumen consolidado de la familia.
  14. Bloquear la confirmación de la admisión si existen cargos obligatorios de admisión en estado pendiente o rechazado.
- **Criterios de Aceptación:**
  - [x] Cargos de admisión se generan automáticamente asociados a la `solicitudId`.
  - [x] No se duplican cargos al consultar o reintentar peticiones.
  - [x] Comprobantes de pago subidos quedan en estado `En_Revision` hasta la aprobación contable.
  - [x] La aprobación del pago actualiza el saldo del aspirante y habilita la siguiente fase del trámite.
  - [x] Exenciones financieras requieren autorización auditada y motivo justificado.
  - [x] La conversión a matrícula migra el historial de pagos de admisión sin duplicar cobros.
  - [x] El resumen familiar distingue los cobros de admisión de los cargos de estudiantes matriculados.
  - [x] Operaciones financieras fallidas devuelven errores claros sin marcar los cargos como pagados.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-014] Completar la trazabilidad de admisiones y las notificaciones de auditoría
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P1-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.15, Brecha P1-01)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs` (l. 743, 795), `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Hojas `BitacoraEventos`, `BitacoraTraceability`, `HistorialCambiosEntidad`, `logStructuredEvent`
- **Descripción del Alcance:**
  1. Registrar todas las operaciones críticas de admisión en `logStructuredEvent`, `BitacoraTraceability` y `HistorialCambiosEntidad`.
  2. Persistir en la auditoría: ID de solicitud, tipo de acción, usuario o actor, fecha/hora exacta, IP/sesión, valores anteriores, valores nuevos, motivo y resultado.
  3. Registrar el diff sanitizado de cambios de estado, modificaciones de datos de aspirantes y sustituciones de documentos en `HistorialCambiosEntidad`.
  4. Proteger la bitácora frente a modificaciones o eliminaciones directas (registros inalterables y de solo lectura).
  5. Diferenciar eventos de negocio (`ADMISSION_CREATED`, `STATUS_CHANGED`, `CONVERTED_TO_STUDENT`) de logs de error o depuración técnica.
  6. Registrar de forma diferenciada las peticiones fallidas y las excepciones producidas durante el proceso de admisión.
  7. Registrar los accesos y descargas de documentos de menores para cumplimiento de leyes de privacidad.
  8. Sanitizar automáticamente contraseñas, tokens, DNI sensibles y secrets mediante `sanitizeValueForAudit` antes de guardar en la bitácora.
  9. Aplicar seudonimización o enmascaramiento de datos personales en los logs exportables.
  10. Habilitar la consulta paginada del historial de auditoría de un aspirante desde la consola de administración.
  11. Facilitar la reconstrucción cronológica completa de una conversión o de una operación que haya fallado parcialmente.
  12. Vincular los identificadores de trazabilidad (`correlationId`) entre el servicio académico, de usuarios y contable.
- **Criterios de Aceptación:**
  - [x] Toda actualización de estado o conversión de admisión genera su registro de diff en `HistorialCambiosEntidad`.
  - [x] Intentos de modificación no autorizados en la bitácora son bloqueados.
  - [x] Los logs sanitizan contraseñas, tokens e información altamente confidencial.
  - [x] Operaciones fallidas quedan marcadas con nivel `ERROR` o `WARN` con el detalle de la excepción.
  - [x] Se puede reconstruir la línea de tiempo completa de una solicitud desde su recepción hasta la matrícula.
  - [x] Descargas de documentos de menores quedan registradas con el usuario y la fecha.
  - [x] El `correlationId` permite rastrear una transacción a través de los 5 microservicios backend.
- **Estado:** [X] Completada

---

## PRIORIDAD P2: CONTINUIDAD DEL TRÁMITE, EXPERIENCIA DE USUARIO Y CALIDAD DE LA INFORMACIÓN

### [X] [TAREA-F5-015] Implementar guardado automático de borradores y recuperación de solicitudes
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P2-02) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.2, Brecha P2-02)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/student.js`, `admision.html`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Hoja `BorradoresAdmision`, `localStorage`, `setupUnsavedChangesProtection`
- **Descripción del Alcance:**
  1. Implementar la función de guardado de borradores parciales de admisión (`saveAdmissionDraft`, `getAdmissionDraft`).
  2. Activar el guardado automático en segundo plano con técnica de *debounce* (cada 5 segundos tras modificar campos) y la opción de guardado manual.
  3. Guardar el estado del borrador de forma híbrida: copia local inmediata en `localStorage` y sincronización con la hoja `BorradoresAdmision` si el usuario está autenticado.
  4. Recuperar y rellenar automáticamente los datos guardados al abrir nuevamente el formulario tras una desconexión o recarga.
  5. Indicar visualmente la fecha y hora del último borrador guardado y el estado de sincronización ("Borrador guardado localmente / en la nube").
  6. Permitir guardar borradores con campos obligatorios incompletos (validaciones estrictas aplican únicamente al envío formal final).
  7. Reintentar silenciosamente las sincronizaciones de borradores fallidas por problemas de red.
  8. Convertir el borrador en solicitud formal al presionar "Enviar Solicitud", eliminando o marcando como consumido el borrador.
  9. Proteger los borradores guardados en `localStorage` evitando la exposición de datos personales en computadoras públicas.
  10. Resolver conflictos de versión si el mismo borrador se edita desde múltiples dispositivos.
- **Criterios de Aceptación:**
  - [x] Un usuario puede cerrar la página a mitad del formulario y recuperar los datos al reingresar.
  - [x] Se permite guardar un borrador sin haber completado todos los campos obligatorios.
  - [x] El estado del borrador muestra claramente la fecha y hora de la última actualización.
  - [x] Al confirmar el envío formal, el borrador se convierte en solicitud y se purga del almacenamiento temporal.
  - [x] Errores de conexión no borran la copia local del borrador.
  - [x] Múltiples reintentos de guardado no generan borradores duplicados en la base de datos.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-016] Mejorar la experiencia de uso, accesibilidad y adaptación móvil del proceso de admisión
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P3-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.14, Brecha P3-01)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `admision.html`, `js/ui-common.js`, `css/`
- **Dependencias Expuestas:** `auditAndFixAccessibility`, `setupUnsavedChangesProtection`, WCAG 2.2 AA
- **Descripción del Alcance:**
  1. Estructurar el formulario de admisión en un *Stepper* guiado por pasos:
     - Paso 1: Datos del Aspirante
     - Paso 2: Datos de la Familia / Tutor
     - Paso 3: Selección Académica
     - Paso 4: Requisitos Documentales
     - Paso 5: Revisión General y Consentimiento
     - Paso 6: Confirmación y Comprobante
  2. Mostrar una barra de progreso elástica y clara que indique la fase actual y los pasos completados.
  3. Permitir la navegación libre hacia pasos anteriores sin perder la información reresada.
  4. Resaltar visualmente los pasos con campos incompletos o errores de validación.
  5. Desplegar una vista de resumen de verificación antes de la confirmación final.
  6. Presentar mensajes de error claros e interactivos junto a cada control afectado con foco automático.
  7. Deshabilitar los botones de envío durante la transmisión e incluir spinners de carga para prevenir el doble clic.
  8. Garantizar un diseño 100% responsivo para pantallas móviles, tabletas y computadoras de escritorio.
  9. Garantizar el cumplimiento estricto de accesibilidad WCAG 2.2 AA (navegación completa por teclado `Tab`, contraste alto, etiquetas ARIA, restauración de foco).
  10. Ejecutar `auditAndFixAccessibility()` automáticamente al renderizar las vistas de admisión.
  11. Asegurar la compatibilidad con lectores de pantalla para ciegos o personas con visión reducida.
- **Criterios de Aceptación:**
  - [x] El stepper de admisión permite navegar entre las secciones del formulario de manera fluida.
  - [x] Los datos ingresados se conservan intactos al retroceder a pasos anteriores.
  - [x] Botones de envío muestran estados de carga e impiden envíos repetidos por doble clic.
  - [x] La interfaz se adapta correctamente a dispositivos móviles de pantallas reducidas (320px en adelante).
  - [x] Todos los formularios son navegables con teclado y compatibles con lectores de pantalla.
  - [x] La auditoría en tiempo real de `auditAndFixAccessibility()` no reporta faltas de contraste o atributos ARIA ausentes.
- **Estado:** [X] Completada

---

### [TAREA-F5-017] Mejorar la gestión de duplicados, validación y calidad de los datos de aspirantes
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.1 y 5.6, Brecha P0-01)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `backend/academic-service/Code.gs` (l. 714, 4615-4650), `js/student.js`
- **Dependencias Expuestas:** Endpoint `findDuplicateStudents`, `normalizeString`, `SolicitudesAdmision`
- **Descripción del Alcance:**
  1. Implementar reglas estrictas de validación de formato en el servidor para DNI, pasaportes, números telefónicos, correos y fechas de nacimiento.
  2. Implementar la normalización diacrítica de texto (`normalizeString`) eliminando tildes, caracteres especiales y espacios redundantes antes de comparar.
  3. Extender `findDuplicateStudents` para comparar solicitudes de admisión activas contra expedientes existentes y otras solicitudes recibidas.
  4. Algoritmo de detección que clasifique:
     - Coincidencia Exacta (Mismo DNI / Identificación Nacional) -> Bloqueo preventivo de solicitud duplicada.
     - Coincidencia Alta (Mismos Nombres, Apellidos y Fecha de Nacimiento) -> Alerta de revisión para Secretaría.
     - Coincidencia Media (Mismo Email y Teléfono con Nombres Similares) -> Advertencia de posible duplicado.
  5. Prohibir la fusión o vinculación automática de registros sin la verificación manual de Secretaría.
  6. Proteger la privacidad evitando que los mensajes de alerta de duplicidad expongan datos personales de los expedientes existentes a usuarios no autorizados.
  7. Panel de resolución de duplicados para que Secretaría apruebe la creación de un nuevo expediente o vincule a una persona existente.
  8. Registrar la decisión de resolución de duplicados en la bitácora de auditoría.
  9. Validar que la corrección de datos en una solicitud conserve la trazabilidad original.
- **Criterios de Aceptación:**
  - [ ] Intentos de registrar un aspirante con un DNI ya existente en `SolicitudesAdmision` o `ExpedientesEstudiantes` son detectados e informados.
  - [ ] No se realizan fusiones automáticas de personas basadas únicamente en coincidencias de nombres.
  - [ ] La consola de administración despliega alertas de duplicidad para la revisión de Secretaría.
  - [ ] Los mensajes de validación no revelan información confidencial de terceros.
  - [ ] La resolución de duplicados queda documentada con el usuario, fecha y decisión en la bitácora.
- **Estado:** [ ] Pendiente

---

### [TAREA-F5-018] Completar la experiencia multiestudiante y el resumen familiar consolidado
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P1-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.9, Brecha P1-01)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/student.js` (l. 182-350), `backend/user-service/Code.gs` (l. 3261-3320)
- **Dependencias Expuestas:** `getGuardianStudents`, `getFamilyConsolidatedSummary`, `consolidateStudentDashboardSummary`
- **Descripción del Alcance:**
  1. Optimizar el selector multiestudiante (`initFamilyStudentSwitcher`) y el resumen consolidado (`getFamilyConsolidatedSummary`).
  2. Garantizar una estricta separación de contexto al conmutar entre estudiantes vinculados, refrescando completamente calificaciones, tareas, asistencias, avisos y saldos contables.
  3. En la vista consolidada familiar, distinguir explícitamente entre:
     - Saldo confirmado L 0.00 (Solvente).
     - Información pendiente o no cargada por el docente.
     - Fallo de conexión o respuesta del servidor.
     - Falta de permisos de consulta para el tutor.
  4. Garantizar que el cálculo de saldos consolidados sume correctamente los cargos pendientes de todos los hijos autorizados sin duplicar pagos en revisión.
  5. Mantener desglosados los cobros de admisión de los cargos de colegiatura y matrícula.
  6. Aplicar la matriz de permisos individuales por relación (Tutor Académico vs Tutor Financiero).
  7. Permitir la realización de pagos conjuntos multihijo (`submitJointFamilyPayment`) desglosando los montos aplicados a cada estudiante con comprobante único.
  8. Asegurar que un error de red en la consulta de un estudiante no altere ni ponga a cero los datos de los demás hijos.
  9. Si se revoca la relación familiar de un estudiante, removerlo inmediatamente del selector y de los totales consolidados.
- **Criterios de Aceptación:**
  - [ ] Al seleccionar otro estudiante, todo el panel refresca su información académica y contable sin mezclar datos del estudiante anterior.
  - [ ] Un saldo de L 0.00 se diferencia visualmente de un error de carga del servidor.
  - [ ] El pago conjunto multihijo registra la transacción contable desglosando los abonos para cada estudiante.
  - [ ] Tutores sin permisos financieros no pueden ver ni operar los saldos consolidados de la familia.
  - [ ] La revocación de un vínculo actualiza en tiempo real el selector multiestudiante.
- **Estado:** [ ] Pendiente

---

## PRIORIDAD P3: OPTIMIZACIÓN OPERATIVA Y MEJORA CONTINUA

### [TAREA-F5-019] Implementar herramientas de seguimiento operativo y análisis de admisiones
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P3-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.15, Brecha P3-01)
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** `dashboard-direccion.html`, `js/teacher.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Endpoints `getAdmissionRequests`, `getSecurityAndComplianceDashboardData`
- **Descripción del Alcance:**
  1. Crear un panel de indicadores métricos y analítica de admisiones en `dashboard-direccion.html`.
  2. Calcular métricas clave en tiempo real:
     - Total de Solicitudes Recibidas, En Revisión, Evaluadas, Admitidas, Rechazadas, En Espera y Convertidas.
     - Tasa de Conversión (% de admitidos que completan la matrícula).
     - Tiempo Promedio de Tramitación (Días entre recepción de solicitud y decisión final).
     - Embudo de Conversión por Grado y Nivel Académico.
  3. Desplegar filtros por año lectivo, periodo, nivel y departamento.
  4. Identificar embotellamientos operativos (solicitudes estancadas por falta de documentos o citas de evaluación).
  5. Analizar los motivos principales de rechazo o de abandono de solicitudes de admisión.
  6. Exportación de reportes analíticos en formato CSV/PDF para reuniones de junta directiva.
  7. Garantizar que las consultas analíticas se ejecuten sin alterar los estados o datos de los expedientes.
- **Criterios de Aceptación:**
  - [ ] El cuadro de mando despliega métricas exactas calculadas desde los registros reales de `SolicitudesAdmision`.
  - [ ] Los indicadores permiten filtrar dinámicamente por año lectivo y grado.
  - [ ] Se calculan con precisión los tiempos promedios de atención y las tasas de conversión.
  - [ ] La exportación de datos genera reportes sanitizados sin exponer contraseñas ni secrets.
  - [ ] La generación de reportes no degrada el rendimiento de las operaciones ordinarias.
- **Estado:** [ ] Pendiente

---

### [TAREA-F5-020] Optimizar las consultas, la sincronización y la capacidad de respuesta del proceso de admisión
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P3-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.15, Brecha P3-01)
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`, `js/api.js`
- **Dependencias Expuestas:** `CacheService`, `manageInstitutionalDataCache`, `fetchApi`
- **Descripción del Alcance:**
  1. Optimizar los llamados y lecturas a Hojas de Cálculo Google Apps Script en los endpoints de admisiones y portal familiar.
  2. Aplicar caché selectiva en `CacheService` para catálogos estáticos (grados, requisitos documentales, ofertas académicas) con tiempo de vida de 10 minutos.
  3. Implementar paginación en servidor (`page`, `pageSize`) en `getAdmissionRequests` evitando traer miles de filas en una sola petición.
  4. Invalidar la caché de forma inmediata ante cambios de estado de admisiones, asignaciones de cupos o revocación de vínculos familiares (`purgeSecurityCaches`).
  5. Optimizar las llamadas paralelas en el cliente usando `Promise.all` en el portal familiar.
  6. Definir límites de tamaño de peticiones y control de velocidad (*rate limiting*) para prevenir abuso de endpoints públicos.
  7. Monitorear tiempos de ejecución y registrar advertencias si un endpoint de admisión supera los 2000 ms.
- **Criterios de Aceptación:**
  - [ ] Las listas de solicitudes cargan mediante paginación en servidor sin retrasos visuales.
  - [ ] Catálogos estáticos se recuperan desde la caché reduciendo lecturas a las hojas de cálculo.
  - [ ] La invalidación de caché funciona en tiempo real al actualizar un registro de admisión.
  - [ ] Las consultas del portal familiar responden en menos de 1.5 segundos en condiciones normales.
  - [ ] Pruebas de estrés verifican que la optimización no corrompe la integridad de los datos.
- **Estado:** [ ] Pendiente

---
*Plan Maestro de Tareas Pendientes registrado y unificado por Jules conforme a los requerimientos oficiales de la Plataforma Integral de Gestión Educativa.*
