/**
 * Common UI Logic for all pages (Header, Mobile Menu, Scroll)
 */

window.setupCommonUI = function() {
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

    let activeMobileGradeElement = null;
    let activeMobileSubjectElement = null;
    let lastScrollTop = 0;
    const scrollThreshold = 10;

    // --- Header & Scroll Logic ---
    if (mainHeader) {
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
    }

    // --- Mobile Menu Logic ---
    if (mobileMenuOverlay) {
        function toggleMobileMenu() {
            const isOpening = mobileMenuOverlay.classList.contains('hidden');
            mobileMenuOverlay.classList.toggle('hidden');
            mobileMenuOverlay.classList.toggle('mobile-menu-overlay');
            if (mobileMenuIcon) {
                mobileMenuIcon.setAttribute('d', isOpening ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16');
            }
            if (!isOpening) resetMobileMenuState();
        }

        window.closeMobileMenu = function() {
            mobileMenuOverlay.classList.add('hidden');
            mobileMenuOverlay.classList.remove('mobile-menu-overlay');
            if (mobileMenuIcon) mobileMenuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
            resetMobileMenuState();
        }

        function resetMobileMenuState() {
            [mobileGradesContainer, mobileAdditionalResourcesContainer].forEach(el => {
                if (el) { el.classList.add('hidden-height'); el.classList.remove('visible-height'); }
            });
            [mobileCoursesArrow, mobileAdditionalResourcesArrow].forEach(el => {
                if (el) el.classList.remove('rotate-90');
            });
        }

        if (mobileMenuButton) mobileMenuButton.addEventListener('click', toggleMobileMenu);
        if (mobileMenuCloseButton) mobileMenuCloseButton.addEventListener('click', toggleMobileMenu);

        document.addEventListener('mousedown', (e) => {
            if (!mobileMenuOverlay.classList.contains('hidden') &&
                !mobileMenuOverlay.contains(e.target) &&
                !mobileMenuButton.contains(e.target)) {
                closeMobileMenu();
            }
        });

        if (mobileCoursesToggle) {
            mobileCoursesToggle.addEventListener('click', () => {
                const isExpanding = mobileGradesContainer.classList.contains('hidden-height');
                mobileGradesContainer.classList.toggle('hidden-height');
                mobileGradesContainer.classList.toggle('visible-height');
                if (mobileCoursesArrow) mobileCoursesArrow.classList.toggle('rotate-90');
                if (isExpanding && mobileAdditionalResourcesContainer) {
                    mobileAdditionalResourcesContainer.classList.add('hidden-height');
                    mobileAdditionalResourcesContainer.classList.remove('visible-height');
                    if (mobileAdditionalResourcesArrow) mobileAdditionalResourcesArrow.classList.remove('rotate-90');
                }
            });
        }

        if (mobileAdditionalResourcesToggle) {
            mobileAdditionalResourcesToggle.addEventListener('click', () => {
                const isExpanding = mobileAdditionalResourcesContainer.classList.contains('hidden-height');
                mobileAdditionalResourcesContainer.classList.toggle('hidden-height');
                mobileAdditionalResourcesContainer.classList.toggle('visible-height');
                if (mobileAdditionalResourcesArrow) mobileAdditionalResourcesArrow.classList.toggle('rotate-90');
                if (isExpanding && mobileGradesContainer) {
                    mobileGradesContainer.classList.add('hidden-height');
                    mobileGradesContainer.classList.remove('visible-height');
                    if (mobileCoursesArrow) mobileCoursesArrow.classList.remove('rotate-90');
                }
            });
        }
    }

    // --- Logout Logic ---
    const logoutBtn = document.getElementById('logout-button');
    const mobileLogoutBtn = document.getElementById('mobile-logout-button');
    if (logoutBtn || mobileLogoutBtn) {
        const handleLogout = () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        };
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
    }

    // Set Year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
};

window.renderCommonNav = function() {
    const desktopGradesMenu = document.getElementById('desktop-grades-menu');
    const desktopAdditionalMenu = document.getElementById('desktop-additional-resources-menu');
    const mobileGradesMenu = document.getElementById('mobile-grades-menu');
    const mobileAdditionalMenu = document.getElementById('mobile-additional-resources-menu');

    if (!window.presentationData) return;

    // Helper for submenus
    function closeSubMenu(element) {
        element.classList.add('hidden-height');
        element.classList.remove('visible-height');
        const arrow = element.previousElementSibling.querySelector('span');
        if (arrow) arrow.classList.remove('rotate-90');
    }

    // Render Desktop
    if (desktopGradesMenu) {
        desktopGradesMenu.innerHTML = '';
        window.presentationData.forEach(gradeData => {
            const gradeDiv = document.createElement('div');
            gradeDiv.className = 'relative group/grade';
            gradeDiv.innerHTML = `
                <button class="block w-full text-left px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors duration-200 focus:outline-none">
                    ${gradeData.grade} <span class="float-right text-xs mt-1">&#9656;</span>
                </button>
                <div class="absolute left-full top-0 mt-0 w-56 bg-white rounded-lg shadow-xl py-2 opacity-0 invisible group-hover/grade:opacity-100 group-hover/grade:visible transition-all duration-300 ease-in-out transform scale-95 group-hover/grade:scale-100 origin-left border border-gray-100">
                    ${gradeData.subjects.map(subject => `
                        <div class="relative group/subject">
                            <button class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 focus:outline-none">
                                ${subject.name} <span class="float-right text-xs mt-1">&#9656;</span>
                            </button>
                            <div class="absolute left-full top-0 mt-0 w-64 bg-white rounded-lg shadow-xl py-2 opacity-0 invisible group-hover/subject:opacity-100 group-hover/subject:visible transition-all duration-300 ease-in-out transform scale-95 group-hover/subject:scale-100 origin-left border border-gray-100">
                                ${subject.topics.map(topic => `
                                    <a href="${topic.file}" class="block px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 text-sm">${topic.title}</a>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            desktopGradesMenu.appendChild(gradeDiv);
        });
    }

    if (desktopAdditionalMenu) {
        desktopAdditionalMenu.innerHTML = '';
        window.additionalResourcesData.forEach(cat => {
            const catDiv = document.createElement('div');
            catDiv.className = 'relative group/resource-cat';
            catDiv.innerHTML = `
                <button class="block w-full text-left px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors duration-200 focus:outline-none">
                    ${cat.category} <span class="float-right text-xs mt-1">&#9656;</span>
                </button>
                <div class="absolute left-full top-0 mt-0 w-64 bg-white rounded-lg shadow-xl py-2 opacity-0 invisible group-hover/resource-cat:opacity-100 group-hover/resource-cat:visible transition-all duration-300 ease-in-out transform scale-95 group-hover/resource-cat:scale-100 origin-left border border-gray-100">
                    ${cat.items.map(item => `
                        <a href="${item.action ? '#' : item.file}" ${item.action ? `onclick="handleHeaderAction('${item.action}')"` : 'target="_blank"'} class="block px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 text-sm">${item.title}</a>
                    `).join('')}
                </div>
            `;
            desktopAdditionalMenu.appendChild(catDiv);
        });
    }

    // Mobile render is complex due to event listeners, skipped for simple unification or simplified
};
