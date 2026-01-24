document.addEventListener('DOMContentLoaded', () => {
    const submissionsTableBody = document.getElementById('submissions-table-body');
    const submissionsTableHead = document.getElementById('submissions-table-head');
    const navTitle = document.getElementById('nav-title');
    const backBtn = document.getElementById('back-btn');
    const searchContainer = document.getElementById('search-container');
    const studentSearch = document.getElementById('student-search');
    const logoutButton = document.getElementById('logout-button');
    const teacherNameSpan = document.getElementById('teacher-name');

    const sectionDashboard = document.getElementById('section-dashboard');
    const sectionCrear = document.getElementById('section-crear');
    const sectionCrearExamen = document.getElementById('section-crear-examen');
    const createAssignmentForm = document.getElementById('create-assignment-form');
    const createExamForm = document.getElementById('create-exam-form');
    const dashboardActions = document.getElementById('dashboard-actions');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser || currentUser.rol !== 'Profesor') {
        window.location.href = 'login.html';
        return;
    }
    teacherNameSpan.textContent = currentUser.nombre;

    // --- Estado ---
    let allActivity = [];
    let navStack = [{ level: 'grados', filter: null, title: 'Grados' }];
    let currentExamTab = 'tareas';
    let searchQuery = '';

    // --- Navegación ---
    function pushNav(level, filter, title) {
        navStack.push({ level, filter, title });
        studentSearch.value = '';
        searchQuery = '';
        render();
    }

    function popNav() {
        if (navStack.length > 1) {
            navStack.pop();
            studentSearch.value = '';
            searchQuery = '';
            render();
        }
    }

    backBtn.addEventListener('click', popNav);

    window.showCreateAssignment = () => showSection(sectionCrear);
    window.showCreateExam = () => showSection(sectionCrearExamen);

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    // --- Datos ---
    async function fetchData() {
        navTitle.textContent = 'Cargando datos...';
        try {
            const [tasksResult, examsResult] = await Promise.all([
                fetchApi('TASK', 'getTeacherActivity', {}),
                fetchApi('EXAM', 'getTeacherExamActivity', {})
            ]);

            const tasks = (tasksResult.data || []).map(item => ({ ...item, type: 'Tarea' }));
            const exams = (examsResult.data || []).map(item => ({ ...item, type: 'Examen' }));

            allActivity = [...tasks, ...exams];
            allActivity.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            render();
        } catch (error) {
            navTitle.textContent = 'Error';
            submissionsTableBody.innerHTML = `<tr><td class="p-4 text-red-500 text-center">Error: ${error.message}</td></tr>`;
        }
    }

    // --- Renderizado ---
    function render() {
        const currentState = navStack[navStack.length - 1];
        navTitle.textContent = currentState.title;
        backBtn.classList.toggle('hidden', navStack.length === 1);
        searchContainer.classList.toggle('hidden', currentState.level !== 'alumnos' && currentState.level !== 'detalles');

        let filtered = allActivity;
        navStack.forEach(step => {
            if (step.level === 'secciones') filtered = filtered.filter(item => item.grado === step.filter);
            else if (step.level === 'asignaturas') filtered = filtered.filter(item => item.seccion === step.filter);
            else if (step.level === 'alumnos') filtered = filtered.filter(item => item.asignatura === step.filter);
            else if (step.level === 'detalles') filtered = filtered.filter(item => item.alumnoNombre === step.filter);
        });

        if (currentState.level === 'grados') renderGrados(filtered);
        else if (currentState.level === 'secciones') renderSecciones(filtered);
        else if (currentState.level === 'asignaturas') renderAsignaturas(filtered);
        else if (currentState.level === 'alumnos') renderAlumnos(filtered);
        else if (currentState.level === 'detalles') renderDetalles(filtered);
    }

    function renderGrados(data) {
        const uniqueGrados = [...new Set(data.map(item => item.grado))].filter(Boolean).sort();
        submissionsTableHead.innerHTML = `<tr><th class="p-4 text-custom-plus font-bold">Grado</th></tr>`;
        submissionsTableBody.innerHTML = uniqueGrados.map(grado => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="p-4"><span class="nav-btn text-custom-plus font-bold" data-level="secciones" data-filter="${grado}">${grado}</span></td>
            </tr>`).join('');
    }

    function renderSecciones(data) {
        const uniqueSecciones = [...new Set(data.map(item => item.seccion))].filter(Boolean).sort();
        submissionsTableHead.innerHTML = `<tr><th class="p-4 text-custom-plus font-bold">Sección</th></tr>`;
        submissionsTableBody.innerHTML = uniqueSecciones.map(seccion => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="p-4"><span class="nav-btn text-custom-plus font-bold" data-level="asignaturas" data-filter="${seccion}">${seccion}</span></td>
            </tr>`).join('');
    }

    function renderAsignaturas(data) {
        const uniqueAsignaturas = [...new Set(data.map(item => item.asignatura))].filter(Boolean).sort();
        submissionsTableHead.innerHTML = `<tr><th class="p-4 text-custom-plus font-bold">Asignatura</th></tr>`;
        let html = uniqueAsignaturas.map(asig => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="p-4"><span class="nav-btn text-custom-plus font-bold" data-level="alumnos" data-filter="${asig}">${asig}</span></td>
            </tr>`).join('');
        html += `
            <tr class="bg-gray-50">
                <td class="p-4 border-t border-gray-200">
                    <div class="flex gap-4">
                        <span class="nav-btn text-sm text-blue-600 font-bold" onclick="window.showCreateAssignment()">+ Nueva Tarea</span>
                        <span class="nav-btn text-sm text-purple-600 font-bold" onclick="window.showCreateExam()">+ Nuevo Examen</span>
                    </div>
                </td>
            </tr>`;
        submissionsTableBody.innerHTML = html;
    }

    function renderAlumnos(data) {
        let displayData = data;
        if (currentExamTab === 'examenes') displayData = data.filter(item => item.type === 'Examen');
        else displayData = data.filter(item => item.type === 'Tarea');

        if (searchQuery) displayData = displayData.filter(item => item.alumnoNombre.toLowerCase().includes(searchQuery.toLowerCase()));

        submissionsTableHead.innerHTML = `
            <tr>
                <th class="p-4 text-custom-plus font-bold">Nombre del Alumno</th>
                <th class="p-4 text-right">
                    <div class="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                        <button onclick="window.setExamTab('tareas')" class="px-3 py-1.5 text-xs font-semibold rounded-md ${currentExamTab === 'tareas' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'} transition-all">Tareas</button>
                        <button onclick="window.setExamTab('examenes')" class="px-3 py-1.5 text-xs font-semibold rounded-md ${currentExamTab === 'examenes' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'} transition-all ml-1">Exámenes</button>
                    </div>
                </th>
            </tr>`;

        if (currentExamTab === 'tareas') {
            const alumnosMap = {};
            displayData.forEach(item => {
                if (!alumnosMap[item.alumnoNombre]) alumnosMap[item.alumnoNombre] = { nombre: item.alumnoNombre, pendientes: 0 };
                if (!item.calificacion && item.estado !== 'Revisada') alumnosMap[item.alumnoNombre].pendientes++;
            });
            const alumnosList = Object.values(alumnosMap).sort((a, b) => a.nombre.localeCompare(b.nombre));
            if (alumnosList.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="2" class="p-4 text-center">No hay alumnos con tareas.</td></tr>'; return; }
            submissionsTableBody.innerHTML = alumnosList.map(alumno => `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4"><span class="nav-btn text-custom-plus font-bold" data-level="detalles" data-filter="${alumno.nombre}">${alumno.nombre}</span></td>
                    <td class="p-4 text-right">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${alumno.pendientes > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                            ${alumno.pendientes > 0 ? `${alumno.pendientes} pendientes` : 'Al día'}
                        </span>
                    </td>
                </tr>`).join('');
        } else {
            if (displayData.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="2" class="p-4 text-center">No hay exámenes entregados.</td></tr>'; return; }
            submissionsTableBody.innerHTML = displayData.map(item => `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4">
                        <div class="flex flex-col">
                            <span class="nav-btn text-custom-plus font-bold" data-level="detalles" data-filter="${item.alumnoNombre}">${item.alumnoNombre}</span>
                            <span class="text-xs text-gray-400">${item.titulo}</span>
                        </div>
                    </td>
                    <td class="p-4 text-right">
                        <button class="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors grade-exam-btn" data-item='${JSON.stringify(item)}'>Calificar Examen</button>
                    </td>
                </tr>`).join('');
        }
    }

    function renderDetalles(data) {
        let displayData = data;
        if (searchQuery) displayData = data.filter(item => item.titulo.toLowerCase().includes(searchQuery.toLowerCase()));
        submissionsTableHead.innerHTML = `<tr><th class="p-4">Actividad</th><th class="p-4">Fecha</th><th class="p-4">Archivo</th><th class="p-4">Calificación</th><th class="p-4">Acción</th></tr>`;
        if (displayData.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center">No hay entregas registradas.</td></tr>'; return; }
        submissionsTableBody.innerHTML = displayData.map(item => {
            let actionHtml = '';
            if (item.type === 'Tarea') {
                actionHtml = `<button class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors grade-task-btn" data-item='${JSON.stringify(item)}'>Calificar</button>`;
            } else if (item.type === 'Examen') {
                actionHtml = item.estado === 'Bloqueado' ?
                    `<button class="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-yellow-600 transition-colors reactivate-exam-btn" data-entrega-id="${item.entregaId}">Reactivar</button>` :
                    `<button class="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors grade-exam-btn" data-item='${JSON.stringify(item)}'>Calificar Examen</button>`;
            }
            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4 font-medium text-gray-700">${item.titulo}</td>
                    <td class="p-4 text-gray-500 text-sm">${item.fecha}</td>
                    <td class="p-4 scroll-horizontal-clean">${item.archivoUrl ? `<a href="${item.archivoUrl}" target="_blank" class="text-blue-600 hover:underline text-sm whitespace-nowrap">Ver Archivo</a>` : 'N/A'}</td>
                    <td class="p-4"><span class="font-bold ${item.calificacion >= 70 ? 'text-green-600' : 'text-red-600'}">${item.calificacion || 'Pte'}</span></td>
                    <td class="p-4">${actionHtml}</td>
                </tr>`;
        }).join('');
    }

    function showSection(section) {
        [sectionDashboard, sectionCrear, sectionCrearExamen].forEach(s => s.classList.add('hidden'));
        section.classList.remove('hidden');
        if (section !== sectionDashboard) {
            backBtn.classList.remove('hidden');
            backBtn.onclick = () => { showSection(sectionDashboard); render(); backBtn.onclick = popNav; };
        } else {
            backBtn.onclick = popNav;
            render();
        }
    }

    submissionsTableBody.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('nav-btn')) pushNav(target.dataset.level, target.dataset.filter, target.dataset.filter);
        if (target.classList.contains('grade-task-btn')) openGradeModal(JSON.parse(target.dataset.item), 'TASK');
        if (target.classList.contains('grade-exam-btn')) openGradeModal(JSON.parse(target.dataset.item), 'EXAM');
        if (target.classList.contains('reactivate-exam-btn')) {
            const entregaId = target.dataset.entregaId;
            if (confirm("¿Reactivar este examen?")) reactivateExam(entregaId);
        }
    });

    window.setExamTab = (tab) => { currentExamTab = tab; render(); };
    studentSearch.addEventListener('input', (e) => { searchQuery = e.target.value; render(); });

    async function reactivateExam(entregaId) {
        try {
            const result = await fetchApi('EXAM', 'reactivateExam', { entregaExamenId: entregaId });
            if (result.status === 'success') { alert('Examen reactivado.'); fetchData(); }
            else throw new Error(result.message);
        } catch (error) { alert(`Error: ${error.message}`); }
    }

    const gradeModal = document.getElementById('grade-modal');
    const saveGradeBtn = document.getElementById('save-grade-btn');
    const cancelGradeBtn = document.getElementById('cancel-grade-btn');
    let currentEditingItem = null;
    let currentEditingType = null;

    function openGradeModal(item, type) {
        currentEditingItem = item;
        currentEditingType = type;
        document.getElementById('student-name-modal').textContent = item.alumnoNombre;
        const fileLink = document.getElementById('file-link-modal');
        if (item.archivoUrl) { fileLink.href = item.archivoUrl; fileLink.classList.remove('hidden'); }
        else fileLink.classList.add('hidden');
        document.getElementById('calificacion').value = item.calificacion || '';
        document.getElementById('estado').value = item.estado || (type === 'TASK' ? 'Revisada' : 'Entregado');
        document.getElementById('comentario').value = item.comentario || '';
        gradeModal.classList.remove('hidden');
    }

    cancelGradeBtn.addEventListener('click', () => gradeModal.classList.add('hidden'));

    saveGradeBtn.addEventListener('click', async () => {
        const payload = {
            entregaId: currentEditingItem.entregaId,
            calificacion: document.getElementById('calificacion').value,
            estado: document.getElementById('estado').value,
            comentario: document.getElementById('comentario').value
        };
        try {
            const action = currentEditingType === 'TASK' ? 'gradeSubmission' : 'gradeExamSubmission';
            const result = await fetchApi(currentEditingType, action, payload);
            if (result.status === 'success') { alert('Calificación guardada.'); gradeModal.classList.add('hidden'); fetchData(); }
            else throw new Error(result.message);
        } catch (error) { alert(`Error: ${error.message}`); }
    });

    createAssignmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(e.target).entries());
        try {
            const result = await fetchApi('TASK', 'createTask', payload);
            if (result.status === 'success') { alert('Tarea creada.'); e.target.reset(); showSection(sectionDashboard); fetchData(); }
            else throw new Error(result.message);
        } catch (error) { alert(`Error: ${error.message}`); }
    });

    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionsContainer = document.getElementById('questions-container');
    let questionCounter = 0;

    function addQuestion() {
        questionCounter++;
        const div = document.createElement('div');
        div.className = 'question-block border p-4 rounded-lg relative';
        div.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h4 class="font-bold">Pregunta ${questionCounter}</h4>
                <button type="button" class="text-red-500 remove-question-btn">Eliminar</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block font-medium mb-1">Tipo</label>
                    <select class="w-full p-2 border rounded question-type-select">
                        <option value="opcion_multiple">Opción Múltiple</option>
                        <option value="completacion">Completación</option>
                        <option value="verdadero_falso">Verdadero/Falso</option>
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label class="block font-medium mb-1">Texto</label>
                    <input type="text" class="w-full p-2 border rounded question-text" required>
                </div>
                <div class="md:col-span-2 options-container"></div>
                <div>
                    <label class="block font-medium mb-1">Respuesta Correcta</label>
                    <input type="text" class="w-full p-2 border rounded correct-answer" required>
                </div>
            </div>`;
        questionsContainer.appendChild(div);
        const typeSelect = div.querySelector('.question-type-select');
        const optContainer = div.querySelector('.options-container');
        typeSelect.addEventListener('change', () => {
            optContainer.innerHTML = typeSelect.value === 'opcion_multiple' ? `<label class="block font-medium mb-1">Opciones (coma)</label><input type="text" class="w-full p-2 border rounded question-options">` : '';
        });
        typeSelect.dispatchEvent(new Event('change'));
    }

    addQuestionBtn.addEventListener('click', addQuestion);
    questionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-question-btn')) e.target.closest('.question-block').remove();
    });

    createExamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(createExamForm);
        const payload = {
            titulo: formData.get('titulo'), asignatura: formData.get('asignatura'),
            gradoAsignado: formData.get('gradoAsignado'), seccionAsignada: formData.get('seccionAsignada'),
            fechaLimite: formData.get('fechaLimite'), tiempoLimite: formData.get('tiempoLimite'),
            preguntas: []
        };
        questionsContainer.querySelectorAll('.question-block').forEach(block => {
            payload.preguntas.push({
                preguntaTipo: block.querySelector('.question-type-select').value,
                textoPregunta: block.querySelector('.question-text').value,
                respuestaCorrecta: block.querySelector('.correct-answer').value,
                opciones: block.querySelector('.question-options')?.value || ''
            });
        });
        try {
            const result = await fetchApi('EXAM', 'createExam', payload);
            if (result.status === 'success') { alert('Examen creado.'); e.target.reset(); questionsContainer.innerHTML = ''; showSection(sectionDashboard); fetchData(); }
            else throw new Error(result.message);
        } catch (error) { alert(`Error: ${error.message}`); }
    });

    fetchData();
});
