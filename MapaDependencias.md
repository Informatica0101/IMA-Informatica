# Mapa de Dependencias Académicas (v8.8.0 - Fase 8 Portal Familiar y Comunicación)

## Módulo de Tareas (Teacher/Student)
- Entidad: Tarea (Regular) -> Impacta Progreso Base.
- Entidad: Crédito Extra -> Impacta Recuperación (No afecta Base).
- Relación: Crédito Extra [1] <-> [1] Tarea Rechazada.

## Módulo de Navegación
- ui-common.js (Garante de historial) -> teacher.js (Vistas de dashboard).
- ui-common.js (Garante de historial) -> index-ui.js (Navegación de recursos Index).
- presentation-engine.js -> Depende de ui-common.js para sanitización y seguridad.

## Módulo de Seguridad
- security-minigames.js (NUEVO) -> games-adapter.js (Coordinación).
- minigames (juegos/*.html) -> Dependen de security-minigames.js.

## Módulo de Persistencia y Caché
- persistence.js (DB v4) -> api.js (Silent Reconciliation).
- api.js -> dashboard-modules (teacher.js, student.js, index-ui.js).
- Stores: news, teacher_projects, logros_data, academic_reports, student_profiles, student_files, admission_requests.

## Microservicios Modularizados y Propietarios de Datos (v8.4.0)
- **USER (Identity, Accounts & Analytics)**:
  - Autoridad de Escritura: `Usuarios`, `Personas`, `RelacionesFamiliares`, `NoticiasPortal`, `QuizProAnalytics`, `LearningProfile`, `GameLeaderboards`, `Logros`, `LogsSistema`.
  - Funciones: Identidad de Persona, Cuentas de Acceso, Autenticación (login/register), Recuperación/Invitaciones de Clave, Noticias, Analítica Psicométrica, Gamificación, Logs Estructurados.
- **ACADEMIC (School Management, Admissions, Files & Structure - Fase 4 Extended)**:
  - Autoridad de Escritura: `ExpedientesEstudiantes`, `SolicitudesAdmision`, `ResponsablesTutores`, `RelacionesEstudianteTutor`, `DocumentosEstudiante`, `MovimientosEstudiante`, `AntecedentesAcademicos`, `InstitucionParametros`, `SedesAulas`, `AnosLectivos`, `PeriodosAcademicos`, `CatalogoAsignaturas`, `PlanesEstudio`, `OfertaAcademica`, `AsignacionesDocentes`, `CalendarioAcademico`, `HorariosClase`, `ReglasAcademicas`, `ConfiguracionAcademica`, `HistorialAcademico`, `Matriculas`, `CargosEstudiante`, `Clases`, `BancoPreguntas`, `Respaldos`.
  - Funciones:
    1. Admisiones y Solicitudes de Ingreso con conversión a Expediente e Idempotencia.
    2. Expediente Digital Integral (Ficha de estudiante, línea de tiempo e historial).
    3. Detección de Duplicados (Coincidencia por Identificación, Correo, Nombre Completo) y Fusión Controlada.
    4. Gestión de Tutores/Responsables y relaciones con permisos delimitados.
    5. Gestión Documental Estudiantil (Validación, Almacenamiento Drive y Estados).
    6. Matrículas, Renovaciones, Control de Cupos y Prevención de Doble Matrícula.
    7. Movimientos Estudiantiles (Cambios de Sección/Grado, Traslados Internos/Externos, Retiros y Reingresos) con conservación de historial.
    8. Parametrización Institucional, Años Lectivos, Períodos Jerárquicos, Oferta Académica, Asignaciones y Horarios con detección de conflictos.
- **ACCOUNTING (Financial & Staff Payroll)**:
  - Autoridad de Escritura: `ConceptosCobro`, `PagosAbonos`, `ComprobantesPago`, `FacturasFiscales`, `MovimientosCajaBancos`, `CierresCaja`, `PlanillasNomenclatura`, `DeduccionesAsistencia`, `BoletasPago`, `InventariosKardex`, `ProveedoresActivos`.
  - Funciones: Contabilidad General, Cobros, Mensualidades, Comprobantes/Recibos PDF, Facturación SAR, Caja y Bancos, Planillas con Deducciones de Ley (IHSS, RAP, ISR), Asistencia y Kardex de Inventarios.
- **TASK (Learning & Submissions)**:
  - Autoridad de Escritura: `Tareas`, `Entregas`, `MetadatosArchivos`.
  - Funciones: Tareas Polimórficas, Entregas de Alumnos, Calificaciones, Proyectos y Google Drive Storage.
- **EXAM (Evaluations & Question Bank)**:
  - Autoridad de Escritura: `Examenes`, `EvaluacionesEstudiante`.
  - Funciones: Exámenes, Evaluaciones en línea y Banco de Preguntas Evaluativas.

## Matriz de Entidades Centrales - Fase 4
- `Persona`: Representa al individuo (ID único inmutable, Nombres, Apellidos, Contacto, Estado, Relaciones familiares).
- `ExpedienteEstudiante`: Contiene el Código Institucional, Ficha Médica/Sensible, Estado del Expediente e Historial de Trayectoria.
- `CuentaUsuario`: Credenciales y estado de acceso (`Pendiente`, `Activa`, `Suspendida`, `Desactivada`).
- `SolicitudAdmision`: Solicitud de ingreso con estado (`Borrador`, `Recibida`, `EnRevision`, `Aprobada`, `Rechazada`, `ListaEspera`, `Convertida`).
- `Matricula`: Inscripción anual vinculada a `ExpedienteEstudiante`, `AnoLectivo`, `Grado` y `Seccion` con estado (`Borrador`, `Confirmada`, `Activa`, `Trasladada`, `Retirada`, `Cancelada`).
- `ResponsableTutor`: Tutores/Padres vinculados a uno o varios estudiantes con tipo de relación y alcance de permisos.
- `DocumentoEstudiante`: Archivo cargado con metadatos, estado de revisión y enlace seguro a Drive.
- `MovimientoEstudiante`: Historial inmutable de cambios de sección, traslados, retiros y reingresos.

## Matriz de Entidades Centrales - Fase 5 (Aula Virtual y Contenidos)
- `AulaVirtual`: Entidad vinculada a `OfertaAcademica` (Grado, Sección, Asignatura, ProfesorID, Año Lectivo, Estado).
- `PublicacionAnuncio`: Anuncios de clase (Fijados, Borradores, Programados diferidos por fecha/hora, Categorías, AdjuntosJSON, Audiencia).
- `MaterialEducativo`: Biblioteca de recursos de estudio (PDF, DOCX, Video, Link, Presentaciones, Guías) clasificados por Parcial, Unidad y Tema.
- `TareaActividad`: Tareas enriquecidas con disponibilidad diferida (`fechaDisponible`), límite de entrega (`fechaLimite`), cierre definitivo (`fechaCierre`), borradores, extensiones por estudiante e indicaciones.
- `EntregaEstudiante`: Entregas multimodales (Archivo Drive, Texto Enriquecido, Enlace Externo), estado (`Pendiente`, `Entregada`, `EntregadaTarde`, `DevueltaCorrección`, `Revisada`) y confirmación con token de recepción del servidor.
- `EntregaVersion`: Historial de versiones de entregas anteriores tras reenvíos o devoluciones para corrección.
- `ComentarioEntrega`: Hilo de comentarios privados entre docente y estudiante sobre trabajos específicos.

## Matriz de Entidades Centrales - Fase 6 (Evaluación y Módulo Formativo)
- `CategoriaEvaluacion`: Categorías ponderadas de evaluación académica (Tareas %, Exámenes %, Proyectos %, Prácticas %).
- `CalificacionEstudiante`: Registro atómico de notas académicas por estudiante, evaluación, ponderación y borrador/publicado.
- `RubricaEvaluacion`: Rúbricas de evaluación analíticas por competencias y criterios observables.
- `RecuperacionEstudiante`: Intentos de recuperación/reposición con historial de nota original y nota alcanzada.
- `CierrePeriodo`: Control del cierre oficial de calificaciones por parcial, asignatura y grupo.
- `CriterioInstitucional`: Catálogo institucional de criterios de Comportamiento, Aseo personal/Higiene y Presentación personal.
- `EvaluacionFormativa`: Evaluaciones e incidencias formativas del estudiante, independientes de las notas académicas.
- `PlanAcompanamiento`: Planes de acompañamiento pedagógico confidenciales para seguimiento estudiante/padre.

## Matriz de Entidades Centrales - Fase 7 (Asistencia y Seguimiento Estudiantil)
- `SesionAsistencia`: Sesión de clase u orden de jornada abierta para tomar asistencia (Fecha, Grado, Sección, Asignatura, Docente).
- `RegistroAsistencia`: Registro individual por estudiante (Presente, Ausente, Tardanza, MinutosTardanza, Justificado).
- `JustificacionAsistencia`: Solicitud o comprobante de justificación de falta/tardanza con documento adjunto y revisión administrativa.
- `SalidaAnticipada`: Registro de retiros de la institución antes de finalizar la jornada con autorización y acompañante.
- `IncidenciaAsistencia`: Incidencias de puntualidad/ausentismo recurrentes reportadas por docentes/Secretaría.
- `CasoSeguimiento`: Casos de acompañamiento preventivo por ausentismo recurrente o patrones de tardanza.

## Matriz de Entidades Centrales - Fase 8 (Portal Familiar y Comunicación Institucional)
- `InvitacionVinculacion`: Invitaciones temporales con token HTTPS para vinculación comprobada responsable-estudiante.
- `ComunicadoInstitucional`: Comunicados y avisos con audiencia segmentada, fecha de vigencia y firmas/confirmaciones.
- `ConversacionMensaje`: Mensajería institucional bidireccional entre responsable legal, docente, Secretaría u Orientación.
- `BandejaNotificacion`: Notificaciones internas unificadas con control de lectura y enlaces de acción.
- `SolicitudTramite`: Trámites y solicitudes administrativas (constancias, revisiones, solicitudes de justificante).
- `CitaReunion`: Citas institucionales con confirmación de horario y estado de atención.
