document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.rol !== 'Profesor') {
        alert("Acceso denegado.");
        window.location.href = 'login.html';
        return;
    }

    const navLinks = { calificar: document.getElementById('nav-calificar'), crear: document.getElementById('nav-crear'), contenido: document.getElementById('nav-contenido') };
    const sections = { calificar: document.getElementById('section-calificar'), crear: document.getElementById('section-crear'), contenido: document.getElementById('section-contenido') };
    const mainTitle = document.getElementById('main-title');
    const submissionsBody = document.getElementById('submissions-list-body');
    const createAssignmentForm = document.getElementById('create-assignment-form');
    const assignmentTypeSelect = document.getElementById('tipo');
    const examBuilderContainer = document.getElementById('exam-builder-container');
    const questionsContainer = document.getElementById('questions-container');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const gradeModal = document.getElementById('grade-modal');
    const submissionDetails = document.getElementById('submission-details');
    const calificacionSelect = document.getElementById('calificacion');
    const saveGradeBtn = document.getElementById('save-grade-btn');
    const cancelGradeBtn = document.getElementById('cancel-grade-btn');
    let currentEditingEntregaId = null;

    function navigateTo(sectionName) {
        Object.values(sections).forEach(section => section.classList.add('hidden'));
        Object.keys(navLinks).forEach(key => {
            const link = navLinks[key];
            link.classList.remove('bg-gray-700', 'text-white');
            link.classList.add('text-gray-400', 'hover:bg-gray-700');
        });
        sections[sectionName].classList.remove('hidden');
        navLinks[sectionName].classList.add('bg-gray-700', 'text-white');
    }

    Object.keys(navLinks).forEach(key => navLinks[key].addEventListener('click', (e) => { e.preventDefault(); navigateTo(key); }));

    assignmentTypeSelect.addEventListener('change', () => {
        examBuilderContainer.classList.toggle('hidden', assignmentTypeSelect.value !== 'Examen');
    });

    // ... (lógica del constructor de exámenes sin cambios)

    createAssignmentForm.addEventListener('submit', async (e) => {
        // ... (lógica de envío sin cambios)
    });

    async function fetchSubmissions() {
        submissionsBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Cargando entregas...</td></tr>';
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'getTeacherSubmissions', payload: { userId: currentUser.userId } }),
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (result.status === 'success') {
                renderSubmissions(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            submissionsBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500">Error: ${error.message}</td></tr>`;
        }
    }

    function renderSubmissions(submissions) {
        if (!submissions || submissions.length === 0) {
            submissionsBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No hay entregas pendientes.</td></tr>';
            return;
        }
        submissionsBody.innerHTML = submissions.map(sub => `
            <tr class="border-b">
                <td class="py-3 px-4">${sub.nombreAlumno}</td>
                <td class="py-3 px-4">${sub.tituloTarea}</td>
                <td class="py-3 px-4">${new Date(sub.fechaEntrega).toLocaleString()}</td>
                <td class="py-3 px-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${sub.calificacion === 'Pendiente' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}">${sub.calificacion}</span></td>
                <td class="py-3 px-4 text-center"><button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 grade-btn" data-submission='${JSON.stringify(sub)}'>Calificar</button></td>
            </tr>
        `).join('');
    }

    submissionsBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('grade-btn')) {
            const sub = JSON.parse(e.target.dataset.submission);
            currentEditingEntregaId = sub.entregaId;
            submissionDetails.innerHTML = `<p><strong>Alumno:</strong> ${sub.nombreAlumno}</p><p><strong>Tarea:</strong> ${sub.tituloTarea}</p>${sub.enlaceArchivo ? `<p><strong>Archivo:</strong> <a href="${sub.enlaceArchivo}" target="_blank" class="text-blue-600">Ver archivo</a></p>` : ''}`;
            calificacionSelect.value = sub.calificacion !== 'Pendiente' ? sub.calificacion : 'Aprobada';
            gradeModal.classList.remove('hidden');
        }
    });

    cancelGradeBtn.addEventListener('click', () => gradeModal.classList.add('hidden'));

    saveGradeBtn.addEventListener('click', async () => {
        if (!currentEditingEntregaId) return;
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'gradeSubmission', payload: { entregaId: currentEditingEntregaId, calificacion: calificacionSelect.value } }),
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
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

    // *** CORRECCIÓN: Descomentar la llamada a la función ***
    navigateTo('calificar');
    fetchSubmissions();
});
