/**
 * Common UI Logic for all pages (Header, Mobile Menu, Scroll)
 */

window.setupCommonUI = function() {
    const mainHeader = document.getElementById('main-header');
    const openProfileBtn = document.getElementById('open-profile-btn');
    const mobileProfileBtn = document.getElementById('mobile-profile-btn-nav');

    // Restoration fix: Ensure header is visible on init
    if (mainHeader) {
        mainHeader.classList.remove('header-hidden');
    }

    let lastScrollTop = 0;
    const scrollThreshold = 10;

    // --- Header & Scroll Logic ---
    if (mainHeader) {
        window.addEventListener('scroll', () => {
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
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
    window.openMobileMenu = function(section = null) {
        window.openAcademicMenu();
    };

    window.closeMobileMenu = function() {
        window.closeAcademicMenu();
    };

    // --- Unified Profile Modal Logic (A-75) ---
    window.openProfileModal = function(pushState = true) {
        const modal = document.getElementById('profile-modal');
        if (!modal) return;

        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            // Si no hay sesión, invitar a login (si existe modal de login)
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.classList.remove('opacity-0', 'pointer-events-none');
                const content = document.getElementById('login-modal-content');
                if (content) content.classList.add('scale-100');
            } else {
                alert('Inicie sesión para acceder a su perfil.');
                window.location.href = 'login.html';
            }
            return;
        }

        // Poblar campos comunes
        const nameEl = document.getElementById('profile-nombre');
        const emailEl = document.getElementById('profile-email');
        const phoneEl = document.getElementById('profile-telefono');
        const listEl = document.getElementById('profile-numeroLista');
        const listContainer = document.getElementById('profile-numeroLista-container');

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

    window.closeProfileModal = function(doPop = true) {
        const modal = document.getElementById('profile-modal');
        if (modal) modal.classList.add('hidden');
        if (doPop && history.state && history.state.modalId === 'profile-modal') {
            history.back();
        }
    };

    // Attach to buttons if they exist
    if (openProfileBtn) openProfileBtn.addEventListener('click', (e) => { e.preventDefault(); window.openProfileModal(); });
    if (mobileProfileBtn) mobileProfileBtn.addEventListener('click', (e) => { e.preventDefault(); window.openProfileModal(); });

    // Close on X or Cancel
    const closeBtn = document.getElementById('close-profile-modal');
    const cancelBtn = document.getElementById('cancel-profile-btn');
    if (closeBtn) closeBtn.onclick = window.closeProfileModal;
    if (cancelBtn) cancelBtn.onclick = window.closeProfileModal;

    // --- Logout Logic (Global) ---
    window.handleLogout = () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    };

    // Portal Redirect Logic
    const portalLink = document.getElementById('nav-portal-link');
    const mobilePortalLink = document.getElementById('mobile-portal-link');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        const dest = currentUser.rol === 'Profesor' ? 'teacher-dashboard.html' : 'student-dashboard.html';
        if (portalLink) portalLink.href = dest;
        if (mobilePortalLink) mobilePortalLink.href = dest;
    }

    // Set Year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Render Navigation
    window.renderCommonNav();

    // --- (A-77) Global History Navigation System ---
    const handlePopState = (event) => {
        const state = event.state;

        // Siempre cerrar modales si el nuevo estado NO es de modal
        if (!state || (state.type !== 'modal-close' && state.type !== 'academic-menu')) {
            const academicModal = document.getElementById('academic-menu-modal');
            if (academicModal && !academicModal.classList.contains('hidden')) {
                window.closeAcademicMenu(false);
            }
            const profileModal = document.getElementById('profile-modal');
            if (profileModal && !profileModal.classList.contains('hidden')) {
                window.closeProfileModal(false);
            }
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.classList.add('opacity-0', 'pointer-events-none');
                const content = document.getElementById('login-modal-content');
                if (content) content.classList.remove('scale-100');
            }
        }

        if (!state) return;

        if (state.type === 'dashboard-section') {
            const targetNav = document.getElementById(state.navId);
            const targetSection = document.getElementById(state.sectionId);
            if (targetNav && targetSection && window.navigateTo) {
                window.navigateTo(targetSection, targetNav, false);
            }
        } else if (state.type === 'hierarchical-nav') {
            if (window.syncNavWithState) {
                window.syncNavWithState(state);
            }
        } else if (state.type === 'academic-menu') {
            window.openAcademicMenu(false); // Asegurar que el modal esté visible al navegar atrás/adelante
            if (state.level === 'root') {
                window.resetAcademicMenu(false);
            } else {
                window.renderHierarchyLevel(state.menuType, state.level, state.params, false);
            }
        } else if (state.type === 'modal-close') {
            // Si el estado es de modal (forward), lo abrimos
            if (state.modalId === 'academic-menu-modal') window.openAcademicMenu(false);
            if (state.modalId === 'profile-modal') window.openProfileModal(false);
        }
    };

    window.addEventListener('popstate', handlePopState);

    // --- Dropdown Viewport Protection (A-76) ---
    const handleDropdownOverflow = () => {
        // Observer to re-apply logic if DOM changes (dynamic menus)
        const observer = new MutationObserver((mutations) => {
            attachOverflowCheck();
        });

        const attachOverflowCheck = () => {
            // Check both Level 2 (below nav) and Level 3+ (right side) submenus
            const submenus = document.querySelectorAll('.group div[class*="absolute"]');
            submenus.forEach(menu => {
                const parent = menu.parentElement;
                if (!parent || parent.dataset.ovfChecked === "true") return;

                parent.dataset.ovfChecked = "true";
                parent.addEventListener('mouseenter', () => {
                    // Temporarily show to measure accurately
                    const originalOpacity = menu.style.opacity;
                    const originalVisibility = menu.style.visibility;

                    menu.style.opacity = '0';
                    menu.style.visibility = 'visible';
                    menu.style.display = 'block';

                    const rect = menu.getBoundingClientRect();

                    menu.style.display = '';
                    menu.style.visibility = originalVisibility;
                    menu.style.opacity = originalOpacity;

                    if (rect.right > window.innerWidth) {
                        menu.classList.add('dropdown-reverse');
                        // If it's a top-level dropdown, just shift it left
                        if (menu.classList.contains('left-0')) {
                            menu.classList.remove('left-0');
                            menu.classList.add('right-0');
                        }
                    } else {
                        // Reset if it fits now
                        if (rect.left < 0) {
                             // Handle left overflow if needed
                        }
                    }
                });
            });
        };

        const nav = document.querySelector('nav');
        if (nav) observer.observe(nav, { childList: true, subtree: true });
        attachOverflowCheck();
    };
    handleDropdownOverflow();

    // --- Unified Profile Form Handler (A-73/75) ---
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.onsubmit = async (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (!user) {
                alert('Sesión no encontrada. Por favor inicie sesión de nuevo.');
                window.location.href = 'login.html';
                return;
            }

            const submitBtn = profileForm.querySelector('button[type="submit"]');
            const newPassword = document.getElementById('profile-password').value;
            const currentPassword = document.getElementById('profile-current-password').value;

            if (newPassword && !currentPassword) {
                alert('Debe ingresar su contraseña actual para establecer una nueva.');
                return;
            }

            const payload = {
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
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Procesando...';

            try {
                if (typeof fetchApi !== 'function') {
                    throw new Error('El servicio de conexión (api.js) no se ha cargado correctamente.');
                }

                const result = await fetchApi('USER', 'updateUserProfile', payload);

                if (result.status === 'success') {
                    const updatedUser = { ...user, ...result.data };
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

                    const nameParts = updatedUser.nombre.split(' ');
                    const firstName = nameParts[0];

                    const teacherNameEl = document.getElementById('teacher-name');
                    const studentNameEl = document.getElementById('student-name');
                    if (teacherNameEl) teacherNameEl.textContent = firstName;
                    if (studentNameEl) studentNameEl.textContent = firstName;

                    if (window.renderWelcomeMessage) window.renderWelcomeMessage();

                    alert('Perfil actualizado con éxito.');
                    const modal = document.getElementById('profile-modal');
                    if (modal) modal.classList.add('hidden');

                    document.getElementById('profile-password').value = '';
                    document.getElementById('profile-current-password').value = '';
                } else {
                    alert('Atención: ' + result.message);
                }
            } catch (err) {
                console.error("Critical Profile Error:", err);
                alert('Error de conexión: No se pudo sincronizar con el servidor. Verifique su internet.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
                submitBtn.textContent = originalText;
            }
        };
    }
};

/**
 * Convierte un ID o URL de Google Drive en una URL de visualización directa pública.
 * @param {string} driveLink - El enlace o ID del archivo de Drive.
 * @returns {string} La URL convertida o el link original si no se puede procesar.
 */
window.convertDriveLink = function(driveLink) {
    if (!driveLink || typeof driveLink !== 'string') return '';

    // Si ya es un enlace directo funcional, no tocar
    if (driveLink.includes('lh3.googleusercontent.com')) return driveLink;

    let fileId = '';

    if (driveLink.includes('drive.google.com')) {
        // Formatos: /file/d/ID/view, /open?id=ID, /uc?id=ID
        const match = driveLink.match(/\/d\/([a-zA-Z0-9-_]+)/) ||
                      driveLink.match(/[?&]id=([a-zA-Z0-9-_]+)/);
        if (match && match[1]) fileId = match[1];
    } else if (!driveLink.includes('http')) {
        // Asumir que es un ID directo
        fileId = driveLink;
    }

    if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    return driveLink;
};

// Global helper for sections
window.checkSectionHelper = function(sectionsField, targetSection) {
    if (!sectionsField || !targetSection) return true;
    if (Array.isArray(sectionsField)) return sectionsField.includes(targetSection);
    return sectionsField.split(',').map(s => s.trim()).includes(targetSection);
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

window.openAcademicMenu = function(pushState = true) {
    let modal = document.getElementById('academic-menu-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'academic-menu-modal';
        modal.className = 'fixed inset-0 bg-gray-900/98 z-[2100] flex items-center justify-center hidden opacity-0 transition-all duration-300';
        modal.innerHTML = `
            <div class="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in-up m-4 border border-gray-100">
                <div class="p-8">
                    <div class="flex justify-between items-center mb-8">
                        <div>
                            <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">Recursos</h2>
                            <p class="text-xs font-medium text-blue-600 uppercase tracking-widest mt-1">Explora tu contenido</p>
                        </div>
                        <button onclick="window.closeAcademicMenu()" class="text-gray-400 hover:text-gray-600 p-2 transition-colors">
                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div class="grid grid-cols-1 gap-4" id="academic-menu-options">
                        <button onclick="window.showAcademicHierarchy('Presentaciones')" class="group flex items-center gap-5 p-5 bg-blue-50/50 rounded-3xl hover:bg-blue-600 transition-all duration-300">
                            <div class="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                <i class="fas fa-desktop"></i>
                            </div>
                            <div class="text-left">
                                <h3 class="font-bold text-gray-900 group-hover:text-white transition-colors">Presentaciones</h3>
                                <p class="text-xs text-blue-600 group-hover:text-blue-100 transition-colors">Clases interactivas</p>
                            </div>
                        </button>

                        <button onclick="window.showAcademicHierarchy('Contenido')" class="group flex items-center gap-5 p-5 bg-purple-50/50 rounded-3xl hover:bg-purple-600 transition-all duration-300">
                            <div class="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                <i class="fas fa-file-pdf"></i>
                            </div>
                            <div class="text-left">
                                <h3 class="font-bold text-gray-900 group-hover:text-white transition-colors">Contenido de clase</h3>
                                <p class="text-xs text-purple-600 group-hover:text-purple-100 transition-colors">Descargas PDF</p>
                            </div>
                        </button>
                    </div>

                    <div id="hierarchy-navigation" class="hidden flex flex-col min-h-[300px]">
                        <button onclick="window.resetAcademicMenu()" class="mb-6 flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] hover:text-blue-700 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
                            Regresar
                        </button>
                        <div id="hierarchy-title" class="mb-6">
                            <h3 class="text-lg font-bold text-gray-900" id="hierarchy-label">Selecciona Grado</h3>
                            <div class="h-1 w-12 bg-blue-600 rounded-full mt-1"></div>
                        </div>
                        <div id="hierarchy-options" class="flex flex-col gap-2 overflow-y-auto max-h-[350px] pr-2 scroll-minimalist">
                            <!-- Inyectado dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('opacity-100'), 10);
    window.resetAcademicMenu(false);

    if (pushState) {
        history.pushState({ type: 'modal-close', modalId: 'academic-menu-modal' }, '');
    }
};

window.closeAcademicMenu = function(doPop = true) {
    const modal = document.getElementById('academic-menu-modal');
    if (modal) {
        modal.classList.remove('opacity-100');
        setTimeout(() => modal.classList.add('hidden'), 300);
        if (doPop && history.state && history.state.modalId === 'academic-menu-modal') {
            history.back();
        }
    }
};

window.resetAcademicMenu = function(pushState = true) {
    document.getElementById('academic-menu-options').classList.remove('hidden');
    document.getElementById('hierarchy-navigation').classList.add('hidden');
    if (pushState) {
        history.pushState({ type: 'academic-menu', level: 'root' }, '');
    }
};

window.openAcademicHierarchy = function(type) {
    window.openAcademicMenu();
    window.showAcademicHierarchy(type);
};

window.showAcademicHierarchy = function(type) {
    const options = document.getElementById('academic-menu-options');
    const nav = document.getElementById('hierarchy-navigation');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isProfesor = user.rol === 'Profesor';

    if (options) options.classList.add('hidden');
    if (nav) nav.classList.remove('hidden');

    if (!isProfesor && user.grado && user.seccion) {
        window.renderHierarchyLevel(type, 'Asignatura', { grado: user.grado, seccion: user.seccion });
    } else {
        window.renderHierarchyLevel(type, 'Grado');
    }
};

window.renderHierarchyLevel = function(type, level, params = {}, pushState = true) {
    const container = document.getElementById('hierarchy-options');
    const label = document.getElementById('hierarchy-label');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const role = user.rol || 'Invitado';

    if (!container) return;

    container.innerHTML = '<div class="p-8 text-center"><i class="fas fa-spinner fa-spin text-blue-600 text-2xl"></i></div>';

    const sourceData = (type === 'Presentaciones') ? (window.presentationData || []) : (window.downloadContentData || []);

    let items = [];
    let nextLevel = '';

    switch(level) {
        case 'Grado':
            label.textContent = 'Selecciona Grado';
            items = [...new Set(sourceData.map(d => d.grade))].filter(Boolean);
            nextLevel = 'Sección';
            break;
        case 'Sección':
            label.textContent = 'Selecciona Sección';
            const gradeObj = sourceData.find(d => window.parseGrade(d.grade) === window.parseGrade(params.grado));
            items = gradeObj ? gradeObj.sections : [];
            nextLevel = 'Asignatura';
            break;
        case 'Asignatura':
            label.textContent = 'Selecciona Asignatura';
            const gradeObjA = sourceData.find(d => window.parseGrade(d.grade) === window.parseGrade(params.grado));

            // REQ 7: Filtrado por Autorización (Parcial Actual/Anteriores)
            if (gradeObjA) {
                items = [...new Set(gradeObjA.subjects
                    .filter(s => window.checkSectionHelper(s.sections, params.seccion) && window.isContentAuthorized(s.partial, s.name))
                    .map(s => s.name)
                )];
            }

            // Si no es profesor, saltar directamente al nivel de Temas/Archivos usando el parcial autorizado
            if (role !== 'Profesor') {
                nextLevel = (type === 'Presentaciones' ? 'Temas' : 'Archivos');
            } else {
                nextLevel = 'Parcial';
            }
            break;
        case 'Parcial':
            label.textContent = 'Selecciona Parcial';
            const gradeObjP = sourceData.find(d => window.parseGrade(d.grade) === window.parseGrade(params.grado));
            if (gradeObjP) {
                items = [...new Set(gradeObjP.subjects
                    .filter(s => window.checkSectionHelper(s.sections, params.seccion) && (!params.asignatura || s.name === params.asignatura))
                    .map(s => s.partial)
                )];
            }
            nextLevel = (type === 'Presentaciones' ? 'Temas' : 'Archivos');
            break;
        case 'Temas':
        case 'Archivos':
            label.textContent = (type === 'Presentaciones') ? 'Selecciona Tema' : 'Descargar Archivos';
            const gradeObjT = sourceData.find(d => window.parseGrade(d.grade) === window.parseGrade(params.grado));
            let finalItems = [];
            if (gradeObjT) {
                const subject = gradeObjT.subjects.find(s =>
                    s.name === params.asignatura &&
                    s.partial === params.parcial &&
                    window.checkSectionHelper(s.sections, params.seccion)
                );
                finalItems = subject ? subject.topics : [];
            }

            if (finalItems.length === 0) {
                container.innerHTML = '<p class="text-center p-4 text-gray-500 text-sm">No hay contenido disponible.</p>';
                return;
            }

            container.innerHTML = finalItems.map(item => {
                if (!item.title || !item.file) return '';
                return `
                    <a href="${item.file}" ${type === 'Contenido' ? 'download' : 'target="_blank"'} class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all group">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg ${type === 'Presentaciones' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'} flex items-center justify-center text-xs">
                                <i class="fas ${type === 'Presentaciones' ? 'fa-desktop' : 'fa-download'}"></i>
                            </div>
                            <span class="text-sm font-semibold text-gray-700">${item.title}</span>
                        </div>
                        <i class="fas fa-chevron-right text-[10px] text-gray-300 group-hover:text-blue-500 transition-colors"></i>
                    </a>
                `;
            }).join('');
            return;
    }

    if (items.length === 0 || items.every(i => i === undefined)) {
        container.innerHTML = '<p class="text-center p-4 text-gray-500 text-sm">No hay opciones disponibles.</p>';
        return;
    }

    if (pushState) {
        history.pushState({ type: 'academic-menu', menuType: type, level, params }, '');
    }

    container.innerHTML = items.map(item => {
        if (item === undefined) return '';
        const currentLevelKey = (level === 'Grado' ? 'grado' : (level === 'Sección' ? 'seccion' : (level === 'Asignatura' ? 'asignatura' : (level === 'Parcial' ? 'parcial' : level.toLowerCase()))));
        let newParams = {...params, [currentLevelKey]: item};

        // Si el usuario es estudiante y acaba de seleccionar una asignatura,
        // debemos pre-asignar el parcial autorizado para que el siguiente nivel cargue correctamente.
        if (role !== 'Profesor' && level === 'Asignatura') {
            const gradeObj = sourceData.find(d => window.parseGrade(d.grade) === window.parseGrade(params.grado));
            const subject = gradeObj.subjects.find(s =>
                s.name === item &&
                window.checkSectionHelper(s.sections, params.seccion) &&
                window.isContentAuthorized(s.partial, s.name)
            );
            if (subject) {
                newParams.parcial = subject.partial;
            }
        }

        const paramsStr = JSON.stringify(newParams).replace(/'/g, "&#39;");
        return `
            <button onclick='window.renderHierarchyLevel("${type}", "${nextLevel}", ${paramsStr})'
                    class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all group">
                <span class="text-sm font-semibold text-gray-700">${item}</span>
                <i class="fas fa-chevron-right text-[10px] text-gray-300 group-hover:text-blue-500 transition-colors"></i>
            </button>
        `;
    }).join('');
};

window.renderCommonNav = function() {
    const desktopCoursesMenu = document.getElementById('desktop-courses-menu');
    const desktopContentMenu = document.getElementById('desktop-content-menu');
    const mobileCoursesMenu = document.getElementById('mobile-courses-menu');
    const mobileContentMenu = document.getElementById('mobile-content-menu');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isProfesor = currentUser && currentUser.rol === 'Profesor';

    function buildHierarchy(data) {
        if (!data) return '';

        return data.map(grade => {
            if (!isProfesor && currentUser && currentUser.grado && window.parseGrade(grade.grade) !== window.parseGrade(currentUser.grado)) return '';

            const filteredSubjects = grade.subjects.filter(subj => {
                if (!isProfesor && currentUser && currentUser.seccion) return window.checkSectionHelper(subj.sections, currentUser.seccion);
                return true;
            });

            if (filteredSubjects.length === 0 && !isProfesor) return '';

            if (isProfesor) {
                let html = `<div class="relative group/grade">
                    <button class="block w-full text-left px-4 py-2 text-[11px] font-black text-gray-700 hover:bg-blue-50 hover:text-blue-600 uppercase tracking-widest transition-colors focus:outline-none">
                        ${grade.grade} <span class="float-right text-[10px] mt-0.5 ml-2">&#9656;</span>
                    </button>
                    <div class="absolute left-full top-0 dropdown-container-ima bg-white rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/grade:opacity-100 group-hover/grade:visible border border-gray-100">`;

                const partialGroups = {};
                filteredSubjects.forEach(subj => {
                    if (!partialGroups[subj.partial]) partialGroups[subj.partial] = [];
                    partialGroups[subj.partial].push(subj);
                });

                Object.keys(partialGroups).forEach(partial => {
                    html += `<div class="relative group/partial">
                        <button class="block w-full text-left px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 uppercase tracking-tight">
                            ${partial} <span class="float-right text-[10px] mt-0.5 ml-2">&#9656;</span>
                        </button>
                        <div class="absolute left-full top-0 dropdown-container-ima bg-white rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/partial:opacity-100 group-hover/partial:visible border border-gray-100">`;

                    partialGroups[partial].forEach(subj => {
                        html += `<div class="relative group/subj">
                            <button class="block w-full text-left px-4 py-2 text-[10px] font-bold text-gray-500 hover:bg-blue-50 hover:text-blue-600 uppercase">
                                ${subj.name} <span class="float-right text-[10px] mt-0.5 ml-2">&#9656;</span>
                            </button>
                            <div class="absolute left-full top-0 dropdown-container-ima bg-white rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/subj:opacity-100 group-hover/subj:visible border border-gray-100">`;
                        subj.topics.forEach(topic => {
                            html += `<a href="${topic.file}" class="block px-4 py-2 text-[11px] font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-50 last:border-0">${topic.title}</a>`;
                        });
                        html += `</div></div>`;
                    });
                    html += `</div></div>`;
                });
                html += `</div></div>`;
                return html;
            } else {
                // REQ 7: Los estudiantes solo ven el contenido autorizado (Garantía de Scope)
                return filteredSubjects.filter(s => window.isContentAuthorized(s.partial, s.name)).map(subj => `
                    <div class="relative group/subj">
                        <button class="block w-full text-left px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 uppercase">
                            ${subj.name} <span class="float-right text-[10px] mt-0.5 ml-2">&#9656;</span>
                        </button>
                        <div class="absolute left-full top-0 dropdown-container-ima bg-white rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/subj:opacity-100 group-hover/subj:visible border border-gray-100">
                            ${subj.topics.map(topic => `<a href="${topic.file}" class="block px-4 py-2 text-[11px] font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-50 last:border-0">${topic.title}</a>`).join('')}
                        </div>
                    </div>
                `).join('');
            }
        }).join('');
    }

    function buildMobileHierarchy(data) {
        if (!data) return '';
        return data.map(grade => {
            if (!isProfesor && currentUser && currentUser.grado && window.parseGrade(grade.grade) !== window.parseGrade(currentUser.grado)) return '';
            const filteredSubjects = grade.subjects.filter(subj => {
                if (!isProfesor && currentUser && currentUser.seccion) return window.checkSectionHelper(subj.sections, currentUser.seccion);
                return true;
            });
            if (filteredSubjects.length === 0 && !isProfesor) return '';

            if (isProfesor) {
                let html = `<button class="w-full text-left px-6 py-4 font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 flex justify-between items-center text-xs" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    ${grade.grade} <span>&#9662;</span>
                </button>
                <div class="hidden bg-gray-50/50">`;
                filteredSubjects.forEach(subj => {
                    html += `<button class="w-full text-left px-8 py-3 font-bold text-blue-600 uppercase tracking-tighter border-b border-gray-100 flex justify-between items-center text-[10px]" onclick="this.nextElementSibling.classList.toggle('hidden')">
                        [${subj.partial}] ${subj.name} <span>&#9662;</span>
                    </button>
                    <div class="hidden bg-white/50">`;
                    subj.topics.forEach(topic => {
                        html += `<a href="${topic.file}" class="block px-10 py-3 text-[11px] font-medium text-gray-600 border-b border-gray-50 last:border-0" onclick="closeMobileMenu()">${topic.title}</a>`;
                    });
                    html += `</div>`;
                });
                html += `</div>`;
                return html;
            } else {
                // REQ 7: Los estudiantes solo ven el contenido autorizado (Garantía de Scope)
                return filteredSubjects.filter(s => window.isContentAuthorized(s.partial)).map(subj => `
                    <button class="w-full text-left px-8 py-3 font-bold text-blue-600 uppercase tracking-tighter border-b border-gray-100 flex justify-between items-center text-[10px]" onclick="this.nextElementSibling.classList.toggle('hidden')">
                        ${subj.name} <span>&#9662;</span>
                    </button>
                    <div class="hidden bg-white/50">
                        ${subj.topics.map(topic => `<a href="${topic.file}" class="block px-10 py-3 text-[11px] font-medium text-gray-600 border-b border-gray-50 last:border-0" onclick="closeMobileMenu()">${topic.title}</a>`).join('')}
                    </div>
                `).join('');
            }
        }).join('');
    }

    if (desktopCoursesMenu) desktopCoursesMenu.innerHTML = buildHierarchy(window.presentationData);
    if (desktopContentMenu) desktopContentMenu.innerHTML = buildHierarchy(window.downloadContentData);
    if (mobileCoursesMenu) mobileCoursesMenu.innerHTML = buildMobileHierarchy(window.presentationData);
    if (mobileContentMenu) mobileContentMenu.innerHTML = buildMobileHierarchy(window.downloadContentData);

    const mobilePortalBottom = document.getElementById('mobile-portal-bottom-nav');
    if (mobilePortalBottom && currentUser) {
        mobilePortalBottom.href = currentUser.rol === 'Profesor' ? 'teacher-dashboard.html' : 'student-dashboard.html';
    }
};
