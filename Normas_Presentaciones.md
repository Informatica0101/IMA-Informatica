# Normas de Estandarización de Presentaciones IMA (V2)

## Propósito
Este documento define las reglas técnicas, visuales, pedagógicas y de compatibilidad obligatorias para todas las presentaciones HTML del ecosistema educativo IMA. 

Ninguna presentación será válida si no cumple el 100% de estas normas. Es de carácter **obligatorio** tomar el archivo de la presentación aprobada para plantilla. (`Imperativos_Procedurales.html`) debe de ser la **plantilla base** de desarrollo para clonar su estructura de scripts, maquetación y estilos CSS subyacentes. NO EL CONTENIDO ACADEMICO.

---

# 1. Estructura Académica Obligatoria (14 diapositivas exactas)

Toda presentación que se construya a partir de la plantilla debe contener **EXACTAMENTE 16 diapositivas** indexadas de forma nativa (visualizadas como `1 / 16` hasta `16 / 16`).

No se permite:
- Menos de 16 diapositivas.
- Más de 16 diapositivas.
- Reordenamiento o alteración de la secuencia pedagógica establecida.

---

## Diapositiva 1 — Portada Institucional y del Curso 
Elementos obligatorios configurados en el contenedor central la plantilla base ("Imperativos_Procedurales.html") ya contiene esta estructura, solo modificar el nombre del tema y la fecha, verificar el parcial es el correcto y la asignatura:
La presentacion tomada como plantilla debe de contener lo siguiente:
- Logo institucional centrado con tamaño responsivo (`width: 250px;` en escritorio / `width: 100px;` en móviles con margen inferior adaptativo).
- Título principal del tema estructurado con la etiqueta `<h2>`.
- Bloque de metadatos académicos en un contenedor de texto de tamaño grande (`text-lg`) y color gris (`text-gray-500`) que especifique de forma estricta:
  - Asignatura y Unidad correspondiente.
  - Grado, Carrera de Bachillerato Técnico Profesional y Sección.
  - Nombre completo del docente antecedido por su título académico.
  - Fecha exacta de la sesión en formato natural.

---

## Diapositivas 2 a 12 — Desarrollo del Contenido Temático y Práctico
Algunas presentaciones mostraran dos temas, en ese caso las 11 diapositivas deberan dividirse de manera segun la cantidad de contenido de los temas, si es un tema mas extenso necesitara mas diapositivas. las secciones deben ir antes del Quiz.
Secuencia dedicada a la exposición progresiva de conceptos teóricos y aplicaciones:
- **Títulos de Diapositiva:** Deben maquetarse utilizando la etiqueta `<h3>` para preservar la jerarquía visual de la proyección.
- **Cajas de Concepto Clave (`.concept-box`):** Todo concepto central, definición modular o diferenciación de arquitecturas debe encapsularse en bloques de diseño con alineación a la izquierda, fondo sutil (`#f9fafb`) y un borde lateral izquierdo sólido de 8px (grosor adaptable a 4px en móviles). Los colores de borde pueden variar de acuerdo con el contexto pedagógico (azul estándar, azul claro, amarillo de advertencia, verde de éxito o gris neutro).
- **Listas y Elementos Secuenciales:** Se prohíbe el uso de párrafos extensos y saturados sin separación. Las series de pasos lógicos o las descripciones de arquitecturas físicas de hardware/software deben organizarse en listas ordenadas (`<ol>`) o desordenadas (`<ul>`) con tipografía espaciada y legible.
- **Diapositiva 12 (Ejercicio Guiado de ejemplo):** Esta diapositiva se destina al planteamiento de un problema técnico o cotidiano, desglosando una guía ordenada paso a paso para la resolución del mismo, el ejercicio debe ser basico y no ser repedito por algun ejemplo anterior de la presentacion o de otro tema anterior o posterior de la misma asignatura

---

## Diapositiva 13 — Actividad Práctica y Asignación
Sección de aplicación individual autónoma titulada obligatoriamente como **"Actividad en clase"**. Debe contener de forma explícita:
- Las instrucciones detalladas de la actividad técnica a realizar por el alumno.
- El objetivo conceptual de la tarea (vincular el procesamiento matemático, uso de memoria o lógica imperativa estudiada).
- Nota aclaratoria o recordatorio en formato itálico y fuente reducida sobre los criterios específicos de la arquitectura que se evaluará en los apuntes del cuaderno o su trabajo en la computadora segun la clase, para su posterior revisión en la clase práctica.
- la actividad guiada debe ser ejercicio debe ser basico y no ser repedito por algun ejercicio o ejemplo de ejercicio anterior de la presentacion o de otro tema anterior o posterior de la misma asignatura

---

## Diapositivas 15 — Cuestionario Automatizados de Evaluación
Bloque interactivo controlado dinámicamente por la matriz de datos de la aplicación (`quizData`),debe de contener las 10 preguntas en la misma diapositiva:
- **Diapositiva 15:** Cuestionario de Evaluación (Preguntas 1 a 10).

Reglas críticas de los cuestionarios:
- El examen consta de **10 preguntas de opción múltiple en total**, distribuidas exactamente a razón de **10 preguntas por diapositiva**.
- Cada pregunta contará con cuatro opciones en forma de botones dinámicos (`.quiz-option`). Solo una opción será matemáticamente correcta.
- Las opciones incorrectas deben operar como distractores académicos plausibles basados fielmente en los textos técnicos estudiados; quedan prohibidas las respuestas de descarte obvio.
- Al interactuar con las opciones, el script bloqueará los botones y renderizará una respuesta visual inmediata cambiando los estilos del botón presionado (Verde `#d1fae5` para aciertos / Rojo `#fee2e2` para fallos) junto con un mensaje explícito de retroalimentación en la parte inferior antes de avanzar automáticamente tras 2 segundos al siguiente reactivo.

---

## Diapositiva 16 — Cierre Institucional de la Presentación
Diapositiva final titulada obligatoriamente **"¡Fin del Tema!"**. Debe incluir de forma indispensable:
- Un bloque conceptual destacado (`.concept-box`) con borde azul que invite a un espacio de preguntas abiertas sobre el enfoque estudiado.
- Instrucciones finales para que los estudiantes preparen sus apuntes, libretas y ejercicios prácticos de cara a las revisiones del taller presencial.

---

# Restricciones de Contenido e Integridad Académica

* **Fuentes Autorizadas:** Únicamente se permite extraer información teórica y técnica de los PDFs oficiales proporcionados en la carpeta de la asignatura correspondiente.
* **Análisis de Planes de Clase:** Es obligatorio identificar el tema correspondiente a la fecha exacta mediante el Plan de Clases oficial del instituto.
* **Coherencia Temporal:** Revisar el tema anterior y el posterior para evitar saltos lógicos o repeticiones innecesarias.
* **Temas Secundarios:** Solo se permite complementar información externa (como ejercicios de PSeInt, sintaxis complementaria o estructuras de control) si están explícitamente mencionados en el plan de clases.
* **Metadatos de Preguntas (CRÍTICO):** Toda pregunta inyectada en el código debe incluir de manera obligatoria un objeto estructurado con las claves exactas: `{ question, options, answer, tema, asignatura, grado, nivel }`. Queda estrictamente **PROHIBIDO** el uso de la palabra `"General"` como comodín en el campo de tema, así como las clasificaciones automáticas por palabras clave o inferencias no académicas. La clasificación se realiza exclusivamente desde el origen de la presentación.

---

# 2. Diseño e Identidad Visual Institucional

## Tipografía Obligatoria (Proyectable y Legible)
Las fuentes se importan desde Google Fonts y se configuran bajo las siguientes reglas de estilo y tamaños responsivos:
- **Títulos de Portada (`<h2>`):** Fuente **Poppins** (peso 800), con un tamaño de visualización proyectable de **3rem** en escritorio y **1.75rem** en dispositivos móviles. Color azul institucional (`#0d6efd`).
- **Títulos de Contenido (`<h3>`):** Fuente **Poppins** (peso 700), con un tamaño de **2.25rem** en escritorio y **1.4rem** en móviles. Color gris oscuro neutro (`#1f2937`) para garantizar un alto contraste.
- **Cuerpo de Texto y Listas (`p`, `li`, `.quiz-option`):** Fuente **Inter** (peso 400/600), con un tamaño de **1.5rem** con interlineado de `1.6` en pantallas de escritorio, adaptándose automáticamente a **1rem** con interlineado de `1.4` en pantallas móviles. El color del texto base debe ser `#4b5563` o `#1f2937`.
- **Bloques de Código y Consolas:** Fuente **Console / monospace** (estilo PSeInt o Code Studio). Se debe mantener una indentación estricta, usar tipografía limpia y no aplicar estilos decorativos distractores.

## Paleta de Colores Institucional
El entorno visual se limita de manera estricta a los siguientes colores base:
- **Azul Principal (`#0d6efd` / `#0b5ed7`):** Utilizado para títulos de portada, bordes de enfoque y botones de navegación activa.
- **Gris de Fondo y Contornos (`#f3f4f6` / `#e5e7eb` / `#9ca3af`):** Empleado en la estructura del canvas de fondo, bordes de opciones de cuestionarios y contadores de navegación.
- **Blanco Puro (`#ffffff`):** Color exclusivo del contenedor central de las diapositivas (`#presentation-container`) para asegurar la máxima nitidez ante proyectores escolares.

---

# 3. Encabezado y Pie de Página Global

La presentación debe integrar los elementos globales de identidad de la plataforma educativa de forma idéntica a la página principal (`index.html`):
- **Encabezado (`<header id="page-header">`):** Fondo blanco con una sombra ligera (`shadow-sm`), alineación flexible que ubica a la izquierda el logo de la institución (`style="width: 150px; height: auto;"` en escritorio / `width: 100px;` en móviles) junto al título de la asignatura; y a la derecha un enlace para "Volver al Inicio" apuntando a `../../index.html`.
- **Pie de Página (`<footer id="page-footer">`):** Bloque de fondo gris oscuro (`bg-gray-900`) y texto blanco centrado que muestra de forma obligatoria la imagen de la bandera de Honduras (`width="60"`) alineada horizontalmente junto al texto de derechos reservados del Instituto María Auxiliadora - Área de Informática.

---

# 4. Sistema de Navegación Global Multidispositivo

El script debe interceptar y procesar las interacciones de los usuarios en entornos de escritorio y móviles bajo las siguientes reglas:

## Dispositivos de Escritorio (Teclado y Ratón)
- **Flecha Derecha o Barra Espaciadora:** Avanzar inmediatamente a la siguiente diapositiva. Para la barra espaciadora, se debe prevenir el comportamiento por defecto del navegador (`e.preventDefault()`).
- **Flecha Izquierda:** Retroceder a la diapositiva anterior.
- **Clic de Ratón Continuo:** Un clic simple en cualquier región libre del contenedor (`#presentation-container`) provocará el avance a la siguiente diapositiva, excepto cuando se interactúe con funciones como el doble clic en la portada de la presentacion para activar el modo pantalla completa o elementos interactivos como  hipervínculos, cajas de texto (`.concept-box`) o botones de cuestionarios (`.quiz-option`).
- **Botones Manuales de Control:** Un contenedor de botones inferior (`#controls-wrapper`) proporciona controles gráficos de *"Anterior"* y *"Siguiente"*. El botón anterior se deshabilita automáticamente en la diapositiva 1, y el botón siguiente hace lo propio al alcanzar la diapositiva 14, en modo panatalla completa deben de ocultarse permitiendo la navegacion con el teclado, gestor y clics, 

## Dispositivos Móviles (Gestos Táctiles y Zonas de Toque)
- **Zonas de Toque Simples:** Al registrarse un toque en una pantalla móvil ($\le$ 768px), el script evaluará la coordenada horizontal del impacto en relación con el ancho total del contenedor. Si el toque ocurre dentro del primer **30% de la pantalla (lado izquierdo)**, la presentación retrocederá. Si ocurre en el **70% restante (lado derecho)**, la presentación avanzará.
- **Gestos de Desplazamiento (Swipe):** El sistema registrará los vectores de movimiento en los ejes $X$ e $Y$. Si el desplazamiento horizontal es predominante y la distancia del deslizamiento supera un umbral estricto de **50 píxeles**, se ejecutará la navegación:
  - **Swipe de derecha a izquierda (Desplazamiento a la izquierda):** Avanzar diapositiva.
  - **Swipe de izquierda a derecha (Desplazamiento a la derecha):** Retroceder diapositiva.

---

# 5. Modo de Pantalla Completa y Control de Zoom Híbrido

## Activación y Comportamiento Base
El modo de pantalla completa nativo se dispara al registrarse un **doble clic** o un **doble toque** continuado sobre cualquier área libre de la portada en la presentación (utilizando la API `requestFullscreen()`).

Al conmutarse el estado de pantalla completa, la interfaz ejecutará las siguientes transformaciones de estado visual mediante la adición de la clase CSS `.hide-element`:
- Ocultar por completo el encabezado institucional (`#page-header`).
- Ocultar por completo el pie de página global (`#page-footer`).
- Ocultar por completo el wrapper de los botones de navegación manual (`#controls-wrapper`).
- Mantener activo el contador de diapositivas (`#slide-counter`), la navegación por teclado y los gestos táctiles.

## Resiliencia y Control del Zoom del Navegador (CRÍTICO)
Debido a que los niveles de zoom del navegador pueden alterarse de forma manual durante una proyección o clase en vivo, el sistema de auditoría de métricas visuales del script (`checkFullscreenMetrics`) está obligado a validar el estado de la interfaz de forma híbrida:

> ### Regla de Control de Redimensión por Zoom:
> La función encargada de vigilar los cambios de escala y dimensiones de la pantalla (`window.addEventListener('resize')`) debe programarse con un retraso de ejecución asíncrono (*debouncing* de 100ms) para recalcular las métricas del visor. 
> 
> Si el script detecta que la ventana del navegador ha alcanzado las dimensiones máximas del monitor producto de una maximización forzada, un cambio de escala o la activación del modo de presentación (evaluando si la altura de la ventana es mayor o igual a la altura física de la pantalla menos un umbral de tolerancia: `window.innerHeight >= (screen.height - 15)`), se forzará la **auto-ocultación absoluta** del encabezado y el pie de página. 
> 
> Esta función tiene como propósito **impedir bajo cualquier circunstancia que el encabezado y el pie de página vuelvan a renderizarse o a desbordarse en la pantalla como consecuencia de aplicar zoom** mientras la presentación se encuentra en modo fullscreen, manteniendo la interfaz limpia y libre de elementos distractores.

---

# 6. Gestión de Componentes Gráficos y Visuales

- **Imágenes Externas:** Toda imagen incorporada en las diapositivas (`<img>`) debe contar con el atributo alternativo (`alt`) obligatorio por motivos de accesibilidad y validación. Deben configurarse con propiedades fluidas para garantizar que sean completamente responsivas y no desborden los límites físicos de la diapositiva.
- **Iconografía Contextual:** En caso de no contar con imágenes externas para un bloque conceptual, se deberá utilizar iconografía vectorial que corresponda directamente al contexto temático de la asignatura.
- **Gráficos y Diagramas Nativos (HTML/CSS/JS):** Si no se dispone de recursos de imágenes externas para ilustrar conceptos complejos o de reforzar el contenido pedagógico, es obligatorio **generar los elementos visuales de forma nativa**. Esto implica construir gráficos, diagramas de flujo, esquemas de memoria y figuras utilizando código estructurado (contenedores HTML, utilidades de Tailwind CSS y lógica en JavaScript) incrustado directamente dentro del cuerpo de las diapositivas de la presentación, priorizando el renderizado limpio sobre los recursos externos.

---

# 7. Protocolo de Auditoría Técnica Obligatoria

Ninguna presentación de la asignatura de informática será empaquetada ni dada por aprobada en el portal IMA si no supera de forma exitosa los siguientes puntos de control de calidad en el entorno local antes de su despliegue:
1. **Validación Numérica Estricta:** Comprobar que el contador registre exactamente 14 diapositivas en total y que la navegación secuencial no salte ningún índice.
2. **Auditoría de Navegación Multidispositivo:** Verificar que los eventos de teclado (Flechas/Espacio), clics zonales en escritorio, toques y gestos de deslizamiento (*swipe*) en móviles funcionen de manera fluida y sin bloqueos de interfaz.
3. **Control de Cuestionarios:** Validar que los dos bloques de preguntas inyecten los textos de forma correcta, que evalúen la lógica de acierto/error según las hojas de respuestas del PDF y que realicen la transición automática de diapositivas al cumplir el ciclo de 5 preguntas.
4. **Prueba de Resistencia de Pantalla Completa y Zoom:** Activar el modo fullscreen por doble clic, modificar repetidamente el zoom del navegador (escalar a 110%, 125%, 150% y viceversa) y certificar que el encabezado y el pie de página permanezcan completamente ocultos sin corromper la alineación vertical centrada de los contenidos académicos.
