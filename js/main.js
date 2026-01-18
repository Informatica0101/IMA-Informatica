/**
 * Unified UI Controller
 */
document.addEventListener('DOMContentLoaded', () => {
    // Current Year
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // --- Header Scroll Logic ---
    const header = document.getElementById('main-header');
    let lastScroll = 0;
    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 20) header.classList.add('header-scrolled');
            else header.classList.remove('header-scrolled');

            if (currentScroll > lastScroll && currentScroll > 100) header.classList.add('header-hidden');
            else header.classList.remove('header-hidden');
            lastScroll = currentScroll;
        });
    }

    // --- Mobile Menu Logic ---
    const btn = document.getElementById('mobile-menu-button');
    const closeBtn = document.getElementById('mobile-menu-close-button');
    const overlay = document.getElementById('mobile-menu-overlay');

    const toggleMenu = () => {
        if (!overlay) return;
        const isHidden = overlay.classList.contains('hidden');
        overlay.classList.toggle('hidden');
        overlay.classList.toggle('mobile-menu-overlay');
        document.body.style.overflow = isHidden ? 'hidden' : '';
    };

    if (btn) btn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);

    window.closeMobileMenu = () => {
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.classList.remove('mobile-menu-overlay');
        }
        document.body.style.overflow = '';
    };
});
