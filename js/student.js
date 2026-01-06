let currentUser;
let tasksList;

function renderTasks(tasks) {
    if (!tasksList) return;
    if (!tasks || tasks.length === 0) {
        tasksList.innerHTML = '<p class="text-gray-500">No tienes tareas pendientes.</p>';
        return;
    }
    tasksList.innerHTML = tasks.map(task => `
        <div class="bg-white p-6 rounded-lg shadow-md flex justify-between items-center task-item">
            <div>
                <span class="text-xs font-semibold uppercase px-2 py-1 rounded-full bg-blue-100 text-blue-800">${task.tipo}</span>
                <h3 class="text-xl font-bold mt-2">${task.titulo}</h3>
                <p class="text-gray-600">${task.descripcion}</p>
                <p class="text-sm text-red-600 font-medium mt-2">Fecha Límite: ${task.fechaLimite}</p>
            </div>
            <button class="${task.tipo === 'Examen' ? 'bg-purple-600' : 'bg-green-500'} text-white font-bold py-2 px-4 rounded-lg action-btn" data-task-id="${task.tareaId}" data-task-type="${task.tipo}" data-task-title="${task.titulo}" data-task-parcial="${task.parcial}" data-task-asignatura="${task.asignatura}">
                ${task.tipo === 'Examen' ? 'Realizar Examen' : 'Entregar'}
            </button>
        </div>
    `).join('');
}

async function fetchPendingTasks() {
    if (!currentUser || !tasksList) {
        console.error("Usuario o lista de tareas no inicializados.");
        return;
    }
    tasksList.innerHTML = '<p class="text-gray-500">Cargando...</p>';
    try {
        const payload = { userId: currentUser.userId, grado: currentUser.grado, seccion: currentUser.seccion };
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getStudentTasks', payload }),
            headers: { 'Content-Type': 'text/plain' }
        });
        const resultText = await response.text();
        const result = JSON.parse(resultText);

        if (result.status === 'success') {
            renderTasks(result.data);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        tasksList.innerHTML = `<p class="text-red-500">Error al cargar tareas: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.rol !== 'Estudiante') {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('student-name').textContent = currentUser.nombre.split(' ')[0];
    tasksList = document.getElementById('tasks-list');

    tasksList.addEventListener('click', (e) => {
        if (e.target.classList.contains('action-btn')) {
            const task = e.target.dataset;
            if (task.taskType === 'Examen') {
                window.location.href = `exam.html?taskId=${task.taskId}`;
            } else {
                openSubmissionModal(task.taskId, task.taskTitle, task.taskType, task.taskParcial, task.taskAsignatura);
            }
        }
    });

    fetchPendingTasks();
});
