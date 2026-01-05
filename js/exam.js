document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // VERIFICACIÓN DE SESIÓN Y OBTENCIÓN DE DATOS
    // =================================================================
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.rol !== 'Estudiante') {
        alert("Acceso denegado.");
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const tareaId = urlParams.get('tareaId');
    if (!tareaId) {
        alert("No se ha especificado un examen.");
        window.location.href = 'student-dashboard.html';
        return;
    }

    // =================================================================
    // ELEMENTOS DEL DOM
    // =================================================================
    const examTitle = document.getElementById('exam-title');
    const questionsContainer = document.getElementById('questions-container');
    const examForm = document.getElementById('exam-form');
    const submitExamBtn = document.getElementById('submit-exam-btn');
    let questionsData = [];

    // =================================================================
    // LÓGICA PARA CARGAR Y RENDERIZAR EL EXAMEN
    // =================================================================
    async function fetchAndRenderExam() {
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'getExamQuestions', payload: { tareaId } }),
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();

            if (result.status === 'success') {
                questionsData = result.data;
                // Aquí podrías obtener el título del examen si lo devuelves en otra llamada o lo guardas
                examTitle.textContent = `Examen en Curso`;
                renderQuestions(questionsData);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            questionsContainer.innerHTML = `<p class="text-red-500">Error al cargar el examen: ${error.message}</p>`;
        }
    }

    function renderQuestions(questions) {
        if (!questions || questions.length === 0) {
            questionsContainer.innerHTML = '<p>Este examen no tiene preguntas.</p>';
            return;
        }

        // Aleatorizar el orden de las preguntas
        questions.sort(() => Math.random() - 0.5);

        questionsContainer.innerHTML = questions.map((q, index) => `
            <div class="border-b pb-4">
                <p class="font-bold text-lg mb-2">Pregunta ${index + 1}:</p>
                <p class="mb-2">${q.textoPregunta}</p>
                ${q.enlaceImagen ? `<img src="${q.enlaceImagen}" alt="Imagen de la pregunta" class="my-4 rounded-lg max-w-sm">` : ''}

                ${q.tipoPregunta === 'Ensayo' ?
                    `<textarea name="respuesta_${q.preguntaId}" class="w-full p-2 border rounded" rows="5" placeholder="Escribe tu respuesta aquí..."></textarea>` :
                    `<input type="text" name="respuesta_${q.preguntaId}" class="w-full p-2 border rounded" placeholder="Tu respuesta...">`
                }
            </div>
        `).join('');
    }

    // =================================================================
    // DETECCIÓN DE CAMBIO DE PESTAÑA
    // =================================================================
    let leaveCount = 0;
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            leaveCount++;
            console.warn(`Advertencia: Has salido de la página del examen ${leaveCount} veces.`);
            // Aquí se podría enviar un evento al backend en el futuro.
        }
    });

    // =================================================================
    // LÓGICA DE ENVÍO DEL EXAMEN
    // =================================================================
    examForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!confirm("¿Estás seguro de que quieres finalizar y entregar el examen?")) {
            return;
        }

        submitExamBtn.disabled = true;
        submitExamBtn.textContent = 'Enviando...';

        try {
            const formData = new FormData(examForm);
            let combinedResponse = `Respuestas del Examen (ID: ${tareaId}):\n`;
            combinedResponse += `El estudiante salió de la página ${leaveCount} veces.\n\n`;

            questionsData.forEach(q => {
                const answer = formData.get(`respuesta_${q.preguntaId}`) || "(Sin respuesta)";
                combinedResponse += `--- PREGUNTA ---\n${q.textoPregunta}\n--- RESPUESTA ---\n${answer}\n\n`;
            });

            const payload = {
                userId: currentUser.userId,
                tareaId: tareaId,
                respuestaTexto: combinedResponse
            };

            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'submitAssignment', payload }),
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (result.status === 'success') {
                alert("Examen entregado exitosamente.");
                window.location.href = 'student-dashboard.html';
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert(`Error al entregar el examen: ${error.message}`);
            submitExamBtn.disabled = false;
            submitExamBtn.textContent = 'Finalizar y Entregar Examen';
        }
    });

    // =================================================================
    // INICIALIZACIÓN
    // =================================================================
    fetchAndRenderExam();
});
