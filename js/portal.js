/**
 * Portal Single-Page-App Controller
 */

function showView(viewId) {
    const views = document.querySelectorAll('.app-view');
    views.forEach(v => v.classList.add('hidden'));

    const target = document.getElementById(viewId);
    if (target) {
        target.classList.remove('hidden');
        window.scrollTo(0, 0);
        updateHeaderUI();
    }
}

function updateHeaderUI() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const infoDesktop = document.getElementById('user-info-container');
    const infoMobile = document.getElementById('mobile-user-info');
    const logoutMobile = document.getElementById('mobile-logout-btn');
    const nameDisplay = document.getElementById('user-name-display');
    const nameMobile = document.getElementById('mobile-user-name');

    if (user) {
        if (infoDesktop) infoDesktop.classList.remove('hidden');
        if (infoMobile) infoMobile.classList.remove('hidden');
        if (logoutMobile) logoutMobile.classList.remove('hidden');
        if (nameDisplay) nameDisplay.textContent = user.nombre;
        if (nameMobile) nameMobile.textContent = user.nombre;
    } else {
        if (infoDesktop) infoDesktop.classList.add('hidden');
        if (infoMobile) infoMobile.classList.add('hidden');
        if (logoutMobile) logoutMobile.classList.add('hidden');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    updateHeaderUI();

    // Initial routing logic
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        showView('view-login');
    } else if (user.rol === 'Profesor') {
        showView('view-teacher');
    } else {
        showView('view-student');
    }

    // Attach logout buttons
    const logouts = ['global-logout-btn', 'mobile-logout-btn'];
    logouts.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', logout);
    });
});
