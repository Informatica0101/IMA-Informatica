# Inventario Estructural y Mapa de Dependencias (v7.5)

## 1. Núcleo (Core)
- **QuizProApp (config.js):** Objeto raíz unificado.
- **PersistenceManager (persistence.js):** Gestor de IndexedDB. Depende de QuizProApp.
- **GamesAdapter (games-adapter.js):** Adaptador de telemetría. Depende de QuizProApp y fetchApi.
- **fetchApi (api.js):** Bus de datos. Depende de SERVICE_URLS y PersistenceManager.

## 2. Aplicación (UI & Logic)
- **auth.js:** Depende de fetchApi y PersistenceManager.
- **student.js:** Depende de fetchApi, GamesAdapter, PersistenceManager y ui-common.js.
- **teacher.js:** Depende de fetchApi, PersistenceManager y ui-common.js.
- **ui-common.js:** Depende de QuizProApp y fetchApi.

## 3. Almacenamiento (Persistence)
- **IndexedDB (IMA_Persistence_DB):** Almacenes: news, academic_stats, rankings, user_profile, local_progress, cache_estudiante_dashboard, cache_profesor_data.

## 4. Flujos Críticos de Negocio (IMA-CORE)
- **Segmentación PDF (js/student.js):** Dependencia externa de PDF-Lib. Flujo: File -> splitPdfLogically -> uploadChunks -> submitAssignment.
- **Migración de Banco (js/teacher.js):** Dependencia de migrated_questions.json. Flujo: localJSON -> processChunk -> saveQuestion -> fetchApi(USER).
- **Visualización Psicométrica (Charts):** Dependencia de Chart.js v4. Integración vía renderTeacherPsychometricModule y renderStudentCharts.
