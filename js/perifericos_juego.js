(function(app) {
    "use strict";

    // Data for the peripherals game
    var peripherals = [
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

    var shuffledPeripherals = [];
    var currentPeripheralIndex = 0;
    var score = 0;
    var errors = 0;
    var timerInterval;
    var startTime;
    var gameStarted = false;
    var questionStartTime = 0;
    var responseChanges = 0;
    var answerBlocked = false;

    var startMenu;
    var startGameButton;
    var gamePlayArea;
    var timerDisplay;
    var scoreDisplay;
    var peripheralCard;
    var peripheralImage;
    var peripheralName;
    var peripheralDescription;
    var answerButtons;
    var endGameButton;
    var resultScreen;
    var correctAnswersDisplay;
    var incorrectAnswersDisplay;
    var finalTimeDisplay;
    var totalAttemptsDisplay;
    var bestScoreDisplay;
    var gameHistoryList;

    var localGameStorage;

    app.initializePeripheralsGame = function(gameDataStorage) {
        var user = JSON.parse(localStorage.getItem('currentUser'));
        var isGuest = !user;

        return app.GamesAdapter.init('perifericos').then(function(res) {
            var lb = res.lb;
            var record = res.record;

            var miniLb = document.getElementById('mini-leaderboard');
            if (miniLb && lb && lb.global) {
                var lbHtml = "";
                var topPlayers = lb.global.slice(0, 3);
                for (var i = 0; i < topPlayers.length; i++) {
                    var u = topPlayers[i];
                    lbHtml += '<div class="flex items-center justify-between text-[10px] font-bold">' +
                        '<span class="text-indigo-700">' + (i + 1) + '. ' + u.nombre.split(' ')[0] + '</span>' +
                        '<span class="text-indigo-500">' + u.promedio + '%</span>' +
                        '</div>';
                }
                miniLb.innerHTML = lbHtml;
            }

            var myRecord = record ? record["Juego de Periféricos"] : JSON.parse(localStorage.getItem('guest_record_perifericos') || 'null');
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

            localGameStorage = gameDataStorage;

            setTimeout(function() {
                startMenu = document.getElementById('start-menu');
                startGameButton = document.getElementById('start-game-button');
                gamePlayArea = document.getElementById('game-play-area');
                timerDisplay = document.getElementById('timer');
                scoreDisplay = document.getElementById('score-display');
                peripheralCard = document.getElementById('peripheral-card');
                peripheralImage = document.getElementById('peripheral-image');
                peripheralName = document.getElementById('peripheral-name');
                peripheralDescription = document.getElementById('peripheral-description');
                answerButtons = document.querySelectorAll('.answer-button');
                endGameButton = document.getElementById('end-game-button');
                resultScreen = document.getElementById('result-screen');
                correctAnswersDisplay = document.getElementById('correct-answers');
                incorrectAnswersDisplay = document.getElementById('incorrect-answers');
                finalTimeDisplay = document.getElementById('final-time');
                totalAttemptsDisplay = document.getElementById('total-attempts');
                bestScoreDisplay = document.getElementById('best-score');
                gameHistoryList = document.getElementById('game-history-list');

                console.log("initializePeripheralsGame: Elementos DOM inicializados.");
                if (app.GamesAdapter) app.GamesAdapter.showLoading(false);

                if (startGameButton) {
                    startGameButton.addEventListener('click', function() {
                        if (document.documentElement.requestFullscreen) {
                            document.documentElement.requestFullscreen()["catch"](function(e) { console.warn("FS failed", e); });
                        }
                        if (app.requestWakeLock) app.requestWakeLock();
                        startGame();
                    });
                }
                if (endGameButton) endGameButton.addEventListener('click', endGame);
                var retryBtn = document.getElementById('retry-game-button');
                if (retryBtn) retryBtn.addEventListener('click', resetGame);

                var exitBtn = document.getElementById('exit-game-button');
                if (exitBtn) {
                    exitBtn.addEventListener('click', function() {
                        resetGame();
                        if (app.returnToMainContent) {
                            app.returnToMainContent();
                        }
                    });
                }

                if (answerButtons) {
                    for (var j = 0; j < answerButtons.length; j++) {
                        (function(btn) {
                            btn.addEventListener('click', function() {
                                checkAnswer(btn.dataset.type);
                            });
                        })(answerButtons[j]);
                    }
                }

                resetGame();

                var handleAbandonment = function() {
                    if (gamePlayArea && !gamePlayArea.classList.contains('hidden')) {
                        location.reload();
                    }
                };
                window.addEventListener('blur', handleAbandonment);
                document.addEventListener('visibilitychange', function() {
                    if (document.visibilityState === 'hidden') handleAbandonment();
                });

            }, 200);
        });
    };

    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    function formatTime(seconds) {
        var minutes = Math.floor(seconds / 60);
        var remainingSeconds = seconds % 60;
        return (minutes < 10 ? '0' : '') + minutes + ":" + (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
    }

    function updateTimer() {
        if (timerDisplay) {
            var elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            timerDisplay.textContent = formatTime(elapsedTime);
        }
    }

    function displayPeripheral() {
        if (currentPeripheralIndex < shuffledPeripherals.length) {
            var peripheral = shuffledPeripherals[currentPeripheralIndex];
            if (peripheralName) peripheralName.textContent = peripheral.name;
            if (peripheralDescription) peripheralDescription.textContent = peripheral.description;
            questionStartTime = Date.now();
            responseChanges = 0;
            if (peripheral.image && peripheralImage) {
                peripheralImage.src = peripheral.image;
                peripheralImage.classList.remove('hidden');
                peripheralImage.onerror = function() {
                    this.src = "https://placehold.co/200x200/cccccc/000000?text=" + encodeURIComponent(peripheral.name);
                };
            } else if (peripheralImage) {
                peripheralImage.classList.add('hidden');
            }
            if (peripheralCard) peripheralCard.classList.remove('border-green-500', 'border-red-500');

            if (answerButtons) {
                for (var i = 0; i < answerButtons.length; i++) {
                    var button = answerButtons[i];
                    button.disabled = false;
                    button.classList.remove('opacity-50', 'bg-green-700', 'bg-red-700', 'bg-purple-700', 'bg-blue-700');
                    var type = button.dataset.type;
                    button.classList.add(
                        type === 'entrada' ? 'bg-blue-500' :
                        type === 'salida' ? 'bg-red-500' :
                        type === 'ambos' ? 'bg-purple-500' : 'bg-green-500'
                    );
                    button.classList.add(
                        type === 'entrada' ? 'hover:bg-blue-600' :
                        type === 'salida' ? 'hover:bg-red-600' :
                        type === 'ambos' ? 'hover:bg-purple-600' : 'hover:bg-green-600'
                    );
                }
            }
            answerBlocked = false;
        } else {
            endGame();
        }
    }

    function checkAnswer(selectedType) {
        var responseTime = Date.now() - questionStartTime;
        if (answerBlocked) return;
        answerBlocked = true;

        var peripheral = shuffledPeripherals[currentPeripheralIndex];
        var correctType = peripheral.correctType;
        var selectedButton = document.querySelector('.answer-button[data-type="' + selectedType + '"]');

        if (answerButtons) {
            for (var i = 0; i < answerButtons.length; i++) {
                answerButtons[i].disabled = true;
            }
        }

        if (app.GamesAdapter) {
            app.GamesAdapter.recordAction({
                asignatura: 'Informática I',
                nivel: 'Básico',
                preguntaId: 'perif_' + peripheral.name,
                tema: 'Hardware',
                respuestaSeleccionada: selectedType,
                respuestaCorrecta: correctType,
                esCorrecta: selectedType === correctType,
                tiempoRespuesta: responseTime,
                cambiosRespuesta: responseChanges
            });
        }

        if (selectedType === correctType) {
            score++;
            if (peripheralCard) peripheralCard.classList.add('border-green-500');
            if (selectedButton) {
                var typeS = selectedButton.dataset.type;
                selectedButton.classList.remove(
                    typeS === 'entrada' ? 'bg-blue-500' :
                    typeS === 'salida' ? 'bg-red-500' :
                    typeS === 'ambos' ? 'bg-purple-500' : 'bg-green-500'
                );
                selectedButton.classList.add('bg-green-700');
            }
        } else {
            errors++;
            score--;
            if (peripheralCard) peripheralCard.classList.add('border-red-500');
            if (selectedButton) {
                var typeF = selectedButton.dataset.type;
                selectedButton.classList.remove(
                    typeF === 'entrada' ? 'bg-blue-500' :
                    typeF === 'salida' ? 'bg-red-500' :
                    typeF === 'ambos' ? 'bg-purple-500' : 'bg-green-500'
                );
                selectedButton.classList.add('bg-red-700');
            }
            var correctAnswerButton = document.querySelector('.answer-button[data-type="' + correctType + '"]');
            if (correctAnswerButton) {
                var typeC = correctAnswerButton.dataset.type;
                correctAnswerButton.classList.remove(
                    typeC === 'entrada' ? 'bg-blue-500' :
                    typeC === 'salida' ? 'bg-red-500' :
                    typeC === 'ambos' ? 'bg-purple-500' : 'bg-green-500'
                );
                correctAnswerButton.classList.add('bg-green-700');
            }
        }
        if (scoreDisplay) scoreDisplay.textContent = score;

        setTimeout(function() {
            currentPeripheralIndex++;
            if (currentPeripheralIndex < shuffledPeripherals.length) {
                displayPeripheral();
            } else {
                endGame();
            }
        }, 800);
    }

    function startGame() {
        if (startMenu) startMenu.classList.add('hidden');
        if (startMenu) startMenu.classList.remove('flex');
        if (gamePlayArea) gamePlayArea.classList.remove('hidden');
        if (gamePlayArea) gamePlayArea.classList.add('flex');
        if (resultScreen) resultScreen.classList.add('hidden');
        if (resultScreen) resultScreen.classList.remove('flex');

        shuffledPeripherals = shuffleArray(peripherals.slice());
        currentPeripheralIndex = 0;
        score = 0;
        errors = 0;
        if (scoreDisplay) scoreDisplay.textContent = score;
        if (timerDisplay) timerDisplay.textContent = '00:00';
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

        var finalTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
        var finalTimeFormatted = formatTime(finalTimeSeconds);

        if (correctAnswersDisplay) correctAnswersDisplay.textContent = score;
        if (incorrectAnswersDisplay) incorrectAnswersDisplay.textContent = errors;
        if (finalTimeDisplay) finalTimeDisplay.textContent = finalTimeFormatted;

        if (app.GamesAdapter) {
            app.GamesAdapter.finishSession('Informática I', 'Básico', score);
        }
    }

    function resetGame() {
        if (startMenu) startMenu.classList.remove('hidden');
        if (startMenu) startMenu.classList.add('flex');
        if (gamePlayArea) gamePlayArea.classList.add('hidden');
        if (gamePlayArea) gamePlayArea.classList.remove('flex');
        if (resultScreen) resultScreen.classList.add('hidden');
        if (resultScreen) resultScreen.classList.remove('flex');
        if (timerDisplay) timerDisplay.textContent = '00:00';
        if (peripheralCard) peripheralCard.classList.remove('border-green-500', 'border-red-500');
        clearInterval(timerInterval);

        if (correctAnswersDisplay) correctAnswersDisplay.textContent = 0;
        if (incorrectAnswersDisplay) incorrectAnswersDisplay.textContent = 0;
        if (finalTimeDisplay) finalTimeDisplay.textContent = '00:00';
    }

})(window.QuizProApp);
