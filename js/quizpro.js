/**
 * Lógica del sistema de Evaluación Inteligente (Quiz) - Versión 2.2
 * Mejoras: Shuffle Robusto, Session Control, Jerarquía Académica y Multi-Modalidad.
 */

let allPresentationQuestions = [];
let currentQuizQuestions = [];
let currentIndex = 0;
let score = 0;
let timerSeconds = 0;
let timerInterval = null;
let selectedAsignatura = '';
let selectedDifficulty = '';
let incorrectAnswers = [];

const SEEN_QUESTIONS_KEY = 'quizpro_seen_questions';
const SEEN_LIMIT = 200;

let userGameStats = {};

window.initQuizPro = function() {
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

// Req 2: Acceso Jerárquico
window.navigateToSubjects = function() {
    const grid = document.getElementById('subjects-grid');
    const userGrade = getStudentGrade();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const isTeacher = user?.rol === 'Profesor';

    const subjects = new Set();

    window.presentationData.forEach(gradeBlock => {
        const blockGrade = parseInt(gradeBlock.grade.match(/\d+/)?.[0] || 10);

        let hasAccess = false;
        if (isTeacher) hasAccess = true;
        else if (userGrade === 10 && blockGrade === 10) hasAccess = true;
        else if (userGrade === 11 && (blockGrade === 10 || blockGrade === 11)) hasAccess = true;
        else if (userGrade === 12) hasAccess = true;

        if (hasAccess) {
            gradeBlock.subjects.forEach(subj => {
                const normName = normalizeSubject(subj.name);
                subjects.add(normName);
            });
        }
    });

    grid.innerHTML = Array.from(subjects).sort().map(name => `
        <div class="subject-card p-6 bg-white border-2 border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all text-center" onclick="navigateToLevels('${name}')">
            <div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl">
                <i class="fas fa-book"></i>
            </div>
            <h3 class="font-bold text-gray-900 leading-tight">${name}</h3>
            <p class="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">${getSubjectLabel(name)}</p>
        </div>
    `).join('');

    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('subjects-screen').classList.remove('hidden');
};

function getSubjectLabel(name) {
    if (name.includes("Informatica")) return "Fundamentos";
    if (name.includes("Programacion")) return "Lógica y Código";
    if (name.includes("Diseno Web")) return "Frontend & UI";
    return "Academia";
}

// Req 7: Unificación Robusta
function normalizeSubject(name) {
    if (!name) return 'General';
    return name.trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s*\(?(?:[IVX]+)?\s*Parcial\)?/i, '')
        .replace(/\s+\(?[IVX]+\)?$/i, '')
        .replace(/\s+I{1,3}$/i, '')
        .trim();
}

window.backToHome = function() {
    document.getElementById('subjects-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
};

window.navigateToLevels = function(subjectName) {
    selectedAsignatura = subjectName;
    document.getElementById('selected-subject-title').textContent = subjectName;

    // Req 4: Lógica de Desbloqueo
    const stats = userGameStats[subjectName] || {};
    const basicScore = stats['basico'] || 0;
    const interScore = stats['intermedio'] || 0;

    const btnInter = document.getElementById('btn-intermedio');
    const cardInter = document.getElementById('level-intermedio');
    const btnAvan = document.getElementById('btn-avanzado');
    const cardAvan = document.getElementById('level-avanzado');

    // Desbloqueo Intermedio (>= 70% en Básico)
    if (basicScore >= 70) {
        btnInter.disabled = false;
        btnInter.innerHTML = 'Entrar';
        btnInter.classList.replace('bg-gray-300', 'bg-gray-900');
        btnInter.classList.remove('cursor-not-allowed');
        cardInter.classList.remove('locked');
    } else {
        btnInter.disabled = true;
        btnInter.innerHTML = `<i class="fas fa-lock mr-2"></i> Bloqueado`;
        btnInter.classList.replace('bg-gray-900', 'bg-gray-300');
        btnInter.classList.add('cursor-not-allowed');
        cardInter.classList.add('locked');
    }

    // Desbloqueo Avanzado (>= 70% en Intermedio)
    if (interScore >= 70) {
        btnAvan.disabled = false;
        btnAvan.innerHTML = 'Entrar';
        btnAvan.classList.replace('bg-gray-300', 'bg-gray-900');
        btnAvan.classList.remove('cursor-not-allowed');
        cardAvan.classList.remove('locked');
    } else {
        btnAvan.disabled = true;
        btnAvan.innerHTML = `<i class="fas fa-lock mr-2"></i> Bloqueado`;
        btnAvan.classList.replace('bg-gray-900', 'bg-gray-300');
        btnAvan.classList.add('cursor-not-allowed');
        cardAvan.classList.add('locked');
    }

    document.getElementById('subjects-screen').classList.add('hidden');
    document.getElementById('levels-screen').classList.remove('hidden');
};

window.backToSubjects = function() {
    document.getElementById('levels-screen').classList.add('hidden');
    document.getElementById('subjects-screen').classList.remove('hidden');
};

window.selectLevel = function(level) {
    selectedDifficulty = level;
    startQuiz();
};

/**
 * Req 1: Shuffle Robusto y Distribución Uniforme
 */
function shuffleArray(a) {
    const array = [...a];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function startQuiz() {
    document.getElementById('levels-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');

    await loadQuestions();

    if (allPresentationQuestions.length === 0) {
        alert('No hay preguntas disponibles para estos criterios.');
        location.reload();
        return;
    }

    // Req 1: Persistencia de No-Repetición
    let seenIds = JSON.parse(localStorage.getItem(SEEN_QUESTIONS_KEY) || "[]");
    let freshQuestions = allPresentationQuestions.filter(q => !seenIds.includes(q.id));

    if (freshQuestions.length < 5) freshQuestions = allPresentationQuestions;

    // Shuffle Robusto
    currentQuizQuestions = shuffleArray(freshQuestions).slice(0, 15);

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
            if (normSubj !== selectedAsignatura) continue;

            let topics = subj.topics;
            if (selectedDifficulty === 'basico') topics = topics.slice(0, Math.ceil(topics.length / 3));
            else if (selectedDifficulty === 'intermedio') topics = topics.slice(Math.floor(topics.length/3), Math.floor(topics.length*2/3));
            else if (selectedDifficulty === 'avanzado') topics = topics.slice(Math.floor(topics.length*2/3));

            topics.forEach(t => presentations.push(t.file));
        }
    }

    for (let i = 0; i < presentations.length; i += 10) {
        const batch = presentations.slice(i, i + 10);
        await Promise.all(batch.map(file => processPresentation(file)));
    }
}

async function processPresentation(file) {
    try {
        const res = await fetch('../' + file);
        const text = await res.text();

        // 1. Preguntas Definidas en Código
        const quizMatch = text.match(/const (?:quizData|quizQuestions)\s*=\s*(\[[\s\S]*?\]);/);
        if (quizMatch) {
            const data = new Function(`return ${quizMatch[1]}`)();
            data.forEach((q, idx) => {
                const type = q.type || ( (q.options && q.options.length === 2 && (q.options.includes("Verdadero") || q.options.includes("V"))) ? 'true-false' : 'multiple-choice');
                allPresentationQuestions.push({
                    id: `${file}_${idx}`,
                    question: q.q || q.question,
                    options: q.options,
                    answer: q.a || q.answer,
                    type: type,
                    source: file,
                    tags: extractTags(text, q.q || q.question)
                });
            });
        }

        // 2. Extracción de Emparejamiento (Concept-box)
        const slides = text.match(/<div[^>]*class="slide[\s\S]*?<\/div>/g) || [];
        const matchingPairs = [];
        slides.forEach(slide => {
            const titleMatch = slide.match(/<h[23][^>]*>(.*?)<\/h[23]>/);
            const conceptMatch = slide.match(/<div[^>]*class="concept-box">([\s\S]*?)<\/div>/);
            if (titleMatch && conceptMatch) {
                const def = conceptMatch[1].replace(/<[^>]*>?/gm, '').trim();
                if (def.length > 10 && def.length < 150) {
                    matchingPairs.push({ term: titleMatch[1].trim(), definition: def });
                }
            }
        });

        if (matchingPairs.length >= 3) {
            allPresentationQuestions.push({
                id: `${file}_matching_${Math.random().toString(36).substr(2, 5)}`,
                question: "Relaciona cada término con su definición correspondiente:",
                pairs: shuffleArray(matchingPairs).slice(0, 3),
                type: 'matching',
                source: file,
                tags: ["Conceptos", "Teoría"]
            });

            // Req 8: Modo Memoria (Pares de conceptos)
            allPresentationQuestions.push({
                id: `${file}_memory_${Math.random().toString(36).substr(2, 5)}`,
                question: "Reto de Memoria: Encuentra los pares de conceptos relacionados.",
                pairs: shuffleArray(matchingPairs).slice(0, 4),
                type: 'memory',
                source: file,
                tags: ["Memoria", "Conceptos"]
            });
        }

        // 3. Extracción de Práctica (Code snippets)
        const codeBlocks = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>|<code[^>]*>([\s\S]*?)<\/code>/g) || [];
        codeBlocks.forEach((block, bIdx) => {
            const cleanCode = block.replace(/<[^>]*>?/gm, '').trim();
            if (cleanCode.length > 20 && cleanCode.length < 300) {
                allPresentationQuestions.push({
                    id: `${file}_practice_${bIdx}`,
                    question: "¿Qué resultado produce este fragmento de código o cuál es su propósito principal?",
                    code: cleanCode,
                    options: generateDistractorsForCode(cleanCode),
                    answer: "Análisis técnico de estructura", // Simplificado para el generador
                    type: 'practice',
                    source: file,
                    tags: ["Práctica", "Código"]
                });
            }
        });

        // 4. Reto de Transcripción (Req 8.4)
        const longParagraphs = text.match(/<p[^>]*>([\s\S]*?)<\/p>/g) || [];
        longParagraphs.forEach((p, pIdx) => {
            const cleanText = p.replace(/<[^>]*>?/gm, '').trim();
            if (cleanText.length > 50 && cleanText.length < 150) {
                allPresentationQuestions.push({
                    id: `${file}_transcription_${pIdx}`,
                    question: "Reto de Transcripción: Escribe el siguiente texto exactamente como aparece, respetando ortografía y puntuación.",
                    targetText: cleanText,
                    type: 'transcription',
                    source: file,
                    tags: ["Escritura", "Ortografía"]
                });
            }
        });

    } catch (e) { console.error("Error loading", file); }
}

function generateDistractorsForCode(code) {
    if (code.includes("for") || code.includes("while")) return ["Bucle infinito", "Iteración controlada", "Error de sintaxis", "Declaración de variable"];
    if (code.includes("<html") || code.includes("<div")) return ["Estructura de página", "Estilo visual", "Script de servidor", "Consulta de BD"];
    return ["Ejecución lógica", "Asignación de valor", "Comparación", "Salida de datos"];
}

function extractTags(text, question) {
    const tags = [];
    if (text.includes("Programacion") || text.includes("codigo")) tags.push("Programación");
    if (text.includes("HTML") || text.includes("CSS")) tags.push("Web");
    if (text.includes("Excel") || text.includes("Calculo")) tags.push("Excel");
    if (question.toLowerCase().includes("que es") || question.toLowerCase().includes("definicion")) tags.push("Conceptos");
    return tags;
}

function showQuestion() {
    const q = currentQuizQuestions[currentIndex];
    const feedback = document.getElementById('feedback-msg');
    feedback.textContent = '';

    document.getElementById('progress-text').textContent = `${currentIndex + 1} / ${currentQuizQuestions.length}`;
    document.getElementById('progress-bar').style.width = `${((currentIndex + 1) / currentQuizQuestions.length) * 100}%`;
    document.getElementById('question-text').textContent = q.question;

    const optionsContainer = document.getElementById('options-container');
    const fibContainer = document.getElementById('fib-container');
    const matchingContainer = document.getElementById('matching-container');

    optionsContainer.innerHTML = '';
    optionsContainer.classList.add('hidden');
    fibContainer.classList.add('hidden');
    matchingContainer.classList.add('hidden');

    if (q.type === 'practice') {
        optionsContainer.classList.remove('hidden');
        const codeEl = document.createElement('div');
        codeEl.className = 'bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs mb-6 overflow-x-auto whitespace-pre';
        codeEl.textContent = q.code;
        optionsContainer.appendChild(codeEl);

        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-card w-full p-4 text-left border-2 border-gray-100 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(opt, q.answer, btn);
            optionsContainer.appendChild(btn);
        });
    } else if (q.type === 'transcription') {
        fibContainer.classList.remove('hidden');
        const targetEl = document.createElement('div');
        targetEl.className = 'bg-blue-50 text-blue-800 p-4 rounded-xl italic text-sm mb-6 border border-blue-100';
        targetEl.textContent = q.targetText;
        fibContainer.prepend(targetEl);
        document.getElementById('fib-input').placeholder = "Escribe aquí...";
    } else if (q.type === 'memory') {
        matchingContainer.classList.remove('hidden');
        const pairsList = document.getElementById('matching-pairs');
        pairsList.innerHTML = '<div class="grid grid-cols-2 gap-2" id="memory-grid"></div>';
        const grid = document.getElementById('memory-grid');

        const items = shuffleArray([...q.pairs.map(p => ({v: p.term, k: p.term})), ...q.pairs.map(p => ({v: p.definition, k: p.term}))]);
        let selectedCards = [];

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'h-16 bg-gray-100 rounded-xl flex items-center justify-center text-[10px] p-2 text-center cursor-pointer border-2 border-transparent transition-all';
            card.textContent = "???";
            card.onclick = () => {
                if (selectedCards.length < 2 && !card.classList.contains('bg-white')) {
                    card.textContent = item.v;
                    card.classList.add('bg-white', 'border-blue-500');
                    selectedCards.push({card, item});

                    if (selectedCards.length === 2) {
                        setTimeout(() => {
                            if (selectedCards[0].item.k === selectedCards[1].item.k) {
                                selectedCards.forEach(c => c.card.classList.replace('border-blue-500', 'border-emerald-500'));
                                score += 0.25; // Puntos parciales para memoria
                            } else {
                                selectedCards.forEach(c => {
                                    c.card.textContent = "???";
                                    c.card.classList.remove('bg-white', 'border-blue-500');
                                });
                            }
                            selectedCards = [];
                        }, 1000);
                    }
                }
            };
            grid.appendChild(card);
        });

        const btn = document.createElement('button');
        btn.className = 'mt-4 w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-bold uppercase';
        btn.textContent = "Finalizar Reto";
        btn.onclick = () => { currentIndex++; showQuestion(); };
        matchingContainer.appendChild(btn);

    } else if (q.type === 'matching') {
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
    } else if (q.type === 'completion' || q.type === 'fill-in-the-blanks') {
        fibContainer.classList.remove('hidden');
        document.getElementById('fib-input').value = '';
        document.getElementById('fib-input').focus();
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

    registerSeenQuestion(q.id);
}

function registerSeenQuestion(id) {
    let seenIds = JSON.parse(localStorage.getItem(SEEN_QUESTIONS_KEY) || "[]");
    if (!seenIds.includes(id)) {
        seenIds.push(id);
        if (seenIds.length > SEEN_LIMIT) seenIds.shift();
        localStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(seenIds));
    }
}

function checkAnswer(selected, correct, btn) {
    const allBtns = document.querySelectorAll('.option-card');
    const input = document.getElementById('fib-input');
    allBtns.forEach(b => b.disabled = true);
    if(input) input.disabled = true;

    const feedback = document.getElementById('feedback-msg');
    const isCorrect = String(selected).trim().toLowerCase() === String(correct).trim().toLowerCase();

    if (isCorrect) {
        if (btn) btn.classList.add('correct', 'border-emerald-500', 'bg-emerald-50', 'text-emerald-700');
        feedback.className = 'text-center h-8 font-bold text-emerald-500';
        feedback.textContent = '¡Correcto!';
        score++;
    } else {
        if (btn) btn.classList.add('incorrect', 'border-red-500', 'bg-red-50', 'text-red-700');
        feedback.className = 'text-center h-8 font-bold text-red-500';
        feedback.textContent = `Incorrecto. Era: ${correct}`;
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

window.submitFib = function() {
    const val = document.getElementById('fib-input').value;
    const q = currentQuizQuestions[currentIndex];
    checkAnswer(val, q.answer);
};

window.submitMatching = function() {
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
    }, 2000);
};

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
        const uniqueTags = [...new Set(incorrectAnswers.flatMap(q => q.tags || []))];
        recs.innerHTML = `
            <div class="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 text-left">
                <p class="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Temas a reforzar</p>
                <div class="flex flex-wrap gap-2">
                    ${uniqueTags.map(tag => `<span class="px-2 py-1 bg-white border border-orange-200 text-orange-700 text-[10px] font-bold rounded-lg">${tag}</span>`).join('')}
                </div>
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
            userGameStats = {}; // Global for unlocking logic

            quizHistory.forEach(h => {
                const parts = h[4].split(' | ');
                const subj = parts[0] || 'General';
                const level = parts[1] || 'basico';
                const scoreValue = parseFloat(h[5]);

                if (!userGameStats[subj]) userGameStats[subj] = {};
                if (!userGameStats[subj][level] || scoreValue > userGameStats[subj][level]) {
                    userGameStats[subj][level] = scoreValue;
                }
            });

            let approvedCount = 0;
            const allMistakeTags = new Set();

            // Analizar historial para extraer temas a reforzar (Req 5)
            quizHistory.forEach(h => {
                const scoreValue = parseFloat(h[5]);
                if (scoreValue < 70) {
                    const logroStr = h[4];
                    // Si el logro contiene info de errores o tags, los extraemos.
                    // Por ahora, usamos el nombre de la asignatura como tema base si falló.
                    const subj = logroStr.split(' | ')[0];
                    allMistakeTags.add(subj);
                }
            });

            container.innerHTML = Object.entries(userGameStats).map(([subj, levels]) => {
                const maxLevel = levels.avanzado !== undefined ? 'avanzado' : (levels.intermedio !== undefined ? 'intermedio' : 'basico');
                const maxScore = Math.max(...Object.values(levels));
                if (maxScore >= 70) approvedCount++;

                return `
                    <tr class="border-b border-gray-50 text-[11px]">
                        <td class="py-3 font-bold text-gray-700">${subj}</td>
                        <td class="py-3 capitalize text-blue-600 font-semibold">${maxLevel}</td>
                        <td class="py-3 font-black text-gray-900">${maxScore}%</td>
                    </tr>`;
            }).join('');

            document.getElementById('total-approvals').textContent = approvedCount;

            // Renderizar temas a reforzar en el dashboard inicial
            const reinforcementSection = document.getElementById('reinforcement-feedback');
            const tagsContainer = document.getElementById('reinforcement-tags');
            if (allMistakeTags.size > 0 && tagsContainer) {
                reinforcementSection.classList.remove('hidden');
                tagsContainer.innerHTML = Array.from(allMistakeTags).map(tag =>
                    `<span class="px-2 py-1 bg-white border border-orange-200 text-orange-700 text-[10px] font-bold rounded-lg">${tag}</span>`
                ).join('');
            }

            if (Object.keys(userGameStats).length > 0) {
                document.getElementById('performance-dashboard').classList.remove('hidden');
            }
        }
    } catch (e) { console.error("Error loading stats", e); }
}

function exitGame() { window.location.href = '../index.html?action=show-activities'; }
