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
            const [taskSubmissions, examSubmissions, allExams] = await Promise.all([
                fetchApi('TASK', 'getTeacherActivity', {}),
                fetchApi('EXAM', 'getTeacherExamActivity', {}),
                fetchApi('EXAM', 'getAllExams', {}) // Endpoint para obtener todos los exámenes base
            ]);

            console.log("Task Submissions:", taskSubmissions);
            console.log("Exam Submissions:", examSubmissions);
            console.log("All Exams:", allExams);

            const submissions = [...(taskSubmissions.data || []), ...(examSubmissions.data || [])];

            // Mapear las entregas a sus IDs de examen para no mostrarlos duplicados
            const submittedExamIds = new Set((examSubmissions.data || []).map(s => s.examenId));

            // Filtrar los exámenes base para mostrar solo aquellos sin entregas
            const examsWithoutSubmissions = (allExams.data || []).filter(exam => !submittedExamIds.has(exam.examenId));

            // Combinar las entregas con los exámenes que aún no tienen entregas
            const allActivity = [...submissions, ...examsWithoutSubmissions];

            console.log("Final Activity List:", allActivity);

            allActivity.sort((a, b) => new Date(b.fecha || b.fechaLimite) - new Date(a.fecha || a.fechaLimite));
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
            let fileLinkHtml = '<em>N/A</em>';

            // Genera el enlace para ver el archivo de la entrega.
            if (item.fileId && item.mimeType) {
                if (item.mimeType.startsWith('image/')) {
                    // Si es una imagen, se crea un enlace para abrir el lightbox.
                    fileLinkHtml = `<a href="#" class="text-blue-500 view-file-link" data-file-id="${item.fileId}" data-title="${item.titulo}">Ver Imagen</a>`;
                } else {
                    // Para otros tipos de archivo, se genera un enlace de descarga directa.
                    const downloadUrl = `https://drive.google.com/uc?export=download&id=${item.fileId}`;
                    fileLinkHtml = `<a href="${downloadUrl}" target="_blank" class="text-blue-500" download>Descargar Archivo</a>`;
                }
            }

            // Si el item tiene `alumnoNombre`, es una entrega. Si no, es un examen base.
            if (item.alumnoNombre) {
                if (item.tipo === 'Tarea') {
                    actionHtml = `<button class="bg-blue-500 text-white px-2 py-1 rounded text-sm grade-task-btn" data-item='${JSON.stringify(item)}'>Calificar</button>`;
                } else if (item.tipo === 'Examen' && item.estado === 'Bloqueado') {
                    actionHtml = `<button class="bg-yellow-500 text-white px-2 py-1 rounded text-sm reactivate-exam-btn" data-entrega-id="${item.entregaId}">Reactivar</button>`;
                }
            } else if (item.tipo === 'Examen') {
                // Es un examen sin entregas, mostrar botones de control
                const isActivo = item.estado === 'Activo';
                const isBloqueado = item.estado === 'Bloqueado';
                actionHtml = `
                    <div class="flex space-x-2">
                        <button class="bg-green-500 text-white px-2 py-1 rounded text-sm activate-exam-btn" data-examen-id="${item.examenId}" ${isActivo ? 'disabled' : ''}>Activar</button>
                        <button class="bg-red-500 text-white px-2 py-1 rounded text-sm lock-exam-btn" data-examen-id="${item.examenId}" ${isBloqueado ? 'disabled' : ''}>Bloquear</button>
                    </div>
                `;
            }

            return `
                <tr class="border-b">
                    <td class="p-4">${item.alumnoNombre || '<em>N/A</em>'}</td>
                    <td class="p-4">${item.titulo}</td>
                    <td class="p-4">${item.fecha ? new Date(item.fecha).toLocaleDateString() : '<em>N/A</em>'}</td>
                    <td class="p-4">${fileLinkHtml}</td>
                    <td class="p-4">${item.calificacion || '<em>N/A</em>'}</td>
                    <td class="p-4">${item.estado || '<em>Pendiente</em>'}</td>
                    <td class="p-4">${actionHtml}</td>
                </tr>`;
        }).join('');
    }

    // --- Lógica del Lightbox de Imágenes ---
    const lightboxModal = document.getElementById('image-lightbox-modal');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const closeLightboxBtn = document.getElementById('close-lightbox-btn');

    function openLightbox(fileId, title) {
        // Construye la URL de la miniatura para la imagen en Google Drive, que es más fiable para <img src>.
        const imageUrl = `https://drive.google.com/thumbnail?id=${fileId}`;
        lightboxImage.src = imageUrl;
        lightboxTitle.textContent = title;
        lightboxModal.classList.remove('hidden');
    }

    function closeLightbox() {
        lightboxModal.classList.add('hidden');
        lightboxImage.src = ''; // Limpia el src para evitar flashes de contenido anterior
    }

    closeLightboxBtn.addEventListener('click', closeLightbox);

    // --- Lógica del Modal de Calificación ---
    const gradeModal = document.getElementById('grade-modal');
    const saveGradeBtn = document.getElementById('save-grade-btn');
    const cancelGradeBtn = document.getElementById('cancel-grade-btn');
    let currentEditingEntregaId = null;

    function openGradeModal(entrega) {
        currentEditingEntregaId = entrega.entregaId;
        document.getElementById('student-name-modal').textContent = entrega.alumnoNombre;
        document.getElementById('file-link-modal').href = `https://drive.google.com/uc?export=download&id=${entrega.fileId}`;
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

        // Previene la acción por defecto si es un enlace para el lightbox.
        if (target.classList.contains('view-file-link')) {
            e.preventDefault();
            openLightbox(target.dataset.fileId, target.dataset.title);
        }

        // Calificar Tarea
        if (target.classList.contains('grade-task-btn')) {
            openGradeModal(JSON.parse(target.dataset.item));
        }

        // Reactivar Examen de una entrega específica
        if (target.classList.contains('reactivate-exam-btn')) {
            const entregaId = target.dataset.entregaId;
            if (confirm("¿Reactivar este examen para este alumno?")) {
                try {
                    const result = await fetchApi('EXAM', 'reactivateExam', { entregaExamenId: entregaId });
                    if (result.status === 'success') {
                        alert('Examen reactivado.');
                        fetchTeacherActivity();
                    } else { throw new Error(result.message); }
                } catch (error) { alert(`Error: ${error.message}`); }
            }
        }

        // Activar un examen para todos
        if (target.classList.contains('activate-exam-btn')) {
            const examenId = target.dataset.examenId;
            if (confirm("¿Activar este examen para todos los alumnos asignados?")) {
                try {
                    const result = await fetchApi('EXAM', 'updateExamStatus', { examenId, estado: 'Activo' });
                    if (result.status === 'success') {
                        alert('Examen activado.');
                        fetchTeacherActivity();
                    } else { throw new Error(result.message); }
                } catch (error) { alert(`Error: ${error.message}`); }
            }
        }

        // Bloquear un examen para todos
        if (target.classList.contains('lock-exam-btn')) {
            const examenId = target.dataset.examenId;
            if (confirm("¿Bloquear este examen para todos los alumnos?")) {
                try {
                    const result = await fetchApi('EXAM', 'updateExamStatus', { examenId, estado: 'Bloqueado' });
                    if (result.status === 'success') {
                        alert('Examen bloqueado.');
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
