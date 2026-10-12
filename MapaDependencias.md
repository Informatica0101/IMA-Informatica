# Mapa de Dependencias e Inventario de Microservicios (v8.1.0)

## Módulo de Tareas (Teacher/Student)
- Entidad: Tarea (Regular) -> Impacta Progreso Base.
- Entidad: Crédito Extra -> Impacta Recuperación (No afecta Base).
- Relación: Crédito Extra [1] <-> [1] Tarea Rechazada.

## Módulo de Navegación
- ui-common.js (Garante de historial) -> teacher.js (Vistas de dashboard).
- ui-common.js (Garante de historial) -> index-ui.js (Navegación de recursos Index).
- presentation-engine.js -> Depende de ui-common.js para sanitización y seguridad.

## Módulo de Seguridad
- security-minigames.js -> games-adapter.js (Coordinación).
- minigames (juegos/*.html) -> Dependen de security-minigames.js.

## Módulo de Persistencia y Caché
- persistence.js (DB v4) -> api.js (Silent Reconciliation).
- api.js -> dashboard-modules (teacher.js, student.js, index-ui.js).
- Stores: news, teacher_projects, logros_data, academic_reports, student_profiles.

## Microservicios Modularizados y Contratos de Interfaz (v8.1.0)

### 1. USER (user-service/Code.gs)
- **Responsabilidad:** Identidad de usuarios, autenticación, perfiles, noticias, gamificación, analítica psicométrica y logs del sistema.
- **Hojas Administradas:** Usuarios, Logros, NoticiasPortal, QuizProAnalytics, LearningProfile, GameLeaderboards, LogsSistema.
- **Acciones / Contratos:**
  - `registerUser`: Registro de usuarios estudiantes y personal.
  - `loginUser`: Autenticación con SHA-256.
  - `getStudents` / `getStudentsByGradoSeccion`: Consulta de estudiantes autorizados.
  - `getUserInfo` / `updateUserProfile`: Consulta y actualización de expedientes.
  - `requestPasswordRecovery` / `resetPassword`: Tokens con firma HMAC SHA-256.
  - `saveGameResult` / `getGameStats` / `getGlobalTop`: Progreso y tablas de posiciones.
  - `recordAnalytics` / `getLearningProfile`: Motor de analítica ICR v3.1, GP v2.1 y Mastery.
  - `getNews` / `createNews` / `uploadNewsImage` / `updateNewsStatus`: Publicación segmentada por audiencia.
  - `getStructuredLogs`: Registro y consulta de auditoría técnica con enmascaramiento.
  - `ping`: Health check de disponibilidad.

### 2. ACADEMIC (academic-service/Code.gs)
- **Responsabilidad:** Estructura académica jerárquica, matrículas, asignaciones docentes, enlaces de clase, banco de preguntas y respaldos del sistema.
- **Hojas Administradas:** ConfiguracionAcademica, HistorialAcademico, Clases, BancoPreguntas, Matriculas, CargosEstudiante.
- **Acciones / Contratos:**
  - `getAcademicConfig` / `updateAcademicConfig`: Alcance académico granular con LockService (30s) y escrituras atómicas.
  - `getAcademicHistory`: Historial inmutable por parcial y profesor.
  - `saveWhatsAppLink` / `getWhatsAppLink`: Enlaces de grupos oficiales por grado.
  - `getQuestionBank` / `saveQuestion`: Banco de reactivos evaluativos.
  - `registerStudentEnrollment` / `getStudentEnrollmentHistory`: Matrículas anuales y cargos vinculados.
  - `createSystemBackup` / `listSystemBackups` / `verifyBackupIntegrity` / `restoreSystemBackup`: Copias de seguridad JSON en Drive con checksum.
  - `ping`: Health check de disponibilidad.

### 3. ACCOUNTING (accounting-service/Code.gs)
- **Responsabilidad:** Lógica contable y financiera, mensualidades, recibos PDF, facturación fiscal SAR Hondureña, caja y bancos, planillas con deducciones de ley e inventario/proveedores.
- **Hojas Administradas:** ConceptosCobro, PagosAbonos, ComprobantesPago, FacturasFiscales, MovimientosCajaBancos, CierresCaja, PlanillasNomenclatura, DeduccionesAsistencia, BoletasPago, InventariosKardex, ProveedoresActivos.
- **Acciones / Contratos:**
  - `configurePaymentConcept`: Parametrización de aranceles y colegiaturas.
  - `getStudentAccountStatement` / `recordStudentPayment`: Estados de cuenta y abonos.
  - `uploadPaymentVoucher` / `generatePaymentReceiptPDF`: Recibos oficiales correlativos únicos.
  - `createFiscalInvoice` / `getFiscalInvoices`: Documentos tributarios SAR (CAI, RTN, ISV 15%).
  - `recordCashBankMovement` / `closeCashSession` / `getCashBankSummary`: Caja chica, bancos y cierres cuadrados.
  - `generatePayrollPeriod` / `recordStaffAttendance` / `getStaffPayrollReceipt`: Planillas con deducciones IHSS, RAP, ISR y boletas.
  - `recordInventoryMovement` / `getInventoryKardex` / `registerSupplier`: Kardex de consumibles/activos y catálogo de proveedores.
  - `ping`: Health check de disponibilidad.

### 4. TASK (task-service/Code.gs)
- **Responsabilidad:** Tareas evaluables polimórficas, guías de estudio, entregas, calificaciones, subidas a Drive, metadatos y cierre de año.
- **Hojas Administradas:** Tareas, Entregas, MetadatosArchivos, pseudocode, Log_Cierres.
- **Acciones / Contratos:**
  - `createTask` / `updateTask` / `deleteTask` / `getAllTasks`: Gestión de tareas.
  - `getStudentTasks` / `submitAssignment` / `gradeSubmission` / `deleteSubmission`: Entregas y notas.
  - `uploadFile` / `uploadChunk` / `finishChunkedUpload` / `deleteFile`: Almacenamiento en Google Drive con metadatos.
  - `saveProject` / `listProjects` / `deleteProject` / `loadProject`: Proyectos PSeInt.
  - `closeAcademicYear`: Reset de ciclo y purga física de archivos en Drive.

### 5. EXAM (exam-service/Code.gs)
- **Responsabilidad:** Exámenes en línea, preguntas, entregas, autocalificación y resultados.
- **Hojas Administradas:** Examenes, PreguntasExamen, EntregasExamen.
- **Acciones / Contratos:**
  - `createExam` / `updateExam` / `deleteExam` / `getAllExams`: Banco de exámenes.
  - `getExamQuestions` / `submitExam` / `getExamResult`: Evaluación y revisión.
  - `gradeExamSubmission` / `deleteExamSubmission`: Calificación docente.

## Módulo Académico y Filtrado Frontend
- academic-service/Code.gs -> Gestión atómica de ConfiguracionAcademica e HistorialAcademico.
- student.js (renderSubjectNavigation) -> Filtrado estricto por GranularConfig (Grado, Sección, Parcial).
