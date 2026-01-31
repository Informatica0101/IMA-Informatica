// Data for the peripherals game
const peripherals = [
    { name: "Teclado", image: "imagenes/teclado.png", correctType: "entrada", description: "Dispositivo para introducir datos y comandos." },
    { name: "Monitor", image: "imagenes/monitor.png", correctType: "salida", description: "Muestra información visualmente al usuario." },
    { name: "Impresora", image: "imagenes/impresora.png", correctType: "salida", description: "Produce copias físicas de documentos e imágenes." },
    { name: "Ratón", image: "imagenes/raton.png", correctType: "entrada", description: "Permite la interacción con la interfaz gráfica de usuario." },
    { name: "Micrófono", image: "imagenes/microfono.png", correctType: "entrada", description: "Captura sonido para grabar o transmitir." },
    { name: "Altavoces", image: "imagenes/altavoces.png", correctType: "salida", description: "Reproducen audio." },
    { name: "Cámara Web", image: "imagenes/camara_web.png", correctType: "entrada", description: "Captura imágenes y video en tiempo real." },
    { name: "Disco Duro Externo", image: "imagenes/disco_duro_externo.png", correctType: "almacenamiento", description: "Unidad de almacenamiento portátil de gran capacidad." },
    { name: "Pendrive USB", image: "imagenes/pendrive.png", correctType: "almacenamiento", description: "Dispositivo de almacenamiento de datos portátil y pequeño." },
    { name: "Router", image: "imagenes/router.png", correctType: "ambos", description: "Dispositivo que envía y recibe datos en una red." },
    { name: "Auriculares con Micrófono", image: "imagenes/auriculares_con_microfono.png", correctType: "ambos", description: "Permiten escuchar audio y grabar voz." },
    { name: "Escáner", image: "imagenes/escaner.png", correctType: "entrada", description: "Digitaliza documentos e imágenes físicas." },
    { name: "Proyector", image: "imagenes/proyector.png", correctType: "salida", description: "Muestra imágenes y videos en una superficie grande." },
    { name: "Gamepad", image: "imagenes/gamepad.png", correctType: "entrada", description: "Controlador para videojuegos." },
    { name: "Tableta Gráfica", image: "imagenes/tableta_grafica.png", correctType: "entrada", description: "Permite dibujar y escribir digitalmente." },
    { name: "Memoria RAM", image: "imagenes/memoria_ram.png", correctType: "almacenamiento", description: "Almacenamiento temporal de datos para acceso rápido." },
    { name: "SSD", image: "imagenes/ssd.png", correctType: "almacenamiento", description: "Unidad de estado sólido para almacenamiento rápido." },
    { name: "Pantalla Táctil", image: "imagenes/pantalla_tactil.png", correctType: "ambos", description: "Permite entrada de datos y muestra información." },
    { name: "Lápiz Óptico", image: "imagenes/lapiz_optico.png", correctType: "entrada", description: "Permite dibujar o seleccionar en pantallas." },
    { name: "Plotter", image: "imagenes/plotter.png", correctType: "salida", description: "Impresora de gran formato para dibujos técnicos." }
];

let shuffledPeripherals = [];
let currentPeripheralIndex = 0;
let score = 0;
let errors = 0;
let timerInterval;
let startTime;
let gameStarted = false;
let answerBlocked = false; // To prevent multiple clicks on answer buttons for a single question

// DOM Elements for Game - These will be assigned inside initializePeripheralsGame
let startMenu;
let startGameButton;
let gamePlayArea;
let timerDisplay;
let scoreDisplay;
let peripheralCard;
let peripheralImage;
let peripheralName;
let peripheralDescription;
let answerButtons; // NodeList, will be re-queried
let endGameButton;
let resultScreen;
let correctAnswersDisplay;
let incorrectAnswersDisplay;
let finalTimeDisplay;
let totalAttemptsDisplay; // Total Attempts display
let bestScoreDisplay;     // Best Score display
let gameHistoryList;      // Game History List

let localGameStorage; // Variable to hold the gameDataStorage object passed from index.html

// Function to initialize DOM elements and attach event listeners
// This function now accepts the gameDataStorage object
function initializePeripheralsGame(gameDataStorage) {
    localGameStorage = gameDataStorage; // Store the passed object

    // Use a setTimeout to ensure all DOM elements are parsed and available
    // before attempting to get their references and attach listeners.
    setTimeout(() => {
        // Assign DOM elements AFTER the HTML is loaded into the container
        startMenu = document.getElementById('start-menu');
        startGameButton = document.getElementById('start-game-button');
        gamePlayArea = document.getElementById('game-play-area');
        timerDisplay = document.getElementById('timer');
        scoreDisplay = document.getElementById('score-display');
        peripheralCard = document.getElementById('peripheral-card');
        peripheralImage = document.getElementById('peripheral-image');
        peripheralName = document.getElementById('peripheral-name');
        peripheralDescription = document.getElementById('peripheral-description');
        answerButtons = document.querySelectorAll('.answer-button'); // Re-query
        endGameButton = document.getElementById('end-game-button');
        resultScreen = document.getElementById('result-screen');
        correctAnswersDisplay = document.getElementById('correct-answers');
        incorrectAnswersDisplay = document.getElementById('incorrect-answers');
        finalTimeDisplay = document.getElementById('final-time');
        totalAttemptsDisplay = document.getElementById('total-attempts'); 
        bestScoreDisplay = document.getElementById('best-score');         
        gameHistoryList = document.getElementById('game-history-list');   

        // Console log to confirm initialization and element finding
        console.log("initializePeripheralsGame: Elementos DOM inicializados.");
        if (!startMenu || !startGameButton || !correctAnswersDisplay || !totalAttemptsDisplay) {
            console.error("initializePeripheralsGame: ¡ERROR! No se encontraron todos los elementos DOM esperados. Esto podría causar errores.");
        }

        // Attach Event Listeners - MOVED INSIDE THIS setTimeout
        if (startGameButton) startGameButton.addEventListener('click', startGame);
        if (endGameButton) endGameButton.addEventListener('click', endGame);
        // Ensure retryGameButton is not null before attaching listener
        const retryGameButton = document.getElementById('retry-game-button'); // Re-get inside here
        if (retryGameButton) retryGameButton.addEventListener('click', resetGame);
        
        // Simplified exit logic: reset game state and then return to main content
        const exitGameButton = document.getElementById('exit-game-button'); // Re-get inside here
        if (exitGameButton) {
            exitGameButton.addEventListener('click', () => {
                resetGame(); // Ensure game state is reset
                if (window.returnToMainContent) {
                    window.returnToMainContent();
                }
            });
        }

        if (answerButtons) {
            answerButtons.forEach(button => {
                button.addEventListener('click', () => {
                    checkAnswer(button.dataset.type);
                });
            });
        }

        // Initial state for the game, now that elements are guaranteed to be ready
        resetGame();

    }, 200); // 200ms delay to ensure DOM is fully ready
}


// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function updateTimer() {
    if (timerDisplay) { // Add check here too, though less likely to be null after init
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        timerDisplay.textContent = formatTime(elapsedTime);
    }
}

function displayPeripheral() {
    if (currentPeripheralIndex < shuffledPeripherals.length) {
        const peripheral = shuffledPeripherals[currentPeripheralIndex];
        if (peripheralName) peripheralName.textContent = peripheral.name;
        if (peripheralDescription) peripheralDescription.textContent = peripheral.description;
        if (peripheral.image && peripheralImage) {
            peripheralImage.src = peripheral.image;
            peripheralImage.classList.remove('hidden');
            // Fallback for image loading errors
            peripheralImage.onerror = function() {
                this.src = `https://placehold.co/200x200/cccccc/000000?text=${encodeURIComponent(peripheral.name)}`;
            };
        } else if (peripheralImage) {
            peripheralImage.classList.add('hidden');
        }
        if (peripheralCard) peripheralCard.classList.remove('border-green-500', 'border-red-500'); // Reset border color
        
        // Ensure answerButtons is not null before iterating
        if (answerButtons) {
            answerButtons.forEach(button => {
                button.disabled = false; // Enable buttons
                button.classList.remove('opacity-50', 'bg-green-700', 'bg-red-700', 'bg-purple-700', 'bg-blue-700'); // Reset button styles
                button.classList.add(
                    button.dataset.type === 'entrada' ? 'bg-blue-500' :
                    button.dataset.type === 'salida' ? 'bg-red-500' :
                    button.dataset.type === 'ambos' ? 'bg-purple-500' : 'bg-green-500'
                );
                button.classList.add(
                    button.dataset.type === 'entrada' ? 'hover:bg-blue-600' :
                    button.dataset.type === 'salida' ? 'hover:bg-red-600' :
                    button.dataset.type === 'ambos' ? 'hover:bg-purple-600' : 'hover:bg-green-600'
                );
            });
        }
        answerBlocked = false; // Allow answering for the new peripheral
    } else {
        endGame(); // End game if no more peripherals
    }
}

function checkAnswer(selectedType) {
    if (answerBlocked) return; // Prevent multiple answers for the same question
    answerBlocked = true;

    const peripheral = shuffledPeripherals[currentPeripheralIndex];
    const correctType = peripheral.correctType;
    const selectedButton = document.querySelector(`.answer-button[data-type="${selectedType}"]`);

    if (answerButtons) answerButtons.forEach(button => button.disabled = true); // Disable all answer buttons immediately

    if (selectedType === correctType) {
        score++;
        if (peripheralCard) peripheralCard.classList.add('border-green-500');
        if (selectedButton) {
            selectedButton.classList.remove(
                selectedButton.dataset.type === 'entrada' ? 'bg-blue-500' :
                selectedButton.dataset.type === 'salida' ? 'bg-red-500' :
                selectedButton.dataset.type === 'ambos' ? 'bg-purple-500' : 'bg-green-500'
            );
            selectedButton.classList.add('bg-green-700');
        }
    } else {
        errors++;
        score--; // Deduct a point for incorrect answer
        if (peripheralCard) peripheralCard.classList.add('border-red-500');
        if (selectedButton) {
            selectedButton.classList.remove(
                selectedButton.dataset.type === 'entrada' ? 'bg-blue-500' :
                selectedButton.dataset.type === 'salida' ? 'bg-red-500' :
                selectedButton.dataset.type === 'ambos' ? 'bg-purple-500' : 'bg-green-500'
            );
            selectedButton.classList.add('bg-red-700');
        }
        // Highlight the correct answer
        const correctAnswerButton = document.querySelector(`.answer-button[data-type="${correctType}"]`);
        if (correctAnswerButton) {
            correctAnswerButton.classList.remove(
                correctAnswerButton.dataset.type === 'entrada' ? 'bg-blue-500' :
                correctAnswerButton.dataset.type === 'salida' ? 'bg-red-500' :
                correctAnswerButton.dataset.type === 'ambos' ? 'bg-purple-500' : 'bg-green-500'
            );
            correctAnswerButton.classList.add('bg-green-700'); // Or a distinct highlight color
        }
    }
    if (scoreDisplay) scoreDisplay.textContent = score;

    // Auto-advance to the next peripheral after a shorter delay
    setTimeout(() => {
        currentPeripheralIndex++;
        if (currentPeripheralIndex < shuffledPeripherals.length) {
            displayPeripheral();
        } else {
            endGame();
        }
    }, 800); // Reduced delay to 800ms (0.8 seconds)
}

function startGame() {
    if (startMenu) startMenu.classList.add('hidden');
    if (startMenu) startMenu.classList.remove('flex'); // Ensure flex is removed
    if (gamePlayArea) gamePlayArea.classList.remove('hidden');
    if (gamePlayArea) gamePlayArea.classList.add('flex');
    if (resultScreen) resultScreen.classList.add('hidden');
    if (resultScreen) resultScreen.classList.remove('flex'); // Ensure flex is removed

    shuffledPeripherals = shuffleArray([...peripherals]); // Create a shuffled copy
    currentPeripheralIndex = 0;
    score = 0;
    errors = 0;
    if (scoreDisplay) scoreDisplay.textContent = score;
    if (timerDisplay) timerDisplay.textContent = '00:00'; // Reset timer display
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    gameStarted = true;
    displayPeripheral();
}

function endGame() {
    clearInterval(timerInterval);
    gameStarted = false;

    if (gamePlayArea) gamePlayArea.classList.add('hidden');
    if (gamePlayArea) gamePlayArea.classList.remove('flex');
    if (resultScreen) resultScreen.classList.remove('hidden');
    if (resultScreen) resultScreen.classList.add('flex');

    const finalTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const sessionData = {
        score: score,
        errors: errors,
        time: formatTime(finalTimeSeconds),
        timestamp: new Date().toISOString() // ISO string for easy sorting and display
    };

    // Console log to verify values before display
    console.log(`endGame: Puntuación final: ${score}, Errores finales: ${errors}, Tiempo final: ${formatTime(finalTimeSeconds)}`);

    // Save the current game session
    if (localGameStorage) {
        localGameStorage.saveGameSession('peripheralsGame', sessionData);
        // Update display with aggregated stats
        if (totalAttemptsDisplay) totalAttemptsDisplay.textContent = localGameStorage.getTotalAttempts('peripheralsGame');
        if (bestScoreDisplay) bestScoreDisplay.textContent = localGameStorage.getBestScore('peripheralsGame');
        
        // Display recent history
        const history = localGameStorage.getGameHistory('peripheralsGame').slice(-5).reverse(); // Last 5, most recent first
        if (gameHistoryList) {
            gameHistoryList.innerHTML = ''; // Clear previous history
            if (history.length > 0) {
                history.forEach((session, index) => {
                    const listItem = document.createElement('li');
                    listItem.className = 'text-sm text-gray-600 mb-1';
                    const date = new Date(session.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    const time = new Date(session.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                    listItem.textContent = `Intento ${history.length - index}: Puntos: ${session.score}, Errores: ${session.errors}, Tiempo: ${session.time} (${date} ${time})`;
                    gameHistoryList.appendChild(listItem);
                });
            } else {
                gameHistoryList.innerHTML = '<li class="text-sm text-gray-500">No hay historial de juegos.</li>';
            }
        }
    }


    if (correctAnswersDisplay) correctAnswersDisplay.textContent = score;
    if (incorrectAnswersDisplay) incorrectAnswersDisplay.textContent = errors;
    if (finalTimeDisplay) finalTimeDisplay.textContent = timerDisplay.textContent;
}

function resetGame() {
    if (startMenu) startMenu.classList.remove('hidden');
    if (startMenu) startMenu.classList.add('flex');
    if (gamePlayArea) gamePlayArea.classList.add('hidden');
    if (gamePlayArea) gamePlayArea.classList.remove('flex');
    if (resultScreen) resultScreen.classList.add('hidden');
    if (resultScreen) resultScreen.classList.remove('flex');
    if (timerDisplay) timerDisplay.textContent = '00:00';
    if (peripheralCard) peripheralCard.classList.remove('border-green-500', 'border-red-500'); // Reset border color
    clearInterval(timerInterval); // Ensure timer is stopped

    // Update initial stats display
    if (localGameStorage) {
        if (totalAttemptsDisplay) totalAttemptsDisplay.textContent = localGameStorage.getTotalAttempts('peripheralsGame');
        if (bestScoreDisplay) bestScoreDisplay.textContent = localGameStorage.getBestScore('peripheralsGame');
        if (gameHistoryList) gameHistoryList.innerHTML = '<li class="text-sm text-gray-500">No hay historial de juegos.</li>'; // Clear history on reset
    }
    // Also reset correct/incorrect answers display on reset
    if (correctAnswersDisplay) correctAnswersDisplay.textContent = 0;
    if (incorrectAnswersDisplay) incorrectAnswersDisplay.textContent = 0;
    if (finalTimeDisplay) finalTimeDisplay.textContent = '00:00';
}

// Expose initializePeripheralsGame to the global scope so index.html can call it
window.initializePeripheralsGame = initializePeripheralsGame;
