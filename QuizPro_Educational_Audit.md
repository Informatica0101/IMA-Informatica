# Auditoría de la Lógica Educativa — QuizPro v4.0

## 1. Misión Pedagógica
QuizPro es un motor de evaluación adaptativa diseñado para medir no solo la precisión del conocimiento, sino también la confianza, la consistencia y la probabilidad de automatización del aprendizaje.

## 2. Capas de Análisis (Arquitectura Analítica)

### Capa 1: Resultado de la Sesión (Puntaje Inmediato)
- **Métrica:** Porcentaje de aciertos (correctas / total).
- **Propósito:** Feedback inmediato al alumno. No es un indicador de dominio consolidado.

### Capa 2: Desbloqueo Académico (Unlock Score)
- **Métrica:** `maxScore` (Máximo histórico por Asignatura + Nivel).
- **Regla:** Atómica y no-descendente. Si el nuevo puntaje es mayor al anterior, se reemplaza.
- **Estado Actual:** 70% requerido para habilitar el siguiente nivel.

### Capa 3: Historial de Aprendizaje
- **Métrica:** Array de intentos cronológicos.
- **Propósito:** Seguimiento de la evolución y tendencias.

### Capa 4: Índice de Dominio (Mastery Index)
- **Fórmula:** Promedio ponderado (70% histórico / 30% ICR actual).
- **Persistencia:** Hoja `LearningProfile`.
- **Propósito:** Identificación de fortalezas/debilidades y recomendaciones de refuerzo.

### Capa 5: Analítica Conductual (ICR & GP)
- **ICR (Confidence):** Mide la certeza del alumno basado en Exactitud (40%), Eficiencia/Tiempo (30%), Dificultad (20%) y Consistencia/Cambios (10%).
- **GP (Guessing):** Mide la probabilidad de adivinación basada en Rapidez (35%), Error (35%), Dificultad (15%) y Fallo Global (15%).

## 3. Fase de Cold Start (Calibración)
- **Alcance:** Décimo Grado - Nivel Básico.
- **Umbral:** 100 preguntas respondidas.
- **Lógica:** Durante esta fase, las métricas conductuales se registran pero no penalizan la progresión, sirviendo para establecer la línea base del usuario.

## 4. Estado del Sistema y Regresiones
- **Desbloqueos:** Recientemente desacoplados del Dominio para evitar bloqueos por fluctuaciones conductuales.
- **Sincronización:** Se detecta una desalineación entre el registro de sesión y el cálculo de métricas avanzadas si el flujo de persistencia no es atómico.
- **Intentos Múltiples:** La interfaz debe asegurar que evalúa el `maxScore` real y no el primer registro encontrado en el historial bruto.

## 5. Fórmulas Vigentes (Resumen)
- **Mastery:** `(prevMastery * 0.7) + (currentICR * 0.3)`
- **ICR:** `(Acc * 0.4) + (Eff * 0.3) + (Diff * 0.2) + (Cons * 0.1)`
- **GP:** `(Speed * 0.35) + (Err * 0.35) + (Diff * 0.15) + (GlobalFail * 0.15)`
