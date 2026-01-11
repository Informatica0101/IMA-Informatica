document.addEventListener('DOMContentLoaded', () => {
    const calificacionTotalEl = document.getElementById('calificacion-total');
    const resultsContainer = document.getElementById('results-container');

    const urlParams = new URLSearchParams(window.location.search);
    const calificacion = urlParams.get('calificacion');
    const resultados = JSON.parse(decodeURIComponent(urlParams.get('resultados')));
    const preguntas = JSON.parse(decodeURIComponent(urlParams.get('preguntas')));

    calificacionTotalEl.textContent = `${calificacion}%`;

    resultsContainer.innerHTML = resultados.map((res, index) => {
        const pregunta = preguntas.find(p => p.preguntaId === res.preguntaId);
        const esCorrecta = res.esCorrecta;
        const icon = esCorrecta ? '✅' : '❌';
        const color = esCorrecta ? 'text-green-600' : 'text-red-600';

        return `
            <div class="border p-4 rounded-lg">
                <p class="font-bold">${index + 1}. ${pregunta.textoPregunta}</p>
                <p class="text-sm ${color}">Tu respuesta: ${res.respuestaEstudiante} ${icon}</p>
            </div>
        `;
    }).join('');
});
