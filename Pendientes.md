# REGISTRO DE TAREAS Y REMEDIACIÓN v7.6

### [T-001] Reparación Masiva de Presentaciones 10mo Grado (REINTENTO)
- **Origen del Hallazgo:** Code Review / Auditoría Forense
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** Informatica_I/*.html
- **Descripción del Alcance:** Reconstrucción integral siguiendo la estructura de 16 diapositivas (1 Portada, 10 Contenido, 1 Ejercicio, 1 Actividad, 1 Transición, 1 Quiz, 1 Cierre). Eliminar placeholders.
- **Criterios de Aceptación:** Estructura exacta, sin placeholders, motor v2.4 acoplado.
- **Estado:** [ ] En Ejecución

### [T-003] Enriquecimiento de Reactivos de Periféricos
- **Origen del Hallazgo:** Code Review
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** js/Banco_Preguntas/Decimo/Informatica/basico.json
- **Descripción del Alcance:** Inyectar imágenes a los reactivos de periféricos y asegurar simetría.
- **Estado:** [ ] Pendiente

### [T-004] Saneamiento de js/config.js y Perímetro de Seguridad
- **Origen del Hallazgo:** Auditoría Forense (2026-06-13)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** js/config.js
- **Descripción del Alcance:** Eliminar código duplicado de interceptores. Asegurar que 'user-select: none' se aplique sin excepciones en el entorno de minijuegos.
- **Estado: [ ] Pendiente**

### [T-005] Verificación de Silencio en Sincronización
- **Origen del Hallazgo:** Requerimiento Clínico #2
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** js/student.js, js/teacher.js
- **Descripción del Alcance:** Confirmar que el 'onUpdate' de fetchApi no dispare parpadeos visuales al actualizar la tabla desde el servidor.
- **Estado: [ ] Pendiente**

### [T-004] Refactorización de Seguridad y Sanitización (Clinical)
- **Origen del Hallazgo:** Auditoría Técnica (2025-10-27)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** js/config.js, js/presentation-engine.js
- **Descripción del Alcance:** Eliminar código duplicado en config.js. Integrar sanitizarHTMLTecnico en el motor de presentaciones para garantizar renderizado de tags técnicos en el Quiz.
- **Estado:** [ ] Pendiente
