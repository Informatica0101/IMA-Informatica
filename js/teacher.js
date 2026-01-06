document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.rol !== 'Profesor') {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('teacher-name').textContent = currentUser.nombre;
    const navDashboard = document.getElementById('nav-dashboard');
    const navCrear = document.getElementById('nav-crear');
    const sectionDashboard = document.getElementById('section-dashboard');
    const sectionCrear = document.getElementById('section-crear');
    const createAssignmentForm = document.getElementById('create-assignment-form');
    const submissionsTableBody = document.getElementById('submissions-table-body');
    const logoutButton = document.getElementById('logout-button');

    navDashboard.addEventListener('click', () => {
        sectionDashboard.classList.remove('hidden');
        sectionCrear.classList.add('hidden');
        navDashboard.classList.add('bg-gray-700', 'text-white');
        navCrear.classList.remove('bg-gray-700', 'text-white');
        fetchSubmissions();
    });

    navCrear.addEventListener('click', () => {
        sectionDashboard.classList.add('hidden');
        sectionCrear.classList.remove('hidden');
        navDashboard.classList.remove('bg-gray-700', 'text-white');
        navCrear.classList.add('bg-gray-700', 'text-white');
    });

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

    async function fetchSubmissions() {
        submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Cargando...</td></tr>';
        try {
            const result = await fetchApi('getTeacherSubmissions', {});
            if (result.status === 'success') {
                renderSubmissions(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            submissionsTableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-red-500">Error: ${error.message}</td></tr>`;
        }
    }

    function renderSubmissions(submissions) {
        if (!submissions || submissions.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">No hay entregas.</td></tr>';
            return;
        }
        submissionsTableBody.innerHTML = submissions.map(s => `
            <tr class="border-b">
                <td class="p-4">${s.alumnoNombre}</td>
                <td class="p-4">${s.tareaTitulo}</td>
                <td class="p-4">${s.fechaEntrega}</td>
                <td class="p-4"><a href="${s.archivoUrl}" target="_blank" class="text-blue-500">Ver Archivo</a></td>
                <td class="p-4">${s.calificacion || 'N/A'}</td>
                <td class="p-4"><button class="bg-blue-500 text-white px-2 py-1 rounded" onclick="openGradeModal('${s.entregaId}', '${s.alumnoNombre}', '${s.archivoUrl}', '${s.calificacion}')">Calificar</button></td>
            </tr>
        `).join('');
    }

    createAssignmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData.entries());
        try {
            const result = await fetchApi('createTask', payload);
            if (result.status === 'success') {
                alert('Tarea creada exitosamente.');
                e.target.reset();
                navDashboard.click();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // Lógica del Modal (simplificada para brevedad)
    const gradeModal = document.getElementById('grade-modal');
    const saveGradeBtn = document.getElementById('save-grade-btn');
    const cancelGradeBtn = document.getElementById('cancel-grade-btn');
    let currentEditingEntregaId = null;

    window.openGradeModal = (entregaId, studentName, fileUrl, currentGrade) => {
        currentEditingEntregaId = entregaId;
        document.getElementById('student-name-modal').textContent = studentName;
        document.getElementById('file-link-modal').href = fileUrl;
        document.getElementById('calificacion').value = currentGrade || '';
        gradeModal.classList.remove('hidden');
    };

    saveGradeBtn.addEventListener('click', async () => {
        const calificacion = document.getElementById('calificacion').value;
        if (!currentEditingEntregaId || !calificacion) return;
        try {
            const result = await fetchApi('gradeSubmission', { entregaId: currentEditingEntregaId, calificacion });
            if (result.status === 'success') {
                alert('Calificación guardada.');
                gradeModal.classList.add('hidden');
                fetchSubmissions();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    cancelGradeBtn.addEventListener('click', () => gradeModal.classList.add('hidden'));

    // Carga inicial
    fetchSubmissions();
});
