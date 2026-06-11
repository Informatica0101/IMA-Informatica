/**
 * UI Logic for results.html
 * Transpiled to Strict ES5 for v7.5 Legacy Compatibility
 */

var QuizProApp = window.QuizProApp || {};
(function(app) {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        var resultsContainer = document.getElementById('results-container');

        var entregaExamenId = app.getUrlParam('entregaExamenId');
        var calificacionParam = app.getUrlParam('calificacion');

        function loadResults() {
            if (!resultsContainer) return;
            resultsContainer.innerHTML = '<div class="text-center p-8"><i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i><p class="mt-4 text-gray-500">Cargando resultados...</p></div>';

            if (!entregaExamenId) {
                // Fallback: Si no hay ID de entrega, intentar cargar desde parámetros (modo offline/directo)
                try {
                    var rawResultados = app.getUrlParam('resultados');
                    var rawPreguntas = app.getUrlParam('preguntas');
                    if (rawResultados) {
                        var resultados = JSON.parse(decodeURIComponent(rawResultados));
                        var preguntas = rawPreguntas ? JSON.parse(decodeURIComponent(rawPreguntas)) : [];
                        renderLocalResults(calificacionParam || 0, resultados, preguntas);
                        return;
                    }
                } catch (e) {
                    console.error("Error parsing offline results:", e);
                }
                resultsContainer.innerHTML = '<div class="text-center p-8 text-red-500">No se encontró la referencia del examen.</div>';
                return;
            }

            if (app.fetchApi) {
                app.fetchApi('EXAM', 'getExamResult', {
                    entregaExamenId: entregaExamenId,
                    userId: currentUser.userId
                }).then(function(result) {
                    if (result.status === 'success') {
                        renderResults(result.data);
                    } else {
                        resultsContainer.innerHTML = '<div class="text-center p-8 text-red-500">Error: ' + (result.message || 'No se pudieron cargar los resultados.') + '</div>';
                    }
                }).catch(function(err) {
                    console.error("Error fetching results:", err);
                    resultsContainer.innerHTML = '<div class="text-center p-8 text-red-500">Error de conexión al cargar resultados.</div>';
                });
            }
        }

        function renderLocalResults(score, resultados, preguntas) {
            var detailsHtml = '<div class="space-y-4">';
            resultados.forEach(function(res, index) {
                var pregunta = null;
                if (preguntas && preguntas.length > 0) {
                    for (var i = 0; i < preguntas.length; i++) {
                        if (preguntas[i].preguntaId === res.preguntaId) {
                            pregunta = preguntas[i];
                            break;
                        }
                    }
                }

                var bgColor = res.esCorrecta ? 'bg-green-100' : 'bg-red-100';
                var borderColor = res.esCorrecta ? 'border-green-500' : 'border-red-500';
                var textoPregunta = (pregunta && pregunta.textoPregunta) ? pregunta.textoPregunta : 'Pregunta ' + (index + 1);

                detailsHtml += '<div class="p-4 rounded-lg border-l-4 ' + bgColor + ' ' + borderColor + '">' +
                    '<p class="font-bold text-gray-800">' + (index + 1) + '. ' + textoPregunta + '</p>' +
                    '<p class="text-sm mt-2"><span class="font-semibold">Tu respuesta:</span> ' + res.respuestaEstudiante + '</p>' +
                    (!res.esCorrecta ? '<p class="text-sm text-green-700 font-medium">Respuesta correcta: ' + (res.respuestaCorrecta || '---') + '</p>' : '') +
                    '</div>';
            });
            detailsHtml += '</div>';

            resultsContainer.innerHTML = '<div class="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto">' +
                '<div class="text-center mb-8">' +
                '<h2 class="text-3xl font-bold text-gray-900">Resultado del Examen</h2>' +
                '<div class="mt-4 inline-block p-6 rounded-full bg-blue-50 border-4 border-blue-100">' +
                '<span class="text-5xl font-black text-blue-600">' + score + '%</span>' +
                '</div>' +
                '</div>' +
                detailsHtml +
                '<div class="mt-8 text-center">' +
                '<a href="student-dashboard.html" class="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">Volver al Dashboard</a>' +
                '</div>' +
                '</div>';
        }

        function renderResults(data) {
            var calificacionTotal = data.calificacionTotal;
            var resultadosDetallados = data.resultadosDetallados;
            var examenTitulo = data.examenTitulo || 'Resultado del Examen';

            var detailsHtml = '<div class="space-y-4">';
            resultadosDetallados.forEach(function(item, index) {
                var scoreVal = parseFloat(item.score);
                var isCorrect = !!item.esCorrecta;
                var bgColor = isCorrect ? 'bg-green-100' : (scoreVal > 0 ? 'bg-yellow-50' : 'bg-red-100');
                var borderColor = isCorrect ? 'border-green-500' : (scoreVal > 0 ? 'border-yellow-500' : 'border-red-500');

                var displayAnswer = item.respuestaEstudiante;
                if (item.tipoPregunta === 'emparejamiento') {
                    try {
                        var sMap = JSON.parse(item.respuestaEstudiante || "{}");
                        var pairs = [];
                        var keys = Object.keys(sMap);
                        for (var k = 0; k < keys.length; k++) {
                            var idx = keys[k];
                            pairs.push('Definición ' + (parseInt(idx) + 1) + ' → Concepto ' + sMap[idx]);
                        }
                        displayAnswer = pairs.join(', ');
                    } catch (e) {
                        displayAnswer = item.respuestaEstudiante;
                    }
                }

                detailsHtml += '<div class="p-4 rounded-lg border-l-4 ' + bgColor + ' ' + borderColor + '">' +
                    '<p class="font-bold text-gray-800">' + (index + 1) + '. ' + item.textoPregunta + '</p>' +
                    '<p class="text-sm mt-2"><span class="font-semibold">Tu respuesta:</span> ' + displayAnswer + '</p>' +
                    (!isCorrect ? '<p class="text-sm text-green-700 font-medium">Respuesta correcta: ' + (item.respuestaCorrecta || '---') + '</p>' : '') +
                    (item.retroalimentacion ? '<p class="text-xs italic text-gray-500 mt-1">' + item.retroalimentacion + '</p>' : '') +
                    '</div>';
            });
            detailsHtml += '</div>';

            resultsContainer.innerHTML = '<div class="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto">' +
                '<div class="text-center mb-8">' +
                '<h2 class="text-3xl font-bold text-gray-900">' + examenTitulo + '</h2>' +
                '<div class="mt-4 inline-block p-6 rounded-full bg-blue-50 border-4 border-blue-100">' +
                '<span class="text-5xl font-black text-blue-600">' + calificacionTotal + '%</span>' +
                '</div>' +
                '</div>' +
                detailsHtml +
                '<div class="mt-8 text-center">' +
                '<a href="student-dashboard.html" class="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">Volver al Dashboard</a>' +
                '</div>' +
                '</div>';
        }

        loadResults();
    });

})(QuizProApp);
