document.addEventListener('DOMContentLoaded', () => {
    // ... (código de verificación de sesión y elementos del DOM sin cambios)
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser || currentUser.rol !== 'Estudiante') {
        alert("Acceso denegado. Debes ser un estudiante para ver esta página.");
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('student-name').textContent = currentUser.nombre.split(' ')[0];
    const tasksList = document.getElementById('tasks-list');
    const submissionModal = document.getElementById('submission-modal');
    const modalTaskTitle = document.getElementById('modal-task-title');
    const submissionForm = document.getElementById('submission-form');
    const textResponseArea = document.getElementById('text-response-area');
    const fileUploadArea = document.getElementById('file-upload-area');
    const cancelSubmissionBtn = document.getElementById('cancel-submission-btn');
    const fileInput = document.getElementById('file-input');
    const textResponseInput = document.getElementById('respuesta-texto');
    let currentSubmittingTaskId = null;

    // =================================================================
    // CARGAR Y MOSTRAR TAREAS PENDIENTES
    // =================================================================
    async function fetchPendingTasks() {
        tasksList.innerHTML = '<p class="text-gray-500">Cargando tus tareas pendientes...</p>';
        try {
            const payload = { userId: currentUser.userId, grado: currentUser.grado, seccion: currentUser.seccion };
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'getStudentTasks', payload }),
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (result.status === 'success') {
                renderTasks(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            tasksList.innerHTML = `<p class="text-red-500">Error al cargar las tareas: ${error.message}</p>`;
        }
    }

    function renderTasks(tasks) {
        if (!tasks || tasks.length === 0) {
            tasksList.innerHTML = '<p class="text-gray-500">¡Felicidades! No tienes tareas pendientes.</p>';
            return;
        }
        tasksList.innerHTML = tasks.map(task => {
            const buttonText = task.tipo === 'Examen' ? 'Realizar Examen' : 'Entregar';
            const buttonClass = task.tipo === 'Examen' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-500 hover:bg-green-600';
            return `
                <div class="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                    <div>
                        <span class="text-xs font-semibold uppercase px-2 py-1 rounded-full bg-blue-100 text-blue-800">${task.tipo}</span>
                        <h3 class="text-xl font-bold text-gray-800 mt-2">${task.titulo}</h3>
                        <p class="text-gray-600">${task.descripcion}</p>
                        <p class="text-sm text-red-600 font-medium mt-2">Fecha Límite: ${task.fechaLimite}</p>
                    </div>
                    <button class="${buttonClass} text-white font-bold py-2 px-4 rounded-lg transition-colors action-btn" data-task-id="${task.tareaId}" data-task-title="${task.titulo}" data-task-type="${task.tipo}">
                        ${buttonText}
                    </button>
                </div>
            `;
        }).join('');
    }

    // =================================================================
    // GESTIÓN DE ACCIONES DE TAREAS (MODAL O REDIRECCIÓN)
    // =================================================================
    tasksList.addEventListener('click', (e) => {
        if (e.target.classList.contains('action-btn')) {
            const task = e.target.dataset;
            if (task.taskType === 'Examen') {
                // Redirigir a la página del examen con el ID
                window.location.href = `exam.html?tareaId=${task.taskId}`;
            } else {
                // Abrir el modal de entrega para otras tareas
                currentSubmittingTaskId = task.taskId;
                modalTaskTitle.textContent = task.taskTitle;
                textResponseArea.classList.add('hidden');
                fileUploadArea.classList.remove('hidden');
                submissionModal.classList.remove('hidden');
            }
        }
    });

    cancelSubmissionBtn.addEventListener('click', () => {
        submissionModal.classList.add('hidden');
        submissionForm.reset();
        currentSubmittingTaskId = null;
    });

    // =================================================================
    // LÓGICA DE ENTREGA DE TAREAS (MODAL)
    // =================================================================
    submissionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentSubmittingTaskId) return;
        const submitButton = document.getElementById('submit-assignment-btn');
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        try {
            const file = fileInput.files[0];
            let fileData = null, fileName = null, fileMimeType = null;
            if (file) {
                fileData = await toBase64(file);
                fileName = file.name;
                fileMimeType = file.type;
            }
            const payload = {
                userId: currentUser.userId,
                tareaId: currentSubmittingTaskId,
                fileName,
                fileMimeType,
                fileData: fileData ? fileData.split(',')[1] : null,
                respuestaTexto: textResponseInput.value
            };
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'submitAssignment', payload }),
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (result.status === 'success') {
                alert('¡Tarea entregada exitosamente!');
                submissionModal.classList.add('hidden');
                submissionForm.reset();
                fetchPendingTasks();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert(`Error al entregar la tarea: ${error.message}`);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Confirmar Entrega';
        }
    });

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    // =================================================================
    // INICIALIZACIÓN
    // =================================================================
    fetchPendingTasks();
});
