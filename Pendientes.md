# REGISTRO DE TAREAS Y REMEDIACIÓN v7.6

### [T-001] Reparación Masiva de Presentaciones 10mo Grado (REINTENTO)
- **Estado:** [X] Completada

### [T-003] Enriquecimiento de Reactivos de Periféricos
- **Estado:** [ ] Pendiente

### [T-004] Saneamiento de js/config.js y Perímetro de Seguridad
- **Estado: [X] Completada** (Integrada en T-014)

### [T-005] Verificación de Silencio en Sincronización
- **Estado: [ ] Pendiente**

### [T-006] Validación de Contenidos 10mo Grado
- **Estado: [X] Completada**

### [T-007] Módulo de Tareas: Control de Estados y Tipo de Tarea
- **Estado:** [X] Completada

### [T-008] Despliegue y Corrección de Presentaciones Bloque 14 de Junio
- **Estado:** [X] Completada

### [T-009] Corrección del Editor de Tareas e Inicialización
- **Origen del Hallazgo:** Auditoría Técnica (2026-06-14)
- **Severidad/Clasificación:** Alta
- **Archivos Involucrados:** teacher-dashboard.html, js/teacher.js
- **Descripción del Alcance:** Establecer 'Tarea' como default, desbloquear editor al abrir y forzar color negro.
- **Criterios de Aceptación:** Editor usable inmediatamente tras click en 'Nueva Tarea'.
- **Estado:** [X] Completada (2026-06-14)

### [T-010] Implementación de Lógica de Crédito Extra Asociado
- **Origen del Hallazgo:** Auditoría Técnica (2026-06-14)
- **Severidad/Clasificación:** Alta
- **Archivos Involucrados:** teacher-dashboard.html, js/teacher.js
- **Descripción del Alcance:** Permitir asociar Crédito Extra a una tarea Rechazada específica.
- **Criterios de Aceptación:** Dropdown de asociación visible solo si el tipo es 'Crédito Extra'.
- **Estado:** [X] Completada (2026-06-14)

### [T-011] Corrección de Estadísticas de Tareas (Baseline)
- **Origen del Hallazgo:** Auditoría Técnica (2026-06-14)
- **Severidad/Clasificación:** Alta
- **Archivos Involucrados:** js/student.js
- **Descripción del Alcance:** Excluir tareas de Crédito Extra del conteo baseline de tareas totales.
- **Criterios de Aceptación:** Estadísticas reflejan progreso real sin inflar el denominador.
- **Estado:** [X] Completada (2026-06-14)

### [T-012] Reparación de Contenido de Clase en Página Principal
- **Origen del Hallazgo:** Auditoría Técnica (2026-06-14)
- **Severidad/Clasificación:** Media
- **Archivos Involucrados:** js/index-ui.js
- **Descripción del Alcance:** Asegurar que los recursos académicos se rendericen correctamente en el área principal de index.html.
- **Criterios de Aceptación:** Botones de descarga visibles y funcionales.
- **Estado:** [X] Completada (2026-06-14)

### [T-013] Manejo Global de Historial de Navegación (Popstate)
- **Origen del Hallazgo:** Auditoría Técnica (2026-06-14)
- **Severidad/Clasificación:** Alta
- **Archivos Involucrados:** js/ui-common.js, js/teacher.js, js/presentation-engine.js
- **Descripción del Alcance:** Implementar mapeo de historial para evitar cierres accidentales de la app al navegar atrás.
- **Criterios de Aceptación:** Navegación atrás funcional en dashboards y presentaciones.
- **Estado:** [X] Completada (2026-06-14)

### [T-014] Restricción de Alcance Anti-Debugging a Minijuegos
- **Origen del Hallazgo:** Auditoría Técnica (2026-06-14)
- **Severidad/Clasificación:** Media
- **Archivos Involucrados:** js/config.js, js/security-minigames.js, juegos/*.html
- **Descripción del Alcance:** Mover lógica anti-debug a un archivo dedicado y cargarlo solo en minijuegos.
- **Criterios de Aceptación:** F12/Click derecho habilitados en dashboards, bloqueados en juegos.
- **Estado:** [X] Completada (2026-06-14)
