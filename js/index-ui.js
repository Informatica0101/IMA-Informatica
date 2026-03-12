document.addEventListener('DOMContentLoaded', () => {
    // Setup Common UI
    if (window.setupCommonUI) window.setupCommonUI();
    if (window.renderCommonNav) window.renderCommonNav();

    const contentDisplayArea = document.getElementById('content-display-area');
    const mainContentTitle = document.getElementById('main-content-title');
    const dynamicallyLoadedGameContainer = document.getElementById('dynamically-loaded-game-container');

    let currentView = 'initial';
    let selectedGrade = null;
    let selectedSubject = null;

    function renderGrades() {
        currentView = 'grades';
        contentDisplayArea.innerHTML = `
            <div class="row g-3 justify-content-center animate-fade-in-up">
                ${window.downloadContentData.map(g => `
                    <div class="col-md-4">
                        <button class="btn btn-ima-primary w-100 py-3 shadow-sm" onclick="window.selectGrade('${g.grade}')">
                            <i class="fas fa-graduation-cap me-2"></i> ${g.grade}
                        </button>
                    </div>
                `).join('')}
            </div>`;
    }

    window.selectGrade = (gradeName) => {
        selectedGrade = window.downloadContentData.find(g => g.grade === gradeName);
        renderSubjects();
    };

    function renderSubjects() {
        currentView = 'subjects';
        contentDisplayArea.innerHTML = `
            <div class="row g-3 justify-content-center animate-fade-in-up">
                <div class="col-12 mb-2">
                    <button class="btn btn-sm btn-link text-decoration-none" onclick="renderGrades()"><i class="fas fa-arrow-left"></i> Volver a Grados</button>
                </div>
                ${selectedGrade.subjects.map(s => `
                    <div class="col-md-6">
                        <button class="btn btn-outline-primary w-100 py-3 fw-bold" onclick="window.selectSubject('${s.name}')">
                            <i class="fas fa-book me-2"></i> ${s.name}
                        </button>
                    </div>
                `).join('')}
            </div>`;
    }

    window.selectSubject = (subjectName) => {
        selectedSubject = selectedGrade.subjects.find(s => s.name === subjectName);
        renderTopics();
    };

    function renderTopics() {
        currentView = 'topics';
        contentDisplayArea.innerHTML = `
            <div class="row g-3 justify-content-center animate-fade-in-up">
                <div class="col-12 mb-2">
                    <button class="btn btn-sm btn-link text-decoration-none" onclick="renderSubjects()"><i class="fas fa-arrow-left"></i> Volver a Materias</button>
                </div>
                <div class="col-md-8">
                    <div class="list-group shadow-sm">
                        ${selectedSubject.topics.map(t => `
                            <a href="${t.file}" target="_blank" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3">
                                <span><i class="far fa-file-pdf text-danger me-2"></i> ${t.title}</span>
                                <i class="fas fa-download text-muted"></i>
                            </a>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }

    // --- Games Logic ---
    async function loadGame(path, js, init, title) {
        if (mainContentTitle) mainContentTitle.textContent = title;
        const sections = document.getElementById('main-content-sections');
        if (sections) sections.classList.add('d-none');
        dynamicallyLoadedGameContainer.classList.remove('d-none');

        try {
            const res = await fetch(path);
            dynamicallyLoadedGameContainer.innerHTML = await res.text();
            const script = document.createElement('script');
            script.src = js;
            script.onload = () => window[init] && window[init]();
            dynamicallyLoadedGameContainer.appendChild(script);
        } catch (e) {
            dynamicallyLoadedGameContainer.innerHTML = '<div class="alert alert-danger">Error al cargar juego.</div>';
        }
    }

    window.showMainContentSections = () => {
        document.getElementById('main-content-sections').classList.remove('d-none');
        dynamicallyLoadedGameContainer.classList.add('d-none');
        if (mainContentTitle) mainContentTitle.textContent = 'Contenido y Actividades';
    };

    window.loadPeripheralsGame = () => loadGame('juegos/perifericos.html', 'js/perifericos_juego.js', 'initializePeripheralsGame', 'Juego de Periféricos');
    window.loadWebMasterQuiz = () => loadGame('juegos/webmaster_quiz.html', 'js/webmaster_quiz_juego.js', 'initQuizGame', 'WebMaster Quiz');
    window.loadDexterityGame = () => loadGame('juegos/destreza_teclado.html', 'js/destreza_teclado.js', 'initDexterityGame', 'Destreza');

    document.addEventListener('common-ui-ready', () => {
        const action = new URLSearchParams(window.location.search).get('action');
        if (action) window.handleHeaderAction(action);
    });

    renderGrades();
});
