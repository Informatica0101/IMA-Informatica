<!-- [TAREA-02] [Fase 1 - Matriz Maestra] - Consolidar la matriz maestra de requisitos, dependencias y pruebas de la plataforma. -->
# Mapa de Dependencias Académicas (v8.9.0 - Plan General de Expansión e Interoperabilidad)

## MATRIZ MAESTRA DE TRAZABILIDAD DE REQUISITOS, DEPENDENCIAS Y PRUEBAS (TAREA-02)

| ID Requisito | Fase y Función | Componente Implementado | Dependencias Explicitas | Criterios de Aceptación | Suite de Pruebas & Evidencias | Estado Funcional | Prioridad | Tarea Asociada |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-SEC-001** | Fase 1 - RBAC Servidor | `backend/user-service/Code.gs` (`getUserVerifiedRole`) | `Usuarios` Sheet, `CacheService` | No permite elevación de privilegios al alterar rol cliente | Batería ACC-02, Code Review #Correct# | Completa y verificada | P0 | TAREA-01 |
| **REQ-EXP-001** | Fase 1 - Expediente Único | `backend/academic-service/Code.gs` (`getStudentFile`) | `ExpedientesEstudiantes` | Ficha única con trazabilidad de cambios e historial | Batería DRV-04, `teacher-dashboard.html` | Completa y verificada | P0 | REQ-EXP-001 |
| **REQ-EXP-002** | Fase 1 - Fusión Duplicados | `backend/academic-service/Code.gs` (`mergeStudentFiles`) | `ExpedientesEstudiantes` | Fusión atómica de registros conservando historial | Batería MOD-01, `js/teacher.js` | Completa y verificada | P0 | REQ-EXP-002 |
| **REQ-GD-001** | Fase 9 - CUV Documental | `backend/accounting-service/Code.gs` (`generateSchoolDocument`) | `LockService`, `DocumentosEscolaresEmitidos` | Numeración atómica correlativa sin colisiones ni CUV duplicado | Batería DRV-02, GD-IMP-01 | Completa y verificada | P0 | TAREA GD-IMP-01 |
| **REQ-FIN-001** | Fase 15 - Facturación SAR | `backend/accounting-service/Code.gs` (`FacturasFiscales`) | `FacturasFiscales`, `CAI` | Emisión fiscal conforme a normativa SAR Honduras | Batería STO-05, `dashboard-contabilidad.html` | Completa y verificada | P0 | T-PAG-12 |
| **REQ-HR-001** | Fase 17 - Deducciones Ley | `backend/accounting-service/Code.gs` (`calculatePayrollPeriod`) | `PlanillasNomenclatura`, `IHSS/RAP/ISR` | Deducciones automáticas de IHSS, RAP e ISR vigentes | Batería MOD-05, TAREA RH-12 | Completa y verificada | P0 | TAREA RH-11 |
| **REQ-HR-002** | Fase 16 - Desempeño Laboral | `backend/accounting-service/Code.gs` (`managePerformanceEvaluation`) | `EvaluacionesDesempeno` | Evaluación con observaciones privadas y rectificación | TAREA RH-12 Suite Scenario #5 | Completa y verificada | P1 | TAREA RH-05 |
| **REQ-PWA-001** | Fase 28 - PWA Offline | `sw.js` (v8.1), `js/persistence.js` | Service Worker API, IndexedDB v4 | Precaching de assets y cola de sincronización diferida | Batería STO-03, `manifest.json` | Completa y verificada | P1 | B-001 |
| **REQ-UX-001** | Fase 3 - Omnibox Búsqueda | `backend/user-service/Code.gs` (`searchGlobalOmnibox`) | `js/ui-common.js` | Consulta multi-entidad accesible via atajo `Ctrl + K` | Batería MOD-03, `#modal-global-omnibox` | Completa y verificada | P1 | REQ-OMNI-001 |

---

## MÓDULO DE TÉRMINOS Y CONDICIONES DE USO V1.0 Y ACEPTACIÓN
- **Páginas y Vistas:**
  - `politica-de-uso.html`: Texto completo oficial de Términos y Condiciones de Uso de la Plataforma (17 Numerales).
- **Componentes Frontend (`js/ui-common.js`):**
  - `#modal-first-login-terms`: Modal de aceptación obligatoria al iniciar sesión o cargar dashboard sin evidencia de la Versión 1.0.
  - `window.checkAndShowFirstLoginTermsModal()`
  - `window.acceptTermsAndConditionsAction()`
- **Backend & Almacenamiento (`backend/user-service/Code.gs`):**
  - Tabla `AceptacionesPoliticas`: AceptacionID, UserID, DocumentoID, Version, RolUsuario, FechaAceptacion, Estado.
  - Endpoint `acceptLegalDocument(payload)` / `getLegalDocumentAcceptances(payload)`.

## MÓDULO DE CONFIGURACIÓN DEL AÑO ESCOLAR, JORNADAS, HORARIOS, CONTROL LABORAL Y ACTIVIDADES
- **Hojas de Cálculo / Tablas:**
  - `JornadasAcademicas`: Configuración de jornadas (JornadaID, NombreJornada, TipoJornada, HoraInicio, HoraFin, DuracionClaseMin, DuracionRecesoMin, DuracionAlmuerzoMin, Estado).
  - `MallaCurricularDist`: Distribución semanal/diaria (MallaID, OfertaID, AsignaturaID, HorasSemana, HorasDia, RequiereBloqueConsecutivo, DiasPermitidosJSON, Estado).
  - `ActividadesInstitucionales`: Eventos e hitos institucionales (ActividadID, Titulo, TipoActividad, FechaInicio, FechaFin, EstrategiaAfectacion, ClasesAfectadasJSON, Estado, AutorizadoPor).
  - `ActividadesExtracurriculares`: Talleres, clubes y deportes (ExtracurricularID, Nombre, Categoria, HorarioJSON, EncargadosJSON, Estado, EvidenciasDriveFolderId).
  - `TurnosAlmuerzo`: Franjas de almuerzo laboral (TurnoID, Departamento, RolNombre, HoraInicio, HoraFin, CoberturaMinima, Estado).
  - `AprobacionHorasExtras`: Registro y flujo de horas extras (OvertimeID, UserId, NombreEmpleado, FechaTrabajada, HorasSugeridas, HorasAprobadas, EstadoAprobacion, AprobadoPor, PeriodoNominaId, EstadoPago, Timestamps).
- **Funciones Backend (`backend/academic-service/Code.gs` & `backend/accounting-service/Code.gs`):**
  - `configureSchoolYear(payload, user)` / `getSchoolYearConfigs(payload, user)`
  - `configureAcademicJornada(payload, user)` / `getAcademicJornadas(payload, user)`
  - `saveCurricularDistribution(payload, user)` / `getCurricularDistribution(payload, user)`
  - `generateClassSchedulesAdvanced(payload, user)` / `saveClassSchedules(payload, user)`
  - `configureLunchShifts(payload, user)` / `getLunchShifts(payload, user)`
  - `recordStaffCheckInAdvanced(payload, user)` / `calculateOvertime(payload, user)` / `reviewOvertimeRequest(payload, user)`
  - `saveInstitutionalActivity(payload, user)` / `saveExtracurricularActivity(payload, user)`
  - `getUnifiedInstitutionalCalendar(payload, user)`

## MÓDULO DE DISEÑO INSTITUCIONAL, TICKETS Y VERSIONADO (NUEVA FASE)
- **Hojas de Cálculo / Tablas:**
  - `PropuestasPaletasVisuales`: Armacena propuestas de paletas visuales (PropuestaID, PaletaNombre, ColoresJSON, CreadoPor, Estado, AprobadoPor, FechaAprobacion, Observaciones).
  - `ConfiguracionVisualGlobal`: Almacena la paleta activa aprobada de aplicación global.
  - `TicketsReporteProblemas`: Almacena el reporte inicial (TicketID, UserId, NombreUsuario, RolActivo, AreaFuncion, SeccionPagina, VersionGlobal, TipoApp, Descripcion, ResultadoEsperado, Estado, CreadoEn, ActualizadoEn).
  - `HistorialMensajesTickets`: Registro inmutable de mensajes, notas internas y respuestas entre el Administrador y el Usuario (MensajeID, TicketID, AutorUserId, AutorNombre, TipoAutor, EsNotaInterna, Mensaje, Timestamp).
- **Funciones Backend (`backend/user-service/Code.gs`):**
  - `getActiveVisualPalette()`
  - `saveVisualPaletteProposal(payload, user)`
  - `approveVisualPaletteProposal(payload, user)`
  - `submitProblemTicket(payload, user)`
  - `getProblemTickets(payload, user)`
  - `updateTicketStatus(payload, user)`
  - `replyProblemTicket(payload, user)`
- **Constantes de Versionado:**
  - `GLOBAL_PLATFORM_VERSION`: "1.0" (Invariable sin autorización explícita).

## Plan General de Implementación de la Expansión (30 Fases)
1. **Fase 1. Auditoría y planificación de la expansión**: Matriz de cobertura, inventario y mapeo de dependencias.
2. **Fase 2. Arquitectura institucional e interoperabilidad**: Identificadores únicos institucionales, sincronización e interoperabilidad.
3. **Fase 3. Experiencia de usuario y navegación unificada**: Navegación SPA por rol, búsqueda global y centro de notificaciones.
4. **Fase 4. Identidad, permisos y gobierno de la información**: RBAC granular servidor, delegaciones y auditoría.
5. **Fase 5. Admisiones, aspirantes y portal de familias**: Proceso de ingreso, entrevistas, listas de espera y conversión automática a estudiante.
6. **Fase 6. Expediente institucional y ciclo de vida del estudiante**: Ficha única, traslados, promociones e historial inmutable.
7. **Fase 7. Planificación académica, horarios y recursos**: Asignación docente, detección de conflictos de aula/horario y calendarios.
8. **Fase 8. Aula virtual y gestión avanzada del aprendizaje**: Cursos, anuncios, entregas multimodales y comentarios privados.
9. **Fase 9. Evaluaciones, calificaciones y resultados académicos**: Libro de calificaciones, ponderaciones, rúbricas y boletines.
10. **Fase 10. Asistencia, disciplina y convivencia escolar**: Asistencia diaria/clase, tardanzas, justificantes e incidencias.
11. **Fase 11. Comunicación y colaboración institucional**: Comunicados, avisos segmentados y mensajes bidireccionales.
12. **Fase 12. Bienestar estudiantil, orientación y seguimiento de casos**: Citas de orientación, planes pedagógicos y privacidad.
13. **Fase 13. Supervisión docente y calidad educativa**: Jornalizaciones, sílabos, observaciones y reemplazos.
14. **Fase 14. Contabilidad, presupuestos y control financiero**: Cuentas contables, presupuestos, asientos y conciliación bancaria.
15. **Fase 15. Pagos escolares, cobros y facturación**: Colegiaturas, recargos, pasarelas de pago, recibos y facturación SAR.
16. **Fase 16. Recursos humanos y administración del personal**: Expedientes laborales, contratos, asistencia y vacaciones de personal.
17. **Fase 17. Planillas, compensaciones y obligaciones laborales**: Nómina, deducciones de ley (IHSS, RAP, ISR) y boletas.
18. **Fase 18. Compras, proveedores y contratación de servicios**: Solicitudes de compra, órdenes, proveedores y cuentas por pagar.
19. **Fase 19. Inventario, activos fijos y mantenimiento**: Kardex, stock mínimo, activos patrimoniales y custodias.
20. **Fase 20. Biblioteca y recursos educativos**: Catálogo bibliográfico, préstamos, reservas y devoluciones.
21. **Fase 21. Transporte escolar y servicios complementarios**: Rutas, vehículos, paradas, conductores y capacidad.
22. **Fase 22. Gestión documental, formularios y firma electrónica**: Repositorio de plantillas, constancias y solicitudes.
23. **Fase 23. Motor institucional de flujos de trabajo**: Transiciones de estados, aprobaciones multinivel y bandejas de tarea.
24. **Fase 24. Informes, indicadores y análisis institucional**: Analítica avanzada, tableros ejecutivos y reportes exportables.
25. **Fase 25. Integraciones externas y compatibilidad institucional**: Importación Excel/CSV, Google Drive, pasarelas y compatibilidad SACE.
26. **Fase 26. Configuración institucional y personalización**: Zona horaria, moneda, calendarios y parámetros generales.
27. **Fase 27. Plataforma técnica, continuidad y recuperación**: Monitoreo ping-pong, respaldos JSON y restauración segura.
28. **Fase 28. Accesibilidad, movilidad y continuidad de trabajo**: Interfaz adaptativa móvil, navegación por teclado y optimización de carga.
29. **Fase 29. Migración, validación y transición operativa**: Mapeo de columnas, validación previa, conciliación e importaciones.
30. **Fase 30. Consolidación, certificación interna y mejora continua**: Pruebas integrales inter-departamentales y capacitación.

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
  - Autoridad de Escritura: `ConceptosCobro`, `TarifasPlanPago`, `CargosEstudiante`, `PagosAbonos`, `ComprobantesPago`, `FacturasFiscales`, `IntegracionesPasarelas`, `MovimientosCajaBancos`, `CierresCaja`, `BancosConciliaciones`, `CuentasPorPagarGastos`, `PlanCuentas`, `AsientosContables`, `PlanillasNomenclatura`, `DeduccionesAsistencia`, `BoletasPago`, `InventariosKardex`, `ProveedoresActivos`.
  - Funciones: Contabilidad General, Cobros, Mensualidades, Planes de Pago, Tarifas, Comprobantes/Recibos PDF, Pasarelas de Pago, Facturación SAR, Caja y Bancos, Conciliación Bancaria, Cuentas por Pagar, Asientos Contables, Planillas con Deducciones de Ley (IHSS, RAP, ISR), Asistencia y Kardex de Inventarios.
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

## Matriz de Entidades Centrales - Fase 9 (Finanzas, Tesorería, Cobros y Pasarelas)
- `ConceptoCobro`: Catálogo de rubros cobrables (Matrícula, Mensualidades, Mantenimiento, Transporte, Graduación).
- `TarifaPlanPago`: Estructura de costos y planes de pago fraccionados por nivel académico, grado y año lectivo.
- `CargoEstudiante`: Obligaciones de pago del estudiante con saldos, vencimientos, recargos y descuentos.
- `PagoTransaccion`: Registros consolidados de pagos recibidos (Efectivo, Transferencia, Tarjeta, Cheque).
- `ComprobantePago`: Comprobantes de transferencia/depósito cargados por familias con flujo de aprobación/rechazo.
- `FacturaFiscal`: Facturas fiscales autorizadas por la SAR (CAI, Rango, RTN, ISV 15%) y notas de crédito.
- `IntegracionPasarela`: Ajustes de conexión a pasarelas de pago externas (BAC, Ficohsa, Atlántida) con credenciales y token de prueba.
- `ConciliacionBancaria`: Importación de extractos bancarios y conciliación con registros de caja/sistema.
- `CuentaPorPagarGasto`: Registro de obligaciones de pago a proveedores, gastos operativos e integración de asientos.
- `AsientoContable`: Libro diario y contabilidad general con partida doble de ingresos, egresos y pasivos.

## Matriz de Entidades Centrales - Fase 10 (Recursos Humanos, Planillas, Políticas y Configuración Fiscal)
- `ExpedienteLaboral`: Identidad laboral del empleado (`draft`, `pending_review`, `active`, `on_leave`, `suspended`, `terminated`, `archived`).
- `ContratoLaboral`: Contratos de trabajo, vigencias, condiciones salariales e historial.
- `SolicitudVacaciones`: Solicitudes de permisos y vacaciones con flujo de revisión y cálculo de saldos.
- `PoliticaFiscal`: Reglas de impuestos, deducciones (IHSS, RAP, ISR), comisiones y redondeo desde Opciones avanzadas del Contador.
- `PoliticaInstitucional`: Documentos institucionales de Privacidad, Uso/Condiciones y Política Financiera con control de versiones.
- `AceptacionPolitica`: Evidencia de lectura y aceptación explícita de políticas por usuario con timestamp e IP.

## Matriz de Entidades Centrales - Fase 11 (Analítica Avanzada, Dashboards, Servicios Complementarios)
- `IndicadorAnalitico`: Metadatos y resúmenes de indicadores por rol (Académico, Asistencia, Financiero, Recursos Humanos).
- `EjemplarBiblioteca`: Catálogo bibliográfico y ejemplares físicos (`available`, `reserved`, `on_loan`, `maintenance`, `lost`, `retired`).
- `PrestamoBiblioteca`: Registro de préstamos, fechas devueltas, reservas y renovaciones (`requested`, `approved`, `on_loan`, `returned`, `overdue`).
- `ActivoPatrimonial`: Ficha de bienes duraderos, código patrimonial, custodios, mantenimientos y bajas.
- `RutaTransporte`: Unidades de transporte, rutas, paradas, capacidad máxima y asignación de estudiantes.
- `PlantillaDocumental`: Repositorio de plantillas administrativas e informes oficiales exportables (PDF, XLSX, CSV).

## Matriz de Entidades Centrales - Fase 12 (Documentos Escolares, Migración, Spreadsheets y SACE)
- `CatalogoSpreadsheet`: Registro central de fuentes de datos distribuidas por año lectivo (2026, 2027, 2028) y área.
- `PlantillaEscolar`: Diseños de constancias, excusas, justificaciones, permisos y formularios académicos/administrativos.
- `DocumentoEscolarEmitido`: Solicitudes y constancias oficializadas con código único de verificación y metadatos.
- `AuditoriaMigracion`: Registro de lotes de importación, mapeos de columna, validaciones por fila y log de errores.
- `PlantillaSACEVerificada`: Formatos oficiales SACE verificados para completado automático de notas y recuperaciones.

## Matriz de Entidades Centrales - Fase 23 (Editor Visual de PDF y Campos Superpuestos)
- `PDFOverlayEditor`: Interfaz visual `#modal-pdf-overlay-editor` con renderizado PDF.js y capa de lienzo interactivo.
- `PDFOverlayField`: Definición de campo superpuesto en coordenadas ratio `(xRatio, yRatio, wRatio, hRatio)` para alineación independiente del visor.
- `PDFTemplateConfig`: Metadatos de plantilla `PDF_OVERLAY` integrados en `PlantillasEscolares` en `backend/accounting-service/Code.gs`.

## Matriz de Búsqueda Unificada Global & Notificaciones (REQ-OMNI-001 & B-002)
- `searchGlobalOmnibox`: Endpoint en `backend/user-service/Code.gs` para consulta multi-entidad (Usuarios, Anuncios, Trámites) con seguridad RBAC.
- `#modal-global-omnibox`: Componente modal de búsqueda unificada en `js/ui-common.js` activable vía atajo de teclado (`Ctrl + K` / `Cmd + K`) e icono `#btn-global-search`.
- `#btn-global-notifications`: Disparador de notificaciones unificadas y bandeja de alertas en `js/ui-common.js`.

## MÓDULO DE EVALUACIÓN DEL DESEMPEÑO LABORAL (TAREA RH-05)
- **Hojas de Cálculo / Tablas:**
  - `PeriodosEvaluacionDesempeno`: Definición y control de periodos de evaluación (PeriodoID, NombrePeriodo, FechaInicio, FechaFin, EstadoPeriodo, CriteriosGeneralesJSON, CreadoPor, FechaCreacion, UltimaModificacion).
  - `CriteriosEvaluacionDesempeno`: Parametrización de criterios por puesto o familia laboral (CriterioID, PuestoOFamilia, NombreCriterio, PesoPorcentaje, EscalaCalificacionJSON, Descripcion, Estado, FechaCreacion, UltimaModificacion).
  - `EvaluacionesDesempeno`: Fichas individuales de evaluación del desempeño, calificaciones, fortalezas, compromisos, observaciones confidenciales y trazabilidad de rectificaciones (EvaluacionID, PeriodoID, EmpleadoID, EvaluadorID, PuestoOFamilia, Estado, CalificacionesJSON, PuntajeTotal, EscalaObtenida, Fortalezas, AspectosMejorar, ObservacionesPrivadas, ObservacionesPublicasEmpleado, ObjetivosCompromisosJSON, ConformidadEmpleado, FechaConformidad, RectificadaPor, MotivoRectificacion, HistorialModificacionesJSON, CreadoPor, FechaCreacion, UltimaModificacion).
- **Funciones Backend (`backend/accounting-service/Code.gs`):**
  - `managePerformancePeriod(payload)`
  - `managePerformanceCriteria(payload)`
  - `managePerformanceEvaluation(payload)`
  - `getPerformanceEvaluations(payload)`
- **Componentes Frontend (`dashboard-recursos-humanos.html`):**
  - Botón `#btn-evaluar-desempeno`
  - Modal `#modal-evaluacion-desempeno` con pestañas de Periodos, Criterios por Puesto, Registro de Evaluación e Historial & Informes.

## MÓDULO DE CAPACITACIÓN Y DESARROLLO PROFESIONAL (TAREA RH-06)
- **Hojas de Cálculo / Tablas:**
  - `CatalogoCursosCapacitacion`: Registro central de cursos, talleres y actividades formativas (CursoID, NombreCurso, Categoria, ProveedorResponsable, Modalidad, DuracionHoras, Requisitos, DirigidoA, Estado, CreadoPor, FechaCreacion, UltimaModificacion).
  - `InscripcionesCapacitacion`: Control de inscripciones, asistencia, resultados, enlaces a certificados Drive y alertas de vencimiento (InscripcionID, CursoID, EmpleadoID, FechaInscripcion, EstadoInscripcion, AsistenciaPorcentaje, ResultadoNota, CertificadoDriveUrl, FechaEmisionCertificado, FechaVencimientoCertificado, Observaciones, CreadoPor, FechaCreacion, UltimaModificacion).
  - `PlanesDesarrolloProfesional`: Definición y seguimiento de objetivos de desarrollo profesional (PlanID, EmpleadoID, TituloObjetivo, Descripcion, MetasAccionesJSON, FechaInicio, FechaMeta, EstadoObjetivo, EvaluacionSeguimiento, CreadoPor, FechaCreacion, UltimaModificacion).
- **Funciones Backend (`backend/accounting-service/Code.gs`):**
  - `manageTrainingCourse(payload)`
  - `manageTrainingEnrollment(payload)`
  - `getEmployeeTrainingHistory(payload)`
  - `manageProfessionalDevelopmentPlan(payload)`
  - `getTrainingAnalyticsReport(payload)`
- **Componentes Frontend (`dashboard-recursos-humanos.html`):**
  - Botón `#btn-capacitacion-desarrollo`
  - Modal `#modal-capacitacion-desarrollo` con pestañas de Catálogo Cursos, Inscripción & Asistencia, Certificados & Vencimientos y Planes de Desarrollo.

## MÓDULO DE INCIDENCIAS LABORALES Y MEDIDAS DISCIPLINARIAS (TAREA RH-07)
- **Hojas de Cálculo / Tablas:**
  - `IncidenciasLaborales`: Registro de faltas, retardos, incumplimientos o incidentes (IncidenciaId, EmpleadoId, Fecha, Categoria, DescripcionObjetiva, ObservacionesAclaraciones, ResponsabilidadEstablecida, DocumentacionDriveUrl, Estado, CreadoPor, FechaCreacion, UltimaModificacion).
  - `MedidasDisciplinarias`: Aplicación de amonestaciones verbales/escritas, suspensiones o resoluciones disciplinarias con acta firmada (MedidaId, IncidenciaId, EmpleadoId, TipoMedida, FechaEfectiva, DiasSuspension, ResponsableAprobacion, FundamentoDocumentado, ActaFirmadaDriveUrl, EstadoMedida, CreadoPor, FechaCreacion, UltimaModificacion).
- **Funciones Backend (`backend/accounting-service/Code.gs`):**
  - `manageLaborIncident(payload)`
  - `manageDisciplinaryMeasure(payload)`
  - `getLaborIncidentsHistory(payload)`
- **Componentes Frontend (`dashboard-recursos-humanos.html`):**
  - Botón `#btn-incidencias-disciplinarias`
  - Modal `#modal-incidencias-disciplinarias` con pestañas de Registrar Incidencia, Aplicar Medida Disciplinaria y Historial de Incidencias & Medidas.

## MÓDULO DE PLANIFICACIÓN DE NECESIDADES DE PERSONAL (TAREA RH-08)
- **Hojas de Cálculo / Tablas:**
  - `PlanificacionNecesidadesPersonal`: Registro de proyecciones y estimaciones de plantilla requerida (PlanificacionID, PeriodoAcademico, DepartamentoArea, PuestoOFamilia, CantidadRequerida, EscenarioMatricula, MetricaBaseCalculo, ObservacionesJustificacion, VacanteRelacionadaID, CreadoPor, FechaCreacion, UltimaModificacion).
- **Funciones Backend (`backend/accounting-service/Code.gs`):**
  - `manageStaffingNeeds(payload)`
  - `getStaffingNeedsPlanning(payload)`
- **Componentes Frontend (`dashboard-recursos-humanos.html`):**
  - Botón `#btn-planificacion-personal`
  - Modal `#modal-planificacion-personal` con pestañas de Proyección de Necesidades, Disponibilidad vs Demanda e Informes & Justificación de Contratación.

## MÓDULO DE GESTIÓN VISUAL DE TURNOS Y SUSTITUCIONES (TAREA RH-09)
- **Hojas de Cálculo / Tablas:**
  - `AsignacionesTurnosLaborales`: Registro de asignación de turnos de trabajo por empleado y periodo (AsignacionTurnoID, EmpleadoID, NombreTurno, FechaInicio, FechaFin, HoraEntrada, HoraSalida, DepartamentoArea, Estado, CreadoPor, FechaCreacion, UltimaModificacion).
  - `SustitucionesPersonal`: Registro de reemplazos y coberturas temporales entre colaboradores (SustitucionID, EmpleadoSustitutoID, EmpleadoSustituidoID, FechaInicio, FechaFin, HoraEntrada, HoraSalida, MotivoSustitucion, DepartamentoArea, Estado, CreadoPor, FechaCreacion, UltimaModificacion).
- **Funciones Backend (`backend/accounting-service/Code.gs`):**
  - `manageWorkShiftAndSubstitution(payload)`
  - `getWorkShiftsAndSubstitutionsHistory(payload)`
- **Componentes Frontend (`dashboard-recursos-humanos.html`):**
  - Botón `#btn-turnos-sustituciones`
  - Modal `#modal-turnos-sustituciones` con pestañas de Asignar Turno Laboral, Registrar Sustitución e Historial Turnos, Sustituciones & Horas Extras.

## PORTAL DE AUTOSERVICIO DEL EMPLEADO (TAREA RH-10)
- **Hojas de Cálculo / Tablas:**
  - Consulta unificada de `ExpedientesLaborales`, `ContratosLaborales`, `SolicitudesVacaciones`, `PrestamosAnticiposEmpleado`, `AsignacionesTurnosLaborales` e `InscripcionesCapacitacion` restringida a la identidad autenticada.
- **Funciones Backend (`backend/accounting-service/Code.gs`):**
  - `getEmployeeSelfServicePortal(payload)`
- **Componentes Frontend (`dashboard-recursos-humanos.html`):**
  - Botón `#btn-autoservicio-empleado`
  - Modal `#modal-autoservicio-empleado` con pestañas de Mi Ficha & Contrato, Mis Solicitudes, Mis Turnos & Horarios y Mis Capacitaciones.

## VERIFICACIÓN DE INFORMACIÓN LABORAL Y FISCAL (TAREA RH-11)
- **Hojas de Cálculo / Tablas:**
  - Consulta y conciliación de `PlanillasNomenclatura`, `ExpedientesLaborales` y `AsientosContables`.
- **Funciones Backend (`backend/accounting-service/Code.gs`):**
  - `verifyLaborAndTaxInformation(payload)`
- **Componentes Frontend (`dashboard-recursos-humanos.html`):**
  - Botón `#btn-informacion-laboral-fiscal`
  - Modal `#modal-informacion-laboral-fiscal` con despliegue de consolidados devengados y deducciones IHSS/RAP/ISR, tabla de parámetros legales hondureños de referencia, lista de alertas por datos faltantes/RTN y conciliación contable.

## PRUEBAS DE INTEGRACIÓN Y REGRESIÓN DE RECURSOS HUMANOS (TAREA RH-12)
- **Hojas de Cálculo / Tablas:**
  - Validación transversal de todas las tablas del módulo de RRHH (`ExpedientesLaborales`, `ContratosLaborales`, `VacantesLaborales`, `AgendaEntrevistasRH`, `EvaluacionesDesempeno`, `InscripcionesCapacitacion`, `IncidenciasLaborales`, `PlanificacionNecesidadesPersonal`, `SolicitudesVacaciones`, `SolicitudesHorasExtras`, `AsignacionesTurnosLaborales`, `SustitucionesPersonal`, `PlanillasNomenclatura`, `BitacoraAuditoriaSistema`).
- **Funciones Backend (`backend/accounting-service/Code.gs`):**
  - `runHRIntegrationAndRegressionTests(payload)`
- **Componentes Frontend (`dashboard-recursos-humanos.html`):**
  - Botón `#btn-pruebas-integracion-rh`
  - Modal `#modal-pruebas-integracion-rh` con resumen de suite (Total, Aprobadas, Fallidas), botón de re-ejecución y tabla detallada de evidencias para los 18 casos de prueba integrales.

## NUMERACIÓN DOCUMENTAL SEGURA Y PREVENCIÓN DE CÓDIGOS DUPLICADOS (TAREA GD-IMP-01)
- **Hojas de Cálculo / Tablas:**
  - `PlantillasEscolares`: Catálogo de plantillas oficiales con código, categoría, título y versión.
  - `DocumentosEscolaresEmitidos`: Registro inmutable de emisiones documentales (DocumentoID, PlantillaID, EstudianteUserId, SolicitanteUserId, DatosJSON, EstadoDoc, CodigoVerificacion, DriveFileId, DriveUrl, FechaEmision, Observaciones, VersionPlantilla, SecuenciaNumerica, NumeroCorrelativo).
- **Funciones Backend (`backend/accounting-service/Code.gs`):**
  - `generateSchoolDocument(payload)` - Coordinado mediante `LockService.getScriptLock()` para asignación atómica bajo concurrencia.
  - `verifySchoolDocumentByCUV(payload)` - Endpoint público para autenticación y consulta trazable de documentos emitidos por CUV.
