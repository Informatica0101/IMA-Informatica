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
                link.classList.remove('active', 'bg-primary', 'text-white');
                link.classList.add('bg-white', 'text-dark');
            }
        });
        navElement.classList.add('active', 'bg-primary', 'text-white');
        navElement.classList.remove('bg-white', 'text-dark');
    }

    if (navDashboard) {
        navDashboard.addEventListener('click', () => {
            navigateTo(sectionDashboard, navDashboard);
            navStack = [{ level: 'Grados', data: null }];
            fetchTeacherActivity();
        });
    }

    // Inicialización explícita
    async function initDashboard() {
        if (navDashboard && sectionDashboard) {
            navigateTo(sectionDashboard, navDashboard);
            navStack = [{ level: 'Grados', data: null }];
            // Aseguramos que el contenedor de carga se vea
            if (submissionsTableBody) {
                submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-5">Cargando actividad...</td></tr>';
            }
            await fetchTeacherActivity();
        }
    }
    if (navGestion) {
        navGestion.addEventListener('click', () => {
            navigateTo(sectionGestion, navGestion);
            fetchManagementData();
        });
    }
    if (navReportes) {
        navReportes.addEventListener('click', () => {
            navigateTo(sectionReportes, navReportes);
        });
    }
    if (navCrear) {
        navCrear.addEventListener('click', () => navigateTo(sectionCrear, navCrear));
    }
    if (navCrearExamen) {
        navCrearExamen.addEventListener('click', () => navigateTo(sectionCrearExamen, navCrearExamen));
    }

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
        tbody.innerHTML = '<tr><td colspan="5" class="text-center p-3">Cargando...</td></tr>';
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
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-3 text-danger">Error: ${error.message}</td></tr>`;
        }
    }

    function renderManagementTable() {
        const tbody = document.getElementById('tasks-management-table-body');
        tbody.innerHTML = allTasksExams.map((item, idx) => {
            const date = new Date(item.fechaLimite);
            const isOverdue = date < new Date();
            const dateClass = isOverdue ? 'text-danger fw-bold' : 'text-secondary';

            return `
            <tr class="transition-colors cursor-pointer" onclick="window.openTaskDetail(${idx})">
                <td class="fw-bold text-dark">${item.titulo}</td>
                <td class="text-primary small fw-bold">${item.asignatura}</td>
                <td class="text-muted small">${item.grado} - ${item.seccion || 'Todas'}</td>
                <td class="${dateClass} small">
                    <i class="fa-regular fa-calendar-clock me-1"></i> ${date.toLocaleDateString()}
                </td>
                <td class="text-end">
                    <button class="btn btn-light btn-sm rounded-circle shadow-sm">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');
    }

    const taskDetailsModalEl = document.getElementById('task-details-modal');
    const taskDetailsModal = (taskDetailsModalEl && typeof bootstrap !== 'undefined') ? new bootstrap.Modal(taskDetailsModalEl) : null;

    window.openTaskDetail = (idx) => {
        const item = allTasksExams[idx];
        if (!item) return;

        const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

        setText('detail-titulo', item.titulo);
        setText('detail-descripcion', item.descripcion || 'Sin descripción.');
        setText('detail-asignatura', item.asignatura);
        setText('detail-parcial', item.parcial || 'N/A');
        setText('detail-grado', item.grado);
        setText('detail-seccion', item.seccion || 'Todas');
        setText('detail-fecha', item.fechaLimite ? new Date(item.fechaLimite).toLocaleDateString() : 'N/A');
        setText('detail-puntaje', (item.puntaje || 100) + '%');

        const fileContainer = document.getElementById('detail-archivo-container');
        const fileLink = document.getElementById('detail-archivo-link');
        if (fileContainer && fileLink) {
            if (item.archivoUrl) {
                fileContainer.classList.remove('hidden');
                fileLink.href = item.archivoUrl;
            } else {
                fileContainer.classList.add('hidden');
            }
        }

        if (taskDetailsModalEl) taskDetailsModalEl.dataset.currentIndex = idx;
        if (taskDetailsModal) taskDetailsModal.show();
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
        submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-5">Cargando actividad...</td></tr>';
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
            submissionsTableBody.innerHTML = `<tr><td colspan="6" class="text-center p-5 text-danger">Error: ${error.message}</td></tr>`;
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
                <th>Alumno</th>
                <th>Grado/Secc</th>
                <th class="text-end">Acción</th>
            </tr>`;
        if (alumnosGlobal.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="3" class="text-center p-4 text-muted">No se encontraron alumnos.</td></tr>'; return; }
        submissionsTableBody.innerHTML = alumnosGlobal.map((a, idx) => `
            <tr class="nav-btn cursor-pointer" data-index="${idx}">
                <td class="fw-bold text-primary">${a.nombre}</td>
                <td class="text-muted small">${a.grado} - ${a.seccion || 'N/A'}</td>
                <td class="text-end"><span class="btn btn-sm btn-light rounded-pill px-3">Ver detalles &rsaquo;</span></td>
            </tr>`).join('');
    }

    function renderGrados(search) {
        const fGrado = document.getElementById('filter-grado').value;
        let grados = [...new Set(allActivityRaw.map(item => item.grado).filter(g => g))];
        if (fGrado) grados = grados.filter(g => g === fGrado);
        const filtered = grados.filter(g => g.toLowerCase().includes(search));
        currentFilteredItems = filtered;
        dashboardTableHead.innerHTML = `<tr><th>Grado</th><th class="text-end">Acción</th></tr>`;
        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="2" class="text-center p-5 text-muted">No hay grados registrados con actividad.</td></tr>';
            return;
        }
        submissionsTableBody.innerHTML = filtered.map((grado, idx) => `
            <tr class="nav-btn cursor-pointer" data-level="Grados" data-value="${grado}" data-index="${idx}">
                <td class="fw-bold text-dark">${grado}</td>
                <td class="text-end"><span class="btn btn-sm btn-light rounded-pill px-3">Ver Secciones &rsaquo;</span></td>
            </tr>`).join('');
    }

    function renderSecciones(grado, search) {
        const fSeccion = document.getElementById('filter-seccion').value;
        let secciones = [...new Set(allActivityRaw.filter(i => i.grado === grado).map(i => i.seccion).filter(s => s))];
        if (fSeccion) secciones = secciones.filter(s => s === fSeccion);
        const filtered = secciones.filter(s => s.toLowerCase().includes(search));
        currentFilteredItems = filtered;
        dashboardTableHead.innerHTML = `<tr><th>Sección</th><th class="text-end">Acción</th></tr>`;
        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="2" class="text-center p-5 text-muted">No hay secciones con actividad en este grado.</td></tr>';
            return;
        }
        submissionsTableBody.innerHTML = filtered.map((seccion, idx) => `
            <tr class="nav-btn cursor-pointer" data-level="Secciones" data-value="${seccion}" data-index="${idx}">
                <td class="fw-bold text-dark">${seccion}</td>
                <td class="text-end"><span class="btn btn-sm btn-light rounded-pill px-3">Ver Alumnos &rsaquo;</span></td>
            </tr>`).join('');
    }

    function renderAlumnos(grado, seccion, search) {
        const current = navStack[navStack.length - 1];
        const students = current.data.students || [];

        // Enriquecer alumnos con status de actividad
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
                <th>Nombre del Alumno</th>
                <th>Estado</th>
                <th class="text-end">Acción</th>
            </tr>`;

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="3" class="text-center p-4 text-muted">No hay alumnos inscritos en esta sección.</td></tr>';
            return;
        }

        submissionsTableBody.innerHTML = filtered.map((s, idx) => {
            const statusLabel = s.hasPending ? 'Pendiente' : 'Al día';
            const badgeClass = s.hasPending ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success';

            return `
                <tr class="nav-btn cursor-pointer" data-level="Alumnos" data-index="${idx}">
                    <td class="fw-bold text-dark">${s.nombre}</td>
                    <td><span class="badge ${badgeClass} rounded-pill px-3">${statusLabel}</span></td>
                    <td class="text-end">
                        <button class="btn btn-outline-primary btn-sm rounded-pill px-3">
                            <i class="fa-solid fa-eye me-1"></i> Ver Actividad
                        </button>
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
        dashboardTableHead.innerHTML = `<tr><th>Actividad</th><th>Estado</th><th>Detalles/Archivo</th><th>Calificación</th><th class="text-end">Acción</th></tr>`;
        if (finalFiltered.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-muted">Sin entregas registradas.</td></tr>'; return; }
        submissionsTableBody.innerHTML = finalFiltered.map((item, idx) => {
            let statusText = 'Pendiente';
            if (item.estado === 'Completada' || item.estado === 'Revisada') { statusText = 'Completada'; }
            else if (item.estado === 'Rechazada') { statusText = 'Rechazada'; }
            else if (item.fileId || item.respuestas || item.entregaId) { statusText = 'Por calificar'; }

            let detailHtml = '<span class="text-muted small">Sin archivos</span>';
            if (item.fileId) {
                const fId = extractDriveId(item.fileId);
                const isFolder = item.mimeType === 'folder';
                const driveUrl = isFolder
                    ? `https://drive.google.com/drive/folders/${fId}`
                    : `https://drive.google.com/uc?id=${fId}`;

                detailHtml = `<a href="${driveUrl}" target="_blank" class="btn btn-sm btn-link text-primary fw-bold p-0 d-block text-start">
                    <i class="fa-solid ${isFolder ? 'fa-folder-open' : 'fa-file-lines'} me-1"></i> Ver Entrega
                </a>`;
            }

            if (item.comentario) {
                detailHtml += `<div class="text-muted fst-italic small mt-1" style="line-height: 1.2; font-size: 0.7rem;" title="${item.comentario}">
                    <i class="fa-solid fa-comment-dots me-1"></i> ${item.comentario}
                </div>`;
            }

            const badgeClass = statusText === 'Completada' ? 'bg-success-subtle text-success' : (statusText === 'Por calificar' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning');

            return `
                <tr>
                    <td>
                        <div class="fw-bold text-dark">${item.titulo}</div>
                        <div class="small text-muted text-uppercase fw-bold" style="font-size: 0.7rem;">${item.asignatura} | ${item.tipo}</div>
                    </td>
                    <td><span class="badge ${badgeClass} rounded-pill px-3">${statusText}</span></td>
                    <td>${detailHtml}</td>
                    <td class="fw-bold text-primary fs-5">${item.calificacion || '-'}</td>
                    <td class="text-end">
                        <div class="d-flex justify-content-end gap-2">
                            <button class="btn btn-primary btn-sm rounded-pill px-3 grade-btn" data-index="${idx}">
                                <i class="fa-solid fa-pen-to-square"></i> Calificar
                            </button>
                            <button class="btn btn-outline-danger btn-sm rounded-circle delete-submission-btn" data-index="${idx}" style="width: 32px; height: 32px; padding: 0;">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
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

            const gradeBtn = target.closest('.grade-btn');
            if (gradeBtn) {
                const idx = gradeBtn.dataset.index;
                const item = currentFilteredItems[idx];
                if (saveGradeBtn) saveGradeBtn.dataset.type = item.tipo;
                openGradeModal(item);
                return;
            }

            const deleteSubBtn = target.closest('.delete-submission-btn');
            if (deleteSubBtn) {
                const idx = deleteSubBtn.dataset.index;
                const item = currentFilteredItems[idx];
                if (confirm(`¿Eliminar entrega de "${item.titulo}"?`)) {
                    deleteSubBtn.disabled = true;
                    try {
                        const service = item.tipo === 'Tarea' ? 'TASK' : 'EXAM';
                        const action = item.tipo === 'Tarea' ? 'deleteSubmission' : 'deleteExamSubmission';
                        const res = await fetchApi(service, action, { entregaId: item.entregaId });
                        if (res.status === 'success') {
                            alert(res.message);
                            fetchTeacherActivity();
                        } else throw new Error(res.message);
                    } catch (error) {
                        alert("Error: " + error.message);
                        deleteSubBtn.disabled = false;
                    }
                }
                return;
            }

            const navBtn = target.closest('.nav-btn');
            if (navBtn) {
                e.preventDefault();
                const idx = parseInt(navBtn.dataset.index);
                const val = navBtn.dataset.value;
                const item = currentFilteredItems[idx];
                const current = navStack[navStack.length - 1];

                if (dashboardLevelTitle && dashboardLevelTitle.textContent === "Resultados de Búsqueda Global") {
                    await pushNav('Detalles', { alumnoId: item.id, alumnoNombre: item.nombre, grado: item.grado, seccion: item.seccion });
                    return;
                }

                // Navegación Jerárquica Reforzada
                if (current.level === 'Grados') {
                    const selectedGrado = val || (typeof item === 'string' ? item : item.grado);
                    await pushNav('Secciones', { grado: selectedGrado });
                } else if (current.level === 'Secciones') {
                    const selectedSeccion = val || (typeof item === 'string' ? item : item.seccion);
                    await pushNav('Alumnos', { grado: current.data.grado, seccion: selectedSeccion });
                } else if (current.level === 'Alumnos') {
                    await pushNav('Detalles', {
                        alumnoId: item.userId || item.id,
                        alumnoNombre: item.nombre,
                        grado: current.data.grado,
                        seccion: current.data.seccion
                    });
                }
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
    const gradeModalEl = document.getElementById('grade-modal');
    const gradeModal = gradeModalEl ? new bootstrap.Modal(gradeModalEl) : null;
    const saveGradeBtn = document.getElementById('save-grade-btn');
    let currentEditingEntregaId = null;

    function openGradeModal(entrega) {
        currentEditingEntregaId = entrega.entregaId;
        document.getElementById('student-name-modal').textContent = entrega.alumnoNombre;
        const flm = document.getElementById('file-link-modal');
        if (entrega.tipo === 'Examen') {
            flm.href = `results.html?entregaExamenId=${entrega.entregaId}`;
            flm.textContent = "Ver Respuestas";
        } else if (entrega.fileId) {
            flm.href = `https://drive.google.com/uc?id=${extractDriveId(entrega.fileId)}`;
            flm.textContent = "Ver Archivo";
        } else {
            flm.href = '#';
            flm.textContent = "N/A";
        }
        document.getElementById('calificacion').value = entrega.calificacion || '';
        document.getElementById('estado').value = (entrega.estado === 'Revisada' ? 'Completada' : (entrega.estado || 'Completada'));
        document.getElementById('comentario').value = entrega.comentario || '';
        if (gradeModal) gradeModal.show();
    }

    if (saveGradeBtn) {
        saveGradeBtn.onclick = async () => {
            const type = saveGradeBtn.dataset.type;
            const payload = {
                entregaId: currentEditingEntregaId,
                calificacion: document.getElementById('calificacion').value,
                estado: document.getElementById('estado').value,
                comentario: document.getElementById('comentario').value
            };
            saveGradeBtn.classList.add('btn-loading');
            try {
                const res = await fetchApi(type === 'Tarea' ? 'TASK' : 'EXAM', type === 'Tarea' ? 'gradeSubmission' : 'gradeExamSubmission', payload);
                if (res.status === 'success') {
                    alert('Guardado.');
                    if (gradeModal) gradeModal.hide();
                    fetchTeacherActivity();
                } else throw new Error(res.message);
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                saveGradeBtn.classList.remove('btn-loading');
            }
        };
    }

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
        node.innerHTML = `<div class="question-block border p-4 rounded-3 mb-3" data-question-id="${qCounter}"><div class="d-flex justify-content-between align-items-center mb-4"><h4 class="fw-bold">Pregunta ${qCounter}</h4><button type="button" class="btn btn-sm btn-outline-danger remove-question-btn">Eliminar</button></div><div class="row g-3"><div class="col-md-6"><label class="form-label fw-medium">Tipo</label><select class="form-select question-type-select"><option value="opcion_multiple">Opción Múltiple</option><option value="verdadero_falso">Verdadero/Falso</option><option value="completacion">Completación</option></select></div><div class="col-md-12"><label class="form-label fw-medium">Texto</label><input type="text" class="form-control question-text"></div><div class="col-md-12 options-container"></div><div class="col-md-12"><label class="form-label fw-medium">Respuesta Correcta</label><input type="text" class="form-control correct-answer"></div></div></div>`;
        questionsContainer.appendChild(node);
        const ts = node.querySelector('.question-type-select'); const oc = node.querySelector('.options-container');
        const setOpts = (val) => oc.innerHTML = val === 'opcion_multiple' ? '<label class="form-label small text-muted">Opciones (separadas por coma: A,B,C)</label><input type="text" class="form-control question-options">' : (val === 'verdadero_falso' ? '<input type="text" value="Verdadero,Falso" readonly class="form-control bg-light question-options">' : '');
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

    initDashboard();
});
