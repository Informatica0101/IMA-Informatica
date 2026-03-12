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
    const navGestion = document.getElementById('nav-gestion');
    const navReportes = document.getElementById('nav-reportes');
    const navCrear = document.getElementById('nav-crear');
    const navCrearExamen = document.getElementById('nav-crear-examen');

    const sectionDashboard = document.getElementById('section-dashboard');
    const sectionGestion = document.getElementById('section-gestion');
    const sectionReportes = document.getElementById('section-reportes');
    const sectionCrear = document.getElementById('section-crear');
    const sectionCrearExamen = document.getElementById('section-crear-examen');

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
    let currentFilteredItems = [];
    let navStack = [{ level: 'Grados', data: null }];

    const allSections = [sectionDashboard, sectionGestion, sectionReportes, sectionCrear, sectionCrearExamen];
    const allNavLinks = [navDashboard, navGestion, navReportes, navCrear, navCrearExamen];

    // --- Lógica de Navegación ---
    function navigateTo(targetSection, navElement) {
        allSections.forEach(section => section && section.classList.add('hidden'));
        targetSection.classList.remove('hidden');
        allNavLinks.forEach(link => {
            if (link) {
                link.classList.remove('bg-primary', 'text-white');
                link.classList.add('text-gray-500', 'hover:bg-gray-50', 'hover:text-primary');
            }
        });
        navElement.classList.add('bg-primary', 'text-white');
        navElement.classList.remove('text-gray-500', 'hover:bg-gray-50', 'hover:text-primary');
    }

    navDashboard.addEventListener('click', () => {
        navigateTo(sectionDashboard, navDashboard);
        navStack = [{ level: 'Grados', data: null }];
        fetchTeacherActivity();
    });
    navGestion.addEventListener('click', () => {
        navigateTo(sectionGestion, navGestion);
        fetchManagementData();
    });
    navReportes.addEventListener('click', () => {
        navigateTo(sectionReportes, navReportes);
    });
    navCrear.addEventListener('click', () => navigateTo(sectionCrear, navCrear));
    navCrearExamen.addEventListener('click', () => navigateTo(sectionCrearExamen, navCrearExamen));
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
        if (studentSearchInput) studentSearchInput.value = '';

        if (level === 'Alumnos') {
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
    }

    function popNav() {
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
                <td class="p-4 font-bold text-primary">${item.titulo}</td>
                <td class="p-4">${item.asignatura}</td>
                <td class="p-4 text-xs font-semibold text-gray-500">${item.grado} - ${item.seccion || 'Todas'}</td>
                <td class="p-4 text-xs font-bold ${new Date(item.fechaLimite) < new Date() ? 'text-danger' : 'text-gray-600'}">
                    ${new Date(item.fechaLimite).toLocaleDateString()}
                </td>
                <td class="p-4 text-right">
                    <button class="btn-academic btn-secondary !py-1 !px-2">
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
        submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-8">Cargando actividad...</td></tr>';
        try {
            const payload = { profesorId: currentUser.userId };
            const [taskSubmissions, examSubmissions] = await Promise.all([
                fetchApi('TASK', 'getTeacherActivity', payload),
                fetchApi('EXAM', 'getTeacherExamActivity', payload)
            ]);

            allActivityRaw = [
                ...((taskSubmissions.data || [])).map(s => ({ ...s, tipo: 'Tarea' })),
                ...((examSubmissions.data || [])).map(s => ({ ...s, tipo: 'Examen' }))
            ];

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
            case 'Alumnos': renderAlumnos(current.data.grado, current.data.seccion, searchTerm); break;
            case 'Detalles': renderDetallesAlumno(current.data.alumnoId, current.data.grado, current.data.seccion, searchTerm); break;
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
                if (item.alumnoNombre.toLowerCase().includes(search)) {
                    alumnosGlobal.push({ id: item.alumnoId, nombre: item.alumnoNombre, grado: item.grado, seccion: item.seccion, total: 0 });
                    seen.add(key);
                }
            }
        });
        currentFilteredItems = alumnosGlobal;
        dashboardTableHead.innerHTML = `
            <tr>
                <th>Nombre del Alumno</th>
                <th>Grado / Sección</th>
                <th class="text-right">Acción</th>
            </tr>`;
        if (alumnosGlobal.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="3" class="text-center p-8 text-gray-400 italic">No se encontraron coincidencias para su búsqueda.</td></tr>'; return; }
        submissionsTableBody.innerHTML = alumnosGlobal.map((a, idx) => `
            <tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}">
                <td class="p-4 font-bold text-primary">${a.nombre}</td>
                <td class="p-4 text-sm font-semibold text-gray-500">${a.grado} - ${a.seccion || 'N/A'}</td>
                <td class="p-4 text-right"><span class="text-primary font-bold text-xs uppercase tracking-widest">Ver expediente &rsaquo;</span></td>
            </tr>`).join('');
    }

    function renderGrados(search) {
        const fGrado = document.getElementById('filter-grado').value;
        let grados = [...new Set(allActivityRaw.map(item => item.grado).filter(g => g))];
        if (fGrado) grados = grados.filter(g => g === fGrado);
        const filtered = grados.filter(g => g.toLowerCase().includes(search));
        currentFilteredItems = filtered;
        dashboardTableHead.innerHTML = `<tr><th>Grado Académico</th><th class="text-right">Acción</th></tr>`;
        if (filtered.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="2" class="text-center p-8 text-gray-400 italic">No se encontraron grados activos.</td></tr>'; return; }
        submissionsTableBody.innerHTML = filtered.map((grado, idx) => `<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}"><td class="p-4 font-bold text-gray-800">${grado}</td><td class="p-4 text-right"><span class="text-primary font-bold text-xs uppercase tracking-widest">Navegar Secciones &rsaquo;</span></td></tr>`).join('');
    }

    function renderSecciones(grado, search) {
        const fSeccion = document.getElementById('filter-seccion').value;
        let secciones = [...new Set(allActivityRaw.filter(i => i.grado === grado).map(i => i.seccion).filter(s => s))];
        if (fSeccion) secciones = secciones.filter(s => s === fSeccion);
        const filtered = secciones.filter(s => s.toLowerCase().includes(search));
        currentFilteredItems = filtered;
        dashboardTableHead.innerHTML = `<tr><th>Sección</th><th class="text-right">Acción</th></tr>`;
        submissionsTableBody.innerHTML = filtered.map((seccion, idx) => `<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}"><td class="p-4 font-bold text-gray-800">Sección ${seccion}</td><td class="p-4 text-right"><span class="text-primary font-bold text-xs uppercase tracking-widest">Listar Estudiantes &rsaquo;</span></td></tr>`).join('');
    }

    function renderAlumnos(grado, seccion, search) {
        const current = navStack[navStack.length - 1];
        const students = current.data.students || [];

        const studentsWithStatus = students.map(s => {
            const studentActivity = allActivityRaw.filter(i => i.alumnoId === s.userId);
            let hasPending = false;
            studentActivity.forEach(item => {
                const isDelivered = !!(item.fileId || item.respuestas || item.entregaId);
                const isGraded = (item.estado === 'Completada' || item.estado === 'Revisada' || item.estado === 'Rechazada');
                if (isDelivered && !isGraded) hasPending = true;
            });
            return { ...s, hasPending };
        });

        const filtered = studentsWithStatus.filter(s => s.nombre.toLowerCase().includes(search));
        currentFilteredItems = filtered;

        dashboardTableHead.innerHTML = `
            <tr>
                <th>Nombre Completo</th>
                <th>Estado de Cumplimiento</th>
                <th class="text-right">Acción</th>
            </tr>`;

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="3" class="text-center p-8 text-gray-400 italic">No hay alumnos registrados en esta sección.</td></tr>';
            return;
        }

        submissionsTableBody.innerHTML = filtered.map((s, idx) => {
            const statusHtml = s.hasPending
                ? '<span class="status-badge badge-warning">Actividad Pendiente</span>'
                : '<span class="status-badge badge-success">Sin pendientes</span>';

            return `
                <tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}">
                    <td class="p-4 font-bold text-primary">${s.nombre}</td>
                    <td class="p-4">${statusHtml}</td>
                    <td class="p-4 text-right">
                        <span class="text-primary font-bold text-xs uppercase tracking-widest">Abrir Detalles &rsaquo;</span>
                    </td>
                </tr>`;
        }).join('');
    }

    function renderDetallesAlumno(alumnoId, grado, seccion, search) {
        const fAsignatura = document.getElementById('filter-asignatura').value.toLowerCase();
        const fEstado = document.getElementById('filter-estado').value;
        const filtered = allActivityRaw.filter(i => i.alumnoId === alumnoId && i.grado === grado && i.seccion === seccion && i.titulo.toLowerCase().includes(search) && (!fAsignatura || i.asignatura.toLowerCase().includes(fAsignatura)));
        const finalFiltered = filtered.filter(item => {
            if (!fEstado) return true;
            let itemEstado = 'Pendiente';
            if (item.estado === 'Completada' || item.estado === 'Revisada') itemEstado = 'Completada';
            else if (item.estado === 'Rechazada') itemEstado = 'Rechazada';
            else if (item.fileId || item.respuestas || item.entregaId) itemEstado = 'Por calificar';
            return itemEstado === fEstado;
        });
        currentFilteredItems = finalFiltered;
        dashboardTableHead.innerHTML = `
            <tr>
                <th>Asignación / Materia</th>
                <th>Estado</th>
                <th>Recurso</th>
                <th>Nota</th>
                <th class="text-right">Acciones</th>
            </tr>`;
        if (finalFiltered.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="5" class="text-center p-8 text-gray-400 italic">No se encontraron registros de entrega para este filtro.</td></tr>'; return; }
        submissionsTableBody.innerHTML = finalFiltered.map((item, idx) => {
            let badgeClass = 'badge-info'; let statusText = 'Pendiente';
            if (item.estado === 'Completada' || item.estado === 'Revisada') { statusText = 'Completada'; badgeClass = 'badge-success'; }
            else if (item.estado === 'Rechazada') { statusText = 'Rechazada'; badgeClass = 'badge-danger'; }
            else if (item.fileId || item.respuestas || item.entregaId) { statusText = 'Por calificar'; badgeClass = 'badge-warning'; }

            let fileHtml = '<span class="text-gray-300 font-bold text-[10px]">VACÍO</span>';
            if (item.fileId) {
                const fId = extractDriveId(item.fileId);
                fileHtml = `<a href="https://drive.google.com/uc?id=${fId}" target="_blank" class="text-primary font-black hover:underline text-xs">VER ARCHIVO</a>`;
            }

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4">
                        <div class="font-bold text-gray-800">${item.titulo}</div>
                        <div class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">${item.asignatura} | ${item.tipo}</div>
                    </td>
                    <td class="p-4"><span class="status-badge ${badgeClass}">${statusText}</span></td>
                    <td class="p-4">${fileHtml}</td>
                    <td class="p-4 font-black text-primary">${item.calificacion || '-'}</td>
                    <td class="p-4 text-right">
                        <div class="flex justify-end space-x-1">
                            <button class="btn-academic btn-primary !py-1.5 !px-3 !text-[10px] grade-btn" data-index="${idx}">CALIFICAR</button>
                            <button class="btn-academic btn-secondary !py-1.5 !px-3 !text-[10px] !text-danger !border-danger/20 delete-submission-btn" data-index="${idx}">ELIMINAR</button>
                        </div>
                    </td>
                </tr>`;
        }).join('');
    }

    if (studentSearchInput) studentSearchInput.addEventListener('input', () => renderCurrentLevel());
    ['filter-grado', 'filter-seccion', 'filter-asignatura', 'filter-estado'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => renderCurrentLevel());
    });

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
                    await pushNav('Detalles', { alumnoId: item.id, alumnoNombre: item.nombre, grado: item.grado, seccion: item.seccion });
                    return;
                }

                if (current.level === 'Grados') await pushNav('Secciones', { grado: item });
                else if (current.level === 'Secciones') await pushNav('Alumnos', { grado: current.data.grado, seccion: item });
                else if (current.level === 'Alumnos') await pushNav('Detalles', { alumnoId: item.userId, alumnoNombre: item.nombre, grado: current.data.grado, seccion: current.data.seccion });
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
            const allTasks = (tasksRes.data || []).filter(t => t.grado === grado && (!t.seccion || t.seccion === seccion) && t.parcial === parcial);
            const allExams = (examsRes.data || []).filter(e => e.grado === grado && (!e.seccion || e.seccion === seccion || e.seccion === 'Todas'));
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
            if (res.status === 'success') { alert('Guardado.'); gradeModal.classList.add('hidden'); fetchTeacherActivity(); }
            else throw new Error(res.message);
        } catch (error) { alert('Error: ' + error.message); }
        finally { saveGradeBtn.classList.remove('btn-loading'); }
    };

    // --- CRUD Forms ---
    if (createAssignmentForm) createAssignmentForm.onsubmit = async (e) => {
        e.preventDefault(); const btn = e.target.querySelector('button[type="submit"]'); btn.classList.add('btn-loading');
        try {
            const res = await fetchApi('TASK', 'createTask', { ...Object.fromEntries(new FormData(e.target).entries()), profesorId: currentUser.userId });
            if (res.status === 'success') { alert('Creada.'); e.target.reset(); navDashboard.click(); }
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
        e.preventDefault(); const btn = e.target.querySelector('button[type="submit"]'); const payload = { ...Object.fromEntries(new FormData(e.target).entries()), preguntas: [], profesorId: currentUser.userId };
        questionsContainer.querySelectorAll('.question-block').forEach(block => {
            const type = block.querySelector('.question-type-select').value;
            const q = { preguntaTipo: type, textoPregunta: block.querySelector('.question-text').value, respuestaCorrecta: block.querySelector('.correct-answer').value, opciones: {} };
            const opts = block.querySelector('.question-options')?.value || '';
            if (type === 'opcion_multiple' || type === 'verdadero_falso') opts.split(',').forEach((p, i) => { const L = ['A', 'B', 'C', 'D'][i]; if (L) q.opciones[L] = p.trim(); });
            payload.preguntas.push(q);
        });
        if (payload.preguntas.length === 0) { alert('Vacío.'); return; }
        btn.classList.add('btn-loading');
        try {
            const res = await fetchApi('EXAM', 'createExam', payload);
            if (res.status === 'success') { alert('Examen creado.'); e.target.reset(); questionsContainer.innerHTML = ''; qCounter = 0; navDashboard.click(); }
            else throw new Error(res.message);
        } catch (error) { alert(error.message); } finally { btn.classList.remove('btn-loading'); }
    };

    fetchTeacherActivity();
});
