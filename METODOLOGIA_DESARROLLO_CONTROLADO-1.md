[Raíz del Proyecto]
├── Auditoria.txt          <-- Historial indestructible de hallazgos técnicos
├── ChangesLogs.txt        <-- Diario de modificaciones y líneas afectadas
├── Pendientes.md          <-- Libro de control operativo, especificaciones y tareas
└── MapaDependencias.md    <-- Inventario estructural e interconexiones

### 3.1 Auditoria.txt
Registro histórico y acumulativo que funge como bitácora de hallazgos, riesgos de regresión, incidencias detectadas y evidencia técnica indexada. **Queda estrictamente prohibido borrar, alterar o purgar información histórica de este archivo;** las nuevas auditorías se anexarán en la sección inferior manteniendo la cronología.

### 3.2 ChangesLogs.txt
Registro objetivo de las modificaciones aplicadas con éxito en el repositorio. Debe documentar con precisión quirúrgica el archivo modificado, las líneas exactas afectadas y la justificación técnica del cambio. Queda prohibido el uso de lenguaje subjetivo, asunciones de éxito o frases de cierre prematuras (ej. *"Bug solucionado definitivamente"*).

### 3.3 MapaDependencias.md
Inventario técnico y estructural que documenta de forma explícita las relaciones lógicas del sistema, incluyendo funciones, variables de estado, clases, constantes de configuración, rutas de importación y el mapa de enlaces entre los diferentes módulos y el canvas general del proyecto.

### 3.4 Pendientes.md
Este archivo sustituye de forma definitiva a cualquier versión anterior de gestión de instrucciones (como `Instrucciones.txt`) y actúa como el único registro oficial de tareas autorizadas.

## 3.5 Rol de Auditor


Reglas, Normas y Procedimiento de Auditoría de Código

1. Objetivo

Establecer las normas, criterios y procedimientos obligatorios para la ejecución de auditorías técnicas de código fuente, garantizando un proceso riguroso, documentado, trazable y completamente independiente de cualquier criterio subjetivo o automatizado.

La auditoría tiene como finalidad identificar errores, defectos, inconsistencias, riesgos técnicos, deuda técnica, vulnerabilidades, incumplimientos de arquitectura, problemas de mantenibilidad y cualquier otro elemento que pueda afectar la calidad, estabilidad, seguridad o escalabilidad del sistema.

## 3.6. Reglas Fundamentales del Auditor

1. Objetividad Absoluta

-La auditoría debe ejecutarse bajo un principio de objetividad total.

-El auditor:

No debe validar implementaciones por autoridad.

-No debe asumir que una solución es correcta por provenir de un desarrollador experimentado.

-No debe aceptar una implementación únicamente porque fue solicitada o aprobada previamente.

-No debe otorgar validez a un componente basándose en la reputación, antigüedad o jerarquía de quien lo desarrolló.


-Toda conclusión deberá estar respaldada exclusivamente por evidencia técnica verificable.


---

3.7 Análisis Técnico Crítico

La revisión deberá realizarse desde múltiples perspectivas simultáneamente:
*Como Revisor de Código (Code Reviewer)
Evaluando:
-Calidad de implementación.
-Legibilidad.
-Mantenibilidad.
-Cumplimiento de estándares.
-Buenas prácticas.

*Como Auditor Técnico
Evaluando:
-Cumplimiento de requisitos.
-Consistencia arquitectónica.
-Integridad de procesos.
-Correcto uso de componentes.


*Como Inspector de Calidad
Evaluando:
-Errores potenciales.
-Casos límite.
-Omisiones.
-Duplicación de lógica.
-Código muerto.


*Como Auditor Forense
Evaluando:
-Origen de comportamientos inesperados.
-Dependencias ocultas.
-Efectos colaterales.
-Riesgos futuros.
-Trazabilidad de cambios.


Ningún detalle debe considerarse demasiado pequeño para ser revisado.


---

3.8 Prohibición de Automatización

La auditoría debe realizarse exclusivamente mediante inspección manual.

*Queda estrictamente prohibido utilizar:
-Herramientas automáticas de auditoría.
-Scripts de análisis masivo.
-Escáneres automáticos de código.
-Sistemas de revisión automática.
-Herramientas de corrección automática.
-Cualquier mecanismo que sustituya el análisis tecnico detallado.


La revisión deberá efectuarse:
-Línea por línea.
-Función por función.
-Variable por variable.
-Referencia por referencia.
-Dependencia por dependencia.
-Flujo lógico por flujo lógico.


El auditor es responsable de comprender completamente cada elemento inspeccionado antes de emitir una conclusión.


3.9 Registro Obligatorio de Hallazgos

Todo hallazgo identificado deberá registrarse obligatoriamente en el archivo:
Auditoria.txt
No se permite omitir hallazgos por considerarlos menores, evidentes o repetitivos.
Cada registro deberá contener como mínimo:
Fecha de auditoría.
Archivo auditado.
Módulo o sector afectado.
Línea o rango de líneas.
Tipo de hallazgo.
Descripción técnica detallada.
Impacto potencial.
Nivel de criticidad.
Dependencias relacionadas.

3.11 Conversión Obligatoria de Hallazgos en Tareas

Todo hallazgo registrado en Auditoria.txt deberá convertirse en una tarea concreta dentro del bloque:
-"Tareas Pendientes" del archivo:

Pendientes.md
Cada tarea deberá:
Ser específica.
Ser verificable.
Tener un objetivo claro.
Estar vinculada al hallazgo original.
Permitir su posterior implementación y validación.
No podrán existir hallazgos sin una tarea asociada.

## 3.10 Proceso Oficial de Auditoría

3.11 Creación del Registro Maestro de Dependencias

Antes de iniciar la auditoría deberá crearse el archivo:

MapaDependencias.md

(Este nombre sustituye a "libreria.md" por describir con mayor precisión su propósito.)

Este documento funcionará como un registro central de trazabilidad y deberá contener:

Funciones

Nombre.

Archivo de origen.

Descripción.

Parámetros.

Valor de retorno.

Archivos que la utilizan.


Variables Globales

Nombre.

Tipo.

Archivo de origen.

Archivos consumidores.


Constantes

Nombre.

Valor.

Ubicación.

Dependencias.


Clases

Nombre.

Responsabilidad.

Herencia.

Dependencias.


Módulos

Nombre.

Función dentro del sistema.

Dependencias entrantes.

Dependencias salientes.


El objetivo es construir un mapa completo de relaciones internas del sistema.


---

3.12 Elaboración del Plan de Auditoría

Antes de auditar cualquier archivo deberá elaborarse un plan formal que establezca:

Orden de revisión.

Archivos a inspeccionar.

Dependencias críticas.

Riesgos conocidos.

Componentes prioritarios.

Estado actual de la auditoría.


El plan deberá actualizarse conforme avance el proceso.


---

3.13 Auditoría de Componentes Centrales

La auditoría iniciará obligatoriamente por los componentes de control principal del sistema, incluyendo:

Controladores.

Servicios principales.

Gestores de estado.

Núcleo de negocio.

Módulos de integración.

Sistemas de autenticación.

Motores de procesamiento.


Para cada archivo auditado se deberá registrar en MapaDependencias.md:

Funciones.

Variables.

Constantes.

Eventos.

Dependencias.

Relaciones con otros módulos.


Toda la información deberá organizarse por archivo y por bloques funcionales.


---

3.14 Creación de Respaldo

Antes de iniciar la revisión de cualquier archivo deberá generarse una copia de respaldo.

El archivo original no podrá ser modificado durante la etapa de auditoría.

La copia de respaldo servirá como referencia para validar la integridad del proceso.


---

3.15 Inspección Manual Exhaustiva

Cada archivo será revisado completamente mediante inspección manual.

La revisión deberá abarcar:

Variables

Declaración.

Alcance.

Uso.

Reutilización.

Riesgos.


Funciones

Entradas.

Salidas.

Validaciones.

Casos límite.

Dependencias.


Lógica de Negocio

Flujo de ejecución.

Condiciones.

Reglas de negocio.

Coherencia funcional.


Dependencias

Importaciones.

Exportaciones.

Referencias cruzadas.

Acoplamientos.


Gestión de Errores

Captura de excepciones.

Manejo de estados inválidos.

Recuperación de fallos.


Rendimiento

Operaciones redundantes.

Bucles innecesarios.

Consultas repetidas.

Cálculos duplicados.


Ningún elemento podrá considerarse auditado sin haber sido inspeccionado individualmente.


---

3.16 Registro de Hallazgos y Trazabilidad

Todo hallazgo deberá registrarse en Auditoria.txt indicando:

Fecha.

Archivo.

Línea o rango de líneas.

Módulo afectado.

Función afectada.

Variable afectada.

Dependencias relacionadas.

Descripción técnica.

Impacto potencial.


Posteriormente deberá consultarse MapaDependencias.md para determinar:

Qué otros archivos utilizan el elemento afectado.

Qué procesos dependen de él.

Qué impacto podría generar una futura corrección.


Esta información deberá agregarse al registro correspondiente.


---

3.17 Validación Final y Restauración

Una vez finalizada la auditoría de un archivo:

a. Se comparará obligatoriamente con su copia de respaldo.


b. Si no existen diferencias:

El respaldo será eliminado.



c. Si existen diferencias:

El archivo auditado será restaurado utilizando la copia de respaldo.

Se verificará que quede exactamente igual a su estado original.




La auditoría no debe introducir modificaciones permanentes al código fuente.


---

3.18 Restricción Absoluta Durante la Auditoría

Durante la fase de auditoría queda estrictamente prohibido:

Corregir errores.

Refactorizar código.

Optimizar funciones.

Eliminar elementos.

Agregar nuevas funcionalidades.

Alterar configuraciones.

Modificar estructuras existentes.


La auditoría es exclusivamente una actividad de inspección, documentación y generación de hallazgos.

Toda corrección deberá realizarse posteriormente mediante las tareas registradas en Pendientes.md.


#### Protocolo de Registro y Estructura en Pendientes.md:
Toda tarea que sea inyectada en `Pendientes.md` debe estar perfectamente estructurada y tipificada empleando la siguiente plantilla obligatoria de metadatos, garantizando que el desarrollador cuente con el contexto completo antes de operar:

```markdown
### [ID-TAREA] Título Descriptivo de la Tarea
- **Origen del Hallazgo:** [Referencia indexada a Auditoria.txt]
- **Severidad/Clasificación:** [Crítico | Alto | Medio | Bajo | Observación]
- **Archivos Involucrados:** [Rutas exactas de los archivos a modificar]
- **Dependencias Expuestas:** [Lista extraída de MapaDependencias.md]
- **Descripción del Alcance:** [Especificación técnica unívoca de lo que se debe implementar. PROHIBIDO dejar margen a la ambigüedad]
- **Criterios de Aceptación:** [Condiciones medibles que debe pasar en la verificación]
- **Estado:** [ ] Pendiente | [ ] En Ejecución | [ ] Completada

```
## CLASIFICACIÓN DE HALLAZGOS
Todo hallazgo deberá clasificarse obligatoriamente.
*Crítico
Produce:
Pérdida de datos.
Vulnerabilidades.
Fallos graves.
Corrupción de procesos.
Corrección obligatoria inmediata.
*Alto
Impacta:
Funcionalidad principal.
Integridad lógica.
Estabilidad del sistema.
*Medio
Afecta:
Mantenibilidad.
Rendimiento.
Consistencia.
*Bajo
No afecta funcionalidad actual.
Representa:
Mejoras recomendadas.
Limpieza técnica.
Observación
No requiere corrección inmediata.
Se documenta para seguimiento.

# 4. FLUJO DE TRABAJO ESTRICTO Y SECUENCIAL (8 FASES)
El flujo de trabajo se ejecutará de forma lineal, síncrona y obligatoria. Violar la secuencia o avanzar de fase sin completar los entregables documentales exigidos invalidará el proceso en su totalidad.
```
  FASE 0: Auditoría Previa Obligatoria (Rol Auditor)
    │
    ▼
  FASE 1: Registro Formal de Hallazgos
    │
    ▼
  FASE 2: Planificación e Inyección/Actualización en Pendientes.md
    │
    ▼
  FASE 3: Respaldo Íntegro de Seguridad
    │
    ▼
  FASE 4: Ejecución y Desarrollo Controlado (Rol Desarrollador)
    │
    ▼
  FASE 5: Autoauditoría Posterior (Rol Auditor - Desdoblamiento)
    │
    ▼
  FASE 6: Revisión de Código Externa (Code Review)
    │
    ▼
  FASE 7: Cierre Operativo y Limpieza de Entorno

```
### FASE 0 — Auditoría Previa Obligatoria
 * **Acción:** Análisis visual y manual, línea por línea, del archivo o estructura origen de la tarea. El operador asume el rol estricto de *Auditor* y debe de cumplir todas las normas descritas en el apartado 3.6. 'Reglas Fundamentales del Auditor'
   
 * **Restricción:** **PROHIBIDO** realizar modificaciones, limpiezas de estilo o correcciones de código en esta etapa. Su meta es mapear el estado actual, riesgos latentes y efectos colaterales.
### FASE 1 — Registro Formal de Hallazgos
 * **Acción:** Toda anomalía, desviación estándar o vulnerabilidad observada debe asentarse de inmediato en Auditoria.txt.
 * **Manejo de Hallazgos Fuera de Alcance:** Si durante la inspección de la tarea asignada se detectan fallas críticas o desviaciones ajenas al objetivo actual, se procederá de la siguiente forma:
   1. *Si es completamente seguro y directo:* Se resolverá en el mismo commit, registrando minuciosamente su justificación en ChangesLogs.txt.
   2. *Si reviste complejidad o riesgo de regresión:* Queda estrictamente prohibido tocarlo. Se procederá a redactar una nueva entrada de tarea en Pendientes.md siguiendo el protocolo del apartado 3.4, y se indexará como referencia cruzada dentro de Auditoria.txt.
   3. Todo auditoria se debe de asumir el rol de auditor definido en el apartado 3.5
### FASE 2 — Planificación de Implementación
 * **Acción:** Se actualiza el estado de la tarea en Pendientes.md a [ ] En Ejecución. Se revisa que el alcance esté perfectamente delimitado y que se conozcan los impactos sobre el MapaDependencias.md.
### FASE 3 — Respaldo Íntegro de Seguridad
 * **Acción:** Antes de modificar un solo bit, se creará una copia de seguridad exacta y manual del archivo o archivos a editar.
 * **Requisitos:** El respaldo conservará el nombre de origen y su contenido íntegro, y se almacenará localmente de forma temporal con el único fin de servir como pivote de comparación post-edición.
### FASE 4 — Ejecución y Desarrollo Controlado
 * **Acción:** El operador adopta el rol de *Desarrollador*. Se procede a codificar e implementar **ÚNICAMENTE** lo explícitamente solicitado en los criterios de aceptación de la tarea en Pendientes.md.
 * **Restricciones:** Queda estrictamente **PROHIBIDO**:
   * Alterar estilos tipográficos, clases visuales o propiedades CSS no relacionadas con la tarea.
   * Modificar o alterar flujos lógicos existentes que funcionen de manera correcta.
   * Introducir optimizaciones prematuras, refactorizaciones cosméticas o limpieza de "código muerto" que no formen parte del requerimiento original.
### FASE 5 — Autoauditoría Posterior (Desdoblamiento Crítico)
 * **Acción:** Finalizada la codificación, el operador se despoja del rol de desarrollador y asume nuevamente el rol de *Auditor Técnico*.
 * **Subfase 5.1 - Comparación Post-Edición (Diff Manual):** Se confronta de forma manual el archivo modificado contra la copia de respaldo generada en la Fase 3. Se deben aislar visualmente todas las líneas eliminadas, modificadas y los bloques sobrescritos. Si se detecta un solo cambio ajeno, accidental o cosmético no solicitado por la tarea, se **REVERTIRÁ** inmediatamente esa sección y se reiniciará la comparación.
 * **Subfase 5.2 - Verificación de Integridad:** Se ejecutan pruebas manuales exhaustivas para certificar que la solución cumple el objetivo pedagógico o técnico, que no se han roto componentes adyacentes y que el sistema está completamente libre de regresiones o incrementos de latencia.
### FASE 6 — Revisión de Código Externa (Code Review)
 * **Acción:** El código y los registros son sometidos al escrutinio del *Revisor de Código*.
 * **Protocolo ante Observaciones (Reinicio del Ciclo):** Si el informe de Code Review detecta la más mínima falla, riesgo, omisión o comportamiento inesperado, se aplicará la regla de **Extensión Obligatoria**:
   * Toda observación constructiva **REINICIA EL CICLO COMPLETO** desde la Fase 0 (Auditoría Inicial).
   * Deberá aplicarse el procedimiento completo nuevamente, inclusive si implica volver a alterar archivos que ya habían sido editados. No se admiten parches calientes ni correcciones parciales fuera del flujo.
### FASE 7 — Cierre Operativo y Limpieza
 * **Acción:** Una vez que el Code Review otorga la aprobación formal, se completan los registros conclusivos en ChangesLogs.txt y se desplaza la tarea en Pendientes.md a la sección de [X] Completada.
 * **Limpieza de Entorno:** Los archivos temporales de respaldo se eliminarán de forma definitiva únicamente **DESPUÉS** de la aprobación en Code Review. Asimismo, cualquier captura de pantalla, log volátil o ejecutable auxiliar generado para la verificación visual deberá ser purgado del directorio de forma obligatoria en el pre-commit.
# 5. CLASIFICACIÓN TÉCNICA DE HALLAZGOS
Todo defecto, desviación o vulnerabilidad identificada en las Fases 0 o 5 debe ser catalogada obligatoriamente bajo la siguiente escala de severidad:
| Clasificación | Impacto Operativo y Técnico | Acción Requerida |
|---|---|---|
| **CRÍTICO** | Provoca pérdida de persistencia de datos, introduce vulnerabilidades de seguridad, regresiones graves, bloqueos del hilo principal o corrupción del flujo pedagógico del estudiante. | Bloqueo total del flujo. Corrección obligatoria e inmediata. |
| **ALTO** | Quiebra una funcionalidad principal del módulo, destruye la integridad lógica o compromete la estabilidad general de la interfaz o el canvas. | Prioridad máxima en el siguiente ciclo de desarrollo. |
| **MEDIO** | Degrada la mantenibilidad del código, impacta negativamente el rendimiento de carga o rompe la consistencia del diseño institucional. | Planificación y resolución sistemática. |
| **BAJO** | No altera en absoluto la experiencia de usuario ni la lógica matemática, pero representa desviaciones de la guía de estilos o requiere limpieza técnica menor. | Subsanación supeditada a disponibilidad de tiempos. |
| **OBSERVACIÓN** | Hallazgo que no requiere una acción correctiva a corto plazo, pero se documenta formalmente para tareas futuras de arquitectura. | Registro histórico preventivo. |
# 6. NORMAS DE ESTANDARIZACIÓN DE PRESENTACIONES HTML (IMA V2)
Esta sección rige la arquitectura de las lecciones interactivas del Área de Informática del Instituto María Auxiliadora. Ninguna presentación será desplegada si presenta una sola desviación de este marco conceptual y técnico.
## 6.1 Directrices de Plantilla y Herencia Estructural
 * **Plantilla Base Obligatoria:** Es imperativo tomar como canvas estructural y plantilla base el archivo aprobado Imperativos_Procedurales.html. Se debe clonar íntegramente su arquitectura de scripts de control, lógica de navegación, inicializadores de eventos y estilos CSS subyacentes.
 * **Prohibición de Contenido Académico Heredado:** Queda estrictamente **PROHIBIDO** heredar o duplicar el contenido conceptual o las preguntas del cuestionario del archivo plantilla. La clonación es única y exclusivamente técnica y estructural.
## 6.2 Arquitectura de Contenidos y Secuencia Pedagógica (16 Diapositivas Exactas)
Toda presentación configurada dentro del ecosistema debe contener **EXACTAMENTE 16 diapositivas** indexadas de forma nativa en su marcador global (visualizadas invariablemente desde 1 / 16 hasta 16 / 16). No se tolera la existencia de 15, 17 o cualquier otra cifra de pantallas. La secuencia lógica se divide de manera rigurosa de la siguiente forma:
```
 [Diapositiva 1]  --> Portada Institucional y Metadatos Académicos
 [Diapositivas 2-11]--> Desarrollo Temático Expositivo, Bloques Conceptuales y Código, si el plan de clases muestra dos temas, se dividirá a razon del tema con mas contenido en el archivo fuente. 
 [Diapositiva 12] --> Ejercicio Guiado Práctico (Resolución paso a paso)
 [Diapositiva 13] --> Actividad en Clase (Asignación autónoma del estudiante)
 [Diapositiva 14] --> Sección de Transición Pedagógica Pre-Evaluación
 [Diapositiva 15] --> Cuestionario Automatizado (10 reactivos de opción múltiple)
 [Diapositiva 16] --> Cierre Institucional, Espacio de Preguntas y Preparación de Aula

```
### Especificaciones por Diapositiva:
 * **Diapositiva 1 (Portada):** Conservará el funcionamiento en JavaScript de la plantilla base, limitando la edición manual a la actualización estricta de: Tema (<h2>), Asignatura, Unidad, Grado, Sección de la Carrera de Bachillerato Técnico Profesional, Nombre completo del docente con su título académico y Fecha exacta de la sesión en formato natural. El logo institucional debe contar con dimensiones responsivas fijas: width: 250px; en entornos de escritorio y width: 100px; en dispositivos móviles.
 * **Diapositivas 2 a 11 (Desarrollo):** Exposición progresiva de conceptos teóricos. Si la sesión abarca dos subtemas, las diapositivas se segmentarán proporcionalmente según la extensión y complejidad de los contenidos, debiendo finalizar por completo antes del Quiz.
   * *Títulos:* Maquetados de forma obligatoria con la etiqueta <h3>.
   * *Cajas de Concepto Clave (.concept-box):* Toda definición central, axioma o de arquitectura se encapsulará en contenedores con alineación a la izquierda, fondo #f9fafb y un borde lateral izquierdo sólido de 8px (adaptable a 4px en resoluciones móviles). Los colores de borde seguirán la semántica pedagógica (azul estándar, azul claro, amarillo de advertencia, verde de éxito o gris neutro).
   * *Listas:* Quedan prohibidos los bloques de texto extensos, continuos y saturados. Las secuencias lógicas y arquitecturas de hardware/software se estructurarán en listas ordenadas (<ol>) o desordenadas (<ul>) con tipografía espaciada e interlineado amplio.
 * **Diapositiva 12 (Ejercicio Guiado):** Planteamiento de un problema técnico o de lógica algorítmica aplicada, desglosando una guía ordenada paso a paso para su resolución. Debe ser un ejercicio de nivel básico y es un requisito mandatorio que no haya sido repetido en ejemplos anteriores ni en temas adyacentes de la asignatura.
 * **Diapositiva 13 (Actividad en Clase):** Sección de aplicación autónoma individual titulada obligatoriamente **"Actividad en clase"**. Debe desglosar las instrucciones técnicas de la práctica, el objetivo conceptual de la misma (ej. vinculación con memoria, procesamiento o lógica imperativa) y una nota aclaratoria en formato itálico y fuente reducida con los criterios de evaluación aplicables al cuaderno o la computadora para la revisión presencial del taller. El ejercicio planteado debe cumplir con la norma de no repetición académica.
 * **Diapositiva 15 (Cuestionario Automatizado de Evaluación):** Bloque interactivo controlado de forma dinámica mediante la inyección de una matriz de datos en JavaScript (quizData).
   * Albergará **10 preguntas de opción múltiple** renderizadas de forma simultánea dentro de la misma diapositiva.
   * Cada reactivo constará de 4 opciones dinámicas controladas mediante la clase .quiz-option, donde únicamente una alternativa será matemáticamente correcta.
   * Las opciones incorrectas deben operar como distractores plausibles basados fielmente en los textos técnicos oficiales de la asignatura; **quedan terminantemente prohibidas las respuestas falaces de descarte obvio o absurdo.**
   * Al interactuar con las opciones, el script bloqueará los inputs, cambiará el estilo del botón presionado (Verde #d1fae5 para aciertos / Rojo #fee2e2 para fallos), inyectará una retroalimentación objetiva en la zona inferior y realizará una transición automática tras un retardo exacto de 2 segundos hacia el siguiente reactivo.
   * **Aclaración de Feedback:** Queda estrictamente prohibido introducir frases sintácticas vagas o contextuales como "según el PDF" o "conforme al documento de lectura". El indicador de éxito o fallo debe limitarse a marcar de forma determinista la opción correcta y proveer una justificación técnica pura y absoluta.
 * **Diapositiva 16 (Cierre Institucional):** Titulada obligatoriamente **"¡Fin del Tema!"**. Incluirá una caja .concept-box con borde azul dedicada a la apertura de un foro de preguntas, así como las instrucciones para que los alumnos preparen sus libretas e de cara a las revisiones en el taller presencial.
## 6.3 Restricciones de Integridad Académica y Metadatos
 * **Fuentes Autorizadas:** Queda estrictamente prohibido extraer teoría o conceptos de fuentes externas de internet. La base conceptual se limitará única y exclusivamente a los textos y PDFs oficiales proporcionados en la carpeta de la asignatura.
 * **Coherencia del Plan de Clases:** Se validará la fecha de la sesión contra el Plan de Clases oficial del instituto para garantizar la perfecta correspondencia del tema. Es mandatorio auditar el tema anterior y posterior para resguardar la fluidez cronológica y evitar saltos lógicos.
 * **Metadatos de Preguntas (CRÍTICO):** Toda pregunta inyectada en el motor de reactivos de JavaScript debe incluir obligatoriamente el siguiente objeto estructurado de metadatos:
   ```javascript
   {
     question: "Texto de la pregunta...",
     options: ["A", "B", "C", "D"],
     answer: 0, // Índice literal de la respuesta correcta, no la posicion.
     tema: "Nombre_Exacto_Del_Tema", // PROHIBIDO usar el comodín "General"
     asignatura: "Nombre_De_La_Asignatura",
     grado: "11", // u "12" según corresponda
     nivel: "BTP"
   }
   
   ```
   La clasificación taxonómica se realiza exclusivamente desde el origen de la presentación; se prohíben las inferencias automáticas por palabras clave en tiempo de ejecución.
## 6.4 Identidad Visual, Tipografía y Paleta de Colores
El entorno visual se mantendrá minimalista y profesional, implementando hojas de estilo en cascada bajo las siguientes directrices tipográficas y de color:
### Tipografías Google Fonts:
 * **Títulos de Portada (<h2>):** Fuente **Poppins** con peso tipográfico de 800. Tamaño de visualización: 3rem en escritorio y 1.75rem en móviles. Color de énfasis: Azul institucional (#0d6efd).
 * **Títulos de Contenido (<h3>):** Fuente **Poppins** con peso tipográfico de 700. Tamaño de visualización: 2.25rem en escritorio y 1.4rem en móviles. Color: Gris oscuro neutro (#1f2937) para máxima legibilidad ante proyección.
 * **Cuerpo de Texto y Listas (p, li, .quiz-option):** Fuente **Inter** con peso tipográfico de 400 para descripciones y 600 para estados activos. Tamaño de visualización: 1.5rem con un interlineado estricto de 1.6 en escritorio, adaptándose de forma elástica a 1rem con interlineado de 1.4 en dispositivos móviles. Color base del texto: #4b5563 o #1f2937.
 * **Bloques de Código y Consolas:** Fuente tipográfica **Console / monospace** (emulando los entornos de PSeInt o Code Studio). Se exige una indentación rigurosa, tipografía limpia y la remoción absoluta de cualquier ornamento visual o script automatizado que actúe como distractor pedagógico.
### Paleta Restringida de Colores:
 * **Azul Principal (#0d6efd / #0b5ed7):** Títulos de portada, bordes de enfoque y botones activos de navegación.
 * **Gris de Fondo y Contornos (#f3f4f6 / #e5e7eb / #9ca3af):** Estructura del canvas de fondo, bordes de las opciones del cuestionario y contadores de navegación.
 * **Blanco Puro (#ffffff):** Color exclusivo y mandatorio para el canvas del contenedor de las diapositivas (#presentation-container), garantizando el contraste nativo ante proyectores escolares de haz de luz limitado.
## 6.5 Encabezado y Pie de Página Global
La presentación integrará de manera obligatoria la estructura global de identidad de la plataforma en perfecta consonancia con la página principal (index.html):
 * **Encabezado (<header id="page-header">):** Fondo blanco puro con sombra ligera .shadow-sm. Maquetación de tablas o bloques que ubica a la izquierda el logotipo de la institución (width: 150px; height: auto; en pantallas de escritorio / width: 100px; en pantallas móviles) junto al título oficial de la asignatura. A la derecha, se implementará un enlace de navegación de retorno apuntando exactamente a ../../index.html con la leyenda *"Volver al Inicio"*.
 * **Pie de Página (<footer id="page-footer">):** Bloque de fondo gris oscuro (bg-gray-900) con texto en color blanco centrado. Es obligatoria la inclusión de la imagen de la bandera de Honduras (width="60") alineada de forma horizontal junto a la reserva de derechos de autor del *Instituto María Auxiliadora - Área de Informática*.
## 6.6 Sistema de Navegación Híbrido Multidispositivo
El script interceptará y procesará de manera nativa los eventos de entrada del teclado, mouse y gestos táctiles sin generar conflictos de interfaz:
### Comportamiento en Escritorio:
 * **Avance de Diapositiva:** Tecla *Flecha Derecha*, *Barra Espaciadora* (aplicando obligatoriamente e.preventDefault() para neutralizar el scroll nativo del navegador) o un *Clic Simple* en cualquier región libre del canvas del contenedor (#presentation-container). El clic se ignorará si el cursor interactúa con hipervínculos, cajas .concept-box o botones .quiz-option.
 * **Retroceso de Diapositiva:** Tecla *Flecha Izquierda*.
 * **Controles Gráficos Manuales:** Un wrapper inferior (#controls-wrapper) proveerá botones interactivos para navegación guiada. El botón *"Anterior"* se deshabilitará lógicamente en la diapositiva 1, y el botón *"Siguiente"* se deshabilitará al alcanzar la diapositiva 14 (pre-quiz). Estos botones se ocultarán por completo por medio de hojas de estilo al conmutar a pantalla completa, delegando la navegación en el teclado o clics zonales.
### Comportamiento en Dispositivos Móviles (<= 768px):
 * **Navegación Zonal por Toque:** Al registrarse un toque simple, el script evaluará de forma analítica la coordenada horizontal del impacto con respecto al ancho total de la pantalla:
   * Si el toque se efectúa dentro del primer **30% del ancho (borde izquierdo)**, la presentación ejecutará un retroceso.
   * Si ocurre en el **70% restante del ancho (zona central y derecha)**, la presentación ejecutará un avance secuencial.
 * **Navegación por Gestos de Desplazamiento (Swipe):** El manejador de eventos táctiles registrará los vectores de inicio y fin en los ejes X e Y. Si el vector horizontal es predominante y la distancia absoluta recorrida supera un umbral estricto de **50 píxeles**, se disparará el flujo:
   * *Swipe de derecha a izquierda:* Provoca el avance inmediato de diapositiva.
   * *Swipe de izquierda a derecha:* Provoca el retroceso inmediato de diapositiva.
## 6.7 Resiliencia ante Zoom del Navegador y Control en Pantalla Completa
 * **Activación Nativa:** El estado de pantalla completa se disparará de forma exclusiva al registrarse un evento de **doble clic** (escritorio) o **doble toque** continuado (móviles) sobre cualquier área vacía de la portada de la presentación, invocando la API nativa requestFullscreen().
 * **Transformación de Interfaz:** Al activarse, el script inyectará la clase CSS .hide-element para provocar la desaparición absoluta de: El encabezado institucional (#page-header), el pie de página global (#page-footer) y el contenedor de botones manuales (#controls-wrapper). El contador nativo (#slide-counter) permanecerá visible para control del docente.
 * **Control del Zoom y Redimensionamiento Híbrido (CRÍTICO):** Para evitar desbordamientos visuales causados por la manipulación del zoom en el aula, la función de escucha de redimensionamiento (window.addEventListener('resize')) se programará con una técnica de *debouncing* asíncrona fijada en 100ms.
> ### Regla de Oro para el Control del Canvas:
> Si el script detecta a través del manejador corregido que la altura útil de la ventana del navegador es igual o superior a la altura física total del monitor menos un umbral de tolerancia por barras nativas (window.innerHeight >= (screen.height - 15)), se deducirá un estado de maximización forzada o alteración de escala.
> En ese instante, se ejecutará de forma automática la **auto-ocultación absoluta** del encabezado y el pie de página. Esta instrucción anula cualquier renderizado accidental, impidiendo bajo toda circunstancia que el zoom desborde elementos institucionales sobre el contenido académico central de la diapositiva.
> 
## 6.8 Gestión de Componentes Gráficos y Visuales
 * **Atributo Alt Obligatorio:** Toda imagen externa inyectada (<img>) debe portar obligatoriamente su etiqueta alternativa descriptiva para validación estructural y accesibilidad. Se maquetarán con propiedades fluidas (max-width: 100%; height: auto;) para evitar desbordamientos en cualquier canvas.
 * **Iconografía Vectorial:** Ante la ausencia de un recurso gráfico externo, se recurrirá de forma obligatoria al uso de iconos vectoriales que guarden relación semántica directa con la materia.
 * **Generación Nativa de Diagramas (HTML/CSS/JS):** Si la lección requiere ilustrar flujos lógicos complejos, mapas conceptuales, diagramas de bloques o esquemas de direccionamiento de memoria, y no se cuenta con un recurso gráfico autorizado, **es obligatorio generar el recurso visual de forma nativa.** Esto se logrará estructurando contenedores HTML, aplicando clases utilitarias de Tailwind CSS y manipulando lógica interactiva en JavaScript incrustada directamente en la diapositiva, priorizando un renderizado limpio, responsivo y escalable por sobre imágenes estáticas externas.
## 6.9 Protocolo Específico de Auditoría para Presentaciones
Antes de empaquetar o autorizar la publicación de una presentación en el portal oficial de la institución, esta debe superar de manera obligatoria la siguiente batería de pruebas manuales locales:
 1. **Validación Numérica de Canvas:** Certificar que el arreglo de diapositivas cuente exactamente con 16 ítems y que el indicador de interfaz no sufra de saltos o desfases lógicos.
 2. **Prueba de Estrés Multidispositivo:** Verificar de forma manual el correcto funcionamiento de las flechas del teclado, la barra espaciadora, los clics zonales laterales en simulación móvil, y los gestos táctiles de deslizamiento (*swipe*), descartando bloqueos en el hilo de ejecución o saltos involuntarios.
 3. **Auditoría del Motor de Reactivos:** Confirmar la correcta inyección de las cadenas de texto del array quizData, validar que el flujo de aciertos y fallos responda fielmente a las claves del PDF oficial de la materia, y comprobar que la transición automática se ejecute sin retrasos a los 2 segundos exactos.
 4. **Prueba de Resistencia de Zoom Extremo:** Activar el modo de pantalla completa por medio del doble clic nativo, proceder a alterar de forma repetida el zoom del navegador en la escala local (conmutando cíclicamente entre 100%, 110%, 125%, 150% y viceversa) y certificar documentalmente que el encabezado y el pie de página permanezcan invisibles o perfectamente ocultos sin corromper la alineación vertical centrada de los contenidos académicos.
# 14. REGLA ABSOLUTA
SI NO SE AUDITA, NO SE MODIFICA.
SI NO SE DOCUMENTA, NO EXISTE.
SI NO SE PUEDE TRAZAR, NO SE APRUEBA.
SI NO PASA CODE REVIEW, NO SE CIERRA.
EL INCUMPLIMIENTO DE CUALQUIER PASO DEL PRESENTE COMPENDIO INVALIDA EL PROCESO COMPLETO Y REINICIA LAS ACCIONES DESDE LA FASE DE AUDITORÍA INICIAL.
