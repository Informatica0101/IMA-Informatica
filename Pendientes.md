# REGISTRO DE TAREAS Y REMEDIACIÓN v7.6

### [T-001] Reparación Masiva de Presentaciones 10mo Grado (REINTENTO)
- **Estado:** [X] Completada

### [T-003] Enriquecimiento de Reactivos de Periféricos
- **Estado:** [X] Completada

### [T-004] Saneamiento de js/config.js y Perímetro de Seguridad
- **Estado: [X] Completada** (Integrada en T-014)

### [T-005] Verificación de Silencio en Sincronización
- **Estado: [X] Completada**

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
- **Estado:** [X] Completada

### [T-018] Mejora de Visualización para Bloques de Código (Profesor)
- **Origen del Hallazgo:** Requerimiento de Usuario (2026-06-16)
- **Severidad:** Alto
- **Archivos Involucrados:** teacher-dashboard.html, js/teacher.js, css/style.css
- **Dependencias Expuestas:** window.setupCodeCopyButtons (ui-common.js)
- **Descripción del Alcance:**
    - Corregir estructura HTML en el modal de detalles de tarea para soportar bloques <pre>.
    - Asegurar inicialización de botones de copiado en contenido dinámico del dashboard.
    - Garantizar formato monoespaciado, fondo diferenciado y desplazamiento horizontal.
- **Criterios de Aceptación:**
    - El código se muestra en contenedor independiente con fuente monoespaciada.
    - Botón "Copiar Código" funcional y con confirmación visual presente en cada bloque.
    - El diseño es responsivo y permite scroll horizontal en móviles.
- **Estado:** [X] Completada

### [T-019] Afinamiento de la Navegación (Restauración de Grados)
- **Origen del Hallazgo:** Requerimiento de Usuario (2026-06-16)
- **Severidad:** Crítico
- **Archivos Involucrados:** js/teacher.js, js/ui-common.js
- **Dependencias Expuestas:** history API, window.syncNavWithState
- **Descripción del Alcance:**
    - Corregir la persistencia del estado inicial en el Dashboard del Profesor para incluir el nivel de 'Grados'.
    - Asegurar que el retroceso desde 'Secciones' restaure correctamente la vista de 'Grados'.
    - Sincronizar navStack interno con los estados del historial.
- **Criterios de Aceptación:**
    - El flujo de retroceso completo es: Detalle -> Alumnos -> Asignatura -> Parcial -> Sección -> Grados.
    - Ningún nivel es omitido durante la navegación hacia atrás.
    - El comportamiento es consistente en escritorio y móviles.
- **Estado:** [X] Completada

### [T-020] Corrección Integral de Errores de Consola
- **Origen del Hallazgo:** Reporte de Usuario (2026-06-16)
- **Severidad:** Crítico
- **Archivos Involucrados:** js/index-ui.js, js/quizpro.js, js/destreza_teclado.js
- **Descripción del Alcance:**
    - Corregir el orden de definición de window.renderWelcomeMessage para evitar TypeError.
    - Refactorizar js/quizpro.js a ES5 para eliminar errores de sintaxis y restaurar accesibilidad de funciones.
    - Sincronizar el selector de botón en js/destreza_teclado.js con el ID del HTML.
- **Criterios de Aceptación:**
    - Consola libre de errores al cargar index.html y navegar a minijuegos.
    - Navegación a asignaturas en QuizPro funcional.
    - Botón "Calibrar Dedos" en Maestro del Teclado interactivo.
- **Estado:** [X] Completada

### [T-021] Estandarización de XP y Rankings en Minijuegos
- **Origen del Hallazgo:** Auditoría Forense (2026-06-16)
- **Severidad:** Crítico
- **Archivos Involucrados:** js/games-adapter.js, js/destreza_teclado.js, js/perifericos_juego.js, js/webmaster_quiz_juego.js
- **Descripción del Alcance:**
    - Centralizar XP_CONFIG y calculateXP en GamesAdapter.
    - Implementar degradación de XP por intentos repetidos.
    - Corregir cálculo de WPM a estándar (caracteres/5).
    - Implementar progresión dinámica de dificultad en juegos de escritura.
    - Asegurar Top 5 con XP en todos los minijuegos.
- **Criterios de Aceptación:**
    - Todos los juegos generan XP consistente con QuizPro.
    - WPM matemáticamente preciso.
    - Rankings actualizados en tiempo real con XP visible.
- **Estado: [ ] Pendiente**
