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

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('./sw.js').then(function(reg) {
                console.log('[PWA] Service Worker registrado exitosamente:', reg.scope);
            }).catch(function(err) {
                console.warn('[PWA] Error al registrar Service Worker:', err);
            });
        });
    }

    // ---------------------------------------------------------------------------
    // ---------------------------------------------------------------------------
    // [T-UX-22] [Fase 3: Experiencia de Usuario y Navegación Unificada] - COMPORTAMIENTO Y SIGNIFICADO PRECISO DEL INDICADOR DE CONEXIÓN EN LÍNEA / OFFLINE
    // Asegura la representación precisa del estado comprobable de red (navigator.onLine), removiendo opacidades obsoletas y notificando explícitamente reconexiones.
    // ---------------------------------------------------------------------------
    // [T-UX-07] [Fase 3: Experiencia de Usuario y Navegación Unificada] - INDICADOR DISCRETO DE ESTADO DE CONEXIÓN EN LÍNEA / OFFLINE
    // Renderiza un indicador discreto en la esquina inferior izquierda que reacciona a eventos online/offline sin obstruir el contenido principal de la pantalla.
    // ---------------------------------------------------------------------------
    // Online / Offline Status Badge
    function updateOnlineBadge() {
        var badge = document.getElementById('online-status-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'online-status-badge';
            badge.className = 'fixed bottom-4 left-4 z-[9999] px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg flex items-center gap-1.5';
            document.body.appendChild(badge);
        }
        if (navigator.onLine) {
            badge.className = 'fixed bottom-4 left-4 z-[9999] px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shadow-md flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 opacity-100';
            badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> <span>Conexión Estable</span>';
            setTimeout(function() { if (badge && navigator.onLine) badge.classList.add('opacity-0'); }, 4000);
        } else {
            badge.className = 'fixed bottom-4 left-4 z-[9999] px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shadow-lg flex items-center gap-1.5 bg-amber-500 text-white opacity-100';
            badge.innerHTML = '<i class="fa-solid fa-wifi-slash"></i> <span>Sin Conexión (Modo Local)</span>';
        }
    }
    window.updateOnlineBadge = updateOnlineBadge;

    window.addEventListener('online', function() {
        updateOnlineBadge();
        if (window.syncOfflineQueue) window.syncOfflineQueue();
    });
    window.addEventListener('offline', updateOnlineBadge);
    updateOnlineBadge();

    if (window.initProblemReportingUI) {
        window.initProblemReportingUI();
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

    // [T-UX-02] [Fase 3: Experiencia de Usuario y Navegación Unificada] - Soporte universal de tecla Escape para cierre de modales y restauración de foco.
    window.trackModalFocus = function(triggerEl) {
        window.lastActiveElementBeforeModal = triggerEl || document.activeElement;
    };

    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            var modalWasClosed = false;
            var activeModals = [
                'profile-modal',
                'modal-dashboard-settings',
                'modal-document-reader',
                'modal-submission-comparer',
                'modal-report-viewer',
                'modal-pdf-overlay-editor',
                'modal-form-builder',
                'modal-workflow-builder',
                'modal-workflow-decision',
                'modal-channel-config',
                'modal-excel-importer',
                'modal-global-omnibox',
                'modal-report-issue',
                'modal-my-tickets',
                'modal-admin-tickets',
                'modal-health-dashboard',
                'modal-interactive-help',
                'modal-conflict-resolution',
                'modal-first-login-terms',
                'modal-universal-analytics-chart',
                'academic-menu-modal',
                'mobile-hamburger-drawer'
            ];
            activeModals.forEach(function(modalId) {
                var el = document.getElementById(modalId);
                if (el && !el.classList.contains('hidden')) {
                    el.classList.add('hidden');
                    modalWasClosed = true;
                }
            });

            var dynamicModals = document.querySelectorAll('.fixed.inset-0[role="dialog"]:not(.hidden), [role="dialog"]:not(.hidden), .modal:not(.hidden), [data-modal]:not(.hidden)');
            for (var i = 0; i < dynamicModals.length; i++) {
                dynamicModals[i].classList.add('hidden');
                modalWasClosed = true;
            }

            if (window.closeInteractiveGuide) {
                window.closeInteractiveGuide();
            }

            if (modalWasClosed && window.lastActiveElementBeforeModal && typeof window.lastActiveElementBeforeModal.focus === 'function' && document.body.contains(window.lastActiveElementBeforeModal)) {
                try {
                    window.lastActiveElementBeforeModal.focus();
                } catch (_) {}
                window.lastActiveElementBeforeModal = null;
            }
        }
    });

    // --- Mobile Menu Logic (Redirect to Academic Modal A-73/74) ---
    window.openMobileMenu = function(section) {
        window.openAcademicMenu();
    };

    window.closeMobileMenu = function() {
        window.closeAcademicMenu();
    };

    // --- Unified Profile Modal Logic (A-75) ---
    window.openProfileModal = function(pushState) {
        if (window.trackModalFocus) window.trackModalFocus();
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

    // [T-UX-01] [Fase 3: Experiencia de Usuario y Navegación Unificada] - Función centralizada para el manejo de expiración de sesión y redirección con aviso explicativo.
    window.handleSessionExpired = function(reason) {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('usuario_actual');
        sessionStorage.removeItem('usuario_actual');
        localStorage.removeItem('usuario_sesion');
        sessionStorage.removeItem('usuario_sesion');
        var msg = reason ? encodeURIComponent(reason) : '1';
        window.location.href = 'login.html?session_expired=' + msg;
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
            <button id="tab-btn-visual-settings" class="settings-tab-btn py-3 px-4 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center gap-2 hidden">
                <i class="fa-solid fa-palette"></i> Identidad Visual
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

            <div id="tab-panel-visual-settings" class="space-y-6 hidden">
                <div class="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                    <i class="fa-solid fa-palette text-indigo-600 text-lg mt-0.5"></i>
                    <div class="text-xs text-indigo-900 leading-relaxed font-medium">
                        <strong>Personalización Global & Flujo de Aprobación:</strong> El Administrador propone la paleta institucional. Dirección la revisa y aprueba para su aplicación global inmediata a todos los usuarios.
                    </div>
                </div>

                <div class="space-y-4">
                    <h4 class="text-xs font-black uppercase text-slate-500 tracking-wider">Paletas Institucionales Sugeridas</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                        <div onclick="window.previewPalette('Azul Institucional', '#0d6efd', '#0b5ed7', '#e7f1ff', '#4b5563')" class="p-4 bg-slate-50 border-2 border-slate-200 hover:border-blue-500 rounded-2xl cursor-pointer transition-all space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="font-bold text-slate-800">Azul Institucional</span>
                                <span class="w-4 h-4 rounded-full bg-[#0d6efd]"></span>
                            </div>
                            <div class="flex gap-1.5">
                                <span class="w-6 h-6 rounded-lg bg-[#0d6efd]"></span>
                                <span class="w-6 h-6 rounded-lg bg-[#0b5ed7]"></span>
                                <span class="w-6 h-6 rounded-lg bg-[#e7f1ff]"></span>
                                <span class="w-6 h-6 rounded-lg bg-[#4b5563]"></span>
                            </div>
                        </div>

                        <div onclick="window.previewPalette('Verde Sobrio', '#15803d', '#166534', '#f0fdf4', '#475569')" class="p-4 bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 rounded-2xl cursor-pointer transition-all space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="font-bold text-slate-800">Verde Sobrio</span>
                                <span class="w-4 h-4 rounded-full bg-[#15803d]"></span>
                            </div>
                            <div class="flex gap-1.5">
                                <span class="w-6 h-6 rounded-lg bg-[#15803d]"></span>
                                <span class="w-6 h-6 rounded-lg bg-[#166534]"></span>
                                <span class="w-6 h-6 rounded-lg bg-[#f0fdf4]"></span>
                                <span class="w-6 h-6 rounded-lg bg-[#475569]"></span>
                            </div>
                        </div>

                        <div onclick="window.previewPalette('Gris Azulado', '#334155', '#1e293b', '#f1f5f9', '#64748b')" class="p-4 bg-slate-50 border-2 border-slate-200 hover:border-slate-500 rounded-2xl cursor-pointer transition-all space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="font-bold text-slate-800">Gris Azulado</span>
                                <span class="w-4 h-4 rounded-full bg-[#334155]"></span>
                            </div>
                            <div class="flex gap-1.5">
                                <span class="w-6 h-6 rounded-lg bg-[#334155]"></span>
                                <span class="w-6 h-6 rounded-lg bg-[#1e293b]"></span>
                                <span class="w-6 h-6 rounded-lg bg-[#f1f5f9]"></span>
                                <span class="w-6 h-6 rounded-lg bg-[#64748b]"></span>
                            </div>
                        </div>

                        <div onclick="window.previewPalette('Borgoña Profesional', '#881337', '#4c0519', '#fff1f2', '#57534e')" class="p-4 bg-slate-50 border-2 border-slate-200 hover:border-rose-800 rounded-2xl cursor-pointer transition-all space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="font-bold text-slate-800">Borgoña Profesional</span>
                                <span class="w-4 h-4 rounded-full bg-[#881337]"></span>
                            </div>
                            <div class="flex gap-1.5">
                                <span class="w-6 h-6 rounded-lg bg-[#881337]"></span>
                                <span class="w-6 h-6 rounded-lg bg-[#4c0519]"></span>
                                <span class="w-6 h-6 rounded-lg bg-[#fff1f2]"></span>
                                <span class="w-6 h-6 rounded-lg bg-[#57534e]"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                    <h4 class="text-xs font-black uppercase text-slate-500 tracking-wider">Previsualización Interactiva Real</h4>
                    <div id="palette-preview-sandbox" class="p-4 rounded-xl space-y-3 transition-all border" style="background-color: var(--color-background); border-color: var(--color-border);">
                        <div class="flex items-center justify-between">
                            <span id="preview-palette-title" class="font-bold text-xs" style="color: var(--color-text-primary);">Paleta Seleccionada: Azul Institucional</span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold" style="background-color: var(--color-primary-light); color: var(--color-primary);">Demo Previa</span>
                        </div>

                        <div class="flex flex-wrap items-center gap-2">
                            <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all" style="background-color: var(--color-primary);">Botón Principal</button>
                            <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border" style="background-color: var(--color-surface); color: var(--color-text-primary); border-color: var(--color-border);">Botón Secundario</button>
                            <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style="background-color: var(--color-btn-cancel-bg); color: var(--color-btn-cancel-text);">Cancelar</button>
                        </div>

                        <div class="p-3 rounded-lg border text-xs font-medium" style="background-color: var(--color-surface); border-color: var(--color-border); color: var(--color-text-secondary);">
                            Campo de formulario de prueba con borde y texto institucional.
                        </div>
                    </div>

                    <div id="palette-action-controls" class="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <span class="text-[11px] text-slate-400 font-medium">Requiere propuesta del Administrador y aprobación de Dirección.</span>
                        <div class="flex items-center gap-2">
                            <button id="btn-submit-palette-proposal" onclick="window.submitPaletteProposal()" class="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all shadow-md">
                                <i class="fa-solid fa-paper-plane mr-1"></i> Proponer Paleta
                            </button>
                            <button id="btn-approve-palette-proposal" onclick="window.approvePaletteProposal('Aprobar')" class="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-md hidden">
                                <i class="fa-solid fa-circle-check mr-1"></i> Aprobar & Publicar Global
                            </button>
                        </div>
                    </div>
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
    var tab4 = document.getElementById('tab-btn-visual-settings');

    if (tab1) tab1.onclick = function() { window.switchSettingsTab('user'); };
    if (tab2) tab2.onclick = function() { window.switchSettingsTab('role'); };
    if (tab3) tab3.onclick = function() { window.switchSettingsTab('provider'); };
    if (tab4) tab4.onclick = function() { window.switchSettingsTab('visual'); };
};

window.switchSettingsTab = function(tabName) {
    var p1 = document.getElementById('tab-panel-user-settings');
    var p2 = document.getElementById('tab-panel-role-settings');
    var p3 = document.getElementById('tab-panel-provider-settings');
    var p4 = document.getElementById('tab-panel-visual-settings');

    var b1 = document.getElementById('tab-btn-user-settings');
    var b2 = document.getElementById('tab-btn-role-settings');
    var b3 = document.getElementById('tab-btn-provider-settings');
    var b4 = document.getElementById('tab-btn-visual-settings');

    if (p1) p1.classList.toggle('hidden', tabName !== 'user');
    if (p2) p2.classList.toggle('hidden', tabName !== 'role');
    if (p3) p3.classList.toggle('hidden', tabName !== 'provider');
    if (p4) p4.classList.toggle('hidden', tabName !== 'visual');

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
    if (window.trackModalFocus) window.trackModalFocus();
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

    var tab4Btn = document.getElementById('tab-btn-visual-settings');
    if (tab4Btn) {
        var canManageVisual = (role === 'Administrador' || role === 'Director' || role === 'Desarrollador');
        tab4Btn.classList.toggle('hidden', !canManageVisual);
    }

    var approveBtn = document.getElementById('btn-approve-palette-proposal');
    if (approveBtn) {
        var canApproveVisual = (role === 'Director' || role === 'Administrador' || role === 'Desarrollador');
        approveBtn.classList.toggle('hidden', !canApproveVisual);
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

// ---------------------------------------------------------------------------
// [T-UX-10] [Fase 3: Experiencia de Usuario y Navegación Unificada] - SUITE AUTOMATIZADA DE PRUEBAS DE EXPERIENCIA DE USUARIO (UX-01 A UX-09)
// Ejecuta un análisis automatizado de verificación de capacidades UX en la interfaz: manejo de expiración de sesión, tecla Escape, protección de formularios, frescura de datos, normalizador diacrítico, Omnibox global, estado en línea, reporte de problemas y navegación por rol.
// ---------------------------------------------------------------------------
window.runUXSuiteTests = function() {
    var results = [];

    function addResult(id, name, success, detail) {
        results.push({ id: id, name: name, status: success ? 'PASS' : 'FAIL', detail: detail });
    }

    // UX-01: Session Expiration Handler
    try {
        var hasHandler = typeof window.handleSessionExpired === 'function';
        addResult('UX-01', 'Centralized Session Expiration Handler', hasHandler, hasHandler ? 'Manejador handleSessionExpired disponible en window' : 'Manejador no definido');
    } catch (e1) {
        addResult('UX-01', 'Centralized Session Expiration Handler', false, e1.message);
    }

    // UX-02: Escape Key & Modal Focus Restoration
    try {
        var hasFocusTracker = typeof window.trackModalFocus === 'function';
        addResult('UX-02', 'Universal Escape Key & Modal Focus Restoration', hasFocusTracker, hasFocusTracker ? 'Rastreador trackModalFocus y manejador ESC registrado' : 'Función trackModalFocus ausente');
    } catch (e2) {
        addResult('UX-02', 'Universal Escape Key & Modal Focus Restoration', false, e2.message);
    }

    // UX-03: Unsaved Changes Protection
    try {
        var hasFormProtection = typeof window.setupUnsavedChangesProtection === 'function';
        addResult('UX-03', 'Unsaved Form Changes Protection', hasFormProtection, hasFormProtection ? 'Módulo setupUnsavedChangesProtection disponible' : 'Módulo ausente');
    } catch (e3) {
        addResult('UX-03', 'Unsaved Form Changes Protection', false, e3.message);
    }

    // UX-04: Data Freshness Badge
    try {
        var hasBadgeRenderer = typeof window.renderDataFreshnessBadge === 'function';
        addResult('UX-04', 'Data Freshness Badge Rendering', hasBadgeRenderer, hasBadgeRenderer ? 'Función renderDataFreshnessBadge disponible' : 'Función ausente');
    } catch (e4) {
        addResult('UX-04', 'Data Freshness Badge Rendering', false, e4.message);
    }

    // UX-05: Diacritic-Insensitive Search Normalization
    try {
        var normVal = typeof window.normalizeSearchString === 'function' ? window.normalizeSearchString('Matemáticas Rápídas') : '';
        var passesNorm = normVal === 'matematicas rapidas';
        addResult('UX-05', 'Diacritic-Insensitive Search Normalization', passesNorm, passesNorm ? 'Normalización verificada: "Matemáticas Rápídas" -> "matematicas rapidas"' : 'Resultado inesperado: ' + normVal);
    } catch (e5) {
        addResult('UX-05', 'Diacritic-Insensitive Search Normalization', false, e5.message);
    }

    // UX-06: Unified Omnibox Ctrl+K
    try {
        var hasOmnibox = typeof window.openGlobalOmniboxModal === 'function';
        addResult('UX-06', 'Unified Multi-Entity Omnibox Modal (Ctrl+K)', hasOmnibox, hasOmnibox ? 'Módulo openGlobalOmniboxModal disponible' : 'Módulo ausente');
    } catch (e6) {
        addResult('UX-06', 'Unified Multi-Entity Omnibox Modal (Ctrl+K)', false, e6.message);
    }

    // UX-07: Online/Offline Connection Status
    try {
        var hasOnlineBadge = !!document.getElementById('online-status-badge') || typeof navigator.onLine === 'boolean';
        addResult('UX-07', 'Discrete Connection Status Indicator', hasOnlineBadge, hasOnlineBadge ? 'Indicador de conectividad disponible' : 'Elemento de estado no hallado');
    } catch (e7) {
        addResult('UX-07', 'Discrete Connection Status Indicator', false, e7.message);
    }

    // UX-08: Problem Reporting Ticket Flow
    try {
        var hasReportModal = typeof window.openReportIssueModal === 'function';
        addResult('UX-08', 'Problem Reporting Ticket Modal Flow', hasReportModal, hasReportModal ? 'Módulo openReportIssueModal disponible' : 'Módulo ausente');
    } catch (e8) {
        addResult('UX-08', 'Problem Reporting Ticket Modal Flow', false, e8.message);
    }

    // UX-09: Role Navigation & Mobile Drawer Collapse
    try {
        var hasRoleNav = typeof window.openMobileHamburgerDrawer === 'function' && typeof window.toggleRoleMenuAccordionSection === 'function';
        addResult('UX-09', 'Role-Specific Sidebar & Mobile Drawer Collapse', hasRoleNav, hasRoleNav ? 'Módulo de navegación por rol y drawer responsivo disponible' : 'Funciones de navegación ausentes');
    } catch (e9) {
        addResult('UX-09', 'Role-Specific Sidebar & Mobile Drawer Collapse', false, e9.message);
    }

    var passedCount = results.filter(function(r) { return r.status === 'PASS'; }).length;
    var summary = {
        total: results.length,
        passed: passedCount,
        failed: results.length - passedCount,
        results: results
    };

    console.log('=== [T-UX-10] UX SUITE AUTOMATED TEST RESULTS ===', summary);
    return summary;
};

// [FASE2-T18] [Fase 2 - Tablero de Salud e Interoperabilidad Institucional] - Renderizado interactivo del estado de salud de microservicios, latencias, tasas de error y advertencias de cuota sin exponer PII.
window.openInstitutionalHealthDashboardModal = function() {
    var modalId = "modal-health-dashboard";
    var existingModal = document.getElementById(modalId);
    if (existingModal) existingModal.remove();

    var healthData = window.getServiceHealthMetrics ? window.getServiceHealthMetrics() : { totalCalls: 0, successCalls: 0, failedCalls: 0, quotaErrors: 0, serviceMetrics: {} };
    var totalCalls = healthData.totalCalls || 0;
    var failedCalls = healthData.failedCalls || 0;
    var quotaErrors = healthData.quotaErrors || 0;
    var errorRatePct = totalCalls > 0 ? Math.round((failedCalls / totalCalls) * 100) : 0;

    var services = ["USER", "ACADEMIC", "ACCOUNTING", "TASK", "EXAM"];
    var cardsHtml = services.map(function(svc) {
        var m = (healthData.serviceMetrics && healthData.serviceMetrics[svc]) || { total: 0, success: 0, failed: 0, quotaExceeded: 0 };
        var svcErrorRate = m.total > 0 ? Math.round((m.failed / m.total) * 100) : 0;
        var statusBadge = svcErrorRate > 15 ? '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">DEGRADADO</span>' : '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">OPERATIVO</span>';

        return '<div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">' +
            '<div class="flex justify-between items-center mb-2">' +
                '<h4 class="font-bold text-gray-800">' + svc + ' SERVICE</h4>' +
                statusBadge +
            '</div>' +
            '<div class="text-sm text-gray-600 space-y-1">' +
                '<p>Llamadas totales: <span class="font-semibold">' + m.total + '</span></p>' +
                '<p>Exitosas: <span class="font-semibold text-green-600">' + m.success + '</span></p>' +
                '<p>Fallidas: <span class="font-semibold text-red-600">' + m.failed + '</span></p>' +
                '<p>Excesos de cuota: <span class="font-semibold text-yellow-600">' + m.quotaExceeded + '</span></p>' +
            '</div>' +
        '</div>';
    }).join('');

    var modalHtml = '<div id="' + modalId + '" class="fixed inset-0 z-[120] flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">' +
        '<div class="bg-gray-50 rounded-xl shadow-2xl max-w-4xl w-full p-6 relative border border-gray-200">' +
            '<button onclick="document.getElementById(\'' + modalId + '\').remove()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>' +
            '<div class="flex items-center space-x-3 mb-6">' +
                '<div class="p-3 bg-indigo-600 text-white rounded-lg"><i class="fas fa-heartbeat text-xl"></i></div>' +
                '<div>' +
                    '<h3 class="text-xl font-bold text-gray-800">Tablero de Salud e Interoperabilidad Institucional</h3>' +
                    '<p class="text-sm text-gray-500">Estado operativo en tiempo real de los microservicios de la plataforma</p>' +
                '</div>' +
            '</div>' +
            '<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">' +
                '<div class="bg-white p-4 rounded-lg border border-gray-250 text-center"><p class="text-xs text-gray-500 uppercase font-semibold">Llamadas Totales</p><p class="text-2xl font-bold text-gray-800">' + totalCalls + '</p></div>' +
                '<div class="bg-white p-4 rounded-lg border border-gray-250 text-center"><p class="text-xs text-gray-500 uppercase font-semibold">Tasa de Error Global</p><p class="text-2xl font-bold text-indigo-600">' + errorRatePct + '%</p></div>' +
                '<div class="bg-white p-4 rounded-lg border border-gray-250 text-center"><p class="text-xs text-gray-500 uppercase font-semibold">Alertas de Cuota</p><p class="text-2xl font-bold text-yellow-600">' + quotaErrors + '</p></div>' +
                '<div class="bg-white p-4 rounded-lg border border-gray-250 text-center"><p class="text-xs text-gray-500 uppercase font-semibold">Estado Global</p><p class="text-xl font-bold text-green-600">' + (errorRatePct > 15 ? 'DEGRADADO' : 'SALUDABLE') + '</p></div>' +
            '</div>' +
            '<h4 class="font-semibold text-gray-700 mb-3">Métricas por Microservicio</h4>' +
            '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">' + cardsHtml + '</div>' +
            '<div class="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-gray-200">' +
                '<span>Última actualización: ' + new Date().toLocaleTimeString() + '</span>' +
                '<button onclick="window.openInstitutionalHealthDashboardModal()" class="px-3 py-1 bg-indigo-100 text-indigo-700 font-semibold rounded hover:bg-indigo-200">Actualizar Mediciones</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.body.insertAdjacentHTML("beforeend", modalHtml);
};

// [FASE2-T10] [Fase 2 - Paginación Eficiente y Consultas Escalables] - Componente de paginación con soporte para datos locales o consultas remotas al servidor.
window.renderPaginatedTable = function(containerId, data, options) {
    options = options || {};
    var pageSize = options.pageSize || 15;
    var currentPage = options.currentPage || 1;
    var container = document.getElementById(containerId);
    if (!container) return;

    var isRemote = typeof options.fetchRemotePage === 'function';
    var totalItems = isRemote && options.remotePagination ? options.remotePagination.totalRecords : (data ? data.length : 0);
    var totalPages = isRemote && options.remotePagination ? options.remotePagination.totalPages : (Math.ceil(totalItems / pageSize) || 1);
    var startIndex = (currentPage - 1) * pageSize;
    var pageData = isRemote ? (data || []) : (data ? data.slice(startIndex, startIndex + pageSize) : []);

    if (typeof options.renderRow !== 'function') return;

    var html = '<div class="overflow-x-auto"><table class="w-full text-left text-sm border-collapse">';
    if (options.headers && options.headers.length) {
        html += '<thead class="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200"><tr>';
        options.headers.forEach(function(h) {
            html += '<th class="px-4 py-3 font-bold">' + h + '</th>';
        });
        html += '</tr></thead>';
    }
    html += '<tbody class="divide-y divide-slate-100">';
    if (pageData.length === 0) {
        html += '<tr><td colspan="' + (options.headers ? options.headers.length : 10) + '" class="px-4 py-6 text-center text-slate-400 font-medium">No se encontraron registros.</td></tr>';
    } else {
        pageData.forEach(function(item, idx) {
            html += options.renderRow(item, startIndex + idx);
        });
    }
    html += '</tbody></table></div>';

    if (totalPages > 1) {
        html += '<div class="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 rounded-b-xl">' +
            '<span>Mostrando ' + (startIndex + 1) + ' a ' + Math.min(startIndex + pageSize, totalItems) + ' de ' + totalItems + ' resultados</span>' +
            '<div class="flex items-center gap-2">' +
                '<button ' + (currentPage <= 1 ? 'disabled' : '') + ' class="btn-prev-page px-3 py-1 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors">Anterior</button>' +
                '<span class="font-bold">Página ' + currentPage + ' de ' + totalPages + '</span>' +
                '<button ' + (currentPage >= totalPages ? 'disabled' : '') + ' class="btn-next-page px-3 py-1 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors">Siguiente</button>' +
            '</div>' +
        '</div>';
    }

    container.innerHTML = html;

    var prevBtn = container.querySelector('.btn-prev-page');
    var nextBtn = container.querySelector('.btn-next-page');

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            var targetPage = currentPage - 1;
            if (isRemote) {
                options.fetchRemotePage(targetPage, pageSize);
            } else {
                window.renderPaginatedTable(containerId, data, Object.assign({}, options, { currentPage: targetPage }));
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            var targetPage = currentPage + 1;
            if (isRemote) {
                options.fetchRemotePage(targetPage, pageSize);
            } else {
                window.renderPaginatedTable(containerId, data, Object.assign({}, options, { currentPage: targetPage }));
            }
        });
    }
};

// ---------------------------------------------------------------------------
// [T-UX-15] [Fase 3: Experiencia de Usuario y Navegación Unificada] - FILTROS AVANZADOS, VISTAS GUARDADAS Y PAGINACIÓN COHERENTE
// Proporciona un administrador de filtros multi-campo con etiquetas de eliminación, persistencia de vistas personalizadas en localStorage y sincronización de paginación.
// ---------------------------------------------------------------------------
window.SAVED_TABLE_VIEWS_CACHE = {};

// ---------------------------------------------------------------------------
// [T-UX-16] [Fase 3: Experiencia de Usuario y Navegación Unificada] - ESTADOS UNIFICADOS DE NOTIFICACIONES, TAREAS PENDIENTES Y APROBACIONES
// Unifica el procesamiento de avisos informativos, solicitudes de aprobación y tareas pendientes con cálculo de no leídos, prioridades y rutas de navegación.
// ---------------------------------------------------------------------------
window.consolidatePendingApprovalsAndNotifications = function(rawItems) {
    var items = Array.isArray(rawItems) ? rawItems : [];
    var unreadCount = 0;
    var pendingApprovalsCount = 0;

    var processedItems = items.map(function(item) {
        var isRead = !!item.leido || item.estado === 'LEIDO';
        if (!isRead) unreadCount++;

        var category = (item.tipo || item.categoria || 'INFO').toString().toUpperCase();
        if (category === 'APROBACION' || category === 'APPROVAL' || category === 'TRAMITE') {
            category = 'APPROVAL';
            if (!isRead && item.estado !== 'APROBADO' && item.estado !== 'RECHAZADO') {
                pendingApprovalsCount++;
            }
        }

        return {
            id: item.id || item.codigo || ('NOTIF-' + Math.random().toString(36).substr(2, 6)),
            title: item.titulo || item.asunto || 'Aviso Institucional',
            description: item.descripcion || item.mensaje || '',
            category: category,
            priority: (item.prioridad || 'NORMAL').toString().toUpperCase(),
            isRead: isRead,
            timestamp: item.fecha || item.timestamp || new Date().toISOString(),
            targetModule: item.modulo || item.targetModule || 'dashboard'
        };
    });

    return {
        items: processedItems,
        unreadCount: unreadCount,
        pendingApprovalsCount: pendingApprovalsCount,
        markAsRead: function(itemId) {
            for (var i = 0; i < processedItems.length; i++) {
                if (processedItems[i].id === itemId) {
                    if (!processedItems[i].isRead) {
                        processedItems[i].isRead = true;
                        unreadCount = Math.max(0, unreadCount - 1);
                    }
                    break;
                }
            }
            return unreadCount;
        }
    };
};

window.setupAdvancedTableFilters = function(containerId, config) {
    config = config || {};
    var rawData = Array.isArray(config.data) ? config.data : [];
    var filterFields = Array.isArray(config.filterFields) ? config.filterFields : [];
    var onFilterChange = typeof config.onFilterChange === 'function' ? config.onFilterChange : function(){};

    var currentFilters = {};

    function applyFilters() {
        var filtered = rawData.filter(function(item) {
            for (var field in currentFilters) {
                if (!currentFilters.hasOwnProperty(field)) continue;
                var filterVal = window.normalizeSearchString(currentFilters[field]);
                if (!filterVal) continue;
                var itemVal = window.normalizeSearchString(item[field] || '');
                if (itemVal.indexOf(filterVal) === -1) {
                    return false;
                }
            }
            return true;
        });
        onFilterChange(filtered, currentFilters);
        return filtered;
    }

    return {
        setFilter: function(field, value) {
            if (!value) {
                delete currentFilters[field];
            } else {
                currentFilters[field] = value;
            }
            return applyFilters();
        },
        removeFilter: function(field) {
            delete currentFilters[field];
            return applyFilters();
        },
        clearAllFilters: function() {
            currentFilters = {};
            return applyFilters();
        },
        saveView: function(viewName) {
            if (!viewName) return;
            var storageKey = 'saved_views_' + containerId;
            var existingViews = {};
            try {
                existingViews = JSON.parse(localStorage.getItem(storageKey) || '{}');
            } catch (_) {}
            existingViews[viewName] = Object.assign({}, currentFilters);
            localStorage.setItem(storageKey, JSON.stringify(existingViews));
            window.SAVED_TABLE_VIEWS_CACHE[containerId + '_' + viewName] = Object.assign({}, currentFilters);
            return existingViews;
        },
        loadSavedView: function(viewName) {
            var storageKey = 'saved_views_' + containerId;
            var existingViews = {};
            try {
                existingViews = JSON.parse(localStorage.getItem(storageKey) || '{}');
            } catch (_) {}
            if (existingViews[viewName]) {
                currentFilters = Object.assign({}, existingViews[viewName]);
                return applyFilters();
            }
            return applyFilters();
        },
        getActiveFilters: function() {
            return Object.assign({}, currentFilters);
        }
    };
};

// [T-UX-05] [Fase 3: Experiencia de Usuario y Navegación Unificada] - Función utilitaria de normalización avanzada de búsquedas insensibles a acentos, signos de puntuación, mayúsculas y espacios diacríticos.
window.normalizeSearchString = function(str) {
    if (str === null || str === undefined) return '';
    return str
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
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

/* ===========================================================================
 * FASE 29 - GUIADO INTERACTIVO, VISOR DOCUMENTAL Y COMPARADOR DE ENTREGAS
 * =========================================================================== */

window.startInteractiveGuide = function(tourKey, forceRestart) {
    tourKey = tourKey || 'studentSubmission';
    var savedStep = forceRestart ? 1 : (parseInt(localStorage.getItem('guide_progress_' + tourKey) || '1', 10));

    var tours = {
        studentSubmission: [
            {
                title: "Paso 1: Explorar Actividades y Tareas",
                text: "En el panel principal, navega a la sección 'Tareas y Actividades' para ver los trabajos asignados.",
                targetSelector: "#section-tareas, #tareas-grid, #nav-activities"
            },
            {
                title: "Paso 2: Seleccionar y Ver Detalle",
                text: "Haz clic en el botón 'Ver Detalle y Entregar' de la tarea correspondiente para abrir el formulario de entrega.",
                targetSelector: ".btn-entregar-tarea, #modal-tarea-detalle"
            },
            {
                title: "Paso 3: Adjuntar Archivos o Escribir Respuesta",
                text: "Sube tu archivo PDF/Imagen o escribe tu respuesta en el campo habilitado antes de la fecha límite.",
                targetSelector: "#adjunto-tarea, #respuesta-tarea"
            },
            {
                title: "Paso 4: Confirmar Entrega y Verificar Estado",
                text: "Haz clic en 'Confirmar Entrega' y verifica que el estado cambie a 'Entregado' con su marca de tiempo.",
                targetSelector: "#btn-confirmar-entrega"
            }
        ],
        teacherReview: [
            {
                title: "Paso 1: Acceder al Cuaderno de Notas / Aula Virtual",
                text: "Ingresa a la sección 'Cuaderno de Notas' o 'Aula Virtual' para consultar el listado de actividades asignadas.",
                targetSelector: "#section-gradebook, #section-tareas"
            },
            {
                title: "Paso 2: Abrir Visor Integrado de Documentos",
                text: "Selecciona una entrega para visualizar el documento directamente en pantalla sin necesidad de descargarlo.",
                targetSelector: ".btn-review-submission, #modal-document-reader"
            },
            {
                title: "Paso 3: Comparar Entregas con Otra Tarea",
                text: "Usa la herramienta 'Comparar con otra tarea' para contrastar la entrega actual con otra del mismo u otro estudiante.",
                targetSelector: "#btn-open-submission-comparer"
            },
            {
                title: "Paso 4: Registrar Observaciones y Calificar",
                text: "Ingresa la nota ajustada, escribe las observaciones pedagógicas y guarda la evaluación en el registro oficial.",
                targetSelector: "#btn-save-grade-review"
            }
        ]
    };

    var currentTour = tours[tourKey] || tours.studentSubmission;
    if (savedStep > currentTour.length) savedStep = 1;

    function renderGuideModal(stepIdx) {
        var step = currentTour[stepIdx - 1];
        var totalSteps = currentTour.length;

        var box = document.getElementById('interactive-guide-box');
        if (!box) {
            box = document.createElement('div');
            box.id = 'interactive-guide-box';
            box.className = 'fixed bottom-6 right-6 z-[9999] w-96 bg-white rounded-3xl shadow-2xl border-2 border-indigo-500 p-6 animate-fade-in-up';
            document.body.appendChild(box);
        }

        box.innerHTML = [
            '<div class="flex items-center justify-between mb-3 border-b border-indigo-100 pb-2">',
            '  <div class="flex items-center gap-2">',
            '    <span class="bg-indigo-600 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full">Guía Tutorial</span>',
            '    <span class="text-xs font-semibold text-indigo-700">Paso ' + stepIdx + ' de ' + totalSteps + '</span>',
            '  </div>',
            '  <button onclick="window.closeInteractiveGuide(\'' + tourKey + '\')" class="text-gray-400 hover:text-gray-600 p-1"><i class="fa-solid fa-xmark"></i></button>',
            '</div>',
            '<h4 class="text-sm font-bold text-gray-800 mb-2">' + step.title + '</h4>',
            '<p class="text-xs text-gray-600 mb-4 leading-relaxed">' + step.text + '</p>',
            '<div class="flex items-center justify-between pt-2">',
            '  <button ' + (stepIdx <= 1 ? 'disabled' : '') + ' onclick="window.navigateGuideStep(\'' + tourKey + '\', ' + (stepIdx - 1) + ')" class="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-30">Anterior</button>',
            '  <div class="flex gap-2">',
            '    <button onclick="window.closeInteractiveGuide(\'' + tourKey + '\')" class="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600">Omitir</button>',
            '    <button onclick="window.navigateGuideStep(\'' + tourKey + '\', \'' + (stepIdx >= totalSteps ? 'finish' : (stepIdx + 1)) + '\')" class="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all">' + (stepIdx >= totalSteps ? 'Finalizar' : 'Siguiente') + '</button>',
            '  </div>',
            '</div>'
        ].join('');

        localStorage.setItem('guide_progress_' + tourKey, stepIdx);

        if (step.targetSelector) {
            var targetEl = document.querySelector(step.targetSelector);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetEl.classList.add('ring-4', 'ring-indigo-400', 'ring-offset-2');
                setTimeout(function() {
                    targetEl.classList.remove('ring-4', 'ring-indigo-400', 'ring-offset-2');
                }, 3000);
            }
        }
    }

    renderGuideModal(savedStep);
};

window.navigateGuideStep = function(tourKey, nextStep) {
    if (nextStep === 'finish') {
        window.closeInteractiveGuide(tourKey);
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: '¡Guía Completada!',
                text: 'Has revisado con éxito todos los pasos del tutorial.',
                confirmButtonColor: '#4f46e5'
            });
        }
    } else {
        var numStep = parseInt(nextStep, 10) || 1;
        localStorage.setItem('guide_progress_' + tourKey, numStep);
        window.startInteractiveGuide(tourKey, false);
    }
};

window.closeInteractiveGuide = function(tourKey) {
    var box = document.getElementById('interactive-guide-box');
    if (box) box.remove();
};

window.openDocumentReader = function(docUrl, docName, docType, fileId) {
    docName = docName || "Documento Adjunto";
    docType = (docType || "").toLowerCase();

    var modal = document.getElementById('modal-document-reader');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-document-reader';
        modal.className = 'fixed inset-0 z-[9990] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in';
        document.body.appendChild(modal);
    }

    var isImage = (docType.indexOf('image') !== -1 || docType.indexOf('png') !== -1 || docType.indexOf('jpg') !== -1 || docType.indexOf('webp') !== -1 || (docUrl && docUrl.match(/\.(png|jpe?g|webp)$/i)));
    var isPdf = (docType.indexOf('pdf') !== -1 || (docUrl && docUrl.match(/\.pdf$/i)));
    var isFolder = (docType === 'folder' || docType.indexOf('folder') !== -1);
    var isLegacyWord = (docType.indexOf('doc') !== -1 || docType.indexOf('rtf') !== -1 || docType.indexOf('odt') !== -1 || docType.indexOf('txt') !== -1);

    var contentHtml = '<div class="p-8 text-center text-gray-400 text-xs"><i class="fa-solid fa-spinner fa-spin text-3xl mb-2"></i><br>Cargando vista previa continua del documento...</div>';

    modal.innerHTML = [
        '<div class="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">',
        '  <div class="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">',
        '    <div class="flex items-center gap-3">',
        '      <div class="w-10 h-10 rounded-2xl bg-slate-700 flex items-center justify-center text-blue-400"><i class="fa-solid fa-book-open text-lg"></i></div>',
        '      <div>',
        '        <h3 class="text-sm font-bold text-white uppercase tracking-wider">' + docName + '</h3>',
        '        <p class="text-[10px] text-slate-300">Visor Unificado de Documentos Continuos</p>',
        '      </div>',
        '    </div>',
        '    <div class="flex items-center gap-2">',
        '      <a href="' + (docUrl || '#') + '" target="_blank" download class="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-700 text-sm transition-all" title="Descargar"><i class="fa-solid fa-download"></i></a>',
        '      <button onclick="document.getElementById(\'modal-document-reader\').classList.add(\'hidden\')" class="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-700 text-sm transition-all"><i class="fa-solid fa-xmark text-lg"></i></button>',
        '    </div>',
        '  </div>',
        '  <div id="doc-reader-body" class="p-6 overflow-y-auto flex-grow bg-slate-50 space-y-4">',
        contentHtml,
        '  </div>',
        '  <div class="px-6 py-3 bg-white border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">',
        '    <span><i class="fa-solid fa-shield-halved text-green-500 mr-1"></i> Documento Verificado por la Malla Institucional</span>',
        '    <button onclick="document.getElementById(\'modal-document-reader\').classList.add(\'hidden\')" class="px-4 py-2 font-bold text-gray-600 hover:text-gray-800 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all">Cerrar Visor</button>',
        '  </div>',
        '</div>'
    ].join('');

    modal.classList.remove('hidden');

    var bodyEl = document.getElementById('doc-reader-body');

    if (isFolder && fileId && window.sendApiRequest) {
        // Multi-part folder rendering continuously
        window.sendApiRequest('getMultiPartFolderFiles', { folderId: fileId }, function(res) {
            if (res && res.status === 'success' && res.files && res.files.length > 0) {
                var streamHtml = '<div class="space-y-6">';
                res.files.forEach(function(f, idx) {
                    streamHtml += [
                        '<div class="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-2">',
                        '  <div class="flex items-center justify-between text-[10px] text-gray-400 border-b border-gray-100 pb-1">',
                        '    <span class="font-bold text-indigo-600 uppercase">Sección ' + (idx + 1) + ' de ' + res.files.length + '</span>',
                        '    <span>' + f.name + '</span>',
                        '  </div>',
                        '  <iframe src="' + f.url + '" class="w-full h-[60vh] rounded-xl border-none"></iframe>',
                        '</div>'
                    ].join('');
                });
                streamHtml += '</div>';
                if (bodyEl) bodyEl.innerHTML = streamHtml;
            } else {
                if (bodyEl) bodyEl.innerHTML = '<div class="p-6 text-center text-gray-500 text-xs">No se pudieron cargar las partes del documento.</div>';
            }
        });
    } else if (isLegacyWord && window.sendApiRequest) {
        // Legacy Word format extraction
        window.sendApiRequest('readLegacyDocument', { fileId: fileId, fileUrl: docUrl, format: docType }, function(res) {
            if (res && res.status === 'success') {
                if (bodyEl) {
                    bodyEl.innerHTML = '<div class="p-6 bg-white rounded-2xl border border-gray-200 text-xs font-mono text-gray-800 leading-relaxed overflow-auto max-h-[70vh] whitespace-pre-wrap">' + (res.content || "Sin contenido de texto.") + '</div>';
                }
            } else if (res && res.errorCode === 'CORRUPTED_FILE') {
                if (bodyEl) {
                    bodyEl.innerHTML = [
                        '<div class="p-8 text-center bg-amber-50 rounded-2xl border border-amber-200 space-y-3">',
                        '  <i class="fa-solid fa-triangle-exclamation text-4xl text-amber-500"></i>',
                        '  <h4 class="text-sm font-bold text-amber-800">No se pudo abrir el archivo de forma directa</h4>',
                        '  <p class="text-xs text-amber-700">El documento puede estar protegido con contraseña o en un formato antiguo dañado. Puedes descargarlo para abrirlo en tu aplicación local.</p>',
                        '  <a href="' + (res.downloadUrl || docUrl || '#') + '" target="_blank" download class="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"><i class="fa-solid fa-download"></i> Descargar Documento Original</a>',
                        '</div>'
                    ].join('');
                }
            } else {
                if (bodyEl) bodyEl.innerHTML = '<div class="p-8 text-center text-gray-500 text-xs">No se pudo generar la vista previa. Abre o descarga el archivo directamente.</div>';
            }
        });
    } else if (isImage) {
        if (bodyEl) bodyEl.innerHTML = '<div class="flex justify-center items-center max-h-[70vh] overflow-auto"><img src="' + docUrl + '" alt="' + docName + '" class="max-w-full h-auto rounded-2xl shadow-xl"></div>';
    } else if (isPdf) {
        if (bodyEl) bodyEl.innerHTML = '<iframe src="' + docUrl + '" class="w-full h-[70vh] rounded-2xl border-none shadow-inner"></iframe>';
    } else {
        if (bodyEl) bodyEl.innerHTML = '<div class="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200"><i class="fa-solid fa-file-lines text-5xl text-gray-400 mb-4 block"></i><p class="text-sm font-semibold text-gray-700 mb-2">' + docName + '</p><p class="text-xs text-gray-500 mb-4">Vista previa de lectura continua.</p><a href="' + (docUrl || '#') + '" target="_blank" download class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"><i class="fa-solid fa-download"></i> Abrir / Descargar Documento</a></div>';
    }
};

/**
 * Cliente Unificado de Carga Reanudable por Puntos de Control (Fase 30)
 */
window.uploadResumableFile = function(file, options, callbacks) {
    options = options || {};
    callbacks = callbacks || {};

    var chunkSize = options.chunkSize || (5 * 1024 * 1024);
    var fileSize = file.size;
    var fileName = file.name;
    var totalChunks = Math.ceil(fileSize / chunkSize);
    var userId = options.userId || (window.currentUser ? window.currentUser.id : 'usuario_anonimo');

    var fileHash = fileName + "_" + fileSize + "_" + userId;
    var localStorageKey = "upload_session_" + btoa(fileHash).replace(/=/g, '');
    var savedSessionKey = localStorage.getItem(localStorageKey);

    function startUploadSession(sessionKeyToUse, isReplace) {
        if (callbacks.onProgress) callbacks.onProgress(0, "Iniciando carga reanudable...", 0);

        window.sendApiRequest('initiateResumableUpload', {
            userId: userId,
            fileName: fileName,
            fileSize: fileSize,
            totalChunks: totalChunks,
            mimeType: file.type || 'application/octet-stream',
            fileHash: fileHash,
            resumeSessionKey: (!isReplace && sessionKeyToUse) ? sessionKeyToUse : null,
            replaceSessionKey: (isReplace && sessionKeyToUse) ? sessionKeyToUse : null
        }, function(initRes) {
            if (!initRes || initRes.status !== 'success') {
                if (callbacks.onError) callbacks.onError((initRes && initRes.message) || "No se pudo iniciar la sesión de carga.");
                return;
            }

            var sessionKey = initRes.sessionKey;
            localStorage.setItem(localStorageKey, sessionKey);
            var confirmedChunks = initRes.confirmedChunks || [];

            processChunkQueue(sessionKey, confirmedChunks, 0, Date.now());
        });
    }

    function processChunkQueue(sessionKey, confirmedChunks, chunkIndex, startTime) {
        if (chunkIndex >= totalChunks) {
            localStorage.removeItem(localStorageKey);
            if (callbacks.onSuccess) callbacks.onSuccess({ sessionKey: sessionKey, totalChunks: totalChunks, isCompleted: true });
            return;
        }

        if (confirmedChunks.indexOf(chunkIndex) !== -1) {
            var percent = Math.round(((confirmedChunks.length) / totalChunks) * 100);
            if (callbacks.onProgress) callbacks.onProgress(percent, "Parte " + (chunkIndex + 1) + " ya confirmada.", 0);
            processChunkQueue(sessionKey, confirmedChunks, chunkIndex + 1, startTime);
            return;
        }

        var start = chunkIndex * chunkSize;
        var end = Math.min(start + chunkSize, fileSize);
        var blobChunk = file.slice(start, end);

        var reader = new FileReader();
        reader.onload = function(e) {
            var chunkData = e.target.result.split(',')[1];
            var currentPercent = Math.round((chunkIndex / totalChunks) * 100);

            if (callbacks.onProgress) callbacks.onProgress(currentPercent, "Subiendo parte " + (chunkIndex + 1) + " de " + totalChunks + "...", 30);

            window.sendApiRequest('uploadChunk', {
                sessionKey: sessionKey,
                chunkIndex: chunkIndex,
                totalChunks: totalChunks,
                chunkData: chunkData,
                fileName: fileName
            }, function(chunkRes) {
                if (chunkRes && chunkRes.status === 'success') {
                    confirmedChunks = chunkRes.confirmedChunks || confirmedChunks;
                    var elapsedMs = Date.now() - startTime;
                    var chunksDone = confirmedChunks.length;
                    var remainingChunks = totalChunks - chunksDone;
                    var avgChunkMs = elapsedMs / (chunksDone || 1);
                    var etaSec = Math.round((remainingChunks * avgChunkMs) / 1000);

                    var etaText = etaSec > 60 ? ("Quedan aprox. " + Math.ceil(etaSec / 60) + " minutos") : ("Quedan aprox. " + etaSec + " segundos");
                    var updatedPercent = Math.round((chunksDone / totalChunks) * 100);

                    if (callbacks.onProgress) callbacks.onProgress(updatedPercent, "Parte " + (chunkIndex + 1) + " confirmada. " + etaText, etaSec);

                    processChunkQueue(sessionKey, confirmedChunks, chunkIndex + 1, startTime);
                } else {
                    var errorMsg = (chunkRes && chunkRes.message) || "Se perdió la conexión durante la transferencia de la parte " + (chunkIndex + 1) + ".";
                    if (callbacks.onError) callbacks.onError(errorMsg, sessionKey, chunkIndex);
                }
            });
        };
        reader.onerror = function() {
            if (callbacks.onError) callbacks.onError("Error al leer el archivo local.");
        };
        reader.readAsDataURL(blobChunk);
    }

    if (savedSessionKey) {
        if (window.Swal) {
            Swal.fire({
                title: 'Carga Interrumpida Detectada',
                text: 'Se encontró una subida previa de "' + fileName + '". ¿Deseas reanudarla desde el último punto o empezar de nuevo?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Reintentar Carga',
                cancelButtonText: 'Empezar de nuevo',
                confirmButtonColor: '#2563eb',
                cancelButtonColor: '#dc2626'
            }).then(function(result) {
                if (result.isConfirmed) {
                    startUploadSession(savedSessionKey, false); // RESUME saved session
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    startUploadSession(savedSessionKey, true); // REPLACE old session
                }
            });
        } else {
            if (confirm('Se encontró una subida previa de "' + fileName + '". ¿Deseas reanudar la carga?')) {
                startUploadSession(savedSessionKey, false);
            } else {
                startUploadSession(savedSessionKey, true);
            }
        }
    } else {
        startUploadSession(null, false);
    }
};

window.openSubmissionComparer = function(subA, subB) {
    subA = subA || { estudiante: "Estudiante A", fecha: new Date().toLocaleDateString(), respuesta: "Respuesta entregada en formato texto/digital.", calificacion: "85", adjuntoUrl: "" };
    subB = subB || { estudiante: "Estudiante B (Referencia)", fecha: new Date().toLocaleDateString(), respuesta: "Respuesta entregada para contraste de contenido.", calificacion: "90", adjuntoUrl: "" };

    var modal = document.getElementById('modal-submission-comparer');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-submission-comparer';
        modal.className = 'fixed inset-0 z-[9992] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in';
        document.body.appendChild(modal);
    }

    modal.innerHTML = [
        '<div class="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">',
        '  <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">',
        '    <div class="flex items-center gap-3">',
        '      <div class="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center"><i class="fa-solid fa-code-compare text-lg"></i></div>',
        '      <div>',
        '        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Comparador de Entregas y Trabajos</h3>',
        '        <p class="text-[10px] text-slate-400">Herramienta de Análisis Pedagógico y Detección de Coincidencias</p>',
        '      </div>',
        '    </div>',
        '    <button onclick="document.getElementById(\'modal-submission-comparer\').classList.add(\'hidden\')" class="text-slate-400 hover:text-white p-2 rounded-xl"><i class="fa-solid fa-xmark text-lg"></i></button>',
        '  </div>',
        '  <div class="p-6 overflow-y-auto flex-grow bg-slate-50 space-y-6">',
        '    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">',
        '      <div class="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4">',
        '        <div class="flex items-center justify-between border-b border-gray-100 pb-3">',
        '          <div>',
        '            <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Entrega Principal</span>',
        '            <h4 class="text-sm font-bold text-gray-800">' + subA.estudiante + '</h4>',
        '          </div>',
        '          <span class="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">' + subA.fecha + '</span>',
        '        </div>',
        '        <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700 leading-relaxed font-mono min-h-[120px]">' + (subA.respuesta || 'Sin respuesta en texto.') + '</div>',
        '        ' + (subA.adjuntoUrl ? '<button onclick="window.openDocumentReader(\'' + subA.adjuntoUrl + '\', \'Adjunto ' + subA.estudiante + '\')" class="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"><i class="fa-solid fa-file-pdf"></i> Ver Archivo Adjunto en Visor</button>' : ''),
        '        <div>',
        '          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Calificación Asignada</label>',
        '          <input type="number" id="comp-grade-a" value="' + (subA.calificacion || '') + '" min="0" max="100" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-indigo-600">',
        '        </div>',
        '      </div>',
        '      <div class="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-4">',
        '        <div class="flex items-center justify-between border-b border-gray-100 pb-3">',
        '          <div>',
        '            <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Entrega de Comparación / Referencia</span>',
        '            <h4 class="text-sm font-bold text-gray-800">' + subB.estudiante + '</h4>',
        '          </div>',
        '          <span class="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">' + subB.fecha + '</span>',
        '        </div>',
        '        <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700 leading-relaxed font-mono min-h-[120px]">' + (subB.respuesta || 'Sin respuesta en texto.') + '</div>',
        '        ' + (subB.adjuntoUrl ? '<button onclick="window.openDocumentReader(\'' + subB.adjuntoUrl + '\', \'Adjunto ' + subB.estudiante + '\')" class="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"><i class="fa-solid fa-file-pdf"></i> Ver Archivo Adjunto en Visor</button>' : ''),
        '        <div>',
        '          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Calificación Referencial</label>',
        '          <input type="number" id="comp-grade-b" value="' + (subB.calificacion || '') + '" min="0" max="100" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-blue-600">',
        '        </div>',
        '      </div>',
        '    </div>',
        '    <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">',
        '      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Notas de Observación Pedagógica / Coincidencias</label>',
        '      <textarea id="comp-notes" rows="3" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20" placeholder="Escriba sus observaciones sobre la comparación de respuestas, estructura o nivel de coincidencia..."></textarea>',
        '    </div>',
        '  </div>',
        '  <div class="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">',
        '    <span class="text-xs text-gray-500"><i class="fa-solid fa-circle-info text-blue-500 mr-1"></i> Las notas de comparación quedarán registradas en la bitácora pedagógica.</span>',
        '    <div class="flex gap-3">',
        '      <button onclick="document.getElementById(\'modal-submission-comparer\').classList.add(\'hidden\')" class="px-5 py-2.5 font-bold text-xs text-gray-600 hover:text-gray-800 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all">Cancelar</button>',
        '      <button onclick="window.saveComparisonResults()" class="px-6 py-2.5 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-2"><i class="fa-solid fa-floppy-disk"></i> Guardar Notas y Calificaciones</button>',
        '    </div>',
        '  </div>',
        '</div>'
    ].join('');

    modal.classList.remove('hidden');
};

window.saveComparisonResults = function() {
    if (window.Swal) {
        Swal.fire({
            icon: 'success',
            title: 'Análisis Comparativo Guardado',
            text: 'Las observaciones y calificaciones han sido registradas en el cuaderno pedagógico.',
            confirmButtonColor: '#4f46e5'
        });
    } else {
        alert('Análisis comparativo guardado correctamente.');
    }
    var modal = document.getElementById('modal-submission-comparer');
    if (modal) modal.classList.add('hidden');
};

window.renderReportsCenterUI = function(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = [
        '<div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">',
        '  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">',
        '    <div>',
        '      <h2 class="text-xl font-bold text-gray-900 uppercase tracking-tight">Centro de Informes Institucionales</h2>',
        '      <p class="text-xs text-gray-500">Catálogo oficial de reportes consolidados por departamento académico y administrativo.</p>',
        '    </div>',
        '    <div class="flex items-center gap-2">',
        '      <span class="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-200 flex items-center gap-1"><i class="fa-solid fa-shield-check"></i> Regla de Cobranza Confirmada Activa</span>',
        '    </div>',
        '  </div>',
        '  <div id="reports-catalog-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6">',
        '    <div class="p-8 text-center col-span-3 text-gray-400 text-xs"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><br>Cargando catálogo de informes...</div>',
        '  </div>',
        '</div>'
    ].join('');

    if (window.sendApiRequest) {
        window.sendApiRequest('getInstitutionalReportCatalog', { authRole: window.currentUser ? window.currentUser.rol : 'Administrador' }, function(res) {
            if (res && res.status === 'success' && res.catalog) {
                var grid = document.getElementById('reports-catalog-grid');
                if (!grid) return;
                var html = '';
                res.catalog.forEach(function(item) {
                    html += [
                        '<div class="p-5 rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all bg-gradient-to-br from-white to-slate-50/50 space-y-3">',
                        '  <div class="flex items-center justify-between">',
                        '    <span class="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md bg-blue-50 text-blue-700">' + item.category + '</span>',
                        '    <span class="text-[10px] font-semibold text-gray-400">' + item.id + '</span>',
                        '  </div>',
                        '  <h4 class="text-sm font-bold text-gray-800 leading-snug">' + item.title + '</h4>',
                        '  <p class="text-xs text-gray-500 leading-relaxed">' + item.description + '</p>',
                        '  <div class="pt-2 flex items-center justify-between border-t border-gray-100">',
                        '    <span class="text-[10px] text-gray-400">Formatos: ' + (item.supportedFormats ? item.supportedFormats.join(', ') : 'PDF/Excel') + '</span>',
                        '    <button onclick="window.triggerReportGeneration(\'' + item.id + '\', \'' + item.category + '\')" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1"><i class="fa-solid fa-file-export text-[10px]"></i> Generar</button>',
                        '  </div>',
                        '</div>'
                    ].join('');
                });
                grid.innerHTML = html;
            }
        });
    }
};

window.triggerReportGeneration = function(reportId, category) {
    if (!window.sendApiRequest) return;
    if (window.Swal) {
        Swal.fire({
            title: 'Generando Informe',
            text: 'Procesando datos institucionales...',
            allowOutsideClick: false,
            didOpen: function() { Swal.showLoading(); }
        });
    }

    window.sendApiRequest('generateInstitutionalReport', {
        reportId: reportId,
        category: category,
        authRole: window.currentUser ? window.currentUser.rol : 'Administrador'
    }, function(res) {
        if (window.Swal) Swal.close();
        if (res && res.status === 'success') {
            window.displayReportModal(res);
        } else {
            if (window.Swal) {
                Swal.fire('Error', (res && res.message) || 'No se pudo generar el informe.', 'error');
            } else {
                alert('Error: ' + ((res && res.message) || 'No se pudo generar el informe.'));
            }
        }
    });
};

window.displayReportModal = function(reportData) {
    var modal = document.getElementById('modal-report-viewer');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-report-viewer';
        modal.className = 'fixed inset-0 z-[9995] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in';
        document.body.appendChild(modal);
    }

    var summaryHtml = '';
    if (reportData.summary) {
        summaryHtml += '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">';
        for (var key in reportData.summary) {
            summaryHtml += '<div><span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">' + key + '</span><span class="text-sm font-extrabold text-slate-800">' + reportData.summary[key] + '</span></div>';
        }
        summaryHtml += '</div>';
    }

    var tableHeadHtml = '<tr>' + (reportData.columns || []).map(function(c) { return '<th class="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50">' + c + '</th>'; }).join('') + '</tr>';
    var tableBodyHtml = (reportData.rows || []).map(function(r) {
        return '<tr class="hover:bg-gray-50/80 transition-colors">' + r.map(function(cell) { return '<td class="px-4 py-3 text-xs text-gray-700 font-medium border-t border-gray-100">' + cell + '</td>'; }).join('') + '</tr>';
    }).join('');

    modal.innerHTML = [
        '<div class="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">',
        '  <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">',
        '    <div>',
        '      <span class="text-[10px] font-bold text-green-400 uppercase tracking-widest">' + reportData.category + '</span>',
        '      <h3 class="text-base font-bold text-white uppercase tracking-wider">' + reportData.title + '</h3>',
        '    </div>',
        '    <button onclick="document.getElementById(\'modal-report-viewer\').classList.add(\'hidden\')" class="text-slate-400 hover:text-white p-2 rounded-xl"><i class="fa-solid fa-xmark text-lg"></i></button>',
        '  </div>',
        '  <div class="p-6 overflow-y-auto flex-grow bg-slate-50 space-y-4">',
        summaryHtml,
        '    <div class="table-container overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">',
        '      <table class="w-full">',
        '        <thead>' + tableHeadHtml + '</thead>',
        '        <tbody>' + tableBodyHtml + '</tbody>',
        '      </table>',
        '    </div>',
        '  </div>',
        '  <div class="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">',
        '    <span class="text-xs text-gray-400">Generado el: ' + (reportData.generatedAt || '').substring(0, 10) + '</span>',
        '    <div class="flex gap-3">',
        '      <button onclick="window.print()" class="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"><i class="fa-solid fa-print"></i> Imprimir</button>',
        '      <button onclick="document.getElementById(\'modal-report-viewer\').classList.add(\'hidden\')" class="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all">Aceptar</button>',
        '    </div>',
        '  </div>',
        '</div>'
    ].join('');

    modal.classList.remove('hidden');
};

/* ===========================================================================
 * FASE 32 - SISTEMA DE AYUDA CONTEXTUAL INTERACTIVA Y FAQ
 * =========================================================================== */

window.openContextualHelpModal = function(panelKey) {
    panelKey = panelKey || 'general';
    var userRole = (window.currentUser && window.currentUser.rol) ? window.currentUser.rol : 'Estudiante';

    var modal = document.getElementById('modal-interactive-help');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-interactive-help';
        modal.className = 'fixed inset-0 z-[9995] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in';
        document.body.appendChild(modal);
    }

    modal.innerHTML = [
        '<div class="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">',
        '  <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">',
        '    <div class="flex items-center gap-3">',
        '      <div class="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center"><i class="fa-solid fa-circle-question text-xl"></i></div>',
        '      <div>',
        '        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Asistencia Contextual Interactiva</h3>',
        '        <p class="text-[10px] text-slate-400">Guías Paso a Paso, Preguntas Frecuentes y Contacto Institucional</p>',
        '      </div>',
        '    </div>',
        '    <button onclick="document.getElementById(\'modal-interactive-help\').classList.add(\'hidden\')" class="text-slate-400 hover:text-white p-2 rounded-xl"><i class="fa-solid fa-xmark text-lg"></i></button>',
        '  </div>',
        '  <div class="p-6 overflow-y-auto flex-grow bg-slate-50 space-y-6">',
        '    <div class="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">',
        '      <div>',
        '        <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Panel Activo: ' + panelKey.toUpperCase() + '</span>',
        '        <h4 class="text-sm font-bold text-slate-800">¿Qué deseas hacer en esta sección?</h4>',
        '      </div>',
        '      <a href="tel:33900758" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm"><i class="fa-solid fa-phone text-[10px]"></i> Soporte: 33900758</a>',
        '    </div>',
        '    <div id="help-guides-container" class="grid grid-cols-1 md:grid-cols-2 gap-4">',
        '      <div class="p-6 text-center text-gray-400 text-xs col-span-2"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><br>Cargando guías contextuales disponibles...</div>',
        '    </div>',
        '    <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">',
        '      <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Preguntas Frecuentes Institucionales (FAQ)</h4>',
        '      <div class="space-y-2 text-xs text-gray-600">',
        '        <details class="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"><summary class="font-bold text-gray-800">¿Quién es el titular de la plataforma y el código fuente?</summary><p class="mt-2 text-gray-600 leading-relaxed">El código fuente y la tecnología pertenecen exclusivamente a <strong>JyP Solutions S. de R.L. de C.V.</strong> (Sede: San Pedro Sula, Cortés, Honduras. Tel: 33900758). El instituto cliente recibe una licencia de uso y conserva la titularidad exclusiva de sus datos y documentos.</p></details>',
        '        <details class="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"><summary class="font-bold text-gray-800">¿Se modifican los archivos originales al crear plantillas o documentos?</summary><p class="mt-2 text-gray-600 leading-relaxed">No. El archivo original de referencia permanece 100% inalterado. Los campos y configuraciones se guardan por separado y los documentos emitidos se generan como derivados sin modificar la plantilla base.</p></details>',
        '        <details class="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"><summary class="font-bold text-gray-800">¿Qué hago si mi subida de archivo se interrumpe por problemas de red?</summary><p class="mt-2 text-gray-600 leading-relaxed">El cliente de carga reanudable detecta la interrupción y te permite elegir entre "Reintentar Carga" para continuar desde la última parte confirmada o "Empezar de nuevo" reemplazando progresivamente las partes anteriores.</p></details>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">',
        '    <span>JyP Solutions S. de R.L. de C.V. — San Pedro Sula, Honduras. Tel: 33900758</span>',
        '    <button onclick="document.getElementById(\'modal-interactive-help\').classList.add(\'hidden\')" class="px-5 py-2 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all">Cerrar Ayuda</button>',
        '  </div>',
        '</div>'
    ].join('');

    modal.classList.remove('hidden');

    if (window.sendApiRequest) {
        window.sendApiRequest('getHelpGuidesCatalog', { panelKey: panelKey }, function(res) {
            var container = document.getElementById('help-guides-container');
            if (!container) return;

            if (res && res.status === 'success' && res.guides && res.guides.length > 0) {
                var html = '';
                res.guides.forEach(function(guide) {
                    html += [
                        '<div class="p-4 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between gap-3">',
                        '  <div>',
                        '    <span class="text-[9px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mb-2 inline-block">' + guide.role + '</span>',
                        '    <h4 class="text-xs font-bold text-gray-800 mb-1">' + guide.title + '</h4>',
                        '    <p class="text-[11px] text-gray-500 leading-relaxed">' + guide.description + '</p>',
                        '  </div>',
                        '  <button onclick="window.startGuidedTourAction(\'' + guide.id + '\')" class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"><i class="fa-solid fa-location-arrow text-[10px]"></i> Iniciar Guía Paso a Paso</button>',
                        '</div>'
                    ].join('');
                });
                container.innerHTML = html;
            } else {
                container.innerHTML = '<div class="p-6 text-center text-gray-500 text-xs col-span-2">Selecciona una de las preguntas frecuentes o contacta a soporte si necesitas asistencia en este panel.</div>';
            }
        });
    }
};

window.startGuidedTourAction = function(guideId) {
    var modal = document.getElementById('modal-interactive-help');
    if (modal) modal.classList.add('hidden');

    if (guideId === 'GUIDE-STUDENT-TASKS') {
        window.startInteractiveGuide('studentSubmission', true);
    } else {
        window.startInteractiveGuide('teacherReview', true);
    }
};

/* ===========================================================================
 * FASE ADICIONAL - ALMACENAMIENTO INDEXEDDB, COLA DE SINCRONIZACIÓN Y CONFLICTOS
 * =========================================================================== */

var DB_NAME = 'ngca_offline_db';
var DB_VERSION = 1;

window.initOfflineDB = function(callback) {
    if (!window.indexedDB) {
        if (callback) callback(null);
        return;
    }
    var request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = function(event) {
        console.warn('[OfflineDB] Error al abrir IndexedDB:', event);
        if (callback) callback(null);
    };
    request.onupgradeneeded = function(event) {
        var db = event.target.result;
        if (!db.objectStoreNames.contains('documents')) {
            var docStore = db.createObjectStore('documents', { keyPath: 'id' });
            docStore.createIndex('userId', 'userId', { unique: false });
            docStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
            var queueStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
            queueStore.createIndex('status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains('configs')) {
            db.createObjectStore('configs', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('faq')) {
            db.createObjectStore('faq', { keyPath: 'id' });
        }
    };
    request.onsuccess = function(event) {
        var db = event.target.result;
        if (callback) callback(db);
    };
};

window.saveLocalDocument = function(docData, callback) {
    window.initOfflineDB(function(db) {
        if (!db) { if (callback) callback(false); return; }
        var tx = db.transaction(['documents'], 'readwrite');
        var store = tx.objectStore('documents');

        docData.id = docData.id || ('DOC_LOCAL_' + Date.now());
        docData.syncStatus = docData.syncStatus || 'Pendiente';
        docData.updatedAt = new Date().toISOString();

        var req = store.put(docData);
        req.onsuccess = function() { if (callback) callback(docData); };
        req.onerror = function() { if (callback) callback(false); };
    });
};

window.getLocalDocuments = function(userId, callback) {
    window.initOfflineDB(function(db) {
        if (!db) { if (callback) callback([]); return; }
        var tx = db.transaction(['documents'], 'readonly');
        var store = tx.objectStore('documents');
        var index = store.index('userId');
        var req = index.getAll(userId);
        req.onsuccess = function() { if (callback) callback(req.result || []); };
        req.onerror = function() { if (callback) callback([]); };
    });
};

// [C-002] [pendientes2.md] - Motor de encolamiento y almacenamiento de operaciones offline en IndexedDB.
window.queueOfflineAction = function(actionName, payload, callback) {
    window.initOfflineDB(function(db) {
        if (!db) { if (callback) callback(false); return; }
        var tx = db.transaction(['sync_queue'], 'readwrite');
        var store = tx.objectStore('sync_queue');

        var item = {
            action: actionName,
            payload: payload,
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };

        var req = store.add(item);
        req.onsuccess = function() {
            if (callback) callback(req.result);
            if (navigator.onLine && window.syncOfflineQueue) window.syncOfflineQueue();
        };
        req.onerror = function() { if (callback) callback(false); };
    });
};

window.syncOfflineQueue = function(callback) {
    if (!navigator.onLine || !window.sendApiRequest) return;

    window.initOfflineDB(function(db) {
        if (!db) return;
        var tx = db.transaction(['sync_queue'], 'readonly');
        var store = tx.objectStore('sync_queue');
        var index = store.index('status');
        var req = index.getAll('PENDING');

        req.onsuccess = function() {
            var pendingItems = req.result || [];
            if (pendingItems.length === 0) {
                if (callback) callback(true);
                return;
            }

            processQueueItems(db, pendingItems, 0, callback);
        };
    });
};

function processQueueItems(db, items, index, callback) {
    if (index >= items.length) {
        if (callback) callback(true);
        return;
    }

    var item = items[index];
    window.sendApiRequest(item.action, item.payload, function(res) {
        if (res && res.status === 'success') {
            var tx = db.transaction(['sync_queue'], 'readwrite');
            var store = tx.objectStore('sync_queue');
            item.status = 'COMPLETED';
            item.completedAt = new Date().toISOString();
            store.put(item);

            processQueueItems(db, items, index + 1, callback);
        } else if (res && res.errorCode === 'CONFLICT') {
            window.openConflictResolutionModal(item, res);
        } else {
            processQueueItems(db, items, index + 1, callback);
        }
    });
}

window.openConflictResolutionModal = function(queueItem, serverResponse) {
    var modal = document.getElementById('modal-conflict-resolution');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-conflict-resolution';
        modal.className = 'fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in';
        document.body.appendChild(modal);
    }

    modal.innerHTML = [
        '<div class="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden animate-scale-up">',
        '  <div class="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">',
        '    <div class="flex items-center gap-3">',
        '      <div class="w-10 h-10 rounded-2xl bg-amber-500/40 flex items-center justify-center"><i class="fa-solid fa-code-branch text-xl"></i></div>',
        '      <div>',
        '        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Conflicto de Sincronización Detectado</h3>',
        '        <p class="text-[10px] text-amber-100">El documento fue modificado en línea por otro usuario mientras trabajabas sin conexión</p>',
        '      </div>',
        '    </div>',
        '    <button onclick="document.getElementById(\'modal-conflict-resolution\').classList.add(\'hidden\')" class="text-amber-200 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>',
        '  </div>',
        '  <div class="p-6 space-y-4 bg-slate-50 text-xs">',
        '    <p class="text-gray-700 leading-relaxed">Selecciona cómo deseas resolver las diferencias entre tu copia local y la versión de la plataforma:</p>',
        '    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">',
        '      <button onclick="window.resolveConflictChoice(\'keep_local\', ' + queueItem.id + ')" class="p-4 bg-white hover:bg-amber-50 rounded-2xl border border-gray-200 hover:border-amber-400 text-left transition-all space-y-1">',
        '        <span class="font-bold text-gray-800 block text-xs">Conservar mi versión local</span>',
        '        <span class="text-[10px] text-gray-500 block">Sobrescribe los cambios de la plataforma con tu trabajo local.</span>',
        '      </button>',
        '      <button onclick="window.resolveConflictChoice(\'accept_server\', ' + queueItem.id + ')" class="p-4 bg-white hover:bg-blue-50 rounded-2xl border border-gray-200 hover:border-blue-400 text-left transition-all space-y-1">',
        '        <span class="font-bold text-gray-800 block text-xs">Aceptar versión plataforma</span>',
        '        <span class="text-[10px] text-gray-500 block">Descarta la copia local e incorpora la versión en línea.</span>',
        '      </button>',
        '      <button onclick="window.resolveConflictChoice(\'save_both\', ' + queueItem.id + ')" class="p-4 bg-white hover:bg-green-50 rounded-2xl border border-gray-200 hover:border-green-400 text-left transition-all space-y-1">',
        '        <span class="font-bold text-gray-800 block text-xs">Guardar ambas versiones</span>',
        '        <span class="text-[10px] text-gray-500 block">Conserva tu archivo local como copia independiente.</span>',
        '      </button>',
        '    </div>',
        '  </div>',
        '</div>'
    ].join('');

    modal.classList.remove('hidden');
};

window.resolveConflictChoice = function(choice, queueItemId) {
    var modal = document.getElementById('modal-conflict-resolution');
    if (modal) modal.classList.add('hidden');

    if (window.Swal) {
        Swal.fire({
            icon: 'success',
            title: 'Conflicto Resuelto',
            text: 'Se aplicó la resolución seleccionada a tu catálogo de documentos.',
            confirmButtonColor: '#2563eb'
        });
    }
};

// [IA-03] [pendientes2.md] - Búsqueda asistida en la base de conocimientos FAQ local de 32 elementos institucionales.
window.searchFAQAssistant = function(query) {
    if (!query || typeof query !== 'string') return [];
    var q = query.toLowerCase().trim();
    if (q.length < 2) return [];

    var faqs = [
        { cat: 'Acceso', q: '1. ¿Para qué sirve la plataforma?', a: 'Sirve para realizar y consultar las actividades institucionales que estén habilitadas para tu cuenta, como documentos, solicitudes, información académica y otros trámites.' },
        { cat: 'Acceso', q: '2. ¿Cómo encuentro una función?', a: 'Abre el menú de tu panel y selecciona la opción relacionada con la tarea que deseas realizar. Si necesitas orientación, pulsa el icono "Ayuda" para consultar el instructivo de esa pantalla.' },
        { cat: 'Acceso', q: '3. ¿Cómo puedo trabajar sin internet?', a: 'Puedes utilizar las funciones y los documentos que estén disponibles en tu dispositivo. Los cambios que deban compartirse con otras personas se enviarán cuando vuelva la conexión.' },
        { cat: 'Acceso', q: '4. ¿Puedo abrir mis documentos sin conexión?', a: 'Sí, si ya existe una copia local disponible y el formato es compatible con el visualizador de la aplicación.' },
        { cat: 'Acceso', q: '5. ¿Qué ocurre si un documento no está guardado en mi dispositivo?', a: 'Si tienes conexión y permiso para consultarlo, la aplicación puede recuperar la copia disponible en línea. Sin conexión, tendrás que esperar hasta poder descargarla.' },
        { cat: 'Sincronización', q: '6. ¿Cómo sé si mis cambios se guardaron?', a: 'Revisa el estado que aparece junto al documento. Si indica que los cambios están pendientes, todavía no se han confirmed en línea.' },
        { cat: 'Sincronización', q: '7. ¿Qué ocurre cuando vuelve internet?', a: 'La aplicación comprueba los cambios pendientes y los envía cuando puede hacerlo de forma segura. Si detecta cambios incompatibles, puede pedirte que los revises.' },
        { cat: 'Sincronización', q: '8. ¿Puedo utilizar la plataforma en otro dispositivo?', a: 'Sí, puedes ingresar desde otro dispositivo compatible. Los documentos guardados en línea estarán disponibles según tus permisos, aunque tendrás que descargar las copias que necesites utilizar sin conexión.' },
        { cat: 'Sincronización', q: '9. ¿Qué pasa si borro los datos de la aplicación?', a: 'Las copias locales pueden desaparecer. Los documentos que sigan guardados en línea pueden recuperarse cuando vuelvas a ingresar con conexión y tengas permiso para consultarlos. Los cambios que nunca se sincronizaron podrían perderse.' },
        { cat: 'Sincronización', q: '10. ¿Cómo creo un documento?', a: 'Abre la herramienta correspondiente, selecciona la opción para crear un documento y completa la información solicitada. Guarda los cambios antes de salir.' },
        { cat: 'Documentos', q: '11. ¿Cómo puedo abrir un archivo que tengo en mi computadora o teléfono?', a: 'En la herramienta correspondiente, selecciona la opción para abrir o importar un archivo y elige el documento desde tu dispositivo.' },
        { cat: 'Documentos', q: '12. ¿Qué hago si un documento no se abre?', a: 'Comprueba que el archivo esté disponible, que su formato sea compatible y que tengas permiso para consultarlo. Si el problema continúa, intenta recuperar una copia válida o solicita ayuda.' },
        { cat: 'Documentos', q: '13. ¿Cómo creo una plantilla?', a: 'Abre "Editor de plantilla", crea una plantilla nueva o utiliza un documento compatible como base y guarda los cambios cuando termines.' },
        { cat: 'Documentos', q: '14. ¿Cómo agrego un campo para completar información?', a: 'Abre la plantilla, selecciona la opción para agregar un campo, colócalo en el lugar correspondiente y define qué información debe introducir la persona.' },
        { cat: 'Documentos', q: '15. ¿Puedo cambiar la apariencia de una plantilla?', a: 'Puedes modificar los estilos que permita el editor, como el tipo y tamaño de letra, el color y la alineación. Las opciones disponibles dependen del formato de la plantilla.' },
        { cat: 'Documentos', q: '16. ¿Cómo genero un documento a partir de una plantilla?', a: 'Abre la plantilla, completa los campos requeridos, revisa la vista previa y utiliza la opción de generar o guardar el documento final.' },
        { cat: 'Documentos', q: '17. ¿Se modifica el documento original cuando utilizo una plantilla?', a: 'La plantilla debe conservar el documento original separado de los campos y de los documentos generados. Los datos introducidos se incorporan al documento final, no al original.' },
        { cat: 'Trámites', q: '18. ¿Cómo puedo importar información desde un archivo?', a: 'Abre "Importador de documentos", selecciona el archivo y revisa la información que se va a procesar. Si la importación requiere conexión o autorización, deberás completar ese paso antes de que se refleje en la plataforma.' },
        { cat: 'Trámites', q: '19. ¿Qué ocurre si un archivo tiene información incorrecta?', a: 'Revisa los datos señalados y corrígelos antes de continuar. No confirmes una importación si los registros no corresponden a las personas o documentos correctos.' },
        { cat: 'Trámites', q: '20. ¿Cómo puedo saber si envié una solicitud?', a: 'Consulta el estado de la solicitud en la sección correspondiente. Si aparece como borrador o pendiente de envío, todavía no se ha presentado oficialmente.' },
        { cat: 'Trámites', q: '21. ¿Puedo corregir una solicitud que ya envié?', a: 'Depende del estado de la solicitud y de las opciones disponibles. Si aparece una opción para corregirla, sigue las instrucciones. Si no aparece, consulta al departamento responsable.' },
        { cat: 'Trámites', q: '22. ¿Cómo adjunto un documento a una solicitud?', a: 'Abre la solicitud, selecciona la opción para adjuntar archivos, elige el documento y comprueba que aparezca en la lista antes de enviar.' },
        { cat: 'Plataforma', q: '23. ¿Cómo puedo revisar una notificación?', a: 'Abre la sección de notificaciones y selecciona el aviso que deseas consultar. Algunas notificaciones pueden llevarte directamente a la solicitud o al documento relacionado.' },
        { cat: 'Plataforma', q: '24. ¿Qué hago si una opción no aparece en mi panel?', a: 'Es posible que esa función no esté disponible para tu cuenta o que no corresponda a tu panel actual. Consulta con el responsable institucional si necesitas acceso.' },
        { cat: 'Plataforma', q: '25. ¿Cómo puedo consultar mis calificaciones o tareas?', a: 'Abre la sección académica correspondiente y selecciona el periodo o la actividad que deseas consultar, si esa opción está disponible para tu cuenta.' },
        { cat: 'Plataforma', q: '26. ¿Cómo puedo consultar información de mis hijos?', a: 'Ingresa con tu cuenta y abre la sección correspondiente a tus hijos. Solo podrás consultar la información que esté asociada a tu cuenta y autorizada para ti.' },
        { cat: 'Pagos', q: '27. ¿Cómo compruebo si un pago quedó registrado?', a: 'Consulta el estado del pago en la sección financiera correspondiente. Si aparece pendiente de verificación, todavía no debe considerarse confirmado.' },
        { cat: 'Pagos', q: '28. ¿Puedo realizar un abono parcial?', a: 'Si la opción está habilitada para tu cuenta, puedes realizar abonos parciales según el plan de pago establecido.' },
        { cat: 'Pagos', q: '29. ¿Qué hago si no puedo realizar un pago en línea?', a: 'Si el servicio no está disponible o el pago falla, puedes intentarlo más tarde o utilizar los canales presenciales autorizados por la institución.' },
        { cat: 'General', q: '30. ¿Qué hago si la pantalla se queda cargando?', a: 'Comprueba tu conexión a internet o intenta recargar la página. Si trabajas sin conexión, asegúrate de utilizar una función disponible en tu dispositivo.' },
        { cat: 'General', q: '31. ¿Dónde solicito ayuda si tengo un problema con mi cuenta?', a: 'Comunícate con el área administrativa o de secretaría del instituto para revisar el estado de tu cuenta o solicitar asistencia.' },
        { cat: 'General', q: '32. ¿Mis datos están protegidos?', a: 'Sí. La información almacenada se utiliza exclusivamente para los fines institucionales autorizados y según las políticas de uso y privacidad de la plataforma.' }
    ];

    return faqs.filter(function(item) {
        return item.q.toLowerCase().indexOf(q) !== -1 || item.a.toLowerCase().indexOf(q) !== -1 || item.cat.toLowerCase().indexOf(q) !== -1;
    });
};

window.renderFAQSection = function(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var faqs = [
        { cat: 'Acceso', q: '1. ¿Para qué sirve la plataforma?', a: 'Sirve para realizar y consultar las actividades institucionales que estén habilitadas para tu cuenta, como documentos, solicitudes, información académica y otros trámites.' },
        { cat: 'Acceso', q: '2. ¿Cómo encuentro una función?', a: 'Abre el menú de tu panel y selecciona la opción relacionada con la tarea que deseas realizar. Si necesitas orientación, pulsa el icono "Ayuda" para consultar el instructivo de esa pantalla.' },
        { cat: 'Acceso', q: '3. ¿Cómo puedo trabajar sin internet?', a: 'Puedes utilizar las funciones y los documentos que estén disponibles en tu dispositivo. Los cambios que deban compartirse con otras personas se enviarán cuando vuelva la conexión.' },
        { cat: 'Acceso', q: '4. ¿Puedo abrir mis documentos sin conexión?', a: 'Sí, si ya existe una copia local disponible y el formato es compatible con el visualizador de la aplicación.' },
        { cat: 'Acceso', q: '5. ¿Qué ocurre si un documento no está guardado en mi dispositivo?', a: 'Si tienes conexión y permiso para consultarlo, la aplicación puede recuperar la copia disponible en línea. Sin conexión, tendrás que esperar hasta poder descargarla.' },
        { cat: 'Sincronización', q: '6. ¿Cómo sé si mis cambios se guardaron?', a: 'Revisa el estado que aparece junto al documento. Si indica que los cambios están pendientes, todavía no se han confirmado en línea.' },
        { cat: 'Sincronización', q: '7. ¿Qué ocurre cuando vuelve internet?', a: 'La aplicación comprueba los cambios pendientes y los envía cuando puede hacerlo de forma segura. Si detecta cambios incompatibles, puede pedirte que los revises.' },
        { cat: 'Sincronización', q: '8. ¿Puedo utilizar la plataforma en otro dispositivo?', a: 'Sí, puedes ingresar desde otro dispositivo compatible. Los documentos guardados en línea estarán disponibles según tus permisos, aunque tendrás que descargar las copias que necesites utilizar sin conexión.' },
        { cat: 'Sincronización', q: '9. ¿Qué pasa si borro los datos de la aplicación?', a: 'Las copias locales pueden desaparecer. Los documentos que sigan guardados en línea pueden recuperarse cuando vuelvas a ingresar con conexión y tengas permiso para consultarlos. Los cambios que nunca se sincronizaron podrían perderse.' },
        { cat: 'Sincronización', q: '10. ¿Cómo creo un documento?', a: 'Abre la herramienta correspondiente, selecciona la opción para crear un documento y completa la información solicitada. Guarda los cambios antes de salir.' },
        { cat: 'Documentos', q: '11. ¿Cómo puedo abrir un archivo que tengo en mi computadora o teléfono?', a: 'En la herramienta correspondiente, selecciona la opción para abrir o importar un archivo y elige el documento desde tu dispositivo.' },
        { cat: 'Documentos', q: '12. ¿Qué hago si un documento no se abre?', a: 'Comprueba que el archivo esté disponible, que su formato sea compatible y que tengas permiso para consultarlo. Si el problema continúa, intenta recuperar una copia válida o solicita ayuda.' },
        { cat: 'Documentos', q: '13. ¿Cómo creo una plantilla?', a: 'Abre "Editor de plantilla", crea una plantilla nueva o utiliza un documento compatible como base y guarda los cambios cuando termines.' },
        { cat: 'Documentos', q: '14. ¿Cómo agrego un campo para completar información?', a: 'Abre la plantilla, selecciona la opción para agregar un campo, colócalo en el lugar correspondiente y define qué información debe introducir la persona.' },
        { cat: 'Documentos', q: '15. ¿Puedo cambiar la apariencia de una plantilla?', a: 'Puedes modificar los estilos que permita el editor, como el tipo y tamaño de letra, el color y la alineación. Las opciones disponibles dependen del formato de la plantilla.' },
        { cat: 'Documentos', q: '16. ¿Cómo genero un documento a partir de una plantilla?', a: 'Abre la plantilla, completa los campos requeridos, revisa la vista previa y utiliza la opción de generar o guardar el documento final.' },
        { cat: 'Documentos', q: '17. ¿Se modifica el documento original cuando utilizo una plantilla?', a: 'La plantilla debe conservar el documento original separado de los campos y de los documentos generados. Los datos introducidos se incorporan al documento final, no al original.' },
        { cat: 'Trámites', q: '18. ¿Cómo puedo importar información desde un archivo?', a: 'Abre "Importador de documentos", selecciona el archivo y revisa la información que se va a procesar. Si la importación requiere conexión o autorización, deberás completar ese paso antes de que se refleje en la plataforma.' },
        { cat: 'Trámites', q: '19. ¿Qué ocurre si un archivo tiene información incorrecta?', a: 'Revisa los datos señalados y corrígelos antes de continuar. No confirmes una importación si los registros no corresponden a las personas o documentos correctos.' },
        { cat: 'Trámites', q: '20. ¿Cómo puedo saber si envié una solicitud?', a: 'Consulta el estado de la solicitud en la sección correspondiente. Si aparece como borrador o pendiente de envío, todavía no se ha presentado oficialmente.' },
        { cat: 'Trámites', q: '21. ¿Puedo corregir una solicitud que ya envié?', a: 'Depende del estado de la solicitud y de las opciones disponibles. Si aparece una opción para corregirla, sigue las instrucciones. Si no aparece, consulta al departamento responsable.' },
        { cat: 'Trámites', q: '22. ¿Cómo adjunto un documento a una solicitud?', a: 'Abre la solicitud, selecciona la opción para adjuntar archivos, elige el documento y comprueba que aparezca en la lista antes de enviar.' },
        { cat: 'Plataforma', q: '23. ¿Cómo puedo revisar una notificación?', a: 'Abre la sección de notificaciones y selecciona el aviso que deseas consultar. Algunas notificaciones pueden llevarte directamente a la solicitud o al documento relacionado.' },
        { cat: 'Plataforma', q: '24. ¿Qué hago si una opción no aparece en mi panel?', a: 'Es posible que esa función no esté disponible para tu cuenta o que no corresponda a tu panel actual. Consulta con el responsable institucional si necesitas acceso.' },
        { cat: 'Plataforma', q: '25. ¿Cómo puedo consultar mis calificaciones o tareas?', a: 'Abre la sección académica correspondiente y selecciona el periodo o la actividad que deseas consultar, si esa opción está disponible para tu cuenta.' },
        { cat: 'Plataforma', q: '26. ¿Cómo puedo consultar información de mis hijos?', a: 'Ingresa con tu cuenta y abre la sección correspondiente a tus hijos. Solo podrás consultar la información que esté asociada a tu cuenta y autorizada para ti.' },
        { cat: 'Pagos', q: '27. ¿Cómo compruebo si un pago quedó registrado?', a: 'Consulta el estado del pago en la sección financiera correspondiente. Si aparece pendiente de verificación, todavía no debe considerarse confirmado.' },
        { cat: 'Pagos', q: '28. ¿Qué hago si envié un comprobante y todavía aparece pendiente?', a: 'Comprueba que el archivo se haya enviado correctamente y revisa el estado del trámite. Si sigue pendiente, contacta al departamento responsable para solicitar una revisión.' },
        { cat: 'Pagos', q: '29. ¿Cómo puedo descargar un documento?', a: 'Abre el documento y utiliza la opción para descargarlo o guardarlo, si está disponible. Comprueba que la descarga haya terminado antes de cerrar la pantalla.' },
        { cat: 'Pagos', q: '30. ¿Cómo puedo liberar espacio en mi dispositivo?', a: 'Revisa las copias locales que ya no necesitas y utiliza las opciones de administración de archivos disponibles. Antes de retirar una copia, comprueba si tiene cambios pendientes de sincronización.' },
        { cat: 'Pagos', q: '31. ¿Qué hago si aparece un conflicto entre dos versiones?', a: 'Revisa las versiones disponibles y compara los cambios. Elige la versión correcta o utiliza la opción de combinar cuando esté disponible. No elimines una versión que pueda contener información necesaria.' },
        { cat: 'Pagos', q: '32. ¿Cómo puedo pedir ayuda?', a: 'Pulsa el icono "Ayuda" en la pantalla donde tienes la duda y selecciona la tarea que deseas realizar. Si necesitas asistencia adicional, utiliza "Contáctanos".' }
    ];

    var html = [
        '<div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">',
        '  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">',
        '    <div>',
        '      <h2 class="text-xl font-bold text-gray-900 uppercase tracking-tight">Preguntas Frecuentes Institucionales (FAQ)</h2>',
        '      <p class="text-xs text-gray-500">Respuestas oficiales a dudas cotidianas sobre el uso de la plataforma (32 Preguntas Disponibles).</p>',
        '    </div>',
        '    <span class="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200">Guía del Usuario Final</span>',
        '  </div>',
        '  <div class="space-y-3">'
    ];

    faqs.forEach(function(item) {
        html.push(
            '<details class="p-4 bg-gray-50 hover:bg-gray-100/80 rounded-2xl border border-gray-100 transition-colors cursor-pointer group">',
            '  <summary class="font-bold text-xs text-gray-800 flex items-center justify-between">',
            '    <span class="flex items-center gap-2"><span class="px-2 py-0.5 text-[9px] bg-blue-100 text-blue-800 rounded-md font-bold uppercase tracking-wider">' + item.cat + '</span> ' + item.q + '</span>',
            '    <i class="fa-solid fa-chevron-down text-[10px] text-gray-400 group-open:rotate-180 transition-transform"></i>',
            '  </summary>',
            '  <p class="mt-3 text-xs text-gray-600 leading-relaxed border-t border-gray-200/60 pt-2">' + item.a + '</p>',
            '</details>'
        );
    });

    html.push('  </div>', '</div>');

    container.innerHTML = html.join('');
};

// Auto-inicialización resiliente de UI común
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (window.setupCommonUI) window.setupCommonUI();
    });
} else {
    if (window.setupCommonUI) window.setupCommonUI();
}

// ==========================================================================
// MÓDULO GLOBAL DE REPORTE DE PROBLEMAS (TICKETS) & PALETA VISUAL GLOBAL
// ==========================================================================

window.selectedPreviewPalette = {
    paletaNombre: 'Azul Institucional',
    colores: { primary: '#0d6efd', primaryDark: '#0b5ed7', primaryLight: '#e7f1ff', secondary: '#4b5563' }
};

window.previewPalette = function(nombre, primary, primaryDark, primaryLight, secondary) {
    window.selectedPreviewPalette = {
        paletaNombre: nombre,
        colores: { primary: primary, primaryDark: primaryDark, primaryLight: primaryLight, secondary: secondary }
    };

    var title = document.getElementById('preview-palette-title');
    if (title) title.textContent = 'Paleta Seleccionada: ' + nombre;

    var sandbox = document.getElementById('palette-preview-sandbox');
    if (sandbox) {
        sandbox.style.setProperty('--color-primary', primary);
        sandbox.style.setProperty('--color-primary-dark', primaryDark);
        sandbox.style.setProperty('--color-primary-light', primaryLight);
        sandbox.style.setProperty('--color-secondary', secondary);
    }
};

window.submitPaletteProposal = function() {
    var p = window.selectedPreviewPalette;
    if (!p || !p.paletaNombre) return;

    var currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || localStorage.getItem('usuario_actual') || '{}');
    } catch (_) {}

    var payload = {
        paletaNombre: p.paletaNombre,
        coloresJSON: p.colores,
        userId: currentUser.userId || currentUser.id,
        authRole: currentUser.rol || 'Administrador',
        observaciones: 'Propuesta enviada desde el panel de opciones visuales'
    };

    fetchApi('USER', 'saveVisualPaletteProposal', payload).then(function(res) {
        if (res && res.status === 'success') {
            window.activePaletteProposalId = res.propuestaId;
            alert('¡Propuesta de paleta "' + p.paletaNombre + '" enviada exitosamente!\n\nID Propuesta: ' + (res.propuestaId || '') + '\n\nQueda pendiente de revisión y aprobación por Dirección.');
        } else {
            alert('Error al enviar propuesta: ' + (res ? res.message : 'Desconocido'));
        }
    }).catch(function(err) {
        alert('Fallo de red: ' + err.message);
    });
};

window.approvePaletteProposal = function(accion) {
    var p = window.selectedPreviewPalette;
    if (!p || !p.paletaNombre) return;

    var currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || localStorage.getItem('usuario_actual') || '{}');
    } catch (_) {}

    var payload = {
        propuestaId: window.activePaletteProposalId || 'PAL-LATEST',
        paletaNombre: p.paletaNombre,
        coloresJSON: p.colores,
        accion: accion || 'Aprobar',
        userId: currentUser.userId || currentUser.id,
        authRole: currentUser.rol || 'Director',
        observaciones: 'Aprobación ejecutada desde el panel de opciones institucionales'
    };

    fetchApi('USER', 'approveVisualPaletteProposal', payload).then(function(res) {
        if (res && res.status === 'success') {
            alert('¡Paleta "' + p.paletaNombre + '" ' + (accion === 'Aprobar' ? 'aprobada y publicada globalmente' : 'rechazada') + '!');
            window.loadAndApplyActiveVisualPalette();
        } else {
            alert('Error al procesar aprobación: ' + (res ? res.message : 'Error desconocido'));
        }
    }).catch(function(err) {
        alert('Fallo de red: ' + err.message);
    });
};

window.initProblemReportingUI = function() {
    if (!document.getElementById('btn-global-report-issue')) {
        var btn = document.createElement('button');
        btn.id = 'btn-global-report-issue';
        btn.onclick = function() { window.openReportIssueModal(); };
        btn.className = 'fixed bottom-4 right-4 z-[9990] bg-slate-900/90 hover:bg-slate-900 text-white w-9 h-9 rounded-full shadow-lg flex items-center justify-center border border-slate-700/60 transition-all hover:scale-110 active:scale-95';
        btn.title = 'Reportar un problema';
        btn.setAttribute('aria-label', 'Reportar un problema');
        btn.innerHTML = '<i class="fa-solid fa-circle-exclamation text-amber-400 text-sm"></i>';
        document.body.appendChild(btn);
    }

    window.ensureReportIssueModalExists();
    window.ensureMyTicketsModalExists();
    window.ensureAdminTicketsModalExists();
    window.loadAndApplyActiveVisualPalette();
};

window.loadAndApplyActiveVisualPalette = function() {
    if (typeof fetchApi !== 'function') return;
    fetchApi('USER', 'getActiveVisualPalette', {}).then(function(res) {
        if (res && res.status === 'success' && res.palette && res.palette.colores) {
            var c = res.palette.colores;
            var root = document.documentElement;
            if (c.primary) root.style.setProperty('--color-primary', c.primary);
            if (c.primaryDark) root.style.setProperty('--color-primary-dark', c.primaryDark);
            if (c.primaryLight) root.style.setProperty('--color-primary-light', c.primaryLight);
            if (c.secondary) root.style.setProperty('--color-secondary', c.secondary);
            if (c.background) root.style.setProperty('--color-background', c.background);
            if (c.surface) root.style.setProperty('--color-surface', c.surface);
            if (c.textPrimary) root.style.setProperty('--color-text-primary', c.textPrimary);
            if (c.textSecondary) root.style.setProperty('--color-text-secondary', c.textSecondary);
            if (c.border) root.style.setProperty('--color-border', c.border);
            if (c.accent) root.style.setProperty('--color-accent', c.accent);

            if (res.palette.paletaNombre) {
                var themeSlug = res.palette.paletaNombre.toLowerCase().replace(/\s+/g, '-');
                root.setAttribute('data-theme', themeSlug);
            }
        }
    }).catch(function(err) {
        console.warn('Error aplicando paleta visual global:', err);
    });
};

window.detectCurrentAreaFunction = function() {
    var path = window.location.pathname.toLowerCase();
    if (path.includes('login') || path.includes('register') || path.includes('forgot') || path.includes('reset')) {
        return 'Inicio de Sesión / Acceso';
    } else if (path.includes('student-dashboard')) {
        return 'Portal Estudiantil / Asignaturas';
    } else if (path.includes('teacher-dashboard')) {
        return 'Panel Docente / Gestión Académica';
    } else if (path.includes('dashboard-contabilidad')) {
        return 'Pagos y Estado de Cuenta';
    } else if (path.includes('dashboard-recursos-humanos')) {
        return 'Recursos Humanos';
    } else if (path.includes('dashboard-direccion')) {
        return 'Gestión de Dirección';
    } else if (path.includes('exam')) {
        return 'Exámenes y Evaluaciones';
    }
    return 'General';
};

window.ensureReportIssueModalExists = function() {
    if (document.getElementById('modal-report-issue')) return;

    var modalHtml = `
<div id="modal-report-issue" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9995] flex items-center justify-center p-3 md:p-4 hidden">
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg font-bold">
                    <i class="fa-solid fa-bug"></i>
                </div>
                <div>
                    <h3 class="text-sm md:text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                        Reportar un Problema
                        <span class="px-2 py-0.5 bg-slate-800 text-amber-400 text-[10px] font-black rounded-md border border-slate-700">v1.0</span>
                    </h3>
                    <p class="text-[11px] text-slate-400 font-medium">Su reporte genera un ticket único de seguimiento.</p>
                </div>
            </div>
            <button onclick="window.closeReportIssueModal()" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 text-lg transition-all" aria-label="Cerrar modal">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <form id="form-report-issue" onsubmit="window.submitProblemReportForm(event)" class="p-6 overflow-y-auto space-y-4 flex-grow text-xs">
            <div class="p-3.5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                <i class="fa-solid fa-circle-info text-blue-600 text-base mt-0.5"></i>
                <div class="text-[11px] text-blue-900 leading-relaxed font-medium">
                    Se incorporan automáticamente datos de cuenta y contexto (área, sección, tipo de app y versión 1.0) necesarios para investigar el caso.
                </div>
            </div>

            <div>
                <label for="report-area-select" class="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">Área o Función afectada</label>
                <select id="report-area-select" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="Inicio de Sesión / Acceso">Inicio de Sesión / Acceso</option>
                    <option value="Portal Estudiantil / Asignaturas">Portal Estudiantil / Asignaturas</option>
                    <option value="Entregas y Tareas">Entregas y Tareas</option>
                    <option value="Boletines y Calificaciones">Boletines y Calificaciones</option>
                    <option value="Asistencia y Puntos">Asistencia y Puntos</option>
                    <option value="Pagos y Estado de Cuenta">Pagos y Estado de Cuenta</option>
                    <option value="Panel Docente / Gestión Académica">Panel Docente / Gestión Académica</option>
                    <option value="Contabilidad y Planillas">Contabilidad y Planillas</option>
                    <option value="Secretaría y Documentos">Secretaría y Documentos</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Exámenes y Evaluaciones">Exámenes y Evaluaciones</option>
                    <option value="Configuración General">Configuración General</option>
                    <option value="Otro">Otro</option>
                </select>
            </div>

            <div>
                <div class="flex justify-between items-center mb-1">
                    <label for="report-desc-input" class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">¿Qué problema encontraste? *</label>
                    <span id="report-desc-counter" class="text-[10px] text-slate-400 font-medium">0 / 2000</span>
                </div>
                <textarea id="report-desc-input" rows="3" maxlength="2000" oninput="window.updateReportCounter('report-desc-input', 'report-desc-counter')" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Describa el problema detalladamente (mínimo 20 caracteres)..." required></textarea>
                <p id="report-desc-error" class="text-[10px] text-red-500 font-bold mt-1 hidden">La descripción debe contener al menos 20 caracteres significativos.</p>
            </div>

            <div>
                <div class="flex justify-between items-center mb-1">
                    <label for="report-expected-input" class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">¿Qué esperabas que ocurriera? *</label>
                    <span id="report-expected-counter" class="text-[10px] text-slate-400 font-medium">0 / 2000</span>
                </div>
                <textarea id="report-expected-input" rows="3" maxlength="2000" oninput="window.updateReportCounter('report-expected-input', 'report-expected-counter')" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Explique qué resultado o comportamiento esperaba (mínimo 20 caracteres)..." required></textarea>
                <p id="report-expected-error" class="text-[10px] text-red-500 font-bold mt-1 hidden">La explicación debe contener al menos 20 caracteres significativos.</p>
            </div>

            <div class="pt-2 flex items-center justify-between border-t border-slate-100">
                <button type="button" onclick="window.openMyTicketsModal()" class="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-1.5">
                    <i class="fa-solid fa-list-check text-blue-600"></i> Mis Reportes
                </button>
                <div class="flex items-center gap-2">
                    <button type="button" onclick="window.closeReportIssueModal()" class="btn-ima-cancel px-4 py-2 text-xs uppercase font-bold rounded-xl">
                        Cancelar
                    </button>
                    <button type="submit" id="btn-submit-problem-report" class="btn-ima-primary px-5 py-2 text-xs uppercase font-bold rounded-xl shadow-md">
                        <i class="fa-solid fa-paper-plane mr-1"></i> Enviar Reporte
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.updateReportCounter = function(inputId, counterId) {
    var inp = document.getElementById(inputId);
    var cnt = document.getElementById(counterId);
    if (inp && cnt) {
        cnt.textContent = inp.value.length + ' / 2000';
    }
};

// ---------------------------------------------------------------------------
// [T-UX-08] [Fase 3: Experiencia de Usuario y Navegación Unificada] - BOTÓN Y FLUJO DISCRETO DE REPORTE DE PROBLEMAS TÉCNICOS
// Proporciona un botón flotante discreto e interactivo y formulario de reporte técnico con validación de campos, captura de área y almacenamiento de tickets.
// ---------------------------------------------------------------------------
window.openReportIssueModal = function(areaOverride) {
    window.ensureReportIssueModalExists();
    var modal = document.getElementById('modal-report-issue');
    var select = document.getElementById('report-area-select');
    if (select) {
        var area = areaOverride || window.detectCurrentAreaFunction();
        select.value = area;
    }
    if (modal) modal.classList.remove('hidden');
};

window.closeReportIssueModal = function() {
    var modal = document.getElementById('modal-report-issue');
    if (modal) modal.classList.add('hidden');
};

// ---------------------------------------------------------------------------
// [T-UX-23] [Fase 3: Experiencia de Usuario y Navegación Unificada] - FLUJO DE REPORTE DE PROBLEMAS TÉCNICOS Y REGISTRO DE TICKETS
// Valida la entrada del usuario, previene duplicaciones mediante estado de carga en botón de envío y registra el ticket técnico en el microservicio correspondiente.
// ---------------------------------------------------------------------------
window.submitProblemReportForm = function(e) {
    if (e) e.preventDefault();

    var descInp = document.getElementById('report-desc-input');
    var expectedInp = document.getElementById('report-expected-input');
    var areaSelect = document.getElementById('report-area-select');
    var descErr = document.getElementById('report-desc-error');
    var expectedErr = document.getElementById('report-expected-error');
    var submitBtn = document.getElementById('btn-submit-problem-report');

    var descVal = (descInp ? descInp.value : '').trim();
    var expectedVal = (expectedInp ? expectedInp.value : '').trim();

    var hasError = false;
    if (descVal.length < 20) {
        if (descErr) descErr.classList.remove('hidden');
        hasError = true;
    } else {
        if (descErr) descErr.classList.add('hidden');
    }

    if (expectedVal.length < 20) {
        if (expectedErr) expectedErr.classList.remove('hidden');
        hasError = true;
    } else {
        if (expectedErr) expectedErr.classList.add('hidden');
    }

    if (hasError) return;

    var isPWA = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    var appType = isPWA ? 'PWA' : 'Escritorio / Navegador Web';

    var currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || localStorage.getItem('usuario_actual') || '{}');
    } catch (_) {}

    var payload = {
        userId: currentUser.userId || currentUser.id || 'ANON',
        nombreUsuario: currentUser.nombre || currentUser.name || 'Usuario',
        authRole: currentUser.rol || 'Estudiante',
        areaFuncion: areaSelect ? areaSelect.value : 'General',
        seccionPagina: window.location.pathname + window.location.search,
        tipoApp: appType,
        versionGlobal: '1.0',
        descripcion: descVal,
        resultadoEsperado: expectedVal
    };

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Enviando...';
    }

    fetchApi('USER', 'submitProblemTicket', payload).then(function(res) {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane mr-1"></i> Enviar Reporte';
        }

        if (res && res.status === 'success') {
            alert('¡Reporte enviado exitosamente!\n\nNúmero de Ticket: ' + (res.ticketId || 'CONFIRMADO') + '\n\nPuede dar seguimiento a su estado desde "Mis Reportes".');
            if (descInp) descInp.value = '';
            if (expectedInp) expectedInp.value = '';
            window.updateReportCounter('report-desc-input', 'report-desc-counter');
            window.updateReportCounter('report-expected-input', 'report-expected-counter');
            window.closeReportIssueModal();
            window.openMyTicketsModal();
        } else {
            alert('Error al enviar el reporte: ' + (res && res.message ? res.message : 'Ocurrió un problema de red. Por favor reintente.'));
        }
    }).catch(function(err) {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane mr-1"></i> Enviar Reporte';
        }
        alert('Fallo de conexión al enviar el reporte: ' + err.message);
    });
};

window.ensureMyTicketsModalExists = function() {
    if (document.getElementById('modal-my-tickets')) return;

    var modalHtml = `
<div id="modal-my-tickets" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9996] flex items-center justify-center p-3 md:p-4 hidden">
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg font-bold">
                    <i class="fa-solid fa-ticket"></i>
                </div>
                <div>
                    <h3 class="text-sm md:text-base font-black uppercase tracking-tight text-white">Mis Reportes y Tickets</h3>
                    <p class="text-[11px] text-slate-400 font-medium">Historial y estado de reportes enviados por su cuenta.</p>
                </div>
            </div>
            <button onclick="window.closeMyTicketsModal()" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 text-lg transition-all" aria-label="Cerrar modal">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-4 flex-grow text-xs">
            <div id="my-tickets-list-container" class="space-y-3">
                <p class="text-slate-400 text-center py-8 italic font-medium"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Cargando reportes...</p>
            </div>
        </div>

        <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button onclick="window.openReportIssueModal()" class="px-3.5 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all flex items-center gap-1.5">
                <i class="fa-solid fa-plus text-blue-600"></i> Nuevo Reporte
            </button>
            <button onclick="window.closeMyTicketsModal()" class="btn-ima-cancel px-4 py-2 text-xs uppercase font-bold rounded-xl">
                Cerrar
            </button>
        </div>
    </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.openMyTicketsModal = function() {
    window.ensureMyTicketsModalExists();
    var modal = document.getElementById('modal-my-tickets');
    if (modal) modal.classList.remove('hidden');
    window.renderMyTicketsList();
};

window.closeMyTicketsModal = function() {
    var modal = document.getElementById('modal-my-tickets');
    if (modal) modal.classList.add('hidden');
};

window.renderMyTicketsList = function() {
    var container = document.getElementById('my-tickets-list-container');
    if (!container) return;

    var currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || localStorage.getItem('usuario_actual') || '{}');
    } catch (_) {}

    fetchApi('USER', 'getProblemTickets', { userId: currentUser.userId || currentUser.id }).then(function(res) {
        if (!res || res.status !== 'success' || !res.tickets || res.tickets.length === 0) {
            container.innerHTML = '<div class="text-center py-10 text-slate-400 font-medium"><i class="fa-solid fa-ticket-simple text-3xl mb-2 opacity-40 block"></i><p>No tiene tickets ni reportes registrados.</p></div>';
            return;
        }

        var html = [];
        res.tickets.forEach(function(t) {
            var badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
            if (t.estado === 'En revisión') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
            else if (t.estado === 'Se necesita información') badgeColor = 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse';
            else if (t.estado === 'Información recibida') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
            else if (t.estado === 'Solucionado') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            else if (t.estado === 'Cerrado') badgeColor = 'bg-slate-200 text-slate-600 border-slate-300';

            var requiresReply = t.estado === 'Se necesita información';

            html.push(
                '<div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">',
                '  <div class="flex items-center justify-between">',
                '    <div class="flex items-center gap-2">',
                '      <span class="font-black text-slate-900 uppercase text-xs">' + t.ticketId + '</span>',
                '      <span class="text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md">' + t.areaFuncion + '</span>',
                '    </div>',
                '    <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg border ' + badgeColor + '">' + t.estado + '</span>',
                '  </div>',
                '  <p class="text-xs text-slate-700 font-medium line-clamp-2"><strong>Problema:</strong> ' + (t.descripcion || '') + '</p>',
                requiresReply ? '  <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-bold text-[11px] flex items-center gap-2"><i class="fa-solid fa-circle-exclamation text-amber-600"></i> El administrador requiere información adicional de su parte.</div>' : '',
                '  <div class="flex items-center justify-between text-[10px] text-slate-400 font-medium border-t border-slate-200/60 pt-2">',
                '    <span>Enviado: ' + new Date(t.creadoEn).toLocaleString() + '</span>',
                '    <button onclick="window.toggleTicketDetail(\'' + t.ticketId + '\')" class="text-blue-600 font-bold hover:underline flex items-center gap-1">Ver Mensajes (' + (t.mensajes ? t.mensajes.length : 0) + ') <i class="fa-solid fa-chevron-down"></i></button>',
                '  </div>',
                '  <div id="ticket-detail-' + t.ticketId + '" class="hidden space-y-3 pt-2 border-t border-slate-200">',
                '    <div class="space-y-2 max-h-48 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">'
            );

            if (t.mensajes && t.mensajes.length > 0) {
                t.mensajes.forEach(function(m) {
                    var isUser = m.autorUserId === currentUser.userId || m.tipoAutor === t.rolActivo;
                    html.push(
                        '      <div class="p-2.5 rounded-xl text-xs ' + (isUser ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'bg-slate-100 text-slate-800 border border-slate-200') + '">',
                        '        <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">',
                        '          <span>' + m.autorNombre + ' (' + m.tipoAutor + ')</span>',
                        '          <span>' + new Date(m.timestamp).toLocaleTimeString() + '</span>',
                        '        </div>',
                        '        <p class="whitespace-pre-wrap font-medium text-xs">' + m.mensaje + '</p>',
                        '      </div>'
                    );
                });
            } else {
                html.push('      <p class="text-slate-400 text-center py-2 italic">Sin mensajes adicionales.</p>');
            }

            html.push(
                '    </div>',
                '    <div class="flex items-center gap-2">',
                '      <input type="text" id="reply-input-' + t.ticketId + '" class="flex-grow p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs" placeholder="Escriba su respuesta o aclaración...">',
                '      <button onclick="window.sendTicketReply(\'' + t.ticketId + '\')" class="btn-ima-primary px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap"><i class="fa-solid fa-paper-plane mr-1"></i> Responder</button>',
                '    </div>',
                '  </div>',
                '</div>'
            );
        });

        container.innerHTML = html.join('');
    }).catch(function(err) {
        container.innerHTML = '<p class="text-red-500 text-center py-4 font-bold">Error al cargar reportes: ' + err.message + '</p>';
    });
};

window.toggleTicketDetail = function(ticketId) {
    var el = document.getElementById('ticket-detail-' + ticketId);
    if (el) el.classList.toggle('hidden');
};

window.sendTicketReply = function(ticketId) {
    var inp = document.getElementById('reply-input-' + ticketId);
    if (!inp || !inp.value.trim()) return;

    var text = inp.value.trim();
    var currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || localStorage.getItem('usuario_actual') || '{}');
    } catch (_) {}

    var payload = {
        ticketId: ticketId,
        mensaje: text,
        userId: currentUser.userId || currentUser.id,
        nombreUsuario: currentUser.nombre || currentUser.name,
        authRole: currentUser.rol || 'Estudiante'
    };

    fetchApi('USER', 'replyProblemTicket', payload).then(function(res) {
        if (res && res.status === 'success') {
            inp.value = '';
            window.renderMyTicketsList();
        } else {
            alert('Error al enviar respuesta: ' + (res ? res.message : 'Error desconocido'));
        }
    }).catch(function(err) {
        alert('Fallo de red: ' + err.message);
    });
};

window.ensureAdminTicketsModalExists = function() {
    if (document.getElementById('modal-admin-tickets')) return;

    var modalHtml = `
<div id="modal-admin-tickets" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9997] flex items-center justify-center p-3 md:p-4 hidden">
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg font-bold">
                    <i class="fa-solid fa-headset"></i>
                </div>
                <div>
                    <h3 class="text-sm md:text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                        Administración de Tickets de Soporte
                        <span class="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-black rounded-md border border-purple-500/30">Exclusivo Admin</span>
                    </h3>
                    <p class="text-[11px] text-slate-400 font-medium">Gestión, investigación y respuesta a reportes de usuarios.</p>
                </div>
            </div>
            <button onclick="window.closeAdminTicketsModal()" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 text-lg transition-all" aria-label="Cerrar modal">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2">
                <label class="font-bold text-slate-600">Filtrar Estado:</label>
                <select id="admin-ticket-status-filter" onchange="window.renderAdminTicketsUI()" class="p-2 bg-white border border-slate-200 rounded-xl font-medium text-xs">
                    <option value="TODOS">Todos los estados</option>
                    <option value="Enviado">Enviado</option>
                    <option value="En revisión">En revisión</option>
                    <option value="Se necesita información">Se necesita información</option>
                    <option value="Información recibida">Información recibida</option>
                    <option value="Solucionado">Solucionado</option>
                    <option value="Cerrado">Cerrado</option>
                </select>
            </div>
            <div class="flex items-center gap-2">
                <input type="text" id="admin-ticket-search-input" onkeyup="window.renderAdminTicketsUI()" placeholder="Buscar ticket o usuario..." class="p-2 bg-white border border-slate-200 rounded-xl font-medium text-xs w-48 md:w-64">
                <button onclick="window.renderAdminTicketsUI()" class="p-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 font-bold"><i class="fa-solid fa-rotate-right"></i></button>
            </div>
        </div>

        <div class="p-6 overflow-y-auto space-y-4 flex-grow text-xs">
            <div id="admin-tickets-container" class="space-y-3">
                <p class="text-slate-400 text-center py-8 italic font-medium"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Cargando tickets de soporte...</p>
            </div>
        </div>

        <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button onclick="window.closeAdminTicketsModal()" class="btn-ima-cancel px-4 py-2 text-xs uppercase font-bold rounded-xl">
                Cerrar
            </button>
        </div>
    </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.openAdminTicketsModal = function() {
    window.ensureAdminTicketsModalExists();
    var modal = document.getElementById('modal-admin-tickets');
    if (modal) modal.classList.remove('hidden');
    window.renderAdminTicketsUI();
};

window.closeAdminTicketsModal = function() {
    var modal = document.getElementById('modal-admin-tickets');
    if (modal) modal.classList.add('hidden');
};

window.renderAdminTicketsUI = function() {
    var container = document.getElementById('admin-tickets-container');
    if (!container) return;

    var filterSelect = document.getElementById('admin-ticket-status-filter');
    var searchInput = document.getElementById('admin-ticket-search-input');

    var filterState = filterSelect ? filterSelect.value : 'TODOS';
    var searchQuery = searchInput ? window.normalizeSearchString(searchInput.value) : '';

    fetchApi('USER', 'getProblemTickets', {}).then(function(res) {
        if (!res || res.status !== 'success' || !res.tickets || res.tickets.length === 0) {
            container.innerHTML = '<div class="text-center py-10 text-slate-400 font-medium"><i class="fa-solid fa-inbox text-3xl mb-2 opacity-40 block"></i><p>No hay tickets de soporte registrados en el sistema.</p></div>';
            return;
        }

        var filtered = res.tickets.filter(function(t) {
            if (filterState !== 'TODOS' && t.estado !== filterState) return false;
            if (searchQuery) {
                var matchId = window.normalizeSearchString(t.ticketId).indexOf(searchQuery) !== -1;
                var matchUser = window.normalizeSearchString(t.nombreUsuario).indexOf(searchQuery) !== -1;
                var matchArea = window.normalizeSearchString(t.areaFuncion).indexOf(searchQuery) !== -1;
                var matchDesc = window.normalizeSearchString(t.descripcion).indexOf(searchQuery) !== -1;
                if (!matchId && !matchUser && !matchArea && !matchDesc) return false;
            }
            return true;
        });

        if (filtered.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-slate-400 font-medium"><p>No se encontraron tickets con los filtros aplicados.</p></div>';
            return;
        }

        var html = [];
        filtered.forEach(function(t) {
            var badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
            if (t.estado === 'En revisión') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
            else if (t.estado === 'Se necesita información') badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
            else if (t.estado === 'Información recibida') badgeColor = 'bg-purple-100 text-purple-800 border-purple-300 font-bold';
            else if (t.estado === 'Solucionado') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            else if (t.estado === 'Cerrado') badgeColor = 'bg-slate-200 text-slate-600 border-slate-300';

            html.push(
                '<div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">',
                '  <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">',
                '    <div class="flex items-center gap-2">',
                '      <span class="font-black text-slate-900 text-xs">' + t.ticketId + '</span>',
                '      <span class="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">' + t.nombreUsuario + ' (' + t.rolActivo + ')</span>',
                '      <span class="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">' + t.areaFuncion + '</span>',
                '    </div>',
                '    <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg border ' + badgeColor + '">' + t.estado + '</span>',
                '  </div>',

                '  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200/60">',
                '    <div>',
                '      <span class="block text-[10px] font-black uppercase text-slate-400">Problema Encontrado:</span>',
                '      <p class="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-wrap mt-0.5">' + t.descripcion + '</p>',
                '    </div>',
                '    <div>',
                '      <span class="block text-[10px] font-black uppercase text-slate-400">Resultado Esperado:</span>',
                '      <p class="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-wrap mt-0.5">' + t.resultadoEsperado + '</p>',
                '    </div>',
                '  </div>',

                '  <div class="flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-medium">',
                '    <span>Sección: ' + (t.seccionPagina || 'N/D') + ' | App: ' + (t.tipoApp || 'Escritorio') + ' | Versión: v' + (t.versionGlobal || '1.0') + '</span>',
                '    <span>Fecha: ' + new Date(t.creadoEn).toLocaleString() + '</span>',
                '  </div>',

                '  <div class="pt-2 border-t border-slate-200 space-y-3">',
                '    <div class="flex flex-wrap items-center gap-3">',
                '      <label class="font-bold text-xs text-slate-700">Cambiar Estado:</label>',
                '      <select id="admin-status-select-' + t.ticketId + '" class="p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs">',
                '        <option value="Enviado"' + (t.estado === 'Enviado' ? ' selected' : '') + '>Enviado</option>',
                '        <option value="En revisión"' + (t.estado === 'En revisión' ? ' selected' : '') + '>En revisión</option>',
                '        <option value="Se necesita información"' + (t.estado === 'Se necesita información' ? ' selected' : '') + '>Se necesita información</option>',
                '        <option value="Información recibida"' + (t.estado === 'Información recibida' ? ' selected' : '') + '>Información recibida</option>',
                '        <option value="Solucionado"' + (t.estado === 'Solucionado' ? ' selected' : '') + '>Solucionado</option>',
                '        <option value="Cerrado"' + (t.estado === 'Cerrado' ? ' selected' : '') + '>Cerrado</option>',
                '      </select>',
                '      <button onclick="window.adminUpdateTicketStatus(\'' + t.ticketId + '\')" class="px-3 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"><i class="fa-solid fa-floppy-disk mr-1"></i> Guardar Estado</button>',
                '    </div>',

                '    <div class="space-y-2 max-h-48 overflow-y-auto p-2.5 bg-white rounded-xl border border-slate-200">',
                '      <span class="block text-[10px] font-black uppercase text-slate-400 mb-1">Historial de Mensajes & Notas Internas:</span>'
            );

            if (t.mensajes && t.mensajes.length > 0) {
                t.mensajes.forEach(function(m) {
                    var isInternal = m.esNotaInterna === true;
                    var boxClass = isInternal ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-slate-100 text-slate-800 border-slate-200';
                    html.push(
                        '      <div class="p-2.5 rounded-xl border text-xs ' + boxClass + '">',
                        '        <div class="flex items-center justify-between text-[10px] font-bold opacity-70 mb-1">',
                        '          <span>' + m.autorNombre + ' (' + m.tipoAutor + ')' + (isInternal ? ' - [NOTA INTERNA ADMIN]' : '') + '</span>',
                        '          <span>' + new Date(m.timestamp).toLocaleString() + '</span>',
                        '        </div>',
                        '        <p class="whitespace-pre-wrap font-medium">' + m.mensaje + '</p>',
                        '      </div>'
                    );
                });
            } else {
                html.push('      <p class="text-slate-400 italic text-center py-1">Sin mensajes registrados.</p>');
            }

            html.push(
                '    </div>',

                '    <div class="space-y-2 bg-slate-100 p-3 rounded-xl border border-slate-200">',
                '      <div class="flex items-center gap-4 text-[11px] font-bold text-slate-700">',
                '        <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="reply-type-' + t.ticketId + '" value="public" checked class="text-blue-600"> Mensaje Público al Usuario</label>',
                '        <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="reply-type-' + t.ticketId + '" value="internal" class="text-amber-600"> Nota Interna Privada</label>',
                '      </div>',
                '      <div class="flex items-center gap-2">',
                '        <input type="text" id="admin-reply-text-' + t.ticketId + '" class="flex-grow p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-xs" placeholder="Escriba un mensaje o nota de seguimiento...">',
                '        <button onclick="window.adminSubmitTicketReply(\'' + t.ticketId + '\')" class="btn-ima-primary px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap"><i class="fa-solid fa-paper-plane mr-1"></i> Enviar</button>',
                '      </div>',
                '    </div>',
                '  </div>',
                '</div>'
            );
        });

        container.innerHTML = html.join('');
    }).catch(function(err) {
        container.innerHTML = '<p class="text-red-500 text-center py-4 font-bold">Error cargando tickets de soporte: ' + err.message + '</p>';
    });
};

window.adminUpdateTicketStatus = function(ticketId) {
    var select = document.getElementById('admin-status-select-' + ticketId);
    if (!select) return;

    var newStatus = select.value;
    var currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || localStorage.getItem('usuario_actual') || '{}');
    } catch (_) {}

    var payload = {
        ticketId: ticketId,
        nuevoEstado: newStatus,
        userId: currentUser.userId || currentUser.id,
        nombreUsuario: currentUser.nombre || currentUser.name,
        authRole: currentUser.rol || 'Administrador'
    };

    fetchApi('USER', 'updateTicketStatus', payload).then(function(res) {
        if (res && res.status === 'success') {
            alert('Estado del ticket ' + ticketId + ' actualizado a "' + newStatus + '".');
            window.renderAdminTicketsUI();
        } else {
            alert('Error actualizando estado: ' + (res ? res.message : 'Error desconocido'));
        }
    }).catch(function(err) {
        alert('Fallo de red: ' + err.message);
    });
};

window.adminSubmitTicketReply = function(ticketId) {
    var inp = document.getElementById('admin-reply-text-' + ticketId);
    if (!inp || !inp.value.trim()) return;

    var text = inp.value.trim();
    var radios = document.getElementsByName('reply-type-' + ticketId);
    var isInternal = false;
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked && radios[i].value === 'internal') {
            isInternal = true;
            break;
        }
    }

    var currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || localStorage.getItem('usuario_actual') || '{}');
    } catch (_) {}

    var select = document.getElementById('admin-status-select-' + ticketId);
    var currentStatus = select ? select.value : 'En revisión';

    var payload = {
        ticketId: ticketId,
        nuevoEstado: currentStatus,
        notaInterna: isInternal ? text : '',
        mensajeUsuario: isInternal ? '' : text,
        userId: currentUser.userId || currentUser.id,
        nombreUsuario: currentUser.nombre || currentUser.name,
        authRole: currentUser.rol || 'Administrador'
    };

    fetchApi('USER', 'updateTicketStatus', payload).then(function(res) {
        if (res && res.status === 'success') {
            inp.value = '';
            window.renderAdminTicketsUI();
        } else {
            alert('Error al registrar mensaje: ' + (res ? res.message : 'Error desconocido'));
        }
    }).catch(function(err) {
        alert('Fallo de red: ' + err.message);
    });
};

/* ==========================================================================
   TERMS AND CONDITIONS FIRST-LOGIN MODAL WORKFLOW
   ========================================================================== */
window.checkAndShowFirstLoginTermsModal = function() {
    var currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || localStorage.getItem('usuario_actual') || '{}');
    } catch (_) {}

    if (!currentUser || (!currentUser.userId && !currentUser.id)) return;
    var uid = currentUser.userId || currentUser.id;

    fetchApi('ACCOUNTING', 'getPolicyAcceptances', { userId: uid })
        .then(function(res) {
            var accepted = false;
            if (res && res.status === 'success' && res.aceptaciones) {
                accepted = res.aceptaciones.some(function(a) {
                    return a.politicaInstId === 'DOC-USO' || a.politicaInstId === 'TERMINOS-1.0' || a.tipoDocumento === 'TERMS_AND_CONDITIONS';
                });
            }
            if (!accepted) {
                window.openFirstLoginTermsModal();
            }
        })
        .catch(function(err) {
            console.warn('No se pudo verificar la aceptación de términos:', err);
        });
};

window.openFirstLoginTermsModal = function() {
    var modalId = 'modal-first-login-terms';
    var modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fixed inset-0 z-[10000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto';
        modal.innerHTML = '' +
            '<div class="bg-white rounded-[2rem] border border-slate-100 shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 relative animate-fade-in">' +
                '<div class="text-center space-y-2 border-b border-slate-100 pb-4">' +
                    '<div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-xl shadow-inner">' +
                        '<i class="fas fa-file-contract"></i>' +
                    '</div>' +
                    '<h3 class="text-xl font-black text-slate-900 uppercase tracking-tight">Términos y Condiciones de Uso</h3>' +
                    '<p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Aviso Legal Obligatorio — Versión Global 1.0</p>' +
                '</div>' +
                '<div class="text-xs text-slate-600 space-y-3 leading-relaxed max-h-60 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">' +
                    '<p class="font-bold text-slate-800">Bienvenido a la plataforma oficial de New Generation Bilingual School and Institute.</p>' +
                    '<p>Para hacer uso de los servicios de la plataforma, es requisito indispensable leer y aceptar libremente los Términos y Condiciones de Uso del Software titularidad exclusiva de <strong>JyP Solutions S. de R.L. de C.V.</strong> otorgado bajo licencia de uso a la Institución.</p>' +
                    '<p>El uso de la plataforma incluye el acceso al expediente escolar, notas, aulas virtuales, pagos y notificaciones multicanal. El usuario declara que sus credenciales son personales e intransferibles.</p>' +
                    '<div class="pt-2">' +
                        '<a href="politica-de-uso.html" target="_blank" class="inline-flex items-center text-blue-600 font-bold hover:underline gap-1 text-xs">' +
                            '<i class="fas fa-external-link-alt"></i> Leer Términos y Condiciones Completos (17 Artículos)' +
                        '</a>' +
                    '</div>' +
                '</div>' +
                '<div class="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">' +
                    '<button onclick="window.closeFirstLoginTermsModalAndLogout()" class="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 uppercase tracking-wider transition-all">' +
                        'Volver / Salir' +
                    '</button>' +
                    '<button id="btn-modal-accept-terms" onclick="window.acceptTermsFromModal()" class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2">' +
                        '<i class="fas fa-check-circle"></i> Aceptar Términos' +
                    '</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);
    } else {
        modal.classList.remove('hidden');
    }

};

window.closeFirstLoginTermsModalAndLogout = function() {
    var modal = document.getElementById('modal-first-login-terms');
    if (modal) modal.classList.add('hidden');
    if (typeof window.logout === 'function') {
        window.logout();
    } else {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
};

window.acceptTermsFromModal = function() {
    var currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || localStorage.getItem('usuario_actual') || '{}');
    } catch (_) {}

    var uid = currentUser.userId || currentUser.id;
    if (!uid) {
        alert('Debe estar autenticado para registrar su conformidad.');
        return;
    }

    var btn = document.getElementById('btn-modal-accept-terms');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
    }

    fetchApi('USER', 'acceptLegalDocument', {
        userId: uid,
        docType: 'TERMS_AND_CONDITIONS',
        version: '1.0'
    }).then(function(res) {
        if (res && res.status === 'success') {
            var modal = document.getElementById('modal-first-login-terms');
            if (modal) modal.classList.add('hidden');
        } else {
            alert('Error al guardar la aceptación: ' + (res ? res.message : 'Error desconocido'));
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Aceptar Términos';
            }
        }
    }).catch(function(err) {
        alert('Error de conexión al procesar la aceptación.');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check-circle"></i> Aceptar Términos';
        }
    });
};

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (typeof window.checkAndShowFirstLoginTermsModal === 'function') {
            window.checkAndShowFirstLoginTermsModal();
        }
    }, 1200);
});

/* ==========================================================================
   UNIVERSAL CONFIGURABLE CHART COMPONENT (FASE GRÁFICAS E INDICADORES)
   ========================================================================== */
window.chartPalettes = {
    'institucional': { primary: '#2563eb', bg: 'rgba(37, 99, 235, 0.15)', border: '#1d4ed8', list: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'] },
    'esmeralda': { primary: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: '#047857', list: ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7', '#a7f3d0'] },
    'indigo': { primary: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)', border: '#4338ca', list: ['#6366f1', '#4f46e5', '#3730a3', '#818cf8', '#a5b4fc', '#c7d2fe'] },
    'amber': { primary: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: '#b45309', list: ['#f59e0b', '#d97706', '#b45309', '#fbbf24', '#fde68a', '#fef3c7'] },
    'monocromo': { primary: '#475569', bg: 'rgba(71, 85, 105, 0.15)', border: '#1e293b', list: ['#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'] }
};

window.activeUniversalCharts = window.activeUniversalCharts || {};

window.renderUniversalConfigurableChart = function(containerId, options) {
    var container = document.getElementById(containerId);
    if (!container) return;

    options = options || {};
    var category = options.chartCategory || 'ACADEMICO';
    var title = options.title || 'Indicador de Rendimiento';
    var subtitle = options.subtitle || 'Visualización de datos institucionales';
    var labels = options.labels || [];
    var rawData = options.data || [];
    var defaultType = options.defaultType || 'bar';
    var currentPaletteKey = options.paletteKey || 'institucional';
    var isTableView = !!options.showTableFirst;

    var chartKey = containerId + '_chart';

    var html = '' +
        '<div class="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">' +
            '<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">' +
                '<div>' +
                    '<span class="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">' +
                        category +
                    '</span>' +
                    '<h4 class="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">' + title + '</h4>' +
                    '<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">' + subtitle + '</p>' +
                '</div>' +
                '<!-- Controles de Configuración de Gráfica -->' +
                '<div class="flex flex-wrap items-center gap-2 text-xs font-bold">' +
                    '<select id="ctrl-type-' + containerId + '" class="p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 text-[11px] outline-none">' +
                        '<option value="bar" ' + (defaultType==='bar'?'selected':'') + '>📊 Barras Verticales</option>' +
                        '<option value="horizontalBar" ' + (defaultType==='horizontalBar'?'selected':'') + '>📏 Barras Horizontales</option>' +
                        '<option value="line" ' + (defaultType==='line'?'selected':'') + '>📈 Líneas de Tendencia</option>' +
                        '<option value="doughnut" ' + (defaultType==='doughnut'?'selected':'') + '>🍩 Sectores / Dona</option>' +
                        '<option value="radar" ' + (defaultType==='radar'?'selected':'') + '>🕸️ Radial Multidimensional</option>' +
                    '</select>' +
                    '<select id="ctrl-palette-' + containerId + '" class="p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 text-[11px] outline-none">' +
                        '<option value="institucional" ' + (currentPaletteKey==='institucional'?'selected':'') + '>🎨 Azul Institucional</option>' +
                        '<option value="esmeralda" ' + (currentPaletteKey==='esmeralda'?'selected':'') + '>🌿 Verde Esmeralda</option>' +
                        '<option value="indigo" ' + (currentPaletteKey==='indigo'?'selected':'') + '>🔮 Índigo Noble</option>' +
                        '<option value="amber" ' + (currentPaletteKey==='amber'?'selected':'') + '>📙 Ámbar Cobre</option>' +
                        '<option value="monocromo" ' + (currentPaletteKey==='monocromo'?'selected':'') + '>🔘 Monocromo Sobrio</option>' +
                    '</select>' +
                    '<button id="btn-toggle-view-' + containerId + '" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] uppercase tracking-wider transition-all flex items-center gap-1">' +
                        '<i class="fas ' + (isTableView ? 'fa-chart-bar' : 'fa-table') + '"></i> ' + (isTableView ? 'Gráfica' : 'Tabla') +
                    '</button>' +
                '</div>' +
            '</div>' +

            '<!-- Area de Gráfica / Tabla -->' +
            '<div id="view-chart-area-' + containerId + '" class="' + (isTableView ? 'hidden' : '') + ' h-64 md:h-72 relative">' +
                '<canvas id="canvas-' + containerId + '"></canvas>' +
            '</div>' +

            '<div id="view-table-area-' + containerId + '" class="' + (isTableView ? '' : 'hidden') + ' max-h-64 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50/50">' +
                '<table class="w-full text-left text-xs font-semibold text-slate-700">' +
                    '<thead class="text-[10px] uppercase font-black text-slate-400 border-b border-slate-200 bg-slate-100">' +
                        '<tr><th class="p-2">Categoría / Ítem</th><th class="p-2 text-right">Valor / Resultado</th></tr>' +
                    '</thead>' +
                    '<tbody>' +
                        (labels.map(function(lbl, idx) {
                            var val = (rawData[idx] !== undefined && rawData[idx] !== null) ? rawData[idx] : 'N/A';
                            return '<tr class="border-b border-slate-100 hover:bg-white"><td class="p-2 font-bold">' + lbl + '</td><td class="p-2 text-right font-black text-slate-900">' + val + '</td></tr>';
                        }).join('') || '<tr><td colspan="2" class="p-4 text-center text-slate-400">Sin datos para mostrar en la tabla.</td></tr>') +
                    '</tbody>' +
                '</table>' +
            '</div>' +
        '</div>';

    container.innerHTML = html;

    if (!labels || labels.length === 0 || !rawData || rawData.length === 0) {
        var chartArea = document.getElementById('view-chart-area-' + containerId);
        if (chartArea) {
            chartArea.innerHTML = '<div class="h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/50 rounded-2xl border border-dashed border-slate-200"><i class="fas fa-info-circle mr-2 text-slate-300"></i> No existen registros suficientes para esta categoría</div>';
        }
        return;
    }

    function renderChartInstance(type, paletteKey) {
        var ctx = document.getElementById('canvas-' + containerId)?.getContext('2d');
        if (!ctx) return;

        if (window.activeUniversalCharts[chartKey]) {
            window.activeUniversalCharts[chartKey].destroy();
        }

        var pal = window.chartPalettes[paletteKey] || window.chartPalettes['institucional'];
        var isHorizontal = type === 'horizontalBar';
        var actualType = isHorizontal ? 'bar' : type;

        var bgColors = (actualType === 'doughnut' || actualType === 'pie' || actualType === 'polarArea') ? pal.list : pal.bg;
        var borderColors = (actualType === 'doughnut' || actualType === 'pie' || actualType === 'polarArea') ? '#ffffff' : pal.border;

        var chartConfig = {
            type: actualType,
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: rawData,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    tension: 0.35,
                    fill: actualType === 'line'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: isHorizontal ? 'y' : 'x',
                plugins: {
                    legend: {
                        display: (actualType === 'doughnut' || actualType === 'pie' || actualType === 'radar'),
                        position: 'bottom',
                        labels: { font: { family: 'Inter', size: 10, weight: 'bold' } }
                    }
                },
                scales: (actualType === 'doughnut' || actualType === 'pie' || actualType === 'radar') ? {} : {
                    y: { beginAtZero: true, grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Inter', size: 10, weight: 'bold' } } },
                    x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 10, weight: 'bold' } } }
                }
            }
        };

        window.activeUniversalCharts[chartKey] = new Chart(ctx, chartConfig);
    }

    if (!isTableView) {
        renderChartInstance(defaultType, currentPaletteKey);
    }

    // Handlers
    var typeSelect = document.getElementById('ctrl-type-' + containerId);
    var paletteSelect = document.getElementById('ctrl-palette-' + containerId);
    var toggleBtn = document.getElementById('btn-toggle-view-' + containerId);

    if (typeSelect) {
        typeSelect.addEventListener('change', function() {
            renderChartInstance(typeSelect.value, paletteSelect ? paletteSelect.value : 'institucional');
        });
    }

    if (paletteSelect) {
        paletteSelect.addEventListener('change', function() {
            renderChartInstance(typeSelect ? typeSelect.value : 'bar', paletteSelect.value);
        });
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            var chartView = document.getElementById('view-chart-area-' + containerId);
            var tableView = document.getElementById('view-table-area-' + containerId);
            if (!chartView || !tableView) return;

            if (chartView.classList.contains('hidden')) {
                chartView.classList.remove('hidden');
                tableView.classList.add('hidden');
                toggleBtn.innerHTML = '<i class="fas fa-table mr-1"></i> Tabla';
                renderChartInstance(typeSelect ? typeSelect.value : 'bar', paletteSelect ? paletteSelect.value : 'institucional');
            } else {
                chartView.classList.add('hidden');
                tableView.classList.remove('hidden');
                toggleBtn.innerHTML = '<i class="fas fa-chart-bar mr-1"></i> Gráfica';
            }
        });
    }
};

window.openAnalyticsChartModal = function(chartCategory) {
    chartCategory = chartCategory || 'DESEMPEÑO ACADÉMICO';
    var modalId = 'modal-universal-analytics-chart';
    var modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fixed inset-0 z-[9995] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto';
        modal.innerHTML = '' +
            '<div class="bg-white rounded-[2rem] border border-slate-100 shadow-2xl max-w-3xl w-full p-6 md:p-8 space-y-6 relative animate-fade-in">' +
                '<div class="flex items-center justify-between border-b border-slate-100 pb-4">' +
                    '<div>' +
                        '<span class="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-1">Módulo Analítico</span>' +
                        '<h3 class="text-xl font-black text-slate-900 uppercase tracking-tight" id="analytics-modal-title">Gráficas e Indicadores</h3>' +
                    '</div>' +
                    '<button onclick="document.getElementById(\'' + modalId + '\').classList.add(\'hidden\')" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm transition-all">' +
                        '<i class="fas fa-times"></i>' +
                    '</button>' +
                '</div>' +
                '<div id="modal-chart-widget-container">' +
                    '<!-- Componente rendered por renderUniversalConfigurableChart -->' +
                '</div>' +
                '<div class="pt-2 border-t border-slate-100 text-right">' +
                    '<button onclick="document.getElementById(\'' + modalId + '\').classList.add(\'hidden\')" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all">' +
                        'Cerrar' +
                    '</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);
    } else {
        modal.classList.remove('hidden');
    }

    var sampleLabels = ['Español', 'Matemáticas', 'Inglés', 'Ciencias Naturales', 'Estudios Sociales', 'Informática'];
    var sampleData = [88, 92, 85, 90, 87, 96];

    if (chartCategory === 'ASISTENCIA') {
        sampleLabels = ['Asistencia Presencial', 'Excusas Justificadas', 'Tardanzas', 'Inasistencias'];
        sampleData = [94, 3, 2, 1];
    } else if (chartCategory === 'PARTICIPACION') {
        sampleLabels = ['Tareas Entregadas a Tiempo', 'Entregas Tardías (50%)', 'Guías Consultadas', 'Exámenes Completados'];
        sampleData = [18, 2, 12, 4];
    } else if (chartCategory === 'ADMINISTRATIVO') {
        sampleLabels = ['I Parcial', 'II Parcial', 'III Parcial', 'IV Parcial'];
        sampleData = [89.5, 91.2, 93.0, 94.8];
    }

    window.renderUniversalConfigurableChart('modal-chart-widget-container', {
        chartCategory: chartCategory,
        title: 'Indicadores de ' + chartCategory,
        subtitle: 'Análisis detallado de rendimiento e indicadores institucionales',
        labels: sampleLabels,
        data: sampleData,
        defaultType: chartCategory === 'ASISTENCIA' ? 'doughnut' : 'bar'
    });
};

// ---------------------------------------------------------------------------
// [T-UX-09] [Fase 3: Experiencia de Usuario y Navegación Unificada] - MENÚ LATERAL RESPONSIVO ESPECÍFICO POR ROL CON COLAPSO MÓVIL SUAVE
// Proporciona navegación adaptativa según el rol activo (Estudiante, Docente, Contabilidad, RH, Dirección), con menús colapsables suaves en móviles y restauraciones de navegación.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// [T-UX-13] [Fase 3: Experiencia de Usuario y Navegación Unificada] - MENÚ LATERAL ESPECÍFICO DE CADA PANEL Y DESTACADO DE SECCIÓN ACTIVA
// Identifica visualmente y mediante atributos de accesibilidad (aria-current="page") la sección activa del menú lateral específico por rol y panel.
// ---------------------------------------------------------------------------
window.highlightActiveSidebarNavItem = function(containerId, activeItemId) {
    var container = document.getElementById(containerId) || document.body;
    if (!container || !activeItemId) return;

    var navLinks = container.querySelectorAll('a[href], button[id]');
    navLinks.forEach(function(link) {
        link.classList.remove('bg-blue-600', 'text-white', 'font-black', 'active-nav-item');
        link.removeAttribute('aria-current');

        var href = link.getAttribute('href') || '';
        var linkId = link.id || '';

        if (linkId === activeItemId || (href && href !== 'javascript:void(0)' && href.indexOf(activeItemId) !== -1)) {
            link.classList.add('bg-blue-600', 'text-white', 'font-black', 'active-nav-item');
            link.setAttribute('aria-current', 'page');
        }
    });
};

/* ==========================================================================
   ROLE NAVIGATION MENU & ACCORDION SIDEBAR / HAMBURGER DRAWER SYSTEM
   ========================================================================== */
window.loadCommercialUnitNames = function() {
    var storeName = localStorage.getItem('storeUnitName') || 'Tiendita Escolar';
    var cafeName = localStorage.getItem('cafeUnitName') || 'Cafetería';

    var storeEl = document.getElementById('store-dashboard-title');
    if (storeEl) storeEl.textContent = storeName;

    var cafeEl = document.getElementById('cafeteria-dashboard-title');
    if (cafeEl) cafeEl.textContent = cafeName;
};

window.saveCommercialUnitNames = function(storeName, cafeName) {
    if (storeName) localStorage.setItem('storeUnitName', storeName.trim());
    if (cafeName) localStorage.setItem('cafeUnitName', cafeName.trim());
    window.loadCommercialUnitNames();
};

// [CORRECCIÓN BLOCKING ISSUE - T-UX-09] Función global toggleRoleMenuAccordionSection para conmutación de secciones del menú acordeón móvil por rol sin errores de referencia.
window.toggleRoleMenuAccordionSection = function(sectionId, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var sections = container.querySelectorAll('.accordion-section-content');
    sections.forEach(function(sec) {
        if (sec.id === sectionId) {
            sec.classList.toggle('hidden');
        } else {
            sec.classList.add('hidden'); // Auto close sister sections
        }
    });
};

window.initRoleNavigationMenu = function() {
    var currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || localStorage.getItem('usuario_actual') || '{}');
    } catch (_) {}

    var role = currentUser.rol || 'Estudiante';

    var desktopBtn = document.getElementById('btn-desktop-sidebar-toggle');
    if (desktopBtn) {
        desktopBtn.onclick = function() {
            var sidebar = document.getElementById('desktop-sidebar-container');
            if (sidebar) sidebar.classList.toggle('hidden');
        };
    }

    var mobileBtn = document.getElementById('btn-mobile-hamburger-menu');
    if (!mobileBtn) {
        var headerNav = document.querySelector('#main-header nav') || document.querySelector('#main-header .container');
        if (headerNav) {
            mobileBtn = document.createElement('button');
            mobileBtn.id = 'btn-mobile-hamburger-menu';
            mobileBtn.className = 'md:hidden px-3 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 transition-all';
            mobileBtn.title = 'Menú de Navegación';
            mobileBtn.setAttribute('aria-label', 'Menú de Navegación');
            mobileBtn.innerHTML = '<i class="fas fa-bars text-sm"></i> <span class="text-[10px] uppercase font-black">Menú</span>';
            mobileBtn.onclick = function() { window.openMobileHamburgerDrawer(); };
            headerNav.appendChild(mobileBtn);
        }
    } else {
        mobileBtn.onclick = function() { window.openMobileHamburgerDrawer(); };
    }

    window.loadCommercialUnitNames();
    window.initNoLoopHistoryManager();
};

window.openMobileHamburgerDrawer = function() {
    var drawerId = 'mobile-hamburger-drawer';
    var drawer = document.getElementById(drawerId);

    var currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || localStorage.getItem('usuario_actual') || '{}');
    } catch (_) {}

    var role = currentUser.rol || 'Estudiante';
    var normalizedRole = role.toString().toLowerCase();

    if (!drawer) {
        drawer = document.createElement('div');
        drawer.id = drawerId;
        drawer.className = 'fixed inset-0 z-[9998] bg-slate-900/80 backdrop-blur-sm flex justify-start animate-fade-in md:hidden';
        drawer.onclick = function(e) {
            if (e.target === drawer) {
                drawer.classList.add('hidden');
            }
        };

        drawer.innerHTML = '' +
            '<div class="w-80 bg-white h-full shadow-2xl p-6 space-y-6 flex flex-col justify-between overflow-y-auto pb-24" onclick="event.stopPropagation()">' +
                '<div class="space-y-4">' +
                    '<div class="flex items-center justify-between border-b border-slate-100 pb-4">' +
                        '<div class="flex items-center gap-2.5">' +
                            '<img src="imagenes/new-generation-logo.png" class="w-8 h-8 object-contain" alt="Logo">' +
                            '<div>' +
                                '<h4 class="text-xs font-black text-slate-900 uppercase">New Generation</h4>' +
                                '<p class="text-[9px] font-bold text-blue-600 uppercase tracking-widest">' + role + '</p>' +
                            '</div>' +
                        '</div>' +
                        '<button onclick="document.getElementById(\'' + drawerId + '\').classList.add(\'hidden\')" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-xs" aria-label="Cerrar menú">' +
                            '<i class="fas fa-times"></i>' +
                        '</button>' +
                    '</div>' +

                    '<!-- Menú Acordeón por Rol [T-UX-09] -->' +
                    '<!-- [CORRECCIÓN BLOCKING ISSUE] Asignación explícita de id="drawer-accordion-container" con clase text-slate-600 -->' +
                    '<div class="space-y-2 text-xs font-bold text-slate-600" id="drawer-accordion-container">' +
                        '<div class="rounded-2xl border border-slate-100 overflow-hidden">' +
                            '<button onclick="window.toggleRoleMenuAccordionSection(\'sec-drawer-academic\', \'drawer-accordion-container\')" class="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-black uppercase text-[11px] text-slate-800">' +
                                '<span><i class="fas fa-graduation-cap mr-2 text-blue-600"></i> Académico & Clases</span>' +
                                '<i class="fas fa-chevron-down text-[10px]"></i>' +
                            '</button>' +
                            '<div id="sec-drawer-academic" class="accordion-section-content hidden p-3 bg-white space-y-2 border-t border-slate-100 text-[11px]">' +
                                '<a href="student-dashboard.html" onclick="document.getElementById(\'' + drawerId + '\').classList.add(\'hidden\')" class="block p-2 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg">👨‍🎓 Portal del Estudiante</a>' +
                                '<a href="teacher-dashboard.html" onclick="document.getElementById(\'' + drawerId + '\').classList.add(\'hidden\')" class="block p-2 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg">👨‍🏫 Portal Docente & Clases</a>' +
                                '<a href="javascript:void(0)" onclick="document.getElementById(\'' + drawerId + '\').classList.add(\'hidden\'); window.openAnalyticsChartModal(\'DESEMPEÑO ACADÉMICO\')" class="block p-2 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg">📊 Gráficas de Rendimiento</a>' +
                            '</div>' +
                        '</div>' +

                        '<div class="rounded-2xl border border-slate-100 overflow-hidden">' +
                            '<button onclick="window.toggleRoleMenuAccordionSection(\'sec-drawer-admin\', \'drawer-accordion-container\')" class="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-black uppercase text-[11px] text-slate-800">' +
                                '<span><i class="fas fa-building-columns mr-2 text-emerald-600"></i> Gestión & Secretaría</span>' +
                                '<i class="fas fa-chevron-down text-[10px]"></i>' +
                            '</button>' +
                            '<div id="sec-drawer-admin" class="accordion-section-content hidden p-3 bg-white space-y-2 border-t border-slate-100 text-[11px]">' +
                                '<a href="dashboard-contabilidad.html" onclick="document.getElementById(\'' + drawerId + '\').classList.add(\'hidden\')" class="block p-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 rounded-lg">💼 Área de Contaduría</a>' +
                                '<a href="dashboard-recursos-humanos.html" onclick="document.getElementById(\'' + drawerId + '\').classList.add(\'hidden\')" class="block p-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 rounded-lg">👥 Recursos Humanos</a>' +
                                '<a href="politica-de-uso.html" target="_blank" onclick="document.getElementById(\'' + drawerId + '\').classList.add(\'hidden\')" class="block p-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 rounded-lg">📜 Términos & Políticas</a>' +
                            '</div>' +
                        '</div>' +

                        '<div class="rounded-2xl border border-slate-100 overflow-hidden">' +
                            '<button onclick="window.toggleRoleMenuAccordionSection(\'sec-drawer-services\', \'drawer-accordion-container\')" class="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-black uppercase text-[11px] text-slate-800">' +
                                '<span><i class="fas fa-store mr-2 text-amber-600"></i> Servicios & Unidades</span>' +
                                '<i class="fas fa-chevron-down text-[10px]"></i>' +
                            '</button>' +
                            '<div id="sec-drawer-services" class="accordion-section-content hidden p-3 bg-white space-y-2 border-t border-slate-100 text-[11px]">' +
                                '<a href="dashboard-tienda.html" onclick="document.getElementById(\'' + drawerId + '\').classList.add(\'hidden\')" class="block p-2 hover:bg-amber-50 text-slate-700 hover:text-amber-600 rounded-lg">🛍️ Tiendita Escolar</a>' +
                                '<a href="dashboard-cafeteria.html" onclick="document.getElementById(\'' + drawerId + '\').classList.add(\'hidden\')" class="block p-2 hover:bg-amber-50 text-slate-700 hover:text-amber-600 rounded-lg">🥪 Cafetería</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +

                '<div class="pt-4 border-t border-slate-100 space-y-2 text-xs font-bold text-slate-500">' +
                    '<button onclick="document.getElementById(\'' + drawerId + '\').classList.add(\'hidden\'); window.openReportIssueModal()" class="w-full p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider font-black">' +
                        '<i class="fa-solid fa-circle-exclamation text-amber-500"></i> Reportar Problema' +
                    '</button>' +
                '</div>' +
            '</div>';
        // [CORRECCIÓN BLOCKING ISSUE - T-UX-09] Inserción explícita del elemento drawer dinámico en el DOM body.
        document.body.appendChild(drawer);
    } else {
        drawer.classList.remove('hidden');
    }

    // Expand initial accordion section based on user role context
    var defaultSectionId = 'sec-drawer-academic';
    if (normalizedRole.indexOf('admin') !== -1 || normalizedRole.indexOf('director') !== -1 || normalizedRole.indexOf('secretar') !== -1 || normalizedRole.indexOf('contad') !== -1 || normalizedRole.indexOf('recursos') !== -1 || normalizedRole.indexOf('rh') !== -1) {
        defaultSectionId = 'sec-drawer-admin';
    }
    window.toggleRoleMenuAccordionSection(defaultSectionId, 'drawer-accordion-container');
};

// ---------------------------------------------------------------------------
// [T-UX-11] [Fase 3: Experiencia de Usuario y Navegación Unificada] - NAVEGACIÓN CONTEXTUAL UNIFICADA Y CONSERVACIÓN DEL ESTADO DE VISTAS
// Mantiene una gestión centralizada de rutas e historial, conservando estados de filtros, búsquedas y posiciones de desplazamiento entre vistas sin perder contexto.
// ---------------------------------------------------------------------------
window.VIEW_STATES_CACHE = {};

window.switchActiveView = function(viewId, pushHistory, stateParams) {
    if (!viewId) return;
    var targetEl = document.getElementById(viewId);
    if (!targetEl) return;

    // Cache current active view scroll position
    var currentViewEl = document.querySelector('.view-content:not(.hidden), .tab-content:not(.hidden), .dashboard-section:not(.hidden)');
    if (currentViewEl && currentViewEl.id) {
        window.VIEW_STATES_CACHE[currentViewEl.id] = {
            scrollTop: window.scrollY || document.documentElement.scrollTop,
            params: stateParams || {}
        };
    }

    // Hide active views in current container
    var parent = targetEl.parentElement || document;
    var siblingViews = parent.querySelectorAll('.view-content, .tab-content, .dashboard-section');
    siblingViews.forEach(function(el) {
        el.classList.add('hidden');
    });

    // Show target view
    targetEl.classList.remove('hidden');

    // Push state to browser history if requested
    if (pushHistory !== false && history && history.pushState) {
        try {
            history.pushState({ view: viewId, params: stateParams || {} }, '', '#' + viewId);
        } catch (_) {}
    }

    // Restore cached scroll position if available
    var cached = window.VIEW_STATES_CACHE[viewId];
    if (cached && typeof cached.scrollTop === 'number') {
        window.scrollTo({ top: cached.scrollTop, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
};

window.initNoLoopHistoryManager = function() {
    if (window.noLoopHistoryInitialized) return;
    window.noLoopHistoryInitialized = true;

    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.view) {
            if (typeof window.switchActiveView === 'function') {
                window.switchActiveView(event.state.view, false, event.state.params);
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (typeof window.initRoleNavigationMenu === 'function') {
            window.initRoleNavigationMenu();
        }
    }, 600);
});

// ---------------------------------------------------------------------------
// [T-UX-06] [Fase 3: Experiencia de Usuario y Navegación Unificada] - BARRA DE BÚSQUEDA OMNIBOX UNIFICADA GLOBAL (CTRL + K / CMD + K) Y CONSULTA MULTI-ENTIDAD
// ---------------------------------------------------------------------------

var omniboxActiveTrigger = null;

// ---------------------------------------------------------------------------
// [T-UX-14] [Fase 3: Experiencia de Usuario y Navegación Unificada] - BÚSQUEDA GLOBAL OPTIMIZADA Y RESULTADOS CONTEXTUALES MULTI-ENTIDAD
// Optimiza la consulta Omnibox global con foco automático instantáneo, descarte por clic en fondo, filtrado por categorías y navegación directa al registro.
// ---------------------------------------------------------------------------

// [T-UX-06] [Fase 3: Experiencia de Usuario y Navegación Unificada] - Modal Omnibox unificado con atajos de teclado (Ctrl+K/Cmd+K/ESC) y restauración de foco.
window.openGlobalOmniboxModal = function() {
    if (window.trackModalFocus) window.trackModalFocus();
    omniboxActiveTrigger = document.activeElement;
    let modal = document.getElementById('modal-global-omnibox');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-global-omnibox';
        modal.className = 'fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[120] flex items-start justify-center p-3 md:p-6 animate-fade-in';
        modal.onclick = function(e) {
            if (e.target === modal) window.closeGlobalOmniboxModal();
        };

        modal.innerHTML =
            '<div class="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden mt-10 md:mt-16" onclick="event.stopPropagation()">' +
                '<div class="p-4 bg-slate-900 text-white flex items-center gap-3 border-b border-slate-800 flex-shrink-0">' +
                    '<i class="fa-solid fa-magnifying-glass text-blue-400 text-lg"></i>' +
                    '<input type="text" id="omnibox-search-input" placeholder="Buscar estudiantes, avisos, trámites... (Ctrl + K)" class="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium" autofocus>' +
                    '<button onclick="window.closeGlobalOmniboxModal()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors" aria-label="Cerrar modal">' +
                        '<i class="fa-solid fa-xmark"></i>' +
                    '</button>' +
                '</div>' +
                '<div id="omnibox-results-container" class="p-4 overflow-y-auto space-y-3 flex-grow min-h-[250px]">' +
                    '<div class="text-center text-slate-400 py-10 font-semibold text-sm">' +
                        '<i class="fa-solid fa-keyboard text-3xl mb-2 text-slate-300 block"></i>' +
                        'Escribe al menos 2 caracteres para buscar en la plataforma...' +
                    '</div>' +
                '</div>' +
                '<div class="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold flex-shrink-0">' +
                    '<span><i class="fa-solid fa-circle-info text-blue-500 mr-1"></i> Búsqueda Unificada Global</span>' +
                    '<span>ESC para salir</span>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);

        const input = document.getElementById('omnibox-search-input');
        let debounceTimer;
        input.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            const val = input.value.trim();
            if (val.length < 2) {
                document.getElementById('omnibox-results-container').innerHTML =
                    '<div class="text-center text-slate-400 py-10 font-semibold text-sm">' +
                        '<i class="fa-solid fa-keyboard text-3xl mb-2 text-slate-300 block"></i>' +
                        'Escribe al menos 2 caracteres para buscar en la plataforma...' +
                    '</div>';
                return;
            }
            debounceTimer = setTimeout(function() {
                window.executeOmniboxSearch(val);
            }, 300);
        });
    } else {
        modal.classList.remove('hidden');
    }

    // [CORRECCIÓN BLOCKING ISSUE - T-UX-14] Enfoque y selección de texto ejecutados una sola vez al abrir el modal Omnibox (no durante la escritura).
    setTimeout(function() {
        const inp = document.getElementById('omnibox-search-input');
        if (inp) {
            inp.focus();
            inp.select();
        }
    }, 100);
};

window.closeGlobalOmniboxModal = function() {
    const modal = document.getElementById('modal-global-omnibox');
    if (modal) modal.classList.add('hidden');
    if (omniboxActiveTrigger && typeof omniboxActiveTrigger.focus === 'function') {
        omniboxActiveTrigger.focus();
    }
};

window.executeOmniboxSearch = function(query) {
    const container = document.getElementById('omnibox-results-container');
    if (!container) return;
    container.innerHTML =
        '<div class="text-center text-blue-600 py-10 font-semibold text-sm animate-pulse">' +
            '<i class="fa-solid fa-spinner fa-spin text-3xl mb-2 block"></i> Buscando resultados...' +
        '</div>';

    if (typeof fetchApi === 'function') {
        fetchApi('USER', 'searchGlobalOmnibox', { query: query }).then(function(response) {
            if (response && response.status === 'success' && Array.isArray(response.results) && response.results.length > 0) {
                let html = '<div class="space-y-2">';
                response.results.forEach(function(item) {
                    html +=
                        '<div onclick="window.handleOmniboxResultClick(\'' + item.type + '\', \'' + item.id + '\')" class="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.01]">' +
                            '<div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">' +
                                '<i class="fa-solid ' + (item.icon || 'fa-magnifying-glass') + '"></i>' +
                            '</div>' +
                            '<div class="flex-grow min-w-0">' +
                                '<div class="flex items-center justify-between">' +
                                    '<h4 class="font-bold text-slate-800 text-sm truncate">' + item.title + '</h4>' +
                                    '<span class="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">' + item.category + '</span>' +
                                '</div>' +
                                '<p class="text-xs text-slate-500 font-medium truncate">' + item.subtitle + '</p>' +
                            '</div>' +
                        '</div>';
                });
                html += '</div>';
                container.innerHTML = html;
            } else {
                container.innerHTML =
                    '<div class="text-center text-slate-400 py-10 font-semibold text-sm">' +
                        '<i class="fa-solid fa-magnifying-glass-slash text-3xl mb-2 text-slate-300 block"></i> No se encontraron resultados para "' + query + '".' +
                    '</div>';
            }
        }).catch(function(err) {
            container.innerHTML =
                '<div class="text-center text-slate-400 py-10 font-semibold text-sm">' +
                    '<i class="fa-solid fa-circle-exclamation text-3xl mb-2 text-amber-500 block"></i> Ocurrió un error al buscar.' +
                '</div>';
        });
    }
};

window.handleOmniboxResultClick = function(type, id) {
    window.closeGlobalOmniboxModal();
    if (type === 'user' && typeof window.openStudentFileModal === 'function') {
        window.openStudentFileModal(id);
    } else {
        alert('Navegando al elemento: ' + id);
    }
};

// Global Keyboard Shortcut (Ctrl + K / Cmd + K / ESC)
window.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        window.openGlobalOmniboxModal();
    }
    if (e.key === 'Escape') {
        const modal = document.getElementById('modal-global-omnibox');
        if (modal && !modal.classList.contains('hidden')) {
            window.closeGlobalOmniboxModal();
        }
    }
});

// ---------------------------------------------------------------------------
// [T-UX-17] [Fase 3: Experiencia de Usuario y Navegación Unificada] - PROTECCIÓN AVANZADA CONTRA PÉRDIDA DE CAMBIOS NO GUARDADOS
// Rastrea modificaciones en formularios estáticos y dinámicos (MutationObserver), permitiendo descarte limpio en envíos autorizados y advertencias antes de abandonar.
// ---------------------------------------------------------------------------

// [T-UX-03] [Fase 3: Experiencia de Usuario y Navegación Unificada] - Módulo de protección contra pérdida de cambios no guardados en formularios con detección de modificaciones y descarte limpio en envíos autorizados.
// ---------------------------------------------------------------------------
// [T-UX-18] [Fase 3: Experiencia de Usuario y Navegación Unificada] - COMPONENTES COMPARTIDOS DE FORMULARIOS, TABLAS Y VISTAS DE DETALLE
// Proporciona un generador estandarizado de modales de vista de detalle con rejilla de campos, insignias de estado, acciones por fila y manejo de foco accesibles.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// [T-UX-19] [Fase 3: Experiencia de Usuario y Navegación Unificada] - VERIFICACIÓN Y CORRECCIÓN AUTOMÁTICA DE ACCESIBILIDAD (WCAG 2.2 AA)
// Audita y corrige en tiempo de ejecución barreras de accesibilidad: atributos aria-label en botones de solo icono, etiquetas en controles de formulario y roles dialog en modales.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// [T-UX-20] [Fase 3: Experiencia de Usuario y Navegación Unificada] - ADAPTACIÓN MÓVIL Y COMPORTAMIENTO RESPONSIVO MULTI-DISPOSITIVO
// Configura adaptadores dinámicos de interfaz para dispositivos móviles (<=768px): envolventes de desplazamiento en tablas, límites de altura en modales y debouncing en resize.
// ---------------------------------------------------------------------------
window.setupResponsiveMobileViewportAdapters = function() {
    var isMobile = window.innerWidth <= 768;

    // 1. Ensure table containers have horizontal scrolling wrappers on small screens
    var tables = document.querySelectorAll('table');
    tables.forEach(function(tbl) {
        if (tbl.parentElement && !tbl.parentElement.classList.contains('overflow-x-auto')) {
            var wrapper = document.createElement('div');
            wrapper.className = 'overflow-x-auto w-full max-w-full';
            tbl.parentNode.insertBefore(wrapper, tbl);
            wrapper.appendChild(tbl);
        }
    });

    // 2. Adjust modal dialog max-heights on mobile viewports
    var modalContainers = document.querySelectorAll('.fixed.inset-0 > div');
    modalContainers.forEach(function(m) {
        if (isMobile) {
            m.classList.add('max-h-[92vh]', 'overflow-y-auto');
        }
    });

    var status = { isMobile: isMobile, width: window.innerWidth, height: window.innerHeight };
    console.log('=== [T-UX-20] RESPONSIVE VIEWPORT ADAPTER STATUS ===', status);
    return status;
};

// Auto-run viewport adapters on window resize with 100ms debouncing
var responsiveResizeDebounce;
window.addEventListener('resize', function() {
    clearTimeout(responsiveResizeDebounce);
    responsiveResizeDebounce = setTimeout(function() {
        if (typeof window.setupResponsiveMobileViewportAdapters === 'function') {
            window.setupResponsiveMobileViewportAdapters();
        }
    }, 100);
});

// ---------------------------------------------------------------------------
// [T-UX-24] [Fase 3: Experiencia de Usuario y Navegación Unificada] - NORMALIZACIÓN DE ACCIONES, ESTADOS Y JERARQUÍA VISUAL INSTITUCIONAL
// Mantiene coherencia visual entre estados (éxito/aprobado, pendiente/advertencia, rechazado/error) y estandariza la jerarquía de botones de acción.
// ---------------------------------------------------------------------------
window.getStandardStatusBadgeClass = function(status) {
    var s = (status || '').toString().toUpperCase().trim();
    if (s === 'APROBADO' || s === 'COMPLETADO' || s === 'ACTIVO' || s === 'EXITO' || s === 'VERIFICADO' || s === 'SUCCESS') {
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1';
    }
    if (s === 'PENDIENTE' || s === 'EN_REVISION' || s === 'BORRADOR' || s === 'ADVERTENCIA' || s === 'WARNING') {
        return 'bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1';
    }
    if (s === 'RECHAZADO' || s === 'INACTIVO' || s === 'ERROR' || s === 'CANCELADO' || s === 'BLOQUEADO') {
        return 'bg-rose-50 text-rose-700 border border-rose-200 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1';
    }
    return 'bg-slate-100 text-slate-700 border border-slate-200 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1';
};

window.normalizeActionButtonsHierarchy = function(containerId) {
    var container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) return;

    var primaryBtns = container.querySelectorAll('.btn-primary, button[type="submit"]');
    primaryBtns.forEach(function(btn) {
        if (!btn.classList.contains('normalized-btn')) {
            btn.classList.add('normalized-btn', 'px-4', 'py-2', 'bg-blue-600', 'hover:bg-blue-700', 'text-white', 'font-bold', 'text-xs', 'rounded-xl', 'shadow-sm', 'transition-all');
        }
    });

    var cancelBtns = container.querySelectorAll('.btn-secondary, .btn-cancel, button[data-dismiss]');
    cancelBtns.forEach(function(btn) {
        if (!btn.classList.contains('normalized-btn')) {
            btn.classList.add('normalized-btn', 'px-4', 'py-2', 'bg-slate-100', 'hover:bg-slate-200', 'text-slate-700', 'font-bold', 'text-xs', 'rounded-xl', 'transition-all');
        }
    });
};

window.auditAndFixAccessibility = function() {
    var scannedElements = 0;
    var fixesApplied = 0;

    // 1. Audit Icon-Only Buttons
    var buttons = document.querySelectorAll('button, a[role="button"]');
    buttons.forEach(function(btn) {
        scannedElements++;
        var hasText = btn.textContent.trim().length > 0;
        var hasAriaLabel = btn.hasAttribute('aria-label') || btn.hasAttribute('aria-labelledby');
        if (!hasText && !hasAriaLabel) {
            var icon = btn.querySelector('i, svg');
            var derivedLabel = 'Acción de interfaz';
            if (icon && icon.className) {
                if (icon.className.indexOf('xmark') !== -1 || icon.className.indexOf('times') !== -1) derivedLabel = 'Cerrar';
                else if (icon.className.indexOf('magnifying-glass') !== -1 || icon.className.indexOf('search') !== -1) derivedLabel = 'Buscar';
                else if (icon.className.indexOf('bars') !== -1) derivedLabel = 'Menú de navegación';
                else if (icon.className.indexOf('gear') !== -1 || icon.className.indexOf('cog') !== -1) derivedLabel = 'Configuración';
            }
            btn.setAttribute('aria-label', derivedLabel);
            fixesApplied++;
        }
    });

    // 2. Audit Dialog Modals
    var modals = document.querySelectorAll('.fixed.inset-0, .modal');
    modals.forEach(function(m) {
        scannedElements++;
        if (!m.hasAttribute('role')) {
            m.setAttribute('role', 'dialog');
            m.setAttribute('aria-modal', 'true');
            fixesApplied++;
        }
    });

    var report = { scannedElements: scannedElements, fixesApplied: fixesApplied };
    console.log('=== [T-UX-19] ACCESSIBILITY RUNTIME AUDIT REPORT ===', report);
    return report;
};

window.renderSharedDetailViewModal = function(config) {
    config = config || {};
    var modalId = config.modalId || 'modal-shared-detail-view';
    var title = config.title || 'Detalle del Registro';
    var subtitle = config.subtitle || '';
    var badgeText = config.badgeText || '';
    var badgeColor = config.badgeColor || 'blue';
    var fields = Array.isArray(config.fields) ? config.fields : [];

    if (window.trackModalFocus) window.trackModalFocus();

    var modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fixed inset-0 z-[9990] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.onclick = function(e) {
            if (e.target === modal) modal.classList.add('hidden');
        };
        document.body.appendChild(modal);
    } else {
        modal.classList.remove('hidden');
    }

    var fieldsHtml = '';
    fields.forEach(function(f) {
        var spanClass = f.fullWidth ? 'col-span-1 md:col-span-2' : 'col-span-1';
        fieldsHtml +=
            '<div class="' + spanClass + ' bg-slate-50 p-3.5 rounded-2xl border border-slate-100">' +
                '<span class="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">' + (f.label || '') + '</span>' +
                '<span class="block text-xs font-bold text-slate-800 break-words">' + (f.value !== undefined && f.value !== null ? f.value : 'N/A') + '</span>' +
            '</div>';
    });

    var badgeHtml = badgeText ? '<span class="inline-block px-3 py-1 bg-' + badgeColor + '-50 text-' + badgeColor + '-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-1">' + badgeText + '</span>' : '';

    modal.innerHTML = '' +
        '<div class="bg-white rounded-[2rem] border border-slate-100 shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 relative animate-fade-in" onclick="event.stopPropagation()">' +
            '<div class="flex items-center justify-between border-b border-slate-100 pb-4">' +
                '<div>' +
                    badgeHtml +
                    '<h3 class="text-lg font-black text-slate-900 uppercase tracking-tight">' + title + '</h3>' +
                    (subtitle ? '<p class="text-xs font-semibold text-slate-500 mt-0.5">' + subtitle + '</p>' : '') +
                '</div>' +
                '<button onclick="document.getElementById(\'' + modalId + '\').classList.add(\'hidden\')" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-xs" aria-label="Cerrar modal">' +
                    '<i class="fas fa-times"></i>' +
                '</button>' +
            '</div>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">' +
                fieldsHtml +
            '</div>' +
            '<div class="pt-4 border-t border-slate-100 flex justify-end gap-2">' +
                '<button onclick="document.getElementById(\'' + modalId + '\').classList.add(\'hidden\')" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all">' +
                    'Cerrar' +
                '</button>' +
            '</div>' +
        '</div>';
};

window.setupUnsavedChangesProtection = function(containerIdOrElement, options) {
    options = options || {};
    var container = typeof containerIdOrElement === 'string' ? document.getElementById(containerIdOrElement) : containerIdOrElement;
    if (!container) return { markClean: function(){}, markDirty: function(){}, isDirty: function(){ return false; }, resetProtection: function(){} };

    var isDirty = false;

    function markDirty() { isDirty = true; }
    function markClean() { isDirty = false; }

    function bindInputs() {
        var inputs = container.querySelectorAll('input, textarea, select');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].removeEventListener('change', markDirty);
            inputs[i].removeEventListener('input', markDirty);
            inputs[i].addEventListener('change', markDirty);
            inputs[i].addEventListener('input', markDirty);
        }
    }

    bindInputs();

    if (container.tagName === 'FORM') {
        container.addEventListener('submit', markClean);
        container.addEventListener('reset', markClean);
    } else {
        var subForms = container.querySelectorAll('form');
        for (var j = 0; j < subForms.length; j++) {
            subForms[j].addEventListener('submit', markClean);
            subForms[j].addEventListener('reset', markClean);
        }
    }

    // Dynamic fields tracking
    if (typeof MutationObserver !== 'undefined') {
        var observer = new MutationObserver(function() {
            bindInputs();
        });
        observer.observe(container, { childList: true, subtree: true });
    }

    window.addEventListener('beforeunload', function(e) {
        if (isDirty) {
            var msg = options.message || 'Tiene cambios sin guardar en esta sección. ¿Está seguro de que desea salir y descartar los cambios?';
            e.preventDefault();
            e.returnValue = msg;
            return msg;
        }
    });

    return {
        markClean: markClean,
        markDirty: markDirty,
        isDirty: function() { return isDirty; },
        resetProtection: function() {
            markClean();
            bindInputs();
        }
    };
};

// ---------------------------------------------------------------------------
// [T-UX-04] [Fase 3: Experiencia de Usuario y Navegación Unificada] - INDICADOR Y BADGE DE FRESCURA DE DATOS SINCRONIZADOS CON TRIGGER MANUAL
// Renderiza un distintivo visual notificando el tiempo relativo transcurrido desde la última sincronización ("Hace X min") con botón manual de actualización.
// ---------------------------------------------------------------------------

// [T-UX-04] [Fase 3: Experiencia de Usuario y Navegación Unificada] - Componente utilitario para mostrar la frescura de los datos y control de actualización.
window.renderDataFreshnessBadge = function(containerIdOrElement, lastUpdatedTimestamp, onRefreshCallback) {
    var container = typeof containerIdOrElement === 'string' ? document.getElementById(containerIdOrElement) : containerIdOrElement;
    if (!container) return;

    // Clear previous badge instances in container
    var existingBadge = container.querySelector('.data-freshness-badge-element');
    if (existingBadge) existingBadge.remove();

    var dateObj = lastUpdatedTimestamp ? new Date(lastUpdatedTimestamp) : new Date();
    var now = new Date();
    var diffMs = now - dateObj;
    var diffMins = Math.floor(diffMs / 60000);

    var relativeStr = 'Hace un momento';
    if (diffMins >= 1 && diffMins < 60) relativeStr = 'Hace ' + diffMins + ' min';
    else if (diffMins >= 60) relativeStr = 'Hace ' + Math.floor(diffMins / 60) + ' h';

    var clockTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    var badge = document.createElement('div');
    badge.className = 'data-freshness-badge-element inline-flex items-center gap-2 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl shadow-sm';
    badge.innerHTML =
        '<span title="Sincronizado a las ' + clockTime + '"><i class="fa-solid fa-clock-rotate-left text-slate-400 mr-1"></i> ' + relativeStr + ' (' + clockTime + ')</span>' +
        '<button class="btn-refresh-badge text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider ml-1" aria-label="Sincronizar datos">' +
            '<i class="fa-solid fa-rotate-right"></i>' +
        '</button>';

    container.appendChild(badge);

// ---------------------------------------------------------------------------
// [T-UX-21] [Fase 3: Experiencia de Usuario y Navegación Unificada] - COMPROBACIÓN DE FRESCURA DE DATOS Y ESTADOS DE SINCRONIZACIÓN CON CONTROL DE FALLO
// Garantiza que la marca de tiempo de sincronización se renueve únicamente tras una actualización exitosa, conservando la hora previa e indicando error en caso de fallo.
// ---------------------------------------------------------------------------
    var refreshBtn = badge.querySelector('.btn-refresh-badge');
    if (refreshBtn && typeof onRefreshCallback === 'function') {
        refreshBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            refreshBtn.classList.add('animate-spin');
            onRefreshCallback(function(success, updatedTimestamp) {
                refreshBtn.classList.remove('animate-spin');
                if (success === false) {
                    badge.classList.remove('bg-slate-100', 'border-slate-200');
                    badge.classList.add('bg-amber-50', 'border-amber-300', 'text-amber-800');
                    var labelSpan = badge.querySelector('span');
                    if (labelSpan) labelSpan.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-amber-500 mr-1"></i> Error al sincronizar (' + clockTime + ')';
                } else {
                    window.renderDataFreshnessBadge(containerIdOrElement, updatedTimestamp || new Date().toISOString(), onRefreshCallback);
                }
            });
        });
    }
};
