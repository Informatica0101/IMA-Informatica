/**
 * Lógica del sistema de Evaluación Inteligente (Quiz) - Versión 3.0
 * Refactorización: Matriz de Prerrequisitos, Acceso Cross-Grade y Centralización Académica.
 */

let allPresentationQuestions = [];
let currentQuizQuestions = [];
let currentIndex = 0;
let score = 0;
let timerSeconds = 0;
let timerInterval = null;
let selectedAsignatura = '';
let selectedDifficulty = '';
let selectedGrado = '';
let incorrectAnswers = [];
let lastCorrectIndex = -1; // REQ: Restricción de Memoria Inmediata (A-149)
let questionStartTime = 0;
let responseChanges = 0;
let currentStreak = 0;
let sessionXP = 0;

// REQ: Gamificación v7.0 (Modulo 4)
const XP_CONFIG = {
    BASE: 100,
    FACTORS: {
        basico: 1.0,
        intermedio: 1.5,
        avanzado: 2.0
    },
    TIME: {
        MIN: 4000, // 4s
        OPTIMAL: 15000, // 15s (T_max / 2)
        MAX: 30000 // 30s
    },
    STREAK: {
        BONUS_PER_HIT: 0.05,
        MAX: 1.3
    },
    RANGES: [
        { label: 'Básico', min: 0, max: 1500, restriction: null },
        { label: 'Promedio', min: 1501, max: 4000, restriction: { level: 'Básico', minScore: 50 } },
        { label: 'Avanzado', min: 4001, max: 8000, restriction: { level: 'Básico', minScore: 100 } },
        { label: 'Experto', min: 8001, max: 14000, restriction: { level: 'Intermedio', minScore: 50 } },
        { label: 'Maestro', min: 14001, max: 22000, restriction: { level: 'Intermedio', minScore: 100 } },
        { label: 'Leyenda', min: 22001, max: Infinity, restriction: { level: 'Avanzado', minScore: 100 } }
    ]
};

const SEEN_QUESTIONS_KEY = 'quizpro_seen_questions';
const SEEN_LIMIT = 200;

window.userGameStats = {}; // Cache de logros para validación de bloqueos
window.globalTopData = null;

window.initQuizPro = async function() {
    // REQ 2: Remoción del Bloqueador Visual (Spinner) en favor de carga asíncrona (Modulo 1)
    if (window.GamesAdapter) {
        // No esperamos el init síncrono para evitar el bloqueo del hilo de renderizado
        GamesAdapter.init('quizpro', false);
    }

    try {
        // Carga en paralelo sin bloquear la UI
        Promise.all([
            window.loadPerformanceTable(),
            loadGlobalTop()
        ]);
    } catch (e) {
        console.error("[QuizPro] Error en carga de tablas asíncrona:", e);
    }

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
    return window.parseGrade(user.grado);
}

/**
 * REQ 3: Matriz de Progresión Académica Prerrequisito
 * El acceso depende del historial de aprobación (Cross-Grade).
 */
window.navigateToSubjects = function() {
    const grid = document.getElementById('subjects-grid');
    const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    const isTeacher = user?.rol === 'Profesor';
    const userGradeNum = getStudentGrade();

    const subjectEntries = [];
    const userSection = user?.seccion;

    window.presentationData.forEach(gradeBlock => {
        const blockGradeNum = window.parseGrade(gradeBlock.grade);

        // Rule: Student can only visualize subjects of their current grade or lower
        if (isTeacher || blockGradeNum <= userGradeNum) {
            const seenInBlock = new Set();
            gradeBlock.subjects.forEach(subj => {
                if (!isTeacher && userSection && !window.checkSectionHelper(subj.sections, userSection)) return;

                const normName = window.normalizeSubject(subj.name);
                if (seenInBlock.has(normName)) return;

                subjectEntries.push({
                    name: normName,
                    gradeLabel: gradeBlock.grade,
                    gradeNum: blockGradeNum
                });
                seenInBlock.add(normName);
            });
        }
    });

    subjectEntries.sort((a, b) => a.gradeNum - b.gradeNum || a.name.localeCompare(b.name));

    grid.innerHTML = subjectEntries.map(entry => {
        const isLocked = !isTeacher && checkCrossGradeLock(entry.name, entry.gradeLabel);

        const cardClass = isLocked ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-md cursor-pointer';
        const lockIcon = isLocked ? '<i class="fas fa-lock text-xs ml-2 text-gray-400"></i>' : '';
        const clickAction = isLocked ? '' : `onclick="navigateToLevels('${entry.name}', '${entry.gradeLabel}')"`;

        return `
            <div class="subject-card p-6 bg-white border-2 border-gray-100 rounded-3xl shadow-sm transition-all text-center ${cardClass}" ${clickAction}>
                <div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl">
                    <i class="fas fa-book"></i>
                </div>
                <h3 class="font-bold text-gray-900 leading-tight">${entry.name} ${lockIcon}</h3>
                <p class="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">${getSubjectLabel(entry.name)}</p>
                <div class="mt-2 flex items-center justify-center gap-2">
                     <span class="text-[8px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold uppercase">${entry.gradeLabel}</span>
                </div>
                ${isLocked ? `<p class="text-[8px] text-red-500 font-bold uppercase mt-2">Prerrequisito pendiente</p>` : ''}
            </div>
        `;
    }).join('');

    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('subjects-screen').classList.remove('hidden');
};

/**
 * REQ 1.B: Progresión Inter-Grado (Cross-Grade Promotion) - v5.0
 * El acceso a un grado superior exige la aprobación TOTAL (Básico, Intermedio, Avanzado)
 * de TODAS las asignaturas de los grados previos con Score >= 70%.
 */
function checkCrossGradeLock(subjectName, targetGrade) {
    const targetGradeNum = window.parseGrade(targetGrade);

    // Fase de Calibración Inicial (Décimo Grado): Básico siempre desbloqueado
    // Nota: Niveles Intermedio y Avanzado de 10mo siguen progresión lineal interna en navigateToLevels
    if (targetGradeNum <= 10) return false;

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userSection = user?.seccion;
    const statsArray = Object.values(window.userGameStats || {});

    // Identificar todos los grados previos que deben estar completados
    const requiredGrades = [];
    if (targetGradeNum > 10) requiredGrades.push(10);
    if (targetGradeNum > 11) requiredGrades.push(11);

    const subjectsToApprove = []; // { name, gradeNum }
    window.presentationData.forEach(block => {
        const bg = window.parseGrade(block.grade);
        if (requiredGrades.includes(bg)) {
            block.subjects.forEach(s => {
                // Solo requerir materias que el estudiante debe cursar según su sección
                if (userSection && !window.checkSectionHelper(s.sections, userSection)) return;

                const name = window.normalizeSubject(s.name);
                if (!subjectsToApprove.some(item => item.name === name && item.gradeNum === bg)) {
                    subjectsToApprove.push({ name, gradeNum: bg });
                }
            });
        }
    });

    // Barrier Synchronization: Exige aprobación del 100% de niveles de grados previos
    const levels = ['Básico', 'Intermedio', 'Avanzado'];
    for (const req of subjectsToApprove) {
        for (const lvl of levels) {
            const hasApproval = statsArray.some(s =>
                window.normalizeSubject(s.subject) === req.name &&
                window.parseGrade(s.grade) === req.gradeNum &&
                window.getStandardLevelName(s.level) === lvl &&
                parseFloat(s.maxScore || 0) >= 70
            );
            if (!hasApproval) {
                console.log(`[QuizPro] Bloqueo Inter-Grado: Falta ${req.name} ${lvl} de ${req.gradeNum}mo Grado.`);
                return true;
            }
        }
    }

    return false;
}

window.navigateToLevels = function(subjectName, gradeLabel) {
    selectedAsignatura = subjectName;
    selectedGrado = gradeLabel;
    document.getElementById('selected-subject-title').textContent = subjectName;

    const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    const isTeacher = user?.rol === 'Profesor';

    // UI: Menciones por Asignatura
    const topContainer = document.getElementById('subject-top-container');
    const topNames = document.getElementById('subject-top-names');
    if (topContainer && topNames && window.globalTopData?.subjectTops) {
        const topList = window.globalTopData.subjectTops[gradeLabel]?.[subjectName];
        if (topList && topList.length > 0) {
            topNames.textContent = topList.map(u => u.nombre).join(', ');
            topContainer.classList.remove('hidden');
        } else {
            topContainer.classList.add('hidden');
        }
    }

    // REQ 4.2: Escala de Rangos y Progresión por Asignatura (Modulo 4)
    const statsArray = Object.values(window.userGameStats || {});
    const targetGradeNum = window.parseGrade(gradeLabel);
    const targetSubjectNorm = window.normalizeSubject(subjectName);

    const relevantStats = statsArray.filter(s => {
        if (!s.subject || s.grade === undefined) return false;
        return window.normalizeSubject(s.subject) === targetSubjectNorm &&
               window.parseGrade(s.grade) === targetGradeNum;
    });

    const getMetricsForLevel = (lvlName) => {
        const matches = relevantStats.filter(s => window.getStandardLevelName(s.level) === lvlName);
        if (matches.length === 0) return { score: 0, icr: 0, ia: 0, mastery: 0 };

        return {
            score: Math.max(...matches.map(m => parseFloat(m.maxScore || 0))),
            icr: Math.max(...matches.map(m => parseFloat(m.icr || 0))),
            ia: Math.min(...matches.map(m => parseFloat(m.ia || 100))),
            mastery: Math.max(...matches.map(m => parseFloat(m.dominio || 0)))
        };
    };

    const basicMetrics = getMetricsForLevel('Básico');
    const interMetrics = getMetricsForLevel('Intermedio');

    const basicScore = basicMetrics.score;
    const interScore = interMetrics.score;

    // Métrica de XP para rangos
    const xpKey = `xp_${targetSubjectNorm}_${gradeLabel}`;
    const currentXP = parseInt(localStorage.getItem(xpKey) || '0');

    // Determinar Rango Actual (v3.0)
    let userRange = XP_CONFIG.RANGES.find(r => currentXP >= r.min && currentXP <= r.max) || XP_CONFIG.RANGES[0];

    // REQ: Validación Rango Leyenda (Modulo 4.2 / Spec v3.0)
    if (currentXP > 22000) {
        const globalMastery = Object.values(window.userGameStats).reduce((a, b) => a + (b.dominio || 0), 0) / Math.max(Object.keys(window.userGameStats).length, 1);
        const globalICR = Object.values(window.userGameStats).reduce((a, b) => a + (b.icr || 0), 0) / Math.max(Object.keys(window.userGameStats).length, 1);
        const globalIA = Object.values(window.userGameStats).reduce((a, b) => a + (b.ia || 0), 0) / Math.max(Object.keys(window.userGameStats).length, 1);

        if (globalMastery >= 85 && globalICR >= 80 && globalIA <= 15) {
            userRange = { label: 'Leyenda' };
        } else {
            userRange = { label: 'Maestro' }; // Downgrade if psychometrics not met
        }
    }

    // UI: Mostrar Rango y XP
    const badgeHtml = `<div class="mt-4 flex flex-col items-center gap-2">
        <span class="px-4 py-1 ${userRange.label === 'Leyenda' ? 'bg-amber-500 shadow-amber-200' : 'bg-indigo-600 shadow-indigo-100'} text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">${userRange.label}</span>
        <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">${currentXP.toLocaleString()} XP ACUMULADA</p>
    </div>`;

    const existingBadge = document.getElementById('user-rank-badge');
    if (existingBadge) existingBadge.innerHTML = badgeHtml;
    else {
        const badgeContainer = document.createElement('div');
        badgeContainer.id = 'user-rank-badge';
        badgeContainer.innerHTML = badgeHtml;
        document.getElementById('selected-subject-title').after(badgeContainer);
    }

    const btnInter = document.getElementById('btn-intermedio');
    const cardInter = document.getElementById('level-intermedio');
    const btnAvan = document.getElementById('btn-avanzado');
    const cardAvan = document.getElementById('level-avanzado');

    // REQ: Motor de Progresión Multi-factor (v3.0)
    const checkUnlock = (metrics, targetLevel) => {
        if (isTeacher) return true;

        // REQ: Fase de Calibración (Cold Start) - No bloquear progresión psicométrica
        const totalAnswers = Object.values(window.userGameStats).reduce((sum, s) => sum + (s.totalAttempts || 0), 0);
        if (totalAnswers < 30) return metrics.score >= 70;

        if (targetLevel === 'intermedio') {
            // Ejemplo para Intermedio: Nota ≥ 70%, Mastery ≥ 55%, ICR ≥ 50%, IA ≤ 40%, 30 preguntas
            return metrics.score >= 70 && metrics.mastery >= 55 && metrics.icr >= 50 && metrics.ia <= 40 && totalAnswers >= 30;
        } else if (targetLevel === 'avanzado') {
            // Ejemplo para Avanzado: Nota ≥ 75%, Mastery ≥ 65%, ICR ≥ 60%, IA ≤ 35%, 75 preguntas, 3 temas dominados
            const dominatedTopics = relevantStats.filter(s => s.dominio >= 80).length;
            return metrics.score >= 75 && metrics.mastery >= 65 && metrics.icr >= 60 && metrics.ia <= 35 && totalAnswers >= 75 && dominatedTopics >= 3;
        }
        return metrics.score >= 70;
    };

    // REQ: Prioridad de Desbloqueo Local (0ms) para fase de calibración
    const localLevelsState = JSON.parse(localStorage.getItem('levels_state') || '{"intermedio": {"bloqueado": true}}');
    let canUnlockInter = !localLevelsState.intermedio.bloqueado || checkUnlock(basicMetrics, 'intermedio');
    let canUnlockAvan = checkUnlock(interMetrics, 'avanzado');

    // UI Intermedio
    if (canUnlockInter) {
        btnInter.disabled = false;
        btnInter.innerHTML = 'Entrar';
        btnInter.classList.replace('bg-gray-300', 'bg-gray-900');
        btnInter.classList.remove('cursor-not-allowed');
        cardInter.classList.remove('locked');
        const prog = cardInter.querySelector('.unlock-progress');
        if (prog) prog.remove();
    } else {
        btnInter.disabled = true;
        btnInter.innerHTML = `<i class="fas fa-lock mr-2"></i> Bloqueado`;
        btnInter.classList.replace('bg-gray-900', 'bg-gray-300');
        btnInter.classList.add('cursor-not-allowed');
        cardInter.classList.add('locked');

        let prog = cardInter.querySelector('.unlock-progress');
        if (!prog) {
            prog = document.createElement('p');
            prog.className = 'unlock-progress text-[9px] font-bold text-red-500 mt-2 uppercase';
            btnInter.after(prog);
        }

        const totalAnswers = Object.values(window.userGameStats).reduce((sum, s) => sum + (s.totalAttempts || 0), 0);
        let reason = `Requieres 70% de precisión.`;
        if (basicMetrics.score >= 70) {
            if (totalAnswers < 30) reason = `Faltan ${30 - totalAnswers} preguntas evaluadas.`;
            else if (basicMetrics.mastery < 55) reason = "Dominio insuficiente (Min 55%)";
            else if (basicMetrics.icr < 50) reason = "Confianza baja (Min 50%)";
            else if (basicMetrics.ia > 40) reason = "Adivinación alta (Max 40%)";
        }
        prog.textContent = `Bloqueado. ${reason}`;
    }

    // UI Avanzado
    if (canUnlockAvan) {
        btnAvan.disabled = false;
        btnAvan.innerHTML = 'Entrar';
        btnAvan.classList.replace('bg-gray-300', 'bg-gray-900');
        btnAvan.classList.remove('cursor-not-allowed');
        cardAvan.classList.remove('locked');
        const prog = cardAvan.querySelector('.unlock-progress');
        if (prog) prog.remove();
    } else {
        btnAvan.disabled = true;
        btnAvan.innerHTML = `<i class="fas fa-lock mr-2"></i> Bloqueado`;
        btnAvan.classList.replace('bg-gray-900', 'bg-gray-300');
        btnAvan.classList.add('cursor-not-allowed');
        cardAvan.classList.add('locked');

        let prog = cardAvan.querySelector('.unlock-progress');
        if (!prog) {
            prog = document.createElement('p');
            prog.className = 'unlock-progress text-[9px] font-bold text-red-500 mt-2 uppercase';
            btnAvan.after(prog);
        }

        const totalAnswers = Object.values(window.userGameStats).reduce((sum, s) => sum + (s.totalAttempts || 0), 0);
        let reason = `Requieres 75% de precisión.`;
        if (interMetrics.score >= 75) {
            if (totalAnswers < 75) reason = `Faltan ${75 - totalAnswers} preguntas evaluadas.`;
            else if (interMetrics.mastery < 65) reason = "Dominio insuficiente (Min 65%)";
            else if (interMetrics.icr < 60) reason = "Confianza baja (Min 60%)";
            else if (interMetrics.ia > 35) reason = "Adivinación alta (Max 35%)";
            else {
                const dominatedTopics = relevantStats.filter(s => s.dominio >= 80).length;
                if (dominatedTopics < 3) reason = `Faltan ${3 - dominatedTopics} temas dominados.`;
            }
        }
        prog.textContent = `Bloqueado. ${reason}`;
    }

    document.getElementById('subjects-screen').classList.add('hidden');
    document.getElementById('levels-screen').classList.remove('hidden');
};

function getSubjectLabel(name) {
    if (name.includes("Informatica")) return "Fundamentos";
    if (name.includes("Programacion")) return "Lógica y Código";
    if (name.includes("Diseno Web")) return "Frontend & UI";
    return "Academia";
}


window.backToHome = function() {
    document.getElementById('subjects-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
};

window.backToSubjects = function() {
    document.getElementById('levels-screen').classList.add('hidden');
    document.getElementById('subjects-screen').classList.remove('hidden');
};

window.backToLevelsAfterResult = function() {
    document.getElementById('result-screen').classList.add('hidden');
    // Si tenemos una asignatura seleccionada, ir a niveles. Si no, a asignaturas.
    if (selectedAsignatura) {
        window.navigateToLevels(selectedAsignatura, selectedGrado);
    } else {
        window.navigateToSubjects();
    }
};

window.selectLevel = function(level) {
    selectedDifficulty = level;
    // Activar Fullscreen y Wake Lock al entrar al nivel (v3.2)
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.warn("FS failed", e));
    }
    if (window.requestWakeLock) window.requestWakeLock();
    startQuiz();
};

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

    // REQ 3.0: Sistema de Refuerzo Inteligente (Modulo 8)
    const reinforcementIds = JSON.parse(localStorage.getItem('quizpro_reinforcement') || "[]");
    let reinforcementQuestions = allPresentationQuestions.filter(q => reinforcementIds.includes(q.id));

    let seenIds = JSON.parse(localStorage.getItem(SEEN_QUESTIONS_KEY) || "[]");
    let freshQuestions = allPresentationQuestions.filter(q => !seenIds.includes(q.id) && !reinforcementIds.includes(q.id));

    if (freshQuestions.length < 5) freshQuestions = allPresentationQuestions.filter(q => !reinforcementIds.includes(q.id));

    // Mezclar Refuerzo con Nuevas (Priorizando Refuerzo en los primeros slots)
    let pool = [...shuffleArray(reinforcementQuestions), ...shuffleArray(freshQuestions)];
    if (pool.length < 1) pool = allPresentationQuestions;

    // REQ 2: Algoritmo de Variedad de Fuente (Post-Audit)
    // Agrupar por origen para evitar clustering
    const groupedBySource = {};
    freshQuestions.forEach(q => {
        if (!groupedBySource[q.source]) groupedBySource[q.source] = [];
        groupedBySource[q.source].push(q);
    });

    // Barajar individualmente cada grupo
    Object.keys(groupedBySource).forEach(src => {
        groupedBySource[src] = shuffleArray(groupedBySource[src]);
    });

    const interleaved = [];
    const sources = Object.keys(groupedBySource);
    let totalAdded = 0;

    // Intercalar para máxima variedad temática
    while (totalAdded < freshQuestions.length) {
        sources.forEach(src => {
            if (groupedBySource[src].length > 0) {
                interleaved.push(groupedBySource[src].shift());
                totalAdded++;
            }
        });
    }

    // REQ: Normalización y Filtro Estricto de Niveles (Incidencias 3 y 4)
    currentQuizQuestions = interleaved.length > 0 ? interleaved : pool;

    currentQuizQuestions = currentQuizQuestions
        .map(q => window.normalizeQuestion(q))
        .filter(q => {
            const qLevel = window.getStandardLevelName(q.nivel || selectedDifficulty);
            const targetLevel = window.getStandardLevelName(selectedDifficulty);

            // Regla Estricta: Solo preguntas del nivel seleccionado
            if (qLevel !== targetLevel) {
                console.log(`[QuizPro] Pregunta excluida por nivel incorrecto: ${q.id} (${qLevel} vs ${targetLevel})`);
                return false;
            }

            // REQ: Validación obligatoria de integridad (Incidencia 3)
            const validation = window.validateQuestion(q);
            if (!validation.valid) {
                console.warn("[QuizPro] Pregunta descartada por integridad:", validation.error, q);
                return false;
            }

            return true;
        })
        .slice(0, (selectedDifficulty.toLowerCase() === 'basico' ? 30 : 15));

    currentIndex = 0;
    score = 0;
    timerSeconds = 0;
    currentStreak = 0;
    sessionXP = 0;
    incorrectAnswers = [];
    lastCorrectIndex = -1; // Resetear para nueva sesión

    startTimer();
    showQuestion();
}

/**
 * ALGORITMO DE XP (QuizPro v7.0)
 * Implementa mitigación de adivinación y ponderación psicométrica.
 */
function calculateXP(isCorrect, level, responseTime) {
    if (!isCorrect) {
        currentStreak = 0;
        return 0;
    }

    currentStreak++;

    // 1. Factor Dificultad
    const fDificultad = XP_CONFIG.FACTORS[level.toLowerCase()] || 1.0;

    // 2. Factor Tiempo (Mitigador de Adivinación)
    let fTiempo = 1.0;
    if (responseTime < XP_CONFIG.TIME.MIN) {
        fTiempo = 0.5; // Respuesta Impulsiva
    } else if (responseTime <= XP_CONFIG.TIME.OPTIMAL) {
        fTiempo = 1.2; // Respuesta Reflexiva Óptima
    } else {
        // Respuesta Tardía (Decaimiento Lineal hasta 0.8)
        const overshoot = responseTime - XP_CONFIG.TIME.OPTIMAL;
        const totalLateWindow = XP_CONFIG.TIME.MAX - XP_CONFIG.TIME.OPTIMAL;
        fTiempo = Math.max(0.8, 1.2 - (overshoot / totalLateWindow) * 0.4);
    }

    // 3. Bono Racha
    const bonoRacha = Math.min(XP_CONFIG.STREAK.MAX, 1.0 + (currentStreak * XP_CONFIG.STREAK.BONUS_PER_HIT));

    // REQ 3.0: Degradación por intentos
    const q = currentQuizQuestions[currentIndex];
    const prevAttempts = JSON.parse(localStorage.getItem(`attempts_${q.id}`) || '0');
    let attemptMultiplier = 1.0;
    if (prevAttempts === 1) attemptMultiplier = 0.75;
    else if (prevAttempts === 2) attemptMultiplier = 0.5;
    else if (prevAttempts >= 3) attemptMultiplier = 0.25;

    const totalXP = Math.round(XP_CONFIG.BASE * fDificultad * fTiempo * bonoRacha * attemptMultiplier);

    // REQ 4.2 & 6.3: Soft Cap & XP Freeze
    const targetSubjectNorm = window.normalizeSubject(selectedAsignatura);
    const gradeLabel = selectedGrado;
    const xpKey = `xp_${targetSubjectNorm}_${gradeLabel}`;
    let currentTotalXP = 0;

    // Usar PersistenceManager para persistencia estructurada si está disponible
    if (window.PersistenceManager) {
        // En un entorno asíncrono real de IndexedDB esto debería ser await,
        // pero por simplicidad para la lógica de QuizPro mantenemos sincronización o fallback.
        currentTotalXP = parseInt(localStorage.getItem(xpKey) || '0');
    } else {
        currentTotalXP = parseInt(localStorage.getItem(xpKey) || '0');
    }

    if (level.toLowerCase() === 'basico' && currentTotalXP >= 1500) {
        console.log("[XP-ENGINE] Soft Cap alcanzado (1,500 XP). AVANCE CONGELADO hasta desbloquear nivel intermedio.");
        return 0;
    }

    console.log(`[XP-ENGINE] +${totalXP} XP | Dif: ${fDificultad} | Time: ${fTiempo.toFixed(2)} | Streak: ${bonoRacha.toFixed(2)}`);
    return totalXP;
}

/**
 * RECONFIGURACIÓN: Motor de Persistencia Local Autónomo (Protocolo v5.1)
 * Se eliminan las dependencias asíncronas de red para la carga de reactivos.
 * El sistema ahora actúa de manera 100% independiente utilizando enrutamiento estático.
 */
async function loadQuestions() {
    allPresentationQuestions = [];
    console.log(`[QuizPro] Enrutamiento Local para: ${selectedAsignatura} (${selectedDifficulty})`);

    try {
        const gradeNum = window.parseGrade ? window.parseGrade(selectedGrado) : parseInt(selectedGrado);
        const gradeFolder = gradeNum === 10 ? 'Decimo' : (gradeNum === 11 ? 'Undecimo' : 'Duodecimo');

        const mapping = {
            'Informática': 'Informatica',
            'Informática Aplicada': 'Informatica_Aplicada',
            'Diseño Web': 'Diseno_Web',
            'Programación': 'Programacion',
            'Análisis y Diseño': 'Analisis_Diseno',
            'Ofimática': 'Ofimatica',
            'Informática I': 'Informatica',
            'Programación II': 'Programacion_2',
            'Programación Orientada a Objetos': 'Programacion_Orientada_a_Objetos'
        };
        const asignaturaFolder = mapping[selectedAsignatura] || selectedAsignatura.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');

        const rawLevel = window.getStandardLevelName(selectedDifficulty);
        const levelFile = rawLevel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + '.json';

        // REQ: Desacoplamiento del Backend - Enrutamiento Estático Indexado
        const isRoot = !window.location.pathname.includes('/juegos/');
        const pathPrefix = isRoot ? '' : '../';
        const path = `${pathPrefix}js/Banco_Preguntas/${gradeFolder}/${asignaturaFolder}/${levelFile}`;
        console.log(`[QuizPro] Intentando cargar desde: ${path}`);

        const localRes = await fetch(path);
        if (localRes.ok) {
            const localData = await localRes.json();
            if (localData && localData.length > 0) {
                console.log(`[QuizPro] Persistencia Local: ${localData.length} reactivos cargados.`);
                allPresentationQuestions = transformBankQuestions(localData);
            } else {
                console.warn(`[QuizPro] El nodo de persistencia está vacío: ${path}`);
            }
        } else {
            console.error(`[QuizPro] Error de direccionamiento local: ${path}`);
        }
    } catch (e) {
        console.error("[QuizPro] Fallo crítico en el motor de persistencia local:", e);
    }
}

/**
 * Transforma los datos crudos del banco (JSON o API) al formato interno de QuizPro
 */
function transformBankQuestions(data) {
    const bankQuestions = data.map(rawQ => {
                // REQ: Normalizar integridad antes de transformar (v3.2)
                const q = window.normalizeQuestion(rawQ);

        // Heurística de Multi-Modalidad (v5.0 Polymorphic Engine)
        let type = q.tipo_pregunta || q.TipoActividad || "Selección múltiple";
        let questionText = q.enunciado || q.Pregunta;
        let answer = q.respuesta_correcta_literal || q.RespuestaCorrecta;

        let options = (q.opciones_visibles && q.opciones_visibles.length > 0)
                      ? q.opciones_visibles
                      : [q.OpcionA, q.OpcionB, q.OpcionC, q.OpcionD].filter(o => o && o.trim() !== "");

                let items = q.items || [];
        let pairs = (q.parejas && q.parejas.length > 0) ? q.parejas : [];

        // Mapeo de Claves para Parejas (emparejamiento v5.0 usa {clave, valor})
        if (pairs.length > 0 && pairs[0].clave) {
            pairs = pairs.map(p => ({ term: p.clave, definition: p.valor }));
        }

                // Adaptar estructuras según el tipo de actividad si vienen vacíos
                if (type === 'ordering' && items.length === 0) {
            items = options;
        } else if ((type === 'matching' || type === 'memory' || type === 'emparejamiento') && pairs.length === 0) {
                    options.forEach(opt => {
                        if (opt.includes('|')) {
                            const [term, def] = opt.split('|');
                            pairs.push({ term: term.trim(), definition: def.trim() });
                        }
                    });
                }

                return {
            id: q.id || q.PreguntaID || `bank_${Math.random().toString(36).substr(2, 9)}`,
            question: questionText,
                    options: options,
                    items: items,
                    pairs: pairs,
            answer: answer,
                    type: type,
            explanation: q.Explicacion || q.explicacion,
            image: q.Imagen || q.imagen,
            subject: q.Asignatura || q.asignatura,
            nivel: q.Nivel || q.nivel,
            tags: [q.Tema || q.tema || "General"]
                };
            });

            // Generador de Distractores Inteligentes (Fase 3)
            bankQuestions.forEach(q => {
                if (q.options.length < 4 && (q.type === "Selección múltiple" || q.type === "opcion_multiple")) {
                    const sameTopicAnswers = bankQuestions
                        .filter(other => other.id !== q.id && other.tags[0] === q.tags[0])
                        .map(other => other.answer);

                    while (q.options.length < 4 && sameTopicAnswers.length > 0) {
                        const extra = sameTopicAnswers.shift();
                        if (!q.options.includes(extra)) q.options.push(extra);
                    }
                }
            });

            return bankQuestions;
}

async function loadQuestionsLegacy() {
    allPresentationQuestions = [];
    const presentations = [];
    window.presentationData.forEach(gradeBlock => {
        const blockGradeNum = window.parseGrade(gradeBlock.grade);
        const targetGradeNum = window.parseGrade(selectedGrado);

        if (blockGradeNum === targetGradeNum) {
            gradeBlock.subjects.forEach(subj => {
                const normSubj = window.normalizeSubject(subj.name);
                if (normSubj !== window.normalizeSubject(selectedAsignatura)) return;
                subj.topics.forEach(t => presentations.push({ file: t.file, subject: normSubj, grade: gradeBlock.grade }));
            });
        }
    });

    for (const p of presentations) {
        await processPresentation(p.file, p.subject, p.grade);
    }
}

async function processPresentation(file, subject, grade) {
    try {
        const isRoot = !window.location.pathname.includes('/juegos/');
        const pathPrefix = isRoot ? '' : '../';

        const res = await fetch(pathPrefix + file);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();

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
                    subject: subject,
                    grade: grade,
                    tags: extractTags(text, q.q || q.question)
                });
            });
        }

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
            const baseTags = extractTags(text, "memory matching");
            allPresentationQuestions.push({
                id: `${file}_matching_${Math.random().toString(36).substr(2, 5)}`,
                question: "Relaciona cada término con su definición correspondiente:",
                pairs: shuffleArray(matchingPairs).slice(0, 3),
                type: 'matching',
                source: file,
                subject: subject,
                grade: grade,
                tags: [...new Set([...baseTags, "Conceptos"])]
            });

            allPresentationQuestions.push({
                id: `${file}_memory_${Math.random().toString(36).substr(2, 5)}`,
                question: "Reto de Memoria: Encuentra los pares de conceptos relacionados.",
                pairs: shuffleArray(matchingPairs).slice(0, 4),
                type: 'memory',
                source: file,
                subject: subject,
                grade: grade,
                tags: [...new Set([...baseTags, "Memoria"])]
            });
        }

        const codeBlocks = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>|<code[^>]*>([\s\S]*?)<\/code>/g) || [];
        codeBlocks.forEach((block, bIdx) => {
            const cleanCode = block.replace(/<[^>]*>?/gm, '').trim();
            if (cleanCode.length > 20 && cleanCode.length < 300) {
                // FASE 11: Evolución Práctica - Preguntas de ordenamiento de código
                if (cleanCode.includes('\n')) {
                    const lines = cleanCode.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                    if (lines.length >= 3 && lines.length <= 6) {
                        allPresentationQuestions.push({
                            id: `${file}_ordering_${bIdx}`,
                            question: "Ordena las líneas para que el fragmento de código sea lógicamente correcto:",
                            items: lines,
                            type: 'ordering',
                            source: file,
                            subject: subject,
                            grade: grade,
                            tags: [...new Set([...extractTags(text, cleanCode), "Lógica"])]
                        });
                    }
                }

                allPresentationQuestions.push({
                    id: `${file}_practice_${bIdx}`,
                    question: "¿Qué resultado produce este fragmento de código o cuál es su propósito principal?",
                    code: cleanCode,
                    options: generateDistractorsForCode(cleanCode),
                    answer: "Análisis técnico de estructura",
                    type: 'practice',
                    source: file,
                    subject: subject,
                    grade: grade,
                    tags: [...new Set([...extractTags(text, cleanCode), "Práctica"])]
                });
            }
        });

        const longParagraphs = text.match(/<p[^>]*>([\s\S]*?)<\/p>/g) || [];
        longParagraphs.forEach((p, pIdx) => {
            const cleanText = p.replace(/<[^>]*>?/gm, '').trim();
            if (cleanText.length > 50 && cleanText.length < 150) {
                allPresentationQuestions.push({
                    id: `${file}_transcription_${pIdx}`,
                    question: "Reto de Transcripción: Escribe el siguiente texto exactamente como aparece, respetando ortografía y puntuación.",
                    targetText: cleanText,
                    answer: cleanText,
                    type: 'transcription',
                    source: file,
                    subject: subject,
                    grade: grade,
                    tags: [...new Set([...extractTags(text, cleanText), "Escritura"])]
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

/**
 * REQ: Distribución Equilibrada y Restricción de Memoria Inmediata (A-149)
 */
function getBalancedOptions(options, correct) {
    let shuffled = shuffleArray([...options]);
    let correctIdx = shuffled.indexOf(correct);

    // Evitar que la correcta repita posición consecutiva (máximo 5 intentos)
    let attempts = 0;
    while (correctIdx === lastCorrectIndex && attempts < 5) {
        shuffled = shuffleArray([...options]);
        correctIdx = shuffled.indexOf(correct);
        attempts++;
    }

    lastCorrectIndex = correctIdx;
    return shuffled;
}

function extractTags(text, question) {
    const tags = [];
    const content = (text + " " + question).toLowerCase();

    if (content.includes("programacion") || content.includes("codigo") || content.includes("algoritmo")) tags.push("Programación");
    if (content.includes("html") || content.includes("css") || content.includes("web") || content.includes("etiqueta")) tags.push("Web");
    if (content.includes("excel") || content.includes("calculo") || content.includes("tabla") || content.includes("ofimatica") || content.includes("word")) tags.push("Ofimática");
    if (content.includes("hardware") || content.includes("procesador") || content.includes("ram") || content.includes("disco") || content.includes("componente")) tags.push("Hardware");
    if (content.includes("periferico") || content.includes("entrada") || content.includes("salida") || content.includes("teclado") || content.includes("monitor")) tags.push("Periféricos");
    if (content.includes("seguridad") || content.includes("virus") || content.includes("antivirus") || content.includes("phishing")) tags.push("Seguridad");
    if (content.includes("que es") || content.includes("definicion") || content.includes("concepto")) tags.push("Conceptos");

    return tags;
}

function showQuestion() {
    const q = currentQuizQuestions[currentIndex];
    if (!q) return;

    questionStartTime = Date.now();
    responseChanges = 0;

    const feedback = document.getElementById('feedback-msg');
    feedback.textContent = '';

    document.getElementById('progress-text').textContent = `${currentIndex + 1} / ${currentQuizQuestions.length}`;
    document.getElementById('progress-bar').style.width = `${((currentIndex + 1) / currentQuizQuestions.length) * 100}%`;

    // REQ 3: Sanitización y Renderizado del Enunciado (Inyección HTML Técnico)
    // Se utiliza innerHTML para procesar etiquetas <code>, <b>, etc.
    document.getElementById('question-text').innerHTML = q.question;

    // REQ: Soporte para imágenes en preguntas
    const existingImg = document.getElementById('question-image');
    if (existingImg) existingImg.remove();

    if (q.image) {
        const img = document.createElement('img');
        img.id = 'question-image';
        img.src = window.convertDriveLink ? window.convertDriveLink(q.image) : q.image;
        img.className = 'quiz-image rounded-xl shadow-md mb-6 transition-all hover:scale-105';
        document.getElementById('question-text').after(img);
    }

    const optionsContainer = document.getElementById('options-container');
    const fibContainer = document.getElementById('fib-container');
    const matchingContainer = document.getElementById('matching-container');

    optionsContainer.innerHTML = '';
    optionsContainer.classList.add('hidden');
    fibContainer.classList.add('hidden');
    matchingContainer.classList.add('hidden');

    const input = document.getElementById('fib-input');
    const fibBtn = fibContainer.querySelector('button');
    if (input) {
        input.disabled = false;
        input.value = '';
        input.onkeydown = (e) => { if(e.key === 'Enter') submitFib(); };
    }
    if (fibBtn) fibBtn.disabled = false;

    if (q.type === 'practice' || q.type === 'funcionalidad') {
        optionsContainer.classList.remove('hidden');
        const codeEl = document.createElement('div');
        codeEl.className = 'bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs mb-6 overflow-x-auto whitespace-pre';
        codeEl.textContent = q.code;
        optionsContainer.appendChild(codeEl);

        const balanced = getBalancedOptions(q.options, q.answer);
        balanced.forEach(opt => {
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
        targetEl.style.userSelect = 'none';
        targetEl.style.webkitUserSelect = 'none';
        targetEl.textContent = q.targetText || q.answer || "Error: Texto no encontrado";
        targetEl.oncontextmenu = (e) => e.preventDefault();

        const existingTarget = fibContainer.querySelector('.transcription-target');
        if (existingTarget) existingTarget.remove();
        targetEl.classList.add('transcription-target');
        fibContainer.prepend(targetEl);

        const input = document.getElementById('fib-input');
        if (input) {
            input.placeholder = "Escribe aquí respetando ortografía...";
            input.disabled = false;
            input.readOnly = false;
            setTimeout(() => {
                input.focus();
                input.click();
            }, 500);
        }
    } else if (q.type === 'Verdadero y Falso' || q.type === 'verdadero_falso') {
        optionsContainer.classList.remove('hidden');
        const opts = ["Verdadero", "Falso"];
        opts.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-card w-full p-6 text-center border-2 border-gray-100 rounded-2xl font-black text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-200 transition-all uppercase tracking-widest text-sm';
            btn.textContent = opt;
            btn.onclick = () => {
                // Si la respuesta correcta es literal "Verdadero"/"Falso" o "A"/"B"
                const isLiteral = (String(q.answer).toLowerCase() === "verdadero" || String(q.answer).toLowerCase() === "falso");
                const val = isLiteral ? opt : (opt === "Verdadero" ? "A" : "B");
                checkAnswer(val, q.answer, btn);
            };
            optionsContainer.appendChild(btn);
        });
    } else if (q.type === 'Identificar el componente') {
        optionsContainer.classList.remove('hidden');
        const balanced = getBalancedOptions(q.options, q.answer);
        balanced.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-card w-full p-4 text-center border-2 border-gray-100 rounded-xl font-bold text-gray-700 bg-white hover:bg-blue-50 transition-all uppercase tracking-tighter';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(opt, q.answer, btn);
            optionsContainer.appendChild(btn);
        });
    } else if (q.type === 'Completar espacios' || q.type === 'completion' || q.type === 'fill-in-the-blanks' || q.type === 'completacion') {
        fibContainer.classList.remove('hidden');
        const input = document.getElementById('fib-input');
        input.value = '';
        input.placeholder = "Tu respuesta...";
        setTimeout(() => input.focus(), 100);
    } else if (q.type === 'memory') {
        matchingContainer.classList.remove('hidden');
        const pairsList = document.getElementById('matching-pairs');

        // Estilización de alta densidad para Memoria (v3.2)
        pairsList.innerHTML = `
            <div class="bg-blue-600/5 p-6 rounded-[2.5rem] border border-blue-100 mb-6">
                <div class="flex items-center justify-between mb-4">
                    <p class="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Reto de Memoria</p>
                    <div id="memory-stats" class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Pares: <span id="matched-count" class="text-emerald-500">0</span> / ${q.pairs.length}
                    </div>
                </div>
                <div class="memory-grid" id="memory-grid"></div>
            </div>
        `;
        const grid = document.getElementById('memory-grid');

        const getIcon = (tags = []) => {
            const t = (tags || []).join(' ');
            if (t.includes("Programación")) return "fa-terminal";
            if (t.includes("Web") || t.includes("HTML")) return "fa-code";
            if (t.includes("Ofimática") || t.includes("Excel")) return "fa-file-alt";
            if (t.includes("Hardware")) return "fa-microchip";
            if (t.includes("Periféricos")) return "fa-keyboard";
            if (t.includes("Seguridad")) return "fa-shield-alt";
            return "fa-brain";
        };
        const icon = getIcon(q.tags || [q.Tema]);

        const items = shuffleArray([...q.pairs.map(p => ({v: p.term, k: p.term})), ...q.pairs.map(p => ({v: p.definition, k: p.term}))]);
        let selectedCards = [];
        let matchedCount = 0;

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'memory-card group';
            card.innerHTML = `
                <div class="memory-card-inner shadow-lg group-hover:shadow-blue-200/50 transition-transform duration-500">
                    <div class="memory-card-front flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl">
                        <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                            <i class="fas ${icon} text-blue-500/40 text-2xl"></i>
                        </div>
                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Revelar</span>
                    </div>
                    <div class="memory-card-back flex items-center justify-center p-4 bg-white border-2 border-blue-500 rounded-2xl shadow-xl">
                        <span class="text-[10px] font-bold text-gray-800 leading-tight text-center uppercase tracking-tighter">${item.v}</span>
                    </div>
                </div>`;

            card.onclick = () => {
                if (selectedCards.length < 2 && !card.classList.contains('revealed') && !card.classList.contains('matched')) {
                    card.classList.add('revealed');
                    selectedCards.push({card, item});

                    if (selectedCards.length === 2) {
                        if (selectedCards[0].item.k === selectedCards[1].item.k) {
                            // ¡Match! (Efecto de éxito inmediato)
                            setTimeout(() => {
                                selectedCards.forEach(c => {
                                    c.card.classList.add('matched');
                                    const back = c.card.querySelector('.memory-card-back');
                                    back.classList.replace('border-blue-500', 'border-emerald-500');
                                    back.classList.add('bg-emerald-50', 'scale-105');
                                    // Partículas o efecto visual simple
                                    c.card.style.zIndex = "10";
                                });
                                matchedCount++;
                                document.getElementById('matched-count').textContent = matchedCount;
                                score += (1 / q.pairs.length);
                                selectedCards = [];

                                if (matchedCount === q.pairs.length) {
                                    const finishBtn = document.getElementById('finish-memory-btn');
                                    finishBtn.classList.replace('bg-gray-400', 'bg-emerald-600');
                                    finishBtn.classList.add('animate-bounce', 'shadow-emerald-200');
                                    finishBtn.textContent = "¡Reto Completado! Continuar";
                                }
                            }, 400);
                        } else {
                            // Fallo (Efecto de vibración opcional en el futuro)
                            setTimeout(() => {
                                selectedCards.forEach(c => c.card.classList.remove('revealed'));
                                selectedCards = [];
                            }, 800);
                        }
                    }
                }
            };
            grid.appendChild(card);
        });

        const btn = document.createElement('button');
        btn.id = 'finish-memory-btn';
        btn.className = 'w-full py-5 bg-gray-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl';
        btn.textContent = "Validar Reto de Memoria";
        btn.onclick = () => {
            if (matchedCount === q.pairs.length) {
                currentIndex++;
                if(currentIndex < currentQuizQuestions.length) showQuestion();
                else endQuiz();
            } else {
                alert("Debes encontrar todos los pares antes de continuar.");
            }
        };
        matchingContainer.appendChild(btn);
    } else if (q.type === 'ordering') {
        matchingContainer.classList.remove('hidden');
        const pairsList = document.getElementById('matching-pairs');
        pairsList.innerHTML = `
            <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-4">Estructura Lógica</p>
                <div class="space-y-2" id="ordering-list"></div>
            </div>`;
        const list = document.getElementById('ordering-list');

        const shuffled = shuffleArray([...q.items]);
        shuffled.forEach((item, idx) => {
            const el = document.createElement('div');
            el.className = 'p-4 bg-white border-2 border-gray-100 rounded-2xl cursor-move hover:border-blue-300 transition-all flex items-center justify-between group';
            el.innerHTML = `
                <div class="flex items-center gap-4">
                    <span class="w-6 h-6 bg-blue-50 text-blue-400 rounded-lg flex items-center justify-center text-[10px] font-black">${idx+1}</span>
                    <span class="text-xs font-bold text-gray-700 font-mono">${item}</span>
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200" onclick="window.moveOrderItem(this, -1); event.stopPropagation();"><i class="fas fa-chevron-up text-[10px]"></i></button>
                    <button class="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200" onclick="window.moveOrderItem(this, 1); event.stopPropagation();"><i class="fas fa-chevron-down text-[10px]"></i></button>
                </div>`;
            list.appendChild(el);
        });

        window.moveOrderItem = (btn, dir) => {
            const row = btn.closest('#ordering-list > div');
            if (dir === -1 && row.previousElementSibling) row.parentNode.insertBefore(row, row.previousElementSibling);
            else if (dir === 1 && row.nextElementSibling) row.parentNode.insertBefore(row.nextElementSibling, row);
            responseChanges++;
            // Re-numerar
            Array.from(list.children).forEach((child, i) => {
                child.querySelector('span').textContent = i + 1;
            });
        };

        window.submitMatching = function() {
            const currentOrder = Array.from(document.querySelectorAll('#ordering-list > div')).map(el => el.querySelector('.font-mono').textContent.trim());
            let allCorrect = true;
            q.items.forEach((item, idx) => {
                if (currentOrder[idx] !== item) allCorrect = false;
            });

            checkAnswer(allCorrect ? 'Orden Correcto' : 'Orden Incorrecto', 'Orden Correcto');
        };
    } else if (q.type === 'matching' || q.type === 'emparejamiento') {
        matchingContainer.classList.remove('hidden');
        const pairsList = document.getElementById('matching-pairs');
        pairsList.innerHTML = '';

        const shuffledDefs = shuffleArray(q.pairs.map(p => p.definition));
        const letters = "ABCDEFGHIJ";

        let html = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-left">
                <div class="bg-gray-100 p-3 rounded-xl">
                    <p class="text-[10px] font-black uppercase text-gray-500 mb-2">Tabla A: Conceptos</p>
                    <div class="space-y-2">
                        ${q.pairs.map((pair, i) => `
                            <div class="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                                <input type="text" maxlength="1"
                                    class="matching-letter-input w-8 h-8 text-center font-bold border-2 border-blue-100 rounded-lg focus:border-blue-500 outline-none uppercase text-xs"
                                    data-term="${pair.term}"
                                    oninput="responseChanges++" />
                                <span class="text-[11px] font-semibold text-gray-700">${pair.term}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="bg-blue-50 p-3 rounded-xl">
                    <p class="text-[10px] font-black uppercase text-blue-400 mb-2">Tabla B: Definiciones</p>
                    <div class="space-y-2">
                        ${shuffledDefs.map((def, i) => `
                            <div class="flex items-start gap-2 text-[10px] leading-tight">
                                <span class="font-bold text-blue-600">${letters[i]})</span>
                                <span class="text-gray-600">${def}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        pairsList.innerHTML = html;

        // Guardar mapeo correcto
        window.currentMatchingMapping = {};
        q.pairs.forEach(pair => {
            const letterIdx = shuffledDefs.indexOf(pair.definition);
            window.currentMatchingMapping[pair.term] = letters[letterIdx];
        });

    } else if (q.type === 'completion' || q.type === 'fill-in-the-blanks') {
        fibContainer.classList.remove('hidden');
        const input = document.getElementById('fib-input');
        input.value = '';
        input.placeholder = "Tu respuesta...";
        setTimeout(() => input.focus(), 100);
        // Remover elementos de transcripción si existen
        const existingTarget = fibContainer.querySelector('.transcription-target');
        if (existingTarget) existingTarget.remove();
    } else {
        optionsContainer.classList.remove('hidden');
        const balanced = getBalancedOptions(q.options, q.answer);
        balanced.forEach(opt => {
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
    if (window.isProcessingAnswer) return;
    window.isProcessingAnswer = true;

    const responseTime = Date.now() - questionStartTime;
    let q = currentQuizQuestions[currentIndex];
    const user = JSON.parse(localStorage.getItem('currentUser'));

    // REQ: Normalización de Pregunta para Incidencia 3
    q = window.normalizeQuestion(q);
    const finalCorrect = correct || q.respuestaCorrecta || "No disponible";

    // Captura de Analítica Unificada (Fase 5)
    if (window.GamesAdapter) {
        GamesAdapter.recordAction({
            asignatura: selectedAsignatura,
            nivel: window.getStandardLevelName(selectedDifficulty),
            preguntaId: q.id,
            tema: (q.tags && q.tags.length > 0) ? q.tags[0] : 'General',
            respuestaSeleccionada: selected,
            respuestaCorrecta: finalCorrect,
            esCorrecta: String(selected).trim().toLowerCase() === String(finalCorrect).trim().toLowerCase(),
            tiempoRespuesta: responseTime,
            cambiosRespuesta: responseChanges
        });
    }

    const allBtns = document.querySelectorAll('.option-card');
    const input = document.getElementById('fib-input');
    const fibBtn = document.querySelector('#fib-container button');

    allBtns.forEach(b => b.disabled = true);
    if(input) input.disabled = true;
    if(fibBtn) fibBtn.disabled = true;

    const feedback = document.getElementById('feedback-msg');

    // REQ 8.4: Evaluación estricta para Transcripción (Ortografía y Puntuación)
    q = currentQuizQuestions[currentIndex];
    let isCorrect = false;
    const cleanSelected = String(selected || "").trim();
    const cleanCorrect = String(correct || "").trim();

    if (q && q.type === 'transcription') {
        isCorrect = cleanSelected === cleanCorrect;
    } else {
        isCorrect = cleanSelected.toLowerCase() === cleanCorrect.toLowerCase();
    }

    if (isCorrect) {
        const xpGained = calculateXP(true, selectedDifficulty, responseTime);
        sessionXP += xpGained;

        // REQ 3.0: Sistema de Refuerzo - Eliminar de cola si es correcta
        let reinforcementIds = JSON.parse(localStorage.getItem('quizpro_reinforcement') || "[]");
        if (reinforcementIds.includes(q.id)) {
            reinforcementIds = reinforcementIds.filter(id => id !== q.id);
            localStorage.setItem('quizpro_reinforcement', JSON.stringify(reinforcementIds));
            console.log(`[REFUERZO] Pregunta ${q.id} superada. Eliminada de la cola.`);
        }

        if (btn) btn.classList.add('correct', 'border-emerald-500', 'bg-emerald-50', 'text-emerald-700');
        feedback.className = 'text-center h-8 font-bold text-emerald-500';
        feedback.textContent = `¡Correcto! +${xpGained} XP`;
        score++;
        console.log(`[QuizPro] Pregunta ${currentIndex} Correcta. XP Ganada: ${xpGained}`);
    } else {
        calculateXP(false); // Reset streak

        // REQ 3.0: Sistema de Refuerzo - Añadir a cola si es incorrecta
        let reinforcementIds = JSON.parse(localStorage.getItem('quizpro_reinforcement') || "[]");
        if (!reinforcementIds.includes(q.id)) {
            reinforcementIds.push(q.id);
            localStorage.setItem('quizpro_reinforcement', JSON.stringify(reinforcementIds));
            console.log(`[REFUERZO] Pregunta ${q.id} fallada. Añadida a cola de refuerzo.`);
        }

        if (btn) btn.classList.add('incorrect', 'border-red-500', 'bg-red-50', 'text-red-700');
        feedback.className = 'text-center h-8 font-bold text-red-500';

        // Garantía de Retroalimentación (Fase 3 / Incidencia 3): Eliminación definitiva de 'undefined'
        // finalCorrect ya fue definido arriba mediante normalizeQuestion

        console.error(`[QuizPro] Error en Pregunta ${currentIndex}. Esperaba: ${finalCorrect}, Recibió: ${selected}`);
        feedback.textContent = `Incorrecto. Era: ${finalCorrect}`;
        incorrectAnswers.push(q);

        // Resaltar la opción correcta en la interfaz
        allBtns.forEach(b => {
            const btnText = b.textContent.trim().toLowerCase();
            const correctText = String(finalCorrect).trim().toLowerCase();
            if (finalCorrect && btnText === correctText) {
                b.classList.add('correct', 'border-emerald-500', 'text-emerald-600', 'bg-emerald-50/50');
            }
        });
    }

    document.getElementById('score').textContent = `${score} / ${currentIndex + 1}`;

    // Registrar intento para degradación de XP
    const attempts = JSON.parse(localStorage.getItem(`attempts_${q.id}`) || '0');
    localStorage.setItem(`attempts_${q.id}`, attempts + 1);

    setTimeout(() => {
        window.isProcessingAnswer = false;
        currentIndex++;
        if (currentIndex < currentQuizQuestions.length) showQuestion();
        else endQuiz();
    }, 1200);
}

window.submitFib = function() {
    const val = document.getElementById('fib-input').value;
    const q = currentQuizQuestions[currentIndex];
    checkAnswer(val, q.answer);
};

window.submitMatching = function() {
    const q = currentQuizQuestions[currentIndex];
    const inputs = document.querySelectorAll('.matching-letter-input');
    const selects = document.querySelectorAll('.matching-select');
    let allCorrect = true;

    if (inputs.length > 0) {
        inputs.forEach(input => {
            const term = input.dataset.term;
            const val = input.value.trim().toUpperCase();
            const correctLetter = window.currentMatchingMapping[term];

            if (val !== correctLetter) {
                allCorrect = false;
                input.classList.add('border-red-500', 'bg-red-50');
            } else {
                input.classList.add('border-emerald-500', 'bg-emerald-50');
            }
            input.disabled = true;
        });
    } else {
        selects.forEach(sel => {
            const term = sel.dataset.term;
            const val = sel.value;
            const correctPair = q.pairs.find(p => p.term === term);
            if (val !== correctPair.definition) { allCorrect = false; sel.classList.add('border-red-500'); }
            else { sel.classList.add('border-green-500'); }
            sel.disabled = true;
        });
    }

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

/**
 * REQ 4: Persistencia Extendida
 */
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
                    ${uniqueTags.map(tag => `<span class="px-2 py-1 bg-white border border-orange-200 text-orange-700 text-[10px] font-bold rounded-lg">${getSanitizedAcademicText(tag)}</span>`).join('')}
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

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const payload = {
        userId: user.userId,
        nombreAlumno: user.nombre,
        juego: "QuizPro",
        asignatura: selectedAsignatura,
        puntaje: finalPercent,
        nivel: window.getStandardLevelName(selectedDifficulty),
        grado: selectedGrado,
        xpGanada: sessionXP, // REQ: Campo xp Ganada explícito (Modulo 2 - v7.2)
        fecha_logro: new Date().toISOString()
    };

    // Actualizar XP local para cálculo de Soft Cap
    const xpKey = `xp_${selectedAsignatura}_${selectedGrado}`;
    const currentTotalXP = parseInt(localStorage.getItem(xpKey) || '0');
    const newXP = currentTotalXP + sessionXP;
    localStorage.setItem(xpKey, newXP);

    // REQ: Desbloqueo Predictivo Local (Modulo 1)
    // Actualizamos el estado local ANTES de la red para asegurar 0ms de latencia en la UI
    const lvlName = window.getStandardLevelName(selectedDifficulty);
    const statKey = `QuizPro_${selectedAsignatura}_${selectedGrado}_${lvlName}`;

    if (!window.userGameStats[statKey] || finalPercent > (window.userGameStats[statKey].maxScore || 0)) {
        window.userGameStats[statKey] = {
            ...(window.userGameStats[statKey] || {}),
            subject: selectedAsignatura,
            level: lvlName,
            grade: selectedGrado,
            maxScore: Math.max(finalPercent, window.userGameStats[statKey]?.maxScore || 0),
            totalAttempts: (window.userGameStats[statKey]?.totalAttempts || 0) + 1,
            date: new Date().toISOString()
        };
    }

    // REQ: Regla del 70% y Desbloqueo de Calibración (Fase de Calibración Básico -> Intermedio)
    if (lvlName === 'Básico' && approved) {
        const levelsState = JSON.parse(localStorage.getItem('levels_state') || '{"intermedio": {"bloqueado": true}}');
        levelsState.intermedio.bloqueado = false;
        localStorage.setItem('levels_state', JSON.stringify(levelsState));
        console.log("[QuizPro] Nivel Intermedio desbloqueado localmente (0ms).");
    }

    if (window.PersistenceManager) {
        window.PersistenceManager.set('local_progress', { totalXP: newXP }, xpKey);
        // REQ: Preservación de Historial en Actualización Predictiva (Modulo 1)
        window.PersistenceManager.get('academic_stats').then(cached => {
            if (cached && cached.data) {
                const updatedData = { ...cached.data, data: window.userGameStats };
                window.PersistenceManager.set('academic_stats', updatedData);
            } else {
                window.PersistenceManager.set('academic_stats', window.userGameStats);
            }
        });
    }

    if (typeof fetchApi === 'function') {
        // REQ: Esperar a que las analíticas pendientes se procesen antes de guardar resultado final
        if (window.GamesAdapter && window.GamesAdapter.pendingAnalytics) {
            await Promise.all(window.GamesAdapter.pendingAnalytics);
        }

        // Despacho silencioso: no bloqueamos el renderizado del resultado por la red
        fetchApi('USER', 'saveGameResult', payload).then(res => {
            if (res.status === 'success' && res.updatedStats) {
                window.userGameStats = { ...window.userGameStats, ...res.updatedStats };
                console.log("[QuizPro] Sincronización silenciosa completada.");
                // REQ: Re-sincronización total tras éxito para recuperar historial y analítica extendida
                loadPerformanceTable();
            }
        }).catch(err => console.warn("[QuizPro] Error en sincronización silenciosa (se mantiene estado local):", err));
    }
}

async function loadGlobalTop() {
    const body = document.getElementById('global-top-body');
    if (!body) return;

    // REQ: Offline-First (Modulo 1)
    if (window.PersistenceManager) {
        const cached = await window.PersistenceManager.get('rankings');
        if (cached && cached.data) renderGlobalTopHTML(cached.data);
    }

    try {
        console.log("[QuizPro] Solicitando ranking global...");
        const res = await fetchApi('USER', 'getGlobalTop', { gameId: 'quizpro' }, 0, {
            store: 'rankings',
            onUpdate: (data) => renderGlobalTopHTML(data)
        });
        console.log("[QuizPro] Respuesta Ranking:", res);

        if (res.status === 'success' && Array.isArray(res.global)) {
            renderGlobalTopHTML(res);
        }
    } catch (e) {
        console.error("Error loading global top", e);
        body.innerHTML = '<tr><td colspan="2" class="px-6 py-8 text-center text-red-400 text-xs italic">Error al cargar ranking global</td></tr>';
    }
}

function renderGlobalTopHTML(res) {
    const body = document.getElementById('global-top-body');
    if (!body || !res || !res.global) return;

    window.globalTopData = res;
    body.innerHTML = res.global
        .filter(user => user && (user.nombre || user.username || user.display_name))
        .map((user, idx) => {
            // REQ: Inclusión de la Columna "Rango" en el Top Global (Modulo 5.1 - v7.2)
            const xp = parseInt(user.totalXP || 0);
            let userRange = XP_CONFIG.RANGES.find(r => xp >= r.min && xp <= r.max) || XP_CONFIG.RANGES[0];

            return `
            <tr class="hover:bg-blue-50/30 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <span class="w-6 h-6 flex items-center justify-center rounded-full ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'} text-[10px] font-black">${idx + 1}</span>
                        <div>
                            <p class="font-bold text-gray-900 leading-none">${user.nombre || user.username || user.display_name || 'Usuario'}</p>
                            <p class="text-[9px] text-gray-400 font-bold uppercase mt-1">${user.grado || 'Grado N/A'}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest">${user.rango || userRange.label}</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="text-sm font-black ${(user.promedio || 0) >= 70 ? 'text-emerald-600' : 'text-gray-400'}">${user.promedio || 0}%</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <span class="text-[10px] font-bold text-gray-900">${xp.toLocaleString()}</span>
                </td>
            </tr>
        `;}).join('');

    if (res.global.length === 0) {
        body.innerHTML = '<tr><td colspan="3" class="px-6 py-8 text-center text-gray-400 text-xs italic">Aún no hay puntuaciones globales registradas</td></tr>';
    }
}

window.loadPerformanceTable = async function() {
    const container = document.getElementById('performance-table-body');
    const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    if (!container || !user) return;

    // REQ: Offline-First (Modulo 1)
    if (window.PersistenceManager) {
        const cached = await window.PersistenceManager.get('academic_stats');
        // REQ: Eager caching - si ya tenemos datos, renderizamos y pedimos actualización silenciosa
        if (cached && cached.data) {
            renderPerformanceHTML(cached.data);
            fetchApi('USER', 'getGameStats', { userId: user.userId }, 0, {
                store: 'academic_stats',
                onUpdate: (data) => renderPerformanceHTML(data)
            }).catch(e => console.warn("[Offline-First] Sincronización silenciosa fallida, usando caché."));
            return;
        }
    }

    try {
        const res = await fetchApi('USER', 'getGameStats', { userId: user.userId }, 0, {
            store: 'academic_stats',
            onUpdate: (data) => renderPerformanceHTML(data)
        });
        if (res.status === 'success') {
            renderPerformanceHTML(res);
        }
    } catch (e) { console.error("Error loading stats", e); }
}

function renderPerformanceHTML(res) {
    const container = document.getElementById('performance-table-body');
    if (!container) return;

    // REQ: Soporte polimórfico para Caché y API (Modulo 1)
    // res puede ser la respuesta completa de la API o solo el objeto de estadísticas
    window.userGameStats = res.data || (res.id ? null : res) || {};
    const history = res.allHistory || [];

    let approvedCount = 0;
    const allMistakeTags = new Set();

    // REQ 7: Perfil Analítico Avanzado (Modulo 7)
    let hits = 0;
    let misses = 0;
    let totalSpeed = 0;
    let hitSpeedCount = 0;
    let impulsiveCount = 0;

    const minTimes = { 'verdadero_falso': 3000, ' Seleccion múltiple': 4000, 'emparejamiento': 8000, 'ordering': 12000, 'completacion': 15000 };

    history.forEach(h => {
        if (h[3] === 'QuizPro' && parseFloat(h[5]) < 70) {
            allMistakeTags.add(h[4]);
        }

        // Analizar registros detallados de QuizProAnalytics (h[12] = esCorrecta)
        if (h.length > 10) { // Indica que es un registro de analítica
            const isCorrect = String(h[12]) === "true";
            const time = parseFloat(h[13]) || 0;
            const type = h[4]; // tipoActividad

            if (isCorrect) {
                hits++;
                totalSpeed += time;
                hitSpeedCount++;
            } else {
                misses++;
            }

            if (time > 0 && minTimes[type] && time < minTimes[type]) {
                impulsiveCount++;
            }
        }
    });

    // Actualizar UI v2.0
    // REQ: Estandarización Psicométrica (Modulo 2)
    const aeRatio = hits / Math.max(misses, 1);
    const avgSpeed = hitSpeedCount > 0 ? (totalSpeed / hitSpeedCount / 1000) : 0;
    const impulsivity = history.length > 0 ? Math.round((impulsiveCount / history.length) * 100) : 0;

    const elHits = document.getElementById('v2-hits');
    const elMisses = document.getElementById('v2-misses');
    const elRatio = document.getElementById('v2-ae-ratio');
    const elSpeed = document.getElementById('v2-speed');
    const elImp = document.getElementById('v2-impulsivity');

    if (elHits) elHits.textContent = hits;
    if (elMisses) elMisses.textContent = misses;
    if (elRatio) elRatio.textContent = window.formatearMetricaPsicométrica ? window.formatearMetricaPsicométrica(aeRatio) : aeRatio.toFixed(1);
    if (elSpeed) elSpeed.textContent = `${window.formatearMetricaPsicométrica ? window.formatearMetricaPsicométrica(avgSpeed) : avgSpeed.toFixed(1)}s`;
    if (elImp) elImp.textContent = `${impulsivity}%`;

    // ICR / IA / Mastery / XP (v3.0)
    let latestICR = 0, latestIA = 0, latestMastery = 0, totalXP = 0;
    const qProLogs = history.filter(h => h.length > 15);
    if (qProLogs.length > 0) {
        const last = qProLogs[qProLogs.length - 1];
        latestICR = parseFloat(last[17]) || 0;
        latestIA = parseFloat(last[18]) || 0;
        latestMastery = parseFloat(last[19]) || 0;
        totalXP = qProLogs.reduce((s, l) => s + (parseFloat(l[20]) || 0), 0);
    }

    const elMastery = document.getElementById('v2-mastery');
    const elICR = document.getElementById('v2-icr');
    const elIA = document.getElementById('v2-ia');
    const elXP = document.getElementById('v2-total-xp');
    const calBadge = document.getElementById('calibration-badge');

    if (elMastery) elMastery.textContent = `${window.formatearMetricaPsicométrica ? window.formatearMetricaPsicométrica(latestMastery) : latestMastery.toFixed(2)}%`;
    if (elICR) elICR.textContent = `${window.formatearMetricaPsicométrica ? window.formatearMetricaPsicométrica(latestICR) : latestICR.toFixed(2)}%`;
    if (elIA) elIA.textContent = `${window.formatearMetricaPsicométrica ? window.formatearMetricaPsicométrica(latestIA) : latestIA.toFixed(2)}%`;
    if (elXP) elXP.textContent = Math.round(totalXP).toLocaleString();

    // REQ: Inyección de Gráficos Psicométricos (Modulo 5.2 - v7.2)
    renderPsychometricCharts(latestICR, latestMastery, latestIA, qProLogs);

    // Cold Start Badge (Modulo 7.7)
    if (calBadge) {
        if (qProLogs.length > 0 && qProLogs.length < 30) calBadge.classList.remove('hidden');
        else calBadge.classList.add('hidden');
    }

    container.innerHTML = Object.entries(window.userGameStats)
        .filter(([key]) => key.startsWith('QuizPro_'))
        .map(([key, s]) => {
            if (s.maxScore >= 70) approvedCount++;
            return `
                <tr class="border-b border-gray-50 text-[11px]">
                    <td class="py-3 font-bold text-gray-700">${getSanitizedAcademicText(s.subject)}</td>
                    <td class="py-3 capitalize text-blue-600 font-semibold">${getSanitizedAcademicText(s.level)} (${getSanitizedAcademicText(s.grade)})</td>
                    <td class="py-3 font-black text-gray-900">${s.maxScore}%</td>
                </tr>`;
        }).join('');

    const approvedEl = document.getElementById('total-approvals');
    if (approvedEl) approvedEl.textContent = approvedCount;

    const reinforcementSection = document.getElementById('reinforcement-feedback');
    const tagsContainer = document.getElementById('reinforcement-tags');
    if (allMistakeTags.size > 0 && tagsContainer) {
        reinforcementSection.classList.remove('hidden');
        tagsContainer.innerHTML = Array.from(allMistakeTags).map(tag =>
            `<span class="px-2 py-1 bg-white border border-orange-200 text-orange-700 text-[10px] font-bold rounded-lg">${getSanitizedAcademicText(tag)}</span>`
        ).join('');
    }

    if (Object.keys(window.userGameStats).length > 0) {
        const dashboard = document.getElementById('performance-dashboard');
        if (dashboard) dashboard.classList.remove('hidden');
    }

    // REQ 8: Fortalezas y Debilidades (Modulo 8)
    if (history.length > 0) {
        renderDiagnosis(history);
    }
}

function renderDiagnosis(history) {
    const strongEl = document.getElementById('v2-strong-topic');
    const weakEl = document.getElementById('v2-weak-topic');
    const linkContainer = document.getElementById('v2-recommendation-link');
    if (!strongEl || !weakEl) return;

    // Agrupar analítica por tema
    const topics = {};
    history.forEach(h => {
        if (h.length < 15) return;
        const tema = h[6]; // Asignatura/Tema en logs
        if (!tema || tema === 'General') return;

        if (!topics[tema]) topics[tema] = { hits: 0, total: 0 };
        const isCorrect = String(h[12]) === "true";
        topics[tema].total++;
        if (isCorrect) topics[tema].hits++;
    });

    const topicStats = Object.entries(topics)
        .map(([tema, s]) => ({ tema, mastery: (s.hits / s.total) * 100, total: s.total }))
        .filter(t => t.total >= 5); // Mínimo 5 preguntas (Modulo 8.1)

    if (topicStats.length === 0) {
        strongEl.textContent = "Datos insuficientes para generar diagnóstico.";
        weakEl.textContent = "Sigue practicando para recibir recomendaciones.";
        return;
    }

    topicStats.sort((a, b) => b.mastery - a.mastery);
    const strong = topicStats[0];
    const weak = topicStats[topicStats.length - 1];

    strongEl.textContent = `${strong.tema} (${Math.round(strong.mastery)}%)`;
    weakEl.textContent = `${weak.tema} (${Math.round(weak.mastery)}%)`;

    // Recomendación Curricular (Modulo 8.2)
    if (weak.mastery < 70) {
        const findPresentation = (tema) => {
            if (!window.presentationData) return null;
            for (const grade of window.presentationData) {
                for (const subject of grade.subjects) {
                    for (const topic of subject.topics) {
                        if (topic.title.toLowerCase().includes(tema.toLowerCase()) ||
                            tema.toLowerCase().includes(topic.title.toLowerCase())) {
                            return topic.file;
                        }
                    }
                }
            }
            return null;
        };

        const file = findPresentation(weak.tema);
        if (file && linkContainer) {
            linkContainer.innerHTML = `
                <a href="${file}" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">
                    <i class="fas fa-book-open"></i> Repasar Tema
                </a>
            `;
            linkContainer.classList.remove('hidden');
        }
    }
}

/**
 * REQ: Renderizado de Gráficos Interactivos (Modulo 5.2 - v7.2)
 * Utiliza Chart.js para visualizar el balance psicométrico y tendencia.
 */
let radarChartInstance = null;
let lineChartInstance = null;

function renderPsychometricCharts(icr, mastery, ia, logs) {
    if (typeof Chart === 'undefined') return;

    const radarCtx = document.getElementById('chart-radar-psychometric')?.getContext('2d');
    const lineCtx = document.getElementById('chart-line-trend')?.getContext('2d');

    if (radarCtx) {
        if (radarChartInstance) radarChartInstance.destroy();
        radarChartInstance = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Confianza', 'Dominio', 'Precisión'],
                datasets: [{
                    data: [icr, mastery, (100 - ia)],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)'
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    r: {
                        min: 0, max: 100,
                        ticks: { display: false },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 7 } }
                    }
                }
            }
        });
    }

    if (lineCtx) {
        if (lineChartInstance) lineChartInstance.destroy();
        const trendData = logs.slice(-10).map(l => parseFloat(l[5]) || 0); // Puntos de las últimas 10 sesiones
        lineChartInstance = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: trendData.map((_, i) => i + 1),
                datasets: [{
                    data: trendData,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 0
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: {
                        min: 0, max: 100,
                        display: false
                    }
                }
            }
        });
    }
}

function exitGame() {
    if (window.returnToMainContent) {
        window.returnToMainContent();
    } else {
        window.location.href = '../index.html?action=show-activities';
    }
}
