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
        // ... (lógica interna sin cambios)

        try {
            const payload = { examenId, userId: currentUser.userId, respuestas, estado: isBlocked ? 'Bloqueado' : 'Entregado' };
            // Apuntar al microservicio de exámenes
            const result = await fetchApi('EXAM', 'submitExam', payload);

            if (result.status === 'success' && result.data) {
                // ... (redirección a resultados sin cambios)
            } else { throw new Error(result.message || "Error al enviar."); }
        } catch (error) { alert(`Error: ${error.message}`); }
    }

    // ... (El resto de las funciones: renderQuestion, startTimer, requestFullScreen, etc. no necesitan cambios)

    function renderQuestion(question, index) {
        let optionsHtml = '';
        const questionId = question.preguntaId; // Usar el ID de la pregunta que viene del backend

        switch (question.preguntaTipo) {
            case 'opcion_multiple':
                const options = question.opciones.split(',').map(o => o.trim());
                optionsHtml = options.map(opt => `
                    <label class="block">
                        <input type="radio" name="question_${questionId}" value="${opt}" class="mr-2">${opt}
                    </label>`).join('');
                break;
            case 'verdadero_falso':
                optionsHtml = `
                    <label class="block"><input type="radio" name="question_${questionId}" value="Verdadero" class="mr-2">Verdadero</label>
                    <label class="block"><input type="radio" name="question_${questionId}" value="Falso" class="mr-2">Falso</label>`;
                break;
            case 'completacion':
            case 'respuesta_breve':
                optionsHtml = `<input type="text" name="question_${questionId}" class="w-full p-2 border rounded">`;
                break;
            case 'termino_pareado':
                // Asumiendo que las opciones vienen como "concepto1:par1,concepto2:par2"
                const pairs = question.opciones.split(',').map(p => p.split(':'));
                const concepts = pairs.map(p => p[0].trim());
                const definitions = pairs.map(p => p[1].trim()).sort(() => Math.random() - 0.5); // Desordenar

                optionsHtml = `<div class="grid grid-cols-2 gap-4"><div>`;
                concepts.forEach((concept, i) => {
                    optionsHtml += `<div class="flex items-center mb-2">
                                      <span class="font-bold mr-2">${i+1}. ${concept}</span>
                                      <input type="text" name="question_${questionId}_${i}" class="w-20 p-1 border rounded" placeholder="#">
                                   </div>`;
                });
                optionsHtml += `</div><div>`;
                definitions.forEach((def, i) => {
                    optionsHtml += `<p class="mb-2">${i+1}. ${def}</p>`;
                });
                optionsHtml += `</div></div>`;
                break;
        }

        return `
            <div class="question-block border-t pt-6" data-question-id="${questionId}" data-question-type="${question.preguntaTipo}">
                <p class="font-semibold mb-4">${index + 1}. ${question.textoPregunta}</p>
                <div class="options-container space-y-2">
                    ${optionsHtml}
                </div>
            </div>
        `;
    }

    examForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitExam(false);
    });

    loadExam();
});
