/**
 * UI Logic for index.html
 */

document.addEventListener('DOMContentLoaded', () => {
    // Setup Common UI (Header, Scroll, Logout)
    if (window.setupCommonUI) window.setupCommonUI();
    if (window.renderCommonNav) window.renderCommonNav();

    // --- DOM Elements specific to index.html ---
    const contentDisplayArea = document.getElementById('content-display-area');
    const contentBackButtonContainer = document.getElementById('content-back-button-container');
    const contentBackButton = document.getElementById('content-back-button');

    const mainContentSections = document.getElementById('main-content-sections');
    const mainContentTitle = document.getElementById('main-content-title');
    const showActivitiesButton = document.getElementById('show-activities-button');
    const initialActivityMenu = document.getElementById('initial-activity-menu');
    const gameListMenu = document.getElementById('game-list-menu');
    const backToMainActivitiesButton = document.getElementById('back-to-main-activities-button');
    const dynamicallyLoadedGameContainer = document.getElementById('dynamically-loaded-game-container');

    // --- State Variables ---
    let currentContentView = 'initial';
    let selectedGradeData = null;
    let selectedSubjectData = null;

    // --- Utility Functions ---
    function createCustomButton(text, onClickHandler, className = '') {
        const button = document.createElement('button');
        button.textContent = text;
        button.onclick = onClickHandler;
        button.className = `
            px-5 py-2.5 rounded-xl font-semibold text-base
            bg-blue-600 text-white hover:bg-blue-700
            transition-all duration-300 ease-in-out
            shadow-lg hover:shadow-xl transform hover:-translate-y-1
            focus:outline-none focus:ring-4 focus:ring-blue-300
            ${className}
        `;
        return button;
    }

    function animateContentTransition(callback) {
        contentDisplayArea.classList.add('animate-fade-out-up');
        contentDisplayArea.addEventListener('animationend', () => {
            contentDisplayArea.classList.remove('animate-fade-out-up');
            contentDisplayArea.innerHTML = '';
            callback();
            contentDisplayArea.classList.add('animate-fade-in-down');
            contentDisplayArea.addEventListener('animationend', () => {
                contentDisplayArea.classList.remove('animate-fade-in-down');
            }, { once: true });
        }, { once: true });
    }

    // --- Mobile Menu Rendering (Specific to index due to action links) ---
    function renderMobileNav() {
        const mobileGradesMenu = document.getElementById('mobile-grades-menu');
        const mobileAdditionalMenu = document.getElementById('mobile-additional-resources-menu');
        if (!mobileGradesMenu || !window.presentationData) return;

        mobileGradesMenu.innerHTML = '';
        window.presentationData.forEach(gradeData => {
            const gradeToggle = document.createElement('button');
            gradeToggle.className = 'mobile-nav-link justify-between bg-white';
            gradeToggle.innerHTML = `${gradeData.grade} <span class="transform transition-transform duration-300">&#9656;</span>`;
            mobileGradesMenu.appendChild(gradeToggle);

            const subjectsContainer = document.createElement('div');
            subjectsContainer.className = 'mobile-menu-item-container hidden-height';
            mobileGradesMenu.appendChild(subjectsContainer);

            gradeToggle.addEventListener('click', () => {
                subjectsContainer.classList.toggle('hidden-height');
                subjectsContainer.classList.toggle('visible-height');
                gradeToggle.querySelector('span').classList.toggle('rotate-90');
            });

            gradeData.subjects.forEach(subjectData => {
                const subjectToggle = document.createElement('button');
                subjectToggle.className = 'w-full text-gray-700 font-medium text-left px-8 py-3 flex justify-between items-center bg-gray-50 border-b border-gray-100';
                subjectToggle.innerHTML = `${subjectData.name} <span class="transform transition-transform duration-300">&#9656;</span>`;
                subjectsContainer.appendChild(subjectToggle);

                const topicsContainer = document.createElement('div');
                topicsContainer.className = 'mobile-menu-item-container hidden-height bg-gray-100';
                subjectsContainer.appendChild(topicsContainer);

                subjectToggle.addEventListener('click', () => {
                    topicsContainer.classList.toggle('hidden-height');
                    topicsContainer.classList.toggle('visible-height');
                    subjectToggle.querySelector('span').classList.toggle('rotate-90');
                });

                subjectData.topics.forEach(topic => {
                    const topicLink = document.createElement('a');
                    topicLink.href = topic.file;
                    topicLink.className = 'block px-12 py-3 text-gray-600 text-sm border-b border-gray-200';
                    topicLink.textContent = topic.title;
                    topicLink.onclick = () => { if(window.closeMobileMenu) window.closeMobileMenu(); };
                    topicsContainer.appendChild(topicLink);
                });
            });
        });

        // Recursos Adicionales Mobile
        window.additionalResourcesData.forEach(cat => {
            const catToggle = document.createElement('button');
            catToggle.className = 'mobile-nav-link justify-between bg-white';
            catToggle.innerHTML = `${cat.category} <span class="transform transition-transform duration-300">&#9656;</span>`;
            mobileAdditionalMenu.appendChild(catToggle);

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'mobile-menu-item-container hidden-height';
            mobileAdditionalMenu.appendChild(itemsContainer);

            catToggle.addEventListener('click', () => {
                itemsContainer.classList.toggle('hidden-height');
                itemsContainer.classList.toggle('visible-height');
                catToggle.querySelector('span').classList.toggle('rotate-90');
            });

            cat.items.forEach(item => {
                const itemLink = document.createElement('a');
                itemLink.className = 'block px-8 py-3 text-gray-700 font-medium bg-gray-50 border-b border-gray-100';
                itemLink.textContent = item.title;
                if (item.action) {
                    itemLink.href = '#';
                    itemLink.onclick = (e) => {
                        e.preventDefault();
                        window.handleHeaderAction(item.action);
                    };
                } else {
                    itemLink.href = item.file;
                    itemLink.target = '_blank';
                    itemLink.onclick = () => { if(window.closeMobileMenu) window.closeMobileMenu(); };
                }
                itemsContainer.appendChild(itemLink);
            });
        });
    }

    window.handleHeaderAction = function(action) {
        showMainContentSections();
        if (action === 'load-peripherals-game') loadPeripheralsGame();
        else if (action === 'load-webmaster-quiz') loadWebMasterQuiz();
        else if (action === 'load-dexterity-game') loadDexterityGame();
        if (window.closeMobileMenu) window.closeMobileMenu();
    }

    // --- Content Section Logic ---
    function renderInitialContentButton() {
        contentBackButtonContainer.classList.add('hidden');
        contentDisplayArea.innerHTML = '';
        contentDisplayArea.appendChild(createCustomButton('Ver Contenido para Descargar', renderDownloadGrades));
        currentContentView = 'initial';
    }

    function renderDownloadGrades() {
        contentBackButtonContainer.classList.add('hidden');
        contentDisplayArea.innerHTML = '';
        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg';
        window.downloadContentData.forEach(gradeData => {
            gridDiv.appendChild(createCustomButton(gradeData.grade, () => {
                selectedGradeData = gradeData;
                animateContentTransition(renderDownloadSubjects);
            }, 'w-full'));
        });
        contentDisplayArea.appendChild(gridDiv);
        currentContentView = 'grades';
    }

    function renderDownloadSubjects() {
        if (!selectedGradeData) return renderDownloadGrades();
        contentBackButtonContainer.classList.remove('hidden');
        contentDisplayArea.innerHTML = '';
        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg';
        selectedGradeData.subjects.forEach(subjectData => {
            gridDiv.appendChild(createCustomButton(subjectData.name, () => {
                selectedSubjectData = subjectData;
                animateContentTransition(renderDownloadTopics);
            }, 'w-full'));
        });
        contentDisplayArea.appendChild(gridDiv);
        currentContentView = 'subjects';
    }

    function renderDownloadTopics() {
        if (!selectedSubjectData) return renderDownloadSubjects();
        contentBackButtonContainer.classList.remove('hidden');
        contentDisplayArea.innerHTML = '';
        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 gap-3 w-full max-w-lg';
        selectedSubjectData.topics.forEach(topic => {
            const link = document.createElement('a');
            link.href = topic.file;
            link.target = '_blank';
            link.className = `
                flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-base
                bg-green-600 text-white hover:bg-green-700
                transition-all duration-300 ease-in-out
                shadow-lg hover:shadow-xl transform hover:-translate-y-1
                focus:outline-none focus:ring-4 focus:ring-green-300 w-full
            `;
            link.innerHTML = `
                <span>${topic.title}</span>
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l3-3m-3 3l-3-3m0 6h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            `;
            gridDiv.appendChild(link);
        });
        contentDisplayArea.appendChild(gridDiv);
        currentContentView = 'topics';
    }

    if (contentBackButton) {
        contentBackButton.addEventListener('click', () => {
            animateContentTransition(() => {
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
        dynamicallyLoadedGameContainer.classList.add('hidden');
        mainContentTitle.textContent = 'Contenido y Actividades';
        renderInitialActivityButton();
        window.scrollTo({ top: mainContentTitle.offsetTop - 100, behavior: 'smooth' });
    }

    async function loadGame(gameId, htmlPath, jsPath, initFnName, title) {
        const mainHeader = document.getElementById('main-header');
        if (mainHeader) mainHeader.classList.add('header-hidden');
        mainContentSections.classList.add('hidden');
        mainContentSections.classList.remove('flex');
        dynamicallyLoadedGameContainer.classList.remove('hidden');
        mainContentTitle.textContent = title;

        try {
            const htmlResponse = await fetch(htmlPath);
            dynamicallyLoadedGameContainer.innerHTML = await htmlResponse.text();

            const script = document.createElement('script');
            script.src = jsPath;
            script.onload = () => {
                if (window[initFnName]) {
                    window[initFnName](window.gameDataStorage);
                }
            };
            dynamicallyLoadedGameContainer.appendChild(script);
        } catch (error) {
            console.error(`Error loading game ${gameId}:`, error);
            dynamicallyLoadedGameContainer.innerHTML = '<p class="text-red-500 p-8 text-center">Error al cargar el juego. Por favor, inténtalo de nuevo.</p>';
            dynamicallyLoadedGameContainer.appendChild(createCustomButton('Volver al Inicio', showMainContentSections, 'mt-4 mx-auto block'));
        }
    }

    const loadPeripheralsGame = () => loadGame('peripherals', 'juegos/perifericos.html', 'js/perifericos_juego.js', 'initializePeripheralsGame', 'Juego de Periféricos');
    const loadWebMasterQuiz = () => loadGame('webmaster', 'juegos/webmaster_quiz.html', 'js/webmaster_quiz_juego.js', 'initQuizGame', 'WebMaster Quiz');
    const loadDexterityGame = () => loadGame('dexterity', 'juegos/destreza_teclado.html', 'js/destreza_teclado.js', 'initDexterityGame', 'Destreza en el Teclado');

    window.returnToMainContent = function() {
        const mainHeader = document.getElementById('main-header');
        if (mainHeader) mainHeader.classList.remove('header-hidden');
        dynamicallyLoadedGameContainer.innerHTML = '';
        ['js/perifericos_juego.js', 'js/webmaster_quiz_juego.js', 'js/destreza_teclado.js'].forEach(src => {
            const s = document.querySelector(`script[src="${src}"]`);
            if (s) s.remove();
        });
        showMainContentSections();
    };

    function renderInitialActivityButton() {
        if (!initialActivityMenu) return;
        initialActivityMenu.classList.remove('hidden');
        initialActivityMenu.classList.add('flex');
        gameListMenu.classList.add('hidden');
        gameListMenu.classList.remove('flex');
    }

    function renderActivityList() {
        initialActivityMenu.classList.add('hidden');
        initialActivityMenu.classList.remove('flex');
        gameListMenu.classList.remove('hidden');
        gameListMenu.classList.add('flex');
        mainContentTitle.textContent = 'Actividades';
    }

    if (showActivitiesButton) showActivitiesButton.addEventListener('click', renderActivityList);
    const pBtn = document.getElementById('select-peripherals-game-button');
    if (pBtn) pBtn.addEventListener('click', loadPeripheralsGame);
    const wBtn = document.getElementById('select-webmaster-quiz-button');
    if (wBtn) wBtn.addEventListener('click', loadWebMasterQuiz);
    const dBtn = document.getElementById('select-dexterity-game-button');
    if (dBtn) dBtn.addEventListener('click', loadDexterityGame);
    if (backToMainActivitiesButton) backToMainActivitiesButton.addEventListener('click', renderInitialActivityButton);

    // Game Storage
    window.gameDataStorage = {
        localStorageKey: 'gameProgressData',
        loadAllGameData() {
            try { return JSON.parse(localStorage.getItem(this.localStorageKey)) || {}; }
            catch (e) { return {}; }
        },
        saveGameSession(gameId, sessionData) {
            const all = this.loadAllGameData();
            if (!all[gameId]) all[gameId] = [];
            all[gameId].push(sessionData);
            localStorage.setItem(this.localStorageKey, JSON.stringify(all));
        }
    };

    renderMobileNav();
    renderInitialContentButton();
    renderInitialActivityButton();
});

/**
 * PWA Installation and Login Modal Logic
 */
(function() {
    let deferredPrompt;
    const installBtnMobile = document.getElementById("pwa-install-button-mobile");
    const installBtnFooter = document.getElementById("pwa-install-button-footer");
    const iosModal = document.getElementById("ios-install-modal");

    // Detect mobile platforms
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|HarmonyOS|HUAWEI/i.test(ua);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

    // Logic to show install buttons
    function showInstallButtons() {
        if (isStandalone) return;
        if (isMobile) {
            if (installBtnMobile) installBtnMobile.classList.remove("hidden");
            if (installBtnFooter) installBtnFooter.classList.remove("hidden");
        }
    }

    // Initial check
    showInstallButtons();

    window.addEventListener("beforeinstallprompt", (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Ensure buttons are visible if they were hidden
        showInstallButtons();
    });

    async function handleInstall() {
        // If iOS, show the special instructions modal
        if (isIOS) {
            if (iosModal) iosModal.classList.remove("opacity-0", "pointer-events-none");
            return;
        }

        // If we have the deferredPrompt (Android/Chrome), use it
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                if (installBtnMobile) installBtnMobile.classList.add("hidden");
                if (installBtnFooter) installBtnFooter.classList.add("hidden");
            }
            deferredPrompt = null;
        } else {
            // Fallback for other mobile browsers (generic instructions)
            // We can reuse the iOS modal or customize it.
            // For simplicity, let's just show a message if it's mobile but no prompt.
            alert("Para instalar esta aplicación, usa la opción 'Añadir a la pantalla de inicio' en el menú de tu navegador.");
        }
    }

    if (installBtnMobile) installBtnMobile.addEventListener("click", handleInstall);
    if (installBtnFooter) installBtnFooter.addEventListener("click", handleInstall);

    const closeIosModal = document.getElementById("close-ios-modal");
    if (closeIosModal) {
        closeIosModal.addEventListener("click", () => {
            if (iosModal) iosModal.classList.add("opacity-0", "pointer-events-none");
        });
    }

    // --- Modal Logic ---
    const loginModal = document.getElementById('login-modal');
    const loginModalContent = document.getElementById('login-modal-content');
    const closeLoginModal = document.getElementById('close-login-modal');
    const accessButtonContainer = document.getElementById('access-button-container');

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
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) closeModal();
        });
    }

    function renderAccessButton() {
        if (!accessButtonContainer) return;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        accessButtonContainer.innerHTML = '';

        if (currentUser) {
            const portalBtn = document.createElement('a');
            portalBtn.href = currentUser.rol === 'Profesor' ? 'teacher-dashboard.html' : 'student-dashboard.html';
            portalBtn.className = 'px-10 py-5 rounded-2xl font-bold text-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1';
            portalBtn.textContent = 'Ir al Portal';
            accessButtonContainer.appendChild(portalBtn);
        } else {
            const loginBtn = document.createElement('button');
            loginBtn.className = 'px-10 py-5 rounded-2xl font-bold text-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1';
            loginBtn.textContent = 'Iniciar Sesión';
            loginBtn.addEventListener("click", openModal);
            accessButtonContainer.appendChild(loginBtn);
        }
    }

    renderAccessButton();
})();
