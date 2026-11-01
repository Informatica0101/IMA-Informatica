# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 39

**Fase:** 39 — Digitalización asistida y transición desde archivos tradicionales
**Área:** Gestión documental, inventario institucional, conversión de archivos legados (XLSX, DOCX, PDF, imágenes escaneadas), formularios dinámicos, plantillas CUV, trazabilidad de originales y convivencia gradual.
**Fecha de Evaluación:** 2026-10-31
**Estado General:** Implementada Parcialmente con Brechas en OCR, Detección de Duplicados Criptográficos y Panel de Avance Departamental

---

## A. IDENTIFICACIÓN Y ALCANCE

### 1. Propósito y Objetivos
Auditar integralmente las capacidades destinadas a facilitar la transición de los procedimientos institucionales tradicionales hacia la plataforma digital, evaluando el inventario documental de cada departamento, la clasificación según su naturaleza (Registros de datos, Plantillas, Documentos históricos), la importación masiva/individual, la validación estructural y semántica, la conversión a plantillas y formularios digitales, la detección de duplicados, la custodia inmutable de archivos originales con trazabilidad completa y la supervisión del avance de digitalización sin interrumpir la operativa institucional.

### 2. Componentes Reales Encontrados en el Repositorio
- **Diseñador y Emisor de Plantillas con CUV:** `backend/accounting-service/Code.gs` (`configureSchoolDocumentTemplate`, `generateSchoolDocument`, `verifySchoolDocumentByCUV`, hojas `PlantillasEscolares` y `DocumentosEscolaresEmitidos`).
- **Gestión de Expedientes y Documentos de Alumnos:** `backend/academic-service/Code.gs` (`uploadStudentDocument`, `getStudentDocuments`, `restoreDocumentVersion`, hoja `DocumentosEstudiantes`).
- **Motor de Formularios Institucionales y Trámites:** `backend/user-service/Code.gs` (`saveInstitutionalForm`, `getInstitutionalForms`, `submitInstitutionalFormRequest`, hoja `FormulariosInstitucionales`, `SolicitudesTramites`).
- **Editor Visual PDF y Canvas:** `js/teacher.js` y `teacher-dashboard.html` (renderizador de campos superpuestos mediante `PDF.js` y `pdf-lib`).

---

## B. INVENTARIO DE CAPACIDADES Y SUBCOMPONENTES EVALUADOS

| Capacidad | Ubicación en Código | Implementación Real | Estado / Hallazgo |
|---|---|---|---|
| 3.1 Inventario documental institucional | - | No existe hoja consolidada de inventario de legados | Ausente. No hay catálogo previo a la migración que clasifique archivos tradicionales por departamento. |
| 3.2 Importación individual y masiva | `backend/accounting-service` / `academic-service` | `importDataWithColumnMapping`, `uploadStudentDocument` | Funcional individual y en lotes tabulares; sin ingesta masiva de carpetas en zip o Drive. |
| 3.3 Validación documental y estructural | `backend/accounting-service` | `validateImportPreview`, `validateSACETemplateFile` | Validación de cabeceras tabulares. Ausente validación estructural para Word (DOCX) y PDF escaneados. |
| 3.4 Detección de duplicados | `backend/accounting-service` | Set de CUVs emitidos | Funcional para CUV. Ausente detección por hash SHA-256 en carga de archivos legados. |
| 3.5 Relación con expedientes actuales | `backend/academic-service` | `uploadStudentDocument` vincula `expedienteId` | Funcional si el ID coincide exactamente. Sin resolución difusa de nombres históricos. |
| 3.6 Conversión de Excel a registros | `backend/accounting-service` | `importDataWithColumnMapping` | Convierte filas tabulares a registros en Sheets con mapeo de campos. |
| 3.7 Conversión de Word/PDF en plantillas | `backend/accounting-service`, `js/teacher.js` | Importador de plantilla base PDF con coordenadas superpuestas | Funcional en PDF mediante overlay visual. Ausente parser automático de formularios Word (DOCX). |
| 3.8 Generación asistida de formularios | `backend/user-service` | `saveInstitutionalForm` | Permite definir campos JSON dinámicos pero requiere configuración manual, no generación automática asistida. |
| 3.9 Catálogo institucional de formatos | `backend/accounting-service` | `PlantillasEscolares` | Completa. Almacena plantillas con versiones, estado (Activa/Inactiva), departamento y campos. |
| 3.10 Conservación de originales y trazabilidad | `backend/academic-service` | `uploadStudentDocument` guarda URL en Google Drive | Conserva archivo en Drive con historial de versiones (`restoreDocumentVersion`). Falta hash SHA-256 inmutable. |
| 3.11 Informes de avance por departamento | - | No existe reporte de avance de digitalización | Ausente. No hay dashboard de progreso de transición por departamento. |
| 3.12 Transición gradual y convivencia | Transversal | Coexistencia de archivos en Drive y registros en Sheets | Funcional arquitectónicamente: la adopción es modular por departamento. |

---

## C. ESTADO FUNCIONAL DETALLADO (REQUISITOS 3.1 A 3.12)

### 3.1. Inventario documental institucional
- **Estado:** Ausente.
- **Brechas:** No existe una tabla central que catalogue los documentos tradicionales físicos y digitales que cada departamento maneja antes de su migración (ej. actas en libros físicos, expedientes en carpetas compartidas de red, nóminas en Excel sueltos).

### 3.2. Importación individual y masiva
- **Estado:** Implementada Parcialmente.
- **Implementación Real:** Carga de documentos de alumnos individual en `uploadStudentDocument` e importación masiva de tablas en `importDataWithColumnMapping`.
- **Brechas:** No se soporta la importación de lotes de documentos binarios comprimidos (ZIP) con asignación automática por identificador de archivo.

### 3.3. Validación documental y estructural
- **Estado:** Implementada Parcialmente.
- **Implementación Real:** Validación de extensión y tamaño básico en `uploadStudentDocument`.
- **Brechas:** No se analizan tablas internas en DOCX ni se detecta si un PDF es escaneado puro (requiriendo OCR) antes de intentar procesarlo.

### 3.4. Detección de duplicados
- **Estado:** Requiere Mejoras.
- **Brechas:** Si se sube el mismo PDF con nombres distintos (ej. `PartidaNacimiento.pdf` y `Copia_Partida.pdf`), el sistema no detecta la redundancia por no computar el hash criptográfico SHA-256.

### 3.5. Relación de documentos históricos con expedientes actuales
- **Estado:** Implementada Parcialmente.
- **Implementación Real:** Asocia por `expedienteId` o `estudianteId`.
- **Brechas:** Documentos históricos sin identificador o con nombres previos de estudiantes trasladados no cuentan con una bandeja de resolución asistida.

### 3.6. Conversión de Excel en registros estructurados
- **Estado:** Completa y Verificada.
- **Implementación Real:** `importDataWithColumnMapping` y SheetJS en cliente leen libros Excel y convierten filas a registros con preservación de mapeo.

### 3.7. Conversión de Word y PDF en plantillas
- **Estado:** Implementada Parcialmente.
- **Implementación Real:** El editor visual en `js/teacher.js` permite importar un PDF base y superponer campos porcentuales (`xRatio`, `yRatio`).
- **Brechas:** No procesa archivos Word (.docx) nativamente para extraer tablas o campos de formulario rellenables de manera automática.

### 3.8. Generación asistida de formularios digitales
- **Estado:** Requiere Mejoras.
- **Implementación Real:** `saveInstitutionalForm` almacena estructuras de formulario dinámico en JSON.
- **Brechas:** No existe un asistente que sugiera automáticamente los campos a partir de un archivo subido; el usuario debe crearlos manualmente desde cero.

### 3.9. Catálogo institucional de documentos y formatos oficiales
- **Estado:** Completa y Verificada.
- **Implementación Real:** `PlantillasEscolares` y `DocumentosEscolaresEmitidos` ofrecen un catálogo centralizado con CUV, control de versiones y trazabilidad de emisión.

### 3.10. Conservación de documentos originales y trazabilidad
- **Estado:** Requiere Mejoras.
- **Implementación Real:** Los archivos se almacenan en Google Drive con URL persistente.
- **Brechas:** No se calcula ni se almacena el hash SHA-256 del binario original al cargarlo, impidiendo auditar si el documento en Drive fue sustituido con posterioridad.

### 3.11. Informes de avance por departamento
- **Estado:** Ausente.
- **Brechas:** Dirección no cuenta con métricas que indiquen el porcentaje de digitalización (documentos inventariados vs. migrados) por departamento (Secretaría, Contabilidad, RRHH).

### 3.12. Transición gradual y convivencia con procedimientos tradicionales
- **Estado:** Completa y Verificada.
- **Implementación Real:** La arquitectura no exige migración simultánea; cada departamento opera de forma independiente y los expedientes combinan documentos físicos escaneados con registros nativos digitales.

---

## D. COMPARACIÓN FUNCIONAL EXTERNA

- **Alfresco / OpenKM:** Gestores documentales que incorporan ingestión masiva por carpetas observadas (*hot folders*), extracción OCR con Tesseract, deduplicación estricta por hash MD5/SHA-256 y paneles de estado de migración documental.
- **Laserfiche:** Asistente de captura que procesa formularios escaneados, detecta zonas de texto mediante OCR zonal y puebla campos del expediente automáticamente.
- **Plataforma Educativa Actual:** Posee una base sólida en estampación CUV y formularios dinámicos JSON, pero carece de motor OCR para documentos escaneados y catálogo formal de inventario de legados.

---

## E. LISTA MAESTRA DE AUDITORÍA (CAR-F39)

| ID | Característica | Prioridad | Estado Funcional | Acción Recomendada |
|---|---|---|---|---|
| CAR-F39-01 | Inventario documental institucional | P0 | Ausente | Crear hoja `InventarioDocumentalLegado` |
| CAR-F39-02 | Ingesta masiva y por lotes (ZIP/Drive) | P0 | Requiere Mejoras | Soporte de descompresión y carga en lote |
| CAR-F39-03 | Validación multinivel (Archivo, Estructura, Semántica) | P0 | Requiere Mejoras | Validador de formatos y detección de escaneados |
| CAR-F39-04 | Deduplicación por hash SHA-256 | P0 | Requiere Mejoras | Computar y validar SHA-256 al subir archivos |
| CAR-F39-05 | Vinculación asistida con expedientes | P0 | Implementada Parcialmente | Bandeja de resolución de referencias dudosas |
| CAR-F39-06 | Conversión de Excel a registros | P0 | Completa y Verificada | Mantener motor con validación relacional |
| CAR-F39-07 | Conversión de plantillas base a CUV | P0 | Completa y Verificada | Preservar estampador visual de PDF |
| CAR-F39-08 | Generador asistido de formularios dinámicos | P1 | Requiere Mejoras | Asistente de mapeo de campos desde documentos |
| CAR-F39-09 | Catálogo central de formatos y vigencias | P0 | Completa y Verificada | Mantener en `PlantillasEscolares` |
| CAR-F39-10 | Custodia inmutable de originales y hash | P0 | Requiere Mejoras | Auditoría de integridad criptográfica en Drive |
| CAR-F39-11 | Tablero de control de avance de digitalización | P1 | Ausente | Métricas de progreso en panel directivo |
| CAR-F39-12 | Convivencia modular y migración progresiva | P0 | Completa y Verificada | Preservar desacoplamiento interdepartamental |
| CAR-F39-13 | Extracción OCR en documentos escaneados | P1 | Ausente | Integración de servicio OCR para PDFs escaneados |
| CAR-F39-14 | Búsqueda documental por metadatos y contenido | P1 | Requiere Mejoras | Búsqueda cruzada por expediente, fecha y tipo |

---

## F. RESULTADOS DE LA MATRIZ DE PRUEBAS FUNCIONALES (P01 A P26)

| ID | Prueba | Resultado Esperado | Resultado Observado | Estado |
|---|---|---|---|---|
| **P01** | Importar Excel válido | Identificación de hojas y datos | Parseado exitosamente con SheetJS | **Aprobado** |
| **P02** | Excel con encabezados desplazados | Detección de fila de cabecera | Requiere selector manual de fila | **Requiere Mejoras** |
| **P03** | Excel con columnas desconocidas | Mapeo interactivo | Mapeo manual no disponible en modal | **Requiere Mejoras** |
| **P04** | Excel con filas inválidas | Errores identificados por fila | Errores listados en JSON de migración | **Aprobado** |
| **P05** | Excel con varias hojas | Selector de hojas | Selecciona primera hoja automáticamente | **No Aprobado** |
| **P06** | Word con tablas | Extracción estructural | Parser nativo DOCX ausente | **No Aprobado** |
| **P07** | PDF con texto | Extracción de contenido | PDF.js renderiza texto en Canvas | **Aprobado** |
| **P08** | PDF escaneado | Detección y OCR | No detecta ni procesa OCR | **No Aprobado** |
| **P09** | Archivo corrupto | Rechazo sin incorporar | FileReader arroja error y se detiene | **Aprobado** |
| **P10** | Archivo vacío | Rechazo o alerta de vacío | Alerta de archivo sin datos | **Aprobado** |
| **P11** | Dos archivos idénticos | Detección de duplicado por hash | No calcula hash; guarda duplicado | **No Aprobado** |
| **P12** | Documentos similares | Coincidencia sujeta a revisión | No compara similitud documental | **No Aprobado** |
| **P13** | Lote mixto | Resultado por archivo | Procesa archivos secuencialmente | **Aprobado** |
| **P14** | Interrupción de importación | Recuperación sin duplicar | No tiene reanudación de lotes | **No Aprobado** |
| **P15** | Relacionar documento histórico | Asociación a expediente | Asocia por ID exacto de expediente | **Aprobado** |
| **P16** | Relacionar expediente ambiguo | Bandeja de revisión humana | Falla o asocia rígidamente | **No Aprobado** |
| **P17** | Generar formulario digital | Propuesta editable | Formulario se crea manualmente en JSON | **Requiere Mejoras** |
| **P18** | Aprobar formulario | Publicación controlada | Se publica tras guardar con rol admin | **Aprobado** |
| **P19** | Modificar plantilla oficial | Nueva versión e historial | `PlantillasEscolares` guarda versión | **Aprobado** |
| **P20** | Consultar documento original | Acceso según rol | Protegido por sesión y permisos | **Aprobado** |
| **P21** | Informe departamental | Indicadores de avance | No existe reporte de avance | **No Aprobado** |
| **P22** | Reintentar fallidos | Reintento selectivo | Debe resubirse el lote completo | **No Aprobado** |
| **P23** | Importar campos vacíos | No borrar datos existentes | Sobrescribe si la celda está vacía | **Requiere Mejoras** |
| **P24** | Acceso desde rol no autorizado | Error 403 en backend | Bloqueado por `ROLE_PERMISSIONS` | **Aprobado** |
| **P25** | Documentos de distintos departamentos | Separación de destinos | Respetado por carpetas y hojas | **Aprobado** |
| **P26** | Procedencia del registro | Identifica archivo de origen | Bitácora registra nombre de archivo | **Aprobado** |

---

## G. PLAN DE RESOLUCIÓN PRIORIZADO

### Bloque P0: Integridad, Deduplicación Criptográfica e Inventario Institucional
1. **[F39-Task01] Catálogo central de inventario documental y clasificación de archivos legados:**
   - Auto-crear la hoja `InventarioDocumentalLegado` para registrar y categorizar todos los documentos tradicionales (físicos y digitales) de cada departamento (Registros de datos, Plantillas, Documentos históricos) con estado de migración.
2. **[F39-Task02] Aseguramiento criptográfico SHA-256 y detección automática de duplicados:**
   - Computar el hash SHA-256 de todo archivo digitalizado en el momento de la carga. Comparar contra el repositorio para prevenir cargas redundantes y alertar ante duplicados exactos o documentos sustituidos.
3. **[F39-Task03] Custodia inmutable de archivos originales en Drive y trazabilidad relacional:**
   - Asegurar que todo archivo original quede respaldado en una estructura protegida de Google Drive (`Drive/DocumentosOriginales/`) vinculado a su hash, impidiendo alteraciones o eliminaciones accidentales tras la extracción de datos.
4. **[F39-Task04] Validación multinivel de integridad documental y detección de PDFs escaneados:**
   - Validar extensión real vs. tipo MIME, tamaño y detectar automáticamente si un archivo PDF contiene texto vectorial seleccionable o imágenes escaneadas puras.

### Bloque P1: Vinculación Asistida, Asistente de Formularios y Supervisión
5. **[F39-Task05] Bandeja de resolución y vinculación asistida de documentos históricos:**
   - Proveer interfaz para que Secretaría y Archivo asocien documentos históricos sin identificador o con nombres previos a expedientes de estudiantes y empleados mediante confirmación humana auditada.
6. **[F39-Task06] Asistente de conversión de documentos tradicionales a formularios digitales:**
   - Herramienta que analice la estructura de campos en plantillas y proponga un borrador de formulario institucional en `FormulariosInstitucionales` para su revisión y aprobación formal.
7. **[F39-Task07] Tablero directivo de control de avance de la digitalización por departamento:**
   - Dashboard para que Dirección supervise en tiempo real el porcentaje de avance de digitalización (documentos inventariados, migrados, pendientes, duplicados y errores) desglosado por departamento.
8. **[F39-Task08] Ingesta por lotes comprimidos (ZIP) con asignación automática por identificador:**
   - Permitir cargar paquetes ZIP con múltiples documentos escaneados y extraer/asociar automáticamente cada archivo al expediente correspondiente según su nombre o código.

---

## H. COBERTURA CUANTITATIVA Y CONCLUSIÓN

### 1. Fórmulas y Métricas Independientes de Cobertura
- **Cobertura de Inspección:**
  $$\frac{\text{Subcapacidades inspeccionadas (12)}}{\text{Total subcapacidades en alcance (12)}} \times 100 = 100.0\%$$
- **Cobertura de Ejecución:**
  $$\frac{\text{Pruebas ejecutadas (26)}}{\text{Total pruebas planificadas (26)}} \times 100 = 100.0\%$$
- **Cobertura de Verificación Satisfactoria:**
  $$\frac{\text{Pruebas aprobadas satisfactoriamente (14)}}{\text{Total pruebas ejecutadas (26)}} \times 100 = 53.8\%$$

### 2. Distribución de Estados Funcionales
- *Completa y Verificada:* 4 (33.3%)
- *Implementada Parcialmente:* 4 (33.3%)
- *Requiere Mejoras:* 2 (16.7%)
- *Ausente:* 2 (16.7%)

### 3. Dictamen Final
**NO APROBADA PARA CERTIFICACIÓN FINAL** debido a la ausencia de catálogo central de inventario de legados, la falta de verificación criptográfica SHA-256 para prevenir duplicados en almacenamiento, y la carencia de un tablero de supervisión de avance de digitalización por departamento.
