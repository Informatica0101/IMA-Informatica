document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Query Selectors ---
    const mainContentSections = document.getElementById('main-content-sections');
    const mainContentTitle = document.getElementById('main-content-title');
    const dynamicallyLoadedGameContainer = document.getElementById('dynamically-loaded-game-container');
    const mainHeader = document.getElementById('main-header'); // Assumes header is loaded

    // Content Download Section
    const contentDisplayArea = document.getElementById('content-display-area');
    const contentBackButtonContainer = document.getElementById('content-back-button-container');
    const contentBackButton = document.getElementById('content-back-button');

    // Activity Section
    const initialActivityMenu = document.getElementById('initial-activity-menu');
    const showActivitiesButton = document.getElementById('show-activities-button');
    const gameListMenu = document.getElementById('game-list-menu');
    const backToMainActivitiesButton = document.getElementById('back-to-main-activities-button');

    // --- Check for necessary elements before proceeding ---
    if (!mainContentSections || !contentDisplayArea || !initialActivityMenu || !window.downloadContentData) {
        console.error("Essential main content elements or data objects are missing. Page-specific script will not run.");
        return;
    }

    // --- Global State for Content Section ---
    let currentContentView = 'initial'; // 'initial', 'grades', 'subjects', 'topics'
    let selectedGradeData = null;
    let selectedSubjectData = null;

    // --- Utility function to create a custom button ---
    function createCustomButton(text, onClickHandler, className = '') {
        const button = document.createElement('button');
        button.textContent = text;
        button.onclick = onClickHandler;
        button.className = `px-5 py-2.5 rounded-xl font-semibold text-base bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300 ${className}`;
        return button;
    }

    // --- Content Download Section Logic ---
    function animateContentTransition(callback) {
        if (!contentDisplayArea) return;
        contentDisplayArea.classList.add('animate-fade-out-up');
        contentDisplayArea.addEventListener('animationend', () => {
            contentDisplayArea.classList.remove('animate-fade-out-up');
            contentDisplayArea.innerHTML = ''; // Clear content
            callback();
            contentDisplayArea.classList.add('animate-fade-in-down');
            contentDisplayArea.addEventListener('animationend', () => {
                contentDisplayArea.classList.remove('animate-fade-in-down');
            }, { once: true });
        }, { once: true });
    }

    function renderInitialContentButton() {
        if (!contentBackButtonContainer || !contentDisplayArea) return;
        contentBackButtonContainer.classList.add('hidden');
        contentDisplayArea.innerHTML = '';
        contentDisplayArea.appendChild(createCustomButton('Ver Contenido para Descargar', renderDownloadGrades));
        currentContentView = 'initial';
    }

    function renderDownloadGrades() {
        if (!contentBackButtonContainer || !contentDisplayArea) return;
        contentBackButtonContainer.classList.add('hidden');
        contentDisplayArea.innerHTML = '';
        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg';
        window.downloadContentData.forEach(gradeData => {
            const button = createCustomButton(gradeData.grade, () => {
                selectedGradeData = gradeData;
                animateContentTransition(renderDownloadSubjects);
            }, 'w-full');
            gridDiv.appendChild(button);
        });
        contentDisplayArea.appendChild(gridDiv);
        currentContentView = 'grades';
    }

    function renderDownloadSubjects() {
        if (!selectedGradeData) { renderDownloadGrades(); return; }
        if (!contentBackButtonContainer || !contentDisplayArea) return;
        contentBackButtonContainer.classList.remove('hidden');
        contentDisplayArea.innerHTML = '';
        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg';
        selectedGradeData.subjects.forEach(subjectData => {
            const button = createCustomButton(subjectData.name, () => {
                selectedSubjectData = subjectData;
                animateContentTransition(renderDownloadTopics);
            }, 'w-full');
            gridDiv.appendChild(button);
        });
        contentDisplayArea.appendChild(gridDiv);
        currentContentView = 'subjects';
    }

    function renderDownloadTopics() {
        if (!selectedSubjectData) { renderDownloadSubjects(); return; }
        if (!contentBackButtonContainer || !contentDisplayArea) return;
        contentBackButtonContainer.classList.remove('hidden');
        contentDisplayArea.innerHTML = '';
        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 gap-3 w-full max-w-lg';
        selectedSubjectData.topics.forEach(topic => {
            const link = document.createElement('a');
            link.href = topic.file;
            link.target = '_blank';
            link.className = `flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-base bg-green-600 text-white hover:bg-green-700 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-300 w-full`;
            link.textContent = topic.title;
            link.innerHTML += `<svg class="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l3-3m-3 3l-3-3m0 6h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>`;
            gridDiv.appendChild(link);
        });
        contentDisplayArea.appendChild(gridDiv);
        currentContentView = 'topics';
    }

    // --- Game Loading and Management ---
    const gameScripts = {
        'load-peripherals-game': { html: 'juegos/perifericos.html', js: 'js/perifericos_juego.js', init: 'initializePeripheralsGame', title: 'Juego de Periféricos' },
        'load-webmaster-quiz': { html: 'juegos/webmaster_quiz.html', js: 'js/webmaster_quiz_juego.js', init: 'initQuizGame', title: 'WebMaster Quiz' },
        'load-dexterity-game': { html: 'juegos/destreza_teclado.html', js: 'js/destreza_teclado.js', init: 'initDexterityGame', title: 'Destreza en el Teclado' }
    };

    async function loadGame(gameId) {
        const game = gameScripts[gameId];
        if (!game) { console.error(`Game with id ${gameId} not found.`); return; }

        const header = document.getElementById('main-header');
        if(header) header.classList.add('header-hidden');

        mainContentSections.classList.add('hidden');
        mainContentSections.classList.remove('flex');
        dynamicallyLoadedGameContainer.classList.remove('hidden');
        mainContentTitle.textContent = game.title;

        try {
            const response = await fetch(game.html);
            if (!response.ok) throw new Error(`Failed to load ${game.html}`);
            dynamicallyLoadedGameContainer.innerHTML = await response.text();

            // Remove old script if it exists
            const oldScript = document.querySelector(`script[src="${game.js}"]`);
            if (oldScript) oldScript.remove();

            // Load new script
            const script = document.createElement('script');
            script.src = game.js;
            script.onload = () => {
                if (window[game.init]) {
                    window[game.init](); // No need to pass storage object if it's global or handled within the script
                }
            };
            dynamicallyLoadedGameContainer.appendChild(script);
        } catch (error) {
            console.error(`Error loading game ${gameId}:`, error);
            dynamicallyLoadedGameContainer.innerHTML = `<p class="text-red-500">Error al cargar el juego.</p>`;
        }
    }

    // Expose a global handler for menu clicks to call
    window.handleGameLoad = (action) => {
        if (gameScripts[action]) {
            loadGame(action);
        }
    };

    // Make the return function globally available for games to call
    window.returnToMainContent = function() {
        const header = document.getElementById('main-header');
        if(header) header.classList.remove('header-hidden');

        dynamicallyLoadedGameContainer.innerHTML = '';
        dynamicallyLoadedGameContainer.classList.add('hidden');

        mainContentSections.classList.remove('hidden');
        mainContentSections.classList.add('flex');
        mainContentTitle.textContent = 'Contenido y Actividades';
        renderInitialActivityButton();
    };

    // --- Activity Section Flow ---
    function renderInitialActivityButton() {
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
    }

    // --- Event Listeners ---
    contentBackButton.addEventListener('click', () => {
        animateContentTransition(() => {
            if (currentContentView === 'subjects') {
                renderDownloadGrades();
            } else if (currentContentView === 'topics') {
                renderDownloadSubjects();
            }
        });
    });

    showActivitiesButton.addEventListener('click', renderActivityList);
    backToMainActivitiesButton.addEventListener('click', renderInitialActivityButton);

    gameListMenu.addEventListener('click', (event) => {
        const button = event.target.closest('.game-selector-btn');
        if (button && button.dataset.action) {
            loadGame(button.dataset.action);
        }
    });

    // --- Initialization ---
    renderInitialContentButton();
    renderInitialActivityButton();
});
