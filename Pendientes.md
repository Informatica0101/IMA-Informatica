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
- **Estado:** [X] Completada (2026-06-14)

### [T-010] Implementación de Lógica de Crédito Extra Asociado
- **Estado:** [X] Completada (2026-06-14)

### [T-011] Corrección de Estadísticas de Tareas (Baseline)
- **Estado:** [X] Completada (2026-06-14)

### [T-012] Reparación de Contenido de Clase en Página Principal
- **Estado:** [X] Completada (2026-06-14)

### [T-013] Manejo Global de Historial de Navegación (Popstate)
- **Estado:** [X] Completada (2026-06-14)

### [T-014] Restricción de Alcance Anti-Debugging a Minijuegos
- **Estado:** [X] Completada (2026-06-14)

### [T-015] Forzado de Color Negro en Editores (Fix Herencia)
- **Origen del Hallazgo:** Reporte Post-Commit (2026-06-14)
- **Severidad:** Alta
- **Descripción:** El color global de 'p' sobrepasaba el fix anterior.
- **Estado:** [X] Completada (2026-06-14)

### [T-016] Implementación de Jerarquía Completa para Profesores en Index
- **Origen del Hallazgo:** Auditoría Técnica (2026-06-15)
- **Severidad:** Crítico
- **Archivos Involucrados:** js/index-ui.js
- **Descripción:** Implementar los niveles de 'Secciones' y 'Parciales' en el Centro de Recursos Académicos del Index para el rol Profesor.
- **Criterios de Aceptación:** Flujo Grados -> Secciones -> Parciales -> Asignaturas -> Temas funcional y con soporte de historial.

### [T-017] Optimización de fetchLogros (Teacher Dashboard)
- **Origen del Hallazgo:** Code Review / Auditoría (2026-06-15)
- **Severidad:** Medio
- **Archivos Involucrados:** js/teacher.js
- **Descripción:** Eliminar la doble llamada a fetchApi.
- **Criterios de Aceptación:** Una sola llamada que maneje tanto caché como actualización de red.
