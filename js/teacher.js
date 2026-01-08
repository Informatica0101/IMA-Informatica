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

    // Add logic for createExamForm if it exists
    if(createExamForm) {
        createExamForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Logic to gather exam data, including questions
            const payload = {}; // Placeholder
            try {
                const result = await fetchApi('EXAM', 'createExam', payload);
                if (result.status === 'success') {
                    alert('Examen creado.');
                    e.target.reset();
                    navDashboard.click();
                } else { throw new Error(result.message); }
            } catch (error) { alert(`Error: ${error.message}`); }
        });
    }

    // Carga Inicial
    fetchTeacherActivity();
});
