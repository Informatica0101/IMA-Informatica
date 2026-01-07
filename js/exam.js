document.addEventListener('DOMContentLoaded', () => {
    // --- Autenticación y Elementos del DOM ---
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) { window.location.href = 'login.html'; return; }

    const examTitleEl = document.getElementById('exam-title');
    const questionsContainer = document.getElementById('questions-container');
    const examForm = document.getElementById('exam-form');
    const timerEl = document.getElementById('timer');

    const urlParams = new URLSearchParams(window.location.search);
    const examenId = urlParams.get('examenId');
    let originalQuestions = [];
    let timerInterval;

    // --- Lógica de Supervisión ---
    let warningCount = 0;

    function requestFullScreen() {
        alert("El examen comenzará en modo de pantalla completa.");
        document.documentElement.requestFullscreen().catch(() => {
            alert("No se pudo activar la pantalla completa. Por favor, actívala manualmente (F11).");
        });
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            warningCount++;
            if (warningCount >= 3) {
                submitExam(true); // Enviar como bloqueado
            } else {
                alert(`ADVERTENCIA ${warningCount}/3: Has cambiado de pestaña. Si lo haces de nuevo, el examen podría bloquearse.`);
            }
        }
    }

    function startTimer(minutes) {
        let seconds = parseInt(minutes, 10) * 60;
        timerInterval = setInterval(() => {
            const min = Math.floor(seconds / 60);
            const sec = seconds % 60;
            timerEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
            if (seconds-- <= 0) {
                clearInterval(timerInterval);
                submitExam(false); // Enviar por tiempo agotado
            }
        }, 1000);
    }

    // --- Lógica del Examen ---
    async function fetchApi(action, payload) {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({ action, payload }),
            headers: { 'Content-Type': 'text/plain' }
        });
        return await response.json();
    }

    function renderQuestion(question, index) {
        let answerHtml = '';
        const inputName = `q-${question.preguntaId}`;
        switch (question.preguntaTipo) {
            case 'opcion_multiple':
                answerHtml = Object.entries(question.opciones).map(([key, value]) => `
                    <label class="block p-2 rounded hover:bg-gray-100"><input type="radio" name="${inputName}" value="${key}" required> ${value}</label>
                `).join('');
                break;
            case 'completacion':
                answerHtml = `<input type="text" name="${inputName}" class="w-full p-2 border rounded" required>`;
                break;
            case 'verdadero_falso':
                answerHtml = `<select name="${inputName}" class="w-full p-2 border rounded" required><option value="">Selecciona...</option><option value="Verdadero">Verdadero</option><option value="Falso">Falso</option></select>`;
                break;
            default:
                answerHtml = `<textarea name="${inputName}" class="w-full p-2 border rounded" rows="3" placeholder="Tu respuesta..."></textarea>`;
        }
        return `<div class="question border-t pt-4" data-question-id="${question.preguntaId}"><p class="font-semibold mb-2">${index + 1}. ${question.textoPregunta}</p><div class="space-y-2">${answerHtml}</div></div>`;
    }

    async function loadExam() {
        try {
            const result = await fetchApi('getExamQuestions', { examenId });
            if (result.status === 'success' && result.data) {
                const { titulo, tiempoLimite, preguntas } = result.data;
                examTitleEl.textContent = titulo;
                originalQuestions = preguntas;
                questionsContainer.innerHTML = originalQuestions.map(renderQuestion).join('');

                if (tiempoLimite) {
                    startTimer(tiempoLimite);
                }
                requestFullScreen();
                document.addEventListener('visibilitychange', handleVisibilityChange);
            } else { throw new Error(result.message); }
        } catch (error) {
            questionsContainer.innerHTML = `<p class="text-red-500">Error al cargar el examen: ${error.message}</p>`;
        }
    }

    async function submitExam(isBlocked) {
        if(examForm.dataset.submitted) return;
        examForm.dataset.submitted = 'true';

        clearInterval(timerInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        if(isBlocked) {
            alert("Has cambiado de pestaña demasiadas veces. El examen se ha enviado y bloqueado.");
        } else {
            alert("Enviando examen...");
        }

        const respuestas = [];
        originalQuestions.forEach(q => {
            const inputName = `q-${q.preguntaId}`;
            const input = document.querySelector(`[name=${inputName}]:checked`) || document.querySelector(`[name=${inputName}]`);
            respuestas.push({
                preguntaId: q.preguntaId,
                respuestaEstudiante: input ? input.value : ''
            });
        });

        try {
            const payload = { examenId, userId: currentUser.userId, respuestas, estado: isBlocked ? 'Bloqueado' : 'Entregado' };
            const result = await fetchApi('submitExam', payload);

            if (result.status === 'success' && result.data) {
                const params = new URLSearchParams({
                    calificacion: result.data.calificacionTotal,
                    resultados: JSON.stringify(result.data.resultados),
                    preguntas: JSON.stringify(originalQuestions.map(q => ({preguntaId: q.preguntaId, textoPregunta: q.textoPregunta})))
                });
                window.location.href = `exam-results.html?${params.toString()}`;
            } else { throw new Error(result.message || "Error al enviar."); }
        } catch (error) { alert(`Error: ${error.message}`); }
    }

    examForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitExam(false);
    });

    loadExam();
});
