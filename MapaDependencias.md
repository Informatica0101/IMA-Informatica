# Mapa de Dependencias Académicas

## Módulo de Tareas (Teacher/Student)
- Entidad: Tarea (Regular) -> Impacta Progreso Base.
- Entidad: Crédito Extra -> Impacta Recuperación (No afecta Base).
- Relación: Crédito Extra [1] <-> [1] Tarea Rechazada.

## Módulo de Navegación
- ui-common.js (Garante de historial) -> teacher.js (Vistas de dashboard).
- ui-common.js (Garante de historial) -> index-ui.js (Navegación de recursos).
- presentation-engine.js -> Depende de ui-common.js para sanitización y seguridad.

## Módulo de Seguridad
- security-minigames.js (NUEVO) -> games-adapter.js (Coordinación).
- minigames (juegos/*.html) -> Dependen de security-minigames.js.
