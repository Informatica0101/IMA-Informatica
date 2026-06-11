/**
 * UI Logic for exam.html
 * Transpiled to Strict ES5 for v7.5 Legacy Compatibility
 */

var QuizProApp = window.QuizProApp || {};
(function(app) {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        var examTitleEl = document.getElementById('exam-title');
        var questionsContainer = document.getElementById('questions-container');
        var examForm = document.getElementById('exam-form');
        var timerEl = document.getElementById('timer');

        var examenId = app.getUrlParam('examenId');

        var originalQuestions = [];
        var STORAGE_KEY = 'exam_progress_' + currentUser.userId + '_' + examenId;

        function shuffleArray(array) {
            var arr = [].concat(array);
            for (var i = arr.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
            return arr;
        }

        function loadExam() {
            var startOverlay = document.getElementById('start-exam-overlay');
            var startBtn = document.getElementById('start-exam-btn');
            var timeLimitFromApi = 0;

            if (app.fetchApi) {
                app.fetchApi('EXAM', 'getExamQuestions', {
                    examenId: examenId,
                    userId: currentUser.userId
                }).then(function(result) {
                    if (result.status === 'success') {
                        var data = result.data;
                        examTitleEl.textContent = data.titulo;
                        originalQuestions = data.preguntas;
                        timeLimitFromApi = data.tiempoLimite;

                        renderQuestions(originalQuestions);
                        loadProgress();

                        if (startBtn) {
                            questionsContainer.addEventListener('input', function() { saveProgress(); });

                            startBtn.addEventListener('click', function() {
                                if (startOverlay) {
                                    startOverlay.classList.add('opacity-0', 'pointer-events-none');
var QuizProApp = window.QuizProApp || {};
                                    setTimeout(function(app) { startOverlay.classList.add('hidden'); }, 500);
                                }
                                startTimer(timeLimitFromApi);
                                requestFullscreen();
                            });
                        }
                    } else {
                        alert("Error al cargar examen: " + (result.message || "Desconocido"));
                        window.location.href = 'student-dashboard.html';
                    }
                }).catch(function(err) {
                    console.error("Error loading exam:", err);
                });
            }
        }

        function renderQuestions(questions) {
            if (!questionsContainer) return;
            questionsContainer.innerHTML = '';
            questions.forEach(function(q, idx) {
                var qBlock = createQuestionBlock(q, idx);
                questionsContainer.appendChild(qBlock);
            });
        }

        function createQuestionBlock(question, index) {
            var questionId = question.preguntaId || ('q_' + index);
            var questionType = question.tipo;
            var questionText = question.texto;
            var options = question.opciones || {};

            var div = document.createElement('div');
            div.className = 'question-block mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100';
            div.dataset.questionId = questionId;
            div.dataset.questionType = questionType;

            var html = '<p class="font-bold text-lg text-gray-800 mb-4">' + (index + 1) + '. ' + questionText + '</p>';
            var optionsHtml = '';

            if (questionType === 'opcion_multiple' || questionType === 'verdadero_falso') {
                var keys = Object.keys(options);
                keys.forEach(function(key) {
                    var value = options[key];
                    var inputValue = (questionType === 'verdadero_falso') ? value : key;
                    optionsHtml += '<label class="flex items-center gap-3 p-3 bg-white rounded-xl mb-2 cursor-pointer hover:bg-blue-50 transition-colors border border-gray-100">' +
                        '<input type="radio" name="question_' + questionId + '" value="' + inputValue + '" class="w-5 h-5 text-blue-600">' +
                        '<span class="text-gray-700">' + value + '</span>' +
                        '</label>';
                });
            } else if (questionType === 'completacion') {
                optionsHtml = '<input type="text" name="question_' + questionId + '" class="w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" placeholder="Escribe tu respuesta aquí...">';
            } else if (questionType === 'emparejamiento') {
                var definitions = options.definitions || [];
                var concepts = options.concepts || [];

                var indexedDefinitions = definitions.map(function(def, idx) { return { def: def, idx: idx }; });
                var shuffledDefinitions = shuffleArray(indexedDefinitions);

                var conceptsList = concepts.map(function(concept) {
                    return '<li class="p-2 bg-gray-100 rounded">' + concept + '</li>';
                }).join('');

                var defsList = shuffledDefinitions.map(function(item, i) {
                    return '<div class="flex items-center gap-3 mb-2">' +
                        '<span class="text-sm text-gray-500 w-full">' + item.def + '</span>' +
                        '<input type="text" name="question_' + questionId + '_' + i + '" data-original-index="' + item.idx + '" class="w-24 p-2 rounded-lg border border-gray-200 text-center" placeholder="Concepto">' +
                        '</div>';
                }).join('');

                optionsHtml = '<div class="grid md:grid-cols-2 gap-4">' +
                    '<div><p class="text-xs font-bold uppercase text-gray-400 mb-2">Conceptos Disponibles</p><ul class="space-y-1 text-sm">' + conceptsList + '</ul></div>' +
                    '<div><p class="text-xs font-bold uppercase text-gray-400 mb-2">Definiciones</p>' + defsList + '</div>' +
                    '</div>';
            }

            div.innerHTML = html + '<div class="options-container">' + optionsHtml + '</div>';
            return div;
        }

        function saveProgress() {
            var progress = {};
            var questionBlocks = document.querySelectorAll('.question-block');
            questionBlocks.forEach(function(block) {
                var qId = block.dataset.questionId;
                var qType = block.dataset.questionType;

                if (qType === 'opcion_multiple' || qType === 'verdadero_falso') {
                    var selected = block.querySelector('input[name="question_' + qId + '"]:checked');
                    if (selected) progress[qId] = selected.value;
                } else if (qType === 'completacion') {
                    var input = block.querySelector('input[name="question_' + qId + '"]');
                    if (input) progress[qId] = input.value;
                } else if (qType === 'emparejamiento') {
                    var pairInputs = block.querySelectorAll('input[name^="question_' + qId + '"]');
                    var pairs = {};
                    pairInputs.forEach(function(input) {
                        if (input.value) pairs[input.dataset.originalIndex] = input.value;
                    });
                    progress[qId] = pairs;
                }
            });

            var currentData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            currentData.answers = progress;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
        }

        function loadProgress() {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;
            try {
                var data = JSON.parse(saved);
                var answers = data.answers || {};
                var keys = Object.keys(answers);
                keys.forEach(function(qId) {
                    var value = answers[qId];
                    var block = document.querySelector('.question-block[data-question-id="' + qId + '"]');
                    if (!block) return;
                    var qType = block.dataset.questionType;

                    if (qType === 'opcion_multiple' || qType === 'verdadero_falso') {
                        var input = block.querySelector('input[name="question_' + qId + '"][value="' + value + '"]');
                        if (input) input.checked = true;
                    } else if (qType === 'completacion') {
                        var inputComp = block.querySelector('input[name="question_' + qId + '"]');
                        if (inputComp) inputComp.value = value;
                    } else if (qType === 'emparejamiento') {
                        var valKeys = Object.keys(value);
                        valKeys.forEach(function(origIdx) {
                            var inputPair = block.querySelector('input[data-original-index="' + origIdx + '"]');
                            if (inputPair) inputPair.value = value[origIdx];
                        });
                    }
                });
            } catch (e) { console.error("Error loading progress:", e); }
        }

        function submitExam(isBlocked) {
            var submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            var respuestas = [];
            var questionBlocks = document.querySelectorAll('.question-block');
            questionBlocks.forEach(function(block) {
                var preguntaId = block.dataset.questionId;
                var preguntaTipo = block.dataset.questionType;
                var respuestaEstudiante = '';

                if (preguntaTipo === 'opcion_multiple' || preguntaTipo === 'verdadero_falso') {
                    var selectedOption = block.querySelector('input[name="question_' + preguntaId + '"]:checked');
                    respuestaEstudiante = selectedOption ? selectedOption.value : '';
                } else if (preguntaTipo === 'completacion') {
                    var inputField = block.querySelector('input[name="question_' + preguntaId + '"]');
                    respuestaEstudiante = inputField ? inputField.value : '';
                } else if (preguntaTipo === 'emparejamiento') {
                    var pairInputs = block.querySelectorAll('input[name^="question_' + preguntaId + '"]');
                    var pairs = {};
                    pairInputs.forEach(function(input) {
                        pairs[input.dataset.originalIndex] = input.value || '';
                    });
                    respuestaEstudiante = JSON.stringify(pairs);
                }

                respuestas.push({
                    preguntaId: preguntaId,
                    tipo: preguntaTipo,
                    respuestaEstudiante: respuestaEstudiante
                });
            });

            var payload = {
                examenId: examenId,
                userId: currentUser.userId,
                respuestas: respuestas,
                estado: isBlocked ? 'Bloqueado' : 'Entregado'
            };

            if (app.fetchApi) {
                app.fetchApi('EXAM', 'submitExam', payload).then(function(result) {
                    localStorage.removeItem(STORAGE_KEY);
                    if (result.status === 'success') {
                        window.location.href = 'results.html?entregaExamenId=' + result.data.entregaExamenId;
                    } else {
                        alert("Error al entregar: " + result.message);
                        if (submitBtn) submitBtn.disabled = false;
                    }
                }).catch(function(err) {
                    console.error("Error submitting exam:", err);
                    alert("Error de conexión al entregar el examen.");
                    if (submitBtn) submitBtn.disabled = false;
                });
            }
        }

        function startTimer(limitInMinutes) {
            var timeRemaining;
            var savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

            if (savedData.endTime) {
                var now = Date.now();
                timeRemaining = Math.max(0, Math.floor((savedData.endTime - now) / 1000));
            } else {
                timeRemaining = limitInMinutes * 60;
                var endTime = Date.now() + (timeRemaining * 1000);
                savedData.endTime = endTime;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
            }

            var updateTimerDisplay = function() {
                var minutes = Math.floor(timeRemaining / 60);
                var seconds = timeRemaining % 60;
                if (timerEl) timerEl.textContent = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;

                if (timeRemaining <= 60 && timerEl) {
                    timerEl.classList.remove('bg-gray-100', 'text-gray-600');
                    timerEl.classList.add('bg-red-100', 'text-red-600', 'animate-pulse');
                }
            };

            updateTimerDisplay();

var QuizProApp = window.QuizProApp || {};
            var timerInterval = setInterval(function(app) {
                timeRemaining--;
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    alert("¡Tiempo agotado! El examen se entregará automáticamente.");
                    submitExam(false);
                }
                updateTimerDisplay();
            }, 1000);
        }

        function requestFullscreen() {
            var docEl = document.documentElement;
            var request = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
            if (request) {
                request.call(docEl).catch(function(err) {
                    console.warn("Fullscreen rejected:", err);
                });
            }
        }

        document.addEventListener('fullscreenchange', function() {
            if (!document.fullscreenElement) {
                // El estudiante salió de pantalla completa, marcar como potencial bloqueo o advertencia
                console.warn("Estudiante salió de pantalla completa");
            }
        });

        if (examForm) {
            examForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (confirm('¿Estás seguro de que deseas entregar el examen?')) {
                    submitExam(false);
                }
            });
        }

        loadExam();
    });

})(QuizProApp);
