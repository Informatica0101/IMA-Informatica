# Diagnóstico de Causa Raíz — Regresión de Progresión Académica

## 1. Evidencia del Fallo (Code Evidence)

### A. Vulnerabilidad por Intentos Múltiples en Backend
En `backend/user-service/Code.gs`, la función `getGameStats` utiliza una lógica de "Mejor Puntaje" que colisiona con el "Mejor Dominio":
```javascript
if (!stats[key] || p > stats[key].maxScore) {
  stats[key] = { maxScore: p, dominio: dominioPromedio, ... };
}
```
**Efecto:** Si un alumno obtiene 80% Puntaje / 40% Dominio en el Intento 1, y luego 75% Puntaje / 90% Dominio en el Intento 2, el sistema **descarta** el Intento 2.
**Consecuencia:** La interfaz recibe el Dominio de 40%, bloqueando niveles superiores que requieren Dominio >= 60%, a pesar de que el alumno ya demostró maestría en el Intento 2.

### B. Acoplamiento de Prerrequisitos en Frontend
En `js/quizpro.js`, la función `checkCrossGradeLock` mantenía una validación combinada:
```javascript
const hasApproval = statsArray.some(s =>
    // ...
    parseFloat(s.maxScore || 0) >= 70 &&
    parseFloat(s.dominioPromedio || s.dominio || 0) >= 60
);
```
**Efecto:** El bloqueo de una sola asignatura del grado anterior por fluctuación de Dominio (Capa 4) invalidaba el acceso a todas las asignaturas del grado actual, rompiendo el "Desacoplamiento Lineal".

## 2. Demostración de la Causa Raíz
La regresión fue introducida al intentar unificar el Índice de Dominio con el Puntaje de Desbloqueo en una misma estructura de datos (`stats[key]`), sin considerar que son métricas con ciclos de vida distintos:
- **Unlock Score:** Debe ser siempre el máximo absoluto (No descendente).
- **Mastery:** Es un promedio ponderado que puede fluctuar.

Al condicionar el desbloqueo a ambas métricas simultáneamente y bajo una única entrada de caché, se generaron los "Falsos Negativos" reportados.

## 3. Resolución Propuesta
1. **Frontend:** Eliminar definitivamente el chequeo de Dominio para desbloqueos. Usar exclusivamente `maxScore >= 70`.
2. **Frontend:** Simplificar `checkCrossGradeLock` para asegurar que solo valide el éxito del contenido (Unlock Score).
3. **Backend:** Asegurar que `saveGameResult` y `recordAnalytics` persistan los datos de forma independiente pero atómica.
