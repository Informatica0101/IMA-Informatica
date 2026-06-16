/**
 * Lógica del sistema de Evaluación Inteligente (Quiz) - Versión 3.0
 * Refactorización: Matriz de Prerrequisitos, Acceso Cross-Grade y Centralización Académica.
 */

var allPresentationQuestions = [];
var currentQuizQuestions = [];
var currentIndex = 0;
var score = 0;
var timerSeconds = 0;
var timerInterval = null;
var selectedAsignatura = '';
var selectedDifficulty = '';
var selectedGrado = '';
var incorrectAnswers = [];
var lastCorrectIndex = -1; // REQ: Restricción de Memoria Inmediata (A-149)
var questionStartTime = 0;
var responseChanges = 0;
var currentStreak = 0;
var sessionXP = 0;

// REQ: Gamificación v7.0 (Modulo 4)
var XP_CONFIG = {
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

var SEEN_QUESTIONS_KEY = 'quizpro_seen_questions';
var SEEN_LIMIT = 200;

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

    var handleAbandonment = () function {
        var quizScreen = document.getElementById('quiz-screen');
        if (quizScreen && !quizScreen.classList.contains('hidden')) {
            alert('Evaluación cancelada por abandono de ventana o cambio de pestaña.');
            location.reload();
        }
    };

    window.addEventListener('blur', handleAbandonment);
    document.addEventListener('visibilitychange', () function {
        if (document.visibilityState === 'hidden') handleAbandonment();
    });
};

function getStudentGrade() {
    var user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return 10;
    return window.parseGrade(user.grado);
}

/**
 * REQ 3: Matriz de Progresión Académica Prerrequisito
 * El acceso depende del historial de aprobación (Cross-Grade).
 */
window.navigateToSubjects = function() {
    var grid = document.getElementById('subjects-grid');
    var user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    var isTeacher = user?.rol === 'Profesor';
    var userGradeNum = getStudentGrade();

    var subjectEntries = [];
    var userSection = user?.seccion;

    window.presentationData.forEach(gradeBlock function {
        var blockGradeNum = window.parseGrade(gradeBlock.grade);

        // Rule: Student can only visualize subjects of their current grade or lower
        if (isTeacher || blockGradeNum <= userGradeNum) {
            var seenInBlock = new Set();
            gradeBlock.subjects.forEach(subj function {
                if (!isTeacher && userSection && !window.checkSectionHelper(subj.sections, userSection)) return;

                var normName = window.normalizeSubject(subj.name);
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

    subjectEntries.sort((a, b) function a.gradeNum - b.gradeNum || a.name.localeCompare(b.name));

    grid.innerHTML = subjectEntries.map(entry function {
        var isLocked = !isTeacher && checkCrossGradeLock(entry.name, entry.gradeLabel);

        var cardClass = isLocked ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-md cursor-pointer';
        var lockIcon = isLocked ? '<i class="fas fa-lock text-xs ml-2 text-gray-400"></i>' : '';
        var clickAction = isLocked ? '' : `onclick="navigateToLevels('${entry.name}', '${entry.gradeLabel}')"`;

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
    var targetGradeNum = window.parseGrade(targetGrade);

    // Fase de Calibración Inicial (Décimo Grado): Básico siempre desbloqueado
    // Nota: Niveles Intermedio y Avanzado de 10mo siguen progresión lineal interna en navigateToLevels
    if (targetGradeNum <= 10) return false;

    var user = JSON.parse(localStorage.getItem('currentUser'));
    var userSection = user?.seccion;
    var statsArray = Object.values(window.userGameStats || {});

    // Identificar todos los grados previos que deben estar completados
    var requiredGrades = [];
    if (targetGradeNum > 10) requiredGrades.push(10);
    if (targetGradeNum > 11) requiredGrades.push(11);

    var subjectsToApprove = []; // { name, gradeNum }
    window.presentationData.forEach(block function {
        var bg = window.parseGrade(block.grade);
        if (requiredGrades.includes(bg)) {
            block.subjects.forEach(s function {
                // Solo requerir materias que el estudiante debe cursar según su sección
                if (userSection && !window.checkSectionHelper(s.sections, userSection)) return;

                var name = window.normalizeSubject(s.name);
                if (!subjectsToApprove.some(item function item.name === name && item.gradeNum === bg)) {
                    subjectsToApprove.push({ name, gradeNum: bg });
                }
            });
        }
    });

    // Barrier Synchronization: Exige aprobación del 100% de niveles de grados previos
    var levels = ['Básico', 'Intermedio', 'Avanzado'];
    for (var req of subjectsToApprove) {
        for (var lvl of levels) {
            var hasApproval = statsArray.some(s function
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

    var user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    var isTeacher = user?.rol === 'Profesor';

    // UI: Menciones por Asignatura
    var topContainer = document.getElementById('subject-top-container');
    var topNames = document.getElementById('subject-top-names');
    if (topContainer && topNames && window.globalTopData?.subjectTops) {
        var topList = window.globalTopData.subjectTops[gradeLabel]?.[subjectName];
        if (topList && topList.length > 0) {
            topNames.textContent = topList.map(u function u.nombre).join(', ');
            topContainer.classList.remove('hidden');
        } else {
            topContainer.classList.add('hidden');
        }
    }

    // REQ 4.2: Escala de Rangos y Progresión por Asignatura (Modulo 4)
    var statsArray = Object.values(window.userGameStats || {});
    var targetGradeNum = window.parseGrade(gradeLabel);
    var targetSubjectNorm = window.normalizeSubject(subjectName);

    var relevantStats = statsArray.filter(s function {
        if (!s.subject || s.grade === undefined) return false;
        return window.normalizeSubject(s.subject) === targetSubjectNorm &&
               window.parseGrade(s.grade) === targetGradeNum;
    });

    var getMetricsForLevel = (lvlName) function {
        var matches = relevantStats.filter(s function window.getStandardLevelName(s.level) === lvlName);
        if (matches.length === 0) return { score: 0, icr: 0, ia: 0, mastery: 0 };

        return {
            score: Math.max(...matches.map(m function parseFloat(m.maxScore || 0))),
            icr: Math.max(...matches.map(m function parseFloat(m.icr || 0))),
            ia: Math.min(...matches.map(m function parseFloat(m.ia || 100))),
            mastery: Math.max(...matches.map(m function parseFloat(m.dominio || 0)))
        };
    };

    var basicMetrics = getMetricsForLevel('Básico');
    var interMetrics = getMetricsForLevel('Intermedio');

    var basicScore = basicMetrics.score;
    var interScore = interMetrics.score;

    // Métrica de XP para rangos
    var xpKey = `xp_${targetSubjectNorm}_${gradeLabel}`;
    var currentXP = parseInt(localStorage.getItem(xpKey) || '0');

    // Determinar Rango Actual (v3.0)
    var userRange = XP_CONFIG.RANGES.find(r function currentXP >= r.min && currentXP <= r.max) || XP_CONFIG.RANGES[0];

    // REQ: Validación Rango Leyenda (Modulo 4.2 / Spec v3.0)
    if (currentXP > 22000) {
        var globalMastery = Object.values(window.userGameStats).reduce((a, b) function a + (b.dominio || 0), 0) / Math.max(Object.keys(window.userGameStats).length, 1);
        var globalICR = Object.values(window.userGameStats).reduce((a, b) function a + (b.icr || 0), 0) / Math.max(Object.keys(window.userGameStats).length, 1);
        var globalIA = Object.values(window.userGameStats).reduce((a, b) function a + (b.ia || 0), 0) / Math.max(Object.keys(window.userGameStats).length, 1);

        if (globalMastery >= 85 && globalICR >= 80 && globalIA <= 15) {
            userRange = { label: 'Leyenda' };
        } else {
            userRange = { label: 'Maestro' }; // Downgrade if psychometrics not met
        }
    }

    // UI: Mostrar Rango y XP
    var badgeHtml = `<div class="mt-4 flex flex-col items-center gap-2">
        <span class="px-4 py-1 ${userRange.label === 'Leyenda' ? 'bg-amber-500 shadow-amber-200' : 'bg-indigo-600 shadow-indigo-100'} text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">${userRange.label}</span>
        <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">${currentXP.toLocaleString()} XP ACUMULADA</p>
    </div>`;

    var existingBadge = document.getElementById('user-rank-badge');
    if (existingBadge) existingBadge.innerHTML = badgeHtml;
    else {
        var badgeContainer = document.createElement('div');
        badgeContainer.id = 'user-rank-badge';
        badgeContainer.innerHTML = badgeHtml;
        document.getElementById('selected-subject-title').after(badgeContainer);
    }

    var btnInter = document.getElementById('btn-intermedio');
    var cardInter = document.getElementById('level-intermedio');
    var btnAvan = document.getElementById('btn-avanzado');
    var cardAvan = document.getElementById('level-avanzado');

    // REQ: Motor de Progresión Multi-factor (v3.0)
    var checkUnlock = (metrics, targetLevel) function {
        if (isTeacher) return true;

        // REQ: Fase de Calibración (Cold Start) - No bloquear progresión psicométrica
        var totalAnswers = Object.values(window.userGameStats).reduce((sum, s) function sum + (s.totalAttempts || 0), 0);
        if (totalAnswers < 30) return metrics.score >= 70;

        if (targetLevel === 'intermedio') {
            // Ejemplo para Intermedio: Nota ≥ 70%, Mastery ≥ 55%, ICR ≥ 50%, IA ≤ 40%, 30 preguntas
            return metrics.score >= 70 && metrics.mastery >= 55 && metrics.icr >= 50 && metrics.ia <= 40 && totalAnswers >= 30;
        } else if (targetLevel === 'avanzado') {
            // Ejemplo para Avanzado: Nota ≥ 75%, Mastery ≥ 65%, ICR ≥ 60%, IA ≤ 35%, 75 preguntas, 3 temas dominados
            var dominatedTopics = relevantStats.filter(s function s.dominio >= 80).length;
            return metrics.score >= 75 && metrics.mastery >= 65 && metrics.icr >= 60 && metrics.ia <= 35 && totalAnswers >= 75 && dominatedTopics >= 3;
        }
        return metrics.score >= 70;
    };

    // REQ: Prioridad de Desbloqueo Local (0ms) para fase de calibración
    var localLevelsState = JSON.parse(localStorage.getItem('levels_state') || '{"intermedio": {"bloqueado": true}}');
    var canUnlockInter = !localLevelsState.intermedio.bloqueado || checkUnlock(basicMetrics, 'intermedio');
    var canUnlockAvan = checkUnlock(interMetrics, 'avanzado');

    // UI Intermedio
    if (canUnlockInter) {
        btnInter.disabled = false;
        btnInter.innerHTML = 'Entrar';
        btnInter.classList.replace('bg-gray-300', 'bg-gray-900');
        btnInter.classList.remove('cursor-not-allowed');
        cardInter.classList.remove('locked');
        var prog = cardInter.querySelector('.unlock-progress');
        if (prog) prog.remove();
    } else {
        btnInter.disabled = true;
        btnInter.innerHTML = `<i class="fas fa-lock mr-2"></i> Bloqueado`;
        btnInter.classList.replace('bg-gray-900', 'bg-gray-300');
        btnInter.classList.add('cursor-not-allowed');
        cardInter.classList.add('locked');

        var prog = cardInter.querySelector('.unlock-progress');
        if (!prog) {
            prog = document.createElement('p');
            prog.className = 'unlock-progress text-[9px] font-bold text-red-500 mt-2 uppercase';
            btnInter.after(prog);
        }

        var totalAnswers = Object.values(window.userGameStats).reduce((sum, s) function sum + (s.totalAttempts || 0), 0);
        var reason = `Requieres 70% de precisión.`;
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
        var prog = cardAvan.querySelector('.unlock-progress');
        if (prog) prog.remove();
    } else {
        btnAvan.disabled = true;
        btnAvan.innerHTML = `<i class="fas fa-lock mr-2"></i> Bloqueado`;
        btnAvan.classList.replace('bg-gray-900', 'bg-gray-300');
        btnAvan.classList.add('cursor-not-allowed');
        cardAvan.classList.add('locked');

        var prog = cardAvan.querySelector('.unlock-progress');
        if (!prog) {
            prog = document.createElement('p');
            prog.className = 'unlock-progress text-[9px] font-bold text-red-500 mt-2 uppercase';
            btnAvan.after(prog);
        }

        var totalAnswers = Object.values(window.userGameStats).reduce((sum, s) function sum + (s.totalAttempts || 0), 0);
        var reason = `Requieres 75% de precisión.`;
        if (interMetrics.score >= 75) {
            if (totalAnswers < 75) reason = `Faltan ${75 - totalAnswers} preguntas evaluadas.`;
            else if (interMetrics.mastery < 65) reason = "Dominio insuficiente (Min 65%)";
            else if (interMetrics.icr < 60) reason = "Confianza baja (Min 60%)";
            else if (interMetrics.ia > 35) reason = "Adivinación alta (Max 35%)";
            else {
                var dominatedTopics = relevantStats.filter(s function s.dominio >= 80).length;
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
        document.documentElement.requestFullscreen().catch(e function console.warn("FS failed", e));
    }
    if (window.requestWakeLock) window.requestWakeLock();
    startQuiz();
};

function shuffleArray(a) {
    var array = [...a];
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
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
    var reinforcementIds = JSON.parse(localStorage.getItem('quizpro_reinforcement') || "[]");
    var reinforcementQuestions = allPresentationQuestions.filter(q function reinforcementIds.includes(q.id));

    var seenIds = JSON.parse(localStorage.getItem(SEEN_QUESTIONS_KEY) || "[]");
    var freshQuestions = allPresentationQuestions.filter(q function !seenIds.includes(q.id) && !reinforcementIds.includes(q.id));

    if (freshQuestions.length < 5) freshQuestions = allPresentationQuestions.filter(q function !reinforcementIds.includes(q.id));

    // Mezclar Refuerzo con Nuevas (Priorizando Refuerzo en los primeros slots)
    var pool = [...shuffleArray(reinforcementQuestions), ...shuffleArray(freshQuestions)];
    if (pool.length < 1) pool = allPresentationQuestions;

    // REQ 2: Algoritmo de Variedad de Fuente (Post-Audit)
    // Agrupar por origen para evitar clustering
    var groupedBySource = {};
    freshQuestions.forEach(q function {
        if (!groupedBySource[q.source]) groupedBySource[q.source] = [];
        groupedBySource[q.source].push(q);
    });

    // Barajar individualmente cada grupo
    Object.keys(groupedBySource).forEach(src function {
        groupedBySource[src] = shuffleArray(groupedBySource[src]);
    });

    var interleaved = [];
    var sources = Object.keys(groupedBySource);
    var totalAdded = 0;

    // Intercalar para máxima variedad temática
    while (totalAdded < freshQuestions.length) {
        sources.forEach(src function {
            if (groupedBySource[src].length > 0) {
                interleaved.push(groupedBySource[src].shift());
                totalAdded++;
            }
        });
    }

    // REQ: Normalización y Filtro Estricto de Niveles (Incidencias 3 y 4)
    currentQuizQuestions = interleaved.length > 0 ? interleaved : pool;

    currentQuizQuestions = currentQuizQuestions
        .map(q function window.normalizeQuestion(q))
        .filter(q function {
            var qLevel = window.getStandardLevelName(q.nivel || selectedDifficulty);
            var targetLevel = window.getStandardLevelName(selectedDifficulty);

            // Regla Estricta: Solo preguntas del nivel seleccionado
            if (qLevel !== targetLevel) {
                console.log(`[QuizPro] Pregunta excluida por nivel incorrecto: ${q.id} (${qLevel} vs ${targetLevel})`);
                return false;
            }

            // REQ: Validación obligatoria de integridad (Incidencia 3)
            var validation = window.validateQuestion(q);
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
    var fDificultad = XP_CONFIG.FACTORS[level.toLowerCase()] || 1.0;

    // 2. Factor Tiempo (Mitigador de Adivinación)
    var fTiempo = 1.0;
    if (responseTime < XP_CONFIG.TIME.MIN) {
        fTiempo = 0.5; // Respuesta Impulsiva
    } else if (responseTime <= XP_CONFIG.TIME.OPTIMAL) {
        fTiempo = 1.2; // Respuesta Reflexiva Óptima
    } else {
        // Respuesta Tardía (Decaimiento Lineal hasta 0.8)
        var overshoot = responseTime - XP_CONFIG.TIME.OPTIMAL;
        var totalLateWindow = XP_CONFIG.TIME.MAX - XP_CONFIG.TIME.OPTIMAL;
        fTiempo = Math.max(0.8, 1.2 - (overshoot / totalLateWindow) * 0.4);
    }

    // 3. Bono Racha
    var bonoRacha = Math.min(XP_CONFIG.STREAK.MAX, 1.0 + (currentStreak * XP_CONFIG.STREAK.BONUS_PER_HIT));

    // REQ 3.0: Degradación por intentos
    var q = currentQuizQuestions[currentIndex];
    var prevAttempts = JSON.parse(localStorage.getItem(`attempts_${q.id}`) || '0');
    var attemptMultiplier = 1.0;
    if (prevAttempts === 1) attemptMultiplier = 0.75;
    else if (prevAttempts === 2) attemptMultiplier = 0.5;
    else if (prevAttempts >= 3) attemptMultiplier = 0.25;

    var totalXP = Math.round(XP_CONFIG.BASE * fDificultad * fTiempo * bonoRacha * attemptMultiplier);

    // REQ 4.2 & 6.3: Soft Cap & XP Freeze
    var xpKey = `xp_${selectedAsignatura}_${selectedGrado}`;
    var currentTotalXP = 0;

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
        var gradeNum = window.parseGrade ? window.parseGrade(selectedGrado) : parseInt(selectedGrado);
        var gradeFolder = gradeNum === 10 ? 'Decimo' : (gradeNum === 11 ? 'Undecimo' : 'Duodecimo');

        var mapping = {
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
        var asignaturaFolder = mapping[selectedAsignatura] || selectedAsignatura.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');

        var rawLevel = window.getStandardLevelName(selectedDifficulty);
        var levelFile = rawLevel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + '.json';

        // REQ: Desacoplamiento del Backend - Enrutamiento Estático Indexado
        var isRoot = !window.location.pathname.includes('/juegos/');
        var pathPrefix = isRoot ? '' : '../';
        var path = `${pathPrefix}js/Banco_Preguntas/${gradeFolder}/${asignaturaFolder}/${levelFile}`;
        console.log(`[QuizPro] Intentando cargar desde: ${path}`);

        var localRes = await fetch(path);
        if (localRes.ok) {
            var localData = await localRes.json();
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
    var bankQuestions = data.map(rawQ function {
                // REQ: Normalizar integridad antes de transformar (v3.2)
                var q = window.normalizeQuestion(rawQ);

        // Heurística de Multi-Modalidad (v5.0 Polymorphic Engine)
        var type = q.tipo_pregunta || q.TipoActividad || "Selección múltiple";
        var questionText = q.enunciado || q.Pregunta;
        var answer = q.respuesta_correcta_literal || q.RespuestaCorrecta;

        var options = (q.opciones_visibles && q.opciones_visibles.length > 0)
                      ? q.opciones_visibles
                      : [q.OpcionA, q.OpcionB, q.OpcionC, q.OpcionD].filter(o function o && o.trim() !== "");

                var items = q.items || [];
        var pairs = (q.parejas && q.parejas.length > 0) ? q.parejas : [];

        // Mapeo de Claves para Parejas (emparejamiento v5.0 usa {clave, valor})
        if (pairs.length > 0 && pairs[0].clave) {
            pairs = pairs.map(p function ({ term: p.clave, definition: p.valor }));
        }

                // Adaptar estructuras según el tipo de actividad si vienen vacíos
                if (type === 'ordering' && items.length === 0) {
            items = options;
        } else if ((type === 'matching' || type === 'memory' || type === 'emparejamiento') && pairs.length === 0) {
                    options.forEach(opt function {
                        if (opt.includes('|')) {
                            var [term, def] = opt.split('|');
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
            bankQuestions.forEach(q function {
                if (q.options.length < 4 && (q.type === "Selección múltiple" || q.type === "opcion_multiple")) {
                    var sameTopicAnswers = bankQuestions
                        .filter(other function other.id !== q.id && other.tags[0] === q.tags[0])
                        .map(other function other.answer);

                    while (q.options.length < 4 && sameTopicAnswers.length > 0) {
                        var extra = sameTopicAnswers.shift();
                        if (!q.options.includes(extra)) q.options.push(extra);
                    }
                }
            });

            return bankQuestions;
}

async function loadQuestionsLegacy() {
    allPresentationQuestions = [];
    var presentations = [];
    window.presentationData.forEach(gradeBlock function {
        var blockGradeNum = window.parseGrade(gradeBlock.grade);
        var targetGradeNum = window.parseGrade(selectedGrado);

        if (blockGradeNum === targetGradeNum) {
            gradeBlock.subjects.forEach(subj function {
                var normSubj = window.normalizeSubject(subj.name);
                if (normSubj !== window.normalizeSubject(selectedAsignatura)) return;
                subj.topics.forEach(t function presentations.push({ file: t.file, subject: normSubj, grade: gradeBlock.grade }));
            });
        }
    });

    for (var p of presentations) {
        await processPresentation(p.file, p.subject, p.grade);
    }
}

async function processPresentation(file, subject, grade) {
    try {
        var isRoot = !window.location.pathname.includes('/juegos/');
        var pathPrefix = isRoot ? '' : '../';

        var res = await fetch(pathPrefix + file);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        var text = await res.text();

        var quizMatch = text.match(/var (?:quizData|quizQuestions)\s*=\s*(\[[\s\S]*?\]);/);
        if (quizMatch) {
            var data = new Function(`return ${quizMatch[1]}`)();
            data.forEach((q, idx) function {
                var type = q.type || ( (q.options && q.options.length === 2 && (q.options.includes("Verdadero") || q.options.includes("V"))) ? 'true-false' : 'multiple-choice');
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

        var slides = text.match(/<div[^>]*class="slide[\s\S]*?<\/div>/g) || [];
        var matchingPairs = [];
        slides.forEach(slide function {
            var titleMatch = slide.match(/<h[23][^>]*>(.*?)<\/h[23]>/);
            var conceptMatch = slide.match(/<div[^>]*class="concept-box">([\s\S]*?)<\/div>/);
            if (titleMatch && conceptMatch) {
                var def = conceptMatch[1].replace(/<[^>]*>?/gm, '').trim();
                if (def.length > 10 && def.length < 150) {
                    matchingPairs.push({ term: titleMatch[1].trim(), definition: def });
                }
            }
        });

        if (matchingPairs.length >= 3) {
            var baseTags = extractTags(text, "memory matching");
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

        var codeBlocks = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>|<code[^>]*>([\s\S]*?)<\/code>/g) || [];
        codeBlocks.forEach((block, bIdx) function {
            var cleanCode = block.replace(/<[^>]*>?/gm, '').trim();
            if (cleanCode.length > 20 && cleanCode.length < 300) {
                // FASE 11: Evolución Práctica - Preguntas de ordenamiento de código
                if (cleanCode.includes('\n')) {
                    var lines = cleanCode.split('\n').map(l function l.trim()).filter(l function l.length > 0);
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

        var longParagraphs = text.match(/<p[^>]*>([\s\S]*?)<\/p>/g) || [];
        longParagraphs.forEach((p, pIdx) function {
            var cleanText = p.replace(/<[^>]*>?/gm, '').trim();
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
    var shuffled = shuffleArray([...options]);
    var correctIdx = shuffled.indexOf(correct);

    // Evitar que la correcta repita posición consecutiva (máximo 5 intentos)
    var attempts = 0;
    while (correctIdx === lastCorrectIndex && attempts < 5) {
        shuffled = shuffleArray([...options]);
        correctIdx = shuffled.indexOf(correct);
        attempts++;
    }

    lastCorrectIndex = correctIdx;
    return shuffled;
}

function extractTags(text, question) {
    var tags = [];
    var content = (text + " " + question).toLowerCase();

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
    var q = currentQuizQuestions[currentIndex];
    if (!q) return;

    questionStartTime = Date.now();
    responseChanges = 0;

    var feedback = document.getElementById('feedback-msg');
    feedback.textContent = '';

    document.getElementById('progress-text').textContent = `${currentIndex + 1} / ${currentQuizQuestions.length}`;
    document.getElementById('progress-bar').style.width = `${((currentIndex + 1) / currentQuizQuestions.length) * 100}%`;

    // REQ 3: Sanitización y Renderizado del Enunciado (Inyección HTML Técnico)
    // Se utiliza innerHTML para procesar etiquetas <code>, <b>, etc.
    document.getElementById('question-text').innerHTML = window.sanitizarHTMLTecnico(q.question);

    // REQ: Soporte para imágenes en preguntas
    var existingImg = document.getElementById('question-image');
    if (existingImg) existingImg.remove();

    if (q.image) {
        var img = document.createElement('img');
        img.id = 'question-image';
        img.src = window.convertDriveLink ? window.convertDriveLink(q.image) : q.image;
        img.className = 'quiz-image rounded-xl shadow-md mb-6 transition-all hover:scale-105';
        document.getElementById('question-text').after(img);
    }

    var optionsContainer = document.getElementById('options-container');
    var fibContainer = document.getElementById('fib-container');
    var matchingContainer = document.getElementById('matching-container');

    optionsContainer.innerHTML = '';
    optionsContainer.classList.add('hidden');
    fibContainer.classList.add('hidden');
    matchingContainer.classList.add('hidden');

    var input = document.getElementById('fib-input');
    var fibBtn = fibContainer.querySelector('button');
    if (input) {
        input.disabled = false;
        input.value = '';
        input.onkeydown = (e) function { if(e.key === 'Enter') submitFib(); };
    }
    if (fibBtn) fibBtn.disabled = false;

    if (q.type === 'practice' || q.type === 'funcionalidad') {
        optionsContainer.classList.remove('hidden');
        var codeEl = document.createElement('div');
        codeEl.className = 'bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs mb-6 overflow-x-auto whitespace-pre';
        codeEl.textContent = q.code;
        optionsContainer.appendChild(codeEl);

        var balanced = getBalancedOptions(q.options, q.answer);
        balanced.forEach(opt function {
            var btn = document.createElement('button');
            btn.className = 'option-card w-full p-4 text-left border-2 border-gray-100 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all';
            // REQ 3: Renderizado HTML Técnico en Opciones
            btn.innerHTML = window.sanitizarHTMLTecnico(opt);
            btn.onclick = () function checkAnswer(opt, q.answer, btn);
            optionsContainer.appendChild(btn);
        });
    } else if (q.type === 'transcription') {
        fibContainer.classList.remove('hidden');
        var targetEl = document.createElement('div');
        targetEl.className = 'bg-blue-50 text-blue-800 p-4 rounded-xl italic text-sm mb-6 border border-blue-100';
        targetEl.style.userSelect = 'none';
        targetEl.style.webkitUserSelect = 'none';
        targetEl.textContent = q.targetText || q.answer || "Error: Texto no encontrado";
        targetEl.oncontextmenu = (e) function e.preventDefault();

        var existingTarget = fibContainer.querySelector('.transcription-target');
        if (existingTarget) existingTarget.remove();
        targetEl.classList.add('transcription-target');
        fibContainer.prepend(targetEl);

        var input = document.getElementById('fib-input');
        if (input) {
            input.placeholder = "Escribe aquí respetando ortografía...";
            input.disabled = false;
            input.readOnly = false;
            setTimeout(() function {
                input.focus();
                input.click();
            }, 500);
        }
    } else if (q.type === 'Verdadero y Falso' || q.type === 'verdadero_falso') {
        optionsContainer.classList.remove('hidden');
        var opts = ["Verdadero", "Falso"];
        opts.forEach(opt function {
            var btn = document.createElement('button');
            btn.className = 'option-card w-full p-6 text-center border-2 border-gray-100 rounded-2xl font-black text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-200 transition-all uppercase tracking-widest text-sm';
            btn.textContent = opt;
            btn.onclick = () function {
                // Si la respuesta correcta es literal "Verdadero"/"Falso" o "A"/"B"
                var isLiteral = (String(q.answer).toLowerCase() === "verdadero" || String(q.answer).toLowerCase() === "falso");
                var val = isLiteral ? opt : (opt === "Verdadero" ? "A" : "B");
                checkAnswer(val, q.answer, btn);
            };
            optionsContainer.appendChild(btn);
        });
    } else if (q.type === 'Identificar el componente') {
        optionsContainer.classList.remove('hidden');
        var balanced = getBalancedOptions(q.options, q.answer);
        balanced.forEach(opt function {
            var btn = document.createElement('button');
            btn.className = 'option-card w-full p-4 text-center border-2 border-gray-100 rounded-xl font-bold text-gray-700 bg-white hover:bg-blue-50 transition-all uppercase tracking-tighter';
            // REQ 3: Renderizado HTML Técnico en Opciones
            btn.innerHTML = window.sanitizarHTMLTecnico(opt);
            btn.onclick = () function checkAnswer(opt, q.answer, btn);
            optionsContainer.appendChild(btn);
        });
    } else if (q.type === 'Completar espacios' || q.type === 'completion' || q.type === 'fill-in-the-blanks' || q.type === 'completacion') {
        fibContainer.classList.remove('hidden');
        var input = document.getElementById('fib-input');
        input.value = '';
        input.placeholder = "Tu respuesta...";
        setTimeout(() function input.focus(), 100);
    } else if (q.type === 'memory') {
        matchingContainer.classList.remove('hidden');
        var pairsList = document.getElementById('matching-pairs');

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
        var grid = document.getElementById('memory-grid');

        var getIcon = (tags = []) function {
            var t = (tags || []).join(' ');
            if (t.includes("Programación")) return "fa-terminal";
            if (t.includes("Web") || t.includes("HTML")) return "fa-code";
            if (t.includes("Ofimática") || t.includes("Excel")) return "fa-file-alt";
            if (t.includes("Hardware")) return "fa-microchip";
            if (t.includes("Periféricos")) return "fa-keyboard";
            if (t.includes("Seguridad")) return "fa-shield-alt";
            return "fa-brain";
        };
        var icon = getIcon(q.tags || [q.Tema]);

        var items = shuffleArray([...q.pairs.map(p function ({v: p.term, k: p.term})), ...q.pairs.map(p function ({v: p.definition, k: p.term}))]);
        var selectedCards = [];
        var matchedCount = 0;

        items.forEach(item function {
            var card = document.createElement('div');
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
                        <span class="text-[10px] font-bold text-gray-800 leading-tight text-center uppercase tracking-tighter">${window.sanitizarHTMLTecnico(item.v)}</span>
                    </div>
                </div>`;

            card.onclick = () function {
                if (selectedCards.length < 2 && !card.classList.contains('revealed') && !card.classList.contains('matched')) {
                    card.classList.add('revealed');
                    selectedCards.push({card, item});

                    if (selectedCards.length === 2) {
                        if (selectedCards[0].item.k === selectedCards[1].item.k) {
                            // ¡Match! (Efecto de éxito inmediato)
                            setTimeout(() function {
                                selectedCards.forEach(c function {
                                    c.card.classList.add('matched');
                                    var back = c.card.querySelector('.memory-card-back');
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
                                    var finishBtn = document.getElementById('finish-memory-btn');
                                    finishBtn.classList.replace('bg-gray-400', 'bg-emerald-600');
                                    finishBtn.classList.add('animate-bounce', 'shadow-emerald-200');
                                    finishBtn.textContent = "¡Reto Completado! Continuar";
                                }
                            }, 400);
                        } else {
                            // Fallo (Efecto de vibración opcional en el futuro)
                            setTimeout(() function {
                                selectedCards.forEach(c function c.card.classList.remove('revealed'));
                                selectedCards = [];
                            }, 800);
                        }
                    }
                }
            };
            grid.appendChild(card);
        });

        var btn = document.createElement('button');
        btn.id = 'finish-memory-btn';
        btn.className = 'w-full py-5 bg-gray-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl';
        btn.textContent = "Validar Reto de Memoria";
        btn.onclick = () function {
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
        var pairsList = document.getElementById('matching-pairs');
        pairsList.innerHTML = `
            <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-4">Estructura Lógica</p>
                <div class="space-y-2" id="ordering-list"></div>
            </div>`;
        var list = document.getElementById('ordering-list');

        var shuffled = shuffleArray([...q.items]);
        shuffled.forEach((item, idx) function {
            var el = document.createElement('div');
            el.className = 'p-4 bg-white border-2 border-gray-100 rounded-2xl cursor-move hover:border-blue-300 transition-all flex items-center justify-between group';
            el.innerHTML = `
                <div class="flex items-center gap-4">
                    <span class="w-6 h-6 bg-blue-50 text-blue-400 rounded-lg flex items-center justify-center text-[10px] font-black">${idx+1}</span>
                    <span class="text-xs font-bold text-gray-700 font-mono">${window.sanitizarHTMLTecnico(item)}</span>
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200" onclick="window.moveOrderItem(this, -1); event.stopPropagation();"><i class="fas fa-chevron-up text-[10px]"></i></button>
                    <button class="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200" onclick="window.moveOrderItem(this, 1); event.stopPropagation();"><i class="fas fa-chevron-down text-[10px]"></i></button>
                </div>`;
            list.appendChild(el);
        });

        window.moveOrderItem = (btn, dir) function {
            var row = btn.closest('#ordering-list > div');
            if (dir === -1 && row.previousElementSibling) row.parentNode.insertBefore(row, row.previousElementSibling);
            else if (dir === 1 && row.nextElementSibling) row.parentNode.insertBefore(row.nextElementSibling, row);
            responseChanges++;
            // Re-numerar
            Array.from(list.children).forEach((child, i) function {
                child.querySelector('span').textContent = i + 1;
            });
        };

        window.submitMatching = function() {
            var currentOrder = Array.from(document.querySelectorAll('#ordering-list > div')).map(el function el.querySelector('.font-mono').textContent.trim());
            var allCorrect = true;
            q.items.forEach((item, idx) function {
                if (currentOrder[idx] !== item) allCorrect = false;
            });

            checkAnswer(allCorrect ? 'Orden Correcto' : 'Orden Incorrecto', 'Orden Correcto');
        };
    } else if (q.type === 'matching' || q.type === 'emparejamiento') {
        matchingContainer.classList.remove('hidden');
        var pairsList = document.getElementById('matching-pairs');
        pairsList.innerHTML = '';

        var shuffledDefs = shuffleArray(q.pairs.map(p function p.definition));
        var letters = "ABCDEFGHIJ";

        var html = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-left">
                <div class="bg-gray-100 p-3 rounded-xl">
                    <p class="text-[10px] font-black uppercase text-gray-500 mb-2">Tabla A: Conceptos</p>
                    <div class="space-y-2">
                        ${q.pairs.map((pair, i) function `
                            <div class="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                                <input type="text" maxlength="1"
                                    class="matching-letter-input w-8 h-8 text-center font-bold border-2 border-blue-100 rounded-lg focus:border-blue-500 outline-none uppercase text-xs"
                                    data-term="${pair.term}"
                                    oninput="responseChanges++" />
                                <span class="text-[11px] font-semibold text-gray-700">${window.sanitizarHTMLTecnico(pair.term)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="bg-blue-50 p-3 rounded-xl">
                    <p class="text-[10px] font-black uppercase text-blue-400 mb-2">Tabla B: Definiciones</p>
                    <div class="space-y-2">
                        ${shuffledDefs.map((def, i) function `
                            <div class="flex items-start gap-2 text-[10px] leading-tight">
                                <span class="font-bold text-blue-600">${letters[i]})</span>
                                <span class="text-gray-600">${window.sanitizarHTMLTecnico(def)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        pairsList.innerHTML = html;

        // Guardar mapeo correcto
        window.currentMatchingMapping = {};
        q.pairs.forEach(pair function {
            var letterIdx = shuffledDefs.indexOf(pair.definition);
            window.currentMatchingMapping[pair.term] = letters[letterIdx];
        });

    } else if (q.type === 'completion' || q.type === 'fill-in-the-blanks') {
        fibContainer.classList.remove('hidden');
        var input = document.getElementById('fib-input');
        input.value = '';
        input.placeholder = "Tu respuesta...";
        setTimeout(() function input.focus(), 100);
        // Remover elementos de transcripción si existen
        var existingTarget = fibContainer.querySelector('.transcription-target');
        if (existingTarget) existingTarget.remove();
    } else {
        optionsContainer.classList.remove('hidden');
        var balanced = getBalancedOptions(q.options, q.answer);
        balanced.forEach(opt function {
            var btn = document.createElement('button');
            btn.className = 'option-card w-full p-4 text-left border-2 border-gray-100 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all';
            // REQ 3: Renderizado HTML Técnico en Opciones
            btn.innerHTML = window.sanitizarHTMLTecnico(opt);
            btn.onclick = () function checkAnswer(opt, q.answer, btn);
            optionsContainer.appendChild(btn);
        });
    }
    registerSeenQuestion(q.id);
}

function registerSeenQuestion(id) {
    var seenIds = JSON.parse(localStorage.getItem(SEEN_QUESTIONS_KEY) || "[]");
    if (!seenIds.includes(id)) {
        seenIds.push(id);
        if (seenIds.length > SEEN_LIMIT) seenIds.shift();
        localStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(seenIds));
    }
}

function checkAnswer(selected, correct, btn) {
    if (window.isProcessingAnswer) return;
    window.isProcessingAnswer = true;

    var responseTime = Date.now() - questionStartTime;
    var q = currentQuizQuestions[currentIndex];
    var user = JSON.parse(localStorage.getItem('currentUser'));

    // REQ: Normalización de Pregunta para Incidencia 3
    q = window.normalizeQuestion(q);
    var finalCorrect = correct || q.respuestaCorrecta || "No disponible";

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

    var allBtns = document.querySelectorAll('.option-card');
    var input = document.getElementById('fib-input');
    var fibBtn = document.querySelector('#fib-container button');

    allBtns.forEach(b function b.disabled = true);
    if(input) input.disabled = true;
    if(fibBtn) fibBtn.disabled = true;

    var feedback = document.getElementById('feedback-msg');

    // REQ 8.4: Evaluación estricta para Transcripción (Ortografía y Puntuación)
    q = currentQuizQuestions[currentIndex];
    var isCorrect = false;
    var cleanSelected = String(selected || "").trim();
    var cleanCorrect = String(correct || "").trim();

    if (q && q.type === 'transcription') {
        isCorrect = cleanSelected === cleanCorrect;
    } else {
        isCorrect = cleanSelected.toLowerCase() === cleanCorrect.toLowerCase();
    }

    if (isCorrect) {
        var xpGained = calculateXP(true, selectedDifficulty, responseTime);
        sessionXP += xpGained;

        // REQ 3.0: Sistema de Refuerzo - Eliminar de cola si es correcta
        var reinforcementIds = JSON.parse(localStorage.getItem('quizpro_reinforcement') || "[]");
        if (reinforcementIds.includes(q.id)) {
            reinforcementIds = reinforcementIds.filter(id function id !== q.id);
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
        var reinforcementIds = JSON.parse(localStorage.getItem('quizpro_reinforcement') || "[]");
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
        feedback.innerHTML = `Incorrecto. Era: ${window.sanitizarHTMLTecnico(finalCorrect)}`;
        incorrectAnswers.push(q);

        // Resaltar la opción correcta en la interfaz
        allBtns.forEach(b function {
            var btnText = b.textContent.trim().toLowerCase();
            var correctText = String(finalCorrect).trim().toLowerCase();
            if (finalCorrect && btnText === correctText) {
                b.classList.add('correct', 'border-emerald-500', 'text-emerald-600', 'bg-emerald-50/50');
            }
        });
    }

    document.getElementById('score').textContent = `${score} / ${currentIndex + 1}`;

    // Registrar intento para degradación de XP
    var attempts = JSON.parse(localStorage.getItem(`attempts_${q.id}`) || '0');
    localStorage.setItem(`attempts_${q.id}`, attempts + 1);

    setTimeout(() function {
        window.isProcessingAnswer = false;
        currentIndex++;
        if (currentIndex < currentQuizQuestions.length) showQuestion();
        else endQuiz();
    }, 1200);
}

window.submitFib = function() {
    var val = document.getElementById('fib-input').value;
    var q = currentQuizQuestions[currentIndex];
    checkAnswer(val, q.answer);
};

window.submitMatching = function() {
    var q = currentQuizQuestions[currentIndex];
    var inputs = document.querySelectorAll('.matching-letter-input');
    var selects = document.querySelectorAll('.matching-select');
    var allCorrect = true;

    if (inputs.length > 0) {
        inputs.forEach(input function {
            var term = input.dataset.term;
            var val = input.value.trim().toUpperCase();
            var correctLetter = window.currentMatchingMapping[term];

            if (val !== correctLetter) {
                allCorrect = false;
                input.classList.add('border-red-500', 'bg-red-50');
            } else {
                input.classList.add('border-emerald-500', 'bg-emerald-50');
            }
            input.disabled = true;
        });
    } else {
        selects.forEach(sel function {
            var term = sel.dataset.term;
            var val = sel.value;
            var correctPair = q.pairs.find(p function p.term === term);
            if (val !== correctPair.definition) { allCorrect = false; sel.classList.add('border-red-500'); }
            else { sel.classList.add('border-green-500'); }
            sel.disabled = true;
        });
    }

    var feedback = document.getElementById('feedback-msg');
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
    setTimeout(() function {
        currentIndex++;
        if (currentIndex < currentQuizQuestions.length) showQuestion();
        else endQuiz();
    }, 2000);
};

function startTimer() {
    timerInterval = setInterval(() function {
        timerSeconds++;
        var mins = Math.floor(timerSeconds/60).toString().padStart(2,'0');
        var secs = (timerSeconds%60).toString().padStart(2,'0');
        var timerEl = document.getElementById('timer');
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

    var finalPercent = Math.round((score / currentQuizQuestions.length) * 100);
    var approved = finalPercent >= 70;

    document.getElementById('final-score').textContent = `${finalPercent}%`;
    var mins = Math.floor(timerSeconds/60).toString().padStart(2,'0');
    var secs = (timerSeconds%60).toString().padStart(2,'0');
    document.getElementById('final-time').textContent = `${mins}:${secs}`;

    var recs = document.getElementById('recommendations-container');
    if (incorrectAnswers.length > 0) {
        var uniqueTags = [...new Set(incorrectAnswers.flatMap(q function q.tags || []))];
        recs.innerHTML = `
            <div class="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 text-left">
                <p class="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Temas a reforzar</p>
                <div class="flex flex-wrap gap-2">
                    ${uniqueTags.map(tag function `<span class="px-2 py-1 bg-white border border-orange-200 text-orange-700 text-[10px] font-bold rounded-lg">${getSanitizedAcademicText(tag)}</span>`).join('')}
                </div>
            </div>`;
        recs.classList.remove('hidden');
    } else {
        recs.classList.add('hidden');
    }

    var title = document.getElementById('result-title');
    var icon = document.getElementById('result-icon');
    if (approved) {
        title.textContent = '¡Excelente Trabajo!';
        icon.className = 'w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 bg-emerald-50 text-emerald-500';
        icon.innerHTML = '<i class="fas fa-trophy"></i>';
    } else {
        title.textContent = 'Puedes Mejorar';
        icon.className = 'w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 bg-orange-50 text-orange-500';
        icon.innerHTML = '<i class="fas fa-redo"></i>';
    }

    var user = JSON.parse(localStorage.getItem('currentUser'));
    var payload = {
        userId: user.userId,
        nombreAlumno: user.nombre,
        juego: "QuizPro",
        asignatura: selectedAsignatura,
        puntaje: finalPercent,
        nivel: window.getStandardLevelName(selectedDifficulty),
        grado: selectedGrado,
        xpGanada: sessionXP, // COLUMNA I: Asegurar el envío de XP neta
        fecha_logro: new Date().toISOString()
    };

    // Actualizar XP local para cálculo de Soft Cap
    var xpKey = `xp_${selectedAsignatura}_${selectedGrado}`;
    var currentTotalXP = parseInt(localStorage.getItem(xpKey) || '0');
    var newXP = currentTotalXP + sessionXP;
    localStorage.setItem(xpKey, newXP);

    // REQ: Desbloqueo Predictivo Local (Modulo 1)
    // Actualizamos el estado local ANTES de la red para asegurar 0ms de latencia en la UI
    var lvlName = window.getStandardLevelName(selectedDifficulty);
    var statKey = `QuizPro_${selectedAsignatura}_${selectedGrado}_${lvlName}`;

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
        var levelsState = JSON.parse(localStorage.getItem('levels_state') || '{"intermedio": {"bloqueado": true}}');
        levelsState.intermedio.bloqueado = false;
        localStorage.setItem('levels_state', JSON.stringify(levelsState));
        console.log("[QuizPro] Nivel Intermedio desbloqueado localmente (0ms).");
    }

    if (window.PersistenceManager) {
        window.PersistenceManager.set('local_progress', { totalXP: newXP }, xpKey);
        // REQ: Preservación de Historial en Actualización Predictiva (Modulo 1)
        window.PersistenceManager.get('academic_stats').then(cached function {
            if (cached && cached.data) {
                var updatedData = { ...cached.data, data: window.userGameStats };
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
        fetchApi('USER', 'saveGameResult', payload).then(res function {
            if (res.status === 'success' && res.updatedStats) {
                window.userGameStats = { ...window.userGameStats, ...res.updatedStats };
                console.log("[QuizPro] Sincronización silenciosa completada.");
                // REQ: Re-sincronización total tras éxito para recuperar historial y analítica extendida
                loadPerformanceTable();
            }
        }).catch(err function console.warn("[QuizPro] Error en sincronización silenciosa (se mantiene estado local):", err));
    }
}

async function loadGlobalTop() {
    var body = document.getElementById('global-top-body');
    if (!body) return;

    // REQ: Offline-First (Modulo 1)
    if (window.PersistenceManager) {
        var cached = await window.PersistenceManager.get('rankings');
        if (cached && cached.data) {
            renderGlobalTopHTML(cached.data);
            fetchApi('USER', 'getGlobalTop', { gameId: 'quizpro' }, 0, {
                store: 'rankings',
                onUpdate: (data) function renderGlobalTopHTML(data)
            }).catch(e function console.warn("[Offline-First] Sincronización silenciosa de ranking fallida."));
            return;
        }
    }

    try {
        console.log("[QuizPro] Solicitando ranking global...");
        var res = await fetchApi('USER', 'getGlobalTop', { gameId: 'quizpro' }, 0, {
            store: 'rankings',
            onUpdate: (data) function renderGlobalTopHTML(data)
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
    var body = document.getElementById('global-top-body');
    if (!body || !res || !res.global) return;
    // REQ 1: Restricción Clínica de Dataset (Top 5 Estricto)
    var top5 = (res.global || []).filter(function(u) { return u && (u.nombre || u.username || u.display_name); }).slice(0, 5);
    window.globalTopData = { global: top5, subjectTops: res.subjectTops };
    body.innerHTML = top5
        .map((user, idx) function {
            var xp = parseInt(user.xp || 0);
            var range = XP_CONFIG.RANGES.find(r function xp >= r.min && xp <= r.max) || XP_CONFIG.RANGES[0];

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
                <td class="px-6 py-4">
                    <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-black uppercase tracking-widest border border-indigo-100">${range.label}</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <span class="text-sm font-black ${(user.promedio || 0) >= 70 ? 'text-emerald-600' : 'text-gray-400'}">${user.promedio || 0}%</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <span class="text-[10px] font-bold text-gray-500">${xp.toLocaleString()}</span>
                </td>
            </tr>
        `;}).join('');

    if (res.global.length === 0) {
        body.innerHTML = '<tr><td colspan="2" class="px-6 py-8 text-center text-gray-400 text-xs italic">Aún no hay puntuaciones globales registradas</td></tr>';
    }
}

window.loadPerformanceTable = async function() {
    var container = document.getElementById('performance-table-body');
    var user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    if (!container || !user) return;

    // REQ: Offline-First (Modulo 1)
    if (window.PersistenceManager) {
        var cached = await window.PersistenceManager.get('academic_stats');
        // REQ: Eager caching - si ya tenemos datos, renderizamos y pedimos actualización silenciosa
        if (cached && cached.data) {
            renderPerformanceHTML(cached.data);
            fetchApi('USER', 'getGameStats', { userId: user.userId }, 0, {
                store: 'academic_stats',
                onUpdate: (data) function renderPerformanceHTML(data)
            }).catch(e function console.warn("[Offline-First] Sincronización silenciosa fallida, usando caché."));
            return;
        }
    }

    try {
        var res = await fetchApi('USER', 'getGameStats', { userId: user.userId }, 0, {
            store: 'academic_stats',
            onUpdate: (data) function renderPerformanceHTML(data)
        });
        if (res.status === 'success') {
            renderPerformanceHTML(res);
        }
    } catch (e) { console.error("Error loading stats", e); }
}

function renderPerformanceHTML(res) {
    var container = document.getElementById('performance-table-body');
    if (!container) return;

    // REQ: Soporte polimórfico para Caché y API (Modulo 1)
    // res puede ser la respuesta completa de la API o solo el objeto de estadísticas
    window.userGameStats = res.data || (res.id ? null : res) || {};
    var history = res.allHistory || [];

    var approvedCount = 0;
    var allMistakeTags = new Set();

    // REQ 7: Perfil Analítico Avanzado (Modulo 7)
    var hits = 0;
    var misses = 0;
    var totalSpeed = 0;
    var hitSpeedCount = 0;
    var impulsiveCount = 0;

    var minTimes = { 'verdadero_falso': 3000, ' Seleccion múltiple': 4000, 'emparejamiento': 8000, 'ordering': 12000, 'completacion': 15000 };

    history.forEach(h function {
        if (h[3] === 'QuizPro' && parseFloat(h[5]) < 70) {
            allMistakeTags.add(h[4]);
        }

        // Analizar registros detallados de QuizProAnalytics (h[12] = esCorrecta)
        if (h.length > 10) { // Indica que es un registro de analítica
            var isCorrect = String(h[12]) === "true";
            var time = parseFloat(h[13]) || 0;
            var type = h[4]; // tipoActividad

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
    var aeRatio = hits / Math.max(misses, 1);
    var avgSpeed = hitSpeedCount > 0 ? (totalSpeed / hitSpeedCount / 1000) : 0;
    var impulsivity = history.length > 0 ? Math.round((impulsiveCount / history.length) * 100) : 0;

    var elHits = document.getElementById('v2-hits');
    var elMisses = document.getElementById('v2-misses');
    var elRatio = document.getElementById('v2-ae-ratio');
    var elSpeed = document.getElementById('v2-speed');
    var elImp = document.getElementById('v2-impulsivity');

    if (elHits) elHits.textContent = hits;
    if (elMisses) elMisses.textContent = misses;
    if (elRatio) elRatio.textContent = window.formatearMetricaPsicométrica ? window.formatearMetricaPsicométrica(aeRatio) : aeRatio.toFixed(1);
    if (elSpeed) elSpeed.textContent = `${window.formatearMetricaPsicométrica ? window.formatearMetricaPsicométrica(avgSpeed) : avgSpeed.toFixed(1)}s`;
    if (elImp) elImp.textContent = `${impulsivity}%`;

    // ICR / IA / Mastery / XP (v3.0)
    var latestICR = 0, latestIA = 0, latestMastery = 0, totalXP = 0;
    var qProLogs = history.filter(h function h.length > 15);
    if (qProLogs.length > 0) {
        var last = qProLogs[qProLogs.length - 1];
        latestICR = parseFloat(last[17]) || 0;
        latestIA = parseFloat(last[18]) || 0;
        latestMastery = parseFloat(last[19]) || 0;
        totalXP = qProLogs.reduce((s, l) function s + (parseFloat(l[20]) || 0), 0);
    }

    var elMastery = document.getElementById('v2-mastery');
    var elICR = document.getElementById('v2-icr');
    var elIA = document.getElementById('v2-ia');
    var elXP = document.getElementById('v2-total-xp');
    var calBadge = document.getElementById('calibration-badge');

    if (elMastery) elMastery.textContent = `${window.formatearMetricaPsicométrica ? window.formatearMetricaPsicométrica(latestMastery) : latestMastery.toFixed(2)}%`;
    if (elICR) elICR.textContent = `${window.formatearMetricaPsicométrica ? window.formatearMetricaPsicométrica(latestICR) : latestICR.toFixed(2)}%`;
    if (elIA) elIA.textContent = `${window.formatearMetricaPsicométrica ? window.formatearMetricaPsicométrica(latestIA) : latestIA.toFixed(2)}%`;
    if (elXP) elXP.textContent = Math.round(totalXP).toLocaleString();

    // Cold Start Badge (Modulo 7.7)
    if (calBadge) {
        if (qProLogs.length > 0 && qProLogs.length < 30) calBadge.classList.remove('hidden');
        else calBadge.classList.add('hidden');
    }

    container.innerHTML = Object.entries(window.userGameStats)
        .filter(([key]) function key.startsWith('QuizPro_'))
        .map(([key, s]) function {
            if (s.maxScore >= 70) approvedCount++;
            return `
                <tr class="border-b border-gray-50 text-[11px]">
                    <td class="py-3 font-bold text-gray-700">${getSanitizedAcademicText(s.subject)}</td>
                    <td class="py-3 capitalize text-blue-600 font-semibold">${getSanitizedAcademicText(s.level)} (${getSanitizedAcademicText(s.grade)})</td>
                    <td class="py-3 font-black text-gray-900">${s.maxScore}%</td>
                </tr>`;
        }).join('');

    var approvedEl = document.getElementById('total-approvals');
    if (approvedEl) approvedEl.textContent = approvedCount;

    var reinforcementSection = document.getElementById('reinforcement-feedback');
    var tagsContainer = document.getElementById('reinforcement-tags');
    if (allMistakeTags.size > 0 && tagsContainer) {
        reinforcementSection.classList.remove('hidden');
        tagsContainer.innerHTML = Array.from(allMistakeTags).map(tag function
            `<span class="px-2 py-1 bg-white border border-orange-200 text-orange-700 text-[10px] font-bold rounded-lg">${getSanitizedAcademicText(tag)}</span>`
        ).join('');
    }

    if (Object.keys(window.userGameStats).length > 0) {
        var dashboard = document.getElementById('performance-dashboard');
        if (dashboard) dashboard.classList.remove('hidden');
    }

    // REQ 8: Fortalezas y Debilidades (Modulo 8)
    if (history.length > 0) {
        renderDiagnosis(history);
    }
}

function renderDiagnosis(history) {
    var strongEl = document.getElementById('v2-strong-topic');
    var weakEl = document.getElementById('v2-weak-topic');
    var linkContainer = document.getElementById('v2-recommendation-link');
    if (!strongEl || !weakEl) return;

    // Agrupar analítica por tema
    var topics = {};
    history.forEach(h function {
        if (h.length < 15) return;
        var tema = h[6]; // Asignatura/Tema en logs
        if (!tema || tema === 'General') return;

        if (!topics[tema]) topics[tema] = { hits: 0, total: 0 };
        var isCorrect = String(h[12]) === "true";
        topics[tema].total++;
        if (isCorrect) topics[tema].hits++;
    });

    var topicStats = Object.entries(topics)
        .map(([tema, s]) function ({ tema, mastery: (s.hits / s.total) * 100, total: s.total }))
        .filter(t function t.total >= 5); // Mínimo 5 preguntas (Modulo 3.1)

    if (topicStats.length === 0) {
        strongEl.textContent = "Datos insuficientes para generar diagnóstico.";
        weakEl.textContent = "Datos insuficientes para generar diagnóstico.";
        return;
    }

    topicStats.sort((a, b) function b.mastery - a.mastery);
    var strong = topicStats[0];
    var weak = topicStats[topicStats.length - 1];

    strongEl.textContent = `${strong.tema} (${window.redondearMetrica(strong.mastery)}%)`;
    weakEl.textContent = `${weak.tema} (${window.redondearMetrica(weak.mastery)}%)`;

    // Renderizar Gráficos Chart.js (Modulo 5)
    renderPsychometricCharts(history);

    // Recomendación Curricular (Modulo 8.2)
    if (weak.mastery < 70) {
        var findPresentation = (tema) function {
            if (!window.presentationData) return null;
            for (var grade of window.presentationData) {
                for (var subject of grade.subjects) {
                    for (var topic of subject.topics) {
                        if (topic.title.toLowerCase().includes(tema.toLowerCase()) ||
                            tema.toLowerCase().includes(topic.title.toLowerCase())) {
                            return topic.file;
                        }
                    }
                }
            }
            return null;
        };

        var file = findPresentation(weak.tema);
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
 * REQ: Gráficos Psicométricos Interactivos (Modulo 5)
 */
function renderPsychometricCharts(history) {
    var radarCtx = document.getElementById('psychometric-radar-chart')?.getContext('2d');
    var trendCtx = document.getElementById('learning-trend-chart')?.getContext('2d');

    if (!radarCtx || !trendCtx || history.length === 0) return;

    // 1. Datos para Gráfico Radial (Últimas métricas registradas)
    var qProLogs = history.filter(h function h.length > 15);
    var latestICR = 0, latestIA = 0, latestMastery = 0;

    if (qProLogs.length > 0) {
        var last = qProLogs[qProLogs.length - 1];
        latestICR = parseFloat(last[17]) || 0;
        latestIA = parseFloat(last[18]) || 0;
        latestMastery = parseFloat(last[19]) || 0;
    }

    if (window.radarChartInstance) window.radarChartInstance.destroy();
    window.radarChartInstance = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: ['Confianza (ICR)', 'Dominio (Mastery)', 'Adivinación (IA)'],
            datasets: [{
                label: 'Estado Cognitivo',
                data: [latestICR, latestMastery, 100 - latestIA],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { display: false }
                }
            },
            plugins: { legend: { display: false } }
        }
    });

    // 2. Datos para Gráfico de Líneas (Evolución de puntaje)
    var scores = qProLogs.map(h function parseFloat(h[5])).slice(-10); // Últimas 10 sesiones
    var labels = scores.map((_, i) function `S${i+1}`);

    if (window.trendChartInstance) window.trendChartInstance.destroy();
    window.trendChartInstance = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Promedio de Sesión',
                data: scores,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100, ticks: { font: { size: 8 } } },
                x: { ticks: { font: { size: 8 } } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function exitGame() {
    if (window.returnToMainContent) {
        window.returnToMainContent();
    } else {
        window.location.href = '../index.html?action=show-activities';
    }
}
