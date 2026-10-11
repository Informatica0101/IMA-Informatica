# Mapa de Dependencias Académicas (v7.6.1)

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
## Microservicios Modularizados (v8.1.0)
- USER: Autenticación, Usuarios, Perfiles, Noticias, Gamificación, Analítica Psicométrica (ICR, GP, Mastery) y LogsEstructurados.
- ACADEMIC: Configuración Académica Granular, Historial Académico, Matrículas Estudiantiles, Guías de Estudio, Respaldos y Verificación.
- ACCOUNTING: Contabilidad General, Conceptos de Cobro, Cuentas por Cobrar, Recibos PDF, Facturación SAR, Caja/Bancos, Planillas Hondureñas (IHSS, RAP, ISR), Asistencia y Kardex de Inventarios/Proveedores.
- TASK: Tareas Polimórficas, Entregas, Calificaciones, Proyectos y MetadatosArchivos en Drive.
- EXAM: Exámenes, Banco de Preguntas Evaluativas y Evaluaciones.

## Módulo Académico (v7.9.3)
- academic-service/Code.gs -> Gestión atómica de ConfiguracionAcademica e HistorialAcademico.
- student.js (renderSubjectNavigation) -> Filtrado estricto por GranularConfig (Grado, Sección, Parcial).
