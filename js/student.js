document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.rol !== 'Estudiante' && currentUser.rol !== 'Alumno')) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('student-name').textContent = currentUser.nombre;
    const tasksList = document.getElementById('tasks-list');
    // ... (resto de elementos del DOM)

    // Función para obtener Tareas Y Exámenes
    async function fetchAllActivities() {
        tasksList.innerHTML = '<p class="text-gray-500">Cargando actividades...</p>';
        try {
            const payload = { userId: currentUser.userId, grado: currentUser.grado, seccion: currentUser.seccion };

            // Llamadas en paralelo a ambos microservicios
            const [tasksResult, examsResult] = await Promise.all([
                fetchApi('TASK', 'getStudentTasks', payload),
                fetchApi('EXAM', 'getExamQuestions', { grado: currentUser.grado, seccion: currentUser.seccion }) // Asumiendo un endpoint así
            ]);

            if (tasksResult.status !== 'success' || examsResult.status !== 'success') {
                 throw new Error(`Error Tareas: ${tasksResult.message} | Error Examenes: ${examsResult.message}`);
            }

            // Combinar y renderizar
            const allActivities = [...tasksResult.data, ...examsResult.data]; // Simplificado, necesita adaptación
            renderActivities(allActivities);

        } catch (error) {
            tasksList.innerHTML = `<p class="text-red-500">Error al cargar actividades: ${error.message}</p>`;
        }
    }

    // Adaptar renderTasks para que sea renderActivities
    function renderActivities(activities) {
        if (!activities || activities.length === 0) {
            tasksList.innerHTML = '<p class="text-gray-500">No hay actividades pendientes.</p>';
            return;
        }
        // ... (La lógica de renderizado debe ser adaptada para manejar tanto tareas como exámenes)
        // Por simplicidad, se mantiene la lógica de renderizado de tareas por ahora.
        tasksList.innerHTML = activities.map(task => {
            // ... (código de renderizado existente) ...
        }).join('');
    }

    // ... (Lógica de listeners para modales y subida de archivos)
    // Asegurarse de que `submitAssignment` apunte al servicio de TAREAS
    submissionForm.addEventListener('submit', async (e) => {
        // ...
        const result = await fetchApi('TASK', 'submitAssignment', payload);
        // ...
    });

    fetchAllActivities(); // Llamar a la nueva función
});
