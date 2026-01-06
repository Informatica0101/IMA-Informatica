document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.rol !== 'Estudiante') {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('student-name').textContent = currentUser.nombre;
    const tasksList = document.getElementById('tasks-list');
    const logoutButton = document.getElementById('logout-button');
    const submissionModal = document.getElementById('submission-modal');
    const submissionForm = document.getElementById('submission-form');
    const cancelSubmissionBtn = document.getElementById('cancel-submission-btn');

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    async function fetchApi(action, payload) {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({ action, payload }),
            headers: { 'Content-Type': 'text/plain' }
        });
        return await response.json();
    }

    async function fetchStudentTasks() {
        tasksList.innerHTML = '<p class="text-gray-500">Cargando tareas...</p>';
        try {
            const result = await fetchApi('getStudentTasks', { grado: currentUser.grado, seccion: currentUser.seccion });
            if (result.status === 'success') {
                renderTasks(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            tasksList.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        }
    }

    function renderTasks(tasks) {
        if (!tasks || tasks.length === 0) {
            tasksList.innerHTML = '<p class="text-gray-500">No hay tareas pendientes.</p>';
            return;
        }
        tasksList.innerHTML = tasks.map(task => `
            <div class="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                    <h3 class="text-xl font-bold">${task.titulo} (${task.asignatura} - ${task.parcial})</h3>
                    <p class="text-gray-600">${task.descripcion}</p>
                    <p class="text-sm text-red-600 font-medium mt-2">Fecha Límite: ${task.fechaLimite}</p>
                </div>
                <button class="bg-green-500 text-white font-bold py-2 px-4 rounded-lg submit-btn"
                        data-task-id="${task.tareaId}"
                        data-task-title="${task.titulo}"
                        data-task-parcial="${task.parcial}"
                        data-task-asignatura="${task.asignatura}">
                    Entregar
                </button>
            </div>
        `).join('');
    }

    tasksList.addEventListener('click', (e) => {
        if (e.target.classList.contains('submit-btn')) {
            const task = e.target.dataset;
            document.getElementById('modal-task-title').textContent = task.taskTitle;
            submissionForm.dataset.taskId = task.taskId;
            submissionForm.dataset.taskParcial = task.taskParcial;
            submissionForm.dataset.taskAsignatura = task.taskAsignatura;
            submissionModal.classList.remove('hidden');
        }
    });

    cancelSubmissionBtn.addEventListener('click', () => {
        submissionModal.classList.add('hidden');
        submissionForm.reset();
    });

    submissionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
        if (!file) {
            alert("Por favor, selecciona un archivo.");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const fileData = reader.result;
            const payload = {
                userId: currentUser.userId,
                tareaId: submissionForm.dataset.taskId,
                parcial: submissionForm.dataset.taskParcial,
                asignatura: submissionForm.dataset.taskAsignatura,
                fileData: fileData,
                fileName: file.name
            };

            try {
                const result = await fetchApi('submitAssignment', payload);
                if (result.status === 'success') {
                    alert('Tarea entregada exitosamente.');
                    submissionModal.classList.add('hidden');
                    submissionForm.reset();
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        };
        reader.onerror = () => {
            alert("Error al leer el archivo.");
        };
    });

    fetchStudentTasks();
});
