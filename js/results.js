document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) { window.location.href = 'login.html'; return; }

    const resultsContainer = document.getElementById('results-container');
    const urlParams = new URLSearchParams(window.location.search);
    const entregaExamenId = urlParams.get('entregaExamenId');

    async function loadResults() {
        if (!entregaExamenId) {
            resultsContainer.innerHTML = '<div class="alert alert-warning">No se proporcionó un ID de entrega.</div>';
            return;
        }

        try {
            const result = await fetchApi('EXAM', 'getExamResult', { entregaExamenId, userId: currentUser.userId });
            if (result.status === 'success' && result.data) {
                renderResults(result.data);
            } else throw new Error(result.message);
        } catch (error) {
            resultsContainer.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        }
    }

    function renderResults(data) {
        const { calificacionTotal, resultadosDetallados, examenTitulo } = data;

        let detailsHtml = '';
        resultadosDetallados.forEach((item, index) => {
            const statusClass = item.esCorrecta ? 'border-success' : (parseFloat(item.score) > 0 ? 'border-warning' : 'border-danger');
            const icon = item.esCorrecta ? 'fa-check-circle text-success' : (parseFloat(item.score) > 0 ? 'fa-exclamation-circle text-warning' : 'fa-times-circle text-danger');

            detailsHtml += `
                <div class="card-ima p-3 mb-3 border-start border-4 ${statusClass}">
                    <div class="d-flex justify-content-between">
                        <h6 class="fw-bold mb-1">Pregunta ${index + 1}</h6>
                        <i class="fas ${icon} fs-5"></i>
                    </div>
                    <p class="small text-dark mb-2">${item.texto}</p>
                    <div class="bg-light p-2 rounded small">
                        <p class="mb-0"><strong>Respuesta:</strong> <span class="text-primary">${item.respuestaEstudiante || 'Sin respuesta'}</span></p>
                        <p class="mb-0"><strong>Puntaje:</strong> ${item.score}</p>
                    </div>
                </div>`;
        });

        resultsContainer.innerHTML = `
            <div class="text-center mb-5 animate-fade-in-up">
                <span class="badge bg-primary rounded-pill px-3 mb-2">Resultados de Examen</span>
                <h2 class="fw-bold">${examenTitulo}</h2>
                <div class="display-4 fw-bold text-primary mt-3">${calificacionTotal}%</div>
                <p class="text-muted">Calificación Obtenida</p>
            </div>
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <h5 class="fw-bold mb-4"><i class="fas fa-list-check me-2"></i>Desglose de Respuestas</h5>
                    ${detailsHtml}
                    <div class="text-center mt-5">
                        <a href="index.html" class="btn btn-outline-primary px-4 rounded-pill">Volver al Inicio</a>
                    </div>
                </div>
            </div>`;
    }

    loadResults();
});
