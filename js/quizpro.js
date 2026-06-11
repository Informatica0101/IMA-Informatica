/**
 * QuizPro v7.5 - Smart Evaluation Engine
 * Strict ES5 Implementation with Namespacing and IIFE.
 */
var QuizProApp = window.QuizProApp || {};

(function(app) {
    "use strict";

    // --- State Variables ---
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
    var lastCorrectIndex = -1;
    var questionStartTime = 0;
    var responseChanges = 0;
    var currentStreak = 0;
    var sessionXP = 0;

    // --- Configuration ---
    var XP_CONFIG = {
        BASE: 100,
        FACTORS: { basico: 1.0, intermedio: 1.5, avanzado: 2.0 },
        TIME: { MIN: 4000, OPTIMAL: 15000, MAX: 30000 },
        STREAK: { BONUS_PER_HIT: 0.05, MAX: 1.3 },
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

    // --- Initialization ---
    app.initQuizPro = function() {
        if (QuizProApp.GamesAdapter) {
            QuizProApp.GamesAdapter.init('quizpro', false);
        }

        app.loadPerformanceTable();
        app.loadGlobalTop();

        var handleAbandonment = function() {
            var quizScreen = document.getElementById('quiz-screen');
            if (quizScreen && !quizScreen.classList.contains('hidden')) {
                alert('Evaluación cancelada por abandono de ventana o cambio de pestaña.');
                location.reload();
            }
        };

        window.addEventListener('blur', handleAbandonment);
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') handleAbandonment();
        });
    };

    // --- Navigation ---
    app.navigateToSubjects = function() {
        var grid = document.getElementById('subjects-grid');
        var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var user = userRaw ? JSON.parse(userRaw) : null;
        var isTeacher = user && user.rol === 'Profesor';
        var userGradeNum = app.getStudentGrade();

        var subjectEntries = [];
        var userSection = user ? user.seccion : null;

        if (!QuizProApp.presentationData) return;

        QuizProApp.presentationData.forEach(function(gradeBlock) {
            var blockGradeNum = app.parseGrade(gradeBlock.grade);
            if (isTeacher || blockGradeNum <= userGradeNum) {
                var seenInBlock = {};
                gradeBlock.subjects.forEach(function(subj) {
                    if (!isTeacher && userSection && !QuizProApp.checkSectionHelper(subj.sections, userSection)) return;

                    var normName = app.normalizeSubject(subj.name);
                    if (seenInBlock[normName]) return;

                    subjectEntries.push({
                        name: normName,
                        gradeLabel: gradeBlock.grade,
                        gradeNum: blockGradeNum
                    });
                    seenInBlock[normName] = true;
                });
            }
        });

        subjectEntries.sort(function(a, b) { return (a.gradeNum - b.gradeNum) || a.name.localeCompare(b.name); });

        grid.innerHTML = subjectEntries.map(function(entry) {
            var isLocked = !isTeacher && app.checkCrossGradeLock(entry.name, entry.gradeLabel);
            var cardClass = isLocked ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-md cursor-pointer';
            var lockIcon = isLocked ? '<i class="fas fa-lock text-xs ml-2 text-gray-400"></i>' : '';
            var clickAction = isLocked ? '' : "QuizProApp.navigateToLevels('" + entry.name + "', '" + entry.gradeLabel + "')";

            return '<div class="subject-card p-6 bg-white border-2 border-gray-100 rounded-3xl shadow-sm transition-all text-center ' + cardClass + '" onclick="' + clickAction + '">' +
                    '<div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl"><i class="fas fa-book"></i></div>' +
                    '<h3 class="font-bold text-gray-900 leading-tight">' + entry.name + lockIcon + '</h3>' +
                    '<p class="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">' + app.getSubjectLabel(entry.name) + '</p>' +
                    '<div class="mt-2 flex items-center justify-center gap-2">' +
                        '<span class="text-[8px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold uppercase">' + entry.gradeLabel + '</span>' +
                    '</div>' +
                    (isLocked ? '<p class="text-[8px] text-red-500 font-bold uppercase mt-2">Prerrequisito pendiente</p>' : '') +
                '</div>';
        }).join('');

        document.getElementById('home-screen').classList.add('hidden');
        document.getElementById('subjects-screen').classList.remove('hidden');
    };

    app.checkCrossGradeLock = function(subjectName, targetGrade) {
        var targetGradeNum = app.parseGrade(targetGrade);
        if (targetGradeNum <= 10) return false;

        var userRaw = localStorage.getItem('currentUser');
        var user = userRaw ? JSON.parse(userRaw) : null;
        var userSection = user ? user.seccion : null;
        var statsArray = [];
        if (QuizProApp.userGameStats) {
            var keys = Object.keys(QuizProApp.userGameStats);
            for (var i = 0; i < keys.length; i++) statsArray.push(QuizProApp.userGameStats[keys[i]]);
        }

        var requiredGrades = [];
        if (targetGradeNum > 10) requiredGrades.push(10);
        if (targetGradeNum > 11) requiredGrades.push(11);

        var subjectsToApprove = [];
        QuizProApp.presentationData.forEach(function(block) {
            var bg = app.parseGrade(block.grade);
            if (requiredGrades.indexOf(bg) !== -1) {
                block.subjects.forEach(function(s) {
                    if (userSection && !QuizProApp.checkSectionHelper(s.sections, userSection)) return;
                    var name = app.normalizeSubject(s.name);
                    var alreadyAdded = false;
                    for (var j = 0; j < subjectsToApprove.length; j++) {
                        if (subjectsToApprove[j].name === name && subjectsToApprove[j].gradeNum === bg) { alreadyAdded = true; break; }
                    }
                    if (!alreadyAdded) subjectsToApprove.push({ name: name, gradeNum: bg });
                });
            }
        });

        var levels = ['Básico', 'Intermedio', 'Avanzado'];
        for (var k = 0; k < subjectsToApprove.length; k++) {
            var req = subjectsToApprove[k];
            for (var l = 0; l < levels.length; l++) {
                var lvl = levels[l];
                var hasApproval = false;
                for (var m = 0; m < statsArray.length; m++) {
                    var s = statsArray[m];
                    if (app.normalizeSubject(s.subject) === req.name &&
                        app.parseGrade(s.grade) === req.gradeNum &&
                        app.getStandardLevelName(s.level) === lvl &&
                        parseFloat(s.maxScore || 0) >= 70) {
                        hasApproval = true; break;
                    }
                }
                if (!hasApproval) return true;
            }
        }
        return false;
    };

    app.navigateToLevels = function(subjectName, gradeLabel) {
        selectedAsignatura = subjectName;
        selectedGrado = gradeLabel;
        document.getElementById('selected-subject-title').textContent = subjectName;

        var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var user = userRaw ? JSON.parse(userRaw) : null;
        var isTeacher = user && user.rol === 'Profesor';

        var topContainer = document.getElementById('subject-top-container');
        var topNames = document.getElementById('subject-top-names');
        if (topContainer && topNames && QuizProApp.globalTopData && QuizProApp.globalTopData.subjectTops) {
            var topList = QuizProApp.globalTopData.subjectTops[gradeLabel] ? QuizProApp.globalTopData.subjectTops[gradeLabel][subjectName] : null;
            if (topList && topList.length > 0) {
                topNames.textContent = topList.map(function(u) { return u.nombre; }).join(', ');
                topContainer.classList.remove('hidden');
            } else {
                topContainer.classList.add('hidden');
            }
        }

        var statsArray = [];
        if (QuizProApp.userGameStats) {
            var keys = Object.keys(QuizProApp.userGameStats);
            for (var i = 0; i < keys.length; i++) statsArray.push(QuizProApp.userGameStats[keys[i]]);
        }
        var targetGradeNum = app.parseGrade(gradeLabel);
        var targetSubjectNorm = app.normalizeSubject(subjectName);

        var relevantStats = statsArray.filter(function(s) {
            if (!s.subject || s.grade === undefined) return false;
            return app.normalizeSubject(s.subject) === targetSubjectNorm &&
                   app.parseGrade(s.grade) === targetGradeNum;
        });

        var getMetricsForLevel = function(lvlName) {
            var matches = relevantStats.filter(function(s) { return app.getStandardLevelName(s.level) === lvlName; });
            if (matches.length === 0) return { score: 0, icr: 0, ia: 0, mastery: 0 };
            var scores = matches.map(function(m) { return parseFloat(m.maxScore || 0); });
            var icrs = matches.map(function(m) { return parseFloat(m.icr || 0); });
            var ias = matches.map(function(m) { return parseFloat(m.ia || 100); });
            var masteries = matches.map(function(m) { return parseFloat(m.dominio || 0); });
            return {
                score: Math.max.apply(Math, scores),
                icr: Math.max.apply(Math, icrs),
                ia: Math.min.apply(Math, ias),
                mastery: Math.max.apply(Math, masteries)
            };
        };

        var basicMetrics = getMetricsForLevel('Básico');
        var interMetrics = getMetricsForLevel('Intermedio');

        var xpKey = "xp_" + targetSubjectNorm + "_" + gradeLabel;
        var currentXP = parseInt(localStorage.getItem(xpKey) || '0');

        var userRange = null;
        for (var j = 0; j < XP_CONFIG.RANGES.length; j++) {
            var r = XP_CONFIG.RANGES[j];
            if (currentXP >= r.min && currentXP <= r.max) { userRange = r; break; }
        }
        if (!userRange) userRange = XP_CONFIG.RANGES[0];

        if (currentXP > 22000) {
            var statsValues = [];
            if (QuizProApp.userGameStats) {
                var sKeys = Object.keys(QuizProApp.userGameStats);
                for (var k = 0; k < sKeys.length; k++) statsValues.push(QuizProApp.userGameStats[sKeys[k]]);
            }
            var totalMastery = 0, totalICR = 0, totalIA = 0;
            for (var l = 0; l < statsValues.length; l++) {
                totalMastery += (statsValues[l].dominio || 0);
                totalICR += (statsValues[l].icr || 0);
                totalIA += (statsValues[l].ia || 0);
            }
            var globalMastery = totalMastery / Math.max(statsValues.length, 1);
            var globalICR = totalICR / Math.max(statsValues.length, 1);
            var globalIA = totalIA / Math.max(statsValues.length, 1);

            if (globalMastery >= 85 && globalICR >= 80 && globalIA <= 15) {
                userRange = { label: 'Leyenda' };
            } else {
                userRange = { label: 'Maestro' };
            }
        }

        var badgeHtml = '<div class="mt-4 flex flex-col items-center gap-2">' +
            '<span class="px-4 py-1 ' + (userRange.label === 'Leyenda' ? 'bg-amber-500 shadow-amber-200' : 'bg-indigo-600 shadow-indigo-100') + ' text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">' + userRange.label + '</span>' +
            '<p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">' + currentXP.toLocaleString() + ' XP ACUMULADA</p>' +
        '</div>';

        var existingBadge = document.getElementById('user-rank-badge');
        if (existingBadge) existingBadge.innerHTML = badgeHtml;
        else {
            var badgeContainer = document.createElement('div');
            badgeContainer.id = 'user-rank-badge';
            badgeContainer.innerHTML = badgeHtml;
            var titleEl = document.getElementById('selected-subject-title');
            titleEl.parentNode.insertBefore(badgeContainer, titleEl.nextSibling);
        }

        var btnInter = document.getElementById('btn-intermedio');
        var cardInter = document.getElementById('level-intermedio');
        var btnAvan = document.getElementById('btn-avanzado');
        var cardAvan = document.getElementById('level-avanzado');

        var checkUnlock = function(metrics, targetLevel) {
            if (isTeacher) return true;
            var totalAnswers = 0;
            if (QuizProApp.userGameStats) {
                var keys = Object.keys(QuizProApp.userGameStats);
                for (var i = 0; i < keys.length; i++) totalAnswers += (QuizProApp.userGameStats[keys[i]].totalAttempts || 0);
            }
            if (targetLevel === 'intermedio') return metrics.score >= 70 && totalAnswers > 25;
            if (targetLevel === 'avanzado') return metrics.score >= 70;
            return metrics.score >= 70;
        };

        var localLevelsState = JSON.parse(localStorage.getItem('levels_state') || '{"intermedio": {"bloqueado": true}}');
        var canUnlockInter = !localLevelsState.intermedio.bloqueado || checkUnlock(basicMetrics, 'intermedio');
        var canUnlockAvan = checkUnlock(interMetrics, 'avanzado');

        if (canUnlockInter) {
            btnInter.disabled = false;
            btnInter.innerHTML = 'Entrar';
            btnInter.classList.remove('bg-gray-300');
            btnInter.classList.add('bg-gray-900');
            btnInter.classList.remove('cursor-not-allowed');
            cardInter.classList.remove('locked');
            var oldProgInter = cardInter.querySelector('.unlock-progress');
            if (oldProgInter) oldProgInter.parentNode.removeChild(oldProgInter);
        } else {
            btnInter.disabled = true;
            btnInter.innerHTML = '<i class="fas fa-lock mr-2"></i> Bloqueado';
            btnInter.classList.remove('bg-gray-900');
            btnInter.classList.add('bg-gray-300', 'cursor-not-allowed');
            cardInter.classList.add('locked');
            var progInter = cardInter.querySelector('.unlock-progress');
            if (!progInter) {
                progInter = document.createElement('p');
                progInter.className = 'unlock-progress text-[9px] font-bold text-red-500 mt-2 uppercase';
                btnInter.parentNode.insertBefore(progInter, btnInter.nextSibling);
            }
            var totalAttempts = 0;
            if (QuizProApp.userGameStats) {
                var keysA = Object.keys(QuizProApp.userGameStats);
                for (var kA = 0; kA < keysA.length; kA++) totalAttempts += (QuizProApp.userGameStats[keysA[kA]].totalAttempts || 0);
            }
            var reasonInter = 'Requieres 70% de precisión.';
            if (basicMetrics.score >= 70) {
                if (totalAttempts < 25) reasonInter = 'Fase de calibración: Faltan ' + (25 - totalAttempts) + ' preguntas.';
            }
            progInter.textContent = 'Bloqueado. ' + reasonInter;
        }

        if (canUnlockAvan) {
            btnAvan.disabled = false;
            btnAvan.innerHTML = 'Entrar';
            btnAvan.classList.remove('bg-gray-300');
            btnAvan.classList.add('bg-gray-900');
            btnAvan.classList.remove('cursor-not-allowed');
            cardAvan.classList.remove('locked');
            var oldProgAvan = cardAvan.querySelector('.unlock-progress');
            if (oldProgAvan) oldProgAvan.parentNode.removeChild(oldProgAvan);
        } else {
            btnAvan.disabled = true;
            btnAvan.innerHTML = '<i class="fas fa-lock mr-2"></i> Bloqueado';
            btnAvan.classList.remove('bg-gray-900');
            btnAvan.classList.add('bg-gray-300', 'cursor-not-allowed');
            cardAvan.classList.add('locked');
            var progAvan = cardAvan.querySelector('.unlock-progress');
            if (!progAvan) {
                progAvan = document.createElement('p');
                progAvan.className = 'unlock-progress text-[9px] font-bold text-red-500 mt-2 uppercase';
                btnAvan.parentNode.insertBefore(progAvan, btnAvan.nextSibling);
            }
            progAvan.textContent = 'Bloqueado. Requieres 70% de precisión en nivel Intermedio.';
        }

        document.getElementById('subjects-screen').classList.add('hidden');
        document.getElementById('levels-screen').classList.remove('hidden');
    };

    app.getStudentGrade = function() {
        var userRaw = localStorage.getItem('currentUser');
        if (!userRaw) return 10;
        var user = JSON.parse(userRaw);
        return app.parseGrade(user.grado);
    };

    app.getSubjectLabel = function(name) {
        if (name.indexOf("Informatica") !== -1) return "Fundamentos";
        if (name.indexOf("Programacion") !== -1) return "Lógica y Código";
        if (name.indexOf("Diseno Web") !== -1) return "Frontend & UI";
        return "Academia";
    };

    // --- Quiz Logic ---
    app.selectLevel = function(level) {
        allPresentationQuestions = [];
        currentQuizQuestions = [];
        incorrectAnswers = [];
        selectedDifficulty = level;
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen()["catch"](function(e) { console.warn("FS failed", e); });
        }
        if (QuizProApp.requestWakeLock) QuizProApp.requestWakeLock();
        app.startQuiz();
    };

    app.startQuiz = function() {
        document.getElementById('levels-screen').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');

        app.loadQuestions().then(function() {
            if (allPresentationQuestions.length === 0) {
                alert('No hay preguntas disponibles para estos criterios.');
                location.reload();
                return;
            }

            var reinforcementIds = JSON.parse(localStorage.getItem('quizpro_reinforcement') || "[]");
            var reinforcementQuestions = allPresentationQuestions.filter(function(q) { return reinforcementIds.indexOf(q.id) !== -1; });
            var seenIds = JSON.parse(localStorage.getItem(SEEN_QUESTIONS_KEY) || "[]");
            var freshQuestions = allPresentationQuestions.filter(function(q) { return (seenIds.indexOf(q.id) === -1) && (reinforcementIds.indexOf(q.id) === -1); });

            if (freshQuestions.length < 5) {
                freshQuestions = allPresentationQuestions.filter(function(q) { return reinforcementIds.indexOf(q.id) === -1; });
            }

            var pool = app.shuffleArray(reinforcementQuestions).concat(app.shuffleArray(freshQuestions));
            if (pool.length < 1) pool = allPresentationQuestions;

            var groupedBySource = {};
            freshQuestions.forEach(function(q) {
                if (!groupedBySource[q.source]) groupedBySource[q.source] = [];
                groupedBySource[q.source].push(q);
            });

            var groupKeys = Object.keys(groupedBySource);
            for (var i = 0; i < groupKeys.length; i++) {
                groupedBySource[groupKeys[i]] = app.shuffleArray(groupedBySource[groupKeys[i]]);
            }

            var interleaved = [];
            var sources = Object.keys(groupedBySource);
            var totalAdded = 0;
            while (totalAdded < freshQuestions.length) {
                for (var j = 0; j < sources.length; j++) {
                    var src = sources[j];
                    if (groupedBySource[src].length > 0) { interleaved.push(groupedBySource[src].shift()); totalAdded++; }
                }
            }

            var candidates = interleaved.length > 0 ? interleaved : pool;
            currentQuizQuestions = candidates
                .map(function(q) { return app.normalizeQuestion(q); })
                .filter(function(q) {
                    var qLevel = app.getStandardLevelName(q.nivel || selectedDifficulty);
                    var targetLevel = app.getStandardLevelName(selectedDifficulty);
                    if (qLevel !== targetLevel) return false;
                    var validation = app.validateQuestion(q);
                    return validation.valid;
                })
                .slice(0, (selectedDifficulty.toLowerCase() === 'basico' ? 30 : 15));

            currentIndex = 0; score = 0; timerSeconds = 0; currentStreak = 0; sessionXP = 0;
            incorrectAnswers = []; lastCorrectIndex = -1;
            app.startTimer();
            app.showQuestion();
        });
    };

    app.loadQuestions = function() {
        allPresentationQuestions = [];
        var gradeNum = app.parseGrade(selectedGrado);
        var gradeFolder = gradeNum === 10 ? 'Decimo' : (gradeNum === 11 ? 'Undecimo' : 'Duodecimo');

        var mapping = {
            'Informática': 'Informatica', 'Informática Aplicada': 'Informatica_Aplicada',
            'Diseño Web': 'Diseno_Web', 'Programación': 'Programacion',
            'Análisis y Diseño': 'Analisis_Diseno', 'Ofimática': 'Ofimatica',
            'Informática I': 'Informatica', 'Programación II': 'Programacion_2',
            'Programación Orientada a Objetos': 'Programacion_Orientada_a_Objetos'
        };
        var asignaturaFolder = mapping[selectedAsignatura] || selectedAsignatura.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
        var rawLevel = app.getStandardLevelName(selectedDifficulty);
        var levelFile = rawLevel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + '.json';

        var isRoot = window.location.pathname.indexOf('/juegos/') === -1;
        var pathPrefix = isRoot ? '' : '../';
        var path = pathPrefix + "js/Banco_Preguntas/" + gradeFolder + "/" + asignaturaFolder + "/" + levelFile;

        return fetch(path)
            .then(function(res) { if (res.ok) return res.json(); throw new Error("404"); })
            .then(function(data) { if (data && data.length > 0) allPresentationQuestions = app.transformBankQuestions(data); })
            ["catch"](function(e) { console.error("[QuizPro] Path failed: " + path); });
    };

    app.transformBankQuestions = function(data) {
        var bankQuestions = data.map(function(rawQ) {
            var q = app.normalizeQuestion(rawQ);
            var type = q.tipo_pregunta || q.TipoActividad || "Selección múltiple";
            var questionText = q.enunciado || q.Pregunta;
            var answer = q.respuesta_correcta_literal || q.RespuestaCorrecta;
            var options = (q.opciones_visibles && q.opciones_visibles.length > 0) ? q.opciones_visibles : [q.OpcionA, q.OpcionB, q.OpcionC, q.OpcionD].filter(function(o) { return o && o.trim() !== ""; });
            var items = q.items || [];
            var pairs = (q.parejas && q.parejas.length > 0) ? q.parejas : [];
            if (pairs.length > 0 && pairs[0].clave) pairs = pairs.map(function(p) { return { term: p.clave, definition: p.valor }; });
            if (type === 'ordering' && items.length === 0) items = options;
            else if ((type === 'matching' || type === 'memory' || type === 'emparejamiento') && pairs.length === 0) {
                options.forEach(function(opt) {
                    if (opt.indexOf('|') !== -1) { var pts = opt.split('|'); pairs.push({ term: pts[0].trim(), definition: pts[1].trim() }); }
                });
            }
            return {
                id: q.id || q.PreguntaID || "bank_" + Math.random().toString(36).substr(2, 9),
                question: questionText, options: options, items: items, pairs: pairs, answer: answer, type: type,
                explanation: q.Explicacion || q.explicacion, image: q.Imagen || q.imagen, subject: q.Asignatura || q.asignatura,
                nivel: q.Nivel || q.nivel, tags: [q.Tema || q.tema || "General"]
            };
        });
        bankQuestions.forEach(function(q) {
            if (q.options.length < 4 && (q.type === "Selección múltiple" || q.type === "opcion_multiple")) {
                var sameTopic = bankQuestions.filter(function(other) { return other.id !== q.id && other.tags[0] === q.tags[0]; }).map(function(other) { return other.answer; });
                while (q.options.length < 4 && sameTopic.length > 0) {
                    var extra = sameTopic.shift(); if (q.options.indexOf(extra) === -1) q.options.push(extra);
                }
            }
        });
        return bankQuestions;
    };

    app.showQuestion = function() {
        var q = currentQuizQuestions[currentIndex];
        if (!q) return;
        questionStartTime = Date.now();
        responseChanges = 0;
        var feedback = document.getElementById('feedback-msg');
        feedback.textContent = '';
        document.getElementById('progress-text').textContent = (currentIndex + 1) + " / " + currentQuizQuestions.length;
        document.getElementById('progress-bar').style.width = (((currentIndex + 1) / currentQuizQuestions.length) * 100) + "%";
        document.getElementById('question-text').innerHTML = q.question;

        var existingImg = document.getElementById('question-image');
        if (existingImg) existingImg.parentNode.removeChild(existingImg);
        if (q.image) {
            var img = document.createElement('img');
            img.id = 'question-image';
            img.src = QuizProApp.convertDriveLink ? QuizProApp.convertDriveLink(q.image) : q.image;
            img.className = 'quiz-image rounded-xl shadow-md mb-6 transition-all hover:scale-105';
            var qTextEl = document.getElementById('question-text');
            qTextEl.parentNode.insertBefore(img, qTextEl.nextSibling);
        }

        var optCont = document.getElementById('options-container');
        var fibCont = document.getElementById('fib-container');
        var matchCont = document.getElementById('matching-container');
        optCont.innerHTML = ''; optCont.classList.add('hidden'); fibCont.classList.add('hidden'); matchCont.classList.add('hidden');

        var input = document.getElementById('fib-input');
        if (input) { input.disabled = false; input.value = ''; input.onkeydown = function(e) { if(e.key === 'Enter') app.submitFib(); }; }

        if (q.type === 'practice' || q.type === 'funcionalidad') {
            optCont.classList.remove('hidden');
            var codeEl = document.createElement('div'); codeEl.className = 'bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs mb-6 overflow-x-auto whitespace-pre';
            codeEl.textContent = q.code; optCont.appendChild(codeEl);
            app.getBalancedOptions(q.options, q.answer).forEach(function(opt) {
                var btn = document.createElement('button'); btn.className = 'option-card w-full p-4 text-left border-2 border-gray-100 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all';
                btn.innerText = opt; btn.onclick = function() { app.checkAnswer(opt, q.answer, btn); }; optCont.appendChild(btn);
            });
        } else if (q.type === 'transcription') {
            fibCont.classList.remove('hidden');
            var targetEl = document.createElement('div'); targetEl.className = 'bg-blue-50 text-blue-800 p-4 rounded-xl italic text-sm mb-6 border border-blue-100 transcription-target';
            targetEl.textContent = q.targetText || q.answer || "Error"; targetEl.oncontextmenu = function(e) { e.preventDefault(); };
            var oldTargets = fibCont.querySelectorAll('.transcription-target');
            for (var i = 0; i < oldTargets.length; i++) oldTargets[i].parentNode.removeChild(oldTargets[i]);
            fibCont.insertBefore(targetEl, fibCont.firstChild);
            var fibIn = document.getElementById('fib-input');
            if (fibIn) { fibIn.placeholder = "Escribe aquí..."; fibIn.disabled = false; setTimeout(function() { fibIn.focus(); }, 500); }
        } else if (q.type === 'verdadero_falso') {
            optCont.classList.remove('hidden');
            ["Verdadero", "Falso"].forEach(function(opt) {
                var btn = document.createElement('button'); btn.className = 'option-card w-full p-6 text-center border-2 border-gray-100 rounded-2xl font-black text-gray-700 bg-white hover:bg-blue-50 transition-all uppercase tracking-widest text-sm';
                btn.innerText = opt; btn.onclick = function() { var val = (String(q.answer).toLowerCase().indexOf('v') === 0) ? opt : (opt === "Verdadero" ? "A" : "B"); app.checkAnswer(val, q.answer, btn); }; optCont.appendChild(btn);
            });
        } else if (q.type === 'memory') {
            matchCont.classList.remove('hidden');
            var pairsList = document.getElementById('matching-pairs');
            pairsList.innerHTML = '<div class="bg-blue-600/5 p-6 rounded-[2.5rem] border border-blue-100 mb-6"><div class="flex items-center justify-between mb-4"><p class="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Reto de Memoria</p><div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pares: <span id="matched-count" class="text-emerald-500">0</span> / ' + q.pairs.length + '</div></div><div class="memory-grid" id="memory-grid"></div></div>';
            var grid = document.getElementById('memory-grid');
            var icon = "fa-brain";
            var items = app.shuffleArray(q.pairs.map(function(p) { return {v: p.term, k: p.term}; }).concat(q.pairs.map(function(p) { return {v: p.definition, k: p.term}; })));
            var selCards = []; var matchedCount = 0;
            items.forEach(function(item) {
                var card = document.createElement('div'); card.className = 'memory-card group';
                card.innerHTML = '<div class="memory-card-inner shadow-lg"><div class="memory-card-front bg-slate-50 border-2 border-slate-200 rounded-2xl"><i class="fas ' + icon + ' text-blue-500/40 text-2xl"></i></div><div class="memory-card-back bg-white border-2 border-blue-500 rounded-2xl"><span class="text-[10px] font-bold text-gray-800 uppercase">' + item.v + '</span></div></div>';
                card.onclick = function() {
                    if (selCards.length < 2 && !card.classList.contains('revealed') && !card.classList.contains('matched')) {
                        card.classList.add('revealed'); selCards.push({card: card, item: item});
                        if (selCards.length === 2) {
                            if (selCards[0].item.k === selCards[1].item.k) {
                                setTimeout(function() {
                                    selCards.forEach(function(c) { c.card.classList.add('matched'); var b = c.card.querySelector('.memory-card-back'); b.classList.add('border-emerald-500', 'bg-emerald-50'); });
                                    matchedCount++; document.getElementById('matched-count').textContent = matchedCount; score += (1/q.pairs.length); selCards = [];
                                    if (matchedCount === q.pairs.length) { var f = document.getElementById('finish-memory-btn'); f.classList.add('bg-emerald-600', 'animate-bounce'); f.textContent = "¡Completado!"; }
                                }, 400);
                            } else { setTimeout(function() { selCards.forEach(function(c) { c.card.classList.remove('revealed'); }); selCards = []; }, 800); }
                        }
                    }
                };
                grid.appendChild(card);
            });
            var finishMemoryBtn = document.createElement('button'); finishMemoryBtn.id = 'finish-memory-btn'; finishMemoryBtn.className = 'w-full py-5 bg-gray-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl';
            finishMemoryBtn.textContent = "Validar Memoria"; finishMemoryBtn.onclick = function() { if (matchedCount === q.pairs.length) { currentIndex++; if(currentIndex < currentQuizQuestions.length) app.showQuestion(); else app.endQuiz(); } else alert("Encuentra todos los pares."); };
            matchCont.appendChild(finishMemoryBtn);
        } else {
            optCont.classList.remove('hidden');
            app.getBalancedOptions(q.options, q.answer).forEach(function(opt) {
                var btn = document.createElement('button'); btn.className = 'option-card w-full p-4 text-left border-2 border-gray-100 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all';
                btn.innerText = opt; btn.onclick = function() { app.checkAnswer(opt, q.answer, btn); }; optCont.appendChild(btn);
            });
        }
        app.registerSeenQuestion(q.id);
    };

    app.checkAnswer = function(selected, correct, btn) {
        if (QuizProApp.isProcessingAnswer) return; app.isProcessingAnswer = true;
        var responseTime = Date.now() - questionStartTime;
        var q = app.normalizeQuestion(currentQuizQuestions[currentIndex]);
        var finalCorrect = correct || q.respuestaCorrecta || "N/A";

        if (QuizProApp.GamesAdapter) {
            QuizProApp.GamesAdapter.recordAction({ asignatura: selectedAsignatura, nivel: app.getStandardLevelName(selectedDifficulty), preguntaId: q.id, tema: (q.tags && q.tags.length > 0) ? q.tags[0] : 'General', respuestaSeleccionada: selected, respuestaCorrecta: finalCorrect, esCorrecta: String(selected).trim().toLowerCase() === String(finalCorrect).trim().toLowerCase(), tiempoRespuesta: responseTime, cambiosRespuesta: responseChanges });
        }

        var allBtns = document.querySelectorAll('.option-card'); var input = document.getElementById('fib-input');
        for (var i = 0; i < allBtns.length; i++) allBtns[i].disabled = true; if(input) input.disabled = true;
        var feedback = document.getElementById('feedback-msg');
        var isCorrect = (q.type === 'transcription') ? (String(selected).trim() === String(correct).trim()) : (String(selected).trim().toLowerCase() === String(correct).trim().toLowerCase());

        if (isCorrect) {
            var xpGained = app.calculateXP(true, selectedDifficulty, responseTime); sessionXP += xpGained;
            var reIds = JSON.parse(localStorage.getItem('quizpro_reinforcement') || "[]");
            if (reIds.indexOf(q.id) !== -1) { localStorage.setItem('quizpro_reinforcement', JSON.stringify(reIds.filter(function(id) { return id !== q.id; }))); }
            if (btn) btn.classList.add('correct', 'border-emerald-500', 'bg-emerald-50');
            feedback.className = 'text-center h-8 font-bold text-emerald-500'; feedback.textContent = "¡Correcto! +" + xpGained + " XP"; score++;
        } else {
            app.calculateXP(false);
            var reIdsFail = JSON.parse(localStorage.getItem('quizpro_reinforcement') || "[]");
            if (reIdsFail.indexOf(q.id) === -1) { reIdsFail.push(q.id); localStorage.setItem('quizpro_reinforcement', JSON.stringify(reIdsFail)); }
            if (btn) btn.classList.add('incorrect', 'border-red-500', 'bg-red-50');
            feedback.className = 'text-center h-8 font-bold text-red-500'; feedback.textContent = "Incorrecto. Era: " + finalCorrect; incorrectAnswers.push(q);
        }
        document.getElementById('score').textContent = score + " / " + (currentIndex + 1);
        localStorage.setItem("attempts_" + q.id, parseInt(localStorage.getItem("attempts_" + q.id) || '0') + 1);
        setTimeout(function() { app.isProcessingAnswer = false; currentIndex++; if (currentIndex < currentQuizQuestions.length) app.showQuestion(); else app.endQuiz(); }, 1200);
    };

    app.calculateXP = function(isCorrect, level, responseTime) {
        if (!isCorrect) { currentStreak = 0; return 0; }
        currentStreak++;
        var fDif = XP_CONFIG.FACTORS[level.toLowerCase()] || 1.0;
        var fTime = 1.0;
        if (responseTime < XP_CONFIG.TIME.MIN) fTime = 0.5;
        else if (responseTime <= XP_CONFIG.TIME.OPTIMAL) fTime = 1.2;
        else { var ov = responseTime - XP_CONFIG.TIME.OPTIMAL; var win = XP_CONFIG.TIME.MAX - XP_CONFIG.TIME.OPTIMAL; fTime = Math.max(0.8, 1.2 - (ov/win) * 0.4); }
        var bono = Math.min(XP_CONFIG.STREAK.MAX, 1.0 + (currentStreak * XP_CONFIG.STREAK.BONUS_PER_HIT));
        var q = currentQuizQuestions[currentIndex];
        var attempts = parseInt(localStorage.getItem("attempts_" + q.id) || '0');
        var multi = (attempts === 1) ? 0.75 : (attempts === 2 ? 0.5 : (attempts >= 3 ? 0.25 : 1.0));
        var total = Math.round(XP_CONFIG.BASE * fDif * fTime * bono * multi);
        var xpKey = "xp_" + selectedAsignatura + "_" + selectedGrado;
        var currentTotal = parseInt(localStorage.getItem(xpKey) || '0');
        if (level.toLowerCase() === 'basico' && currentTotal >= 1500) return 0;
        return total;
    };

    app.endQuiz = function() {
        clearInterval(timerInterval);
        document.getElementById('quiz-screen').classList.add('hidden');
        document.getElementById('result-screen').classList.remove('hidden');
        var finalPercent = Math.round((score / currentQuizQuestions.length) * 100);
        var approved = finalPercent >= 70;
        document.getElementById('final-score').textContent = finalPercent + "%";
        var xpKey = "xp_" + selectedAsignatura + "_" + selectedGrado;
        var newXP = parseInt(localStorage.getItem(xpKey) || '0') + sessionXP;
        localStorage.setItem(xpKey, newXP);

        var lvlName = app.getStandardLevelName(selectedDifficulty);
        var statKey = "QuizPro_" + selectedAsignatura + "_" + selectedGrado + "_" + lvlName;
        var existing = QuizProApp.userGameStats[statKey] || {};
        QuizProApp.userGameStats[statKey] = { subject: selectedAsignatura, level: lvlName, grade: selectedGrado, maxScore: Math.max(finalPercent, existing.maxScore || 0), totalAttempts: (existing.totalAttempts || 0) + 1, date: new Date().toISOString() };

        if (lvlName === 'Básico' && approved) {
            var lState = JSON.parse(localStorage.getItem('levels_state') || '{"intermedio": {"bloqueado": true}}');
            lState.intermedio.bloqueado = false; localStorage.setItem('levels_state', JSON.stringify(lState));
        }

        if (QuizProApp.PersistenceManager) {
            QuizProApp.PersistenceManager.get('academic_stats').then(function(c) {
                if (c && c.data) { var u = c.data; u.data = QuizProApp.userGameStats; QuizProApp.PersistenceManager.set('academic_stats', u); }
                else QuizProApp.PersistenceManager.set('academic_stats', QuizProApp.userGameStats);
            });
        }

        if (app.fetchApi) {
            var userRaw = localStorage.getItem('currentUser');
            var user = userRaw ? JSON.parse(userRaw) : null;
            if (user) {
                var payload = { userId: user.userId, nombreAlumno: user.nombre, juego: "QuizPro", asignatura: selectedAsignatura, puntaje: finalPercent, nivel: lvlName, grado: selectedGrado, xpGanada: sessionXP, fecha_logro: new Date().toISOString() };
                app.fetchApi('USER', 'saveGameResult', payload).then(function(res) {
                    if (res.status === 'success' && res.updatedStats) {
                        for (var k in res.updatedStats) QuizProApp.userGameStats[k] = res.updatedStats[k];
                        app.loadPerformanceTable();
                    }
                });
            }
        }
    };

    app.loadPerformanceTable = function() {
        var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (!userRaw) return;
        var user = JSON.parse(userRaw);
        var attemptFetch = function() {
            return app.fetchApi('USER', 'getGameStats', { userId: user.userId }, 0, { store: 'academic_stats', onUpdate: app.renderPerformanceHTML });
        };
        if (QuizProApp.PersistenceManager) {
            QuizProApp.PersistenceManager.get('academic_stats').then(function(c) {
                if (c && c.data) { app.renderPerformanceHTML(c.data); attemptFetch(); } else attemptFetch();
            });
        } else attemptFetch();
    };

    app.renderPerformanceHTML = function(res) {
        var container = document.getElementById('performance-table-body');
        if (!container) return;
        app.userGameStats = res.data || (res.id ? null : res) || {};
        var approvedCount = 0;
        var statsEntries = [];
        for (var k in QuizProApp.userGameStats) { if (k.indexOf('QuizPro_') === 0) statsEntries.push(QuizProApp.userGameStats[k]); }
        container.innerHTML = statsEntries.map(function(s) {
            if (s.maxScore >= 70) approvedCount++;
            return '<tr class="border-b border-gray-50 text-[11px]"><td class="py-3 font-bold text-gray-700">' + app.getSanitizedAcademicText(s.subject) + '</td><td class="py-3 capitalize text-blue-600 font-semibold">' + app.getSanitizedAcademicText(s.level) + ' (' + app.getSanitizedAcademicText(s.grade) + ')</td><td class="py-3 font-black text-gray-900">' + s.maxScore + '%</td></tr>';
        }).join('');
        var approvedEl = document.getElementById('total-approvals'); if (approvedEl) approvedEl.textContent = approvedCount;
        if (statsEntries.length > 0) { var d = document.getElementById('performance-dashboard'); if (d) d.classList.remove('hidden'); }
    };

    app.loadGlobalTop = function() {
        var body = document.getElementById('global-top-body');
        if (!body) return;
        var attemptFetch = function() {
            return app.fetchApi('USER', 'getGlobalTop', { gameId: 'quizpro' }, 0, { store: 'rankings', onUpdate: app.renderGlobalTopHTML }).then(app.renderGlobalTopHTML);
        };
        if (QuizProApp.PersistenceManager) {
            QuizProApp.PersistenceManager.get('rankings').then(function(c) { if (c && c.data) { app.renderGlobalTopHTML(c.data); attemptFetch(); } else attemptFetch(); });
        } else attemptFetch();
    };

    app.renderGlobalTopHTML = function(res) {
        var body = document.getElementById('global-top-body');
        if (!body || !res || !res.global) return;
        var filtered = res.global.filter(function(u) { return u && (u.nombre || u.username); });
        body.innerHTML = filtered.map(function(u, i) {
            return '<tr class="hover:bg-blue-50/30 transition-colors"><td class="px-6 py-4"><p class="font-bold text-gray-900">' + (u.nombre || u.username) + '</p></td><td class="px-6 py-4 text-right"><span class="text-sm font-black">' + (u.promedio || 0) + '%</span></td><td class="px-6 py-4 text-right"><span class="text-[10px] font-bold text-gray-500">' + (u.xp || 0).toLocaleString() + '</span></td></tr>';
        }).join('');
    };

    app.shuffleArray = function(a) {
        var r = a.slice();
        for (var i = r.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = r[i]; r[i] = r[j]; r[j] = t; }
        return r;
    };

    app.startTimer = function() {
        timerInterval = setInterval(function() {
            timerSeconds++; var m = Math.floor(timerSeconds/60).toString(); if (m.length < 2) m = "0" + m;
            var s = (timerSeconds%60).toString(); if (s.length < 2) s = "0" + s;
            var tEl = document.getElementById('timer'); if (tEl) tEl.textContent = m + ":" + s;
        }, 1000);
    };

    app.registerSeenQuestion = function(id) {
        var seen = JSON.parse(localStorage.getItem(SEEN_QUESTIONS_KEY) || "[]");
        if (seen.indexOf(id) === -1) { seen.push(id); if (seen.length > SEEN_LIMIT) seen.shift(); localStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(seen)); }
    };

    app.getBalancedOptions = function(options, correct) {
        var shuffled = app.shuffleArray(options);
        var correctIdx = shuffled.indexOf(correct);
        var attempts = 0;
        while (correctIdx === lastCorrectIndex && attempts < 5) {
            shuffled = app.shuffleArray(options);
            correctIdx = shuffled.indexOf(correct);
            attempts++;
        }
        lastCorrectIndex = correctIdx;
        return shuffled;
    };

    // Public Aliases for HTML
    app.navigateToSubjects = app.navigateToSubjects;
    app.navigateToLevels = app.navigateToLevels;
    QuizProApp.selectLevel = app.selectLevel;
    app.initQuizPro = app.initQuizPro;
    app.backToHome = function() { document.getElementById('subjects-screen').classList.add('hidden'); document.getElementById('home-screen').classList.remove('hidden'); };
    app.backToSubjects = function() { document.getElementById('levels-screen').classList.add('hidden'); document.getElementById('subjects-screen').classList.remove('hidden'); };
    window.exitGame = function() { window.location.href = '../index.html'; };

})(QuizProApp);
