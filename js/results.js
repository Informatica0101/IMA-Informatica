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
        let detailsHtml = '<div class="d-grid gap-3">';
        resultados.forEach((res, index) => {
            const pregunta = (preguntas || []).find(p => p.preguntaId === res.preguntaId);
            const borderClass = res.esCorrecta ? 'border-success' : 'border-danger';
            const bgClass = res.esCorrecta ? 'bg-success-subtle' : 'bg-danger-subtle';
            const textoPregunta = pregunta && pregunta.textoPregunta ? pregunta.textoPregunta : 'Pregunta no encontrada';

            detailsHtml += `
                <div class="p-4 rounded-4 border-start border-4 ${borderClass} ${bgClass}">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-white text-dark border small fw-bold">P${index + 1}</span>
                        <i class="fa-solid ${res.esCorrecta ? 'fa-circle-check text-success' : 'fa-circle-xmark text-danger'} fs-5"></i>
                    </div>
                    <p class="fw-bold mb-2 text-dark">${textoPregunta}</p>
                    <div class="small">
                        <span class="text-muted">Tu respuesta:</span>
                        <span class="fw-bold ${res.esCorrecta ? 'text-success' : 'text-danger'}">${res.respuestaEstudiante || 'No respondida'}</span>
                    </div>
                </div>
            `;
        });
        detailsHtml += '</div>';

        resultsContainer.innerHTML = `
            <div class="mb-5">
                <div class="display-1 fw-black text-primary mb-0" style="font-weight: 900;">${calificacion}<span class="fs-2 text-muted">/100</span></div>
                <div class="h5 fw-bold text-secondary text-uppercase tracking-wider">Calificación Obtenida</div>
            </div>

            <div class="text-start mx-auto" style="max-width: 700px;">
                <h3 class="h5 fw-bold text-dark mb-4 border-bottom pb-2">
                    <i class="fa-solid fa-clipboard-check text-primary me-2"></i> Detalle de Respuestas
                </h3>
                ${detailsHtml}
            </div>
        `;
    }

    function renderResults(data) {
        const { calificacionTotal, resultadosDetallados, examenTitulo } = data;

        let detailsHtml = '<div class="d-grid gap-3">';
        resultadosDetallados.forEach((item, index) => {
            const isCorrect = item.esCorrecta;
            const isPartial = !isCorrect && parseFloat(item.score) > 0;
            const borderClass = isCorrect ? 'border-success' : (isPartial ? 'border-warning' : 'border-danger');
            const bgClass = isCorrect ? 'bg-success-subtle' : (isPartial ? 'bg-warning-subtle' : 'bg-danger-subtle');

            let displayAnswer = item.respuestaEstudiante;
            if (item.tipo === 'termino_pareado') {
                try {
                    const sMap = JSON.parse(item.respuestaEstudiante || "{}");
                    displayAnswer = Object.entries(sMap).map(([idx, concept]) => `Definición ${parseInt(idx)+1} → Concepto ${concept}`).join(', ');
                } catch(e) {}
            }

            detailsHtml += `
                <div class="p-4 rounded-4 border-start border-4 ${borderClass} ${bgClass}">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-white text-dark border small fw-bold">P${index + 1}</span>
                        <div class="d-flex align-items-center gap-2">
                            <span class="fw-bold small text-dark">${item.score} pts</span>
                            <i class="fa-solid ${isCorrect ? 'fa-circle-check text-success' : (isPartial ? 'fa-circle-exclamation text-warning' : 'fa-circle-xmark text-danger')} fs-5"></i>
                        </div>
                    </div>
                    <p class="fw-bold mb-2 text-dark small">${item.texto}</p>
                    <div class="small">
                        <span class="text-muted">Respuesta registrada:</span>
                        <span class="fw-bold ${isCorrect ? 'text-success' : (isPartial ? 'text-warning-emphasis' : 'text-danger')}">${displayAnswer || 'No respondida'}</span>
                    </div>
                </div>
            `;
        });
        detailsHtml += '</div>';

        resultsContainer.innerHTML = `
            <div class="mb-5">
                <div class="h6 fw-bold text-secondary text-uppercase tracking-widest mb-1">Evaluación Finalizada</div>
                <div class="h3 fw-bold text-dark mb-4" style="font-family: 'Poppins';">${examenTitulo}</div>
                <div class="display-1 fw-black text-primary mb-0" style="font-weight: 900;">${calificacionTotal}<span class="fs-2 text-muted">/100</span></div>
            </div>

            <div class="text-start mx-auto" style="max-width: 700px;">
                <h3 class="h5 fw-bold text-dark mb-4 border-bottom pb-2">
                    <i class="fa-solid fa-list-ul text-primary me-2"></i> Desglose de Puntaje
                </h3>
                ${detailsHtml}
            </div>
        `;
    }

    loadResults();
});
