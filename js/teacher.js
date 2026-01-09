document.addEventListener('DOMContentLoaded', () => {
    let submissionsTableBody = document.getElementById('submissions-table-body');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser || currentUser.rol !== 'Profesor') {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('teacher-name').textContent = currentUser.nombre;

    // --- Elementos de Navegación y Secciones ---
    const navDashboard = document.getElementById('nav-dashboard');
    const navCrear = document.getElementById('nav-crear');
    const navCrearExamen = document.getElementById('nav-crear-examen');
    const sectionDashboard = document.getElementById('section-dashboard');
    const sectionCrear = document.getElementById('section-crear');
    const sectionCrearExamen = document.getElementById('section-crear-examen');
    const createAssignmentForm = document.getElementById('create-assignment-form');
    const createExamForm = document.getElementById('create-exam-form');
    const logoutButton = document.getElementById('logout-button');

    const allSections = [sectionDashboard, sectionCrear, sectionCrearExamen];
    const allNavLinks = [navDashboard, navCrear, navCrearExamen];

    // --- Lógica de Navegación ---
    function navigateTo(targetSection, navElement) {
        allSections.forEach(section => section.classList.add('hidden'));
        targetSection.classList.remove('hidden');
        allNavLinks.forEach(link => {
            link.classList.remove('bg-gray-700', 'text-white');
            link.classList.add('text-gray-700');
        });
        navElement.classList.add('bg-gray-700', 'text-white');
        navElement.classList.remove('text-gray-700');
    }

    navDashboard.addEventListener('click', () => { navigateTo(sectionDashboard, navDashboard); fetchTeacherActivity(); });
    navCrear.addEventListener('click', () => navigateTo(sectionCrear, navCrear));
    navCrearExamen.addEventListener('click', () => navigateTo(sectionCrearExamen, navCrearExamen));
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    // --- Carga de Actividad del Profesor ---
    async function fetchTeacherActivity() {
        submissionsTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">Cargando actividad...</td></tr>';
        try {
            const [tasksResult, examsResult] = await Promise.all([
                fetchApi('TASK', 'getTeacherActivity', {}),
                fetchApi('EXAM', 'getTeacherExamActivity', {})
            ]);
            const allActivity = [...(tasksResult.data || []), ...(examsResult.data || [])];
            allActivity.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            renderActivity(allActivity);
        } catch (error) {
            submissionsTableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-red-500">Error al cargar actividad: ${error.message}</td></tr>`;
        }
    }

    function renderActivity(activity) {
        if (!activity || activity.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No hay actividad reciente.</td></tr>';
            return;
        }
        submissionsTableBody.innerHTML = activity.map(item => {
            let actionHtml = '';
            if (item.tipo === 'Tarea') {
                actionHtml = `<button class="bg-blue-500 text-white px-2 py-1 rounded text-sm grade-task-btn" data-item='${JSON.stringify(item)}'>Calificar</button>`;
            } else if (item.tipo === 'Examen' && item.estado === 'Bloqueado') {
                actionHtml = `<button class="bg-yellow-500 text-white px-2 py-1 rounded text-sm reactivate-exam-btn" data-entrega-id="${item.entregaId}">Reactivar</button>`;
            }
            return `
                <tr class="border-b">
                    <td class="p-4">${item.alumnoNombre}</td>
                    <td class="p-4">${item.titulo}</td>
                    <td class="p-4">${item.fecha}</td>
                    <td class="p-4">${item.archivoUrl ? `<a href="${item.archivoUrl}" target="_blank" class="text-blue-500">Ver Archivo</a>` : 'N/A'}</td>
                    <td class="p-4">${item.calificacion || 'N/A'}</td>
                    <td class="p-4">${item.estado || 'Pendiente'}</td>
                    <td class="p-4">${actionHtml}</td>
                </tr>`;
        }).join('');
    }

    // --- Lógica del Modal de Calificación ---
    const gradeModal = document.getElementById('grade-modal');
    const saveGradeBtn = document.getElementById('save-grade-btn');
    const cancelGradeBtn = document.getElementById('cancel-grade-btn');
    let currentEditingEntregaId = null;

    function openGradeModal(entrega) {
        currentEditingEntregaId = entrega.entregaId;
        document.getElementById('student-name-modal').textContent = entrega.alumnoNombre;
        document.getElementById('file-link-modal').href = entrega.archivoUrl;
        document.getElementById('calificacion').value = entrega.calificacion || '';
        document.getElementById('estado').value = entrega.estado || 'Revisada';
        document.getElementById('comentario').value = entrega.comentario || '';
        gradeModal.classList.remove('hidden');
    }

    function closeGradeModal() {
        gradeModal.classList.add('hidden');
    }

    cancelGradeBtn.addEventListener('click', closeGradeModal);

    saveGradeBtn.addEventListener('click', async () => {
        const payload = {
            entregaId: currentEditingEntregaId,
            calificacion: document.getElementById('calificacion').value,
            estado: document.getElementById('estado').value,
            comentario: document.getElementById('comentario').value
        };
        try {
            const result = await fetchApi('TASK', 'gradeSubmission', payload);
            if (result.status === 'success') {
                alert('Calificación guardada.');
                closeGradeModal();
                fetchTeacherActivity();
            } else { throw new Error(result.message); }
        } catch (error) { alert(`Error al guardar calificación: ${error.message}`); }
    });

    // --- Delegación de Eventos para la Tabla ---
    submissionsTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.classList.contains('grade-task-btn')) {
            openGradeModal(JSON.parse(target.dataset.item));
        }
        if (target.classList.contains('reactivate-exam-btn')) {
            const entregaId = target.dataset.entregaId;
            if (confirm("¿Reactivar este examen?")) {
                try {
                    const result = await fetchApi('EXAM', 'reactivateExam', { entregaExamenId: entregaId });
                    if (result.status === 'success') {
                        alert('Examen reactivado.');
                        fetchTeacherActivity();
                    } else { throw new Error(result.message); }
                } catch (error) { alert(`Error: ${error.message}`); }
            }
        }
    });

    // --- Lógica de Formularios de Creación ---
    createAssignmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(e.target).entries());
        try {
            const result = await fetchApi('TASK', 'createTask', payload);
            if (result.status === 'success') {
                alert('Tarea creada.');
                e.target.reset();
                navDashboard.click();
            } else { throw new Error(result.message); }
        } catch (error) { alert(`Error: ${error.message}`); }
    });

    // --- Lógica de Creación de Exámenes ---
    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionsContainer = document.getElementById('questions-container');
    let questionCounter = 0;

    function getQuestionHTML(id) {
        return `
            <div class="question-block border p-4 rounded-lg" data-question-id="${id}">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-bold">Pregunta ${id}</h4>
                    <button type-="button" class="text-red-500 remove-question-btn">Eliminar</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-medium mb-1">Tipo de Pregunta</label>
                        <select class="w-full p-2 border rounded question-type-select">
                            <option value="opcion_multiple">Opción Múltiple</option>
                            <option value="completacion">Completación</option>
                            <option value="termino_pareado">Término Pareado</option>
                            <option value="verdadero_falso">Verdadero/Falso</option>
                            <option value="respuesta_breve">Respuesta Breve</option>
                        </select>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block font-medium mb-1">Texto de la Pregunta</label>
                        <input type="text" class="w-full p-2 border rounded question-text" placeholder="Ej: ¿Capital de Honduras?">
                    </div>
                    <div class="md:col-span-2 options-container">
                        <!-- Opciones dinámicas aquí -->
                    </div>
                    <div>
                        <label class="block font-medium mb-1">Respuesta Correcta</label>
                        <input type="text" class="w-full p-2 border rounded correct-answer" placeholder="Ej: Tegucigalpa">
                    </div>
                </div>
            </div>`;
    }

    function getOptionsHTML(type) {
        switch (type) {
            case 'opcion_multiple':
                return `
                    <label class="block font-medium mb-1">Opciones (separadas por coma)</label>
                    <input type="text" class="w-full p-2 border rounded question-options" placeholder="Opción A, Opción B, Opción C">`;
            case 'verdadero_falso':
                return `
                    <label class="block font-medium mb-1">Opciones</label>
                    <input type="text" value="Verdadero,Falso" disabled class="w-full p-2 border rounded bg-gray-200 question-options">`;
            case 'termino_pareado':
                 return `
                    <label class="block font-medium mb-1">Pares (concepto:definición,otro:definición)</label>
                    <textarea class="w-full p-2 border rounded question-options" rows="3" placeholder="Tegucigalpa:Capital de Honduras,París:Capital de Francia"></textarea>`;
            default:
                return '';
        }
    }

    function addQuestion() {
        console.log('Add question button clicked');
        questionCounter++;
        const questionNode = document.createElement('div');
        questionNode.innerHTML = getQuestionHTML(questionCounter);
        questionsContainer.appendChild(questionNode);

        const typeSelect = questionNode.querySelector('.question-type-select');
        const optionsContainer = questionNode.querySelector('.options-container');
        optionsContainer.innerHTML = getOptionsHTML(typeSelect.value);

        typeSelect.addEventListener('change', (e) => {
            optionsContainer.innerHTML = getOptionsHTML(e.target.value);
        });
    }

    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', addQuestion);
    }

    questionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-question-btn')) {
            e.target.closest('.question-block').remove();
        }
    });

    // Add logic for createExamForm if it exists
    if(createExamForm) {
        createExamForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const mainData = Object.fromEntries(new FormData(e.target).entries());
            const payload = {
                ...mainData,
                preguntas: []
            };

            const questionBlocks = questionsContainer.querySelectorAll('.question-block');
            questionBlocks.forEach(block => {
                const pregunta = {
                    preguntaTipo: block.querySelector('.question-type-select').value,
                    textoPregunta: block.querySelector('.question-text').value,
                    respuestaCorrecta: block.querySelector('.correct-answer').value,
                    opciones: ''
                };

                const optionsInput = block.querySelector('.question-options');
                if (optionsInput) {
                    pregunta.opciones = optionsInput.value;
                }

                payload.preguntas.push(pregunta);
            });

            if (payload.preguntas.length === 0) {
                alert('Un examen no puede estar vacío. Por favor, añada al menos una pregunta.');
                return;
            }

            try {
                const result = await fetchApi('EXAM', 'createExam', payload);
                if (result.status === 'success') {
                    alert('Examen creado exitosamente.');
                    e.target.reset();
                    questionsContainer.innerHTML = '';
                    questionCounter = 0;
                    navDashboard.click(); // This handles navigation and data refresh
                } else {
                    throw new Error(result.message || 'Error desconocido del servidor.');
                }
            } catch (error) {
                console.error('Error al crear el examen:', error);
                alert(`Error al crear el examen: ${error.message}`);
            }
        });
    }

    // Carga Inicial
    fetchTeacherActivity();
});
