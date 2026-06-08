# Informe de Auditoría y Validación de Métricas (Progreso Académico)

## 1. Auditoría del Sistema de Desbloqueo (Situación Previa)
- **Métrica Evaluada:** Se utilizaba una combinación de `maxScore` (Puntaje Máximo) e `Índice de Dominio` (Mastery).
- **Falla Detectada:** El Índice de Dominio fluctuaba con nuevos intentos, invalidando desbloqueos previamente obtenidos si el alumno bajaba su desempeño conductual.
- **Riesgo:** Bloqueo permanente de niveles avanzados por desalineación de criterios.

## 2. Nueva Lógica de Progresión (Unlock Score)
- **Métrica Autorizada:** Únicamente `maxScore` (Unlock Score) por nivel.
- **Regla Atómica:** El puntaje nunca disminuye. Se reemplaza solo si el nuevo intento es superior.
- **Desacoplamiento:** El nivel Avanzado depende exclusivamente del nivel Intermedio (Relación lineal 1:1).

## 3. Comparación de Fórmulas
| Métrica | Lógica Anterior | Nueva Lógica (Refactorizada) |
| :--- | :--- | :--- |
| **Desbloqueo** | (maxScore >= 70) AND (Mastery >= 60/70) | (maxScore >= 70) |
| **Mastery** | Sesión única o promedio variable | Histórico acumulado (70/30 Rule) |
| **Confianza** | No aislada del desbloqueo | Telemetría educativa pura (Conductual) |

## 4. Fase de Cold Start (10mo Grado - Básico)
- **Umbral de Estabilidad:** Aumentado a **100 preguntas** respondidas.
- **Propósito:** Registro de línea base (tiempos, aciertos) sin penalización en el flujo de desbloqueo.

## 5. Garantía de Compatibilidad Retroactiva
- Los registros existentes en la hoja `Logros` permanecen intactos.
- La función `navigateToLevels` en `js/quizpro.js` utiliza ahora un método de "Reducción Extrema" para encontrar el mejor intento histórico del alumno, neutralizando fallos por intentos múltiples previos.

## 6. Conclusión
El sistema ha sido blindado contra falsos negativos. La progresión académica es ahora fluida y se basa estrictamente en el éxito del contenido (Unlock Score), mientras que la analítica avanzada (ICR, GP, Mastery) se reserva para el perfilamiento pedagógico sin afectar el acceso del alumno.
