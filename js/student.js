document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.rol !== 'Estudiante' && currentUser.rol !== 'Alumno')) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('student-name').textContent = currentUser.nombre;
    const tasksList = document.getElementById('tasks-list');
    const logoutButton = document.getElementById('logout-button');

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    // --- Elementos del Modal ---
    const submissionModal = document.getElementById('submission-modal');
    const modalTaskTitle = document.getElementById('modal-task-title');
    const submissionForm = document.getElementById('submission-form');
    const fileInput = document.getElementById('file-input');
    const cancelSubmissionBtn = document.getElementById('cancel-submission-btn');
    let currentTaskId = null;

    // Función para obtener Tareas y Exámenes
    async function fetchAllActivities() {
        tasksList.innerHTML = '<p class="text-gray-500">Cargando actividades...</p>';
        try {
            const payload = { userId: currentUser.userId, grado: currentUser.grado, seccion: currentUser.seccion };

            // Realizar ambas llamadas a la API en paralelo
            const [tasksResult, examsResult] = await Promise.all([
                fetchApi('TASK', 'getStudentTasks', payload),
                fetchApi('EXAM', 'getStudentExams', payload) // Asumiendo que este endpoint existe
            ]);

            // Combinar y renderizar los resultados
            const allActivities = [];
            if (tasksResult.status === 'success' && tasksResult.data) {
                allActivities.push(...tasksResult.data.map(task => ({ ...task, type: 'Tarea' })));
            }
            if (examsResult.status === 'success' && examsResult.data) {
                allActivities.push(...examsResult.data.map(exam => ({ ...exam, type: 'Examen' })));
            }

            // Ordenar por fecha límite, si existe
            allActivities.sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite));

            renderActivities(allActivities);

        } catch (error) {
            tasksList.innerHTML = `<p class="text-red-500">Error al cargar actividades: ${error.message}</p>`;
        }
    }

    function renderActivities(activities) {
        if (!activities || activities.length === 0) {
            tasksList.innerHTML = '<p class="text-gray-500">No hay actividades pendientes.</p>';
            return;
        }
        tasksList.innerHTML = activities.map(activity => {
            let feedbackHtml = '';
            let actionButtonHtml = '';

            if (activity.type === 'Tarea') {
                if (activity.entrega) {
                    const statusColor = activity.entrega.estado === 'Revisada' ? 'text-green-600' : (activity.entrega.estado === 'Rechazada' ? 'text-red-600' : 'text-yellow-600');
                    feedbackHtml = `
                        <div class="mt-4 p-4 bg-gray-100 rounded-lg">
                            <h4 class="font-bold text-md">Estado de tu Entrega:</h4>
                            <p class="font-semibold ${statusColor}">${activity.entrega.estado}</p>
                            ${activity.entrega.calificacion ? `<p><strong>Calificación:</strong> ${activity.entrega.calificacion}</p>` : ''}
                            ${activity.entrega.comentario ? `<p><strong>Comentario:</strong> ${activity.entrega.comentario}</p>` : ''}
                        </div>`;
                } else {
                    actionButtonHtml = `<button class="bg-blue-500 text-white px-4 py-2 rounded-lg open-submission-modal" data-task-id="${activity.tareaId}" data-task-title="${activity.titulo}">Entregar Tarea</button>`;
                }
            } else if (activity.type === 'Examen') {
                const estado = activity.estado || 'Pendiente'; // Estado del examen base o de la entrega
                const calificacion = activity.calificacionTotal;

                if (estado === 'Activo') {
                    actionButtonHtml = `<a href="exam.html?examenId=${activity.examenId}" class="bg-purple-500 text-white px-4 py-2 rounded-lg">Realizar Examen</a>`;
                } else {
                    actionButtonHtml = `<button class="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed" disabled>${estado}</button>`;
                }

                if (calificacion) {
                     feedbackHtml = `
                        <div class="mt-4 p-4 bg-gray-100 rounded-lg">
                            <h4 class="font-bold text-md">Estado de tu Examen:</h4>
                            <p class="font-semibold text-green-600">Completado</p>
                            <p><strong>Calificación:</strong> ${calificacion}</p>
                        </div>`;
                }
            }

            return `
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-xl font-bold">${activity.titulo} <span class="text-sm font-normal text-gray-500">(${activity.type})</span></h3>
                            <p class="text-sm text-gray-500 mb-2"><strong>Asignatura:</strong> ${activity.asignatura || 'No especificada'}</p>
                        </div>
                        <span class="text-sm font-semibold text-gray-600">${activity.fechaLimite}</span>
                    </div>
                    <p class="text-gray-700 mt-2">${activity.descripcion || 'Sin descripción.'}</p>
                    <div class="mt-4">
                        ${actionButtonHtml}
                    </div>
                    ${feedbackHtml}
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
                    fetchAllActivities();
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                alert(`Error al entregar la tarea: ${error.message}`);
            }
        };
        reader.readAsDataURL(file);
    });

    fetchAllActivities(); // Carga inicial
});