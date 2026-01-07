document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) { window.location.href = 'login.html'; return; }

    const examTitleEl = document.getElementById('exam-title');
    const questionsContainer = document.getElementById('questions-container');
    const examForm = document.getElementById('exam-form');
    const timerEl = document.getElementById('timer');

    const urlParams = new URLSearchParams(window.location.search);
    const examenId = urlParams.get('examenId');
    let originalQuestions = [];

    // --- API Helper ---
    async function fetchApi(service, action, payload) {
        if (!SERVICE_URLS[service]) throw new Error(`URL para el servicio "${service}" no encontrada.`);
        const response = await fetch(SERVICE_URLS[service], {
            method: 'POST', body: JSON.stringify({ action, payload })
        });
        return await response.json();
    }

    // --- Lógica del Examen ---
    async function loadExam() {
        try {
            // Apuntar al microservicio de exámenes
            const result = await fetchApi('EXAM', 'getExamQuestions', { examenId });
            if (result.status === 'success' && result.data) {
                const { titulo, tiempoLimite, preguntas } = result.data;
                examTitleEl.textContent = titulo;
                originalQuestions = preguntas;
                questionsContainer.innerHTML = originalQuestions.map(renderQuestion).join('');

                if (tiempoLimite) {
                    // ... (lógica de timer sin cambios)
                }
                // ... (lógica de fullscreen sin cambios)
            } else { throw new Error(result.message); }
        } catch (error) {
            questionsContainer.innerHTML = `<p class="text-red-500">Error al cargar el examen: ${error.message}</p>`;
        }
    }

    async function submitExam(isBlocked) {
        // ... (lógica interna sin cambios)

        try {
            const payload = { examenId, userId: currentUser.userId, respuestas, estado: isBlocked ? 'Bloqueado' : 'Entregado' };
            // Apuntar al microservicio de exámenes
            const result = await fetchApi('EXAM', 'submitExam', payload);

            if (result.status === 'success' && result.data) {
                // ... (redirección a resultados sin cambios)
            } else { throw new Error(result.message || "Error al enviar."); }
        } catch (error) { alert(`Error: ${error.message}`); }
    }

    // ... (El resto de las funciones: renderQuestion, startTimer, requestFullScreen, etc. no necesitan cambios)

    examForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitExam(false);
    });

    loadExam();
});
