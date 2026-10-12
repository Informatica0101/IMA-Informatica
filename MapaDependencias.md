# Mapa de Dependencias Académicas (v8.2.0 - Fase 2 Arquitectura y Permisos)

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

## Microservicios Modularizados y Propietarios de Datos (v8.2.0)
- **USER (Identity, Accounts & Analytics)**:
  - Autoridad de Escritura: `Usuarios`, `NoticiasPortal`, `QuizProAnalytics`, `LearningProfile`, `GameLeaderboards`, `Logros`, `LogsSistema`.
  - Funciones: Identidad de Persona, Cuentas de Acceso, Autenticación (login/register), Recuperación/Invitaciones de Clave, Noticias, Analítica Psicométrica, Gamificación, Logs Estructurados.
- **ACADEMIC (School Management & Structure)**:
  - Autoridad de Escritura: `ConfiguracionAcademica`, `HistorialAcademico`, `Matriculas`, `CargosEstudiante`, `Clases`, `BancoPreguntas`, `Respaldos`.
  - Funciones: Estructura Académica (Grados, Secciones, Asignaturas, Parciales, Unidades, Temas), Matrículas Históricas, Guías de Estudio, Asignaciones y Relevos Docentes, Copias de Seguridad.
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
- `ExpedienteEstudiante`: Vinculado a `Persona` y `Matricula` anual.
- `ExpedienteLaboral`: Vinculado a `Persona` y `PlanillasNomenclatura`.
