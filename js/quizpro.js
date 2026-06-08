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

const SEEN_QUESTIONS_KEY = 'quizpro_seen_questions';
const SEEN_LIMIT = 200;

window.userGameStats = {}; // Cache de logros para validación de bloqueos
window.globalTopData = null;

window.initQuizPro = async function() {
    // REQ: Uso del Adaptador Unificado (Fase 3)
    if (window.GamesAdapter) {
        await GamesAdapter.init('quizpro');
    }

    try {
        await window.loadPerformanceTable();
        // loadGlobalTop se maneja internamente por el adaptador
        await loadGlobalTop(); // Inyectar ranking en el home
    } catch (e) {
        console.error("[QuizPro] Error en carga de tablas:", e);
    } finally {
        if (window.GamesAdapter) {
            await GamesAdapter.showLoading(false);
        }
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
    const user = JSON.parse(localStorage.getItem('currentUser'));
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
 * REQ 3.A: Validación Hierárquica de Grados (Nueva Lógica v4)
 * FASE 13: Los grados superiores están bloqueados hasta que TODAS las asignaturas de grados inferiores
 * hayan sido aprobadas con Nota >= 70 e Índice de Dominio >= 60.
 */
function checkCrossGradeLock(subjectName, targetGrade) {
    const targetGradeNum = window.parseGrade(targetGrade);
    // 10th grade subjects are unlocked by default
    if (targetGradeNum <= 10) return false;

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userSection = user?.seccion;
    const statsArray = Object.values(window.userGameStats);

    // Identify all subjects from previous grades that the student should have completed
    const requiredGrades = [];
    if (targetGradeNum > 10) requiredGrades.push(10);
    if (targetGradeNum > 11) requiredGrades.push(11);

    const subjectsToApprove = []; // { name, gradeNum }
    window.presentationData.forEach(block => {
        const bg = window.parseGrade(block.grade);
        if (requiredGrades.includes(bg)) {
            block.subjects.forEach(s => {
                if (userSection && !window.checkSectionHelper(s.sections, userSection)) return;

                const name = window.normalizeSubject(s.name);
                if (!subjectsToApprove.some(item => item.name === name && item.gradeNum === bg)) {
                    subjectsToApprove.push({ name, gradeNum: bg });
                }
            });
        }
    });

    // Check if EVERY subject in previous grades has all 3 levels approved with Nota >= 70 e Índice de Dominio >= 60
    const levels = ['Básico', 'Intermedio', 'Avanzado'];
    for (const req of subjectsToApprove) {
        for (const lvl of levels) {
            // FASE 13: Validación Cross-Grade (Unlock Score >= 70%)
            // Se elimina dependencia del dominio para evitar bloqueos por fluctuación (A-149)
            const hasApproval = statsArray.some(s =>
                window.normalizeSubject(s.subject) === req.name &&
                window.parseGrade(s.grade) === req.gradeNum &&
                window.getStandardLevelName(s.level) === lvl &&
                parseFloat(s.maxScore || 0) >= 70
            );
            if (!hasApproval) {
                console.log(`Locking ${subjectName}: Missing ${req.name} ${lvl} (${req.gradeNum}) con puntaje suficiente.`);
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

    const isTeacher = JSON.parse(localStorage.getItem('currentUser'))?.rol === 'Profesor';

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

    // REQ 3.B: Progresión Interna por Niveles (Fase 13: Mastery-Based)
    // Reducción Extrema: Asegurar evaluación del mejor intento histórico (A-149)
    const stats = Object.values(window.userGameStats || {}).filter(s =>
        window.normalizeSubject(s.subject) === window.normalizeSubject(subjectName) &&
        window.parseGrade(s.grade) === window.parseGrade(gradeLabel)
    );

    const getBestStat = (lvl) => stats
        .filter(s => window.getStandardLevelName(s.level) === lvl)
        .reduce((best, curr) => {
            const currScore = parseFloat(curr.maxScore || 0);
            const bestScore = parseFloat(best.maxScore || 0);
            return currScore > bestScore ? curr : best;
        }, { maxScore: 0, dominio: 0, dominioPromedio: 0 });

    const bestBasic = getBestStat('Básico');
    const bestInter = getBestStat('Intermedio');

    const basicScore = parseFloat(bestBasic.maxScore);
    const interScore = parseFloat(bestInter.maxScore);

    const btnInter = document.getElementById('btn-intermedio');
    const cardInter = document.getElementById('level-intermedio');
    const btnAvan = document.getElementById('btn-avanzado');
    const cardAvan = document.getElementById('level-avanzado');

    // FASE 13: Desacoplamiento Lineal y Unlock Score (A-149)
    // Regla: Únicamente el Unlock Score (maxScore >= 70) activa el desbloqueo.
    // Intermedio depende de Básico; Avanzado depende UNICAMENTE de Intermedio.
    const canUnlockInter = isTeacher || (basicScore >= 70);
    const canUnlockAvan = isTeacher || (interScore >= 70);

    // UI Intermedio
    if (canUnlockInter) {
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

    // UI Avanzado
    if (canUnlockAvan) {
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

    let seenIds = JSON.parse(localStorage.getItem(SEEN_QUESTIONS_KEY) || "[]");
    let freshQuestions = allPresentationQuestions.filter(q => !seenIds.includes(q.id));
    if (freshQuestions.length < 5) freshQuestions = allPresentationQuestions;

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
    currentQuizQuestions = interleaved
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
        .slice(0, 15);

    currentIndex = 0;
    score = 0;
    timerSeconds = 0;
    incorrectAnswers = [];
    lastCorrectIndex = -1; // Resetear para nueva sesión

    startTimer();
    showQuestion();
}

/**
 * REFACTORIZACIÓN: Evolución a Banco Central de Preguntas
 * El motor ahora consume datos desde la API del BancoCentral y genera
 * dinámicamente actividades multi-modales.
 */
async function loadQuestions() {
    allPresentationQuestions = [];
    console.log(`[QuizPro] Consultando Banco Central para: ${selectedAsignatura} (${selectedDifficulty})`);

    // Tarea 2: Reingeniería de Arquitectura de Datos - Carga Distribuida
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
            'Informática I': 'Informatica'
        };
        const asignaturaFolder = mapping[selectedAsignatura] || selectedAsignatura.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');

        // Normalizar nombre de archivo para evitar problemas con acentos (Tarea 2: Corrección)
        const rawLevel = window.getStandardLevelName(selectedDifficulty);
        const levelFile = rawLevel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + '.json';

        const path = `js/Banco_Preguntas/${gradeFolder}/${asignaturaFolder}/${levelFile}`;
        console.log(`[QuizPro] Intentando cargar desde: ${path}`);

        const localRes = await fetch(path);
        if (localRes.ok) {
            const localData = await localRes.json();
            if (localData && localData.length > 0) {
                console.log(`[QuizPro] Cargadas ${localData.length} preguntas desde arquitectura distribuida.`);
                allPresentationQuestions = transformBankQuestions(localData);
                return;
            } else {
                console.log(`[QuizPro] Archivo local encontrado pero vacío: ${path}. Continuando a Banco Central.`);
            }
        }
    } catch (e) {
        console.warn("[QuizPro] Fallo carga desde arquitectura distribuida, reintentando con Banco Central...", e);
    }

    // FASE 2: Consumo API (Google Sheets) como fuente secundaria
    try {
        const res = await fetchApi('USER', 'getQuestionBank', {
            asignatura: selectedAsignatura,
            nivel: window.getStandardLevelName(selectedDifficulty),
            activaOnly: true
        });

        if (res.status === 'success' && res.data) {
            allPresentationQuestions = transformBankQuestions(res.data);
            console.log(`[QuizPro] Cargadas ${allPresentationQuestions.length} preguntas desde la API del Banco Central.`);
        }

        // Fallback: Si el banco está vacío para esta nueva asignatura, intentar cargar desde presentaciones legacy
        if (allPresentationQuestions.length === 0) {
            console.log("[QuizPro] Banco vacío. Intentando carga legacy de presentaciones...");
            await loadQuestionsLegacy();
        }

    } catch (e) {
        console.error("[QuizPro] Error cargando desde el Banco:", e);
        await loadQuestionsLegacy();
    }
}

/**
 * Transforma los datos crudos del banco (JSON o API) al formato interno de QuizPro
 */
function transformBankQuestions(data) {
    const bankQuestions = data.map(rawQ => {
                // REQ: Normalizar integridad antes de transformar (v3.2)
                const q = window.normalizeQuestion(rawQ);

                // Heurística de Multi-Modalidad (Fase 4)
                let type = q.TipoActividad || "Selección múltiple";
                let options = [q.OpcionA, q.OpcionB, q.OpcionC, q.OpcionD].filter(o => o && o.trim() !== "");
                let items = q.items || [];
                let pairs = q.pairs || [];

                // Adaptar estructuras según el tipo de actividad si vienen vacíos
                if (type === 'ordering' && items.length === 0) {
                    items = options; // En ordering, las opciones A-D son los pasos a ordenar
                } else if ((type === 'matching' || type === 'memory') && pairs.length === 0) {
                    // En matching, guardamos pares en formato term|def en las opciones
                    options.forEach(opt => {
                        if (opt.includes('|')) {
                            const [term, def] = opt.split('|');
                            pairs.push({ term: term.trim(), definition: def.trim() });
                        }
                    });
                } else if (type === 'Identificar el componente') {
                    // Opciones son los nombres de componentes, la imagen está en q.Imagen
                }

                return {
                    id: q.PreguntaID || `bank_${Math.random().toString(36).substr(2, 9)}`,
                    question: q.Pregunta,
                    options: options,
                    items: items,
                    pairs: pairs,
                    answer: q.RespuestaCorrecta,
                    type: type,
                    explanation: q.Explicacion,
                    image: q.Imagen,
                    subject: q.Asignatura,
                    nivel: q.Nivel,
                    tags: [q.Tema || "General"]
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
    document.getElementById('question-text').textContent = q.question;

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

    if (q.type === 'practice') {
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
    } else if (q.type === 'Verdadero y Falso') {
        optionsContainer.classList.remove('hidden');
        const opts = ["Verdadero", "Falso"];
        opts.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-card w-full p-6 text-center border-2 border-gray-100 rounded-2xl font-black text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-200 transition-all uppercase tracking-widest text-sm';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(opt, q.answer, btn);
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
    } else if (q.type === 'Completar espacios' || q.type === 'completion' || q.type === 'fill-in-the-blanks') {
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
    } else if (q.type === 'matching') {
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
    } else if (q.type === 'verdadero_falso') {
        optionsContainer.classList.remove('hidden');
        const options = ["Verdadero", "Falso"];
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-card w-full p-4 text-center border-2 border-gray-100 rounded-xl font-black text-gray-700 bg-white hover:bg-blue-50 transition-all uppercase tracking-tighter';
            btn.textContent = opt;
            // Map Verdadero/Falso to A/B for internal answer checking consistency
            const val = opt === "Verdadero" ? "A" : "B";
            btn.onclick = () => checkAnswer(val, q.answer, btn);
            optionsContainer.appendChild(btn);
        });
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
        if (btn) btn.classList.add('correct', 'border-emerald-500', 'bg-emerald-50', 'text-emerald-700');
        feedback.className = 'text-center h-8 font-bold text-emerald-500';
        feedback.textContent = '¡Correcto!';
        score++;
        console.log(`[QuizPro] Pregunta ${currentIndex} Correcta. Mastery: ${q.tags?.[0] || 'N/A'}`);
    } else {
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

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const payload = {
        userId: user.userId,
        nombreAlumno: user.nombre,
        juego: "QuizPro",
        asignatura: selectedAsignatura,
        puntaje: finalPercent,
        nivel: window.getStandardLevelName(selectedDifficulty),
        grado: selectedGrado,
        fecha_logro: new Date().toISOString()
    };

    if (typeof fetchApi === 'function') {
        await fetchApi('USER', 'saveGameResult', payload);
        // REQ 5: Actualizar stats y refrescar UI de niveles para reflejar el desbloqueo
        await loadPerformanceTable();
    }
}

async function loadGlobalTop() {
    const body = document.getElementById('global-top-body');
    if (!body) return;

    try {
        console.log("[QuizPro] Solicitando ranking global...");
        const res = await fetchApi('USER', 'getGlobalTop', { gameId: 'quizpro' });
        console.log("[QuizPro] Respuesta Ranking:", res);

        if (res.status === 'success' && Array.isArray(res.global)) {
            window.globalTopData = res;
            body.innerHTML = res.global
                .filter(user => user && (user.nombre || user.username || user.display_name))
                .map((user, idx) => `
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
                    <td class="px-6 py-4 text-right">
                        <span class="text-sm font-black ${(user.promedio || 0) >= 70 ? 'text-emerald-600' : 'text-gray-400'}">${user.promedio || 0}%</span>
                    </td>
                </tr>
            `).join('');

            if (res.global.length === 0) {
                body.innerHTML = '<tr><td colspan="2" class="px-6 py-8 text-center text-gray-400 text-xs italic">Aún no hay puntuaciones globales registradas</td></tr>';
            }
        }
    } catch (e) {
        console.error("Error loading global top", e);
        body.innerHTML = '<tr><td colspan="2" class="px-6 py-8 text-center text-red-400 text-xs italic">Error al cargar ranking global</td></tr>';
    }
}

window.loadPerformanceTable = async function() {
    const container = document.getElementById('performance-table-body');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!container || !user) return;

    try {
        const res = await fetchApi('USER', 'getGameStats', { userId: user.userId });
        if (res.status === 'success') {
            window.userGameStats = res.data || {};
            const history = res.allHistory || [];

            let approvedCount = 0;
            const allMistakeTags = new Set();

            history.forEach(h => {
                if (h[3] === 'QuizPro' && parseFloat(h[5]) < 70) {
                    allMistakeTags.add(h[4]);
                }
            });

            container.innerHTML = Object.entries(window.userGameStats)
                .filter(([key]) => key.startsWith('QuizPro_'))
                .map(([key, s]) => {
                    if (s.maxScore >= 70) approvedCount++;
                    return `
                        <tr class="border-b border-gray-50 text-[11px]">
                            <td class="py-3 font-bold text-gray-700">${s.subject}</td>
                            <td class="py-3 capitalize text-blue-600 font-semibold">${s.level} (${s.grade})</td>
                            <td class="py-3 font-black text-gray-900">${s.maxScore}%</td>
                        </tr>`;
                }).join('');

            document.getElementById('total-approvals').textContent = approvedCount;
            const reinforcementSection = document.getElementById('reinforcement-feedback');
            const tagsContainer = document.getElementById('reinforcement-tags');
            if (allMistakeTags.size > 0 && tagsContainer) {
                reinforcementSection.classList.remove('hidden');
                tagsContainer.innerHTML = Array.from(allMistakeTags).map(tag =>
                    `<span class="px-2 py-1 bg-white border border-orange-200 text-orange-700 text-[10px] font-bold rounded-lg">${tag}</span>`
                ).join('');
            }
            if (Object.keys(window.userGameStats).length > 0) {
                document.getElementById('performance-dashboard').classList.remove('hidden');
            }
        }
    } catch (e) { console.error("Error loading stats", e); }
}

function exitGame() {
    if (window.returnToMainContent) {
        window.returnToMainContent();
    } else {
        window.location.href = '../index.html?action=show-activities';
    }
}
