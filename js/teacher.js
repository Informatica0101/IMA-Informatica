// --- Funciones Globales para Lógica Principal ---
let submissionsTableBody; // Se asignará en DOMContentLoaded

/**
 * Obtiene la actividad de tareas y exámenes de sus respectivos microservicios,
 * las combina y las renderiza en el dashboard.
 */
async function fetchTeacherActivity() {
    if (!submissionsTableBody) {
        console.error("submissionsTableBody no está inicializado.");
        return;
    }
    submissionsTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">Cargando actividad...</td></tr>';
    try {
        // Llamadas en paralelo a ambos microservicios
        const [tasksResult, examsResult] = await Promise.all([
            fetchApi('TASK', 'getTeacherActivity', {}),
            fetchApi('EXAM', 'getTeacherExamActivity', {})
        ]);

        if (tasksResult.status !== 'success' || examsResult.status !== 'success') {
            const taskError = tasksResult.message || 'Error desconocido en Tareas.';
            const examError = examsResult.message || 'Error desconocido en Exámenes.';
            throw new Error(`Error Tareas: ${taskError} | Error Exámenes: ${examError}`);
        }

        // Combinar y ordenar los resultados por fecha
        const allActivity = [...(tasksResult.data || []), ...(examsResult.data || [])];
        allActivity.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        renderActivity(allActivity);

    } catch (error) {
        submissionsTableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-red-500">Error al cargar actividad: ${error.message}</td></tr>`;
    }
}

/**
 * Renderiza la lista de actividades combinadas en la tabla del dashboard.
 * @param {Array<object>} activity - La lista de entregas de tareas y exámenes.
 */
function renderActivity(activity) {
    // ... (La función de renderizado no necesita cambios, ya que maneja 'tipo' Tarea o Examen)
    if (!submissionsTableBody) {
        console.error("submissionsTableBody no está inicializado.");
        return;
    }
    if (!activity || activity.length === 0) {
        submissionsTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No hay actividad reciente.</td></tr>';
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
    submissionsTableBody = document.getElementById('submissions-table-body');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.rol !== 'Profesor') {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('teacher-name').textContent = currentUser.nombre;

    // --- Elementos y Lógica de Navegación ---
    const navDashboard = document.getElementById('nav-dashboard');
    const navCrear = document.getElementById('nav-crear');
    const navCrearExamen = document.getElementById('nav-crear-examen');
    const sectionDashboard = document.getElementById('section-dashboard');
    const sectionCrear = document.getElementById('section-crear');
    const sectionCrearExamen = document.getElementById('section-crear-examen');
    const createAssignmentForm = document.getElementById('create-assignment-form');
    const createExamForm = document.getElementById('create-exam-form');
    const logoutButton = document.getElementById('logout-button');

    function navigateTo(targetSection, navElement) { /* ... (sin cambios) ... */ }
    navDashboard.addEventListener('click', () => { navigateTo(sectionDashboard, navDashboard); fetchTeacherActivity(); });
    navCrear.addEventListener('click', () => navigateTo(sectionCrear, navCrear));
    navCrearExamen.addEventListener('click', () => navigateTo(sectionCrearExamen, navCrearExamen));
    logoutButton.addEventListener('click', () => { localStorage.removeItem('currentUser'); window.location.href = 'login.html'; });

    // --- Lógica de Crear Tarea -> Apunta a TASK service ---
    createAssignmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(e.target).entries());
        try {
            const result = await fetchApi('TASK', 'createTask', payload);
            if (result.status === 'success') {
                alert('Tarea creada exitosamente.');
                e.target.reset();
                navDashboard.click();
            } else { throw new Error(result.message); }
        } catch (error) { alert(`Error al crear tarea: ${error.message}`); }
    });

    // --- Lógica de Dashboard (Asignación de Handlers) ---
    const gradeModal = document.getElementById('grade-modal');
    const saveGradeBtn = document.getElementById('save-grade-btn');
    const cancelGradeBtn = document.getElementById('cancel-grade-btn');
    let currentEditingEntregaId = null;

    // Reactivar Examen -> Apunta a EXAM service
    window.reactivateExam = async (entregaExamenId) => {
        if (!confirm("¿Estás seguro de que quieres reactivar este examen?")) return;
        try {
            const result = await fetchApi('EXAM', 'reactivateExam', { entregaExamenId });
            if (result.status === 'success') {
                alert('Examen reactivado.');
                fetchTeacherActivity();
            } else { throw new Error(result.message); }
        } catch (error) { alert(`Error: ${error.message}`); }
    };

    window.openGradeModal = (entrega) => { /* ... (sin cambios) ... */ };

    // Guardar Calificación (para Tareas) -> Apunta a TASK service
    saveGradeBtn.addEventListener('click', async () => {
        if (!currentEditingEntregaId) return;
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
                gradeModal.classList.add('hidden');
                fetchTeacherActivity();
            } else { throw new Error(result.message); }
        } catch (error) { alert(`Error al guardar calificación: ${error.message}`); }
    });

    cancelGradeBtn.addEventListener('click', () => gradeModal.classList.add('hidden'));

    // --- Lógica de Crear Examen -> Apunta a EXAM service ---
    const questionsContainer = document.getElementById('questions-container');
    const addQuestionBtn = document.getElementById('add-question-btn');
    // ... (funciones addQuestion, getAnswerFieldsHtml, y listeners no necesitan cambios)

    createExamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        // ... (código para construir el payload de preguntas no cambia)
        const payload = {/* ... */};
         if (payload.preguntas.length === 0) {
            alert("Debes añadir al menos una pregunta.");
            return;
        }

        try {
            // Apuntar al microservicio de exámenes
            const result = await fetchApi('EXAM', 'createExam', payload);
            if (result.status === 'success') {
                alert('Examen creado exitosamente.');
                // ... (resetear formulario)
                navDashboard.click();
            } else { throw new Error(result.message); }
        } catch (error) { alert(`Error al crear examen: ${error.message}`); }
    });

    // --- Carga Inicial ---
    fetchTeacherActivity();
});
