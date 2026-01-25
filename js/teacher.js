document.addEventListener('DOMContentLoaded', () => {
    // (A-29) Centralizar capacidades por rol
    const RoleCapabilities = {
        canGrade: (user) => user && user.rol === 'Profesor',
        canManageExams: (user) => user && user.rol === 'Profesor'
    };

    let submissionsTableBody = document.getElementById('submissions-table-body');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser || !RoleCapabilities.canManageExams(currentUser)) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('teacher-name').textContent = currentUser.nombre;

    // --- Elementos de Navegación y Secciones ---
    const navDashboard = document.getElementById('nav-dashboard');
    const navCrear = document.getElementById('nav-crear');
    const navCrearExamen = document.getElementById('nav-crear-examen');
    const sectionDashboard = document.getElementById('section-dashboard');
    const sectionCrear = document.getElementById('section-crear');
    const sectionCrearExamen = document.getElementById('section-crear-examen');
    const createAssignmentForm = document.getElementById('create-assignment-form');
    const createExamForm = document.getElementById('create-exam-form');
    const logoutButton = document.getElementById('logout-button');
    const studentSearchInput = document.getElementById('student-search');
    const backNavBtn = document.getElementById('back-nav-btn');
    const dashboardLevelTitle = document.getElementById('dashboard-level-title');
    const pendingFilterContainer = document.getElementById('pending-filter-container');
    const onlyPendingFilter = document.getElementById('only-pending-filter');
    const dashboardTableHead = document.getElementById('dashboard-table-head');

    let allActivityRaw = [];
    let currentFilteredItems = []; // Almacena los ítems renderizados actualmente para acceso seguro
    let currentSort = { field: 'fecha', direction: 'desc' };
    let studentSort = { field: 'nombre', direction: 'asc' };
    let navStack = [{ level: 'Grados', data: null }]; // Stack de navegación

    const allSections = [sectionDashboard, sectionCrear, sectionCrearExamen];
    const allNavLinks = [navDashboard, navCrear, navCrearExamen];

    // --- Lógica de Navegación ---
    function navigateTo(targetSection, navElement) {
        allSections.forEach(section => section.classList.add('hidden'));
        targetSection.classList.remove('hidden');
        allNavLinks.forEach(link => {
            link.classList.remove('bg-gray-700', 'text-white');
            link.classList.add('text-gray-700');
        });
        navElement.classList.add('bg-gray-700', 'text-white');
        navElement.classList.remove('text-gray-700');
    }

    navDashboard.addEventListener('click', () => {
        navigateTo(sectionDashboard, navDashboard);
        navStack = [{ level: 'Grados', data: null }];
        fetchTeacherActivity();
    });
    navCrear.addEventListener('click', () => navigateTo(sectionCrear, navCrear));
    navCrearExamen.addEventListener('click', () => navigateTo(sectionCrearExamen, navCrearExamen));
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    /**
     * Extrae el ID de un archivo de Google Drive desde varios formatos de URL o devuelve el ID si ya está limpio.
     * @param {string} urlOrId La URL del archivo de Google Drive o un ID de archivo.
     * @returns {string|null} El ID del archivo extraído o null si no se encuentra.
     */
    function extractDriveId(urlOrId) {
        if (!urlOrId) return null;

        // Si la cadena no contiene '/', asumimos que ya es un ID.
        // Esto maneja los casos en que el backend ya proporciona un ID limpio.
        if (!urlOrId.includes('/')) {
            return urlOrId;
        }

        // Patrón para URL estándar de Google Drive (e.g., /d/ID/view)
        let match = urlOrId.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
            return match[1];
        }

        // Patrón para formatos donde el ID es el último segmento de la ruta (e.g., /.../ID)
        // Se busca una cadena con longitud típica de un ID de Drive para evitar falsos positivos.
        match = urlOrId.match(/\/([a-zA-Z0-9-_]{28,})(?=\/?$|\?)/);
        if (match && match[1]) {
            return match[1];
        }

        return null; // Si no se encuentra un ID válido, devuelve null.
    }

    // --- Lógica de Navegación Jerárquica ---
    function pushNav(level, data) {
        if (studentSearchInput) studentSearchInput.value = '';
        navStack.push({ level, data });
        renderCurrentLevel();
    }

    function popNav() {
        if (navStack.length > 1) {
            if (studentSearchInput) studentSearchInput.value = '';
            navStack.pop();
            renderCurrentLevel();
        }
    }

    if (backNavBtn) backNavBtn.addEventListener('click', popNav);

    // --- Carga de Actividad del Profesor ---
    async function fetchTeacherActivity() {
        if (!submissionsTableBody) return;
        submissionsTableBody.innerHTML = '<tr><td colspan="10" class="text-center p-1.5">Cargando actividad...</td></tr>';
        try {
            const payload = {
                profesorId: currentUser.userId,
                grado: currentUser.grado,
                seccion: currentUser.seccion
            };

            const [taskSubmissions, examSubmissions, allExams] = await Promise.all([
                fetchApi('TASK', 'getTeacherActivity', payload),
                fetchApi('EXAM', 'getTeacherExamActivity', payload),
                fetchApi('EXAM', 'getAllExams', { profesorId: currentUser.userId })
            ]);

            const submissions = [
                ...(((taskSubmissions || {}).data || [])).map(s => ({ ...s, tipo: 'Tarea' })),
                ...(((examSubmissions || {}).data || [])).map(s => ({ ...s, tipo: 'Examen' }))
            ];
            const submittedExamIds = new Set((((examSubmissions || {}).data || [])).map(s => s.examenId));
            const examsWithoutSubmissions = (((allExams || {}).data || []))
                .filter(exam => !submittedExamIds.has(exam.examenId))
                .map(exam => ({ ...exam, tipo: 'Examen' }));

            allActivityRaw = [...submissions, ...examsWithoutSubmissions].map(item => ({
                ...item,
                grado: item.grado || item.gradoAsignado,
                seccion: item.seccion || item.seccionAsignada
            }));
            renderCurrentLevel();
        } catch (error) {
            submissionsTableBody.innerHTML = `<tr><td colspan="10" class="text-center p-1.5 text-red-500">Error al cargar actividad: ${error.message}</td></tr>`;
        }
    }

    function renderCurrentLevel() {
        const current = navStack[navStack.length - 1];

        // Limpiar scroll horizontal clean si no estamos en Detalles
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer && current.level !== 'Detalles') {
            tableContainer.classList.remove('scroll-horizontal-clean');
        }

        let title = current.level;
        if (current.level === 'Secciones') title = `Secciones - ${current.data.grado}`;
        else if (current.level === 'Asignaturas') title = `Asignaturas - ${current.data.grado} ${current.data.seccion}`;
        else if (current.level === 'Alumnos') title = `Alumnos - ${current.data.asignatura}`;
        else if (current.level === 'Exámenes') title = `Exámenes - ${current.data.asignatura}`;
        else if (current.level === 'Detalles') title = `Actividades - ${current.data.alumnoNombre}`;

        if (dashboardLevelTitle) dashboardLevelTitle.textContent = title;
        if (backNavBtn) {
            if (navStack.length > 1) backNavBtn.classList.remove('hidden');
            else backNavBtn.classList.add('hidden');
        }

        // Mostrar/Ocultar filtro de pendientes solo en el nivel de Alumnos
        if (pendingFilterContainer) {
            if (current.level === 'Alumnos') pendingFilterContainer.classList.remove('hidden');
            else pendingFilterContainer.classList.add('hidden');
        }

        const searchTerm = (studentSearchInput ? studentSearchInput.value : '').trim().toLowerCase();

        // (A-31) Priorizar búsqueda global si hay texto y no estamos en detalles profundos
        if (searchTerm !== '' && current.level !== 'Detalles') {
            renderGlobalSearch(searchTerm);
            return;
        }

        // Determinar qué renderizar según el nivel
        switch (current.level) {
            case 'Grados': renderGrados(searchTerm); break;
            case 'Secciones': renderSecciones(current.data.grado, searchTerm); break;
            case 'Asignaturas': renderAsignaturas(current.data.grado, current.data.seccion, searchTerm); break;
            case 'Alumnos': renderAlumnos(current.data.grado, current.data.seccion, current.data.asignatura, searchTerm); break;
            case 'Exámenes': renderExamenesGestion(current.data.grado, current.data.seccion, current.data.asignatura, searchTerm); break;
            case 'Detalles': renderDetalles(current.data.alumnoNombre, current.data.grado, current.data.seccion, current.data.asignatura, searchTerm); break;
        }
    }

    function renderGlobalSearch(search) {
        if (dashboardLevelTitle) dashboardLevelTitle.textContent = "Resultados de Búsqueda Global";

        // Extraer alumnos únicos con su metadata
        const alumnosGlobal = [];
        const seen = new Set();

        allActivityRaw.forEach(item => {
            if (!item.alumnoNombre) return;
            const key = `${item.alumnoNombre}-${item.grado}-${item.seccion}-${item.asignatura}`;
            if (!seen.has(key)) {
                if (item.alumnoNombre.toLowerCase().includes(search)) {
                    alumnosGlobal.push({
                        nombre: item.alumnoNombre,
                        grado: item.grado,
                        seccion: item.seccion,
                        asignatura: item.asignatura
                    });
                    seen.add(key);
                }
            }
        });

        currentFilteredItems = alumnosGlobal;

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Alumno</th>
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Grado / Sección</th>
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Asignatura</th>
                <th class="p-1 text-right font-bold text-gray-600 whitespace-nowrap">Acción</th>
            </tr>`;

        if (alumnosGlobal.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="4" class="text-center p-2 text-gray-500">No se encontraron alumnos con ese nombre.</td></tr>';
            return;
        }

        submissionsTableBody.innerHTML = alumnosGlobal.map((a, idx) => `
            <tr class="border-b hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}">
                <td class="p-1 whitespace-nowrap font-semibold text-blue-700 text-sm text-custom-plus">${a.nombre}</td>
                <td class="p-1 whitespace-nowrap text-xs text-gray-600">${a.grado} - ${a.seccion || 'N/A'}</td>
                <td class="p-1 whitespace-nowrap text-xs text-gray-600">${a.asignatura}</td>
                <td class="p-1 text-right whitespace-nowrap">
                     <span class="text-blue-600 font-bold text-xs">Ver actividades &rsaquo;</span>
                </td>
            </tr>
        `).join('');
    }

    function renderGrados(search) {
        const grados = [...new Set(allActivityRaw.map(item => item.grado).filter(g => g))];
        const filtered = grados.filter(g => g.toLowerCase().includes(search));
        currentFilteredItems = filtered;

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Grado</th>
                <th class="p-1 text-right font-bold text-gray-600 whitespace-nowrap">Acción</th>
            </tr>`;

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="2" class="text-center p-2 text-gray-500">No hay grados encontrados.</td></tr>';
            return;
        }

        submissionsTableBody.innerHTML = filtered.map((grado, idx) => `
            <tr class="border-b hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}">
                <td class="p-1 font-semibold text-gray-800 whitespace-nowrap text-custom-plus">${grado}</td>
                <td class="p-1 text-right whitespace-nowrap">
                    <span class="text-blue-600 font-bold text-xs">Ver Secciones &rsaquo;</span>
                </td>
            </tr>
        `).join('');
    }

    function renderSecciones(grado, search) {
        const secciones = [...new Set(allActivityRaw.filter(i => i.grado === grado).map(i => i.seccion).filter(s => s))];
        const filtered = secciones.filter(s => s.toLowerCase().includes(search));
        currentFilteredItems = filtered;

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Sección</th>
                <th class="p-1 text-right font-bold text-gray-600 whitespace-nowrap">Acción</th>
            </tr>`;

        submissionsTableBody.innerHTML = filtered.map((seccion, idx) => `
            <tr class="border-b hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}">
                <td class="p-1 font-semibold text-gray-800 whitespace-nowrap text-custom-plus">${seccion}</td>
                <td class="p-1 text-right whitespace-nowrap">
                    <span class="text-blue-600 font-bold text-xs">Ver Asignaturas &rsaquo;</span>
                </td>
            </tr>
        `).join('');
    }

    function renderAsignaturas(grado, seccion, search) {
        const asignaturas = [...new Set(allActivityRaw.filter(i => i.grado === grado && i.seccion === seccion).map(i => i.asignatura).filter(a => a))];
        const filtered = asignaturas.filter(a => a.toLowerCase().includes(search));
        currentFilteredItems = filtered;

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Asignatura</th>
                <th class="p-1 text-right font-bold text-gray-600 whitespace-nowrap">Acción</th>
            </tr>`;

        submissionsTableBody.innerHTML = filtered.map((asig, idx) => `
            <tr class="border-b hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}">
                <td class="p-1 font-semibold text-gray-800 whitespace-nowrap text-custom-plus">${asig}</td>
                <td class="p-1 text-right whitespace-nowrap">
                    <span class="text-blue-600 font-bold text-xs">Ver Alumnos &rsaquo;</span>
                </td>
            </tr>
        `).join('');
    }

    function renderAlumnos(grado, seccion, asignatura, search) {
        const current = navStack[navStack.length - 1];
        const activeTab = current.data.tab || 'tareas';
        const showOnlyPending = onlyPendingFilter && onlyPendingFilter.checked;

        if (activeTab === 'examenes') {
            renderAlumnosExamenes(grado, seccion, asignatura, search);
            return;
        }

        // Agrupar por alumno para ver su estado general en esta asignatura (Tareas)
        const alumnosMap = {};
        allActivityRaw.filter(i => i.grado === grado && i.seccion === seccion && i.asignatura === asignatura && i.tipo === 'Tarea')
            .forEach(item => {
                if (!item.alumnoNombre) return;
                if (!alumnosMap[item.alumnoNombre]) {
                    alumnosMap[item.alumnoNombre] = {
                        nombre: item.alumnoNombre,
                        pendientes: 0,
                        total: 0
                    };
                }
                alumnosMap[item.alumnoNombre].total++;
                if (item.estado === 'Pendiente' || !item.estado || item.estado === 'Por calificar') {
                    alumnosMap[item.alumnoNombre].pendientes++;
                }
            });

        let alumnos = Object.values(alumnosMap);
        if (showOnlyPending) {
            alumnos = alumnos.filter(a => a.pendientes > 0);
        }

        // Aplicar ordenamiento
        alumnos.sort((a, b) => {
            let valA, valB;
            if (studentSort.field === 'nombre') {
                valA = a.nombre.toLowerCase();
                valB = b.nombre.toLowerCase();
            } else {
                valA = a.pendientes;
                valB = b.pendientes;
            }
            if (valA < valB) return studentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return studentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        const filtered = alumnos.filter(a => a.nombre.toLowerCase().includes(search));
        currentFilteredItems = filtered;

        const sortIconName = studentSort.field === 'nombre' ? (studentSort.direction === 'asc' ? ' ↑' : ' ↓') : '';
        const sortIconStatus = studentSort.field === 'estado' ? (studentSort.direction === 'asc' ? ' ↑' : ' ↓') : '';

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-1 text-left font-bold text-gray-600 cursor-pointer sort-student select-none whitespace-nowrap" data-field="nombre">
                    Nombre del Alumno${sortIconName}
                </th>
                <th class="p-1 text-left font-bold text-gray-600 cursor-pointer sort-student select-none whitespace-nowrap" data-field="estado">
                    Estado${sortIconStatus}
                </th>
                <th class="p-1 text-right whitespace-nowrap">
                    <div class="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                        <button class="px-2 py-1 rounded-md text-[10px] font-bold transition-all ${activeTab === 'tareas' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'} alumno-tab-btn" data-tab="tareas">Tareas</button>
                        <button class="px-2 py-1 rounded-md text-[10px] font-bold transition-all ${activeTab === 'examenes' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'} alumno-tab-btn" data-tab="examenes">Exámenes</button>
                        <button class="px-2 py-1 rounded-md text-[10px] font-bold transition-all ${activeTab === 'gestion' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'} alumno-tab-btn" data-tab="gestion">Gestión</button>
                    </div>
                </th>
            </tr>`;

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="3" class="text-center p-2 text-gray-500">No hay alumnos con tareas.</td></tr>';
            return;
        }

        submissionsTableBody.innerHTML = filtered.map((a, idx) => `
            <tr class="border-b hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}">
                <td class="p-1 whitespace-nowrap font-semibold text-blue-700 text-sm text-custom-plus">${a.nombre}</td>
                <td class="p-1 whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${a.pendientes > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}">
                        ${a.pendientes > 0 ? `${a.pendientes} pendientes` : 'Al día'}
                    </span>
                </td>
                <td class="p-1 text-right whitespace-nowrap">
                     <span class="text-blue-600 font-bold text-xs">Ver detalles &rsaquo;</span>
                </td>
            </tr>
        `).join('');
    }

    function renderAlumnosExamenes(grado, seccion, asignatura, search) {
        const showOnlyPending = onlyPendingFilter && onlyPendingFilter.checked;

        // Filtrar solo entregas de exámenes
        let entregasExamen = allActivityRaw.filter(i =>
            i.tipo === 'Examen' &&
            i.alumnoNombre &&
            i.grado === grado &&
            i.seccion === seccion &&
            i.asignatura === asignatura
        );

        if (showOnlyPending) {
            entregasExamen = entregasExamen.filter(i => i.estado === 'Pendiente' || !i.estado || i.estado === 'Por calificar');
        }

        const filtered = entregasExamen.filter(i => i.alumnoNombre.toLowerCase().includes(search));
        currentFilteredItems = filtered;

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Nombre del Alumno</th>
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Examen</th>
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Calificación</th>
                <th class="p-1 text-right whitespace-nowrap">
                    <div class="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                        <button class="px-2 py-1 rounded-md text-[10px] font-bold transition-all text-gray-500 hover:text-gray-700 alumno-tab-btn" data-tab="tareas">Tareas</button>
                        <button class="px-2 py-1 rounded-md text-[10px] font-bold transition-all text-gray-500 hover:text-gray-700 alumno-tab-btn" data-tab="examenes">Exámenes</button>
                        <button class="px-2 py-1 rounded-md text-[10px] font-bold transition-all text-gray-500 hover:text-gray-700 alumno-tab-btn" data-tab="gestion">Gestión</button>
                    </div>
                </th>
            </tr>`;

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="4" class="text-center p-2 text-gray-500">No hay entregas de exámenes.</td></tr>';
            return;
        }

        submissionsTableBody.innerHTML = filtered.map((item, idx) => `
            <tr class="border-b hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}">
                <td class="p-1 whitespace-nowrap font-semibold text-gray-800 text-sm text-custom-plus">${item.alumnoNombre}</td>
                <td class="p-1 whitespace-nowrap text-sm">${item.titulo}</td>
                <td class="p-1 whitespace-nowrap font-bold text-gray-700 text-sm">${item.calificacion || '-'}</td>
                <td class="p-1 text-right whitespace-nowrap">
                    <button class="bg-blue-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold grade-exam-btn" data-index="${idx}">Calificar Examen</button>
                </td>
            </tr>
        `).join('');
    }

    function renderExamenesGestion(grado, seccion, asignatura, search) {
        const exams = allActivityRaw.filter(i =>
            i.tipo === 'Examen' &&
            !i.alumnoNombre &&
            i.grado === grado &&
            (i.seccion === seccion || !i.seccion || i.seccion === "" || (i.seccion && i.seccion.toString().toLowerCase() === "todas")) &&
            i.asignatura === asignatura
        );
        const filtered = exams.filter(e => e.titulo.toLowerCase().includes(search));

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Examen</th>
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Estado</th>
                <th class="p-1 text-right font-bold text-gray-600 whitespace-nowrap">Acción</th>
            </tr>`;

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="3" class="text-center p-2 text-gray-500">No hay exámenes para esta asignatura.</td></tr>';
            return;
        }

        submissionsTableBody.innerHTML = filtered.map(item => {
            const isActivo = item.estado === 'Activo';
            const isBloqueado = item.estado === 'Bloqueado';
            const activarBtnClass = isActivo ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700';
            const activarBtnDisabled = isActivo ? 'disabled' : '';
            const bloquearBtnClass = isBloqueado ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700';
            const bloquearBtnDisabled = isBloqueado ? 'disabled' : '';

            return `
                <tr class="border-b hover:bg-gray-50 transition-colors">
                    <td class="p-1 font-semibold text-gray-800 whitespace-nowrap text-sm">${item.titulo}</td>
                    <td class="p-1 whitespace-nowrap">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isActivo ? 'bg-green-100 text-green-700' : (isBloqueado ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}">
                            ${item.estado || 'Pendiente'}
                        </span>
                    </td>
                    <td class="p-1 text-right space-x-1 whitespace-nowrap">
                        <button class="${activarBtnClass} text-white px-2 py-1 rounded-lg text-[10px] font-bold activate-exam-btn" data-examen-id="${item.examenId}" ${activarBtnDisabled}>Activar</button>
                        <button class="${bloquearBtnClass} text-white px-2 py-1 rounded-lg text-[10px] font-bold lock-exam-btn" data-examen-id="${item.examenId}" ${bloquearBtnDisabled}>Bloquear</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderDetalles(alumnoNombre, grado, seccion, asignatura, search) {
        // Asegurar que el contenedor de la tabla tenga scroll horizontal limpio en esta vista
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
            tableContainer.classList.add('scroll-horizontal-clean');
        }

        const filtered = allActivityRaw.filter(i =>
            i.alumnoNombre === alumnoNombre &&
            i.grado === grado &&
            i.seccion === seccion &&
            i.asignatura === asignatura &&
            i.titulo.toLowerCase().includes(search)
        );
        currentFilteredItems = filtered;

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Actividad</th>
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Estado</th>
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Fecha</th>
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Archivo</th>
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Calificación</th>
                <th class="p-1 text-left font-bold text-gray-600 whitespace-nowrap">Acción</th>
            </tr>`;

        submissionsTableBody.innerHTML = filtered.map((item, index) => {
            let fileLinkHtml = '<em>N/A</em>';
            if (item.fileId) {
                const fileId = extractDriveId(item.fileId);
                if (fileId) {
                    if (item.mimeType === 'folder') {
                        fileLinkHtml = `<a href="https://drive.google.com/drive/folders/${fileId}" target="_blank" class="text-blue-600 font-bold hover:underline">Carpeta</a>`;
                    } else if (typeof item.mimeType === 'string' && item.mimeType.startsWith('image/')) {
                        fileLinkHtml = `<button class="text-blue-600 font-bold hover:underline view-file-link" data-file-id="${fileId}" data-title="${item.titulo}">Imagen</button>`;
                    } else {
                        fileLinkHtml = `<a href="https://drive.google.com/uc?export=download&id=${fileId}" target="_blank" class="text-blue-600 font-bold hover:underline">Archivo</a>`;
                    }
                }
            }

            // Lógica de Estado (Modelo Único: Pendiente, Completada, Rechazada)
            let statusText = 'Pendiente';
            let statusClass = 'bg-gray-100 text-gray-600';

            if (item.estado === 'Completada' || item.estado === 'Revisada') {
                statusText = 'Completada';
                statusClass = 'bg-green-100 text-green-700';
            } else if (item.estado === 'Rechazada') {
                statusText = 'Rechazada';
                statusClass = 'bg-red-100 text-red-700';
            } else if (item.fileId || item.respuestas || item.entregaId) {
                statusText = 'Por calificar';
                statusClass = 'bg-yellow-100 text-yellow-700';
            } else {
                statusText = 'Pendiente';
                statusClass = 'bg-red-100 text-red-700';
            }

            let actionHtml = '';
            // Solo se renderizan botones de calificación si el rol tiene la capacidad (A-29)
            if (RoleCapabilities.canGrade(currentUser)) {
                if (item.tipo === 'Tarea') {
                    actionHtml = `<button class="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold grade-task-btn" data-index="${index}">Calificar</button>`;
                } else if (item.tipo === 'Examen') {
                    actionHtml = `<button class="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold grade-exam-btn" data-index="${index}">Calificar Examen</button>`;
                }
            }

            return `
                <tr class="border-b hover:bg-gray-50 transition-colors">
                    <td class="p-1 font-medium text-gray-800 whitespace-nowrap text-sm">${item.titulo}</td>
                    <td class="p-1 whitespace-nowrap">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass}">${statusText}</span>
                    </td>
                    <td class="p-1 text-[10px] text-gray-600 whitespace-nowrap">${item.fecha ? new Date(item.fecha).toLocaleDateString() : 'N/A'}</td>
                    <td class="p-1 whitespace-nowrap text-sm">${fileLinkHtml}</td>
                    <td class="p-1 font-bold text-gray-700 whitespace-nowrap text-sm">${item.calificacion || '-'}</td>
                    <td class="p-1 whitespace-nowrap">${actionHtml}</td>
                </tr>`;
        }).join('');
    }

    if (studentSearchInput) {
        studentSearchInput.addEventListener('input', () => renderCurrentLevel());
    }

    if (onlyPendingFilter) {
        onlyPendingFilter.addEventListener('change', () => renderCurrentLevel());
    }

    if (dashboardTableHead) {
        dashboardTableHead.addEventListener('click', (e) => {
            const sortBtn = e.target.closest('.sort-student');
            if (sortBtn) {
                const field = sortBtn.dataset.field;
                if (studentSort.field === field) {
                    studentSort.direction = studentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    studentSort.field = field;
                    studentSort.direction = 'asc';
                }
                renderCurrentLevel();
                return;
            }

            const tabBtn = e.target.closest('.alumno-tab-btn');
            if (tabBtn) {
                const tab = tabBtn.dataset.tab;
                const current = navStack[navStack.length - 1];
                if (tab === 'gestion') {
                    pushNav('Exámenes', { ...current.data, tab: 'gestion' });
                } else {
                    current.data.tab = tab;
                    renderCurrentLevel();
                }
            }
        });
    }

    // --- Delegación de Eventos para la Tabla ---
    if (submissionsTableBody) {
        submissionsTableBody.addEventListener('click', async (e) => {
            const target = e.target;

            // Priorizar acciones de botones para evitar navegación accidental
            if (target.closest('.grade-task-btn') || target.closest('.grade-exam-btn') ||
                target.closest('.activate-exam-btn') || target.closest('.lock-exam-btn') ||
                target.closest('.view-file-link')) {

                // Procesar acciones
                if (target.classList.contains('view-file-link')) {
                    e.preventDefault();
                    openLightbox(target.dataset.fileId, target.dataset.title);
                }
                if (target.classList.contains('grade-task-btn')) {
                    if (saveGradeBtn) saveGradeBtn.dataset.type = 'Tarea';
                    openGradeModal(currentFilteredItems[target.dataset.index]);
                }
                if (target.classList.contains('grade-exam-btn')) {
                    if (saveGradeBtn) saveGradeBtn.dataset.type = 'Examen';
                    openGradeModal(currentFilteredItems[target.dataset.index]);
                }
                if (target.classList.contains('activate-exam-btn')) {
                    const examenId = target.dataset.examenId;
                    if (confirm("¿Activar este examen para todos los alumnos asignados?")) {
                        target.classList.add('btn-loading');
                        target.disabled = true;
                        try {
                            const result = await fetchApi('EXAM', 'updateExamStatus', { examenId, estado: 'Activo' });
                            if (result.status === 'success') {
                                alert('Examen activado.');
                                fetchTeacherActivity();
                            } else { throw new Error(result.message); }
                        } catch (error) {
                            alert(`Error: ${error.message}`);
                            target.classList.remove('btn-loading');
                            target.disabled = false;
                        }
                    }
                }
                if (target.classList.contains('lock-exam-btn')) {
                    const examenId = target.dataset.examenId;
                    if (confirm("¿Bloquear este examen? Nadie más podrá realizarlo.")) {
                        target.classList.add('btn-loading');
                        target.disabled = true;
                        try {
                            const result = await fetchApi('EXAM', 'updateExamStatus', { examenId, estado: 'Bloqueado' });
                            if (result.status === 'success') {
                                alert('Examen bloqueado.');
                                fetchTeacherActivity();
                            } else { throw new Error(result.message); }
                        } catch (error) {
                            alert(`Error: ${error.message}`);
                            target.classList.remove('btn-loading');
                            target.disabled = false;
                        }
                    }
                }
                return; // Evitar que el clic en el botón active la navegación de la fila
            }


            // Navegación de jerarquía
            const navBtn = target.closest('.nav-btn');
            if (navBtn) {
                const idx = navBtn.dataset.index;
                const item = currentFilteredItems[idx];
                const current = navStack[navStack.length - 1];
                const searchTerm = (studentSearchInput ? studentSearchInput.value : '').trim();

                // (A-31) Manejar clic en resultados de búsqueda global
                if (searchTerm !== '' && current.level !== 'Detalles') {
                    const alumnoNombre = item.nombre;
                    pushNav('Detalles', {
                        alumnoNombre,
                        grado: item.grado,
                        seccion: item.seccion,
                        asignatura: item.asignatura
                    });
                    return;
                }

                if (current.level === 'Grados') {
                    pushNav('Secciones', { grado: item });
                } else if (current.level === 'Secciones') {
                    pushNav('Asignaturas', { grado: current.data.grado, seccion: item });
                } else if (current.level === 'Asignaturas') {
                    pushNav('Alumnos', { grado: current.data.grado, seccion: current.data.seccion, asignatura: item, tab: 'tareas' });
                } else if (current.level === 'Alumnos') {
                    // Si estamos en la pestaña de exámenes, item es la entrega, si no es el objeto alumno
                    const alumnoNombre = item.alumnoNombre || item.nombre;
                    pushNav('Detalles', { alumnoNombre, grado: current.data.grado, seccion: current.data.seccion, asignatura: current.data.asignatura });
                }
            }
        });
    }

    // Se elimina renderActivity ya que fue reemplazada por funciones de nivel específicas

    // --- LÓGICA del Lightbox de Imágenes ---
    const lightboxModal = document.getElementById('image-lightbox-modal');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const closeLightboxBtn = document.getElementById('close-lightbox-btn');

    function openLightbox(fileId, title) {
        const imageUrl = `https://drive.google.com/thumbnail?id=${fileId}`;
        if (lightboxImage) lightboxImage.src = imageUrl;
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxModal) lightboxModal.classList.remove('hidden');
    }

    function closeLightbox() {
        if (lightboxModal) lightboxModal.classList.add('hidden');
        if (lightboxImage) lightboxImage.src = '';
    }

    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);

    // --- LÓGICA del Modal de Calificación ---
    const gradeModal = document.getElementById('grade-modal');
    const saveGradeBtn = document.getElementById('save-grade-btn');
    const cancelGradeBtn = document.getElementById('cancel-grade-btn');
    let currentEditingEntregaId = null;

    function openGradeModal(entrega) {
        currentEditingEntregaId = entrega.entregaId;
        const studentNameModal = document.getElementById('student-name-modal');
        if (studentNameModal) studentNameModal.textContent = entrega.alumnoNombre;

        const fileId = extractDriveId(entrega.fileId);
        const fileLinkModal = document.getElementById('file-link-modal');
        if (fileLinkModal) {
            if (entrega.tipo === 'Examen') {
                fileLinkModal.href = `results.html?entregaExamenId=${entrega.entregaId}`;
                fileLinkModal.textContent = "Revisar Respuestas Detalladas";
                fileLinkModal.classList.remove('text-red-500');
            } else if (fileId) {
                if (entrega.mimeType === 'folder') {
                    fileLinkModal.href = `https://drive.google.com/drive/folders/${fileId}`;
                    fileLinkModal.textContent = "Abrir Carpeta de Entrega";
                } else {
                    fileLinkModal.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
                    fileLinkModal.textContent = "Descargar Archivo";
                }
                fileLinkModal.classList.remove('text-red-500');
            } else {
                fileLinkModal.href = '#';
                fileLinkModal.textContent = "Enlace no disponible";
                fileLinkModal.classList.add('text-red-500');
            }
        }

        const calInput = document.getElementById('calificacion');
        const estInput = document.getElementById('estado');
        const comInput = document.getElementById('comentario');
        if (calInput) calInput.value = entrega.calificacion || '';
        if (estInput) estInput.value = (entrega.estado === 'Revisada' ? 'Completada' : (entrega.estado || 'Completada'));
        if (comInput) comInput.value = entrega.comentario || '';
        if (gradeModal) gradeModal.classList.remove('hidden');
    }

    function closeGradeModal() {
        if (gradeModal) gradeModal.classList.add('hidden');
    }

    if (cancelGradeBtn) cancelGradeBtn.addEventListener('click', closeGradeModal);

    if (saveGradeBtn) {
        saveGradeBtn.addEventListener('click', async () => {
            const type = saveGradeBtn.dataset.type; // 'Tarea' o 'Examen'
            const payload = {
                entregaId: currentEditingEntregaId,
                calificacion: document.getElementById('calificacion').value,
                estado: document.getElementById('estado').value,
                comentario: document.getElementById('comentario').value
            };
            saveGradeBtn.classList.add('btn-loading');
            saveGradeBtn.disabled = true;
            try {
                const service = type === 'Tarea' ? 'TASK' : 'EXAM';
                const action = type === 'Tarea' ? 'gradeSubmission' : 'gradeExamSubmission';
                const result = await fetchApi(service, action, payload);
                if (result.status === 'success') {
                    alert('Calificación guardada.');
                    closeGradeModal();
                    fetchTeacherActivity();
                } else { throw new Error(result.message); }
            } catch (error) { alert(`Error al guardar calificación: ${error.message}`); }
            finally {
                saveGradeBtn.classList.remove('btn-loading');
                saveGradeBtn.disabled = false;
            }
        });
    }

    // --- Delegación de Eventos para la Tabla ---
    if (createAssignmentForm) {
        createAssignmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = createAssignmentForm.querySelector('button[type="submit"]');
            const payload = {
                ...Object.fromEntries(new FormData(e.target).entries()),
                profesorId: currentUser.userId
            };
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
            try {
                const result = await fetchApi('TASK', 'createTask', payload);
                if (result.status === 'success') {
                    alert('Tarea creada.');
                    e.target.reset();
                    navDashboard.click();
                } else { throw new Error(result.message); }
            } catch (error) { alert(`Error: ${error.message}`); }
            finally {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
        });
    }

    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionsContainer = document.getElementById('questions-container');
    let questionCounter = 0;

    function getQuestionHTML(id) {
        return `
            <div class="question-block border p-4 rounded-lg" data-question-id="${id}">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-bold">Pregunta ${id}</h4>
                    <button type="button" class="text-red-500 remove-question-btn">Eliminar</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-medium mb-1">Tipo de Pregunta</label>
                        <select class="w-full p-2 border rounded question-type-select">
                            <option value="opcion_multiple">Opción Múltiple</option>
                            <option value="completacion">Completación</option>
                            <option value="termino_pareado">Término Pareado</option>
                            <option value="verdadero_falso">Verdadero/Falso</option>
                            <option value="respuesta_breve">Respuesta Breve</option>
                        </select>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block font-medium mb-1">Texto de la Pregunta</label>
                        <input type="text" class="w-full p-2 border rounded question-text" placeholder="Ej: ¿Capital de Honduras?">
                    </div>
                    <div class="md:col-span-2 options-container">
                    </div>
                    <div>
                        <label class="block font-medium mb-1">Respuesta Correcta</label>
                        <input type="text" class="w-full p-2 border rounded correct-answer" placeholder="Ej: Tegucigalpa">
                    </div>
                </div>
            </div>`;
    }

    function getOptionsHTML(type) {
        switch (type) {
            case 'opcion_multiple':
                return `
                    <label class="block font-medium mb-1">Opciones (separadas por coma)</label>
                    <input type="text" class="w-full p-2 border rounded question-options" placeholder="Opción A, Opción B, Opción C">`;
            case 'verdadero_falso':
                return `
                    <label class="block font-medium mb-1">Opciones</label>
                    <input type="text" value="Verdadero,Falso" readonly class="w-full p-2 border rounded bg-gray-100 question-options">`;
            case 'termino_pareado':
                 return `
                    <label class="block font-medium mb-1">Pares (concepto:definición,otro:definición)</label>
                    <textarea class="w-full p-2 border rounded question-options" rows="3" placeholder="Tegucigalpa:Capital de Honduras,París:Capital de Francia"></textarea>`;
            default:
                return '';
        }
    }

    function addQuestion() {
        questionCounter++;
        const questionNode = document.createElement('div');
        questionNode.innerHTML = getQuestionHTML(questionCounter);
        if (questionsContainer) {
            questionsContainer.appendChild(questionNode);
            const typeSelect = questionNode.querySelector('.question-type-select');
            const optionsContainer = questionNode.querySelector('.options-container');
            if (optionsContainer && typeSelect) {
                optionsContainer.innerHTML = getOptionsHTML(typeSelect.value);
                typeSelect.addEventListener('change', (e) => {
                    optionsContainer.innerHTML = getOptionsHTML(e.target.value);
                });
            }
        }
    }

    if (addQuestionBtn) addQuestionBtn.addEventListener('click', addQuestion);

    if (questionsContainer) {
        questionsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-question-btn')) {
                e.target.closest('.question-block').remove();
            }
        });
    }

    if (createExamForm) {
        createExamForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = createExamForm.querySelector('button[type="submit"]');
            const mainData = Object.fromEntries(new FormData(e.target).entries());
            const payload = { ...mainData, preguntas: [], profesorId: currentUser.userId };
            const questionBlocks = questionsContainer.querySelectorAll('.question-block');
            questionBlocks.forEach(block => {
                const type = block.querySelector('.question-type-select').value;
                const optionsInput = block.querySelector('.question-options');
                let optionsValue = optionsInput ? optionsInput.value : '';

                const pregunta = {
                    preguntaTipo: type,
                    textoPregunta: block.querySelector('.question-text').value,
                    respuestaCorrecta: block.querySelector('.correct-answer').value,
                    opciones: {}
                };

                // Transformar opciones según el tipo de pregunta
                if (type === 'opcion_multiple' || type === 'verdadero_falso') {
                    const parts = optionsValue.split(',').map(s => s.trim()).filter(s => s);
                    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                    parts.forEach((part, idx) => {
                        if (letters[idx]) pregunta.opciones[letters[idx]] = part;
                    });
                } else if (type === 'termino_pareado') {
                    const pairs = optionsValue.split(',').map(s => s.trim()).filter(s => s);
                    pregunta.opciones = { concepts: [], definitions: [] };
                    const correctMapping = {};
                    pairs.forEach((pair, idx) => {
                        const [concept, definition] = pair.split(':').map(s => s.trim());
                        if (concept && definition) {
                            pregunta.opciones.concepts.push(concept);
                            pregunta.opciones.definitions.push(definition);
                            // Mapeamos: índice de definición (idx) -> número de concepto (idx + 1)
                            correctMapping[idx] = (idx + 1).toString();
                        }
                    });
                    pregunta.respuestaCorrecta = JSON.stringify(correctMapping);
                } else {
                    pregunta.opciones = optionsValue;
                }

                payload.preguntas.push(pregunta);
            });
            if (payload.preguntas.length === 0) {
                alert('Un examen no puede estar vacío.');
                return;
            }
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
            try {
                const result = await fetchApi('EXAM', 'createExam', payload);
                if (result.status === 'success') {
                    alert('Examen creado exitosamente.');
                    e.target.reset();
                    questionsContainer.innerHTML = '';
                    questionCounter = 0;
                    navDashboard.click();
                } else { throw new Error(result.message); }
            } catch (error) { alert(`Error al crear el examen: ${error.message}`); }
            finally {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
        });
    }

    fetchTeacherActivity();
});
