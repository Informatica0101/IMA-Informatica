(function(window, document, app) {
    // Este archivo contiene la lógica y los datos del juego de Destreza en el Teclado.

    // --- Datos del Juego ---
    var gameWords = {
        // Palabras básicas: cortas y comunes
        basico: [
            { word: "casa", type: "word" }, { word: "perro", type: "word" }, { word: "mesa", type: "word" },
            { word: "sol", type: "word" }, { word: "luz", type: "word" }, { word: "flor", type: "word" },
            { word: "azul", type: "word" }, { word: "verde", type: "word" }, { word: "rojo", type: "word" },
            { word: "agua", type: "word" }, { word: "libro", type: "word" }, { word: "gato", type: "word" },
            { word: "pan", type: "word" }, { word: "tren", type: "word" }, { word: "cielo", type: "word" },
            { word: "nube", type: "word" }, { word: "paz", type: "word" }, { word: "amor", type: "word" },
            { word: "vida", type: "word" }, { word: "mano", type: "word" }
        ],
        // Palabras intermedias: longitud media, mayor complejidad
        intermedio: [
            { word: "computadora", type: "word" }, { word: "teclado", type: "word" }, { word: "ratón", type: "word" },
            { word: "pantalla", type: "word" }, { word: "impresora", type: "word" }, { word: "software", type: "word" },
            { word: "hardware", type: "word" }, { word: "internet", type: "word" }, { word: "navegador", type: "word" },
            { word: "documento", type: "word" }, { word: "teléfono", type: "word" }, { word: "máquina", type: "word" },
            { word: "aplicación", type: "word" }, { word: "desarrollo", type: "word" }, { word: "seguridad", type: "word" },
            { word: "informática", type: "word" }, { word: "conexión", type: "word" }, { word: "programa", type: "word" },
            { word: "escritorio", type: "word" }, { word: "sistema", type: "word" }
        ],
        // Palabras avanzadas: largas, complejas, con caracteres especiales
        avanzado: [
            { word: "programación", type: "word" }, { word: "algoritmo", type: "word" }, { word: "inteligencia", type: "word" },
            { word: "automatización", type: "word" }, { word: "ciberseguridad", type: "word" }, { word: "infraestructura", type: "word" },
            { word: "comunicación", type: "word" }, { word: "administración", type: "word" }, { word: "configuración", type: "word" },
            { word: "virtualización", type: "word" }, { word: "optimización", type: "word" }, { word: "interoperabilidad", type: "word" },
            { word: "mantenimiento", type: "word" }, { word: "rendimiento", type: "word" }, { word: "almacenamiento", type: "word" },
            { word: "distribución", type: "word" }, { word: "personalización", type: "word" }, { word: "autenticación", type: "word" },
            { word: "encriptación", type: "word" }, { word: "interfaz", type: "word" }
        ],
        // Caracteres especiales y atajos de teclado
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
            { word: "Ctrl+V", type: "shortcut", "hint": "Pegar" },
            { word: "Ctrl+X", type: "shortcut", hint: "Cortar" },
            { word: "Ctrl+Z", type: "shortcut", hint: "Deshacer" },
            { word: "Ctrl+S", type: "shortcut", hint: "Guardar" },
            { word: "Alt+Tab", type: "shortcut", hint: "Cambiar Ventana" },
            { word: "Win+D", type: "shortcut", hint: "Mostrar Escritorio" },
            { word: "Shift+Supr", type: "shortcut", hint: "Eliminar Permanentemente" }
        ]
    };

    // --- Variables de Estado del Juego ---
    var currentWord = {}; // Objeto que contiene { word: "...", type: "...", hint: "..." }
    var currentDifficultyLevel = 0; // 0: básico, 1: intermedio, 2: avanzado, 3: especial
    var availableWords = []; // Palabras para la dificultad actual
    var wordIndex = 0; // Índice de la palabra actual en availableWords
    var correctWordsCount = 0; // Contador acumulativo de palabras correctas (global)
    var wordsCorrectInCurrentDifficulty = 0; // Contador de palabras correctas en el nivel de dificultad actual (para ajuste de tiempo)
    var consecutiveErrors = 0;
    var totalErrors = 0; // Contador global de errores
    var correctKeys = 0; // Pulsaciones correctas (Req 6.2)
    var totalKeys = 0; // Pulsaciones totales
    var totalXP = 0; // REQ 3: Acumulador de sesión
    var totalActiveTimeMs = 0; // REQ: Tiempo real de escritura acumulado
    var gameStartTime;
    var gameTimerInterval;
    var timeRemainingSeconds; // Usaremos segundos con decimales para mayor precisión
    var MAX_CONSECUTIVE_ERRORS = 3;
    var UPDATE_INTERVAL_MS = 50; // Intervalo de actualización de la barra de tiempo en milisegundos
    var gameActive = false;
    var isProcessingFeedback = false; // REQ: Evitar input sin perder foco
    var questionStartTime = 0;
    var responseChanges = 0; // Nueva bandera para controlar el estado del juego
    var keyboardType = 'desktop';

    // Configuración de tiempo por longitud de palabra
    var timeSettings = {
        3: { initial: 10, min: 3 }, // Palabras de 3 letras: inicia en 10s, mínimo 3s
        4: { initial: 10, min: 4 }, // Palabras de 4 letras: inicia en 10s, mínimo 4s
        5: { initial: 10, min: 5 }, // Palabras de 5 letras: inicia en 10s, mínimo 5s
        default: { initial: 5, min: 5 } // Para palabras > 5 letras o tipos especiales
    };
    var REDUCTION_WORDS_THRESHOLD = 20; // Número de palabras correctas para alcanzar el tiempo mínimo

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

    // Mezcla un array aleatoriamente (Fisher-Yates shuffle)
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    // Muestra la pantalla deseada y oculta las demás
    function showScreen(screenId) {
        var screens = [
            gameStartMenu,
            gamePlayArea,
            gameResultScreen,
            document.getElementById('game-setup-screen')
        ];
        screens.forEach(function(screen) {
            if (screen) {
                screen.classList.add('hidden');
                screen.classList.remove('flex');
                screen.classList.remove('flex-col');
                screen.classList.remove('animate-fade-in-down');
            }
        });

        var targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            targetScreen.classList.add('flex', 'flex-col');
            targetScreen.classList.add('animate-fade-in-down');
        }
    }

    // Normaliza una cadena eliminando acentos y diacríticos, y la convierte a minúsculas
    function normalizeString(str) {
        return (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // Normaliza una cadena de atajo de teclado para comparación (ej. "Ctrl+C" a "CTRL+C")
    function normalizeShortcut(shortcutStr) {
        return (shortcutStr || '').toUpperCase().replace(/\s/g, ''); // Convertir a mayúsculas y quitar espacios
    }

    // Actualiza la barra de tiempo visualmente
    function updateTimeBar() {
        var percentage = (timeRemainingSeconds / currentWord.timeLimit) * 100;
        if (timeBar) {
            timeBar.style.width = Math.max(0, percentage) + "%"; // Asegura que no baje de 0%
            timeBar.classList.remove('warning', 'danger');
            if (percentage < 30) {
                timeBar.classList.add('danger');
            } else if (percentage < 60) {
                timeBar.classList.add('warning');
            }
        }
    }

    // Calcula las palabras por minuto (REQ 2: Estándar Industrial)
    function calculateWPM() {
        // REQ: Usar tiempo activo acumulado en lugar de tiempo absoluto
        var elapsedTimeInMinutes = totalActiveTimeMs / 60000;
        if (elapsedTimeInMinutes <= 0) return 0;

        // REQ: Una "palabra" estándar son 5 caracteres.
        var standardWords = correctKeys / 5;
        return Math.round(standardWords / elapsedTimeInMinutes);
    }

    function calculateAccuracy() {
        if (totalKeys === 0) return 100;
        var acc = (correctKeys / totalKeys) * 100;
        return Math.max(0, Math.round(acc));
    }

    function pauseTimer() {
        gameActive = false;
        clearInterval(gameTimerInterval);
    }

    function resumeTimer() {
        gameActive = true;
        startTimer();
    }

    function selectKeyboardType(type) {
        keyboardType = type;
        startGame();
    }

    function renderAccentPanel() {
        var container = document.getElementById('accent-panel-container');
        if (!container) return;

        if (keyboardType === 'laptop') {
            var chars = [
                {c: 'á', a: '160'}, {c: 'é', a: '130'}, {c: 'í', a: '161'}, {c: 'ó', a: '162'}, {c: 'ú', a: '163'},
                {c: 'ñ', a: '164'}, {c: 'ü', a: '129'}, {c: '¿', a: '168'}, {c: '¡', a: '173'}, {c: '€', a: '0128'}
            ];
            container.innerHTML =
                '<p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Atajos para Laptop (Click o Alt+Código)</p>' +
                '<div class="accent-panel mx-auto">' +
                    chars.map(function(char) {
                        return '<button type="button" onclick="insertChar(\'' + char.c + '\')" class="accent-btn group flex flex-col items-center">' +
                            '<span>' + char.c + '</span>' +
                            '<span class="text-[7px] text-gray-300 group-hover:text-blue-400">Alt+' + char.a + '</span>' +
                        '</button>';
                    }).join('') +
                '</div>';
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    }

    function insertChar(char) {
        if (wordInput && !wordInput.disabled) {
            wordInput.value += char;
            handleInput();
            wordInput.focus();
        }
    }

    // --- Lógica del Juego ---

    function renderLeaderboard(lb) {
        var miniLb = document.getElementById('mini-leaderboard');
        if (!miniLb) return;

        if (lb && lb.global && lb.global.length > 0) {
            miniLb.innerHTML = lb.global.slice(0, 5).map(function(u, i) {
                return '<div class="flex items-center justify-between text-[10px] font-bold py-1 border-b border-purple-50 last:border-0">' +
                    '<span class="text-purple-700">' + (i+1) + '. ' + (u.nombre ? u.nombre.split(' ')[0] : 'Alumno') + '</span>' +
                    '<div class="flex flex-col items-end">' +
                        '<span class="text-purple-500">' + Math.round(u.promedio) + ' Pts</span>' +
                        '<span class="text-[8px] text-gray-400 font-black">' + (u.xp || 0).toLocaleString() + ' XP</span>' +
                    '</div>' +
                '</div>';
            }).join('');
        } else {
            miniLb.innerHTML = '<div class="text-[10px] text-gray-400 text-center py-4 italic">Sé el primero en calificar</div>';
        }
    }

    // Renderiza el récord personal buscando el WPM más alto en el historial (v7.6)
    function renderPersonalRecord(record) {
        if (!record) return;
        var scoreSpan = document.getElementById('init-max-score');

        var maxWPM = 0;

        // Normalización de búsqueda de récord (Hallazgo Core)
        var statsData = record.data || record;
        var keys = Object.keys(statsData);
        keys.forEach(function(key) {
            var entry = statsData[key];
            // Revisar si es una entrada de este juego o tiene el campo wpm
            if (key.indexOf('dexterity') !== -1 || key.indexOf('Destreza en el Teclado') !== -1 || (entry && entry.juego === 'dexterity')) {
                var wpm = parseFloat(entry.wpm || entry.maxWPM || entry.puntaje || 0);
                if (wpm > maxWPM) maxWPM = wpm;
            }
        });

        if (scoreSpan) scoreSpan.textContent = Math.round(maxWPM);

        // Renderizar Tarjeta Analítica Unificada (v7.7)
        if (window.renderUnifiedAnalyticsCard) {
            window.renderUnifiedAnalyticsCard('keyboard-analytics-container', 'dexterity', record);
        }
    }

    // Inicializa el juego al cargar la página o al volver a jugar
    function initDexterityGame() {
        var user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        var isGuest = !user;

        if (app) {
            // REQ: Estrategia Caché Primero (v7.6)
            // No esperamos el init, usamos callbacks para actualizaciones silenciosas
            app.init('dexterity', false).then(function() {
                app.getLeaderboard('dexterity', function(lb) {
                    window.currentLeaderboard = lb;
                    renderLeaderboard(lb);
                });

                app.getPersonalRecord(function(record) {
                    renderPersonalRecord(record);
                });
            });
        }

        if (isGuest) {
            var gw = document.getElementById('guest-mode-warning');
            if (gw) gw.classList.remove('hidden');
            var cb = document.getElementById('continue-guest-btn');
            if (cb) cb.classList.remove('hidden');
        }

        console.log('initDexterityGame called'); // Log de depuración
        // Asignar elementos del DOM
        gameStartMenu = document.getElementById('game-start-menu');
        startGameButton = document.getElementById('start-game-button-real');
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

        console.log('startGameButton:', startGameButton); // Log de depuración

        // Configurar Event Listeners
        if (startGameButton) {
            startGameButton.addEventListener('click', function() {
                showScreen('game-setup-screen');
            });
        }

        if (wordInput) {
            wordInput.addEventListener('input', handleInput);
            wordInput.addEventListener('keydown', handleKeyDown);

            // Mobile Layout Shift (Requirement 4)
            wordInput.addEventListener('focus', function() {
                if (window.innerWidth < 768) {
                    var container = document.getElementById('dexterity-game-container');
                    if (container) container.style.transform = 'translateY(-30%)';
                }
            });
            wordInput.addEventListener('blur', function() {
                var container = document.getElementById('dexterity-game-container');
                if (container) container.style.transform = 'translateY(0)';
            });
        }

        if (exitGameButton) exitGameButton.addEventListener('click', exitGame);
        if (retryGameButton) retryGameButton.addEventListener('click', startGame);
        if (exitResultsButton) exitResultsButton.addEventListener('click', exitGame);

        if (app) app.showLoading(false);

        // Control de Abandono (Fase 11)
        var handleAbandonment = function() {
            if (gamePlayArea && !gamePlayArea.classList.contains('hidden')) {
                alert('Sesión cancelada por cambio de ventana.');
                location.reload();
            }
        };
        window.addEventListener('blur', handleAbandonment);
        document.addEventListener('visibilitychange', function() { if (document.visibilityState === 'hidden') handleAbandonment(); });

        // Mostrar menú de inicio al cargar
        showScreen('game-start-menu');
    }

    // Inicia un nuevo juego
    function startGame() {
        console.log('startGame function called'); // Log de depuración

        // Habilitar pantalla completa (v3.2)
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen()["catch"](function(e) { console.warn("FS failed", e); });
        }
        // Activar Wake Lock (v3.2)
        if (window.requestWakeLock) window.requestWakeLock();

        resetGame();
        gameActive = true; // El juego está activo
        showScreen('game-play-area');
        gameStartTime = Date.now();
        renderAccentPanel();
        loadNewWord();
        if (wordInput) wordInput.focus(); // Pone el foco en el input

        // Actualizar estadísticas en tiempo real
        if (window.statsInterval) clearInterval(window.statsInterval);
        window.statsInterval = setInterval(function() {
            if (gameActive) {
                var wpmDisp = document.getElementById('wpm-display');
                var accDisp = document.getElementById('accuracy-display');
                if (wpmDisp) wpmDisp.textContent = calculateWPM();
                if (accDisp) accDisp.textContent = calculateAccuracy() + '%';
            }
        }, 1000);
    }

    // Reinicia todas las variables del juego
    function resetGame() {
        clearInterval(gameTimerInterval);
        currentDifficultyLevel = 0;
        correctWordsCount = 0; // Reiniciar contador global de palabras correctas
        wordsCorrectInCurrentDifficulty = 0; // Reiniciar contador para el ajuste de tiempo
        consecutiveErrors = 0;
        totalErrors = 0;
        correctKeys = 0;
        totalKeys = 0;
        wordIndex = 0;
        totalXP = 0;
        totalActiveTimeMs = 0;

        // Reiniciar los displays
        if (correctWordsDisplay) correctWordsDisplay.textContent = correctWordsCount;
        if (totalErrorsDisplay) totalErrorsDisplay.textContent = totalErrors;
        if (wordInput) {
            wordInput.value = '';
            wordInput.disabled = false; // Habilitar el input al reiniciar
            wordInput.classList.remove('border-success', 'border-error'); // Limpiar clases de feedback
        }
        if (timeBar) timeBar.style.width = '100%';
        if (specialCharHint) specialCharHint.classList.add('hidden');
        if (currentWordDisplay && currentWordDisplay.parentElement) {
            currentWordDisplay.parentElement.classList.remove('border-success', 'border-error'); // Limpiar clases de feedback
        }

        // Cargar palabras para la primera dificultad
        loadDifficultyWords();
    }

    // Carga las palabras para la dificultad actual y las mezcla
    function loadDifficultyWords() {
        var difficultyKey;
        if (currentDifficultyLevel === 0) {
            difficultyKey = 'basico';
        } else if (currentDifficultyLevel === 1) {
            difficultyKey = 'intermedio';
        } else if (currentDifficultyLevel === 2) {
            difficultyKey = 'avanzado';
        } else { // Después de avanzado, se mezclan palabras y especiales
            difficultyKey = 'especial';
        }

        availableWords = shuffleArray(gameWords[difficultyKey].slice());
        // Si ya se agotaron las palabras de una dificultad, se pasa a la siguiente
        if (availableWords.length === 0 && currentDifficultyLevel < 3) {
            currentDifficultyLevel++;
            loadDifficultyWords(); // Recargar con la nueva dificultad
            wordsCorrectInCurrentDifficulty = 0; // Reiniciar este contador al cambiar de dificultad
        } else if (availableWords.length === 0 && currentDifficultyLevel === 3) {
            // Si no hay más palabras en la última dificultad, el juego termina
            endGame();
            return;
        }
        wordIndex = 0; // Reiniciar el índice para la nueva lista de palabras
    }

    // Carga una nueva palabra o combinación
    function loadNewWord() {
        clearInterval(gameTimerInterval); // Detener el temporizador actual

        if (wordIndex >= availableWords.length) {
            // Avanzar a la siguiente dificultad si hay (Requirement 3: Silent Progression)
            if (currentDifficultyLevel < 3) {
                currentDifficultyLevel++;
                loadDifficultyWords();
                wordsCorrectInCurrentDifficulty = 0;
                // No hay anuncio ni pausa, carga directamente la siguiente palabra
            } else {
                // Si no hay más dificultades, terminar el juego
                endGame();
                return;
            }
        }

        currentWord = availableWords[wordIndex];

        // REQ 6: Gestión dinámica del tiempo (v7.5)
        var baseTime = 2.0;
        var initialSecPerChar = 0.8;

        var improvement = Math.min(0.4, (wordsCorrectInCurrentDifficulty * 0.02));
        var currentSecPerChar = Math.max(0.3, initialSecPerChar - improvement);

        var calculatedTime = baseTime + (currentWord.word.length * currentSecPerChar);

        var difficultyFactor = [1.2, 1.0, 0.8, 0.7][currentDifficultyLevel];
        calculatedTime *= difficultyFactor;

        currentWord.timeLimit = parseFloat(Math.max(3, calculatedTime).toFixed(2));
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
                    // wordInput.disabled = true; // REQ: No deshabilitar para persistir teclado
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

    // Inicia el temporizador de la palabra actual
    function startTimer() {
        clearInterval(gameTimerInterval);

        gameTimerInterval = setInterval(function() {
            if (!gameActive) return; // REQ: Congelar si el feedback está activo

            timeRemainingSeconds -= (UPDATE_INTERVAL_MS / 1000);
            totalActiveTimeMs += UPDATE_INTERVAL_MS; // REQ: Acumular solo tiempo activo
            updateTimeBar();

            if (timeRemainingSeconds <= 0) {
                clearInterval(gameTimerInterval);
                pauseTimer(); // REQ: Congelar inmediatamente al fallar por tiempo
                handleIncorrectInputLogic();

                isProcessingFeedback = true; // REQ: Bloquear lógica sin perder foco
                if (currentWordDisplay && currentWordDisplay.parentElement) {
                    currentWordDisplay.parentElement.classList.add('border-error');
                }

                var errTimeT = Math.min(3000, 2000 + (currentWord.word.length * 50));
                setTimeout(function() {
                    isProcessingFeedback = false;
                    wordIndex++;
                    resumeTimer(); // REQ: Reactivar timer antes de cargar nueva palabra
                    loadNewWord();
                }, errTimeT);
            }
        }, UPDATE_INTERVAL_MS);
    }

    // Maneja la entrada del usuario para palabras normales y caracteres especiales (no atajos)
    function handleInput() {
        if (!gameActive || isProcessingFeedback || currentWord.type === "shortcut") {
            return;
        }

        var inputText = wordInput.value;
        var targetWord = currentWord.word;

        var inputLower = inputText.toLowerCase();
        var targetLower = targetWord.toLowerCase();

        var normalizedInputText = normalizeString(inputText);
        var normalizedTargetWord = normalizeString(targetWord);

        wordInput.classList.remove('border-success', 'border-error');
        if (currentWordDisplay && currentWordDisplay.parentElement) {
            currentWordDisplay.parentElement.classList.remove('border-success', 'border-error');
        }

        if (inputText.length > targetWord.length) {
            pauseTimer(); // REQ: Congelar inmediatamente
            wordInput.classList.add('border-error');
            if (currentWordDisplay && currentWordDisplay.parentElement) {
                currentWordDisplay.parentElement.classList.add('border-error');
            }
            handleIncorrectInputLogic();

            isProcessingFeedback = true; // REQ: Bloquear lógica sin perder foco
            var errTime = Math.min(3000, 2000 + (currentWord.word.length * 50));
            setTimeout(function() {
                isProcessingFeedback = false;
                wordIndex++;
                resumeTimer(); // REQ: Reactivar timer
                loadNewWord();
            }, errTime);
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
            pauseTimer(); // REQ: Congelar inmediatamente
            wordInput.classList.add('border-error');
            if (currentWordDisplay && currentWordDisplay.parentElement) {
                currentWordDisplay.parentElement.classList.add('border-error');
            }
            handleIncorrectInputLogic();

            isProcessingFeedback = true; // REQ: Bloquear lógica sin perder foco
            var errTime = Math.min(3000, 2000 + (currentWord.word.length * 50));
            setTimeout(function() {
                isProcessingFeedback = false;
                wordIndex++;
                resumeTimer(); // REQ: Reactivar timer
                loadNewWord();
            }, errTime);
            return;
        }

        wordInput.classList.add('border-success');
        if (currentWordDisplay && currentWordDisplay.parentElement) {
            currentWordDisplay.parentElement.classList.add('border-success');
        }

        if (inputText.length === targetWord.length) {
            pauseTimer(); // REQ: Congelar temporizadores inmediatamente
            var responseTime = Date.now() - questionStartTime;
            var difficultyName = ['Básico', 'Intermedio', 'Avanzado', 'Especial'][currentDifficultyLevel];
            var isCorrectFinal = inputText === targetWord || inputLower === targetLower;

            if (app) {
                var xpDiff = normalizeString(difficultyName);
                totalXP += app.calculateXP(isCorrectFinal, xpDiff, responseTime, 'dexterity');

                app.recordAction({
                    asignatura: 'Ofimática I',
                    nivel: difficultyName,
                    preguntaId: 'kbd_' + currentWord.word,
                    tema: 'Escritura',
                    respuestaSeleccionada: inputText,
                    respuestaCorrecta: targetWord,
                    esCorrecta: isCorrectFinal,
                    tiempoRespuesta: responseTime,
                    cambiosRespuesta: responseChanges
                });
            }

            if (isCorrectFinal) {
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

            isProcessingFeedback = true; // REQ: Bloquear lógica sin perder foco
            var feedbackTime = isCorrectFinal ? 800 : Math.min(3000, 2000 + (currentWord.word.length * 50));
            setTimeout(function() {
                isProcessingFeedback = false;
                wordIndex++;
                resumeTimer(); // REQ: Reactivar timer
                loadNewWord();
            }, feedbackTime);
        }
    }

    // Maneja la entrada del usuario para atajos de teclado (keydown)
    function handleKeyDown(event) {
        if (!gameActive || isProcessingFeedback || currentWord.type !== "shortcut") {
            return;
        }

        event.preventDefault();

        var pressedShortcut = '';
        if (event.ctrlKey) pressedShortcut += 'CTRL+';
        if (event.altKey) pressedShortcut += 'ALT+';
        if (event.shiftKey) pressedShortcut += 'SHIFT+';
        if (event.metaKey) pressedShortcut += 'WIN+';

        var mainKey = (event.key || '').toUpperCase();
        if (mainKey === ' ') mainKey = 'SPACE';
        if (mainKey === 'ARROWUP') mainKey = 'UP';
        if (mainKey === 'ARROWDOWN') mainKey = 'DOWN';
        if (mainKey === 'ARROWLEFT') mainKey = 'LEFT';
        if (mainKey === 'ARROWRIGHT') mainKey = 'RIGHT';
        if (mainKey === 'DELETE') mainKey = 'SUPR';

        if (!['CONTROL', 'ALT', 'SHIFT', 'META'].includes(mainKey)) {
            pressedShortcut += mainKey;
        } else if (pressedShortcut.endsWith('+')) {
            pressedShortcut = pressedShortcut.slice(0, -1);
        }

        var normalizedPressed = normalizeShortcut(pressedShortcut);
        var normalizedTarget = normalizeShortcut(currentWord.word);

        pauseTimer(); // REQ: Congelar temporizadores inmediatamente
        var responseTime = Date.now() - questionStartTime;
        var isCorrectShort = normalizedPressed === normalizedTarget;

        if (app) {
            var difficultyName = ['Básico', 'Intermedio', 'Avanzado', 'Especial'][currentDifficultyLevel];
            var xpDiffShort = normalizeString(difficultyName);
            totalXP += app.calculateXP(isCorrectShort, xpDiffShort, responseTime, 'dexterity');

            app.recordAction({
                asignatura: 'Ofimática I',
                nivel: difficultyName,
                preguntaId: 'kbd_shortcut_' + currentWord.word,
                tema: 'Escritura',
                respuestaSeleccionada: pressedShortcut,
                respuestaCorrecta: currentWord.word,
                esCorrecta: isCorrectShort,
                tiempoRespuesta: responseTime,
                cambiosRespuesta: responseChanges
            });
        }

        if (isCorrectShort) {
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

        isProcessingFeedback = true; // REQ: Bloquear lógica sin perder foco
        var feedbackTimeShort = isCorrectShort ? 800 : Math.min(3000, 2000 + (currentWord.word.length * 50));
        setTimeout(function() {
            isProcessingFeedback = false;
            wordIndex++;
            resumeTimer(); // REQ: Reactivar timer
            loadNewWord();
        }, feedbackTimeShort);
    }


    // Lógica para manejar una entrada correcta (actualiza contadores)
    function handleCorrectInputLogic() {
        correctWordsCount++;
        wordsCorrectInCurrentDifficulty++;

        var wordLen = currentWord.word.length;
        correctKeys += wordLen;
        totalKeys += wordLen;

        consecutiveErrors = 0;
        if (correctWordsDisplay) correctWordsDisplay.textContent = correctWordsCount;
        if (totalErrorsDisplay) totalErrorsDisplay.textContent = totalErrors;
    }

    // Lógica para manejar una entrada incorrecta (actualiza contadores)
    function handleIncorrectInputLogic() {
        // REQ: Permitir actualización de contadores aunque gameActive sea false por pauseTimer
        totalErrors++;

        totalKeys += currentWord.word.length;

        if (app && app.calculateXP) {
            app.calculateXP(false, 'basico', 0, 'dexterity');
        }

        consecutiveErrors++;
        if (totalErrorsDisplay) totalErrorsDisplay.textContent = totalErrors;
        if (correctWordsDisplay) correctWordsDisplay.textContent = correctWordsCount;

        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            endGame();
        }
    }

    // Termina el juego y muestra los resultados
    function endGame() {
        clearInterval(gameTimerInterval);
        gameActive = false;
        if (window.statsInterval) clearInterval(window.statsInterval);

        var wpm = calculateWPM();
        var accuracy = calculateAccuracy();
        var finalTime = Math.round((Date.now() - gameStartTime) / 1000);
        var difficultyName = ['Básico', 'Intermedio', 'Avanzado', 'Especial'][currentDifficultyLevel];

        if (wordInput) {
            wordInput.disabled = true;
            wordInput.value = '';
            wordInput.classList.remove('border-success', 'border-error');
        }
        if (currentWordDisplay && currentWordDisplay.parentElement) {
            currentWordDisplay.parentElement.classList.remove('border-success', 'border-error');
        }
        showScreen('game-result-screen');

        // Requirement 1.2: Mostrar XP, WPM, correctas/incorrectas, nivel, precisión, tiempo, ranking.
        if (finalCorrectWords) finalCorrectWords.textContent = correctWordsCount;
        if (finalErrors) finalErrors.textContent = totalErrors;

        if (finalWPM) {
            finalWPM.innerHTML =
                '<div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4 text-gray-600 font-medium">' +
                    '<div class="flex flex-col"><span class="text-2xl font-black text-blue-600">' + wpm + '</span> WPM</div>' +
                    '<div class="flex flex-col"><span class="text-2xl font-black text-green-600">' + accuracy + '%</span> Precisión</div>' +
                    '<div class="flex flex-col"><span class="text-2xl font-black text-purple-600">' + totalXP + '</span> XP</div>' +
                    '<div class="flex flex-col"><span class="text-lg font-bold">' + difficultyName + '</span> Nivel</div>' +
                    '<div class="flex flex-col"><span class="text-lg font-bold">' + finalTime + 's</span> Tiempo</div>' +
                    '<div id="player-ranking" class="flex flex-col"><span class="text-lg font-bold">---</span> Ranking</div>' +
                '</div>';
        }

        // Calcular Ranking Localmente (Posición)
        var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var user = userRaw ? JSON.parse(userRaw) : null;
        if (user && window.currentLeaderboard && window.currentLeaderboard.global) {
            var rankingEl = document.getElementById('player-ranking');
            var pos = -1;
            for (var i = 0; i < window.currentLeaderboard.global.length; i++) {
                if (window.currentLeaderboard.global[i].nombre === user.nombre) {
                    pos = i;
                    break;
                }
            }
            if (rankingEl && pos !== -1) {
                var posSpan = rankingEl.querySelector('span');
                if (posSpan) posSpan.textContent = '#' + (pos + 1);
            }
        }

        var finalScoreValue = Math.round((wpm * 0.6) + (accuracy * 0.4) + (correctWordsCount * 2));
        var scoreTitle = gameResultScreen.querySelector('h2');
        if (scoreTitle) scoreTitle.textContent = "¡Juego Terminado! Puntaje: " + finalScoreValue;

        if (app) {
            // Enviar WPM como puntaje principal y métrica extra (v7.6)
            app.finishSession('Ofimática I', difficultyName, wpm, totalXP, {
                wpm: wpm,
                accuracy: accuracy,
                score: finalScoreValue
            });
            // Actualizar ranking al finalizar (silencioso)
            app.getLeaderboard('dexterity', renderLeaderboard);
        }
    }

    // Sale del juego y regresa al menú principal de actividades
    function exitGame() {
        if (gameActive) {
            // Requirement 1: Forced Results Screen on exit
            endGame();
            return;
        }

        clearInterval(gameTimerInterval);
        if (window.returnToMainContent) {
            window.returnToMainContent();
        } else {
            showScreen('game-start-menu');
        }
    }

    // Exportar funciones globales
    window.initDexterityGame = initDexterityGame;
    window.selectKeyboardType = selectKeyboardType;
    window.insertChar = insertChar;
    window.showScreen = showScreen;

})(window, document, window.GamesAdapter);
