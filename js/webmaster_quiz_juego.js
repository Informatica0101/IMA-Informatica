// Este archivo contiene la lógica y los datos del juego de WebMaster Quiz.
// Incluye las preguntas por tema y dificultad, y la configuración del juego.

const quizData = {
    html: {
        basico: [
            {
                question: "Etiqueta para el título más importante en una página:",
                type: "multiple-choice",
                options: ["Crear un enlace", "Definir un párrafo", "Crear un encabezado de nivel más alto", "Insertar una imagen"],
                correctAnswer: 2,
                help: "Esta etiqueta se utiliza para el título principal de una sección o página.",
                codeExample: "<h1>Este es un encabezado principal</h1>"
            },
            {
                question: "Etiqueta para un salto de línea simple:",
                type: "multiple-choice",
                options: ["`<p>`", "`<br>`", "`<h1>`", "`<a>`"],
                correctAnswer: 1,
                help: "Piensa en cómo forzar una nueva línea sin crear un nuevo párrafo.",
                codeExample: "<p>Línea 1<br>Línea 2</p>"
            },
            {
                question: "Atributo que especifica la URL de un enlace:",
                type: "multiple-choice",
                options: ["`src`", "`alt`", "`href`", "`link`"],
                correctAnswer: 2,
                help: "Este atributo es clave para dónde te llevará el hipervínculo.",
                codeExample: "<a href=\"https://www.ejemplo.com\">Visitar Ejemplo</a>"
            },
            {
                question: "Ordena los elementos para crear una tabla HTML:",
                type: "order-execution",
                fragments: ["<table>", "<tr>", "<td>", "Contenido de celda", "</td>", "</tr>", "</table>"],
                correctOrder: [0, 1, 2, 3, 4, 5, 6],
                help: "Recuerda la jerarquía de las tablas.",
                codeExample: `<table>
    <tr>
        <td>Contenido de celda</td>
    </tr>
</table>`
            },
            {
                question: "Significado de las siglas HTML:",
                type: "multiple-choice",
                options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"],
                correctAnswer: 0,
                help: "Es el lenguaje fundamental para la estructura de las páginas web.",
                codeExample: null
            },
            {
                question: "Etiqueta para definir un párrafo de texto:",
                type: "multiple-choice",
                options: ["`<pa>`", "`<p>`", "`<pr>`", "`<par>`"],
                correctAnswer: 1,
                help: "Es una de las etiquetas más básicas para bloques de texto.",
                codeExample: "<p>Este es un párrafo de ejemplo.</p>"
            },
            {
                question: "Atributo que indica la fuente de una imagen:",
                type: "multiple-choice",
                options: ["`link`", "`url`", "`src`", "`href`"],
                correctAnswer: 2,
                help: "Este atributo indica la ubicación del archivo de la imagen.",
                codeExample: "<img src=\"imagen.jpg\" alt=\"Descripción de la imagen\">"
            },
            {
                question: "Empareja la etiqueta HTML con su propósito:",
                type: "drag-match",
                pairs: [
                    { drag: "Cuerpo del documento", drop: "<body>" },
                    { drag: "Título de la página", drop: "<title>" },
                    { drag: "División o sección", drop: "<div>" },
                    { drag: "Lista no ordenada", drop: "<ul>" }
                ],
                help: "Cada etiqueta tiene un rol específico en la estructura de la página.",
                codeExample: null
            },
            {
                question: "Ordena la estructura básica de un documento HTML:",
                type: "order-execution",
                fragments: ["<!DOCTYPE html>", "<html>", "<head>", "<title>", "Título</title>", "</head>", "<body>", "Contenido</body>", "</html>"],
                correctOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                help: "Piensa en el orden en que se define un documento web.",
                codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>Título</title>
</head>
<body>
    Contenido
</body>
</html>`
            },
            {
                question: "Etiqueta para crear un hipervínculo:",
                type: "multiple-choice",
                options: ["`<link>`", "`<a>`", "`<href>`", "`<url>`"],
                correctAnswer: 1,
                help: "Esta etiqueta es la abreviatura de 'anchor'.",
                codeExample: "<a href=\"otra_pagina.html\">Ir a otra página</a>"
            },
            {
                question: "Propósito de la declaración `<!DOCTYPE html>`:",
                type: "multiple-choice",
                options: ["Define el tipo de documento como HTML4", "Indica que se está usando la versión HTML5", "Define el idioma del documento", "Indica que el documento es un archivo XML"],
                correctAnswer: 1,
                help: "Es la primera línea de un documento HTML5 y es crucial para el renderizado correcto del navegador.",
                codeExample: null
            },
            {
                question: "Sintaxis para insertar comentarios en HTML:",
                type: "multiple-choice",
                options: ["`// Comentario`", "`/* Comentario */`", "`<!-- Comentario -->`", "`<comment>Comentario</comment>`"],
                correctAnswer: 2,
                help: "Los comentarios HTML son útiles para documentar tu código sin que afecte la visualización de la página.",
                codeExample: "<!-- Este es un comentario HTML -->"
            },
            {
                question: "Ordena los elementos para crear una lista ordenada:",
                type: "order-execution",
                fragments: ["<ol>", "<li>", "Primer ítem", "</li>", "<li>", "Segundo ítem", "</li>", "</ol>"],
                correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
                help: "Recuerda la estructura para listas numeradas.",
                codeExample: `<ol>
    <li>Primer ítem</li>
    <li>Segundo ítem</li>
</ol>`
            },
            {
                question: "Empareja la etiqueta HTML con su tipo de visualización (línea/bloque):",
                type: "drag-match",
                pairs: [
                    { drag: "Bloque", drop: "<div>" },
                    { drag: "En línea", drop: "<span>" },
                    { drag: "Bloque", drop: "<p>" },
                    { drag: "En línea", drop: "<a>" }
                ],
                help: "Los elementos de bloque ocupan todo el ancho disponible, los en línea solo el espacio necesario.",
                codeExample: null
            },
            {
                question: "Diferencia semántica entre `<strong>` y `<em>`:",
                type: "multiple-choice",
                options: ["`<strong>` es para cursiva, `<em>` para negrita.", "`<strong>` para énfasis, `<em>` para importancia.", "`<strong>` para importancia, `<em>` para énfasis.", "No hay diferencia, ambos solo aplican estilos visuales."],
                correctAnswer: 2,
                help: "Ambas etiquetas tienen un significado que va más allá de su estilo visual predeterminado.",
                codeExample: "<strong>Texto importante</strong>, <em>texto enfatizado</em>"
            },
            {
                question: "Etiqueta para un encabezado de segundo nivel:",
                type: "multiple-choice",
                options: ["`<h2>`", "`<h1.2>`", "`<head2>`", "`<heading2>`"],
                correctAnswer: 0,
                help: "Los encabezados van del h1 al h6, siendo h1 el más importante.",
                codeExample: "<h2>Subtítulo</h2>"
            },
            {
                question: "Atributo de imagen que muestra texto si la imagen no se carga:",
                type: "multiple-choice",
                options: ["`description`", "`title`", "`alt`", "`text`"],
                correctAnswer: 2,
                help: "Este atributo muestra un texto como alternativa a la imagen.",
                codeExample: "<img src=\"logo.png\" alt=\"Logo de la empresa\">"
            },
            {
                question: "Ordena los elementos para crear una lista no ordenada:",
                type: "order-execution",
                fragments: ["<ul>", "<li>", "Café", "</li>", "<li>", "Té", "</li>", "</ul>"],
                correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
                help: "Recuerda la estructura para listas con viñetas.",
                codeExample: `<ul>
    <li>Café</li>
    <li>Té</li>
</ul>`
            },
            {
                question: "Etiqueta para definir el pie de página de un documento o sección:",
                type: "multiple-choice",
                options: ["`<bottom>`", "`<end>`", "`<footer>`", "`<page-end>`"],
                correctAnswer: 2,
                help: "Suele contener información de derechos de autor o contacto.",
                codeExample: "<footer>Derechos de autor 2023</footer>"
            },
            {
                question: "Etiqueta para una celda de encabezado en una tabla:",
                type: "multiple-choice",
                options: ["`<td>`", "`<th>`", "`<headcell>`", "`<tr>`"],
                correctAnswer: 1,
                help: "Esta etiqueta se utiliza para los títulos de las columnas o filas en una tabla.",
                codeExample: `<th>Nombre</th>`
            }
        ],
        intermedio: [
            {
                question: "Atributo para que una celda de tabla ocupe varias columnas:",
                type: "multiple-choice",
                options: ["`rowspan`", "`colspan`", "`cellspan`", "`merge-rows`"],
                correctAnswer: 1,
                help: "Este atributo se usa para expandir una celda a través de múltiples columnas.",
                codeExample: `<table>
    <tr>
        <td colspan="2">Celdas fusionadas</td>
    </tr>
</table>`
            },
            {
                question: "Empareja el tipo de `input` de formulario con su uso:",
                type: "drag-match",
                pairs: [
                    { drag: "Campo de texto", drop: `<input type="text">` },
                    { drag: "Contraseña", drop: `<input type="password">` },
                    { drag: "Botón de envío", drop: `<input type="submit">` },
                    { drag: "Casilla de verificación", drop: `<input type="checkbox">` }
                ],
                help: "Cada tipo de input está diseñado para un tipo específico de interacción del usuario.",
                codeExample: null
            },
            {
                question: "Etiqueta para incrustar otro documento HTML en la página actual:",
                type: "multiple-choice",
                options: ["`<video>`", "`<iframe>`", "`<embed>`", "`<object>`"],
                correctAnswer: 1,
                help: "Piensa en cómo se inserta una 'ventana' a otro documento dentro del tuyo.",
                codeExample: `<iframe src="https://www.ejemplo.com" width="600" height="400"></iframe>`
            },
            {
                question: "Ordena para definir un formulario HTML básico:",
                type: "order-execution",
                fragments: ["<form>", "<label for=\"name\">", "Nombre:</label>", "<input type=\"text\" id=\"name\">", "<button>", "Enviar</button>", "</form>"],
                correctOrder: [0, 1, 2, 3, 4, 5, 6],
                help: "Un formulario agrupa sus campos y acciones.",
                codeExample: `<form>
    <label for="name">Nombre:</label>
    <input type="text" id="name">
    <button>Enviar</button>
</form>`
            },
            {
                question: "¿A qué se refiere el término 'semántico' en HTML?",
                type: "multiple-choice",
                options: ["Al estilo de la página", "Al significado o propósito del contenido", "Al formato visual del texto", "A la interactividad del usuario"],
                correctAnswer: 1,
                help: "Se refiere a dar un significado claro a las etiquetas, más allá de cómo se ven.",
                codeExample: "<header>, <nav>, <article>, <section>, <aside>, <footer>"
            },
            {
                question: "Propósito principal de la etiqueta `<meta>`:",
                type: "multiple-choice",
                options: ["Definir el título de la página", "Proporcionar metadatos sobre el documento", "Vincular hojas de estilo externas", "Insertar scripts"],
                correctAnswer: 1,
                help: "Esta etiqueta proporciona información sobre la página que no es visible para el usuario.",
                codeExample: `<meta charset="UTF-8">`
            },
            {
                question: "Empareja los atributos de una imagen con su función:",
                type: "drag-match",
                pairs: [
                    { drag: "Ruta de la imagen", drop: "`src`" },
                    { drag: "Texto alternativo", drop: "`alt`" },
                    { drag: "Ancho de la imagen", drop: "`width`" },
                    { drag: "Alto de la imagen", drop: "`height`" }
                ],
                help: "Estos atributos son esenciales para que las imágenes se muestren correctamente y sean accesibles.",
                codeExample: null
            },
            {
                question: "Ordena los elementos para vincular una hoja de estilo CSS externa:",
                type: "order-execution",
                fragments: ["<head>", "<link", "rel=\"stylesheet\"", "href=\"styles.css\"", ">", "</head>"],
                correctOrder: [0, 1, 2, 3, 4, 5],
                help: "Las hojas de estilo externas se enlazan en la sección de metadatos del documento.",
                codeExample: `<head>
    <link rel="stylesheet" href="styles.css">
</head>`
            },
            {
                question: "Etiqueta de HTML5 para agrupar contenido temáticamente relacionado:",
                type: "multiple-choice",
                options: ["`<group>`", "`<section>`", "`<article>`", "`<aside>`"],
                correctAnswer: 1,
                help: "Esta etiqueta define una sección genérica de contenido.",
                codeExample: `<section>
    <h2>Acerca de nosotros</h2>
    <p>Información sobre la empresa.</p>
</section>`
            },
            {
                question: "Atributo para permitir que un elemento sea editable por el usuario:",
                type: "multiple-choice",
                options: ["`editable`", "`contenteditable`", "`canedit`", "`user-editable`"],
                correctAnswer: 1,
                help: "Este atributo global indica si el contenido de un elemento puede ser modificado.",
                codeExample: `<div contenteditable="true">Este texto se puede editar.</div>`
            },
            {
                question: "Atributo para definir el valor inicial de un campo de texto:",
                type: "multiple-choice",
                options: ["`default`", "`placeholder`", "`value`", "`initial`"],
                correctAnswer: 2,
                help: "Este atributo define el valor predeterminado de un campo de entrada.",
                codeExample: `<input type="text" value="Texto predeterminado">`
            },
            {
                question: "Empareja el atributo de formulario con su función:",
                type: "drag-match",
                pairs: [
                    { drag: "URL de envío", drop: "`action`" },
                    { drag: "Método HTTP", drop: "`method`" },
                    { drag: "Codificación de datos", drop: "`enctype`" },
                    { drag: "Deshabilitar autocompletado", drop: "`autocomplete`" }
                ],
                help: "Estos atributos controlan el comportamiento de un formulario HTML.",
                codeExample: null
            },
            {
                question: "Ordena los elementos para crear una lista descriptiva:",
                type: "order-execution",
                fragments: ["<dl>", "<dt>", "Término", "</dt>", "<dd>", "Descripción", "</dd>", "</dl>"],
                correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
                help: "Se usan para definir términos y sus descripciones.",
                codeExample: `<dl>
    <dt>Término</dt>
    <dd>Descripción</dd>
</dl>`
            },
            {
                question: "Etiquetas de HTML5 para el contenido principal y la navegación:",
                type: "multiple-choice",
                options: ["`<content>` y `<menu>`", "`<main>` y `<nav>`", "`<article>` y `<aside>`", "`<section>` y `<header>`"],
                correctAnswer: 1,
                help: "HTML5 introdujo etiquetas para mejorar la semántica del documento.",
                codeExample: `<main>...</main> <nav>...</nav>`
            },
            {
                question: "Propósito del atributo `srcset` en una imagen:",
                type: "multiple-choice",
                options: ["Definir el tamaño máximo de la imagen", "Proporcionar imágenes diferentes para distintas resoluciones", "Especificar la calidad de compresión de la imagen", "Cargar la imagen de forma asíncrona"],
                correctAnswer: 1,
                help: "Permite que el navegador elija la imagen más adecuada para el dispositivo del usuario.",
                codeExample: `<img srcset="small.jpg 500w, medium.jpg 1000w" src="medium.jpg">`
            },
            {
                question: "Etiqueta para incrustar contenido de audio:",
                type: "multiple-choice",
                options: ["`<sound>`", "`<audio>`", "`<mp3>`", "`<play>`"],
                correctAnswer: 1,
                help: "Esta etiqueta permite reproducir archivos de audio con controles nativos del navegador.",
                codeExample: `<audio controls src="audio.mp3"></audio>`
            },
            {
                question: "Atributo para indicar que un campo de formulario es obligatorio:",
                type: "multiple-choice",
                options: ["`mandatory`", "`required`", "`must-fill`", "`validate`"],
                correctAnswer: 1,
                help: "Es un atributo booleano que activa la validación HTML5 del navegador.",
                codeExample: `<input type="text" required>`
            },
            {
                question: "Empareja la etiqueta semántica de HTML5 con su uso:",
                type: "drag-match",
                pairs: [
                    { drag: "Contenido principal", drop: "<main>" },
                    { drag: "Navegación", drop: "<nav>" },
                    { drag: "Pie de página", drop: "<footer>" },
                    { drag: "Contenido secundario", drop: "<aside>" }
                ],
                help: "Estas etiquetas ayudan a estructurar el contenido de manera significativa.",
                codeExample: null
            },
            {
                question: "Ordena para crear un mapa de imagen:",
                type: "order-execution",
                fragments: [
                    "<img src=\"planeta.gif\" usemap=\"#mapa\">",
                    "<map name=\"mapa\">",
                    "<area shape=\"rect\" coords=\"0,0,82,126\" href=\"sol.htm\">",
                    "</map>"
                ],
                correctOrder: [0, 1, 2, 3],
                help: "Un mapa de imagen define áreas clicables en una imagen.",
                codeExample: `<img src="planeta.gif" usemap="#mapa">
<map name="mapa">
<area shape="rect" coords="0,0,82,126" href="sol.htm">
</map>`
            },
            {
                question: "¿Qué tipo de `input` se usa para un control deslizante?",
                type: "multiple-choice",
                options: ["`type=\"slider\"`", "`type=\"range\"`", "`type=\"scale\"`", "`type=\"level\"`"],
                correctAnswer: 1,
                help: "Este input permite al usuario seleccionar un valor de un rango predefinido.",
                codeExample: `<input type="range" min="0" max="100" value="50">`
            }
        ],
        avanzado: [
            {
                question: "Atributo para agrupar elementos de un formulario visualmente:",
                type: "multiple-choice",
                options: ["`<group>`", "`<section>`", "`<fieldset>`", "`<formgroup>`"],
                correctAnswer: 2,
                help: "La etiqueta `<legend>` se usa a menudo con esta para proporcionar un título al grupo.",
                codeExample: `<fieldset><legend>Contacto</legend>...</fieldset>`
            },
            {
                question: "Empareja el atributo HTML con su propósito de accesibilidad:",
                type: "drag-match",
                pairs: [
                    { drag: "Orden de navegación", drop: "`tabindex`" },
                    { drag: "Texto de ejemplo", drop: "`placeholder`" },
                    { drag: "Deshabilitar control", drop: "`disabled`" },
                    { drag: "Solo lectura", drop: "`readonly`" }
                ],
                help: "Estos atributos mejoran la interacción del usuario y la accesibilidad.",
                codeExample: null
            },
            {
                question: "Etiqueta para agrupar el contenido del encabezado de una tabla:",
                type: "multiple-choice",
                options: ["`<th>`", "`<header>`", "`<thead>`", "`<caption>`"],
                correctAnswer: 2,
                help: "Esta etiqueta agrupa las filas de encabezado de una tabla.",
                codeExample: `<thead><tr><th>Encabezado</th></tr></thead>`
            },
            {
                question: "Atributo para especificar la codificación de caracteres del documento:",
                type: "multiple-choice",
                options: ["`lang`", "`charset`", "`encoding`", "`type`"],
                correctAnswer: 1,
                help: "Es fundamental para la correcta visualización de caracteres especiales y acentos.",
                codeExample: `<meta charset="UTF-8">`
            },
            {
                question: "Ordena para crear una barra de progreso en HTML5:",
                type: "order-execution",
                fragments: ["`<progress`", `value="70"`, `max="100">`, `70%</progress>`],
                correctOrder: [0, 1, 2, 3],
                help: "La etiqueta `progress` visualiza el progreso de una tarea.",
                codeExample: `<progress value="70" max="100">70%</progress>`
            },
            {
                question: "Elemento que representa el resultado de un cálculo:",
                type: "multiple-choice",
                options: ["`<result>`", "`<calc>`", "`<output>`", "`<answer>`"],
                correctAnswer: 2,
                help: "Se utiliza comúnmente en formularios para mostrar resultados de operaciones.",
                codeExample: `<form oninput="x.value=parseInt(a.value)+parseInt(b.value)">
<input type="number" id="a" value="50"> +
<input type="number" id="b" value="50"> =
<output name="x" for="a b"></output>
</form>`
            },
            {
                question: "Empareja el tipo de enlace (`rel`) con su propósito:",
                type: "drag-match",
                pairs: [
                    { drag: "Hoja de estilo", drop: "stylesheet" },
                    { drag: "Icono", drop: "icon" },
                    { drag: "URL canónica", drop: "canonical" },
                    { drag: "Siguiente página", drop: "next" }
                ],
                help: "El atributo `rel` especifica la relación entre el documento actual y el recurso vinculado.",
                codeExample: null
            },
            {
                question: "Atributo para especificar un atajo de teclado para un elemento:",
                type: "multiple-choice",
                options: ["`shortcut`", "`accesskey`", "`hotkey`", "`key`"],
                correctAnswer: 1,
                help: "Permite activar o enfocar un elemento usando una combinación de teclas.",
                codeExample: `<a href="#" accesskey="h">Inicio</a>`
            },
            {
                question: "Ordena para crear un elemento de video con múltiples fuentes:",
                type: "order-execution",
                fragments: [
                    "<video controls>",
                    "<source src=\"movie.mp4\" type=\"video/mp4\">",
                    "<source src=\"movie.ogg\" type=\"video/ogg\">",
                    "Tu navegador no soporta el tag de video.",
                    "</video>"
                ],
                correctOrder: [0, 1, 2, 3, 4],
                help: "Proporcionar múltiples fuentes asegura mayor compatibilidad entre navegadores.",
                codeExample: `<video controls>
<source src="movie.mp4" type="video/mp4">
<source src="movie.ogg" type="video/ogg">
Tu navegador no soporta el tag de video.
</video>`
            },
            {
                question: "Elemento para mostrar detalles que el usuario puede ver u ocultar:",
                type: "multiple-choice",
                options: ["`<details>`", "`<info>`", "`<spoiler>`", "`<hidden>`"],
                correctAnswer: 0,
                help: "Se usa junto con la etiqueta `<summary>` para el título visible.",
                codeExample: `<details><summary>Copyright</summary>...</details>`
            },
            {
                question: "Atributo que previene la validación de un formulario al enviarlo:",
                type: "multiple-choice",
                options: ["`novalidate`", "`disable-validation`", "`skip-check`", "`ignore-validation`"],
                correctAnswer: 0,
                help: "Es un atributo booleano para la etiqueta `<form>`.",
                codeExample: `<form novalidate>...</form>`
            },
            {
                question: "Empareja el atributo de script con su comportamiento de carga:",
                type: "drag-match",
                pairs: [
                    { drag: "Ejecuta después de analizar el HTML", drop: "defer" },
                    { drag: "Pausa el análisis, descarga y ejecuta", drop: "(ninguno)" },
                    { drag: "Descarga en paralelo y ejecuta al terminar", drop: "async" }
                ],
                help: "La forma en que se carga un script puede afectar el rendimiento de la página.",
                codeExample: null
            },
            {
                question: "Atributo para indicar el idioma del contenido de un elemento:",
                type: "multiple-choice",
                options: ["`language`", "`lang`", "`locale`", "`region`"],
                correctAnswer: 1,
                help: "Es importante para la accesibilidad y los motores de búsqueda.",
                codeExample: `<p lang="es">Hola Mundo</p>`
            },
            {
                question: "Ordena para crear un campo de entrada con una lista de sugerencias:",
                type: "order-execution",
                fragments: [
                    "<input list=\"browsers\">",
                    "<datalist id=\"browsers\">",
                    "<option value=\"Chrome\">",
                    "<option value=\"Firefox\">",
                    "</datalist>"
                ],
                correctOrder: [0, 1, 2, 3, 4],
                help: "La etiqueta `<datalist>` proporciona sugerencias de autocompletado para un `<input>`.",
                codeExample: `<input list="browsers">
<datalist id="browsers">
<option value="Chrome">
<option value="Firefox">
</datalist>`
            },
            {
                question: "Elemento para representar un rango de valores (ej. uso de disco):",
                type: "multiple-choice",
                options: ["`<range>`", "`<level>`", "`<meter>`", "`<gauge>`"],
                correctAnswer: 2,
                help: "Representa una medida escalar dentro de un rango conocido.",
                codeExample: `<meter value="2" min="0" max="10">2 de 10</meter>`
            },
            {
                question: "Atributo que permite que un `<iframe>` acceda a funciones del navegador:",
                type: "multiple-choice",
                options: ["`permissions`", "`features`", "`allow`", "`grant`"],
                correctAnswer: 2,
                help: "Controla qué APIs y características están disponibles para el contenido del iframe.",
                codeExample: `<iframe src="..." allow="fullscreen; camera"></iframe>`
            },
            {
                question: "Elemento para resaltar una parte del texto por su relevancia:",
                type: "multiple-choice",
                options: ["`<highlight>`", "`<mark>`", "`<b>`", "`<important>`"],
                correctAnswer: 1,
                help: "Se usa para marcar texto que es relevante en un contexto particular.",
                codeExample: `<p>No olvides <mark>revisar</mark> el documento.</p>`
            },
            {
                question: "Empareja el valor de `sandbox` en `<iframe>` con su restricción:",
                type: "drag-match",
                pairs: [
                    { drag: "Bloquea envío de formularios", drop: "allow-forms" },
                    { drag: "Bloquea ejecución de scripts", drop: "allow-scripts" },
                    { drag: "Bloquea enlaces a otros contextos", drop: "allow-popups" }
                ],
                help: "El atributo `sandbox` impone restricciones adicionales al contenido de un iframe.",
                codeExample: null
            },
            {
                question: "Atributo para indicar que un enlace descarga un recurso:",
                type: "multiple-choice",
                options: ["`download`", "`save`", "`fetch`", "`get`"],
                correctAnswer: 0,
                help: "Indica al navegador que descargue la URL en lugar de navegar a ella.",
                codeExample: `<a href="/images/myw3schoolsimage.jpg" download>Descargar</a>`
            },
            {
                question: "Elemento para representar el progreso de una tarea:",
                type: "multiple-choice",
                options: ["`<loading>`", "`<status>`", "`<progress>`", "`<bar>`"],
                correctAnswer: 2,
                help: "Muestra un indicador del avance de una operación.",
                codeExample: `<progress value="70" max="100"></progress>`
            }
        ]
    },
    css: {
        basico: [
            // Assuming we need 20 questions for basico, adding them here.
            {
                question: "¿Qué propiedad se usa para cambiar el color de fondo de un elemento?",
                type: "multiple-choice",
                options: ["`color`", "`background-color`", "`font-color`", "`fill`"],
                correctAnswer: 1,
                help: "Esta propiedad define el color detrás del contenido de un elemento.",
                codeExample: "body { background-color: lightblue; }"
            },
            {
                question: "¿Qué propiedad se usa para cambiar el color del texto?",
                type: "multiple-choice",
                options: ["`text-color`", "`font-color`", "`color`", "`foreground-color`"],
                correctAnswer: 2,
                help: "Afecta el color del contenido textual de un elemento.",
                codeExample: "p { color: red; }"
            },
            {
                question: "Forma correcta de aplicar un estilo a todos los elementos `<p>`:",
                type: "multiple-choice",
                options: ["`p { ... }`", `".p { ... }"`],
                correctAnswer: 0,
                help: "Se selecciona el elemento por su nombre de etiqueta.",
                codeExample: "p { font-family: Arial; }"
            },
            {
                question: "Propiedad para alinear el texto horizontalmente:",
                type: "multiple-choice",
                options: ["`align-text`", "`horizontal-align`", "`text-align`", "`justify-text`"],
                correctAnswer: 2,
                help: "Puede tener valores como `left`, `right`, `center` o `justify`.",
                codeExample: "h1 { text-align: center; }"
            },
            {
                question: "Propiedad para cambiar el tamaño de la fuente:",
                type: "multiple-choice",
                options: ["`font-size`", "`text-size`", "`size`", "`font-style`"],
                correctAnswer: 0,
                help: "Se puede especificar en píxeles (px), ems (em), o rems (rem).",
                codeExample: "p { font-size: 16px; }"
            },
            {
                question: "Propiedad para poner el texto en negrita:",
                type: "multiple-choice",
                options: ["`font-style: bold;`", "`text-decoration: bold;`", "`font-weight: bold;`", "`text-transform: bold;`"],
                correctAnswer: 2,
                help: "Controla el 'peso' o grosor de la fuente.",
                codeExample: "p { font-weight: bold; }"
            },
            {
                question: "Propiedad para poner el texto en cursiva:",
                type: "multiple-choice",
                options: ["`font-style: italic;`", "`text-decoration: italic;`", "`font-variant: italic;`", "`text-transform: italic;`"],
                correctAnswer: 0,
                help: "Define el estilo de la fuente, como normal, itálica u oblicua.",
                codeExample: "p { font-style: italic; }"
            },
            {
                question: "Propiedad para añadir un subrayado al texto:",
                type: "multiple-choice",
                options: ["`font-style: underline;`", "`text-decoration: underline;`", "`border-bottom: 1px solid;`", "`text-line: underline;`"],
                correctAnswer: 1,
                help: "Se usa para decorar el texto con líneas.",
                codeExample: "a { text-decoration: underline; }"
            },
            {
                question: "Propiedad para controlar el espacio exterior de un elemento:",
                type: "multiple-choice",
                options: ["`padding`", "`spacing`", "`border`", "`margin`"],
                correctAnswer: 3,
                help: "Es el espacio transparente que rodea a un elemento, fuera de su borde.",
                codeExample: "div { margin: 10px; }"
            },
            {
                question: "Propiedad para controlar el espacio interior de un elemento:",
                type: "multiple-choice",
                options: ["`padding`", "`spacing`", "`content-space`", "`margin`"],
                correctAnswer: 0,
                help: "Es el espacio entre el contenido del elemento y su borde.",
                codeExample: "div { padding: 20px; }"
            },
            {
                question: "Propiedad para definir el ancho de un elemento:",
                type: "multiple-choice",
                options: ["`height`", "`width`", "`size`", "`length`"],
                correctAnswer: 1,
                help: "Define la dimensión horizontal de un elemento.",
                codeExample: "div { width: 50%; }"
            },
            {
                question: "Propiedad para definir la altura de un elemento:",
                type: "multiple-choice",
                options: ["`height`", "`width`", "`size`", "`length`"],
                correctAnswer: 0,
                help: "Define la dimensión vertical de un elemento.",
                codeExample: "div { height: 100px; }"
            },
            {
                question: "Sintaxis para un comentario en CSS:",
                type: "multiple-choice",
                options: ["`// comentario`", "`<!-- comentario -->`", "`/* comentario */`", "`# comentario`"],
                correctAnswer: 2,
                help: "Los comentarios son ignorados por el navegador y sirven para documentar.",
                codeExample: "/* Este es un comentario */"
            },
            {
                question: "Selector para un elemento con `id=\"header\"`:",
                type: "multiple-choice",
                options: ["`.header`", "`#header`", "`header`", "`*header`"],
                correctAnswer: 1,
                help: "El símbolo `#` se usa para seleccionar por identificador único.",
                codeExample: "#header { background-color: gray; }"
            },
            {
                question: "Selector para elementos con `class=\"item\"`:",
                type: "multiple-choice",
                options: ["`.item`", "`#item`", "`item`", "`*item`"],
                correctAnswer: 0,
                help: "El símbolo `.` se usa para seleccionar por clase.",
                codeExample: ".item { color: blue; }"
            },
            {
                question: "Propiedad para cambiar el tipo de letra:",
                type: "multiple-choice",
                options: ["`font-type`", "`font-family`", "`typeface`", "`font-name`"],
                correctAnswer: 1,
                help: "Permite especificar una lista de fuentes por orden de preferencia.",
                codeExample: "body { font-family: 'Times New Roman', serif; }"
            },
            {
                question: "Propiedad para hacer un elemento invisible:",
                type: "multiple-choice",
                options: ["`hidden: true;`", "`display: none;`", "`visibility: gone;`", "`opacity: 0;`"],
                correctAnswer: 1,
                help: "Oculta el elemento y elimina el espacio que ocupaba.",
                codeExample: ".hidden-element { display: none; }"
            },
            {
                question: "Propiedad para definir el borde de un elemento:",
                type: "multiple-choice",
                options: ["`outline`", "`border-style`", "`border`", "`box-line`"],
                correctAnswer: 2,
                help: "Es una forma abreviada para `border-width`, `border-style`, y `border-color`.",
                codeExample: "div { border: 1px solid black; }"
            },
            {
                question: "Unidad de medida relativa al tamaño de la fuente del elemento padre:",
                type: "multiple-choice",
                options: ["`px`", "`rem`", "`pt`", "`em`"],
                correctAnswer: 3,
                help: "Es útil para crear diseños que escalan de forma proporcional.",
                codeExample: "div { font-size: 1.2em; }"
            },
            {
                question: "Propiedad para cambiar el cursor del ratón al pasar sobre un elemento:",
                type: "multiple-choice",
                options: ["`mouse-style`", "`pointer`", "`cursor`", "`hover-style`"],
                correctAnswer: 2,
                help: "Puede tener valores como `pointer`, `wait`, `text`, etc.",
                codeExample: "button { cursor: pointer; }"
            }
        ],
        intermedio: [
            {
                question: "¿Qué pseudo-clase se usa para un elemento cuando el cursor está sobre él?",
                type: "multiple-choice",
                options: ["`:active`", "`:focus`", "`:hover`", "`:visited`"],
                correctAnswer: 2,
                help: "Piensa en el estado de un elemento cuando el puntero del mouse está encima.",
                codeExample: `a:hover { color: red; }`
            },
            {
                question: "Empareja la propiedad `display` con su efecto:",
                type: "drag-match",
                pairs: [
                    { drag: "Elemento en bloque", drop: "`block`" },
                    { drag: "Elemento en línea", drop: "`inline`" },
                    { drag: "Contenedor flexible", drop: "`flex`" },
                    { drag: "Oculta el elemento", drop: "`none`" }
                ],
                help: "Esta propiedad define cómo se muestra y se comporta un elemento.",
                codeExample: null
            },
            {
                question: "Propiedad para controlar el espacio entre el borde y el contenido:",
                type: "multiple-choice",
                options: ["`margin`", "`border-spacing`", "`padding`", "`spacing`"],
                correctAnswer: 2,
                help: "Este espacio está 'dentro' del elemento, antes de su borde.",
                codeExample: `div { padding: 20px; }`
            },
            {
                question: "Ordena las propiedades para centrar un elemento de bloque horizontalmente:",
                type: "order-execution",
                fragments: [
                    "div {",
                    "width: 50%;",
                    "margin-left: auto;",
                    "margin-right: auto;",
                    "}"
                ],
                correctOrder: [0, 1, 2, 3, 4],
                help: "Para centrar un bloque, necesitas un ancho definido y márgenes laterales automáticos.",
                codeExample: `div { width: 50%; margin: 0 auto; }`
            },
            {
                question: "Unidad de medida relativa al tamaño de fuente del elemento raíz (`<html>`):",
                type: "multiple-choice",
                options: ["`em`", "`rem`", "`px`", "`%`"],
                correctAnswer: 1,
                help: "Esta unidad es útil para un escalado de fuente consistente en todo el documento.",
                codeExample: `p { font-size: 1.2rem; }`
            },
            {
                question: "Forma correcta de importar una hoja de estilo dentro de otra:",
                type: "multiple-choice",
                options: ["`@include url('styles.css');`", "`@import 'styles.css';`", "`<link src='styles.css'>`", "`import('styles.css');`"],
                correctAnswer: 1,
                help: "Esta regla permite anidar hojas de estilo.",
                codeExample: `@import 'theme.css';`
            },
            {
                question: "Propiedad para crear esquinas redondeadas:",
                type: "multiple-choice",
                options: ["`corner-radius`", "`border-radius`", "`round-corners`", "`border-curve`"],
                correctAnswer: 1,
                help: "Esta propiedad afecta la curvatura de los bordes de un elemento.",
                codeExample: `div { border-radius: 10px; }`
            },
            {
                question: "Empareja la propiedad de posicionamiento con su comportamiento:",
                type: "drag-match",
                pairs: [
                    { drag: "Posición normal", drop: "`static`" },
                    { drag: "Relativo a su posición normal", drop: "`relative`" },
                    { drag: "Relativo al viewport", drop: "`fixed`" },
                    { drag: "Relativo al ancestro posicionado", drop: "`absolute`" }
                ],
                help: "Cada valor de `position` altera cómo un elemento se sitúa en la página.",
                codeExample: null
            },
            {
                question: "Ordena las propiedades para crear una sombra de caja:",
                type: "order-execution",
                fragments: [
                    "div {",
                    "box-shadow: 5px 10px #888888;",
                    "}"
                ],
                correctOrder: [0, 1, 2],
                help: "Esta propiedad permite añadir sombras a los elementos.",
                codeExample: `div { box-shadow: 5px 10px #888888; }`
            },
            {
                question: "Propiedad para definir la altura de la línea del texto:",
                type: "multiple-choice",
                options: ["`line-spacing`", "`text-height`", "`line-height`", "`text-spacing-y`"],
                correctAnswer: 2,
                help: "Controla el espacio vertical entre las líneas de texto.",
                codeExample: `p { line-height: 1.5; }`
            },
            {
                question: "¿Qué es la especificidad en CSS?",
                type: "multiple-choice",
                options: ["El orden en que se escriben las reglas.", "Un algoritmo que determina qué regla se aplica a un elemento.", "La capacidad de un selector para ser reutilizado.", "La velocidad de carga de una hoja de estilo."],
                correctAnswer: 1,
                help: "La especificidad calcula el 'peso' de un selector CSS.",
                codeExample: null
            },
            {
                question: "Empareja el pseudo-elemento/clase con su uso:",
                type: "drag-match",
                pairs: [
                    { drag: "Selecciona un hijo por su posición", drop: ":nth-child()" },
                    { drag: "Estilo de la primera línea", drop: "::first-line" },
                    { drag: "Elemento con foco", drop: ":focus" },
                    { drag: "Estilo de la primera letra", drop: "::first-letter" }
                ],
                help: "Permiten aplicar estilos a estados o partes específicas de un elemento.",
                codeExample: null
            },
            {
                question: "Ordena para usar la función `calc()` para definir un ancho:",
                type: "order-execution",
                fragments: [
                    "div {",
                    "width: calc(100% - 20px);",
                    "}"
                ],
                correctOrder: [0, 1, 2],
                help: "`calc()` permite realizar cálculos matemáticos en propiedades CSS.",
                codeExample: `div { width: calc(100% - 20px); }`
            },
            {
                question: "Propósito de `object-fit` para imágenes o videos:",
                type: "multiple-choice",
                options: ["Controlar la alineación del objeto.", "Especificar cómo un contenido se ajusta a su contenedor.", "Definir el tamaño de la caja del objeto.", "Aplicar un filtro al objeto."],
                correctAnswer: 1,
                help: "Es similar a `background-size` pero para elementos como `<img>` o `<video>`.",
                codeExample: `img { width: 100px; height: 100px; object-fit: cover; }`
            },
            {
                question: "Propiedad para aplicar un fondo de imagen a un elemento:",
                type: "multiple-choice",
                options: ["`image-background`", "`bg-image`", "`background-image`", "`source-image`"],
                correctAnswer: 2,
                help: "Esta propiedad permite establecer una o más imágenes como fondo.",
                codeExample: `div { background-image: url('fondo.png'); }`
            },
            {
                question: "Diferencia entre `visibility: hidden` y `display: none`:",
                type: "multiple-choice",
                options: ["`hidden` oculta pero mantiene el espacio; `none` oculta y quita el espacio.", "`hidden` no funciona en todos los navegadores.", "`hidden` solo oculta texto.", "No hay diferencia funcional."],
                correctAnswer: 0,
                help: "Ambas ocultan elementos, pero su impacto en el diseño es diferente.",
                codeExample: `div { display: none; }`
            },
            {
                question: "Propiedad para controlar el orden de apilamiento de elementos posicionados:",
                type: "multiple-choice",
                options: ["`layer-index`", "`z-index`", "`order`", "`stack-level`"],
                correctAnswer: 1,
                help: "Funciona solo en elementos con una posición diferente a `static`.",
                codeExample: `div { position: relative; z-index: 10; }`
            },
            {
                question: "Empareja la propiedad de `background` con su función:",
                type: "drag-match",
                pairs: [
                    { drag: "Imagen de fondo", drop: "`background-image`" },
                    { drag: "Color de fondo", drop: "`background-color`" },
                    { drag: "Repetición del fondo", drop: "`background-repeat`" },
                    { drag: "Posición del fondo", drop: "`background-position`" }
                ],
                help: "Estas propiedades controlan cómo se muestra el fondo de un elemento.",
                codeExample: null
            },
            {
                question: "Ordena para que un ítem flexible crezca el doble que otros:",
                type: "order-execution",
                fragments: [
                    ".item {",
                    "flex-grow: 2;",
                    "}"
                ],
                correctOrder: [0, 1, 2],
                help: "`flex-grow` define la capacidad de un ítem para crecer si es necesario.",
                codeExample: `.item { flex-grow: 2; }`
            },
            {
                question: "Propiedad para aplicar sangría a la primera línea de un texto:",
                type: "multiple-choice",
                options: ["`text-align`", "`text-indent`", "`padding-left`", "`margin-left`"],
                correctAnswer: 1,
                help: "Añade un espacio horizontal antes de la primera línea de un bloque de texto.",
                codeExample: `p { text-indent: 50px; }`
            }
        ],
        avanzado: [
            {
                question: "Propiedad para aplicar transformaciones 2D o 3D a un elemento:",
                type: "multiple-choice",
                options: ["`transition`", "`animation`", "`transform`", "`translate`"],
                correctAnswer: 2,
                help: "Permite mover, rotar, escalar o inclinar elementos.",
                codeExample: `div { transform: rotate(45deg); }`
            },
            {
                question: "Empareja la propiedad de Flexbox con su función:",
                type: "drag-match",
                pairs: [
                    { drag: "Dirección de los ítems", drop: "`flex-direction`" },
                    { drag: "Alineación en eje principal", drop: "`justify-content`" },
                    { drag: "Alineación en eje transversal", drop: "`align-items`" },
                    { drag: "Permitir ajuste de línea", drop: "`flex-wrap`" }
                ],
                help: "Flexbox es una herramienta poderosa para la distribución y alineación de elementos.",
                codeExample: null
            },
            {
                question: "Pseudo-elemento para insertar contenido antes del contenido de un elemento:",
                type: "multiple-choice",
                options: ["`:first-child`", "`::before`", "`::after`", "`::first-line`"],
                correctAnswer: 1,
                help: "Se utiliza para añadir contenido decorativo o funcional.",
                codeExample: `p::before { content: "Nota: "; }`
            },
            {
                question: "Ordena para crear una animación CSS básica:",
                type: "order-execution",
                fragments: [
                    "div {",
                    "animation-name: slidein;",
                    "animation-duration: 3s;",
                    "}",
                    "@keyframes slidein {",
                    "from { margin-left: 100%; }",
                    "to { margin-left: 0%; }",
                    "}"
                ],
                correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
                help: "Las animaciones se definen con fotogramas clave y se aplican a un elemento.",
                codeExample: `div { animation: slidein 3s; }`
            },
            {
                question: "¿Qué es 'CSS Grid Layout'?",
                type: "multiple-choice",
                options: ["Un sistema de rejilla para imágenes", "Un sistema de diseño bidimensional", "Una forma de alinear texto en cuadrícula", "Una técnica para crear gráficos vectoriales"],
                correctAnswer: 1,
                help: "Permite un control preciso sobre la disposición de elementos en dos dimensiones.",
                codeExample: null
            },
            {
                question: "Propiedad para controlar el orden de los ítems en un contenedor Flexbox:",
                type: "multiple-choice",
                options: ["`flex-order`", "`order`", "`sort-items`", "`item-order`"],
                correctAnswer: 1,
                help: "Permite cambiar la secuencia visual de los elementos flexibles.",
                codeExample: `.item { order: 2; }`
            },
            {
                question: "Empareja la propiedad de transición con su función:",
                type: "drag-match",
                pairs: [
                    { drag: "Propiedad a transicionar", drop: "`transition-property`" },
                    { drag: "Duración de la transición", drop: "`transition-duration`" },
                    { drag: "Función de temporización", drop: "`transition-timing-function`" },
                    { drag: "Retraso de la transición", drop: "`transition-delay`" }
                ],
                help: "Las transiciones permiten suavizar los cambios de propiedades CSS.",
                codeExample: null
            },
            {
                question: "Ordena para hacer un elemento 'sticky' en CSS:",
                type: "order-execution",
                fragments: [
                    "div {",
                    "position: sticky;",
                    "top: 0;",
                    "}"
                ],
                correctOrder: [0, 1, 2, 3],
                help: "Es útil para elementos que se 'pegan' a la pantalla al desplazarse.",
                codeExample: `div { position: sticky; top: 0; }`
            },
            {
                question: "Función para aplicar un filtro de desenfoque a un elemento:",
                type: "multiple-choice",
                options: ["`blur()`", "`filter: blur()`", "`backdrop-filter: blur()`", "`transform: blur()`"],
                correctAnswer: 1,
                help: "Esta propiedad permite aplicar efectos gráficos como el desenfoque.",
                codeExample: `img { filter: blur(5px); }`
            },
            {
                question: "¿Qué es una 'media query'?",
                type: "multiple-choice",
                options: ["Una forma de cargar archivos multimedia", "Una técnica para consultar bases de datos", "Una regla para aplicar estilos basados en características del dispositivo", "Una función para reproducir medios"],
                correctAnswer: 2,
                help: "Son fundamentales para el diseño web adaptable.",
                codeExample: `@media (max-width: 600px) { ... }`
            },
            {
                question: "¿Qué es una 'Variable CSS' (Custom Property)?",
                type: "multiple-choice",
                options: ["Una propiedad que solo funciona en un navegador.", "Una entidad definida por el autor para valores reutilizables.", "Una propiedad que se ajusta a la pantalla.", "Una propiedad para animaciones complejas."],
                correctAnswer: 1,
                help: "Permiten definir valores que pueden ser utilizados en múltiples lugares.",
                codeExample: `:root { --main-color: blue; } p { color: var(--main-color); }`
            },
            {
                question: "Ordena para crear un diseño simple con CSS Grid:",
                type: "order-execution",
                fragments: [
                    ".container {",
                    "display: grid;",
                    "grid-template-columns: 1fr 1fr 1fr;",
                    "}"
                ],
                correctOrder: [0, 1, 2, 3],
                help: "`grid-template-columns` define la estructura de la rejilla.",
                codeExample: `.container { display: grid; grid-template-columns: 1fr 1fr 1fr; }`
            },
            {
                question: "Empareja la propiedad de Flexbox/Grid con su uso:",
                type: "drag-match",
                pairs: [
                    { drag: "Espacio entre filas y columnas", drop: "`gap`" },
                    { drag: "Alineación individual", drop: "`align-self`" },
                    { drag: "Definir áreas nombradas", drop: "`grid-template-areas`" },
                    { drag: "Controlar encogimiento", drop: "`flex-shrink`" }
                ],
                help: "Estas propiedades ofrecen control granular sobre la disposición de los elementos.",
                codeExample: null
            },
            {
                question: "¿Qué hace la regla `@supports`?",
                type: "multiple-choice",
                options: ["Importa fuentes externas.", "Aplica estilos si el navegador soporta una propiedad.", "Define variables CSS.", "Incluye archivos JavaScript."],
                correctAnswer: 1,
                help: "Es útil para aplicar estilos progresivamente.",
                codeExample: `@supports (display: grid) { ... }`
            },
            {
                question: "Propiedad para aplicar un efecto de máscara a un elemento:",
                type: "multiple-choice",
                options: ["`opacity`", "`clip-path`", "`mask-image`", "`filter: alpha()`"],
                correctAnswer: 2,
                help: "Utiliza una imagen como máscara para revelar u ocultar partes de un elemento.",
                codeExample: `div { mask-image: url(mask.png); }`
            },
            {
                question: "¿Cómo se utiliza la propiedad `mix-blend-mode`?",
                type: "multiple-choice",
                options: ["Para mezclar colores de texto y fondo.", "Para definir cómo el contenido se mezcla con su fondo.", "Para aplicar un modo de fusión a imágenes de fondo.", "Para controlar la opacidad."],
                correctAnswer: 1,
                help: "Es similar a los modos de fusión en software de edición de imágenes.",
                codeExample: `div { mix-blend-mode: multiply; }`
            },
            {
                question: "Propiedad para controlar el desplazamiento suave en la página:",
                type: "multiple-choice",
                options: ["`scroll-behavior`", "`smooth-scroll`", "`overflow-scrolling`", "`scroll-snap-type`"],
                correctAnswer: 0,
                help: "Permite que los saltos de ancla se animen suavemente.",
                codeExample: `html { scroll-behavior: smooth; }`
            },
            {
                question: "Empareja la función de transformación con su efecto:",
                type: "drag-match",
                pairs: [
                    { drag: "Mueve", drop: "`translate()`" },
                    { drag: "Rota", drop: "`rotate()`" },
                    { drag: "Escala", drop: "`scale()`" },
                    { drag: "Inclina", drop: "`skew()`" }
                ],
                help: "Las funciones de `transform` permiten manipular la posición, rotación, escala e inclinación.",
                codeExample: null
            },
            {
                question: "Ordena para crear un diseño de Grid con áreas nombradas:",
                type: "order-execution",
                fragments: [
                    ".container {",
                    "display: grid;",
                    "grid-template-areas:",
                    "\"header header\"",
                    "\"nav main\"",
                    "\"footer footer\";",
                    "}"
                ],
                correctOrder: [0, 1, 2, 3, 4, 5, 6],
                help: "`grid-template-areas` permite un diseño visual intuitivo.",
                codeExample: `.container { grid-template-areas: "header header" "nav main" "footer footer"; }`
            },
            {
                question: "Propiedad para aplicar un efecto de desenfoque al contenido detrás de un elemento:",
                type: "multiple-choice",
                options: ["`filter: blur()`", "`backdrop-filter: blur()`", "`background-filter`", "`blur-content`"],
                correctAnswer: 1,
                help: "Aplica efectos gráficos a la región detrás de un elemento.",
                codeExample: `div { backdrop-filter: blur(5px); }`
            }
        ]
    },
    javascript: {
        basico: [
            {
                question: "Palabra clave para declarar una variable que no puede ser reasignada:",
                type: "multiple-choice",
                options: ["`var`", "`let`", "`const`", "`static`"],
                correctAnswer: 2,
                help: "Esta palabra clave se utiliza para valores que permanecen fijos.",
                codeExample: "const PI = 3.14;"
            },
            {
                question: "Propiedad que devuelve la longitud de una cadena:",
                type: "multiple-choice",
                options: ["`size`", "`length`", "`count`", "`length()`"],
                correctAnswer: 1,
                help: "Indica cuántos caracteres tiene una cadena.",
                codeExample: "let str = 'Hola'; console.log(str.length);"
            },
            {
                question: "Operador para la igualdad estricta (mismo valor y tipo):",
                type: "multiple-choice",
                options: ["`==`", "`===`", "`!=`", "`!==`"],
                correctAnswer: 1,
                help: "Este operador no realiza conversiones de tipo antes de comparar.",
                codeExample: "5 === '5' // false"
            },
            {
                question: "Ordena los pasos para crear y llamar a una función:",
                type: "order-execution",
                fragments: [
                    "function miFuncion() {",
                    "console.log('Hola');",
                    "}",
                    "miFuncion();"
                ],
                correctOrder: [0, 1, 2, 3],
                help: "Primero se define la función, luego se invoca para que se ejecute.",
                codeExample: `function miFuncion() { console.log('Hola'); } miFuncion();`
            },
            {
                question: "¿Qué es JavaScript?",
                type: "multiple-choice",
                options: ["Un lenguaje de marcado", "Un lenguaje de estilos", "Un lenguaje de programación para la web", "Una base de datos"],
                correctAnswer: 2,
                help: "Es el lenguaje que añade interactividad a las páginas web.",
                codeExample: null
            },
            {
                question: "Función para imprimir mensajes en la consola del navegador:",
                type: "multiple-choice",
                options: ["`print()`", "`log()`", "`console.log()`", "`display()`"],
                correctAnswer: 2,
                help: "Es muy útil para ver valores y depurar el código.",
                codeExample: "console.log('Mensaje');"
            },
            {
                question: "Método para agregar un elemento al final de un array:",
                type: "multiple-choice",
                options: ["`add()`", "`insert()`", "`push()`", "`append()`"],
                correctAnswer: 2,
                help: "Este método 'empuja' un elemento al final de la lista.",
                codeExample: "let arr = [1, 2]; arr.push(3);"
            },
            {
                question: "Empareja el evento de DOM con su descripción:",
                type: "drag-match",
                pairs: [
                    { drag: "Al hacer clic", drop: "`click`" },
                    { drag: "Al pasar el mouse", drop: "`mouseover`" },
                    { drag: "Al cargar el documento", drop: "`DOMContentLoaded`" },
                    { drag: "Al presionar una tecla", drop: "`keydown`" }
                ],
                help: "Los eventos permiten que el código reaccione a las interacciones del usuario.",
                codeExample: null
            },
            {
                question: "Ordena los pasos para cambiar el texto de un elemento HTML:",
                type: "order-execution",
                fragments: [
                    "<p id=\"saludo\"></p>",
                    "const el = document.getElementById('saludo');",
                    "el.textContent = 'Hola';"
                ],
                correctOrder: [0, 1, 2],
                help: "Primero se selecciona el elemento, luego se modifica su contenido.",
                codeExample: `document.getElementById('saludo').textContent = 'Hola';`
            },
            {
                question: "¿Qué tipo de dato devuelve `typeof` para un array?",
                type: "multiple-choice",
                options: ["`array`", "`object`", "`list`", "`null`"],
                correctAnswer: 1,
                help: "En JavaScript, los arrays son una forma especial de este tipo de dato.",
                codeExample: "typeof [] // 'object'"
            },
            {
                question: "Operador para sumar dos números:",
                type: "multiple-choice",
                options: ["`-`", "`*`", "`+`", `/`],
                correctAnswer: 2,
                help: "Es el operador más común para la adición matemática.",
                codeExample: "let suma = 5 + 3;"
            },
            {
                question: "Ordena para crear una sentencia `if/else`:",
                type: "order-execution",
                fragments: [
                    "if (condicion) {",
                    "// código si es verdadero",
                    "} else {",
                    "// código si es falso",
                    "}"
                ],
                correctOrder: [0, 1, 2, 3, 4],
                help: "Las sentencias condicionales permiten ejecutar código basado en una condición.",
                codeExample: `if (edad >= 18) { ... } else { ... }`
            },
            {
                question: "Empareja el operador lógico con su significado:",
                type: "drag-match",
                pairs: [
                    { drag: "Y lógico", drop: "`&&`" },
                    { drag: "O lógico", drop: "`||`" },
                    { drag: "Negación lógica", drop: "`!`" }
                ],
                help: "Los operadores lógicos se utilizan para combinar expresiones booleanas.",
                codeExample: null
            },
            {
                question: "Bucle que se utiliza para iterar un número específico de veces:",
                type: "multiple-choice",
                options: ["`while`", "`do...while`", "`for`", "`for...in`"],
                correctAnswer: 2,
                help: "Este bucle es ideal cuando se conoce la cantidad exacta de repeticiones.",
                codeExample: `for (let i = 0; i < 5; i++) { ... }`
            },
            {
                question: "¿Cómo se accede al contenido de texto de un elemento?",
                type: "multiple-choice",
                options: ["`element.value`", "`element.htmlContent`", "`element.textContent`", "`element.text`"],
                correctAnswer: 2,
                help: "Esta propiedad obtiene o establece el contenido de texto de un nodo.",
                codeExample: `const div = document.getElementById('myDiv'); console.log(div.textContent);`
            },
            {
                question: "Método para crear un nuevo elemento HTML en JavaScript:",
                type: "multiple-choice",
                options: ["`document.newElement()`", "`document.createNode()`", "`document.buildElement()`", "`document.createElement()`"],
                correctAnswer: 3,
                help: "Es el método estándar para generar nuevos nodos en el DOM.",
                codeExample: `const newDiv = document.createElement('div');`
            },
            {
                question: "Método que elimina el último elemento de un array:",
                type: "multiple-choice",
                options: ["`shift()`", "`splice()`", "`pop()`", "`removeLast()`"],
                correctAnswer: 2,
                help: "Este método modifica el array original y devuelve el elemento eliminado.",
                codeExample: "let arr = [1, 2, 3]; arr.pop();"
            },
            {
                question: "Empareja el tipo de dato primitivo con un ejemplo:",
                type: "drag-match",
                pairs: [
                    { drag: "Número", drop: "`123`" },
                    { drag: "Cadena", drop: "`'Hola'`" },
                    { drag: "Booleano", drop: "`true`" },
                    { drag: "Nulo", drop: "`null`" }
                ],
                help: "JavaScript tiene varios tipos de datos fundamentales.",
                codeExample: null
            },
            {
                question: "Ordena para declarar una variable y asignarle un valor:",
                type: "order-execution",
                fragments: [
                    "let",
                    "mensaje",
                    "=",
                    "'Hola';"
                ],
                correctOrder: [0, 1, 2, 3],
                help: "`let` es la forma moderna de declarar variables reasignables.",
                codeExample: `let mensaje = 'Hola';`
            },
            {
                question: "Método para convertir una cadena a mayúsculas:",
                type: "multiple-choice",
                options: ["`toUpperCase()`", "`toCapitalCase()`", "`upperCase()`", "`makeUpperCase()`"],
                correctAnswer: 0,
                help: "Devuelve una nueva cadena con todos los caracteres en mayúsculas.",
                codeExample: "let texto = 'hola'; texto.toUpperCase(); // 'HOLA'"
            }
        ],
        intermedio: [
            {
                question: "Método para iterar sobre un array y ejecutar una función por cada elemento:",
                type: "multiple-choice",
                options: ["`map()`", "`filter()`", "`forEach()`", "`reduce()`"],
                correctAnswer: 2,
                help: "Este método recorre un array sin crear uno nuevo.",
                codeExample: "['a', 'b'].forEach(el => console.log(el));"
            },
            {
                question: "Empareja el método de array con su función:",
                type: "drag-match",
                pairs: [
                    { drag: "Crea un nuevo array con resultados de una función", drop: "`map()`" },
                    { drag: "Crea un nuevo array con elementos que cumplen una condición", drop: "`filter()`" },
                    { drag: "Reduce el array a un solo valor", drop: "`reduce()`" },
                    { drag: "Elimina el primer elemento", drop: "`shift()`" }
                ],
                help: "Cada método tiene un propósito específico para transformar o modificar arrays.",
                codeExample: null
            },
            {
                question: "¿Qué es un 'callback'?",
                type: "multiple-choice",
                options: ["Una función que se llama automáticamente.", "Una función que se pasa como argumento a otra.", "Una función que devuelve otra función.", "Una función para depurar código."],
                correctAnswer: 1,
                help: "Es una función que se 'llama de vuelta' en un momento posterior.",
                codeExample: `setTimeout(() => { console.log('Hola'); }, 1000);`
            },
            {
                question: "Ordena para manejar un evento de clic en un botón:",
                type: "order-execution",
                fragments: [
                    "<button id=\"miBoton\">Clic</button>",
                    "const boton = document.getElementById('miBoton');",
                    "boton.addEventListener('click', () => { alert('Clic'); });"
                ],
                correctOrder: [0, 1, 2],
                help: "Necesitas seleccionar el elemento y luego 'escuchar' la interacción.",
                codeExample: `document.getElementById('btn').addEventListener('click', miFuncion);`
            },
            {
                question: "Propósito del objeto `event` en los manejadores de eventos:",
                type: "multiple-choice",
                options: ["Almacenar datos de la aplicación.", "Proporcionar información sobre el evento ocurrido.", "Definir nuevas funciones.", "Controlar el flujo de la aplicación."],
                correctAnswer: 1,
                help: "Este objeto te da detalles sobre la interacción que acaba de suceder.",
                codeExample: `el.addEventListener('click', e => console.log(e.target));`
            },
            {
                question: "Método para detener la propagación de un evento en el DOM:",
                type: "multiple-choice",
                options: ["`stopPropagation()`", "`cancelPropagation()`", "`stopEvent()`", "`preventBubble()`"],
                correctAnswer: 0,
                help: "Impide que un evento 'suba' por la jerarquía del DOM.",
                codeExample: `e.stopPropagation();`
            },
            {
                question: "Método para convertir una cadena JSON a un objeto JavaScript:",
                type: "multiple-choice",
                options: ["`JSON.stringify()`", "`JSON.parse()`", "`JSON.toObject()`", "`JSON.decode()`"],
                correctAnswer: 1,
                help: "Este método analiza una cadena de texto y la convierte a un objeto.",
                codeExample: `JSON.parse('{"nombre": "Ana"}');`
            },
            {
                question: "Empareja el concepto de 'scope' con su definición:",
                type: "drag-match",
                pairs: [
                    { drag: "Accesible globalmente", drop: "Global" },
                    { drag: "Accesible en una función", drop: "De Función" },
                    { drag: "Accesible en un bloque (`{}`)", drop: "De Bloque" },
                    { drag: "Acceso a variables del scope padre", drop: "Clausura" }
                ],
                help: "El 'scope' define dónde puedes acceder a tus variables.",
                codeExample: null
            },
            {
                question: "Ordena los pasos para guardar un dato en `localStorage`:",
                type: "order-execution",
                fragments: [
                    "localStorage.setItem('usuario', 'ana');",
                    "let user = localStorage.getItem('usuario');"
                ],
                correctOrder: [0, 1],
                help: "Recuerda los métodos para guardar y recuperar datos.",
                codeExample: `localStorage.setItem('clave', 'valor');`
            },
            {
                question: "¿Qué es el 'hoisting'?",
                type: "multiple-choice",
                options: ["Un método para elevar elementos del DOM.", "El proceso de mover declaraciones al inicio de su scope.", "Un tipo de error de sintaxis.", "Un patrón de diseño para eventos."],
                correctAnswer: 1,
                help: "Explica por qué puedes usar una variable antes de declararla.",
                codeExample: `a = 5; var a;`
            },
            {
                question: "Propósito del operador de propagación (`...`):",
                type: "multiple-choice",
                options: ["Concatenar cadenas.", "Expandir un iterable en elementos individuales.", "Copiar objetos con sus prototipos.", "Realizar operaciones matemáticas."],
                correctAnswer: 1,
                help: "Es muy útil para copiar arrays o fusionar objetos.",
                codeExample: `const arr2 = [...arr1, 3, 4];`
            },
            {
                question: "Empareja el método de array con su función:",
                type: "drag-match",
                pairs: [
                    { drag: "Transforma cada elemento", drop: "`map()`" },
                    { drag: "Filtra elementos", drop: "`filter()`" },
                    { drag: "Verifica si algún elemento cumple una condición", drop: "`some()`" },
                    { drag: "Verifica si todos los elementos cumplen una condición", drop: "`every()`" }
                ],
                help: "Estos métodos facilitan la manipulación y consulta de arrays.",
                codeExample: null
            },
            {
                question: "Ordena para definir una función de flecha simple:",
                type: "order-execution",
                fragments: [
                    "const miFuncion = (param) => {",
                    "return param * 2;",
                    "};"
                ],
                correctOrder: [0, 1, 2],
                help: "Las funciones de flecha son una sintaxis más concisa para escribir funciones.",
                codeExample: `const doble = num => num * 2;`
            },
            {
                question: "¿Cómo manejan las funciones de flecha el contexto de `this`?",
                type: "multiple-choice",
                options: ["Siempre tienen `this` global.", "Heredan `this` de su contexto léxico.", "Tienen un `this` dinámico.", "Enlazan `this` al elemento DOM."],
                correctAnswer: 1,
                help: "Esta es una diferencia clave que simplifica el manejo de `this`.",
                codeExample: null
            },
            {
                question: "¿Qué es una 'clausura' (closure)?",
                type: "multiple-choice",
                options: ["Un error de sintaxis.", "Una función que recuerda su entorno léxico.", "Un tipo de bucle.", "Una forma de proteger variables."],
                correctAnswer: 1,
                help: "Es un concepto fundamental para entender patrones avanzados en JavaScript.",
                codeExample: `function crearContador() { let c = 0; return () => c++; }`
            },
            {
                question: "¿Qué es la 'delegación de eventos'?",
                type: "multiple-choice",
                options: ["Un método para detener eventos.", "Manejar eventos en un elemento padre para sus hijos.", "Un tipo de evento de arrastre.", "Una forma de priorizar eventos."],
                correctAnswer: 1,
                help: "Mejora el rendimiento y simplifica el código al manejar muchos elementos.",
                codeExample: `parent.addEventListener('click', e => { if(e.target.matches('.child')) { ... } });`
            },
            {
                question: "Método de `Date` para obtener el año completo:",
                type: "multiple-choice",
                options: ["`getYear()`", "`getFullYear()`", "`getYearFull()`", "`getActualYear()`"],
                correctAnswer: 1,
                help: "`getYear()` está obsoleto y puede dar resultados inesperados.",
                codeExample: `new Date().getFullYear();`
            },
            {
                question: "Empareja el método de `String` con su función:",
                type: "drag-match",
                pairs: [
                    { drag: "Extrae una parte", drop: "`substring()`" },
                    { drag: "Reemplaza una parte", drop: "`replace()`" },
                    { drag: "Divide en un array", drop: "`split()`" },
                    { drag: "Elimina espacios en blanco", drop: "`trim()`" }
                ],
                help: "Estos métodos son fundamentales para manipular cadenas de texto.",
                codeExample: null
            },
            {
                question: "Ordena para ejecutar una función después de 2 segundos:",
                type: "order-execution",
                fragments: [
                    "setTimeout(() => {",
                    "console.log('Hola');",
                    "}, 2000);"
                ],
                correctOrder: [0, 1, 2],
                help: "`setTimeout` ejecuta una función una vez después de un retraso.",
                codeExample: `setTimeout(miFuncion, 2000);`
            },
            {
                question: "Método para combinar dos o más arrays:",
                type: "multiple-choice",
                options: ["`join()`", "`merge()`", "`concat()`", "`combine()`"],
                correctAnswer: 2,
                help: "Este método no modifica los arrays existentes, sino que devuelve uno nuevo.",
                codeExample: `[1, 2].concat([3, 4]);`
            }
        ],
        avanzado: [
            {
                question: "Palabra clave para importar módulos en ES6:",
                type: "multiple-choice",
                options: ["`require`", "`include`", "`import`", "`load`"],
                correctAnswer: 2,
                help: "Es fundamental para la modularización en JavaScript moderno.",
                codeExample: "`import { miFuncion } from './miModulo.js';`"
            },
            {
                question: "Empareja el concepto de asincronía con su implementación:",
                type: "drag-match",
                pairs: [
                    { drag: "Representa un valor que puede estar disponible ahora, en el futuro, o nunca.", drop: "Promise" },
                    { drag: "Sintaxis para trabajar con promesas de forma más cómoda.", drop: "`async/await`" },
                    { drag: "Función que se ejecuta cuando otra termina.", drop: "Callback" },
                    { drag: "Función que puede pausar y reanudar su ejecución.", drop: "Generador" }
                ],
                help: "Estos conceptos son clave para manejar operaciones no bloqueantes.",
                codeExample: null
            },
            {
                question: "Propósito de la 'desestructuración de objetos':",
                type: "multiple-choice",
                options: ["Convertir objetos a cadenas", "Extraer valores de objetos en variables", "Fusionar varios objetos", "Crear copias profundas de objetos"],
                correctAnswer: 1,
                help: "Es una forma concisa de obtener propiedades de un objeto.",
                codeExample: `const { nombre, edad } = persona;`
            },
            {
                question: "Ordena para realizar una solicitud `fetch` con `async/await`:",
                type: "order-execution",
                fragments: [
                    "async function getData() {",
                    "const response = await fetch(url);",
                    "const data = await response.json();",
                    "console.log(data);",
                    "}"
                ],
                correctOrder: [0, 1, 2, 3, 4],
                help: "Piensa en cómo se manejan las operaciones asíncronas de forma secuencial.",
                codeExample: `async function fetchData() { ... }`
            },
            {
                question: "¿Qué es el 'Event Loop'?",
                type: "multiple-choice",
                options: ["Un bucle para iterar sobre arrays", "El mecanismo que procesa eventos de la cola de tareas", "Un tipo de bucle `for` avanzado", "Una herramienta de depuración de eventos"],
                correctAnswer: 1,
                help: "Es crucial para entender cómo JavaScript maneja la asincronía.",
                codeExample: null
            },
            {
                question: "Propiedad que devuelve el número de elementos en un `Map`:",
                type: "multiple-choice",
                options: ["`size`", "`length`", "`count`", "`length()`"],
                correctAnswer: 0,
                help: "A diferencia de los arrays, los Maps no usan `length`.",
                codeExample: "let miMap = new Map(); miMap.set('a', 1); miMap.size; // 1"
            },
            {
                question: "Empareja el método de `Set` con su función:",
                type: "drag-match",
                pairs: [
                    { drag: "Añade un valor", drop: "`add()`" },
                    { drag: "Elimina un valor", drop: "`delete()`" },
                    { drag: "Verifica si un valor existe", drop: "`has()`" },
                    { drag: "Elimina todos los elementos", drop: "`clear()`" }
                ],
                help: "Los Sets son colecciones de valores únicos.",
                codeExample: null
            },
            {
                question: "Ordena para crear una función autoejecutable (IIFE):",
                type: "order-execution",
                fragments: [
                    "(function() {",
                    "console.log('Hola');",
                    "})();"
                ],
                correctOrder: [0, 1, 2],
                help: "Este patrón de función se ejecuta tan pronto como se define.",
                codeExample: `(function() { ... })();`
            },
            {
                question: "¿Qué es 'WebAssembly' (Wasm)?",
                type: "multiple-choice",
                options: ["Un nuevo lenguaje de programación", "Un formato de código binario para la web", "Una API de JavaScript para gráficos", "Un compilador de JavaScript"],
                correctAnswer: 1,
                help: "Permite ejecutar código de alto rendimiento, compilado desde otros lenguajes.",
                codeExample: null
            },
            {
                question: "Método para crear un objeto a partir de un prototipo:",
                type: "multiple-choice",
                options: ["`Object.create()`", "`Object.assign()`", "`Object.from()`", "`Object.new()`"],
                correctAnswer: 0,
                help: "Es fundamental para la herencia prototípica en JavaScript.",
                codeExample: `const juan = Object.create(personaProto);`
            },
            {
                question: "Diferencia entre herencia prototípica y basada en clases:",
                type: "multiple-choice",
                options: ["La prototípica es más moderna.", "Las clases son azúcar sintáctico sobre prototipos.", "Las clases permiten herencia múltiple.", "No hay diferencia."],
                correctAnswer: 1,
                help: "Comprender el modelo prototípico es clave para dominar JavaScript.",
                codeExample: null
            },
            {
                question: "Ordena para crear y usar una clase básica:",
                type: "order-execution",
                fragments: [
                    "class Animal {",
                    "constructor(nombre) { this.nombre = nombre; }",
                    "}",
                    "const perro = new Animal('Fido');"
                ],
                correctOrder: [0, 1, 2, 3],
                help: "Las clases proporcionan una sintaxis más limpia para crear objetos.",
                codeExample: `class Animal { ... }`
            },
            {
                question: "Empareja el concepto avanzado con su descripción:",
                type: "drag-match",
                pairs: [
                    { drag: "Intercepta operaciones en objetos", drop: "Proxy" },
                    { drag: "API de bajo nivel para objetos", drop: "Reflect" },
                    { drag: "Script en segundo plano para offline", drop: "Service Worker" },
                    { drag: "Comunicación bidireccional", drop: "WebSockets" }
                ],
                help: "Estos conceptos amplían las capacidades de JavaScript para aplicaciones modernas.",
                codeExample: null
            },
            {
                question: "Propósito de los 'Generators' en JavaScript:",
                type: "multiple-choice",
                options: ["Crear bucles infinitos.", "Manejar la creación de objetos asíncronos.", "Controlar la iteración de secuencias de valores.", "Optimizar el rendimiento de funciones."],
                correctAnswer: 2,
                help: "Permiten escribir código asíncrono de una manera más secuencial.",
                codeExample: `function* idGenerator() { yield 1; yield 2; }`
            },
            {
                question: "¿Qué es un 'Service Worker'?",
                type: "multiple-choice",
                options: ["Una herramienta de depuración.", "Un script que actúa como proxy de red.", "Un tipo de Web Worker en el servidor.", "Una biblioteca para animaciones."],
                correctAnswer: 1,
                help: "Son la base de las Progressive Web Apps (PWAs).",
                codeExample: null
            },
            {
                question: "Método para aplanar un array de arrays:",
                type: "multiple-choice",
                options: ["`flatten()`", "`deepFlatten()`", "`flat()`", "`unfold()`"],
                correctAnswer: 2,
                help: "Este método es útil para trabajar con arrays anidados.",
                codeExample: `[1, [2, 3]].flat(); // [1, 2, 3]`
            },
            {
                question: "¿Qué es la 'currificación' (currying)?",
                type: "multiple-choice",
                options: ["Un método para ocultar funciones.", "Transformar una función de múltiples argumentos en una secuencia de funciones.", "Un patrón para optimizar recursiones.", "Una forma de aplicar estilos a funciones."],
                correctAnswer: 1,
                help: "Es un concepto de programación funcional que mejora la reutilización.",
                codeExample: `const add = a => b => a + b;`
            },
            {
                question: "Empareja el manejo de errores asíncronos con su implementación:",
                type: "drag-match",
                pairs: [
                    { drag: "Captura errores en Promises", drop: "`.catch()`" },
                    { drag: "Maneja errores en `async/await`", drop: "`try...catch`" },
                    { drag: "Evento global para errores no capturados", drop: "`window.onerror`" }
                ],
                help: "Es crucial manejar los errores en operaciones asíncronas.",
                codeExample: null
            },
            {
                question: "Ordena para implementar un 'Intersection Observer' básico:",
                type: "order-execution",
                fragments: [
                    "const observer = new IntersectionObserver(callback);",
                    "const target = document.querySelector('#el');",
                    "observer.observe(target);"
                ],
                correctOrder: [0, 1, 2],
                help: "Permite detectar cuándo un elemento entra o sale del viewport.",
                codeExample: `new IntersectionObserver(...);`
            },
            {
                question: "¿Qué es un 'WeakMap'?",
                type: "multiple-choice",
                options: ["Un `Map` que solo almacena cadenas.", "Un `Map` cuyas claves son débilmente referenciadas.", "Un `Map` con un número limitado de elementos.", "Una versión más lenta de `Map`."],
                correctAnswer: 1,
                help: "Es útil para asociar datos a objetos sin evitar que sean eliminados de la memoria.",
                codeExample: `const wm = new WeakMap();`
            }
        ]
    }
};

let currentQuestionIndex = 0;
let currentScore = 0;
let totalXP = 0;
let quizTimer;
let timeElapsed = 0;
let isPaused = false;
let selectedTopic = '';
let selectedDifficulty = '';
let currentQuestions = [];
let answeredCorrectly = 0;
let answeredIncorrectly = 0;
let questionStartTime = 0;
let responseChanges = 0;

const INACTIVITY_TIMEOUT = 60; // seconds of inactivity before warning
const INACTIVITY_WARNING_DURATION = 10; // seconds for warning countdown

let inactivityTimer;
let inactivityCountdownInterval;
let inactivityCountdown = INACTIVITY_WARNING_DURATION;

// Declaring DOM elements as global variables, but assigning them inside initQuizGame
let quizStartMenu;
let startQuizButton;
let quizTopicSelectionMenu;
let topicButtons;
let backToStartMenuButton;
let quizDifficultySelectionMenu;
let selectedTopicDisplay;
let difficultyButtons;
let backToTopicMenuButton;
let quizPlayArea;
let quizTimerDisplay;
let quizScoreDisplay;
let quizQuestion;
let quizHelpText;
let multipleChoiceOptions;
let syntaxOrderContainer;
let syntaxTargetArea;
let syntaxOptionsArea;
let checkSyntaxButton;
let undoSyntaxButton;
let dragMatchContainer;
let dragElementsArea;
let dropTargetsArea;
let checkMatchButton;
let undoMatchButton;
let endQuizButton;
let quizResultScreen;
let quizCorrectAnswers;
let quizIncorrectAnswers;
let quizFinalScore;
let quizFinalTime;
let quizRetryLevelButton;
let quizNextLevelButton;
let quizChangeTopicButton;
let quizExitGameButton;
let inactivityWarningModal;
let inactivityCountdownDisplay;


// Drag & Drop specific elements and variables
// let draggedItemOriginalElement = null; // Renamed for clarity - REMOVED DUPLICATE DECLARATION
let currentDragMatchPairs = [];
let originalDragMatchState = []; // Para el botón de deshacer en Drag & Match

// Syntax / Order specific variables
let currentSyntaxFragments = []; // Fragmentos disponibles para arrastrar/seleccionar
let currentSyntaxOrder = [];    // Orden actual de los fragmentos en el área de destino

// --- Funciones de control de inactividad ---

function pauseTimer() {
    isPaused = true;
}

function resumeTimer() {
    isPaused = false;
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    clearInterval(inactivityCountdownInterval);
    hideInactivityWarning();
    inactivityTimer = setTimeout(showInactivityWarning, INACTIVITY_TIMEOUT * 1000);
}

function showInactivityWarning() {
    inactivityCountdown = INACTIVITY_WARNING_DURATION;
    if (inactivityWarningModal) { // Check if element exists before trying to access classList
        inactivityWarningModal.classList.remove('hidden');
    }
    if (inactivityCountdownDisplay) { // Check if element exists
        inactivityCountdownDisplay.textContent = inactivityCountdown;
    }


    inactivityCountdownInterval = setInterval(() => {
        inactivityCountdown--;
        if (inactivityCountdownDisplay) { // Check if element exists
            inactivityCountdownDisplay.textContent = inactivityCountdown;
        }
        if (inactivityCountdown <= 0) {
            clearInterval(inactivityCountdownInterval);
            resetGameDueToInactivity();
        }
    }, 1000);
}

function hideInactivityWarning() {
    if (inactivityWarningModal) { // Check if element exists before trying to access classList
        inactivityWarningModal.classList.add('hidden');
    }
}

function resetGameDueToInactivity() {
    clearInterval(quizTimer); // Detener el temporizador del quiz
    clearInterval(inactivityCountdownInterval); // Detener el contador de inactividad
    showScreen('quiz-start-menu'); // Volver al menú de inicio
    currentScore = 0; // Resetear puntuación
    answeredCorrectly = 0;
    answeredIncorrectly = 0;
    if (quizScoreDisplay) updateScoreDisplay(); // Actualizar display de puntuación
    if (quizTimerDisplay) quizTimerDisplay.textContent = '00:00'; // Resetear display del tiempo
    // Using a custom modal or simple text update instead of alert for better UX
    // For now, keeping alert as per previous instruction, but ideally this would be a custom UI.
    // alert('El juego se ha reiniciado debido a la inactividad.');
    // A more user-friendly approach:
    const inactivityMessageElement = document.getElementById('inactivity-message');
    if (inactivityMessageElement) {
        inactivityMessageElement.textContent = 'El juego se ha reiniciado debido a la inactividad.';
    }
    // Automatically hide after a short delay or require user interaction
    setTimeout(() => {
        hideInactivityWarning();
        if (inactivityMessageElement) {
            inactivityMessageElement.textContent = 'Inactividad detectada. El juego se reiniciará en...'; // Reset message
        }
    }, 3000); // Hide after 3 seconds
}


// --- Game Flow Functions ---

function showScreen(screenId) {
    const screens = [
        quizStartMenu,
        quizTopicSelectionMenu,
        quizDifficultySelectionMenu,
        quizPlayArea,
        quizResultScreen
    ];
    screens.forEach(screen => {
        if (screen) { // Ensure screen element exists
            screen.classList.add('hidden');
            screen.classList.remove('flex');
            screen.classList.remove('flex-col'); // Ensure flex-col is removed if not needed
            screen.classList.remove('animate-fade-in-down'); // Remove animation for next use
        }
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('flex', 'flex-col');
        // Add animation class
        targetScreen.classList.add('animate-fade-in-down');
    }
    if (screenId === 'quiz-result-screen') {
        clearTimeout(inactivityTimer);
        clearInterval(inactivityCountdownInterval);
        hideInactivityWarning();
    } else {
        resetInactivityTimer();
    }
}

function startQuiz() {
    showScreen('quiz-topic-selection-menu');
}

function selectTopic(topic) {
    selectedTopic = topic;
    if (selectedTopicDisplay) { // Check if element exists
        selectedTopicDisplay.textContent = topic.toUpperCase();
    }
    showScreen('quiz-difficulty-selection-menu');
}

function selectDifficulty(difficulty) {
    selectedDifficulty = difficulty;
    // Shuffle and take only the first 10 questions for the session
    // REQ: Filtro Estricto de Niveles (Incidencia 4)
    const allQuestionsForLevel = [...quizData[selectedTopic][selectedDifficulty]]
        .map(q => window.normalizeQuestion(q));

    shuffleArray(allQuestionsForLevel);
    currentQuestions = allQuestionsForLevel.slice(0, 10);

    currentQuestionIndex = 0;
    currentScore = 0;
    answeredCorrectly = 0;
    answeredIncorrectly = 0;
    timeElapsed = 0; // Reset timer for the new session
    updateScoreDisplay(); // Asegurarse de que el score se reinicie visualmente
    startQuestion();
    showScreen('quiz-play-area');
}

function startQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        endQuiz();
        return;
    }

    resetQuestionArea();
    resumeTimer();
    updateTimerDisplay();

    const question = currentQuestions[currentQuestionIndex];
    if (quizQuestion) quizQuestion.innerHTML = window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(question.question) : question.question;
    questionStartTime = Date.now();
    responseChanges = 0;
    if (quizHelpText) {
        quizHelpText.innerHTML = window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(question.help || '') : (question.help || ''); // Set help text, now always visible
        quizHelpText.classList.remove('hidden'); // Ensure help text is visible
    }


    switch (question.type) {
        case "multiple-choice":
            setupMultipleChoiceQuestion(question);
            break;
        case "syntax-completion":
        case "order-execution":
            setupSyntaxOrderQuestion(question);
            break;
        case "drag-match":
            setupDragMatchQuestion(question);
            break;
    }

    // Start timer after question setup
    if (!quizTimer) {
        quizTimer = setInterval(() => {
            if (!isPaused) {
                timeElapsed++; // Incrementar el tiempo transcurrido
            }
            updateTimerDisplay();
            // La pregunta ya no avanza automáticamente al llegar a un límite
        }, 1000);
    }
    resetInactivityTimer(); // Reset inactivity timer on new question
}

function resetQuestionArea() {
    if (multipleChoiceOptions) {
        multipleChoiceOptions.innerHTML = '';
        multipleChoiceOptions.classList.add('hidden');
        multipleChoiceOptions.classList.remove('grid'); // Remove grid display for other types
    }

    if (syntaxOrderContainer) {
        syntaxOrderContainer.classList.add('hidden');
        if (syntaxTargetArea) syntaxTargetArea.innerHTML = '';
        if (syntaxOptionsArea) syntaxOptionsArea.innerHTML = '';
    }

    if (dragMatchContainer) {
        dragMatchContainer.classList.add('hidden');
        if (dragElementsArea) dragElementsArea.innerHTML = '';
        if (dropTargetsArea) dropTargetsArea.innerHTML = '';
    }


    // Reset button states
    if (checkSyntaxButton) checkSyntaxButton.disabled = false;
    if (undoSyntaxButton) undoSyntaxButton.disabled = false;
    if (checkMatchButton) checkMatchButton.disabled = false;
    if (undoMatchButton) undoMatchButton.disabled = false;
}

function setupMultipleChoiceQuestion(question) {
    if (multipleChoiceOptions) {
        multipleChoiceOptions.classList.remove('hidden');
        multipleChoiceOptions.classList.add('grid'); // Ensure grid display for multiple choice

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.classList.add('answer-option-button', 'px-6', 'py-3', 'rounded-xl', 'font-semibold', 'text-lg',
                'bg-blue-500', 'text-white', 'hover:bg-blue-600',
                'transition-all', 'duration-300', 'ease-in-out',
                'shadow-md', 'hover:shadow-lg', 'focus:outline-none', 'focus:ring-4', 'focus:ring-blue-300');
            button.dataset.option = index;
            button.innerHTML = window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(option) : option;
            button.onclick = () => checkAnswer(index, question.correctAnswer);
            multipleChoiceOptions.appendChild(button);
        });
    }
}

function setupSyntaxOrderQuestion(question) {
    if (syntaxOrderContainer) {
        syntaxOrderContainer.classList.remove('hidden');

        currentSyntaxFragments = shuffleArray([...question.fragments]);
        currentSyntaxOrder = [];

        renderSyntaxOptions();
        renderSyntaxTarget();

        if (checkSyntaxButton) checkSyntaxButton.onclick = checkSyntaxOrder;
        if (undoSyntaxButton) undoSyntaxButton.onclick = undoSyntaxOrder;
    }
}

function renderSyntaxOptions() {
    if (syntaxOptionsArea) {
        syntaxOptionsArea.innerHTML = '';
        currentSyntaxFragments.forEach((fragment, index) => {
            const fragmentSpan = document.createElement('span');
            fragmentSpan.classList.add('syntax-fragment', 'bg-gray-200', 'text-gray-800', 'px-3', 'py-1', 'rounded', 'cursor-pointer', 'hover:bg-gray-300', 'transition-colors', 'duration-200');
            fragmentSpan.innerHTML = window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(fragment) : fragment;
            fragmentSpan.dataset.index = index;
            fragmentSpan.onclick = () => addSyntaxFragment(fragment, index);
            responseChanges++;
            syntaxOptionsArea.appendChild(fragmentSpan);
        });
    }
}

function renderSyntaxTarget() {
    if (syntaxTargetArea) {
        syntaxTargetArea.innerHTML = '';
        currentSyntaxOrder.forEach((item) => {
            const fragmentSpan = document.createElement('span');
            fragmentSpan.classList.add('syntax-fragment-target', 'bg-purple-200', 'text-purple-800', 'px-3', 'py-1', 'rounded', 'relative', 'cursor-pointer', 'hover:bg-purple-300', 'transition-colors', 'duration-200');
            fragmentSpan.innerHTML = window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(item.fragment) : item.fragment;
            fragmentSpan.dataset.originalIndex = item.originalIndex; // Store original index

            // Add a small 'x' button for removal
            const removeButton = document.createElement('span');
            removeButton.classList.add('absolute', '-top-1', '-right-1', 'bg-red-500', 'text-white', 'rounded-full', 'w-4', 'h-4', 'flex', 'items-center', 'justify-center', 'text-xs', 'cursor-pointer');
            removeButton.textContent = 'x';
            removeButton.onclick = (e) => {
                e.stopPropagation(); // Prevent parent click
                removeSyntaxFragment(item.originalIndex);
            };
            fragmentSpan.appendChild(removeButton);
            syntaxTargetArea.appendChild(fragmentSpan);
        });
    }
}

function addSyntaxFragment(fragment, originalIndex) {
    // Only add if it's not already in the target area (based on original index)
    if (!currentSyntaxOrder.some(item => item.originalIndex === originalIndex)) {
        currentSyntaxOrder.push({ fragment, originalIndex });
        renderSyntaxTarget();
        // Temporarily hide the added fragment from options area
        if (syntaxOptionsArea) {
            const fragmentElement = syntaxOptionsArea.querySelector(`[data-index="${originalIndex}"]`);
            if (fragmentElement) {
                fragmentElement.style.visibility = 'hidden';
            }
        }
    }
}

function removeSyntaxFragment(originalIndex) {
    currentSyntaxOrder = currentSyntaxOrder.filter(item => item.originalIndex !== originalIndex);
    renderSyntaxTarget();
    // Make the fragment visible again in options area
    if (syntaxOptionsArea) {
        const fragmentElement = syntaxOptionsArea.querySelector(`[data-index="${originalIndex}"]`);
        if (fragmentElement) {
            fragmentElement.style.visibility = 'visible';
        }
    }
}


function checkSyntaxOrder() {
    pauseTimer();

    const question = currentQuestions[currentQuestionIndex];
    const correctOrderFragments = question.correctOrder.map(idx => question.fragments[idx]);
    const userAnswerFragments = currentSyntaxOrder.map(item => item.fragment);

    if (quizHelpText) quizHelpText.classList.remove('hidden'); // Show help text

    let isCorrect = true;
    if (userAnswerFragments.length !== correctOrderFragments.length) {
        isCorrect = false;
    } else {
        for (let i = 0; i < correctOrderFragments.length; i++) {
            if (userAnswerFragments[i] !== correctOrderFragments[i]) {
                isCorrect = false;
                break;
            }
            // Add visual feedback for each fragment
            const targetFragments = syntaxTargetArea.querySelectorAll('.syntax-fragment-target');
            if (targetFragments[i]) {
                targetFragments[i].classList.remove('bg-purple-200', 'text-purple-800');
                if (userAnswerFragments[i] === correctOrderFragments[i]) {
                    targetFragments[i].classList.add('bg-green-300', 'text-green-900', 'border-2', 'border-green-600');
                } else {
                    targetFragments[i].classList.add('bg-red-300', 'text-red-900', 'border-2', 'border-red-600');
                }
            }
        }
    }

    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }

    // Trigger animation feedback
    if (quizPlayArea) {
        quizPlayArea.classList.add(isCorrect ? 'animate-flash-green' : 'animate-flash-red');
        setTimeout(() => quizPlayArea.classList.remove('animate-flash-green', 'animate-flash-red'), 500);
    }


    if (checkSyntaxButton) checkSyntaxButton.disabled = true;
    if (undoSyntaxButton) undoSyntaxButton.disabled = true;
    setTimeout(nextQuestion, 1000);
}

function undoSyntaxOrder() {
    if (currentSyntaxOrder.length > 0) {
        const lastItem = currentSyntaxOrder.pop();
        renderSyntaxTarget();
        if (syntaxOptionsArea) {
            const fragmentElement = syntaxOptionsArea.querySelector(`[data-index="${lastItem.originalIndex}"]`);
            if (fragmentElement) {
                fragmentElement.style.visibility = 'visible';
            }
        }
    }
}


function setupDragMatchQuestion(question) {
    if (dragMatchContainer) {
        dragMatchContainer.classList.remove('hidden');
        if (dragElementsArea) dragElementsArea.innerHTML = '';
        if (dropTargetsArea) dropTargetsArea.innerHTML = '';

        currentDragMatchPairs = shuffleArray([...question.pairs]);
        originalDragMatchState = currentDragMatchPairs.map(pair => ({ drag: pair.drag, drop: pair.drop, dropped: false }));

        const shuffledDragItems = shuffleArray(currentDragMatchPairs.map(p => p.drag));
        const shuffledDropItems = shuffleArray(currentDragMatchPairs.map(p => p.drop)); // Use drop values as targets

        shuffledDragItems.forEach((dragText, index) => {
            const dragItem = document.createElement('div');
            // Initial styling for draggable items
            dragItem.classList.add('drag-item', 'bg-blue-200', 'text-blue-800', 'px-4', 'py-2', 'rounded-lg', 'cursor-grab', 'hover:bg-blue-300', 'transition-colors', 'duration-200', 'shadow-md');
            dragItem.innerHTML = window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(dragText) : dragText;
            dragItem.setAttribute('draggable', true);
            dragItem.dataset.originalText = dragText; // Store original text to match later
            dragItem.addEventListener('dragstart', handleDragStart);
            if (dragElementsArea) dragElementsArea.appendChild(dragItem);
        });

        shuffledDropItems.forEach((dropText, index) => {
            const dropTarget = document.createElement('div');
            // Initial styling for drop targets
            dropTarget.classList.add('drop-target', 'bg-gray-100', 'text-gray-700', 'border-2', 'border-dashed', 'border-gray-400', 'px-4', 'py-2', 'rounded-lg', 'flex', 'items-center', 'justify-center', 'min-h-[40px]', 'text-center', 'relative', 'overflow-hidden');
            dropTarget.dataset.correctMatch = dropText; // Store the correct match for this target

            const dropTextSpan = document.createElement('span');
            dropTextSpan.classList.add('drop-text-placeholder', 'absolute', 'inset-0', 'flex', 'items-center', 'justify-center', 'p-2');
            dropTextSpan.innerHTML = window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(dropText) : dropText; // Show the target text initially
            dropTarget.appendChild(dropTextSpan);

            dropTarget.addEventListener('dragover', handleDragOver);
            dropTarget.addEventListener('drop', handleDrop);
            dropTarget.addEventListener('drop', () => responseChanges++);
            dropTarget.addEventListener('dragleave', handleDragLeave);
            if (dropTargetsArea) dropTargetsArea.appendChild(dropTarget);
        });

        // Add a global dragend listener to ensure the dragged item is always reset
        document.addEventListener('dragend', handleDragEnd);


        if (checkMatchButton) checkMatchButton.onclick = checkDragMatch;
        if (undoMatchButton) undoMatchButton.onclick = undoDragMatch;
    }
}

// Global variable to hold the currently dragged item's original element from dragElementsArea
let draggedItemOriginalElement = null;

function handleDragStart(e) {
    draggedItemOriginalElement = e.target; // Store the actual element from the drag area
    e.dataTransfer.setData('text/plain', draggedItemOriginalElement.dataset.originalText);
    setTimeout(() => {
        if (draggedItemOriginalElement) {
            draggedItemOriginalElement.classList.add('opacity-0'); // Make original element transparent during drag
        }
    }, 0);
}

function handleDragOver(e) {
    e.preventDefault(); // Allow drop
    if (e.target && e.target.classList.contains('drop-target')) {
        e.target.classList.add('border-blue-500', 'bg-blue-100'); // Visual feedback
    }
}

function handleDragLeave(e) {
    if (e.target && e.target.classList.contains('drop-target')) {
        e.target.classList.remove('border-blue-500', 'bg-blue-100');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const dropTarget = e.target.closest('.drop-target');
    if (e.target && dropTarget) {
        e.target.classList.remove('border-blue-500', 'bg-blue-100'); // Remove drag-over feedback

        // If the drop target already has a child (an item was dropped here before),
        // return the old item to the drag area before placing the new one.
        const existingDroppedItemInTarget = dropTarget.querySelector('.drag-item-dropped');
        if (existingDroppedItemInTarget) {
            // Find the original drag item in the dragElementsArea based on its text content
            const originalElementToRestore = dragElementsArea.querySelector(`[data-original-text="${existingDroppedItemInTarget.dataset.originalText}"]`);
            if (originalElementToRestore) {
                originalElementToRestore.classList.remove('hidden', 'opacity-0'); // Make it visible again
                originalElementToRestore.classList.add('drag-item'); // Ensure it has the drag-item class
            } else {
                // If the original element was somehow lost, recreate it in the drag area
                const tempDragItem = document.createElement('div');
                tempDragItem.classList.add('drag-item', 'bg-blue-200', 'text-blue-800', 'px-4', 'py-2', 'rounded-lg', 'cursor-grab', 'hover:bg-blue-300', 'transition-colors', 'duration-200', 'shadow-md');
                tempDragItem.innerHTML = window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(existingDroppedItemInTarget.dataset.originalText) : existingDroppedItemInTarget.dataset.originalText;
                tempDragItem.dataset.originalText = existingDroppedItemInTarget.dataset.originalText;
                tempDragItem.setAttribute('draggable', true);
                tempDragItem.addEventListener('dragstart', handleDragStart);
                dragElementsArea.appendChild(tempDragItem);
            }
            existingDroppedItemInTarget.remove(); // Remove the old dropped item from the target
        }

        // Now place the new dragged item
        if (draggedItemOriginalElement) {
            const droppedItem = document.createElement('div');
            droppedItem.classList.add('drag-item-dropped', 'bg-indigo-300', 'text-indigo-900', 'px-4', 'py-2', 'rounded-lg', 'cursor-default', 'min-w-[100px]', 'text-center', 'shadow-inner', 'flex', 'items-center', 'justify-center', 'w-full', 'h-full');
            droppedItem.innerHTML = window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(draggedItemOriginalElement.dataset.originalText) : draggedItemOriginalElement.dataset.originalText;
            droppedItem.dataset.originalText = draggedItemOriginalElement.dataset.originalText; // Keep original text reference

            // Hide the placeholder text if present
            const dropTextPlaceholder = dropTarget.querySelector('.drop-text-placeholder');
            if (dropTextPlaceholder) {
                dropTextPlaceholder.classList.add('hidden');
            }

            dropTarget.appendChild(droppedItem);
            draggedItemOriginalElement.classList.add('hidden'); // Hide the original element from the drag area
            draggedItemOriginalElement.classList.remove('opacity-0'); // Reset opacity for next drag if needed

            draggedItemOriginalElement = null; // Reset dragged item
        }
    } else {
        // If dropped outside a valid target, restore the original dragged item's visibility
        if (draggedItemOriginalElement) {
            draggedItemOriginalElement.classList.remove('hidden', 'opacity-0');
            draggedItemOriginalElement = null;
        }
    }
}

function handleDragEnd(e) {
    // This fires after a drag operation ends, regardless of whether it was a successful drop or not.
    // It's a good place to ensure the dragged item's visibility is reset if it wasn't dropped.
    if (draggedItemOriginalElement) {
        draggedItemOriginalElement.classList.remove('opacity-0'); // Ensure opacity is restored
        // If the dropEffect is 'none', it means the item was not dropped on a valid target.
        if (e.dataTransfer.dropEffect === 'none') {
            draggedItemOriginalElement.classList.remove('hidden'); // Make it visible again in its original area
        }
        draggedItemOriginalElement = null; // Clear the reference
    }
}


function checkDragMatch() {
    pauseTimer();

    let allCorrect = true;
    const dropTargets = document.querySelectorAll('.drop-target');

    if (quizHelpText) quizHelpText.classList.remove('hidden'); // Show help text

    dropTargets.forEach(target => {
        const droppedItem = target.querySelector('.drag-item-dropped');
        const correctMatch = target.dataset.correctMatch; // This is the expected drop text
        const targetPlaceholder = target.querySelector('.drop-text-placeholder');

        // Clear previous feedback styles
        target.classList.remove('border-green-600', 'border-red-600');
        if (droppedItem) {
            droppedItem.classList.remove('bg-indigo-300', 'text-indigo-900', 'bg-green-400', 'text-green-900', 'bg-red-400', 'text-red-900', 'border-2', 'border-green-600', 'border-red-600');
        }
        if (targetPlaceholder) {
            targetPlaceholder.classList.remove('text-green-700', 'font-bold', 'text-red-700');
        }


        if (droppedItem) {
            // Find the original pair using droppedItem's text and target's correctMatch
            // The logic here needs to map `dragText` to `dropText` from `question.pairs`
            const matchedPair = currentDragMatchPairs.find(pair =>
                pair.drag === droppedItem.dataset.originalText && pair.drop === correctMatch
            );

            if (matchedPair) {
                droppedItem.classList.add('bg-green-400', 'text-green-900', 'border-2', 'border-green-600');
                target.classList.add('border-green-600');
                // Ensure placeholder is hidden if an item is correctly placed
                if (targetPlaceholder) targetPlaceholder.classList.add('hidden');
            } else {
                allCorrect = false;
                droppedItem.classList.add('bg-red-400', 'text-red-900', 'border-2', 'border-red-600');
                target.classList.add('border-red-600');
                // Show the correct answer in the target placeholder for incorrect matches
                if (targetPlaceholder) {
                    targetPlaceholder.innerHTML = (window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(correctMatch) : correctMatch) + ' (Correcto)';
                    targetPlaceholder.classList.remove('hidden');
                    targetPlaceholder.classList.add('text-green-700', 'font-bold');
                }
            }
        } else {
            // If nothing was dropped, it's incorrect
            allCorrect = false;
            target.classList.add('border-red-600');
            if (targetPlaceholder) {
                targetPlaceholder.innerHTML = (window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(correctMatch) : correctMatch) + ' (Faltante)';
                targetPlaceholder.classList.remove('hidden');
                targetPlaceholder.classList.add('text-red-700', 'font-bold');
            }
        }
    });

    if (allCorrect) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }

    // Trigger animation feedback
    if (quizPlayArea) {
        quizPlayArea.classList.add(allCorrect ? 'animate-flash-green' : 'animate-flash-red');
        setTimeout(() => quizPlayArea.classList.remove('animate-flash-green', 'animate-flash-red'), 500);
    }


    if (checkMatchButton) checkMatchButton.disabled = true;
    if (undoMatchButton) undoMatchButton.disabled = true;
    setTimeout(nextQuestion, 2000);
}


function undoDragMatch() {
    const dropTargets = document.querySelectorAll('.drop-target');
    dropTargets.forEach(target => {
        const droppedItem = target.querySelector('.drag-item-dropped');
        if (droppedItem) {
            droppedItem.remove(); // Remove from target
        }

        // Show the placeholder text again
        const dropTextPlaceholder = target.querySelector('.drop-text-placeholder');
        if (dropTextPlaceholder) {
            dropTextPlaceholder.classList.remove('hidden', 'text-green-700', 'font-bold', 'text-red-700');
            dropTextPlaceholder.innerHTML = window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(target.dataset.correctMatch) : target.dataset.correctMatch; // Restore original placeholder text
        }
        // Remove any border feedback from the target
        target.classList.remove('border-green-600', 'border-red-600');
    });

    // Ensure all original drag items are visible in the drag area and have correct styling
    if (dragElementsArea) {
        const allDragItems = dragElementsArea.querySelectorAll('.drag-item, .drag-item-dropped'); // Select both potential types
        allDragItems.forEach(item => {
            // Restore original drag-item classes and remove any dropped-specific or feedback classes
            item.classList.remove('hidden', 'opacity-0', 'drag-item-dropped', 'bg-indigo-300', 'text-indigo-900', 'bg-green-400', 'text-green-900', 'bg-red-400', 'text-red-900', 'border-2', 'border-green-600', 'border-red-600');
            item.classList.add('drag-item', 'bg-blue-200', 'text-blue-800'); // Restore default drag item styles
            item.setAttribute('draggable', true); // Make draggable again
        });
    }
}


// --- Helper Functions ---

function updateTimerDisplay() {
    const minutes = String(Math.floor(timeElapsed / 60)).padStart(2, '0'); // Usar timeElapsed
    const seconds = String(timeElapsed % 60).padStart(2, '0'); // Usar timeElapsed
    if (quizTimerDisplay) quizTimerDisplay.textContent = `${minutes}:${seconds}`;
}

function updateScoreDisplay() {
    if (quizScoreDisplay) quizScoreDisplay.textContent = currentScore;
}

function checkAnswer(selectedIndex, correctAnswer) {
    const responseTime = Date.now() - questionStartTime;
    pauseTimer();
    if (quizHelpText) quizHelpText.classList.remove('hidden'); // Show help text after answer

    // Disable all options after answering
    if (multipleChoiceOptions) {
        const buttons = multipleChoiceOptions.querySelectorAll('.answer-option-button');
        buttons.forEach(button => {
            button.disabled = true;
            if (parseInt(button.dataset.option) === correctAnswer) {
                button.classList.remove('bg-blue-500', 'hover:bg-blue-600');
                button.classList.add('bg-green-500'); // Correct answer green
            } else if (parseInt(button.dataset.option) === selectedIndex) {
                button.classList.remove('bg-blue-500', 'hover:bg-blue-600');
                button.classList.add('bg-red-500'); // Incorrect selected red
            }
        });
    }


    const question = currentQuestions[currentQuestionIndex];
    const finalCorrect = (correctAnswer !== undefined && correctAnswer !== null) ? correctAnswer : question.respuestaCorrecta;
    const isCorrect = selectedIndex == finalCorrect;

    // Captura de Analítica Unificada (Fase 5)
    if (window.GamesAdapter) {
        totalXP += window.GamesAdapter.calculateXP(isCorrect, selectedDifficulty, responseTime, 'webmaster');

        GamesAdapter.recordAction({
            asignatura: 'Diseño Web',
            nivel: selectedDifficulty,
            preguntaId: 'wm_' + currentQuestionIndex,
            tema: selectedTopic,
            respuestaSeleccionada: selectedIndex,
            respuestaCorrecta: finalCorrect,
            esCorrecta: isCorrect,
            tiempoRespuesta: responseTime,
            cambiosRespuesta: responseChanges
        });
    }

    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }

    // Trigger animation feedback
    if (quizPlayArea) {
        quizPlayArea.classList.add(selectedIndex === correctAnswer ? 'animate-flash-green' : 'animate-flash-red');
        setTimeout(() => quizPlayArea.classList.remove('animate-flash-green', 'animate-flash-red'), 500);
    }


    setTimeout(nextQuestion, 1000); // Short delay before next question
}

function handleCorrectAnswer() {
    currentScore += 1; // 1 punto por respuesta correcta
    answeredCorrectly++;
    updateScoreDisplay();
}

function handleIncorrectAnswer() {
    // No se resta puntuación por errores, solo se cuenta el error
    answeredIncorrectly++;
    updateScoreDisplay(); // Asegurarse de que el score se actualice visualmente
}

function nextQuestion() {
    currentQuestionIndex++;
    startQuestion();
}

function endQuiz() {
    clearInterval(quizTimer);
    if (quizCorrectAnswers) quizCorrectAnswers.textContent = answeredCorrectly;
    if (quizIncorrectAnswers) quizIncorrectAnswers.textContent = answeredIncorrectly;
    if (quizFinalScore) quizFinalScore.textContent = currentScore;

    const minutes = String(Math.floor(timeElapsed / 60)).padStart(2, '0');
    const seconds = String(timeElapsed % 60).padStart(2, '0');
    const finalTimeFormatted = `${minutes}:${seconds}`;

    if (quizFinalTime) {
        quizFinalTime.textContent = finalTimeFormatted;
    }

    // Guardar en el portal vía Adaptador Unificado (Sincronización Silenciosa)
    if (window.GamesAdapter) {
        GamesAdapter.finishSession('Diseño Web', selectedDifficulty, currentScore, totalXP);
    }

    // Check if there's a next level
    const difficultyOrder = ['basico', 'intermedio', 'avanzado'];
    const currentDifficultyIndex = difficultyOrder.indexOf(selectedDifficulty);
    const nextDifficulty = difficultyOrder[currentDifficultyIndex + 1];

    if (nextDifficulty && quizData[selectedTopic][nextDifficulty]) {
        if (quizNextLevelButton) {
            quizNextLevelButton.classList.remove('hidden');
            quizNextLevelButton.onclick = () => {
                selectDifficulty(nextDifficulty); // Start next level
            };
        }
    } else {
        if (quizNextLevelButton) quizNextLevelButton.classList.add('hidden');
    }

    showScreen('quiz-result-screen');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- Global Initialization Function for the Quiz Game ---
// This function will be called by index.html after the quiz HTML content is loaded.
window.initQuizGame = function() {
    // REQ: Uso de sesión centralizada (Hallazgo 1)
    if (window.GamesAdapter) {
        window.GamesAdapter.init('webmaster', false).then(function() {
            var user = window.GamesAdapter.state.currentUser;

            if (!user) {
                var gmWarning = document.getElementById('guest-mode-warning');
                if (gmWarning) gmWarning.classList.remove('hidden');
                var cgBtn = document.getElementById('continue-guest-btn');
                if (cgBtn) {
                    cgBtn.classList.remove('hidden');
                    cgBtn.onclick = function() {
                        var gmw = document.getElementById('guest-mode-warning');
                        if (gmw) gmw.classList.add('hidden');
                        cgBtn.classList.add('hidden');
                    };
                }
            }

            // REQ: Estrategia Caché Primero (v7.6)
            window.GamesAdapter.getLeaderboard('webmaster', function(lb) {
                // Renderizar Mini-Leaderboard (REQ 7: Top 5 con XP)
                var miniLb = document.getElementById('mini-leaderboard');
                if (miniLb && lb && lb.global) {
                    miniLb.innerHTML = lb.global.slice(0, 5).map(function(u, i) {
                        return '<div class="flex items-center justify-between text-[10px] font-bold py-1 border-b border-blue-50 last:border-0">' +
                                '<span class="text-blue-700">' + (i + 1) + '. ' + (u.nombre ? u.nombre.split(' ')[0] : 'Alumno') + '</span>' +
                                '<div class="flex flex-col items-end">' +
                                    '<span class="text-blue-500">' + u.promedio + '%</span>' +
                                    '<span class="text-[8px] text-gray-400 font-black">' + (u.xp || 0).toLocaleString() + ' XP</span>' +
                                '</div>' +
                            '</div>';
                    }).join('');
                } else if (miniLb) {
                    miniLb.innerHTML = '<p class="text-[10px] text-gray-400 text-center italic">Sin datos globales</p>';
                }
            });

            window.GamesAdapter.getPersonalRecord(function(record) {
                // Cargar récord personal (Hallazgo 2/3)
                var myRecord = record["webmaster"] || record["WebMaster Quiz"];
                if (myRecord) {
                    var scoreSpan = document.getElementById('init-max-score');
                    if (scoreSpan) scoreSpan.textContent = myRecord.maxScore || myRecord.score || myRecord.puntaje || 0;
                }
            });
        });
    }
        document.getElementById('guest-mode-warning')?.classList.remove('hidden');
        const guestBtn = document.getElementById('continue-guest-btn');
        if (guestBtn) {
            guestBtn.classList.remove('hidden');
            guestBtn.onclick = () => {
                document.getElementById('guest-mode-warning')?.classList.add('hidden');
                guestBtn.classList.add('hidden');
            };
        }
    }

    // Assign DOM elements now that they are guaranteed to be in the document
    quizStartMenu = document.getElementById('quiz-start-menu');
    startQuizButton = document.getElementById('start-quiz-button');
    quizTopicSelectionMenu = document.getElementById('quiz-topic-selection-menu');
    topicButtons = document.querySelectorAll('.topic-button');
    backToStartMenuButton = document.getElementById('back-to-start-menu-button');
    quizDifficultySelectionMenu = document.getElementById('quiz-difficulty-selection-menu');
    selectedTopicDisplay = document.getElementById('selected-topic-display');
    difficultyButtons = document.querySelectorAll('.difficulty-button');
    backToTopicMenuButton = document.getElementById('back-to-topic-menu-button');
    quizPlayArea = document.getElementById('quiz-play-area');
    quizTimerDisplay = document.getElementById('quiz-timer');
    quizScoreDisplay = document.getElementById('quiz-score-display');
    quizQuestion = document.getElementById('quiz-question');
    quizHelpText = document.getElementById('quiz-help-text');
    multipleChoiceOptions = document.getElementById('multiple-choice-options');
    syntaxOrderContainer = document.getElementById('syntax-order-container');
    syntaxTargetArea = document.getElementById('syntax-target-area');
    syntaxOptionsArea = document.getElementById('syntax-options-area');
    checkSyntaxButton = document.getElementById('check-syntax-button');
    undoSyntaxButton = document.getElementById('undo-syntax-button');
    dragMatchContainer = document.getElementById('drag-match-container');
    dragElementsArea = document.getElementById('drag-elements');
    dropTargetsArea = document.getElementById('drop-targets');
    checkMatchButton = document.getElementById('check-match-button');
    undoMatchButton = document.getElementById('undo-match-button');
    endQuizButton = document.getElementById('end-quiz-button');
    quizResultScreen = document.getElementById('quiz-result-screen');
    quizCorrectAnswers = document.getElementById('quiz-correct-answers');
    quizIncorrectAnswers = document.getElementById('quiz-incorrect-answers');
    quizFinalScore = document.getElementById('quiz-final-score');
    quizFinalTime = document.getElementById('quiz-final-time');
    quizRetryLevelButton = document.getElementById('quiz-retry-level-button');
    quizNextLevelButton = document.getElementById('quiz-next-level-button');
    quizChangeTopicButton = document.getElementById('quiz-change-topic-button');
    quizExitGameButton = document.getElementById('quiz-exit-game-button');
    inactivityWarningModal = document.getElementById('inactivity-warning-modal');
    inactivityCountdownDisplay = document.getElementById('inactivity-countdown-display');

    // --- Event Listeners ---
    if (startQuizButton) {
        startQuizButton.addEventListener('click', () => {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(e => console.warn("FS failed", e));
            }
            if (window.requestWakeLock) window.requestWakeLock();
            startQuiz();
        });
    }

    topicButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', () => selectTopic(button.dataset.topic));
        }
    });

    if (backToStartMenuButton) {
        backToStartMenuButton.addEventListener('click', () => showScreen('quiz-start-menu'));
    }

    difficultyButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', () => selectDifficulty(button.dataset.difficulty));
        }
    });

    if (backToTopicMenuButton) {
        backToTopicMenuButton.addEventListener('click', () => showScreen('quiz-topic-selection-menu'));
    }

    if (endQuizButton) {
        endQuizButton.addEventListener('click', endQuiz);
    }

    if (quizRetryLevelButton) {
        quizRetryLevelButton.addEventListener('click', () => {
            selectDifficulty(selectedDifficulty); // Re-select current difficulty to restart
        });
    }

    // quizNextLevelButton's click handler is set dynamically in endQuiz

    if (quizChangeTopicButton) {
        quizChangeTopicButton.addEventListener('click', () => showScreen('quiz-topic-selection-menu'));
    }

    if (quizExitGameButton) {
        quizExitGameButton.addEventListener('click', () => {
            // This assumes window.returnToMainContent is defined in the parent index.html
            if (window.returnToMainContent) {
                window.returnToMainContent();
            } else {
                // Fallback if not running in the expected parent context
                console.warn("window.returnToMainContent not found. Cannot return to main content.");
                showScreen('quiz-start-menu'); // Just go back to quiz start menu
            }
        });
    }

    // Event listeners para detectar actividad del usuario (solo después de que los elementos existan)
    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer);
    });

    // Control de Abandono (Fase 11)
    const handleAbandonment = () => {
        if (quizPlayArea && !quizPlayArea.classList.contains('hidden')) {
            alert('Evaluación cancelada por cambio de pestaña o ventana.');
            location.reload();
        }
    };
    window.addEventListener('blur', handleAbandonment);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') handleAbandonment(); });

    if (window.GamesAdapter) window.GamesAdapter.showLoading(false);
    // Initial screen setup - moved inside initQuizGame
    showScreen('quiz-start-menu');
}; // End of initQuizGame function
