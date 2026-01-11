
document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias al DOM ---
    const submissionsTableBody = document.getElementById('submissions-table-body');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // --- Autenticación ---
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

    // --- Elementos del Filtro Jerárquico ---
    const backBtn = document.getElementById('back-btn');
    const filterStepGrado = document.getElementById('filter-step-grado');
    const filterStepSeccion = document.getElementById('filter-step-seccion');
    const filterStepAlumno = document.getElementById('filter-step-alumno');
    const selectGrado = document.getElementById('filter-grado');
    const selectSeccion = document.getElementById('filter-seccion');
    const selectAlumno = document.getElementById('filter-alumno');
    const breadcrumbs = document.getElementById('filter-breadcrumbs');

    // --- Elementos del Lightbox ---
    const lightboxModal = document.getElementById('lightbox-modal');
    const closeLightboxBtn = document.getElementById('close-lightbox-btn');
    const lightboxImage = document.getElementById('lightbox-image');

    // --- Estado de la Aplicación ---
    let allActivities = [];
    let filterState = {
        step: 'grado', // 'grado', 'seccion', 'alumno', 'asignaciones'
        grado: '',
        seccion: '',
        alumnoId: ''
    };

    // --- Lógica de Navegación Principal ---
    function navigateTo(targetSection, navElement) {
        allSections.forEach(section => section.classList.add('hidden'));
        targetSection.classList.remove('hidden');
        allNavLinks.forEach(link => link.classList.remove('bg-gray-700', 'text-white'));
        navElement.classList.add('bg-gray-700', 'text-white');
    }

    navDashboard.addEventListener('click', () => navigateTo(sectionDashboard, navDashboard));
    navCrear.addEventListener('click', () => navigateTo(sectionCrear, navCrear));
    navCrearExamen.addEventListener('click', () => navigateTo(sectionCrearExamen, navCrearExamen));
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    // --- Lógica de Carga de Datos ---
    async function fetchAllActivities() {
        submissionsTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">Cargando actividad...</td></tr>';
        try {
            const [taskSubmissions, examSubmissions, allExams] = await Promise.all([
                fetchApi('TASK', 'getTeacherActivity', {}),
                fetchApi('EXAM', 'getTeacherExamActivity', {}),
                fetchApi('EXAM', 'getAllExams', {})
            ]);

            const submissions = [...(taskSubmissions.data || []), ...(examSubmissions.data || [])];
            const submittedExamIds = new Set((examSubmissions.data || []).map(s => s.examenId));
            const examsWithoutSubmissions = (allExams.data || []).filter(exam => !submittedExamIds.has(exam.examenId));

            allActivities = [...submissions, ...examsWithoutSubmissions];
            allActivities.sort((a, b) => new Date(b.fecha || b.fechaLimite) - new Date(a.fecha || a.fechaLimite));

            renderFilteredActivity();
        } catch (error) {
            submissionsTableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-red-500">Error al cargar actividad: ${error.message}</td></tr>`;
        }
    }

    // --- Lógica del Filtro Jerárquico ---

    function updateFilterUI() {
        // Ocultar todos los pasos
        [filterStepGrado, filterStepSeccion, filterStepAlumno].forEach(step => step.classList.add('hidden'));

        // Mostrar el paso actual
        if (filterState.step === 'grado') {
            filterStepGrado.classList.remove('hidden');
            backBtn.classList.add('hidden');
            breadcrumbs.textContent = 'Mostrando todas las entregas.';
        } else {
            backBtn.classList.remove('hidden');
            if (filterState.step === 'seccion') {
                filterStepGrado.classList.remove('hidden');
                filterStepSeccion.classList.remove('hidden');
                breadcrumbs.textContent = `Grado: ${filterState.grado}`;
            } else if (filterState.step === 'alumno' || filterState.step === 'asignaciones') {
                filterStepGrado.classList.remove('hidden');
                filterStepSeccion.classList.remove('hidden');
                filterStepAlumno.classList.remove('hidden');
                breadcrumbs.textContent = `Grado: ${filterState.grado} > Sección: ${filterState.seccion}`;
            }
        }
    }

    function renderFilteredActivity() {
        let activityToRender = allActivities;
        if (filterState.grado) {
            activityToRender = activityToRender.filter(item => (item.grado || item.gradoAsignado) === filterState.grado);
        }
        if (filterState.seccion) {
            activityToRender = activityToRender.filter(item => (item.seccion || item.seccionAsignada) === filterState.seccion);
        }
        if (filterState.alumnoId) {
            activityToRender = activityToRender.filter(item => item.userId === filterState.alumnoId);
        }
        renderActivity(activityToRender);
    }

    function populateSecciones() {
        const secciones = [...new Set(allActivities
            .filter(item => (item.grado || item.gradoAsignado) === filterState.grado)
            .map(item => item.seccion || item.seccionAsignada)
            .filter(Boolean)
        )];
        selectSeccion.innerHTML = '<option value="">-- Sección --</option>' + secciones.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    async function populateAlumnos() {
        try {
            const result = await fetchApi('USER', 'getStudentsByGroup', { grado: filterState.grado, seccion: filterState.seccion });
            if (result.status === 'success') {
                selectAlumno.innerHTML = '<option value="">-- Alumno --</option>' + result.data.map(a => `<option value="${a.userId}">${a.nombre}</option>`).join('');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error al cargar alumnos:', error);
            breadcrumbs.textContent = `Error al cargar alumnos: ${error.message}`;
        }
    }

    selectGrado.addEventListener('change', () => {
        filterState.grado = selectGrado.value;
        filterState.seccion = '';
        filterState.alumnoId = '';
        selectSeccion.innerHTML = '<option value="">-- Sección --</option>';
        selectAlumno.innerHTML = '<option value="">-- Alumno --</option>';

        if (filterState.grado) {
            filterState.step = 'seccion';
            populateSecciones();
        } else {
            filterState.step = 'grado';
        }
        updateFilterUI();
        renderFilteredActivity();
    });

    selectSeccion.addEventListener('change', () => {
        filterState.seccion = selectSeccion.value;
        filterState.alumnoId = '';
        selectAlumno.innerHTML = '<option value="">-- Alumno --</option>';

        if (filterState.seccion) {
            filterState.step = 'alumno';
            populateAlumnos();
        } else {
            filterState.step = 'seccion';
        }
        updateFilterUI();
        renderFilteredActivity();
    });

    selectAlumno.addEventListener('change', () => {
        filterState.alumnoId = selectAlumno.value;
        filterState.step = filterState.alumnoId ? 'asignaciones' : 'alumno';
        updateFilterUI();
        renderFilteredActivity();
    });

    backBtn.addEventListener('click', () => {
        if (filterState.step === 'asignaciones' || filterState.step === 'alumno') {
            filterState.step = 'seccion';
            filterState.alumnoId = '';
            filterState.seccion = '';
            selectAlumno.value = '';
            selectSeccion.value = '';
        } else if (filterState.step === 'seccion') {
            filterState.step = 'grado';
            filterState.grado = '';
             selectGrado.value = '';
        }
        updateFilterUI();
        renderFilteredActivity();
    });

    // --- Lógica de Renderizado de la Tabla ---
    function renderActivity(activity) {
        if (!activity || activity.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No se encontraron actividades.</td></tr>';
            return;
        }

        submissionsTableBody.innerHTML = activity.map(item => {
            // Lógica para el enlace del archivo
            let fileHtml = '<em>N/A</em>';
            if (item.archivoUrl) {
                if (item.mimeType && item.mimeType.startsWith('image/')) {
                    fileHtml = `<button class="text-blue-500 hover:underline view-file-btn" data-url="${item.archivoUrl}">Ver Imagen</button>`;
                } else {
                    fileHtml = `<a href="${item.archivoUrl}" target="_blank" download class="text-blue-500 hover:underline">Descargar</a>`;
                }
            }

            // Lógica para el botón de acción
            let actionHtml = '';
            if (item.tipo === 'Tarea' && item.entregaId) {
                actionHtml = `<button class="bg-blue-500 text-white px-2 py-1 rounded text-sm grade-task-btn" data-item='${JSON.stringify(item)}'>Calificar</button>`;
            } else if (item.tipo === 'Examen') {
                 if (item.alumnoNombre) { // Es una entrega de examen
                     if (item.estado === 'Bloqueado') {
                         actionHtml = `<button class="bg-yellow-500 text-white px-2 py-1 rounded text-sm reactivate-exam-btn" data-entrega-id="${item.entregaId}">Reactivar</button>`;
                     }
                 } else { // Es un examen base sin entregas
                     actionHtml = `<a href="exam-manager.html?examenId=${item.examenId}&view=submissions" class="bg-purple-500 text-white px-2 py-1 rounded text-sm">Ver Entregas</a>`;
                 }
            }

            return `
                <tr class="border-b">
                    <td class="p-4">${item.alumnoNombre || '<em>N/A</em>'}</td>
                    <td class="p-4">${item.titulo}</td>
                    <td class="p-4">${item.fecha ? new Date(item.fecha).toLocaleDateString() : '<em>N/A</em>'}</td>
                    <td class="p-4">${fileHtml}</td>
                    <td class="p-4">${item.calificacion || '<em>N/A</em>'}</td>
                    <td class="p-4">${item.estado || '<em>Pendiente</em>'}</td>
                    <td class="p-4">${actionHtml || 'N/A'}</td>
                </tr>`;
        }).join('');
    }

    // --- Lógica de Lightbox y Modales ---
    function openLightbox(url) {
        lightboxImage.src = url;
        lightboxModal.classList.remove('hidden');
    }

    function closeLightbox() {
        lightboxImage.src = '';
        lightboxModal.classList.add('hidden');
    }

    closeLightboxBtn.addEventListener('click', closeLightbox);
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            closeLightbox();
        }
    });

    // Delegación de eventos para la tabla (incluye lightbox y calificación)
    submissionsTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.classList.contains('view-file-btn')) {
            e.preventDefault();
            openLightbox(target.dataset.url);
        }
        if (target.classList.contains('grade-task-btn')) {
             openGradeModal(JSON.parse(target.dataset.item));
        }
        // ... (otros manejadores de eventos como reactivar examen, etc.)
    });

    // ... (El resto de la lógica de la página como el modal de calificación y la creación de tareas/exámenes se mantiene igual)

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
                fetchAllActivities(); // Recargar todo
            } else { throw new Error(result.message); }
        } catch (error) { alert(`Error al guardar calificación: ${error.message}`); }
    });


    // --- Inicialización ---
    fetchAllActivities();
    updateFilterUI();

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
                    <button type="button" class="text-red-500 remove-question-btn">Eliminar</button>
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

    if(createExamForm) {
        createExamForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const mainData = Object.fromEntries(new FormData(e.target).entries());
            const payload = { ...mainData, preguntas: [] };

            questionsContainer.querySelectorAll('.question-block').forEach(block => {
                const pregunta = {
                    preguntaTipo: block.querySelector('.question-type-select').value,
                    textoPregunta: block.querySelector('.question-text').value,
                    respuestaCorrecta: block.querySelector('.correct-answer').value,
                    opciones: ''
                };
                const optionsInput = block.querySelector('.question-options');
                if (optionsInput) pregunta.opciones = optionsInput.value;
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
                    navDashboard.click();
                } else { throw new Error(result.message || 'Error desconocido del servidor.'); }
            } catch (error) {
                console.error('Error al crear el examen:', error);
                alert(`Error al crear el examen: ${error.message}`);
            }
        });
    }
});
