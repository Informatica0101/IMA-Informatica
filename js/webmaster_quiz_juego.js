(function(app) {
    "use strict";

    // Este archivo contiene la lógica y los datos del juego de WebMaster Quiz.
    // Incluye las preguntas por tema y dificultad, y la configuración del juego.

    var quizData = {
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
                    codeExample: "<table>\n    <tr>\n        <td>Contenido de celda</td>\n    </tr>\n</table>"
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
                    codeExample: "<!DOCTYPE html>\n<html>\n<head>\n    <title>Título</title>\n</head>\n<body>\n    Contenido\n</body>\n</html>"
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
                    codeExample: "<ol>\n    <li>Primer ítem</li>\n    <li>Segundo ítem</li>\n</ol>"
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
                    codeExample: "<ul>\n    <li>Café</li>\n    <li>Té</li>\n</ul>"
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
                    codeExample: "<th>Nombre</th>"
                }
            ],
            intermedio: [
                {
                    question: "Atributo para que una celda de tabla ocupe varias columnas:",
                    type: "multiple-choice",
                    options: ["`rowspan`", "`colspan`", "`cellspan`", "`merge-rows`"],
                    correctAnswer: 1,
                    help: "Este atributo se usa para expandir una celda a través de múltiples columnas.",
                    codeExample: "<table>\n    <tr>\n        <td colspan=\"2\">Celdas fusionadas</td>\n    </tr>\n</table>"
                },
                {
                    question: "Empareja el tipo de `input` de formulario con su uso:",
                    type: "drag-match",
                    pairs: [
                        { drag: "Campo de texto", drop: '<input type="text">' },
                        { drag: "Contraseña", drop: '<input type="password">' },
                        { drag: "Botón de envío", drop: '<input type="submit">' },
                        { drag: "Casilla de verificación", drop: '<input type="checkbox">' }
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
                    codeExample: "<iframe src=\"https://www.ejemplo.com\" width=\"600\" height=\"400\"></iframe>"
                },
                {
                    question: "Ordena para definir un formulario HTML básico:",
                    type: "order-execution",
                    fragments: ["<form>", "<label for=\"name\">", "Nombre:</label>", "<input type=\"text\" id=\"name\">", "<button>", "Enviar</button>", "</form>"],
                    correctOrder: [0, 1, 2, 3, 4, 5, 6],
                    help: "Un formulario agrupa sus campos y acciones.",
                    codeExample: "<form>\n    <label for=\"name\">Nombre:</label>\n    <input type=\"text\" id=\"name\">\n    <button>Enviar</button>\n</form>"
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
                    codeExample: "<meta charset=\"UTF-8\">"
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
                    codeExample: "<head>\n    <link rel=\"stylesheet\" href=\"styles.css\">\n</head>"
                },
                {
                    question: "Etiquetas de HTML5 para el contenido principal y la navegación:",
                    type: "multiple-choice",
                    options: ["`<content>` y `<menu>`", "`<main>` y `<nav>`", "`<article>` y `<aside>`", "`<section>` y `<header>`"],
                    correctAnswer: 1,
                    help: "HTML5 introdujo etiquetas para mejorar la semántica del documento.",
                    codeExample: "<main>...</main> <nav>...</nav>"
                }
            ],
            avanzado: [
                {
                    question: "Atributo para agrupar elementos de un formulario visualmente:",
                    type: "multiple-choice",
                    options: ["`<group>`", "`<section>`", "`<fieldset>`", "`<formgroup>`"],
                    correctAnswer: 2,
                    help: "La etiqueta `<legend>` se usa a menudo con esta para proporcionar un título al grupo.",
                    codeExample: "<fieldset><legend>Contacto</legend>...</fieldset>"
                }
            ]
        }
    };

    var currentQuestionIndex = 0;
    var currentScore = 0;
    var quizTimer;
    var timeElapsed = 0;
    var isPaused = false;
    var selectedTopic = '';
    var selectedDifficulty = '';
    var currentQuestions = [];
    var answeredCorrectly = 0;
    var answeredIncorrectly = 0;
    var questionStartTime = 0;
    var responseChanges = 0;

    var INACTIVITY_TIMEOUT = 60;
    var INACTIVITY_WARNING_DURATION = 10;

    var inactivityTimer;
    var inactivityCountdownInterval;
    var inactivityCountdown = INACTIVITY_WARNING_DURATION;

    var quizStartMenu;
    var startQuizButton;
    var quizTopicSelectionMenu;
    var topicButtons;
    var backToStartMenuButton;
    var quizDifficultySelectionMenu;
    var selectedTopicDisplay;
    var difficultyButtons;
    var backToTopicMenuButton;
    var quizPlayArea;
    var quizTimerDisplay;
    var quizScoreDisplay;
    var quizQuestion;
    var quizHelpText;
    var multipleChoiceOptions;
    var syntaxOrderContainer;
    var syntaxTargetArea;
    var syntaxOptionsArea;
    var checkSyntaxButton;
    var undoSyntaxButton;
    var dragMatchContainer;
    var dragElementsArea;
    var dropTargetsArea;
    var checkMatchButton;
    var undoMatchButton;
    var endQuizButton;
    var quizResultScreen;
    var quizCorrectAnswers;
    var quizIncorrectAnswers;
    var quizFinalScore;
    var quizFinalTime;
    var quizRetryLevelButton;
    var quizNextLevelButton;
    var quizChangeTopicButton;
    var quizExitGameButton;
    var inactivityWarningModal;
    var inactivityCountdownDisplay;

    var currentDragMatchPairs = [];
    var originalDragMatchState = [];

    var currentSyntaxFragments = [];
    var currentSyntaxOrder = [];

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
        if (inactivityWarningModal) {
            inactivityWarningModal.classList.remove('hidden');
        }
        if (inactivityCountdownDisplay) {
            inactivityCountdownDisplay.textContent = inactivityCountdown;
        }

        inactivityCountdownInterval = setInterval(function() {
            inactivityCountdown--;
            if (inactivityCountdownDisplay) {
                inactivityCountdownDisplay.textContent = inactivityCountdown;
            }
            if (inactivityCountdown <= 0) {
                clearInterval(inactivityCountdownInterval);
                resetGameDueToInactivity();
            }
        }, 1000);
    }

    function hideInactivityWarning() {
        if (inactivityWarningModal) {
            inactivityWarningModal.classList.add('hidden');
        }
    }

    function resetGameDueToInactivity() {
        clearInterval(quizTimer);
        clearInterval(inactivityCountdownInterval);
        showScreen('quiz-start-menu');
        currentScore = 0;
        answeredCorrectly = 0;
        answeredIncorrectly = 0;
        if (quizScoreDisplay) updateScoreDisplay();
        if (quizTimerDisplay) quizTimerDisplay.textContent = '00:00';

        var inactivityMessageElement = document.getElementById('inactivity-message');
        if (inactivityMessageElement) {
            inactivityMessageElement.textContent = 'El juego se ha reiniciado debido a la inactividad.';
        }
        setTimeout(function() {
            hideInactivityWarning();
            if (inactivityMessageElement) {
                inactivityMessageElement.textContent = 'Inactividad detectada. El juego se reiniciará en...';
            }
        }, 3000);
    }

    function showScreen(screenId) {
        var screens = [
            quizStartMenu,
            quizTopicSelectionMenu,
            quizDifficultySelectionMenu,
            quizPlayArea,
            quizResultScreen
        ];
        for (var i = 0; i < screens.length; i++) {
            var screen = screens[i];
            if (screen) {
                screen.classList.add('hidden');
                screen.classList.remove('flex', 'flex-col', 'animate-fade-in-down');
            }
        }

        var targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            targetScreen.classList.add('flex', 'flex-col', 'animate-fade-in-down');
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
        if (selectedTopicDisplay) {
            selectedTopicDisplay.textContent = topic.toUpperCase();
        }
        showScreen('quiz-difficulty-selection-menu');
    }

    function selectDifficulty(difficulty) {
        selectedDifficulty = difficulty;
        var allQuestionsForLevel = quizData[selectedTopic][selectedDifficulty].slice();
        for (var i = 0; i < allQuestionsForLevel.length; i++) {
            allQuestionsForLevel[i] = app.normalizeQuestion(allQuestionsForLevel[i]);
        }

        shuffleArray(allQuestionsForLevel);
        currentQuestions = allQuestionsForLevel.slice(0, 10);

        currentQuestionIndex = 0;
        currentScore = 0;
        answeredCorrectly = 0;
        answeredIncorrectly = 0;
        timeElapsed = 0;
        updateScoreDisplay();
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

        var question = currentQuestions[currentQuestionIndex];
        if (quizQuestion) quizQuestion.textContent = question.question;
        questionStartTime = Date.now();
        responseChanges = 0;
        if (quizHelpText) {
            quizHelpText.textContent = question.help || '';
            quizHelpText.classList.remove('hidden');
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

        if (!quizTimer) {
            quizTimer = setInterval(function() {
                if (!isPaused) {
                    timeElapsed++;
                }
                updateTimerDisplay();
            }, 1000);
        }
        resetInactivityTimer();
    }

    function resetQuestionArea() {
        if (multipleChoiceOptions) {
            multipleChoiceOptions.innerHTML = '';
            multipleChoiceOptions.classList.add('hidden');
            multipleChoiceOptions.classList.remove('grid');
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

        if (checkSyntaxButton) checkSyntaxButton.disabled = false;
        if (undoSyntaxButton) undoSyntaxButton.disabled = false;
        if (checkMatchButton) checkMatchButton.disabled = false;
        if (undoMatchButton) undoMatchButton.disabled = false;
    }

    function setupMultipleChoiceQuestion(question) {
        if (multipleChoiceOptions) {
            multipleChoiceOptions.classList.remove('hidden');
            multipleChoiceOptions.classList.add('grid');

            for (var i = 0; i < question.options.length; i++) {
                (function(opt, idx) {
                    var button = document.createElement('button');
                    button.classList.add('answer-option-button', 'px-6', 'py-3', 'rounded-xl', 'font-semibold', 'text-lg',
                        'bg-blue-500', 'text-white', 'hover:bg-blue-600',
                        'transition-all', 'duration-300', 'ease-in-out',
                        'shadow-md', 'hover:shadow-lg', 'focus:outline-none', 'focus:ring-4', 'focus:ring-blue-300');
                    button.dataset.option = idx;
                    button.textContent = opt;
                    button.onclick = function() { checkAnswer(idx, question.correctAnswer); };
                    multipleChoiceOptions.appendChild(button);
                })(question.options[i], i);
            }
        }
    }

    function setupSyntaxOrderQuestion(question) {
        if (syntaxOrderContainer) {
            syntaxOrderContainer.classList.remove('hidden');

            currentSyntaxFragments = shuffleArray(question.fragments.slice());
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
            for (var i = 0; i < currentSyntaxFragments.length; i++) {
                (function(frag, idx) {
                    var fragmentSpan = document.createElement('span');
                    fragmentSpan.classList.add('syntax-fragment', 'bg-gray-200', 'text-gray-800', 'px-3', 'py-1', 'rounded', 'cursor-pointer', 'hover:bg-gray-300', 'transition-colors', 'duration-200');
                    fragmentSpan.textContent = frag;
                    fragmentSpan.dataset.index = idx;
                    fragmentSpan.onclick = function() { addSyntaxFragment(frag, idx); };
                    responseChanges++;
                    syntaxOptionsArea.appendChild(fragmentSpan);
                })(currentSyntaxFragments[i], i);
            }
        }
    }

    function renderSyntaxTarget() {
        if (syntaxTargetArea) {
            syntaxTargetArea.innerHTML = '';
            for (var i = 0; i < currentSyntaxOrder.length; i++) {
                (function(item) {
                    var fragmentSpan = document.createElement('span');
                    fragmentSpan.classList.add('syntax-fragment-target', 'bg-purple-200', 'text-purple-800', 'px-3', 'py-1', 'rounded', 'relative', 'cursor-pointer', 'hover:bg-purple-300', 'transition-colors', 'duration-200');
                    fragmentSpan.textContent = item.fragment;
                    fragmentSpan.dataset.originalIndex = item.originalIndex;

                    var removeButton = document.createElement('span');
                    removeButton.classList.add('absolute', '-top-1', '-right-1', 'bg-red-500', 'text-white', 'rounded-full', 'w-4', 'h-4', 'flex', 'items-center', 'justify-center', 'text-xs', 'cursor-pointer');
                    removeButton.textContent = 'x';
                    removeButton.onclick = function(e) {
                        e.stopPropagation();
                        removeSyntaxFragment(item.originalIndex);
                    };
                    fragmentSpan.appendChild(removeButton);
                    syntaxTargetArea.appendChild(fragmentSpan);
                })(currentSyntaxOrder[i]);
            }
        }
    }

    function addSyntaxFragment(fragment, originalIndex) {
        var exists = false;
        for (var i = 0; i < currentSyntaxOrder.length; i++) {
            if (currentSyntaxOrder[i].originalIndex === originalIndex) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            currentSyntaxOrder.push({ fragment: fragment, originalIndex: originalIndex });
            renderSyntaxTarget();
            if (syntaxOptionsArea) {
                var fragmentElement = syntaxOptionsArea.querySelector('[data-index="' + originalIndex + '"]');
                if (fragmentElement) {
                    fragmentElement.style.visibility = 'hidden';
                }
            }
        }
    }

    function removeSyntaxFragment(originalIndex) {
        var newOrder = [];
        for (var i = 0; i < currentSyntaxOrder.length; i++) {
            if (currentSyntaxOrder[i].originalIndex !== originalIndex) {
                newOrder.push(currentSyntaxOrder[i]);
            }
        }
        currentSyntaxOrder = newOrder;
        renderSyntaxTarget();
        if (syntaxOptionsArea) {
            var fragmentElement = syntaxOptionsArea.querySelector('[data-index="' + originalIndex + '"]');
            if (fragmentElement) {
                fragmentElement.style.visibility = 'visible';
            }
        }
    }

    function checkSyntaxOrder() {
        pauseTimer();

        var question = currentQuestions[currentQuestionIndex];
        var correctOrderFragments = [];
        for (var j = 0; j < question.correctOrder.length; j++) {
            correctOrderFragments.push(question.fragments[question.correctOrder[j]]);
        }

        var userAnswerFragments = [];
        for (var k = 0; k < currentSyntaxOrder.length; k++) {
            userAnswerFragments.push(currentSyntaxOrder[k].fragment);
        }

        if (quizHelpText) quizHelpText.classList.remove('hidden');

        var isCorrect = true;
        if (userAnswerFragments.length !== correctOrderFragments.length) {
            isCorrect = false;
        } else {
            var targetFragments = syntaxTargetArea.querySelectorAll('.syntax-fragment-target');
            for (var i = 0; i < correctOrderFragments.length; i++) {
                if (targetFragments[i]) {
                    targetFragments[i].classList.remove('bg-purple-200', 'text-purple-800');
                    if (userAnswerFragments[i] === correctOrderFragments[i]) {
                        targetFragments[i].classList.add('bg-green-300', 'text-green-900', 'border-2', 'border-green-600');
                    } else {
                        isCorrect = false;
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

        if (quizPlayArea) {
            quizPlayArea.classList.add(isCorrect ? 'animate-flash-green' : 'animate-flash-red');
            setTimeout(function() { quizPlayArea.classList.remove('animate-flash-green', 'animate-flash-red'); }, 500);
        }

        if (checkSyntaxButton) checkSyntaxButton.disabled = true;
        if (undoSyntaxButton) undoSyntaxButton.disabled = true;
        setTimeout(nextQuestion, 1000);
    }

    function undoSyntaxOrder() {
        if (currentSyntaxOrder.length > 0) {
            var lastItem = currentSyntaxOrder.pop();
            renderSyntaxTarget();
            if (syntaxOptionsArea) {
                var fragmentElement = syntaxOptionsArea.querySelector('[data-index="' + lastItem.originalIndex + '"]');
                if (fragmentElement) {
                    fragmentElement.style.visibility = 'visible';
                }
            }
        }
    }

    var draggedItemOriginalElement = null;

    function handleDragStart(e) {
        draggedItemOriginalElement = e.target;
        e.dataTransfer.setData('text/plain', draggedItemOriginalElement.dataset.originalText);
        setTimeout(function() {
            if (draggedItemOriginalElement) {
                draggedItemOriginalElement.classList.add('opacity-0');
            }
        }, 0);
    }

    function handleDragOver(e) {
        e.preventDefault();
        var dropTarget = e.target.closest('.drop-target');
        if (dropTarget) {
            dropTarget.classList.add('border-blue-500', 'bg-blue-100');
        }
    }

    function handleDragLeave(e) {
        var dropTarget = e.target.closest('.drop-target');
        if (dropTarget) {
            dropTarget.classList.remove('border-blue-500', 'bg-blue-100');
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        var dropTarget = e.target.closest('.drop-target');
        if (dropTarget) {
            dropTarget.classList.remove('border-blue-500', 'bg-blue-100');

            var existingDroppedItemInTarget = dropTarget.querySelector('.drag-item-dropped');
            if (existingDroppedItemInTarget) {
                var originalElementToRestore = dragElementsArea.querySelector('[data-original-text="' + existingDroppedItemInTarget.dataset.originalText + '"]');
                if (originalElementToRestore) {
                    originalElementToRestore.classList.remove('hidden', 'opacity-0');
                    originalElementToRestore.classList.add('drag-item');
                }
                existingDroppedItemInTarget.remove();
            }

            if (draggedItemOriginalElement) {
                var droppedItem = document.createElement('div');
                droppedItem.classList.add('drag-item-dropped', 'bg-indigo-300', 'text-indigo-900', 'px-4', 'py-2', 'rounded-lg', 'cursor-default', 'min-w-[100px]', 'text-center', 'shadow-inner', 'flex', 'items-center', 'justify-center', 'w-full', 'h-full');
                droppedItem.textContent = draggedItemOriginalElement.dataset.originalText;
                droppedItem.dataset.originalText = draggedItemOriginalElement.dataset.originalText;

                var dropTextPlaceholder = dropTarget.querySelector('.drop-text-placeholder');
                if (dropTextPlaceholder) {
                    dropTextPlaceholder.classList.add('hidden');
                }

                dropTarget.appendChild(droppedItem);
                draggedItemOriginalElement.classList.add('hidden');
                draggedItemOriginalElement.classList.remove('opacity-0');

                draggedItemOriginalElement = null;
            }
        }
    }

    function handleDragEnd(e) {
        if (draggedItemOriginalElement) {
            draggedItemOriginalElement.classList.remove('opacity-0');
            if (e.dataTransfer.dropEffect === 'none') {
                draggedItemOriginalElement.classList.remove('hidden');
            }
            draggedItemOriginalElement = null;
        }
    }

    function setupDragMatchQuestion(question) {
        if (dragMatchContainer) {
            dragMatchContainer.classList.remove('hidden');
            if (dragElementsArea) dragElementsArea.innerHTML = '';
            if (dropTargetsArea) dropTargetsArea.innerHTML = '';

            currentDragMatchPairs = shuffleArray(question.pairs.slice());

            var drags = [];
            var drops = [];
            for (var i = 0; i < currentDragMatchPairs.length; i++) {
                drags.push(currentDragMatchPairs[i].drag);
                drops.push(currentDragMatchPairs[i].drop);
            }

            var shuffledDragItems = shuffleArray(drags);
            var shuffledDropItems = shuffleArray(drops);

            for (var j = 0; j < shuffledDragItems.length; j++) {
                var dragText = shuffledDragItems[j];
                var dragItem = document.createElement('div');
                dragItem.classList.add('drag-item', 'bg-blue-200', 'text-blue-800', 'px-4', 'py-2', 'rounded-lg', 'cursor-grab', 'hover:bg-blue-300', 'transition-colors', 'duration-200', 'shadow-md');
                dragItem.textContent = dragText;
                dragItem.setAttribute('draggable', true);
                dragItem.dataset.originalText = dragText;
                dragItem.addEventListener('dragstart', handleDragStart);
                if (dragElementsArea) dragElementsArea.appendChild(dragItem);
            }

            for (var k = 0; k < shuffledDropItems.length; k++) {
                var dropText = shuffledDropItems[k];
                var dropTarget = document.createElement('div');
                dropTarget.classList.add('drop-target', 'bg-gray-100', 'text-gray-700', 'border-2', 'border-dashed', 'border-gray-400', 'px-4', 'py-2', 'rounded-lg', 'flex', 'items-center', 'justify-center', 'min-h-[40px]', 'text-center', 'relative', 'overflow-hidden');
                dropTarget.dataset.correctMatch = dropText;

                var dropTextSpan = document.createElement('span');
                dropTextSpan.classList.add('drop-text-placeholder', 'absolute', 'inset-0', 'flex', 'items-center', 'justify-center', 'p-2');
                dropTextSpan.textContent = dropText;
                dropTarget.appendChild(dropTextSpan);

                dropTarget.addEventListener('dragover', handleDragOver);
                dropTarget.addEventListener('drop', handleDrop);
                dropTarget.addEventListener('drop', function() { responseChanges++; });
                dropTarget.addEventListener('dragleave', handleDragLeave);
                if (dropTargetsArea) dropTargetsArea.appendChild(dropTarget);
            }

            document.addEventListener('dragend', handleDragEnd);

            if (checkMatchButton) checkMatchButton.onclick = checkDragMatch;
            if (undoMatchButton) undoMatchButton.onclick = undoDragMatch;
        }
    }

    function checkDragMatch() {
        pauseTimer();

        var allCorrect = true;
        var dropTargets = document.querySelectorAll('.drop-target');

        if (quizHelpText) quizHelpText.classList.remove('hidden');

        for (var i = 0; i < dropTargets.length; i++) {
            (function(target) {
                var droppedItem = target.querySelector('.drag-item-dropped');
                var correctMatch = target.dataset.correctMatch;
                var targetPlaceholder = target.querySelector('.drop-text-placeholder');

                target.classList.remove('border-green-600', 'border-red-600');
                if (droppedItem) {
                    droppedItem.classList.remove('bg-indigo-300', 'text-indigo-900', 'bg-green-400', 'text-green-900', 'bg-red-400', 'text-red-900', 'border-2', 'border-green-600', 'border-red-600');
                }
                if (targetPlaceholder) {
                    targetPlaceholder.classList.remove('text-green-700', 'font-bold', 'text-red-700');
                }

                if (droppedItem) {
                    var matchedPair = null;
                    for (var j = 0; j < currentDragMatchPairs.length; j++) {
                        if (currentDragMatchPairs[j].drag === droppedItem.dataset.originalText && currentDragMatchPairs[j].drop === correctMatch) {
                            matchedPair = currentDragMatchPairs[j];
                            break;
                        }
                    }

                    if (matchedPair) {
                        droppedItem.classList.add('bg-green-400', 'text-green-900', 'border-2', 'border-green-600');
                        target.classList.add('border-green-600');
                        if (targetPlaceholder) targetPlaceholder.classList.add('hidden');
                    } else {
                        allCorrect = false;
                        droppedItem.classList.add('bg-red-400', 'text-red-900', 'border-2', 'border-red-600');
                        target.classList.add('border-red-600');
                        if (targetPlaceholder) {
                            targetPlaceholder.textContent = correctMatch + " (Correcto)";
                            targetPlaceholder.classList.remove('hidden');
                            targetPlaceholder.classList.add('text-green-700', 'font-bold');
                        }
                    }
                } else {
                    allCorrect = false;
                    target.classList.add('border-red-600');
                    if (targetPlaceholder) {
                        targetPlaceholder.textContent = correctMatch + " (Faltante)";
                        targetPlaceholder.classList.remove('hidden');
                        targetPlaceholder.classList.add('text-red-700', 'font-bold');
                    }
                }
            })(dropTargets[i]);
        }

        if (allCorrect) {
            handleCorrectAnswer();
        } else {
            handleIncorrectAnswer();
        }

        if (quizPlayArea) {
            quizPlayArea.classList.add(allCorrect ? 'animate-flash-green' : 'animate-flash-red');
            setTimeout(function() { quizPlayArea.classList.remove('animate-flash-green', 'animate-flash-red'); }, 500);
        }

        if (checkMatchButton) checkMatchButton.disabled = true;
        if (undoMatchButton) undoMatchButton.disabled = true;
        setTimeout(nextQuestion, 2000);
    }

    function undoDragMatch() {
        var dropTargets = document.querySelectorAll('.drop-target');
        for (var i = 0; i < dropTargets.length; i++) {
            var target = dropTargets[i];
            var droppedItem = target.querySelector('.drag-item-dropped');
            if (droppedItem) {
                droppedItem.remove();
            }

            var dropTextPlaceholder = target.querySelector('.drop-text-placeholder');
            if (dropTextPlaceholder) {
                dropTextPlaceholder.classList.remove('hidden', 'text-green-700', 'font-bold', 'text-red-700');
                dropTextPlaceholder.textContent = target.dataset.correctMatch;
            }
            target.classList.remove('border-green-600', 'border-red-600');
        }

        if (dragElementsArea) {
            var allDragItems = dragElementsArea.querySelectorAll('.drag-item, .drag-item-dropped');
            for (var j = 0; j < allDragItems.length; j++) {
                var item = allDragItems[j];
                item.classList.remove('hidden', 'opacity-0', 'drag-item-dropped', 'bg-indigo-300', 'text-indigo-900', 'bg-green-400', 'text-green-900', 'bg-red-400', 'text-red-900', 'border-2', 'border-green-600', 'border-red-600');
                item.classList.add('drag-item', 'bg-blue-200', 'text-blue-800');
                item.setAttribute('draggable', true);
            }
        }
    }

    function updateTimerDisplay() {
        var minutes = String(Math.floor(timeElapsed / 60)).substring(0, 2);
        if (minutes.length < 2) minutes = "0" + minutes;
        var seconds = String(timeElapsed % 60).substring(0, 2);
        if (seconds.length < 2) seconds = "0" + seconds;
        if (quizTimerDisplay) quizTimerDisplay.textContent = minutes + ":" + seconds;
    }

    function updateScoreDisplay() {
        if (quizScoreDisplay) quizScoreDisplay.textContent = currentScore;
    }

    function checkAnswer(selectedIndex, correctAnswer) {
        var responseTime = Date.now() - questionStartTime;
        pauseTimer();
        if (quizHelpText) quizHelpText.classList.remove('hidden');

        if (multipleChoiceOptions) {
            var buttons = multipleChoiceOptions.querySelectorAll('.answer-option-button');
            for (var i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                button.disabled = true;
                var optIdx = parseInt(button.dataset.option);
                if (optIdx === correctAnswer) {
                    button.classList.remove('bg-blue-500', 'hover:bg-blue-600');
                    button.classList.add('bg-green-500');
                } else if (optIdx === selectedIndex) {
                    button.classList.remove('bg-blue-500', 'hover:bg-blue-600');
                    button.classList.add('bg-red-500');
                }
            }
        }

        var question = currentQuestions[currentQuestionIndex];
        var finalCorrect = correctAnswer === undefined ? question.respuestaCorrecta : correctAnswer;

        if (app.GamesAdapter) {
            app.GamesAdapter.recordAction({
                asignatura: 'Diseño Web',
                nivel: selectedDifficulty,
                preguntaId: 'wm_' + currentQuestionIndex,
                tema: selectedTopic,
                respuestaSeleccionada: selectedIndex,
                respuestaCorrecta: finalCorrect,
                esCorrecta: selectedIndex === finalCorrect,
                tiempoRespuesta: responseTime,
                cambiosRespuesta: responseChanges
            });
        }

        if (selectedIndex === finalCorrect) {
            handleCorrectAnswer();
        } else {
            handleIncorrectAnswer();
        }

        if (quizPlayArea) {
            quizPlayArea.classList.add(selectedIndex === finalCorrect ? 'animate-flash-green' : 'animate-flash-red');
            setTimeout(function() { quizPlayArea.classList.remove('animate-flash-green', 'animate-flash-red'); }, 500);
        }

        setTimeout(nextQuestion, 1000);
    }

    function handleCorrectAnswer() {
        currentScore += 1;
        answeredCorrectly++;
        updateScoreDisplay();
    }

    function handleIncorrectAnswer() {
        answeredIncorrectly++;
        updateScoreDisplay();
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

        var minutes = String(Math.floor(timeElapsed / 60));
        if (minutes.length < 2) minutes = "0" + minutes;
        var seconds = String(timeElapsed % 60);
        if (seconds.length < 2) seconds = "0" + seconds;
        var finalTimeFormatted = minutes + ":" + seconds;

        if (quizFinalTime) quizFinalTime.textContent = finalTimeFormatted;

        if (app.GamesAdapter) {
            app.GamesAdapter.finishSession('Diseño Web', selectedDifficulty, currentScore);
        }

        var difficultyOrder = ['basico', 'intermedio', 'avanzado'];
        var currentDifficultyIndex = -1;
        for (var i = 0; i < difficultyOrder.length; i++) {
            if (difficultyOrder[i] === selectedDifficulty) {
                currentDifficultyIndex = i;
                break;
            }
        }
        var nextDifficulty = difficultyOrder[currentDifficultyIndex + 1];

        if (nextDifficulty && quizData[selectedTopic][nextDifficulty]) {
            if (quizNextLevelButton) {
                quizNextLevelButton.classList.remove('hidden');
                quizNextLevelButton.onclick = function() {
                    selectDifficulty(nextDifficulty);
                };
            }
        } else {
            if (quizNextLevelButton) quizNextLevelButton.classList.add('hidden');
        }

        showScreen('quiz-result-screen');
    }

    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    app.initQuizGame = function() {
        var user = JSON.parse(localStorage.getItem('currentUser'));
        var isGuest = !user;

        return app.GamesAdapter.init('webmaster').then(function(res) {
            var lb = res.lb;
            var record = res.record;

            var miniLb = document.getElementById('mini-leaderboard');
            if (miniLb && lb && lb.global) {
                var lbHtml = "";
                var topPlayers = lb.global.slice(0, 3);
                for (var i = 0; i < topPlayers.length; i++) {
                    var u = topPlayers[i];
                    lbHtml += '<div class="flex items-center justify-between text-[10px] font-bold">' +
                        '<span class="text-blue-700">' + (i + 1) + '. ' + u.nombre.split(' ')[0] + '</span>' +
                        '<span class="text-blue-500">' + u.promedio + '%</span>' +
                        '</div>';
                }
                miniLb.innerHTML = lbHtml;
            } else if (miniLb) {
                miniLb.innerHTML = '<p class="text-[10px] text-gray-400 text-center italic">Sin datos globales</p>';
            }

            var myRecord = record ? record["WebMaster Quiz"] : JSON.parse(localStorage.getItem('guest_record_webmaster') || 'null');
            if (myRecord) {
                var scoreSpan = document.getElementById('init-max-score');
                if (scoreSpan) scoreSpan.textContent = myRecord.maxScore || myRecord.score || 0;
            }

            if (isGuest) {
                var guestWarning = document.getElementById('guest-mode-warning');
                if (guestWarning) guestWarning.classList.remove('hidden');
                var guestBtn = document.getElementById('continue-guest-btn');
                if (guestBtn) {
                    guestBtn.classList.remove('hidden');
                    guestBtn.onclick = function() {
                        guestWarning.classList.add('hidden');
                        guestBtn.classList.add('hidden');
                    };
                }
            }

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

            if (startQuizButton) {
                startQuizButton.addEventListener('click', function() {
                    if (document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen()["catch"](function(e) { console.warn("FS failed", e); });
                    }
                    if (app.requestWakeLock) app.requestWakeLock();
                    startQuiz();
                });
            }

            for (var i = 0; i < topicButtons.length; i++) {
                (function(btn) {
                    btn.addEventListener('click', function() { selectTopic(btn.dataset.topic); });
                })(topicButtons[i]);
            }

            if (backToStartMenuButton) {
                backToStartMenuButton.addEventListener('click', function() { showScreen('quiz-start-menu'); });
            }

            for (var j = 0; j < difficultyButtons.length; j++) {
                (function(btn) {
                    btn.addEventListener('click', function() { selectDifficulty(btn.dataset.difficulty); });
                })(difficultyButtons[j]);
            }

            if (backToTopicMenuButton) {
                backToTopicMenuButton.addEventListener('click', function() { showScreen('quiz-topic-selection-menu'); });
            }

            if (endQuizButton) {
                endQuizButton.addEventListener('click', endQuiz);
            }

            if (quizRetryLevelButton) {
                quizRetryLevelButton.addEventListener('click', function() {
                    selectDifficulty(selectedDifficulty);
                });
            }

            if (quizChangeTopicButton) {
                quizChangeTopicButton.addEventListener('click', function() { showScreen('quiz-topic-selection-menu'); });
            }

            if (quizExitGameButton) {
                quizExitGameButton.addEventListener('click', function() {
                    if (app.returnToMainContent) {
                        app.returnToMainContent();
                    } else {
                        showScreen('quiz-start-menu');
                    }
                });
            }

            var inactivityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
            for (var k = 0; k < inactivityEvents.length; k++) {
                document.addEventListener(inactivityEvents[k], resetInactivityTimer);
            }

            var handleAbandonment = function() {
                if (quizPlayArea && !quizPlayArea.classList.contains('hidden')) {
                    location.reload();
                }
            };
            window.addEventListener('blur', handleAbandonment);
            document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'hidden') handleAbandonment();
            });

            if (app.GamesAdapter) app.GamesAdapter.showLoading(false);
            showScreen('quiz-start-menu');
        });
    };

})(window.QuizProApp);
