let currentUser;
let submissionsTableBody, createAssignmentForm, gradeModal, calificacionSelect, saveGradeBtn, studentNameModal, fileLinkModal;
let currentEditingEntregaId = null;

async function fetchApi(action, payload) {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({ action, payload }),
            headers: { 'Content-Type': 'text/plain' }
        });
        const resultText = await response.text();
        return JSON.parse(resultText);
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw new Error('No se pudo comunicar con el servidor.');
    }
}

function renderSubmissions(submissions) {
    if (!submissionsTableBody) return;
    if (!submissions || submissions.length === 0) {
        submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">No hay entregas por revisar.</td></tr>';
        return;
    }
    submissionsTableBody.innerHTML = submissions.map(s => `
        <tr class="border-b">
            <td class="p-4">${s.alumnoNombre}</td>
            <td class="p-4">${s.tareaTitulo}</td>
            <td class="p-4">${s.fechaEntrega}</td>
            <td class="p-4"><a href="${s.archivoUrl}" target="_blank" class="text-blue-500 hover:underline">Ver Archivo</a></td>
            <td class="p-4">${s.calificacion || 'Sin calificar'}</td>
            <td class="p-4">
                <button class="bg-blue-500 text-white px-3 py-1 rounded-lg" onclick="openGradeModal('${s.entregaId}', '${s.alumnoNombre}', '${s.archivoUrl}', '${s.calificacion}')">Calificar</button>
            </td>
        </tr>
    `).join('');
}

async function fetchSubmissions() {
    if (!submissionsTableBody) {
        console.error("submissionsTableBody no está inicializado.");
        return;
    }
    submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Cargando...</td></tr>';
    try {
        const result = await fetchApi('getTeacherSubmissions', { userId: currentUser.userId });
        if (result.status === 'success') {
            renderSubmissions(result.data);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        submissionsTableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-red-500">Error: ${error.message}</td></tr>`;
    }
}

window.openGradeModal = (entregaId, studentName, fileUrl, currentGrade) => {
    currentEditingEntregaId = entregaId;
    studentNameModal.textContent = studentName;
    fileLinkModal.href = fileUrl;
    calificacionSelect.value = currentGrade || '';
    gradeModal.classList.remove('hidden');
};

document.addEventListener('DOMContentLoaded', () => {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.rol !== 'Profesor') {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('teacher-name').textContent = currentUser.nombre.split(' ')[0];

    submissionsTableBody = document.getElementById('submissions-table-body');
    createAssignmentForm = document.getElementById('create-assignment-form');
    gradeModal = document.getElementById('grade-modal');
    studentNameModal = document.getElementById('student-name-modal');
    fileLinkModal = document.getElementById('file-link-modal');
    calificacionSelect = document.getElementById('calificacion');
    saveGradeBtn = document.getElementById('save-grade-btn');
    const cancelGradeBtn = document.getElementById('cancel-grade-btn');

    const sections = {
        '#nav-dashboard': '#section-dashboard',
        '#nav-crear': '#section-crear',
        '#nav-calificar': '#section-calificar',
        '#nav-alumnos': '#section-alumnos'
    };

    Object.keys(sections).forEach(navId => {
        const navElement = document.querySelector(navId);
        const sectionElement = document.querySelector(sections[navId]);
        if (navElement) {
            navElement.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
                if (sectionElement) sectionElement.classList.remove('hidden');
                document.querySelectorAll('nav a').forEach(a => a.classList.remove('bg-gray-700'));
                navElement.classList.add('bg-gray-700');
            });
        }
    });

    createAssignmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData.entries());

        try {
            const result = await fetchApi('createTask', payload);
            if (result.status === 'success') {
                alert('Asignación creada exitosamente.');
                e.target.reset();
                document.querySelector('#nav-dashboard').click();
                fetchSubmissions();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert(`Error al crear la asignación: ${error.message}`);
        }
    });

    saveGradeBtn.addEventListener('click', async () => {
        if (!currentEditingEntregaId) return;
        try {
            const result = await fetchApi('gradeSubmission', {
                entregaId: currentEditingEntregaId,
                calificacion: calificacionSelect.value
            });
            if (result.status === 'success') {
                alert('Calificación guardada.');
                gradeModal.classList.add('hidden');
                fetchSubmissions();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert(`Error al guardar calificación: ${error.message}`);
        }
    });

    cancelGradeBtn.addEventListener('click', () => gradeModal.classList.add('hidden'));

    fetchSubmissions();
});
