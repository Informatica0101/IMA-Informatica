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
        let detailsHtml = '<div class="space-y-4 text-left">';
        resultados.forEach((res, index) => {
            const pregunta = (preguntas || []).find(p => p.preguntaId === res.preguntaId);
            const bgColor = res.esCorrecta ? 'bg-emerald-50' : 'bg-rose-50';
            const borderColor = res.esCorrecta ? 'border-emerald-100' : 'border-rose-100';
            const textColor = res.esCorrecta ? 'text-emerald-700' : 'text-rose-700';
            const textoPregunta = pregunta && pregunta.textoPregunta ? pregunta.textoPregunta : 'Pregunta no encontrada';

            detailsHtml += `
                <div class="p-4 rounded-xl border ${borderColor} ${bgColor}">
                    <p class="font-bold text-slate-800 mb-2">${index + 1}. ${textoPregunta}</p>
                    <p class="text-sm ${textColor} font-medium">
                        Tu respuesta: <span class="font-bold underline">${res.respuestaEstudiante || 'No respondida'}</span>
                        ${res.esCorrecta ? '— Correcto' : '— Incorrecto'}
                    </p>
                </div>
            `;
        });
        detailsHtml += '</div>';

        resultsContainer.innerHTML = `
            <div class="mb-8">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Calificación Obtenida</span>
                <p class="text-6xl font-black text-[#1e3a8a] tabular-nums">${calificacion}%</p>
            </div>
            <div class="w-full">
                <h3 class="text-sm font-bold text-slate-800 uppercase tracking-tight mb-4 text-left border-b border-slate-100 pb-2">Detalle de Respuestas</h3>
                ${detailsHtml}
            </div>
        `;
    }

    function renderResults(data) {
        const { calificacionTotal, resultadosDetallados, examenTitulo } = data;

        let detailsHtml = '<div class="space-y-4 text-left">';
        resultadosDetallados.forEach((item, index) => {
            const isPartial = parseFloat(item.score) > 0 && !item.esCorrecta;
            const bgColor = item.esCorrecta ? 'bg-emerald-50' : (isPartial ? 'bg-amber-50' : 'bg-rose-50');
            const borderColor = item.esCorrecta ? 'border-emerald-100' : (isPartial ? 'border-amber-100' : 'border-rose-100');
            const textColor = item.esCorrecta ? 'text-emerald-700' : (isPartial ? 'text-amber-700' : 'text-rose-700');

            let displayAnswer = item.respuestaEstudiante;
            if (item.tipo === 'termino_pareado') {
                try {
                    const sMap = JSON.parse(item.respuestaEstudiante || "{}");
                    displayAnswer = Object.entries(sMap).map(([idx, concept]) => `Def ${parseInt(idx)+1} → Concepto ${concept}`).join(', ');
                } catch(e) {}
            }

            detailsHtml += `
                <div class="p-4 rounded-xl border ${borderColor} ${bgColor}">
                    <p class="font-bold text-slate-800 mb-2">${index + 1}. ${item.texto}</p>
                    <p class="text-sm ${textColor} font-medium mb-1">
                        Respuesta: <span class="font-bold underline">${displayAnswer || 'No respondida'}</span>
                    </p>
                    <p class="text-[10px] uppercase tracking-widest font-bold opacity-70">Puntaje: ${item.score}</p>
                </div>
            `;
        });
        detailsHtml += '</div>';

        resultsContainer.innerHTML = `
            <div class="mb-8">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">${examenTitulo}</span>
                <p class="text-6xl font-black text-[#1e3a8a] tabular-nums">${calificacionTotal}%</p>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-widest block mt-2">Calificación Final</span>
            </div>
            <div class="w-full">
                <h3 class="text-sm font-bold text-slate-800 uppercase tracking-tight mb-4 text-left border-b border-slate-100 pb-2">Revisión de la Evaluación</h3>
                ${detailsHtml}
            </div>
        `;
    }

    loadResults();
});
