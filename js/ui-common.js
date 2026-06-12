/**
 * QuizPro v7.5 - Common UI Module (Manual ES5 Remediation)
 * Strict ES5 Implementation with Namespacing and IIFE.
 */
var QuizProApp = window.QuizProApp || {};

(function(app) {

    app.setupCommonUI = function() {
        var mainHeader = document.getElementById('main-header');
        var openProfileBtn = document.getElementById('open-profile-btn');
        var mobileProfileBtn = document.getElementById('mobile-profile-btn-nav');

        if (mainHeader) {
            mainHeader.classList.remove('header-hidden');
        }

        var lastScrollTop = 0;
        var scrollThreshold = 10;

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

        app.openMobileMenu = function(section) {
            window.openAcademicMenu();
        };

        app.closeMobileMenu = function() {
            QuizProApp.closeAcademicMenu();
        };

        app.openProfileModal = function(pushState) {
            if (pushState === undefined) pushState = true;
            var modal = document.getElementById('profile-modal');
            if (!modal) return;

            var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            var user = userRaw ? JSON.parse(userRaw) : null;

            if (!user) {
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

            var nameEl = document.getElementById('profile-nombre');
            var emailEl = document.getElementById('profile-email');
            var phoneEl = document.getElementById('profile-telefono');
            var listEl = document.getElementById('profile-numeroLista');
            var listContainer = document.getElementById('profile-numeroLista-container');

            if (nameEl) nameEl.value = user.nombre || '';
            if (emailEl) emailEl.value = user.email || '';
            if (phoneEl) phoneEl.value = user.telefono || '';
            if (listEl) listEl.value = user.numeroLista || '';

            if (listContainer) {
                if (user.rol === 'Profesor') listContainer.classList.add('hidden');
                else listContainer.classList.remove('hidden');
            }

            modal.classList.remove('hidden');
            if (QuizProApp.closeAcademicMenu) QuizProApp.closeAcademicMenu();
            if (pushState) {
                history.pushState({ type: 'modal-close', modalId: 'profile-modal' }, '');
            }
        };

        app.closeProfileModal = function(doPop) {
            if (doPop === undefined) doPop = true;
            var modal = document.getElementById('profile-modal');
            if (modal) modal.classList.add('hidden');
            if (doPop && history.state && history.state.modalId === 'profile-modal') {
                history.back();
            }
        };

        if (openProfileBtn) openProfileBtn.addEventListener('click', function(e) { e.preventDefault(); window.openProfileModal(); });
        if (mobileProfileBtn) mobileProfileBtn.addEventListener('click', function(e) { e.preventDefault(); window.openProfileModal(); });

        var closeBtn = document.getElementById('close-profile-modal');
        var cancelBtn = document.getElementById('cancel-profile-btn');
        if (closeBtn) closeBtn.onclick = function() { QuizProApp.closeProfileModal(); };
        if (cancelBtn) cancelBtn.onclick = function() { QuizProApp.closeProfileModal(); };

        app.handleLogout = function() {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        };

        var portalLink = document.getElementById('nav-portal-link');
        var mobilePortalLink = document.getElementById('mobile-portal-link');
        var currentUserRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

        if (currentUser) {
            var dest = currentUser.rol === 'Profesor' ? 'teacher-dashboard.html' : 'student-dashboard.html';
            if (portalLink) portalLink.href = dest;
            if (mobilePortalLink) mobilePortalLink.href = dest;
        }

        var yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();

        QuizProApp.renderCommonNav();

        document.dispatchEvent(new CustomEvent('common-ui-ready'));

        var handlePopState = function(event) {
            var state = event.state;

            if (!state || (state.type !== 'modal-close' && state.type !== 'academic-menu')) {
                var academicModal = document.getElementById('academic-menu-modal');
                if (academicModal && !academicModal.classList.contains('hidden')) {
                    QuizProApp.closeAcademicMenu(false);
                }
                var profileModal = document.getElementById('profile-modal');
                if (profileModal && !profileModal.classList.contains('hidden')) {
                    QuizProApp.closeProfileModal(false);
                }
                var loginModal = document.getElementById('login-modal');
                if (loginModal) {
                    loginModal.classList.add('opacity-0', 'pointer-events-none');
                    var contentLogin = document.getElementById('login-modal-content');
                    if (contentLogin) contentLogin.classList.remove('scale-100');
                }
            }

            if (!state) return;

            if (state.type === 'dashboard-section') {
                var targetNav = document.getElementById(state.navId);
                var targetSection = document.getElementById(state.sectionId);
                if (targetNav && targetSection && QuizProApp.navigateTo) {
                    QuizProApp.navigateTo(targetSection, targetNav, false);
                }
            } else if (state.type === 'hierarchical-nav') {
                if (QuizProApp.syncNavWithState) {
                    QuizProApp.syncNavWithState(state);
                }
            } else if (state.type === 'academic-menu') {
                var modalAM = document.getElementById('academic-menu-modal');
                if (modalAM && modalAM.classList.contains('hidden')) {
                    window.openAcademicMenu(false);
                }
                if (state.level === 'root') {
                    QuizProApp.resetAcademicMenu(false);
                } else {
                    QuizProApp.renderHierarchyLevel(state.menuType, state.level, state.params, false);
                }
            } else if (state.type === 'modal-close') {
                if (state.modalId === 'academic-menu-modal') window.openAcademicMenu(false);
                if (state.modalId === 'profile-modal') window.openProfileModal(false);
            }

            if (state.scrollPos !== undefined) {
                window.scrollTo({ top: state.scrollPos, behavior: 'auto' });
            }
        };

        window.addEventListener('popstate', handlePopState);

        var handleDropdownOverflow = function() {
            var observer = new MutationObserver(function(mutations) {
                attachOverflowCheck();
            });

            var attachOverflowCheck = function() {
                var submenus = document.querySelectorAll('.group div[class*="absolute"]');
                for (var i = 0; i < submenus.length; i++) {
                    var menu = submenus[i];
                    var parent = menu.parentElement;
                    if (!parent || parent.getAttribute('data-ovf-checked') === "true") continue;

                    parent.setAttribute('data-ovf-checked', "true");
                    (function(m) {
                        parent.addEventListener('mouseenter', function() {
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
                                if (m.classList.contains('left-0')) {
                                    m.classList.remove('left-0');
                                    m.classList.add('right-0');
                                }
                            }
                        });
                    })(menu);
                }
            };

            var nav = document.querySelector('nav');
            if (nav) observer.observe(nav, { childList: true, subtree: true });
            attachOverflowCheck();
        };
        handleDropdownOverflow();

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

                if (typeof app.fetchApi !== 'function') {
                    alert('El servicio de conexión (api.js) no se ha cargado correctamente.');
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.textContent = originalText;
                    return;
                }

                app.fetchApi('USER', 'updateUserProfile', payload)
                    .then(function(result) {
                        if (result.status === 'success') {
                            var updatedUser = {};
                            for (var key in user) { updatedUser[key] = user[key]; }
                            for (var key in result.data) { updatedUser[key] = result.data[key]; }

                            localStorage.setItem('currentUser', JSON.stringify(updatedUser));

                            var nameParts = updatedUser.nombre.split(' ');
                            var firstName = nameParts[0];

                            var teacherNameEl = document.getElementById('teacher-name');
                            var studentNameEl = document.getElementById('student-name');
                            if (teacherNameEl) teacherNameEl.textContent = firstName;
                            if (studentNameEl) studentNameEl.textContent = firstName;

                            if (QuizProApp.renderWelcomeMessage) QuizProApp.renderWelcomeMessage();

                            alert('Perfil actualizado con éxito.');
                            var modal = document.getElementById('profile-modal');
                            if (modal) modal.classList.add('hidden');

                            document.getElementById('profile-password').value = '';
                            document.getElementById('profile-current-password').value = '';
                        } else {
                            alert('Atención: ' + result.message);
                        }
                    })
                    ["catch"](function(err) {
                        console.error("Critical Profile Error:", err);
                        alert('Error de conexión: No se pudo sincronizar con el servidor. Verifique su internet.');
                    })
                    ["finally"](function() {
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('btn-loading');
                        submitBtn.textContent = originalText;
                    });
            };
        }
    };

    app.convertDriveLink = function(driveLink) {
        if (!driveLink || typeof driveLink !== 'string') return '';
        if (driveLink.indexOf('lh3.googleusercontent.com') !== -1) return driveLink;

        var fileId = '';
        if (driveLink.indexOf('drive.google.com') !== -1) {
            var match = driveLink.match(/\/d\/([a-zA-Z0-9-_]+)/) ||
                        driveLink.match(/[?&]id=([a-zA-Z0-9-_]+)/);
            if (match && match[1]) fileId = match[1];
        } else if (driveLink.indexOf('http') === -1) {
            fileId = driveLink;
        }

        if (fileId) {
            return 'https://lh3.googleusercontent.com/d/' + fileId;
        }
        return driveLink;
    };

    app.checkSectionHelper = function(sectionsField, targetSection) {
            if (!sectionsField || !targetSection) return true;
            if (Array.isArray(sectionsField)) return sectionsField.indexOf(targetSection) !== -1;
            var parts = String(sectionsField).split(',');
            for (var i = 0; i < parts.length; i++) {
                if (parts[i].trim() === targetSection) return true;
            }
            return false;
        };

        app.handleHeaderAction = function(action) {
        if (action === 'show-activities') {
            if (QuizProApp.showMainContentSections) {
                QuizProApp.showMainContentSections();
                if (QuizProApp.renderActivityList) QuizProApp.renderActivityList();
            } else {
                window.location.href = 'index.html?action=show-activities';
            }
        }
        if (action === 'cursos' || action === 'contenido' || action === 'show-academic-menu') {
            window.openAcademicMenu();
        }
        if (QuizProApp.closeMobileMenu) QuizProApp.closeMobileMenu();
    };

    app.openAcademicMenu = function(pushState) {
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
                            '<button onclick="QuizProApp.closeAcademicMenu()" class="text-gray-400 hover:text-gray-600 p-2 transition-colors">' +
                                '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>' +
                            '</button>' +
                        '</div>' +

                        '<div class="grid grid-cols-1 gap-4" id="academic-menu-options">' +
                            '<button onclick="QuizProApp.showAcademicHierarchy(\'Presentaciones\')" class="group flex items-center gap-5 p-5 bg-blue-50/50 rounded-3xl hover:bg-blue-600 transition-all duration-300">' +
                                '<div class="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">' +
                                    '<i class="fas fa-desktop"></i>' +
                                '</div>' +
                                '<div class="text-left">' +
                                    '<h3 class="font-bold text-gray-900 group-hover:text-white transition-colors">Presentaciones</h3>' +
                                    '<p class="text-xs text-blue-600 group-hover:text-blue-100 transition-colors">Clases interactivas</p>' +
                                '</div>' +
                            '</button>' +

                            '<button onclick="QuizProApp.showAcademicHierarchy(\'Contenido\')" class="group flex items-center gap-5 p-5 bg-purple-50/50 rounded-3xl hover:bg-purple-600 transition-all duration-300">' +
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
                            '<button onclick="QuizProApp.resetAcademicMenu()" class="mb-6 flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] hover:text-blue-700 transition-colors">' +
                                '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>' +
                                'Regresar' +
                            '</button>' +
                            '<div id="hierarchy-title" class="mb-6">' +
                                '<h3 class="text-lg font-bold text-gray-900" id="hierarchy-label">Selecciona Grado</h3>' +
                                '<div class="h-1 w-12 bg-blue-600 rounded-full mt-1"></div>' +
                            '</div>' +
                            '<div id="hierarchy-options" class="flex flex-col gap-2 overflow-y-auto max-h-[350px] pr-2 scroll-minimalist">' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            document.body.appendChild(modal);
        }

        modal.classList.remove('hidden');
        setTimeout(function() { modal.classList.add('opacity-100'); }, 10);
        QuizProApp.resetAcademicMenu(false);

        if (pushState) {
            history.pushState({ type: 'modal-close', modalId: 'academic-menu-modal', scrollPos: scrollPos }, '');
        }
    };

    app.closeAcademicMenu = function(doPop) {
        if (doPop === undefined) doPop = true;
        var modal = document.getElementById('academic-menu-modal');
        if (modal) {
            modal.classList.remove('opacity-100');
            setTimeout(function() { modal.classList.add('hidden'); }, 300);
            if (doPop && history.state && history.state.modalId === 'academic-menu-modal') {
                history.back();
            }
        }
    };

    app.resetAcademicMenu = function(pushState) {
        if (pushState === undefined) pushState = true;
        document.getElementById('academic-menu-options').classList.remove('hidden');
        document.getElementById('hierarchy-navigation').classList.add('hidden');
        if (pushState) {
            history.pushState({ type: 'academic-menu', level: 'root', scrollPos: window.pageYOffset }, '');
        }
    };

    app.openAcademicHierarchy = function(type) {
        window.openAcademicMenu();
        QuizProApp.showAcademicHierarchy(type);
    };

    app.showAcademicHierarchy = function(type) {
        var options = document.getElementById('academic-menu-options');
        var nav = document.getElementById('hierarchy-navigation');
        var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}';
        var user = JSON.parse(userRaw);
        var isProfesor = user.rol === 'Profesor';

        if (options) options.classList.add('hidden');
        if (nav) nav.classList.remove('hidden');

        if (!isProfesor && user.grado && user.seccion) {
            QuizProApp.renderHierarchyLevel(type, 'Asignatura', { grado: user.grado, seccion: user.seccion });
        } else {
            QuizProApp.renderHierarchyLevel(type, 'Grado');
        }
    };

    app.renderHierarchyLevel = function(type, level, params, pushState) {
        if (params === undefined) params = {};
        if (pushState === undefined) pushState = true;
        var container = document.getElementById('hierarchy-options');
        var label = document.getElementById('hierarchy-label');
        var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}';
        var user = JSON.parse(userRaw);
        var role = user.rol || 'Invitado';

        if (!container) return;

        container.innerHTML = '<div class="p-8 text-center"><i class="fas fa-spinner fa-spin text-blue-600 text-2xl"></i></div>';

        var sourceData = (type === 'Presentaciones') ? (QuizProApp.presentationData || []) : (QuizProApp.downloadContentData || []);

        var items = [];
        var nextLevel = '';

        switch(level) {
            case 'Grado':
                label.textContent = 'Selecciona Grado';
                var gradeSet = {};
                for (var i = 0; i < sourceData.length; i++) {
                    if (sourceData[i].grade) gradeSet[sourceData[i].grade] = true;
                }
                for (var g in gradeSet) { items.push(g); }
                nextLevel = 'Sección';
                break;
            case 'Sección':
                label.textContent = 'Selecciona Sección';
                var gradeObj = null;
                for (var i = 0; i < sourceData.length; i++) {
                    if (QuizProApp.parseGrade(sourceData[i].grade) === QuizProApp.parseGrade(params.grado)) {
                        gradeObj = sourceData[i];
                        break;
                    }
                }
                items = gradeObj ? gradeObj.sections : [];
                nextLevel = 'Asignatura';
                break;
            case 'Asignatura':
                label.textContent = 'Selecciona Asignatura';
                var gradeObjA = null;
                for (var i = 0; i < sourceData.length; i++) {
                    if (QuizProApp.parseGrade(sourceData[i].grade) === QuizProApp.parseGrade(params.grado)) {
                        gradeObjA = sourceData[i];
                        break;
                    }
                }

                if (gradeObjA) {
                    var asigSet = {};
                    for (var i = 0; i < gradeObjA.subjects.length; i++) {
                        var s = gradeObjA.subjects[i];
                        if (QuizProApp.checkSectionHelper(s.sections, params.seccion) && QuizProApp.isContentAuthorized(s.partial, s.name)) {
                            asigSet[s.name] = true;
                        }
                    }
                    for (var a in asigSet) { items.push(a); }
                }

                if (role !== 'Profesor') {
                    nextLevel = (type === 'Presentaciones' ? 'Temas' : 'Archivos');
                } else {
                    nextLevel = 'Parcial';
                }
                break;
            case 'Parcial':
                label.textContent = 'Selecciona Parcial';
                var gradeObjP = null;
                for (var i = 0; i < sourceData.length; i++) {
                    if (QuizProApp.parseGrade(sourceData[i].grade) === QuizProApp.parseGrade(params.grado)) {
                        gradeObjP = sourceData[i];
                        break;
                    }
                }
                if (gradeObjP) {
                    var parcialSet = {};
                    for (var i = 0; i < gradeObjP.subjects.length; i++) {
                        var s = gradeObjP.subjects[i];
                        if (QuizProApp.checkSectionHelper(s.sections, params.seccion) && (!params.asignatura || s.name === params.asignatura)) {
                            parcialSet[s.partial] = true;
                        }
                    }
                    for (var p in parcialSet) { items.push(p); }
                }
                nextLevel = (type === 'Presentaciones' ? 'Temas' : 'Archivos');
                break;
            case 'Temas':
            case 'Archivos':
                label.textContent = (type === 'Presentaciones') ? 'Selecciona Tema' : 'Descargar Archivos';
                var gradeObjT = null;
                for (var i = 0; i < sourceData.length; i++) {
                    if (QuizProApp.parseGrade(sourceData[i].grade) === QuizProApp.parseGrade(params.grado)) {
                        gradeObjT = sourceData[i];
                        break;
                    }
                }
                var finalItems = [];
                if (gradeObjT) {
                    var subject = null;
                    for (var i = 0; i < gradeObjT.subjects.length; i++) {
                        var s = gradeObjT.subjects[i];
                        if (s.name === params.asignatura && s.partial === params.parcial && QuizProApp.checkSectionHelper(s.sections, params.seccion)) {
                            subject = s;
                            break;
                        }
                    }
                    finalItems = subject ? subject.topics : [];
                }

                if (finalItems.length === 0) {
                    container.innerHTML = '<p class="text-center p-4 text-gray-500 text-sm">No hay contenido disponible.</p>';
                    return;
                }

                var html = '';
                for (var i = 0; i < finalItems.length; i++) {
                    var item = finalItems[i];
                    if (!item.title || !item.file) continue;
                    html +=
                        '<a href="' + item.file + '" ' + (type === 'Contenido' ? 'download' : 'target="_blank"') + ' class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all group">' +
                            '<div class="flex items-center gap-3">' +
                                '<div class="w-8 h-8 rounded-lg ' + (type === 'Presentaciones' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600') + ' flex items-center justify-center text-xs">' +
                                    '<i class="fas ' + (type === 'Presentaciones' ? 'fa-desktop' : 'fa-download') + '"></i>' +
                                '</div>' +
                                '<span class="text-sm font-semibold text-gray-700">' + item.title + '</span>' +
                            '</div>' +
                            '<i class="fas fa-chevron-right text-[10px] text-gray-300 group-hover:text-blue-500 transition-colors"></i>' +
                        '</a>';
                }
                container.innerHTML = html;
                return;
        }

        if (items.length === 0) {
            container.innerHTML = '<p class="text-center p-4 text-gray-500 text-sm">No hay opciones disponibles.</p>';
            return;
        }

        if (pushState) {
            history.pushState({ type: 'academic-menu', menuType: type, level: level, params: params, scrollPos: window.pageYOffset }, '');
        }

        var htmlItems = '';
        for (var i = 0; i < items.length; i++) {
            var itemStr = items[i];
            if (itemStr === undefined) continue;
            var currentLevelKey = (level === 'Grado' ? 'grado' : (level === 'Sección' ? 'seccion' : (level === 'Asignatura' ? 'asignatura' : (level === 'Parcial' ? 'parcial' : level.toLowerCase()))));

            var newParams = {};
            for (var k in params) { newParams[k] = params[k]; }
            newParams[currentLevelKey] = itemStr;

            if (role !== 'Profesor' && level === 'Asignatura') {
                var gradeObj = null;
                for (var j = 0; j < sourceData.length; j++) {
                    if (QuizProApp.parseGrade(sourceData[j].grade) === QuizProApp.parseGrade(params.grado)) {
                        gradeObj = sourceData[j];
                        break;
                    }
                }
                if (gradeObj) {
                    for (var j = 0; j < gradeObj.subjects.length; j++) {
                        var s = gradeObj.subjects[j];
                        if (s.name === itemStr && QuizProApp.checkSectionHelper(s.sections, params.seccion) && QuizProApp.isContentAuthorized(s.partial, s.name)) {
                            newParams.parcial = s.partial;
                            break;
                        }
                    }
                }
            }

            var paramsStr = JSON.stringify(newParams).replace(/'/g, "&#39;");
            htmlItems +=
                '<button onclick=\'QuizProApp.renderHierarchyLevel("' + type + '", "' + nextLevel + '", ' + paramsStr + ')\' ' +
                        'class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all group">' +
                    '<span class="text-sm font-semibold text-gray-700">' + itemStr + '</span>' +
                    '<i class="fas fa-chevron-right text-[10px] text-gray-300 group-hover:text-blue-500 transition-colors"></i>' +
                '</button>';
        }
        container.innerHTML = htmlItems;
    };

    app.renderCommonNav = function() {
        var desktopCoursesMenu = document.getElementById('desktop-courses-menu');
        var desktopContentMenu = document.getElementById('desktop-content-menu');
        var mobileCoursesMenu = document.getElementById('mobile-courses-menu');
        var mobileContentMenu = document.getElementById('mobile-content-menu');

        var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var currentUser = userRaw ? JSON.parse(userRaw) : null;
        var isProfesor = currentUser && currentUser.rol === 'Profesor';

        function buildHierarchy(data) {
            if (!data) return '';

            var html = '';
            for (var i = 0; i < data.length; i++) {
                var grade = data[i];
                if (!isProfesor && currentUser && currentUser.grado && QuizProApp.parseGrade(grade.grade) !== QuizProApp.parseGrade(currentUser.grado)) continue;

                var filteredSubjects = [];
                for (var j = 0; j < grade.subjects.length; j++) {
                    var subj = grade.subjects[j];
                    if (!isProfesor && currentUser && currentUser.seccion) {
                        if (QuizProApp.checkSectionHelper(subj.sections, currentUser.seccion)) filteredSubjects.push(subj);
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

                    var partialGroups = {};
                    for (var j = 0; j < filteredSubjects.length; j++) {
                        var subj = filteredSubjects[j];
                        if (!partialGroups[subj.partial]) partialGroups[subj.partial] = [];
                        partialGroups[subj.partial].push(subj);
                    }

                    for (var partial in partialGroups) {
                        html += '<div class="relative group/partial">' +
                            '<button class="block w-full text-left px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 uppercase tracking-tight">' +
                                partial + ' <span class="float-right text-[10px] mt-0.5 ml-2">&#9656;</span>' +
                            '</button>' +
                            '<div class="absolute left-full top-0 dropdown-container-ima bg-white rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/partial:opacity-100 group-hover/partial:visible border border-gray-100">';

                        var subjs = partialGroups[partial];
                        for (var k = 0; k < subjs.length; k++) {
                            var subj = subjs[k];
                            html += '<div class="relative group/subj">' +
                                '<button class="block w-full text-left px-4 py-2 text-[10px] font-bold text-gray-500 hover:bg-blue-50 hover:text-blue-600 uppercase">' +
                                    subj.name + ' <span class="float-right text-[10px] mt-0.5 ml-2">&#9656;</span>' +
                                '</button>' +
                                '<div class="absolute left-full top-0 dropdown-container-ima bg-white rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/subj:opacity-100 group-hover/subj:visible border border-gray-100">';
                            for (var l = 0; l < subj.topics.length; l++) {
                                var topic = subj.topics[l];
                                html += '<a href="' + topic.file + '" class="block px-4 py-2 text-[11px] font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-50 last:border-0">' + topic.title + '</a>';
                            }
                            html += '</div></div>';
                        }
                        html += '</div></div>';
                    }
                    html += '</div></div>';
                } else {
                    for (var j = 0; j < filteredSubjects.length; j++) {
                        var subj = filteredSubjects[j];
                        if (QuizProApp.isContentAuthorized(subj.partial, subj.name)) {
                            html += '<div class="relative group/subj">' +
                                '<button class="block w-full text-left px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 uppercase">' +
                                    subj.name + ' <span class="float-right text-[10px] mt-0.5 ml-2">&#9656;</span>' +
                                '</button>' +
                                '<div class="absolute left-full top-0 dropdown-container-ima bg-white rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/subj:opacity-100 group-hover/subj:visible border border-gray-100">';
                            for (var l = 0; l < subj.topics.length; l++) {
                                var topic = subj.topics[l];
                                html += '<a href="' + topic.file + '" class="block px-4 py-2 text-[11px] font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-50 last:border-0">' + topic.title + '</a>';
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
                if (!isProfesor && currentUser && currentUser.grado && QuizProApp.parseGrade(grade.grade) !== QuizProApp.parseGrade(currentUser.grado)) continue;

                var filteredSubjects = [];
                for (var j = 0; j < grade.subjects.length; j++) {
                    var subj = grade.subjects[j];
                    if (!isProfesor && currentUser && currentUser.seccion) {
                        if (QuizProApp.checkSectionHelper(subj.sections, currentUser.seccion)) filteredSubjects.push(subj);
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
                    for (var j = 0; j < filteredSubjects.length; j++) {
                        var subj = filteredSubjects[j];
                        html += '<button class="w-full text-left px-8 py-3 font-bold text-blue-600 uppercase tracking-tighter border-b border-gray-100 flex justify-between items-center text-[10px]" onclick="this.nextElementSibling.classList.toggle(\'hidden\')">' +
                            '[' + subj.partial + '] ' + subj.name + ' <span>&#9662;</span>' +
                        '</button>' +
                        '<div class="hidden bg-white/50">';
                        for (var l = 0; l < subj.topics.length; l++) {
                            var topic = subj.topics[l];
                            html += '<a href="' + topic.file + '" class="block px-10 py-3 text-[11px] font-medium text-gray-600 border-b border-gray-50 last:border-0" onclick="closeMobileMenu()">' + topic.title + '</a>';
                        }
                        html += '</div>';
                    }
                    html += '</div>';
                } else {
                    for (var j = 0; j < filteredSubjects.length; j++) {
                        var subj = filteredSubjects[j];
                        if (QuizProApp.isContentAuthorized(subj.partial, subj.name)) {
                            html += '<button class="w-full text-left px-8 py-3 font-bold text-blue-600 uppercase tracking-tighter border-b border-gray-100 flex justify-between items-center text-[10px]" onclick="this.nextElementSibling.classList.toggle(\'hidden\')">' +
                                subj.name + ' <span>&#9662;</span>' +
                            '</button>' +
                            '<div class="hidden bg-white/50">';
                            for (var l = 0; l < subj.topics.length; l++) {
                                var topic = subj.topics[l];
                                html += '<a href="' + topic.file + '" class="block px-10 py-3 text-[11px] font-medium text-gray-600 border-b border-gray-50 last:border-0" onclick="closeMobileMenu()">' + topic.title + '</a>';
                            }
                            html += '</div>';
                        }
                    }
                }
            }
            return html;
        }

        if (desktopCoursesMenu) desktopCoursesMenu.innerHTML = buildHierarchy(QuizProApp.presentationData);
        if (desktopContentMenu) desktopContentMenu.innerHTML = buildHierarchy(QuizProApp.downloadContentData);
        if (mobileCoursesMenu) mobileCoursesMenu.innerHTML = buildMobileHierarchy(QuizProApp.presentationData);
        if (mobileContentMenu) mobileContentMenu.innerHTML = buildMobileHierarchy(QuizProApp.downloadContentData);

        var mobilePortalBottom = document.getElementById('mobile-portal-bottom-nav');
        if (mobilePortalBottom && currentUser) {
            mobilePortalBottom.href = currentUser.rol === 'Profesor' ? 'teacher-dashboard.html' : 'student-dashboard.html';
        }
    };

    QuizProApp.setupCommonUI();

})(QuizProApp);
