--------------------------------------------------NO AGREGAR MODIFICAR O ELIMAR TEXTO ANTES Y DESPUÉS DE ESTA LINEA---------------------------------
# Manual de Estándares Psicométricos y Especificación Técnica de Reactivos (QuizPro v6.1)

Este documento define de manera estricta los principios pedagógicos, restricciones geométricas de longitud, simetría semántica y estructuras sintácticas de objetos lógicos que deben cumplir todos los archivos distribuidos `.json` dentro del ecosistema de evaluación local de QuizPro. 

Su aplicación es obligatoria para neutralizar la vulneración de las métricas avanzadas (Índice de Confianza de Respuesta [ICR] e Índice de Adivinación) causada por el descarte visual o la asimetría de los distractores.

---

## 1. PROPÓSITO NORMATIVO

Este documento establece los principios pedagógicos, psicométricos y de diseño cognitivo obligatorios para la construcción de reactivos dentro del ecosistema QuizPro.

Su objetivo es garantizar que las respuestas obtenidas reflejen conocimiento real, comprensión conceptual y capacidad de aplicación, evitando que el estudiante obtenga resultados positivos mediante:
* Adivinación aleatoria.
* Descarte visual.
* Identificación de patrones de redacción.
* Reconocimiento de palabras clave.
* Diferencias de longitud.
* Distractores absurdos o fuera de contexto.

El cumplimiento de estas normas es obligatorio para preservar la validez de:
* Índice de Confianza de Respuesta (ICR).
* Índice de Adivinación (IA).
* Nivel de Dominio.
* Analítica de Aprendizaje.
* Recomendaciones Adaptativas.
* Evaluación de Competencias.

---

## 2. PRINCIPIO DE EVALUACIÓN DEL APRENDIZAJE

Todo reactivo debe evaluar conocimiento, comprensión o aplicación. Queda prohibida la construcción de preguntas cuya respuesta pueda deducirse únicamente por:
* Patrones visuales.
* Diferencias gramaticales.
* Longitud de las opciones.
* Uso de palabras técnicas exclusivas.
* Eliminación obvia de distractores absurdos.

Un estudiante debe responder correctamente porque comprende el contenido y no porque detectó una pista involuntaria.

---

## 3. REGLA DE ORO DE LONGITUD Y SIMETRÍA VISUAL

### Restricciones Obligatorias

#### Simetría de caracteres
La diferencia en la longitud total de caracteres entre la opción más larga y la más corta dentro de un mismo reactivo no debe superar el **15%**. Esto neutraliza el sesgo de "extensión equivalente a veracidad".

#### Simetría semántica
Todas las opciones deben presentar un nivel de detalle equivalente.
* **Incorrecto:** * Opción A: Definición técnica completa y detallada con ejemplos contextuales.
  * Opción B: Frase breve.
  * Opción C: Palabra aislada.
  * Opción D: Oración incompleta.
* **Correcto:** Todas las opciones poseen una profundidad conceptual homogénea.

#### Simetría gramatical
Se debe mantener estricta consistencia en la morfología de las respuestas:
* Si la respuesta correcta inicia con un **sustantivo**, todos los distractores deben iniciar con un sustantivo.
* Si la respuesta correcta inicia con un **verbo en infinitivo**, todos los distractores deben iniciar con un verbo en infinitivo.
* Si la respuesta correcta describe una **definición**, todas las opciones deben estructurarse de la misma forma.

---

## 4. PROHIBICIÓN DE PALABRAS CLAVE EXCLUSIVAS

Queda estrictamente prohibido que la respuesta correcta sea la única en incorporar terminología técnica avanzada, acrónimos especializados o nombres de algoritmos presentes literalmente en las guías de estudio, mientras los distractores utilizan lenguaje coloquial.

* **Ejemplo Incorrecto (Evaluación de Encapsulamiento):**
  * A) Ocultar datos mediante modificadores de acceso de tipo private. *(Pista obvia)*
  * B) Crear variables dentro del programa.
  * C) Ejecutar ciclos repetitivos.
  * D) Mostrar mensajes en la consola.
* **Modificación Obligatoria:** Todas las opciones del reactivo deben poseer una complejidad léxica e informática similar para forzar la discriminación conceptual.

---

## 5. REGLA DE CONTEXTUALIZACIÓN HOMOGÉNEA

### Distractores dentro del mismo dominio
Todos los distractores utilizados en una pregunta deben pertenecer estrictamente a la **misma asignatura, al mismo tema y al mismo nivel de abstracción tecnológica**.

* **Prohibido:** En un reactivo de Programación Orientada a Objetos, introducir distractores cruzados que hagan referencia a hardware (impresoras, memorias RAM) o suites de Ofimática para rellenar los índices del array.
* **Permitido:** Si el tema del reactivo es *Relaciones entre Objetos*, todos los distractores deben ser componentes legítimos del mismo dominio: Herencia, Asociación, Composición, Encapsulamiento, Polimorfismo o Instanciación.

---

## 6. CRITERIO DE CONFUSIÓN TÉCNICA (ERRORES PLAUSIBLES)

Los distractores no deben ser opciones disparatadas; deben representar concepciones erróneas comunes o interpretaciones parciales del estudiante. Si un distractor es absurdo, se invalida el peso psicométrico del reactivo.

### Escala de Complejidad por Niveles Académicos

* **Nivel Básico:** Distractores conceptualmente relacionados con el área general pero con diferencias operacionales claras.
* **Nivel Intermedio:** Distractores conceptualmente cercanos que exigen al estudiante comprender la implementación práctica del elemento.
* **Nivel Avanzado:** Distractores pertenecientes al mismo marco conceptual específico, diseñados para evaluar la capacidad de diferenciar términos que se confunden frecuentemente entre sí (ej. *Asociación* frente a *Agregación*).

---

## 7. PROHIBICIÓN DE PATRONES DE POSICIÓN

La respuesta correcta no debe concentrarse de forma sistemática en un índice específico del array de opciones. La distribución estadística en la base de datos debe aproximarse a:
* **Opción A:** 25% | **Opción B:** 25% | **Opción C:** 25% | **Opción D:** 25%
* **Margen de tolerancia máximo admitido:** ±5% de desviación global.

---

## 8. PROHIBICIÓN DE ABSOLUTOS COMO PISTAS

Salvo que la definición del estándar de ingeniería lo exija textualmente, queda prohibido el uso de determinantes absolutos en las opciones de respuesta, tales como:
* `Siempre`, `Nunca`, `Todos`, `Ninguno`, `Únicamente`, `Exclusivamente`.

Estadísticamente, los estudiantes identifican estas palabras como indicadores directos de opciones falsas por simple intuición gramatical.

---

## 9. PROHIBICIÓN DE OPCIONES EVIDENTEMENTE DIFERENTES

Ninguna opción dentro del payload debe resaltar frente a las demás por alteraciones intencionadas o descuidadas en su formato: uso asimétrico de mayúsculas, inclusión aislada de símbolos especiales, números o términos extremadamente avanzados. Visualmente, las cuatro opciones deben ofrecer la misma plausibilidad de elección.

---

## 10. REGLA DE UNA SOLA RESPUESTA CORRECTA

Debe existir única y exclusivamente una respuesta objetivamente correcta y verificable para el enunciado planteado. Las opciones incorrectas (distractores) deben ser técnicamente válidas y coherentes dentro de la informática, pero claramente erróneas o insuficientes para responder a la necesidad específica del enunciado.

---

## 11. REGLA DE EVALUACIÓN DEL DESEMPEÑO (VALIDEZ DE LA ANALÍTICA)

Las preguntas deben diseñarse estructuralmente para que las métricas lógicas de QuizPro puedan aislar y categorizar el estado cognitivo del alumno:
* **Conocimiento sólido:** Selección rápida de la opción simétrica correcta.
* **Conocimiento parcial:** Dudas y oscilación entre distractores plausibles del mismo dominio.
* **Adivinación:** Patrón de respuesta que altera negativamente el Índice de Adivinación al fallar reactivos con simetría homogénea.

Un reactivo que viole la simetría distorsiona los tiempos de respuesta físicos y altera el ICR, destruyendo la fiabilidad de las recomendaciones adaptativas del tablero docente.

---

## 12. RESTRICCIONES DE INTEGRIDAD TÉCNICA Y ANTICORRUPCIÓN DE DATOS

Para preservar la calidad del banco y el respeto al nivel académico de la institución, se establecen tres prohibiciones tecnológicas absolutas sobre los archivos fuentes:

### A. Prohibición de Marcadores de Posición (*Zero Placeholder Policy*)
Queda estrictamente prohibido el uso de cadenas de texto genéricas, vacías o de prueba automatizada para rellenar los índices de preguntas u opciones (ej. *"Pregunta de validación técnica avanzada 49"*, *"Opción Correcta"*, *"Distractor 1"*, o *"Nulo"*). 
* Todo reactivo guardado en el JSON local debe contener un enunciado científico real, coherente con la currícula, e incorporar distractores técnicos auténticos y funcionales. El uso de *placeholders* se considerará una falta grave a la integridad del sistema.

### B. Prohibición Absoluta de Scripts de Automatización de Datos
Está prohibido el uso de scripts, utilidades de conversión automática de archivos (*bulk-parsers*) o algoritmos de inteligencia artificial que realicen cargas masivas sin supervisión humana. 
* El traspaso de reactivos exige una auditoría obligatoria individual, línea por línea. Sin inspección visual humana, es imposible certificar el cumplimiento semántico, corregir ambigüedades o validar el contexto pedagógico exacto del reactivo.

### C. Erradicación de Respuestas Acopladas (*Anti-Hardcoding Rule*)
Se prohíbe el uso de la estructura del formato heredado (*legacy*) donde la respuesta correcta se deducía a través del índice posicional rígido del array. 
* El sistema actual exige la sanitización absoluta del campo `respuesta_correcta_literal`. El valor de este string debe corresponder con exactitud matemática a una de las opciones listadas en el objeto, permitiendo que el motor frontend baraje (*shuffle*) dinámicamente las opciones sin corromper la validación del intento del alumno.

---

## 13. ESPECIFICACIÓN SINTÁCTICA Y COMPOSICIÓN DE OBJETOS (.json)

Todos los reactivos deben estructurarse de forma estricta según el tipo de pregunta, inyectando las etiquetas HTML de formato permitidas y respetando la homogeneidad geométrica de las opciones.

### A. Tipo: Funcionalidad (`funcionalidad`)
Evaluación avanzada de conceptos cruzados homogéneos con restricción de longitud ($< 15\%$ de varianza en caracteres).

```json
{
  "id": "Q-12-POO-AV-001",
  "grado": "Duodecimo",
  "asignatura": "Programacion_Orientada_a_Objetos",
  "tema": "Relaciones entre Objetos",
  "tipo_pregunta": "funcionalidad",
  "enunciado": "¿Qué representa la asociación en la programación orientada a objetos?",
  "opciones": [
    "Una relación donde un objeto puede interactuar o utilizar otro objeto.",
    "Una técnica para heredar atributos y métodos de otra clase externa.",
    "Un mecanismo para ocultar datos lógicos mediante encapsulamiento.",
    "Un proceso para crear múltiples objetos a partir de una misma clase."
  ],
  "respuesta_correcta_literal": "Una relación donde un objeto puede interactuar o utilizar otro objeto."
}

```
### B. Tipo: Completación (completacion)
Inyección segura de componentes de código empleando la etiqueta <code> para aislar la sintaxis real.
```json
{
  "id": "Q-12-PRG2-BAS-015",
  "grado": "Duodecimo",
  "asignatura": "Programacion_2",
  "tema": "Sintaxis",
  "tipo_pregunta": "completacion",
  "enunciado": "En lenguajes estructurados de la familia C, el operador empleado para realizar el incremento compacto en una unidad de una variable numérica se codifica como <code>________</code>.",
  "opciones_visibles": ["++", "+=", "==", "&&"],
  "respuesta_correcta_literal": "++"
}

```
### C. Tipo: Verdadero o Falso (verdadero_falso)
Estructura binaria simétrica para la validación de postulados de arquitectura de sistemas.
```json
{
  "id": "Q-10-INF-INT-022",
  "grado": "Decimo",
  "asignatura": "Informatica",
  "tema": "Hardware",
  "tipo_pregunta": "verdadero_falso",
  "enunciado": "La memoria volatil de acceso aleatorio (RAM) conserva los datos de ejecucion y las instrucciones del sistema operativo de forma permanente tras interrumpirse el flujo electrico.",
  "opciones": ["Verdadero", "Falso"],
  "respuesta_correcta_literal": "Falso"
}

```
## 14. MAPA CURRICULAR Y DISTRIBUCIÓN DE TEMAS OBLIGATORIOS
### 10.° GRADO — Asignatura: Informática
 * **Nivel Básico:** Historia y evolución de la computación; arquitectura básica del ordenador (Hardware y Software); clasificación y funciones de periféricos (Entrada, Salida y Almacenamiento).
 * **Nivel Intermedio:** Fundamentos de Internet, redes de datos y protocolos; introducción al Internet de las Cosas (IoT); operación de hardware de interfaz humana; unidades de memoria volátil y no volátil (RAM, ROM, HDD, SSD); componentes internos (CPU, Placa Base, Tarjeta de Red).
 * **Nivel Avanzado:** Taxonomía del Software (Sistema, Aplicación, Programación); Seguridad Informática (Tipos de malware, software antivirus y protección); Sistemas Operativos (Windows, Linux, macOS, Android).
### 11.° GRADO — Asignatura: Informática Aplicada
 * **Nivel Básico:** Arqueología tecnológica (Tubos al vacío, transistores, circuitos integrados); evolución de medios de almacenamiento magnéticos y ópticos; cronología y evolución de Sistemas Operativos; orígenes de Internet (ARPANET a la WWW).
 * **Nivel Intermedio:** Sistemas de numeración (Binario, Hexadecimal y conversión); codificación ASCII; entornos de Interfaz Gráfica de Usuario (GUI) y operaciones del sistema de archivos; formatos multimedia y de documentos; gestión de entornos (instalación y desinstalación); higiene digital y descarga segura.
 * **Nivel Avanzado:** Entornos de Interfaz de Línea de Comandos (CLI); sintaxis de comandos de administración de directorios; automatización mediante scripts por lotes (.bat); configuración de firmware (BIOS/UEFI); procesos de mantenimiento (formateo lógico, bootloaders e instalación limpia).
### 11.° GRADO — Asignatura: Ofimática
 * **Nivel Básico:** Fundamentos de la automatización de oficinas; ergonomía y técnicas de mecanografía; métodos abreviados de teclado globales; procesadores de texto (interfaz, formato y persistencia); hojas de cálculo básicas (celdas, filas, columnas y fórmulas aritméticas); editores de presentaciones.
 * **Nivel Intermedio:** Maquetación avanzada en procesadores de texto (tablas de contenido, encabezados, marcas de agua); análisis profundo en hojas de cálculo (tablas dinámicas, funciones lógicas/matemáticas complejas, formato condicional).
 * **Avanzado:** Modelado de datos relacionales (*Power Pivot*); establecimiento de cardinalidad y relaciones lógicas entre tablas; automatización mediante Macros (grabación, edición y depuración de instrucciones estructuradas).
### 11.° GRADO — Asignatura: Programación
 * **Nivel Básico:** Fundamentos del desarrollo de software e historia de la programación (Alan Turing y bases teóricas); diseño de instrucciones (algoritmos y lógica); álgebra de Boole y evaluación de expresiones lógicas/aritméticas; técnicas de representación (diagramas de flujo, lenguaje natural); clasificación de lenguajes por nivel de abstracción.
 * **Nivel Intermedio:** Representación mediante Pseudocódigo; gestión de estados (declaración de variables, tipos de datos, entrada/salida); sintaxis y palabras reservadas; estructuras de control de flujo (condicionales y bucles); paradigmas de programación; fundamentos de persistencia (modelos relacionales básicos).
 * **Nivel Avanzado:** Estructuras de datos lineales homogéneas (vectores y matrices); modularización (funciones, subrutinas y paso de parámetros); sistemas empotrados o embebidos; análisis comparativo de sintaxis de alto nivel; transición al paradigma orientado a objetos.
### 11.° GRADO — Asignatura: Análisis y Diseño de Sistemas
 * **Nivel Básico:** Fundamentos de los Sistemas de Información y ciclo de vida del software (SDLC); ingeniería de requerimientos (funcionales y no funcionales); modelado de negocios (DFD contextual y descomposición).
 * **Nivel Intermedio:** Análisis estructurado y orientado a objetos (UML); construcción de diagramas estáticos y dinámicos (casos de uso, actividades); diseño de interfaces de usuario (UI/UX) y prototipado de baja fidelidad (*wireframes*).
 * **Nivel Avanzado:** Diseño de arquitectura de software (capas, cliente-servidor); diseño de datos detallado (transformación al modelo lógico y reglas de normalización: 1FN, 2FN, 3FN); estrategias de validación (pruebas de caja blanca/negra, unitarias, integración) y metodologías de despliegue.
### 12.° GRADO — Asignatura: Diseño Web
 * **Nivel Básico:** Arquitectura frontend cliente-servidor y ciclo HTTP/HTTPS; semántica estructural con HTML5 y validación de marcado; estilos de presentación con CSS3, cascada, herencia y el modelo de caja.
 * **Nivel Intermedio:** Diseño web adaptable (Media Queries, Flexbox, CSS Grid); interactividad nativa mediante JavaScript y manipulación estructurada de eventos del DOM; optimización de recursos web (WebP, SVG, compresión y rendimiento).
 * **Nivel Avanzado:** Despliegue y control de versiones (Git, flujos de desarrollo y alojamiento estático en GitHub Pages); programación asíncrona y consumo de APIs (fetch y flujos JSON); arquitectura PWA (Service Workers, manifiestos y ejecución offline).
### 12.° GRADO — Asignatura: Programación II
 * **Nivel Básico:** Transición de entornos lógicos a código real; sintaxis estricta de lenguajes compilados de la familia C (C, C++ o C#); configuración e interfaz de IDEs escolares (Dev-C++, Code::Blocks); estructura fundamental de un programa (librerías, #include, main y uso del ;); tipado de datos rígido nativo.
 * **Nivel Intermedio:** Implementación en código de estructuras condicionales avanzadas (if, else if, switch); bucles e iteraciones dinámicas (for, while, do-while, contadores); captura y formateo de datos por terminal (cin/cout, scanf/printf); operadores avanzados de asignación compuesta e incremento/decremento.
 * **Nivel Avanzado:** Declaración, llenado y lectura de arreglos unidimensionales (vectores) y bidimensionales (matrices) en código compilado; modularización práctica mediante funciones con retorno y paso de parámetros; introducción a la sintaxis limpia y tipado dinámico en Python; depuración manual de errores de sintaxis y lógica en consola.
### 12.° GRADO — Asignatura: Programación Orientada a Objetos (POO)
 * **Nivel Básico:** El paradigma orientado a objetos y abstracción del mundo real; anatomía de componentes (Clases, Objetos, Atributos y Métodos); ciclo de vida de instancias (constructores parametrizados y destructores); principio de encapsulamiento y modificadores de acceso (Público, Privado, Protegido) con métodos *Getters* y *Setters*.
 * **Nivel Intermedio:** El pilar de la Herencia (jerarquías, reutilización y uso de super/base); el pilar del Polimorfismo (sobrecarga en compilación y sobreescritura en ejecución); clases abstractas e interfaces como contratos estrictos de comportamiento.
 * **Nivel Avanzado:** Relaciones complejas de objetos en memoria (Asociación, Agregación y Composición); aplicación práctica de los principios de diseño SOLID; introducción al uso de patrones de diseño creacionales y estructurales básicos (Singleton, Factory Method).
## 15. CHECKLIST DE VALIDACIÓN OBLIGATORIA (FILTRO DE CALIDAD)
Antes de aprobar e integrar cualquier reactivo en los archivos de almacenamiento local, el auditor debe verificar manualmente el cumplimiento de los siguientes indicadores:
 * [ ] **Criterio de Unicidad:** Existe única y exclusivamente una respuesta correcta y objetiva para el enunciado.
 * [ ] **Homogeneidad de Dominio:** Todas las opciones pertenecen estrictamente al mismo campo conceptual y asignatura.
 * [ ] **Simetría Geométrica:** La variación de caracteres entre la opción más extensa y la más corta es estrictamente menor al 15%.
 * [ ] **Simetría Morfológica:** Todas las opciones presentan la misma estructura gramatical (coherencia en verbos, sustantivos o definiciones).
 * [ ] **Ausencia de Absurdos:** No existen distractores burdos, obsoletos o ajenos a la tecnología evaluada.
 * [ ] **Léxico Equivalente:** Ninguna opción destaca visualmente por incorporar palabras clave o términos técnicos de forma exclusiva.
 * [ ] **Plausibilidad de Fallo:** Los distractores representan errores lógicos reales realizables por un alumno con conocimiento incompleto.
 * [ ] **Alineación de Nivel:** La complejidad del reactivo se corresponde estrictamente con el grado y corte temático establecido en la malla.
 * [ ] **Ausencia de Placeholders:** El reactivo está libre de textos genéricos de relleno o datos nulos de simulación.
 * [ ] **Desacoplamiento Posicional:** La validación se realiza exclusivamente por respuesta_correcta_literal, erradicando índices *hardcoded*.
*Si el reactivo falla en cualquiera de los puntos anteriores, es rechazado inmediatamente para su reestructuración manual.*
```
---

El documento técnico ha sido actualizado y se encuentra blindado bajo los rigurosos estándares metodológicos requeridos por la institución.
---
```
------------------------------------------------NO AGREGAR, MODIFICAR O ELIMINAR TEXTO ANTES DE ESTA LINEA--------------------------------------
