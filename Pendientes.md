# Registro Oficial de Tareas Autorizadas (v7.5)

### [TASK-001] Restricción de Dataset en Tabla de Top Globales
- **Origen del Hallazgo:** Auditoría Clínica - js/quizpro.js Línea 1583
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** js/quizpro.js
- **Dependencias Expuestas:** renderGlobalTopHTML, fetchApi, Rankings Store
- **Descripción del Alcance:** Limitar la visualización de la tabla de posiciones globales a los 5 usuarios con mayor puntuación mediante la aplicación de .slice(0, 5) en el flujo de renderizado.
- **Criterios de Aceptación:** Solo se deben renderizar 5 filas en el tbody #global-top-body, independientemente del tamaño del dataset retornado por la API o la caché.
- **Estado:** [X] Completada

### [TASK-002] Optimización de Capa de Caché e Hidratación No Disruptiva
- **Origen del Hallazgo:** Auditoría Clínica - js/student.js, js/teacher.js
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** js/student.js, js/teacher.js, js/quizpro.js
- **Dependencias Expuestas:** GamesAdapter.showLoading, fetchAllActivities, fetchTeacherActivity
- **Descripción del Alcance:** Asegurar que si el sistema detecta datos en caché (hasLocalData), no se activen pantallas de carga bloqueantes (loaders) ni parpadeos durante la conciliación silenciosa en segundo plano.
- **Criterios de Aceptación:** Al recargar la página con caché activa, el usuario debe ver el contenido instantáneamente (0ms) sin ser interrumpido por el spinner global.
- **Estado:** [X] Completada

### [TASK-003] Soporte de Renderizado HTML Enriquecido y Sanitización
- **Origen del Hallazgo:** Auditoría Clínica - js/config.js Línea 107
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** js/config.js, js/quizpro.js, js/student.js, js/teacher.js
- **Dependencias Expuestas:** window.sanitizarHTMLTecnico, showQuestion, renderActivities, openTaskDetail
- **Descripción del Alcance:** Expandir la lista blanca del sanitizador para permitir etiquetas de formato estructurado y asegurar el uso de innerHTML en todos los componentes de visualización de contenido dinámico.
- **Criterios de Aceptación:** Las etiquetas <p>, <span>, <ul>, <li> y <a> deben renderizarse correctamente en lugar de mostrarse como texto plano.
- **Estado:** [X] Completada

### [TASK-004] Implementación de Perímetro de Seguridad Perimetral (Anti-Debugging)
- **Origen del Hallazgo:** Auditoría Clínica - js/config.js
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** js/config.js
- **Dependencias Expuestas:** Event Listeners Globales, CSS Injection
- **Descripción del Alcance:** Inhabilitar F12, atajos de inspección, menú contextual y selección de texto a nivel global para proteger el código fuente y los reactivos de los minijuegos.
- **Criterios de Aceptación:** El clic derecho no debe abrir el menú, F12 y Ctrl+Shift+I deben ser bloqueados, y el texto no debe ser seleccionable.
- **Estado:** [X] Completada

---
## TAREAS PENDIENTES DE REVISIÓN
- [TASK-001] Restricción de Dataset en Tabla de Top Globales
- [TASK-002] Optimización de Capa de Caché e Hidratación No Disruptiva
- [TASK-003] Soporte de Renderizado HTML Enriquecido y Sanitización
- [TASK-004] Implementación de Perímetro de Seguridad Perimetral (Anti-Debugging)
