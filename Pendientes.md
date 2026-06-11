# Registro de Tareas Pendientes (v7.5) - METODOLOGÍA OFICIAL

### [T-FORENSE-01] Transpilación Crítica a ES5 (Dashboard & API)
- **Origen del Hallazgo:** Auditoría Forense v7.5 - 2026-06-22
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** js/api.js, js/student.js, js/auth.js, js/ui-common.js, js/teacher.js
- **Dependencias Expuestas:** sw.js, QuizProApp
- **Descripción del Alcance:** Reemplazar 'async/await' por promesas tradicionales, 'const/let' por 'var', y eliminar arrow functions, template literals, optional chaining y spread operators.
- **Criterios de Aceptación:** Carga limpia de todos los scripts en IE11/AB Browser sin errores de sintaxis.
- **Estado:** [X] Completada

### [T-FORENSE-02] Restauración de Blindaje Namespace QuizProApp
- **Origen del Hallazgo:** Auditoría Forense v7.5 - 2026-06-22
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** js/api.js, js/student.js, js/auth.js, js/ui-common.js, js/teacher.js
- **Dependencias Expuestas:** MapaDependencias.md
- **Descripción del Alcance:** Envolver los archivos en IIFE y registrar las funciones en QuizProApp para evitar colisiones globales.
- **Criterios de Aceptación:** window.QuizProApp debe contener todos los métodos; no deben existir variables globales huérfanas.
- **Estado:** [X] Completada

### [T-FORENSE-03] Remediación de Lógica de Fusión (auth.js)
- **Origen del Hallazgo:** Auditoría Forense v7.5 - 2026-06-22
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** js/auth.js
- **Dependencias Expuestas:** PersistenceManager
- **Descripción del Alcance:** Sustituir Object.values y bucles for...of por iteración manual ES5 compatible para asegurar la migración de GUEST_UUID.
- **Criterios de Aceptación:** Sincronización exitosa de XP de invitado en navegadores legacy.
- **Estado:** [X] Completada

### [T-RESTAURACION-01] Recuperación de Lógica de Negocio Advanced
- **Origen del Hallazgo:** Auditoría Forense de Regresión - 2026-06-23
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** js/student.js, js/teacher.js
- **Dependencias Expuestas:** PDF-Lib, Chart.js, Banco_Preguntas
- **Descripción del Alcance:** Restaurar funciones de parsing de PDF, subida multipart y analítica psicométrica eliminadas en la remediación anterior. Todo debe ser implementado en ES5 estricto.
- **Criterios de Aceptación:** Subida exitosa de archivos > 10MB con fragmentación y visualización de gráficos radar en el dashboard.
- **Estado:** [X] Completada

### [T-FORENSE-04] Transpilación Crítica de Acceso (index-ui.js)
- **Origen del Hallazgo:** Auditoría Integral de Calidad v7.5.1 - 2026-06-23
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** js/index-ui.js
- **Dependencias Expuestas:** login.html, portal access
- **Descripción del Alcance:** Remediación forense de sintaxis ES6 en la puerta de entrada del portal. Reemplazar arrow functions y async/await por sintaxis ES5 compatible.
- **Criterios de Aceptación:** El portal debe renderizar noticias y permitir login en AB Browser sin SyntaxError.
- **Estado:** [X] Completada

### [T-BLINDAJE-01] Blindaje Total de Namespace (v7.6)
- **Origen del Hallazgo:** Code Review de Integración - 2026-06-23
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** Todo el ecosistema js/ y archivos HTML.
- **Descripción del Alcance:** Erradicar asignaciones directas a 'window'. Migrar métodos de navegación y lógica al objeto raíz 'QuizProApp'. Sustituir 'URLSearchParams' por helper manual.
- **Criterios de Aceptación:** 0 variables globales huérfanas en el objeto window (excepto QuizProApp). Carga funcional en IE11 sin ReferenceError.
- **Estado:** [X] Completada

### [T-ATÓMICA-01] Saneamiento de Renderizado Técnico y Telemetría Determinista
- **Origen del Hallazgo:** Auditoría Deep-Dive - 2026-06-24
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** js/quizpro.js, js/games-adapter.js, index.html
- **Dependencias Expuestas:** QuizProApp.sanitizarHTMLTecnico, GamesAdapter.pendingAnalytics
- **Descripción del Alcance:** 1) Sustituir innerText por innerHTML sanitizado en renderizado de opciones. 2) Implementar espera de pendingAnalytics en endQuiz. 3) Actualizar onclick en HTML a la jerarquía QuizProApp.
- **Criterios de Aceptación:** Visualización correcta de etiquetas <code> en el quiz; Sincronización completa de analítica antes de redirección.
- **Estado:** [ ] Pendiente

### [T-ATÓMICA-02] Normalización de Esquema de Banco de Preguntas
- **Origen del Hallazgo:** Auditoría Deep-Dive - 2026-06-24
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** js/Banco_Preguntas/ (todos los .json)
- **Dependencias Expuestas:** QuizProApp.normalizeQuestion
- **Descripción del Alcance:** Unificar las llaves de respuesta a 'respuesta_correcta_literal' en todos los archivos JSON para eliminar ambigüedad en el motor v7.6.
- **Criterios de Aceptación:** 100% de los reactivos utilizan la llave estándar snake_case.
- **Estado:** [ ] Pendiente

### [T-ATÓMICA-03] Limpieza de Redundancias y Estandarización de Footers
- **Origen del Hallazgo:** Auditoría Deep-Dive - 2026-06-24
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** js/index-ui.js, js/destreza_teclado.js, js/perifericos_juego.js, js/webmaster_quiz_juego.js
- **Dependencias Expuestas:** QuizProApp
- **Descripción del Alcance:** Eliminar re-declaraciones de QuizProApp dentro de funciones y estandarizar el cierre de IIFEs al objeto 'app' o 'QuizProApp' local.
- **Criterios de Aceptación:** Consistencia en la estructura de módulos.
- **Estado:** [ ] Pendiente
