/**
 * UI Logic for index.html
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mainHeader = document.getElementById('main-header');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuCloseButton = document.getElementById('mobile-menu-close-button');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');

    const mobileCoursesToggle = document.getElementById('mobile-courses-toggle');
    const mobileCoursesArrow = document.getElementById('mobile-courses-arrow');
    const mobileGradesContainer = document.getElementById('mobile-grades-container');
    const mobileGradesMenu = document.getElementById('mobile-grades-menu');

    const mobileAdditionalResourcesToggle = document.getElementById('mobile-additional-resources-toggle');
    const mobileAdditionalResourcesArrow = document.getElementById('mobile-additional-resources-arrow');
    const mobileAdditionalResourcesContainer = document.getElementById('mobile-additional-resources-container');
    const mobileAdditionalResourcesMenu = document.getElementById('mobile-additional-resources-menu');

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
    let activeMobileGradeElement = null;
    let activeMobileSubjectElement = null;
    let currentContentView = 'initial';
    let selectedGradeData = null;
    let selectedSubjectData = null;
    let lastScrollTop = 0;
    const scrollThreshold = 10;

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

    // --- Header & Scroll Logic ---
    window.addEventListener('scroll', () => {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Header Hide/Show on scroll
        if (currentScrollTop > lastScrollTop && currentScrollTop > mainHeader.offsetHeight + 50) {
            mainHeader.classList.add('header-hidden');
        } else if (currentScrollTop < lastScrollTop) {
            mainHeader.classList.remove('header-hidden');
        }

        // Header visual state change (scrolled)
        if (currentScrollTop > scrollThreshold) {
            mainHeader.classList.add('header-scrolled');
        } else {
            mainHeader.classList.remove('header-scrolled');
        }

        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    });

    // --- Mobile Menu Logic ---
    function toggleMobileMenu() {
        const isOpening = mobileMenuOverlay.classList.contains('hidden');
        mobileMenuOverlay.classList.toggle('hidden');
        mobileMenuOverlay.classList.toggle('mobile-menu-overlay');

        // Update icon
        mobileMenuIcon.setAttribute('d', isOpening ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16');

        if (!isOpening) {
            resetMobileMenuState();
        }
    }

    window.closeMobileMenu = function() {
        mobileMenuOverlay.classList.add('hidden');
        mobileMenuOverlay.classList.remove('mobile-menu-overlay');
        mobileMenuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
        resetMobileMenuState();
    }

    function resetMobileMenuState() {
        // Reset top level toggles
        [mobileGradesContainer, mobileAdditionalResourcesContainer].forEach(el => {
            el.classList.add('hidden-height');
            el.classList.remove('visible-height');
        });
        [mobileCoursesArrow, mobileAdditionalResourcesArrow].forEach(el => {
            el.classList.remove('rotate-90');
        });

        // Reset sub-menus
        if (activeMobileGradeElement) {
            closeSubMenu(activeMobileGradeElement);
            activeMobileGradeElement = null;
        }
        if (activeMobileSubjectElement) {
            closeSubMenu(activeMobileSubjectElement);
            activeMobileSubjectElement = null;
        }
    }

    function closeSubMenu(element) {
        element.classList.add('hidden-height');
        element.classList.remove('visible-height');
        const arrow = element.previousElementSibling.querySelector('span');
        if (arrow) arrow.classList.remove('rotate-90');
    }

    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    mobileMenuCloseButton.addEventListener('click', toggleMobileMenu);

    document.addEventListener('mousedown', (e) => {
        if (!mobileMenuOverlay.classList.contains('hidden') &&
            !mobileMenuOverlay.contains(e.target) &&
            !mobileMenuButton.contains(e.target)) {
            closeMobileMenu();
        }
    });

    mobileCoursesToggle.addEventListener('click', () => {
        const isExpanding = mobileGradesContainer.classList.contains('hidden-height');
        mobileGradesContainer.classList.toggle('hidden-height');
        mobileGradesContainer.classList.toggle('visible-height');
        mobileCoursesArrow.classList.toggle('rotate-90');

        if (isExpanding) {
            mobileAdditionalResourcesContainer.classList.add('hidden-height');
            mobileAdditionalResourcesContainer.classList.remove('visible-height');
            mobileAdditionalResourcesArrow.classList.remove('rotate-90');
        }
    });

    mobileAdditionalResourcesToggle.addEventListener('click', () => {
        const isExpanding = mobileAdditionalResourcesContainer.classList.contains('hidden-height');
        mobileAdditionalResourcesContainer.classList.toggle('hidden-height');
        mobileAdditionalResourcesContainer.classList.toggle('visible-height');
        mobileAdditionalResourcesArrow.classList.toggle('rotate-90');

        if (isExpanding) {
            mobileGradesContainer.classList.add('hidden-height');
            mobileGradesContainer.classList.remove('visible-height');
            mobileCoursesArrow.classList.remove('rotate-90');
        }
    });

    // --- Desktop Menu Rendering ---
    function renderDesktopNav() {
        const desktopGradesMenu = document.getElementById('desktop-grades-menu');
        if (!desktopGradesMenu) return;
        desktopGradesMenu.innerHTML = '';

        window.presentationData.forEach(gradeData => {
            const gradeDiv = document.createElement('div');
            gradeDiv.className = 'relative group/grade';
            gradeDiv.innerHTML = `
                <button class="block w-full text-left px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors duration-200 focus:outline-none">
                    ${gradeData.grade} <span class="float-right text-xs mt-1">&#9656;</span>
                </button>
            `;

            const subjectDiv = document.createElement('div');
            subjectDiv.className = 'absolute left-full top-0 mt-0 w-56 bg-white rounded-lg shadow-xl py-2 opacity-0 invisible group-hover/grade:opacity-100 group-hover/grade:visible transition-all duration-300 ease-in-out transform scale-95 group-hover/grade:scale-100 origin-left border border-gray-100';

            gradeData.subjects.forEach(subjectData => {
                const subjectSubDiv = document.createElement('div');
                subjectSubDiv.className = 'relative group/subject';
                subjectSubDiv.innerHTML = `
                    <button class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 focus:outline-none">
                        ${subjectData.name} <span class="float-right text-xs mt-1">&#9656;</span>
                    </button>
                `;

                const topicDiv = document.createElement('div');
                topicDiv.className = 'absolute left-full top-0 mt-0 w-64 bg-white rounded-lg shadow-xl py-2 opacity-0 invisible group-hover/subject:opacity-100 group-hover/subject:visible transition-all duration-300 ease-in-out transform scale-95 group-hover/subject:scale-100 origin-left border border-gray-100';

                subjectData.topics.forEach(topic => {
                    const topicLink = document.createElement('a');
                    topicLink.href = topic.file;
                    topicLink.className = 'block px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 text-sm';
                    topicLink.textContent = topic.title;
                    topicDiv.appendChild(topicLink);
                });
                subjectSubDiv.appendChild(topicDiv);
                subjectDiv.appendChild(subjectSubDiv);
            });
            gradeDiv.appendChild(subjectDiv);
            desktopGradesMenu.appendChild(gradeDiv);
        });

        // Recursos Adicionales Desktop
        const desktopAdditionalResourcesMenu = document.getElementById('desktop-additional-resources-menu');
        if (!desktopAdditionalResourcesMenu) return;
        desktopAdditionalResourcesMenu.innerHTML = '';

        window.additionalResourcesData.forEach(resourceCategory => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'relative group/resource-cat';
            categoryDiv.innerHTML = `
                <button class="block w-full text-left px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors duration-200 focus:outline-none">
                    ${resourceCategory.category} <span class="float-right text-xs mt-1">&#9656;</span>
                </button>
            `;

            const itemsDiv = document.createElement('div');
            itemsDiv.className = 'absolute left-full top-0 mt-0 w-64 bg-white rounded-lg shadow-xl py-2 opacity-0 invisible group-hover/resource-cat:opacity-100 group-hover/resource-cat:visible transition-all duration-300 ease-in-out transform scale-95 group-hover/resource-cat:scale-100 origin-left border border-gray-100';

            resourceCategory.items.forEach(item => {
                const itemLink = document.createElement('a');
                if (item.action) {
                    itemLink.href = '#';
                    itemLink.onclick = (e) => {
                        e.preventDefault();
                        handleHeaderAction(item.action);
                    };
                } else {
                    itemLink.href = item.file;
                    itemLink.target = '_blank';
                }
                itemLink.className = 'block px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 text-sm';
                itemLink.textContent = item.title;
                itemsDiv.appendChild(itemLink);
            });
            categoryDiv.appendChild(itemsDiv);
            desktopAdditionalResourcesMenu.appendChild(categoryDiv);
        });
    }

    function handleHeaderAction(action) {
        showMainContentSections();
        if (action === 'load-peripherals-game') loadPeripheralsGame();
        else if (action === 'load-webmaster-quiz') loadWebMasterQuiz();
        else if (action === 'load-dexterity-game') loadDexterityGame();
        closeMobileMenu();
    }

    // --- Mobile Menu Rendering ---
    function renderMobileNav() {
        mobileGradesMenu.innerHTML = '';
        mobileAdditionalResourcesMenu.innerHTML = '';

        window.presentationData.forEach(gradeData => {
            const gradeToggle = document.createElement('button');
            gradeToggle.className = 'mobile-nav-link justify-between bg-white';
            gradeToggle.innerHTML = `${gradeData.grade} <span class="transform transition-transform duration-300">&#9656;</span>`;
            mobileGradesMenu.appendChild(gradeToggle);

            const subjectsContainer = document.createElement('div');
            subjectsContainer.className = 'mobile-menu-item-container hidden-height';
            mobileGradesMenu.appendChild(subjectsContainer);

            gradeToggle.addEventListener('click', () => {
                if (activeMobileGradeElement && activeMobileGradeElement !== subjectsContainer) {
                    closeSubMenu(activeMobileGradeElement);
                }
                subjectsContainer.classList.toggle('hidden-height');
                subjectsContainer.classList.toggle('visible-height');
                gradeToggle.querySelector('span').classList.toggle('rotate-90');
                activeMobileGradeElement = subjectsContainer.classList.contains('visible-height') ? subjectsContainer : null;
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
                    if (activeMobileSubjectElement && activeMobileSubjectElement !== topicsContainer) {
                        closeSubMenu(activeMobileSubjectElement);
                    }
                    topicsContainer.classList.toggle('hidden-height');
                    topicsContainer.classList.toggle('visible-height');
                    subjectToggle.querySelector('span').classList.toggle('rotate-90');
                    activeMobileSubjectElement = topicsContainer.classList.contains('visible-height') ? topicsContainer : null;
                });

                subjectData.topics.forEach(topic => {
                    const topicLink = document.createElement('a');
                    topicLink.href = topic.file;
                    topicLink.className = 'block px-12 py-3 text-gray-600 text-sm border-b border-gray-200';
                    topicLink.textContent = topic.title;
                    topicLink.onclick = closeMobileMenu;
                    topicsContainer.appendChild(topicLink);
                });
            });
        });

        // Recursos Adicionales Mobile
        window.additionalResourcesData.forEach(resourceCategory => {
            const categoryToggle = document.createElement('button');
            categoryToggle.className = 'mobile-nav-link justify-between bg-white';
            categoryToggle.innerHTML = `${resourceCategory.category} <span class="transform transition-transform duration-300">&#9656;</span>`;
            mobileAdditionalResourcesMenu.appendChild(categoryToggle);

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'mobile-menu-item-container hidden-height';
            mobileAdditionalResourcesMenu.appendChild(itemsContainer);

            categoryToggle.addEventListener('click', () => {
                if (activeMobileGradeElement && activeMobileGradeElement !== itemsContainer) {
                    closeSubMenu(activeMobileGradeElement);
                }
                itemsContainer.classList.toggle('hidden-height');
                itemsContainer.classList.toggle('visible-height');
                categoryToggle.querySelector('span').classList.toggle('rotate-90');
                activeMobileGradeElement = itemsContainer.classList.contains('visible-height') ? itemsContainer : null;
            });

            resourceCategory.items.forEach(item => {
                const itemLink = document.createElement('a');
                itemLink.className = 'block px-8 py-3 text-gray-700 font-medium bg-gray-50 border-b border-gray-100';
                itemLink.textContent = item.title;
                if (item.action) {
                    itemLink.href = '#';
                    itemLink.onclick = (e) => {
                        e.preventDefault();
                        handleHeaderAction(item.action);
                    };
                } else {
                    itemLink.href = item.file;
                    itemLink.target = '_blank';
                    itemLink.onclick = closeMobileMenu;
                }
                itemsContainer.appendChild(itemLink);
            });
        });
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

    // --- Activities & Games Logic ---
    function showMainContentSections() {
        mainContentSections.classList.remove('hidden');
        mainContentSections.classList.add('flex');
        dynamicallyLoadedGameContainer.classList.add('hidden');
        mainContentTitle.textContent = 'Contenido y Actividades';
        renderInitialActivityButton();
        window.scrollTo({ top: mainContentTitle.offsetTop - 100, behavior: 'smooth' });
    }

    async function loadGame(gameId, htmlPath, jsPath, initFnName, title) {
        mainHeader.classList.add('header-hidden');
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
        mainHeader.classList.remove('header-hidden');
        dynamicallyLoadedGameContainer.innerHTML = '';
        ['js/perifericos_juego.js', 'js/webmaster_quiz_juego.js', 'js/destreza_teclado.js'].forEach(src => {
            const s = document.querySelector(`script[src="${src}"]`);
            if (s) s.remove();
        });
        showMainContentSections();
    };

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
        mainContentTitle.textContent = 'Actividades';
    }

    showActivitiesButton.addEventListener('click', renderActivityList);
    document.getElementById('select-peripherals-game-button').addEventListener('click', loadPeripheralsGame);
    document.getElementById('select-webmaster-quiz-button').addEventListener('click', loadWebMasterQuiz);
    document.getElementById('select-dexterity-game-button').addEventListener('click', loadDexterityGame);
    backToMainActivitiesButton.addEventListener('click', renderInitialActivityButton);

    // --- Initialization ---
    document.getElementById('current-year').textContent = new Date().getFullYear();
    renderDesktopNav();
    renderMobileNav();
    renderInitialContentButton();
    renderInitialActivityButton();

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
});
