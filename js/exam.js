document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.rol !== 'Estudiante') {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const tareaId = urlParams.get('tareaId');
    if (!tareaId) {
        window.location.href = 'student-dashboard.html';
        return;
    }

    const examTitle = document.getElementById('exam-title');
    const questionsContainer = document.getElementById('questions-container');
    const examForm = document.getElementById('exam-form');
    let questionsData = [];

    async function fetchApi(action, payload) {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({ action, payload }),
            headers: { 'Content-Type': 'text/plain' }
        });
        return JSON.parse(await response.text());
    }

    async function fetchAndRenderExam() {
        try {
            const result = await fetchApi('getExamQuestions', { tareaId });
            if (result.status === 'success') {
                questionsData = result.data;
                examTitle.textContent = `Examen en Curso`;
                renderQuestions(questionsData);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            questionsContainer.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        }
    }

    function renderQuestions(questions) {
        if (!questions || questions.length === 0) {
            questionsContainer.innerHTML = '<p>Este examen no tiene preguntas.</p>';
            return;
        }
        questions.sort(() => Math.random() - 0.5);
        questionsContainer.innerHTML = questions.map((q, index) => `
            <div class="border-b pb-4">
                <p class="font-bold text-lg mb-2">Pregunta ${index + 1}:</p>
                <p class="mb-2">${q.textoPregunta}</p>
                ${q.enlaceImagen ? `<img src="${q.enlaceImagen}" class="my-4 rounded-lg max-w-sm">` : ''}
                ${q.tipoPregunta === 'Ensayo' ?
                    `<textarea name="respuesta_${q.preguntaId}" class="w-full p-2 border rounded" rows="5"></textarea>` :
                    `<input type="text" name="respuesta_${q.preguntaId}" class="w-full p-2 border rounded">`
                }
            </div>
        `).join('');
    }

    examForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!confirm("¿Estás seguro de que quieres finalizar?")) return;

        try {
            const formData = new FormData(examForm);
            let combinedResponse = `Respuestas (Examen ID: ${tareaId}):\n\n`;
            questionsData.forEach(q => {
                const answer = formData.get(`respuesta_${q.preguntaId}`) || "(Sin respuesta)";
                combinedResponse += `--- PREGUNTA ---\n${q.textoPregunta}\n--- RESPUESTA ---\n${answer}\n\n`;
            });

            const result = await fetchApi('submitAssignment', {
                userId: currentUser.userId,
                tareaId: tareaId,
                respuestaTexto: combinedResponse
            });

            if (result.status === 'success') {
                alert("Examen entregado.");
                window.location.href = 'student-dashboard.html';
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    fetchAndRenderExam();
});
