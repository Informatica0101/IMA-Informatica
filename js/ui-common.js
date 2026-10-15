/**
 * Common UI Logic for all pages (Header, Mobile Menu, Scroll)
 * ES5 Compliance Mandatory.
 */

window.setupCommonUI = function() {
    var mainHeader = document.getElementById('main-header');
    var openProfileBtn = document.getElementById('open-profile-btn');
    var mobileProfileBtn = document.getElementById('mobile-profile-btn-nav');

    // Restoration fix: Ensure header is visible on init
    if (mainHeader) {
        mainHeader.classList.remove('header-hidden');
    }

    var lastScrollTop = 0;
    var scrollThreshold = 10;

    // --- Header & Scroll Logic ---
    if (mainHeader) {
        window.addEventListener('scroll', function() {
            var currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (currentScrollTop > lastScrollTop && currentScrollTop > mainHeader.offsetHeight + 50) {
                mainHeader.classList.add('header-hidden');
            } else if (currentScrollTop < lastScrollTop) {
                mainHeader.classList.remove('header-hidden');
            }
            if (currentScrollTop > scrollThreshold) {
                mainHeader.classList.add('header-scrolled');
            } else {
                mainHeader.classList.remove('header-scrolled');
            }
            lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
        });
    }

    // --- Mobile Menu Logic (Redirect to Academic Modal A-73/74) ---
    window.openMobileMenu = function(section) {
        window.openAcademicMenu();
    };

    window.closeMobileMenu = function() {
        window.closeAcademicMenu();
    };

    // --- Unified Profile Modal Logic (A-75) ---
    window.openProfileModal = function(pushState) {
        if (pushState === undefined) pushState = true;
        var modal = document.getElementById('profile-modal');
        if (!modal) return;

        var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var user = userRaw ? JSON.parse(userRaw) : null;

        if (!user) {
            // Si no hay sesión, invitar a login (si existe modal de login)
            var loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.classList.remove('opacity-0', 'pointer-events-none');
                var content = document.getElementById('login-modal-content');
                if (content) content.classList.add('scale-100');
            } else {
                alert('Inicie sesión para acceder a su perfil.');
                window.location.href = 'login.html';
            }
            return;
        }

        // Poblar campos comunes
        var nameEl = document.getElementById('profile-nombre');
        var emailEl = document.getElementById('profile-email');
        var phoneEl = document.getElementById('profile-telefono');
        var listEl = document.getElementById('profile-numeroLista');
        var listContainer = document.getElementById('profile-numeroLista-container');

        if (nameEl) nameEl.value = user.nombre || '';
        if (emailEl) emailEl.value = user.email || '';
        if (phoneEl) phoneEl.value = user.telefono || '';
        if (listEl) listEl.value = user.numeroLista || '';

        // Mostrar/Ocultar Número de Lista según Rol
        if (listContainer) {
            if (user.rol === 'Profesor') listContainer.classList.add('hidden');
            else listContainer.classList.remove('hidden');
        }

        modal.classList.remove('hidden');
        if (window.closeAcademicMenu) window.closeAcademicMenu();
        if (pushState) {
            history.pushState({ type: 'modal-close', modalId: 'profile-modal' }, '');
        }
    };

    window.closeProfileModal = function(doPop) {
        if (doPop === undefined) doPop = true;
        var modal = document.getElementById('profile-modal');
        if (modal) modal.classList.add('hidden');
        if (doPop && history.state && history.state.type === 'modal-close' && history.state.modalId === 'profile-modal') {
            history.back();
        }
    };

    // Attach to buttons if they exist
    if (openProfileBtn) openProfileBtn.addEventListener('click', function(e) { e.preventDefault(); window.openProfileModal(); });
    if (mobileProfileBtn) mobileProfileBtn.addEventListener('click', function(e) { e.preventDefault(); window.openProfileModal(); });

    // Close on X or Cancel
    var closeBtn = document.getElementById('close-profile-modal');
    var cancelBtn = document.getElementById('cancel-profile-btn');
    if (closeBtn) closeBtn.onclick = window.closeProfileModal;
    if (cancelBtn) cancelBtn.onclick = window.closeProfileModal;

    // --- Logout Logic (Global) ---
    window.handleLogout = function() {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    };

    // Portal Redirect Logic
    var portalLink = document.getElementById('nav-portal-link');
    var mobilePortalLink = document.getElementById('mobile-portal-link');
    var currentUserRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    var currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

    if (currentUser) {
        var dest = currentUser.rol === 'Profesor' ? 'teacher-dashboard.html' : 'student-dashboard.html';
        if (portalLink) portalLink.href = dest;
        if (mobilePortalLink) mobilePortalLink.href = dest;
    }

    // Set Year
    var yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Sincronizar alcance antes de renderizar navegación (v7.7.4)
    if (window.syncAcademicScope) {
        window.syncAcademicScope(function() {
            window.renderCommonNav();
        });
    } else {
        window.renderCommonNav();
    }

    // REQ: Event for child scripts (v3.3)
    document.dispatchEvent(new CustomEvent('common-ui-ready'));

    // --- (A-77) Global History Navigation System ---
    var handlePopState = function(event) {
        var state = event.state;

        // Siempre cerrar modales si el nuevo estado NO es de modal
        if (!state || (state.type !== 'modal-close' && state.type !== 'academic-menu')) {
            var academicModal = document.getElementById('academic-menu-modal');
            if (academicModal && !academicModal.classList.contains('hidden')) {
                window.closeAcademicMenu(false);
            }
            var profileModal = document.getElementById('profile-modal');
            if (profileModal && !profileModal.classList.contains('hidden')) {
                window.closeProfileModal(false);
            }
            var loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.classList.add('opacity-0', 'pointer-events-none');
                var loginContent = document.getElementById('login-modal-content');
                if (loginContent) loginContent.classList.remove('scale-100');
            }
        }

        if (!state) return;

        if (state.type === 'index-main') {
            if (window.returnToMainContent) {
                window.returnToMainContent();
            } else {
                if (window.showMainContentSections) window.showMainContentSections(false);
                if (window.renderInitialContentButton) window.renderInitialContentButton();
            }
        } else if (state.type === 'dashboard-section') {
            var targetNav = document.getElementById(state.navId);
            var targetSection = document.getElementById(state.sectionId);
            if (targetNav && targetSection && window.navigateTo) {
                window.navigateTo(targetSection, targetNav, false);
            }
        } else if (state.type === 'hierarchical-nav') {
            // REQ: Restaurar sección del dashboard si el estado lo incluye (v7.6.4)
            if (state.sectionId && state.navId && window.navigateTo) {
                var tNav = document.getElementById(state.navId);
                var tSection = document.getElementById(state.sectionId);
                if (tNav && tSection) window.navigateTo(tSection, tNav, false);
            }
            if (window.syncNavWithState) {
                window.syncNavWithState(state);
            }
        } else if (state.type === 'presentation-slide') {
            if (window.PresentationEngine && typeof window.PresentationEngine.showSlide === 'function') {
                window.PresentationEngine.showSlide(state.slideIndex, false);
            }
        } else if (state.type === 'student-subject') {
            if (window.switchSubject) {
                window.switchSubject(state.subject, false);
            }
        } else if (state.type === 'index-content') {
            if (state.view === 'grades') {
                if (window.renderDownloadGrades) window.renderDownloadGrades(false);
            } else if (state.view === 'sections') {
                if (state.gradeData) window.selectedGradeData = state.gradeData;
                if (window.renderDownloadSections) window.renderDownloadSections(false);
            } else if (state.view === 'partials') {
                if (state.section) window.selectedSection = state.section;
                if (window.renderDownloadPartials) window.renderDownloadPartials(false);
            } else if (state.view === 'subjects') {
                if (state.gradeData) window.selectedGradeData = state.gradeData;
                if (state.section) window.selectedSection = state.section;
                if (state.partial) window.selectedPartial = state.partial;
                if (window.renderDownloadSubjects) window.renderDownloadSubjects(false);
            } else if (state.view === 'topics') {
                if (state.subjectData) window.selectedSubjectData = state.subjectData;
                if (window.renderDownloadTopics) window.renderDownloadTopics(false);
            }
        } else if (state.type === 'index-activities') {
            if (state.view === 'main') {
                if (window.showMainContentSections) window.showMainContentSections(false);
            } else if (state.view === 'list') {
                if (window.renderActivityList) window.renderActivityList(false);
            }
        } else if (state.type === 'academic-menu') {
            var modalMenu = document.getElementById('academic-menu-modal');
            if (modalMenu && modalMenu.classList.contains('hidden')) {
                window.openAcademicMenu(false);
            }
            if (state.level === 'root') {
                window.resetAcademicMenu(false);
            } else {
                window.renderHierarchyLevel(state.menuType, state.level, state.params, false);
            }
        } else if (state.type === 'modal-close') {
            if (state.modalId === 'academic-menu-modal') window.openAcademicMenu(false);
            if (state.modalId === 'profile-modal') window.openProfileModal(false);
        }

        // REQ 8: Restaurar posición de scroll al navegar atrás
        if (state.scrollPos !== undefined) {
            window.scrollTo({ top: state.scrollPos, behavior: 'auto' });
        }
    };

    window.addEventListener('popstate', handlePopState);

    // --- Dropdown Viewport Protection (A-76) ---
    var handleDropdownOverflow = function() {
        // Observer to re-apply logic if DOM changes (dynamic menus)
        var observer = new MutationObserver(function(mutations) {
            attachOverflowCheck();
        });

        var attachOverflowCheck = function() {
            // Check both Level 2 (below nav) and Level 3+ (right side) submenus
            var submenus = document.querySelectorAll('.group div[class*="absolute"]');
            for (var i = 0; i < submenus.length; i++) {
                var menu = submenus[i];
                var parent = menu.parentElement;
                if (!parent || parent.getAttribute('data-ovf-checked') === "true") continue;

                parent.setAttribute('data-ovf-checked', "true");
                parent.addEventListener('mouseenter', (function(m) {
                    return function() {
                        // Temporarily show to measure accurately
                        var originalOpacity = m.style.opacity;
                        var originalVisibility = m.style.visibility;

                        m.style.opacity = '0';
                        m.style.visibility = 'visible';
                        m.style.display = 'block';

                        var rect = m.getBoundingClientRect();

                        m.style.display = '';
                        m.style.visibility = originalVisibility;
                        m.style.opacity = originalOpacity;

                        if (rect.right > window.innerWidth) {
                            m.classList.add('dropdown-reverse');
                            // If it's a top-level dropdown, just shift it left
                            if (m.classList.contains('left-0')) {
                                m.classList.remove('left-0');
                                m.classList.add('right-0');
                            }
                        }
                    };
                })(menu));
            }
        };

        var nav = document.querySelector('nav');
        if (nav) observer.observe(nav, { childList: true, subtree: true });
        attachOverflowCheck();
    };
    handleDropdownOverflow();

    // --- Unified Profile Form Handler (A-73/75) ---
    var profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.onsubmit = function(e) {
            e.preventDefault();
            var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            var user = userRaw ? JSON.parse(userRaw) : null;
            if (!user) {
                alert('Sesión no encontrada. Por favor inicie sesión de nuevo.');
                window.location.href = 'login.html';
                return;
            }

            var submitBtn = profileForm.querySelector('button[type="submit"]');
            var newPassword = document.getElementById('profile-password').value;
            var currentPassword = document.getElementById('profile-current-password').value;

            if (newPassword && !currentPassword) {
                alert('Debe ingresar su contraseña actual para establecer una nueva.');
                return;
            }

            var payload = {
                userId: user.userId,
                nombre: document.getElementById('profile-nombre').value.trim(),
                email: document.getElementById('profile-email').value.trim(),
                telefono: document.getElementById('profile-telefono').value.trim(),
                numeroLista: document.getElementById('profile-numeroLista') ? document.getElementById('profile-numeroLista').value : undefined,
                currentPassword: currentPassword || undefined,
                password: newPassword || undefined
            };

            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');
            var originalText = submitBtn.textContent;
            submitBtn.textContent = 'Procesando...';

            if (typeof fetchApi !== 'function') {
                alert('El servicio de conexión (api.js) no se ha cargado correctamente.');
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
                submitBtn.textContent = originalText;
                return;
            }

            fetchApi('USER', 'updateUserProfile', payload).then(function(result) {
                if (result.status === 'success') {
                    // Update user object manually (Object.assign replacement)
                    for (var key in result.data) {
                        user[key] = result.data[key];
                    }
                    localStorage.setItem('currentUser', JSON.stringify(user));

                    var nameParts = user.nombre.split(' ');
                    var firstName = nameParts[0];

                    var teacherNameEl = document.getElementById('teacher-name');
                    var studentNameEl = document.getElementById('student-name');
                    if (teacherNameEl) teacherNameEl.textContent = firstName;
                    if (studentNameEl) studentNameEl.textContent = firstName;

                    if (window.renderWelcomeMessage) window.renderWelcomeMessage();

                    alert('Perfil actualizado con éxito.');
                    var modal = document.getElementById('profile-modal');
                    if (modal) modal.classList.add('hidden');

                    document.getElementById('profile-password').value = '';
                    document.getElementById('profile-current-password').value = '';
                } else {
                    alert('Atención: ' + result.message);
                }
            }).catch(function(err) {
                console.error("Critical Profile Error:", err);
                alert('Error de conexión: No se pudo sincronizar con el servidor. Verifique su internet.');
            }).finally(function() {
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
                submitBtn.textContent = originalText;
            });
        };
    }

    // --- Universal Settings Modal Initialization (Fase 27) ---
    if (typeof window.initGlobalDashboardSettings === 'function') {
        window.initGlobalDashboardSettings();
    }
};

/**
 * Convierte un ID o URL de Google Drive en una URL de visualización directa pública.
 */
window.convertDriveLink = function(driveLink) {
    if (!driveLink || typeof driveLink !== 'string') return '';

    // Si ya es un enlace directo funcional, no tocar
    if (driveLink.indexOf('lh3.googleusercontent.com') !== -1) return driveLink;

    var fileId = '';

    if (driveLink.indexOf('drive.google.com') !== -1) {
        // Formatos: /file/d/ID/view, /open?id=ID, /uc?id=ID
        var match = driveLink.match(/\/d\/([a-zA-Z0-9-_]+)/) ||
                    driveLink.match(/[?&]id=([a-zA-Z0-9-_]+)/);
        if (match && match[1]) fileId = match[1];
    } else if (driveLink.indexOf('http') === -1) {
        // Asumir que es un ID directo
        fileId = driveLink;
    }

    if (fileId) {
        return 'https://lh3.googleusercontent.com/d/' + fileId;
    }

    return driveLink;
};

// Global helper for sections
window.checkSectionHelper = function(sectionsField, targetSection) {
    if (!sectionsField || !targetSection) return true;
    if (Array.isArray(sectionsField)) return sectionsField.indexOf(targetSection) !== -1;
    return sectionsField.split(',').map(function(s) { return s.trim(); }).indexOf(targetSection) !== -1;
};

window.handleHeaderAction = function(action) {
    if (action === 'show-activities') {
        if (window.showMainContentSections) {
            window.showMainContentSections();
            if (window.renderActivityList) window.renderActivityList();
        } else {
            window.location.href = 'index.html?action=show-activities';
        }
    }
    if (action === 'cursos' || action === 'contenido' || action === 'show-academic-menu') {
        window.openAcademicMenu();
    }
    if (window.closeMobileMenu) window.closeMobileMenu();
};

window.openAcademicMenu = function(pushState) {
    if (pushState === undefined) pushState = true;
    var scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    var modal = document.getElementById('academic-menu-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'academic-menu-modal';
        modal.className = 'fixed inset-0 bg-gray-900/98 z-[2100] flex items-center justify-center hidden opacity-0 transition-all duration-300';
        modal.innerHTML =
            '<div class="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in-up m-4 border border-gray-100">' +
                '<div class="p-8">' +
                    '<div class="flex justify-between items-center mb-8">' +
                        '<div>' +
                            '<h2 class="text-2xl font-semibold text-gray-900 tracking-tight">Recursos</h2>' +
                            '<p class="text-xs font-medium text-blue-600 uppercase tracking-widest mt-1">Explora tu contenido</p>' +
                        '</div>' +
                        '<button onclick="window.closeAcademicMenu()" class="text-gray-400 hover:text-gray-600 p-2 transition-colors">' +
                            '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>' +
                        '</button>' +
                    '</div>' +

                    '<div class="grid grid-cols-1 gap-4" id="academic-menu-options">' +
                        '<button onclick="window.showAcademicHierarchy(\'Presentaciones\')" class="group flex items-center gap-5 p-5 bg-blue-50/50 rounded-3xl hover:bg-blue-600 transition-all duration-300">' +
                            '<div class="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">' +
                                '<i class="fas fa-desktop"></i>' +
                            '</div>' +
                            '<div class="text-left">' +
                                '<h3 class="font-bold text-gray-900 group-hover:text-white transition-colors">Presentaciones</h3>' +
                                '<p class="text-xs text-blue-600 group-hover:text-blue-100 transition-colors">Clases interactivas</p>' +
                            '</div>' +
                        '</button>' +

                        '<button onclick="window.showAcademicHierarchy(\'Contenido\')" class="group flex items-center gap-5 p-5 bg-purple-50/50 rounded-3xl hover:bg-purple-600 transition-all duration-300">' +
                            '<div class="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">' +
                                '<i class="fas fa-file-pdf"></i>' +
                            '</div>' +
                            '<div class="text-left">' +
                                '<h3 class="font-bold text-gray-900 group-hover:text-white transition-colors">Contenido de clase</h3>' +
                                '<p class="text-xs text-purple-600 group-hover:text-purple-100 transition-colors">Descargas PDF</p>' +
                            '</div>' +
                        '</button>' +
                    '</div>' +

                    '<div id="hierarchy-navigation" class="hidden flex flex-col min-h-[300px]">' +
                        '<button onclick="history.back()" class="mb-6 flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] hover:text-blue-700 transition-colors">' +
                            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>' +
                            'Regresar' +
                        '</button>' +
                        '<div id="hierarchy-title" class="mb-6">' +
                            '<h3 class="text-lg font-bold text-gray-900" id="hierarchy-label">Selecciona Grado</h3>' +
                            '<div class="h-1 w-12 bg-blue-600 rounded-full mt-1"></div>' +
                        '</div>' +
                        '<div id="hierarchy-options" class="flex flex-col gap-2 overflow-y-auto max-h-[350px] pr-2 scroll-minimalist">' +
                            '<!-- Inyectado dinámicamente -->' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);
    }

    modal.classList.remove('hidden');
    setTimeout(function() { modal.classList.add('opacity-100'); }, 10);
    window.resetAcademicMenu(pushState);
};

window.closeAcademicMenu = function(doPop) {
    if (doPop === undefined) doPop = true;
    var modal = document.getElementById('academic-menu-modal');
    if (modal) {
        modal.classList.remove('opacity-100');
        setTimeout(function() { modal.classList.add('hidden'); }, 300);
        // REQ: Ensure history is popped if we are in an academic-menu state
        if (doPop && history.state && history.state.type === 'academic-menu') {
            history.back();
        }
    }
};

window.resetAcademicMenu = function(pushState) {
    if (pushState === undefined) pushState = true;
    var options = document.getElementById('academic-menu-options');
    var nav = document.getElementById('hierarchy-navigation');
    if (options) options.classList.remove('hidden');
    if (nav) nav.classList.add('hidden');

    if (pushState) {
        history.pushState({ type: 'academic-menu', level: 'root', scrollPos: window.pageYOffset }, '');
    }
};

window.openAcademicHierarchy = function(type) {
    window.openAcademicMenu();
    window.showAcademicHierarchy(type);
};

window.showAcademicHierarchy = function(type) {
    var options = document.getElementById('academic-menu-options');
    var nav = document.getElementById('hierarchy-navigation');
    var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}';
    var user = JSON.parse(userRaw);
    var isProfesor = user.rol === 'Profesor';

    if (options) options.classList.add('hidden');
    if (nav) nav.classList.remove('hidden');

    if (!isProfesor && user.grado && user.seccion) {
        window.renderHierarchyLevel(type, 'Asignatura', { grado: user.grado, seccion: user.seccion });
    } else {
        window.renderHierarchyLevel(type, 'Grado');
    }
};

window.renderHierarchyLevel = function(type, level, params, pushState) {
    if (params === undefined) params = {};
    if (pushState === undefined) pushState = true;

    // REQ: Pre-push state to ensure it's captured before potentially jumping levels (v7.6.3)
    if (pushState) {
        history.pushState({
            type: 'academic-menu',
            menuType: type,
            level: level,
            params: params,
            scrollPos: window.pageYOffset
        }, '');
    }

    var container = document.getElementById('hierarchy-options');
    var label = document.getElementById('hierarchy-label');
    var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}';
    var user = JSON.parse(userRaw);
    var role = user.rol || 'Invitado';

    if (!container) return;

    container.innerHTML = '<div class="p-8 text-center"><i class="fas fa-spinner fa-spin text-blue-600 text-2xl"></i></div>';

    var sourceData = (type === 'Presentaciones') ? (window.presentationData || []) : (window.downloadContentData || []);

    var items = [];
    var nextLevel = '';
    var i, j;

    switch(level) {
        case 'Grado':
            label.textContent = 'Selecciona Grado';
            var gradeSet = {};
            for (i = 0; i < sourceData.length; i++) {
                if (sourceData[i].grade) gradeSet[sourceData[i].grade] = true;
            }
            items = Object.keys(gradeSet);
            nextLevel = 'Sección';
            break;
        case 'Sección':
            label.textContent = 'Selecciona Sección';
            var gradeObj = null;
            for (i = 0; i < sourceData.length; i++) {
                if (window.parseGrade(sourceData[i].grade) === window.parseGrade(params.grado)) {
                    gradeObj = sourceData[i];
                    break;
                }
            }
            items = gradeObj ? gradeObj.sections : [];
            nextLevel = (role === 'Profesor' ? 'Parcial' : 'Asignatura');
            break;
        case 'Parcial':
            label.textContent = 'Selecciona Parcial';
            var gradeObjP = null;
            for (i = 0; i < sourceData.length; i++) {
                if (window.parseGrade(sourceData[i].grade) === window.parseGrade(params.grado)) {
                    gradeObjP = sourceData[i];
                    break;
                }
            }
            if (gradeObjP) {
                var partialSet = {};
                for (j = 0; j < gradeObjP.subjects.length; j++) {
                    var s = gradeObjP.subjects[j];
                    if (window.checkSectionHelper(s.sections, params.seccion)) {
                        partialSet[s.partial] = true;
                    }
                }
                items = Object.keys(partialSet);
            }
            nextLevel = (role === 'Profesor' ? 'Asignatura' : (type === 'Presentaciones' ? 'Temas' : 'Archivos'));
            break;
        case 'Asignatura':
            label.textContent = 'Selecciona Asignatura';
            var gradeObjA = null;
            for (i = 0; i < sourceData.length; i++) {
                if (window.parseGrade(sourceData[i].grade) === window.parseGrade(params.grado)) {
                    gradeObjA = sourceData[i];
                    break;
                }
            }

            if (gradeObjA) {
                var subjSet = {};
                for (j = 0; j < gradeObjA.subjects.length; j++) {
                    var sub = gradeObjA.subjects[j];
                    var secMatch = window.checkSectionHelper(sub.sections, params.seccion);
                    var authorized = false;
                    if (role === 'Profesor' && params.parcial) {
                        authorized = secMatch && sub.partial === params.parcial;
                    } else {
                        // REQ: Contextual authorization (v7.7.5)
                        authorized = window.isContentAuthorized(sub.partial, sub.name, null, params.grado, params.seccion);
                    }
                    if (authorized) subjSet[sub.name] = true;
                }
                items = Object.keys(subjSet);
            }
            nextLevel = (type === 'Presentaciones' ? 'Temas' : 'Archivos');
            break;
        case 'Temas':
        case 'Archivos':
            label.textContent = (type === 'Presentaciones') ? 'Selecciona Tema' : 'Descargar Archivos';
            var gradeObjT = null;
            for (i = 0; i < sourceData.length; i++) {
                if (window.parseGrade(sourceData[i].grade) === window.parseGrade(params.grado)) {
                    gradeObjT = sourceData[i];
                    break;
                }
            }
            var finalItems = [];
            if (gradeObjT) {
                var foundSubject = null;
                for (j = 0; j < gradeObjT.subjects.length; j++) {
                    var subject = gradeObjT.subjects[j];
                    if (subject.name === params.asignatura &&
                        subject.partial === params.parcial &&
                        window.checkSectionHelper(subject.sections, params.seccion)) {
                        foundSubject = subject;
                        break;
                    }
                }
                finalItems = foundSubject ? foundSubject.topics : [];
            }

            var filteredTopics = [];
            for (i = 0; i < finalItems.length; i++) {
                var topicItem = finalItems[i];
                if (window.isContentAuthorized(params.parcial, params.asignatura, topicItem.title, params.grado, params.seccion)) {
                    filteredTopics.push(topicItem);
                }
            }

            if (filteredTopics.length === 0) {
                container.innerHTML = '<p class="text-center p-4 text-gray-500 text-sm">No hay temas autorizados disponibles.</p>';
                return;
            }

            var htmlItems = [];
            for (i = 0; i < filteredTopics.length; i++) {
                var item = filteredTopics[i];
                if (!item.title || !item.file) continue;
                htmlItems.push(
                    '<a href="' + item.file + '" ' + (type === 'Contenido' ? 'download' : 'target="_blank"') + ' class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all group">' +
                        '<div class="flex items-center gap-3">' +
                            '<div class="w-8 h-8 rounded-lg ' + (type === 'Presentaciones' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600') + ' flex items-center justify-center text-xs">' +
                                '<i class="fas ' + (type === 'Presentaciones' ? 'fa-desktop' : 'fa-download') + '"></i>' +
                            '</div>' +
                            '<span class="text-sm font-semibold text-gray-700">' + item.title + '</span>' +
                        '</div>' +
                        '<i class="fas fa-chevron-right text-[10px] text-gray-300 group-hover:text-blue-500 transition-colors"></i>' +
                    '</a>'
                );
            }
            container.innerHTML = htmlItems.join('');
            return;
    }

    if (items.length === 0) {
        container.innerHTML = '<p class="text-center p-4 text-gray-500 text-sm">No hay opciones disponibles.</p>';
        return;
    }

    var resultHtml = [];
    for (i = 0; i < items.length; i++) {
        var itemVal = items[i];
        if (itemVal === undefined) continue;
        var currentLevelKey = (level === 'Grado' ? 'grado' : (level === 'Sección' ? 'seccion' : (level === 'Asignatura' ? 'asignatura' : (level === 'Parcial' ? 'parcial' : level.toLowerCase()))));

        var newParams = {};
        for (var k in params) { newParams[k] = params[k]; }
        newParams[currentLevelKey] = itemVal;

        // Si el usuario es estudiante y acaba de seleccionar una asignatura,
        // debemos pre-asignar el parcial autorizado.
        if (role !== 'Profesor' && level === 'Asignatura') {
            var gObj = null;
            for (var m = 0; m < sourceData.length; m++) {
                if (window.parseGrade(sourceData[m].grade) === window.parseGrade(params.grado)) {
                    gObj = sourceData[m];
                    break;
                }
            }
            if (gObj) {
                for (var n = 0; n < gObj.subjects.length; n++) {
                    var subObj = gObj.subjects[n];
                    if (subObj.name === itemVal &&
                        window.checkSectionHelper(subObj.sections, params.seccion) &&
                        window.isContentAuthorized(subObj.partial, subObj.name)) {
                        newParams.parcial = subObj.partial;
                        break;
                    }
                }
            }
        }

        var paramsStr = JSON.stringify(newParams).replace(/'/g, "&#39;");
        resultHtml.push(
            '<button onclick=\'window.renderHierarchyLevel("' + type + '", "' + nextLevel + '", ' + paramsStr + ')\' ' +
                    'class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all group">' +
                '<span class="text-sm font-semibold text-gray-700">' + itemVal + '</span>' +
                '<i class="fas fa-chevron-right text-[10px] text-gray-300 group-hover:text-blue-500 transition-colors"></i>' +
            '</button>'
        );
    }
    container.innerHTML = resultHtml.join('');
};

window.renderCommonNav = function() {
    var desktopCoursesMenu = document.getElementById('desktop-courses-menu');
    var desktopContentMenu = document.getElementById('desktop-content-menu');
    var mobileCoursesMenu = document.getElementById('mobile-courses-menu');
    var mobileContentMenu = document.getElementById('mobile-content-menu');

    var currentUserRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    var currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
    var isProfesor = currentUser && currentUser.rol === 'Profesor';

    function buildHierarchy(data) {
        if (!data) return '';

        var html = '';
        for (var i = 0; i < data.length; i++) {
            var grade = data[i];
            if (!isProfesor && currentUser && currentUser.grado && window.parseGrade(grade.grade) !== window.parseGrade(currentUser.grado)) continue;

            var filteredSubjects = [];
            for (var j = 0; j < grade.subjects.length; j++) {
                var subj = grade.subjects[j];
                if (!isProfesor && currentUser && currentUser.seccion) {
                    if (window.checkSectionHelper(subj.sections, currentUser.seccion)) {
                        filteredSubjects.push(subj);
                    }
                } else {
                    filteredSubjects.push(subj);
                }
            }

            if (filteredSubjects.length === 0 && !isProfesor) continue;

            if (isProfesor) {
                html += '<div class="relative group/grade">' +
                    '<button class="block w-full text-left px-4 py-2 text-[11px] font-black text-gray-700 hover:bg-blue-50 hover:text-blue-600 uppercase tracking-widest transition-colors focus:outline-none">' +
                        grade.grade + ' <span class="float-right text-[10px] mt-0.5 ml-2">&#9656;</span>' +
                    '</button>' +
                    '<div class="absolute left-full top-0 dropdown-container-ima bg-white rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/grade:opacity-100 group-hover/grade:visible border border-gray-100">';

                // Agrupar por asignatura (omitiendo nivel de parcial para simplificar navegación)
                var subjGroups = {};
                for (var k = 0; k < filteredSubjects.length; k++) {
                    var fs = filteredSubjects[k];
                    if (!subjGroups[fs.name]) subjGroups[fs.name] = { topics: [] };
                    for (var tIdx = 0; tIdx < fs.topics.length; tIdx++) {
                        var topic = fs.topics[tIdx];
                        if (!subjGroups[fs.name].topics.find(function(ex){ return ex.title === topic.title; })) {
                            subjGroups[fs.name].topics.push(topic);
                        }
                    }
                }

                var subjNames = Object.keys(subjGroups);
                for (var m = 0; m < subjNames.length; m++) {
                    var sName = subjNames[m];
                    var sData = subjGroups[sName];
                    html += '<div class="relative group/subj">' +
                        '<button class="block w-full text-left px-4 py-2 text-[10px] font-bold text-gray-500 hover:bg-blue-50 hover:text-blue-600 uppercase">' +
                            sName + ' <span class="float-right text-[10px] mt-0.5 ml-2">&#9656;</span>' +
                        '</button>' +
                        '<div class="absolute left-full top-0 dropdown-container-ima bg-white rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/subj:opacity-100 group-hover/subj:visible border border-gray-100">';
                    for (var n = 0; n < sData.topics.length; n++) {
                        var t = sData.topics[n];
                        html += '<a href="' + t.file + '" class="block px-4 py-2 text-[11px] font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-50 last:border-0">' + t.title + '</a>';
                    }
                    html += '</div></div>';
                }
                html += '</div></div>';
            } else {
                // Estudiantes: Agrupar por asignatura y filtrar por autorización dinámica
                var studentSubjGroups = {};
                for (var x = 0; x < filteredSubjects.length; x++) {
                    var s = filteredSubjects[x];
                    if (!studentSubjGroups[s.name]) studentSubjGroups[s.name] = { topics: [] };
                    for (var stIdx = 0; stIdx < s.topics.length; stIdx++) {
                        var stTopic = s.topics[stIdx];
                        if (window.isContentAuthorized(s.partial, s.name, stTopic.title, grade.grade, (currentUser && currentUser.seccion) || "")) {
                            if (!studentSubjGroups[s.name].topics.find(function(ex){ return ex.title === stTopic.title; })) {
                                studentSubjGroups[s.name].topics.push(stTopic);
                            }
                        }
                    }
                }

                var stSubjNames = Object.keys(studentSubjGroups);
                for (var si = 0; si < stSubjNames.length; si++) {
                    var stName = stSubjNames[si];
                    var stData = studentSubjGroups[stName];
                    if (stData.topics.length > 0) {
                        html += '<div class="relative group/subj">' +
                            '<button class="block w-full text-left px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 uppercase">' +
                                stName + ' <span class="float-right text-[10px] mt-0.5 ml-2">&#9656;</span>' +
                            '</button>' +
                            '<div class="absolute left-full top-0 dropdown-container-ima bg-white rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/subj:opacity-100 group-hover/subj:visible border border-gray-100">';
                        for (var ti = 0; ti < stData.topics.length; ti++) {
                            var t = stData.topics[ti];
                            html += '<a href="' + t.file + '" class="block px-4 py-2 text-[11px] font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-50 last:border-0">' + t.title + '</a>';
                        }
                        html += '</div></div>';
                    }
                }
            }
        }
        return html;
    }

    function buildMobileHierarchy(data) {
        if (!data) return '';
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var grade = data[i];
            if (!isProfesor && currentUser && currentUser.grado && window.parseGrade(grade.grade) !== window.parseGrade(currentUser.grado)) continue;

            var filteredSubjects = [];
            for (var j = 0; j < grade.subjects.length; j++) {
                var subj = grade.subjects[j];
                if (!isProfesor && currentUser && currentUser.seccion) {
                    if (window.checkSectionHelper(subj.sections, currentUser.seccion)) {
                        filteredSubjects.push(subj);
                    }
                } else {
                    filteredSubjects.push(subj);
                }
            }
            if (filteredSubjects.length === 0 && !isProfesor) continue;

            if (isProfesor) {
                html += '<button class="w-full text-left px-6 py-4 font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 flex justify-between items-center text-xs" onclick="this.nextElementSibling.classList.toggle(\'hidden\')">' +
                    grade.grade + ' <span>&#9662;</span>' +
                '</button>' +
                '<div class="hidden bg-gray-50/50">';

                var mobileSubjGroups = {};
                for (var k = 0; k < filteredSubjects.length; k++) {
                    var s = filteredSubjects[k];
                    if (!mobileSubjGroups[s.name]) mobileSubjGroups[s.name] = { topics: [] };
                    for (var mtIdx = 0; mtIdx < s.topics.length; mtIdx++) {
                        var mTopic = s.topics[mtIdx];
                        if (!mobileSubjGroups[s.name].topics.find(function(ex){ return ex.title === mTopic.title; })) {
                            mobileSubjGroups[s.name].topics.push(mTopic);
                        }
                    }
                }

                var mSubjNames = Object.keys(mobileSubjGroups);
                for (var mIdx = 0; mIdx < mSubjNames.length; mIdx++) {
                    var msName = mSubjNames[mIdx];
                    var msData = mobileSubjGroups[msName];
                    html += '<button class="w-full text-left px-8 py-3 font-bold text-blue-600 uppercase tracking-tighter border-b border-gray-100 flex justify-between items-center text-[10px]" onclick="this.nextElementSibling.classList.toggle(\'hidden\')">' +
                        msName + ' <span>&#9662;</span>' +
                    '</button>' +
                    '<div class="hidden bg-white/50">';
                    for (var l = 0; l < msData.topics.length; l++) {
                        var t = msData.topics[l];
                        html += '<a href="' + t.file + '" class="block px-10 py-3 text-[11px] font-medium text-gray-600 border-b border-gray-50 last:border-0" onclick="closeMobileMenu()">' + t.title + '</a>';
                    }
                    html += '</div>';
                }
                html += '</div>';
            } else {
                var mobileStudentSubjGroups = {};
                for (var m = 0; m < filteredSubjects.length; m++) {
                    var sub = filteredSubjects[m];
                    if (!mobileStudentSubjGroups[sub.name]) mobileStudentSubjGroups[sub.name] = { topics: [] };
                    for (var mstIdx = 0; mstIdx < sub.topics.length; mstIdx++) {
                        var mstTopic = sub.topics[mstIdx];
                        if (window.isContentAuthorized(sub.partial, sub.name, mstTopic.title, grade.grade, (currentUser && currentUser.seccion) || "")) {
                             if (!mobileStudentSubjGroups[sub.name].topics.find(function(ex){ return ex.title === mstTopic.title; })) {
                                mobileStudentSubjGroups[sub.name].topics.push(mstTopic);
                             }
                        }
                    }
                }

                var mstNames = Object.keys(mobileStudentSubjGroups);
                for (var mi = 0; mi < mstNames.length; mi++) {
                    var mstName = mstNames[mi];
                    var mstData = mobileStudentSubjGroups[mstName];
                    if (mstData.topics.length > 0) {
                        html += '<button class="w-full text-left px-8 py-3 font-bold text-blue-600 uppercase tracking-tighter border-b border-gray-100 flex justify-between items-center text-[10px]" onclick="this.nextElementSibling.classList.toggle(\'hidden\')">' +
                            mstName + ' <span>&#9662;</span>' +
                        '</button>' +
                        '<div class="hidden bg-white/50">';
                        for (var mti = 0; mti < mstData.topics.length; mti++) {
                            var t = mstData.topics[mti];
                            html += '<a href="' + t.file + '" class="block px-10 py-3 text-[11px] font-medium text-gray-600 border-b border-gray-50 last:border-0" onclick="closeMobileMenu()">' + t.title + '</a>';
                        }
                        html += '</div>';
                    }
                }
            }
        }
        return html;
    }

    if (desktopCoursesMenu) desktopCoursesMenu.innerHTML = buildHierarchy(window.presentationData);
    if (desktopContentMenu) desktopContentMenu.innerHTML = buildHierarchy(window.downloadContentData);
    if (mobileCoursesMenu) mobileCoursesMenu.innerHTML = buildMobileHierarchy(window.presentationData);
    if (mobileContentMenu) mobileContentMenu.innerHTML = buildMobileHierarchy(window.downloadContentData);

    var mobilePortalBottom = document.getElementById('mobile-portal-bottom-nav');
    if (mobilePortalBottom && currentUser) {
        mobilePortalBottom.href = currentUser.rol === 'Profesor' ? 'teacher-dashboard.html' : 'student-dashboard.html';
    }
};

// Official Namespace Blindaje (v7.6)
window.QuizProApp = window.QuizProApp || {};
window.QuizProApp.handleHeaderAction = window.handleHeaderAction;
window.QuizProApp.openAcademicHierarchy = window.openAcademicHierarchy;

/**
 * FASE 3: Consejos Discretos de Primera Visita (Onboarding Tips)
 */
window.showFirstVisitTip = function(tipId, title, message, targetContainerId) {
    if (!tipId || !message) return;
    var seenKey = 'ngca_tip_seen_' + tipId;
    if (localStorage.getItem(seenKey) === 'true') return;

    var container = targetContainerId ? document.getElementById(targetContainerId) : document.querySelector('main .container');
    if (!container) return;

    var tipCard = document.createElement('div');
    tipCard.className = 'onboarding-tip-card mb-6 flex items-start gap-4 animate-fade-in-up';
    tipCard.id = 'tip-card-' + tipId;
    tipCard.innerHTML =
        '<div class="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-md">' +
            '<i class="fas fa-lightbulb"></i>' +
        '</div>' +
        '<div class="flex-grow">' +
            '<h4 class="text-sm font-bold text-indigo-950 mb-1">' + (title || 'Consejo Útil') + '</h4>' +
            '<p class="text-xs text-indigo-900 leading-relaxed font-medium">' + message + '</p>' +
        '</div>' +
        '<button onclick="window.dismissFirstVisitTip(\'' + tipId + '\')" class="text-indigo-400 hover:text-indigo-800 text-sm p-1 transition-colors">' +
            '<i class="fas fa-times"></i>' +
        '</button>';

    container.insertBefore(tipCard, container.firstChild);
};

window.dismissFirstVisitTip = function(tipId) {
    var seenKey = 'ngca_tip_seen_' + tipId;
    localStorage.setItem(seenKey, 'true');
    var el = document.getElementById('tip-card-' + tipId);
    if (el && el.parentNode) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-10px)';
        el.style.transition = 'all 0.3s ease';
        setTimeout(function() {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 300);
    }
};

/**
 * Inyecta botones de copiado en los bloques de código (v7.6.4)
 */
window.setupCodeCopyButtons = function() {
    var codeBlocks = document.querySelectorAll('pre.ql-syntax, .quill-content pre');

    for (var i = 0; i < codeBlocks.length; i++) {
        var block = codeBlocks[i];
        // Evitar duplicados
        if (block.parentElement.classList.contains('code-block-wrapper')) continue;

        var wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        block.parentNode.insertBefore(wrapper, block);
        wrapper.appendChild(block);

        var copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.innerHTML = '<i class="far fa-copy mr-1"></i> Copiar';

        copyBtn.addEventListener('click', (function(b, btn) {
            return function() {
                var code = b.innerText;
                navigator.clipboard.writeText(code).then(function() {
                    btn.innerHTML = '<i class="fas fa-check mr-1"></i> ¡Copiado!';
                    btn.classList.add('copied');
                    setTimeout(function() {
                        btn.innerHTML = '<i class="far fa-copy mr-1"></i> Copiar';
                        btn.classList.remove('copied');
                    }, 2000);
                });
            };
        })(block, copyBtn));

        wrapper.appendChild(copyBtn);
    }
};

/**
 * Renderizado de Tarjeta Analítica Unificada (v7.7)
 * Estandariza la visualización de estadísticas en todos los minijuegos.
 */
window.renderUnifiedAnalyticsCard = function(containerId, gameId, stats) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var history = stats.allHistory || [];
    var gameLogs = history.filter(function(h) {
        return (h[4] === gameId) || (h[3] === gameId); // Detectar por ID en Logros o Analytics
    });

    if (gameLogs.length === 0) {
        container.innerHTML = '<div class="p-8 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">' +
            '<p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sin datos históricos para este juego</p>' +
        '</div>';
        container.classList.remove('hidden');
        return;
    }

    // 1. Procesamiento de Métricas Base
    var hits = 0, misses = 0, totalXP = 0, maxScore = 0;
    var totalResponseTime = 0, correctResponseTime = 0, correctCount = 0;

    gameLogs.forEach(function(h) {
        // Si es de QuizProAnalytics (21 columnas)
        if (h.length >= 20) {
            var isCorrect = String(h[12]) === "true";
            if (isCorrect) {
                hits++;
                correctResponseTime += parseFloat(h[13]) || 0;
                correctCount++;
            } else {
                misses++;
            }
            totalResponseTime += parseFloat(h[13]) || 0;
            totalXP += parseFloat(h[20]) || 0;
        } else {
            // Si es de Logros (9 columnas)
            var score = parseFloat(h[5]) || 0;
            if (score > maxScore) maxScore = score;
            totalXP += parseFloat(h[8]) || 0;
        }
    });

    // Buscar récord real en el objeto de datos si no se encontró en logs
    if (stats.data && stats.data[gameId]) {
        maxScore = Math.max(maxScore, stats.data[gameId].maxScore || 0);
    }

    var precision = Math.round((hits / Math.max(1, hits + misses)) * 100);
    var ratio = (hits / Math.max(1, misses)).toFixed(1);
    var avgResponseTime = (correctCount > 0 ? (correctResponseTime / correctCount / 1000) : 0).toFixed(2);

    // 2. Métricas Específicas
    var specificHtml = '';
    if (gameId === 'dexterity') {
        var wpmLogs = gameLogs.filter(function(h) { return h.length < 20; }); // Logros
        var maxWPM = 0;
        wpmLogs.forEach(function(l) { if (parseFloat(l[5]) > maxWPM) maxWPM = parseFloat(l[5]); });
        specificHtml =
            '<div class="grid grid-cols-2 gap-4 mt-4">' +
                '<div class="p-3 bg-blue-50 rounded-xl"> <p class="text-[7px] font-black text-blue-400 uppercase">Mejor WPM</p> <p class="text-lg font-black text-blue-700">' + Math.round(maxWPM) + '</p> </div>' +
                '<div class="p-3 bg-indigo-50 rounded-xl"> <p class="text-[7px] font-black text-indigo-400 uppercase">XP Total</p> <p class="text-lg font-black text-indigo-700">' + Math.round(totalXP).toLocaleString() + '</p> </div>' +
            '</div>';
    } else if (gameId === 'perifericos') {
        specificHtml =
            '<div class="grid grid-cols-2 gap-4 mt-4">' +
                '<div class="p-3 bg-amber-50 rounded-xl"> <p class="text-[7px] font-black text-amber-500 uppercase">TR Promedio</p> <p class="text-lg font-black text-amber-700">' + avgResponseTime + 's</p> </div>' +
                '<div class="p-3 bg-emerald-50 rounded-xl"> <p class="text-[7px] font-black text-emerald-500 uppercase">Precisión</p> <p class="text-lg font-black text-emerald-700">' + precision + '%</p> </div>' +
            '</div>';
    } else if (gameId === 'webmaster') {
        specificHtml =
            '<div class="grid grid-cols-2 gap-4 mt-4">' +
                '<div class="p-3 bg-teal-50 rounded-xl"> <p class="text-[7px] font-black text-teal-500 uppercase">Mejor Marca</p> <p class="text-lg font-black text-teal-700">' + Math.round(maxScore) + '</p> </div>' +
                '<div class="p-3 bg-purple-50 rounded-xl"> <p class="text-[7px] font-black text-purple-400 uppercase">Ratio A/E</p> <p class="text-lg font-black text-purple-700">' + ratio + '</p> </div>' +
            '</div>';
    }

    // 3. Estructura de la Tarjeta
    container.innerHTML =
        '<div class="p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden animate-fade-in">' +
            '<div class="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>' +
            '<div class="relative z-10">' +
                '<div class="flex justify-between items-center mb-6">' +
                    '<div>' +
                        '<p class="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">Dashboard Analítico</p>' +
                        '<h4 class="text-lg font-bold tracking-tight">Rendimiento Histórico</h4>' +
                    '</div>' +
                    '<div class="px-3 py-1 bg-white/10 rounded-lg backdrop-blur-md">' +
                        '<span class="text-xs font-black text-emerald-400">' + maxScore + '</span>' +
                        '<span class="text-[7px] text-white/50 uppercase ml-1">Puntaje Máx</span>' +
                    '</div>' +
                '</div>' +

                '<div class="grid grid-cols-4 gap-2 mb-6">' +
                    '<div class="text-center"> <p class="text-[6px] font-black text-white/30 uppercase mb-1">Aciertos</p> <p class="text-xs font-bold text-emerald-400">' + hits + '</p> </div>' +
                    '<div class="text-center"> <p class="text-[6px] font-black text-white/30 uppercase mb-1">Errores</p> <p class="text-xs font-bold text-red-400">' + misses + '</p> </div>' +
                    '<div class="text-center"> <p class="text-[6px] font-black text-white/30 uppercase mb-1">Precisión</p> <p class="text-xs font-bold text-blue-400">' + precision + '%</p> </div>' +
                    '<div class="text-center"> <p class="text-[6px] font-black text-white/30 uppercase mb-1">Ratio</p> <p class="text-xs font-bold text-purple-400">' + ratio + '</p> </div>' +
                '</div>' +

                '<div class="bg-white/5 rounded-2xl p-4 mb-4">' +
                    '<p class="text-[7px] font-black text-white/30 uppercase mb-3 tracking-widest text-center">Evolución de Desempeño</p>' +
                    '<div class="h-32 w-full">' +
                        '<canvas id="unified-trend-chart-' + gameId + '"></canvas>' +
                    '</div>' +
                '</div>' +

                specificHtml +
            '</div>' +
        '</div>';

    container.classList.remove('hidden');

    // 4. Renderizado de Gráfica
    setTimeout(function() {
        var ctx = document.getElementById('unified-trend-chart-' + gameId);
        if (!ctx) return;

        // Extraer últimos 10 puntajes
        var trendData = gameLogs.slice(-10).map(function(h) {
            return h.length >= 20 ? (String(h[12]) === "true" ? 100 : 0) : parseFloat(h[5]);
        });
        var trendLabels = trendData.map(function(_, i) { return 'P' + (i+1); });

        if (window['chart_' + gameId]) window['chart_' + gameId].destroy();
        window['chart_' + gameId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendLabels,
                datasets: [{
                    data: trendData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100, display: false },
                    x: { display: false }
                },
                plugins: { legend: { display: false } }
            }
        });
    }, 100);
};

// ---------------------------------------------------------------------------
// CONTROLES UNIVERSALES DE CONFIGURACIÓN Y MENÚ DE OPCIONES (FASE 27)
// ---------------------------------------------------------------------------

window.initGlobalDashboardSettings = function() {
    var openBtn = document.getElementById('btn-global-dashboard-settings');
    if (openBtn) {
        openBtn.onclick = function(e) {
            e.preventDefault();
            window.openDashboardSettingsModal();
        };
    }
};

window.ensureDashboardSettingsModalExists = function() {
    if (document.getElementById('modal-dashboard-settings')) return;

    var modalHtml = `
<div id="modal-dashboard-settings" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[95] flex items-center justify-center p-2 md:p-4 hidden">
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-lg font-bold">
                    <i class="fa-solid fa-gear"></i>
                </div>
                <div>
                    <h3 class="text-sm md:text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                        Opciones & Configuración
                        <span id="settings-role-badge" class="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase rounded-lg border border-blue-500/30">Cargando...</span>
                    </h3>
                    <p class="text-[11px] text-slate-400 font-medium">Gestión de preferencias personales, opciones del rol e integraciones autorizadas.</p>
                </div>
            </div>
            <button id="btn-close-dashboard-settings" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 text-lg transition-all" aria-label="Cerrar opciones">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="px-6 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold uppercase tracking-wider">
            <button id="tab-btn-user-settings" class="settings-tab-btn py-3 px-4 border-b-2 border-blue-600 text-blue-600 font-black flex items-center gap-2">
                <i class="fa-solid fa-bell"></i> Notificaciones Internas
            </button>
            <button id="tab-btn-role-settings" class="settings-tab-btn py-3 px-4 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center gap-2">
                <i class="fa-solid fa-sliders"></i> Opciones del Rol
            </button>
            <button id="tab-btn-provider-settings" class="settings-tab-btn py-3 px-4 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center gap-2 hidden">
                <i class="fa-solid fa-network-wired"></i> Proveedores & Pasarelas
            </button>
        </div>

        <div class="p-6 overflow-y-auto flex-grow space-y-6">
            <div id="tab-panel-user-settings" class="space-y-6">
                <div class="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                    <i class="fa-solid fa-shield-halved text-blue-600 text-lg mt-0.5"></i>
                    <div class="text-xs text-blue-900 leading-relaxed font-medium">
                        <strong>Nivel de Preferencias Personales:</strong> Las notificaciones internas dentro de la plataforma funcionan de forma autónoma. Personalice qué avisos desea recibir en su bandeja interna sin alterar las políticas institucionales.
                    </div>
                </div>

                <div class="space-y-4">
                    <h4 class="text-xs font-black uppercase text-slate-500 tracking-wider">Categorías de Notificaciones Internas</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                        <label class="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100/80 transition-all cursor-pointer">
                            <span class="flex items-center gap-2 text-slate-700"><i class="fa-solid fa-graduation-cap text-blue-600"></i> Avisos Académicos & Notas</span>
                            <input type="checkbox" id="pref-cat-academico" checked class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500">
                        </label>
                        <label class="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100/80 transition-all cursor-pointer">
                            <span class="flex items-center gap-2 text-slate-700"><i class="fa-solid fa-file-invoice text-emerald-600"></i> Trámites & Documentos</span>
                            <input type="checkbox" id="pref-cat-administrativo" checked class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500">
                        </label>
                        <label class="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100/80 transition-all cursor-pointer">
                            <span class="flex items-center gap-2 text-slate-700"><i class="fa-solid fa-comments text-purple-600"></i> Mensajería Interna</span>
                            <input type="checkbox" id="pref-cat-mensajes" checked class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500">
                        </label>
                        <label class="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100/80 transition-all cursor-pointer">
                            <span class="flex items-center gap-2 text-slate-700"><i class="fa-solid fa-user-check text-amber-600"></i> Asistencia & Puntualidad</span>
                            <input type="checkbox" id="pref-cat-asistencia" checked class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500">
                        </label>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold pt-2">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Preferencia de Avisos Externos Opción</label>
                        <select id="pref-ext-channel" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                            <option value="NINGUNO">Ninguno (Solo plataforma web)</option>
                            <option value="SOLO_CORREO">Correo Electrónico Institucional</option>
                            <option value="SMS_SOLO_URGENTE">SMS (Solo alertas de urgencia)</option>
                            <option value="WHATSAPP_SOLO_URGENTE">WhatsApp (Solo alertas de urgencia)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Frecuencia de Notificación</label>
                        <select id="pref-frequency" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                            <option value="INMEDIATA">Inmediata (Al recibir la acción)</option>
                            <option value="RESUMEN_DIARIO">Resumen Diario</option>
                            <option value="SOLO_SEMANAL">Resumen Semanal</option>
                        </select>
                    </div>
                </div>
            </div>

            <div id="tab-panel-role-settings" class="space-y-6 hidden">
                <div id="role-settings-dynamic-container" class="space-y-4"></div>
            </div>

            <div id="tab-panel-provider-settings" class="space-y-6 hidden">
                <div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                    <i class="fa-solid fa-lock text-amber-700 text-lg mt-0.5"></i>
                    <div class="text-xs text-amber-900 leading-relaxed font-medium">
                        <strong>Administración Restringida (Nivel A):</strong> Solo la Dirección Institucional y la Administración Técnica pueden habilitar, probar o parametrizar las pasarelas de pago y adaptadores multicanal (Twilio SMS, Meta WhatsApp, Messenger, SMTP).
                    </div>
                </div>

                <div id="provider-integrations-list" class="space-y-3">
                    <p class="text-xs text-slate-400 italic">Cargando integraciones de proveedores...</p>
                </div>
            </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span class="text-[11px] text-slate-400 font-bold uppercase">New Generation Christian Academy</span>
            <div class="flex items-center gap-3">
                <button id="btn-cancel-dashboard-settings" class="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-300 transition-all">
                    Cancelar
                </button>
                <button id="btn-save-dashboard-settings" class="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                    <i class="fa-solid fa-floppy-disk mr-1.5"></i> Guardar Opciones
                </button>
            </div>
        </div>
    </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    window.bindDashboardSettingsModalEvents();
};

window.bindDashboardSettingsModalEvents = function() {
    var closeBtn = document.getElementById('btn-close-dashboard-settings');
    var cancelBtn = document.getElementById('btn-cancel-dashboard-settings');
    var saveBtn = document.getElementById('btn-save-dashboard-settings');

    if (closeBtn) closeBtn.onclick = window.closeDashboardSettingsModal;
    if (cancelBtn) cancelBtn.onclick = window.closeDashboardSettingsModal;
    if (saveBtn) saveBtn.onclick = window.saveDashboardSettingsModal;

    var tab1 = document.getElementById('tab-btn-user-settings');
    var tab2 = document.getElementById('tab-btn-role-settings');
    var tab3 = document.getElementById('tab-btn-provider-settings');

    if (tab1) tab1.onclick = function() { window.switchSettingsTab('user'); };
    if (tab2) tab2.onclick = function() { window.switchSettingsTab('role'); };
    if (tab3) tab3.onclick = function() { window.switchSettingsTab('provider'); };
};

window.switchSettingsTab = function(tabName) {
    var p1 = document.getElementById('tab-panel-user-settings');
    var p2 = document.getElementById('tab-panel-role-settings');
    var p3 = document.getElementById('tab-panel-provider-settings');

    var b1 = document.getElementById('tab-btn-user-settings');
    var b2 = document.getElementById('tab-btn-role-settings');
    var b3 = document.getElementById('tab-btn-provider-settings');

    if (p1) p1.classList.toggle('hidden', tabName !== 'user');
    if (p2) p2.classList.toggle('hidden', tabName !== 'role');
    if (p3) p3.classList.toggle('hidden', tabName !== 'provider');

    var activeClass = 'border-blue-600 text-blue-600 font-black';
    var inactiveClass = 'border-transparent text-slate-500 hover:text-slate-800';

    if (b1) b1.className = 'settings-tab-btn py-3 px-4 border-b-2 flex items-center gap-2 ' + (tabName === 'user' ? activeClass : inactiveClass);
    if (b2) b2.className = 'settings-tab-btn py-3 px-4 border-b-2 flex items-center gap-2 ' + (tabName === 'role' ? activeClass : inactiveClass);
    if (b3) b3.className = 'settings-tab-btn py-3 px-4 border-b-2 flex items-center gap-2 ' + (tabName === 'provider' ? activeClass : inactiveClass);

    if (tabName === 'provider') {
        window.loadProviderIntegrationsInModal();
    }
};

window.openDashboardSettingsModal = function() {
    window.ensureDashboardSettingsModalExists();
    var modal = document.getElementById('modal-dashboard-settings');
    if (!modal) return;

    var user = null;
    try {
        user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || localStorage.getItem('usuario_actual') || '{}');
    } catch(e) { user = {}; }

    var role = user.authRole || user.rol || user.role || 'Estudiante';
    var badge = document.getElementById('settings-role-badge');
    if (badge) badge.textContent = role;

    var tab3Btn = document.getElementById('tab-btn-provider-settings');
    if (tab3Btn) {
        var canManageProviders = (role === 'Administrador' || role === 'Director' || role === 'Subdirector' || role === 'Desarrollador');
        tab3Btn.classList.toggle('hidden', !canManageProviders);
    }

    window.switchSettingsTab('user');
    window.loadUserSettingsInModal(user);
    window.renderRoleSettingsInModal(role, user);

    modal.classList.remove('hidden');
};

window.closeDashboardSettingsModal = function() {
    var modal = document.getElementById('modal-dashboard-settings');
    if (modal) modal.classList.add('hidden');
};

window.loadUserSettingsInModal = function(user) {
    var userId = user.userId || user.id || 'USER-001';
    if (window.fetchApi) {
        fetchApi('USER', 'getUserSettings', { userId: userId, currentUser: user }).then(function(res) {
            if (res && res.status === 'success' && res.data) {
                var cats = res.data.categories || {};
                var ac = document.getElementById('pref-cat-academico');
                var ad = document.getElementById('pref-cat-administrativo');
                var me = document.getElementById('pref-cat-mensajes');
                var as = document.getElementById('pref-cat-asistencia');
                if (ac) ac.checked = cats.academico !== false;
                if (ad) ad.checked = cats.administrativo !== false;
                if (me) me.checked = cats.mensajes !== false;
                if (as) as.checked = cats.asistencia !== false;

                var extSelect = document.getElementById('pref-ext-channel');
                var freqSelect = document.getElementById('pref-frequency');
                if (extSelect) extSelect.value = res.data.externalChannelPreference || 'NINGUNO';
                if (freqSelect) freqSelect.value = res.data.frequency || 'INMEDIATA';
            }
        }).catch(function(err) {
            console.warn('Fallback local settings:', err);
        });
    }
};

window.renderRoleSettingsInModal = function(role, user) {
    var container = document.getElementById('role-settings-dynamic-container');
    if (!container) return;

    var html = '';
    if (role === 'Profesor') {
        html = `
            <div class="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex items-start gap-3">
                <i class="fa-solid fa-chalkboard-user text-purple-600 text-lg mt-0.5"></i>
                <div class="text-xs text-purple-900 leading-relaxed font-medium">
                    <strong>Configuración del Espacio Docente:</strong> Administre la presentación de sus asignaturas asignadas, tolerancia de entrega para tareas propias y reglas de evaluación del aula.
                    <br><span class="text-[11px] text-purple-700 italic">Aviso: El calendario oficial del instituto y los periodos académicos son gestionados de forma central por la Dirección.</span>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Escala por Defecto en Rúbricas</label>
                    <select id="role-cfg-rubric-scale" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <option value="PORCENTAJE">Porcentaje Numérico (0 - 100%)</option>
                        <option value="CUALITATIVO">Cualitativo (Excelente, Muy Bueno, En Proceso)</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Prórroga Automática de Tareas</label>
                    <select id="role-cfg-grace-period" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <option value="SIN_PRORROGA">Sin Prórroga (Pena del 50% inmediata)</option>
                        <option value="24_HORAS">24 Horas de Tolerancia</option>
                        <option value="48_HORAS">48 Horas de Tolerancia</option>
                    </select>
                </div>
            </div>
        `;
    } else if (role === 'Director' || role === 'Administrador' || role === 'Subdirector') {
        html = `
            <div class="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                <i class="fa-solid fa-building-columns text-blue-600 text-lg mt-0.5"></i>
                <div class="text-xs text-blue-900 leading-relaxed font-medium">
                    <strong>Parámetros Institucionales del Sistema:</strong> Reglas generales del instituto, ciclo lectivo activo y avisos globales para todos los departamentos.
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Año Lectivo Institucional Activo</label>
                    <input type="text" id="role-cfg-academic-year" value="Año Lectivo 2026" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Modo del Sistema</label>
                    <select id="role-cfg-sys-mode" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <option value="OPERACION_ORDINARIA">Operación Ordinaria (Lectivo)</option>
                        <option value="MATRICULA_ABIERTA">Período de Matrícula Abierta</option>
                        <option value="CIERRE_EVALUATIVO">Período de Cierre Evaluativo</option>
                    </select>
                </div>
            </div>
        `;
    } else if (role === 'Secretaría') {
        html = `
            <div class="p-4 bg-teal-50 border border-teal-100 rounded-2xl flex items-start gap-3">
                <i class="fa-solid fa-file-signature text-teal-600 text-lg mt-0.5"></i>
                <div class="text-xs text-teal-900 leading-relaxed font-medium">
                    <strong>Configuración de Trámites y Admisiones:</strong> Parámetros de recepción de excusas, avisos de documentación pendiente y reglas de constancias.
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Auto-asignación de Trámites</label>
                    <select id="role-cfg-auto-assign" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <option value="VENTANILLA_GENERAL">Ventanilla Única General</option>
                        <option value="POR_GRADO">Por Grado Académico</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Días Hábiles Máximos de Resolución</label>
                    <input type="number" id="role-cfg-max-days" value="3" min="1" max="10" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                </div>
            </div>
        `;
    } else if (role === 'Contador') {
        html = `
            <div class="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                <i class="fa-solid fa-calculator text-emerald-600 text-lg mt-0.5"></i>
                <div class="text-xs text-emerald-900 leading-relaxed font-medium">
                    <strong>Configuración de Cobros y Facturación:</strong> Textos al pie de recibos de pago y notificaciones de estados de cuenta.
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Leyenda en Comprobantes de Pago</label>
                    <input type="text" id="role-cfg-receipt-footer" value="Gracias por su pago puntualmente en New Generation Christian Academy" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Día Límite de Recargo de Colegiatura</label>
                    <input type="number" id="role-cfg-surcharge-day" value="10" min="1" max="28" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                </div>
            </div>
        `;
    } else if (role === 'EncargadoTienda' || role === 'EncargadoCafeteria') {
        html = `
            <div class="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                <i class="fa-solid fa-store text-amber-600 text-lg mt-0.5"></i>
                <div class="text-xs text-amber-900 leading-relaxed font-medium">
                    <strong>Configuración Operativa de Tienda / Cafetería:</strong> Alertas de existencias bajas y formato de recibo comercial.
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Umbral de Alerta de Stock Bajo</label>
                    <input type="number" id="role-cfg-low-stock" value="5" min="1" max="50" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Vista del Menú / Catálogo</label>
                    <select id="role-cfg-catalog-view" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <option value="TARJETAS_GRID">Tarjetas con Foto</option>
                        <option value="LISTA_COMPACTA">Lista Compacta</option>
                    </select>
                </div>
            </div>
        `;
    } else {
        html = `
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <i class="fa-solid fa-user text-slate-600 text-lg mt-0.5"></i>
                <div class="text-xs text-slate-700 leading-relaxed font-medium">
                    <strong>Configuración del Estudiante / Tutor:</strong> Seleccione las preferencias de visualización académica e interfaz para su sesión.
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Vista de Actividades Pendientes</label>
                    <select id="role-cfg-student-view" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <option value="ORDEN_FECHA">Por Fecha de Vencimiento</option>
                        <option value="ORDEN_ASIGNATURA">Agrupado por Asignatura</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Formato de Calendario Semanal</label>
                    <select id="role-cfg-calendar-format" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <option value="VISTA_SEMANAL">Vista Semanal Guiada</option>
                        <option value="VISTA_LISTA">Lista Cronológica</option>
                    </select>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
};

window.loadProviderIntegrationsInModal = function() {
    var listContainer = document.getElementById('provider-integrations-list');
    if (!listContainer) return;

    var user = null;
    try {
        user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || localStorage.getItem('usuario_actual') || '{}');
    } catch(e) { user = {}; }

    var role = user.authRole || user.rol || user.role || 'Estudiante';

    var defaultProviders = [
        { integrationId: "INT-SMS", providerType: "SMS", providerName: "Twilio / SMS Gateway", serviceCategory: "Mensajería", enabled: false, environment: "Sandbox", status: "DESACTIVADO" },
        { integrationId: "INT-WA", providerType: "WHATSAPP", providerName: "Meta Cloud API", serviceCategory: "Mensajería", enabled: false, environment: "Production", status: "DESACTIVADO" },
        { integrationId: "INT-MSG", providerType: "MESSENGER", providerName: "Facebook Messenger API", serviceCategory: "Mensajería", enabled: false, environment: "Production", status: "DESACTIVADO" },
        { integrationId: "INT-EMAIL", providerType: "EMAIL", providerName: "Gmail / SMTP", serviceCategory: "Correo Institucional", enabled: true, environment: "Production", status: "ACTIVO" },
        { integrationId: "INT-PAY-BAC", providerType: "PASARELA_PAGO", providerName: "BAC Credomatic Pasarela", serviceCategory: "Cobros Financieros", enabled: false, environment: "Test", status: "CONFIGURADO" }
    ];

    if (window.fetchApi) {
        fetchApi('USER', 'getProviderIntegrations', { authRole: role }).then(function(res) {
            if (res && res.status === 'success' && res.data && res.data.length > 0) {
                window.renderProviderCardsInModal(res.data);
            } else {
                window.renderProviderCardsInModal(defaultProviders);
            }
        }).catch(function(err) {
            window.renderProviderCardsInModal(defaultProviders);
        });
    } else {
        window.renderProviderCardsInModal(defaultProviders);
    }
};

window.renderProviderCardsInModal = function(list) {
    var listContainer = document.getElementById('provider-integrations-list');
    if (!listContainer) return;

    var html = '';
    list.forEach(function(item) {
        var isEnabled = item.enabled;
        html += `
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl ${isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'} flex items-center justify-center font-bold text-base">
                        <i class="fa-solid ${item.providerType === 'PASARELA_PAGO' ? 'fa-credit-card' : 'fa-comment-sms'}"></i>
                    </div>
                    <div>
                        <h5 class="text-xs font-black text-slate-800 uppercase leading-none">${item.providerName}</h5>
                        <p class="text-[11px] text-slate-500 mt-1">Categoría: ${item.serviceCategory} | Entorno: <span class="font-bold text-slate-700">${item.environment}</span></p>
                    </div>
                </div>
                <div class="flex items-center gap-3 justify-end">
                    <span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}">
                        ${item.status || (isEnabled ? 'ACTIVO' : 'DESACTIVADO')}
                    </span>
                    <button onclick="window.testProviderIntegration('${item.integrationId}', '${item.providerType}')" class="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all">
                        <i class="fa-solid fa-vial mr-1"></i> Probar Conexión
                    </button>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html;
};

window.testProviderIntegration = function(integrationId, providerType) {
    if (window.fetchApi) {
        fetchApi('USER', 'sendChannelNotificationTest', { canalId: providerType, destinatarioPrueba: '9999-0000' }).then(function(res) {
            alert(res.message || 'Prueba de conexión completada exitosamente.');
        }).catch(function(err) {
            alert('Error en la prueba: ' + err.message);
        });
    }
};

window.saveDashboardSettingsModal = function() {
    var user = null;
    try {
        user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || localStorage.getItem('usuario_actual') || '{}');
    } catch(e) { user = {}; }

    var userId = user.userId || user.id || 'USER-001';
    var role = user.authRole || user.rol || user.role || 'Estudiante';

    var ac = document.getElementById('pref-cat-academico');
    var ad = document.getElementById('pref-cat-administrativo');
    var me = document.getElementById('pref-cat-mensajes');
    var as = document.getElementById('pref-cat-asistencia');

    var extSelect = document.getElementById('pref-ext-channel');
    var freqSelect = document.getElementById('pref-frequency');

    var preferences = {
        categories: {
            academico: ac ? ac.checked : true,
            administrativo: ad ? ad.checked : true,
            mensajes: me ? me.checked : true,
            asistencia: as ? as.checked : true,
            comercial: false
        },
        inAppEnabled: true,
        externalChannelPreference: extSelect ? extSelect.value : 'NINGUNO',
        frequency: freqSelect ? freqSelect.value : 'INMEDIATA'
    };

    var saveBtn = document.getElementById('btn-save-dashboard-settings');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Guardando...';
    }

    if (window.fetchApi) {
        fetchApi('USER', 'saveUserSettings', { userId: userId, preferences: preferences, currentUser: user, authRole: role }).then(function(res) {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-1.5"></i> Guardar Opciones';
            }
            alert(res.message || 'Preferencias guardadas con éxito.');
            window.closeDashboardSettingsModal();
        }).catch(function(err) {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-1.5"></i> Guardar Opciones';
            }
            alert('Error al guardar: ' + err.message);
        });
    } else {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-1.5"></i> Guardar Opciones';
        }
        window.closeDashboardSettingsModal();
    }
};

// Auto-inicialización resiliente de UI común
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (window.setupCommonUI) window.setupCommonUI();
    });
} else {
    if (window.setupCommonUI) window.setupCommonUI();
}
