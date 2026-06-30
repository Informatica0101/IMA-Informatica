(function(window, document, app) {
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
                    options: ["<p>", "<br>", "<h1>", "<a>"],
                    correctAnswer: 1,
                    help: "Piensa en cómo forzar una nueva línea sin crear un nuevo párrafo.",
                    codeExample: "<p>Línea 1<br>Línea 2</p>"
                },
                {
                    question: "Atributo que especifica la URL de un enlace:",
                    type: "multiple-choice",
                    options: ["src", "alt", "href", "link"],
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
                    options: ["<pa>", "<p>", "<pr>", "<par>"],
                    correctAnswer: 1,
                    help: "Es una de las etiquetas más básicas para bloques de texto.",
                    codeExample: "<p>Este es un párrafo de ejemplo.</p>"
                },
                {
                    question: "Atributo que indica la fuente de una imagen:",
                    type: "multiple-choice",
                    options: ["link", "url", "src", "href"],
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
                    options: ["<link>", "<a>", "<href>", "<url>"],
                    correctAnswer: 1,
                    help: "Esta etiqueta es la abreviatura de 'anchor'.",
                    codeExample: "<a href=\"otra_pagina.html\">Ir a otra página</a>"
                }
            ],
            intermedio: [
                {
                    question: "Etiqueta semántica para el contenido principal de la página:",
                    type: "multiple-choice",
                    options: ["<section>", "<article>", "<main>", "<div>"],
                    correctAnswer: 2,
                    help: "Solo debe haber uno por página y engloba el contenido único.",
                    codeExample: "<main>...</main>"
                },
                {
                    question: "Atributo para agrupar celdas horizontalmente en una tabla:",
                    type: "multiple-choice",
                    options: ["rowspan", "colspan", "headers", "scope"],
                    correctAnswer: 1,
                    help: "Permite que una celda ocupe más de una columna.",
                    codeExample: '<td colspan="2">Celda extendida</td>'
                },
                {
                    question: "Ordena los elementos de un formulario de contacto básico:",
                    type: "order-execution",
                    fragments: ["<form>", "<label>", "Nombre:", "</label>", "<input type=\"text\">", "<button>", "Enviar", "</button>", "</form>"],
                    correctOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                    help: "Los labels deben preceder a sus inputs para mejor accesibilidad.",
                    codeExample: "<form>...</form>"
                },
                {
                    question: "Etiqueta utilizada para definir una celda de encabezado en una tabla:",
                    type: "multiple-choice",
                    options: ["<td>", "<tr>", "<th>", "<thead>"],
                    correctAnswer: 2,
                    help: "Por defecto, el texto dentro de esta etiqueta aparece en negrita y centrado.",
                    codeExample: "<th>Nombre</th>"
                },
                {
                    question: "Atributo de <input> para que el campo sea obligatorio:",
                    type: "multiple-choice",
                    options: ["mandatory", "required", "validate", "important"],
                    correctAnswer: 1,
                    help: "Es un atributo booleano de validación nativa.",
                    codeExample: '<input type="email" required>'
                },
                {
                    question: "Empareja el elemento semántico con su descripción:",
                    type: "drag-match",
                    pairs: [
                        { drag: "Navegación", drop: "<nav>" },
                        { drag: "Pie de página", drop: "<footer>" },
                        { drag: "Contenido tangencial", drop: "<aside>" },
                        { drag: "Encabezado de sección", drop: "<header>" }
                    ],
                    help: "El uso de etiquetas semánticas mejora el SEO y la accesibilidad.",
                    codeExample: null
                }
            ],
            avanzado: [
                {
                    question: "Atributo ARIA para describir un elemento que actúa como etiqueta de otro:",
                    type: "multiple-choice",
                    options: ["aria-label", "aria-labelledby", "aria-describedby", "role"],
                    correctAnswer: 1,
                    help: "Se utiliza cuando el texto de la etiqueta ya existe en el DOM.",
                    codeExample: '<div aria-labelledby="title-id">...</div>'
                },
                {
                    question: "Construye una estructura de tabla compleja con encabezado, cuerpo y pie:",
                    type: "order-execution",
                    fragments: ["<table>", "<thead>", "<tr><th>ID</th></tr>", "</thead>", "<tbody>", "<tr><td>1</td></tr>", "</tbody>", "<tfoot>", "<tr><td>Total</td></tr>", "</tfoot>", "</table>"],
                    correctOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    help: "El orden tfoot antes de tbody era común en HTML4, pero en HTML5 puede ir después.",
                    codeExample: "<table>...</table>"
                },
                {
                    question: "¿Cuál es el propósito del elemento <figure>?",
                    type: "multiple-choice",
                    options: ["Insertar formas geométricas", "Agrupar contenido ilustrativo con una leyenda opcional", "Crear diagramas de flujo", "Renderizar modelos 3D"],
                    correctAnswer: 1,
                    help: "Suele contener una imagen y un figcaption.",
                    codeExample: "<figure><img src='...'><figcaption>Leyenda</figcaption></figure>"
                },
                {
                    question: "Atributo para asociar un <label> con un <input> de forma explícita:",
                    type: "multiple-choice",
                    options: ["id", "name", "for", "connect"],
                    correctAnswer: 2,
                    help: "El valor de este atributo debe coincidir con el 'id' del input.",
                    codeExample: '<label for="user-id">Usuario</label><input id="user-id">'
                },
                {
                    question: "Estructura correcta para un grupo de opciones en un <select>:",
                    type: "order-execution",
                    fragments: ["<select>", "<optgroup label=\"Frutas\">", "<option>", "Manzana", "</option>", "</optgroup>", "</select>"],
                    correctOrder: [0, 1, 2, 3, 4, 5, 6],
                    help: "Los optgroups permiten categorizar las opciones de una lista desplegable.",
                    codeExample: "<select>...</select>"
                }
            ]
        },
        css: {
            basico: [
                {
                    question: "¿Qué propiedad se usa para cambiar el color de fondo de un elemento?",
                    type: "multiple-choice",
                    options: ["color", "background-color", "font-color", "fill"],
                    correctAnswer: 1,
                    help: "Esta propiedad define el color detrás del contenido de un elemento.",
                    codeExample: "body { background-color: lightblue; }"
                }
            ]
        },
        javascript: {
            basico: [
                {
                    question: "Palabra clave para declarar una variable que no puede ser reasignada:",
                    type: "multiple-choice",
                    options: ["var", "let", "const", "static"],
                    correctAnswer: 2,
                    help: "Esta palabra clave se utiliza para valores que permanecen fijos.",
                    codeExample: "const PI = 3.14;"
                }
            ]
        }
    };

    var currentQuestionIndex = 0;
    var currentScore = 0;
    var totalXP = 0;
    var quizTimer;
    var timeElapsed = 0;
    var isPaused = false;
    var selectedTopic = '';
    var selectedDifficulty = '';
    var currentQuestions = [];
    var answeredCorrectly = 0;
    var answeredIncorrectly = 0;

    var inactivityTimer;
    var inactivityCountdownInterval;

    var quizStartMenu, startQuizButton, quizTopicSelectionMenu, topicButtons,
        quizDifficultySelectionMenu, selectedTopicDisplay, difficultyButtons,
        quizPlayArea, quizTimerDisplay, quizScoreDisplay, quizQuestion, quizHelpText, multipleChoiceOptions,
        syntaxOrderContainer, syntaxTargetArea, syntaxOptionsArea, checkSyntaxButton, undoSyntaxButton,
        dragMatchContainer, dragElementsArea, dropTargetsArea, checkMatchButton, undoMatchButton,
        endQuizButton, quizResultScreen, quizCorrectAnswers, quizIncorrectAnswers, quizFinalScore,
        quizRetryLevelButton, quizNextLevelButton, quizChangeTopicButton, quizExitGameButton;

    var currentSyntaxOrder = [];
    var draggedItemOriginalElement = null;

    function pauseTimer() { isPaused = true; }
    function resumeTimer() { isPaused = false; }

    function escapeHTML(text) {
        if (!text) return "";
        return text.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatCodeInText(text) {
        if (!text) return "";
        return '<code class="code-fragment">' + escapeHTML(text) + '</code>';
    }

    function smartFormat(text) {
        if (!text) return "";
        var isCode = /<[a-z/][^>]*>|{.*}|[a-z-]+\s*:/i.test(text) || text.indexOf('<') !== -1 || text.indexOf('>') !== -1;
        if (isCode) return formatCodeInText(text);
        return window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(text) : text;
    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        clearInterval(inactivityCountdownInterval);
        hideInactivityWarning();
        inactivityTimer = setTimeout(showInactivityWarning, 60 * 1000);
    }

    function showInactivityWarning() {
        var count = 10;
        var modal = document.getElementById('inactivity-warning-modal');
        var display = document.getElementById('inactivity-countdown-display');
        if (modal) modal.classList.remove('hidden');
        if (display) display.textContent = count;

        inactivityCountdownInterval = setInterval(function() {
            count--;
            if (display) display.textContent = count;
            if (count <= 0) {
                clearInterval(inactivityCountdownInterval);
                resetGameDueToInactivity();
            }
        }, 1000);
    }

    function hideInactivityWarning() {
        var modal = document.getElementById('inactivity-warning-modal');
        if (modal) modal.classList.add('hidden');
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
        setTimeout(function() { hideInactivityWarning(); }, 3000);
    }

    function showScreen(screenId) {
        var screens = [quizStartMenu, quizTopicSelectionMenu, quizDifficultySelectionMenu, quizPlayArea, quizResultScreen];
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

    function startQuiz() { showScreen('quiz-topic-selection-menu'); }

    function selectTopic(topic) {
        selectedTopic = topic;
        if (selectedTopicDisplay) selectedTopicDisplay.textContent = topic.toUpperCase();
        showScreen('quiz-difficulty-selection-menu');
    }

    function selectDifficulty(difficulty) {
        selectedDifficulty = difficulty;
        var allQs = quizData[selectedTopic][selectedDifficulty];
        var normalized = [];
        for (var i = 0; i < allQs.length; i++) {
            normalized.push(window.normalizeQuestion ? window.normalizeQuestion(allQs[i]) : allQs[i]);
        }
        shuffleArray(normalized);
        currentQuestions = normalized.slice(0, 10);

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
        if (quizQuestion) quizQuestion.innerHTML = smartFormat(question.question);
        if (quizHelpText) {
            quizHelpText.innerHTML = smartFormat(question.help || '');
            quizHelpText.classList.remove('hidden');
        }

        switch (question.type) {
            case "multiple-choice": setupMultipleChoiceQuestion(question); break;
            case "order-execution": setupSyntaxOrderQuestion(question); break;
            case "drag-match": setupDragMatchQuestion(question); break;
        }

        if (!quizTimer) {
            quizTimer = setInterval(function() {
                if (!isPaused) timeElapsed++;
                updateTimerDisplay();
            }, 1000);
        }
        resetInactivityTimer();
    }

    function resetQuestionArea() {
        var card = document.getElementById('quiz-card');
        if (card) {
            card.classList.remove('bg-green-50', 'bg-red-50', 'border-green-500', 'border-red-500');
            card.classList.add('bg-white', 'border-gray-100');
        }

        if (multipleChoiceOptions) { multipleChoiceOptions.innerHTML = ''; multipleChoiceOptions.classList.add('hidden'); multipleChoiceOptions.classList.remove('grid'); }
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
    }

    function setupMultipleChoiceQuestion(question) {
        if (multipleChoiceOptions) {
            multipleChoiceOptions.classList.remove('hidden');
            multipleChoiceOptions.classList.add('grid');
            question.options.forEach(function(option, index) {
                var button = document.createElement('button');
                button.className = 'answer-option-button px-6 py-3 rounded-xl font-semibold text-lg bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-md';
                button.dataset.option = index;
                button.innerHTML = smartFormat(option);
                button.onclick = function() { checkAnswer(index, question.correctAnswer); };
                multipleChoiceOptions.appendChild(button);
            });
        }
    }

    function setupSyntaxOrderQuestion(question) {
        if (syntaxOrderContainer) {
            syntaxOrderContainer.classList.remove('hidden');
            var fragments = shuffleArray(question.fragments.slice());
            currentSyntaxOrder = [];
            renderSyntaxOptions(fragments);
            renderSyntaxTarget();
        }
    }

    function renderSyntaxOptions(fragments) {
        if (syntaxOptionsArea) {
            syntaxOptionsArea.innerHTML = '';
            fragments.forEach(function(fragment, index) {
                var span = document.createElement('span');
                span.className = 'syntax-fragment bg-gray-200 text-gray-800 px-3 py-1 rounded cursor-pointer select-none';
                span.innerHTML = formatCodeInText(fragment);
                span.dataset.index = index;

                var action = function() { addSyntaxFragment(fragment, index); };
                span.onclick = action;
                span.addEventListener('touchstart', function(e) { e.preventDefault(); action(); }, { passive: false });

                syntaxOptionsArea.appendChild(span);
            });
        }
    }

    function renderSyntaxTarget() {
        if (syntaxTargetArea) {
            syntaxTargetArea.innerHTML = '';
            currentSyntaxOrder.forEach(function(item) {
                var span = document.createElement('span');
                span.className = 'syntax-fragment-target bg-purple-200 text-purple-800 px-3 py-1 rounded relative cursor-pointer select-none';
                span.innerHTML = formatCodeInText(item.fragment);
                var x = document.createElement('span');
                x.className = 'absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs';
                x.textContent = 'x';
                x.onclick = function(e) { e.stopPropagation(); removeSyntaxFragment(item.originalIndex); };
                span.appendChild(x);
                syntaxTargetArea.appendChild(span);
            });
        }
    }

    function addSyntaxFragment(f, idx) {
        currentSyntaxOrder.push({ fragment: f, originalIndex: idx });
        renderSyntaxTarget();
    }

    function removeSyntaxFragment(idx) {
        currentSyntaxOrder = currentSyntaxOrder.filter(function(i) { return i.originalIndex !== idx; });
        renderSyntaxTarget();
    }

    function validateStructure(userItems, expectedFragments) {
        if (userItems.length !== expectedFragments.length) return false;
        var userStrings = userItems.map(function(i) { return i.fragment; });

        var getTagIndex = function(arr, tagPart) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].indexOf('<' + tagPart) !== -1) return i;
            }
            return -1;
        };

        // Reglas de jerarquía básicas (v7.7.2)
        var tableIdx = getTagIndex(userStrings, 'table');
        var tableCloseIdx = getTagIndex(userStrings, '/table');
        if (tableIdx !== -1) {
            if (tableCloseIdx === -1 || tableIdx > tableCloseIdx) return false;
            var trIdx = getTagIndex(userStrings, 'tr');
            if (trIdx !== -1 && (trIdx < tableIdx || trIdx > tableCloseIdx)) return false;
        }

        var sortedUser = userStrings.slice().sort();
        var sortedExpected = expectedFragments.slice().sort();
        for (var m = 0; m < sortedUser.length; m++) {
            if (sortedUser[m] !== sortedExpected[m]) return false;
        }
        return true;
    }

    function checkSyntaxOrder() {
        pauseTimer();
        var q = currentQuestions[currentQuestionIndex];
        var expectedOrderStrings = q.correctOrder.map(function(idx) { return q.fragments[idx]; });
        var isCorrect = validateStructure(currentSyntaxOrder, expectedOrderStrings);
        if (isCorrect) handleCorrectAnswer(); else handleIncorrectAnswer();
        setTimeout(nextQuestion, 1500);
    }

    function undoSyntaxOrder() { currentSyntaxOrder.pop(); renderSyntaxTarget(); }

    function setupDragMatchQuestion(question) {
        if (dragMatchContainer) {
            dragMatchContainer.classList.remove('hidden');
            var drags = shuffleArray(question.pairs.map(function(p){return p.drag}));
            drags.forEach(function(d) {
                var item = document.createElement('div');
                item.className = 'drag-item bg-blue-100 border border-blue-300 p-2 rounded cursor-grab active:cursor-grabbing touch-none select-none';
                item.innerHTML = smartFormat(d);
                item.setAttribute('draggable', true);
                item.dataset.originalText = d;
                item.addEventListener('dragstart', handleDragStart);
                item.addEventListener('touchstart', handleTouchStart, { passive: false });
                item.addEventListener('touchmove', handleTouchMove, { passive: false });
                item.addEventListener('touchend', handleTouchEnd, { passive: false });
                dragElementsArea.appendChild(item);
            });
            var drops = shuffleArray(question.pairs.map(function(p){return p.drop}));
            drops.forEach(function(d) {
                var target = document.createElement('div');
                target.className = 'drop-target border-2 border-dashed border-gray-300 p-2 min-h-[40px] w-full rounded-lg text-center transition-colors select-none';
                target.dataset.correctMatch = d;
                target.innerHTML = smartFormat(d);
                target.addEventListener('dragover', function(e){
                    e.preventDefault();
                    target.classList.add('bg-blue-50', 'border-blue-400');
                });
                target.addEventListener('dragleave', function(){
                    target.classList.remove('bg-blue-50', 'border-blue-400');
                });
                target.addEventListener('drop', handleDrop);
                dropTargetsArea.appendChild(target);
            });
        }
    }

    var touchElement = null, lastTouchTarget = null;
    function handleTouchStart(e) {
        touchElement = e.target.closest('.drag-item');
        if (touchElement) touchElement.classList.add('opacity-50', 'scale-95');
    }
    function handleTouchMove(e) {
        if (!touchElement) return;
        e.preventDefault();
        var touch = e.touches[0];
        var target = document.elementFromPoint(touch.clientX, touch.clientY);
        var dropTarget = target ? target.closest('.drop-target') : null;
        if (dropTarget !== lastTouchTarget) {
            if (lastTouchTarget) lastTouchTarget.classList.remove('bg-blue-50', 'border-blue-400');
            if (dropTarget) dropTarget.classList.add('bg-blue-50', 'border-blue-400');
            lastTouchTarget = dropTarget;
        }
    }
    function handleTouchEnd(e) {
        if (!touchElement) return;
        touchElement.classList.remove('opacity-50', 'scale-95');
        if (lastTouchTarget) lastTouchTarget.classList.remove('bg-blue-50', 'border-blue-400');
        var touch = e.changedTouches[0];
        var target = document.elementFromPoint(touch.clientX, touch.clientY);
        var dropTarget = target ? target.closest('.drop-target') : null;
        if (dropTarget && !dropTarget.dataset.userValue) {
            dropTarget.innerHTML = smartFormat(touchElement.dataset.originalText);
            dropTarget.dataset.userValue = touchElement.dataset.originalText;
            touchElement.classList.add('hidden');
        }
        touchElement = null; lastTouchTarget = null;
    }
    function handleDragStart(e) { draggedItemOriginalElement = e.target; e.dataTransfer.setData('text', e.target.dataset.originalText); }
    function handleDrop(e) {
        e.preventDefault();
        var target = e.target.closest('.drop-target');
        if(target && draggedItemOriginalElement && !target.dataset.userValue) {
            target.innerHTML = smartFormat(draggedItemOriginalElement.dataset.originalText);
            target.dataset.userValue = draggedItemOriginalElement.dataset.originalText;
            draggedItemOriginalElement.classList.add('hidden');
            target.classList.remove('bg-blue-50', 'border-blue-400');
        }
    }

    function checkDragMatch() {
        pauseTimer();
        var q = currentQuestions[currentQuestionIndex];
        var dropTargets = dropTargetsArea.querySelectorAll('.drop-target');
        var isCorrect = true, allFilled = true;
        dropTargets.forEach(function(target) {
            var userValue = target.dataset.userValue;
            if (!userValue) allFilled = false;
            var correctDrop = target.dataset.correctMatch;
            var pair = q.pairs.find(function(p) { return p.drop === correctDrop; });
            if (!pair || pair.drag !== userValue) isCorrect = false;
        });
        if (!allFilled) { resumeTimer(); alert("Por favor completa todos los espacios."); return; }
        if (isCorrect) handleCorrectAnswer(); else handleIncorrectAnswer();
        setTimeout(nextQuestion, 1500);
    }

    function undoDragMatch() {
        var dropTargets = dropTargetsArea.querySelectorAll('.drop-target');
        var dragItems = dragElementsArea.querySelectorAll('.drag-item.hidden');
        if (dragItems.length > 0) {
            var lastHidden = dragItems[dragItems.length - 1];
            var lastText = lastHidden.dataset.originalText;
            for (var i = 0; i < dropTargets.length; i++) {
                if (dropTargets[i].dataset.userValue === lastText) {
                    dropTargets[i].innerHTML = smartFormat(dropTargets[i].dataset.correctMatch);
                    delete dropTargets[i].dataset.userValue;
                    lastHidden.classList.remove('hidden');
                    break;
                }
            }
        }
    }

    function nextQuestion() { currentQuestionIndex++; startQuestion(); }
    function updateScoreDisplay() { if (quizScoreDisplay) quizScoreDisplay.textContent = currentScore; }
    function updateTimerDisplay() { if (quizTimerDisplay) { var m = Math.floor(timeElapsed/60), s = timeElapsed%60; quizTimerDisplay.textContent = (m<10?'0':'')+m+':'+(s<10?'0':'')+s; } }

    function handleCorrectAnswer() { currentScore++; answeredCorrectly++; updateScoreDisplay(); showFeedback(true); }
    function handleIncorrectAnswer() { answeredIncorrectly++; showFeedback(false); }
    function showFeedback(isCorrect) {
        var card = document.getElementById('quiz-card');
        if (card) {
            card.classList.remove('bg-white', 'border-gray-100');
            card.classList.add(isCorrect ? 'bg-green-50' : 'bg-red-50', isCorrect ? 'border-green-500' : 'border-red-500');
        }
    }

    function endQuiz() {
        clearInterval(quizTimer); quizTimer = null;
        if (quizCorrectAnswers) quizCorrectAnswers.textContent = answeredCorrectly;
        if (quizIncorrectAnswers) quizIncorrectAnswers.textContent = answeredIncorrectly;
        if (quizFinalScore) quizFinalScore.textContent = currentScore;
        var finalTimeDisplay = document.getElementById('quiz-final-time');
        if (finalTimeDisplay) finalTimeDisplay.textContent = quizTimerDisplay ? quizTimerDisplay.textContent : '00:00';
        if (app) app.finishSession('Diseño Web', selectedDifficulty, currentScore, totalXP);
        showScreen('quiz-result-screen');
    }

    function shuffleArray(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
        }
        return arr;
    }

    function checkAnswer(idx, correct) {
        pauseTimer();
        var isCorrect = (idx === correct);
        var buttons = multipleChoiceOptions.querySelectorAll('button');
        buttons.forEach(function(btn, i) {
            btn.onclick = null;
            if (i === correct) btn.classList.add('bg-green-600', 'ring-4', 'ring-green-200');
            else if (i === idx) btn.classList.add('bg-red-600', 'ring-4', 'ring-red-200');
        });
        if (isCorrect) handleCorrectAnswer(); else handleIncorrectAnswer();
        setTimeout(nextQuestion, 1500);
    }

    function renderLeaderboard(lb) {
        var miniLb = document.getElementById('mini-leaderboard');
        if (miniLb && lb && lb.global) {
            miniLb.innerHTML = lb.global.slice(0, 5).map(function(u, i) {
                return '<div class="flex items-center justify-between text-[10px] font-bold py-1 border-b border-teal-50 last:border-0">' +
                        '<span class="text-teal-700">' + (i+1) + '. ' + (u.nombre ? u.nombre.split(' ')[0] : 'Alumno') + '</span>' +
                        '<div class="flex flex-col items-end">' +
                            '<span class="text-teal-500">' + u.promedio + '%</span>' +
                            '<span class="text-[8px] text-gray-400 font-black">' + (u.xp || 0).toLocaleString() + ' XP</span>' +
                        '</div>' +
                    '</div>';
            }).join('');
        }
    }

    function renderPersonalRecord(record) {
        if (!record) return;
        var scoreSpan = document.getElementById('init-max-score');
        var maxPts = 0, statsData = record.data || record;
        Object.keys(statsData).forEach(function(key) {
            var entry = statsData[key];
            if (key.indexOf('webmaster') !== -1 || key.indexOf('WebMaster Quiz') !== -1 || (entry && entry.juego === 'webmaster')) {
                var pts = parseFloat(entry.maxScore || entry.score || entry.puntaje || 0);
                if (pts > maxPts) maxPts = pts;
            }
        });
        if (scoreSpan) scoreSpan.textContent = Math.round(maxPts);
        if (window.renderUnifiedAnalyticsCard) window.renderUnifiedAnalyticsCard('webmaster-analytics-container', 'webmaster', record);
    }

    function initQuizGame() {
        if (app) {
            app.init('webmaster', false).then(function() {
                app.getLeaderboard('webmaster', function(lb) { renderLeaderboard(lb); });
                app.getPersonalRecord(function(record) { renderPersonalRecord(record); });
            });
        }
        quizStartMenu = document.getElementById('quiz-start-menu');
        startQuizButton = document.getElementById('start-quiz-button');
        quizTopicSelectionMenu = document.getElementById('quiz-topic-selection-menu');
        topicButtons = document.querySelectorAll('.topic-button');
        quizDifficultySelectionMenu = document.getElementById('quiz-difficulty-selection-menu');
        selectedTopicDisplay = document.getElementById('selected-topic-display');
        difficultyButtons = document.querySelectorAll('.difficulty-button');
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
        quizRetryLevelButton = document.getElementById('quiz-retry-level-button');
        quizNextLevelButton = document.getElementById('quiz-next-level-button');
        quizChangeTopicButton = document.getElementById('quiz-change-topic-button');
        quizExitGameButton = document.getElementById('quiz-exit-game-button');

        if (startQuizButton) startQuizButton.onclick = startQuiz;
        topicButtons.forEach(function(b) { b.onclick = function() { selectTopic(b.dataset.topic); }; });
        difficultyButtons.forEach(function(b) { b.onclick = function() { selectDifficulty(b.dataset.difficulty); }; });
        if (quizExitGameButton) quizExitGameButton.onclick = function() { if (window.returnToMainContent) window.returnToMainContent(); };

        if (checkSyntaxButton) checkSyntaxButton.onclick = checkSyntaxOrder;
        if (undoSyntaxButton) undoSyntaxButton.onclick = undoSyntaxOrder;
        if (checkMatchButton) checkMatchButton.onclick = checkDragMatch;
        if (undoMatchButton) undoMatchButton.onclick = undoDragMatch;
        if (endQuizButton) endQuizButton.onclick = endQuiz;

        if (quizRetryLevelButton) quizRetryLevelButton.onclick = function() { selectDifficulty(selectedDifficulty); };
        if (quizChangeTopicButton) quizChangeTopicButton.onclick = function() { showScreen('quiz-topic-selection-menu'); };
        if (quizNextLevelButton) quizNextLevelButton.onclick = function() {
            var levels = ['basico', 'intermedio', 'avanzado'];
            var nextIdx = levels.indexOf(selectedDifficulty) + 1;
            if (nextIdx < levels.length) selectDifficulty(levels[nextIdx]);
            else alert("¡Has completado todas las dificultades de este tema!");
        };

        ['mousemove', 'keydown', 'click'].forEach(function(e) { document.addEventListener(e, resetInactivityTimer); });
        showScreen('quiz-start-menu');
    }

    window.initQuizGame = initQuizGame;
    window.startQuiz = startQuiz;
    window.selectTopic = selectTopic;
    window.selectDifficulty = selectDifficulty;
    window.showScreen = showScreen;
    window.undoSyntaxOrder = undoSyntaxOrder;
    window.checkSyntaxOrder = checkSyntaxOrder;

})(window, document, window.GamesAdapter);
