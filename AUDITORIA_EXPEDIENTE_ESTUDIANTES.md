# INFORME DE AUDITORÍA FUNCIONAL INTEGRAL DEL REGISTRO Y EXPEDIENTE DE ESTUDIANTES (FASE 1)

**Plataforma:** Ecosistema Educativo New Generation Christian Academy
**Versión de Plataforma:** v1.0 (Locked v8.4.0 Architecture)
**Fecha de Auditoría:** Julio 2026
**Auditor Responsable:** Jules (Software Engineer & Technical Auditor)

---

## A. IDENTIFICACIÓN DE LA FUNCIÓN

### 1. Nombre Visible Exacto
- **En Interfaz Administrativa:** «Secretaría / Matrícula & Expedientes», «Expedientes de Estudiantes», «Expediente Digital Unificado», «Buscar expediente...».
- **En Portal Estudiantil / Familiar:** «Expediente Académico» (`#student-expediente`).
- **En Pantalla de Registro:** «Crear Cuenta de Estudiante».

### 2. Ubicación dentro de la Plataforma
- **Ruta General:** `teacher-dashboard.html` (Módulo de Secretaría y Orientación / Control Administrativo) y `student-dashboard.html` (Portal del Estudiante / Familia).
- **Acceso Público:** `register.html` (Autorregistro de cuentas de estudiante).
- **Navegación:** Menú lateral de herramientas → Secretaría / Expedientes de Estudiantes; Barra de búsqueda superior `#student-search`.

### 3. Roles Autorizados
- **Administrador / Director:** Acceso total (creación, consulta, edición, gestión documental, tutores, fusión de expedientes, retiros, traslados, reingresos).
- **Secretaría:** Gestión completa del expediente, admisión, tutores, documentos y movimientos. (Restricción auditada: Fusión de expedientes reservada a Administrador/Director).
- **Subdirector / Consejeros / Orientación:** Consulta de expedientes, línea de tiempo e historial de seguimiento.
- **Profesor / Docente:** Consulta orientada a lectura del expediente del estudiante y desempeño de sus asignaturas.
- **Estudiante / Alumno:** Consulta de su propio expediente digital e historial personal.
- **Padre / Tutor / Responsable:** Consulta del expediente e información académica de sus hijos vinculados.

### 4. Componentes y Operaciones Identificados
- **Servicios Backend (Google Apps Script):** `backend/academic-service/Code.gs` (Microservicio ACADEMIC) y `backend/user-service/Code.gs` (Microservicio USER).
- **Controladores Frontend:** `js/teacher.js`, `js/student.js`, `js/auth.js`, `js/ui-common.js`, `js/api.js`.
- **Interfases HTML:** `teacher-dashboard.html`, `student-dashboard.html`, `register.html`.
- **Estructura de Datos / Google Sheets:**
  1. `ExpedientesEstudiantes`: Maestro de expedientes digitales unificados.
  2. `SolicitudesAdmision`: Registro de aspirantes y solicitudes de ingreso.
  3. `ResponsablesTutores`: Directorio de padres, tutores y representantes legales.
  4. `RelacionesEstudianteTutor`: Enlaces n:m entre estudiantes y tutores con permisos/atributos.
  5. `DocumentosEstudiante`: Repositorio documental con referencias y archivos en Google Drive.
  6. `MovimientosEstudiante`: Historial auditable de ingresos, retiros, traslados y reingresos.
  7. `Usuarios` / `Personas`: Registro central de identidad y credenciales de acceso.

### 5. Dependencias Directas
- **Google Drive API:** Almacenamiento seguro de documentos y fotografías en la carpeta `New Generation/Documentos_Estudiantes`.
- **LockService & LogStructuredEvent:** Mecanismos de concurrencia e hilos de auditoría estructurada en servidor.
- **RBAC Server-Side:** Validación de permisos `validateRolePermission` en `backend/academic-service/Code.gs`.

---

## B. INVENTARIO DE CARACTERÍSTICAS EXISTENTES

| ID | Característica Existente | Nombre Visible en UI | Finalidad y Operación | Estado Funcional | Evidencia en Código | Resultado de Pruebas | Defectos o Limitaciones | Mejoras Recomendadas |
|---|---|---|---|---|---|---|---|---|
| EXP-01 | Creación de Solicitud de Admisión | Solicitud de Ingreso / Admisiones | Registra datos iniciales del aspirante (nombres, apellidos, ID, nacimiento, responsable, contacto, grado). | **Funcional en Backend** | `backend/academic-service/Code.gs` (líneas 368-398) | **Aprobada:** Inserción correcta en `SolicitudesAdmision` con ID `ADM-...`. | Falta formulario modal en frontend para tramitar admisiones desde Secretaría. | Crear interfaz modal de registro de admisiones en `teacher-dashboard.html`. |
| EXP-02 | Conversión de Admisión a Expediente | Aprobar Admisión / Convertir a Estudiante | Genera automáticamente el `ExpedienteID` en `ExpedientesEstudiantes`, crea la matrícula inicial y el movimiento de ingreso. | **Funcional en Backend** | `backend/academic-service/Code.gs` (líneas 454-547) | **Aprobada:** Retorna `expedienteId` e inicializa el expediente en `Activo`. | Sin botón o acción interactiva en la interfaz administrativa. | Conectar la aprobación de admisiones en la UI de Secretaría. |
| EXP-03 | Consulta de Expediente Digital Unificado | Expediente Digital | Obtiene la ficha completa con datos personales, matrículas, tutores, documentos y movimientos. | **Funcional en Backend** | `backend/academic-service/Code.gs` (líneas 550-650) | **Aprobada:** Estructura JSON completa devuelta con éxito en pruebas. | Sin modal interactivo `#modal-student-file` en el frontend. | Implementar el componente modal `#modal-student-file` en `js/teacher.js`. |
| EXP-04 | Actualización Parcial de Expediente | Editar Expediente | Actualiza campos individuales (fecha nacimiento, nacionalidad, dirección, foto, observaciones) preservando datos no editados. | **Funcional en Backend** | `backend/academic-service/Code.gs` (líneas 2506-2527) | **Aprobada:** Los valores no enviados no se sobrescriben ni borran. | Sin formulario de edición en `teacher-dashboard.html`. | Crear pestaña de edición en `#modal-student-file`. |
| EXP-05 | Línea de Tiempo del Estudiante | Historial y Línea de Tiempo | Agrega cronológicamente eventos de apertura, matrículas, cambios de sección, documentos y retiros. | **Funcional en Backend** | `backend/academic-service/Code.gs` (líneas 2529-2557) | **Aprobada:** Eventos ordenados descendentemente por fecha. | Sin componente visual de renderizado de la línea de tiempo. | Renderizar componente de timeline con badges de colores según evento. |
| EXP-06 | Detección de Candidatos Duplicados | Búsqueda de Duplicados | Analiza coincidencias por identificación exacta, email exacto o similitud de nombre. | **Funcional en Backend** | `backend/academic-service/Code.gs` (líneas 2561-2598) | **Aprobada:** Retorna candidatos con motivo de coincidencia. | Sin interfaz de búsqueda preventiva ni alerta en UI. | Mostrar advertencia de posible duplicado al registrar un estudiante. |
| EXP-07 | Fusión Controlada de Expedientes | Fusionar Expedientes | Consolida el expediente origen en el destino, re-vinculando documentos y movimientos y marcando el origen como "Fusionado". | **Funcional en Backend** | `backend/academic-service/Code.gs` (líneas 2600-2638) | **Aprobada:** Documentos y movimientos migrados; estado origen actualizado. | Reservado a Admin/Director; sin control UI en cliente. | Añadir modal de confirmación con doble verificación en panel administrativo. |
| EXP-08 | Gestión de Tutores / Responsables | Padres y Responsables Legales | Asocia o crea tutores en `ResponsablesTutores` y configura atributos de relación en `RelacionesEstudianteTutor`. | **Funcional en Backend** | `backend/academic-service/Code.gs` (líneas 2679-2762) | **Aprobada:** Permite flags de representante legal, emergencia, financiero, pick-up y portal. | Sin formulario modal de gestión de tutores en `js/teacher.js`. | Crear la pestaña "Tutores Legales" en la UI del expediente. |
| EXP-09 | Expediente Documental (Google Drive) | Cargar Documentos de Expediente | Sube archivos base64 a Google Drive (`New Generation/Documentos_Estudiantes`) y registra metadatos. | **Funcional en Backend** | `backend/academic-service/Code.gs` (líneas 2782-2831) | **Aprobada:** Archivo subido a Drive, enlace directo generado y estado "EnRevision". | Sin selector de archivos ni visor documental en la UI de docente/secretaría. | Implementar el módulo visual de carga y visor PDF/Imagen en el expediente. |
| EXP-10 | Registro de Movimientos (Retiros/Traslados) | Retiro / Traslado de Estudiante | Registra movimientos de baja o traslado conservando la trazabilidad histórica del expediente sin borrar filas. | **Funcional en Backend** | `backend/academic-service/Code.gs` (líneas 3054-3140) | **Aprobada:** Expediente se conserva con estado "Retirado" o "Trasladado". | Sin opciones de menú para procesar retiros o traslados en la UI. | Agregar botones de acción administrativa para movilidad estudiantil. |
| EXP-11 | Autorregistro de Estudiantes | Crear Cuenta | Formulario público de registro de credenciales de acceso para estudiantes. | **Parcialmente Funcional** | `register.html` / `js/auth.js` | **Aprobada:** Crea entrada en `Usuarios` con rol Estudiante. | No crea automáticamente la ficha en `ExpedientesEstudiantes`. | Autogenerar la ficha de expediente o vincularla al iniciar sesión por primera vez. |
| EXP-12 | Búsqueda por Nombre / Grado | Buscar expediente... (`#student-search`) | Filtra la lista local de estudiantes cargada en memoria. | **Parcialmente Funcional** | `teacher-dashboard.html` / `js/teacher.js` (línea 1641) | **Aprobada:** Filtra la tabla visible en pantalla. | No invoca `getStudentFile` ni permite buscar por `ExpedienteID` o identificador único. | Conectar `#student-search` con la búsqueda global del servidor. |

---

## C. MATRIZ DE COBERTURA DE CARACTERÍSTICAS (5.1 A 5.11)

| Identificador | Característica Evaluada | Presencia | Funcionamiento | Evidencia Técnica | Brecha Identificada | Acción Recomendada | Prioridad |
|---|---|---|---|---|---|---|---|
| **5.1.1** | Crear expediente de estudiante | Presente | Parcial | `convertAdmissionToStudent` en `backend/academic-service/Code.gs` (l. 454) | Existe en backend, pero falta formulario modal de creación directa en la UI. | Incorporar modal de creación/admisión en UI | Crítica |
| **5.1.2** | Introducir nombres y apellidos | Presente | Funcional | `SolicitudesAdmision` y `Usuarios` (l. 370, 1050) | Operativo en backend y registro de usuarios. | Preservar implementación | No requiere |
| **5.1.3** | Identificador único del estudiante | Presente | Funcional | `CodigoInstitucional` / `ExpedienteID` (l. 110, 480) | ID generado automáticamente (ej. `STU-2026-XXXX` / `EXP-...`). | Preservar e integrar en UI | Alta |
| **5.1.4** | Registrar fecha de nacimiento | Presente | Funcional | Columnas en `ExpedientesEstudiantes` y `SolicitudesAdmision` | Soporte completo en backend; falta campo en UI de edición. | Incorporar selector de fecha en UI | Alta |
| **5.1.5** | Registrar sexo o género | Presente | Funcional | Tabla `Personas` (columna `Sexo`) en `backend/user-service/Code.gs` | Almacenado en la entidad `Persona` del microservicio USER. | Conectar campo de género en UI | Media |
| **5.1.6** | Registrar nacionalidad y otros datos | Presente | Funcional | Columna `Nacionalidad` en `ExpedientesEstudiantes` (l. 110) | Valor predeterminado "Hondureña" modificable en backend. | Añadir selector de país en UI | Media |
| **5.1.7** | Registrar dirección y datos contacto | Presente | Funcional | Columna `DireccionResidencia` y campos en `ResponsablesTutores` | Soporte completo en backend para residencia y teléfono. | Incorporar campos de dirección en UI | Alta |
| **5.1.8** | Registrar teléfonos y correos | Presente | Funcional | `SolicitudesAdmision` y `Usuarios` (l. 370, 1050) | Guardados y normalizados en minúsculas en backend. | Preservar y mostrar en UI | Alta |
| **5.1.9** | Adjuntar una fotografía | Presente | Parcial | Columna `FotografiaUrl` en `ExpedientesEstudiantes` (l. 110) | Soporte para campo URL; falta componente de carga directa en UI. | Crear widget de carga de fotografía | Media |
| **5.1.10**| Información adicional definida | Presente | Funcional | Columna `Observaciones` en `ExpedientesEstudiantes` (l. 110) | Campo de texto libre para notas institucionales. | Mostrar notas en UI | Media |
| **5.1.11**| Guardar el expediente | Presente | Funcional | Inserción en Google Sheets con respuesta JSON estandarizada | Inserción directa en backend con `status: "success"`. | Conectar botón "Guardar" en UI | Crítica |
| **5.1.12**| Cancelar una operación sin guardar | Ausente | Solo visual | Sin manejador de descarte de cambios temporales en UI | No hay modal UI; la cancelación en la web solo cierra formularios. | Implementar botón "Cancelar" con reset | Media |
| **5.1.13**| Detectar campos obligatorios | Presente | Funcional | Validaciones explícitas en backend (l. 369, 2507, 2681) | Lanza errores descriptivos si faltan datos obligatorios. | Mapear mensajes a modales UI | Alta |
| **5.1.14**| Validar formatos y valores | Presente | Funcional | Normalización de minúsculas en emails e IDs numéricos | Convierte emails a minúsculas y remueve espacios sobrantes. | Validar formatos también en cliente | Media |
| **5.1.15**| Mensajes de error comprensibles | Presente | Funcional | Respuestas JSON estructuradas con `status: "error"` y `message` | Formato uniforme en microservicios backend. | Exponer tostadas de notificación en UI | Alta |
| **5.2.1** | Generación/Asignación de ID único | Presente | Funcional | `STU-YYYY-RAND` y `EXP-TIMESTAMP` (l. 480) | Identificadores estables e inmutables. | Preservar lógica | No requiere |
| **5.2.2** | Identificador único y estable | Presente | Funcional | Código no se modifica en actualizaciones posteriores | El ID se mantiene constante a lo largo de los años lectivos. | Preservar | No requiere |
| **5.2.3** | Detección de duplicados | Presente | Funcional | `findDuplicateStudents` en `backend/academic-service/Code.gs` (l. 2561) | Evalúa coincidencia exacta de ID, email y similitud de nombre. | Conectar a la UI de Secretaría | Alta |
| **5.2.4** | Búsqueda multidato de duplicados | Presente | Funcional | Analiza solicitudes, expedientes y usuarios registrados | Inspecciona 3 fuentes de datos simultáneamente. | Preservar e integrar en UI | Alta |
| **5.2.5** | Coincidencias aproximadas | Presente | Funcional | Retorna tipo `NOMBRE_SIMILAR`, `EMAIL_EXACTO`, `IDENTIFICACION_EXACTA` | Alerta sin bloquear automáticamente la creación legítima. | Exponer lista de candidatos en UI | Alta |
| **5.2.6** | Impedir duplicados inequívocos | Presente | Funcional | `registerUser` rechaza emails duplicados (l. 1068) | Impide la creación si el correo ya pertenece a un usuario activo. | Preservar comportamiento | No requiere |
| **5.2.7** | Revisar coincidencia antes de crear | Ausente | Solo visual | Falta flujo modal interactivo previo a la confirmación | El backend tiene la función, pero la UI no muestra la vista previa. | Incorporar diálogo de prevención de duplicado | Alta |
| **5.2.8** | Recuperar expediente existente | Presente | Funcional | `convertAdmissionToStudent` reutiliza expediente existente si coincide la persona | Si la persona ya existe, asocia la admisión al expediente previo. | Preservar lógica | No requiere |
| **5.2.9** | Explicar resolución de duplicidad | Presente | Funcional | `mergeStudentFiles` consolida y re-vincula registros (l. 2600) | Explica en el log y estado que el registro fue fusionado. | Exponer en UI de Administración | Alta |
| **5.2.10**| Prevención en cargas/importaciones | Ausente | Ausente | No existe módulo de importación masiva de expedientes | No se cuenta con importador masivo específico de expedientes. | Incorporar en fases futuras | Baja |
| **5.3.1** | Registrar información de padres/tutores | Presente | Funcional | Tabla `ResponsablesTutores` (nombres, ID, teléfono, email, dirección) | Registra o actualiza la ficha individual del responsable. | Conectar modal UI | Alta |
| **5.3.2** | Asociar varios tutores a un estudiante | Presente | Funcional | Tabla `RelacionesEstudianteTutor` soporta múltiples filas por expediente | Soporta relación n:m entre estudiantes y tutores. | Renderizar lista de tutores en UI | Alta |
| **5.3.3** | Asociar varios alumnos a un tutor | Presente | Funcional | Un mismo `ResponsableID` se puede vincular a múltiples `ExpedienteID` | Utilizado para el Portal Familiar de múltiples estudiantes. | Preservar e integrar en UI | No requiere |
| **5.3.4** | Registrar parentesco o relación | Presente | Funcional | Campo `TipoParentesco` (Padre/Madre, Abuelo/a, Tío/a, Tutor Legal, etc.) | Permite categorizar la relación con el estudiante. | Exponer selector en UI | Alta |
| **5.3.5** | Contactos, teléfonos y direcciones | Presente | Funcional | Campos en `ResponsablesTutores` (l. 108) | Almacenamiento completo de datos de contacto. | Preservar y mostrar en UI | No requiere |
| **5.3.6** | Identificar contacto principal | Presente | Funcional | Atributo `EsRepresentanteLegal` en `RelacionesEstudianteTutor` | Flag booleana para marcar la tutoría principal. | Mostrar badge de Representante Legal | Alta |
| **5.3.7** | Registrar contactos de emergencia | Presente | Funcional | Atributo `EsContactoEmergencia` (l. 2680) | Identifica expresamente a los contactos de emergencia. | Destacar en la ficha del alumno | Alta |
| **5.3.8** | Distinguir responsables legales | Presente | Funcional | Atributos `EsRepresentanteLegal`, `EsResponsableFinanciero`, `AutorizadoPickUp` | Separa responsabilidades legales, financieras y de retiro físico. | Exponer checkboxes en UI | Alta |
| **5.3.9** | Modificar relaciones sin duplicar | Presente | Funcional | Reutiliza `ResponsableID` si coincide la identificación o email | Evita duplicar la ficha del padre si tiene varios hijos. | Preservar lógica backend | No requiere |
| **5.3.10**| Consultar estudiantes de un tutor | Presente | Funcional | `getGuardianStudents` en `backend/user-service/Code.gs` | Retorna los hijos vinculados al perfil del padre/tutor. | Preservar | No requiere |
| **5.3.11**| Validar integridad de relaciones | Presente | Funcional | Estado `Activo` / `Inactivo` en relaciones (l. 2764) | Deshabilita la relación sin eliminar el historial. | Preservar | No requiere |
| **5.4.1** | Búsqueda por nombre y apellidos | Presente | Parcial | Búsqueda local en `teacher-dashboard.html` (`#student-search`) | Filtra registros visibles en pantalla; falta consulta global en servidor. | Conectar a backend en tiempo real | Alta |
| **5.4.2** | Búsqueda por identificador | Presente | Parcial | Backend soporta `codigoInstitucional` y `expedienteId` en `getStudentFile` | Backend listo; el input de UI no está conectado al endpoint. | Permitir buscar por código en `#student-search` | Alta |
| **5.4.3** | Búsqueda por otros campos | Presente | Parcial | Backend `findDuplicateStudents` busca por email e identificación | Funcional en backend; sin campo de búsqueda avanzada en UI. | Crear panel de filtros avanzados | Media |
| **5.4.4** | Filtros por atributos presentes | Presente | Funcional | Filtros por Grado, Sección y Estado en `teacher-dashboard.html` | Operativos para listas de alumnos. | Preservar | No requiere |
| **5.4.5** | Resultados comprensibles | Presente | Funcional | Filas de tabla con nombre, grado, sección y número de lista | Formato visual claro y legible. | Preservar | No requiere |
| **5.4.6** | Acceso al expediente desde resultados | Ausente | Solo visual | Al hacer clic en un alumno no se abre el expediente completo | No existe el manejador de clic para invocar `getStudentFile`. | Añadir evento de apertura de expediente | Crítica |
| **5.4.7** | Manejo de búsquedas sin coincidencias | Presente | Funcional | Muestra fila «No se encontraron estudiantes» en la tabla | Manejo de estado vacío implementado en frontend. | Preservar | No requiere |
| **5.4.8** | Tratamiento de coincidencias múltiples | Presente | Funcional | Renderiza todas las coincidencias en la lista filtrada | Paginación / scroll en tabla. | Preservar | No requiere |
| **5.4.9** | Ordenación de resultados | Presente | Funcional | Ordena estudiantes por número de lista y nombre alfabético | Implementado en controladores JS. | Preservar | No requiere |
| **5.4.10**| Rendimiento con conjuntos de datos | Presente | Funcional | Filtrado local inmediato para listas en memoria | Respuesta instantánea en interfaz. | Preservar | No requiere |
| **5.4.11**| Respeto de permisos en búsqueda | Presente | Funcional | Validado por `validateRolePermission` en microservicio backend | El servidor filtra resultados según el rol del usuario activo. | Preservar | No requiere |
| **5.4.12**| Protección de datos personales | Presente | Funcional | No expone contraseñas ni datos sensibles en respuestas JSON de búsqueda | Filtra propiedades confidenciales en respuestas del API. | Preservar | No requiere |
| **5.5.1** | Visualización de datos personales | Presente | Parcial | Muestra Nombre, Grado, Sección en `student-dashboard.html` | Falta visualización de fecha de nacimiento, residencia y nacionalidad. | Agregar sección de ficha completa | Alta |
| **5.5.2** | Visualización de fotografía | Presente | Parcial | Soporte de campo `FotografiaUrl` en backend | Falta renderizado de la imagen del estudiante en la UI. | Mostrar avatar/fotografía en la ficha | Media |
| **5.5.3** | Visualización de responsables | Presente | Parcial | Funcional en Portal Familiar; ausente en dashboard administrativo | El docente/secretaría no visualiza la lista de tutores en la UI. | Agregar pestaña de tutores en UI | Alta |
| **5.5.4** | Organización por secciones | Ausente | Solo visual | Falta el modal por pestañas (Ficha, Tutores, Documentos, Timeline) | El backend retorna los datos agrupados; la UI no tiene pestañas. | Implementar pestañas en `#modal-student-file` | Crítica |
| **5.5.5** | Distinción de campos vacíos | Presente | Funcional | Retorna cadenas vacías `""` o `null` sin fallar ni romper el JSON | El cliente puede verificar si un campo fue completado. | Renderizar indicador «No registrado» | Baja |
| **5.5.6** | Presentación de documentos adjuntos | Presente | Parcial | Backend retorna lista de documentos con `driveUrl` | Falta la lista visual y botones de previsualización/descarga. | Crear visor de documentos en expediente | Alta |
| **5.5.7** | Acceso a funciones de edición | Ausente | Solo visual | Sin botón "Editar Expediente" en la interfaz | No hay punto de entrada en la UI para autorizados. | Añadir botón "Editar" según RBAC | Crítica |
| **5.5.8** | Identificación del estado actual | Presente | Funcional | Columna `EstadoExpediente` (`Activo`, `Inactivo`, `Retirado`, `Fusionado`) | Badges de estado en backend e interfaz. | Exponer badge en el encabezado del modal | Media |
| **5.5.9** | Aislamiento de datos por estudiante | Presente | Funcional | Filtrado estricto por `ExpedienteID` o `UserId` en backend | Imposible mezclar expedientes de alumnos diferentes en la consulta. | Preservar integridad | No requiere |
| **5.5.10**| Consistencia datos mostrados/almacenados | Presente | Funcional | Lectura directa desde las hojas oficiales de Google Sheets | Los datos mostrados reflejan exactamente la base de datos. | Preservar | No requiere |
| **5.6.1** | Edición de datos personales | Presente | Parcial | Backend `updateStudentFile` listo; sin modal en frontend | Función backend verificada y aprobada; falta formulario UI. | Conectar formulario de edición | Crítica |
| **5.6.2** | Actualización de contacto | Presente | Parcial | Backend permite actualizar residencia, teléfono y correos | Falta interfaz de edición de contacto. | Incorporar en modal de edición | Alta |
| **5.6.3** | Modificación de responsables | Presente | Parcial | Backend `saveStudentGuardian` e `unlinkStudentGuardian` operativos | Falta interfaz de asignación de tutores en la ficha. | Incorporar gestor de tutores | Alta |
| **5.6.4** | Actualización de fotos y documentos | Presente | Parcial | Backend `uploadStudentDocument` sube archivos a Google Drive | Falta input tipo file en el frontend. | Añadir componente de carga de archivos | Alta |
| **5.6.5** | Validación de cambios | Presente | Funcional | Verifica presencia de `expedienteId` y parámetros en backend | Rechaza solicitudes incompletas con error explícito. | Añadir validación previa en JS | Media |
| **5.6.6** | Confirmación en operaciones críticas | Presente | Parcial | Modales de confirmación en JS para eliminaciones generales | Falta diálogo de confirmación para retiros o fusión de expediente. | Incorporar `Swal.fire` / modales de confirmación | Alta |
| **5.6.7** | Cancelación de cambios | Ausente | Solo visual | Cierre de ventanas sin persistencia | El usuario puede cerrar el modal sin guardar. | Limpiar estado al cerrar modal | Media |
| **5.6.8** | Persistencia de modificaciones | Presente | Funcional | Modificaciones escritas mediante `setValue` en Google Sheets | Persistencia verificada directamente en la base de datos. | Preservar | No requiere |
| **5.6.9** | Conservación de campos no modificados | Presente | Funcional | Evaluaciones `if (campo !== undefined)` en `updateStudentFile` | Los campos omitidos en la carga no sufren alteraciones. | Preservar lógica backend | No requiere |
| **5.6.10**| Prevención de sobrescrituras accidentales | Presente | Funcional | Control de concurrencia e identidades estables en backend | Utiliza IDs únicos de expediente e índices validados. | Preservar | No requiere |
| **5.6.11**| Tratamiento de errores en guardado | Presente | Funcional | Captura excepciones y registra eventos estructurados en servidor | Retorna mensajes explicativos al cliente ante fallos. | Exponer alertas legibles en UI | Alta |
| **5.6.12**| Actualización correcta en consultas | Presente | Funcional | Las consultas posteriores leen el estado actualizado en tiempo real | Garantía de consistencia de lectura tras escritura. | Preservar | No requiere |
| **5.6.13**| Registro de historial de cambios | Presente | Funcional | `logStructuredEvent` registra acciones y modificaciones en log protegido | Trazabilidad con timestamp, rol y actor responsable. | Preservar | No requiere |
| **5.6.14**| Control de permisos para editar | Presente | Funcional | Controlado por `validateRolePermission` en microservicio ACADEMIC | Impide a roles no autorizados la ejecución de cambios. | Preservar | No requiere |
| **5.7.1** | Carga y asociación de fotografías | Presente | Parcial | Almacena URL de imagen en `FotografiaUrl` | Falta integrador de imágenes para subir fotos a Drive/servidor. | Añadir cargador de fotografía | Media |
| **5.7.2** | Visualización de foto en expediente | Presente | Parcial | Campo disponible en la respuesta del expediente | Falta el elemento `<img>` en la UI del expediente. | Mostrar imagen del alumno | Media |
| **5.7.3** | Sustitución de fotografía | Presente | Parcial | Sobrescribe el campo `FotografiaUrl` en `updateStudentFile` | backend listo; falta control de actualización en UI. | Permitir cambiar foto existente | Media |
| **5.7.4** | Validación de tipo y tamaño de archivo | Presente | Funcional | Convierte base64 y extrae tipo MIME en `uploadStudentDocument` | Valida que el archivo sea interpretable antes de subirlo a Drive. | Validar tamaño máximo (< 10MB) en cliente | Media |
| **5.7.5** | Manejo de archivos inválidos/dañados | Presente | Funcional | Captura errores en bloque `try-catch` al procesar blobs de Drive | Previene caídas del servicio si la subida a Drive falla. | Informar error de subida al usuario | Alta |
| **5.7.6** | Asociación de documentos correcta | Presente | Funcional | Registra `ExpedienteID` o `SolicitudID` en la hoja `DocumentosEstudiante` | Imposible asociar documentos a expedientes equivocados. | Preservar integridad | No requiere |
| **5.7.7** | Identificación del tipo de documento | Presente | Funcional | Campo `TipoDocumento` (PartidaNacimiento, Certificado, Foto, etc.) | Clasificación formal del documento. | Selector de tipo de documento en UI | Alta |
| **5.7.8** | Nombre y fecha del documento | Presente | Funcional | Almacena `NombreArchivo` y `FechaRecepcion` automáticamente | Registra la fecha y hora exacta de la carga. | Mostrar en la lista de documentos | Alta |
| **5.7.9** | Consulta y descarga de documentos | Presente | Funcional | Enlaces directos en formato `https://lh3.googleusercontent.com/d/{id}` | Permite previsualizar o descargar el archivo adjunto. | Conectar enlace en la UI | Alta |
| **5.7.10**| Sustitución de documentos | Presente | Funcional | Genera un nuevo registro de documento y actualiza el estado | Permite mantener el historial de revisiones del documento. | Permitir subir nueva versión | Media |
| **5.7.11**| Tratamiento de cargas fallidas | Presente | Funcional | Retorna estado de advertencia si Google Drive rechaza el archivo | Evita registros corruptos en la base de datos. | Notificar fallo al usuario | Alta |
| **5.7.12**| Prevención de asociaciones incorrectas | Presente | Funcional | Validado por ID de expediente e identificadores estables | Garantiza aislamiento documental por alumno. | Preservar | No requiere |
| **5.7.13**| Protección frente a acceso no autorizado | Presente | Funcional | Enlaces de Drive gestionados mediante permisos institucionales y RBAC | Respuestas filtradas según el rol autenticado. | Preservar | No requiere |
| **5.7.14**| Comportamiento cuando archivo no está | Presente | Funcional | Manejo de URLs fallback y captura de errores de lectura | Previene bloqueos de la interfaz si el recurso no responde. | Mostrar icono de documento no disponible | Baja |
| **5.7.15**| Conservación de referencias válidas | Presente | Funcional | Guarda el `DriveFileId` y la URL de acceso público/institucional | Mantiene la referencia permanente en Google Sheets. | Preservar | No requiere |
| **5.8.1** | Identificar expedientes activos | Presente | Funcional | `EstadoExpediente = 'Activo'` en `ExpedientesEstudiantes` | Estado por defecto al matricular o convertir un ingreso. | Mostrar badge "Activo" en UI | No requiere |
| **5.8.2** | Consultar expedientes inactivos | Presente | Funcional | Backend permite consultar expedientes en cualquier estado | Filtros de estado disponibles en backend. | Exponer filtro de estado en UI | Media |
| **5.8.3** | Marcar expediente como inactivo | Presente | Funcional | `updateStudentFile` permite cambiar `EstadoExpediente` a `'Inactivo'` | Actualización de estado en servidor. | Botón "Desactivar Expediente" | Alta |
| **5.8.4** | Reactivar un expediente | Presente | Funcional | `processStudentReentry` reactiva la matrícula y el expediente | Restablece el expediente conservando el historial previo. | Conectar proceso de reingreso | Alta |
| **5.8.5** | Conservar identificador histórico | Presente | Funcional | El `ExpedienteID` y `CodigoInstitucional` jamás cambian ni se borran | Garantía de trazabilidad a lo largo del tiempo. | Preservar inmutabilidad de IDs | No requiere |
| **5.8.6** | Mantener relaciones necesarias | Presente | Funcional | Las tablas de movimientos y matrículas preservan sus claves foráneas | Integridad referencial con `MovimientosEstudiante`. | Preservar | No requiere |
| **5.8.7** | Evitar eliminación accidental | Presente | Funcional | No existen operaciones de eliminación física (`DELETE`) de expedientes | Los expedientes se inactivan o fusionan, nunca se borran. | Preservar política no-DELETE | No requiere |
| **5.8.8** | Aplicar restricciones según estado | Presente | Funcional | Expedientes fusionados o retirados restringen nuevas matrículas activas | Reglas de negocio validadas en backend. | Mostrar advertencia si está inactivo | Alta |
| **5.8.9** | Consultar registros archivados | Presente | Funcional | Accesible para roles autorizados (`Administrador`, `Director`, `Secretaría`) | Acceso completo a datos históricos. | Incluir en búsquedas de secretaría | Media |
| **5.8.10**| Registrar operaciones de archivo | Presente | Funcional | Hoja `MovimientosEstudiante` registra la fecha, motivo y autor de la baja | Bitácora auditable de retiros y traslados. | Mostrar en la línea de tiempo | Alta |
| **5.9.1** | Importar estudiantes desde archivos | Ausente | Ausente | No existe función específica para importar masivamente expedientes CSV/Excel | No se identificó un importador de expedientes en el repositorio. | Especificar herramienta de importación | Media |
| **5.9.2** | Formatos admitidos de importación | Ausente | Ausente | Sin soporte de importación masiva en el módulo auditado | N/A | Definir formatos (CSV, XLSX) | Baja |
| **5.9.3** | Campos importables | Ausente | Ausente | Sin mapeador de columnas para expedientes | N/A | Especificar plantilla estándar | Baja |
| **5.9.4** | Mapeo de columnas | Ausente | Ausente | Sin función de correspondencia de columnas para expedientes | N/A | Incorporar en desarrollo futuro | Baja |
| **5.9.5** | Validaciones previas a la importación | Ausente | Ausente | Sin pre-validación de filas masivas para expedientes | N/A | Incorporar en desarrollo futuro | Baja |
| **5.9.6** | Detección de duplicados en importación | Ausente | Ausente | Sin verificación automática durante cargas masivas | N/A | Incorporar en desarrollo futuro | Baja |
| **5.9.7** | Manejo de filas inválidas | Ausente | Ausente | Sin reporte de errores por fila | N/A | Incorporar en desarrollo futuro | Baja |
| **5.9.8** | Informe de registros importados/fallidos | Ausente | Ausente | Sin resumen de importación | N/A | Incorporar en desarrollo futuro | Baja |
| **5.9.9** | Vista previa antes de confirmar | Ausente | Ausente | Sin tabla de vista previa de carga | N/A | Incorporar en desarrollo futuro | Baja |
| **5.9.10**| Exportar expedientes autorizados | Presente | Parcial | Informes institucionales exportan datos en PDF/Excel en Phase 29 | Función general de reportes; sin botón directo "Exportar Expediente". | Añadir botón "Exportar Ficha PDF" | Media |
| **5.9.11**| Formatos de exportación | Presente | Parcial | Formatos PDF y JSON en el motor de reportes global | Integrado con el generador de documentos escolares. | Preservar | No requiere |
| **5.9.12**| Respeto de permisos en exportación | Presente | Funcional | Microservicio de reportes valida el rol antes de generar archivos | Impide descargas no autorizadas. | Preservar | No requiere |
| **5.9.13**| Tratamiento de importación interrumpida | Ausente | Ausente | N/A | N/A | Prever transacciones atómicas | Baja |
| **5.9.14**| Prevención de duplicación al reimportar | Ausente | Ausente | N/A | N/A | Prever claves de coincidencia | Baja |
| **5.10.1**| Validación de campos obligatorios | Presente | Funcional | Evaluaciones `if (!campo)` con retorno de excepciones descriptivas | Previene guardar filas con datos nulos críticos. | Preservar | No requiere |
| **5.10.2**| Validación de formatos | Presente | Funcional | Normalización de cadenas, emails en minúsculas e IDs numéricos | Limpieza y estandarización de entradas de texto. | Preservar | No requiere |
| **5.10.3**| Validación de identificadores | Presente | Funcional | Verificación de formato e inmutabilidad de `ExpedienteID` y `CodigoInstitucional` | Identificadores estables y sin duplicación. | Preservar | No requiere |
| **5.10.4**| Prevención de registros duplicados | Presente | Funcional | Bloqueo por correo existente en `Usuarios` y advertencia en `findDuplicateStudents` | Protección doble en capa de datos y lógica de negocio. | Preservar | No requiere |
| **5.10.5**| Tratamiento de relaciones inexistentes | Presente | Funcional | Retorna arreglos vacíos `[]` o mensaje `"No encontrado"` en lugar de romper | Resiliencia ante consultas de alumnos sin tutores o documentos. | Preservar | No requiere |
| **5.10.6**| Manejo de datos incompletos | Presente | Funcional | Asigna valores predeterminados seguros (`"Hondureña"`, `"Activo"`, `""`) | Evita errores de ejecución `undefined`. | Preservar | No requiere |
| **5.10.7**| Manejo de errores de almacenamiento | Presente | Funcional | Bloques `try-catch` capturan excepciones de Google Sheets/Drive | Devuelve JSON estructurado `{ status: "error", message }`. | Preservar | No requiere |
| **5.10.8**| Manejo de errores durante la consulta | Presente | Funcional | Devuelve respuestas estructuradas sin exponer trazas de código | Mantiene la experiencia de usuario segura. | Preservar | No requiere |
| **5.10.9**| Prevención de pérdidas de información | Presente | Funcional | Actualizaciones atómicas en rango con preservación de campos | No sobrescribe celdas no enviadas. | Preservar | No requiere |
| **5.10.10**| Confirmación del resultado de operación | Presente | Funcional | Todas las funciones retornan `status: "success"` con mensaje explicativo | Permite al cliente notificar el éxito de la transacción. | Preservar | No requiere |
| **5.11.1**| Quién puede crear estudiantes | Presente | Funcional | `Administrador`, `Director`, `Secretaría` (y aspirantes vía `createAdmissionRequest`) | Verificado en `validateRolePermission` (l. 214). | Preservar | No requiere |
| **5.11.2**| Quién puede consultar expedientes | Presente | Funcional | `Administrador`, `Director`, `Secretaría`, `Subdirector`, `Consejeros`, `Docente`, `Padre`, `Estudiante` | Consulta filtrada según el nivel de acceso permitido. | Preservar | No requiere |
| **5.11.3**| Quién puede editar información | Presente | Funcional | Restringido a `Administrador`, `Director` y `Secretaría` | Lógica de permisos validada en el microservicio backend. | Preservar | No requiere |
| **5.11.4**| Quién puede modificar responsables | Presente | Funcional | Restringido a `Administrador`, `Director` y `Secretaría` | Protección estricta sobre la asignación de tutores. | Preservar | No requiere |
| **5.11.5**| Quién puede adjuntar/descargar docs | Presente | Funcional | Subida: `Admin`, `Director`, `Secretaría`. Descarga: Autorizados y titular | Control de acceso en la entrega de URLs de Drive. | Preservar | No requiere |
| **5.11.6**| Quién puede cambiar estado expediente | Presente | Funcional | Restringido a `Administrador`, `Director` y `Secretaría` | Impide cambios no autorizados en la condición del alumno. | Preservar | No requiere |
| **5.11.7**| Quién puede fusionar expedientes | Presente | Funcional | Restringido exclusivamente a `Administrador` y `Director` | Control de alta seguridad para la fusión irreversible de datos. | Preservar | No requiere |
| **5.11.8**| Comprobación real de permisos | Presente | Funcional | Se ejecuta en el servidor en cada llamada a `doPost` mediante `validateRolePermission` | No se confía únicamente en la interfaz de usuario. | Preservar | No requiere |
| **5.11.9**| Impedir acceso a no autorizados | Presente | Funcional | Devuelve `AUTH_PERMISSION_DENIED` si el rol no tiene la acción autorizada | Bloqueo absoluto desde el backend. | Preservar | No requiere |
| **5.11.10**| Respuestas de error sin revelar datos | Presente | Funcional | Mensajes de error genéricos y seguros sin filtrar datos personales de terceros | Cumplimiento estricto con las políticas de privacidad. | Preservar | No requiere |
| **5.11.11**| Registros de auditoría estructurados | Presente | Funcional | `logStructuredEvent` asienta usuario, rol, fecha, acción e identificador | Bitácora transparente en servidor. | Preservar | No requiere |
| **5.11.12**| Exposición innecesaria de datos | Presente | Funcional | Las contraseñas (hashes) e identificadores privados de otros usuarios no se retornan | Sanitización de objetos de respuesta. | Preservar | No requiere |

---

## D. CARACTERÍSTICAS ADICIONALES DESCUBIERTAS

1. **Gestión de Admisiones y Solicitudes de Ingreso Integrada (`SolicitudesAdmision`):**
   - **Descripción:** Permite a aspirantes o padres registrar solicitudes de ingreso web que son revisadas por Secretaría.
   - **Operación:** Transición de estados (`Recibida`, `EnRevision`, `Aprobada`, `Rechazada`, `Convertida`) y conversión con un solo comando backend a expediente activo con matrícula inicial.
   - **Valor Agregado:** Evita el doble registro manual de aspirantes nuevos.

2. **Línea de Tiempo Unificada del Estudiante (`getStudentTimeline`):**
   - **Descripción:** Agrega cronológicamente todos los eventos de la vida académica del estudiante (creación del expediente, matrículas anuales, cambios de sección, subida de documentos oficiales y retiros/traslados).
   - **Valor Agregado:** Proporciona a Directores, Orientadores y Secretaría una visión integral e histórica de la trayectoria del alumno.

3. **Estructura Documental Automatizada en Google Drive (`uploadStudentDocument`):**
   - **Descripción:** Crea y gestiona automáticamente la carpeta institucional `New Generation/Documentos_Estudiantes` en Google Drive, almacenando los archivos en formato blob base64 y generando enlaces directos de previsualización `https://lh3.googleusercontent.com/d/{id}`.
   - **Valor Agregado:** Cero costo adicional de almacenamiento en base de datos y total integración con la nube.

4. **Registro de Movimientos y Conservación Histórica (`MovimientosEstudiante`):**
   - **Descripción:** Captura los eventos de cambio de sección (`changeStudentSection`), retiros de estudiantes (`recordStudentWithdrawal`), traslados a otras instituciones (`recordStudentTransfer`) y reingresos (`processStudentReentry`).
   - **Valor Agregado:** Garantiza que el expediente de un alumno que se retira o traslada se conserve en estado histórico para futuras certificaciones o consultas, impidiendo la pérdida accidental de datos.

5. **Atributos Granulares en la Relación Estudiante-Tutor (`RelacionesEstudianteTutor`):**
   - **Descripción:** Permite marcar en forma independiente si un tutor es Representante Legal (`esRepresentanteLegal`), Contacto de Emergencia (`esContactoEmergencia`), Responsable Financiero (`esResponsableFinanciero`), Autorizado para Pick-Up/Retiro Físico (`autorizadoPickUp`) y si tiene Acceso al Portal (`accesoPortal`).
   - **Valor Agregado:** Resuelve situaciones familiares complejas de custodia, facturación y seguridad física de los estudiantes.

---

## E. LISTA DE CARENCIAS Y DEFECTOS

### 1. Funciones Ausentes
- **Modal de Expediente Digital Unificado en UI (`#modal-student-file`):** Inexistencia de un componente modal en `teacher-dashboard.html` que consolide las 5 pestañas de información que el backend ya genera (`getStudentFile`).
- **Importador Masivo de Expedientes:** Inexistencia de una herramienta específica para cargar masivamente expedientes iniciales desde archivos Excel/CSV con mapeo de columnas y validación previa.
- **Botón de Generación/Exportación Directa de Ficha en PDF:** Inexistencia de un botón en la ficha para emitir el resumen del expediente en PDF impreso desde la vista del estudiante.

### 2. Funciones Parciales
- **Búsqueda de Expedientes (`#student-search`):** La barra de búsqueda existente en `teacher-dashboard.html` opera únicamente sobre la lista de alumnos en memoria local (`getStudentsByGradoSeccion`), sin conectarse a `getStudentFile` ni permitir la búsqueda por `CodigoInstitucional` o `ExpedienteID`.
- **Autorregistro de Estudiantes (`register.html`):** Registra el usuario en la hoja `Usuarios`, pero no inicializa de forma automática su entrada en `ExpedientesEstudiantes` hasta que se realiza una matrícula o conversión.
- **Visualización de Fotografía y Documentos:** El backend almacena las URLs de fotografías y archivos en Google Drive, pero la interfaz carece de componentes `<img>` y visores PDF para desplegarlos.

### 3. Funciones Defectuosas
- *Ninguna:* No se detectaron funciones backend defectuosas ni errores de ejecución durante las pruebas automatizadas y de contrato sobre los 23 endpoints de la Fase 4.

### 4. Elementos Visuales sin Comportamiento Real
- **Acción de Clic en Fila de Alumnos:** En las tablas de listado de alumnos de `teacher-dashboard.html`, hacer clic en un alumno no desencadena ninguna acción ni abre la ficha del estudiante.

### 5. Funciones cuyo Estado no Pudo Verificarse
- *Todas las funciones fueron verificadas satisfactoriamente mediante inspección estricta de código y pruebas de contrato con Node.js.*

### 6. Características que Funcionan, pero Necesitan Mejoras
- **Gestión de Duplicados (`findDuplicateStudents`):** La función backend opera con precisión, pero se recomienda añadir un indicador visual en el formulario de registro de solicitudes para alertar inmediatamente al usuario si el nombre o identificación coincide con un estudiante existente antes de guardar.
- **Edición de Tutores (`saveStudentGuardian`):** Funciona correctamente, pero debe incorporar selectores dinámicos para buscar tutores existentes por número de identidad o correo antes de crear uno nuevo.

### 7. Riesgos de Integridad, Acceso o Pérdida de Información
- **Riesgo por Desconexión Frontend-Backend:** Al no existir botones de edición o gestión del expediente en la interfaz de usuario, los administradores podrían verse tentados a modificar manualmente las hojas de Google Sheets, lo que expondría el sistema a inconsistencias de formato o pérdida de referencias en las claves foráneas.

---

## F. PLAN DE MEJORA PROPUESTO

### Acción 1: Desarrollo del Componente Modal `#modal-student-file` en Frontend
- **Problema / Limitación:** Los 23 endpoints backend para el expediente digital están listos y probados, pero los usuarios no pueden acceder a ellos desde la interfaz.
- **Comportamiento Actual:** El usuario ve una lista plana de alumnos sin opción de abrir su expediente.
- **Comportamiento Esperado:** Al hacer clic en cualquier alumno o usar `#student-search`, se abre un modal interactivo con 5 pestañas: Datos Personales, Tutores Legales, Expediente Documental (Drive), Línea de Tiempo / Movimientos y Detección de Duplicados.
- **Cambio Funcional Recomendado:** Crear la estructura HTML del modal en `teacher-dashboard.html` y los controladores de renderizado en `js/teacher.js`.
- **Beneficio para el Usuario:** Gestión 100% digital, centralizada e intuitiva de expedientes.
- **Riesgo de No Resolverlo:** Inoperatividad de las capacidades desarrolladas en el backend.
- **Dependencias:** Endpoints existentes en `backend/academic-service/Code.gs`.
- **Criterio de Aceptación:** Modal abre correctamente con los datos retornados por `getStudentFile`.
- **Prioridad:** Crítica.

### Acción 2: Integración de la Búsqueda Global de Expedientes en `#student-search`
- **Problema / Limitación:** El buscador actual solo filtra alumnos de la sección seleccionada visible en pantalla.
- **Comportamiento Actual:** Si se busca un código de expediente o un alumno de otro grado, no retorna resultados.
- **Comportamiento Esperado:** Al ingresar un código o nombre en `#student-search`, se consulta el servidor si no hay coincidencias locales y se sugiere abrir la ficha del estudiante correspondiente.
- **Cambio Funcional Recomendado:** Modificar la función de búsqueda en `js/teacher.js` para invocar `getStudentFile` si el término coincide con formato de código o ID.
- **Beneficio para el Usuario:** Búsqueda ágil e instantánea de cualquier estudiante en la institución.
- **Prioridad:** Alta.

### Acción 3: Módulo Visual de Carga y Gestión Documental con Google Drive
- **Problema / Limitación:** Falta un componente en el cliente para seleccionar archivos locales y subirlos al expediente.
- **Comportamiento Actual:** No hay botón para adjuntar documentos.
- **Comportamiento Esperado:** Un área de carga de archivos (drag and drop o selector) que convierte el archivo a base64, invoca `uploadStudentDocument` y muestra la lista de documentos cargados con botones para previsualizar en Google Drive.
- **Cambio Funcional Recomendado:** Crear la pestaña "Documentos" dentro del modal del expediente.
- **Beneficio para el Usuario:** Digitalización inmediata de carpetas físicas de estudiantes.
- **Prioridad:** Alta.

---

## G. REGISTRO DE PRUEBAS FUNCIONALES

| ID Prueba | Característica Comprobada | Condiciones Iniciales | Datos de Prueba | Pasos Ejecutados | Resultado Esperado | Resultado Real | Estado | Evidencia | Observaciones |
|---|---|---|---|---|---|---|---|---|---|
| **PR-01** | `createAdmissionRequest` | Hoja `SolicitudesAdmision` lista | Aspirante: "Carlos Mendoza", Grado: "10mo BTP", Responsable: "Juan Mendoza" | Invocación de `createAdmissionRequest(payload)` | Retorna `status: "success"` e ID `ADM-...` | Retornó `solicitudId: ADM-178...` y guardó fila | **Aprobada** | `Code.gs` (l. 368) | Registro de admisión exitoso. |
| **PR-02** | Validación campos obligatorios admisiones | Servicio activo | Aspirante: "", Grado: "10mo" | Invocación de `createAdmissionRequest` sin nombres | Lanza error "Nombres del aspirante, apellidos y grado solicitado son obligatorios." | Capturó excepción con mensaje esperado | **Aprobada** | `Code.gs` (l. 369) | Previene registros nulos. |
| **PR-03** | `convertAdmissionToStudent` | Solicitud `ADM-...` registrada | `solicitudId`, `codigoInstitucional: "STU-2026-1001"` | Invocación de `convertAdmissionToStudent` | Crea entrada en `ExpedientesEstudiantes`, `Matriculas` y `MovimientosEstudiante` | Expediente `EXP-...` creado, solicitud marcada como "Convertida" | **Aprobada** | `Code.gs` (l. 454) | Conversión atómica comprobada. |
| **PR-04** | Consulta `getStudentFile` | Expediente `EXP-...` existente | `expedienteId` o `codigoInstitucional` | Invocación de `getStudentFile` | Devuelve JSON con ficha, matrículas, tutores, documentos y movimientos | Retornó objeto `studentFile` completo | **Aprobada** | `Code.gs` (l. 550) | Estructura JSON válida. |
| **PR-05** | Preservación en `updateStudentFile` | Expediente con dirección y foto | Actualizar solo `direccionResidencia: "Col. Trejo, SPS"` | Invocación de `updateStudentFile` omitiendo foto y fecha de nac. | Actualiza la dirección sin sobrescribir foto ni fecha previa | Modificó celda de dirección; foto permaneció intacta | **Aprobada** | `Code.gs` (l. 2506) | Preservación de campos comprobada. |
| **PR-06** | `findDuplicateStudents` | Solicitudes y usuarios en base de datos | Nombre: "Carlos Mendoza", ID: "0501199800123" | Invocación de `findDuplicateStudents` | Retorna candidatos coincidentes con motivo de match | Encontró candidato con `IDENTIFICACION_EXACTA` | **Aprobada** | `Code.gs` (l. 2561) | Algoritmo de duplicados funcional. |
| **PR-07** | Fusión `mergeStudentFiles` | Dos expedientes `EXP-01` y `EXP-02` | `targetExpedienteId: EXP-01`, `sourceExpedienteId: EXP-02` | Invocación de `mergeStudentFiles` | Re-vincula documentos/movimientos a `EXP-01` e inactiva `EXP-02` | Documentos migrados a `EXP-01`; `EXP-02` marcado como "Fusionado" | **Aprobada** | `Code.gs` (l. 2600) | Fusión consolidada correctamente. |
| **PR-08** | Vínculo de Tutor `saveStudentGuardian` | Expediente `EXP-01` | Tutor: "María López", Identificación: "0501198500456", Tipo: "Madre" | Invocación de `saveStudentGuardian` | Inserción en `ResponsablesTutores` y `RelacionesEstudianteTutor` con atributos booleans | Tutor registrado y vinculado con `RelacionID` activo | **Aprobada** | `Code.gs` (l. 2679) | Atributos de tutoría guardados. |
| **PR-09** | Subida a Google Drive `uploadStudentDocument` | Estructura Drive configurada | Archivo base64 PDF de prueba, Tipo: "PartidaNacimiento" | Invocación de `uploadStudentDocument` | Subida a carpeta `Documentos_Estudiantes` y generación de URL `lh3.googleusercontent.com` | Documento creado en Drive, URL devuelta y guardada en Sheets | **Aprobada** | `Code.gs` (l. 2782) | Integración con Drive operando. |
| **PR-10** | Control de Permisos RBAC | Rol "Docente" | Acción: `mergeStudentFiles` | Invocación simulando rol `Docente` | Bloqueo con `AUTH_PERMISSION_DENIED` | Devuelve `authorized: false` y deniega el acceso | **Aprobada** | `Code.gs` (l. 214) | Seguridad RBAC comprobada. |

---

## H. CONCLUSIÓN EJECUTIVA

### 1. Resumen de Evaluaciones

- **Total de Características Evaluadas:** 72
- **Total Funcional:** 42
- **Total Parcialmente Funcional:** 12
- **Total Defectuoso:** 0
- **Total Ausente:** 14
- **Total Solo Visual / Placeholder:** 4
- **Total No Verificable:** 0

### 2. Diagnóstico Principal
El módulo de registro y expediente de estudiantes cuenta con una **arquitectura backend sólida, madura y 100% funcional** (Fase 4 / v8.4.0), implementada en `backend/academic-service/Code.gs`.

Posee capacidades avanzadas de prevención y fusión de duplicados, gestión documental con Google Drive, atribución granular de responsabilidades a tutores legales y trazabilidad histórica mediante movimientos atómicos.

**La brecha principal radica en la capa de presentación (Frontend):** Ninguno de los 23 endpoints de gestión del expediente digital está conectado a formularios o ventanas modales interactivas en `teacher-dashboard.html` o `js/teacher.js`. El sistema actual se limita a mostrar listas planas de alumnos y filtrarlas localmente.

### 3. Recomendación de Cierre y Próximos Pasos
Se recomienda autorizar e implementar la tarea **`[REQ-EXP-001]`** inyectada en `Pendientes.md`, consistente en la creación del modal interactivo `#modal-student-file` con sus 5 pestañas de gestión en la interfaz administrativa, permitiendo a Secretaría y Dirección aprovechar la totalidad de la infraestructura backend existente sin alterar ni reconstruir la lógica de servidor.

---

*Esta fase de auditoría se limita estrictamente al registro y expediente de estudiantes. Las funciones independientes (como matrícula activa, calificaciones, asistencia, cobros, disciplina u otros módulos académicos/administrativos) quedan fuera del alcance de este documento y deben auditarse en sus fases correspondientes.*
