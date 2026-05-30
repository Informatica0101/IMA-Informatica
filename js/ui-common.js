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
    const mobileCoursesContainer = document.getElementById('mobile-courses-container');

    const mobileContentToggle = document.getElementById('mobile-content-toggle');
    const mobileContentArrow = document.getElementById('mobile-content-arrow');
    const mobileContentContainer = document.getElementById('mobile-content-container');

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
            [mobileCoursesContainer, mobileContentContainer].forEach(el => {
                if (el) { el.classList.add('hidden-height'); el.classList.remove('visible-height'); }
            });
            [mobileCoursesArrow, mobileContentArrow].forEach(el => {
                if (el) el.classList.remove('rotate-90');
            });
        }

        if (mobileMenuButton) mobileMenuButton.addEventListener('click', toggleMobileMenu);
        if (mobileMenuCloseButton) mobileMenuCloseButton.addEventListener('click', toggleMobileMenu);

        if (mobileCoursesToggle) {
            mobileCoursesToggle.addEventListener('click', () => {
                mobileCoursesContainer.classList.toggle('hidden-height');
                mobileCoursesContainer.classList.toggle('visible-height');
                mobileCoursesArrow.classList.toggle('rotate-90');
            });
        }
        if (mobileContentToggle) {
            mobileContentToggle.addEventListener('click', () => {
                mobileContentContainer.classList.toggle('hidden-height');
                mobileContentContainer.classList.toggle('visible-height');
                mobileContentArrow.classList.toggle('rotate-90');
            });
        }
    }

    // --- Profile Modal Logic ---
    const handleProfileClick = () => {
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
             // If on index, the modal might already be there and handled by index-ui.js
             // But we need a global way. Let's assume we trigger an event or call a function if available.
             const btn = document.getElementById('open-profile-btn');
             if (btn && btn.onclick) btn.onclick();
        } else {
            // On dashboards, the modal is in the HTML.
            const modal = document.getElementById('profile-modal');
            if (modal) {
                // Populate data if user exists
                const user = JSON.parse(localStorage.getItem('currentUser'));
                if (user) {
                    document.getElementById('profile-nombre').value = user.nombre || '';
                    document.getElementById('profile-email').value = user.email || '';
                    document.getElementById('profile-telefono').value = user.telefono || '';
                }
                modal.classList.remove('hidden');
            }
        }
        if (window.closeMobileMenu) window.closeMobileMenu();
    };

    if (openProfileBtn) openProfileBtn.addEventListener('click', handleProfileClick);
    if (mobileProfileBtn) mobileProfileBtn.addEventListener('click', handleProfileClick);

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
    if (window.closeMobileMenu) window.closeMobileMenu();
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
};
