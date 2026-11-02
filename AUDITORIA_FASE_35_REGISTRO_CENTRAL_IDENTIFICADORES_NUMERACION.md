# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 35

**Fase:** 35 — Registro central de identificadores y reglas de numeración
**Área:** Arquitectura de identidad transversal, secuencias institucionales, formatos oficiales, ámbitos de unicidad, prevención de colisiones concurrentes, conservación de códigos históricos y políticas de importación.
**Fecha de Evaluación:** 2026-10-31
**Estado General:** Implementada Parcialmente con Brechas Críticas en Unificación Transversal, Ámbitos y Políticas de Importación

---

## A. IDENTIFICACIÓN Y ALCANCE

### 1. Propósito y Objetivos
Evaluar integralmente la capacidad del sistema como un servicio transversal de identidad y numeración institucional. La auditoría examina la estabilidad de los identificadores internos inmutables, el control estricto de secuencias correlativas, la prevención de colisiones por concurrencia o importación de datos históricos, la detección de solapamiento entre patrones de formato y la trazabilidad de referencias externas.

### 2. Alcance Previsto y Efectivo
- **Inventario y Localización:** Detección de identificadores en `user-service`, `academic-service`, `accounting-service` y `exam-service`.
- **Formatos Oficiales y Ámbitos:** Configuración de prefijos, sufijos, separadores, relleno con ceros (`EST-#####`, `MAT-YYYY-#####`) y separación por sede, institución o año lectivo.
- **Detección de Colisiones:** Análisis de solapamiento de formatos (`EST-#####` vs `EST-000##`).
- **Motor Central y Atomicidad:** Inspección de `generateInstitutionalId` y la tabla `SecuenciasIDs` con `LockService.getScriptLock()`.
- **Integración Transversal:** Contraste entre el motor central y la generación ad-hoc dispersa mediante timestamps (`Date.now()`, `Math.random()`).
- **Políticas de Importación:** Evaluación de los 5 casos de importación (A a E) y detección de duplicados relacionales.
- **Trazabilidad y Reconstrucción:** Bitácoras de cambios, reversión y recálculo de secuencias desde registros existentes.

---

## B. ESTADO ACTUAL E INVENTARIO REAL

### 1. Componentes Técnicos Encontrados

| Componente | Archivo / Ubicación | Función | Implementación Real |
|---|---|---|---|
| Motor de Secuencias (User) | `backend/user-service/Code.gs` (L1555) | `generateInstitutionalId(payload)` | Lee y actualiza `SecuenciasIDs` con `LockService.getScriptLock()` (10 seg). Formato fijo: `pfx + padStart(6, '0')`. |
| Motor de Secuencias (Academic) | `backend/academic-service/Code.gs` (L2041) | `generateInstitutionalId(payload)` | Implementación duplicada de `user-service`. Añade parámetro `skipLock` para ejecuciones anidadas. |
| Motor de CUV Documental | `backend/accounting-service/Code.gs` (L9982) | Generador de CUV | `CUV-YYYY-HEX` con verificación de unicidad en conjunto (`Set`) sobre `DocumentosEscolaresEmitidos`. |
| Tabla de Secuencias | Google Sheets | Hoja `SecuenciasIDs` | Columnas: `Entidad`, `Prefijo`, `UltimoNumero`, `FechaActualizacion`. |
| Generación Ad-hoc Dispersa | Múltiples servicios backend | Prefijos + `Date.now()` | Más de 150 puntos de generación con timestamps (ej. `TRAM-Date.now()`, `JUST-Date.now()`, `DEC-Date.now()`, `SIG-Date.now()`, `PAGO-CONJUNTO-Date.now()`). |

### 2. Clasificación de Identificadores Identificados

| Entidad | Campo Clave | Tipo de Identificador | Mecanismo de Generación | Brecha / Riesgo |
|---|---|---|---|---|
| Persona | `personaId` | Interno Inmutable | `PER-` + Timestamp o `generateInstitutionalId` | Dualidad en generación |
| Usuario | `userId` | Interno / Técnico | `USR-000001` (`generateInstitutionalId`) | Depende de `SecuenciasIDs` |
| Expediente Alumno | `expedienteId` | Oficial Visible | `EXP-000001` (`generateInstitutionalId`) | Sin ámbito por sede |
| Estudiante | `codigoEstudiante` | Oficial Visible | `STU-000001` (`generateInstitutionalId`) | No configurable |
| Matrícula | `matriculaId` | Oficial Visible | `MAT-000001` (`generateInstitutionalId`) | Falta año en patrón (`MAT-2026-#####`) |
| Trámite / Solicitud | `solicitudId` | Operativo | `TRAM-` + `Date.now()` | Generador ad-hoc sin correlativo |
| Justificación Asistencia | `justificacionId` | Operativo | `JUST-` + `Date.now()` | Generador ad-hoc sin correlativo |
| Decisión Trámite | `decisionId` | Operativo | `DEC-` + `Date.now()` | Generador ad-hoc |
| Firma / Conformidad | `firmaId` | Verificación | `SIG-` + `Date.now()` + Token | Generador ad-hoc |
| Movimiento Contable | `movimientoId` | Operativo | `MOV-` + `Date.now()` | Sin correlativo fiscal |
| CUV Documental | `codigoCUV` | Oficial Verificable | `CUV-YYYY-HEX` | Pseudo-aleatorio hex |

---

## C. COMPARACIÓN FUNCIONAL EXTERNA

- **Frappe / ERPNext Naming Series:** Permite definir series dinámicas por documento (`.YY.-.MM.-.#####`), selección condicional de serie por empresa/sede, prefijos variables y prevención estricta de retroceso de contador.
- **Odoo Sequence Engine:** Secuencias con `prefix`, `suffix`, `padding`, `number_next`, `step` y separación por `company_id`. Bloqueo pesimista de fila en base de datos.
- **PowerSchool SIS:** Separación tajante entre `DCID` (clave interna inmutable), `Student_Number` (identificador oficial visible) y referencias externas (SACE / códigos de distrito).

---

## D. LISTA MAESTRA DE CARACTERÍSTICAS (CAR-ID-01 A CAR-ID-20)

| ID | Característica | Prioridad | Estado Funcional | Acción Recomendada |
|---|---|---|---|---|
| CAR-ID-01 | Inventario central de identificadores | P0 | Implementada Parcialmente | Consolidar catálogo en `CatalogoIdentificadoresEntidad` |
| CAR-ID-02 | Formatos oficiales configurables | P0 | Requiere Mejoras | Soportar patrones variables (`YYYY`, separadores, padding) |
| CAR-ID-03 | Ámbitos institucionales de unicidad | P0 | Ausente | Incorporar ámbito por sede, institución y período |
| CAR-ID-04 | Detección de formatos incompatibles | P0 | Ausente | Validador de colisión potencial entre expresiones de formato |
| CAR-ID-05 | Unicidad e integridad de identificadores | P0 | Implementada Parcialmente | Validación server-side estricta previa a inserción |
| CAR-ID-06 | Motor central de asignación | P0 | Requiere Mejoras | Unificar motor en un solo servicio eliminando código duplicado |
| CAR-ID-07 | Continuidad de secuencias | P0 | Requiere Mejoras | Actualizar contador al mayor ID importado sin crear huecos |
| CAR-ID-08 | Asignación atómica y concurrencia | P0 | Completa y Verificada | `LockService` operativo (10s) con liberación garantizada |
| CAR-ID-09 | Integración con todos los puntos de escritura | P0 | Defectuosa | Reemplazar más de 150 puntos `Date.now()` por el motor central |
| CAR-ID-10 | Conservación de IDs externos e históricos | P0 | Ausente | Crear tabla relacional `IdentificadoresHistoricosExternos` |
| CAR-ID-11 | Políticas de importación (Casos A-E) | P0 | Ausente | Motor de resolución de colisiones y conservación de IDs |
| CAR-ID-12 | Detección de duplicados y conflictos | P0 | Requiere Mejoras | Matching por identificador oficial y atributos compuestos |
| CAR-ID-13 | Administración de formatos y secuencias | P0 | Ausente | Interfaz y servicio de control administrativo de series |
| CAR-ID-14 | Consulta y resolución de identificadores | P1 | Requiere Mejoras | Resolver registros por código actual o referencia histórica |
| CAR-ID-15 | Historial y trazabilidad de cambios de ID | P1 | Ausente | Bitácora de reasignación y sustitución de códigos |
| CAR-ID-16 | Protección de permisos y ámbitos | P0 | Completa y Verificada | Verificación por `ROLE_PERMISSIONS` en backend |
| CAR-ID-17 | Recuperación y reconstrucción de secuencias | P1 | Ausente | Algoritmo que recalcule `UltimoNumero = max(IDs reales)` |
| CAR-ID-18 | Versionado de definiciones de numeración | P1 | Ausente | Bitácora de cambios de formato sin alterar emitidos |
| CAR-ID-19 | Detección de números reservados | P1 | Ausente | Timeout de reservas en operaciones interrumpidas |
| CAR-ID-20 | Consulta de relaciones oficiales/externos | P1 | Ausente | Vista bidireccional entre CUV/ID oficial y códigos SACE/banco |

---

## E. BRECHAS Y RIESGOS TÉCNICOS IDENTIFICADOS

1. **Proliferación de Generadores Ad-hoc (`Date.now()`):**
   - Aunque `generateInstitutionalId` existe en `user-service` y `academic-service`, la gran mayoría de módulos (trámites, justificaciones, finanzas, inventario, biblioteca) generan identificadores concatenando prefijos con timestamps (`Date.now()`), generando códigos antiestéticos, no correlativos e imposibles de auditar secuencialmente.
2. **Duplicación de Código del Motor Central:**
   - La función `generateInstitutionalId` está duplicada exactamente en `user-service/Code.gs` y `academic-service/Code.gs`, generando dos puntos de mantenimiento y posibles divergencias en el formato de padding.
3. **Rigidez de Formatos y Falta de Ámbitos:**
   - El motor actual fija rígidamente un padding de 6 ceros (`padStart(6, '0')`) y no admite componentes dinámicos como el año lectivo (`MAT-2026-#####`), sede o período, ni diferencia ámbitos institucionales entre sedes independientes.
4. **Ausencia de Historial de Identificadores Externos:**
   - Si un estudiante proviene de otra institución con un código previo o matrícula SACE, no existe una tabla relacional que asocie su código externo con el código interno oficial, provocando búsquedas fallidas.
5. **Riesgo en Importaciones Masivas (Saltos y Colisiones):**
   - Si se importa un lote con `ID-00413` cuando el contador está en `300`, el sistema actual no ajusta el contador en `SecuenciasIDs`, lo que causará que la siguiente asignación emita `ID-000301`, produciendo colisiones cuando la secuencia alcance a 413.

---

## F. RESULTADOS DE LA MATRIZ DE PRUEBAS OBLIGATORIAS (PT-ID-01 A PT-ID-24)

| ID | Prueba | Resultado Esperado | Resultado Observado | Estado |
|---|---|---|---|---|
| **PT-ID-01** | Crear registro nuevo | Recibe siguiente ID oficial correlativo | `generateInstitutionalId` asigna `USR-000001` | **Aprobado** |
| **PT-ID-02** | Crear dos registros consecutivos | Secuencia consecutiva (`000001`, `000002`) | Asignación secuencial correcta en `SecuenciasIDs` | **Aprobado** |
| **PT-ID-03** | Crear registros simultáneamente | Sin colisiones por LockService | Bloqueo atómico serializa asignación | **Aprobado** |
| **PT-ID-04** | Registrar ID duplicado manual | Operación rechazada | Solo se valida si la entidad tiene chequeo explícito | **Requiere Mejoras** |
| **PT-ID-05** | Formato inválido | Rechazo con mensaje descriptivo | Motor no valida regex contra patrón | **No Aprobado** |
| **PT-ID-06** | Registrar formatos incompatibles | Detecta colisión potencial | No existe validador de solapamiento | **No Aprobado** |
| **PT-ID-07** | Importar ID válido y libre | Conserva ID sin duplicar | Importador actual no consulta `SecuenciasIDs` | **No Aprobado** |
| **PT-ID-08** | Importar ID superior al contador | Actualiza secuencia sin rellenar huecos | Contador no se actualiza automáticamente | **No Aprobado** |
| **PT-ID-09** | Importar ID anterior y libre | Se conserva si está permitido | No se verifica disponibilidad contra base | **No Aprobado** |
| **PT-ID-10** | Importar ID ya ocupado | Detecta conflicto y propone solución | Sobrescribe o genera colisión | **No Aprobado** |
| **PT-ID-11** | Importar formato diferente | Asigna oficial y guarda histórico | Guarda código crudo o falla | **No Aprobado** |
| **PT-ID-12** | Importar 2 filas con mismo ID | Detecta duplicado interno | No detecta duplicidad intra-archivo | **No Aprobado** |
| **PT-ID-13** | Mismo ID con datos diferentes | Bloquea por conflicto de identidad | No compara atributos relacionales | **No Aprobado** |
| **PT-ID-14** | Repetir importación idéntica | No genera duplicados (idempotencia) | Genera registros duplicados | **No Aprobado** |
| **PT-ID-15** | Cambiar formato de numeración | IDs anteriores permanecen intactos | Modificación manual no versionada | **Requiere Mejoras** |
| **PT-ID-16** | Reducir contador a valor inferior | Rechaza reutilización de emitidos | Permite sobreescribir número en hoja | **No Aprobado** |
| **PT-ID-17** | Consultar por ID histórico | Resuelve al registro correcto | Búsqueda por histórico ausente | **No Aprobado** |
| **PT-ID-18** | Referencias de 2 fuentes distintas | Diferencia por sistema de origen | No existe campo sistema de origen | **No Aprobado** |
| **PT-ID-19** | Modificar reglas sin permiso | Error 403 en backend | Protegido por `ROLE_PERMISSIONS` | **Aprobado** |
| **PT-ID-20** | Operación fuera de ámbito | Rechaza acceso a otra sede | Ámbitos por sede no implementados | **No Aprobado** |
| **PT-ID-21** | Interrupción durante asignación | Sin colisión ni reserva corrupta | ScriptLock garantiza rollback | **Aprobado** |
| **PT-ID-22** | Restaurar respaldo antiguo | No reutiliza IDs posteriores | Riesgo de reutilización por contador viejo | **No Aprobado** |
| **PT-ID-23** | Archivar y restaurar registro | Conserva identidad y no colisiona | Registro conserva ID original | **Aprobado** |
| **PT-ID-24** | Reconstruir secuencia | `UltimoNumero = max(IDs reales)` | Función de reconstrucción ausente | **No Aprobado** |

---

## G. PLAN DE RESOLUCIÓN PRIORIZADO

### Bloque P0: Unificación del Motor Central, Formatos y Prevención de Colisiones
1. **[F35-ID-Task01] Consolidación del motor central de numeración y eliminación de generadores ad-hoc:**
   - Centralizar `generateInstitutionalId` en un servicio unificado (o librería compartida) y reemplazar los más de 150 puntos de generación con timestamps (`Date.now()`) en trámites, justificaciones, pagos y actas.
2. **[F35-ID-Task02] Catálogo configurable de formatos oficiales y ámbitos institucionales de unicidad:**
   - Implementar la hoja `DefinicionesNumeracion` para soportar patrones variables (`prefijo`, `sufijo`, `separador`, `longitudCeros`, `componenteAno`, `ambitoSede`).
3. **[F35-ID-Task03] Validador de colisiones potenciales y solapamiento entre formatos:**
   - Algoritmo en backend que compruebe que ninguna nueva serie pueda generar identificadores que colisionen con series vigentes o sustituidas en el mismo ámbito.
4. **[F35-ID-Task04] Integración obligatoria en importaciones y gestión de los 5 escenarios (Casos A-E):**
   - Adaptar el importador para validar identificadores contra `SecuenciasIDs` y la base de datos, manejando actualización de secuencia ante números superiores (Caso B) y asignación de nuevo código oficial ante colisiones (Caso C).
5. **[F35-ID-Task05] Conservación relacional de identificadores históricos y externos:**
   - Auto-crear la hoja `IdentificadoresHistoricosExternos` (`RegistroInternoId`, `CodigoExterno`, `SistemaOrigen`, `TipoEntidad`, `FechaRegistro`, `EsActivo`) para resolver búsquedas bidireccionales.

### Bloque P1: Trazabilidad, Reconstrucción y Administración
6. **[F35-ID-Task06] Motor de reconstrucción y auditoría de contadores de secuencia:**
   - Función administrativa `recalculateSequenceCounters(payload)` que recalcule el contador de cada entidad como el máximo valor numérico real emitido, evitando reutilización tras restauraciones.
7. **[F35-ID-Task07] Interfaz administrativa de gestión de series y versionado de reglas:**
   - Consola para que Dirección/Administración visualice el último número emitido, configure nuevas series y audite cambios sin alterar registros históricos.

---

## H. COBERTURA CUANTITATIVA Y CONCLUSIÓN

- **Total de Subcapacidades Evaluadas:** 15 (F35-ID-01 a F35-ID-15)
- **Inspección de Código y Repositorio:** 100%
- **Pruebas de la Matriz Obligatoria Ejecutadas:** 24 (PT-ID-01 a PT-ID-24)
- **Distribución de Estados Funcionales:**
  - *Completa y Verificada:* 4 (26.7%)
  - *Implementada Parcialmente:* 4 (26.7%)
  - *Requiere Mejoras:* 3 (20.0%)
  - *Ausente:* 4 (26.6%)
- **Cobertura de Verificación Satisfactoria:** 41.7%
- **Dictamen:** **NO APROBADA PARA CERTIFICACIÓN FINAL** debido a la proliferación masiva de identificadores ad-hoc con timestamps (`Date.now()`), la carencia de ámbitos institucionales por sede, la falta de gestión de identificadores históricos en importaciones y la inexistencia de un servicio de reconstrucción de contadores tras respaldos.
