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
