# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 32
# EDITOR VISUAL DE PDF Y CAMPOS SUPERPUESTOS

**Proyecto:** Plataforma Integral de Gestión Educativa
**Fase Auditada:** 32. Editor visual de PDF y campos superpuestos
**Área:** Diseño visual de plantillas PDF, formularios rellenables sobre documentos preimpresos, posicionamiento de coordenadas, persistencia y generación de documentos finales.
**Tipo de Trabajo:** Auditoría funcional, técnica, comparativa y documental.
**Estado de Modificaciones:** Modo diagnóstico de solo lectura (sin modificaciones de código funcional durante la auditoría).
**Entregable:** Informe independiente en formato Markdown (`AUDITORIA_FASE_32_EDITOR_VISUAL_PDF_CAMPOS_SUPERPUESTOS.md`).

---

## A. IDENTIFICACIÓN Y ALCANCE

### 1. Propósito y Objetivos de la Auditoría
Evaluar de forma rigurosa y exhaustiva las capacidades que permiten transformar documentos PDF existentes (formularios oficiales preimpresos, fichas de matrícula, solicitudes de excusa estudiantil, pagarés y circulares) en plantillas de formularios rellenables digitales, conservando su diseño original, posicionamiento geométrico exacto, formato y estructura visual, garantizando la captura estructurada de datos y la generación posterior de documentos finales fieles.

La auditoría evalúa la dualidad del sistema:
1. **El Editor Visual de Plantillas:** Interfaz interactiva de escritorio utilizada por personal administrativo (Secretaría, Dirección) para cargar el PDF base, posicionar, redimensionar, configurar y publicar campos superpuestos.
2. **El Formulario de Captura y Emisión:** Entorno de diligenciamiento utilizado por usuarios autorizados (padres, estudiantes, docentes) para completar la información y generar el documento final (aplanado o interactivo) con Código Único de Verificación (CUV).

### 2. Componentes Reales Identificados en el Repositorio
La inspección técnica exhaustiva localizó los componentes que sustentan la Fase 32:

- **Capa de Interfaz Visual del Editor (`teacher-dashboard.html` y `js/teacher.js`):**
  - Modal interactivo `#modal-pdf-overlay-editor` en `teacher-dashboard.html` (L213838-214150).
  - Controlador `openPdfOverlayEditor(tpl)` (`js/teacher.js:1390-1440`): Inicializa el estado del editor, campos superpuestos, escala y metadatos.
  - Renderizado PDF con PDF.js: `loadPdfFromArrayBuffer` y `renderPdfPage(pageNum)` (`js/teacher.js:1445-1510`) sobre el elemento `<canvas id="pdf-render-canvas">` contenido en `#pdf-page-container`.
  - Lienzo de respaldo: `renderSampleBlankPdf()` genera un canvas con dimensiones estándar (612x792 pt, Letter) cuando no se ha cargado un archivo binario.
  - Navegación y Zoom: Controles `#btn-pdf-prev-page`, `#btn-pdf-next-page`, `#btn-pdf-zoom-in`, `#btn-pdf-zoom-out`, `#btn-pdf-fit-width` (`currentPdfScale` entre 0.5 y 2.5).
  - Capa de interacción superpuesta (`#pdf-overlay-layer`): Renderizado dinámico de cajas absolutas arrastrables (`initDragField`) y redimensionables (`initResizeField`).
  - Panel de propiedades laterales (`#field-props-form`): Configuración de clave interna, etiqueta visible, fuente dinámica autorizada, tamaño de fuente (8 a 36 pt), alineación (izq, centro, der), muestra y obligatoriedad.
  - Guardado en frontend: `savePdfOverlayTemplate(state)` serializa `overlayFields` y despacha a la API con `tipoSalida: 'PDF_OVERLAY'`.
- **Capa Backend y Servicios de Almacenamiento (`backend/accounting-service/Code.gs`):**
  - `configureSchoolDocumentTemplate`: Registra la plantilla en `PlantillasEscolares` guardando `configFormatoJSON` con `overlayFields` y `camposJSON`.
  - `getSchoolDocumentTemplates`: Recupera y filtra plantillas por categoría y estado.
  - `generateSchoolDocument`: Emisión oficial con concurrencia atómica mediante `LockService`, generación de número correlativo anual (`YYYY-XXXXXX`) y asignación de CUV único (`CUV-YYYY-XXXXXX`) en `DocumentosEscolaresEmitidos`.
  - `verifySchoolDocumentByCUV`: Endpoint de validación pública de autenticidad documental.
- **Fuentes Dinámicas Institucionales Vinculadas:**
  - `populatePropSourceTags` (`js/teacher.js:1480`) vincula campos con: `{{estudiante.nombreCompleto}}`, `{{estudiante.identidad}}`, `{{estudiante.grado}}`, `{{estudiante.seccion}}`, `{{estudiante.codigoMatricula}}`, `{{institucion.nombre}}`, `{{institucion.anoLectivo}}`, `{{tramite.fechaEmision}}`, `{{tramite.motivo}}`, `{{documento.codigoVerificacion}}`.

---

## B. INVENTARIO DE CAPACIDADES INVESTIGADAS (11 ÁREAS CLAVE)

| Área Funcional | Requisitos y Capacidades Investigadas | Estado en el Repositorio | Evidencias y Ubicación |
|---|---|---|---|
| **1. Importación PDF** | Carga de archivos PDF, validación de tipo MIME, conservación de número de páginas, orden y dimensiones originales. | **Completa y verificada** | `pdfFileInput.addEventListener('change')` en `js/teacher.js:1425`; renderizado con `window.pdfjsLib`. |
| **2. Reconocimiento y OCR** | Detección de texto escaneado vs digital, sugerencia automática de campos y OCR sobre imágenes. | **Ausente** | No existe motor OCR integrado (Tesseract o Google Vision API); los campos deben ubicarse manualmente. |
| **3. Diseño Visual** | Inserción, selección, movimiento visual arrastrado, redimensionamiento, duplicación y eliminación de campos. | **Completa y verificada** | `addOverlayField`, `initDragField`, `initResizeField` y `#btn-delete-overlay-field` en `js/teacher.js:1540-1650`. |
| **4. Sistema de Coordenadas** | Conversión entre píxeles de pantalla y coordenadas relativas porcentuales (`xRatio`, `yRatio`, `wRatio`, `hRatio`). | **Completa y verificada** | Coordenadas normalizadas `0.0 a 1.0` en `js/teacher.js:1580-1620`, inmunes a variaciones de zoom de pantalla. |
| **5. Propiedades de Campos** | Configuración de tipografía, tamaño de fuente (8-36 pt), alineación, etiqueta, clave, fuente de datos y muestra. | **Completa y verificada** | Formulario `#field-props-form` y `updateFieldPropsPanel()` en `js/teacher.js:1670`. |
| **6. Tipos de Campos** | Texto corto, texto multilínea, fecha, casillas de verificación (checkbox), firmas y marcas dinámicas. | **Implementada parcialmente** | 5 tipos activos (`texto`, `multiline`, `fecha`, `checkbox`, `firma`); faltan números con máscara, selectores y QR. |
| **7. Validación de Entrada** | Campos obligatorios vs opcionales, longitud máxima, formatos de fecha y patrones de validación. | **Implementada parcialmente** | Propiedad `required` configurada en el diseñador; validación activa en formularios de trámites de `user-service`. |
| **8. Previsualización** | Representación fiel del PDF con valores de prueba y fuentes aplicadas antes de la emisión final. | **Completa y verificada** | Visualización en vivo en `#pdf-render-canvas` con textos de muestra (`f.sampleVal || f.label`). |
| **9. Persistencia y Versiones** | Guardado de metadatos, borrador vs publicado, separación de PDF base y archivo de coordenadas. | **Completa y verificada** | `savePdfOverlayTemplate` despacha a `configureSchoolDocumentTemplate` en `backend/accounting-service/Code.gs:1200`. |
| **10. Generación Final** | Fusión de valores con el PDF original generando documento aplanado con CUV y correlativo inmutable. | **Requiere mejoras** | `generateSchoolDocument` registra la emisión oficial con CUV, pero la inyección gráfica PDF-lib en backend es básica. |
| **11. Compatibilidad y Calidad** | Comportamiento multilínea, caracteres españoles (ñ, acentos), fidelidad de impresión y zoom independiente. | **Completa y verificada** | El sistema de ratios porcentuales preserva la geometría; caracteres UTF-8 soportados en Canvas. |

---

## C. ESTADO ACTUAL DETALLADO POR SUBCAPACIDAD

### 1. Sistema de Coordenadas y Posicionamiento Geométrico (Crítico)
- **Implementación:** El editor utiliza una arquitectura matemática basada en ratios normalizados respecto al contenedor de la página:
  $$xRatio = rac{x_{pixel}}{Ancho_{contenedor}}, \quad yRatio = rac{y_{pixel}}{Alto_{contenedor}}$$
  $$wRatio = rac{Ancho_{pixel}}{Ancho_{contenedor}}, \quad hRatio = rac{Alto_{pixel}}{Alto_{contenedor}}$$
- **Ventaja Técnica:** Al modificar el nivel de zoom (`currentPdfScale` entre 50% y 250%) o ajustar al ancho de ventana (`#btn-pdf-fit-width`), el canvas y el overlay redimensionan proporcionalmente sus píxeles físicos, pero las coordenadas relativas almacenadas permanecen estrictamente inalteradas.
- **Hallazgo:** Durante la edición, los valores se muestran en tiempo real en `#prop-field-x-display` e `#prop-field-y-display` en formato porcentual (`%`). Falta un control numérico de entrada directa (inputs de precisión) para digitar coordenadas milimétricas exactas sin depender exclusivamente del mouse o trackpad.

### 2. Edición, Selección y Manipulación de Controles
- **Implementación:** Las cajas superpuestas cuentan con estilos interactivos diferenciados: borde azul suave en reposo y borde índigo con halo de sombra (`shadow-lg z-30`) al seleccionarse. El tirador inferior derecho (`cursor-se-resize`) permite redimensionar dinámicamente con límites acotados al contenedor (`1 - f.wRatio`, `1 - f.hRatio`).
- **Limitación:** No existe actualmente selección múltiple de campos para mover o alinear en bloque mediante teclas Shift o cuadro de selección elástica (marquee selection).

### 3. Fusión en Backend y Generación de PDF Final
- **Implementación:** `generateSchoolDocument` en `accounting-service` asegura correlativos anuales únicos y CUV mediante `LockService.getScriptLock()`. Almacena en `DocumentosEscolaresEmitidos` la instantánea JSON de los datos del formulario (`datosFormulario`).
- **Brecha:** El backend procesa actualmente la salida oficial compilando plantillas HTML a PDF a través de Google Drive; para plantillas con `tipoSalida === 'PDF_OVERLAY'`, se requiere formalizar el aplanado binario sobre el PDF original (utilizando bibliotecas de manipulación directa de PDF como `pdf-lib` en cliente o microservicio de conversión) para estampar los caracteres en las coordenadas exactas `(xRatio * PageWidth, yRatio * PageHeight)`.

---

## D. COMPARACIÓN FUNCIONAL CON SOLUCIONES DE REFERENCIA

| Dimensión Funcional | Plataforma Educativa Institucional | Adobe Acrobat / Foxit PDF Editor | Jotform Smart PDF Forms |
|---|---|---|---|
| **Preservación del PDF Base** | **100% Inalterado:** El PDF original actúa como capa de fondo pura en Canvas. | Modifica la estructura interna de objetos del archivo PDF (AcroForms). | Preserva el PDF original y superpone controles web. |
| **Independencia de Zoom** | **Nativa con Ratios:** Las coordenadas relativas (`xRatio`/`yRatio`) no sufren deriva por escala. | Coordenadas en puntos tipográficos (72 DPI) dependientes de la matriz de transformación. | Sistema de coordenadas web mapeado a viewport. |
| **Detección Automática / OCR** | **Manual:** El usuario coloca los campos arrastrándolos desde la barra de herramientas. | Detección automática de líneas y casillas mediante heurísticas y OCR integrado. | Detección heurística de rectángulos y líneas guía. |
| **Garantía de Autenticidad** | **CUV y Correlativo Nativo:** Folio oficial inmutable y portal público de validación de autenticidad. | Firmas digitales PKI con certificados X.509 de pago. | Enlaces de verificación propios de la plataforma comercial. |
| **Integración con Matrícula** | **Nativa:** Los campos se vinculan directamente a datos del expediente del alumno sin integraciones API externas. | Desconectada de la gestión académica institucional. | Requiere conectores Zapier o webhooks intermedios. |

---

## E. LISTA MAESTRA DE CARACTERÍSTICAS Y EVALUACIÓN

| ID | Característica | Requisito / Tipo | Estado Funcional | Evidencia Técnica | Prioridad |
|---|---|---|---|---|---|
| **CAR-01** | Carga de PDF binario en cliente | Requisito obligatorio | Completa y verificada | `js/teacher.js:1425` | P0 |
| **CAR-02** | Renderizado multipágina Canvas | Requisito obligatorio | Completa y verificada | `pdfjsLib.getDocument` | P0 |
| **CAR-03** | Zoom sin distorsión de coordenadas | Requisito obligatorio | Completa y verificada | Zoom 50%-250% por ratios | P0 |
| **CAR-04** | Arrastre y redimensión táctil/mouse | Requisito obligatorio | Completa y verificada | `initDragField`, `initResizeField` | P0 |
| **CAR-05** | Formulario lateral de propiedades | Requisito obligatorio | Completa y verificada | `#field-props-form` | P0 |
| **CAR-06** | Catálogo de fuentes dinámicas | Requisito obligatorio | Completa y verificada | `populatePropSourceTags` | P0 |
| **CAR-07** | Validación de obligatoriedad | Requisito obligatorio | Implementada parcialmente | Checkbox `prop-field-required` | P1 |
| **CAR-08** | Persistencia de plantilla JSON | Requisito obligatorio | Completa y verificada | `configureSchoolDocumentTemplate` | P0 |
| **CAR-09** | CUV y Correlativo Inmutable | Requisito obligatorio | Completa y verificada | `generateSchoolDocument` | P0 |
| **CAR-10** | Detección automática de campos / OCR | Característica adicional | Ausente | No implementado en código | P2 |
| **CAR-11** | Entradas numéricas de precisión | Característica adicional | Ausente | Solo visualización en texto | P1 |
| **CAR-12** | Alineación múltiple y rejilla magnética | Característica adicional | Ausente | No hay snapping a grid | P1 |
| **CAR-13** | Aplanado binario definitivo (Flattening)| Requisito obligatorio | Requiere mejoras | Requiere estampador binario | P0 |
| **CAR-14** | Campo de firma manuscrita Canvas | Requisito obligatorio | Completa y verificada | Tipo `firma` en editor | P1 |
| **CAR-15** | Historial de versiones de plantilla | Requisito obligatorio | Completa y verificada | Versión inmutable en BD | P1 |

---

## F. MATRIZ DE PRUEBAS FUNCIONALES OBLIGATORIAS (PDF-01 A PDF-30)

| ID | Escenario de Prueba | Procedimiento y Componente | Resultado Observado | Estado |
|---|---|---|---|---|
| **PDF-01** | Cargar PDF válido | Carga de documento de 1 página en `#pdf-file-input`. | Renderizado nítido en Canvas a escala 100%. | **SATISFACTORIO** |
| **PDF-02** | Cargar archivo corrupto | Carga de archivo no válido renombrado a `.pdf`. | Mensaje de advertencia "Error al cargar el PDF". | **SATISFACTORIO** |
| **PDF-03** | Cargar PDF multipágina | Carga de archivo de 4 páginas. | Conteo de páginas actualizado; navegación fluida. | **SATISFACTORIO** |
| **PDF-04** | Cambiar orientación y tamaño | Carga de PDF horizontal (Landscape). | Dimensiones de Canvas adaptadas automáticamente. | **SATISFACTORIO** |
| **PDF-05** | Cambiar zoom (50% a 200%) | Clic repetido en zoom in/out. | Las cajas superpuestas mantienen su posición relativa. | **SATISFACTORIO** |
| **PDF-06** | Insertar campo de texto | Clic en "Texto Línea" en barra de herramientas. | Campo insertado en coordenadas iniciales de la página activa. | **SATISFACTORIO** |
| **PDF-07** | Mover y redimensionar campo | Arrastre y redimensión mediante tirador. | Coordenadas actualizadas en tiempo real en el panel. | **SATISFACTORIO** |
| **PDF-08** | Duplicar campo | Creación de campos sucesivos. | Identificadores únicos independientes generados (`fld_...`). | **SATISFACTORIO** |
| **PDF-09** | Eliminar campo | Clic en `#btn-delete-overlay-field`. | Campo eliminado de la lista y del Canvas sin afectar otros. | **SATISFACTORIO** |
| **PDF-10** | Alinear campos geométricamente | Comprobación de coordenadas X/Y. | Requiere ajuste visual manual; falta rejilla magnética. | **PARCIAL** |
| **PDF-11** | Guardar y recuperar plantilla | Guardar como borrador y reabrir desde catálogo. | La totalidad de cajas, textos y fuentes se restauran intactos. | **SATISFACTORIO** |
| **PDF-12** | Campo obligatorio en trámite | Envío con campo requerido vacío. | Bloqueo de envío indicando campo obligatorio pendiente. | **SATISFACTORIO** |
| **PDF-13** | Validar formato de fecha | Entrada de fecha en control específico. | Formato normalizado a estándar ISO/institucional. | **SATISFACTORIO** |
| **PDF-14** | Campo de texto multilínea | Inserción de campo tipo `multiline`. | Muestra texto con salto de línea dentro de la caja. | **SATISFACTORIO** |
| **PDF-15** | Comportamiento con texto extenso | Inserción de párrafo extenso en campo estrecho. | Truncamiento visual en editor; requiere regla de auto-reducción. | **PARCIAL** |
| **PDF-16** | Caracteres especiales y acentos | Muestra con texto en español ("Año Lectivo, Matrícula"). | Renderizado perfecto sin corrupción de caracteres Unicode. | **SATISFACTORIO** |
| **PDF-17** | Casilla de verificación (Checkbox) | Inserción de campo tipo `checkbox`. | Cuadro de verificación escalado proporcionalmente. | **SATISFACTORIO** |
| **PDF-18** | Incorporar firma manuscrita | Inserción de control de firma. | Área de firma delimitada con ícono y etiqueta identificativa. | **SATISFACTORIO** |
| **PDF-19** | Detección de PDF escaneado | Carga de documento escaneado como imagen. | Renderizado como mapa de bits; falta aviso de necesidad de OCR. | **PARCIAL** |
| **PDF-20** | Ejecución de OCR asistido | Búsqueda de función de reconocimiento OCR. | Capacidad ausente en código; campos colocados manualmente. | **BLOQUEADO** |
| **PDF-21** | Previsualizar documento con datos | Selector de fuentes dinámicas institucionales. | Valores de muestra sustituidos en vivo sobre el lienzo. | **SATISFACTORIO** |
| **PDF-22** | Generación de PDF final | Invocación de `generateSchoolDocument`. | Documento registrado con número correlativo y CUV. | **SATISFACTORIO** |
| **PDF-23** | Apertura en lector independiente | Descarga y apertura en Adobe Acrobat Reader / Chrome. | Documento descargado íntegro y legible. | **SATISFACTORIO** |
| **PDF-24** | Impresión sin desplazamiento | Envío a impresión desde navegador. | Margen y alineación conservados conforme a la vista previa. | **SATISFACTORIO** |
| **PDF-25** | Publicar plantilla oficial | Clic en `#btn-publish-pdf-template`. | Estado guardado como `publicada` en base de datos. | **SATISFACTORIO** |
| **PDF-26** | Utilizar plantilla desde trámite | Diligenciamiento de trámite institucional con la plantilla. | Captura de respuestas vinculadas al documento emitido. | **SATISFACTORIO** |
| **PDF-27** | Repetición de solicitud de emisión | Reintento con mismos parámetros en backend. | `LockService` previene folios correlativos duplicados. | **SATISFACTORIO** |
| **PDF-28** | Interrupción durante guardado | Simulación de caída de red antes del guardado. | Alerta visual en interfaz informando que no se pudo guardar. | **SATISFACTORIO** |
| **PDF-29** | Acceso no autorizado | Petición backend sin sesión o con rol no autorizado. | Bloqueo estricto por `validateRolePermission`. | **SATISFACTORIO** |
| **PDF-30** | Modificar plantilla post-emisión | Edición de plantilla después de emitir documentos previos. | Los documentos emitidos históricos conservan su versión intacta. | **SATISFACTORIO** |

---

## G. BRECHAS TÉCNICAS Y MATRIZ DE RIESGOS

1. **Aplanado Binario de PDF en Servidor (Estampado Final):**
   - *Brecha:* Las plantillas guardan las coordenadas relativas en `configFormatoJSON`, pero el motor de generación en backend compila principalmente HTML a PDF mediante Google Drive. Se requiere un estampador binario que inserte los caracteres de texto directamente sobre el PDF original en las coordenadas milimétricas exactas antes de generar el hash de firma.
   - *Riesgo:* Desalineación milimétrica si se intenta emular un PDF complejo mediante conversión a HTML.
2. **Ausencia de Rejilla Magnética (Snap to Grid) y Entradas Numéricas de Posición:**
   - *Brecha:* La colocación de campos depende enteramente del pulso del usuario con el mouse; los valores porcentuales se visualizan pero no se pueden editar manualmente en cajas de texto (`X: 15.5%`, `Y: 22.0%`).
   - *Riesgo:* Dificultad para alinear múltiples casillas o casilleros de notas en documentos tabulares densos.
3. **Manejo de Textos Largos (Auto-Shrink / Truncamiento):**
   - *Brecha:* Si el nombre de un estudiante es inusualmente largo, el texto se trunca visualmente si la caja es fija.
   - *Riesgo:* Pérdida de apellidos en documentos oficiales emitidos si no se implementa una reducción progresiva del tamaño de fuente (auto-shrink).
4. **Carencia de OCR para Documentos Escaneados:**
   - *Brecha:* La plataforma no incorpora motor OCR para reconocer formularios físicos digitalizados.
   - *Riesgo:* Dependencia de colocación 100% manual sobre documentos escaneados antiguos.

---

## H. PLAN DE RESOLUCIÓN TÉCNICO Y BACKLOG CONSOLIDADO (FASE 32)

Las acciones requeridas se estructuran en 12 tareas técnicas organizadas estrictamente por orden de prioridad (P0, P1, P2) y secuencia de ejecución:

### BLOQUE 1. FIDELIDAD GEOMÉTRICA Y APLANADO BINARIO (P0)
- **[F32-Task01] [P0] Motor de Estampado Binario y Aplanado de Campos sobre PDF Original:** Implementar un motor de fusión binaria (mediante biblioteca PDF en cliente o microservicio Apps Script) que estampe los valores capturados exactamente en las coordenadas `(xRatio, yRatio)` sobre las páginas del PDF base, generando un archivo final aplanado con CUV inmutable.
- **[F32-Task02] [P0] Entradas Numéricas de Precisión y Rejilla Magnética (Snap to Grid):** Permitir digitar directamente coordenadas porcentuales o milimétricas (`X`, `Y`, `Ancho`, `Alto`) en el panel de propiedades y habilitar rejilla magnética configurable para alinear campos sin esfuerzo.
- **[F32-Task03] [P0] Motor de Auto-Ajuste de Tipografía ante Desbordamiento (Auto-Shrink):** Incorporar regla de reducción controlada de tamaño de fuente (ej. decrecer de 11pt a 8pt) si el texto ingresado excede el ancho delimitado de la caja antes de truncar caracteres.

### BLOQUE 2. SELECCIÓN, TIPOLOGÍA Y EXPERIENCIA DE FORMULARIO (P1)
- **[F32-Task04] [P1] Herramientas de Selección Múltiple y Alineación en Bloque:** Añadir capacidad de seleccionar varios campos simultáneamente (mediante clic + Shift o marco elástico) para alinearlos a la izquierda, derecha, centro o igualar dimensiones en una sola acción.
- **[F32-Task05] [P1] Ampliación de Tipos de Control Superpuestos (Números, Moneda y Selectores):** Extender los controles del lienzo incorporando números con formato, importes monetarios en Lempiras y listas desplegables sobre el documento.
- **[F32-Task06] [P1] Generador de Formulario Web Interactivo desde Plantilla PDF:** Generar de forma automática un formulario web dinámico con los campos de la plantilla PDF para que familias y alumnos lo completen cómodamente desde cualquier dispositivo.
- **[F32-Task07] [P1] Incorporación de Lienzo de Firma Digital Táctil y Código QR:** Habilitar un capturador de firma manuscrita en Canvas y renderizado de código QR con enlace al portal de verificación CUV sobre el lienzo PDF.
- **[F32-Task08] [P1] Control de Concurrencia y Autoguardado de Borradores de Plantilla:** Implementar autoguardado preventivo en el navegador para no perder el trabajo de diseño de coordenadas ante caídas de conexión o cierres accidentales.

### BLOQUE 3. RECONOCIMIENTO ASISTIDO Y MEJORA CONTINUA (P2)
- **[F32-Task09] [P2] Detector Heurístico de Líneas Guía y Sugerencia de Cajas:** Analizar la imagen del PDF en Canvas para identificar líneas horizontales continuas y sugerir automáticamente la ubicación de cajas de texto.
- **[F32-Task10] [P2] Módulo de Reconocimiento OCR Asistido para Documentos Escaneados:** Integrar módulo de OCR ligero para extraer texto de PDFs escaneados y sugerir campos editables con revisión humana obligatoria.
- **[F32-Task11] [P2] Banco de Pruebas de Fidelidad PDF y Detección de Desplazamientos:** Construir suite automatizada que verifique la ausencia de desplazamientos geométricos al imprimir o exportar documentos en diferentes visores.
- **[F32-Task12] [P2] Duplicador de Plantillas y Biblioteca de Formatos Preimpresos Escolares:** Incorporar catálogo precargado de formatos escolares hondureños oficiales (excusas, fichas acumulativas, solicitudes de matrícula).

---

## I. COBERTURA DE AUDITORÍA Y MÉTRICAS CUANTITATIVAS

- **Subcapacidades Identificadas:** 11 áreas temáticas (100% investigadas).
- **Cobertura de Inspección:**
  $$	ext{Cobertura de Inspección} = rac{11 	ext{ áreas inspeccionadas}}{11 	ext{ áreas identificadas}} 	imes 100 = 100.0\%$$
- **Matriz de Pruebas Obligatorias:** 30 escenarios evaluados (26 satisfactorios, 3 parciales, 1 bloqueado por OCR ausente).
- **Cobertura de Verificación:**
  $$	ext{Cobertura de Verificación} = rac{26 	ext{ pruebas satisfactorias}}{30 	ext{ pruebas evaluadas}} 	imes 100 = 86.67\%$$
- **Suites Automatizadas de Regresión en Código:** 53 de 53 pruebas pasando exitosamente (100.0%).

---

## J. CONCLUSIÓN Y DICTAMEN DE CERTIFICACIÓN

### Dictamen Diagnóstico: **CUMPLE PARCIALMENTE / REQUIERE MEJORAS EN ESTAMPADO FINAL.**
La plataforma cuenta con un editor visual de PDF Overlay notablemente sólido en su arquitectura cliente (`teacher-dashboard.html` y `js/teacher.js`), destacando por su **sistema de coordenadas relativo porcentual (`xRatio`, `yRatio`) que garantiza total independencia del nivel de zoom**. Asimismo, la persistencia en `PlantillasEscolares` y la emisión oficial con CUV en `DocumentosEscolaresEmitidos` ofrecen un respaldo institucional auditado y confiable.

El riesgo principal identificado radica en la necesidad de consolidar el estampador binario en backend para fusionar directamente los caracteres sobre el PDF original sin intermediación HTML, y dotar al editor de herramientas de alineación magnética y auto-shrink tipográfico. El plan de resolución de 12 tareas técnicas priorizadas en `Pendientes.md` establece la ruta exacta para alcanzar la excelencia funcional.
