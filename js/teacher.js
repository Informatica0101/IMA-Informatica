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
    const navTareas = document.getElementById('nav-tareas');
    const navProyectos = document.getElementById('nav-proyectos');
    const navLogros = document.getElementById('nav-logros');
    const navNews = document.getElementById('nav-news');
    const navReportes = document.getElementById('nav-reportes');
    const navExcel = document.getElementById('nav-excel');

    const sectionDashboard = document.getElementById('section-dashboard');
    const sectionTareas = document.getElementById('section-tareas');
    const sectionProyectos = document.getElementById('section-proyectos');
    const sectionLogros = document.getElementById('section-logros');
    const sectionNews = document.getElementById('section-news');
    const sectionReportes = document.getElementById('section-reportes');
    const sectionOperationalDashboard = document.getElementById('section-operational-dashboard');

    const tareasListView = document.getElementById('tareas-list-view');
    const tareasCreateView = document.getElementById('tareas-create-view');
    const formContainerTarea = document.getElementById('form-container-crear-tarea');
    const formContainerExamen = document.getElementById('form-container-crear-examen');

    const createAssignmentForm = document.getElementById('create-assignment-form');
    const createExamForm = document.getElementById('create-exam-form');
    const logoutButton = document.getElementById('logout-button');
    const studentSearchInput = document.getElementById('student-search');
    const backNavBtn = document.getElementById('back-nav-btn');
    const backBtnContainer = document.getElementById('back-btn-container');
    const filtersContainer = document.getElementById('filters-container');
    const dashboardLevelTitle = document.getElementById('dashboard-level-title');
    const dashboardTableHead = document.getElementById('dashboard-table-head');

    let allActivityRaw = [];
    let allAssignmentsRaw = [];
    let currentFilteredItems = [];
    let navStack = [{ level: 'Grados', data: null }];
    let isNavigating = false;
    let studentSort = { column: 'numeroLista', direction: 'asc' };

    const allSections = [sectionOperationalDashboard, sectionDashboard, sectionTareas, sectionProyectos, sectionLogros, sectionNews, sectionReportes];
    const allNavLinks = [navDashboard, navTareas, navProyectos, navLogros, navNews, navExcel, navReportes];

    // Auxiliar para normalizar strings (trim, lowercase y sin acentos) para comparaciones robustas
    const norm = (s) => (s || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // --- Lógica de Navegación ---
    function navigateTo(targetSection, navElement) {
        allSections.forEach(section => section && section.classList.add('hidden'));
        targetSection.classList.remove('hidden');

        // Hide WhatsApp container if moving away from Dashboard
        const waContainer = document.querySelector('.bg-green-50');
        if (waContainer && targetSection !== sectionDashboard) waContainer.classList.add('hidden');

        allNavLinks.forEach(link => {
            if (link) {
                link.classList.remove('bg-blue-600', 'text-white');
                link.classList.add('bg-white', 'text-gray-700');
            }
        });
        navElement.classList.add('bg-blue-600', 'text-white');
        navElement.classList.remove('bg-white', 'text-gray-700');
    }

    navDashboard.addEventListener('click', () => {
        navigateTo(sectionOperationalDashboard, navDashboard);
        fetchOperationalDashboard();
    });
    navTareas.addEventListener('click', () => {
        navigateTo(sectionTareas, navTareas);
        tareasListView.classList.remove('hidden');
        tareasCreateView.classList.add('hidden');
        fetchManagementData();
    });
    navProyectos.addEventListener('click', () => {
        navigateTo(sectionProyectos, navProyectos);
        fetchProjects();
    });
    navLogros.addEventListener('click', () => {
        navigateTo(sectionLogros, navLogros);
        fetchLogros();
    });
    navNews.addEventListener('click', () => {
        navigateTo(sectionNews, navNews);
        fetchNewsManagement();
    });
        if (navExcel) {
        navExcel.addEventListener('click', () => {
            navigateTo(sectionReportes, navExcel);
        });
    }
    navReportes.addEventListener('click', () => {
        navigateTo(sectionDashboard, navReportes);
        navStack = [{ level: 'Grados', data: null }];
        renderCurrentLevel();
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    function extractDriveId(urlOrId) {
        if (!urlOrId) return null;
        if (!urlOrId.includes('/')) return urlOrId;
        let match = urlOrId.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) return match[1];
        match = urlOrId.match(/\/([a-zA-Z0-9-_]{28,})(?=\/?$|\?)/);
        if (match && match[1]) return match[1];
        return null;
    }

    // --- Inicialización de Editores Quill ---
    let quillTask, quillExam, quillEdit, quillNews;
    function initEditors() {
        if (!quillTask && document.getElementById('editor-task-container')) {
            quillTask = new Quill('#editor-task-container', { theme: 'snow', placeholder: 'Escribe la descripción de la tarea...' });
        }
        if (!quillExam && document.getElementById('editor-exam-container')) {
            quillExam = new Quill('#editor-exam-container', { theme: 'snow', placeholder: 'Escribe las instrucciones del examen...' });
        }
        if (!quillEdit && document.getElementById('editor-edit-container')) {
            quillEdit = new Quill('#editor-edit-container', { theme: 'snow' });
        }
        if (!quillNews && document.getElementById('editor-news-container')) {
            quillNews = new Quill('#editor-news-container', { theme: 'snow', placeholder: 'Contenido de la noticia...' });
        }
    }
    initEditors();

    // --- Lógica de Navegación de Tareas ---
    const btnShowCreateTask = document.getElementById('btn-show-create-task');
    const btnShowCreateExam = document.getElementById('btn-show-create-exam');
    const btnBackToTareas = document.getElementById('btn-back-to-tareas');

    if (btnShowCreateTask) btnShowCreateTask.onclick = () => {
        tareasListView.classList.add('hidden');
        tareasCreateView.classList.remove('hidden');
        formContainerTarea.classList.remove('hidden');
        formContainerExamen.classList.add('hidden');
        document.getElementById('tareas-form-title').textContent = "Crear Nueva Tarea";
    };
    if (btnShowCreateExam) btnShowCreateExam.onclick = () => {
        tareasListView.classList.add('hidden');
        tareasCreateView.classList.remove('hidden');
        formContainerTarea.classList.add('hidden');
        formContainerExamen.classList.remove('hidden');
        document.getElementById('tareas-form-title').textContent = "Crear Nuevo Examen";
    };
    if (btnBackToTareas) btnBackToTareas.onclick = () => {
        tareasListView.classList.remove('hidden');
        tareasCreateView.classList.add('hidden');
    };

    // --- Lógica de Navegación Jerárquica ---
    window.pushNav = async function(level, data) {
        if (isNavigating) return;
        isNavigating = true;
        if (studentSearchInput) studentSearchInput.value = '';

        if (level === 'Alumnos') {
            if (submissionsTableBody) submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-8">Cargando lista de alumnos...</td></tr>';
            // Cargamos la lista real de alumnos inscritos para este grado y sección
            try {
                const res = await fetchApi('USER', 'getStudentsByGradoSeccion', { grado: data.grado, seccion: data.seccion });
                data.students = res.data || [];
            } catch (e) {
                console.error("Error al cargar alumnos:", e);
                data.students = [];
            }
        }

        navStack.push({ level, data });
        renderCurrentLevel();
        isNavigating = false;
    }

    window.popNav = function() {
        if (isNavigating) return;
        if (navStack.length > 1) {
            if (studentSearchInput) studentSearchInput.value = '';
            navStack.pop();
            renderCurrentLevel();
        }
    }

    if (backNavBtn) backNavBtn.addEventListener('click', popNav);

    // --- MÓDULO 1: Gestión de Tareas y Exámenes ---
    let allTasksExams = [];

    async function fetchManagementData() {
        const tbody = document.getElementById('tasks-management-table-body');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Cargando...</td></tr>';
        try {
            const [tasksRes, examsRes] = await Promise.all([
                fetchApi('TASK', 'getAllTasks', { profesorId: currentUser.userId }),
                fetchApi('EXAM', 'getAllExams', { profesorId: currentUser.userId })
            ]);

            const tasks = (tasksRes.data || []).map(t => ({ ...t, tipoReal: 'Tarea' }));
            const exams = (examsRes.data || []).map(e => ({ ...e, tipoReal: 'Examen' }));

            allTasksExams = [...tasks, ...exams].filter(item => item.estado !== 'Inactiva');
            allTasksExams.sort((a, b) => new Date(b.fechaLimite) - new Date(a.fechaLimite));

            renderManagementTable();
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-red-500">Error: ${error.message}</td></tr>`;
        }
    }

    function renderManagementTable() {
        const tbody = document.getElementById('tasks-management-table-body');
        tbody.innerHTML = allTasksExams.map((item, idx) => `
            <tr class="hover:bg-gray-50 transition-colors cursor-pointer" onclick="window.openTaskDetail(${idx})">
                <td class="p-4 font-bold text-blue-700">${item.titulo}</td>
                <td class="p-4">${item.asignatura}</td>
                <td class="p-4 text-xs">${item.grado} - ${item.seccion || 'Todas'}</td>
                <td class="p-4 text-xs font-medium ${new Date(item.fechaLimite) < new Date() ? 'text-red-500' : 'text-gray-600'}">
                    ${new Date(item.fechaLimite).toLocaleDateString()}
                </td>
                <td class="p-4 text-right">
                    <button class="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    window.openTaskDetail = (idx) => {
        const item = allTasksExams[idx];
        document.getElementById('detail-titulo').textContent = item.titulo;
        document.getElementById('detail-descripcion').textContent = item.descripcion || 'Sin descripción.';
        document.getElementById('detail-asignatura').textContent = item.asignatura;
        document.getElementById('detail-parcial').textContent = item.parcial || 'N/A';
        document.getElementById('detail-grado').textContent = item.grado;
        document.getElementById('detail-seccion').textContent = item.seccion || 'Todas';
        document.getElementById('detail-fecha').textContent = new Date(item.fechaLimite).toLocaleDateString();
        document.getElementById('detail-puntaje').textContent = (item.puntaje || 100) + '%';

        const fileContainer = document.getElementById('detail-archivo-container');
        const fileLink = document.getElementById('detail-archivo-link');
        if (item.archivoUrl) {
            fileContainer.classList.remove('hidden');
            fileLink.href = item.archivoUrl;
        } else {
            fileContainer.classList.add('hidden');
        }

        document.getElementById('task-details-modal').dataset.currentIndex = idx;
        document.getElementById('task-details-modal').classList.remove('hidden');
    };

    document.getElementById('close-task-modal-btn').onclick = () => {
        document.getElementById('task-details-modal').classList.add('hidden');
    };

    document.getElementById('edit-task-btn').onclick = () => {
        const idx = document.getElementById('task-details-modal').dataset.currentIndex;
        const item = allTasksExams[idx];

        document.getElementById('edit-id').value = item.tareaId || item.examenId;
        document.getElementById('edit-tipo-orig').value = item.tipoReal;
        document.getElementById('edit-titulo').value = item.titulo;

        if (quillEdit) quillEdit.root.innerHTML = item.descripcion || '';

        document.getElementById('edit-asignatura').value = item.asignatura;
        document.getElementById('edit-parcial').value = item.parcial || 'Primer Parcial';
        document.getElementById('edit-grado').value = item.grado;
        document.getElementById('edit-seccion').value = item.seccion || '';
        document.getElementById('edit-fecha').value = item.fechaLimite ? item.fechaLimite.split('T')[0] : '';
        document.getElementById('edit-puntaje').value = item.puntaje || 100;
        document.getElementById('edit-archivo').value = item.archivoUrl || '';

        const examFields = document.getElementById('edit-exam-only-fields');
        if (item.tipoReal === 'Examen') {
            examFields.classList.remove('hidden');
            document.getElementById('edit-tiempo').value = item.tiempoLimite || '';
        } else {
            examFields.classList.add('hidden');
        }

        document.getElementById('task-details-modal').classList.add('hidden');
        document.getElementById('edit-task-modal').classList.remove('hidden');
    };

    document.getElementById('cancel-edit-btn').onclick = () => {
        document.getElementById('edit-task-modal').classList.add('hidden');
    };

    document.getElementById('edit-assignment-form').onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const tipo = document.getElementById('edit-tipo-orig').value;
        const payload = {
            titulo: document.getElementById('edit-titulo').value,
            descripcion: quillEdit ? quillEdit.root.innerHTML : document.getElementById('edit-descripcion').value,
            asignatura: document.getElementById('edit-asignatura').value,
            parcial: document.getElementById('edit-parcial').value,
            gradoAsignado: document.getElementById('edit-grado').value,
            seccionAsignada: document.getElementById('edit-seccion').value,
            fechaLimite: document.getElementById('edit-fecha').value,
            puntaje: document.getElementById('edit-puntaje').value,
            archivoUrl: document.getElementById('edit-archivo').value
        };

        if (tipo === 'Tarea') {
            payload.tareaId = document.getElementById('edit-id').value;
        } else {
            payload.examenId = document.getElementById('edit-id').value;
            payload.tiempoLimite = document.getElementById('edit-tiempo').value;
        }

        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        try {
            const service = tipo === 'Tarea' ? 'TASK' : 'EXAM';
            const action = tipo === 'Tarea' ? 'updateTask' : 'updateExam';
            const res = await fetchApi(service, action, payload);
            if (res.status === 'success') {
                alert('Actualizado correctamente.');
                document.getElementById('edit-task-modal').classList.add('hidden');
                fetchManagementData();
            } else throw new Error(res.message);
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    };

    document.getElementById('delete-task-btn').onclick = async () => {
        const idx = document.getElementById('task-details-modal').dataset.currentIndex;
        const item = allTasksExams[idx];
        const tipo = item.tipoReal;

        if (confirm(`¿Está seguro de eliminar esta ${tipo}?`)) {
            const btn = document.getElementById('delete-task-btn');
            btn.classList.add('btn-loading');
            btn.disabled = true;

            try {
                const service = tipo === 'Tarea' ? 'TASK' : 'EXAM';
                const action = tipo === 'Tarea' ? 'deleteTask' : 'deleteExam';
                const payload = tipo === 'Tarea' ? { tareaId: item.tareaId } : { examenId: item.examenId };

                const res = await fetchApi(service, action, payload);
                if (res.status === 'success') {
                    alert(res.message);
                    document.getElementById('task-details-modal').classList.add('hidden');
                    fetchManagementData();
                } else throw new Error(res.message);
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                btn.classList.remove('btn-loading');
                btn.disabled = false;
            }
        }
    };

    // --- MÓDULO 2: Gestión de Entregas (Navegación Jerárquica) ---
    async function fetchTeacherActivity() {
        if (!submissionsTableBody) return;
        submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-8"><div class="loading-spinner"></div> Cargando actividad...</td></tr>';
        try {
            const payload = { profesorId: currentUser.userId };
            const [taskSubmissions, examSubmissions, tasksRes, examsRes] = await Promise.all([
                fetchApi('TASK', 'getTeacherActivity', payload),
                fetchApi('EXAM', 'getTeacherExamActivity', payload),
                fetchApi('TASK', 'getAllTasks', payload),
                fetchApi('EXAM', 'getAllExams', payload)
            ]);

            allActivityRaw = [
                ...((taskSubmissions.data || [])).map(s => ({ ...s, tipo: 'Tarea' })),
                ...((examSubmissions.data || [])).map(s => ({ ...s, tipo: 'Examen' }))
            ];

            allAssignmentsRaw = [
                ...((tasksRes.data || [])).map(t => ({ ...t, tipoReal: 'Tarea' })),
                ...((examsRes.data || [])).map(e => ({ ...e, tipoReal: 'Examen' }))
            ].filter(a => a.estado !== 'Inactiva');

            renderCurrentLevel();
        } catch (error) {
            submissionsTableBody.innerHTML = `<tr><td colspan="6" class="text-center p-8 text-red-500">Error: ${error.message}</td></tr>`;
        }
    }

    function renderCurrentLevel() {
        const current = navStack[navStack.length - 1];
        let title = current.level;
        if (current.level === 'Detalles') title = `Actividades de ${current.data.alumnoNombre}`;
        if (dashboardLevelTitle) dashboardLevelTitle.textContent = title;

        if (backBtnContainer) {
            if (navStack.length > 1) backBtnContainer.classList.remove('hidden');
            else backBtnContainer.classList.add('hidden');
        }

        if (filtersContainer) {
            if (current.level === 'Grados' || current.level === 'Detalles') filtersContainer.classList.remove('hidden');
            else filtersContainer.classList.add('hidden');
        }

        const searchTerm = (studentSearchInput ? studentSearchInput.value : '').trim().toLowerCase();

        // (A-31) Priorizar búsqueda global si hay texto y no estamos en detalles
        if (searchTerm !== '' && current.level !== 'Detalles') {
            renderGlobalSearch(searchTerm);
            return;
        }

        switch (current.level) {
            case 'Grados': renderGrados(searchTerm); break;
            case 'Secciones': renderSecciones(current.data.grado, searchTerm); break;
            case 'Asignaturas': renderAsignaturas(current.data.grado, current.data.seccion, current.data.parcial, searchTerm); break;
            case 'Parciales': renderParciales(current.data.grado, current.data.seccion, searchTerm); break;
            case 'Alumnos': renderAlumnos(current.data.grado, current.data.seccion, current.data.parcial, current.data.asignatura, searchTerm); break;
            case 'Detalles': renderDetallesAlumno(current.data.alumnoId, current.data.grado, current.data.seccion, current.data.asignatura, searchTerm); break;
        }
    }

    function renderGlobalSearch(search) {
        if (dashboardLevelTitle) dashboardLevelTitle.textContent = "Resultados de Búsqueda Global";
        const alumnosGlobal = [];
        const seen = new Set();
        allActivityRaw.forEach(item => {
            if (!item.alumnoNombre) return;
            const key = `${item.alumnoId}`;
            if (!seen.has(key)) {
                if (norm(item.alumnoNombre).includes(norm(search))) {
                    alumnosGlobal.push({ id: item.alumnoId, nombre: item.alumnoNombre, grado: item.grado, seccion: item.seccion, total: 0 });
                    seen.add(key);
                }
            }
        });
        currentFilteredItems = alumnosGlobal;
        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Alumno</th>
                <th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Grado/Secc</th>
                <th class="p-4 text-right font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th>
            </tr>`;
        if (alumnosGlobal.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="3" class="text-center p-8 text-gray-500">No se encontraron alumnos.</td></tr>'; return; }
        submissionsTableBody.innerHTML = alumnosGlobal.map((a, idx) => `
            <tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}">
                <td class="p-4 font-bold text-blue-700">${a.nombre}</td>
                <td class="p-4 text-sm text-gray-500">${a.grado} - ${a.seccion || 'N/A'}</td>
                <td class="p-4 text-right"><span class="text-blue-600 font-bold text-sm">Ver detalles &rsaquo;</span></td>
            </tr>`).join('');
    }

    function renderGrados(search) {
        const fGrado = document.getElementById('filter-grado').value;
        let grados = [...new Set([
            ...allActivityRaw.map(item => item.grado),
            ...allAssignmentsRaw.map(item => item.grado)
        ].filter(g => g))];
        if (fGrado) grados = grados.filter(g => norm(g) === norm(fGrado));
        const filtered = grados.filter(g => norm(g).includes(norm(search)));
        currentFilteredItems = filtered;
        dashboardTableHead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Grado</th><th class="p-4 text-right font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>`;
        if (filtered.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="2" class="text-center p-8 text-gray-500">No hay grados.</td></tr>'; return; }
        submissionsTableBody.innerHTML = filtered.map((grado, idx) => `<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}"><td class="p-4 font-bold text-gray-800">${grado}</td><td class="p-4 text-right"><span class="text-blue-600 font-bold text-sm">Ver Secciones &rsaquo;</span></td></tr>`).join('');
    }

    function renderSecciones(grado, search) {
        const fSeccion = document.getElementById('filter-seccion').value;
        let secciones = [...new Set([
            ...allActivityRaw.filter(i => norm(i.grado) === norm(grado)).map(i => i.seccion),
            ...allAssignmentsRaw.filter(i => norm(i.grado) === norm(grado)).map(i => i.seccion)
        ].filter(s => s && norm(s) !== 'todas'))];

        const hasTodas = allAssignmentsRaw.some(a => norm(a.grado) === norm(grado) && (norm(a.seccion) === 'todas' || !a.seccion));
        if (hasTodas) {
            ['A', 'B', 'C'].forEach(s => {
                if (!secciones.includes(s)) secciones.push(s);
            });
        }

        if (fSeccion) secciones = secciones.filter(s => norm(s) === norm(fSeccion));
        const filtered = secciones.filter(s => norm(s).includes(norm(search)));
        currentFilteredItems = filtered;
        dashboardTableHead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Sección</th><th class="p-4 text-right font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>`;
        submissionsTableBody.innerHTML = filtered.map((seccion, idx) => `<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}"><td class="p-4 font-bold text-gray-800">${seccion}</td><td class="p-4 text-right"><span class="text-blue-600 font-bold text-sm">Ver Asignaturas &rsaquo;</span></td></tr>`).join('');
    }

        function renderAsignaturas(grado, seccion, parcial, search) {
        const asignaturas = [...new Set(allAssignmentsRaw.filter(a =>
            norm(a.grado) === norm(grado) &&
            (norm(a.seccion) === norm(seccion) || !a.seccion || norm(a.seccion) === 'todas') &&
            norm(a.parcial) === norm(parcial)
        ).map(a => a.asignatura))];

        const filtered = asignaturas.filter(asig => norm(asig).includes(norm(search)));
        currentFilteredItems = filtered;
        dashboardTableHead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Asignatura</th><th class="p-4 text-right font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>`;
        submissionsTableBody.innerHTML = filtered.map((asig, idx) => `<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}"><td class="p-4 font-bold text-gray-800">${asig}</td><td class="p-4 text-right"><span class="text-blue-600 font-bold text-sm">Ver Alumnos &rsaquo;</span></td></tr>`).join('')
    }

        function renderParciales(grado, seccion, search) {
        const parciales = [...new Set(allAssignmentsRaw.filter(a =>
            norm(a.grado) === norm(grado) && (norm(a.seccion) === norm(seccion) || !a.seccion || norm(a.seccion) === 'todas')
        ).map(a => a.parcial))].filter(p => p);

        const PARCIAL_ORDER = ['Primer Parcial', 'Segundo Parcial', 'Tercer Parcial', 'Cuarto Parcial'];
        parciales.sort((a, b) => PARCIAL_ORDER.indexOf(a) - PARCIAL_ORDER.indexOf(b));

        const filtered = parciales.filter(p => norm(p).includes(norm(search)));
        currentFilteredItems = filtered;
        dashboardTableHead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Parcial</th><th class="p-4 text-right font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>`;
        submissionsTableBody.innerHTML = filtered.map((parcial, idx) => `<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}"><td class="p-4 font-bold text-gray-800">${parcial}</td><td class="p-4 text-right"><span class="text-blue-600 font-bold text-sm">Ver Asignaturas &rsaquo;</span></td></tr>`).join('')
    }

        function renderAlumnos(grado, seccion, parcial, asignatura, search) {
        const current = navStack[navStack.length - 1];
        const students = current.data.students || [];

        // Sorting Logic
        students.sort((a, b) => {
            let valA = a[studentSort.column];
            let valB = b[studentSort.column];

            if (studentSort.column === 'numeroLista') {
                valA = parseInt(valA) || 999;
                valB = parseInt(valB) || 999;
            } else if (studentSort.column === 'estadoTasks') {
                valA = getStudentSummaryStatus(a.userId, grado, seccion, parcial, asignatura);
                valB = getStudentSummaryStatus(b.userId, grado, seccion, parcial, asignatura);
            } else {
                valA = norm(valA);
                valB = norm(valB);
            }

            if (valA < valB) return studentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return studentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        let filtered = students.filter(s => norm(s.nombre).includes(norm(search)));
        currentFilteredItems = filtered;

        dashboardTableHead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100">
            <th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem] cursor-pointer sort-btn" data-sort="numeroLista">Nº</th>
            <th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem] cursor-pointer sort-btn" data-sort="nombre">Alumno</th>
            <th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem] cursor-pointer sort-btn" data-sort="estadoTasks">Estado Tareas</th>
            <th class="p-4 text-right font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th>
        </tr>`;

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="4" class="text-center p-8 text-gray-500">No hay alumnos.</td></tr>';
            return;
        }

        submissionsTableBody.innerHTML = filtered.map((s, idx) => {
            const status = getStudentSummaryStatus(s.userId, grado, seccion, parcial, asignatura);
            let statusBadge = '';
            if (status === 'Pendiente de revisión') statusBadge = '<span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg font-bold text-[10px]">Pendiente de revisión</span>';
            else if (status === 'Incompleta') statusBadge = '<span class="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg font-bold text-[10px]">Incompleta</span>';
            else if (status === 'Rechazada') statusBadge = '<span class="bg-red-100 text-red-700 px-2 py-1 rounded-lg font-bold text-[10px]">Rechazada</span>';
            else if (status === 'Completada') statusBadge = '<span class="bg-green-100 text-green-700 px-2 py-1 rounded-lg font-bold text-[10px]">Completada</span>';
            else statusBadge = '<span class="bg-gray-100 text-gray-500 px-2 py-1 rounded-lg font-bold text-[10px]">Al día</span>';

            return `
                <tr class="hover:bg-gray-50">
                    <td class="p-4 text-gray-400 font-mono text-xs">${s.numeroLista || '-'}</td>
                    <td class="p-4 font-bold text-blue-700 cursor-pointer show-details-btn" data-index="${idx}">${s.nombre}</td>
                    <td class="p-4">${statusBadge}</td>
                    <td class="p-4 text-right">
                        <button class="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all show-details-btn" data-index="${idx}">Ver Detalles</button>
                    </td>
                </tr>`;
        }).join('');

        submissionsTableBody.querySelectorAll('.show-details-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const item = filtered[btn.dataset.index];
                openStudentDetailsModal(item.userId, item.nombre, grado, seccion, parcial, asignatura);
            };
        });
    }

    function getStudentSummaryStatus(alumnoId, grado, seccion, parcial, asignatura) {
        const studentTasks = allActivityRaw.filter(i =>
            i.alumnoId == alumnoId &&
            norm(i.grado) === norm(grado) &&
            norm(i.seccion) === norm(seccion) &&
            norm(i.parcial) === norm(parcial) &&
            norm(i.asignatura) === norm(asignatura)
        );

        if (studentTasks.some(i => i.estado === 'Pendiente' || i.estado === 'Pendiente de revisión' || !i.estado)) return 'Pendiente de revisión';
        if (studentTasks.some(i => i.estado === 'Tarea incompleta')) return 'Incompleta';
        if (studentTasks.some(i => i.estado === 'Rechazada')) return 'Rechazada';
        if (studentTasks.length > 0 && studentTasks.every(i => i.estado === 'Completada' || i.estado === 'Revisada')) return 'Completada';
        return 'Al día';
    }

    function renderDetallesAlumno(alumnoId, grado, seccion, asignatura, search) {
        const fEstado = document.getElementById('filter-estado').value;
        const isGlobalSearch = (asignatura === 'Búsqueda Global');
        const current = navStack[navStack.length - 1];
        const parcial = current.data.parcial;

        const filtered = allActivityRaw.filter(i =>
            i.alumnoId == alumnoId &&
            (isGlobalSearch || (norm(i.asignatura) === norm(asignatura) && norm(i.parcial) === norm(parcial))) &&
            norm(i.titulo).includes(norm(search))
        );
        // Ordenar por fecha más reciente primero
        filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const finalFiltered = filtered.filter(item => {
            if (!fEstado) return true;
            let itemEstado = 'Pendiente';
            if (item.estado === 'Completada' || item.estado === 'Revisada') itemEstado = 'Completada';
            else if (item.estado === 'Rechazada') itemEstado = 'Rechazada';
            else if (item.fileId || item.respuestas || item.entregaId) itemEstado = 'Por calificar';
            return itemEstado === fEstado;
        });
        currentFilteredItems = finalFiltered;
        dashboardTableHead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Actividad</th><th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Estado</th><th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Archivo</th><th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Calificación</th><th class="p-4 text-right font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>`;
        if (finalFiltered.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="5" class="text-center p-8 text-gray-500">Sin entregas.</td></tr>'; return; }
        submissionsTableBody.innerHTML = finalFiltered.map((item, idx) => {
            let statusClass = 'bg-gray-100 text-gray-600'; let statusText = item.estado || 'Pendiente';

            if (item.estado === 'Completada' || item.estado === 'Revisada') {
                statusText = 'Completada';
                statusClass = 'bg-green-100 text-green-700';
            } else if (item.estado === 'Rechazada' || item.estado === 'Tarea incompleta') {
                statusClass = 'bg-red-100 text-red-700';
            } else if (item.estado === 'Pendiente de revisión' || item.fileId || item.respuestas || item.entregaId) {
                statusText = item.estado === 'Pendiente de revisión' ? 'Pendiente de revisión' : 'Por calificar';
                statusClass = 'bg-yellow-100 text-yellow-700';
            }

            let fileHtml = 'N/A';
            if (item.fileId) {
                const fId = extractDriveId(item.fileId);
                fileHtml = `<a href="https://drive.google.com/uc?id=${fId}" target="_blank" class="text-blue-600 font-bold hover:underline">Ver</a>`;
            }

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4"><div class="font-bold text-gray-800">${item.titulo}</div><div class="text-[10px] text-gray-400 uppercase">${item.asignatura} | ${item.tipo}</div></td>
                    <td class="p-4"><span class="px-2 py-1 rounded-full text-[10px] font-bold ${statusClass}">${statusText}</span></td>
                    <td class="p-4">${fileHtml}</td>
                    <td class="p-4 font-bold text-gray-700">${item.calificacion || '-'}</td>
                    <td class="p-4 text-right space-x-2">
                        <button class="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors grade-btn" data-index="${idx}">Calificar</button>
                        <button class="bg-red-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors delete-submission-btn" data-index="${idx}">Eliminar</button>
                    </td>
                </tr>`;
        }).join('');
    }

    if (studentSearchInput) studentSearchInput.addEventListener('input', () => renderCurrentLevel());
    ['filter-grado', 'filter-seccion', 'filter-estado'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => renderCurrentLevel());
    });
    const asigFilter = document.getElementById('filter-asignatura');
    if (asigFilter) asigFilter.addEventListener('input', () => renderCurrentLevel());

    if (dashboardTableHead) {
        dashboardTableHead.addEventListener('click', (e) => {
            const sortBtn = e.target.closest('.sort-btn');
            if (sortBtn) {
                const column = sortBtn.dataset.sort;
                if (studentSort.column === column) {
                    studentSort.direction = studentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    studentSort.column = column;
                    studentSort.direction = 'asc';
                }
                renderCurrentLevel();
            }
        });
    }

    if (submissionsTableBody) {
        submissionsTableBody.addEventListener('click', async (e) => {
            const target = e.target;
            if (target.classList.contains('grade-btn')) {
                const idx = target.dataset.index;
                const item = currentFilteredItems[idx];
                if (saveGradeBtn) saveGradeBtn.dataset.type = item.tipo;
                openGradeModal(item);
                return;
            }
            if (target.classList.contains('delete-submission-btn')) {
                const idx = target.dataset.index;
                const item = currentFilteredItems[idx];
                if (confirm(`¿Eliminar entrega de "${item.titulo}"?`)) {
                    target.disabled = true; target.textContent = "...";
                    try {
                        const service = item.tipo === 'Tarea' ? 'TASK' : 'EXAM';
                        const action = item.tipo === 'Tarea' ? 'deleteSubmission' : 'deleteExamSubmission';
                        const res = await fetchApi(service, action, { entregaId: item.entregaId });
                        if (res.status === 'success') { alert(res.message); fetchTeacherActivity().then(() => { navigateTo(sectionOperationalDashboard, navDashboard); fetchOperationalDashboard(); }); }
                        else throw new Error(res.message);
                    } catch (error) { alert("Error: " + error.message); target.disabled = false; target.textContent = "Eliminar"; }
                }
                return;
            }
                                    const navBtn = target.closest('.nav-btn');
            if (navBtn) {
                const idx = navBtn.dataset.index;
                const item = currentFilteredItems[idx];
                const current = navStack[navStack.length - 1];

                if (dashboardLevelTitle.textContent === "Resultados de Búsqueda Global") {
                    await pushNav('Detalles', { alumnoId: item.id, alumnoNombre: item.nombre, grado: item.grado, seccion: item.seccion, asignatura: 'Búsqueda Global' });
                    return;
                }

                if (current.level === 'Grados') await pushNav('Secciones', { grado: item });
                else if (current.level === 'Secciones') await pushNav('Parciales', { grado: current.data.grado, seccion: item });
                else if (current.level === 'Parciales') await pushNav('Asignaturas', { grado: current.data.grado, seccion: current.data.seccion, parcial: item });
                else if (current.level === 'Asignaturas') await pushNav('Alumnos', { grado: current.data.grado, seccion: current.data.seccion, parcial: current.data.parcial, asignatura: item });
            }
        });
    }

    // --- MÓDULO 3: Exportación a Excel ---
    document.getElementById('export-excel-btn').addEventListener('click', async () => {
        const grado = document.getElementById('report-grado').value;
        const seccion = document.getElementById('report-seccion').value;
        const parcial = document.getElementById('report-parcial').value;
        const btn = document.getElementById('export-excel-btn');
        btn.disabled = true; btn.innerHTML = '<span>Generando...</span>';
        try {
            const [studentsRes, tasksRes, examsRes, taskSubRes, examSubRes] = await Promise.all([
                fetchApi('USER', 'getStudentsByGradoSeccion', { grado, seccion }),
                fetchApi('TASK', 'getAllTasks', { profesorId: currentUser.userId }),
                fetchApi('EXAM', 'getAllExams', { profesorId: currentUser.userId }),
                fetchApi('TASK', 'getTeacherActivity', { profesorId: currentUser.userId, grado, seccion }),
                fetchApi('EXAM', 'getTeacherExamActivity', { profesorId: currentUser.userId, grado, seccion })
            ]);
            const students = studentsRes.data || [];
            if (students.length === 0) { alert('Sin alumnos.'); return; }
            const allTasks = (tasksRes.data || []).filter(t => norm(t.grado) === norm(grado) && (!t.seccion || norm(t.seccion) === norm(seccion)) && norm(t.parcial) === norm(parcial));
            const allExams = (examsRes.data || []).filter(e => norm(e.grado) === norm(grado) && (!e.seccion || norm(e.seccion) === norm(seccion) || norm(e.seccion) === 'todas'));
            const taskSubmissions = taskSubRes.data || [];
            const examSubmissions = examSubRes.data || [];
            const subjects = [...new Set([...allTasks.map(t => t.asignatura), ...allExams.map(e => e.asignatura)])];
            const wb = XLSX.utils.book_new();
            subjects.forEach(subject => {
                const subTasks = allTasks.filter(t => t.asignatura === subject);
                const subExams = allExams.filter(e => e.asignatura === subject);
                const headers = ['ID Usuario', 'Nombre del Alumno'];
                subTasks.forEach(t => headers.push(t.titulo));
                subExams.forEach((e, i) => headers.push(`Examen ${i + 1}: ${e.titulo}`));
                headers.push('TOTAL DE PUNTOS');
                const data = students.map(student => {
                    const row = [student.userId, student.nombre]; let total = 0;
                    subTasks.forEach(task => {
                        const sub = taskSubmissions.find(s => s.alumnoId === student.userId && s.titulo === task.titulo);
                        const points = sub ? parseFloat(sub.calificacion || 0) : 0; row.push(points); total += points;
                    });
                    subExams.forEach(exam => {
                        const sub = examSubmissions.find(s => s.alumnoId === student.userId && s.titulo === exam.titulo);
                        const points = sub ? parseFloat(sub.calificacion || 0) : 0; row.push(points); total += points;
                    });
                    row.push(total); return row;
                });
                const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
                XLSX.utils.book_append_sheet(wb, ws, subject.substring(0, 31));
            });
            const pNum = { 'Primer Parcial': '1', 'Segundo Parcial': '2', 'Tercer Parcial': '3', 'Cuarto Parcial': '4' }[parcial] || parcial;
            XLSX.writeFile(wb, `${grado.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}_seccion_${seccion}_parcial_${pNum}.xls`);
        } catch (error) { alert('Error: ' + error.message); }
        finally { btn.disabled = false; btn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span>EXPORTAR REPORTE EXCEL</span>'; }
    });

    // --- Calificación Modal ---
    const gradeModal = document.getElementById('grade-modal');
    const saveGradeBtn = document.getElementById('save-grade-btn');
    const cancelGradeBtn = document.getElementById('cancel-grade-btn');
    let currentEditingEntregaId = null;
    function openGradeModal(entrega) {
        currentEditingEntregaId = entrega.entregaId;
        document.getElementById('student-name-modal').textContent = entrega.alumnoNombre;
        const flm = document.getElementById('file-link-modal');
        if (entrega.tipo === 'Examen') { flm.href = `results.html?entregaExamenId=${entrega.entregaId}`; flm.textContent = "Ver Respuestas"; }
        else if (entrega.fileId) { flm.href = `https://drive.google.com/uc?id=${extractDriveId(entrega.fileId)}`; flm.textContent = "Ver Archivo"; }
        else { flm.href = '#'; flm.textContent = "N/A"; }
        document.getElementById('calificacion').value = entrega.calificacion || '';
        document.getElementById('estado').value = (entrega.estado === 'Revisada' ? 'Completada' : (entrega.estado || 'Completada'));
        document.getElementById('comentario').value = entrega.comentario || '';
        gradeModal.classList.remove('hidden');
    }
    cancelGradeBtn.onclick = () => gradeModal.classList.add('hidden');
    saveGradeBtn.onclick = async () => {
        const type = saveGradeBtn.dataset.type;
        const payload = { entregaId: currentEditingEntregaId, calificacion: document.getElementById('calificacion').value, estado: document.getElementById('estado').value, comentario: document.getElementById('comentario').value };
        saveGradeBtn.classList.add('btn-loading');
        try {
            const res = await fetchApi(type === 'Tarea' ? 'TASK' : 'EXAM', type === 'Tarea' ? 'gradeSubmission' : 'gradeExamSubmission', payload);
            if (res.status === 'success') { alert('Guardado.'); gradeModal.classList.add('hidden'); fetchTeacherActivity().then(() => { navigateTo(sectionOperationalDashboard, navDashboard); fetchOperationalDashboard(); }); }
            else throw new Error(res.message);
        } catch (error) { alert('Error: ' + error.message); }
        finally { saveGradeBtn.classList.remove('btn-loading'); }
    };

    // --- CRUD Forms ---
    if (createAssignmentForm) createAssignmentForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const formData = Object.fromEntries(new FormData(e.target).entries());

        // Obtener contenido de Quill
        if (quillTask) formData.descripcion = quillTask.root.innerHTML;

        btn.classList.add('btn-loading');
        try {
            const res = await fetchApi('TASK', 'createTask', { ...formData, profesorId: currentUser.userId });
            if (res.status === 'success') {
                alert('Tarea creada correctamente.');
                e.target.reset();
                if (quillTask) quillTask.setContents([]);
                navTareas.click();
            }
            else throw new Error(res.message);
        } catch (error) { alert(error.message); } finally { btn.classList.remove('btn-loading'); }
    };

    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionsContainer = document.getElementById('questions-container');
    let qCounter = 0;
    if (addQuestionBtn) addQuestionBtn.onclick = () => {
        qCounter++; const node = document.createElement('div');
        node.innerHTML = `<div class="question-block border p-4 rounded-lg" data-question-id="${qCounter}"><div class="flex justify-between items-center mb-4"><h4 class="font-bold">Pregunta ${qCounter}</h4><button type="button" class="text-red-500 remove-question-btn">Eliminar</button></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block font-medium mb-1">Tipo</label><select class="w-full p-2 border rounded question-type-select"><option value="opcion_multiple">Opción Múltiple</option><option value="verdadero_falso">Verdadero/Falso</option><option value="completacion">Completación</option></select></div><div class="md:col-span-2"><label class="block font-medium mb-1">Texto</label><input type="text" class="w-full p-2 border rounded question-text"></div><div class="md:col-span-2 options-container"></div><div><label class="block font-medium mb-1">Respuesta</label><input type="text" class="w-full p-2 border rounded correct-answer"></div></div></div>`;
        questionsContainer.appendChild(node);
        const ts = node.querySelector('.question-type-select'); const oc = node.querySelector('.options-container');
        const setOpts = (val) => oc.innerHTML = val === 'opcion_multiple' ? '<label class="block text-xs">Opciones (A,B,C)</label><input type="text" class="w-full p-2 border rounded question-options">' : (val === 'verdadero_falso' ? '<input type="text" value="Verdadero,Falso" readonly class="w-full p-2 border rounded bg-gray-100 question-options">' : '');
        setOpts(ts.value); ts.onchange = (e) => setOpts(e.target.value);
    };
    if (questionsContainer) questionsContainer.onclick = (e) => { if (e.target.classList.contains('remove-question-btn')) e.target.closest('.question-block').remove(); };

    if (createExamForm) createExamForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const formData = Object.fromEntries(new FormData(e.target).entries());

        const payload = {
            ...formData,
            preguntas: [],
            profesorId: currentUser.userId
        };

        if (quillExam) payload.descripcion = quillExam.root.innerHTML;

        questionsContainer.querySelectorAll('.question-block').forEach(block => {
            const type = block.querySelector('.question-type-select').value;
            const q = { preguntaTipo: type, textoPregunta: block.querySelector('.question-text').value, respuestaCorrecta: block.querySelector('.correct-answer').value, opciones: {} };
            const opts = block.querySelector('.question-options')?.value || '';
            if (type === 'opcion_multiple' || type === 'verdadero_falso') opts.split(',').forEach((p, i) => { const L = ['A', 'B', 'C', 'D'][i]; if (L) q.opciones[L] = p.trim(); });
            payload.preguntas.push(q);
        });

        if (payload.preguntas.length === 0) { alert('Debe añadir al menos una pregunta.'); return; }

        btn.classList.add('btn-loading');
        try {
            const res = await fetchApi('EXAM', 'createExam', payload);
            if (res.status === 'success') {
                alert('Examen creado correctamente.');
                e.target.reset();
                if (quillExam) quillExam.setContents([]);
                questionsContainer.innerHTML = '';
                qCounter = 0;
                navTareas.click();
            }
            else throw new Error(res.message);
        } catch (error) { alert(error.message); } finally { btn.classList.remove('btn-loading'); }
    };

    // --- MÓDULO 4: Proyectos PSeInt ---
    let allProjectsRaw = [];
    async function fetchProjects() {
        const tbody = document.getElementById('projects-table-body');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center p-8">Cargando proyectos...</td></tr>';
        const grado = document.getElementById('proj-filter-grado').value;
        const seccion = document.getElementById('proj-filter-seccion').value;
        try {
            const res = await fetchApi('TASK', 'getAllStudentProjects', { grado, seccion });
            allProjectsRaw = res.data || [];
            renderProjects();
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-red-500">Error: ${e.message}</td></tr>`;
        }
    }

    function renderProjects() {
        const tbody = document.getElementById('projects-table-body');
        if (allProjectsRaw.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center p-8 text-gray-500">No se encontraron proyectos.</td></tr>';
            return;
        }
        tbody.innerHTML = allProjectsRaw.map((p, idx) => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="p-4 font-bold text-gray-800">${p.alumnoNombre}</td>
                <td class="p-4 text-blue-600 font-medium">${p.projectName}</td>
                <td class="p-4 text-xs text-gray-500">${p.grado} - ${p.seccion}</td>
                <td class="p-4 text-xs text-gray-400">${new Date(p.lastUpdated).toLocaleString()}</td>
                <td class="p-4 text-right">
                    <button onclick="window.viewProjectCode('${p.fileId}', '${p.projectName}')" class="bg-blue-600 text-white px-3 py-1 rounded-xl text-xs font-bold">Ver Código</button>
                </td>
            </tr>
        `).join('');
    }

    window.viewProjectCode = async (fileId, name) => {
        const modal = document.getElementById('project-code-modal');
        const content = document.getElementById('project-code-content');
        document.getElementById('project-code-title').textContent = `Proyecto: ${name}`;
        content.textContent = "Cargando código...";
        modal.classList.remove('hidden');
        try {
            const res = await fetchApi('TASK', 'loadProject', { fileId });
            content.textContent = res.data.code;
        } catch (e) {
            content.textContent = "Error al cargar el código.";
        }
    };
    document.getElementById('close-project-modal').onclick = () => document.getElementById('project-code-modal').classList.add('hidden');
    document.getElementById('refresh-projects-btn').onclick = fetchProjects;
    document.getElementById('proj-filter-grado').onchange = fetchProjects;
    document.getElementById('proj-filter-seccion').onchange = fetchProjects;

    // --- MÓDULO 5: Logros y Minijuegos ---
    async function fetchLogros() {
        const tbody = document.getElementById('logros-table-body');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center p-8">Cargando logros...</td></tr>';
        const grado = document.getElementById('logros-filter-grado').value;
        const seccion = document.getElementById('logros-filter-seccion').value;
        try {
            const res = await fetchApi('USER', 'getGameStats', { grado, seccion });
            const data = res.data || [];

            // Agrupar por alumno y juego para encontrar el récord máximo
            const records = {};
            data.forEach(r => {
                const key = `${r[1]}_${r[3]}`; // userId + juego
                const score = parseFloat(r[5] || 0);
                if (!records[key] || score > records[key].maxScore) {
                    records[key] = {
                        alumno: r[2],
                        juego: r[3],
                        maxScore: score,
                        lastLogro: r[4],
                        fecha: r[0]
                    };
                }
            });

            const sortedRecords = Object.values(records).sort((a, b) => b.maxScore - a.maxScore);

            if (sortedRecords.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center p-8 text-gray-500">No hay registros de juegos.</td></tr>';
                return;
            }

            tbody.innerHTML = sortedRecords.map((r, idx) => `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4 text-gray-400 font-mono">${idx + 1}</td>
                    <td class="p-4 font-bold text-gray-800">${r.alumno}</td>
                    <td class="p-4 text-purple-600 font-bold">${r.juego}</td>
                    <td class="p-4"><span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-black">${r.maxScore}</span></td>
                    <td class="p-4 text-xs italic text-gray-600">${r.lastLogro}</td>
                    <td class="p-4 text-xs text-gray-400">${new Date(r.fecha).toLocaleString()}</td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-red-500">Error: ${e.message}</td></tr>`;
        }
    }
    document.getElementById('refresh-logros-btn').onclick = fetchLogros;
    document.getElementById('logros-filter-grado').onchange = fetchLogros;
    document.getElementById('logros-filter-seccion').onchange = fetchLogros;

    fetchTeacherActivity().then(() => { navigateTo(sectionOperationalDashboard, navDashboard); fetchOperationalDashboard(); });
});

// --- MÓDULO: Gestión de Noticias ---
const newsModal = document.getElementById('news-modal');
const closeNewsModal = document.getElementById('close-news-modal');
const cancelNewsBtn = document.getElementById('cancel-news-btn');
const btnCreateNews = document.getElementById('btn-create-news');
const newsForm = document.getElementById('news-form');
const newsManagementContainer = document.getElementById('news-management-container');

if (btnCreateNews) {
    btnCreateNews.onclick = () => {
        newsForm.reset();
        document.getElementById('news-image-url').value = '';
        if (quillNews) quillNews.setContents([]);
        newsModal.classList.remove('hidden');
    };
}

if (closeNewsModal) closeNewsModal.onclick = () => newsModal.classList.add('hidden');
if (cancelNewsBtn) cancelNewsBtn.onclick = () => newsModal.classList.add('hidden');

async function fetchNewsManagement() {
    newsManagementContainer.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">Cargando noticias...</div>';
    try {
        const res = await fetchApi('USER', 'getNews', {});
        if (res.status === 'success') {
            const data = res.data || [];
            if (data.length === 0) {
                newsManagementContainer.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No hay noticias publicadas.</div>';
                return;
            }
            newsManagementContainer.innerHTML = data.map(n => `
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
                    ${n.imagenUrl ? `
                        <div class="h-40 overflow-hidden">
                            <img src="${window.convertDriveLink ? window.convertDriveLink(n.imagenUrl) : n.imagenUrl}" class="w-full h-full object-cover">
                        </div>
                    ` : ''}
                    <div class="p-5">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">${n.categoria}</span>
                            <span class="text-[10px] text-gray-400">${n.fecha}</span>
                        </div>
                        <h3 class="font-bold text-gray-800 mb-2 line-clamp-2">${n.titulo}</h3>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        newsManagementContainer.innerHTML = '<div class="col-span-full text-center py-12 text-red-500">Error al cargar noticias.</div>';
    }
}

if (newsForm) {
    newsForm.onsubmit = async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('save-news-btn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Publicando...';

        try {
            let imageUrl = document.getElementById('news-image-url').value;
            const imageInput = document.getElementById('news-image-input');

            if (imageInput.files.length > 0) {
                const file = imageInput.files[0];
                const base64 = await toBase64(file);
                const uploadRes = await fetchApi('USER', 'uploadNewsImage', {
                    fileName: file.name,
                    fileData: base64
                });
                if (uploadRes.status === 'success') {
                    imageUrl = uploadRes.data.fileId;
                }
            }

            const payload = {
                titulo: document.getElementById('news-title').value,
                categoria: document.getElementById('news-category').value,
                imagenUrl: imageUrl,
                contenido: quillNews.root.innerHTML
            };

            const res = await fetchApi('USER', 'createNews', payload);
            if (res.status === 'success') {
                alert('Noticia publicada exitosamente.');
                newsModal.classList.add('hidden');
                fetchNewsManagement();
            } else {
                alert(res.message);
            }
        } catch (error) {
            alert('Error al publicar noticia.');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Publicar';
        }
    };
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * MÓDULO: Gestión de Perfil del Profesor
 */
const profileModal = document.getElementById('profile-modal');
const openProfileBtn = document.getElementById('open-profile-btn');
const mobileOpenProfileBtn = document.getElementById('mobile-open-profile-btn');
const closeProfileModal = document.getElementById('close-profile-modal');
const profileForm = document.getElementById('profile-form');

const openProfile = () => {
    document.getElementById('profile-nombre').value = currentUser.nombre;
    document.getElementById('profile-email').value = currentUser.email || '';
    profileModal.classList.remove('hidden');
};

if (openProfileBtn) openProfileBtn.onclick = openProfile;
if (mobileOpenProfileBtn) mobileOpenProfileBtn.onclick = () => {
    openProfile();
    const menu = document.getElementById('mobile-menu-overlay');
    if (menu) menu.classList.add('hidden');
};

if (closeProfileModal) closeProfileModal.onclick = () => profileModal.classList.add('hidden');

if (profileForm) {
    profileForm.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = profileForm.querySelector('button[type="submit"]');
        const newPassword = document.getElementById('profile-password').value;
        const currentPassword = document.getElementById('profile-current-password').value;


            if (newPassword !== document.getElementById('profile-password-confirm').value) {
                alert('Las contraseñas no coinciden.');
                return;
            }

        if (newPassword && !currentPassword) {
            alert('Debe ingresar su contraseña actual para realizar cambios de seguridad.');
            return;
        }

        const payload = {
            userId: currentUser.userId,
            nombre: document.getElementById('profile-nombre').value,
            email: document.getElementById('profile-email').value,
            currentPassword: currentPassword || undefined,
            password: newPassword || undefined
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        try {
            const res = await fetchApi('USER', 'updateUserProfile', payload);
            if (res.status === 'success') {
                alert('Perfil actualizado correctamente.');
                // Actualizar localstorage
                currentUser.nombre = payload.nombre;
                currentUser.email = payload.email;
                currentUser.telefono = payload.telefono;
                currentUser.numeroLista = payload.numeroLista;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                location.reload();
            } else {
                alert(res.message);
            }
        } catch (error) {
            alert('Error al actualizar perfil.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar Cambios';
        }
    };
}

    async function fetchOperationalDashboard() {
        const tbody = document.getElementById('op-table-body');
        const thead = document.getElementById('op-table-head');
        tbody.innerHTML = '<tr><td class="text-center p-8">Cargando pendientes...</td></tr>';

        try {
            const res = await fetchApi('TASK', 'getTeacherActivity', { profesorId: currentUser.userId });
            if (res.status === 'success') {
                const pending = (res.data || []).filter(i =>
                    (i.estado === 'Pendiente' || i.estado === 'Pendiente de revisión' || !i.estado) &&
                    (i.fileId || i.respuestas || i.entregaId)
                );

                thead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100">
                    <th class="p-4 text-left font-bold text-gray-500 text-[0.7rem] uppercase">Alumno</th>
                    <th class="p-4 text-left font-bold text-gray-500 text-[0.7rem] uppercase">Actividad</th>
                    <th class="p-4 text-left font-bold text-gray-500 text-[0.7rem] uppercase">Fecha</th>
                    <th class="p-4 text-right font-bold text-gray-500 text-[0.7rem] uppercase">Acción</th>
                </tr>`;

                if (pending.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center p-8 text-gray-500">No hay tareas pendientes de revisión. ¡Buen trabajo!</td></tr>';
                    return;
                }

                tbody.innerHTML = pending.map((item, idx) => `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="p-4">
                            <div class="font-bold text-gray-800">${item.alumnoNombre}</div>
                            <div class="text-[10px] text-gray-400">${item.grado} - ${item.seccion}</div>
                        </td>
                        <td class="p-4">
                            <div class="font-bold text-blue-700">${item.titulo}</div>
                            <div class="text-[10px] text-gray-400">${item.asignatura} | ${item.tipo}</div>
                        </td>
                        <td class="p-4 text-xs text-gray-500">${new Date(item.fecha).toLocaleString()}</td>
                        <td class="p-4 text-right">
                            <button class="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 op-grade-btn" data-index="${idx}">Calificar</button>
                        </td>
                    </tr>
                `).join('');

                // Add event listeners for op-grade-btn
                tbody.querySelectorAll('.op-grade-btn').forEach(btn => {
                    btn.onclick = () => {
                        const item = pending[btn.dataset.index];
                        openGradeModal(item);
                    };
                });
            }
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center p-8 text-red-500">Error: ${e.message}</td></tr>`;
        }
    }
