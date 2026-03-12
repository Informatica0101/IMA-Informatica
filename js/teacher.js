document.addEventListener('DOMContentLoaded', () => {
    const RoleCapabilities = {
        canManage: (user) => user && user.rol === 'Profesor'
    };

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !RoleCapabilities.canManage(currentUser)) {
        window.location.href = 'login.html';
        return;
    }

    if (document.getElementById('teacher-name')) {
        document.getElementById('teacher-name').textContent = currentUser.nombre;
    }

    const submissionsTableBody = document.getElementById('submissions-table-body');
    const studentSearchInput = document.getElementById('student-search');
    const backNavBtn = document.getElementById('back-nav-btn');
    const backBtnContainer = document.getElementById('back-btn-container');
    const filtersContainer = document.getElementById('filters-container');
    const dashboardLevelTitle = document.getElementById('dashboard-level-title');
    const dashboardTableHead = document.getElementById('dashboard-table-head');

    let allActivityRaw = [];
    let currentFilteredItems = [];
    let navStack = [{ level: 'Grados', data: null }];

    // --- Elementos CRUD Tareas ---
    const createAssignmentForm = document.getElementById('create-assignment-form');
    const createExamForm = document.getElementById('create-exam-form');
    const questionsContainer = document.getElementById('questions-container');

    // --- Modals ---
    const gradeModal = document.getElementById('grade-modal');
    let gradeModalInstance = gradeModal ? new bootstrap.Modal(gradeModal) : null;

    async function fetchTeacherActivity() {
        if (!submissionsTableBody) return;
        submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>';
        try {
            const [taskSubmissions, examSubmissions] = await Promise.all([
                fetchApi('TASK', 'getTeacherActivity', { profesorId: currentUser.userId }),
                fetchApi('EXAM', 'getTeacherExamActivity', { profesorId: currentUser.userId })
            ]);
            allActivityRaw = [
                ...((taskSubmissions.data || [])).map(s => ({ ...s, tipo: 'Tarea' })),
                ...((examSubmissions.data || [])).map(s => ({ ...s, tipo: 'Examen' }))
            ];
            renderCurrentLevel();
        } catch (error) {
            submissionsTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-danger">Error: ${error.message}</td></tr>`;
        }
    }

    function renderCurrentLevel() {
        const current = navStack[navStack.length - 1];
        if (dashboardLevelTitle) dashboardLevelTitle.textContent = current.level === 'Detalles' ? `Alumno: ${current.data.alumnoNombre}` : `Nivel: ${current.level}`;

        if (backBtnContainer) backBtnContainer.classList.toggle('d-none', navStack.length <= 1);

        const searchTerm = (studentSearchInput?.value || '').trim().toLowerCase();

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

    function renderGrados(search) {
        const fGrado = document.getElementById('filter-grado')?.value;
        let grados = [...new Set(allActivityRaw.map(item => item.grado).filter(g => g))];
        if (fGrado) grados = grados.filter(g => g === fGrado);
        const filtered = grados.filter(g => g.toLowerCase().includes(search));
        currentFilteredItems = filtered;

        dashboardTableHead.innerHTML = `<tr class="table-light"><th class="ps-4">Grado Académico</th><th class="text-end pe-4">Acción</th></tr>`;
        submissionsTableBody.innerHTML = filtered.map((grado, idx) => `
            <tr class="nav-btn cursor-pointer" data-index="${idx}">
                <td class="ps-4 fw-bold text-dark">${grado}</td>
                <td class="text-end pe-4"><span class="btn btn-sm btn-outline-primary rounded-pill px-3">Explorar <i class="fas fa-chevron-right ms-1"></i></span></td>
            </tr>`).join('');
    }

    function renderSecciones(grado, search) {
        const fSeccion = document.getElementById('filter-seccion')?.value;
        let secciones = [...new Set(allActivityRaw.filter(i => i.grado === grado).map(i => i.seccion).filter(s => s))];
        if (fSeccion) secciones = secciones.filter(s => s === fSeccion);
        const filtered = secciones.filter(s => s.toLowerCase().includes(search));
        currentFilteredItems = filtered;

        dashboardTableHead.innerHTML = `<tr class="table-light"><th class="ps-4">Sección</th><th class="text-end pe-4">Acción</th></tr>`;
        submissionsTableBody.innerHTML = filtered.map((seccion, idx) => `
            <tr class="nav-btn cursor-pointer" data-index="${idx}">
                <td class="ps-4 fw-bold text-dark">Sección ${seccion}</td>
                <td class="text-end pe-4"><span class="btn btn-sm btn-outline-primary rounded-pill px-3">Ver Alumnos <i class="fas fa-users ms-1"></i></span></td>
            </tr>`).join('');
    }

    async function renderAlumnos(grado, seccion, search) {
        const current = navStack[navStack.length - 1];
        if (!current.data.students) {
            try {
                const res = await fetchApi('USER', 'getStudentsByGradoSeccion', { grado, seccion });
                current.data.students = res.data || [];
            } catch (e) { current.data.students = []; }
        }

        const filtered = current.data.students.filter(s => s.nombre.toLowerCase().includes(search));
        currentFilteredItems = filtered;

        dashboardTableHead.innerHTML = `<tr class="table-light"><th class="ps-4">Nombre Completo</th><th class="text-end pe-4">Acción</th></tr>`;
        submissionsTableBody.innerHTML = filtered.map((s, idx) => `
            <tr class="nav-btn cursor-pointer" data-index="${idx}">
                <td class="ps-4">
                    <div class="fw-bold text-primary">${s.nombre}</div>
                    <small class="text-muted">ID: ${s.userId.substring(0,8)}...</small>
                </td>
                <td class="text-end pe-4"><span class="btn btn-sm btn-ima-primary px-3">Ver Entregas</span></td>
            </tr>`).join('');
    }

    function renderDetallesAlumno(alumnoId, grado, seccion, search) {
        const fAsignatura = document.getElementById('filter-asignatura')?.value.toLowerCase();
        const filtered = allActivityRaw.filter(i => i.alumnoId === alumnoId && i.grado === grado && i.seccion === seccion && i.titulo.toLowerCase().includes(search) && (!fAsignatura || i.asignatura.toLowerCase().includes(fAsignatura)));
        currentFilteredItems = filtered;

        dashboardTableHead.innerHTML = `<tr class="table-light"><th class="ps-4">Actividad</th><th>Estado</th><th>Puntaje</th><th class="text-end pe-4">Acciones</th></tr>`;
        submissionsTableBody.innerHTML = filtered.map((item, idx) => {
            let statusBadge = 'bg-secondary'; let statusText = 'Pendiente';
            if (item.estado === 'Completada' || item.estado === 'Revisada') { statusText = 'Revisado'; statusBadge = 'bg-success'; }
            else if (item.estado === 'Rechazada') { statusText = 'Rechazado'; statusBadge = 'bg-danger'; }
            else if (item.fileId || item.respuestas || item.entregaId) { statusText = 'Por Calificar'; statusBadge = 'bg-warning text-dark'; }

            return `
                <tr>
                    <td class="ps-4">
                        <div class="fw-bold">${item.titulo}</div>
                        <div class="small text-muted">${item.asignatura} | ${item.tipo}</div>
                    </td>
                    <td><span class="badge ${statusBadge} px-2">${statusText}</span></td>
                    <td class="fw-bold text-dark">${item.calificacion || '-'}</td>
                    <td class="text-end pe-4">
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary grade-btn" data-index="${idx}">Calificar</button>
                            <button class="btn btn-sm btn-outline-danger delete-submission-btn" data-index="${idx}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        }).join('');
    }

    function pushNav(level, data) { navStack.push({ level, data }); renderCurrentLevel(); }
    if (backNavBtn) backNavBtn.onclick = () => { if (navStack.length > 1) { navStack.pop(); renderCurrentLevel(); } };

    if (submissionsTableBody) {
        submissionsTableBody.addEventListener('click', async (e) => {
            const target = e.target.closest('.grade-btn') || e.target.closest('.nav-btn') || e.target.closest('.delete-submission-btn') || e.target;

            if (target.closest('.grade-btn')) {
                const idx = target.closest('.grade-btn').dataset.index;
                openGradeModal(currentFilteredItems[idx]);
                return;
            }

            if (target.closest('.delete-submission-btn')) {
                const item = currentFilteredItems[target.closest('.delete-submission-btn').dataset.index];
                if (confirm(`¿Eliminar entrega de ${item.alumnoNombre}?`)) {
                    try {
                        const service = item.tipo === 'Tarea' ? 'TASK' : 'EXAM';
                        const action = item.tipo === 'Tarea' ? 'deleteSubmission' : 'deleteExamSubmission';
                        await fetchApi(service, action, { entregaId: item.entregaId });
                        fetchTeacherActivity();
                    } catch (e) { alert(e.message); }
                }
                return;
            }

            const navBtn = target.closest('.nav-btn');
            if (navBtn) {
                const item = currentFilteredItems[navBtn.dataset.index];
                const cur = navStack[navStack.length - 1];
                if (cur.level === 'Grados') pushNav('Secciones', { grado: item });
                else if (cur.level === 'Secciones') pushNav('Alumnos', { grado: cur.data.grado, seccion: item });
                else if (cur.level === 'Alumnos') pushNav('Detalles', { alumnoId: item.userId, alumnoNombre: item.nombre, grado: cur.data.grado, seccion: cur.data.seccion });
            }
        });
    }

    function openGradeModal(item) {
        document.getElementById('student-name-modal').textContent = item.alumnoNombre;
        document.getElementById('calificacion').value = item.calificacion || '';
        document.getElementById('estado').value = item.estado === 'Revisada' ? 'Completada' : (item.estado || 'Completada');
        document.getElementById('comentario').value = item.comentario || '';

        document.getElementById('save-grade-btn').onclick = async () => {
            const btn = document.getElementById('save-grade-btn');
            btn.classList.add('btn-loading');
            try {
                const payload = {
                    entregaId: item.entregaId,
                    calificacion: document.getElementById('calificacion').value,
                    estado: document.getElementById('estado').value,
                    comentario: document.getElementById('comentario').value
                };
                const action = item.tipo === 'Tarea' ? 'gradeSubmission' : 'gradeExamSubmission';
                const service = item.tipo === 'Tarea' ? 'TASK' : 'EXAM';
                await fetchApi(service, action, payload);
                gradeModalInstance.hide();
                fetchTeacherActivity();
            } catch (e) { alert(e.message); }
            finally { btn.classList.remove('btn-loading'); }
        };
        gradeModalInstance.show();
    }

    // --- CRUD Tareas ---
    if (createAssignmentForm) createAssignmentForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.classList.add('btn-loading');
        try {
            const fd = new FormData(e.target);
            const payload = Object.fromEntries(fd.entries());
            payload.profesorId = currentUser.userId;
            await fetchApi('TASK', 'createTask', payload);
            alert('Tarea publicada.');
            e.target.reset();
            document.getElementById('nav-dashboard').click();
        } catch (e) { alert(e.message); }
        finally { btn.classList.remove('btn-loading'); }
    };

    fetchTeacherActivity();
});
