document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) { window.location.href = 'login.html'; return; }

    const examTitleEl = document.getElementById('exam-title');
    const questionsContainer = document.getElementById('questions-container');
    const examForm = document.getElementById('exam-form');
    const timerEl = document.getElementById('timer');

    const urlParams = new URLSearchParams(window.location.search);
    const examenId = urlParams.get('examenId');
    let originalQuestions = [];

    /**
     * Tarea 2: Implementación de Fisher-Yates para barajado robusto.
     */
    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // --- Lógica del Examen ---
    async function loadExam() {
        const startOverlay = document.getElementById('start-exam-overlay');
        const startBtn = document.getElementById('start-exam-btn');
        let timeLimitFromApi = 0;

        try {
            // Apuntar al microservicio de exámenes
            const result = await fetchApi('EXAM', 'getExamQuestions', { examenId });
            if (result.status === 'success' && result.data) {
                const { titulo, tiempoLimite, preguntas } = result.data;
                examTitleEl.textContent = titulo;
                timeLimitFromApi = tiempoLimite;

                // Se asigna un array vacío por defecto si la propiedad 'preguntas' no existe.
                originalQuestions = preguntas || [];

                if (originalQuestions.length > 0) {
                    questionsContainer.innerHTML = originalQuestions.map(renderQuestion).join('');
                } else {
                    questionsContainer.innerHTML = '<p class="text-gray-500">Este examen no tiene preguntas actualmente.</p>';
                    const submitBtn = document.querySelector('button[type="submit"]');
                    if (submitBtn) submitBtn.style.display = 'none';
                }

                // Habilitar botón de inicio solo si cargó correctamente (A-24)
                if (startBtn) {
                    startBtn.addEventListener('click', () => {
                        if (startOverlay) startOverlay.classList.add('hidden');
                        if (timeLimitFromApi) startTimer(timeLimitFromApi);
                        requestFullScreen();
                    });
                }
            } else { throw new Error(result.message); }
        } catch (error) {
            questionsContainer.innerHTML = `<p class="text-red-500 text-center py-10 font-bold">Error al cargar el examen: ${error.message}</p>`;
            // Si falla la carga, mostramos un botón de reintento o volvemos
            if (startBtn) {
                startBtn.textContent = "Volver al Dashboard";
                startBtn.classList.replace('bg-blue-600', 'bg-gray-600');
                startBtn.addEventListener('click', () => {
                    window.location.href = 'student-dashboard.html';
                });
            }
        }
    }

    function renderQuestion(question, index) {
        const questionId = question.preguntaId || `q_${index}`;
        const questionType = question.tipo;
        const questionText = question.texto;
        let options = question.opciones || {};

        // Manejar el caso donde las opciones lleguen como string JSON (defensivo)
        if (typeof options === 'string') {
            try { options = JSON.parse(options); } catch (e) { options = {}; }
        }

        let optionsHtml = '';

        switch (questionType) {
            case 'opcion_multiple':
            case 'verdadero_falso':
                optionsHtml = Object.entries(options).map(([key, value]) => {
                    // Tarea 1: Enviar valor semántico para Verdadero/Falso
                    const inputValue = (questionType === 'verdadero_falso') ? value : key;
                    return `
                        <label class="block p-2 rounded hover:bg-gray-100">
                            <input type="radio" name="question_${questionId}" value="${inputValue}" class="mr-2">
                            ${value}
                        </label>
                    `;
                }).join('');
                break;
            case 'completacion':
            case 'respuesta_breve':
                optionsHtml = `<input type="text" name="question_${questionId}" class="w-full p-2 border rounded" placeholder="Escribe tu respuesta aquí">`;
                break;
            case 'termino_pareado':
                if (options.concepts && options.definitions) {
                    // Tarea 2: Barajado robusto de definiciones sin duplicados
                    const indexedDefinitions = options.definitions.map((def, idx) => ({ def, idx }));
                    const shuffledDefinitions = shuffleArray(indexedDefinitions);
                    optionsHtml = `
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 class="font-bold mb-2">Conceptos</h4>
                                <ul class="list-decimal list-inside space-y-2">
                                    ${options.concepts.map(concept => `<li class="p-2 bg-gray-100 rounded">${concept}</li>`).join('')}
                                </ul>
                            </div>
                            <div>
                                <h4 class="font-bold mb-2">Definiciones</h4>
                                <div class="space-y-2">
                                    ${shuffledDefinitions.map((item, i) => `
                                        <div class="flex items-center">
                                            <input type="text" name="question_${questionId}_${i}" data-original-index="${item.idx}" class="w-12 p-1 border rounded mr-3 text-center" placeholder="#">
                                            <span>${item.def}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                }
                break;
        }

        return `
            <div class="p-6 border-b question-block" data-question-id="${questionId}" data-question-type="${questionType}">
                <p class="font-semibold text-lg mb-4">${index + 1}. ${questionText}</p>
                <div class="space-y-3">
                    ${optionsHtml}
                </div>
            </div>
        `;
    }

    async function submitExam(isBlocked) {
        const submitBtn = document.querySelector('button[type="submit"]');
        const respuestas = [];
        const questionBlocks = document.querySelectorAll('.question-block');

        questionBlocks.forEach(block => {
            const preguntaId = block.dataset.questionId;
            const preguntaTipo = block.dataset.questionType;
            let respuestaEstudiante = '';

            switch (preguntaTipo) {
                case 'opcion_multiple':
                case 'verdadero_falso':
                    const selectedOption = block.querySelector(`input[name="question_${preguntaId}"]:checked`);
                    if (selectedOption) {
                        respuestaEstudiante = selectedOption.value;
                    }
                    break;
                case 'completacion':
                case 'respuesta_breve':
                    const inputField = block.querySelector(`input[name="question_${preguntaId}"]`);
                    if (inputField) {
                        respuestaEstudiante = inputField.value.trim();
                    }
                    break;
                case 'termino_pareado':
                    const pairInputs = block.querySelectorAll(`input[name^="question_${preguntaId}"]`);
                    const pairs = {};
                    pairInputs.forEach(input => {
                        const originalIdx = input.dataset.originalIndex;
                        pairs[originalIdx] = input.value.trim();
                    });
                    respuestaEstudiante = JSON.stringify(pairs);
                    break;
            }
            respuestas.push({ preguntaId, respuestaEstudiante });
        });

        // Detener si es un bloqueo y no hay respuestas (p.ej. el estudiante no empezó)
        if (isBlocked && respuestas.length === 0) {
            window.location.href = 'student-dashboard.html';
            return;
        }

        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;

        try {
            const payload = { examenId, userId: currentUser.userId, respuestas, estado: isBlocked ? 'Bloqueado' : 'Entregado' };
            const result = await fetchApi('EXAM', 'submitExam', payload);

            if (result.status === 'success' && result.data) {
                 // Redirigir al dashboard del estudiante
                 window.location.href = 'student-dashboard.html';
            } else {
                throw new Error(result.message || "Error al enviar el examen.");
            }
        } catch (error) {
            alert(`Error al enviar el examen: ${error.message}`);
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    }

    function startTimer(durationMinutes) {
        if (!durationMinutes || !timerEl) return;
        let timeRemaining = durationMinutes * 60;

        const updateTimerDisplay = () => {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (timeRemaining <= 60) {
                timerEl.classList.add('text-red-600', 'animate-pulse');
            }
        };

        updateTimerDisplay();

        const timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                alert('El tiempo ha terminado. El examen se enviará automáticamente.');
                submitExam(true);
            }
        }, 1000);
    }

    function requestFullScreen() {
        const docEl = document.documentElement;
        const request = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;

        if (request) {
            request.call(docEl).catch(err => {
                console.log(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        }

        // Protecciones contra salida accidental (A-25)
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                const submitBtn = document.querySelector('button[type="submit"]');
                // Verificar explícitamente que no haya un envío en curso
                if (submitBtn && !submitBtn.disabled && !submitBtn.classList.contains('btn-loading')) {
                    alert('Has salido del modo pantalla completa. Por seguridad, el examen se enviará automáticamente.');
                    submitExam(true);
                }
            }
        });
    }

    examForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitExam(false);
    });

    loadExam();
});
