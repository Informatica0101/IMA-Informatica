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
    const navEntregas = document.getElementById('nav-entregas');
    const navReportes = document.getElementById('nav-reportes');
    const navTareas = document.getElementById('nav-tareas');
    const navNoticias = document.getElementById('nav-noticias');

    const sectionEntregas = document.getElementById('section-entregas');
    const sectionReportes = document.getElementById('section-reportes');
    const sectionTareas = document.getElementById('section-tareas');
    const sectionNoticias = document.getElementById('section-noticias');

    const createActividadForm = document.getElementById('create-actividad-form');
    const formActividadContainer = document.getElementById('form-actividad-container');
    const formActividadTitle = document.getElementById('form-actividad-title');
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
    let studentSort = { column: 'nombre', direction: 'asc' };

    const allSections = [sectionEntregas, sectionReportes, sectionTareas, sectionNoticias];
    const allNavLinks = [navEntregas, navReportes, navTareas, navNoticias];

    let quillTarea = null;
    let quillNoticia = null;

    // Auxiliar para normalizar strings (trim, lowercase y sin acentos) para comparaciones robustas
    const norm = (s) => (s || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // --- Lógica de Navegación ---
    function navigateTo(targetSection, navElement) {
        allSections.forEach(section => section && section.classList.add('hidden'));
        targetSection.classList.remove('hidden');
        allNavLinks.forEach(link => {
            if (link) {
                link.classList.remove('bg-blue-600', 'text-white');
                link.classList.add('bg-white', 'text-gray-700');
            }
        });
        navElement.classList.add('bg-blue-600', 'text-white');
        navElement.classList.remove('bg-white', 'text-gray-700');
    }

    navEntregas.addEventListener('click', () => {
        navigateTo(sectionEntregas, navEntregas);
        navStack = [{ level: 'Grados', data: null }];
        fetchTeacherActivity();
    });
    navReportes.addEventListener('click', () => {
        navigateTo(sectionReportes, navReportes);
        initReportes();
    });
    navTareas.addEventListener('click', () => {
        navigateTo(sectionTareas, navTareas);
        fetchManagementData();
    });
    navNoticias.addEventListener('click', () => {
        navigateTo(sectionNoticias, navNoticias);
        fetchNoticiasManagement();
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

    // --- Lógica de Navegación Jerárquica ---
    async function pushNav(level, data) {
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

    function popNav() {
        if (isNavigating) return;
        if (navStack.length > 1) {
            if (studentSearchInput) studentSearchInput.value = '';
            navStack.pop();
            renderCurrentLevel();
        }
    }

    if (backNavBtn) backNavBtn.addEventListener('click', popNav);

    // --- MÓDULO 3: Gestión de Actividades ---
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
        document.getElementById('edit-descripcion').value = item.descripcion || '';
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
            descripcion: document.getElementById('edit-descripcion').value,
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
        const banner = document.getElementById('student-info-banner');

        if (current.level === 'Detalles') {
            title = `Historial de Actividades`;
            if (banner) {
                const s = current.data.studentInfo || {};
                const phone = s.telefono ? s.telefono.toString().replace(/\D/g, '') : '';
                const waLink = phone ? `https://wa.me/504${phone}` : null;
                const waBtn = waLink ? `
                    <a href="${waLink}" target="_blank" class="flex items-center space-x-2 bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-green-600 transition-all shadow-sm">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.438-9.889 9.886 0 2.225.587 3.841 1.578 5.49l-.903 3.303 3.393-.89zm11.375-7.679c-.161-.268-.589-.428-1.232-.75-.643-.321-3.793-1.872-4.382-2.086-.589-.214-1.018-.321-1.446.321-.428.643-1.661 2.089-2.036 2.518-.375.429-.75.482-1.393.161-.643-.321-2.712-1.001-5.166-3.192-1.91-1.704-3.199-3.808-3.573-4.451-.375-.643-.041-.991.28-1.31.289-.287.643-.75.964-1.125.321-.375.429-.643.643-1.071.214-.428.107-.803-.054-1.125-.161-.321-1.446-3.482-1.982-4.768-.522-1.253-1.054-1.081-1.446-1.101-.375-.02-1.101-.023-1.101-.023s-.75 0-1.125.428c-.375.429-1.446 1.411-1.446 3.442s2.089 3.991 2.303 4.286c.214.295 4.114 6.279 9.957 8.796 1.39.599 2.474.957 3.319 1.224 1.398.444 2.671.381 3.677.23 1.12-.168 3.793-1.554 4.329-3.054.536-1.5 0-2.839-.161-3.107z"/></svg>
                        <span>WhatsApp Alumno</span>
                    </a>` : '';

                banner.innerHTML = `
                    <div class="flex-grow">
                        <p class="text-blue-800 font-black text-lg">${current.data.alumnoNombre}</p>
                        <p class="text-blue-600 text-xs font-medium uppercase tracking-wider">
                            Nº Lista: ${s.numeroLista || '-'} | Tel: ${s.telefono || 'Sin registro'} | ${s.email || 'Sin correo'}
                        </p>
                    </div>
                    ${waBtn}
                `;
                banner.classList.remove('hidden');
            }
        } else {
            if (banner) banner.classList.add('hidden');
        }

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
            case 'Asignaturas': renderAsignaturas(current.data.grado, current.data.seccion, searchTerm); break;
            case 'Parciales': renderParciales(current.data.grado, current.data.seccion, current.data.asignatura, searchTerm); break;
            case 'Alumnos': renderAlumnos(current.data.grado, current.data.seccion, current.data.asignatura, searchTerm); break;
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

    function renderAsignaturas(grado, seccion, search) {
        let asignaturas = [...new Set([
            ...allActivityRaw.filter(i => norm(i.grado) === norm(grado) && norm(i.seccion) === norm(seccion)).map(i => i.asignatura),
            ...allAssignmentsRaw.filter(i => norm(i.grado) === norm(grado) && (norm(i.seccion) === norm(seccion) || !i.seccion || norm(i.seccion) === 'todas')).map(i => i.asignatura)
        ].filter(s => s))];
        const filtered = asignaturas.filter(s => norm(s).includes(norm(search)));
        currentFilteredItems = filtered;
        dashboardTableHead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Asignatura</th><th class="p-4 text-right font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>`;
        submissionsTableBody.innerHTML = filtered.map((asig, idx) => `<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}"><td class="p-4 font-bold text-gray-800">${asig}</td><td class="p-4 text-right"><span class="text-blue-600 font-bold text-sm">Ver Parciales &rsaquo;</span></td></tr>`).join('');
    }

    function renderParciales(grado, seccion, asignatura, search) {
        let parciales = [...new Set([
            ...allActivityRaw.filter(i => norm(i.grado) === norm(grado) && norm(i.seccion) === norm(seccion) && norm(i.asignatura) === norm(asignatura)).map(i => i.parcial),
            ...allAssignmentsRaw.filter(i => norm(i.grado) === norm(grado) && (norm(i.seccion) === norm(seccion) || !i.seccion || norm(i.seccion) === 'todas') && norm(i.asignatura) === norm(asignatura)).map(i => i.parcial)
        ].filter(p => p))];

        const PARCIAL_ORDER = ['Primer Parcial', 'Segundo Parcial', 'Tercer Parcial', 'Cuarto Parcial'];
        parciales.sort((a, b) => PARCIAL_ORDER.indexOf(a) - PARCIAL_ORDER.indexOf(b));

        const filtered = parciales.filter(p => norm(p).includes(norm(search)));
        currentFilteredItems = filtered;
        dashboardTableHead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Parcial</th><th class="p-4 text-right font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>`;
        submissionsTableBody.innerHTML = filtered.map((parcial, idx) => `<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}"><td class="p-4 font-bold text-gray-800">${parcial}</td><td class="p-4 text-right"><span class="text-blue-600 font-bold text-sm">Ver Alumnos &rsaquo;</span></td></tr>`).join('');
    }

    function renderAlumnos(grado, seccion, asignatura, search) {
        const current = navStack[navStack.length - 1];
        const students = current.data.students || [];
        const parcial = current.data.parcial;

        const studentsWithStatus = students.map(s => {
            const studentActivity = allActivityRaw.filter(i => i.alumnoId == s.userId && norm(i.asignatura) === norm(asignatura) && norm(i.parcial) === norm(parcial));
            let hasPending = false;
            studentActivity.forEach(item => {
                const isDelivered = !!(item.fileId || item.respuestas || item.entregaId);
                const isGraded = (item.estado === 'Completada' || item.estado === 'Revisada' || item.estado === 'Rechazada' || item.estado === 'Tarea incompleta');
                if (isDelivered && !isGraded) hasPending = true;
            });
            return { ...s, hasPending, statusText: hasPending ? 'Pendiente' : 'Al día' };
        });

        let filtered = studentsWithStatus.filter(s => norm(s.nombre).includes(norm(search)));

        filtered.sort((a, b) => {
            let valA = a[studentSort.column];
            let valB = b[studentSort.column];
            if (studentSort.column === 'statusText') {
                valA = a.hasPending ? 'A_Pendiente' : 'B_AlDia';
                valB = b.hasPending ? 'A_Pendiente' : 'B_AlDia';
            }
            if (valA < valB) return studentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return studentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        currentFilteredItems = filtered;

        const sortIcon = (col) => {
            if (studentSort.column !== col) return '↕';
            return studentSort.direction === 'asc' ? '↑' : '↓';
        };

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem] cursor-pointer hover:bg-gray-100 sort-btn" data-sort="numeroLista">
                    Nº ${sortIcon('numeroLista')}
                </th>
                <th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem] cursor-pointer hover:bg-gray-100 sort-btn" data-sort="nombre">
                    Alumno ${sortIcon('nombre')}
                </th>
                <th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem] cursor-pointer hover:bg-gray-100 sort-btn" data-sort="statusText">
                    Estado ${sortIcon('statusText')}
                </th>

                <th class="p-4 text-right font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th>
            </tr>`;

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="3" class="text-center p-8 text-gray-500">No hay alumnos inscritos.</td></tr>';
            return;
        }

        submissionsTableBody.innerHTML = filtered.map((s, idx) => {
            const statusHtml = s.hasPending
                ? '<span class="text-yellow-600 font-bold uppercase text-[10px]">Por Revisar</span>'
                : '<span class="text-green-600 font-bold uppercase text-[10px]">Al día</span>';

            return `
                <tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}">
                    <td class="p-4 text-gray-400 font-medium">${s.numeroLista || '-'}</td>
                    <td class="p-4 font-bold text-blue-700">${s.nombre}</td>
                    <td class="p-4 text-sm">${statusHtml}</td>
                    <td class="p-4 text-right">
                        <span class="text-blue-600 font-bold text-sm">Ver detalles &rsaquo;</span>
                    </td>
                </tr>`;
        }).join('');
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
        filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const finalFiltered = filtered.filter(item => {
            if (!fEstado) return true;
            let itemEstado = 'Pendiente';
            if (item.estado === 'Completada' || item.estado === 'Revisada') itemEstado = 'Completada';
            else if (item.estado === 'Rechazada') itemEstado = 'Rechazada';
            else if (item.estado === 'Tarea incompleta') itemEstado = 'Tarea incompleta';
            else if (item.fileId || item.respuestas || item.entregaId) itemEstado = 'Por calificar';
            return itemEstado === fEstado;
        });
        currentFilteredItems = finalFiltered;
        dashboardTableHead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Actividad</th><th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Estado</th><th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Archivo</th><th class="p-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Calificación</th><th class="p-4 text-right font-bold text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>`;
        if (finalFiltered.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="5" class="text-center p-8 text-gray-500">Sin entregas.</td></tr>'; return; }
        submissionsTableBody.innerHTML = finalFiltered.map((item, idx) => {
            let statusClass = 'bg-gray-100 text-gray-600'; let statusText = 'Pendiente';
            if (item.estado === 'Completada' || item.estado === 'Revisada') { statusText = 'Completada'; statusClass = 'bg-green-100 text-green-700'; }
            else if (item.estado === 'Rechazada') { statusText = 'Rechazada'; statusClass = 'bg-red-100 text-red-700'; }
            else if (item.estado === 'Tarea incompleta') { statusText = 'Incompleta'; statusClass = 'bg-pink-100 text-pink-600'; }
            else if (item.fileId || item.respuestas || item.entregaId) { statusText = 'Por calificar'; statusClass = 'bg-yellow-100 text-yellow-700'; }

            let fileHtml = 'N/A';
            if (item.fileId) {
                const fId = extractDriveId(item.fileId);
                const url = item.mimeType === 'folder' ? `https://drive.google.com/drive/folders/${fId}` : `https://drive.google.com/uc?id=${fId}`;
                fileHtml = `<a href="${url}" target="_blank" class="text-blue-600 font-bold hover:underline">Ver</a>`;
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
                        if (res.status === 'success') { alert(res.message); fetchTeacherActivity(); }
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
                else if (current.level === 'Secciones') await pushNav('Asignaturas', { grado: current.data.grado, seccion: item });
                else if (current.level === 'Asignaturas') await pushNav('Parciales', { grado: current.data.grado, seccion: current.data.seccion, asignatura: item });
                else if (current.level === 'Parciales') await pushNav('Alumnos', { grado: current.data.grado, seccion: current.data.seccion, asignatura: current.data.asignatura, parcial: item });
                else if (current.level === 'Alumnos') await pushNav('Detalles', { alumnoId: item.userId, alumnoNombre: item.nombre, studentInfo: item, grado: current.data.grado, seccion: current.data.seccion, asignatura: current.data.asignatura, parcial: current.data.parcial });
            }
        });
    }

    // --- MÓDULO 2: Reportes Visuales ---
    let reportData = [];
    let reportSort = { column: 'total', direction: 'desc' };

    async function initReportes() {
        const reportTableBody = document.getElementById('report-table-body');
        if (!reportTableBody) return;

        // Lógica de "Grado más cercano": Buscar el primer grado que tenga alguna tarea calificada
        if (allActivityRaw.length === 0) {
            await fetchTeacherActivity();
        }

        let bestGrado = "";
        let bestSeccion = "A";
        let bestParcial = "Primer Parcial";

        const priority = ['Décimo', 'Undécimo', 'Duodécimo'];
        for (const g of priority) {
            const hasData = allActivityRaw.some(i => norm(i.grado) === norm(g) && i.calificacion);
            if (hasData) {
                bestGrado = g;
                break;
            }
        }

        if (bestGrado) {
            document.getElementById('report-grado').value = bestGrado;
            document.getElementById('report-seccion').value = bestSeccion;
            document.getElementById('report-parcial').value = bestParcial;
            loadReportData();
        }
    }

    async function loadReportData() {
        const grado = document.getElementById('report-grado').value;
        const seccion = document.getElementById('report-seccion').value;
        const parcial = document.getElementById('report-parcial').value;
        const tbody = document.getElementById('report-table-body');

        tbody.innerHTML = '<tr><td colspan="3" class="text-center p-8"><div class="loading-spinner"></div> Cargando reporte...</td></tr>';

        try {
            const studentsRes = await fetchApi('USER', 'getStudentsByGradoSeccion', { grado, seccion });
            const students = studentsRes.data || [];

            if (students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center p-8 text-gray-500">No hay alumnos registrados en este grado/sección.</td></tr>';
                return;
            }

            // Calcular totales
            reportData = students.map(student => {
                const activities = allActivityRaw.filter(i =>
                    i.alumnoId == student.userId &&
                    norm(i.grado) === norm(grado) &&
                    norm(i.seccion) === norm(seccion) &&
                    norm(i.parcial) === norm(parcial)
                );
                const total = activities.reduce((acc, curr) => acc + parseFloat(curr.calificacion || 0), 0);
                return {
                    numeroLista: student.numeroLista || 0,
                    nombre: student.nombre,
                    total: total,
                    userId: student.userId
                };
            });

            renderReportTable();
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center p-8 text-red-500">Error: ${e.message}</td></tr>`;
        }
    }

    function renderReportTable() {
        const tbody = document.getElementById('report-table-body');

        const sorted = [...reportData].sort((a, b) => {
            let valA = a[reportSort.column];
            let valB = b[reportSort.column];
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            if (valA < valB) return reportSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return reportSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        tbody.innerHTML = sorted.map(row => `
            <tr class="hover:bg-gray-50">
                <td class="p-4 text-gray-500 font-medium">${row.numeroLista || '-'}</td>
                <td class="p-4 font-bold text-gray-800">${row.nombre}</td>
                <td class="p-4 text-right font-black text-blue-600">${row.total.toFixed(1)}%</td>
            </tr>
        `).join('');

        // Actualizar iconos de ordenamiento
        document.querySelectorAll('.report-sort').forEach(th => {
            const col = th.dataset.sort;
            const icon = reportSort.column === col ? (reportSort.direction === 'asc' ? '↑' : '↓') : '↕';
            th.textContent = th.textContent.split(' ')[0] + ' ' + icon;
        });
    }

    document.querySelectorAll('.report-sort').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (reportSort.column === col) {
                reportSort.direction = reportSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                reportSort.column = col;
                reportSort.direction = 'asc';
            }
            renderReportTable();
        });
    });

    ['report-grado', 'report-seccion', 'report-parcial'].forEach(id => {
        document.getElementById(id).addEventListener('change', loadReportData);
    });

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
                const headers = ['Nº Lista', 'ID Usuario', 'Nombre del Alumno'];
                subTasks.forEach(t => headers.push(t.titulo));
                subExams.forEach((e, i) => headers.push(`Examen ${i + 1}: ${e.titulo}`));
                headers.push('TOTAL DE PUNTOS');
                const data = students.map(student => {
                    const row = [student.numeroLista || '', student.userId, student.nombre]; let total = 0;
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
        else if (entrega.fileId) {
            const fId = extractDriveId(entrega.fileId);
            flm.href = entrega.mimeType === 'folder' ? `https://drive.google.com/drive/folders/${fId}` : `https://drive.google.com/uc?id=${fId}`;
            flm.textContent = "Ver Archivo";
        }
        else { flm.href = '#'; flm.textContent = "N/A"; }
        document.getElementById('calificacion').value = entrega.calificacion || '';

        const estadoSelect = document.getElementById('estado');
        estadoSelect.innerHTML = `
            <option value="Completada">Completada</option>
            <option value="Rechazada">Rechazada</option>
            <option value="Tarea incompleta">Tarea incompleta</option>
        `;
        estadoSelect.value = (entrega.estado === 'Revisada' ? 'Completada' : (entrega.estado || 'Completada'));

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
            if (res.status === 'success') { alert('Guardado.'); gradeModal.classList.add('hidden'); fetchTeacherActivity(); }
            else throw new Error(res.message);
        } catch (error) { alert('Error: ' + error.message); }
        finally { saveGradeBtn.classList.remove('btn-loading'); }
    };

    // --- MÓDULO 4: Noticias ---
    let noticiasRaw = [];

    async function fetchNoticiasManagement() {
        const container = document.getElementById('noticias-management-container');
        container.innerHTML = '<p class="text-center col-span-3 p-8">Cargando noticias...</p>';
        try {
            const res = await fetchApi('TASK', 'getNoticias');
            if (res.status === 'success') {
                noticiasRaw = res.data;
                renderNoticiasManagement();
            }
        } catch (e) {
            container.innerHTML = `<p class="text-red-500 col-span-3 text-center">${e.message}</p>`;
        }
    }

    function renderNoticiasManagement() {
        const container = document.getElementById('noticias-management-container');
        container.innerHTML = noticiasRaw.map(n => {
            const imgId = n.imagenesDriveID && n.imagenesDriveID[0];
            const url = imgId ? `https://lh3.googleusercontent.com/d/${imgId}=w400` : 'imagenes/logo.png';
            return `
                <div class="dashboard-card group">
                    <div class="h-32 rounded-xl overflow-hidden mb-4 relative">
                        <img src="${url}" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all"></div>
                    </div>
                    <h4 class="font-bold text-gray-800 line-clamp-1">${n.titulo}</h4>
                    <p class="text-xs text-gray-400 mb-4">${n.fechaPublicacion}</p>
                    <div class="flex space-x-2">
                        <button onclick="window.openEditNoticia('${n.idNoticia}')" class="flex-1 bg-blue-50 text-blue-600 font-bold py-2 rounded-lg text-xs hover:bg-blue-100">Editar</button>
                        <button onclick="window.deleteNoticia('${n.idNoticia}')" class="bg-red-50 text-red-600 font-bold px-3 py-2 rounded-lg text-xs hover:bg-red-100">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    const formNoticiaContainer = document.getElementById('form-noticia-container');
    const closeNoticiaForm = document.getElementById('close-noticia-form');
    const openCreateNoticiaBtn = document.getElementById('open-create-noticia-btn');

    if (openCreateNoticiaBtn) openCreateNoticiaBtn.onclick = () => {
        document.getElementById('noticia-form').reset();
        document.getElementById('noticia-id').value = '';
        document.getElementById('form-noticia-title').textContent = 'Nueva Noticia';
        document.getElementById('noticia-fecha').value = new Date().toISOString().split('T')[0];
        document.getElementById('noticia-hora').value = new Date().toTimeString().split(' ')[0].substring(0, 5);
        if (quillNoticia) quillNoticia.setText('');
        formNoticiaContainer.classList.remove('hidden');
    };

    if (closeNoticiaForm) closeNoticiaForm.onclick = () => formNoticiaContainer.classList.add('hidden');

    window.openEditNoticia = (id) => {
        const n = noticiasRaw.find(x => x.idNoticia === id);
        if (!n) return;
        document.getElementById('noticia-id').value = n.idNoticia;
        document.getElementById('noticia-titulo').value = n.titulo;
        document.getElementById('noticia-fecha').value = n.fechaPublicacion;
        document.getElementById('noticia-hora').value = n.horaPublicacion;
        if (quillNoticia) quillNoticia.root.innerHTML = n.contenidoHTML;
        document.getElementById('form-noticia-title').textContent = 'Editar Noticia';
        formNoticiaContainer.classList.remove('hidden');
    };

    window.deleteNoticia = async (id) => {
        if (!confirm('¿Eliminar esta noticia?')) return;
        try {
            const res = await fetchApi('TASK', 'deleteNoticia', { idNoticia: id });
            if (res.status === 'success') { fetchNoticiasManagement(); }
        } catch (e) { alert(e.message); }
    };

    const noticiaForm = document.getElementById('noticia-form');
    if (noticiaForm) noticiaForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('noticia-id').value;
        const btn = document.getElementById('save-noticia-btn');
        const files = document.getElementById('noticia-images').files;

        btn.disabled = true; btn.textContent = 'Procesando...';

        try {
            let imagenesDriveID = [];
            // Si hay archivos, subirlos
            if (files.length > 0) {
                for (let file of files) {
                    const reader = new FileReader();
                    const data = await new Promise(r => { reader.onload = () => r(reader.result); reader.readAsDataURL(file); });
                    const uploadRes = await fetchApi('TASK', 'uploadFile', {
                        userId: currentUser.userId,
                        tareaId: 'NOTICIA',
                        parcial: 'NOTICIAS',
                        asignatura: 'NOTICIAS',
                        fileName: file.name,
                        fileData: data
                    });
                    if (uploadRes.status === 'success') imagenesDriveID.push(uploadRes.data.fileId);
                }
            }

            const payload = {
                titulo: document.getElementById('noticia-titulo').value,
                fechaPublicacion: document.getElementById('noticia-fecha').value,
                horaPublicacion: document.getElementById('noticia-hora').value,
                contenidoHTML: quillNoticia ? quillNoticia.root.innerHTML : '',
                imagenesDriveID: imagenesDriveID.length > 0 ? imagenesDriveID : undefined
            };

            const action = id ? 'updateNoticia' : 'createNoticia';
            if (id) payload.idNoticia = id;

            const res = await fetchApi('TASK', action, payload);
            if (res.status === 'success') {
                alert('Éxito.');
                formNoticiaContainer.classList.add('hidden');
                fetchNoticiasManagement();
            }
        } catch (e) { alert(e.message); }
        finally { btn.disabled = false; btn.textContent = 'PUBLICAR NOTICIA'; }
    };

    // --- MÓDULO: WhatsApp Grupos ---
    const manageWhatsappBtn = document.getElementById('manage-whatsapp-btn');
    if (manageWhatsappBtn) manageWhatsappBtn.onclick = async () => {
        const grado = prompt('Ingrese el grado a configurar (Décimo, Undécimo, Duodécimo):');
        if (!grado) return;
        const enlace = prompt(`Ingrese el enlace de invitación para ${grado}:`);
        if (!enlace) return;

        try {
            const res = await fetchApi('TASK', 'updateWhatsAppGroup', {
                grado,
                enlaceGrupo: enlace,
                profesorAutor: currentUser.nombre
            });
            alert(res.message);
        } catch (e) { alert(e.message); }
    };

    // --- CRUD Forms ---
    // Inicializar Quills
    if (document.getElementById('noticia-editor')) {
        quillNoticia = new Quill('#noticia-editor', { theme: 'snow', modules: { toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['link', 'image']] } });
    }

    // Re-estructurar creación de actividades para usar un solo formulario dinámico
    const openCreateTaskBtn = document.getElementById('open-create-task-btn');
    const openCreateExamBtn = document.getElementById('open-create-exam-btn');

    function setupActividadForm(tipo) {
        formActividadTitle.textContent = tipo === 'Tarea' ? 'Nueva Tarea' : 'Nuevo Examen';
        createActividadForm.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                    <label class="block font-bold text-gray-700 mb-2">Título</label>
                    <input type="text" name="titulo" class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none" required>
                </div>
                ${tipo === 'Tarea' ? `
                <div>
                    <label class="block font-bold text-gray-700 mb-2">Tipo de Tarea</label>
                    <select name="tipo" class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none">
                        <option value="Tarea">Tarea Normal</option>
                        <option value="Credito Extra">Crédito Extra</option>
                    </select>
                </div>
                ` : ''}
                <div>
                    <label class="block font-bold text-gray-700 mb-2">Asignatura</label>
                    <input type="text" name="asignatura" class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none" required>
                </div>
                <div>
                    <label class="block font-bold text-gray-700 mb-2">Grado</label>
                    <select name="gradoAsignado" class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none" required>
                        <option value="Décimo">Décimo</option>
                        <option value="Undécimo">Undécimo</option>
                        <option value="Duodécimo">Duodécimo</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-gray-700 mb-2">Sección (Opcional)</label>
                    <input type="text" name="seccionAsignada" placeholder="A, B o C" class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none">
                </div>
                <div>
                    <label class="block font-bold text-gray-700 mb-2">Parcial</label>
                    <select name="parcial" class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none">
                        <option value="Primer Parcial">Primer Parcial</option>
                        <option value="Segundo Parcial">Segundo Parcial</option>
                        <option value="Tercer Parcial">Tercer Parcial</option>
                        <option value="Cuarto Parcial">Cuarto Parcial</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-gray-700 mb-2">Fecha Límite</label>
                    <input type="date" name="fechaLimite" class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none" required>
                </div>
                ${tipo === 'Examen' ? `
                <div>
                    <label class="block font-bold text-gray-700 mb-2">Tiempo Límite (min)</label>
                    <input type="number" name="tiempoLimite" class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none" value="60">
                </div>
                ` : ''}
                <div class="md:col-span-2">
                    <label class="block font-bold text-gray-700 mb-2">Descripción / Instrucciones</label>
                    <div id="actividad-editor" class="h-48 mb-12"></div>
                </div>
                ${tipo === 'Examen' ? `
                <div class="md:col-span-2 border-t pt-6">
                    <h4 class="text-xl font-bold mb-4">Preguntas del Examen</h4>
                    <div id="preguntas-container" class="space-y-4 mb-6"></div>
                    <button type="button" id="add-question-btn" class="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold">+ Añadir Pregunta</button>
                </div>
                ` : ''}
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all text-xl mt-8">CREAR ${tipo.toUpperCase()}</button>
        `;

        quillTarea = new Quill('#actividad-editor', { theme: 'snow' });

        if (tipo === 'Examen') {
            const aqb = document.getElementById('add-question-btn');
            const pc = document.getElementById('preguntas-container');
            aqb.onclick = () => {
                const qDiv = document.createElement('div');
                qDiv.className = 'p-4 border rounded-2xl bg-gray-50 relative question-block';
                qDiv.innerHTML = `
                    <button type="button" class="absolute top-4 right-4 text-red-500" onclick="this.parentElement.remove()">✕</button>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <label class="text-xs font-bold uppercase text-gray-400">Texto de la Pregunta</label>
                            <input type="text" class="w-full p-2 border rounded-lg question-text" required>
                        </div>
                        <div>
                            <label class="text-xs font-bold uppercase text-gray-400">Tipo</label>
                            <select class="w-full p-2 border rounded-lg question-type-select">
                                <option value="opcion_multiple">Opción Múltiple</option>
                                <option value="verdadero_falso">Verdadero/Falso</option>
                                <option value="completacion">Completación</option>
                            </select>
                        </div>
                        <div class="options-area"></div>
                        <div class="md:col-span-2">
                            <label class="text-xs font-bold uppercase text-gray-400">Respuesta Correcta</label>
                            <input type="text" class="w-full p-2 border rounded-lg correct-answer" required>
                        </div>
                    </div>
                `;
                pc.appendChild(qDiv);
                const s = qDiv.querySelector('.question-type-select');
                const oa = qDiv.querySelector('.options-area');
                s.onchange = () => {
                    if (s.value === 'opcion_multiple') oa.innerHTML = `<label class="text-xs font-bold uppercase text-gray-400">Opciones (sep. por comas)</label><input type="text" class="w-full p-2 border rounded-lg question-options" placeholder="A, B, C, D">`;
                    else if (s.value === 'verdadero_falso') oa.innerHTML = `<input type="hidden" class="question-options" value="Verdadero, Falso">`;
                    else oa.innerHTML = '';
                };
                s.onchange();
            };
        }

        formActividadContainer.classList.remove('hidden');
        formActividadContainer.dataset.tipo = tipo;
        window.scrollTo({ top: formActividadContainer.offsetTop - 100, behavior: 'smooth' });
    }

    if (openCreateTaskBtn) openCreateTaskBtn.onclick = () => setupActividadForm('Tarea');
    if (openCreateExamBtn) openCreateExamBtn.onclick = () => setupActividadForm('Examen');
    if (document.getElementById('close-actividad-form')) document.getElementById('close-actividad-form').onclick = () => formActividadContainer.classList.add('hidden');

    if (createActividadForm) createActividadForm.onsubmit = async (e) => {
        e.preventDefault();
        const tipo = formActividadContainer.dataset.tipo;
        const formData = new FormData(e.target);
        const basePayload = Object.fromEntries(formData.entries());
        basePayload.descripcion = quillTarea.root.innerHTML;
        basePayload.profesorId = currentUser.userId;

        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Guardando...';

        try {
            let res;
            if (tipo === 'Tarea') {
                res = await fetchApi('TASK', 'createTask', basePayload);
            } else {
                const preguntas = [];
                document.querySelectorAll('.question-block').forEach(qb => {
                    const t = qb.querySelector('.question-type-select').value;
                    const q = {
                        preguntaTipo: t,
                        textoPregunta: qb.querySelector('.question-text').value,
                        respuestaCorrecta: qb.querySelector('.correct-answer').value,
                        opciones: {}
                    };
                    const o = qb.querySelector('.question-options')?.value || '';
                    if (t === 'opcion_multiple' || t === 'verdadero_falso') o.split(',').forEach((opt, i) => { q.opciones[['A','B','C','D'][i]] = opt.trim(); });
                    preguntas.push(q);
                });
                res = await fetchApi('EXAM', 'createExam', { ...basePayload, preguntas });
            }
            if (res.status === 'success') {
                alert('Creado con éxito.');
                formActividadContainer.classList.add('hidden');
                fetchManagementData();
            }
        } catch (err) { alert(err.message); }
        finally { btn.disabled = false; btn.textContent = `CREAR ${tipo.toUpperCase()}`; }
    };

    // Inicialización automática de la sección Entregas
    navEntregas.classList.add('bg-blue-600', 'text-white');
    navEntregas.classList.remove('bg-white', 'text-gray-700');
    fetchTeacherActivity();
});
