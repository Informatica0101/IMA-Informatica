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
        selectedGradeData.subjects.forEach(subjectData => {
            gridDiv.appendChild(createCustomButton(subjectData.name, () => {
                selectedSubjectData = subjectData;
                animateContentTransition(renderDownloadTopics);
            }, 'w-full bg-gray-100 text-gray-800 shadow-none hover:bg-blue-600 hover:text-white'));
        });
        contentDisplayArea.appendChild(gridDiv);
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
        const mainHeader = document.getElementById('main-header');
        if (mainHeader) mainHeader.classList.add('header-hidden');
        mainContentSections.classList.add('hidden');
        mainContentSections.classList.remove('flex');
        dynamicallyLoadedGameContainer.classList.remove('hidden');
        mainContentTitle.textContent = title;

        try {
            const htmlResponse = await fetch(htmlPath);
            dynamicallyLoadedGameContainer.innerHTML = await htmlResponse.text();

            const script = document.createElement('script');
            script.src = jsPath;
            script.onload = () => {
                if (window[initFnName]) {
                    window[initFnName](window.gameDataStorage);
                }
            };
            dynamicallyLoadedGameContainer.appendChild(script);
        } catch (error) {
            console.error(`Error loading game ${gameId}:`, error);
            dynamicallyLoadedGameContainer.innerHTML = '<p class="text-red-500 p-8 text-center">Error al cargar el juego. Por favor, inténtalo de nuevo.</p>';
            dynamicallyLoadedGameContainer.appendChild(createCustomButton('Volver al Inicio', showMainContentSections, 'mt-4 mx-auto block'));
        }
    }

    window.showMainContentSections = showMainContentSections;
    window.loadPeripheralsGame = () => loadGame('peripherals', 'juegos/perifericos.html', 'js/perifericos_juego.js', 'initializePeripheralsGame', 'Juego de Periféricos');
    window.loadWebMasterQuiz = () => loadGame('webmaster', 'juegos/webmaster_quiz.html', 'js/webmaster_quiz_juego.js', 'initQuizGame', 'WebMaster Quiz');
    window.loadDexterityGame = () => loadGame('dexterity', 'juegos/destreza_teclado.html', 'js/destreza_teclado.js', 'initDexterityGame', 'Destreza en el Teclado');

    window.returnToMainContent = function() {
        const mainHeader = document.getElementById('main-header');
        if (mainHeader) mainHeader.classList.remove('header-hidden');
        dynamicallyLoadedGameContainer.innerHTML = '';
        ['js/perifericos_juego.js', 'js/webmaster_quiz_juego.js', 'js/destreza_teclado.js'].forEach(src => {
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

    // --- Mi Perfil (Global) ---
    const profileModal = document.getElementById('profile-modal');
    const openProfileBtn = document.getElementById('open-profile-btn');
    const closeProfileModal = document.getElementById('close-profile-modal');
    const profileForm = document.getElementById('profile-form');

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

            profileModal.classList.remove('hidden');
        };
    }

    if (closeProfileModal) {
        closeProfileModal.onclick = () => profileModal.classList.add('hidden');
    }

    const cancelProfileBtn = document.getElementById('cancel-profile-btn');
    if (cancelProfileBtn) {
        cancelProfileBtn.onclick = () => profileModal.classList.add('hidden');
    }

    if (profileForm) {
        profileForm.onsubmit = async (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const submitBtn = profileForm.querySelector('button[type="submit"]');
            const newPassword = document.getElementById('profile-password').value;
            const currentPassword = document.getElementById('profile-current-password').value;

            if (newPassword && !currentPassword) {
                alert('Debe ingresar su contraseña actual para realizar cambios de seguridad.');
                return;
            }

            const payload = {
                userId: user.userId,
                nombre: document.getElementById('profile-nombre').value,
                email: document.getElementById('profile-email').value,
                telefono: document.getElementById('profile-telefono').value,
                numeroLista: document.getElementById('profile-numeroLista') ? document.getElementById('profile-numeroLista').value : undefined,
                currentPassword: currentPassword || undefined,
                password: newPassword || undefined
            };

            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando...';

            try {
                const result = await fetchApi('USER', 'updateUserProfile', payload);
                if (result.status === 'success') {
                    user.nombre = payload.nombre;
                    user.email = payload.email;
                    user.telefono = payload.telefono;
                    if (payload.numeroLista !== undefined) user.numeroLista = payload.numeroLista;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    renderWelcomeMessage();
                    alert('Perfil actualizado correctamente.');
                    profileModal.classList.add('hidden');
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (err) {
                alert('Error de conexión.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Guardar Cambios';
            }
        };
    }
});

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
            // Identificar la noticia más reciente para un estilo destacado si se desea,
            // pero el requerimiento pide: Título, Primera Imagen, Primer Párrafo, Fecha.
            newsContainer.innerHTML = res.data.map((n, idx) => {
                // Extraer el primer párrafo del contenido HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = n.contenido;
                const firstP = tempDiv.querySelector('p') ? tempDiv.querySelector('p').innerText : tempDiv.innerText.substring(0, 150) + '...';

                return `
                <div class="${idx === 0 ? 'md:col-span-2 lg:col-span-2' : ''} bg-white rounded-[2rem] border border-gray-100 overflow-hidden group hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 transition-all duration-500">
                    <div class="${idx === 0 ? 'flex flex-col md:flex-row h-full' : 'flex flex-col'}">
                        ${n.imagenUrl ? `
                            <div class="${idx === 0 ? 'md:w-1/2 h-72 md:h-full' : 'h-56'} overflow-hidden">
                                <img src="${window.convertDriveLink ? window.convertDriveLink(n.imagenUrl) : n.imagenUrl}" alt="${n.titulo}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out">
                            </div>
                        ` : ''}
                        <div class="p-8 ${idx === 0 ? 'md:w-1/2 flex flex-col justify-center' : 'flex-grow flex flex-col'}">
                            <div class="flex items-center gap-3 mb-4">
                                <span class="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">${n.categoria}</span>
                                <span class="text-[10px] font-medium text-gray-300 uppercase tracking-wider">${new Date(n.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} ${n.hora ? '• ' + n.hora.substring(0,5) : ''}</span>
                            </div>
                            <h3 class="${idx === 0 ? 'text-2xl md:text-3xl' : 'text-xl'} font-semibold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">${n.titulo}</h3>
                            <p class="text-gray-500 text-sm leading-relaxed mb-6 ${idx === 0 ? 'line-clamp-4' : 'line-clamp-3'}">${firstP}</p>
                            <div class="mt-auto pt-6 border-t border-gray-50">
                                <span class="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 group-hover:text-blue-600 transition-all">
                                    Seguir Leyendo
                                    <svg class="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </span>
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
