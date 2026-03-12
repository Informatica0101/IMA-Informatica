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
            const isOpening = mobileMenuOverlay.classList.contains('d-none');
            mobileMenuOverlay.classList.toggle('d-none');
            mobileMenuOverlay.classList.toggle('mobile-menu-overlay');

            // Toggle icon if using Font Awesome
            const menuBtnIcon = mobileMenuButton ? mobileMenuButton.querySelector('i') : null;
            if (menuBtnIcon) {
                menuBtnIcon.className = isOpening ? 'fa-solid fa-xmark fs-3' : 'fa-solid fa-bars fs-3';
            }

            if (mobileMenuIcon) {
                mobileMenuIcon.setAttribute('d', isOpening ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16');
            }
            if (!isOpening) resetMobileMenuState();
        }

        window.closeMobileMenu = function() {
            mobileMenuOverlay.classList.add('d-none');
            mobileMenuOverlay.classList.remove('mobile-menu-overlay');

            const menuBtnIcon = mobileMenuButton ? mobileMenuButton.querySelector('i') : null;
            if (menuBtnIcon) menuBtnIcon.className = 'fa-solid fa-bars fs-3';

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
            if (!mobileMenuOverlay.classList.contains('d-none') &&
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
            if (installBtnMobile) installBtnMobile.classList.remove('d-none');
            if (installBtnFooter) installBtnFooter.classList.remove('d-none');
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
            if (installBtnMobile) installBtnMobile.classList.remove('d-none');
            if (installBtnFooter) installBtnFooter.classList.remove('d-none');
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
                if (installBtnMobile) installBtnMobile.classList.add('d-none');
                if (installBtnFooter) installBtnFooter.classList.add('d-none');
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
            navigator.serviceWorker.register('sw.js?v=10')
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
        gradeToggle.className = 'mobile-nav-link d-flex justify-content-between align-items-center bg-white border-0 w-100';
        gradeToggle.innerHTML = `<span>${gradeData.grade}</span> <i class="fa-solid fa-chevron-right transition-transform small"></i>`;
        mobileGradesMenu.appendChild(gradeToggle);

        const subjectsContainer = document.createElement('div');
        subjectsContainer.className = 'mobile-menu-item-container hidden-height';
        mobileGradesMenu.appendChild(subjectsContainer);

        gradeToggle.addEventListener('click', () => {
            const isOpening = subjectsContainer.classList.contains('hidden-height');
            subjectsContainer.classList.toggle('hidden-height');
            subjectsContainer.classList.toggle('visible-height');
            const arrow = gradeToggle.querySelector('.fa-chevron-right');
            if (arrow) arrow.classList.toggle('rotate-90');
        });

        gradeData.subjects.forEach(subjectData => {
            const subjectToggle = document.createElement('button');
            subjectToggle.className = 'w-100 text-dark fw-medium text-start px-4 py-3 d-flex justify-content-between align-items-center bg-light border-bottom border-0';
            subjectToggle.innerHTML = `<span>${subjectData.name}</span> <i class="fa-solid fa-chevron-right transition-transform small"></i>`;
            subjectsContainer.appendChild(subjectToggle);

            const topicsContainer = document.createElement('div');
            topicsContainer.className = 'mobile-menu-item-container hidden-height bg-white';
            subjectsContainer.appendChild(topicsContainer);

            subjectToggle.addEventListener('click', () => {
                topicsContainer.classList.toggle('hidden-height');
                topicsContainer.classList.toggle('visible-height');
                const arrow = subjectToggle.querySelector('.fa-chevron-right');
                if (arrow) arrow.classList.toggle('rotate-90');
            });

            subjectData.topics.forEach(topic => {
                const topicLink = document.createElement('a');
                topicLink.href = topic.file;
                topicLink.className = 'd-block px-5 py-2 text-secondary text-decoration-none border-bottom small';
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
            catToggle.className = 'mobile-nav-link d-flex justify-content-between align-items-center bg-white border-0 w-100';
            catToggle.innerHTML = `<span>${cat.category}</span> <i class="fa-solid fa-chevron-right transition-transform small"></i>`;
            mobileAdditionalMenu.appendChild(catToggle);

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'mobile-menu-item-container hidden-height';
            mobileAdditionalMenu.appendChild(itemsContainer);

            catToggle.addEventListener('click', () => {
                itemsContainer.classList.toggle('hidden-height');
                itemsContainer.classList.toggle('visible-height');
                const arrow = catToggle.querySelector('.fa-chevron-right');
                if (arrow) arrow.classList.toggle('rotate-90');
            });

            cat.items.forEach(item => {
                const itemLink = document.createElement('a');
                itemLink.className = 'd-block px-4 py-3 text-dark fw-medium bg-light border-bottom text-decoration-none';
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
            const li = document.createElement('li');
            li.className = 'dropend';
            li.innerHTML = `
                <button class="dropdown-item d-flex justify-content-between align-items-center" type="button">
                    ${gradeData.grade} <i class="fa-solid fa-chevron-right ms-2" style="font-size: 0.7rem;"></i>
                </button>
                <ul class="dropdown-menu shadow">
                    ${gradeData.subjects.map(subject => `
                        <li class="dropend">
                            <button class="dropdown-item d-flex justify-content-between align-items-center" type="button">
                                ${subject.name} <i class="fa-solid fa-chevron-right ms-2" style="font-size: 0.7rem;"></i>
                            </button>
                            <ul class="dropdown-menu shadow">
                                ${subject.topics.map(topic => `
                                    <li><a class="dropdown-item small" href="${topic.file}">${topic.title}</a></li>
                                `).join('')}
                            </ul>
                        </li>
                    `).join('')}
                </ul>
            `;
            desktopGradesMenu.appendChild(li);
        });
    }

    if (desktopAdditionalMenu) {
        desktopAdditionalMenu.innerHTML = '';
        window.additionalResourcesData.forEach(cat => {
            const li = document.createElement('li');
            li.className = 'dropend';
            li.innerHTML = `
                <button class="dropdown-item d-flex justify-content-between align-items-center" type="button">
                    ${cat.category} <i class="fa-solid fa-chevron-right ms-2" style="font-size: 0.7rem;"></i>
                </button>
                <ul class="dropdown-menu shadow" style="min-width: 220px;">
                    ${cat.items.map(item => `
                        <li><a class="dropdown-item small text-wrap" href="${item.action ? '#' : item.file}" ${item.action ? `onclick="handleHeaderAction('${item.action}')"` : 'target="_blank"'}>${item.title}</a></li>
                    `).join('')}
                </ul>
            `;
            desktopAdditionalMenu.appendChild(li);
        });
    }
};
