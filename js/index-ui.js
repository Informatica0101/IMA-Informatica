/**
 * UI Logic for index.html
 * Transpiled to Strict ES5 for v7.5 Legacy Compatibility
 */

var QuizProApp = window.QuizProApp || {};
(function(app) {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // REQ: Priorización de Carga (Ticket 4)
        loadNews();

        // REQ: Garantizar inicialización segura del DOM (v3.3)
        console.log("[IMA-INDEX] Iniciando construcción de interfaz...");

        // Setup Common UI (Header, Scroll, Logout)
        if (QuizProApp.setupCommonUI) QuizProApp.setupCommonUI();
        if (QuizProApp.renderCommonNav) QuizProApp.renderCommonNav();

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
        var selectedGradeData = null;
        var selectedSubjectData = null;

        // --- Utility Functions ---
        function createCustomButton(text, onClickHandler, className) {
            if (className === undefined) className = '';
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
            if (!contentDisplayArea) return;
            contentDisplayArea.classList.add('animate-fade-out-up');

            var onAnimationEnd = function() {
                contentDisplayArea.removeEventListener('animationend', onAnimationEnd);
                contentDisplayArea.classList.remove('animate-fade-out-up');
                contentDisplayArea.innerHTML = '';
                callback();
                contentDisplayArea.classList.add('animate-fade-in-down');

                var onFadeInEnd = function() {
                    contentDisplayArea.removeEventListener('animationend', onFadeInEnd);
                    contentDisplayArea.classList.remove('animate-fade-in-down');
                };
                contentDisplayArea.addEventListener('animationend', onFadeInEnd);
            };
            contentDisplayArea.addEventListener('animationend', onAnimationEnd);
        }

        // --- Content Section Logic ---
        function renderInitialContentButton() {
            if (!contentDisplayArea || !contentBackButtonContainer) return;
            contentBackButtonContainer.classList.add('hidden');
            contentDisplayArea.innerHTML = '';
            contentDisplayArea.appendChild(createCustomButton('Ver Recursos Académicos', renderDownloadGrades));
            currentContentView = 'initial';
        }

        function renderDownloadGrades() {
            if (!contentDisplayArea || !contentBackButtonContainer) return;
            contentBackButtonContainer.classList.add('hidden');
            contentDisplayArea.innerHTML = '';
            var gridDiv = document.createElement('div');
            gridDiv.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg';

            var currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');

            if (QuizProApp.downloadContentData) {
                QuizProApp.downloadContentData.forEach(function(gradeData) {
                    // Filtrado por Grado
                    if (currentUser && currentUser.grado && gradeData.grade !== currentUser.grado) return;

                    gridDiv.appendChild(createCustomButton(gradeData.grade, function() {
                        selectedGradeData = gradeData;
                        animateContentTransition(renderDownloadSubjects);
                    }, 'w-full bg-gray-100 text-gray-800 shadow-none hover:bg-blue-600 hover:text-white'));
                });
            }
            contentDisplayArea.appendChild(gridDiv);
            currentContentView = 'grades';
        }

        function renderDownloadSubjects() {
            if (!contentDisplayArea || !contentBackButtonContainer) return;
            if (!selectedGradeData) return renderDownloadGrades();
            contentBackButtonContainer.classList.remove('hidden');
            contentDisplayArea.innerHTML = '';
            var gridDiv = document.createElement('div');
            gridDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg';

            var currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
            var role = (currentUser && currentUser.rol) ? currentUser.rol : 'Invitado';

            selectedGradeData.subjects.forEach(function(subjectData) {
                // REQ 7: Filtrado por Parcial Actual para no-profesores
                if (role !== 'Profesor' && subjectData.partial !== QuizProApp.PARCIAL_ACTUAL) return;

                gridDiv.appendChild(createCustomButton(subjectData.name, function() {
                    selectedSubjectData = subjectData;
                    animateContentTransition(renderDownloadTopics);
                }, 'w-full bg-gray-100 text-gray-800 shadow-none hover:bg-blue-600 hover:text-white'));
            });

            if (gridDiv.children.length === 0) {
                contentDisplayArea.innerHTML = '<p class="text-gray-400 text-sm">No hay contenidos autorizados para este período.</p>';
            } else {
                contentDisplayArea.appendChild(gridDiv);
            }
            currentContentView = 'subjects';
        }

        function renderDownloadTopics() {
            if (!contentDisplayArea || !contentBackButtonContainer) return;
            if (!selectedSubjectData) return renderDownloadSubjects();
            contentBackButtonContainer.classList.remove('hidden');
            contentDisplayArea.innerHTML = '';
            var gridDiv = document.createElement('div');
            gridDiv.className = 'grid grid-cols-1 gap-3 w-full max-w-lg';
            selectedSubjectData.topics.forEach(function(topic) {
                var link = document.createElement('a');
                link.href = topic.file;
                link.target = '_blank';
                link.className = 'flex items-center justify-between px-6 py-4 rounded-2xl font-medium text-sm ' +
                    'bg-gray-50 text-gray-800 border border-gray-100 ' +
                    'transition-all duration-300 ease-in-out ' +
                    'hover:bg-white hover:shadow-xl hover:border-blue-200 transform hover:-translate-y-0.5 ' +
                    'focus:outline-none focus:ring-4 focus:ring-green-300 w-full group/link';

                link.innerHTML = '<span class="truncate pr-4">' + topic.title + '</span>' +
                    '<span class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs group-hover/link:bg-blue-600 group-hover/link:text-white transition-colors">' +
                    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 10v6m0 0l3-3m-3 3l-3-3m0 6h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>' +
                    '</span>';
                gridDiv.appendChild(link);
            });
            contentDisplayArea.appendChild(gridDiv);
            currentContentView = 'topics';
        }

        if (contentBackButton) {
            contentBackButton.addEventListener('click', function() {
var QuizProApp = window.QuizProApp || {};
                animateContentTransition(function(app) {
                    if (currentContentView === 'subjects') {
                        renderDownloadGrades();
                        selectedGradeData = null;
                    } else if (currentContentView === 'topics') {
                        renderDownloadSubjects();
                        selectedSubjectData = null;
                    } else {
                        renderInitialContentButton();
                    }
                });
            });
        }

        // --- Activities & Games Logic ---
        function showMainContentSections() {
            if (!mainContentSections) return;
            mainContentSections.classList.remove('hidden');
            mainContentSections.classList.add('flex');
            if (dynamicallyLoadedGameContainer) dynamicallyLoadedGameContainer.classList.add('hidden');
            if (mainContentTitle) {
                mainContentTitle.textContent = 'Contenido y Actividades';
                renderInitialActivityButton();
                window.scrollTo({ top: mainContentTitle.offsetTop - 100, behavior: 'smooth' });
            }
        }

        /**
         * REQ: Session Triage (Modulo 5)
         */
        function triageGameLaunch(gameId, html, js, initFn, title) {
            var user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');

            if (user) {
                return safeLoadGame(gameId, html, js, initFn, title);
            }

            var modal = document.getElementById('session-triage-modal');
            if (!modal) return safeLoadGame(gameId, html, js, initFn, title);

            modal.classList.remove('hidden');
var QuizProApp = window.QuizProApp || {};
            setTimeout(function(app) { modal.classList.add('opacity-100'); }, 10);

            var loginBtn = document.getElementById('triage-login-btn');
            var guestBtn = document.getElementById('triage-guest-btn');
            var closeBtn = document.getElementById('close-triage-modal');

            var closeTriage = function() {
                modal.classList.remove('opacity-100');
var QuizProApp = window.QuizProApp || {};
                setTimeout(function(app) { modal.classList.add('hidden'); }, 300);
            };

            if (loginBtn) {
                loginBtn.onclick = function() {
                    var intent = {
                        activityType: "minigame",
                        activityId: gameId,
                        html: html,
                        js: js,
                        initFn: initFn,
                        title: title,
                        timestamp: Date.now()
                    };
                    localStorage.setItem('quizpro_interrupted_intent', JSON.stringify(intent));
                    window.location.href = 'login.html';
                };
            }

            if (guestBtn) {
                guestBtn.onclick = function() {
                    closeTriage();
                    safeLoadGame(gameId, html, js, initFn, title);
                };
            }

            if (closeBtn) closeBtn.onclick = closeTriage;
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
                var footer = document.querySelector('footer');
                if (footer) document.body.insertBefore(gameOverlay, footer);
                else document.body.appendChild(gameOverlay);
            }
            gameOverlay.innerHTML = '<div class="flex items-center justify-center min-h-[60vh]"><i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i></div>';
            gameOverlay.style.display = 'block';

            fetch(htmlPath)
                .then(function(response) { return response.text(); })
                .then(function(html) {
                    gameOverlay.innerHTML = html;

                    var script = document.createElement('script');
                    script.src = jsPath;
                    script.onload = function() {
                        if (QuizProApp[initFnName]) {
                            QuizProApp[initFnName](QuizProApp.gameDataStorage);
                        }
                    };
                    gameOverlay.appendChild(script);
                })
                .catch(function(error) {
                    console.error("Error loading game " + gameId + ":", error);
                    gameOverlay.innerHTML = '<p class="text-red-500 p-8 text-center">Error al cargar el juego. Por favor, inténtalo de nuevo.</p>';
                    gameOverlay.appendChild(createCustomButton('Volver al Inicio', QuizProApp.returnToMainContent, 'mt-4 mx-auto block'));
                });
        }

        app.showMainContentSections = showMainContentSections;

        function safeLoadGame(gameId, html, js, initFn, title) {
            if (!QuizProApp.GamesAdapter) {
                console.error("[IMA-LOADER] GamesAdapter no encontrado. Reintentando carga de script...");
                var script = document.createElement('script');
                script.src = 'js/games-adapter.js';
                return new Promise(function(resolve) {
                    script.onload = function() {
                        loadGame(gameId, html, js, initFn, title);
                        resolve();
                    };
                    document.head.appendChild(script);
                });
            }
            return loadGame(gameId, html, js, initFn, title);
        }

        app.loadPeripheralsGame = function() { return safeLoadGame('peripherals', 'juegos/perifericos.html', 'js/perifericos_juego.js', 'initializePeripheralsGame', 'Juego de Periféricos'); };
        app.loadWebMasterQuiz = function() { return safeLoadGame('webmaster', 'juegos/webmaster_quiz.html', 'js/webmaster_quiz_juego.js', 'initQuizGame', 'WebMaster Quiz'); };
        app.loadQuizPro = function() { return safeLoadGame('quizpro', 'juegos/quizpro.html', 'js/quizpro.js', 'initQuizPro', 'QuizPro'); };
        app.loadDexterityGame = function() { return safeLoadGame('dexterity', 'juegos/destreza_teclado.html', 'js/destreza_teclado.js', 'initDexterityGame', 'Destreza en el Teclado'); };

        app.returnToMainContent = function() {
            var wrapper = document.getElementById('main-content-wrapper');
            var mainHeader = document.getElementById('main-header');
            var gameOverlay = document.getElementById('dedicated-game-overlay');

            if (gameOverlay) {
                gameOverlay.innerHTML = '';
                gameOverlay.style.display = 'none';
            }

            if (wrapper) wrapper.style.display = 'block';
            if (mainHeader) mainHeader.classList.remove('header-hidden');

            var scriptsToRemove = ['js/perifericos_juego.js', 'js/webmaster_quiz_juego.js', 'js/destreza_teclado.js', 'js/quizpro.js'];
            scriptsToRemove.forEach(function(src) {
                var s = document.querySelector('script[src="' + src + '"]');
                if (s) s.remove();
            });

            showMainContentSections();
        };

        function renderInitialActivityButton() {
            if (!initialActivityMenu) return;
            initialActivityMenu.classList.remove('hidden');
            initialActivityMenu.classList.add('flex');
            if (gameListMenu) {
                gameListMenu.classList.add('hidden');
                gameListMenu.classList.remove('flex');
            }
        }

        function renderActivityList() {
            if (!initialActivityMenu || !gameListMenu || !mainContentTitle) return;
            initialActivityMenu.classList.add('hidden');
            initialActivityMenu.classList.remove('flex');
            gameListMenu.classList.remove('hidden');
            gameListMenu.classList.add('flex');
            mainContentTitle.textContent = 'Actividades';
        }

        if (showActivitiesButton) showActivitiesButton.addEventListener('click', renderActivityList);

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
        app.gameDataStorage = {
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

        renderInitialContentButton();
        renderInitialActivityButton();
        setupGlobalAuth();
        renderWelcomeMessage();

        // --- Handle Action from URL (A-28) ---
        function processUrlAction() {

            var action = app.getUrlParam('action');
            var game = app.getUrlParam('loadGame');

            if (action && typeof QuizProApp.handleHeaderAction === 'function') {
                QuizProApp.handleHeaderAction(action);
            }

            if (game) {
                console.log("[IMA-INDEX] Auto-loading game: " + game);
                switch(game) {
                    case 'peripherals': triageGameLaunch('peripherals', 'juegos/perifericos.html', 'js/perifericos_juego.js', 'initializePeripheralsGame', 'Juego de Periféricos'); break;
                    case 'webmaster': triageGameLaunch('webmaster', 'juegos/webmaster_quiz.html', 'js/webmaster_quiz_juego.js', 'initQuizGame', 'WebMaster Quiz'); break;
                    case 'quizpro': triageGameLaunch('quizpro', 'juegos/quizpro.html', 'js/quizpro.js', 'initQuizPro', 'QuizPro'); break;
                    case 'dexterity': triageGameLaunch('dexterity', 'juegos/destreza_teclado.html', 'js/destreza_teclado.js', 'initDexterityGame', 'Destreza en el Teclado'); break;
                }
            }
        }

        document.addEventListener('common-ui-ready', processUrlAction, { once: true });

        // --- Welcome Message Logic ---
        function renderWelcomeMessage() {
            var currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
            var welcomeBadge = document.getElementById('user-welcome-badge');
            if (currentUser && welcomeBadge && currentUser.nombre) {
                var firstName = currentUser.nombre.split(' ')[0];
                welcomeBadge.innerHTML = '<span class="relative flex h-2 w-2">' +
                    '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>' +
                    '<span class="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>' +
                    '</span>' +
                    'Bienvenido, ' + firstName;
                welcomeBadge.classList.remove('hidden');
            }
        }

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
        var openProfileBtn = document.getElementById('open-profile-btn');
        var profileModal = document.getElementById('profile-modal');
        var closeProfileModal = document.getElementById('close-profile-modal');

        if (openProfileBtn) {
            openProfileBtn.onclick = function() {
                var user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
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
var QuizProApp = window.QuizProApp || {};
        (function(app) {
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
                var currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
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
        })(QuizProApp);

        /**
         * Global Authentication Helper
         */
        function setupGlobalAuth() {
            var currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
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

            var promise = (QuizProApp.PersistenceManager) ? QuizProApp.PersistenceManager.get('news') : Promise.resolve(null);

            promise.then(function(cached) {
                var hasLocalNews = false;
                if (cached && cached.data && cached.data.length > 0) {
                    console.log("[IMA-INDEX] Renderizado inmediato desde caché local.");
                    renderNewsHTML(cached.data);
                    hasLocalNews = true;
                }

                if (!hasLocalNews) {
                    var skeleton = '';
                    for (var i = 0; i < 3; i++) {
                        skeleton += '<div class="bg-white rounded-[2rem] border border-gray-100 overflow-hidden animate-pulse">' +
                            '<div class="h-56 skeleton"></div>' +
                            '<div class="p-8 space-y-4">' +
                            '<div class="flex gap-2"><div class="skeleton h-4 w-16 rounded"></div><div class="skeleton h-4 w-24 rounded"></div></div>' +
                            '<div class="skeleton h-8 w-full rounded"></div>' +
                            '<div class="skeleton h-4 w-3/4 rounded"></div>' +
                            '<div class="skeleton h-4 w-1/2 rounded"></div>' +
                            '</div></div>';
                    }
                    newsContainer.innerHTML = skeleton;
                }

                if (app.fetchApi) {
                    app.fetchApi('USER', 'getNews', {}, 0, {
                        store: 'news',
                        onUpdate: function(data) { renderNewsHTML(data); }
                    }).then(function(res) {
                        if (!res || res.status !== 'success' || !res.data || res.data.length === 0) {
                            console.log("[IMA-NEWS] Utilizando noticia de fallback local.");
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
                    }).catch(function(err) {
                        console.error("Error loading news API:", err);
                    });
                }
            });
        }

        function renderNewsHTML(inputData) {
            var newsContainer = document.getElementById('news-container');
            var data = (inputData && inputData.status === 'success' && Array.isArray(inputData.data)) ? inputData.data : (Array.isArray(inputData) ? inputData : []);

            if (!newsContainer || data.length === 0) return;

            console.log("[IMA-INDEX] Renderizando noticias:", data.length);
            var newsToShow = data.slice(0, 3);

            var newsHtml = newsToShow.map(function(n, idx) {
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = n.contenido;

                var excerpt = "";
                var paragraphs = tempDiv.getElementsByTagName('p');

                if (paragraphs.length > 0) {
                    for (var i = 0; i < paragraphs.length; i++) {
                        var text = paragraphs[i].innerText.trim() || paragraphs[i].textContent.trim();
                        if (text.length > 20) {
                            excerpt = text;
                            break;
                        }
                    }
                }

                if (!excerpt) {
                    excerpt = tempDiv.innerText.trim() || tempDiv.textContent.trim();
                }

                var limit = idx === 0 ? 250 : 120;
                if (excerpt.length > limit) {
                    excerpt = excerpt.substring(0, limit) + "...";
                }

                var imgUrl = (typeof QuizProApp.convertDriveLink === 'function') ? QuizProApp.convertDriveLink(n.imagenUrl) : n.imagenUrl;
                var formattedDate = new Date(n.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                var formattedTime = n.hora ? '• ' + n.hora.substring(0,5) : '';

                var colSpan = (idx === 0) ? 'md:col-span-2 lg:col-span-2' : '';
                var flexDir = (idx === 0) ? 'flex flex-col md:flex-row h-full' : 'flex flex-col';
                var imgWrapperClass = (idx === 0) ? 'md:w-1/2 h-72 md:h-full' : 'h-56';
                var contentWrapperClass = (idx === 0) ? 'md:w-1/2 flex flex-col justify-center' : 'flex-grow flex flex-col';
                var titleClass = (idx === 0) ? 'text-2xl md:text-3xl' : 'text-xl';
                var excerptClass = (idx === 0) ? 'line-clamp-4' : 'line-clamp-3';

                var imgPart = n.imagenUrl ?
                    '<div class="' + imgWrapperClass + ' overflow-hidden">' +
                    '<img src="' + imgUrl + '" alt="' + n.titulo + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out">' +
                    '</div>' :
                    '<div class="' + imgWrapperClass + ' bg-gray-50 flex items-center justify-center text-gray-200">' +
                    '<i class="fas fa-newspaper text-6xl"></i>' +
                    '</div>';

                var newsJson = JSON.stringify(n).replace(/'/g, "&apos;");

                return '<div class="' + colSpan + ' bg-white rounded-[2rem] border border-gray-100 overflow-hidden group hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 transition-all duration-500">' +
                    '<div class="' + flexDir + '">' +
                    imgPart +
                    '<div class="p-8 ' + contentWrapperClass + '">' +
                    '<div class="flex items-center gap-3 mb-4">' +
                    '<span class="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">' + n.categoria + '</span>' +
                    '<span class="text-[10px] font-medium text-gray-300 uppercase tracking-wider">' + formattedDate + ' ' + formattedTime + '</span>' +
                    '</div>' +
                    '<h3 class="' + titleClass + ' font-semibold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tighter">' + n.titulo + '</h3>' +
                    '<p class="text-gray-500 text-sm leading-relaxed mb-6 ' + excerptClass + ' font-medium">' + excerpt + '</p>' +
                    '<div class="mt-auto pt-6 border-t border-gray-50">' +
                    '<button onclick=\'QuizProApp.showNewsDetail(' + newsJson + ')\' class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-800 transition-all">' +
                    'Seguir Leyendo' +
                    '<svg class="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>' +
                    '</button>' +
                    '</div></div></div></div>';
            }).join('');

            newsContainer.innerHTML = newsHtml;
        }

        app.showNewsDetail = function(news) {
            var modal = document.getElementById('news-detail-modal');
            if (!modal) return;

            var imgUrl = (typeof QuizProApp.convertDriveLink === 'function') ? QuizProApp.convertDriveLink(news.imagenUrl) : news.imagenUrl;
            document.getElementById('news-modal-image').src = imgUrl;
            document.getElementById('news-modal-category').textContent = news.categoria;
            document.getElementById('news-modal-title').textContent = news.titulo;
            document.getElementById('news-modal-meta').textContent = new Date(news.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) + (news.hora ? ' • ' + news.hora.substring(0,5) : '');
            document.getElementById('news-modal-content').innerHTML = news.contenido;

            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            var closeBtn = document.getElementById('close-news-detail-modal');
            var closeBtnFooter = document.getElementById('close-news-detail-btn');

            var closeModal = function() {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            };

            if (closeBtn) closeBtn.onclick = closeModal;
            if (closeBtnFooter) closeBtnFooter.onclick = closeModal;
            modal.onclick = function(e) { if(e.target === modal) closeModal(); };
        };
    });

})(QuizProApp);
