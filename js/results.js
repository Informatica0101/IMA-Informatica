document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Solo los profesores pueden ver resultados individuales
    if (currentUser.rol !== 'Profesor') {
        window.location.href = 'student-dashboard.html';
        return;
    }

    const resultsContainer = document.getElementById('results-container');
    const urlParams = new URLSearchParams(window.location.search);
    const entregaExamenId = urlParams.get('entregaExamenId');

    async function loadResults() {
        if (!entregaExamenId) {
            resultsContainer.innerHTML = '<p class="text-red-500">No se proporcionó un ID de entrega de examen.</p>';
            return;
        }

        try {
            const result = await fetchApi('EXAM', 'getExamResult', { entregaExamenId });

            if (result.status === 'success' && result.data) {
                renderResults(result.data);
            } else {
                throw new Error(result.message || 'No se pudieron cargar los resultados.');
            }
        } catch (error) {
            resultsContainer.innerHTML = `<p class="text-red-500">Error al cargar los resultados: ${error.message}</p>`;
        }
    }

    function renderResults(data) {
        const { calificacionTotal, resultadosDetallados, examenTitulo } = data;

        let detailsHtml = '<div class="space-y-4">';
        resultadosDetallados.forEach((item, index) => {
            const bgColor = item.esCorrecta ? 'bg-green-100' : 'bg-red-100';
            const borderColor = item.esCorrecta ? 'border-green-500' : 'border-red-500';
            detailsHtml += `
                <div class="p-4 rounded border ${borderColor} ${bgColor}">
                    <p class="font-semibold">Pregunta ${index + 1}</p>
                    <p>Tu respuesta: <span class="font-mono">${item.respuestaEstudiante || 'No respondida'}</span></p>
                    <p>Resultado: <span class="font-bold">${item.esCorrecta ? 'Correcta' : 'Incorrecta'}</span></p>
                </div>
            `;
        });
        detailsHtml += '</div>';

        resultsContainer.innerHTML = `
            <h2 class="text-2xl font-bold text-center mb-2">Examen: ${examenTitulo}</h2>
            <p class="text-4xl font-bold text-center mb-6">Calificación Final: ${calificacionTotal}%</p>
            <hr class="my-6">
            <h3 class="text-xl font-bold mb-4">Detalle de Respuestas</h3>
            ${detailsHtml}
        `;
    }

    loadResults();
});
