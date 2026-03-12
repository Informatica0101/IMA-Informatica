document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Validar acceso (Profesores siempre, estudiantes solo si es su resultado)
    const resultsContainer = document.getElementById('results-container');
    const urlParams = new URLSearchParams(window.location.search);
    const entregaExamenId = urlParams.get('entregaExamenId');
    const calificacionParam = urlParams.get('calificacion');

    async function loadResults() {
        // Caso A: Datos pasados directamente por URL (Legacy/Instantáneo) (A-26)
        if (calificacionParam) {
            try {
                const rawResultados = urlParams.get('resultados');
                const rawPreguntas = urlParams.get('preguntas');

                if (!rawResultados || !rawPreguntas) {
                    throw new Error("Faltan parámetros de resultados o preguntas en la URL.");
                }

                const resultados = JSON.parse(decodeURIComponent(rawResultados));
                const preguntas = JSON.parse(decodeURIComponent(rawPreguntas));
                renderResultsDirect(calificacionParam, resultados, preguntas);
                return;
            } catch (e) {
                console.error("Error al procesar parámetros de URL:", e);
                resultsContainer.innerHTML = `<p class="text-red-500">Error al cargar resultados directos: ${e.message}</p>`;
                return;
            }
        }

        // Caso B: Fetch desde API por entregaId
        if (!entregaExamenId) {
            resultsContainer.innerHTML = '<p class="text-red-500">No se proporcionó un ID de entrega de examen.</p>';
            return;
        }

        try {
            const result = await fetchApi('EXAM', 'getExamResult', { entregaExamenId, userId: currentUser.userId });

            if (result.status === 'success' && result.data) {
                renderResults(result.data);
            } else {
                // Si el estudiante intenta ver un examen que no es suyo, el backend debería denegarlo
                throw new Error(result.message || 'No se pudieron cargar los resultados.');
            }
        } catch (error) {
            resultsContainer.innerHTML = `<p class="text-red-500">Error al cargar los resultados: ${error.message}</p>`;
        }
    }

    function renderResultsDirect(calificacion, resultados, preguntas) {
        let detailsHtml = '<div class="d-flex flex-column gap-3">';
        resultados.forEach((res, index) => {
            const pregunta = (preguntas || []).find(p => p.preguntaId === res.preguntaId);
            const borderClass = res.esCorrecta ? 'border-success' : 'border-danger';
            const badgeClass = res.esCorrecta ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger';
            const textoPregunta = pregunta && pregunta.textoPregunta ? pregunta.textoPregunta : 'Pregunta no encontrada';

            detailsHtml += `
                <div class="card-ima p-4 border-start border-4" style="border-left-color: ${res.esCorrecta ? 'var(--ima-green)' : 'var(--ima-red)'} !important;">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="badge ${badgeClass} rounded-pill px-3">Pregunta ${index + 1}</span>
                        <i class="fa-solid ${res.esCorrecta ? 'fa-circle-check text-success' : 'fa-circle-xmark text-danger'} fs-4"></i>
                    </div>
                    <p class="fw-bold mb-3 text-dark">${textoPregunta}</p>
                    <div class="p-3 bg-light rounded-3 border">
                        <span class="text-muted small d-block text-uppercase fw-bold mb-1" style="font-size: 0.65rem;">Tu respuesta:</span>
                        <span class="fw-bold ${res.esCorrecta ? 'text-success' : 'text-danger'}">${res.respuestaEstudiante || 'No respondida'}</span>
                    </div>
                </div>
            `;
        });
        detailsHtml += '</div>';

        resultsContainer.innerHTML = `
            <div class="text-center mb-5">
                <div class="display-3 fw-bold text-primary mb-1">${calificacion}<span class="fs-4 text-muted">/100</span></div>
                <div class="h6 fw-bold text-secondary text-uppercase mb-0" style="letter-spacing: 2px;">Puntaje Obtenido</div>
            </div>

            <div class="text-start mx-auto" style="max-width: 800px;">
                <div class="d-flex align-items-center gap-3 mb-4">
                    <div class="bg-primary p-2 rounded-3"><i class="fa-solid fa-list-check text-white"></i></div>
                    <h3 class="h5 fw-bold mb-0">Revisión de la Evaluación</h3>
                </div>
                ${detailsHtml}
            </div>
        `;
    }

    function renderResults(data) {
        const { calificacionTotal, resultadosDetallados, examenTitulo } = data;

        let detailsHtml = '<div class="d-flex flex-column gap-3">';
        resultadosDetallados.forEach((item, index) => {
            const isCorrect = item.esCorrecta;
            const isPartial = !isCorrect && parseFloat(item.score) > 0;
            const borderLeftColor = isCorrect ? 'var(--ima-green)' : (isPartial ? 'var(--ima-orange)' : 'var(--ima-red)');
            const badgeClass = isCorrect ? 'bg-success-subtle text-success' : (isPartial ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger');

            let displayAnswer = item.respuestaEstudiante;
            if (item.tipo === 'termino_pareado') {
                try {
                    const sMap = JSON.parse(item.respuestaEstudiante || "{}");
                    displayAnswer = Object.entries(sMap).map(([idx, concept]) => `Definición ${parseInt(idx)+1} → Concepto ${concept}`).join(', ');
                } catch(e) {}
            }

            detailsHtml += `
                <div class="card-ima p-4 border-start border-4" style="border-left-color: ${borderLeftColor} !important;">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="badge ${badgeClass} rounded-pill px-3">Pregunta ${index + 1}</span>
                        <div class="d-flex align-items-center gap-3">
                            <span class="fw-bold text-dark">${item.score} pts</span>
                            <i class="fa-solid ${isCorrect ? 'fa-circle-check text-success' : (isPartial ? 'fa-circle-exclamation text-warning' : 'fa-circle-xmark text-danger')} fs-4"></i>
                        </div>
                    </div>
                    <p class="fw-bold mb-3 text-dark small">${item.texto}</p>
                    <div class="p-3 bg-light rounded-3 border">
                        <span class="text-muted small d-block text-uppercase fw-bold mb-1" style="font-size: 0.65rem;">Respuesta registrada:</span>
                        <span class="fw-bold ${isCorrect ? 'text-success' : (isPartial ? 'text-warning-emphasis' : 'text-danger')}">${displayAnswer || 'No respondida'}</span>
                    </div>
                </div>
            `;
        });
        detailsHtml += '</div>';

        resultsContainer.innerHTML = `
            <div class="text-center mb-5">
                <div class="h6 fw-bold text-secondary text-uppercase mb-2" style="letter-spacing: 3px;">Evaluación Finalizada</div>
                <h2 class="h3 fw-bold text-dark mb-4" style="font-family: 'Poppins';">${examenTitulo}</h2>
                <div class="display-3 fw-bold text-primary mb-1">${calificacionTotal}<span class="fs-4 text-muted">/100</span></div>
            </div>

            <div class="text-start mx-auto" style="max-width: 800px;">
                <div class="d-flex align-items-center gap-3 mb-4">
                    <div class="bg-primary p-2 rounded-3"><i class="fa-solid fa-list-ul text-white"></i></div>
                    <h3 class="h5 fw-bold mb-0">Desglose de Puntaje</h3>
                </div>
                ${detailsHtml}
            </div>
        `;
    }

    loadResults();
});
