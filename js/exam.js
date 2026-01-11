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

    // --- API Helper ---
    async function fetchApi(service, action, payload) {
        if (!SERVICE_URLS[service]) throw new Error(`URL para el servicio "${service}" no encontrada.`);
        const response = await fetch(SERVICE_URLS[service], {
            method: 'POST', body: JSON.stringify({ action, payload })
        });
        return await response.json();
    }

    // --- Lógica del Examen ---
    async function loadExam() {
        try {
            // Apuntar al microservicio de exámenes
            const result = await fetchApi('EXAM', 'getExamQuestions', { examenId });
            if (result.status === 'success' && result.data) {
                const { titulo, tiempoLimite, preguntas } = result.data;
                examTitleEl.textContent = titulo;
                originalQuestions = preguntas;
                questionsContainer.innerHTML = originalQuestions.map(renderQuestion).join('');

                if (tiempoLimite) {
                    // ... (lógica de timer sin cambios)
                }
                // ... (lógica de fullscreen sin cambios)
            } else { throw new Error(result.message); }
        } catch (error) {
            questionsContainer.innerHTML = `<p class="text-red-500">Error al cargar el examen: ${error.message}</p>`;
        }
    }

    async function submitExam(isBlocked) {
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
            window.location.href = 'student.html';
            return;
        }

        try {
            const payload = { examenId, userId: currentUser.userId, respuestas, estado: isBlocked ? 'Bloqueado' : 'Entregado' };
            const result = await fetchApi('EXAM', 'submitExam', payload);

            if (result.status === 'success' && result.data) {
                // Redirigir a una página de resultados con la calificación
                window.location.href = `results.html?entregaExamenId=${result.data.entregaExamenId}`;
            } else {
                throw new Error(result.message || "Error al enviar el examen.");
            }
        } catch (error) {
            alert(`Error al enviar el examen: ${error.message}`);
        }
    }

    // ... (El resto de las funciones: renderQuestion, startTimer, requestFullScreen, etc. no necesitan cambios)

    examForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitExam(false);
    });

    loadExam();
});
