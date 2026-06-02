/**
 * UI Logic for index.html
 */

document.addEventListener('DOMContentLoaded', () => {
    // Setup Common UI (Header, Scroll, Logout)
    if (window.setupCommonUI) window.setupCommonUI();
    if (window.renderCommonNav) window.renderCommonNav();

    // --- DOM Elements specific to index.html ---
    const contentDisplayArea = document.getElementById('content-display-area');
    const contentBackButtonContainer = document.getElementById('content-back-button-container');
    const contentBackButton = document.getElementById('content-back-button');

    const mainContentSections = document.getElementById('main-content-sections');
    const mainContentTitle = document.getElementById('main-content-title');
    const showActivitiesButton = document.getElementById('show-activities-button');
    const initialActivityMenu = document.getElementById('initial-activity-menu');
    const gameListMenu = document.getElementById('game-list-menu');
    const backToMainActivitiesButton = document.getElementById('back-to-main-activities-button');
    const dynamicallyLoadedGameContainer = document.getElementById('dynamically-loaded-game-container');

    // --- State Variables ---
    let currentContentView = 'initial';
    let selectedGradeData = null;
    let selectedSubjectData = null;

    // --- Utility Functions ---
    function createCustomButton(text, onClickHandler, className = '') {
        const button = document.createElement('button');
        button.textContent = text;
        button.onclick = onClickHandler;
        button.className = `
            px-6 py-3 rounded-xl font-medium text-sm uppercase tracking-widest
            bg-blue-600 text-white hover:bg-blue-700
            transition-all duration-300 ease-in-out
            shadow-lg shadow-blue-100 hover:shadow-xl hover:shadow-blue-200 transform hover:-translate-y-0.5
            focus:outline-none focus:ring-4 focus:ring-blue-300
            ${className}
        `;
        return button;
    }

    function animateContentTransition(callback) {
        contentDisplayArea.classList.add('animate-fade-out-up');
        contentDisplayArea.addEventListener('animationend', () => {
            contentDisplayArea.classList.remove('animate-fade-out-up');
            contentDisplayArea.innerHTML = '';
            callback();
            contentDisplayArea.classList.add('animate-fade-in-down');
            contentDisplayArea.addEventListener('animationend', () => {
                contentDisplayArea.classList.remove('animate-fade-in-down');
            }, { once: true });
        }, { once: true });
    }


    // --- Content Section Logic ---
    function renderInitialContentButton() {
        contentBackButtonContainer.classList.add('hidden');
        contentDisplayArea.innerHTML = '';
        contentDisplayArea.appendChild(createCustomButton('Ver Recursos Académicos', renderDownloadGrades));
        currentContentView = 'initial';
    }

    function renderDownloadGrades() {
        contentBackButtonContainer.classList.add('hidden');
        contentDisplayArea.innerHTML = '';
        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg';

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        window.downloadContentData.forEach(gradeData => {
            // Filtrado por Grado
            if (currentUser && currentUser.grado && gradeData.grade !== currentUser.grado) return;

            gridDiv.appendChild(createCustomButton(gradeData.grade, () => {
                selectedGradeData = gradeData;
                animateContentTransition(renderDownloadSubjects);
            }, 'w-full bg-gray-100 text-gray-800 shadow-none hover:bg-blue-600 hover:text-white'));
        });
        contentDisplayArea.appendChild(gridDiv);
        currentContentView = 'grades';
    }

    function renderDownloadSubjects() {
        if (!selectedGradeData) return renderDownloadGrades();
        contentBackButtonContainer.classList.remove('hidden');
        contentDisplayArea.innerHTML = '';
        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg';

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const role = currentUser?.rol || 'Invitado';

        selectedGradeData.subjects.forEach(subjectData => {
            // REQ 7: Filtrado por Parcial Actual para no-profesores
            if (role !== 'Profesor' && subjectData.partial !== window.PARCIAL_ACTUAL) return;

            gridDiv.appendChild(createCustomButton(subjectData.name, () => {
                selectedSubjectData = subjectData;
                animateContentTransition(renderDownloadTopics);
            }, 'w-full bg-gray-100 text-gray-800 shadow-none hover:bg-blue-600 hover:text-white'));
        });

        if (gridDiv.children.length === 0) {
            contentDisplayArea.innerHTML = '<p class="text-gray-400 text-sm">No hay contenidos autorizados para este período.</p>';
        } else {
            contentDisplayArea.appendChild(gridDiv);
        }
        currentContentView = 'subjects';
    }

    function renderDownloadTopics() {
        if (!selectedSubjectData) return renderDownloadSubjects();
        contentBackButtonContainer.classList.remove('hidden');
        contentDisplayArea.innerHTML = '';
        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 gap-3 w-full max-w-lg';
        selectedSubjectData.topics.forEach(topic => {
            const link = document.createElement('a');
            link.href = topic.file;
            link.target = '_blank';
            link.className = `
                flex items-center justify-between px-6 py-4 rounded-2xl font-medium text-sm
                bg-gray-50 text-gray-800 border border-gray-100
                transition-all duration-300 ease-in-out
                hover:bg-white hover:shadow-xl hover:border-blue-200 transform hover:-translate-y-0.5
                focus:outline-none focus:ring-4 focus:ring-green-300 w-full group/link
            `;
            link.innerHTML = `
                <span class="truncate pr-4">${topic.title}</span>
                <span class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs group-hover/link:bg-blue-600 group-hover/link:text-white transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 10v6m0 0l3-3m-3 3l-3-3m0 6h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </span>
            `;
            gridDiv.appendChild(link);
        });
        contentDisplayArea.appendChild(gridDiv);
        currentContentView = 'topics';
    }

    if (contentBackButton) {
        contentBackButton.addEventListener('click', () => {
            animateContentTransition(() => {
                if (currentContentView === 'subjects') {
                    renderDownloadGrades();
                    selectedGradeData = null;
                } else if (currentContentView === 'topics') {
                    renderDownloadSubjects();
                    selectedSubjectData = null;
                } else {
                    renderInitialContentButton();
                }
            });
        });
    }

    // --- Activities & Games Logic ---
    function showMainContentSections() {
        if (!mainContentSections) return;
        mainContentSections.classList.remove('hidden');
        mainContentSections.classList.add('flex');
        dynamicallyLoadedGameContainer.classList.add('hidden');
        mainContentTitle.textContent = 'Contenido y Actividades';
        renderInitialActivityButton();
        window.scrollTo({ top: mainContentTitle.offsetTop - 100, behavior: 'smooth' });
    }

    async function loadGame(gameId, htmlPath, jsPath, initFnName, title) {
        // Estrategia de Aislamiento Total (Post-Commit Audit)
        const wrapper = document.getElementById('main-content-wrapper');
        const mainHeader = document.getElementById('main-header');

        // 1. Ocultar el wrapper principal de golpe para evitar condiciones de carrera con carga diferida
        if (wrapper) wrapper.style.display = 'none';
        if (mainHeader) mainHeader.classList.add('header-hidden');

        // 2. Crear un contenedor efímero exclusivo para el juego si no existe
        let gameOverlay = document.getElementById('dedicated-game-overlay');
        if (!gameOverlay) {
            gameOverlay = document.createElement('div');
            gameOverlay.id = 'dedicated-game-overlay';
            gameOverlay.className = 'flex-grow w-full bg-white animate-fade-in';
            document.body.insertBefore(gameOverlay, document.querySelector('footer'));
        }
        gameOverlay.innerHTML = '<div class="flex items-center justify-center min-h-[60vh]"><i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i></div>';
        gameOverlay.style.display = 'block';

        try {
            const htmlResponse = await fetch(htmlPath);
            gameOverlay.innerHTML = await htmlResponse.text();

            const script = document.createElement('script');
            script.src = jsPath;
            script.onload = () => {
                if (window[initFnName]) {
                    window[initFnName](window.gameDataStorage);
                }
            };
            gameOverlay.appendChild(script);
        } catch (error) {
            console.error(`Error loading game ${gameId}:`, error);
            gameOverlay.innerHTML = '<p class="text-red-500 p-8 text-center">Error al cargar el juego. Por favor, inténtalo de nuevo.</p>';
            gameOverlay.appendChild(createCustomButton('Volver al Inicio', window.returnToMainContent, 'mt-4 mx-auto block'));
        }
    }

    window.showMainContentSections = showMainContentSections;
    window.loadPeripheralsGame = () => loadGame('peripherals', 'juegos/perifericos.html', 'js/perifericos_juego.js', 'initializePeripheralsGame', 'Juego de Periféricos');
    window.loadWebMasterQuiz = () => loadGame('webmaster', 'juegos/webmaster_quiz.html', 'js/webmaster_quiz_juego.js', 'initQuizGame', 'WebMaster Quiz');
    window.loadQuizPro = () => loadGame('quizpro', 'juegos/quizpro.html', 'js/quizpro.js', 'initQuizPro', 'QuizPro');
    window.loadDexterityGame = () => loadGame('dexterity', 'juegos/destreza_teclado.html', 'js/destreza_teclado.js', 'initDexterityGame', 'Destreza en el Teclado');

    window.returnToMainContent = function() {
        const wrapper = document.getElementById('main-content-wrapper');
        const mainHeader = document.getElementById('main-header');
        const gameOverlay = document.getElementById('dedicated-game-overlay');

        if (gameOverlay) {
            gameOverlay.innerHTML = '';
            gameOverlay.style.display = 'none';
        }

        if (wrapper) wrapper.style.display = 'block';
        if (mainHeader) mainHeader.classList.remove('header-hidden');

        ['js/perifericos_juego.js', 'js/webmaster_quiz_juego.js', 'js/destreza_teclado.js', 'js/quizpro.js'].forEach(src => {
            const s = document.querySelector(`script[src="${src}"]`);
            if (s) s.remove();
        });

        showMainContentSections();
    };

    function renderInitialActivityButton() {
        if (!initialActivityMenu) return;
        initialActivityMenu.classList.remove('hidden');
        initialActivityMenu.classList.add('flex');
        gameListMenu.classList.add('hidden');
        gameListMenu.classList.remove('flex');
    }

    function renderActivityList() {
        initialActivityMenu.classList.add('hidden');
        initialActivityMenu.classList.remove('flex');
        gameListMenu.classList.remove('hidden');
        gameListMenu.classList.add('flex');
        mainContentTitle.textContent = 'Actividades';
    }

    if (showActivitiesButton) showActivitiesButton.addEventListener('click', renderActivityList);
    const pBtn = document.getElementById('select-peripherals-game-button');
    if (pBtn) pBtn.addEventListener('click', loadPeripheralsGame);
    const wBtn = document.getElementById('select-webmaster-quiz-button');
    if (wBtn) wBtn.addEventListener('click', loadWebMasterQuiz);
    const qBtn = document.getElementById('select-quiz-pro-button');
    if (qBtn) qBtn.addEventListener('click', loadQuizPro);
    const dBtn = document.getElementById('select-dexterity-game-button');
    if (dBtn) dBtn.addEventListener('click', loadDexterityGame);
    if (backToMainActivitiesButton) backToMainActivitiesButton.addEventListener('click', renderInitialActivityButton);

    // Game Storage
    window.gameDataStorage = {
        localStorageKey: 'gameProgressData',
        loadAllGameData() {
            try { return JSON.parse(localStorage.getItem(this.localStorageKey)) || {}; }
            catch (e) { return {}; }
        },
        saveGameSession(gameId, sessionData) {
            const all = this.loadAllGameData();
            if (!all[gameId]) all[gameId] = [];
            all[gameId].push(sessionData);
            localStorage.setItem(this.localStorageKey, JSON.stringify(all));
        }
    };

    renderInitialContentButton();
    renderInitialActivityButton();
    setupGlobalAuth();
    loadNews();
    renderWelcomeMessage();

    // --- Handle Action from URL (A-28) ---
    function processUrlAction() {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        if (action) {
            window.handleHeaderAction(action);
        }
    }

    // Escuchar el evento de que la UI común está lista para disparar acciones
    document.addEventListener('common-ui-ready', processUrlAction, { once: true });

    // --- Welcome Message Logic ---
    function renderWelcomeMessage() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const welcomeBadge = document.getElementById('user-welcome-badge');
        if (currentUser && welcomeBadge) {
            const firstName = currentUser.nombre.split(' ')[0];
            welcomeBadge.innerHTML = `
                <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                Bienvenido, ${firstName}
            `;
            welcomeBadge.classList.remove('hidden');
        }
    }

    // --- Guest Mode Logic ---
    const guestPromptModal = document.getElementById('guest-prompt-modal');
    const closeGuestModal = document.getElementById('close-guest-modal');

    document.addEventListener('guest-game-finished', (e) => {
        if (guestPromptModal) {
            guestPromptModal.classList.remove('hidden');
        }
    });

    if (closeGuestModal) {
        closeGuestModal.onclick = () => guestPromptModal.classList.add('hidden');
    }

    // --- Mi Perfil (Sincronizado vía ui-common.js) ---
    const openProfileBtn = document.getElementById('open-profile-btn');
    const profileModal = document.getElementById('profile-modal');
    const closeProfileModal = document.getElementById('close-profile-modal');

    if (openProfileBtn) {
        openProfileBtn.onclick = () => {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (!user) return;
            document.getElementById('profile-nombre').value = user.nombre;
            document.getElementById('profile-email').value = user.email || '';
            document.getElementById('profile-telefono').value = user.telefono || '';

            const nlInput = document.getElementById('profile-numeroLista');
            const nlContainer = document.getElementById('profile-numeroLista-container');
            if (nlInput) nlInput.value = user.numeroLista || '';
            if (nlContainer) {
                if (user.rol === 'Profesor') nlContainer.classList.add('hidden');
                else nlContainer.classList.remove('hidden');
            }
            if (profileModal) profileModal.classList.remove('hidden');
        };
    }
    if (closeProfileModal) closeProfileModal.onclick = () => profileModal.classList.add('hidden');
    const cancelProfileBtn = document.getElementById('cancel-profile-btn');
    if (cancelProfileBtn) cancelProfileBtn.onclick = () => profileModal.classList.add('hidden');


/**
 * Login Modal Logic
 */
(function() {
    // --- Modal Logic ---
    const loginModal = document.getElementById('login-modal');
    const loginModalContent = document.getElementById('login-modal-content');
    const closeLoginModal = document.getElementById('close-login-modal');
    const accessButtonContainer = document.getElementById('access-button-container');

    function openModal() {
        if (!loginModal) return;
        loginModal.classList.remove('opacity-0', 'pointer-events-none');
        if (loginModalContent) {
            loginModalContent.classList.remove('scale-95');
            loginModalContent.classList.add('scale-100');
        }
    }

    function closeModal() {
        if (!loginModal) return;
        loginModal.classList.add('opacity-0', 'pointer-events-none');
        if (loginModalContent) {
            loginModalContent.classList.remove('scale-100');
            loginModalContent.classList.add('scale-95');
        }
    }

    if (closeLoginModal) closeLoginModal.addEventListener('click', closeModal);
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) closeModal();
        });
    }

    function renderAccessButton() {
        if (!accessButtonContainer) return;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        accessButtonContainer.innerHTML = '';

        if (currentUser) {
            const portalBtn = document.createElement('a');
            portalBtn.href = currentUser.rol === 'Profesor' ? 'teacher-dashboard.html' : 'student-dashboard.html';
            portalBtn.className = 'px-10 py-5 rounded-2xl font-medium text-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1';
            portalBtn.textContent = 'Ir al Portal';
            accessButtonContainer.appendChild(portalBtn);
        } else {
            const loginBtn = document.createElement('button');
            loginBtn.className = 'px-10 py-5 rounded-2xl font-medium text-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1';
            loginBtn.textContent = 'Iniciar Sesión';
            loginBtn.addEventListener("click", openModal);
            accessButtonContainer.appendChild(loginBtn);
        }
    }

    renderAccessButton();
})();

/**
 * Global Authentication Helper
 */
function setupGlobalAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const desktopPortalLink = document.getElementById('desktop-portal-link');
    const desktopCoursesNav = document.getElementById('desktop-courses-nav');
    const desktopResourcesNav = document.getElementById('desktop-resources-nav');
    const desktopUserMenu = document.getElementById('desktop-user-menu');
    const desktopLogoutBtn = document.getElementById('desktop-logout-btn');
    const downloadSection = document.getElementById('download-section');

    if (currentUser) {
        // Logged in
        if (desktopPortalLink) desktopPortalLink.classList.add('hidden');
        if (desktopUserMenu) desktopUserMenu.classList.remove('hidden');

        if (desktopLogoutBtn) {
            desktopLogoutBtn.onclick = () => {
                localStorage.removeItem('currentUser');
                window.location.reload();
            };
        }
    } else {
        // Guest
        if (desktopCoursesNav) desktopCoursesNav.classList.add('hidden');
        if (desktopResourcesNav) desktopResourcesNav.classList.add('hidden');
        if (downloadSection) downloadSection.classList.add('hidden');
    }
}

/**
 * News System
 */
async function loadNews() {
    const newsSection = document.getElementById('news-section');
    const newsContainer = document.getElementById('news-container');
    if (!newsSection || !newsContainer) return;

    try {
        const res = await fetchApi('USER', 'getNews', {});
        if (res.status === 'success' && res.data.length > 0) {
            newsSection.classList.remove('hidden');

            // Mostrar las 3 noticias más recientes (o todas si hay menos de 3)
            const newsToShow = res.data.slice(0, 3);

            newsContainer.innerHTML = newsToShow.map((n, idx) => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = n.contenido;

                // Extraer un fragmento representativo del contenido (primer párrafo o 180 caracteres)
                let excerpt = "";
                const paragraphs = tempDiv.querySelectorAll('p');
                if (paragraphs.length > 0) {
                    excerpt = paragraphs[0].innerText.trim();
                } else {
                    excerpt = tempDiv.innerText.trim();
                }

                if (excerpt.length > 180) {
                    excerpt = excerpt.substring(0, 177) + "...";
                }

                const imgUrl = window.convertDriveLink(n.imagenUrl);

                return `
                <div class="${idx === 0 ? 'md:col-span-2 lg:col-span-2' : ''} bg-white rounded-[2rem] border border-gray-100 overflow-hidden group hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 transition-all duration-500">
                    <div class="${idx === 0 ? 'flex flex-col md:flex-row h-full' : 'flex flex-col'}">
                        ${n.imagenUrl ? `
                            <div class="${idx === 0 ? 'md:w-1/2 h-72 md:h-full' : 'h-56'} overflow-hidden">
                                <img src="${imgUrl}" alt="${n.titulo}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out">
                            </div>
                        ` : `
                            <div class="${idx === 0 ? 'md:w-1/2 h-72 md:h-full' : 'h-56'} bg-gray-50 flex items-center justify-center text-gray-200">
                                <i class="fas fa-newspaper text-6xl"></i>
                            </div>
                        `}
                        <div class="p-8 ${idx === 0 ? 'md:w-1/2 flex flex-col justify-center' : 'flex-grow flex flex-col'}">
                            <div class="flex items-center gap-3 mb-4">
                                <span class="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">${n.categoria}</span>
                                <span class="text-[10px] font-medium text-gray-300 uppercase tracking-wider">${new Date(n.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} ${n.hora ? '• ' + n.hora.substring(0,5) : ''}</span>
                            </div>
                            <h3 class="${idx === 0 ? 'text-2xl md:text-3xl' : 'text-xl'} font-semibold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tighter">${n.titulo}</h3>
                            <p class="text-gray-500 text-sm leading-relaxed mb-6 ${idx === 0 ? 'line-clamp-4' : 'line-clamp-3'} font-medium">${excerpt}</p>
                            <div class="mt-auto pt-6 border-t border-gray-50">
                                <button onclick='window.showNewsDetail(${JSON.stringify(n).replace(/'/g, "&apos;")})' class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-800 transition-all">
                                    Seguir Leyendo
                                    <svg class="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        }
    } catch (e) {
        console.error("Error loading news:", e);
    }
}

window.showNewsDetail = function(news) {
    const modal = document.getElementById('news-detail-modal');
    if (!modal) return;

    const imgUrl = window.convertDriveLink(news.imagenUrl);
    document.getElementById('news-modal-image').src = imgUrl;
    document.getElementById('news-modal-category').textContent = news.categoria;
    document.getElementById('news-modal-title').textContent = news.titulo;
    document.getElementById('news-modal-meta').textContent = `${new Date(news.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} ${news.hora ? '• ' + news.hora.substring(0,5) : ''}`;
    document.getElementById('news-modal-content').innerHTML = news.contenido;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Event listeners para cerrar
    const closeBtn = document.getElementById('close-news-detail-modal');
    const closeBtnFooter = document.getElementById('close-news-detail-btn');

    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    closeBtn.onclick = closeModal;
    closeBtnFooter.onclick = closeModal;
    modal.onclick = (e) => { if(e.target === modal) closeModal(); };
};
});
