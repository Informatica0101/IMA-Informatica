/**
 * UI Logic for index.html
 * ES5 Compliance Mandatory.
 */

document.addEventListener('DOMContentLoaded', function() {
    // REQ: Priorización de Carga (Ticket 4)
    loadNews();

    // Setup Common UI (Header, Scroll, Logout)
    if (window.setupCommonUI) window.setupCommonUI();
    if (window.renderCommonNav) window.renderCommonNav();

    // --- DOM Elements specific to index.html ---
    var contentDisplayArea = document.getElementById('content-display-area');
    var contentBackButtonContainer = document.getElementById('content-back-button-container');
    var contentBackButton = document.getElementById('content-back-button');

    var mainContentSections = document.getElementById('main-content-sections');
    var mainContentTitle = document.getElementById('main-content-title');
    var showActivitiesButton = document.getElementById('show-activities-button');
    var initialActivityMenu = document.getElementById('initial-activity-menu');
    var gameListMenu = document.getElementById('game-list-menu');
    var backToMainActivitiesButton = document.getElementById('back-to-main-activities-button');
    var dynamicallyLoadedGameContainer = document.getElementById('dynamically-loaded-game-container');

    // --- State Variables ---
    var currentContentView = 'initial';

    // --- Utility Functions ---
    function createCustomButton(text, onClickHandler, className) {
        className = className || '';
        var button = document.createElement('button');
        button.textContent = text;
        button.onclick = onClickHandler;
        button.className = 'px-6 py-3 rounded-xl font-medium text-sm uppercase tracking-widest ' +
            'bg-blue-600 text-white hover:bg-blue-700 ' +
            'transition-all duration-300 ease-in-out ' +
            'shadow-lg shadow-blue-100 hover:shadow-xl hover:shadow-blue-200 transform hover:-translate-y-0.5 ' +
            'focus:outline-none focus:ring-4 focus:ring-blue-300 ' +
            className;
        return button;
    }

    function animateContentTransition(callback) {
        contentDisplayArea.classList.add('animate-fade-out-up');
        var onOutEnd = function() {
            contentDisplayArea.removeEventListener('animationend', onOutEnd);
            contentDisplayArea.classList.remove('animate-fade-out-up');
            contentDisplayArea.innerHTML = '';
            callback();
            contentDisplayArea.classList.add('animate-fade-in-down');
            var onInEnd = function() {
                contentDisplayArea.removeEventListener('animationend', onInEnd);
                contentDisplayArea.classList.remove('animate-fade-in-down');
            };
            contentDisplayArea.addEventListener('animationend', onInEnd);
        };
        contentDisplayArea.addEventListener('animationend', onOutEnd);
    }


    // --- Content Section Logic ---
    window.renderInitialContentButton = function() {
        if (!contentDisplayArea || !contentBackButtonContainer) return;
        contentBackButtonContainer.classList.add('hidden');
        contentDisplayArea.innerHTML = '';
        contentDisplayArea.appendChild(createCustomButton('Ver Recursos Académicos', function() { window.renderDownloadGrades(); }));
        currentContentView = 'initial';
    };

    window.renderDownloadGrades = function(pushState) {
        if (pushState === undefined) pushState = true;
        if (!contentDisplayArea || !contentBackButtonContainer) return;
        contentBackButtonContainer.classList.add('hidden');

        var currentUserRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
        var isProfesor = currentUser && currentUser.rol === 'Profesor';

        if (!window.downloadContentData || window.downloadContentData.length === 0) {
            contentDisplayArea.innerHTML = '<p class="text-gray-400 text-sm">No hay contenidos cargados.</p>';
            return;
        }

        var filteredGrades = [];
        for (var i = 0; i < window.downloadContentData.length; i++) {
            var gradeData = window.downloadContentData[i];
            if (!isProfesor && currentUser && currentUser.grado) {
                if (window.parseGrade(gradeData.grade) === window.parseGrade(currentUser.grado)) {
                    filteredGrades.push(gradeData);
                }
            } else {
                filteredGrades.push(gradeData);
            }
        }

        if (pushState && !isProfesor && filteredGrades.length === 1) {
            window.selectedGradeData = filteredGrades[0];
            window.renderDownloadSubjects(pushState);
            return;
        }

        if (pushState) history.pushState({ type: 'index-content', view: 'grades' }, '');

        contentDisplayArea.innerHTML = '';
        var gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg';

        for (var j = 0; j < filteredGrades.length; j++) {
            (function(gd) {
                gridDiv.appendChild(createCustomButton(gd.grade, function() {
                    window.selectedGradeData = gd;
                    if (isProfesor) animateContentTransition(window.renderDownloadSections);
                    else animateContentTransition(window.renderDownloadSubjects);
                }, 'w-full bg-gray-100 text-gray-800 shadow-none hover:bg-blue-600 hover:text-white'));
            })(filteredGrades[j]);
        }

        if (gridDiv.children.length === 0) contentDisplayArea.innerHTML = '<p class="text-gray-400 text-sm">No hay contenidos disponibles.</p>';
        else contentDisplayArea.appendChild(gridDiv);
        currentContentView = 'grades';
    };

    window.renderDownloadSections = function(pushState) {
        if (pushState === undefined) pushState = true;
        if (!contentDisplayArea || !contentBackButtonContainer) return;
        if (!window.selectedGradeData) return window.renderDownloadGrades();
        contentBackButtonContainer.classList.remove('hidden');

        if (pushState) history.pushState({ type: 'index-content', view: 'sections', gradeData: window.selectedGradeData }, '');

        contentDisplayArea.innerHTML = '';
        var gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg';

        var sectionSet = {};
        for (var i = 0; i < window.selectedGradeData.subjects.length; i++) {
            var s = window.selectedGradeData.subjects[i];
            var secs = [];
            if (Array.isArray(s.sections)) secs = s.sections;
            else if (s.sections) secs = s.sections.split(',').map(function(sec) { return sec.trim(); });

            for (var k = 0; k < secs.length; k++) {
                if (secs[k]) sectionSet[secs[k]] = true;
            }
        }
        var sections = Object.keys(sectionSet).sort();

        for (var j = 0; j < sections.length; j++) {
            (function(sec) {
                gridDiv.appendChild(createCustomButton("Sección " + sec, function() {
                    window.selectedSection = sec;
                    animateContentTransition(window.renderDownloadPartials);
                }, 'w-full bg-gray-100 text-gray-800 shadow-none hover:bg-blue-600 hover:text-white'));
            })(sections[j]);
        }

        if (sections.length === 0) contentDisplayArea.innerHTML = '<p class="text-gray-400 text-sm">No hay secciones registradas.</p>';
        else contentDisplayArea.appendChild(gridDiv);
        currentContentView = 'sections';
    };

    window.renderDownloadPartials = function(pushState) {
        if (pushState === undefined) pushState = true;
        if (!contentDisplayArea || !contentBackButtonContainer) return;
        if (!window.selectedSection) return window.renderDownloadSections();
        contentBackButtonContainer.classList.remove('hidden');

        if (pushState) history.pushState({ type: 'index-content', view: 'partials', section: window.selectedSection }, '');

        contentDisplayArea.innerHTML = '';
        var gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg';

        var partialSet = {};
        for (var i = 0; i < window.selectedGradeData.subjects.length; i++) {
            var sub = window.selectedGradeData.subjects[i];
            if (window.checkSectionHelper(sub.sections, window.selectedSection)) {
                if (sub.partial) partialSet[sub.partial] = true;
            }
        }
        var partials = Object.keys(partialSet);

        for (var j = 0; j < partials.length; j++) {
            (function(p) {
                gridDiv.appendChild(createCustomButton(p, function() {
                    window.selectedPartial = p;
                    animateContentTransition(window.renderDownloadSubjects);
                }, 'w-full bg-gray-100 text-gray-800 shadow-none hover:bg-blue-600 hover:text-white'));
            })(partials[j]);
        }

        if (partials.length === 0) contentDisplayArea.innerHTML = '<p class="text-gray-400 text-sm">No hay parciales con contenido.</p>';
        else contentDisplayArea.appendChild(gridDiv);
        currentContentView = 'partials';
    };

    window.renderDownloadSubjects = function(pushState) {
        if (pushState === undefined) pushState = true;
        if (!contentDisplayArea || !contentBackButtonContainer) return;
        if (!window.selectedGradeData) return window.renderDownloadGrades();

        var currentUserRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
        var isProfesor = currentUser && currentUser.rol === 'Profesor';

        if (isProfesor || !(currentUser && currentUser.grado)) {
            contentBackButtonContainer.classList.remove('hidden');
        } else {
            contentBackButtonContainer.classList.add('hidden');
        }

        if (pushState) {
            history.pushState({
                type: 'index-content',
                view: 'subjects',
                gradeData: window.selectedGradeData,
                section: window.selectedSection,
                partial: window.selectedPartial
            }, '');
        }

        var gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg';
        contentDisplayArea.innerHTML = '';

        for (var i = 0; i < window.selectedGradeData.subjects.length; i++) {
            var subjectData = window.selectedGradeData.subjects[i];
            var targetSection = isProfesor ? window.selectedSection : (currentUser ? currentUser.seccion : null);
            var targetPartial = isProfesor ? window.selectedPartial : window.PARCIAL_ACTUAL;

            if (isProfesor) {
                if (subjectData.partial !== targetPartial) continue;
            } else {
                var isAuthorized = window.isContentAuthorized ? window.isContentAuthorized(subjectData.partial) : (subjectData.partial === targetPartial);
                if (!isAuthorized) continue;
            }

            if (targetSection && subjectData.sections) {
                if (!window.checkSectionHelper(subjectData.sections, targetSection)) continue;
            }

            (function(sd) {
                gridDiv.appendChild(createCustomButton(sd.name, function() {
                    window.selectedSubjectData = sd;
                    animateContentTransition(window.renderDownloadTopics);
                }, 'w-full bg-gray-100 text-gray-800 shadow-none hover:bg-blue-600 hover:text-white'));
            })(subjectData);
        }

        if (gridDiv.children.length === 0) {
            contentDisplayArea.innerHTML = '<p class="text-gray-400 text-sm">No hay contenidos para los filtros seleccionados.</p>';
        } else {
            contentDisplayArea.appendChild(gridDiv);
        }
        currentContentView = 'subjects';
    };

    window.renderDownloadTopics = function(pushState) {
        if (pushState === undefined) pushState = true;
        if (!contentDisplayArea || !contentBackButtonContainer) return;
        if (!window.selectedSubjectData) return window.renderDownloadSubjects();
        contentBackButtonContainer.classList.remove('hidden');

        if (pushState) {
            history.pushState({ type: 'index-content', view: 'topics', subjectData: window.selectedSubjectData }, '');
        }
        contentDisplayArea.innerHTML = '';
        var gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 gap-3 w-full max-w-lg';

        for (var i = 0; i < window.selectedSubjectData.topics.length; i++) {
            var topic = window.selectedSubjectData.topics[i];
            var link = document.createElement('a');
            link.href = topic.file;
            link.target = '_blank';
            link.className = 'flex items-center justify-between px-6 py-4 rounded-2xl font-medium text-sm ' +
                'bg-gray-50 text-gray-800 border border-gray-100 ' +
                'transition-all duration-300 ease-in-out ' +
                'hover:bg-white hover:shadow-xl hover:border-blue-200 transform hover:-translate-y-0.5 ' +
                'focus:outline-none focus:ring-4 focus:ring-green-300 w-full group/link';

            link.innerHTML =
                '<span class="truncate pr-4">' + topic.title + '</span>' +
                '<span class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs group-hover/link:bg-blue-600 group-hover/link:text-white transition-colors">' +
                    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 10v6m0 0l3-3m-3 3l-3-3m0 6h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>' +
                '</span>';
            gridDiv.appendChild(link);
        }
        contentDisplayArea.appendChild(gridDiv);
        currentContentView = 'topics';
    };

    if (contentBackButton) {
        contentBackButton.addEventListener('click', function() {
            history.back();
        });
    }

    // --- Activities & Games Logic ---
    window.showMainContentSections = function(pushState) {
        if (pushState === undefined) pushState = true;
        if (!mainContentSections) return;
        mainContentSections.classList.remove('hidden');
        mainContentSections.classList.add('flex');
        dynamicallyLoadedGameContainer.classList.add('hidden');
        mainContentTitle.textContent = 'Contenido y Actividades';
        renderInitialActivityButton();
        window.scrollTo({ top: mainContentTitle.offsetTop - 100, behavior: 'smooth' });

        if (pushState) {
            history.pushState({ type: 'index-activities', view: 'main' }, '');
        }
    };

    function triageGameLaunch(gameId, html, js, initFn, title) {
        var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var user = userRaw ? JSON.parse(userRaw) : null;

        if (user) {
            return safeLoadGame(gameId, html, js, initFn, title);
        }

        var modal = document.getElementById('session-triage-modal');
        if (!modal) return safeLoadGame(gameId, html, js, initFn, title);

        modal.classList.remove('hidden');
        setTimeout(function() { modal.classList.add('opacity-100'); }, 10);

        var loginBtn = document.getElementById('triage-login-btn');
        var guestBtn = document.getElementById('triage-guest-btn');
        var closeBtn = document.getElementById('close-triage-modal');

        var closeTriage = function() {
            modal.classList.remove('opacity-100');
            setTimeout(function() { modal.classList.add('hidden'); }, 300);
        };

        loginBtn.onclick = function() {
            var intent = {
                activityType: "minigame",
                activityId: gameId,
                html: html, js: js, initFn: initFn, title: title,
                timestamp: Date.now()
            };
            localStorage.setItem('quizpro_interrupted_intent', JSON.stringify(intent));
            window.location.href = 'login.html';
        };

        guestBtn.onclick = function() {
            closeTriage();
            safeLoadGame(gameId, html, js, initFn, title);
        };

        closeBtn.onclick = closeTriage;
    }

    function loadGame(gameId, htmlPath, jsPath, initFnName, title) {
        var wrapper = document.getElementById('main-content-wrapper');
        var mainHeader = document.getElementById('main-header');

        if (wrapper) wrapper.style.display = 'none';
        if (mainHeader) mainHeader.classList.add('header-hidden');

        var gameOverlay = document.getElementById('dedicated-game-overlay');
        if (!gameOverlay) {
            gameOverlay = document.createElement('div');
            gameOverlay.id = 'dedicated-game-overlay';
            gameOverlay.className = 'flex-grow w-full bg-white animate-fade-in';
            document.body.insertBefore(gameOverlay, document.querySelector('footer'));
        }
        gameOverlay.innerHTML = '<div class="flex items-center justify-center min-h-[60vh]"><i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i></div>';
        gameOverlay.style.display = 'block';

        fetch(htmlPath).then(function(response) {
            return response.text();
        }).then(function(html) {
            gameOverlay.innerHTML = html;

            var secScript = document.createElement('script');
            secScript.src = 'js/security-minigames.js?v=1';
            gameOverlay.appendChild(secScript);

            var script = document.createElement('script');
            script.src = jsPath;
            script.onload = function() {
                if (window[initFnName]) {
                    window[initFnName](window.gameDataStorage);
                }
            };
            gameOverlay.appendChild(script);
        }).catch(function(error) {
            console.error('Error loading game ' + gameId + ':', error);
            gameOverlay.innerHTML = '<p class="text-red-500 p-8 text-center">Error al cargar el juego. Por favor, inténtalo de nuevo.</p>';
            gameOverlay.appendChild(createCustomButton('Volver al Inicio', window.returnToMainContent, 'mt-4 mx-auto block'));
        });
    }

    function safeLoadGame(gameId, html, js, initFn, title) {
        if (!window.GamesAdapter) {
            var script = document.createElement('script');
            script.src = 'js/games-adapter.js';
            return new Promise(function(resolve) {
                script.onload = function() {
                    resolve(loadGame(gameId, html, js, initFn, title));
                };
                document.body.appendChild(script);
            });
        }
        return Promise.resolve(loadGame(gameId, html, js, initFn, title));
    }

    window.loadPeripheralsGame = function() { safeLoadGame('peripherals', 'juegos/perifericos.html', 'js/perifericos_juego.js', 'initializePeripheralsGame', 'Juego de Periféricos'); };
    window.loadWebMasterQuiz = function() { safeLoadGame('webmaster', 'juegos/webmaster_quiz.html', 'js/webmaster_quiz_juego.js', 'initQuizGame', 'WebMaster Quiz'); };
    window.loadQuizPro = function() { safeLoadGame('quizpro', 'juegos/quizpro.html', 'js/quizpro.js', 'initQuizPro', 'QuizPro'); };
    window.loadDexterityGame = function() { safeLoadGame('dexterity', 'juegos/destreza_teclado.html', 'js/destreza_teclado.js', 'initDexterityGame', 'Destreza en el Teclado'); };

    window.returnToMainContent = function() {
        var wrapper = document.getElementById('main-content-wrapper');
        var mainHeader = document.getElementById('main-header');
        var gameOverlay = document.getElementById('dedicated-game-overlay');

        if (gameOverlay) {
            gameOverlay.innerHTML = '';
            gameOverlay.style.display = 'none';
        }

        if (wrapper) wrapper.style.display = 'block';
        if (mainHeader) mainHeader.classList.remove('header-hidden');

        var scripts = ['js/perifericos_juego.js', 'js/webmaster_quiz_juego.js', 'js/destreza_teclado.js', 'js/quizpro.js'];
        for (var i = 0; i < scripts.length; i++) {
            var s = document.querySelector('script[src="' + scripts[i] + '"]');
            if (s) s.parentNode.removeChild(s);
        }

        window.showMainContentSections();
    };

    function renderInitialActivityButton() {
        if (!initialActivityMenu) return;
        initialActivityMenu.classList.remove('hidden');
        initialActivityMenu.classList.add('flex');
        gameListMenu.classList.add('hidden');
        gameListMenu.classList.remove('flex');
    }

    window.renderActivityList = function(pushState) {
        if (pushState === undefined) pushState = true;
        if (!initialActivityMenu || !gameListMenu || !mainContentTitle) return;
        initialActivityMenu.classList.add('hidden');
        initialActivityMenu.classList.remove('flex');
        gameListMenu.classList.remove('hidden');
        gameListMenu.classList.add('flex');
        mainContentTitle.textContent = 'Actividades';

        if (pushState) {
            history.pushState({ type: 'index-activities', view: 'list' }, '');
        }
    };

    if (showActivitiesButton) showActivitiesButton.addEventListener('click', window.renderActivityList);

    var pBtn = document.getElementById('select-peripherals-game-button');
    if (pBtn) pBtn.addEventListener('click', function() { triageGameLaunch('peripherals', 'juegos/perifericos.html', 'js/perifericos_juego.js', 'initializePeripheralsGame', 'Juego de Periféricos'); });

    var wBtn = document.getElementById('select-webmaster-quiz-button');
    if (wBtn) wBtn.addEventListener('click', function() { triageGameLaunch('webmaster', 'juegos/webmaster_quiz.html', 'js/webmaster_quiz_juego.js', 'initQuizGame', 'WebMaster Quiz'); });

    var qBtn = document.getElementById('select-quiz-pro-button');
    if (qBtn) qBtn.addEventListener('click', function() { triageGameLaunch('quizpro', 'juegos/quizpro.html', 'js/quizpro.js', 'initQuizPro', 'QuizPro'); });

    var dBtn = document.getElementById('select-dexterity-game-button');
    if (dBtn) dBtn.addEventListener('click', function() { triageGameLaunch('dexterity', 'juegos/destreza_teclado.html', 'js/destreza_teclado.js', 'initDexterityGame', 'Destreza en el Teclado'); });

    if (backToMainActivitiesButton) backToMainActivitiesButton.addEventListener('click', renderInitialActivityButton);

    // Game Storage
    window.gameDataStorage = {
        localStorageKey: 'gameProgressData',
        loadAllGameData: function() {
            try { return JSON.parse(localStorage.getItem(this.localStorageKey)) || {}; }
            catch (e) { return {}; }
        },
        saveGameSession: function(gameId, sessionData) {
            var all = this.loadAllGameData();
            if (!all[gameId]) all[gameId] = [];
            all[gameId].push(sessionData);
            localStorage.setItem(this.localStorageKey, JSON.stringify(all));
        }
    };

    // Set initial state for index navigation
    history.replaceState({ type: 'index-main' }, '');

    window.renderInitialContentButton();
    renderInitialActivityButton();
    setupGlobalAuth();

    // --- Welcome Message Logic ---
    window.renderWelcomeMessage = function() {
        var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var currentUser = userRaw ? JSON.parse(userRaw) : null;
        var welcomeBadge = document.getElementById('user-welcome-badge');
        if (currentUser && welcomeBadge && currentUser.nombre) {
            var firstName = currentUser.nombre.split(' ')[0];
            welcomeBadge.innerHTML =
                '<span class="relative flex h-2 w-2">' +
                    '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>' +
                    '<span class="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>' +
                '</span>' +
                'Bienvenido, ' + firstName;
            welcomeBadge.classList.remove('hidden');
        }
    };

    window.renderWelcomeMessage();

    // --- Handle Action from URL ---
    function processUrlAction() {
        var search = window.location.search;
        if (!search) return;
        var action = null, game = null;
        var pairs = search.substring(1).split('&');
        for (var i = 0; i < pairs.length; i++) {
            var p = pairs[i].split('=');
            if (p[0] === 'action') action = decodeURIComponent(p[1]);
            if (p[0] === 'loadGame') game = decodeURIComponent(p[1]);
        }

        if (action) {
            window.handleHeaderAction(action);
        }

        if (game) {
            switch(game) {
                case 'peripherals': triageGameLaunch('peripherals', 'juegos/perifericos.html', 'js/perifericos_juego.js', 'initializePeripheralsGame', 'Juego de Periféricos'); break;
                case 'webmaster': triageGameLaunch('webmaster', 'juegos/webmaster_quiz.html', 'js/webmaster_quiz_juego.js', 'initQuizGame', 'WebMaster Quiz'); break;
                case 'quizpro': triageGameLaunch('quizpro', 'juegos/quizpro.html', 'js/quizpro.js', 'initQuizPro', 'QuizPro'); break;
                case 'dexterity': triageGameLaunch('dexterity', 'juegos/destreza_teclado.html', 'js/destreza_teclado.js', 'initDexterityGame', 'Destreza en el Teclado'); break;
            }
        }
    }

    document.addEventListener('common-ui-ready', processUrlAction);

    // --- Guest Mode Logic ---
    var guestPromptModal = document.getElementById('guest-prompt-modal');
    var closeGuestModal = document.getElementById('close-guest-modal');

    document.addEventListener('guest-game-finished', function() {
        if (guestPromptModal) {
            guestPromptModal.classList.remove('hidden');
        }
    });

    if (closeGuestModal) {
        closeGuestModal.onclick = function() { guestPromptModal.classList.add('hidden'); };
    }

    // --- Mi Perfil ---
    var openProfileTrigger = document.getElementById('open-profile-btn');
    var profileModal = document.getElementById('profile-modal');
    var closeProfileModal = document.getElementById('close-profile-modal');

    if (openProfileTrigger) {
        openProfileTrigger.onclick = function() {
            var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            var user = userRaw ? JSON.parse(userRaw) : null;
            if (!user) return;
            document.getElementById('profile-nombre').value = user.nombre;
            document.getElementById('profile-email').value = user.email || '';
            document.getElementById('profile-telefono').value = user.telefono || '';

            var nlInput = document.getElementById('profile-numeroLista');
            var nlContainer = document.getElementById('profile-numeroLista-container');
            if (nlInput) nlInput.value = user.numeroLista || '';
            if (nlContainer) {
                if (user.rol === 'Profesor') nlContainer.classList.add('hidden');
                else nlContainer.classList.remove('hidden');
            }
            if (profileModal) profileModal.classList.remove('hidden');
        };
    }
    if (closeProfileModal) closeProfileModal.onclick = function() { profileModal.classList.add('hidden'); };
    var cancelProfileBtn = document.getElementById('cancel-profile-btn');
    if (cancelProfileBtn) cancelProfileBtn.onclick = function() { profileModal.classList.add('hidden'); };


    /**
     * Login Modal Logic
     */
    (function() {
        var loginModal = document.getElementById('login-modal');
        var loginModalContent = document.getElementById('login-modal-content');
        var closeLoginModal = document.getElementById('close-login-modal');
        var accessButtonContainer = document.getElementById('access-button-container');

        function openModal() {
            if (!loginModal) return;
            loginModal.classList.remove('opacity-0', 'pointer-events-none');
            if (loginModalContent) {
                loginModalContent.classList.remove('scale-95');
                loginModalContent.classList.add('scale-100');
            }
        }

        function closeModal() {
            if (!loginModal) return;
            loginModal.classList.add('opacity-0', 'pointer-events-none');
            if (loginModalContent) {
                loginModalContent.classList.remove('scale-100');
                loginModalContent.classList.add('scale-95');
            }
        }

        if (closeLoginModal) closeLoginModal.addEventListener('click', closeModal);
        if (loginModal) {
            loginModal.addEventListener('click', function(e) {
                if (e.target === loginModal) closeModal();
            });
        }

        function renderAccessButton() {
            if (!accessButtonContainer) return;
            var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            var currentUser = userRaw ? JSON.parse(userRaw) : null;
            accessButtonContainer.innerHTML = '';

            if (currentUser) {
                var portalBtn = document.createElement('a');
                portalBtn.href = currentUser.rol === 'Profesor' ? 'teacher-dashboard.html' : 'student-dashboard.html';
                portalBtn.className = 'px-10 py-5 rounded-2xl font-bold text-xl bg-blue-700 text-white hover:bg-blue-800 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1';
                portalBtn.textContent = 'Ir al Portal';
                portalBtn.setAttribute('aria-label', 'Ir a mi portal académico');
                accessButtonContainer.appendChild(portalBtn);
            } else {
                var loginBtn = document.createElement('button');
                loginBtn.className = 'px-10 py-5 rounded-2xl font-bold text-xl bg-blue-700 text-white hover:bg-blue-800 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1';
                loginBtn.textContent = 'Iniciar Sesión';
                loginBtn.setAttribute('aria-label', 'Abrir panel de inicio de sesión');
                loginBtn.addEventListener("click", openModal);
                accessButtonContainer.appendChild(loginBtn);
            }
        }

        renderAccessButton();
    })();

    /**
     * Global Authentication Helper
     */
    function setupGlobalAuth() {
        var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var currentUser = userRaw ? JSON.parse(userRaw) : null;
        var desktopPortalLink = document.getElementById('desktop-portal-link');
        var desktopCoursesNav = document.getElementById('desktop-courses-nav');
        var desktopResourcesNav = document.getElementById('desktop-resources-nav');
        var desktopUserMenu = document.getElementById('desktop-user-menu');
        var desktopLogoutBtn = document.getElementById('desktop-logout-btn');
        var downloadSection = document.getElementById('download-section');

        if (currentUser) {
            if (desktopPortalLink) desktopPortalLink.classList.add('hidden');
            if (desktopUserMenu) desktopUserMenu.classList.remove('hidden');

            if (desktopLogoutBtn) {
                desktopLogoutBtn.onclick = function() {
                    localStorage.removeItem('currentUser');
                    sessionStorage.removeItem('currentUser');
                    window.location.reload();
                };
            }
        } else {
            if (desktopCoursesNav) desktopCoursesNav.classList.add('hidden');
            if (desktopResourcesNav) desktopResourcesNav.classList.add('hidden');
            if (downloadSection) downloadSection.classList.add('hidden');
        }
    }

    /**
     * News System
     */
    function loadNews() {
        var newsSection = document.getElementById('news-section');
        var newsContainer = document.getElementById('news-container');
        if (!newsSection || !newsContainer) return;

        newsSection.classList.remove('hidden');

        var renderInitialSkeleton = function() {
            newsContainer.innerHTML =
                '<div class="bg-white rounded-[2rem] border border-gray-100 overflow-hidden animate-pulse">' +
                    '<div class="h-56 skeleton"></div>' +
                    '<div class="p-8 space-y-4">' +
                        '<div class="flex gap-2"><div class="skeleton h-4 w-16 rounded"></div><div class="skeleton h-4 w-24 rounded"></div></div>' +
                        '<div class="skeleton h-8 w-full rounded"></div>' +
                        '<div class="skeleton h-4 w-3/4 rounded"></div>' +
                        '<div class="skeleton h-4 w-1/2 rounded"></div>' +
                    '</div>' +
                '</div>';
        };

        if (window.PersistenceManager) {
            window.PersistenceManager.get('news').then(function(cached) {
                if (cached && cached.data && cached.data.length > 0) {
                    renderNewsHTML(cached.data);
                } else {
                    renderInitialSkeleton();
                }

                fetchApi('USER', 'getNews', {}, 0, {
                    store: 'news',
                    onUpdate: function(data) { renderNewsHTML(data); }
                }).then(function(res) {
                    if (!res || res.status !== 'success' || !res.data || res.data.length === 0) {
                        res = {
                            status: 'success',
                            data: [{
                                id: 'fallback_01',
                                titulo: 'Nuevo diseño de la Plataforma (31 may 2026)',
                                categoria: 'Académico',
                                fecha: '2026-05-31',
                                imagenUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
                                contenido: '<p>Hemos actualizado la plataforma con una interfaz más rápida, moderna y adaptada a dispositivos móviles. ¡Explora los nuevos minijuegos y el dashboard de analítica integral!</p>'
                            }]
                        };
                    }
                    if (res.status === 'success' && res.data && res.data.length > 0) {
                        renderNewsHTML(res.data);
                    }
                });
            });
        }
    }

    function renderNewsHTML(inputData) {
        var newsContainer = document.getElementById('news-container');
        var data = (inputData && inputData.status === 'success' && Array.isArray(inputData.data)) ? inputData.data : (Array.isArray(inputData) ? inputData : []);

        if (!newsContainer || data.length === 0) return;

        var newsToShow = data.slice(0, 3);
        var newsHtml = [];

        for (var i = 0; i < newsToShow.length; i++) {
            var n = newsToShow[i];
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = n.contenido;

            var excerpt = "";
            var paragraphs = tempDiv.querySelectorAll('p');

            if (paragraphs.length > 0) {
                for (var j = 0; j < paragraphs.length; j++) {
                    var p = paragraphs[j];
                    var text = p.innerText.trim();
                    if (text.length > 20) {
                        excerpt = text;
                        break;
                    }
                }
            }

            if (!excerpt) excerpt = tempDiv.innerText.trim();
            var limit = i === 0 ? 250 : 120;
            if (excerpt.length > limit) excerpt = excerpt.substring(0, limit) + "...";

            var imgUrl = (typeof window.convertDriveLink === 'function') ? window.convertDriveLink(n.imagenUrl) : n.imagenUrl;

            newsHtml.push(
                '<div class="' + (i === 0 ? 'md:col-span-2 lg:col-span-2' : '') + ' bg-white rounded-[2rem] border border-gray-100 overflow-hidden group hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 transition-all duration-500">' +
                    '<div class="' + (i === 0 ? 'flex flex-col md:flex-row h-full' : 'flex flex-col') + '">' +
                        (n.imagenUrl ?
                            '<div class="' + (i === 0 ? 'md:w-1/2 h-72 md:h-full' : 'h-56') + ' overflow-hidden">' +
                                '<img src="' + imgUrl + '" alt="' + n.titulo + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out">' +
                            '</div>' :
                            '<div class="' + (i === 0 ? 'md:w-1/2 h-72 md:h-full' : 'h-56') + ' bg-gray-50 flex items-center justify-center text-gray-200">' +
                                '<i class="fas fa-newspaper text-6xl"></i>' +
                            '</div>'
                        ) +
                        '<div class="p-8 ' + (i === 0 ? 'md:w-1/2 flex flex-col justify-center' : 'flex-grow flex flex-col') + '">' +
                            '<div class="flex items-center gap-3 mb-4">' +
                                '<span class="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">' + n.categoria + '</span>' +
                                '<span class="text-[10px] font-medium text-gray-300 uppercase tracking-wider">' + new Date(n.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + (n.hora ? ' • ' + n.hora.substring(0,5) : '') + '</span>' +
                            '</div>' +
                            '<h3 class="' + (i === 0 ? 'text-2xl md:text-3xl' : 'text-xl') + ' font-semibold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tighter">' + n.titulo + '</h3>' +
                            '<p class="text-gray-500 text-sm leading-relaxed mb-6 ' + (i === 0 ? 'line-clamp-4' : 'line-clamp-3') + ' font-medium">' + excerpt + '</p>' +
                            '<div class="mt-auto pt-6 border-t border-gray-50">' +
                                '<button onclick=\'window.showNewsDetail(' + JSON.stringify(n).replace(/'/g, "&apos;") + ')\' class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-800 transition-all">' +
                                    'Seguir Leyendo' +
                                    '<svg class="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>' +
                                '</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );
        }

        newsContainer.innerHTML = newsHtml.join('');
    }

    window.showNewsDetail = function(news) {
        var modal = document.getElementById('news-detail-modal');
        if (!modal) return;

        var imgUrl = window.convertDriveLink(news.imagenUrl);
        document.getElementById('news-modal-image').src = imgUrl;
        document.getElementById('news-modal-category').textContent = news.categoria;
        document.getElementById('news-modal-title').textContent = news.titulo;
        document.getElementById('news-modal-meta').textContent = new Date(news.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) + (news.hora ? ' • ' + news.hora.substring(0,5) : '');
        document.getElementById('news-modal-content').innerHTML = news.contenido;
        if (window.setupCodeCopyButtons) window.setupCodeCopyButtons();

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        var closeBtn = document.getElementById('close-news-detail-modal');
        var closeBtnFooter = document.getElementById('close-news-detail-btn');

        var closeModal = function() {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        };

        closeBtn.onclick = closeModal;
        closeBtnFooter.onclick = closeModal;
        modal.onclick = function(e) { if(e.target === modal) closeModal(); };
    };
});
