document.addEventListener('DOMContentLoaded', () => {
    let submissionsTableBody = document.getElementById('submissions-table-body');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser || currentUser.rol !== 'Profesor') {
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
    let currentSort = { field: 'fecha', direction: 'desc' };
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
        navStack.push({ level, data });
        renderCurrentLevel();
    }

    function popNav() {
        if (navStack.length > 1) {
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

            allActivityRaw = [...submissions, ...examsWithoutSubmissions];
            renderCurrentLevel();
        } catch (error) {
            submissionsTableBody.innerHTML = `<tr><td colspan="10" class="text-center p-1.5 text-red-500">Error al cargar actividad: ${error.message}</td></tr>`;
        }
    }

    function renderCurrentLevel() {
        const current = navStack[navStack.length - 1];
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

        const searchTerm = (studentSearchInput ? studentSearchInput.value : '').toLowerCase();

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

    function renderGrados(search) {
        const grados = [...new Set(allActivityRaw.map(item => item.grado).filter(g => g))];
        const filtered = grados.filter(g => g.toLowerCase().includes(search));

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-1.5 text-left font-bold text-gray-600">Grado</th>
                <th class="p-1.5 text-right font-bold text-gray-600">Acción</th>
            </tr>`;

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="2" class="text-center p-4 text-gray-500">No hay grados encontrados.</td></tr>';
            return;
        }

        submissionsTableBody.innerHTML = filtered.map(grado => `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="p-3 font-semibold text-gray-800">${grado}</td>
                <td class="p-3 text-right">
                    <button class="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold nav-btn" data-grado="${grado}">Ver Secciones</button>
                </td>
            </tr>
        `).join('');
    }

    function renderSecciones(grado, search) {
        const secciones = [...new Set(allActivityRaw.filter(i => i.grado === grado).map(i => i.seccion).filter(s => s))];
        const filtered = secciones.filter(s => s.toLowerCase().includes(search));

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-1.5 text-left font-bold text-gray-600">Sección</th>
                <th class="p-1.5 text-right font-bold text-gray-600">Acción</th>
            </tr>`;

        submissionsTableBody.innerHTML = filtered.map(seccion => `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="p-3 font-semibold text-gray-800">${seccion}</td>
                <td class="p-3 text-right">
                    <button class="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold nav-btn" data-grado="${grado}" data-seccion="${seccion}">Ver Asignaturas</button>
                </td>
            </tr>
        `).join('');
    }

    function renderAsignaturas(grado, seccion, search) {
        const asignaturas = [...new Set(allActivityRaw.filter(i => i.grado === grado && i.seccion === seccion).map(i => i.asignatura).filter(a => a))];
        const filtered = asignaturas.filter(a => a.toLowerCase().includes(search));

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-1.5 text-left font-bold text-gray-600">Asignatura</th>
                <th class="p-1.5 text-right font-bold text-gray-600">Acción</th>
            </tr>`;

        submissionsTableBody.innerHTML = filtered.map(asig => `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="p-3 font-semibold text-gray-800">${asig}</td>
                <td class="p-3 text-right space-x-2">
                    <button class="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold nav-btn" data-grado="${grado}" data-seccion="${seccion}" data-asignatura="${asig}">Ver Alumnos</button>
                    <button class="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold manage-exams-btn" data-grado="${grado}" data-seccion="${seccion}" data-asignatura="${asig}">Exámenes</button>
                </td>
            </tr>
        `).join('');
    }

    function renderAlumnos(grado, seccion, asignatura, search) {
        const showOnlyPending = onlyPendingFilter && onlyPendingFilter.checked;

        // Agrupar por alumno para ver su estado general en esta asignatura
        const alumnosMap = {};
        allActivityRaw.filter(i => i.grado === grado && i.seccion === seccion && i.asignatura === asignatura)
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
                if (item.estado === 'Pendiente' || !item.estado) {
                    alumnosMap[item.alumnoNombre].pendientes++;
                }
            });

        let alumnos = Object.values(alumnosMap);
        if (showOnlyPending) {
            alumnos = alumnos.filter(a => a.pendientes > 0);
        }
        const filtered = alumnos.filter(a => a.nombre.toLowerCase().includes(search));

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-1.5 text-left font-bold text-gray-600">Nombre del Alumno</th>
                <th class="p-1.5 text-left font-bold text-gray-600">Estado de Actividad</th>
                <th class="p-1.5 text-right font-bold text-gray-600">Acción</th>
            </tr>`;

        submissionsTableBody.innerHTML = filtered.map(a => `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="p-3 font-semibold text-gray-800">${a.nombre}</td>
                <td class="p-3">
                    <span class="px-2 py-1 rounded-full text-xs font-bold ${a.pendientes > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}">
                        ${a.pendientes > 0 ? `${a.pendientes} Pendientes` : 'Al día'}
                    </span>
                </td>
                <td class="p-3 text-right">
                    <button class="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold nav-btn" data-alumno-nombre="${a.nombre}" data-grado="${grado}" data-seccion="${seccion}" data-asignatura="${asignatura}">Ver Detalles</button>
                </td>
            </tr>
        `).join('');
    }

    function renderExamenesGestion(grado, seccion, asignatura, search) {
        const exams = allActivityRaw.filter(i =>
            i.tipo === 'Examen' &&
            !i.alumnoNombre &&
            i.gradoAsignado === grado &&
            (i.seccionAsignada === seccion || !i.seccionAsignada || i.seccionAsignada === "") &&
            i.asignatura === asignatura
        );
        const filtered = exams.filter(e => e.titulo.toLowerCase().includes(search));

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-1.5 text-left font-bold text-gray-600">Examen</th>
                <th class="p-1.5 text-left font-bold text-gray-600">Estado</th>
                <th class="p-1.5 text-right font-bold text-gray-600">Acción</th>
            </tr>`;

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="3" class="text-center p-4 text-gray-500">No hay exámenes para esta asignatura.</td></tr>';
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
                    <td class="p-3 font-semibold text-gray-800">${item.titulo}</td>
                    <td class="p-3">
                        <span class="px-2 py-1 rounded-full text-xs font-bold ${isActivo ? 'bg-green-100 text-green-700' : (isBloqueado ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}">
                            ${item.estado || 'Pendiente'}
                        </span>
                    </td>
                    <td class="p-3 text-right space-x-2">
                        <button class="${activarBtnClass} text-white px-3 py-1.5 rounded-xl text-xs font-bold activate-exam-btn" data-examen-id="${item.examenId}" ${activarBtnDisabled}>Activar</button>
                        <button class="${bloquearBtnClass} text-white px-3 py-1.5 rounded-xl text-xs font-bold lock-exam-btn" data-examen-id="${item.examenId}" ${bloquearBtnDisabled}>Bloquear</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderDetalles(alumnoNombre, grado, seccion, asignatura, search) {
        const filtered = allActivityRaw.filter(i =>
            i.alumnoNombre === alumnoNombre &&
            i.grado === grado &&
            i.seccion === seccion &&
            i.asignatura === asignatura &&
            i.titulo.toLowerCase().includes(search)
        );

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-1.5 text-left font-bold text-gray-600">Actividad</th>
                <th class="p-1.5 text-left font-bold text-gray-600">Fecha</th>
                <th class="p-1.5 text-left font-bold text-gray-600">Archivo</th>
                <th class="p-1.5 text-left font-bold text-gray-600">Calificación</th>
                <th class="p-1.5 text-left font-bold text-gray-600">Acción</th>
            </tr>`;

        submissionsTableBody.innerHTML = filtered.map(item => {
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

            let actionHtml = '';
            if (item.tipo === 'Tarea') {
                actionHtml = `<button class="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold grade-task-btn" data-item='${JSON.stringify(item)}'>Calificar</button>`;
            } else if (item.tipo === 'Examen') {
                actionHtml = `
                    <div class="flex flex-col space-y-1">
                        <button class="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold view-results-btn" data-entrega-id="${item.entregaId}">Resultados</button>
                        <button class="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold grade-exam-btn" data-item='${JSON.stringify(item)}'>Calificar</button>
                        ${item.estado === 'Bloqueado' ? `<button class="bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-bold reactivate-exam-btn" data-entrega-id="${item.entregaId}">Reactivar</button>` : ''}
                    </div>`;
            }

            return `
                <tr class="border-b hover:bg-gray-50 transition-colors">
                    <td class="p-2 font-medium text-gray-800">${item.titulo}</td>
                    <td class="p-2 text-xs text-gray-600">${item.fecha ? new Date(item.fecha).toLocaleDateString() : 'N/A'}</td>
                    <td class="p-2">${fileLinkHtml}</td>
                    <td class="p-2 font-bold text-gray-700">${item.calificacion || '-'}</td>
                    <td class="p-2">${actionHtml}</td>
                </tr>`;
        }).join('');
    }

    if (studentSearchInput) {
        studentSearchInput.addEventListener('input', () => renderCurrentLevel());
    }

    if (onlyPendingFilter) {
        onlyPendingFilter.addEventListener('change', () => renderCurrentLevel());
    }

    // --- Delegación de Eventos para la Tabla ---
    if (submissionsTableBody) {
        submissionsTableBody.addEventListener('click', async (e) => {
            const target = e.target;
            const navBtn = target.closest('.nav-btn');
            const manageExamsBtn = target.closest('.manage-exams-btn');

            // Navegación
            if (navBtn) {
                const ds = navBtn.dataset;
                const current = navStack[navStack.length - 1];
                if (current.level === 'Grados') pushNav('Secciones', { grado: ds.grado });
                else if (current.level === 'Secciones') pushNav('Asignaturas', { grado: ds.grado, seccion: ds.seccion });
                else if (current.level === 'Asignaturas') pushNav('Alumnos', { grado: ds.grado, seccion: ds.seccion, asignatura: ds.asignatura });
                else if (current.level === 'Alumnos') pushNav('Detalles', { alumnoNombre: ds.alumnoNombre, grado: ds.grado, seccion: ds.seccion, asignatura: ds.asignatura });
            } else if (manageExamsBtn) {
                const ds = manageExamsBtn.dataset;
                pushNav('Exámenes', { grado: ds.grado, seccion: ds.seccion, asignatura: ds.asignatura });
            }

            // Acciones de Tabla
            if (target.classList.contains('view-file-link')) {
                e.preventDefault();
                openLightbox(target.dataset.fileId, target.dataset.title);
            }
            if (target.classList.contains('grade-task-btn')) {
                if (saveGradeBtn) saveGradeBtn.dataset.type = 'Tarea';
                openGradeModal(JSON.parse(target.dataset.item));
            }
            if (target.classList.contains('grade-exam-btn')) {
                if (saveGradeBtn) saveGradeBtn.dataset.type = 'Examen';
                openGradeModal(JSON.parse(target.dataset.item));
            }
            if (target.classList.contains('view-results-btn')) {
                window.location.href = `results.html?entregaExamenId=${target.dataset.entregaId}`;
            }
            if (target.classList.contains('reactivate-exam-btn')) {
                const entregaId = target.dataset.entregaId;
                if (confirm("¿Reactivar este examen para este alumno?")) {
                    target.classList.add('btn-loading');
                    target.disabled = true;
                    try {
                        const result = await fetchApi('EXAM', 'reactivateExam', { entregaExamenId: entregaId });
                        if (result.status === 'success') {
                            alert('Examen reactivado.');
                            fetchTeacherActivity();
                        } else { throw new Error(result.message); }
                    } catch (error) {
                        alert(`Error: ${error.message}`);
                        target.classList.remove('btn-loading');
                        target.disabled = false;
                    }
                }
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
            if (fileId) {
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
        if (estInput) estInput.value = entrega.estado || 'Revisada';
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
                    pairs.forEach(pair => {
                        const [concept, definition] = pair.split(':').map(s => s.trim());
                        if (concept && definition) {
                            pregunta.opciones.concepts.push(concept);
                            pregunta.opciones.definitions.push(definition);
                        }
                    });
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
