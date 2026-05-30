/**
 * Common UI Logic for all pages (Header, Mobile Menu, Scroll)
 */

window.setupCommonUI = function() {
    const mainHeader = document.getElementById('main-header');
    const openProfileBtn = document.getElementById('open-profile-btn');
    const mobileProfileBtn = document.getElementById('mobile-profile-btn-nav');

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
    window.openProfileModal = function() {
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
    };

    window.closeProfileModal = function() {
        const modal = document.getElementById('profile-modal');
        if (modal) modal.classList.add('hidden');
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

    // --- Unified Profile Form Handler (A-73/75) ---
    // Sincronizar campos y asegurar que la lógica sea atómica para evitar "Error de conexión"
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        // Remover listener anterior si existe para evitar duplicidad (frecuente en SPAs o recargas parciales)
        profileForm.onsubmit = null;

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

            // Validación de seguridad (Req 1.3)
            if (newPassword && !currentPassword) {
                alert('Debe ingresar su contraseña actual para establecer una nueva.');
                return;
            }

            const payload = {
                userId: user.userId, // Clave Primaria Persistente
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
                // Verificar que fetchApi esté disponible (Dependencia Crítica)
                if (typeof fetchApi !== 'function') {
                    throw new Error('El servicio de conexión (api.js) no se ha cargado correctamente.');
                }

                const result = await fetchApi('USER', 'updateUserProfile', payload);

                if (result.status === 'success') {
                    // Actualizar localStorage manteniendo campos no editables (grado, seccion, rol)
                    const updatedUser = { ...user, ...result.data };
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

                    // Actualizar Saludos en la UI
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

                    // Limpiar campos sensibles
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

window.openAcademicMenu = function() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');

    // Crear el modal si no existe
    let modal = document.getElementById('academic-menu-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'academic-menu-modal';
        // REDISEÑO UX (A-75): 0.98 opacity, fondo oscuro, desactivación de blur para legibilidad
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
    window.resetAcademicMenu();
};

window.closeAcademicMenu = function() {
    const modal = document.getElementById('academic-menu-modal');
    if (modal) {
        modal.classList.remove('opacity-100');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
};

window.resetAcademicMenu = function() {
    document.getElementById('academic-menu-options').classList.remove('hidden');
    document.getElementById('hierarchy-navigation').classList.add('hidden');
};

window.showAcademicHierarchy = function(type) {
    document.getElementById('academic-menu-options').classList.add('hidden');
    document.getElementById('hierarchy-navigation').classList.remove('hidden');
    window.renderHierarchyLevel(type, 'Grado');
};

window.renderHierarchyLevel = function(type, level, params = {}) {
    const container = document.getElementById('hierarchy-options');
    const label = document.getElementById('hierarchy-label');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const role = user.rol || 'Invitado';

    container.innerHTML = '<div class="p-8 text-center"><i class="fas fa-spinner fa-spin text-blue-600 text-2xl"></i></div>';

    // Obtener datos de window.presentationData (Cursos) o window.downloadContentData (Contenido)
    const sourceData = (type === 'Presentaciones') ? (window.presentationData || []) : (window.downloadContentData || []);

    let items = [];
    let nextLevel = '';

    switch(level) {
        case 'Grado':
            label.textContent = 'Selecciona Grado';
            items = [...new Set(sourceData.map(d => d.grado))];
            nextLevel = 'Sección';
            break;
        case 'Sección':
            label.textContent = 'Selecciona Sección';
            items = [...new Set(sourceData.filter(d => d.grado === params.grado).map(d => d.seccion))];
            // Estudiante: Sección -> Parcial. Profesor: Sección -> Asignatura.
            nextLevel = (role === 'Profesor') ? 'Asignatura' : 'Parcial';
            break;
        case 'Asignatura':
            label.textContent = 'Selecciona Asignatura';
            items = [...new Set(sourceData.filter(d =>
                d.grado === params.grado &&
                d.seccion === params.seccion &&
                (!params.parcial || d.parcial === params.parcial)
            ).map(d => d.asignatura))];
            nextLevel = (role === 'Profesor') ? 'Parcial' : 'Temas';
            if (type === 'Contenido' && role !== 'Profesor') nextLevel = 'Archivos';
            break;
        case 'Parcial':
            label.textContent = 'Selecciona Parcial';
            items = [...new Set(sourceData.filter(d =>
                d.grado === params.grado &&
                d.seccion === params.seccion &&
                (!params.asignatura || d.asignatura === params.asignatura)
            ).map(d => d.parcial))];
            // Estudiante: Parcial -> Asignatura. Profesor: Parcial -> Temas.
            nextLevel = (role === 'Profesor') ? (type === 'Presentaciones' ? 'Temas' : 'Archivos') : 'Asignatura';
            break;
        case 'Temas':
        case 'Archivos':
            label.textContent = (type === 'Presentaciones') ? 'Selecciona Tema' : 'Descargar Archivos';
            const finalFilter = { grado: params.grado, seccion: params.seccion, parcial: params.parcial };
            if (params.asignatura) finalFilter.asignatura = params.asignatura;

            const finalItems = sourceData.filter(d =>
                d.grado === finalFilter.grado &&
                d.seccion === finalFilter.seccion &&
                d.parcial === finalFilter.parcial &&
                (!finalFilter.asignatura || d.asignatura === finalFilter.asignatura)
            );

            if (finalItems.length === 0) {
                container.innerHTML = '<p class="text-center p-4 text-gray-500 text-sm">No hay contenido disponible.</p>';
                return;
            }

            container.innerHTML = finalItems.map(item => `
                <a href="${item.url}" ${type === 'Contenido' ? 'download' : 'target="_blank"'} class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all group">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg ${type === 'Presentaciones' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'} flex items-center justify-center text-xs">
                            <i class="fas ${type === 'Presentaciones' ? 'fa-desktop' : 'fa-download'}"></i>
                        </div>
                        <span class="text-sm font-semibold text-gray-700">${item.titulo}</span>
                    </div>
                    <i class="fas fa-chevron-right text-[10px] text-gray-300 group-hover:text-blue-500 transition-colors"></i>
                </a>
            `).join('');
            return;
    }

    if (items.length === 0) {
        container.innerHTML = '<p class="text-center p-4 text-gray-500 text-sm">No hay opciones disponibles.</p>';
        return;
    }

    container.innerHTML = items.map(item => `
        <button onclick='window.renderHierarchyLevel("${type}", "${nextLevel}", ${JSON.stringify({...params, [level.toLowerCase() === 'sección' ? 'seccion' : level.toLowerCase()]: item})})'
                class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all group">
            <span class="text-sm font-semibold text-gray-700">${item}</span>
            <i class="fas fa-chevron-right text-[10px] text-gray-300 group-hover:text-blue-500 transition-colors"></i>
        </button>
    `).join('');
};


window.renderCommonNav = function() {
    const desktopCoursesMenu = document.getElementById('desktop-courses-menu');
    const desktopContentMenu = document.getElementById('desktop-content-menu');
    const mobileCoursesMenu = document.getElementById('mobile-courses-menu');
    const mobileContentMenu = document.getElementById('mobile-content-menu');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isProfesor = currentUser && currentUser.rol === 'Profesor';

    function buildHierarchy(data, type) {
        // type: 'courses' or 'content'
        if (!data) return '';

        return data.map(grade => {
            // Student filtering: only their grade
            if (!isProfesor && currentUser && currentUser.grado && grade.grade !== currentUser.grado) return '';

            // Teacher view: Full hierarchy
            let html = `<div class="relative group/grade">
                <button class="block w-full text-left px-4 py-2 text-[11px] font-black text-gray-700 hover:bg-blue-50 hover:text-blue-600 uppercase tracking-widest transition-colors focus:outline-none">
                    ${grade.grade} <span class="float-right text-[10px] mt-0.5">&#9656;</span>
                </button>
                <div class="absolute left-full top-0 w-56 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/grade:opacity-100 group-hover/grade:visible border border-gray-100">`;

            // Filter subjects by section if student
            const filteredSubjects = grade.subjects.filter(subj => {
                if (!isProfesor && currentUser && currentUser.seccion) {
                    return subj.sections.includes(currentUser.seccion);
                }
                return true;
            });

            // Find current partial for student
            let studentPartial = "";
            if (!isProfesor && filteredSubjects.length > 0) {
                const partials = ["Cuarto Parcial", "Tercer Parcial", "Segundo Parcial", "Primer Parcial"];
                for (const p of partials) {
                    if (filteredSubjects.some(s => s.partial === p)) {
                        studentPartial = p;
                        break;
                    }
                }
            }

            // Group subjects by partial for Teacher, or filter for Student
            const partialGroups = {};
            filteredSubjects.forEach(subj => {
                if (!isProfesor && subj.partial !== studentPartial) return;
                if (!partialGroups[subj.partial]) partialGroups[subj.partial] = [];
                partialGroups[subj.partial].push(subj);
            });

            if (isProfesor) {
                // Teacher: Grade > Section (from data) > Partial > Subject > Topic
                // Since data is simplified, let's use what we have: Grade > Partial > Subject > Topic
                Object.keys(partialGroups).forEach(partial => {
                    html += `<div class="relative group/partial">
                        <button class="block w-full text-left px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 uppercase tracking-tight">
                            ${partial} <span class="float-right text-[10px] mt-0.5">&#9656;</span>
                        </button>
                        <div class="absolute left-full top-0 w-56 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/partial:opacity-100 group-hover/partial:visible border border-gray-100">`;

                    partialGroups[partial].forEach(subj => {
                        html += `<div class="relative group/subj">
                            <button class="block w-full text-left px-4 py-2 text-[10px] font-bold text-gray-500 hover:bg-blue-50 hover:text-blue-600 uppercase">
                                ${subj.name} <span class="float-right text-[10px] mt-0.5">&#9656;</span>
                            </button>
                            <div class="absolute left-full top-0 w-56 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/subj:opacity-100 group-hover/subj:visible border border-gray-100">`;
                        subj.topics.forEach(topic => {
                            html += `<a href="${topic.file}" class="block px-4 py-2 text-[11px] font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-50 last:border-0">${topic.title}</a>`;
                        });
                        html += `</div></div>`;
                    });
                    html += `</div></div>`;
                });
            } else {
                // Student: Subject > Topic (Directly for current partial)
                filteredSubjects.filter(s => s.partial === studentPartial).forEach(subj => {
                    html += `<div class="relative group/subj">
                        <button class="block w-full text-left px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 uppercase">
                            ${subj.name} <span class="float-right text-[10px] mt-0.5">&#9656;</span>
                        </button>
                        <div class="absolute left-full top-0 w-56 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/subj:opacity-100 group-hover/subj:visible border border-gray-100">`;
                    subj.topics.forEach(topic => {
                        html += `<a href="${topic.file}" class="block px-4 py-2 text-[11px] font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-50 last:border-0">${topic.title}</a>`;
                    });
                    html += `</div></div>`;
                });
            }

            html += `</div></div>`;
            return html;
        }).join('');
    }

    function buildMobileHierarchy(data) {
        if (!data) return '';
        return data.map(grade => {
            if (!isProfesor && currentUser && currentUser.grado && grade.grade !== currentUser.grado) return '';

            let html = `<button class="w-full text-left px-6 py-4 font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 flex justify-between items-center text-xs" onclick="this.nextElementSibling.classList.toggle('hidden')">
                ${grade.grade} <span>&#9662;</span>
            </button>
            <div class="hidden bg-gray-50/50">`;

            const filteredSubjects = grade.subjects.filter(subj => {
                if (!isProfesor && currentUser && currentUser.seccion) return subj.sections.includes(currentUser.seccion);
                return true;
            });

            let studentPartial = "";
            if (!isProfesor && filteredSubjects.length > 0) {
                const partials = ["Cuarto Parcial", "Tercer Parcial", "Segundo Parcial", "Primer Parcial"];
                for (const p of partials) {
                    if (filteredSubjects.some(s => s.partial === p)) { studentPartial = p; break; }
                }
            }

            filteredSubjects.forEach(subj => {
                if (!isProfesor && subj.partial !== studentPartial) return;
                html += `<button class="w-full text-left px-8 py-3 font-bold text-blue-600 uppercase tracking-tighter border-b border-gray-100 flex justify-between items-center text-[10px]" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    ${isProfesor ? `[${subj.partial}] ` : ''}${subj.name} <span>&#9662;</span>
                </button>
                <div class="hidden bg-white/50">`;
                subj.topics.forEach(topic => {
                    html += `<a href="${topic.file}" class="block px-10 py-3 text-[11px] font-medium text-gray-600 border-b border-gray-50 last:border-0" onclick="closeMobileMenu()">${topic.title}</a>`;
                });
                html += `</div>`;
            });

            html += `</div>`;
            return html;
        }).join('');
    }

    if (desktopCoursesMenu) desktopCoursesMenu.innerHTML = buildHierarchy(window.presentationData, 'courses');
    if (desktopContentMenu) desktopContentMenu.innerHTML = buildHierarchy(window.downloadContentData, 'content');
    if (mobileCoursesMenu) mobileCoursesMenu.innerHTML = buildMobileHierarchy(window.presentationData);
    if (mobileContentMenu) mobileContentMenu.innerHTML = buildMobileHierarchy(window.downloadContentData);

    // Sync portal link in bottom nav
    const mobilePortalBottom = document.getElementById('mobile-portal-bottom-nav');
    if (mobilePortalBottom && currentUser) {
        mobilePortalBottom.href = currentUser.rol === 'Profesor' ? 'teacher-dashboard.html' : 'student-dashboard.html';
    }
};
