/**
 * Lógica del sistema de Evaluación Inteligente (Quiz) - Versión 2.1
 * Mejoras: Prevención de repetición, Jerarquía Académica, Recomendaciones, Preguntas de Emparejamiento.
 */

let allPresentationQuestions = [];
let currentQuizQuestions = [];
let currentIndex = 0;
let score = 0;
let timerSeconds = 0;
let timerInterval = null;
let selectedAsignatura = '';
let selectedDifficulty = '';
let incorrectAnswers = []; // Para recomendaciones

const SEEN_QUESTIONS_KEY = 'quizpro_seen_questions';
const SEEN_LIMIT = 200;

window.initQuizPro = function() {
    populateSubjectsByGrade();
    loadPerformanceTable();

    const handleAbandonment = () => {
        const quizScreen = document.getElementById('quiz-screen');
        if (quizScreen && !quizScreen.classList.contains('hidden')) {
            alert('Evaluación cancelada por abandono de ventana o cambio de pestaña.');
            location.reload();
        }
    };

    window.addEventListener('blur', handleAbandonment);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') handleAbandonment();
    });
};

function getStudentGrade() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return 10;
    const gradeStr = user.grado || "10";
    return parseInt(gradeStr.match(/\d+/)?.[0] || 10);
}

function populateSubjectsByGrade() {
    const select = document.getElementById('subject-select');
    const userGrade = getStudentGrade();
    const isTeacher = JSON.parse(localStorage.getItem('currentUser'))?.rol === 'Profesor';

    let html = '<option value="all">Todas las Asignaturas</option>';

    window.presentationData.forEach(gradeBlock => {
        const blockGrade = parseInt(gradeBlock.grade.match(/\d+/)?.[0] || 10);
        if (isTeacher || blockGrade <= userGrade) {
            html += `<optgroup label="${gradeBlock.grade}">`;
            gradeBlock.subjects.forEach(subj => {
                const norm = normalizeSubject(subj.name);
                html += `<option value="${norm}">${norm}</option>`;
            });
            html += `</optgroup>`;
        }
    });

    select.innerHTML = html;
}

function normalizeSubject(name) {
    if (!name) return 'General';
    return name.trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s*\((?:I+|IV|V)?\s*Parcial\)/i, '')
        .replace(/\s+(?:I{1,3}|IV|V)$/i, '')
        .trim();
}

async function startQuiz() {
    selectedAsignatura = document.getElementById('subject-select').value;
    selectedDifficulty = document.getElementById('difficulty-select').value;

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');

    await loadQuestions();

    if (allPresentationQuestions.length === 0) {
        alert('No hay preguntas disponibles para estos criterios.');
        location.reload();
        return;
    }

    let seenIds = JSON.parse(localStorage.getItem(SEEN_QUESTIONS_KEY) || "[]");
    let available = allPresentationQuestions.filter(q => !seenIds.includes(q.id));

    if (available.length < 5) available = allPresentationQuestions;

    currentQuizQuestions = shuffleArray([...available]).slice(0, 20);
    currentIndex = 0;
    score = 0;
    timerSeconds = 0;
    incorrectAnswers = [];

    startTimer();
    showQuestion();
}

async function loadQuestions() {
    allPresentationQuestions = [];
    const userGrade = getStudentGrade();
    const isTeacher = JSON.parse(localStorage.getItem('currentUser'))?.rol === 'Profesor';

    const presentations = [];
    for (const gradeBlock of window.presentationData) {
        const blockGrade = parseInt(gradeBlock.grade.match(/\d+/)?.[0] || 10);
        if (!isTeacher && blockGrade > userGrade) continue;

        for (const subj of gradeBlock.subjects) {
            const normSubj = normalizeSubject(subj.name);
            if (selectedAsignatura !== 'all' && normSubj !== selectedAsignatura) continue;

            let topics = subj.topics;
            if (selectedDifficulty === 'basico') topics = topics.slice(0, Math.ceil(topics.length / 3));
            else if (selectedDifficulty === 'intermedio') topics = topics.slice(Math.floor(topics.length/3), Math.floor(topics.length*2/3));
            else if (selectedDifficulty === 'avanzado') topics = topics.slice(Math.floor(topics.length*2/3));

            topics.forEach(t => presentations.push(t.file));
        }
    }

    // Carga paralela controlada (batches de 10)
    for (let i = 0; i < presentations.length; i += 10) {
        const batch = presentations.slice(i, i + 10);
        await Promise.all(batch.map(file => processPresentation(file)));
    }
}

async function processPresentation(file) {
    try {
        const res = await fetch('../' + file);
        const text = await res.text();
        const quizMatch = text.match(/const (?:quizData|quizQuestions)\s*=\s*(\[[\s\S]*?\]);/);

        if (quizMatch) {
            const data = new Function(`return ${quizMatch[1]}`)();
            data.forEach((q, idx) => {
                const type = q.type || 'multiple-choice';
                allPresentationQuestions.push({
                    id: `${file}_${idx}`,
                    question: q.q || q.question,
                    options: q.options,
                    answer: q.a || q.answer,
                    pairs: q.pairs, // Para emparejamiento
                    type: type,
                    source: file
                });
            });
        }

        // Extracción heurística de conceptos para preguntas generadas
        const slides = text.match(/<div[^>]*class="slide[\s\S]*?<\/div>/g) || [];
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
            allPresentationQuestions.push({
                id: `${file}_matching`,
                question: "Relaciona cada término con su definición correspondiente:",
                pairs: shuffleArray([...matchingPairs]).slice(0, 3),
                type: 'matching',
                source: file
            });
        }
    } catch (e) { console.error("Error loading", file); }
}

function showQuestion() {
    const q = currentQuizQuestions[currentIndex];
    const feedback = document.getElementById('feedback-msg');
    feedback.textContent = '';

    document.getElementById('progress-text').textContent = `${currentIndex + 1} / ${currentQuizQuestions.length}`;
    document.getElementById('progress-bar').style.width = `${((currentIndex + 1) / currentQuizQuestions.length) * 100}%`;
    document.getElementById('question-text').textContent = q.question;

    const optionsContainer = document.getElementById('options-container');
    const matchingContainer = document.getElementById('matching-container');
    optionsContainer.innerHTML = '';
    optionsContainer.classList.add('hidden');
    matchingContainer.classList.add('hidden');

    if (q.type === 'matching') {
        matchingContainer.classList.remove('hidden');
        const pairsList = document.getElementById('matching-pairs');
        pairsList.innerHTML = '';

        const definitions = shuffleArray(q.pairs.map(p => p.definition));
        q.pairs.forEach(pair => {
            const row = document.createElement('div');
            row.className = 'flex flex-col md:flex-row gap-2 items-center bg-gray-50 p-3 rounded-xl border border-gray-100';
            row.innerHTML = `
                <div class="w-full md:w-1/3 font-bold text-blue-600 text-sm">${pair.term}</div>
                <select class="matching-select w-full md:w-2/3 p-2 bg-white border rounded-lg text-xs outline-none focus:border-blue-400" data-term="${pair.term}">
                    <option value="">Selecciona...</option>
                    ${definitions.map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
            `;
            pairsList.appendChild(row);
        });
    } else {
        optionsContainer.classList.remove('hidden');
        shuffleArray([...q.options]).forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-card w-full p-4 text-left border-2 border-gray-100 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(opt, q.answer, btn);
            optionsContainer.appendChild(btn);
        });
    }

    // Registrar pregunta como vista
    let seenIds = JSON.parse(localStorage.getItem(SEEN_QUESTIONS_KEY) || "[]");
    if (!seenIds.includes(q.id)) {
        seenIds.push(q.id);
        if (seenIds.length > SEEN_LIMIT) seenIds.shift();
        localStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(seenIds));
    }
}

function checkAnswer(selected, correct, btn) {
    const allBtns = document.querySelectorAll('.option-card');
    allBtns.forEach(b => b.disabled = true);
    const feedback = document.getElementById('feedback-msg');

    if (selected === correct) {
        if (btn) btn.classList.add('correct', 'border-emerald-500', 'bg-emerald-50', 'text-emerald-700');
        feedback.className = 'text-center h-8 font-bold text-emerald-500';
        feedback.textContent = '¡Correcto!';
        score++;
    } else {
        if (btn) btn.classList.add('incorrect', 'border-red-500', 'bg-red-50', 'text-red-700');
        feedback.className = 'text-center h-8 font-bold text-red-500';
        feedback.textContent = 'Incorrecto';
        incorrectAnswers.push(currentQuizQuestions[currentIndex]);

        allBtns.forEach(b => {
            if (b.textContent === correct) b.classList.add('correct', 'border-emerald-500', 'text-emerald-600');
        });
    }

    document.getElementById('score').textContent = `${score} / ${currentIndex + 1}`;
    setTimeout(() => {
        currentIndex++;
        if (currentIndex < currentQuizQuestions.length) showQuestion();
        else endQuiz();
    }, 1500);
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
        feedback.className = 'text-center h-8 font-bold text-emerald-500';
        score++;
    } else {
        feedback.textContent = 'Emparejamiento Incorrecto';
        feedback.className = 'text-center h-8 font-bold text-red-500';
        incorrectAnswers.push(currentQuizQuestions[currentIndex]);
    }

    document.getElementById('score').textContent = `${score} / ${currentIndex + 1}`;
    setTimeout(() => {
        currentIndex++;
        if (currentIndex < currentQuizQuestions.length) showQuestion();
        else endQuiz();
    }, 2500);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timerSeconds++;
        const mins = Math.floor(timerSeconds/60).toString().padStart(2,'0');
        const secs = (timerSeconds%60).toString().padStart(2,'0');
        const timerEl = document.getElementById('timer');
        if (timerEl) timerEl.textContent = `${mins}:${secs}`;
    }, 1000);
}

async function endQuiz() {
    clearInterval(timerInterval);
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');

    const finalPercent = Math.round((score / currentQuizQuestions.length) * 100);
    const approved = finalPercent >= 70;

    document.getElementById('final-score').textContent = `${finalPercent}%`;
    const mins = Math.floor(timerSeconds/60).toString().padStart(2,'0');
    const secs = (timerSeconds%60).toString().padStart(2,'0');
    document.getElementById('final-time').textContent = `${mins}:${secs}`;

    const recs = document.getElementById('recommendations-container');
    if (incorrectAnswers.length > 0) {
        const uniqueSources = [...new Set(incorrectAnswers.map(q => q.source))];
        recs.innerHTML = `
            <div class="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 text-left">
                <p class="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-2">Recomendaciones de Refuerzo</p>
                <ul class="space-y-2">
                    ${uniqueSources.slice(0, 3).map(src => {
                        const name = src.split('/').pop().replace('.html','').replace(/_/g,' ');
                        return `<li class="text-xs text-orange-700 font-medium"><i class="fas fa-book-open mr-2"></i> Repasar: <span class="capitalize">${name}</span></li>`;
                    }).join('')}
                </ul>
            </div>`;
        recs.classList.remove('hidden');
    } else {
        recs.classList.add('hidden');
    }

    const title = document.getElementById('result-title');
    const icon = document.getElementById('result-icon');
    if (approved) {
        title.textContent = '¡Excelente Trabajo!';
        icon.className = 'w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 bg-emerald-50 text-emerald-500';
        icon.innerHTML = '<i class="fas fa-trophy"></i>';
    } else {
        title.textContent = 'Puedes Mejorar';
        icon.className = 'w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 bg-orange-50 text-orange-500';
        icon.innerHTML = '<i class="fas fa-redo"></i>';
    }

    const achievementStr = [selectedAsignatura, selectedDifficulty, score, currentQuizQuestions.length - score, `${mins}:${secs}`].join(' | ');
    if (window.GamesAdapter) {
        await GamesAdapter.saveResult("QuizPro", achievementStr, finalPercent);
        loadPerformanceTable();
    }
}

async function loadPerformanceTable() {
    const container = document.getElementById('performance-table-body');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!container || !user) return;

    try {
        const res = await fetchApi('USER', 'getGameStats', { userId: user.userId });
        if (res.status === 'success' && res.allHistory) {
            const quizHistory = res.allHistory.filter(r => r[3] === 'QuizPro');
            const subjectStats = {};

            quizHistory.forEach(h => {
                const parts = h[4].split(' | ');
                const subj = parts[0] || 'General';
                const scoreValue = parseFloat(h[5]);
                if (!subjectStats[subj] || scoreValue > subjectStats[subj].max) {
                    subjectStats[subj] = { max: scoreValue, nivel: parts[1], err: parts[3], time: parts[4] };
                }
            });

            container.innerHTML = Object.entries(subjectStats).map(([subj, s]) => `
                <tr class="border-b border-gray-50 text-[11px]">
                    <td class="py-3 font-bold text-gray-700">${subj}</td>
                    <td class="py-3 capitalize text-blue-600 font-semibold">${s.nivel}</td>
                    <td class="py-3 font-black text-gray-900">${s.max}%</td>
                    <td class="py-3 text-red-500 font-bold">${s.err}</td>
                    <td class="py-3 font-mono">${s.time}</td>
                </tr>`).join('');

            if (Object.keys(subjectStats).length > 0) {
                const panel = document.getElementById('performance-panel');
                if (panel) panel.classList.remove('hidden');
            }
        }
    } catch (e) { console.error("Error loading stats", e); }
}

function exitGame() { window.location.href = '../index.html?action=show-activities'; }
function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
