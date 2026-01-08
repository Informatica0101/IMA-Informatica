document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.rol !== 'Estudiante' && currentUser.rol !== 'Alumno')) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('student-name').textContent = currentUser.nombre;
    const tasksList = document.getElementById('tasks-list');

    // --- Elementos del Modal ---
    const submissionModal = document.getElementById('submission-modal');
    const modalTaskTitle = document.getElementById('modal-task-title');
    const submissionForm = document.getElementById('submission-form');
    const fileInput = document.getElementById('file-input');
    const cancelSubmissionBtn = document.getElementById('cancel-submission-btn');
    let currentTaskId = null;

    // Función para obtener solo Tareas
    async function fetchStudentTasks() {
        tasksList.innerHTML = '<p class="text-gray-500">Cargando tareas...</p>';
        try {
            const payload = { userId: currentUser.userId, grado: currentUser.grado, seccion: currentUser.seccion };
            const tasksResult = await fetchApi('TASK', 'getStudentTasks', payload);

            if (tasksResult.status === 'success') {
                renderActivities(tasksResult.data);
            } else {
                throw new Error(tasksResult.message);
            }
        } catch (error) {
            tasksList.innerHTML = `<p class="text-red-500">Error al cargar tareas: ${error.message}</p>`;
        }
    }

    function renderActivities(activities) {
        if (!activities || activities.length === 0) {
            tasksList.innerHTML = '<p class="text-gray-500">No hay actividades pendientes.</p>';
            return;
        }
        tasksList.innerHTML = activities.map(activity => {
            let actionButtonHtml = `<button class="bg-blue-500 text-white px-4 py-2 rounded-lg open-submission-modal" data-task-id="${activity.tareaId}" data-task-title="${activity.titulo}">Entregar</button>`;

            return `
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-bold">${activity.titulo}</h3>
                    <p class="text-gray-600">${activity.descripcion || 'Sin descripción.'}</p>
                    <div class="mt-4">
                        ${actionButtonHtml}
                    </div>
                </div>
            `;
        }).join('');
    }

    // --- Delegación de Eventos para Abrir el Modal de Entrega ---
    tasksList.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('open-submission-modal')) {
            const taskId = e.target.dataset.taskId;
            const taskTitle = e.target.dataset.taskTitle;
            openSubmissionModal(taskId, taskTitle);
        }
    });

    // --- Lógica del Modal ---
    function openSubmissionModal(taskId, taskTitle) {
        currentTaskId = taskId;
        modalTaskTitle.textContent = taskTitle;
        submissionModal.classList.remove('hidden');
    }

    function closeSubmissionModal() {
        submissionModal.classList.add('hidden');
        submissionForm.reset();
    }

    cancelSubmissionBtn.addEventListener('click', closeSubmissionModal);

    submissionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        if (!file || !currentTaskId) {
            alert("Por favor, selecciona un archivo.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const fileData = reader.result;
            const payload = {
                userId: currentUser.userId,
                tareaId: currentTaskId,
                fileName: file.name,
                fileData: fileData,
                parcial: 'Primer Parcial', // Placeholder
                asignatura: 'Informática' // Placeholder
            };

            try {
                const result = await fetchApi('TASK', 'submitAssignment', payload);
                if (result.status === 'success') {
                    alert('¡Tarea entregada exitosamente!');
                    closeSubmissionModal();
                    fetchStudentTasks();
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                alert(`Error al entregar la tarea: ${error.message}`);
            }
        };
        reader.readAsDataURL(file);
    });

    fetchStudentTasks(); // Carga inicial
});
