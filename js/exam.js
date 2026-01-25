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

    // --- Lógica del Examen ---
    async function loadExam() {
        try {
            // Apuntar al microservicio de exámenes
            const result = await fetchApi('EXAM', 'getExamQuestions', { examenId });
            if (result.status === 'success' && result.data) {
                const { titulo, tiempoLimite, preguntas } = result.data;
                examTitleEl.textContent = titulo;

                // Se asigna un array vacío por defecto si la propiedad 'preguntas' no existe.
                originalQuestions = preguntas || [];

                if (originalQuestions.length > 0) {
                    questionsContainer.innerHTML = originalQuestions.map(renderQuestion).join('');
                } else {
                    questionsContainer.innerHTML = '<p class="text-gray-500">Este examen no tiene preguntas actualmente.</p>';
                    document.querySelector('button[type="submit"]').style.display = 'none'; // Ocultar botón de envío
                }

                if (tiempoLimite) {
                    startTimer(tiempoLimite);
                }
                requestFullScreen();
            } else { throw new Error(result.message); }
        } catch (error) {
            questionsContainer.innerHTML = `<p class="text-red-500">Error al cargar el examen: ${error.message}</p>`;
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
                optionsHtml = Object.entries(options).map(([key, value]) => `
                    <label class="block p-2 rounded hover:bg-gray-100">
                        <input type="radio" name="question_${questionId}" value="${key}" class="mr-2">
                        ${value}
                    </label>
                `).join('');
                break;
            case 'completacion':
            case 'respuesta_breve':
                optionsHtml = `<input type="text" name="question_${questionId}" class="w-full p-2 border rounded" placeholder="Escribe tu respuesta aquí">`;
                break;
            case 'termino_pareado':
                if (options.concepts && options.definitions) {
                    // Randomize definitions for the student
                    const shuffledDefinitions = [...options.definitions].sort(() => Math.random() - 0.5);
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
                                    ${shuffledDefinitions.map((def, i) => `
                                        <div class="flex items-center">
                                            <input type="text" name="question_${questionId}_${i}" data-original-definition="${def}" class="w-12 p-1 border rounded mr-3 text-center" placeholder="#">
                                            <span>${def}</span>
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
                    // Para términos pareados, la respuesta puede ser un objeto o un string JSON
                    const pairInputs = block.querySelectorAll(`input[name^="question_${preguntaId}"]`);
                    const pairs = {};
                    pairInputs.forEach(input => {
                        const conceptIndex = input.name.split('_').pop();
                        pairs[conceptIndex] = input.value.trim();
                    });
                    respuestaEstudiante = JSON.stringify(pairs); // Convertir a string para enviar
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

    function startTimer(minutes) {
        let seconds = minutes * 60;
        const interval = setInterval(() => {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            if (timerEl) timerEl.textContent = `Tiempo restante: ${m}:${s < 10 ? '0' : ''}${s}`;

            if (seconds <= 0) {
                clearInterval(interval);
                alert('El tiempo ha terminado. El examen se enviará automáticamente.');
                submitExam(true);
            }
            seconds--;
        }, 1000);
    }

    function requestFullScreen() {
        const docEl = document.documentElement;
        const requestMethod = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
        if (requestMethod) {
            requestMethod.call(docEl).catch(err => {
                console.log("Error al intentar activar pantalla completa:", err);
            });
        }
    }

    examForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitExam(false);
    });

    loadExam();
});
