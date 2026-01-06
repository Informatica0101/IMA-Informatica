document.addEventListener('DOMContentLoaded', () => {
    // --- Autenticación y Variables Globales ---
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
    const submissionsTableBody = document.getElementById('submissions-table-body');
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
        fetchSubmissions();
    });
    navCrear.addEventListener('click', () => navigateTo(sectionCrear, navCrear));
    navCrearExamen.addEventListener('click', () => navigateTo(sectionCrearExamen, navCrearExamen));

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    // --- API Helper ---
    async function fetchApi(action, payload) {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({ action, payload }),
            headers: { 'Content-Type': 'text/plain' }
        });
        return await response.json();
    }

    // --- Lógica de Tareas ---
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

    // --- Lógica de Entregas y Calificación ---
    async function fetchSubmissions() {
        submissionsTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">Cargando...</td></tr>';
        try {
            const result = await fetchApi('getTeacherSubmissions', {});
            if (result.status === 'success') {
                renderSubmissions(result.data);
            } else { throw new Error(result.message); }
        } catch (error) {
            submissionsTableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-red-500">Error: ${error.message}</td></tr>`;
        }
    }

    function renderSubmissions(submissions) {
        if (!submissions || submissions.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No hay entregas.</td></tr>';
            return;
        }
        submissionsTableBody.innerHTML = submissions.map(s => `
            <tr class="border-b">
                <td class="p-4">${s.alumnoNombre}</td>
                <td class="p-4">${s.tareaTitulo}</td>
                <td class="p-4">${s.fechaEntrega}</td>
                <td class="p-4"><a href="${s.archivoUrl}" target="_blank" class="text-blue-500">Ver Archivo</a></td>
                <td class="p-4">${s.calificacion || 'N/A'}</td>
                <td class="p-4">${s.estado || 'Pendiente'}</td>
                <td class="p-4"><button class="bg-blue-500 text-white px-2 py-1 rounded" onclick='openGradeModal(${JSON.stringify(s)})'>Calificar</button></td>
            </tr>
        `).join('');
    }

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
                fetchSubmissions();
            } else { throw new Error(result.message); }
        } catch (error) { alert(`Error: ${error.message}`); }
    });

    cancelGradeBtn.addEventListener('click', () => gradeModal.classList.add('hidden'));

    // --- LÓGICA DE CREACIÓN DE EXÁMENES ---
    let questionCount = 0;
    function addQuestion() {
        questionCount++;
        const questionHtml = `
            <div class="question-block border p-4 rounded-lg bg-gray-50" id="question-${questionCount}">
                <div class="flex justify-between items-center mb-4">
                    <label class="block font-bold">Pregunta ${questionCount}</label>
                    <button type="button" class="text-red-500 remove-question-btn">Eliminar</button>
                </div>
                <div class="space-y-2">
                    <textarea data-name="textoPregunta" placeholder="Texto de la pregunta" class="w-full p-2 border rounded" required></textarea>
                    <input type="text" data-name="opcionA" placeholder="Opción A" class="w-full p-2 border rounded" required>
                    <input type="text" data-name="opcionB" placeholder="Opción B" class="w-full p-2 border rounded" required>
                    <input type="text" data-name="opcionC" placeholder="Opción C" class="w-full p-2 border rounded" required>
                    <select data-name="respuestaCorrecta" class="w-full p-2 border rounded" required>
                        <option value="">Selecciona la respuesta correcta</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                    </select>
                </div>
            </div>
        `;
        questionsContainer.insertAdjacentHTML('beforeend', questionHtml);
    }

    addQuestionBtn.addEventListener('click', addQuestion);

    questionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-question-btn')) {
            e.target.closest('.question-block').remove();
        }
    });

    createExamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const payload = {
            titulo: formData.get('titulo'),
            asignatura: formData.get('asignatura'),
            gradoAsignado: formData.get('gradoAsignado'),
            fechaLimite: formData.get('fechaLimite'),
            preguntas: []
        };

        const questionBlocks = questionsContainer.querySelectorAll('.question-block');
        questionBlocks.forEach(block => {
            payload.preguntas.push({
                textoPregunta: block.querySelector('[data-name=textoPregunta]').value,
                opcionA: block.querySelector('[data-name=opcionA]').value,
                opcionB: block.querySelector('[data-name=opcionB]').value,
                opcionC: block.querySelector('[data-name=opcionC]').value,
                respuestaCorrecta: block.querySelector('[data-name=respuestaCorrecta]').value
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
                addQuestion(); // Dejar una pregunta por defecto
                navDashboard.click();
            } else { throw new Error(result.message); }
        } catch (error) { alert(`Error: ${error.message}`); }
    });

    // --- Carga Inicial ---
    fetchSubmissions();
    addQuestion(); // Añadir una pregunta por defecto al cargar la página de creación de examen
});
