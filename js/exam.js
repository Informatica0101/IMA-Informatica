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
                    // Selector específico para los inputs de respuesta de término pareado.
                    const pairContainers = block.querySelectorAll(`input[name^="question_${preguntaId}_"]`);
                    const pairs = {};
                    pairContainers.forEach(input => {
                    // El nombre del input es `question_{preguntaId}_{idx}`
                    const nameParts = input.name.split('_');
                    if (nameParts.length === 3) {
                        const conceptIndex = nameParts[2];
                        pairs[conceptIndex] = input.value.trim();
                    }
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

        if (result.status === 'success') {
            // Redirigir a la página de confirmación, sin pasar ningún ID.
            window.location.href = `exam-submitted.html`;
            } else {
                throw new Error(result.message || "Error al enviar el examen.");
            }
        } catch (error) {
            alert(`Error al enviar el examen: ${error.message}`);
        }
    }

    function renderQuestion(pregunta, index) {
        // Extrae los datos de la pregunta
        const { preguntaId, preguntaTipo, textoPregunta, opciones } = pregunta;
        let optionsHtml = '';

        // Las opciones pueden venir como un string JSON, se parsean para usarlas.
        let parsedOpciones = [];
        if (typeof opciones === 'string' && opciones.trim().startsWith('{')) {
            try {
                parsedOpciones = JSON.parse(opciones);
            } catch (e) {
                console.error(`Error al parsear opciones para la pregunta ${preguntaId}:`, opciones);
            }
        } else if (typeof opciones === 'string' && opciones.trim().startsWith('[')) {
             try {
                parsedOpciones = JSON.parse(opciones);
            } catch (e) {
                console.error(`Error al parsear opciones para la pregunta ${preguntaId}:`, opciones);
            }
        }
        else if (Array.isArray(opciones)) {
            parsedOpciones = opciones;
        }

        // Construye el HTML para cada tipo de pregunta
        switch (preguntaTipo) {
            case 'opcion_multiple':
                optionsHtml = parsedOpciones.map(op => `
                    <label class="block p-2 rounded hover:bg-gray-100 cursor-pointer">
                        <input type="radio" name="question_${preguntaId}" value="${op}" class="mr-3">
                        ${op}
                    </label>
                `).join('');
                break;

            case 'verdadero_falso':
                optionsHtml = `
                    <label class="block p-2 rounded hover:bg-gray-100 cursor-pointer">
                        <input type="radio" name="question_${preguntaId}" value="Verdadero" class="mr-3">
                        Verdadero
                    </label>
                    <label class="block p-2 rounded hover:bg-gray-100 cursor-pointer">
                        <input type="radio" name="question_${preguntaId}" value="Falso" class="mr-3">
                        Falso
                    </label>
                `;
                break;

            case 'completacion':
            case 'respuesta_breve':
                optionsHtml = `<input type="text" name="question_${preguntaId}" class="w-full mt-2 p-2 border rounded-md" placeholder="Escribe tu respuesta aquí">`;
                break;

            case 'termino_pareado':
                const colA = parsedOpciones.columnA || [];
                const colB = parsedOpciones.columnB ? [...parsedOpciones.columnB].sort(() => Math.random() - 0.5) : []; // Mezclar columna B

                optionsHtml = `
                    <div class="flex flex-col md:flex-row gap-8 mt-2">
                        <div class="flex-1">
                            <h4 class="font-semibold mb-2 border-b pb-1">Columna A - Términos</h4>
                            <ul class="list-decimal list-inside space-y-2 pl-2">
                                ${colA.map(term => `<li>${term}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold mb-2 border-b pb-1">Columna B - Definiciones</h4>
                            <div class="space-y-3">
                                ${colB.map((definition, idx) => `
                                    <div class="flex items-center gap-2">
                                        <input type="text" name="question_${preguntaId}_${idx}" class="w-12 border rounded p-1 text-center" placeholder="#">
                                        <p>${definition}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 mt-4"><b>Instrucción:</b> Escribe el número del término de la Columna A que corresponde a cada definición de la Columna B.</p>
                `;
                break;

            default:
                // Si el tipo de pregunta no es reconocido, muestra un mensaje de error.
                return `<div class="question-block p-4 border rounded bg-red-100" data-question-id="${preguntaId}" data-question-type="${preguntaTipo}">
                    <p class="font-bold">${index + 1}. Tipo de pregunta no soportado: ${preguntaTipo}</p>
                </div>`;
        }

        // Devuelve el bloque de HTML completo para la pregunta
        return `
            <div class="question-block p-6 border-b" data-question-id="${preguntaId}" data-question-type="${preguntaTipo}">
                <p class="font-semibold mb-4 text-gray-800">${index + 1}. ${textoPregunta}</p>
                <div class="space-y-2 text-gray-700">
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
