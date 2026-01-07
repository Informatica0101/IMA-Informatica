document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const examTitle = document.getElementById('exam-title');
    const questionsContainer = document.getElementById('questions-container');
    const examForm = document.getElementById('exam-form');

    const urlParams = new URLSearchParams(window.location.search);
    const examenId = urlParams.get('examenId');
    const examTitleParam = urlParams.get('title');
    examTitle.textContent = examTitleParam || 'Examen';

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
        switch (question.preguntaTipo) {
            case 'opcion_multiple':
                answerHtml = Object.entries(question.opciones).map(([key, value]) => `
                    <label class="block"><input type="radio" name="q-${index}" value="${key}" required> ${value}</label>
                `).join('');
                break;
            case 'completacion':
                answerHtml = `<input type="text" name="q-${index}" class="w-full p-2 border rounded" required>`;
                break;
            case 'verdadero_falso':
                answerHtml = `<select name="q-${index}" class="w-full p-2 border rounded" required>
                    <option value="Verdadero">Verdadero</option><option value="Falso">Falso</option>
                </select>`;
                break;
            default:
                answerHtml = `<textarea name="q-${index}" class="w-full p-2 border rounded" rows="3"></textarea>`;
        }

        return `
            <div class="question" data-question-id="${question.preguntaId}">
                <p class="font-bold mb-2">${index + 1}. ${question.textoPregunta}</p>
                <div class="space-y-2">${answerHtml}</div>
            </div>
        `;
    }

    async function loadExam() {
        try {
            const result = await fetchApi('getExamQuestions', { examenId });
            if (result.status === 'success') {
                questionsContainer.innerHTML = result.data.map(renderQuestion).join('');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            questionsContainer.innerHTML = `<p class="text-red-500">Error al cargar el examen: ${error.message}</p>`;
        }
    }

    examForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const respuestas = [];
        const questionElements = document.querySelectorAll('.question');
        questionElements.forEach((q, index) => {
            const input = q.querySelector(`[name=q-${index}]:checked`) || q.querySelector(`[name=q-${index}]`);
            respuestas.push({
                preguntaId: q.dataset.questionId,
                respuestaEstudiante: input.value
            });
        });

        try {
            const result = await fetchApi('submitExam', { examenId, userId: currentUser.userId, respuestas });
            if (result.status === 'success') {
                alert(result.message);
                window.location.href = 'student-dashboard.html';
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert(`Error al entregar el examen: ${error.message}`);
        }
    });

    loadExam();
});
