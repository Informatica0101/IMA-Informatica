// Este archivo contiene la lógica y los datos del juego de Destreza en el Teclado.

// --- Datos del Juego ---
const gameWords = {
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
let currentWord = {}; // Objeto que contiene { word: "...", type: "...", hint: "..." }
let currentDifficultyLevel = 0; // 0: básico, 1: intermedio, 2: avanzado, 3: especial
let availableWords = []; // Palabras para la dificultad actual
let wordIndex = 0; // Índice de la palabra actual en availableWords
let correctWordsCount = 0; // Contador acumulativo de palabras correctas (global)
let wordsCorrectInCurrentDifficulty = 0; // Contador de palabras correctas en el nivel de dificultad actual (para ajuste de tiempo)
let consecutiveErrors = 0;
let totalErrors = 0; // Contador global de errores
let correctKeys = 0; // Pulsaciones correctas (Req 6.2)
let totalKeys = 0; // Pulsaciones totales
let totalXP = 0; // REQ 3: Acumulador de sesión
let gameStartTime;
let gameTimerInterval;
let timeRemainingSeconds; // Usaremos segundos con decimales para mayor precisión
const MAX_CONSECUTIVE_ERRORS = 3;
const UPDATE_INTERVAL_MS = 50; // Intervalo de actualización de la barra de tiempo en milisegundos
let gameActive = false;
let questionStartTime = 0;
let responseChanges = 0; // Nueva bandera para controlar el estado del juego

// Configuración de tiempo por longitud de palabra
const timeSettings = {
    3: { initial: 10, min: 3 }, // Palabras de 3 letras: inicia en 10s, mínimo 3s
    4: { initial: 10, min: 4 }, // Palabras de 4 letras: inicia en 10s, mínimo 4s
    5: { initial: 10, min: 5 }, // Palabras de 5 letras: inicia en 10s, mínimo 5s
    default: { initial: 5, min: 5 } // Para palabras > 5 letras o tipos especiales
};
const REDUCTION_WORDS_THRESHOLD = 20; // Número de palabras correctas para alcanzar el tiempo mínimo

// --- Referencias a Elementos del DOM ---
let gameStartMenu;
let startGameButton;
let gamePlayArea;
let correctWordsDisplay;
// Referencia actualizada para mostrar errores totales
let totalErrorsDisplay;
let timeBar;
let currentWordDisplay;
let specialCharHint;
let wordInput;
let exitGameButton;
let gameResultScreen;
let finalCorrectWords;
let finalErrors;
let finalWPM;
let retryGameButton;
let exitResultsButton;

// --- Funciones de Utilidad ---

// Mezcla un array aleatoriamente (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Muestra la pantalla deseada y oculta las demás
function showScreen(screenId) {
    const screens = [
        gameStartMenu,
        gamePlayArea,
        gameResultScreen
    ];
    screens.forEach(screen => {
        if (screen) {
            screen.classList.add('hidden');
            screen.classList.remove('flex');
            screen.classList.remove('flex-col');
            screen.classList.remove('animate-fade-in-down');
        }
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('flex', 'flex-col');
        targetScreen.classList.add('animate-fade-in-down');
    }
}

// Normaliza una cadena eliminando acentos y diacríticos, y la convierte a minúsculas
function normalizeString(str) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Normaliza una cadena de atajo de teclado para comparación (ej. "Ctrl+C" a "CTRL+C")
function normalizeShortcut(shortcutStr) {
    return shortcutStr.toUpperCase().replace(/\s/g, ''); // Convertir a mayúsculas y quitar espacios
}

// Actualiza la barra de tiempo visualmente
function updateTimeBar() {
    const percentage = (timeRemainingSeconds / currentWord.timeLimit) * 100;
    if (timeBar) {
        timeBar.style.width = `${Math.max(0, percentage)}%`; // Asegura que no baje de 0%
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
    if (!gameStartTime) return 0;
    const elapsedTimeInMinutes = (Date.now() - gameStartTime) / 60000;
    if (elapsedTimeInMinutes <= 0) return 0;

    // REQ: Una "palabra" estándar son 5 caracteres.
    const standardWords = correctKeys / 5;
    return Math.round(standardWords / elapsedTimeInMinutes);
}

function pauseTimer() {
    gameActive = false;
    clearInterval(gameTimerInterval);
}

function resumeTimer() {
    gameActive = true;
    startTimer();
}

// --- Lógica del Juego ---

// Inicializa el juego al cargar la página o al volver a jugar
window.initDexterityGame = async function() {
    if (window.GamesAdapter) {
        await GamesAdapter.init('destreza');
    }
    console.log('initDexterityGame called'); // Log de depuración
    // Asignar elementos del DOM
    gameStartMenu = document.getElementById('game-start-menu');
    startGameButton = document.getElementById('start-game-button-real');
    gamePlayArea = document.getElementById('game-play-area');
    correctWordsDisplay = document.getElementById('correct-words-display');
    // Referencia actualizada
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
    if (startGameButton) startGameButton.addEventListener('click', startGame);
    // El listener 'input' es para palabras normales
    if (wordInput) wordInput.addEventListener('input', handleInput);
    // El listener 'keydown' es para atajos de teclado
    if (wordInput) wordInput.addEventListener('keydown', handleKeyDown);
    if (exitGameButton) exitGameButton.addEventListener('click', exitGame);
    if (retryGameButton) retryGameButton.addEventListener('click', startGame);
    if (exitResultsButton) exitResultsButton.addEventListener('click', exitGame);

    if (window.GamesAdapter) window.GamesAdapter.showLoading(false);

    // Control de Abandono (Fase 11)
    const handleAbandonment = () => {
        if (gamePlayArea && !gamePlayArea.classList.contains('hidden')) {
            alert('Sesión cancelada por cambio de ventana.');
            location.reload();
        }
    };
    window.addEventListener('blur', handleAbandonment);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') handleAbandonment(); });

    // Mostrar menú de inicio al cargar
    showScreen('game-start-menu');
};

// Inicia un nuevo juego
function startGame() {
    console.log('startGame function called'); // Log de depuración

    // Habilitar pantalla completa (v3.2)
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.warn("FS failed", e));
    }
    // Activar Wake Lock (v3.2)
    if (window.requestWakeLock) window.requestWakeLock();

    resetGame();
    gameActive = true; // El juego está activo
    showScreen('game-play-area');
    gameStartTime = Date.now();
    loadNewWord();
    if (wordInput) wordInput.focus(); // Pone el foco en el input
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
    // timeRemainingSeconds se inicializa en loadNewWord basado en la palabra

    // Reiniciar los displays
    if (correctWordsDisplay) correctWordsDisplay.textContent = correctWordsCount;
    // Actualizar display de errores totales
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
    let difficultyKey;
    if (currentDifficultyLevel === 0) {
        difficultyKey = 'basico';
    } else if (currentDifficultyLevel === 1) {
        difficultyKey = 'intermedio';
    } else if (currentDifficultyLevel === 2) {
        difficultyKey = 'avanzado';
    } else { // Después de avanzado, se mezclan palabras y especiales
        difficultyKey = 'especial';
    }

    availableWords = shuffleArray([...gameWords[difficultyKey]]);
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
        // Avanzar a la siguiente dificultad si hay
        if (currentDifficultyLevel < 3) {
            currentDifficultyLevel++;
            loadDifficultyWords();
            wordsCorrectInCurrentDifficulty = 0;

            // REQ 6: Notificar cambio de nivel
            if (currentWordDisplay) {
                const levels = ['Básico', 'Intermedio', 'Avanzado', 'Especial'];
                currentWordDisplay.innerHTML = `<span class="text-xl text-purple-600 animate-pulse">¡NIVEL ${levels[currentDifficultyLevel].toUpperCase()}!</span>`;
                pauseTimer();
                setTimeout(() => { resumeTimer(); loadNewWord(); }, 2000);
                return;
            }
        } else {
            // Si no hay más dificultades, terminar el juego
            endGame();
            return;
        }
    }

    currentWord = availableWords[wordIndex];

    // REQ 6: Gestión dinámica del tiempo (v7.5)
    // Proporcional a longitud: Base 2s + 0.8s por carácter
    const baseTime = 2.0;
    const initialSecPerChar = 0.8;

    // Reducción de tiempo por desempeño (máximo 0.4s de mejora)
    const improvement = Math.min(0.4, (wordsCorrectInCurrentDifficulty * 0.02));
    const currentSecPerChar = Math.max(0.3, initialSecPerChar - improvement);

    let calculatedTime = baseTime + (currentWord.word.length * currentSecPerChar);

    // Ajuste por nivel de dificultad
    const difficultyFactor = [1.2, 1.0, 0.8, 0.7][currentDifficultyLevel];
    calculatedTime *= difficultyFactor;

    currentWord.timeLimit = parseFloat(Math.max(3, calculatedTime).toFixed(2));
    timeRemainingSeconds = currentWord.timeLimit;

    if (currentWordDisplay) currentWordDisplay.textContent = currentWord.word;
    questionStartTime = Date.now();
    responseChanges = 0;
    if (specialCharHint) {
        if (currentWord.type === "special" || currentWord.type === "shortcut") {
            specialCharHint.textContent = `Pista: ${currentWord.hint}`;
            specialCharHint.classList.remove('hidden');
            // Para atajos, limpiar el input y deshabilitar para que solo keydown lo maneje
            if (wordInput) {
                wordInput.value = '';
                wordInput.disabled = true; // Deshabilitar input para atajos
            }
        } else {
            specialCharHint.classList.add('hidden');
            // Para palabras normales, asegurar que el input esté habilitado
            if (wordInput) {
                wordInput.disabled = false; // Habilitar input para palabras normales
            }
        }
    }
    if (wordInput) {
        wordInput.value = ''; // Limpiar el input
        wordInput.focus(); // Asegurar que el input esté enfocado
        wordInput.classList.remove('border-success', 'border-error'); // Limpiar clases de feedback
    }
    if (currentWordDisplay && currentWordDisplay.parentElement) {
        currentWordDisplay.parentElement.classList.remove('border-success', 'border-error'); // Limpiar clases de feedback
    }

    updateTimeBar();
    startTimer();
}

// Inicia el temporizador de la palabra actual
function startTimer() {
    clearInterval(gameTimerInterval); // Detener cualquier temporizador existente
    // timeRemainingSeconds ya se inicializa en loadNewWord

    gameTimerInterval = setInterval(() => {
        timeRemainingSeconds -= (UPDATE_INTERVAL_MS / 1000); // Decrementar por la fracción de segundo
        updateTimeBar();

        if (timeRemainingSeconds <= 0) {
            clearInterval(gameTimerInterval);
            handleIncorrectInputLogic(); // Si el tiempo se acaba, cuenta como error

                    if (wordInput) wordInput.disabled = true;
                    if (currentWordDisplay && currentWordDisplay.parentElement) {
                        currentWordDisplay.parentElement.classList.add('border-error');
                    }

                    // REQ 6: Feedback por tiempo agotado (Incorrecto)
                    const errTimeT = Math.min(3000, 2000 + (currentWord.word.length * 50));
                    setTimeout(() => {
                        wordIndex++;
                        loadNewWord();
                    }, errTimeT);
        }
    }, UPDATE_INTERVAL_MS);
}

// Maneja la entrada del usuario para palabras normales y caracteres especiales (no atajos)
function handleInput() {
    // Si el input está deshabilitado o el juego no está activo, ignorar cualquier entrada
    // También ignorar si la palabra actual es un atajo (manejo por keydown)
    if (!gameActive || (wordInput && wordInput.disabled) || currentWord.type === "shortcut") {
        console.log("handleInput: Game not active, input disabled, or current word is a shortcut. Returning."); // Log de depuración
        return;
    }

    const inputText = wordInput.value;
    const targetWord = currentWord.word;

    // Convertir ambos a minúsculas para la comparación general
    const inputLower = inputText.toLowerCase();
    const targetLower = targetWord.toLowerCase();

    // Normalizar ambos a minúsculas y sin acentos para la comparación tolerante a acentos
    const normalizedInputText = normalizeString(inputText);
    const normalizedTargetWord = normalizeString(targetWord);

    // Limpiar clases de feedback anteriores para una transición suave
    wordInput.classList.remove('border-success', 'border-error');
    if (currentWordDisplay && currentWordDisplay.parentElement) {
        currentWordDisplay.parentElement.classList.remove('border-success', 'border-error');
    }

    // Caso 1: La entrada es más larga que la palabra objetivo (error fundamental)
    if (inputText.length > targetWord.length) {
        wordInput.classList.add('border-error');
        if (currentWordDisplay && currentWordDisplay.parentElement) {
            currentWordDisplay.parentElement.classList.add('border-error');
        }
        handleIncorrectInputLogic(); // Incrementa contadores de error

        // REQ 6: Retroalimentación por error (2-3s)
        wordInput.disabled = true;
        const errTime = Math.min(3000, 2000 + (currentWord.word.length * 50));
        setTimeout(() => {
            wordIndex++;
            loadNewWord();
        }, errTime);
        return;
    }

    // Caso 2: La entrada actual (normalizada y en minúsculas) no coincide con el prefijo de la palabra objetivo (normalizada y en minúsculas)
    // Esto captura errores de tecleo fundamentales.
    let isPartialMatch = true;
    for (let i = 0; i < inputText.length; i++) {
        // Compara los caracteres normalizados y en minúsculas
        if (normalizeString(inputText[i]) !== normalizeString(targetWord[i])) {
            isPartialMatch = false;
            break;
        }
    }

    if (!isPartialMatch) {
        // Si no es un prefijo válido (incluso ignorando acentos y caso), es un error de tecleo
        wordInput.classList.add('border-error');
        if (currentWordDisplay && currentWordDisplay.parentElement) {
            currentWordDisplay.parentElement.classList.add('border-error');
        }
        handleIncorrectInputLogic(); // Incrementa contadores de error

        // REQ 6: Retroalimentación por error (2-3s)
        wordInput.disabled = true;
        const errTime = Math.min(3000, 2000 + (currentWord.word.length * 50));
        setTimeout(() => {
            wordIndex++;
            loadNewWord();
        }, errTime);
        return;
    }

    // Si llegamos aquí, es un prefijo válido (o una palabra completa con o sin acento)
    // Aplicar feedback visual de que se está escribiendo correctamente hasta ahora.
    wordInput.classList.add('border-success');
    if (currentWordDisplay && currentWordDisplay.parentElement) {
        currentWordDisplay.parentElement.classList.add('border-success');
    }

    // Caso 3: La longitud de la entrada coincide con la longitud de la palabra objetivo
    if (inputText.length === targetWord.length) {
        const responseTime = Date.now() - questionStartTime;
        const difficultyName = ['Básico', 'Intermedio', 'Avanzado', 'Especial'][currentDifficultyLevel];
        const isCorrectFinal = inputText === targetWord || inputLower === targetLower;

        // Captura de Analítica Unificada (Fase 5)
        if (window.GamesAdapter) {
            totalXP += window.GamesAdapter.calculateXP(isCorrectFinal, difficultyName, responseTime, 'destreza');

            GamesAdapter.recordAction({
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

        // REQ 6: Retroalimentación diferenciada
        wordInput.disabled = true;
        const feedbackTime = isCorrectFinal ? 800 : Math.min(3000, 2000 + (currentWord.word.length * 50));
        setTimeout(() => {
            wordIndex++;
            loadNewWord();
        }, feedbackTime);
    }
    // Si la entrada es una palabra parcial válida, no hacemos nada más aquí,
    // el usuario sigue escribiendo y el temporizador sigue corriendo.
}

// Maneja la entrada del usuario para atajos de teclado (keydown)
function handleKeyDown(event) {
    // Solo procesar si el juego está activo y la palabra actual es un atajo
    if (!gameActive || currentWord.type !== "shortcut") {
        return;
    }

    // Prevenir el comportamiento predeterminado del navegador para los atajos
    // Esto es crucial para que el navegador no realice su acción por defecto (ej. Alt+Tab)
    event.preventDefault();

    let pressedShortcut = '';
    if (event.ctrlKey) pressedShortcut += 'CTRL+';
    if (event.altKey) pressedShortcut += 'ALT+';
    if (event.shiftKey) pressedShortcut += 'SHIFT+';
    // Para la tecla "Windows" o "Command" (Meta key)
    if (event.metaKey) pressedShortcut += 'WIN+';

    // Mapear event.key a los nombres de atajo que usamos
    let mainKey = event.key.toUpperCase();
    // Casos especiales para teclas que tienen nombres diferentes en event.key vs. el nombre común
    if (mainKey === ' ') mainKey = 'SPACE'; // Para la barra espaciadora si fuera un atajo
    if (mainKey === 'ARROWUP') mainKey = 'UP';
    if (mainKey === 'ARROWDOWN') mainKey = 'DOWN';
    if (mainKey === 'ARROWLEFT') mainKey = 'LEFT';
    if (mainKey === 'ARROWRIGHT') mainKey = 'RIGHT';
    if (mainKey === 'DELETE') mainKey = 'SUPR'; // Mapear 'Delete' a 'Supr'

    // Añadir la tecla principal si no es solo un modificador
    // Evitar añadir modificadores solos como la "tecla principal" (ej. si solo presionas Ctrl, no queremos "CTRL+CONTROL")
    if (!['CONTROL', 'ALT', 'SHIFT', 'META'].includes(mainKey)) {
        pressedShortcut += mainKey;
    } else if (pressedShortcut.endsWith('+')) {
        // Si solo se presionó un modificador y no hay otra tecla, quitar el '+' final
        // Esto es para que si solo presionas Ctrl, el string sea "CTRL" y no "CTRL+"
        pressedShortcut = pressedShortcut.slice(0, -1);
    }

    // Normalizar el atajo presionado para la comparación
    const normalizedPressed = normalizeShortcut(pressedShortcut);
    const normalizedTarget = normalizeShortcut(currentWord.word);

    console.log(`Pressed: ${pressedShortcut} (Normalized: ${normalizedPressed}), Target: ${currentWord.word} (Normalized: ${normalizedTarget})`);

    const responseTime = Date.now() - questionStartTime;
    const isCorrectShort = normalizedPressed === normalizedTarget;

    // Captura Analítica
    if (window.GamesAdapter) {
        const difficultyName = ['Básico', 'Intermedio', 'Avanzado', 'Especial'][currentDifficultyLevel];
        totalXP += window.GamesAdapter.calculateXP(isCorrectShort, difficultyName, responseTime, 'destreza');

        GamesAdapter.recordAction({
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

    // Comparar el atajo presionado con la palabra objetivo
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

    // REQ 6: Retroalimentación diferenciada
    const feedbackTimeShort = isCorrectShort ? 800 : Math.min(3000, 2000 + (currentWord.word.length * 50));
    setTimeout(() => {
        wordIndex++;
        loadNewWord();
    }, feedbackTimeShort);
}


// Lógica para manejar una entrada correcta (actualiza contadores)
function handleCorrectInputLogic() {
    if (!gameActive) {
        console.log("handleCorrectInputLogic: Game not active, skipping update."); // Log de depuración
        return; // No actualizar si el juego no está activo
    }
    correctWordsCount++; // Siempre acumulativo
    wordsCorrectInCurrentDifficulty++; // Solo para el ajuste de tiempo en el nivel actual

    // (Req 6.2) Sumar teclas correctas (incluyendo espacios si existieran)
    const wordLen = currentWord.word.length;
    correctKeys += wordLen;
    totalKeys += wordLen;

    consecutiveErrors = 0; // Reiniciar errores consecutivos
    if (correctWordsDisplay) correctWordsDisplay.textContent = correctWordsCount;
    // totalErrorsDisplay no se actualiza aquí, solo en handleIncorrectInputLogic y resetGame
    if (totalErrorsDisplay) totalErrorsDisplay.textContent = totalErrors; // Asegurarse de que se mantenga actualizado si no hay error
    console.log(`Correct word! Correct count: ${correctWordsCount}, Consecutive errors: ${consecutiveErrors}`); // Log de depuración
    // El feedback visual se maneja en handleInput o handleKeyDown
}

// Lógica para manejar una entrada incorrecta (actualiza contadores)
function handleIncorrectInputLogic() {
    if (!gameActive) {
        console.log("handleIncorrectInputLogic: Game not active, skipping update."); // Log de depuración
        return; // No actualizar si el juego no está activo
    }
    totalErrors++; // Siempre acumulativo

    // (Req 6.2) Sumar teclas erradas (aproximado por palabra fallida)
    totalKeys += currentWord.word.length;

    // REQ 3: Penalización XP por error (v7.5)
    if (window.GamesAdapter && window.GamesAdapter.calculateXP) {
        window.GamesAdapter.calculateXP(false);
    }

    consecutiveErrors++;
    if (totalErrorsDisplay) totalErrorsDisplay.textContent = totalErrors; // Actualizar display de errores totales
    if (correctWordsDisplay) correctWordsDisplay.textContent = correctWordsCount; // Asegurarse de que se mantenga actualizado
    console.log(`Incorrect word! Total errors: ${totalErrors}, Consecutive errors: ${consecutiveErrors}`); // Log de depuración

    // El feedback visual se maneja en handleInput o handleKeyDown

    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.log("Max consecutive errors reached. Ending game."); // Log de depuración
        endGame();
    }
}

// Termina el juego y muestra los resultados
function endGame() {
    if (!gameActive) {
        console.log("endGame called but game is already inactive. Returning."); // Log de depuración
        return; // Evitar llamadas múltiples
    }
    gameActive = false; // El juego ya no está activo
    clearInterval(gameTimerInterval); // Detener el temporizador
    console.log("Game ended. Finalizing scores. Timer cleared, input disabled."); // Log de depuración
    if (wordInput) {
        wordInput.disabled = true; // Deshabilitar el input para evitar más errores
        wordInput.value = ''; // Limpiar el texto
        wordInput.classList.remove('border-success', 'border-error'); // Limpiar feedback final
    }
    if (currentWordDisplay && currentWordDisplay.parentElement) {
        currentWordDisplay.parentElement.classList.remove('border-success', 'border-error'); // Limpiar feedback final
    }
    showScreen('game-result-screen');

    if (finalCorrectWords) finalCorrectWords.textContent = correctWordsCount;
    if (finalErrors) finalErrors.textContent = totalErrors;

    // (Req 6.2) Cálculos de Precisión y Puntaje Ponderado
    const wpm = calculateWPM();
    const precision = totalKeys > 0 ? Math.round((correctKeys / totalKeys) * 100) : 0;
    const finalScoreValue = Math.round((wpm * 0.6) + (precision * 0.4) + (correctWordsCount * 2));

    if (finalWPM) finalWPM.textContent = `${wpm} WPM | ${precision}% Precisión | ${totalXP} XP`;

    // Actualizar visualmente el puntaje si existe un elemento
    const scoreTitle = gameResultScreen.querySelector('h3');
    if (scoreTitle) scoreTitle.textContent = `¡Juego Terminado! Puntaje: ${finalScoreValue}`;

    // Integración con GamesAdapter (Sincronización Silenciosa)
    if (window.GamesAdapter) {
        GamesAdapter.finishSession('Ofimática I', ['Básico', 'Intermedio', 'Avanzado', 'Especial'][currentDifficultyLevel], finalScoreValue, totalXP);
    }

    console.log(`Final Correct Words: ${correctWordsCount}`); // Log de depuración
    console.log(`Final Errors: ${totalErrors}`); // Log de depuración
    console.log(`Final WPM: ${wpm}`); // Log de depuración
}

// Sale del juego y regresa al menú principal de actividades
function exitGame() {
    gameActive = false; // Asegurarse de que el juego esté inactivo al salir
    clearInterval(gameTimerInterval);
    if (window.returnToMainContent) {
        window.returnToMainContent();
    } else {
        console.warn("window.returnToMainContent not found. Cannot return to main content.");
        showScreen('game-start-menu'); // Fallback to game start menu
    }
}

// La inicialización de este juego ahora se maneja directamente desde index.html
// a través de la función window.initDexterityGame() que se llama en el script.onload
// del script cargado dinámicamente.
// No se necesita document.addEventListener('DOMContentLoaded') aquí.
