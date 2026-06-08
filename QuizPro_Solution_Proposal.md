# Propuesta de Solución Refinada — QuizPro v4.1

## 1. Justificación Pedagógica
La solución busca restablecer la fluidez de la progresión académica eliminando los "falsos negativos" producidos por la fluctuación del Índice de Dominio, mientras se preserva la integridad de la analítica conductual para fines de reporte y recomendación.

## 2. Cambios en Backend (`backend/user-service/Code.gs`)
- **Independencia de Métricas en `getGameStats`:** Se modificará el recolector de estadísticas para que el `maxScore` (Capa 2) y el `dominioPromedio` (Capa 4) se extraigan de forma independiente.
- **Sincronización Atómica:** Se asegurará que la respuesta de `getGameStats` entregue siempre el Dominio más reciente y acumulado, sin importar si la sesión actual superó o no el récord de puntaje anterior. Esto garantiza que la UI siempre vea el progreso real de aprendizaje.

## 3. Cambios en Frontend (`js/quizpro.js`)
- **Reducción Extrema (Garantía de Mejor Intento):** Se optimizará `navigateToLevels` para que, al procesar el historial del alumno, identifique el valor máximo absoluto de puntaje entre todos los intentos registrados.
- **Desacoplamiento Lineal Puro:** Se simplificarán las reglas de desbloqueo siguiendo la jerarquía directa:
    - **Nivel Intermedio:** Se habilita si `Mejor Puntaje Básico >= 70%`.
    - **Nivel Avanzado:** Se habilita si `Mejor Puntaje Intermedio >= 70%`.
- **Preservación del Perfilamiento:** El Índice de Dominio (Mastery) se seguirá mostrando en el Dashboard y se utilizará para recomendaciones pedagógicas, pero no actuará como un bloqueador de acceso en los niveles Básico e Intermedio, evitando así la regresión por fluctuación conductual.

## 4. Mitigación de Riesgos
- **Compatibilidad Retroactiva:** No se modifican los esquemas de las hojas `Logros` ni `LearningProfile`.
- **Inmutabilidad:** Se utilizan métodos de lectura no destructivos sobre el caché de estadísticas.
- **Transparencia:** El alumno percibe una progresión basada en sus logros (puntaje), mientras el sistema sigue capturando datos profundos (tiempos, cambios, confianza) de forma silenciosa.
