/**
 * Lógica del sistema de Evaluación Inteligente (Quiz)
 */

let allPresentationQuestions = [];
let currentQuizQuestions = [];
let currentIndex = 0;
let score = 0;
let timerSeconds = 0;
let timerInterval = null;
let selectedAsignatura = '';
let selectedDifficulty = '';

window.initQuizPro = function() {
    populateSubjects();

    // (Req 4.8) Control de sesión: Cancelar si el usuario abandona la pestaña
    const handleAbandonment = () => {
        const quizScreen = document.getElementById('quiz-screen');
        if (quizScreen && !quizScreen.classList.contains('hidden')) {
            alert('Evaluación cancelada por abandono de ventana o cambio de pestaña.');
            location.reload();
        }
    };

    window.addEventListener('blur', handleAbandonment);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            handleAbandonment();
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // Si no se carga dinámicamente desde index.html, inicializar normalmente
    if (document.getElementById('subject-select')) {
        window.initQuizPro();
    }
});

function normalizeSubject(name) {
    if (!name) return 'General';
    let normalized = name.trim();
    // Eliminar acentos para unificar (e.g., Informática vs Informatica)
    normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Eliminar sufijos de parcial: (I Parcial), (II Parcial), etc.
    normalized = normalized.replace(/\s*\((?:I+|IV|V)?\s*Parcial\)/i, '');
    // Eliminar numerales romanos al final: I, II, III, IV, V
    normalized = normalized.replace(/\s+(?:I{1,3}|IV|V)$/i, '');
    return normalized.trim();
}

function populateSubjects() {
    const select = document.getElementById('subject-select');
    const subjects = new Set();

    window.presentationData.forEach(grade => {
        grade.subjects.forEach(subj => {
            subjects.add(normalizeSubject(subj.name));
        });
    });

    select.innerHTML = '<option value="all">Todas las Asignaturas</option>' +
        Array.from(subjects).sort().map(s => `<option value="${s}">${s}</option>`).join('');
}

async function startQuiz() {
    selectedAsignatura = document.getElementById('subject-select').value;
    selectedDifficulty = document.getElementById('difficulty-select').value;

    if (!selectedAsignatura) {
        alert('Por favor selecciona una asignatura.');
        return;
    }

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');

    await loadQuestions();

    if (allPresentationQuestions.length === 0) {
        alert('No se encontraron preguntas para los criterios seleccionados. Intenta con otros.');
        location.reload();
        return;
    }

    // Seleccionar 20 preguntas aleatorias (o todas si hay menos de 20)
    currentQuizQuestions = shuffleArray([...allPresentationQuestions]).slice(0, 20);
    currentIndex = 0;
    score = 0;
    timerSeconds = 0;

    startTimer();
    showQuestion();
}

async function loadQuestions() {
    allPresentationQuestions = [];

    const presentations = [];
    window.presentationData.forEach(grade => {
        grade.subjects.forEach(subj => {
            const normSubj = normalizeSubject(subj.name);
            if (selectedAsignatura === 'all' || normSubj === selectedAsignatura) {
                // Filtrar por dificultad (basado en la posición en topics como proxy de fecha/progresión)
                let topics = subj.topics;
                if (selectedDifficulty === 'basico') topics = topics.slice(0, Math.ceil(topics.length / 3));
                else if (selectedDifficulty === 'intermedio') topics = topics.slice(Math.floor(topics.length / 3), Math.floor(topics.length * 2 / 3));
                else if (selectedDifficulty === 'avanzado') topics = topics.slice(Math.floor(topics.length * 2 / 3));

                topics.forEach(t => presentations.push(t.file));
            }
        });
    });

    // Cargar quices de las presentaciones seleccionadas
    for (const file of presentations) {
        try {
            const response = await fetch('../' + file);
            const text = await response.text();

            // Extraer quizData o quizQuestions del script dentro del HTML
            const match = text.match(/const (?:quizData|quizQuestions)\s*=\s*(\[[\s\S]*?\]);/);
            if (match && match[1]) {
                try {
                    const data = new Function(`return ${match[1]}`)();
                    if (Array.isArray(data)) {
                        data.forEach(q => {
                            allPresentationQuestions.push({
                                question: q.q || q.question,
                                options: q.options,
                                answer: q.a || q.answer,
                                type: 'multiple-choice',
                                source: file
                            });
                        });
                    }
                } catch (e) { console.warn("Error parsing quizData from", file, e); }
            }

            // (Req 4.4) Extraer contenido de slides para preguntas de completación y V/F
            const slides = text.match(/<div[^>]*class="slide[\s\S]*?<\/div>/g) || [];
            const localTerms = []; // Para mejores distractores

            slides.forEach(slide => {
                const conceptMatch = slide.match(/<div[^>]*class="concept-box">([\s\S]*?)<\/div>/);
                if (conceptMatch) {
                    const cleanContent = conceptMatch[1].replace(/<[^>]*>?/gm, '').trim();
                    const boldMatch = conceptMatch[1].match(/<strong>(.*?)<\/strong>/);
                    if (boldMatch) localTerms.push(boldMatch[1].trim());

                    if (cleanContent.length > 30 && cleanContent.length < 250) {
                        // 1. Pregunta de completación / Opción Múltiple
                        let targetWord = boldMatch ? boldMatch[1].trim() : '';
                        if (!targetWord) {
                            const words = cleanContent.split(' ').filter(w => w.length > 8);
                            if (words.length > 0) targetWord = words[0];
                        }

                        if (targetWord && cleanContent.includes(targetWord)) {
                            const questionText = cleanContent.replace(new RegExp(targetWord, 'g'), '__________');
                            const distractors = [...new Set(['Algoritmo', 'Servidor', 'Variable', 'Navegador', 'Protocolo', 'Etiqueta', ...localTerms])]
                                .filter(d => d.toLowerCase() !== targetWord.toLowerCase());

                            allPresentationQuestions.push({
                                question: `Completa el concepto: "${questionText}"`,
                                options: shuffleArray([targetWord, ...distractors.slice(0, 3)]),
                                answer: targetWord,
                                type: 'multiple-choice',
                                source: file
                            });
                        }

                        // 2. Verdadero o Falso mejorado
                        const isTrue = Math.random() > 0.4;
                        let qText = cleanContent;
                        if (!isTrue) {
                            qText = qText.replace(/\bes\b/gi, 'no es').replace(/\bpermite\b/gi, 'restringe');
                            if (qText === cleanContent) qText = "Es falso que: " + cleanContent;
                        }
                        allPresentationQuestions.push({
                            question: `¿Es la siguiente afirmación verdadera o falsa? \n\n"${qText}"`,
                            options: ['Verdadero', 'Falso'],
                            answer: isTrue ? 'Verdadero' : 'Falso',
                            type: 'multiple-choice',
                            source: file
                        });
                    }
                }
            });

            // 3. Emparejamiento (Matching)
            const matchingPairs = [];
            slides.forEach(slide => {
                const titleMatch = slide.match(/<h3[^>]*>(.*?)<\/h3>/);
                const conceptMatch = slide.match(/<div[^>]*class="concept-box">([\s\S]*?)<\/div>/);
                if (titleMatch && conceptMatch) {
                    const def = conceptMatch[1].replace(/<[^>]*>?/gm, '').trim();
                    if (def.length > 15 && def.length < 120) {
                        matchingPairs.push({ term: titleMatch[1].trim(), definition: def });
                    }
                }
            });

            if (matchingPairs.length >= 3) {
                const selected = shuffleArray([...matchingPairs]).slice(0, 3);
                allPresentationQuestions.push({
                    question: "Relaciona cada término con su definición correspondiente:",
                    pairs: selected,
                    type: 'matching',
                    source: file
                });
            }

        } catch (e) { console.warn("Fallo al cargar presentación para quiz:", file); }
    }
}

function showQuestion() {
    const q = currentQuizQuestions[currentIndex];
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const fibContainer = document.getElementById('fib-container');
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');
    const feedback = document.getElementById('feedback-msg');

    feedback.textContent = '';
    progressText.textContent = `${currentIndex + 1} / ${currentQuizQuestions.length}`;
    progressBar.style.width = `${((currentIndex + 1) / currentQuizQuestions.length) * 100}%`;

    questionText.textContent = q.question;
    optionsContainer.innerHTML = '';
    optionsContainer.classList.add('hidden');
    fibContainer.classList.add('hidden');

    const matchingContainer = document.getElementById('matching-container');
    matchingContainer.classList.add('hidden');

    if (q.type === 'multiple-choice') {
        optionsContainer.classList.remove('hidden');
        const shuffledOptions = shuffleArray([...q.options]);
        shuffledOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-card w-full p-5 text-left border-2 border-gray-100 rounded-2xl font-semibold text-gray-700 bg-white hover:bg-gray-50';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(opt, q.answer, btn);
            optionsContainer.appendChild(btn);
        });
    } else if (q.type === 'matching') {
        matchingContainer.classList.remove('hidden');
        const pairsContainer = document.getElementById('matching-pairs');
        pairsContainer.innerHTML = '';

        const terms = q.pairs.map(p => p.term);
        const definitions = shuffleArray(q.pairs.map(p => p.definition));

        q.pairs.forEach((pair, idx) => {
            const row = document.createElement('div');
            row.className = 'flex flex-col md:flex-row gap-2 items-center bg-gray-50 p-3 rounded-xl border border-gray-100';
            row.innerHTML = `
                <div class="w-full md:w-1/3 font-bold text-blue-600 text-sm">${pair.term}</div>
                <select class="matching-select w-full md:w-2/3 p-2 bg-white border rounded-lg text-xs outline-none focus:border-blue-400" data-term="${pair.term}">
                    <option value="">Selecciona la definición...</option>
                    ${definitions.map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
            `;
            pairsContainer.appendChild(row);
        });
    } else if (q.type === 'fill-in-blanks') {
        fibContainer.classList.remove('hidden');
        const input = document.getElementById('fib-input');
        input.value = '';
        input.focus();
    }
}

function submitFib() {
    const q = currentQuizQuestions[currentIndex];
    const input = document.getElementById('fib-input');
    const val = input.value.trim().toLowerCase();

    checkAnswer(val, q.answer, input);
}

function submitMatching() {
    const q = currentQuizQuestions[currentIndex];
    const selects = document.querySelectorAll('.matching-select');
    let allCorrect = true;

    selects.forEach(sel => {
        const term = sel.dataset.term;
        const val = sel.value;
        const correctPair = q.pairs.find(p => p.term === term);

        if (val !== correctPair.definition) {
            allCorrect = false;
            sel.classList.add('border-red-500');
        } else {
            sel.classList.add('border-green-500');
        }
        sel.disabled = true;
    });

    const feedback = document.getElementById('feedback-msg');
    if (allCorrect) {
        feedback.textContent = '¡Emparejamiento Correcto!';
        feedback.className = 'text-center h-8 font-bold text-sm uppercase tracking-widest text-emerald-500';
        score++;
    } else {
        feedback.textContent = 'Emparejamiento Incorrecto';
        feedback.className = 'text-center h-8 font-bold text-sm uppercase tracking-widest text-red-500';
    }

    document.getElementById('score').textContent = `${score} / ${currentIndex + 1}`;

    setTimeout(() => {
        currentIndex++;
        if (currentIndex < currentQuizQuestions.length) {
            showQuestion();
        } else {
            endQuiz();
        }
    }, 2500);
}

function checkAnswer(selected, correct, btn) {
    const allBtns = document.querySelectorAll('.option-card');
    allBtns.forEach(b => b.disabled = true);

    const feedback = document.getElementById('feedback-msg');

    if (selected === correct) {
        btn.classList.add('correct');
        feedback.textContent = '¡Correcto!';
        feedback.className = 'text-center h-8 font-bold text-sm uppercase tracking-widest text-emerald-500';
        score++;
    } else {
        btn.classList.add('incorrect');
        feedback.textContent = 'Incorrecto';
        feedback.className = 'text-center h-8 font-bold text-sm uppercase tracking-widest text-red-500';

        // Mostrar la correcta
        allBtns.forEach(b => {
            if (b.textContent === correct) b.classList.add('correct');
        });
    }

    document.getElementById('score').textContent = `${score} / ${currentIndex + 1}`;

    setTimeout(() => {
        currentIndex++;
        if (currentIndex < currentQuizQuestions.length) {
            showQuestion();
        } else {
            endQuiz();
        }
    }, 1500);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timerSeconds++;
        const mins = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
        const secs = (timerSeconds % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${mins}:${secs}`;
    }, 1000);
}

async function endQuiz() {
    clearInterval(timerInterval);
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');

    const finalPercent = Math.round((score / currentQuizQuestions.length) * 100);
    const approved = finalPercent >= 70;

    const title = document.getElementById('result-title');
    const msg = document.getElementById('result-msg');
    const icon = document.getElementById('result-icon');
    const scoreEl = document.getElementById('final-score');
    const timeEl = document.getElementById('final-time');

    scoreEl.textContent = `${finalPercent}%`;
    const mins = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
    const secs = (timerSeconds % 60).toString().padStart(2, '0');
    timeEl.textContent = `${mins}:${secs}`;

    if (approved) {
        title.textContent = '¡Excelente Trabajo!';
        msg.textContent = `Has aprobado QuizPro con un rendimiento sólido.`;
        icon.innerHTML = '<i class="fas fa-trophy"></i>';
        icon.className = 'w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 bg-emerald-50 text-emerald-500';
    } else {
        title.textContent = 'Puedes Mejorar';
        msg.textContent = `No has alcanzado el 70% requerido. Te recomendamos repasar las presentaciones del portal.`;
        icon.innerHTML = '<i class="fas fa-redo"></i>';
        icon.className = 'w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 bg-orange-50 text-orange-500';
    }

    // Registrar el logro
    if (window.GamesAdapter) {
        await GamesAdapter.saveResult(
            "QuizPro",
            `${selectedAsignatura} - ${selectedDifficulty} (${finalPercent}%)`,
            finalPercent
        );
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function exitGame() {
    window.location.href = '../index.html?action=show-activities';
}
