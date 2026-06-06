/*
  IMA Interactive Quiz Engine v1.0
  Handles: Single question view, immediate feedback, auto-transition.
*/

window.IMAQuiz = {
    init: function(containerId, questions, onComplete) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let currentIndex = 0;
        let score = 0;

        function renderQuestion(index) {
            if (index >= questions.length) {
                showResults();
                return;
            }

            const q = questions[index];
            container.innerHTML = `
                <div class="quiz-active-question animate-fade-in w-full max-w-2xl mx-auto">
                    <div class="mb-4">
                        <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pregunta ${index + 1} de ${questions.length}</span>
                        <h3 class="text-xl font-bold text-slate-800 mt-1">${q.q}</h3>
                    </div>

                    ${q.img ? `<div class="mb-4 flex justify-center"><img src="${q.img}" class="h-32 object-contain rounded-lg shadow-sm border border-slate-100"></div>` : ''}

                    <div class="grid grid-cols-1 gap-2" id="quiz-options-grid">
                        ${q.options.map((opt, i) => `
                            <button class="quiz-option-btn group flex items-center p-3 border-2 border-slate-200 rounded-xl transition-all duration-200 hover:border-blue-400 hover:bg-blue-50" data-letter="${String.fromCharCode(65 + i)}">
                                <span class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold mr-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">${String.fromCharCode(65 + i)}</span>
                                <span class="text-slate-700 font-medium">${opt}</span>
                            </button>
                        `).join('')}
                    </div>

                    <div id="quiz-feedback" class="mt-4 h-8 text-center font-bold uppercase tracking-widest text-sm"></div>
                </div>
            `;

            const buttons = container.querySelectorAll('.quiz-option-btn');
            buttons.forEach(btn => {
                btn.onclick = () => {
                    const selected = btn.getAttribute('data-letter');
                    const isCorrect = selected === q.a;
                    const feedback = container.querySelector('#quiz-feedback');

                    // Disable all buttons
                    buttons.forEach(b => b.disabled = true);

                    if (isCorrect) {
                        score++;
                        btn.classList.remove('border-slate-200');
                        btn.classList.add('border-green-500', 'bg-green-50');
                        btn.querySelector('span').classList.add('bg-green-500', 'text-white');
                        feedback.textContent = "¡Correcto!";
                        feedback.classList.add('text-green-600');
                    } else {
                        btn.classList.remove('border-slate-200');
                        btn.classList.add('border-red-500', 'bg-red-50');
                        btn.querySelector('span').classList.add('bg-red-500', 'text-white');

                        // Show correct answer
                        const correctBtn = container.querySelector(`[data-letter="${q.a}"]`);
                        if (correctBtn) {
                            correctBtn.classList.add('border-green-500', 'bg-green-50');
                        }
                        feedback.textContent = `Incorrecto - Era la ${q.a}`;
                        feedback.classList.add('text-red-600');
                    }

                    setTimeout(() => {
                        currentIndex++;
                        renderQuestion(currentIndex);
                    }, 2000);
                };
            });
        }

        function showResults() {
            container.innerHTML = `
                <div class="text-center animate-bounce-in">
                    <i class="fas fa-trophy text-6xl text-yellow-400 mb-4"></i>
                    <h3 class="text-2xl font-black text-slate-800">¡Actividad Completada!</h3>
                    <p class="text-slate-600 mt-2">Lograste un desempeño de:</p>
                    <div class="text-5xl font-black text-blue-600 mt-4">${Math.round((score/questions.length)*100)}%</div>
                    <button onclick="location.reload()" class="mt-8 px-6 py-2 bg-slate-800 text-white rounded-full font-bold uppercase text-xs tracking-widest hover:bg-slate-700 transition-colors">Reiniciar</button>
                </div>
            `;
            if (onComplete) onComplete(score);
        }

        renderQuestion(currentIndex);
    }
};
