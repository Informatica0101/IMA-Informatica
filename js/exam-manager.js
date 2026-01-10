document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // --- GENERAL VARIABLES ---
    const urlParams = new URLSearchParams(window.location.search);
    const examenId = urlParams.get('examenId');
    const entregaExamenId = urlParams.get('entregaExamenId');
    const viewMode = urlParams.get('view');

    // --- VIEW CONTAINERS ---
    const studentExamView = document.getElementById('student-exam-view');
    const submissionSuccessView = document.getElementById('submission-success-view');
    const teacherSubmissionsView = document.getElementById('teacher-submissions-view');
    const teacherGradingView = document.getElementById('teacher-grading-view');

    // --- DOM ELEMENTS (for all views) ---
    const examTitleEl = document.getElementById('exam-title');
    const questionsContainer = document.getElementById('questions-container');
    const examForm = document.getElementById('exam-form');
    const teacherExamTitleEl = document.getElementById('teacher-exam-title');
    const submissionsListContainer = document.getElementById('submissions-list-container');
    const gradingDetailsContainer = document.getElementById('grading-details-container');
    const gradingFormContainer = document.getElementById('grading-form-container');
    const backToSubmissionsBtn = document.getElementById('back-to-submissions-btn');

    // --- API HELPER ---
    async function fetchApi(service, action, payload) {
        if (!SERVICE_URLS[service]) throw new Error(`URL para el servicio "${service}" no encontrada.`);
        const response = await fetch(SERVICE_URLS[service], {
            method: 'POST', body: JSON.stringify({ action, payload })
        });
        if (!response.ok) throw new Error(`Error de red: ${response.statusText}`);
        return await response.json();
    }

    // --- VIEW ROUTING ---
    function showView(viewToShow) {
        [studentExamView, submissionSuccessView, teacherSubmissionsView, teacherGradingView].forEach(view => {
            if (view) view.classList.add('hidden');
        });
        if (viewToShow) viewToShow.classList.remove('hidden');
    }

    function initializeView() {
        if (currentUser.rol === 'Profesor') {
             if (viewMode === 'grading' && entregaExamenId) {
                showView(teacherGradingView);
                loadGradingView(entregaExamenId);
            } else if (viewMode === 'submissions' && examenId) {
                showView(teacherSubmissionsView);
                loadSubmissionsView(examenId);
            } else {
                 window.location.href = 'teacher-dashboard.html';
            }
        } else { // Student Role
            if (viewMode === 'submitted') {
                showView(submissionSuccessView);
            } else if (examenId) {
                showView(studentExamView);
                loadExam();
            } else {
                window.location.href = 'student-dashboard.html';
            }
        }
    }

    // --- STUDENT EXAM LOGIC (Restored from js/exam.js) ---
    async function loadExam() {
        if (!examTitleEl || !questionsContainer) return;
        try {
            const result = await fetchApi('EXAM', 'getExamQuestions', { examenId });
            if (result.status === 'success' && result.data) {
                const { titulo, tiempoLimite, preguntas } = result.data;
                examTitleEl.textContent = titulo;
                questionsContainer.innerHTML = preguntas.map(renderQuestion).join('');
            } else {
                throw new Error(result.message || 'No se pudo cargar la información del examen.');
            }
        } catch (error) {
            questionsContainer.innerHTML = `<p class="text-red-500">Error al cargar el examen: ${error.message}</p>`;
        }
    }

    async function submitExam() {
        const respuestas = [];
        const questionBlocks = document.querySelectorAll('#student-exam-view .question-block');

        questionBlocks.forEach(block => {
            const preguntaId = block.dataset.questionId;
            const preguntaTipo = block.dataset.questionType;
            let respuestaEstudiante = '';

            switch (preguntaTipo) {
                case 'opcion_multiple':
                case 'verdadero_falso':
                    const selectedOption = block.querySelector(`input[name="question_${preguntaId}"]:checked`);
                    respuestaEstudiante = selectedOption ? selectedOption.value : '';
                    break;
                case 'completacion':
                case 'respuesta_breve':
                    const inputField = block.querySelector(`input[name="question_${preguntaId}"], textarea[name="question_${preguntaId}"]`);
                    respuestaEstudiante = inputField ? inputField.value.trim() : '';
                    break;
                case 'termino_pareado':
                    const pairInputs = block.querySelectorAll(`input[name^="question_${preguntaId}_"]`);
                    const pairs = {};
                    pairInputs.forEach(input => {
                        const nameParts = input.name.split('_');
                        if (nameParts.length === 3) {
                            pairs[nameParts[2]] = input.value.trim();
                        }
                    });
                    respuestaEstudiante = JSON.stringify(pairs);
                    break;
            }
            respuestas.push({ preguntaId, respuestaEstudiante });
        });

        try {
            const payload = { examenId, userId: currentUser.email, respuestas, estado: 'Entregado' };
            const result = await fetchApi('EXAM', 'submitExam', payload);

            if (result.status === 'success') {
                window.location.href = `exam-manager.html?view=submitted`;
            } else {
                throw new Error(result.message || "Error al enviar el examen.");
            }
        } catch (error) {
            alert(`Error al enviar el examen: ${error.message}`);
        }
    }

    function renderQuestion(pregunta, index) {
        const { preguntaId, preguntaTipo, textoPregunta, opciones } = pregunta;
        let optionsHtml = '';
        let parsedOpciones = [];

        try {
            if (typeof opciones === 'string' && (opciones.trim().startsWith('{') || opciones.trim().startsWith('['))) {
                parsedOpciones = JSON.parse(opciones);
            } else if (Array.isArray(opciones)) {
                parsedOpciones = opciones;
            }
        } catch (e) { console.error(`Error parsing options for question ${preguntaId}:`, opciones); }

        switch (preguntaTipo) {
            case 'opcion_multiple':
                optionsHtml = parsedOpciones.map(op => `<label class="block p-2 rounded hover:bg-gray-100 cursor-pointer"><input type="radio" name="question_${preguntaId}" value="${op}" class="mr-3">${op}</label>`).join('');
                break;
            case 'verdadero_falso':
                optionsHtml = `<label class="block p-2 rounded hover:bg-gray-100 cursor-pointer"><input type="radio" name="question_${preguntaId}" value="Verdadero" class="mr-3">Verdadero</label><label class="block p-2 rounded hover:bg-gray-100 cursor-pointer"><input type="radio" name="question_${preguntaId}" value="Falso" class="mr-3">Falso</label>`;
                break;
            case 'completacion':
                optionsHtml = `<input type="text" name="question_${preguntaId}" class="w-full mt-2 p-2 border rounded-md" placeholder="Escribe tu respuesta aquí">`;
                break;
            case 'respuesta_breve':
                 optionsHtml = `<textarea name="question_${preguntaId}" class="w-full mt-2 p-2 border rounded-md" rows="3" placeholder="Escribe tu respuesta aquí"></textarea>`;
                 break;
            case 'termino_pareado':
                const colA = parsedOpciones.columnA || [];
                const colB = parsedOpciones.columnB ? [...parsedOpciones.columnB].sort(() => Math.random() - 0.5) : [];
                optionsHtml = `<div class="flex flex-col md:flex-row gap-8 mt-2"><div class="flex-1"><h4 class="font-semibold mb-2 border-b pb-1">Columna A</h4><ul class="list-decimal list-inside space-y-2 pl-2">${colA.map(term => `<li>${term}</li>`).join('')}</ul></div><div class="flex-1"><h4 class="font-semibold mb-2 border-b pb-1">Columna B</h4><div class="space-y-3">${colB.map((definition, idx) => `<div class="flex items-center gap-2"><input type="text" name="question_${preguntaId}_${idx}" class="w-12 border rounded p-1 text-center" placeholder="#"><p>${definition}</p></div>`).join('')}</div></div></div><p class="text-sm text-gray-600 mt-4"><b>Instrucción:</b> Escribe el número del término de la Columna A que corresponde a cada definición.</p>`;
                break;
            default:
                return `<div class="question-block p-4 bg-red-100" data-question-id="${preguntaId}"><p class="font-bold">${index + 1}. Tipo de pregunta no soportado: ${preguntaTipo}</p></div>`;
        }

        return `<div class="question-block p-6 border-b" data-question-id="${preguntaId}" data-question-type="${preguntaTipo}"><p class="font-semibold mb-4">${index + 1}. ${textoPregunta}</p><div class="space-y-2">${optionsHtml}</div></div>`;
    }

    // --- TEACHER VIEW LOGIC ---
    async function loadSubmissionsView(examenId) {
        submissionsListContainer.innerHTML = '<p>Cargando entregas...</p>';
        try {
            const result = await fetchApi('EXAM', 'getExamSubmissions', { examenId });
            if (result.status === 'success' && result.data) {
                teacherExamTitleEl.textContent = `Entregas del Examen`;
                renderSubmissionsTable(result.data);
            } else {
                throw new Error(result.message || 'No se pudieron cargar las entregas.');
            }
        } catch (error) {
            submissionsListContainer.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        }
    }

    function renderSubmissionsTable(submissions) {
        if (submissions.length === 0) {
            submissionsListContainer.innerHTML = '<p>Aún no hay entregas para este examen.</p>';
            return;
        }
        const tableHtml = `<table class="w-full text-left"><thead><tr class="border-b"><th class="p-2">Estudiante</th><th class="p-2">Fecha</th><th class="p-2">Calificación</th><th class="p-2">Estado</th><th class="p-2">Acción</th></tr></thead><tbody>${submissions.map(s => `
                        <tr class="border-b">
                            <td class="p-2">${s.studentName}</td>
                            <td class="p-2">${s.submissionDate}</td>
                            <td class="p-2">${s.grade}%</td>
                            <td class="p-2">${s.status}</td>
                            <td class="p-2"><a href="exam-manager.html?entregaExamenId=${s.entregaExamenId}&view=grading" class="text-blue-600 hover:underline">Ver / Calificar</a></td>
                        </tr>`).join('')}</tbody></table>`;
        submissionsListContainer.innerHTML = tableHtml;
    }

    async function loadGradingView(entregaExamenId) {
        gradingDetailsContainer.innerHTML = '<p>Cargando detalles...</p>';
        try {
            const result = await fetchApi('EXAM', 'getSubmissionDetails', { entregaExamenId });
            if (result.status === 'success' && result.data) {
                renderGradingDetails(result.data);
                renderGradingForm(result.data);
            } else {
                throw new Error(result.message || 'No se pudieron cargar los detalles.');
            }
        } catch (error) {
            gradingDetailsContainer.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        }
    }

    function renderGradingDetails(data) {
        const { details, studentName } = data;
        let detailsHtml = `<h2 class="text-2xl font-bold mb-4">Revisión para: ${studentName}</h2>`;
        details.forEach((item, index) => {
            const bgColor = item.esCorrecta ? 'bg-green-100' : 'bg-red-100';
            detailsHtml += `<div class="p-4 rounded border mb-4 ${bgColor}"><p class="font-semibold">${index + 1}. ${item.textoPregunta}</p><p><strong>Respuesta Estudiante:</strong> <span class="font-mono">${item.respuestaEstudiante || 'No respondida'}</span></p><p><strong>Respuesta Correcta:</strong> <span class="font-mono">${item.respuestaCorrecta}</span></p></div>`;
        });
        gradingDetailsContainer.innerHTML = detailsHtml;
    }

    function renderGradingForm(data) {
        const { currentGrade, currentStatus, currentComment } = data;
        gradingFormContainer.innerHTML = `<h3 class="text-xl font-bold mb-4">Calificación Manual</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label for="calificacion" class="block font-medium mb-1">Calificación (%)</label><input type="number" id="calificacion" class="w-full p-2 border rounded" value="${currentGrade}"></div><div><label for="estado" class="block font-medium mb-1">Estado</label><select id="estado" class="w-full p-2 border rounded"><option value="Entregado" ${currentStatus === 'Entregado' ? 'selected' : ''}>Entregado</option><option value="Revisado" ${currentStatus === 'Revisado' ? 'selected' : ''}>Revisado</option></select></div><div class="md:col-span-3"><label for="comentario" class="block font-medium mb-1">Comentario</label><textarea id="comentario" class="w-full p-2 border rounded" rows="3">${currentComment}</textarea></div></div><button id="save-grade-btn" class="mt-4 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">Guardar Calificación</button>`;
        document.getElementById('save-grade-btn').addEventListener('click', async () => {
            try {
                const result = await fetchApi('EXAM', 'gradeSubmission', { entregaExamenId, calificacion: document.getElementById('calificacion').value, estado: document.getElementById('estado').value, comentario: document.getElementById('comentario').value });
                if (result.status === 'success') {
                    alert('Calificación guardada.');
                    window.location.reload();
                } else { throw new Error(result.message); }
            } catch (error) {
                alert(`Error al guardar: ${error.message}`);
            }
        });
    }

    // --- EVENT LISTENERS ---
    if (examForm) {
        examForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (confirm('¿Estás seguro de que deseas entregar el examen?')) {
                submitExam();
            }
        });
    }
    if (backToSubmissionsBtn) {
        backToSubmissionsBtn.addEventListener('click', () => { window.history.back(); });
    }

    // --- INITIALIZATION ---
    initializeView();
});