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

    // --- PWA Logic ---
    setupPWALogic();

    // Render Mobile Nav
    window.renderMobileNav();

    // (A-28) Signal that common UI is ready
    document.dispatchEvent(new CustomEvent('common-ui-ready'));
};

/**
 * PWA Logic: Installation and Service Worker registration
 */
function setupPWALogic() {
    let deferredPrompt;
    const installBtnMobile = document.getElementById("pwa-install-button-mobile");
    const installBtnFooter = document.getElementById("pwa-install-button-footer");
    const iosModal = document.getElementById("ios-install-modal");

    // Detect platforms
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

    // Logic to show install buttons
    function showInstallButtons() {
        if (isStandalone) return;

        // iOS always shows the button if not standalone (manual instructions)
        if (isIOS) {
            if (installBtnMobile) installBtnMobile.classList.remove("hidden");
            if (installBtnFooter) installBtnFooter.classList.remove("hidden");
        }
    }

    // Initial check
    showInstallButtons();

    window.addEventListener("beforeinstallprompt", (e) => {
        // Prevent Chrome from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Show the buttons now that we know we can prompt
        if (!isStandalone) {
            if (installBtnMobile) installBtnMobile.classList.remove("hidden");
            if (installBtnFooter) installBtnFooter.classList.remove("hidden");
        }
    });

    async function handleInstall() {
        // If iOS, show the special instructions modal
        if (isIOS) {
            if (iosModal) iosModal.classList.remove("opacity-0", "pointer-events-none");

            // Atajo para iOS: Intentar abrir el menú de compartir directamente
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'InformaticApp',
                        text: 'Instalar plataforma educativa en tu pantalla de inicio',
                        url: window.location.origin + window.location.pathname
                    });
                } catch (err) {
                    // El usuario canceló o el navegador no lo soporta
                    console.log('Share sheet dismissed', err);
                }
            }
            return;
        }

        // If we have the deferredPrompt (Android/Chrome/PC), use it
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                if (installBtnMobile) installBtnMobile.classList.add("hidden");
                if (installBtnFooter) installBtnFooter.classList.add("hidden");
                deferredPrompt = null;
            }
        } else {
            // Fallback for mobile browsers where prompt is not available
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

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js?v=9')
                .then(reg => {
                    console.log('SW registrado', reg);
                    // Forzar actualización si hay un nuevo SW esperando
                    reg.onupdatefound = () => {
                        const installingWorker = reg.installing;
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('Nuevo contenido disponible; por favor refresca.');
                                if(confirm("Nueva versión disponible. ¿Deseas actualizar ahora?")) {
                                    window.location.reload();
                                }
                            }
                        };
                    };
                })
                .catch(err => console.log('SW error', err));
        });

        // Asegurar que los cambios se apliquen al recargar
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                window.location.reload();
                refreshing = true;
            }
        });
    }
}

window.handleHeaderAction = function(action) {
    if (!window.showMainContentSections) {
        // Si no estamos en la home, redirigir a index.html con el parámetro de acción
        window.location.href = `index.html?action=${action}`;
        return;
    }
    window.showMainContentSections();
    if (action === 'load-peripherals-game') { if(window.loadPeripheralsGame) window.loadPeripheralsGame(); }
    else if (action === 'load-webmaster-quiz') { if(window.loadWebMasterQuiz) window.loadWebMasterQuiz(); }
    else if (action === 'load-dexterity-game') { if(window.loadDexterityGame) window.loadDexterityGame(); }
    if (window.closeMobileMenu) window.closeMobileMenu();
};

window.renderMobileNav = function() {
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
            const arrow = gradeToggle.querySelector('span');
            if (arrow) arrow.classList.toggle('rotate-90');
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
                const arrow = subjectToggle.querySelector('span');
                if (arrow) arrow.classList.toggle('rotate-90');
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
    if (mobileAdditionalMenu && window.additionalResourcesData) {
        mobileAdditionalMenu.innerHTML = '';
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
                const arrow = catToggle.querySelector('span');
                if (arrow) arrow.classList.toggle('rotate-90');
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
};
