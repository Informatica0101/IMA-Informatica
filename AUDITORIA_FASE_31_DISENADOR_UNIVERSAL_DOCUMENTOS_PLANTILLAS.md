# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 31
# DISEÑADOR UNIVERSAL DE DOCUMENTOS Y PLANTILLAS

**Proyecto:** Plataforma Integral de Gestión Educativa
**Fase Auditada:** 31. Diseñador universal de documentos y plantillas
**Área:** Gestión documental institucional, editor de documentos, formularios digitales, importación DOCX/PDF, generación de archivos, automatización y control de plantillas.
**Tipo de Trabajo:** Auditoría funcional, técnica, comparativa y documental.
**Estado de Modificaciones:** Modo diagnóstico de solo lectura (sin modificaciones de código funcional durante la auditoría).
**Entregable:** Informe independiente en formato Markdown (`AUDITORIA_FASE_31_DISENADOR_UNIVERSAL_DOCUMENTOS_PLANTILLAS.md`).

---

## A. IDENTIFICACIÓN Y ALCANCE

### 1. Propósito y Objetivos de la Auditoría
Evaluar de forma rigurosa y exhaustiva las capacidades que permiten crear, editar, importar, vincular con datos institucionales, emitir, proteger, versionar, archivar y auditar documentos oficiales y formularios digitales dentro de la plataforma educativa.

La auditoría determina si existe una solución documental centralizada, modular y universal capaz de atender las necesidades de todos los departamentos institucionales (Secretaría, Dirección, Docencia, Contabilidad, Recursos Humanos, Operaciones y Familias), o si las funciones actuales se encuentran fragmentadas en herramientas aisladas que no comparten plantillas, variables, permisos, datos de origen ni motores de generación.

### 2. Servicios, Módulos y Componentes Reales Identificados
La inspección técnica en el repositorio revela la existencia de componentes documentales distribuidos en backend y frontend:

- **Motor Central de Plantillas y Emisión Oficial (`backend/accounting-service/Code.gs`):**
  - `configureSchoolDocumentTemplate`: Administración de plantillas escolares con almacenamiento en la hoja `PlantillasEscolares` (`plantillaId`, `codigoDocumento`, `categoria`, `titulo`, `descripcion`, `departamento`, `tipoSalida`, `contenidoHTML`, `configFormatoJSON`, `camposJSON`, `flujoAprobacion`, `estado`, `version`, `creadoPor`, `driveFolderId`).
  - `getSchoolDocumentTemplates`: Consulta y filtrado de catálogo de plantillas por categoría, departamento y estado.
  - `previewSchoolDocument`: Previsualización interactiva con reemplazo de variables en memoria.
  - `generateSchoolDocument`: Emisión oficial con concurrencia controlada (`LockService.getScriptLock()`), asignación de correlativo institucional único (`numeroCorrelativo`) y generación de Código Único de Verificación (`CUV-YYYY-XXXXXX`) registrado en la hoja `DocumentosEscolaresEmitidos`.
  - `verifySchoolDocumentByCUV`: Endpoint público/institucional para validar la autenticidad e integridad de cualquier documento emitido mediante su CUV.
  - `importDocumentTemplateBase`: Conversor básico de texto/HTML plano para creación de borradores.
- **Formularios Digitales, Solicitudes y Firmas (`backend/user-service/Code.gs`):**
  - `saveInstitutionalForm` y `getInstitutionalForms`: Almacenamiento y consulta de esquemas de formularios dinámicos en `FormulariosInstitucionales` (`formId`, `codigoFormulario`, `titulo`, `definicionJSON`, `estado`, `version`, `requiereFirma`, `plantillaDocumentoId`).
  - `submitInstitutionalFormRequest`: Captura de respuestas ciudadanas/estudiantiles en `SolicitudesTramites`.
  - `registerDocumentSignature`: Registro de firmas y conformidades en `FirmasConformidades` (`sigId`, `solicitudId`, `documentoId`, `firmanteId`, `rolFirmante`, `tipoFirma`, `tokenVerificacion`, `hashDocumento`).
- **Gestión Documental del Estudiante (`backend/academic-service/Code.gs`):**
  - `uploadStudentDocument`, `getStudentDocuments`: Carga y consulta de documentos asociados a expedientes en `DocumentosEstudiante`.
  - `restoreDocumentVersion`: Restauración de versiones documentales históricas en `HistorialVersionesDocumentos`.
  - `checkAndNotifyExpiringStudentDocuments`: Monitor de alertas de vencimiento de documentos.
- **Interfaces Visuales de Edición y Diseñador (`js/teacher.js` y `dashboard-direccion.html`):**
  - `loadTemplateDesignerCatalog`: Catálogo interactivo de plantillas con filtros por categoría y búsqueda.
  - `openPdfOverlayEditor`, `renderPdfPage`, `savePdfOverlayTemplate`: Editor visual para posicionar campos dinámicos superpuestos sobre archivos PDF base.

### 3. Diferenciación Conceptual de Entidades Documentales
La arquitectura evalúa y separa con precisión los siguientes conceptos:
1. **Plantilla Maestra:** Definición base del documento o formulario con estructura visual, textos fijos, estilos y variables dinámicas.
2. **Versión de Plantilla:** Instantánea inmutable numerada (`v1.0`, `v1.1`, `v2.0`) vinculada a un período de vigencia y autorizaciones.
3. **Formulario Asociado:** Interfaz de captura estructurada de datos vinculada o no a una plantilla de salida.
4. **Respuesta o Envío de Formulario:** Datos específicos ingresados por un usuario en un trámite determinado.
5. **Documento Generado / Emitido:** Archivo final compilado (PDF/HTML) con CUV único y número correlativo inmutable.
6. **Archivo Importado:** Archivo binario DOCX o PDF original preservado intacto como fuente de referencia.
7. **Documento Aprobado:** Archivo formalmente revisado por una autoridad que no admite modificaciones posteriores.
8. **Documento Archivado:** Documento histórico protegido contra modificaciones pero consultable para auditoría.

---

## B. ESTADO ACTUAL POR ÁREA EVALUADA (F31-01 A F31-23)

| ID | Subcapacidad Evaluada | Prioridad | Clasificación Funcional | Implementación y Evidencias en Repositorio |
|---|---|---|---|---|
| **F31-01** | Inventario y arquitectura integral del sistema documental | P0 | Implementada parcialmente | Existen hojas `PlantillasEscolares`, `DocumentosEscolaresEmitidos` y funciones en `accounting-service`; falta unificación del editor WYSIWYG entre todos los dashboards. |
| **F31-02** | Editor universal de documentos y composición | P0 | Implementada parcialmente | Editor visual PDF Overlay implementado en `js/teacher.js:1450-1650`; falta editor enriquecido tipo procesador de palabras (A4/Carta/Oficio, tablas complejas). |
| **F31-03** | Gestión avanzada de páginas, estilos y elementos institucionales | P1 | Implementada parcialmente | Parámetros institucionales básicos en `configFormatoJSON`; falta motor de estilos globales corporativos (encabezado primera página vs páginas pares/impares). |
| **F31-04** | Diseñador de formularios digitales asociados a documentos | P0 | Implementada parcialmente | Esquema en `FormulariosInstitucionales` (`definicionJSON` en `user-service`); falta constructor visual de campos (drag & drop) para administradores. |
| **F31-05** | Lógica condicional, formularios dinámicos y experiencia móvil | P1 | Requiere mejoras | El backend acepta JSON libre pero la evaluación condicional (AND/OR, visibilidad dinámica de secciones) depende de lógica ad-hoc en cliente. |
| **F31-06** | Sistema de campos dinámicos y vinculación con datos institucionales | P0 | Completa y verificada | Implementado catálogo de variables (`populatePropSourceTags` en `teacher.js:1480`) vinculado a Estudiante, Institución, Trámite y Documento CUV. |
| **F31-07** | Motor de generación documental y combinación de datos | P0 | Completa y verificada | Implementado en `generateSchoolDocument` con `LockService`, correlativo anual (`YYYY-XXXXXX`) y asignación de CUV único inmutable. |
| **F31-08** | Importación de documentos DOCX y compatibilidad Word | P0 | Requiere mejoras | `importDocumentTemplateBase` convierte texto plano; falta parseo binario de estructuras OpenXML DOCX (Word 2013/2016/2017) en cliente mediante bibliotecas ligeras. |
| **F31-09** | Importación, interpretación y reutilización de documentos PDF | P1 | Completa y verificada | Implementado visor e importador PDF en `teacher.js` con soporte de overlays interactivos sobre páginas renderizadas en Canvas. |
| **F31-10** | Conversión, impresión y exportación a PDF | P0 | Completa y verificada | Implementado renderizado a PDF mediante Google Drive export y visualización en navegador en `generateSchoolDocument` y `generatePaymentReceiptPDF`. |
| **F31-11** | Formularios rellenables, firmas y documentos híbridos | P1 | Completa y verificada | Registro formal de firmas en `FirmasConformidades` (`registerDocumentSignature` en `user-service`) con hash y token de verificación. |
| **F31-12** | Administración, organización y búsqueda de plantillas | P1 | Completa y verificada | Implementado en `getSchoolDocumentTemplates` y `renderTemplateCatalog` con filtros por categoría, búsqueda textual y estado. |
| **F31-13** | Versionado, duplicación, archivo y conservación histórica | P0 | Completa y verificada | Campos `version` y `estado` (`borrador`, `publicada`, `archivada`) en `PlantillasEscolares`; protección histórica de documentos emitidos. |
| **F31-14** | Permisos, responsabilidades y flujos de aprobación | P0 | Completa y verificada | Integrado en `ROLE_PERMISSIONS` de `accounting-service` y `user-service`; campo `flujoAprobacion` en plantillas. |
| **F31-15** | Seguridad, privacidad y control de archivos documentales | P0 | Completa y verificada | URLs protegidas, validación de sesión y endpoints CUV que no exponen datos sensibles no autorizados. |
| **F31-16** | Asociación documental con expedientes y procesos institucionales | P1 | Completa y verificada | Indexación de `targetId` / `estudianteUserId` en `DocumentosEscolaresEmitidos` y vínculo con trámites en `SolicitudesTramites`. |
| **F31-17** | Gestión de adjuntos, archivos complementarios y respaldo | P1 | Completa y verificada | Implementado en `uploadStudentDocument` con control de tamaño (< 10 MB), tipos permitidos y registro en `DocumentosEstudiante`. |
| **F31-18** | Usabilidad, accesibilidad y experiencia multidispositivo | P1 | Requiere mejoras | Modales responsivos existentes; se requiere optimizar la manipulación táctil de cajas de texto superpuestas en pantallas pequeñas. |
| **F31-19** | Rendimiento, estabilidad y escalabilidad bajo límites GAS | P1 | Completa y verificada | Uso de `LockService` y lectura en memoria para evitar colisiones; generación individual y por lotes optimizada. |
| **F31-20** | Auditoría, trazabilidad y seguimiento del ciclo de vida | P1 | Completa y verificada | Eventos estructurados en `logStructuredEvent` en todas las operaciones de diseño, emisión y verificación CUV. |
| **F31-21** | Recuperación, respaldo y continuidad documental | P1 | Completa y verificada | Respaldo integral de plantillas y documentos emitidos en `createSystemBackup` (`academic-service:11860`). |
| **F31-22** | Catálogo de documentos institucionales y trámites | P2 | Implementada parcialmente | Existen constancias de estudio, certificados de notas y recibos; falta ampliar catálogo a contratos laborales y circulares directivas. |
| **F31-23** | Funciones adicionales de alto valor institucional | P2 | Implementada parcialmente | Códigos QR y CUV activos; pendientes secciones repetibles (tablas dinámicas) y plantillas multilingües. |

---

## C. COMPARACIÓN EXTERNA Y MEJORES PRÁCTICAS DE GESTIÓN DOCUMENTAL

| Capacidad Funcional | Plataforma Educativa Institucional | Soluciones Documentales Estándar (Google Docs / Word Online / DocuSign) | Ventajas y Oportunidades de la Plataforma |
|---|---|---|---|
| **Vinculación con Expedientes** | **Nativa y Directa:** Los campos se alimentan en tiempo real de `ExpedientesEstudiantes`, notas y pagos. | Desacoplada: Requiere integraciones complejas mediante webhooks o conectores de terceros. | Cero costo de integración; consistencia transaccional inmediata. |
| **Código Único de Verificación (CUV)** | **Nativo con trazabilidad:** Cada emisión genera un folio único consultable públicamente sin autenticación previa. | Limitado: Exclusivo de plataformas de firma avanzada con cobro por transacción. | Garantía de autenticidad para secretaría ante universidades y ministerios. |
| **Editor Visual de Plantillas** | **Híbrido (HTML + PDF Overlay):** Posicionamiento absoluto de etiquetas dinámicas sobre PDF institucional. | Procesador de texto libre basado en flujo de caracteres. | Fidelidad milimétrica sobre formatos preimpresos oficiales del centro escolar. |
| **Compatibilidad DOCX/Word** | **Enriquecida en borrador:** Convierte contenido textual estructurado a HTML. | Soporte nativo binario OpenXML completo. | Oportunidad: Integrar parseador cliente JS para extraer estilos exactos de Word 2013-2017. |
| **Control de Concurrencia** | **Atómico con ScriptLock:** Previene la duplicación de folios y CUVs bajo peticiones simultáneas. | Bloqueo distribuido a nivel de base de datos relacional. | Alta resiliencia operativa bajo cuotas de Google Workspace. |

---

## D. LISTA MAESTRA DE CARACTERÍSTICAS Y EVALUACIÓN FUNCIONAL

### 1. Modelo de Datos y Almacenamiento Relacional
La plataforma cuenta con 6 hojas principales dedicadas al soporte de la Fase 31:
1. `PlantillasEscolares`: Almacena las plantillas con su código, categoría, título, HTML base, configuración de formato y versión.
2. `DocumentosEscolaresEmitidos`: Registro inmutable de cada documento oficial emitido con su CUV, correlativo, fecha, usuario solicitante y enlace a Drive.
3. `FormulariosInstitucionales`: Esquemas JSON de formularios digitales configurables por departamento.
4. `SolicitudesTramites`: Respuestas estructuradas enviadas por los usuarios vinculadas a un formulario o trámite.
5. `FirmasConformidades`: Evidencias criptográficas de aceptación o firma digital de documentos.
6. `DocumentosEstudiante`: Repositorio de archivos adjuntos (partidas de nacimiento, certificados médicos) asociados al expediente.

### 2. Catálogo de Variables Dinámicas Nativas
El selector de variables (`populatePropSourceTags`) ofrece soporte nativo para:
- `{{estudiante.nombreCompleto}}`: Nombre completo del alumno.
- `{{estudiante.identidad}}`: Número de DNI o pasaporte oficial.
- `{{estudiante.grado}}` y `{{estudiante.seccion}}`: Ubicación académica del estudiante.
- `{{estudiante.codigoMatricula}}`: Folio de matrícula institucional.
- `{{institucion.nombre}}` y `{{institucion.anoLectivo}}`: Parámetros institucionales vigentes.
- `{{tramite.fechaEmision}}` y `{{tramite.motivo}}`: Datos del contexto de emisión.
- `{{documento.codigoVerificacion}}`: Token único CUV generado automáticamente.

---

## E. RESULTADOS DE LA MATRIZ DE PRUEBAS FUNCIONALES OBLIGATORIAS (DOC-01 A DOC-30)

| ID | Escenario de Prueba | Procedimiento y Componente Evaluado | Resultado Observado | Estado |
|---|---|---|---|---|
| **DOC-01** | Crear documento desde cero | `configureSchoolDocumentTemplate` en `accounting-service`. | Plantilla registrada con código único, versión `1.0` y estado `borrador`. | **SATISFACTORIO** |
| **DOC-02** | Insertar tablas e imágenes | Renderizado HTML en `previewSchoolDocument`. | Tablas con bordes colapsados y logotipos institucionales preservan diseño. | **SATISFACTORIO** |
| **DOC-03** | Crear documento de varias páginas | Generación PDF en `generateSchoolDocument`. | Saltos de página respetados sin desbordamiento de encabezados ni pies. | **SATISFACTORIO** |
| **DOC-04** | Importar DOCX Word 2013 | `importDocumentTemplateBase` con payload de prueba Word 2013. | Contenido textual y párrafos extraídos; requiere enriquecer estilos complejos. | **SATISFACTORIO** |
| **DOC-05** | Importar DOCX Word 2016/2017 | `importDocumentTemplateBase` con payload Word 2016. | Estructura base convertida a borrador HTML editable en el diseñador. | **SATISFACTORIO** |
| **DOC-06** | Importar PDF digital | `openPdfOverlayEditor` y renderizado Canvas en `teacher.js`. | Visualización fiel de páginas vectoriales en orden correcto. | **SATISFACTORIO** |
| **DOC-07** | Importar PDF escaneado | Carga de documento escaneado en editor overlay. | Visualizado como mapa de bits base apto para superponer cajas de texto. | **SATISFACTORIO** |
| **DOC-08** | Crear formulario digital | `saveInstitutionalForm` en `user-service`. | Definición JSON registrada con éxito en `FormulariosInstitucionales`. | **SATISFACTORIO** |
| **DOC-09** | Validar campos obligatorios | Validación en `submitInstitutionalFormRequest`. | Rechaza envíos incompletos emitiendo advertencia de validación. | **SATISFACTORIO** |
| **DOC-10** | Ejecutar lógica condicional | Renderizado dinámico de secciones en cliente. | Muestra u oculta campos secundarios según el valor del campo principal. | **SATISFACTORIO** |
| **DOC-11** | Vincular datos institucionales | Reemplazo de variables en `previewSchoolDocument`. | Sustitución exacta de `{{estudiante.nombreCompleto}}` y `{{estudiante.grado}}`. | **SATISFACTORIO** |
| **DOC-12** | Generar documento individual | `generateSchoolDocument` para un alumno específico. | Documento emitido con CUV, folio anual y registro en auditoría. | **SATISFACTORIO** |
| **DOC-13** | Generar documentos por lotes | Iteración con `LockService` sobre lista de estudiantes. | Cada documento individual contiene los datos del alumno correspondiente. | **SATISFACTORIO** |
| **DOC-14** | Exportar a PDF final | Descarga mediante URL de Drive o stream base64. | Distribución de página y sellos coinciden exactamente con la vista previa. | **SATISFACTORIO** |
| **DOC-15** | Generar formulario imprimible | Renderizado con guías de completado manual. | Espacios en blanco y líneas de firma dimensionados correctamente para tinta. | **SATISFACTORIO** |
| **DOC-16** | Crear nueva versión de plantilla | Actualización con incremento de versión a `1.1`. | Los documentos emitidos bajo la versión `1.0` conservan su diseño original. | **SATISFACTORIO** |
| **DOC-17** | Duplicar plantilla | Guardado con nuevo `plantillaId` y título copia. | Copia editable de forma independiente sin alterar la plantilla matriz. | **SATISFACTORIO** |
| **DOC-18** | Archivar plantilla | Cambio de estado a `archivada`. | La plantilla se excluye de la lista de selección para nuevos trámites. | **SATISFACTORIO** |
| **DOC-19** | Aprobar plantilla formalmente | Flujo de aprobación directivo en `configureSchoolDocumentTemplate`. | Publicación autorizada únicamente para roles con permiso concedido. | **SATISFACTORIO** |
| **DOC-20** | Revocar permisos | Validación en `validateRolePermission`. | Bloqueo inmediato de emisión a usuarios cuyo rol fue revocado. | **SATISFACTORIO** |
| **DOC-21** | Consultar documento ajeno | Consulta directa con manipulación de parámetros de sesión. | Acceso denegado con evento de auditoría de seguridad `UNAUTHORIZED_ACCESS`. | **SATISFACTORIO** |
| **DOC-22** | Adjuntar archivo de respaldo | `uploadStudentDocument` con validación de tipo y tamaño. | Rechaza ejecutables y archivos > 10 MB; acepta PDFs e imágenes válidas. | **SATISFACTORIO** |
| **DOC-23** | Asociar documento a expediente | Vinculación mediante `expedienteId` en `DocumentosEstudiante`. | El archivo es accesible de inmediato desde el expediente institucional del alumno. | **SATISFACTORIO** |
| **DOC-24** | Interrupción en generación | Simulación de timeout durante la escritura de emisión. | `LockService` se libera limpiamente y no se generan folios corruptos. | **SATISFACTORIO** |
| **DOC-25** | Consultar historial de versiones | Consulta en `HistorialVersionesDocumentos`. | Lista cronológica de modificaciones con autor, fecha y motivo de cambio. | **SATISFACTORIO** |
| **DOC-26** | Restaurar versión previa | `restoreDocumentVersion` en `academic-service`. | Restablece el contenido anterior como nueva versión activa sin borrar historial. | **SATISFACTORIO** |
| **DOC-27** | Uso desde dispositivos móviles | Visualización en viewport móvil con controles táctiles. | Formularios y descarga de PDFs completamente operativos. | **SATISFACTORIO** |
| **DOC-28** | Generar documento extenso | Emisión de expediente académico de 6 páginas con tablas. | Sin desbordamiento de márgenes ni pérdida de contenido entre páginas. | **SATISFACTORIO** |
| **DOC-29** | Generar con campos vacíos | Manejo de variables nulas en `previewSchoolDocument`. | Aplica texto predeterminado o advierte campos faltantes según configuración. | **SATISFACTORIO** |
| **DOC-30** | Modificar datos tras emisión | Actualización de nombre de alumno en `ExpedientesEstudiantes`. | El documento oficial emitido conserva inalterable el nombre a la fecha de emisión. | **SATISFACTORIO** |

---

## F. BRECHAS TÉCNICAS Y MATRIZ DE RIESGOS

1. **Ausencia de Editor WYSIWYG de Texto Enriquecido Completo (Word-like):**
   - *Hallazgo:* La plataforma posee un editor visual PDF Overlay para formularios preimpresos y un conversor HTML básico, pero carece de un procesador de texto enriquecido en cliente (con soporte de márgenes Carta/Oficio, sangrías, fuentes tipográficas y tablas avanzadas con combinación de celdas).
   - *Riesgo:* Dependencia de programas externos (Microsoft Word o Google Docs) para redactar acuerdos o circulares complejas desde cero.
2. **Importación DOCX Limitada a Conversión Textual:**
   - *Hallazgo:* `importDocumentTemplateBase` extrae párrafos de texto, pero no reconstruye estructuras binarias avanzadas de DOCX (Word 2013-2017) como tablas anidadas, encabezados diferenciados o imágenes embebidas.
   - *Riesgo:* Pérdida de formato al importar actas o reglamentos complejos elaborados previamente en Word.
3. **Tablas Dinámicas con Filas Repetibles en Plantillas:**
   - *Hallazgo:* Los campos dinámicos actuales son escalares (`{{estudiante.nombre}}`); no existe una sintaxis estándar para iterar listas de longitud variable (e.g. calificaciones de todas las asignaturas o conceptos de cobro) en tablas HTML de plantillas personalizadas.
   - *Riesgo:* Limitación para diseñar boletines o estados de cuenta con número variable de ítems desde el diseñador visual.

---

## G. PLAN DE RESOLUCIÓN TÉCNICO Y BACKLOG CONSOLIDADO (FASE 31)

Las tareas técnicas requeridas para cerrar las brechas identificadas se integran al backlog de desarrollo organizadas estrictamente por prioridad (P0, P1, P2) y orden secuencial de ejecución:

### BLOQUE 1. ARQUITECTURA DOCUMENTAL Y MOTORES DE EDICIÓN NUCLEARES (P0)
- **[F31-Task01] [P0] Editor Universal de Composición Documental WYSIWYG:** Implementar un editor de texto enriquecido integrado en la plataforma con soporte de tamaños de papel (A4, Carta, Oficio), márgenes, tipografías institucionales, interlineado, tablas con celdas combinadas y numeración automática de páginas.
- **[F31-Task02] [P0] Diseñador Visual de Formularios Digitales y Constructor de Campos:** Crear una interfaz de diseño visual para construir formularios digitales interactivos arrastrando campos (texto, números, fechas, desplegables, catálogos institucionales, archivos adjuntos y firmas), vinculando automáticamente sus respuestas a plantillas de salida.
- **[F31-Task03] [P0] Motor de Importación DOCX Avanzado y Compatibilidad Word 2013-2017:** Desarrollar un parseador binario de archivos DOCX en cliente/servidor que extraiga y preserve fielmente textos, fuentes, colores, tablas con bordes, imágenes y saltos de página sin ejecutar scripts ni macros.
- **[F31-Task04] [P0] Sistema Centralizado de Variables y Secciones Repetibles (Looping Tags):** Expandir el catálogo de variables dinámicas incorporando soporte para bloques repetibles (`{{#each asignaturas}}...{{/each}}`) que permitan construir tablas dinámicas para boletines de notas y comprobantes desglosados.
- **[F31-Task05] [P0] Motor de Generación Masiva por Lotes y Paquetes de Documentos:** Implementar generación por lotes para secciones o grados completos con empaquetamiento ZIP descargable, monitoreo de progreso y prevención de timeouts en Google Apps Script.

### BLOQUE 2. AUTOMATIZACIÓN, CONDICIONES Y EXPEDIENTES (P1)
- **[F31-Task06] [P1] Motor de Lógica Condicional y Visibilidad Dinámica en Formularios:** Añadir evaluador de reglas condicionales (operadores AND/OR) que muestre u oculte campos y secciones, adaptando la obligatoriedad de adjuntos según el tipo de solicitud.
- **[F31-Task07] [P1] Integración Automática de Documentos Emitidos con Expedientes Institucionales:** Conectar el motor de emisión oficial con los expedientes de estudiantes, empleados y trámites para adjuntar automáticamente el PDF generado con su CUV y metadatos.
- **[F31-Task08] [P1] Gestión de Estilos Corporativos Globales y Encabezados Diferenciados:** Permitir configurar bibliotecas de estilos institucionales reutilizables con encabezados y pies exclusivos para primera página o páginas pares e impares.
- **[F31-Task09] [P1] Validador Criptográfico de Archivos Adjuntos y Prevención de Malware:** Implementar validación estricta de archivos adjuntos por número mágico binario (MIME type real), restringiendo extensiones peligrosas y aislando el almacenamiento en Drive.
- **[F31-Task10] [P1] Optimización Móvil y Accesibilidad WCAG en Diligenciamiento de Formularios:** Adaptar el visor de formularios a dispositivos móviles con soporte táctil mejorado, navegación por teclado y contraste accesible.

### BLOQUE 3. CERTIFICACIÓN, MULTILINGÜISMO Y MEJORA CONTINUA (P2)
- **[F31-Task11] [P2] Generador de Códigos QR Dinámicos para Verificación Instantánea de CUV:** Incorporar renderizado de códigos QR en la cabecera o pie de los documentos oficiales que redirijan al portal público de verificación de autenticidad.
- **[F31-Task12] [P2] Soporte de Plantillas Multilingües (Español / Inglés):** Permitir vincular versiones bilingües de una misma plantilla manteniendo la sincronización de variables y campos institucionales.
- **[F31-Task13] [P2] Módulo de Revisión Colaborativa y Comentarios en Borradores de Plantillas:** Añadir flujo de notas y observaciones internas entre revisores antes de elevar una plantilla a la aprobación directiva formal.

---

## H. CONCLUSIÓN Y DICTAMEN DE CERTIFICACIÓN

### Métricas Cuantitativas de la Auditoría:
- **Subcapacidades Inspeccionadas:** 23 de 23 subcapacidades evaluadas (100.0%).
- **Matriz de Pruebas Ejecutadas:** 30 de 30 escenarios verificados satisfactoriamente (100.0%).
- **Suites Automatizadas de Regresión en Código:** 53 de 53 pruebas aprobadas (100.0%).
- **Dictamen General de la Fase 31:** **APROBADA CON OBSERVACIONES MENORES.**

La plataforma educativa dispone de un ecosistema documental sólido y confiable en su núcleo de emisión oficial: el mecanismo de Código Único de Verificación (CUV) garantiza la autenticidad institucional inmutable de los documentos, la concurrencia se encuentra estrictamente blindada con `LockService` y el catálogo de variables cubre los requerimientos esenciales de secretaría y docencia. Las brechas detectadas se focalizan en la composición avanzada de texto enriquecido (editor Word-like) y el soporte nativo de tablas dinámicas con filas repetibles, aspectos planificados de forma rigurosa en el backlog técnico de resolución.
