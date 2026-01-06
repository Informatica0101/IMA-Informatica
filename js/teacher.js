document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.rol !== 'Profesor') {
        window.location.href = 'login.html';
        return;
    }
    // ... (elementos del DOM)

    async function fetchApi(action, payload) {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({ action, payload }),
            headers: { 'Content-Type': 'text/plain' }
        });
        return JSON.parse(await response.text());
    }

    async function fetchSubmissions() {
        try {
            const result = await fetchApi('getTeacherSubmissions', { userId: currentUser.userId });
            if (result.status === 'success') {
                renderSubmissions(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            // ... (manejo de error)
        }
    }

    createAssignmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // ... (recolectar datos del formulario)
        try {
            const result = await fetchApi('createTask', payload);
            if (result.status === 'success') {
                alert('Asignación creada.');
                // ... (resetear formulario)
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
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
            alert(`Error: ${error.message}`);
        }
    });

    // ... (resto del código sin cambios directos en fetch)
    fetchSubmissions();
});
