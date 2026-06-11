(function(app) {
    "use strict";

    // --- Datos del Juego ---
    var gameWords = {
        basico: [
            { word: "casa", type: "word" }, { word: "perro", type: "word" }, { word: "mesa", type: "word" },
            { word: "sol", type: "word" }, { word: "luz", type: "word" }, { word: "flor", type: "word" },
            { word: "azul", type: "word" }, { word: "verde", type: "word" }, { word: "rojo", type: "word" },
            { word: "agua", type: "word" }, { word: "libro", type: "word" }, { word: "gato", type: "word" },
            { word: "pan", type: "word" }, { word: "tren", type: "word" }, { word: "cielo", type: "word" },
            { word: "nube", type: "word" }, { word: "paz", type: "word" }, { word: "amor", type: "word" },
            { word: "vida", type: "word" }, { word: "mano", type: "word" }
        ],
        intermedio: [
            { word: "computadora", type: "word" }, { word: "teclado", type: "word" }, { word: "ratón", type: "word" },
            { word: "pantalla", type: "word" }, { word: "impresora", type: "word" }, { word: "software", type: "word" },
            { word: "hardware", type: "word" }, { word: "internet", type: "word" }, { word: "navegador", type: "word" },
            { word: "documento", type: "word" }, { word: "teléfono", type: "word" }, { word: "máquina", type: "word" },
            { word: "aplicación", type: "word" }, { word: "desarrollo", type: "word" }, { word: "seguridad", type: "word" },
            { word: "informática", type: "word" }, { word: "conexión", type: "word" }, { word: "programa", type: "word" },
            { word: "escritorio", type: "word" }, { word: "sistema", type: "word" }
        ],
        avanzado: [
            { word: "programación", type: "word" }, { word: "algoritmo", type: "word" }, { word: "inteligencia", type: "word" },
            { word: "automatización", type: "word" }, { word: "ciberseguridad", type: "word" }, { word: "infraestructura", type: "word" },
            { word: "comunicación", type: "word" }, { word: "administración", type: "word" }, { word: "configuración", type: "word" },
            { word: "virtualización", type: "word" }, { word: "optimización", type: "word" }, { word: "interoperabilidad", type: "word" },
            { word: "mantenimiento", type: "word" }, { word: "rendimiento", type: "word" }, { word: "almacenamiento", type: "word" },
            { word: "distribución", type: "word" }, { word: "personalización", type: "word" }, { word: "autenticación", type: "word" },
            { word: "encriptación", type: "word" }, { word: "interfaz", type: "word" }
        ],
        especial: [
            { word: "ñ", type: "special", hint: "Letra 'ñ'" },
            { word: "ü", type: "special", hint: "Letra 'ü'" },
            { word: "á", type: "special", hint: "Alt+160 / ' + a" },
            { word: "é", type: "special", hint: "Alt+130 / ' + e" },
            { word: "í", type: "special", hint: "Alt+161 / ' + i" },
            { word: "ó", type: "special", hint: "Alt+162 / ' + o" },
            { word: "ú", type: "special", hint: "Alt+163 / ' + u" },
            { word: "¿", type: "special", hint: "Alt+168 / Shift+?" },
            { word: "¡", type: "special", hint: "Alt+173 / Shift+!" },
            { word: "€", type: "special", hint: "Alt+0128 / AltGr+E" },
            { word: "Ctrl+C", type: "shortcut", hint: "Copiar" },
            { word: "Ctrl+V", type: "shortcut", hint: "Pegar" },
            { word: "Ctrl+X", type: "shortcut", hint: "Cortar" },
            { word: "Ctrl+Z", type: "shortcut", hint: "Deshacer" },
            { word: "Ctrl+S", type: "shortcut", hint: "Guardar" },
            { word: "Alt+Tab", type: "shortcut", hint: "Cambiar Ventana" },
            { word: "Win+D", type: "shortcut", hint: "Mostrar Escritorio" },
            { word: "Shift+Supr", type: "shortcut", hint: "Eliminar Permanentemente" }
        ]
    };

    // --- Variables de Estado del Juego ---
    var currentWord = {};
    var currentDifficultyLevel = 0;
    var availableWords = [];
    var wordIndex = 0;
    var correctWordsCount = 0;
    var wordsCorrectInCurrentDifficulty = 0;
    var consecutiveErrors = 0;
    var totalErrors = 0;
    var correctKeys = 0;
    var totalKeys = 0;
    var gameStartTime;
    var gameTimerInterval;
    var timeRemainingSeconds;
    var MAX_CONSECUTIVE_ERRORS = 3;
    var UPDATE_INTERVAL_MS = 50;
    var gameActive = false;
    var questionStartTime = 0;
    var responseChanges = 0;

    var timeSettings = {
        3: { initial: 10, min: 3 },
        4: { initial: 10, min: 4 },
        5: { initial: 10, min: 5 },
        default: { initial: 5, min: 5 }
    };
    var REDUCTION_WORDS_THRESHOLD = 20;

    // --- Referencias a Elementos del DOM ---
    var gameStartMenu;
    var startGameButton;
    var gamePlayArea;
    var correctWordsDisplay;
    var totalErrorsDisplay;
    var timeBar;
    var currentWordDisplay;
    var specialCharHint;
    var wordInput;
    var exitGameButton;
    var gameResultScreen;
    var finalCorrectWords;
    var finalErrors;
    var finalWPM;
    var retryGameButton;
    var exitResultsButton;

    // --- Funciones de Utilidad ---

    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    function showScreen(screenId) {
        var screens = [
            gameStartMenu,
            gamePlayArea,
            gameResultScreen
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
    }

    function normalizeString(str) {
        return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function normalizeShortcut(shortcutStr) {
        return shortcutStr.toUpperCase().replace(/\s/g, '');
    }

    function updateTimeBar() {
        var percentage = (timeRemainingSeconds / currentWord.timeLimit) * 100;
        if (timeBar) {
            timeBar.style.width = Math.max(0, percentage) + "%";
            timeBar.classList.remove('warning', 'danger');
            if (percentage < 30) {
                timeBar.classList.add('danger');
            } else if (percentage < 60) {
                timeBar.classList.add('warning');
            }
        }
    }

    function calculateWPM() {
        if (!gameStartTime) return 0;
        var elapsedTimeInMinutes = (Date.now() - gameStartTime) / 60000;
        if (elapsedTimeInMinutes <= 0) return 0;
        return Math.round(correctWordsCount / elapsedTimeInMinutes);
    }

    // --- Lógica del Juego ---

    app.initDexterityGame = function() {
        return app.GamesAdapter.init('destreza').then(function() {
            console.log('initDexterityGame called');

            gameStartMenu = document.getElementById('game-start-menu');
            startGameButton = document.getElementById('start-game-button');
            gamePlayArea = document.getElementById('game-play-area');
            correctWordsDisplay = document.getElementById('correct-words-display');
            totalErrorsDisplay = document.getElementById('total-errors-display');
            timeBar = document.getElementById('time-bar');
            currentWordDisplay = document.getElementById('current-word-display');
            specialCharHint = document.getElementById('special-char-hint');
            wordInput = document.getElementById('word-input');
            exitGameButton = document.getElementById('exit-game-button');
            gameResultScreen = document.getElementById('game-result-screen');
            finalCorrectWords = document.getElementById('final-correct-words');
            finalErrors = document.getElementById('final-errors');
            finalWPM = document.getElementById('final-wpm');
            retryGameButton = document.getElementById('retry-game-button');
            exitResultsButton = document.getElementById('exit-results-button');

            if (startGameButton) startGameButton.addEventListener('click', startGame);
            if (wordInput) wordInput.addEventListener('input', handleInput);
            if (wordInput) wordInput.addEventListener('keydown', handleKeyDown);
            if (exitGameButton) exitGameButton.addEventListener('click', exitGame);
            if (retryGameButton) retryGameButton.addEventListener('click', startGame);
            if (exitResultsButton) exitResultsButton.addEventListener('click', exitGame);

            if (app.GamesAdapter) app.GamesAdapter.showLoading(false);

            var handleAbandonment = function() {
                if (gamePlayArea && !gamePlayArea.classList.contains('hidden')) {
                    // alert removido segun directriz Fase 3
                    location.reload();
                }
            };
            window.addEventListener('blur', handleAbandonment);
            document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'hidden') handleAbandonment();
            });

            showScreen('game-start-menu');
        });
    };

    function startGame() {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen()["catch"](function(e) { console.warn("FS failed", e); });
        }
        if (app.requestWakeLock) app.requestWakeLock();

        resetGame();
        gameActive = true;
        showScreen('game-play-area');
        gameStartTime = Date.now();
        loadNewWord();
        if (wordInput) wordInput.focus();
    }

    function resetGame() {
        clearInterval(gameTimerInterval);
        currentDifficultyLevel = 0;
        correctWordsCount = 0;
        wordsCorrectInCurrentDifficulty = 0;
        consecutiveErrors = 0;
        totalErrors = 0;
        correctKeys = 0;
        totalKeys = 0;
        wordIndex = 0;

        if (correctWordsDisplay) correctWordsDisplay.textContent = correctWordsCount;
        if (totalErrorsDisplay) totalErrorsDisplay.textContent = totalErrors;
        if (wordInput) {
            wordInput.value = '';
            wordInput.disabled = false;
            wordInput.classList.remove('border-success', 'border-error');
        }
        if (timeBar) timeBar.style.width = '100%';
        if (specialCharHint) specialCharHint.classList.add('hidden');
        if (currentWordDisplay && currentWordDisplay.parentElement) {
            currentWordDisplay.parentElement.classList.remove('border-success', 'border-error');
        }

        loadDifficultyWords();
    }

    function loadDifficultyWords() {
        var difficultyKey;
        if (currentDifficultyLevel === 0) {
            difficultyKey = 'basico';
        } else if (currentDifficultyLevel === 1) {
            difficultyKey = 'intermedio';
        } else if (currentDifficultyLevel === 2) {
            difficultyKey = 'avanzado';
        } else {
            difficultyKey = 'especial';
        }

        availableWords = shuffleArray(gameWords[difficultyKey].slice());
        if (availableWords.length === 0 && currentDifficultyLevel < 3) {
            currentDifficultyLevel++;
            loadDifficultyWords();
            wordsCorrectInCurrentDifficulty = 0;
        } else if (availableWords.length === 0 && currentDifficultyLevel === 3) {
            endGame();
            return;
        }
        wordIndex = 0;
    }

    function loadNewWord() {
        clearInterval(gameTimerInterval);

        if (wordIndex >= availableWords.length) {
            if (currentDifficultyLevel < 3) {
                currentDifficultyLevel++;
                loadDifficultyWords();
                wordsCorrectInCurrentDifficulty = 0;
            } else {
                endGame();
                return;
            }
        }

        currentWord = availableWords[wordIndex];

        var baseTimeSetting;
        if (currentWord.type === "word") {
            var wordLength = currentWord.word.length;
            if (wordLength >= 3 && wordLength <= 5) {
                baseTimeSetting = timeSettings[wordLength];
            } else {
                baseTimeSetting = timeSettings["default"];
            }
        } else {
            baseTimeSetting = timeSettings["default"];
        }

        var timeRange = baseTimeSetting.initial - baseTimeSetting.min;
        var reductionPerWord = timeRange / REDUCTION_WORDS_THRESHOLD;

        var calculatedTime = baseTimeSetting.initial - (wordsCorrectInCurrentDifficulty * reductionPerWord);
        currentWord.timeLimit = Math.max(baseTimeSetting.min, calculatedTime);
        currentWord.timeLimit = parseFloat(currentWord.timeLimit.toFixed(2));

        timeRemainingSeconds = currentWord.timeLimit;

        if (currentWordDisplay) currentWordDisplay.textContent = currentWord.word;
        questionStartTime = Date.now();
        responseChanges = 0;
        if (specialCharHint) {
            if (currentWord.type === "special" || currentWord.type === "shortcut") {
                specialCharHint.textContent = "Pista: " + currentWord.hint;
                specialCharHint.classList.remove('hidden');
                if (wordInput) {
                    wordInput.value = '';
                    wordInput.disabled = true;
                }
            } else {
                specialCharHint.classList.add('hidden');
                if (wordInput) {
                    wordInput.disabled = false;
                }
            }
        }
        if (wordInput) {
            wordInput.value = '';
            wordInput.focus();
            wordInput.classList.remove('border-success', 'border-error');
        }
        if (currentWordDisplay && currentWordDisplay.parentElement) {
            currentWordDisplay.parentElement.classList.remove('border-success', 'border-error');
        }

        updateTimeBar();
        startTimer();
    }

    function startTimer() {
        clearInterval(gameTimerInterval);
        gameTimerInterval = setInterval(function() {
            timeRemainingSeconds -= (UPDATE_INTERVAL_MS / 1000);
            updateTimeBar();

            if (timeRemainingSeconds <= 0) {
                clearInterval(gameTimerInterval);
                handleIncorrectInputLogic();
                wordIndex++;
                loadNewWord();
            }
        }, UPDATE_INTERVAL_MS);
    }

    function handleInput() {
        if (!gameActive || (wordInput && wordInput.disabled) || currentWord.type === "shortcut") {
            return;
        }

        var inputText = wordInput.value;
        var targetWord = currentWord.word;

        var inputLower = inputText.toLowerCase();
        var targetLower = targetWord.toLowerCase();

        wordInput.classList.remove('border-success', 'border-error');
        if (currentWordDisplay && currentWordDisplay.parentElement) {
            currentWordDisplay.parentElement.classList.remove('border-success', 'border-error');
        }

        if (inputText.length > targetWord.length) {
            wordInput.classList.add('border-error');
            if (currentWordDisplay && currentWordDisplay.parentElement) {
                currentWordDisplay.parentElement.classList.add('border-error');
            }
            handleIncorrectInputLogic();
            wordIndex++;
            loadNewWord();
            return;
        }

        var isPartialMatch = true;
        for (var i = 0; i < inputText.length; i++) {
            if (normalizeString(inputText[i]) !== normalizeString(targetWord[i])) {
                isPartialMatch = false;
                break;
            }
        }

        if (!isPartialMatch) {
            wordInput.classList.add('border-error');
            if (currentWordDisplay && currentWordDisplay.parentElement) {
                currentWordDisplay.parentElement.classList.add('border-error');
            }
            handleIncorrectInputLogic();
            wordIndex++;
            loadNewWord();
            return;
        }

        wordInput.classList.add('border-success');
        if (currentWordDisplay && currentWordDisplay.parentElement) {
            currentWordDisplay.parentElement.classList.add('border-success');
        }

        if (inputText.length === targetWord.length) {
            var responseTime = Date.now() - questionStartTime;
            if (app.GamesAdapter) {
                app.GamesAdapter.recordAction({
                    asignatura: 'Ofimática I',
                    nivel: ['Básico', 'Intermedio', 'Avanzado', 'Especial'][currentDifficultyLevel],
                    preguntaId: 'kbd_' + currentWord.word,
                    tema: 'Escritura',
                    respuestaSeleccionada: inputText,
                    respuestaCorrecta: targetWord,
                    esCorrecta: inputText.toLowerCase() === targetWord.toLowerCase(),
                    tiempoRespuesta: responseTime,
                    cambiosRespuesta: responseChanges
                });
            }

            if (inputText === targetWord || inputLower === targetLower) {
                handleCorrectInputLogic();
            } else {
                handleIncorrectInputLogic();
                wordInput.classList.remove('border-success');
                wordInput.classList.add('border-error');
                if (currentWordDisplay && currentWordDisplay.parentElement) {
                    currentWordDisplay.parentElement.classList.remove('border-success');
                    currentWordDisplay.parentElement.classList.add('border-error');
                }
            }
            wordIndex++;
            loadNewWord();
        }
    }

    function handleKeyDown(event) {
        if (!gameActive || currentWord.type !== "shortcut") {
            return;
        }

        event.preventDefault();

        var pressedShortcut = '';
        if (event.ctrlKey) pressedShortcut += 'CTRL+';
        if (event.altKey) pressedShortcut += 'ALT+';
        if (event.shiftKey) pressedShortcut += 'SHIFT+';
        if (event.metaKey) pressedShortcut += 'WIN+';

        var mainKey = event.key.toUpperCase();
        if (mainKey === ' ') mainKey = 'SPACE';
        if (mainKey === 'ARROWUP') mainKey = 'UP';
        if (mainKey === 'ARROWDOWN') mainKey = 'DOWN';
        if (mainKey === 'ARROWLEFT') mainKey = 'LEFT';
        if (mainKey === 'ARROWRIGHT') mainKey = 'RIGHT';
        if (mainKey === 'DELETE') mainKey = 'SUPR';

        if (mainKey !== 'CONTROL' && mainKey !== 'ALT' && mainKey !== 'SHIFT' && mainKey !== 'META') {
            pressedShortcut += mainKey;
        } else if (pressedShortcut.charAt(pressedShortcut.length - 1) === '+') {
            pressedShortcut = pressedShortcut.substring(0, pressedShortcut.length - 1);
        }

        var normalizedPressed = normalizeShortcut(pressedShortcut);
        var normalizedTarget = normalizeShortcut(currentWord.word);

        if (normalizedPressed === normalizedTarget) {
            wordInput.classList.add('border-success');
            if (currentWordDisplay && currentWordDisplay.parentElement) {
                currentWordDisplay.parentElement.classList.add('border-success');
            }
            handleCorrectInputLogic();
        } else {
            wordInput.classList.add('border-error');
            if (currentWordDisplay && currentWordDisplay.parentElement) {
                currentWordDisplay.parentElement.classList.add('border-error');
            }
            handleIncorrectInputLogic();
        }

        wordIndex++;
        loadNewWord();
    }

    function handleCorrectInputLogic() {
        if (!gameActive) return;
        correctWordsCount++;
        wordsCorrectInCurrentDifficulty++;

        correctKeys += currentWord.word.length;
        totalKeys += currentWord.word.length;

        consecutiveErrors = 0;
        if (correctWordsDisplay) correctWordsDisplay.textContent = correctWordsCount;
        if (totalErrorsDisplay) totalErrorsDisplay.textContent = totalErrors;
    }

    function handleIncorrectInputLogic() {
        if (!gameActive) return;
        totalErrors++;
        totalKeys += currentWord.word.length;

        consecutiveErrors++;
        if (totalErrorsDisplay) totalErrorsDisplay.textContent = totalErrors;
        if (correctWordsDisplay) correctWordsDisplay.textContent = correctWordsCount;

        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            endGame();
        }
    }

    function endGame() {
        if (!gameActive) return;
        gameActive = false;
        clearInterval(gameTimerInterval);
        if (wordInput) {
            wordInput.disabled = true;
            wordInput.value = '';
            wordInput.classList.remove('border-success', 'border-error');
        }
        if (currentWordDisplay && currentWordDisplay.parentElement) {
            currentWordDisplay.parentElement.classList.remove('border-success', 'border-error');
        }
        showScreen('game-result-screen');

        if (finalCorrectWords) finalCorrectWords.textContent = correctWordsCount;
        if (finalErrors) finalErrors.textContent = totalErrors;

        var wpm = calculateWPM();
        var precision = totalKeys > 0 ? Math.round((correctKeys / totalKeys) * 100) : 0;
        var totalScore = Math.round((wpm * 0.6) + (precision * 0.4) + (correctWordsCount * 2));

        if (finalWPM) finalWPM.textContent = wpm + " WPM | " + precision + "% Precisión";

        var scoreTitle = gameResultScreen.querySelector('h3');
        if (scoreTitle) scoreTitle.textContent = "¡Juego Terminado! Puntaje: " + totalScore;

        if (app.GamesAdapter) {
            app.GamesAdapter.finishSession('Ofimática I', ['Básico', 'Intermedio', 'Avanzado', 'Especial'][currentDifficultyLevel], totalScore);
        }
    }

    function exitGame() {
        gameActive = false;
        clearInterval(gameTimerInterval);
        if (app.returnToMainContent) {
            app.returnToMainContent();
        } else {
            showScreen('game-start-menu');
        }
    }

})(window.QuizProApp);
