# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 35

**Fase:** 35 — Importador inteligente de Excel, CSV y hojas de cálculo
**Área:** Ingesta masiva de datos, reconocimiento semántico, normalización regional, detección de duplicados, validación contextual, simulación, ejecución por lotes y reversión segura.
**Fecha de Evaluación:** 2026-10-31
**Estado General:** Implementada Parcialmente con Brechas Críticas en Mapeo Semántico, Detección de Conflictos y Reversión

---

## A. IDENTIFICACIÓN Y ALCANCE

### 1. Propósito y Objetivos
Evaluar integralmente las capacidades del importador inteligente de datos tabulares (archivos XLSX, XLS y CSV) en la Plataforma Integral de Gestión Educativa, considerando el flujo completo desde la selección del archivo hasta su validación estructural, correspondencia semántica con los campos del modelo institucional, simulación de efectos (`Crear`, `Actualizar`, `Sin Cambios`, `Omitir`, `Revisión`, `Error`), ejecución segura con control de duplicados e idempotencia, y reversión selectiva ante errores.

### 2. Alcance Previsto y Efectivo
- **Reconocimiento de Formatos y Estructura:** Detección de archivos XLSX/CSV, hojas múltiples, filas de encabezado desplazadas y rangos de datos en cliente (`SheetJS / xlsx.full.min.js`) y backend.
- **Correspondencia Semántica:** Reconocimiento de sinónimos (`Alumno` -> `Estudiante`, `Cantidad` -> `Importe`, `No. Cuenta` -> `Cuenta`), tolerancia a variaciones tipográficas y desvinculación estricta de la posición fija de columnas.
- **Validación y Simulación sin Guardar:** Inspección de `validateImportPreview` en `backend/accounting-service/Code.gs` y previsualización de cambios en interfaz.
- **Ejecución Idempotente y Trazabilidad:** Inspección de `importDataWithColumnMapping` y bitácora en hoja `AuditoriaMigraciones`.
- **Integridad de Tipos de Datos y Normalización Regional:** Tratamiento de identificadores con ceros a la izquierda (`00125`), números largos, fechas ambiguas (`DD/MM/AAAA` vs. `MM/DD/AAAA`) e importes monetarios.
- **Seguridad y Acceso:** Control de roles RBAC/ABAC sobre operaciones de importación masiva.

---

## B. INVENTARIO TÉCNICO Y COMPONENTES IDENTIFICADOS

| Componente | Archivo / Fuente | Función Principal | Estado / Hallazgo |
|---|---|---|---|
| Vista Previa de Importación | `backend/accounting-service/Code.gs` | `validateImportPreview(payload)` | Implementada básica. Valida únicamente presencia de campo identificador. |
| Ejecución con Mapeo de Columnas | `backend/accounting-service/Code.gs` | `importDataWithColumnMapping(payload)` | Registra en `AuditoriaMigraciones`. No realiza transformaciones profundas ni valida relaciones de negocio. |
| Bitácora de Migraciones | `backend/accounting-service/Code.gs` | `getMigrationLogs(payload)` | Retorna historial de ejecuciones desde la hoja `AuditoriaMigraciones`. |
| Modal de Importación Frontend | `teacher-dashboard.html` | `#modal-excel-importer` | Interfaz modal con selector de módulo destino (`Docentes`, `Secretaría`, `Contabilidad`) y carga de archivos. |
| Controlador de Carga Frontend | `js/teacher.js` | Event listeners `#excel-file-input`, `#btn-submit-excel-import` | Utiliza `XLSX.read` y `sheet_to_json`. Toma la primera hoja y mapea por defecto la primera columna como ID. |
| Biblioteca SheetJS | `teacher-dashboard.html` | `https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js` | Presente y operativa para parseo en cliente. |

---

## C. EVALUACIÓN DETALLADA POR SUBCAPACIDAD (F35-01 A F35-20)

### F35-01. Carga de archivos y reconocimiento de formatos
- **Estado:** Implementada Parcialmente.
- **Evidencia:** `js/teacher.js` (L7426-L7449) utiliza `FileReader` y `XLSX.read(data, { type: 'array' })`.
- **Brechas:**
  1. Si el archivo XLSX contiene múltiples hojas, el sistema lee automáticamente la primera hoja (`workbook.SheetNames[0]`), sin permitir al usuario elegir la hoja relevante.
  2. No valida tipos MIME reales en servidor ni detecta archivos corruptos o protegidos con contraseña antes de procesar.

### F35-02. Detección de hojas, encabezados y estructura de datos
- **Estado:** Requiere Mejoras.
- **Evidencia:** `XLSX.utils.sheet_to_json(worksheet, { defval: "" })` asume rígidamente que la fila 1 contiene los encabezados.
- **Brechas:** Si el archivo contiene títulos institucionales o notas en las primeras filas (ej. encabezados en fila 4), se generan nombres de columna basura (`__EMPTY`, `__EMPTY_1`) desfasando los datos.

### F35-03. Reconocimiento semántico de encabezados y sugerencias
- **Estado:** Ausente en Implementación Real.
- **Evidencia:** `js/teacher.js` (L7472) envía rígidamente `columnaMapeo: { identificador: Object.keys(parsedExcelData[0] || {})[0] || 'ID' }`.
- **Brechas:** No existe diccionario de sinónimos, ni análisis de similitud (Levenshtein), ni sugerencias automáticas de mapeo semántico.

### F35-04. Interfaz de correspondencias y nombres descriptivos
- **Estado:** Ausente en UI.
- **Evidencia:** El modal `#modal-excel-importer` solo muestra un resumen de texto plano (`Total de Filas Leídas` y lista cruda de columnas) sin controles interactivos de mapeo columna -> campo de destino.

### F35-05. Exclusión de columnas, selección de rangos y configuración de origen
- **Estado:** Ausente.
- **Brechas:** No es posible desmarcar columnas irrelevantes, ni acotar el rango de filas a procesar desde la interfaz.

### F35-06. Interpretación de tipos de datos y normalización
- **Estado:** Defectuosa.
- **Brechas:**
  1. SheetJS convierte códigos con ceros a la izquierda (`00125`) a enteros (`125`) salvo que se fuerce lectura como texto puro (`raw: false`).
  2. No hay soporte para desambiguar fechas (`DD/MM/AAAA` vs. `MM/DD/AAAA`) ni normalizar importes con coma decimal (`1.250,50`).

### F35-07. Validación de campos obligatorios y reglas de negocio
- **Estado:** Implementada Parcialmente.
- **Evidencia:** `validateImportPreview` comprueba únicamente la presencia del campo clave de identificación. No valida tipos de datos, longitudes ni restricciones de catálogo.

### F35-08. Validación de referencias y relaciones entre registros
- **Estado:** Ausente en Importador.
- **Brechas:** No valida si el estudiante (`estudianteId`), la cuenta bancaria o la matrícula existen previamente en la base de datos, arriesgando la inserción de registros huérfanos.

### F35-09. Detección de duplicados y conflictos
- **Estado:** Ausente.
- **Brechas:** No detecta filas repetidas dentro del archivo ni compara contra la base de datos para diferenciar registros nuevos de existentes.

### F35-10. Vista previa de efectos de la importación
- **Estado:** Requiere Mejoras.
- **Evidencia:** Solo muestra conteo total de filas. No categoriza en `Crear`, `Actualizar`, `Omitir` o `Error`.

### F35-11. Validación sin guardar y control de ejecución
- **Estado:** Implementada Parcialmente.
- **Evidencia:** `validateImportPreview` existe en backend pero el botón frontend `btn-submit-excel-import` envía directamente a `importDataWithColumnMapping` sin requerir validación previa aprobada.

### F35-12. Ejecución segura, consistencia e idempotencia
- **Estado:** Requiere Mejoras.
- **Brechas:** `importDataWithColumnMapping` no ejecuta las inserciones efectivas en las tablas de destino (solo registra el resumen en `AuditoriaMigraciones`). Carece de ScriptLock contra concurrencia.

### F35-13. Informe descargable de errores y resultados
- **Estado:** Requiere Mejoras.
- **Evidencia:** Los errores se almacenan en JSON en `AuditoriaMigraciones` (limitados a 20 errores) pero no hay botón para descargar el CSV de filas rechazadas.

### F35-14. Perfiles de mapeo reutilizables
- **Estado:** Ausente.
- **Brechas:** No existe tabla ni interfaz para guardar plantillas de mapeo por proveedor o formato recurrente.

### F35-15. Historial, trazabilidad y reversión de importaciones
- **Estado:** Implementada Parcialmente (Trazabilidad Sí, Reversión No).
- **Evidencia:** `getMigrationLogs` permite auditar ejecuciones pasadas. No existe función de reversión o desecho seguro de lotes.

### F35-16. Seguridad y permisos del proceso de importación
- **Estado:** Completa y Verificada en Backend.
- **Evidencia:** `validateImportPreview` e `importDataWithColumnMapping` están restringidos a `Director`, `Subdirector`, `Contador` y `Administrador` en `ROLE_PERMISSIONS`.

### F35-17. Experiencia de usuario y asistencia durante la importación
- **Estado:** Requiere Mejoras.
- **Brechas:** Asistente lineal ausente; modal estático sin navegación paso a paso (1. Archivo -> 2. Mapeo -> 3. Validación -> 4. Confirmación).

### F35-18. Rendimiento y procesamiento de archivos grandes
- **Estado:** Requiere Mejoras.
- **Brechas:** Si el archivo supera 500 filas, transferir todo el payload JSON en una sola solicitud GAS puede agotar cuotas de memoria o tiempos máximos de ejecución (6 min).

### F35-19. Recuperación ante fallos y conservación de archivos de trabajo
- **Estado:** Requiere Mejoras.
- **Brechas:** No se conserva el binario original en Drive para auditoría forense ante reclamos.

### F35-20. Capacidad de ampliación a nuevos módulos y tipos de información
- **Estado:** Implementada Parcialmente.
- **Evidencia:** Selector `excel-target-module` admite `Docentes`, `Secretaria` y `Contabilidad`, pero el backend carece de esquemas dinámicos por entidad.

---

## D. COMPARACIÓN FUNCIONAL EXTERNA

- **PowerSchool SIS:** Asistente por pasos con diccionario de correspondencias semánticas, pre-validación sin persistencia y generación de archivo de rechazos con el motivo exacto por fila.
- **Odoo Data Import:** Detección automática de encabezados desplazados, correspondencia probabilística basada en contenido de celda y simulación visual con conteo de registros nuevos vs. modificados.
- **Xero:** Perfiles de importación guardados para extractos bancarios y reglas estrictas de formato regional (`DD/MM/YYYY` vs. `MM/DD/YYYY`).

---

## E. LISTA MAESTRA DE CARACTERÍSTICAS (CAR-F35)

| ID | Característica | Prioridad | Estado Funcional | Acción Recomendada |
|---|---|---|---|---|
| F35-01 | Carga y reconocimiento de formatos | P0 | Implementada Parcialmente | Selector de hojas XLSX y validación de cabecera |
| F35-02 | Detección de encabezados y rangos | P0 | Requiere Mejoras | Selector interactivo de fila de encabezados |
| F35-03 | Reconocimiento semántico | P0 | Ausente | Motor de sinónimos y coincidencia difusa |
| F35-04 | Interfaz de correspondencias | P0 | Ausente | Tabla visual de mapeo interactivo |
| F35-05 | Exclusión de columnas y filas | P0 | Ausente | Checkboxes de inclusión/exclusión de campos |
| F35-06 | Tipos de datos y formatos regionales | P0 | Defectuosa | Preservación de ceros a izquierda y normalizador de fechas/moneda |
| F35-07 | Validación de campos y reglas | P0 | Implementada Parcialmente | Validaciones estrictas por tipo de entidad |
| F35-08 | Validación de relaciones y referencias | P0 | Ausente | Verificación de existencia de estudiantes/cuentas |
| F35-09 | Detección de duplicados y conflictos | P0 | Ausente | Matching por ID y campos compuestos |
| F35-10 | Vista previa de efectos | P0 | Requiere Mejoras | Matriz de simulación (Crear / Actualizar / Omitir) |
| F35-11 | Validación previa sin guardar | P0 | Implementada Parcialmente | Puerta obligatoria previa a confirmación |
| F35-12 | Ejecución segura e idempotencia | P0 | Requiere Mejoras | Inserción real con ScriptLock y claves de idempotencia |
| F35-13 | Informe descargable de errores | P0 | Requiere Mejoras | Generador de CSV de filas observadas |
| F35-14 | Perfiles de mapeo reutilizables | P1 | Ausente | Persistencia de plantillas en `PerfilesMapeoImportacion` |
| F35-15 | Historial y reversión segura | P0 | Implementada Parcialmente | Servicio de reversión selectiva de lotes |
| F35-16 | Seguridad y permisos RBAC | P0 | Completa y Verificada | Mantener aislamiento y verificación de sesión |
| F35-17 | Asistente de usuario guiado | P1 | Requiere Mejoras | Flujo en 4 pasos (Archivo, Mapeo, Validación, Resultado) |
| F35-18 | Procesamiento por lotes | P1 | Requiere Mejoras | Chunking de 200 filas para evitar límites GAS |
| F35-19 | Recuperación ante fallos | P1 | Requiere Mejoras | Respaldo del archivo en Google Drive |
| F35-20 | Esquemas dinámicos multi-módulo | P1 | Implementada Parcialmente | Catálogo centralizado de entidades importables |

---

## F. RESULTADOS DE PRUEBAS INTEGRALES (PT-F35-01 A PT-F35-12)

| Escenario | Objetivo | Resultado Esperado | Resultado Observado | Estado |
|---|---|---|---|---|
| **PT-F35-01: Encabezados semánticos de pagos** | Probar correspondencia semántica | Mapea 'Alumno' a 'Estudiante' | Asigna rígidamente primera columna | **No Aprobado** |
| **PT-F35-02: Columnas en orden alterado** | Independencia de posición | Mapeo idéntico | Se desalinea si cambia el orden | **No Aprobado** |
| **PT-F35-03: Encabezados ambiguos** | Detección de ambigüedad | Solicita confirmación | Asigna primera columna a ID | **No Aprobado** |
| **PT-F35-04: Referencias inexistentes** | Validar IDs de alumnos/cuentas | Alerta de matrícula no encontrada | No valida contra base de datos | **No Aprobado** |
| **PT-F35-05: Duplicados internos/externos** | Detección de duplicaciones | Clasifica duplicados | Ignora duplicaciones | **No Aprobado** |
| **PT-F35-06: Formatos de fecha y ceros** | Preservar `00125` y fechas | Conserva ceros e interpreta fecha | Convierte a número `125` | **No Aprobado** |
| **PT-F35-07: Encabezados en fila 4** | Ignorar filas de título | Permite elegir fila 4 | Toma fila 1 y genera columnas inválidas | **No Aprobado** |
| **PT-F35-08: CSV con delimitador punto y coma** | Parseo de CSV regional | Interpreta columnas | Falla si delimitador no es coma | **No Aprobado** |
| **PT-F35-09: Reversión selectiva** | Revertir lote de importación | Revierte registros no modificados | Endpoint de reversión no implementado | **No Aprobado** |
| **PT-F35-10: Reintento idempotente** | Evitar duplicar por reintento | Detecta lote ya importado | No valida idempotencia | **No Aprobado** |
| **PT-F35-11: Permisos de acceso** | Bloquear rol no autorizado | Error 403 en backend | Bloqueado exitosamente por RBAC | **Aprobado** |
| **PT-F35-12: Perfil reutilizable** | Guardar y reusar mapeo | Aplica mapeo guardado | Funcionalidad ausente | **No Aprobado** |

---

## G. PLAN DE RESOLUCIÓN PRIORIZADO

### Bloque P0: Integridad, Reconocimiento Semántico y Ejecución Segura
1. **[F35-Task01] Motor de reconocimiento semántico de encabezados y mapeo interactivo:**
   - Implementar diccionario de sinónimos y algoritmo de coincidencia difusa para sugerir correspondencias automáticamente con independencia de la posición de columnas.
   - Construir interfaz visual de correspondencia en el modal de importación.
2. **[F35-Task02] Normalizador de tipos de datos, formatos regionales y preservación de identificadores:**
   - Configurar SheetJS y el motor backend para preservar ceros a la izquierda (`raw: false` / formato texto estricto).
   - Manejar fechas ambiguas y cantidades monetarias con formatos regionales configurables (`DD/MM/AAAA` vs `MM/DD/AAAA`, coma vs punto decimal).
3. **[F35-Task03] Validación de referencias relacionales y detección inteligente de duplicados:**
   - Validar existencia de entidades vinculadas (estudiantes, matrículas, cuentas) antes de confirmar.
   - Detectar duplicados internos en el archivo y externos en la base de datos, categorizando en `Crear`, `Actualizar`, `Omitir` o `Conflicto`.
4. **[F35-Task04] Simulación obligatoria en vista previa y ejecución atómica por lotes:**
   - Exigir paso de previsualización con resumen cuantitativo antes de habilitar confirmación.
   - Ejecutar la persistencia real en las hojas de destino con `LockService` y clave de idempotencia por lote.
5. **[F35-Task05] Historial estructurado y motor de reversión selectiva de importaciones:**
   - Registrar cada registro creado/actualizado vinculado a su `ejecucionId`.
   - Implementar `revertImportBatch(payload)` para revertir de forma segura registros que no hayan sufrido modificaciones posteriores.

### Bloque P1: Perfiles, Asistente y Rendimiento
6. **[F35-Task06] Perfiles de mapeo reutilizables por formato y origen:**
   - Guardar plantillas de correspondencia en `PerfilesMapeoImportacion` para reutilización automática en cargas periódicas.
7. **[F35-Task07] Descarga de informes de error y registros observados:**
   - Generar reporte CSV descargable con el motivo específico de fallo por fila y columna.
8. **[F35-Task08] Procesamiento por bloques y respaldo del archivo de trabajo:**
   - Fragmentar archivos de más de 200 filas en lotes secuenciales para evitar agotamiento de cuotas GAS.
   - Almacenar copia de trabajo en Google Drive para trazabilidad forense.

### Bloque P2: Experiencia y Usabilidad
9. **[F35-Task09] Asistente guiado responsivo en 4 pasos:**
   - Rediseñar el modal `#modal-excel-importer` con indicador de pasos (1. Carga -> 2. Mapeo -> 3. Simulación -> 4. Resultados).

---

## H. COBERTURA CUANTITATIVA Y CONCLUSIÓN

- **Total de Subcapacidades Evaluadas:** 20 (F35-01 a F35-20)
- **Inspección de Código y Repositorio:** 100%
- **Pruebas de Escenarios Ejecutadas:** 12 (PT-F35-01 a PT-F35-12)
- **Distribución de Estados Funcionales:**
  - *Completa y Verificada:* 1 (5.0%)
  - *Implementada Parcialmente:* 6 (30.0%)
  - *Requiere Mejoras:* 7 (35.0%)
  - *Ausente:* 5 (25.0%)
  - *Defectuosa:* 1 (5.0%)
- **Cobertura de Verificación Satisfactoria:** 35.0%
- **Dictamen:** **NO APROBADA PARA CERTIFICACIÓN FINAL** debido a la falta de mapeo semántico interactivo, la ausencia de validación relacional contra la base de datos, el truncamiento de ceros en identificadores y la carencia de reversión segura de lotes.
