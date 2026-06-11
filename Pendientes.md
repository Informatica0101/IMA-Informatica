# Registro de Tareas Pendientes (v7.5) - METODOLOGÍA OFICIAL

### [T-FORENSE-01] Transpilación Crítica a ES5 (Dashboard & API)
- **Origen del Hallazgo:** Auditoría Forense v7.5 - 2026-06-22
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** js/api.js, js/student.js, js/auth.js, js/ui-common.js, js/teacher.js
- **Dependencias Expuestas:** sw.js, QuizProApp
- **Descripción del Alcance:** Reemplazar 'async/await' por promesas tradicionales, 'const/let' por 'var', y eliminar arrow functions, template literals, optional chaining y spread operators.
- **Criterios de Aceptación:** Carga limpia de todos los scripts en IE11/AB Browser sin errores de sintaxis.
- **Estado:** [ ] Pendiente

### [T-FORENSE-02] Restauración de Blindaje Namespace QuizProApp
- **Origen del Hallazgo:** Auditoría Forense v7.5 - 2026-06-22
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** js/api.js, js/student.js, js/auth.js, js/ui-common.js, js/teacher.js
- **Dependencias Expuestas:** MapaDependencias.md
- **Descripción del Alcance:** Envolver los archivos en IIFE y registrar las funciones en QuizProApp para evitar colisiones globales.
- **Criterios de Aceptación:** window.QuizProApp debe contener todos los métodos; no deben existir variables globales huérfanas.
- **Estado:** [ ] Pendiente

### [T-FORENSE-03] Remediación de Lógica de Fusión (auth.js)
- **Origen del Hallazgo:** Auditoría Forense v7.5 - 2026-06-22
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** js/auth.js
- **Dependencias Expuestas:** PersistenceManager
- **Descripción del Alcance:** Sustituir Object.values y bucles for...of por iteración manual ES5 compatible para asegurar la migración de GUEST_UUID.
- **Criterios de Aceptación:** Sincronización exitosa de XP de invitado en navegadores legacy.
- **Estado:** [ ] Pendiente
