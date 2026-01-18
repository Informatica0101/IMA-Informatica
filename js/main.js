/**
 * Global UI Controller
 */
document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const menuBtn = document.getElementById('mobile-menu-button');
    const closeBtn = document.getElementById('mobile-menu-close-button');
    const overlay = document.getElementById('mobile-menu-overlay');
    let lastScroll = 0;

    // --- User Session UI ---
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const authOnly = document.querySelectorAll('.auth-only');
    const userInfo = document.getElementById('user-info-nav');
    const mobileUserInfo = document.getElementById('mobile-user-nav');
    const studentNameEls = document.querySelectorAll('#student-name');
    const teacherNameEls = document.querySelectorAll('#teacher-name');

    if (user) {
        authOnly.forEach(el => el.classList.add('hidden'));
        if (userInfo) userInfo.classList.remove('hidden');
        if (mobileUserInfo) mobileUserInfo.classList.remove('hidden');

        studentNameEls.forEach(el => el.textContent = user.nombre);
        teacherNameEls.forEach(el => el.textContent = user.nombre);
    } else {
        authOnly.forEach(el => el.classList.remove('hidden'));
        if (userInfo) userInfo.classList.add('hidden');
        if (mobileUserInfo) mobileUserInfo.classList.add('hidden');
    }

    const logout = () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    };

    document.getElementById('logout-button')?.addEventListener('click', logout);
    document.getElementById('mobile-logout-button')?.addEventListener('click', logout);

    // --- Scroll Logic ---
    if (header) {
        window.addEventListener('scroll', () => {
            const current = window.pageYOffset;
            if (current > 20) header.classList.add('header-scrolled');
            else header.classList.remove('header-scrolled');

            if (current > lastScroll && current > 100) header.classList.add('header-hidden');
            else header.classList.remove('header-hidden');
            lastScroll = current;
        });
    }

    // --- Mobile Menu ---
    const toggleMenu = () => {
        if (!overlay) return;
        const isHidden = overlay.classList.contains('hidden');
        overlay.classList.toggle('hidden');
        overlay.classList.toggle('mobile-menu-overlay');
        document.body.style.overflow = isHidden ? 'hidden' : '';
    };

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);

    window.closeMobileMenu = () => {
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.classList.remove('mobile-menu-overlay');
        }
        document.body.style.overflow = '';
    };

    // Footer Year
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
