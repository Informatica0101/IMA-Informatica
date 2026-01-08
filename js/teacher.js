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

    // --- Lógica para Crear Examen ---
    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionsContainer = document.getElementById('questions-container');
    let questionCounter = 0;

    function addQuestion() {
        questionCounter++;
        const questionId = `question-${questionCounter}`;
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('p-4', 'border', 'rounded-lg', 'space-y-4', 'bg-gray-50');
        questionDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <h4 class="text-lg font-semibold">Pregunta ${questionCounter}</h4>
                <button type="button" class="text-red-500 hover:text-red-700 font-bold remove-question-btn">Eliminar</button>
            </div>
            <div>
                <label for="${questionId}-text" class="block font-medium mb-1">Texto de la Pregunta</label>
                <input type="text" id="${questionId}-text" name="${questionId}-text" class="w-full p-2 border rounded-md" required>
            </div>
            <div>
                <label for="${questionId}-type" class="block font-medium mb-1">Tipo de Pregunta</label>
                <select id="${questionId}-type" name="${questionId}-type" class="w-full p-2 border rounded-md question-type-select">
                    <option value="opcion_multiple">Opción Múltiple</option>
                    <option value="verdadero_falso">Verdadero/Falso</option>
                    <option value="respuesta_breve">Respuesta Breve</option>
                </select>
            </div>
            <div id="${questionId}-options-container">
                <!-- Las opciones se agregarán aquí -->
            </div>
        `;
        questionsContainer.appendChild(questionDiv);
        updateQuestionOptions(questionId, 'opcion_multiple'); // Inicializar con opciones
    }

    function updateQuestionOptions(questionId, type) {
        const container = document.getElementById(`${questionId}-options-container`);
        container.innerHTML = ''; // Limpiar opciones anteriores

        if (type === 'opcion_multiple') {
            container.innerHTML = `
                <label class="block font-medium mb-1">Opciones de Respuesta</label>
                <div class="space-y-2">
                    <input type="text" name="${questionId}-option" class="w-full p-2 border rounded-md" placeholder="Opción 1" required>
                    <input type="text" name="${questionId}-option" class="w-full p-2 border rounded-md" placeholder="Opción 2" required>
                    <input type="text" name="${questionId}-option" class="w-full p-2 border rounded-md" placeholder="Opción 3">
                    <input type="text" name="${questionId}-option" class="w-full p-2 border rounded-md" placeholder="Opción 4">
                </div>
                <label for="${questionId}-correct" class="block font-medium mt-2 mb-1">Respuesta Correcta</label>
                <input type="text" id="${questionId}-correct" name="${questionId}-correct" class="w-full p-2 border rounded-md" placeholder="Escriba el texto exacto de la opción correcta" required>
            `;
        } else if (type === 'verdadero_falso') {
            container.innerHTML = `
                <label for="${questionId}-correct" class="block font-medium mb-1">Respuesta Correcta</label>
                <select id="${questionId}-correct" name="${questionId}-correct" class="w-full p-2 border rounded-md">
                    <option value="Verdadero">Verdadero</option>
                    <option value="Falso">Falso</option>
                </select>
            `;
        } else if (type === 'respuesta_breve') {
            container.innerHTML = `
                <label for="${questionId}-correct" class="block font-medium mb-1">Respuesta Correcta</label>
                <input type="text" id="${questionId}-correct" name="${questionId}-correct" class="w-full p-2 border rounded-md" required>
            `;
        }
    }

    questionsContainer.addEventListener('change', e => {
        if (e.target.classList.contains('question-type-select')) {
            const questionId = e.target.id.replace('-type', '');
            updateQuestionOptions(questionId, e.target.value);
        }
    });

    questionsContainer.addEventListener('click', e => {
        if (e.target.classList.contains('remove-question-btn')) {
            e.target.closest('.p-4.border.rounded-lg').remove();
        }
    });

    addQuestionBtn.addEventListener('click', addQuestion);

    createExamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const questions = [];

        for (let i = 1; i <= questionCounter; i++) {
            const questionId = `question-${i}`;
            if (document.getElementById(questionId + '-text')) {
                questions.push({
                    texto: formData.get(`${questionId}-text`),
                    tipo: formData.get(`${questionId}-type`),
                    opciones: formData.getAll(`${questionId}-option`).filter(opt => opt),
                    respuestaCorrecta: formData.get(`${questionId}-correct`)
                });
            }
        }

        const payload = {
            titulo: formData.get('exam-title'),
            grado: formData.get('exam-grade'),
            seccion: formData.get('exam-seccion'),
            preguntas: questions
        };

        try {
            const result = await fetchApi('EXAM', 'createExam', payload);
            if (result.status === 'success') {
                alert('Examen creado con éxito.');
                e.target.reset();
                questionsContainer.innerHTML = '';
                questionCounter = 0;
                navDashboard.click();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert(`Error al crear el examen: ${error.message}`);
        }
    });

    // Carga Inicial
    fetchTeacherActivity();
});
