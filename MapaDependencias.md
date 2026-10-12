# Mapa de Dependencias Académicas (v8.3.0 - Fase 3 Configuración e Infraestructura Académica)

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
- Stores: news, teacher_projects, logros_data, academic_reports, student_profiles.

## Microservicios Modularizados y Propietarios de Datos (v8.3.0)
- **USER (Identity, Accounts & Analytics)**:
  - Autoridad de Escritura: `Usuarios`, `Personas`, `RelacionesFamiliares`, `NoticiasPortal`, `QuizProAnalytics`, `LearningProfile`, `GameLeaderboards`, `Logros`, `LogsSistema`.
  - Funciones: Identidad de Persona, Cuentas de Acceso, Autenticación (login/register), Recuperación/Invitaciones de Clave, Noticias, Analítica Psicométrica, Gamificación, Logs Estructurados.
- **ACADEMIC (School Management & Structure - Fase 3 Extended)**:
  - Autoridad de Escritura: `InstitucionParametros`, `SedesAulas`, `AnosLectivos`, `PeriodosAcademicos`, `CatalogoAsignaturas`, `PlanesEstudio`, `OfertaAcademica`, `AsignacionesDocentes`, `CalendarioAcademico`, `HorariosClase`, `ReglasAcademicas`, `ConfiguracionAcademica`, `HistorialAcademico`, `Matriculas`, `CargosEstudiante`, `Clases`, `BancoPreguntas`, `Respaldos`.
  - Funciones:
    1. Parametrización Institucional, Sedes y Aulas.
    2. Años Lectivos con ciclo de vida y Asistente de Preparación Anual (Copia de Oferta).
    3. Períodos Académicos Jerárquicos y estados de Apertura/Cierre de Parciales.
    4. Catálogo de Asignaturas, Planes de Estudio y Oferta Académica (Clases).
    5. Asignaciones Docentes (Titular, Asistente, Sustituto, Colaborador) con vigencia temporal.
    6. Calendario Académico (días lectivos/no lectivos, feriados, excepciones).
    7. Horarios de Clase, Jornadas, Bloques Horarios y Detección de Conflictos (docente o aula con horario solapado).
    8. Reglas Académicas Institucionales (Calificación, Promoción, Asistencia).
- **ACCOUNTING (Financial & Staff Payroll)**:
  - Autoridad de Escritura: `ConceptosCobro`, `PagosAbonos`, `ComprobantesPago`, `FacturasFiscales`, `MovimientosCajaBancos`, `CierresCaja`, `PlanillasNomenclatura`, `DeduccionesAsistencia`, `BoletasPago`, `InventariosKardex`, `ProveedoresActivos`.
  - Funciones: Contabilidad General, Cobros, Mensualidades, Comprobantes/Recibos PDF, Facturación SAR, Caja y Bancos, Planillas con Deducciones de Ley (IHSS, RAP, ISR), Asistencia y Kardex de Inventarios.
- **TASK (Learning & Submissions)**:
  - Autoridad de Escritura: `Tareas`, `Entregas`, `MetadatosArchivos`.
  - Funciones: Tareas Polimórficas, Entregas de Alumnos, Calificaciones, Proyectos y Google Drive Storage.
- **EXAM (Evaluations & Question Bank)**:
  - Autoridad de Escritura: `Examenes`, `EvaluacionesEstudiante`.
  - Funciones: Exámenes, Evaluaciones en línea y Banco de Preguntas Evaluativas.

## Matriz de Entidades Centrales
- `Persona`: Representa al individuo (ID único inmutable, Nombres, Apellidos, Contacto, Estado, Relaciones familiares).
- `CuentaUsuario`: Credenciales y estado de acceso (`Pendiente`, `Activa`, `Suspendida`, `Desactivada`).
- `AnoLectivo`: Ciclo escolar institucional (`Borrador`, `EnPreparacion`, `Activo`, `EnCierre`, `Cerrado`, `Archivado`).
- `PeriodoAcademico`: Períodos evaluativos (Semestre, Trimestre, Parcial, Unidad).
- `OfertaAcademica`: Clase configurada en un año lectivo (Año, Grado, Sección, Asignatura, Plan).
- `AsignacionDocente`: Asignación de docente a una OfertaAcadémica con rol (`Titular`, `Asistente`, `Sustituto`, `Colaborador`) y vigencia.
- `HorarioClase`: Sesiones programadas con día, hora inicio/fin, aula y docente.
