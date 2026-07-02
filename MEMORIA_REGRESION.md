# Memoria de Regresión Técnica - v7.8.6

Este documento detalla los fallos críticos detectados tras la implementación fallida inicial de la versión 7.8.6, analizando las causas raíz y las correcciones aplicadas siguiendo el procedimiento de auditoría estricto.

## 1. Incidencia Crítica: Fallo de Conexión (Red/CORS)
- **Archivo:** `js/api.js`
- **Función:** `fetchApi`
- **Error:** `TypeError: Failed to fetch` y `Blocked by CORS`.
- **Causa Raíz:** El uso de `Content-Type: text/plain;charset=utf-8` disparaba una "Preflight Request" (OPTIONS) que no era manejada correctamente por Google Apps Script.
- **Corrección:** Simplificación a `Content-Type: text/plain`.

## 2. Incidencia Crítica: Bucle Infinito de Carga
- **Archivo:** `js/student.js` y `js/config.js`
- **Error:** Recargas recursivas de actividades.
- **Causa Raíz:** `fetchAllActivities` disparaba `syncAcademicScope`, el cual emitía un evento que volvía a llamar a `fetchAllActivities`. Además, `applyConfig` no validaba si los datos habían cambiado antes de emitir el evento.
- **Corrección:**
    - Implementación de flag de guardia `isFetchingActivities` en `js/student.js`.
    - Eliminación de llamada redundante a `syncAcademicScope` en la carga de tareas.
    - Implementación de chequeo `hasChanged` en `js/config.js`.

## 3. Regresión de Interfaz: Navegación por Pestañas Residual
- **Archivo:** `student-dashboard.html` y `js/student.js`
- **Error:** Persistencia de elementos de navegación obsoletos.
- **Causa Raíz:** No se eliminaron los contenedores de pestañas ni la lógica de `switchSubject` a pesar del cambio al modelo de tarjetas expandibles.
- **Corrección:** Eliminación total de `#subject-tabs-container` y refactorización de `renderSubjectNavigation`.

## 4. Desalineación de Datos: Estructura del Spreadsheet
- **Archivo:** `backend/user-service/Code.gs`
- **Error:** Índices de columna incorrectos y almacenamiento no granular.
- **Causa Raíz:** La normalización a 9 columnas en `ConfiguracionAcademica` movió el `profesorId` a la última posición, rompiendo los filtros del backend que lo buscaban en el índice 1.
- **Corrección:**
    - Re-mapeo de índices en `getAcademicConfig` y `updateAcademicConfig`.
    - Garantía de producto cartesiano (1 fila por Tema).
    - Cumplimiento estricto del estándar de 8 columnas en `HistorialAcademico`.

---
**Conclusión:** La aplicación estricta de la Fase 0 (Auditoría) permitió identificar que la normalización del backend requería una actualización simultánea de los índices de acceso en el motor de sincronización.
