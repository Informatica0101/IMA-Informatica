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

document.addEventListener('DOMContentLoaded', async () => {
    populateSubjects();

    // (Req 4.8) Control de sesión: Cancelar si el usuario abandona la pestaña
    window.addEventListener('blur', () => {
        if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
            alert('Evaluación cancelada por abandono de ventana.');
            location.reload();
        }
    });
});

function populateSubjects() {
    const select = document.getElementById('subject-select');
    const subjects = new Set();

    window.presentationData.forEach(grade => {
        grade.subjects.forEach(subj => subjects.add(subj.name));
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
            if (selectedAsignatura === 'all' || subj.name === selectedAsignatura) {
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

            // Extraer quizData del script dentro del HTML
            const match = text.match(/const quizData\s*=\s*(\[[\s\S]*?\]);/);
            if (match && match[1]) {
                // Limpiar y parsear el JS (aproximación simple)
                try {
                    // Usamos una función para evaluar de forma segura el fragmento JSON-like
                    const data = new Function(`return ${match[1]}`)();
                    if (Array.isArray(data)) {
                        data.forEach(q => {
                            allPresentationQuestions.push({
                                question: q.q,
                                options: q.options,
                                answer: q.a,
                                type: 'multiple-choice',
                                source: file
                            });
                        });
                    }
                } catch (e) { console.warn("Error parsing quizData from", file, e); }
            }

            // (Req 4.4) Extraer contenido de slides para preguntas de completación
            const slides = text.match(/<div class="slide[\s\S]*?<\/div>/g) || [];
            slides.forEach(slide => {
                const conceptMatch = slide.match(/<div class="concept-box">([\s\S]*?)<\/div>/);
                if (conceptMatch) {
                    const content = conceptMatch[1].replace(/<[^>]*>?/gm, '').trim();
                    if (content.length > 30 && content.length < 200) {
                        // Generar pregunta de completación (ocultando una palabra clave)
                        const words = content.split(' ').filter(w => w.length > 5);
                        if (words.length > 0) {
                            const targetWord = words[Math.floor(Math.random() * words.length)];
                            const questionText = content.replace(targetWord, '__________');
                            allPresentationQuestions.push({
                                question: `Completa la siguiente definición: "${questionText}"`,
                                answer: targetWord.toLowerCase().replace(/[,.;]/g, ''),
                                type: 'fill-in-blanks',
                                source: file
                            });
                        }
                    }
                }
            });

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
        msg.textContent = `Has aprobado la evaluación inteligente con un rendimiento sólido.`;
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
            "Evaluación Inteligente",
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
