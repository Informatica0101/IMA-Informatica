# MAPA DE DEPENDENCIAS Y ESTRUCTURA TÉCNICA v7.6

## 1. MÓDULOS DE NÚCLEO (CORE)
- **js/config.js**: Punto de entrada de configuración.
  - `window.PARCIAL_ACTUAL`: Estado global del período.
  - `window.sanitizarHTMLTecnico`: Motor de limpieza XSS para renderizado enriquecido.
  - `window.isContentAuthorized`: Guardián de acceso a contenidos por parcial y asignatura.
  - `window.normalizeQuestion`: Estandarizador de integridad para reactivos.
  - **Perímetro de Seguridad**: IIFE que bloquea F12, Ctrl+U y Menú Contextual.
- **js/api.js**: Capa de comunicación con microservicios.
  - Depende de: `window.SERVICE_URLS` en `config.js`.
- **js/persistence.js**: Gestión de IndexedDB y caché local.
  - Store: `local_progress`, `academic_stats`, `rankings`.

## 2. MOTORES LÓGICOS
- **js/quizpro.js**: Motor de evaluación inteligente.
  - `loadGlobalTop`: Implementa restricción clínica de 5 registros.
  - `endQuiz`: Sincroniza telemetría mediante `Promise.all(GamesAdapter.pendingAnalytics)`.
  - Depende de: `js/config.js`, `js/api.js`, `js/games-adapter.js`.
- **js/presentation-engine.js (v2.4)**: Centralizador de lecciones interactivas.
  - Controla: Navegación, Fullscreen (Slide 1 dblclick), Zoom Resistance.
  - Inyecta: 10 reactivos aleatorios del banco JSON centralizado.

## 3. INTERFACES DE USUARIO (DASHBOARDS)
- **js/student.js**: Dashboard del Estudiante.
  - Implementa: Hidratación 0ms, Conciliación silenciosa.
  - Filtro: Usa `isContentAuthorized` para ocultar materias no activas.
- **js/teacher.js**: Dashboard del Docente.
  - Gestión: Activa/Desactiva asignaturas por parcial en `academic_config_cache`.

## 4. ESTRUCTURA DE CONTENIDOS
- **Informatica_I/**: 10mo Grado (Bachillerato).
- **II_BTP_A/**: 11no Grado (Programación, Ofimática, IA, Análisis).
- **III_BTP_A/**: 12mo Grado (Diseño Web, Programación 2, POO).
- **js/Banco_Preguntas/**: 24 archivos JSON normalizados (Min 50 reactivos por nodo).

## 5. FLUJOS DE DATOS CRÍTICOS
1. **Evaluación -> Telemetría**: `quizpro.js` -> `GamesAdapter` -> `api.js` -> `backend/`.
2. **Carga Contenido**: `student.js` -> `localStorage (Cache)` -> Render -> `api.js (Sync)`.
3. **Presentación -> Banco**: `presentation-engine.js` -> `fetch(Banco_Preguntas/*.json)` -> Render Quiz.
