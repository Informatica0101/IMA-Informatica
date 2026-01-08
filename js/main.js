document.addEventListener('DOMContentLoaded', () => {
    // --- Global State & DOM Elements ---
    let currentContentView = 'initial';
    let selectedGradeData = null;
    let selectedSubjectData = null;
    let activeMobileGradeElement = null;
    let activeMobileSubjectElement = null;

    const contentDisplayArea = document.getElementById('content-display-area');
    const contentBackButtonContainer = document.getElementById('content-back-button-container');
    const contentBackButton = document.getElementById('content-back-button');
    const mainContentSections = document.getElementById('main-content-sections');
    const mainContentTitle = document.getElementById('main-content-title');
    const dynamicallyLoadedGameContainer = document.getElementById('dynamically-loaded-game-container');
    const mainHeader = document.getElementById('main-header');
    const initialActivityMenu = document.getElementById('initial-activity-menu');
    const showActivitiesButton = document.getElementById('show-activities-button');
    const gameListMenu = document.getElementById('game-list-menu');
    const backToMainActivitiesButton = document.getElementById('back-to-main-activities-button');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuCloseButton = document.getElementById('mobile-menu-close-button');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');
    const mobileCoursesToggle = document.getElementById('mobile-courses-toggle');
    const mobileCoursesArrow = document.getElementById('mobile-courses-arrow');
    const mobileGradesContainer = document.getElementById('mobile-grades-container');
    const mobileAdditionalResourcesToggle = document.getElementById('mobile-additional-resources-toggle');
    const mobileAdditionalResourcesArrow = document.getElementById('mobile-additional-resources-arrow');
    const mobileAdditionalResourcesContainer = document.getElementById('mobile-additional-resources-container');
    const desktopGradesMenu = document.getElementById('desktop-grades-menu');
    const desktopAdditionalResourcesMenu = document.getElementById('desktop-additional-resources-menu');
    const mobileGradesMenu = document.getElementById('mobile-grades-menu');
    const mobileAdditionalResourcesMenu = document.getElementById('mobile-additional-resources-menu');

    // --- Utility Functions ---
    function createCustomButton(text, onClickHandler, className = '') {
        const button = document.createElement('button');
        button.textContent = text;
        button.onclick = onClickHandler;
        button.className = `px-5 py-2.5 rounded-xl font-semibold text-base bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300 ${className}`;
        return button;
    }

    // --- Mobile Menu Logic ---
    function toggleMobileMenu() {
        mobileMenuOverlay.classList.toggle('hidden');
        mobileMenuOverlay.classList.toggle('mobile-menu-overlay');
        mobileMenuIcon.setAttribute('d', mobileMenuOverlay.classList.contains('hidden') ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12');
        if (mobileMenuOverlay.classList.contains('hidden')) {
            // Reset state
        }
    }
    function closeMobileMenu() {
        mobileMenuOverlay.classList.add('hidden');
        mobileMenuOverlay.classList.remove('mobile-menu-overlay');
        mobileMenuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    }

    // --- Navigation Rendering ---
    function renderNavMenus() {
        // Desktop - Cursos
        desktopGradesMenu.innerHTML = presentationData.map(grade => `
            <div class="relative group/grade">
                <button class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">${grade.grade} <span class="float-right text-xs">&#9656;</span></button>
                <div class="absolute left-full top-0 mt-0 w-56 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover/grade:opacity-100 group-hover/grade:visible">
                    ${grade.subjects.map(subject => `
                        <div class="relative group/subject">
                            <button class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">${subject.name} <span class="float-right text-xs">&#9656;</span></button>
                            <div class="absolute left-full top-0 mt-0 w-64 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover/subject:opacity-100 group-hover/subject:visible">
                                ${subject.topics.map(topic => `<a href="${topic.file}" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">${topic.title}</a>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Desktop - Recursos Adicionales
        desktopAdditionalResourcesMenu.innerHTML = additionalResourcesData.map(category => `
             <div class="relative group/resource-cat">
                <button class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">${category.category} <span class="float-right text-xs">&#9656;</span></button>
                <div class="absolute left-full top-0 mt-0 w-64 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover/resource-cat:opacity-100 group-hover/resource-cat:visible">
                    ${category.items.map(item => `<a href="${item.file || '#'}" data-action="${item.action || ''}" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">${item.title}</a>`).join('')}
                </div>
            </div>
        `).join('');

        // Mobile menus can be generated similarly, adding event listeners after creation
    }

    // --- Content Download Section Logic ---
    function animateContentTransition(callback) {
        contentDisplayArea.classList.add('animate-fade-out-up');
        contentDisplayArea.addEventListener('animationend', () => {
            contentDisplayArea.classList.remove('animate-fade-out-up');
            contentDisplayArea.innerHTML = '';
            callback();
            contentDisplayArea.classList.add('animate-fade-in-down');
        }, { once: true });
    }
    function renderInitialContentButton() { /* ... */ }
    function renderDownloadGrades() { /* ... */ }
    function renderDownloadSubjects() { /* ... */ }
    function renderDownloadTopics() { /* ... */ }

    // --- Game Loading & Management ---
    const gameScripts = {
        'peripherals-game': { html: 'juegos/perifericos.html', js: 'js/perifericos_juego.js', init: 'initializePeripheralsGame', title: 'Juego de Periféricos' },
        'webmaster-quiz': { html: 'juegos/webmaster_quiz.html', js: 'js/webmaster_quiz_juego.js', init: 'initQuizGame', title: 'WebMaster Quiz' },
        'dexterity-game': { html: 'juegos/destreza_teclado.html', js: 'js/destreza_teclado.js', init: 'initDexterityGame', title: 'Destreza en el Teclado' }
    };

    async function loadGame(gameId) {
        const game = gameScripts[gameId];
        if (!game) return;

        mainHeader.classList.add('header-hidden');
        mainContentSections.classList.add('hidden');
        dynamicallyLoadedGameContainer.classList.remove('hidden');
        mainContentTitle.textContent = game.title;

        try {
            const htmlResponse = await fetch(game.html);
            dynamicallyLoadedGameContainer.innerHTML = await htmlResponse.text();

            const script = document.createElement('script');
            script.src = game.js;
            script.onload = () => window[game.init]?.();
            dynamicallyLoadedGameContainer.appendChild(script);
        } catch (error) {
            console.error(`Error loading game ${gameId}:`, error);
            dynamicallyLoadedGameContainer.innerHTML = '<p class="text-red-500">Error al cargar el juego.</p>';
        }
    }
    window.returnToMainContent = function() {
        mainHeader.classList.remove('header-hidden');
        dynamicallyLoadedGameContainer.innerHTML = '';
        dynamicallyLoadedGameContainer.classList.add('hidden');
        mainContentSections.classList.remove('hidden');
        mainContentTitle.textContent = 'Contenido y Actividades';
        renderInitialActivityButton();
    };

    // --- Activity Section Flow ---
    function renderInitialActivityButton() { /* ... */ }
    function renderActivityList() { /* ... */ }

    // --- Header Scroll Logic ---
    let lastScrollTop = 0;
    const scrollThreshold = 50;
    window.addEventListener('scroll', () => {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScrollTop > lastScrollTop && currentScrollTop > mainHeader.offsetHeight + scrollThreshold) {
            mainHeader.classList.add('header-hidden');
        } else if (currentScrollTop < lastScrollTop) {
            mainHeader.classList.remove('header-hidden');
        }
        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    });

    // --- Event Listeners ---
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    mobileMenuCloseButton.addEventListener('click', closeMobileMenu);
    // ... other listeners ...
    gameListMenu.addEventListener('click', (e) => {
        const gameButton = e.target.closest('button[id]');
        if (gameButton) {
            const gameId = gameButton.id.replace('select-', '').replace('-button', '');
            if (gameScripts[gameId]) {
                loadGame(gameId);
            }
        }
    });
    desktopAdditionalResourcesMenu.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-action]');
        if (link && link.dataset.action) {
            e.preventDefault();
            const gameId = link.dataset.action.replace('load-', '');
            if (gameScripts[gameId]) {
                loadGame(gameId);
            }
        }
    });


    // --- Initialization ---
    document.getElementById('current-year').textContent = new Date().getFullYear();
    renderNavMenus();
    // renderInitialContentButton();
    // renderInitialActivityButton();
});
