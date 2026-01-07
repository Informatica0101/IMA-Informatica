// --- Funciones Globales para Testing y Lógica Principal ---
let submissionsTableBody; // Se asignará en DOMContentLoaded

async function fetchApi(action, payload) {
    const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: JSON.stringify({ action, payload }),
        headers: { 'Content-Type': 'text/plain' }
    });
    return await response.json();
}

async function fetchTeacherActivity() {
    if (!submissionsTableBody) {
        console.error("submissionsTableBody no está inicializado.");
        return;
    }
    submissionsTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">Cargando...</td></tr>';
    try {
        const result = await fetchApi('getTeacherActivity', {});
        if (result.status === 'success') {
            renderActivity(result.data);
        } else { throw new Error(result.message); }
    } catch (error) {
        submissionsTableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-red-500">Error: ${error.message}</td></tr>`;
    }
}

function renderActivity(activity) {
    if (!submissionsTableBody) {
        console.error("submissionsTableBody no está inicializado.");
        return;
    }
    if (!activity || activity.length === 0) {
        submissionsTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No hay actividad.</td></tr>';
        return;
    }
    submissionsTableBody.innerHTML = activity.map(item => {
        let actionHtml = '';
        if (item.tipo === 'Tarea') {
            actionHtml = `<button class="bg-blue-500 text-white px-2 py-1 rounded text-sm" onclick='openGradeModal(${JSON.stringify(item)})'>Calificar</button>`;
        } else if (item.tipo === 'Examen' && item.estado === 'Bloqueado') {
            actionHtml = `<button class="bg-yellow-500 text-white px-2 py-1 rounded text-sm" onclick='reactivateExam("${item.entregaId}")'>Reactivar</button>`;
        }

        return `
            <tr class="border-b">
                <td class="p-4">${item.alumnoNombre}</td>
                <td class="p-4">${item.titulo} <span class="text-xs font-semibold uppercase px-2 py-1 rounded-full ${item.tipo === 'Tarea' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">${item.tipo}</span></td>
                <td class="p-4">${item.fecha}</td>
                <td class="p-4">${item.archivoUrl ? `<a href="${item.archivoUrl}" target="_blank" class="text-blue-500">Ver Archivo</a>` : 'N/A'}</td>
                <td class="p-4">${item.calificacion || 'N/A'}</td>
                <td class="p-4">${item.estado || 'Pendiente'}</td>
                <td class="p-4">${actionHtml}</td>
            </tr>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Asignación de Elementos Globales ---
    submissionsTableBody = document.getElementById('submissions-table-body');

    // --- Autenticación ---
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

    // --- Elementos de Formularios y Modales ---
    const createAssignmentForm = document.getElementById('create-assignment-form');
    const createExamForm = document.getElementById('create-exam-form');
    const questionsContainer = document.getElementById('questions-container');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const logoutButton = document.getElementById('logout-button');
    const gradeModal = document.getElementById('grade-modal');
    const saveGradeBtn = document.getElementById('save-grade-btn');
    const cancelGradeBtn = document.getElementById('cancel-grade-btn');
    let currentEditingEntregaId = null;

    // --- Lógica de Navegación ---
    function navigateTo(targetSection, navElement) {
        [sectionDashboard, sectionCrear, sectionCrearExamen].forEach(s => s.classList.add('hidden'));
        [navDashboard, navCrear, navCrearExamen].forEach(n => n.classList.remove('bg-gray-700', 'text-white'));

        targetSection.classList.remove('hidden');
        navElement.classList.add('bg-gray-700', 'text-white');
    }

    navDashboard.addEventListener('click', () => {
        navigateTo(sectionDashboard, navDashboard);
        fetchTeacherActivity();
    });
    navCrear.addEventListener('click', () => navigateTo(sectionCrear, navCrear));
    navCrearExamen.addEventListener('click', () => navigateTo(sectionCrearExamen, navCrearExamen));

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    // --- Lógica de Tareas ---
    const tipoTareaSelect = document.getElementById('tipo');
    const creditoExtraFields = document.getElementById('credito-extra-fields');
    tipoTareaSelect.addEventListener('change', () => {
        if (tipoTareaSelect.value === 'Credito Extra') {
            creditoExtraFields.classList.remove('hidden');
        } else {
            creditoExtraFields.classList.add('hidden');
        }
    });

    createAssignmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(e.target).entries());
        try {
            const result = await fetchApi('createTask', payload);
            if (result.status === 'success') {
                alert('Tarea creada exitosamente.');
                e.target.reset();
                navDashboard.click();
            } else { throw new Error(result.message); }
        } catch (error) { alert(`Error: ${error.message}`); }
    });

    // --- Lógica de Dashboard (Asignación de Handlers) ---
    window.reactivateExam = async (entregaExamenId) => {
        if (!confirm("¿Estás seguro de que quieres reactivar este examen para el estudiante?")) return;
        try {
            const result = await fetchApi('reactivateExam', { entregaExamenId });
            if (result.status === 'success') {
                alert('Examen reactivado.');
                fetchTeacherActivity();
            } else { throw new Error(result.message); }
        } catch (error) { alert(`Error: ${error.message}`); }
    };

    window.openGradeModal = (entrega) => {
        currentEditingEntregaId = entrega.entregaId;
        document.getElementById('student-name-modal').textContent = entrega.alumnoNombre;
        document.getElementById('file-link-modal').href = entrega.archivoUrl;
        document.getElementById('calificacion').value = entrega.calificacion || '';
        document.getElementById('estado').value = entrega.estado || 'Revisada';
        document.getElementById('comentario').value = entrega.comentario || '';
        gradeModal.classList.remove('hidden');
    };

    saveGradeBtn.addEventListener('click', async () => {
        if (!currentEditingEntregaId) return;
        const payload = {
            entregaId: currentEditingEntregaId,
            calificacion: document.getElementById('calificacion').value,
            estado: document.getElementById('estado').value,
            comentario: document.getElementById('comentario').value
        };
        try {
            const result = await fetchApi('gradeSubmission', payload);
            if (result.status === 'success') {
                alert('Calificación guardada.');
                gradeModal.classList.add('hidden');
                fetchTeacherActivity();
            } else { throw new Error(result.message); }
        } catch (error) { alert(`Error: ${error.message}`); }
    });

    cancelGradeBtn.addEventListener('click', () => gradeModal.classList.add('hidden'));

    // --- LÓGICA DE CREACIÓN DE EXÁMENES ---
    let questionCount = 0;

    function getAnswerFieldsHtml(type) {
        switch (type) {
            case 'opcion_multiple':
                return `
                    <input type="text" data-name="opcionA" placeholder="Opción A" class="w-full p-2 border rounded" required>
                    <input type="text" data-name="opcionB" placeholder="Opción B" class="w-full p-2 border rounded" required>
                    <input type="text" data-name="opcionC" placeholder="Opción C" class="w-full p-2 border rounded" required>
                    <select data-name="respuestaCorrecta" class="w-full p-2 border rounded" required>
                        <option value="">Respuesta Correcta</option>
                        <option value="A">A</option> <option value="B">B</option> <option value="C">C</option>
                    </select>`;
            case 'completacion':
                return `<input type="text" data-name="respuestaCorrecta" placeholder="Respuesta correcta" class="w-full p-2 border rounded" required>`;
            case 'verdadero_falso':
                return `
                    <select data-name="respuestaCorrecta" class="w-full p-2 border rounded" required>
                        <option value="Verdadero">Verdadero</option> <option value="Falso">Falso</option>
                    </select>`;
            case 'termino_pareado':
                return `<textarea data-name="respuestaCorrecta" placeholder="Escribe los pares correctos, uno por línea, ej: Gato=Animal" class="w-full p-2 border rounded" rows="3" required></textarea>`;
            case 'respuesta_breve':
                return `<p class="text-sm text-gray-500">Este tipo de pregunta se califica manualmente.</p>`;
            default: return '';
        }
    }

    function addQuestion() {
        questionCount++;
        const questionId = `question-${questionCount}`;
        const questionHtml = `
            <div class="question-block border p-4 rounded-lg bg-gray-50" id="${questionId}">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-bold">Pregunta ${questionCount}</h4>
                    <button type="button" class="text-red-500 remove-question-btn">Eliminar</button>
                </div>
                <div class="space-y-2">
                    <textarea data-name="textoPregunta" placeholder="Texto de la pregunta" class="w-full p-2 border rounded" required></textarea>
                    <select data-name="preguntaTipo" class="w-full p-2 border rounded question-type-select">
                        <option value="opcion_multiple">Opción Múltiple</option>
                        <option value="completacion">Completación</option>
                        <option value="verdadero_falso">Verdadero/Falso</option>
                        <option value="termino_pareado">Término Pareado</option>
                        <option value="respuesta_breve">Respuesta Breve</option>
                    </select>
                    <div class="answer-fields space-y-2">${getAnswerFieldsHtml('opcion_multiple')}</div>
                </div>
            </div>`;
        questionsContainer.insertAdjacentHTML('beforeend', questionHtml);
    }

    addQuestionBtn.addEventListener('click', addQuestion);

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-question-btn')) {
            e.target.closest('.question-block').remove();
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('question-type-select')) {
            const answerContainer = e.target.closest('.question-block').querySelector('.answer-fields');
            answerContainer.innerHTML = getAnswerFieldsHtml(e.target.value);
        }
    });

    createExamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            titulo: formData.get('titulo'),
            asignatura: formData.get('asignatura'),
            gradoAsignado: formData.get('gradoAsignado'),
            seccionAsignada: formData.get('seccionAsignada'),
            fechaLimite: formData.get('fechaLimite'),
            tiempoLimite: formData.get('tiempoLimite'),
            preguntas: []
        };

        const questionBlocks = questionsContainer.querySelectorAll('.question-block');
        questionBlocks.forEach(block => {
            const preguntaTipo = block.querySelector('[data-name=preguntaTipo]').value;
            let opciones = {};
            let respuestaCorrecta = '';

            const respuestaCorrectaEl = block.querySelector('[data-name=respuestaCorrecta]');
            if(respuestaCorrectaEl) {
                respuestaCorrecta = respuestaCorrectaEl.value;
            }

            if (preguntaTipo === 'opcion_multiple') {
                opciones = {
                    A: block.querySelector('[data-name=opcionA]').value,
                    B: block.querySelector('[data-name=opcionB]').value,
                    C: block.querySelector('[data-name=opcionC]').value,
                };
            }

            payload.preguntas.push({
                preguntaTipo: preguntaTipo,
                textoPregunta: block.querySelector('[data-name=textoPregunta]').value,
                opciones: opciones,
                respuestaCorrecta: respuestaCorrecta
            });
        });

        if (payload.preguntas.length === 0) {
            alert("Debes añadir al menos una pregunta.");
            return;
        }

        try {
            const result = await fetchApi('createExam', payload);
            if (result.status === 'success') {
                alert('Examen creado exitosamente.');
                createExamForm.reset();
                questionsContainer.innerHTML = '';
                addQuestion();
                navDashboard.click();
            } else { throw new Error(result.message); }
        } catch (error) { alert(`Error: ${error.message}`); }
    });

    // --- Carga Inicial ---
    fetchTeacherActivity();
    addQuestion();
});
