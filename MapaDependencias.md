# Inventario Estructural y Mapa de Dependencias (v7.5)

## 1. Núcleo (Core)

### QuizProApp (js/config.js)
- **Responsabilidad:** Namespace raíz, configuración global y utilidades de normalización.
- **Funciones:**
    - `app.parseGrade(gradeStr)`: Parsea grado (10, 11, 12).
    - `app.getSanitizedAcademicText(text)`: Normaliza texto académico (ES5).
    - `app.normalizeSubject(name)`: Limpia nombres de asignaturas.
    - `app.getStandardLevelName(lvl)`: Normaliza niveles (Básico, Intermedio, Avanzado).
    - `app.formatearMetricaPsicométrica(valor)`: Redondeo simétrico a 2 decimales.
    - `app.getUrlParam(param)`: Extracción manual de parámetros URL.
    - `app.sanitizarHTMLTecnico(html)`: Sanitización de etiquetas técnicas permitidas.
    - `app.normalizePartial(p)`: Normalización de nombres de parciales.
    - `app.isContentAuthorized(contentPartial)`: Control de acceso por parcial.
    - `app.validateQuestion(q)`: Validador de esquema de reactivos.
    - `app.normalizeQuestion(q)`: Mapeo PascalCase para integridad de reactivos.
- **Variables Globales:**
    - `app.SERVICE_URLS`: Endpoints de microservicios (USER, TASK, EXAM).
    - `app.PARCIAL_ACTUAL`: Estado del periodo académico actual.
- **Seguridad:** Interceptores de ContextMenu y Teclado (F12, etc).

### PersistenceManager (js/persistence.js)
- **Responsabilidad:** Gestión de persistencia Offline-First mediante IndexedDB.
- **Funciones:**
    - `app.PersistenceManager.init()`: Inicializa `IMA_Persistence_DB` (v2).
    - `app.PersistenceManager.getGuestId()`: Gestión de `GUEST_UUID`.
    - `app.PersistenceManager.getActiveId()`: Retorna ID activo (User o Guest).
    - `app.PersistenceManager.get(store, key)`: Recuperación asíncrona.
    - `app.PersistenceManager.set(store, data, key)`: Persistencia con timestamp.
    - `app.PersistenceManager.getAll(store)`: Recuperación masiva.
    - `app.PersistenceManager.delete(store, key)`: Eliminación de registros.
    - `app.PersistenceManager.reconcile(store, serverData, onUpdate)`: Sincronización silenciosa.
    - `app.PersistenceManager.clearTelemetry()`: Purga de búfer analítico (`pending_anl_`).
- **Dependencias:** `QuizProApp`.
- **Eventos:** Listener `online` para sincronización de fondo de telemetría pendiente.

### fetchApi (js/api.js)
- **Responsabilidad:** Bus de comunicación unificado con reintentos y timeout.
- **Funciones:**
    - `app.fetchApi(service, action, payload, retryCount, options)`: Ejecuta peticiones POST.
- **Dependencias:** `QuizProApp.SERVICE_URLS`, `QuizProApp.PersistenceManager`.
- **Características:** Timeout de 60s (AbortController), reintento automático (2 veces), fallback visual (Toast).

## 2. Lógica de Aplicación (UI & Business Logic)

### AuthModule (js/auth.js)
- **Responsabilidad:** Gestión de sesiones, registro y fusión de datos de invitados.
- **Funciones:**
    - `app.initAuth()`: Inicializa formularios de login/registro.
    - `app.handlePostLoginRedirection(user)`: Redirección y Intent Recovery.
    - `app.mergeGuestData(userId)`: Migración de progreso local a la nube (Regla del Máximo Promedio).
- **Dependencias:** `app.fetchApi`, `app.PersistenceManager`.

### QuizPro Engine (js/quizpro.js)
- **Responsabilidad:** Motor de evaluación, gamificación y gestión de niveles.
- **Funciones:**
    - `app.initQuizPro()`: Inicialización de listeners de abandono y carga de datos.
    - `app.navigateToSubjects()`: Renderizado de malla curricular.
    - `app.checkCrossGradeLock(subject, grade)`: Validación de prerrequisitos inter-grado.
    - `app.navigateToLevels(subject, grade)`: Gestión de desbloqueo de niveles (70% + Cold Start).
    - `app.startQuiz()`: Inicializa pool de preguntas (Reinforcement + Fresh).
    - `app.loadQuestions()`: Enrutamiento local autónomo a `js/Banco_Preguntas/`.
    - `app.calculateXP(isCorrect, level, time)`: Algoritmo XP v7.0 con penalización por reintentos.
    - `app.endQuiz()`: Sincronización final, persistencia de logros y XP.
- **Dependencias:** `GamesAdapter`, `PersistenceManager`, `fetchApi`, `normalizeQuestion`.
- **Variables Críticas:** `XP_CONFIG` (Rangos, Factores de tiempo y racha).

### GamesAdapter (js/games-adapter.js)
- **Responsabilidad:** Fachada de telemetría para minijuegos.
- **Funciones:**
    - `init(gameId)`: Carga récords y rankings iniciales.
    - `recordAction(data)`: Registra telemetría atómica (pregunta/respuesta).
    - `finishSession(subject, level, score)`: Cierre de sesión y persistencia.

## 3. Módulos de Usuario (Dashboards)

### StudentDashboard (js/student.js)
- **Dependencias:** `fetchApi`, `GamesAdapter`, `PersistenceManager`, `PDF-Lib`, `Chart.js`.
- **Flujos Críticos:** Segmentación Binaria Autónoma (PDF > 9.5MB), Visualización Psicométrica (Radar/Trend).

### TeacherDashboard (js/teacher.js)
- **Dependencias:** `fetchApi`, `PersistenceManager`, `Chart.js`.
- **Flujos Críticos:** Migración de Banco (JSON -> Sheets), Auditoría de Entregas, Analítica Grupal.

## 4. Almacenamiento (IndexedDB IMA_Persistence_DB)
- **Stores:**
    - `news`: Caché de noticias.
    - `academic_stats`: Historial de logros del usuario.
    - `rankings`: Top Global y tops por asignatura.
    - `user_profile`: Perfil extendido del usuario.
    - `local_progress`: Búfer de telemetría asíncrona (`pending_anl_`).
    - `cache_estudiante_dashboard`: Instantánea del dashboard.
    - `cache_profesor_data`: Datos administrativos.
