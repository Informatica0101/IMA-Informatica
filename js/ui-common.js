/**
 * Common UI Logic for all pages (Header, Mobile Menu, PWA)
 * Supports dynamic content and subdirectory paths.
 */

window.setupCommonUI = function() {
    // Scroll state for fixed navbar
    const nav = document.querySelector('.navbar-ima');
    window.addEventListener('scroll', () => {
        if (nav) {
            if (window.scrollY > 50) nav.classList.add('shadow-sm', 'bg-white');
            else nav.classList.remove('shadow-sm', 'bg-white');
        }
    });

    // PWA Logic
    setupPWALogic();

    // (A-28) Signal that common UI is ready
    document.dispatchEvent(new CustomEvent('common-ui-ready'));
};

function setupPWALogic() {
    let deferredPrompt;
    const installBtns = document.querySelectorAll(".pwa-install-action");
    const iosModal = document.getElementById("ios-install-modal");
    let iosModalInstance = iosModal ? new bootstrap.Modal(iosModal) : null;

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtns.forEach(btn => btn.classList.remove("d-none"));
    });

    installBtns.forEach(btn => btn.addEventListener("click", async () => {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            if (iosModalInstance) iosModalInstance.show();
            return;
        }
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") installBtns.forEach(btn => btn.classList.add("d-none"));
            deferredPrompt = null;
        } else {
            alert("Usa la opción 'Añadir a pantalla de inicio' en tu navegador.");
        }
    }));
}

window.renderCommonNav = function() {
    const navContainer = document.getElementById('main-nav-container');
    if (!navContainer) return;

    // Detect path depth to adjust assets
    const pathDepth = window.location.pathname.split('/').length - 2;
    const rootPath = "../".repeat(pathDepth);

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let portalLink = rootPath + 'login.html';
    let portalText = 'Portal';

    if (currentUser) {
        portalText = 'Dashboard';
        portalLink = rootPath + (currentUser.rol === 'Profesor' ? 'teacher-dashboard.html' : 'student-dashboard.html');
    }

    navContainer.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-light fixed-top navbar-ima py-3">
            <div class="container">
                <a class="navbar-brand d-flex align-items-center" href="${rootPath}index.html">
                    <img src="${rootPath}IMA-Logo.png" alt="IMA Logo" style="height: 45px;" class="me-2">
                    <span class="fw-bold text-primary d-none d-sm-inline">IMA Informatica</span>
                </a>
                <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto align-items-lg-center">
                        <li class="nav-item"><a class="nav-link fw-medium" href="${rootPath}index.html">Inicio</a></li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle fw-medium" href="#" id="coursesDropdown" role="button" data-bs-toggle="dropdown">Cursos</a>
                            <ul class="dropdown-menu border-0 shadow-lg" id="nav-grades-menu"></ul>
                        </li>
                        <li class="nav-item"><a class="nav-link fw-medium" href="${rootPath}pseudocode.html">PSeInt</a></li>
                        <li class="nav-item ms-lg-3">
                            <a href="${portalLink}" class="btn btn-ima-primary px-4 rounded-pill shadow-sm">
                                <i class="fas fa-user-circle me-1"></i> ${portalText}
                            </a>
                        </li>
                        ${currentUser ? `
                        <li class="nav-item ms-lg-2">
                            <button class="btn btn-link nav-link text-danger logout-action" onclick="window.logoutAction()"><i class="fas fa-sign-out-alt"></i></button>
                        </li>` : ''}
                    </ul>
                </div>
            </div>
        </nav>
    `;

    renderDynamicNavContent(rootPath);
};

function renderDynamicNavContent(rootPath) {
    const gradesMenu = document.getElementById('nav-grades-menu');
    if (gradesMenu && window.presentationData) {
        gradesMenu.innerHTML = window.presentationData.map(grade => `
            <li class="dropend">
                <a class="dropdown-item dropdown-toggle d-flex justify-content-between align-items-center py-2" href="#" data-bs-toggle="dropdown">${grade.grade}</a>
                <ul class="dropdown-menu border-0 shadow-lg">
                    ${grade.subjects.map(subject => `
                        <li class="dropend">
                            <a class="dropdown-item dropdown-toggle d-flex justify-content-between align-items-center py-2" href="#" data-bs-toggle="dropdown">${subject.name}</a>
                            <ul class="dropdown-menu border-0 shadow-lg">
                                ${subject.topics.map(topic => `
                                    <li><a class="dropdown-item py-2" href="${rootPath + topic.file}">${topic.title}</a></li>
                                `).join('')}
                            </ul>
                        </li>
                    `).join('')}
                </ul>
            </li>
        `).join('');
    }

    // Enable multi-level dropdown logic
    document.querySelectorAll('.dropdown-menu .dropdown-toggle').forEach(el => {
        el.addEventListener('click', function(e) {
            if (!this.nextElementSibling.classList.contains('show')) {
                this.closest('.dropdown-menu').querySelectorAll('.show').forEach(s => s.classList.remove('show'));
            }
            this.nextElementSibling.classList.toggle('show');
            e.stopPropagation();
            e.preventDefault();
        });
    });
}

window.renderCommonFooter = function() {
    const footerContainer = document.getElementById('main-footer-container');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer class="bg-dark text-light py-5 mt-auto">
            <div class="container">
                <div class="row g-4 align-items-center text-center text-md-start">
                    <div class="col-md-6">
                        <h5 class="fw-bold text-white mb-2">Instituto Maria Auxiliadora</h5>
                        <p class="small text-muted mb-0">"Formamos corazones con alegría, fe, esperanza... y tecnología"</p>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <div class="d-flex justify-content-center justify-content-md-end gap-3 mb-2">
                            <a href="#" class="text-muted text-decoration-none small">Privacidad</a>
                            <a href="#" class="text-muted text-decoration-none small">Términos</a>
                            <a href="https://wa.me/50488422786" target="_blank" class="text-muted text-decoration-none small">Soporte</a>
                        </div>
                        <p class="small text-muted mb-0">&copy; ${new Date().getFullYear()} Área de Informática. ISEMED.</p>
                    </div>
                </div>
            </div>
        </footer>
    `;
};

window.logoutAction = function() {
    localStorage.removeItem('currentUser');
    window.location.reload();
};

window.handleHeaderAction = function(action) {
    if (window.showMainContentSections) {
        window.showMainContentSections();
        if (action === 'load-peripherals-game') window.loadPeripheralsGame();
        else if (action === 'load-webmaster-quiz') window.loadWebMasterQuiz();
        else if (action === 'load-dexterity-game') window.loadDexterityGame();
    } else {
        window.location.href = 'index.html?action=' + action;
    }
};
