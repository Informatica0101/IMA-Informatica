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
    const dashboardLevelTitle = document.getElementById('dashboard-level-title');
    const pendingFilterContainer = document.getElementById('pending-filter-container');
    const onlyPendingFilter = document.getElementById('only-pending-filter');
    const dashboardTableHead = document.getElementById('dashboard-table-head');

    let allActivityRaw = [];
    let currentFilteredItems = []; // Almacena los ítems renderizados actualmente para acceso seguro
    let currentSort = { field: 'fecha', direction: 'desc' };
    let studentSort = { field: 'nombre', direction: 'asc' };
    let navStack = [{ level: 'Grados', data: null }]; // Stack de navegación

    const allSections = [sectionDashboard, sectionGestion, sectionReportes, sectionCrear, sectionCrearExamen];
    const allNavLinks = [navDashboard, navGestion, navReportes, navCrear, navCrearExamen];

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

    navDashboard.addEventListener('click', () => {
        navigateTo(sectionDashboard, navDashboard);
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

    // --- Gestión de Tareas y Exámenes ---
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
                    <button class="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors" onclick="event.stopPropagation(); window.openTaskDetail(${idx})">
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

    // --- Carga de Actividad del Profesor (Dashboard de Entregas) ---
    async function fetchTeacherActivity() {
        if (!submissionsTableBody) return;
        submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-8">Cargando actividad...</td></tr>';
        try {
            const payload = {
                profesorId: currentUser.userId,
                grado: currentUser.grado,
                seccion: currentUser.seccion
            };

            const [taskSubmissions, examSubmissions] = await Promise.all([
                fetchApi('TASK', 'getTeacherActivity', payload),
                fetchApi('EXAM', 'getTeacherExamActivity', payload)
            ]);

            allActivityRaw = [
                ...((taskSubmissions.data || [])).map(s => ({ ...s, tipo: 'Tarea' })),
                ...((examSubmissions.data || [])).map(s => ({ ...s, tipo: 'Examen' }))
            ];

            renderSubmissionsTable();
        } catch (error) {
            submissionsTableBody.innerHTML = `<tr><td colspan="6" class="text-center p-8 text-red-500">Error: ${error.message}</td></tr>`;
        }
    }

    function renderSubmissionsTable() {
        if (!submissionsTableBody) return;

        const fGrado = document.getElementById('filter-grado').value;
        const fSeccion = document.getElementById('filter-seccion').value;
        const fAsignatura = document.getElementById('filter-asignatura').value.toLowerCase();
        const fEstado = document.getElementById('filter-estado').value;
        const search = studentSearchInput.value.toLowerCase();

        const filtered = allActivityRaw.filter(item => {
            const matchGrado = !fGrado || item.grado === fGrado;
            const matchSeccion = !fSeccion || item.seccion === fSeccion;
            const matchAsignatura = !fAsignatura || item.asignatura.toLowerCase().includes(fAsignatura);
            const matchSearch = !search || item.alumnoNombre.toLowerCase().includes(search);

            let itemEstado = 'Pendiente';
            if (item.estado === 'Completada' || item.estado === 'Revisada') itemEstado = 'Completada';
            else if (item.estado === 'Rechazada') itemEstado = 'Rechazada';
            else if (item.fileId || item.respuestas || item.entregaId) itemEstado = 'Por calificar';

            const matchEstado = !fEstado || itemEstado === fEstado;

            return matchGrado && matchSeccion && matchAsignatura && matchSearch && matchEstado;
        });

        currentFilteredItems = filtered;

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-8 text-gray-500">No se encontraron entregas.</td></tr>';
            return;
        }

        submissionsTableBody.innerHTML = filtered.map((item, idx) => {
            let statusClass = 'bg-gray-100 text-gray-600';
            let statusText = 'Pendiente';

            if (item.estado === 'Completada' || item.estado === 'Revisada') {
                statusText = 'Completada';
                statusClass = 'bg-green-100 text-green-700';
            } else if (item.estado === 'Rechazada') {
                statusText = 'Rechazada';
                statusClass = 'bg-red-100 text-red-700';
            } else if (item.fileId || item.respuestas || item.entregaId) {
                statusText = 'Por calificar';
                statusClass = 'bg-yellow-100 text-yellow-700';
            }

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4">
                        <div class="font-bold text-gray-800">${item.alumnoNombre}</div>
                        <div class="text-[10px] text-gray-400 uppercase">${item.asignatura}</div>
                    </td>
                    <td class="p-4">
                        <div class="font-medium text-gray-700">${item.titulo}</div>
                        <div class="text-[10px] text-blue-500 font-bold">${item.tipo}</div>
                    </td>
                    <td class="p-4 text-xs text-gray-600">${item.grado} - ${item.seccion || 'N/A'}</td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded-full text-[10px] font-bold ${statusClass}">${statusText}</span>
                    </td>
                    <td class="p-4 text-xs text-gray-500">${new Date(item.fecha).toLocaleDateString()}</td>
                    <td class="p-4 text-right">
                        <button class="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors grade-btn" data-index="${idx}">
                            Calificar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Event listeners para filtros
    ['filter-grado', 'filter-seccion', 'filter-asignatura', 'filter-estado'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', renderSubmissionsTable);
            if (id === 'filter-asignatura') {
                el.addEventListener('input', renderSubmissionsTable);
            }
        }
    });

    // --- Módulo 3: Exportación a Excel ---
    document.getElementById('export-excel-btn').addEventListener('click', async () => {
        const grado = document.getElementById('report-grado').value;
        const seccion = document.getElementById('report-seccion').value;
        const parcial = document.getElementById('report-parcial').value;
        const btn = document.getElementById('export-excel-btn');

        btn.disabled = true;
        btn.innerHTML = '<span>Generando Reporte...</span>';

        try {
            // 1. Obtener alumnos inscritos
            const studentsRes = await fetchApi('USER', 'getStudentsByGradoSeccion', { grado, seccion });
            const students = studentsRes.data || [];

            if (students.length === 0) {
                alert('No hay alumnos inscritos en este grado y sección.');
                return;
            }

            // 2. Obtener TODAS las tareas y exámenes para este profesor
            const [tasksRes, examsRes] = await Promise.all([
                fetchApi('TASK', 'getAllTasks', { profesorId: currentUser.userId }),
                fetchApi('EXAM', 'getAllExams', { profesorId: currentUser.userId })
            ]);

            const allTasks = (tasksRes.data || []).filter(t => t.grado === grado && (!t.seccion || t.seccion === seccion) && t.parcial === parcial);
            const allExams = (examsRes.data || []).filter(e => e.grado === grado && (!e.seccion || e.seccion === seccion || e.seccion === 'Todas'));

            // 3. Obtener todas las entregas para calcular puntajes
            const [taskSubRes, examSubRes] = await Promise.all([
                fetchApi('TASK', 'getTeacherActivity', { profesorId: currentUser.userId, grado, seccion }),
                fetchApi('EXAM', 'getTeacherExamActivity', { profesorId: currentUser.userId, grado, seccion })
            ]);

            const taskSubmissions = taskSubRes.data || [];
            const examSubmissions = examSubRes.data || [];

            // 4. Organizar por materia
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
                    const row = [student.userId, student.nombre];
                    let total = 0;

                    // Puntajes de tareas
                    subTasks.forEach(task => {
                        const sub = taskSubmissions.find(s => s.alumnoNombre === student.nombre && s.titulo === task.titulo);
                        const points = sub ? parseFloat(sub.calificacion || 0) : 0;
                        row.push(points);
                        total += points;
                    });

                    // Puntajes de exámenes
                    subExams.forEach(exam => {
                        const sub = examSubmissions.find(s => s.alumnoNombre === student.nombre && s.titulo === exam.titulo);
                        const points = sub ? parseFloat(sub.calificacion || 0) : 0;
                        row.push(points);
                        total += points;
                    });

                    row.push(total);
                    return row;
                });

                const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
                XLSX.utils.book_append_sheet(wb, ws, subject.substring(0, 31)); // Limitar nombre de hoja a 31 chars
            });

            // 5. Descargar archivo
            const parcialNumMap = {
                'Primer Parcial': '1',
                'Segundo Parcial': '2',
                'Tercer Parcial': '3',
                'Cuarto Parcial': '4'
            };
            const pNum = parcialNumMap[parcial] || parcial;
            const normalizedGrado = grado.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const fileName = `${normalizedGrado}_seccion_${seccion}_parcial_${pNum}.xls`;
            XLSX.writeFile(wb, fileName);

        } catch (error) {
            alert('Error al generar reporte: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span>EXPORTAR REPORTE EXCEL</span>';
        }
    });

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
        studentSearchInput.addEventListener('input', () => renderSubmissionsTable());
    }

    if (submissionsTableBody) {
        submissionsTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('grade-btn')) {
                const idx = e.target.dataset.index;
                const item = currentFilteredItems[idx];
                if (saveGradeBtn) saveGradeBtn.dataset.type = item.tipo;
                openGradeModal(item);
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
    // --- Lógica del Formulario de Crear Tarea ---
    const tipoSelect = document.getElementById('tipo');
    const creditoExtraFields = document.getElementById('credito-extra-fields');
    const tareaOriginalSelect = document.getElementById('tareaOriginalId');
    const gradoAsignadoSelect = document.getElementById('gradoAsignado');

    async function populateOriginalTasks() {
        if (!tareaOriginalSelect) return;
        const selectedGrado = gradoAsignadoSelect.value;
        if (!selectedGrado) {
            tareaOriginalSelect.innerHTML = '<option value="">Seleccione un grado primero...</option>';
            return;
        }

        tareaOriginalSelect.innerHTML = '<option value="">Cargando tareas...</option>';
        try {
            const result = await fetchApi('TASK', 'getAllTasks', { profesorId: currentUser.userId });
            if (result.status === 'success' && result.data) {
                const allTasks = result.data;
                const ecTasks = allTasks.filter(t => t.tipo === 'Credito Extra');
                const linkedOriginalIds = new Set(ecTasks.map(t => t.tareaOriginalId).filter(id => id));

                const validTasks = allTasks.filter(t =>
                    t.tipo === 'Tarea' &&
                    t.grado === selectedGrado &&
                    !linkedOriginalIds.has(t.tareaId)
                );

                if (validTasks.length === 0) {
                    tareaOriginalSelect.innerHTML = '<option value="">No hay tareas disponibles para este grado</option>';
                } else {
                    tareaOriginalSelect.innerHTML = '<option value="">Seleccione una tarea...</option>' +
                        validTasks.map(t => `<option value="${t.tareaId}">${t.titulo} (${t.asignatura})</option>`).join('');
                }
            } else {
                throw new Error(result.message || 'Error al obtener tareas');
            }
        } catch (error) {
            console.error(error);
            tareaOriginalSelect.innerHTML = '<option value="">Error al cargar tareas</option>';
        }
    }

    if (tipoSelect) {
        tipoSelect.addEventListener('change', () => {
            if (tipoSelect.value === 'Credito Extra') {
                creditoExtraFields.classList.remove('hidden');
                populateOriginalTasks();
            } else {
                creditoExtraFields.classList.add('hidden');
            }
        });
    }

    if (gradoAsignadoSelect) {
        gradoAsignadoSelect.addEventListener('change', () => {
            if (tipoSelect && tipoSelect.value === 'Credito Extra') {
                populateOriginalTasks();
            }
        });
    }

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
            let hasError = false;

            questionBlocks.forEach(block => {
                if (hasError) return;
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
                    const seenDefs = new Set();

                    for (let i = 0; i < pairs.length; i++) {
                        const [concept, definition] = pairs[i].split(':').map(s => s.trim());
                        if (concept && definition) {
                            // Tarea 2: Evitar definiciones duplicadas que rompen la lógica de emparejamiento
                            if (seenDefs.has(definition)) {
                                alert(`Error: La definición "${definition}" está duplicada. Cada concepto debe tener una definición única.`);
                                hasError = true;
                                break;
                            }
                            seenDefs.add(definition);
                            pregunta.opciones.concepts.push(concept);
                            pregunta.opciones.definitions.push(definition);
                            // Mapeamos: índice de definición (i) -> número de concepto (i + 1)
                            correctMapping[i] = (i + 1).toString();
                        }
                    }
                    pregunta.respuestaCorrecta = JSON.stringify(correctMapping);
                } else {
                    pregunta.opciones = optionsValue;
                }

                payload.preguntas.push(pregunta);
            });

            if (hasError) return;

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
