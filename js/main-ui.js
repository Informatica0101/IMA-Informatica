document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Query Selectors ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuCloseButton = document.getElementById('mobile-menu-close-button');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');
    const mainHeader = document.getElementById('main-header');

    // Toggles for main mobile menu sections
    const mobileCoursesToggle = document.getElementById('mobile-courses-toggle');
    const mobileCoursesArrow = document.getElementById('mobile-courses-arrow');
    const mobileGradesContainer = document.getElementById('mobile-grades-container');

    const mobileAdditionalResourcesToggle = document.getElementById('mobile-additional-resources-toggle');
    const mobileAdditionalResourcesArrow = document.getElementById('mobile-additional-resources-arrow');
    const mobileAdditionalResourcesContainer = document.getElementById('mobile-additional-resources-container');

    // Menu containers (desktop and mobile)
    const desktopGradesMenu = document.getElementById('desktop-grades-menu');
    const desktopAdditionalResourcesMenu = document.getElementById('desktop-additional-resources-menu');
    const mobileGradesMenu = document.getElementById('mobile-grades-menu');
    const mobileAdditionalResourcesMenu = document.getElementById('mobile-additional-resources-menu');

    // --- State Variables ---
    let activeMobileGradeElement = null;
    let activeMobileSubjectElement = null;
    let lastScrollTop = 0;
    const scrollThreshold = 50;

    // --- Check for necessary elements before proceeding ---
    if (!mobileMenuButton || !mainHeader || !window.presentationData || !window.additionalResourcesData) {
        console.error("Essential UI elements or data objects are missing. Main UI script will not run.");
        return;
    }

    // --- Mobile Menu Logic ---
    function toggleMobileMenu() {
        mobileMenuOverlay.classList.toggle('hidden');
        mobileMenuOverlay.classList.toggle('mobile-menu-overlay');
        mobileMenuIcon.setAttribute('d', mobileMenuOverlay.classList.contains('hidden') ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12');
        if (mobileMenuOverlay.classList.contains('hidden')) resetMobileMenuState();
    }

    function closeMobileMenu() {
        if (!mobileMenuOverlay.classList.contains('hidden')) {
            mobileMenuOverlay.classList.add('hidden');
            mobileMenuOverlay.classList.remove('mobile-menu-overlay');
            mobileMenuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
            resetMobileMenuState();
        }
    }

    function resetMobileMenuState() {
        // Close main sections
        mobileGradesContainer.classList.remove('visible-height');
        mobileGradesContainer.classList.add('hidden-height');
        mobileCoursesArrow.classList.remove('rotate-90');

        mobileAdditionalResourcesContainer.classList.remove('visible-height');
        mobileAdditionalResourcesContainer.classList.add('hidden-height');
        mobileAdditionalResourcesArrow.classList.remove('rotate-90');

        // Close any open sub-menus
        if (activeMobileGradeElement) {
            activeMobileGradeElement.classList.remove('visible-height');
            activeMobileGradeElement.classList.add('hidden-height');
            activeMobileGradeElement.previousElementSibling.querySelector('span').classList.remove('rotate-90');
            activeMobileGradeElement = null;
        }
        if (activeMobileSubjectElement) {
            activeMobileSubjectElement.classList.remove('visible-height');
            activeMobileSubjectElement.classList.add('hidden-height');
            activeMobileSubjectElement.previousElementSibling.querySelector('span').classList.remove('rotate-90');
            activeMobileSubjectElement = null;
        }
    }

    // --- Menu Rendering Logic ---

    // Renders the main desktop navigation dropdowns
    function renderDesktopNav() {
        if (!desktopGradesMenu || !desktopAdditionalResourcesMenu) return;
        desktopGradesMenu.innerHTML = '';
        desktopAdditionalResourcesMenu.innerHTML = '';

        // Render 'Cursos' from presentationData
        window.presentationData.forEach(gradeData => {
            const gradeDiv = document.createElement('div');
            gradeDiv.className = 'relative group/grade';
            gradeDiv.innerHTML = `
                <button class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-200 focus:outline-none">
                    ${gradeData.grade} <span class="float-right text-xs">&#9656;</span>
                </button>
                <div class="absolute left-full top-0 mt-0 w-56 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover/grade:opacity-100 group-hover/grade:visible transition-all duration-300 ease-in-out transform scale-95 group-hover/grade:scale-100 origin-left">
                    ${gradeData.subjects.map(subjectData => `
                        <div class="relative group/subject">
                            <button class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-200 focus:outline-none">
                                ${subjectData.name} <span class="float-right text-xs">&#9656;</span>
                            </button>
                            <div class="absolute left-full top-0 mt-0 w-64 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover/subject:opacity-100 group-hover/subject:visible transition-all duration-300 ease-in-out transform scale-95 group-hover/subject:scale-100 origin-left">
                                ${subjectData.topics.map(topic => `
                                    <a href="${topic.file}" class="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-200">${topic.title}</a>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            desktopGradesMenu.appendChild(gradeDiv);
        });

        // Render 'Recursos Adicionales'
        window.additionalResourcesData.forEach(resourceCategory => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'relative group/resource-cat';
            let itemsHtml = resourceCategory.items.map(item => {
                const isGame = item.action && item.action.startsWith('load-');
                const href = isGame ? '#' : item.file;
                const target = isGame ? '' : 'target="_blank"';
                const actionData = isGame ? `data-action="${item.action}"` : '';
                return `<a href="${href}" ${target} ${actionData} class="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-200">${item.title}</a>`;
            }).join('');

            categoryDiv.innerHTML = `
                <button class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-200 focus:outline-none">
                    ${resourceCategory.category} <span class="float-right text-xs">&#9656;</span>
                </button>
                <div class="absolute left-full top-0 mt-0 w-64 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover/resource-cat:opacity-100 group-hover/resource-cat:visible transition-all duration-300 ease-in-out transform scale-95 group-hover/resource-cat:scale-100 origin-left">
                    ${itemsHtml}
                </div>
            `;
            desktopAdditionalResourcesMenu.appendChild(categoryDiv);
        });
    }

    // Renders the mobile navigation accordions
    function renderMobileNav() {
        if (!mobileGradesMenu || !mobileAdditionalResourcesMenu) return;
        mobileGradesMenu.innerHTML = '';
        mobileAdditionalResourcesMenu.innerHTML = '';

        // Render 'Cursos' from presentationData
        window.presentationData.forEach(gradeData => {
            const gradeContainer = document.createElement('div');
            gradeContainer.innerHTML = `
                <button class="w-full text-gray-700 hover:text-blue-600 font-semibold text-lg text-left py-2 flex justify-between items-center transition-colors duration-200 border-b border-gray-200">
                    ${gradeData.grade} <span class="transform transition-transform duration-300">&#9656;</span>
                </button>
                <div class="mobile-menu-item-container hidden-height pl-4">
                    ${gradeData.subjects.map(subjectData => `
                        <div>
                            <button class="w-full text-gray-600 hover:text-blue-500 font-medium text-base text-left py-2 flex justify-between items-center transition-colors duration-200 border-b border-gray-100">
                                ${subjectData.name} <span class="transform transition-transform duration-300">&#9656;</span>
                            </button>
                            <div class="mobile-menu-item-container hidden-height pl-4">
                                ${subjectData.topics.map(topic => `
                                    <a href="${topic.file}" class="block px-2 py-1 text-gray-500 hover:text-blue-400 text-sm transition-colors duration-200">${topic.title}</a>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            mobileGradesMenu.appendChild(gradeContainer);
        });

        // Render 'Recursos Adicionales' for mobile
        window.additionalResourcesData.forEach(resourceCategory => {
            const categoryContainer = document.createElement('div');
            let itemsHtml = resourceCategory.items.map(item => {
                const isGame = item.action && item.action.startsWith('load-');
                const href = isGame ? '#' : item.file;
                const target = isGame ? '' : 'target="_blank"';
                const actionData = isGame ? `data-action="${item.action}"` : '';
                return `<a href="${href}" ${target} ${actionData} class="block px-2 py-1 text-gray-500 hover:text-blue-400 text-sm transition-colors duration-200">${item.title}</a>`;
            }).join('');

            categoryContainer.innerHTML = `
                <button class="w-full text-gray-700 hover:text-blue-600 font-semibold text-lg text-left py-2 flex justify-between items-center transition-colors duration-200 border-b border-gray-200">
                    ${resourceCategory.category} <span class="transform transition-transform duration-300">&#9656;</span>
                </button>
                <div class="mobile-menu-item-container hidden-height pl-4">
                    ${itemsHtml}
                </div>
            `;
            mobileAdditionalResourcesMenu.appendChild(categoryContainer);
        });
    }

    // --- Event Delegation for Dynamic Menus ---
    function handleMobileMenuClick(event) {
        const button = event.target.closest('button');
        if (!button) {
            // If it's a link, close the menu
            if (event.target.tagName === 'A') {
                // Handle game links specifically if needed
                if (event.target.dataset.action && typeof window.handleGameLoad === 'function') {
                    event.preventDefault();
                    window.handleGameLoad(event.target.dataset.action);
                }
                closeMobileMenu();
            }
            return;
        }

        const container = button.nextElementSibling;
        if (!container || !container.classList.contains('mobile-menu-item-container')) return;

        const isGradeButton = mobileGradesMenu.contains(button) && button.parentElement.parentElement === mobileGradesMenu;
        const isSubjectButton = mobileGradesMenu.contains(button) && !isGradeButton;
        const isResourceButton = mobileAdditionalResourcesMenu.contains(button);

        // Toggle logic
        const isOpening = container.classList.contains('hidden-height');

        // Close previously open items at the same or higher level
        if (isGradeButton || isResourceButton) {
            if (activeMobileGradeElement && activeMobileGradeElement !== container) {
                activeMobileGradeElement.classList.remove('visible-height');
                activeMobileGradeElement.classList.add('hidden-height');
                activeMobileGradeElement.previousElementSibling.querySelector('span').classList.remove('rotate-90');
            }
            if (activeMobileSubjectElement) {
                activeMobileSubjectElement.classList.remove('visible-height');
                activeMobileSubjectElement.classList.add('hidden-height');
                activeMobileSubjectElement.previousElementSibling.querySelector('span').classList.remove('rotate-90');
                activeMobileSubjectElement = null;
            }
        } else if (isSubjectButton) {
            if (activeMobileSubjectElement && activeMobileSubjectElement !== container) {
                activeMobileSubjectElement.classList.remove('visible-height');
                activeMobileSubjectElement.classList.add('hidden-height');
                activeMobileSubjectElement.previousElementSibling.querySelector('span').classList.remove('rotate-90');
            }
        }

        // Toggle the clicked item
        container.classList.toggle('hidden-height', !isOpening);
        container.classList.toggle('visible-height', isOpening);
        button.querySelector('span')?.classList.toggle('rotate-90', isOpening);

        // Update the active element state
        if (isGradeButton || isResourceButton) {
            activeMobileGradeElement = isOpening ? container : null;
        } else if (isSubjectButton) {
            activeMobileSubjectElement = isOpening ? container : null;
        }
    }

    // --- Header Scroll Logic ---
    function handleScroll() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScrollTop > lastScrollTop && currentScrollTop > mainHeader.offsetHeight + scrollThreshold) {
            mainHeader.classList.add('header-hidden');
        } else if (currentScrollTop < lastScrollTop) {
            mainHeader.classList.remove('header-hidden');
        }
        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    }

    // --- Event Listeners ---
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    mobileMenuCloseButton.addEventListener('click', toggleMobileMenu);

    mobileCoursesToggle.addEventListener('click', () => {
        mobileGradesContainer.classList.toggle('hidden-height');
        mobileGradesContainer.classList.toggle('visible-height');
        mobileCoursesArrow.classList.toggle('rotate-90');
        // Close other main section
        mobileAdditionalResourcesContainer.classList.add('hidden-height');
        mobileAdditionalResourcesContainer.classList.remove('visible-height');
        mobileAdditionalResourcesArrow.classList.remove('rotate-90');
    });

    mobileAdditionalResourcesToggle.addEventListener('click', () => {
        mobileAdditionalResourcesContainer.classList.toggle('hidden-height');
        mobileAdditionalResourcesContainer.classList.toggle('visible-height');
        mobileAdditionalResourcesArrow.classList.toggle('rotate-90');
        // Close other main section
        mobileGradesContainer.classList.add('hidden-height');
        mobileGradesContainer.classList.remove('visible-height');
        mobileCoursesArrow.classList.remove('rotate-90');
    });

    // Delegated listeners for dynamic content
    mobileGradesMenu.addEventListener('click', handleMobileMenuClick);
    mobileAdditionalResourcesMenu.addEventListener('click', handleMobileMenuClick);

    // Listener for desktop game links
    if (desktopAdditionalResourcesMenu) {
        desktopAdditionalResourcesMenu.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && link.dataset.action && typeof window.handleGameLoad === 'function') {
                event.preventDefault();
                window.handleGameLoad(link.dataset.action);
            }
        });
    }

    window.addEventListener('scroll', handleScroll);

    // --- Initialization ---
    function init() {
        // Set current year in footer if it exists
        const currentYearEl = document.getElementById('current-year');
        if (currentYearEl) {
            currentYearEl.textContent = new Date().getFullYear();
        }

        // Render menus
        renderDesktopNav();
        renderMobileNav();
    }

    init();
});
